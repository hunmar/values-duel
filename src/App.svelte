<script>
  import { onMount } from 'svelte';
  import { APP_STATES } from './lib/stores/appState.js';
  import appState from './lib/stores/appState.js';
  import foodItems from './lib/stores/foodItems.js';
  import { STORAGE_KEYS, loadFromLocalStorage } from './lib/utils/localStorage.js';
  import LandingScreen from './lib/components/LandingScreen.svelte';
  import ComparisonScreen from './lib/components/ComparisonScreen.svelte';
  import ResultsScreen from './lib/components/ResultsScreen.svelte';
  
  let currentAppState = APP_STATES.LANDING;
  
  onMount(() => {
    // Load saved data from localStorage
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
    
    // Subscribe to app state changes
    const unsubscribe = appState.subscribe(state => {
      currentAppState = state.currentState;
    });
    
    // Return the unsubscribe function for cleanup
    return unsubscribe;
  });
</script>

<main>
  {#if currentAppState === APP_STATES.LANDING}
    <LandingScreen />
  {:else if currentAppState === APP_STATES.COMPARISON}
    <ComparisonScreen />
  {:else if currentAppState === APP_STATES.RESULTS}
    <ResultsScreen />
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
