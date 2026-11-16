import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useHydrated } from '@/hooks/use-hydrated';
import { radius } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import type { GlyphSource } from '@/theme/glyphs';

import { Glyph } from './Glyph';
import { Text, type TextTone } from './Text';

export type BadgeTone = 'grape' | 'mint' | 'neon' | 'amber' | 'hot' | 'neutral' | 'outline' | 'sun';

type Props = {
  label: string;
  tone?: BadgeTone;
  /** An emoji key's glyph from src/theme/emoji.ts, drawn in the badge color. */
  icon?: GlyphSource;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  /** Clock- or locale-dependent label: a same-height placeholder until the web page hydrates. */
  live?: boolean;
};

/** A small status pill. Text wraps if it must; meaning is always in the text, not only the color. */
export function Badge({ label, tone = 'neutral', icon, accessibilityLabel, style, live }: Props) {
  const { c, st, isNight } = useTheme();
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
    outline: c.card,
    sun: c.neon,
  };
  const ink: Record<BadgeTone, TextTone> = {
    grape: 'grape',
    mint: 'mint',
    // Yellow text only reads on the dark; by day the yellow tint takes ink.
    neon: isNight ? 'neon' : 'ink',
    amber: 'amber',
    hot: 'onNeon',
    neutral: 'ink2',
    outline: 'ink',
    sun: 'onNeon',
  };
  const ring = tone === 'outline' ? { borderWidth: st.line, borderColor: c.stickerLine } : tone === 'sun' && st.line > 1.5 ? { borderWidth: st.line, borderColor: c.ctaLine } : null;
  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel ?? label}
      style={[styles.badge, { backgroundColor: bg[tone] }, ring, style]}
    >
      {icon ? <Glyph of={icon} size={11.5} color={c[ink[tone]]} plain strokeWidth={2.6} /> : null}
      <Text variant="caption" tone={ink[tone]} style={[styles.label, (tone === 'outline' || tone === 'sun') && styles.strong]}>
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
  strong: { fontFamily: 'Figtree_800ExtraBold', fontSize: 12 },
  skeleton: { width: 96, height: 24 },
});
