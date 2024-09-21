
import { TContent, TLink, TOldContent, TOldLinkArr, TOldParse, TOldParseResult, TParseResult } from "./types/parseResult.type"
import { parseISO, startOfDay, formatISO } from 'date-fns';

export const convertResultSS = (data: TOldParseResult): TParseResult[] => {
    let i = 1
    const arr = Object.values(data) as TOldParse[]
    const result: TParseResult[] = []

    arr.forEach((lesson: TOldParse) => {
        Object.keys(lesson).forEach(key => {
            const day = lesson[key]

            const data: TParseResult = {
                id: i,
                date: getDate(key),
                lessonName: day.lessonName,
                lessonNumber: day.lessonNumber,
                isFirstLesson: day.isFirstLesson ? day.isFirstLesson : undefined,
                content: convertContentSS(day.arrEl)
            }

            result.push(data)

            i++
        })
    })

    return result
}

function convertContentSS(data: TOldContent[]): TContent[] {
    const result: TContent[] = []

    data.forEach(item => {
        const type = item.style
        const links: TLink[] = []
        const textArr: string[] = []
        item.text.forEach(text => {

            if (text.isLink) {
                const link = JSON.parse(text.text) as TOldLinkArr
                // сохранение текста в массив
                textArr.push(link[0])
                links.push(convertLink(link))
            } else {
                textArr.push(text.text)
            }
        })

        result.push({
            type: type,
            text: textArr.join(''),
            links: (links.length > 0) ? links : undefined

        })
    })

    return result
}

function getDate(dateString: string) {
    // Разбор строки в объект Date
    const parsedDate = parseISO(dateString);
    // Сброс времени на начало дня (00:00:00)
    const dateAtStartOfDay = startOfDay(parsedDate);
    // Форматирование в ISO строку
    return formatISO(dateAtStartOfDay);
}

function convertLink(data: TOldLinkArr): TLink {

    const text = data[0]

    const bookName = data[1].bookName
    const chapter = data[1].chapter
    const verses = data[1].verses

    return {
        text: text,
        bookNumber: getBookNumber(bookName),
        chapter: chapter,
        verses: getVerses(verses)
    }
}

function getBookNumber(data: string) {
    // "Мф"
    if (booksNameNumber.hasOwnProperty(data)) {
        return booksNameNumber[data]
    }

    console.warn(`${data} не найдена в объекте booksNameNumber`)
    return null
}

function getVerses(data: string | null): number[] | null {
    // "10"
    // "15–20"
    // "17, 18"
    // null

    if (!data) {
        return null
    }

    const verses: number[] = [];

    // Split the input by commas
    const parts = data.split(',');

    for (const part of parts) {
        let range = part.trim(); // Remove whitespace

        // Check for a range (e.g., "15–20")
        if (range.includes('–')) {
            const [start, end] = range.split('–').map(Number); // Split into start and end, convert to numbers
            for (let i = start; i <= end; i++) {
                verses.push(i); // Add all numbers in the range
            }
        } else {
            // Otherwise, just add the single number
            verses.push(Number(range));
        }
    }

    return verses; // Return the resulting array
}

export const booksNameNumber: {
    [key: string]: number
} = {
    "Быт": 10,
    "Исх": 20,
    "Лев": 30,
    "Числ": 40,
    "Втор": 50,
    "Нав": 60,
    "Суд": 70,
    "Руф": 80,
    "1 Цар": 90,
    "2 Цар": 100,
    "3 Цар": 110,
    "4 Цар": 120,
    "1 Пар": 130,
    "2 Пар": 140,
    "Ездр": 150,
    "Неем": 160,
    "Есф": 190,
    "Иов": 220,
    "Пс": 230,
    "Притч": 240,
    "Еккл": 250,
    "Песн": 260,
    "Ис": 290,
    "Иер": 300,
    "Плач": 310,
    "Иез": 330,
    "Дан": 340,
    "Ос": 350,
    "Иоил": 360,
    "Амос": 370,
    "Авд": 380,
    "Ион": 390,
    "Мих": 400,
    "Наум": 410,
    "Авв": 420,
    "Соф": 430,
    "Агг": 440,
    "Зах": 450,
    "Мал": 460,
    "Мф": 470,
    "Мк": 480,
    "Лк": 490,
    "Ин": 500,
    "Деян": 510,
    "Иак": 660,
    "1 Петр": 670,
    "2 Петр": 680,
    "1 Ин": 690,
    "2 Ин": 700,
    "3 Ин": 710,
    "Иуд": 720,
    "Рим": 520,
    "1 Кор": 530,
    "2 Кор": 540,
    "Гал": 550,
    "Еф": 560,
    "Флп": 570,
    "Кол": 580,
    "1 Фес": 590,
    "2 Фес": 600,
    "1 Тим": 610,
    "2 Тим": 620,
    "Тит": 630,
    "Флм": 640,
    "Евр": 650,
    "Откр": 730
} // Будет располагаться объект в котором будут соответсенные названия книг и номера
