export const gameStorage = {
  getItem(key: string): string | null {
    if ((window as any).culinaryDesktop?.isElectron) {
      try {
        return (window as any).culinaryDesktop.saveGetItem(key);
      } catch (err) {
        console.error(`[storage] Electron saveGetItem failed for key ${key}:`, err);
      }
    }
    return localStorage.getItem(key);
  },

  setItem(key: string, value: string): void {
    if ((window as any).culinaryDesktop?.isElectron) {
      try {
        (window as any).culinaryDesktop.saveSetItem(key, value);
        return;
      } catch (err) {
        console.error(`[storage] Electron saveSetItem failed for key ${key}:`, err);
      }
    }
    localStorage.setItem(key, value);
  },

  removeItem(key: string): void {
    if ((window as any).culinaryDesktop?.isElectron) {
      try {
        (window as any).culinaryDesktop.saveRemoveItem(key);
        return;
      } catch (err) {
        console.error(`[storage] Electron saveRemoveItem failed for key ${key}:`, err);
      }
    }
    localStorage.removeItem(key);
  }
};
