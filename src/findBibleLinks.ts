interface BibleReference {
  book: string;
  chapter: number;
  verses: number[];
}

const BIBLE_BOOKS = [
  'Быт', 'Исх', 'Лев', 'Чис', 'Втор', 'Нав', 'Суд', 'Руф', '1Цар', '2Цар', '3Цар', '4Цар',
  '1Пар', '2Пар', 'Ездр', 'Неем', 'Есф', 'Иов', 'Пс', 'Прит', 'Еккл', 'Песн', 'Ис', 'Иер',
  'Плач', 'Иез', 'Дан', 'Ос', 'Иоил', 'Ам', 'Авд', 'Иона', 'Мих', 'Наум', 'Авв', 'Соф', 'Агг',
  'Зах', 'Мал', 'Мф', 'Мк', 'Лк', 'Ин', 'Деян', 'Рим', '1Кор', '2Кор', 'Гал', 'Еф', 'Флп',
  'Кол', '1Фес', '2Фес', '1Тим', '2Тим', 'Тит', 'Флм', 'Евр', 'Иак', '1Пет', '2Пет', '1Ин',
  '2Ин', '3Ин', 'Иуд', 'Откр'
];

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseVerses(verseStr: string): number[] {
  const verses: number[] = [];
  const parts = verseStr.split(/[,;]/);
  
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    
    if (trimmed.includes('-') || trimmed.includes('–')) {
      const [start, end] = trimmed.split(/[-–]/).map(v => parseInt(v.trim()));
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) {
          verses.push(i);
        }
      }
    } else {
      const verse = parseInt(trimmed);
      if (!isNaN(verse)) {
        verses.push(verse);
      }
    }
  }
  
  return verses;
}

function extractReferences(text: string): BibleReference[] {
  const references: BibleReference[] = [];
  const bookPattern = BIBLE_BOOKS.map(escapeRegex).join('|');
  
  // Основной паттерн для поиска ссылок
  const mainRegex = new RegExp(`(${bookPattern})\\.?[ \t\n\r]*([0-9]+)[ \t\n\r]*:[ \t\n\r]*([0-9,; \t\n\r\-–]+)`, 'g');
  
  // Паттерн для поиска дополнительных глав без стихов
  const chapterRegex = new RegExp(`(?:^|[ \t\n\r])(${bookPattern})\\.?[ \t\n\r]*([0-9]+)(?![ \t\n\r]*:)`, 'g');
  
  let match;
  let lastIndex = 0;
  
  // Сначала ищем полные ссылки (книга:глава:стихи)
  while ((match = mainRegex.exec(text)) !== null) {
    const [fullMatch, book, chapter, verses] = match;
    lastIndex = match.index + fullMatch.length;
    
    references.push({
      book: book.trim(),
      chapter: parseInt(chapter),
      verses: parseVerses(verses)
    });
  }
  
  // Затем ищем одиночные главы в оставшемся тексте
  const remainingText = text.slice(lastIndex);
  while ((match = chapterRegex.exec(remainingText)) !== null) {
    const [fullMatch, book, chapter] = match;
    
    // Проверяем, не является ли это частью уже найденной ссылки
    const isPartOfExistingRef = references.some(ref => 
      ref.book === book.trim() && ref.chapter === parseInt(chapter)
    );
    
    if (!isPartOfExistingRef) {
      references.push({
        book: book.trim(),
        chapter: parseInt(chapter),
        verses: []
      });
    }
  }
  
  return references;
}

export function findBibleLinks(text: string): BibleReference[] {
  // Разбиваем текст на предложения для более точного поиска
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  const allReferences: BibleReference[] = [];
  
  for (const sentence of sentences) {
    console.log('SENTENCE:', sentence);
    const refs = extractReferences(sentence);
    console.log('REFS:', refs);
    allReferences.push(...refs);
  }
  
  // Удаляем дубликаты
  return allReferences.filter((ref, index, self) =>
    index === self.findIndex(r => 
      r.book === ref.book && 
      r.chapter === ref.chapter && 
      JSON.stringify(r.verses) === JSON.stringify(ref.verses)
    )
  );
}

// Test
const testText = `
    Текст Пс. 72: 23-26; 2 Кор. 6:16;1 Кор 1:4 далее.
    Прочитаем следующие библейские стихи: Быт. 3:9–15; 28:15; в которых описано.
    Опесатка в двоеточии Исх. 29 : 43, 45; в которых описано.
    Начало Мф. 1:18–23 и 20:25–28 и 2 в которых описано.
    Везде опечатки кроме первого стиха: Ин. 1:14 – 18; 3:16 ; 14 :1–3. продолжение текстаё. Прочитайте следующие библейские стихи: Быт. 3:9–15; 28:15,16 ,17 , 18 .  
    Дополнительные стихи: Быт. 17:10, 11; 22:11, 15–18; Исх. 6:3; 18:3, 4; Иоил. 2:32.
    Основной отрывок: Исх. 11:1–10; 12:1–30; 13:14–16.
`;

console.log(JSON.stringify(findBibleLinks(testText), null, 2));
