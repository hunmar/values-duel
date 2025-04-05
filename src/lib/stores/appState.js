import { writable } from 'svelte/store';

// App states
export const APP_STATES = {
  LANDING: 'landing',
  COMPARISON: 'comparison',
  RESULTS: 'results'
};

// Theme options
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

// Detect system theme preference
function detectSystemTheme() {
  if (typeof window !== 'undefined') {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? THEMES.DARK 
      : THEMES.LIGHT;
  }
  return THEMES.LIGHT;
}

// Initial app state
const initialState = {
  currentState: APP_STATES.LANDING,
  totalComparisons: 0,
  completedComparisons: 0,
  comparisonHistory: [],
  theme: THEMES.SYSTEM,
  effectiveTheme: detectSystemTheme()
};

// Create the writable store
const appState = writable(initialState);

// Function to toggle theme
export function toggleTheme() {
  appState.update(state => {
    const nextTheme = state.theme === THEMES.LIGHT 
      ? THEMES.DARK 
      : state.theme === THEMES.DARK 
        ? THEMES.SYSTEM 
        : THEMES.LIGHT;
    
    const effectiveTheme = nextTheme === THEMES.SYSTEM 
      ? detectSystemTheme() 
      : nextTheme;
    
    return {
      ...state,
      theme: nextTheme,
      effectiveTheme
    };
  });
}

// Function to apply theme to document
export function applyTheme(theme) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

export default appState;