<script>
  import { onMount } from 'svelte';
  import { fade, fly, slide } from 'svelte/transition';
  import { APP_STATES } from './lib/stores/appState.js';
  import appState from './lib/stores/appState.js';
  import foodItems from './lib/stores/foodItems.js';
  import { STORAGE_KEYS, loadFromLocalStorage } from './lib/utils/localStorage.js';
  import LandingScreen from './lib/components/LandingScreen.svelte';
  import ComparisonScreen from './lib/components/ComparisonScreen.svelte';
  import ResultsScreen from './lib/components/ResultsScreen.svelte';
  
  let currentAppState = APP_STATES.LANDING;
  let previousAppState = null;
  
  onMount(() => {
    // Check if there are shared results in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const sharedResults = urlParams.get('results');
    
    if (sharedResults) {
      try {
        // Decode the shared results
        const decodedData = JSON.parse(decodeURIComponent(escape(atob(sharedResults))));
        
        // Update the app state to show the results screen with shared data
        appState.update(state => ({
          ...state,
          currentState: APP_STATES.RESULTS,
          isSharedResult: true,
          sharedData: decodedData
        }));
        
        // Create temporary food items for displaying the shared results
        const sharedFoodItems = decodedData.map((item, index) => ({
          id: index + 1,
          name: item.name,
          rating: item.rating,
          description: `Ranked #${item.position}`,
          imageUrl: 'https://via.placeholder.com/150'
        }));
        
        // Update the food items store
        foodItems.set(sharedFoodItems);
        
        // Remove the query parameters from the URL without refreshing the page
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Error parsing shared results:', error);
      }
    } else {
      // No shared results, load from localStorage as usual
      const savedFoodItems = loadFromLocalStorage(STORAGE_KEYS.FOOD_ITEMS);
      const savedAppState = loadFromLocalStorage(STORAGE_KEYS.APP_STATE);
      
      // Restore food items if available
      if (savedFoodItems) {
        foodItems.set(savedFoodItems);
      }
      
      // Restore app state if available
      if (savedAppState) {
        appState.set(savedAppState);
      }
    }
    
    // Subscribe to app state changes
    const unsubscribe = appState.subscribe(state => {
      previousAppState = currentAppState;
      currentAppState = state.currentState;
    });
    
    // Return the unsubscribe function for cleanup
    return unsubscribe;
  });

  // Determine transition direction based on state change
  function getTransitionProps() {
    // Moving forward in the app flow
    if (
      (previousAppState === APP_STATES.LANDING && currentAppState === APP_STATES.COMPARISON) ||
      (previousAppState === APP_STATES.COMPARISON && currentAppState === APP_STATES.RESULTS)
    ) {
      return { x: 300, duration: 300 };
    } 
    // Moving backward in the app flow
    else if (
      (previousAppState === APP_STATES.COMPARISON && currentAppState === APP_STATES.LANDING) ||
      (previousAppState === APP_STATES.RESULTS && currentAppState === APP_STATES.COMPARISON) ||
      (previousAppState === APP_STATES.RESULTS && currentAppState === APP_STATES.LANDING)
    ) {
      return { x: -300, duration: 300 };
    }
    // Default/initial transition
    return { y: 20, duration: 300 };
  }
</script>

<main>
  {#if currentAppState === APP_STATES.LANDING}
    <div in:fly={getTransitionProps()} out:fade={{ duration: 200 }}>
      <LandingScreen />
    </div>
  {:else if currentAppState === APP_STATES.COMPARISON}
    <div in:fly={getTransitionProps()} out:fade={{ duration: 200 }}>
      <ComparisonScreen />
    </div>
  {:else if currentAppState === APP_STATES.RESULTS}
    <div in:fly={getTransitionProps()} out:fade={{ duration: 200 }}>
      <ResultsScreen />
    </div>
  {/if}
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: #f5f5f5;
    color: #333;
  }
  
  :global(*, *::before, *::after) {
    box-sizing: border-box;
  }
  
  :global(button) {
    cursor: pointer;
  }
  
  main {
    min-height: 100vh;
    padding: 20px;
  }
</style>
