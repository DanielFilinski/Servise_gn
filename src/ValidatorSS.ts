import fs from 'fs';

// Объявление для process.argv
declare const process: { argv: string[] };

// ==================== ТИПЫ ====================

interface BibleLink {
    text: string;
    data: {
        bookNumber: number;
        chapter: number[];
        verses: number[] | null;
    }[];
}

interface ContentItem {
    id: number;
    type: string;
    text: string;
    links?: BibleLink[];
}

interface LessonDay {
    id: number;
    date: string;
    name: string;
    bookNumber: number;
    lessonNumber: number;
    isFirstLesson?: boolean;
    content: ContentItem[];
}

interface IssueInfo {
    lessonId: number;
    date: string;
    lessonName: string;
    lessonNumber: number;
    contentId: number;
    contentType: string;
}

interface Correction {
    from: string;
    info: IssueInfo;
    links: BibleLink[];
    autoApply: boolean;
    ignore?: boolean; // если true — пропускать в будущих validate (ложное срабатывание)
}

interface CorrectionsData {
    corrections: Correction[];
}

interface ValidationIssue {
    info: IssueInfo;
    issueType: 'missing_link' | 'invalid_link' | 'malformed_link';
    description: string;
    originalText: string;
    currentLinks?: BibleLink[];
    potentialLinks?: string[];
}

// ==================== КОНСТАНТЫ ====================

const CORRECTIONS_FILE = './bibleLinksCorrections.json';
const INPUT_FILE = './ResultParse/SS/SS+.json';
const OUTPUT_FILE = './ResultParse/SS/SS-valid.json';

const BIBLE_BOOKS = [
    "Быт", "Исх", "Лев", "Числ", "Втор", "Нав", "Суд", "Руф", 
    "1 Цар", "2 Цар", "3 Цар", "4 Цар", "1 Пар", "2 Пар", 
    "Ездр", "Неем", "Есф", "Иов", "Пс", "Притч", "Еккл", "Песн", 
    "Ис", "Иер", "Плач", "Иез", "Дан", "Ос", "Иоил", "Амос", 
    "Авд", "Ион", "Мих", "Наум", "Авв", "Соф", "Агг", "Зах", "Мал", 
    "Мф", "Мк", "Лк", "Ин", "Деян", "Иак", 
    "1 Петр", "2 Петр", "1 Ин", "2 Ин", "3 Ин", "Иуд", 
    "Рим", "1 Кор", "2 Кор", "Гал", "Еф", "Флп", "Кол", 
    "1 Фес", "2 Фес", "1 Тим", "2 Тим", "Тит", "Флм", "Евр", "Откр"
];

const BOOK_NUMBERS: { [key: number]: string } = {
    10: "Быт", 20: "Исх", 30: "Лев", 40: "Числ", 50: "Втор", 60: "Нав",
    70: "Суд", 80: "Руф", 90: "1 Цар", 100: "2 Цар", 110: "3 Цар", 120: "4 Цар",
    130: "1 Пар", 140: "2 Пар", 150: "Ездр", 160: "Неем", 190: "Есф", 220: "Иов",
    230: "Пс", 240: "Притч", 250: "Еккл", 260: "Песн", 290: "Ис", 300: "Иер",
    310: "Плач", 330: "Иез", 340: "Дан", 350: "Ос", 360: "Иоил", 370: "Амос",
    380: "Авд", 390: "Ион", 400: "Мих", 410: "Наум", 420: "Авв", 430: "Соф",
    440: "Агг", 450: "Зах", 460: "Мал", 470: "Мф", 480: "Мк", 490: "Лк",
    500: "Ин", 510: "Деян", 660: "Иак", 670: "1 Петр", 680: "2 Петр",
    690: "1 Ин", 700: "2 Ин", 710: "3 Ин", 720: "Иуд", 520: "Рим",
    530: "1 Кор", 540: "2 Кор", 550: "Гал", 560: "Еф", 570: "Флп",
    580: "Кол", 590: "1 Фес", 600: "2 Фес", 610: "1 Тим", 620: "2 Тим",
    630: "Тит", 640: "Флм", 650: "Евр", 730: "Откр"
};

// ==================== УТИЛИТЫ ====================

function loadCorrections(): CorrectionsData {
    try {
        if (fs.existsSync(CORRECTIONS_FILE)) {
            const data = fs.readFileSync(CORRECTIONS_FILE, 'utf-8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.warn('⚠️  Не удалось загрузить файл исправлений:', error);
    }
    return { corrections: [] };
}

function saveCorrections(data: CorrectionsData): void {
    try {
        fs.writeFileSync(CORRECTIONS_FILE, JSON.stringify(data, null, 2), 'utf-8');
        console.log('✅ Исправления сохранены в', CORRECTIONS_FILE);
    } catch (error) {
        console.error('❌ Ошибка при сохранении исправлений:', error);
    }
}

function loadLessons(): LessonDay[] {
    try {
        const data = fs.readFileSync(INPUT_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error: any) {
        console.error('❌ Ошибка при чтении файла SS+.json:', error?.message || error);
        return [];
    }
}

function saveLessons(lessons: LessonDay[]): void {
    try {
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(lessons, null, 2), 'utf-8');
        console.log('✅ Результат сохранен в', OUTPUT_FILE);
    } catch (error) {
        console.error('❌ Ошибка при сохранении результата:', error);
    }
}

// ==================== ПРОВЕРКИ ====================

function looksLikeBibleReference(text: string): boolean {
    const biblePattern = new RegExp(`(\\d\\s?)?(${BIBLE_BOOKS.join('|')})\\.\\s*\\d`, 'i');
    return biblePattern.test(text);
}

function extractPotentialReferences(text: string): string[] {
    const references: string[] = [];
    // Сортировка по убыванию длины: "1 Ин" встаёт перед "Ин" — исключает ложные под-матчи
    const sortedBooks = [...BIBLE_BOOKS].sort((a, b) => b.length - a.length);
    // Negative lookbehind: не матчить если книга — часть слова (напр. "Капернаум" → "Наум")
    const regex = new RegExp(
        `(?<![а-яА-Яa-zA-Z])(${sortedBooks.join('|')})\\.\\s*[\\d\\s:,;–-]+`,
        'gi'
    );
    const matches = text.match(regex);
    if (matches) {
        references.push(...matches);
    }
    return references;
}

function validateBibleLink(link: BibleLink): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!link.text || link.text.trim() === '') {
        errors.push('Пустой текст ссылки');
    }
    
    if (!link.data || !Array.isArray(link.data) || link.data.length === 0) {
        errors.push('Отсутствуют данные ссылки');
        return { isValid: false, errors };
    }
    
    link.data.forEach((item, idx) => {
        if (!item.bookNumber || typeof item.bookNumber !== 'number') {
            errors.push(`Ссылка ${idx + 1}: некорректный номер книги`);
        } else if (!BOOK_NUMBERS[item.bookNumber]) {
            errors.push(`Ссылка ${idx + 1}: неизвестный номер книги ${item.bookNumber}`);
        }
        
        if (!item.chapter || !Array.isArray(item.chapter) || item.chapter.length === 0) {
            errors.push(`Ссылка ${idx + 1}: отсутствует глава`);
        } else {
            item.chapter.forEach((ch, chIdx) => {
                if (typeof ch !== 'number' || ch < 1) {
                    errors.push(`Ссылка ${idx + 1}, глава ${chIdx + 1}: некорректное значение ${ch}`);
                }
            });
        }
        
        if (item.verses !== null) {
            if (!Array.isArray(item.verses)) {
                errors.push(`Ссылка ${idx + 1}: стихи должны быть массивом или null`);
            } else {
                item.verses.forEach((v, vIdx) => {
                    if (typeof v !== 'number' || v < 1) {
                        errors.push(`Ссылка ${idx + 1}, стих ${vIdx + 1}: некорректное значение ${v}`);
                    }
                });
            }
        }
    });
    
    return { isValid: errors.length === 0, errors };
}

// ==================== ВАЛИДАЦИЯ ====================

function validateLessons(lessons: LessonDay[], applyCorrections: boolean = true): {
    issues: ValidationIssue[];
    stats: {
        totalLessons: number;
        totalContent: number;
        totalLinks: number;
        invalidLinks: number;
        missingLinks: number;
        autoFixed: number;
    };
} {
    const corrections = loadCorrections();
    const issues: ValidationIssue[] = [];
    
    const stats = {
        totalLessons: lessons.length,
        totalContent: 0,
        totalLinks: 0,
        invalidLinks: 0,
        missingLinks: 0,
        autoFixed: 0
    };
    
    for (const lesson of lessons) {
        for (const content of lesson.content) {
            stats.totalContent++;
            
            const info: IssueInfo = {
                lessonId: lesson.id,
                date: lesson.date,
                lessonName: lesson.name,
                lessonNumber: lesson.lessonNumber,
                contentId: content.id,
                contentType: content.type
            };
            
            // Проверка на игнорируемые позиции (ложные срабатывания, помеченные вручную)
            const isIgnored = corrections.corrections.some(c =>
                c.ignore === true && c.from === content.text
            );
            if (isIgnored) continue;

            // Проверка на автоисправления (только если включено)
            if (applyCorrections) {
                // Сначала точное совпадение по ID + тексту
                let correction = corrections.corrections.find(c =>
                    c.autoApply &&
                    c.from === content.text &&
                    c.info.lessonId === lesson.id &&
                    c.info.contentId === content.id
                );
                // Fallback: только по тексту (IDs могли смениться после повторного парсинга)
                if (!correction) {
                    correction = corrections.corrections.find(c =>
                        c.autoApply && c.from === content.text
                    );
                }

                if (correction) {
                    content.links = correction.links;
                    stats.autoFixed++;
                    console.log(`🔄 Автоисправление: Урок ${lesson.lessonNumber}, Content ID ${content.id}`);
                    continue;
                }
            }
            
            // Проверка существующих ссылок
            if (content.links && content.links.length > 0) {
                stats.totalLinks += content.links.length;
                
                for (const link of content.links) {
                    const validation = validateBibleLink(link);
                    
                    if (!validation.isValid) {
                        stats.invalidLinks++;
                        issues.push({
                            info,
                            issueType: 'invalid_link',
                            description: validation.errors.join('; '),
                            originalText: content.text,
                            currentLinks: content.links
                        });
                    }
                }
            }
            
            // Проверка на потенциальные непарсированные ссылки
            const potentialRefs = extractPotentialReferences(content.text);
            if (potentialRefs.length > 0) {
                // Проверяем, все ли потенциальные ссылки распознаны
                const recognizedTexts = (content.links || []).map(l => l.text);
                const unrecognized = potentialRefs.filter(ref => 
                    !recognizedTexts.some(rt => content.text.includes(rt) && ref.includes(rt))
                );
                
                if (unrecognized.length > 0) {
                    stats.missingLinks++;
                    issues.push({
                        info,
                        issueType: 'missing_link',
                        description: 'Потенциальные библейские ссылки не распознаны',
                        originalText: content.text,
                        currentLinks: content.links,
                        potentialLinks: unrecognized
                    });
                }
            }
        }
    }
    
    return { issues, stats };
}

// ==================== ОТЧЕТЫ ====================

function displayIssue(issue: ValidationIssue, index: number, total: number): void {
    console.log('\n' + '='.repeat(80));
    console.log(`❌ ПРОБЛЕМА ${index + 1} из ${total}`);
    console.log('='.repeat(80));
    console.log(`📍 Урок ${issue.info.lessonNumber}: ${issue.info.lessonName}`);
    console.log(`📅 Дата: ${issue.info.date}`);
    console.log(`🆔 Lesson ID: ${issue.info.lessonId}, Content ID: ${issue.info.contentId}`);
    console.log(`📝 Тип контента: ${issue.info.contentType}`);
    console.log(`🔴 Тип проблемы: ${issue.issueType === 'missing_link' ? 'Пропущенная ссылка' : 'Некорректная ссылка'}`);
    console.log(`📄 Описание: ${issue.description}`);
    console.log(`\n📖 Текст (первые 200 символов):`);
    console.log(`   "${issue.originalText.substring(0, 200)}${issue.originalText.length > 200 ? '...' : ''}"`);
    
    if (issue.potentialLinks && issue.potentialLinks.length > 0) {
        console.log(`\n🔍 Найденные потенциальные ссылки:`);
        issue.potentialLinks.forEach((ref, idx) => {
            console.log(`   ${idx + 1}. ${ref}`);
        });
    }
    
    if (issue.currentLinks && issue.currentLinks.length > 0) {
        console.log(`\n📎 Текущие ссылки:`);
        issue.currentLinks.forEach((link, idx) => {
            console.log(`   ${idx + 1}. ${link.text}`);
        });
    }
    
    console.log('='.repeat(80));
}

function displayStats(stats: any): void {
    console.log('\n' + '='.repeat(80));
    console.log('📊 СТАТИСТИКА ВАЛИДАЦИИ');
    console.log('='.repeat(80));
    console.log(`   Всего уроков: ${stats.totalLessons}`);
    console.log(`   Всего элементов контента: ${stats.totalContent}`);
    console.log(`   Всего ссылок: ${stats.totalLinks}`);
    console.log(`   Автоматически исправлено: ${stats.autoFixed}`);
    console.log(`   Некорректных ссылок: ${stats.invalidLinks}`);
    console.log(`   Пропущенных ссылок: ${stats.missingLinks}`);
    console.log(`   Всего проблем: ${stats.invalidLinks + stats.missingLinks}`);
    console.log('='.repeat(80));
}

function generateCorrectionTemplate(issue: ValidationIssue): void {
    console.log('\n💡 ШАБЛОН ДЛЯ ИСПРАВЛЕНИЯ:');
    console.log('Добавьте в bibleLinksCorrections.json -> corrections:');
    console.log('```json');
    console.log(JSON.stringify({
        from: issue.originalText,
        info: issue.info,
        links: [
            {
                text: "Пример: Нав. 1:7",
                data: [
                    {
                        bookNumber: 60,
                        chapter: [1],
                        verses: [7]
                    }
                ]
            }
        ],
        autoApply: true
    }, null, 2));
    console.log('```\n');
}

// ==================== ГЛАВНЫЕ ФУНКЦИИ ====================

/**
 * Режим 1: Только валидация (npm run validate)
 * - Проверяет все ссылки
 * - Генерирует шаблоны исправлений
 * - Сохраняет предложения в bibleLinksCorrections.json
 * - НЕ применяет исправления автоматически
 */
export function validateOnly(): void {
    console.log('\n' + '='.repeat(80));
    console.log('🔍 ВАЛИДАЦИЯ БИБЛЕЙСКИХ ССЫЛОК (БЕЗ ПРИМЕНЕНИЯ ИСПРАВЛЕНИЙ)');
    console.log('='.repeat(80));
    console.log(`📂 Входной файл: ${INPUT_FILE}`);
    console.log(`📂 Файл предложений: ${CORRECTIONS_FILE}\n`);
    
    // Загрузка данных
    console.log('⏳ Загрузка данных...');
    const lessons = loadLessons();
    console.log(`✅ Загружено ${lessons.length} уроков\n`);
    
    // Валидация БЕЗ применения исправлений
    console.log('⏳ Выполнение валидации...\n');
    const { issues, stats } = validateLessons(lessons, false); // false = не применять исправления
    
    // Вывод статистики
    displayStats(stats);
    
    // Вывод проблем
    if (issues.length === 0) {
        console.log('\n✅ Проблем не найдено! Все ссылки корректны.\n');
        return;
    }
    
    console.log(`\n📋 СПИСОК ПРОБЛЕМ (${issues.length}):\n`);
    
    // Сохраняем шаблоны для ВСЕХ проблем
    const existingCorrections = loadCorrections();
    let addedCount = 0;
    
    issues.forEach((issue, index) => {
        displayIssue(issue, index, issues.length);
        
        // Проверяем по тексту (не по ID — они могут меняться после повторного парсинга)
        const alreadyExists = existingCorrections.corrections.some(
            c => c.from === issue.originalText
        );
        
        if (!alreadyExists) {
            // Генерируем шаблон и добавляем в corrections
            const template = createCorrectionTemplate(issue);
            existingCorrections.corrections.push(template);
            addedCount++;
            
            console.log('\n💡 ШАБЛОН ДОБАВЛЕН В ФАЙЛ ИСПРАВЛЕНИЙ');
        } else {
            console.log('\n⚠️  Исправление уже существует в файле');
        }
    });
    
    // Сохраняем обновленный файл исправлений
    if (addedCount > 0) {
        saveCorrections(existingCorrections);
        console.log(`\n✅ Добавлено ${addedCount} новых шаблонов в ${CORRECTIONS_FILE}`);
    }
    
    // Инструкции
    console.log('\n' + '='.repeat(80));
    console.log('📝 СЛЕДУЮЩИЕ ШАГИ');
    console.log('='.repeat(80));
    console.log('1. Откройте файл bibleLinksCorrections.json');
    console.log('2. Проверьте и отредактируйте предложенные исправления');
    console.log('3. Установите "autoApply": true для исправлений, которые нужно применить');
    console.log('4. Запустите применение исправлений: npm run apply');
    console.log('='.repeat(80) + '\n');
}

/**
 * Режим 2: Применение исправлений (npm run apply)
 * - Загружает SS+.json
 * - Применяет только исправления с autoApply: true
 * - Создает SS-valid.json
 */
export function applyCorrections(): void {
    console.log('\n' + '='.repeat(80));
    console.log('⚙️  ПРИМЕНЕНИЕ ИСПРАВЛЕНИЙ');
    console.log('='.repeat(80));
    console.log(`📂 Входной файл: ${INPUT_FILE}`);
    console.log(`📂 Выходной файл: ${OUTPUT_FILE}`);
    console.log(`📂 Файл исправлений: ${CORRECTIONS_FILE}\n`);
    
    // Загрузка данных
    console.log('⏳ Загрузка данных...');
    const lessons = loadLessons();
    console.log(`✅ Загружено ${lessons.length} уроков\n`);
    
    // Загрузка исправлений
    const correctionsData = loadCorrections();
    const autoApplyCorrections = correctionsData.corrections.filter(c => c.autoApply === true);
    
    if (autoApplyCorrections.length === 0) {
        console.log('⚠️  Не найдено исправлений с autoApply: true');
        console.log('📝 Откройте bibleLinksCorrections.json и установите autoApply: true');
        return;
    }
    
    console.log(`🔧 Найдено исправлений для применения: ${autoApplyCorrections.length}\n`);
    
    // Применяем исправления
    let appliedCount = 0;

    for (const correction of autoApplyCorrections) {
        let applied = false;

        // Первый проход: точное совпадение по ID + тексту
        for (const lesson of lessons) {
            if (lesson.id !== correction.info.lessonId) continue;
            for (const content of lesson.content) {
                if (content.id !== correction.info.contentId) continue;
                if (content.text === correction.from) {
                    content.links = correction.links;
                    appliedCount++;
                    applied = true;
                    console.log(`✅ Применено: Урок ${lesson.lessonNumber}, Content ID ${content.id}`);
                }
            }
        }

        // Fallback: совпадение только по тексту (IDs могли смениться после повторного парсинга)
        if (!applied) {
            for (const lesson of lessons) {
                for (const content of lesson.content) {
                    if (content.text === correction.from) {
                        content.links = correction.links;
                        appliedCount++;
                        console.log(`✅ Применено (по тексту): Урок ${lesson.lessonNumber}, Content ID ${content.id}`);
                    }
                }
            }
        }
    }
    
    // Сохраняем результат
    saveLessons(lessons);
    
    console.log(`\n✅ Применено исправлений: ${appliedCount}`);
    console.log(`✅ Результат сохранен в ${OUTPUT_FILE}\n`);
    
    // Повторная валидация
    console.log('⏳ Проверка результата...\n');
    const { issues, stats } = validateLessons(lessons, false);
    
    displayStats(stats);
    
    if (issues.length === 0) {
        console.log('\n🎉 Отлично! Все проблемы исправлены!\n');
    } else {
        console.log(`\n⚠️  Осталось проблем: ${issues.length}`);
        console.log('💡 Запустите npm run validate для обновления списка\n');
    }
}

/**
 * Создает шаблон исправления из проблемы
 */
function createCorrectionTemplate(issue: ValidationIssue): Correction {
    let links: BibleLink[];

    if (issue.currentLinks && issue.currentLinks.length > 0) {
        // Использовать уже распознанные ссылки — пользователю нужно только добавить недостающие
        links = issue.currentLinks;
    } else {
        // Нет ссылок: создать заглушки на основе потенциальных совпадений
        const potentialRefs = extractPotentialReferences(issue.originalText);
        links = potentialRefs.length > 0
            ? potentialRefs.map(ref => ({
                text: ref.trim(),
                data: [{ bookNumber: 0, chapter: [0], verses: null }]
              }))
            : [{ text: "???", data: [{ bookNumber: 0, chapter: [0], verses: null }] }];
    }

    return {
        from: issue.originalText,
        info: issue.info,
        links,
        autoApply: false,  // требует ручной проверки
        ignore: false       // установить true чтобы подавить ложное срабатывание
    };
}

// Запуск в зависимости от аргумента командной строки
const mode = process.argv[2];

if (mode === 'apply') {
    applyCorrections();
} else {
    validateOnly();
}
