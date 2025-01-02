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
export const updateJson = async <T extends Record<string, never>>(
  filePath: string,
  updateFunction: (data: Readonly<T>) => Partial<T>,
  encryptData: boolean = false,
): Promise<void> => {
  const logger = getLogger()

  try {
    // Charger le fichier JSON
    const fileContent = await loadFileContent<T>(filePath, true)

    if (!fileContent || typeof fileContent !== 'object') {
      const errorMessage = 'Le fichier JSON est vide ou contient un contenu invalide.'
      logger?.error(errorMessage)
      throw new UpdateJsonError(errorMessage, { filePath, content: fileContent })
    }

    // On cast le type car on a vérifié plus haut que c'est bien un objet
    const data: T = fileContent

    let updatedData: Partial<T>
    try {
      // Fonction de mise à jour utilisateur
      updatedData = updateFunction(data)
    }
    catch (err) {
      logger?.error(`Erreur lors de l'exécution de la fonction de mise à jour de updateJson(), car : ${err}`)
      throw new UpdateJsonError('Erreur lors de l\'exécution de la fonction de mise à jour de updateJson()', {
        error: err?.message,
        file: filePath,
      })
    }

    // Fusionner les modifications avec les données existantes de manière immuable
    const finalData = { ...data, ...updatedData }

    // Vérifier si des changements ont été effectués de manière plus performante
    const hasChanges = Object.keys(updatedData).length > 0

    if (hasChanges) {
      const dataToWrite = encryptData ? encrypt(JSON.stringify(finalData)) : finalData
      await writeJson(filePath, dataToWrite)
    }
  }
  catch (error) {
    if (error instanceof ApplicationError) {
      throw error
    }
    throw new UpdateJsonError('La mise à jour du fichier JSON a échoué', {
      error: error?.message, // Utilisation de optional chaining
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
