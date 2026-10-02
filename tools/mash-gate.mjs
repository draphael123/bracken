/* tools/mash-gate.mjs - THE MASH GATE ON EVERY CAMPAIGN LEVEL (claude/combat3, the combat pass; Daniel 2026-10-01). Node only: it reads the cache
   docs/mash-bot.json (tools/mash-bot.mjs --write), never runs the bot.
   A player who only mashes attack must LOSE to every boss and mini, and must die or drop under MASH_HP% in every level. Each part of each level
   (boss, mini, level run) is ENFORCED unless it is on MASH_REPORT_ONLY in tools/level-quality.mjs - the parts the mash bot still beats after the
   combat pass, left to their boss waves - and that list may only shrink: a listed part that holds now fails until it is taken out.
   A campaign level with no row (a new level) or a stale one (its data changed since the bot ran) fails: new content is enforced from day one.
   Red on master 3fd06c78: there was no per-part gate (MASH_ENFORCE was one switch, off). Run: node tools/mash-gate.mjs */
import { LEVELS } from '../src/level.js';
import { mashGate, MASH_REPORT_ONLY } from './level-quality.mjs';

const campaign = LEVELS.filter(d => !(d.hidden && !d.secret) && !/^(shop|trial_|custom)/.test(d.id));
const fails = [];
let held = 0, soft = 0;
for (const lv of campaign) {
  const g = mashGate(lv);
  if (!g.ok) fails.push(lv.id + ': ' + g.msg);
  else { held++; if ((MASH_REPORT_ONLY[lv.id] || []).length) soft++; }
}
for (const id of Object.keys(MASH_REPORT_ONLY)) if (!campaign.some(l => l.id === id)) fails.push('MASH_REPORT_ONLY names ' + id + ', which is not a campaign level');
if (fails.length) { console.log('mash-gate: ' + fails.length + ' FAIL (node tools/mash-bot.mjs <id> --level <id> --write; docs/BOSS-AUDIT.md)\n  ' + fails.join('\n  ')); process.exit(1); }
console.log('mash-gate: ' + held + ' campaign levels hold the mash gate (' + soft + ' with parts report-only for their boss waves: ' +
  Object.entries(MASH_REPORT_ONLY).map(([id, p]) => id + ' ' + p.join('+')).join(', ') + ')');
