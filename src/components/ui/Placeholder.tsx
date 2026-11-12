import { StyleSheet, View } from 'react-native';

import { space } from '@/theme/tokens';

import { Badge } from './Badge';
import { Emoji, Text } from './Text';

type Props = { emoji: string; title: string; body: string; badge?: string; emojiSize?: number };

/** A friendly, never-blank state for screens that arrive in a later build. */
export function Placeholder({ emoji, title, body, badge, emojiSize = 48 }: Props) {
  return (
    <View style={styles.wrap}>
      <Emoji size={emojiSize}>{emoji}</Emoji>
      {badge ? <Badge label={badge} tone="grape" style={styles.badge} /> : null}
      <Text variant="heading" center>
        {title}
      </Text>
      <Text tone="ink2" center style={styles.body}>
        {body}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 10, padding: space.xl },
  body: { maxWidth: 320 },
  badge: { alignSelf: 'center' },
});
