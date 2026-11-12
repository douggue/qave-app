import { Pressable, StyleSheet, View } from 'react-native';

import { FoodArt } from '@/components/cards/FoodArt';
import { Badge, Emoji, Text, useToast } from '@/components/ui';
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

  const toPersonal = () => {
    actions.setBizMode(false);
    toast.show(t('biz.switchedOut'), { emoji: avatar.me });
  };

  return (
    <View style={styles.row}>
      {spot ? <FoodArt food={spot.food} width={42} height={42} radius={12} /> : null}
      <View style={styles.text}>
        <Text variant="heading" accessibilityRole="header">
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
        <Emoji size={18}>{avatar.me}</Emoji>
        <Text variant="label">{t('biz.toPersonal')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.md, paddingTop: space.sm },
  text: { flex: 1, minWidth: 160, gap: 4 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.xs },
  personal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
});
