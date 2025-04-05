<script>
  import { onMount } from 'svelte';
  import { APP_STATES } from '../stores/appState.js';
  import appState from '../stores/appState.js';
  import foodItems from '../stores/foodItems.js';
  import { selectComparisonPair, updateRatings } from '../utils/eloRating.js';
  import FoodCard from './FoodCard.svelte';
  import ProgressBar from './ProgressBar.svelte';
  
  let foodList = [];
  let currentState = {};
  let itemA = null;
  let itemB = null;
  let selectedItem = null;
  let selectionMade = false;
  let timerId = null;
  
  // Subscribe to stores
  onMount(() => {
    const unsubscribeFoodItems = foodItems.subscribe(items => {
      foodList = items;
      selectNextPair();
    });
    
    const unsubscribeAppState = appState.subscribe(state => {
      currentState = state;
    });
    
    // Cleanup subscriptions on component unmount
    return () => {
      unsubscribeFoodItems();
      unsubscribeAppState();
      if (timerId) clearTimeout(timerId);
    };
  });
  
  function selectNextPair() {
    if (!foodList || foodList.length < 2) return;
    
    // Select a pair for comparison
    const [nextItemA, nextItemB] = selectComparisonPair(foodList, currentState.comparisonHistory);
    itemA = nextItemA;
    itemB = nextItemB;
    selectedItem = null;
    selectionMade = false;
  }
  
  function handleSelection(item) {
    if (selectionMade) return;
    
    selectedItem = item;
    selectionMade = true;
    
    // Get current ratings
    const winningItem = item.id === itemA.id ? itemA : itemB;
    const losingItem = item.id === itemA.id ? itemB : itemA;
    
    // Calculate new ratings
    const actualOutcomeA = winningItem.id === itemA.id ? 1 : 0;
    const { newRatingA, newRatingB } = updateRatings(itemA.rating, itemB.rating, actualOutcomeA);
    
    // Update food items in the store with new ratings
    foodItems.update(items => {
      return items.map(item => {
        if (item.id === itemA.id) {
          return { ...item, rating: newRatingA };
        } else if (item.id === itemB.id) {
          return { ...item, rating: newRatingB };
        }
        return item;
      });
    });
    
    // Add to comparison history
    appState.update(state => {
      const updatedHistory = [
        ...state.comparisonHistory,
        {
          itemA,
          itemB,
          winner: winningItem,
          loser: losingItem,
          timestamp: Date.now()
        }
      ];
      
      const completedComparisons = state.completedComparisons + 1;
      
      // Check if we've completed all necessary comparisons
      const nextState = completedComparisons >= state.totalComparisons
        ? APP_STATES.RESULTS
        : APP_STATES.COMPARISON;
      
      // Wait a moment before moving to the next comparison or results
      timerId = setTimeout(() => {
        if (nextState === APP_STATES.COMPARISON) {
          selectNextPair();
        }
        
        appState.update(s => ({
          ...s,
          currentState: nextState
        }));
      }, 1000);
      
      return {
        ...state,
        comparisonHistory: updatedHistory,
        completedComparisons
      };
    });
  }
</script>

<div class="comparison-container">
  <header>
    <h1>Which do you prefer?</h1>
    <p>Click or tap on your choice</p>
  </header>
  
  <ProgressBar 
    current={currentState.completedComparisons} 
    total={currentState.totalComparisons} 
  />
  
  <div class="comparison-cards">
    {#if itemA && itemB}
      <FoodCard 
        food={itemA} 
        onClick={handleSelection} 
        selected={selectedItem && selectedItem.id === itemA.id} 
      />
      <div class="vs-indicator">VS</div>
      <FoodCard 
        food={itemB} 
        onClick={handleSelection} 
        selected={selectedItem && selectedItem.id === itemB.id} 
      />
    {/if}
  </div>
  
  <div class="comparison-info">
    <p>Comparison {currentState.completedComparisons + 1} of {currentState.totalComparisons}</p>
  </div>
</div>

<style>
  .comparison-container {
    max-width: 1200px;
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
  
  .comparison-cards {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    margin: 2rem 0;
  }
  
  .vs-indicator {
    font-size: 2rem;
    font-weight: bold;
    color: #999;
  }
  
  .comparison-info {
    text-align: center;
    margin-top: 2rem;
    font-size: 1.1rem;
    color: #666;
  }
  
  @media (max-width: 768px) {
    .comparison-cards {
      flex-direction: column;
    }
    
    .vs-indicator {
      margin: 1rem 0;
    }
  }
</style>