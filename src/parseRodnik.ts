import fs from 'fs'
import path from 'path'
import { parse, HTMLElement } from 'node-html-parser'

const SOURCE_HTML = '/home/sysadmin/AloneWithGod/Родник хвалы/Rodnik hvaly2.html'
const IMAGES_DIR = '/home/sysadmin/AloneWithGod/Родник хвалы'
const OUTPUT_DIR = path.resolve('./ResultParse/Rodnik')

type TextBlock = { type: 'couplet' | 'chorus' | 'subtitle'; text: string[] }
type Song = { id: number; number: number; name: string; text: TextBlock[] }
type ImageMapEntry = { songNumber: number; images: string[] }

type ParseEvent =
  | { kind: 'title'; text: string }
  | { kind: 'couplet'; lines: string[] }
  | { kind: 'subtitle'; label: string }
  | { kind: 'chorus'; lines: string[] }
  | { kind: 'image'; src: string }

function extractLines(node: HTMLElement): string[] {
  return node.innerHTML
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#160;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)
}

function recurseChildren(node: HTMLElement, events: ParseEvent[]): void {
  for (const child of node.childNodes) {
    if (child instanceof HTMLElement) {
      collectEvents(child, events)
    }
  }
}

function collectEvents(node: HTMLElement, events: ParseEvent[]): void {
  const tag = node.tagName?.toUpperCase()

  if (!tag) {
    recurseChildren(node, events)
    return
  }

  switch (tag) {
    case 'IMG': {
      const src = node.getAttribute('src') ?? ''
      if (src.startsWith('Rodnik')) events.push({ kind: 'image', src })
      return
    }

    case 'H1': {
      // H1 always wraps a song title; collect full text regardless of span classes
      const fullText = node.text.replace(/\s+/g, ' ').trim()
      if (/^\d+\s*\./.test(fullText)) {
        events.push({ kind: 'title', text: fullText })
      }
      return
    }

    case 'SPAN': {
      const cls = node.getAttribute('class') ?? ''
      if (cls.includes('font8')) {
        const text = node.text.replace(/\s+/g, ' ').trim()
        // Allow optional space before dot: "61 .Title"
        if (/^\d+\s*\./.test(text)) events.push({ kind: 'title', text })
        return
      }
      if (cls.includes('font4')) return
      recurseChildren(node, events)
      return
    }

    case 'P': {
      if (node.querySelector('.font8')) {
        recurseChildren(node, events)
        return
      }
      // font7 title (song 86): <p><span class="font7">86. </span>...</p>
      const font7 = node.querySelector('.font7')
      if (font7 && /^\d+\s*\./.test(font7.text.trim())) {
        const fullText = node.text.replace(/\s+/g, ' ').trim()
        events.push({ kind: 'title', text: fullText })
        return
      }
      const font9 = node.querySelector('.font9')
      if (font9) {
        const label = font9.text.replace(/\s+/g, ' ').trim()
        if (label) events.push({ kind: 'subtitle', label })
        const font10 = node.querySelector('.font10')
        if (font10) {
          const lines = extractLines(font10)
          if (lines.length > 0) events.push({ kind: 'chorus', lines })
        }
        return
      }
      const lines = extractLines(node)
      if (lines.length > 0) events.push({ kind: 'couplet', lines })
      return
    }

    default:
      recurseChildren(node, events)
  }
}

function buildSongs(events: ParseEvent[]): { songs: Song[]; imageMap: ImageMapEntry[] } {
  const songs: Song[] = []
  const imageMap: ImageMapEntry[] = []
  let current: Song | null = null
  let currentImages: string[] = []

  function finishCurrent() {
    if (current) {
      songs.push(current)
      imageMap.push({ songNumber: current.number, images: currentImages })
      current = null
      currentImages = []
    }
  }

  for (const ev of events) {
    switch (ev.kind) {
      case 'title': {
        finishCurrent()
        const match = ev.text.match(/^(\d+)\s*\.\s*(.+)$/)
        if (match) {
          const num = parseInt(match[1], 10)
          current = { id: num, number: num, name: match[2].trim(), text: [] }
          currentImages = []
        }
        break
      }
      case 'image':
        currentImages.push(ev.src)
        break
      case 'couplet':
        if (current) current.text.push({ type: 'couplet', text: ev.lines })
        break
      case 'subtitle':
        if (current) current.text.push({ type: 'subtitle', text: [ev.label] })
        break
      case 'chorus':
        if (current) current.text.push({ type: 'chorus', text: ev.lines })
        break
    }
  }

  finishCurrent()
  return { songs, imageMap }
}

function renameImages(imageMap: ImageMapEntry[]): void {
  const renamedDir = path.join(OUTPUT_DIR, 'renamed')
  fs.mkdirSync(renamedDir, { recursive: true })
  let count = 0

  for (const entry of imageMap) {
    entry.images.forEach((originalName, pageIndex) => {
      const padded = entry.songNumber.toString().padStart(3, '0')
      const newName = pageIndex === 0 ? `${padded}.png` : `${padded}_${pageIndex}.png`
      fs.copyFileSync(path.join(IMAGES_DIR, originalName), path.join(renamedDir, newName))
      count++
    })
  }

  console.log(`✓ Скопировано и переименовано: ${count} файлов → ${renamedDir}`)
}

// --- Main ---

const html = fs.readFileSync(SOURCE_HTML, 'utf-8')
const root = parse(html)

const events: ParseEvent[] = []
collectEvents(root, events)

const { songs, imageMap } = buildSongs(events)

const totalImages = imageMap.reduce((sum, e) => sum + e.images.length, 0)
console.log(`Найдено песен: ${songs.length}`)
console.log(`Записей в image map: ${imageMap.length}`)
console.log(`Всего картинок: ${totalImages}`)

fs.mkdirSync(OUTPUT_DIR, { recursive: true })
fs.writeFileSync(path.join(OUTPUT_DIR, 'rodnik_songs.json'), JSON.stringify(songs, null, 2), 'utf-8')
fs.writeFileSync(path.join(OUTPUT_DIR, 'rodnik_image_map.json'), JSON.stringify(imageMap, null, 2), 'utf-8')
console.log(`✓ rodnik_songs.json сохранён (${songs.length} песен)`)
console.log(`✓ rodnik_image_map.json сохранён`)

renameImages(imageMap)
