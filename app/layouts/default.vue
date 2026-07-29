<template>
  <div class="flex min-h-screen flex-col">
    <AppHeader />

    <main id="main-content" class="flex-1">
      <slot />
    </main>

    <footer class="border-t border-slate-200/80 bg-white/70">
      <div
        class="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"
      >
        <p>Taskflow — focused work, clearly organized.</p>
        <p>Nuxt 4 · Pinia · TypeScript · Tailwind CSS 4</p>
      </div>
    </footer>
  </div>
</template>
