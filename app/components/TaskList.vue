<script setup lang="ts">
import type { Task } from '../types/task'

defineProps<{
  tasks: Task[]
  loading: boolean
  hasActiveFilters: boolean
}>()

defineEmits<{
  create: []
  clearFilters: []
  edit: [task: Task]
  delete: [task: Task]
}>()
</script>

<template>
  <div>
    <div v-if="loading" aria-label="Loading tasks" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="item in 6"
        :key="item"
        class="h-65 animate-pulse rounded-2xl border border-slate-200/80 bg-white p-5"
      >
        <div class="flex justify-between">
          <div class="h-6 w-24 rounded-full bg-slate-200" />
          <div class="h-8 w-20 rounded-xl bg-slate-100" />
        </div>
        <div class="mt-7 h-6 w-4/5 rounded-lg bg-slate-200" />
        <div class="mt-3 h-4 w-full rounded bg-slate-100" />
        <div class="mt-2 h-4 w-3/4 rounded bg-slate-100" />
        <div class="mt-8 border-t border-slate-100 pt-4">
          <div class="h-7 w-28 rounded-lg bg-slate-100" />
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
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M8 8h8M8 12h5" />
          <path d="m14 17 2 2 4-5" />
        </svg>
      </span>
      <h2 class="mt-5 text-xl font-bold tracking-tight text-slate-950">
        {{ hasActiveFilters ? 'No matching tasks' : 'Your workspace is clear' }}
      </h2>
      <p class="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {{
          hasActiveFilters
            ? 'Try changing the search term or status filter to see more tasks.'
            : 'Create your first task and turn the next important idea into a clear action.'
        }}
      </p>
      <button
        type="button"
        class="mt-6 inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
        @click="hasActiveFilters ? $emit('clearFilters') : $emit('create')"
      >
        {{ hasActiveFilters ? 'Clear filters' : 'Create a task' }}
      </button>
    </div>

    <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <TaskCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
      />
    </div>
  </div>
</template>
