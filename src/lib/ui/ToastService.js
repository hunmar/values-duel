import { writable } from 'svelte/store';

// Create a writable store for toasts
const toasts = writable([]);

// Generate a unique ID for each toast
const generateId = () => `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// Toast service with methods to add and remove toasts
const ToastService = {
  // Subscribe to the toasts store
  subscribe: toasts.subscribe,

  // Add a new toast with default options
  add: (toast) => {
    const id = toast.id || generateId();
    const defaults = {
      id,
      type: 'default',
      title: '',
      message: '',
      duration: 5000, // Default duration in ms
      dismissible: true,
      position: 'top-right',
      showProgress: true,
    };

    const newToast = { ...defaults, ...toast };

    // Add the toast to the store
    toasts.update((all) => [newToast, ...all]);

    // Auto-dismiss after duration if duration > 0
    if (newToast.duration > 0) {
      setTimeout(() => {
        ToastService.dismiss(id);
      }, newToast.duration);
    }

    return id;
  },

  // Dismiss a toast by ID
  dismiss: (id) => {
    toasts.update((all) => all.filter((t) => t.id !== id));
  },

  // Clear all toasts
  clear: () => {
    toasts.set([]);
  },

  // Convenience methods for different toast types
  success: (options) => {
    return ToastService.add({
      type: 'success',
      ...options,
    });
  },

  error: (options) => {
    return ToastService.add({
      type: 'error',
      ...options,
    });
  },

  warning: (options) => {
    return ToastService.add({
      type: 'warning',
      ...options,
    });
  },

  info: (options) => {
    return ToastService.add({
      type: 'info',
      ...options,
    });
  },

  // Create a loading toast that can be updated later
  loading: (options) => {
    const id = generateId();

    ToastService.add({
      id,
      type: 'loading',
      title: 'Loading',
      message: 'Please wait...',
      duration: 0, // No auto-dismiss for loading toasts
      dismissible: false,
      showProgress: false,
      ...options,
    });

    // Return methods to update or complete the loading toast
    return {
      id,
      // Update the loading toast
      update: (updateOptions) => {
        toasts.update((all) => {
          return all.map((t) => {
            if (t.id === id) {
              return { ...t, ...updateOptions };
            }
            return t;
          });
        });
      },
      // Complete the loading toast with success
      success: (completeOptions) => {
        toasts.update((all) => {
          return all.map((t) => {
            if (t.id === id) {
              return {
                ...t,
                type: 'success',
                title: 'Success',
                message: 'Operation completed successfully',
                dismissible: true,
                duration: 5000,
                showProgress: true,
                ...completeOptions,
              };
            }
            return t;
          });
        });

        // Auto-dismiss after duration if specified
        const duration = completeOptions?.duration ?? 5000;
        if (duration > 0) {
          setTimeout(() => {
            ToastService.dismiss(id);
          }, duration);
        }
      },
      // Complete the loading toast with error
      error: (completeOptions) => {
        toasts.update((all) => {
          return all.map((t) => {
            if (t.id === id) {
              return {
                ...t,
                type: 'error',
                title: 'Error',
                message: 'Operation failed',
                dismissible: true,
                duration: 5000,
                showProgress: true,
                ...completeOptions,
              };
            }
            return t;
          });
        });

        // Auto-dismiss after duration if specified
        const duration = completeOptions?.duration ?? 5000;
        if (duration > 0) {
          setTimeout(() => {
            ToastService.dismiss(id);
          }, duration);
        }
      },
    };
  },
};

export default ToastService;
