<script lang="ts">
  import { onMount } from 'svelte';
  import { APP_STATES } from '../stores/appState.js';
  import appState from '../stores/appState.js';
  import foodItems from '../stores/foodItems.js';
  import { FOOD_CATEGORIES, getCategoryColor } from '../stores/foodItems.js';
  import { sortItemsByRating, calculateConfidence } from '../utils/eloRating.js';
  import { STORAGE_KEYS, saveToLocalStorage, clearAllAppData } from '../utils/localStorage.js';
  import { Badge, Button, Card, CardContent, Text, Heading, Container, ToastService, ToastContainer } from '../ui';

  interface CategoryInsight {
    category: string;
    count: number;
    percentage: number;
  }

  interface CategoryInsights {
    topCuisines: CategoryInsight[];
    topTypes: CategoryInsight[];
    dietaryPreferences: CategoryInsight[];
    favoriteIngredients: CategoryInsight[];
    preferredCookingMethods: CategoryInsight[];
  }

  let rankedFoodItems = [];
  let shareUrl: string | null = null;
  let copySuccess = false;
  let isSharedResult = false;
  let confidenceScore = 0;
  let categoryInsights: CategoryInsights = {
    topCuisines: [],
    topTypes: [],
    dietaryPreferences: [],
    favoriteIngredients: [],
    preferredCookingMethods: []
  };
  let sortedItems = [];
  let showCategoryInsights = false;

  onMount(() => {
    // Subscribe to the app state store to check if this is a shared result
    const unsubscribeAppState = appState.subscribe(state => {
      isSharedResult = state.isSharedResult || false;

      // Get selected categories
      const selectedCategories = state.selectedCategories || {
        cuisine: [],
        type: [],
        dietary: [],
        ingredient: [],
        cookingMethod: []
      };

      // Calculate confidence score
      if (sortedItems && sortedItems.length > 0 && state.comparisonHistory && state.comparisonHistory.length > 0) {
        confidenceScore = calculateConfidence(sortedItems, state.comparisonHistory);
      }
    });

    // Subscribe to the foodItems store
    const unsubscribeFoodItems = foodItems.subscribe(items => {
      // Sort items by rating
      rankedFoodItems = sortItemsByRating(items);
      sortedItems = [...rankedFoodItems];

      // Generate category insights
      generateCategoryInsights(items);

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

  // Generate insights based on categories
  function generateCategoryInsights(items) {
    if (!items || items.length === 0) return;

    // Initialize category insights object
    categoryInsights = {
      topCuisines: [],
      topTypes: [],
      dietaryPreferences: [],
      favoriteIngredients: [],
      preferredCookingMethods: []
    };

    // Count occurrences of each category in top 50% of items
    const topHalf = items.slice(0, Math.ceil(items.length / 2));

    // Count cuisines
    const cuisineCounts = {};
    topHalf.forEach(item => {
      if (item.categories && item.categories.cuisine) {
        cuisineCounts[item.categories.cuisine] = (cuisineCounts[item.categories.cuisine] || 0) + 1;
      }
    });

    // Count types
    const typeCounts = {};
    topHalf.forEach(item => {
      if (item.categories && item.categories.type) {
        typeCounts[item.categories.type] = (typeCounts[item.categories.type] || 0) + 1;
      }
    });

    // Count dietary preferences
    const dietaryCounts = {};
    topHalf.forEach(item => {
      if (item.categories && item.categories.dietary) {
        const dietaryItems = Array.isArray(item.categories.dietary)
          ? item.categories.dietary
          : [item.categories.dietary];

        dietaryItems.forEach(diet => {
          dietaryCounts[diet] = (dietaryCounts[diet] || 0) + 1;
        });
      }
    });

    // Count ingredients
    const ingredientCounts = {};
    topHalf.forEach(item => {
      if (item.categories && item.categories.ingredient) {
        const ingredients = Array.isArray(item.categories.ingredient)
          ? item.categories.ingredient
          : [item.categories.ingredient];

        ingredients.forEach(ingredient => {
          ingredientCounts[ingredient] = (ingredientCounts[ingredient] || 0) + 1;
        });
      }
    });

    // Count cooking methods
    const cookingMethodCounts = {};
    topHalf.forEach(item => {
      if (item.categories && item.categories.cookingMethod) {
        cookingMethodCounts[item.categories.cookingMethod] = (cookingMethodCounts[item.categories.cookingMethod] || 0) + 1;
      }
    });

    // Sort and get top categories
    categoryInsights.topCuisines = sortAndLimitCounts(cuisineCounts, 3);
    categoryInsights.topTypes = sortAndLimitCounts(typeCounts, 3);
    categoryInsights.dietaryPreferences = sortAndLimitCounts(dietaryCounts, 3);
    categoryInsights.favoriteIngredients = sortAndLimitCounts(ingredientCounts, 3);
    categoryInsights.preferredCookingMethods = sortAndLimitCounts(cookingMethodCounts, 3);
  }

  // Helper function to sort counts and limit to top N
  function sortAndLimitCounts(countsObj: Record<string, number>, limit: number): CategoryInsight[] {
    return Object.entries(countsObj)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([category, count]) => ({
        category,
        count,
        percentage: Math.round((count / sortedItems.length) * 100)
      }));
  }

  function toggleCategoryInsights() {
    showCategoryInsights = !showCategoryInsights;
  }

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

<ToastContainer position="top-right" />

<Container size="xl" className="results-container">
  <header>
    {#if isSharedResult}
      <Heading level={1} size="3xl">Shared Food Preference Ranking</Heading>
      <Text size="lg" color="muted">Someone shared their food preferences with you</Text>
    {:else}
      <Heading level={1} size="3xl">Your Food Preference Ranking</Heading>
      <Text size="lg" color="muted">Based on your comparisons, here's how you ranked these foods</Text>
    {/if}

    <div class="results-meta">
      <Badge
        variant={confidenceScore > 0.7 ? "success" : confidenceScore > 0.4 ? "warning" : "default"}
        className="confidence-badge"
      >
        Confidence: {Math.round(confidenceScore * 100)}%
      </Badge>

      <Button
        variant="outline"
        size="sm"
        className="insights-button"
        on:click={toggleCategoryInsights}
      >
        {showCategoryInsights ? 'Hide Insights' : 'Show Category Insights'}
      </Button>
    </div>
  </header>

  <Card
    className="results-summary"
    variant="elevated"
    shadow="lg"
    rounded="xl"
  >
    <CardContent>
      {#if isSharedResult}
        <Text size="md">This is a shared ranking of {rankedFoodItems.length} food items.</Text>
        <Text size="lg" weight="bold">Their top choice was <span class="highlight">{rankedFoodItems[0]?.name}</span>!</Text>
      {:else}
        <Text size="md">You completed {rankedFoodItems.length} food item comparisons.</Text>
        <Text size="lg" weight="bold">Your top choice was <span class="highlight">{rankedFoodItems[0]?.name}</span>!</Text>
      {/if}
    </CardContent>
  </Card>

  {#if showCategoryInsights}
    <div class="category-insights">
      <Card className="insights-card">
        <CardContent>
          <Heading level={2} size="xl" className="insights-title">Category Insights</Heading>

          <div class="insights-grid">
            <!-- Top Cuisines -->
            {#if categoryInsights.topCuisines && categoryInsights.topCuisines.length > 0}
              <div class="insight-group">
                <Heading level={3} size="lg" className="insight-heading">Top Cuisines</Heading>
                <div class="insight-items">
                  {#each categoryInsights.topCuisines as item}
                    <div class="insight-item">
                      <div
                        class="category-indicator"
                        style="background-color: {getCategoryColor(item.category)}"
                      ></div>
                      <Text className="category-name">{item.category}</Text>
                      <div class="category-bar-container">
                        <div
                          class="category-bar"
                          style="width: {Math.min(100, item.percentage * 2)}%; background-color: {getCategoryColor(item.category)}"
                        ></div>
                      </div>
                      <Text className="category-percentage">{item.percentage}%</Text>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}

            <!-- Top Types -->
            {#if categoryInsights.topTypes && categoryInsights.topTypes.length > 0}
              <div class="insight-group">
                <Heading level={3} size="lg" className="insight-heading">Meal Types</Heading>
                <div class="insight-items">
                  {#each categoryInsights.topTypes as item}
                    <div class="insight-item">
                      <div
                        class="category-indicator"
                        style="background-color: {getCategoryColor(item.category)}"
                      ></div>
                      <Text className="category-name">{item.category}</Text>
                      <div class="category-bar-container">
                        <div
                          class="category-bar"
                          style="width: {Math.min(100, item.percentage * 2)}%; background-color: {getCategoryColor(item.category)}"
                        ></div>
                      </div>
                      <Text className="category-percentage">{item.percentage}%</Text>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}

            <!-- Dietary Preferences -->
            {#if categoryInsights.dietaryPreferences && categoryInsights.dietaryPreferences.length > 0}
              <div class="insight-group">
                <Heading level={3} size="lg" className="insight-heading">Dietary Preferences</Heading>
                <div class="insight-items">
                  {#each categoryInsights.dietaryPreferences as item}
                    <div class="insight-item">
                      <div
                        class="category-indicator"
                        style="background-color: {getCategoryColor(item.category)}"
                      ></div>
                      <Text className="category-name">{item.category}</Text>
                      <div class="category-bar-container">
                        <div
                          class="category-bar"
                          style="width: {Math.min(100, item.percentage * 2)}%; background-color: {getCategoryColor(item.category)}"
                        ></div>
                      </div>
                      <Text className="category-percentage">{item.percentage}%</Text>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}

            <!-- Favorite Ingredients -->
            {#if categoryInsights.favoriteIngredients && categoryInsights.favoriteIngredients.length > 0}
              <div class="insight-group">
                <Heading level={3} size="lg" className="insight-heading">Favorite Ingredients</Heading>
                <div class="insight-items">
                  {#each categoryInsights.favoriteIngredients as item}
                    <div class="insight-item">
                      <div
                        class="category-indicator"
                        style="background-color: {getCategoryColor(item.category)}"
                      ></div>
                      <Text className="category-name">{item.category}</Text>
                      <div class="category-bar-container">
                        <div
                          class="category-bar"
                          style="width: {Math.min(100, item.percentage * 2)}%; background-color: {getCategoryColor(item.category)}"
                        ></div>
                      </div>
                      <Text className="category-percentage">{item.percentage}%</Text>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}

            <!-- Preferred Cooking Methods -->
            {#if categoryInsights.preferredCookingMethods && categoryInsights.preferredCookingMethods.length > 0}
              <div class="insight-group">
                <Heading level={3} size="lg" className="insight-heading">Cooking Methods</Heading>
                <div class="insight-items">
                  {#each categoryInsights.preferredCookingMethods as item}
                    <div class="insight-item">
                      <div
                        class="category-indicator"
                        style="background-color: {getCategoryColor(item.category)}"
                      ></div>
                      <Text className="category-name">{item.category}</Text>
                      <div class="category-bar-container">
                        <div
                          class="category-bar"
                          style="width: {Math.min(100, item.percentage * 2)}%; background-color: {getCategoryColor(item.category)}"
                        ></div>
                      </div>
                      <Text className="category-percentage">{item.percentage}%</Text>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}
          </div>
        </CardContent>
      </Card>
    </div>
  {/if}

  <div class="ranked-list">
    {#each rankedFoodItems as food, index}
      <Card
        className="ranked-item"
        variant="elevated"
        shadow="md"
        rounded="lg"
        hover={true}
      >
        <CardContent>
          <div class="ranked-item-content">
            <Badge
              variant={index < 3 ? "primary" : "secondary"}
              className="rank"
            >
              {index + 1}
            </Badge>

            <div class="food-image">
              {#if food.categories && food.categories.cuisine}
                <Badge
                  variant="outline"
                  className="category-tag"
                  style="background-color: {getCategoryColor(food.categories.cuisine)}"
                >
                  {food.categories.cuisine}
                </Badge>
              {/if}
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
              <Heading level={3} size="lg">{food.name}</Heading>
              <Text size="sm" color="muted">{food.description}</Text>
            </div>

            <div class="rating">
              <Text size="xl" weight="bold" className="rating-value">{Math.round(food.rating)}</Text>
              <Text size="xs" color="muted" className="rating-label">Elo rating</Text>
            </div>
          </div>
        </CardContent>
      </Card>
    {/each}
  </div>

  <div class="actions">
    <Button
      variant="primary"
      size="lg"
      on:click={restartRanking}
    >
      {isSharedResult ? 'Start Your Own Ranking' : 'Restart Ranking'}
    </Button>

    <Button
      variant="secondary"
      size="lg"
      on:click={exportRankings}
    >
      Export Results
    </Button>

    {#if !isSharedResult}
      <Button
        variant="accent"
        size="lg"
        on:click={() => {
          generateShareableLink();
          ToastService.success({
            title: "Link Generated",
            message: "Share link has been created!",
            duration: 3000
          });
        }}
      >
        Share Results
      </Button>
    {/if}
  </div>

  {#if shareUrl}
    <Card
      className="share-container"
      variant="elevated"
      shadow="lg"
      rounded="xl"
    >
      <CardContent>
        <Heading level={3} size="xl">Share Your Results</Heading>
        <Text size="md" className="share-text">Share your food preferences with friends and family</Text>

        <div class="share-url-container">
          <input type="text" readonly value={shareUrl} class="share-url" id="share-url-input" />
          <Button
            variant="primary"
            size="md"
            className="copy-button"
            on:click={() => {
              copyShareUrl();
              ToastService.success({
                title: "Link Copied",
                message: "Share link copied to clipboard!",
                duration: 2000
              });
            }}
          >
            {copySuccess ? 'Copied!' : 'Copy'}
          </Button>
        </div>

        <div class="share-social">
          <Button
            variant="outline"
            size="md"
            className="social-button twitter"
            href={`https://twitter.com/intent/tweet?text=Check%20out%20my%20food%20preferences!&url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Share on Twitter
          </Button>

          <Button
            variant="outline"
            size="md"
            className="social-button facebook"
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Share on Facebook
          </Button>
        </div>
      </CardContent>
    </Card>
  {/if}
</Container>

<style>
  .results-meta {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-4);
    margin: var(--space-4) 0 var(--space-8);
    flex-wrap: wrap;
  }

  :global(.confidence-badge) {
    font-size: var(--font-size-sm);
    padding: var(--space-1) var(--space-3);
  }

  :global(.insights-button) {
    font-size: var(--font-size-sm);
  }

  .category-insights {
    margin-bottom: 2rem;
  }

  :global(.insights-card) {
    background: linear-gradient(to bottom, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.7));
    border: 1px solid rgba(99, 102, 241, 0.2);
  }

  :global(.insights-title) {
    text-align: center;
    margin-bottom: 1.5rem !important;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    position: relative;
  }

  :global(.insights-title)::after {
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

  .insights-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .insight-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  :global(.insight-heading) {
    font-size: 1.25rem !important;
    margin-bottom: 0.5rem !important;
    color: var(--primary-color);
  }

  .insight-items {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .insight-item {
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    align-items: center;
    gap: 0.75rem;
  }

  .category-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }

  :global(.category-name) {
    font-size: 0.9rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .category-bar-container {
    height: 8px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
  }

  .category-bar {
    height: 100%;
    border-radius: 4px;
    transition: width 1s ease-out;
  }

  :global(.category-percentage) {
    font-size: 0.9rem;
    font-weight: 500;
    min-width: 40px;
    text-align: right;
  }

  .category-tag {
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.7rem;
    color: white;
    font-weight: 600;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    z-index: 10;
  }

  @media (min-width: 768px) {
    .insights-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 1200px) {
    .insights-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  :global(.results-container) {
    max-width: 1000px;
    margin: 0 auto;
    padding: var(--space-8);
  }

  header {
    text-align: center;
    margin-bottom: var(--space-8);
  }

  :global(.results-summary) {
    text-align: center;
    margin-bottom: var(--space-8);
  }

  /* Category insights styling */
  .category-insights {
    margin-bottom: var(--space-8);
  }

  .ranked-list {
    margin-bottom: var(--space-12);
  }

  .ranked-item-content {
    display: flex;
    align-items: center;
    width: 100%;
  }

  @media (max-width: 768px) {
    .ranked-item-content {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  :global(.rank) {
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    border-radius: 50%;
    margin-right: var(--space-4);
  }

  .food-image {
    position: relative;
    width: 80px;
    height: 80px;
    border-radius: var(--radius-md);
    overflow: hidden;
    margin-right: var(--space-4);
  }

  .food-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .food-info {
    flex-grow: 1;
    overflow: hidden;
  }

  .rating {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-left: var(--space-4);
    min-width: 70px;
  }

  :global(.rating-value) {
    color: var(--color-primary);
  }

  :global(.rating-label) {
    color: var(--color-muted);
  }

  .highlight {
    color: var(--color-primary);
    font-weight: var(--font-weight-bold);
  }

  .actions {
    display: flex;
    justify-content: center;
    gap: var(--space-4);
    margin-bottom: var(--space-8);
  }

  .share-text {
    margin-bottom: var(--space-4);
  }

  .share-url-container {
    display: flex;
    justify-content: center;
    margin: var(--space-4) 0;
  }

  .share-url {
    flex-grow: 1;
    max-width: 500px;
    padding: var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm) 0 0 var(--radius-sm);
    font-size: var(--font-size-sm);
    background-color: var(--color-background-alt);
  }

  :global(.copy-button) {
    border-radius: 0 var(--radius-sm) var(--radius-sm) 0 !important;
  }

  .share-social {
    display: flex;
    justify-content: center;
    gap: var(--space-4);
    margin-top: var(--space-4);
  }

  :global(.social-button.twitter) {
    color: #1DA1F2;
    border-color: #1DA1F2;
  }

  :global(.social-button.facebook) {
    color: #4267B2;
    border-color: #4267B2;
  }

  @media (max-width: 768px) {
    :global(.rank) {
      align-self: center;
      margin-bottom: var(--space-4);
    }

    .food-image {
      align-self: center;
      width: 100px;
      height: 100px;
      margin-bottom: var(--space-4);
      margin-right: 0;
    }

    .food-info {
      margin-bottom: var(--space-4);
      text-align: center;
      width: 100%;
    }

    .rating {
      align-self: center;
      margin: 0;
    }

    .actions {
      flex-direction: column;
      gap: var(--space-2);
    }

    .share-url-container {
      flex-direction: column;
    }

    .share-url {
      width: 100%;
      max-width: none;
      margin-bottom: var(--space-2);
      border-radius: var(--radius-sm);
    }

    :global(.copy-button) {
      width: 100%;
      border-radius: var(--radius-sm) !important;
    }

    .share-social {
      flex-direction: column;
      gap: var(--space-2);
    }
  }

  /* Additional responsive adjustments */
  @media (min-width: 769px) and (max-width: 1024px) {
    .actions {
      flex-wrap: wrap;
    }
  }
</style>
