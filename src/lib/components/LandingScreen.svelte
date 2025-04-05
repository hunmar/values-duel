<script>
  import { onMount } from 'svelte';
  import { APP_STATES } from '../stores/appState.js';
  import appState from '../stores/appState.js';
  import foodItems from '../stores/foodItems.js';
  import { calculateMinComparisons } from '../utils/eloRating.js';
  
  let foodList = [];
  
  onMount(() => {
    // Subscribe to the foodItems store
    const unsubscribe = foodItems.subscribe(items => {
      foodList = items;
    });
    
    // Cleanup subscription on component unmount
    return unsubscribe;
  });
  
  function startRanking() {
    // Calculate the minimum number of comparisons needed
    const minComparisons = calculateMinComparisons(foodList.length);
    
    // Update the app state
    appState.update(state => ({
      ...state,
      currentState: APP_STATES.COMPARISON,
      totalComparisons: minComparisons,
      completedComparisons: 0,
      comparisonHistory: []
    }));
  }
</script>

<div class="landing-container">
  <header>
    <h1>Taste Duel</h1>
    <p>Discover your true food preferences through direct comparisons</p>
  </header>
  
  <section class="food-list">
    <h2>Food Items to Rank</h2>
    <div class="food-grid">
      {#each foodList as food}
        <div class="food-item">
          <img src={food.imageUrl} alt={food.name} />
          <h3>{food.name}</h3>
        </div>
      {/each}
    </div>
  </section>
  
  <section class="instructions">
    <h2>How It Works</h2>
    <ol>
      <li>You'll be shown two food items at a time</li>
      <li>Click on the one you prefer</li>
      <li>Continue until all necessary comparisons are complete</li>
      <li>View your personalized food preference ranking</li>
    </ol>
    <p>This app uses the Elo rating system to accurately rank your preferences based on your choices.</p>
  </section>
  
  <button class="start-button" on:click={startRanking}>
    Start Ranking
  </button>
</div>

<style>
  .landing-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  header {
    text-align: center;
    margin-bottom: 3rem;
  }
  
  h1 {
    font-size: 3rem;
    margin-bottom: 0.5rem;
    color: #333;
  }
  
  header p {
    font-size: 1.2rem;
    color: #666;
  }
  
  .food-list {
    margin-bottom: 2rem;
  }
  
  h2 {
    font-size: 1.8rem;
    margin-bottom: 1rem;
    color: #444;
  }
  
  .food-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }
  
  .food-item {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease;
  }
  
  .food-item:hover {
    transform: translateY(-5px);
  }
  
  .food-item img {
    width: 100%;
    height: 100px;
    object-fit: cover;
  }
  
  .food-item h3 {
    margin: 0;
    padding: 0.5rem;
    font-size: 1rem;
    text-align: center;
    background-color: white;
  }
  
  .instructions {
    margin-bottom: 2rem;
    background-color: #f9f9f9;
    padding: 1.5rem;
    border-radius: 8px;
  }
  
  .instructions ol {
    margin-left: 1.5rem;
    margin-bottom: 1rem;
  }
  
  .instructions li {
    margin-bottom: 0.5rem;
    line-height: 1.4;
  }
  
  .start-button {
    display: block;
    margin: 0 auto;
    padding: 1rem 2rem;
    font-size: 1.2rem;
    font-weight: bold;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
  }
  
  .start-button:hover {
    background-color: #45a049;
    transform: translateY(-2px);
  }
  
  .start-button:active {
    transform: translateY(0);
  }
</style>