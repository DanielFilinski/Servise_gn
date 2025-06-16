import fs from 'fs';
import { parse } from 'node-html-parser';
import { testingParseBibleVerseYSS, testingEmptyStringsYSS } from './Tests.js';
import { creatArrParsText, findsBibleLink } from './Service.js';
import { convertResultSS } from './convertors/ConvertSS.js';
import { convertResultYSS } from './convertors/ConvertYSS.js';

// const parsePatternsSS = {
//     weekNumber: "Headers_WEEK_NUM",
//     weekName: "Headers_WEEK_Название-урока",
//     end: "ParaOverride-6",
//     endBlock: "Текстовый-фрейм",


//     all: 'p',

//     // TODO при изменении значениий просмотреть функцию delArtefacts()
//     delete: ['&#160;', '\n', '\t', '&#9;', '#', '&', '•'], // массив элементов которые необходимо удалить из текста , '\t', '\n'

//     arrAnalisisClassList: [
//         { pattern: "Headers_Subheading-1", style: "subTitle" },
//         { pattern: "Lists_Bullet-List", style: "lists" },
//         { pattern: "Lists_Bullet-List-L2", style: "lists" },
//         { pattern: "основной-абзац", style: "mainText" },
//         { pattern: "Headers_Tasks-heading", style: "section" },
//         { pattern: "Pray_response", style: "pray" },
//         { pattern: "Библейский-текст", style: "verseBible" },
//     ],

// }

const parsePatternsSS = {
    weekNumber: "Headers_WEEK_NUM",
    weekName: "Headers_WEEK_Название-урока",
    endBlock: "Текстовый-фрейм",


    all: 'p',

    // TODO при изменении значениий просмотреть функцию delArtefacts()
    delete: ['&#160;', '\n', '\t', '&#9;', '#', '&', '•'], // массив элементов которые необходимо удалить из текста , '\t', '\n'

    arrAnalisisClassList: [
        { pattern: "Headers_Subheading-1", style: "subTitle" },
        { pattern: "Lists_Bullet-List", style: "lists" },
        { pattern: "основной-абзац", style: "mainText" },
        { pattern: "Headers_Tasks-heading", style: "section" },
        { pattern: "РАЗДЕЛ_лев", style: "section" },
        { pattern: "Headers_WEEK_Библейский-текст", style: "verseBible" },
    ],

}

const dateFirstWeek = '2025-06-28' //! дата первого урока
const datesArr = []


//? №№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№
// ? №№№№№№№№№№№№№№№№  HAСТРОЙКИ №№№№№№№№№№№№№№№№№№№№№№
//? №№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№№

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
            case 5: // когда &
                strWithOut = strWithOut.replace(itemReg, '')
                break;
            case 6: // когда &
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

    const htmlFilePaths = [
        // './fileForParse/YSS/25-03.html', //! имя файла
        './fileForParse/YSS/25-02.html', //! имя файла
        

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
            datesArr[i] = getDatePlus(dateFirstWeek, i * 7)
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




    //TODO 3. Удаление всех p до первого урока
    const delPreviousLessonText = (html) => {
        const p = html.querySelector(parsePatternsSS.all)


        if (p.classList.contains(parsePatternsSS.weekNumber)) {

            return 'все объекты удалены'
        } else {
            p.remove()
            delPreviousLessonText(html)
        }
    }

    //TODO 3.1 Удаление всех p после последнего урока
    const delAfterLastLesson = (html) => {
        const arr = html.querySelectorAll(`.${parsePatternsSS.endBlock}`)

        arr[arr.length - 1].remove()
    }

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
                const a = p.innerText.match(/\d{1,2}/)
                if (a) {
                    curLessonNumber = p.innerText.match(/\d{1,2}/)[0]
                    islessonNumber = true
                } else {
                    console.log('p.innerText', p.innerText)
                    console.log('curLessonNumber', curLessonNumber)
                    console.log('p.classList', p.classList)
                }


            }

            // СОХРАНИЯЕМ название недели
            if (p.classList.contains(parsePatternsSS.weekName)) {

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
                    const strObj = { style: analysisClass(p), text: analysisText(str, p) }
                    state[curLessonNumber].arrEl.push(strObj)
                }

            }


        })

    }

    parsing(html)

}


function analysisText(str) {
    let text = str
    let res = findsBibleLink(text)

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


function writeResult() {
    console.log("================================")
    console.log("start testing")
    console.log("================================")
    testingParseBibleVerseYSS(state)
    // testingEmptyStringsYSS(state)
    const RESULT = JSON.stringify(convertResultYSS(state), null, 2)

    const jsonString = JSON.stringify(state, null, 2);
    fs.writeFileSync('./ResultParse/YSS/YSS.json', jsonString, 'utf-8');
    fs.writeFileSync('./ResultParse/YSS/YSS+.json', RESULT, 'utf-8');
    console.log("================================")
    console.log("finish")
    console.log("================================")
}
