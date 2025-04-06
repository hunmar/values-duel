import { writable } from 'svelte/store';

// Initial food items data
// Function to create an inline SVG data URL for food images
export function createSVGImageData(name, fgColor = '#333333', bgColor = '#f8f8f8') {
  // Get a generic food icon path based on the food name
  const iconPath = getFoodIcon(name);

  // Create an SVG with the food name, icon, and a nice background
  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="500" height="400" viewBox="0 0 500 400">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${adjustColor(bgColor, -20)};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="500" height="400" fill="url(#grad)" rx="15" ry="15" />
      <g transform="translate(250, 160) scale(0.5)">
        ${iconPath}
      </g>
      <text x="50%" y="280" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="${fgColor}">
        ${name}
      </text>
    </svg>
  `;

  // Convert to a data URL
  const encodedSVG = encodeURIComponent(svgContent.trim());
  return `data:image/svg+xml;charset=UTF-8,${encodedSVG}`;
}

// Helper function to darken or lighten a color
function adjustColor(color, amount) {
  // Remove the # if present
  color = color.replace('#', '');

  // Parse the color components
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);

  // Adjust each component
  const newR = Math.max(0, Math.min(255, r + amount)).toString(16).padStart(2, '0');
  const newG = Math.max(0, Math.min(255, g + amount)).toString(16).padStart(2, '0');
  const newB = Math.max(0, Math.min(255, b + amount)).toString(16).padStart(2, '0');

  return `#${newR}${newG}${newB}`;
}

// Returns a simple SVG path for each food
function getFoodIcon(name) {
  const lowerName = name.toLowerCase();

  if (lowerName.includes('pizza')) {
    return '<path d="M-150,-150 L150,-150 L150,150 L-150,150 Z" fill="#f5ca99" stroke="#333" stroke-width="5"/><path d="M0,0 L100,100 M0,0 L-100,100 M0,0 L100,-100 M0,0 L-100,-100" stroke="#cc0000" stroke-width="10"/>';
  } else if (lowerName.includes('burger')) {
    return '<circle cx="0" cy="0" r="120" fill="#e2b280" stroke="#663300" stroke-width="20"/><rect x="-90" y="-30" width="180" height="60" fill="#ff6347" stroke="#333" stroke-width="2"/>';
  } else if (lowerName.includes('pasta')) {
    return '<rect x="-120" y="-100" width="240" height="200" rx="20" ry="20" fill="#fff5dd" stroke="#cc6600" stroke-width="5"/><path d="M-80,-50 Q0,50 80,-50" stroke="#cc6600" stroke-width="10" fill="none"/><path d="M-80,0 Q0,100 80,0" stroke="#cc6600" stroke-width="10" fill="none"/>';
  } else if (lowerName.includes('tacos')) {
    return '<path d="M-120,-50 C-100,100 100,100 120,-50 Z" fill="#e2b280" stroke="#663300" stroke-width="5"/><path d="M-80,-30 L-80,30 M-40,-30 L-40,30 M0,-30 L0,30 M40,-30 L40,30 M80,-30 L80,30" stroke="#c55a11" stroke-width="8"/>';
  } else if (lowerName.includes('lasagna')) {
    return '<rect x="-120" y="-80" width="240" height="160" rx="5" ry="5" fill="#9c3d25" stroke="#ffffff" stroke-width="5"/><path d="M-120,-40 L120,-40 M-120,0 L120,0 M-120,40 L120,40" stroke="#ffffff" stroke-width="5"/><circle cx="-50" cy="-60" r="10" fill="#ffcc00"/><circle cx="50" cy="-20" r="10" fill="#ffcc00"/><circle cx="0" cy="20" r="10" fill="#ffcc00"/>';
  } else if (lowerName.includes('cheesecake')) {
    return '<rect x="-120" y="-80" width="240" height="160" rx="10" ry="10" fill="#f9ecc5" stroke="#c4a146" stroke-width="5"/><rect x="-120" y="-80" width="240" height="40" fill="#c4a146" stroke="#c4a146" stroke-width="5"/><circle cx="-40" cy="0" r="10" fill="#e74c3c"/><circle cx="40" cy="0" r="10" fill="#e74c3c"/>';
  } else if (lowerName.includes('curry')) {
    return '<circle cx="0" cy="0" r="120" fill="#fff2cc" stroke="#cc6600" stroke-width="10"/><path d="M-50,-50 C-30,-20 -60,20 -50,50 M0,-50 C20,-20 -20,20 0,50 M50,-50 C70,-20 40,20 50,50" stroke="#cc6600" stroke-width="8" fill="none"/>';
  } else if (lowerName.includes('sushi')) {
    return '<rect x="-120" y="-50" width="240" height="100" rx="20" ry="20" fill="#ffffff" stroke="#2a6099" stroke-width="5"/><rect x="-100" y="-30" width="200" height="60" fill="#f5f5f5" stroke="#2a6099" stroke-width="3"/><circle cx="0" cy="0" r="25" fill="#ff6347" stroke="#2a6099" stroke-width="2"/>';
  } else if (lowerName.includes('ramen')) {
    return '<circle cx="0" cy="0" r="120" fill="#f9f2ec" stroke="#8c6d46" stroke-width="10"/><path d="M-90,-20 Q0,40 90,-20 M-90,20 Q0,80 90,20" stroke="#8c6d46" stroke-width="8" fill="none"/>';
  } else if (lowerName.includes('steak')) {
    return '<path d="M-120,-70 Q-100,-100 0,-100 Q100,-100 120,-70 Q150,0 120,70 Q100,100 0,100 Q-100,100 -120,70 Q-150,0 -120,-70 Z" fill="#ffe6e6" stroke="#990000" stroke-width="8"/><path d="M-60,-30 L60,-30 M-60,30 L60,30" stroke="#990000" stroke-width="5"/>';
  } else {
    // Generic food icon
    return '<circle cx="0" cy="0" r="100" fill="#f8f8f8" stroke="#333333" stroke-width="10"/><circle cx="-30" cy="-30" r="20" fill="#333" /><circle cx="30" cy="-30" r="20" fill="#333" /><path d="M-40,40 C-30,60 30,60 40,40" stroke="#333" stroke-width="8" fill="none"/>';
  }
}

// Define food categories taxonomy
export const FOOD_CATEGORIES = {
  CUISINE: {
    ITALIAN: 'Italian',
    JAPANESE: 'Japanese',
    AMERICAN: 'American',
    MEXICAN: 'Mexican',
    INDIAN: 'Indian',
    THAI: 'Thai',
    MEDITERRANEAN: 'Mediterranean',
    CHINESE: 'Chinese',
    FRENCH: 'French',
    KOREAN: 'Korean',
    // Custom categories will be added dynamically
  },
  TYPE: {
    MAIN_DISH: 'Main Dish',
    APPETIZER: 'Appetizer',
    DESSERT: 'Dessert',
    SNACK: 'Snack',
    BREAKFAST: 'Breakfast',
    LUNCH: 'Lunch',
    DINNER: 'Dinner',
    SIDE_DISH: 'Side Dish',
    // Custom categories will be added dynamically
  },
  DIETARY: {
    VEGETARIAN: 'Vegetarian',
    VEGAN: 'Vegan',
    GLUTEN_FREE: 'Gluten-Free',
    DAIRY_FREE: 'Dairy-Free',
    KETO: 'Keto',
    PALEO: 'Paleo',
    LOW_CARB: 'Low-Carb',
    HIGH_PROTEIN: 'High-Protein',
    // Custom categories will be added dynamically
  },
  INGREDIENT: {
    MEAT: 'Meat',
    SEAFOOD: 'Seafood',
    GRAIN: 'Grain',
    VEGETABLE: 'Vegetable',
    FRUIT: 'Fruit',
    DAIRY: 'Dairy',
    LEGUME: 'Legume',
    NUTS: 'Nuts',
    // Custom categories will be added dynamically
  },
  COOKING_METHOD: {
    BAKED: 'Baked',
    FRIED: 'Fried',
    GRILLED: 'Grilled',
    STEAMED: 'Steamed',
    BOILED: 'Boiled',
    RAW: 'Raw',
    SMOKED: 'Smoked',
    ROASTED: 'Roasted',
    // Custom categories will be added dynamically
  }
};

// Custom category colors - will be generated for new categories
const customCategoryColors = new Map();

// Helper function to get category color
export function getCategoryColor(category) {
  const colorMap = {
    // Cuisine colors
    [FOOD_CATEGORIES.CUISINE.ITALIAN]: '#e53935',
    [FOOD_CATEGORIES.CUISINE.JAPANESE]: '#3949ab',
    [FOOD_CATEGORIES.CUISINE.AMERICAN]: '#1e88e5',
    [FOOD_CATEGORIES.CUISINE.MEXICAN]: '#43a047',
    [FOOD_CATEGORIES.CUISINE.INDIAN]: '#fb8c00',
    [FOOD_CATEGORIES.CUISINE.THAI]: '#8e24aa',

    // Type colors
    [FOOD_CATEGORIES.TYPE.MAIN_DISH]: '#5e35b1',
    [FOOD_CATEGORIES.TYPE.APPETIZER]: '#00897b',
    [FOOD_CATEGORIES.TYPE.DESSERT]: '#d81b60',
    [FOOD_CATEGORIES.TYPE.SNACK]: '#ffb300',

    // Dietary colors
    [FOOD_CATEGORIES.DIETARY.VEGETARIAN]: '#7cb342',
    [FOOD_CATEGORIES.DIETARY.VEGAN]: '#00c853',
    [FOOD_CATEGORIES.DIETARY.GLUTEN_FREE]: '#00acc1',
    [FOOD_CATEGORIES.DIETARY.DAIRY_FREE]: '#26a69a',

    // Ingredient colors
    [FOOD_CATEGORIES.INGREDIENT.MEAT]: '#c62828',
    [FOOD_CATEGORIES.INGREDIENT.SEAFOOD]: '#0277bd',
    [FOOD_CATEGORIES.INGREDIENT.GRAIN]: '#ef6c00',
    [FOOD_CATEGORIES.INGREDIENT.VEGETABLE]: '#2e7d32',

    // Cooking method colors
    [FOOD_CATEGORIES.COOKING_METHOD.BAKED]: '#6d4c41',
    [FOOD_CATEGORIES.COOKING_METHOD.FRIED]: '#f57f17',
    [FOOD_CATEGORIES.COOKING_METHOD.GRILLED]: '#5d4037',
    [FOOD_CATEGORIES.COOKING_METHOD.STEAMED]: '#546e7a'
  };

  // Check if we have a predefined color
  if (colorMap[category]) {
    return colorMap[category];
  }

  // Check if we have a custom color
  if (customCategoryColors.has(category)) {
    return customCategoryColors.get(category);
  }

  // Generate a new color for this category
  const newColor = generateRandomColor();
  customCategoryColors.set(category, newColor);
  return newColor;
}

// Generate a random color for custom categories
function generateRandomColor() {
  // Generate colors in a pleasing range
  const hue = Math.floor(Math.random() * 360);
  const saturation = 65 + Math.floor(Math.random() * 25); // 65-90%
  const lightness = 45 + Math.floor(Math.random() * 10); // 45-55%

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Function to add a custom category
export function addCustomCategory(categoryType, categoryName) {
  const typeKey = categoryType.toUpperCase();

  // Skip if category already exists
  if (FOOD_CATEGORIES[typeKey] && FOOD_CATEGORIES[typeKey][categoryName]) {
    return false;
  }

  // Create a normalized key (uppercase, no spaces)
  const normalizedKey = categoryName.toUpperCase().replace(/\s+/g, '_');

  // Add the new category
  FOOD_CATEGORIES[typeKey][normalizedKey] = categoryName;

  // Generate a color for it
  if (!customCategoryColors.has(categoryName)) {
    customCategoryColors.set(categoryName, generateRandomColor());
  }

  return true;
}

// Food items list with Unsplash images and categories
const initialFoodItems = [
  {
    id: 1,
    name: 'Pizza',
    description: 'Italian dish with a round, flattened base of leavened wheat-based dough topped with various ingredients',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    fallbackImageUrl: createSVGImageData('Pizza', '#cc0000', '#ffedd5'),
    rating: 1200,
    categories: {
      cuisine: FOOD_CATEGORIES.CUISINE.ITALIAN,
      type: FOOD_CATEGORIES.TYPE.MAIN_DISH,
      ingredient: [FOOD_CATEGORIES.INGREDIENT.GRAIN, FOOD_CATEGORIES.INGREDIENT.DAIRY],
      cookingMethod: FOOD_CATEGORIES.COOKING_METHOD.BAKED
    }
  },
  {
    id: 2,
    name: 'Sushi',
    description: 'Japanese dish of prepared vinegared rice accompanied by a variety of ingredients such as seafood',
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    fallbackImageUrl: createSVGImageData('Sushi', '#2a6099', '#f5f5f5'),
    rating: 1200,
    categories: {
      cuisine: FOOD_CATEGORIES.CUISINE.JAPANESE,
      type: FOOD_CATEGORIES.TYPE.MAIN_DISH,
      ingredient: [FOOD_CATEGORIES.INGREDIENT.SEAFOOD, FOOD_CATEGORIES.INGREDIENT.GRAIN],
      cookingMethod: FOOD_CATEGORIES.COOKING_METHOD.RAW
    }
  },
  {
    id: 3,
    name: 'Burger',
    description: 'Sandwich consisting of fillings—usually a patty of ground meat placed inside a sliced bun',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    fallbackImageUrl: createSVGImageData('Burger', '#663300', '#fff9e6'),
    rating: 1200,
    categories: {
      cuisine: FOOD_CATEGORIES.CUISINE.AMERICAN,
      type: FOOD_CATEGORIES.TYPE.MAIN_DISH,
      ingredient: [FOOD_CATEGORIES.INGREDIENT.MEAT, FOOD_CATEGORIES.INGREDIENT.GRAIN],
      cookingMethod: FOOD_CATEGORIES.COOKING_METHOD.GRILLED
    }
  },
  {
    id: 4,
    name: 'Pasta',
    description: 'Italian food made from a dough of flour, water, and eggs, formed into various shapes',
    imageUrl: 'https://images.unsplash.com/photo-1598866594230-a7c12756260f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    fallbackImageUrl: createSVGImageData('Pasta', '#cc6600', '#fff5e6'),
    rating: 1200,
    categories: {
      cuisine: FOOD_CATEGORIES.CUISINE.ITALIAN,
      type: FOOD_CATEGORIES.TYPE.MAIN_DISH,
      ingredient: [FOOD_CATEGORIES.INGREDIENT.GRAIN],
      cookingMethod: FOOD_CATEGORIES.COOKING_METHOD.BOILED
    }
  },
  {
    id: 5,
    name: 'Tacos',
    description: 'Traditional Mexican dish consisting of a corn or wheat tortilla folded or rolled around a filling',
    imageUrl: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    fallbackImageUrl: createSVGImageData('Tacos', '#993300', '#ffe6cc'),
    rating: 1200,
    categories: {
      cuisine: FOOD_CATEGORIES.CUISINE.MEXICAN,
      type: FOOD_CATEGORIES.TYPE.MAIN_DISH,
      ingredient: [FOOD_CATEGORIES.INGREDIENT.GRAIN, FOOD_CATEGORIES.INGREDIENT.MEAT, FOOD_CATEGORIES.INGREDIENT.VEGETABLE],
      cookingMethod: FOOD_CATEGORIES.COOKING_METHOD.FRIED
    }
  },
  {
    id: 6,
    name: 'Lasagna',
    description: 'Italian dish consisting of stacked layers of pasta with sauce, cheese, and various fillings',
    imageUrl: 'https://images.unsplash.com/photo-1619895092538-128341789043?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    fallbackImageUrl: createSVGImageData('Lasagna', '#ffffff', '#9c3d25'),
    rating: 1200,
    categories: {
      cuisine: FOOD_CATEGORIES.CUISINE.ITALIAN,
      type: FOOD_CATEGORIES.TYPE.MAIN_DISH,
      ingredient: [FOOD_CATEGORIES.INGREDIENT.GRAIN, FOOD_CATEGORIES.INGREDIENT.DAIRY, FOOD_CATEGORIES.INGREDIENT.MEAT],
      cookingMethod: FOOD_CATEGORIES.COOKING_METHOD.BAKED
    }
  },
  {
    id: 7,
    name: 'Cheesecake',
    description: 'Sweet dessert consisting of a thick, creamy filling over a crust made of crushed cookies or graham crackers',
    imageUrl: 'https://images.unsplash.com/photo-1567171466295-4afa63d45416?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    fallbackImageUrl: createSVGImageData('Cheesecake', '#c4a146', '#f9ecc5'),
    rating: 1200,
    categories: {
      cuisine: FOOD_CATEGORIES.CUISINE.AMERICAN,
      type: FOOD_CATEGORIES.TYPE.DESSERT,
      ingredient: [FOOD_CATEGORIES.INGREDIENT.DAIRY, FOOD_CATEGORIES.INGREDIENT.GRAIN],
      cookingMethod: FOOD_CATEGORIES.COOKING_METHOD.BAKED,
      dietary: [FOOD_CATEGORIES.DIETARY.VEGETARIAN]
    }
  },
  {
    id: 8,
    name: 'Curry',
    description: 'A dish with a sauce seasoned with spices, originally from the Indian subcontinent',
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    fallbackImageUrl: createSVGImageData('Curry', '#cc6600', '#fff2cc'),
    rating: 1200,
    categories: {
      cuisine: FOOD_CATEGORIES.CUISINE.INDIAN,
      type: FOOD_CATEGORIES.TYPE.MAIN_DISH,
      ingredient: [FOOD_CATEGORIES.INGREDIENT.VEGETABLE, FOOD_CATEGORIES.INGREDIENT.MEAT],
      cookingMethod: FOOD_CATEGORIES.COOKING_METHOD.BOILED
    }
  },
  {
    id: 9,
    name: 'Ramen',
    description: 'Japanese noodle soup dish with wheat noodles served in a meat or fish-based broth',
    imageUrl: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    fallbackImageUrl: createSVGImageData('Ramen', '#8c6d46', '#f9f2ec'),
    rating: 1200,
    categories: {
      cuisine: FOOD_CATEGORIES.CUISINE.JAPANESE,
      type: FOOD_CATEGORIES.TYPE.MAIN_DISH,
      ingredient: [FOOD_CATEGORIES.INGREDIENT.GRAIN, FOOD_CATEGORIES.INGREDIENT.MEAT],
      cookingMethod: FOOD_CATEGORIES.COOKING_METHOD.BOILED
    }
  },
  {
    id: 10,
    name: 'Steak',
    description: 'A slice of meat, typically beef, cut from the fleshy part of an animal or large fish',
    imageUrl: 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    fallbackImageUrl: createSVGImageData('Steak', '#990000', '#ffe6e6'),
    rating: 1200,
    categories: {
      cuisine: FOOD_CATEGORIES.CUISINE.AMERICAN,
      type: FOOD_CATEGORIES.TYPE.MAIN_DISH,
      ingredient: [FOOD_CATEGORIES.INGREDIENT.MEAT],
      cookingMethod: FOOD_CATEGORIES.COOKING_METHOD.GRILLED,
      dietary: [FOOD_CATEGORIES.DIETARY.LOW_CARB, FOOD_CATEGORIES.DIETARY.HIGH_PROTEIN]
    }
  }
];

// Create the writable store
const foodItems = writable(initialFoodItems);

export default foodItems;
