<script>
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  
  export let open = false;
  export let position = 'right'; // right, left, top, bottom
  export let size = '300px'; // width for left/right, height for top/bottom
  export let title = '';
  export let showClose = true;
  export let closeOnClickOutside = true;
  export let closeOnEsc = true;
  export let className = '';
  export let overlayClassName = '';
  
  const dispatch = createEventDispatcher();
  
  let drawerEl;
  let contentEl;
  let lastActiveElement;
  
  function handleKeydown(event) {
    if (!open || !closeOnEsc) return;
    
    if (event.key === 'Escape') {
      event.preventDefault();
      closeDrawer();
    }
  }
  
  function handleClickOutside(event) {
    if (closeOnClickOutside && contentEl && !contentEl.contains(event.target)) {
      closeDrawer();
    }
  }
  
  function openDrawer() {
    lastActiveElement = document.activeElement;
    open = true;
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
    
    // Ensure focus is captured inside drawer
    setTimeout(() => {
      const focusableElements = contentEl?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements?.length) {
        focusableElements[0].focus();
      }
    }, 10);
    
    dispatch('open');
  }
  
  function closeDrawer() {
    open = false;
    
    // Restore body scrolling
    document.body.style.overflow = '';
    
    // Return focus to the element that opened the drawer
    if (lastActiveElement) {
      lastActiveElement.focus();
    }
    
    dispatch('close');
  }
  
  // Define animation properties based on position
  $: slideAnimation = {
    right: { x: 300, y: 0 },
    left: { x: -300, y: 0 },
    top: { x: 0, y: -300 },
    bottom: { x: 0, y: 300 }
  }[position] || { x: 300, y: 0 };
  
  // Define CSS positioning based on position
  $: positionStyle = {
    right: `right: 0; top: 0; bottom: 0; width: ${size};`,
    left: `left: 0; top: 0; bottom: 0; width: ${size};`,
    top: `top: 0; left: 0; right: 0; height: ${size};`,
    bottom: `bottom: 0; left: 0; right: 0; height: ${size};`
  }[position] || `right: 0; top: 0; bottom: 0; width: ${size};`;
  
  // Auto-open when component is created with open=true
  $: if (open && !drawerEl) {
    onMount(() => {
      openDrawer();
    });
  }
  
  // Ensure body scroll is restored when component is destroyed
  onDestroy(() => {
    if (open) {
      document.body.style.overflow = '';
    }
  });
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
  <div 
    bind:this={drawerEl}
    class="drawer-overlay {overlayClassName}"
    on:click={handleClickOutside}
    transition:fade={{ duration: 200 }}
  >
    <div
      bind:this={contentEl}
      class="drawer-content {className}"
      style={positionStyle}
      transition:fly={{ duration: 300, ...slideAnimation, opacity: 1 }}
    >
      {#if title || showClose}
        <div class="drawer-header">
          {#if title}
            <div class="drawer-title">{title}</div>
          {/if}
          
          {#if showClose}
            <button 
              class="drawer-close-button" 
              aria-label="Close drawer"
              on:click={closeDrawer}
            >
              ×
            </button>
          {/if}
        </div>
      {/if}
      
      <div class="drawer-body">
        <slot />
      </div>
      
      {#if $$slots.footer}
        <div class="drawer-footer">
          <slot name="footer" />
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .drawer-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px);
    z-index: 50;
    display: flex;
  }
  
  .drawer-content {
    position: absolute;
    background: var(--card-bg, #1e293b);
    border-left: 1px solid var(--card-border, rgba(99, 102, 241, 0.2));
    display: flex;
    flex-direction: column;
    box-shadow: var(--shadow-lg, -4px 0 15px rgba(0, 0, 0, 0.1));
    max-width: 100%;
    max-height: 100%;
    z-index: 51;
  }
  
  .drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--card-border, rgba(99, 102, 241, 0.2));
  }
  
  .drawer-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-color, #f8fafc);
  }
  
  .drawer-body {
    flex: 1;
    overflow-y: auto;
    padding: 1.25rem;
  }
  
  .drawer-footer {
    padding: 1rem 1.25rem;
    border-top: 1px solid var(--card-border, rgba(99, 102, 241, 0.2));
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
  }
  
  .drawer-close-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background-color: transparent;
    border: none;
    color: var(--muted-color, #cbd5e1);
    font-size: 1.5rem;
    cursor: pointer;
    transition: background-color 0.2s, color 0.2s;
  }
  
  .drawer-close-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: var(--text-color, #f8fafc);
  }
  
  .drawer-close-button:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--focus-ring, rgba(99, 102, 241, 0.4));
  }
</style>