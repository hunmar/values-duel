<script>
  import { onMount } from 'svelte';
  import { APP_STATES } from '../stores/appState.js';
  import appState from '../stores/appState.js';
  import foodItems from '../stores/foodItems.js';
  import { sortItemsByRating } from '../utils/eloRating.js';
  import { STORAGE_KEYS, saveToLocalStorage, clearAllAppData } from '../utils/localStorage.js';
  import { Container, Heading, Text, Button, Card, CardContent, Badge } from '../ui';
  
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
    const shareInput = document.getElementById('share-url-input');
    
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
  
  // Get trophy icon based on position
  function getTrophyIcon(position) {
    switch(position) {
      case 1: return '🏆';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  }
  
  // Get badge variant based on position
  function getBadgeVariant(position) {
    switch(position) {
      case 1: return 'default';
      case 2: return 'secondary';
      case 3: return 'accent';
      default: return 'outline';
    }
  }
</script>

<Container className="results-container">
  <header class="results-header">
    <div class="header-content">
      {#if isSharedResult}
        <Badge variant="secondary" className="shared-badge">Shared Results</Badge>
        <Heading className="results-title">Food Preference Ranking</Heading>
        <Text lead={true}>Someone shared their food preferences with you</Text>
      {:else}
        <div class="trophy-icon">🏆</div>
        <Heading className="results-title">Your Food Preference Ranking</Heading>
        <Text lead={true}>Based on your comparisons, here's how you ranked these foods</Text>
      {/if}
    </div>
    
    <div class="top-choice">
      <div class="top-choice-image">
        <img 
          src={rankedFoodItems[0]?.imageUrl} 
          alt={rankedFoodItems[0]?.name}
          on:error={(e) => {
            // Use fallback image if the main image fails to load
            if (rankedFoodItems[0]?.fallbackImageUrl) {
              e.target.src = rankedFoodItems[0].fallbackImageUrl;
            }
          }}
        />
      </div>
      <div class="top-choice-info">
        <Badge variant="default" className="first-badge">#1 Choice</Badge>
        <Text className="top-food-name">{rankedFoodItems[0]?.name}</Text>
        <Text className="rating-value">Rating: {rankedFoodItems[0]?.rating}</Text>
      </div>
    </div>
  </header>
  
  <div class="results-grid">
    <Card className="rankings-card">
      <CardContent>
        <div class="card-header-content">
          <Heading level={2} size="h3">Complete Ranking</Heading>
          <Badge variant="outline">{rankedFoodItems.length} items</Badge>
        </div>
        
        <div class="ranked-list">
          {#each rankedFoodItems as food, index}
            <div class="ranked-item" class:top-three={index < 3}>
              <div class="rank">
                <Badge variant={getBadgeVariant(index + 1)} className="rank-badge">
                  {getTrophyIcon(index + 1)} {index + 1}
                </Badge>
              </div>
              
              <div class="food-content">
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
                
                <div class="food-info">
                  <Text className="food-name">{food.name}</Text>
                  <Text size="sm" muted={true} className="food-description">{food.description}</Text>
                </div>
                
                <div class="rating">
                  <div class="rating-score">
                    <Text className="score">{Math.round(food.rating)}</Text>
                  </div>
                  <Text size="xs" muted={true}>Elo rating</Text>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </CardContent>
    </Card>
    
    <div class="side-content">
      <Card className="actions-card">
        <CardContent>
          <Heading level={2} size="h3">Actions</Heading>
          
          <div class="actions-buttons">
            <Button variant="default" className="action-button" on:click={restartRanking}>
              {isSharedResult ? 'Start Your Own Ranking' : 'Restart Ranking'}
            </Button>
            
            <Button variant="secondary" className="action-button" on:click={exportRankings}>
              Export Results
            </Button>
            
            {#if !isSharedResult}
              <Button variant="accent" className="action-button" on:click={generateShareableLink}>
                Share Results
              </Button>
            {/if}
          </div>
        </CardContent>
      </Card>
      
      {#if shareUrl}
        <Card className="share-card">
          <CardContent>
            <Heading level={2} size="h3">Share Your Results</Heading>
            <Text size="sm">Share your food preferences with friends and family using this link:</Text>
            
            <div class="share-url-container">
              <input 
                type="text" 
                readonly 
                value={shareUrl} 
                class="share-url" 
                id="share-url-input" 
              />
              <Button 
                variant="default" 
                className="copy-button" 
                on:click={copyShareUrl}
              >
                {copySuccess ? 'Copied! ✓' : 'Copy'}
              </Button>
            </div>
            
            <div class="social-share">
              <Text size="sm" className="social-label">Share on social media:</Text>
              <div class="social-buttons">
                <a 
                  href={`https://twitter.com/intent/tweet?text=Check%20out%20my%20food%20preferences!&url=${encodeURIComponent(shareUrl)}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  class="social-button twitter"
                >
                  Twitter
                </a>
                <a 
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  class="social-button facebook"
                >
                  Facebook
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      {/if}
    </div>
  </div>
</Container>

<style>
  .results-container {
    padding-top: 2rem;
    padding-bottom: 4rem;
  }
  
  .results-header {
    margin-bottom: 2.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .trophy-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
  }
  
  .results-title {
    margin-bottom: 0.5rem;
  }
  
  .shared-badge {
    margin-bottom: 1rem;
  }
  
  .top-choice {
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(99, 102, 241, 0.1));
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: var(--shadow-md);
    border: 1px solid var(--card-border);
    position: relative;
    overflow: hidden;
    max-width: 300px;
  }
  
  .top-choice::before {
    content: '';
    position: absolute;
    top: -20px;
    left: -20px;
    width: 60px;
    height: 60px;
    background: var(--primary-color);
    transform: rotate(45deg);
    z-index: 1;
  }
  
  .top-choice-image {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    overflow: hidden;
    margin-bottom: 1rem;
    border: 3px solid var(--primary-color);
    box-shadow: var(--shadow-lg);
  }
  
  .top-choice-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .top-choice-info {
    text-align: center;
  }
  
  .first-badge {
    margin-bottom: 0.5rem;
  }
  
  .top-food-name {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }
  
  .rating-value {
    font-size: 0.875rem;
    opacity: 0.8;
  }
  
  .results-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .card-header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
  }
  
  .ranked-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .ranked-item {
    display: flex;
    padding: 0.75rem;
    border-radius: 8px;
    background-color: rgba(30, 41, 59, 0.4);
    border: 1px solid var(--card-border);
    transition: all 0.2s ease;
  }
  
  .ranked-item:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    background-color: rgba(30, 41, 59, 0.6);
    border-color: var(--card-hover-border);
  }
  
  .top-three {
    background: linear-gradient(to right, rgba(16, 185, 129, 0.1), rgba(99, 102, 241, 0.1));
    border-left: 3px solid var(--primary-color);
  }
  
  .rank {
    display: flex;
    align-items: center;
    padding-right: 1rem;
  }
  
  .rank-badge {
    min-width: 2.5rem;
    display: flex;
    justify-content: center;
  }
  
  .food-content {
    display: flex;
    flex: 1;
    align-items: center;
  }
  
  .food-image {
    width: 50px;
    height: 50px;
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
    flex: 1;
  }
  
  .food-name {
    font-weight: 600;
    margin-bottom: 0.25rem;
  }
  
  .food-description {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .rating {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-left: 1rem;
    min-width: 80px;
  }
  
  .rating-score {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    color: white;
    width: 60px;
    height: 30px;
    border-radius: 15px;
    margin-bottom: 0.25rem;
  }
  
  .score {
    font-weight: 600;
    font-size: 0.875rem;
  }
  
  .actions-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }
  
  .action-button {
    width: 100%;
  }
  
  .share-url-container {
    display: flex;
    margin: 1rem 0;
    gap: 0.5rem;
  }
  
  .share-url {
    flex: 1;
    padding: 0.75rem;
    border-radius: 8px;
    border: 1px solid var(--card-border);
    background-color: rgba(15, 23, 42, 0.3);
    color: var(--text-color);
    font-size: 0.875rem;
  }
  
  .copy-button {
    min-width: 80px;
  }
  
  .social-label {
    margin-bottom: 0.75rem;
  }
  
  .social-buttons {
    display: flex;
    gap: 0.75rem;
  }
  
  .social-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s ease;
  }
  
  .social-button.twitter {
    background-color: #1DA1F2;
    color: white;
  }
  
  .social-button.facebook {
    background-color: #4267B2;
    color: white;
  }
  
  .social-button:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }
  
  @media (min-width: 768px) {
    .results-grid {
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
    }
    
    .side-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
  }
  
  @media (max-width: 767px) {
    .side-content > * {
      margin-bottom: 1.5rem;
    }
  }
</style>