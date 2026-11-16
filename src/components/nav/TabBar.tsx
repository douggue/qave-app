import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { Icon, Text, useToast, type IconName } from '@/components/ui';

import { BittenButton } from './BittenButton';
import { getBusiness } from '@/data/repo';
import { useReduceMotion } from '@/hooks/use-reduce-motion';
import { t, type StringKey } from '@/i18n';
import { useStore } from '@/state/store';
import { dur, ease, native } from '@/theme/motion';
import { useTheme } from '@/theme/use-theme';

type TabSpec = { route: string; label: StringKey; icon: IconName };

type TabSet = { left: TabSpec[]; right: TabSpec[]; a11y: StringKey };

// Eater tabs: Map, Drops, (Report action), Ask, You.
const EATER: TabSet = {
  left: [
    { route: 'index', label: 'tab.map', icon: 'map' },
    { route: 'drops', label: 'tab.drops', icon: 'drops' },
  ],
  right: [
    { route: 'ask', label: 'tab.ask', icon: 'ask' },
    { route: 'you', label: 'tab.you', icon: 'you' },
  ],
  a11y: 'tab.eaterA11y',
};

// Business tabs: Today, Where, (Go live action), Menu, Promote.
const BUSINESS: TabSet = {
  left: [
    { route: 'today', label: 'tab.today', icon: 'today' },
    { route: 'where', label: 'tab.where', icon: 'where' },
  ],
  right: [
    { route: 'menu', label: 'tab.menu', icon: 'menu' },
    { route: 'promote', label: 'tab.promote', icon: 'promote' },
  ],
  a11y: 'tab.bizA11y',
};

/** Route names of a tab set, so the layout can hide the other set (href: null). */
export const tabRoutes = (biz: boolean) => {
  const set = biz ? BUSINESS : EATER;
  return [...set.left, ...set.right].map((s) => s.route);
};

/** The custom tab bar: four tabs and a raised center action (Report or Go live, not screens). */
export function TabBar({ state, emitter, navigateToTab, insets }: BottomTabBarProps) {
  const { c } = useTheme();
  const { state: store, actions } = useStore();
  const focusedName = state.routes[state.index]?.name;
  const biz = store.bizMode;
  const set = biz ? BUSINESS : EATER;
  const firstRoute = set.left[0].route;
  const toast = useToast();
  const inSet = focusedName ? tabRoutes(biz).includes(focusedName) : true;
  const focusedIsBiz = !!focusedName && tabRoutes(true).includes(focusedName);
  // The demo user owns the sample business. Later: the signed-in user's claimed spots.
  const ownsBusiness = !!getBusiness().spotId;
  const { setBizMode } = actions;

  // A deep link to a business route (/today, /where, ...) switches into Business mode for an
  // owner instead of bouncing to the Map. Only eater routes outside the set bounce: switching
  // modes (or a cold start in Business mode) lands on the first tab of the new set.
  const firstKey = state.routes.find((r) => r.name === firstRoute)?.key;
  useEffect(() => {
    if (!store.hydrated || inSet) return;
    if (focusedIsBiz && !biz && ownsBusiness) {
      setBizMode(true);
      toast.show(t('biz.switchedIn'));
      return;
    }
    if (firstKey) navigateToTab(firstKey);
  }, [store.hydrated, inSet, focusedIsBiz, biz, ownsBusiness, setBizMode, toast, firstKey, navigateToTab]);

  const go = (name: string) => {
    const route = state.routes.find((r) => r.name === name);
    if (!route) return;
    const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (name !== focusedName && !event.defaultPrevented) navigateToTab(route.key);
  };

  if (!store.hydrated) return null;

  const renderTab = (spec: TabSpec) => (
    <TabItem key={spec.route} spec={spec} selected={focusedName === spec.route} onPress={() => go(spec.route)} />
  );

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={t(set.a11y)}
      style={[
        styles.bar,
        { backgroundColor: c.bar, borderTopColor: c.line, paddingBottom: Math.max(insets.bottom, 10) },
      ]}
    >
      {set.left.map(renderTab)}
      {biz ? (
        <GoLiveAction live={!!store.liveSession} onPress={store.liveSession ? () => go('today') : actions.openGoLive} />
      ) : (
        <CenterAction open={store.reportOpen} onPress={store.reportOpen ? actions.closeReport : actions.openReport} />
      )}
      {set.right.map(renderTab)}
    </View>
  );
}

function TabItem({ spec, selected, onPress }: { spec: TabSpec; selected: boolean; onPress: () => void }) {
  const { c } = useTheme();
  const label = t(spec.label);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      style={({ pressed }) => [styles.item, pressed && styles.pressed]}
    >
      {/* Active: ink lines with a faint ink fill. Resting: ink3 lines (icons need 3:1, not 4.5). */}
      <Icon name={spec.icon} size={24} color={c.ink3} tint={selected ? c.ink : undefined} strokeWidth={2.2} />
      <Text variant="micro" maxFontSizeMultiplier={1.4} tone={selected ? 'ink' : 'ink2'} center style={styles.label}>
        {label}
      </Text>
    </Pressable>
  );
}

const REPORT = 60;
const R = REPORT / 2;

function CenterAction({ open, onPress }: { open: boolean; onPress: () => void }) {
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
      style={({ pressed }) => [styles.item, styles.center, pressed && styles.pressed]}
    >
      <View style={styles.reportBox}>
        <BittenButton size={REPORT} />
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Icon name="plus" size={30} color="#ffffff" strokeWidth={2.8} />
        </Animated.View>
      </View>
      <Text variant="micro" maxFontSizeMultiplier={1.4} tone="ink2" center style={styles.label}>
        {t('tab.report')}
      </Text>
    </Pressable>
  );
}

/** Business center action: Go live while offline; while live it shows LIVE and opens Today. */
function GoLiveAction({ live, onPress }: { live: boolean; onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={live ? t('biz.live') : t('tab.goLiveA11y')}
      accessibilityHint={live ? t('tab.today') : t('tab.goLiveHint')}
      style={({ pressed }) => [styles.item, styles.center, pressed && styles.pressed]}
    >
      <View style={styles.reportBox}>
        <View
          style={[
            styles.circle,
            { backgroundColor: live ? c.mintFill : c.card, borderColor: live ? c.ctaLine : c.mint },
          ]}
        >
          {live ? (
            <Icon name="live" size={28} color={c.onMint} strokeWidth={2.4} />
          ) : (
            <Icon name="golive" size={28} color={c.mint} strokeWidth={2.4} />
          )}
        </View>
      </View>
      <Text variant="micro" maxFontSizeMultiplier={1.4} tone={live ? 'mint' : 'ink2'} center style={styles.label}>
        {live ? t('biz.live') : t('tab.goLive')}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    paddingTop: 8,
    paddingHorizontal: 10,
  },
  item: { flex: 1, minHeight: 50, alignItems: 'center', justifyContent: 'flex-end', gap: 4, paddingVertical: 2 },
  pressed: { opacity: 0.8 },
  label: { letterSpacing: 0, fontFamily: 'Figtree_600SemiBold' },
  center: { marginTop: -32 },
  reportBox: { width: REPORT, height: REPORT, alignItems: 'center', justifyContent: 'center' },
  circle: {
    width: REPORT,
    height: REPORT,
    borderRadius: R,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
