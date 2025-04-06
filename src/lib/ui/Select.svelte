<script>
  import { createEventDispatcher } from 'svelte';
  
  export let options = [];
  export let value = '';
  export let placeholder = 'Select an option';
  export let label = '';
  export let id = '';
  export let name = '';
  export let disabled = false;
  export let required = false;
  export let error = '';
  export let helperText = '';
  export let icon = '';
  export let className = '';
  export let fullWidth = false;
  export let variant = 'default'; // default, outlined, filled
  export let size = 'default'; // sm, default, lg
  export let valueKey = 'value'; // Key to use for option value
  export let labelKey = 'label'; // Key to use for option label
  
  const dispatch = createEventDispatcher();
  
  // Generate random id if none provided
  if (!id) {
    id = `select-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  function handleChange(event) {
    value = event.target.value;
    dispatch('change', { value, event });
  }
  
  function handleFocus(event) {
    dispatch('focus', event);
  }
  
  function handleBlur(event) {
    dispatch('blur', event);
  }
  
  // Helper to get option value from option object or primitive
  function getOptionValue(option) {
    return typeof option === 'object' && option !== null
      ? option[valueKey]
      : option;
  }
  
  // Helper to get option label from option object or primitive
  function getOptionLabel(option) {
    return typeof option === 'object' && option !== null
      ? option[labelKey] || option[valueKey] || option.toString()
      : option;
  }
  
  $: variantClass = {
    'default': 'select-default',
    'outlined': 'select-outlined',
    'filled': 'select-filled'
  }[variant] || 'select-default';
  
  $: sizeClass = {
    'sm': 'select-sm',
    'default': 'select-default-size',
    'lg': 'select-lg'
  }[size] || 'select-default-size';
</script>

<div class="select-container {fullWidth ? 'select-full-width' : ''} {className}">
  {#if label}
    <label for={id} class="select-label">
      {label}
      {#if required}
        <span class="select-required">*</span>
      {/if}
    </label>
  {/if}
  
  <div class="select-wrapper {variantClass} {sizeClass} {error ? 'select-error' : ''} {icon ? 'has-icon' : ''}">
    {#if icon}
      <span class="select-icon">
        {icon}
      </span>
    {/if}
    
    <select
      {id}
      {name}
      {disabled}
      {required}
      aria-invalid={!!error}
      aria-describedby={error || helperText ? `${id}-message` : undefined}
      bind:value
      on:change={handleChange}
      on:focus={handleFocus}
      on:blur={handleBlur}
      {...$$restProps}
    >
      {#if placeholder}
        <option value="" disabled selected>{placeholder}</option>
      {/if}
      
      {#each options as option}
        <option 
          value={getOptionValue(option)}
          selected={value === getOptionValue(option)}
        >
          {getOptionLabel(option)}
        </option>
      {/each}
    </select>
    
    <div class="select-arrow">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </div>
  </div>
  
  {#if error || helperText}
    <div id="{id}-message" class="select-message {error ? 'select-message-error' : 'select-message-helper'}">
      {error || helperText}
    </div>
  {/if}
</div>

<style>
  .select-container {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
  }
  
  .select-full-width {
    width: 100%;
  }
  
  .select-label {
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
    color: var(--text-color, #f8fafc);
  }
  
  .select-required {
    color: var(--accent-color, #f43f5e);
    margin-left: 0.25rem;
  }
  
  .select-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }
  
  select {
    appearance: none;
    width: 100%;
    font-size: 0.875rem;
    color: var(--text-color, #f8fafc);
    border-radius: 0.375rem;
    background-color: transparent;
    padding-right: 2rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  /* For Firefox */
  select {
    -moz-appearance: none;
    text-indent: 0.01px;
    text-overflow: '';
  }
  
  /* For IE10+ */
  select::-ms-expand {
    display: none;
  }
  
  select:focus {
    outline: none;
  }
  
  select:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  select option {
    background-color: var(--card-bg, #1e293b);
    color: var(--text-color, #f8fafc);
  }
  
  .select-arrow {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: var(--muted-color, #cbd5e1);
  }
  
  .select-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: var(--muted-color, #cbd5e1);
  }
  
  .has-icon select {
    padding-left: 2.5rem;
  }
  
  .select-message {
    font-size: 0.75rem;
    margin-top: 0.25rem;
  }
  
  .select-message-helper {
    color: var(--muted-color, #cbd5e1);
  }
  
  .select-message-error {
    color: var(--accent-color, #f43f5e);
  }
  
  /* Variant: Default */
  .select-default select {
    border: 1px solid var(--card-border, rgba(99, 102, 241, 0.2));
    background-color: rgba(30, 41, 59, 0.4);
  }
  
  .select-default select:focus {
    border-color: var(--primary-color, #10b981);
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
  }
  
  .select-default.select-error select {
    border-color: var(--accent-color, #f43f5e);
  }
  
  .select-default.select-error select:focus {
    box-shadow: 0 0 0 2px rgba(244, 63, 94, 0.2);
  }
  
  /* Variant: Outlined */
  .select-outlined select {
    border: 1px solid var(--card-border, rgba(99, 102, 241, 0.2));
    background-color: transparent;
  }
  
  .select-outlined select:focus {
    border-color: var(--primary-color, #10b981);
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1);
  }
  
  .select-outlined.select-error select {
    border-color: var(--accent-color, #f43f5e);
  }
  
  .select-outlined.select-error select:focus {
    box-shadow: 0 0 0 2px rgba(244, 63, 94, 0.1);
  }
  
  /* Variant: Filled */
  .select-filled select {
    border: 1px solid transparent;
    border-bottom: 1px solid var(--card-border, rgba(99, 102, 241, 0.2));
    border-radius: 0.375rem 0.375rem 0 0;
    background-color: rgba(226, 232, 240, 0.1);
  }
  
  .select-filled select:focus {
    border-bottom-color: var(--primary-color, #10b981);
    background-color: rgba(226, 232, 240, 0.15);
  }
  
  .select-filled.select-error select {
    border-bottom-color: var(--accent-color, #f43f5e);
  }
  
  /* Size variants */
  .select-sm select {
    height: 2rem;
    padding: 0 0.5rem;
    font-size: 0.75rem;
  }
  
  .select-default-size select {
    height: 2.5rem;
    padding: 0 0.75rem;
    font-size: 0.875rem;
  }
  
  .select-lg select {
    height: 3rem;
    padding: 0 1rem;
    font-size: 1rem;
  }
</style>