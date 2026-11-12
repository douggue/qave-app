import { Easing, Platform } from 'react-native';

// Motion tokens from design/night-build/02-ui-screens-motion.md section 2.
export const ease = {
  soft: Easing.bezier(0.45, 0, 0.25, 1),
  out: Easing.bezier(0.25, 0.8, 0.25, 1),
  in: Easing.bezier(0.5, 0, 0.75, 0),
};

export const dur = { instant: 120, fast: 180, base: 240, slow: 360, float: 1600, rain: 2400 } as const;

export const spring = {
  sheet: { stiffness: 220, damping: 26, mass: 1 },
  pop: { stiffness: 260, damping: 18, mass: 0.9 },
  press: { stiffness: 400, damping: 30, mass: 1 },
} as const;

/** Pass as useNativeDriver for opacity and transform animations. */
export const native = Platform.OS !== 'web';
