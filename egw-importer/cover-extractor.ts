import * as fs from 'fs'
import * as path from 'path'
import * as https from 'https'
import * as http from 'http'
import FormData from 'form-data'

export async function uploadCover(
  coverBuffer: Buffer,
  bookId: number,
  apiBaseUrl: string,
): Promise<string> {
  const ext = 'jpg'
  const filename = `egw-cover-${bookId}.${ext}`
  const tmpPath = path.join('/tmp', filename)

  fs.writeFileSync(tmpPath, coverBuffer)

  const form = new FormData()
  form.append('file', fs.createReadStream(tmpPath), {
    filename,
    contentType: 'image/jpeg',
  })

  const uploadUrl = `${apiBaseUrl}/images/upload-egw-cover/${bookId}`
  const coverUrl = await new Promise<string>((resolve, reject) => {
    const req = (uploadUrl.startsWith('https') ? https : http).request(
      uploadUrl,
      { method: 'POST', headers: form.getHeaders() },
      (res) => {
        let data = ''
        res.on('data', (chunk) => (data += chunk))
        res.on('end', () => {
          try {
            const json = JSON.parse(data)
            resolve(json.url ?? json.coverUrl)
          } catch {
            reject(new Error(`Upload failed: ${data}`))
          }
        })
      },
    )
    req.on('error', reject)
    form.pipe(req)
  })

  fs.unlinkSync(tmpPath)
  return coverUrl
}
