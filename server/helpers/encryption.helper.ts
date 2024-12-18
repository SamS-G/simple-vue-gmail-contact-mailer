import crypto from 'crypto'
import { DecryptError, EncryptionError } from '~/server/errors/custom-errors'

const CONFIG = useRuntimeConfig()
const ALGORITHM = 'AES-256-GCM'
const ENCRYPTION_KEY = CONFIG.private.encryptionKey
const IV_LENGTH = 16

// Validate the encryption key
// Ensure the key exists and is exactly 32 characters long
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
  throw new EncryptionError('The encryption key must contain exactly 32 characters.')
}

/**
 * Encrypts the given text using AES-256-GCM
 * @param text - The plain text to be encrypted
 * @returns A string with encrypted data in the format: "ENC:IV:EncryptedData:AuthTag"
 */
export const encrypt = (text: string) => {
  // Generate a random Initialization Vector (IV)
  const iv = crypto.randomBytes(IV_LENGTH)

  // Create a cipher using the specified algorithm, encryption key, and IV
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv) as crypto.CipherGCM

  // Encrypt the text and concatenate the updated and final blocks
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])

  // Get the authentication tag for integrity verification
  const tag = cipher.getAuthTag()

  // Return the encrypted data in a formatted string
  // Format: prefix:IV:encrypted_data:authentication_tag
  return `ENC:${iv.toString('hex')}:${encrypted.toString('hex')}:${tag.toString('hex')}`
}

/**
 * Decrypts the given encrypted text
 * @param encryptedText - The encrypted text to decrypt
 * @returns The decrypted plain text
 * @throws {DecryptError} If decryption fails or the encrypted text is invalid
 */
export const decrypt = (encryptedText: string) => {
  // Validate the encrypted text format
  if (!encryptedText.startsWith('ENC:')) {
    throw new DecryptError('Invalid encrypted text format')
  }

  // Split the encrypted text into parts
  const parts = encryptedText.split(':')
  if (parts.length !== 4) {
    throw new DecryptError('The cipher text is badly formed.')
  }

  // Destructure the parts
  const [prefix, iv, encrypted, tag] = parts

  // Additional validation of the encrypted text components
  if (prefix !== 'ENC' || !iv || !encrypted || !tag) {
    throw new DecryptError('Invalid encrypted text components')
  }

  try {
    // Create a decipher using the same algorithm, key, and IV
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), Buffer.from(iv, 'hex')) as crypto.DecipherGCM

    // Set the authentication tag for integrity verification
    decipher.setAuthTag(Buffer.from(tag, 'hex'))

    // Decrypt the text
    let decrypted = decipher.update(encrypted, 'hex', 'utf-8')
    decrypted += decipher.final('utf-8')

    return decrypted
  }
  catch (err) {
    // Handle any decryption errors
    const error = <Error>err
    throw new DecryptError('Failed to decrypt the text', { error: error })
  }
}

/**
 * Checks if the given data is encrypted
 * @param data - The data to check
 * @returns Boolean indicating whether the data appears to be encrypted
 */
export const isFileEncrypted = <T>(data: T): boolean => {
  // Only strings can be encrypted
  if (typeof data !== 'string') {
    return false
  }

  // Split the data into parts
  const parts = data.split(':')
  // Ensure there are exactly 4 parts
  if (parts.length !== 4) {
    return false
  }

  // Destructure the parts
  const [prefix, iv, encrypted, tag] = parts

  // Regex to check if strings are in hexadecimal format
  const hexRegex = /^[0-9a-fA-F]+$/

  // Validate all components:
  // 1. Prefix must be 'ENC'
  // 2. IV must be hexadecimal
  // 3. Encrypted data must be hexadecimal
  // 4. Authentication tag must be hexadecimal
  return (
    prefix === 'ENC'
    && hexRegex.test(iv)
    && hexRegex.test(encrypted)
    && hexRegex.test(tag)
  )
}
