<script>
  export let size = "default"; // default, xs, sm, lg, xl
  export let className = "";
  export let muted = false;
  export let lead = false;
</script>

<p 
  class="text {size} {muted ? 'muted' : ''} {lead ? 'lead' : ''} {className}"
  {...$$restProps}
>
  <slot />
</p>

<style>
  .text {
    margin: 0;
    line-height: 1.5;
    color: var(--text-color, #f8fafc);
  }
  
  .muted {
    color: var(--muted-color, #cbd5e1);
    opacity: 0.95;
  }
  
  .lead {
    font-size: 1.125rem;
    font-weight: 500;
    margin-bottom: 1rem;
  }
  
  .xs {
    font-size: 0.75rem;
  }
  
  .sm {
    font-size: 0.875rem;
  }
  
  .default {
    font-size: 1rem;
  }
  
  .lg {
    font-size: 1.125rem;
  }
  
  .xl {
    font-size: 1.25rem;
  }
</style>