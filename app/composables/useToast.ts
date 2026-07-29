import { onScopeDispose, ref } from 'vue'

export type ToastTone = 'success' | 'error'

export function useToast(duration = 3_500) {
  const toastMessage = ref('')
  const toastTone = ref<ToastTone>('success')
  let toastTimer: ReturnType<typeof setTimeout> | undefined

  function dismissToast(): void {
    clearTimeout(toastTimer)
    toastMessage.value = ''
  }

  function showToast(message: string, tone: ToastTone = 'success'): void {
    toastMessage.value = message
    toastTone.value = tone
    clearTimeout(toastTimer)
    toastTimer = setTimeout(dismissToast, duration)
  }

  onScopeDispose(() => {
    clearTimeout(toastTimer)
  })

  return {
    toastMessage,
    toastTone,
    showToast,
    dismissToast,
  }
}
