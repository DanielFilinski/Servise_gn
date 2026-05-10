import * as fs from 'fs'
import * as path from 'path'
import { parse } from 'node-html-parser'

// epub2 is a CommonJS package: npm install epub2
// eslint-disable-next-line @typescript-eslint/no-var-requires
const EPub = require('epub2')

export type ParsedChapter = {
  orderIndex: number
  title: string | undefined
  contentHtml: string
  contentText: string
}

export type ParsedBook = {
  title: string
  creator?: string
  cover?: Buffer
  chapters: ParsedChapter[]
}

function cleanHtml(raw: string): string {
  const root = parse(raw)

  // remove epub-specific nav elements
  root.querySelectorAll('nav, [epub\\:type="toc"]').forEach((el) => el.remove())

  // remove script/style
  root.querySelectorAll('script, style').forEach((el) => el.remove())

  // strip inline style attributes that break react-native-render-html
  root.querySelectorAll('[style]').forEach((el) => el.removeAttribute('style'))
  root.querySelectorAll('[class]').forEach((el) => el.removeAttribute('class'))

  return root.innerHTML
}

function htmlToText(html: string): string {
  return parse(html).textContent.replace(/\s+/g, ' ').trim()
}

export async function parseEpub(filePath: string): Promise<ParsedBook> {
  const absPath = path.resolve(filePath)
  if (!fs.existsSync(absPath)) throw new Error(`File not found: ${absPath}`)

  const epub = new EPub(absPath)

  await new Promise<void>((resolve, reject) => {
    epub.on('end', resolve)
    epub.on('error', reject)
    epub.parse()
  })

  const chapters: ParsedChapter[] = []
  let orderIndex = 0

  for (const item of epub.spine.contents) {
    if (!item.id) continue

    const rawHtml: string = await new Promise((resolve, reject) => {
      epub.getChapter(item.id, (err: Error, text: string) => {
        if (err) reject(err)
        else resolve(text)
      })
    })

    if (!rawHtml || rawHtml.trim().length < 50) continue

    const contentHtml = cleanHtml(rawHtml)
    const contentText = htmlToText(contentHtml)

    if (contentText.length < 50) continue

    const tocEntry = epub.toc.find((t: any) => t.id === item.id)
    const title = tocEntry?.title?.trim() || undefined

    chapters.push({ orderIndex: orderIndex++, title, contentHtml, contentText })
  }

  let cover: Buffer | undefined
  if (epub.metadata.cover) {
    cover = await new Promise<Buffer>((resolve, reject) => {
      epub.getImage(epub.metadata.cover, (err: Error, data: Buffer) => {
        if (err) reject(err)
        else resolve(data)
      })
    }).catch(() => undefined)
  }

  return {
    title: epub.metadata.title || 'Без названия',
    creator: epub.metadata.creator,
    cover,
    chapters,
  }
}
