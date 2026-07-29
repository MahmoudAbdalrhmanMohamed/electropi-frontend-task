<script setup lang="ts">
import type { TaskViewMode } from '../types/task'

defineProps<{
  modelValue: TaskViewMode
}>()

defineEmits<{
  'update:modelValue': [value: TaskViewMode]
}>()
</script>

<template>
  <div
    role="group"
    aria-label="Choose task layout"
    class="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm"
  >
    <button
      type="button"
      :aria-pressed="modelValue === 'grid'"
      :class="
        modelValue === 'grid'
          ? 'bg-slate-950 text-white shadow-sm'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      "
      class="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-bold transition"
      @click="$emit('update:modelValue', 'grid')"
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
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
      Grid
    </button>

    <button
      type="button"
      :aria-pressed="modelValue === 'board'"
      :class="
        modelValue === 'board'
          ? 'bg-slate-950 text-white shadow-sm'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      "
      class="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-bold transition"
      @click="$emit('update:modelValue', 'board')"
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
        <rect x="3" y="3" width="5" height="18" rx="1" />
        <rect x="10" y="3" width="5" height="12" rx="1" />
        <rect x="17" y="3" width="4" height="16" rx="1" />
      </svg>
      Board
    </button>
  </div>
</template>
