/* tools/gormburn.mjs - NODE ONLY (no browser). claude/gormburn (Daniel 11-07): the villagers' gold, the Pyromancer's NEW, no walk-out from the Burning Village. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as TRM from '../src/transitions.js';
import { villagerBonus, VILLAGER_GOLD, ALL_SIX_GOLD, VILLAGERS } from '../src/burning-village.js';
const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
let n = 0; const ok = (name, c, extra) => { n++; if (!c) { console.error('FAIL ' + name + (extra ? ' | ' + extra : '')); process.exitCode = 1; } else console.log('ok  ' + name); };
ok('25 gold per villager, 50 more for all six: 0 -> 0, 1 -> 25, 5 -> 125, 6 -> 200 (max 200; the Pyromancer costs 800)', villagerBonus(0) === 0 && villagerBonus(1) === 25 && villagerBonus(5) === 125 && villagerBonus(6) === 200 && VILLAGER_GOLD === 25 && ALL_SIX_GOLD === 50 && VILLAGERS === 6);
ok('the bonus never exceeds the village and ignores nonsense', villagerBonus(9) === 200 && villagerBonus(-3) === 0 && villagerBonus(NaN) === 0 && villagerBonus(2.7) === 50);
{ let paid = 0, best = 0; for (const run of [3, 3, 2, 5, 6, 6, 4]) { const pay = villagerBonus(run) - villagerBonus(best); paid += Math.max(0, pay); best = Math.max(best, run); }
  ok('replays pay only villagers beyond the best already paid: the whole village is paid ONCE, 200 gold, however it is replayed', paid === 200, String(paid)); }
ok('NO transition leaves the Burning Village (no row from burning: clear -> level-complete card -> map, no walk-out, no WHERE NEXT card)', !TRM.TABLE.some(e => e.from === 'burning') && TRM.entryFor('burning', undefined, { burningOpen: true }) === null);
ok('winLevel0 pays the thanks into the purse once per new villager, remembers the best (saved), sets the Pyromancer NEW only on the FIRST clear', /id === 'burning'\) \{ const of = questOf\(\)\.n/.test(src) && src.includes('PROG[id].saved = Math.max(pv, n); if (pay > 0) PROG.coins += pay;') && src.includes('first: !p.cleared') && src.includes('if (!p.cleared) { PROG.pyroNew = true;'));
ok('the clear card: SAVED n/6 line with the gold and the ALL SIX line, the Pyromancer line on the FIRST clear only, and it replaces the NEXT-medal row then', src.includes("'SAVED ' + burnWin.n + '/' + burnWin.of") && src.includes("'   ALL SIX +' + burnWin.all") && src.includes("'THE PYROMANCER CAN NOW BE BOUGHT AT THE STORE'") && src.includes('!(burnWin && burnWin.first)'));
ok('the store: NEW on the Pyromancer row until looked at or bought; the map store node shows the NEW arrow too', src.includes("k.id === 'pyro' && pyroNew()") && src.includes('PROG.storeHint || pyroNew()') && src.includes('const pyroNew = () => !!PROG.pyroNew && !(PROG.heroes && PROG.heroes.pyro)'));
ok('the Pyromancer still needs the burning clear (coinNeeds burning, main.js hero list)', /id: 'pyro'[^\n]*coinNeeds: 'burning'/.test(src));
console.log(process.exitCode ? 'FAILED' : 'gormburn: all ' + n + ' green');
