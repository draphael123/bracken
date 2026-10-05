/* tools/mash-audit.mjs - the BOSS AUDIT table, written from the mash-bot cache (docs/mash-bot.json; claude/mashbot 2026-10-01). No browser.
     node tools/mash-audit.mjs [out.md]      default docs/BOSS-AUDIT.md
   Bosses sorted worst-first (the mash bot WINNING is the worst), then the levels. */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { LEVELS } from '../src/level.js';
import { MASH_FILE, MASH_HP } from './level-quality.mjs'; import { clearsAt } from './mash-rows.mjs';
const cache = JSON.parse(readFileSync(MASH_FILE, 'utf8')), out = process.argv[2] || fileURLToPath(new URL('../docs/BOSS-AUDIT.md', import.meta.url));
const heroes = ['knight', 'warden', 'pyro'], med = a => { a = a.slice().sort((x, y) => x - y); return a.length ? a[a.length >> 1] : null; };
const sym = r => r.out === 'win' ? 'WIN' : r.out === 'dead' ? 'died' : 'timeout';
const bosses = [];
for (const lv of LEVELS) { const c = cache[lv.id]; if (!c) continue;
  for (const [key, label] of [['boss', 'boss'], ['mini', 'mini']]) { const b = c[key]; if (!b) continue;
    const ex = b.rows.filter(r => r.tag === 'expected'), l1 = b.rows.filter(r => r.tag === 'l1'), wins = ex.filter(r => r.out === 'win').length;
    const chip = ex.flatMap(r => r.chip || []).filter(x => !x.open).map(x => x.mul), chipOpen = ex.flatMap(r => r.chip || []).filter(x => x.open).map(x => x.mul);
    const rep = ex.map(r => r.reprisalPct || 0), repAvg = rep.length ? rep.reduce((a, b) => a + b, 0) / rep.length : 0;
    const blowsNone = ex.filter(r => r.out !== 'win' && (r.landed || 0) <= 2).length;
    const per = hero => { const q = ex.filter(r => r.hero === hero); return q.length ? q.map(sym).join('/') + ' (hp lost ' + q.map(r => r.hpLostPct).join('/') + '%, boss left ' + q.map(r => r.bossLeftPct).join('/') + '%)' : 'not run'; };
    const mc = med(chip), notes = [];
    if (blowsNone === ex.length && ex.length) notes.push('UNREACHABLE: the mash bot landed 2 or fewer blows in every fight (he flies, swims, sits out of reach, is shielded, or needs a jump or a mechanic first); the hero dies or times out regardless');
    else if (blowsNone) notes.push('mash landed 2 or fewer blows in ' + blowsNone + '/' + ex.length + ' fights');
    const l1w = l1.filter(r => r.out === 'win').length; if (l1.length) notes.push('level-1 hero: ' + l1w + '/' + l1.length + ' mash wins');
    const seg = ex.filter(r => r.out === 'timeout').length; if (seg) notes.push(seg + ' timeouts (the mash bot neither won nor died in the time allowed)');
    bosses.push({ lv: lv.id, label, boss: b.boss || lv.id, wins, fights: ex.length, per: Object.fromEntries(heroes.map(h => [h, per(h)])), chip: mc, chipOpen: med(chipOpen), repAvg, punish: repAvg >= 25 ? 'y' : 'n', notes, meanLeft: ex.length ? ex.reduce((a, r) => a + r.bossLeftPct, 0) / ex.length : 100, meanLost: ex.length ? ex.reduce((a, r) => a + r.hpLostPct, 0) / ex.length : 0 }); } }
bosses.sort((a, b) => (b.wins / (b.fights || 1)) - (a.wins / (a.fights || 1)) || a.meanLeft - b.meanLeft || a.meanLost - b.meanLost);
const levels = []; for (const lv of LEVELS) { const c = cache[lv.id]; if (!c || !c.level) continue; const best = Object.entries(c.level).sort((a, b) => b[1].minHpPct - a[1].minHpPct)[0], r = best[1];
  levels.push({ id: lv.id, hero: best[0], r, cleared: clearsAt(r, MASH_HP) }); }   /* (claude/combat2: a run held in a room it could not finish is not a clear) */
levels.sort((a, b) => (b.cleared - a.cleared) || b.r.minHpPct - a.r.minHpPct);
const beaten = bosses.filter(b => b.wins > 0), pad = s => String(s).replace(/\|/g, '/');
let md = '# BOSS AUDIT - the mash bot against every boss, mini and level (claude/mashbot, 2026-10-01)\n\n';
md += 'Daniel, of three levels in a row: "no challenge... the boss is just attack, attack". `tools/mash-bot.mjs` is a player who ONLY MASHES ATTACK: it walks at the boss and presses the basic attack every free frame, and never blocks, dodges, jumps on purpose, uses a heavy blow, a skill, a mechanic or an opening. Target (Hollow Knight / Salt and Sanctuary): it LOSES every boss with every hero, and in a level it dies or drops under ' + MASH_HP + '% health. Data: `docs/mash-bot.json` (regenerate this file with `node tools/mash-audit.mjs`).\n\n';
md += 'Method: a fresh hero (no skills, no talents) at the level\'s expected hero level (its depth on the gate chain), one life, normal health, no god mode, the boss lab\'s setup. Three heroes (knight, warden, pyromancer) x two seeds per boss; a level-1 variant is one seed per hero. LEVEL mode holds toward the next waypoint and mashes, and is LIFTED to the next waypoint where it makes no progress in 4 s (a gap, a wall or a machine: it never jumps), counted as lifts, so a stretch is met but not always crossed. Chip multiplier: a 40-point blow landed on the boss at four moments in the knight\'s fight while he was not open, measured and given back (x1.0 is a full hit; the rule is x0.05; a number with "(open)" would be his opening). Greed punish: "y" when a quarter or more of the hero\'s damage arrived within half a second of the mash bot\'s own blow on a boss that was not mid-attack (a reprisal, a counter) - a heuristic, not a proof.\n\n';
md += '## Summary\n\n- Fights audited: ' + bosses.length + ' (bosses and minis). The mash bot BEATS ' + beaten.length + ' of them with at least one hero (' + bosses.filter(b => b.wins === b.fights && b.fights).length + ' with every fight).\n';
md += '- Levels mashed: ' + levels.length + '; it clears ' + levels.filter(l => l.cleared).length + ' without dying or dropping under ' + MASH_HP + '% health.\n\n';
md += '## Bosses and minis, worst first (a mash WIN is the worst)\n\n| # | boss | level | mash wins | knight | warden | pyro | chip x (not open) | greed punish | notes |\n|---|---|---|---|---|---|---|---|---|---|\n';
bosses.forEach((b, i) => { md += '| ' + (i + 1) + ' | ' + b.boss + (b.label === 'mini' ? ' (mini)' : '') + ' | ' + b.lv + ' | ' + b.wins + '/' + b.fights + ' | ' + pad(b.per.knight) + ' | ' + pad(b.per.warden) + ' | ' + pad(b.per.pyro) + ' | ' + (b.chip === null ? 'n/a' : 'x' + b.chip) + ' | ' + b.punish + ' (' + Math.round(b.repAvg) + '%) | ' + pad(b.notes.join('; ')) + ' |\n'; });
md += '\n## Levels (knight-first; the best mash hero shown), worst first (cleared = it neither died nor dropped under ' + MASH_HP + '%)\n\n| level | hero level | best mash hero | lowest hp | hp lost (sum) | deaths | waypoints walked | lifts | cleared the level? |\n|---|---|---|---|---|---|---|---|---|\n';
for (const l of levels) md += '| ' + l.id + ' | ' + l.r.heroLevel + ' | ' + l.hero + ' | ' + l.r.minHpPct + '% | ' + l.r.hpLostPct + '% | ' + l.r.deaths + ' | ' + l.r.walked + '% | ' + l.r.lifts + ' | ' + (l.cleared ? 'YES (a walk)' : 'no') + ' |\n';
md += '\nCaveats: LEVEL mode lifts the hero past every stretch it cannot cross (gaps, walls, machines), so its hp numbers are a floor on the danger a real mash player meets, not a ceiling. "hp lost (sum)" counts every point lost, so healing in the level lets it pass 100%. The mash bot cannot jump, so a boss that flies or sits on a ledge may simply be out of its reach (the notes say so); that is a real answer to "does mashing win" but not a measure of how hard the boss is to a thinking player. The chip number is the boss\'s own damage gate at the moment of the probe, and some bosses change it by phase. The cache is stamped with the level\'s data, so a boss-module change needs a re-run.\n';
writeFileSync(out, md); console.log('wrote ' + out + ': ' + bosses.length + ' fights, ' + beaten.length + ' beaten, ' + levels.length + ' levels');
