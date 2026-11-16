import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useId } from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, G, RadialGradient, Rect, Stop } from 'react-native-svg';

import { artColors } from '@/components/cards/FoodArt';
import { ClosingSoon } from '@/components/spot/Freshness';
import {
  Badge,
  Button,
  Card,
  FoodSticker,
  Glyph,
  Icon,
  LiveText,
  Placeholder,
  Sticker,
  Text,
  useToast,
} from '@/components/ui';
import { confirmedTonight, crowdFaces } from '@/data/crowd';
import {
  formatDistance,
  freshness,
  friendsText,
  isMobile,
  kindLabel,
  priceText,
  ratingText,
  statusText,
} from '@/data/format';
import { directionsUrl } from '@/data/links';
import type { Spot } from '@/data/types';
import { LiveReports } from '@/features/spot/LiveReports';
import { AiSummary, BusyBars, ScheduleStrip, TopDishes, VibeChips } from '@/features/spot/SpotSections';
import { getSpots } from '@/data/repo';
import { useCheckIn } from '@/hooks/use-check-in';
import { getAppStart, useClock } from '@/hooks/use-clock';
import { useHydrated } from '@/hooks/use-hydrated';
import { useAllReports, useSpots } from '@/hooks/use-spots';
import { t } from '@/i18n';
import { REP, STILL_HERE_COOLDOWN_MS } from '@/state/rep';
import { useStore } from '@/state/store';
import { avatar, foodGlow, glowFallback, ui } from '@/theme/emoji';
import { mix, palettes, screenPad, space, withAlpha } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/** Sentence case for a label that sits first in a row ("food truck" -> "Food truck"). */
const sentence = (text: string) => text.charAt(0).toLocaleUpperCase() + text.slice(1);

/**
 * Web static output pre-renders one page per sample spot, so /spot/guera hydrates against
 * HTML for that spot (not the generic [id] page). Swap for a Supabase query later.
 */
export function generateStaticParams(): { id: string }[] {
  return getSpots().map((s) => ({ id: s.id }));
}

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
  const hydrated = useHydrated();
  const { here, checkIn } = useCheckIn(spot);
  const kind = kindLabel(spot);
  // The kind already shows in the meta row, so skip a badge that repeats it.
  const badges = spot.badges.filter((b) => b.toLocaleLowerCase() !== kind.toLocaleLowerCase());
  const friends = spot.friends ?? [];
  const heroH = insets.top + (height < 700 ? 250 : 290);
  const barH = 57 + Math.max(insets.bottom, 16) + 16;

  const report = () => {
    actions.selectSpot(spot.id);
    actions.openReport();
  };
  const go = () => {
    Linking.openURL(directionsUrl(spot)).catch(() => toast.show(t('toast.mapsError'), { emoji: ui.go }));
  };

  return (
    <View style={[styles.screen, { backgroundColor: c.paper }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: barH + space.lg }}>
        <Hero spot={spot} height={heroH} />
        <View style={[styles.headerBar, { top: insets.top + 8 }]}>
          <BackButton onPress={onBack} />
          {/* No Share button until spots have public links: a dead button erodes trust. */}
        </View>

        <View style={styles.content}>
          <View style={styles.eyebrowRow}>
            <View style={[styles.dot, { backgroundColor: spot.open ? c.mint : c.ink3 }]} />
            <LiveText variant="eyebrow" tone={spot.open ? 'mint' : 'ink2'} style={styles.shrink} placeholderWidth="60%">
              {statusText(spot).toLocaleUpperCase()}
            </LiveText>
          </View>
          <Text variant="name" accessibilityRole="header">
            {spot.name}
          </Text>
          <View style={styles.meta}>
            <View
              style={styles.inline}
              accessible
              accessibilityLabel={t('spot.ratingA11y', { r: spot.rating, n: spot.reviewCount })}
            >
              <Icon name="star" size={17} color={c.accent} strokeWidth={2.2} />
              <Text variant="ui" style={styles.metaText}>
                {ratingText(spot)}
              </Text>
            </View>
            <Text variant="ui" tone="ink2" style={styles.metaText}>
              {sentence(kind)}
            </Text>
            <LiveText variant="ui" tone="ink2" style={styles.metaText} placeholderWidth={56}>
              {formatDistance(spot)}
            </LiveText>
            <Text variant="ui" tone="ink2" style={styles.metaText}>
              {priceText(spot)}
            </Text>
          </View>

          <View style={styles.pills}>
            {badges.map((b) => (
              <Badge key={b} label={b} tone="outline" style={styles.pill} />
            ))}
            <Badge
              label={t('spot.notChain')}
              accessibilityLabel={t('spot.notChainA11y')}
              tone="sun"
              style={styles.pill}
            />
          </View>
          {spot.owner || friends.length ? (
            <Text variant="label" tone="ink2">
              {[
                spot.owner ? t('spot.runBy', { own: spot.owner }) : null,
                friends.length ? friendsText(friends.map((f) => f.name)) : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </Text>
          ) : null}

          <SeenCard spot={spot} now={now} ready={hydrated} />

          <AiSummary spot={spot} />
          <BusyBars spot={spot} now={now} ready={hydrated} />
          <TopDishes spot={spot} />
          <VibeChips spot={spot} />
          <LiveReports spot={spot} onReport={report} />

          <Text variant="caption" tone="ink2" center>
            {t('spot.footer')}
          </Text>
        </View>
      </ScrollView>

      {/* The fixed action bar: the yellow Check in and the secondary Go. */}
      <View pointerEvents="box-none" style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <LinearGradient
          pointerEvents="none"
          colors={[withAlpha(c.paper, 0), c.paper]}
          locations={[0, 0.45]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.barMain}>
          <Button
            variant={here ? 'soft' : 'primary'}
            icon={ui.check}
            label={here ? t('act.here') : t('act.checkIn')}
            accessibilityLabel={t(here ? 'act.hereA11y' : 'act.checkInA11y', { name: spot.name })}
            disabled={here}
            onPress={checkIn}
          />
        </View>
        <View style={styles.barSide}>
          <Button
            variant="soft"
            icon={ui.go}
            label={t('act.go')}
            accessibilityLabel={t('act.goA11y', { name: spot.name })}
            onPress={go}
          />
        </View>
      </View>
    </View>
  );
}

/**
 * The hero art: the food sticker at 200 pt, slightly turned. By night it sits on the food's
 * glow gradient; by day on a pastel of the food's color with soft diagonal stripes.
 */
function Hero({ spot, height }: { spot: Spot; height: number }) {
  const { isNight } = useTheme();
  const { width } = useWindowDimensions();
  const raw = useId();
  const id = raw.replace(/[^a-zA-Z0-9]/g, '');
  const strong = (foodGlow[spot.food] ?? glowFallback)[1];
  const bg = palettes.night.paper;
  const day = artColors(spot.food, false)[0];
  return (
    <View
      style={[styles.hero, { height, backgroundColor: isNight ? bg : day }]}
      aria-hidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        {isNight ? (
          <>
            <Defs>
              <RadialGradient
                id={`n${id}`}
                cx={width / 2}
                cy={height * 0.72}
                r={Math.max(width, height) * 0.8}
                gradientUnits="userSpaceOnUse"
              >
                <Stop offset="0" stopColor={mix(bg, strong, 0.42)} />
                <Stop offset="0.55" stopColor={mix(bg, strong, 0.16)} />
                <Stop offset="1" stopColor={bg} />
              </RadialGradient>
              <RadialGradient id={`g${id}`} cx={width / 2} cy={height * 0.76} r={150} gradientUnits="userSpaceOnUse">
                <Stop offset="0" stopColor={strong} stopOpacity={0.45} />
                <Stop offset="0.7" stopColor={strong} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Rect x={0} y={0} width={width} height={height} fill={`url(#n${id})`} />
            <Circle cx={width / 2} cy={height * 0.76} r={150} fill={`url(#g${id})`} />
          </>
        ) : (
          <G transform={`rotate(-30 ${width / 2} ${height / 2})`}>
            {Array.from({ length: Math.ceil(((width + height) * 2) / 44) }, (_, i) => (
              <Rect
                key={i}
                x={-width + i * 44}
                y={-height}
                width={18}
                height={height * 3}
                fill="#ffffff"
                fillOpacity={0.35}
              />
            ))}
          </G>
        )}
      </Svg>
      <View
        style={[
          styles.heroSticker,
          Platform.OS === 'web' ? heroShadowWeb : Platform.OS === 'ios' ? styles.heroShadowIos : null,
        ]}
      >
        <FoodSticker food={spot.food} size={185} />
      </View>
    </View>
  );
}

const heroShadowWeb = { filter: 'drop-shadow(0px 22px 26px rgba(0,0,0,0.35))' } as object;

/** The glass back button over the hero (a sticker by day). */
function BackButton({ onPress }: { onPress: () => void }) {
  const { c, isNight } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={t('common.back')}>
      {({ pressed }) =>
        isNight ? (
          <View style={[styles.glass, styles.glassNight, pressed && styles.pressed]}>
            <Icon name="back" size={22} color="#ffffff" strokeWidth={2.4} />
          </View>
        ) : (
          <Sticker
            radius={15}
            bg={c.card}
            drop={3}
            pressed={pressed}
            style={styles.glassSize}
            faceStyle={styles.glassFace}
          >
            <Icon name="back" size={22} color={c.ink} strokeWidth={2.4} />
          </Sticker>
        )
      }
    </Pressable>
  );
}

/**
 * "Seen 3 min ago / 17 people confirmed tonight" with three avatar stickers, the 7-day where
 * strip for spots that move, closing soon, and the one-tap "Yep, still here".
 */
function SeenCard({ spot, now, ready }: { spot: Spot; now: number; ready: boolean }) {
  const { state, actions } = useStore();
  const toast = useToast();
  const reports = useAllReports();
  const f = freshness(spot.id, reports, state.stillHere[spot.id], now, getAppStart());
  const n = confirmedTonight(spot.id, {
    reports,
    votes: state.votes,
    stillHere: state.stillHere,
    hereAt: state.hereAt,
  });
  const confirmed = n === 0 ? t('spot.confirmed0') : n === 1 ? t('spot.confirmed1') : t('spot.confirmedN', { n });
  const faces = crowdFaces(spot, reports);
  const last = state.stillHere[spot.id];
  const cooling = !!last && now - last < STILL_HERE_COOLDOWN_MS;

  const confirm = () => {
    actions.confirmStillHere(spot.id, REP.stillHere);
    toast.show(t('rep.plus', { n: REP.stillHere }), { emoji: ui.check });
  };

  return (
    <Card style={styles.seen}>
      <View style={styles.seenTop}>
        <View style={styles.grow} accessible accessibilityLabel={`${f.label}. ${confirmed}`}>
          <Text variant="cardTitle">{f.label}</Text>
          <Text variant="label" tone="ink2">
            {confirmed}
          </Text>
        </View>
        <View style={styles.faces}>
          {faces.map((k, i) => (
            <Glyph key={k} of={avatar[k]} size={27} style={i ? styles.faceOverlap : undefined} />
          ))}
        </View>
      </View>
      {isMobile(spot) && spot.schedule ? <ScheduleStrip spot={spot} now={now} ready={ready} compact /> : null}
      <ClosingSoon spot={spot} />
      {spot.open ? (
        <Button
          size="sm"
          variant="soft"
          icon={cooling ? ui.check : undefined}
          label={cooling ? t('fresh.thanks') : t('fresh.yep')}
          accessibilityLabel={cooling ? t('fresh.thanks') : t('fresh.yepA11y', { name: spot.name })}
          disabled={cooling}
          onPress={confirm}
        />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  missing: { alignItems: 'center', justifyContent: 'center', padding: screenPad, gap: space.lg },
  hero: { overflow: 'hidden' },
  heroSticker: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -18,
    alignItems: 'center',
    transform: [{ rotate: '-8deg' }],
  },
  heroShadowIos: {
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 13,
    shadowOffset: { width: 0, height: 22 },
  },
  headerBar: { position: 'absolute', left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between' },
  glass: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  glassNight: { backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.18)' },
  glassSize: { width: 44 },
  glassFace: { height: 44, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.8 },
  content: { paddingHorizontal: 22, paddingTop: 22, gap: space.md },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 14, rowGap: 4 },
  metaText: { fontFamily: 'Figtree_600SemiBold', fontSize: 14 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { paddingHorizontal: 10, paddingVertical: 5 },
  seen: { marginTop: 6, gap: 14 },
  seenTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  faces: { flexDirection: 'row' },
  faceOverlap: { marginLeft: -9 },
  grow: { flex: 1, minWidth: 0, gap: 3 },
  shrink: { flexShrink: 1 },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 22,
    paddingTop: 24,
  },
  barMain: { flex: 1.3 },
  barSide: { flex: 1 },
});
