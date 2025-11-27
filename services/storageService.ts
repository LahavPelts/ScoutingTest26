import { ScoutEntry } from '../types';

const STORAGE_KEY = 'ga2230_scouting_data';

export const saveEntry = (entry: ScoutEntry): void => {
  const existing = getEntries();
  existing.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
};

// Optimized for bulk imports like mock data
export const overwriteEntries = (entries: ScoutEntry[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

export const getEntries = (): ScoutEntry[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  try {
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error parsing local storage data:", error);
    return [];
  }
};

export const clearEntries = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const importData = (content: string, type: 'json' | 'csv'): void => {
  if (type === 'json') {
    try {
      const data = JSON.parse(content);
      if (Array.isArray(data)) {
        overwriteEntries(data);
      } else {
        console.error("Imported data is not an array");
      }
    } catch (error) {
      console.error("Error importing JSON:", error);
    }
  } else {
    console.warn("CSV import is not currently supported");
  }
};