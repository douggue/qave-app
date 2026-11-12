import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { useReduceMotion } from '@/hooks/use-reduce-motion';
import { t } from '@/i18n';
import { gradients, radius } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/** A chat bubble. Yours on the right (hot gradient), Lokal's on the left (card). */
export function ChatBubble({ from, text }: { from: 'me' | 'bot'; text: string }) {
  const { c } = useTheme();
  const label = t(from === 'me' ? 'ask.you' : 'ask.bot', { text });
  if (from === 'me') {
    return (
      <View accessible accessibilityLabel={label} style={[styles.wrap, styles.right]}>
        <LinearGradient colors={gradients.hotBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.bubble, styles.me]}>
          <Text tone="onHot">{text}</Text>
        </LinearGradient>
      </View>
    );
  }
  return (
    <View accessible accessibilityLabel={label} style={styles.wrap}>
      <View style={[styles.bubble, styles.bot, { backgroundColor: c.card, borderColor: c.line }]}>
        <Text>{text}</Text>
      </View>
    </View>
  );
}

/** Three dots while Lokal "types". A static ellipsis under reduce motion. */
export function TypingDots() {
  const { c } = useTheme();
  const reduceMotion = useReduceMotion();
  const [dots] = useState(() => [0, 1, 2].map(() => new Animated.Value(0.4)));
  useEffect(() => {
    if (reduceMotion) return;
    const loops = dots.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(v, { toValue: 1, duration: 500, useNativeDriver: false }),
          Animated.timing(v, { toValue: 0.4, duration: 500, useNativeDriver: false }),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [dots, reduceMotion]);
  return (
    <View accessible accessibilityLabel={t('ask.typing')} style={styles.wrap}>
      <View style={[styles.bubble, styles.bot, styles.typing, { backgroundColor: c.card, borderColor: c.line }]}>
        {reduceMotion ? (
          <Text tone="ink2">{t('ask.typingDots')}</Text>
        ) : (
          dots.map((v, i) => <Animated.View key={i} style={[styles.dot, { backgroundColor: c.ink2, opacity: v }]} />)
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row' },
  right: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '86%', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20 },
  me: { borderBottomRightRadius: 6 },
  bot: { borderWidth: 1, borderBottomLeftRadius: 6 },
  typing: { flexDirection: 'row', gap: 5, alignItems: 'center', minHeight: 40, borderRadius: radius.lg },
  dot: { width: 7, height: 7, borderRadius: 4 },
});
