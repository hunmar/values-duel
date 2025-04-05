<script>
  export let className = "";
</script>

<div class="card-content {className}">
  <slot />
</div>

<style>
  .card-content {
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
    flex: 1 1 auto;
  }
</style>