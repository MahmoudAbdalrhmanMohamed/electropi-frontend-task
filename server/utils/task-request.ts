import { createError } from 'h3'
import type { TaskDraft, TaskStatus } from '../../app/types/task'
import { validateTaskDraft } from '../../app/utils/task'

const VALID_STATUSES = new Set<TaskStatus>(['pending', 'in-progress', 'done'])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function parseTaskDraft(body: unknown): TaskDraft {
  if (!isRecord(body)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Request body must be a task object.',
    })
  }

  const draft: TaskDraft = {
    title: typeof body.title === 'string' ? body.title : '',
    description: typeof body.description === 'string' ? body.description : '',
    status: typeof body.status === 'string' ? (body.status as TaskStatus) : 'pending',
    dueDate: typeof body.dueDate === 'string' ? body.dueDate : '',
  }
  const errors = validateTaskDraft(draft)

  if (!VALID_STATUSES.has(draft.status)) {
    errors.status = 'Choose a valid status.'
  }

  if (Object.keys(errors).length) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Task validation failed.',
      data: {
        errors,
      },
    })
  }

  return draft
}
