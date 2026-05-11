import axios from 'axios'
import { parseEpub } from './epub-parser'

const API_BASE_URL = process.env.EGW_API_URL ?? 'https://www.alonewithgod.ru/api'

function parseArgs(): { file: string; bookId: number } {
  const args = process.argv.slice(2)
  const get = (flag: string) => {
    const entry = args.find((a) => a.startsWith(`--${flag}=`))
    return entry ? entry.split('=').slice(1).join('=') : undefined
  }

  const file = get('file')
  const bookId = get('bookId')

  if (!file || !bookId) {
    console.error('Usage: npm run egw:update-titles -- --file="book.epub" --bookId=<id>')
    process.exit(1)
  }

  return { file, bookId: Number(bookId) }
}

async function main() {
  const { file, bookId } = parseArgs()
  const api = axios.create({ baseURL: API_BASE_URL, timeout: 120000 })

  console.log(`\n📖 Парсинг EPUB: ${file}`)
  const parsed = await parseEpub(file)

  const withTitles = parsed.chapters.filter((ch) => ch.title)
  console.log(`   Найдено глав: ${parsed.chapters.length}, с названиями: ${withTitles.length}`)

  if (withTitles.length === 0) {
    console.log('\n⚠ Названия глав не найдены в epub. Проверьте файл.')
    process.exit(0)
  }

  console.log('\n📤 Обновление названий на сервере...')
  const res = await api.patch(`/egw-books/${bookId}/chapters/titles`, {
    chapters: parsed.chapters.map((ch) => ({ orderIndex: ch.orderIndex, title: ch.title })),
  })

  console.log(`\n✅ Обновлено: ${res.data.updated} глав`)

  console.log('\nПревью:')
  parsed.chapters.slice(0, 5).forEach((ch) => {
    console.log(`  ${ch.orderIndex + 1}. ${ch.title ?? '(без названия)'}`)
  })
}

main().catch((err) => {
  console.error('\n❌ Ошибка:', err.message)
  process.exit(1)
})
