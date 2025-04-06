<script>
  import { onMount, createEventDispatcher } from 'svelte';
  
  export let content = '';
  export let position = 'top'; // top, right, bottom, left
  export let delay = 300; // delay before showing tooltip in ms
  export let duration = 200; // transition duration in ms
  export let offset = 8; // distance from trigger to tooltip
  export let className = '';
  export let maxWidth = '200px';
  export let disabled = false;
  
  const dispatch = createEventDispatcher();
  
  let triggerEl;
  let tooltipEl;
  let tooltipVisible = false;
  let timeoutId;
  
  function showTooltip() {
    if (disabled || !content) return;
    
    // Clear any existing timeout
    clearTimeout(timeoutId);
    
    // Set a delay before showing the tooltip
    timeoutId = setTimeout(() => {
      tooltipVisible = true;
      dispatch('show');
      positionTooltip();
    }, delay);
  }
  
  function hideTooltip() {
    clearTimeout(timeoutId);
    tooltipVisible = false;
    dispatch('hide');
  }
  
  function positionTooltip() {
    if (!tooltipEl || !triggerEl) return;
    
    const triggerRect = triggerEl.getBoundingClientRect();
    const tooltipRect = tooltipEl.getBoundingClientRect();
    
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const scrollX = window.scrollX || document.documentElement.scrollLeft;
    
    let top, left;
    
    switch (position) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - offset + scrollY;
        left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2) + scrollX;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2) + scrollY;
        left = triggerRect.right + offset + scrollX;
        break;
      case 'bottom':
        top = triggerRect.bottom + offset + scrollY;
        left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2) + scrollX;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2) + scrollY;
        left = triggerRect.left - tooltipRect.width - offset + scrollX;
        break;
    }
    
    // Ensure tooltip stays within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Horizontal boundaries
    if (left < 8) {
      left = 8;
    } else if (left + tooltipRect.width > viewportWidth - 8) {
      left = viewportWidth - tooltipRect.width - 8;
    }
    
    // Vertical boundaries
    if (top < 8) {
      top = 8;
    } else if (top + tooltipRect.height > viewportHeight + scrollY - 8) {
      top = viewportHeight + scrollY - tooltipRect.height - 8;
    }
    
    tooltipEl.style.top = `${top}px`;
    tooltipEl.style.left = `${left}px`;
    
    // Add arrow positioning
    const arrow = tooltipEl.querySelector('.tooltip-arrow');
    if (arrow) {
      arrow.className = 'tooltip-arrow'; // Reset classes
      arrow.classList.add(`tooltip-arrow-${position}`);
      
      // Adjust arrow position for horizontal/vertical adjustment
      if (position === 'top' || position === 'bottom') {
        const arrowLeft = triggerRect.left + (triggerRect.width / 2) - left;
        arrow.style.left = `${arrowLeft}px`;
        arrow.style.top = '';
      } else {
        const arrowTop = triggerRect.top + (triggerRect.height / 2) - top;
        arrow.style.top = `${arrowTop}px`;
        arrow.style.left = '';
      }
    }
  }
  
  onMount(() => {
    // Append tooltip to document body
    document.body.appendChild(tooltipEl);
    
    // Add resize handler to reposition tooltip if needed
    window.addEventListener('resize', positionTooltip);
    window.addEventListener('scroll', positionTooltip, true);
    
    return () => {
      // Clean up when component is destroyed
      if (tooltipEl && tooltipEl.parentNode) {
        tooltipEl.parentNode.removeChild(tooltipEl);
      }
      
      clearTimeout(timeoutId);
      window.removeEventListener('resize', positionTooltip);
      window.removeEventListener('scroll', positionTooltip, true);
    };
  });
</script>

<div
  bind:this={triggerEl}
  class="tooltip-trigger"
  on:mouseenter={showTooltip}
  on:mouseleave={hideTooltip}
  on:focus={showTooltip}
  on:blur={hideTooltip}
>
  <slot />
</div>

<!-- Tooltip is attached to document.body -->
<div
  bind:this={tooltipEl}
  class="tooltip {className}"
  class:tooltip-visible={tooltipVisible}
  style="max-width: {maxWidth};"
  role="tooltip"
  aria-hidden={!tooltipVisible}
>
  <div class="tooltip-content">
    {content}
  </div>
  <div class="tooltip-arrow"></div>
</div>

<style>
  .tooltip-trigger {
    display: inline-block;
    position: relative;
  }
  
  .tooltip {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 100;
    visibility: hidden;
    opacity: 0;
    transform: scale(0.95);
    transition: opacity var(--duration, 200ms) ease,
                transform var(--duration, 200ms) ease,
                visibility 0ms linear var(--duration, 200ms);
    pointer-events: none;
  }
  
  .tooltip-visible {
    visibility: visible;
    opacity: 1;
    transform: scale(1);
    transition: opacity var(--duration, 200ms) ease,
                transform var(--duration, 200ms) ease,
                visibility 0ms linear 0ms;
  }
  
  .tooltip-content {
    background-color: var(--tooltip-bg, rgba(30, 41, 59, 0.95));
    color: var(--tooltip-color, #f8fafc);
    border-radius: 4px;
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
    line-height: 1.4;
    box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06));
    border: 1px solid var(--card-border, rgba(99, 102, 241, 0.2));
    backdrop-filter: blur(2px);
  }
  
  .tooltip-arrow {
    position: absolute;
    width: 8px;
    height: 8px;
    background-color: var(--tooltip-bg, rgba(30, 41, 59, 0.95));
    transform: rotate(45deg);
    border: 1px solid var(--card-border, rgba(99, 102, 241, 0.2));
  }
  
  .tooltip-arrow-top {
    bottom: -4px;
    transform: rotate(45deg);
    border-top: none;
    border-left: none;
  }
  
  .tooltip-arrow-right {
    left: -4px;
    transform: rotate(45deg);
    border-right: none;
    border-bottom: none;
  }
  
  .tooltip-arrow-bottom {
    top: -4px;
    transform: rotate(45deg);
    border-bottom: none;
    border-right: none;
  }
  
  .tooltip-arrow-left {
    right: -4px;
    transform: rotate(45deg);
    border-left: none;
    border-top: none;
  }
</style>