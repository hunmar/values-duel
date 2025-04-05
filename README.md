# Taste Duel - Food Preference Ranking App

A Svelte-based web application that helps users discover their true food preferences through an engaging series of direct comparisons.

## Overview

Taste Duel uses the Elo rating system (commonly used in chess rankings) to accurately rank food preferences. The app presents users with pairs of food items and asks them to choose which they prefer. After completing all necessary comparisons, users receive a comprehensive ranked list of their food preferences.

## Features

- **Elo Rating System**: Sophisticated algorithm for accurate preference ranking
- **Adaptive Comparison Selection**: Minimizes the number of comparisons needed for accurate results
- **Responsive Design**: Works on all device sizes
- **Local Storage**: Save progress between sessions
- **Export Results**: Save your rankings as JSON
- **Accessibility**: Full keyboard navigation and screen reader support

## How It Works

1. **Initial Screen**: Browse the curated list of diverse food items
2. **Comparison Mode**: Choose your preferred food item from each pair
3. **Progress Tracking**: See how many comparisons you've completed
4. **Results Screen**: View your personalized food ranking list

## Technical Implementation

### Elo Rating System

- Each food item starts with a default rating of 1200
- After each comparison, ratings are updated using the formula:
  ```
  Rₐ' = Rₐ + K × (Sₐ - Eₐ)
  ```
  Where:
  - Rₐ' is the new rating for item A
  - Rₐ is the current rating for item A
  - K is the k-factor (determines how drastically ratings change)
  - Sₐ is the actual outcome (1 if A is chosen, 0 if B is chosen)
  - Eₐ is the expected outcome based on current ratings: Eₐ = 1 / (1 + 10^((Rᵦ-Rₐ)/400))

### Comparison Selection Algorithm

- Not all possible n(n-1)/2 comparisons will be shown
- Initial comparisons are relatively random to establish baseline ratings
- Subsequent comparisons prioritize items with similar ratings for more accurate differentiation
- Adaptive algorithm reduces total comparisons needed while maintaining ranking accuracy
- Minimum of log₂(n) × n comparisons required for n items

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/values-duel.git
   cd values-duel
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## Project Structure

- `/src` - Source code
  - `/lib` - Reusable components and utilities
    - `/components` - Svelte components
    - `/stores` - Svelte stores for state management
    - `/utils` - Utility functions
  - `App.svelte` - Main application component
  - `main.js` - Application entry point

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Elo rating system - Arpad Elo
- Svelte - Rich Harris and contributors
- Vite - Evan You and contributors
