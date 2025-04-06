<script>
  import Toast from './Toast.svelte';

  export let position = 'top-right';
  export let limit = 5;
  export let gap = '0.5rem';
  export let zIndex = 9999;
</script>

<Toast {position} {limit} {gap} {zIndex} on:dismiss />
