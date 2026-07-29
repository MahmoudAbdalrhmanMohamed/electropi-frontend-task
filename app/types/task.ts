export type TaskStatus = 'pending' | 'in-progress' | 'done'

export type TaskStatusFilter = 'all' | TaskStatus

export type TaskViewMode = 'grid' | 'board'

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  dueDate: string
  createdAt: string
  updatedAt: string
}

export type TaskDraft = Pick<Task, 'title' | 'description' | 'status' | 'dueDate'>

export type TaskFormErrors = Partial<Record<keyof TaskDraft, string>>

export interface TaskCounts {
  total: number
  pending: number
  inProgress: number
  done: number
}

export const TASK_STATUS_OPTIONS: ReadonlyArray<{
  value: TaskStatus
  label: string
  description: string
}> = [
  {
    value: 'pending',
    label: 'Pending',
    description: 'Ready to be picked up',
  },
  {
    value: 'in-progress',
    label: 'In progress',
    description: 'Currently being worked on',
  },
  {
    value: 'done',
    label: 'Done',
    description: 'Finished and reviewed',
  },
]

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: 'Pending',
  'in-progress': 'In progress',
  done: 'Done',
}
