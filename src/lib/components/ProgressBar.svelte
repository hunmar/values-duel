<script>
  export let current = 0;
  export let total = 100;
  
  $: validCurrent = typeof current === 'number' ? current : 0;
  $: validTotal = typeof total === 'number' && total > 0 ? total : 100;
  $: percentage = Math.min(100, Math.max(0, (validCurrent / validTotal) * 100));
</script>

<div class="progress-container">
  <div class="progress-info">
    <span>Progress: {validCurrent} of {validTotal} comparisons</span>
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
    margin-bottom: 8px;
    font-size: 0.95rem;
    color: var(--text-color);
    font-weight: 500;
  }

  .progress-bar {
    height: 10px;
    background-color: var(--progress-bg);
    border-radius: 5px;
    overflow: hidden;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
    position: relative;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
    border-radius: 5px;
    transition: width 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    overflow: hidden;
  }
  
  .progress-fill::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.15) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    animation: shine 2s infinite;
  }
  
  @keyframes shine {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
</style>