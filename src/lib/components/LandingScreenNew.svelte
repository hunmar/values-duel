<script lang="ts">
  import { onMount } from 'svelte';
  import { APP_STATES } from '../stores/appState.js';
  import appState from '../stores/appState.js';
  import foodItems from '../stores/foodItems.js';
  import { FOOD_CATEGORIES, getCategoryColor, addCustomCategory } from '../stores/foodItems.js';
  import { calculateMinComparisons, updateRatings, calculateConfidence } from '../utils/eloRating.js';
  import { Container, Heading, Text, Button, Card, CardContent, Badge, Dialog, Switch } from '../ui';
  import CategoryCreator from './CategoryCreator.svelte';

  let foodList = [];
  let filteredFoodList = [];
  let importError: string | null = null;
  let showFormatInfo = false;
  let showCategoryFilters = false;
  let showCategoryCreator = false;
  let selectedCategories = {
    cuisine: [],
    type: [],
    dietary: [],
    ingredient: [],
    cookingMethod: []
  };

  onMount(() => {
    // Subscribe to the foodItems store
    const unsubscribeFoodItems = foodItems.subscribe(items => {
      foodList = items;
      applyFilters(); // Apply any active filters
    });

    // Subscribe to app state to get selected categories
    const unsubscribeAppState = appState.subscribe(state => {
      showCategoryFilters = state.showCategoryFilters;
      selectedCategories = state.selectedCategories;
      applyFilters(); // Apply any active filters when they change
    });

    // Cleanup subscriptions on component unmount
    return () => {
      unsubscribeFoodItems();
      unsubscribeAppState();
    };
  });

  // Function to apply category filters to the food list
  function applyFilters() {
    if (!foodList || foodList.length === 0) {
      filteredFoodList = [];
      return;
    }

    // Check if any filters are active
    const hasActiveFilters = Object.values(selectedCategories).some(
      categoryArray => categoryArray && categoryArray.length > 0
    );

    if (!hasActiveFilters) {
      // No active filters, show all items
      filteredFoodList = [...foodList];
      return;
    }

    // Apply filters
    filteredFoodList = foodList.filter(food => {
      if (!food.categories) return false;

      // Check each category type
      for (const [categoryType, selectedValues] of Object.entries(selectedCategories)) {
        if (!selectedValues || selectedValues.length === 0) continue;

        // Get the food's value for this category type
        const foodCategoryValue = food.categories[categoryType];

        // Skip if the food doesn't have this category type
        if (!foodCategoryValue) continue;

        // Check if any selected value matches
        const hasMatch = Array.isArray(foodCategoryValue)
          ? foodCategoryValue.some(value => selectedValues.includes(value))
          : selectedValues.includes(foodCategoryValue);

        // If no match for this category type, filter out the item
        if (!hasMatch) return false;
      }

      // If we get here, all category filters have been satisfied
      return true;
    });
  }

  // Toggle a category filter
  function toggleCategory(categoryType, value) {
    // Update local state
    if (selectedCategories[categoryType].includes(value)) {
      selectedCategories[categoryType] = selectedCategories[categoryType].filter(v => v !== value);
    } else {
      selectedCategories[categoryType] = [...selectedCategories[categoryType], value];
    }

    // Update app state
    appState.update(state => ({
      ...state,
      selectedCategories: {
        ...state.selectedCategories,
        [categoryType]: selectedCategories[categoryType]
      }
    }));

    // Apply the updated filters
    applyFilters();
  }

  // Toggle category filters visibility
  function toggleCategoryFilters() {
    showCategoryFilters = !showCategoryFilters;

    // Update app state
    appState.update(state => ({
      ...state,
      showCategoryFilters
    }));
  }

  // Clear all filters
  function clearFilters() {
    selectedCategories = {
      cuisine: [],
      type: [],
      dietary: [],
      ingredient: [],
      cookingMethod: []
    };

    // Update app state
    appState.update(state => ({
      ...state,
      selectedCategories: {
        cuisine: [],
        type: [],
        dietary: [],
        ingredient: [],
        cookingMethod: []
      }
    }));

    // Apply the updated filters
    applyFilters();
  }

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
      comparisonHistory: [],
      // Pass along any active category filters
      selectedCategories: {...selectedCategories}
    }));
  }

  function handleFileImport(event: Event) {
    importError = null;
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) return;

    if (file.type !== 'application/json') {
      importError = 'Please select a valid JSON file.';
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        // Parse the JSON file
        const result = e.target?.result as string;
        const importedData = JSON.parse(result);

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

        // Check for custom categories in the imported data
        const customCategories = new Set();
        importedData.forEach(item => {
          if (item.categories) {
            // Check each category type
            Object.entries(item.categories).forEach(([categoryType, value]) => {
              // Handle both single values and arrays
              const values = Array.isArray(value) ? value : [value];

              values.forEach(categoryValue => {
                // Skip null or undefined values
                if (!categoryValue) return;

                // Check if this is a custom category (not in our predefined list)
                const categoryTypeUpper = categoryType.toUpperCase();
                if (
                  FOOD_CATEGORIES[categoryTypeUpper] &&
                  !Object.values(FOOD_CATEGORIES[categoryTypeUpper]).includes(categoryValue)
                ) {
                  customCategories.add({ type: categoryType, value: categoryValue });
                }
              });
            });
          }
        });

        // Add any custom categories found
        if (customCategories.size > 0) {
          customCategories.forEach(({ type, value }) => {
            addCustomCategory(type, value);
          });

          // Show notification about custom categories
          alert(`Added ${customCategories.size} custom categories from imported data.`);
        }

        // Set the imported data
        foodItems.set(importedData);

        // Reset the file input
        target.value = '';

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

  // Handle adding a custom category
  function handleAddCategory(categoryType, categoryName) {
    const success = addCustomCategory(categoryType, categoryName);
    if (success) {
      // Refresh the UI
      foodItems.update(items => [...items]);
    }
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
  </header>

  <div class="grid-layout">
    <section class="food-preview">
      <div class="section-heading">
        <Heading level={2} size="h3">Food Collection</Heading>
        <div class="badge-container">
          <Badge variant="secondary">{filteredFoodList.length} of {foodList.length} items</Badge>
          <Button
            variant="ghost"
            className="filter-toggle-button"
            on:click={toggleCategoryFilters}
          >
            <span class="filter-icon">🔍</span>
            {showCategoryFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>
      </div>

      {#if showCategoryFilters}
        <Card className="filters-card">
          <CardContent>
            <div class="filters-header">
              <Heading level={3} size="h4">Filter by Category</Heading>
              <Button variant="ghost" size="sm" on:click={clearFilters}>Clear All</Button>
            </div>

            <div class="filters-grid">
              <!-- Cuisine Filters -->
              <div class="filter-group">
                <Text weight="semibold" className="filter-group-title">Cuisine</Text>
                <div class="filter-options">
                  {#each Object.values(FOOD_CATEGORIES.CUISINE) as cuisine}
                    <div
                      class="filter-chip"
                      class:active={selectedCategories.cuisine.includes(cuisine)}
                      style="--chip-color: {getCategoryColor(cuisine)}"
                      on:click={() => toggleCategory('cuisine', cuisine)}
                    >
                      {cuisine}
                    </div>
                  {/each}
                </div>
              </div>

              <!-- Type Filters -->
              <div class="filter-group">
                <Text weight="semibold" className="filter-group-title">Type</Text>
                <div class="filter-options">
                  {#each Object.values(FOOD_CATEGORIES.TYPE) as type}
                    <div
                      class="filter-chip"
                      class:active={selectedCategories.type.includes(type)}
                      style="--chip-color: {getCategoryColor(type)}"
                      on:click={() => toggleCategory('type', type)}
                    >
                      {type}
                    </div>
                  {/each}
                </div>
              </div>

              <!-- Dietary Filters -->
              <div class="filter-group">
                <Text weight="semibold" className="filter-group-title">Dietary</Text>
                <div class="filter-options">
                  {#each Object.values(FOOD_CATEGORIES.DIETARY) as dietary}
                    <div
                      class="filter-chip"
                      class:active={selectedCategories.dietary.includes(dietary)}
                      style="--chip-color: {getCategoryColor(dietary)}"
                      on:click={() => toggleCategory('dietary', dietary)}
                    >
                      {dietary}
                    </div>
                  {/each}
                </div>
              </div>

              <!-- Ingredient Filters -->
              <div class="filter-group">
                <Text weight="semibold" className="filter-group-title">Main Ingredient</Text>
                <div class="filter-options">
                  {#each Object.values(FOOD_CATEGORIES.INGREDIENT) as ingredient}
                    <div
                      class="filter-chip"
                      class:active={selectedCategories.ingredient.includes(ingredient)}
                      style="--chip-color: {getCategoryColor(ingredient)}"
                      on:click={() => toggleCategory('ingredient', ingredient)}
                    >
                      {ingredient}
                    </div>
                  {/each}
                </div>
              </div>

              <!-- Cooking Method Filters -->
              <div class="filter-group">
                <Text weight="semibold" className="filter-group-title">Cooking Method</Text>
                <div class="filter-options">
                  {#each Object.values(FOOD_CATEGORIES.COOKING_METHOD) as method}
                    <div
                      class="filter-chip"
                      class:active={selectedCategories.cookingMethod.includes(method)}
                      style="--chip-color: {getCategoryColor(method)}"
                      on:click={() => toggleCategory('cookingMethod', method)}
                    >
                      {method}
                    </div>
                  {/each}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      {/if}

      <div class="food-grid">
        {#if filteredFoodList.length === 0}
          <div class="no-results">
            <Text>No food items match your selected filters.</Text>
            <Button variant="ghost" on:click={clearFilters}>Clear Filters</Button>
          </div>
        {:else}
          {#each filteredFoodList as food}
            <Card className="food-preview-card">
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
                {#if food.categories && food.categories.cuisine}
                  <div class="category-tag" style="background-color: {getCategoryColor(food.categories.cuisine)}">
                    {food.categories.cuisine}
                  </div>
                {/if}
              </div>
              <CardContent className="food-name-container">
                <Text className="food-name">{food.name}</Text>
              </CardContent>
            </Card>
          {/each}
        {/if}
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
      <Dialog open={showCategoryCreator} onOpenChange={(open) => showCategoryCreator = open}>
        <CategoryCreator
          onAddCategory={handleAddCategory}
          onClose={() => showCategoryCreator = false}
        />
      </Dialog>
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
          <div class="import-header">
            <Heading level={3} size="h4">Import & Customize</Heading>
            <Button
              variant="outline"
              size="sm"
              className="create-category-button"
              on:click={() => showCategoryCreator = true}
            >
              Create Custom Category
            </Button>
          </div>
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

  <Dialog
    open={showFormatInfo}
    title="Required JSON Format"
    on:close={() => showFormatInfo = false}
    size="md"
    className="format-dialog"
  >
    <Card className="format-card">
      <CardContent>
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
      </CardContent>
    </Card>
  </Dialog>
</Container>

<style>
  /* Use :global for class that is applied via className prop */
  :global(.landing-container) {
    padding-top: 3rem;
    padding-bottom: 3rem;
    position: relative;
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

  /* Category filter styles */
  .badge-container {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  :global(.filter-toggle-button) {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    padding: 0.25rem 0.75rem;
  }

  .filter-icon {
    font-size: 1rem;
  }

  :global(.filters-card) {
    margin-bottom: 1.5rem;
  }

  .filters-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .filters-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  :global(.filter-group-title) {
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
  }

  .filter-options {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .filter-chip {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.8rem;
    background-color: rgba(255, 255, 255, 0.1);
    border: 1px solid var(--card-border);
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;
  }

  .filter-chip:hover {
    background-color: rgba(255, 255, 255, 0.15);
    transform: translateY(-1px);
  }

  .filter-chip.active {
    background-color: var(--chip-color, var(--primary-color));
    color: white;
    border-color: transparent;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .no-results {
    grid-column: 1 / -1;
    text-align: center;
    padding: 2rem;
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    border: 1px dashed var(--card-border);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
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
  }

  @media (min-width: 768px) {
    .filters-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 1024px) {
    .filters-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  .import-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  :global(.create-category-button) {
    white-space: nowrap;
  }
</style>
