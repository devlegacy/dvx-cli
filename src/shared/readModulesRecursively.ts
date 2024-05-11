import type { Class } from 'type-fest'
import { opendir } from 'node:fs/promises'

// Inspired: https://github.com/L2jLiga/fastify-decorators/blob/v4/lib/bootstrap/bootstrap.ts
export async function* readModulesRecursively(
  parentUrl: URL,
  mask: RegExp,
): AsyncIterable<Record<string, Class<unknown>>> {
  for await (const dirent of await opendir(parentUrl)) {
    const fullFilePath = new URL(dirent.name, parentUrl + '/')
    if (dirent.isDirectory()) {
      yield* readModulesRecursively(fullFilePath, mask)
    } else if (mask.test(dirent.name)) {
      yield import(fullFilePath.toString()).then((m) => {
        return m
      })
    }
  }
}
