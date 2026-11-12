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

/** The device locale, for example 'en-US' or 'fr-CA'. */
export const locale = detectLocale();

function pickTable(tag: string): StringTable {
  if (tables[tag]) return tables[tag];
  const lang = tag.split('-')[0];
  return tables[lang] ?? en;
}

const table = pickTable(locale);

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
  let value: string = table[key] ?? en[key] ?? key;
  if (params) {
    value = value.replace(/\{(\w+)\}/g, (match, name: string) =>
      params[name] !== undefined ? String(params[name]) : match,
    );
  }
  return pad(value);
}
