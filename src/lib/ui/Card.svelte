<script>
  export let className = "";
</script>

<div class="card {className}">
  <slot />
</div>

<style>
  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    border-radius: 0.75rem;
    background-color: var(--card-bg, #1e293b);
    border: 1px solid var(--card-border, #334155);
    box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2));
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  .card:hover {
    border-color: var(--card-hover-border, #475569);
    box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1));
  }
</style>