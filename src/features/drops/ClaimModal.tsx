import * as Clipboard from 'expo-clipboard';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Modal, Pressable, StyleSheet, View } from 'react-native';

import { Button, FoodSticker, Glyph, Text, useToast } from '@/components/ui';
import type { Spot } from '@/data/types';
import { useReduceMotion } from '@/hooks/use-reduce-motion';
import { t } from '@/i18n';
import { ui } from '@/theme/emoji';
import { uiGlyph } from '@/theme/glyphs';
import { dur, ease, native } from '@/theme/motion';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

type Props = { code: string; spot: Spot; onClose: () => void };

const SPARKS = 8;

/** "Saved one for you": a food burst, then the code to show at the truck (02 spec 7.11, 7.12). */
export function ClaimModal({ code, spot, onClose }: Props) {
  const { c, isNight, st } = useTheme();
  const toast = useToast();
  const reduceMotion = useReduceMotion();
  const [show] = useState(() => new Animated.Value(0));
  const [burst] = useState(() => new Animated.Value(0));

  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(t('drops.codeTitle'));
    const open = Animated.timing(show, { toValue: 1, duration: dur.base, easing: ease.out, useNativeDriver: native });
    const anim = reduceMotion
      ? open
      : Animated.parallel([
          open,
          Animated.timing(burst, { toValue: 1, duration: 900, easing: ease.out, useNativeDriver: native }),
        ]);
    anim.start();
    return () => anim.stop();
  }, [burst, reduceMotion, show]);

  const copy = async () => {
    try {
      await Clipboard.setStringAsync(code);
      toast.show(t('toast.codeCopied'), { emoji: ui.check });
    } catch {
      toast.show(t('toast.copyError'));
    }
  };

  const spelled = code.replace(/-/g, '').split('').join(' ');
  const boxTransform = reduceMotion
    ? []
    : [{ scale: show.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) }];

  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[styles.backdrop, { backgroundColor: c.scrim, opacity: show }]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
        />
        <Animated.View
          accessibilityViewIsModal
          style={[
            styles.box,
            {
              backgroundColor: c.sheet,
              borderColor: c.stickerLine,
              borderWidth: st.line,
              opacity: show,
              transform: boxTransform,
            },
          ]}
        >
          <View style={styles.hero}>
            {reduceMotion
              ? null
              : Array.from({ length: SPARKS }, (_, i) => {
                  const angle = (i / SPARKS) * Math.PI * 2;
                  const dist = burst.interpolate({ inputRange: [0, 1], outputRange: [0, 64] });
                  return (
                    <Animated.View
                      key={i}
                      pointerEvents="none"
                      style={[
                        styles.spark,
                        {
                          opacity: burst.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 0] }),
                          transform: [
                            { translateX: Animated.multiply(dist, Math.cos(angle)) },
                            { translateY: Animated.multiply(dist, Math.sin(angle)) },
                          ],
                        },
                      ]}
                    >
                      {i % 2 ? (
                        <Glyph of={uiGlyph.sparkle} size={15} tone="brand" strokeWidth={2} />
                      ) : (
                        <FoodSticker food={spot.food} size={16} />
                      )}
                    </Animated.View>
                  );
                })}
            <Animated.View
              style={
                reduceMotion
                  ? null
                  : {
                      transform: [
                        { scale: burst.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0.5, 1.15, 1] }) },
                      ],
                    }
              }
            >
              <FoodSticker food={spot.food} size={56} />
            </Animated.View>
          </View>

          <Text variant="title" center accessibilityRole="header">
            {t('drops.codeTitle')}
          </Text>
          <Text variant="label" tone="ink2" center>
            {t('drops.codeAt', { spot: spot.name })}
          </Text>
          <View
            accessible
            accessibilityLabel={t('drops.codeA11y', { spelled })}
            style={[styles.codeBox, { backgroundColor: c.card2, borderColor: c.line }]}
          >
            <Text tone={isNight ? 'neon' : 'ink'} center style={styles.code}>
              {code}
            </Text>
          </View>
          <Text tone="ink2" center>
            {t('drops.codeBody')}
          </Text>
          <View style={styles.buttons}>
            <Button variant="soft" icon={ui.copy} label={t('drops.copy')} onPress={copy} />
            <Button label={t('drops.done')} onPress={onClose} />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'center', padding: space.xl },
  box: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 420,
    borderRadius: radius.xl,
    borderWidth: 1,
    paddingVertical: space.xl,
    paddingHorizontal: 20,
    gap: space.md,
  },
  hero: { height: 96, alignItems: 'center', justifyContent: 'center' },
  spark: { position: 'absolute' },
  codeBox: { borderRadius: radius.md, borderWidth: 1, paddingVertical: space.lg, paddingHorizontal: space.md },
  code: { fontFamily: 'Unbounded_800ExtraBold', fontSize: 22, lineHeight: 30, letterSpacing: 2 },
  buttons: { gap: space.sm },
});
