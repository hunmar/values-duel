/**
 * Window interface extensions
 */
interface Window {
  /**
   * Global Toast Service for displaying notifications
   */
  ToastService?: {
    /**
     * Show a default toast notification
     * @param options - Toast options
     * @returns Toast ID
     */
    show: (options?: any) => string;

    /**
     * Show a success toast notification
     * @param options - Toast options
     * @returns Toast ID
     */
    success: (options?: any) => string;

    /**
     * Show an error toast notification
     * @param options - Toast options
     * @returns Toast ID
     */
    error: (options?: any) => string;

    /**
     * Show a warning toast notification
     * @param options - Toast options
     * @returns Toast ID
     */
    warning: (options?: any) => string;

    /**
     * Show an info toast notification
     * @param options - Toast options
     * @returns Toast ID
     */
    info: (options?: any) => string;

    /**
     * Dismiss a specific toast by ID
     * @param id - Toast ID
     */
    dismiss: (id: string) => void;

    /**
     * Dismiss all toasts
     */
    dismissAll: () => void;
  };
}
