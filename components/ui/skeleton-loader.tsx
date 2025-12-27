import { useThemeColor } from '@/hooks/use-theme-color';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

interface SkeletonLoaderProps {
    width?: number | string;
    height?: number | string;
    borderRadius?: number;
    style?: any;
}

export function SkeletonLoader({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonLoaderProps) {
    const animatedValue = useRef(new Animated.Value(0)).current;
    const skeletonBg = useThemeColor({ light: '#f1f5f9', dark: '#1E2021' }, 'background') as string;
    const highlightColor = useThemeColor({ light: '#e2e8f0', dark: '#2A2D2E' }, 'background') as string;

    useEffect(() => {
        Animated.loop(
            Animated.timing(animatedValue, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
            })
        ).start();
    }, [animatedValue]);

    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-Dimensions.get('window').width, Dimensions.get('window').width],
    });

    return (
        <View style={[styles.container, { width, height, borderRadius, backgroundColor: skeletonBg }, style]}>
            <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]}>
                <LinearGradient
                    colors={['transparent', highlightColor, 'transparent']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>
        </View>
    );
}

export function NoteSkeleton() {
    return (
        <View style={styles.noteSkeleton}>
            <SkeletonLoader height={32} width="40%" borderRadius={8} style={{ marginBottom: 16 }} />
            <SkeletonLoader height={20} width="90%" borderRadius={4} style={{ marginBottom: 12 }} />
            <SkeletonLoader height={20} width="95%" borderRadius={4} style={{ marginBottom: 12 }} />
            <SkeletonLoader height={20} width="85%" borderRadius={4} style={{ marginBottom: 12 }} />
            <SkeletonLoader height={20} width="60%" borderRadius={4} style={{ marginBottom: 12 }} />

            <View style={styles.footerSkeleton}>
                <SkeletonLoader height={100} width="100%" borderRadius={16} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
    },
    noteSkeleton: {
        flex: 1,
        paddingTop: 16,
    },
    footerSkeleton: {
        marginTop: 'auto',
        marginBottom: 20,
    },
});
