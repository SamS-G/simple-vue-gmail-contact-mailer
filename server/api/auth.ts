import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  // eslint-disable-next-line no-useless-catch
  try {
    if (event.method !== 'GET') {
      throw new Error('Method not allowed')
    }
    const container = event.context.container
    const emailController = container.resolve('emailController')

    if (!container) {
      return { success: false, error: emailController }
    }
    emailController.newAuth()
    const url = await emailController.getAuthUrl()
    // console.error(url)
    // await apiGmailService.getFirstAccessToken('4/0AeanS0ZTT2u-GbxZ4VzbvHCz-goCAfZE7484AXengZnLVnT1uRScmIb3WMTL3R9njWysLw')
  }
  catch (error) {
    throw error
  }
})
