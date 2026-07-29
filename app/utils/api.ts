function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function getApiErrorStatus(error: unknown): number | undefined {
  if (!isRecord(error)) {
    return undefined
  }

  if (typeof error.statusCode === 'number') {
    return error.statusCode
  }

  if (typeof error.status === 'number') {
    return error.status
  }

  if (isRecord(error.data) && typeof error.data.statusCode === 'number') {
    return error.data.statusCode
  }

  return undefined
}

export function getApiErrorMessage(
  error: unknown,
  fallback = 'The request could not be completed. Please try again.',
): string {
  if (!isRecord(error)) {
    return fallback
  }

  if (typeof error.statusMessage === 'string' && error.statusMessage) {
    return error.statusMessage
  }

  if (isRecord(error.data)) {
    if (typeof error.data.statusMessage === 'string' && error.data.statusMessage) {
      return error.data.statusMessage
    }

    if (typeof error.data.message === 'string' && error.data.message) {
      return error.data.message
    }
  }

  if (typeof error.message === 'string' && error.message) {
    return error.message
  }

  return fallback
}
