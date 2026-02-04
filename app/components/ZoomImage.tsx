import React from 'react';
import { View, Image, StyleSheet, ImageSourcePropType } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';


import { useState } from 'react';

type Props = {
  sourceThumb: ImageSourcePropType;
  sourceOriginal: ImageSourcePropType;
};

export default function ZoomImage({ sourceThumb, sourceOriginal }: Props) {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const prevDisplay = useSharedValue(false);
  const [displayOriginal, setDisplayOriginal] = useState(false);

  const pinch = Gesture.Pinch()
    .onUpdate(e => {
      scale.value = Math.max(1, e.scale);
      // avoid calling JS state on every frame; only call when threshold changes
      const now = e.scale > 1.5;
      if (now !== prevDisplay.value) {
        prevDisplay.value = now;
        runOnJS(setDisplayOriginal)(now);
      }
    });

  const pan = Gesture.Pan()
    .onUpdate(e => {
      if (scale.value > 1) {
        const maxTranslateX = (scale.value - 1) * 50;
        const maxTranslateY = (scale.value - 1) * 50;
        translateX.value = Math.max(-maxTranslateX, Math.min(maxTranslateX, e.translationX));
        translateY.value = Math.max(-maxTranslateY, Math.min(maxTranslateY, e.translationY));
      }
    })
    .onEnd(() => {
      if (scale.value === 1) {
        translateX.value = 0;
        translateY.value = 0;
      }
    });

  const composed = Gesture.Simultaneous(pinch, pan);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={styles.container}>
        <Animated.Image
          source={displayOriginal ? sourceOriginal : sourceThumb}
          resizeMode="contain"
          style={[styles.image, animatedStyle]}
        />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
