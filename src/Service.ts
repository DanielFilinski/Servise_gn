import _ from 'lodash'


//* Книги Библии в которых только одна глава 720 700 710 640
const arrBiblebook = ["Быт", "Исх", "Лев", "Числ", "Втор", "Нав", "Суд", "Руф", "1 Цар", "2 Цар", "3 Цар", "4 Цар", "1 Пар", "2 Пар", "Ездр", "Неем", "Есф", "Иов", "Пс", "Притч", "Еккл", "Песн", "Ис", "Иер", "Плач", "Иез", "Дан", "Ос", "Иоил", "Амос", "Авд", "Ион", "Мих", "Наум", "Авв", "Соф", "Агг", "Зах", "Мал", "Мф", "Мк", "Лк", "Ин", "Деян", "Иак", "1 Петр", "2 Петр", "1 Ин", "2 Ин", "3 Ин", "Иуд", "Рим", "1 Кор", "2 Кор", "Гал", "Еф", "Флп", "Кол", "1 Фес", "2 Фес", "1 Тим", "2 Тим", "Тит", "Флм", "Евр", "Откр"]
const booksNameNumber = { "Быт": 10, "Исх": 20, "Лев": 30, "Числ": 40, "Втор": 50, "Нав": 60, "Суд": 70, "Руф": 80, "1 Цар": 90, "2 Цар": 100, "3Цар": 110, "4 Цар": 120, "1 Пар": 130, "2 Пар": 140, "Ездр": 150, "Неем": 160, "Есф": 190, "Иов": 220, "Пс": 230, "Притч": 240, "Еккл": 250, "Песн": 260, "Ис": 290, "Иер": 300, "Плач": 310, "Иез": 330, "Дан": 340, "Ос": 350, "Иоил": 360, "Амос": 370, "Авд": 380, "Ион": 390, "Мих": 400, "Наум": 410, "Авв": 420, "Соф": 430, "Агг": 440, "Зах": 450, "Мал": 460, "Мф": 470, "Мк": 480, "Лк": 490, "Ин": 500, "Деян": 510, "Иак": 660, "1 Петр": 670, "2 Петр": 680, "1 Ин": 690, "2 Ин": 700, "3 Ин": 710, "Иуд": 720, "Рим": 520, "1 Кор": 530, "2 Кор": 540, "Гал": 550, "Еф": 560, "Флп": 570, "Кол": 580, "1 Фес": 590, "2 Фес": 600, "1 Тим": 610, "2 Тим": 620, "Тит": 630, "Флм": 640, "Евр": 650, "Откр": 730 } // Будет располагаться объект в котором будут соответсенные названия книг и номера
const oneChapterBooks = [640, 700, 710, 720]
// const arrBiblebook = ["Еф.", "Флм.", "1 Фес."]
// let text = '(Еф. 1:16, см. также Флм. 3, 4; 1 Фес. 1:2; 5:16–18) Иез. 8:16; 20:1–20; 1 Фес. 4:16, 17; вставка в текст (Откр. 12:9) вставка в текст Откр. 12:9; 16:13, 14; 18:4, 5; 20. Основные отрывки: Откр. 14:9–11; 13:15–17. Дополнительные Откр. 12:9 отрывки: Мф. 27:45–50; Лк. 5:18–26; Еф. 2:8–10; Откр. 7:2, 3; 5; 14:4, 12. Прочитайте Откр 12: 9. Кого, согласно Откр. 12:9 и Откр. 12:10 этому стиху, обманывает Откр. 12:9 (обольщает) сатана ? Прочитайте Притч. 14: 12. Какое 1 Тим. 1:1.'
// let text = 'Павел также написал, что он «непрестанно благодарит за вас <span class="italic CharOverride-6">Бога</span>, вспоминая о вас в молитвах» своих (Еф. 1:16, см. также Флм. 3, 4; 1 Фес. 1:2; 5:16–18).</p>'

// const STR = PARSE_BIBLE_REFERENCES(text)
// const ARR = creatArrParsText(STR)
// console.log('ARR', ARR)

// регулярное выражение 
// \s(\d+:\d+(?:–\d+)?(?:,\s*\d+(?:–\d+)?)*(?:;\s*\d+:\d+(?:–\d+)?(?:,\s*\d+(?:–\d+)?))*)\b
const bookName = '\d?\s?[а-яА-Я]+\.\s' // Ис. - книга-точка-пробел
const chapter = '\d+'

export function PARSE_BIBLE_REFERENCES(string) {

    let text = string
    // Быт. 1
    // Быт. 1:2
    // Быт. 1:2-3  
    // Быт. 1:2, 3   
    // знак ; - конец ссылки главы
    // знак ) - конец вставки ссылки в тексте
    // знак . - конец группы ссылок

    // 'Иез. 8:16; 20:1–20; 1 Фес. 4:16, 17; Откр. 12:9; 16:13, 14; 18:4, 5; 20. Основные отрывки: Откр. 14:9–11; 13:15–17. Дополнительные Откр. 12:9 отрывки: Мф. 27:45–50; Лк. 5:18–26; Еф. 2:8–10; Откр. 7:2, 3; 5; 14:4, 12. Прочитайте Откр 12: 9. Кого, согласно Откр. 12:9 и Откр. 12:10 этому стиху, обманывает Откр. 12:9 (обольщает) сатана ? Прочитайте Притч. 14: 12. Какое'

    arrBiblebook.forEach((item, index) => {

        // if (item === "Еф." || item === "Флм.") {
        //     debugger
        // }

        console.log('=============================================================================')
        console.log('=================================', item, '===================================')
        console.log('=============================================================================')

        // let reg = new RegExp(`(${item})`,"gmi");
        // let resReg = text.match(reg)
        // console.log('resReg', resReg)

        // reg = new RegExp(item);
        // resReg = text.match(reg)
        // console.log('resReg', resReg)
        console.log('text', text)
        console.log('item = ', item)

        let resStr = text.indexOf(item)
        let length = item.length

        // if (text.includes('Но их положение до обращения ко Христу в дейст') && item === 'Кол.') {
        //     debugger
        // }

        while (resStr >= 0) {

            resStr = text.indexOf(item)
            length = item.length

            const BOOK_ARR = []
            let originalStringArr = []

            originalStringArr[0] = item

            console.log('начало буква =>', text.at(resStr), 'индекс =>', resStr)
            console.log('resStr', resStr)
            console.log('length', length)

            let arr = []

            for (let i = 0; i < 500; i++) {
                let letter = text.at(resStr + length + i)
                console.log('letter', letter)
                arr.push(letter)
                originalStringArr.push(letter)

                //|| letter === '.'

                if (letter === ';') {

                    //1: если после ; идёт книга без цифры, то  k = 1 => пробел 2 => Первую букву книги
                    //2: если после ; идёт книга с цифрой, то  k = 1 => пробел 2 => цыфру книги 3 => пробел 4 => Первую букву книги
                    //3: если после ; идёт продолжение, то  k = 1 => пробел 2 => цыфру главы 3 => пробел 4 => Первую букву книги

                    let bookWithNumber = text.at(resStr + length + i + 2)
                    console.log('resStr + length + n', resStr + length + i + 2)

                    let bookWithoutNumber = text.at(resStr + length + i + 4)
                    console.log('resStr + length + n', resStr + length + i + 4)

                    if (!bookWithNumber || !bookWithoutNumber) {
                        debugger
                    }

                    console.log('bookWithNumber', bookWithNumber)
                    console.log('bookWithoutNumber', bookWithoutNumber)


                    let reg = /[а-яА-Я]/i

                    if (reg.test(bookWithNumber) || reg.test(bookWithoutNumber)) {

                        console.log('arr', arr)
                        BOOK_ARR.push([item, ...arr.slice(0, -1)])
                        arr = []
                        console.log('конец =>', text.at(resStr + i + length), 'индекс =>', resStr + i + length)

                        break

                    } else {

                        console.log('arr', arr)
                        BOOK_ARR.push([item, ...arr.slice(0, -1)])
                        arr = []
                    }


                }

                if (letter === '.') {

                    BOOK_ARR.push([item, ...arr.slice(0, -1)])
                    arr = []
                    console.log('конец =>', text.at(resStr + i + length), 'индекс =>', resStr + i + length)
                    break
                }
                if (letter === ')') {
                    BOOK_ARR.push([item, ...arr.slice(0, -1)])
                    // originalStringArr = originalStringArr.slice(0, -1)
                    arr = []
                    console.log('конец =>', text.at(resStr + i + length), 'индекс =>', resStr + i + length)
                    break
                }



                if (letter === ' ') {

                    //Следующую букву после пробела
                    let str = text.at(resStr + length + i + 1)
                    console.log(' ПРОБЕЛ resStr + length + i + 1', resStr + length + i + 1)

                    // let bookWithoutNumber = text.at(resStr + length + i + 4)
                    // console.log('resStr + length + n', resStr + length + i + 4)

                    console.log('str', str)

                    let reg = /[а-яА-Я]/i
                    let regAnd = /и/
                    if (reg.test(str) || regAnd.test(str)) {

                        console.log('arr', arr)

                        // Добавляет название книги, и все свойства массива arr кроме последнего
                        BOOK_ARR.push([item, ...arr.slice(0, - 1)])

                        // Удаляет последнее свойство массива в этом случае пробел
                        originalStringArr = originalStringArr.slice(0, -1)
                        console.log('BOOK_ARR', BOOK_ARR)
                        arr = []
                        console.log('конец =>', text.at(resStr + i + length), 'индекс =>', resStr + i + length)

                        break
                    }
                }

                if (text.length === resStr + length + i) {
                    BOOK_ARR.push([item, ...arr.slice(0, -1)])
                    arr = []
                    console.log('конец =>', text.at(resStr + i + length), 'индекс =>', resStr + i + length)
                    break
                }
            }


            const BOOK_ARR_PARSED = []

            BOOK_ARR.forEach((item, index) => {
                BOOK_ARR[index] = item.join('')
            })

            console.log('BOOK_ARR', BOOK_ARR)

            BOOK_ARR_PARSED[0] = originalStringArr.join('')
            // .split("").reverse().join("")

            BOOK_ARR.forEach((item, index) => {


                // разбивает строку на массив по первому пробелу
                let arrName = [item.split(' ', 1).toString(), item.split(' ').slice(1).join(' ')] // разделяеть на две части Откр. 16:13, 14 => Откр. и 16:13, 14
                console.log('arrName', arrName)

                //если первый символ цыфра как 1 Фес. 1:1 то разделение по второму пробелу  
                // console.log('first', Boolean())
                // console.log('first', String(str.at(0)))
                // console.log('first', str.at(0))
                // console.log('first', +str.at(0))
                // console.log('first', typeof str.at(0))
                // console.log('first', typeof +str.at(0))

                if (Number(item.at(0))) {
                    const arr = item.split(' ');
                    arrName = [arr.slice(0, 2).join(' '), arr.slice(2).join(' ')];
                } else {
                    arrName = [item.split(' ', 1).toString(), item.split(' ').slice(1).join(' ')] // разделяеть на две части Откр. 16:13, 14 => Откр. и 16:13, 14

                }

                // удаляет точку в конце названия книги если она есть
                arrName[0] = arrName[0].replace('.', '')

                const bookName = arrName[0]

                //переворачивает название книги 
                // .split("").reverse().join("")

                let chapter = null
                let verses = null

                // разбивает 4:1-2 на массив по ":" если ":" нету возвращаюсь просто главу
                if (arrName[1].indexOf(":") >= 0) {

                    const arrChapter = arrName[1].split(":")
                    chapter = [arrChapter[0]]
                    verses = arrChapter[1]
                } else {
                    // если ":" нету Но есть "," значит глав указано несколько
                    if (arrName[1].indexOf(",") >= 0) {
                        chapter = [arrName[1]]
                    } else {
                        chapter = arrName[1].split(',')
                    }
                }

                BOOK_ARR_PARSED.push({ bookName: bookName, chapter: chapter, verses: verses })

            })


            const jsonObj = JSON.stringify(BOOK_ARR_PARSED)

            console.log('originalStringArr', originalStringArr)
            console.log('originalStringArr', originalStringArr.join(''))
            console.log('BOOK_ARR_PARSED', BOOK_ARR_PARSED)
            console.log('BOOK_ARR_PARSED JSON', jsonObj.split("").reverse().join(""))

            console.log('есть ли в тексте', text.indexOf(originalStringArr.join('')))
            text = text.replace(originalStringArr.join(''), `#${jsonObj.split("").reverse().join("")}#`)

            // let a = jsonObj.split("").reverse().join("")
            // let b = JSON.parse(a.split("").reverse().join(""))
            // console.log('bbbbbbbbb', b[0])
            // console.log('bbbbbbbbb', b[1].bookName)

            console.log('text', text)
        }


    })

    return text
}

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

export const findsBibleLink = (text) => {
    const bibleNames = arrBiblebook.join('|')
    // console.log('bibleNames', bibleNames)
    // const regex = new RegExp(`(${bibleNames})\\s[\\d,\\s,:;–\\,-]+`, 'g')
    // const regex = new RegExp(`(\\d?\\s?${bibleNames})\\.\\s(.*?)(?=\\s?\\d?\\s?[a-zA-Zа-яА-Я])`, 'g')
    // const regex = new RegExp(`(${bibleNames})\\.\\s((\\d(?!\\s[а-яА-Я]))|,|\\s|:|;|–|\\,|-)+`, 'g')
    // const regex = new RegExp(`(${bibleNames})\\.\\s([\\d,\\s,:;–\\,-]+)(?=(\\s\\d\\s[а-яА-Я])|[а-яА-Я])?`, 'g')
    const regex = new RegExp(`(${bibleNames})\\.\\s(.*?)(?=(\\s\\d\\s[а-яА-Я])|(\\s[а-яА-Я])|\\)|\\.|\\?|$)`, 'g')


    return text.replace(regex, execLink);
    console.log('a', a)
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

            console.log('item', item)

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
