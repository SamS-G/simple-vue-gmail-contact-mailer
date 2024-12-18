export class ApplicationError extends Error {
  constructor(message: string, public readonly statusCode: number = 500, public readonly code?: string, public readonly data?: object) {
    super(message)
    this.name = this.constructor.name
    this.stack = this.captureStack()
  }

  toJSON() {
    return {
      statusCode: this.statusCode,
      message: this.message,
      code: this.code,
      data: this.data,
    }
  }

  captureStack() {
    const err = new Error()
    return err.stack?.split('\n').slice(2).join('\n')
  }
}

export class YupDataValidationError extends ApplicationError {
  constructor(message: string, data?: object) {
    super(message, 400, 'YUP_VALIDATION_ERROR', data)
  }
}
export class ObjectHelperValidError extends ApplicationError {
  constructor(message: string, data?: object) {
    super(message, 500, 'OBJECT_HELPER_VALIDATION_ERROR', data)
  }
}
export class TokenValidityCheckError extends ApplicationError {
  constructor(message: string, data?: object) {
    super(message, 500, 'TOKEN_ERROR', data)
  }
}
export class GetStoredTokensError extends ApplicationError {
  constructor(message: string, data?: object) {
    super(message, 500, 'GET_STORED_TOKENS_ERROR', data)
  }
}
export class ConfigDataError extends ApplicationError {
  constructor(message: string, data?: object) {
    super(message, 500, 'CONFIG_DATA_ERROR', data)
  }
}
export class InvalidCredentialsError extends ApplicationError {
  constructor(message: string, data?: object) {
    super(message, 500, 'INVALID_TOKEN_ERROR', data)
  }
}
export class RefreshCredentialsError extends ApplicationError {
  constructor(message: string, data?: object) {
    super(message, 500, 'REFRESH_CREDENTIALS_ERROR', data)
  }
}
export class GetNewAccessTokenError extends ApplicationError {
  constructor(message: string, data?: object) {
    super(message, 500, 'GET_NEW_ACCESS_TOKEN_ERROR', data)
  }
}
export class NoAccessTokenError extends ApplicationError {
  constructor(message: string, data?: object) {
    super(message, 404, 'NO_ACCESS_TOKEN_ERROR', data)
  }
}
export class ApiSendEmailError extends ApplicationError {
  constructor(message: string, data?: object) {
    super(message, 500, 'GAPI_SEND_MAIL_ERROR', data)
  }
}
export class GetCurrentAuthError extends ApplicationError {
  constructor(message: string, data?: object) {
    super(message, 500, 'GAPI_GET_AUTH_ERROR', data)
  }
}
export class ObjectReplaceValueError extends ApplicationError {
  constructor(message: string, data?: object) {
    super(message, 500, 'OBJECT_REPLACE_VALUE_ERROR', data)
  }
}
export class UpdateJsonError extends ApplicationError {
  constructor(message: string, data?: object) {
    super(message, 500, 'UPDATE_JSON_ERROR', data)
  }
}
export class ParseJsonError extends ApplicationError {
  constructor(message: string, data?: object) {
    super(message, 500, 'PARSE_JSON_ERROR', data)
  }
}
export class CreateEmailTemplateError extends ApplicationError {
  constructor(message: string, data?: object) {
    super(message, 500, 'CREATE_EMAIL_TEMPLATE_ERROR', data)
  }
}
export class CreateTemplateDataError extends ApplicationError {
  constructor(message: string, data?: object) {
    super(message, 500, 'CREATE_TEMPLATE_DATA_ERROR', data)
  }
}
export class CreateTemplateDataModel extends ApplicationError {
  constructor(message: string, data?: object) {
    super(message, 500, 'CREATE_TEMPLATE_DATA_MODEL_ERROR', data)
  }
}
export class CompileTemplateError extends ApplicationError {
  constructor(message: string, data?: object) {
    super(message, 500, 'COMPILE_TEMPLATE_ERROR', data)
  }
}
export class RegisterTemplatePartialError extends ApplicationError {
  constructor(message: string, data?: object) {
    super(message, 500, 'REGISTER_TEMPLATE_PARTIALS_ERROR', data)
  }
}
export class ResolvePartialPaths extends ApplicationError {
  constructor(message: string, data?: object) {
    super(message, 500, 'RESOLVE_PARTIALS_PATHS_ERROR', data)
  }
}
export class EmailConfigError extends ApplicationError {
  constructor(message: string, data?: object) {
    super(message, 500, 'EMAIL_CONFIG_ERROR', data)
  }
}
export class InitializeGmailError extends ApplicationError {
  constructor(message: string, data?: object) {
    super(message, 500, 'INITIALIZE_GMAIL_ERROR', data)
  }
}
export class OAuthInitializationError extends ApplicationError {
  constructor(message: string, data?: object) {
    super(message, 500, 'OAUTH_INITIALIZE_ERROR', data)
  }
}
export class EncryptionError extends ApplicationError {
  constructor(message: string, data?: object) {
    super(message, 500, 'ENCRYPTION_ERROR', data)
  }
}
export class DecryptError extends ApplicationError {
  constructor(message: string, data?: object) {
    super(message, 500, 'DECRYPTION_ERROR', data)
  }
}
export class ReplacePlaceholdersError extends ApplicationError {
  constructor(message: string, data?: object) {
    super(message, 500, 'REPLACE_PLACEHOLDER_ERROR', data)
  }
}
