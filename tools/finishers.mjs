// tools/finishers.mjs — THE BREAK AND THE FINISHER (the combat pass, part 2, 2026-09-28; src/poise-break.js, src/finishers.js).
//
// In the page, headless, on the Stockade's floor, the hero in god mode:
//   THE BREAK   every common foe the family table left without a stagger bar (POISE_EXTRA, POISE_EXTRA_HEAVY) and a handful that
//               always had one are set down beside the hero and struck with heavy blows of one point each (BK.combat2().strike).
//               Each must break within six, with the break's own beat (the flare, the stop, SFX.poiseBreak: OPEN.breaks counts it),
//               and stand open: broken for at least 1.5 s, no windup and no attack token while it is
//   THE FINISHER for each of the seven heroes: a sworn sword (too tough for one cut) is broken, the tell must be up (the stars
//               close in: finishReady) with the hero beside it, and ONE real press of the attack key must finish it - dead, with the
//               hero's own finisher counted and its name over it. The same press on an unbroken one must not
// A foe that cannot stand on a floor (the reef's jelly, the kraken's feeler, the merrow caller in its water) is named in NEEDS_WATER.
//   node tools/finishers.mjs
import assert from 'node:assert/strict';
import { POISE_EXTRA, POISE_EXTRA_HEAVY } from '../src/poise-break.js';
import { FINISH } from '../src/finishers.js';
import { openPage } from './cdp.mjs';

const NEEDS_WATER = new Set(['jelly', 'feeler', 'merrowcaller']);
const LYING = new Set(['corpse']);   /* the Unburied Field's fallen are set down LYING: any blow at all finishes one lying down (unburied-foes.js), so there is no bar to empty until it rises */
const BREAKERS = [...POISE_EXTRA, ...POISE_EXTRA_HEAVY].filter(t => !NEEDS_WATER.has(t) && !LYING.has(t)).concat(['sprig', 'brute', 'soldier', 'swornsword', 'hound', 'archer']);
const HEROES = Object.keys(FINISH);
const pg = await openPage({ audio: false, fonts: false });
let R;
try {
  await pg.reload();
  R = await pg.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js');
    if (!BK.combat2) return { err: 'no BK.combat2: nothing breaks a common foe on purpose, and nothing finishes one' };
    const C = BK.combat2(), out = { breaks: [], fin: [] };
    const setup = hero => { BK.PROG.hero = hero; BK.load(LEVELS.findIndex(l => l.id === 'stockade')); BK.start(); BK.god = true;
      const L = BK.L, W = L.W, at = (x, y) => L.grid[y * W + x]; let spot = null;
      for (let x0 = Math.floor(BK.P.x / 16); x0 < W - 30 && !spot; x0++) for (let y = 6; y < L.H - 2 && !spot; y++) {
        let ok = true; for (let x = x0; x < x0 + 20 && ok; x++) ok = at(x, y + 1) === 1 && [0, 1, 2, 3, 4, 5].every(k => at(x, y - k) === 0);
        if (ok) spot = [x0 + 10, y]; }
      for (const e of BK.enemies()) e.alive = false; BK.tp(spot[0], spot[1]); BK.sim(20); return spot; };
    let spot = setup('knight');
    for (const t of ${JSON.stringify(BREAKERS)}) {
      for (const e of BK.enemies()) e.alive = false; BK.tp(spot[0], spot[1]); BK.sim(10);
      const [f] = BK.spawnFoe({ t, x: spot[0] + 2, y: spot[1], face: -1 }); if (!f) { out.breaks.push({ t, err: 'did not spawn' }); continue; }
      BK.sim(2); const bar = C.poiseMax(f), b0 = C.OPEN.breaks; let n = 0, flare = false;
      for (; n < 6 && f.alive && !(f.broken > 0); n++) { f.poiseCd = 0; C.strike(f, 'heavy', 1); if (f.breakFlash > 0) flare = true; if (!(f.broken > 0)) BK.sim(20); }
      if (!(f.broken > 0)) { out.breaks.push({ t, bar, n, broken: false, alive: f.alive, hp: f.hp }); continue; }
      let open = 0, tell = 0, held = 0; const t0 = f.broken;
      while (f.alive && f.broken > 0 && open < 400) { BK.sim(1); open++; if (BK.stop > 0) continue; if (f.broken > 0 && BK.telling(f)) tell++; if (f.broken > 0 && f.tokHeld) held++; }   /* (not in a hit-stop: the world stands still in one, the token board with it) */
      out.breaks.push({ t, bar, n, broken: true, alive: f.alive, flare, beat: C.OPEN.breaks - b0, openS: +(open / 60).toFixed(2), t0: +t0.toFixed(2), tell, held });
    }
    for (const hero of ${JSON.stringify(HEROES)}) {
      spot = setup(hero); const P = BK.P;
      const one = broken => { for (const e of BK.enemies()) e.alive = false; BK.tp(spot[0], spot[1]); BK.sim(30);
        const [f] = BK.spawnFoe({ t: 'swornsword', x: spot[0] + 1, y: spot[1], face: -1 }); BK.sim(2);
        if (broken) for (let n = 0; n < 8 && !(f.broken > 0); n++) { f.poiseCd = 0; C.strike(f, 'heavy', 1); }
        P.x = f.x - 14; P.face = 1; P.vx = 0; P.atk = -1; const ready = C.finishReady(f), fin0 = C.FIN.byHero[hero] || 0, hp0 = f.hp;
        BK.press('atk'); let k = 0; for (; k < 45 && f.alive; k++) { BK.sim(1); if (k === 0 && BK.stop > 0) { } }
        const words = BK.textLab.nums().map(q => q.txt).filter(x => typeof x === 'string');
        return { broken: !!broken, ready, dead: !f.alive, hpLost: hp0 - Math.max(0, f.hp), fin: (C.FIN.byHero[hero] || 0) - fin0, words: words.slice(-4) }; };
      out.fin.push({ hero, open: one(true), plain: one(false) });
    }
    return out;
  })()`, 900000);
  assert.deepEqual(pg.errors, [], 'page errors');
} finally { pg.close(); }
const bad = [];
if (R.err) bad.push(R.err);
else {
  for (const b of R.breaks) {
    console.log(JSON.stringify(b));
    if (b.err) { bad.push(`${b.t}: ${b.err}`); continue; }
    if (!b.bar) bad.push(`${b.t}: carries no stagger bar - nothing can break it`);
    else if (!b.broken) bad.push(`${b.t}: six heavy blows did not break it (bar ${b.bar})`);
    else {
      if (!b.flare || b.beat < 1) bad.push(`${b.t}: broke with no beat (flare ${b.flare}, break beat counted ${b.beat})`);
      if (b.openS < 1.5) bad.push(`${b.t}: stood open only ${b.openS} s`);
      if (b.tell) bad.push(`${b.t}: wound up ${b.tell} frames while broken`);
      if (b.held) bad.push(`${b.t}: held an attack token ${b.held} frames while broken`);
    }
  }
  for (const f of R.fin) {
    console.log(JSON.stringify(f));
    const name = FINISH[f.hero].name;
    if (!f.open.ready) bad.push(`${f.hero}: beside a broken sworn sword the finisher's tell was not up`);
    if (!f.open.dead || f.open.fin !== 1) bad.push(`${f.hero}: one press on a broken sworn sword did not finish it (dead ${f.open.dead}, finishers ${f.open.fin})`);
    else if (!f.open.words.includes(name)) bad.push(`${f.hero}: finished it with no ${name} over it (${f.open.words.join(', ')})`);
    if (f.plain.ready) bad.push(`${f.hero}: the finisher's tell was up over an unbroken sworn sword`);
    if (f.plain.dead || f.plain.fin) bad.push(`${f.hero}: one press finished an UNBROKEN sworn sword`);
    if (!f.plain.hpLost && !f.plain.dead) bad.push(`${f.hero}: the plain press never reached the sworn sword (so the finisher test proves nothing)`);
  }
}
assert.deepEqual(bad, [], 'the break and the finisher:\n  ' + bad.join('\n  '));
console.log(`${R.breaks.length} common foes broken with a beat and stood open; each of ${R.fin.length} heroes finished a broken sworn sword with one press, and not an unbroken one` +
  ` (not tested on a floor, they need water: ${[...NEEDS_WATER].join(', ')}; lying down, any blow finishes it: ${[...LYING].join(', ')})`);
