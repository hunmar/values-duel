# Taste Duel UI Usage Patterns

This document outlines common UI patterns and best practices for using the Taste Duel design system components. These patterns ensure consistency, accessibility, and a better user experience across the application.

## Table of Contents

1. [Form Patterns](#form-patterns)
2. [Navigation Patterns](#navigation-patterns)
3. [Feedback Patterns](#feedback-patterns)
4. [Layout Patterns](#layout-patterns)
5. [Data Display Patterns](#data-display-patterns)
6. [Responsive Design Patterns](#responsive-design-patterns)
7. [Accessibility Patterns](#accessibility-patterns)
8. [Component Enhancement Patterns](#component-enhancement-patterns)

## Form Patterns

### Basic Form Layout

Use consistent spacing and alignment for form elements:

```svelte
<form on:submit|preventDefault={handleSubmit}>
  <div class="form-group">
    <Input
      label="Email"
      type="email"
      bind:value={email}
      error={errors.email}
      required
    />
  </div>

  <div class="form-group">
    <Input
      label="Password"
      type="password"
      bind:value={password}
      error={errors.password}
      required
    />
  </div>

  <div class="form-actions">
    <Button type="submit" variant="primary">Submit</Button>
    <Button type="button" variant="outline" on:click={handleCancel}>Cancel</Button>
  </div>
</form>

<style>
  .form-group {
    margin-bottom: var(--space-4);
  }

  .form-actions {
    display: flex;
    gap: var(--space-3);
    margin-top: var(--space-6);
  }
</style>
```

### Form Validation

Always provide clear feedback for form validation:

```svelte
<script>
  import { Input, Button } from '$lib/ui';

  let email = '';
  let password = '';
  let errors = {};

  function validateForm() {
    errors = {};

    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    return Object.keys(errors).length === 0;
  }

  function handleSubmit() {
    if (validateForm()) {
      // Submit form
    }
  }
</script>
```

### Multi-Step Forms

For complex forms, use a multi-step approach with progress indication:

```svelte
<script>
  import { Progress, Button, Card, CardContent } from '$lib/ui';

  let currentStep = 1;
  const totalSteps = 3;

  function nextStep() {
    if (currentStep < totalSteps) {
      currentStep++;
    }
  }

  function prevStep() {
    if (currentStep > 1) {
      currentStep--;
    }
  }
</script>

<Card>
  <CardContent>
    <Progress value={currentStep} max={totalSteps} />

    {#if currentStep === 1}
      <!-- Step 1 content -->
      <h2>Personal Information</h2>
      <!-- Form fields -->
    {:else if currentStep === 2}
      <!-- Step 2 content -->
      <h2>Account Details</h2>
      <!-- Form fields -->
    {:else}
      <!-- Step 3 content -->
      <h2>Preferences</h2>
      <!-- Form fields -->
    {/if}

    <div class="form-navigation">
      {#if currentStep > 1}
        <Button on:click={prevStep}>Previous</Button>
      {/if}

      {#if currentStep < totalSteps}
        <Button variant="primary" on:click={nextStep}>Next</Button>
      {:else}
        <Button variant="success" on:click={handleSubmit}>Submit</Button>
      {/if}
    </div>
  </CardContent>
</Card>
```

## Navigation Patterns

### Main Navigation

Use consistent navigation patterns across the application:

```svelte
<script>
  import { Tabs } from '$lib/ui';

  const navItems = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'explore', label: 'Explore', icon: 'search' },
    { id: 'favorites', label: 'Favorites', icon: 'heart' },
    { id: 'settings', label: 'Settings', icon: 'settings' }
  ];

  let activeTab = 'home';
</script>

<Tabs
  items={navItems}
  bind:activeTab
  labelKey="label"
  idKey="id"
  fullWidth
/>

<div class="content">
  {#if activeTab === 'home'}
    <!-- Home content -->
  {:else if activeTab === 'explore'}
    <!-- Explore content -->
  {:else if activeTab === 'favorites'}
    <!-- Favorites content -->
  {:else}
    <!-- Settings content -->
  {/if}
</div>
```

### Drawer Navigation for Mobile

Use a drawer for navigation on mobile devices:

```svelte
<script>
  import { Button, Drawer } from '$lib/ui';

  let isDrawerOpen = false;
</script>

<Button
  variant="ghost"
  on:click={() => isDrawerOpen = true}
  aria-label="Open menu"
>
  <!-- Menu icon -->
</Button>

<Drawer bind:open={isDrawerOpen} position="left">
  <div slot="header">
    <h2>Menu</h2>
  </div>

  <nav>
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/explore">Explore</a></li>
      <li><a href="/favorites">Favorites</a></li>
      <li><a href="/settings">Settings</a></li>
    </ul>
  </nav>
</Drawer>
```

### Breadcrumbs for Deep Navigation

Use breadcrumbs for deep navigation structures:

```svelte
<nav aria-label="Breadcrumb">
  <ol class="breadcrumbs">
    <li><a href="/">Home</a></li>
    <li><a href="/categories">Categories</a></li>
    <li><a href="/categories/food">Food</a></li>
    <li aria-current="page">Italian</li>
  </ol>
</nav>

<style>
  .breadcrumbs {
    display: flex;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .breadcrumbs li {
    display: flex;
    align-items: center;
  }

  .breadcrumbs li:not(:last-child)::after {
    content: "/";
    margin: 0 var(--space-2);
    color: var(--gray-400);
  }

  .breadcrumbs a {
    color: var(--primary-600);
    text-decoration: none;
  }

  .breadcrumbs a:hover {
    text-decoration: underline;
  }

  .breadcrumbs [aria-current="page"] {
    color: var(--gray-700);
    font-weight: var(--font-weight-medium);
  }
</style>
```

## Feedback Patterns

### Toast Notifications

Use toast notifications for non-intrusive feedback:

```svelte
<script>
  import { Button, ToastContainer, ToastService } from '$lib/ui';

  function showSuccessToast() {
    ToastService.success({
      title: 'Success',
      message: 'Your changes have been saved.'
    });
  }

  function showErrorToast() {
    ToastService.error({
      title: 'Error',
      message: 'Failed to save changes. Please try again.'
    });
  }

  function showLoadingToast() {
    const toast = ToastService.loading({
      title: 'Saving',
      message: 'Please wait while we save your changes...'
    });

    // Simulate API call
    setTimeout(() => {
      toast.success({
        title: 'Saved',
        message: 'Your changes have been saved successfully.'
      });
    }, 2000);
  }
</script>

<ToastContainer />

<div class="buttons">
  <Button on:click={showSuccessToast}>Show Success</Button>
  <Button on:click={showErrorToast}>Show Error</Button>
  <Button on:click={showLoadingToast}>Show Loading</Button>
</div>
```

### Confirmation Dialogs

Use dialogs for important confirmations:

```svelte
<script>
  import { Button, Dialog } from '$lib/ui';

  let showConfirmation = false;
  let itemToDelete = null;

  function confirmDelete(item) {
    itemToDelete = item;
    showConfirmation = true;
  }

  function handleDelete() {
    // Delete the item
    console.log(`Deleting item: ${itemToDelete.id}`);
    showConfirmation = false;
    itemToDelete = null;

    // Show success toast
    ToastService.success({
      message: 'Item deleted successfully'
    });
  }
</script>

<Button
  variant="error"
  on:click={() => confirmDelete({ id: 123, name: 'Example Item' })}
>
  Delete Item
</Button>

<Dialog
  bind:open={showConfirmation}
  title="Confirm Deletion"
  description="Are you sure you want to delete this item? This action cannot be undone."
>
  {#if itemToDelete}
    <p>You are about to delete: <strong>{itemToDelete.name}</strong></p>
  {/if}

  <svelte:fragment slot="footer">
    <Button variant="outline" on:click={() => showConfirmation = false}>
      Cancel
    </Button>
    <Button variant="error" on:click={handleDelete}>
      Delete
    </Button>
  </svelte:fragment>
</Dialog>
```

### Loading States

Always provide feedback during loading operations:

```svelte
<script>
  import { Button, Card, CardContent } from '$lib/ui';

  let isLoading = false;
  let data = null;
  let error = null;

  async function fetchData() {
    isLoading = true;
    error = null;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      data = { name: 'Example Data', value: 42 };
    } catch (err) {
      error = 'Failed to load data. Please try again.';
    } finally {
      isLoading = false;
    }
  }
</script>

<Card>
  <CardContent>
    <Button
      on:click={fetchData}
      loading={isLoading}
      disabled={isLoading}
    >
      Load Data
    </Button>

    {#if isLoading}
      <div class="loading-indicator">Loading...</div>
    {:else if error}
      <div class="error-message">{error}</div>
    {:else if data}
      <div class="data-display">
        <h3>{data.name}</h3>
        <p>Value: {data.value}</p>
      </div>
    {/if}
  </CardContent>
</Card>
```

## Layout Patterns

### Card Grid Layout

Use a responsive card grid for displaying collections:

```svelte
<div class="card-grid">
  {#each items as item}
    <Card hoverable>
      <CardContent>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </CardContent>
    </Card>
  {/each}
</div>

<style>
  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--space-4);
  }
</style>
```

### Two-Column Layout

Use a two-column layout for forms with descriptions:

```svelte
<div class="two-column-layout">
  <div class="description-column">
    <h2>Account Settings</h2>
    <p>Update your account information and preferences.</p>
  </div>

  <div class="form-column">
    <Card>
      <CardContent>
        <!-- Form content -->
      </CardContent>
    </Card>
  </div>
</div>

<style>
  .two-column-layout {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: var(--space-8);
  }

  @media (max-width: 768px) {
    .two-column-layout {
      grid-template-columns: 1fr;
    }
  }
</style>
```

### Sticky Header and Footer

Use sticky headers and footers for better navigation:

```svelte
<div class="app-layout">
  <header class="app-header">
    <!-- Header content -->
  </header>

  <main class="app-content">
    <!-- Main content -->
  </main>

  <footer class="app-footer">
    <!-- Footer content -->
  </footer>
</div>

<style>
  .app-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .app-header {
    position: sticky;
    top: 0;
    z-index: 10;
    background-color: var(--background);
    border-bottom: 1px solid var(--border-color);
  }

  .app-content {
    flex: 1;
    padding: var(--space-4);
  }

  .app-footer {
    background-color: var(--background-alt);
    border-top: 1px solid var(--border-color);
    padding: var(--space-4);
  }
</style>
```

## Data Display Patterns

### Data Tables

Use tables for structured data display:

```svelte
<script>
  import { Button, Badge } from '$lib/ui';

  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'pending' }
  ];

  function getStatusVariant(status) {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  }
</script>

<div class="table-container">
  <table class="data-table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Email</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {#each users as user}
        <tr>
          <td>{user.id}</td>
          <td>{user.name}</td>
          <td>{user.email}</td>
          <td>
            <Badge variant={getStatusVariant(user.status)}>
              {user.status}
            </Badge>
          </td>
          <td>
            <div class="action-buttons">
              <Button size="sm" variant="outline">Edit</Button>
              <Button size="sm" variant="error">Delete</Button>
            </div>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .table-container {
    overflow-x: auto;
  }

  .data-table {
    width: 100%;
    border-collapse: collapse;
  }

  .data-table th,
  .data-table td {
    padding: var(--space-3);
    text-align: left;
    border-bottom: 1px solid var(--border-color);
  }

  .data-table th {
    font-weight: var(--font-weight-semibold);
    background-color: var(--background-alt);
  }

  .action-buttons {
    display: flex;
    gap: var(--space-2);
  }
</style>
```

### Empty States

Always provide meaningful empty states:

```svelte
<script>
  import { Button, Card, CardContent } from '$lib/ui';

  let items = [];
  let isLoading = false;

  function loadItems() {
    isLoading = true;
    // Simulate API call
    setTimeout(() => {
      items = [{ id: 1, name: 'Item 1' }];
      isLoading = false;
    }, 1000);
  }
</script>

<Card>
  <CardContent>
    {#if isLoading}
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Loading items...</p>
      </div>
    {:else if items.length === 0}
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>No items found</h3>
        <p>You haven't added any items yet.</p>
        <Button on:click={loadItems}>Add Your First Item</Button>
      </div>
    {:else}
      <ul class="item-list">
        {#each items as item}
          <li>{item.name}</li>
        {/each}
      </ul>
    {/if}
  </CardContent>
</Card>

<style>
  .loading-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-8);
    text-align: center;
  }

  .empty-icon {
    font-size: 3rem;
    margin-bottom: var(--space-4);
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top-color: var(--primary-500);
    animation: spin 1s linear infinite;
    margin-bottom: var(--space-4);
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .item-list {
    list-style: none;
    padding: 0;
  }

  .item-list li {
    padding: var(--space-3);
    border-bottom: 1px solid var(--border-color);
  }

  .item-list li:last-child {
    border-bottom: none;
  }
</style>
```

### Pagination

Use pagination for large data sets:

```svelte
<script>
  import { Button } from '$lib/ui';

  // Pagination state
  let currentPage = 1;
  let totalPages = 10;
  let itemsPerPage = 10;
  let totalItems = 100;

  // Calculate visible page numbers
  $: visiblePages = getVisiblePages(currentPage, totalPages);

  function getVisiblePages(current, total) {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }

    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }

    return [1, '...', current - 1, current, current + 1, '...', total];
  }

  function goToPage(page) {
    if (typeof page === 'number' && page >= 1 && page <= totalPages) {
      currentPage = page;
      // Fetch data for the new page
    }
  }

  function prevPage() {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }

  function nextPage() {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }
</script>

<div class="pagination-info">
  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
</div>

<div class="pagination">
  <Button
    variant="outline"
    size="sm"
    on:click={prevPage}
    disabled={currentPage === 1}
  >
    Previous
  </Button>

  <div class="page-numbers">
    {#each visiblePages as page}
      {#if page === '...'}
        <span class="ellipsis">...</span>
      {:else}
        <button
          class="page-number {page === currentPage ? 'active' : ''}"
          on:click={() => goToPage(page)}
          disabled={page === currentPage}
        >
          {page}
        </button>
      {/if}
    {/each}
  </div>

  <Button
    variant="outline"
    size="sm"
    on:click={nextPage}
    disabled={currentPage === totalPages}
  >
    Next
  </Button>
</div>

<style>
  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: var(--space-6);
    gap: var(--space-2);
  }

  .pagination-info {
    text-align: center;
    margin-bottom: var(--space-4);
    font-size: var(--font-size-sm);
    color: var(--text-muted);
  }

  .page-numbers {
    display: flex;
    align-items: center;
    gap: var(--space-1);
  }

  .page-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);
    background: none;
    cursor: pointer;
    font-size: var(--font-size-sm);
  }

  .page-number.active {
    background-color: var(--primary-500);
    color: white;
    border-color: var(--primary-500);
  }

  .ellipsis {
    width: 32px;
    text-align: center;
  }
</style>
```

## Responsive Design Patterns

### Mobile-First Approach

Always design with a mobile-first approach:

```svelte
<div class="responsive-container">
  <div class="content">
    <!-- Content here -->
  </div>
  <aside class="sidebar">
    <!-- Sidebar content -->
  </aside>
</div>

<style>
  .responsive-container {
    display: flex;
    flex-direction: column;
  }

  .sidebar {
    margin-top: var(--space-4);
  }

  /* Tablet and above */
  @media (min-width: 768px) {
    .responsive-container {
      flex-direction: row;
      gap: var(--space-6);
    }

    .content {
      flex: 1;
    }

    .sidebar {
      width: 300px;
      margin-top: 0;
    }
  }

  /* Desktop */
  @media (min-width: 1024px) {
    .sidebar {
      width: 350px;
    }
  }
</style>
```

### Responsive Typography

Use responsive typography for better readability:

```svelte
<style>
  :global(:root) {
    --font-size-base: 16px;
    --line-height-base: 1.5;
  }

  /* Mobile typography */
  h1 {
    font-size: 1.75rem;
    line-height: 1.2;
  }

  h2 {
    font-size: 1.5rem;
    line-height: 1.3;
  }

  p {
    font-size: 1rem;
    line-height: var(--line-height-base);
  }

  /* Tablet typography */
  @media (min-width: 768px) {
    h1 {
      font-size: 2.25rem;
    }

    h2 {
      font-size: 1.75rem;
    }
  }

  /* Desktop typography */
  @media (min-width: 1024px) {
    h1 {
      font-size: 2.5rem;
    }

    h2 {
      font-size: 2rem;
    }

    p {
      font-size: 1.125rem;
    }
  }
</style>
```

### Responsive Navigation

Adapt navigation for different screen sizes:

```svelte
<script>
  import { Button, Drawer } from '$lib/ui';

  let isDrawerOpen = false;
  let isMobile = false;

  // Check if mobile on mount and when window resizes
  function checkMobile() {
    isMobile = window.innerWidth < 768;
  }

  onMount(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  });
</script>

{#if isMobile}
  <Button
    variant="ghost"
    on:click={() => isDrawerOpen = true}
    aria-label="Open menu"
  >
    Menu
  </Button>

  <Drawer bind:open={isDrawerOpen} position="left">
    <nav>
      <!-- Mobile navigation -->
    </nav>
  </Drawer>
{:else}
  <nav class="desktop-nav">
    <!-- Desktop navigation -->
  </nav>
{/if}
```

## Accessibility Patterns

### Focus Management

Ensure proper focus management for keyboard users:

```svelte
<script>
  import { onMount } from 'svelte';
  import { Button, Dialog } from '$lib/ui';

  let dialogOpen = false;
  let previousFocus;

  function openDialog() {
    previousFocus = document.activeElement;
    dialogOpen = true;
  }

  function closeDialog() {
    dialogOpen = false;
    // Return focus to the element that opened the dialog
    setTimeout(() => {
      if (previousFocus) {
        previousFocus.focus();
      }
    }, 0);
  }

  // Trap focus within the dialog when open
  function handleKeydown(event) {
    if (!dialogOpen || event.key !== 'Tab') return;

    const dialog = document.querySelector('.dialog-content');
    const focusableElements = dialog.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      lastElement.focus();
      event.preventDefault();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      firstElement.focus();
      event.preventDefault();
    }
  }
</script>

<Button on:click={openDialog}>Open Dialog</Button>

<Dialog bind:open={dialogOpen} on:close={closeDialog}>
  <div class="dialog-content" on:keydown={handleKeydown}>
    <!-- Dialog content -->
    <Button on:click={closeDialog}>Close</Button>
  </div>
</Dialog>
```

### Semantic HTML

Use semantic HTML elements for better accessibility:

```svelte
<article class="blog-post">
  <header>
    <h1>Blog Post Title</h1>
    <p>
      <time datetime="2023-04-01">April 1, 2023</time>
      by <a href="/authors/john">John Doe</a>
    </p>
  </header>

  <section class="post-content">
    <p>First paragraph of content...</p>

    <h2>Section Heading</h2>
    <p>More content...</p>
  </section>

  <footer>
    <h2>Related Posts</h2>
    <ul>
      <li><a href="/post-1">Related Post 1</a></li>
      <li><a href="/post-2">Related Post 2</a></li>
    </ul>
  </footer>
</article>
```

### ARIA Attributes

Use ARIA attributes to enhance accessibility:

```svelte
<script>
  let expanded = false;

  function toggleContent() {
    expanded = !expanded;
  }
</script>

<div class="accordion">
  <button
    class="accordion-header"
    on:click={toggleContent}
    aria-expanded={expanded}
    aria-controls="accordion-content"
  >
    <span>Section Title</span>
    <span class="icon">{expanded ? '−' : '+'}</span>
  </button>

  <div
    id="accordion-content"
    class="accordion-content"
    aria-hidden={!expanded}
    style="display: {expanded ? 'block' : 'none'}"
  >
    <p>Accordion content goes here...</p>
  </div>
</div>
```

### Color Contrast

Ensure sufficient color contrast for all text:

```svelte
<style>
  /* Good contrast examples */
  .primary-button {
    background-color: var(--primary-600);
    color: white; /* High contrast against dark background */
  }

  .secondary-button {
    background-color: white;
    color: var(--gray-800); /* Dark text on light background */
    border: 1px solid var(--gray-300);
  }

  .info-text {
    color: var(--gray-700); /* Not using light gray that would have poor contrast */
  }

  /* For links within text */
  p a {
    color: var(--primary-700); /* Darker shade for better contrast */
    text-decoration: underline; /* Additional visual cue beyond color */
  }
</style>
```

## Component Enhancement Patterns

### Card Component Enhancements

Use the Card component with appropriate variants for different contexts:

```svelte
<!-- Standard Card -->
<Card variant="elevated" shadow="md" rounded="lg">
  <CardContent>
    <h3>Standard Card</h3>
    <p>This is a standard card with medium shadow and large border radius.</p>
