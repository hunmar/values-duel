<script>
  export let className = "";
  export let variant = "default"; // default, bordered, elevated, interactive
  export let hoverable = false;
  export let selected = false;
  export let padding = true; // Whether to apply default padding
  export let shadow = "md"; // none, sm, md, lg, xl
  export let rounded = "lg"; // none, sm, md, lg, xl, full
  export let fullWidth = false;
  export let clickable = false; // Makes the card clickable with keyboard navigation
  export let href = ""; // Optional link for the card
  export let target = ""; // Optional target for the link
  export let color = "default"; // default, primary, secondary, accent, success, warning, error, info

  // Determine variant classes
  $: variantClass = {
    default: "",
    bordered: "card-bordered",
    elevated: "card-elevated",
    interactive: "card-interactive",
  }[variant] || "";

  // Determine shadow classes
  $: shadowClass = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
  }[shadow] || "shadow-md";

  // Determine rounded classes
  $: roundedClass = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-full",
  }[rounded] || "rounded-lg";

  // Determine color classes
  $: colorClass = {
    default: "",
    primary: "card-primary",
    secondary: "card-secondary",
    accent: "card-accent",
    success: "card-success",
    warning: "card-warning",
    error: "card-error",
    info: "card-info",
  }[color] || "";

  // Combine all classes
  $: classList = [
    "card",
    variantClass,
    shadowClass,
    roundedClass,
    colorClass,
    hoverable ? "card-hoverable" : "",
    selected ? "card-selected" : "",
    padding ? "card-padded" : "",
    fullWidth ? "w-full" : "",
    clickable ? "card-clickable" : "",
    className
  ].filter(Boolean).join(" ");

  // Handle keyboard navigation for clickable cards
  function handleKeyDown(event) {
    if (clickable && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      event.target.click();
    }
  }
</script>

{#if href}
  <a
    {href}
    {target}
    class={classList}
    on:click
    on:keydown={handleKeyDown}
    tabindex="0"
    role="article"
  >
    <slot />
  </a>
{:else}
  <div
    class={classList}
    on:click
    on:keydown={clickable ? handleKeyDown : undefined}
    tabindex={clickable ? "0" : undefined}
    role="article"
  >
    <slot />
  </div>
{/if}

<style>
  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    background-color: var(--card-bg, #1e293b);
    border: 1px solid var(--card-border, #334155);
    overflow: hidden;
    transition: all var(--transition-normal, 0.3s) var(--ease-in-out, cubic-bezier(0.16, 1, 0.3, 1));
  }

  .card-padded {
    padding: var(--space-4, 1rem);
  }

  .card-hoverable {
    cursor: pointer;
  }

  .card-hoverable:hover {
    border-color: var(--card-hover-border, #475569);
    transform: translateY(-2px);
  }

  .card-selected {
    border-color: var(--card-selected-border, #10b981);
    box-shadow: 0 0 0 1px var(--card-selected-border, #10b981);
  }

  .card-bordered {
    border-width: 2px;
  }

  .card-elevated {
    border-color: transparent;
  }

  .card-interactive {
    cursor: pointer;
    transition: all var(--transition-normal, 0.3s) var(--ease-in-out, cubic-bezier(0.16, 1, 0.3, 1));
  }

  .card-interactive:hover {
    transform: translateY(-4px);
    border-color: var(--card-hover-border, #475569);
  }

  .card-interactive:active {
    transform: translateY(-2px);
  }

  /* Shadow classes */
  .shadow-sm {
    box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.05));
  }

  .shadow-md {
    box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06));
  }

  .shadow-lg {
    box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05));
  }

  .shadow-xl {
    box-shadow: var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04));
  }

  /* Rounded classes */
  .rounded-none {
    border-radius: 0;
  }

  .rounded-sm {
    border-radius: var(--radius-sm, 0.125rem);
  }

  .rounded-md {
    border-radius: var(--radius-md, 0.25rem);
  }

  .rounded-lg {
    border-radius: var(--radius-lg, 0.5rem);
  }

  .rounded-xl {
    border-radius: var(--radius-xl, 0.75rem);
  }

  .rounded-full {
    border-radius: var(--radius-full, 9999px);
  }

  /* Width */
  .w-full {
    width: 100%;
  }

  /* Color variants */
  .card-primary {
    border-color: var(--primary-color);
    background-color: var(--primary-50, rgba(16, 185, 129, 0.05));
  }

  .card-secondary {
    border-color: var(--secondary-color);
    background-color: var(--secondary-50, rgba(99, 102, 241, 0.05));
  }

  .card-accent {
    border-color: var(--accent-color);
    background-color: var(--accent-50, rgba(244, 63, 94, 0.05));
  }

  .card-success {
    border-color: var(--success-color);
    background-color: var(--success-50, rgba(34, 197, 94, 0.05));
  }

  .card-warning {
    border-color: var(--warning-color);
    background-color: var(--warning-50, rgba(245, 158, 11, 0.05));
  }

  .card-error {
    border-color: var(--error-color);
    background-color: var(--error-50, rgba(239, 68, 68, 0.05));
  }

  .card-info {
    border-color: var(--info-color);
    background-color: var(--info-50, rgba(59, 130, 246, 0.05));
  }

  /* Clickable card styles */
  .card-clickable {
    cursor: pointer;
    user-select: none;
    transition: transform var(--transition-fast) var(--ease-out),
                box-shadow var(--transition-fast) var(--ease-out),
                border-color var(--transition-fast) var(--ease-out);
  }

  .card-clickable:hover {
    transform: translateY(-2px);
    border-color: var(--card-hover-border, #475569);
  }

  .card-clickable:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--focus-ring-color, rgba(99, 102, 241, 0.6));
  }

  .card-clickable:active {
    transform: translateY(0);
  }

  /* Link card styles */
  a.card {
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
  }
</style>
