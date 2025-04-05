<script>
  export let variant = "default"; // default, secondary, accent, outline, ghost
  export let size = "default"; // default, sm, lg, icon
  export let disabled = false;
  export let type = "button";
  export let className = "";
  
  // Determine the class based on the variant
  $: variantClass = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
    accent: "bg-accent text-accent-foreground hover:bg-accent/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
  }[variant];
  
  // Determine the size class
  $: sizeClass = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 text-sm",
    lg: "h-11 px-8 text-lg",
    icon: "h-10 w-10",
  }[size];
  
  // Combine all classes
  $: classList = `
    inline-flex items-center justify-center rounded-md font-medium transition-colors
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
    disabled:opacity-50 disabled:pointer-events-none
    ${variantClass} ${sizeClass} ${className}
  `;
</script>

<button
  type={type}
  disabled={disabled}
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
  <slot />
</button>

<style>
  /* Define custom property values that mimic shadcn-ui */
  :global(:root) {
    --bg-primary: var(--primary-color, #10b981);
    --bg-primary-hover: var(--primary-hover, #34d399);
    --text-primary-foreground: #ffffff;
    
    --bg-secondary: var(--secondary-color, #6366f1);
    --bg-secondary-hover: var(--secondary-hover, #818cf8);
    --text-secondary-foreground: #ffffff;
    
    --bg-accent: var(--accent-color, #f43f5e);
    --bg-accent-hover: var(--accent-hover, #fb7185);
    --text-accent-foreground: #ffffff;
    
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
  .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
  .px-4 { padding-left: 1rem; padding-right: 1rem; }
  .px-8 { padding-left: 2rem; padding-right: 2rem; }
  .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
  .text-sm { font-size: 0.875rem; }
  .text-lg { font-size: 1.125rem; }
  
  /* Utility classes */
  .rounded-md { border-radius: 0.375rem; }
  .font-medium { font-weight: 500; }
  .inline-flex { display: inline-flex; }
  .items-center { align-items: center; }
  .justify-center { justify-content: center; }
  .transition-colors { transition-property: color, background-color, border-color; transition-duration: 0.2s; }
  
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