<script>
  import { onMount } from 'svelte';
  import { APP_STATES } from '../stores/appState.js';
  import appState from '../stores/appState.js';
  import foodItems from '../stores/foodItems.js';
  import { selectComparisonPair, updateRatings } from '../utils/eloRating.js';
  import FoodCard from './FoodCard.svelte';
  import { Progress } from '../ui';
  
  let foodList = [];
  let currentState = {};
  let itemA = null;
  let itemB = null;
  let selectedItem = null;
  let selectionMade = false;
  let timerId = null;
  let leftCardEl;
  let rightCardEl;
  
  // Subscribe to stores
  // Handle keyboard navigation
  function handleKeydown(event) {
    if (selectionMade) return;
    
    switch (event.key) {
      case 'ArrowLeft':
        // Select left food item
        if (itemA) handleSelection(itemA);
        event.preventDefault();
        break;
      case 'ArrowRight':
        // Select right food item
        if (itemB) handleSelection(itemB);
        event.preventDefault();
        break;
      case 'Tab':
        // Focus the other card
        if (document.activeElement === leftCardEl) {
          rightCardEl?.focus();
          event.preventDefault();
        } else if (document.activeElement === rightCardEl) {
          leftCardEl?.focus();
          event.preventDefault();
        }
        break;
      case ' ':
      case 'Enter':
        // Select the currently focused card
        if (document.activeElement === leftCardEl && itemA) {
          handleSelection(itemA);
          event.preventDefault();
        } else if (document.activeElement === rightCardEl && itemB) {
          handleSelection(itemB);
          event.preventDefault();
        }
        break;
    }
  }

  onMount(() => {
    // Add keyboard event listener
    window.addEventListener('keydown', handleKeydown);
    
    // First subscribe to app state so we have access to comparison history
    const unsubscribeAppState = appState.subscribe(state => {
      currentState = state;
      
      // If we have a valid state but no food items loaded yet, wait for food items to load
      if (currentState && !itemA && !itemB && foodList && foodList.length >= 2) {
        console.log("Selecting initial pair from appState update");
        selectNextPair();
      }
    });
    
    // Then subscribe to food items
    const unsubscribeFoodItems = foodItems.subscribe(items => {
      foodList = items;
      
      // If we already have the app state and valid food list but no items selected yet, select them
      if (currentState && !itemA && !itemB && foodList && foodList.length >= 2) {
        console.log("Selecting initial pair from foodItems update");
        selectNextPair();
      }
    });
    
    // Focus the left card initially for keyboard navigation
    setTimeout(() => {
      leftCardEl?.focus();
    }, 100);
    
    // Cleanup subscriptions on component unmount
    return () => {
      unsubscribeFoodItems();
      unsubscribeAppState();
      window.removeEventListener('keydown', handleKeydown);
      if (timerId) clearTimeout(timerId);
    };
  });
  
  function selectNextPair() {
    if (!foodList || foodList.length < 2) {
      console.error("Not enough food items to select a pair");
      return;
    }
    
    if (!currentState || !Array.isArray(currentState.comparisonHistory)) {
      console.error("Invalid app state or comparison history");
      // Use empty array as fallback if comparison history is not available
      currentState = currentState || {};
      currentState.comparisonHistory = [];
    }
    
    console.log(`Selecting pair from ${foodList.length} items with ${currentState.comparisonHistory.length} history items`);
    
    // Select a pair for comparison
    try {
      const [nextItemA, nextItemB] = selectComparisonPair(foodList, currentState.comparisonHistory);
      
      if (!nextItemA || !nextItemB) {
        console.error("Failed to select valid food items");
        return;
      }
      
      itemA = nextItemA;
      itemB = nextItemB;
      selectedItem = null;
      selectionMade = false;
      
      console.log(`Selected items: ${itemA.name} vs ${itemB.name}`);
    } catch (error) {
      console.error("Error selecting food pair:", error);
    }
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
    
    // Add animation class to show selection feedback
    const comparisonCards = document.querySelector('.comparison-cards');
    if (comparisonCards) {
      comparisonCards.classList.add('choice-made');
    }
    
    // Play a subtle animation on the selected card
    const selectedCardElement = winningItem.id === itemA.id 
      ? document.querySelector('.comparison-cards .food-card:first-child')
      : document.querySelector('.comparison-cards .food-card:last-child');
    
    if (selectedCardElement) {
      selectedCardElement.classList.add('winner-selected');
    }
    
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
      
      // Wait a moment before moving to the next comparison or results (longer delay for better animation)
      timerId = setTimeout(() => {
        // Reset animation classes
        const comparisonCards = document.querySelector('.comparison-cards');
        comparisonCards?.classList.remove('choice-made');
        document.querySelector('.winner-selected')?.classList.remove('winner-selected');
        
        if (nextState === APP_STATES.COMPARISON) {
          // Add transition-out class for smooth transition between pairs
          if (comparisonCards) {
            comparisonCards.classList.add('transition-out');
          
            // Short timeout to allow the transition-out animation to complete
            setTimeout(() => {
              selectNextPair();
              // Remove the transition-out class after new pair is selected
              comparisonCards.classList.remove('transition-out');
              comparisonCards.classList.add('transition-in');
              
              // Remove the transition-in class after animation completes
              setTimeout(() => {
                comparisonCards.classList.remove('transition-in');
              }, 500);
            }, 300);
          } else {
            // Fallback if element not found
            selectNextPair();
          }
        }
        
        appState.update(s => ({
          ...s,
          currentState: nextState
        }));
      }, 1500); // Increased delay for better animation visibility
      
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
  
  <Progress 
    value={currentState.completedComparisons || 0} 
    max={currentState.totalComparisons || 100} 
    showValue={true}
    label="Progress"
    className="progress-bar"
  />
  
  <div class="comparison-cards" role="group" aria-label="Food comparison">
    {#if itemA && itemB}
      <div bind:this={leftCardEl} class="card-wrapper">
        <FoodCard 
          food={itemA} 
          onClick={handleSelection} 
          selected={selectedItem && selectedItem.id === itemA.id}
          keyboardAccessible={true}
        />
        <div class="keyboard-hint" aria-hidden="true">← Left Arrow</div>
      </div>
      
      <div class="vs-indicator" aria-hidden="true">
        <span>VS</span>
        <div class="keyboard-instructions">
          Use arrow keys to select
        </div>
      </div>
      
      <div bind:this={rightCardEl} class="card-wrapper">
        <FoodCard 
          food={itemB} 
          onClick={handleSelection} 
          selected={selectedItem && selectedItem.id === itemB.id}
          keyboardAccessible={true}
        />
        <div class="keyboard-hint" aria-hidden="true">Right Arrow →</div>
      </div>
    {/if}
  </div>
  
  <div class="comparison-info">
    {#if typeof currentState.completedComparisons === 'number' && typeof currentState.totalComparisons === 'number'}
      <p>Comparison {currentState.completedComparisons + 1} of {currentState.totalComparisons}</p>
    {:else}
      <p>Loading comparison...</p>
    {/if}
  </div>
</div>

<style>
  .comparison-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    position: relative;
  }
  
  .comparison-container::before {
    content: '';
    position: absolute;
    top: -40px;
    left: 0;
    right: 0;
    height: 200px;
    background: radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.1), transparent 70%);
    z-index: -1;
    pointer-events: none;
  }
  
  header {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    color: var(--text-color);
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    font-weight: 700;
    letter-spacing: -0.01em;
  }
  
  header p {
    font-size: 1.2rem;
    color: var(--muted-color);
    font-weight: 500;
  }
  
  .comparison-cards {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 3rem;
    margin: 3rem 0;
    position: relative;
  }
  
  .comparison-cards::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100px;
    bottom: -20px;
    background: radial-gradient(ellipse at center, rgba(16, 185, 129, 0.05), transparent 70%);
    filter: blur(10px);
    z-index: -1;
    pointer-events: none;
  }
  
  .card-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
  }
  
  .keyboard-hint {
    margin-top: 1rem;
    font-size: 0.9rem;
    color: var(--secondary-color);
    background-color: rgba(99, 102, 241, 0.15);
    padding: 0.5rem 1rem;
    border-radius: 20px;
    opacity: 0;
    transition: all 0.3s ease;
    box-shadow: var(--shadow-sm);
    font-weight: 500;
  }
  
  .card-wrapper:focus-within .keyboard-hint {
    opacity: 1;
    transform: translateY(-5px);
  }
  
  .vs-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    position: relative;
  }
  
  .vs-indicator span {
    font-size: 2.5rem;
    font-weight: 800;
    color: var(--vs-color);
    background: linear-gradient(135deg, var(--accent-color), var(--secondary-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    position: relative;
    z-index: 2;
  }
  
  .vs-indicator span::after {
    content: '';
    position: absolute;
    width: 60px;
    height: 60px;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.15), transparent 70%);
    z-index: -1;
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  
  .keyboard-instructions {
    font-size: 0.9rem;
    color: var(--text-color);
    background-color: var(--keyboard-hint-bg);
    padding: 0.6rem 1.2rem;
    border-radius: 20px;
    white-space: nowrap;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--card-border);
  }
  
  .comparison-info {
    text-align: center;
    margin-top: 2.5rem;
    font-size: 1.1rem;
    color: var(--muted-color);
    font-weight: 500;
    background-color: rgba(99, 102, 241, 0.1);
    display: inline-block;
    padding: 0.5rem 1.2rem;
    border-radius: 8px;
    margin-left: auto;
    margin-right: auto;
    border: 1px solid var(--card-border);
    box-shadow: var(--shadow-sm);
  }
  
  @media (max-width: 768px) {
    .comparison-cards {
      flex-direction: column;
    }
    
    .vs-indicator {
      margin: 1.5rem 0;
    }
    
    h1 {
      font-size: 2rem;
    }
  }
  
  /* Animation styles */
  .comparison-cards.choice-made .food-card:not(.winner-selected) {
    opacity: 0.4;
    transform: scale(0.94);
    filter: grayscale(0.5);
    border-color: var(--card-border);
  }
  
  .food-card.winner-selected {
    transform: scale(1.05) translateY(-15px);
    box-shadow: var(--shadow-xl), 0 0 20px rgba(16, 185, 129, 0.3);
    z-index: 10;
    border-color: var(--card-selected-border);
  }
  
  .food-card.winner-selected::after {
    content: "✓";
    position: absolute;
    top: -15px;
    right: -15px;
    width: 40px;
    height: 40px;
    background-color: var(--primary-color);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.4rem;
    box-shadow: var(--shadow-lg);
    animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    z-index: 15;
  }
  
  @keyframes popIn {
    0% { transform: scale(0); }
    70% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
  
  .comparison-cards.transition-out {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  .comparison-cards.transition-in {
    opacity: 1;
    transform: translateY(0);
    transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }
</style>