const PREFIX = "bread_";

export const storage = {
  set(key, value, expiresInHours = null) {
    const item = {
      value,
      timestamp: new Date().getTime(),
    };

    if (expiresInHours) {
      item.expiresAt = new Date().getTime() + expiresInHours * 60 * 60 * 1000;
    }

    localStorage.setItem(PREFIX + key, JSON.stringify(item));
  },

  get(key) {
    try {
      const item = JSON.parse(localStorage.getItem(PREFIX + key));

      if (!item) return null;

      if (item.expiresAt && new Date().getTime() > item.expiresAt) {
        this.remove(key);
        return null;
      }

      return item.value;
    } catch {
      return null;
    }
  },

  remove(key) {
    localStorage.removeItem(PREFIX + key);
  },

  clear() {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(PREFIX))
      .forEach((key) => localStorage.removeItem(key));
  },

  // Session storage methods
  setSession(key, value) {
    sessionStorage.setItem(PREFIX + key, JSON.stringify({ value }));
  },

  getSession(key) {
    try {
      const item = JSON.parse(sessionStorage.getItem(PREFIX + key));
      return item ? item.value : null;
    } catch {
      return null;
    }
  },

  removeSession(key) {
    sessionStorage.removeItem(PREFIX + key);
  },

  clearSession() {
    Object.keys(sessionStorage)
      .filter((key) => key.startsWith(PREFIX))
      .forEach((key) => sessionStorage.removeItem(key));
  },

  // User specific methods
  setUserData(data) {
    this.set("user", data);
  },

  getUserData() {
    return this.get("user");
  },

  setAuthToken(token) {
    this.set("token", token);
  },

  getAuthToken() {
    return this.get("token");
  },

  clearAuth() {
    this.remove("user");
    this.remove("token");
  },

  // Cart methods
  setCartItems(items) {
    this.set("cart", items);
  },

  getCartItems() {
    return this.get("cart") || [];
  },

  clearCart() {
    this.remove("cart");
  },

  // Settings methods
  setSettings(settings) {
    this.set("settings", settings);
  },

  getSettings() {
    return this.get("settings") || {};
  },

  // Recent searches
  addRecentSearch(search) {
    const searches = this.getRecentSearches();
    const updatedSearches = [
      search,
      ...searches.filter((s) => s !== search),
    ].slice(0, 10);
    this.set("recent_searches", updatedSearches);
  },

  getRecentSearches() {
    return this.get("recent_searches") || [];
  },

  clearRecentSearches() {
    this.remove("recent_searches");
  },
};
