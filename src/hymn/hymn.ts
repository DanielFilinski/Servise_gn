import fs from 'fs';
import path from 'path';

const __dirname = path.resolve();
const outputFilePath = path.join(__dirname, 'hymn+.json'); // Выходной файл

async function processFile() {
  try {
    const data = await fs.promises.readFile(path.join(__dirname, 'hymn.json'), 'utf8');
    const hymns = JSON.parse(data);
    const modifiedPlan = hymns.map((item: any, index: number) => {
      const text = item.text
      const arr: any = []
      item.arr.forEach((number: number) => {
        if (number === 0) {
          const str = text.splice(0, 1)
          arr.push({
            type: 'subtitle',
            text: str
          })
        } else {
          const str = text.splice(0, number)
          arr.push({
            type: 'couplet',
            text: str
          })
        }

      })
      return ({
        ...item,
        text: arr,
        arr: undefined,
      })
    })

    await fs.promises.writeFile(outputFilePath, JSON.stringify(modifiedPlan, null, 2), 'utf8');
    console.log('Файл успешно записан!');
  } catch (error) {
    console.error('Ошибка обработки данных:', error);
  }
}

processFile();


