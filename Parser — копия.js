import fs from 'fs';
import { parse } from 'node-html-parser';


const parsePatternsSS = {
    delete: ['&#160;'], // массив элементов которые необходимо удалить из текста
    date: '.СШ_Lesson-Number', // дата урока ...далее преобразовывается из например 17 июня => 2023-06-17
    lessonNumber: '.Header_Lesson.CharOverride-5',
    lessonName: ".СШ_Lesson-Name",
    bibleVersesTitle: ".СШ_Lesson-intro-БТИ",
    mainVerses: "", // парсится относительно bibleVersesTitle
    AdditionalVerses: "", // парсится относительно bibleVersesTitle
    memoryVerseTitle: ".СШ_Lesson-intro-ПС",
    memoryVerse: "", // парсится относительно memoryVerseTitle
    meinText: ".Basic-Paragraph"
}

const htmlFilePaths = [
    './fileForParse/Section0013.xhtml',
    './fileForParse/Section0012.xhtml',
    './fileForParse/Section0011.xhtml',
    './fileForParse/Section0010.xhtml',
    './fileForParse/Section0009.xhtml',
    './fileForParse/Section0008.xhtml',
    './fileForParse/Section0007.xhtml',
    './fileForParse/Section0006.xhtml',
    './fileForParse/Section0005.xhtml',

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




//Прочитём файл HTML и проанализируем его, используя cheerio:
const htmlFile = fs.readFileSync('./index.html', 'utf-8');



const parseResultsSS = {

}





const arrReg = parsePatternsSS.delete.map((item) => {
    return new RegExp(`${item}`, "gi");
})


PARSE()

function PARSE() {
    const html = parse(htmlFile)

    const lessonNumber = getLessonNumber(html)
    console.log('lessonNumber :>> ', lessonNumber);

    const dataFirstLesson = getDataFirstLesson(html, lessonNumber)
    console.log('dataFirstLesson :>> ', dataFirstLesson);

    const lessonName = getLessonName(html)
    console.log('lessonName :>> ', lessonName);

    const bibleVersesObj = getBibleVersesTitle(html)
    const bibleVersesTitle = bibleVersesObj.name
    console.log('bibleVersesTitle :>> ', bibleVersesTitle);

    const mainVersesObj = getMainVerses(html, bibleVersesObj.el)
    const mainVerses = mainVersesObj.mainVerses
    const AdditionalVerses = mainVersesObj.AdditionalVerses
    console.log('mainVersesObj :>> ', mainVersesObj);

    const memoryVerseTitleObj = getMemoryVerseTitle(html)
    const memoryVerseTitle = memoryVerseTitleObj.name
    console.log('memoryVerseTitle :>> ', memoryVerseTitle);

    const MemoryVerse = getMemoryVerse(html, bibleVersesObj.el)
    // const mainVerses = mainVersesObj.mainVerses
    // const AdditionalVerses = mainVersesObj.AdditionalVerses
    console.log('MemoryVerse :>> ', MemoryVerse);

    const meinText = getMeinText(html)
    console.log('meinText :>> ', meinText);
}

function getLessonNumber(html) {
    let el = html.querySelector(parsePatternsSS.lessonNumber)
    let number = el.innerText
    el.remove()

    return number
}

function getDataFirstLesson(html, lessonNumber) {
    let el = html.querySelector('.СШ_Lesson-Number')
    let text = el.innerText
    el.remove()
    let rangeDays = text.replace(lessonNumber, '')
    const dayMonth = rangeDays.replace(/–(\d+)/gi, '');
    let date = getDate("18 августа")

    return date
}

function getDate(dayMonth) {

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

    const day = dayMonth.split(" ")[0];
    const monthIndex = monthNames.indexOf(dayMonth.split(" ")[1]);
    let str = `${monthIndex + 1}`
    const m = str.padStart(2, '0')
    const currentYear = new Date().getFullYear();
    const date = new Date(`${currentYear}-${m}-${day}`);
    const formattedDate = date.toISOString().split("T")[0];

    return formattedDate

}

function getLessonName(html) {
    let el = html.querySelector(parsePatternsSS.lessonName)
    let name = el.innerText
    el.remove()

    return name
}

function getBibleVersesTitle(html) {
    let el = html.querySelector(parsePatternsSS.bibleVersesTitle)
    let name = el.innerText

    return { name, el }
}

function getMainVerses(html, el) {

    let obj = {}

    let arr = []
    arr[0] = html.querySelector(`${parsePatternsSS.bibleVersesTitle} + p `)
    arr[1] = html.querySelector(`${parsePatternsSS.bibleVersesTitle} + p + p `)

    const isFind = arr[1].innerText.indexOf('Памятн')

    if (isFind >= 0) {
        let AdditionalVerses

        arrReg.forEach((item) => {
            AdditionalVerses = arr[0].innerText.replace(item, ' ')
        })

        obj = { mainVerses: null, AdditionalVerses }

    } else {

        let mainVerses
        let AdditionalVerses

        arrReg.forEach((item) => {

            mainVerses = arr[0].innerText.replace(item, ' ')
            AdditionalVerses = arr[1].innerText.replace(item, ' ')
        })

        obj = { mainVerses, AdditionalVerses }
    }

    el.remove()
    arr.forEach((item) => {
        item.remove()
    })

    return obj
}


function getMemoryVerseTitle(html) {
    let el = html.querySelector(parsePatternsSS.memoryVerseTitle)
    let name = el.innerText

    return { name, el }
}

function getMemoryVerse(html, el) {
    const elVerses = html.querySelector(`${parsePatternsSS.memoryVerseTitle} + p `)

    let text
    arrReg.forEach((item) => {
        text = elVerses.innerText.replace(item, ' ')
    })

    el.remove()
    elVerses.remove()

    return text
}


function getMeinText(html) {
    let el = html.querySelector(parsePatternsSS.meinText)
}












// // Определяем структуру объекта JSON и извлечём данные из проанализированного HTML:
// const jsonData = {
//     articles: []
// };


// console.log('$ :>> ', $);

// // Извление

// const searchParams = {
//     title: 'h1',
//     paragraph: 'p',
// };



// $('.article').each((index, element) => {
//     const articleTitle = $(element).find('.title').text();
//     const articleURL = $(element).find('.url').attr('href');

//     jsonData.articles.push({
//         title: articleTitle,
//         url: articleURL
//     });
// });


// // Преобразование объект JSON в строку:
// const jsonString = JSON.stringify(jsonData, null, 2);


// // Сохранение данных JSON в файл:
// fs.writeFileSync('./output.json', jsonString, 'utf-8');
