
import { parseISO, startOfDay, formatISO } from 'date-fns';
import { TContentER, TOldContentER, TOldItemER, TParseResultER } from '../types/parseResultER.type';

export const convertResultER = (data: TOldContentER): TParseResultER[] => {

    const arr = Object.values(data) as TOldItemER[]
    const result: TParseResultER[] = []

    arr.forEach((day: TOldItemER, index) => {

        const { date, lessonName, ...content } = day

        const data: TParseResultER = {
            id: index + 1,
            date: getDate(date),
            name: lessonName,
            bookNumber: 1,
            content: convertContentSS(content)
        }

        result.push(data)
    })

    return result
}

function convertContentSS(data: Omit<TOldItemER, 'date' | 'lessonName'>): TContent[] {
    const result: TContentER[] = []

    const keys = Object.keys(data)
    // console.log('keys', keys)

    keys.forEach((key: string, index) => {
        const part = data[key]
        const id = index * 100

        const splited = part.split('\n\n')
        // console.log('splited', splited)
        splited.forEach((item, indexItem) => {
            if (item && item.trim().length > 0) {
                result.push({
                    id: id + indexItem,
                    type: key,
                    text: item
                })
            }
        })

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
