import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Mask, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { brand } from '@/constants/brand';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Same size and position as the pin in the native splash image (assets/splash-pin.png
// shown at imageWidth 150), so the hand-off from the native splash is seamless.
const PIN_WIDTH = 93;
const PIN_HEIGHT = 121;

const GLOW_SIZE = 460;

const PIN_PATH = 'M50 4C24 4 4 24 4 50c0 34 46 76 46 76s46-42 46-76C96 24 76 4 50 4z';
const TEETH = [
  { cx: 79, cy: 4 },
  { cx: 94, cy: 15 },
  { cx: 101, cy: 32 },
];
const CRUMBS = [
  { dx: 40, dy: -38, size: 10, color: brand.sun },
  { dx: 56, dy: -16, size: 7, color: brand.grill },
  { dx: 22, dy: -52, size: 8, color: '#ffd65c' },
  { dx: 50, dy: 4, size: 6, color: brand.chili },
];

type Props = {
  /** Called once the splash has faded out and can be removed. */
  onDone: () => void;
  /** Called after the first layout, when the native splash can be hidden. */
  onReady: () => void;
};

/**
 * The Lokal splash: the pin from the native splash gets bitten (three teeth),
 * recoils softly while crumbs fall, then the wordmark and tagline glide in
 * and the whole screen slowly cross-fades into the app. 3.5 seconds in total.
 */
export function AnimatedSplash({ onDone, onReady }: Props) {
  // Animated values are created once and kept for the life of the splash.
  const [{ teeth, recoil, crumbs, glow, word, tagline, screen }] = useState(() => ({
    teeth: TEETH.map(() => new Animated.Value(0)),
    recoil: new Animated.Value(0),
    crumbs: new Animated.Value(0),
    glow: new Animated.Value(0),
    word: new Animated.Value(0),
    tagline: new Animated.Value(0),
    screen: new Animated.Value(1),
  }));

  useEffect(() => {
    let cancelled = false;
    const ease = Easing.bezier(0.25, 0.8, 0.25, 1);

    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (cancelled) return;

      if (reduceMotion) {
        teeth.forEach((t) => t.setValue(1));
        word.setValue(1);
        tagline.setValue(1);
        Animated.timing(screen, { toValue: 0, duration: 700, delay: 900, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }).start(
          () => onDone(),
        );
        return;
      }

      // Slow, soft motion throughout: nothing snaps.
      const soft = Easing.bezier(0.45, 0, 0.25, 1);
      const bite = Animated.stagger(
        140,
        teeth.map((t) => Animated.timing(t, { toValue: 1, duration: 420, easing: soft, useNativeDriver: false })),
      );

      Animated.sequence([
        // Let the pin from the native splash sit for a beat before the bite.
        Animated.delay(300),
        Animated.parallel([
          bite,
          Animated.sequence([
            Animated.timing(recoil, { toValue: 1, duration: 380, easing: soft, useNativeDriver: true }),
            Animated.timing(recoil, { toValue: 0, duration: 700, easing: soft, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.delay(150),
            Animated.timing(crumbs, { toValue: 1, duration: 1100, easing: Easing.linear, useNativeDriver: true }),
          ]),
          Animated.timing(glow, { toValue: 1, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.sequence([
            Animated.delay(650),
            Animated.timing(word, { toValue: 1, duration: 750, easing: ease, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.delay(1050),
            Animated.timing(tagline, { toValue: 1, duration: 700, easing: ease, useNativeDriver: true }),
          ]),
        ]),
        // Hold the full logo, then cross-fade slowly into the app.
        Animated.delay(650),
        Animated.timing(screen, { toValue: 0, duration: 800, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished) onDone();
      });
    });

    return () => {
      cancelled = true;
    };
  }, [teeth, recoil, crumbs, glow, word, tagline, screen, onDone]);

  const tilt = recoil.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-5deg'] });
  const shiftX = recoil.interpolate({ inputRange: [0, 1], outputRange: [0, -4] });

  return (
    <Animated.View
      style={[
        styles.screen,
        { opacity: screen, transform: [{ scale: screen.interpolate({ inputRange: [0, 1], outputRange: [1.06, 1] }) }] },
      ]}
      onLayout={onReady}
      accessible
      accessibilityLabel="Lokal. Only local. No chains."
    >
      <Animated.View pointerEvents="none" style={[styles.center, { opacity: glow }]}>
        <Svg width={GLOW_SIZE} height={GLOW_SIZE}>
          <Defs>
            <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={brand.grill} stopOpacity={0.38} />
              <Stop offset="0.55" stopColor={brand.chili} stopOpacity={0.12} />
              <Stop offset="1" stopColor={brand.chili} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect width={GLOW_SIZE} height={GLOW_SIZE} fill="url(#glow)" />
        </Svg>
      </Animated.View>

      <View style={styles.center}>
        <Animated.View style={{ transformOrigin: '50% 85%', transform: [{ translateX: shiftX }, { rotate: tilt }] }}>
          <Svg width={PIN_WIDTH} height={PIN_HEIGHT} viewBox="0 0 100 130">
            <Defs>
              <LinearGradient id="pin" x1="0" y1="0" x2="0.6" y2="1">
                <Stop offset="0" stopColor={brand.sun} />
                <Stop offset="0.55" stopColor={brand.grill} />
                <Stop offset="1" stopColor={brand.chili} />
              </LinearGradient>
              <Mask id="bite" x="0" y="0" width="100" height="130" maskUnits="userSpaceOnUse">
                <Rect x="0" y="0" width="100" height="130" fill="#fff" />
                {TEETH.map((tooth, i) => (
                  <AnimatedCircle
                    key={i}
                    cx={tooth.cx}
                    cy={tooth.cy}
                    r={teeth[i].interpolate({ inputRange: [0, 1], outputRange: [0, 12] })}
                    fill="#000"
                  />
                ))}
              </Mask>
            </Defs>
            <Path d={PIN_PATH} fill="url(#pin)" mask="url(#bite)" />
            <Ellipse cx="32" cy="34" rx="10" ry="6" fill="#fff" opacity={0.45} transform="rotate(-35 32 34)" />
            <Circle cx="46" cy="56" r="12" fill={brand.night} />
          </Svg>
        </Animated.View>

        {CRUMBS.map((c, i) => (
          <Animated.View
            key={i}
            pointerEvents="none"
            style={[
              styles.crumb,
              {
                width: c.size,
                height: c.size,
                backgroundColor: c.color,
                opacity: crumbs.interpolate({ inputRange: [0, 0.1, 0.6, 1], outputRange: [0, 1, 1, 0] }),
                transform: [
                  { translateX: crumbs.interpolate({ inputRange: [0, 0.45, 1], outputRange: [0, c.dx, c.dx * 1.25] }) },
                  { translateY: crumbs.interpolate({ inputRange: [0, 0.45, 1], outputRange: [0, c.dy, c.dy + 70] }) },
                ],
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.text}>
        <Animated.Text
          style={[
            styles.word,
            {
              opacity: word,
              transform: [{ translateY: word.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
            },
          ]}
        >
          Lokal
        </Animated.Text>
        <Animated.Text
          style={[
            styles.tagline,
            {
              opacity: tagline,
              transform: [{ translateY: tagline.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
            },
          ]}
        >
          Only local. No chains.
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    ...StyleSheet.absoluteFill,
    backgroundColor: brand.night,
    zIndex: 100,
  },
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crumb: {
    position: 'absolute',
    borderRadius: 10,
    marginLeft: 70,
    marginTop: -70,
  },
  text: {
    ...StyleSheet.absoluteFill,
    top: '50%',
    marginTop: PIN_HEIGHT / 2 + 26,
    alignItems: 'center',
    gap: 14,
  },
  word: {
    fontFamily: 'Unbounded_800ExtraBold',
    fontSize: 46,
    letterSpacing: -1.8,
    color: brand.moon,
  },
  tagline: {
    fontFamily: 'Figtree_700Bold',
    fontSize: 16,
    letterSpacing: 1,
    color: brand.sun,
  },
});
