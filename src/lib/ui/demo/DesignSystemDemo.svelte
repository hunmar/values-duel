<script>
  import {
    Alert,
    Badge,
    Button,
    Card,
    CardHeader,
    CardContent,
    CardFooter,
    Container,
    Dialog,
    Heading,
    Input,
    Progress,
    Select,
    Switch,
    Tabs,
    Text,
    Toast,
    ToastContainer,
    Tooltip
  } from '$lib/ui';

  // Theme state
  let currentTheme = 'dark';
  function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
  }

  // Dialog state
  let showDialog = false;

  // Toast demo functions
  function showDefaultToast() {
    window.ToastService?.show({
      title: 'Notification',
      message: 'This is a default notification',
      duration: 5000
    });
  }

  function showSuccessToast() {
    window.ToastService?.success({
      title: 'Success',
      message: 'Operation completed successfully',
      duration: 5000
    });
  }

  function showErrorToast() {
    window.ToastService?.error({
      title: 'Error',
      message: 'Something went wrong',
      duration: 5000
    });
  }

  function showWarningToast() {
    window.ToastService?.warning({
      title: 'Warning',
      message: 'This action might have consequences',
      duration: 5000
    });
  }

  function showInfoToast() {
    window.ToastService?.info({
      title: 'Information',
      message: 'Here is some useful information',
      duration: 5000
    });
  }

  // Button demo state
  let isLoading = false;
  function simulateLoading() {
    isLoading = true;
    setTimeout(() => {
      isLoading = false;
      showSuccessToast();
    }, 2000);
  }

  // Card variants
  const cardVariants = ['default', 'bordered', 'elevated', 'interactive'];

  // Tabs demo
  let activeTab = 0;
  const tabItems = ['Overview', 'Features', 'Documentation'];

  // Form demo
  let username = '';
  let email = '';
  let password = '';
  let country = '';
  let notifications = false;

  const countries = [
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'au', label: 'Australia' },
    { value: 'jp', label: 'Japan' }
  ];

  function handleSubmit() {
    showSuccessToast();
  }
</script>

<div class="design-system-demo">
  <ToastContainer />

  <header class="demo-header">
    <div class="demo-header-content">
      <Heading level={1}>Taste Duel Design System</Heading>
      <div class="theme-toggle">
        <Button variant="ghost" on:click={toggleTheme}>
          {#if currentTheme === 'dark'}
            <span>☀️ Light Mode</span>
          {:else}
            <span>🌙 Dark Mode</span>
          {/if}
        </Button>
      </div>
    </div>
  </header>

  <Container size="lg">
    <section class="demo-section">
      <Heading level={2}>Toast Notifications</Heading>
      <Text>Toast notifications provide feedback about operations.</Text>

      <div class="demo-row">
        <Button on:click={showDefaultToast}>Default Toast</Button>
        <Button variant="success" on:click={showSuccessToast}>Success Toast</Button>
        <Button variant="error" on:click={showErrorToast}>Error Toast</Button>
        <Button variant="warning" on:click={showWarningToast}>Warning Toast</Button>
        <Button variant="info" on:click={showInfoToast}>Info Toast</Button>
      </div>
    </section>

    <section class="demo-section">
      <Heading level={2}>Enhanced Button Component</Heading>
      <Text>Buttons with loading states and icon support.</Text>

      <div class="demo-row">
        <Button variant="primary" loading={isLoading} on:click={simulateLoading}>
          {isLoading ? 'Loading...' : 'Click to Load'}
        </Button>

        <Button variant="outline" iconLeft="👍">
          With Left Icon
        </Button>

        <Button variant="secondary" iconRight="→">
          With Right Icon
        </Button>

        <Button variant="ghost" size="icon">
          <span style="font-size: 1.2rem;">🔍</span>
        </Button>
      </div>

      <div class="demo-row">
        <Button variant="default">Default</Button>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="accent">Accent</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
      </div>

      <div class="demo-row">
        <Button variant="success">Success</Button>
        <Button variant="warning">Warning</Button>
        <Button variant="error">Error</Button>
        <Button variant="info">Info</Button>
      </div>
    </section>

    <section class="demo-section">
      <Heading level={2}>Enhanced Card Component</Heading>
      <Text>Cards with different variants: default, bordered, elevated, and interactive.</Text>

      <div class="card-grid">
        {#each cardVariants as variant}
          <Card variant={variant} hoverable={variant === 'interactive'}>
            <CardHeader>
              <Heading level={3}>{variant} Card</Heading>
            </CardHeader>
            <CardContent>
              <Text>This is a {variant} card variant that showcases the different styling options available.</Text>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm">Action</Button>
            </CardFooter>
          </Card>
        {/each}
      </div>
    </section>

    <section class="demo-section">
      <Heading level={2}>Dialog Component</Heading>
      <Text>Enhanced dialog with better animation and positioning options.</Text>

      <div class="demo-row">
        <Button on:click={() => showDialog = true}>Open Dialog</Button>
      </div>

      <Dialog
        bind:open={showDialog}
        title="Enhanced Dialog"
        description="This dialog has improved animations and positioning options."
        animation="scale"
        position="center"
        backdropBlur={true}
      >
        <div class="dialog-content">
          <Text>This dialog component has been enhanced with:</Text>
          <ul>
            <li>Better animations</li>
            <li>Flexible positioning</li>
            <li>Backdrop blur effect</li>
            <li>Improved accessibility</li>
          </ul>
        </div>

        <svelte:fragment slot="footer">
          <Button variant="outline" on:click={() => showDialog = false}>Cancel</Button>
          <Button variant="primary" on:click={() => {
            showDialog = false;
            showSuccessToast();
          }}>Confirm</Button>
        </svelte:fragment>
      </Dialog>
    </section>

    <section class="demo-section">
      <Heading level={2}>Form Components</Heading>

      <form on:submit|preventDefault={handleSubmit} class="demo-form">
        <div class="form-row">
          <Input
            label="Username"
            placeholder="Enter your username"
            bind:value={username}
            required
          />
        </div>

        <div class="form-row">
          <Input
            type="email"
            label="Email Address"
            placeholder="Enter your email"
            bind:value={email}
            required
          />
        </div>

        <div class="form-row">
          <Input
            type="password"
            label="Password"
            placeholder="Enter your password"
            bind:value={password}
            required
          />
        </div>

        <div class="form-row">
          <Select
            label="Country"
            bind:value={country}
            options={countries}
            placeholder="Select your country"
            required
          />
        </div>

        <div class="form-row">
          <Switch
            label="Enable notifications"
            bind:checked={notifications}
          />
        </div>

        <div class="form-actions">
          <Button type="submit" variant="primary">Submit Form</Button>
          <Button type="button" variant="outline">Cancel</Button>
        </div>
      </form>
    </section>

    <section class="demo-section">
      <Heading level={2}>Tabs Component</Heading>

      <Card>
        <Tabs items={tabItems} bind:activeTab />

        <CardContent>
          {#if activeTab === 0}
            <div class="tab-content">
              <Heading level={3}>Overview</Heading>
              <Text>The Taste Duel design system provides a comprehensive set of UI components for building consistent and accessible user interfaces.</Text>
            </div>
          {:else if activeTab === 1}
            <div class="tab-content">
              <Heading level={3}>Features</Heading>
              <ul>
                <li>Consistent design language</li>
                <li>Accessibility built-in</li>
                <li>Dark and light mode support</li>
                <li>Responsive components</li>
                <li>Customizable theming</li>
              </ul>
            </div>
          {:else}
            <div class="tab-content">
              <Heading level={3}>Documentation</Heading>
              <Text>Comprehensive documentation is available for all components, including usage examples and API references.</Text>
              <Button variant="outline" size="sm" on:click={() => showInfoToast()}>View Docs</Button>
            </div>
          {/if}
        </CardContent>
      </Card>
    </section>

    <section class="demo-section">
      <Heading level={2}>Alert Component</Heading>

      <div class="demo-stack">
        <Alert variant="info" title="Information">
          This is an informational alert that provides context.
        </Alert>

        <Alert variant="success" title="Success">
          Operation completed successfully.
        </Alert>

        <Alert variant="warning" title="Warning">
          This action might have consequences.
        </Alert>

        <Alert variant="error" title="Error" dismissible>
          Something went wrong. Please try again.
        </Alert>
      </div>
    </section>

    <section class="demo-section">
      <Heading level={2}>Badge Component</Heading>

      <div class="demo-row">
        <Badge>Default</Badge>
        <Badge variant="primary">Primary</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="accent">Accent</Badge>
        <Badge variant="outline">Outline</Badge>
      </div>
    </section>

    <section class="demo-section">
      <Heading level={2}>Progress Component</Heading>

      <div class="demo-stack">
        <Progress value={25} max={100} showLabel />
        <Progress value={50} max={100} variant="accent" showLabel />
        <Progress value={75} max={100} variant="success" showLabel />
        <Progress value={90} max={100} variant="error" showLabel />
      </div>
    </section>

    <section class="demo-section">
      <Heading level={2}>Tooltip Component</Heading>

      <div class="demo-row">
        <Tooltip content="This is a tooltip that provides additional information">
          <Button variant="outline">Hover Me</Button>
        </Tooltip>

        <Tooltip content="Click this button to perform an action" position="bottom">
          <Button>Bottom Tooltip</Button>
        </Tooltip>

        <Tooltip content="This appears on the left" position="left">
          <Button variant="secondary">Left Tooltip</Button>
        </Tooltip>

        <Tooltip content="This appears on the right" position="right">
          <Button variant="accent">Right Tooltip</Button>
        </Tooltip>
      </div>
    </section>
  </Container>
</div>

<style>
  .design-system-demo {
    padding-bottom: 4rem;
  }

  .demo-header {
    background-color: var(--card-bg);
    border-bottom: 1px solid var(--card-border);
    padding: 1.5rem 0;
    margin-bottom: 2rem;
  }

  .demo-header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .demo-section {
    margin-bottom: 3rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid var(--card-border);
  }

  .demo-section:last-child {
    border-bottom: none;
  }

  .demo-row {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .demo-stack {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-top: 1.5rem;
  }

  .demo-form {
    max-width: 600px;
    margin-top: 1.5rem;
  }

  .form-row {
    margin-bottom: 1.5rem;
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
  }

  .dialog-content {
    margin: 1.5rem 0;
  }

  .dialog-content ul {
    margin-top: 1rem;
    padding-left: 1.5rem;
  }

  .dialog-content li {
    margin-bottom: 0.5rem;
  }

  .tab-content {
    padding: 1rem 0;
  }

  .tab-content ul {
    margin-top: 1rem;
    padding-left: 1.5rem;
  }

  .tab-content li {
    margin-bottom: 0.5rem;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .demo-header-content {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .theme-toggle {
      align-self: flex-start;
    }

    .card-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
