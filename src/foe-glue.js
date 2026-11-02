// src/foe-glue.js - PACK GLUE: THE MOVES THAT MAKE A MIXED PACK ONE PACK (claude/lategameb, Daniel 10-31: "foes harder by act via smarter / mixed packs,
// not HP", and the 18:53 moveset audit: "THIN FOES - add moves, folded into late-game lane B"; scratch/moveset-audit-1031.md top-8 items 1-3).
//
// Acts III-V are 87% / 63% / 37% one-verb foes: the sea is act I with bigger numbers. The fix is not a bigger blow, it is a foe that does something
// BECAUSE of the foe beside it. Every move here is a reaction to a packmate, every one is TOLD (a word over it, a drawn guard, a drawn line), none
// is a new health pool, and each ends in an opening. Pure logic on the foe's own fields; main.js hands it the world (api) and calls four hooks
// (frame, hold, turns, take) beside the combat pass's RX hooks. tools/foe-glue.mjs drives all of it against a stub world.
//
//   PLATE STEP   (act III) a TIDEGUARD beside a winding SCOUT / NETTER, with the hero closing, steps in front of it and PLANTS its coral plate for GLUE.plate.hold s:
//                the front turns every light cut AND the skill that is thrown at it (GO ROUND, plunge it, or break it with a heavy blow) - then a short
//                recovery with the plate down. "Cross behind or plunge."
//   BRACE        (act V, and from act IV for the archers' shield) a SHIELD with an ARCHER / SLINGER drawing behind it, hero in front, plants its shield in place
//                (full front guard, GLUE.brace.hold s, same rule: a heavy blow breaks it, a sweep goes under, behind it there is none) - the ONE act-V front kind
//                now covers a bow. It is also the AoE-resistant front the brief asks for: whirlwind and rain of spears do not clear a braced pack.
//   RECALL LINE  (any act) a SCOUT's harpoon that MISSED (it stuck in the ground / a wall / was rolled) is not spent: a taut line is drawn from the scout to it
//                (a yellow !), and GLUE.recall.delay s later the line HAULS it back through where it stands. Roll the first throw and the second beat
//                catches the lazy step; stand behind a shield and it is turned like the first.
//   HOLD FIRE    a SCOUT with a tideguard beside it throws only once that tideguard is ON the hero (the pack is front, then back) - never for more than
//                GLUE.holdFire.max s, then it throws anyway.
//   PIN SHOT     (act IV+) an ARCHER whose arrow was ROLLED does not wait out its whole rest: it nocks again at once and looses at the roll's destination
//                (a full lead, GLUE.pin.lead) - the anti-dodge. Its draw is told as ever; the answer is the shield, or not rolling a straight line.
// The act gates (api.act()) keep acts I-II as they were.

export const GLUE = {
  plate: { minAct: 3, see: 220, reach: 130, gap: 22, speed: 96, step: 0.45, hold: 1.2, rec: 0.55, cd: 4.5, partners: ['scout', 'netter', 'marine'], near: 80 },
  brace: { minAct: 5, see: 230, reach: 110, hold: 1.4, rec: 0.6, cd: 3.6, shooters: ['archer', 'slinger', 'crossbow', 'bonearcher'], need: 0.2 },
  recall: { delay: 0.5, speed: 215, maxD: 280, minD: 28, cd: 2.5, hitR: 28, owners: ['scout'] },
  holdFire: { friend: 240, engaged: 90, max: 3.5, owners: ['scout'], fronts: ['tideguard', 'watch', 'bellguard'] },
  pin: { minAct: 4, window: 0.75, cd: 4.5, lead: 1.0, owners: ['archer', 'bonearcher', 'crossbow'] },
};
export const WORDS = ['PLATE STEP', 'BRACED', 'RECALL', 'PIN SHOT', 'GUARD BROKEN'];   /* main.js MOVE_WORDS: a capital word is drawn only when it is one */
export const COL = { plate: '#e8a89c', brace: '#c9d1dc', line: '#ffd36b' };

const sign = v => (v < 0 ? -1 : 1);
const live = e => !!(e && e.alive && !e.elite && !e.maxHp && !e.mini && !e.xpRole && !e.big && !e.harmless);
/* free of every other hold: a stance is only ever started from plain standing about, and is dropped the moment anything else has the foe */
const free = e => !(e.stagger > 0) && !(e.broken > 0) && !(e.knock > 0) && !(e.pinned > 0) && !(e.carried > 0) && !e.tokHeld && !(e.rxGuard > 0) && !(e.rxBack > 0) && !e.glS;
const calm = e => e.mode === 'walk' || e.mode === undefined || e.mode === 'watch';
export const nearestHero = (heroes, e) => { let b = null, bd = 1e9; for (const h of heroes || []) { if (!h || h.dead) continue; const d = Math.abs(h.x - e.x); if (d < bd) { bd = d; b = h; } } return b; };

/* A PACKMATE IS BUSY: winding a ranged throw / draw / sling */
export function shooterBusy(f) {
  if (!f || !f.alive) return false;
  if (f.t === 'scout') return f.mode === 'aim' || f.mode === 'throw';
  if (f.t === 'netter') return f.mode === 'castTell';
  if (f.t === 'archer' || f.t === 'bonearcher' || f.t === 'crossbow') return (f.draw || 0) > GLUE.brace.need;
  if (f.t === 'slinger') return f.mode === 'slingTell';
  if (f.t === 'marine') return typeof f.mode === 'string' && /Tell$|^aim$/.test(f.mode);
  return false;
}

/* STANCE ------------------------------------------------------------------------------------------------------------------------------ */
/* start it: kind 'plate' (steps to tx, then holds) or 'brace' (holds where it stands) */
function begin(e, kind, hero, tx, api) {
  const C = GLUE[kind]; e.glS = { kind, ph: kind === 'plate' && Math.abs(tx - e.x) > 4 ? 'step' : 'hold', t: kind === 'plate' ? C.step : C.hold, tx, face: sign(hero.x - e.x) };
  if (e.glS.ph === 'hold') e.glS.t = C.hold;
  e.face = e.glS.face; e.glN = (e.glN || 0) + 1; api.say(e, kind === 'plate' ? 'PLATE STEP' : 'BRACED', COL[kind]); if (api.sfx) api.sfx(kind === 'plate' ? 'clank' : 'shieldScrape');
}
const endStance = (e, cd) => { const k = e.glS && e.glS.kind; e.glS = null; e.glCd = cd !== undefined ? cd : (k ? GLUE[k].cd : 2); e.glClank = 0; };
/* the planted guard is UP (and only then): a cut off its front is turned */
export const guarding = e => !!(e && e.glS && e.glS.ph === 'hold');

/* ONE FRAME of the stance. True: it has the body this frame (main.js skips the foe's own AI; it still falls) */
export function hold(e, hero, dt, api) {
  const S = e.glS; if (e.glCd > 0) e.glCd -= dt; if (e.glClank > 0) e.glClank -= dt;
  if (!S) return false;
  if (!e.alive || e.stagger > 0.25 || e.broken > 0 || e.knock > 0 || e.pinned > 0 || e.carried > 0 || e.tokHeld) { endStance(e, GLUE[S.kind].cd * 0.6); return false; }   /* knocked out of it */
  const C = GLUE[S.kind]; S.t -= dt;
  e.vy = Math.min(320, (e.vy || 0) + 1000 * dt); const r = api.fall(e, e.vy * dt); if (r && r.ground) e.vy = 0;
  if (hero) { const want = sign(hero.x - e.x); if (S.ph !== 'rec') { S.face = want; e.face = want; } else e.face = S.face; }
  if (S.ph === 'step') {
    const dx = S.tx - e.x, dir = sign(dx);
    if (Math.abs(dx) < 3 || S.t <= 0) { S.ph = 'hold'; S.t = C.hold; e.vx = 0; if (api.sfx) api.sfx('clank'); }
    else if (!api.safeStep(e.x + dir * ((e.w || 10) / 2 + 3), e.y)) { endStance(e, C.cd * 0.5); e.vx = 0; return false; }   /* a ledge or the spikes between: no step */
    else { e.vx = dir * C.speed; api.move(e, e.vx * dt); }
    return true;
  }
  e.vx = 0;
  if (S.ph === 'hold') { if (S.t <= 0) { S.ph = 'rec'; S.t = C.rec; } return true; }
  if (S.ph === 'rec') { if (S.t <= 0) endStance(e); return true; }
  endStance(e); return false;
}
/* A CUT OFF ITS FRONT (main.js, the melee hit loop): true = turned. A heavy blow breaks the stance (it reels), a sweep never reaches here as `front`. */
export function turns(e, heavy, front, api) {
  if (!guarding(e) || !front) return false;
  if (heavy) { e.glS.ph = 'rec'; e.glS.t = GLUE[e.glS.kind].rec * 1.6; e.stagger = Math.max(e.stagger || 0, 0.55); e.glBroke = (e.glBroke || 0) + 1; if (api && api.say) api.say(e, 'GUARD BROKEN', COL[e.glS.kind]); return false; }
  e.glClank = 0.14; e.glTurned = (e.glTurned || 0) + 1; return true;
}
/* A SKILL / PROJECTILE / AoE THAT REACHES THE FRONT (hurtEnemy0): what is left of it. A heavy, a plunge or a sweep goes through at whole. */
export function take(e, dmg, fromX, whole) {
  if (!guarding(e) || !(dmg > 0) || whole) return dmg;
  if (sign(fromX - e.x) !== e.glS.face) return dmg;   /* from behind: there is no plate there */
  e.glClank = 0.14; e.glTurned = (e.glTurned || 0) + 1;
  return Math.max(1, Math.round(dmg * 0.2));
}

/* STARTERS (once a frame, from frame()) ------------------------------------------------------------------------------------------------- */
function tryPlate(e, hero, enemies, act, api) {
  const C = GLUE.plate; if (act < C.minAct || e.t !== 'tideguard' || !live(e) || !free(e) || !calm(e) || e.glCd > 0 || !hero || hero.dead) return;
  if (Math.abs(hero.y - e.y) > 40 || Math.abs(hero.x - e.x) > C.see) return;
  let best = null, bd = 1e9;
  for (const f of enemies) { if (f === e || !live(f) || !C.partners.includes(f.t) || Math.abs(f.x - e.x) > C.reach + 20 || Math.abs(f.y - e.y) > 40) continue;
    const threat = shooterBusy(f) || Math.abs(hero.x - f.x) < C.near;   /* it is winding, or the hero is on top of it */
    if (!threat) continue; const side = sign(hero.x - f.x), tx = f.x + side * C.gap;
    if (sign(hero.x - tx) !== side) continue;   /* the hero is already past the spot */
    if (Math.abs(hero.x - f.x) < C.gap + 6) continue;   /* nothing to step into */
    const d = Math.abs(e.x - tx); if (d <= C.reach && d < bd) { bd = d; best = { tx, f }; } }
  if (best) { begin(e, 'plate', hero, best.tx, api); if (e.glS.ph === 'step' && !api.safeStep(e.x + sign(best.tx - e.x) * ((e.w || 10) / 2 + 3), e.y)) { e.glS = null; e.glCd = C.cd * 0.5; } }
}
function tryBrace(e, hero, enemies, act, api) {
  const C = GLUE.brace; if (act < C.minAct || e.t !== 'shield' || !live(e) || !free(e) || !calm(e) || e.glCd > 0 || !hero || hero.dead) return;
  if (Math.abs(hero.y - e.y) > 40 || Math.abs(hero.x - e.x) > C.see || Math.abs(hero.x - e.x) < 18) return;
  for (const f of enemies) { if (f === e || !live(f) || !C.shooters.includes(f.t) || !shooterBusy(f) || Math.abs(f.x - e.x) > C.reach || Math.abs(f.y - e.y) > 40) continue;
    if (sign(e.x - f.x) !== sign(hero.x - e.x)) continue;   /* the shield stands between the bow and the hero (archer, shield, hero in a line) */
    begin(e, 'brace', hero, e.x, api); return; }
}

/* THE RECALL LINE ---------------------------------------------------------------------------------------------------------------------- */
export const RECALLS = [];     /* the lines in flight: { x, y, owner, t } */
const TRACK = new Map();       /* a scout's harpoon seed -> its last place */
export const reset = () => { RECALLS.length = 0; TRACK.clear(); };
function trackHarpoons(seeds, heroes, dt, api) {
  const C = GLUE.recall, alive = new Set(seeds);
  for (const s of seeds) if (!s.dead && s.jav && s.owner && C.owners.includes(s.owner.t) && !s.glRecall && !s.reflected && !TRACK.has(s)) TRACK.set(s, { x: s.x, y: s.y, o: s.owner });
  for (const [s, r] of TRACK) {
    if (!s.dead && alive.has(s) && !s.reflected) { r.x = s.x; r.y = s.y; continue; }
    TRACK.delete(s); if (s.reflected || s.glRecall) continue;
    const o = r.o; if (!o || !o.alive || o.stagger > 0.3 || o.broken > 0 || (o.glRecallCd > 0)) continue;
    const hit = (heroes || []).some(h => h && !h.dead && Math.hypot(h.x - r.x, (h.y - 10) - r.y) <= C.hitR);   /* it struck (or was parried) at the hero: nothing to haul back */
    const dist = Math.hypot(o.x - r.x, (o.y - 12) - r.y);
    if (hit || dist < C.minD || dist > C.maxD) continue;
    o.glRecallCd = C.cd; RECALLS.push({ x: r.x, y: r.y, o, t: C.delay }); if (api.say) api.say({ x: r.x, y: r.y + 10, h: 16 }, '!', COL.line); if (api.sfx) api.sfx('ropeHaul');
  }
  for (let i = RECALLS.length - 1; i >= 0; i--) {
    const q = RECALLS[i]; q.t -= dt;
    if (!q.o.alive || q.o.stagger > 0.3 || q.o.broken > 0) { RECALLS.splice(i, 1); continue; }   /* kill it, or stagger it, and the line goes slack */
    if (q.t > 0) continue;
    const sx = q.x, sy = q.y, tx = q.o.x, ty = q.o.y - 12, d = Math.hypot(tx - sx, ty - sy) || 1, v = C.speed;
    api.seed({ x: sx, y: sy, vx: (tx - sx) / d * v, vy: (ty - sy) / d * v, g: 0, life: d / v + 0.15, dead: false, arrow: true, jav: true, glRecall: true, owner: q.o });
    if (api.say) api.say({ x: sx, y: sy - 4, h: 16 }, 'RECALL', COL.line); if (api.sfx) api.sfx('throwWhoosh');
    RECALLS.splice(i, 1);
  }
}

/* HOLD FIRE: the scout throws behind its front ---------------------------------------------------------------------------------------- */
function holdFire(e, hero, enemies, dt) {
  const C = GLUE.holdFire; if (!C.owners.includes(e.t) || !live(e) || !hero || hero.dead) return;
  if (e.mode === 'aim' || e.mode === 'throw' || e.mode === 'fade' || e.mode === 'appear') { e.glHold = 0; return; }
  let front = null, engaged = false;
  for (const f of enemies) { if (f === e || !live(f) || !C.fronts.includes(f.t) || Math.abs(f.x - e.x) > C.friend || Math.abs(f.y - e.y) > 50) continue; front = f; if (Math.abs(f.x - hero.x) < C.engaged && Math.abs(f.y - hero.y) < 40) engaged = true; }
  if (!front || engaged) { e.glHold = 0; return; }
  if (e.cd < 0.15 && (e.glHold = (e.glHold || 0) + dt) < C.max) e.cd = 0.15;   /* wait: its front is not on him yet */
}

/* PIN SHOT: the archer's second arrow ------------------------------------------------------------------------------------------------- */
function pinShot(e, hero, act, time, api) {
  const C = GLUE.pin; if (act < C.minAct || !C.owners.includes(e.t) || !live(e)) return;
  if (!(e.loose > 0)) { e.glLoose = false; return; }
  if (!e.glLoose) { e.glLoose = true; e.glLooseAt = time; e.glRolled = false; }
  if (e.glRolled || e.glPinCd > time || !hero || hero.dead || e.glPin) return;
  if (time - e.glLooseAt > C.window) return;
  if (hero.dodge > 0) { e.glRolled = true; e.glPin = true; e.glPinCd = time + C.cd; e.timer = Math.min(e.timer ?? 0, 0.05); api.say(e, 'PIN SHOT', COL.line); }
}
/* the archer's loose reads this: a full lead on the shot that follows a rolled one (and clears it) */
export function pinLead(e) { if (!e || !e.glPin) return 0; e.glPin = false; return GLUE.pin.lead; }

/* ONE CALL A FRAME, BEFORE THE FOES THINK ----------------------------------------------------------------------------------------------- */
export function frame(ctx) {
  const { heroes, enemies, seeds, dt, time, api } = ctx, act = api.act ? api.act() : 1;
  trackHarpoons(seeds, heroes, dt, api);
  for (const e of enemies) {
    if (!e.alive) { if (e.glS) e.glS = null; continue; }
    const hero = nearestHero(heroes, e);
    if (e.t === 'tideguard') tryPlate(e, hero, enemies, act, api);
    else if (e.t === 'shield') tryBrace(e, hero, enemies, act, api);
    else if (e.t === 'scout') holdFire(e, hero, enemies, dt);
    else if (e.t === 'archer' || e.t === 'bonearcher' || e.t === 'crossbow') pinShot(e, hero, act, time, api);
  }
}

/* DRAWN: the planted guard, the clank, and the taut line (world space; cx, cy the camera) -------------------------------------------------------- */
export function draw(g, e, cx, cy, time) {
  if (!e.alive || !e.glS) return; const S = e.glS; if (S.ph === 'step') return;
  const w = e.w || 10, h = e.h || 16, f = S.face || e.face || 1, x = Math.round(e.x + f * (w / 2 + 3) - cx), y = Math.round(e.y - h - cy), col = COL[S.kind];
  if (S.ph === 'hold') {   /* THE PLATE / THE SHIELD, planted: a tall bar of its colour in front, the edge white on a turned cut */
    g.fillStyle = 'rgba(12,10,20,0.8)'; g.fillRect(x - 2, y, 5, Math.round(h * 0.95) + 2);
    g.fillStyle = e.glClank > 0 ? '#fff6e0' : col; g.fillRect(x - 1, y + 1, 3, Math.round(h * 0.95));
    g.fillStyle = '#fff6e0'; g.fillRect(x - 1 - (f < 0 ? 0 : 2), y + 1, 3, 1);
    g.fillStyle = col; g.fillRect(Math.round(e.x - f * 2 - cx) - 2, Math.round(e.y - cy), 5, 1);   /* the foot dug in */
  } else if (S.ph === 'rec') { g.fillStyle = col; g.globalAlpha = 0.5; g.fillRect(x - 1, y + Math.round(h * 0.55), 3, Math.round(h * 0.4)); g.globalAlpha = 1; }   /* the plate lowered: OPEN */
}
export function drawLines(g, cx, cy, time) {
  for (const q of RECALLS) { const o = q.o, k = 1 - Math.max(0, q.t) / GLUE.recall.delay, blink = Math.floor(time * 14) % 2, x0 = o.x + (o.face || 1) * 5, y0 = o.y - 12, x1 = q.x, y1 = q.y;
    g.fillStyle = blink ? COL.line : '#fff6e0'; const n = 14;
    for (let i = 1; i < n; i++) { const t = i / n, sag = Math.sin(t * Math.PI) * 3 * (1 - k); g.fillRect(Math.round(x0 + (x1 - x0) * t - cx), Math.round(y0 + (y1 - y0) * t + sag - cy), 1, 1); }
    g.fillRect(Math.round(x1 - cx) - 1, Math.round(y1 - cy) - 3, 3, 6); }
}
