import { memo, useId } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { Glyph, Text } from '@/components/ui';
import type { Spot } from '@/data/types';
import { useClock } from '@/hooks/use-clock';
import { t } from '@/i18n';
import { avatar, type AvatarKey } from '@/theme/emoji';
import { useTheme } from '@/theme/use-theme';

import { useMapInverseScale } from './LokalMap';
import { PIN_ANCHOR_Y } from './SpotPin';

/** Screen size of the crowd glow, and how far the sticker's center sits above the anchor. */
const SIZE = 156;
const LIFT = PIN_ANCHOR_Y - 30;

/** A crowd needs this many recent check-ins and confirmations to show. */
export const CROWD_MIN = 15;

/**
 * The crowd halo's soft radial glow, drawn under the pins around a busy spot. It keeps its
 * screen size at every zoom, like the stickers. Decorative.
 */
export const CrowdGlow = memo(function CrowdGlow({ spot }: { spot: Spot }) {
  const { c, isNight } = useTheme();
  const inverse = useMapInverseScale();
  const raw = useId();
  const id = `c${raw.replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <View
      pointerEvents="none"
      style={[
        styles.box,
        { left: spot.x - SIZE / 2, top: spot.y - SIZE / 2 - LIFT },
        inverse ? { transform: [{ translateY: LIFT }, { scale: inverse }, { translateY: -LIFT }] } : null,
      ]}
    >
      <Svg width={SIZE} height={SIZE} accessible={false}>
        <Defs>
          <RadialGradient id={id} cx={SIZE / 2} cy={SIZE / 2} r={SIZE / 2} gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={c.halo} stopOpacity={isNight ? 0.2 : 0.45} />
            <Stop offset="0.7" stopColor={c.halo} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={SIZE / 2} cy={SIZE / 2} r={SIZE / 2 - 1} fill={`url(#${id})`} />
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={SIZE / 2 - 1}
          fill="none"
          stroke={isNight ? c.halo : c.ink}
          strokeOpacity={isNight ? 0.3 : 0.25}
          strokeWidth={1.5}
        />
      </Svg>
    </View>
  );
});

/** The white pill beside a crowd: three avatar stickers and "23 here tonight". */
export const CrowdPill = memo(function CrowdPill({
  spot,
  here,
  faces,
  flip,
}: {
  spot: Spot;
  here: number;
  faces: AvatarKey[];
  /** Show the pill to the left of the pin (near the right edge of the screen). */
  flip?: boolean;
}) {
  const { c } = useTheme();
  const inverse = useMapInverseScale();
  const hour = new Date(useClock(60_000)).getHours();
  const label = t(hour >= 17 || hour < 5 ? 'crowd.here' : 'crowd.hereToday', { n: here });
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.pillBox,
        flip ? styles.pillBoxFlip : null,
        { left: flip ? spot.x - PILL_W : spot.x, top: spot.y },
        inverse
          ? {
              transform: [
                { translateX: flip ? PILL_W / 2 : -PILL_W / 2 },
                { translateY: -PILL_H / 2 },
                { scale: inverse },
                { translateX: flip ? -PILL_W / 2 : PILL_W / 2 },
                { translateY: PILL_H / 2 },
              ],
            }
          : null,
      ]}
    >
      <View
        accessible
        accessibilityLabel={t('crowd.a11y', { n: here, name: spot.name })}
        style={[styles.pill, { backgroundColor: c.crowdPill }]}
      >
        <View style={styles.faces}>
          {faces.slice(0, 3).map((f, i) => (
            <Glyph key={f} of={avatar[f]} size={19} style={i ? styles.overlap : undefined} />
          ))}
        </View>
        <Text variant="caption" numberOfLines={1} style={[styles.pillText, { color: c.crowdInk }]}>
          {label}
        </Text>
      </View>
    </Animated.View>
  );
});

/** Where the pill sits relative to the anchor (right of and a little below the sticker). */
const PILL_X = 28;
const PILL_W = PILL_X + 200;
const PILL_H = 74;

const styles = StyleSheet.create({
  box: { position: 'absolute', width: SIZE, height: SIZE, zIndex: 1 },
  pillBox: {
    position: 'absolute',
    zIndex: 1900,
    paddingLeft: PILL_X,
    paddingTop: 36,
    width: PILL_W,
    height: PILL_H,
    alignItems: 'flex-start',
  },
  pillBoxFlip: { paddingLeft: 0, paddingRight: PILL_X, alignItems: 'flex-end' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingLeft: 5,
    paddingRight: 11,
    borderRadius: 999,
    maxWidth: 200,
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  faces: { flexDirection: 'row' },
  overlap: { marginLeft: -8 },
  pillText: { fontFamily: 'Figtree_800ExtraBold', fontSize: 12, lineHeight: 14, flexShrink: 1 },
});
