import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

type Props = {
  children: ReactNode;
  /** Wrap content in a padded ScrollView. */
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Safe area (top) plus the themed paper background. The tab bar handles the bottom inset. */
export function Screen({ children, scroll, style }: Props) {
  const { c } = useTheme();
  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: c.paper }]}>
      {scroll ? (
        <ScrollView contentContainerStyle={[styles.content, style]}>{children}</ScrollView>
      ) : (
        <View style={[styles.fill, style]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  fill: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: space.md, gap: space.lg, paddingBottom: space.xxl },
});
