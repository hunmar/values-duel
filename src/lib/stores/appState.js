import { writable } from 'svelte/store';

// App states
export const APP_STATES = {
  LANDING: 'landing',
  COMPARISON: 'comparison',
  RESULTS: 'results'
};

// Theme options
export const THEMES = {
  DARK: 'dark'
};

// Initial app state
const initialState = {
  currentState: APP_STATES.LANDING,
  totalComparisons: 0,
  completedComparisons: 0,
  comparisonHistory: [],
  theme: THEMES.DARK
};

// Create the writable store
const appState = writable(initialState);

// Function to apply theme to document
export function applyTheme(theme) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

export default appState;