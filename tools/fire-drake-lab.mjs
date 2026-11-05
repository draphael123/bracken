// tools/fire-drake-lab.mjs - THE FIRE DRAKE's NODE LAB (claude/heartplan). The drake is not wired into main.js yet (lane D1), so bossLab cannot see it;
// this is the first read a tune lane gets: the REAL src/fire-drake.js stepDrake + fdPlan (the human reaction clock, PLAN.react / miss) against a
// 1-D hero model per kit - reach, blow, swing time, health, flasks, a roll, an on-beat guard - in game seconds, in the Heart's 32-tile caldera.
// It is a MODEL (no poise, no skills, no stamina, no knock-back physics): read it as "is the shape right and is the band near", never as the number.
// The real number is bossLab after D1 (n=6 to start, add rows only near the band's edge - the credit rule).
//   node tools/fire-drake-lab.mjs [--n=12] [--miss=0.1] [--react=0.25] [--mash] [--hp=2600] [--tier=2.6] [--act=3.0] [--lv=40] [--flasks=3] [--hero=knight,warden] [--why]
// Late-game scaling copied from main.js: a boss's health x (1 + 0.25 x TIER_BOSS[level]) (spawn), its blows x the act's dmg (foe-react.js ACTS: desert 3.0);
// the hero at --lv from src/progression.js growthAt (health, +damage), three smith edges (+12).
import * as M from '../src/fire-drake.js';
import { growthAt } from '../src/progression.js';
import { mulberry } from '../src/px.js';
import { FLASK, flaskHeal } from '../src/survival.js';
const arg = (k, d) => { const a = process.argv.find(s => s.startsWith('--' + k + '=')); return a ? a.split('=')[1] : d; };
const N = +arg('n', 12), HP = +arg('hp', M.FD.hp), TIER = +arg('tier', 2.6), ACT = +arg('act', 3.0), LV = +arg('lv', 40), FLASKS = +arg('flasks', 3), WHY = process.argv.includes('--why'), MASH = process.argv.includes('--mash');
/* --miss / --react: the bot's misread share of a tell and its reaction (src/fire-drake.js PLAN: 0.1 / 0.25 s). A first-attempt human misreads more than 0.1 */
M.PLAN.miss = +arg('miss', M.PLAN.miss); M.PLAN.react = +arg('react', M.PLAN.react);   /* --mash: THE MASH BOT (Daniel 10-01) - walks in and swings, never guards, rolls or jumps: it must LOSE */
/* THE KITS (game seconds): base = the blow before growth (main.js swordDmg's table), k = its multiplier there, swing = seconds a blow, reach = LAB_REACH
   (src/lab.js; the ranger at her bow's stand), parry = an on-beat guard that turns the drake's yellow claw, dodge = a roll with i-frames */
const KITS = {
  knight:    { base: 10, k: 1.0,  swing: 0.40, reach: 22, parry: true,  dodge: true },
  warden:    { base: 11, k: 1.0,  swing: 0.45, reach: 40, parry: true,  dodge: true },
  pyro:      { base: 10, k: 0.7,  swing: 0.36, reach: 30, parry: true,  dodge: true },
  paladin:   { base: 14, k: 1.0,  swing: 0.52, reach: 20, parry: true,  dodge: true },
  pirate:    { base: 8,  k: 1.0,  swing: 0.28, reach: 20, parry: true,  dodge: true },
  reaper:    { base: 16, k: 0.95, swing: 0.46, reach: 29, parry: false, dodge: true },
  geomancer: { base: 23, k: 1.0,  swing: 0.60, reach: 24, parry: true,  dodge: true },
  berserker: { base: 12, k: 0.85, swing: 0.30, reach: 18, parry: true,  dodge: true },
  ranger:    { base: 10, k: 0.9,  swing: 0.55, reach: 64, parry: false, dodge: true },
};
const heroes = arg('hero', Object.keys(KITS).join(',')).split(',');
const TS = 16, A = { x0: 100 * TS, x1: 132 * TS, floor: 20 * TS }, G = M.geom(A, TS), DT = 1 / 60, LIMIT = 300;
const HB = { w: 5, h: 16 }, WALK = 85, JUMP_V = -260, GRAV = 700, ROLL = { t: 0.35, v: 90 }, IFR = 0.6;
function fight(h, seed) {
  const K = KITS[h], gr = growthAt(h, LV), blow = Math.round((K.base + 12 + gr.damage) * K.k);
  const rng = mulberry(seed); const R0 = Math.random; Math.random = rng;   /* the drake's picks share the seed (bossLab does the same) */
  try {
    const S = M.newFight(G), hp = Math.round(HP * (1 + 0.25 * TIER));
    const e = { x: G.seal, y: G.floorY, hp, maxHp: hp, mode: 'wake', modeT: 1.0, face: -1, alive: true, air: 0 };
    const P = { x: G.seal + 180, y: G.floorY, vy: 0, ground: true, face: -1, atk: -1, hp: gr.hp, maxHp: gr.hp, flasks: FLASKS, drink: 0, roll: 0, ifr: 0, swingCd: 0, block: 0 };
    const mem = {}, struck = new Set(), why = {}, by = {}; let t = 0, pushV = 0, dealt = 0, taken = 0;
    const w = { number() {}, sound() {}, shake() {}, music() {}, mark() {}, fx() {}, seal() {}, push: v => { pushV = v; },
      hit: (b, d, name, o = {}) => { if (struck.has(o.key)) return; const top = P.y - HB.h;
        if (!(P.x + HB.w > b[0] && P.x - HB.w < b[1] && P.y > b[2] && top < b[3])) return;
        if (P.ifr > 0 || P.roll > 0) return; struck.add(o.key);
        if (o.yellow && P.block > 0 && K.parry) return;   /* the claw is yellow: an on-beat guard turns it */
        const dmg = Math.round(d * ACT); P.hp -= dmg; taken += dmg; by[name] = (by[name] || 0) + dmg; P.ifr = IFR; P.drink = 0; if (o.push) P.x += Math.sign(o.push) * 14; } };
    for (; t < LIMIT; t += DT) {
      M.stepDrake(e, S, DT, [{ x: P.x, y: P.y, ground: P.ground, alive: P.hp > 0 }], w);
      if (S.done) return { win: true, t, hp: P.hp / P.maxHp, dealt, taken, why, by };
      if (P.hp <= 0) return { win: false, t, hp: 0, left: e.hp / e.maxHp, dealt, taken, why, by };
      P.ifr = Math.max(0, P.ifr - DT); P.swingCd -= DT; P.block = Math.max(0, P.block - DT);
      /* THE FLASK: under a third, nothing told at him and the drake not on him (a human's drink) */
      if (P.drink > 0) { P.drink -= DT; if (P.drink <= 0) { P.hp = Math.min(P.maxHp, P.hp + flaskHeal(P.maxHp)); } }
      else if (P.flasks > 0 && P.hp < P.maxHp * 0.35 && P.ground && !M.fdTelling(e) && Math.abs(e.x - P.x) > 70) { P.flasks--; P.drink = FLASK.drinkT; }
      const o = P.drink > 0 ? { gx: P.x } : MASH ? { gx: e.x + (P.x < e.x ? -1 : 1) * (M.FD.w / 2 + K.reach - 8), face: Math.sign(e.x - P.x) || 1, atk: true, why: 'mash' } : M.fdPlan({ P, e, S, reach: K.reach, t, mem, rng, dodge: K.dodge, parry: K.parry });
      if (WHY && o.why) { const k = o.why.replace(/ \(.*/, ''); why[k] = (why[k] || 0) + 1; }
      if (P.roll > 0) { P.roll -= DT; P.x += P.rollDir * ROLL.v * DT; }
      else if (P.drink <= 0) {
        if (o.dodge && P.ground) { P.roll = ROLL.t; P.rollDir = Math.sign(o.gx - P.x) || -P.face; }
        else if (o.gx != null) { const d = o.gx - P.x; if (Math.abs(d) > 2) { P.x += Math.sign(d) * Math.min(Math.abs(d), WALK * DT); P.face = Math.sign(d); } }
        if (o.face) P.face = o.face;
        if (o.jump && P.ground) { P.vy = JUMP_V; P.ground = false; }
        if (o.block) P.block = 0.2;
        if (o.atk && P.swingCd <= 0) { P.swingCd = K.swing; P.atk = 0;
          const reachOk = Math.abs(e.x - P.x) < K.reach + M.FD.w / 2 && (!M.fdAir(e) || K.reach >= 40);
          if (reachOk && e.mode !== 'sleep') { const [d] = M.takeBlow(e, S, blow); e.hp -= d; dealt += d; } } else if (P.swingCd < K.swing - 0.15) P.atk = -1; }
      P.x += pushV * DT; pushV = 0;
      if (!P.ground) { P.vy += GRAV * DT; P.y += P.vy * DT; if (P.y >= G.floorY) { P.y = G.floorY; P.vy = 0; P.ground = true; } }
      P.x = Math.max(G.x0 + 6, Math.min(G.x1 - 6, P.x));
    }
    return { win: false, t, hp: P.hp / P.maxHp, left: e.hp / e.maxHp, timeout: true, dealt, taken, why, by };
  } finally { Math.random = R0; }
}
const rows = []; let W = 0, Nn = 0;
for (const h of heroes) {
  const rs = []; for (let s = 0; s < N; s++) rs.push(fight(h, 7001 + s * 31));
  const wins = rs.filter(r => r.win), pct = Math.round(100 * wins.length / N); W += wins.length; Nn += N;
  const tw = wins.map(r => r.t).sort((a, b) => a - b), med = tw.length ? Math.round(tw[tw.length >> 1]) : '-';
  const left = rs.filter(r => !r.win).map(r => Math.round(100 * (r.left ?? 0)));
  rows.push(h.padEnd(10) + ' ' + String(pct).padStart(3) + '%  wins ' + wins.length + '/' + N + '  median ' + med + ' s  hp left ' + (wins.length ? Math.round(100 * wins.reduce((a, r) => a + r.hp, 0) / wins.length) : '-') + '%'
    + (left.length ? '  losses: drake at ' + left.join('/') + '%' : '') + (rs.some(r => r.timeout) ? '  (timeouts ' + rs.filter(r => r.timeout).length + ')' : ''));
  { const agg = {}, tot = rs.reduce((a, r) => a + r.taken, 0) || 1; for (const r of rs) for (const [k, v] of Object.entries(r.by)) agg[k] = (agg[k] || 0) + v; rows.push('   hurt by: ' + Object.entries(agg).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ' ' + Math.round(100 * v / tot) + '%').join(', ')); }
  if (WHY) { const agg = {}; for (const r of rs) for (const [k, v] of Object.entries(r.why)) agg[k] = (agg[k] || 0) + v; rows.push('   why: ' + Object.entries(agg).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => k + ' ' + v).join(', ')); }
}
console.log((MASH ? 'MASH BOT - ' : '') + 'THE FIRE DRAKE node lab - hp ' + HP + ' x tier ' + TIER + ', blows x act ' + ACT + ', hero L' + LV + ', ' + FLASKS + ' flasks, miss ' + M.PLAN.miss + ', react ' + M.PLAN.react + ' s, n=' + N);
for (const r of rows) console.log(r);
console.log('pooled ' + Math.round(100 * W / Nn) + '% (' + W + '/' + Nn + ') - a MODEL: the band is read in bossLab after D1');
