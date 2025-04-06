<script>
  import { createEventDispatcher, tick, onMount, onDestroy } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  
  export let open = false;
  export let title = '';
  export let description = '';
  export let size = 'default'; // default, sm, lg, xl, full
  export let showClose = true;
  export let className = '';
  export let overlayClassName = '';
  export let closeOnClickOutside = true;
  export let portalTarget = undefined; // Optional portal target
  
  const dispatch = createEventDispatcher();
  
  let lastActiveElement;
  let dialogRef;
  let contentRef;
  
  onMount(() => {
    if (portalTarget && !document.getElementById(portalTarget)) {
      const portal = document.createElement('div');
      portal.id = portalTarget;
      document.body.appendChild(portal);
    }
  });
  
  // Handle keyboard navigation and trap focus within dialog
  function handleKeydown(event) {
    if (!open) return;
    
    // Close on Escape
    if (event.key === 'Escape') {
      event.preventDefault();
      closeDialog();
    }
    
    // Trap focus inside the dialog
    if (event.key === 'Tab') {
      const focusableElements = contentRef?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (!focusableElements?.length) return;
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }
  
  function handleClickOutside(event) {
    if (closeOnClickOutside && contentRef && !contentRef.contains(event.target)) {
      closeDialog();
    }
  }
  
  async function openDialog() {
    lastActiveElement = document.activeElement;
    open = true;
    
    // Focus first focusable element in dialog after render
    await tick();
    
    const focusableElements = contentRef?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements?.length) {
      // Find the close button if it exists, otherwise focus the first element
      const closeButton = Array.from(focusableElements).find(el => el.classList.contains('dialog-close-button'));
      (closeButton || focusableElements[0]).focus();
    }
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
    
    dispatch('open');
  }
  
  function closeDialog() {
    open = false;
    
    // Restore body scrolling
    document.body.style.overflow = '';
    
    // Return focus to the element that opened the dialog
    if (lastActiveElement) {
      lastActiveElement.focus();
    }
    
    dispatch('close');
  }
  
  // Ensure body scroll is restored when component is destroyed
  onDestroy(() => {
    if (open) {
      document.body.style.overflow = '';
    }
  });
  
  // Set size class based on size prop
  $: sizeClass = {
    'sm': 'w-full max-w-sm',
    'default': 'w-full max-w-md',
    'lg': 'w-full max-w-lg',
    'xl': 'w-full max-w-xl',
    'full': 'w-full h-full max-w-none m-0'
  }[size] || 'w-full max-w-md';
  
  // Auto-open when component is created with open=true
  $: if (open && !dialogRef) {
    onMount(() => {
      openDialog();
    });
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
  <div 
    bind:this={dialogRef}
    class="dialog-overlay {overlayClassName}"
    on:click={handleClickOutside}
    transition:fade={{ duration: 150 }}
  >
    <div
      bind:this={contentRef}
      class="dialog-content {sizeClass} {className}"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'dialog-title' : undefined}
      aria-describedby={description ? 'dialog-description' : undefined}
      transition:scale={{ start: 0.95, duration: 150 }}
    >
      {#if title}
        <div class="dialog-header">
          <h2 id="dialog-title" class="dialog-title">
            {title}
          </h2>
          {#if showClose}
            <button 
              class="dialog-close-button" 
              on:click={closeDialog}
              aria-label="Close"
            >
              ×
            </button>
          {/if}
        </div>
      {/if}
      
      {#if description}
        <div id="dialog-description" class="dialog-description">
          {description}
        </div>
      {/if}
      
      <div class="dialog-body">
        <slot />
      </div>
      
      {#if $$slots.footer}
        <div class="dialog-footer">
          <slot name="footer" />
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    padding: 1rem;
  }
  
  .dialog-content {
    background-color: var(--card-bg, #1e293b);
    border-radius: 0.5rem;
    box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05));
    border: 1px solid var(--card-border, rgba(99, 102, 241, 0.2));
    overflow: hidden;
    position: relative;
    max-height: calc(100vh - 2rem);
    display: flex;
    flex-direction: column;
  }
  
  .dialog-header {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--card-border, rgba(99, 102, 241, 0.2));
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .dialog-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-color, #f8fafc);
  }
  
  .dialog-description {
    padding: 1rem 1.5rem 0;
    color: var(--muted-color, #cbd5e1);
    font-size: 0.875rem;
  }
  
  .dialog-body {
    padding: 1.5rem;
    overflow-y: auto;
    flex: 1 1 auto;
  }
  
  .dialog-footer {
    padding: 1.25rem 1.5rem;
    border-top: 1px solid var(--card-border, rgba(99, 102, 241, 0.2));
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
  }
  
  .dialog-close-button {
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    background-color: transparent;
    border: none;
    color: var(--muted-color, #cbd5e1);
    font-size: 1.5rem;
    cursor: pointer;
    transition: background-color 0.2s, color 0.2s;
  }
  
  .dialog-close-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: var(--text-color, #f8fafc);
  }
  
  .dialog-close-button:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--focus-ring, rgba(99, 102, 241, 0.6));
  }
</style>