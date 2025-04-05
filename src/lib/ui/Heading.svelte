<script>
  export let level = 1;
  export let className = "";
  export let size = null; // h1, h2, h3, h4 or null (to use default for level)
  
  // Define size classes based on the heading level or explicit size
  $: sizeClass = size || `h${level}`;
  
  // Create the component tag dynamically based on level
  $: tag = `h${level}`;
</script>

<svelte:element 
  this={tag} 
  class="heading {sizeClass} {className}"
  {...$$restProps}
>
  <slot />
</svelte:element>

<style>
  .heading {
    color: var(--text-color, #f8fafc);
    font-weight: 700;
    line-height: 1.2;
    margin-top: 0;
    letter-spacing: -0.01em;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }
  
  .h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }
  
  .h2 {
    font-size: 2rem;
    margin-bottom: 0.875rem;
  }
  
  .h3 {
    font-size: 1.5rem;
    margin-bottom: 0.75rem;
  }
  
  .h4 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
  }
</style>