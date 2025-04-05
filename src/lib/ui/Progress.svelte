<script>
  export let value = 0;
  export let max = 100;
  export let className = "";
  export let showValue = false;
  export let label = "Progress";
  
  $: percentage = Math.min(100, Math.max(0, (value / max) * 100));
</script>

<div class="progress-container {className}">
  {#if showValue}
    <div class="progress-info">
      <span class="label">{label}: {value} of {max}</span>
      <span class="value">{Math.round(percentage)}%</span>
    </div>
  {/if}
  
  <div 
    class="progress" 
    role="progressbar" 
    aria-valuemin="0" 
    aria-valuemax="100" 
    aria-valuenow={percentage}
    aria-label={label}
  >
    <div class="progress-indicator" style="width: {percentage}%"></div>
  </div>
</div>

<style>
  .progress-container {
    width: 100%;
  }
  
  .progress-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    color: var(--text-color, #f8fafc);
  }
  
  .label {
    font-weight: 500;
  }
  
  .value {
    color: var(--muted-color, #cbd5e1);
  }
  
  .progress {
    position: relative;
    height: 0.625rem;
    overflow: hidden;
    border-radius: 9999px;
    background-color: var(--progress-bg, #334155);
  }
  
  .progress-indicator {
    height: 100%;
    background: linear-gradient(to right, var(--primary-color, #10b981), var(--secondary-color, #6366f1));
    transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    border-radius: 9999px;
    position: relative;
    overflow: hidden;
  }
  
  .progress-indicator::after {
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
    opacity: 0.7;
  }
  
  @keyframes shine {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
</style>