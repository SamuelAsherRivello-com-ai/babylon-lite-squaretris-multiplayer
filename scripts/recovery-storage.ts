/** Recovery belongs to one browsing instance; saves and preferences stay shared. */
export interface TokenStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
export function scopeRecoveryStorage(storage: TokenStorage, name: string): TokenStorage {
  const key = (value: string) => `game-recovery:${encodeURIComponent(name || "standalone")}:${value}`;
  return {
    getItem: value => storage.getItem(key(value)),
    setItem: (value, token) => storage.setItem(key(value), token),
  };
}
export const recoveryStorage: TokenStorage = {
  getItem: key => scopeRecoveryStorage(window.sessionStorage, window.name).getItem(key),
  setItem: (key, token) => scopeRecoveryStorage(window.sessionStorage, window.name).setItem(key, token),
};

