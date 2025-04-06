<script>
  import { createEventDispatcher, onMount } from 'svelte';
  
  export let items = [];
  export let activeTab = 0;
  export let className = '';
  export let variant = 'default'; // default, outline, pills
  export let orientation = 'horizontal'; // horizontal, vertical
  export let fullWidth = false;
  
  const dispatch = createEventDispatcher();
  
  let tabContainer;
  let animationStyles = '';
  let activeIndicator;
  
  function handleTabClick(index) {
    activeTab = index;
    updateIndicator();
    dispatch('change', { index, value: items[index] });
  }
  
  function updateIndicator() {
    if (!tabContainer || variant !== 'default' || !activeIndicator) return;
    
    // Get all tab buttons
    const tabButtons = tabContainer.querySelectorAll('.tab-button');
    if (!tabButtons.length || activeTab >= tabButtons.length) return;
    
    // Get the active tab button
    const activeButton = tabButtons[activeTab];
    const containerRect = tabContainer.getBoundingClientRect();
    const buttonRect = activeButton.getBoundingClientRect();
    
    if (orientation === 'horizontal') {
      const left = buttonRect.left - containerRect.left;
      const width = buttonRect.width;
      
      animationStyles = `
        left: ${left}px;
        width: ${width}px;
        opacity: 1;
      `;
    } else {
      const top = buttonRect.top - containerRect.top;
      const height = buttonRect.height;
      
      animationStyles = `
        top: ${top}px;
        height: ${height}px;
        opacity: 1;
      `;
    }
  }
  
  // Update indicator position when component mounts or when active tab changes
  onMount(() => {
    updateIndicator();
    
    // Add resize listener to handle responsive layout changes
    window.addEventListener('resize', updateIndicator);
    
    // Cleanup on component destroy
    return () => {
      window.removeEventListener('resize', updateIndicator);
    };
  });
  
  $: if (activeTab !== undefined) {
    // Need to wait for DOM update
    setTimeout(updateIndicator, 0);
  }
  
  // Variant styles
  $: variantClass = {
    'default': 'tabs-default',
    'outline': 'tabs-outline',
    'pills': 'tabs-pills'
  }[variant] || 'tabs-default';
  
  // Orientation styles
  $: orientationClass = orientation === 'vertical' ? 'tabs-vertical' : 'tabs-horizontal';
</script>

<div 
  class="tabs-container {variantClass} {orientationClass} {fullWidth ? 'tabs-full-width' : ''} {className}"
  bind:this={tabContainer}
  role="tablist"
  aria-orientation={orientation}
>
  {#if items && items.length}
    {#each items as tab, index}
      <button
        class="tab-button {activeTab === index ? 'tab-active' : ''}"
        role="tab"
        tabindex={activeTab === index ? 0 : -1}
        aria-selected={activeTab === index}
        id={`tab-${index}`}
        aria-controls={`tab-panel-${index}`}
        on:click={() => handleTabClick(index)}
      >
        {#if tab.icon}
          <span class="tab-icon">{tab.icon}</span>
        {/if}
        <span class="tab-label">{tab.label || tab}</span>
      </button>
    {/each}
    
    {#if variant === 'default'}
      <div
        bind:this={activeIndicator}
        class="tab-indicator"
        style={animationStyles}
      ></div>
    {/if}
  {/if}
</div>

{#if items && items.length && !!$$slots.default}
  <div class="tab-content">
    {#each items as tab, index}
      <div
        class="tab-panel {activeTab === index ? 'panel-active' : ''}"
        role="tabpanel"
        id={`tab-panel-${index}`}
        aria-labelledby={`tab-${index}`}
        tabindex="0"
      >
        {#if activeTab === index}
          <slot {tab} {index} />
        {/if}
      </div>
    {/each}
  </div>
{/if}

<style>
  /* Base container styles */
  .tabs-container {
    display: flex;
    position: relative;
  }
  
  /* Horizontal tabs */
  .tabs-horizontal {
    flex-direction: row;
    border-bottom: 1px solid var(--card-border, rgba(99, 102, 241, 0.2));
  }
  
  /* Vertical tabs */
  .tabs-vertical {
    flex-direction: column;
    border-right: 1px solid var(--card-border, rgba(99, 102, 241, 0.2));
  }
  
  /* Tab button base styles */
  .tab-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1rem;
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--muted-color, #cbd5e1);
    transition: color 0.2s, background-color 0.2s;
    position: relative;
    white-space: nowrap;
  }
  
  .tab-button:hover {
    color: var(--text-color, #f8fafc);
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  .tab-button:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--focus-ring, rgba(99, 102, 241, 0.4));
    z-index: 1;
  }
  
  .tab-active {
    color: var(--text-color, #f8fafc);
    font-weight: 600;
  }
  
  /* Full width tabs */
  .tabs-full-width .tab-button {
    flex: 1;
  }
  
  /* Tab icon styles */
  .tab-icon {
    margin-right: 0.5rem;
  }
  
  /* Default variant with animated indicator */
  .tabs-default .tab-indicator {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--primary-color, #10b981), var(--secondary-color, #6366f1));
    opacity: 0;
    transition: left 0.2s ease, width 0.2s ease, top 0.2s ease, height 0.2s ease;
  }
  
  .tabs-vertical.tabs-default .tab-indicator {
    left: auto;
    right: 0;
    bottom: auto;
    top: 0;
    width: 2px;
    height: auto;
  }
  
  /* Outline variant */
  .tabs-outline .tab-button {
    border: 1px solid transparent;
    margin: -1px;
    border-radius: 4px;
  }
  
  .tabs-outline .tab-active {
    border-color: var(--card-border, rgba(99, 102, 241, 0.3));
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  /* Pills variant */
  .tabs-pills .tab-button {
    margin: 0.25rem;
    border-radius: 9999px;
  }
  
  .tabs-pills .tab-active {
    background-color: var(--primary-color, #10b981);
    color: white;
  }
  
  /* Tab content and panels */
  .tab-content {
    padding: 1rem 0;
  }
  
  .tab-panel {
    display: none;
  }
  
  .panel-active {
    display: block;
    animation: fadeIn 0.2s ease;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
</style>