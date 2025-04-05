import { writable } from 'svelte/store';

// App states
export const APP_STATES = {
  LANDING: 'landing',
  COMPARISON: 'comparison',
  RESULTS: 'results'
};

// Initial app state
const initialState = {
  currentState: APP_STATES.LANDING,
  totalComparisons: 0,
  completedComparisons: 0,
  comparisonHistory: []
};

// Create the writable store
const appState = writable(initialState);

export default appState;