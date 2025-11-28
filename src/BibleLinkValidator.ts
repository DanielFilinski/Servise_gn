import fs from 'fs';

// Интерфейсы для типизации
interface BibleLink {
    bookName: string;
    chapter: string[];
    verses: string | null;
}

interface TextElement {
    isLink: boolean;
    text: string;
}

interface ContentItem {
    style: string;
    text: TextElement[];
}

interface LessonDay {
    lessonNumber: string;
    lessonName: string;
    isFirstLesson: boolean;
    arrEl: ContentItem[];
}

interface BibleLinkIssue {
    lessonNumber: string;
    date: string;
    elementIndex: number;
    textIndex: number;
    issue: string;
    originalText: string;
    suggestedFix?: string;
}

interface Correction {
    from: string;
    to: string;
    autoApply: boolean;
}

interface CorrectionsData {
    corrections: { [key: string]: Correction };
    patterns: { [key: string]: string };
}

const CORRECTIONS_FILE = './bibleLinksCorrections.json';

// Паттерны для определения библейских ссылок
const BIBLE_BOOKS = ["Быт", "Исх", "Лев", "Числ", "Втор", "Нав", "Суд", "Руф", "1 Цар", "2 Цар", "3 Цар", "4 Цар", "1 Пар", "2 Пар", "Ездр", "Неем", "Есф", "Иов", "Пс", "Притч", "Еккл", "Песн", "Ис", "Иер", "Плач", "Иез", "Дан", "Ос", "Иоил", "Амос", "Авд", "Ион", "Мих", "Наум", "Авв", "Соф", "Агг", "Зах", "Мал", "Мф", "Мк", "Лк", "Ин", "Деян", "Иак", "1 Петр", "2 Петр", "1 Ин", "2 Ин", "3 Ин", "Иуд", "Рим", "1 Кор", "2 Кор", "Гал", "Еф", "Флп", "Кол", "1 Фес", "2 Фес", "1 Тим", "2 Тим", "Тит", "Флм", "Евр", "Откр"];

// Загрузка сохраненных исправлений
function loadCorrections(): CorrectionsData {
    try {
        if (fs.existsSync(CORRECTIONS_FILE)) {
            const data = fs.readFileSync(CORRECTIONS_FILE, 'utf-8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.warn('Не удалось загрузить файл исправлений:', error);
    }
    return { corrections: {}, patterns: {} };
}

// Сохранение исправлений
function saveCorrections(data: CorrectionsData): void {
    try {
        fs.writeFileSync(CORRECTIONS_FILE, JSON.stringify(data, null, 2), 'utf-8');
        console.log('✓ Исправления сохранены в', CORRECTIONS_FILE);
    } catch (error) {
        console.error('Ошибка при сохранении исправлений:', error);
    }
}

// Проверка, является ли текст библейской ссылкой
function looksLikeBibleReference(text: string): boolean {
    // Ищем паттерны типа "Книга. глава:стихи"
    const biblePattern = new RegExp(`(\\d\\s?)?(${BIBLE_BOOKS.join('|')})\\.\\s*\\d`, 'i');
    return biblePattern.test(text);
}

// Извлечение всех потенциальных ссылок из текста
function extractPotentialReferences(text: string): string[] {
    const references: string[] = [];
    const bookPattern = `(\\d\\s?)?(${BIBLE_BOOKS.join('|')})`;
    const regex = new RegExp(`${bookPattern}\\.\\s*[\\d\\s:,;–-]+`, 'gi');
    
    const matches = text.match(regex);
    if (matches) {
        references.push(...matches);
    }
    
    return references;
}

// Валидация распознанной ссылки
function validateParsedLink(linkText: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    try {
        const data = JSON.parse(linkText);
        
        if (!Array.isArray(data)) {
            errors.push('Ссылка не является массивом');
            return { isValid: false, errors };
        }
        
        if (data.length < 2) {
            errors.push('Ссылка не содержит объектов с данными');
            return { isValid: false, errors };
        }
        
        const originalText = data[0];
        if (typeof originalText !== 'string') {
            errors.push('Первый элемент не является строкой');
        }
        
        // Проверка каждой ссылки
        for (let i = 1; i < data.length; i++) {
            const link = data[i];
            
            if (!link.bookName) {
                errors.push(`Ссылка ${i}: отсутствует название книги`);
            } else if (BIBLE_BOOKS.indexOf(link.bookName) === -1) {
                errors.push(`Ссылка ${i}: неизвестное название книги "${link.bookName}"`);
            }
            
            if (!link.chapter || !Array.isArray(link.chapter) || link.chapter.length === 0) {
                errors.push(`Ссылка ${i}: отсутствует или некорректная глава`);
            }
            
            // Проверка на корректность чисел в главах и стихах
            if (link.chapter) {
                link.chapter.forEach((ch: string, idx: number) => {
                    if (!/^\d+$/.test(ch)) {
                        errors.push(`Ссылка ${i}, глава ${idx}: "${ch}" не является числом`);
                    }
                });
            }
        }
        
        return { isValid: errors.length === 0, errors };
    } catch (error: any) {
        errors.push(`Ошибка парсинга JSON: ${error?.message || 'Неизвестная ошибка'}`);
        return { isValid: false, errors };
    }
}

// Вывод информации о проблеме
function displayIssue(
    issue: BibleLinkIssue, 
    issueNumber: number,
    totalIssues: number
): void {
    console.log('\n' + '='.repeat(80));
    console.log(`❌ ПРОБЛЕМА ${issueNumber} из ${totalIssues}`);
    console.log('='.repeat(80));
    console.log(`📍 Урок: ${issue.lessonNumber}`);
    console.log(`📅 Дата: ${issue.date}`);
    console.log(`📝 Проблема: ${issue.issue}`);
    console.log(`📄 Оригинальный текст: "${issue.originalText}"`);
    
    if (issue.suggestedFix) {
        console.log(`💡 Предложенное исправление: "${issue.suggestedFix}"`);
    }
    
    // Поиск потенциальных ссылок в тексте
    const potentialRefs = extractPotentialReferences(issue.originalText);
    if (potentialRefs.length > 0) {
        console.log(`\n🔍 Найденные потенциальные ссылки:`);
        potentialRefs.forEach((ref, idx) => {
            console.log(`   ${idx + 1}. ${ref}`);
        });
    }
    
    console.log('='.repeat(80));
}

// Основная функция валидации
export function validateBibleLinks(partition: { [key: string]: { [key: string]: LessonDay } }): void {
    console.log('\n' + '='.repeat(80));
    console.log('🔍 НАЧАЛО ПРОВЕРКИ БИБЛЕЙСКИХ ССЫЛОК');
    console.log('='.repeat(80) + '\n');
    
    const corrections = loadCorrections();
    const issues: BibleLinkIssue[] = [];
    let totalLinks = 0;
    let invalidLinks = 0;
    let missingLinks = 0;
    let autoFixedLinks = 0;
    
    // Перебор всех уроков
    for (const lessonNumber of Object.keys(partition)) {
        const lesson = partition[lessonNumber];
        
        for (const date of Object.keys(lesson)) {
            const day = lesson[date];
            
            // Перебор всех элементов контента
            for (let elIndex = 0; elIndex < day.arrEl.length; elIndex++) {
                const element = day.arrEl[elIndex];
                
                // Перебор всех текстовых элементов
                for (let textIndex = 0; textIndex < element.text.length; textIndex++) {
                    const textItem = element.text[textIndex];
                    
                    if (textItem.isLink) {
                        totalLinks++;
                        
                        // Проверка на автоматическое исправление
                        const correctionKey = textItem.text;
                        if (corrections.corrections[correctionKey]?.autoApply) {
                            textItem.text = corrections.corrections[correctionKey].to;
                            autoFixedLinks++;
                            console.log(`🔄 Автоматически исправлено: "${correctionKey.substring(0, 50)}..."`);
                            continue;
                        }
                        
                        // Валидация распознанной ссылки
                        const validation = validateParsedLink(textItem.text);
                        
                        if (!validation.isValid) {
                            invalidLinks++;
                            issues.push({
                                lessonNumber,
                                date,
                                elementIndex: elIndex,
                                textIndex,
                                issue: validation.errors.join('; '),
                                originalText: textItem.text
                            });
                        }
                    } else {
                        // Проверка на автоматическое исправление для обычного текста
                        const correctionKey = textItem.text;
                        if (corrections.corrections[correctionKey]?.autoApply) {
                            // Если есть автоисправление для этого текста, применяем его
                            textItem.text = corrections.corrections[correctionKey].to;
                            textItem.isLink = true; // Помечаем как ссылку, если было исправление
                            autoFixedLinks++;
                            console.log(`🔄 Автоматически исправлено (текст -> ссылка): "${correctionKey.substring(0, 50)}..."`);
                            continue;
                        }
                        
                        // Проверка на потенциальные непарсированные ссылки
                        if (looksLikeBibleReference(textItem.text)) {
                            missingLinks++;
                            issues.push({
                                lessonNumber,
                                date,
                                elementIndex: elIndex,
                                textIndex,
                                issue: 'Потенциальная библейская ссылка не распознана',
                                originalText: textItem.text
                            });
                        }
                    }
                }
            }
        }
    }
    
    // Вывод статистики
    console.log('\n📊 СТАТИСТИКА ПРОВЕРКИ:');
    console.log(`   Всего ссылок: ${totalLinks}`);
    console.log(`   Автоматически исправлено: ${autoFixedLinks}`);
    console.log(`   Некорректных ссылок: ${invalidLinks}`);
    console.log(`   Пропущенных ссылок: ${missingLinks}`);
    console.log(`   Всего проблем требующих внимания: ${issues.length}\n`);
    
    if (issues.length === 0) {
        console.log('✅ Проблем не найдено! Все ссылки корректны.\n');
        return;
    }
    
    // Вывод всех проблем
    console.log('📋 СПИСОК ОБНАРУЖЕННЫХ ПРОБЛЕМ:\n');
    issues.forEach((issue, index) => {
        displayIssue(issue, index + 1, issues.length);
    });
    
    // Финальная статистика
    console.log('\n' + '='.repeat(80));
    console.log('📈 ИТОГОВАЯ СТАТИСТИКА:');
    console.log('='.repeat(80));
    console.log(`   Всего обработано ссылок: ${totalLinks}`);
    console.log(`   Автоматически исправлено: ${autoFixedLinks}`);
    console.log(`   Требует ручной проверки: ${issues.length}`);
    console.log(`   Сохранено автоисправлений: ${Object.keys(corrections.corrections).length}`);
    console.log('='.repeat(80));
    
    console.log('\n💡 ИНСТРУКЦИЯ ПО ИСПРАВЛЕНИЮ:');
    console.log('   1. Просмотрите список проблем выше');
    console.log('   2. Отредактируйте файл bibleLinksCorrections.json');
    console.log('   3. Добавьте исправления в формате:');
    console.log('      "corrections": {');
    console.log('        "исходный_текст": {');
    console.log('          "from": "исходный_текст",');
    console.log('          "to": "исправленный_текст",');
    console.log('          "autoApply": true');
    console.log('        }');
    console.log('      }');
    console.log('   4. Запустите парсер снова для применения исправлений\n');
}
