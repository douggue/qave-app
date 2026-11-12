import { Platform } from 'react-native';

import { en, type StringKey, type StringTable } from './en';
import { frCA } from './fr-CA';

export type { StringKey } from './en';

type Params = Record<string, string | number>;

const tables: Record<string, StringTable> = { en, 'fr-CA': frCA, fr: frCA };

function detectLocale(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale || 'en-US';
  } catch {
    return 'en-US';
  }
}

/** The locale the web pre-render uses, so the first client render matches its HTML. */
export const RENDER_LOCALE = 'en-US';

// On web the server has no idea of the visitor's locale, so until the page hydrates
// every render uses RENDER_LOCALE. The root layout remounts once afterwards if the
// device locale differs. Native reads the device locale from the start.
let clientReady = Platform.OS !== 'web';
let detected: string | null = null;

/** Called once by useHydrated after the first client render on web. */
export function markClientReady() {
  clientReady = true;
}

/** The device locale, for example 'en-US' or 'fr-CA'. A lazy getter, not a module constant. */
export function getLocale(): string {
  if (!clientReady) return RENDER_LOCALE;
  if (detected === null) detected = detectLocale();
  return detected;
}

function pickTable(tag: string): StringTable {
  if (tables[tag]) return tables[tag];
  const lang = tag.split('-')[0];
  return tables[lang] ?? en;
}

let tableFor: { tag: string; table: StringTable } | null = null;
function currentTable(): StringTable {
  const tag = getLocale();
  if (!tableFor || tableFor.tag !== tag) tableFor = { tag, table: pickTable(tag) };
  return tableFor.table;
}

/**
 * Dev-only length test: set `globalThis.__LOKAL_PAD__ = true` (for example in the web console)
 * and re-render to pad every string by 30%, so layouts can be checked for French.
 */
function pad(value: string): string {
  if (!__DEV__ || !(globalThis as { __LOKAL_PAD__?: boolean }).__LOKAL_PAD__) return value;
  return value + ' ' + '·'.repeat(Math.ceil(value.length * 0.3));
}

/** Translate a key, replacing {name} style params. Falls back to English, then to the key. */
export function t(key: StringKey, params?: Params): string {
  let value: string = currentTable()[key] ?? en[key] ?? key;
  if (params) {
    value = value.replace(/\{(\w+)\}/g, (match, name: string) =>
      params[name] !== undefined ? String(params[name]) : match,
    );
  }
  return pad(value);
}
