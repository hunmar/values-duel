<script>
  export let variant = "default"; // default, secondary, accent, outline, ghost
  export let size = "default"; // default, sm, lg, icon
  export let disabled = false;
  export let type = "button";
  export let className = "";
  export let loading = false; // New loading state
  export let iconLeft = null; // New icon support (left side)
  export let iconRight = null; // New icon support (right side)
  export let fullWidth = false; // New full width option
  export let rounded = false; // New rounded option
  export let elevated = false; // New elevated option

  // Determine the class based on the variant
  $: variantClass = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
    accent: "bg-accent text-accent-foreground hover:bg-accent/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    success: "bg-success text-white hover:bg-success-hover",
    warning: "bg-warning text-white hover:bg-warning-hover",
    error: "bg-error text-white hover:bg-error-hover",
    info: "bg-info text-white hover:bg-info-hover",
  }[variant];

  // Determine the size class
  $: sizeClass = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 text-sm",
    lg: "h-11 px-8 text-lg",
    icon: "h-10 w-10 p-2",
  }[size];

  // Additional classes based on props
  $: additionalClasses = [
    fullWidth ? "w-full" : "",
    rounded ? "rounded-full" : "rounded-md",
    elevated ? "shadow-md hover:shadow-lg" : "",
    loading ? "relative cursor-wait" : "",
  ].filter(Boolean).join(" ");

  // Combine all classes
  $: classList = `
    inline-flex items-center justify-center font-medium transition-all
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
    disabled:opacity-50 disabled:pointer-events-none
    ${variantClass} ${sizeClass} ${additionalClasses} ${className}
  `;
</script>

<button
  type={type}
  disabled={disabled || loading}
  class={classList}
  on:click
  on:keydown
  on:keyup
  on:focus
  on:blur
  on:mouseenter
  on:mouseleave
  {...$$restProps}
>
  {#if loading}
    <span class="spinner"></span>
    <span class="sr-only">Loading...</span>
    <span class="opacity-0">
      <slot />
    </span>
  {:else}
    {#if iconLeft}
      <span class="icon-left">
        {@html iconLeft}
      </span>
    {/if}
    <slot />
    {#if iconRight}
      <span class="icon-right">
        {@html iconRight}
      </span>
    {/if}
  {/if}
</button>

<style>
  /* Define custom property values that mimic shadcn-ui */
  :global(:root) {
    --bg-primary: var(--primary-500, #10b981);
    --bg-primary-hover: var(--primary-600, #059669);
    --text-primary-foreground: #ffffff;

    --bg-secondary: var(--secondary-500, #6366f1);
    --bg-secondary-hover: var(--secondary-600, #4f46e5);
    --text-secondary-foreground: #ffffff;

    --bg-accent: var(--accent-500, #f43f5e);
    --bg-accent-hover: var(--accent-600, #e11d48);
    --text-accent-foreground: #ffffff;

    --bg-success: var(--success-500, #22c55e);
    --bg-success-hover: var(--success-700, #15803d);

    --bg-warning: var(--warning-500, #f59e0b);
    --bg-warning-hover: var(--warning-700, #b45309);

    --bg-error: var(--error-500, #ef4444);
    --bg-error-hover: var(--error-700, #b91c1c);

    --bg-info: var(--info-500, #3b82f6);
    --bg-info-hover: var(--info-700, #1d4ed8);

    --border-input: var(--card-border, #334155);
    --bg-background: transparent;
    --ring: var(--focus-ring, rgba(99, 102, 241, 0.6));
  }

  /* Define actual styles that match the classes used above */
  button {
    position: relative;
    overflow: hidden;
  }

  .bg-primary {
    background-color: var(--bg-primary);
  }

  .text-primary-foreground {
    color: var(--text-primary-foreground);
  }

  .hover\:bg-primary\/90:hover {
    background-color: var(--bg-primary-hover);
  }

  .bg-secondary {
    background-color: var(--bg-secondary);
  }

  .text-secondary-foreground {
    color: var(--text-secondary-foreground);
  }

  .hover\:bg-secondary\/90:hover {
    background-color: var(--bg-secondary-hover);
  }

  .bg-accent {
    background-color: var(--bg-accent);
  }

  .text-accent-foreground {
    color: var(--text-accent-foreground);
  }

  .hover\:bg-accent\/90:hover {
    background-color: var(--bg-accent-hover);
  }

  .bg-success {
    background-color: var(--bg-success);
  }

  .hover\:bg-success-hover:hover {
    background-color: var(--bg-success-hover);
  }

  .bg-warning {
    background-color: var(--bg-warning);
  }

  .hover\:bg-warning-hover:hover {
    background-color: var(--bg-warning-hover);
  }

  .bg-error {
    background-color: var(--bg-error);
  }

  .hover\:bg-error-hover:hover {
    background-color: var(--bg-error-hover);
  }

  .bg-info {
    background-color: var(--bg-info);
  }

  .hover\:bg-info-hover:hover {
    background-color: var(--bg-info-hover);
  }

  .border {
    border-width: 1px;
  }

  .border-input {
    border-color: var(--border-input);
  }

  .bg-background {
    background-color: var(--bg-background);
  }

  .hover\:bg-accent:hover {
    background-color: var(--bg-accent);
  }

  .hover\:text-accent-foreground:hover {
    color: var(--text-accent-foreground);
  }

  .focus-visible\:outline-none:focus-visible {
    outline: none;
  }

  .focus-visible\:ring-2:focus-visible {
    box-shadow: 0 0 0 2px var(--ring);
  }

  .focus-visible\:ring-ring:focus-visible {
    box-shadow: 0 0 0 2px var(--ring);
  }

  .focus-visible\:ring-offset-2:focus-visible {
    box-shadow: 0 0 0 2px var(--ring), 0 0 0 4px rgba(99, 102, 241, 0.1);
  }

  .disabled\:opacity-50:disabled {
    opacity: 0.5;
  }

  .disabled\:pointer-events-none:disabled {
    pointer-events: none;
  }

  /* Size classes */
  .h-9 { height: 2.25rem; }
  .h-10 { height: 2.5rem; }
  .h-11 { height: 2.75rem; }
  .w-10 { width: 2.5rem; }
  .w-full { width: 100%; }
  .p-2 { padding: 0.5rem; }
  .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
  .px-4 { padding-left: 1rem; padding-right: 1rem; }
  .px-8 { padding-left: 2rem; padding-right: 2rem; }
  .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
  .text-sm { font-size: 0.875rem; }
  .text-lg { font-size: 1.125rem; }

  /* Utility classes */
  .rounded-md { border-radius: 0.375rem; }
  .rounded-full { border-radius: 9999px; }
  .font-medium { font-weight: 500; }
  .inline-flex { display: inline-flex; }
  .items-center { align-items: center; }
  .justify-center { justify-content: center; }
  .transition-all {
    transition-property: all;
    transition-duration: var(--transition-normal, 250ms);
    transition-timing-function: var(--ease-in-out, cubic-bezier(0.4, 0, 0.2, 1));
  }
  .shadow-md {
    box-shadow: var(--shadow-md);
  }
  .hover\:shadow-lg:hover {
    box-shadow: var(--shadow-lg);
  }
  .opacity-0 {
    opacity: 0;
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
  .cursor-wait {
    cursor: wait;
  }

  /* Icon positioning */
  .icon-left {
    display: inline-flex;
    margin-right: 0.5rem;
  }

  .icon-right {
    display: inline-flex;
    margin-left: 0.5rem;
  }

  /* Loading spinner */
  .spinner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: translate(-50%, -50%) rotate(360deg); }
  }

  /* Add shadcn-ui like ripple effect */
  button::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, rgba(255, 255, 255, 0.3) 0%, transparent 50%);
    opacity: 0;
    transition: opacity 0.5s;
    pointer-events: none;
  }

  button:active::after {
    opacity: 1;
    transition: opacity 0s;
  }
</style>
