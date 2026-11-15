import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Chip, Glyph, Text, useToast } from '@/components/ui';
import { getBusiness } from '@/data/repo';
import type { ClockTime, Stop } from '@/data/types';
import { useReduceMotion } from '@/hooks/use-reduce-motion';
import { t } from '@/i18n';
import { useStore } from '@/state/store';
import { ui } from '@/theme/emoji';
import { statusGlyph } from '@/theme/glyphs';
import { dur, ease, native } from '@/theme/motion';
import { hitSlop, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { liveUntilText } from './format';

/** The Go live sheet (04 spec 2.3). Mounted only while open, so its choices reset each time. */
export function GoLiveSheet() {
  const { goLiveOpen } = useStore().state;
  return goLiveOpen ? <Sheet /> : null;
}

const stopCaption = (stop: Stop) => (stop.current ? t('biz.currentLocation') : t('biz.savedStop', { hood: stop.hood }));

function Sheet() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const reduceMotion = useReduceMotion();
  const { actions } = useStore();
  const biz = getBusiness();
  const [stopId, setStopId] = useState(() => (biz.stops.find((s) => s.current) ?? biz.stops[0]).id);
  const [untilIndex, setUntilIndex] = useState(() =>
    Math.max(
      0,
      biz.untilOptions.findIndex(
        (u) => u !== 'soldOut' && u.h === biz.defaultUntil.h && u.m === biz.defaultUntil.m,
      ),
    ),
  );
  const [show] = useState(() => new Animated.Value(0));

  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(t('biz.goLiveTitle'));
    const anim = Animated.timing(show, {
      toValue: 1,
      duration: reduceMotion ? dur.fast : dur.slow,
      easing: ease.out,
      useNativeDriver: native,
    });
    anim.start();
    return () => anim.stop();
  }, [reduceMotion, show]);

  const stop = biz.stops.find((s) => s.id === stopId) ?? biz.stops[0];
  const until: ClockTime | 'soldOut' = biz.untilOptions[untilIndex] ?? biz.defaultUntil;
  const untilLabel = (u: ClockTime | 'soldOut') => (u === 'soldOut' ? t('biz.untilSoldOut') : liveUntilText(u));

  const confirm = () => {
    actions.goLive(stop, until);
    if (!reduceMotion) actions.celebrate({ kind: 'goLive', spotId: biz.spotId, rep: 0 });
    toast.show(t('biz.liveToast', { place: stop.name, count: biz.followers }), { emoji: statusGlyph.live });
  };

  const translateY = reduceMotion ? 0 : show.interpolate({ inputRange: [0, 1], outputRange: [60, 0] });

  return (
    <Modal transparent visible animationType="none" onRequestClose={actions.closeGoLive} statusBarTranslucent>
      <Animated.View style={[styles.backdrop, { backgroundColor: c.scrim, opacity: show }]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={actions.closeGoLive}
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
        />
        <Animated.View
          accessibilityViewIsModal
          style={[
            styles.sheet,
            { backgroundColor: c.card, borderColor: c.line, transform: [{ translateY }] },
          ]}
        >
          <ScrollView contentContainerStyle={styles.content} bounces={false}>
            <View style={styles.titleRow}>
              <Text variant="title" accessibilityRole="header" style={styles.grow}>
                {t('biz.goLiveTitle')}
              </Text>
              <Pressable
                onPress={actions.closeGoLive}
                hitSlop={hitSlop}
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}
                style={[styles.close, { backgroundColor: c.card2 }]}
              >
                <Glyph of={ui.close} size={14} color={c.ink2} strokeWidth={2.6} />
              </Pressable>
            </View>

            <Text variant="ui" accessibilityRole="header">
              {t('biz.whereServing')}
            </Text>
            <View accessibilityRole="radiogroup" accessibilityLabel={t('biz.whereServing')} style={styles.stops}>
              {biz.stops.map((s) => {
                const checked = s.id === stopId;
                const caption = stopCaption(s);
                return (
                  <Pressable
                    key={s.id}
                    onPress={() => setStopId(s.id)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked }}
                    accessibilityLabel={t('biz.stopA11y', { name: s.name, caption })}
                    style={({ pressed }) => [
                      styles.stop,
                      { backgroundColor: c.card2, borderColor: checked ? c.mint : c.line },
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    <Glyph of={ui.pin} size={19} tone="hot" />
                    <View style={styles.grow}>
                      <Text variant="ui">{s.name}</Text>
                      <Text variant="caption" tone="ink2">
                        {caption}
                      </Text>
                    </View>
                    {checked ? (
                      <Glyph of={ui.check} size={18} color={c.mint} strokeWidth={2.6} />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            <Text variant="ui" accessibilityRole="header">
              {t('biz.servingUntil')}
            </Text>
            <View accessibilityRole="radiogroup" accessibilityLabel={t('biz.servingUntil')} style={styles.chips}>
              {biz.untilOptions.map((u, i) => (
                <Chip
                  key={i}
                  role="radio"
                  label={untilLabel(u)}
                  selected={i === untilIndex}
                  onPress={() => setUntilIndex(i)}
                  accessibilityLabel={t('biz.untilA11y', { until: untilLabel(u) })}
                />
              ))}
            </View>

            <Text variant="caption" tone="ink2">
              {t('biz.goLiveNote', { count: biz.followers })}
            </Text>
          </ScrollView>
          <View style={[styles.footer, { paddingBottom: insets.bottom + space.lg }]}>
            <Button
              variant="mint"
              icon={statusGlyph.live}
              label={t('biz.goLiveHere')}
              accessibilityLabel={t('biz.goLiveHereA11y', { place: stop.name, until: untilLabel(until) })}
              onPress={confirm}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    maxHeight: '90%',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  content: { padding: space.lg, gap: space.md },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  grow: { flex: 1 },
  close: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  stops: { gap: space.sm },
  stop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: 56,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.md,
    borderWidth: 2,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  footer: { paddingHorizontal: space.lg, paddingTop: space.sm },
});
