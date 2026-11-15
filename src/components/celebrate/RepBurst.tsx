import { useEffect, useState } from 'react';
import { Animated, StyleSheet, useWindowDimensions, View } from 'react-native';

import { Glyph, Text } from '@/components/ui';
import { useReduceMotion } from '@/hooks/use-reduce-motion';
import { t } from '@/i18n';
import type { GlyphSource } from '@/theme/glyphs';
import { ease, native } from '@/theme/motion';

// "+5 rep" burst (02 spec 7.8 step 3): pop, rise, fade. Under reduce motion, a fade in place.

type Props = { glyph: GlyphSource; amount: number; holdMs?: number; onDone: () => void };

export function RepBurst({ glyph, amount, holdMs = 0, onDone }: Props) {
  const reduceMotion = useReduceMotion();
  const { height } = useWindowDimensions();
  const [pop] = useState(() => new Animated.Value(0));
  const [rise] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const anim = reduceMotion
      ? Animated.sequence([
          Animated.timing(pop, { toValue: 1, duration: 200, useNativeDriver: native }),
          Animated.delay(200),
          Animated.timing(rise, { toValue: 1, duration: 200, useNativeDriver: native }),
          Animated.delay(holdMs),
        ])
      : Animated.sequence([
          Animated.timing(pop, { toValue: 1, duration: 320, easing: ease.out, useNativeDriver: native }),
          Animated.timing(rise, { toValue: 1, duration: 980, easing: ease.soft, useNativeDriver: native }),
          Animated.delay(holdMs),
        ]);
    anim.start(() => onDone());
    return () => anim.stop();
  }, [holdMs, onDone, pop, reduceMotion, rise]);

  const opacity = Animated.multiply(pop, rise.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }));
  const transform = reduceMotion
    ? []
    : [
        { translateY: rise.interpolate({ inputRange: [0, 1], outputRange: [0, -90] }) },
        {
          scale: Animated.add(
            pop.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.15] }),
            rise.interpolate({ inputRange: [0, 1], outputRange: [0, -0.15] }),
          ),
        },
      ];

  return (
    <View
      pointerEvents="none"
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.host, { top: height * 0.44 - 50 }]}
    >
      <Animated.View style={[styles.burst, { opacity, transform }]}>
        <Glyph of={glyph} size={44} strokeWidth={2} />
        <View style={styles.pill}>
          <Text variant="ui" style={styles.text}>
            {t('rep.plus', { n: amount })}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  burst: { alignItems: 'center', gap: 4 },
  pill: { backgroundColor: 'rgba(12,13,26,0.88)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  text: { color: '#ffcc33' },
});
