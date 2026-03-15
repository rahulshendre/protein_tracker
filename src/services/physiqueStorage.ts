/**
 * Physique entries: local cache + optional cloud sync.
 * Cloud is source of truth when logged in; local used offline or when not logged in.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';
import { PhysiqueEntry } from '../types';

export async function getPhysiqueEntries(): Promise<PhysiqueEntry[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.PHYSIQUE_ENTRIES);
    if (!json) return [];
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error reading physique entries:', error);
    return [];
  }
}

export async function setPhysiqueEntries(entries: PhysiqueEntry[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PHYSIQUE_ENTRIES, JSON.stringify(entries));
  } catch (error) {
    console.error('Error saving physique entries:', error);
    throw error;
  }
}

export async function addPhysiqueEntry(entry: PhysiqueEntry): Promise<void> {
  try {
    const entries = await getPhysiqueEntries();
    entries.unshift(entry);
    await AsyncStorage.setItem(STORAGE_KEYS.PHYSIQUE_ENTRIES, JSON.stringify(entries));
  } catch (error) {
    console.error('Error saving physique entry:', error);
    throw error;
  }
}

export async function deletePhysiqueEntry(id: string): Promise<void> {
  try {
    const entries = await getPhysiqueEntries();
    const next = entries.filter((e) => e.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.PHYSIQUE_ENTRIES, JSON.stringify(next));
  } catch (error) {
    console.error('Error deleting physique entry:', error);
    throw error;
  }
}
