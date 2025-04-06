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

### Accessibility

All components are built with accessibility in mind:
- Proper ARIA attributes
- Keyboard navigation support
- Focus management
- Screen reader friendly

## Adding New Components

When adding new components:

1. Create the component in the `ui` directory
2. Export it in `index.js`
3. Follow existing naming and prop conventions
4. Use CSS variables for theming
5. Ensure dark mode compatibility
6. Test for accessibility compliance

## Best Practices

- Use semantic HTML elements wherever possible
- Keep components single-purpose and composable
- Provide sensible defaults for all props
- Document prop options in component JSDoc comments
- Ensure proper type checking with prop validation
- Test components on different screen sizes