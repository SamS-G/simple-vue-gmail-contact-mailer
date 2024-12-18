import * as fs from 'node:fs'
import path from 'node:path'
import { ApplicationError, ParseJsonError, UpdateJsonError } from '~/server/errors/custom-errors'
import { encrypt, decrypt, isFileEncrypted } from '~/server/helpers/encryption.helper'
import { getLogger } from '~/server/plugins/00-pino-logger'

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
/**
 * Load content of a file, encrypted or not
 * @param filePath
 * @param toObject - Option if you want return object
 */
export const loadFileContent = async <T>(filePath: string, toObject: boolean = false): Promise<T | string> => {
  try {
    const logger = getLogger()
    let content = await fs.promises.readFile(path.resolve(filePath), 'utf8')

    if (isFileEncrypted(content)) {
      content = decrypt(content)
    }

    if (toObject) {
      try {
        const parsed = JSON.parse(content)

        // Type check after parsing.
        if (typeof parsed === 'object' && parsed !== null) {
          return parsed as T
        }
        logger?.warn(`The content of file ${filePath} is not a valid JSON object. Return of an empty object.`)

        return {} as T
      }
      catch (err) {
        logger?.warn(`Error parsing JSON in ${filePath}. Return of an empty object. Error: ${err.message}`)
        return {} as T
      }
    }

    return content.trim()
  }
  catch (err) {
    if (err instanceof ApplicationError) {
      throw err
    }
    throw new Error(`Error reading file ${filePath}: ${err.message}`)
  }
}
/**
 * Asynchronous function to update a JSON file
 *
 * @param filePath
 * @param updateFunction
 * @param encryptData
 */
export const updateJson = async <T extends Record<string, unknown>>(
  filePath: string,
  updateFunction: (data: T) => Partial<T>,
  encryptData: boolean = false,
): Promise<void> => {
  const logger = getLogger()

  try {
    // Load file JSON
    const data = await loadFileContent<T>(filePath, true)

    // Check if correctly loaded of content
    if (!data) {
      const errorMessage = 'Unable to read JSON file content prior to update'
      logger?.error(errorMessage)
      throw new UpdateJsonError(errorMessage, { filePath })
    }

    let updatedData: Partial<T>
    try {
      // User update function
      updatedData = updateFunction(data)
    }
    catch (err) {
      throw new UpdateJsonError('Error when executing the update function', {
        error: err,
        filePath,
      })
    }
    // Merges changes with existing data
    const finalData = { ...data } // Creates a copy of the original data
    let hasChanges = false

    // Itère on updatedData keys
    for (const key in updatedData) {
      // Checks that the key actually belongs to the object (avoids inherited prototype properties)
      if (Object.hasOwn(updatedData, key)) {
        const newValue = updatedData[key]
        // Checks if the new value is different from the old one and is not undefined
        if (newValue !== undefined && newValue !== finalData[key]) {
          finalData[key] = newValue
          hasChanges = true
        }
      }
    }

    if (hasChanges) {
      const dataToWrite = encryptData ? encrypt(JSON.stringify(finalData)) : finalData
      await writeJson(filePath, dataToWrite)
    }
  }
  catch (error) {
    if (error instanceof ApplicationError) {
      throw error
    }
    throw new UpdateJsonError('JSON file update failed', {
      error,
      filePath,
    })
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
