<script lang="ts">
  import { onMount } from 'svelte';
  import { APP_STATES } from '../stores/appState.js';
  import appState from '../stores/appState.js';
  import foodItems from '../stores/foodItems.js';
  import { selectComparisonPair, updateRatings, sortItemsByRating } from '../utils/eloRating.js';
  import FoodCardNew from './FoodCardNew.svelte';
  import { Progress, Badge, Text, Heading, Container, Card, CardContent } from '../ui';
  
  interface AppState {
    comparisonHistory: any[];
    kFactor?: number;
    completedComparisons: number;
    totalComparisons: number;
  }

  interface FoodItem {
    id: number;
    name: string;
    description: string;
    rating: number;
    imageUrl: string;
    fallbackImageUrl?: string;
  }

  interface FoodCardProps {
    food: FoodItem;
    onClick: (item: FoodItem) => void;
    selected: boolean;
    keyboardAccessible: boolean;
  }
  
  // Data state
  let foodList: FoodItem[] = [];
  let currentState: AppState = {} as AppState;
  let itemA: FoodItem | null = null;
  let itemB: FoodItem | null = null;
  let selectedItem: FoodItem | null = null;
  let selectionMade = false;
  let timerId = null;
  let leftCardEl;
  let rightCardEl;
  let sortedFoodItems = [];
  let updatedRatings = {};
  let newRatingA = null;
  let newRatingB = null;
  
  // Animation state variables
  let transitionIn = false;
  let transitionOut = false;
  let leftRatingUpdating = false;
  let rightRatingUpdating = false;
  let winnerItemId = null;
  
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
      
      // Sort items by rating for the live leaderboard
      sortedFoodItems = sortItemsByRating(items);
      
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
      currentState = {
        comparisonHistory: [],
        completedComparisons: 0,
        totalComparisons: 0
      };
    }
    
    console.log(`Selecting pair from ${foodList.length} items with ${currentState.comparisonHistory.length} history items`);
    
    // Reset rating variables
    newRatingA = null;
    newRatingB = null;
    
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
  
  function handleSelection(item: FoodItem) {
    if (selectionMade) return;
    
    selectedItem = item;
    selectionMade = true;
    
    // Get current ratings
    const winningItem = item.id === itemA.id ? itemA : itemB;
    const losingItem = item.id === itemA.id ? itemB : itemA;
    
    // Calculate new ratings using custom K-factor from app state if available
    const actualOutcomeA = winningItem.id === itemA.id ? 1 : 0;
    const kFactor = currentState.kFactor || 32; // Use custom K-factor or default to 32
    const ratings = updateRatings(itemA.rating, itemB.rating, actualOutcomeA, kFactor);
    
    // Store the updated ratings for immediate display and animation
    newRatingA = ratings.newRatingA;
    newRatingB = ratings.newRatingB;
    
    // Store the updated ratings for animation
    updatedRatings = {
      [itemA.id]: { oldRating: itemA.rating, newRating: ratings.newRatingA },
      [itemB.id]: { oldRating: itemB.rating, newRating: ratings.newRatingB }
    };
    
    // Set winning item ID for class binding in the template
    winnerItemId = winningItem.id;
    
    // Create a smoother transition for ratings
    setTimeout(() => {
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
      
      // Update rating animation states through reactive variables
      if (winningItem.id === itemA.id) {
        leftRatingUpdating = true;
      } else {
        rightRatingUpdating = true;
      }
      
      // Add animation class to the loser's rating display as well after a short delay
      setTimeout(() => {
        if (losingItem.id === itemA.id) {
          leftRatingUpdating = true;
        } else {
          rightRatingUpdating = true;
        }
      }, 200);
      
      // Reset animation states after animation completes
      setTimeout(() => {
        leftRatingUpdating = false;
        rightRatingUpdating = false;
      }, 1500);
    }, 500); // Delay the rating update for a better visual sequence
    
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
        // Reset animation states
        selectionMade = false;
        selectedItem = null;
        
        // Clear updated ratings after animation completes
        updatedRatings = {};
        
        if (nextState === APP_STATES.COMPARISON) {
          // Set transition states through reactive variables
          transitionOut = true;
          
          // Short timeout to allow the transition-out animation to complete
          setTimeout(() => {
            selectNextPair();
            
            // Change transition state
            transitionOut = false;
            transitionIn = true;
            
            // Remove the transition-in class after animation completes
            setTimeout(() => {
              transitionIn = false;
            }, 500);
          }, 300);
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

<Container size="xl" className="comparison-container">
  <header>
    <Heading level={1} size="2xl">Which do you prefer?</Heading>
    <Text color="muted">Click or tap on your choice</Text>
  </header>
  
  <Progress 
    value={currentState.completedComparisons || 0} 
    max={currentState.totalComparisons || 100} 
    showValue={true}
    label="Progress"
    className="progress-bar"
  />
  
  <div class="comparison-cards" 
    class:choice-made={selectionMade}
    class:transition-out={transitionOut}
    class:transition-in={transitionIn}
    role="group" 
    aria-label="Food comparison">
    {#if itemA && itemB}
      <div bind:this={leftCardEl} class="card-wrapper">
        <div class="card-container" class:winner-selected={selectedItem && selectedItem.id === itemA.id}>
          <FoodCardNew 
            food={itemA} 
            onClick={() => handleSelection(itemA)} 
            selected={selectedItem && selectedItem.id === itemA.id}
            keyboardAccessible={true}
          />
        </div>
        <Badge variant="secondary" className="keyboard-hint" aria-hidden="true">← Left Arrow</Badge>
        <Badge variant="outline" className="rating-display {leftRatingUpdating ? 'updating' : ''}">
          Rating: {newRatingA ? newRatingA : itemA.rating}
        </Badge>
      </div>
      
      <div class="vs-indicator" aria-hidden="true">
        <span>VS</span>
        <Badge variant="outline" className="keyboard-instructions">
          Use arrow keys to select
        </Badge>
      </div>
      
      <div bind:this={rightCardEl} class="card-wrapper">
        <div class="card-container" class:winner-selected={selectedItem && selectedItem.id === itemB.id}>
          <FoodCardNew 
            food={itemB} 
            onClick={() => handleSelection(itemB)} 
            selected={selectedItem && selectedItem.id === itemB.id}
            keyboardAccessible={true}
          />
        </div>
        <Badge variant="secondary" className="keyboard-hint" aria-hidden="true">Right Arrow →</Badge>
        <Badge variant="outline" className="rating-display {rightRatingUpdating ? 'updating' : ''}">
          Rating: {newRatingB ? newRatingB : itemB.rating}
        </Badge>
      </div>
    {/if}
  </div>
  
  <div class="comparison-info-container">
    <Card className="comparison-info">
      <CardContent>
        {#if typeof currentState.completedComparisons === 'number' && typeof currentState.totalComparisons === 'number'}
          <div class="comparison-count">
            <span class="current-comparison">{currentState.completedComparisons + 1}</span>
            <span class="comparison-separator">/</span>
            <span class="total-comparisons">{currentState.totalComparisons}</span>
          </div>
          <Text size="sm" className="comparison-label">Comparisons completed</Text>
        {:else}
          <div class="loading-indicator">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
          <Text size="sm" className="comparison-label">Loading comparisons...</Text>
        {/if}
      </CardContent>
    </Card>
  </div>
  
  <!-- Live Ratings Leaderboard -->
  <Card className="live-ratings-container">
    <CardContent>
      <Heading level={2} size="xl" className="ratings-title">Live Ratings</Heading>
      <div class="ratings-grid">
        {#each sortedFoodItems as food, index}
          <div class="rating-item-wrapper {updatedRatings[food.id] ? 'rating-updating' : ''}">
            <Badge variant="secondary" className="rating-rank">#{index + 1}</Badge>
            <div class="rating-image">
              <img 
                src={food.imageUrl} 
                alt={food.name}
                on:error={(e) => {
                  // Use fallback image if the main image fails to load
                  if (food.fallbackImageUrl) {
                    (e.target as HTMLImageElement).src = food.fallbackImageUrl;
                  }
                }}
              />
            </div>
            <div class="rating-info">
              <Text weight="semibold" className="rating-name">{food.name}</Text>
            </div>
            
            <div class="rating-value {updatedRatings[food.id] && updatedRatings[food.id].newRating > updatedRatings[food.id].oldRating ? 'increasing' : ''} {updatedRatings[food.id] && updatedRatings[food.id].newRating < updatedRatings[food.id].oldRating ? 'decreasing' : ''}">
              <span class="rating-number">{food.rating}</span>
              {#if updatedRatings[food.id]}
                <span class="rating-change">
                  {#if updatedRatings[food.id].newRating > updatedRatings[food.id].oldRating}
                    <span class="rating-arrow up">↑</span>
                    <span class="rating-delta">+{updatedRatings[food.id].newRating - updatedRatings[food.id].oldRating}</span>
                  {:else if updatedRatings[food.id].newRating < updatedRatings[food.id].oldRating}
                    <span class="rating-arrow down">↓</span>
                    <span class="rating-delta">-{updatedRatings[food.id].oldRating - updatedRatings[food.id].newRating}</span>
                  {/if}
                </span>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </CardContent>
  </Card>
</Container>

<style>
  :global(.comparison-container) {
    position: relative;
  }
  
  :global(.comparison-container)::before {
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
  
  :global(header .svelte-heading) {
    margin-bottom: 0.5rem;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    letter-spacing: -0.01em;
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
  
  .card-container {
    width: 100%;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  :global(.keyboard-hint) {
    margin-top: 1rem;
    opacity: 0;
    transition: all 0.3s ease;
  }
  
  .card-wrapper:focus-within :global(.keyboard-hint) {
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
    background-clip: text;
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
  
  :global(.keyboard-instructions) {
    font-size: 0.9rem;
    white-space: nowrap;
    margin-top: 1.5rem;
  }
  
  .comparison-info-container {
    display: flex;
    justify-content: center;
    margin-top: 2.5rem;
  }
  
  :global(.comparison-info) {
    width: auto;
    text-align: center;
    overflow: hidden;
    position: relative;
  }
  
  :global(.comparison-info > .card-content) {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.5rem 2.5rem;
  }
  
  :global(.comparison-info)::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 3px;
    width: 100%;
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
    z-index: 1;
  }
  
  .comparison-count {
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: var(--primary-color);
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  .current-comparison {
    color: var(--primary-color);
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  .comparison-separator {
    opacity: 0.5;
    font-weight: 400;
  }
  
  :global(.comparison-label) {
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }
  
  .loading-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    height: 1.8rem;
  }
  
  .dot {
    width: 8px;
    height: 8px;
    background-color: var(--primary-color);
    border-radius: 50%;
    display: inline-block;
    animation: dot-pulse 1.4s infinite ease-in-out;
  }
  
  .dot:nth-child(1) {
    animation-delay: -0.32s;
  }
  
  .dot:nth-child(2) {
    animation-delay: -0.16s;
  }
  
  @keyframes dot-pulse {
    0%, 80%, 100% { 
      transform: scale(0);
      opacity: 0.5;
    }
    40% { 
      transform: scale(1);
      opacity: 1;
    }
  }
  
  @media (max-width: 768px) {
    .comparison-cards {
      flex-direction: column;
    }
    
    .vs-indicator {
      margin: 1.5rem 0;
    }
    
    :global(header .svelte-heading) {
      font-size: 2rem;
    }
  }
  
  /* Animation styles using Svelte's scoped CSS with class directives */
  .comparison-cards.choice-made :global(.food-card) {
    opacity: 0.4;
    transform: scale(0.94);
    filter: grayscale(0.5);
  }
  
  .card-container {
    position: relative;
  }
  
  .card-container.winner-selected :global(.food-card) {
    opacity: 1;
    transform: scale(1);
    filter: none;
  }
  
  .card-container.winner-selected {
    transform: scale(1.05) translateY(-15px);
    z-index: 10;
  }
  
  .card-container.winner-selected::after {
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
  
  @keyframes ratingUpdate {
    0% { transform: scale(1); }
    50% { transform: scale(1.15); color: var(--primary-color); }
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
  
  :global(.rating-display) {
    position: relative;
    margin-top: 1rem;
    font-weight: 500;
    font-size: 1rem;
    transition: all 0.3s ease;
  }
  
  :global(.rating-display.updating) {
    animation: ratingUpdate 1.5s cubic-bezier(0.4, 0, 0.2, 1);
    border-color: var(--primary-color);
    box-shadow: 0 0 12px rgba(16, 185, 129, 0.4), var(--shadow-md);
  }
  
  /* Live Ratings Styles */
  :global(.live-ratings-container) {
    margin-top: 3rem;
    position: relative;
    overflow: hidden;
  }
  
  :global(.live-ratings-container)::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
    z-index: 1;
  }
  
  :global(.ratings-title) {
    text-align: center;
    margin-bottom: 1.5rem !important;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    position: relative;
  }
  
  :global(.ratings-title)::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
    border-radius: 3px;
  }
  
  .ratings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }
  
  .rating-item-wrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background-color: var(--card-bg, #1e293b);
    border-radius: 0.75rem;
    border: 1px solid var(--card-border, rgba(99, 102, 241, 0.2));
    box-shadow: var(--shadow-md);
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    cursor: pointer;
    overflow: visible;
  }
  
  .rating-item-wrapper::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 0.75rem;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(16, 185, 129, 0.1));
    z-index: -1;
    opacity: 0.5;
  }
  
  .rating-item-wrapper:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-lg);
    border-color: var(--card-hover-border);
  }
  
  .rating-item-wrapper.rating-updating {
    animation: ratingItemUpdate 1.5s cubic-bezier(0.4, 0, 0.2, 1);
    border-color: var(--primary-color);
    box-shadow: 0 0 15px rgba(16, 185, 129, 0.5), var(--shadow-md);
    z-index: 10;
  }
  
  .rating-item-wrapper.rating-updating::after {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(16, 185, 129, 0.3));
    z-index: -1;
    animation: glowPulse 1.5s ease-in-out;
  }
  
  @keyframes ratingItemUpdate {
    0% { transform: translateY(0); }
    20% { transform: translateY(-8px); }
    40% { transform: translateY(0); }
    60% { transform: translateY(-5px); }
    80% { transform: translateY(0); }
    100% { transform: translateY(0); }
  }
  
  @keyframes glowPulse {
    0% { opacity: 0; }
    50% { opacity: 1; }
    100% { opacity: 0; }
  }
  
  :global(.rating-rank) {
    width: 30px !important;
    height: 30px !important;
    padding: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    flex-shrink: 0 !important;
    border-radius: 50% !important;
  }
  
  .rating-image {
    width: 42px;
    height: 42px;
    overflow: hidden;
    border-radius: 6px;
    flex-shrink: 0;
    border: 1px solid rgba(255, 255, 255, 0.2);
    position: relative;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  
  .rating-image::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 20px;
    background: linear-gradient(to top, rgba(15, 23, 42, 0.7), transparent);
    z-index: 1;
  }
  
  .rating-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
  
  .rating-item-wrapper:hover .rating-image img {
    transform: scale(1.1);
  }
  
  .rating-info {
    flex: 1;
    min-width: 0; /* Ensure text truncation works correctly in flex context */
    overflow: hidden;
  }
  
  :global(.rating-name) {
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .rating-value {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: var(--muted-color);
    white-space: nowrap;
    margin-left: auto;
    padding-left: 0.5rem;
    min-width: 70px;
    text-align: right;
  }
  
  .rating-number {
    font-weight: 500;
  }
  
  .rating-change {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.8rem;
    animation: fadeIn 0.5s ease-in-out;
    margin-left: 0.25rem;
  }
  
  .rating-arrow {
    font-weight: bold;
  }
  
  .rating-arrow.up {
    color: #10b981; /* green */
  }
  
  .rating-arrow.down {
    color: #ef4444; /* red */
  }
  
  .rating-delta {
    font-weight: 500;
  }
  
  .increasing .rating-number {
    animation: pulseGreen 1.5s cubic-bezier(0.4, 0, 0.2, 1);
    color: #10b981;
  }
  
  .decreasing .rating-number {
    animation: pulseRed 1.5s cubic-bezier(0.4, 0, 0.2, 1);
    color: #ef4444;
  }
  
  @keyframes pulseGreen {
    0% { color: var(--muted-color); }
    50% { color: #10b981; }
    100% { color: var(--muted-color); }
  }
  
  @keyframes pulseRed {
    0% { color: var(--muted-color); }
    50% { color: #ef4444; }
    100% { color: var(--muted-color); }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @media (max-width: 768px) {
    .ratings-grid {
      grid-template-columns: 1fr;
    }
    
    :global(.live-ratings-container) {
      padding: 1rem;
    }
    
    :global(.ratings-title) {
      font-size: 1.5rem !important;
    }
    
    .rating-image {
      width: 36px;
      height: 36px;
    }
    
    .rating-item-wrapper {
      padding: 0.6rem;
      gap: 0.5rem;
    }
    
    .rating-value {
      min-width: 60px;
    }
  }
</style>