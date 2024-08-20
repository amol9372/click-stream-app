import localforage from "localforage";

class StorageUtils {
  constructor() {
    // No further customization needed within the constructor, unless adding other instances
  }

  static async saveData(key, data) {
    try {
      await localforage.setItem(key, data);
      // console.log(`Data saved under key: ${key}`);
    } catch (error) {
      console.error("Failed to save data:", key, error);
    }
  }

  static async loadData(key) {
    try {
      const data = await localforage.getItem(key);
      // console.log(`Data loaded for key: ${key}`, data);
      return data;
    } catch (error) {
      console.error("Failed to load data:", key, error);
      return null;
    }
  }

  static async clear(key) {
    try {
      const data = await localforage.clear();
      console.log("Data cleared");
      return data;
    } catch (error) {
      console.error("Failed to clear");
      return null;
    }
  }
}

export default StorageUtils;
