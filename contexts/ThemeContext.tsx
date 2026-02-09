import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => Promise<void>;
    setTheme: (theme: Theme) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemColorScheme = useSystemColorScheme();
    const [theme, setThemeState] = useState<Theme>('dark'); // Default fallback
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('user_theme');
            if (savedTheme === 'light' || savedTheme === 'dark') {
                setThemeState(savedTheme);
            } else {
                // If no saved theme, default to system preference or fallback
                // Given the app was dark-only, maybe default to dark if not set?
                // But generally respecting system is best.
                // However, user specifically asked for manual toggle.
                // Let's default to system if available, else dark.
                setThemeState(systemColorScheme === 'light' ? 'light' : 'dark');
            }
        } catch (error) {
            console.error('Failed to load theme:', error);
        } finally {
            setIsReady(true);
        }
    };

    const toggleTheme = async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setThemeState(newTheme);
        try {
            await AsyncStorage.setItem('user_theme', newTheme);
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
    };

    const setTheme = async (newTheme: Theme) => {
        setThemeState(newTheme);
        try {
            await AsyncStorage.setItem('user_theme', newTheme);
        } catch (error) {
            console.error('Failed to set theme:', error);
        }
    };

    if (!isReady) {
        return null; // Or a splash screen
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
