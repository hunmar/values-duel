<script>
  export let current = 0;
  export let total = 100;
  
  $: percentage = Math.min(100, Math.max(0, (current / total) * 100));
</script>

<div class="progress-container">
  <div class="progress-info">
    <span>Progress: {current} of {total} comparisons</span>
    <span>{Math.round(percentage)}%</span>
  </div>
  <div class="progress-bar">
    <div 
      class="progress-fill" 
      style="width: {percentage}%"
      aria-valuenow={percentage}
      aria-valuemin="0"
      aria-valuemax="100"
      role="progressbar"
      aria-label="Completion progress"
    ></div>
  </div>
</div>

<style>
  .progress-container {
    width: 100%;
    margin: 20px 0;
  }

  .progress-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
    font-size: 0.9rem;
    color: #666;
  }

  .progress-bar {
    height: 12px;
    background-color: #e0e0e0;
    border-radius: 6px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background-color: #4CAF50;
    border-radius: 6px;
    transition: width 0.5s ease-in-out;
  }
</style>