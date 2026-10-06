// gate-gargoyle.js — THE GATE GARGOYLE, the Witchlight Stair's boss (2026-09-22). Brief: .claude/briefs/witchlight-redesign.md,
// reworked 2026-09-25 (docs/briefs/gargoyle-rework.md) and AGAIN 2026-09-27 (Daniel's design, round three: docs/briefs/gargoyle-spikes.md).
// A huge stone gargoyle bolted over the tower's outer gate, woken by the loose magic. He is fought on the stair's top: MANY FLOATING
// SLABS in two tiers over A FLOOR OF SPIKES. His art: src/redraw/queue_bosses.js (bakeGateGargoyle, drawn at GARG.K = 1.5):
// 0 perched | 1,2 fly | 3 dive tell | 4 dive | 5 fireball tell | 6 fireball | 7 breath tell | 8 breath | 9 shriek | 10 STUNNED | 11 CRASH.
// Daniel's playtest, 2026-09-28 (work/claude/lane-done/claude-gargoyle4.md): the fire breath SLOWED (a longer tell, a longer set line,
// a jet that runs out along the line instead of being there at once); the wing gust REPLACED by one slow fireball; his flying SLOWED
// (GARG.fly caps it); and ONE whelp of his at a time (GARG.whelps). Round five (claude/gargoyle5, same playtest): his fireballs are TWO,
// one throw after the other; the breath is DRAWN as flickering flame (drawFlame: its timing, hitbox and tell are untouched); and the
// fireball has its own pose, jaws lit.
//   THE STONE DIVE   ✕  he rises out of sight and his shadow finds the slab you stand on; he comes down on it. He follows you from
//                        slab to slab while he is up there - the aim is his until he drops. No shield turns it: be elsewhere.
//   THE FIRE BREATH  !  he hangs off to one side of you, rears back and his throat lights; a dotted line shows where the jet will go,
//                        following you until the last quarter-second, when it LOCKS (it goes solid). Then a jet of fire along it. Step
//                        off the line - up a tier, down a tier, or behind a slab (a slab stops the jet) - or take it on a shield.
//                        The jet RUNS OUT along the line from his mouth (GARG.breath.travel), so a late step still gets you off it.
//                        In phase two the jet SWEEPS after you as it burns (slowly).
//   THE FIREBALLS    !  he rears back and fire gathers, glowing, in his jaws; then a slow fireball, aimed where you are as it
//                        leaves him - and a beat later the fire gathers again and a SECOND one, aimed afresh (TWO, thrown one at a
//                        time: Daniel, 2026-09-28, claude/gargoyle5 - the common gargoyles' is single). Step off its path, jump it,
//                        or take it on a shield; a slab or stone in its way breaks it. His pose for it: frames 5-6, jaws lit.
//   THE GLYPH FLARE  ✕  (no damage) a glyph lights under the slab you stand on: still on it when it goes, and you fall UP onto its
//                        underside for three seconds - and he likes to dive on that slab while you hang there.
//   THE PERCH SHRIEK    back to the gate; a GARGOYLE WHELP comes out of the tower's cornices - ONE of his at a time: while it lives he
//                        does not shriek, he picks another attack. Stone on its face until it swoops (src/gargoyle-whelp.js). Like
//                        him, it breaks only by a stomp on the spikes.
// HE IS STONE (Daniel, 2026-09-27: "INVULNERABLE except then"): no blade, shot, spell or burn takes anything off him (gargTake). THE
// OPENING IS YOURS: be on the slab his shadow finds and leave it LATE - after he has dropped - and nothing takes his weight: HE SMASHES
// THROUGH IT (the crack runs across it first) and CRASHES DOWN ONTO THE SPIKES, where he lies STUNNED for GARG.stun seconds. Then, and
// only then, JUMP ON HIM: a STOMP takes a fifth of him (GARG.stomps to kill), and THE WINDS carry you back up to a slab while he tears
// himself off the spikes and goes back up (he RESETS: untouchable, up over the slabs, and round again). Still on the slab when he lands
// and it is you he lands on. A broken slab grows back in a few seconds (GARG.regrow, a little slower in phase two) and never fewer than
// GARG.minLive stand. Fall onto the spikes and they take one bite and the winds bring you back (src/spike-winds.js).
// PHASE TWO (half his health): his fire SWEEPS after you, the moving slabs drift faster, dives come in pairs, every flare comes with a
// fireball. Touching him never hurts (the touch rule).
export const GARG = {
  hp: 410, stomps: 6,   /* (claude/bosswave2: 5 -> 6 with the rune column, a second way onto the spikes - the human bot was 86% at 5 before it) */ cd: 1.35, cdP2: 0.95,
  K: 1.5, w: 45, h: 45,                       /* HALF AS BIG AGAIN (he was 30): every read of his size below goes through K */
  tell: { dive: 0.95, fireball: 1.1, breath: 1.5, flare: 0.9 }, tellP2: 0.82, tellP2Not: ['breath'],   /* (2026-09-28: the breath's tell was 0.95, and 0.78 in phase two; it is 1.5 in both) */
  dmg: { dive: 22, fireball: 13, breath: 15, crash: 15 },   /* (claude/sweep3: 18 / 10 / 12 / 12 - the standard bot won 9/12 at L28; band 50-60%) */
  diveV: 430, diveUp: 150, land: 1.1, recover: 0.9, rise: 0.55, reset: 1.4,
  smashAny: true, smashT: 0.24, crashG: 1500, stun: 3.5,
  /* HIS FLYING (Daniel, 2026-09-28: "he moves too quickly"): he eased toward where he wanted to be at a rate that grew with the distance, so a
     side-swap or a hop of yours had him streak 200-300 px/s. Now the ease is gentler and CAPPED: px/s while he hovers and repositions, while he
     sets up a breath or a fireball, and while he climbs back up. The dive itself (diveV, and his climb out of sight before it) is untouched. */
  fly: 90, flyTell: 120, flyUp: 150, ease: 1.6,
  /* THE FIREBALL (in the wing gust's place, 2026-09-28): px/s, radius, seconds it lives, the recoil after it leaves him; and (Daniel,
     2026-09-28, claude/gargoyle5) HIS ARE TWO: `n` balls, thrown one at a time, each told - the second's glow gathers for `again` s
     after the first's recoil, so the throws come throwT + again = 1.15 s apart (about 100 px apart at 90 px/s) */
  ball: { v: 90, r: 6, life: 4.5, throwT: 0.45, n: 2, again: 0.7 },
  /* the jet: seconds, px long, px either side of its line, the locked last part of the tell, rad/s it chases you in phase two, and px/s its
     front runs out along the line (2026-09-28: T 0.85 -> 1.4, lock 0.25 -> 0.5, sweep 0.75 -> 0.4, and the front was the whole line at once) */
  breath: { T: 1.4, reach: 210, w: 10, lock: 0.5, sweep: 0.4, travel: 260 },
  flareT: 3.0, whelps: 1, shriekEvery: 13, regrow: 4, regrowP2: 5.5, minLive: 6, slabP2: 1.6,   /* whelps: ONE of his alive at a time (it was three) */
  hoverUp: 60, hoverDX: 52, high: 64,
};
/* a STOMP takes this much: GARG.stomps of them and he is broken, whoever you are */
GARG.stompDmg = Math.ceil(GARG.hp / GARG.stomps);
const K = GARG.K;
const TELL = { dive: 'diveTell', fireball: 'fireballTell', breath: 'breathTell', flare: 'flareTell' };
const SAY = { diveTell: 'THE STONE DIVE', fireballTell: 'THE FIREBALL', breathTell: 'FIRE: OFF THE LINE', flareTell: 'THE GLYPH FLARE: GET OFF THAT SLAB' };
/* HIS OPENING: stunned on the spikes, and only a stomp reaches him there */
export const gargOpen = e => e.mode === 'stunned';
/* the frames of bakeGateGargoyle */
export function gargFrame(e) {
  const fly = 1 + Math.floor((e.anim || 0) * 8) % 2;
  switch (e.mode) {
    case 'sleep': case 'wake': case 'land': return 0; case 'diveTell': return 3; case 'dive': return 4; case 'smash': case 'crash': return 11;
    case 'fireballTell': return 5; case 'fireball': return 6; case 'breathTell': return 7; case 'breath': return 8;
    case 'flareTell': case 'shriek': return 9; case 'stunned': return 10;
  }
  return fly;
}
/* HIS HEALTH: STONE. Nothing but a stomp while he lies stunned on the spikes takes anything off him - main.js sets e.stompNow to the
   stomp's damage for the one call that is the stomp (a burn, a bleed, a shot or a blade all come through here as 0) */
export function gargTake(e, dmg) { return e.stompNow > 0 && gargOpen(e) ? e.stompNow : 0; }
/* WHICH SLABS GIVE under a dive that finds nobody: every one, or (smashAny false) only the cracked ones */
export const gargGives = m => !!m && !m.broken && (GARG.smashAny || !!m.cracked);
/* HOW LONG A BROKEN SLAB STAYS GONE */
export const gargRegrowT = e => (e && e.phase === 2 ? GARG.regrowP2 : GARG.regrow);
/* NEVER FEWER THAN minLive: after a break, the slab nearest to coming back comes back now. Returns the slab it brought back, or null. */
export function gargKeepFooting(slabs) { const live = slabs.filter(m => !m.broken).length; if (live >= GARG.minLive) return null;
  const m = slabs.filter(q => q.broken).sort((a, b) => (a.brokenT || 0) - (b.brokenT || 0))[0]; if (m) { m.broken = false; m.brokenT = 0; } return m || null; }
/* THE STOMP LANDED (main.js has taken the health): he tears himself off the spikes and goes back up, untouchable, and the fight
   goes round again. Returns what to say. */
export function gargStomped(e) { e.mode = 'reset'; e.modeT = GARG.reset; e.open = 0; e.cd = Math.max(e.cd || 0, 0.8); e.queue = []; e.paired = false; e.stomped = (e.stomped || 0) + 1; return 'STOMPED'; }
/* THE CAMERA FRAMES HIM AND YOU TOGETHER (Daniel: "much further zoomed out"): the point between you, weighted to you, never letting
   you out of the frame; and low enough that the spiked floor - where he lies when he is open - is in it while you are over it.
   Returns the view's top-left target; the engine eases towards it. */
export function gargCam(P, e, A, VW, VH) {
  const mx = e ? P.x * 0.6 + e.x * 0.4 : P.x, my = e ? P.y * 0.65 + (e.y - (e.h || GARG.h) * 0.5) * 0.35 : P.y;
  let tx = mx - VW / 2; tx = Math.max(P.x - VW + 48, Math.min(P.x - 48, tx));
  let ty = my - VH * 0.5; ty = Math.max(ty, A.floor + 20 - VH);                     /* never below the floor's own edge... */
  ty = Math.min(ty, A.floor + 6 - VH + Math.max(0, VH - (A.floor - P.y) - 60));     /* ...and the floor kept in the frame while you are over it */
  ty = Math.max(P.y - VH + 16, Math.min(P.y - 40, ty));                             /* and you, always */
  return [tx, ty];
}
/* THE FIRE BREATH'S LINE: from his mouth along `a`, stopped by the first slab or stone it meets - returns [x0, y0, x1, y1, len] */
export function breathLine(e, a, c) {
  const mx = e.x + (e.face || 1) * 14 * K, my = e.y - 18 * K, dx = Math.cos(a), dy = Math.sin(a), slabs = c.slabs || [];
  let d = 0; for (; d < GARG.breath.reach; d += 4) { const x = mx + dx * d, y = my + dy * d;
    if (d > 12 && (slabs.some(m => !m.broken && x > m.x && x < m.x + m.w && y > m.y && y < m.y + (m.h || 8)) || (c.solid && c.solid(x, y)))) break; }
  return [mx, my, mx + dx * d, my + dy * d, d];
}
/* is a point within the jet: its distance from the line segment */
export function inBreath(L4, x, y) { const [x0, y0, x1, y1] = L4, vx = x1 - x0, vy = y1 - y0, n = vx * vx + vy * vy || 1, t = Math.max(0, Math.min(1, ((x - x0) * vx + (y - y0) * vy) / n));
  return Math.hypot(x - (x0 + vx * t), y - (y0 + vy * t)) <= GARG.breath.w; }
/* THE JET SO FAR: the line cut to where its front has run in `t` seconds of burning */
export function jetSoFar(L5, t) { const [x0, y0, x1, y1, len] = L5, f = Math.min(len, Math.max(0, t) * GARG.breath.travel), k = len > 0 ? f / len : 0;
  return [x0, y0, x0 + (x1 - x0) * k, y0 + (y1 - y0) * k, f]; }
/* THE FIREBALLS: where his jaws are, and his balls on their way (e.balls - two to a volley since claude/gargoyle5, thrown one at a time).
   Each flies straight, slowly; a live slab or stone in its way breaks it, and so does the end of its life; on you it is a blow a shield
   takes (c.hit, not hard). stepBall returns what happened to each ball this frame. */
export const mouth = e => [e.x + (e.face || 1) * 14 * K, e.y - 18 * K];
function stepOne(e, b, dt, c, sp) {
  const P = c.P, B = sp || GARG.ball, gone = () => { e.balls = e.balls.filter(q => q !== b); };
  b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt; b.t = (b.t || 0) + dt;
  const inSlab = (c.slabs || []).some(m => !m.broken && b.x > m.x - B.r * 0.5 && b.x < m.x + m.w + B.r * 0.5 && b.y > m.y - B.r * 0.5 && b.y < m.y + (m.h || 8) + B.r * 0.5);
  if (inSlab || (c.solid && c.solid(b.x, b.y)) || b.life <= 0) { gone(); if (c.pop) c.pop(b.x, b.y, inSlab ? 'slab' : 'stone'); return inSlab ? 'slab' : b.life <= 0 ? 'spent' : 'stone'; }
  if (P && !P.dead && !P.windRide && Math.abs(P.x - b.x) < 6 + B.r && b.y > P.y - (P.h || 18) - B.r && b.y < P.y + B.r) {
    const r = c.hit(b.x, sp ? sp.dmg : GARG.dmg.fireball, false, 'THE FIREBALL');
    if (r === false) return 'flying';   /* rolled through it (a dodge's i-frames): it flies on */
    gone(); if (c.pop) c.pop(b.x, b.y, r === 'blocked' ? 'shield' : 'you'); if (r === 'blocked' && c.say) c.say('THE SHIELD TAKES THE FIREBALL', false, true); return r === 'blocked' ? 'blocked' : 'hit'; }
  return 'flying';
}
/* sp (optional): another thrower's ball - { r, dmg } - on the same rules (THE COMMON WHELP's one small fireball, claude/courtyard) */
export function stepBall(e, dt, c, sp) { if (!e.balls || !e.balls.length) return []; return e.balls.slice().map(b => stepOne(e, b, dt, c, sp)); }

const live = slabs => slabs.filter(m => !m.broken);
const onSlab = (P, slabs) => P.onMover && slabs.includes(P.onMover) && !P.onMover.broken ? P.onMover : null;
function begin(e, what, c) { e.mode = TELL[what]; e.modeT = GARG.tell[what] * (e.phase === 2 && !GARG.tellP2Not.includes(what) ? GARG.tellP2 : 1); e.tell0 = e.modeT; if (what === 'fireball') e.volley = 0; e.last2 = e.last; e.last = what; e.side = e.side || 1;
  c.say(SAY[e.mode], what === 'dive' || what === 'flare'); c.sound(what === 'dive' ? 'screech' : what === 'flare' ? 'zap' : what === 'breath' || what === 'fireball' ? 'inhale' : 'rattle'); }
/* HIS CHOICE is weighted and random, and never the same thing three times running (the Hedge Warden's first pilot had no dice in it,
   and its four passes were one fight four times). THE SHRIEK only while none of his whelps is up (GARG.whelps, 2026-09-28): with one alive its
   weight is 0 and the roll falls to his other attacks - he does something else, he never stands and screams for nothing */
export function gargChoose(e, c, slab) {
  const r = c.rnd, w = { dive: 3, fireball: 1.6, breath: 2.4, flare: slab && e.flareCd <= 0 ? 1.2 : 0, shriek: e.shriekCd <= 0 && c.adds() < GARG.whelps ? 0.8 : 0 };
  if (e.last && e.last === e.last2 && w[e.last]) w[e.last] = 0;
  else if (e.last && w[e.last]) w[e.last] *= 0.45;
  const tot = Object.values(w).reduce((s, v) => s + v, 0); let k = r() * tot;
  for (const [what, v] of Object.entries(w)) { k -= v; if (k <= 0 && v > 0) return what; }
  return 'dive';
}
/* HE EASES toward where he wants to be - and never faster than `max` px/s (GARG.fly and its kin, 2026-09-28) */
const toward = (e, tx, ty, dt, k = GARG.ease, max = GARG.fly) => { const f = Math.min(1, dt * k); let dx = (tx - e.x) * f, dy = (ty - e.y) * f;
  const d = Math.hypot(dx, dy), cap = max * dt; if (d > cap && d > 0) { dx *= cap / d; dy *= cap / d; }
  e.vx = dx / Math.max(dt, 1e-6); e.vy = dy / Math.max(dt, 1e-6); e.x += dx; e.y += dy; };
const footX = (e, m) => m.x + Math.max(8 * K, Math.min(m.w - 8 * K, e.off));   /* where on a slab he comes down: never off its end */
const aimAt = (e, P) => Math.atan2(P.y - 10 - (e.y - 18 * K), P.x - (e.x + (e.face || 1) * 14 * K));

export function updateGargoyle(e, dt, c) {
  const { P, A } = c, slabs = c.slabs, rnd = c.rnd || Math.random;
  if (!e.alive || e.mode === 'sleep') return;
  e.anim = (e.anim || 0) + dt; e.modeT -= dt; e.cd = (e.cd ?? 1) - dt; e.flareCd = (e.flareCd ?? 4) - dt; e.shriekCd = (e.shriekCd ?? 8) - dt;
  e.open = gargOpen(e) ? Math.max(0, e.modeT) : 0; e.slabsSeen = slabs;   /* (the breath's told line is drawn stopped where the jet will stop) */
  if (e.balls && e.balls.length) stepBall(e, dt, c);   /* HIS FIREBALLS fly on whatever he does next */
  const slab = onSlab(P, slabs), top = A.top, riding = !!P.windRide;
  if (e.phase === 1 && e.hp <= e.maxHp / 2) { e.phase = 2; c.phase2(); c.say('HIS FIRE FOLLOWS YOU', true); c.shake(6); }
  const side = () => (e.x < P.x ? -1 : 1);
  switch (e.mode) {
    case 'wake': toward(e, e.px0 - 40, e.py0 - 20, dt, 1.5); if (e.modeT <= 0) { e.mode = 'hover'; e.cd = 0.8; } return;
    case 'hover': {
      if (e.hoverT === undefined || (e.hoverT -= dt) <= 0) { e.hoverT = 1.2 + rnd() * 1.4; e.side = rnd() < 0.5 ? -1 : 1; e.hx = GARG.hoverDX * (0.7 + rnd() * 0.6); }
      const tx = Math.max(A.x0 + 16 * K, Math.min(A.x1 - 16 * K, P.x + e.side * e.hx)), ty = Math.min(P.y, top + 32) - GARG.hoverUp;
      toward(e, tx, ty, dt); e.face = Math.sign(P.x - e.x) || e.face;
      if (riding) { e.cd = Math.max(e.cd, 0.6); return; }   /* while the wind has you he waits: nothing is thrown at a hero who cannot move */
      if (e.cd <= 0) { const what = e.queue && e.queue.length ? e.queue.shift() : gargChoose(e, { ...c, rnd }, slab);
        if (what === 'shriek') { e.mode = 'perchFly'; e.modeT = 2.5; c.say('HE GOES BACK TO THE GATE', false); }
        else if (what === 'flare' && !slab) { e.cd = 0.3; }
        else if (what === 'fireball' && e.balls && e.balls.length) { e.cd = 0.3; }   /* one volley of his at a time */
        else { begin(e, what, c); if (what === 'flare') { e.fm = slab; e.flareCd = 7; } if (what === 'dive') { e.tgt = slab; e.off = slab ? P.x - slab.x : 0; } if (what === 'breath') { e.sd = side(); e.aim = null; } if (what === 'fireball') e.sd = side(); } }
      return; }
    /* THE STONE DIVE: up and out of sight; his shadow follows you from slab to slab until he drops */
    case 'diveTell': { const s = onSlab(P, slabs), fl = P.flip && P.flareSlab && !P.flareSlab.broken ? P.flareSlab : null;   /* in the air between slabs he keeps the last one he saw you on */
      if (fl || s) { e.tgt = fl || s; e.off = P.x - e.tgt.x; } else if (!e.tgt || e.tgt.broken) { e.tgt = live(slabs).sort((a, b) => Math.abs(a.x + a.w / 2 - P.x) - Math.abs(b.x + b.w / 2 - P.x))[0] || null; e.off = e.tgt ? e.tgt.w / 2 : 0; } e.tx = P.x;
      toward(e, e.tgt ? e.tgt.x + e.off : P.x, top - GARG.diveUp, dt, 3.2, Infinity);   /* (up out of sight: the dive is as it was) */
      if (e.modeT <= 0) { e.mode = 'dive'; e.modeT = 2; e.hitP = false; c.sound('whoosh'); } return; }
    case 'dive': { const m = e.tgt && !e.tgt.broken ? e.tgt : null, gy = m ? m.y : top + 24; e.x = m ? footX(e, m) : e.tx; e.y += GARG.diveV * dt; e.vx = 0; e.vy = GARG.diveV;
      if (e.y < gy) return;
      e.y = gy;
      if (!m) { e.mode = 'rise'; e.modeT = GARG.rise; c.say('HE PULLS UP', false); return; }   /* nothing under him: over the spikes he pulls up, and nothing opens */
      c.shake(8); c.sound('slam'); c.dust(e.x, gy);
      const under = P.flip && P.flareSlab === m;
      const onIt = !P.dead && Math.abs(P.x - e.x) < 24 * K && (Math.abs(P.y - gy) < 26 || under);
      if (onIt) c.hit(e.x, GARG.dmg.dive, true, 'THE STONE DIVE');
      /* THE OPENING: nobody under him to take his weight, and the slab gives - the crack runs across it, then he goes through */
      else if (gargGives(m)) { e.mode = 'smash'; e.modeT = GARG.smashT; e.sm = m; e.off = e.x - m.x; c.sound('crack'); c.say('THE SLAB GIVES', false); return; }
      e.mode = 'land'; e.modeT = e.phase === 2 && !e.paired ? 0.5 : GARG.land; e.onM = m; e.off = e.x - m.x; return; }
    case 'smash': { const m = e.sm; if (m && !m.broken) { e.x = m.x + e.off; e.y = m.y; }
      if (e.modeT <= 0) { if (m && !m.broken) c.breakSlab(m); e.sm = null; e.mode = 'crash'; e.vy = 40; e.modeT = 3; c.sound('whoosh'); } return; }
    /* THE CRASH: through it and down ONTO THE SPIKES. Anyone under it is hit */
    case 'crash': { e.vx = 0; e.vy += GARG.crashG * dt; e.y += e.vy * dt; if (e.y < A.floor && e.modeT > 0) return;
      e.y = A.floor; e.vy = 0; c.shake(11); c.sound('slam'); c.dust(e.x, A.floor); if (c.crash) c.crash(e.x, A.floor);
      if (!P.dead && !riding && Math.abs(P.x - e.x) < 20 * K && Math.abs(P.y - A.floor) < 30) c.hit(e.x, GARG.dmg.crash, true, 'THE CRASH');
      e.mode = 'stunned'; e.modeT = GARG.stun; e.open = GARG.stun; c.say('ON THE SPIKES: JUMP ON HIM', false, true); c.sound('crack'); return; }
    case 'stunned': if (e.modeT <= 0) { e.mode = 'rise'; e.modeT = GARG.rise * 1.6; e.cd = 0.9; c.say('HE TEARS HIMSELF OFF', false); } return;
    /* STOMPED: off the spikes and back up over his slabs, untouchable, while the wind takes you up too */
    case 'reset': toward(e, Math.max(A.x0 + 40, Math.min(A.x1 - 40, e.x)), top - GARG.hoverUp - 30, dt, 2.2, GARG.flyUp); e.face = Math.sign(P.x - e.x) || e.face;
      if (e.modeT <= 0) { e.mode = 'hover'; e.cd = Math.max(e.cd, 0.9); } return;
    case 'land': { const m = e.onM; if (m) { e.x = m.x + e.off; e.y = m.y; } e.face = Math.sign(P.x - e.x) || e.face;
      if (e.modeT <= 0) { if (e.phase === 2 && !e.paired) { e.paired = true; begin(e, 'dive', c); e.modeT *= 0.7; e.tgt = onSlab(P, slabs); e.off = e.tgt ? P.x - e.tgt.x : 0; return; }
        e.paired = false; e.mode = 'rise'; e.modeT = GARG.rise; } return; }
    case 'rise': toward(e, e.x, top - GARG.hoverUp - 10, dt, 3, GARG.flyUp); if (e.modeT <= 0) { e.mode = 'hover'; e.cd = Math.max(e.cd, 0.6); } return;
    /* THE FIREBALLS (in the wing gust's place, Daniel 2026-09-28; TWO since claude/gargoyle5): off to one side of you and a little above, he
       rears back and the fire gathers in his jaws (the glow grows through the tell); then a slow ball, aimed where you are as it leaves him;
       a beat (the recoil), the fire gathers again - told again, a shorter glow - and a SECOND ball, aimed afresh */
    case 'fireballTell': { const sd = e.sd = e.sd || side(); toward(e, P.x + sd * 80 * K, P.y - 12, dt, 3, GARG.flyTell);   /* level with you (the gust's place): the ball comes in low along your tier */ e.face = -sd;
      if (e.modeT <= 0) { const [mx, my] = mouth(e), a = Math.atan2(P.y - 9 - my, P.x - mx);
        (e.balls = e.balls || []).push({ x: mx, y: my, vx: Math.cos(a) * GARG.ball.v, vy: Math.sin(a) * GARG.ball.v, life: GARG.ball.life, t: 0 });
        e.mode = 'fireball'; e.modeT = GARG.ball.throwT; e.volley = (e.volley || 0) + 1; e.thrown = (e.thrown || 0) + 1; c.sound('fireball'); } return; }
    case 'fireball': e.vx = 0; e.vy = 0;
      if (e.modeT <= 0) {
        if ((e.volley || 0) < GARG.ball.n) { e.mode = 'fireballTell'; e.modeT = e.tell0 = GARG.ball.again; c.sound('inhale'); return; }   /* THE SECOND, told */
        e.volley = 0; e.sd = 0; e.mode = 'recover'; e.modeT = GARG.recover; e.cd = e.phase === 2 ? GARG.cdP2 : GARG.cd; } return;
    /* THE FIRE BREATH: off to one side of you and above; the line follows you, then LOCKS for its last quarter-second, then the jet */
    case 'breathTell': { const sd = e.sd = e.sd || side(); toward(e, P.x + sd * 96 * K, P.y - 4, dt, 3, GARG.flyTell); e.face = -sd;   /* level with you: the jet goes along your tier, under the one above */
      if (e.modeT > GARG.breath.lock || e.aim === null || e.aim === undefined) e.aim = aimAt(e, P);   /* it follows you, then it is set */
      if (e.modeT <= 0) { e.mode = 'breath'; e.modeT = GARG.breath.T; e.bHit = false; c.sound('fire'); } return; }
    case 'breath': { e.vx = 0; e.vy = 0;
      if (e.phase === 2) { const want = aimAt(e, P); let d = want - e.aim; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; e.aim += Math.sign(d) * Math.min(Math.abs(d), GARG.breath.sweep * dt); }   /* PHASE TWO: it chases you as it burns */
      const ln = jetSoFar(breathLine(e, e.aim, c), GARG.breath.T - e.modeT); e.jet = ln; if (c.fire && ln[4] > 2) c.fire(ln);   /* THE FRONT RUNS OUT along the line: it burns only as far as it has got */
      if (!e.bHit && !P.dead && !riding && (inBreath(ln, P.x, P.y - 9) || inBreath(ln, P.x, P.y - (P.h || 18) + 3) || inBreath(ln, P.x, P.y - 2))) { e.bHit = true; const r = c.hit(ln[0], GARG.dmg.breath, false, 'THE FIRE BREATH'); if (r === 'blocked') c.say('THE SHIELD TAKES THE FIRE', false, true); }
      if (e.modeT <= 0) { e.sd = 0; e.jet = null; e.mode = 'recover'; e.modeT = GARG.recover; e.cd = e.phase === 2 ? GARG.cdP2 : GARG.cd; } return; }
    /* after a fireball or the breath he sinks a little and gets his breath */
    case 'recover': toward(e, e.x, Math.min(P.y, top + 32) - 16, dt, 1.2); e.face = Math.sign(P.x - e.x) || e.face; if (e.modeT <= 0) e.mode = 'hover'; return;
    /* THE GLYPH FLARE: a glyph lit under your slab; still on it when it goes and you fall up onto its underside */
    case 'flareTell': toward(e, P.x - side() * 60 * K, P.y - 70 * K, dt, 2, GARG.flyTell);
      if (e.modeT <= 0) { const m = e.fm; e.fm = null; e.mode = 'hover'; e.cd = 0.35;
        if (m && !m.broken && onSlab(P, slabs) === m) { c.flare(m, GARG.flareT); e.queue = e.phase === 2 ? ['fireball', 'dive'] : rnd() < 0.65 ? ['dive'] : []; }
        else c.say('THE GLYPH FIZZLES', false, true); } return;
    /* THE PERCH SHRIEK */
    case 'perchFly': toward(e, e.px0, e.py0, dt, 2.2, GARG.flyUp); if (Math.hypot(e.x - e.px0, e.y - e.py0) < 10 || e.modeT <= 0) { e.mode = 'shriek'; e.modeT = 1.1; e.shrieked = false; c.sound('screech'); c.shake(4); } return;
    case 'shriek': e.face = -1; if (!e.shrieked && e.modeT < 0.7) { e.shrieked = true; const n = Math.max(0, GARG.whelps - c.adds()); for (let i = 0; i < n; i++) c.whelp(A.x1 - 8, top - 40 - i * 26); e.shriekCd = GARG.shriekEvery; }
      if (e.modeT <= 0) { e.mode = 'hover'; e.cd = 0.8; } return;
  }
  e.mode = 'hover';
}

/* A BROKEN SLAB, WHILE IT IS GONE: its place drawn as a faint dotted outline of loose magic, which fills and brightens over its last
   second - the room saying where footing is coming back, and when (C1) */
export function drawSlabGhost(g, m, cx, cy, time) {
  const x = Math.round(m.x - cx), y = Math.round(m.y - cy), w = Math.round(m.w), soon = Math.max(0, 1 - (m.brokenT || 0));
  g.globalAlpha = 0.18 + 0.5 * soon; g.fillStyle = '#c8a0ff'; for (let k = 0; k < w; k += 4) { g.fillRect(x + k, y, 2, 1); g.fillRect(x + k + 2, y + 8, 2, 1); } g.fillRect(x, y, 1, 9); g.fillRect(x + w - 1, y, 1, 9);
  if (soon > 0) { g.globalAlpha = 0.35 * soon; g.fillRect(x + 1, y + 1, w - 2, 7); } g.globalAlpha = 1;
}
/* THE FIRE BREATH, DRAWN AS FIRE (Daniel, 2026-09-28: the old jet of squares "looks a little weird"): flickering flame along the jet so far
   (L5 from jetSoFar, exactly the line the hitbox uses) - a hot white-yellow core at his mouth, yellow, orange, then red toward the front;
   tongues licking UP off it, embers rising, and smoke rolling off its front. Visual only: nothing here touches its timing or its reach.
   The flicker steps at 18 a second (a pixel game's fire, not a smear). */
const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
export function drawFlame(g, L5, cx, cy, time) {
  const [x0, y0, x1, y1, len] = L5; if (!(len > 1)) return;
  const ux = (x1 - x0) / len, uy = (y1 - y0) / len, nx = -uy, ny = ux, tick = Math.floor(time * 18), W = GARG.breath.w;
  const at = (d, off, up = 0) => [Math.round(x0 + ux * d + nx * off - cx), Math.round(y0 + uy * d + ny * off - cy - up)];
  const blob = (x, y, r, col, a) => { g.globalAlpha = a; g.fillStyle = col; g.beginPath(); g.arc(x, y, Math.max(0.6, r), 0, 7); g.fill(); };
  const body = [];   /* the flame's body: puffs every 3 px, fattening from his mouth out, tapering at the very front, each jittered per flicker */
  for (let d = 0; d <= len; d += 3) { const f = d / len, taper = Math.min(1, (len - d) / 12 + 0.35), r = (2.5 + W * 0.75 * Math.min(1, d / 60 + f * 0.4)) * taper;
    body.push({ d, f, r: r * (0.85 + 0.3 * hash(tick * 3.1 + d)), off: (hash(tick * 1.7 + d * 0.9) - 0.5) * (1 + 3 * f) }); }
  /* tongues licking up off it, behind the body */
  for (let d = 6; d < len - 4; d += 5) { const s = hash(tick * 0.91 + d * 1.3); if (s < 0.35) continue; const q = body[Math.round(d / 3)] || body[body.length - 1], h = (4 + 10 * q.f) * s, [bx, by] = at(d, q.off, q.r * 0.5), sway = Math.round((hash(tick + d) - 0.5) * 4);
    g.globalAlpha = 0.85; g.fillStyle = q.f < 0.5 ? '#ff8a1e' : '#d8401e'; g.beginPath(); g.moveTo(bx - 3, by + 1); g.lineTo(bx + sway, by - h); g.lineTo(bx + 3, by + 1); g.fill();
    if (h > 6) { g.fillStyle = q.f < 0.5 ? '#ffd23c' : '#ff8a1e'; g.beginPath(); g.moveTo(bx - 1, by + 1); g.lineTo(bx + sway * 0.6, by - h * 0.55); g.lineTo(bx + 1, by + 1); g.fill(); } }
  /* the body in four layers, outside in: red, orange, yellow, the white-hot core near his jaws */
  for (const q of body) { const [x, y] = at(q.d, q.off); blob(x, y, q.r, q.f > 0.8 ? '#a8281a' : '#d8401e', 0.9); }
  for (const q of body) { if (q.f > 0.92) continue; const [x, y] = at(q.d, q.off * 0.8); blob(x, y, q.r * 0.72, '#ff8a1e', 0.95); }
  for (const q of body) { if (q.f > 0.7) continue; const [x, y] = at(q.d, q.off * 0.6); blob(x, y, q.r * 0.46, '#ffd23c', 1); }
  for (const q of body) { if (q.f > 0.35) continue; const [x, y] = at(q.d, q.off * 0.4); blob(x, y, Math.max(1, q.r * 0.26), '#fff6d8', 1); }
  /* embers rising off it */
  for (let k = 0; k < 10; k++) { const life = (time * 1.4 + hash(k * 5.3)) % 1, gen = Math.floor(time * 1.4 + hash(k * 5.3)), d = hash(k * 7.7 + gen * 3.3) * len, [x, y] = at(d, (hash(k + gen) - 0.5) * W * 1.6, 4 + life * 22);
    g.globalAlpha = 1 - life; g.fillStyle = life < 0.4 ? '#ffe27a' : '#ff8a1e'; g.fillRect(x + Math.round(Math.sin(time * 6 + k) * 2), y, k % 3 ? 1 : 2, k % 3 ? 1 : 2); }
  /* smoke rolling off the front */
  if (len > 30) for (let k = 0; k < 5; k++) { const life = (time * 1.1 + k / 5) % 1, [x, y] = at(len - 4 + life * 8, (hash(k * 2.3) - 0.5) * 6, 2 + life * 16);
    blob(x, y, 2.5 + life * 5, k % 2 ? '#3e3640' : '#57505a', 0.4 * (1 - life)); }
  g.globalAlpha = 1;
}
/* HIS MARKS ON THE WORLD: the dive's shadow (and its red cross) on the slab he is coming down on - and on the spikes under it once the
   slab is empty, since that is where he is going; the crack running across a slab as it gives; the glyph lit under a slab; the fire
   breath's line (dotted while it follows you, solid once it is set) and its jet; the fireball's glow in his jaws and the ball; and the stunned mark, circling stars
   in a green ring and a green arrow over his back - JUMP ON HIM - for as long as he lies open */
export function drawGargoyleWorld(g, e, cx, cy, time, P) {
  if (!e || !e.alive) return;
  const shadow = (x, y, k, a) => { g.globalAlpha = a * (0.35 + 0.3 * k); g.fillStyle = '#120e18'; g.beginPath(); g.ellipse(x, y + 1, (18 + 6 * k) * K, 4 * K, 0, 0, Math.PI * 2); g.fill(); };
  const cross = (x, y, a) => { g.globalAlpha = 0.9 * a; g.strokeStyle = '#ff6b6b'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 7, y - 26); g.lineTo(x + 7, y - 12); g.moveTo(x + 7, y - 26); g.lineTo(x - 7, y - 12); g.stroke(); g.lineWidth = 1; };
  if (e.mode === 'diveTell' || e.mode === 'dive') { const m = e.tgt && !e.tgt.broken ? e.tgt : null, x = Math.round((m ? footX(e, m) : e.tx) - cx), y = Math.round((m ? m.y : e.floorY) - cy);
    const k = e.mode === 'dive' ? 1 : 0.5 + 0.5 * Math.sin(time * 14); shadow(x, y, k, 1); cross(x, y, 1);
    const empty = m && P && !(P.onMover === m) && gargGives(m);
    if (empty && e.floorY) { const fy = Math.round(e.floorY - cy); shadow(x, fy, k, 0.7); cross(x, fy, 0.6); }   /* nobody on it: he is coming through it, to here */
    g.globalAlpha = 1; }
  if (e.mode === 'smash' && e.sm) { const m = e.sm, x = Math.round(m.x + e.off - cx), y = Math.round(m.y - cy), k = 1 - Math.max(0, e.modeT) / GARG.smashT;
    g.fillStyle = '#1b1626'; for (const dir of [-1, 1]) for (let q = 0; q < 3; q++) { let px0 = x, py0 = y + 1; const reach = (10 + q * 8) * k * K;   /* THE CRACK RUNS ACROSS IT */
      for (let d = 0; d < reach; d += 2) { px0 += dir * 2; py0 = y + 1 + ((d + q * 3) % 7); if (Math.abs(px0 - (m.x - cx) - m.w / 2) > m.w / 2) break; g.fillRect(px0, py0, 2, 1); } }
    g.fillStyle = '#e0c8ff'; g.globalAlpha = 0.6 * k; g.fillRect(x - 2, y + 2, 4, 5); g.globalAlpha = 1; }
  if (e.mode === 'flareTell' && e.fm) { const m = e.fm, x = Math.round(m.x + m.w / 2 - cx), y = Math.round(m.y + 14 - cy), k = 1 - Math.max(0, e.modeT) / GARG.tell.flare;
    g.globalAlpha = 0.3 + 0.5 * k; g.strokeStyle = '#c8a0ff'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y, 10 + 12 * k, 4 + 2 * k, 0, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = '#ff6b6b'; g.beginPath(); g.moveTo(x - 5, y - 5); g.lineTo(x + 5, y + 5); g.moveTo(x + 5, y - 5); g.lineTo(x - 5, y + 5); g.stroke(); g.lineWidth = 1;
    g.fillStyle = '#e0c8ff'; for (let q = 0; q < 5; q++) g.fillRect(x - 12 + ((q * 7 + Math.floor(time * 20)) % 24), y - 2 - ((q * 5 + Math.floor(time * 30)) % 12), 1, 2); g.globalAlpha = 1; }
  /* THE FIRE BREATH, TOLD: the line it will take (dotted and following you, then solid and set), the throat lit; then the jet */
  if (e.mode === 'breathTell' && e.aim !== null && e.aim !== undefined) { const set = e.modeT <= GARG.breath.lock, [x0, y0, x1, y1] = breathLine(e, e.aim, { slabs: e.slabsSeen || [] });
    g.save(); g.globalAlpha = set ? 0.75 : 0.3 + 0.25 * Math.sin(time * 16); g.strokeStyle = set ? '#ff9a3c' : '#ffd36b'; g.lineWidth = set ? 2 : 1; if (!set) g.setLineDash([3, 3]);
    g.beginPath(); g.moveTo(Math.round(x0 - cx) + 0.5, Math.round(y0 - cy) + 0.5); g.lineTo(Math.round(x1 - cx) + 0.5, Math.round(y1 - cy) + 0.5); g.stroke(); g.restore();
    const k = 1 - Math.max(0, e.modeT) / GARG.tell.breath; g.globalAlpha = 0.4 + 0.5 * k; g.fillStyle = '#ffb040'; g.fillRect(Math.round(x0 - cx) - 2, Math.round(y0 - cy) - 2, 4 + Math.round(3 * k), 4 + Math.round(3 * k)); g.globalAlpha = 1; }
  if (e.mode === 'breath' && e.jet) drawFlame(g, e.jet, cx, cy, time);
  /* THE FIREBALL, TOLD: fire gathering in his jaws, growing and brightening to the throw (each throw of the two); then the balls, flickering, with their trails */
  if (e.mode === 'fireballTell') { const [mx, my] = mouth(e), k = 1 - Math.max(0, e.modeT) / (e.tell0 || GARG.tell.fireball), x = Math.round(mx - cx), y = Math.round(my - cy), r = 2 + Math.round(GARG.ball.r * k), fl = Math.floor(time * 16) % 2;
    g.globalAlpha = 0.25 + 0.35 * k; g.fillStyle = '#ff9a3c'; g.beginPath(); g.arc(x, y, r + 5 + (fl ? 1 : 0), 0, 7); g.fill();
    g.globalAlpha = 0.6 + 0.4 * k; g.fillStyle = fl ? '#ff9a5c' : '#ff6b2c'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.fillStyle = '#fff0b0'; g.fillRect(x - 1, y - 1, 2, 2); g.globalAlpha = 1; }
  for (const b of e.balls || []) drawBall(g, b, cx, cy, time, GARG.ball.r);
  if (e.mode === 'stunned') { const k = 0.5 + 0.5 * Math.sin(time * 10), hx = Math.round(e.x + (e.face || 1) * 12 * K - cx), hy = Math.round(e.y - 18 * K - cy), left = Math.max(0, e.modeT) / GARG.stun;
    g.globalAlpha = 0.35 + 0.35 * k; g.strokeStyle = '#8fd160'; g.lineWidth = 2; g.beginPath(); g.ellipse(Math.round(e.x - cx), Math.round(e.y - 12 * K - cy), 30 + k * 3, 18, 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1;
    g.globalAlpha = 1; for (let q = 0; q < 3; q++) { const a = time * 5 + q * 2.09, sx = hx + Math.round(Math.cos(a) * 12), sy = hy + Math.round(Math.sin(a) * 4);   /* THE STARS: round his head */
      g.fillStyle = q === 1 ? '#8fd160' : '#ffd36b'; g.fillRect(sx - 1, sy, 3, 1); g.fillRect(sx, sy - 1, 1, 3); }
    const ax = Math.round(e.x - cx), ay = Math.round(e.y - 30 * K - cy) - 10 - Math.round(3 * k);   /* THE ARROW: down onto his back */
    g.fillStyle = '#8fd160'; g.fillRect(ax - 1, ay - 8, 3, 6); for (let q = 0; q < 4; q++) g.fillRect(ax - 4 + q, ay - 2 + q, 9 - 2 * q, 1);
    g.globalAlpha = 0.8; g.fillRect(Math.round(e.x - cx) - 14, Math.round(e.y - 30 * K - cy), Math.round(28 * left), 2); g.globalAlpha = 1; }   /* and how long he has left down there */
}
/* ONE FIREBALL IN FLIGHT, r its radius: a flickering ball with its trail and halo - his (GARG.ball.r) and, smaller, a common whelp's
   (WH.ball.r, src/gargoyle-whelp.js: claude/courtyard) */
export function drawBall(g, b, cx, cy, time, r) {
  const x = Math.round(b.x - cx), y = Math.round(b.y - cy), fl = Math.floor(time * 20) % 2, sp = Math.hypot(b.vx, b.vy) || 1;
  for (let q = 1; q <= 4; q++) { g.globalAlpha = 0.45 - q * 0.09; g.fillStyle = q < 3 ? '#ffb040' : '#e0502a'; const tr = r - q; g.fillRect(Math.round(x - b.vx / sp * q * 5 - tr / 2), Math.round(y - b.vy / sp * q * 5 - tr / 2), Math.max(1, tr), Math.max(1, tr)); }
  g.globalAlpha = 0.3; g.fillStyle = '#ff7828'; g.beginPath(); g.arc(x, y, r + 4, 0, 7); g.fill(); g.globalAlpha = 1;
  g.fillStyle = fl ? '#ff9a5c' : '#ff6b2c'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.fillStyle = '#ffd36b'; g.beginPath(); g.arc(x - 1, y - 1, r * 0.55, 0, 7); g.fill(); g.fillStyle = '#fff6c8'; g.fillRect(x - 2, y - 3, 2, 2); }

/* THE RUNE COLUMN (claude/bosswave2, Daniel 10-03 from scratch/audit-rules.md: "the Gargoyle ignores the Stair's rule" - SLABS DRIFT,
   RUNES LIFT, GLYPHS TURN YOU OVER). A column of runed light stands in his arena, from the spikes to the sky, between the middle slabs.
   STRIKE IT (a blow anywhere on it, from either tier) and it FLARES for RUNE.flare s: if he is flying in it then - hovering, setting up a
   breath or a fireball over you, or coming down on the slab under it - the rune TURNS HIM OVER, and he falls onto the spikes as if a slab
   had given under him (crash -> stunned: the same opening, the same stomp). Then it is dark for RUNE.cd s, filling back up (drawn).
   Lure him over it (his dive follows you to your slab) and strike it while he is in it: a second way to put him on the spikes. */
export const RUNE = { flare: 1.0, cd: 9, w: 26 };
const RUNE_AIR = new Set(['hover', 'diveTell', 'dive', 'fireballTell', 'fireball', 'breathTell', 'breath', 'recover', 'flareTell', 'rise', 'reset', 'perchFly']);
/* is he in it? (his body over the column's width, between its foot and its head) */
export const inRune = (e, col) => !!e && e.alive && RUNE_AIR.has(e.mode) && Math.abs(e.x - col.x) < RUNE.w / 2 + 10 * K && e.y > col.top && e.y - 30 * K < col.bot;
/* every frame of his fight. col: { x, top, bot, flare, cd } (L.arena.rune); struck: a hero's blow met the column this frame. c: the fight's own hands */
export function runeStep(e, col, dt, struck, c) {
  col.flare = Math.max(0, (col.flare || 0) - dt); col.cd = Math.max(0, (col.cd || 0) - dt);
  if (struck && col.cd <= 0) { col.flare = RUNE.flare; col.cd = RUNE.cd; col.lit = (col.lit || 0) + 1; c.sound('zap'); }
  if (col.flare > 0 && inRune(e, col)) { col.flare = 0; col.caught = (col.caught || 0) + 1;
    e.mode = 'crash'; e.vy = 40; e.modeT = 3; e.sm = null; e.queue = []; e.paired = false; e.jet = null;
    c.say('THE RUNE TURNS HIM OVER', false, true); c.sound('crack'); c.shake(6); return true; }
  return false;
}
/* THE COLUMN, DRAWN: faint runes rising up it while it is ready (and a glint at slab height: strike here), a white-violet blaze while it
   flares, dark with a bar filling at its foot while it recharges */
export function drawRune(g, col, cx, cy, time) {
  const x = Math.round(col.x - cx), t = Math.round(col.top - cy), b = Math.round(col.bot - cy), ready = !(col.cd > 0), fl = col.flare > 0;
  g.globalAlpha = fl ? 0.55 : ready ? 0.16 + 0.06 * Math.sin(time * 3) : 0.06; g.fillStyle = fl ? '#f0e0ff' : '#c8a0ff'; g.fillRect(x - RUNE.w / 2, t, RUNE.w, b - t);
  g.globalAlpha = fl ? 0.9 : ready ? 0.55 : 0.18; g.fillStyle = '#e0c8ff';
  for (let q = 0; q < 9; q++) { const y = b - ((time * (fl ? 160 : 24) + q * 37) % Math.max(1, b - t)); g.fillRect(x - 3 + (q % 3) * 2, Math.round(y), 2, 3); g.fillRect(x - 4 + (q % 2) * 6, Math.round(y) + 4, 1, 2); }
  g.globalAlpha = 1;
  if (!ready) { const k = 1 - col.cd / RUNE.cd; g.fillStyle = '#1b1626'; g.fillRect(x - 10, b - 8, 20, 3); g.fillStyle = '#c8a0ff'; g.fillRect(x - 9, b - 7, Math.round(18 * k), 1); }
  else if (col.mid !== undefined) { const k = 0.5 + 0.5 * Math.sin(time * 6), y = Math.round(col.mid - cy); g.globalAlpha = 0.4 + 0.4 * k; g.strokeStyle = '#ffd36b'; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y, RUNE.w / 2 + 2 + k, 8 + k, 0, 0, 7); g.stroke(); g.globalAlpha = 1; }
}
