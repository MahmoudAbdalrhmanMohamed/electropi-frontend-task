import type { TaskDraft, TaskFormErrors, TaskStatus } from '../types/task'
import { TASK_STATUS_LABELS } from '../types/task'

const DAY_IN_MILLISECONDS = 86_400_000
const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function parseDateOnly(value: string): Date | null {
  const match = DATE_ONLY_PATTERN.exec(value)

  if (!match) {
    return null
  }

  const [, year, month, day] = match
  const parsedDate = new Date(Number(year), Number(month) - 1, Number(day))

  if (
    parsedDate.getFullYear() !== Number(year) ||
    parsedDate.getMonth() !== Number(month) - 1 ||
    parsedDate.getDate() !== Number(day)
  ) {
    return null
  }

  return parsedDate
}

export function toDateInputValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function getMinimumDueDate(now = new Date()): string {
  const tomorrow = startOfLocalDay(now)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return toDateInputValue(tomorrow)
}

export function isFutureDate(value: string, now = new Date()): boolean {
  const parsedDate = parseDateOnly(value)

  return parsedDate !== null && parsedDate.getTime() > startOfLocalDay(now).getTime()
}

export function validateTaskDraft(draft: TaskDraft, now = new Date()): TaskFormErrors {
  const errors: TaskFormErrors = {}
  const title = draft.title.trim()

  if (!title) {
    errors.title = 'Title is required.'
  } else if (title.length > 80) {
    errors.title = 'Title must be 80 characters or fewer.'
  }

  if (draft.description.trim().length > 500) {
    errors.description = 'Description must be 500 characters or fewer.'
  }

  if (!draft.dueDate) {
    errors.dueDate = 'Due date is required.'
  } else if (!parseDateOnly(draft.dueDate)) {
    errors.dueDate = 'Choose a valid due date.'
  } else if (!isFutureDate(draft.dueDate, now)) {
    errors.dueDate = 'Due date must be in the future.'
  }

  return errors
}

export function normalizeTaskDraft(draft: TaskDraft): TaskDraft {
  return {
    ...draft,
    title: draft.title.trim(),
    description: draft.description.trim(),
  }
}

export function formatDueDate(value: string, locale = 'en-US'): string {
  const date = parseDateOnly(value)

  if (!date) {
    return 'Invalid date'
  }

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function formatTimestamp(value: string, locale = 'en-US'): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Unknown'
  }

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function getDueDateMeta(
  value: string,
  now = new Date(),
): {
  label: string
  tone: 'overdue' | 'today' | 'soon' | 'normal'
} {
  const dueDate = parseDateOnly(value)

  if (!dueDate) {
    return {
      label: 'Invalid due date',
      tone: 'overdue',
    }
  }

  const differenceInDays = Math.round(
    (dueDate.getTime() - startOfLocalDay(now).getTime()) / DAY_IN_MILLISECONDS,
  )

  if (differenceInDays < 0) {
    return {
      label: `${Math.abs(differenceInDays)} day${differenceInDays === -1 ? '' : 's'} overdue`,
      tone: 'overdue',
    }
  }

  if (differenceInDays === 0) {
    return {
      label: 'Due today',
      tone: 'today',
    }
  }

  if (differenceInDays === 1) {
    return {
      label: 'Due tomorrow',
      tone: 'soon',
    }
  }

  if (differenceInDays <= 3) {
    return {
      label: `Due in ${differenceInDays} days`,
      tone: 'soon',
    }
  }

  return {
    label: `Due in ${differenceInDays} days`,
    tone: 'normal',
  }
}

export function getStatusLabel(status: TaskStatus): string {
  return TASK_STATUS_LABELS[status]
}
