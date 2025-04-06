<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { fly, fade } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import ToastService from './ToastService.js';

  export let position = 'top-right'; // top-right, top-left, bottom-right, bottom-left, top-center, bottom-center
  export let limit = 5; // Maximum number of toasts to show at once
  export let gap = '0.5rem'; // Gap between toasts
  export let zIndex = 9999; // z-index for the toast container

  const dispatch = createEventDispatcher();
  let toasts = [];
  let unsubscribe;

  // Subscribe to the toast service
  onMount(() => {
    unsubscribe = ToastService.subscribe((value) => {
      toasts = value.slice(0, limit);
    });
  });

  // Unsubscribe when component is destroyed
  onDestroy(() => {
    if (unsubscribe) unsubscribe();
  });

  // Dismiss a toast
  function dismiss(id) {
    ToastService.dismiss(id);
    dispatch('dismiss', { id });
  }

  // Get animation settings based on position
  function getAnimationSettings(position) {
    const settings = { duration: 300, easing: quintOut };

    if (position.includes('top')) {
      return { ...settings, y: -20 };
    } else if (position.includes('bottom')) {
      return { ...settings, y: 20 };
    } else if (position.includes('left')) {
      return { ...settings, x: -20 };
    } else if (position.includes('right')) {
      return { ...settings, x: 20 };
    }

    return { ...settings, y: -20 }; // Default
  }

  // Get container position styles
  function getContainerStyles(position) {
    const styles = {
      'top-right': 'top: 1rem; right: 1rem; align-items: flex-end;',
      'top-left': 'top: 1rem; left: 1rem; align-items: flex-start;',
      'bottom-right': 'bottom: 1rem; right: 1rem; align-items: flex-end;',
      'bottom-left': 'bottom: 1rem; left: 1rem; align-items: flex-start;',
      'top-center': 'top: 1rem; left: 50%; transform: translateX(-50%); align-items: center;',
      'bottom-center': 'bottom: 1rem; left: 50%; transform: translateX(-50%); align-items: center;'
    };

    return styles[position] || styles['top-right'];
  }

  // Get icon based on toast type
  function getIcon(toast) {
    if (toast.icon) return toast.icon;

    const icons = {
      success: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
      error: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
      warning: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
      info: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
      default: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
    };

    return icons[toast.type] || icons.default;
  }
</script>

<div
  class="toast-container"
  style="z-index: {zIndex}; {getContainerStyles(position)}; gap: {gap};"
  role="region"
  aria-label="Notifications"
>
  {#each toasts as toast (toast.id)}
    <div
      class="toast toast-{toast.type}"
      role="alert"
      in:fly={getAnimationSettings(position)}
      out:fade={{ duration: 200 }}
    >
      <div class="toast-content">
        <div class="toast-icon" aria-hidden="true">
          {@html getIcon(toast)}
        </div>

        <div class="toast-body">
          {#if toast.title}
            <div class="toast-title">{toast.title}</div>
          {/if}

          {#if toast.message}
            <div class="toast-message">{toast.message}</div>
          {/if}
        </div>

        {#if toast.dismissible}
          <button
            class="toast-close"
            on:click={() => dismiss(toast.id)}
            aria-label="Close notification"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        {/if}
      </div>

      {#if toast.showProgress && toast.duration > 0}
        <div class="toast-progress-container">
          <div
            class="toast-progress"
            style="animation-duration: {toast.duration}ms;"
          ></div>
        </div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    display: flex;
    flex-direction: column;
    max-width: 420px;
    width: 100%;
    pointer-events: none;
  }

  .toast {
    background-color: var(--card-bg, #ffffff);
    color: var(--text-color, #333333);
    border-radius: var(--radius-md, 0.375rem);
    box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06));
    margin-bottom: 0.5rem;
    overflow: hidden;
    pointer-events: auto;
    width: 100%;
    border-left: 4px solid transparent;
  }

  .toast-success {
    border-left-color: var(--success-color, #22c55e);
  }

  .toast-error {
    border-left-color: var(--error-color, #ef4444);
  }

  .toast-warning {
    border-left-color: var(--warning-color, #f59e0b);
  }

  .toast-info {
    border-left-color: var(--info-color, #3b82f6);
  }

  .toast-content {
    display: flex;
    align-items: flex-start;
    padding: 1rem;
  }

  .toast-icon {
    flex-shrink: 0;
    margin-right: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .toast-success .toast-icon {
    color: var(--success-color, #22c55e);
  }

  .toast-error .toast-icon {
    color: var(--error-color, #ef4444);
  }

  .toast-warning .toast-icon {
    color: var(--warning-color, #f59e0b);
  }

  .toast-info .toast-icon {
    color: var(--info-color, #3b82f6);
  }

  .toast-body {
    flex: 1;
    min-width: 0;
  }

  .toast-title {
    font-weight: var(--font-weight-semibold, 600);
    font-size: var(--font-size-sm, 0.875rem);
    margin-bottom: 0.25rem;
  }

  .toast-message {
    font-size: var(--font-size-sm, 0.875rem);
    color: var(--text-muted, #6b7280);
    line-height: 1.4;
  }

  .toast-close {
    background: transparent;
    border: none;
    color: var(--text-muted, #6b7280);
    cursor: pointer;
    padding: 0.25rem;
    margin-left: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm, 0.25rem);
    transition: background-color 0.2s, color 0.2s;
  }

  .toast-close:hover {
    background-color: var(--muted-bg, #f3f4f6);
    color: var(--text-color, #333333);
  }

  .toast-progress-container {
    height: 4px;
    background-color: var(--gray-200, #e5e7eb);
    width: 100%;
  }

  .toast-progress {
    height: 100%;
    width: 100%;
    transform-origin: left;
    background-color: var(--primary-color, #3b82f6);
    animation: progress-shrink linear forwards;
  }

  .toast-success .toast-progress {
    background-color: var(--success-color, #22c55e);
  }

  .toast-error .toast-progress {
    background-color: var(--error-color, #ef4444);
  }

  .toast-warning .toast-progress {
    background-color: var(--warning-color, #f59e0b);
  }

  .toast-info .toast-progress {
    background-color: var(--info-color, #3b82f6);
  }

  @keyframes progress-shrink {
    from {
      transform: scaleX(1);
    }
    to {
      transform: scaleX(0);
    }
  }

  /* Animation for the loading spinner */
  .toast-loading-spinner {
    animation: spin 1.5s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  /* Responsive adjustments */
  @media (max-width: 640px) {
    .toast-container {
      max-width: 100%;
      padding: 0 1rem;
      left: 0;
      right: 0;
      transform: none !important;
    }
  }
</style>
