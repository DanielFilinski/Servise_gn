import { findsBibleLink, creatArrParsText } from './Service.js';


const text = [
    "Прочитаем следующие библейские стихи: Быт. 3:9–15; 28:15; в которых описано",
    "Опесатка в двоеточии Исх. 29 : 43, 45; в которых описано",
    "Начало Мф. 1:18–23 и 20:25–28 и 2 в которых описано",
    "Везде опечатки кроме первого стиха: Ин. 1:14 – 18; 3:16 ; 14 :1–3. продолжение текста", 
    "Прочитайте следующие библейские стихи: Быт. 3:9–15; 28:15,16 ,17 , 18 .",
]

const res = text.map(item => findsBibleLink(item))

console.log('findsBibleLink', res)

const a = creatArrParsText(res.join(' '))
console.log('creatArrParsText', a)