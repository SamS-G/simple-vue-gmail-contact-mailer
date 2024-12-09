import path from 'path'
import * as fs from 'node:fs'
import { ResolvePartialPaths } from '../errors/custom-errors'

export const pathResolver = (target: string, create: boolean = false): string => {
  const config = useRuntimeConfig()
  // Retrieves root directory from runtimeConfig
  const rootDir = config.rootDir
  // Resolves relative paths into absolutes
  const filePath = path.resolve(rootDir, target)
  const dir = path.dirname(filePath)
  // Create a file / folder if create option enabled
  if (create && !fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    return filePath
  }
  return filePath
}

export const resolvePartialPaths = (basePath: string, partialPath: string[]): string[] => {
  try {
    if (basePath.trim() === '') {
      throw new Error('Base path must be a non-empty string')
    }

    if (!Array.isArray(partialPath)) {
      throw new Error('Partial path must be an array of strings')
    }

    // Build paths
    if (partialPath.length > 0) {
      return partialPath.map(folder => path.join(basePath, folder))
    }

    // Return an empty array if no path provided
    return []
  }
  catch (err) {
    throw new ResolvePartialPaths('Can\'t get partial folders', err)
  }
}
