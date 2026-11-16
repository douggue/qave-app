import { memo, useEffect, useId, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text as RNText, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { FoodSticker, Text } from '@/components/ui';
import { milesFromMe, pinLabel } from '@/data/format';
import type { Spot } from '@/data/types';
import { useReduceMotion } from '@/hooks/use-reduce-motion';
import { getLocale, t } from '@/i18n';
import { dur, ease, native, spring } from '@/theme/motion';
import { useTheme } from '@/theme/use-theme';

import { useMapInverseScale } from './LokalMap';

// A sticker pin (Mix): the food sticker with a soft drop shadow, no glow, no anchor dot.
// At most a small tag under it. The selected pin gets a warm halo and a distance ring.

const BOX_W = 60;
const BOX_H = 62;
/** The sticker sits in a 52 pt square at the top of the box; its bottom edge is the anchor. */
const STICKER_TOP = 4;
const STICKER_BOX = 52;
const CX = BOX_W / 2;
const CY = STICKER_TOP + STICKER_BOX / 2;
/** Screen points from the anchor (the spot's x, y) up to the top of the box. */
export const PIN_ANCHOR_Y = STICKER_TOP + STICKER_BOX;
/** Offset from the box center to the anchor, used to scale around the anchor. */
const PIVOT = PIN_ANCHOR_Y - BOX_H / 2;

const HALO = 128;
const RING_R = 49;
/** Walking speed for the "6 MIN WALK" ring: 1.3 m/s. */
const WALK_MPS = 1.3;

type Props = {
  spot: Spot;
  selected: boolean;
  /** The one- or two-word tag under the pin, or null when this pin shows none. */
  tag: string | null;
  dimmed: boolean;
  /** Shared bob loop value (0..1) from the map screen. */
  bob: Animated.Value;
  onPress: (spot: Spot) => void;
};

export const SpotPin = memo(function SpotPin({ spot, selected, tag, dimmed, bob, onPress }: Props) {
  const { c, isNight } = useTheme();
  const reduceMotion = useReduceMotion();
  const inverse = useMapInverseScale();
  const [fade] = useState(() => new Animated.Value(dimmed ? 0.3 : 1));
  const [lift] = useState(() => new Animated.Value(selected ? 1 : 0));

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

  // Only the selected and hot pins bob (calm map); none under reduce motion.
  const bobY =
    reduceMotion || !(selected || spot.hot)
      ? 0
      : bob.interpolate({ inputRange: [0, 1], outputRange: [0, selected ? -4 : -2.5] });
  const liftScale = lift.interpolate({ inputRange: [0, 1], outputRange: [1, 1.26] });
  const scaleTransform = inverse ? [{ translateY: PIVOT }, { scale: inverse }, { translateY: -PIVOT }] : [];

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.box,
        {
          left: spot.x - BOX_W / 2,
          top: spot.y - PIN_ANCHOR_Y,
          zIndex: selected ? 2000 : (dimmed ? 0 : 1000) + Math.round(spot.y / 10),
        },
        { opacity: fade, transform: scaleTransform },
      ]}
    >
      {selected ? (
        <>
          <SelectedHalo color={c.halo} alpha={Number(c.haloAlpha)} />
          <DistanceRing spot={spot} color={c.ringInk} />
        </>
      ) : null}
      <Pressable
        onPress={() => onPress(spot)}
        accessibilityRole="button"
        accessibilityLabel={pinLabel(spot)}
        accessibilityHint={t('pin.hint')}
        accessibilityState={{ selected }}
        style={styles.hit}
      >
        <Animated.View style={[styles.sticker, { transform: [{ translateY: bobY }, { scale: liftScale }] }]}>
          {Platform.OS === 'android' ? <View style={[styles.contact, { backgroundColor: c.pinShadow }]} /> : null}
          <View style={[styles.shadowed, shadowFor(c.pinShadow, isNight)]}>
            <FoodSticker food={spot.food} size={44} dim={!spot.open} />
          </View>
        </Animated.View>
      </Pressable>
      {tag && !selected ? (
        <View pointerEvents="none" style={styles.tagWrap}>
          <View style={[styles.tag, { backgroundColor: c.tagBg }]}>
            <Text variant="micro" numberOfLines={1} style={[styles.tagText, { color: c.tagInk }]}>
              {tag}
            </Text>
          </View>
        </View>
      ) : null}
    </Animated.View>
  );
});

/** A soft drop shadow that follows the sticker's shape: CSS filter on the web, layer shadow on iOS. */
function shadowFor(color: string, night: boolean): object {
  if (Platform.OS === 'web') return { filter: `drop-shadow(0px 6px 8px ${color})` };
  if (Platform.OS === 'ios') {
    return {
      shadowColor: night ? '#000000' : '#50321a',
      shadowOpacity: night ? 0.55 : 0.35,
      shadowRadius: 7,
      shadowOffset: { width: 0, height: 6 },
    };
  }
  return {};
}

/** The selected pin's warm halo: yellow, fading out by 68% of its radius. */
function SelectedHalo({ color, alpha }: { color: string; alpha: number }) {
  const raw = useId();
  const id = `h${raw.replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <Svg width={HALO} height={HALO} style={styles.halo} pointerEvents="none" accessible={false}>
      <Defs>
        <RadialGradient id={id} cx={HALO / 2} cy={HALO / 2} r={HALO / 2} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={color} stopOpacity={alpha} />
          <Stop offset="0.68" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={HALO / 2} cy={HALO / 2} r={HALO / 2} fill={`url(#${id})`} />
    </Svg>
  );
}

/** "0.3 MI · 6 MIN WALK" in the device's units; walking time at 1.3 m/s. */
export function ringText(spot: Pick<Spot, 'x' | 'y'>): string {
  const miles = milesFromMe(spot);
  const metric = /-CA$/i.test(getLocale()) || /^fr/i.test(getLocale());
  const min = Math.max(1, Math.round((miles * 1609.34) / WALK_MPS / 60));
  const value = metric ? miles * 1.609 : miles;
  const d = value.toLocaleString(getLocale(), { maximumFractionDigits: 1, minimumFractionDigits: 1 });
  return t('ring.text', { dist: t(metric ? 'ring.km' : 'ring.mi', { d }), min });
}

/**
 * The circular distance label around the selected pin. TextPath is not reliable on native, so
 * each character is its own small text, rotated into place around the circle. Decorative: the
 * pin's label already gives the distance.
 */
function DistanceRing({ spot, color }: { spot: Spot; color: string }) {
  const unit = `${ringText(spot).toLocaleUpperCase(getLocale())} · `;
  // Repeat to fill the circle at about 7 pt of arc per character.
  const reps = Math.max(1, Math.round((2 * Math.PI * RING_R) / (unit.length * 7)));
  const chars = [...unit.repeat(reps)];
  const step = 360 / chars.length;
  return (
    <View pointerEvents="none" style={styles.ring} aria-hidden importantForAccessibility="no-hide-descendants">
      {chars.map((ch, i) => (
        <RNText
          key={i}
          allowFontScaling={false}
          style={[styles.ringChar, { color, transform: [{ rotate: `${i * step - 40}deg` }, { translateY: -RING_R }] }]}
        >
          {ch}
        </RNText>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { position: 'absolute', width: BOX_W, height: BOX_H, alignItems: 'center' },
  hit: { width: BOX_W, height: BOX_H, alignItems: 'center' },
  sticker: {
    marginTop: STICKER_TOP,
    width: STICKER_BOX,
    height: STICKER_BOX,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadowed: { alignItems: 'center', justifyContent: 'center' },
  contact: { position: 'absolute', bottom: 2, width: 34, height: 9, borderRadius: 9, opacity: 0.5 },
  halo: { position: 'absolute', left: CX - HALO / 2, top: CY - HALO / 2 },
  ring: { position: 'absolute', left: CX, top: CY, width: 0, height: 0 },
  ringChar: {
    position: 'absolute',
    left: -6,
    top: -7,
    width: 12,
    height: 14,
    textAlign: 'center',
    fontFamily: 'Figtree_800ExtraBold',
    fontSize: 9,
    lineHeight: 14,
  },
  tagWrap: { position: 'absolute', top: PIN_ANCHOR_Y + 1, left: -50, right: -50, alignItems: 'center' },
  tag: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999, maxWidth: 150 },
  tagText: { fontFamily: 'Figtree_700Bold', fontSize: 10.5, lineHeight: 14, letterSpacing: 0.2 },
});
