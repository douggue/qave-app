import { en, type StringTable } from './en';

// Canadian French. Same keys as en; values fall back to English tonight
// until a native speaker translates them. Layouts are tested with 30% longer strings.
export const frCA: StringTable = {
  ...en,
  'dist.miLong': 'à {d} milles',
  'dist.kmLong': 'à {d} kilomètres',
  'dist.mLong': 'à {n} mètres',
  'spot.busyPeak': 'Plus achalandé vers {peak}',
  'spot.busyA11yPeak': 'Achalandage. Ouvert maintenant. Plus achalandé vers {peak}.',
  'spot.offA11y': 'congé',
  'notFound.title': 'Ce spot a bougé',
  'notFound.body': 'Les camions de bouffe font ça. On vous ramène à la carte.',
  'notFound.back': 'Retour à la carte',
  'biz.switchedIn': 'Mode Entreprise. Vos clients voient ce que vous publiez ici.',
};
