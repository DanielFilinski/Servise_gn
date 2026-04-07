#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Bible References Fixer
Скрипт для поиска и добавления пропущенных библейских ссылок в SS+.json
"""

import json
import re
import argparse
import os
import sys
from datetime import datetime
from typing import Dict, List, Tuple, Optional


class BibleReferenceParser:
    """Парсер библейских ссылок из текста"""
    
    def __init__(self, books_mapping: Dict[str, int]):
        self.books_mapping = books_mapping
        # Создаём список всех возможных сокращений книг для регулярного выражения
        book_patterns = '|'.join(re.escape(book) for book in sorted(books_mapping.keys(), key=len, reverse=True))
        
        # Паттерн для поиска библейских ссылок
        # Примеры: "Лк. 24:39", "Кол. 3:18–4:6", "1 Кор. 11:3", "Быт. 1:1"
        self.bible_ref_pattern = re.compile(
            rf'({book_patterns})\s*(\d+):(\d+)(?:[–—-](\d+))?(?:\s*;\s*(\d+):(\d+)(?:[–—-](\d+))?)*',
            re.UNICODE
        )
    
    def find_references(self, text: str) -> List[Dict]:
        """
        Находит все библейские ссылки в тексте
        Возвращает список словарей с информацией о найденных ссылках
        """
        if not text:
            return []
        
        references = []
        matches = self.bible_ref_pattern.finditer(text)
        
        for match in matches:
            ref_text = match.group(0)
            book_abbr = match.group(1)
            
            # Парсим отдельные части ссылки
            parsed = self._parse_reference_details(ref_text, book_abbr)
            if parsed:
                references.append({
                    'text': ref_text,
                    'book': book_abbr,
                    'parsed': parsed
                })
        
        return references
    
    def _parse_reference_details(self, ref_text: str, book_abbr: str) -> Optional[List[Dict]]:
        """
        Детальный парсинг одной библейской ссылки
        Возвращает список структур для поля data в links
        """
        book_number = self.books_mapping.get(book_abbr)
        if not book_number:
            return None
        
        # Удаляем название книги из текста ссылки
        ref_without_book = ref_text.replace(book_abbr, '').strip()
        
        # Паттерн для извлечения глав и стихов
        # Примеры: "24:39", "3:18–4:6", "1:1, 2; 4:9"
        parts_pattern = re.compile(r'(\d+):(\d+)(?:[–—-](\d+))?')
        
        results = []
        current_chapter = None
        verses = []
        
        for match in parts_pattern.finditer(ref_without_book):
            chapter = int(match.group(1))
            verse_start = int(match.group(2))
            verse_end = match.group(3)
            
            # Если глава изменилась и у нас есть накопленные стихи
            if current_chapter is not None and current_chapter != chapter:
                results.append({
                    'bookNumber': book_number,
                    'chapter': [current_chapter],
                    'verses': sorted(set(verses))
                })
                verses = []
            
            current_chapter = chapter
            
            if verse_end:
                # Диапазон стихов
                verses.extend(range(verse_start, int(verse_end) + 1))
            else:
                verses.append(verse_start)
        
        # Добавляем последнюю группу
        if current_chapter is not None and verses:
            results.append({
                'bookNumber': book_number,
                'chapter': [current_chapter],
                'verses': sorted(set(verses))
            })
        
        return results if results else None


class LinkGenerator:
    """Генератор структур links для JSON"""
    
    @staticmethod
    def generate_links(references: List[Dict]) -> List[Dict]:
        """
        Генерирует структуру links из списка найденных ссылок
        """
        if not references:
            return []
        
        links = []
        for ref in references:
            if ref['parsed']:
                links.append({
                    'text': ref['text'],
                    'data': ref['parsed']
                })
        
        return links


class HistoryManager:
    """Управление историей решений"""
    
    def __init__(self, history_file: str):
        self.history_file = history_file
        self.history = self._load_history()
    
    def _load_history(self) -> List[Dict]:
        """Загружает историю из файла"""
        if os.path.exists(self.history_file):
            try:
                with open(self.history_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                print(f"⚠️  Ошибка загрузки истории: {e}")
                return []
        return []
    
    def save_decision(self, lesson_id: int, lesson_name: str, block_id: int, 
                     block_type: str, text: str, suggested_links: List[Dict], 
                     status: str):
        """Сохраняет решение в историю"""
        decision = {
            'lesson_id': lesson_id,
            'lesson_name': lesson_name,
            'block_id': block_id,
            'block_type': block_type,
            'text': text[:100] + '...' if len(text) > 100 else text,
            'suggested_links': suggested_links,
            'status': status,
            'timestamp': datetime.now().isoformat()
        }
        self.history.append(decision)
        self._save_history()
    
    def _save_history(self):
        """Сохраняет историю в файл"""
        try:
            with open(self.history_file, 'w', encoding='utf-8') as f:
                json.dump(self.history, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"⚠️  Ошибка сохранения истории: {e}")
    
    def get_confirmed_decisions(self) -> List[Dict]:
        """Возвращает только подтверждённые решения"""
        return [d for d in self.history if d['status'] == 'confirmed']


class InteractiveProcessor:
    """Интерактивная обработка файла SS+.json"""
    
    def __init__(self, parser: BibleReferenceParser, link_gen: LinkGenerator, 
                 history_mgr: HistoryManager):
        self.parser = parser
        self.link_gen = link_gen
        self.history_mgr = history_mgr
        self.stats = {
            'total_blocks': 0,
            'missing_links': 0,
            'confirmed': 0,
            'rejected': 0,
            'skipped': 0
        }
    
    def process_interactive(self, data: List[Dict]) -> List[Dict]:
        """Интерактивная обработка всех уроков"""
        print("\n🔍 Начинаем поиск пропущенных библейских ссылок...\n")
        
        skip_all = False
        apply_all = False
        
        for lesson in data:
            lesson_id = lesson.get('id')
            lesson_name = lesson.get('name', 'Без названия')
            
            if 'content' not in lesson:
                continue
            
            for block in lesson['content']:
                self.stats['total_blocks'] += 1
                block_id = block.get('id')
                block_type = block.get('type')
                text = block.get('text', '')
                
                # Пропускаем блоки, в которых уже есть links
                if 'links' in block and block['links']:
                    continue
                
                # Ищем библейские ссылки в тексте
                references = self.parser.find_references(text)
                
                if not references:
                    continue
                
                self.stats['missing_links'] += 1
                
                # Генерируем структуру links
                suggested_links = self.link_gen.generate_links(references)
                
                # Показываем информацию пользователю
                print(f"{'='*70}")
                print(f"📖 Урок #{lesson_id}: {lesson_name}")
                print(f"📝 Блок #{block_id} (тип: {block_type})")
                print(f"📄 Текст: {text[:150]}{'...' if len(text) > 150 else ''}")
                print(f"\n🔗 Найденные ссылки:")
                for ref in references:
                    print(f"   • {ref['text']}")
                print(f"\n💡 Предлагаемая структура links:")
                print(json.dumps(suggested_links, ensure_ascii=False, indent=2))
                
                # Запрашиваем решение
                if not skip_all and not apply_all:
                    print(f"\n❓ Действие:")
                    print(f"   [y] Подтвердить и добавить")
                    print(f"   [n] Отклонить")
                    print(f"   [s] Пропустить все оставшиеся")
                    print(f"   [a] Применить ко всем оставшимся")
                    
                    choice = input("\nВаш выбор: ").lower().strip()
                    
                    if choice == 's':
                        skip_all = True
                        status = 'skipped'
                    elif choice == 'a':
                        apply_all = True
                        status = 'confirmed'
                    elif choice == 'y':
                        status = 'confirmed'
                    else:
                        status = 'rejected'
                else:
                    status = 'skipped' if skip_all else 'confirmed'
                
                # Обновляем статистику
                if status == 'confirmed':
                    self.stats['confirmed'] += 1
                    block['links'] = suggested_links
                    print("✅ Изменение применено\n")
                elif status == 'rejected':
                    self.stats['rejected'] += 1
                    print("❌ Изменение отклонено\n")
                else:
                    self.stats['skipped'] += 1
                    print("⏭️  Пропущено\n")
                
                # Сохраняем в историю
                self.history_mgr.save_decision(
                    lesson_id, lesson_name, block_id, block_type,
                    text, suggested_links, status
                )
        
        return data
    
    def print_stats(self):
        """Выводит статистику обработки"""
        print(f"\n{'='*70}")
        print(f"📊 Статистика обработки:")
        print(f"   Всего блоков: {self.stats['total_blocks']}")
        print(f"   Найдено пропущенных ссылок: {self.stats['missing_links']}")
        print(f"   ✅ Подтверждено: {self.stats['confirmed']}")
        print(f"   ❌ Отклонено: {self.stats['rejected']}")
        print(f"   ⏭️  Пропущено: {self.stats['skipped']}")
        print(f"{'='*70}\n")


class JSONUpdater:
    """Обновление и сохранение JSON файла"""
    
    @staticmethod
    def create_backup(file_path: str):
        """Создаёт резервную копию файла"""
        # Определяем директорию скрипта
        script_dir = os.path.dirname(os.path.abspath(__file__))
        backup_dir = os.path.join(script_dir, 'backups')
        
        # Создаём директорию для бэкапов, если её нет
        os.makedirs(backup_dir, exist_ok=True)
        
        # Получаем имя файла без пути
        file_name = os.path.basename(file_path)
        backup_filename = f"{file_name}.backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        backup_path = os.path.join(backup_dir, backup_filename)
        
        try:
            with open(file_path, 'r', encoding='utf-8') as src:
                with open(backup_path, 'w', encoding='utf-8') as dst:
                    dst.write(src.read())
            print(f"💾 Создана резервная копия: {backup_path}")
            return backup_path
        except Exception as e:
            print(f"⚠️  Ошибка создания резервной копии: {e}")
            return None
    
    @staticmethod
    def save_json(file_path: str, data: List[Dict]):
        """Сохраняет данные в JSON файл"""
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"✅ Файл успешно обновлён: {file_path}")
            return True
        except Exception as e:
            print(f"❌ Ошибка сохранения файла: {e}")
            return False


def apply_auto_mode(data: List[Dict], parser: BibleReferenceParser, 
                   link_gen: LinkGenerator, history_mgr: HistoryManager) -> List[Dict]:
    """Автоматическое применение подтверждённых изменений из истории"""
    print("\n🤖 Автоматическое применение сохранённых изменений...\n")
    
    confirmed = history_mgr.get_confirmed_decisions()
    applied_count = 0
    
    for decision in confirmed:
        lesson_id = decision['lesson_id']
        block_id = decision['block_id']
        suggested_links = decision['suggested_links']
        
        # Находим соответствующий блок в данных
        for lesson in data:
            if lesson.get('id') == lesson_id:
                if 'content' in lesson:
                    for block in lesson['content']:
                        if block.get('id') == block_id:
                            # Проверяем, что links ещё нет
                            if 'links' not in block or not block['links']:
                                block['links'] = suggested_links
                                applied_count += 1
                                print(f"✅ Применено к уроку #{lesson_id}, блок #{block_id}")
    
    print(f"\n📊 Применено изменений: {applied_count} из {len(confirmed)}\n")
    return data


def main():
    parser = argparse.ArgumentParser(
        description='Поиск и исправление пропущенных библейских ссылок в SS+.json'
    )
    parser.add_argument(
        '--mode',
        choices=['interactive', 'auto'],
        default='interactive',
        help='Режим работы: interactive (интерактивный) или auto (автоматический)'
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
    
    # Обработка в зависимости от режима
    if args.mode == 'interactive':
        processor = InteractiveProcessor(bible_parser, link_generator, history_manager)
        updated_data = processor.process_interactive(data)
        processor.print_stats()
    else:
        updated_data = apply_auto_mode(data, bible_parser, link_generator, history_manager)
    
    # Создание резервной копии и сохранение
    if JSONUpdater.create_backup(args.input):
        JSONUpdater.save_json(args.input, updated_data)
    else:
        print("⚠️  Резервная копия не создана, файл не будет обновлён")
        sys.exit(1)


if __name__ == '__main__':
    main()
