import { StyleSheet } from 'react-native';

import { Button, Card, Placeholder, Screen } from '@/components/ui';
import { t } from '@/i18n';
import type { GlyphSource } from '@/theme/glyphs';
import { space } from '@/theme/tokens';

import { BizHeader } from './BizHeader';

type Props = {
  caption: string;
  emoji: GlyphSource;
  title: string;
  body: string;
  action: { label: string; onPress: () => void; disabled?: boolean };
};

/** An honest "coming next" business screen with one useful action, never a dead end (04 spec 2.7). */
export function ComingNext({ caption, emoji, title, body, action }: Props) {
  return (
    <Screen scroll>
      <BizHeader caption={caption} />
      <Card style={styles.card}>
        <Placeholder emoji={emoji} title={title} body={body} badge={t('biz.comingBadge')} />
        <Button variant="ghost" label={action.label} onPress={action.onPress} disabled={action.disabled} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: space.sm },
});
