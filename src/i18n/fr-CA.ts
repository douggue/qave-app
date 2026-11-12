import { en, type StringTable } from './en';

// Canadian French. Same keys as en; values fall back to English tonight
// until a native speaker translates them. Layouts are tested with 30% longer strings.
export const frCA: StringTable = {
  ...en,
};
