import { Image, type ImageSourcePropType } from 'react-native';

import type { FoodKey } from '@/theme/emoji';

// Approved custom food emoji (design/emoji/approved): every food has its sticker.
const STICKERS: Record<FoodKey, ImageSourcePropType> = {
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
  croissant: require('../../../assets/emoji/food-croissant.png'),
  kolache: require('../../../assets/emoji/food-kolache.png'),
  coffee: require('../../../assets/emoji/food-coffee.png'),
  fries: require('../../../assets/emoji/food-fries.png'),
};

type Props = { food: FoodKey; size: number; dim?: boolean };

/** A food sticker: our custom food emoji art. Decorative. */
export function FoodSticker({ food, size, dim }: Props) {
  return (
    <Image
      source={STICKERS[food]}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={{ width: size * 1.08, height: size * 1.08, opacity: dim ? 0.55 : 1 }}
      resizeMode="contain"
    />
  );
}
