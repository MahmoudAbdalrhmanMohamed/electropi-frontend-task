import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Task, TaskCounts, TaskDraft, TaskStatus, TaskStatusFilter } from '../types/task'
import { normalizeTaskDraft } from '../utils/task'

interface DeleteTaskResponse {
  id: string
  deleted: true
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getErrorStatus(error: unknown): number | undefined {
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

function getErrorMessage(
  error: unknown,
  fallback = 'The request could not be completed. Please try again.',
): string {
  if (isRecord(error) && isRecord(error.data)) {
    const statusMessage = error.data.statusMessage
    const message = error.data.message

    if (typeof statusMessage === 'string' && statusMessage) {
      return statusMessage
    }

    if (typeof message === 'string' && message) {
      return message
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const pendingMutationCount = ref(0)
  const mutationError = ref<string | null>(null)
  const hasLoaded = ref(false)
  const searchQuery = ref('')
  const statusFilter = ref<TaskStatusFilter>('all')

  const filteredTasks = computed(() => {
    const normalizedSearch = searchQuery.value.trim().toLocaleLowerCase()

    return [...tasks.value]
      .filter((task) => {
        const matchesStatus = statusFilter.value === 'all' || task.status === statusFilter.value
        const matchesSearch =
          !normalizedSearch || task.title.toLocaleLowerCase().includes(normalizedSearch)

        return matchesStatus && matchesSearch
      })
      .sort((firstTask, secondTask) => firstTask.dueDate.localeCompare(secondTask.dueDate))
  })

  const counts = computed<TaskCounts>(() =>
    tasks.value.reduce<TaskCounts>(
      (result, task) => {
        result.total += 1

        if (task.status === 'pending') {
          result.pending += 1
        }

        if (task.status === 'in-progress') {
          result.inProgress += 1
        }

        if (task.status === 'done') {
          result.done += 1
        }

        return result
      },
      {
        total: 0,
        pending: 0,
        inProgress: 0,
        done: 0,
      },
    ),
  )

  const completionRate = computed(() => {
    if (!counts.value.total) {
      return 0
    }

    return Math.round((counts.value.done / counts.value.total) * 100)
  })

  const hasActiveFilters = computed(
    () => Boolean(searchQuery.value.trim()) || statusFilter.value !== 'all',
  )

  const isMutating = computed(() => pendingMutationCount.value > 0)

  async function fetchTasks(options: { force?: boolean } = {}): Promise<void> {
    if (hasLoaded.value && !options.force) {
      return
    }

    isLoading.value = true
    error.value = null

    try {
      tasks.value = await $fetch<Task[]>('/api/tasks')
      hasLoaded.value = true
    } catch (caughtError: unknown) {
      error.value = getErrorMessage(caughtError, 'We could not load your tasks. Please try again.')
    } finally {
      isLoading.value = false
    }
  }

  async function fetchTask(id: string, options: { force?: boolean } = {}): Promise<Task | null> {
    const existingTask = getTaskById(id)

    if (!options.force && (existingTask || hasLoaded.value)) {
      return existingTask ?? null
    }

    isLoading.value = true
    error.value = null

    try {
      const fetchedTask = await $fetch<Task>(`/api/tasks/${encodeURIComponent(id)}`)
      const taskIndex = tasks.value.findIndex((task) => task.id === id)

      if (taskIndex === -1) {
        tasks.value.unshift(fetchedTask)
      } else {
        tasks.value[taskIndex] = fetchedTask
      }

      return fetchedTask
    } catch (caughtError: unknown) {
      if (getErrorStatus(caughtError) === 404) {
        return null
      }

      error.value = getErrorMessage(caughtError, 'We could not load this task. Please try again.')

      return null
    } finally {
      isLoading.value = false
    }
  }

  async function runMutation<T>(mutation: () => Promise<T>): Promise<T> {
    pendingMutationCount.value += 1
    mutationError.value = null

    try {
      return await mutation()
    } catch (caughtError: unknown) {
      mutationError.value = getErrorMessage(caughtError)
      throw caughtError
    } finally {
      pendingMutationCount.value -= 1
    }
  }

  async function createTask(draft: TaskDraft): Promise<Task> {
    return runMutation(async () => {
      const task = await $fetch<Task>('/api/tasks', {
        method: 'POST',
        body: normalizeTaskDraft(draft),
      })

      tasks.value.unshift(task)

      return task
    })
  }

  async function updateTask(id: string, draft: TaskDraft): Promise<Task> {
    return runMutation(async () => {
      const updatedTask = await $fetch<Task>(`/api/tasks/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: normalizeTaskDraft(draft),
      })
      const taskIndex = tasks.value.findIndex((task) => task.id === id)

      if (taskIndex === -1) {
        tasks.value.unshift(updatedTask)
      } else {
        tasks.value[taskIndex] = updatedTask
      }

      return updatedTask
    })
  }

  async function deleteTask(id: string): Promise<boolean> {
    return runMutation(async () => {
      const result = await $fetch<DeleteTaskResponse>(`/api/tasks/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })

      tasks.value = tasks.value.filter((task) => task.id !== result.id)

      return result.deleted
    })
  }

  async function changeTaskStatus(id: string, status: TaskStatus): Promise<Task | null> {
    const currentTask = tasks.value.find((task) => task.id === id)

    if (!currentTask) {
      return null
    }

    if (currentTask.status === status) {
      return currentTask
    }

    return updateTask(id, {
      title: currentTask.title,
      description: currentTask.description,
      status,
      dueDate: currentTask.dueDate,
    })
  }

  function getTaskById(id: string): Task | undefined {
    return tasks.value.find((task) => task.id === id)
  }

  function clearFilters(): void {
    searchQuery.value = ''
    statusFilter.value = 'all'
  }

  return {
    tasks,
    isLoading,
    isMutating,
    error,
    mutationError,
    hasLoaded,
    searchQuery,
    statusFilter,
    filteredTasks,
    counts,
    completionRate,
    hasActiveFilters,
    fetchTasks,
    fetchTask,
    createTask,
    updateTask,
    changeTaskStatus,
    deleteTask,
    getTaskById,
    clearFilters,
  }
})
