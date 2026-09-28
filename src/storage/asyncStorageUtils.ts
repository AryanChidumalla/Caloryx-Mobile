import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Generic helper to safely retrieve and parse JSON from AsyncStorage.
 * Falls back to the provided fallback value on null/undefined or parse error.
 */
export async function getJsonStorageItem<T>(
  key: string,
  fallback: T,
): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null || raw === undefined) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[storage] Failed to parse item for key "${key}":`, err);
    return fallback;
  }
}

/**
 * Generic helper to safely serialize and persist JSON to AsyncStorage.
 */
export async function setJsonStorageItem<T>(
  key: string,
  value: T,
): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[storage] Failed to save item for key "${key}":`, err);
  }
}

/**
 * Generic helper to remove a key from AsyncStorage.
 */
export async function removeStorageItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (err) {
    console.warn(`[storage] Failed to remove item for key "${key}":`, err);
  }
}
