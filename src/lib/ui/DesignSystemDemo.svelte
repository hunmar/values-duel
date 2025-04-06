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
    ToastService,
    Tooltip
  } from './index.js';

  // Demo state
  let showDialog = false;
  let showToast = false;
  let switchValue = true;
  let inputValue = '';
  let selectValue = 'option1';
  let activeTab = 0;
  let progressValue = 35;
  let isLoading = false;

  // Options for select
  const selectOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' }
  ];

  // Tab items
  const tabItems = ['Buttons', 'Cards', 'Forms', 'Feedback'];

  // Toast demo functions
  function showSuccessToast() {
    ToastService.success({
      title: 'Success',
      message: 'Operation completed successfully'
    });
  }

  function showErrorToast() {
    ToastService.error({
      title: 'Error',
      message: 'Something went wrong'
    });
  }

  function showWarningToast() {
    ToastService.warning({
      title: 'Warning',
      message: 'This action might have consequences'
    });
  }

  function showInfoToast() {
    ToastService.info({
      title: 'Information',
      message: 'Here is some useful information'
    });
  }

  function showLoadingToast() {
    const toast = ToastService.loading({
      title: 'Loading',
      message: 'Please wait...'
    });

    // Simulate operation completion
    setTimeout(() => {
      toast.success({
        title: 'Completed',
        message: 'Operation completed successfully'
      });
    }, 3000);
  }

  // Simulate loading
  function simulateLoading() {
    isLoading = true;
    setTimeout(() => {
      isLoading = false;
    }, 2000);
  }
</script>

<ToastContainer />

<div class="design-system-demo">
  <header class="demo-header">
    <Container>
      <Heading level={1}>Taste Duel Design System</Heading>
      <Text>A showcase of the enhanced UI components</Text>
    </Container>
  </header>

  <main class="demo-content">
    <Container>
      <Tabs items={tabItems} bind:activeTab />

      {#if activeTab === 0}
        <!-- Buttons Section -->
        <section class="demo-section">
          <Heading level={2}>Button Variants</Heading>
          <div class="demo-grid">
            <div class="demo-item">
              <Button variant="default">Default</Button>
            </div>
            <div class="demo-item">
              <Button variant="primary">Primary</Button>
            </div>
            <div class="demo-item">
              <Button variant="secondary">Secondary</Button>
            </div>
            <div class="demo-item">
              <Button variant="accent">Accent</Button>
            </div>
            <div class="demo-item">
              <Button variant="outline">Outline</Button>
            </div>
            <div class="demo-item">
              <Button variant="ghost">Ghost</Button>
            </div>
            <div class="demo-item">
              <Button variant="success">Success</Button>
            </div>
            <div class="demo-item">
              <Button variant="warning">Warning</Button>
            </div>
            <div class="demo-item">
              <Button variant="error">Error</Button>
            </div>
            <div class="demo-item">
              <Button variant="info">Info</Button>
            </div>
          </div>

          <Heading level={3}>Button Sizes</Heading>
          <div class="demo-row">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"></path>
                <path d="M12 5l7 7-7 7"></path>
              </svg>
            </Button>
          </div>

          <Heading level={3}>Button States</Heading>
          <div class="demo-row">
            <Button disabled>Disabled</Button>
            <Button loading>Loading</Button>
            <Button on:click={simulateLoading} loading={isLoading}>
              {isLoading ? 'Loading...' : 'Click to Load'}
            </Button>
          </div>

          <Heading level={3}>Button with Icons</Heading>
          <div class="demo-row">
            <Button
              iconLeft='<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
            >
              With Left Icon
            </Button>

            <Button
              iconRight='<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>'
            >
              With Right Icon
            </Button>
          </div>

          <Heading level={3}>Button Styles</Heading>
          <div class="demo-row">
            <Button rounded>Rounded</Button>
            <Button elevated>Elevated</Button>
            <Button fullWidth>Full Width</Button>
          </div>
        </section>
      {:else if activeTab === 1}
        <!-- Cards Section -->
        <section class="demo-section">
          <Heading level={2}>Card Variants</Heading>

          <div class="demo-grid">
            <Card>
              <CardHeader>
                <Heading level={3}>Default Card</Heading>
              </CardHeader>
              <CardContent>
                <Text>This is a default card with standard styling.</Text>
              </CardContent>
              <CardFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Save</Button>
              </CardFooter>
            </Card>

            <Card variant="bordered">
              <CardHeader>
                <Heading level={3}>Bordered Card</Heading>
              </CardHeader>
              <CardContent>
                <Text>This card has a more prominent border.</Text>
              </CardContent>
              <CardFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Save</Button>
              </CardFooter>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <Heading level={3}>Elevated Card</Heading>
              </CardHeader>
              <CardContent>
                <Text>This card has elevation with a shadow effect.</Text>
              </CardContent>
              <CardFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Save</Button>
              </CardFooter>
            </Card>

            <Card variant="interactive" hoverable>
              <CardHeader>
                <Heading level={3}>Interactive Card</Heading>
              </CardHeader>
              <CardContent>
                <Text>This card has hover and interactive states.</Text>
              </CardContent>
              <CardFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Save</Button>
              </CardFooter>
            </Card>
          </div>

          <Heading level={3}>Card Properties</Heading>

          <div class="demo-grid">
            <Card selected>
              <CardContent>
                <Heading level={4}>Selected Card</Heading>
                <Text>This card is in a selected state.</Text>
              </CardContent>
            </Card>

            <Card shadow="xl">
              <CardContent>
                <Heading level={4}>Extra Large Shadow</Heading>
                <Text>This card has an extra large shadow.</Text>
              </CardContent>
            </Card>

            <Card rounded="xl">
              <CardContent>
                <Heading level={4}>Extra Rounded</Heading>
                <Text>This card has extra rounded corners.</Text>
              </CardContent>
            </Card>

            <Card color="primary">
              <CardContent>
                <Heading level={4}>Primary Color</Heading>
                <Text>This card uses the primary color theme.</Text>
              </CardContent>
            </Card>
          </div>
        </section>
      {:else if activeTab === 2}
        <!-- Forms Section -->
        <section class="demo-section">
          <Heading level={2}>Form Components</Heading>

          <div class="demo-form">
            <div class="form-row">
              <Input
                label="Text Input"
                placeholder="Enter some text"
                bind:value={inputValue}
                helperText="This is a standard text input field"
              />
            </div>

            <div class="form-row">
              <Select
                label="Select Input"
                options={selectOptions}
                bind:value={selectValue}
                valueKey="value"
                labelKey="label"
              />
            </div>

            <div class="form-row">
              <Switch
                label="Toggle Switch"
                bind:checked={switchValue}
              />
            </div>

            <div class="form-row">
              <Heading level={4}>Progress Indicator</Heading>
              <Progress value={progressValue} max={100} showLabel />
              <div class="progress-controls">
                <Button
                  size="sm"
                  on:click={() => progressValue = Math.max(0, progressValue - 10)}
                >
                  Decrease
                </Button>
                <Button
                  size="sm"
                  on:click={() => progressValue = Math.min(100, progressValue + 10)}
                >
                  Increase
                </Button>
              </div>
            </div>
          </div>
        </section>
      {:else if activeTab === 3}
        <!-- Feedback Section -->
        <section class="demo-section">
          <Heading level={2}>Feedback Components</Heading>

          <Heading level={3}>Alerts</Heading>
          <div class="demo-alerts">
            <Alert variant="info" title="Information">
              This is an informational message.
            </Alert>

            <Alert variant="success" title="Success">
              Operation completed successfully.
            </Alert>

            <Alert variant="warning" title="Warning">
              This action might have consequences.
            </Alert>

            <Alert variant="error" title="Error">
              Something went wrong. Please try again.
            </Alert>
          </div>

          <Heading level={3}>Toast Notifications</Heading>
          <div class="demo-row">
            <Button variant="info" on:click={showInfoToast}>Info Toast</Button>
            <Button variant="success" on:click={showSuccessToast}>Success Toast</Button>
            <Button variant="warning" on:click={showWarningToast}>Warning Toast</Button>
            <Button variant="error" on:click={showErrorToast}>Error Toast</Button>
            <Button on:click={showLoadingToast}>Loading Toast</Button>
          </div>

          <Heading level={3}>Dialog</Heading>
          <div class="demo-row">
            <Button on:click={() => showDialog = true}>Open Dialog</Button>

            <Dialog
              bind:open={showDialog}
              title="Dialog Example"
              description="This is an example of the enhanced dialog component with improved animations and positioning."
              animation="scale"
              position="center"
              backdropBlur={true}
            >
              <div class="dialog-demo-content">
                <p>The dialog component now supports various animations and positions:</p>
                <ul>
                  <li>Animations: scale, fade, fly, slide, bounce, elastic</li>
                  <li>Positions: center, top, right, bottom, left, top-right, top-left, bottom-right, bottom-left</li>
                </ul>
              </div>

              <svelte:fragment slot="footer">
                <Button variant="outline" on:click={() => showDialog = false}>Cancel</Button>
                <Button on:click={() => showDialog = false}>Confirm</Button>
              </svelte:fragment>
            </Dialog>
          </div>

          <Heading level={3}>Tooltips</Heading>
          <div class="demo-row">
            <Tooltip content="This is a tooltip that appears on hover">
              <Button>Hover Me</Button>
            </Tooltip>

            <Tooltip content="This tooltip appears on the right" position="right">
              <Button>Right Tooltip</Button>
            </Tooltip>

            <Tooltip content="This tooltip appears on the bottom" position="bottom">
              <Button>Bottom Tooltip</Button>
            </Tooltip>
          </div>

          <Heading level={3}>Badges</Heading>
          <div class="demo-row">
            <Badge>Default</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="accent">Accent</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </section>
      {/if}
    </Container>
  </main>
</div>

<style>
  .design-system-demo {
    font-family: var(--font-sans);
    color: var(--gray-900);
  }

  .demo-header {
    padding: var(--space-8) 0;
    background-color: var(--primary-50);
    border-bottom: 1px solid var(--primary-100);
    margin-bottom: var(--space-8);
  }

  .demo-content {
    padding-bottom: var(--space-16);
  }

  .demo-section {
    margin-top: var(--space-8);
    margin-bottom: var(--space-12);
  }

  .demo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--space-6);
    margin: var(--space-6) 0;
  }

  .demo-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4);
    margin: var(--space-4) 0 var(--space-8) 0;
    align-items: center;
  }

  .demo-item {
    padding: var(--space-4);
    display: flex;
    justify-content: center;
  }

  .demo-alerts {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    margin: var(--space-4) 0 var(--space-8) 0;
  }

  .demo-form {
    max-width: 600px;
    margin: 0 auto;
  }

  .form-row {
    margin-bottom: var(--space-6);
  }

  .progress-controls {
    display: flex;
    gap: var(--space-2);
    margin-top: var(--space-2);
  }

  .dialog-demo-content {
    margin: var(--space-4) 0;
  }

  .dialog-demo-content ul {
    margin-top: var(--space-2);
    padding-left: var(--space-6);
  }

  .dialog-demo-content li {
    margin-bottom: var(--space-2);
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .demo-row {
      flex-direction: column;
      align-items: flex-start;
    }

    .demo-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
