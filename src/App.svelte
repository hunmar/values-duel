<script>
  import { onMount } from 'svelte';
  import { fade, fly, slide, crossfade } from 'svelte/transition';
  import { quintOut, cubicInOut } from 'svelte/easing';
  import { APP_STATES, THEMES, applyTheme, applyAccessibilityPreferences } from './lib/stores/appState.js';
  import appState from './lib/stores/appState.js';
  import foodItems from './lib/stores/foodItems.js';
  import { STORAGE_KEYS, loadFromLocalStorage, clearFromLocalStorage } from './lib/utils/localStorage.js';
  import LandingScreenNew from './lib/components/LandingScreenNew.svelte';
  import ComparisonScreen from './lib/components/ComparisonScreen.svelte';
  import ResultsScreenNew from './lib/components/ResultsScreenNew.svelte';
  import AnalyticsScreen from './lib/components/AnalyticsScreen.svelte';
  import SettingsPanel from './lib/components/SettingsPanel.svelte';
  
  let currentAppState = APP_STATES.LANDING;
  let previousAppState = null;
  let showHelp = false;
  let showConfetti = false;
  let showSettings = false;
  let appSettings = {};
  
  // Simple confetti animation for the results screen
  function createConfetti() {
    const confettiCount = 150;
    const container = document.querySelector('.app-container');
    if (!container) return;
    
    showConfetti = true;
    
    // Create confetti pieces
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      
      // Random position
      const xPos = Math.random() * 100;
      
      // Random colors
      const colors = ['#10b981', '#6366f1', '#f43f5e', '#facc15', '#3b82f6'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      // Random shape
      const shapes = ['circle', 'square', 'triangle'];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      
      // Random size
      const size = Math.random() * 10 + 5;
      
      // Set styles
      confetti.style.left = `${xPos}%`;
      confetti.style.backgroundColor = color;
      confetti.style.width = `${size}px`;
      confetti.style.height = `${size}px`;
      
      // Apply shape
      if (shape === 'circle') {
        confetti.style.borderRadius = '50%';
      } else if (shape === 'triangle') {
        confetti.style.borderRadius = '0';
        confetti.style.background = 'none';
        confetti.style.width = '0';
        confetti.style.height = '0';
        confetti.style.borderLeft = `${size/2}px solid transparent`;
        confetti.style.borderRight = `${size/2}px solid transparent`;
        confetti.style.borderBottom = `${size}px solid ${color}`;
      }
      
      // Add animation with random duration and delay
      const animationDuration = Math.random() * 3 + 2;
      const animationDelay = Math.random() * 2;
      
      confetti.style.animation = `fall ${animationDuration}s ease-in ${animationDelay}s forwards`;
      
      // Add to container
      container.appendChild(confetti);
      
      // Remove confetti after animation
      setTimeout(() => {
        confetti.remove();
        if (i === confettiCount - 1) {
          // Last confetti piece removed
          showConfetti = false;
        }
      }, (animationDuration + animationDelay) * 1000);
    }
  }
  
  // Import SVG image creation function from the foodItems module
  let createSVGImageData;
  import('./lib/stores/foodItems.js').then(module => {
    if (module.createSVGImageData) {
      createSVGImageData = module.createSVGImageData;
    } else {
      // Fallback simple function if not exported
      createSVGImageData = (name) => {
        return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="500" height="400" viewBox="0 0 500 400"><rect width="500" height="400" fill="#333" rx="15" ry="15"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="#fff">${name}</text></svg>`)}`;
      };
    }
  });

  onMount(() => {
    // Clear any stored food items to force the new food list to be used
    clearFromLocalStorage(STORAGE_KEYS.FOOD_ITEMS);
    
    // Load saved app state from local storage
    const savedAppState = loadFromLocalStorage(STORAGE_KEYS.APP_STATE);
    
    // Check if there are shared results in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const sharedResults = urlParams.get('results');
    
    // Listen for app state changes to trigger confetti on results screen
    appState.subscribe(state => {
      previousAppState = currentAppState;
      currentAppState = state.currentState;
      
      // If transitioning to results screen, trigger confetti animation
      if (previousAppState === APP_STATES.COMPARISON && currentAppState === APP_STATES.RESULTS) {
        // Delay confetti to wait for transition to complete
        setTimeout(createConfetti, 800);
      }
      
      // Update settings modal visibility
      showSettings = state.showSettingsPanel || false;
      
      // Store app settings
      appSettings = {
        theme: state.theme || THEMES.DARK,
        reducedMotion: state.reducedMotion,
        highContrast: state.highContrast,
        fontSize: state.fontSize,
        kFactor: state.kFactor,
        sound: state.sound,
        soundVolume: state.soundVolume,
        vibration: state.vibration
      };
      
      // Apply theme and accessibility preferences
      applyTheme(state.theme || THEMES.DARK);
      
      // Apply accessibility preferences if set
      if (state.reducedMotion !== undefined || state.highContrast !== undefined || state.fontSize !== undefined) {
        applyAccessibilityPreferences({
          reducedMotion: state.reducedMotion,
          highContrast: state.highContrast,
          fontSize: state.fontSize
        });
      }
    });
    
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
        const sharedFoodItems = decodedData.map((item, index) => {
          // Try to find a matching image from Unsplash based on food name
          let imageUrl;
          let fallbackImageUrl;
          
          // Generate fallback SVG with appropriate colors based on food type
          let fgColor = '#ffffff';
          let bgColor = '#333333';
          
          // Set colors based on food type to match the original SVGs in foodItems.js
          const lowerName = item.name.toLowerCase();
          if (lowerName.includes('pizza')) {
            fgColor = '#cc0000';
            bgColor = '#ffedd5';
          } else if (lowerName.includes('burger')) {
            fgColor = '#663300';
            bgColor = '#fff9e6';
          } else if (lowerName.includes('pasta')) {
            fgColor = '#cc6600';
            bgColor = '#fff5e6';
          } else if (lowerName.includes('tacos')) {
            fgColor = '#993300';
            bgColor = '#ffe6cc';
          } else if (lowerName.includes('lasagna')) {
            fgColor = '#ffffff';
            bgColor = '#9c3d25';
          } else if (lowerName.includes('cheesecake')) {
            fgColor = '#c4a146';
            bgColor = '#f9ecc5';
          } else if (lowerName.includes('sushi')) {
            fgColor = '#2a6099';
            bgColor = '#f5f5f5';
          } else if (lowerName.includes('curry')) {
            fgColor = '#cc6600';
            bgColor = '#fff2cc';
          } else if (lowerName.includes('ramen')) {
            fgColor = '#8c6d46';
            bgColor = '#f9f2ec';
          } else if (lowerName.includes('steak')) {
            fgColor = '#990000';
            bgColor = '#ffe6e6';
          }
          
          fallbackImageUrl = createSVGImageData 
            ? createSVGImageData(item.name, fgColor, bgColor)
            : `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="500" height="400" viewBox="0 0 500 400"><rect width="500" height="400" fill="${bgColor}" rx="15" ry="15"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="${fgColor}">${item.name}</text></svg>`)}`;
          
          // Common food types with Unsplash images
          if (item.name.toLowerCase().includes('pizza')) {
            imageUrl = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
          } else if (item.name.toLowerCase().includes('burger')) {
            imageUrl = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
          } else if (item.name.toLowerCase().includes('cheesecake')) {
            imageUrl = 'https://images.unsplash.com/photo-1567171466295-4afa63d45416?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
          } else if (item.name.toLowerCase().includes('sushi')) {
            imageUrl = 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
          } else if (item.name.toLowerCase().includes('pasta')) {
            imageUrl = 'https://images.unsplash.com/photo-1598866594230-a7c12756260f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
          } else if (item.name.toLowerCase().includes('tacos')) {
            imageUrl = 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
          } else if (item.name.toLowerCase().includes('lasagna')) {
            imageUrl = 'https://images.unsplash.com/photo-1619895092538-128341789043?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
          } else if (item.name.toLowerCase().includes('curry')) {
            imageUrl = 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
          } else if (item.name.toLowerCase().includes('ramen')) {
            imageUrl = 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
          } else if (item.name.toLowerCase().includes('steak')) {
            imageUrl = 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
          } else {
            // Default image for foods we don't have specific images for
            imageUrl = `https://source.unsplash.com/500x400/?food,${encodeURIComponent(item.name)}`;
          }
          
          return {
            id: index + 1,
            name: item.name,
            rating: item.rating,
            description: `Ranked #${item.position}`,
            imageUrl,
            fallbackImageUrl
          };
        });
        
        // Update the food items store
        foodItems.set(sharedFoodItems);
        
        // Remove the query parameters from the URL without refreshing the page
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Error parsing shared results:', error);
      }
    } else {
      // No shared results, use the savedAppState loaded earlier
      
      // We intentionally don't load saved food items to use our new list
      
      // Restore app state if available
      if (savedAppState) {
        appState.set(savedAppState);
      }
    }
    
    // Apply theme and accessibility settings immediately
    applyTheme(savedAppState?.theme || THEMES.DARK);
    
    // Apply accessibility preferences if available
    if (savedAppState) {
      applyAccessibilityPreferences({
        reducedMotion: savedAppState.reducedMotion,
        highContrast: savedAppState.highContrast,
        fontSize: savedAppState.fontSize
      });
    }
    
    // Return the unsubscribe function for cleanup - we're using the subscription from above
    return () => {};
  });

  // Enhanced transitions with better easing and more sophisticated motion
  function getTransitionProps() {
    const easing = { duration: 400, easing: cubicOut };
    const forwardEasing = { duration: 500, easing: cubicOut };
    const backEasing = { duration: 400, easing: cubicOut };
    
    // Moving forward in the app flow
    if (
      (previousAppState === APP_STATES.LANDING && currentAppState === APP_STATES.COMPARISON) ||
      (previousAppState === APP_STATES.COMPARISON && currentAppState === APP_STATES.RESULTS) ||
      (previousAppState === APP_STATES.RESULTS && currentAppState === APP_STATES.ANALYTICS)
    ) {
      return { 
        x: 300, 
        y: 20, 
        scale: 0.95, 
        opacity: 0,
        ...forwardEasing
      };
    } 
    // Moving backward in the app flow
    else if (
      (previousAppState === APP_STATES.COMPARISON && currentAppState === APP_STATES.LANDING) ||
      (previousAppState === APP_STATES.RESULTS && currentAppState === APP_STATES.COMPARISON) ||
      (previousAppState === APP_STATES.RESULTS && currentAppState === APP_STATES.LANDING) ||
      (previousAppState === APP_STATES.ANALYTICS && currentAppState === APP_STATES.RESULTS)
    ) {
      return { 
        x: -300, 
        scale: 0.95, 
        opacity: 0,
        ...backEasing
      };
    }
    // Initial load or unknown transition
    return { 
      y: 30, 
      scale: 0.98,
      opacity: 0,
      ...easing
    };
  }
  
  // Custom easing function for smoother motion
  function cubicOut(t) {
    const f = t - 1.0;
    return f * f * f + 1.0;
  }
</script>

<div class="app-container">
  <div class="app-controls">
    <button 
      class="control-button help-button" 
      on:click={() => showHelp = !showHelp}
      aria-label="Show help"
      title="Help"
    >
      <!-- Help icon -->
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    </button>
  </div>
  
  <!-- Settings Panel -->
  <SettingsPanel 
    bind:open={showSettings} 
    on:close={() => {
      showSettings = false;
      appState.update(state => ({
        ...state,
        showSettingsPanel: false
      }));
    }}
  />
  
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
    <!-- Add crossfade animation for smoother transitions between screen states -->
    {#if currentAppState === APP_STATES.LANDING}
      <div 
        in:fly={getTransitionProps()} 
        out:fade={{ duration: 300, easing: cubicOut }}
        class="screen-container"
      >
        <LandingScreenNew />
      </div>
    {:else if currentAppState === APP_STATES.COMPARISON}
      <div 
        in:fly={getTransitionProps()} 
        out:fade={{ duration: 300, easing: cubicOut }}
        class="screen-container"
      >
        <ComparisonScreen />
      </div>
    {:else if currentAppState === APP_STATES.RESULTS}
      <div 
        in:fly={getTransitionProps()} 
        out:fade={{ duration: 300, easing: cubicOut }}
        class="screen-container"
      >
        <ResultsScreenNew />
      </div>
    {:else if currentAppState === APP_STATES.ANALYTICS}
      <div 
        in:fly={getTransitionProps()} 
        out:fade={{ duration: 300, easing: cubicOut }}
        class="screen-container"
      >
        <AnalyticsScreen />
      </div>
    {/if}
  </main>
</div>

<style>
  :global(:root) {
    /* CSS Variables for both themes - these will be overridden by theme-specific variables */
    --primary-color: #10b981; /* Vibrant teal */
    --primary-hover: #34d399; /* Lighter teal for hover */
    --primary-focus: rgba(16, 185, 129, 0.5); /* For focus states */
    
    --secondary-color: #6366f1; /* Vibrant indigo */
    --secondary-hover: #818cf8; /* Lighter indigo for hover */
    --secondary-focus: rgba(99, 102, 241, 0.5); /* For focus states */
    
    --accent-color: #f43f5e; /* Vibrant rose */
    --accent-hover: #fb7185; /* Lighter rose for hover */
    
    /* Font size variables for accessibility */
    --font-size-small: 0.875rem;
    --font-size-default: 1rem;
    --font-size-large: 1.125rem;
    --font-size-xlarge: 1.25rem;
  }
  
  /* Dark theme (default) */
  :global([data-theme="dark"]) {
    --bg-color: #0f172a; /* Deep blue-gray background */
    --text-color: #f8fafc; /* Very light gray-blue text for maximum contrast */
    --card-bg: #1e293b; /* Slightly lighter background for cards */
    --card-border: #334155; /* Subtle border for depth */
    --card-hover-border: #475569; /* Border on hover for better distinction */
    --card-selected-border: #10b981; /* Green teal border for selection */
    
    /* Text and utility colors */
    --muted-color: #cbd5e1; /* Subtle text color with better contrast */
    --progress-bg: #334155; /* Progress bar background */
    --vs-color: #f1f5f9; /* VS text in comparison with better contrast */
    
    /* Interactive elements */
    --focus-ring: rgba(99, 102, 241, 0.6); /* Focus indicator */
    --keyboard-hint-bg: #475569; /* Background for keyboard hint */
    --button-bg: rgba(99, 102, 241, 0.15); /* Subtle button background */
    --button-hover: rgba(99, 102, 241, 0.25); /* Hover state for buttons */
    
    /* Shadows */
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
  }
  
  /* Light theme */
  :global([data-theme="light"]) {
    --bg-color: #f8fafc; /* Light gray background */
    --text-color: #0f172a; /* Dark text for contrast */
    --card-bg: #ffffff; /* White card background */
    --card-border: #e2e8f0; /* Light gray border */
    --card-hover-border: #cbd5e1; /* Darker gray border on hover */
    --card-selected-border: #10b981; /* Green teal border for selection */
    
    /* Text and utility colors */
    --muted-color: #64748b; /* Medium gray for muted text */
    --progress-bg: #e2e8f0; /* Light gray progress background */
    --vs-color: #334155; /* Dark text for VS in comparison */
    
    /* Interactive elements */
    --focus-ring: rgba(99, 102, 241, 0.4); /* Focus indicator */
    --keyboard-hint-bg: #f1f5f9; /* Light background for keyboard hint */
    --button-bg: rgba(99, 102, 241, 0.1); /* Very subtle button background */
    --button-hover: rgba(99, 102, 241, 0.15); /* Hover state for buttons */
    
    /* Lighter shadows for light theme */
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.05);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }
  
  /* High contrast mode */
  :global(.high-contrast) {
    --text-color: #ffffff !important;
    --bg-color: #000000 !important;
    --card-bg: #101010 !important;
    --card-border: #444444 !important;
    --card-hover-border: #666666 !important;
    --muted-color: #eeeeee !important;
    --vs-color: #ffffff !important;
    --primary-color: #00ff9d !important;
    --primary-hover: #00cc7a !important;
    --secondary-color: #5e5eff !important;
    --secondary-hover: #7a7aff !important;
    --accent-color: #ff3355 !important;
    --accent-hover: #ff667f !important;
    --focus-ring: rgba(255, 255, 255, 0.8) !important;
  }
  
  /* Font size settings */
  :global([data-font-size="small"]) {
    font-size: 0.875rem;
  }
  
  :global([data-font-size="default"]) {
    font-size: 1rem;
  }
  
  :global([data-font-size="large"]) {
    font-size: 1.125rem;
  }
  
  :global([data-font-size="x-large"]) {
    font-size: 1.25rem;
  }
  
  /* Reduced motion settings */
  :global(.reduced-motion) {
    --transition-duration: 0ms !important;
    --animation-duration: 0ms !important;
  }
  
  :global(.reduced-motion *) {
    animation-duration: 0ms !important;
    transition-duration: 0ms !important;
  }
  
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: var(--bg-color);
    color: var(--text-color);
    transition: background-color 0.3s ease, color 0.3s ease;
    line-height: 1.5;
    letter-spacing: 0.01em;
  }
  
  :global(*, *::before, *::after) {
    box-sizing: border-box;
  }
  
  :global(button) {
    cursor: pointer;
    font-weight: 500;
    border-radius: 6px;
    padding: 10px 16px;
    background-color: var(--primary-color);
    color: white;
    border: none;
    transition: all 0.2s ease;
  }
  
  :global(button:hover) {
    background-color: var(--primary-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
  
  :global(button:focus) {
    outline: none;
    box-shadow: 0 0 0 3px var(--primary-focus);
  }
  
  :global(button.secondary) {
    background-color: var(--secondary-color);
  }
  
  :global(button.secondary:hover) {
    background-color: var(--secondary-hover);
  }
  
  :global(button.secondary:focus) {
    box-shadow: 0 0 0 3px var(--secondary-focus);
  }
  
  :global(button.accent) {
    background-color: var(--accent-color);
  }
  
  :global(button.accent:hover) {
    background-color: var(--accent-hover);
  }
  
  :global(h1, h2, h3, h4, h5, h6) {
    font-weight: 600;
    line-height: 1.2;
    margin-top: 0;
    color: var(--text-color);
  }
  
  :global(a) {
    color: var(--secondary-color);
    text-decoration: none;
    transition: color 0.2s ease;
  }
  
  :global(a:hover) {
    color: var(--secondary-hover);
    text-decoration: underline;
  }
  
  .app-container {
    position: relative;
    min-height: 100vh;
    background: linear-gradient(to bottom, var(--bg-color), #131d35);
  }
  
  main {
    min-height: 100vh;
    padding: 40px 20px;
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
  }
  
  .screen-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding: 40px 20px;
    transform-origin: center;
    will-change: transform, opacity;
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
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 1px solid var(--card-border);
    background-color: var(--button-bg);
    color: var(--text-color);
    padding: 0;
    transition: all 0.2s ease;
    box-shadow: var(--shadow-sm);
  }
  
  .help-button:hover {
    background-color: var(--button-hover);
    transform: scale(1.05);
    box-shadow: var(--shadow-md);
    border-color: var(--card-hover-border);
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
    background-color: rgba(15, 23, 42, 0.8);
    backdrop-filter: blur(4px);
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
    background-color: #0f172a; /* Darker background for better contrast */
    background: linear-gradient(to bottom, #1e293b, #0f172a); /* Gradient background */
    border-radius: 12px;
    padding: 32px;
    box-shadow: var(--shadow-xl);
    border: 1px solid var(--card-border);
  }
  
  .help-content::-webkit-scrollbar {
    width: 8px;
  }
  
  .help-content::-webkit-scrollbar-track {
    background: var(--card-bg);
    border-radius: 8px;
  }
  
  .help-content::-webkit-scrollbar-thumb {
    background: var(--card-border);
    border-radius: 8px;
  }
  
  .help-content::-webkit-scrollbar-thumb:hover {
    background: var(--card-hover-border);
  }
  
  .close-button {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1px solid var(--card-border);
    background-color: var(--button-bg);
    color: var(--text-color);
    font-size: 24px;
    font-weight: 400;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 0;
  }
  
  .close-button:hover {
    background-color: var(--button-hover);
    transform: scale(1.05);
    border-color: var(--card-hover-border);
  }
  
  .help-content h2 {
    margin-top: 0;
    margin-bottom: 24px;
    font-size: 28px;
    color: var(--text-color);
    border-bottom: 1px solid var(--card-border);
    padding-bottom: 12px;
  }
  
  .help-content h3 {
    margin-top: 24px;
    margin-bottom: 12px;
    font-size: 20px;
    color: #34d399; /* Lighter teal color for better contrast */
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
  }
  
  .help-content p, 
  .help-content li {
    color: white; /* Pure white for maximum contrast */
    line-height: 1.6;
  }
  
  .help-content strong {
    color: #a5b4fc; /* Lighter indigo for better contrast */
    font-weight: 600;
  }
  
  .help-content ul,
  .help-content ol {
    padding-left: 24px;
  }
  
  .help-content ul li {
    margin-bottom: 8px;
    position: relative;
  }
  
  .help-content ol li {
    margin-bottom: 8px;
    padding-left: 4px;
  }
  
  .help-content ul li::marker {
    color: #fb7185; /* Lighter accent color for better contrast */
  }
  
  .help-content ol li::marker {
    color: #a5b4fc; /* Lighter secondary color for better contrast */
    font-weight: 600;
  }
  /* Confetti animation */
  .confetti {
    position: fixed;
    z-index: 1000;
    top: -20px;
    pointer-events: none;
  }
  
  @keyframes fall {
    0% {
      transform: translateY(-20px) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(100vh) rotate(720deg);
      opacity: 0;
    }
  }
</style>
