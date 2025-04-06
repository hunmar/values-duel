/**
 * Component Documentation
 * 
 * This file provides JSDoc-style documentation for all UI components in the Taste Duel design system.
 * These are exported from `$lib/ui/index.js` and can be imported into any Svelte component.
 */

/**
 * Alert Component
 * 
 * @component
 * @example
 * <Alert variant="info">This is an informational message</Alert>
 * 
 * @prop {string} [variant="default"] - Visual style variant: "default", "info", "success", "warning", "error"
 * @prop {string} [title] - Optional title for the alert
 * @prop {boolean} [dismissible=false] - Whether the alert can be dismissed
 * @prop {string} [className] - Additional CSS classes
 * @prop {string} [icon] - Optional icon to display
 */

/**
 * Badge Component
 * 
 * @component
 * @example
 * <Badge variant="primary">New</Badge>
 * 
 * @prop {string} [variant="default"] - Visual style variant: "default", "primary", "secondary", "accent", "outline"
 * @prop {string} [size="default"] - Size variant: "sm", "default", "lg"
 * @prop {string} [className] - Additional CSS classes
 */

/**
 * Button Component
 * 
 * @component
 * @example
 * <Button variant="primary" size="lg" on:click={handleClick}>Click Me</Button>
 * 
 * @prop {string} [variant="default"] - Visual style variant: "default", "primary", "secondary", "accent", "outline", "ghost", "link"
 * @prop {string} [size="default"] - Size variant: "sm", "default", "lg"
 * @prop {boolean} [disabled=false] - Whether the button is disabled
 * @prop {boolean} [loading=false] - Whether to show a loading state
 * @prop {string} [type="button"] - HTML button type attribute 
 * @prop {string} [className] - Additional CSS classes
 * @prop {string} [icon] - Optional icon to display
 * @prop {string} [iconPosition="left"] - Position of icon: "left", "right"
 */

/**
 * Card Component
 * 
 * @component
 * @example
 * <Card>
 *   <CardHeader>
 *     <Heading>Card Title</Heading>
 *   </CardHeader>
 *   <CardContent>
 *     <Text>Card content goes here</Text>
 *   </CardContent>
 *   <CardFooter>
 *     <Button>Action</Button>
 *   </CardFooter>
 * </Card>
 * 
 * @prop {string} [variant="default"] - Visual style variant: "default", "outline", "filled", "hover"
 * @prop {string} [className] - Additional CSS classes
 * @prop {boolean} [hoverable=false] - Whether card has hover effects
 */

/**
 * Container Component
 * 
 * @component
 * @example
 * <Container size="md">
 *   <h1>Page Content</h1>
 * </Container>
 * 
 * @prop {string} [size="default"] - Size variant: "sm", "default", "md", "lg", "xl", "full"
 * @prop {string} [className] - Additional CSS classes
 * @prop {boolean} [centered=true] - Whether to center the container horizontally
 * @prop {boolean} [padded=true] - Whether to add padding
 */

/**
 * Dialog Component
 * 
 * @component
 * @example
 * <Dialog bind:open={showDialog} title="Confirmation">
 *   <p>Are you sure you want to continue?</p>
 *   <svelte:fragment slot="footer">
 *     <Button on:click={() => open = false}>Cancel</Button>
 *     <Button variant="primary" on:click={handleConfirm}>Confirm</Button>
 *   </svelte:fragment>
 * </Dialog>
 * 
 * @prop {boolean} [open=false] - Whether the dialog is open
 * @prop {string} [title] - Dialog title
 * @prop {string} [description] - Dialog description
 * @prop {string} [size="default"] - Size variant: "sm", "default", "lg", "xl", "full"
 * @prop {boolean} [showClose=true] - Whether to show close button
 * @prop {string} [className] - Additional CSS classes
 * @prop {string} [overlayClassName] - Additional CSS classes for overlay
 * @prop {boolean} [closeOnClickOutside=true] - Whether clicking outside closes the dialog
 */

/**
 * Drawer Component
 * 
 * @component
 * @example
 * <Drawer bind:open={showDrawer} position="right">
 *   <div slot="header">
 *     <Heading>Menu</Heading>
 *   </div>
 *   <nav>
 *     <ul>
 *       <li><a href="/">Home</a></li>
 *       <li><a href="/about">About</a></li>
 *     </ul>
 *   </nav>
 * </Drawer>
 * 
 * @prop {boolean} [open=false] - Whether the drawer is open
 * @prop {string} [position="left"] - Position of drawer: "left", "right", "top", "bottom"
 * @prop {string} [size="default"] - Size variant: "sm", "default", "lg", "xl"
 * @prop {boolean} [overlay=true] - Whether to show an overlay behind the drawer
 * @prop {string} [className] - Additional CSS classes
 */

/**
 * Heading Component
 * 
 * @component
 * @example
 * <Heading level={2} size="xl">Section Title</Heading>
 * 
 * @prop {number} [level=1] - HTML heading level (1-6)
 * @prop {string} [size="default"] - Size variant: "xs", "sm", "default", "lg", "xl", "2xl", "3xl"
 * @prop {string} [weight="semibold"] - Font weight: "normal", "medium", "semibold", "bold"
 * @prop {string} [className] - Additional CSS classes
 */

/**
 * Input Component
 * 
 * @component
 * @example
 * <Input
 *   type="text"
 *   label="Username"
 *   placeholder="Enter username"
 *   bind:value={username}
 *   error={errors.username}
 * />
 * 
 * @prop {string} [type="text"] - Input type attribute
 * @prop {string} [value=""] - Input value
 * @prop {string} [placeholder=""] - Input placeholder
 * @prop {string} [label=""] - Input label
 * @prop {string} [id=""] - Input id attribute
 * @prop {string} [name=""] - Input name attribute
 * @prop {boolean} [disabled=false] - Whether input is disabled
 * @prop {boolean} [required=false] - Whether input is required
 * @prop {string} [error=""] - Error message
 * @prop {string} [helperText=""] - Helper text
 * @prop {string} [icon=""] - Icon to display
 * @prop {string} [iconPosition="left"] - Position of icon: "left", "right"
 * @prop {string} [className=""] - Additional CSS classes
 * @prop {boolean} [fullWidth=false] - Whether input takes full width
 * @prop {string} [variant="default"] - Visual style variant: "default", "outlined", "filled"
 * @prop {string} [size="default"] - Size variant: "sm", "default", "lg"
 */

/**
 * Progress Component
 * 
 * @component
 * @example
 * <Progress value={50} max={100} showLabel />
 * 
 * @prop {number} [value=0] - Current progress value
 * @prop {number} [max=100] - Maximum progress value
 * @prop {string} [size="default"] - Size variant: "sm", "default", "lg"
 * @prop {string} [variant="default"] - Visual style variant: "default", "accent", "success", "warning", "error"
 * @prop {boolean} [showLabel=false] - Whether to show progress label
 * @prop {string} [labelPosition="right"] - Label position: "right", "inside"
 * @prop {string} [format="percent"] - Label format: "percent", "value", "custom"
 * @prop {string} [customLabel=""] - Custom label when format is "custom"
 * @prop {boolean} [animated=true] - Whether to add animation
 * @prop {string} [className=""] - Additional CSS classes
 */

/**
 * Select Component
 * 
 * @component
 * @example
 * <Select
 *   label="Country"
 *   bind:value={country}
 *   options={countries}
 *   valueKey="code"
 *   labelKey="name"
 * />
 * 
 * @prop {Array} [options=[]] - Array of options to select from
 * @prop {string} [value=""] - Current selected value
 * @prop {string} [placeholder="Select an option"] - Placeholder text
 * @prop {string} [label=""] - Select label
 * @prop {string} [id=""] - Select id attribute
 * @prop {string} [name=""] - Select name attribute
 * @prop {boolean} [disabled=false] - Whether select is disabled
 * @prop {boolean} [required=false] - Whether select is required
 * @prop {string} [error=""] - Error message
 * @prop {string} [helperText=""] - Helper text
 * @prop {string} [icon=""] - Icon to display
 * @prop {string} [className=""] - Additional CSS classes
 * @prop {boolean} [fullWidth=false] - Whether select takes full width
 * @prop {string} [variant="default"] - Visual style variant: "default", "outlined", "filled"
 * @prop {string} [size="default"] - Size variant: "sm", "default", "lg"
 * @prop {string} [valueKey="value"] - Key to use for option value when options are objects
 * @prop {string} [labelKey="label"] - Key to use for option label when options are objects
 */

/**
 * Switch Component
 * 
 * @component
 * @example
 * <Switch 
 *   label="Enable notifications"
 *   bind:checked={notifications}
 * />
 * 
 * @prop {boolean} [checked=false] - Whether switch is checked
 * @prop {string} [label=""] - Switch label
 * @prop {string} [id=""] - Switch id attribute
 * @prop {string} [name=""] - Switch name attribute
 * @prop {boolean} [disabled=false] - Whether switch is disabled
 * @prop {string} [size="default"] - Size variant: "sm", "default", "lg"
 * @prop {string} [variant="default"] - Visual style variant: "default", "primary", "secondary", "accent"
 * @prop {string} [className=""] - Additional CSS classes
 */

/**
 * Tabs Component
 * 
 * @component
 * @example
 * <Tabs items={['Account', 'Security', 'Notifications']} bind:activeTab={activeTab}>
 *   {#if activeTab === 0}
 *     <div>Account settings...</div>
 *   {:else if activeTab === 1}
 *     <div>Security settings...</div>
 *   {:else}
 *     <div>Notification settings...</div>
 *   {/if}
 * </Tabs>
 * 
 * @prop {Array} [items=[]] - Array of tab names or objects
 * @prop {number} [activeTab=0] - Index of active tab
 * @prop {string} [variant="default"] - Visual style variant: "default", "outline", "pills"
 * @prop {string} [size="default"] - Size variant: "sm", "default", "lg"
 * @prop {boolean} [fullWidth=false] - Whether tabs take full width
 * @prop {string} [labelKey="label"] - Key to use for tab label when items are objects
 * @prop {string} [idKey="id"] - Key to use for tab id when items are objects
 * @prop {string} [className=""] - Additional CSS classes
 */

/**
 * Text Component
 * 
 * @component
 * @example
 * <Text size="lg" weight="medium" color="muted">
 *   This is some text with custom styling
 * </Text>
 * 
 * @prop {string} [size="default"] - Size variant: "xs", "sm", "default", "lg", "xl"
 * @prop {string} [weight="normal"] - Font weight: "normal", "medium", "semibold", "bold"
 * @prop {string} [color="default"] - Text color: "default", "muted", "primary", "secondary", "accent"
 * @prop {string} [align="left"] - Text alignment: "left", "center", "right", "justify"
 * @prop {boolean} [truncate=false] - Whether to truncate text with ellipsis
 * @prop {string} [as="p"] - HTML element to render as
 * @prop {string} [className=""] - Additional CSS classes
 */

/**
 * Tooltip Component
 * 
 * @component
 * @example
 * <Tooltip content="More information about this feature">
 *   <Button>Help</Button>
 * </Tooltip>
 * 
 * @prop {string} [content=""] - Tooltip content
 * @prop {string} [position="top"] - Tooltip position: "top", "right", "bottom", "left"
 * @prop {string} [trigger="hover"] - Trigger method: "hover", "click", "focus", "manual"
 * @prop {boolean} [arrow=true] - Whether to show arrow
 * @prop {boolean} [open=false] - Whether tooltip is open (for manual trigger)
 * @prop {number} [delay=200] - Delay before showing tooltip (in ms)
 * @prop {string} [className=""] - Additional CSS classes
 */