// Dark mode has been removed. This stub is kept for compatibility.
import { create } from 'zustand';

interface ThemeState {
    isDarkMode: boolean;
    toggleTheme: () => void;
    initializeTheme: () => void;
}

export const useThemeStore = create<ThemeState>(() => ({
    isDarkMode: true,
    toggleTheme: () => {},
    initializeTheme: () => {},
}));
