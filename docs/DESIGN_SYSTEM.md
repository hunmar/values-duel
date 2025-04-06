# Design System Documentation

This document provides comprehensive documentation of the Taste Duel design system, including color system, typography, spacing, component documentation, and usage guidelines.

## Color System

The Taste Duel color system is built on a set of semantic tokens that provide consistent theming across the application, with support for both light and dark modes.

### Base Colors

```css
:root {
  /* Base colors */
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;

  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;

  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;

  --destructive: 0 100% 50%;
  --destructive-foreground: 210 40% 98%;

  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;

  --card: 0 0% 100%;
  --card-foreground: 222.2 47.4% 11.2%;

  --popover: 0 0% 100%;
  --popover-foreground: 222.2 47.4% 11.2%;

  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 47.4% 11.2%;

  --background: 0 0% 100%;
  --foreground: 222.2 47.4% 11.2%;
}
```

### Dark Mode Colors

```css
.dark {
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 47.4% 11.2%;

  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;

  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;

  --destructive: 0 63% 31%;
  --destructive-foreground: 210 40% 98%;

  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;

  --card: 222.2 47.4% 11.2%;
  --card-foreground: 210 40% 98%;

  --popover: 222.2 47.4% 11.2%;
  --popover-foreground: 210 40% 98%;

  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 212.7 26.8% 83.9%;

  --background: 222.2 47.4% 11.2%;
  --foreground: 210 40% 98%;
}
```

### Data Visualization Colors

```css
:root {
  --chart-color-1: 222.2 47.4% 50%;
  --chart-color-2: 180 47.4% 50%;
  --chart-color-3: 120 47.4% 50%;
  --chart-color-4: 60 47.4% 50%;
  --chart-color-5: 0 47.4% 50%;
  --chart-color-6: 270 47.4% 50%;

  --chart-gradient-start: 222.2 47.4% 50%;
  --chart-gradient-end: 270 47.4% 50%;
}
```

### Usage Guidelines

- Use `--primary` for main actions and focus states
- Use `--secondary` for secondary actions and backgrounds
- Use `--accent` for highlighting important elements
- Use `--destructive` for error states and destructive actions
- Use `--muted` for subtle backgrounds and disabled states
- Use `--background` and `--foreground` for main content areas
- Use `--card` and `--card-foreground` for card components
- Use `--border` for borders and dividers
- Use `--input` for form controls
- Use `--ring` for focus rings

## Typography Scale

The typography system uses a modular scale with consistent ratios between sizes.

```css
:root {
  /* Base font */
  --font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;

  /* Font sizes */
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;   /* 36px */
  --font-size-5xl: 3rem;      /* 48px */

  /* Line heights */
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;

  /* Font weights */
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Letter spacing */
  --letter-spacing-tight: -0.025em;
  --letter-spacing-normal: 0em;
  --letter-spacing-wide: 0.025em;
}
```

### Typography Components

#### Heading

The `Heading` component is used for all heading levels (h1-h6) with consistent styling.

```svelte
<Heading level={1}>Main Heading</Heading>
<Heading level={2}>Section Heading</Heading>
<Heading level={3}>Subsection Heading</Heading>
```

#### Text

The `Text` component is used for paragraphs and other text content.

```svelte
<Text>Regular paragraph text</Text>
<Text size="sm">Smaller text</Text>
<Text weight="bold">Bold text</Text>
```

### Usage Guidelines

- Use appropriate heading levels for document structure
- Maintain consistent text sizes across similar elements
- Use font weights to create visual hierarchy
- Limit the number of font sizes used in a single view

## Spacing System

The spacing system uses a consistent scale based on 4px increments.

```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  --space-24: 6rem;     /* 96px */

  /* Negative values for margins */
  --space-n1: -0.25rem;
  --space-n2: -0.5rem;
  --space-n3: -0.75rem;
  --space-n4: -1rem;
  --space-n5: -1.25rem;
  --space-n6: -1.5rem;

  /* Component-specific spacing */
  --card-padding: var(--space-6);
  --container-padding: var(--space-4);
  --button-padding: var(--space-2) var(--space-4);
  --input-padding: var(--space-2) var(--space-3);
}
```

### Usage Guidelines

- Use consistent spacing values from the scale
- Use smaller values (1-3) for tight spacing within components
- Use medium values (4-6) for component padding and margins
- Use larger values (8+) for section spacing
- Maintain consistent spacing between similar elements

## Component Documentation

### Button

The Button component is used for actions and navigation.

```svelte
<Button>Default Button</Button>
<Button variant="secondary">Secondary Button</Button>
<Button variant="destructive">Destructive Button</Button>
<Button size="sm">Small Button</Button>
<Button disabled>Disabled Button</Button>
```

#### Props
- `variant`: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link"
- `size`: "default" | "sm" | "lg" | "icon"
- `disabled`: boolean

### Card

The Card component is used for containing related content.

```svelte
<Card>
  <CardHeader>
    <Heading level={3}>Card Title</Heading>
    <Text>Card subtitle or description</Text>
  </CardHeader>
  <CardContent>
    <Text>Main card content goes here.</Text>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

#### Components
- `Card`: The main container
- `CardHeader`: For titles and descriptions
- `CardContent`: For main content
- `CardFooter`: For actions

### Dialog

The Dialog component is used for modal interactions.

```svelte
<Dialog bind:open={isOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description or content.</DialogDescription>
    </DialogHeader>
    <div>Main dialog content</div>
    <DialogFooter>
      <Button on:click={() => isOpen = false}>Close</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Input

The Input component is used for text input.

```svelte
<Input placeholder="Enter your name" />
<Input type="email" placeholder="Enter your email" />
<Input disabled value="Disabled input" />
```

#### Props
- `type`: string (HTML input types)
- `placeholder`: string
- `value`: string
- `disabled`: boolean

### Select

The Select component is used for selecting from a list of options.

```svelte
<Select bind:value={selectedValue}>
  <option value="option1">Option 1</option>
  <option value="option2">Option 2</option>
  <option value="option3">Option 3</option>
</Select>
```

### Switch

The Switch component is used for toggling options.

```svelte
<Switch bind:checked={isEnabled} />
```

### Toast

The Toast component is used for temporary notifications.

```svelte
<script>
  import { toast } from '$lib/ui/ToastService';

  function showToast() {
    toast({
      title: 'Success',
      description: 'Your action was completed successfully.',
      type: 'success',
      duration: 3000
    });
  }
</script>

<Button on:click={showToast}>Show Toast</Button>
<ToastContainer />
```

## Usage Guidelines

### Component Composition

- Compose complex UIs from simple components
- Maintain consistent spacing between components
- Use container components for layout structure
- Nest components according to their semantic relationship

### Accessibility

- Ensure sufficient color contrast (WCAG AA minimum)
- Provide text alternatives for non-text content
- Ensure keyboard navigability for all interactive elements
- Use appropriate ARIA attributes when necessary
- Test with screen readers

### Responsive Design

- Use the Container component for responsive layouts
- Design for mobile-first, then enhance for larger screens
- Use responsive props where available
- Test on multiple device sizes

### Performance

- Avoid deeply nested component hierarchies
- Use lazy loading for complex components
- Optimize animations for performance
- Consider code splitting for large component libraries

## Design Principles

1. **Consistency**: Use consistent patterns, spacing, and components
2. **Hierarchy**: Create clear visual hierarchy through size, weight, and color
3. **Feedback**: Provide clear feedback for user actions
4. **Accessibility**: Design for all users regardless of abilities
5. **Simplicity**: Keep interfaces simple and intuitive
6. **Performance**: Optimize for speed and responsiveness

By following these guidelines, you'll create interfaces that are consistent, accessible, and user-friendly.
