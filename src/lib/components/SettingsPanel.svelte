<script>
  import { fade } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';
  import { 
    Dialog, 
    Button, 
    Switch, 
    Select, 
    Heading, 
    Text, 
    Container,
    Badge,
    Tabs
  } from '../ui';
  import appState, { THEMES, APP_STATES } from '../stores/appState.js';
  import { saveToLocalStorage, STORAGE_KEYS } from '../utils/localStorage.js';
  
  // Props
  export let open = false;
  
  // Internal state
  let settings;
  let tabIndex = 0;
  
  // Create event dispatcher
  const dispatch = createEventDispatcher();
  
  // Tabs configuration
  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'algorithm', label: 'Algorithm' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'accessibility', label: 'Accessibility' }
  ];
  
  // Get current settings from appState store
  appState.subscribe(state => {
    settings = {
      theme: state.theme || THEMES.DARK,
      kFactor: state.kFactor || 32,
      sound: state.sound !== undefined ? state.sound : true,
      soundVolume: state.soundVolume || 0.5,
      vibration: state.vibration !== undefined ? state.vibration : true,
      reducedMotion: state.reducedMotion !== undefined ? state.reducedMotion : false,
      highContrast: state.highContrast !== undefined ? state.highContrast : false,
      fontSize: state.fontSize || 'default',
    };
  });
  
  // Save settings
  function saveSettings() {
    appState.update(state => {
      const updatedState = { 
        ...state,
        theme: settings.theme,
        kFactor: settings.kFactor,
        sound: settings.sound,
        soundVolume: settings.soundVolume,
        vibration: settings.vibration,
        reducedMotion: settings.reducedMotion,
        highContrast: settings.highContrast,
        fontSize: settings.fontSize
      };
      
      // Save to localStorage
      saveToLocalStorage(STORAGE_KEYS.APP_STATE, updatedState);
      
      return updatedState;
    });
    
    // Apply theme changes immediately
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', settings.theme);
      
      // Apply reduced motion preference
      if (settings.reducedMotion) {
        document.documentElement.classList.add('reduced-motion');
      } else {
        document.documentElement.classList.remove('reduced-motion');
      }
      
      // Apply high contrast preference
      if (settings.highContrast) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
      
      // Apply font size preference
      document.documentElement.setAttribute('data-font-size', settings.fontSize);
    }
    
    // Play sound if enabled
    if (settings.sound) {
      playSettingsSound();
    }
    
    // Close dialog
    close();
  }
  
  // Reset settings to defaults
  function resetToDefaults() {
    settings = {
      theme: THEMES.DARK,
      kFactor: 32,
      sound: true,
      soundVolume: 0.5,
      vibration: true,
      reducedMotion: false,
      highContrast: false,
      fontSize: 'default',
    };
    
    // Play sound if enabled
    if (settings.sound) {
      playSettingsSound();
    }
  }
  
  // Play settings sound effect
  function playSettingsSound() {
    // Simple web audio API sound effect
    if (typeof window !== 'undefined' && window.AudioContext) {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);
        
        gainNode.gain.value = settings.soundVolume;
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
      } catch (error) {
        console.error('Error playing sound:', error);
      }
    }
  }
  
  // Vibrate device if enabled
  function vibrate(pattern = [20]) {
    if (settings.vibration && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }
  
  // Handle switch input change and vibrate on changes
  function handleSwitchChange() {
    vibrate([10]);
  }
  
  // Handle value change with sound
  function handleValueChange() {
    if (settings.sound) {
      playSettingsSound();
    }
  }
  
  // Handle closing dialog
  function close() {
    open = false;
    dispatch('close');
  }
</script>

<Dialog 
  {open} 
  title="Settings" 
  on:close={close}
  size="lg"
  className="settings-dialog"
>
  <Tabs bind:selected={tabIndex} tabs={tabs}>
    {#if tabIndex === 0}
      <!-- General Settings -->
      <div class="settings-group" transition:fade={{ duration: 150 }}>
        <Heading size="h3">General Settings</Heading>
        
        <div class="setting-item">
          <div class="setting-label">
            <Text>Sound Effects</Text>
            <Text size="sm" className="setting-description">Enable sound feedback for interactions</Text>
          </div>
          <Switch 
            bind:checked={settings.sound} 
            on:change={handleSwitchChange}
          />
        </div>
        
        {#if settings.sound}
          <div class="setting-item">
            <div class="setting-label">
              <Text>Sound Volume</Text>
              <Text size="sm" className="setting-description">Adjust sound effect volume</Text>
            </div>
            <div class="volume-slider">
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                bind:value={settings.soundVolume} 
                on:change={handleValueChange}
                class="volume-range"
              />
              <Text size="sm">{Math.round(settings.soundVolume * 100)}%</Text>
            </div>
          </div>
        {/if}
        
        <div class="setting-item">
          <div class="setting-label">
            <Text>Vibration</Text>
            <Text size="sm" className="setting-description">Enable haptic feedback on mobile devices</Text>
          </div>
          <Switch 
            bind:checked={settings.vibration} 
            on:change={handleSwitchChange}
          />
        </div>
      </div>
    {:else if tabIndex === 1}
      <!-- Algorithm Settings -->
      <div class="settings-group" transition:fade={{ duration: 150 }}>
        <Heading size="h3">Algorithm Settings</Heading>
        
        <div class="setting-item">
          <div class="setting-label">
            <Text>K-Factor</Text>
            <Text size="sm" className="setting-description">Controls how drastically ratings change (higher values = larger swings)</Text>
          </div>
          <div class="k-factor-select">
            <Select 
              bind:value={settings.kFactor}
              on:change={handleValueChange}
              options={[
                { value: 16, label: 'Low (16) - Subtle Rating Changes' },
                { value: 24, label: 'Medium (24)' },
                { value: 32, label: 'Standard (32)' },
                { value: 48, label: 'High (48)' },
                { value: 64, label: 'Very High (64) - Dramatic Rating Changes' }
              ]}
            />
          </div>
        </div>
        
        <div class="algorithm-info">
          <Badge variant="secondary">Elo Rating System</Badge>
          <Text size="sm">
            Taste Duel uses the Elo rating system to rank your food preferences, where each comparison 
            updates the ratings based on the outcome and expected outcome.
          </Text>
          <Text size="sm" className="formula">
            Rₐ' = Rₐ + K × (Sₐ - Eₐ)
          </Text>
        </div>
      </div>
    {:else if tabIndex === 2}
      <!-- Appearance Settings -->
      <div class="settings-group" transition:fade={{ duration: 150 }}>
        <Heading size="h3">Appearance Settings</Heading>
        
        <div class="setting-item">
          <div class="setting-label">
            <Text>Theme</Text>
            <Text size="sm" className="setting-description">Choose between light and dark mode</Text>
          </div>
          <div class="theme-buttons">
            <button 
              class="theme-button dark-theme {settings.theme === THEMES.DARK ? 'selected' : ''}" 
              on:click={() => { settings.theme = THEMES.DARK; handleValueChange(); }}
              aria-label="Dark theme"
              title="Dark theme"
            >
              <div class="theme-preview dark-preview"></div>
              <Text size="sm">Dark</Text>
            </button>
            <button 
              class="theme-button light-theme {settings.theme === THEMES.LIGHT ? 'selected' : ''}" 
              on:click={() => { settings.theme = THEMES.LIGHT; handleValueChange(); }}
              aria-label="Light theme"
              title="Light theme"
            >
              <div class="theme-preview light-preview"></div>
              <Text size="sm">Light</Text>
            </button>
          </div>
        </div>
        
        <div class="setting-item">
          <div class="setting-label">
            <Text>Font Size</Text>
            <Text size="sm" className="setting-description">Adjust text size for better readability</Text>
          </div>
          <div class="font-size-select">
            <Select 
              bind:value={settings.fontSize}
              on:change={handleValueChange}
              options={[
                { value: 'small', label: 'Small' },
                { value: 'default', label: 'Default' },
                { value: 'large', label: 'Large' },
                { value: 'x-large', label: 'Extra Large' }
              ]}
            />
          </div>
        </div>
      </div>
    {:else if tabIndex === 3}
      <!-- Accessibility Settings -->
      <div class="settings-group" transition:fade={{ duration: 150 }}>
        <Heading size="h3">Accessibility Settings</Heading>
        
        <div class="setting-item">
          <div class="setting-label">
            <Text>Reduced Motion</Text>
            <Text size="sm" className="setting-description">Decrease or remove animations</Text>
          </div>
          <Switch 
            bind:checked={settings.reducedMotion} 
            on:change={handleSwitchChange}
          />
        </div>
        
        <div class="setting-item">
          <div class="setting-label">
            <Text>High Contrast</Text>
            <Text size="sm" className="setting-description">Enhance text and visual element contrast</Text>
          </div>
          <Switch 
            bind:checked={settings.highContrast} 
            on:change={handleSwitchChange}
          />
        </div>
      </div>
    {/if}
  </Tabs>
  
  <div class="actions" slot="footer">
    <Button variant="outline" on:click={resetToDefaults}>Reset to Defaults</Button>
    <Button on:click={saveSettings}>Save Changes</Button>
  </div>
</Dialog>

<style>
  .settings-group {
    padding: 0.5rem 0;
  }
  
  .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
    border-bottom: 1px solid var(--card-border, #334155);
  }
  
  .setting-item:last-child {
    border-bottom: none;
  }
  
  .setting-label {
    flex: 1;
  }
  
  .setting-description {
    color: var(--muted-color, #cbd5e1);
    margin-top: 0.25rem;
  }
  
  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
  }
  
  .volume-slider {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 150px;
  }
  
  .volume-range {
    flex: 1;
    height: 6px;
    -webkit-appearance: none;
    appearance: none;
    background: var(--card-border, #334155);
    border-radius: 3px;
    outline: none;
  }
  
  .volume-range::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--primary-color, #10b981);
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .volume-range::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--primary-color, #10b981);
    cursor: pointer;
    border: none;
    transition: all 0.2s;
  }
  
  .volume-range::-webkit-slider-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
  }
  
  .volume-range::-moz-range-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
  }
  
  .algorithm-info {
    margin-top: 1rem;
    padding: 1rem;
    background-color: rgba(99, 102, 241, 0.1);
    border-radius: 0.5rem;
    border: 1px solid rgba(99, 102, 241, 0.2);
  }
  
  .formula {
    display: block;
    font-family: monospace;
    background-color: rgba(0, 0, 0, 0.2);
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    margin-top: 0.5rem;
    font-weight: bold;
  }
  
  .theme-buttons {
    display: flex;
    gap: 1rem;
  }
  
  .theme-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: 0.5rem;
    border: 2px solid transparent;
    background-color: transparent;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .theme-button.selected {
    border-color: var(--primary-color, #10b981);
  }
  
  .theme-preview {
    width: 3rem;
    height: 3rem;
    border-radius: 0.25rem;
    border: 1px solid var(--card-border, #334155);
  }
  
  .dark-preview {
    background-color: #0f172a;
    box-shadow: inset 0 0 0 2px #1e293b, inset 0 0 0 4px #10b981;
  }
  
  .light-preview {
    background-color: #f8fafc;
    box-shadow: inset 0 0 0 2px #e2e8f0, inset 0 0 0 4px #10b981;
  }
  
  .k-factor-select,
  .font-size-select {
    min-width: 250px;
  }
  
  /* Make settings dialog scrollable on small screens */
  :global(.settings-dialog .dialog-body) {
    max-height: 60vh;
    overflow-y: auto;
  }
  
  /* Custom tab styles */
  :global(.settings-dialog .tabs-list) {
    margin-bottom: 1.5rem;
  }
</style>