// tools/relics.mjs - THE RELICS ARE GONE (Daniel 2026-10-02: "no relic rewards"; the level-up card replaces the power they gave).
//   A. NO RELIC EXISTS. No built level places one, main.js has no RELICS table and no P.relic read, and the spawn, pickup, HUD and map card
//      code for them is gone. (Route relics: there are none. A relic was lost on death and found mid-level, so no road could ever
//      lean on one; the six that looked like traversal - climbing spurs x2, the abbot's beads, windcloak x2, iron shoes - are asked B.)
//   B. NO ROUTE NEEDED ONE. The reach fill holds no relic. For every level that held a traversal relic, the gate and every checkpoint are reached by it (Gale Moor's wind rivers are the fill's own blind spot: that level is walked by tools/moor-wind.mjs
//      and the collection lab, and its relic spot was assisted before this too).
//   C. EVERY FORMER RELIC SPOT PAYS SILVER OR IS GONE. src/relics.js VAULT_SILVER: the vault's silver lies exactly where the relic did;
//      a spot with its own silver in the same cache, or a boss's drop, is simply gone. A level never holds more than three silvers.
//   D. OLD SAVES. A save holding PROG[id].relic loses it cleanly and is paid the vault silver (its bit, so the cap of three holds), through
//      every migration path, twice over (idempotent), with nothing dangling and no crash on a malformed entry.
//   E. THE PAGE. (headless) a save with relic fields loads into the real game, every former relic level loads and runs, nothing throws.
//   node tools/relics.mjs          (PORT from tools/ports.mjs for part E; --no-page skips it)
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { VAULT_SILVER, retireRelics } from '../src/relics.js';
import { migrateProgress } from '../src/progression.js';

let bad = 0;
const ok = (c, m) => { if (!c) { bad++; console.log('FAIL: ' + m); } };
const built = id => LEVELS.find(l => l.id === id).build();

/* ---------------- A. nothing is a relic ---------------- */
for (const lv of LEVELS) { let L; try { L = lv.build(); } catch (e) { ok(false, lv.id + ' does not build: ' + e.message); continue; }
  const r = L.ents.filter(e => e.t === 'relic'); ok(!r.length, lv.id + ' places ' + r.length + ' relic(s): ' + r.map(e => e.kind + '@' + e.x + ',' + e.y).join(' ')); }
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
ok(!/const RELICS\b/.test(main) && !/\bRELICS\[/.test(main), 'main.js still has a RELICS table');
ok(!/P\.relic|pp\.relic|\.relic\s*===|PROP\.relic|t: 'relic'|case 'relic'/.test(main), 'main.js still reads or spawns a relic');
for (const f of readdirSync(new URL('../src/', import.meta.url)).filter(f => f.endsWith('.js') && f !== 'relics.js')) {
  const s = readFileSync(new URL('../src/' + f, import.meta.url), 'utf8');
  ok(!/\.relic\s*(===|!==)|breathCapacity\([^)]*,/.test(s), 'src/' + f + ' still reads a relic'); }

/* ---------------- B. no route needed one ---------------- */
const TRAVERSAL = { hanging: 'spurs', spire: 'sunshard (the abbot\'s beads)', storm: 'shoes', waymeet: 'spurs', mage: 'windcloak', moor: 'windcloak' };
for (const id of Object.keys(TRAVERSAL)) {
  const L = built(id), R = floodReach(L, T, { rides: true }), at = e => R.jumpNear(e.x, e.y);
  const must = L.ents.filter(e => e.t === 'gate' || e.t === 'check');
  const missed = must.filter(e => !at(e));
  if (id === 'moor') { ok(L.roosts && L.flight, 'moor: the wind levels this check cannot walk (flight, roosts) are not there to be walked elsewhere'); continue; }
  ok(!missed.length, id + ' (once held ' + TRAVERSAL[id] + '): the relic-free fill misses ' + missed.map(e => e.t + '@' + e.x + ',' + e.y).join(' ')); }

/* ---------------- C. every former spot pays silver or is gone ---------------- */
const SAME_CACHE = { stockade: [126, 24], scree: [335, 15], hanging: [68, 43] };     /* a silver already lies in the same cache */
const GONE = ['fair', 'theatre'];                                                       /* the glass (a silver beside it) and two boss drops */
const FORMER = [...Object.keys(VAULT_SILVER), ...Object.keys(SAME_CACHE), ...GONE];
ok(FORMER.length === 25 && new Set(FORMER).size === 25, 'the former-relic roster is ' + FORMER.length + ' levels, not 25');
const secrets = new Set(LEVELS.filter(l => l.secret).map(l => l.id));
for (const lv of LEVELS) { if (lv.hidden && !lv.secret) continue; const L = lv.build(), sv = L.ents.filter(e => e.t === 'silver');
  ok(sv.length <= 3, lv.id + ' holds ' + sv.length + ' silvers (the cap is 3)'); }
for (const [id, v] of Object.entries(VAULT_SILVER)) {
  const L = built(id), sv = L.ents.filter(e => e.t === 'silver');
  ok(sv.some(e => e.x === v.x && e.y === v.y), id + ': no silver lies where the relic did (' + v.x + ',' + v.y + ')');
  ok(sv[v.idx] && sv[v.idx].x === v.x && sv[v.idx].y === v.y, id + ': the vault silver is not silver #' + v.idx + ' (a save\'s bit 1<<' + v.idx + ' would point at another)');
  ok(sv.length === 3, id + ': ' + sv.length + ' silvers after the vault'); }
{ const sv = built('moor').ents.filter(e => e.t === 'silver'); ok(sv.length === 3 && sv[2].x === 416 && sv[2].y === 22, 'moor: the third silver is not #2 in the valley at 416,22: ' + JSON.stringify(sv)); }
for (const [id, [x, y]] of Object.entries(SAME_CACHE)) { const sv = built(id).ents.filter(e => e.t === 'silver'); ok(sv.some(e => Math.hypot(e.x - x, e.y - y) <= 15), id + ': no silver in the former relic cache at ' + x + ',' + y); }
{ const sv = built('fair').ents.filter(e => e.t === 'silver'); ok(sv.some(e => e.x === 600 && e.y === 34), 'fair: the back lot lost its silver'); }
/* a moved silver must still be reachable: the collection check (node tools/collectables.mjs) fails the suite on any pickup with no ground; here: not inside rock */
for (const id of Object.keys(VAULT_SILVER)) { const L = built(id), v = VAULT_SILVER[id], t = L.grid[v.y * L.W + v.x]; ok(t === T.AIR || t === T.NET || t === T.CLIMB || t === T.REED || (t !== T.SOLID && t !== T.CRATE && t !== T.PALISADE), id + ': the vault silver sits inside rock (' + t + ')'); }

/* ---------------- D. old saves ---------------- */
{ const levels = {}; for (const id of Object.keys(VAULT_SILVER)) levels[id] = { cleared: true, medal: 2, relic: 'fleece', silver: 0 };
  levels.stockade = { cleared: true, relic: 'gauntlet', silver: 3 }; levels.fair = { cleared: true, relic: 'handglass', silver: 7 }; levels.theatre = { relic: 'cutstring' };
  levels.wood.silver = 7;                                   /* all three held: nothing more to pay */
  levels.marsh.silver = 1;                                  /* idx 2 (bit 4) is the vault's: paid */
  levels.moor = { cleared: true, medal: 2, relic: 'windcloak', silver: 1 };
  const save = JSON.stringify({ hero: 'knight', heroes: { knight: true }, coins: 40, xp: { knight: 0 }, ...levels, items: {} });
  const ids = LEVELS.map(l => l.id);
  const out = migrateProgress(save, ids).progress;
  const dangling = Object.entries(out).filter(([k, v]) => v && typeof v === 'object' && !Array.isArray(v) && 'relic' in v).map(([k]) => k);
  ok(!dangling.length, 'a migrated save still carries a relic on ' + dangling.join(', '));
  ok(out.wood.silver === 7, 'wood: a save with all three silvers was changed (' + out.wood.silver + ')');
  ok(out.marsh.silver === (1 | (1 << VAULT_SILVER.marsh.idx)), 'marsh: the relic was not paid as its vault silver: ' + out.marsh.silver);
  ok(out.moor.silver === (1 | (1 << VAULT_SILVER.moor.idx)), 'moor: the added vault silver was not paid: ' + out.moor.silver);
  ok(out.stockade.silver === 3 && out.fair.silver === 7, 'a level whose relic spot is gone was paid (stockade ' + out.stockade.silver + ', fair ' + out.fair.silver + ')');
  ok(out.theatre.silver === undefined && !('relic' in out.theatre), 'theatre: a boss drop was paid or kept');
  for (const [id, v] of Object.entries(out)) if (v && typeof v === 'object' && 'silver' in v && typeof v.silver === 'number') ok((v.silver & ~7) === 0, id + ': a silver mask leaves the three bits (' + v.silver + ')');
  for (const id of Object.keys(VAULT_SILVER)) ok(out[id].medal === 2 && out[id].cleared === true, id + ': migration lost the level\'s medal or clear');
  const again = JSON.stringify(migrateProgress(JSON.stringify(out), ids).progress), first = JSON.stringify(out);
  ok(JSON.stringify(JSON.parse(again).marsh) === JSON.stringify(JSON.parse(first).marsh) && JSON.parse(again).moor.silver === out.moor.silver, 'migrating twice changed the save');
  /* the current-version path and a stale one both retire; a malformed entry does not crash */
  const cur = { progressionVersion: 2, wood: { relic: 'crown', silver: 0 }, odd: null, list: [1], num: 5, str: 'relic' };
  assert.doesNotThrow(() => retireRelics(cur)); ok(cur.wood.silver === 4 && !('relic' in cur.wood), 'retireRelics: wood paid ' + cur.wood.silver);
  ok(retireRelics({ wood: { relic: 'crown', silver: 4 } }) === 0, 'retireRelics paid a silver already held');
}

/* ---------------- E. the page ---------------- */
if (!process.argv.includes('--no-page')) {
  const { openPage } = await import('./cdp.mjs');
  const pg = await openPage({ audio: false, fonts: false });
  try {
    const r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const out={errs:[],lv:[]};
      const old={hero:'knight',heroes:{knight:true},coins:10,xp:{knight:0},wood:{cleared:true,medal:1,relic:'crown',silver:0},stockade:{cleared:true,relic:'gauntlet'},theatre:{cleared:true,relic:'cutstring'}};
      localStorage.clear();localStorage.setItem('bracken.progress.0',JSON.stringify(old));BK.loadSlot(0);const P=BKT.PROG;
      out.relicKeys=Object.keys(P).filter(k=>P[k]&&typeof P[k]==='object'&&'relic' in P[k]);out.woodSilver=P.wood.silver;out.stockadeSilver=P.stockade.silver||0;out.hasRELICS=('RELICS' in BK);
      out.avail=BK.silverAvail();
      for(const id of ${JSON.stringify([...new Set(FORMER)])}){const i=LEVELS.findIndex(l=>l.id===id);try{BK.setHero('knight');BK.reset({fresh:false});BK.load(i);BK.state='play';BK.sim(30);out.lv.push([id,BK.silvers().length,BK.props().filter(p=>p.t==='relic').length]);}catch(e){out.errs.push(id+': '+e.message);}}
      return out;})()`);
    ok(!r.relicKeys.length, 'the loaded save still has relic keys: ' + r.relicKeys);
    ok(r.woodSilver === (1 << VAULT_SILVER.wood.idx), 'the wood\'s vault silver was not paid on load: ' + r.woodSilver);
    ok(r.stockadeSilver === 0, 'the stockade (relic spot gone, silver already its own) was paid on load: ' + r.stockadeSilver);
    ok(r.hasRELICS === false, 'BK still exposes RELICS');
    ok(!r.errs.length, 'a former relic level did not load: ' + r.errs.join(' | '));
    ok(r.lv.every(([id, s, rel]) => s <= 3 && rel === 0), 'a level holds a relic prop or over three silvers in the page: ' + JSON.stringify(r.lv.filter(([id, s, rel]) => s > 3 || rel)));
    ok(!pg.errors.length, 'the page threw: ' + pg.errors.slice(0, 3).join(' | '));
  } finally { pg.close(); }
}

console.log(bad ? '\n' + bad + ' problem(s).' : '\nrelics: none exist, no route needed one, every former spot pays a silver (<= 3 a level) or is gone, and old saves migrate cleanly.');
process.exitCode = bad ? 1 : 0;
