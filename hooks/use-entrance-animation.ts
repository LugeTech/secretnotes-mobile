import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export function useEntranceAnimation(itemCount: number, staggerDelay = 100) {
    const animations = useRef(
        Array.from({ length: itemCount }).map(() => ({
            opacity: new Animated.Value(0),
            translateY: new Animated.Value(20),
        }))
    ).current;

    useEffect(() => {
        const sequence = animations.map((anim, index) =>
            Animated.parallel([
                Animated.timing(anim.opacity, {
                    toValue: 1,
                    duration: 500,
                    delay: index * staggerDelay,
                    useNativeDriver: true,
                }),
                Animated.timing(anim.translateY, {
                    toValue: 0,
                    duration: 500,
                    delay: index * staggerDelay,
                    useNativeDriver: true,
                }),
            ])
        );

        Animated.stagger(staggerDelay, sequence).start();
    }, [animations, staggerDelay]);

    return animations.map((anim) => ({
        opacity: anim.opacity,
        transform: [{ translateY: anim.translateY }],
    }));
}
