<script>
  import { createEventDispatcher } from 'svelte';
  import { scale } from 'svelte/transition';
  
  export let title = '';
  export let variant = 'info'; // info, success, warning, error
  export let dismissible = false;
  export let icon = '';
  export let className = '';
  
  const dispatch = createEventDispatcher();
  
  let visible = true;
  
  function dismissAlert() {
    visible = false;
    dispatch('dismiss');
  }
  
  $: variantClass = {
    'info': 'alert-info',
    'success': 'alert-success',
    'warning': 'alert-warning',
    'error': 'alert-error'
  }[variant] || 'alert-info';
  
  $: iconContent = icon || {
    'info': `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
    'success': `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
    'warning': `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
    'error': `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`
  }[variant] || '';
</script>

{#if visible}
  <div 
    class="alert {variantClass} {className}"
    role="alert"
    transition:scale={{ start: 0.95, duration: 200 }}
  >
    {#if iconContent}
      <div class="alert-icon">
        {@html iconContent}
      </div>
    {/if}
    
    <div class="alert-content">
      {#if title}
        <div class="alert-title">{title}</div>
      {/if}
      <div class="alert-description">
        <slot />
      </div>
    </div>
    
    {#if dismissible}
      <button 
        class="alert-dismiss" 
        on:click={dismissAlert}
        aria-label="Dismiss alert"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    {/if}
  </div>
{/if}

<style>
  .alert {
    display: flex;
    align-items: flex-start;
    border-radius: 0.375rem;
    padding: 1rem;
    margin-bottom: 1rem;
    position: relative;
    border-left-width: 4px;
    border-left-style: solid;
  }
  
  /* Variant styles */
  .alert-info {
    background-color: rgba(99, 102, 241, 0.15);
    border-left-color: var(--secondary-color, #6366f1);
    color: var(--text-color, #f8fafc);
  }
  
  .alert-success {
    background-color: rgba(16, 185, 129, 0.15);
    border-left-color: var(--primary-color, #10b981);
    color: var(--text-color, #f8fafc);
  }
  
  .alert-warning {
    background-color: rgba(245, 158, 11, 0.15);
    border-left-color: #f59e0b;
    color: var(--text-color, #f8fafc);
  }
  
  .alert-error {
    background-color: rgba(244, 63, 94, 0.15);
    border-left-color: var(--accent-color, #f43f5e);
    color: var(--text-color, #f8fafc);
  }
  
  .alert-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-right: 0.75rem;
  }
  
  .alert-info .alert-icon {
    color: var(--secondary-color, #6366f1);
  }
  
  .alert-success .alert-icon {
    color: var(--primary-color, #10b981);
  }
  
  .alert-warning .alert-icon {
    color: #f59e0b;
  }
  
  .alert-error .alert-icon {
    color: var(--accent-color, #f43f5e);
  }
  
  .alert-content {
    flex: 1;
  }
  
  .alert-title {
    font-weight: 600;
    margin-bottom: 0.25rem;
    font-size: 0.875rem;
  }
  
  .alert-description {
    font-size: 0.875rem;
    opacity: 0.9;
  }
  
  .alert-dismiss {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0.25rem;
    margin: -0.25rem 0;
    color: var(--muted-color, #cbd5e1);
    opacity: 0.7;
    transition: opacity 0.2s, color 0.2s;
  }
  
  .alert-dismiss:hover {
    opacity: 1;
    color: var(--text-color, #f8fafc);
  }
  
  .alert-dismiss:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--focus-ring, rgba(99, 102, 241, 0.4));
    border-radius: 0.25rem;
  }
</style>