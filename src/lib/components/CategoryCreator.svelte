<script lang="ts">
  import { FOOD_CATEGORIES, getCategoryColor } from '../stores/foodItems.js';
  import { Button, Input, Select, Text, Heading } from '../ui';

  // Props
  export let onAddCategory = (categoryType, categoryName) => {};
  export let onClose = () => {};

  // Local state
  let selectedCategoryType = 'CUISINE';
  let newCategoryName = '';
  let error = '';
  let success = '';

  // Category type options for the select dropdown
  const categoryTypeOptions = [
    { value: 'CUISINE', label: 'Cuisine' },
    { value: 'TYPE', label: 'Food Type' },
    { value: 'DIETARY', label: 'Dietary Preference' },
    { value: 'INGREDIENT', label: 'Main Ingredient' },
    { value: 'COOKING_METHOD', label: 'Cooking Method' }
  ];

  // Handle form submission
  function handleSubmit() {
    // Reset messages
    error = '';
    success = '';

    // Validate input
    if (!newCategoryName.trim()) {
      error = 'Please enter a category name';
      return;
    }

    // Check if category already exists
    const categoryExists = Object.values(FOOD_CATEGORIES[selectedCategoryType] || {})
      .some(category => category.toLowerCase() === newCategoryName.toLowerCase());

    if (categoryExists) {
      error = `A ${selectedCategoryType.toLowerCase()} category with this name already exists`;
      return;
    }

    // Add the category
    const result = onAddCategory(selectedCategoryType, newCategoryName);

    if (result === false) {
      error = 'Failed to add category. Please try again.';
    } else {
      success = `Added "${newCategoryName}" to ${categoryTypeOptions.find(opt => opt.value === selectedCategoryType)?.label} categories`;
      newCategoryName = ''; // Reset input

      // Auto-close after a delay
      setTimeout(() => {
        if (success) {
          onClose();
        }
      }, 1500);
    }
  }

  // Preview the category color
  $: previewColor = getCategoryColor(newCategoryName || 'Preview');
</script>

<div class="category-creator">
  <div class="header">
    <Heading level={3} size="h4">Create Custom Category</Heading>
    <Button variant="ghost" size="sm" on:click={onClose}>✕</Button>
  </div>

  <div class="form">
    <div class="form-group">
      <label for="category-type">Category Type</label>
      <Select
        id="category-type"
        bind:value={selectedCategoryType}
        options={categoryTypeOptions}
      />
    </div>

    <div class="form-group">
      <label for="category-name">Category Name</label>
      <Input
        id="category-name"
        placeholder="Enter a new category name"
        bind:value={newCategoryName}
      />
    </div>

    {#if newCategoryName}
      <div class="preview">
        <Text size="sm">Preview:</Text>
        <div class="category-chip" style="background-color: {previewColor}">
          {newCategoryName}
        </div>
      </div>
    {/if}

    {#if error}
      <div class="error-message">
        <Text size="sm" className="error">{error}</Text>
      </div>
    {/if}

    {#if success}
      <div class="success-message">
        <Text size="sm" className="success">{success}</Text>
      </div>
    {/if}

    <div class="actions">
      <Button variant="outline" on:click={onClose}>Cancel</Button>
      <Button variant="default" on:click={handleSubmit}>Add Category</Button>
    </div>
  </div>
</div>

<style>
  .category-creator {
    padding: 1.5rem;
    max-width: 400px;
    margin: 0 auto;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  label {
    font-size: 0.875rem;
    font-weight: 500;
  }

  .preview {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .category-chip {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.8rem;
    color: white;
    font-weight: 600;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    max-width: fit-content;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 1rem;
  }

  :global(.error) {
    color: var(--accent-color);
  }

  :global(.success) {
    color: var(--success-color, #10b981);
  }

  .error-message, .success-message {
    padding: 0.5rem 0;
  }
</style>
