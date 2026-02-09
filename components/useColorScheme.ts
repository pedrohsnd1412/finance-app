import { useTheme } from '@/contexts/ThemeContext';
import { ColorSchemeName } from 'react-native';

export function useColorScheme(): NonNullable<ColorSchemeName> {
    try {
        const { theme } = useTheme();
        return theme;
    } catch (e) {
        // Fallback for cases where useColorScheme is called outside the ThemeProvider
        return 'dark';
    }
}
