import fs from 'fs';
import { parse } from 'node-html-parser';


const parsePatternsSS = {
    weekNumber: "Headers_WEEK_NUM",
    weekName: "Headers_WEEK_Название-урока",
    end: "ParaOverride-9",

    all: 'p',

    delete: ['&#160;', '\n', '\t', '#', '&'], // массив элементов которые необходимо удалить из текста , '\t', '\n'

    arrAnalisisClassList: [
        { pattern: "Headers_Subheading-1", style: "subTitle" },
        { pattern: "Lists_Bullet-List", style: "lists" },
        { pattern: "Lists_Bullet-List-L2", style: "lists" },
        { pattern: "основной-абзац", style: "mainText" },
        { pattern: "Headers_Tasks-heading", style: "section" },
    ],

}

const dateFirstWeek = '2023-09-30'
const datesArr = []


//? №№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№
// ? №№№№№№№№№№№№№№№№  HAСТРОЙКИ №№№№№№№№№№№№№№№№№№№№№№
//? №№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№


const partition = {}
const state = {}

const arrReg = parsePatternsSS.delete.map((item) => {
    return new RegExp(`${item}`, "gi");
})

function delArtefacts(str) {
    let strWithOut = str

    arrReg.forEach((itemReg, index) => {
        switch (index) {
            case 0: // когда &#160;
                strWithOut = strWithOut.replace(itemReg, ' ')
                break;
            case 1: // когда \n
                strWithOut = strWithOut.replace(itemReg, ' ')
                break;
            case 2: // когда \t
                strWithOut = strWithOut.replace(itemReg, '')
                break;
            case 3: // когда #
                strWithOut = strWithOut.replace(itemReg, '')
                break;
            case 4: // когда &
                strWithOut = strWithOut.replace(itemReg, '')
                break;
            default:
                alert("delArtefacts Нет таких значений");
        }
    })

    return strWithOut
}

const arrBiblebook = ["Быт.", "Исх.", "Лев.", "Числ.", "Втор.", "Нав.", "Суд.", "Руф.", "1 Цар.", "2 Цар.", "3 Цар.", "4 Цар.", "1 Пар.", "2 Пар.", "Ездр.", "Неем.", "Есф.", "Иов", "Пс.", "Притч.", "Еккл.", "Песн.", "Ис.", "Иер.", "Плач.", "Иез.", "Дан.", "Ос.", "Иоил.", "Амос.", "Авд.", "Ион.", "Мих.", "Наум.", "Авв.", "Соф.", "Агг.", "Зах.", "Мал.", "Мф.", "Мк.", "Лк.", "Ин.", "Деян.", "Иак.", "1 Петр.", "2 Петр.", "1 Ин.", "2 Ин.", "3 Ин.", "Иуд.", "Рим.", "1 Кор.", "2 Кор.", "Гал.", "Еф.", "Флп.", "Кол.", "1 Фес.", "2 Фес.", "1 Тим.", "2 Тим.", "Тит.", "Флм.", "Евр.", "Откр."]


// const arrBiblebook = ["Еф.", "Флм.", "1 Фес."]
// let text = '(Еф. 1:16, см. также Флм. 3, 4; 1 Фес. 1:2; 5:16–18) Иез. 8:16; 20:1–20; 1 Фес. 4:16, 17; вставка в текст (Откр. 12:9) вставка в текст Откр. 12:9; 16:13, 14; 18:4, 5; 20. Основные отрывки: Откр. 14:9–11; 13:15–17. Дополнительные Откр. 12:9 отрывки: Мф. 27:45–50; Лк. 5:18–26; Еф. 2:8–10; Откр. 7:2, 3; 5; 14:4, 12. Прочитайте Откр 12: 9. Кого, согласно Откр. 12:9 и Откр. 12:10 этому стиху, обманывает Откр. 12:9 (обольщает) сатана ? Прочитайте Притч. 14: 12. Какое 1 Тим. 1:1.'
// let text = 'Павел также написал, что он «непрестанно благодарит за вас <span class="italic CharOverride-6">Бога</span>, вспоминая о вас в молитвах» своих (Еф. 1:16, см. также Флм. 3, 4; 1 Фес. 1:2; 5:16–18).</p>'

// const STR = PARSE_BIBLE_REFERENCES(text)
// const ARR = creatArrParsText(STR)
// console.log('ARR', ARR)


const htmlFile = FILES_FOR_PARSE()
PARSE(htmlFile)
writeResult()





function FILES_FOR_PARSE() {

    const htmlFilePaths = [
        './fileForParse/YSS/YSS.html',

        // Add more file paths as needed
    ];

    // const htmlFilePaths = [
    //     './fileForParse/SS/debuger/index.html',

    //     // Add more file paths as needed
    // ];



    const mergeHtmlFiles = (filePaths, outputPath) => {
        try {
            let mergedHtml = '';

            // Read each HTML file and append its content to the mergedHtml variable
            for (const filePath of filePaths) {
                const htmlContent = fs.readFileSync(filePath, 'utf-8');
                mergedHtml += htmlContent;
            }

            // Write the merged HTML content to the output file
            fs.writeFileSync(outputPath, mergedHtml, 'utf-8');

            console.log('HTML files merged successfully!');
        } catch (error) {
            console.error('Error merging HTML files:', error);
        }
    };



    const outputFilePath = './index.html';

    mergeHtmlFiles(htmlFilePaths, outputFilePath);


    // //Прочитём файл HTML и проанализируем его, используя cheerio:
    const htmlFile = fs.readFileSync('./index.html', 'utf-8');

    return htmlFile
}

function PARSE(htmlFile) {

    const html = parse(htmlFile)

    // количество уроков
    const amoutWeeks = html.querySelectorAll('.' + parsePatternsSS.weekNumber).length


    //TODO 1. Создание массива дат начала недели
    for (let i = 0; i < amoutWeeks; i++) {

        if (i === 0) {
            datesArr[0] = dateFirstWeek
        } else {
            datesArr[i] = getDatePlus(datesArr[i - 1], 1)
        }
    }

    //TODO 2. Cоздание шаблона объекта для заполения данными уроков
    for (let i = 0; i < amoutWeeks; i++) {
        state[i + 1] = {
            dateStart: datesArr[i],
            dateEnd: getDatePlus(datesArr[i], 6),
            lessonName: '',
            lessonNumber: i + 1,
            arrEl: [],
        }
    }

    console.log("state", state)


    //TODO 3. Удаление всех p до первого урока
    const delPreviousLessonText = (html) => {
        const p = html.querySelector(parsePatternsSS.all)
        // console.log('p', p)

        if (p.classList.contains(parsePatternsSS.weekNumber)) {
            console.log('inner', p.innerText)
            console.info('все объекты "p" до первого урока удалены')
            return 'все объекты удалены'
        } else {
            p.remove()
            delPreviousLessonText(html)
        }
    }

    console.log('weeksContentArr.lenght', html.querySelectorAll(parsePatternsSS.all).length)
    delPreviousLessonText(html)
    console.log('weeksContentArr.lenght', html.querySelectorAll(parsePatternsSS.all).length)

    //TODO 4. Обработка уроков
    let curLessonNumber = 1
    const parsing = (html) => {

        //TODO 4.1 обработка массива элементов и разбиение на уроки

        // получение массива всех элементов "p"
        const elementsArr = html.querySelectorAll(parsePatternsSS.all)

        //перебор массива элементов
        elementsArr.forEach((p, pIndex) => {

            let islessonNumber = false
            let islessonName = false

            // СОХРАНЯЕМ номер недели для дальнейшего доступа к объекту по номеру урока
            if (p.classList.contains(parsePatternsSS.weekNumber)) {
                curLessonNumber = p.innerText.match(/\d{1,2}/)[0]
                islessonNumber = true

            }

            // СОХРАНИЯЕМ название недели
            if (p.classList.contains(parsePatternsSS.weekName)) {
                console.log('curLessonNumber', curLessonNumber)
                console.log('state[curLessonNumber]', state[curLessonNumber])
                state[curLessonNumber].lessonName = delArtefacts(p.innerText)
                islessonName = true
            }

            //TODO 4.2 АНАЛИЗ
            if (!islessonNumber && !islessonName) {

                let str = delArtefacts(p.innerText)
                const reg = /[a-zA-Zа-яА-Я0-9]+/gi

                // проверка содержит ли строка текст если нет не пушить ее в массив
                const isContainText = reg.test(str)

                if (isContainText) {
                    // АНАЛИЗ стилей и текста
                    const strObj = { style: analysisClass(p), text: analysisText(str) }
                    state[curLessonNumber].arrEl.push(strObj)
                }

            }


        })

    }

    parsing(html)

}


function analysisText(str) {
    let text = str
    let res = PARSE_BIBLE_REFERENCES(text)
    // let res = text

    return creatArrParsText(res)
}

function analysisClass(p) {

    let style = 'mainText'

    parsePatternsSS.arrAnalisisClassList.some((item, index) => {
        if (p.classList.contains(item.pattern)) {
            style = item.style
            return true
        }
    })

    return style
}

function getDatePlus(date, i) {

    const newDate = new Date(`${date} 12:00`)
    newDate.setDate(newDate.getDate() + i)

    const year = newDate.getFullYear();
    const month = newDate.getMonth() + 1
    const day = newDate.getDate()

    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}




function PARSE_BIBLE_REFERENCES(string) {

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

        if (text.includes('Но их положение до обращения ко Христу в дейст') && item === 'Кол.') {
            debugger
        }

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




function creatArrParsText(text) {
    // "Проявление Его любви в нашей личной жизни открывает миру Его славу — Его\n\t\t\tхарактер. Последнее послание, которое несут три ангела и которое должно быть провозглашено миру,\n\t\t\tпогруженному в духовную тьму, звучит так: «Убойтесь Бога и воздайте Ему славу» (#]}\"7\":\"sesrev\",\"41\":\"retpahc\",\"рктО\":\"emaNkoob\"{,\"7:41 .рктО\"[#)."

    console.log('###########################################################')
    console.log('###########################################################')
    console.log('###########################################################')

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
        // переворачиваем 
        arr.push({ isLink: true, text: rts[1].split("").reverse().join("") })


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





function writeResult() {
    console.log("================================")
    console.log("start testing")
    console.log("================================")
    testingParseBibleVerse(state)
    const jsonString = JSON.stringify(state, null, 2);
    fs.writeFileSync('./ResultParse/YSS/YSS.json', jsonString, 'utf-8');
    console.log("================================")
    console.log("finish")
    console.log("================================")
}





function testingParseBibleVerse(OBJECT) {
    // consts 
    let i = 0
    //? {
    //? "1": {
    //    dateStart: datesArr[i],
    //    dateEnd: getDatePlus(datesArr[i], 6),
    //    lessonName: '',
    //    lessonNumber: i + 1,
    //     "arrEl": [
    //                         {
    //                             "style": "bibleVersesTitle",
    //                             "text": [
    //                                 {
    //                                     "isLink": false,
    //                                     "text": "Библейские отрывки для исследования:"
    //                                 }
    //                             ]
    //                         },
    //                         {
    //                             "style": "mainText",
    //                             "text": [
    //                                 {
    //                                     "isLink": false,
    //                                     "text": ""
    //                                 },
    //                                 {
    //                                     "isLink": true,
    //                                     "text": "[\"Быт. 3:9–15; 28:15;\",{\"bookName\":\"Быт\",\"chapter\":[\"3\"],\"verses\":\"9–15\"},{\"bookName\":\"Быт\",\"chapter\":[\"28\"],\"verses\":\"15\"}]"
    //                                 },
    //                                 {
    //                                     "isLink": false,
    //                                     "text": " "
    //                                 },
    //                                 {
    //                                     "isLink": true,
    //                                     "text": "[\"Исх. 29:43, 45;\",{\"bookName\":\"Исх\",\"chapter\":[\"29\"],\"verses\":\"43, 45\"}]"
    //                                 },
    //                                 {
    //                                     "isLink": false,
    //                                     "text": " "
    //                                 },
    //                                 {
    //                                     "isLink": true,
    //                                     "text": "[\"Мф. 1:18–23;\",{\"bookName\":\"Мф\",\"chapter\":[\"1\"],\"verses\":\"18–23\"}]"
    //                                 },
    //                                 {
    //                                     "isLink": false,
    //                                     "text": " "
    //                                 },
    //                                 {
    //                                     "isLink": true,
    //                                     "text": "[\"Ин. 1:14–18; 3:16; 14:1–3.\",{\"bookName\":\"Ин\",\"chapter\":[\"1\"],\"verses\":\"14–18\"},{\"bookName\":\"Ин\",\"chapter\":[\"3\"],\"verses\":\"16\"},{\"bookName\":\"Ин\",\"chapter\":[\"14\"],\"verses\":\"1–3\"}]"
    //                                 }
    //                             ]
    //                         },
    //                         
    //     },
    //? }
    const keysNumbersLessonArr = Object.keys(OBJECT)

    keysNumbersLessonArr.forEach((key, index) => {
        const itemObj = OBJECT[key]

        const lessonNumber = itemObj.lessonNumber

        // перебирает все элементы текстов в одном уроке
        itemObj.arrEl.forEach((item, index) => {

            //? item =
            //? {
            //?     "style": "mainText",
            //?         "text": [
            //?             {
            //?                 "isLink": false,
            //?                 "text": "Бог, Который стал одним из нас"
            //?             }
            //?         ]
            //? },

            item.text.forEach((itemT, indexT) => {

                //? itemT =
                //? {
                //?     "isLink": false,
                //?     "text": "Бог, Который стал одним из нас"
                //?  }

                if (itemT.isLink) {
                    try {
                        // ["Откр. 21:1–4",{bookName: "Откр" ,chapter:[21],verses:"1–4"}]
                        JSON.parse(itemT.text)
                    } catch (error) {
                        console.log('ошибка № ', i)
                        i++
                        console.log('номер урока ', lessonNumber, 'индекс в массиве', indexT)
                        console.log('сообщение ошибки ССЫЛКИ ', error.message)
                        console.log('===== до исправления', itemT.isLink, ' ', itemT.text)

                        delDontParseItem(itemT, indexT, item.text)

                        console.log('===== после исправления', itemT.isLink, ' ', itemT.text)
                    }
                } else {
                    // if (itemT.text.includes("\\")) {
                    //     console.log('ошибка № ', i)
                    //     i++
                    //     console.log('номер урока ', lessonNumber, 'дата урока ', date, 'индекс в массиве', indexT)
                    //     console.log('сообщение ошибки TEКСТА ')
                    //     console.log('===== до исправления', itemT.isLink, ' ', itemT.text)

                    //     delDontParseItem(itemT, indexT, item.text)

                    //     console.log('===== после исправления', itemT.isLink, ' ', itemT.text)
                    // }

                }
            })

        })

    })

}


function delDontParseItem(itemT, indexT, itemTextArr) {
    itemT.isLink = false
    itemT.text = ''
}