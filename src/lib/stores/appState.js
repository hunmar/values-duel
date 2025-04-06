import { writable } from 'svelte/store';

// App states
export const APP_STATES = {
  LANDING: 'landing',
  COMPARISON: 'comparison',
  RESULTS: 'results',
  ANALYTICS: 'analytics'
};

// Theme options
export const THEMES = {
  DARK: 'dark',
  LIGHT: 'light'
};

// Initial app state
const initialState = {
  currentState: APP_STATES.LANDING,
  totalComparisons: 0,
  completedComparisons: 0,
  comparisonHistory: [],
  theme: THEMES.DARK,
  isDemoMode: false,
  
  // New settings properties
  kFactor: 32,                 // Elo rating K-factor (how drastically ratings change)
  sound: true,                 // Enable sound effects
  soundVolume: 0.5,            // Sound effect volume (0-1)
  vibration: true,             // Enable vibration feedback on supported devices
  reducedMotion: false,        // Reduce or disable animations for accessibility
  highContrast: false,         // Enhance contrast for better accessibility
  fontSize: 'default',         // Font size option (small, default, large, x-large)
  showSettingsPanel: false     // Controls whether settings panel is visible
};

// Create the writable store
const appState = writable(initialState);

// Function to apply theme to document
export function applyTheme(theme) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

// Function to apply accessibility preferences
export function applyAccessibilityPreferences(preferences) {
  if (typeof document !== 'undefined') {
    // Apply reduced motion preference
    if (preferences.reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
    
    // Apply high contrast preference
    if (preferences.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    
    // Apply font size preference
    document.documentElement.setAttribute('data-font-size', preferences.fontSize || 'default');
  }
}

export default appState;