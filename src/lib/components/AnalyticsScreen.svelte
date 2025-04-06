<script>
  import { onMount, afterUpdate } from 'svelte';
  import { APP_STATES } from '../stores/appState.js';
  import appState from '../stores/appState.js';
  import foodItems from '../stores/foodItems.js';
  import { 
    sortItemsByRating, 
    calculateExpectedOutcome
  } from '../utils/eloRating.js';
  import { 
    Container, Heading, Text, Button, Card, 
    CardHeader, CardContent, CardFooter, Badge 
  } from '../ui';
  
  // State variables
  let rankedFoodItems = [];
  let comparisonHistory = [];
  let progressData = {};
  let preferenceClusters = [];
  let personalizedRecommendations = [];
  let currentTab = 'statistics';
  let isDemoMode = false;
  let statsHighlights = {
    highestRated: null,
    lowestRated: null,
    averageRating: 0,
    ratingRange: 0,
    totalComparisons: 0,
    mostCompared: null,
    leastCompared: null
  };
  
  // Chart objects
  let ratingDistributionChart = null;
  let ratingProgressionChart = null;
  let clusterChart = null;
  
  onMount(() => {
    // Subscribe to stores
    const unsubscribeFoodItems = foodItems.subscribe(items => {
      rankedFoodItems = sortItemsByRating(items);
      calculateStatsHighlights();
      generateClusters();
      generateRecommendations();
    });
    
    const unsubscribeAppState = appState.subscribe(state => {
      comparisonHistory = state.comparisonHistory || [];
      isDemoMode = state.isDemoMode || false;
      statsHighlights.totalComparisons = comparisonHistory.length;
      
      // Generate progression data for charts
      generateProgressionData();
    });
    
    // Load chart.js dynamically
    loadChartJs().then(() => {
      // Create charts after the DOM has updated
      setTimeout(() => {
        createDistributionChart();
        createProgressionChart();
        createClusterChart();
      }, 100);
    });
    
    // Cleanup function
    return () => {
      unsubscribeFoodItems();
      unsubscribeAppState();
      
      // Destroy charts to prevent memory leaks
      if (ratingDistributionChart) ratingDistributionChart.destroy();
      if (ratingProgressionChart) ratingProgressionChart.destroy();
      if (clusterChart) clusterChart.destroy();
    };
  });
  
  // Load Chart.js dynamically
  async function loadChartJs() {
    return new Promise((resolve, reject) => {
      if (window.Chart) {
        resolve(window.Chart);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.onload = () => {
        // Register all chart.js components
        if (window.Chart && window.Chart.register) {
          const registerables = [
            window.Chart.CategoryScale,
            window.Chart.LinearScale,
            window.Chart.BarController,
            window.Chart.LineController,
            window.Chart.PointElement,
            window.Chart.LineElement,
            window.Chart.BarElement,
            window.Chart.Tooltip,
            window.Chart.Legend,
            window.Chart.Title
          ];
          
          window.Chart.register(...registerables);
          resolve(window.Chart);
        } else {
          reject(new Error('Failed to load Chart.js or its components'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load Chart.js'));
      document.head.appendChild(script);
    });
  }
  
  // Generate statistical highlights
  function calculateStatsHighlights() {
    if (!rankedFoodItems || rankedFoodItems.length === 0) return;
    
    statsHighlights.highestRated = rankedFoodItems[0];
    statsHighlights.lowestRated = rankedFoodItems[rankedFoodItems.length - 1];
    
    // Calculate average rating
    const totalRating = rankedFoodItems.reduce((sum, item) => sum + item.rating, 0);
    statsHighlights.averageRating = Math.round(totalRating / rankedFoodItems.length);
    
    // Calculate rating range
    statsHighlights.ratingRange = statsHighlights.highestRated.rating - statsHighlights.lowestRated.rating;
    
    // Find most and least compared items
    const comparisonCounts = {};
    rankedFoodItems.forEach(item => {
      comparisonCounts[item.id] = 0;
    });
    
    comparisonHistory.forEach(comp => {
      if (comp.itemA && comp.itemA.id) comparisonCounts[comp.itemA.id]++;
      if (comp.itemB && comp.itemB.id) comparisonCounts[comp.itemB.id]++;
    });
    
    let maxComparisons = 0;
    let minComparisons = Infinity;
    let mostComparedId = null;
    let leastComparedId = null;
    
    Object.entries(comparisonCounts).forEach(([id, count]) => {
      if (count > maxComparisons) {
        maxComparisons = count;
        mostComparedId = id;
      }
      if (count < minComparisons) {
        minComparisons = count;
        leastComparedId = id;
      }
    });
    
    statsHighlights.mostCompared = rankedFoodItems.find(item => item.id == mostComparedId);
    statsHighlights.leastCompared = rankedFoodItems.find(item => item.id == leastComparedId);
  }
  
  // Generate progression data for tracking rating changes over time
  function generateProgressionData() {
    if (!comparisonHistory || comparisonHistory.length === 0) return;
    
    // Initial ratings (1200 for all items)
    progressData = {};
    rankedFoodItems.forEach(item => {
      progressData[item.id] = {
        name: item.name,
        ratings: [1200],
        color: getRandomColor(item.id)
      };
    });
    
    // Process history to calculate rating progression
    let currentRatings = {};
    rankedFoodItems.forEach(item => {
      currentRatings[item.id] = 1200;
    });
    
    comparisonHistory.forEach((comparison, index) => {
      // Update item A rating
      if (comparison.itemA && comparison.itemA.id && currentRatings[comparison.itemA.id] !== undefined) {
        const itemA = comparison.itemA;
        const itemB = comparison.itemB;
        const actualOutcomeA = comparison.winner.id === itemA.id ? 1 : 0;
        
        const expectedOutcomeA = calculateExpectedOutcome(
          currentRatings[itemA.id],
          currentRatings[itemB.id]
        );
        
        const newRatingA = Math.round(
          currentRatings[itemA.id] + 32 * (actualOutcomeA - expectedOutcomeA)
        );
        
        currentRatings[itemA.id] = newRatingA;
        progressData[itemA.id].ratings.push(newRatingA);
      }
      
      // Update item B rating
      if (comparison.itemB && comparison.itemB.id && currentRatings[comparison.itemB.id] !== undefined) {
        const itemA = comparison.itemA;
        const itemB = comparison.itemB;
        const actualOutcomeB = comparison.winner.id === itemB.id ? 1 : 0;
        
        const expectedOutcomeB = calculateExpectedOutcome(
          currentRatings[itemB.id],
          currentRatings[itemA.id]
        );
        
        const newRatingB = Math.round(
          currentRatings[itemB.id] + 32 * (actualOutcomeB - expectedOutcomeB)
        );
        
        currentRatings[itemB.id] = newRatingB;
        progressData[itemB.id].ratings.push(newRatingB);
      }
    });
  }
  
  // Generate preference clusters based on ratings and comparisons
  function generateClusters() {
    if (!rankedFoodItems || rankedFoodItems.length < 4) return;
    
    // Create food categories based on item names for this demo
    // In a real app, you would have more sophisticated categorization
    const categories = {
      sweets: ['cake', 'ice cream', 'dessert', 'chocolate', 'cheesecake', 'pastry', 'cookie', 'pudding'],
      savory: ['pizza', 'burger', 'steak', 'sandwich', 'beef', 'bacon', 'sausage', 'hot dog'],
      pasta: ['pasta', 'spaghetti', 'lasagna', 'noodle', 'macaroni', 'ravioli'],
      asian: ['sushi', 'ramen', 'dumpling', 'rice', 'curry', 'wok', 'stir fry', 'spring roll'],
      mexican: ['taco', 'burrito', 'quesadilla', 'nacho', 'enchilada', 'salsa', 'guacamole']
    };
    
    // Categorize foods
    const categorizedItems = {};
    
    Object.entries(categories).forEach(([category, keywords]) => {
      categorizedItems[category] = rankedFoodItems.filter(item => 
        keywords.some(keyword => 
          item.name.toLowerCase().includes(keyword)
        )
      );
    });
    
    // Calculate average rating for each category
    const clusterData = Object.entries(categorizedItems)
      .filter(([_, items]) => items.length > 0)
      .map(([category, items]) => {
        const avgRating = items.reduce((sum, item) => sum + item.rating, 0) / items.length;
        return {
          name: formatCategoryName(category),
          items: items,
          avgRating: Math.round(avgRating),
          color: getCategoryColor(category)
        };
      })
      .sort((a, b) => b.avgRating - a.avgRating);
    
    preferenceClusters = clusterData;
  }
  
  // Generate personalized food recommendations
  function generateRecommendations() {
    if (!rankedFoodItems || rankedFoodItems.length < 3) return;
    
    // Get top 3 highest rated foods
    const topFoods = rankedFoodItems.slice(0, 3);
    
    // Food pairings for recommendations
    const foodPairings = {
      'Pizza': ['Garlic Bread', 'Italian Salad', 'Tiramisu', 'Calzone', 'Focaccia'],
      'Burger': ['Fries', 'Onion Rings', 'Milkshake', 'Coleslaw', 'Sliders'],
      'Sushi': ['Miso Soup', 'Gyoza', 'Tempura', 'Sashimi', 'Green Tea Ice Cream'],
      'Pasta': ['Caprese Salad', 'Bruschetta', 'Italian Wine', 'Garlic Bread', 'Cannoli'],
      'Tacos': ['Guacamole', 'Nachos', 'Margarita', 'Churros', 'Quesadillas'],
      'Steak': ['Mashed Potatoes', 'Red Wine', 'Creamed Spinach', 'Mushroom Sauce', 'Grilled Asparagus'],
      'Curry': ['Naan Bread', 'Samosas', 'Rice Pudding', 'Mango Lassi', 'Onion Bhaji'],
      'Ramen': ['Gyoza', 'Takoyaki', 'Japanese Beer', 'Edamame', 'Green Tea Mochi'],
      'Cheesecake': ['Coffee', 'Fresh Berries', 'Ice Cream', 'Chocolate Sauce', 'Fruit Tart'],
      'Lasagna': ['Garlic Bread', 'Caesar Salad', 'Tiramisu', 'Italian Wine', 'Cannoli']
    };
    
    // Generate recommendations based on top foods
    personalizedRecommendations = topFoods
      .filter(food => food && food.name)
      .map(food => {
        // Find the closest match in our pairings database
        const bestMatch = Object.keys(foodPairings).find(key => 
          food.name.toLowerCase().includes(key.toLowerCase())
        ) || Object.keys(foodPairings)[0];
        
        return {
          basedOn: food.name,
          recommendations: foodPairings[bestMatch] || foodPairings[Object.keys(foodPairings)[0]],
          rating: food.rating,
          imageUrl: food.imageUrl,
          fallbackImageUrl: food.fallbackImageUrl
        };
      });
  }
  
  // Create rating distribution chart
  function createDistributionChart() {
    const ctx = document.getElementById('rating-distribution-chart');
    if (!ctx || !rankedFoodItems || rankedFoodItems.length === 0 || !window.Chart) return;
    
    // Prepare data
    const labels = rankedFoodItems.map(item => item.name);
    const data = rankedFoodItems.map(item => item.rating);
    const backgroundColors = rankedFoodItems.map((item, i) => {
      const hue = (i * 137) % 360; // Generate distinct colors
      return `hsla(${hue}, 70%, 60%, 0.7)`;
    });
    
    // Create chart
    ratingDistributionChart = new window.Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Elo Rating',
          data,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
          borderWidth: 1
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Food Preference Ratings',
            color: 'rgba(248, 250, 252, 0.9)',
            font: {
              size: 16
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: 'rgba(248, 250, 252, 0.7)'
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: 'rgba(248, 250, 252, 0.7)'
            }
          }
        }
      }
    });
  }
  
  // Create rating progression chart
  function createProgressionChart() {
    const ctx = document.getElementById('rating-progression-chart');
    if (!ctx || !comparisonHistory || comparisonHistory.length === 0 || !window.Chart) return;
    
    // Process progression data into datasets
    const datasets = Object.values(progressData)
      .filter(item => item.ratings.length > 1)
      .map(item => {
        return {
          label: item.name,
          data: item.ratings,
          borderColor: item.color,
          backgroundColor: item.color.replace('1)', '0.1)'),
          tension: 0.3,
          pointRadius: 3,
          pointHoverRadius: 5
        };
      });
    
    // Create labels for x-axis (comparison numbers)
    const maxComparisons = Math.max(...Object.values(progressData).map(item => item.ratings.length));
    const labels = Array.from({ length: maxComparisons }, (_, i) => `#${i+1}`);
    
    ratingProgressionChart = new window.Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: 'rgba(248, 250, 252, 0.7)'
            }
          },
          title: {
            display: true,
            text: 'Rating Progression Over Time',
            color: 'rgba(248, 250, 252, 0.9)',
            font: {
              size: 16
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Comparison Number',
              color: 'rgba(248, 250, 252, 0.7)'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: 'rgba(248, 250, 252, 0.7)'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Elo Rating',
              color: 'rgba(248, 250, 252, 0.7)'
            },
            min: Math.min(1000, Math.min(...datasets.flatMap(d => d.data)) - 50),
            max: Math.max(1400, Math.max(...datasets.flatMap(d => d.data)) + 50),
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: 'rgba(248, 250, 252, 0.7)'
            }
          }
        }
      }
    });
  }
  
  // Create cluster preference chart
  function createClusterChart() {
    const ctx = document.getElementById('cluster-chart');
    if (!ctx || !preferenceClusters || preferenceClusters.length === 0 || !window.Chart) return;
    
    // Prepare data
    const labels = preferenceClusters.map(cluster => cluster.name);
    const data = preferenceClusters.map(cluster => cluster.avgRating);
    const backgroundColors = preferenceClusters.map(cluster => cluster.color);
    
    // Create chart
    clusterChart = new window.Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Average Rating',
          data,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Preference by Food Category',
            color: 'rgba(248, 250, 252, 0.9)',
            font: {
              size: 16
            }
          },
          tooltip: {
            callbacks: {
              afterLabel: function(context) {
                const clusterIndex = context.dataIndex;
                const items = preferenceClusters[clusterIndex].items;
                if (items.length <= 0) return '';
                
                let result = '\nItems:';
                items.slice(0, 3).forEach(item => {
                  result += `\n- ${item.name} (${item.rating})`;
                });
                
                if (items.length > 3) {
                  result += `\n- ... and ${items.length - 3} more`;
                }
                
                return result;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: 'rgba(248, 250, 252, 0.7)'
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: 'rgba(248, 250, 252, 0.7)'
            }
          }
        }
      }
    });
  }
  
  // Format category name for display
  function formatCategoryName(category) {
    return category.charAt(0).toUpperCase() + category.slice(1) + ' Foods';
  }
  
  // Get a deterministic color based on category
  function getCategoryColor(category) {
    const colorMap = {
      'sweets': 'hsla(340, 80%, 60%, 0.7)', // Pink
      'savory': 'hsla(200, 80%, 60%, 0.7)', // Blue
      'pasta': 'hsla(35, 80%, 60%, 0.7)',   // Orange
      'asian': 'hsla(100, 70%, 45%, 0.7)',  // Green
      'mexican': 'hsla(0, 80%, 60%, 0.7)'   // Red
    };
    
    return colorMap[category] || `hsla(${Math.floor(Math.random() * 360)}, 70%, 60%, 0.7)`;
  }
  
  // Get a deterministic color based on id
  function getRandomColor(id) {
    // Generate a hue based on the id
    const hue = ((id * 137) % 360);
    return `hsla(${hue}, 70%, 60%, 1)`;
  }
  
  // Navigation functions
  function navigateToResults() {
    appState.update(state => ({
      ...state,
      currentState: APP_STATES.RESULTS
    }));
  }
  
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
  
  // Tab handling
  function setActiveTab(tab) {
    currentTab = tab;
    
    // Rerender charts after tab change if needed
    if (tab === 'statistics' && (!ratingDistributionChart || !ratingProgressionChart)) {
      setTimeout(() => {
        createDistributionChart();
        createProgressionChart();
      }, 100);
    } else if (tab === 'clustering' && !clusterChart) {
      setTimeout(() => {
        createClusterChart();
      }, 100);
    }
  }
</script>

<Container className="analytics-container">
  <header>
    <Heading>Analytics Dashboard</Heading>
    <Text lead={true}>Insights and analysis of your food preferences</Text>
    
    {#if isDemoMode}
      <div class="demo-banner">
        <Badge variant="accent">Demo Mode</Badge>
        <Text size="sm">This is sample data to demonstrate analytics features</Text>
        <Button variant="secondary" className="exit-demo-button" on:click={exitDemo}>
          Exit Demo
        </Button>
      </div>
    {/if}
    
    <Button variant="outline" on:click={navigateToResults}>Return to Results</Button>
  </header>

  <div class="tabs">
    <div class="tab-list">
      <button 
        class="tab-button" 
        class:active={currentTab === 'statistics'} 
        on:click={() => setActiveTab('statistics')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
          <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
          <line x1="6" y1="6" x2="6" y2="6"></line>
          <line x1="6" y1="18" x2="6" y2="18"></line>
        </svg>
        <span>Statistical Analysis</span>
      </button>
      
      <button 
        class="tab-button" 
        class:active={currentTab === 'clustering'} 
        on:click={() => setActiveTab('clustering')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="6" cy="6" r="3"></circle>
          <circle cx="6" cy="18" r="3"></circle>
          <circle cx="18" cy="12" r="3"></circle>
          <line x1="8.3" y1="7.8" x2="15.7" y2="10.2"></line>
          <line x1="8.3" y1="16.2" x2="15.7" y2="13.8"></line>
        </svg>
        <span>Preference Clusters</span>
      </button>
      
      <button 
        class="tab-button" 
        class:active={currentTab === 'history'} 
        on:click={() => setActiveTab('history')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <span>Comparison History</span>
      </button>
      
      <button 
        class="tab-button" 
        class:active={currentTab === 'recommendations'} 
        on:click={() => setActiveTab('recommendations')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
          <path d="M2 17l10 5 10-5"></path>
          <path d="M2 12l10 5 10-5"></path>
        </svg>
        <span>Recommendations</span>
      </button>
    </div>
    
    <div class="tab-content">
      {#if currentTab === 'statistics'}
        <div class="statistics-panel">
          <div class="stats-highlights">
            <Card className="stats-card">
              <CardContent>
                <Heading level={3} size="h4">Statistical Highlights</Heading>
                
                <div class="stats-grid">
                  <div class="stat-item">
                    <div class="stat-icon highest-rated">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="18 15 12 9 6 15"></polyline>
                      </svg>
                    </div>
                    <div class="stat-content">
                      <Text size="sm" muted={true}>Highest Rated</Text>
                      <Text className="stat-value">
                        {statsHighlights.highestRated ? statsHighlights.highestRated.name : 'N/A'}
                      </Text>
                      <Badge variant="default">
                        {statsHighlights.highestRated ? statsHighlights.highestRated.rating : '--'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div class="stat-item">
                    <div class="stat-icon lowest-rated">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>
                    <div class="stat-content">
                      <Text size="sm" muted={true}>Lowest Rated</Text>
                      <Text className="stat-value">
                        {statsHighlights.lowestRated ? statsHighlights.lowestRated.name : 'N/A'}
                      </Text>
                      <Badge variant="secondary">
                        {statsHighlights.lowestRated ? statsHighlights.lowestRated.rating : '--'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div class="stat-item">
                    <div class="stat-icon average-rating">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 20V10"></path>
                        <path d="M12 20V4"></path>
                        <path d="M6 20V14"></path>
                      </svg>
                    </div>
                    <div class="stat-content">
                      <Text size="sm" muted={true}>Average Rating</Text>
                      <Text className="stat-value">
                        {statsHighlights.averageRating || 'N/A'}
                      </Text>
                      <Text size="xs" muted={true}>Across all food items</Text>
                    </div>
                  </div>
                  
                  <div class="stat-item">
                    <div class="stat-icon total-comparisons">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                      </svg>
                    </div>
                    <div class="stat-content">
                      <Text size="sm" muted={true}>Comparisons</Text>
                      <Text className="stat-value">
                        {statsHighlights.totalComparisons || 0}
                      </Text>
                      <Text size="xs" muted={true}>Total decisions made</Text>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div class="charts-grid">
            <Card className="chart-card">
              <CardContent>
                <Heading level={3} size="h4">Rating Distribution</Heading>
                <Text size="sm" muted={true} className="chart-desc">Shows your food preference ratings from highest to lowest</Text>
                
                <div class="chart-container">
                  <canvas id="rating-distribution-chart"></canvas>
                </div>
              </CardContent>
            </Card>
            
            <Card className="chart-card">
              <CardContent>
                <Heading level={3} size="h4">Rating Progression</Heading>
                <Text size="sm" muted={true} className="chart-desc">Tracks how ratings evolved with each comparison</Text>
                
                <div class="chart-container">
                  <canvas id="rating-progression-chart"></canvas>
                </div>
                
                <Text size="xs" muted={true} className="chart-note">
                  Steeper slopes indicate more impactful decisions
                </Text>
              </CardContent>
            </Card>
          </div>
        </div>
      {:else if currentTab === 'clustering'}
        <div class="clustering-panel">
          <div class="cluster-section">
            <Card className="cluster-chart-card">
              <CardContent>
                <Heading level={3} size="h4">Preference Patterns</Heading>
                <Text size="sm" muted={true} className="chart-desc">
                  Analysis of your food preferences by category
                </Text>
                
                <div class="chart-container">
                  <canvas id="cluster-chart"></canvas>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Heading level={3} size="h4" className="clusters-heading">Taste Preference Clusters</Heading>
          <Text size="sm" muted={true} className="clusters-desc">
            Based on your preferences, we've identified these taste patterns:
          </Text>
          
          <div class="clusters-grid">
            {#each preferenceClusters as cluster}
              <Card className="cluster-card">
                <CardHeader>
                  <div class="cluster-header">
                    <Heading level={4} size="h5">{cluster.name}</Heading>
                    <Badge variant="outline">Avg: {cluster.avgRating}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div class="cluster-items">
                    {#each cluster.items.slice(0, 4) as item}
                      <div class="cluster-item">
                        <div class="item-image">
                          <img 
                            src={item.imageUrl} 
                            alt={item.name}
                            on:error={(e) => {
                              if (item.fallbackImageUrl) {
                                e.target.src = item.fallbackImageUrl;
                              }
                            }}
                          />
                        </div>
                        <Text size="sm" className="item-name">{item.name}</Text>
                        <Badge variant="secondary" className="item-rating">{item.rating}</Badge>
                      </div>
                    {/each}
                    
                    {#if cluster.items.length > 4}
                      <div class="cluster-item more-items">
                        <div class="more-count">+{cluster.items.length - 4}</div>
                        <Text size="xs">more items</Text>
                      </div>
                    {/if}
                  </div>
                </CardContent>
              </Card>
            {/each}
            
            {#if preferenceClusters.length === 0}
              <div class="no-data-message">
                <Text>Not enough comparisons to generate clusters.</Text>
                <Text size="sm" muted={true}>Complete more food comparisons to see taste patterns.</Text>
              </div>
            {/if}
          </div>
        </div>
      {:else if currentTab === 'history'}
        <div class="history-panel">
          <Card className="history-card">
            <CardContent>
              <Heading level={3} size="h4">Comparison Timeline</Heading>
              <Text size="sm" muted={true} className="history-desc">
                A record of all your food preference decisions
              </Text>
              
              {#if comparisonHistory.length > 0}
                <div class="timeline">
                  {#each comparisonHistory as comparison, index}
                    <div class="timeline-item">
                      <div class="timeline-marker" class:important-decision={
                        comparison.itemA && comparison.itemB && 
                        Math.abs(comparison.itemA.rating - comparison.itemB.rating) < 50
                      }></div>
                      <div class="timeline-content">
                        <div class="timeline-header">
                          <Badge variant="outline" className="comparison-number">#{index + 1}</Badge>
                          <Text size="xs" muted={true} className="comparison-time">
                            {new Date(comparison.timestamp).toLocaleString()}
                          </Text>
                        </div>
                        
                        <div class="comparison-detail">
                          <div class="comparison-item winner">
                            <div class="comparison-image">
                              <img 
                                src={comparison.winner.imageUrl} 
                                alt={comparison.winner.name}
                                on:error={(e) => {
                                  if (comparison.winner.fallbackImageUrl) {
                                    e.target.src = comparison.winner.fallbackImageUrl;
                                  }
                                }}
                              />
                              <div class="winner-badge">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              </div>
                            </div>
                            <Text size="sm" className="comparison-name">{comparison.winner.name}</Text>
                          </div>
                          
                          <div class="vs-indicator">vs</div>
                          
                          <div class="comparison-item loser">
                            <div class="comparison-image">
                              <img 
                                src={comparison.loser.imageUrl} 
                                alt={comparison.loser.name}
                                on:error={(e) => {
                                  if (comparison.loser.fallbackImageUrl) {
                                    e.target.src = comparison.loser.fallbackImageUrl;
                                  }
                                }}
                              />
                            </div>
                            <Text size="sm" className="comparison-name">{comparison.loser.name}</Text>
                          </div>
                        </div>
                        
                        <div class="rating-change">
                          <div class="rating-before-after">
                            <Text size="xs" muted={true}>Rating change:</Text>
                            <div class="rating-values">
                              <span class="before">{comparison.winner.rating - (comparison.winner.id === comparison.itemA.id ? (comparison.winner.rating - comparison.itemA.rating) : (comparison.winner.rating - comparison.itemB.rating))}</span>
                              <span class="arrow">→</span>
                              <span class="after">{comparison.winner.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  {/each}
                </div>
              {:else}
                <div class="no-data-message">
                  <Text>No comparison history available.</Text>
                  <Text size="sm" muted={true}>Complete food comparisons to see your decision history.</Text>
                </div>
              {/if}
            </CardContent>
          </Card>
        </div>
      {:else if currentTab === 'recommendations'}
        <div class="recommendations-panel">
          <Card className="intro-card">
            <CardContent>
              <Heading level={3} size="h4">Personalized Recommendations</Heading>
              <Text size="sm" muted={true}>
                Based on your top-rated foods, you might enjoy these pairings and similar items:
              </Text>
            </CardContent>
          </Card>
          
          {#if personalizedRecommendations.length > 0}
            <div class="recommendations-grid">
              {#each personalizedRecommendations as rec}
                <Card className="recommendation-card">
                  <CardHeader>
                    <div class="rec-header">
                      <div class="rec-image">
                        <img 
                          src={rec.imageUrl} 
                          alt={rec.basedOn}
                          on:error={(e) => {
                            if (rec.fallbackImageUrl) {
                              e.target.src = rec.fallbackImageUrl;
                            }
                          }}
                        />
                      </div>
                      <div class="rec-title">
                        <Text size="sm" muted={true}>Because you like</Text>
                        <Heading level={4} size="h5">{rec.basedOn}</Heading>
                        <Badge variant="default">{rec.rating}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div class="rec-subtitle">
                      <Text size="sm" muted={true}>You might also enjoy:</Text>
                    </div>
                    <div class="recommendation-items">
                      {#each rec.recommendations as item}
                        <div class="recommendation-item">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                          </svg>
                          <Text>{item}</Text>
                        </div>
                      {/each}
                    </div>
                  </CardContent>
                </Card>
              {/each}
            </div>
          {:else}
            <div class="no-data-message">
              <Text>Not enough data to generate recommendations.</Text>
              <Text size="sm" muted={true}>Complete more food comparisons to get personalized suggestions.</Text>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</Container>

<style>
  :global(.analytics-container) {
    padding-top: 2rem;
    padding-bottom: 4rem;
  }
  
  header {
    margin-bottom: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.5rem;
  }
  
  .demo-banner {
    margin: 1rem 0;
    padding: 0.75rem 1.5rem;
    background: rgba(244, 63, 94, 0.15);
    border: 1px solid rgba(244, 63, 94, 0.3);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
  
  /* Tabs */
  .tabs {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .tab-list {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
    scrollbar-width: thin;
    border-bottom: 1px solid var(--card-border);
  }
  
  .tab-list::-webkit-scrollbar {
    height: 5px;
  }
  
  .tab-list::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 5px;
  }
  
  .tab-list::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 5px;
  }
  
  .tab-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: rgba(30, 41, 59, 0.4);
    border: 1px solid var(--card-border);
    border-radius: 8px;
    color: var(--text-color);
    font-weight: 500;
    transition: all 0.2s ease;
    white-space: nowrap;
    flex-shrink: 0;
  }
  
  .tab-button svg {
    opacity: 0.7;
  }
  
  .tab-button:hover {
    background: rgba(30, 41, 59, 0.6);
    transform: translateY(-2px);
  }
  
  .tab-button.active {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(99, 102, 241, 0.2));
    border-color: rgba(99, 102, 241, 0.5);
    position: relative;
  }
  
  .tab-button.active::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
    border-radius: 3px;
  }
  
  .tab-content {
    min-height: 400px;
  }
  
  /* Statistics Panel */
  .statistics-panel {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-top: 1rem;
  }
  
  .stat-item {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: rgba(30, 41, 59, 0.4);
    border-radius: 8px;
    border: 1px solid var(--card-border);
    transition: all 0.2s ease;
  }
  
  .stat-item:hover {
    transform: translateY(-2px);
    background: rgba(30, 41, 59, 0.6);
    border-color: var(--card-hover-border);
    box-shadow: var(--shadow-md);
  }
  
  .stat-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    flex-shrink: 0;
  }
  
  .highest-rated {
    background: rgba(16, 185, 129, 0.2);
    color: #10b981;
  }
  
  .lowest-rated {
    background: rgba(244, 63, 94, 0.2);
    color: #f43f5e;
  }
  
  .average-rating {
    background: rgba(99, 102, 241, 0.2);
    color: #6366f1;
  }
  
  .total-comparisons {
    background: rgba(234, 179, 8, 0.2);
    color: #eab308;
  }
  
  .stat-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  :global(.stat-value) {
    font-weight: 600;
    font-size: 1.125rem;
  }
  
  .charts-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .chart-container {
    height: 300px;
    position: relative;
    margin-top: 1rem;
  }
  
  :global(.chart-desc) {
    margin-top: 0.25rem;
  }
  
  :global(.chart-note) {
    margin-top: 0.5rem;
    text-align: center;
    font-style: italic;
  }
  
  /* Clustering Panel */
  .clustering-panel {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  
  .cluster-section {
    margin-bottom: 1rem;
  }
  
  :global(.clusters-heading) {
    margin-bottom: 0.5rem;
  }
  
  :global(.clusters-desc) {
    margin-bottom: 1.5rem;
  }
  
  .clusters-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .cluster-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }
  
  .cluster-items {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
  }
  
  .cluster-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    width: 80px;
  }
  
  .item-image {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .item-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  :global(.item-name) {
    margin-bottom: 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  }
  
  :global(.item-rating) {
    font-size: 0.75rem;
  }
  
  .more-items {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  
  .more-count {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(99, 102, 241, 0.2);
    color: var(--secondary-color);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  
  /* History Panel */
  .history-panel {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  :global(.history-desc) {
    margin-bottom: 2rem;
  }
  
  .timeline {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .timeline-item {
    display: flex;
    gap: 1rem;
    position: relative;
  }
  
  .timeline-marker {
    width: 16px;
    height: 16px;
    background-color: var(--secondary-color);
    border-radius: 50%;
    margin-top: 1rem;
    flex-shrink: 0;
  }
  
  .important-decision {
    background-color: var(--primary-color);
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
  }
  
  .timeline-content {
    flex: 1;
    background: rgba(30, 41, 59, 0.4);
    border-radius: 8px;
    padding: 1rem;
    border: 1px solid var(--card-border);
  }
  
  .timeline-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }
  
  :global(.comparison-number) {
    font-size: 0.75rem;
  }
  
  :global(.comparison-time) {
    font-size: 0.75rem;
  }
  
  .comparison-detail {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }
  
  .comparison-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    flex: 1;
  }
  
  .comparison-image {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 0.5rem;
    position: relative;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .comparison-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .winner-badge {
    position: absolute;
    top: -10px;
    right: -10px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--primary-color);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    border: 2px solid rgba(15, 23, 42, 0.8);
  }
  
  :global(.comparison-name) {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 120px;
  }
  
  .vs-indicator {
    font-weight: 600;
    color: var(--muted-color);
    margin: 0 1rem;
  }
  
  .rating-change {
    display: flex;
    justify-content: flex-end;
    padding-top: 0.5rem;
    border-top: 1px dashed rgba(255, 255, 255, 0.1);
  }
  
  .rating-before-after {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.25rem;
  }
  
  .rating-values {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
  }
  
  .before {
    color: var(--muted-color);
  }
  
  .arrow {
    color: var(--primary-color);
    font-weight: 600;
  }
  
  .after {
    color: var(--primary-color);
    font-weight: 600;
  }
  
  /* Recommendations Panel */
  .recommendations-panel {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .recommendations-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .rec-header {
    display: flex;
    gap: 1rem;
    align-items: center;
  }
  
  .rec-image {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .rec-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .rec-title {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .rec-subtitle {
    margin-bottom: 1rem;
  }
  
  .recommendation-items {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .recommendation-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: rgba(30, 41, 59, 0.4);
    border-radius: 8px;
    border: 1px solid var(--card-border);
    transition: all 0.2s ease;
  }
  
  .recommendation-item:hover {
    transform: translateY(-2px);
    background: rgba(30, 41, 59, 0.6);
    border-color: var(--card-hover-border);
  }
  
  .recommendation-item svg {
    color: var(--primary-color);
    flex-shrink: 0;
  }
  
  .no-data-message {
    text-align: center;
    padding: 3rem 1rem;
    background: rgba(30, 41, 59, 0.4);
    border-radius: 8px;
    border: 1px dashed var(--card-border);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
  
  /* Responsive Styling */
  @media (min-width: 640px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .recommendation-items {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (min-width: 768px) {
    .charts-grid {
      grid-template-columns: 1fr 1fr;
    }
    
    .clusters-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .recommendations-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (min-width: 1024px) {
    .clusters-grid {
      grid-template-columns: repeat(3, 1fr);
    }
    
    .recommendations-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  
  @media (max-width: 639px) {
    .tab-button span {
      display: none;
    }
    
    .tab-button {
      padding: 0.75rem;
    }
    
    .tab-button svg {
      width: 20px;
      height: 20px;
    }
  }
</style>