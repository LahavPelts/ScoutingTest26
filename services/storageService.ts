import { ScoutEntry } from '../types';

const STORAGE_KEY = 'ga2230_scouting_data';

export const saveEntry = (entry: ScoutEntry): void => {
  const existing = getEntries();
  existing.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
};

export const getEntries = (): ScoutEntry[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const clearEntries = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
