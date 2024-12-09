import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  const logger = event.context.logger
  const container = event.context.container

  if (event.node.req.method !== 'POST') {
    logger.info('A request with bad method have send')
    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed !',
    })
  }

  if (!container) {
    return { success: false, error: 'Can\'t create container !' }
  }

  const emailController = container.resolve('emailController')

  return await emailController.sendingWithGmail(event)
})
