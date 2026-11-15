import { useRef } from 'react';
import { Pressable, StyleSheet, View, type ViewInstance } from 'react-native';

import { FoodArt } from '@/components/cards/FoodArt';
import { Badge, Glyph, Text, useToast, useToastAnchor } from '@/components/ui';
import { getBusiness, getSpot } from '@/data/repo';
import { t } from '@/i18n';
import { useStore } from '@/state/store';
import { avatar, ui } from '@/theme/emoji';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/** Business screens' header: who you are, the screen caption, and a one-tap way back to Personal. */
export function BizHeader({ caption }: { caption: string }) {
  const { c } = useTheme();
  const toast = useToast();
  const { actions } = useStore();
  const biz = getBusiness();
  const spot = getSpot(biz.spotId);
  const headerRef = useRef<ViewInstance>(null);
  const onHeaderLayout = useToastAnchor(headerRef);

  const toPersonal = () => {
    actions.setBizMode(false);
    toast.show(t('biz.switchedOut'), { emoji: avatar.me });
  };

  return (
    <View ref={headerRef} onLayout={onHeaderLayout} style={styles.row}>
      {spot ? <FoodArt food={spot.food} width={42} height={42} radius={12} /> : null}
      <View style={styles.text}>
        <Text variant="heading" accessibilityRole="header" numberOfLines={2}>
          {biz.name}
        </Text>
        <View style={styles.badges}>
          <Badge tone="grape" label={t('biz.badge')} />
          {biz.verified ? <Badge tone="mint" icon={ui.check} label={t('biz.verified')} /> : null}
          <Text variant="caption" tone="ink2">
            {caption}
          </Text>
        </View>
      </View>
      <Pressable
        onPress={toPersonal}
        accessibilityRole="button"
        accessibilityLabel={t('biz.toPersonalA11y')}
        accessibilityHint={t('biz.toPersonalHint')}
        style={({ pressed }) => [
          styles.personal,
          { backgroundColor: c.card, borderColor: c.line },
          pressed && { opacity: 0.85 },
        ]}
      >
        <Glyph of={avatar.me} size={18} />
        <Text variant="label">{t('biz.toPersonal')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  // One row that never wraps: the name takes the middle and wraps to at most 2 lines.
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md, paddingTop: space.sm },
  text: { flex: 1, minWidth: 0, gap: 4 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.xs },
  personal: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
});
