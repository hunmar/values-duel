# Taste Duel UI Component Library

This folder contains reusable UI components for the Taste Duel application, inspired by the shadcn-ui design system.

## Component Overview

### Layout Components
- **Container**: Responsive container with max width and centered content
- **Card**: Card container with header, content, and footer components
- **Dialog**: Modal dialog with focus trapping and accessibility features
- **Drawer**: Side panel that slides in from any edge of the screen
- **Tabs**: Tabbed interface with animated indicators

### Typography
- **Heading**: Heading component with configurable levels and sizes
- **Text**: Text component with various size and style options

### Form Controls
- **Button**: Button component with multiple variants and sizes
- **Input**: Text input with various styles and validation states
- **Select**: Dropdown selector with customizable options
- **Switch**: Toggle component with multiple sizes and colors

### Feedback & Display
- **Alert**: Status message component with multiple variants
- **Badge**: Small status indicator component
- **Progress**: Progress bar with configurable styles
- **Tooltip**: Context-sensitive information on hover

## Usage Guidelines

### Importing Components

All components are exported from `src/lib/ui/index.js` and can be imported like this:

```svelte
<script>
  import { Button, Card, CardContent } from '$lib/ui';
</script>

<Card>
  <CardContent>
    <Button>Click Me</Button>
  </CardContent>
</Card>
```

### Component Props

Most components follow these common prop patterns:

- **className**: Custom CSS class to apply to the component
- **variant**: Visual style variant (e.g., "default", "outline", "ghost")
- **size**: Component size (e.g., "sm", "default", "lg")

### Theme Variables

Components use CSS variables from the global theme. The primary variables are:

- **Colors**: `--primary-color`, `--secondary-color`, `--accent-color`
- **Text**: `--text-color`, `--muted-color`
- **Backgrounds**: `--card-bg`, `--background-color`
- **Borders**: `--card-border`, `--focus-ring`
- **Shadows**: `--shadow-sm`, `--shadow-md`, `--shadow-lg`

### Theme System

The application supports both light and dark themes, with CSS variables defined in App.svelte:

```css
/* Dark theme */
:global([data-theme="dark"]) {
  --bg-color: #0f172a;
  --text-color: #f8fafc;
  --card-bg: #1e293b;
  /* ... other variables ... */
}

/* Light theme */
:global([data-theme="light"]) {
  --bg-color: #f8fafc;
  --text-color: #0f172a;
  --card-bg: #ffffff;
  /* ... other variables ... */
}
```

Theme can be switched using the `applyTheme()` function from the appState store:

```js
import { THEMES, applyTheme } from './lib/stores/appState.js';

// Apply dark theme
applyTheme(THEMES.DARK);

// Apply light theme
applyTheme(THEMES.LIGHT);
```

### Accessibility Features

The component library includes built-in accessibility features:

- Reduced motion mode: Disables animations for users who prefer minimal motion
- High contrast mode: Enhances contrast for better visibility
- Font size adjustments: Allows users to increase text size

These features can be applied using the `applyAccessibilityPreferences()` function:

```js
import { applyAccessibilityPreferences } from './lib/stores/appState.js';

applyAccessibilityPreferences({
  reducedMotion: true,
  highContrast: false,
  fontSize: 'large'
});
```

### Adding New Components

When adding new components:

1. Create the component in the `ui` directory
2. Export it in `index.js`
3. Follow existing naming and prop conventions
4. Use CSS variables for theming
5. Ensure dark mode compatibility
6. Test for accessibility compliance

### Best Practices

- Use semantic HTML elements wherever possible
- Keep components single-purpose and composable
- Provide sensible defaults for all props
- Document prop options in component JSDoc comments
- Ensure proper type checking with prop validation
- Test components on different screen sizes
- Use CSS variables for all colors and dimensions
- Implement keyboard navigation for interactive components
- Add appropriate ARIA attributes for screen readers