import { onMounted, ref, watch } from 'vue'
import type { TaskViewMode } from '../types/task'

const VIEW_MODE_STORAGE_KEY = 'taskflow:view-mode'

export function useTaskViewMode() {
  const viewMode = ref<TaskViewMode>('grid')

  onMounted(() => {
    const savedViewMode = localStorage.getItem(VIEW_MODE_STORAGE_KEY)

    if (savedViewMode === 'grid' || savedViewMode === 'board') {
      viewMode.value = savedViewMode
    }
  })

  watch(viewMode, (nextViewMode) => {
    if (import.meta.client) {
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, nextViewMode)
    }
  })

  return {
    viewMode,
  }
}
