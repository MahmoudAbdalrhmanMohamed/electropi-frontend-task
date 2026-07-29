<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import type { Task, TaskDraft, TaskStatus, TaskViewMode } from '../types/task'
import { useTasksStore } from '../stores/tasks'
import { getStatusLabel } from '../utils/task'

useHead({
  link: [
    {
      rel: 'canonical',
      href: new URL('/', useRequestURL().origin).toString(),
    },
  ],
})

useSeoMeta({
  title: 'Task workspace',
  description:
    'Plan, organize, and track tasks in a responsive grid or Trello-style board workspace.',
  ogTitle: 'Task workspace · Taskflow',
  ogDescription:
    'Plan, organize, and track tasks in a responsive grid or Trello-style board workspace.',
  ogType: 'website',
  ogUrl: new URL('/', useRequestURL().origin).toString(),
  twitterCard: 'summary',
})

const tasksStore = useTasksStore()
const {
  counts,
  completionRate,
  error,
  filteredTasks,
  hasActiveFilters,
  isLoading,
  mutationError,
  searchQuery,
  statusFilter,
} = storeToRefs(tasksStore)

const isFormOpen = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)
const editingTask = ref<Task | null>(null)
const taskToDelete = ref<Task | null>(null)
const newTaskStatus = ref<TaskStatus>('pending')
const viewMode = ref<TaskViewMode>('grid')
const toastMessage = ref('')
const toastTone = ref<'success' | 'error'>('success')
let toastTimer: ReturnType<typeof setTimeout> | undefined

const VIEW_MODE_STORAGE_KEY = 'taskflow:view-mode'

const showLoadingState = computed(() => isLoading.value)

function showToast(message: string, tone: 'success' | 'error' = 'success'): void {
  toastMessage.value = message
  toastTone.value = tone
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
  }, 3_500)
}

function openCreateForm(status: TaskStatus = 'pending'): void {
  editingTask.value = null
  newTaskStatus.value = status
  isFormOpen.value = true
}

function openEditForm(task: Task): void {
  editingTask.value = task
  isFormOpen.value = true
}

function closeForm(): void {
  isFormOpen.value = false
  editingTask.value = null
  newTaskStatus.value = 'pending'
}

async function saveTask(draft: TaskDraft): Promise<void> {
  isSaving.value = true

  try {
    if (editingTask.value) {
      await tasksStore.updateTask(editingTask.value.id, draft)
      showToast('Task updated successfully.')
    } else {
      await tasksStore.createTask(draft)
      showToast('Task created successfully.')
    }

    closeForm()
  } catch {
    showToast(mutationError.value ?? 'The task could not be saved. Please try again.', 'error')
  } finally {
    isSaving.value = false
  }
}

function requestDelete(task: Task): void {
  taskToDelete.value = task
}

async function confirmDelete(): Promise<void> {
  const selectedTask = taskToDelete.value

  if (!selectedTask) {
    return
  }

  isDeleting.value = true

  try {
    await tasksStore.deleteTask(selectedTask.id)
    taskToDelete.value = null
    showToast('Task deleted successfully.')
  } catch {
    showToast(mutationError.value ?? 'The task could not be deleted. Please try again.', 'error')
  } finally {
    isDeleting.value = false
  }
}

async function changeTaskStatus(task: Task, status: TaskStatus): Promise<void> {
  const previousStatus = task.status

  if (previousStatus === status) {
    return
  }

  try {
    const updatedTask = await tasksStore.changeTaskStatus(task.id, status)

    if (updatedTask) {
      showToast(`Task moved to ${getStatusLabel(status)}.`)
    }
  } catch {
    showToast(
      mutationError.value ?? 'The task status could not be changed. Please try again.',
      'error',
    )
  }
}

async function loadTasks(force = false): Promise<void> {
  await tasksStore.fetchTasks({ force })
}

await callOnce('task-data', () => tasksStore.fetchTasks())

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

onBeforeUnmount(() => {
  clearTimeout(toastTimer)
})
</script>

<template>
  <div>
    <section class="relative overflow-hidden border-b border-slate-200/70">
      <div
        aria-hidden="true"
        class="absolute top-[-9rem] right-[-8rem] size-80 rounded-full bg-brand-300/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        class="absolute bottom-[-10rem] left-[18%] size-72 rounded-full bg-mint-300/20 blur-3xl"
      />

      <div
        class="relative mx-auto grid max-w-7xl items-end gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1fr_auto] lg:px-8"
      >
        <div class="max-w-3xl">
          <span
            class="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/70 px-3 py-1.5 text-xs font-bold text-brand-800 shadow-sm backdrop-blur"
          >
            <span class="size-1.5 rounded-full bg-brand-600" />
            Your focused workspace
          </span>
          <h1
            class="mt-5 max-w-2xl text-balance text-4xl font-bold tracking-[-0.04em] text-slate-950 sm:text-5xl"
          >
            Plan the work.
            <span class="text-brand-600">Make progress visible.</span>
          </h1>
          <p class="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Keep priorities clear, move work forward, and give every task a finish line.
          </p>
        </div>

        <button
          type="button"
          class="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white shadow-xl shadow-brand-600/25 transition hover:-translate-y-0.5 hover:bg-brand-700 lg:mb-1"
          @click="openCreateForm()"
        >
          <svg
            aria-hidden="true"
            class="size-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-width="2.25"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add new task
        </button>
      </div>
    </section>

    <div class="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <DashboardStats
        :counts="counts"
        :completion-rate="completionRate"
        :loading="showLoadingState"
      />

      <FeedbackAlert
        v-if="error"
        title="Tasks could not be loaded"
        :message="error"
        @retry="loadTasks(true)"
      />

      <section v-else id="tasks" class="scroll-mt-24 space-y-4" aria-labelledby="task-list-title">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-xs font-bold tracking-[0.14em] text-brand-700 uppercase">Workspace</p>
            <h2 id="task-list-title" class="mt-1 text-2xl font-bold tracking-tight text-slate-950">
              Your tasks
            </h2>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <p class="text-sm font-medium text-slate-500">
              {{ counts.done }} of {{ counts.total }} completed
            </p>
            <TaskViewToggle v-model="viewMode" />
          </div>
        </div>

        <TaskToolbar
          v-model:search-query="searchQuery"
          v-model:status-filter="statusFilter"
          :result-count="filteredTasks.length"
          :total-count="counts.total"
          @clear="tasksStore.clearFilters"
        />

        <TaskList
          v-if="viewMode === 'grid'"
          :tasks="filteredTasks"
          :loading="showLoadingState"
          :has-active-filters="hasActiveFilters"
          @create="openCreateForm"
          @clear-filters="tasksStore.clearFilters"
          @edit="openEditForm"
          @delete="requestDelete"
        />

        <TaskBoard
          v-else
          :tasks="filteredTasks"
          :loading="showLoadingState"
          :has-active-filters="hasActiveFilters"
          @create="openCreateForm"
          @clear-filters="tasksStore.clearFilters"
          @edit="openEditForm"
          @delete="requestDelete"
          @status-change="changeTaskStatus"
        />
      </section>
    </div>

    <TaskFormModal
      :open="isFormOpen"
      :task="editingTask"
      :initial-status="newTaskStatus"
      :submitting="isSaving"
      @close="closeForm"
      @submit="saveTask"
    />

    <ConfirmDialog
      :open="Boolean(taskToDelete)"
      :task-title="taskToDelete?.title ?? ''"
      :submitting="isDeleting"
      @cancel="taskToDelete = null"
      @confirm="confirmDelete"
    />

    <AppToast
      v-if="toastMessage"
      :message="toastMessage"
      :tone="toastTone"
      @close="toastMessage = ''"
    />
  </div>
</template>
