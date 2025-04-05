<script>
  export let size = "default"; // sm, default, lg, xl, full
  export let className = "";
  export let padding = true;
</script>

<div 
  class="container {size} {padding ? 'with-padding' : ''} {className}"
  {...$$restProps}
>
  <slot />
</div>

<style>
  .container {
    width: 100%;
    margin-left: auto;
    margin-right: auto;
  }
  
  .with-padding {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .sm {
    max-width: 640px;
  }
  
  .default {
    max-width: 1024px;
  }
  
  .lg {
    max-width: 1280px;
  }
  
  .xl {
    max-width: 1400px;
  }
  
  .full {
    max-width: none;
  }
  
  @media (min-width: 640px) {
    .with-padding {
      padding-left: 1.5rem;
      padding-right: 1.5rem;
    }
  }
  
  @media (min-width: 1024px) {
    .with-padding {
      padding-left: 2rem;
      padding-right: 2rem;
    }
  }
</style>