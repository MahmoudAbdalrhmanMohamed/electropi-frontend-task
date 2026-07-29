<script setup lang="ts">
import type { TaskStatusFilter } from '../types/task'
import { TASK_STATUS_OPTIONS } from '../types/task'

defineProps<{
  searchQuery: string
  statusFilter: TaskStatusFilter
  resultCount: number
  totalCount: number
}>()

const emit = defineEmits<{
  'update:searchQuery': [value: string]
  'update:statusFilter': [value: TaskStatusFilter]
  clear: []
}>()

const filterOptions: ReadonlyArray<{ value: TaskStatusFilter; label: string }> = [
  {
    value: 'all',
    label: 'All',
  },
  ...TASK_STATUS_OPTIONS.map(({ value, label }) => ({
    value,
    label,
  })),
]

function handleSearch(event: Event): void {
  emit('update:searchQuery', (event.target as HTMLInputElement).value)
}

function setStatusFilter(value: TaskStatusFilter): void {
  emit('update:statusFilter', value)
}
</script>

<template>
  <div class="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm sm:p-4">
    <div class="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <label class="relative block min-w-0 flex-1 xl:max-w-md">
        <span class="sr-only">Search tasks by title</span>
        <svg
          aria-hidden="true"
          class="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-slate-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-width="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="search"
          :value="searchQuery"
          placeholder="Search tasks by title…"
          class="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pr-10 pl-11 text-sm font-medium text-slate-900 transition placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-400 focus:bg-white"
          @input="handleSearch"
        />
        <button
          v-if="searchQuery"
          type="button"
          aria-label="Clear search"
          class="absolute top-1/2 right-2.5 grid size-7 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
          @click="$emit('update:searchQuery', '')"
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
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>
      </label>

      <div
        class="flex min-w-0 items-center gap-2 overflow-x-auto pb-1 xl:pb-0"
        role="group"
        aria-label="Filter by status"
      >
        <button
          v-for="option in filterOptions"
          :key="option.value"
          type="button"
          :aria-pressed="statusFilter === option.value"
          :class="
            statusFilter === option.value
              ? 'border-slate-950 bg-slate-950 text-white shadow-md shadow-slate-950/10'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950'
          "
          class="shrink-0 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition"
          @click="setStatusFilter(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <div class="mt-3 flex items-center justify-between border-t border-slate-100 px-1 pt-3">
      <p class="text-xs font-medium text-slate-500">
        Showing
        <span class="font-bold text-slate-800">{{ resultCount }}</span>
        of
        <span class="font-bold text-slate-800">{{ totalCount }}</span>
        tasks
      </p>
      <button
        v-if="searchQuery || statusFilter !== 'all'"
        type="button"
        class="text-xs font-bold text-brand-700 transition hover:text-brand-900"
        @click="$emit('clear')"
      >
        Clear filters
      </button>
    </div>
  </div>
</template>
