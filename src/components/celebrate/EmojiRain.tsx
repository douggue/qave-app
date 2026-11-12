import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text as RNText, useWindowDimensions, View } from 'react-native';

import { useReduceMotion } from '@/hooks/use-reduce-motion';
import { food as foodEmoji, ui, type FoodKey } from '@/theme/emoji';
import { native } from '@/theme/motion';

// Check-in rain (02 spec 7.9): about 30 food emoji fall once, then the component calls
// onDone and the host unmounts it. Decorative: no touches, hidden from screen readers.

type Particle = {
  emoji: string;
  x: number;
  y: number;
  size: number;
  drift: number;
  spin: number;
  duration: number;
  delay: number;
  value: Animated.Value;
};

/** Small seeded random so each rain looks different but is built once. */
function seeded(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function build(food: FoodKey, count: number, width: number, height: number, seed: number): Particle[] {
  const rand = seeded(seed * 7919 + 17);
  return Array.from({ length: count }, () => {
    const r = rand();
    return {
      emoji: r < 0.85 ? foodEmoji[food] : ui.sparkles,
      x: rand() * Math.max(1, width - 30),
      y: -40 - rand() * 0.5 * height,
      size: 20 + rand() * 20,
      drift: (rand() - 0.5) * 60,
      spin: (rand() - 0.5) * 80,
      duration: 1800 + rand() * 800,
      delay: rand() * 500,
      value: new Animated.Value(0),
    };
  });
}

type Props = { food: FoodKey; seed: number; count?: number; onDone: () => void };

export function EmojiRain({ food, seed, count = 30, onDone }: Props) {
  const reduceMotion = useReduceMotion();
  const { width, height } = useWindowDimensions();
  const [particles] = useState(() => build(food, count, width, height, seed));
  const [fade] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const anim = reduceMotion
      ? Animated.sequence([
          Animated.timing(fade, { toValue: 1, duration: 150, useNativeDriver: native }),
          Animated.delay(500),
          Animated.timing(fade, { toValue: 0, duration: 250, useNativeDriver: native }),
        ])
      : Animated.parallel(
          particles.map((p) =>
            Animated.timing(p.value, {
              toValue: 1,
              duration: p.duration,
              delay: p.delay,
              easing: Easing.in(Easing.quad),
              useNativeDriver: native,
            }),
          ),
        );
    anim.start(() => onDone());
    return () => anim.stop();
  }, [fade, onDone, particles, reduceMotion]);

  return (
    <View
      pointerEvents="none"
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={StyleSheet.absoluteFill}
    >
      {reduceMotion ? (
        <Animated.View style={[styles.center, { opacity: fade }]}>
          <RNText allowFontScaling={false} style={styles.big}>
            {foodEmoji[food]}
          </RNText>
        </Animated.View>
      ) : (
        particles.map((p, i) => (
          <Animated.Text
            key={i}
            allowFontScaling={false}
            style={{
              position: 'absolute',
              left: p.x,
              top: p.y,
              fontSize: p.size,
              lineHeight: Math.round(p.size * 1.2),
              opacity: p.value.interpolate({ inputRange: [0, 0.85, 1], outputRange: [1, 1, 0] }),
              transform: [
                { translateY: p.value.interpolate({ inputRange: [0, 1], outputRange: [0, height + 60 - p.y] }) },
                { translateX: p.value.interpolate({ inputRange: [0, 1], outputRange: [0, p.drift] }) },
                { rotate: p.value.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.spin}deg`] }) },
              ],
            }}
          >
            {p.emoji}
          </Animated.Text>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  big: { fontSize: 72, lineHeight: 86 },
});
