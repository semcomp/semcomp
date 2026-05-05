/// <reference types="vite/client" />

// Add missing import.meta.globEager typings for TypeScript
// This augments the ImportMeta interface used by Vite's glob helpers.
declare interface ImportMeta {
  glob: {
    <T = any>(pattern: string): Record<string, () => Promise<T>>;
    <T = any>(pattern: string, options: { eager: true }): Record<string, T>;
  };
  globEager: <T = any>(pattern: string) => Record<string, T>;
}
