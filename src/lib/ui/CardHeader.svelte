<script>
  export let className = "";
</script>

<div class="card-header {className}">
  <slot />
</div>

<style>
  .card-header {
    display: flex;
    flex-direction: column;
    padding: 1.5rem 1.5rem 0 1.5rem;
  }
</style>