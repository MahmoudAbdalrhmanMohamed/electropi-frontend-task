<script setup lang="ts">
withDefaults(
  defineProps<{
    message: string
    tone?: 'success' | 'error'
  }>(),
  {
    tone: 'success',
  },
)

defineEmits<{
  close: []
}>()
</script>

<template>
  <Teleport to="body">
    <div
      :role="tone === 'error' ? 'alert' : 'status'"
      :aria-live="tone === 'error' ? 'assertive' : 'polite'"
      :class="tone === 'error' ? 'border-rose-700' : 'border-slate-700'"
      class="animate-toast-in fixed right-4 bottom-4 z-60 flex max-w-sm items-center gap-3 rounded-2xl border bg-slate-950 px-4 py-3.5 text-white shadow-2xl shadow-slate-950/30 sm:right-6 sm:bottom-6"
    >
      <span
        :class="tone === 'error' ? 'bg-rose-400/15 text-rose-300' : 'bg-mint-400/15 text-mint-300'"
        class="grid size-8 shrink-0 place-items-center rounded-full"
      >
        <svg
          aria-hidden="true"
          class="size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2.5"
        >
          <path v-if="tone === 'error'" d="M12 8v5M12 17h.01" />
          <path v-else d="m5 12 4 4L19 6" />
          <circle v-if="tone === 'error'" cx="12" cy="12" r="9" />
        </svg>
      </span>
      <p class="flex-1 text-sm font-semibold">{{ message }}</p>
      <button
        type="button"
        aria-label="Dismiss notification"
        class="rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
        @click="$emit('close')"
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
    </div>
  </Teleport>
</template>
