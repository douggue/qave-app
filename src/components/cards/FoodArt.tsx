import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { FoodSticker } from '@/components/ui';
import { foodGlow, glowFallback, type FoodKey } from '@/theme/emoji';
import { mix, palettes } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/**
 * The art behind a food sticker (Mix): by night the food's glow color sunk into the dark
 * (a warm, deep gradient); by day a pastel of the food's light color, like sticker-book paper.
 */
export function artColors(food: FoodKey, night: boolean): [string, string] {
  const [light, strong] = foodGlow[food] ?? glowFallback;
  if (night) {
    const bg = palettes.night.paper;
    return [mix(bg, strong, 0.24), mix(bg, strong, 0.4)];
  }
  return [mix(light, '#ffffff', 0.5), mix(light, '#ffffff', 0.38)];
}

type Props = {
  food: FoodKey;
  width: number | '100%';
  height: number;
  radius?: number;
  emojiSize?: number;
  style?: StyleProp<ViewStyle>;
  /** Style for the gradient that holds the sticker, e.g. padding to move the sticker off center. */
  fillStyle?: StyleProp<ViewStyle>;
};

/** Food art: the food's art colors with its sticker. Decorative. */
export function FoodArt({ food: key, width, height, radius = 18, emojiSize, style, fillStyle }: Props) {
  const { isNight } = useTheme();
  const size = emojiSize ?? Math.round(Math.min(typeof width === 'number' ? width : height, height) * 0.62);
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[{ width, height, borderRadius: radius, overflow: 'hidden' }, style]}
    >
      <LinearGradient
        colors={artColors(key, isNight)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.fill, fillStyle]}
      >
        <FoodSticker food={key} size={size} />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
