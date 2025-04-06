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

<!-- Sizes -->
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>

<!-- States -->
<Button disabled>Disabled</Button>
<Button loading>Loading</Button>

<!-- With icon -->
<Button>
  <svg slot="icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M5 12h14"></path>
    <path d="M12 5l7 7-7 7"></path>
  </svg>
  Next
</Button>
```

### Card

The Card component is used to group related content.

```svelte
<script>
  import { Card, CardHeader, CardContent, CardFooter, Button, Heading, Text } from '$lib/ui';
</script>

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

<!-- Hoverable card -->
<Card hoverable on:click={() => console.log('Card clicked')}>
  <CardContent>
    <Text>This card has a hover effect</Text>
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
  import { Card, CardHeader, CardContent, CardFooter, Heading, Text, Input, Button, Alert } from '$lib/ui';
  
  let email = '';
  let password = '';
  let error = '';
  let success = false;
  
  function handleSubmit() {
    if (!email || !password) {
      error = 'Please fill in all fields';
      success = false;
      return;
    }
    
    // Submit logic here
    success = true;
    error = '';
  }
</script>

<Card className="login-card">
  <CardHeader>
    <Heading level={2}>Login</Heading>
  </CardHeader>
  
  <CardContent>
    {#if error}
      <Alert variant="error" dismissible on:dismiss={() => error = ''}>
        {error}
      </Alert>
    {/if}
    
    {#if success}
      <Alert variant="success">
        Login successful! Redirecting...
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
    <Button on:click={handleSubmit}>Login</Button>
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
    background-image: linear-gradient(to right, var(--primary-color), var(--secondary-color));
    border-radius: 9999px;
  }
</style>
```

For more detailed styling, use CSS variables in your global styles:

```css
:root {
  --primary-color: #8b5cf6;
  --primary-hover: #a78bfa;
  --card-bg: #1f2937;
}
```

## Best Practices

- Use appropriate feedback components (Alert, Progress) to keep users informed
- Group related form controls together logically
- Utilize consistent spacing between components
- Provide clear error messages and validation
- Consider keyboard navigation in your component usage
- Test all components in both light and dark themes