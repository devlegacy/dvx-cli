import { existsSync, lstatSync, readdirSync, rmdirSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'

export function emptyDirSync(path: string) {
  if (!existsSync(path)) return
  const files = readdirSync(path)
  for (const file of files) {
    const curPath = join(path, file)
    if (lstatSync(curPath).isDirectory()) {
      emptyDirSync(curPath)
      rmdirSync(curPath)
    } else {
      unlinkSync(curPath)
    }
  }
}
