# Taste Duel Component Documentation

This document provides detailed documentation for the Taste Duel UI components with implementation examples and usage guidelines.

## Overview

The Taste Duel UI component library provides a set of reusable components for building consistent user interfaces. All components are designed with accessibility, theming, and responsiveness in mind.

## Component Categories

### Layout Components

Components that help structure and organize the user interface.

### Typography Components

Components for displaying and styling text content.

### Form Components

Components for user input and interaction.

### Feedback Components

Components for providing feedback and status information to users.

## Component Examples

### Alert

The Alert component displays important messages to users.

```svelte
<script>
  import { Alert } from '$lib/ui';
</script>

<!-- Basic usage -->
<Alert>This is an informational message</Alert>

<!-- With title and variant -->
<Alert title="Success!" variant="success">
  Your preferences have been saved successfully.
</Alert>

<!-- Dismissible alert -->
<Alert
  variant="warning"
  dismissible
  on:dismiss={() => console.log('Alert dismissed')}
>
  Your session will expire in 5 minutes.
</Alert>

<!-- Error alert -->
<Alert variant="error" title="Error">
  Unable to save your preferences. Please try again.
</Alert>
```

### Button

The Button component provides interactive elements for user actions.

```svelte
<script>
  import { Button } from '$lib/ui';

  function handleClick() {
    console.log('Button clicked');
  }
</script>

<!-- Basic usage -->
<Button on:click={handleClick}>Click Me</Button>

<!-- Variants -->
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="accent">Accent</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
<Button variant="success">Success</Button>
<Button variant="warning">Warning</Button>
<Button variant="error">Error</Button>
<Button variant="info">Info</Button>

<!-- Sizes -->
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M5 12h14"></path>
    <path d="M12 5l7 7-7 7"></path>
  </svg>
</Button>

<!-- States -->
<Button disabled>Disabled</Button>
<Button loading>Loading</Button>

<!-- With icons -->
<Button iconLeft="check">With Left Icon</Button>
<Button iconRight="arrow-right">With Right Icon</Button>

<!-- Additional features -->
<Button rounded>Rounded Button</Button>
<Button elevated>Elevated Button</Button>
<Button fullWidth>Full Width Button</Button>
```

### Card

The Card component is used to group related content.

```svelte
<script>
  import { Card, CardHeader, CardContent, CardFooter, Button, Heading, Text } from '$lib/ui';
</script>

<!-- Basic usage -->
<Card>
  <CardHeader>
    <Heading level={3}>Card Title</Heading>
  </CardHeader>

  <CardContent>
    <Text>This is the main content of the card. It can contain any elements.</Text>
    <img src="/example.jpg" alt="Example image" />
  </CardContent>

  <CardFooter>
    <Button variant="outline">Cancel</Button>
    <Button>Save</Button>
  </CardFooter>
</Card>

<!-- Card variants -->
<Card variant="bordered">Bordered Card</Card>
<Card variant="elevated">Elevated Card</Card>
<Card variant="interactive">Interactive Card</Card>

<!-- Card properties -->
<Card hoverable on:click={() => console.log('Card clicked')}>
  <CardContent>
    <Text>This card has a hover effect</Text>
  </CardContent>
</Card>

<Card selected>
  <CardContent>
    <Text>This card is in a selected state</Text>
  </CardContent>
</Card>

<Card padding={false}>
  <img src="/example.jpg" alt="Example image" style="width: 100%;" />
  <div style="padding: 1rem;">
    <Heading level={3}>No Padding Card</Heading>
    <Text>This card has padding disabled for custom layouts</Text>
  </div>
</Card>

<Card shadow="lg">
  <CardContent>
    <Text>This card has a larger shadow</Text>
  </CardContent>
</Card>

<Card rounded="xl">
  <CardContent>
    <Text>This card has extra rounded corners</Text>
  </CardContent>
</Card>

<Card fullWidth>
  <CardContent>
    <Text>This card takes up the full width of its container</Text>
  </CardContent>
</Card>
```

### Dialog

The Dialog component creates modal dialogs for focused user interactions.

```svelte
<script>
  import { Dialog, Button } from '$lib/ui';
  let showDialog = false;
</script>

<Button on:click={() => showDialog = true}>Open Dialog</Button>

<Dialog
  bind:open={showDialog}
  title="Confirmation"
  description="Please confirm your action"
  size="md"
  animation="scale"
  position="center"
  backdropBlur={true}
>
  <p>Are you sure you want to delete this item? This action cannot be undone.</p>

  <svelte:fragment slot="footer">
    <Button variant="outline" on:click={() => showDialog = false}>Cancel</Button>
    <Button variant="accent" on:click={() => {
      // Handle confirmation
      showDialog = false;
    }}>Delete</Button>
  </svelte:fragment>
</Dialog>
```

### Toast

The Toast component displays brief, non-intrusive notifications.

```svelte
<script>
  import { Button, ToastContainer, ToastService } from '$lib/ui';

  function showSuccessToast() {
    ToastService.success({
      title: 'Success!',
      message: 'Operation completed successfully',
      duration: 5000
    });
  }

  function showErrorToast() {
    ToastService.error({
      title: 'Error!',
      message: 'Something went wrong',
      duration: 5000
    });
  }

  function showWarningToast() {
    ToastService.warning({
      title: 'Warning',
      message: 'This action might have consequences',
      duration: 5000
    });
  }

  function showInfoToast() {
    ToastService.info({
      title: 'Information',
      message: 'Here is some useful information',
      duration: 5000
    });
  }

  function showCustomToast() {
    ToastService.add({
      title: 'Custom Toast',
      message: 'This is a custom toast with different position',
      position: 'bottom-center',
      duration: 5000,
      dismissible: true,
      showProgress: true,
      icon: '<svg>...</svg>' // Custom icon
    });
  }
</script>

<!-- Add the ToastContainer component once in your app -->
<ToastContainer limit={5} />

<!-- Trigger toasts with buttons -->
<Button variant="success" on:click={showSuccessToast}>Success Toast</Button>
<Button variant="error" on:click={showErrorToast}>Error Toast</Button>
<Button variant="warning" on:click={showWarningToast}>Warning Toast</Button>
<Button variant="info" on:click={showInfoToast}>Info Toast</Button>
<Button on:click={showCustomToast}>Custom Toast</Button>

<!-- Programmatic usage in any component -->
<script>
  import { ToastService } from '$lib/ui';

  function handleFormSubmit() {
    // Process form...

    if (success) {
      ToastService.success({
        title: 'Form Submitted',
        message: 'Your form has been submitted successfully'
      });
    } else {
      ToastService.error({
        title: 'Submission Failed',
        message: 'Please check your form and try again'
      });
    }
  }
</script>
```

### Switch

The Switch component provides a toggle control for binary settings.

```svelte
<script>
  import { Switch } from '$lib/ui';
  let darkMode = true;
  let notifications = false;
</script>

<!-- Basic usage -->
<Switch bind:checked={darkMode} label="Dark Mode" />

<!-- Different sizes -->
<Switch size="sm" label="Small" />
<Switch size="default" label="Default" />
<Switch size="lg" label="Large" />

<!-- Color variants -->
<Switch color="primary" label="Primary" />
<Switch color="secondary" label="Secondary" />
<Switch color="accent" label="Accent" />

<!-- Label position -->
<Switch label="Label on left" labelPosition="left" />
<Switch label="Label on right" labelPosition="right" />

<!-- Disabled state -->
<Switch label="Disabled" disabled />

<!-- Event handling -->
<Switch
  bind:checked={notifications}
  label="Enable notifications"
  on:change={({ detail }) => console.log('Notifications:', detail.checked)}
/>
```

### Tabs

The Tabs component organizes content into tabbed sections.

```svelte
<script>
  import { Tabs } from '$lib/ui';
  let activeTab = 0;
  const tabItems = ['Account', 'Security', 'Notifications'];
</script>

<Tabs
  items={tabItems}
  bind:activeTab={activeTab}
>
  {#if activeTab === 0}
    <div>
      <h3>Account Settings</h3>
      <p>Manage your account information</p>
      <!-- Account content here -->
    </div>
  {:else if activeTab === 1}
    <div>
      <h3>Security Settings</h3>
      <p>Manage your security preferences</p>
      <!-- Security content here -->
    </div>
  {:else}
    <div>
      <h3>Notification Settings</h3>
      <p>Customize your notification preferences</p>
      <!-- Notification content here -->
    </div>
  {/if}
</Tabs>

<!-- With object items -->
<script>
  const tabsWithIcons = [
    { id: 'account', label: 'Account', icon: 'user' },
    { id: 'security', label: 'Security', icon: 'lock' },
    { id: 'notifications', label: 'Notifications', icon: 'bell' }
  ];
  let activeTabId = 'account';
</script>

<Tabs
  items={tabsWithIcons}
  labelKey="label"
  idKey="id"
  bind:activeTab={activeTabId}
  variant="pills"
/>
```

### Input

The Input component provides text input functionality.

```svelte
<script>
  import { Input, Button } from '$lib/ui';
  let username = '';
  let email = '';
  let password = '';
  let error = '';

  function validateEmail() {
    if (!email.includes('@')) {
      error = 'Please enter a valid email address';
    } else {
      error = '';
    }
  }
</script>

<!-- Basic usage -->
<Input
  label="Username"
  placeholder="Enter your username"
  bind:value={username}
/>

<!-- With error state -->
<Input
  type="email"
  label="Email"
  bind:value={email}
  error={error}
  on:blur={validateEmail}
/>

<!-- With helper text -->
<Input
  type="password"
  label="Password"
  bind:value={password}
  helperText="Password must be at least 8 characters"
/>

<!-- With icon -->
<Input
  label="Search"
  placeholder="Search..."
  icon="<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='11' cy='11' r='8'></circle><line x1='21' y1='21' x2='16.65' y2='16.65'></line></svg>"
/>

<!-- Full width input -->
<Input fullWidth placeholder="Full width input" />

<!-- Different variants -->
<Input variant="outlined" placeholder="Outlined" />
<Input variant="filled" placeholder="Filled" />

<!-- Different sizes -->
<Input size="sm" placeholder="Small" />
<Input size="lg" placeholder="Large" />
```

### Select

The Select component provides a dropdown selection.

```svelte
<script>
  import { Select } from '$lib/ui';

  let selectedLanguage = '';
  const languages = ['JavaScript', 'TypeScript', 'Python', 'Rust', 'Go'];

  let selectedCountry = '';
  const countries = [
    { code: 'us', name: 'United States' },
    { code: 'ca', name: 'Canada' },
    { code: 'uk', name: 'United Kingdom' },
    { code: 'au', name: 'Australia' }
  ];
</script>

<!-- Basic usage with array of strings -->
<Select
  label="Programming Language"
  bind:value={selectedLanguage}
  options={languages}
  placeholder="Select a language"
/>

<!-- With object options -->
<Select
  label="Country"
  bind:value={selectedCountry}
  options={countries}
  valueKey="code"
  labelKey="name"
  placeholder="Select a country"
/>

<!-- With error state -->
<Select
  label="Required Field"
  options={languages}
  error="This field is required"
  required
/>

<!-- Different variants -->
<Select variant="outlined" options={languages} placeholder="Outlined" />
<Select variant="filled" options={languages} placeholder="Filled" />

<!-- Different sizes -->
<Select size="sm" options={languages} placeholder="Small" />
<Select size="lg" options={languages} placeholder="Large" />

<!-- Event handling -->
<Select
  label="On Change Example"
  options={languages}
  on:change={({ detail }) => console.log('Selected:', detail.value)}
/>
```

## Composing Components

Components can be combined to create complex interfaces:

```svelte
<script>
  import { Card, CardHeader, CardContent, CardFooter, Heading, Text, Input, Button, Alert, ToastService } from '$lib/ui';

  let email = '';
  let password = '';
  let error = '';

  function handleSubmit() {
    if (!email || !password) {
      error = 'Please fill in all fields';
      return;
    }

    // Submit logic here
    ToastService.success({
      title: 'Login Successful',
      message: 'Welcome back! Redirecting to dashboard...'
    });

    error = '';
  }
</script>

<Card className="login-card" variant="bordered" shadow="md">
  <CardHeader>
    <Heading level={2}>Login</Heading>
  </CardHeader>

  <CardContent>
    {#if error}
      <Alert variant="error" dismissible on:dismiss={() => error = ''}>
        {error}
      </Alert>
    {/if}

    <form on:submit|preventDefault={handleSubmit}>
      <Input
        label="Email"
        type="email"
        placeholder="Enter your email"
        bind:value={email}
        fullWidth
      />

      <Input
        label="Password"
        type="password"
        placeholder="Enter your password"
        bind:value={password}
        fullWidth
      />
    </form>
  </CardContent>

  <CardFooter>
    <Button variant="outline">Register</Button>
    <Button on:click={handleSubmit} loading={isLoading}>Login</Button>
  </CardFooter>
</Card>

<style>
  :global(.login-card) {
    max-width: 400px;
    margin: 0 auto;
  }
</style>
```

## Design Principles

When using these components, follow these design principles:

1. **Consistency**: Use components consistently throughout your application
2. **Hierarchy**: Establish a clear visual hierarchy with appropriate headings and spacing
3. **Feedback**: Provide clear feedback for user actions
4. **Accessibility**: Ensure all components are accessible to all users

## Component Customization

All components accept a `className` prop for custom styling:

```svelte
<Button className="my-custom-button">Custom Button</Button>

<style>
  :global(.my-custom-button) {
    background-image: linear-gradient(to right, var(--primary-500), var(--secondary-500));
    border-radius: var(--radius-full);
  }
</style>
```

For more detailed styling, use CSS variables from the theme.css file:

```css
/* Override theme variables in your global CSS */
:root {
  --primary-500: #8b5cf6;
  --secondary-500: #6366f1;
  --accent-500: #f43f5e;
  --card-bg: var(--neutral-800);
  --text-color: var(--neutral-50);
}
```

## Best Practices

- Use appropriate feedback components (Alert, Toast, Progress) to keep users informed
- Group related form controls together logically
- Utilize consistent spacing between components
- Provide clear error messages and validation
- Consider keyboard navigation in your component usage
- Test all components in both light and dark themes
- Use the appropriate variant for the context (e.g., success buttons for positive actions)
- Implement loading states for asynchronous operations
- Ensure proper contrast ratios for accessibility
- Use Toast notifications for non-disruptive feedback
