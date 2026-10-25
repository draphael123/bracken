// src/shriek-sisters.js - THE SHRIEK SISTERS, THE ROOKERY's boss (claude/rookery, the OPUS GREYBOX, 2026-10-25; brief scratch/brief-rookery-1024.md, Daniel's pick).
// THREE HARPIES AS A TEAM on the summit of the rookery, under the Roc's peak - her daughters. This file is the fight, PURE (each sister's moves, how the team changes when
// one falls, the summit's cracked slabs and the stones the snatcher drops, what a blow does to each, and the bot's plan); src/shriek-sisters-hands.js binds it to the
// world (main.js) and draws them. tools/rookery.mjs checks it.
// HEADER (design-standard B1 / B11 / B14 / B15 / B17): A PUZZLE TEAM WITH THE LEVEL'S RULE AS ITS OPENING. No sister is ever invulnerable:
//   ON THE WING a blow lands at SS.wing (0.4, the B15 floor; told: ON THE WING). LOW (skidded in, swooping, on her perch, screaming low) a blow lands whole. FROM ABOVE
//   (a plunge) whole. KNOCKED DOWN (her dive taken on a shield) x SS.downK.
//   THE LEVEL'S RULE IS THE OPENING (B1): "A HARPY'S DIVE BREAKS WHAT IT HITS". The summit has THREE CRACKED SLABS (and every rock the snatcher drops lies as a CRACKED
//     STONE for a while). A dive that comes down on cracked rock BREAKS IT and she lies STUNNED IN THE RUBBLE (the shared OPEN read, B10: gold ring + timer) - x SS.stun.mul,
//     up to SS.stun.cap of her - then she tears free behind a told WARD (B3: SS.ward s, a pale ring, WARDED). The slab is rubble for SS.slab.regrow s. So: STAND ON THE
//     CRACK, let her aim (the red line LOCKS before she drops), STEP OFF.
//   THE SISTERS (each her own bar segment; the bar is the three):
//     THE DIVER    hangs over you and DIVES (her red aim line, it locks SS.dive.lock s before she drops) - at YOU, or at the shrieker's MARK
//     THE SHRIEKER hangs highest and SCREAMS (rings, red !!): a red ring snaps onto your spot - THE MARK - and her sisters strike it (the diver dives at it, the snatcher drops
//                  her rock on it). Then she SWOOPS low on your side (whole).
//     THE SNATCHER perches on a shelf to pick up a ROCK (whole), carries it over you and DROPS it (a red ring where it will land, SS.rock.tell s): it lies there as a CRACKED STONE
//   TAKE ONE OUT AND THE OTHERS CHANGE (the phases are the deaths; ONE NEW MOVE each, B5):
//     the DIVER falls      -> the other two DIVE in her place (the shrieker at her own mark, the snatcher after each drop) - the opening never goes
//     the SHRIEKER falls   -> the diver's dives come in PAIRS (a second, quicker one off the floor); the snatcher drops TWO rocks a carry
//     the SNATCHER falls   -> the slabs crack again faster; the shrieker gains THE SHRIEK WAVE (a told yellow ! cone along the floor from her swoop: jump it or block)
//     after the first fall, a sister left with the snatcher's talons gains THE SNATCH (a low red !! sweep across the summit at your height: jump it or roll)
//     the LAST SISTER is frantic: every cooldown x SS.last
//   NO ADDS (the three are the fight). Every move TOLD with its own windup and release pose (B16, src/shriek-sisters-hands.js POSE) and its own sound.
export const SS = {
  hp: { diver: 920, shrieker: 690, snatcher: 800 },
  wing: 0.4, downK: 1.5, wardMul: 0.4, last: 0.8,
  hover: { diver: 112, shrieker: 150, snatcher: 104 },
  dive: { tell: [0.85, 0.75, 0.7], lock: 0.24, markTell: 0.62, v: 430, dmg: 22, land: 0.7, rise: 0.8, cd: [2.4, 2.1, 1.8], second: 0.55, downed: 1.3 },
  stun: { t: 2.6, mul: 2, cap: 0.24 },
  ward: 2.5,
  slab: { w: 48, regrow: [9, 9, 6.5] },
  scream: { tell: 0.95, cd: [4.6, 4.0, 3.4], mark: 1.6, swoop: 1.9, low: 34 },
  wave: { tell: 0.8, v: 230, h: 26, dmg: 18, life: 1.8 },
  rock: { tell: 0.75, fall: 0.45, r: 18, dmg: 21, life: 11, pick: 1.0, carry: 2.2 },
  snatch: { tell: 0.8, v: 320, h: 16, dmg: 22, cd: 6.5 },
  sister: { w: 26, h: 18 },
};
export const ROLES = ['diver', 'shrieker', 'snatcher'];
export const NAME = { diver: 'THE DIVER', shrieker: 'THE SHRIEKER', snatcher: 'THE SNATCHER' };
export const SS_SAY = { wake: 'THE SHRIEK SISTERS', rule: 'STAND ON A CRACK. WHEN HER LINE LOCKS, STEP OFF: SHE BREAKS IT AND LIES STUNNED.', stunned: 'STUNNED IN THE RUBBLE', ward: 'SHE TEARS FREE',
  wing: 'ON THE WING', warded: 'WARDED', mark: 'SHE MARKS YOU', rock: 'A ROCK: OFF THE RED RING', stone: 'IT LIES CRACKED', diverFell: 'THE DIVER FALLS: HER SISTERS DIVE',
  shriekerFell: 'THE SHRIEKER FALLS: THE DIVES COME IN PAIRS', snatcherFell: 'THE SNATCHER FALLS: THE CRAG CRACKS FASTER', last: 'THE LAST SISTER', snatch: 'THE SNATCH: JUMP IT',
  wave: 'THE SHRIEK WAVE: JUMP IT OR BLOCK', skid: 'SHE SKIDS ON THE ROCK', downed: 'KNOCKED DOWN' };
export const OPEN_NAME = { stuck: 'STUNNED', downed: 'DOWN' };
const WING_MODES = new Set(['hover', 'diveTell', 'rise', 'screamTell', 'scream', 'carry', 'dropTell', 'drop', 'fly', 'snatchTell', 'wake', 'sleep']);
const LOW_MODES = new Set(['land', 'swoop', 'pick', 'waveTell', 'wave', 'snatch']);
export const sisOpen = s => !!s && s.alive && (s.mode === 'stuck' || s.mode === 'downed');
export const ssOpen = S => !!S && ROLES.some(r => sisOpen(S.sis[r]));
const TELLS = new Set(['diveTell', 'screamTell', 'dropTell', 'snatchTell', 'waveTell']);
export const sisTelling = s => !!s && TELLS.has(s.mode);
/* THE SUMMIT (px): x0/x1 inside the walls, floorY, the three slabs (tile columns of their middles), the two shelves (the snatcher's perches) */
export function geom(A, TS = 16) {
  const fl = A.floor, slabs = (A.slabs || []).map((c, i) => ({ id: i, x: c * TS + 8, st: 'crack', t: 0 }));
  return { x0: A.x0, x1: A.x1, floorY: fl, mid: (A.x0 + A.x1) / 2, slabs, perch: [A.x0 + 5 * TS, A.x1 - 5 * TS], perchY: fl - 3 * TS, TS };
}
export function newFight(G) {
  const sis = {}; for (const r of ROLES) sis[r] = { role: r, hp: SS.hp[r], maxHp: SS.hp[r], alive: true, x: G.mid + (r === 'diver' ? -60 : r === 'snatcher' ? 70 : 0), y: G.floorY - SS.hover[r], face: -1, mode: 'sleep', modeT: 0, ward: 0, cd: r === 'diver' ? 1.2 : r === 'shrieker' ? 2.6 : 0.6, purse: 0, rocks: 0, side: r === 'snatcher' ? 1 : -1, act: 0 };
  return { G, sis, ph: 1, dead: {}, marks: [], rocks: [], stones: [], waves: [], told: {}, act: 0, snatchCd: SS.snatch.cd,
    n: { dives: 0, stuns: 0, skids: 0, downs: 0, screams: 0, marksStruck: 0, drops: 0, stones: 0, snatches: 0, waves: 0, wardHits: 0, wingHits: 0, lowHits: 0, openHits: 0, fell: [] } };
}
const alive = S => ROLES.filter(r => S.sis[r].alive);
const ph = S => Math.min(2, 3 - alive(S).length);   /* 0, 1, 2: the deaths */
const cdK = S => alive(S).length === 1 ? SS.last : 1;
/* the cracked rock under x on the floor: a slab ('crack') or a stone */
export function crackAt(S, x) {
  for (const s of S.G.slabs) if (s.st === 'crack' && Math.abs(x - s.x) < SS.slab.w / 2 + 4) return { kind: 'slab', s };
  for (const q of S.stones) if (Math.abs(x - q.x) < 14) return { kind: 'stone', s: q };
  return null;
}
export const cracks = S => [...S.G.slabs.filter(s => s.st === 'crack').map(s => ({ x: s.x, w: SS.slab.w, slab: s })), ...S.stones.map(q => ({ x: q.x, w: 24, stone: q }))];
const diverRoles = S => ROLES.filter(r => S.sis[r].alive && (r === 'diver' || S.dead.diver));
/* ---------- ONE FRAME OF THE TEAM. heroes: [{ x, y, ground, alive, pp }]; w: the world (src/shriek-sisters-hands.js world()) ---------- */
export function stepSisters(S, dt, heroes, w) {
  const G = S.G, P = heroes.find(h => h.alive) || heroes[0];
  for (const sl of G.slabs) if (sl.st === 'rubble') { sl.t -= dt; if (sl.t <= 0) { sl.st = 'crack'; w.sound('crack'); } }
  for (const q of S.stones) q.t -= dt; S.stones = S.stones.filter(q => q.t > 0);
  for (const m of S.marks) m.t -= dt; S.marks = S.marks.filter(m => m.t > 0);
  stepRocks(S, dt, heroes, w); stepWaves(S, dt, heroes, w);
  for (const r of ROLES) { const s = S.sis[r]; if (!s.alive) continue; s.ward = Math.max(0, s.ward - dt); if (s.mode === 'sleep') continue; s.modeT -= dt; s.cd -= dt;
    if (r === 'diver') stepDiver(S, s, dt, P, w); else if (r === 'shrieker') stepShrieker(S, s, dt, P, w); else stepSnatcher(S, s, dt, P, w); }
  S.snatchCd -= dt;
}
const fly = (s, tx, ty, dt, k = 3) => { s.x += (tx - s.x) * Math.min(1, dt * k); s.y += (ty - s.y) * Math.min(1, dt * k); };
const clampX = (S, x) => Math.max(S.G.x0 + 16, Math.min(S.G.x1 - 16, x));
/* A DIVE: aim (the red line follows you, then LOCKS), then straight down the line; what it meets breaks */
function aimAt(S, s, P, w, mark) {
  s.mode = 'diveTell'; s.modeT = mark ? SS.dive.markTell : SS.dive.tell[ph(S)]; s.openT0 = s.modeT; s.aim = mark ? { x: mark.x, y: S.G.floorY, lock: true, mark: true } : { x: P ? P.x : s.x, y: S.G.floorY, lock: false };
  s.act = ++S.act; w.mark(s, '!!'); w.sound('screech');
}
function stepDive(S, s, dt, P, w) {
  if (s.mode === 'diveTell') { if (!s.aim.lock) { if (P) s.aim.x = clampX(S, P.x); if (s.modeT <= SS.dive.lock) { s.aim.lock = true; w.sound('lock'); } }
    s.face = Math.sign(s.aim.x - s.x) || s.face; s.y += (S.G.floorY - SS.hover[s.role] - 14 - s.y) * Math.min(1, dt * 2);
    if (s.modeT <= 0) { s.mode = 'dive'; const d = Math.hypot(s.aim.x - s.x, S.G.floorY - 10 - s.y) || 1; s.dv = { fx: s.x, fy: s.y, tx: s.aim.x, ty: S.G.floorY - 4, t: 0, T: Math.max(0.15, d / SS.dive.v) }; s.hitKey = 'dv' + s.act; S.n.dives++; w.sound('dive'); }
    return true; }
  if (s.mode === 'dive') { const v = s.dv; v.t += dt; const k = Math.min(1, v.t / v.T); s.x = v.fx + (v.tx - v.fx) * k; s.y = v.fy + (v.ty - v.fy) * k;
    const res = w.hit(s, [s.x - 11, s.x + 11, s.y - 16, s.y + 2], SS.dive.dmg, 'dive', { key: s.hitKey, blockable: true });
    if (res === 'blocked') { s.mode = 'downed'; s.modeT = SS.dive.downed; s.openT0 = s.modeT; s.y = S.G.floorY; S.n.downs++; w.number(s.x, s.y - 30, SS_SAY.downed, '#8fd160'); return true; }
    if (k >= 1) { const c = crackAt(S, v.tx); s.y = S.G.floorY;
      if (c) { if (c.kind === 'slab') { c.s.st = 'rubble'; c.s.t = SS.slab.regrow[S.dead.snatcher ? 2 : 0]; } else c.s.t = 0;
        s.mode = 'stuck'; s.modeT = SS.stun.t; s.openT0 = s.modeT; s.purse = s.maxHp * SS.stun.cap; S.n.stuns++; if (s.aim && s.aim.mark) S.n.marksStruck++;
        w.shake(6); w.sound('smash'); w.fx('open', s.x, s.y); w.rubble(v.tx); w.number(s.x, s.y - 34, SS_SAY.stunned, '#ffd36b'); }
      else { s.mode = 'land'; s.modeT = SS.dive.land; S.n.skids++; w.dust(s.x, S.G.floorY, 8); w.sound('skid'); if (!S.told.skid) { S.told.skid = 1; w.number(s.x, s.y - 30, SS_SAY.skid, '#c8d8e8'); } } }
    return true; }
  if (s.mode === 'stuck') { if (s.modeT <= 0) { s.mode = 'tear'; s.modeT = 0.45; w.sound('screech'); } return true; }
  if (s.mode === 'tear') { if (s.modeT <= 0) { s.ward = SS.ward; s.mode = 'rise'; s.modeT = SS.dive.rise; s.cd = SS.dive.cd[ph(S)] * cdK(S); w.fx('ward', s.x, s.y); w.number(s.x, s.y - 34, SS_SAY.ward, '#c8d8e8'); } return true; }
  if (s.mode === 'land' || s.mode === 'downed') { if (s.modeT <= 0) {
      if (s.role === 'diver' && S.dead.shrieker && !s.second && P) { s.second = true; aimAt(S, s, P, w); s.modeT = SS.dive.second; s.openT0 = s.modeT; return true; }   /* THE PAIR (the shrieker gone) */
      s.second = false; s.mode = 'rise'; s.modeT = SS.dive.rise; s.cd = SS.dive.cd[ph(S)] * cdK(S); } return true; }
  return false;
}
function stepDiver(S, s, dt, P, w) {
  if (s.mode === 'wake') { if (s.modeT <= 0) { s.mode = 'hover'; } return; }
  if (stepDive(S, s, dt, P, w)) return;
  if (s.mode === 'rise') { fly(s, clampX(S, P ? P.x - s.side * 60 : s.x), S.G.floorY - SS.hover.diver, dt, 2.5); if (s.modeT <= 0) s.mode = 'hover'; return; }
  if (trySnatch(S, s, P, w)) return;
  if (s.mode === 'snatchTell' || s.mode === 'snatch') return stepSnatch(S, s, dt, P, w);
  /* hover: over you and a little to one side; dive when ready */
  s.mode = 'hover'; fly(s, clampX(S, (P ? P.x : S.G.mid) - s.side * 50 + Math.sin(S.act * 1.7) * 20), S.G.floorY - SS.hover.diver + Math.sin(s.cd * 3) * 4, dt, 1.6);
  if (s.cd <= 0 && P && P.alive && s.ward <= 0) aimAt(S, s, P, w);
}
function stepShrieker(S, s, dt, P, w) {
  if (s.mode === 'wake') { if (s.modeT <= 0) s.mode = 'hover'; return; }
  if (stepDive(S, s, dt, P, w)) return;   /* (the diver gone: she dives at her own mark) */
  if (s.mode === 'screamTell') { s.face = P ? Math.sign(P.x - s.x) || s.face : s.face; if (s.modeT <= 0) scream(S, s, P, w); return; }
  if (s.mode === 'swoop') { const tx = clampX(S, (P ? P.x : S.G.mid) + s.side * 46); fly(s, tx, S.G.floorY - SS.scream.low, dt, 3);
    if (S.dead.snatcher && !s.waved && s.modeT < SS.scream.swoop - 0.5 && P) { s.waved = true; s.mode = 'waveTell'; s.modeT = SS.wave.tell; s.face = Math.sign(P.x - s.x) || 1; s.act = ++S.act; w.mark(s, '!'); w.sound('inhale'); w.number(s.x, s.y - 30, SS_SAY.wave, '#ffd36b'); return; }
    if (s.modeT <= 0) { s.mode = 'rise'; s.modeT = 1.0; s.cd = SS.scream.cd[ph(S)] * cdK(S); } return; }
  if (s.mode === 'waveTell') { if (s.modeT <= 0) { s.mode = 'wave'; s.modeT = 0.4; S.waves.push({ x: s.x + s.face * 14, dir: s.face, life: SS.wave.life, key: 'wv' + s.act }); S.n.waves++; w.sound('shriek'); } return; }
  if (s.mode === 'wave') { if (s.modeT <= 0) { s.mode = 'rise'; s.modeT = 1.0; s.cd = SS.scream.cd[ph(S)] * cdK(S); } return; }
  if (s.mode === 'rise') { fly(s, clampX(S, S.G.mid - s.side * 90), S.G.floorY - SS.hover.shrieker, dt, 2); if (s.modeT <= 0) s.mode = 'hover'; return; }
  if (trySnatch(S, s, P, w)) return;
  if (s.mode === 'snatchTell' || s.mode === 'snatch') return stepSnatch(S, s, dt, P, w);
  s.mode = 'hover'; fly(s, clampX(S, S.G.mid + Math.sin(S.act * 0.9 + s.cd) * 120), S.G.floorY - SS.hover.shrieker + Math.sin(s.cd * 2) * 6, dt, 1.2);
  if (s.cd <= 0 && P && P.alive && s.ward <= 0) { s.mode = 'screamTell'; s.modeT = SS.scream.tell; s.openT0 = s.modeT; s.act = ++S.act; w.mark(s, '!!'); w.sound('screamTell'); }
}
/* THE SCREAM: the mark snaps onto your spot; her sisters strike it */
function scream(S, s, P, w) {
  const m = { x: clampX(S, P ? P.x : S.G.mid), t: SS.scream.mark, T: SS.scream.mark }; S.marks.push(m); S.n.screams++; w.sound('scream'); w.shake(3);
  if (!S.told.mark) { S.told.mark = 1; w.number(m.x, S.G.floorY - 60, SS_SAY.mark, '#ff6b6b'); }
  const d = S.sis.diver; if (d.alive && d.ward <= 0 && (d.mode === 'hover' || d.mode === 'rise')) aimAt(S, d, P, w, m);
  const n = S.sis.snatcher; if (n.alive && (n.mode === 'carry' || n.mode === 'fly')) { n.target = m.x; n.mode = 'carry'; n.modeT = Math.min(n.modeT, 0.9); }
  if (S.dead.diver) { aimAt(S, s, P, w, m); s.side = -s.side; return; }   /* the diver gone: she dives at her own mark */
  s.mode = 'swoop'; s.modeT = SS.scream.swoop; s.waved = false; s.side = Math.random() < 0.5 ? -1 : 1;
}
function stepSnatcher(S, s, dt, P, w) {
  const G = S.G;
  if (s.mode === 'wake') { if (s.modeT <= 0) { s.mode = 'fly'; s.perchI = s.x > G.mid ? 1 : 0; } return; }
  if (stepDive(S, s, dt, P, w)) return;
  if (s.mode === 'rise') { fly(s, s.x, G.floorY - SS.hover.snatcher, dt, 2.5); if (s.modeT <= 0) { s.mode = 'fly'; s.perchI = P && P.x > G.mid ? 0 : 1; } return; }
  if (trySnatch(S, s, P, w)) return;
  if (s.mode === 'snatchTell' || s.mode === 'snatch') return stepSnatch(S, s, dt, P, w);
  if (s.mode === 'fly') { const px = G.perch[s.perchI || 0], py = G.perchY; fly(s, px, py, dt, 2.6); if (Math.abs(s.x - px) < 6 && Math.abs(s.y - py) < 6) { s.mode = 'pick'; s.modeT = SS.rock.pick; s.x = px; s.y = py; w.sound('pick'); } return; }
  if (s.mode === 'pick') { if (s.modeT <= 0) { s.rocks = S.dead.shrieker ? 2 : 1; s.mode = 'carry'; s.modeT = SS.rock.carry * cdK(S); s.target = null; } return; }
  if (s.mode === 'carry') { const tx = clampX(S, s.target != null ? s.target : P ? P.x : G.mid); fly(s, tx, G.floorY - SS.hover.snatcher, dt, 2.4);
    if ((Math.abs(s.x - tx) < 10 && s.y < G.floorY - SS.hover.snatcher + 12) || s.modeT <= 0) { s.mode = 'dropTell'; s.modeT = SS.rock.tell; s.openT0 = s.modeT; s.dropX = clampX(S, s.x); s.act = ++S.act; w.mark(s, '!!'); w.sound('rockTell'); } return; }
  if (s.mode === 'dropTell') { s.x += (s.dropX - s.x) * Math.min(1, dt * 6); if (s.modeT <= 0) { s.mode = 'drop'; s.modeT = 0.35; S.rocks.push({ x: s.dropX, y0: s.y + 6, t: 0, T: SS.rock.fall, key: 'rk' + s.act }); s.rocks--; S.n.drops++; w.sound('drop'); } return; }
  if (s.mode === 'drop') { if (s.modeT <= 0) {
      if (s.rocks > 0) { s.mode = 'carry'; s.modeT = 1.2; s.target = P ? P.x : G.mid; return; }   /* (the shrieker gone: two a carry) */
      if (S.dead.diver && P && P.alive && s.ward <= 0) { aimAt(S, s, P, w); return; }   /* (the diver gone: she dives after the drop) */
      s.mode = 'fly'; s.perchI = (s.perchI || 0) ^ 1; } return; }
  s.mode = 'fly';
}
/* THE SNATCH (the first fall gives it to whoever has talons for it - the snatcher, else the diver): a low told sweep across the summit at your height */
function trySnatch(S, s, P, w) {
  if (!P || !P.alive || S.snatchCd > 0 || alive(S).length > 2 || s.ward > 0) return false;
  const who = S.sis.snatcher.alive ? 'snatcher' : 'diver'; if (s.role !== who || !(s.mode === 'hover' || s.mode === 'fly')) return false;
  S.snatchCd = SS.snatch.cd * cdK(S); s.mode = 'snatchTell'; s.modeT = SS.snatch.tell; s.openT0 = s.modeT; s.act = ++S.act; s.sDir = P.x < S.G.mid ? -1 : 1;
  s.x = s.sDir < 0 ? S.G.x1 - 20 : S.G.x0 + 20; s.y = S.G.floorY - SS.snatch.h - 30; s.face = -s.sDir; w.mark(s, '!!'); w.sound('snatchTell'); if (!S.told.snatch) { S.told.snatch = 1; w.number(S.G.mid, S.G.floorY - 70, SS_SAY.snatch, '#ff6b6b'); }
  return true;
}
function stepSnatch(S, s, dt, P, w) {
  if (s.mode === 'snatchTell') { s.y += (S.G.floorY - SS.snatch.h - s.y) * Math.min(1, dt * 4); if (s.modeT <= 0) { s.mode = 'snatch'; s.hitKey = 'sn' + s.act; S.n.snatches++; w.sound('swoop'); } return; }
  s.x += -s.sDir * SS.snatch.v * dt; s.y = S.G.floorY - SS.snatch.h;
  w.hit(s, [s.x - 14, s.x + 14, s.y - 10, s.y + 10], SS.snatch.dmg, 'snatch', { key: s.hitKey, knockUp: true });
  if (s.x < S.G.x0 + 10 || s.x > S.G.x1 - 10) { s.mode = 'rise'; s.modeT = SS.dive.rise; if (s.role === 'snatcher') s.cd = 0; }
}
function stepRocks(S, dt, heroes, w) {
  for (const c of S.rocks) { c.t += dt; if (c.t < c.T || c.done) continue; c.done = true; const fy = S.G.floorY; w.dust(c.x, fy, 8); w.sound('rockLand'); w.shake(3);
    w.hitArea([c.x - SS.rock.r, c.x + SS.rock.r, fy - 26, fy + 2], SS.rock.dmg, 'rock', c.key);
    if (!crackAt(S, c.x)) { S.stones.push({ x: c.x, t: SS.rock.life }); S.n.stones++; if (!S.told.stone) { S.told.stone = 1; w.number(c.x, fy - 40, SS_SAY.stone, '#ffd36b'); } } }
  S.rocks = S.rocks.filter(c => !c.done);
}
function stepWaves(S, dt, heroes, w) {
  for (const q of S.waves) { q.life -= dt; q.x += q.dir * SS.wave.v * dt; if (q.x < S.G.x0 || q.x > S.G.x1) q.life = 0;
    for (const h of heroes) if (h.alive && Math.abs(h.x - q.x) < 9 && S.G.floorY - h.y < SS.wave.h) w.hitHero(h, SS.wave.dmg, 'wave', q.key, true); }
  S.waves = S.waves.filter(q => q.life > 0);
}
export const rockAt = (c, floorY) => { const k = Math.min(1, c.t / c.T); return { x: c.x, y: c.y0 + (floorY - c.y0) * k * k, k }; };
/* ---------- A BLOW ON A SISTER (B15) -> [what lands, the word or null] ---------- */
export function takeBlow(s, dmg, plunge) {
  if (s.ward > 0 || s.mode === 'tear') return [Math.max(1, Math.round(dmg * SS.wardMul)), 'WARDED'];
  if (s.mode === 'stuck' && !(s.purse > 0)) return [Math.max(1, Math.round(dmg * SS.wardMul)), 'WARDED'];   /* (the stun paid in full: she is tearing free - B15's floor, never nothing) */
  if (s.mode === 'stuck') { const d = Math.round(dmg * SS.stun.mul), left = s.purse ?? Infinity; if (d >= left) { s.purse = 0; s.modeT = Math.min(s.modeT, 0.01); return [Math.max(1, Math.round(left)), null]; } s.purse = left - d; return [d, null]; }
  if (s.mode === 'downed') return [Math.round(dmg * SS.downK), null];
  if (LOW_MODES.has(s.mode) || plunge) return [Math.round(dmg), null];
  return [Math.max(1, Math.round(dmg * SS.wing)), 'ON THE WING'];
}
/* a sister falls: the team changes */
export function fell(S, r, w) {
  S.dead[r] = true; S.n.fell.push(r); S.ph = 1 + Object.keys(S.dead).length; S.marks = []; const left = alive(S);
  const FELL = { diver: SS_SAY.diverFell, shrieker: SS_SAY.shriekerFell, snatcher: SS_SAY.snatcherFell };
  w.number(S.G.mid, S.G.floorY - 90, left.length === 1 ? SS_SAY.last : FELL[r], '#ff6b6b'); w.sound('fall'); w.music(S.ph);
  for (const q of left) { const s = S.sis[q]; if (s.mode === 'hover' || s.mode === 'fly') s.cd = Math.min(s.cd, 1.2); }
  if (r === 'snatcher') for (const sl of S.G.slabs) if (sl.st === 'rubble') sl.t = Math.min(sl.t, SS.slab.regrow[2]);
  S.snatchCd = Math.min(S.snatchCd, 3);
}

/* ---------- THE BOT (src/lab.js): what a player reads - the red lines a reaction late (and whether they have LOCKED), the rock's red ring, the mark, the wave, the snatch -
   and THE RULE: stand on a crack while a diver aims, step off when her line locks, then strike her stunned in the rubble; cut whoever comes low ---------- */
export const PLAN = { react: 0.22, miss: 0.12, early: 0.1 };
export function ssPlan(s) {
  const out = ssPlan0(s);
  if (globalThis.__ssWhy) { const k = out.why.replace(/ \(.*/, ''); globalThis.__ssWhy[k] = (globalThis.__ssWhy[k] || 0) + 1; }
  return out;
}
function ssPlan0(s) {
  const { P, S, reach } = s, G = S.G, out = { gx: null, face: P.face, atk: false, jump: false, dodge: false, block: false, down: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0;
  mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 600) { mem.seen.clear(); mem.roll.clear(); }
  const seenFor = (key, d = s.v2 ? 0 : PLAN.react) => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= d; };
  const roll = (key, pr) => { if (!mem.roll.has(key)) mem.roll.set(key, rng() < pr); return mem.roll.get(key); };
  const lo = G.x0 + 12, hi = G.x1 - 12, clamp = x => Math.max(lo, Math.min(hi, x));
  const sis = ROLES.map(r => S.sis[r]).filter(q => q.alive);
  const hz = [...S.rocks.map(c => [c.x, SS.rock.r + 10]), ...S.marks.map(m => [m.x, 22])];
  const inHaz = x => S.rocks.some(c => Math.abs(x - c.x) < SS.rock.r + 10);
  const swing = fx => { out.face = Math.sign(fx - P.x) || out.face; out.atk = P.atk < 0; };
  /* 1. IN THE AIR: keep going */
  if (!P.ground && mem.jumpT !== undefined && t - mem.jumpT < 0.5) { out.gx = mem.jumpX; out.why = 'in the air'; const q = sis.find(z => Math.abs(z.x - P.x) < reach + 12 && z.y < P.y && P.y - z.y < 50); if (q) swing(q.x); return out; }
  /* 2. A ROCK'S RING ON ME: off it (the side away from the summit's edge) */
  const rk = S.rocks.find(c => Math.abs(P.x - c.x) < SS.rock.r + 10);
  if (rk && seenFor('rk' + rk.key)) { out.gx = clamp(P.x + (P.x < rk.x ? -1 : 1) * (SS.rock.r + 22)); if (out.gx === P.x) out.gx = clamp(rk.x + (rk.x < G.mid ? 1 : -1) * (SS.rock.r + 22)); out.why = 'off the rock\'s ring'; return out; }
  /* 3. THE SNATCH / THE WAVE coming at me: jump it (or block the wave) */
  for (const q of sis) if (q.mode === 'snatch' && Math.abs(q.x - P.x) < 70 && (P.x - q.x) * (-q.sDir) > -8 && P.ground && !roll('sn' + q.act, PLAN.miss)) { out.jump = true; out.gx = P.x; mem.jumpT = t; mem.jumpX = P.x; out.why = 'jump the snatch'; return out; }
  for (const q of sis) if (q.mode === 'snatchTell' && seenFor('st' + q.act)) { out.gx = P.x; out.why = 'the snatch: ready to jump'; return out; }
  const wave = S.waves.find(q => (P.x - q.x) * q.dir > 0 && Math.abs(P.x - q.x) < 46);
  if (wave && P.ground && seenFor('wv' + wave.key, 0.08)) { if (s.shield && !roll('wb' + wave.key, 0.5)) { out.block = true; out.face = -wave.dir; out.why = 'block the wave'; return out; } out.jump = true; out.gx = P.x; mem.jumpT = t; mem.jumpX = P.x; out.why = 'jump the wave'; return out; }
  /* 4. A DIVER AIMING AT ME: on a crack - wait for the LOCK, then step off; off a crack - get onto one if there is time, else step off at the lock */
  const aiming = sis.filter(q => q.mode === 'diveTell' && (!q.aim.mark || Math.abs(q.aim.x - P.x) < 26) && seenFor('dt' + q.act));
  const diving = sis.find(q => q.mode === 'dive' && Math.abs(q.dv.tx - P.x) < 20);
  const cr = cracks(S).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x));
  const onCrack = cr.find(c => Math.abs(c.x - P.x) < c.w / 2 - 4);
  const stepOff = (q, why) => { const d = (P.x < G.mid ? 1 : -1); let x = clamp(P.x + d * 46); if (inHaz(x)) x = clamp(P.x - d * 46); out.gx = x; out.why = why; return out; };
  if (diving) { if (s.shield && !onCrack && !roll('db' + diving.act, 0.55)) { out.block = true; out.face = Math.sign(diving.x - P.x) || 1; out.why = 'block the dive'; return out; }
    if (s.dodge && !roll('dd' + diving.act, 0.5)) { out.dodge = true; out.gx = clamp(P.x + (P.x < G.mid ? 1 : -1) * 40); out.why = 'roll out of the dive'; return out; }
    return stepOff(diving, 'out of the dive'); }
  for (const q of aiming) { const miss = s.v2 ? false : roll('am' + q.act, PLAN.miss);
    if (q.aim.lock) { if (!seenFor('lk' + q.act, s.v2 ? 0 : PLAN.react * 0.6)) { out.gx = P.x; out.why = 'her line locked: reading it'; return out; }
      if (!miss) return stepOff(q, onCrack ? 'her line locked on the crack: step off' : 'her line locked: step off'); out.gx = P.x; out.why = 'her line locked: late (a miss)'; return out; }
    if (!q.aim.lock) { if (onCrack) { out.gx = onCrack.x; out.why = 'on the crack: let her aim'; return out; }
      const c = cr[0]; if (c && Math.abs(c.x - P.x) < 70 && q.modeT > 0.4) { out.gx = c.x; out.why = 'onto a crack while she aims'; return out; } out.gx = P.x; out.why = 'her line: wait for the lock'; return out; } }
  /* 5. A SISTER OPEN (stunned / down) or LOW: strike her */
  const open = sis.filter(q => sisOpen(q) && q.ward <= 0).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
  if (open) { const sx = open.x + (P.x < open.x ? -1 : 1) * (s.tip ? 22 : 12); out.gx = clamp(sx); if (Math.abs(open.x - P.x) < reach + 14) swing(open.x); out.why = 'strike her: ' + (OPEN_NAME[open.mode] || 'open').toLowerCase(); return out; }
  const low = sis.filter(q => LOW_MODES.has(q.mode) && q.mode !== 'snatch' && q.ward <= 0 && G.floorY - q.y < 60).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
  if (low && Math.abs(low.x - P.x) < 120) { const above = G.floorY - low.y > 26; out.gx = clamp(low.x + (P.x < low.x ? -1 : 1) * 12); if (Math.abs(low.x - P.x) < reach + 14) { if (above && P.ground && !roll('lj' + low.act + Math.floor(t * 2), 0.5)) { out.jump = true; mem.jumpT = t; mem.jumpX = low.x; out.why = 'jump at her'; return out; } swing(low.x); } out.why = 'cut her while she is low'; return out; }
  /* 6. THE MARK under me: if a crack is under it, stay till her line locks (above); else off the mark */
  const mk = S.marks.find(m => Math.abs(m.x - P.x) < 18);
  if (mk && !onCrack && seenFor('mk' + mk.T + Math.round(mk.x))) { out.gx = clamp(P.x + (P.x < G.mid ? 1 : -1) * 40); out.why = 'off the mark'; return out; }
  /* 7. THE RULE: go and stand on the nearest crack (away from a rock), facing the nearest sister */
  if (s.rest) { out.gx = clamp(G.mid + (P.x < G.mid ? -1 : 1) * 120); out.why = 'winded: off them'; return out; }
  const c = cr.find(q => !inHaz(q.x)); const near = sis.slice().sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
  if (c) { out.gx = c.x; out.face = near ? Math.sign(near.x - P.x) || 1 : P.face; out.why = Math.abs(c.x - P.x) < 6 ? 'on the crack: bait her' : 'to a crack'; return out; }
  out.gx = clamp(G.mid); out.why = 'no crack: the middle'; return out;
}
