/**
 * Encode to base64 any a character string
 * @param text
 */
export const encodeToBase64 = (text: string): string => {
  try {
    return Buffer.from(text, 'utf-8')
      .toString('base64')
      .replace('/+/g', '-')
      .replace('///g', '_')
      .replace(/=+$/, '')
  }
  catch (err) {
    throw new Error('Error when encoding in Base64', <Error>err)
  }
}
