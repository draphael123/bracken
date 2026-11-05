/* (claude/botbuilt 2) NODE-ONLY BUILD-GAP SELF-CHECK (no browser; not registered in tools/check.mjs): every hero's TYPICAL_SKILLS is non-empty, every entry is a real active skill of that hero,
   and every one has a SKILL_RANGE entry (else a `built` fight would never cast it: the '!!BUILD-GAP' of boss-rates). Run: node tools/build-gap-check.mjs  (exit 1 on a gap) */
import { TYPICAL_SKILLS, SKILL_RANGE, buildGaps } from '../src/bot-profile.js';
import { HERO_IDS, skillFor, slotsAt } from '../src/progression.js';
let bad = 0, n = 0;
for (const h of HERO_IDS) { const list = TYPICAL_SKILLS[h] || [];
  for (const id of list) { n++; const s = skillFor(h, id); if (!s || !s.active) { console.log('!!BUILD-GAP ' + h + ': ' + id + ' is not an active skill'); bad++; } }
  const g = buildGaps(h, list), allSlotted = list.slice(); if (g.empty) { console.log('!!BUILD-GAP ' + h + ': no typical skills'); bad++; }
  if (g.noRange.length) { console.log('!!BUILD-GAP ' + h + ': no SKILL_RANGE for ' + g.noRange.join(',')); bad += g.noRange.length; }
  const first = list.map(id => skillFor(h, id)).filter(s => s && s.active).sort((a, b) => a.level - b.level)[0];
  console.log((g.empty || g.noRange.length ? 'GAP ' : 'ok  ') + h + ' (' + list.length + ' skills, first unlock L' + (first ? first.level : '?') + ', slots at L30: ' + slotsAt(30) + ')'); }
console.log(bad ? 'FAIL ' + bad + ' gap(s) over ' + n + ' skills' : 'PASS: no BUILD-GAP across ' + HERO_IDS.length + ' heroes, ' + n + ' typical skills');
process.exit(bad ? 1 : 0);
