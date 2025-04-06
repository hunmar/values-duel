<script lang="ts">
  import { Card, CardContent, CardHeader, Heading, Text, Badge } from '../ui';
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
  class="food-card-wrapper {selected ? 'selected' : ''} {keyboardAccessible ? 'keyboard-accessible' : ''}"
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
  <Card
    variant={selected ? "selected" : "elevated"}
    hoverable={!selected}
    shadow={selected ? "xl" : "lg"}
    rounded="xl"
    className="food-card"
  >
    <div class="food-image">
      {#if primaryCategory}
        <Badge
          variant="solid"
          className="primary-category-badge"
          style="background-color: {primaryCategory.color}"
        >
          {primaryCategory.name}
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

    <CardContent>
      <Heading level={3} size="xl" className="food-name">{food.name}</Heading>
      <Text size="sm" color="muted" className="food-description">{food.description}</Text>

      {#if showCategories && food.categories && allCategories.length > 0}
        <div class="category-badges">
          {#each allCategories.slice(0, 3) as category, i}
            <Badge
              variant="outline"
              className="category-badge"
              style="border-color: {category.color}; color: {category.color};"
              title={`${category.type}: ${category.name}`}
            >
              {category.name}
            </Badge>
          {/each}

          {#if allCategories.length > 3}
            <Badge
              variant="outline"
              className="more-badge"
              title="More categories"
            >
              +{allCategories.length - 3}
            </Badge>
          {/if}
        </div>
      {/if}
    </CardContent>
  </Card>
</div>

<style>
  .food-card-wrapper {
    width: 100%;
    max-width: 320px;
    height: 400px;
    position: relative;
    cursor: pointer;
    transition: all var(--transition-normal) var(--ease-in-out);
    perspective: 1000px;
  }

  :global(.food-card) {
    height: 100%;
    display: flex;
    flex-direction: column;
    transform-style: preserve-3d;
    backface-visibility: hidden;
  }

  .food-card-wrapper.selected {
    transform: translateY(calc(-1 * var(--space-2))) scale(1.02);
    z-index: 10;
  }

  .food-card-wrapper.selected :global(.card) {
    border-color: var(--primary-500);
    box-shadow: var(--shadow-xl), 0 0 20px rgba(var(--primary-rgb), 0.3);
  }

  .food-card-wrapper.selected::after {
    content: "✓";
    position: absolute;
    top: -15px;
    right: -15px;
    width: 36px;
    height: 36px;
    background-color: var(--primary-500);
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    box-shadow: var(--shadow-lg);
    z-index: 50;
  }

  .food-image {
    height: 220px;
    overflow: hidden;
    position: relative;
    border-top-left-radius: var(--radius-xl);
    border-top-right-radius: var(--radius-xl);
  }

  .food-image::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: linear-gradient(to top, rgba(15, 23, 42, 0.8), transparent);
    z-index: 10;
  }

  .food-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform var(--transition-slow) var(--ease-in-out);
  }

  .food-card-wrapper:hover .food-image img {
    transform: scale(1.08);
  }

  :global(.food-name) {
    margin: 0 0 var(--space-2) 0;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    font-weight: var(--font-weight-bold);
    letter-spacing: var(--letter-spacing-tight);
  }

  :global(.food-description) {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: var(--line-height-snug);
    color: var(--gray-300);
  }

  /* Focus styles for accessibility */
  .food-card-wrapper:focus {
    outline: none;
  }

  .food-card-wrapper:focus :global(.card) {
    box-shadow: 0 0 0 3px var(--focus-ring), var(--shadow-md);
    border-color: var(--secondary-500);
  }

  .food-card-wrapper.keyboard-accessible:focus {
    transform: translateY(calc(-1 * var(--space-2)));
  }

  .food-card-wrapper.keyboard-accessible:focus :global(.card) {
    box-shadow: var(--shadow-lg), 0 0 0 3px var(--focus-ring);
  }

  /* Add a visual indicator for keyboard access */
  .food-card-wrapper.keyboard-accessible:focus::before {
    content: "";
    position: absolute;
    top: -8px;
    right: -8px;
    width: 32px;
    height: 32px;
    background-color: var(--secondary-500);
    border-radius: var(--radius-full);
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
  .food-card-wrapper.selected :global(.card)::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--primary-500), var(--secondary-500));
    z-index: 5;
    border-top-left-radius: var(--radius-xl);
    border-top-right-radius: var(--radius-xl);
  }

  /* Category styling */
  :global(.primary-category-badge) {
    position: absolute;
    top: var(--space-2);
    right: var(--space-2);
    font-size: var(--font-size-xs) !important;
    padding: var(--space-1) var(--space-2) !important;
    font-weight: var(--font-weight-semibold) !important;
    color: white !important;
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
    z-index: 20;
    box-shadow: var(--shadow-sm);
  }

  .category-badges {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
    margin-top: var(--space-4);
  }

  :global(.category-badge) {
    font-size: var(--font-size-2xs) !important;
    padding: 2px var(--space-1-5) !important;
    height: auto !important;
    font-weight: var(--font-weight-medium) !important;
    transition: all var(--transition-fast) var(--ease-in-out);
  }

  :global(.category-badge:hover) {
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
  }

  :global(.more-badge) {
    font-size: var(--font-size-2xs) !important;
    padding: 2px var(--space-1-5) !important;
    height: auto !important;
    background-color: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2) !important;
    color: var(--gray-300) !important;
  }
</style>
