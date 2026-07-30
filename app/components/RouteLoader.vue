<script setup lang="ts">
const nuxtApp = useNuxtApp()

const load = ref(false)

nuxtApp.hook('page:start', () => {
  load.value = true
})

nuxtApp.hook('page:finish', () => {
  load.value = false
})
</script>

<template>
  <NuxtLoadingIndicator color="#5b5ce2" :height="4" />

  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <section
      v-if="load"
      class="fixed inset-0 z-50 grid place-items-center overflow-hidden bg-slate-950/80 px-6 backdrop-blur-md"
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_24%_20%,rgb(91_92_226/28%),transparent_24rem),radial-gradient(circle_at_78%_68%,rgb(32_185_138/22%),transparent_22rem)]"
      />

      <div class="relative grid w-full max-w-sm justify-items-center gap-6 text-center">
        <div class="relative grid size-24 place-items-center">
          <svg
            aria-hidden="true"
            class="loader-ring loader-ring-outer absolute inset-0 size-24"
            viewBox="0 0 96 96"
            fill="none"
          >
            <circle class="stroke-brand-300/25" cx="48" cy="48" r="42" stroke-width="2" />
            <circle
              class="stroke-mint-300"
              cx="48"
              cy="48"
              r="42"
              stroke-linecap="round"
              stroke-width="4"
              stroke-dasharray="72 192"
            />
          </svg>
          <svg
            aria-hidden="true"
            class="loader-ring loader-ring-inner absolute inset-2 size-20"
            viewBox="0 0 80 80"
            fill="none"
          >
            <circle
              class="stroke-brand-300"
              cx="40"
              cy="40"
              r="34"
              stroke-linecap="round"
              stroke-width="3"
              stroke-dasharray="42 160"
            />
          </svg>
          <span class="absolute inset-5 rounded-full bg-white/10 shadow-2xl shadow-brand-500/30 backdrop-blur" />
          <span class="relative grid size-10 place-items-center rounded-xl bg-white text-slate-950 shadow-lg shadow-slate-950/20">
            <svg
              aria-hidden="true"
              class="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.25"
            >
              <path d="M5 6h14M5 12h9M5 18h6" />
              <path d="m17 17 2 2 4-5" />
            </svg>
          </span>
        </div>

        <div class="space-y-2">
          <p class="text-sm font-semibold uppercase tracking-[0.24em] text-mint-200">Taskflow</p>
          <p class="text-xl font-bold text-white">Loading page</p>
        </div>
      </div>
    </section>
  </Transition>
</template>

<style scoped>
.loader-ring {
  transform-origin: center;
  animation: rotation 1s linear infinite;
}

.loader-ring-inner {
  animation-duration: 1.45s;
  animation-direction: reverse;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
