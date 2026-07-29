<script setup lang="ts">
import type { TaskCounts } from '../types/task'

defineProps<{
  counts: TaskCounts
  completionRate: number
  loading: boolean
}>()

const statItems = [
  {
    key: 'total',
    label: 'Total tasks',
    helper: 'Across your workspace',
    iconClass: 'bg-brand-100 text-brand-700',
  },
  {
    key: 'pending',
    label: 'Pending',
    helper: 'Waiting to start',
    iconClass: 'bg-amber-100 text-amber-700',
  },
  {
    key: 'inProgress',
    label: 'In progress',
    helper: 'Active right now',
    iconClass: 'bg-sky-100 text-sky-700',
  },
  {
    key: 'done',
    label: 'Completed',
    helper: 'Ready to celebrate',
    iconClass: 'bg-mint-100 text-mint-600',
  },
] as const
</script>

<template>
  <section aria-label="Task overview" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
    <article
      v-for="item in statItems"
      :key="item.key"
      class="relative overflow-hidden rounded-2xl border border-white/80 bg-white/90 p-5 shadow-[0_12px_36px_rgb(15_23_42/0.06)]"
    >
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-sm font-semibold text-slate-500">{{ item.label }}</p>
          <div v-if="loading" class="mt-3 h-9 w-14 animate-pulse rounded-lg bg-slate-200" />
          <p v-else class="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            {{ counts[item.key] }}
          </p>
          <p class="mt-1 text-xs font-medium text-slate-400">{{ item.helper }}</p>
        </div>

        <span :class="item.iconClass" class="grid size-10 place-items-center rounded-xl">
          <svg
            v-if="item.key === 'total'"
            aria-hidden="true"
            class="size-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
          >
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <path d="M8 8h8M8 12h8M8 16h5" />
          </svg>
          <svg
            v-else-if="item.key === 'pending'"
            aria-hidden="true"
            class="size-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
          <svg
            v-else-if="item.key === 'inProgress'"
            aria-hidden="true"
            class="size-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
          >
            <path d="M12 3a9 9 0 1 0 9 9" />
            <path d="M12 3v9h9" />
          </svg>
          <svg
            v-else
            aria-hidden="true"
            class="size-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.25"
          >
            <path d="m5 12 4 4L19 6" />
          </svg>
        </span>
      </div>

      <div v-if="item.key === 'done'" class="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          class="h-full rounded-full bg-mint-500 transition-[width] duration-500"
          :style="{ width: `${completionRate}%` }"
        />
      </div>
    </article>
  </section>
</template>
