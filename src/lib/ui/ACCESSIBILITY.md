# Accessibility Guidelines for Taste Duel UI Components

This document outlines the accessibility features and best practices implemented in the Taste Duel UI component library.

## Accessibility Features

### Core Features

The UI component library includes built-in accessibility support through:

1. **Reduced Motion Mode**
   - Disables or reduces animations for users who experience motion sickness or distractions
   - Implemented via the `reduced-motion` CSS class that sets `--transition-duration: 0ms`
   - Can be toggled in the settings panel or programmatically

2. **High Contrast Mode**
   - Enhances color contrast for users with visual impairments
   - Increases contrast ratios beyond WCAG AA standards to improve readability
   - Simplifies background patterns and removes subtle color variations

3. **Font Size Adjustments**
   - Provides user control over text size
   - Offers options: small, default, large, and x-large
   - Maintains proper scaling relationships between headings and body text

4. **Keyboard Navigation**
   - All interactive elements are fully keyboard accessible
   - Focus states are clearly visible
   - Logical tab order is maintained throughout the application

### Implementation

These features can be applied using the `applyAccessibilityPreferences()` function from the appState store:

```js
import { applyAccessibilityPreferences } from './lib/stores/appState.js';

applyAccessibilityPreferences({
  reducedMotion: true,
  highContrast: false,
  fontSize: 'large'
});
```

## WCAG Compliance

The UI components are designed to meet WCAG 2.1 AA standards:

### Perceivable

- **Text Alternatives**: All images include appropriate alt text
- **Time-Based Media**: Media alternatives are provided where applicable
- **Adaptable**: Content is presented in different ways without losing structure
- **Distinguishable**: Content is easy to see and hear

### Operable

- **Keyboard Accessible**: All functionality is available from the keyboard
- **Enough Time**: Users have enough time to read and use content
- **Seizures and Physical Reactions**: Content doesn't cause seizures or physical reactions
- **Navigable**: Users can easily navigate and find content

### Understandable

- **Readable**: Text is readable and understandable
- **Predictable**: Components operate in predictable ways
- **Input Assistance**: Users are helped to avoid and correct mistakes

### Robust

- **Compatible**: Components maximize compatibility with assistive technologies

## Component-Specific Guidelines

### Dialogs and Modals

- Trap focus within the modal when open
- Return focus to the element that triggered the modal when closed
- Use appropriate ARIA roles and attributes
- Support closing via the Escape key

### Form Elements

- All inputs have associated labels
- Error messages are programmatically associated with inputs
- Required fields are clearly indicated
- Form elements have appropriate ARIA attributes

### Interactive Elements

- Buttons have appropriate roles and states
- Interactive elements have sufficient touch targets (44×44px minimum)
- Focus indicators are clearly visible
- State changes are announced to screen readers

### Navigation and Tabs

- Current selection is clearly indicated visually and programmatically
- Tab panels are properly associated with their tabs
- Arrow key navigation is supported
- Active state is communicated to assistive technologies

## Testing Recommendations

To ensure accessibility compliance:

1. Test with keyboard navigation only
2. Test with screen readers (NVDA, JAWS, VoiceOver)
3. Test with high contrast mode
4. Test with text size increased to 200%
5. Test with reduced motion settings
6. Validate using automated tools like axe or Lighthouse
7. Conduct user testing with people who use assistive technologies

## References

- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/TR/wai-aria-practices-1.1/)
- [Inclusive Components](https://inclusive-components.design/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)