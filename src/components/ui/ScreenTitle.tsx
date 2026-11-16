import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type TextStyle } from 'react-native';

import { getLocale } from '@/i18n';

import { Text, type TextTone } from './Text';

/** An eyebrow label: 11 pt caps tracked 1.8, upper-cased in the device locale. */
export function Eyebrow({
  children,
  tone = 'ink2',
  style,
  accessibilityLabel,
}: {
  children: string;
  tone?: TextTone;
  style?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}) {
  return (
    <Text variant="eyebrow" tone={tone} style={style} accessibilityLabel={accessibilityLabel ?? children}>
      {children.toLocaleUpperCase(getLocale())}
    </Text>
  );
}

/** A screen header in the Mix style: optional eyebrow, an Unbounded title, an optional line under it. */
export function ScreenTitle({
  eyebrow,
  title,
  sub,
  right,
  left,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  /** Beside the title (a badge or a button). */
  right?: ReactNode;
  /** Before the title (a back button). */
  left?: ReactNode;
}) {
  return (
    <View style={styles.wrap}>
      {left}
      <View style={styles.text}>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <View style={styles.titleRow}>
          <Text variant="display" accessibilityRole="header" style={styles.title}>
            {title}
          </Text>
          {right}
        </View>
        {sub ? (
          <Text variant="label" tone="ink2">
            {sub}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 8 },
  text: { flex: 1, minWidth: 0, gap: 4 },
  titleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 10, rowGap: 4 },
  title: { flexShrink: 1 },
});
