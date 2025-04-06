<script>
  import { onMount } from 'svelte';
  import { APP_STATES } from '../stores/appState.js';
  import appState from '../stores/appState.js';
  import foodItems from '../stores/foodItems.js';
  import { calculateMinComparisons, updateRatings } from '../utils/eloRating.js';
  import { Container, Heading, Text, Button, Card, CardContent, Badge } from '../ui';
  
  function openSettings() {
    appState.update(state => ({
      ...state,
      showSettingsPanel: true
    }));
  }
  
  let foodList = [];
  let importError = null;
  let showFormatInfo = false;
  
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
    // Make sure we have at least 2 food items to compare
    if (!foodList || foodList.length < 2) {
      alert("Not enough food items to compare. Please add more items.");
      return;
    }
    
    const minComparisons = calculateMinComparisons(foodList.length);
    console.log(`Starting comparison with ${foodList.length} items and ${minComparisons} comparisons`);
    
    // Update the app state
    appState.update(state => ({
      ...state,
      currentState: APP_STATES.COMPARISON,
      totalComparisons: minComparisons,
      completedComparisons: 0,
      comparisonHistory: []
    }));
  }
  
  function handleFileImport(event) {
    importError = null;
    const file = event.target.files[0];
    
    if (!file) return;
    
    if (file.type !== 'application/json') {
      importError = 'Please select a valid JSON file.';
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        // Parse the JSON file
        const importedData = JSON.parse(e.target.result);
        
        // Validate the imported data
        if (!Array.isArray(importedData)) {
          importError = 'Invalid format: Data must be an array of food items.';
          return;
        }
        
        // Check if all items have the required properties
        const isValid = importedData.every(item => 
          item.id && 
          item.name && 
          item.description && 
          item.imageUrl && 
          typeof item.rating === 'number'
        );
        
        if (!isValid) {
          importError = 'Invalid format: All items must have id, name, description, imageUrl, and rating.';
          return;
        }
        
        // Set the imported data
        foodItems.set(importedData);
        
        // Reset the file input
        event.target.value = '';
        
        // Show success message
        alert(`Successfully imported ${importedData.length} food items.`);
        
      } catch (error) {
        importError = `Error parsing JSON: ${error.message}`;
      }
    };
    
    reader.onerror = () => {
      importError = 'Error reading file.';
    };
    
    reader.readAsText(file);
  }
  
  function showImportFormat() {
    showFormatInfo = true;
  }
  
  function startDemoMode() {
    // Make sure we have at least 5 food items for a meaningful demo
    if (!foodList || foodList.length < 5) {
      alert("Not enough food items to run a demo. Please try again later.");
      return;
    }
    
    // Create a simulated comparison history with predefined choices
    // We'll take the first 5 most visually distinct food items for the demo
    const demoItems = foodList.slice(0, 5);
    const demoComparisons = [];
    const timestamp = Date.now();
    
    // Create predefined comparisons that show pizza winning
    let pizzaItem = demoItems.find(item => item.name.toLowerCase().includes('pizza'));
    if (!pizzaItem) pizzaItem = demoItems[0]; // Fallback if no pizza
    
    // Update the ratings for each comparison
    const demoRatings = {};
    demoItems.forEach(item => {
      demoRatings[item.id] = 1200; // Start all with base rating
    });
    
    // Create a series of comparisons where pizza (or first item) wins most
    for (let i = 0; i < demoItems.length - 1; i++) {
      // Skip if comparing the same item (pizza to pizza)
      if (demoItems[i].id === pizzaItem.id) continue;
      
      // Create winner/loser based on predetermined outcome
      const itemA = demoItems[i];
      const itemB = demoItems[(i + 1) % demoItems.length];
      
      // Make pizzaItem win 75% of the time for demo purposes
      const winner = Math.random() < 0.75 ? pizzaItem : (itemA.id !== pizzaItem.id ? itemA : itemB);
      const loser = winner.id === itemA.id ? itemB : itemA;
      
      // Calculate the rating change
      const ratingA = demoRatings[itemA.id];
      const ratingB = demoRatings[itemB.id];
      const actualOutcomeA = winner.id === itemA.id ? 1 : 0;
      
      const { newRatingA, newRatingB } = updateRatings(ratingA, ratingB, actualOutcomeA);
      
      // Update our tracked ratings
      demoRatings[itemA.id] = newRatingA;
      demoRatings[itemB.id] = newRatingB;
      
      // Add to demo comparison history
      demoComparisons.push({
        itemA: { ...itemA, rating: ratingA },
        itemB: { ...itemB, rating: ratingB },
        winner: { ...winner, rating: winner.id === itemA.id ? newRatingA : newRatingB },
        loser: { ...loser, rating: loser.id === itemA.id ? newRatingA : newRatingB },
        timestamp: timestamp - (demoItems.length - i) * 5000 // Stagger timestamps for realism
      });
    }
    
    // Set demo mode to true and update the app state
    appState.update(state => ({
      ...state,
      currentState: APP_STATES.RESULTS, // Skip directly to results for demo
      totalComparisons: demoComparisons.length,
      completedComparisons: demoComparisons.length,
      comparisonHistory: demoComparisons,
      isDemoMode: true
    }));
    
    // Update food items with the simulated ratings
    foodItems.update(items => {
      return items.map(item => ({
        ...item,
        rating: demoRatings[item.id] || item.rating
      }));
    });
  }
</script>

<Container className="landing-container">
  <header class="landing-header">
    <div class="logo-container">
      <div class="logo">TD</div>
    </div>
    <Heading className="app-title">Taste Duel</Heading>
    <Text lead={true} className="app-subtitle">Discover your true food preferences through direct comparisons</Text>
    
    <button class="settings-button" on:click={openSettings} aria-label="Settings" title="Settings">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    </button>
  </header>
  
  <div class="grid-layout">
    <section class="food-preview">
      <div class="section-heading">
        <Heading level={2} size="h3">Food Collection</Heading>
        <Badge variant="secondary">{foodList.length} items</Badge>
      </div>
      
      <div class="food-grid">
        {#each foodList as food}
          <Card className="food-preview-card">
            <div class="food-image">
              <img 
                src={food.imageUrl} 
                alt={food.name}
                on:error={(e) => {
                  // Use fallback image if the main image fails to load
                  if (food.fallbackImageUrl) {
                    e.target.src = food.fallbackImageUrl;
                  }
                }}
              />
            </div>
            <CardContent className="food-name-container">
              <Text className="food-name">{food.name}</Text>
            </CardContent>
          </Card>
        {/each}
      </div>
    </section>
    
    <section class="instructions-section">
      <Card className="instructions-card">
        <CardContent>
          <Heading level={2} size="h3">How It Works</Heading>
          <ol class="steps-list">
            <li>
              <span class="step-number">1</span>
              <Text>You'll be shown two food items at a time</Text>
            </li>
            <li>
              <span class="step-number">2</span>
              <Text>Select the one you prefer</Text>
            </li>
            <li>
              <span class="step-number">3</span>
              <Text>Continue until all necessary comparisons are complete</Text>
            </li>
            <li>
              <span class="step-number">4</span>
              <Text>View your personalized food preference ranking</Text>
            </li>
          </ol>
          <Text size="sm" muted={true} className="elo-note">
            This app uses the Elo rating system to accurately rank your preferences based on your choices.
          </Text>
        </CardContent>
      </Card>
      
      <Card className="import-card">
        <CardContent>
          <Heading level={2} size="h3">Import Custom Foods</Heading>
          <Text>Create your own ranking experience by importing a custom food list.</Text>
          
          <div class="import-controls">
            <label for="import-file" class="import-label">
              <Button variant="secondary" className="import-button" as="span">
                <span class="import-icon">📂</span>
                Select JSON File
              </Button>
            </label>
            <input 
              type="file" 
              id="import-file" 
              accept=".json" 
              on:change={handleFileImport}
              style="display: none;"
            />
            <Button variant="ghost" className="format-link" on:click={showImportFormat}>
              View format
            </Button>
          </div>
          
          {#if importError}
            <Text className="import-error">{importError}</Text>
          {/if}
        </CardContent>
      </Card>
    </section>
  </div>
  
  <div class="start-section">
    <div class="start-buttons">
      <Button variant="default" className="start-button" on:click={startRanking}>
        Start Ranking
      </Button>
      <Button variant="outline" className="demo-button" on:click={startDemoMode}>
        Try Demo
      </Button>
    </div>
    <Text size="sm" muted={true} className="demo-hint">
      New here? Try the demo to see how it works.
    </Text>
  </div>
  
  {#if showFormatInfo}
    <div class="format-overlay">
      <div class="format-modal">
        <Card className="format-card">
          <CardContent>
            <div class="format-header">
              <Heading level={3} size="h3">Required JSON Format</Heading>
              <button class="close-button" on:click={() => showFormatInfo = false}>×</button>
            </div>
            <pre class="format-code">{`[
  {
    "id": 1,
    "name": "Item Name",
    "description": "Item description",
    "imageUrl": "https://example.com/image.jpg",
    "rating": 1200
  },
  ...
]`}</pre>
            <Text>Each item must include id, name, description, imageUrl, and rating (start with 1200).</Text>
            <Button on:click={() => showFormatInfo = false}>Close</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  {/if}
</Container>

<style>
  /* Use :global for class that is applied via className prop */
  :global(.landing-container) {
    padding-top: 3rem;
    padding-bottom: 3rem;
    position: relative;
  }
  
  .settings-button {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: rgba(99, 102, 241, 0.1);
    border: 1px solid var(--card-border);
    color: var(--text-color);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .settings-button:hover {
    background-color: rgba(99, 102, 241, 0.2);
    transform: rotate(30deg);
  }
  
  .landing-header {
    text-align: center;
    margin-bottom: 4rem;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .logo-container {
    margin-bottom: 1.5rem;
  }
  
  .logo {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: 800;
    color: white;
    box-shadow: var(--shadow-lg);
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  /* Use :global for classes that are applied via className prop */
  :global(.app-title) {
    font-size: 3.5rem;
    margin-bottom: 0.75rem;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;
  }
  
  :global(.app-subtitle) {
    font-size: 1.25rem;
    max-width: 600px;
  }
  
  .grid-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    margin-bottom: 3rem;
  }
  
  .section-heading {
    display: flex;
    align-items: center;
    margin-bottom: 1.5rem;
    gap: 1rem;
  }
  
  .food-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 1rem;
  }
  
  :global(.food-preview-card) {
    transition: all 0.2s ease;
    overflow: hidden;
    height: 160px;
  }
  
  :global(.food-preview-card:hover) {
    transform: translateY(-5px);
  }
  
  .food-image {
    height: 90px;
    overflow: hidden;
  }
  
  .food-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  :global(.food-preview-card:hover) .food-image img {
    transform: scale(1.1);
  }
  
  :global(.food-name-container) {
    padding: 0.5rem !important;
    text-align: center;
  }
  
  :global(.food-name) {
    font-size: 0.875rem;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .instructions-section {
    display: grid;
    gap: 1.5rem;
  }
  
  .steps-list {
    list-style: none;
    padding: 0;
    margin: 1.5rem 0;
  }
  
  .steps-list li {
    display: flex;
    align-items: flex-start;
    margin-bottom: 1rem;
    gap: 1rem;
  }
  
  .step-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background-color: var(--primary-color);
    color: white;
    border-radius: 50%;
    font-weight: bold;
    flex-shrink: 0;
  }
  
  :global(.elo-note) {
    margin-top: 1rem;
    font-style: italic;
  }
  
  .import-controls {
    display: flex;
    gap: 1rem;
    margin: 1.5rem 0 1rem;
  }
  
  :global(.import-button) {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .import-icon {
    font-size: 1.2rem;
  }
  
  :global(.import-error) {
    color: var(--accent-color);
    margin-top: 0.5rem;
    font-size: 0.875rem;
  }
  
  .start-section {
    text-align: center;
  }
  
  .start-buttons {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 0.75rem;
  }
  
  :global(.start-button) {
    font-size: 1.25rem;
    padding: 0.75rem 2.5rem;
    font-weight: 600;
  }
  
  :global(.demo-button) {
    font-size: 1.25rem;
    padding: 0.75rem 2rem;
  }
  
  :global(.demo-hint) {
    opacity: 0.7;
  }
  
  .format-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: 1rem;
  }
  
  .format-modal {
    width: 100%;
    max-width: 600px;
  }
  
  .format-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .close-button {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: var(--card-border);
    border: none;
    color: var(--text-color);
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .close-button:hover {
    background-color: var(--card-hover-border);
  }
  
  .format-code {
    background-color: rgba(0, 0, 0, 0.2);
    padding: 1rem;
    border-radius: 0.5rem;
    margin: 1rem 0;
    overflow-x: auto;
    font-family: monospace;
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--text-color);
  }
  
  @media (min-width: 768px) {
    .grid-layout {
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
    }
    
    .food-grid {
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    }
  }
  
  @media (min-width: 1024px) {
    .food-grid {
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    }
  }
</style>