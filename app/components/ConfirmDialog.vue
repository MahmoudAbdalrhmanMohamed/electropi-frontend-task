<script setup lang="ts">
const props = defineProps<{
  open: boolean
  taskTitle: string
  submitting?: boolean
}>()

const emit = defineEmits<{
  cancel: []
  confirm: []
}>()

function cancel(): void {
  if (!props.submitting) {
    emit('cancel')
  }
}

function confirm(): void {
  if (!props.submitting) {
    emit('confirm')
  }
}
</script>

<template>
  <Teleport to="#teleports">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
        @click.self="cancel"
        @keydown.esc="cancel"
      >
        <section
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
          :aria-busy="submitting"
          class="animate-modal-in w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl shadow-slate-950/30"
        >
          <span class="grid size-12 place-items-center rounded-2xl bg-rose-100 text-rose-700">
            <svg
              aria-hidden="true"
              class="size-6"
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
          </span>

          <h2 id="delete-dialog-title" class="mt-5 text-xl font-bold tracking-tight text-slate-950">
            Delete this task?
          </h2>
          <p id="delete-dialog-description" class="mt-2 text-sm leading-6 text-slate-500">
            <span class="font-semibold text-slate-700">“{{ taskTitle }}”</span>
            will be permanently removed. This action cannot be undone.
          </p>

          <div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              :disabled="submitting"
              class="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              @click="cancel"
            >
              Keep task
            </button>
            <button
              type="button"
              :disabled="submitting"
              class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-bold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700 disabled:cursor-wait disabled:opacity-70"
              @click="confirm"
            >
              <svg
                v-if="submitting"
                aria-hidden="true"
                class="size-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  class="opacity-30"
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  stroke-width="3"
                />
                <path
                  class="opacity-90"
                  d="M21 12a9 9 0 0 0-9-9"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-width="3"
                />
              </svg>
              {{ submitting ? 'Deleting…' : 'Delete task' }}
            </button>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>
