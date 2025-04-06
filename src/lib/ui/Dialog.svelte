<script>
  import { createEventDispatcher, tick, onMount, onDestroy } from 'svelte';
  import { fade, scale, fly, slide, draw } from 'svelte/transition';
  import { quintOut, elasticOut, backOut, bounceOut, circOut, cubicOut, expoOut, sineOut } from 'svelte/easing';

  export let open = false;
  export let title = '';
  export let description = '';
  export let size = 'default'; // default, sm, lg, xl, full
  export let showClose = true;
  export let className = '';
  export let overlayClassName = '';
  export let closeOnClickOutside = true;
  export let portalTarget = undefined; // Optional portal target
  export let position = 'center'; // center, top, right, bottom, left, top-right, top-left, bottom-right, bottom-left
  export let animation = 'scale'; // scale, fade, fly, slide, bounce, elastic, none
  export let animationDuration = 200; // ms
  export let easing = 'back'; // back, elastic, bounce, expo, cubic, circ, sine, quint
  export let backdropBlur = true; // Whether to apply backdrop blur
  export let preventScroll = true; // Whether to prevent body scrolling when open

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
    if (preventScroll) {
      document.body.style.overflow = 'hidden';
    }

    dispatch('open');
  }

  function closeDialog() {
    open = false;

    // Restore body scrolling
    if (preventScroll) {
      document.body.style.overflow = '';
    }

    // Return focus to the element that opened the dialog
    if (lastActiveElement) {
      lastActiveElement.focus();
    }

    dispatch('close');
  }

  // Ensure body scroll is restored when component is destroyed
  onDestroy(() => {
    if (open && preventScroll) {
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

  // Set position class based on position prop
  $: positionClass = {
    'center': 'dialog-center',
    'top': 'dialog-top',
    'right': 'dialog-right',
    'bottom': 'dialog-bottom',
    'left': 'dialog-left',
    'top-right': 'dialog-top-right',
    'top-left': 'dialog-top-left',
    'bottom-right': 'dialog-bottom-right',
    'bottom-left': 'dialog-bottom-left'
  }[position] || 'dialog-center';

  // Get easing function based on easing prop
  $: easingFunction = {
    'back': backOut,
    'elastic': elasticOut,
    'bounce': bounceOut,
    'expo': expoOut,
    'cubic': cubicOut,
    'circ': circOut,
    'sine': sineOut,
    'quint': quintOut
  }[easing] || backOut;

  // Get transition based on animation prop
  function getTransition(node) {
    // Calculate position-based offsets for fly animation
    let flyY = 0;
    let flyX = 0;

    // Set vertical offset
    if (position.includes('top')) {
      flyY = -50;
    } else if (position.includes('bottom')) {
      flyY = 50;
    }

    // Set horizontal offset
    if (position.includes('left')) {
      flyX = -50;
    } else if (position.includes('right')) {
      flyX = 50;
    }

    // Define all available transitions
    const transitions = {
      'scale': scale({
        start: 0.95,
        opacity: 0,
        duration: animationDuration,
        easing: easingFunction
      }),
      'fade': fade({
        duration: animationDuration,
        easing: easingFunction
      }),
      'fly': fly({
        y: flyY,
        x: flyX,
        duration: animationDuration,
        opacity: 0,
        easing: easingFunction
      }),
      'slide': slide({
        duration: animationDuration,
        easing: easingFunction
      }),
      'bounce': scale({
        start: 0.5,
        opacity: 0,
        duration: animationDuration * 1.5,
        easing: bounceOut
      }),
      'elastic': scale({
        start: 0.5,
        opacity: 0,
        duration: animationDuration * 1.5,
        easing: elasticOut
      }),
      'none': null
    };

    return transitions[animation] || transitions['scale'];
  }

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
    class="dialog-overlay {backdropBlur ? 'backdrop-blur' : ''} {overlayClassName}"
    on:click={handleClickOutside}
    on:keydown={() => {}}
    role="presentation"
    transition:fade={{ duration: animationDuration / 2 }}
  >
    <div
      bind:this={contentRef}
      class="dialog-content {sizeClass} {positionClass} {className}"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'dialog-title' : undefined}
      aria-describedby={description ? 'dialog-description' : undefined}
      use:getTransition
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
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: var(--z-50, 50);
    padding: 1rem;
  }

  .backdrop-blur {
    backdrop-filter: blur(4px);
  }

  .dialog-content {
    background-color: var(--card-bg, #1e293b);
    border-radius: var(--radius-lg, 0.5rem);
    box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05));
    border: 1px solid var(--card-border, rgba(99, 102, 241, 0.2));
    overflow: hidden;
    position: relative;
    max-height: calc(100vh - 2rem);
    display: flex;
    flex-direction: column;
  }

  /* Position variants */
  .dialog-center {
    margin: auto;
  }

  .dialog-top {
    margin-top: 2rem;
    margin-bottom: auto;
    align-self: center;
  }

  .dialog-right {
    margin-left: auto;
    margin-right: 2rem;
    height: calc(100vh - 4rem);
  }

  .dialog-bottom {
    margin-top: auto;
    margin-bottom: 2rem;
    align-self: center;
  }

  .dialog-left {
    margin-right: auto;
    margin-left: 2rem;
    height: calc(100vh - 4rem);
  }

  /* Corner positions */
  .dialog-top-right {
    margin-top: 2rem;
    margin-bottom: auto;
    margin-left: auto;
    margin-right: 2rem;
  }

  .dialog-top-left {
    margin-top: 2rem;
    margin-bottom: auto;
    margin-right: auto;
    margin-left: 2rem;
  }

  .dialog-bottom-right {
    margin-top: auto;
    margin-bottom: 2rem;
    margin-left: auto;
    margin-right: 2rem;
  }

  .dialog-bottom-left {
    margin-top: auto;
    margin-bottom: 2rem;
    margin-right: auto;
    margin-left: 2rem;
  }

  .dialog-header {
    padding: var(--space-5, 1.25rem) var(--space-6, 1.5rem);
    border-bottom: 1px solid var(--card-border, rgba(99, 102, 241, 0.2));
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .dialog-title {
    margin: 0;
    font-size: var(--font-size-xl, 1.25rem);
    font-weight: var(--font-weight-semibold, 600);
    color: var(--text-color, #f8fafc);
    line-height: var(--line-height-tight, 1.25);
  }

  .dialog-description {
    padding: var(--space-4, 1rem) var(--space-6, 1.5rem) 0;
    color: var(--muted-color, #cbd5e1);
    font-size: var(--font-size-sm, 0.875rem);
  }

  .dialog-body {
    padding: var(--space-6, 1.5rem);
    overflow-y: auto;
    flex: 1 1 auto;
  }

  .dialog-footer {
    padding: var(--space-5, 1.25rem) var(--space-6, 1.5rem);
    border-top: 1px solid var(--card-border, rgba(99, 102, 241, 0.2));
    display: flex;
    justify-content: flex-end;
    gap: var(--space-3, 0.75rem);
  }

  .dialog-close-button {
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-full, 9999px);
    background-color: transparent;
    border: none;
    color: var(--muted-color, #cbd5e1);
    font-size: 1.5rem;
    cursor: pointer;
    transition: background-color var(--transition-fast, 0.2s), color var(--transition-fast, 0.2s);
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
