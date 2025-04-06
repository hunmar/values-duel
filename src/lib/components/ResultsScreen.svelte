<script lang="ts">
  import { onMount } from 'svelte';
  import { APP_STATES } from '../stores/appState.js';
  import appState from '../stores/appState.js';
  import foodItems from '../stores/foodItems.js';
  import { sortItemsByRating } from '../utils/eloRating.js';
  import { STORAGE_KEYS, saveToLocalStorage, clearAllAppData } from '../utils/localStorage.js';
  
  let rankedFoodItems = [];
  let shareUrl = null;
  let copySuccess = false;
  let isSharedResult = false;
  
  onMount(() => {
    // Subscribe to the app state store to check if this is a shared result
    const unsubscribeAppState = appState.subscribe(state => {
      isSharedResult = state.isSharedResult || false;
    });
    
    // Subscribe to the foodItems store
    const unsubscribeFoodItems = foodItems.subscribe(items => {
      // Sort items by rating
      rankedFoodItems = sortItemsByRating(items);
      
      // Save the final rankings to localStorage only if not a shared result
      if (!isSharedResult) {
        saveToLocalStorage(STORAGE_KEYS.FOOD_ITEMS, items);
      }
    });
    
    // Cleanup subscriptions on component unmount
    return () => {
      unsubscribeFoodItems();
      unsubscribeAppState();
    };
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
    
    // Reset share URL
    shareUrl = null;
    copySuccess = false;
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
  
  function generateShareableLink() {
    // Create a shareable data structure with just the essential information
    const shareableData = rankedFoodItems.map(item => ({
      name: item.name,
      rating: item.rating,
      position: rankedFoodItems.findIndex(i => i.id === item.id) + 1
    }));
    
    // Compress the data by encoding it as a JSON string and then as a URL-safe base64 string
    const jsonStr = JSON.stringify(shareableData);
    const base64Str = btoa(unescape(encodeURIComponent(jsonStr)));
    
    // Create a shareable URL with the data as a query parameter
    const baseUrl = window.location.origin + window.location.pathname;
    shareUrl = `${baseUrl}?results=${base64Str}`;
    
    // Reset copy success state
    copySuccess = false;
  }
  
  function copyShareUrl() {
    // Get the input element
    const shareInput = document.getElementById('share-url-input') as HTMLInputElement;
    
    // Select the text
    shareInput.select();
    shareInput.setSelectionRange(0, 99999); // For mobile devices
    
    // Copy the text to the clipboard
    document.execCommand('copy');
    
    // Update the copy success state
    copySuccess = true;
    
    // Reset the copy success state after 2 seconds
    setTimeout(() => {
      copySuccess = false;
    }, 2000);
  }
</script>

<div class="results-container">
  <header>
    {#if isSharedResult}
      <h1>Shared Food Preference Ranking</h1>
      <p>Someone shared their food preferences with you</p>
    {:else}
      <h1>Your Food Preference Ranking</h1>
      <p>Based on your comparisons, here's how you ranked these foods</p>
    {/if}
  </header>
  
  <div class="results-summary">
    {#if isSharedResult}
      <p>This is a shared ranking of {rankedFoodItems.length} food items.</p>
      <p>Their top choice was <strong>{rankedFoodItems[0]?.name}</strong>!</p>
    {:else}
      <p>You completed {rankedFoodItems.length} food item comparisons.</p>
      <p>Your top choice was <strong>{rankedFoodItems[0]?.name}</strong>!</p>
    {/if}
  </div>
  
  <div class="ranked-list">
    {#each rankedFoodItems as food, index}
      <div class="ranked-item">
        <div class="rank">{index + 1}</div>
        <div class="food-image">
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
      {isSharedResult ? 'Start Your Own Ranking' : 'Restart Ranking'}
    </button>
    <button class="action-button export" on:click={exportRankings}>
      Export Results
    </button>
    {#if !isSharedResult}
      <button class="action-button share" on:click={generateShareableLink}>
        Share Results
      </button>
    {/if}
  </div>
  
  {#if shareUrl}
    <div class="share-container">
      <p>Share your results with this link:</p>
      <div class="share-url-container">
        <input type="text" readonly value={shareUrl} class="share-url" id="share-url-input" />
        <button class="copy-button" on:click={copyShareUrl}>
          {copySuccess ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div class="share-social">
        <a href={`https://twitter.com/intent/tweet?text=Check%20out%20my%20food%20preferences!&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" class="social-button twitter">
          Share on Twitter
        </a>
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" class="social-button facebook">
          Share on Facebook
        </a>
      </div>
    </div>
  {/if}
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
  
  .action-button.share {
    background-color: #9C27B0;
    color: white;
  }
  
  .action-button.share:hover {
    background-color: #7B1FA2;
  }
  
  .share-container {
    margin-top: 2rem;
    padding: 1.5rem;
    background-color: #f9f9f9;
    border-radius: 8px;
    text-align: center;
  }
  
  .share-url-container {
    display: flex;
    justify-content: center;
    margin: 1rem 0;
  }
  
  .share-url {
    flex-grow: 1;
    max-width: 500px;
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 4px 0 0 4px;
    font-size: 0.9rem;
  }
  
  .copy-button {
    padding: 0.8rem 1.2rem;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 0 4px 4px 0;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.3s ease;
  }
  
  .copy-button:hover {
    background-color: #45a049;
  }
  
  .share-social {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 1rem;
  }
  
  .social-button {
    display: inline-block;
    padding: 0.8rem 1.2rem;
    border-radius: 4px;
    text-decoration: none;
    font-weight: bold;
    font-size: 0.9rem;
    transition: opacity 0.3s ease;
  }
  
  .social-button:hover {
    opacity: 0.9;
  }
  
  .social-button.twitter {
    background-color: #1DA1F2;
    color: white;
  }
  
  .social-button.facebook {
    background-color: #4267B2;
    color: white;
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
      margin-bottom: 0.5rem;
    }
    
    .share-url-container {
      flex-direction: column;
    }
    
    .share-url {
      width: 100%;
      max-width: none;
      margin-bottom: 0.5rem;
      border-radius: 4px;
    }
    
    .copy-button {
      width: 100%;
      border-radius: 4px;
    }
    
    .share-social {
      flex-direction: column;
    }
    
    .social-button {
      width: 100%;
    }
  }
</style>