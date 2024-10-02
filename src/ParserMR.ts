import { text } from 'express';
import fs from 'fs';
import { parse } from 'node-html-parser';
import { convertResultMR } from './convertors/ConvertMR.js';
import { TParseResultMR } from './types/parseResultMR.type.js';
import { testDateLines } from './Tests.js';
import { format, parse as dateParser } from 'date-fns';
import { ru } from 'date-fns/locale';


const parsePatterns = {
    delete: ['&#160;', '\n', '\t'], // массив элементов которые необходимо удалить из текста
    date: 'Headers_Date', // дата урока ...далее преобразовывается из например 17 июня => 2023-06-17
    lessonName: "Headers_DAYName",
    memoryVerse: "Headers_BibleText", //
    meinText: "основной-абзац",
    prayTitle: "Молитва-заголовок",
    prayText: "Молитва-текст",
    endDay: "OriginalPages",
    delElementsArr: ["_idGenObjectLayout-1"],
    all: "p"
}

const htmlFilePaths = [
    './fileForParse/MR/2024.html',

    // Add more file paths as needed
];

const arrBiblebook = ["Быт.", "Исх.", "Лев.", "Числ.", "Втор.", "Нав.", "Суд.", "Руф.", "1 Цар.", "2 Цар.", "3 Цар.", "4 Цар.", "1 Пар.", "2 Пар.", "Ездр.", "Неем.", "Есф.", "Иов", "Пс.", "Притч.", "Еккл.", "Песн.", "Ис.", "Иер.", "Плач.", "Иез.", "Дан.", "Ос.", "Иоил.", "Амос.", "Авд.", "Ион.", "Мих.", "Наум.", "Авв.", "Соф.", "Агг.", "Зах.", "Мал.", "Мф.", "Мк.", "Лк.", "Ин.", "Деян.", "Иак.", "1 Петр.", "2 Петр.", "1 Ин.", "2 Ин.", "3 Ин.", "Иуд.", "Рим.", "1 Кор.", "2 Кор.", "Гал.", "Еф.", "Флп.", "Кол.", "1 Фес.", "2 Фес.", "1 Тим.", "2 Тим.", "Тит.", "Флм.", "Евр.", "Откр."]







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



const parseResults = {

}





const arrReg = parsePatterns.delete.map((item) => {
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
            default:
                alert("Нет таких значений");
        }
    })

    return strWithOut
}

const mainJSON = {}

PARSE()
writeResult()

async function PARSE() {
    const html = parse(htmlFile)

    const amountDays = getAmountDays(html)
    console.log('amountDays', amountDays)

    // получаем все элементы
    const allArr = html.querySelectorAll(parsePatterns.all)

    let date, lessonName, memoryVerse, meinText = ''

    allArr.forEach((p, index) => {
        const className = p.classList

        if (className.contains(parsePatterns.date)) {
            //! Парсим строку в объект Date, добавляя год "2024"
            const parsedDate = dateParser(`${p.innerText} 2024`, 'd MMMM yyyy', new Date(), { locale: ru });

            // Форматируем объект Date в строку "yyyy-MM-dd"
            date = format(parsedDate, 'yyyy-MM-dd');
        }

        if (date === "2024-09-08") {
            console.log('date', date)
        }

        if (className.contains(parsePatterns.lessonName)) {
            lessonName = delArtefacts(p.innerText)
        }

        if (className.contains(parsePatterns.memoryVerse)) {
            memoryVerse = delArtefacts(p.innerText)
        }

        if (className.contains(parsePatterns.meinText)) {
            meinText += delArtefacts(p.innerText)
        }

        if (className.contains(parsePatterns.endDay) || index === allArr.length - 1) {
            console.log(date)
            mainJSON[date] = { date, lessonName, memoryVerse, meinText, prayTitle: '', prayText: '' }
            meinText = ''
        }
    })

}


function getAmountDays(html) {
    const arr = html.querySelectorAll(parsePatterns.lessonName)
    return arr.length
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
    const currentYear = 2024;
    const date = new Date(`${currentYear}-${m}-${day}`);
    const formattedDate = date.toISOString().split("T")[0];

    return formattedDate

}



function getAllMainText(html, arr) {
    let el = html.querySelector(`${parsePatterns.memoryVerse} + p`)
    // console.log('el', el)
    let text = null

    // определяем конец основных обзацев
    const className = parsePatterns.date.replace(".", "")
    console.log('el.classList', el.classList)

    if (!el.classList.contains(className)) {

        text = delArtefacts(el.innerText)

        arr.push(text + "\n")

        el.remove()

        return getAllMainText(html, arr)
    } else {
        return "finish"
    }
}



function writeResult() {
    const jsonString = JSON.stringify(mainJSON, null, 2);
    fs.writeFileSync('./ResultParse/MR/MR.json', jsonString, 'utf-8');
    const data = convertResultMR(mainJSON)
    const RESULT = JSON.stringify(data, null, 2)
    fs.writeFileSync('./ResultParse/MR/MR+.json', RESULT, 'utf-8');
    testNewMR(data)
}


function testNewMR(data: TParseResultMR[]) {
    data.forEach((item, index) => {
        try {
            if (index > 0) {
                const isCorrectSequenceDates = testDateLines(item.date, data[index - 1].date)

                if (!isCorrectSequenceDates) {

                    console.warn('Последовательность дат нарушена:', { data: item.date, id: item.id }, "index:", index)


                }
            }

        } catch (e) {
            console.log('e', e)
        }
    })

}