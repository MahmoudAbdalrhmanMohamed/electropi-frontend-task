import { randomUUID } from 'node:crypto'
import type { Task, TaskDraft } from '../../app/types/task'
import { normalizeTaskDraft } from '../../app/utils/task'

function dateAfterDays(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function timestampBeforeHours(hours: number): string {
  return new Date(Date.now() - hours * 3_600_000).toISOString()
}

function createSeedTasks(): Task[] {
  return [
    {
      id: 'tsk_product_launch',
      title: 'Prepare product launch checklist',
      description:
        'Review the release checklist with product and make sure every launch dependency has a clear owner.',
      status: 'in-progress',
      dueDate: dateAfterDays(2),
      createdAt: timestampBeforeHours(52),
      updatedAt: timestampBeforeHours(4),
    },
    {
      id: 'tsk_design_handoff',
      title: 'Review dashboard design handoff',
      description:
        'Check responsive states, empty screens, and interaction notes before development starts.',
      status: 'pending',
      dueDate: dateAfterDays(5),
      createdAt: timestampBeforeHours(30),
      updatedAt: timestampBeforeHours(30),
    },
    {
      id: 'tsk_accessibility',
      title: 'Run accessibility smoke test',
      description:
        'Verify keyboard navigation, focus visibility, semantic headings, and form labels across the main flow.',
      status: 'pending',
      dueDate: dateAfterDays(7),
      createdAt: timestampBeforeHours(22),
      updatedAt: timestampBeforeHours(22),
    },
    {
      id: 'tsk_api_contract',
      title: 'Document task API contract',
      description:
        'Capture the task payload, supported statuses, validation rules, and expected error responses.',
      status: 'done',
      dueDate: dateAfterDays(9),
      createdAt: timestampBeforeHours(74),
      updatedAt: timestampBeforeHours(18),
    },
    {
      id: 'tsk_retro',
      title: 'Schedule sprint retrospective',
      description: 'Find a suitable time and collect discussion points from the team.',
      status: 'done',
      dueDate: dateAfterDays(12),
      createdAt: timestampBeforeHours(110),
      updatedAt: timestampBeforeHours(43),
    },
  ]
}

let taskRecords = createSeedTasks()

function cloneTask(task: Task): Task {
  return { ...task }
}

export function listTasks(): Task[] {
  return taskRecords.map(cloneTask)
}

export function findTask(id: string): Task | null {
  const task = taskRecords.find((candidate) => candidate.id === id)

  return task ? cloneTask(task) : null
}

export function createTask(draft: TaskDraft): Task {
  const timestamp = new Date().toISOString()
  const task: Task = {
    id: randomUUID(),
    ...normalizeTaskDraft(draft),
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  taskRecords.unshift(task)

  return cloneTask(task)
}

export function updateTask(id: string, draft: TaskDraft): Task | null {
  const taskIndex = taskRecords.findIndex((task) => task.id === id)
  const currentTask = taskRecords[taskIndex]

  if (taskIndex === -1 || !currentTask) {
    return null
  }

  const updatedTask: Task = {
    ...currentTask,
    ...normalizeTaskDraft(draft),
    updatedAt: new Date().toISOString(),
  }

  taskRecords[taskIndex] = updatedTask

  return cloneTask(updatedTask)
}

export function deleteTask(id: string): boolean {
  const initialCount = taskRecords.length
  taskRecords = taskRecords.filter((task) => task.id !== id)

  return taskRecords.length < initialCount
}
