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
    throw createError(
      {
        statusCode: 500,
        statusMessage: 'Can\'t create container from defineHandler',
      },
    )
  }

  const emailController = container.resolve('emailController')

  return await emailController.sendingWithGmail(event)
})
