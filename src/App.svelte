<script>
  import { onMount } from 'svelte';
  import { fade, fly, slide } from 'svelte/transition';
  import { APP_STATES, THEMES, applyTheme } from './lib/stores/appState.js';
  import appState from './lib/stores/appState.js';
  import foodItems from './lib/stores/foodItems.js';
  import { STORAGE_KEYS, loadFromLocalStorage } from './lib/utils/localStorage.js';
  import LandingScreen from './lib/components/LandingScreen.svelte';
  import ComparisonScreen from './lib/components/ComparisonScreen.svelte';
  import ResultsScreen from './lib/components/ResultsScreen.svelte';
  
  let currentAppState = APP_STATES.LANDING;
  let previousAppState = null;
  let showHelp = false;
  
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
      
      // Always apply dark theme
      applyTheme(THEMES.DARK);
    });
    
    // Apply dark theme immediately
    applyTheme(THEMES.DARK);
    
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
      return { x: 300, duration: 300, opacity: 0 };
    } 
    // Moving backward in the app flow
    else if (
      (previousAppState === APP_STATES.COMPARISON && currentAppState === APP_STATES.LANDING) ||
      (previousAppState === APP_STATES.RESULTS && currentAppState === APP_STATES.COMPARISON) ||
      (previousAppState === APP_STATES.RESULTS && currentAppState === APP_STATES.LANDING)
    ) {
      return { x: -300, duration: 300, opacity: 0 };
    }
    // Default/initial transition
    return { y: 20, duration: 300, opacity: 0 };
  }
</script>

<div class="app-container">
  <div class="app-controls">
    <button 
      class="control-button help-button" 
      on:click={() => showHelp = !showHelp}
      aria-label="Show help"
      title="Show help"
    >
      <!-- Help icon -->
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    </button>
  </div>
  
  {#if showHelp}
    <div class="help-overlay" transition:fade={{ duration: 200 }}>
      <div class="help-content">
        <button class="close-button" on:click={() => showHelp = false} aria-label="Close help">×</button>
        <h2>Taste Duel Help</h2>
        
        <h3>How to Play</h3>
        <ol>
          <li>You'll be shown two food items at a time</li>
          <li>Select the one you prefer by clicking on it</li>
          <li>Continue until all necessary comparisons are complete</li>
          <li>View your personalized food preference ranking</li>
        </ol>
        
        <h3>Keyboard Controls</h3>
        <ul>
          <li><strong>Left Arrow:</strong> Select the left food item</li>
          <li><strong>Right Arrow:</strong> Select the right food item</li>
          <li><strong>Tab:</strong> Switch focus between food cards</li>
          <li><strong>Enter/Space:</strong> Select the focused food item</li>
        </ul>
        
        <h3>Features</h3>
        <ul>
          <li><strong>Import:</strong> Add your own custom food list (JSON format)</li>
          <li><strong>Share:</strong> Share your results with others via a link</li>
          <li><strong>Export:</strong> Save your rankings as a JSON file</li>
        </ul>
        
        <h3>About</h3>
        <p>Taste Duel uses the Elo rating system (commonly used in chess) to accurately rank your food preferences based on your choices in a series of direct comparisons.</p>
      </div>
    </div>
  {/if}

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
</div>

<style>
  :global(:root) {
    /* Dark theme variables */
    --bg-color: #121212;
    --text-color: #e0e0e0;
    --card-bg: #1e1e1e;
    --card-border: #333;
    --primary-color: #66BB6A;
    --primary-hover: #81C784;
    --secondary-color: #42A5F5;
    --secondary-hover: #64B5F6;
    --accent-color: #AB47BC;
    --accent-hover: #BA68C8;
    --muted-color: #aaa;
    --progress-bg: #333;
    --vs-color: #bbb;
    --focus-ring: rgba(100, 181, 246, 0.6);
    --keyboard-hint-bg: #333;
    --button-bg: rgba(255, 255, 255, 0.1);
    --button-hover: rgba(255, 255, 255, 0.2);
  }
  
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: var(--bg-color);
    color: var(--text-color);
    transition: background-color 0.3s ease, color 0.3s ease;
  }
  
  :global(*, *::before, *::after) {
    box-sizing: border-box;
  }
  
  :global(button) {
    cursor: pointer;
  }
  
  .app-container {
    position: relative;
    min-height: 100vh;
  }
  
  main {
    min-height: 100vh;
    padding: 20px;
  }
  
  .app-controls {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 100;
    display: flex;
    gap: 10px;
  }
  
  .control-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    background-color: var(--button-bg);
    color: var(--text-color);
    transition: all 0.3s ease;
  }
  
  .help-button:hover {
    background-color: var(--button-hover);
    transform: scale(1.1);
  }
  
  .control-button:focus {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
  
  .help-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  
  .help-content {
    position: relative;
    max-width: 600px;
    width: 100%;
    max-height: 80vh;
    overflow-y: auto;
    background-color: var(--card-bg);
    border-radius: 10px;
    padding: 30px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }
  
  .close-button {
    position: absolute;
    top: 15px;
    right: 15px;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: none;
    background-color: var(--theme-button-bg);
    color: var(--text-color);
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .close-button:hover {
    background-color: var(--theme-button-hover);
  }
  
  .help-content h2 {
    margin-top: 0;
    margin-bottom: 20px;
    font-size: 24px;
    color: var(--text-color);
  }
  
  .help-content h3 {
    margin-top: 20px;
    margin-bottom: 10px;
    font-size: 18px;
    color: var(--text-color);
  }
  
  .help-content p, 
  .help-content li {
    color: var(--text-color);
    line-height: 1.5;
  }
  
  .help-content ul,
  .help-content ol {
    padding-left: 20px;
  }
  
  .help-content li {
    margin-bottom: 5px;
  }
</style>
