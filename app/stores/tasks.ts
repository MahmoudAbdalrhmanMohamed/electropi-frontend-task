import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Task, TaskCounts, TaskDraft, TaskStatus, TaskStatusFilter } from '../types/task'
import { getApiErrorMessage } from '../utils/api'
import { normalizeTaskDraft } from '../utils/task'

interface DeleteTaskResponse {
  id: string
  deleted: true
}

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const pendingMutationCount = ref(0)
  const mutationError = ref<string | null>(null)
  const hasLoadedList = ref(false)
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

  function replaceTasks(nextTasks: Task[]): void {
    tasks.value = [...nextTasks]
    hasLoadedList.value = true
  }

  function upsertTask(task: Task): void {
    const taskIndex = tasks.value.findIndex((candidate) => candidate.id === task.id)

    if (taskIndex === -1) {
      tasks.value.unshift(task)
    } else {
      tasks.value[taskIndex] = task
    }
  }

  async function runMutation<T>(mutation: () => Promise<T>): Promise<T> {
    pendingMutationCount.value += 1
    mutationError.value = null

    try {
      return await mutation()
    } catch (caughtError: unknown) {
      mutationError.value = getApiErrorMessage(caughtError)
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

      upsertTask(task)

      return task
    })
  }

  async function updateTask(id: string, draft: TaskDraft): Promise<Task> {
    return runMutation(async () => {
      const updatedTask = await $fetch<Task>(`/api/tasks/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: normalizeTaskDraft(draft),
      })
      upsertTask(updatedTask)

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
    isMutating,
    mutationError,
    hasLoadedList,
    searchQuery,
    statusFilter,
    filteredTasks,
    counts,
    completionRate,
    hasActiveFilters,
    replaceTasks,
    upsertTask,
    createTask,
    updateTask,
    changeTaskStatus,
    deleteTask,
    getTaskById,
    clearFilters,
  }
})
