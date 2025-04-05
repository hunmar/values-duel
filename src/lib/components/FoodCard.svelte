<script>
  export let food = {};
  export let onClick = () => {};
  export let selected = false;
</script>

<div 
  class="food-card {selected ? 'selected' : ''}" 
  on:click={() => onClick(food)}
  on:keydown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onClick(food);
    }
  }}
  tabindex="0"
  role="button"
  aria-pressed={selected}
>
  <div class="food-image">
    <img 
      src={food.imageUrl} 
      alt={food.name}
    />
  </div>
  <div class="food-info">
    <h3>{food.name}</h3>
    <p>{food.description}</p>
  </div>
</div>

<style>
  .food-card {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 320px;
    height: 400px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    cursor: pointer;
    background-color: white;
  }

  .food-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }

  .food-card.selected {
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
    border: 3px solid #4CAF50;
  }

  .food-image {
    height: 220px;
    overflow: hidden;
  }

  .food-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  .food-card:hover .food-image img {
    transform: scale(1.05);
  }

  .food-info {
    padding: 16px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }

  h3 {
    margin: 0 0 8px 0;
    font-size: 1.4rem;
    color: #333;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
    color: #666;
    line-height: 1.4;
  }

  /* Focus styles for accessibility */
  .food-card:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
  }
</style>