import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { useMapInverseScale } from '@/components/map/LokalMap';
import { Glyph } from '@/components/ui';
import { useReduceMotion } from '@/hooks/use-reduce-motion';
import type { GlyphSource } from '@/theme/glyphs';
import { dur, ease, native } from '@/theme/motion';

// Three report glyphs rising from a pin (02 spec 7.8 step 2). A map marker, so it moves with
// the map. Off under reduce motion.

const DRIFT = [-26, 0, 26];

export function EmojiFloat({ x, y, glyph }: { x: number; y: number; glyph: GlyphSource }) {
  const reduceMotion = useReduceMotion();
  const inverse = useMapInverseScale();
  const [values] = useState(() => DRIFT.map(() => new Animated.Value(0)));

  useEffect(() => {
    if (reduceMotion) return;
    const anim = Animated.stagger(
      120,
      values.map((v) => Animated.timing(v, { toValue: 1, duration: dur.float, easing: ease.out, useNativeDriver: native })),
    );
    anim.start();
    return () => anim.stop();
  }, [reduceMotion, values]);

  if (reduceMotion) return null;

  return (
    <View
      pointerEvents="none"
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.box, { left: x - 30, top: y - 70 - 30 }, inverse ? { transform: [{ scale: inverse }] } : null]}
    >
      {values.map((v, i) => (
        <Animated.View
          key={i}
          style={[
            styles.item,
            {
              opacity: v.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 1, 0] }),
              transform: [
                { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -120] }) },
                { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, DRIFT[i]] }) },
                { scale: v.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0.4, 1.2, 0.9] }) },
              ],
            },
          ]}
        >
          <Glyph of={glyph} size={26} />
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { position: 'absolute', width: 60, height: 60, zIndex: 3000 },
  item: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
});
