import _ from 'lodash'



//* Книги Библии в которых только одна глава 720 700 710 640
const arrBiblebook = ["Быт", "Исх", "Лев", "Числ", "Втор", "Нав", "Суд", "Руф", "1 Цар", "2 Цар", "3 Цар", "4 Цар", "1 Пар", "2 Пар", "Ездр", "Неем", "Есф", "Иов", "Пс", "Притч", "Еккл", "Песн", "Ис", "Иер", "Плач", "Иез", "Дан", "Ос", "Иоил", "Амос", "Авд", "Ион", "Мих", "Наум", "Авв", "Соф", "Агг", "Зах", "Мал", "Мф", "Мк", "Лк", "Ин", "Деян", "Иак", "1 Петр", "2 Петр", "1 Ин", "2 Ин", "3 Ин", "Иуд", "Рим", "1 Кор", "2 Кор", "Гал", "Еф", "Флп", "Кол", "1 Фес", "2 Фес", "1 Тим", "2 Тим", "Тит", "Флм", "Евр", "Откр"]
const booksNameNumber = { "Быт": 10, "Исх": 20, "Лев": 30, "Числ": 40, "Втор": 50, "Нав": 60, "Суд": 70, "Руф": 80, "1 Цар": 90, "2 Цар": 100, "3Цар": 110, "4 Цар": 120, "1 Пар": 130, "2 Пар": 140, "Ездр": 150, "Неем": 160, "Есф": 190, "Иов": 220, "Пс": 230, "Притч": 240, "Еккл": 250, "Песн": 260, "Ис": 290, "Иер": 300, "Плач": 310, "Иез": 330, "Дан": 340, "Ос": 350, "Иоил": 360, "Амос": 370, "Авд": 380, "Ион": 390, "Мих": 400, "Наум": 410, "Авв": 420, "Соф": 430, "Агг": 440, "Зах": 450, "Мал": 460, "Мф": 470, "Мк": 480, "Лк": 490, "Ин": 500, "Деян": 510, "Иак": 660, "1 Петр": 670, "2 Петр": 680, "1 Ин": 690, "2 Ин": 700, "3 Ин": 710, "Иуд": 720, "Рим": 520, "1 Кор": 530, "2 Кор": 540, "Гал": 550, "Еф": 560, "Флп": 570, "Кол": 580, "1 Фес": 590, "2 Фес": 600, "1 Тим": 610, "2 Тим": 620, "Тит": 630, "Флм": 640, "Евр": 650, "Откр": 730 } // Будет располагаться объект в котором будут соответсенные названия книг и номера
const oneChapterBooks = [640, 700, 710, 720]
// const arrBiblebook = ["Еф.", "Флм.", "1 Фес."]
// let text = '(Еф. 1:16, см. также Флм. 3, 4; 1 Фес. 1:2; 5:16–18) Иез. 8:16; 20:1–20; 1 Фес. 4:16, 17; вставка в текст (Откр. 12:9) вставка в текст Откр. 12:9; 16:13, 14; 18:4, 5; 20. Основные отрывки: Откр. 14:9–11; 13:15–17. Дополнительные Откр. 12:9 отрывки: Мф. 27:45–50; Лк. 5:18–26; Еф. 2:8–10; Откр. 7:2, 3; 5; 14:4, 12. Прочитайте Откр 12: 9. Кого, согласно Откр. 12:9 и Откр. 12:10 этому стиху, обманывает Откр. 12:9 (обольщает) сатана ? Прочитайте Притч. 14: 12. Какое 1 Тим. 1:1.'
// let text = 'Павел также написал, что он «непрестанно благодарит за вас <span class="italic CharOverride-6">Бога</span>, вспоминая о вас в молитвах» своих (Еф. 1:16, см. также Флм. 3, 4; 1 Фес. 1:2; 5:16–18).</p>'


// const ARR = creatArrParsText(STR)
// console.log('ARR', ARR)

// регулярное выражение 
// \s(\d+:\d+(?:–\d+)?(?:,\s*\d+(?:–\d+)?)*(?:;\s*\d+:\d+(?:–\d+)?(?:,\s*\d+(?:–\d+)?))*)\b


// Нормализация пробелов в тексте
function normalizeSpaces(text: string): string {
    return text
        .replace(/\s+/g, ' ') // Заменяем множественные пробелы на один
        .replace(/\s*([,;])\s*/g, '$1') // Убираем пробелы вокруг запятых и точек с запятой
        .replace(/\s*–\s*/g, '–') // Убираем пробелы вокруг тире
        .replace(/([,;])(\d)/g, '$1 $2') // Добавляем пробел после запятой/точки с запятой перед цифрой
        .trim();
}

// Парсинг библейской ссылки
function parseBibleReference(text: string) {
    // Извлекаем название книги
    const bookName = text.match(/\d?\s?[а-яА-Я]+\.\s/gi)?.[0]?.slice(0, -2)?.trim() || '';
    
    // Получаем текст без названия книги
    const withoutName = text.replace(/\d?\s?[а-яА-Я]+\.\s/gi, '').trim();
    
    // Разбиваем на отдельные ссылки
    const references = withoutName
        .split(/[;и]/)
        .map(ref => ref.trim())
        .filter(Boolean);
    
    const result = [];
    
    for (const ref of references) {
        const bookNumber = booksNameNumber[bookName as keyof typeof booksNameNumber];
        const isOneChapterBook = oneChapterBooks.indexOf(bookNumber) !== -1;
        
        // Обработка книг с одной главой
        if (isOneChapterBook && !ref.includes(':')) {
            const parsedRef = {
                bookName,
                chapter: ['1'],
                verses: normalizeSpaces(ref)
            };
            result.push(parsedRef);
            continue;
        }
        
        // Обработка ссылок с указанием стихов
        if (ref.includes(':')) {
            const [chapter, verses] = ref.split(':').map(s => s.trim());
            const parsedRef = {
                bookName,
                chapter: [normalizeSpaces(chapter)],
                verses: verses ? normalizeSpaces(verses) : null
            };
            result.push(parsedRef);
            continue;
        }
        
        // Обработка ссылок только с главами
        const chapters = ref.split(',').map(s => s.trim());
        const expandedChapters: string[] = [];
        
        for (const chapter of chapters) {
            if (chapter.includes('-')) {
                // Обработка диапазона глав (например: 3-5)
                const [start, end] = chapter.split('-').map(n => parseInt(n.trim()));
                for (let i = start; i <= end; i++) {
                    expandedChapters.push(i.toString());
                }
            } else {
                expandedChapters.push(normalizeSpaces(chapter));
            }
        }
        
        const parsedRef = {
            bookName,
            chapter: expandedChapters,
            verses: null
        };
        result.push(parsedRef);
    }
    
    return result;
}

function formatBibleLink(match: string) {
    const references = parseBibleReference(match);
    return `#["${match}",${references.map(ref => JSON.stringify(ref)).join(', ')}]#`;
}

// Поиск библейских ссылок в тексте
export const findsBibleLink = (text: string) => {
    const bibleNames = arrBiblebook.join('|');
    
    //? 1. Паттерн для названия книги (включая цифру в начале, если есть)
    const bookPattern = `(\\d\\s*)?(${bibleNames})\\.\\s*`;
    
    //? 2. Паттерны для главы и стихов
    // Паттерн для одиночной главы
    const singleChapterPattern = `\\d+`;

    // Паттерн для диапазона глав (например: 3-5)
    const chapterRangePattern = `\\d+\\s*[–-]\\s*\\d+`;

    // Паттерн для группы глав (например: 3, 4-6, 8)
    const chapterGroupPattern = `(?:${singleChapterPattern}|${chapterRangePattern})(?:\\s*,\\s*(?:${singleChapterPattern}|${chapterRangePattern}))*`;

    // Паттерн для диапазона стихов (например: 23-26)
    const verseRangePattern = `\\d+\\s*[–-]\\s*\\d+`;

    // Паттерн для одиночного стиха
    const singleVersePattern = `\\d+`;

    // Паттерн для группы стихов (например: 23-26, 15-18)
    const verseGroupPattern = `(?:${verseRangePattern}|${singleVersePattern})(?:\\s*,\\s*(?:${verseRangePattern}|${singleVersePattern}))*`;

    // Паттерн для главы и стихов (например: 72: 23-26, 15-18)
    const chapterVersePattern = `${chapterGroupPattern}(?:\\s*:\\s*${verseGroupPattern})?`;
    
    //? 3. Паттерны для продолжения через точку с запятой и "и"
    // Паттерн для продолжения через точку с запятой
    const semicolonPattern = `(?:\\s*;\\s*(?!${bibleNames})${chapterGroupPattern}(?:\\s*:\\s*${verseGroupPattern})?)*`;    
    
    // Паттерн для продолжения через "и"
    const andPattern = `(?:\\s+и\\s+(?!${bibleNames})${chapterGroupPattern}(?:\\s*:\\s*${verseGroupPattern})?)*`;
    
    //? 4. Паттерны для окончания ссылки
    // Паттерн для окончания точкой с запятой
    const endSemicolonPattern = `\\s*;`;
    
    // Паттерн для окончания точкой
    const endDotPattern = `\\s*\\.`;
    
    // Паттерн для окончания русским текстом
    const endRussianTextPattern = `\\d?\\s[а-яА-Я]`;
    
    // Паттерн для окончания скобкой
    const endBracketPattern = `\\s*[\\(\\)]`;
    
    // Паттерн для окончания строки
    const endOfLinePattern = `$`;
    
    // Собираем все части вместе
    const endPattern = `(?=${endSemicolonPattern}|${endDotPattern}|${endRussianTextPattern}|${endBracketPattern}|${endOfLinePattern})`;
    
    // Собираем все части вместе
    const regex = new RegExp(
        `${bookPattern}(${chapterVersePattern}${semicolonPattern}${andPattern})${endPattern}`,
        'g'
    );    

    console.log('Regex pattern:', regex);
    const matches = text.match(regex);
    console.log('Matches:', matches);
    
    const result = text.replace(regex, formatBibleLink);
    console.log('findsBibleLink output:', result);
    return result;
};














const bookName = '\d?\s?[а-яА-Я]+\.\s' // Ис. - книга-точка-пробел
const chapter = '\d+'


export function creatArrParsText(text) {
    // "Проявление Его любви в нашей личной жизни открывает миру Его славу — Его\n\t\t\tхарактер. Последнее послание, которое несут три ангела и которое должно быть провозглашено миру,\n\t\t\tпогруженному в духовную тьму, звучит так: «Убойтесь Бога и воздайте Ему славу» (#]}\"7\":\"sesrev\",\"41\":\"retpahc\",\"рктО\":\"emaNkoob\"{,\"7:41 .рктО\"[#)."


    let arr = []
    let isReg = true
    const reg = /#(.*?)#/


    while (reg.test(text)) {
        isReg = false
        // находим первое совпадение
        let rts = text.match(reg)

        // разделяет на массив до шаблона и после
        // первая часть записываеться в массив
        let arrStr = text.split(rts[0])
        // вторая часть перезаписывает текст 
        text = arrStr[1]

        arr.push({ isLink: false, text: arrStr[0] })

        let objTestLink = {
            isLink: true, text: rts[1]
        }
        // проверка распозналась ли ссылка
        // objTestLink = getObjTestLink(rts[1])
        // переворачиваем 
        arr.push({ isLink: objTestLink.isLink, text: objTestLink.text })


        // парсим json 
        // const arrN = JSON.parse(str) // получаем массив первый элемент которого оригинал строки остальные набор ссылок стихов

        // перебираем массив и создаём <Text></Text>
        // let originText = arrN[0]
        // let versesArr = arrN.slice(1)

        // const linkText = <Text onPress={() => { openVersesLink(versesArr) }} style={[styles.linkText, { color: colorLinkText, fontSize: consts.fontsSize }]}>{originText}</Text>
    }

    if (!reg.test(text)) {
        arr.push({ isLink: false, text: text })
    }

    return arr
}

export function creatArrParsTextNew(text) {
    // "Проявление Его любви в нашей личной жизни открывает миру Его славу — Его\n\t\t\tхарактер. Последнее послание, которое несут три ангела и которое должно быть провозглашено миру,\n\t\t\tпогруженному в духовную тьму, звучит так: «Убойтесь Бога и воздайте Ему славу» (#]}\"7\":\"sesrev\",\"41\":\"retpahc\",\"рктО\":\"emaNkoob\"{,\"7:41 .рктО\"[#)."



    let arr = []
    let isReg = true
    const reg = /#(.*?)#/g

    const res = text.replace(reg, findLink);

    while (reg.test(text)) {
        isReg = false
        // находим первое совпадение
        let rts = text.match(reg)

        // разделяет на массив до шаблона и после
        // первая часть записываеться в массив
        let arrStr = text.split(rts[0])
        // вторая часть перезаписывает текст 
        text = arrStr[1]

        arr.push({ isLink: false, text: arrStr[0] })

        let objTestLink = {
            isLink: true, text: rts[1].split("").reverse().join("")
        }
        // проверка распозналась ли ссылка
        // objTestLink = getObjTestLink(rts[1])
        // переворачиваем 
        arr.push({ isLink: objTestLink.isLink, text: objTestLink.text })


        // парсим json 
        // const arrN = JSON.parse(str) // получаем массив первый элемент которого оригинал строки остальные набор ссылок стихов

        // перебираем массив и создаём <Text></Text>
        // let originText = arrN[0]
        // let versesArr = arrN.slice(1)

        // const linkText = <Text onPress={() => { openVersesLink(versesArr) }} style={[styles.linkText, { color: colorLinkText, fontSize: consts.fontsSize }]}>{originText}</Text>
    }

    if (isReg) {
        arr.push({ isLink: false, text: text })
    }

    return arr
}

function findLink(link) {
    // #["Откр. 17: 24–26 ",{"bookName":"Откр","chapter":["17"],"verses":"24–26"}]#


}

function execLink(string) {
    // Ис. 40:8; 54:17;
    // Откр. 11: 3–6, 15–18; 12: 5, 6, 14, 15.
    // 2 Фес. 12, 15:25-14, 17:4,5,6

    if (/\d\s[а-яА-Я]+\.\s/.test(string)) {
        console.log('string', string)
    }

    const bookName = string.match(/\d?\s?[а-яА-Я]+\.\s/gi).join('').slice(0, -2)
    const withoutName = string.replace(/\d?\s?[а-яА-Я]+\.\s/gi, '')
    const arrChapter = withoutName.split(";")

    const arr = [string]

    arrChapter.forEach(item => {
        // 11: 3–6, 15–18, 20
        (() => {

            // console.log('item', item)

            // если строка ПУСТАЯ выходим из функции
            if (_.isEmpty(_.trim(item))) {
                return false
            }

            // Специфическая проверка содержит ли текущая книга одну единственную главу
            // (проверка для того что бы при ссылке типа Иуд. 3, 4 - цифры распознавались как стихи, а не главы)
            if (booksNameNumber.hasOwnProperty(bookName)) {

                const bookNumber = booksNameNumber[bookName]
                const isOneChapterBook = oneChapterBooks.find(item => item === bookNumber)

                if (isOneChapterBook && !/[:]/.test(item)) {
                    item = `1:${_.trim(item)}`
                }

            }

            // ниже если строка не ПУСТАЯ
            // ^^^^^^^^^^^^^^^^^^^^^^^^^^


            // проверяем наличие двоеточия :
            if (/[:]/.test(item)) {
                const arrChapterAndVerses = item.split(":").map(item => _.trim(item))

                const chapter = arrChapterAndVerses[0]
                const verses = arrChapterAndVerses[1]

                arr.push({
                    bookName: bookName,
                    chapter: [chapter],
                    verses: verses
                })
                return true
            }

            // в случае если только главы
            if (!/[:]/.test(item)) {
                const arrChapterAndVerses = item.split(",")

                const chapters = arrChapterAndVerses.map(item => {

                    const str = _.trim(item)

                    if (/[–,-]/.test(str)) {
                        return generateNumberArray(item)
                    }

                    return str
                })

                arr.push({
                    bookName: bookName,
                    chapter: chapters,
                    verses: null
                })

                return true
            }



        })()

    })


    //\"Деян. 4:18; 8:1–8.\",{\"bookName\":\"Деян\",\"chapter\":[\"4\"],\"verses\":\"18\"},{\"bookName\":\"Деян\",\"chapter\":[\"8\"],\"verses\":\"1–8\"}]
    // "[\"Откр. 11:3–6, 15–18; 12:5, 6, 14, 15.\",{\"bookName\":\"Откр\",\"chapter\":[\"11\"],\"verses\":\"3–6, 15–18\"},{\"bookName\":\"Откр\",\"chapter\":[\"12\"],\"verses\":\"5, 6, 14, 15\"}]"

    return `#${JSON.stringify(arr)}#`
}

function generateNumberArray(input) {
    const [start, end] = input.split('-').map(Number);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}
