import crypto from 'crypto'
import { DecryptError, EncryptionError } from '~/server/errors/custom-errors'

const CONFIG = useRuntimeConfig()
const ALGORITHM = 'aes-256-cbc'
const ENCRYPTION_KEY = CONFIG.private.encryptionKey
const IV_LENGTH = 16

if (ENCRYPTION_KEY.length !== 32) {
  throw new EncryptionError('The encryption key must contain exactly 32 characters.')
}

export const encrypt = (text: string) => {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv)
  let encrypted = cipher.update(text, 'utf-8', 'hex')
  encrypted += cipher.final('hex')

  return `ENC:${iv.toString('hex')}:${encrypted}`
}
/**
 * Decrypt content, before use, use isFileEncrypted() function
 * @param encryptedText
 */
export const decrypt = <T>(encryptedText: string) => {
  if (encryptedText.startsWith('ENC:')) {
    encryptedText = encryptedText.substring(4)
  }

  const [iv, encrypted] = encryptedText.split(':')
  if (!iv || !encrypted) {
    throw new DecryptError('The cipher text is badly formed.')
  }
  try {
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), Buffer.from(iv, 'hex'))
    let decrypted = decipher.update(encrypted, 'hex', 'utf-8')
    decrypted += decipher.final('utf-8')

    return decrypted as unknown as T
  }
  catch (err) {
    const error = <Error>err
    throw new DecryptError('Failed to decrypt the text', { error: error })
  }
}
/**
 * Check if the file content encrypted or not.
 * Base on a model : “ENC:IV:EncryptedData”.
 * @param data
 * @return boolean
 */
export const isFileEncrypted = <T>(data: unknown | T): boolean => {
  // Check whether the text begins with the prefix “ENC:”.
  if (typeof data === 'string') {
    if (!data.startsWith('ENC:')) {
      return false
    }

    // Cut out parts
    const parts = data.split(':')
    if (parts.length !== 3) {
      return false
    }

    // Check components: prefix, iv, encrypted
    const [prefix, iv, encrypted] = parts
    if (prefix !== 'ENC') {
      return false
    }

    // Checks if IV and ciphertext are in hexadecimal format
    const hexRegex = /^[0-9a-fA-F]+$/
    if (!hexRegex.test(iv) || !hexRegex.test(encrypted)) {
      return false
    }

    // If everything is valid, the file is considered encrypted.
    return true
  }
  // It i not a string
  return false
}
