# Taste Duel Theming System

This document explains the theming system used in the Taste Duel UI component library.

## CSS Variables

The UI components use CSS variables for consistent styling. These variables are defined in `App.svelte` and are available globally.

### Core Variables

```css
:root {
  /* Primary colors */
  --primary-color: #10b981; /* Vibrant teal */
  --primary-hover: #34d399; /* Lighter teal for hover */
  --primary-focus: rgba(16, 185, 129, 0.5); /* For focus states */
  
  /* Secondary colors */
  --secondary-color: #6366f1; /* Vibrant indigo */
  --secondary-hover: #818cf8; /* Lighter indigo for hover */
  --secondary-focus: rgba(99, 102, 241, 0.5); /* For focus states */
  
  /* Accent colors */
  --accent-color: #f43f5e; /* Vibrant rose */
  --accent-hover: #fb7185; /* Lighter rose for hover */
  
  /* Font size variables */
  --font-size-small: 0.875rem;
  --font-size-default: 1rem;
  --font-size-large: 1.125rem;
  --font-size-xlarge: 1.25rem;
}
```

### Dark Theme (Default)

```css
[data-theme="dark"] {
  --bg-color: #0f172a; /* Deep blue-gray background */
  --text-color: #f8fafc; /* Very light gray-blue text */
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
```

### Light Theme

```css
[data-theme="light"] {
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
```

### High Contrast Mode

```css
.high-contrast {
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
```

## Switching Themes

Themes can be applied using the `applyTheme()` function from the appState store:

```js
import { THEMES, applyTheme } from './lib/stores/appState.js';

// Apply dark theme
applyTheme(THEMES.DARK);

// Apply light theme
applyTheme(THEMES.LIGHT);
```

The implementation in `appState.js`:

```js
// Theme options
export const THEMES = {
  DARK: 'dark',
  LIGHT: 'light'
};

// Apply theme function
export function applyTheme(theme) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }
}
```

## Using in Components

Components should use CSS variables for styling:

```svelte
<style>
  .card {
    background-color: var(--card-bg);
    border: 1px solid var(--card-border);
    color: var(--text-color);
    box-shadow: var(--shadow-md);
  }
  
  .card:hover {
    border-color: var(--card-hover-border);
  }
  
  .button {
    background-color: var(--primary-color);
    color: white;
  }
  
  .button:hover {
    background-color: var(--primary-hover);
  }
  
  .button:focus {
    box-shadow: 0 0 0 3px var(--primary-focus);
  }
</style>
```

## Font Size System

Font sizes are controlled through CSS variables and can be adjusted by the user:

```css
/* Font size settings */
[data-font-size="small"] {
  font-size: 0.875rem;
}

[data-font-size="default"] {
  font-size: 1rem;
}

[data-font-size="large"] {
  font-size: 1.125rem;
}

[data-font-size="x-large"] {
  font-size: 1.25rem;
}
```

Applied using:

```js
export function applyAccessibilityPreferences({ reducedMotion, highContrast, fontSize }) {
  if (typeof document !== 'undefined') {
    // Apply reduced motion preference
    if (reducedMotion !== undefined) {
      if (reducedMotion) {
        document.documentElement.classList.add('reduced-motion');
      } else {
        document.documentElement.classList.remove('reduced-motion');
      }
    }
    
    // Apply high contrast preference
    if (highContrast !== undefined) {
      if (highContrast) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
    }
    
    // Apply font size preference
    if (fontSize) {
      document.documentElement.setAttribute('data-font-size', fontSize);
    }
  }
}
```

## Best Practices

When using the theming system:

1. Always use CSS variables for colors, spacing, and sizing
2. Ensure components work well in both light and dark modes
3. Test components with high contrast mode enabled
4. Test with different font sizes
5. Use relative units (rem, em) instead of fixed units (px)
6. Consider reduced motion preferences when implementing animations
7. Provide sufficient contrast between text and background
8. Use transitions for theme changes to avoid jarring visual updates