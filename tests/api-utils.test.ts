import { describe, expect, it } from 'vitest'
import { getApiErrorMessage, getApiErrorStatus } from '../app/utils/api'

describe('API error helpers', () => {
  it('reads status codes from direct and nested API errors', () => {
    expect(getApiErrorStatus({ statusCode: 404 })).toBe(404)
    expect(getApiErrorStatus({ data: { statusCode: 422 } })).toBe(422)
  })

  it('prefers useful server error messages', () => {
    expect(getApiErrorMessage({ statusMessage: 'Task not found.' })).toBe('Task not found.')
    expect(getApiErrorMessage({ data: { statusMessage: 'Task validation failed.' } })).toBe(
      'Task validation failed.',
    )
  })

  it('uses a safe fallback for an unknown error shape', () => {
    expect(getApiErrorMessage(null, 'Please retry.')).toBe('Please retry.')
  })
})
