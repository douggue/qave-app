import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Emoji } from '@/components/ui';
import { food, foodGlow, glowFallback, type FoodKey } from '@/theme/emoji';
import { gradients } from '@/theme/tokens';

type Props = {
  food: FoodKey;
  width: number | '100%';
  height: number;
  radius?: number;
  emojiSize?: number;
  style?: StyleProp<ViewStyle>;
};

/** Gradient food art: the spot's glow pair with its food emoji. Decorative. */
export function FoodArt({ food: key, width, height, radius = 18, emojiSize, style }: Props) {
  const [light, strong] = foodGlow[key] ?? glowFallback;
  const size = emojiSize ?? Math.round(Math.min(typeof width === 'number' ? width : height, height) * 0.55);
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[{ width, height, borderRadius: radius, overflow: 'hidden' }, style]}
    >
      <LinearGradient colors={[light, strong]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fill}>
        <Emoji size={size}>{food[key]}</Emoji>
      </LinearGradient>
      <LinearGradient
        colors={gradients.artShade}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
