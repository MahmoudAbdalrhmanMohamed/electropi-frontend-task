<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { storeToRefs } from 'pinia'
import type { TaskDraft, TaskStatus } from '../../types/task'
import { useTasksStore } from '../../stores/tasks'
import { formatDueDate, formatTimestamp, getDueDateMeta, getStatusLabel } from '../../utils/task'

const route = useRoute()
const tasksStore = useTasksStore()
const { error, isLoading, mutationError } = storeToRefs(tasksStore)

const isFormOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)
const toastMessage = ref('')
const toastTone = ref<'success' | 'error'>('success')
let toastTimer: ReturnType<typeof setTimeout> | undefined

const taskId = computed(() => {
  const routeId = route.params.id
  return Array.isArray(routeId) ? (routeId[0] ?? '') : (routeId ?? '')
})

const task = computed(() => tasksStore.getTaskById(taskId.value))
const dueDateMeta = computed(() => (task.value ? getDueDateMeta(task.value.dueDate) : null))
const showLoadingState = computed(() => isLoading.value)
const requestUrl = useRequestURL()
const canonicalUrl = computed(() =>
  new URL(`/tasks/${encodeURIComponent(taskId.value)}`, requestUrl.origin).toString(),
)
const metaDescription = computed(() => {
  const description = task.value?.description.replace(/\s+/g, ' ').trim()

  if (!description) {
    return 'View task status, due date, description, and recent activity in Taskflow.'
  }

  return description.length > 157 ? `${description.slice(0, 156).trimEnd()}…` : description
})

const statusClass: Record<TaskStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-600/15',
  'in-progress': 'bg-sky-50 text-sky-700 ring-sky-600/15',
  done: 'bg-mint-50 text-mint-600 ring-mint-600/15',
}

const dueDateClass = computed(() => {
  const tone = dueDateMeta.value?.tone ?? 'normal'
  const classes = {
    overdue: 'border-rose-200 bg-rose-50 text-rose-700',
    today: 'border-rose-200 bg-rose-50 text-rose-700',
    soon: 'border-amber-200 bg-amber-50 text-amber-700',
    normal: 'border-slate-200 bg-slate-50 text-slate-700',
  }

  return classes[tone]
})

useSeoMeta({
  title: () => task.value?.title ?? 'Task not found',
  description: () => metaDescription.value,
  ogTitle: () => `${task.value?.title ?? 'Task not found'} · Taskflow`,
  ogDescription: () => metaDescription.value,
  ogType: 'article',
  ogUrl: () => canonicalUrl.value,
  robots: () => (task.value ? 'index, follow' : 'noindex, follow'),
  twitterCard: 'summary',
})

useHead(() => ({
  link: [
    {
      rel: 'canonical',
      href: canonicalUrl.value,
    },
  ],
}))

async function loadTask(force = false): Promise<void> {
  await tasksStore.fetchTask(taskId.value, { force })
}

function showToast(message: string, tone: 'success' | 'error' = 'success'): void {
  toastMessage.value = message
  toastTone.value = tone
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
  }, 3_500)
}

async function saveTask(draft: TaskDraft): Promise<void> {
  if (!task.value) {
    return
  }

  isSaving.value = true

  try {
    await tasksStore.updateTask(task.value.id, draft)
    isFormOpen.value = false
    showToast('Task updated successfully.')
  } catch {
    showToast(mutationError.value ?? 'The task could not be saved. Please try again.', 'error')
  } finally {
    isSaving.value = false
  }
}

async function deleteTask(): Promise<void> {
  if (!task.value) {
    return
  }

  isDeleting.value = true

  try {
    await tasksStore.deleteTask(task.value.id)
    isDeleteDialogOpen.value = false
    await navigateTo('/')
  } catch {
    showToast(mutationError.value ?? 'The task could not be deleted. Please try again.', 'error')
  } finally {
    isDeleting.value = false
  }
}

await callOnce(`task-data:${taskId.value}`, () => tasksStore.fetchTask(taskId.value))

if (import.meta.server && !task.value && !error.value) {
  const event = useRequestEvent()

  if (event?.node?.res) {
    event.node.res.statusCode = 404
  }
}

onBeforeUnmount(() => {
  clearTimeout(toastTimer)
})
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
    <NuxtLink
      to="/"
      class="inline-flex items-center gap-2 rounded-lg text-sm font-bold text-slate-500 transition hover:text-brand-700"
    >
      <svg
        aria-hidden="true"
        class="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
      >
        <path d="m15 18-6-6 6-6" />
      </svg>
      Back to all tasks
    </NuxtLink>

    <div v-if="showLoadingState" class="mt-6 animate-pulse space-y-5">
      <div class="h-9 w-3/5 rounded-xl bg-slate-200" />
      <div class="h-5 w-2/5 rounded-lg bg-slate-100" />
      <div class="grid gap-5 pt-4 lg:grid-cols-[1fr_18rem]">
        <div class="h-80 rounded-3xl bg-white" />
        <div class="h-80 rounded-3xl bg-white" />
      </div>
    </div>

    <FeedbackAlert
      v-else-if="error"
      class="mt-6"
      title="Task could not be loaded"
      :message="error"
      @retry="loadTask(true)"
    />

    <div
      v-else-if="!task"
      class="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-18 text-center"
    >
      <span class="mx-auto grid size-16 place-items-center rounded-2xl bg-slate-100 text-slate-500">
        <svg
          aria-hidden="true"
          class="size-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.75"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9a2.7 2.7 0 0 1 5.2.9c0 2-2.7 2.1-2.7 4.1M12 18h.01" />
        </svg>
      </span>
      <h1 class="mt-5 text-2xl font-bold tracking-tight text-slate-950">Task not found</h1>
      <p class="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        This task may have been deleted, or the address might be incorrect.
      </p>
      <NuxtLink
        to="/"
        class="mt-6 inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
      >
        Return to workspace
      </NuxtLink>
    </div>

    <template v-else>
      <header class="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div class="min-w-0">
          <span
            :class="statusClass[task.status]"
            class="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset"
          >
            {{ getStatusLabel(task.status) }}
          </span>
          <h1
            class="mt-4 text-balance text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl"
          >
            {{ task.title }}
          </h1>
        </div>

        <div class="flex shrink-0 items-center gap-2">
          <button
            type="button"
            class="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
            @click="isFormOpen = true"
          >
            <svg
              aria-hidden="true"
              class="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
            </svg>
            Edit
          </button>
          <button
            type="button"
            aria-label="Delete task"
            class="grid size-11 place-items-center rounded-xl border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100"
            @click="isDeleteDialogOpen = true"
          >
            <svg
              aria-hidden="true"
              class="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            >
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
              <path d="M10 11v5M14 11v5" />
            </svg>
          </button>
        </div>
      </header>

      <div class="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <article
          class="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_40px_rgb(15_23_42/0.05)] sm:p-8"
        >
          <p class="text-xs font-bold tracking-[0.14em] text-slate-400 uppercase">Description</p>
          <p
            v-if="task.description"
            class="mt-4 whitespace-pre-wrap text-base leading-8 text-slate-700"
          >
            {{ task.description }}
          </p>
          <p v-else class="mt-4 text-base leading-8 text-slate-400">
            No description was added for this task.
          </p>

          <div class="mt-10 border-t border-slate-100 pt-6">
            <p class="text-xs font-bold tracking-[0.14em] text-slate-400 uppercase">Activity</p>
            <div class="mt-5 space-y-5">
              <div class="flex gap-3">
                <span
                  class="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700"
                >
                  <span class="size-2 rounded-full bg-brand-600" />
                </span>
                <div>
                  <p class="text-sm font-bold text-slate-800">Task created</p>
                  <p class="mt-0.5 text-xs font-medium text-slate-400">
                    {{ formatTimestamp(task.createdAt) }}
                  </p>
                </div>
              </div>
              <div class="flex gap-3">
                <span
                  class="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500"
                >
                  <span class="size-2 rounded-full bg-slate-400" />
                </span>
                <div>
                  <p class="text-sm font-bold text-slate-800">Last updated</p>
                  <p class="mt-0.5 text-xs font-medium text-slate-400">
                    {{ formatTimestamp(task.updatedAt) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </article>

        <aside class="space-y-4">
          <section
            :class="dueDateClass"
            class="rounded-3xl border p-5 shadow-[0_8px_30px_rgb(15_23_42/0.04)]"
          >
            <div class="flex items-center gap-2">
              <svg
                aria-hidden="true"
                class="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
              >
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M16 3v4M8 3v4M3 10h18" />
              </svg>
              <p class="text-xs font-bold tracking-[0.12em] uppercase">Due date</p>
            </div>
            <p class="mt-4 text-xl font-bold">{{ formatDueDate(task.dueDate) }}</p>
            <p class="mt-1 text-sm font-semibold opacity-80">{{ dueDateMeta?.label }}</p>
          </section>

          <section
            class="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgb(15_23_42/0.04)]"
          >
            <p class="text-xs font-bold tracking-[0.12em] text-slate-400 uppercase">Task ID</p>
            <p class="mt-3 break-all font-mono text-xs leading-5 font-semibold text-slate-600">
              {{ task.id }}
            </p>
          </section>
        </aside>
      </div>

      <TaskFormModal
        :open="isFormOpen"
        :task="task"
        :submitting="isSaving"
        @close="isFormOpen = false"
        @submit="saveTask"
      />

      <ConfirmDialog
        :open="isDeleteDialogOpen"
        :task-title="task.title"
        :submitting="isDeleting"
        @cancel="isDeleteDialogOpen = false"
        @confirm="deleteTask"
      />
    </template>

    <AppToast
      v-if="toastMessage"
      :message="toastMessage"
      :tone="toastTone"
      @close="toastMessage = ''"
    />
  </div>
</template>
