import type { H3Event } from 'h3'
import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed !',
    })
  }
  checkRequest(event)
})

/**
 * Checks that the type of data sent is compliant
 * @param event
 */
function checkRequest(event: H3Event) {
  if (event.headers.get('content-type') !== 'application/json') {
    sendError(
      event,
      createError({
        statusCode: 403,
        message: 'Request type not allowed !',
      }),
    )
  }
}
