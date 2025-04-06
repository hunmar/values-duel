/**
 * Calculate the expected outcome for an item in a comparison based on Elo rating
 * @param {number} ratingA - Rating of the first item
 * @param {number} ratingB - Rating of the second item
 * @returns {number} - Expected outcome for item A (between 0 and 1)
 */
export function calculateExpectedOutcome(ratingA, ratingB) {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * Calculate category similarity between two food items
 * @param {Object} itemA - First food item with categories
 * @param {Object} itemB - Second food item with categories
 * @returns {number} - Similarity score between 0 and 1
 */
export function calculateCategorySimilarity(itemA, itemB) {
  if (!itemA || !itemB || !itemA.categories || !itemB.categories) {
    return 0;
  }

  let matchCount = 0;
  let totalCategories = 0;

  // Check each category type
  const categoryTypes = ['cuisine', 'type', 'dietary', 'ingredient', 'cookingMethod'];

  categoryTypes.forEach(categoryType => {
    const valueA = itemA.categories[categoryType];
    const valueB = itemB.categories[categoryType];

    // Skip if either item doesn't have this category
    if (!valueA || !valueB) return;

    // Handle both single values and arrays
    const valuesA = Array.isArray(valueA) ? valueA : [valueA];
    const valuesB = Array.isArray(valueB) ? valueB : [valueB];

    // Count matches
    valuesA.forEach(vA => {
      if (valuesB.includes(vA)) {
        matchCount++;
      }
    });

    // Count total possible matches (unique values across both items)
    const uniqueValues = new Set([...valuesA, ...valuesB]);
    totalCategories += uniqueValues.size;
  });

  // Calculate similarity score
  return totalCategories > 0 ? matchCount / totalCategories : 0;
}

/**
 * Predict preference between two items based on user's comparison history and category similarities
 * @param {Object} itemA - First food item
 * @param {Object} itemB - Second food item
 * @param {Array} comparisonHistory - Array of previous comparisons
 * @returns {Object} - Prediction object with expected outcome and confidence
 */
export function predictPreference(itemA, itemB, comparisonHistory = []) {
  if (!itemA || !itemB || !comparisonHistory) {
    return {
      expectedOutcomeA: 0.5,
      confidence: 0
    };
  }

  // Base prediction on Elo ratings
  const eloPrediction = calculateExpectedOutcome(itemA.rating, itemB.rating);

  // If we have very few comparisons, just use Elo
  if (comparisonHistory.length < 5) {
    return {
      expectedOutcomeA: eloPrediction,
      confidence: 0.3
    };
  }

  // Calculate category similarity
  const similarity = calculateCategorySimilarity(itemA, itemB);

  // Find similar comparisons in history to learn from
  const similarComparisons = comparisonHistory
    .filter(comp => {
      if (!comp.itemA || !comp.itemB || !comp.winner) return false;

      // Calculate similarity between current items and historical comparison
      const simA1 = calculateCategorySimilarity(itemA, comp.itemA);
      const simB2 = calculateCategorySimilarity(itemB, comp.itemB);
      const simA2 = calculateCategorySimilarity(itemA, comp.itemB);
      const simB1 = calculateCategorySimilarity(itemB, comp.itemA);

      // Consider this a similar comparison if the average similarity is high enough
      const avgSimilarity = (simA1 + simB2 + simA2 + simB1) / 4;
      return avgSimilarity > 0.3;
    });

  // If we don't have enough similar comparisons, rely more on Elo
  if (similarComparisons.length < 3) {
    return {
      expectedOutcomeA: eloPrediction,
      confidence: 0.4
    };
  }

  // Calculate preference patterns from similar comparisons
  let patternScore = 0;
  let patternWeight = 0;

  similarComparisons.forEach(comp => {
    // Determine if the comparison is in the same or opposite direction
    const sameDirection = (
      (calculateCategorySimilarity(itemA, comp.itemA) > calculateCategorySimilarity(itemA, comp.itemB)) &&
      (calculateCategorySimilarity(itemB, comp.itemB) > calculateCategorySimilarity(itemB, comp.itemA))
    );

    // Get the outcome of the historical comparison
    const historicalOutcome = comp.winner.id === comp.itemA.id ? 1 : 0;

    // If same direction, use the historical outcome; if opposite, use the inverse
    const relevantOutcome = sameDirection ? historicalOutcome : 1 - historicalOutcome;

    // Calculate similarity weight for this comparison
    const simWeight = calculateCategorySimilarity(
      sameDirection ? itemA : itemB,
      comp.winner
    );

    // Add to pattern score
    patternScore += relevantOutcome * simWeight;
    patternWeight += simWeight;
  });

  // Calculate pattern-based prediction
  const patternPrediction = patternWeight > 0 ? patternScore / patternWeight : 0.5;

  // Combine Elo and pattern predictions
  // As more comparisons are made, rely more on patterns and less on Elo
  const patternConfidence = Math.min(0.8, similarComparisons.length / 20);
  const combinedPrediction = (
    eloPrediction * (1 - patternConfidence) +
    patternPrediction * patternConfidence
  );

  // Calculate overall confidence
  const confidence = 0.3 + (patternConfidence * 0.5) + (similarity * 0.2);

  return {
    expectedOutcomeA: combinedPrediction,
    confidence: Math.min(0.9, confidence)
  };
}

/**
 * Update the ratings of two items after a comparison
 * @param {number} ratingA - Current rating of item A
 * @param {number} ratingB - Current rating of item B
 * @param {number} actualOutcomeA - Actual outcome for item A (1 if A wins, 0 if B wins)
 * @param {number} kFactor - K-factor determining how drastically ratings change (default: 32)
 * @returns {Object} - Object containing the updated ratings for both items
 */
export function updateRatings(ratingA, ratingB, actualOutcomeA, kFactor = 32) {
  const expectedOutcomeA = calculateExpectedOutcome(ratingA, ratingB);
  const expectedOutcomeB = 1 - expectedOutcomeA;
  const actualOutcomeB = 1 - actualOutcomeA;

  const newRatingA = Math.round(ratingA + kFactor * (actualOutcomeA - expectedOutcomeA));
  const newRatingB = Math.round(ratingB + kFactor * (actualOutcomeB - expectedOutcomeB));

  return {
    newRatingA,
    newRatingB
  };
}

/**
 * Select a pair of items for comparison using an adaptive algorithm
 * @param {Array} items - Array of food items with ratings
 * @param {Array} comparisonHistory - Array of previous comparisons
 * @param {Object} options - Additional options for selection algorithm
 * @param {boolean} [options.prioritizeCloseRatings=true] - Whether to prioritize items with close ratings
 * @param {Object} [options.selectedCategories={}] - Category filters to apply
 * @returns {Array} - Array containing two items for comparison
 */
export function selectComparisonPair(items, comparisonHistory = [], options = {}) {
  // Validate inputs
  if (!Array.isArray(items)) {
    console.error("Items must be an array");
    return [null, null];
  }

  if (items.length < 2) {
    console.error("Need at least 2 items to compare");
    return [null, null];
  }

  if (!Array.isArray(comparisonHistory)) {
    console.warn("Comparison history must be an array, using empty array");
    comparisonHistory = [];
  }

  // Default options
  const {
    prioritizeCloseRatings = true,
    selectedCategories = {}
  } = options;

  // Filter items based on selected categories if any are active
  let filteredItems = [...items];
  const hasActiveFilters = Object.values(selectedCategories).some(
    categoryArray => categoryArray && categoryArray.length > 0
  );

  if (hasActiveFilters) {
    filteredItems = items.filter(item => {
      if (!item.categories) return false;

      // Check each category type
      for (const [categoryType, selectedValues] of Object.entries(selectedCategories)) {
        if (!selectedValues || selectedValues.length === 0) continue;

        // Get the item's value for this category type
        const itemCategoryValue = item.categories[categoryType];

        // Skip if the item doesn't have this category type
        if (!itemCategoryValue) continue;

        // Check if any selected value matches
        const hasMatch = Array.isArray(itemCategoryValue)
          ? itemCategoryValue.some(value => selectedValues.includes(value))
          : selectedValues.includes(itemCategoryValue);

        // If no match for this category type, filter out the item
        if (!hasMatch) return false;
      }

      // If we get here, all category filters have been satisfied
      return true;
    });

    // If filtering resulted in fewer than 2 items, revert to all items
    if (filteredItems.length < 2) {
      console.warn("Filtering resulted in too few items, using all items");
      filteredItems = [...items];
    }
  }

  // If no comparisons have been made yet, select two random items
  if (comparisonHistory.length === 0) {
    console.log("No comparison history, selecting random pair");
    const randomIndices = getRandomIndices(filteredItems.length, 2);
    return [filteredItems[randomIndices[0]], filteredItems[randomIndices[1]]];
  }

  // Sort items by rating
  const sortedItems = [...filteredItems].sort((a, b) => a.rating - b.rating);

  // Find items with similar ratings that haven't been compared recently
  const potentialPairs = [];
  const comparisonCounts = new Map();

  // Count how many times each item has been compared
  comparisonHistory.forEach(comp => {
    if (comp.itemA && comp.itemA.id) {
      comparisonCounts.set(comp.itemA.id, (comparisonCounts.get(comp.itemA.id) || 0) + 1);
    }
    if (comp.itemB && comp.itemB.id) {
      comparisonCounts.set(comp.itemB.id, (comparisonCounts.get(comp.itemB.id) || 0) + 1);
    }
  });

  // Find all possible pairs
  for (let i = 0; i < sortedItems.length; i++) {
    for (let j = i + 1; j < sortedItems.length; j++) {
      const itemA = sortedItems[i];
      const itemB = sortedItems[j];

      if (!itemA || !itemB || !itemA.id || !itemB.id) {
        continue; // Skip invalid items
      }

      // Check if this pair has been compared recently
      const hasBeenComparedRecently = comparisonHistory
        .slice(-Math.min(10, comparisonHistory.length))
        .some(comp => {
          // Validate comparison object
          if (!comp || !comp.itemA || !comp.itemB) return false;

          return (comp.itemA.id === itemA.id && comp.itemB.id === itemB.id) ||
                 (comp.itemA.id === itemB.id && comp.itemB.id === itemA.id);
        });

      if (!hasBeenComparedRecently) {
        // Calculate a score for this pair based on various factors
        let score = 0;

        // Factor 1: Rating proximity - higher score for closer ratings
        const ratingDiff = Math.abs(itemA.rating - itemB.rating);
        const ratingProximityScore = 1000 / (ratingDiff + 10); // Avoid division by zero

        // Factor 2: Comparison count - higher score for less compared items
        const itemACompCount = comparisonCounts.get(itemA.id) || 0;
        const itemBCompCount = comparisonCounts.get(itemB.id) || 0;
        const comparisonCountScore = 100 / (Math.max(itemACompCount, itemBCompCount) + 1);

        // Factor 3: Prediction uncertainty - higher score for pairs with uncertain predictions
        const prediction = predictPreference(itemA, itemB, comparisonHistory);
        // Uncertainty is highest when prediction is close to 0.5 and confidence is low
        const uncertaintyScore = (1 - Math.abs(prediction.expectedOutcomeA - 0.5) * 2) * (1 - prediction.confidence) * 100;

        // Factor 4: Category similarity - higher score for pairs with interesting category combinations
        const similarity = calculateCategorySimilarity(itemA, itemB);
        // We want some similarity but not too much - most informative comparisons are between
        // items that share some categories but differ in others
        const similarityScore = similarity > 0 ? (1 - Math.abs(similarity - 0.5) * 2) * 100 : 0;

        // Combine factors with appropriate weights based on comparison history size
        const historySize = comparisonHistory.length;
        if (historySize < 10) {
          // Early phase: focus on exploration and covering different items
          score = comparisonCountScore * 0.5 + similarityScore * 0.3 + ratingProximityScore * 0.2;
        } else if (prioritizeCloseRatings) {
          // Middle phase with close ratings priority: focus on refining similar ratings
          score = ratingProximityScore * 0.4 + uncertaintyScore * 0.3 + comparisonCountScore * 0.2 + similarityScore * 0.1;
        } else {
          // Middle phase without close ratings priority: focus on exploration
          score = uncertaintyScore * 0.4 + comparisonCountScore * 0.3 + similarityScore * 0.2 + ratingProximityScore * 0.1;
        }

        potentialPairs.push({
          pair: [itemA, itemB],
          score,
          prediction
        });
      }
    }
  }

  // If no suitable pairs found, select a random pair
  if (potentialPairs.length === 0) {
    console.log("No potential pairs found, selecting random pair");
    const randomIndices = getRandomIndices(filteredItems.length, 2);
    return [filteredItems[randomIndices[0]], filteredItems[randomIndices[1]]];
  }

  // Sort pairs by score (descending)
  potentialPairs.sort((a, b) => b.score - a.score);

  // Select from top pairs with some randomness
  // The randomness decreases as we get more comparisons, making the algorithm more focused
  const adaptiveRandomness = Math.max(0.1, 0.9 - (comparisonHistory.length / 50));
  const rand = Math.random();

  if (rand < (1 - adaptiveRandomness) || potentialPairs.length === 1) {
    // Most of the time, pick the highest scored pair
    return potentialPairs[0].pair;
  } else if (rand < (1 - adaptiveRandomness/2) && potentialPairs.length >= 2) {
    // Sometimes pick the second highest
    return potentialPairs[1].pair;
  } else if (potentialPairs.length >= 3) {
    // Rarely pick the third highest
    return potentialPairs[2].pair;
  } else {
    // Fallback to the highest
    return potentialPairs[0].pair;
  }
}

/**
 * Get random indices from a range
 * @param {number} max - Maximum index value (exclusive)
 * @param {number} count - Number of random indices to generate
 * @returns {Array} - Array of random indices
 */
function getRandomIndices(max, count) {
  // Validate inputs
  if (typeof max !== 'number' || max <= 0) {
    console.error(`Invalid max value: ${max}`);
    return [0, 0];
  }

  if (typeof count !== 'number' || count <= 0) {
    console.error(`Invalid count value: ${count}`);
    return [0, 0];
  }

  // Safety check to prevent infinite loops
  if (count > max) {
    console.warn(`Requested ${count} unique indices but max is only ${max}, limiting to max`);
    count = max;
  }

  // Use a different algorithm to avoid potential infinite loops
  // First create an array of all possible indices
  const allIndices = Array.from({ length: max }, (_, i) => i);

  // Then shuffle it using Fisher-Yates algorithm
  for (let i = allIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allIndices[i], allIndices[j]] = [allIndices[j], allIndices[i]];
  }

  // Return the first 'count' indices
  return allIndices.slice(0, count);
}

/**
 * Calculate the minimum number of comparisons needed
 * @param {number} itemCount - Number of items to rank
 * @returns {number} - Minimum number of comparisons needed
 */
export function calculateMinComparisons(itemCount) {
  // Ensure we have a valid number and at least 1 comparison
  if (!itemCount || typeof itemCount !== 'number' || itemCount < 2) {
    return 1;
  }
  return Math.ceil(Math.log2(itemCount) * itemCount);
}
/**
 * Sort items by their Elo ratings in descending order
 * @param {Array} items - Array of food items with ratings
 * @returns {Array} - Sorted array of food items
 */
export function sortItemsByRating(items) {
  return [...items].sort((a, b) => b.rating - a.rating);
}

/**
 * Calculate confidence score for rankings with enhanced ML-based metrics
 * @param {Array} items - Array of food items with ratings
 * @param {Array} comparisonHistory - Array of previous comparisons
 * @returns {number} - Confidence score between 0 and 1
 */
export function calculateConfidence(items, comparisonHistory = []) {
  if (!items || items.length < 2 || !comparisonHistory || comparisonHistory.length === 0) {
    return 0;
  }

  // Factor 1: Percentage of total possible comparisons completed
  const totalPossibleComparisons = (items.length * (items.length - 1)) / 2;
  const completedComparisons = new Set();

  comparisonHistory.forEach(comp => {
    if (comp && comp.itemA && comp.itemB) {
      // Create a unique key for each pair regardless of order
      const pairKey = [comp.itemA.id, comp.itemB.id].sort().join('-');
      completedComparisons.add(pairKey);
    }
  });

  const uniqueComparisonCount = completedComparisons.size;
  const comparisonCoverage = uniqueComparisonCount / totalPossibleComparisons;

  // Factor 2: Rating distribution - higher confidence when ratings are more spread out
  const ratings = items.map(item => item.rating);
  const minRating = Math.min(...ratings);
  const maxRating = Math.max(...ratings);
  const ratingRange = maxRating - minRating;
  const maxPossibleRange = 800; // Theoretical max range after many comparisons
  const ratingDistribution = Math.min(1, ratingRange / maxPossibleRange);

  // Factor 3: Consistency of comparisons
  let consistencyScore = 1;
  if (comparisonHistory.length > 5) {
    // Check for transitivity violations (A > B, B > C, but C > A)
    // This is a simplified approach - a full implementation would check all possible triplets
    const recentComparisons = comparisonHistory.slice(-Math.min(20, comparisonHistory.length));
    const winMap = new Map();

    recentComparisons.forEach(comp => {
      if (!comp.winner || !comp.loser) return;

      const winnerId = comp.winner.id;
      const loserId = comp.loser.id;

      if (!winMap.has(winnerId)) {
        winMap.set(winnerId, new Set());
      }
      winMap.get(winnerId).add(loserId);
    });

    // Count transitivity violations
    let violations = 0;
    let checks = 0;

    winMap.forEach((losers, winnerId) => {
      losers.forEach(loserId => {
        if (winMap.has(loserId)) {
          const secondLevelLosers = winMap.get(loserId);
          secondLevelLosers.forEach(secondLevelLoserId => {
            checks++;
            // If A beat B and B beat C, C should not beat A
            if (winMap.has(secondLevelLoserId) && winMap.get(secondLevelLoserId).has(winnerId)) {
              violations++;
            }
          });
        }
      });
    });

    if (checks > 0) {
      consistencyScore = 1 - (violations / checks);
    }
  }

  // Factor 4: ML model prediction accuracy
  let predictionAccuracy = 0;
  if (comparisonHistory.length > 10) {
    // Use the last 10 comparisons to evaluate prediction accuracy
    const testComparisons = comparisonHistory.slice(-10);
    let correctPredictions = 0;

    testComparisons.forEach(comp => {
      if (!comp.itemA || !comp.itemB || !comp.winner) return;

      // Get the prediction for this comparison
      const prediction = predictPreference(comp.itemA, comp.itemB,
        comparisonHistory.filter(c => c !== comp) // Exclude current comparison
      );

      // Check if prediction matches actual outcome
      const actualOutcome = comp.winner.id === comp.itemA.id ? 1 : 0;
      const predictedOutcome = prediction.expectedOutcomeA >= 0.5 ? 1 : 0;

      if (predictedOutcome === actualOutcome) {
        correctPredictions++;
      }
    });

    predictionAccuracy = correctPredictions / testComparisons.length;
  }

  // Factor 5: Category coverage - higher confidence when we have comparisons across different categories
  let categoryCoverage = 0;
  if (items.length > 0 && items[0].categories) {
    const categoryTypes = ['cuisine', 'type', 'dietary', 'ingredient', 'cookingMethod'];
    const categoryCounts = {};

    // Initialize category counts
    categoryTypes.forEach(type => {
      categoryCounts[type] = new Set();
    });

    // Count unique categories in comparisons
    comparisonHistory.forEach(comp => {
      if (!comp.itemA || !comp.itemB) return;

      categoryTypes.forEach(type => {
        if (comp.itemA.categories && comp.itemA.categories[type]) {
          const values = Array.isArray(comp.itemA.categories[type])
            ? comp.itemA.categories[type]
            : [comp.itemA.categories[type]];

          values.forEach(val => categoryCounts[type].add(val));
        }

        if (comp.itemB.categories && comp.itemB.categories[type]) {
          const values = Array.isArray(comp.itemB.categories[type])
            ? comp.itemB.categories[type]
            : [comp.itemB.categories[type]];

          values.forEach(val => categoryCounts[type].add(val));
        }
      });
    });

    // Calculate coverage as percentage of unique categories compared
    const totalUniqueCategories = categoryTypes.reduce((sum, type) => {
      const uniqueValues = new Set();

      items.forEach(item => {
        if (item.categories && item.categories[type]) {
          const values = Array.isArray(item.categories[type])
            ? item.categories[type]
            : [item.categories[type]];

          values.forEach(val => uniqueValues.add(val));
        }
      });

      return sum + uniqueValues.size;
    }, 0);

    const comparedCategories = categoryTypes.reduce((sum, type) => {
      return sum + categoryCounts[type].size;
    }, 0);

    categoryCoverage = totalUniqueCategories > 0 ? comparedCategories / totalUniqueCategories : 0;
  }

  // Combine factors with weights that adapt based on comparison history size
  let confidenceScore;

  if (comparisonHistory.length < 10) {
    // Early phase: rely more on basic coverage
    confidenceScore = (
      comparisonCoverage * 0.6 +
      consistencyScore * 0.3 +
      ratingDistribution * 0.1
    );
  } else if (comparisonHistory.length < 30) {
    // Middle phase: incorporate ML metrics
    confidenceScore = (
      comparisonCoverage * 0.4 +
      consistencyScore * 0.2 +
      ratingDistribution * 0.2 +
      (predictionAccuracy > 0 ? predictionAccuracy * 0.1 : 0) +
      categoryCoverage * 0.1
    );
  } else {
    // Late phase: rely more on ML metrics and consistency
    confidenceScore = (
      comparisonCoverage * 0.3 +
      consistencyScore * 0.2 +
      ratingDistribution * 0.1 +
      (predictionAccuracy > 0 ? predictionAccuracy * 0.2 : 0) +
      categoryCoverage * 0.2
    );
  }

  // Ensure score is between 0 and 1
  return Math.max(0, Math.min(1, confidenceScore));
}
