

export function testingParseBibleVerseSS(OBJECT) {
    // consts 
    let i = 0
    //? {
    //? "1": {
    //     "2023-09-30": {
    //         "lessonNumber": "1",
    //             "lessonName": "Божья миссия и мы (часть 1)",
    //                 "isFirstLesson": true,
    //                     "arrEl": [
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

        // keys даты уроков 
        const keysDateLessonArr = Object.keys(itemObj)

        keysDateLessonArr.forEach((key, index) => {
            const date = key
            const lessonNumber = itemObj[key].lessonNumber

            // перебирает все элементы текстов в одном уроке
            itemObj[key].arrEl.forEach((item, index) => {

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
                            const dataArr = JSON.parse(itemT.text)
                            const bookName = dataArr[1].bookName
                            const chapter = dataArr[1].chapter
                            const verses = dataArr[1].verses

                            if (typeof dataArr[0] !== "string") {
                                throw Error("текст ссылки не являеться строкой")
                            }

                        } catch (error) {
                            console.log('ошибка № ', i)
                            i++
                            console.log('номер урока ', lessonNumber, 'дата урока ', date, 'индекс в массиве', indexT)
                            console.log('сообщение ошибки ССЫЛКИ ', error.message)
                            console.log('===== до исправления', itemT.isLink, 'itemT.text', itemT.text)

                            delDontParseItem(itemT)

                            console.log('===== после исправления', itemT.isLink, 'itemT.text', itemT.text)
                        }
                    } else {

                        const isString = checkString(itemT.text)

                        // Проверка на сиволы
                        if (!isString) {
                            console.log('ошибка № ', i)
                            i++
                            console.log('номер урока ', lessonNumber, 'дата урока ', date, 'индекс в массиве', indexT)
                            console.log('сообщение ошибки НЕ ссылки (найдены знаки) ')
                            console.log('===== до исправления', itemT.isLink, 'itemT.text', itemT.text)

                            delDontParseItem(itemT)

                            console.log('===== после исправления', itemT.isLink, 'itemT.text', itemT.text)

                        }


                        // Проверка пустая ли строка
                        // if (item.style === "question" && checkIsEmptyString(itemT.text)) {
                        //     console.log('ошибка № ', i)
                        //     i++
                        //     console.log('номер урока ', lessonNumber, 'дата урока ', date, 'индекс в массиве', indexT)
                        //     console.log('сообщение ошибки НЕ ссылки (найдены пустые строки)')
                        //     console.log('===== до исправления', itemT.isLink, 'itemT.text', itemT.text)

                        //     delDontParseItem(itemT)

                        //     console.log('===== после исправления', itemT.isLink, 'itemT.text', itemT.text)
                        // }

                        // создаём проверку НЕ содержит ли случайно строка(т.е когда isLink = false) 

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


                    // удаляем елементы с пустым текстом
                    let condition = (element) => {
                        return element.text !== '' && element.text !== null
                    };
                    item.text = item.text.filter(condition);


                })

            })
            itemObj[key].arrEl = itemObj[key].arrEl.filter((element) => {
                return element.text.length !== 0
            });
        })
    })

    if (i === 0) {
        console.log('Ошибок не было найдено')
    }

}
export async function testingEmptyStringsSS(OBJECT) {
    // consts 
    let i = 0
    //? {
    //? "1": {
    //     "2023-09-30": {
    //         "lessonNumber": "1",
    //             "lessonName": "Божья миссия и мы (часть 1)",
    //                 "isFirstLesson": true,
    //                     "arrEl": [
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

        // keys даты уроков 
        const keysDateLessonArr = Object.keys(itemObj)

        keysDateLessonArr.forEach((key, index) => {
            const date = key
            const lessonNumber = itemObj[key].lessonNumber

            // перебирает все элементы текстов в одном уроке
            itemObj[key].arrEl.forEach((item, index) => {

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

                    if (!itemT.isLink) {
                        if (item.text === '') {
                            console.log('ошибка № ', i)
                            i++
                            console.log('номер урока ', lessonNumber, 'дата урока ', date, 'индекс в массиве', indexT)
                            console.log('===== до исправления', itemT.isLink, 'itemT.text', itemT.text)

                            delDontParseItem(itemT)

                            console.log('===== после исправления', itemT.isLink, 'itemT.text', itemT.text)


                        }

                    } else {

                        const isString = checkString(itemT.text)

                        if (!isString) {
                            console.log('ошибка № ', i)
                            i++
                            console.log('номер урока ', lessonNumber, 'дата урока ', date, 'индекс в массиве', indexT)
                            console.log('сообщение ошибки НЕ ссылки ')
                            console.log('===== до исправления', itemT.isLink, 'itemT.text', itemT.text)

                            delDontParseItem(itemT)

                            console.log('===== после исправления', itemT.isLink, 'itemT.text', itemT.text)

                        }

                        // создаём проверку НЕ содержит ли случайно строка(т.е когда isLink = false) 

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
    })

    if (i = 0) {
        console.log("Ошибок найдено не было")
    }

}

async function isDel() {
    console.log("Начало выполнения функции...");

    // Запрос подтверждения
    const answer = await confirm("Продолжить выполнение? (y/n): ");

    if (answer.toLowerCase() === 'y') {
        console.log("Пользователь подтвердил продолжение...");
        // Тут логика, которая выполняется после подтверждения
        return true
    } else {
        console.log("Пользователь отменил действие.");
        return false
    }

    console.log("Завершение работы функции.");


}


function checkString(s) {
    const specialCharacters = ["{", `\\`, "}"];
    for (let i = 0; i < s.length; i++) {
        if (specialCharacters.includes(s[i])) {
            return false;
        }
    }
    return true;
}

function checkIsEmptyString(s) {
    if (s === "") {
        return true
    }
    return false
}


function delDontParseItem(itemT) {
    itemT.isLink = false
    itemT.text = null
}




export function testingParseBibleVerseYSS(OBJECT) {
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
                        const dataArr = JSON.parse(itemT.text)
                        const bookName = dataArr[1].bookName
                        const chapter = dataArr[1].chapter
                        const verses = dataArr[1].verses

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

    if (i === 0) {
        console.log('Ошибок не было найдено')
    }

}

export function testingEmptyStringsYSS(OBJECT) {
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

                // ПРОВЕРЯЕМ только тексты не относящиеся к ссылкам
                if (!itemT.isLink) {
                    try {
                        // ["Откр. 21:1–4",{bookName: "Откр" ,chapter:[21],verses:"1–4"}]
                        const dataArr = JSON.parse(itemT.text)
                        const bookName = dataArr[1].bookName
                        const chapter = dataArr[1].chapter
                        const verses = dataArr[1].verses

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

export function testDateLines(date1Str: string, date2Str: string) {
    // Преобразуем строковые даты в объекты Date
    const date1 = new Date(date1Str);
    const date2 = new Date(date2Str);

    // Вычисляем разницу в миллисекундах между двумя датами
    const differenceInMilliseconds = Math.abs(date2.getTime() - date1.getTime());


    // Переводим разницу в миллисекундах в дни
    const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);

    // Проверяем, больше ли разница одного дня
    if (differenceInDays > 1) {
        console.log(`Разница между датами больше одного дня: ${differenceInDays} дн.`);
        return false
    } else {
        return true
    }
}