import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, View } from 'react-native';

import { Emoji, Text } from '@/components/ui';
import { useReduceMotion } from '@/hooks/use-reduce-motion';
import { t, type StringKey } from '@/i18n';
import { useStore } from '@/state/store';
import { tab as tabEmoji, type TabEmojiKey } from '@/theme/emoji';
import { dur, ease, native } from '@/theme/motion';
import { glow, gradients } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

type TabSpec = { route: string; label: StringKey; icon: TabEmojiKey };

// Eater tabs: Map, Drops, (Report action), Ask, You. Business tabs arrive in C5.
const EATER_LEFT: TabSpec[] = [
  { route: 'index', label: 'tab.map', icon: 'map' },
  { route: 'drops', label: 'tab.drops', icon: 'drops' },
];
const EATER_RIGHT: TabSpec[] = [
  { route: 'ask', label: 'tab.ask', icon: 'ask' },
  { route: 'you', label: 'tab.you', icon: 'you' },
];

/** The custom tab bar: four tabs and a raised center Report action (not a screen). */
export function TabBar({ state, emitter, navigateToTab, insets }: BottomTabBarProps) {
  const { c } = useTheme();
  const { state: store, actions } = useStore();
  const focusedName = state.routes[state.index]?.name;

  const go = (name: string) => {
    const route = state.routes.find((r) => r.name === name);
    if (!route) return;
    const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (name !== focusedName && !event.defaultPrevented) navigateToTab(route.key);
  };

  const renderTab = (spec: TabSpec) => (
    <TabItem
      key={spec.route}
      spec={spec}
      selected={focusedName === spec.route}
      onPress={() => go(spec.route)}
    />
  );

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={t('tab.eaterA11y')}
      style={[
        styles.bar,
        { backgroundColor: c.card, borderTopColor: c.line, paddingBottom: Math.max(insets.bottom, 8) },
      ]}
    >
      {EATER_LEFT.map(renderTab)}
      <CenterAction open={store.reportOpen} onPress={store.reportOpen ? actions.closeReport : actions.openReport} />
      {EATER_RIGHT.map(renderTab)}
    </View>
  );
}

function TabItem({ spec, selected, onPress }: { spec: TabSpec; selected: boolean; onPress: () => void }) {
  const { c, isNight } = useTheme();
  const reduceMotion = useReduceMotion();
  const [lift] = useState(() => new Animated.Value(selected ? 1 : 0));

  useEffect(() => {
    if (reduceMotion) {
      lift.setValue(selected ? 1 : 0);
      return;
    }
    Animated.timing(lift, {
      toValue: selected ? 1 : 0,
      duration: dur.base,
      easing: ease.soft,
      useNativeDriver: native,
    }).start();
  }, [lift, selected, reduceMotion]);

  const label = t(spec.label);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      style={styles.item}
    >
      <Animated.View
        style={{
          opacity: selected ? 1 : 0.5,
          transform: [
            { translateY: lift.interpolate({ inputRange: [0, 1], outputRange: [0, -2] }) },
            { scale: lift.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) },
          ],
        }}
      >
        <Emoji size={22}>{tabEmoji[spec.icon]}</Emoji>
      </Animated.View>
      <Text variant="micro" tone={selected ? 'ink' : 'ink2'} center style={styles.label}>
        {label}
      </Text>
      <View
        style={[
          styles.dot,
          { backgroundColor: selected ? c.neon : 'transparent' },
          selected && isNight && glow(c.neon, 6, 0.9),
        ]}
      />
    </Pressable>
  );
}

function CenterAction({ open, onPress }: { open: boolean; onPress: () => void }) {
  const { c, isNight } = useTheme();
  const reduceMotion = useReduceMotion();
  const [turn] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const to = open ? 1 : 0;
    if (reduceMotion) turn.setValue(to);
    else Animated.timing(turn, { toValue: to, duration: dur.base, easing: ease.soft, useNativeDriver: native }).start();
  }, [open, reduceMotion, turn]);

  const rotate = turn.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] });

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={open ? t('report.close') : t('tab.reportA11y')}
      accessibilityHint={open ? undefined : t('tab.reportHint')}
      accessibilityState={{ expanded: open }}
      style={({ pressed }) => [styles.item, styles.center, pressed && { opacity: 0.9 }]}
    >
      <View style={[styles.ring, { backgroundColor: c.paper }]}>
        {Platform.OS !== 'ios' && isNight ? <View style={[styles.halo, { backgroundColor: c.chili }]} /> : null}
        <LinearGradient
          colors={gradients.hotIcon}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.circle, isNight && glow('#ff3c5a', 20, 0.9)]}
        >
          <Animated.Text
            accessible={false}
            importantForAccessibility="no-hide-descendants"
            accessibilityElementsHidden
            allowFontScaling={false}
            style={[styles.plus, { color: c.onHot, transform: [{ rotate }] }]}
          >
            {tabEmoji.report}
          </Animated.Text>
        </LinearGradient>
      </View>
      <Text variant="micro" tone="ink2" center style={styles.label}>
        {t('tab.report')}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    paddingTop: 6,
    paddingHorizontal: 6,
  },
  item: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'flex-end', gap: 3, paddingVertical: 4 },
  label: { letterSpacing: 0 },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 1 },
  center: { marginTop: -26 },
  ring: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', width: 66, height: 66, borderRadius: 33, opacity: 0.3, transform: [{ scale: 1.1 }] },
  circle: { width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center' },
  plus: { fontFamily: 'Unbounded_800ExtraBold', fontSize: 30, lineHeight: 36, textAlign: 'center' },
});
