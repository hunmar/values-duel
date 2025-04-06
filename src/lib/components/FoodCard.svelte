<script lang="ts">
  import { Badge } from '../ui';
  import { getCategoryColor, FOOD_CATEGORIES } from '../stores/foodItems.js';

  interface Category {
    cuisine?: string;
    type?: string;
    dietary?: string | string[];
    ingredient?: string | string[];
    cookingMethod?: string;
  }

  interface FoodItem {
    id: number;
    name: string;
    description: string;
    imageUrl: string;
    fallbackImageUrl?: string;
    rating: number;
    categories?: Category;
  }

  export let food: FoodItem = {} as FoodItem;
  export let onClick: (food: FoodItem) => void = () => {};
  export let selected = false;
  export let keyboardAccessible = false;
  export let showCategories = true;

  // Handle keyboard interaction and click for better accessibility
  function handleInteraction() {
    if (!selected) {
      onClick(food);
    }
  }

  // Helper function to get primary category for display
  function getPrimaryCategory() {
    if (!food.categories) return null;

    // Priority order: cuisine, type, dietary, cookingMethod
    if (food.categories.cuisine) {
      return {
        name: food.categories.cuisine,
        color: getCategoryColor(food.categories.cuisine)
      };
    } else if (food.categories.type) {
      return {
        name: food.categories.type,
        color: getCategoryColor(food.categories.type)
      };
    } else if (food.categories.dietary && Array.isArray(food.categories.dietary) && food.categories.dietary.length > 0) {
      return {
        name: food.categories.dietary[0],
        color: getCategoryColor(food.categories.dietary[0])
      };
    } else if (food.categories.dietary && !Array.isArray(food.categories.dietary)) {
      return {
        name: food.categories.dietary,
        color: getCategoryColor(food.categories.dietary)
      };
    } else if (food.categories.cookingMethod) {
      return {
        name: food.categories.cookingMethod,
        color: getCategoryColor(food.categories.cookingMethod)
      };
    }

    return null;
  }

  // Get all categories for display
  function getAllCategories() {
    if (!food.categories) return [];

    const categories = [];

    // Add cuisine
    if (food.categories.cuisine) {
      categories.push({
        name: food.categories.cuisine,
        color: getCategoryColor(food.categories.cuisine),
        type: 'cuisine'
      });
    }

    // Add type
    if (food.categories.type) {
      categories.push({
        name: food.categories.type,
        color: getCategoryColor(food.categories.type),
        type: 'type'
      });
    }

    // Add dietary restrictions
    if (food.categories.dietary) {
      const dietaryItems = Array.isArray(food.categories.dietary)
        ? food.categories.dietary
        : [food.categories.dietary];

      dietaryItems.forEach(item => {
        categories.push({
          name: item,
          color: getCategoryColor(item),
          type: 'dietary'
        });
      });
    }

    // Add cooking method
    if (food.categories.cookingMethod) {
      categories.push({
        name: food.categories.cookingMethod,
        color: getCategoryColor(food.categories.cookingMethod),
        type: 'cooking'
      });
    }

    return categories;
  }

  const primaryCategory = getPrimaryCategory();
  const allCategories = getAllCategories();
</script>

<div
  class="food-card {selected ? 'selected' : ''} {keyboardAccessible ? 'keyboard-accessible' : ''}"
  on:click={handleInteraction}
  on:keydown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleInteraction();
      e.preventDefault();
    }
  }}
  tabindex="0"
  role="button"
  aria-pressed={selected}
  aria-label="Choose {food.name}"
>
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

    {#if showCategories && food.categories}
      <div class="category-indicators">
        {#if primaryCategory}
          <div class="primary-category" style="background-color: {primaryCategory.color}">
            {primaryCategory.name}
          </div>
        {/if}

        <div class="category-badges">
          {#each allCategories as category, i}
            {#if i < 3} <!-- Limit to 3 badges to avoid overcrowding -->
              <Badge
                variant="outline"
                className="category-badge"
                style="border-color: {category.color}; color: {category.color};"
              >
                {category.name}
              </Badge>
            {/if}
          {/each}

          {#if allCategories.length > 3}
            <Badge variant="outline" className="more-badge">+{allCategories.length - 3}</Badge>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .food-card {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 320px;
    height: 400px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: var(--shadow-md);
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    cursor: pointer;
    background-color: var(--card-bg);
    color: var(--text-color);
    border: 1px solid var(--card-border);
    position: relative;
    isolation: isolate;
    background: linear-gradient(to bottom, #1e293b, #111827);
  }

  .food-card::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 12px;
    background: linear-gradient(to bottom,
      rgba(255, 255, 255, 0.03),
      rgba(255, 255, 255, 0.03) 30%,
      transparent);
    z-index: -1;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .food-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-lg);
    border-color: var(--card-hover-border);
  }

  .food-card:hover::before {
    opacity: 1;
  }

  .food-card.selected {
    transform: translateY(-10px) scale(1.02);
    box-shadow: var(--shadow-xl), 0 0 0 2px var(--card-selected-border);
    border: 2px solid var(--card-selected-border);
  }

  .food-image {
    height: 220px;
    overflow: hidden;
    position: relative;
  }

  .food-image::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: linear-gradient(to top, rgba(15, 23, 42, 0.8), transparent);
    z-index: 1;
  }

  .food-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .food-card:hover .food-image img {
    transform: scale(1.08);
  }

  .food-info {
    padding: 20px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    position: relative;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }

  h3 {
    margin: 0 0 10px 0;
    font-size: 1.5rem;
    color: white; /* Pure white for maximum contrast */
    font-weight: 600;
    letter-spacing: -0.01em;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3); /* Add subtle shadow for better readability */
  }

  p {
    margin: 0;
    font-size: 0.95rem;
    color: var(--muted-color);
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    opacity: 0.95; /* Ensure good contrast */
  }

  /* Focus styles for accessibility */
  .food-card:focus {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring), var(--shadow-md);
    border-color: var(--secondary-color);
  }

  .food-card.keyboard-accessible:focus {
    transform: translateY(-10px);
    box-shadow: var(--shadow-lg), 0 0 0 3px var(--focus-ring);
  }

  /* Add a visual indicator for keyboard access */
  .food-card.keyboard-accessible:focus::after {
    content: "";
    position: absolute;
    top: -8px;
    right: -8px;
    width: 32px;
    height: 32px;
    background-color: var(--secondary-color);
    border-radius: 50%;
    animation: pulse 1.5s infinite;
    z-index: 10;
    box-shadow: var(--shadow-md);
  }

  @keyframes pulse {
    0% { transform: scale(0.95); opacity: 0.8; }
    50% { transform: scale(1.05); opacity: 1; }
    100% { transform: scale(0.95); opacity: 0.8; }
  }

  /* Add subtle highlight effect on card selection */
  .food-card.selected::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
    z-index: 5;
  }
  /* Category styling */
  .category-indicators {
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .primary-category {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    color: white;
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
    align-self: flex-start;
  }

  .category-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  :global(.category-badge) {
    font-size: 0.7rem !important;
    padding: 2px 6px !important;
    height: auto !important;
    font-weight: 500 !important;
  }

  :global(.more-badge) {
    font-size: 0.7rem !important;
    padding: 2px 6px !important;
    height: auto !important;
    background-color: rgba(255, 255, 255, 0.1);
  }
</style>
