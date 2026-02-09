// Force dark mode for consistent branding
import { ColorSchemeName } from 'react-native';

export function useColorScheme(): NonNullable<ColorSchemeName> {
    return 'dark';
}

