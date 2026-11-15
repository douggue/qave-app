import type { StringKey } from '@/i18n';

import { formatUntil } from './format';
import { getReports } from './repo';
import type { Spot } from './types';

// Canned Ask Lokal answers (Demo): keyword groups over the sample data, tested in
// order, first match wins (03-ux-eater-flows.md section 9). No AI call is made.

export type Answer = { key: StringKey; params?: Record<string, string | number>; spotIds: string[] };

type Rule = { re: RegExp; build: (find: (id: string) => Spot | undefined) => Answer };

const name = (s: Spot | undefined) => s?.name ?? '';

const RULES: Rule[] = [
  {
    re: /taco|mex|burrito|birria/,
    build: (find) => {
      const fresh = getReports('guera')[0];
      return { key: 'ask.a.tacos', params: { name: name(find('guera')), min: fresh?.ageMin ?? 5 }, spotIds: ['guera', 'curry'] };
    },
  },
  {
    re: /rain|cold|soup|cozy|wet/,
    build: (find) => ({ key: 'ask.a.rainy', params: { name: name(find('pho')) }, spotIds: ['pho', 'curry'] }),
  },
  {
    re: /late|night|midnight/,
    build: (find) => {
      const a = find('ember');
      const b = find('guera');
      return {
        key: 'ask.a.late',
        params: { a: name(a), aUntil: a ? formatUntil(a.until) : '', b: name(b), bUntil: b ? formatUntil(b.until) : '' },
        spotIds: ['ember', 'guera'],
      };
    },
  },
  {
    re: /sweet|dessert|bak|croissant|ice|paleta|cake/,
    build: (find) => ({ key: 'ask.a.sweet', params: { a: name(find('dough')), b: name(find('paleta')) }, spotIds: ['dough', 'paleta'] }),
  },
  {
    re: /bbq|brisket|rib|smok|barbecue/,
    build: (find) => ({ key: 'ask.a.bbq', params: { a: name(find('smoke')), b: name(find('jerk')) }, spotIds: ['smoke', 'jerk'] }),
  },
  {
    re: /coffee|latte|espresso|lake/,
    build: (find) => {
      const bean = find('bean');
      return { key: 'ask.a.coffee', params: { name: name(bean), until: bean ? formatUntil(bean.until) : '' }, spotIds: ['bean', 'dough'] };
    },
  },
  {
    re: /spic|hot|jerk|heat/,
    build: (find) => ({ key: 'ask.a.spicy', params: { name: name(find('jerk')) }, spotIds: ['jerk', 'guera'] }),
  },
  { re: /burger|fries|rings/, build: (find) => ({ key: 'ask.a.burger', params: { name: name(find('ember')) }, spotIds: ['ember'] }) },
  {
    re: /pho|noodle|asian|curry|dumpling|ramen/,
    build: (find) => ({ key: 'ask.a.asian', params: { name: name(find('dumpling')) }, spotIds: ['pho', 'curry', 'dumpling'] }),
  },
  { re: /cheap|\$|budget|under|deal/, build: () => ({ key: 'ask.a.cheap', spotIds: ['jerk', 'curry', 'guera'] }) },
];

/** A canned answer for a question. Asking for "open", "now" or "late" keeps open spots only. */
export function answer(question: string, spots: Spot[]): Answer {
  const q = question.toLowerCase();
  const find = (id: string) => spots.find((s) => s.id === id);
  const rule = RULES.find((r) => r.re.test(q));
  if (!rule) return { key: 'ask.a.fallback', spotIds: [] };
  const result = rule.build(find);
  const ids = result.spotIds.filter((id) => find(id));
  if (/\bopen\b|\bnow\b|late/.test(q)) {
    const open = ids.filter((id) => find(id)?.open);
    if (open.length === 0) return { key: 'ask.a.noneOpen', spotIds: ids };
    return { ...result, spotIds: open };
  }
  return { ...result, spotIds: ids };
}
