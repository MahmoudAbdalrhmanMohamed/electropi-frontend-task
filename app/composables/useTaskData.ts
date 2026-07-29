import { computed, toValue, watch, type MaybeRefOrGetter } from 'vue'
import type { Task } from '../types/task'
import { getApiErrorMessage, getApiErrorStatus } from '../utils/api'
import { useTasksStore } from '../stores/tasks'

export async function useTaskData(taskIdSource: MaybeRefOrGetter<string>) {
  const tasksStore = useTasksStore()
  const taskId = computed(() => toValue(taskIdSource))
  const asyncData = useAsyncData<Task>(
    () => `tasks:item:${taskId.value}`,
    (_nuxtApp, { signal }) => {
      const cachedTask = tasksStore.getTaskById(taskId.value)

      if (cachedTask) {
        return Promise.resolve(cachedTask)
      }

      return $fetch<Task>(`/api/tasks/${encodeURIComponent(taskId.value)}`, {
        signal,
      })
    },
    {
      deep: false,
      dedupe: 'cancel',
      lazy: false,
      server: true,
      timeout: 10_000,
    },
  )

  watch(
    asyncData.data,
    (fetchedTask) => {
      if (fetchedTask && !tasksStore.getTaskById(fetchedTask.id)) {
        tasksStore.upsertTask(fetchedTask)
      }
    },
    {
      immediate: true,
    },
  )

  await asyncData

  if (!tasksStore.getTaskById(taskId.value) && asyncData.data.value) {
    tasksStore.upsertTask(asyncData.data.value)
  }

  const task = computed(() => tasksStore.getTaskById(taskId.value) ?? null)
  const isNotFound = computed(() => getApiErrorStatus(asyncData.error.value) === 404)
  const errorMessage = computed(() => {
    if (!asyncData.error.value || isNotFound.value) {
      return null
    }

    return getApiErrorMessage(
      asyncData.error.value,
      'We could not load this task. Please try again.',
    )
  })

  async function refreshTask(): Promise<void> {
    await asyncData.refresh({
      dedupe: 'cancel',
    })

    if (asyncData.status.value === 'success' && asyncData.data.value) {
      tasksStore.upsertTask(asyncData.data.value)
    }
  }

  return {
    task,
    pending: asyncData.pending,
    status: asyncData.status,
    error: asyncData.error,
    errorMessage,
    isNotFound,
    refreshTask,
  }
}
