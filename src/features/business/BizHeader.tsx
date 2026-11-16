import { useRef } from 'react';
import { Pressable, StyleSheet, View, type ViewInstance } from 'react-native';

import { FoodArt } from '@/components/cards/FoodArt';
import { Badge, Glyph, Sticker, Text, useToast, useToastAnchor } from '@/components/ui';
import { getBusiness, getSpot } from '@/data/repo';
import { t } from '@/i18n';
import { useStore } from '@/state/store';
import { avatar, ui } from '@/theme/emoji';
import { space } from '@/theme/tokens';

/** Business screens' header: who you are, the screen caption, and a one-tap way back to Personal. */
export function BizHeader({ caption }: { caption: string }) {
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
      {spot ? <FoodArt food={spot.food} width={48} height={48} radius={14} /> : null}
      <View style={styles.text}>
        <Text variant="title" accessibilityRole="header" numberOfLines={2}>
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
        style={styles.personalWrap}
      >
        {({ pressed }) => (
          <Sticker radius={999} drop={3} pressed={pressed} faceStyle={styles.personal}>
            <Glyph of={avatar.me} size={18} />
            <Text variant="label" style={styles.personalText}>
              {t('biz.toPersonal')}
            </Text>
          </Sticker>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  // One row that never wraps: the name takes the middle and wraps to at most 2 lines.
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md, paddingTop: space.sm },
  text: { flex: 1, minWidth: 0, gap: 4 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.xs },
  personalWrap: { flexShrink: 0 },
  personal: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 45, paddingHorizontal: 14 },
  personalText: { fontFamily: 'Figtree_700Bold' },
});
