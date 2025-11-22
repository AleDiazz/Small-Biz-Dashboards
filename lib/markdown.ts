import fs from 'fs'
import path from 'path'

export async function getMarkdownContent(filename: string): Promise<string> {
  const filePath = path.join(process.cwd(), 'legal', filename)
  const fileContents = fs.readFileSync(filePath, 'utf8')
  return fileContents
}

