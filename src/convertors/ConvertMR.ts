
import { parseISO, startOfDay, formatISO } from 'date-fns';
import { TContentMR, TOldContentMR, TOldItemMR, TParseResultMR } from "../types/parseResultMR.type";

export const convertResultMR = (data: TOldContentMR): TParseResultMR[] => {

    const arr = Object.values(data) as TOldItemMR[]
    const result: TParseResultMR[] = []

    arr.forEach((day: TOldItemMR, index) => {

        const { date, lessonName, ...content } = day

        const data: TParseResultMR = {
            id: index + 1,
            date: getDate(date),
            name: lessonName,
            content: convertContentSS(content)
        }

        result.push(data)
    })

    return result
}

function convertContentSS(data: Omit<TOldItemMR, 'date' | 'lessonName'>): TContent[] {
    const result: TContentMR[] = []

    const keys = Object.keys(data)
    // console.log('keys', keys)

    keys.forEach((key: string, index) => {
        const part = data[key]
        if (part.trim().length > 0) {
            result.push({
                id: index + 1,
                type: key,
                text: part
            })
        }

    })


    return result
}

function getDate(dateString: string) {
    // // Разбор строки в объект Date
    // const parsedDate = parseISO(dateString);
    // console.log('parsedDate', parsedDate)
    // Сброс времени на начало дня (00:00:00)
    // const dateAtStartOfDay: Date = startOfDay(new Date(dateString));
    // // console.log('dateAtStartOfDay', dateAtStartOfDay)
    // // Форматирование в ISO строку
    // return dateAtStartOfDay.toString();
    return `${dateString} 00:00:00.000`
}