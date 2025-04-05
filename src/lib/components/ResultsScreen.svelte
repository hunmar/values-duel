<script>
  import { onMount } from 'svelte';
  import { APP_STATES } from '../stores/appState.js';
  import appState from '../stores/appState.js';
  import foodItems from '../stores/foodItems.js';
  import { sortItemsByRating } from '../utils/eloRating.js';
  import { STORAGE_KEYS, saveToLocalStorage, clearAllAppData } from '../utils/localStorage.js';
  
  let rankedFoodItems = [];
  
  onMount(() => {
    // Subscribe to the foodItems store
    const unsubscribe = foodItems.subscribe(items => {
      // Sort items by rating
      rankedFoodItems = sortItemsByRating(items);
      
      // Save the final rankings to localStorage
      saveToLocalStorage(STORAGE_KEYS.FOOD_ITEMS, items);
    });
    
    // Cleanup subscription on component unmount
    return unsubscribe;
  });
  
  function restartRanking() {
    // Reset all food item ratings to 1200
    foodItems.update(items => 
      items.map(item => ({
        ...item,
        rating: 1200
      }))
    );
    
    // Reset app state
    appState.update(state => ({
      ...state,
      currentState: APP_STATES.LANDING,
      totalComparisons: 0,
      completedComparisons: 0,
      comparisonHistory: []
    }));
    
    // Clear stored data
    clearAllAppData();
  }
  
  function exportRankings() {
    // Create a JSON blob for export
    const dataStr = JSON.stringify(rankedFoodItems, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    // Create a download link
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'taste-duel-rankings.json';
    
    // Trigger the download
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
</script>

<div class="results-container">
  <header>
    <h1>Your Food Preference Ranking</h1>
    <p>Based on your comparisons, here's how you ranked these foods</p>
  </header>
  
  <div class="results-summary">
    <p>You completed {rankedFoodItems.length} food item comparisons.</p>
    <p>Your top choice was <strong>{rankedFoodItems[0]?.name}</strong>!</p>
  </div>
  
  <div class="ranked-list">
    {#each rankedFoodItems as food, index}
      <div class="ranked-item">
        <div class="rank">{index + 1}</div>
        <div class="food-image">
          <img src={food.imageUrl} alt={food.name} />
        </div>
        <div class="food-info">
          <h3>{food.name}</h3>
          <p>{food.description}</p>
        </div>
        <div class="rating">
          <span class="rating-value">{food.rating}</span>
          <span class="rating-label">Elo rating</span>
        </div>
      </div>
    {/each}
  </div>
  
  <div class="actions">
    <button class="action-button restart" on:click={restartRanking}>
      Restart Ranking
    </button>
    <button class="action-button export" on:click={exportRankings}>
      Export Results
    </button>
  </div>
</div>

<style>
  .results-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  header {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    color: #333;
  }
  
  header p {
    font-size: 1.2rem;
    color: #666;
  }
  
  .results-summary {
    text-align: center;
    margin-bottom: 2rem;
    padding: 1.5rem;
    background-color: #f9f9f9;
    border-radius: 8px;
  }
  
  .results-summary p {
    margin: 0.5rem 0;
    font-size: 1.1rem;
  }
  
  .ranked-list {
    margin-bottom: 3rem;
  }
  
  .ranked-item {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
    padding: 1rem;
    border-radius: 8px;
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease;
  }
  
  .ranked-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  .rank {
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.2rem;
    font-weight: bold;
    border-radius: 50%;
    color: white;
    background-color: #4CAF50;
    margin-right: 1rem;
  }
  
  .ranked-item:nth-child(1) .rank {
    background-color: gold;
    color: #333;
  }
  
  .ranked-item:nth-child(2) .rank {
    background-color: silver;
    color: #333;
  }
  
  .ranked-item:nth-child(3) .rank {
    background-color: #cd7f32;
  }
  
  .food-image {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    overflow: hidden;
    margin-right: 1rem;
  }
  
  .food-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .food-info {
    flex-grow: 1;
  }
  
  .food-info h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.2rem;
    color: #333;
  }
  
  .food-info p {
    margin: 0;
    font-size: 0.9rem;
    color: #666;
    line-height: 1.3;
  }
  
  .rating {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-left: 1rem;
    min-width: 70px;
  }
  
  .rating-value {
    font-size: 1.2rem;
    font-weight: bold;
    color: #4CAF50;
  }
  
  .rating-label {
    font-size: 0.8rem;
    color: #999;
  }
  
  .actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }
  
  .action-button {
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
    font-weight: bold;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
  }
  
  .action-button.restart {
    background-color: #4CAF50;
    color: white;
  }
  
  .action-button.restart:hover {
    background-color: #45a049;
  }
  
  .action-button.export {
    background-color: #2196F3;
    color: white;
  }
  
  .action-button.export:hover {
    background-color: #0b7dda;
  }
  
  .action-button:hover {
    transform: translateY(-2px);
  }
  
  .action-button:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    .ranked-item {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .rank {
      align-self: center;
      margin-bottom: 1rem;
    }
    
    .food-image {
      align-self: center;
      width: 100px;
      height: 100px;
      margin-bottom: 1rem;
    }
    
    .food-info {
      margin-bottom: 1rem;
      text-align: center;
      width: 100%;
    }
    
    .rating {
      align-self: center;
      margin: 0;
    }
    
    .actions {
      flex-direction: column;
    }
    
    .action-button {
      width: 100%;
    }
  }
</style>