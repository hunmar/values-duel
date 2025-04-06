<script>
  import { createEventDispatcher } from 'svelte';
  
  export let type = 'text';
  export let value = '';
  export let placeholder = '';
  export let label = '';
  export let id = '';
  export let name = '';
  export let disabled = false;
  export let readonly = false;
  export let required = false;
  export let error = '';
  export let helperText = '';
  export let icon = '';
  export let iconPosition = 'left';
  export let className = '';
  export let fullWidth = false;
  export let variant = 'default'; // default, outlined, filled
  export let size = 'default'; // sm, default, lg
  
  const dispatch = createEventDispatcher();
  
  // Generate random id if none provided
  if (!id) {
    id = `input-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  function handleInput(event) {
    value = event.target.value;
    dispatch('input', event);
  }
  
  function handleChange(event) {
    value = event.target.value;
    dispatch('change', event);
  }
  
  function handleFocus(event) {
    dispatch('focus', event);
  }
  
  function handleBlur(event) {
    dispatch('blur', event);
  }
  
  $: hasIconLeft = icon && iconPosition === 'left';
  $: hasIconRight = icon && iconPosition === 'right';
  
  $: variantClass = {
    'default': 'input-default',
    'outlined': 'input-outlined',
    'filled': 'input-filled'
  }[variant] || 'input-default';
  
  $: sizeClass = {
    'sm': 'input-sm',
    'default': 'input-default-size',
    'lg': 'input-lg'
  }[size] || 'input-default-size';
</script>

<div class="input-container {fullWidth ? 'input-full-width' : ''} {className}">
  {#if label}
    <label for={id} class="input-label">
      {label}
      {#if required}
        <span class="input-required">*</span>
      {/if}
    </label>
  {/if}
  
  <div class="input-wrapper {hasIconLeft ? 'has-icon-left' : ''} {hasIconRight ? 'has-icon-right' : ''} {variantClass} {sizeClass} {error ? 'input-error' : ''}">
    {#if hasIconLeft}
      <span class="input-icon input-icon-left">
        {icon}
      </span>
    {/if}
    
    <input
      {id}
      {name}
      {type}
      {placeholder}
      {disabled}
      {readonly}
      {required}
      aria-invalid={!!error}
      aria-describedby={error || helperText ? `${id}-message` : undefined}
      bind:value
      on:input={handleInput}
      on:change={handleChange}
      on:focus={handleFocus}
      on:blur={handleBlur}
      {...$$restProps}
    />
    
    {#if hasIconRight}
      <span class="input-icon input-icon-right">
        {icon}
      </span>
    {/if}
  </div>
  
  {#if error || helperText}
    <div id="{id}-message" class="input-message {error ? 'input-message-error' : 'input-message-helper'}">
      {error || helperText}
    </div>
  {/if}
</div>

<style>
  .input-container {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
  }
  
  .input-full-width {
    width: 100%;
  }
  
  .input-label {
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
    color: var(--text-color, #f8fafc);
  }
  
  .input-required {
    color: var(--accent-color, #f43f5e);
    margin-left: 0.25rem;
  }
  
  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }
  
  input {
    width: 100%;
    font-size: 0.875rem;
    color: var(--text-color, #f8fafc);
    border-radius: 0.375rem;
    background-color: transparent;
    transition: all 0.2s ease;
  }
  
  input::placeholder {
    color: var(--muted-color, #cbd5e1);
    opacity: 0.7;
  }
  
  input:focus {
    outline: none;
  }
  
  input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .input-icon {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    color: var(--muted-color, #cbd5e1);
  }
  
  .input-icon-left {
    left: 0.75rem;
  }
  
  .input-icon-right {
    right: 0.75rem;
  }
  
  .has-icon-left input {
    padding-left: 2.5rem;
  }
  
  .has-icon-right input {
    padding-right: 2.5rem;
  }
  
  .input-message {
    font-size: 0.75rem;
    margin-top: 0.25rem;
  }
  
  .input-message-helper {
    color: var(--muted-color, #cbd5e1);
  }
  
  .input-message-error {
    color: var(--accent-color, #f43f5e);
  }
  
  /* Variant: Default */
  .input-default input {
    border: 1px solid var(--card-border, rgba(99, 102, 241, 0.2));
    background-color: rgba(30, 41, 59, 0.4);
  }
  
  .input-default input:focus {
    border-color: var(--primary-color, #10b981);
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
  }
  
  .input-default.input-error input {
    border-color: var(--accent-color, #f43f5e);
  }
  
  .input-default.input-error input:focus {
    box-shadow: 0 0 0 2px rgba(244, 63, 94, 0.2);
  }
  
  /* Variant: Outlined */
  .input-outlined input {
    border: 1px solid var(--card-border, rgba(99, 102, 241, 0.2));
    background-color: transparent;
  }
  
  .input-outlined input:focus {
    border-color: var(--primary-color, #10b981);
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1);
  }
  
  .input-outlined.input-error input {
    border-color: var(--accent-color, #f43f5e);
  }
  
  .input-outlined.input-error input:focus {
    box-shadow: 0 0 0 2px rgba(244, 63, 94, 0.1);
  }
  
  /* Variant: Filled */
  .input-filled input {
    border: 1px solid transparent;
    border-bottom: 1px solid var(--card-border, rgba(99, 102, 241, 0.2));
    border-radius: 0.375rem 0.375rem 0 0;
    background-color: rgba(226, 232, 240, 0.1);
  }
  
  .input-filled input:focus {
    border-bottom-color: var(--primary-color, #10b981);
    background-color: rgba(226, 232, 240, 0.15);
  }
  
  .input-filled.input-error input {
    border-bottom-color: var(--accent-color, #f43f5e);
  }
  
  /* Size variants */
  .input-sm input {
    height: 2rem;
    padding: 0 0.5rem;
    font-size: 0.75rem;
  }
  
  .input-default-size input {
    height: 2.5rem;
    padding: 0 0.75rem;
    font-size: 0.875rem;
  }
  
  .input-lg input {
    height: 3rem;
    padding: 0 1rem;
    font-size: 1rem;
  }
</style>