import fs from 'fs';
import { parse } from 'node-html-parser';


const parsePatternsSS = {
    weekNumber: ".Headers_WEEK_NUM",
    weekName: ".Headers_WEEK_Название-урока",
    end: "ParaOverride-9",

    all: 'p',

    delete: ['&#160;', '\n', '\t', '#', '&'], // массив элементов которые необходимо удалить из текста , '\t', '\n'

    arrAnalisisClassList: [
        { pattern: "Headers_Subheading-1", style: "subTitle" },
        { pattern: "Lists_Bullet-List", style: "lists" },
        { pattern: "Lists_Bullet-List-L2", style: "lists" },
        { pattern: "основной-абзац", style: "mainText" },
    ],
}

const dateFirstWeek = '2023-09-30'
const datesArr = []


//? №№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№
// ? №№№№№№№№№№№№№№№№  HAСТРОЙКИ №№№№№№№№№№№№№№№№№№№№№№
//? №№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№


const partition = {}
const state = {

}

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
// writeResult()





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
    const amoutWeeks = html.querySelectorAll(parsePatternsSS.weekNumber).length


    // 1. Создание массива дат начала недели
    for (let i = 0; i < amoutWeeks; i++) {

        if (i === 0) {
            datesArr[0] = dateFirstWeek
        } else {
            datesArr[i] = getDatePlus(datesArr[i - 1], 1)
        }
    }

    // 2. Cоздание шаблона объекта для заполения данными уроков
    for (let i = 0; i < amoutWeeks; i++) {
        state[i + 1] = {
            dateStart: datesArr[i],
            dateEnd: getDatePlus(datesArr[i], 6),
            lessonName: '',
            lessonNumber: i + 1,
            text: [],
        }
    }




    // 3. Удаление всех p до первого урока
    const delPreviousLessonText = (html) => {
        const p = html.querySelector(parsePatternsSS.all)
        // console.log('p', p)
        const className = parsePatternsSS.weekNumber.replace(".", "")

        if (p.classList.contains(className)) {
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

    // 4. Обработка уроков 
    let curLessonNumber = 1
    let curLessonName = ''
    const parsing = (html) => {
        // 4.1 определение номера урока 
        const p = html.querySelector(parsePatternsSS.all)

        const weekNumber = parsePatternsSS.weekNumber.replace(".", "")
        const weekName = parsePatternsSS.weekName.replace(".", "")

        // номер недели
        if (p.classList.contains(weekNumber)) {
            curLessonNumber = p.innerText.match(/\d{1,2}/)[0]
        }

        // название недели
        if (p.classList.contains(weekName)) {
            curLessonName = delArtefacts(p.innerText)
        }

        // обработка остальных текстов



    }

    parsing(html)



    // for (let i = 0; i < amoutWeeks; i++) {

    // }

    // // const weekNumber = html.

    // // название урочника 

    // const nameBook = html.querySelector(parsePatternsSS.nameBook)

    // // раздетить html на недели []    

    // const arrWeeks = html.querySelectorAll(parsePatternsSS.week)

    // // разделить недели на уроки  []


    // let i = 0 //счетчик для даты 


    // arrWeeks.forEach((item, index) => {

    //     i = 0
    //     store.indexContent = 0

    //     // <h1 class="toc-hidden">Урок 13. 17–23 июня. В сиянии славы Божьей</h1>
    //     const nameWeek = item.querySelector(parsePatternsSS.nameWeek).innerText

    //     // 'В сиянии славы Божьей'
    //     let nameFirstLesson = item.querySelector(parsePatternsSS.firstLessonName).innerText

    //     nameFirstLesson = delArtefacts(nameFirstLesson)

    //     // <div id="_idContainer075" class="_idGenObjectStyleOverride-1">
    //     const weekContent = item.querySelector(parsePatternsSS.weekContent)

    //     // находит абсолютно все "p" и вложенные тоже
    //     const arrWeekAll = weekContent.querySelectorAll(parsePatternsSS.weekAll)

    //     // ['17–23 июня', index: 9, input: 'Урок 13. 17–23 июня. В сиянии славы Божьей', groups: undefined]
    //     // ['26 августа — 1 сентября', index: 9, input: 'Урок 13. 26 августа — 1 сентября. В сиянии славы Божьей', groups: undefined]
    //     let strRangeDateArr = nameWeek.match(/\d{1,2}–\d{1,2}\s[а-я]{1,8}/)

    //     // 
    //     let strDate = null

    //     // вытягивает из 17–23 июня дату первого урока 17 июня
    //     if (strRangeDateArr) {
    //         strDate = strRangeDateArr[0].replace(/–\d{1,2}/, '')
    //     } else {
    //         strDate = nameWeek.match(/\d{1,2}\s[а-я]{1,8}/)[0]
    //         console.log('strDate', strDate)
    //     }

    //     // возвращает дату первого урока => "2023-06-17"
    //     let dateFirstLesson = getDataFirstLesson(strDate, i)

    //     // возвращает номер урока => 13
    //     let curLessonNumber = nameWeek.match(/Урок\s\d{1,2}/)[0].replace('Урок ', '')

    //     // создаёт новый раздел под названием 13 в partition
    //     partition[curLessonNumber] = {}


    //     console.log('arrWeekAll', arrWeekAll.length)

    //     let wasLesson = false

    //     // удаляет точку из класса 
    //     const classFirstLesson = parsePatternsSS.selectFirstLesson.replace(".", "")
    //     const classOtherLesson = parsePatternsSS.selectOtherLesson.replace(".", "")
    //     const otherLessonName = parsePatternsSS.otherLessonName.replace(".", "")

    //     // console.log('arrWeekAll', arrWeekAll)

    //     arrWeekAll.forEach((itemContent, indexContent) => {

    //         const isFirstLesson = itemContent.classList.contains(classFirstLesson)
    //         const isOtherLesson = itemContent.classList.contains(classOtherLesson)
    //         const isOtherLessonName = itemContent.classList.contains(otherLessonName)

    //         // определеяет начало первого урока в неделе и создаёт соответствующий раздел 
    //         if (isFirstLesson) {
    //             partition[curLessonNumber][dateFirstLesson] = {
    //                 lessonNumber: curLessonNumber,
    //                 lessonName: nameFirstLesson,
    //                 isFirstLesson: true,
    //                 arrEl: [],
    //             }
    //             // console.log('partition', partition)
    //             wasLesson = true
    //         }

    //         // определеяет начало последующих уроков в неделе и создаёт соответствующий раздел 
    //         if (isOtherLesson) {
    //             i++
    //             dateFirstLesson = getDataFirstLesson(strDate, i)
    //             partition[curLessonNumber][dateFirstLesson] = {
    //                 lessonNumber: curLessonNumber,
    //                 lessonName: null,
    //                 isFirstLesson: false,
    //                 arrEl: [],
    //             }

    //             wasLesson = true
    //         }

    //         if (isOtherLessonName) {
    //             let text = itemContent.innerText

    //             text = delArtefacts(text)

    //             // arrReg.forEach((itemReg, index) => {
    //             //     if (index < 1) {
    //             //         text = text.replace(itemReg, ' ')
    //             //     } else {
    //             //         text = text.replace(itemReg, '')
    //             //     }
    //             // })
    //             partition[curLessonNumber][dateFirstLesson].lessonName = text
    //         }

    //         // обрабатывает сам контент каждого дня  
    //         if (!isFirstLesson && !isOtherLesson && wasLesson) {
    //             let str = itemContent.innerText

    //             const reg = /[a-zA-Zа-яА-Я0-9]+/gi

    //             // проверка содержит ли строка текст если нет не пушить ее в массив
    //             const isContainText = reg.test(str)


    //             if (isContainText) {
    //                 const classList = itemContent.getAttribute("class")

    //                 str = delArtefacts(str)
    //                 // arrReg.forEach((itemReg, index) => {
    //                 //     if (index < 1) {
    //                 //         str = str.replace(itemReg, ' ')
    //                 //     } else {
    //                 //         str = str.replace(itemReg, '')
    //                 //     }
    //                 // })

    //                 let strObj = transformStr(str, classList, indexContent)
    //                 if (strObj) {
    //                     partition[curLessonNumber][dateFirstLesson].arrEl.push(strObj)
    //                 }


    //             }
    //         }
    //     })
    // })
}

function getDatePlus(date, i) {

    const newDate = new Date(`${date} 12:00`)
    newDate.setDate(newDate.getDate() + i)

    const year = newDate.getFullYear();
    const month = newDate.getMonth() + 1
    const day = newDate.getDate()

    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function transformStr(str, classList, indexContent) {

    let s = { style: null, text: null }

    let isMemoryVerse = false
    // при прохождении заголовка памятного стиха назначает следующий элемент как сам стих
    if (store.indexContent === indexContent) {
        isMemoryVerse = true
        s = { style: "memoryVerse", text: analysisText(str) }
    }

    if (classList.indexOf(parsePatternsSS.intro) >= 0) {

        let isIntroLink = true

        arrStrPatterns.forEach((item, index) => {

            if (str.indexOf(item.pattern) >= 0) {
                s = { style: item.style, text: analysisText(str) }

                isIntroLink = false

                if (index === arrStrPatterns.length - 1) {
                    store.indexContent = indexContent + 1
                }
            }
        })

        if (isIntroLink && !isMemoryVerse) {
            s = { style: analysisClass(classList, str), text: analysisText(str) }
        }

    } else {
        let isHaveWithoutStyle = true
        parsePatternsSS.arrWithoutClassList.forEach((item, index) => {
            if (classList.indexOf(item) >= 0) {
                isHaveWithoutStyle = false
                s = undefined
            }
        })
        if (isHaveWithoutStyle) {
            s = { style: analysisClass(classList, str), text: analysisText(str) }
        }

    }

    return s
}

function analysisClass(classList) {
    let style = classList
    let isHaveStyle = true

    // анализирует приходящий стиль  
    parsePatternsSS.arrAnalisisClassList.forEach((item, index) => {
        if (classList.indexOf(item.pattern) >= 0) {
            style = item.style
            isHaveStyle = false
        }
    })

    // если нету стиля который находится в объекте присваиваит Basic
    if (isHaveStyle) {
        style = 'mainText'
    }

    return style
}

function analysisText(str) {
    let text = str
    let res = PARSE_BIBLE_REFERENCES(text)

    return creatArrParsText(res)
}


function delUnnecessary(html) {
    let arr = html.querySelectorAll(parsePatternsSS.delUnnecessaryEl)
    arr.forEach((item) => {
        item.remove()
    })
}


function getDataFirstLesson(strDate, i) {

    return getDate(strDate, i)
}


// принимает 2023-09-20
// возвращает 2023-09-20+i


// function getDate(dayMonth, i) {

//     const monthNames = [
//         "января",
//         "февраля",
//         "марта",
//         "апреля",
//         "мая",
//         "июня",
//         "июля",
//         "августа",
//         "сентября",
//         "октября",
//         "ноября",
//         "декабря"
//     ];

//     console.log('dayMonth', dayMonth)

//     const day = dayMonth.split(" ")[0];
//     console.log('day', day)
//     const monthIndex = monthNames.indexOf(dayMonth.split(" ")[1]);
//     let str = `${monthIndex + 1}`
//     const m = str.padStart(2, '0')
//     const currentYear = new Date().getFullYear();
//     console.log('currentYear}-${m}-${+day + i}', `${currentYear}-${m}-${+day + i}`)
//     const date = new Date(`${currentYear}-${m}-${+day}`);
//     date.setDate(date.getDate() + i);
//     const formattedDate = date.toISOString().split("T")[0];

//     return formattedDate

// }


function getMeinText(html, el) {

    const arr = []
    getAllMainText(html, arr)

    const text = arr.join('')

    el.remove()
    return text
}

function getAllMainText(html, arr) {
    let el = html.querySelector(`${parsePatternsSS.memoryVerseTitle} + p + p`)
    // console.log('el', el)  
    let text = el.innerText

    //    console.log('el.classList', el.classList)
    if (el) {
        if (!el.classList.contains(parsePatternsSS.lessonDay)) {

            text = delArtefacts(text)

            // arrReg.forEach((item) => {
            //     text = text.replace(item, ' ')
            // })

            arr.push(text + "\n")

            el.remove()

            return getAllMainText(html, arr)
        } else {
            return "finish"
        }
    } else {
        console.log("finish")
        return "finish"
    }

}


function getLessonDayDate(html) {
    let el = html.querySelector(`.${parsePatternsSS.lessonDay}`)
    let text = el.innerText.replace(/^\s+/, "");

    el.remove()
    console.log('text', text)
    let date = getDate(`${text}`)
    console.log('date', date)
    return date
}

function getMainTextLessonDay(html, el) {
    const arr = []
    getAllMainTextLessonDay(html, arr)

    const text = arr.join('')

    el.remove()
    return text
}

function getAllMainTextLessonDay(html, arr) {
    let el = html.querySelector(`${parsePatternsSS.lessonDayTitle} + p`)
    // console.log('el', el)  
    let text = el.innerText
    // console.log('el.classList', el.classList)

    if (el) {
        if (!el.classList.contains(parsePatternsSS.lessonDay)) {

            text = delArtefacts(text)
            // arrReg.forEach((item) => {
            //     text = text.replace(item, ' ')
            // })

            // the string to check
            let regex = /[A-Za-zА-Яа-я0-9]/; // the regular expression to match a letter or digit
            let containsLetterOrDigit = regex.test(el.innerText);
            // console.log('el.innerText', el.innerText)
            // console.log("containsLetterOrDigit", containsLetterOrDigit); // output: true

            if (containsLetterOrDigit) {
                console.log("[A-Za-zА-Яа-я]")
                arr.push(text + "\n")
            }

            el.remove()

            return getAllMainTextLessonDay(html, arr)
        } else {
            return "finish"
        }
    } else {
        console.log("finish")
        return "finish"
    }

}

function writeResult() {
    const jsonString = JSON.stringify(store, null, 2);
    fs.writeFileSync('./ResultParse/YSS/YSS.json', jsonString, 'utf-8');
}



//? ====================================================================================
//? ====================================================================================
//? ====================================================================================
//? ====================================================================================
//? ====================================================================================



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

                    console.log('bookWithNumber', bookWithNumber)
                    console.log('bookWithoutNumber', bookWithoutNumber)


                    let reg = /[а-яА-Я]/i

                    if (reg.test(bookWithNumber) || reg.test(bookWithoutNumber) || bookWithNumber.includes("#")) {

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