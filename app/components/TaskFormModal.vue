<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'
import type { Task, TaskDraft, TaskFormErrors, TaskStatus } from '../types/task'
import { TASK_STATUS_OPTIONS } from '../types/task'
import { getMinimumDueDate, normalizeTaskDraft, validateTaskDraft } from '../utils/task'

const props = defineProps<{
  open: boolean
  task?: Task | null
  initialStatus?: TaskStatus
  submitting?: boolean
}>()

const emit = defineEmits<{
  close: []
  submit: [draft: TaskDraft]
}>()

const titleInput = ref<HTMLInputElement | null>(null)
const errors = ref<TaskFormErrors>({})

const createEmptyForm = (): TaskDraft => ({
  title: '',
  description: '',
  status: props.initialStatus ?? 'pending',
  dueDate: getMinimumDueDate(),
})

const form = reactive<TaskDraft>(createEmptyForm())

const isEditing = computed(() => Boolean(props.task))
const modalTitle = computed(() => (isEditing.value ? 'Edit task' : 'Create a new task'))
const submitLabel = computed(() => (isEditing.value ? 'Save changes' : 'Create task'))
const minimumDueDate = computed(() => getMinimumDueDate())
const remainingDescriptionCharacters = computed(() => 500 - form.description.length)

function resetForm(): void {
  const nextForm = props.task
    ? {
        title: props.task.title,
        description: props.task.description,
        status: props.task.status,
        dueDate: props.task.dueDate,
      }
    : createEmptyForm()

  Object.assign(form, nextForm)
  errors.value = {}
}

function closeModal(): void {
  if (props.submitting) {
    return
  }

  emit('close')
}

function submitForm(): void {
  if (props.submitting) {
    return
  }

  const validationErrors = validateTaskDraft(form)
  errors.value = validationErrors

  if (Object.keys(validationErrors).length) {
    return
  }

  emit('submit', normalizeTaskDraft(form))
}

watch(
  [() => props.open, () => props.task, () => props.initialStatus],
  async ([isOpen]) => {
    if (!isOpen) {
      return
    }

    resetForm()
    await nextTick()
    titleInput.value?.focus()
  },
  {
    immediate: true,
  },
)

watch(
  () => props.open,
  (isOpen) => {
    if (!import.meta.client) {
      return
    }

    document.body.style.overflow = isOpen ? 'hidden' : ''
  },
)

onBeforeUnmount(() => {
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <Teleport to="body">
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
        class="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-6"
        @click.self="closeModal"
        @keydown.esc="closeModal"
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="task-form-title"
          :aria-busy="submitting"
          class="animate-modal-in max-h-[94vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl shadow-slate-950/30 sm:max-w-2xl sm:rounded-3xl"
        >
          <header
            class="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white/95 px-5 py-5 backdrop-blur sm:px-7"
          >
            <div>
              <p class="text-xs font-bold tracking-[0.16em] text-brand-700 uppercase">
                {{ isEditing ? 'Update details' : 'New item' }}
              </p>
              <h2 id="task-form-title" class="mt-1 text-xl font-bold tracking-tight text-slate-950">
                {{ modalTitle }}
              </h2>
            </div>
            <button
              type="button"
              aria-label="Close task form"
              :disabled="submitting"
              class="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              @click="closeModal"
            >
              <svg
                aria-hidden="true"
                class="size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-width="2"
              >
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          </header>

          <form class="space-y-6 px-5 py-6 sm:px-7" novalidate @submit.prevent="submitForm">
            <div>
              <label for="task-title" class="text-sm font-bold text-slate-800">
                Title <span class="text-rose-600">*</span>
              </label>
              <input
                id="task-title"
                ref="titleInput"
                v-model="form.title"
                type="text"
                maxlength="81"
                autocomplete="off"
                :disabled="submitting"
                placeholder="What needs to be done?"
                :aria-invalid="Boolean(errors.title)"
                :aria-describedby="errors.title ? 'task-title-error' : undefined"
                :class="
                  errors.title
                    ? 'border-rose-400 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-slate-200 bg-slate-50 focus:border-brand-400 focus:bg-white'
                "
                class="mt-2 h-12 w-full rounded-xl border px-4 text-sm font-medium text-slate-950 transition placeholder:text-slate-400"
                @input="errors.title = undefined"
              />
              <p
                v-if="errors.title"
                id="task-title-error"
                class="mt-1.5 text-xs font-semibold text-rose-600"
              >
                {{ errors.title }}
              </p>
            </div>

            <div>
              <div class="flex items-center justify-between gap-3">
                <label for="task-description" class="text-sm font-bold text-slate-800">
                  Description
                </label>
                <span
                  :class="remainingDescriptionCharacters < 0 ? 'text-rose-600' : 'text-slate-400'"
                  class="text-xs font-semibold"
                >
                  {{ remainingDescriptionCharacters }} characters left
                </span>
              </div>
              <textarea
                id="task-description"
                v-model="form.description"
                rows="4"
                :disabled="submitting"
                placeholder="Add context, expectations, or helpful notes…"
                :aria-invalid="Boolean(errors.description)"
                :aria-describedby="errors.description ? 'task-description-error' : undefined"
                :class="
                  errors.description
                    ? 'border-rose-400 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-slate-200 bg-slate-50 focus:border-brand-400 focus:bg-white'
                "
                class="mt-2 w-full resize-none rounded-xl border px-4 py-3 text-sm leading-6 text-slate-950 transition placeholder:text-slate-400"
                @input="errors.description = undefined"
              />
              <p
                v-if="errors.description"
                id="task-description-error"
                class="mt-1.5 text-xs font-semibold text-rose-600"
              >
                {{ errors.description }}
              </p>
            </div>

            <fieldset :disabled="submitting">
              <legend class="text-sm font-bold text-slate-800">Status</legend>
              <div class="mt-2 grid gap-2 sm:grid-cols-3">
                <label
                  v-for="option in TASK_STATUS_OPTIONS"
                  :key="option.value"
                  :class="
                    form.status === option.value
                      ? 'border-brand-400 bg-brand-50 ring-1 ring-brand-300'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  "
                  class="relative rounded-xl border p-3 transition"
                >
                  <input
                    v-model="form.status"
                    type="radio"
                    name="task-status"
                    :value="option.value"
                    class="sr-only"
                  />
                  <span class="block text-sm font-bold text-slate-900">{{ option.label }}</span>
                  <span class="mt-0.5 block text-xs leading-5 text-slate-500">
                    {{ option.description }}
                  </span>
                </label>
              </div>
            </fieldset>

            <div>
              <label for="task-due-date" class="text-sm font-bold text-slate-800">
                Due date <span class="text-rose-600">*</span>
              </label>
              <div class="relative mt-2">
                <input
                  id="task-due-date"
                  v-model="form.dueDate"
                  type="date"
                  :disabled="submitting"
                  :min="minimumDueDate"
                  :aria-invalid="Boolean(errors.dueDate)"
                  :aria-describedby="errors.dueDate ? 'task-due-date-error' : 'task-due-date-help'"
                  :class="
                    errors.dueDate
                      ? 'border-rose-400 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-500'
                      : 'border-slate-200 bg-slate-50 focus:border-brand-400 focus:bg-white'
                  "
                  class="h-12 w-full rounded-xl border px-4 text-sm font-semibold text-slate-900 transition"
                  @input="errors.dueDate = undefined"
                />
              </div>
              <p
                v-if="errors.dueDate"
                id="task-due-date-error"
                class="mt-1.5 text-xs font-semibold text-rose-600"
              >
                {{ errors.dueDate }}
              </p>
              <p v-else id="task-due-date-help" class="mt-1.5 text-xs font-medium text-slate-400">
                Choose tomorrow or any later date.
              </p>
            </div>

            <div
              class="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end"
            >
              <button
                type="button"
                :disabled="submitting"
                class="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                @click="closeModal"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white shadow-lg shadow-brand-600/20 transition hover:-translate-y-0.5 hover:bg-brand-700 disabled:cursor-wait disabled:opacity-70"
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
                <svg
                  v-else
                  aria-hidden="true"
                  class="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                >
                  <path v-if="isEditing" d="m5 12 4 4L19 6" />
                  <path v-else d="M12 5v14M5 12h14" />
                </svg>
                {{ submitting ? 'Saving…' : submitLabel }}
              </button>
            </div>
          </form>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>
