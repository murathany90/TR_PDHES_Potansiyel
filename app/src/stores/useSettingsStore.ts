import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ScoreWeights } from '../utils/scoring';

export const SETTINGS_STORAGE_KEY = 'pspp-settings-v2';

export const DEFAULT_SCORE_WEIGHTS: ScoreWeights = {
  topo: 25,
  grid: 20,
  env: 15,
  geology: 15,
  access: 10,
  market: 15,
};

interface SettingsStore {
  theme: 'dark' | 'light';
  mapStyle: 'dark' | 'light' | 'satellite';
  heightScale: number;
  weights: ScoreWeights;
  setTheme: (t: 'dark' | 'light') => void;
  toggleTheme: () => void;
  setMapStyle: (s: 'dark' | 'light' | 'satellite') => void;
  setHeightScale: (v: number) => void;
  setWeight: (key: keyof SettingsStore['weights'], v: number) => void;
}

function legacyTheme(): 'dark' | 'light' {
  if (typeof localStorage === 'undefined') return 'light';
  return localStorage.getItem('pspp-theme') === 'dark' ? 'dark' : 'light';
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      theme: legacyTheme(),
      mapStyle: 'satellite',
      heightScale: 1.3,
      weights: DEFAULT_SCORE_WEIGHTS,
      setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('pspp-theme', theme);
        set({ theme });
      },
      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        get().setTheme(next);
      },
      setMapStyle: (mapStyle) => set({ mapStyle }),
      setHeightScale: (heightScale) => set({ heightScale }),
      setWeight: (key, value) => set((state) => ({
        weights: { ...state.weights, [key]: value },
      })),
    }),
    {
      name: SETTINGS_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ theme, mapStyle, heightScale, weights }) => ({
        theme,
        mapStyle,
        heightScale,
        weights,
      }),
    },
  ),
);
