import fs from 'fs';
import { parse } from 'node-html-parser';
import { compareAsc, format } from "date-fns";
import { testingParseBibleVerseSS, testingEmptyStringsSS } from './Tests.js';
import { creatArrParsText, findNestedLinks, findsBibleLink } from './Service.js';
import { convertResultSS } from './convertors/ConvertSS.js';



const parsePatternsSS = {
    nameBook: "title",
    week: "body",
    nameWeek: ".toc-hidden",
    weekContent: "div",
    weekAll: "p",
    selectFirstLesson: ".СШ_Lesson-Number",
    selectFirstLessonDate: ".СШ_Lesson-Number-DATE",
    selectOtherLesson: ".СШ_DAY_Lesson-Day",
    firstLessonName: ".СШ_Lesson-Name",
    firstLessonNumber: ".Header_Lesson",
    otherLessonName: ".СШ_DAY_Lesson-Day-header",
    intro: "СШ_Lesson-intro",
    arrAnalisisClassList: [
        { pattern: "СШ_Question", style: "question" },
        { pattern: "questions", style: "question" },
        { pattern: "основной-абзац", style: "mainText" },
    ],
    arrWithoutClassList: [
        "СШ_Lesson-Number",
        "СШ_Lesson-Name",
        "СШ_DAY_Lesson-Day-header"
    ],

    all: 'p',
    delUnnecessaryEl: ".Lesson-header_Day_bold",
    delete: ['&#160;', '\n', '\t', '&#9;', '#', '&'], // массив элементов которые необходимо удалить из текста , '\t', '\n'
    date: '.toc-hidden', // дата урока ...далее преобразовывается из например 17 июня => 2023-06-17
    lessonNumber: '.Header_Lesson.CharOverride-5',

    bibleVersesTitle: ".СШ_Lesson-intro-БТИ",
    mainVerses: "", // парсится относительно bibleVersesTitle
    AdditionalVerses: "", // парсится относительно bibleVersesTitle
    memoryVerseTitle: ".СШ_Lesson-intro-ПС",
    memoryVerse: "", // парсится относительно memoryVerseTitle
    meinText: ".Basic-Paragraph",

    lessonDay: "СШ_DAY_Lesson-Day", // используеться для поиска основного текста первого урока
    lessonDayDate: ".Lesson-header_Lesson-Day-number", // дата урока
    lessonDayTitle: ".СШ_DAY_Lesson-Day-header",
    lessonDayMain: ".Basic-Paragraph"
}


const arrStrPatterns = [
    { pattern: "Библейск", style: "bibleVersesTitle" },
    { pattern: "Основн", style: "mainVerses" },
    { pattern: "Дополнительн", style: "AdditionalVerses" },
    { pattern: "Памятн", style: "memoryVerseTitle" },
]

const excludeStyleFromTextArr = [
    "toc-hidden"
]





//? №№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№
// ? №№№№№№№№№№№№№№№№  HAСТРОЙКИ №№№№№№№№№№№№№№№№№№№№№№
//? №№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№


const partition = {}
const store = {
    indexVerses: null  // переменная меняеться когда в классе элемента есть СШ_Lesson-intro тоесть он относиться к стихам 
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
            case 5: // когда &#9;
                strWithOut = strWithOut.replace(itemReg, '')
                break;
            default:
                alert("delArtefacts Нет таких значений");
        }
    })

    return strWithOut
}





const htmlFile = FILES_FOR_PARSE()
PARSE(htmlFile)
writeResult()









function FILES_FOR_PARSE() {

    // const htmlFilePaths = [
    //     './fileForParse/SS/2025-02/L01.html',
    //     './fileForParse/SS/2025-02/L02.html',
    //     './fileForParse/SS/2025-02/L03.html',
    //     './fileForParse/SS/2025-02/L04.html',
    //     './fileForParse/SS/2025-02/L05.html',
    //     './fileForParse/SS/2025-02/L06.html',
    //     './fileForParse/SS/2025-02/L07.html',
    //     './fileForParse/SS/2025-02/L08.html',
    //     './fileForParse/SS/2025-02/L09.html',
    //     './fileForParse/SS/2025-02/L10.html',
    //     './fileForParse/SS/2025-02/L11.html',
    //     './fileForParse/SS/2025-02/L12.html',
    //     './fileForParse/SS/2025-02/L13.html',

    //     // Add more file paths as needed
    // ];

    const htmlFilePaths = [
        './fileForParse/SS/L01.html',
        './fileForParse/SS/L02.html',
        './fileForParse/SS/L03.html',
        './fileForParse/SS/L04.html',
        './fileForParse/SS/L05.html',
        './fileForParse/SS/L06.html',
        './fileForParse/SS/L07.html',
        './fileForParse/SS/L08.html',
        './fileForParse/SS/L09.html',
        './fileForParse/SS/L10.html',
        './fileForParse/SS/L11.html',
        './fileForParse/SS/L12.html',
        './fileForParse/SS/L13.html',

        // Add more file paths as needed
    ];


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

    // название урочника 

    const nameBook = html.querySelector(parsePatternsSS.nameBook)

    // раздетить html на недели []    

    const arrWeeks = html.querySelectorAll(parsePatternsSS.week)
    console.log('arrWeeks', arrWeeks.length)

    // разделить недели на уроки  []


    let i = 0 //счетчик для даты 


    arrWeeks.forEach((item, index) => {

        i = 0
        store.indexContent = 0

        //! номер типа описан ниже в switch
        const typeLessonName: number = 3
        let nameWeek = null
        let strRangeDateArr = null
        // возвращает номер урока => 13
        let curLessonNumber = null
        let weekContent = null

        switch (typeLessonName) {
            case 1:
                //? при полной строке названия
                // <h1 class="toc-hidden">Урок 13. 17–23 июня. В сиянии славы Божьей</h1>
                nameWeek = item.querySelector(parsePatternsSS.nameWeek).innerText;
                // возвращает номер урока => 13
                curLessonNumber = nameWeek.match(/Урок\s\d{1,2}/)[0].replace('Урок ', '');
                // <div id="_idContainer075" class="_idGenObjectStyleOverride-1">
                weekContent = item.querySelector(parsePatternsSS.weekContent);
                // console.log('nameWeek', nameWeek);
                break;
            case 2:
                //? при кратком названии (псле innerText = Урок 130 сентября —6 октября)
                //<p class="СШ_Lesson-Number" lang="ru-RU"><a id="_idTextAnchor000"></a><span
                // class="Header_Lesson" > Урок 1</span > <br />30 сентября —<br />6 октября</p >
                const nameHTML = item.querySelector(parsePatternsSS.selectFirstLesson);
                curLessonNumber = nameHTML.querySelector('span').innerText.match(/\d{1,2}/)[0];
                // console.log('nameHTML', nameHTML);
                nameHTML.querySelector(parsePatternsSS.firstLessonNumber).remove();
                nameWeek = nameHTML.innerText;
                weekContent = item;
                // console.log('nameWeek', nameWeek);
                break;
            case 3:
                //? при кратком названии разделённом на два элемента
                //<p class="СШ_Lesson-Number"><span class="bold">Урок 1</span></span></p>
                //<p class="СШ_Lesson-Number-DATE"><a id="_idTextAnchor001"></a>28 сентября— 4&#160;октября</p>

                const lessonNumber = delArtefacts(item.querySelector(parsePatternsSS.selectFirstLesson).innerText)
                const lessonDate = delArtefacts(item.querySelector(parsePatternsSS.selectFirstLessonDate).innerText)

                console.log('lessonNumber', lessonNumber)
                console.log('lessonDate', lessonDate)


                curLessonNumber = lessonNumber.match(/\d{1,2}/)[0];
                nameWeek = lessonDate;
                weekContent = item;
                // console.log('nameWeek', nameWeek);
                // item.querySelector(parsePatternsSS.selectFirstLesson).remove()
                // item.querySelector(parsePatternsSS.selectFirstLessonDate).remove()

                break;
            default:
                alert("Неизвестный формат названия урока");
        }



        // 'В сиянии славы Божьей'
        let nameFirstLesson = item.querySelector(parsePatternsSS.firstLessonName).innerText

        nameFirstLesson = delArtefacts(nameFirstLesson)


        console.log('strRangeDateArr', strRangeDateArr)

        debugger

        // находит абсолютно все "p" и вложенные тоже
        const arrWeekAll = weekContent.querySelectorAll(parsePatternsSS.weekAll)
        // console.log('arrWeekAll', arrWeekAll)

        // ['17–23 июня', index: 9, input: 'Урок 13. 17–23 июня. В сиянии славы Божьей', groups: undefined]
        // ['26 августа — 1 сентября', index: 9, input: 'Урок 13. 26 августа — 1 сентября. В сиянии славы Божьей', groups: undefined]
        strRangeDateArr = nameWeek.match(/\d{1,2}\s?–\s?\d{1,2}\s[а-я]{1,8}/)

        console.log('strRangeDateArr', strRangeDateArr)
        // 
        let strDate = null

        // вытягивает из 17–23 июня дату первого урока 17 июня
        if (strRangeDateArr) {
            strDate = strRangeDateArr[0].replace(/–\s?\d{1,2}/, '')
        } else {
            strDate = nameWeek.match(/\d{1,2}\s?[а-я]{1,8}/)[0]
            console.log('strDate', strDate)
        }

        console.log('strDate', strDate)
        // возвращает дату первого урока => "2023-06-17"
        let dateFirstLesson = getDataFirstLesson(strDate, i)
        console.log('dateFirstLesson', dateFirstLesson)


        // создаёт новый раздел под названием 13 в partition
        partition[curLessonNumber] = {}


        console.log('arrWeekAll', arrWeekAll.length)

        let wasLesson = false

        // удаляет точку из класса 
        const classFirstLesson = parsePatternsSS.selectFirstLessonDate.replace(".", "")
        const classOtherLesson = parsePatternsSS.selectOtherLesson.replace(".", "")
        const otherLessonName = parsePatternsSS.otherLessonName.replace(".", "")

        // console.log('arrWeekAll', arrWeekAll)
        // if (!nameWeek || !strRangeDateArr || !curLessonNumber || !weekContent) {
        //     console.warn("nameWeek || strRangeDateArr || curLessonNumber || weekContent", nameWeek, strRangeDateArr, curLessonNumber, weekContent)
        // }

        arrWeekAll.forEach((itemContent, indexContent) => {

            const isFirstLesson = itemContent.classList.contains(classFirstLesson)
            const isOtherLesson = itemContent.classList.contains(classOtherLesson)
            const isOtherLessonName = itemContent.classList.contains(otherLessonName)

            // определеяет начало первого урока в неделе и создаёт соответствующий раздел 
            if (isFirstLesson) {
                console.log('dateFirstLesson 1', dateFirstLesson)

                partition[curLessonNumber][dateFirstLesson] = {
                    lessonNumber: curLessonNumber,
                    lessonName: nameFirstLesson,
                    isFirstLesson: true,
                    arrEl: [],
                }
                // console.log('partition', partition)
                wasLesson = true

            }

            // определеяет начало последующих уроков в неделе и создаёт соответствующий раздел 
            if (isOtherLesson) {
                i++
                // dateFirstLesson = getDataFirstLesson(strDate, i)
                console.log('dateFirstLesson 2', dateFirstLesson)

                dateFirstLesson = convertDate(itemContent.innerText)
                partition[curLessonNumber][dateFirstLesson] = {
                    lessonNumber: curLessonNumber,
                    lessonName: null,
                    isFirstLesson: false,
                    arrEl: [],
                }

                wasLesson = true
            }

            if (isOtherLessonName) {
                let text = itemContent.innerText

                text = delArtefacts(text)

                // arrReg.forEach((itemReg, index) => {
                //     if (index < 1) {
                //         text = text.replace(itemReg, ' ')
                //     } else {
                //         text = text.replace(itemReg, '')
                //     }
                // })

                partition[curLessonNumber][dateFirstLesson].lessonName = text
            }

            // обрабатывает сам контент каждого дня  
            if (!isFirstLesson && !isOtherLesson && wasLesson) {
                let str = itemContent.innerText

                const reg = /[a-zA-Zа-яА-Я0-9]+/gi

                // проверка содержит ли строка текст если нет не пушить ее в массив
                const isContainText = reg.test(str)


                if (isContainText) {
                    const classList = itemContent.getAttribute("class")

                    str = delArtefacts(str)
                    // arrReg.forEach((itemReg, index) => {
                    //     if (index < 1) {
                    //         str = str.replace(itemReg, ' ')
                    //     } else {
                    //         str = str.replace(itemReg, '')
                    //     }
                    // })

                    let strObj = transformStr(str, classList, indexContent)
                    if (strObj) {
                        partition[curLessonNumber][dateFirstLesson].arrEl.push(strObj)
                    }


                }
            }
        })
    })
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

        // let isStyle = true
        // // ИСКЛЮЧНИЕ элементов с определёнными стилями
        // excludeStyleFromTextArr.forEach(item => {
        //     if (classList.indexOf(item) >= 0) {
        //         isStyle = false
        //     }
        // })

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
    let res = findsBibleLink(text)

    console.log('analysisTex::::', str)
    console.log('res', res)
    const a = creatArrParsText(res)
    console.log('a', a)

    return a
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

// Принимает строку "Воскресенье, 1 октября"
// Возвращает строку "2023-10-01"
function convertDate(string) {

    const months = {
        января: '01',
        февраля: '02',
        марта: '03',
        апреля: '04',
        мая: '05',
        июня: '06',
        июля: '07',
        августа: '08',
        сентября: '09',
        октября: '10',
        ноября: '11',
        декабря: '12'
    };

    // Разделим входную строку по запятой и пробелу
    const [dayName, date] = string.split(', ');

    // Разделим деньМесяца на число и название месяца
    const [day, month] = date.split(' ');

    const m = `${month}`
    // Получим числовое значение месяца из объекта месяцы
    const monthNumber = months[m.toLowerCase()];

    if (!monthNumber) {
        console.log('first')
    }

    // Создадим и вернем отформатированную строку даты "YYYY-MM-DD"
    return `2025-${monthNumber}-${day.padStart(2, '0')}`;
}



function getDate(dayMonth, i) {

    const monthNames = [
        "января",
        "февраля",
        "марта",
        "апреля",
        "мая",
        "июня",
        "июля",
        "августа",
        "сентября",
        "октября",
        "ноября",
        "декабря"
    ];

    console.log('dayMonth', dayMonth)

    const day = dayMonth.split(" ")[0];
    console.log('day', day)
    const monthIndex = monthNames.indexOf(dayMonth.split(" ")[1]);
    let str = `${monthIndex + 1}`
    const m = str.padStart(2, '0')
    const currentYear = 2025
    console.log('currentYear}-${m}-${+day + i}', `${currentYear}-${m}-${+day + i}`)
    const date = new Date(`${currentYear}-${m}-${+day}`);
    date.setDate(date.getDate() + i);

    if (!m) {
        console.log('first')
    }


    const formattedDate = format(date, "yyyy-MM-dd")

    return formattedDate

}



function writeResult() {
    console.log("================================")
    console.log("start testing")
    console.log("================================")
    
    // Существующие тесты
    testingParseBibleVerseSS(partition)
    // testingEmptyStringsSS(partition)
    
    const RESULT = JSON.stringify(convertResultSS(partition), null, 2)
    findNestedLinks(JSON.parse(RESULT))
    const jsonString = JSON.stringify(partition, null, 2);
    fs.writeFileSync('./ResultParse/SS/SS.json', jsonString, 'utf-8');
    fs.writeFileSync('./ResultParse/SS/SS+.json', RESULT, 'utf-8');
    console.log("================================")
    console.log("finish 2.0")
    console.log("================================")
    console.log("\n💡 Для валидации библейских ссылок запустите: npm run validate\n")
}