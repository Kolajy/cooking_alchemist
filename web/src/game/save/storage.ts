
// We'll use synchronous hashing because localstorage is synchronous and changing all
// getItem/setItem to async would be a huge refactor. We can use a simple hash function.
export function generateChecksumSync(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString(16);
}

export const gameStorage = {
  getItem(key: string): string | null {
    let storedValue = null;
    if ((window as any).culinaryDesktop?.isElectron) {
      try {
        storedValue = (window as any).culinaryDesktop.saveGetItem(key);
      } catch (err) {
        console.error(`[storage] Electron saveGetItem failed for key ${key}:`, err);
      }
    } else {
      storedValue = localStorage.getItem(key);
    }

    if (!storedValue) return null;

    try {
      const parsed = JSON.parse(storedValue);
      if (parsed && typeof parsed === 'object' && parsed._checksum) {
        const { _checksum, ...rest } = parsed;
        const restString = JSON.stringify(rest);
        const expectedChecksum = generateChecksumSync(restString);
        if (_checksum === expectedChecksum) {
          return restString;
        } else {
          console.error(`[storage] Checksum mismatch for key ${key}. Save file may be corrupted.`);
          // If corrupted, we should fallback to safe states.
          return null;
        }
      } else {
        // Legacy save or non-checksummed data
        return storedValue;
      }
    } catch {
      return storedValue; // Return raw string if not JSON
    }
  },

  setItem(key: string, value: string): void {
    let valueToStore = value;
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === 'object') {
        const checksum = generateChecksumSync(value);
        parsed._checksum = checksum;
        valueToStore = JSON.stringify(parsed);
      }
    } catch {
      // Not a json object, just store raw
    }

    if ((window as any).culinaryDesktop?.isElectron) {
      try {
        (window as any).culinaryDesktop.saveSetItem(key, valueToStore);
        return;
      } catch (err) {
        console.error(`[storage] Electron saveSetItem failed for key ${key}:`, err);
      }
    } else {
      localStorage.setItem(key, valueToStore);
    }
  },

  removeItem(key: string): void {
    if ((window as any).culinaryDesktop?.isElectron) {
      try {
        (window as any).culinaryDesktop.saveRemoveItem(key);
        return;
      } catch (err) {
        console.error(`[storage] Electron saveRemoveItem failed for key ${key}:`, err);
      }
    } else {
      localStorage.removeItem(key);
    }
  }
};
