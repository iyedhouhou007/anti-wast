const PREFIX = 'bread_app_';

class Storage {
  constructor(storage = localStorage) {
    this.storage = storage;
  }

  getItem(key) {
    try {
      const item = this.storage.getItem(PREFIX + key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  }

  setItem(key, value) {
    try {
      this.storage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
    }
  }

  removeItem(key) {
    try {
      this.storage.removeItem(PREFIX + key);
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
    }
  }

  clear() {
    try {
      Object.keys(this.storage).forEach(key => {
        if (key.startsWith(PREFIX)) {
          this.storage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  // Authentication related methods
  getToken() {
    return this.getItem('token');
  }

  setToken(token) {
    this.setItem('token', token);
  }

  removeToken() {
    this.removeItem('token');
  }

  getUser() {
    return this.getItem('user');
  }

  setUser(user) {
    this.setItem('user', user);
  }

  removeUser() {
    this.removeItem('user');
  }

  // Settings related methods
  getSettings() {
    return this.getItem('settings') || {};
  }

  setSetting(key, value) {
    const settings = this.getSettings();
    settings[key] = value;
    this.setItem('settings', settings);
  }

  // Search history related methods
  getSearchHistory() {
    return this.getItem('searchHistory') || [];
  }

  addToSearchHistory(term) {
    const history = this.getSearchHistory();
    const newHistory = [term, ...history.filter(t => t !== term)].slice(0, 10);
    this.setItem('searchHistory', newHistory);
  }

  clearSearchHistory() {
    this.removeItem('searchHistory');
  }
}

export const storage = new Storage();