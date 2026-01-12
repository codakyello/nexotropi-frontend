// store/themeStore.ts
import { create } from 'zustand';

interface ThemeState {
    isDarkMode: boolean;
    toggleTheme: () => void;
    initializeTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
    isDarkMode: true,

    toggleTheme: () => set((state) => {
        const newMode = !state.isDarkMode;

        if (newMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        return { isDarkMode: newMode };
    }),

    initializeTheme: () => {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (prefersDark) {
            document.documentElement.classList.add('dark');
            set({ isDarkMode: true });
        } else {
            document.documentElement.classList.remove('dark');
            set({ isDarkMode: false });
        }
    },
}));