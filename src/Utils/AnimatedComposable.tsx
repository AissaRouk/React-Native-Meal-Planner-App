import { Animated } from 'react-native';
import { useEffect, useRef } from 'react';

export const FadeInView = ({ children }: { children: React.ReactNode }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <Animated.View style={{ opacity: fadeAnim }
        }>
            {children}
        </Animated.View>
    );
};