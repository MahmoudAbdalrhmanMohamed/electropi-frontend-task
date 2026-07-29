import { describe, expect, it } from 'vitest'
import type { TaskDraft } from '../app/types/task'
import {
  getDueDateMeta,
  getMinimumDueDate,
  isFutureDate,
  validateTaskDraft,
} from '../app/utils/task'

const now = new Date(2026, 6, 29, 12)

const validDraft: TaskDraft = {
  title: 'Prepare release notes',
  description: 'Summarize the changes for the next release.',
  status: 'pending',
  dueDate: '2026-08-03',
}

describe('task validation', () => {
  it('accepts a complete task with a future due date', () => {
    expect(validateTaskDraft(validDraft, now)).toEqual({})
    expect(isFutureDate(validDraft.dueDate, now)).toBe(true)
  })

  it('rejects an empty title and a due date that is not in the future', () => {
    const errors = validateTaskDraft(
      {
        ...validDraft,
        title: '   ',
        dueDate: '2026-07-29',
      },
      now,
    )

    expect(errors.title).toBe('Title is required.')
    expect(errors.dueDate).toBe('Due date must be in the future.')
  })

  it('returns tomorrow as the minimum selectable due date', () => {
    expect(getMinimumDueDate(now)).toBe('2026-07-30')
  })
})

describe('due date metadata', () => {
  it('turns nearby dates into human-friendly labels', () => {
    expect(getDueDateMeta('2026-07-30', now)).toEqual({
      label: 'Due tomorrow',
      tone: 'soon',
    })

    expect(getDueDateMeta('2026-08-04', now)).toEqual({
      label: 'Due in 6 days',
      tone: 'normal',
    })
  })
})
