import { router, useLocalSearchParams } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FoodArt } from '@/components/cards/FoodArt';
import { StillThere } from '@/components/spot/Freshness';
import { Badge, Button, Card, Emoji, Placeholder, Text, useToast } from '@/components/ui';
import { formatDistance, isMobile, kindLabel, priceText, statusText } from '@/data/format';
import { directionsUrl } from '@/data/links';
import type { Spot } from '@/data/types';
import { LiveReports } from '@/features/spot/LiveReports';
import { AiSummary, BusyBars, ScheduleStrip, TopDishes, VibeChips } from '@/features/spot/SpotSections';
import { useCheckIn } from '@/hooks/use-check-in';
import { useClock } from '@/hooks/use-clock';
import { useSpots } from '@/hooks/use-spots';
import { t } from '@/i18n';
import { useStore } from '@/state/store';
import { avatar, kind as kindEmoji, ui } from '@/theme/emoji';
import { minTap, screenPad, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const BADGE_TONES = ['mint', 'neon', 'amber'] as const;

// The spot page: a stack push over the tabs, so the map keeps its pan, zoom, filter and sheet.
export default function SpotScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { c } = useTheme();
  const spots = useSpots();
  const spot = id ? spots.find((s) => s.id === id) : undefined;
  const back = () => (router.canGoBack() ? router.back() : router.replace('/'));

  if (!spot) {
    return (
      <View style={[styles.screen, styles.missing, { backgroundColor: c.paper }]}>
        <Placeholder emoji={ui.construction} title={t('spot.missing')} body={t('spot.missingBody')} />
        <Button label={t('spot.backToMap')} variant="soft" fullWidth={false} onPress={() => router.replace('/')} />
      </View>
    );
  }
  return <SpotPage spot={spot} onBack={back} />;
}

function SpotPage({ spot, onBack }: { spot: Spot; onBack: () => void }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { actions } = useStore();
  const toast = useToast();
  const now = useClock(60_000);
  const { here, checkIn } = useCheckIn(spot);
  const friends = spot.friends ?? [];
  const artH = height < 700 ? 220 : 260;

  const report = () => {
    actions.selectSpot(spot.id);
    actions.openReport();
  };
  const go = () => {
    Linking.openURL(directionsUrl(spot)).catch(() => toast.show(t('toast.mapsError'), { emoji: ui.go }));
  };

  return (
    <View style={[styles.screen, { backgroundColor: c.paper }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + space.xl }}>
        <View>
          <FoodArt food={spot.food} width="100%" height={artH + insets.top} radius={0} emojiSize={110} />
          <View style={[styles.headerBar, { top: insets.top + 8 }]}>
            <GlassButton icon={ui.back} label={t('common.back')} onPress={onBack} big />
            <GlassButton icon={ui.share} label={t('spot.share')} onPress={() => toast.show(t('common.comingNext'))} />
          </View>
        </View>

        <View style={styles.content}>
          <Text variant="display" accessibilityRole="header">
            {spot.name}
          </Text>
          <View style={styles.wrapRow}>
            <View
              style={styles.inline}
              accessible
              accessibilityLabel={t('spot.ratingA11y', { r: spot.rating, n: spot.reviewCount })}
            >
              <Emoji size={14}>{ui.star}</Emoji>
              <Text variant="ui">{t('spot.rating', { r: spot.rating, n: spot.reviewCount })}</Text>
            </View>
            <Text variant="ui" tone="ink2">
              {priceText(spot)}
            </Text>
            <View style={styles.inline}>
              <Emoji size={14}>{kindEmoji[spot.kind]}</Emoji>
              <Text variant="ui" tone="ink2">
                {kindLabel(spot)}
              </Text>
            </View>
            <Text variant="ui" tone="ink2">
              {formatDistance(spot)}
            </Text>
          </View>

          {friends.length ? (
            <View style={styles.inline}>
              <View style={styles.faces}>
                {friends.map((f) => (
                  <Emoji key={f.name} size={18}>
                    {avatar[f.avatar]}
                  </Emoji>
                ))}
              </View>
              <Text variant="label" tone="ink2" style={styles.shrink}>
                {friends.length > 1
                  ? t('spot.friendsN', { name: friends[0].name, n: friends.length - 1 })
                  : t('spot.friends1', { name: friends[0].name })}
              </Text>
            </View>
          ) : null}

          <View style={styles.wrapRow}>
            {spot.badges.map((b, i) => (
              <Badge key={b} label={b} tone={BADGE_TONES[i % BADGE_TONES.length]} />
            ))}
            <Badge label={t('spot.notChain')} accessibilityLabel={t('spot.notChainA11y')} tone="grape" icon={ui.noChain} />
          </View>
          {spot.owner ? (
            <Text variant="caption" tone="ink2">
              {t('spot.runBy', { own: spot.owner })}
            </Text>
          ) : null}

          <Card variant={spot.open ? 'live' : 'default'}>
            <View style={styles.wrapRow}>
              <View style={[styles.inline, styles.grow]}>
                <View style={[styles.dot, { backgroundColor: spot.open ? c.mintFill : c.ink3 }]} />
                <Text variant="ui" tone={spot.open ? 'mint' : 'ink2'} style={styles.shrink}>
                  {statusText(spot)}
                </Text>
              </View>
              <Text variant="caption" tone="ink2">
                {spot.hood}
              </Text>
            </View>
            <StillThere spot={spot} />
            {isMobile(spot) && spot.schedule ? <ScheduleStrip spot={spot} now={now} /> : null}
          </Card>

          <AiSummary spot={spot} />

          <View style={styles.actions}>
            <View style={styles.action}>
              <Button
                size="sm"
                variant={here ? 'soft' : 'mint'}
                icon={here ? ui.check : ui.pin}
                label={here ? t('act.here') : t('act.checkIn')}
                accessibilityLabel={t(here ? 'act.hereA11y' : 'act.checkInA11y', { name: spot.name })}
                disabled={here}
                onPress={checkIn}
              />
            </View>
            <View style={styles.action}>
              <Button
                size="sm"
                variant="ghost"
                label={t('act.report')}
                accessibilityLabel={t('act.reportA11y', { name: spot.name })}
                onPress={report}
              />
            </View>
            <View style={styles.action}>
              <Button
                size="sm"
                variant="ghost"
                icon={ui.go}
                label={t('act.go')}
                accessibilityLabel={t('act.goA11y', { name: spot.name })}
                onPress={go}
              />
            </View>
          </View>

          <BusyBars spot={spot} now={now} />
          <TopDishes spot={spot} />
          <VibeChips spot={spot} />
          <LiveReports spot={spot} onReport={report} />

          <Text variant="caption" tone="ink2" center>
            {t('spot.footer')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function GlassButton({ icon, label, onPress, big }: { icon: string; label: string; onPress: () => void; big?: boolean }) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.glass, { backgroundColor: c.glass, borderColor: c.line }, pressed && { opacity: 0.85 }]}
    >
      {big ? (
        <Text variant="title" style={styles.backGlyph}>
          {icon}
        </Text>
      ) : (
        <Emoji size={18}>{icon}</Emoji>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  missing: { alignItems: 'center', justifyContent: 'center', padding: screenPad, gap: space.lg },
  headerBar: {
    position: 'absolute',
    left: screenPad,
    right: screenPad,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  glass: {
    width: minTap,
    height: minTap,
    borderRadius: minTap / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backGlyph: { lineHeight: 30, marginTop: -2 },
  content: { padding: screenPad, gap: space.md },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: space.md, rowGap: 6 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  faces: { flexDirection: 'row' },
  grow: { flexGrow: 1, flexShrink: 1 },
  shrink: { flexShrink: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  action: { flexGrow: 1, flexBasis: 96 },
});
