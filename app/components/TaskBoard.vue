<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Task, TaskStatus } from '../types/task'

const props = withDefaults(
  defineProps<{
    tasks: Task[]
    loading: boolean
    hasActiveFilters: boolean
    updatingTaskIds?: string[]
  }>(),
  {
    updatingTaskIds: () => [],
  },
)

const emit = defineEmits<{
  create: [status: TaskStatus]
  clearFilters: []
  edit: [task: Task]
  delete: [task: Task]
  statusChange: [task: Task, status: TaskStatus]
}>()

const boardColumns: ReadonlyArray<{
  status: TaskStatus
  label: string
  helper: string
  dotClass: string
  accentClass: string
  emptyMessage: string
}> = [
  {
    status: 'pending',
    label: 'Pending',
    helper: 'Ready to start',
    dotClass: 'bg-amber-500',
    accentClass: 'bg-amber-400',
    emptyMessage: 'No tasks are waiting.',
  },
  {
    status: 'in-progress',
    label: 'In progress',
    helper: 'Active work',
    dotClass: 'bg-sky-500',
    accentClass: 'bg-sky-400',
    emptyMessage: 'Nothing is in progress.',
  },
  {
    status: 'done',
    label: 'Done',
    helper: 'Completed work',
    dotClass: 'bg-mint-500',
    accentClass: 'bg-mint-400',
    emptyMessage: 'Completed tasks appear here.',
  },
]

const activeDropZone = ref<TaskStatus | null>(null)
const draggedTaskId = ref<string | null>(null)

const tasksByStatus = computed<Record<TaskStatus, Task[]>>(() => ({
  pending: props.tasks.filter((task) => task.status === 'pending'),
  'in-progress': props.tasks.filter((task) => task.status === 'in-progress'),
  done: props.tasks.filter((task) => task.status === 'done'),
}))

function handleDragStart(event: DragEvent, task: Task): void {
  draggedTaskId.value = task.id

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', task.id)
  }
}

function handleDragOver(event: DragEvent, status: TaskStatus): void {
  activeDropZone.value = status

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

function handleDrop(event: DragEvent, status: TaskStatus): void {
  const taskId = event.dataTransfer?.getData('text/plain') || draggedTaskId.value
  const task = props.tasks.find((candidate) => candidate.id === taskId)

  if (task && task.status !== status) {
    emit('statusChange', task, status)
  }

  resetDragState()
}

function handleStatusChange(task: Task, status: TaskStatus): void {
  emit('statusChange', task, status)
}

function resetDragState(): void {
  activeDropZone.value = null
  draggedTaskId.value = null
}
</script>

<template>
  <div v-if="loading" aria-label="Loading task board" class="overflow-x-auto pb-2">
    <div class="grid min-w-240 grid-cols-3 gap-4 xl:min-w-0">
      <div
        v-for="column in boardColumns"
        :key="column.status"
        class="min-h-110 animate-pulse rounded-2xl border border-slate-200 bg-slate-100/80 p-3"
      >
        <div class="h-10 rounded-xl bg-slate-200" />
        <div v-for="card in 3" :key="card" class="mt-3 h-34 rounded-xl bg-white" />
      </div>
    </div>
  </div>

  <div
    v-else-if="!tasks.length"
    class="rounded-3xl border border-dashed border-slate-300 bg-white/70 px-6 py-16 text-center"
  >
    <span class="mx-auto grid size-16 place-items-center rounded-2xl bg-brand-50 text-brand-700">
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
        <rect x="3" y="3" width="5" height="18" rx="1" />
        <rect x="10" y="3" width="5" height="12" rx="1" />
        <rect x="17" y="3" width="4" height="16" rx="1" />
      </svg>
    </span>
    <h2 class="mt-5 text-xl font-bold tracking-tight text-slate-950">
      {{ hasActiveFilters ? 'No matching tasks' : 'Your board is ready' }}
    </h2>
    <p class="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
      {{
        hasActiveFilters
          ? 'Try changing the search term or status filter to see more cards.'
          : 'Create a task to add the first card to your workflow.'
      }}
    </p>
    <button
      type="button"
      class="mt-6 inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
      @click="hasActiveFilters ? $emit('clearFilters') : $emit('create', 'pending')"
    >
      {{ hasActiveFilters ? 'Clear filters' : 'Create a task' }}
    </button>
  </div>

  <div v-else class="space-y-3">
    <div class="flex items-center gap-2 px-1 text-xs font-semibold text-slate-400">
      <svg
        aria-hidden="true"
        class="size-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
      >
        <path d="M5 9h14M5 15h14" />
        <path d="m9 5-4 4 4 4M15 11l4 4-4 4" />
      </svg>
      Drag cards between columns
      <span class="hidden sm:inline">or use each card’s status menu.</span>
    </div>

    <div class="overflow-x-auto pb-3">
      <div class="grid min-w-240 grid-cols-3 gap-4 xl:min-w-0">
        <section
          v-for="column in boardColumns"
          :key="column.status"
          :aria-labelledby="`board-${column.status}`"
          :class="
            activeDropZone === column.status
              ? 'border-brand-300 bg-brand-50/70 ring-2 ring-brand-200'
              : 'border-slate-200 bg-slate-100/80'
          "
          class="relative min-h-110 overflow-hidden rounded-2xl border p-3 transition"
          @dragenter.prevent="activeDropZone = column.status"
          @dragover.prevent="handleDragOver($event, column.status)"
          @drop.prevent="handleDrop($event, column.status)"
        >
          <span
            aria-hidden="true"
            :class="column.accentClass"
            class="absolute inset-x-0 top-0 h-1"
          />

          <header class="flex items-center justify-between gap-3 px-1 pt-2 pb-3">
            <div class="flex min-w-0 items-center gap-2.5">
              <span :class="column.dotClass" class="size-2.5 shrink-0 rounded-full" />
              <div class="min-w-0">
                <h3
                  :id="`board-${column.status}`"
                  class="truncate text-sm font-bold text-slate-900"
                >
                  {{ column.label }}
                </h3>
                <p class="text-[0.68rem] font-semibold text-slate-400">{{ column.helper }}</p>
              </div>
              <span
                class="grid min-w-6 place-items-center rounded-full bg-white px-1.5 py-0.5 text-[0.68rem] font-bold text-slate-600 shadow-sm"
              >
                {{ tasksByStatus[column.status].length }}
              </span>
            </div>

            <button
              type="button"
              :aria-label="`Add a task to ${column.label}`"
              class="grid size-8 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-white hover:text-brand-700 hover:shadow-sm"
              @click="$emit('create', column.status)"
            >
              <svg
                aria-hidden="true"
                class="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-width="2"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </header>

          <div class="space-y-2.5">
            <TaskBoardCard
              v-for="task in tasksByStatus[column.status]"
              :key="task.id"
              :task="task"
              :updating="updatingTaskIds.includes(task.id)"
              @drag-start="handleDragStart"
              @drag-end="resetDragState"
              @edit="$emit('edit', $event)"
              @delete="$emit('delete', $event)"
              @status-change="handleStatusChange"
            />

            <div
              v-if="!tasksByStatus[column.status].length"
              class="grid min-h-27 place-items-center rounded-xl border border-dashed border-slate-300 bg-white/50 p-4 text-center"
            >
              <p class="text-xs leading-5 font-semibold text-slate-400">
                {{ column.emptyMessage }}
              </p>
            </div>
          </div>

          <div
            v-if="activeDropZone === column.status"
            class="pointer-events-none absolute inset-x-3 bottom-3 rounded-xl border-2 border-dashed border-brand-300 bg-brand-100/60 px-3 py-3 text-center text-xs font-bold text-brand-700"
          >
            Drop card here
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
