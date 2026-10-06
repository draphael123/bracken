// src/glass-colossus.js - THE GLASS COLOSSUS, THE GLASS SEA's boss (claude/glasssea, the OPUS GREYBOX). Pure: no DOM, no main.js. The world, the
// drawing and the mirrors' turning are src/glass-colossus-hands.js; the bot that fights it is colPlan below (src/lab.js drives the keys).
//
// A PUZZLE BOSS (design standard B11): THE RULE PERSONIFIED. A giant of lightning-glass rooted in the steps at the edge of the sea, its feet fused
// into the glass it was made of. It focuses the sun: its SUN LANCE is the level's own beam turned on you. You climb its body to the cracks.
// THE SHARED READ (B10): OPEN = a gold ring on the weak point and a timer bar; WARDED = a pale glass shell over it and the word; a blow that does
// nothing CLANKS, flashes and says why (SHUT / GLAZED / WARDED). Never silent.
// LEGS ARE ALWAYS HITTABLE (B13): its knee cracks and heels take a hero's blow whole - from a purse per phase (COL.legPurse); spent, the cracks GLAZE
// over until the next phase (told) - the climb is how you reach the big weak points for most of its health.
//
// THE ARENA (COLOSSUS_STAGE, columns from the arena's west wall): 40 wide; it stands at column 20; its body's HOLDS are glass ledges either side (one-way
// tiles: the knee row F-3, the hip row F-6, the shoulder row F-9). Two SHELF-MIRRORS at 12 and 28 (E turns one: FACING THE GIANT / TO THE FIRE / TO THE
// SKY), a campfire at each wall (2, 37). The floor is plain (the slick glass floor is an open choice: it fought the read).
// THE PHASES (one new move each; each changes the arena):
//   P1 DUSK (100-55%): SUN LANCE (red X: a line along the ground to where it ends), STOMP (!: a shard ring runs out both ways - jump it, or a shield),
//      SHARD RAIN (!: marks where the glass falls). OPENING: bait the lance into a FACING mirror - it reflects into its chest and CRACKS it open
//      (COL.openT). NEW MOVE: THE SHAKE (told: HOLD! - a climber who does not grip (hold DOWN) is thrown off: a blow and the floor, never a death).
//   P2 NIGHT (55-25%): no lance (no reflection); the sky goes dark; THE SWARM CALL (new): its fist into the ground - the crack under it pours skitters
//      unless FIRELIGHT holds it: a mirror turned TO THE FIRE throws the campfire's light along the floor onto the crack. Held, it strains and its
//      SHOULDER CRACKS BLAZE OPEN - climb, and strike or PLUNGE them.
//   P3 DAWN (25-0%): the sun returns and so does the lance (the chest again). NEW: a mirror turned TO THE SKY catches the dawn and burns its CROWN -
//      DAZZLED, the last opening. DESPERATION: THE SHARD WAVE (!!: rolled across the whole floor - jump it).
// B3: every opening ends in a TOLD COL.wardT s ward (immune), then it KNOCKS THE MIRROR that opened it back round to FACING (no chain-lock: each
// opening wants a fresh TURN). B12: no lance and no swarm for COL.lockT s after a ward. B4: open, it stands still.
export const COLOSSUS_STAGE = { W: 40, cc: 20, mirrors: [12, 28], fires: [2, 37], knee: 3, hip: 6, shoulder: 9, crown: 12,
  kneeW: [-5, -3], kneeE: [2, 4], hipW: [-4, -2], hipE: [1, 3], shoulderW: [-5, -2], shoulderE: [1, 4], crack: [-3, 2] };
export const COL = {
  hp: 2400, w: 72, h: 200,
  lanceTell: 1.15, lanceTell3: 1.0, lanceAct: 0.45, lanceDmg: 36, lanceBand: [28, 4],
  stompTell: 0.85, stompV: 240, stompH: 14, stompDmg: 22,
  shardTell: 0.85, shardAct: 0.25, shardDmg: 18, shardR: 9, shardSpread: 44,
  shakeTell: 1.0, shake: 0.9, shakeDmg: 14, shakeAfter: 1.2, shakeCd: 5,
  swarmTell: 1.2, swarmAct: 1.4, swarmMax: 6, swarmEvery: 0.45,
  waveTell: 1.0, waveV: 260, waveH: 16, waveDmg: 26,
  openT: 5.2, openShoulders: 5.6, openCrown: 5.4, openMul: 2.0, plungeMul: 2.4, openCap: 0.09,
  legPurse: [0.15, 0.09, 0.07], legMul: 1.0,
  wardT: 3.0, lockT: 1.5, phase2: 0.55, phase3: 0.25, phaseT: 2.2,
  gap: [0.9, 0.8, 0.7],
  chain: { 1: ['lance', 'stomp', 'shards', 'lance', 'shards', 'stomp'], 2: ['swarm', 'stomp', 'shards', 'swarm', 'shards'], 3: ['lance', 'shards', 'wave', 'lance', 'stomp'] },
};
/* THE STAGE: carve the arena into the level (the level lays the floor and the walls); returns { arena, carve } */
export function stageColossus(Wr, T, TS, sx, F) {
  const S = COLOSSUS_STAGE, cc = sx + S.cc;
  const carve = () => {
    const led = (a, b, row) => { for (let x = cc + a; x <= cc + b; x++) Wr.set(x, F - row, T.ONEWAY); };
    led(...S.kneeW, S.knee); led(...S.kneeE, S.knee); led(...S.hipW, S.hip); led(...S.hipE, S.hip); led(...S.shoulderW, S.shoulder); led(...S.shoulderE, S.shoulder);
    Wr.ent('colossus', S.cc + sx, F - 1, { face: -1 });
    for (const m of S.mirrors) Wr.ent('colmirror', sx + m, F - 1, {});
    for (const f of S.fires) Wr.ent('gscampfire', sx + f, F - 1, { id: 'arena' + f, arena: true });
  };
  const arena = { x0: sx * TS, x1: (sx + S.W) * TS, floor: F * TS, trigger: (sx + 4) * TS, wallL: sx - 1, wallR: sx + S.W, boss: 'colossus', music: 'colossus',
    tint: '#9ad0e8', tintA: 0.06, start: [sx + 6, F - 1], colossus: { sx, F } };
  return { arena, carve };
}
/* the arena in world px */
export function geom(A, TS = 16) {
  const q = A.colossus, S = COLOSSUS_STAGE, sx = q.sx, F = q.F, cc = sx + S.cc, px = c => c * TS;
  const ledge = ([a, b], row) => ({ l: px(cc + a), r: px(cc + b + 1), y: (F - row) * TS });
  return { x0: px(sx), x1: px(sx + S.W), floor: F * TS, cx: px(cc), F, sx, TS,
    mirrors: S.mirrors.map((m, i) => ({ i, x: px(sx + m) + 8 })), fires: S.fires.map(f => px(sx + f) + 8),
    knee: [ledge(S.kneeW, S.knee), ledge(S.kneeE, S.knee)], hip: [ledge(S.hipW, S.hip), ledge(S.hipE, S.hip)], shoulder: [ledge(S.shoulderW, S.shoulder), ledge(S.shoulderE, S.shoulder)],
    crack: [px(cc + S.crack[0]), px(cc + S.crack[1] + 1)], kneeY: (F - S.knee) * TS, hipY: (F - S.hip) * TS, shoulderY: (F - S.shoulder) * TS, crownY: (F - S.crown) * TS };
}
/* WHERE A BLOW LANDS on it, by the striker's feet: the floor (and a jump off it) = the LEGS; the hip holds = the CHEST; the shoulders and up = SHOULDERS / CROWN */
export function zoneOf(G, footY) { if (footY > G.floor - 2.5 * G.TS) return 'legs'; if (footY > G.floor - 7.5 * G.TS) return 'chest'; return 'top'; }
/* on its body's holds (the hip or the shoulder row, over its body): the SHAKE throws a climber who does not grip */
export function onBody(G, x, y, ground) { if (!ground) return false; for (const l of [...G.hip, ...G.shoulder]) if (Math.abs(y - l.y) < 3 && x >= l.l - 2 && x <= l.r + 2) return true; return false; }
export const colOpen = e => !!e && (e.open || 0) > 0 && ['cracked', 'blazing', 'dazzled'].includes(e.mode);

export function newFight(G) {
  return { G, ph: 1, i: 0, cd: 1.4, t: 0, ward: 0, lock: 0, phaseT: 0, legPurse: COL.legPurse[0], openTaken: 0, opened: null, by: null,
    lance: null, rings: [], marks: [], wave: null, swarmT: 0, swarmN: 0, held: false, shakeCd: 2, bodyT: new Map(), cracks: 0,
    mirrors: G.mirrors.map(m => ({ ...m, notch: 'face' })), n: { lance: 0, reflect: 0, stomp: 0, shards: 0, shake: 0, thrown: 0, swarm: 0, held: 0, dazzle: 0, wave: 0, opens: 0, warded: 0, shut: 0, glazed: 0, leg: 0 },
    told: {}, said: {} };
}
const NOTCH = ['face', 'fire', 'sky'];
export const NOTCH_WORD = { face: 'FACING THE GIANT', fire: 'TO THE FIRE', sky: 'TO THE SKY' };
/* E at a mirror: the next notch. Returns the new notch */
export function turnMirror(S, i) { const m = S.mirrors[i]; m.notch = NOTCH[(NOTCH.indexOf(m.notch) + 1) % 3]; m.turnedT = 0; return m.notch; }
/* the lance's end on its side: the first FACING mirror between it and the wall, or the wall */
export function lanceEnd(S, dir) {
  const G = S.G, ms = S.mirrors.filter(m => m.notch === 'face' && Math.sign(m.x - G.cx) === dir).sort((a, b) => Math.abs(a.x - G.cx) - Math.abs(b.x - G.cx));
  return ms.length ? { x: ms[0].x, mirror: ms[0].i } : { x: dir < 0 ? G.x0 + 4 : G.x1 - 4, mirror: -1 };
}
/* the firelight relay in phase two: a mirror TO THE FIRE throws the campfire behind it along the floor inward, to the crack under it */
export const relaying = S => S.mirrors.some(m => m.notch === 'fire');
const beginOpen = (e, S, what, t, by, c) => { e.mode = what; e.open = t; e.openT0 = t; S.openTaken = 0; S.opened = what; S.by = by; S.lance = null; S.n.opens++; c.sound && c.sound('open'); c.fx && c.fx('open', e.x, e.y); };

/* ---------- ONE FRAME ---------- heroes: [{ x, y, ground, grip, alive, pp }]; c: { hit(box, dmg, name, o), number(x, y, t, col), sound(k), shake(n),
   fx(k, x, y), music(ph), swarm(n) -> spawned, swarmAlive() -> n, held() -> crack in firelight, slap(i) (a mirror knocked round), dazzleOk() } */
export function stepColossus(e, S, dt, heroes, c) {
  const G = S.G; S.t += dt;
  if (e.mode === 'sleep') return;
  if (e.mode === 'wake') { e.modeT = (e.modeT ?? 1.6) - dt; if (e.modeT <= 0) { e.mode = 'idle'; S.cd = 1.0; } return; }
  const live = heroes.filter(h => h.alive); const near = live.slice().sort((a, b) => Math.abs(a.x - G.cx) - Math.abs(b.x - G.cx))[0];
  for (const h of live) { const on = onBody(G, h.x, h.y, h.ground); S.bodyT.set(h.pp, on ? (S.bodyT.get(h.pp) || 0) + dt : 0); }
  S.shakeCd -= dt; S.lock = Math.max(0, S.lock - dt);
  for (const m of S.mirrors) m.turnedT = (m.turnedT || 0) + dt;
  /* the travelling hazards: stomp rings, the shard wave */
  for (const r of S.rings) { r.x += r.dir * COL.stompV * dt; if (r.x < G.x0 || r.x > G.x1) r.dead = true; else c.hit([r.x - 10, r.x + 10, G.floor - COL.stompH, G.floor], COL.stompDmg, 'THE STOMP', { blockable: true, key: 'ring' + r.id }); }
  S.rings = S.rings.filter(r => !r.dead);
  if (S.wave) { const w = S.wave; w.x += w.dir * COL.waveV * dt; if (w.x < G.x0 - 20 || w.x > G.x1 + 20) S.wave = null; else c.hit([w.x - 14, w.x + 14, G.floor - COL.waveH, G.floor], COL.waveDmg, 'THE SHARD WAVE', { key: 'wave' + w.id }); }
  /* THE WARD after an opening (B3), then the lockout (B12) */
  if (S.ward > 0) { S.ward -= dt; if (S.ward <= 0) { S.ward = 0; S.lock = COL.lockT; if (S.by != null && S.by >= 0 && S.mirrors[S.by] && S.mirrors[S.by].notch !== 'face') { S.mirrors[S.by].notch = 'face'; c.slap && c.slap(S.by); } S.by = null; } }
  /* THE OPENINGS (B4: it stands still) */
  if (colOpen(e)) { e.open -= dt; if (e.open <= 0) { e.open = 0; e.mode = 'idle'; S.cd = COL.gap[S.ph - 1] + 0.2; S.ward = COL.wardT; S.n.warded++; c.sound && c.sound('ward'); c.fx && c.fx('ward', e.x, e.y); if (!S.told.ward) { S.told.ward = 1; c.number(e.x, G.crownY - 20, 'IT GLAZES ITS CRACKS OVER: WAIT FOR THE GLASS TO CLEAR', '#c8d8e8'); } } return; }
  /* THE PHASES (not inside an opening) */
  const k = e.hp / e.maxHp;
  if (e.mode !== 'phase' && ((S.ph === 1 && k <= COL.phase2) || (S.ph === 2 && k <= COL.phase3))) {
    S.ph++; e.phase = S.ph; e.mode = 'phase'; e.modeT = COL.phaseT; S.lance = null; S.marks = []; S.legPurse = e.maxHp * COL.legPurse[S.ph - 1]; S.i = 0; S.ward = 0;
    for (const m of S.mirrors) m.notch = 'face';
    c.music && c.music(S.ph); c.shake && c.shake(5); c.sound && c.sound('phase');
    c.number(e.x, G.crownY - 30, S.ph === 2 ? 'NIGHT FALLS IN ITS GLASS: THE LANCE IS DARK' : 'DAWN: THE SUN RETURNS TO IT', S.ph === 2 ? '#9ab0e8' : '#ffd36b'); return; }
  if (e.mode === 'phase') { e.modeT -= dt; if (e.modeT <= 0) { e.mode = 'idle'; S.cd = 1.0; if (S.ph === 2) c.number(e.x, G.crownY - 30, 'IT CALLS THE SWARM: FIRELIGHT HOLDS THEM', '#ffd36b'); if (S.ph === 3) c.number(e.x, G.crownY - 30, 'A MIRROR TO THE SKY THROWS THE DAWN ON ITS CROWN', '#ffd36b'); } return; }
  /* P3: THE DAWN ON ITS CROWN - a mirror TO THE SKY, no ward, no lockout: DAZZLED (it may cancel a tell, never a blow in flight) */
  if (S.ph === 3 && S.ward <= 0 && !['lance', 'shards', 'stomp', 'shake', 'wave'].includes(e.mode)) { const m = S.mirrors.find(q => q.notch === 'sky'); if (m) { S.n.dazzle++; S.marks = []; beginOpen(e, S, 'dazzled', COL.openCrown, m.i, c); c.number(e.x, G.crownY - 26, 'THE DAWN BURNS ITS CROWN: DAZZLED', '#ffd36b'); return; } }
  e.modeT = (e.modeT || 0) - dt;
  switch (e.mode) {
    case 'idle': { if (near) e.face = Math.sign(near.x - e.x) || e.face; S.cd -= dt; if (S.cd > 0) break;
      /* a climber on its body for long enough: THE SHAKE (it never shakes in an opening, and not too often) */
      const climber = live.find(h => (S.bodyT.get(h.pp) || 0) >= COL.shakeAfter);
      if (climber && S.shakeCd <= 0) { e.mode = 'shakeTell'; e.modeT = COL.shakeTell; S.n.shake++; c.sound && c.sound('tellHard'); c.number(e.x, G.crownY - 14, 'HOLD!', '#ff6b6b'); break; }
      const ch = COL.chain[S.ph]; let name = ch[S.i % ch.length]; S.i++;
      if ((name === 'lance' || name === 'swarm') && S.lock > 0) name = 'shards';
      if (name === 'stomp' && live.some(h => onBody(G, h.x, h.y, h.ground)) && S.shakeCd <= 0) { e.mode = 'shakeTell'; e.modeT = COL.shakeTell; S.n.shake++; c.number(e.x, G.crownY - 14, 'HOLD!', '#ff6b6b'); break; }   /* a stomp with a climber on it is the shake */
      if (name === 'lance') { const dir = near ? (Math.sign(near.x - G.cx) || e.face) : e.face; e.face = dir; S.lance = { dir, end: lanceEnd(S, dir) }; e.mode = 'lanceTell'; e.modeT = S.ph === 3 ? COL.lanceTell3 : COL.lanceTell; S.n.lance++; c.sound && c.sound('lanceTell'); }
      else if (name === 'stomp') { e.mode = 'stompTell'; e.modeT = COL.stompTell; c.sound && c.sound('tell'); }
      else if (name === 'shards') { S.marks = live.flatMap(h => [-COL.shardSpread, 0, COL.shardSpread].map(d => ({ x: Math.max(G.x0 + 10, Math.min(G.x1 - 10, h.x + d)), y: c.surface ? c.surface(h.x + d, h.y) : G.floor }))); e.mode = 'shardTell'; e.modeT = COL.shardTell; c.sound && c.sound('tell'); }
      else if (name === 'swarm') { e.mode = 'swarmTell'; e.modeT = COL.swarmTell; S.n.swarm++; c.sound && c.sound('tellHard'); }
      else if (name === 'wave') { e.mode = 'waveTell'; e.modeT = COL.waveTell; S.wave = null; S.waveDir = near && near.x < G.cx ? 1 : -1; c.sound && c.sound('tellHard'); }
      break; }
    case 'lanceTell': if (S.lance) S.lance.end = lanceEnd(S, S.lance.dir);   /* (a mirror turned during the tell changes where it ends: the ring moves) */
      if (e.modeT <= 0) { e.mode = 'lance'; e.modeT = COL.lanceAct; S.lance.fired = true; c.sound && c.sound('lance'); c.shake && c.shake(2); } break;
    case 'lance': { const L0 = S.lance; if (L0) { const x0 = G.cx, x1 = L0.end.x, [hi, lo] = COL.lanceBand; c.hit([Math.min(x0, x1), Math.max(x0, x1), G.floor - hi, G.floor - lo], COL.lanceDmg, 'THE SUN LANCE', { key: 'lance' + S.n.lance });
        if (L0.end.mirror >= 0 && !L0.reflected && e.modeT < COL.lanceAct - 0.12) { L0.reflected = true; S.n.reflect++; c.sound && c.sound('reflect'); c.number(e.x, G.hipY - 30, 'THE MIRROR THROWS IT BACK: ITS CHEST CRACKS', '#ffd36b'); beginOpen(e, S, 'cracked', COL.openT, L0.end.mirror, c); S.by = -1; return; } }
      if (e.modeT <= 0) { e.mode = 'idle'; S.cd = COL.gap[S.ph - 1]; S.lance = null; if (L0 && L0.end.mirror < 0 && !S.told.miss) { S.told.miss = 1; c.number(e.x, G.hipY - 30, 'THE LANCE MISSED THE MIRRORS: NOTHING OPENS', '#9aa39a'); } } break; }
    case 'stompTell': if (e.modeT <= 0) { e.mode = 'stomp'; e.modeT = 0.3; S.n.stomp++; const id = S.n.stomp; S.rings.push({ x: G.cx - 30, dir: -1, id: id + 'w' }, { x: G.cx + 30, dir: 1, id: id + 'e' }); c.sound && c.sound('stomp'); c.shake && c.shake(4); } break;
    case 'stomp': if (e.modeT <= 0) { e.mode = 'idle'; S.cd = COL.gap[S.ph - 1]; } break;
    case 'shardTell': if (e.modeT <= 0) { e.mode = 'shards'; e.modeT = COL.shardAct; S.n.shards++; c.sound && c.sound('shards');
        for (const m of S.marks) c.hit([m.x - COL.shardR, m.x + COL.shardR, m.y - 40, m.y], COL.shardDmg, 'THE SHARD RAIN', { blockable: true, key: 'shard' + S.n.shards + ':' + Math.round(m.x) }); } break;
    case 'shards': if (e.modeT <= 0) { e.mode = 'idle'; S.cd = COL.gap[S.ph - 1]; S.marks = []; } break;
    case 'shakeTell': if (e.modeT <= 0) { e.mode = 'shake'; e.modeT = COL.shake; S.shakeCd = COL.shakeCd; c.sound && c.sound('shake'); c.shake && c.shake(6);
        for (const h of live) if (onBody(G, h.x, h.y, h.ground) && !h.grip) { S.n.thrown++; c.throwOff && c.throwOff(h, Math.sign(h.x - G.cx) || 1); } } break;
    case 'shake': for (const h of live) if (onBody(G, h.x, h.y, h.ground) && !h.grip) { S.n.thrown++; c.throwOff && c.throwOff(h, Math.sign(h.x - G.cx) || 1); }
      if (e.modeT <= 0) { e.mode = 'idle'; S.cd = COL.gap[S.ph - 1]; } break;
    case 'swarmTell': S.held = !!(c.held && c.held());
      if (e.modeT <= 0) { if (S.held) { S.n.held++; c.number(e.x, G.shoulderY - 30, 'THE FIRE HOLDS THE SWARM: ITS SHOULDERS BLAZE', '#ffd36b'); const m = S.mirrors.find(q => q.notch === 'fire'); beginOpen(e, S, 'blazing', COL.openShoulders, m ? m.i : -1, c); return; }
        e.mode = 'swarm'; e.modeT = COL.swarmAct; S.swarmT = 0; c.sound && c.sound('swarm'); c.shake && c.shake(3); } break;
    case 'swarm': S.swarmT -= dt; if (S.swarmT <= 0) { S.swarmT = COL.swarmEvery; if (c.swarmAlive && c.swarmAlive() < COL.swarmMax && c.swarm) c.swarm(2); }
      if (c.held && c.held() && e.modeT > 0.3) { S.n.held++; c.number(e.x, G.shoulderY - 30, 'THE FIRE HOLDS THE SWARM: ITS SHOULDERS BLAZE', '#ffd36b'); const m = S.mirrors.find(q => q.notch === 'fire'); beginOpen(e, S, 'blazing', COL.openShoulders, m ? m.i : -1, c); return; }
      if (e.modeT <= 0) { e.mode = 'idle'; S.cd = COL.gap[S.ph - 1]; } break;
    case 'waveTell': if (e.modeT <= 0) { e.mode = 'wave'; e.modeT = 0.4; S.n.wave++; S.wave = { x: S.waveDir > 0 ? G.x0 : G.x1, dir: S.waveDir, id: S.n.wave }; c.sound && c.sound('wave'); c.shake && c.shake(3); } break;
    case 'wave': if (e.modeT <= 0) { e.mode = 'idle'; S.cd = COL.gap[S.ph - 1] + 0.6; } break;
    default: e.mode = 'idle';
  }
}

/* A HERO'S BLOW ON IT: what comes off the bar (0 = turned, with the word in out.word). footY: the striker's feet; plunge: a plunge */
export function takeBlow(e, S, dmg, footY, plunge, out = {}) {
  const G = S.G, z = zoneOf(G, footY);
  if (e.mode === 'sleep' || e.mode === 'wake' || e.mode === 'phase') { out.word = 'WARDED'; return 0; }
  if (S.ward > 0) { S.n.warded++; out.word = 'WARDED'; return 0; }
  const capLeft = () => Math.max(0, e.maxHp * COL.openCap - S.openTaken);
  const opened = (mul) => { const d = Math.min(dmg * mul, capLeft()); S.openTaken += d; if (capLeft() <= 0.01 && e.open > 0.3) { e.open = 0.3; out.word = 'IT SEALS THE CRACK'; } return d; };
  if (z === 'legs') { if (S.legPurse > 0) { const d = Math.min(dmg * COL.legMul, S.legPurse); S.legPurse -= d; S.n.leg += d; if (S.legPurse <= 0.01) { S.legPurse = 0; out.word = 'THE KNEE CRACKS GLAZE OVER: CLIMB'; } return d; }
    S.n.glazed++; out.word = S.n.glazed < 4 ? 'GLAZED: CLIMB TO ITS CRACKS' : 'GLAZED'; return 0; }
  if (z === 'chest' && e.mode === 'cracked') return opened(plunge ? COL.plungeMul : COL.openMul);
  if (z === 'top' && (e.mode === 'blazing' || e.mode === 'dazzled')) return opened(plunge ? COL.plungeMul : COL.openMul);
  if (z === 'chest' && (e.mode === 'blazing' || e.mode === 'dazzled')) { out.word = e.mode === 'blazing' ? 'HIGHER: THE SHOULDERS' : 'HIGHER: THE CROWN'; return 0; }
  if (z === 'top' && e.mode === 'cracked') { out.word = 'LOWER: THE CHEST'; return 0; }
  S.n.shut++; out.word = S.n.shut > 4 ? 'SHUT' : S.ph === 2 ? 'SHUT: FIRELIGHT ON ITS CRACK OPENS IT' : S.ph === 3 && S.n.shut % 2 ? 'SHUT: A MIRROR TO THE SKY' : 'SHUT: BAIT ITS LANCE INTO A MIRROR'; return 0;
}

/* ---------- THE BOT (src/lab.js): what a player sees, read a quarter-second late (the house's human bot: react 0.25 s, a tell misread one time in eight) ----------
   missBait: it does not make it behind the mirror for a lance; missTurn: it fumbles a mirror's turn this time (tries again a second later); missGrip: it lets go in a shake */
export const COL_PLAN = { react: 0.25, miss: 0.13, missBait: 0.25, missTurn: 0.2, missGrip: 0.2 };
/* P: { x, y, ground, face, atk, vy }; returns { gx (walk to), jump, dodge, block, atk, talk (E), grip (hold down), face, why } */
export function colPlan({ P, e, S, reach, shield, rng = Math.random, mem = {}, t, roll = true, tip = 0 }) {
  const G = S.G, out = { gx: null, face: P.face, why: '' }, cx = G.cx, side = P.x < cx ? -1 : 1;
  const late = (k, d) => { const key = k + ':' + (e.mode) + ':' + S.n.lance + ':' + S.n.stomp + ':' + S.n.shards + ':' + S.n.shake + ':' + S.n.wave; if (!(key in mem)) mem[key] = t + COL_PLAN.react - 0.04 + rng() * 0.1; return t >= mem[key] && !(mem['miss' + key] ??= rng() < (d ?? COL_PLAN.miss)); };
  const onFloor = P.ground && P.y > G.floor - 8, onHip = P.ground && Math.abs(P.y - G.hipY) < 4, onSh = P.ground && Math.abs(P.y - G.shoulderY) < 4, onKnee = P.ground && Math.abs(P.y - G.kneeY) < 4;
  const strike = (dirX) => { out.face = dirX; if (P.atk < 0) out.atk = true; };
  /* where to stand to strike its body from side s on a ledge (a spear's TIP pays at a distance from the body's edge: the warden stands back) */
  const spot = (s, l) => { const x = tip ? cx + s * (COL.w / 2 + tip) : s < 0 ? l.r - 4 : l.l + 4; return Math.max(l.l + 4, Math.min(l.r - 4, x)); };
  const legX = s => cx + s * (tip ? COL.w / 2 + tip : 36 + reach * 0.4);
  /* the climb: to the side's holds, row by row (jump straight up through the one-way above) */
  const climbTo = (want, s) => { const k = G.knee[s < 0 ? 0 : 1], h = G.hip[s < 0 ? 0 : 1], sh = G.shoulder[s < 0 ? 0 : 1];
    const mid = l => (l.l + l.r) / 2;
    if (onFloor) { out.gx = mid(k); if (Math.abs(P.x - mid(k)) < 10) out.jump = true; return; }
    if (onKnee) { out.gx = Math.max(h.l + 6, Math.min(h.r - 6, P.x)); if (P.x >= h.l + 4 && P.x <= h.r - 4) out.jump = true; return; }
    if (onHip && want === 'top') { out.gx = Math.max(sh.l + 6, Math.min(sh.r - 6, P.x)); if (P.x >= sh.l + 4 && P.x <= sh.r - 4) out.jump = true; return; }
    if (!P.ground) { out.gx = P.x; out.holdJump = true; } };
  /* 1. THE SHAKE: grip */
  if ((e.mode === 'shakeTell' || e.mode === 'shake') && (onHip || onSh) && late('grip', COL_PLAN.missGrip)) { out.grip = true; out.why = 'grip'; return out; }
  if ((e.mode === 'shakeTell' || e.mode === 'shake') && (onHip || onSh)) { out.why = 'late grip'; return out; }
  /* 2. THE OPENINGS: climb to it and strike inward */
  if (colOpen(e)) { const want = e.mode === 'cracked' ? 'chest' : 'top', s = side;
    if (want === 'chest' && onHip) { out.gx = spot(s, G.hip[s < 0 ? 0 : 1]); if (Math.abs(P.x - out.gx) < 8) strike(-s); out.why = 'chest'; return out; }
    if (want === 'top' && onSh) { out.gx = spot(s, G.shoulder[s < 0 ? 0 : 1]); if (Math.abs(P.x - out.gx) < 8) strike(-s); out.why = 'top'; return out; }
    climbTo(want, s); out.why = 'climb ' + want; return out; }
  /* get off its body when nothing is open (a shake comes for a climber) */
  if ((onHip || onSh) && !colOpen(e)) { out.gx = side < 0 ? G.x0 + 60 : G.x1 - 60; out.why = 'down'; }
  /* 3. THE THREATS IN FLIGHT */
  /* a hazard in flight is SEEN once, a reaction after it appears (and misread one time in eight): then the answer comes at the right moment, as a player's does */
  const seen = id => { if (!(('s' + id) in mem)) { mem['s' + id] = t + COL_PLAN.react - 0.04 + rng() * 0.1; mem['m' + id] = rng() < COL_PLAN.miss; } return t >= mem['s' + id] && !mem['m' + id]; };
  for (const r of S.rings) if (Math.sign(P.x - r.x) === r.dir && onFloor && seen('ring' + r.id)) { const d = Math.abs(r.x - P.x); if (shield && d < 46) { out.block = true; out.why = 'block ring'; return out; } if (d < 30) { out.jump = true; out.why = 'jump ring'; } }
  if (S.wave && onFloor && Math.sign(P.x - S.wave.x) === S.wave.dir && seen('wave' + S.wave.id) && Math.abs(S.wave.x - P.x) < 34) { out.jump = true; out.why = 'jump wave'; }
  if (e.mode === 'shardTell' && late('shard')) { const hitMe = S.marks.some(m => Math.abs(m.x - P.x) < COL.shardR + 6 && Math.abs(m.y - P.y) < 20);
    if (hitMe) { if (shield) { out.block = true; out.why = 'block shards'; return out; } const free = [P.x - 26, P.x + 26, P.x - 60, P.x + 60].find(x => x > G.x0 + 12 && x < G.x1 - 12 && !S.marks.some(m => Math.abs(m.x - x) < COL.shardR + 8)); if (free != null) { out.gx = free; out.why = 'out of shards'; return out; } } }
  if (e.mode === 'shards' && shield && S.marks.some(m => Math.abs(m.x - P.x) < COL.shardR + 6)) { out.block = true; return out; }
  /* 4. THE LANCE: get behind a FACING mirror on its side (the bait), or off the floor, or jump it */
  if ((e.mode === 'lanceTell' || e.mode === 'lance') && S.lance && late('lance')) { const L0 = S.lance, end = L0.end, inLine = onFloor && Math.sign(P.x - cx) === L0.dir && (end.mirror < 0 || Math.abs(P.x - cx) < Math.abs(end.x - cx) + 2);
    if (inLine) { const m = S.mirrors.find(q => q.notch === 'face' && Math.sign(q.x - cx) === L0.dir);
      if (m && e.mode === 'lanceTell' && e.modeT > Math.abs(P.x - (m.x + L0.dir * 18)) / 110 + 0.1 && !(mem['bait' + S.n.lance] ??= rng() < COL_PLAN.missBait)) { out.gx = m.x + L0.dir * 20; out.why = 'behind the mirror'; return out; }
      if (e.mode === 'lanceTell' && e.modeT < 0.32 || e.mode === 'lance') { out.jump = true; out.holdJump = true; out.why = 'jump lance'; return out; }
      out.gx = P.x; out.why = 'wait to jump'; return out; } }
  /* 5. THE PLAN BY PHASE */
  const myMirror = S.mirrors.reduce((a, b) => Math.abs(b.x - P.x) < Math.abs(a.x - P.x) ? b : a), outside = m => m.x + Math.sign(m.x - cx) * 22;
  if (S.ph === 2) { const fireM = S.mirrors.find(q => q.notch === 'fire');
    if (!fireM && S.ward <= 0) { out.gx = myMirror.x; if (Math.abs(P.x - myMirror.x) < 14 && onFloor && late('turn' + myMirror.notch + Math.floor(t), COL_PLAN.missTurn)) { out.talk = true; out.face = Math.sign(myMirror.x - P.x) || P.face; } out.why = 'turn to the fire'; return out; }
    /* wait at its knee (under the hold), ready to climb when the shoulders blaze; cut the legs while the purse lasts */
    const s = fireM ? Math.sign(fireM.x - cx) : side; const kx = (G.knee[s < 0 ? 0 : 1].l + G.knee[s < 0 ? 0 : 1].r) / 2;
    if (e.mode === 'swarmTell' || e.mode === 'swarm') { out.gx = kx; climbTo('top', s); out.why = 'up for the blaze'; return out; }
    out.gx = kx + s * 6; if (S.legPurse > 0 && onFloor && Math.abs(P.x - cx) < 46 + reach) { out.gx = legX(s); if (Math.abs(P.x - out.gx) < 10 && (mem.legT ?? -9) < t - 0.9) { mem.legT = t; strike(-s); } } out.why = 'p2 wait'; return out; }
  if (S.ph === 3) { const skyM = S.mirrors.find(q => q.notch === 'sky');
    if (!skyM && S.ward <= 0 && e.mode !== 'lanceTell' && e.mode !== 'lance') { const m = S.mirrors[side < 0 ? 0 : 1]; out.gx = m.x; if (Math.abs(P.x - m.x) < 14 && onFloor && late('turnS' + m.notch + Math.floor(t), COL_PLAN.missTurn)) { out.talk = true; out.face = Math.sign(m.x - P.x) || P.face; } out.why = 'turn to the sky'; return out; } }
  /* P1 (and P3's lances): wait just outside a FACING mirror on your side; while its lance is far off, cut its legs */
  const m = S.mirrors.find(q => q.notch === 'face' && Math.sign(q.x - cx) === side) || S.mirrors.find(q => q.notch === 'face');
  if (m) { const safeX = outside(m);
    const recent = (e.mode === 'idle' && S.lock > 0) || mem.after > t;   /* right after an opening (the ward and the lockout): no lance comes - the legs */
    if (S.legPurse > 0 && recent && onFloor) { const s = Math.sign(m.x - cx); out.gx = legX(s); if (Math.abs(P.x - out.gx) < 10 && (mem.legT ?? -9) < t - 0.9) { mem.legT = t; strike(-s); } out.why = 'legs'; return out; }
    out.gx = safeX; out.face = -Math.sign(m.x - cx); out.why = 'bait'; }
  if (S.ward > 0) mem.after = t + 1.4;
  return out;
}
