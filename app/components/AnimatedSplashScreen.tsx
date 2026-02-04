import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { Text } from 'react-native-gesture-handler';

SplashScreen.preventAutoHideAsync().catch(() => {});

const AnimatedSplashScreen = () => {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  // Animate logo enlargement
  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 2000, // 2 seconds for the enlargement
      useNativeDriver: true,
    }).start();

    // Hide splash after animation
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 2000);

    return () => clearTimeout(timer);
  }, [scaleAnim]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text>TEST</Text>
        <Image
          source={require('../../assets/door-slider-bg1.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c4ef4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 200,
    height: 200,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
});

export default AnimatedSplashScreen;
