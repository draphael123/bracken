// src/desert-bosses.js — the desert arc's other bosses and minis as DATA on one small engine (pure: no DOM, no main.js). The Dune Worm
// (src/dune-worm.js) and the Skeleton King (src/skeleton-king.js) have their own machines; these nine share this one. Designs:
// docs/briefs/*.md. Proved by tools/desert-bosses.mjs: every attack told and fired, an answer to each in a human quarter-second,
// nothing untouchable past ~2 s, the phases, and THE OPENING caused - a fighter who works the level's rule opens it, one who only
// fights never does. Not wired in; logic and rules, not balance.
//
// THE ENGINE. A boss walks at you, picks the next attack its chain allows (range, phase, a condition), TELLS it (emits 'tell' with the
// house mark: '!' the shield turns it, 'X' move), then ACTS (emits 'hit' boxes; may move it; may hide it), then RECOVERS. Each frame its
// def.rule(B, world, dt) may OPEN it: 'open' for def.openT seconds at double damage, cancelling what it was doing.
export const FLOOR = 320, ARENA = { x0: 0, x1: 640 };
export function makeBoss(def, x) { return { def, x, y: FLOOR, hp: def.hp, face: -1, phase: 1, mode: 'walk', t: 0, cd: 1.0, i: 0, a: null, hitMult: 1, hidden: false, data: {}, openCd: 0, fx: 0 }; }
export const touchable = B => !B.hidden;
export function hurt(B, dmg) { if (!touchable(B)) return 0; const d = dmg * B.hitMult; B.hp = Math.max(0, B.hp - d); return d; }
const clampX = x => Math.max(ARENA.x0 + 20, Math.min(ARENA.x1 - 20, x));
function begin(B, name, w, e) { const a = B.def.attacks[name]; B.a = { name, ...a }; B.mode = 'tell'; B.hidden = !!a.hideTell;
  B.t = Math.max(0.45, a.tell * (B.phase === 2 ? 0.9 : 1)); a.start && a.start(B, w); e('tell', { what: name, mark: a.mark, x: B.data.mark }); }
// def.pick(B, w) may force the next attack by name (ignoring the chain, range and cooldown) or return 'hold' to start none.
export function bossStep(B, w, dt) {
  const D = B.def, out = [], e = (t, o) => out.push({ t, ...o });
  B.t -= dt; B.cd -= dt; B.openCd -= dt;
  if (B.phase === 1 && D.phase2 && B.hp <= D.hp * D.phase2 && B.mode !== 'open') { B.phase = 2; e('phase2', {}); D.onPhase2 && D.onPhase2(B, w, e); }
  // THE OPENING: the level's rule, played by the player
  if (B.mode !== 'open' && B.openCd <= 0 && D.rule && D.rule(B, w, dt, e)) { B.mode = 'open'; B.t = D.openT || 3; B.hidden = false; B.a = null; B.openCd = (D.openT || 3) + (D.openRest || 3); e('open', { x: B.x }); }
  const d = w.px - B.x, ad = Math.abs(d);
  switch (B.mode) {
    case 'open': if (B.t <= 0) { B.mode = 'walk'; B.cd = 0.6; } break;
    case 'walk': { B.face = Math.sign(d) || B.face;
      const forced = D.pick && D.pick(B, w); if (forced === 'hold') { if (ad > (D.keep || 30)) B.x = clampX(B.x + B.face * D.speed * dt); break; }
      if (forced) { begin(B, forced, w, e); break; }
      // the chain in order: it walks (or backs off) into the next attack's range; if it can't get there in 1.5 s it moves on
      const chain = B.phase === 2 && D.chain2 ? D.chain2 : D.chain; let name, a;
      for (let k = 0; k < chain.length; k++) { name = chain[B.i % chain.length]; a = D.attacks[name]; if (!a.ok || a.ok(B, w)) break; B.i = (B.i + 1) % chain.length; }
      const r = a.range || [0, 9999], sp = D.speed * (B.phase === 2 ? (D.speed2 || 1) : 1) * dt, near = Math.max(r[0], Math.min(r[1], D.keep || 30));
      const nx = ad > near ? clampX(B.x + B.face * sp) : ad < r[0] ? clampX(B.x - B.face * sp * (D.back || 1)) : B.x;
      if (!(D.blocked && D.blocked(B, w, nx))) B.x = nx;                     // def.blocked: somewhere it will not walk into
      if (B.cd > 0) break;
      if (ad >= r[0] && ad <= r[1]) { B.wait = 0; B.i = (B.i + 1) % chain.length; begin(B, name, w, e); }
      else if ((B.wait = (B.wait || 0) + dt) > (D.patience || 1.5)) { B.wait = 0; B.i = (B.i + 1) % chain.length; }
      break; }
    case 'tell': if (B.t <= 0) { const a = B.a; B.mode = 'act'; B.t = a.act; B.hidden = !!a.hidden; e('act', { what: a.name }); const h = a.hit && a.hit(B, w); if (h) e('hit', { what: B.a.name, mark: a.mark, blockable: a.mark === '!', ...h }); } break;
    case 'act': { const a = B.a; a.move && a.move(B, w, dt); if (a.each) { const h = a.hit(B, w); if (h) e('hit', { what: a.name, mark: a.mark, blockable: a.mark === '!', ...h }); }
      if (B.t <= 0) { B.hidden = false; a.end && a.end(B, w, e); B.mode = 'recover'; B.t = a.recover ?? 0.5; } break; }
    case 'recover': if (B.t <= 0) { B.mode = 'walk'; B.cd = D.cd * (B.phase === 2 ? 0.8 : 1); } break;
  }
  D.tick && D.tick(B, w, dt, e);
  B.hitMult = B.mode === 'open' ? 2 : B.mode === 'recover' ? 1 : (D.guard ?? 0.5);   // GUARD: blows are half-turned but in a recovery; double in the opening
  return out;
}
const front = (B, len, h = 30, lo = 0) => [B.face > 0 ? B.x : B.x - len, B.face > 0 ? B.x + len : B.x, FLOOR - h, FLOOR - lo];
const at = (x, half, h = 40) => [x - half, x + half, FLOOR - h, FLOOR];

// ================= THE BANDIT KING (level 2) =================
/* OIL JAR leaves a burning patch; he walks through his own fire and BURNS for a while. Pour your skin on him while he burns: steam,
   blind, the mud plate softened - THE OPENING. w: { pour: true this frame if the player pours at him, from within 40 px } */
export const BANDIT_KING = { name: 'THE BANDIT KING', hp: 900, speed: 36, cd: 1.1, openT: 3, phase2: 0.5, keep: 28,
  chain: ['jar', 'sweep', 'knives', 'charge'], chain2: ['jar', 'jar', 'sweep', 'charge', 'knives'],
  attacks: {
    sweep: { mark: '!', tell: 0.6, act: 0.25, range: [0, 50], hit: B => ({ box: front(B, 46) }) },
    knives: { mark: '!', tell: 0.55, act: 0.3, range: [0, 400], hit: B => ({ box: front(B, 260, 30, 10) }) },
    jar: { mark: 'X', tell: 0.8, act: 0.3, range: [0, 400], start: (B, w) => { B.data.mark = w.px; }, hit: B => { (B.data.fires ||= []).push({ x: B.data.mark, t: 6 }); return { box: at(B.data.mark, 24, 20) }; } },
    charge: { mark: 'X', tell: 0.75, act: 0.7, start: (B, w) => { B.data.dir = Math.sign(w.px - B.x) || 1; }, move: (B, w, dt) => { B.x = clampX(B.x + B.data.dir * 330 * dt); }, each: true, hit: B => ({ box: at(B.x, 16, 36) }) },
  },
  tick: (B, w, dt, e) => { for (const f of (B.data.fires || [])) { f.t -= dt; if (f.t > 0 && Math.abs(f.x - B.x) < 24) B.data.burning = 1.5; if (f.t > 0) e('fire', { x: f.x }); } B.data.fires = (B.data.fires || []).filter(f => f.t > 0); B.data.burning = Math.max(0, (B.data.burning || 0) - dt); },
  rule: (B, w) => w.pour && B.data.burning > 0 && Math.abs(w.px - B.x) < 44,
};
// ================= THE ROC (level 3) =================
/* It soars (untouchable, briefly), marks your spot and DIVES there. The flood's head runs through the nest (the channel, x 280-360): a
   dive that lands in the channel while the torrent runs is swept - soaked, grounded - THE OPENING. w: { flood: 'dry'|'horn'|'flood' } */
export const ROC = { name: 'THE ROC', hp: 800, speed: 40, cd: 1.0, openT: 3, phase2: 0.5, channel: [280, 360],
  chain: ['dive', 'gust', 'volley', 'snatch'], chain2: ['dive', 'dive', 'gust', 'snatch', 'volley'],
  attacks: {
    dive: { mark: 'X', tell: 0.9, act: 0.35, hideTell: true, start: (B, w) => { B.data.mark = w.px; B.data.soar = true; }, move: (B, w, dt) => { B.x += (B.data.mark - B.x) * Math.min(1, dt * 12); }, hit: B => ({ box: at(B.data.mark, 14, 40) }), end: B => { B.data.landed = B.data.mark; B.data.soar = false; } },
    gust: { mark: '!', tell: 0.7, act: 0.8, hit: B => ({ box: front(B, 300, 40), gust: B.face }) },
    volley: { mark: '!', tell: 0.6, act: 0.3, hit: B => ({ box: front(B, 280, 30, 12) }) },
    snatch: { mark: 'X', tell: 0.7, act: 0.4, range: [0, 120], start: (B, w) => { B.data.dir = Math.sign(w.px - B.x) || 1; }, move: (B, w, dt) => { B.x = clampX(B.x + B.data.dir * 260 * dt); }, each: true, hit: B => ({ box: at(B.x, 16, 14) }) },
  },
  // THE HORN: the roc holds off while the horn blows, and dives on your spot as the torrent comes (it lands ~0.1 s into the run)
  pick: (B, w) => { if (w.flood !== 'horn') { B.data.hornDive = false; return null; } if (B.data.hornDive || B.mode !== 'walk') return 'hold';
    if (w.floodIn <= Math.max(0.45, ROC.attacks.dive.tell * (B.phase === 2 ? 0.9 : 1)) - 0.1) { B.data.hornDive = true; return 'dive'; } return 'hold'; },
  // swept: the torrent rolls it over and throws it up on the nearer bank, soaked, where you can get at it
  rule: (B, w) => { const l = B.data.landed; if (l === undefined) return false; B.data.landed = undefined; const y = w.flood === 'flood' && l >= ROC.channel[0] && l <= ROC.channel[1]; if (y) B.x = l < (ROC.channel[0] + ROC.channel[1]) / 2 ? ROC.channel[0] - 24 : ROC.channel[1] + 24; return y; },
};
// ================= THE GLASS COLOSSUS (level 4) =================
/* SUN LANCE along the ground at you. The arena's two glass SHELVES (x 200 and 440): a lance whose line meets a shelf before it meets
   you reflects back into its chest - THE OPENING. Phase 2 is night: no lance (so no reflection); it calls the swarm instead. */
export const COLOSSUS = { name: 'THE GLASS COLOSSUS', hp: 1100, speed: 22, cd: 1.3, openT: 3, phase2: 0.5, shelves: [200, 440], keep: 34,
  chain: ['lance', 'stomp', 'shards', 'lance'], chain2: ['stomp', 'swarm', 'shards', 'stomp'],
  attacks: {
    lance: { mark: 'X', tell: 0.9, act: 0.4, range: [50, 640], start: (B, w) => { B.data.lx = w.px; }, hit: B => { const x0 = B.x, x1 = B.data.lx, s = COLOSSUS.shelves.find(sx => (sx - x0) * (x1 - sx) > 0); B.data.reflect = s !== undefined; return { box: s !== undefined ? [Math.min(x0, s), Math.max(x0, s), FLOOR - 28, FLOOR - 8] : [Math.min(x0, x1 - 40), Math.max(x0, x1 + 40), FLOOR - 28, FLOOR - 8] }; } },
    stomp: { mark: 'X', tell: 0.7, act: 0.3, range: [0, 120], hit: B => ({ box: at(B.x, 90, 10) }) },
    shards: { mark: '!', tell: 0.65, act: 0.5, hit: (B, w) => ({ box: at(w.px, 30, 60) }) },
    swarm: { mark: 'X', tell: 0.8, act: 0.4, ok: B => B.phase === 2, hit: (B, w) => ({ box: at(w.fireNear ? -999 : w.px, 40, 12) }) },
  },
  rule: (B) => { if (!B.data.reflect) return false; B.data.reflect = false; return true; },
};
// ================= THE FALLEN HIGH PRIEST (4b) =================
/* The sun crosses the altar's five windows over the fight (an hour every 10 s). The ALTAR MIRROR, turned to the hour's setting, throws
   that window's beam onto the altar strip (x 300-340). Him in the strip with the beam on it: he burns - THE OPENING. SNUFF darkens the
   hour's window for 6 s. w: { mirrorOk: true when the player has set the mirror for this hour } */
export const HIGH_PRIEST = { name: 'THE FALLEN HIGH PRIEST', hp: 900, speed: 30, cd: 1.2, openT: 3, phase2: 0.5, strip: [300, 340],
  chain: ['bolt', 'sweep', 'grasp', 'snuff'], chain2: ['bolt', 'grasp', 'sweep', 'grasp', 'snuff'],
  attacks: {
    bolt: { mark: '!', tell: 0.55, act: 0.3, range: [40, 500], hit: B => ({ box: front(B, 300, 30, 10) }) },
    sweep: { mark: 'X', tell: 0.65, act: 0.3, range: [0, 70], hit: B => ({ box: at(B.x, 60, 12) }) },
    grasp: { mark: 'X', tell: 0.8, act: 0.4, start: (B, w) => { B.data.mark = w.px; }, hit: B => ({ box: at(B.data.mark, 16, 40) }) },
    snuff: { mark: 'X', tell: 0.6, act: 0.2, hit: B => { B.data.snuffed = 6; return null; } },
  },
  tick: (B, w, dt) => { B.data.snuffed = Math.max(0, (B.data.snuffed || 0) - dt); },
  rule: (B, w) => w.mirrorOk && !(B.data.snuffed > 0) && B.x > HIGH_PRIEST.strip[0] - 8 && B.x < HIGH_PRIEST.strip[1] + 8,
};
// ================= THE HOURGLASS KING (level 5) =================
/* His chest is an hourglass that runs out in 12 s; empty, he turns himself over (1.4 s) and it runs again. Turn the arena's SAND-GATE
   WHEEL while his glass is in its last fifth: it drains the last grains and he STALLS - THE OPENING. w: { wheel: true this frame if the
   player turns the wheel } */
export const HOURGLASS_KING = { name: 'THE HOURGLASS KING', hp: 1000, speed: 28, cd: 1.2, openT: 3, phase2: 0.5, glass: 12,
  chain: ['stream', 'gear', 'slip', 'pendulum'],
  attacks: {
    stream: { mark: 'X', tell: 0.8, act: 0.5, start: (B, w) => { B.data.mark = w.px; }, hit: B => ({ box: at(B.data.mark, 16, 80) }) },
    gear: { mark: '!', tell: 0.6, act: 0.5, range: [40, 500], hit: B => ({ box: front(B, 300, 14) }) },
    slip: { mark: 'X', tell: 0.9, act: 0.3, start: (B, w) => { B.data.mark = (w.trail && w.trail[0]) ?? w.px; }, hit: B => ({ box: at(B.data.mark, 18, 40) }) },
    pendulum: { mark: '!', tell: 0.6, act: 0.3, range: [0, 60], hit: B => ({ box: front(B, 54) }) },
  },
  tick: (B, w, dt) => { if (B.mode === 'open') { B.data.sand = HOURGLASS_KING.glass; return; } B.data.sand = (B.data.sand ?? HOURGLASS_KING.glass) - dt; if (B.data.sand <= 0) { B.data.sand = HOURGLASS_KING.glass; } },
  rule: (B, w) => { if (!w.wheel) return false; return (B.data.sand ?? 12) < HOURGLASS_KING.glass * 0.2; },
};
// ================= THE SCARAB MOTHER (level 6) =================
/* The antechamber's two traps: a dart wall (zone x 150-210, plate at x 40) and a falling block (zone 430-490, plate at 600). CHARGE runs
   her across the room; tread on a trap's plate while she is in its zone - she is PINNED - THE OPENING. w: { plate: the plate x you
   are on, or null } */
export const SCARAB_MOTHER = { name: 'THE SCARAB MOTHER', hp: 1000, speed: 30, cd: 1.1, openT: 3, phase2: 0.5, traps: [{ zone: [150, 210], plate: 40 }, { zone: [430, 490], plate: 600 }], keep: 36, back: 3, patience: 2.5,   // she scuttles back to the far end to charge
  chain: ['charge', 'spit', 'swarm', 'charge', 'burrow'],
  attacks: {
    charge: { mark: 'X', tell: 0.8, act: 1.1, range: [160, 640], start: (B, w) => { B.data.dir = Math.sign(w.px - B.x) || 1; B.data.stopAt = w.px; }, move: (B, w, dt) => { const nx = B.x + B.data.dir * 300 * dt; if ((B.data.stopAt - nx) * B.data.dir < 0) B.t = 0; else B.x = clampX(nx); }, each: true, hit: B => ({ box: at(B.x, 20, 30) }) },
    spit: { mark: '!', tell: 0.6, act: 0.3, range: [40, 400], hit: (B, w) => ({ box: at(w.px, 18, 50) }) },
    swarm: { mark: '!', tell: 0.7, act: 0.6, hit: B => ({ box: front(B, 220, 10) }) },
    burrow: { mark: 'X', tell: 0.9, act: 0.8, hideTell: true, hidden: true, start: (B, w) => { B.data.mark = w.px; }, hit: B => ({ box: at(B.data.mark, 18, 40) }), end: B => { B.x = clampX(B.data.mark); } },
  },
  rule: (B, w) => w.plate != null && SCARAB_MOTHER.traps.some(t => t.plate === w.plate && B.x >= t.zone[0] && B.x <= t.zone[1]),
};
// ================= THE MINIS =================
/* THE GLASS STALKER (level 4): its STING at you; the crossing's glass overhangs (x 200-260, 420-480): a sting that lands on you while
   you are under one strikes the glass instead and sticks - THE OPENING. */
export const STALKER = { name: 'THE GLASS STALKER', hp: 400, speed: 44, cd: 1.0, openT: 3, overhangs: [[200, 260], [420, 480]],
  chain: ['claw', 'sting', 'tail'],
  attacks: {
    claw: { mark: '!', tell: 0.5, act: 0.2, range: [0, 50], hit: B => ({ box: front(B, 44) }) },
    sting: { mark: 'X', tell: 0.8, act: 0.3, range: [0, 140], start: (B, w) => { B.data.mark = w.px; }, hit: B => { const o = STALKER.overhangs.find(([a, b]) => B.data.mark >= a && B.data.mark <= b); B.data.stuck = !!o; return o ? null : { box: at(B.data.mark, 14, 40) }; } },
    tail: { mark: 'X', tell: 0.6, act: 0.3, range: [0, 70], hit: B => ({ box: at(B.x, 64, 12) }) },
  },
  rule: B => { if (!B.data.stuck) return false; B.data.stuck = false; return true; },
};
/* THE SAND WARDEN (level 5): lure it into the gate's HOURGLASS ROOM (x 480-600, off to one side of the gate) as it fills (hisses at 5 s, fills 6-10 s of every 10): in it when the
   sand reaches its knees (a fifth full) - pinned - THE OPENING. w: { sand: 0..1, how full the room is } */
const inRoom = x => x >= 480 && x <= 600;
export const SAND_WARDEN = { name: 'THE SAND WARDEN', hp: 450, speed: 34, cd: 1.1, openT: 3, room: [480, 600], guard: 0.35,   // packed sand and brass: it shrugs off most of a blow
  chain: ['slam', 'halberd', 'throw'],
  attacks: {
    slam: { mark: '!', tell: 0.6, act: 0.3, range: [0, 54], hit: B => ({ box: front(B, 50) }) },
    halberd: { mark: 'X', tell: 0.7, act: 0.3, range: [0, 80], move: (B, w, dt) => { B.x = clampX(B.x + B.face * 120 * dt); }, hit: B => ({ box: at(B.x, 72, 12) }) },   // it lunges with it
    throw: { mark: '!', tell: 0.55, act: 0.3, range: [50, 400], hit: (B, w) => ({ box: at(w.px, 20, 40) }) },
  },
  // it knows the room: it will not walk in while the sand hisses; its halberd's LUNGE will carry it in
  blocked: (B, w, nx) => (w.hiss || w.sand > 0) && !inRoom(B.x) && inRoom(nx),
  rule: (B, w) => w.sand > 0.2 && B.x >= SAND_WARDEN.room[0] && B.x <= SAND_WARDEN.room[1],
};
/* THE EMBALMER (level 6): his HOOK at you; the hall's shelves of jars (x 220, 420): a hook whose line meets a shelf before you breaks the
   jars over him - blinded - THE OPENING. */
export const EMBALMER = { name: 'THE EMBALMER', hp: 450, speed: 26, cd: 1.1, openT: 3, shelves: [220, 420],
  chain: ['hook', 'jar', 'wrap'],
  attacks: {
    hook: { mark: '!', tell: 0.65, act: 0.3, range: [40, 300], start: (B, w) => { B.data.hx = w.px; }, hit: B => { const s = EMBALMER.shelves.find(sx => (sx - B.x) * (B.data.hx - sx) > 0); B.data.broke = s !== undefined; return s !== undefined ? null : { box: front(B, Math.abs(B.data.hx - B.x) + 20, 30, 8) }; } },
    jar: { mark: 'X', tell: 0.75, act: 0.3, start: (B, w) => { B.data.mark = w.px; }, hit: B => ({ box: at(B.data.mark, 22, 30) }) },
    wrap: { mark: 'X', tell: 0.7, act: 0.4, range: [0, 60], hit: B => ({ box: front(B, 56, 40) }) },
  },
  rule: B => { if (!B.data.broke) return false; B.data.broke = false; return true; },
};
export const BOSSES = { BANDIT_KING, ROC, COLOSSUS, HIGH_PRIEST, HOURGLASS_KING, SCARAB_MOTHER, STALKER, SAND_WARDEN, EMBALMER };
