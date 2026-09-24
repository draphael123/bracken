/* tools/audit-rank.mjs — merges the measured boss numbers into the tables in docs/audit/ranking-2026-09-24.md. NOT in the suite.
   Reads work/audit/bosslab.json (tools/audit-bosslab.mjs) and work/audit/bosses-static.json (tools/audit-bosses.mjs --json)
   and prints one markdown row per boss: kills/6, median fight seconds (a timeout counts as its cap, and is marked),
   damage taken per minute as % of the hero's own max health (refill mode: the hero never dies, so this is the danger
   number), how many openings the bot made, and the heroes that timed out.
   The judgement columns (A11 caused/waited, A10, the score) are NOT computed here: they were read out of the code and are
   written into the report by hand, because A11 and A10 are not statically checkable (docs/AGENT-HANDOFF.md). */
import { readFileSync } from 'node:fs';
const lab = JSON.parse(readFileSync(new URL('../work/audit/bosslab.json', import.meta.url), 'utf8'));
const stat = JSON.parse(readFileSync(new URL('../work/audit/bosses-static.json', import.meta.url), 'utf8'));
/* fallingtower: the six-hero row crashed the page (see the report); the five-hero and reaper-only reruns stand in for it */
if (lab.fallingtower && !Array.isArray(lab.fallingtower)) {
  const a = lab['fallingtower#knight,warden,pyro,paladin,pirate'], b = lab['fallingtower#reaper'];
  if (Array.isArray(a) && Array.isArray(b)) lab.fallingtower = a.concat(b);
}
/* THE CAUSED WINDOW'S OWN MODE, per boss (read out of the code for the ranking; '-' = the boss has no caused mode). The lab's
   `opened` counter is only kept by a few pilot branches, so it is NOT used: this counts how often the fight actually entered
   the mode the player is supposed to cause, summed over the six heroes (the lab's mode ledger, opts.modes). 0 means the bot
   won without ever using the mechanic - either the mechanic is optional or the bot cannot play it. */
const CAUSED = { mother: 'open', king: 'held', golem: 'stagger', abbot: 'downed', lance: 'reel', gqueen: 'pinned', forgemaster: 'stun', winchmaster: 'downed',
  reefmaw: 'stuck', quarter: 'reel', tollmaster: 'reel', bellguard: 'vaultStunned', kraken: 'knelled', tidemarauder: 'disarmed', closedhelm: 'broken', lancer: 'blown',
  prince: 'buried', strawking: 'lashed', burieddead: 'stuck', gravewarden: 'kneel', gargoyle: 'hang', hedgewarden: 'stump', undeadmage: 'gather', pyromancer: 'overheat',
  deathknight: 'open', standardbearer: 'torn', owl: 'dazzled', archmage: 'open' };
const med = xs => { const s = xs.slice().sort((a, b) => a - b); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : null; };
console.log('| boss (level) | arena w | kills | median s | dmg %hp/min (median, min-max) | caused mode entered (sum of 6) | timed out |');
console.log('|---|---|---|---|---|---|---|');
for (const s of stat) {
  const key = s.lvl + (s.which === 'mini' ? ':mini' : '');
  const rows = Array.isArray(lab[key]) ? lab[key].filter(r => !r.skipped) : [];
  if (!rows.length) { console.log(`| ${s.boss} (${key}) | ${s.width} | not measured | | | | ${lab[key] && lab[key].error ? 'page error' : 'no rows'} |`); continue; }
  const pct = rows.map(r => Math.round(100 * r.takenPerMin / r.heroHp));
  const to = rows.filter(r => !r.killed).map(r => r.h);
  console.log(`| ${s.boss} (${key}) | ${s.width} | ${rows.filter(r => r.killed).length}/${rows.length} | ${med(rows.map(r => r.secs)).toFixed(0)}${to.length ? '+' : ''} | ${med(pct)} (${Math.min(...pct)}-${Math.max(...pct)}) | ${CAUSED[s.boss] ? CAUSED[s.boss] + ' x' + rows.reduce((n, r) => n + ((r.modes || {})[CAUSED[s.boss]] || 0), 0) : '-'} | ${to.join(', ') || '-'} |`);
}
