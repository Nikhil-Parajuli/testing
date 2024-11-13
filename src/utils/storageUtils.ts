import type { SavedPalette } from '../types';

const isExtensionEnvironment = typeof chrome !== 'undefined' && chrome.storage;

export async function saveToStorage(palettes: SavedPalette[]): Promise<void> {
  if (isExtensionEnvironment) {
    await chrome.storage.local.set({ palettes });
  } else {
    localStorage.setItem('palettes', JSON.stringify(palettes));
  }
}

export async function loadFromStorage(): Promise<SavedPalette[]> {
  if (isExtensionEnvironment) {
    const data = await chrome.storage.local.get('palettes');
    return data.palettes || [];
  } else {
    const stored = localStorage.getItem('palettes');
    return stored ? JSON.parse(stored) : [];
  }
}

export async function deletePalette(id: number): Promise<void> {
  const palettes = await loadFromStorage();
  const updatedPalettes = palettes.filter(p => p.id !== id);
  await saveToStorage(updatedPalettes);
}