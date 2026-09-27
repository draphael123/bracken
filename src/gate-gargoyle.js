// gate-gargoyle.js — THE GATE GARGOYLE, the Witchlight Stair's boss (2026-09-22). Brief: .claude/briefs/witchlight-redesign.md,
// reworked 2026-09-25 (docs/briefs/gargoyle-rework.md) and AGAIN 2026-09-27 (Daniel's design, round three: docs/briefs/gargoyle-spikes.md).
// A huge stone gargoyle bolted over the tower's outer gate, woken by the loose magic. He is fought on the stair's top: MANY FLOATING
// SLABS in two tiers over A FLOOR OF SPIKES. His art: src/redraw/queue_bosses.js (bakeGateGargoyle, drawn at GARG.K = 1.5):
// 0 perched | 1,2 fly | 3 dive tell | 4 dive | 5 gust tell | 6 gust | 7 breath tell | 8 breath | 9 shriek | 10 STUNNED | 11 CRASH.
//   THE STONE DIVE   ✕  he rises out of sight and his shadow finds the slab you stand on; he comes down on it. He follows you from
//                        slab to slab while he is up there - the aim is his until he drops. No shield turns it: be elsewhere.
//   THE FIRE BREATH  !  he hangs off to one side of you, rears back and his throat lights; a dotted line shows where the jet will go,
//                        following you until the last quarter-second, when it LOCKS (it goes solid). Then a jet of fire along it. Step
//                        off the line - up a tier, down a tier, or behind a slab (a slab stops the jet) - or take it on a shield.
//                        In phase two the jet SWEEPS after you as it burns.
//   THE WING GUST    !  wings drawn back, then a blast that shoves you along your slab toward its edge - and the spikes; a shield braces you.
//   THE GLYPH FLARE  ✕  (no damage) a glyph lights under the slab you stand on: still on it when it goes, and you fall UP onto its
//                        underside for three seconds - and he likes to dive on that slab while you hang there.
//   THE PERCH SHRIEK    back to the gate; two or three GARGOYLE WHELPS come out of the tower's cornices (three at most): stone on
//                        its face until they swoop (src/gargoyle-whelp.js). Like him, they break only by a stomp on the spikes.
// HE IS STONE (Daniel, 2026-09-27: "INVULNERABLE except then"): no blade, shot, spell or burn takes anything off him (gargTake). THE
// OPENING IS YOURS: be on the slab his shadow finds and leave it LATE - after he has dropped - and nothing takes his weight: HE SMASHES
// THROUGH IT (the crack runs across it first) and CRASHES DOWN ONTO THE SPIKES, where he lies STUNNED for GARG.stun seconds. Then, and
// only then, JUMP ON HIM: a STOMP takes a fifth of him (GARG.stomps to kill), and THE WINDS carry you back up to a slab while he tears
// himself off the spikes and goes back up (he RESETS: untouchable, up over the slabs, and round again). Still on the slab when he lands
// and it is you he lands on. A broken slab grows back in a few seconds (GARG.regrow, a little slower in phase two) and never fewer than
// GARG.minLive stand. Fall onto the spikes and they take one bite and the winds bring you back (src/spike-winds.js).
// PHASE TWO (half his health): his fire SWEEPS after you, the moving slabs drift faster, dives come in pairs, every flare comes with a
// gust. Touching him never hurts (the touch rule).
export const GARG = {
  hp: 410, stomps: 5, cd: 1.35, cdP2: 0.95,
  K: 1.5, w: 45, h: 45,                       /* HALF AS BIG AGAIN (he was 30): every read of his size below goes through K */
  tell: { dive: 0.95, gust: 0.75, breath: 0.95, flare: 0.9 }, tellP2: 0.82,
  dmg: { dive: 18, gust: 6, breath: 12, crash: 12 },
  diveV: 430, diveUp: 150, land: 1.1, recover: 0.9, rise: 0.55, reset: 1.4,
  smashAny: true, smashT: 0.24, crashG: 1500, stun: 3.5,
  gustV: 215, gustT: 0.6, gustReach: 170,
  breath: { T: 0.85, reach: 210, w: 10, lock: 0.25, sweep: 0.75 },   /* the jet: seconds, px long, px either side of its line, the locked last part of the tell, rad/s it chases you in phase two */
  flareT: 3.0, whelps: 3, shriekEvery: 13, regrow: 4, regrowP2: 5.5, minLive: 6, slabP2: 1.6,
  hoverUp: 60, hoverDX: 52, high: 64,
};
/* a STOMP takes this much: GARG.stomps of them and he is broken, whoever you are */
GARG.stompDmg = Math.ceil(GARG.hp / GARG.stomps);
const K = GARG.K;
const TELL = { dive: 'diveTell', gust: 'gustTell', breath: 'breathTell', flare: 'flareTell' };
const SAY = { diveTell: 'THE STONE DIVE', gustTell: 'THE WING GUST', breathTell: 'FIRE: OFF THE LINE', flareTell: 'THE GLYPH FLARE: GET OFF THAT SLAB' };
/* HIS OPENING: stunned on the spikes, and only a stomp reaches him there */
export const gargOpen = e => e.mode === 'stunned';
/* the frames of bakeGateGargoyle */
export function gargFrame(e) {
  const fly = 1 + Math.floor((e.anim || 0) * 8) % 2;
  switch (e.mode) {
    case 'sleep': case 'wake': case 'land': return 0; case 'diveTell': return 3; case 'dive': return 4; case 'smash': case 'crash': return 11;
    case 'gustTell': return 5; case 'gust': return 6; case 'breathTell': return 7; case 'breath': return 8;
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

const live = slabs => slabs.filter(m => !m.broken);
const onSlab = (P, slabs) => P.onMover && slabs.includes(P.onMover) && !P.onMover.broken ? P.onMover : null;
function begin(e, what, c) { e.mode = TELL[what]; e.modeT = GARG.tell[what] * (e.phase === 2 ? GARG.tellP2 : 1); e.last2 = e.last; e.last = what; e.side = e.side || 1;
  c.say(SAY[e.mode], what === 'dive' || what === 'flare'); c.sound(what === 'dive' ? 'screech' : what === 'flare' ? 'zap' : what === 'breath' ? 'inhale' : 'rattle'); }
/* HIS CHOICE is weighted and random, and never the same thing three times running (the Hedge Warden's first pilot had no dice in it,
   and its four passes were one fight four times) */
function choose(e, c, slab) {
  const r = c.rnd, w = { dive: 3, gust: 1.6, breath: 2.4, flare: slab && e.flareCd <= 0 ? 1.2 : 0, shriek: e.shriekCd <= 0 && c.adds() < GARG.whelps ? 0.8 : 0 };
  if (e.last && e.last === e.last2 && w[e.last]) w[e.last] = 0;
  else if (e.last && w[e.last]) w[e.last] *= 0.45;
  const tot = Object.values(w).reduce((s, v) => s + v, 0); let k = r() * tot;
  for (const [what, v] of Object.entries(w)) { k -= v; if (k <= 0 && v > 0) return what; }
  return 'dive';
}
const toward = (e, tx, ty, dt, k = 2.4) => { e.vx = (tx - e.x) * Math.min(1, dt * k) / Math.max(dt, 1e-6); e.vy = (ty - e.y) * Math.min(1, dt * k) / Math.max(dt, 1e-6);
  e.x += (tx - e.x) * Math.min(1, dt * k); e.y += (ty - e.y) * Math.min(1, dt * k); };
const footX = (e, m) => m.x + Math.max(8 * K, Math.min(m.w - 8 * K, e.off));   /* where on a slab he comes down: never off its end */
const aimAt = (e, P) => Math.atan2(P.y - 10 - (e.y - 18 * K), P.x - (e.x + (e.face || 1) * 14 * K));

export function updateGargoyle(e, dt, c) {
  const { P, A } = c, slabs = c.slabs, rnd = c.rnd || Math.random;
  if (!e.alive || e.mode === 'sleep') return;
  e.anim = (e.anim || 0) + dt; e.modeT -= dt; e.cd = (e.cd ?? 1) - dt; e.flareCd = (e.flareCd ?? 4) - dt; e.shriekCd = (e.shriekCd ?? 8) - dt;
  e.open = gargOpen(e) ? Math.max(0, e.modeT) : 0; e.slabsSeen = slabs;   /* (the breath's told line is drawn stopped where the jet will stop) */
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
      if (e.cd <= 0) { const what = e.queue && e.queue.length ? e.queue.shift() : choose(e, { ...c, rnd }, slab);
        if (what === 'shriek') { e.mode = 'perchFly'; e.modeT = 2.5; c.say('HE GOES BACK TO THE GATE', false); }
        else if (what === 'flare' && !slab) { e.cd = 0.3; }
        else { begin(e, what, c); if (what === 'flare') { e.fm = slab; e.flareCd = 7; } if (what === 'dive') { e.tgt = slab; e.off = slab ? P.x - slab.x : 0; } if (what === 'breath') { e.sd = side(); e.aim = null; } } }
      return; }
    /* THE STONE DIVE: up and out of sight; his shadow follows you from slab to slab until he drops */
    case 'diveTell': { const s = onSlab(P, slabs), fl = P.flip && P.flareSlab && !P.flareSlab.broken ? P.flareSlab : null;   /* in the air between slabs he keeps the last one he saw you on */
      if (fl || s) { e.tgt = fl || s; e.off = P.x - e.tgt.x; } else if (!e.tgt || e.tgt.broken) { e.tgt = live(slabs).sort((a, b) => Math.abs(a.x + a.w / 2 - P.x) - Math.abs(b.x + b.w / 2 - P.x))[0] || null; e.off = e.tgt ? e.tgt.w / 2 : 0; } e.tx = P.x;
      toward(e, e.tgt ? e.tgt.x + e.off : P.x, top - GARG.diveUp, dt, 3.2);
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
    case 'reset': toward(e, Math.max(A.x0 + 40, Math.min(A.x1 - 40, e.x)), top - GARG.hoverUp - 30, dt, 2.2); e.face = Math.sign(P.x - e.x) || e.face;
      if (e.modeT <= 0) { e.mode = 'hover'; e.cd = Math.max(e.cd, 0.9); } return;
    case 'land': { const m = e.onM; if (m) { e.x = m.x + e.off; e.y = m.y; } e.face = Math.sign(P.x - e.x) || e.face;
      if (e.modeT <= 0) { if (e.phase === 2 && !e.paired) { e.paired = true; begin(e, 'dive', c); e.modeT *= 0.7; e.tgt = onSlab(P, slabs); e.off = e.tgt ? P.x - e.tgt.x : 0; return; }
        e.paired = false; e.mode = 'rise'; e.modeT = GARG.rise; } return; }
    case 'rise': toward(e, e.x, top - GARG.hoverUp - 10, dt, 3); if (e.modeT <= 0) { e.mode = 'hover'; e.cd = Math.max(e.cd, 0.6); } return;
    /* THE WING GUST: level with you, a few strides off; the blast shoves you along your slab */
    case 'gustTell': { e.gs = e.gs || side(); toward(e, P.x + e.gs * 72 * K, P.y - 12, dt, 3); e.face = -e.gs;
      if (e.modeT <= 0) { e.mode = 'gust'; e.modeT = GARG.gustT; c.sound('gust');
        const inCone = !riding && Math.abs(P.x - e.x) < GARG.gustReach && Math.abs(P.y - e.y) < 64;
        const r = inCone ? c.hit(e.x, GARG.dmg.gust, false, 'THE WING GUST') : null; e.braced = r !== 'hit'; if (r === 'blocked') c.say('BRACED', false, true); }   /* a shield braces you; a roll goes through it */ return; }
    case 'gust': { if (!e.braced && !P.dead && !riding && Math.abs(P.x - e.x) < GARG.gustReach + 40 && Math.abs(P.y - e.y) < 80) c.push(-e.gs * GARG.gustV);
      c.wind(e.x, e.y - 14 * K, -e.gs);
      if (e.modeT <= 0) { e.gs = 0; e.mode = 'recover'; e.modeT = GARG.recover; e.cd = e.phase === 2 ? GARG.cdP2 : GARG.cd; } return; }
    /* THE FIRE BREATH: off to one side of you and above; the line follows you, then LOCKS for its last quarter-second, then the jet */
    case 'breathTell': { const sd = e.sd = e.sd || side(); toward(e, P.x + sd * 96 * K, P.y - 4, dt, 3); e.face = -sd;   /* level with you: the jet goes along your tier, under the one above */
      if (e.modeT > GARG.breath.lock || e.aim === null || e.aim === undefined) e.aim = aimAt(e, P);   /* it follows you, then it is set */
      if (e.modeT <= 0) { e.mode = 'breath'; e.modeT = GARG.breath.T; e.bHit = false; c.sound('fire'); } return; }
    case 'breath': { e.vx = 0; e.vy = 0;
      if (e.phase === 2) { const want = aimAt(e, P); let d = want - e.aim; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; e.aim += Math.sign(d) * Math.min(Math.abs(d), GARG.breath.sweep * dt); }   /* PHASE TWO: it chases you as it burns */
      const ln = breathLine(e, e.aim, c); e.jet = ln; if (c.fire) c.fire(ln);
      if (!e.bHit && !P.dead && !riding && (inBreath(ln, P.x, P.y - 9) || inBreath(ln, P.x, P.y - (P.h || 18) + 3) || inBreath(ln, P.x, P.y - 2))) { e.bHit = true; const r = c.hit(ln[0], GARG.dmg.breath, false, 'THE FIRE BREATH'); if (r === 'blocked') c.say('THE SHIELD TAKES THE FIRE', false, true); }
      if (e.modeT <= 0) { e.sd = 0; e.jet = null; e.mode = 'recover'; e.modeT = GARG.recover; e.cd = e.phase === 2 ? GARG.cdP2 : GARG.cd; } return; }
    /* after a gust or the fire he sinks a little and gets his breath */
    case 'recover': toward(e, e.x, Math.min(P.y, top + 32) - 16, dt, 1.2); e.face = Math.sign(P.x - e.x) || e.face; if (e.modeT <= 0) e.mode = 'hover'; return;
    /* THE GLYPH FLARE: a glyph lit under your slab; still on it when it goes and you fall up onto its underside */
    case 'flareTell': toward(e, P.x - side() * 60 * K, P.y - 70 * K, dt, 2);
      if (e.modeT <= 0) { const m = e.fm; e.fm = null; e.mode = 'hover'; e.cd = 0.35;
        if (m && !m.broken && onSlab(P, slabs) === m) { c.flare(m, GARG.flareT); e.queue = e.phase === 2 ? ['gust', 'dive'] : rnd() < 0.65 ? ['dive'] : []; }
        else c.say('THE GLYPH FIZZLES', false, true); } return;
    /* THE PERCH SHRIEK */
    case 'perchFly': toward(e, e.px0, e.py0, dt, 2.2); if (Math.hypot(e.x - e.px0, e.y - e.py0) < 10 || e.modeT <= 0) { e.mode = 'shriek'; e.modeT = 1.1; e.shrieked = false; c.sound('screech'); c.shake(4); } return;
    case 'shriek': e.face = -1; if (!e.shrieked && e.modeT < 0.7) { e.shrieked = true; const n = Math.min(GARG.whelps - c.adds(), 2 + (rnd() < 0.5 ? 1 : 0)); for (let i = 0; i < n; i++) c.whelp(A.x1 - 8, top - 40 - i * 26); e.shriekCd = GARG.shriekEvery; }
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
/* HIS MARKS ON THE WORLD: the dive's shadow (and its red cross) on the slab he is coming down on - and on the spikes under it once the
   slab is empty, since that is where he is going; the crack running across a slab as it gives; the glyph lit under a slab; the fire
   breath's line (dotted while it follows you, solid once it is set) and its jet; the gust's wind; and the stunned mark, circling stars
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
  if (e.mode === 'breath' && e.jet) { const [x0, y0, x1, y1, len] = e.jet, dx = (x1 - x0) / Math.max(1, len), dy = (y1 - y0) / Math.max(1, len);
    for (let d = 0; d < len; d += 3) { const f = d / Math.max(1, len), wob = Math.sin(time * 40 + d * 0.3) * (2 + 5 * f), px = x0 + dx * d - dy * wob, py = y0 + dy * d + dx * wob, r = 2 + 6 * f;
      g.globalAlpha = 0.85 - 0.4 * f; g.fillStyle = f < 0.3 ? '#fff0b0' : f < 0.7 ? '#ffb040' : '#e0502a'; g.fillRect(Math.round(px - cx - r / 2), Math.round(py - cy - r / 2), Math.round(r), Math.round(r)); }
    g.globalAlpha = 1; }
  if (e.mode === 'gust' && !e.braced) { g.globalAlpha = 0.5; g.fillStyle = '#eefaff'; for (let q = 0; q < 8; q++) { const d = ((time * 400 + q * 37) % 160); g.fillRect(Math.round(e.x - cx - e.gs * d), Math.round(e.y - cy - 30 * K + (q * 11) % 44), 8, 1); } g.globalAlpha = 1; }
  if (e.mode === 'stunned') { const k = 0.5 + 0.5 * Math.sin(time * 10), hx = Math.round(e.x + (e.face || 1) * 12 * K - cx), hy = Math.round(e.y - 18 * K - cy), left = Math.max(0, e.modeT) / GARG.stun;
    g.globalAlpha = 0.35 + 0.35 * k; g.strokeStyle = '#8fd160'; g.lineWidth = 2; g.beginPath(); g.ellipse(Math.round(e.x - cx), Math.round(e.y - 12 * K - cy), 30 + k * 3, 18, 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1;
    g.globalAlpha = 1; for (let q = 0; q < 3; q++) { const a = time * 5 + q * 2.09, sx = hx + Math.round(Math.cos(a) * 12), sy = hy + Math.round(Math.sin(a) * 4);   /* THE STARS: round his head */
      g.fillStyle = q === 1 ? '#8fd160' : '#ffd36b'; g.fillRect(sx - 1, sy, 3, 1); g.fillRect(sx, sy - 1, 1, 3); }
    const ax = Math.round(e.x - cx), ay = Math.round(e.y - 30 * K - cy) - 10 - Math.round(3 * k);   /* THE ARROW: down onto his back */
    g.fillStyle = '#8fd160'; g.fillRect(ax - 1, ay - 8, 3, 6); for (let q = 0; q < 4; q++) g.fillRect(ax - 4 + q, ay - 2 + q, 9 - 2 * q, 1);
    g.globalAlpha = 0.8; g.fillRect(Math.round(e.x - cx) - 14, Math.round(e.y - 30 * K - cy), Math.round(28 * left), 2); g.globalAlpha = 1; }   /* and how long he has left down there */
}
