<script>
  import { Card, CardContent, Heading, Text } from '../ui';
  
  export let food = {};
  export let onClick = () => {};
  export let selected = false;
  export let keyboardAccessible = false;

  // Handle keyboard interaction and click for better accessibility
  function handleInteraction() {
    if (!selected) {
      onClick(food);
    }
  }
</script>

<div 
  class="food-card-wrapper {selected ? 'selected' : ''} {keyboardAccessible ? 'keyboard-accessible' : ''}"
  on:click={handleInteraction}
  on:keydown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleInteraction();
      e.preventDefault();
    }
  }}
  tabindex="0"
  role="button"
  aria-pressed={selected}
  aria-label="Choose {food.name}"
>
  <Card>
    <div class="food-image">
      <img 
        src={food.imageUrl} 
        alt={food.name}
        on:error={(e) => {
          // Use fallback image if the main image fails to load
          if (food.fallbackImageUrl) {
            e.target.src = food.fallbackImageUrl;
          }
        }}
      />
    </div>
    
    <CardContent>
      <Heading level={3} size="xl" className="food-name">{food.name}</Heading>
      <Text size="sm" color="muted" className="food-description">{food.description}</Text>
    </CardContent>
  </Card>
</div>

<style>
  .food-card-wrapper {
    width: 100%;
    max-width: 320px;
    height: 400px;
    position: relative;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  .food-card-wrapper.selected {
    transform: translateY(-10px) scale(1.02);
  }
  
  .food-card-wrapper.selected :global(.card) {
    border: 2px solid var(--card-selected-border, #10b981);
    box-shadow: var(--shadow-xl), 0 0 20px rgba(16, 185, 129, 0.3);
  }
  
  .food-card-wrapper.selected::after {
    content: "✓";
    position: absolute;
    top: -15px;
    right: -15px;
    width: 36px;
    height: 36px;
    background-color: var(--primary-color, #10b981);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.4rem;
    box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.3));
    z-index: 50;
  }
  
  .food-image {
    height: 220px;
    overflow: hidden;
    position: relative;
  }
  
  .food-image::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: linear-gradient(to top, rgba(15, 23, 42, 0.8), transparent);
    z-index: 10;
  }
  
  .food-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  .food-card-wrapper:hover .food-image img {
    transform: scale(1.08);
  }
  
  :global(.food-name) {
    margin: 0 0 10px 0;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }
  
  :global(.food-description) {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  /* Focus styles for accessibility */
  .food-card-wrapper:focus {
    outline: none;
  }
  
  .food-card-wrapper:focus :global(.card) {
    box-shadow: 0 0 0 3px var(--focus-ring, rgba(99, 102, 241, 0.6)), var(--shadow-md);
    border-color: var(--secondary-color, #6366f1);
  }
  
  .food-card-wrapper.keyboard-accessible:focus {
    transform: translateY(-10px);
  }
  
  .food-card-wrapper.keyboard-accessible:focus :global(.card) {
    box-shadow: var(--shadow-lg), 0 0 0 3px var(--focus-ring, rgba(99, 102, 241, 0.6));
  }
  
  /* Add a visual indicator for keyboard access */
  .food-card-wrapper.keyboard-accessible:focus::before {
    content: "";
    position: absolute;
    top: -8px;
    right: -8px;
    width: 32px;
    height: 32px;
    background-color: var(--secondary-color, #6366f1);
    border-radius: 50%;
    animation: pulse 1.5s infinite;
    z-index: 10;
    box-shadow: var(--shadow-md);
  }
  
  @keyframes pulse {
    0% { transform: scale(0.95); opacity: 0.8; }
    50% { transform: scale(1.05); opacity: 1; }
    100% { transform: scale(0.95); opacity: 0.8; }
  }
  
  /* Add subtle highlight effect on card selection */
  .food-card-wrapper.selected :global(.card)::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--primary-color, #10b981), var(--secondary-color, #6366f1));
    z-index: 5;
  }
</style>