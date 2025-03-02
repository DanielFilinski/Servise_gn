import { text } from 'express';
import fs from 'fs';
import { parse } from 'node-html-parser';
import { convertResultMR } from './convertors/ConvertMR.js';
import { format, parse as dateParser } from 'date-fns';
import { ru } from 'date-fns/locale';
import { TParseResultMR } from './types/parseResultMR.type.js';
import { testDateLines } from './Tests.js';

const parsePatterns = {
    all: "p",
    delete: ['&#160;', '\n', '\t'], // массив элементов которые необходимо удалить из текста
    delUnnecessaryEl: "", // удаление пустых елементов которые мешают парсерингу
    date: ['Headers_Date'], // дата урока ...далее преобразовывается из например 17 июня => 2023-06-17
    lessonName: ".Headers_DAYName",
    memoryVerse: ".Headers_BibleText", //
    meinText: [".основной-абзац", ".Headers_DropCap"],
}

const htmlFilePaths = [
    './fileForParse/MR/2025.html',
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
    // console.log('html', html)

    const amountDays = getAmountDays(html)
    console.log('amountDays', amountDays)

    remove(html)

    for (let i = 0; i < amountDays; i++) {
        const date = getDateReading(html)
        console.log('date', date)

        const lessonName = getLessonName(html)

        const memoryVerseObj = getMemoryVerse(html)
        const memoryVerse = memoryVerseObj.text
        const meinText = getMeinText(html, memoryVerseObj.el)

        const obj = { date, lessonName, memoryVerse, meinText }
        mainJSON[date] = obj
    }


}

function getAmountDays(html) {
    const arr = html.querySelectorAll(parsePatterns.lessonName)
    return arr.length
}

function remove(html) {
    delUnnecessary(html)
    const arr = html.querySelectorAll(parsePatterns.all)
    arr.forEach((item) => {
        item.innerHtml = delArtefacts(item.innerText)
    })
}

function delUnnecessary(html) {
    let arr = html.querySelectorAll(parsePatterns.delUnnecessaryEl)

    arr.forEach((item) => {
        item.remove()
    })
}

function getDateReading(html) {
    let el = html.querySelector(`.${parsePatterns.date[0]}`)
    let text = el.innerText
    //! Парсим строку в объект Date, добавляя год "2024"
    const parsedDate = dateParser(`${text} 2025`, 'd MMMM yyyy', new Date(), { locale: ru });

    el.remove()
    // Форматируем объект Date в строку "yyyy-MM-dd"
    let date = format(parsedDate, 'yyyy-MM-dd');

    return date
}


function getLessonName(html) {
    let el = html.querySelector(parsePatterns.lessonName)
    let name = null

    name = delArtefacts(el.innerText)

    el.remove()

    return name
}

function getMemoryVerse(html) {
    let el = html.querySelector(parsePatterns.memoryVerse)

    const text = delArtefacts(el.innerText)

    return { text, el }
}

function getMeinText(html, el) {

    const arr = []
    getAllMainText(html, arr)

    let text = arr.join('')
    // text = PARSE_BIBLE_REFERENCES(text)

    el.remove()
    return text
}

function getAllMainText(html, arr) {
    let el = html.querySelector(`${parsePatterns.memoryVerse} + p`)
    // console.log('el', el)
    let text = null

    //    console.log('el.classList', el.classList)
    if (el) {
        if (!el.classList.contains(parsePatterns.date[0])) {

            text = delArtefacts(el.innerText)

            arr.push(text + "\n\n")

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
