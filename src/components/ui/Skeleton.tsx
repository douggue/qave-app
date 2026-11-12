import { View, type DimensionValue } from 'react-native';

import { useHydrated } from '@/hooks/use-hydrated';
import { type as typeScale, type TypeVariant } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { Text } from './Text';

/** A quiet block of the same height as the text it stands in for. Hidden from screen readers. */
export function Skeleton({ height, width = '50%' }: { height: number; width?: DimensionValue }) {
  const { c } = useTheme();
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      aria-hidden
      style={{ height, width, maxWidth: '100%', borderRadius: 6, backgroundColor: c.card2 }}
    />
  );
}

type LiveTextProps = React.ComponentProps<typeof Text> & { placeholderWidth?: DimensionValue };

/**
 * Text that depends on the clock, time zone or locale (status lines, distances, countdowns).
 * On web it renders a same-height placeholder until hydration, so the pre-rendered HTML and
 * the first client render match. On native it is plain Text.
 */
export function LiveText({ placeholderWidth, variant = 'body', ...rest }: LiveTextProps) {
  const hydrated = useHydrated();
  if (hydrated) return <Text variant={variant} {...rest} />;
  return <Skeleton height={typeScale[variant as TypeVariant].lineHeight} width={placeholderWidth} />;
}
