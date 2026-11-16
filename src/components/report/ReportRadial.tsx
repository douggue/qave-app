import { useCallback, useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  BackHandler,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BittenButton } from '@/components/nav/BittenButton';
import { Badge, Button, FoodSticker, Glyph, Icon, Sticker, Text, useToast } from '@/components/ui';
import type { Spot } from '@/data/types';
import { isDuplicate, newReport, REPORT_OPTIONS, reportTarget, type ReportOption } from '@/features/report/options';
import { useReduceMotion } from '@/hooks/use-reduce-motion';
import { useScreenReader } from '@/hooks/use-screen-reader';
import { useSpots } from '@/hooks/use-spots';
import { t } from '@/i18n';
import { REP } from '@/state/rep';
import { useStore } from '@/state/store';
import { reportGlyph } from '@/theme/glyphs';
import { dur, ease, native, spring } from '@/theme/motion';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

// The Report action from the center tab (02 spec 7.7, 03 spec 7). Mounted once at the root,
// so it opens over the map, any tab and the spot page. It is not a route.

const ITEM = 62;
const LABEL_W = 88;
const ANGLES = [180, 144, 108, 72, 36, 0];

export function ReportRadial() {
  const { state } = useStore();
  if (!state.reportOpen || state.bizMode) return null;
  return <RadialOverlay />;
}

function RadialOverlay() {
  const { c } = useTheme();
  const { state, actions } = useStore();
  const toast = useToast();
  const spots = useSpots();
  const reduceMotion = useReduceMotion();
  const screenReader = useScreenReader();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const listMode = reduceMotion || screenReader;

  // The target is fixed when the overlay opens, so it never jumps under your finger.
  const [target] = useState<Spot | undefined>(() => reportTarget(spots, state.selectedSpot));
  const [backdrop] = useState(() => new Animated.Value(0));
  const [items] = useState(() => REPORT_OPTIONS.map(() => new Animated.Value(0)));
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (listMode) {
      items.forEach((v) => v.setValue(1));
      Animated.timing(backdrop, { toValue: 1, duration: dur.fast, easing: ease.out, useNativeDriver: native }).start();
      return;
    }
    Animated.parallel([
      Animated.timing(backdrop, { toValue: 1, duration: dur.fast, easing: ease.out, useNativeDriver: native }),
      Animated.stagger(
        40,
        items.map((v) => Animated.spring(v, { toValue: 1, ...spring.pop, useNativeDriver: native })),
      ),
    ]).start();
  }, [backdrop, items, listMode]);

  useEffect(() => {
    if (target && screenReader) AccessibilityInfo.announceForAccessibility(t('report.listTitle', { name: target.name }));
  }, [target, screenReader]);

  const dismiss = useCallback(
    (after?: () => void) => {
      if (closing) return;
      setClosing(true);
      const out = { toValue: 0, duration: dur.fast, easing: ease.in, useNativeDriver: native };
      Animated.parallel([Animated.timing(backdrop, out), ...items.map((v) => Animated.timing(v, out))]).start(() => {
        actions.closeReport();
        after?.();
      });
    },
    [actions, backdrop, closing, items],
  );

  // Android back and Escape on web close the overlay.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      dismiss();
      return true;
    });
    let removeKey: (() => void) | undefined;
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const onKey = (e: KeyboardEvent) => e.key === 'Escape' && dismiss();
      document.addEventListener('keydown', onKey);
      removeKey = () => document.removeEventListener('keydown', onKey);
    }
    return () => {
      sub.remove();
      removeKey?.();
    };
  }, [dismiss]);

  const pick = (option: ReportOption) => {
    if (closing) return; // A second tap while closing must not post twice.
    if (!target) return dismiss();
    if (option.type === 'photo') return dismiss(() => toast.show(t('toast.photoSoon'), { emoji: reportGlyph.photo }));
    if (option.type === 'newSpot') return dismiss(() => toast.show(t('toast.newSpotSoon'), { emoji: reportGlyph.newSpot }));

    if (isDuplicate(state.reports, target.id, option.type)) {
      return dismiss(() => toast.show(t('toast.alreadyReported'), { emoji: reportGlyph[option.type] }));
    }

    actions.addReport(newReport(target.id, option), REP.report, option.mood);
    actions.celebrate({ kind: 'report', spotId: target.id, report: option.type, rep: REP.report });
    toast.show(t('toast.reportLive', { spot: target.name }), { emoji: reportGlyph[option.type] });
    dismiss();
  };

  const optionA11y = (o: ReportOption) =>
    t('report.optA11y', { option: t(o.label), name: target?.name ?? '' });
  const soon = (o: ReportOption) => (o.line ? undefined : t('report.soonHint'));

  // Origin: the center of the raised Report button in the tab bar.
  const originBottom = Math.max(insets.bottom, 8) + 57;
  const R = Math.min(132, (width - 2 * space.lg - 78) / 2);

  return (
    <View style={StyleSheet.absoluteFill} accessibilityViewIsModal importantForAccessibility="yes">
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: backdrop }]}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(5,6,14,0.72)' }]}
          onPress={() => dismiss()}
          accessibilityRole="button"
          accessibilityLabel={t('report.close')}
        />
      </Animated.View>

      {listMode ? (
        <Animated.View
          style={[
            styles.listCard,
            { backgroundColor: c.sheet, paddingBottom: Math.max(insets.bottom, space.lg), opacity: backdrop },
          ]}
        >
          <Text variant="title" accessibilityRole="header">
            {target ? t('report.listTitle', { name: target.name }) : t('report.none')}
          </Text>
          {target
            ? REPORT_OPTIONS.map((o) => (
                <Pressable
                  key={o.type}
                  onPress={() => pick(o)}
                  accessibilityRole="button"
                  accessibilityLabel={optionA11y(o)}
                  accessibilityHint={soon(o)}
                >
                  {({ pressed }) => (
                    <Sticker radius={18} pressed={pressed} faceStyle={styles.listRow}>
                      <Glyph of={reportGlyph[o.type]} size={24} />
                      <Text variant="ui" style={[styles.rowLabel, styles.grow]}>
                        {t(o.label)}
                      </Text>
                      {soon(o) ? <Badge label={soon(o) ?? ''} tone="neutral" style={styles.soon} /> : null}
                    </Sticker>
                  )}
                </Pressable>
              ))
            : null}
          <View style={styles.cancel}>
            <Button size="sm" variant="ghost" fullWidth={false} label={t('report.cancel')} onPress={() => dismiss()} />
          </View>
        </Animated.View>
      ) : (
        <>
          <Animated.View
            pointerEvents="none"
            style={[styles.hint, { top: height * 0.24, opacity: backdrop }]}
          >
            <Text variant="title" center style={styles.white} accessibilityRole="header">
              {t('report.title')}
            </Text>
            {target ? (
              <View style={styles.hintRow}>
                <Text variant="ui" center style={[styles.white, styles.dim, styles.shrink]}>
                  {t('report.at')} {target.name}
                </Text>
                <FoodSticker food={target.food} size={18} />
              </View>
            ) : (
              <Text variant="ui" center style={[styles.white, styles.dim]}>
                {t('report.none')}
              </Text>
            )}
          </Animated.View>

          <View pointerEvents="box-none" style={[styles.origin, { left: width / 2, bottom: originBottom }]}>
            {target
              ? REPORT_OPTIONS.map((o, i) => {
                  const a = (ANGLES[i] * Math.PI) / 180;
                  const x = Math.cos(a) * R;
                  const y = -Math.sin(a) * R * 1.25 - 70;
                  const v = items[i];
                  return (
                    <Animated.View
                      key={o.type}
                      style={[
                        styles.item,
                        {
                          opacity: v.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 1, 1], extrapolate: 'clamp' }),
                          transform: [
                            { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, x] }) },
                            { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, y] }) },
                            { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] }) },
                          ],
                        },
                      ]}
                    >
                      <Pressable
                        onPress={() => pick(o)}
                        accessibilityRole="button"
                        accessibilityLabel={optionA11y(o)}
                        accessibilityHint={soon(o)}
                        style={styles.itemPress}
                      >
                        {({ pressed }) => (
                          <>
                            <View
                              style={[
                                styles.circle,
                                pressed && { transform: [{ scale: 1.12 }] },
                              ]}
                            >
                              <Glyph of={reportGlyph[o.type]} size={27} palette="night" strokeWidth={2.2} />
                            </View>
                            <Text variant="caption" center style={styles.white}>
                              {t(o.label)}
                            </Text>
                          </>
                        )}
                      </Pressable>
                    </Animated.View>
                  );
                })
              : null}
          </View>

          <Pressable
            onPress={() => dismiss()}
            accessibilityRole="button"
            accessibilityLabel={t('report.close')}
            style={[styles.close, { left: width / 2 - 31, bottom: originBottom - 31 }]}
          >
            <View style={styles.closeCircle}>
              <BittenButton size={60} />
              <View accessible={false} importantForAccessibility="no-hide-descendants" style={styles.plus}>
                <Icon name="plus" size={30} color="#ffffff" strokeWidth={2.8} />
              </View>
            </View>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  shrink: { flexShrink: 1 },
  white: { color: '#ffffff' },
  dim: { opacity: 0.9 },
  hint: { position: 'absolute', left: space.lg, right: space.lg, alignItems: 'center', gap: 6 },
  hintRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 6 },
  origin: { position: 'absolute', width: 0, height: 0 },
  item: { position: 'absolute', left: -LABEL_W / 2, top: -ITEM / 2, width: LABEL_W, alignItems: 'center' },
  itemPress: { alignItems: 'center', gap: 4, minHeight: 44 },
  circle: {
    width: ITEM,
    height: ITEM,
    borderRadius: ITEM / 2,
    backgroundColor: '#1f1928',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  close: { position: 'absolute', width: 62, height: 62 },
  closeCircle: { width: 60, height: 60, margin: 1, alignItems: 'center', justifyContent: 'center' },
  plus: { transform: [{ rotate: '45deg' }] },
  listCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: space.lg,
    gap: space.sm,
  },
  listRow: {
    minHeight: 56,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  rowLabel: { fontSize: 17, lineHeight: 22 },
  grow: { flexGrow: 1, flexShrink: 1 },
  soon: { alignSelf: 'center' },
  cancel: { alignItems: 'center', paddingTop: space.xs },
});
