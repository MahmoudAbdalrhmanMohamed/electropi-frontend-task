<template>
  <header class="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
    <div class="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <NuxtLink to="/" aria-label="Taskflow home" class="group flex items-center gap-3 rounded-xl">
        <span
          class="grid size-10 place-items-center rounded-xl bg-slate-950 text-white shadow-lg shadow-slate-950/15 transition-transform group-hover:-rotate-3 group-hover:scale-105"
        >
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

        <span>
          <span class="block text-base font-bold tracking-tight text-slate-950">Taskflow</span>
          <span class="hidden text-xs font-medium text-slate-500 sm:block">Work with clarity</span>
        </span>
      </NuxtLink>

      <div class="flex items-center gap-3">
        <span
          class="hidden rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm sm:inline-flex"
        >
          Front-end task
        </span>

        <NuxtLink
          to="/#tasks"
          class="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-3.5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-slate-800"
        >
          View tasks
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
            <path d="m9 18 6-6-6-6" />
          </svg>
        </NuxtLink>
      </div>
    </div>
  </header>
</template>
