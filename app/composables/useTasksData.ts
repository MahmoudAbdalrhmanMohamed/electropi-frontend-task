import { computed, watch } from 'vue'
import type { Task } from '../types/task'
import { getApiErrorMessage } from '../utils/api'
import { useTasksStore } from '../stores/tasks'

export async function useTasksData() {
  const tasksStore = useTasksStore()
  const asyncData = useAsyncData<Task[]>(
    'tasks:list',
    (_nuxtApp, { signal }) =>
      $fetch<Task[]>('/api/tasks', {
        signal,
      }),
    {
      deep: false,
      default: () => [],
      dedupe: 'cancel',
      lazy: true,
      server: true,
      timeout: 10_000,
    },
  )
  let hasObservedInitialValue = false

  watch(
    asyncData.data,
    (tasks) => {
      if (!hasObservedInitialValue) {
        hasObservedInitialValue = true

        if (!tasksStore.hasLoadedList && asyncData.status.value === 'success') {
          tasksStore.replaceTasks(tasks)
        }

        return
      }

      if (asyncData.status.value === 'success') {
        tasksStore.replaceTasks(tasks)
      }
    },
    {
      immediate: true,
    },
  )

  await asyncData

  if (!tasksStore.hasLoadedList && asyncData.status.value === 'success') {
    tasksStore.replaceTasks(asyncData.data.value)
  }

  const errorMessage = computed(() =>
    asyncData.error.value
      ? getApiErrorMessage(asyncData.error.value, 'We could not load your tasks. Please try again.')
      : null,
  )

  async function refreshTasks(): Promise<void> {
    await asyncData.refresh({
      dedupe: 'cancel',
    })

    if (asyncData.status.value === 'success') {
      tasksStore.replaceTasks(asyncData.data.value)
    }
  }

  return {
    pending: asyncData.pending,
    status: asyncData.status,
    error: asyncData.error,
    errorMessage,
    refreshTasks,
  }
}
