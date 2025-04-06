/**
 * Type definitions for ToastService
 */

export interface ToastOptions {
  type?: string;
  title?: string;
  message?: string;
  duration?: number;
  position?: string;
  dismissible?: boolean;
  showProgress?: boolean;
  icon?: string | null;
  content?: string;
}

export interface Toast extends ToastOptions {
  id: string;
}

export interface ToastStore {
  toasts: Toast[];
  subscribers: ((toasts: Toast[]) => void)[];
  subscribe: (callback: (toasts: Toast[]) => void) => () => void;
  add: (toast: ToastOptions) => string;
  remove: (id: string) => void;
  notifySubscribers: () => void;
}

export interface ToastServiceInterface {
  show: (options?: ToastOptions) => string;
  success: (options?: ToastOptions) => string;
  error: (options?: ToastOptions) => string;
  warning: (options?: ToastOptions) => string;
  info: (options?: ToastOptions) => string;
  remove: (id: string) => void;
  clear: () => void;
}

declare global {
  interface Window {
    toastStore?: ToastStore;
    ToastService?: ToastServiceInterface;
  }
}

declare const ToastService: ToastServiceInterface;

export default ToastService;
