<script setup lang="ts">
import { computed } from 'vue'
import type { Task, TaskStatus } from '../types/task'
import { TASK_STATUS_OPTIONS } from '../types/task'
import { formatDueDate, getDueDateMeta } from '../utils/task'

const props = defineProps<{
  task: Task
  updating?: boolean
}>()

const emit = defineEmits<{
  dragStart: [event: DragEvent, task: Task]
  dragEnd: []
  edit: [task: Task]
  delete: [task: Task]
  statusChange: [task: Task, status: TaskStatus]
}>()

const dueDateMeta = computed(() => getDueDateMeta(props.task.dueDate))

const dueDateClass = computed(() => {
  const classes = {
    overdue: 'text-rose-700 bg-rose-50',
    today: 'text-rose-700 bg-rose-50',
    soon: 'text-amber-700 bg-amber-50',
    normal: 'text-slate-500 bg-slate-100',
  }

  return classes[dueDateMeta.value.tone]
})

function handleStatusChange(event: Event): void {
  if (props.updating) {
    return
  }

  emit('statusChange', props.task, (event.target as HTMLSelectElement).value as TaskStatus)
}

function handleDragStart(event: DragEvent): void {
  if (props.updating) {
    event.preventDefault()
    return
  }

  emit('dragStart', event, props.task)
}
</script>

<template>
  <article
    :draggable="!updating"
    :aria-busy="updating"
    :class="
      updating
        ? 'cursor-wait opacity-70'
        : 'cursor-grab hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[0_8px_20px_rgb(15_23_42/0.1)] active:cursor-grabbing'
    "
    class="group rounded-xl border border-slate-200 bg-white p-3.5 shadow-[0_3px_10px_rgb(15_23_42/0.06)] transition"
    @dragstart="handleDragStart"
    @dragend="$emit('dragEnd')"
  >
    <div class="flex items-start gap-2">
      <span
        aria-hidden="true"
        class="mt-1 grid shrink-0 grid-cols-2 gap-0.5 text-slate-300 transition group-hover:text-slate-500"
      >
        <span v-for="dot in 6" :key="dot" class="size-0.75 rounded-full bg-current" />
      </span>

      <div class="min-w-0 flex-1">
        <NuxtLink
          :to="`/tasks/${task.id}`"
          class="rounded text-sm leading-5 font-bold text-slate-900 transition hover:text-brand-700"
        >
          {{ task.title }}
        </NuxtLink>
        <p v-if="task.description" class="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500">
          {{ task.description }}
        </p>
      </div>

      <span
        v-if="updating"
        role="status"
        aria-label="Updating task status"
        class="grid size-7 shrink-0 place-items-center text-brand-600"
      >
        <svg aria-hidden="true" class="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="9" stroke="currentColor" stroke-width="3" />
          <path
            class="opacity-90"
            d="M21 12a9 9 0 0 0-9-9"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-width="3"
          />
        </svg>
      </span>

      <div v-else class="flex shrink-0 items-center">
        <button
          type="button"
          :aria-label="`Edit ${task.title}`"
          class="grid size-7 place-items-center rounded-lg text-slate-400 transition hover:bg-brand-50 hover:text-brand-700"
          @click="$emit('edit', task)"
        >
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
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
          </svg>
        </button>
        <button
          type="button"
          :aria-label="`Delete ${task.title}`"
          class="grid size-7 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-700"
          @click="$emit('delete', task)"
        >
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
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
          </svg>
        </button>
      </div>
    </div>

    <div
      class="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3"
    >
      <span
        :class="dueDateClass"
        :title="formatDueDate(task.dueDate)"
        class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[0.68rem] font-bold"
      >
        <svg
          aria-hidden="true"
          class="size-3"
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
        {{ dueDateMeta.label }}
      </span>

      <select
        :value="task.status"
        :aria-label="`Move ${task.title} to another status`"
        :disabled="updating"
        class="h-7 max-w-30 rounded-lg border border-slate-200 bg-slate-50 px-1.5 text-[0.68rem] font-bold text-slate-600 transition hover:border-slate-300 hover:bg-white disabled:cursor-wait disabled:opacity-60"
        @change="handleStatusChange"
      >
        <option v-for="option in TASK_STATUS_OPTIONS" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </div>
  </article>
</template>
