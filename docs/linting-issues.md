# Linting Issues Report

## Syntax and Type Issues

1. **Type Errors in UI Components**:
   - In `ResultsScreen.svelte`: Using `hover={true}` property which doesn't exist in the component's props (should be `hoverable={true}`)
   - In `Button.svelte`: Type 'string' is not assignable to type '"button" | "reset" | "submit"'
   - In `Dialog.svelte`: Multiple object literal properties not recognized in Element type
   - In `Progress.svelte`: Using `showLabel` property which doesn't exist in the component's props

2. **Module Import Issues**:
   - In `DesignSystemDemo.svelte`: Cannot find module '$lib/ui' or its corresponding type declarations

3. **Interface Implementation Issues**:
   - In `Toast.svelte` and `DesignSystemDemo.svelte`: Properties like 'subscribe', 'dismiss', and 'loading' do not exist on type 'ToastServiceInterface'

## Code Quality Issues

1. **Console Statements**:
   - Multiple `console.log`, `console.warn`, and `console.error` statements in `eloRating.js` that should be removed or replaced with proper logging

2. **Potential Memory Leaks**:
   - In `CategoryCreator.svelte`: `setTimeout` without clearTimeout when component is destroyed

3. **Accessibility Issues**:
   - Missing ARIA attributes in some interactive components
   - Color contrast issues in some UI components (`:global(.more-badge)` in FoodCard.svelte)

4. **Unused Variables/Imports**:
   - Some imported components or functions might not be used

## Styling Issues

1. **Global CSS Leakage**:
   - Using `:global()` in component styles which can lead to style conflicts

2. **Inconsistent Styling**:
   - Mix of inline styles and CSS variables
   - Inconsistent use of units (px, rem, em)

## Recommendations

1. **Type Definitions**:
   - Create proper TypeScript interfaces for all component props
   - Use proper type checking for function parameters

2. **Code Organization**:
   - Refactor large components into smaller, more focused ones
   - Move utility functions to separate files

3. **Error Handling**:
   - Implement proper error handling instead of console logging
   - Add error boundaries for critical components

4. **Performance Improvements**:
   - Optimize expensive calculations in eloRating.js
   - Use memoization for complex calculations
