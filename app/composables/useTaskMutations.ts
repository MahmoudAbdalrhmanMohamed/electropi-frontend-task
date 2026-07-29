import { ref } from 'vue'
import type { Task, TaskDraft, TaskStatus } from '../types/task'
import { getStatusLabel } from '../utils/task'
import { useTasksStore } from '../stores/tasks'
import { useToast } from './useToast'

export function useTaskMutations() {
  const tasksStore = useTasksStore()
  const nuxtApp = useNuxtApp()
  const isSaving = ref(false)
  const isDeleting = ref(false)
  const pendingStatusTaskIds = ref<string[]>([])
  const toast = useToast()

  function showMutationError(fallback: string): void {
    toast.showToast(tasksStore.mutationError ?? fallback, 'error')
  }

  async function saveTask(draft: TaskDraft, taskId?: string): Promise<Task | null> {
    if (isSaving.value) {
      return null
    }

    isSaving.value = true

    try {
      const task = taskId
        ? await tasksStore.updateTask(taskId, draft)
        : await tasksStore.createTask(draft)

      toast.showToast(taskId ? 'Task updated successfully.' : 'Task created successfully.')

      return task
    } catch {
      showMutationError('The task could not be saved. Please try again.')

      return null
    } finally {
      isSaving.value = false
    }
  }

  async function deleteTask(taskId: string): Promise<boolean> {
    if (isDeleting.value) {
      return false
    }

    isDeleting.value = true

    try {
      await tasksStore.deleteTask(taskId)
      nuxtApp.runWithContext(() => clearNuxtData(`tasks:item:${taskId}`))
      toast.showToast('Task deleted successfully.')

      return true
    } catch {
      showMutationError('The task could not be deleted. Please try again.')

      return false
    } finally {
      isDeleting.value = false
    }
  }

  async function changeTaskStatus(task: Task, status: TaskStatus): Promise<Task | null> {
    if (task.status === status || pendingStatusTaskIds.value.includes(task.id)) {
      return task
    }

    pendingStatusTaskIds.value = [...pendingStatusTaskIds.value, task.id]

    try {
      const updatedTask = await tasksStore.changeTaskStatus(task.id, status)

      if (updatedTask) {
        toast.showToast(`Task moved to ${getStatusLabel(status)}.`)
      }

      return updatedTask
    } catch {
      showMutationError('The task status could not be changed. Please try again.')

      return null
    } finally {
      pendingStatusTaskIds.value = pendingStatusTaskIds.value.filter((id) => id !== task.id)
    }
  }

  return {
    isSaving,
    isDeleting,
    pendingStatusTaskIds,
    saveTask,
    deleteTask,
    changeTaskStatus,
    ...toast,
  }
}
