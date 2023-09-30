import { text } from 'express';
import fs from 'fs';
import { parse } from 'node-html-parser';


const parsePatterns = {
    all: "p",
    delete: ['&#160;', '\n', '\t'], // массив элементов которые необходимо удалить из текста
    delUnnecessaryEl: ".Basic-Paragraph", // удаление пустых елементов которые мешают парсерингу
    date: ['дата_-right', 'дата_-left'], // дата урока ...далее преобразовывается из например 17 июня => 2023-06-17
    lessonName: ".заголовок",
    memoryVerse: "._стих", //
    meinText: ".ОСНОВНОЙ",
}

const htmlFilePaths = [
    './fileForParse/ER/2023.xhtml',

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
    let el = html.querySelector(`.${parsePatterns.date[0]}, .${parsePatterns.date[1]}`)
    let text = el.innerText
    el.remove()
    let date = getDate(text)

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
        if (!el.classList.contains(parsePatterns.date[0]) && !el.classList.contains(parsePatterns.date[1])) {

            text = delArtefacts(el.innerText)

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

// function getPrayTitle(html){
//     let el = html.querySelector(parsePatterns.prayTitle)
//     let text = null

//     arrReg.forEach((item) => {
//         text = el.innerText.replace(item, ' ')        
//     })

//     return text
// }

// function getPrayText(html){
//     let el = html.querySelector(parsePatterns.prayText)
//     let text = null

//     arrReg.forEach((item) => {
//         text = el.innerText.replace(item, ' ')        
//     })

//     return text
// }


function writeResult() {
    const jsonString = JSON.stringify(mainJSON, null, 2);
    fs.writeFileSync('./ResultParse/ER/ER.json', jsonString, 'utf-8');
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

        console.log('=============================================================================')
        console.log('==================================', item, '====================================')
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
                    originalStringArr = originalStringArr.slice(0, -1)
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
                const arrName = [item.split(' ', 1).toString(), item.split(' ').slice(1).join(' ')] // разделяеть на две части Откр. 16:13, 14 => Откр. и 16:13, 14
                console.log('arrName', arrName)

                // удаляет точку в конце названия книги если она есть
                arrName[0] = arrName[0].replace('.', '')

                //переворачивает название книги 
                const bookName = arrName[0]
                // .split("").reverse().join("")

                let chapter = null
                let verses = null

                // разбивает 4:1-2 на массив по : если : нету возвращаюсь просто главу
                if (arrName[1].indexOf(":") >= 0) {

                    const arrChapter = arrName[1].split(":")
                    chapter = arrChapter[0]
                    verses = arrChapter[1]
                } else {
                    chapter = arrName[1]
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