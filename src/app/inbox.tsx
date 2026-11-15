import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Badge, Card, Glyph, Screen, Text } from '@/components/ui';
import type { Note } from '@/data/types';
import { t } from '@/i18n';
import { useNotes, useStore } from '@/state/store';
import { ui } from '@/theme/emoji';
import { noteGlyph } from '@/theme/glyphs';
import { hitSlop, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

// Inbox from the map bell: sample notes plus this session's (a business going live).
export default function InboxScreen() {
  const { c } = useTheme();
  const { actions } = useStore();
  const notes = useNotes();
  // Notes that were new when you opened the inbox keep their "New" badge for this visit.
  const [freshIds] = useState(() => new Set(notes.filter((n) => n.unread).map((n) => n.id)));

  // Opening the inbox marks everything read (the bell count clears when you come back).
  const unreadIds = notes.filter((n) => n.unread).map((n) => n.id).join(',');
  useEffect(() => {
    if (unreadIds) actions.readNotes(unreadIds.split(','));
  }, [actions, unreadIds]);

  const back = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const open = (n: Note) => {
    if (n.go === 'drops') {
      router.navigate('/drops');
    } else if (n.go) {
      actions.focusSpot(n.go);
      router.navigate('/');
    }
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Pressable
          onPress={back}
          hitSlop={hitSlop}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          style={[styles.back, { backgroundColor: c.card, borderColor: c.line }]}
        >
          <Glyph of={ui.back} size={19} color={c.ink} strokeWidth={2.4} />
        </Pressable>
        <View style={styles.grow}>
          <Text variant="title" accessibilityRole="header">
            {t('inbox.title')}
          </Text>
          <Text variant="caption" tone="ink2">
            {t('inbox.sub')}
          </Text>
        </View>
      </View>

      {notes.length === 0 ? (
        <Card>
          <Text tone="ink2">{t('inbox.empty')}</Text>
        </Card>
      ) : (
        notes.map((n) => {
          const isNew = n.unread || freshIds.has(n.id);
          const label = t(isNew ? 'inbox.noteA11yNew' : 'inbox.noteA11y', { text: n.text, ago: n.ago });
          const hint = n.go === 'drops' ? t('inbox.openDrops') : n.go ? t('inbox.openSpot') : undefined;
          return (
            <Pressable
              key={n.id}
              onPress={() => open(n)}
              disabled={!n.go}
              accessibilityRole={n.go ? 'button' : 'text'}
              accessibilityLabel={label}
              accessibilityHint={hint}
              style={({ pressed }) => [
                styles.row,
                { backgroundColor: c.card, borderColor: c.line },
                pressed && { opacity: 0.85 },
              ]}
            >
              <View style={[styles.icon, { backgroundColor: n.tint }]}>
                <Glyph of={noteGlyph[n.emoji]} size={22} palette="day" />
              </View>
              <View style={styles.grow}>
                <Text variant="ui">{n.text}</Text>
                <Text variant="caption" tone="ink2">
                  {n.ago}
                </Text>
              </View>
              {isNew ? <Badge tone="hot" label={t('inbox.new')} /> : null}
            </Pressable>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingTop: space.sm },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grow: { flex: 1, gap: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: 64,
    padding: space.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  icon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
