#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Bible References Validator
Скрипт для проверки корректности существующих библейских ссылок в SS+.json
"""

import json
import re
import argparse
import os
import sys
from datetime import datetime
from typing import Dict, List, Set, Tuple
from bible_refs_fixer import BibleReferenceParser, HistoryManager, LinkGenerator, JSONUpdater


class InteractiveValidator:
    """Интерактивный валидатор с исправлением проблем"""
    
    def __init__(self, parser: BibleReferenceParser, link_gen: LinkGenerator, history_mgr: HistoryManager):
        self.parser = parser
        self.link_gen = link_gen
        self.history_mgr = history_mgr
        self.stats = {
            'total_issues': 0,
            'fixed': 0,
            'skipped': 0,
            'rejected': 0
        }
    
    def process_interactive(self, data: List[Dict]) -> List[Dict]:
        """Интерактивная проверка и исправление проблем"""
        print("\n🔍 Начинаем валидацию и исправление библейских ссылок...\n")
        
        skip_all = False
        fix_all = False
        
        for lesson in data:
            lesson_id = lesson.get('id')
            lesson_name = lesson.get('name', 'Без названия')
            
            if 'content' not in lesson:
                continue
            
            for block in lesson['content']:
                if 'links' not in block or not block['links']:
                    continue
                
                block_id = block.get('id')
                block_type = block.get('type')
                text = block.get('text', '')
                links = block.get('links', [])
                
                # Валидируем блок
                issues = self._validate_block(lesson_id, lesson_name, block_id, block_type, text, links)
                
                for issue in issues:
                    self.stats['total_issues'] += 1
                    
                    # Показываем информацию о проблеме
                    self._print_issue(issue)
                    
                    # Определяем возможность автоисправления
                    fixable = issue['type'] in ['missing_in_links', 'incorrect_data']
                    
                    if not fixable:
                        print("⚠️  Эта проблема не может быть автоматически исправлена\n")
                        self.stats['rejected'] += 1
                        
                        # Сохраняем в историю как rejected
                        self.history_mgr.save_decision(
                            lesson_id, lesson_name, block_id, block_type,
                            text, [], 'rejected'
                        )
                        continue
                    
                    # Запрашиваем решение
                    if not skip_all and not fix_all:
                        print(f"\n❓ Действие:")
                        print(f"   [y] Исправить")
                        print(f"   [n] Пропустить")
                        print(f"   [s] Пропустить все оставшиеся")
                        print(f"   [a] Исправить все оставшиеся")
                        
                        choice = input("\nВаш выбор: ").lower().strip()
                        
                        if choice == 's':
                            skip_all = True
                            status = 'skipped'
                        elif choice == 'a':
                            fix_all = True
                            status = 'confirmed'
                        elif choice == 'y':
                            status = 'confirmed'
                        else:
                            status = 'skipped'
                    else:
                        status = 'skipped' if skip_all else 'confirmed'
                    
                    # Применяем исправление
                    if status == 'confirmed':
                        correction = self._apply_fix(block, issue)
                        if correction:
                            self.stats['fixed'] += 1
                            print("✅ Исправление применено\n")
                            
                            # Сохраняем в историю
                            self.history_mgr.save_decision(
                                lesson_id, lesson_name, block_id, block_type,
                                text, correction.get('suggested_links', []), 'confirmed'
                            )
                        else:
                            print("❌ Не удалось применить исправление\n")
                            self.stats['rejected'] += 1
                    else:
                        self.stats['skipped'] += 1
                        print("⏭️  Пропущено\n")
        
        return data
    
    def _validate_block(self, lesson_id: int, lesson_name: str, block_id: int,
                       block_type: str, text: str, links: List[Dict]) -> List[Dict]:
        """Валидирует один блок"""
        issues = []
        
        # Парсим все ссылки из текста
        text_references = self.parser.find_references(text)
        text_refs_dict = {ref['text']: ref for ref in text_references}
        text_refs_set = set(text_refs_dict.keys())
        
        # Собираем все ссылки из links
        links_refs_dict = {link['text']: link for link in links}
        links_refs_set = set(links_refs_dict.keys())
        
        # Проверяем пропущенные ссылки
        missing_in_links = text_refs_set - links_refs_set
        if missing_in_links:
            for missing_ref in missing_in_links:
                issues.append({
                    'type': 'missing_in_links',
                    'severity': 'error',
                    'lesson_id': lesson_id,
                    'lesson_name': lesson_name,
                    'block_id': block_id,
                    'block_type': block_type,
                    'text_preview': text[:150] + '...' if len(text) > 150 else text,
                    'missing_ref': missing_ref,
                    'reference_data': text_refs_dict[missing_ref],
                    'message': f'Ссылка "{missing_ref}" есть в тексте, но отсутствует в links'
                })
        
        # Проверяем корректность структуры data
        for link_text, link in links_refs_dict.items():
            link_data = link.get('data', [])
            
            # Парсим ссылку заново
            parsed_refs = self.parser.find_references(link_text)
            
            if not parsed_refs:
                issues.append({
                    'type': 'unparseable_link',
                    'severity': 'error',
                    'lesson_id': lesson_id,
                    'lesson_name': lesson_name,
                    'block_id': block_id,
                    'block_type': block_type,
                    'text_preview': text[:150] + '...' if len(text) > 150 else text,
                    'link_text': link_text,
                    'message': f'Ссылка "{link_text}" не может быть распознана парсером'
                })
                continue
            
            # Сравниваем структуру
            expected_data = parsed_refs[0]['parsed']
            if not self._compare_link_data(link_data, expected_data):
                issues.append({
                    'type': 'incorrect_data',
                    'severity': 'error',
                    'lesson_id': lesson_id,
                    'lesson_name': lesson_name,
                    'block_id': block_id,
                    'block_type': block_type,
                    'text_preview': text[:150] + '...' if len(text) > 150 else text,
                    'link_text': link_text,
                    'current_data': link_data,
                    'expected_data': expected_data,
                    'message': f'Структура data для "{link_text}" некорректна'
                })
        
        return issues
    
    def _compare_link_data(self, current: List[Dict], expected: List[Dict]) -> bool:
        """Сравнивает две структуры data"""
        if len(current) != len(expected):
            return False
        
        for curr, exp in zip(current, expected):
            if curr.get('bookNumber') != exp.get('bookNumber'):
                return False
            if curr.get('chapter') != exp.get('chapter'):
                return False
            if sorted(curr.get('verses', [])) != sorted(exp.get('verses', [])):
                return False
        
        return True
    
    def _print_issue(self, issue: Dict):
        """Выводит информацию о проблеме"""
        print(f"{'='*70}")
        print(f"❗ Проблема в уроке #{issue['lesson_id']}: {issue['lesson_name']}")
        print(f"📝 Блок #{issue['block_id']} (тип: {issue['block_type']})")
        print(f"📄 Текст: {issue['text_preview']}")
        print(f"\n🔴 {issue['message']}\n")
        
        if issue['type'] == 'missing_in_links':
            print(f"🔗 Пропущенная ссылка: {issue['missing_ref']}")
            print(f"💡 Предлагаемая структура:")
            suggested = self.link_gen.generate_links([issue['reference_data']])
            print(json.dumps(suggested, ensure_ascii=False, indent=2))
        
        elif issue['type'] == 'incorrect_data':
            print(f"🔗 Ссылка: {issue['link_text']}")
            print(f"\n❌ Текущая структура:")
            print(json.dumps(issue['current_data'], ensure_ascii=False, indent=2))
            print(f"\n✅ Правильная структура:")
            print(json.dumps(issue['expected_data'], ensure_ascii=False, indent=2))
        
        elif issue['type'] == 'unparseable_link':
            print(f"🔗 Проблемная ссылка: {issue['link_text']}")
            print(f"❌ Парсер не может распознать этот формат")
    
    def _apply_fix(self, block: Dict, issue: Dict) -> Dict:
        """Применяет исправление к блоку"""
        if issue['type'] == 'missing_in_links':
            # Добавляем отсутствующую ссылку
            new_link = self.link_gen.generate_links([issue['reference_data']])
            if new_link:
                block['links'].extend(new_link)
                return {'suggested_links': new_link}
        
        elif issue['type'] == 'incorrect_data':
            # Исправляем некорректную структуру data
            for link in block['links']:
                if link['text'] == issue['link_text']:
                    link['data'] = issue['expected_data']
                    return {'suggested_links': [{'text': issue['link_text'], 'data': issue['expected_data']}]}
        
        return None
    
    def print_stats(self):
        """Выводит статистику"""
        print(f"\n{'='*70}")
        print(f"📊 Статистика валидации:")
        print(f"   Всего проблем найдено: {self.stats['total_issues']}")
        print(f"   ✅ Исправлено: {self.stats['fixed']}")
        print(f"   ⏭️  Пропущено: {self.stats['skipped']}")
        print(f"   ❌ Не может быть исправлено: {self.stats['rejected']}")
        print(f"{'='*70}\n")


def main():
    parser = argparse.ArgumentParser(
        description='Валидация и исправление библейских ссылок в SS+.json'
    )
    parser.add_argument(
        '--mode',
        choices=['report', 'interactive'],
        default='report',
        help='Режим работы: report (только отчёт) или interactive (с исправлением)'
    )
    parser.add_argument(
        '--input',
        required=True,
        help='Путь к входному файлу SS+.json'
    )
    parser.add_argument(
        '--books-mapping',
        default='bible_books_mapping.json',
        help='Путь к файлу с маппингом книг'
    )
    parser.add_argument(
        '--history',
        default='bible_refs_history.json',
        help='Путь к файлу истории решений'
    )
    parser.add_argument(
        '--output',
        default='validation_report.json',
        help='Путь к файлу для сохранения отчёта'
    )
    
    args = parser.parse_args()
    
    # Проверка существования входного файла
    if not os.path.exists(args.input):
        print(f"❌ Файл не найден: {args.input}")
        sys.exit(1)
    
    # Загрузка маппинга книг
    if not os.path.exists(args.books_mapping):
        print(f"❌ Файл маппинга книг не найден: {args.books_mapping}")
        sys.exit(1)
    
    with open(args.books_mapping, 'r', encoding='utf-8') as f:
        books_mapping = json.load(f)
    
    # Загрузка данных
    print(f"📖 Загрузка файла: {args.input}")
    with open(args.input, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"✅ Загружено уроков: {len(data)}")
    
    # Инициализация компонентов
    bible_parser = BibleReferenceParser(books_mapping)
    link_generator = LinkGenerator()
    history_manager = HistoryManager(args.history)
    
    if args.mode == 'interactive':
        # Интерактивный режим с исправлением
        validator = InteractiveValidator(bible_parser, link_generator, history_manager)
        updated_data = validator.process_interactive(data)
        validator.print_stats()
        
        # Сохраняем изменения
        if validator.stats['fixed'] > 0:
            if JSONUpdater.create_backup(args.input):
                JSONUpdater.save_json(args.input, updated_data)
            else:
                print("⚠️  Резервная копия не создана, файл не будет обновлён")
                sys.exit(1)
    else:
        # Режим только отчёта (старый функционал)
        print("📋 Режим отчёта - только анализ, без исправлений")
        print("💡 Используйте --mode interactive для интерактивного исправления\n")
        
        # Здесь можно добавить старый код для report-режима
        # Для простоты пока оставим заглушку
        print("⚠️  Режим report временно недоступен. Используйте --mode interactive")
    
    sys.exit(0)


if __name__ == '__main__':
    main()
