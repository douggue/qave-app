import { Image, type ImageSourcePropType, type StyleProp, type TextStyle } from 'react-native';

import { food as foodEmoji, type FoodKey } from '@/theme/emoji';

import { Emoji } from './Text';

// Approved custom food emoji (design/emoji/approved). Foods without an approved sticker yet
// fall back to the system emoji until their sheet is made; swapping one in is one line here.
const STICKERS: Partial<Record<FoodKey, ImageSourcePropType>> = {
  taco: require('../../../assets/emoji/food-taco.png'),
  burger: require('../../../assets/emoji/food-burger.png'),
  dumpling: require('../../../assets/emoji/food-dumpling.png'),
  pho: require('../../../assets/emoji/food-pho.png'),
  jerk: require('../../../assets/emoji/food-jerk.png'),
  bbq: require('../../../assets/emoji/food-bbq.png'),
  curry: require('../../../assets/emoji/food-curry.png'),
  supper: require('../../../assets/emoji/food-supper.png'),
  rings: require('../../../assets/emoji/food-rings.png'),
  shake: require('../../../assets/emoji/food-shake.png'),
  paleta: require('../../../assets/emoji/food-paleta.png'),
};

type Props = { food: FoodKey; size: number; style?: StyleProp<TextStyle>; dim?: boolean };

/** A food sticker: our custom emoji when approved, else the system emoji. Decorative. */
export function FoodSticker({ food, size, style, dim }: Props) {
  const src = STICKERS[food];
  if (src) {
    return (
      <Image
        source={src}
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no"
        style={{ width: size * 1.08, height: size * 1.08, opacity: dim ? 0.55 : 1 }}
        resizeMode="contain"
      />
    );
  }
  return (
    <Emoji size={size} style={[style, dim && { opacity: 0.55 }]}>
      {foodEmoji[food]}
    </Emoji>
  );
}
