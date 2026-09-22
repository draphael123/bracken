// tools/desert-bosses.mjs — proves the desert arc's nine bosses and minis (src/desert-bosses.js) against the house rules, in Node.
// Two fighters, both reading every tell a quarter-second late (REACT) and answering it the way a player could:
//   THE BRAWLER only fights: walks up, swings, blocks '!' and gets out of 'X' (a planner that tries every run/jump it could still
//     make after the reaction delay: so "0 hits" means every attack has an answer a human can find in 0.25 s).
//   THE MAKER plays the level's rule (pours the skin, stands past the shelf, turns the wheel...) and fights in the openings.
// Checks per boss: A1 told attacks with house marks; A3 every attack fires; A5 never untouchable > 2 s; A6 a window after each;
// the phase; THE OPENING CAUSED (the maker opens it, the brawler doesn't); the brawler takes 0 hits; the maker wins faster.
// Plus a negative for each rule (the rule's input at the wrong moment opens nothing). Usage: node tools/desert-bosses.mjs [KEY]
import { makeBoss, bossStep, touchable, hurt, FLOOR, BOSSES } from '../src/desert-bosses.js';
const DT = 1 / 60, RUN = 92, JV = 320, G = 1000, REACT = 0.25, SW = { dmg: 10, every: 0.45, reach: 40 }, TMAX = 240;
let fails = 0; const ok = (c, m) => { console.log((c ? '  ok  ' : '  FAIL ') + m); if (!c) fails++; };

// ---- each arena's level-side world (what the room does on its own) and its hazards to the player ----
const rocFlood = t => { const c = t % 12.1; return { flood: c < 7.5 ? 'dry' : c < 9.9 ? 'horn' : 'flood', floodIn: c >= 7.5 && c < 9.9 ? 9.9 - c : null }; };
const wardenSand = t => { const c = t % 10; return c < 6 ? 0 : (c - 6) / 4; };
const ENV = {
  BANDIT_KING: { hazard: (B, x, h) => h < 8 && (B.data.fires || []).some(f => f.t > 0 && Math.abs(f.x - x) < 20) },
  ROC: { env: t => rocFlood(t), hazard: (B, x, h, t) => rocFlood(t).flood === 'flood' && x >= 276 && x <= 364 && h < 10 },
  SAND_WARDEN: { env: t => ({ sand: wardenSand(t), hiss: t % 10 >= 5 }), hazard: (B, x, h, t) => wardenSand(t) > 0.95 && x >= 476 && x <= 604 },   // you wade it; only the last of the fill buries you
};
const envOf = (key, t) => (ENV[key]?.env ? ENV[key].env(t) : {});
const hazardOf = (key, B, x, h, t) => !!(ENV[key]?.hazard && ENV[key].hazard(B, x, h, t));
const overlaps = (box, x, h) => x + 5 > box[0] && x - 5 < box[1] && FLOOR - h - 14 < box[3] && FLOOR - h > box[2];
const cloneB = B => ({ ...B, data: structuredClone(B.data), a: B.a && { ...B.a } });

// ---- the player body: run toward tx, one jump, block ----
function movePlayer(P, tx, jump, dt) {
  if (jump && P.h <= 0 && P.vy === 0) P.vy = JV;
  const dx = tx - P.x; P.x += Math.sign(dx) * Math.min(Math.abs(dx), RUN * dt); P.x = Math.max(8, Math.min(632, P.x));
  if (P.h > 0 || P.vy > 0) { P.h += P.vy * dt; P.vy -= G * dt; if (P.h <= 0) { P.h = 0; P.vy = 0; } }
}
// ---- THE PLANNER: after the reaction delay, the nearest run (and, if it must, a jump) that the attack's hits and the room miss ----
function plan(key, B, P, t) {
  const tries = [];
  for (let dx = 0; dx <= 640; dx += 8) for (const s of dx ? [-1, 1] : [1]) { const x = P.x + s * dx; if (x >= 8 && x <= 632) tries.push({ tx: x, jumpAt: null }); }
  const jumps = []; for (const tx of [P.x, P.x - 24, P.x + 24, P.x - 60, P.x + 60]) for (let j = 0; j <= 2.0; j += 0.05) jumps.push({ tx, jumpAt: t + j });
  for (const pl of [...tries, ...jumps]) if (safe(key, B, P, t, pl)) return pl;
  return { tx: P.x, jumpAt: null, none: true };
}
function safe(key, B0, P0, t0, pl) {                    // the same order as the fight: the player moves, then the boss steps
  const B = cloneB(B0), P = { ...P0 }; let t = t0;
  for (let k = 0; k < 240; k++) {
    movePlayer(P, pl.tx, pl.jumpAt !== null && t >= pl.jumpAt, DT); t += DT;
    const w = { px: P.x, trail: [P.x], ...envOf(key, t) };
    for (const ev of bossStep(B, w, DT)) if (ev.t === 'hit' && ev.box && overlaps(ev.box, P.x, P.h) && !(ev.blockable && P.h <= 0)) return false;
    if (hazardOf(key, B, P.x, P.h, t)) return false;
    if (B.mode !== 'tell' && B.mode !== 'act') { for (let q = 0; q < 30; q++) { movePlayer(P, pl.tx, false, DT); if (hazardOf(key, B, P.x, P.h, t + q * DT)) return false; } return true; }
  }
  return true;
}

// where to stand: the wanted spot, or the nearest one either side that isn't burning / flooding / filling now or in 1.2 s
function stand(key, B, P, t, want, brave) {
  const bad = x => x < 10 || x > 630 || [0, .1, .2, .3, .4, .5, .6, .7, .8, .9, 1, 1.1, 1.2].some(d => (d === 0 || !brave) && hazardOf(key, B, x, 0, t + d));
  if (!bad(want)) return want;
  for (let d = 4; d < 640; d += 4) for (const x of [want - d, want + d]) if (!bad(x)) return x;
  return want;
}
// ---- THE MAKERS: what a player who has learned the room's rule does between attacks ----
const side = (B, P) => Math.sign(P.x - B.x) || 1;
const beyond = (B, sx, d) => sx + (Math.sign(sx - B.x) || 1) * d;                  // past a thing, on the far side from the boss
const MAKER = {
  BANDIT_KING: (B, P, M, t) => {
    if (B.data.burning > 0) return { tx: B.x + side(B, P) * 26, pour: Math.abs(P.x - B.x) < 44 && t > (M.pourAt || 0) && ((M.pourAt = t + 5), true) };
    const f = (B.data.fires || []).find(f => f.t > 1.5 && Math.sign(f.x - B.x) === Math.sign(P.x - f.x)); if (f) return { tx: beyond(B, f.x, 44), hold: true };
  },
  ROC: (B, P, M, t, w) => { if (w.flood === 'horn' && w.floodIn > 0.9) return { tx: 300, hold: true, brave: true }; },
  COLOSSUS: (B, P) => { if (B.phase === 2) return; const s = [...B.def.shelves].sort((a, b) => Math.abs(a - P.x) - Math.abs(b - P.x))[0]; const x = beyond(B, s, 36); if (Math.abs(x - B.x) >= 56) return { tx: x, hold: true }; },
  HIGH_PRIEST: (B, P, M, t) => { const hour = Math.floor(t / 10);
    if (M.set !== hour) { if (Math.abs(P.x - 370) < 10) { M.at = (M.at || 0) + DT; if (M.at > 0.8) { M.set = hour; M.at = 0; } } return { tx: 370, hold: true }; }
    return { tx: B.x > 330 ? 270 : 370, hold: true, mirrorOk: true }; },
  HOURGLASS_KING: (B, P, M) => { const s = B.data.sand ?? 12; if (s < 4.5) return { tx: 600, hold: true, wheel: Math.abs(P.x - 600) < 12 && s < 2.4 }; },
  SCARAB_MOTHER: (B, P, M) => {
    const T = B.def.traps, busy = B.a?.name === 'charge' && (B.mode === 'tell' || B.mode === 'act');
    if (!M.trap) M.trap = P.x < 320 ? T[0] : T[1];                                 // her room's edge: wait by one plate, fight her there
    const trap = M.trap, wait = trap.plate + (trap.plate < 320 ? 16 : -16);
    if (busy && B.mode === 'tell' && B.t > (B.def.attacks.charge.tell - DT * 1.5)) M.ready = Math.abs(P.x - wait) < 10;   // in place when she told it?
    if (busy && !M.ready) return;                                                     // no: just get out of the way (the planner)
    if (B.mode === 'act' && B.a?.name === 'charge') { const nx = B.x + B.data.dir * 300 * 0.1; if (nx >= trap.zone[0] && nx <= trap.zone[1]) return { tx: trap.plate, hold: true, script: true };
      return { tx: P.x, hold: true, script: true, jump: Math.abs(B.x - P.x) < 80 }; }
    if (B.mode === 'tell' && B.a?.name === 'charge') return { tx: P.x, hold: true, script: true };
    return { tx: wait };
  },
  STALKER: (B, P) => { const o = B.def.overhangs.map(([a, b]) => (a + b) / 2).sort((a, b) => Math.abs(a - P.x) - Math.abs(b - P.x))[0]; return { tx: o, hold: true }; },
  SAND_WARDEN: (B, P, M, t) => { const c = t % 10; if (c > 3 && c < 6.9) return { tx: B.x < 540 ? 516 : 564, hold: true }; },   // wait just inside, ahead of the sand: its lunge carries it in
  EMBALMER: (B, P) => { const s = [...B.def.shelves].sort((a, b) => Math.abs(a - P.x) - Math.abs(b - P.x))[0]; const x = beyond(B, s, 36); if (Math.abs(x - B.x) >= 44) return { tx: x, hold: true }; },
};

// ---- one fight ----
const TRACE = process.argv[2] === '--trace';
function fight(key, who, startX) {
  const def = BOSSES[key], B = makeBoss(def, startX), P = { x: startX < 320 ? 560 : 80, h: 0, vy: 0 }, M = {};
  const S = { key, who, told: {}, fired: {}, marks: new Set(), hits: 0, blocked: 0, opens: 0, phase2: false, hid: 0, hidMax: 0, windows: [], won: false, t: 0, noAnswer: 0 };
  let t = 0, swingCd = 0, pl = null, answering = null, trail = [], plateWas = null, hidEnd = null, inv = 0;
  while (t < TMAX && B.hp > 0) {
    trail.push(P.x); if (trail.length > 120) trail.shift();
    const w = { px: P.x, trail: [trail[0]], ...envOf(key, t) }, m = who === 'maker' && B.mode !== 'open' ? MAKER[key](B, P, M, t, w) : null;
    for (const k of ['pour', 'wheel', 'mirrorOk']) if (m?.[k]) w[k] = true;
    const onPlate = def.traps?.find(tr => Math.abs(P.x - tr.plate) < 8 && P.h <= 0); if (onPlate && plateWas !== onPlate.plate) w.plate = onPlate.plate; plateWas = onPlate ? onPlate.plate : null;
    const evs = bossStep(B, w, DT); if (TRACE) for (const ev of evs.filter(e => e.t !== 'fire')) console.log(t.toFixed(2), ev.t, ev.what || '', ev.mark || '', ev.box ? ev.box.map(Math.round).join(',') : '', ev.x ?? '', '| P', P.x.toFixed(0), P.h.toFixed(0), 'B', B.x.toFixed(0), B.mode, JSON.stringify(w).slice(0, 80));
    for (const ev of evs) {
      if (ev.t === 'tell') { S.told[ev.what] = (S.told[ev.what] || 0) + 1; S.marks.add(ev.mark); answering = { at: t + REACT, mark: ev.mark }; pl = null; }
      if (ev.t === 'act') S.fired[ev.what] = (S.fired[ev.what] || 0) + 1;
      if (ev.t === 'open') S.opens++;
      if (ev.t === 'phase2') S.phase2 = true;
      if (ev.t === 'hit' && ev.box && overlaps(ev.box, P.x, P.h) && inv <= 0) { if (ev.blockable && P.h <= 0 && answering && t >= answering.at) S.blocked++; else { S.hits++; inv = 0.8; if (TRACE) console.log('   HIT', ev.what, 'P', P.x.toFixed(0), P.h.toFixed(0)); } }
    }
    if (hazardOf(key, B, P.x, P.h, t) && inv <= 0) { S.hits++; inv = 0.8; S.hazard = (S.hazard || 0) + 1; if (TRACE) console.log(t.toFixed(2), '   ROOM HIT P', P.x.toFixed(0), P.h.toFixed(0), 'B', B.x.toFixed(0), B.mode); }
    // A5/A6: untouchable streaks, and the touchable window after each
    if (!touchable(B)) { S.hid += DT; S.hidMax = Math.max(S.hidMax, S.hid); if (hidEnd) { S.windows.push(t - hidEnd); hidEnd = null; } } else if (S.hid > 0) { S.hid = 0; hidEnd = t; }
    if (hidEnd && t - hidEnd > 1.0) { S.windows.push(t - hidEnd); hidEnd = null; }
    // decide
    const busy = B.mode === 'tell' || B.mode === 'act';
    if (!busy) { answering = null; pl = null; }
    let tx, jump = false, block = false;
    if (m?.script) { tx = m.tx; jump = !!m.jump; }
    else if (answering && t >= answering.at && answering.mark === 'X') { if (!pl) { pl = plan(key, B, P, t); if (pl.none) S.noAnswer++; } tx = pl.tx; jump = pl.jumpAt !== null && t >= pl.jumpAt; }
    else if (answering && t >= answering.at && answering.mark === '!') { tx = stand(key, B, P, t, P.x); block = Math.abs(tx - P.x) < 1; }
    else if (m && !(B.mode === 'open')) tx = stand(key, B, P, t, m.tx, m.brave);
    else tx = stand(key, B, P, t, B.x + side(B, P) * 26);
    if (!pl && !m?.script && !jump && P.h <= 0 && Math.abs(tx - P.x) > 2 && hazardOf(key, B, P.x + Math.sign(tx - P.x) * 14, 0, t) && !hazardOf(key, B, P.x + Math.sign(tx - P.x) * 58, 0, t + 0.64)) jump = true;   // hop what burns
    movePlayer(P, tx, jump, DT);
    swingCd -= DT; inv -= DT;
    if (!block && P.h <= 0 && swingCd <= 0 && Math.abs(P.x - B.x) < SW.reach && touchable(B)) { hurt(B, SW.dmg); swingCd = SW.every; }
    t += DT;
  }
  S.t = t; S.won = B.hp <= 0; return S;
}
// ---- the rules' negatives: the input at the wrong moment opens nothing ----
function negatives(key) {
  const def = BOSSES[key], B = makeBoss(def, 320), w = { px: 100, trail: [100] }, step = extra => bossStep(B, { ...w, ...extra }, DT).some(e => e.t === 'open');
  switch (key) {
    case 'BANDIT_KING': return [['a pour at him while he is not burning', !step({ pour: true, px: B.x + 20 })]];
    case 'ROC': { B.data.landed = 320; const a = !step({ flood: 'dry' }); B.data.landed = 100; const b = !step({ flood: 'flood' }); B.data.landed = 320; B.openCd = 0; const c = step({ flood: 'flood' });
      return [['a dive into the dry channel', a], ['a dive out of the channel in the torrent', b], ['(and one into the channel in the torrent does)', c]]; }
    case 'HIGH_PRIEST': { B.x = 100; const a = !step({ mirrorOk: true }); B.x = 320; B.data.snuffed = 3; const b = !step({ mirrorOk: true }); B.data.snuffed = 0; const c = !step({ mirrorOk: false });
      return [['the mirror set with him out of the strip', a], ['the mirror set while the window is snuffed', b], ['him in the strip, the mirror unset', c]]; }
    case 'HOURGLASS_KING': { B.data.sand = 8; return [['the wheel turned with 8 s left in his glass', !step({ wheel: true })]]; }
    case 'SCARAB_MOTHER': { B.x = 320; return [['a plate trodden with her out of its reach', !step({ plate: 40 }) && !step({ plate: 600 })]]; }
    case 'SAND_WARDEN': { B.x = 540; const a = !step({ sand: 0.1 }); B.x = 150; const b = !step({ sand: 0.9 }); return [['it in the room before the sand rises', a], ['the room full with it outside', b]]; }
    case 'COLOSSUS': case 'EMBALMER': { const X = makeBoss(def, 100), shelves = def.shelves; X.face = 1; const name = key === 'COLOSSUS' ? 'lance' : 'hook', a = def.attacks[name];
      X.data[key === 'COLOSSUS' ? 'lx' : 'hx'] = shelves[0] - 40; a.hit(X, w); const r = X.data.reflect || X.data.broke; return [[`the ${name} at you short of the shelf strikes you, not the glass`, !r]]; }
    case 'STALKER': { const X = makeBoss(def, 100); X.data.mark = 120; def.attacks.sting.hit(X, w); return [['a sting at you out in the open does not stick', !X.data.stuck]]; }
  }
  return [];
}

if (TRACE) { const S = fight(process.argv[3], process.argv[4], +process.argv[5]); console.log(JSON.stringify({ ...S, marks: undefined, windows: undefined })); process.exit(0); }
const keys = process.argv[2] ? [process.argv[2]] : Object.keys(BOSSES), STARTS = [120, 200, 280, 360, 440, 520, 600];
for (const key of keys) {
  const def = BOSSES[key], atk = Object.keys(def.attacks), used = new Set([...def.chain, ...(def.chain2 || [])]), mini = !def.phase2;
  console.log(`\n${def.name}  (${mini ? 'mini' : 'boss'}, hp ${def.hp})`);
  ok(atk.length >= (mini ? 3 : 4) && atk.every(n => used.has(n)), `A1: ${atk.length} attacks, all in its chain (${atk.join(', ')})`);
  ok(atk.every(n => def.attacks[n].tell >= 0.45 && ['!', 'X'].includes(def.attacks[n].mark)), `A1: every attack told >= 0.45 s with a house mark (${atk.map(n => n + def.attacks[n].mark).join(' ')})`);
  ok(def.chain[0] === atk[0] || def.attacks[def.chain[0]].mark, `signature first: ${def.chain[0]}`);
  const R = { brawler: STARTS.map(x => fight(key, 'brawler', x)), maker: STARTS.map(x => fight(key, 'maker', x)) };
  const all = [...R.brawler, ...R.maker], sum = (rs, f) => rs.reduce((a, r) => a + f(r), 0), med = rs => rs.map(r => r.won ? r.t : TMAX).sort((a, b) => a - b)[rs.length >> 1], allWon = rs => rs.every(r => r.won);
  ok(atk.every(n => R.maker.some(r => r.fired[n]) || R.brawler.some(r => r.fired[n])), `A3: every attack fired (${atk.map(n => n + ' ' + (sum(all, r => r.fired[n] || 0))).join(', ')})`);
  const hidMax = Math.max(...all.map(r => r.hidMax)), win = Math.min(...all.flatMap(r => r.windows));
  ok(hidMax <= 2.0, `A5: never untouchable over 2 s (longest ${hidMax.toFixed(2)} s)`);
  ok(!isFinite(win) || win >= 0.8, `A6: a touchable window after every untouchable stretch (shortest ${isFinite(win) ? win.toFixed(2) + ' s' : 'none needed'})`);
  if (!mini) ok(R.maker.every(r => r.phase2) && R.brawler.filter(r => r.won).every(r => r.phase2), `phase 2 at ${def.phase2 * 100}% reached in every won fight`);
  const mo = sum(R.maker, r => r.opens), bo = sum(R.brawler, r => r.opens);
  const mt = sum(R.maker, r => r.t) / 60, bt = sum(R.brawler, r => r.t) / 60;
  ok(mo >= 2 * STARTS.length && bo / bt * 3 <= mo / mt, `THE OPENING CAUSED: the maker opened it ${mo} times in ${STARTS.length} fights (${(mo / mt).toFixed(1)} a minute), the brawler ${bo} (${(bo / bt).toFixed(1)} a minute: by chance, standing where the rule is)`);
  const bh = sum(R.brawler, r => r.hits), na = sum(R.brawler, r => r.noAnswer);
  ok(bh === 0, `every attack answerable in ${REACT} s: the brawler took ${bh} hits in ${STARTS.length} fights (${sum(R.brawler, r => r.blocked)} blocked, ${na} tells with no answer)`);
  const mh = sum(R.maker, r => r.hits);
  ok(mh <= STARTS.length, `the maker, working the rule, takes at most a hit a fight (${mh} in ${STARTS.length}${sum(R.maker, r => r.hazard || 0) ? ', ' + sum(R.maker, r => r.hazard || 0) + ' from the room' : ''})`);
  ok(R.maker.every(r => r.won) && med(R.maker) < med(R.brawler), `the rule wins faster: maker ${med(R.maker).toFixed(0)} s (${allWon(R.maker) ? 'all won' : 'NOT all won'}), brawler ${med(R.brawler) >= TMAX ? 'timed out' : med(R.brawler).toFixed(0) + ' s'} (median)`);
  for (const [what, c] of negatives(key)) ok(c, `the rule, negative: ${what}`);
}
console.log(fails ? `\n${fails} FAILED` : '\nall desert boss checks pass'); process.exit(fails ? 1 : 0);
