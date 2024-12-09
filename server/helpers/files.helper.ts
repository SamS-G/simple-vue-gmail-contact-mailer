import * as fs from 'node:fs'
import path from 'node:path'
import { ParseJsonError, UpdateJsonError } from '~/server/errors/custom-errors'
import { encrypt, decrypt, isFileEncrypted } from '~/server/helpers/encryption.helper'
/**
   * Safely parses a JSON string into a specified generic type.
   * @param json - The JSON string to parse.
   * @returns The parsed object of type T.
   * @throws An error if the JSON string is invalid.
   */
export const parseJson = <T>(json: string): T => {
  try {
    return JSON.parse(json) as T
  }
  catch (err) {
    throw new ParseJsonError(`Invalid JSON string: ${err instanceof Error ? err.message : String(err)}`)
  }
}

export const loadFile = async <T>(filePath: string): Promise<T> => {
  try {
    // Reads the file as a string.
    let content = await fs.promises.readFile(path.resolve(filePath), 'utf8')

    if (isFileEncrypted(content)) {
      content = decrypt(content)
    }
    // Try parsing as JSON
    try {
      return parseJson(content) as T
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    catch (jsonParseError) {
      return content as unknown as T // Return raw content if not JSON
    }
  }
  catch (err) {
    throw new Error(`Error reading file at ${filePath}: ${err instanceof Error ? err.message : String(err)}`)
  }
}
/**
 * Updates the contents of a JSON file with new values if they are not null or identical
 * @param filePath - Path to JSON file
 * @param updateFunction - Update function that takes current data and returns changes.
 * @param encryptData
 */
export const updateJson = async <T extends Record<string, unknown>>(
  filePath: string,
  updateFunction: (data: T) => Partial<T>,
  encryptData: boolean = false,
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
): Promise<void | UpdateJsonError> => {
  const data = await loadFile<T>(filePath)

  if (data === undefined) {
    throw new UpdateJsonError('Can\'t read json file content before update()', { data })
  }

  let updatedData: Partial<T>
  try {
    updatedData = updateFunction(data)
  }
  catch (err) {
    throw new UpdateJsonError('Error occurred during update function execution',
      {
        err,
        filePath,
      })
  }

  const changes = Object.entries(updatedData).reduce<Partial<T>>(
    (acc, [key, newValue]) => {
      const currentValue = data[key]

      if (newValue !== undefined && newValue !== '' && newValue !== currentValue) {
        acc[key as keyof T] = newValue as T[keyof T]
      }
      return acc
    },
    {})

  if (Object.keys(changes).length > 0) {
    try {
      const finalData = { ...data, ...changes }

      if (encryptData) {
        const encryptedData = encrypt(JSON.stringify(finalData))
        await writeJson(filePath, encryptedData)
      }
      else {
        await writeJson(filePath, finalData)
      }
    }
    catch (error) {
      throw new UpdateJsonError('Failed to write updated data to JSON file', {
        error,
        filePath,
        changes,
      })
    }
  }
}
/**
 * Writes content to a JSON file
 * @param filePath - Path to JSON file
 * @param data - Data to write to the file.
 */
export const writeJson = async <T>(
  filePath: string,
  data: T,
): Promise<void> => {
  let contentToWrite: string
  if (typeof data === 'string') {
    contentToWrite = data
  }
  else {
    contentToWrite = JSON.stringify(data, null, 2)
  }
  await fs.promises.writeFile(filePath, contentToWrite)
}
