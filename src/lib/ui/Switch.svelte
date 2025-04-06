<script>
  import { createEventDispatcher } from 'svelte';
  
  export let checked = false;
  export let disabled = false;
  export let label = '';
  export let id = '';
  export let name = '';
  export let size = 'default'; // sm, default, lg
  export let color = 'primary'; // primary, secondary, accent
  export let className = '';
  export let labelPosition = 'right'; // left, right
  
  const dispatch = createEventDispatcher();
  
  // Generate random id if none provided
  if (!id) {
    id = `switch-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  function handleChange(event) {
    if (!disabled) {
      checked = event.target.checked;
      dispatch('change', { checked, event });
    }
  }
  
  function handleKeyDown(event) {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      if (!disabled) {
        checked = !checked;
        dispatch('change', { checked, event });
      }
    }
  }
  
  $: sizeClass = {
    'sm': 'switch-sm',
    'default': 'switch-default',
    'lg': 'switch-lg'
  }[size] || 'switch-default';
  
  $: colorClass = {
    'primary': 'switch-primary',
    'secondary': 'switch-secondary',
    'accent': 'switch-accent'
  }[color] || 'switch-primary';
</script>

<label
  class="switch-wrapper {checked ? 'switch-checked' : ''} {disabled ? 'switch-disabled' : ''} {sizeClass} {colorClass} {className} {labelPosition === 'left' ? 'switch-label-left' : 'switch-label-right'}"
  for={id}
>
  {#if label && labelPosition === 'left'}
    <span class="switch-label">{label}</span>
  {/if}
  
  <div
    class="switch"
    role="switch"
    aria-checked={checked}
    tabindex={disabled ? -1 : 0}
    on:keydown={handleKeyDown}
  >
    <input
      {id}
      {name}
      type="checkbox"
      bind:checked
      {disabled}
      on:change={handleChange}
      {...$$restProps}
    />
    <div class="switch-track">
      <div class="switch-thumb"></div>
    </div>
  </div>
  
  {#if label && labelPosition === 'right'}
    <span class="switch-label">{label}</span>
  {/if}
</label>

<style>
  .switch-wrapper {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
  }
  
  .switch-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .switch {
    position: relative;
    display: inline-block;
  }
  
  input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .switch-track {
    display: block;
    position: relative;
    background-color: rgba(226, 232, 240, 0.2);
    border-radius: 9999px;
    transition: background-color 0.2s ease;
  }
  
  .switch-thumb {
    position: absolute;
    background-color: white;
    border-radius: 50%;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  /* Size classes */
  /* Small */
  .switch-sm .switch-track {
    width: 1.75rem;
    height: 1rem;
  }
  
  .switch-sm .switch-thumb {
    width: 0.75rem;
    height: 0.75rem;
    top: 0.125rem;
    left: 0.125rem;
  }
  
  .switch-sm.switch-checked .switch-thumb {
    transform: translateX(0.75rem);
  }
  
  /* Default */
  .switch-default .switch-track {
    width: 2.25rem;
    height: 1.25rem;
  }
  
  .switch-default .switch-thumb {
    width: 1rem;
    height: 1rem;
    top: 0.125rem;
    left: 0.125rem;
  }
  
  .switch-default.switch-checked .switch-thumb {
    transform: translateX(1rem);
  }
  
  /* Large */
  .switch-lg .switch-track {
    width: 2.75rem;
    height: 1.5rem;
  }
  
  .switch-lg .switch-thumb {
    width: 1.25rem;
    height: 1.25rem;
    top: 0.125rem;
    left: 0.125rem;
  }
  
  .switch-lg.switch-checked .switch-thumb {
    transform: translateX(1.25rem);
  }
  
  /* Color classes */
  .switch-primary.switch-checked .switch-track {
    background-color: var(--primary-color, #10b981);
  }
  
  .switch-secondary.switch-checked .switch-track {
    background-color: var(--secondary-color, #6366f1);
  }
  
  .switch-accent.switch-checked .switch-track {
    background-color: var(--accent-color, #f43f5e);
  }
  
  /* Focus styles */
  .switch:focus-within .switch-track {
    box-shadow: 0 0 0 2px var(--focus-ring, rgba(99, 102, 241, 0.4));
  }
  
  /* Label styling */
  .switch-label {
    font-size: 0.875rem;
    color: var(--text-color, #f8fafc);
  }
  
  .switch-label-right .switch-label {
    margin-left: 0.5rem;
  }
  
  .switch-label-left .switch-label {
    margin-right: 0.5rem;
  }
  
  /* Hover effects */
  .switch-wrapper:hover:not(.switch-disabled) .switch-thumb {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
</style>