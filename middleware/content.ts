import type { H3Event } from 'h3'
import { defineEventHandler, createError, sendError } from 'h3'

export default defineEventHandler(async (event) => {
  // Check that the method is POST
  if (event.node.req.method !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed!',
    })
  }

  // Check that the content type is 'application/json'.
  checkRequest(event)
})

/**
 * Checks that the type of data sent is correct
 * @param event
 */
function checkRequest(event: H3Event) {
  const contentType = event.headers.get('content-type')

  // If the content-type is not 'application/json', return an error
  if (contentType !== 'application/json') {
    sendError(
      event,
      createError({
        statusCode: 415, // Code 415 for Unsupported Media Type
        message: 'Request type not allowed! Expected content-type: application/json.',
      }),
    )
  }
}
