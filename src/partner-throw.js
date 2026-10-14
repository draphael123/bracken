// src/partner-throw.js - CO-OP: GRAB YOUR PARTNER AND THROW THEM (claude/partnerthrow, Daniel 2026-10-12: "pick up players and they dangle and scream and
// throw them into enemies"; spec scratch/brief-throw.md part 2).
//
// THE RULES, in the order a player meets them:
//   GRAB     stand close and press GRAB (the I key / the pad's R3 / the touch button that says GRAB, rebindable - src/controls.js 'grab'). Costs a little
//            stamina. You cannot grab a partner who is DODGING, in his i-frames or his grace (hurt, just revived, just thrown), DOWN or DEAD, airborne,
//            swimming, climbing, plunging - and a DOWNED partner is the REVIVE (you stand on him), which is untouched. Nor if you are busy yourself
//            (swinging, hurt, dodging, carrying a thing).
//   CARRY    he is lifted overhead and DANGLES (flail frames, a SCREAM in his hero's own voice, a mash bar over him). You walk slowly, cannot swing, roll,
//            guard or use a skill; a blow that lands on YOU drops him. The told arc and its landing ring are drawn from the moment he is up (UP lobs it).
//   WIGGLE   he can mash JUMP / ATTACK / DODGE / GRAB to wriggle free (told: a bar and MASH TO GET FREE). A computer ally wriggles on its own after a few seconds.
//   HEAVE    press GRAB again: a TOLD wind-up (HEAVE, an amber tell, the carrier planted), then he is thrown along the arc you were shown. DOWN + GRAB sets him
//            down gently instead. The same press THROWS A CARRIED OBJECT (a bucket, a jug): src/main.js throwCarry.
//   FLIGHT   the thrown partner is HIS OWN BODY on the hero's own physics (spikes, deep water, pits, fire and the rest of the room's hazards hurt him exactly as
//            they hurt anyone - FRIENDLY FIRE), with his controls taken. He HITS what he meets: a common foe is knocked down (KI.throwFoe: it flies, and a
//            hazard it lands in is its own end - INTO THE SPIKES) and takes IMPACT damage; an elite takes a share and a stagger and is never killed by it; a
//            boss or mini takes a CHIPPED hero blow (B15's floor - the clank and greed read as for any blow outside an opening). Each foe once per throw.
//            A SPIKED foe (the spike goblin, an urchin, a THORNED elite) hurts HIM too, and bounces him off.
//   LAND     a beat on his back (hurt pose), a short grace, and he cannot be grabbed again at once.
//
// HOOKS for main.js (each commented `(claude/partnerthrow)`): pass() in the pre-pass beside CARRY & THROW's attack-eating, before() / after() around updatePlayer,
// pose() in the hero draw, drawFx() in the world draw, label() for the touch button and the online host's state, tick() once a frame, reset() on a level load.
// The state lives on the bodies: carrier.ptC = { v, ph: 'carry'|'wind', t, aim, arc, hp0 }, victim.ptH = { by, mash, t, scream } (held) and victim.ptF = { by, t, vx, hit }
// (thrown). No netcode: online co-op drives player two through the local slot, so all of it is the host's.
import { MOVE } from './hero-move.js';
import { drawArc } from './carry-throw.js';

export const PT = {
  reach: 20, reachY: 16,               // px: how close "close" is (the revive's is 12 x 24)
  stCost: 14,                          // stamina to lift a partner (CM.trySpend: out of wind it fails)
  carrySpeed: 54,                      // the run cap while he is up (a bucket is 58)
  hand: 17,                            // px above the carrier's feet: the dangler's feet (the carrier is 14 tall)
  windup: 0.34,                        // s of the told HEAVE
  grabCd: 0.9, freeCd: 1.4,            // s before the carrier can lift again (after a throw / after being wriggled out of)
  safeT: 1.5, landGrace: 0.45, landHurt: 0.4,   // a partner just freed or landed can't be lifted at once; the landing's grace and knocked-down beat
  flyMax: 3.2,                         // s: a flight that never lands (a loop of hits) ends here
  wiggle: { per: 0.22, decay: 0.1, aiSecs: 3 },   // 5 presses fill the bar; it drains 10%/s; a computer ally takes aiSecs to get out
  aims: { mid: { vx: 215, vy: -190 }, high: { vx: 125, vy: -335 } },   // px/s, vy < 0 up. UP held = high (a lob)
  hit: { base: 26, share: 0.7, elite: 0.25, boss: 30, stagger: 0.9, push: 240, bowl: 0.7 },   // a common foe: max(base, share of its bar); an elite: elite x bar; a boss: raw boss, then the chip
  spikedDmg: 20, spikedKinds: ['thorn', 'urchin'],   // what a SPIKED foe does to the thrown partner (DMG.spined), and the kinds that are spiked at all (+ a THORNED elite)
  scream: 1.05,                        // s between screams while he is up
  tip: 'STAND CLOSE AND PRESS GRAB TO LIFT YOUR PARTNER. PRESS IT AGAIN TO THROW. HOLD UP TO LOB. THEY CAN MASH TO GET FREE.',
};
/* the words this lane floats (main.js adds them to MOVE_WORDS: number() drops any other sentence) */
export const WORDS = ['GRABBED', 'HEAVE', 'THROWN', 'WIGGLED FREE', 'SET DOWN', 'DROPPED', 'TOO QUICK', 'THE PARTNER', 'SPIKED'];
export const COL = '#ffd36b';

export const isSpiked = e => !!e && (PT.spikedKinds.includes(e.t) || e.affix === 'THORNED');

/* THE TOLD ARC with the HERO'S OWN gravity (a thrown partner flies on updatePlayer's physics: the light apex, the heavier fall, the fall cap), stepped
   against the tiles. solid(px, py) answers whether a point is inside something that stops him. -> { pts, land: { x, y, t, wall } | null } */
export function predict(x, y, v, solid, dt = 1 / 60, maxT = 2.4) {
  const q = { x, y, vx: v.vx, vy: v.vy }, pts = [[x, y]];
  for (let t = dt; t <= maxT; t += dt) {
    const rising = q.vy < 0, apex = Math.abs(q.vy) < MOVE.APEX_VY, gk = apex ? MOVE.APEX_G : rising ? 1 : MOVE.FALL_G;
    q.vy = Math.min(MOVE.MAX_FALL, q.vy + MOVE.GRAV * dt * gk);
    const nx = q.x + q.vx * dt, ny = q.y + q.vy * dt;
    if (solid(nx + Math.sign(q.vx) * 5, q.y - 7)) { q.vx = 0; }
    else q.x = nx;
    if (q.vy < 0 && solid(q.x, ny - 14)) q.vy = 0;
    else if (q.vy >= 0 && solid(q.x, ny)) { pts.push([q.x, q.y]); return { pts, land: { x: q.x, y: q.y, t, wall: false } }; }
    else q.y = ny;
    pts.push([q.x, q.y]);
  }
  return { pts, land: null };
}

/* api: { players(), asPlayer(p, fn), upright(p), enemies(), time(), box(b), overlap(a, b), solid(px, py), spend(p, cost), number(x, y, txt, col), burst(x, y, n, cols),
          dust(x, y, n), sparks(x, y, dir, n), shake(n), hitstop(s), sfx: SFX, hint(msg), tipDue(kind), damagePlayer(x, dmg, o), hurtFoe(e, dmg, fromX, tag),
          throwFoe(e, dir, push, why, by), fullHp(e), isBoss(e), carrying(p), reduceMotion() } */
export function makePartnerThrow(api) {
  const stats = { screams: 0, grabs: 0, throws: 0, frees: 0, setdowns: 0, drops: 0, hits: 0, bosses: 0, elites: 0, spiked: 0, landings: 0, refused: {}, said: [] };
  const say = (x, y, txt, col = COL) => { stats.said.push(txt); if (stats.said.length > 24) stats.said.shift(); api.number(x, y, txt, col); };
  const scream = h => { stats.screams++; if (api.sfx.partnerScream) api.sfx.partnerScream(h); };
  const others = p => api.players().filter(q => q !== p);
  const partnerOf = p => others(p).find(q => q.ptH && q.ptH.by === p) || null;

  /* WHY NOT: null when V can be lifted by C, else a short reason (also what the refusal says, once) */
  function why(C, V) {
    if (!api.upright(V) || V.dead || V.down > 0) return 'down';
    if (V.ptH || V.ptF || V.ptC) return 'busy';
    if (V.dodge > 0 || V.inv > 0 || V.grace > 0 || V.hurt > 0 || (V.ptSafe || 0) > 0) return 'quick';
    if (!V.ground || V.swim || V.climb || V.plunge || V.fly || V.carpet || V.windRide || V.galeRide || V.pinning || V.zip || V.flip) return 'air';
    if (Math.abs(V.x - C.x) > PT.reach || Math.abs(V.y - C.y) > PT.reachY) return 'far';
    return null;
  }
  function busy(C) {
    return C.dead || C.down > 0 || !C.ground || C.swim || C.climb || C.plunge || C.fly || C.carpet || C.windRide || C.galeRide || C.pinning || C.zip || C.flip
      || C.hurt > 0 || C.asleep > 0 || C.atk >= 0 || C.dodge > 0 || C.ptC || C.ptH || C.ptF || (C.ptCd || 0) > 0 || api.carrying(C);
  }
  /* the partner C could lift this frame (null: none), and the reason the nearest one cannot */
  function find(C) {
    if (api.players().length < 2 || busy(C)) return { V: null, why: null };
    let best = null, bd = 1e9, bwhy = null;
    for (const V of others(C)) {
      const w = why(C, V);
      if (w === null) { const d = Math.abs(V.x - C.x); if (d < bd) { bd = d; best = V; } }
      else if (w !== 'far' && Math.abs(V.x - C.x) <= PT.reach && Math.abs(V.y - C.y) <= PT.reachY) bwhy = w;
    }
    return { V: best, why: best ? null : bwhy };
  }
  /* THE TOUCH BUTTON AND THE ONLINE HOST'S STATE: 'THROW' while he is up, 'GRAB' while one can be lifted, else null */
  function label(C) {
    if (!C || C.dead || C.hurt > 0) return null;
    if (C.ptC) return C.ptC.ph === 'carry' ? 'THROW' : null;
    return find(C).V ? 'GRAB' : null;
  }

  /* ---------- the input pass (once a frame per hero, before the buffers read the presses) ---------- */
  function pass(p, inp) {
    const out = { eat: false, neutral: false };
    if (p.ptH) {   // held: every press is a wriggle, and nothing else he presses does anything
      const H = p.ptH;
      if (inp.mash) { H.mash = Math.min(1, H.mash + PT.wiggle.per); api.sfx.uiSel && api.sfx.uiSel(); if (H.mash >= 1) free(p); }
      out.neutral = true; return out;
    }
    if (p.ptF) { out.neutral = true; return out; }
    if (p.ptC) {
      out.eat = true;
      p.ptC.aim = inp.up ? 'high' : 'mid';
      if (inp.grab) { if (inp.down) setDown(p); else if (p.ptC.ph === 'carry') windup(p); }
      return out;
    }
    if (inp.grab) grab(p);
    return out;
  }

  function grab(C) {
    const f = find(C);
    if (!f.V) {
      if (f.why && !(C.ptSay > api.time())) { C.ptSay = api.time() + 1.2; stats.refused[f.why] = (stats.refused[f.why] || 0) + 1; if (f.why === 'quick') say(C.x, C.y - 30, 'TOO QUICK', '#9aa39a'); }
      return false;
    }
    if (!api.spend(C, PT.stCost)) { stats.refused.winded = (stats.refused.winded || 0) + 1; return false; }
    const V = f.V;
    V.atk = -1; V.block = false; V.dodge = 0; V.plunge = false; V.aegis = false; V.warding = false; V.vx = 0; V.vy = 0; V.ground = false; V.onMover = null; V.coyote = 0; V.charge = 0;
    V.ptH = { by: C, mash: 0, t: 0, scream: PT.scream };
    C.ptC = { v: V, ph: 'carry', t: 0, aim: 'mid', arc: null, hp0: C.hp };
    C.vx *= 0.3; stats.grabs++;
    say(V.x, V.y - 30, 'GRABBED', COL); api.sfx.clank && api.sfx.clank(); api.dust(V.x, V.y, 4);
    scream(V.hero);
    return true;
  }
  function windup(C) {
    C.ptC.ph = 'wind'; C.ptC.t = 0; C.vx = 0;
    say(C.x, C.y - 36, 'HEAVE', COL); api.sfx.charge && api.sfx.charge();
  }
  function handOf(C) { return { x: C.x + C.face * 2, y: C.y - PT.hand }; }
  function release(C, V) { if (V) V.ptH = null; if (C) C.ptC = null; }
  function throwNow(C) {
    const V = C.ptC.v, a = PT.aims[C.ptC.aim] || PT.aims.mid, h = handOf(C);
    release(C, V);
    const vx = C.face * a.vx + C.vx * 0.3;
    V.x = h.x; V.y = h.y; V.vx = vx; V.vy = a.vy; V.ground = false; V.coyote = 0; V.onMover = null; V.face = C.face;
    V.ptF = { by: C, t: 0, vx, hit: new Set(), spiked: new Set(), hits: 0, scream: PT.scream };
    C.ptCd = PT.grabCd; stats.throws++;
    say(V.x, V.y - 22, 'THROWN', '#ff9a5c'); api.sfx.throwWhoosh && api.sfx.throwWhoosh(); api.shake(2); api.sparks(h.x, h.y, C.face, 5);
    scream(V.hero);
  }
  function setDown(C) {
    const V = C.ptC.v; release(C, V);
    V.x = C.x + C.face * 12; V.y = C.y; V.vx = 0; V.vy = 0; V.ground = false; V.ptSafe = 0.6; V.grace = Math.max(V.grace || 0, 0.25);
    C.ptCd = 0.5; stats.setdowns++; say(V.x, V.y - 30, 'SET DOWN', '#8fd160'); api.sfx.thud && api.sfx.thud();
  }
  function free(V) {
    const H = V.ptH, C = H && H.by; if (!C) { V.ptH = null; return; }
    release(C, V);
    V.x = C.x - C.face * 12; V.y = C.y; V.vx = -C.face * 70; V.vy = -90; V.ground = false; V.ptSafe = PT.safeT; V.grace = Math.max(V.grace || 0, 0.4);
    C.ptCd = PT.freeCd; stats.frees++; say(V.x, V.y - 30, 'WIGGLED FREE', '#8fd160'); api.sfx.dodge && api.sfx.dodge(); api.dust(V.x, V.y, 3);
  }
  function drop(C, V, note = 'DROPPED') {
    release(C, V);
    V.x = C.x + C.face * 8; V.y = C.y; V.vx = C.face * 30; V.vy = -60; V.ground = false; V.ptSafe = 0.8; V.grace = Math.max(V.grace || 0, 0.3);
    C.ptCd = PT.freeCd; stats.drops++; say(V.x, V.y - 30, note, '#ff6b6b'); api.sfx.thud && api.sfx.thud();
  }

  /* ---------- time (inside the hero's own pass, before updatePlayer): true = skip his update this frame ---------- */
  function before(p, dt) {
    if (p.ptCd > 0) p.ptCd -= dt; if (p.ptSafe > 0) p.ptSafe -= dt;
    if (p.ptC) {
      const V = p.ptC.v, C = p;
      if (!V || V.ptH == null || V.ptH.by !== C) { C.ptC = null; return false; }
      if (C.dead || C.down > 0) { drop(C, V, 'DROPPED'); return false; }
      if (C.hp < C.ptC.hp0 - 0.001 || C.hurt > 0.25) { drop(C, V, 'DROPPED'); return false; }
      C.ptC.hp0 = C.hp;
      if (C.ptC.ph === 'wind') { C.ptC.t += dt; C.vx = 0; if (C.ptC.t >= PT.windup) throwNow(C); }
      else if (C.ptC) {   // the told arc, from the hand, for the aim now
        const a = PT.aims[C.ptC.aim] || PT.aims.mid, h = handOf(C);
        C.ptC.arc = predict(h.x, h.y, { vx: C.face * a.vx + C.vx * 0.3, vy: a.vy }, api.solid);
      }
      return false;
    }
    if (p.ptH) {
      const H = p.ptH, C = H.by;
      if (!C || !C.ptC || C.ptC.v !== p) { p.ptH = null; return false; }
      if (p.dead || p.down > 0) { release(C, p); return false; }
      const h = handOf(C);
      p.x = h.x; p.y = h.y; p.vx = 0; p.vy = 0; p.ground = false; p.onMover = null; p.coyote = 0; p.climb = false; p.atk = -1; p.dodge = 0; p.block = false;
      p.grace = Math.max(p.grace || 0, 0.12); p.face = -C.face; p.anim += dt;
      H.t += dt; if (!p.ai) H.mash = Math.max(0, H.mash - PT.wiggle.decay * dt);
      if (p.ai) { H.mash += dt / PT.wiggle.aiSecs; if (H.mash >= 1) { free(p); return true; } }
      H.scream -= dt; if (H.scream <= 0) { H.scream = PT.scream; scream(p.hero); }
      if (H.t > 1.2 && !H.said && api.tipDue('wiggle')) { H.said = true; api.hint('MASH ANY BUTTON TO WRIGGLE FREE OF YOUR PARTNER.'); }
      return true;
    }
    if (p.ptF) {
      const f = p.ptF;
      f.t += dt;
      if (Math.abs(p.vx) < 1 && f.t > 0.05) f.vx = 0;   // a wall stopped him: it keeps him stopped
      p.vx = f.vx;                                       // ... and otherwise the air's friction does not eat the throw
      p.hurt = Math.max(p.hurt, 0.12);                   // no controls, and the knocked-about pose
      f.scream -= dt; if (f.scream <= 0) { f.scream = PT.scream; scream(p.hero); }
      return false;
    }
    return false;
  }

  /* ---------- after updatePlayer: what he hit, what hit him, where he came down ---------- */
  function after(p, dt) {
    const f = p.ptF; if (!f) return;
    if (p.dead || p.down > 0 || p.swim || p.climb) { p.ptF = null; return; }
    const pb = api.box(p);
    for (const e of api.enemies()) {
      if (!e.alive || e.harmless || e.gone > 0 || e.turncoat) continue;
      if (f.hit.has(e) || !api.overlap(pb, api.box(e))) continue;
      f.hit.add(e); impact(p, f, e);
      if (!p.ptF) return;
    }
    if (p.ground && f.t > 0.1) land(p, f);
    else if (f.t > PT.flyMax) land(p, f);
  }
  function impact(V, f, e) {
    const C = f.by, dir = Math.sign(f.vx) || V.face || 1, big = api.isBoss(e);
    f.hits++; stats.hits++;
    if (isSpiked(e) && !f.spiked.has(e)) {   // FRIENDLY FIRE: a spiked foe bites the thrown partner and bounces him off
      f.spiked.add(e); stats.spiked++;
      V.grace = 0; V.inv = 0;
      api.damagePlayer(e.x, PT.spikedDmg, { unblockable: true, noKnock: true, name: 'SPIKED' });
      say(e.x, e.y - (e.h || 14) - 8, 'SPIKED', '#ffd36b'); api.sfx.clank && api.sfx.clank(); api.sparks(V.x, V.y - 6, -dir, 8);
      f.vx = -dir * 130; V.vx = f.vx; V.vy = -150; V.ground = false; V.inv = Math.max(V.inv || 0, 0.5);
    } else { f.vx *= big ? -0.3 : PT.hit.bowl; V.vx = f.vx; V.vy = Math.min(V.vy, -70); V.ground = false; }
    let dmg;
    if (big) { dmg = PT.hit.boss; stats.bosses++; }
    else if (e.elite) { dmg = Math.max(1, Math.round(api.fullHp(e) * PT.hit.elite)); stats.elites++; e.stagger = Math.max(e.stagger || 0, PT.hit.stagger); }
    else { dmg = Math.max(PT.hit.base, Math.round(api.fullHp(e) * PT.hit.share)); api.throwFoe(e, dir, PT.hit.push, 'partner', C); }
    api.asPlayer(C, () => api.hurtFoe(e, dmg, V.x - dir * 6, 'partner'));
    say(e.x, e.y - (e.h || 14) - 16, 'THE PARTNER', '#ff9a5c');
    api.hitstop(0.05); api.shake(3); api.sfx.thud && api.sfx.thud(); api.burst(e.x, e.y - (e.h || 14) / 2, 7, ['#ffd36b', '#fff6c8', '#c9d1dc'], 90, 0.4);
  }
  function land(V, f) {
    V.ptF = null; V.ptSafe = PT.safeT; V.hurt = Math.max(V.hurt, PT.landHurt); V.grace = Math.max(V.grace || 0, PT.landGrace); V.vx *= 0.2;
    stats.landings++; api.dust(V.x, V.y, 6); api.sfx.thud && api.sfx.thud(); api.shake(1.5);
  }

  /* ---------- once a frame, outside the passes: the first-time hint ---------- */
  let closeT = 0, hinted = false;
  function tick(dt) {
    const ps = api.players(); if (ps.length < 2) { closeT = 0; return; }
    const a = ps[0], b = ps[1];
    if (a.ptC || b.ptC || a.ptH || b.ptH || a.ptF || b.ptF) { closeT = 0; return; }
    const near = api.upright(a) && api.upright(b) && Math.abs(a.x - b.x) <= PT.reach && Math.abs(a.y - b.y) <= PT.reachY && !b.ai;
    closeT = near ? closeT + dt : 0; if (!near) hinted = false;
    if (closeT > 1.0 && !hinted) { hinted = true; if (api.tipDue('grab')) api.hint(PT.tip); }
  }
  /* a new level / a respawn: nobody keeps hold of anybody */
  function reset() { for (const p of api.players()) { p.ptC = null; p.ptH = null; p.ptF = null; p.ptCd = 0; p.ptSafe = 0; } closeT = 0; hinted = false; }

  /* ---------- the draw: the dangler's pose, the carrier's heave, the told arc, the wiggle bar ---------- */
  function pose(p, time, R) {
    if (p.ptH) { const k = Math.floor(time * 8 + (p.n || 0)) % 2; return { key: R.jump && k ? 'jump' : 'hurt', frame: k ? 1 : 0, rot: Math.sin(time * 13 + (p.n || 0)) * 0.6 }; }
    if (p.ptF) return { key: 'hurt', frame: Math.floor(time * 10) % 2, rot: Math.sin(time * 17) * 0.75 };
    if (p.ptC && p.ptC.ph === 'wind' && R.windup) return { key: 'windup', frame: 0, rot: -0.18 * (p.face || 1) };
    return null;
  }
  /* c = { g, cx, cy, time, text(s, x, y, col, align, size) } - the arc (the carrier's, while he carries) and the bar (the dangler's) */
  function drawFx(c, p) {
    const { g, cx, cy, time } = c;
    if (p.ptC && p.ptC.arc) drawArc(g, p.ptC.arc, cx, cy, time, COL);
    if (p.ptH) {
      const H = p.ptH, x = Math.round(p.x - cx), y = Math.round(p.y - cy) - 24;
      g.fillStyle = '#1a1620'; g.fillRect(x - 9, y, 18, 4); g.fillStyle = '#3a3444'; g.fillRect(x - 8, y + 1, 16, 2);
      g.fillStyle = Math.floor(time * 8) % 2 ? '#ffd36b' : '#fff6c8'; g.fillRect(x - 8, y + 1, Math.round(16 * H.mash), 2);
      if (H.t > 0.4 && !api.reduceMotion() && c.text) c.text('MASH', x, y - 8, '#ffd36b', 'center', 6);
    }
    if (p.ptC && p.ptC.ph === 'wind') {   // the told wind-up: an amber ring closing on the carrier
      const k = 1 - Math.min(1, p.ptC.t / PT.windup), x = Math.round(p.x - cx), y = Math.round(p.y - cy) - 8;
      g.save(); g.globalAlpha = 0.5 + 0.4 * (1 - k); g.strokeStyle = COL; g.lineWidth = 1; g.beginPath(); g.arc(x, y, 7 + 12 * k, 0, Math.PI * 2); g.stroke(); g.restore();
    }
  }
  return { grab, pass, before, after, tick, reset, label, find, pose, drawFx, throwNow, setDown, free, drop, windup, why, stats, partnerOf, handOf, predict: (x, y, v) => predict(x, y, v, api.solid) };
}
