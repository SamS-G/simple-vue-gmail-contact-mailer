import crypto from 'crypto'
import { DecryptError, EncryptionError } from '~/server/errors/custom-errors'

const CONFIG = useRuntimeConfig()
const ALGORITHM = 'AES-256-GCM'
const ENCRYPTION_KEY = CONFIG.private.encryptionKey
const IV_LENGTH = 16

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
  throw new EncryptionError('The encryption key must contain exactly 32 characters.')
}

export const encrypt = (text: string) => {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv) as crypto.CipherGCM
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()

  return `ENC:${iv.toString('hex')}:${encrypted.toString('hex')}:${tag.toString('hex')}`
}

export const decrypt = (encryptedText: string) => {
  if (!encryptedText.startsWith('ENC:')) {
    throw new DecryptError('Invalid encrypted text format')
  }

  const parts = encryptedText.split(':')
  if (parts.length !== 4) {
    throw new DecryptError('The cipher text is badly formed.')
  }

  const [prefix, iv, encrypted, tag] = parts

  if (prefix !== 'ENC' || !iv || !encrypted || !tag) {
    throw new DecryptError('Invalid encrypted text components')
  }

  try {
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), Buffer.from(iv, 'hex')) as crypto.DecipherGCM
    decipher.setAuthTag(Buffer.from(tag, 'hex'))
    let decrypted = decipher.update(encrypted, 'hex', 'utf-8')
    decrypted += decipher.final('utf-8')

    return decrypted
  }
  catch (err) {
    const error = <Error>err
    throw new DecryptError('Failed to decrypt the text', { error: error })
  }
}

export const isFileEncrypted = <T>(data: T): boolean => {
  if (typeof data !== 'string') {
    return false
  }

  const parts = data.split(':')
  if (parts.length !== 4) {
    return false
  }

  const [prefix, iv, encrypted, tag] = parts
  const hexRegex = /^[0-9a-fA-F]+$/

  return (
    prefix === 'ENC'
    && hexRegex.test(iv)
    && hexRegex.test(encrypted)
    && hexRegex.test(tag)
  )
}
