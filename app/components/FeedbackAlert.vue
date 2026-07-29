<script setup lang="ts">
defineProps<{
  title?: string
  message: string
}>()

defineEmits<{
  retry: []
}>()
</script>

<template>
  <div
    role="alert"
    class="flex flex-col gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-5 sm:flex-row sm:items-center sm:justify-between"
  >
    <div class="flex gap-3">
      <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-rose-100 text-rose-700">
        <svg
          aria-hidden="true"
          class="size-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
        >
          <path d="M12 9v4M12 17h.01" />
          <path
            d="M10.3 3.5 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.5a2 2 0 0 0-3.4 0Z"
          />
        </svg>
      </span>
      <div>
        <h2 class="font-bold text-rose-950">{{ title ?? 'Something went wrong' }}</h2>
        <p class="mt-1 text-sm leading-6 text-rose-800">{{ message }}</p>
      </div>
    </div>

    <button
      type="button"
      class="inline-flex shrink-0 items-center justify-center rounded-xl bg-rose-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-800"
      @click="$emit('retry')"
    >
      Try again
    </button>
  </div>
</template>
