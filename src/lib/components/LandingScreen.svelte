<script>
  import { onMount } from 'svelte';
  import { APP_STATES } from '../stores/appState.js';
  import appState from '../stores/appState.js';
  import foodItems from '../stores/foodItems.js';
  import { calculateMinComparisons } from '../utils/eloRating.js';
  
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
  
  <section class="custom-import">
    <h2>Import Custom Food List</h2>
    <p>Create your own ranking experience by importing a custom food list.</p>
    <label for="import-file" class="import-button">
      Select JSON File
    </label>
    <input 
      type="file" 
      id="import-file" 
      accept=".json" 
      on:change={handleFileImport}
      style="display: none;"
    />
    <p class="import-format-info">
      <a href="#" on:click|preventDefault={showImportFormat}>View required format</a>
    </p>
    {#if importError}
      <p class="import-error">{importError}</p>
    {/if}
  </section>

  <button class="start-button" on:click={startRanking}>
    Start Ranking
  </button>
  
  {#if showFormatInfo}
    <div class="format-modal">
      <div class="format-content">
        <h3>Required JSON Format</h3>
        <pre>{`[
  {
    "id": 1,
    "name": "Item Name",
    "description": "Item description",
    "imageUrl": "https://example.com/image.jpg",
    "rating": 1200
  },
  ...
]`}</pre>
        <p>Each item must include id, name, description, imageUrl, and rating (start with 1200).</p>
        <button on:click={() => showFormatInfo = false}>Close</button>
      </div>
    </div>
  {/if}
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
  
  .custom-import {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background-color: #f9f9f9;
    border-radius: 8px;
    text-align: center;
  }
  
  .import-button {
    display: inline-block;
    padding: 0.8rem 1.5rem;
    margin: 1rem 0;
    font-size: 1rem;
    font-weight: bold;
    background-color: #2196F3;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
  }
  
  .import-button:hover {
    background-color: #0b7dda;
    transform: translateY(-2px);
  }
  
  .import-button:active {
    transform: translateY(0);
  }
  
  .import-format-info {
    font-size: 0.9rem;
    margin-top: 0.5rem;
  }
  
  .import-format-info a {
    color: #2196F3;
    text-decoration: none;
  }
  
  .import-error {
    color: #f44336;
    font-size: 0.9rem;
    margin-top: 0.5rem;
  }
  
  .format-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
  }
  
  .format-content {
    background-color: white;
    padding: 2rem;
    border-radius: 8px;
    max-width: 600px;
    width: 90%;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  .format-content h3 {
    margin-top: 0;
    margin-bottom: 1rem;
  }
  
  .format-content pre {
    background-color: #f5f5f5;
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 0.9rem;
  }
  
  .format-content button {
    padding: 0.5rem 1rem;
    margin-top: 1rem;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .format-content button:hover {
    background-color: #45a049;
  }
</style>