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
 * Select a pair of items for comparison
 * @param {Array} items - Array of food items with ratings
 * @param {Array} comparisonHistory - Array of previous comparisons
 * @returns {Array} - Array containing two items for comparison
 */
export function selectComparisonPair(items, comparisonHistory) {
  // If no comparisons have been made yet, select two random items
  if (comparisonHistory.length === 0) {
    const randomIndices = getRandomIndices(items.length, 2);
    return [items[randomIndices[0]], items[randomIndices[1]]];
  }

  // Sort items by rating
  const sortedItems = [...items].sort((a, b) => a.rating - b.rating);
  
  // Find items with similar ratings that haven't been compared recently
  const potentialPairs = [];
  
  for (let i = 0; i < sortedItems.length - 1; i++) {
    const itemA = sortedItems[i];
    const itemB = sortedItems[i + 1];
    
    // Check if this pair has been compared recently
    const hasBeenComparedRecently = comparisonHistory
      .slice(-Math.min(5, comparisonHistory.length))
      .some(comp => 
        (comp.itemA.id === itemA.id && comp.itemB.id === itemB.id) || 
        (comp.itemA.id === itemB.id && comp.itemB.id === itemA.id)
      );
    
    if (!hasBeenComparedRecently) {
      potentialPairs.push([itemA, itemB]);
    }
  }
  
  // If no suitable pairs found, select a random pair
  if (potentialPairs.length === 0) {
    const randomIndices = getRandomIndices(items.length, 2);
    return [items[randomIndices[0]], items[randomIndices[1]]];
  }
  
  // Select a random pair from potential pairs
  const randomIndex = Math.floor(Math.random() * potentialPairs.length);
  return potentialPairs[randomIndex];
}

/**
 * Get random indices from a range
 * @param {number} max - Maximum index value (exclusive)
 * @param {number} count - Number of random indices to generate
 * @returns {Array} - Array of random indices
 */
function getRandomIndices(max, count) {
  const indices = [];
  while (indices.length < count) {
    const randomIndex = Math.floor(Math.random() * max);
    if (!indices.includes(randomIndex)) {
      indices.push(randomIndex);
    }
  }
  return indices;
}

/**
 * Calculate the minimum number of comparisons needed
 * @param {number} itemCount - Number of items to rank
 * @returns {number} - Minimum number of comparisons needed
 */
export function calculateMinComparisons(itemCount) {
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