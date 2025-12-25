import { View, StyleSheet, Platform, ViewStyle, SafeAreaView } from 'react-native';
import { useThemeColor } from '@/components/Themed';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';

interface ContainerProps {
    children: React.ReactNode;
    style?: ViewStyle;
    useSafeArea?: boolean;
}

export function Container({ children, style, useSafeArea = true }: ContainerProps) {
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const backgroundColor = Colors[theme].background;

    const Wrapper = useSafeArea ? SafeAreaView : View;

    return (
        <Wrapper style={[{ flex: 1, backgroundColor }, styles.wrapper]}>
            <View style={[styles.container, style]}>
                {children}
            </View>
        </Wrapper>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
    },
    container: {
        flex: 1,
        width: '100%',
        maxWidth: 800, // Responsive web constraint
        alignSelf: 'center',
        paddingHorizontal: 16,
    },
});
