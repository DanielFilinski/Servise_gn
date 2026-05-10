import * as path from 'path'
import axios from 'axios'
import { parseEpub } from './epub-parser'
import { uploadCover } from './cover-extractor'

const API_BASE_URL = process.env.EGW_API_URL ?? 'https://www.alonewithgod.ru/api'

function parseArgs(): {
  file: string
  title?: string
  category?: string
  sort?: number
} {
  const args = process.argv.slice(2)
  const get = (flag: string) => {
    const entry = args.find((a) => a.startsWith(`--${flag}=`))
    return entry ? entry.split('=').slice(1).join('=') : undefined
  }

  const file = get('file')
  if (!file) {
    console.error('Usage: npm run egw:import -- --file="book.epub" [--title="Title"] [--category="slug"] [--sort=1]')
    process.exit(1)
  }

  return {
    file,
    title: get('title'),
    category: get('category'),
    sort: get('sort') ? Number(get('sort')) : undefined,
  }
}

async function main() {
  const { file, title, category, sort } = parseArgs()
  const api = axios.create({ baseURL: API_BASE_URL, timeout: 30000 })

  console.log(`\n📖 Парсинг EPUB: ${file}`)
  const parsed = await parseEpub(file)

  const bookTitle = title ?? parsed.title
  console.log(`   Название: ${bookTitle}`)
  console.log(`   Найдено глав: ${parsed.chapters.length}`)

  console.log('\n📤 Создание книги на сервере...')
  const bookRes = await api.post('/egw-books', {
    title: bookTitle,
    categorySlug: category,
    sortOrder: sort ?? 0,
    epubFilename: path.basename(file),
  })
  const bookId: number = bookRes.data.id
  console.log(`   ✓ Книга создана, ID: ${bookId}`)

  if (parsed.cover) {
    console.log('\n🖼  Загрузка обложки...')
    try {
      const coverUrl = await uploadCover(parsed.cover, bookId, API_BASE_URL)
      await api.patch(`/egw-books/${bookId}`, { coverUrl })
      console.log(`   ✓ Обложка: ${coverUrl}`)
    } catch (e) {
      console.warn(`   ⚠ Обложка не загружена: ${(e as Error).message}`)
    }
  }

  console.log('\n📝 Загрузка глав...')
  const BATCH_SIZE = 20
  let uploaded = 0

  for (let i = 0; i < parsed.chapters.length; i += BATCH_SIZE) {
    const batch = parsed.chapters.slice(i, i + BATCH_SIZE)
    await api.post(`/egw-books/${bookId}/chapters`, { chapters: batch })
    uploaded += batch.length
    process.stdout.write(`\r   Загружено: ${uploaded} / ${parsed.chapters.length}`)
  }

  console.log(`\n\n✅ Импорт завершён! Книга ID=${bookId}, глав: ${parsed.chapters.length}`)
  console.log(`   URL: ${API_BASE_URL}/egw-books/${bookId}`)
}

main().catch((err) => {
  console.error('\n❌ Ошибка импорта:', err.message)
  process.exit(1)
})
