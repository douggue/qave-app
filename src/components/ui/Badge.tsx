import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useHydrated } from '@/hooks/use-hydrated';
import { radius } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { iconFor, Icon } from './Icon';
import { Emoji, Text, type TextTone } from './Text';

export type BadgeTone = 'grape' | 'mint' | 'neon' | 'amber' | 'hot' | 'neutral';

type Props = {
  label: string;
  tone?: BadgeTone;
  icon?: string;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  /** Clock- or locale-dependent label: a same-height placeholder until the web page hydrates. */
  live?: boolean;
};

/** A small status pill. Text wraps if it must; meaning is always in the text, not only the color. */
export function Badge({ label, tone = 'neutral', icon, accessibilityLabel, style, live }: Props) {
  const { c } = useTheme();
  const hydrated = useHydrated();
  if (live && !hydrated) {
    return <View aria-hidden style={[styles.badge, styles.skeleton, { backgroundColor: c.card2 }, style]} />;
  }
  const bg: Record<BadgeTone, string> = {
    grape: c.tintGrape,
    mint: c.tintMint,
    neon: c.tintNeon,
    amber: c.tintAmber,
    hot: c.hotFill,
    neutral: c.card2,
  };
  const ink: Record<BadgeTone, TextTone> = {
    grape: 'grape',
    mint: 'mint',
    neon: 'neon',
    amber: 'amber',
    hot: 'onHot',
    neutral: 'ink2',
  };
  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel ?? label}
      style={[styles.badge, { backgroundColor: bg[tone] }, style]}
    >
      {icon ? (
        iconFor(icon) ? (
          <Icon name={iconFor(icon)!} size={13} color={c[ink[tone]]} strokeWidth={2.6} />
        ) : (
          <Emoji size={12}>{icon}</Emoji>
        )
      ) : null}
      <Text variant="caption" tone={ink[tone]} style={styles.label}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.pill,
    maxWidth: '100%',
  },
  label: { flexShrink: 1 },
  skeleton: { width: 96, height: 24 },
});
