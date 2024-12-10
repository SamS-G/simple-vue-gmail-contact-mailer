import path from 'path'
import * as fs from 'node:fs'
import { ResolvePartialPaths } from '../errors/custom-errors'

/**
 * Resolves a target path relative to the application's root directory and optionally creates the necessary directories.
 *
 * @param target The relative path to be resolved.
 * @param create (Optional) A boolean indicating whether to create the directories if they don't exist. Defaults to `false`.
 * @returns The absolute path resolved from the root directory and the target.
 */
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
/**
 * Resolves an array of partial paths into absolute paths based on a provided base path.
 * - Validates that the base path is a non-empty string and that the partial paths are in an array.
 * - Combines the base path with each partial path to create fully resolved paths.
 * - Returns an empty array if no partial paths are provided.
 *
 * @param basePath The base path to prepend to each partial path.
 * @param partialPath An array of partial paths to resolve against the base path.
 * @returns An array of resolved paths.
 * @throws ResolvePartialPaths If the base path is invalid, the partial path is not an array, or another error occurs during execution.
 */
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
