import fs from 'fs';
import path from 'path';

// Регулярное выражение для поиска библейских ссылок
const biblePattern = /(?:(?:1|2|3)\s*)?(?:Флп|Кол|Деян|Кор|Еф|Петр|Тим|Откр|Исх|Ин|Мф|Флм|Лк|Ис|Иов|Евр|Рим|Гал|Быт|Мих|Мк|Иак|Фес|Притч|Пс|Иер|Еккл|Цар)\.\s*\d+(?:[:\.][\d–\-,;\s]+)?/g;

// Функция для извлечения библейских ссылок из HTML
function extractBibleLinksFromHTML(htmlContent, lessonNumber) {
    const links = [];
    const matches = htmlContent.matchAll(biblePattern);
    
    for (const match of matches) {
        const linkText = match[0].replace(/&#160;/g, ' ').trim();
        const index = match.index;
        
        // Получаем контекст (100 символов до и после)
        const contextStart = Math.max(0, index - 100);
        const contextEnd = Math.min(htmlContent.length, index + match[0].length + 100);
        const context = htmlContent
            .substring(contextStart, contextEnd)
            .replace(/<[^>]*>/g, '') // Удаляем HTML-теги
            .replace(/&#160;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        
        links.push({
            text: linkText,
            lesson: lessonNumber,
            context: context
        });
    }
    
    return links;
}

// Функция для извлечения распознанных ссылок из SS+.json
function extractRecognizedLinks(jsonData) {
    const recognizedLinks = [];
    
    for (const lesson of jsonData) {
        const lessonNumber = lesson.lessonNumber;
        
        for (const item of lesson.content || []) {
            if (item.links && Array.isArray(item.links)) {
                for (const link of item.links) {
                    recognizedLinks.push({
                        text: link.text.replace(/&#160;/g, ' ').trim(),
                        lesson: `L${String(lessonNumber).padStart(2, '0')}`,
                        data: link.data
                    });
                }
            }
        }
    }
    
    return recognizedLinks;
}

// Функция для нормализации текста ссылки (удаление пробелов, приведение к единому формату)
function normalizeLink(linkText) {
    return linkText
        .replace(/\s+/g, ' ')
        .replace(/&#160;/g, ' ')
        .replace(/\u00A0/g, ' ')
        .replace(/\s*([,;:\.])\s*/g, '$1')
        .trim()
        .toLowerCase();
}

// Основная функция анализа
async function analyzeBibleLinks() {
    const ssJsonPath = '/Volumes/FilinSky/PROJECTS/Golosnadejdy/Servise/Parser/ResultParse/SS/SS+.json';
    const htmlDir = '/Volumes/FilinSky/PROJECTS/Golosnadejdy/Servise/Parser/fileForParse/SS';
    
    console.log('='.repeat(80));
    console.log('АНАЛИЗ БИБЛЕЙСКИХ ССЫЛОК В УРОКАХ СУББОТНЕЙ ШКОЛЫ');
    console.log('='.repeat(80));
    console.log();
    
    // Читаем SS+.json
    console.log('Загрузка SS+.json...');
    const jsonData = JSON.parse(fs.readFileSync(ssJsonPath, 'utf-8'));
    const recognizedLinks = extractRecognizedLinks(jsonData);
    
    console.log(`Найдено распознанных ссылок в SS+.json: ${recognizedLinks.length}`);
    console.log();
    
    // Создаем карту распознанных ссылок для быстрого поиска
    const recognizedMap = new Map();
    for (const link of recognizedLinks) {
        const key = `${link.lesson}:${normalizeLink(link.text)}`;
        recognizedMap.set(key, link);
    }
    
    // Анализируем HTML файлы
    const allHtmlLinks = [];
    
    for (let i = 1; i <= 13; i++) {
        const lessonNum = `L${String(i).padStart(2, '0')}`;
        const htmlPath = path.join(htmlDir, `${lessonNum}.html`);
        
        if (!fs.existsSync(htmlPath)) {
            console.log(`Файл ${lessonNum}.html не найден`);
            continue;
        }
        
        console.log(`Анализ ${lessonNum}.html...`);
        const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
        const links = extractBibleLinksFromHTML(htmlContent, lessonNum);
        allHtmlLinks.push(...links);
    }
    
    console.log(`Всего найдено ссылок в HTML файлах: ${allHtmlLinks.length}`);
    console.log();
    console.log('='.repeat(80));
    
    // Классификация ссылок
    const recognized = [];
    const unrecognized = [];
    
    for (const htmlLink of allHtmlLinks) {
        const key = `${htmlLink.lesson}:${normalizeLink(htmlLink.text)}`;
        const isRecognized = recognizedMap.has(key);
        
        if (isRecognized) {
            recognized.push({
                ...htmlLink,
                status: 'РАСПОЗНАНА',
                data: recognizedMap.get(key).data
            });
        } else {
            // Проверяем частичное совпадение
            let found = false;
            for (const [mapKey, mapLink] of recognizedMap.entries()) {
                if (mapKey.startsWith(htmlLink.lesson + ':') && 
                    (normalizeLink(htmlLink.text).includes(normalizeLink(mapLink.text)) ||
                     normalizeLink(mapLink.text).includes(normalizeLink(htmlLink.text)))) {
                    recognized.push({
                        ...htmlLink,
                        status: 'РАСПОЗНАНА (частично)',
                        data: mapLink.data,
                        recognizedAs: mapLink.text
                    });
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                unrecognized.push({
                    ...htmlLink,
                    status: 'НЕ РАСПОЗНАНА'
                });
            }
        }
    }
    
    // Выводим результаты
    console.log();
    console.log('📊 СТАТИСТИКА:');
    console.log('='.repeat(80));
    console.log(`Всего ссылок в HTML: ${allHtmlLinks.length}`);
    console.log(`Распознано: ${recognized.length} (${(recognized.length / allHtmlLinks.length * 100).toFixed(1)}%)`);
    console.log(`Не распознано: ${unrecognized.length} (${(unrecognized.length / allHtmlLinks.length * 100).toFixed(1)}%)`);
    console.log('='.repeat(80));
    console.log();
    
    // Выводим распознанные ссылки
    console.log();
    console.log('✅ РАСПОЗНАННЫЕ ССЫЛКИ:');
    console.log('='.repeat(80));
    
    const recognizedByLesson = {};
    for (const link of recognized) {
        if (!recognizedByLesson[link.lesson]) {
            recognizedByLesson[link.lesson] = [];
        }
        recognizedByLesson[link.lesson].push(link);
    }
    
    for (const lesson of Object.keys(recognizedByLesson).sort()) {
        console.log();
        console.log(`📖 ${lesson}:`);
        console.log('-'.repeat(80));
        
        for (const link of recognizedByLesson[lesson]) {
            console.log(`  ✓ ${link.text}`);
            if (link.recognizedAs) {
                console.log(`    (распознана как: ${link.recognizedAs})`);
            }
            console.log(`    Контекст: ...${link.context.substring(0, 150)}...`);
            console.log();
        }
    }
    
    // Выводим нераспознанные ссылки
    console.log();
    console.log('❌ НЕРАСПОЗНАННЫЕ ССЫЛКИ:');
    console.log('='.repeat(80));
    
    const unrecognizedByLesson = {};
    for (const link of unrecognized) {
        if (!unrecognizedByLesson[link.lesson]) {
            unrecognizedByLesson[link.lesson] = [];
        }
        unrecognizedByLesson[link.lesson].push(link);
    }
    
    for (const lesson of Object.keys(unrecognizedByLesson).sort()) {
        console.log();
        console.log(`📖 ${lesson}:`);
        console.log('-'.repeat(80));
        
        for (const link of unrecognizedByLesson[lesson]) {
            console.log(`  ✗ ${link.text}`);
            console.log(`    Контекст: ...${link.context.substring(0, 150)}...`);
            console.log();
        }
    }
    
    // Сохраняем результаты в файл
    const reportPath = '/Volumes/FilinSky/PROJECTS/Golosnadejdy/Servise/Parser/bible_links_report.json';
    const report = {
        statistics: {
            totalLinks: allHtmlLinks.length,
            recognized: recognized.length,
            unrecognized: unrecognized.length,
            recognitionRate: `${(recognized.length / allHtmlLinks.length * 100).toFixed(1)}%`
        },
        recognizedLinks: recognized,
        unrecognizedLinks: unrecognized
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
    console.log();
    console.log('='.repeat(80));
    console.log(`📄 Подробный отчет сохранен в: ${reportPath}`);
    console.log('='.repeat(80));
}

// Запуск анализа
analyzeBibleLinks().catch(console.error);
