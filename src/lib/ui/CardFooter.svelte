<script>
  export let className = "";
</script>

<div class="card-footer {className}">
  <slot />
</div>

<style>
  .card-footer {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0 1.5rem 1.5rem 1.5rem;
    justify-content: flex-end;
    gap: 0.5rem;
    border-top: 1px solid var(--card-border-light, rgba(255, 255, 255, 0.05));
    padding-top: 1rem;
    margin-top: auto;
  }
</style>