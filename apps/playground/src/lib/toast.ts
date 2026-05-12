export type ToastVariant = 'default' | 'success' | 'destructive' | 'warning';

export interface ToastOptions {
  variant?: ToastVariant;
  duration?: number;
}

export function toast(message: string, options: ToastOptions = {}): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('ai-toast', {
      detail: { message, ...options },
    }),
  );
}
