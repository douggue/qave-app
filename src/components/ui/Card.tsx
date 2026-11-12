import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { glow, gradients, radius } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

type Props = {
  children: ReactNode;
  variant?: 'default' | 'ai' | 'live' | 'hot';
  style?: StyleProp<ViewStyle>;
};

/** A themed surface. Content stacks in a column with a 10 pt gap. */
export function Card({ children, variant = 'default', style }: Props) {
  const { c, isNight } = useTheme();
  const base = [styles.card, { backgroundColor: c.card, borderColor: c.line }];

  if (variant === 'ai') {
    return (
      <LinearGradient
        colors={gradients.aiCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, styles.ai, style]}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View
      style={[
        base,
        variant === 'live' && { borderColor: 'rgba(52,224,161,0.45)' },
        variant === 'live' && isNight && glow(c.mint, 18, 0.35),
        variant === 'hot' && { borderColor: 'rgba(255,90,60,0.50)' },
        variant === 'hot' && isNight && glow(c.hot, 16, 0.35),
        style,
      ]}
    >
      {variant === 'live' ? (
        <LinearGradient
          colors={gradients.liveOn}
          start={{ x: 1, y: 0 }}
          end={{ x: 0.4, y: 0.6 }}
          style={[StyleSheet.absoluteFill, { borderRadius: radius.lg }]}
          pointerEvents="none"
        />
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: radius.lg, padding: 14, gap: 10 },
  ai: { borderColor: 'rgba(165,133,255,0.30)', borderRadius: 20, paddingVertical: 12 },
});
