<script>
  import { onMount } from 'svelte';
  import { APP_STATES } from '../stores/appState.js';
  import appState from '../stores/appState.js';
  import foodItems from '../stores/foodItems.js';
  import { sortItemsByRating } from '../utils/eloRating.js';
  import { STORAGE_KEYS, saveToLocalStorage, clearAllAppData } from '../utils/localStorage.js';
  import { Container, Heading, Text, Button, Card, CardContent, Badge, Dialog } from '../ui';
  
  function navigateToAnalytics() {
    appState.update(state => ({
      ...state,
      currentState: APP_STATES.ANALYTICS
    }));
  }
  
  function openSettings() {
    appState.update(state => ({
      ...state,
      showSettingsPanel: true
    }));
  }
  
  let rankedFoodItems = [];
  let shareUrl = null;
  let copySuccess = false;
  let isSharedResult = false;
  let isDemoMode = false;
  let showQrCode = false;
  let qrCodeDataUrl = '';
  
  function exitDemo() {
    // Reset app state and return to landing
    appState.update(state => ({
      ...state,
      currentState: APP_STATES.LANDING,
      totalComparisons: 0,
      completedComparisons: 0,
      comparisonHistory: [],
      isDemoMode: false
    }));
    
    // Reset food item ratings to 1200
    foodItems.update(items => 
      items.map(item => ({
        ...item,
        rating: 1200
      }))
    );
  }
  
  // Function to generate a QR Code for the share URL
  async function generateQrCode() {
    if (!shareUrl) return;
    
    try {
      // Use a simple DIV-based QR Code generator
      showQrCode = true;
      
      // Create a canvas element to render the QR code
      const qrSize = 256;
      const canvas = document.createElement('canvas');
      canvas.width = qrSize;
      canvas.height = qrSize;
      const ctx = canvas.getContext('2d');
      
      // Draw a white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, qrSize, qrSize);
      
      // Load QR code library dynamically
      const QrCodeLibUrl = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js';
      
      // Create and add a script element to load the QR code library
      return new Promise((resolve, reject) => {
        if (window.qrcode) {
          createQrCode();
          resolve();
        } else {
          const script = document.createElement('script');
          script.src = QrCodeLibUrl;
          script.onload = () => {
            createQrCode();
            resolve();
          };
          script.onerror = (err) => {
            console.error('Failed to load QR code library:', err);
            reject(err);
          };
          document.head.appendChild(script);
        }
      });
      
      function createQrCode() {
        try {
          // Generate QR code
          const qr = window.qrcode(0, 'L');
          qr.addData(shareUrl);
          qr.make();
          
          // Get QR code as an image data URL
          const img = new Image();
          img.src = qr.createDataURL(4);
          
          img.onload = () => {
            // Draw the QR code to the canvas
            ctx.drawImage(img, 0, 0, qrSize, qrSize);
            
            // Add a small app logo in the center
            const logoSize = qrSize * 0.2;
            const logoX = (qrSize - logoSize) / 2;
            const logoY = (qrSize - logoSize) / 2;
            
            // Draw a white background for the logo
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10);
            
            // Draw logo text "TD"
            ctx.fillStyle = '#10b981';
            ctx.font = `bold ${logoSize * 0.7}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('TD', qrSize / 2, qrSize / 2);
            
            // Get the final data URL
            qrCodeDataUrl = canvas.toDataURL('image/png');
          };
        } catch (err) {
          console.error('Error generating QR code:', err);
        }
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  }
  
  onMount(() => {
    // Subscribe to the app state store to check if this is a shared result
    const unsubscribeAppState = appState.subscribe(state => {
      isSharedResult = state.isSharedResult || false;
      isDemoMode = state.isDemoMode || false;
    });
    
    // Subscribe to the foodItems store
    const unsubscribeFoodItems = foodItems.subscribe(items => {
      // Sort items by rating
      rankedFoodItems = sortItemsByRating(items);
      
      // Save the final rankings to localStorage only if not a shared result or demo
      if (!isSharedResult && !isDemoMode) {
        saveToLocalStorage(STORAGE_KEYS.FOOD_ITEMS, items);
      }
    });
    
    // Cleanup subscriptions on component unmount
    return () => {
      unsubscribeFoodItems();
      unsubscribeAppState();
    };
  });
  
  function restartRanking() {
    // Reset all food item ratings to 1200
    foodItems.update(items => 
      items.map(item => ({
        ...item,
        rating: 1200
      }))
    );
    
    // Reset app state
    appState.update(state => ({
      ...state,
      currentState: APP_STATES.LANDING,
      totalComparisons: 0,
      completedComparisons: 0,
      comparisonHistory: []
    }));
    
    // Clear stored data
    clearAllAppData();
    
    // Reset share URL
    shareUrl = null;
    copySuccess = false;
  }
  
  function exportRankings() {
    // Create a JSON blob for export
    const dataStr = JSON.stringify(rankedFoodItems, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    // Create a download link
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'taste-duel-rankings.json';
    
    // Trigger the download
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
  
  function generateShareableLink() {
    // Create a shareable data structure with just the essential information
    const shareableData = rankedFoodItems.map(item => ({
      name: item.name,
      rating: item.rating,
      position: rankedFoodItems.findIndex(i => i.id === item.id) + 1
    }));
    
    // Compress the data by encoding it as a JSON string and then as a URL-safe base64 string
    const jsonStr = JSON.stringify(shareableData);
    const base64Str = btoa(unescape(encodeURIComponent(jsonStr)));
    
    // Create a shareable URL with the data as a query parameter
    const baseUrl = window.location.origin + window.location.pathname;
    shareUrl = `${baseUrl}?results=${base64Str}`;
    
    // Reset copy success state
    copySuccess = false;
  }
  
  function showQrCodeModal() {
    // Generate QR code when the button is clicked
    generateQrCode();
  }
  
  function downloadQrCode() {
    if (!qrCodeDataUrl) return;
    
    // Create a temporary link element to trigger the download
    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = 'taste-duel-qrcode.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  function copyShareUrl() {
    // Get the input element
    const shareInput = document.getElementById('share-url-input');
    
    // Select the text
    shareInput.select();
    shareInput.setSelectionRange(0, 99999); // For mobile devices
    
    // Copy the text to the clipboard
    document.execCommand('copy');
    
    // Update the copy success state
    copySuccess = true;
    
    // Reset the copy success state after 2 seconds
    setTimeout(() => {
      copySuccess = false;
    }, 2000);
  }
  
  // Get trophy icon based on position
  function getTrophyIcon(position) {
    switch(position) {
      case 1: return '🏆';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  }
  
  // Get badge variant based on position
  function getBadgeVariant(position) {
    switch(position) {
      case 1: return 'default';
      case 2: return 'secondary';
      case 3: return 'accent';
      default: return 'outline';
    }
  }
</script>

<Container className="results-container">
  <header class="results-header">
    <div class="header-content">
      {#if isSharedResult}
        <Badge variant="secondary" className="shared-badge">Shared Results</Badge>
        <Heading className="results-title">Food Preference Ranking</Heading>
        <Text lead={true}>Someone shared their food preferences with you</Text>
      {:else if isDemoMode}
        <Badge variant="accent" className="demo-badge">Demo Mode</Badge>
        <Heading className="results-title">Sample Food Ranking</Heading>
        <Text lead={true}>This is a demo of how the app ranks your food preferences</Text>
        <div class="demo-note">
          <Text size="sm">Try the full version to discover your own preferences!</Text>
          <Button variant="secondary" className="exit-demo-button" on:click={exitDemo}>
            Exit Demo
          </Button>
        </div>
      {:else}
        <div class="trophy-icon">🏆</div>
        <Heading className="results-title">Your Food Preference Ranking</Heading>
        <Text lead={true}>Based on your comparisons, here's how you ranked these foods</Text>
      {/if}
    </div>
    
    <div class="top-choice">
      <div class="top-choice-image">
        <img 
          src={rankedFoodItems[0]?.imageUrl} 
          alt={rankedFoodItems[0]?.name}
          on:error={(e) => {
            // Use fallback image if the main image fails to load
            if (rankedFoodItems[0]?.fallbackImageUrl) {
              e.target.src = rankedFoodItems[0].fallbackImageUrl;
            }
          }}
        />
      </div>
      <div class="top-choice-info">
        <Badge variant="default" className="first-badge">#1 Choice</Badge>
        <Text className="top-food-name">{rankedFoodItems[0]?.name}</Text>
        <Text className="rating-value">Rating: {rankedFoodItems[0]?.rating}</Text>
      </div>
    </div>
  </header>
  
  <div class="results-grid">
    <Card className="rankings-card">
      <CardContent>
        <div class="card-header-content">
          <Heading level={2} size="h3">Complete Ranking</Heading>
          <Badge variant="outline">{rankedFoodItems.length} items</Badge>
        </div>
        
        <div class="ranked-list">
          {#each rankedFoodItems as food, index}
            <div class="ranked-item" class:top-three={index < 3}>
              <div class="rank">
                <Badge variant={getBadgeVariant(index + 1)} className="rank-badge">
                  {getTrophyIcon(index + 1)} {index + 1}
                </Badge>
              </div>
              
              <div class="food-content">
                <div class="food-image">
                  <img 
                    src={food.imageUrl} 
                    alt={food.name}
                    on:error={(e) => {
                      // Use fallback image if the main image fails to load
                      if (food.fallbackImageUrl) {
                        e.target.src = food.fallbackImageUrl;
                      }
                    }}
                  />
                </div>
                
                <div class="food-info">
                  <Text className="food-name">{food.name}</Text>
                  <Text size="sm" muted={true} className="food-description">{food.description}</Text>
                </div>
                
                <div class="rating">
                  <div class="rating-score">
                    <Text className="score">{Math.round(food.rating)}</Text>
                  </div>
                  <Text size="xs" muted={true}>Elo rating</Text>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </CardContent>
    </Card>
    
    <div class="side-content">
      <Card className="actions-card">
        <CardContent>
          <Heading level={2} size="h3">Actions</Heading>
          
          <div class="actions-buttons">
            <Button variant="default" className="action-button" on:click={restartRanking}>
              {isSharedResult ? 'Start Your Own Ranking' : 'Restart Ranking'}
            </Button>
            
            <Button variant="secondary" className="action-button" on:click={exportRankings}>
              Export Results
            </Button>
            
            {#if !isSharedResult}
              <Button variant="accent" className="action-button" on:click={generateShareableLink}>
                Share Results
              </Button>
              
              <Button variant="outline" className="action-button" on:click={navigateToAnalytics}>
                View Analytics
              </Button>
              
              <Button variant="outline" className="action-button settings-button" on:click={openSettings}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                Settings
              </Button>
            {/if}
          </div>
        </CardContent>
      </Card>
      
      {#if shareUrl}
        <Card className="share-card">
          <CardContent>
            <Heading level={2} size="h3">Share Your Results</Heading>
            <Text size="sm">Share your food preferences with friends and family using this link:</Text>
            
            <div class="share-url-container">
              <input 
                type="text" 
                readonly 
                value={shareUrl} 
                class="share-url" 
                id="share-url-input" 
              />
              <Button 
                variant="default" 
                className="copy-button" 
                on:click={copyShareUrl}
              >
                {copySuccess ? 'Copied! ✓' : 'Copy'}
              </Button>
            </div>
            
            <div class="share-options">
              <Button 
                variant="secondary" 
                className="qr-button" 
                on:click={showQrCodeModal}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <rect x="7" y="7" width="3" height="3"></rect>
                  <rect x="14" y="7" width="3" height="3"></rect>
                  <rect x="7" y="14" width="3" height="3"></rect>
                  <rect x="14" y="14" width="3" height="3"></rect>
                </svg>
                <span>Show QR Code</span>
              </Button>
            </div>
            
            <div class="social-share">
              <Text size="sm" className="social-label">Share on social media:</Text>
              <div class="social-buttons">
                <a 
                  href={`https://twitter.com/intent/tweet?text=I%20ranked%20my%20favorite%20foods%20with%20Taste%20Duel!%20${rankedFoodItems[0]?.name}%20came%20out%20on%20top.%20Check%20out%20my%20full%20rankings:&url=${encodeURIComponent(shareUrl)}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  class="social-button twitter"
                  aria-label="Share on Twitter"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span>Twitter</span>
                </a>
                <a 
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  class="social-button facebook"
                  aria-label="Share on Facebook"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/>
                  </svg>
                  <span>Facebook</span>
                </a>
                <a 
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=My%20Food%20Rankings&summary=I%20used%20Taste%20Duel%20to%20discover%20my%20food%20preferences.%20${rankedFoodItems[0]?.name}%20is%20my%20top%20choice!`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  class="social-button linkedin"
                  aria-label="Share on LinkedIn"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <span>LinkedIn</span>
                </a>
                <a 
                  href={`whatsapp://send?text=I%20ranked%20my%20favorite%20foods%20with%20Taste%20Duel!%20Check%20out%20my%20results:%20${encodeURIComponent(shareUrl)}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  class="social-button whatsapp"
                  aria-label="Share on WhatsApp"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                  </svg>
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      {/if}
    </div>
  </div>
</Container>

{#if showQrCode && qrCodeDataUrl}
  <div class="qr-code-modal-overlay" on:click={() => showQrCode = false}>
    <div class="qr-code-modal" on:click|stopPropagation>
      <button class="close-modal-button" on:click={() => showQrCode = false}>×</button>
      
      <div class="qr-code-container">
        <h3>Scan QR Code to Share</h3>
        <p>Scan this code with a mobile device to share your results</p>
        
        <div class="qr-image-container">
          <img src={qrCodeDataUrl} alt="QR Code for your results" />
        </div>
        
        <div class="qr-code-actions">
          <Button variant="default" on:click={downloadQrCode}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Download QR Code</span>
          </Button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .results-container {
    padding-top: 2rem;
    padding-bottom: 4rem;
  }
  
  .results-header {
    margin-bottom: 2.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .trophy-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
  }
  
  .results-title {
    margin-bottom: 0.5rem;
  }
  
  .shared-badge,
  .demo-badge {
    margin-bottom: 1rem;
  }
  
  .demo-note {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }
  
  :global(.exit-demo-button) {
    font-size: 0.9rem;
    padding: 0.5rem 1.25rem;
  }
  
  .top-choice {
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(99, 102, 241, 0.1));
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: var(--shadow-md);
    border: 1px solid var(--card-border);
    position: relative;
    overflow: hidden;
    max-width: 300px;
  }
  
  .top-choice::before {
    content: '';
    position: absolute;
    top: -20px;
    left: -20px;
    width: 60px;
    height: 60px;
    background: var(--primary-color);
    transform: rotate(45deg);
    z-index: 1;
  }
  
  .top-choice-image {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    overflow: hidden;
    margin-bottom: 1rem;
    border: 3px solid var(--primary-color);
    box-shadow: var(--shadow-lg);
  }
  
  .top-choice-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .top-choice-info {
    text-align: center;
  }
  
  .first-badge {
    margin-bottom: 0.5rem;
  }
  
  .top-food-name {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }
  
  :global(.rating-value) {
    font-size: 0.875rem;
    opacity: 0.8;
  }
  
  .results-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .card-header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
  }
  
  .ranked-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .ranked-item {
    display: flex;
    padding: 0.75rem;
    border-radius: 8px;
    background-color: rgba(30, 41, 59, 0.4);
    border: 1px solid var(--card-border);
    transition: all 0.2s ease;
  }
  
  .ranked-item:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    background-color: rgba(30, 41, 59, 0.6);
    border-color: var(--card-hover-border);
  }
  
  .top-three {
    background: linear-gradient(to right, rgba(16, 185, 129, 0.1), rgba(99, 102, 241, 0.1));
    border-left: 3px solid var(--primary-color);
  }
  
  .rank {
    display: flex;
    align-items: center;
    padding-right: 1rem;
  }
  
  :global(.rank-badge) {
    min-width: 2.5rem;
    display: flex;
    justify-content: center;
  }
  
  .food-content {
    display: flex;
    flex: 1;
    align-items: center;
  }
  
  .food-image {
    width: 50px;
    height: 50px;
    border-radius: 8px;
    overflow: hidden;
    margin-right: 1rem;
  }
  
  .food-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .food-info {
    flex: 1;
  }
  
  :global(.food-name) {
    font-weight: 600;
    margin-bottom: 0.25rem;
  }
  
  :global(.food-description) {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .rating {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-left: 1rem;
    min-width: 80px;
  }
  
  .rating-score {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    color: white;
    width: 60px;
    height: 30px;
    border-radius: 15px;
    margin-bottom: 0.25rem;
  }
  
  :global(.score) {
    font-weight: 600;
    font-size: 0.875rem;
  }
  
  .actions-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }
  
  :global(.action-button) {
    width: 100%;
  }
  
  .share-url-container {
    display: flex;
    margin: 1rem 0;
    gap: 0.5rem;
  }
  
  .share-url {
    flex: 1;
    padding: 0.75rem;
    border-radius: 8px;
    border: 1px solid var(--card-border);
    background-color: rgba(15, 23, 42, 0.3);
    color: var(--text-color);
    font-size: 0.875rem;
  }
  
  :global(.copy-button) {
    min-width: 80px;
  }
  
  .share-options {
    display: flex;
    justify-content: center;
    margin: 1rem 0;
  }
  
  :global(.qr-button) {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .qr-code-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 1rem;
  }
  
  .qr-code-modal {
    background: linear-gradient(135deg, #1e293b, #0f172a);
    border-radius: 16px;
    padding: 2rem;
    position: relative;
    width: 100%;
    max-width: 400px;
    box-shadow: var(--shadow-xl);
    border: 1px solid var(--card-border);
    animation: modalAppear 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  @keyframes modalAppear {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  
  .close-modal-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: var(--card-bg);
    border: 1px solid var(--card-border);
    color: var(--text-color);
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .close-modal-button:hover {
    background-color: var(--card-hover-border);
    transform: scale(1.05);
  }
  
  .qr-code-container {
    text-align: center;
  }
  
  .qr-code-container h3 {
    margin-top: 0;
    margin-bottom: 0.5rem;
    font-size: 1.5rem;
    color: var(--text-color);
  }
  
  .qr-code-container p {
    color: var(--muted-color);
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
  }
  
  .qr-image-container {
    background-color: white;
    padding: 1rem;
    border-radius: 12px;
    display: inline-block;
    margin-bottom: 1.5rem;
    box-shadow: var(--shadow-md);
  }
  
  .qr-image-container img {
    display: block;
    max-width: 100%;
    width: 256px;
    height: 256px;
  }
  
  .qr-code-actions {
    display: flex;
    justify-content: center;
  }
  
  .qr-code-actions :global(.btn) {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  :global(.social-label) {
    margin-bottom: 0.75rem;
  }
  
  .social-buttons {
    display: flex;
    gap: 0.75rem;
  }
  
  .social-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s ease;
    box-shadow: var(--shadow-sm);
  }
  
  .social-button svg {
    flex-shrink: 0;
  }
  
  .social-button.twitter {
    background-color: #1DA1F2;
    color: white;
  }
  
  .social-button.facebook {
    background-color: #4267B2;
    color: white;
  }
  
  .social-button.linkedin {
    background-color: #0077B5;
    color: white;
  }
  
  .social-button.whatsapp {
    background-color: #25D366;
    color: white;
  }
  
  .social-button:hover {
    opacity: 0.95;
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  
  .social-button:active {
    transform: translateY(0);
  }
  
  @media (min-width: 768px) {
    .results-grid {
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
    }
    
    .side-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
  }
  
  @media (max-width: 767px) {
    .side-content > * {
      margin-bottom: 1.5rem;
    }
    
    .social-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }
    
    .social-button span {
      display: none;
    }
    
    .social-button {
      padding: 0.75rem;
      justify-content: center;
    }
    
    .social-button svg {
      width: 20px;
      height: 20px;
    }
    
    .qr-image-container img {
      width: 200px;
      height: 200px;
    }
  }
</style>