const STORAGE_KEYS = {
  FOOD_ITEMS: 'tasteDuel_foodItems',
  APP_STATE: 'tasteDuel_appState'
};

/**
 * Save data to local storage
 * @param {string} key - Storage key
 * @param {*} data - Data to store
 */
export function saveToLocalStorage(key, data) {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
}

/**
 * Load data from local storage
 * @param {string} key - Storage key
 * @returns {*} - Stored data or null if not found
 */
export function loadFromLocalStorage(key) {
  try {
    const serializedData = localStorage.getItem(key);
    if (serializedData === null) {
      return null;
    }
    return JSON.parse(serializedData);
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return null;
  }
}

/**
 * Clear specific data from local storage
 * @param {string} key - Storage key to clear
 */
export function clearFromLocalStorage(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
}

/**
 * Clear all app data from local storage
 */
export function clearAllAppData() {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Error clearing all app data from localStorage:', error);
    return false;
  }
}

export { STORAGE_KEYS };