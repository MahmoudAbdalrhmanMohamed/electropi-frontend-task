<script setup lang="ts">
import { computed } from 'vue'
import type { Task, TaskStatus } from '../types/task'
import { formatDueDate, getDueDateMeta, getStatusLabel } from '../utils/task'

const props = defineProps<{
  task: Task
}>()

defineEmits<{
  edit: [task: Task]
  delete: [task: Task]
}>()

const dueDateMeta = computed(() => getDueDateMeta(props.task.dueDate))

const statusClass: Record<TaskStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-600/15',
  'in-progress': 'bg-sky-50 text-sky-700 ring-sky-600/15',
  done: 'bg-mint-50 text-mint-600 ring-mint-600/15',
}

const statusDotClass: Record<TaskStatus, string> = {
  pending: 'bg-amber-500',
  'in-progress': 'bg-sky-500',
  done: 'bg-mint-500',
}

const dueDateClass = computed(() => {
  const classes = {
    overdue: 'bg-rose-50 text-rose-700',
    today: 'bg-rose-50 text-rose-700',
    soon: 'bg-amber-50 text-amber-700',
    normal: 'bg-slate-100 text-slate-600',
  }

  return classes[dueDateMeta.value.tone]
})
</script>

<template>
  <article
    class="group flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_30px_rgb(15_23_42/0.045)] transition duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-[0_18px_45px_rgb(15_23_42/0.09)]"
  >
    <div class="flex items-start justify-between gap-3">
      <span
        :class="statusClass[task.status]"
        class="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset"
      >
        <span :class="statusDotClass[task.status]" class="size-1.5 rounded-full" />
        {{ getStatusLabel(task.status) }}
      </span>

      <div class="flex items-center gap-1">
        <button
          type="button"
          :aria-label="`Edit ${task.title}`"
          class="grid size-9 place-items-center rounded-xl text-slate-400 transition hover:bg-brand-50 hover:text-brand-700"
          @click="$emit('edit', task)"
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
        </button>
        <button
          type="button"
          :aria-label="`Delete ${task.title}`"
          class="grid size-9 place-items-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-700"
          @click="$emit('delete', task)"
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
    </div>

    <div class="mt-5 flex-1">
      <NuxtLink
        :to="`/tasks/${task.id}`"
        class="rounded-md text-lg font-bold tracking-tight text-slate-950 transition group-hover:text-brand-700"
      >
        {{ task.title }}
      </NuxtLink>
      <p class="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
        {{ task.description || 'No description was added for this task.' }}
      </p>
    </div>

    <div
      class="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4"
    >
      <span
        :class="dueDateClass"
        class="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold"
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
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M16 3v4M8 3v4M3 10h18" />
        </svg>
        {{ dueDateMeta.label }}
      </span>
      <span class="text-xs font-semibold text-slate-400">{{ formatDueDate(task.dueDate) }}</span>
    </div>
  </article>
</template>
