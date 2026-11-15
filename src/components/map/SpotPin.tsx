import { memo, useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, View } from 'react-native';

import { FoodSticker, Glyph, Text } from '@/components/ui';
import { moodText, pinLabel } from '@/data/format';
import type { Spot } from '@/data/types';
import { useReduceMotion } from '@/hooks/use-reduce-motion';
import { t } from '@/i18n';
import { pinGlow } from '@/theme/emoji';
import { kindGlyph, moodGlyph } from '@/theme/glyphs';
import { dur, ease, native, spring } from '@/theme/motion';
import { elevation, glow } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { useMapInverseScale } from './LokalMap';

// A sticker pin (01-ui-design-system.md 6.8): the food sticker with no circle behind it,
// a soft glow at night, an anchor dot planted on (x, y), a kind chip and a live dot.

const BOX_W = 60;
const BOX_H = 76;
const ANCHOR_Y = 72;
/** Offset from the box center to the anchor, used to scale around the anchor. */
const PIVOT = ANCHOR_Y - BOX_H / 2;

/** How much mood text a pin shows: the big bubble (at most 3 pins), a small tag, or nothing. */
export type PinLabel = 'bubble' | 'tag' | 'none';

type Props = {
  spot: Spot;
  selected: boolean;
  label: PinLabel;
  /** The one- or two-word tag under the pin (mood or "closing soon"). */
  tag: string | null;
  dimmed: boolean;
  /** Shared bob loop value (0..1) from the map screen. */
  bob: Animated.Value;
  onPress: (spot: Spot) => void;
};

export const SpotPin = memo(function SpotPin({ spot, selected, label, tag, dimmed, bob, onPress }: Props) {
  const { c, isNight } = useTheme();
  const reduceMotion = useReduceMotion();
  const inverse = useMapInverseScale();
  const [fade] = useState(() => new Animated.Value(dimmed ? 0.3 : 1));
  const [lift] = useState(() => new Animated.Value(selected ? 1 : 0));
  const [pop] = useState(() => new Animated.Value(1));
  const glowColor = pinGlow(spot.food);
  const mood = moodText(spot);

  useEffect(() => {
    Animated.timing(fade, {
      toValue: dimmed ? 0.3 : 1,
      duration: reduceMotion ? dur.instant : dur.base,
      easing: ease.soft,
      useNativeDriver: native,
    }).start();
  }, [dimmed, fade, reduceMotion]);

  useEffect(() => {
    if (reduceMotion) {
      lift.setValue(selected ? 1 : 0);
      return;
    }
    const anim = selected
      ? Animated.spring(lift, { toValue: 1, ...spring.pop, useNativeDriver: native })
      : Animated.timing(lift, { toValue: 0, duration: dur.fast, easing: ease.soft, useNativeDriver: native });
    anim.start();
  }, [lift, selected, reduceMotion]);

  // Pop the mood bubble when the mood changes (a new report, a go-live).
  const firstMood = useRef(true);
  useEffect(() => {
    if (firstMood.current) {
      firstMood.current = false;
      return;
    }
    if (!mood || label !== 'bubble') return;
    if (reduceMotion) {
      pop.setValue(1);
      return;
    }
    pop.setValue(0.6);
    Animated.spring(pop, { toValue: 1, ...spring.pop, useNativeDriver: native }).start();
  }, [mood, label, pop, reduceMotion]);

  const bobY = reduceMotion
    ? 0
    : bob.interpolate({ inputRange: [0, 1], outputRange: [0, spot.hot || selected ? -5 : -2.5] });
  const liftY = lift.interpolate({ inputRange: [0, 1], outputRange: [0, -5] });
  const liftScale = lift.interpolate({ inputRange: [0, 1], outputRange: [1, reduceMotion ? 1.15 : 1.2] });

  const scaleTransform = inverse ? [{ translateY: PIVOT }, { scale: inverse }, { translateY: -PIVOT }] : [];

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.box,
        { left: spot.x - BOX_W / 2, top: spot.y - ANCHOR_Y, zIndex: selected ? 2000 : (dimmed ? 0 : 1000) + Math.round(spot.y / 10) },
        { opacity: fade, transform: scaleTransform },
      ]}
    >
      {label === 'bubble' && mood && spot.mood ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.moodWrap, { transform: [{ translateY: bobY }, { scale: pop }] }]}
        >
          <View
            style={[
              styles.bubble,
              { backgroundColor: c.bubble, borderColor: isNight ? 'rgba(255,255,255,0.16)' : c.pinChipBorder },
              !isNight && elevation.e1,
            ]}
          >
            <Glyph of={moodGlyph[spot.mood.emoji]} size={13} />
            <Text variant="caption" numberOfLines={1} style={[styles.bubbleText, { color: c.bubbleInk }]}>
              {mood}
            </Text>
          </View>
        </Animated.View>
      ) : null}
      <Pressable
        onPress={() => onPress(spot)}
        accessibilityRole="button"
        accessibilityLabel={pinLabel(spot)}
        accessibilityHint={t('pin.hint')}
        accessibilityState={{ selected }}
        style={styles.hit}
      >
        <Animated.View
          style={[
            styles.sticker,
            { transform: [{ translateY: bobY }, { translateY: liftY }, { scale: liftScale }] },
            isNight && Platform.OS === 'ios' && glow(glowColor, 14, 0.9),
            !isNight && Platform.OS === 'ios' && styles.dayShadow,
          ]}
        >
          {isNight && Platform.OS !== 'ios' ? (
            <>
              <View style={[styles.halo, styles.haloOuter, { backgroundColor: glowColor }, webBlur]} />
              <View style={[styles.halo, styles.haloInner, { backgroundColor: glowColor }, webBlur]} />
            </>
          ) : null}
          <FoodSticker food={spot.food} size={40} dim={!spot.open} />
          <View style={[styles.kind, { backgroundColor: c.pinChip, borderColor: c.pinChipBorder }]}>
            <Glyph of={kindGlyph[spot.kind]} size={12} color={c.ink} strokeWidth={2.6} />
          </View>
          <View
            style={[
              styles.live,
              { backgroundColor: spot.open ? c.mintFill : c.ink3, borderColor: c.paper },
              spot.open && isNight && glow(c.mint, 6, 0.9),
            ]}
          />
        </Animated.View>
        <View
          style={[
            styles.anchor,
            { backgroundColor: isNight ? '#ffffff' : c.ink },
            isNight && glow(glowColor, 8, 0.9),
          ]}
        />
      </Pressable>
      {label === 'tag' && tag ? (
        <View pointerEvents="none" style={styles.tagWrap}>
          <View
            style={[
              styles.tag,
              { backgroundColor: c.glass, borderColor: isNight ? 'rgba(255,255,255,0.14)' : c.pinChipBorder },
            ]}
          >
            {spot.mood ? <Glyph of={moodGlyph[spot.mood.emoji]} size={10.5} /> : null}
            <Text variant="caption" numberOfLines={1} style={[styles.tagText, { color: c.ink }]}>
              {tag}
            </Text>
          </View>
        </View>
      ) : null}
    </Animated.View>
  );
});

const webBlur = (Platform.OS === 'web' ? { filter: 'blur(8px)' } : {}) as object;

const styles = StyleSheet.create({
  box: { position: 'absolute', width: BOX_W, height: BOX_H, alignItems: 'center' },
  hit: { width: BOX_W, height: BOX_H, alignItems: 'center' },
  sticker: {
    marginTop: 8,
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
    backgroundColor: 'rgba(0,0,0,0.001)',
  },
  closed: { opacity: 0.55 },
  dayShadow: { shadowColor: '#16172b', shadowOpacity: 0.35, shadowRadius: 6, shadowOffset: { width: 0, height: 4 } },
  halo: { position: 'absolute', borderRadius: 999 },
  haloOuter: { width: 50, height: 50, opacity: 0.2 },
  haloInner: { width: 34, height: 34, opacity: 0.32 },
  kind: {
    position: 'absolute',
    left: -2,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  live: { position: 'absolute', right: 0, top: 0, width: 14, height: 14, borderRadius: 7, borderWidth: 3 },
  anchor: { position: 'absolute', top: ANCHOR_Y - 5, width: 10, height: 10, borderRadius: 5 },
  moodWrap: { position: 'absolute', bottom: BOX_H + 2, left: -60, right: -60, alignItems: 'center' },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    maxWidth: 180,
  },
  bubbleText: { flexShrink: 1 },
  tagWrap: { position: 'absolute', top: BOX_H + 1, left: -50, right: -50, alignItems: 'center' },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 999,
    borderWidth: 1,
    maxWidth: 150,
  },
  tagText: { fontSize: 11.5, lineHeight: 15, flexShrink: 1 },
});
