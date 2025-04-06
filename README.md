# Taste Duel - Food Preference Ranking App

A Svelte-based web application that helps users discover their true food preferences through an engaging series of direct comparisons.

## Overview

Taste Duel uses the Elo rating system (commonly used in chess rankings) to accurately rank food preferences. The app presents users with pairs of food items and asks them to choose which they prefer. After completing all necessary comparisons, users receive a comprehensive ranked list of their food preferences.

## Features

- **Elo Rating System**: Sophisticated algorithm for accurate preference ranking
- **Adaptive Comparison Selection**: Minimizes the number of comparisons needed for accurate results
- **Enhanced Design System**: Consistent, accessible, and beautiful UI components
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

### Design System

The application uses a comprehensive design system that ensures consistency across all components:

- **Color System**: Consistent color palette with primary, secondary, and accent colors
- **Typography**: Hierarchical type system with defined sizes, weights, and line heights
- **Spacing**: Standardized spacing scale for consistent layout and component spacing
- **Components**: Reusable UI components with consistent styling and behavior
- **Accessibility**: WCAG 2.1 AA compliant components with proper contrast and keyboard navigation

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Accessing the Design System Demo

The application includes a comprehensive design system demo that showcases all UI components:

1. Run the application using the instructions below
2. Click on the design system icon in the top-right corner of the application (book icon)
3. Browse through the various components, their variants, and usage examples
4. Return to the main application by clicking on any other navigation option

The design system demo provides a visual reference for all available components and their properties, making it easier for developers to understand and use the design system consistently.

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
    - `/ui` - Design system components
  - `App.svelte` - Main application component
  - `main.js` - Application entry point
- `/docs` - Project documentation
  - `/design` - Design system documentation
    - `DESIGN_SYSTEM_PLAN.md` - Design system enhancement plan
    - `DESIGN_SYSTEM_FOCUS.md` - Design system focus areas
  - `/planning` - Project planning documents
    - `IMPROVEMENT_PLAN.md` - Detailed improvement plan
    - `EXECUTIVE_SUMMARY.md` - Project executive summary
    - `CHECKPOINT.MD` - Project checkpoint documentation
  - `/metrics` - Success metrics and measurements
    - `SUCCESS_METRICS.md` - Project success metrics
  - `PROJECT_PROGRESS.md` - Detailed log of all work completed
  - `DESIGN_SYSTEM.md` - Comprehensive design system documentation
  - `CODE_QUALITY.md` - Documentation of code quality improvements
  - `linting-issues.md` - Documentation of linting issues
  - `linting-fixes-summary.md` - Summary of linting fixes

## Documentation

For detailed information about the project, please refer to the following documentation:

### Design System
- [Design System Overview](docs/DESIGN_SYSTEM.md) - Comprehensive documentation of the design system
- [Design System Plan](docs/design/DESIGN_SYSTEM_PLAN.md) - Design system enhancement plan
- [Design System Focus](docs/design/DESIGN_SYSTEM_FOCUS.md) - Design system focus areas

### Project Planning
- [Project Progress](docs/PROJECT_PROGRESS.md) - A detailed log of all work completed
- [Improvement Plan](docs/planning/IMPROVEMENT_PLAN.md) - Detailed improvement plan
- [Executive Summary](docs/planning/EXECUTIVE_SUMMARY.md) - Project executive summary

### Code Quality
- [Code Quality](docs/CODE_QUALITY.md) - Documentation of code quality improvements
- [Linting Issues](docs/linting-issues.md) - Documentation of linting issues
- [Linting Fixes Summary](docs/linting-fixes-summary.md) - Summary of linting fixes

### Metrics
- [Success Metrics](docs/metrics/SUCCESS_METRICS.md) - Project success metrics

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Elo rating system - Arpad Elo
- Svelte - Rich Harris and contributors
- Vite - Evan You and contributors
