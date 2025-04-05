<script>
  export let variant = "default"; // default, secondary, accent, outline
  export let className = "";
</script>

<span 
  class="badge {variant} {className}"
  {...$$restProps}
>
  <slot />
</span>

<style>
  .badge {
    display: inline-flex;
    align-items: center;
    border-radius: 9999px;
    padding: 0.25rem 0.75rem;
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1.25rem;
    transition: all 0.2s;
    border: 1px solid transparent;
  }
  
  .default {
    background-color: var(--primary-color, #10b981);
    color: white;
  }
  
  .secondary {
    background-color: var(--secondary-color, #6366f1);
    color: white;
  }
  
  .accent {
    background-color: var(--accent-color, #f43f5e);
    color: white;
  }
  
  .outline {
    background-color: transparent;
    border-color: var(--card-border, #334155);
    color: var(--text-color, #f8fafc);
  }
  
  /* Hover effects */
  .default:hover {
    background-color: var(--primary-hover, #34d399);
  }
  
  .secondary:hover {
    background-color: var(--secondary-hover, #818cf8);
  }
  
  .accent:hover {
    background-color: var(--accent-hover, #fb7185);
  }
  
  .outline:hover {
    border-color: var(--card-hover-border, #475569);
    background-color: rgba(255, 255, 255, 0.05);
  }
</style>