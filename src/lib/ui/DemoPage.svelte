<script>
  import { onMount } from 'svelte';
  import Button from './Button.svelte';
  import Card from './Card.svelte';
  import CardHeader from './CardHeader.svelte';
  import CardContent from './CardContent.svelte';
  import CardFooter from './CardFooter.svelte';
  import Dialog from './Dialog.svelte';
  import ToastContainer from './ToastContainer.svelte';
  import Heading from './Heading.svelte';
  import Text from './Text.svelte';

  // State for demos
  let dialogOpen = false;
  let dialogPosition = 'center';
  let dialogAnimation = 'scale';

  // Function to show toast notifications
  function showToast(type) {
    if (typeof window !== 'undefined' && window.ToastService) {
      const toastOptions = {
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Toast`,
        message: `This is a ${type} toast notification example.`,
        duration: 5000
      };

      switch (type) {
        case 'success':
          window.ToastService.success(toastOptions);
          break;
        case 'error':
          window.ToastService.error(toastOptions);
          break;
        case 'warning':
          window.ToastService.warning(toastOptions);
          break;
        case 'info':
          window.ToastService.info(toastOptions);
          break;
        default:
          window.ToastService.show(toastOptions);
      }
    }
  }

  // Icons for button demos
  const plusIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
  const arrowIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`;

  // Loading state for button demo
  let isLoading = false;

  function simulateLoading() {
    isLoading = true;
    setTimeout(() => {
      isLoading = false;
      showToast('success');
    }, 2000);
  }

  // Dialog demo functions
  function openDialog(position = 'center', animation = 'scale') {
    dialogPosition = position;
    dialogAnimation = animation;
    dialogOpen = true;
  }
</script>

<div class="demo-page">
  <header class="demo-header">
    <Heading level={1}>Taste Duel Design System</Heading>
    <Text>A showcase of enhanced UI components with improved accessibility and features</Text>
  </header>

  <section class="demo-section">
    <Heading level={2}>Button Component</Heading>
    <Text>Enhanced with loading states and icon support</Text>

    <div class="demo-grid">
      <Card>
        <CardHeader>
          <Heading level={3}>Button Variants</Heading>
        </CardHeader>
        <CardContent>
          <div class="button-grid">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="accent">Accent</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="success">Success</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="error">Error</Button>
            <Button variant="info">Info</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Heading level={3}>Button Sizes</Heading>
        </CardHeader>
        <CardContent>
          <div class="button-row">
            <Button size="sm">Small</Button>
            <Button>Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">{@html plusIcon}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Heading level={3}>Button with Icons</Heading>
        </CardHeader>
        <CardContent>
          <div class="button-row">
            <Button iconLeft={plusIcon}>Add Item</Button>
            <Button iconRight={arrowIcon}>Next Step</Button>
            <Button variant="outline" iconLeft={plusIcon} iconRight={arrowIcon}>Both Icons</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Heading level={3}>Loading State</Heading>
        </CardHeader>
        <CardContent>
          <div class="button-row">
            <Button loading={true}>Loading...</Button>
            <Button variant="secondary" loading={isLoading} on:click={simulateLoading}>
              {isLoading ? 'Processing...' : 'Click to Load'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Heading level={3}>Special Styles</Heading>
        </CardHeader>
        <CardContent>
          <div class="button-row">
            <Button fullWidth>Full Width</Button>
            <Button rounded>Rounded</Button>
            <Button elevated>Elevated</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </section>

  <section class="demo-section">
    <Heading level={2}>Card Component</Heading>
    <Text>Enhanced with new variants: bordered, elevated, and interactive</Text>

    <div class="card-grid">
      <Card variant="default">
        <CardHeader>
          <Heading level={3}>Default Card</Heading>
        </CardHeader>
        <CardContent>
          <Text>This is the standard card with default styling.</Text>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm">Cancel</Button>
          <Button size="sm">Save</Button>
        </CardFooter>
      </Card>

      <Card variant="bordered">
        <CardHeader>
          <Heading level={3}>Bordered Card</Heading>
        </CardHeader>
        <CardContent>
          <Text>This card has a more prominent border for emphasis.</Text>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm">Cancel</Button>
          <Button size="sm">Save</Button>
        </CardFooter>
      </Card>

      <Card variant="elevated" shadow="lg">
        <CardHeader>
          <Heading level={3}>Elevated Card</Heading>
        </CardHeader>
        <CardContent>
          <Text>This card has enhanced elevation with a larger shadow.</Text>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm">Cancel</Button>
          <Button size="sm">Save</Button>
        </CardFooter>
      </Card>

      <Card variant="interactive">
        <CardHeader>
          <Heading level={3}>Interactive Card</Heading>
        </CardHeader>
        <CardContent>
          <Text>This card has hover and active states for interactive elements.</Text>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm">Cancel</Button>
          <Button size="sm">Save</Button>
        </CardFooter>
      </Card>

      <Card hoverable selected>
        <CardHeader>
          <Heading level={3}>Selected Card</Heading>
        </CardHeader>
        <CardContent>
          <Text>This card is hoverable and currently selected.</Text>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm">Cancel</Button>
          <Button size="sm">Save</Button>
        </CardFooter>
      </Card>
    </div>
  </section>

  <section class="demo-section">
    <Heading level={2}>Dialog Component</Heading>
    <Text>Enhanced with better animation and positioning options</Text>

    <div class="demo-grid">
      <Card>
        <CardHeader>
          <Heading level={3}>Dialog Positions</Heading>
        </CardHeader>
        <CardContent>
          <div class="button-grid">
            <Button on:click={() => openDialog('center')}>Center</Button>
            <Button on:click={() => openDialog('top')}>Top</Button>
            <Button on:click={() => openDialog('right')}>Right</Button>
            <Button on:click={() => openDialog('bottom')}>Bottom</Button>
            <Button on:click={() => openDialog('left')}>Left</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Heading level={3}>Dialog Animations</Heading>
        </CardHeader>
        <CardContent>
          <div class="button-grid">
            <Button on:click={() => openDialog('center', 'scale')}>Scale</Button>
            <Button on:click={() => openDialog('center', 'fade')}>Fade</Button>
            <Button on:click={() => openDialog('center', 'fly')}>Fly</Button>
            <Button on:click={() => openDialog('center', 'slide')}>Slide</Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <Dialog
      bind:open={dialogOpen}
      title="Dialog Example"
      description="This dialog demonstrates the enhanced animation and positioning options."
      position={dialogPosition}
      animation={dialogAnimation}
    >
      <div class="dialog-demo-content">
        <Text>This dialog is positioned at the <strong>{dialogPosition}</strong> with <strong>{dialogAnimation}</strong> animation.</Text>
        <Text>You can customize dialogs with different positions and animations to suit your needs.</Text>
      </div>

      <svelte:fragment slot="footer">
        <Button variant="outline" on:click={() => dialogOpen = false}>Close</Button>
        <Button on:click={() => { dialogOpen = false; showToast('success'); }}>Save Changes</Button>
      </svelte:fragment>
    </Dialog>
  </section>

  <section class="demo-section">
    <Heading level={2}>Toast Notifications</Heading>
    <Text>New component for system messages and notifications</Text>

    <Card>
      <CardHeader>
        <Heading level={3}>Toast Variants</Heading>
      </CardHeader>
      <CardContent>
        <div class="button-grid">
          <Button variant="default" on:click={() => showToast('default')}>Default Toast</Button>
          <Button variant="success" on:click={() => showToast('success')}>Success Toast</Button>
          <Button variant="error" on:click={() => showToast('error')}>Error Toast</Button>
          <Button variant="warning" on:click={() => showToast('warning')}>Warning Toast</Button>
          <Button variant="info" on:click={() => showToast('info')}>Info Toast</Button>
        </div>
      </CardContent>
    </Card>
  </section>
</div>

<!-- Toast container for notifications -->
<ToastContainer />

<style>
  .demo-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--space-6);
  }

  .demo-header {
    margin-bottom: var(--space-10);
    text-align: center;
  }

  .demo-section {
    margin-bottom: var(--space-16);
  }

  .demo-section :global(h2) {
    margin-bottom: var(--space-2);
  }

  .demo-section :global(p) {
    margin-bottom: var(--space-6);
    color: var(--text-muted);
  }

  .demo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--space-6);
    margin-bottom: var(--space-8);
  }

  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--space-6);
  }

  .button-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: var(--space-3);
  }

  .button-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    align-items: center;
  }

  .dialog-demo-content {
    min-height: 150px;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .demo-page {
      padding: var(--space-4);
    }

    .demo-grid,
    .card-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
