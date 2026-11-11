import * as SKK from './skill-k.js';
import { makeRangerForks } from './ranger-forks.js';   /* (claude/rangerfork) the cloud and the storm */   /* (claude/lategamea) the one skill damage rule: swordDmg x k x amul */
// src/ranger.js - THE RANGER'S KIT (claude/ranger 2026-10-14, scratch/brief-ranger.md: Daniel 10-12, "didn't love the Berserker" - THE RANGER is the
// fourth free starter). A hooded woodland archer: a LONGBOW, a QUIVER of a few arrows she has to go and pick up again, and a HUNTING KNIFE for
// what gets too close. SHE COVERS SOME OF THE SCREEN, NOT ALL OF IT (Daniel's limits): her arrows ARC and DROP (~a third of the screen for a full
// draw), the quiver is small, and the draw roots her.
//   X        TAP: A QUICK SHOT - weak and short (RG.quick): it is loosed when X is let go before the draw starts. Point-blank (a foe at knife's
//            length ahead) or with an empty quiver, X is the KNIFE instead (the ordinary swing, short and weak - main.js attackBox0).
//   HOLD X   THE DRAW (main.js updateCharge / fireHeavy -> loose): she is ROOTED while it comes to full (RG.draw.wind); let go and the arrow goes
//            harder and further the longer it was drawn. Past half a draw it is a HEAVY blow (B14's heavy key). Held at full she keeps it
//            (RG.draw.hold s, then it goes by itself). FOCUS FULL + A FULL DRAW = THE PIERCING SHOT: flat, through a whole line of foes.
//            (claude/chargetiers 10-22: THE THREE-TIER DRAW - held on past the full draw the shot CHANGES: T1 the LONG SHOT (the full draw), T2 the
//            PIERCING SHOT (reached by the hold now, not the focus), T3 the TRIPLE SHOT (Daniel 10-22: a 3-arrow FAN, tight and flat and fast - NOT the pinning shot of the first build).
//            Held at T3 RG.tiers.hold s it goes by itself. FOCUS FULL on a T2/T3 is spent: FOCUSED, it lands harder. See RG.tiers.)
//   UP+X     THE RISING SHOT: an arrow loosed steeply up ('rise': B14's FROM BELOW key; the wing family's key).
//   DOWN+X   on the ground: the KNIFE's low sweep ('sweep'). IN THE AIR: THE DOWNWARD SHOT, her plunge (brief-plunges.md) - an arrow straight
//            down ('plunge': FROM ABOVE) and a small hop UP off the release: she stays above the fight. Empty, it is a knife plunge.
//   C        THE BOW-BASH: a short shove with the stave of the bow. Tapped AS A BLOW LANDS (the shared tap beat) it is HER PARRY (src/riposte.js):
//            nothing taken, the foe reels and is KNOCKED BACK OUT TO RANGE, and her next arrow (or cut) is the RIPOSTE (x2, the 'riposte' tag).
//            A RED !! blow is TOO STRONG. A bash that meets no blow still shoves what is in front of her.
//   DOWN+C   THE SNARE: a little loop of cord and a peg, set at her feet. A common foe that walks into it is HELD (RG.snare.hold), an elite
//            briefly; a boss or a mini is only checked - it leans on his poise, it never holds him (B3/B13).
//   UP+C     HUNTER'S FOCUS, SPENT: THE MARK on the nearest foe ahead - shown THROUGH WALLS (drawn on the late pass), and every blow on it lands
//            RG.mark.mul harder. (The other spend: a FOCUSED T2/T3, above.)
//   DODGE    THE BACKFLIP: away from what she faces (she does not turn), up and over, untouchable for the roll's grace; X IN THE FLIP is a quick
//            shot, and the flip goes on. Tapped FORWARD (the way she faces) it is an ordinary forward roll.
// THE QUIVER: RG.quiver.n arrows. A loosed arrow STICKS where it lands - in a wall, the floor, or the foe it struck (it falls when the foe
// does) - and GLINTS until she walks over it and takes it back. A slow trickle (an arrow every RG.quiver.refill s) refills it, so she is never
// stuck; with none at all she has the knife. HUNTER'S FOCUS fills only from arrows that land from the SWEET SPOT (RG.sweet: not point-blank,
// not at the end of the flight). Every field lives ON THE HERO (P.rgQ, P.rgFocus, P.rgArrows...) so a co-op partner carries her own.
// main.js owns the world, the input and the tal() reads (rgTal); this module owns her arrows, her quiver, her focus, the bash and the snare.
// BK.rg() reads it for tools/ranger.mjs and the bots.
export const RG = {
  hp: 110, dmg: 16,                                  /* base health (src/progression.js) and the knife's / an arrow's base damage (main.js swordDmg) */
  run: 1.04,                                          /* x RUN on foot: light and quick */
  quiver: { n: 5, refill: 12, fletch: 5, pick: 11, life: 30, lost: 3 },   /* arrows; s an arrow trickles back (FLETCHER: fletch); px she picks one up from; s a loosed arrow lies before it is lost */
  quick: { vx: 270, vy: -40, g: 720, dmg: 0.6, st: 4, rec: 0.2 },        /* THE QUICK SHOT: ~70 px (measured in the page) before it is at her feet; a tap's damage */
  draw: { wind: 0.55, vx0: 340, vx1: 420, vy: -55, g: 520, dmg0: 0.9, dmg1: 1.7, st: 9, hold: 3, rec: 0.24, heavyAt: 0.5, slow: 0.35 },   /* THE DRAW: wind s to full; a full one lands ~150 px out (half a screen at most; the SWEET SPOT, ~1/3 of one, is where it pays) */
  rise: { vx: 110, airVx: 20, vy: -390, g: 560, dmg: 1.0 },   /* THE RISING SHOT, steeply up (in the air, nearly straight up) */
  down: { vy: 470, hop: -175, dmg: 1.05, st: 7 },      /* THE DOWNWARD SHOT (her plunge) and the hop it gives her */
  pierce: { vx: 520, range: 240, dmg: 1.7 },          /* THE PIERCING SHOT (T2): flat, through everything in the line (claude/chargetiers: 1.9 -> 2.0, a tier over the LONG SHOT's 1.7) */
  /* (claude/rangerid, Daniel 10-31 Q6/Q9) NO TIER LADDER: ONE DRAW, ONE STEADY WINDOW. at = s of DRAW (past HEAVY_START, x the wind's quickness) the full draw (T1, the LONG SHOT) and the STEADY WINDOW
     (breath held, reticle still: T2, the STEADY SHOT) open at; win = s the window stays open (+ focusWin on a FULL HUNTER'S FOCUS - focus is no longer spent, it deepens the window);
     let go in it and the arrow is EMPOWERED: it pierces the whole line and its DISTANCE BONUS is doubled. Held PAST it the hand shakes (RG.shaky: the shot loses its aim) and, auto s later, it goes by itself. */
  tiers: { at: [0.55, 0.67], win: 0.4, focusWin: 0.2, auto: 0.6, st: [0, 9, 13],
    names: ['', 'LONG SHOT', 'STEADY SHOT'], cols: [null, '#f0ead8', '#9fdc6a'], label: [null, '#fff6d8', '#dfffb0'] },
  shaky: { vy: 70, dmg: 0.85 },                      /* a drawn arrow held past the steady window: it flies wide (+-vy) and a little weaker */
  /* DISTANCE BONUS (Daniel 10-31 Q9): an arrow pays by how far it has flown - a point-blank shot is x0.8 (the knife is the answer there), x1.0 from mid, rising to x1.6 at far px. A STEADY SHOT doubles the bonus (the part over x1.0) */
  dist: { near: 36, mid: 70, far: 280, lo: 0.8, hi: 1.6, empowered: 2 },
  /* (claude/rangerid, Daniel 11-01 3rd jab) THE PUSH KICK: the third knife cut in a run is a boot, not a stab - the foe is shoved OUT TO RANGE (room to shoot) and the cut pays less; mul = the blow, push = the shove's speed, a boss or elite is only staggered */
  kick: { mul: 0.8, push: 380, stagger: 0.7, bossStagger: 0.25, reach: 25, step: 70 },
  volleyCost: 2, volleyCd: 6,
  sweet: { near: 52, far: 138, quick: 14, draw: 26, rise: 10, down: 10 },   /* px from where it was loosed; focus each arrow that lands in it gives */
  mark: { t: 10, mul: 1.33, apex: 1.5, range: 300, tSteady: 5 },   /* (claude/ults) a STEADY SHOT that lands marks its quarry for tSteady s - the mark's new home (UP+C is the ultimate now) */
  /* (claude/ults, Daniel 11-01) THE GREAT ARROW = HER ULTIMATE: UP+C at a FULL Focus. A rooted draw of `draw` s (only SHE roots: the world does not slow, co-op safe), then one huge arrow flies `range` px (a screen's width; main.js passes the view),
     piercing everything in its line. It pays by DISTANCE FLOWN: swordDmg x (dmg0 at her feet -> dmg1 at the far edge); a BOSS or a mini takes x boss on top and is staggered `stagger` s. Focus is spent as it leaves (a hit or a roll that breaks the draw keeps it). */
  great: { draw: 0.5, vx: 900, range: 320, dmg0: 2.0, dmg1: 4.5, boss: 1.5, stagger: 1.0, miniStagger: 0.8, rec: 0.3 },  /* THE MARK: s; x on every blow; px ahead it reaches (through walls) */
  knife: { reach: 18, dmg: 1.0 },                    /* THE KNIFE: a short cut (its box is 17 out, main.js attackBox0: a foe whose near edge is inside reach is POINT-BLANK), a little lighter than a sword */
  guard: { hold: 0.24, proj: 0.4, melee: 1.0, drain: 0.8, breakTired: 1.2, minProj: 2 },   /* (claude/heroblocksb) THE BOW GUARD (HOLD C): s held before it is raised; x the shield's block cost for a projectile (stopped dead) and for a blade (half the blow); x the shared hold drain; s she cannot guard after it breaks; least wind an arrow costs */
  bash: { t: 0.22, rec: 0.18, st: 8, reach: 17, push: 210, dmg: 0.45, beat: 1 },   /* THE BOW-BASH: s up, s after; the shove; beat x the shared tap beat */
  flip: { vx: 175, vy: -235, high: 1.25, shots: 1 },  /* THE BACKFLIP: off the ground; HIGH FLIP x high */
  /* (claude/herofeel, Daniel 11-02 21:17) ARROW RECALL, her new DOWN+C: she kneels and yanks the cords. COSTS A LOT (stFrac of her bar) and ROOTS her kneeling `root` s - no walk, roll or jump; a hit during it still lands, and if it lands before the yank (`yank` s) the recall is lost (arrows already called keep flying). Stuck arrows within `range` px fly back to the quiver at `speed`, nicking each foe they pass for `dmg` x a sword cut. */
  recall: { stFrac: 0.5, root: 1.5, yank: 0.45, range: 128, speed: 480, dmg: 0.3 },
  snare: { st: 12, life: 14, hold: 1.6, eliteHold: 0.8, bossLean: 22, dmg: 0.5, cd: 0.7, toothed: 4 / 3 },
  /* (claude/heropassa, Daniel 10-15 interview) ARROW SNATCH: the bow-bash ON THE BEAT against a PROJECTILE catches it - nothing taken, +1 arrow to her quiver; with the quiver
     full it is FLUNG BACK the way it came as her riposte arrow (a free arrow, the 'riposte' tag). r: px from her middle it is caught at. KNEELING DRAW: crouched still for
     settle s, a held X is drawn FROM THE KNEE - wind x wind (~30% faster), the arrow x vx flatter (vy) and further, the sweet spot's Focus x focus; the crouch is the low
     profile (a HIGH blow goes over her, src/duck.js). Distinct from the Death Knight's GRAVE KNEEL (it turns a LOW blow) and the Paladin's prayer (no guard at all) */
  snatch: { r: 18, dy: 16, flingVx: 380, flingDmg: 1.2 },
  kneel: { settle: 0.15, wind: 0.7, vx: 1.15, vy: 0.45, g: 0.85, focus: 1.5 },
  restock: { delay: 0.4, each: 1.3 },                 /* CROUCH TO RESTOCK (Daniel 10-14): DOWN held STILL on the ground delay s, then an arrow from the hip pouch every each s up to full; moving, a swing, a jump, a roll, a draw or a hit cancels it and resets the delay */
  perk: { quiver: 1, focus: 1 },                      /* LEVELING2's hero perks (FULL QUIVER, PATIENT EYE): main.js applyUpgrades sets these from the card; 1 = none */
  /* WEIGHT (claude/weight): her row of its commit table (src/commit.js reads COMMIT.ranger) - kept here as the record */
  commit: { light: 0.12, third: 0.18, up: 0.12, heavy: 0.24, roll: 22, rollInv: 0.2, rollT: 0.34 },
};
const ARROW_HIT = 3;   /* half-size of an arrow's point, px */
/* (claude/chargetiers) THE TIER A DRAW HAS REACHED: held = s X has been down (main.js P.atkHeld), q = the wind's quickness (heavyWind / RG.draw.wind: STEADY DRAW, the knee, the
   technique rank), start = main.js HEAVY_START (the press before the draw shows). 0 = a partial draw (still a shot, weaker) */
export const rgTierAt = (i, q = 1, start = 0.14) => start + RG.tiers.at[Math.min(i, 2) - 1] * q;
export const RGF = { winEx: 0, focusWin: 1 };   /* (claude/rangerfork) STEADY BREATH widens the steady window (s), DEEP EYE doubles what a full Focus adds: update() sets them from the picks; 0 / 1 = the base */
export const rgWinEnd = (q = 1, start = 0.14, focus = false) => rgTierAt(2, q, start) + (RG.tiers.win + RGF.winEx + (focus ? RG.tiers.focusWin * RGF.focusWin : 0)) * q;
export const rgShakyAt = (held, q = 1, start = 0.14, focus = false) => held > rgWinEnd(q, start, focus) + 1e-6;
export const rgTierFor = (held, q = 1, start = 0.14, focus = false) => held >= rgTierAt(2, q, start) - 1e-6 && held <= rgWinEnd(q, start, focus) + 1e-6 ? 2 : held >= rgTierAt(1, q, start) - 1e-6 ? 1 : 0;
export const distMul = (d, empowered = false) => { const D = RG.dist; if (d < D.near) return D.lo; const m = d <= D.mid ? 1 : 1 + (D.hi - 1) * Math.min(1, (d - D.mid) / (D.far - D.mid)); return empowered && m > 1 ? 1 + (m - 1) * D.empowered : m; };

export function makeRanger(api) {
  const stats = { quick: 0, draws: 0, full: 0, rises: 0, downs: 0, pierces: 0, knife: 0, hits: 0, sweet: 0, focusFull: 0, marks: 0, markHits: 0, bashes: 0, parries: 0, tooStrong: 0, guards: 0, guardStopped: 0, guardHalf: 0, guardBroke: 0, guardRed: 0, guardBolt: 0, guardBehind: 0,
    snares: 0, snared: 0, restocked: 0, snatched: 0, flung: 0, kneels: 0, kneelHits: 0, flips: 0, flipShots: 0, picked: 0, refilled: 0, lost: 0, stuckWall: 0, stuckFoe: 0, empty: 0, riposteShots: 0,
    tier1: 0, tier2: 0, steady: 0, shaky: 0, far: 0, near: 0, kicks: 0, volleys: 0, volleyShort: 0 };   /* (claude/chargetiers) the three tiers loosed, the fan's arrows that landed, FOCUSED T2/T3 */
  const P = () => api.P, T = () => api.tal();
  const fk = id => !!(api.fork && api.fork(id));   /* (claude/rangerfork) a RANGER fork SIDE (src/forks-ranger.js) is picked and live: false with FORKS_SHIP off, for another hero, in an EVEN-L1 duel */
  const RFK = makeRangerForks(api, fk, P);   /* (claude/rangerfork) the smoke cloud / veil and the arrow storm */
  const mulK = (x, k) => 1 + (x - 1) * k;
  const sweetBand = () => [fk('rclose') ? 0 : fk('rtsharpeye') ? 70 : RG.sweet.near, fk('rlongeye') ? 1e9 : fk('rtwidesweet') ? 190 : fk('rtsharpeye') ? 110 : RG.sweet.far];   /* (claude/rangerfork) the sweet spot: CLOSE QUARTERS opens it down to 0, LONG EYE has no far end, WIDE / SHARP EYE move it */   /* (claude/traitdata-a) a multiplier x whose BONUS scales with the trait's rank k (T() hands the rank; exactly x at k = 1) */
  const maxQ = () => RG.quiver.n + (T().deep ? 1 : 0);
  const refillT = () => (T().fletch ? RG.quiver.fletch : RG.quiver.refill) / RG.perk.quiver;
  const isFree = p => !p.dead && !(p.asleep > 0);
  /* ---- THE QUIVER ---- */
  function ensure(p) { p.rgStance = 'bow'; if (p.rgQ === undefined) p.rgQ = maxQ(); if (!p.rgArrows) p.rgArrows = []; if (!p.rgSnares) p.rgSnares = []; }
  const arrows = () => { const p = P(); ensure(p); return p.rgQ; };
  function takeArrow(p) { ensure(p); if (p.rgQ <= 0) { stats.empty++; return false; } p.rgQ--; p.rgRefT = 0; return true; }
  function giveArrow(p, n = 1, why) { ensure(p); const was = p.rgQ; p.rgQ = Math.min(maxQ(), p.rgQ + n); if (p.rgQ > was && why) { api.ringAt(p.x, p.y - 16, 8, '#e8dcb0', 0.18); } return p.rgQ - was; }

  /* ---- HUNTER'S FOCUS ---- */
  function focusGain(p, n) { if (!(n > 0)) return; const was = p.rgFocus || 0; p.rgFocus = Math.min(100, was + n * (T().keen && !fk('rtdeepeye') ? mulK(fk('rtquickeye') ? 1.5 : 1.25, T().keen) : 1) * RG.perk.focus);
    if (was < 100 && p.rgFocus >= 100) { stats.focusFull++; api.meterReady('#9fdc6a'); api.teach('focus'); } }
  const focusFull = p => (p.rgFocus || 0) >= 100;

  /* ---- THE MARK ---- */
  const markOn = e => !!e && e.alive && (e.rgMarkT || 0) > api.time;
  const markMul = e => markOn(e) ? (T().apex ? RG.mark.apex : RG.mark.mul) : 1;
  function markFoe(p, e, why, t) { if (!e || !e.alive || e.harmless) return false; e.rgMarkT = api.time + (t || RG.mark.t) * (T().longMark ? (fk('rtpassmark') ? 1 : mulK(fk('rtlongmark') ? 2.5 : 1.5, T().longMark)) : 1); e.rgMarkBy = p; stats.marks++;
    api.number(e.x, e.y - (e.h || 16) - 18, why || 'QUARRY', '#ff7a5a'); api.ringAt(e.x, e.y - (e.h || 16) / 2, 16, '#ff7a5a', 0.3); api.SFX.rgMark && api.SFX.rgMark(); return true; }
  /* the nearest foe AHEAD of her within RG.mark.range - walls do not hide it (a hunter knows where her quarry is) */
  function quarry(p, range = RG.mark.range) { let best = null, bd = 1e9;
    for (const e of api.enemies) { if (!e.alive || e.harmless || e.gone > 0 || e.turncoat) continue; const dx = (e.x - p.x) * p.face; if (dx < -4 || dx > range || Math.abs(e.y - p.y) > 90) continue;
      const d = dx + Math.abs(e.y - p.y) * 0.5; if (d < bd) { bd = d; best = e; } } return best; }

  /* ---- HER STANCE (Daniel 10-15): BOW (X shoots; an empty quiver is the knife) or KNIFE (X is always the knife). Kept through deaths and levels ---- */
  function toggleStance(p) { ensure(p); p.rgStance = 'bow'; return 'bow'; }   /* (claude/herofeel, Daniel 11-02: the bow/knife swap is GONE - X auto-knifes point-blank or empty, nothing to swap; kept as a no-op for old callers) */
  function toggleStanceOld(p) { ensure(p); p.rgStance = p.rgStance === 'knife' ? 'bow' : 'knife'; p.rgNock = null;
    api.number(p.x, p.y - 26, p.rgStance === 'knife' ? 'KNIFE' : 'BOW', p.rgStance === 'knife' ? '#c9d4e0' : '#e8dcb0'); api.SFX.rgPick && api.SFX.rgPick();
    api.kitPose(p, p.rgStance === 'knife' ? 'rgSling' : 'rgBowUp', 0.26); p.rgStanceAt = api.time; return p.rgStance; }   /* (claude/rangerhud) the swap has a body: the bow slung to her back and the knife drawn, or the bow swung round */
  const bowReady = () => { const p = P(); ensure(p); return p.rgQ > 0 && p.rgStance !== 'knife'; };   /* (main.js: a held X is her draw only then - else the knife's heavy) */

  /* ---- AN ARROW ----
     state: 'fly' (in the air), 'foe' (in a foe: it rides it), 'stuck' (in a wall or the floor), 'lie' (on the ground), 'drop' (falling), 'gone' */
  function loose(p, o) { ensure(p);
    const a = { x: p.x + p.face * 7, y: p.y - (o.low ? 7 : 10), vx: o.vx, vy: o.vy, g: o.g, dmg: o.dmg, tag: o.tag, kind: o.kind, state: 'fly', t: 0, hit: new Set(), x0: p.x, y0: p.y - 10,
      pierce: !!o.pierce, free: !!o.free, focus: o.focus || 0, range: o.range || 0, rip: false, wild: !!o.wild };
    if (p.riposteT > 0 && !o.free) { a.rip = true; p.rgRipNow = true; a.tag = [].concat(a.tag, 'riposte'); p.riposteT = 0; p.ripSrc = null; stats.riposteShots++; }   /* (claude/riposte) HER RIPOSTE IS AN ARROW: the parry's window spent on it */
    if (p.rgWildT > 0 && !o.free) a.wild = true;
    p.rgArrows.push(a); return a; }
  const angleOf = a => Math.atan2(a.vy, a.vx);
  /* the shot's pose - or, for the arrow that is her RIPOSTE, the riposte strike (riposteKit's ripo: the step-in, the loose with its gold flash, the follow-through) */
  const pose = (p, k, t) => { if (p.rgRipNow) { p.rgRipNow = false; api.kitPose(p, 'ripo', 0.3); } else api.kitPose(p, k, t); };
  function arrowHit(p, a, e) {
    const hp0 = e.hp, d = Math.abs(a.x - a.x0), SB = sweetBand(), sweet = d >= SB[0] && d <= SB[1] && !a.free;
    let dmg = a.dmg; if (sweet && T().eagle) dmg *= mulK(fk('rtwidesweet') ? 1.2 : fk('rtsharpeye') ? 1.6 : 4 / 3, T().eagle);
    if (fk('rlongeye') && d >= 140 && !a.great) dmg *= 1.2;   /* (claude/rangerfork) LONG EYE */
    const big = !!(e.maxHp || e.mini || e === api.boss);
    if (a.great) { const G = RG.great, k = Math.min(1, d / Math.max(1, a.range || G.range)); dmg = api.swordDmg() * (G.dmg0 + (G.dmg1 - G.dmg0) * k) * (big ? G.boss : 1) * (a.longDraw ? 1.3 : 1); api.number(e.x, e.y - (e.h || 16) - 26, 'GREAT ARROW x' + (dmg / Math.max(1, api.swordDmg())).toFixed(1), '#ffd36b'); stats.greatHits = (stats.greatHits || 0) + 1; stats.greatMax = Math.max(stats.greatMax || 0, Math.round(dmg)); }
    let dm = a.great ? 1 : distMul(d, !!a.emp); if (dm < 1 && (a.parting || fk('rclose'))) dm = 1;   /* (claude/rangerfork) PARTING SHOT / CLOSE QUARTERS: no point-blank penalty */ dmg *= dm; if (dm >= 1.3) { stats.far++; api.number(e.x, e.y - (e.h || 16) - 26, a.emp ? 'STEADY x' + dm.toFixed(1) : 'FAR x' + dm.toFixed(1), a.emp ? '#dfffb0' : '#e8dcb0'); } else if (dm < 1) stats.near++;   /* (claude/rangerid) THE DISTANCE BONUS */
    if (T().bodkin && e.guardT > 0 && ((a.kind === 'draw' && a.full) || fk('rtneedle'))) { const fullD = a.kind === 'draw' && a.full, cut = fullD ? (fk('rtshatter') ? 1 : T().bodkin) : 0.5 * T().bodkin; e.guardT = e.guardT * (1 - cut);   /* BODKIN: a full draw leaves 30% / 15% / none of the guard (SHATTER POINT: none and a stagger; NEEDLE: any arrow takes half of it) */ api.number(e.x, e.y - (e.h || 16) - 14, 'THROUGH', '#ffd36b'); if (fullD && fk('rtshatter') && !big && e.alive) e.stagger = Math.max(e.stagger || 0, 0.5); }   /* BODKIN POINTS: as a ball does */
    api.hurtAs(a.tag, e, Math.max(1, Math.round(dmg)), a.x - Math.sign(a.vx || p.face) * 20, false); stats.hits++;
    const landed = e.hp < hp0 || !e.alive;
    if (e.t === 'dummy') { api.trialEvent(a.kind === 'down' ? 'down' : (a.kind === 'draw' && a.full) || a.kind === 'pierce' ? 'heavyblow' : 'hit');   /* (claude/chargetiers: every drawn tier is a heavy blow on the straw) */ if (a.kneel) api.trialEvent('kdraw'); }   /* (claude/heropassa: a kneeling draw's arrow on the far straw) */ if (a.kneel) stats.kneelHits++;   /* (her yard: the straw men count her arrows) */
    if (landed && sweet) { stats.sweet++; focusGain(p, a.focus); if (!p.rgSweetSaid || api.time - p.rgSweetSaid > 1.2) { p.rgSweetSaid = api.time; api.ringAt(e.x, e.y - (e.h || 16) / 2, 10, '#9fdc6a', 0.2); } }
    if (landed && a.wild) markFoe(p, e);
    if (landed && sweet && a.kind === 'quick' && fk('rtrueflight') && api.time - (p.rgTrueAt ?? -9) >= 1) { p.rgTrueAt = api.time; a.wild = true; api.number(e.x, e.y - (e.h || 16) - 14, 'TRUE FLIGHT', '#e8dcb0'); }   /* (claude/rangerfork) TRUE FLIGHT: the arrow comes straight back (wild is set AFTER the hit's mark line, so landArrow gives the arrow back and nothing is marked: she has the one mark, heroaudit item 8) */
    if (landed && a.emp && a.kind === 'pierce' && e.alive && !markOn(e)) markFoe(p, e, 'QUARRY', RG.mark.tSteady);   /* (claude/ults) a steady shot that lands marks its quarry */
    if (landed && a.great && e.alive) { if (big) { e.stagger = Math.max(e.stagger || 0, e.mini || e.maxHp ? RG.great.miniStagger : RG.great.stagger); api.poiseLean && api.poiseLean(e, 30); e.vx = 0; } else { e.stagger = Math.max(e.stagger || 0, 0.8); e.vx = Math.sign(a.vx || p.face) * 200; } api.hitstop(0.08); api.shakeCam(5, p.face * 3); }
    if (landed && a.kind === 'draw' && e.alive && !e.maxHp && !e.mini && !e.elite) { e.stagger = Math.max(e.stagger || 0, a.full ? 0.5 : 0.25); e.vx = Math.sign(a.vx || p.face) * (a.full ? 140 : 70); }
    if (landed && a.barbed && e.alive && !big) { e.stagger = Math.max(e.stagger || 0, e.elite ? 0.25 : 0.5); }   /* (claude/rangerfork) BARBED VOLLEY */
    if (landed && a.barbedMark && e.alive) markFoe(p, e, 'QUARRY', 5);
    if (landed && a.kind === 'quick' && e.alive && !e.maxHp && !e.mini) e.stagger = Math.max(e.stagger || 0, a.parting && !e.elite ? 0.4 : 0.12);
        api.sparks(a.x, a.y, Math.sign(a.vx) || 1, landed ? 4 : 6); if (a.kind === 'draw' || a.kind === 'pierce' || false) api.hitstop(0.04);
    return landed; }
  /* (claude/rangerfork) SEEKER: bend the long arrow onto the nearest foe in front of it, 6 rad/s at most (it is steered, never teleported; a foe it has passed is not sought again) */
  function seekSteer(p, a, dt) { const dir = Math.sign(a.vx) || p.face; let e = a.seekE;
    if (!e || !e.alive || e.gone > 0 || a.hit.has(e)) { e = null; let bd = 1e9; for (const f of api.enemies) { if (!f.alive || f.harmless || f.gone > 0 || f.turncoat || a.hit.has(f)) continue; const dx = (f.x - a.x) * dir; if (dx < 6 || dx > 320 || Math.abs((f.y - (f.h || 16) / 2) - a.y) > 110) continue; const d = dx + Math.abs(f.y - a.y) * 0.5; if (d < bd) { bd = d; e = f; } } a.seekE = e; }
    if (!e) return; const sp = Math.hypot(a.vx, a.vy) || 1, want = Math.atan2((e.y - (e.h || 16) / 2) - a.y, e.x - a.x), cur = Math.atan2(a.vy, a.vx); let df = want - cur; while (df > Math.PI) df -= 2 * Math.PI; while (df < -Math.PI) df += 2 * Math.PI;
    const ang = cur + Math.max(-6 * dt, Math.min(6 * dt, df)); a.vx = Math.cos(ang) * sp; a.vy = Math.sin(ang) * sp; }
  function landArrow(p, a, how) {
    if (a.smoke && a.bigCloud && !a.puffed) { a.state = how; a.t = 0; return; }   /* (claude/rangerfork) BIG CLOUD: a smoke arrow that strikes a foe still puffs (kitStep turns it to smoke) */
    if (a.free || a.wild) { if (a.wild && !a.free) giveArrow(p, 1, 'wild'); a.state = 'gone'; return; }   /* (a skill's arrow is not hers to keep; THE WILD HUNT's comes straight back) */
    a.state = how; a.t = 0; }
  function stepArrows(p, dt) { if (!p.rgArrows || !p.rgArrows.length) return;
    const TS = api.TS;
    for (const a of p.rgArrows) { a.t += dt;
      if (a.state === 'recall') { recallFly(p, a, dt); continue; }   /* (claude/herofeel) ARROW RECALL: flying home through the foes between */
      if (a.state === 'fly') {
        if (a.seek) seekSteer(p, a, dt);
        const steps = Math.max(1, Math.ceil(Math.max(Math.abs(a.vx), Math.abs(a.vy)) * dt / 4));   /* (swept in short steps: a fast arrow never jumps a foe or a wall) */
        for (let s = 0; s < steps && a.state === 'fly'; s++) { const h = dt / steps; a.vy += a.g * h; a.x += a.vx * h; a.y += a.vy * h;
          for (const e of api.enemies) { if (!e.alive || e.harmless || e.gone > 0 || e.turncoat || a.hit.has(e) || !api.overlap({ l: a.x - ARROW_HIT, r: a.x + ARROW_HIT, t: a.y - ARROW_HIT, b: a.y + ARROW_HIT }, api.box(e))) continue;
            a.hit.add(e); const landed = arrowHit(p, a, e);
            if (a.pierce) continue;   /* THE PIERCING SHOT goes on through the line (whatever it met) */
            if (landed && e.alive) { a.state = 'foe'; a.foe = e; a.ox = (a.x - e.x) * (e.face || 1); a.oy = a.y - e.y; a.ang = angleOf(a); stats.stuckFoe++; if (a.free || a.wild) landArrow(p, a, 'foe'); }
            else { a.vx *= -0.2; a.vy = -70; a.state = 'drop'; if (!landed) api.SFX.clank(); if (a.free || a.wild) landArrow(p, a, 'drop'); }
            break; }
          if (a.state !== 'fly') break;
          const tx = Math.floor(a.x / TS), ty = Math.floor(a.y / TS);
          if (api.isSolid(tx, ty)) { a.x -= a.vx * h * 0.5; a.y -= a.vy * h * 0.5; a.ang = angleOf(a); a.vx = 0; a.vy = 0; stats.stuckWall++; api.SFX.rgThunk && api.SFX.rgThunk(); api.sparks(a.x, a.y, -1, 2); landArrow(p, a, 'stuck'); break; } }
        if (a.state === 'fly') { a.ang = angleOf(a);
          if (a.pierce && a.range && Math.abs(a.x - a.x0) > a.range) { if (a.great) { a.state = 'gone'; api.sparks(a.x, a.y, Math.sign(a.vx) || 1, 6); } else { a.state = 'drop'; a.vx *= 0.3; } }   /* (claude/chargetiers: the TRIPLE SHOT's flat flight ends as the pierce's does) */
          if (a.t > 2.6) a.state = 'drop'; } }
      if (a.state === 'foe') { const e = a.foe; if (!e || !e.alive || e.gone > 0) { a.state = 'drop'; a.vx = 0; a.vy = -40; a.foe = null; }
        else { a.x = e.x + a.ox * (e.face || 1); a.y = e.y + a.oy; } }
      if (a.state === 'drop') { a.vy += 640 * dt; a.x += a.vx * dt; const ny = a.y + a.vy * dt, tx = Math.floor(a.x / TS), ty = Math.floor((ny + 1) / TS);
        if (a.vy > 0 && (api.isSolid(tx, ty) || api.isOneWay(api.tileAt(tx, ty)))) { a.y = ty * TS - 1; a.vx = 0; a.vy = 0; a.state = 'lie'; a.t = 0; a.ang = 0.12 * (a.x % 2 ? 1 : -1); }
        else a.y = ny; }
      /* PICKED UP: she walks over it (or stands under it in a wall she can reach) */
      if ((a.state === 'lie' || a.state === 'stuck') && Math.abs(a.x - p.x) < RG.quiver.pick && a.y > p.y - 30 && a.y < p.y + 6 && !p.dead) {
        a.state = 'gone'; stats.picked++; api.trialEvent('quiver'); if (giveArrow(p, 1, 'pick')) { api.SFX.rgPick && api.SFX.rgPick(); } }
      /* LOST: off the level, into a pit, or left too long - the trickle covers it */
      if (a.state !== 'gone' && (a.y > api.LH * TS + 24 || a.x < -40 || a.x > api.LW * TS + 40 || ((a.state === 'lie' || a.state === 'stuck') && a.t > RG.quiver.life))) { a.state = 'gone'; stats.lost++; }
    }
    p.rgArrows = p.rgArrows.filter(a => a.state !== 'gone'); }

  /* ---- THE GREAT ARROW (UP+C at a full Focus; main.js's ultimate registry presses it) ---- */
  const greatReady = () => { const p = P(); ensure(p); return focusFull(p) && !p.rgGreat && !p.dead && (p.ground || p.swim); };
  function greatArrow() { const p = P(); if (!greatReady()) return false;
    p.rgGreat = { t: 0, long: fk('rlongdraw'), storm: fk('rstorm') }; p.rgNock = null; stats.greats = (stats.greats || 0) + 1; api.kitPose(p, 'rgGreat', (p.rgGreat.long ? 0.9 : RG.great.draw) + 0.05); api.number(p.x, p.y - 30, 'GREAT ARROW', '#ffd36b'); api.SFX.rgMark && api.SFX.rgMark(); api.trialEvent('meter'); return true; }
  function greatStep(p, dt, ctx) { const G = p.rgGreat; if (!G) return;
    if (ctx.stunned || p.dead || p.hurt > 0 || p.atk >= 0 || !(p.ground || p.swim)) { p.rgGreat = null; stats.greatBroke = (stats.greatBroke || 0) + 1; api.number(p.x, p.y - 26, 'DRAW BROKEN', '#9aa39a'); return; }   /* a blow, a swing or leaving the ground breaks the draw: the Focus is kept */
    G.t += dt; p.vx = 0;   /* ROOTED: she alone stands still - the world does not slow */
    const GD = G.long ? 0.9 : RG.great.draw;   /* (claude/rangerfork) THE LONG DRAW roots her 0.9 s, its ring grows the whole time */
    if (Math.floor(G.t * 20) % 2 === 0 && Math.random() < (G.long ? 0.8 : 0.5)) api.ringAt(p.x + p.face * 12, p.y - 11, 4 + (G.t / GD) * (G.long ? 14 : 8), '#ffd36b', 0.12);
    if (G.t < GD) return;
    p.rgGreat = null; p.rgFocus = 0; const R = RG.great, range = Math.min(R.range, (typeof api.VW === 'function' ? api.VW() : api.VW) || R.range) * (G.long ? 1.5 : 1);
    if (G.storm) { RFK.stormStart(p); stats.storms = (stats.storms || 0) + 1; p.rgCd = R.rec; api.kitPose(p, 'rgGreatLoose', 0.3); api.SFX.rgLoose && api.SFX.rgLoose(2); api.shakeCam(5, p.face * 3); api.zoomKick(1.05, 0.2); api.number(p.x, p.y - 30, 'ARROW STORM', '#ffd36b'); api.noteVerb && api.noteVerb('great'); return; }   /* (claude/rangerfork) ARROW STORM: eight volleys fall on the strip ahead (src/ranger-forks.js) */
    const a = loose(p, { kind: 'great', vx: p.face * R.vx, vy: 0, g: 0, dmg: 1, tag: ['heavy', 'shot'], pierce: true, free: true, range }); a.great = true; a.full = true; a.range = range; if (G.long) a.longDraw = true; a.x = p.x + p.face * 9; a.y0 = a.y; a.x0 = a.x;
    p.rgCd = R.rec; api.kitPose(p, 'rgGreatLoose', 0.3); api.SFX.rgLoose && api.SFX.rgLoose(2); api.shakeCam(7, p.face * 4); api.zoomKick(1.06, 0.22); api.streaks(p.x + p.face * 12, p.y - 11, 12, ['#fff3b0', '#ffd36b'], 260); api.noteVerb && api.noteVerb('great'); }

  /* ---- THE SHOTS ---- */
  const dmgBase = () => api.swordDmg();
  function quickShot(p, air) { if (!takeArrow(p)) return false; stats.quick++; if (p.dodge > 0) stats.flipShots++;
    const far = T().far ? 1.2 : 1, part = fk('rpartshot') && p.dodge > 0, qn = fk('rquicknock'), a = loose(p, { kind: 'quick', vx: p.face * RG.quick.vx * Math.sqrt(far), vy: RG.quick.vy, g: RG.quick.g / Math.sqrt(far), dmg: dmgBase() * RG.quick.dmg * (part ? 1.5 : qn ? 0.85 : 1), tag: 'shot', focus: RG.sweet.quick });
    if (part) a.parting = true;   /* (claude/rangerfork) PARTING SHOT: the flip's arrow, x1.5, no point-blank cut, staggers a common foe */
    p.rgCd = RG.quick.rec * (qn ? 0.8 : 1); pose(p, air ? 'rgAirShot' : 'rgShot', 0.16); api.SFX.rgLoose && api.SFX.rgLoose(0); api.noteVerb('shot'); api.teachShot(); return true; }
  function riseShot(p) { if (!takeArrow(p)) return false; stats.rises++;
    const air = !p.ground && !p.swim, a = loose(p, { kind: 'rise', vx: p.face * (air ? RG.rise.airVx : RG.rise.vx), vy: RG.rise.vy, g: RG.rise.g, dmg: dmgBase() * RG.rise.dmg, tag: ['rise', 'shot'], focus: RG.sweet.rise });
    if (air) a.x = p.x + p.face * 2;   /* IN THE AIR it goes nearly straight up: what is over her head */
    p.rgCd = RG.quick.rec; pose(p, 'rgRise', 0.2); api.SFX.rgLoose && api.SFX.rgLoose(0); api.noteVerb('rise'); return true; }
  /* THE DOWNWARD SHOT (her plunge): straight down, and a small hop up off the release */
  function downShot(p) { if (!takeArrow(p)) return false; if (!api.spend(RG.down.st)) { giveArrow(p, 1); api.tired(); return false; } stats.downs++;
    const a = loose(p, { kind: 'down', vx: 0, vy: RG.down.vy, g: 300, dmg: dmgBase() * RG.down.dmg, tag: ['plunge', 'shot'], focus: RG.sweet.down });
    a.x = p.x; a.y = p.y - 2;
    p.vy = Math.min(p.vy, RG.down.hop); p.rgCd = RG.quick.rec; pose(p, 'rgDown', 0.24); api.SFX.rgLoose && api.SFX.rgLoose(1); api.noteVerb('plunge'); api.dust(p.x, p.y + 2, 2); return true; }
  /* THE DRAW, LET GO (main.js fireHeavy): wound 0..1 */
  /* (claude/rangerid) tier: 0 a partial draw, 1 THE LONG SHOT (full draw), 2 THE STEADY SHOT (let go inside the window: empowered). shaky: held past the window */
  function release(p, wound, tier = 0, shaky = false) { if (!takeArrow(p)) return false; stats.draws++;
    const k = tier >= 1 ? 1 : Math.max(0, Math.min(1, wound)), full = k >= 0.999, far = (T().far ? 1.2 : 1) * (fk('rbreath') ? 1.25 : 1), heavy = k >= RG.draw.heavyAt;
    if (full) stats.full++; if (tier >= 1) stats['tier' + tier]++;
    const TC = RG.tiers.cols[tier] || '#ffffff', word = RG.tiers.names[tier];
    if (tier === 2) {   /* THE STEADY SHOT (let go inside the window): flat, through the whole line, and its distance bonus doubled */
      stats.pierces++; stats.steady++;
      const a = loose(p, { kind: 'pierce', vx: p.face * RG.pierce.vx, vy: 0, g: 0, dmg: dmgBase() * RG.pierce.dmg, tag: ['heavy', 'shot'], pierce: true, focus: RG.sweet.draw, range: RG.pierce.range * far * (focusFull(p) ? 1.25 : 1) }); a.full = true; a.emp = true;
      api.number(p.x, p.y - 28, word, RG.tiers.label[2]); api.shakeCam(3, p.face * 2); api.zoomKick(1.04, 0.18); api.streaks(p.x + p.face * 12, p.y - 13, 8, ['#dfffb0', TC], 160);
    } else {
      const kn = p.rgKneel ? RG.kneel : null;   /* (claude/heropassa) THE KNEELING DRAW: flatter, further, more Focus from the sweet spot, loosed low */
      const sh = shaky ? RG.shaky : null; if (sh) { stats.shaky++; api.number(p.x, p.y - 28, 'SHAKY', '#9aa39a'); }   /* (claude/rangerid) held past the steady window: the hand shakes */
      const vx = (RG.draw.vx0 + (RG.draw.vx1 - RG.draw.vx0) * k) * Math.sqrt(far) * (kn ? kn.vx : 1), a = loose(p, { kind: 'draw', vx: p.face * vx, vy: RG.draw.vy * (kn ? kn.vy : 1) + (sh ? (Math.random() * 2 - 1) * sh.vy : 0), g: RG.draw.g / Math.sqrt(far) * (kn ? kn.g : 1), dmg: dmgBase() * (RG.draw.dmg0 + (RG.draw.dmg1 - RG.draw.dmg0) * k) * (sh ? sh.dmg : 1), tag: heavy ? ['heavy', 'shot'] : 'shot', focus: RG.sweet.draw * (0.5 + 0.5 * k) * (kn ? kn.focus : 1), low: !!kn });
      if (kn) a.kneel = true;
      a.full = full;
      const splitF = fk('rsplit'); if (full && (splitF || (T().twin && takeArrow(p)))) { const b = loose(p, { kind: 'draw', vx: p.face * vx * 0.94, vy: RG.draw.vy + 30, g: RG.draw.g / Math.sqrt(far), dmg: a.dmg * 0.8 * (splitF ? 1 : T().twin), tag: a.tag, focus: 0, free: splitF }); b.full = true; b.y += 3; }   /* SPLIT SHOT: the second arrow is free (not hers to pick up) */
      if (full) { api.shakeCam(2, p.face * 2); api.zoomKick(1.03, 0.14); }
    }
    if (tier >= 2 && p.rgKneel) { const a = p.rgArrows.at(-1); if (a) a.kneel = true; }   /* (the knee's trial counts any drawn tier) */
    /* (claude/chargetiers) EACH TIER LOOSES IN ITS OWN BODY: the long shot's loose, the piercing shot's flat snap (rgLoose2), the triple shot's heavy follow-through (rgLoose3) */
    p.rgKneel = false; p.rgCd = RG.draw.rec; pose(p, tier === 2 ? 'rgLoose2' : 'rgLoose', tier >= 2 ? 0.26 : 0.22); api.SFX.rgLoose && api.SFX.rgLoose(full ? 2 : 1); if (tier >= 2 && api.SFX.rgTierLoose) api.SFX.rgTierLoose(tier); return true; }

  /* ---- X, PRESSED (main.js: her X before the swing). Returns true when the press is hers (a shot is nocked or loosed); false: it is the knife ---- */
  function pointBlank(p) { for (const e of api.enemies) { if (!e.alive || e.harmless || e.gone > 0 || e.turncoat) continue; const dx = (e.x - p.x) * p.face, hw = (e.w || 12) / 2;
    if (dx > -hw && dx - hw < RG.knife.reach && Math.abs((e.y - (e.h || 16) / 2) - (p.y - 10)) < (e.h || 16) / 2 + 10) return true; }
    return !!(api.gadgetNear && api.gadgetNear(p, RG.knife.reach)); }   /* (claude/smallfix12) a STRIKABLE GADGET (a windlass, a paddle, a capstan...) in knife reach is point-blank too: plain X knifes it even with arrows */
  function press(p, aim) { ensure(p);
    if (p.rgCd > 0) return 'eat';                                         /* (her hands are busy: the press is spent, nothing comes out) */
    if (p.rgStance === 'knife') return false;                              /* KNIFE STANCE (Daniel 10-15): X is the knife, the bow stays on her back */
    p.rgBashT = 0;                                                        /* a shot out of the bash ends it: the riposte comes straight off the parry */
    const air = !p.ground && !p.swim;
    if (air && aim.low) { if (p.rgQ > 0) return downShot(p) ? 'shot' : 'eat'; return false; }   /* empty: a knife plunge */
    if (p.dash > 0 && !p.rgFlip) return false;                            /* X early in a FORWARD roll: the knife's dash attack (the backflip has no dash in it) */
    if (p.rgQ <= 0) { if (!p.rgEmptySaid || api.time - p.rgEmptySaid > 3) { p.rgEmptySaid = api.time; api.number(p.x, p.y - 26, 'OUT OF ARROWS', '#9aa39a'); api.teach('empty'); } return false; }
    if (aim.low && !air) { if ((p.rgDuckT || 0) >= RG.kneel.settle && !pointBlank(p) && !(api.finishNear && api.finishNear())) { p.rgNock = { t: 0, air: false, kneel: true }; return 'nock'; } return false; }   /* DOWN+X on her feet: the knife's low sweep - unless she is already KNELT (crouched still RG.kneel.settle s): then it is THE KNEELING DRAW's nock (claude/heropassa) */
    if (aim.up) return riseShot(p) ? 'shot' : 'eat';
    if (pointBlank(p) && !(p.dodge > 0)) return false;                    /* TOO CLOSE TO DRAW: the knife */
    if (api.finishNear && api.finishNear()) return false;                 /* A BROKEN FOE IN REACH IS FINISHED WITH THE KNIFE (src/finishers.js: the execution is a melee blow) */
    p.rgNock = { t: 0, air, flip: p.dodge > 0 }; return 'nock'; }         /* (the quick shot goes when X is let go before the draw; held, it is the draw) */
  /* every frame, before main.js updateCharge: the nock becomes a quick shot when X is let go, unless the draw has begun */
  function nockStep(p, dt, keyAtk) { const n = p.rgNock; if (!n) return;
    n.t += dt; if (p.charge > 0) { p.rgKneel = !!n.kneel; if (p.rgKneel) { stats.kneels++; api.SFX.rgTick && api.SFX.rgTick(); } p.rgNock = null; return; }   /* (claude/heropassa) the draw begun from the knee is THE KNEELING DRAW */
    if (p.dead || p.hurt > 0) { p.rgNock = null; return; }
    if (!keyAtk) { p.rgNock = null; quickShot(p, n.air || (!p.ground && !p.swim)); } }

  /* ---- THE PUSH KICK (claude/rangerid, Daniel 11-01: the 3rd jab hit is DISTINCT per hero - hers shoves the foe away to make room to shoot). main.js heroCut calls it on the third knife cut that lands.
     A common foe is thrown OUT TO RANGE and knocked; an elite / mini / boss is only staggered a beat (never thrown). Returns true when it shoved ---- */
  function kickHit(p, e) { if (!e || !e.alive) return false; stats.kicks++;
    if (e.maxHp || e.mini || e.elite || (api.knockSkip && api.knockSkip(e))) { e.stagger = Math.max(e.stagger || 0, e.maxHp || e.mini ? RG.kick.bossStagger : RG.kick.stagger * 0.6); api.ringAt(e.x, e.y - (e.h || 16) / 2, 10, '#c8e89a', 0.2); api.number(e.x, e.y - (e.h || 16) - 14, 'PUSHED', '#c8e89a'); return false; }
    e.vx = (Math.sign(e.x - p.x) || p.face) * RG.kick.push * bbK(1.4); e.vy = Math.min(e.vy || 0, -90); knockOut(e, 0.4); e.stagger = Math.max(e.stagger || 0, fk('rtstunbash') ? 0.8 : RG.kick.stagger);
    api.ringAt(p.x + p.face * 12, p.y - 6, 14, '#c8e89a', 0.25); api.sparks(e.x, e.y - (e.h || 16) / 2, p.face, 6); api.number(e.x, e.y - (e.h || 16) - 14, 'PUSH KICK', '#c8e89a'); api.SFX.rgBash && api.SFX.rgBash(); return true; }
  /* ---- THE BOW-BASH (C) and her PARRY ---- */
  const bbK = x => T().bashBack ? mulK(fk('rtfarbash') ? x * 1.5 : fk('rtstunbash') ? x * 0.75 : x, T().bashBack) : 1;   /* (claude/rangerfork) STOUT BOW: LONG SHOVE x1.5 the knock, HEAVY BOW x0.75 and a longer reel */
  function softK(vx) { const p = P(), r = T().softStep || 1;   /* (claude/rangerfork) SOFT STEP's pace while she draws: the base RG.draw.slow; AIMING WALK 0.6 at full rank (either way); BACK STEP 0.7, backward only */
    if (fk('rtwalkdraw')) return RG.draw.slow + (0.6 - RG.draw.slow) * r; if (fk('rtbackdraw')) return (vx || 0) * p.face < 0 ? RG.draw.slow + (0.7 - RG.draw.slow) * r : 0; return RG.draw.slow; }
  const beatLen = () => api.tap() * RG.bash.beat * (T().bashLong ? 4 / 3 : 1);
  const bashUp = p => (p.rgBashT || 0) > 0;
  const onBeat = p => bashUp(p) && api.time - (p.rgBashAt ?? -9) <= beatLen() + 1e-6;
  function bash(p) { if (!api.spend(RG.bash.st)) { api.tired(); return false; } stats.bashes++;
    p.rgBashT = RG.bash.t; p.rgBashAt = api.time; p.rgBashHit = new Set(); p.charge = 0; p.atkHeld = 0; p.rgNock = null; p.vx *= 0.3;
    api.kitPose(p, 'rgBash', RG.bash.t); api.SFX.rgBash && api.SFX.rgBash(); api.teach('bash'); return true; }
  const shove = (p, e, k = 1) => { if (e.maxHp || e.mini || e.elite || (api.knockSkip && api.knockSkip(e))) { e.stagger = Math.max(e.stagger || 0, e.maxHp || e.mini ? 0.15 : 0.35); return; }
    e.vx = (Math.sign(e.x - p.x) || p.face) * RG.bash.push * k * bbK(2); e.vy = Math.min(e.vy || 0, -80); knockOut(e, 0.35 * k); e.stagger = Math.max(e.stagger || 0, fk('rtstunbash') ? 0.8 : 0.5); };
  /* the knock carries on the knock's own velocity (main.js: e.kvx / e.kvy) - set with it, or the foe's position goes NaN */
  const knockOut = (e, t) => { e.knock = Math.max(e.knock || 0, t); e.kvx = e.vx; e.kvy = e.vy; e.knockAir = 0; e.bounced = false; e.slammed = false; };
  function bashStep(p) { if (!bashUp(p)) return;
    const hb = p.face > 0 ? { l: p.x, r: p.x + RG.bash.reach, t: p.y - 22, b: p.y - 2 } : { l: p.x - RG.bash.reach, r: p.x, t: p.y - 22, b: p.y - 2 };
    for (const e of api.enemies) { if (!e.alive || e.harmless || e.gone > 0 || e.turncoat || p.rgBashHit.has(e) || !api.overlap(hb, api.box(e))) continue; p.rgBashHit.add(e);
      api.hurtAs('light', e, Math.max(1, Math.round(dmgBase() * RG.bash.dmg)), p.x, false); shove(p, e, 1); api.sparks(e.x, e.y - (e.h || 16) / 2, p.face, 4); api.hitstop(0.03); } }
  /* A BLOW LANDING ON HER (main.js damagePlayer0): 'blocked' (parried) or null (it finds her: the bash is a shove, not a guard) */
  function bashTakes(fromX, dmg, unblockable, foe, pierce) { const p = P(); if (!bashUp(p)) return null;
    const front = Math.sign(fromX - p.x) === p.face || fromX === p.x; if (!front || !onBeat(p)) return null;
    if (unblockable) { stats.tooStrong++; return null; }                  /* (main.js has said TOO STRONG) */
    if (pierce && !foe) return null;                                      /* a bolt is not knocked aside by a bow */
    stats.parries++; p.parryT = 0.22;
    if (fk('rcounternock')) { giveArrow(p, 1, 'counter'); focusGain(p, 20); api.number(p.x, p.y - 40, 'COUNTER-NOCK', '#e8dcb0'); }   /* (claude/rangerfork) COUNTER-NOCK: the beat turn nocks a fresh arrow */
    if (api.parried) api.parried(foe);                                    /* (claude/riposte) THE BOW-BASH ON THE BEAT is her parry: the window, the foe's reel */
    if (foe && foe.alive) { if (!foe.maxHp && !foe.mini && !foe.elite) { foe.vx = (Math.sign(foe.x - p.x) || p.face) * RG.bash.push * 1.25 * bbK(2); foe.vy = Math.min(foe.vy || 0, -110); knockOut(foe, 0.5); } p.rgBashHit.add(foe); }   /* OUT TO RANGE */
    api.SFX.parry(); api.hitstop(0.08); api.shakeCam(3, -p.face * 2); api.zoomKick(1.04, 0.16);
    api.ringAt(p.x + p.face * 9, p.y - 12, 16, '#c8e89a', 0.3); api.sparks(p.x + p.face * 9, p.y - 12, p.face, 8); api.number(p.x, p.y - 28, 'BOW-BASH', '#c8e89a');
    api.noteParry(); api.trialEvent('parry'); return 'blocked'; }

  /* ---- THE BOW GUARD (claude/heroblocksb, Daniel 10-30 22:15; HOLD C): the tap is the bow-bash and its arrow snatch, unchanged. Held past RG.guard.hold the bow is brought up
     across her front in both hands (chars.js F.rgGuard) and she walks slowly behind it. A PROJECTILE from the front is stopped DEAD (a few points of wind, no damage); a blade from the
     front costs HALF of the blow (and the wind the shield would pay). A RED blow and a bolt go through - the two NOs every guard has - and nothing from behind. Out of wind it
     breaks: the whole blow, the stagger and the exhaust. A swing, a draw, a roll, a flip, the snare and the mark drop it; a still-held C raises it again. ---- */
  const guardUp = p => !!p.rgGuard;
  function guardStep(p, dt, keys, ctx) {
    p.rgHeld = keys.block && !p.dead ? (p.rgHeld || 0) + dt : 0;
    const want = !p.dead && p.rgHeld >= RG.guard.hold && !keys.up && !keys.down && !ctx.stunned && !ctx.dodging && !ctx.attacking && ctx.guardOk !== false && !p.plunge && !(p.rgBashT > 0)
      && !(p.charge > 0) && !p.rgNock && !p.rgFlip && !(p.drinkT > 0) && (p.ground || p.swim) && !(p.guardTired > 0) && (p.st || 0) > 0;
    if (want && !p.rgGuard) { p.rgGuard = true; p.rgGuardT = 0; stats.guards++; api.SFX.braceSet && api.SFX.braceSet(); api.ringAt(p.x + p.face * 8, p.y - 11, 9, '#c8e89a', 0.2); api.teachGuard && api.teachGuard(); }
    else if (!want && p.rgGuard) { p.rgGuard = false; p.rgGuardT = 0; }
    if (!p.rgGuard) return;
    p.rgGuardT += dt; p.st -= api.ST.hold * RG.guard.drain * (fk('rlightbow') ? 0 : 1) * dt; p.stDelay = api.ST.delay;
    if (p.st <= 0) { p.st = 0; p.rgGuard = false; p.guardTired = 0.8; p.stFlash = 0.5; api.SFX.guardBreak(); api.number(p.x, p.y - 22, 'TIRED', '#ffd36b'); }
  }
  /* A BLOW LANDING ON HER (main.js damagePlayer0): 'blocked' (a projectile stopped dead), 'half' (a blade: half the blow finds her; or the guard broke - see p.rgGuardBroke) or null.
     proj: the blow is a seed in flight (main.js hands geo for every projectile it measures against her body) */
  function guardTakes(fromX, dmg, unblockable, foe, pierce, proj) {
    const p = P(); if (!guardUp(p)) return null;
    const front = Math.sign(fromX - p.x) === p.face || fromX === p.x; if (!front) { stats.guardBehind++; return null; }
    if (unblockable) { stats.guardRed++; return null; }                                       /* a RED blow is never turned */
    if (pierce) { stats.guardBolt++; api.number(p.x, p.y - 30, 'THROUGH THE BOW', '#ff6b6b'); api.SFX.pierce && api.SFX.pierce(); return null; }   /* a bolt goes through a guard that was already up */
    const base = api.blockCost(dmg), cost = proj ? Math.max(RG.guard.minProj, Math.round(base * RG.guard.proj)) : Math.round(base * RG.guard.melee * (fk('rlightbow') ? 1.5 : 1));
    if ((p.st || 0) < cost) {                                                                 /* THE BOW GIVES: the whole blow, the stagger, the exhaust */
      p.st = 0; p.stFlash = 0.5; p.rgGuard = false; p.rgGuardT = 0; p.rgHeld = 0; stats.guardBroke++; api.SFX.guardBreak(); api.shakeCam(5, -p.face * 4); api.hitstop(0.1);
      p.hurt = api.STAM.breakStagger; p.guardTired = Math.max(api.STAM.breakTired, RG.guard.breakTired); api.exhaust(p); api.number(p.x, p.y - 22, 'GUARD BREAK', '#ffd36b'); return null; }
    p.st -= cost; p.stDelay = api.ST.delay;
    if (proj) {                                                                               /* AN ARROW (or anything thrown) STOPPED ON THE BOW: the snatch's own sound, a short stop */
      stats.guardStopped++; api.SFX.rgPick && api.SFX.rgPick(); api.SFX.block && api.SFX.block(); api.hitstop(0.045); api.shakeCam(1, -p.face * 1);
      api.ringAt(p.x + p.face * 10, p.y - 12, 12, '#c8e89a', 0.22); api.sparks(p.x + p.face * 10, p.y - 12, p.face, 5); api.number(p.x, p.y - 28, 'STOPPED', '#c8e89a'); return 'blocked'; }
    stats.guardHalf++; api.SFX.block && api.SFX.block(); api.hitstop(0.05); api.shakeCam(2, -p.face * 2);
    api.ringAt(p.x + p.face * 9, p.y - 12, 11, '#c8e89a', 0.22); api.sparks(p.x + p.face * 9, p.y - 12, p.face, 6); api.number(p.x, p.y - 28, 'HALF', '#c8e89a'); return 'half'; }

  /* ---- ARROW SNATCH (claude/heropassa): main.js calls it before the seeds meet her body, as the ember flare's catch. The bash ON THE BEAT takes a yellow
     projectile out of the air in front of her: nothing taken, +1 arrow - or, the quiver full, it is flung straight back as her riposte arrow. A red one (noBlock,
     unblockable) and a chain (a haul, not a missile) go on to her ---- */
  function snatchSeeds() { const p = P(); if (!onBeat(p) || !api.seeds) return;
    for (const s of api.seeds) { if (s.dead || s.reflected || s.chain || s.noBlock || s.unblockable || s.owner === p) continue;
      const dx = (s.x - p.x) * p.face; if (dx < -4 || dx > RG.snatch.r || Math.abs(s.y - (p.y - 10)) > RG.snatch.dy) continue;
      if (api.boltHome && api.boltHome(s)) { stats.snatched++; p.parryT = 0.22; api.kitPose(p, 'rgSnatch', 0.22); api.SFX.rgPick && api.SFX.rgPick(); api.hitstop(0.05); api.ringAt(p.x + p.face * 9, p.y - 12, 14, '#e8dcb0', 0.25); api.noteParry(); api.trialEvent('snatch'); return; }   /* (claude/moorpass) THE WINDCALLER's bolt: caught and loosed straight back home (main.js sendBoltHome) */
      s.dead = true; stats.snatched++; p.parryT = 0.22; api.kitPose(p, 'rgSnatch', 0.22); p.rgSnatchFx = { x: s.x, y: s.y, hx: p.x + p.face * 14, t: 0.34, max: 0.34, fling: !(p.rgQ < maxQ()) };   /* (claude/heropassaart) the catch star */
      api.SFX.rgPick && api.SFX.rgPick(); api.hitstop(0.05); api.ringAt(p.x + p.face * 9, p.y - 12, 14, '#e8dcb0', 0.25); api.sparks(s.x, s.y, -p.face, 5);
      if (giveArrow(p, 1, 'snatch')) api.number(p.x, p.y - 28, 'SNATCHED', '#e8dcb0');
      else { stats.flung++; loose(p, { kind: 'quick', vx: p.face * RG.snatch.flingVx, vy: -20, g: RG.quick.g * 0.6, dmg: dmgBase() * RG.snatch.flingDmg, tag: ['riposte', 'shot'], free: true }); api.number(p.x, p.y - 28, 'FLUNG BACK', '#e8dcb0'); }
      api.noteParry(); api.trialEvent('snatch'); return; } }
  /* ---- THE SNARE (DOWN+C) ---- */
  const snareHk = () => fk('rlongsnare') ? 1.25 : fk('rtwosnares') ? 0.625 : 1;   /* (claude/rangerfork) LONG SNARE holds 2 s; TWO SNARES hold 1 s each */
  function setSnare(p) { if (!(p.ground) || p.rgSnareCd > 0) return false; if (!api.spend(RG.snare.st)) { api.tired(); return false; }
    ensure(p); const n = T().snares || fk('rtwosnares') ? 2 : 1; while (p.rgSnares.length >= n) p.rgSnares.shift();
    p.rgSnares.push({ x: p.x, y: p.y, life: RG.snare.life * (T().snares || 1), sprung: 0, held: null, hk: snareHk() }); p.rgSnareCd = RG.snare.cd; stats.snares++;
    api.kitPose(p, 'rgSnare', 0.3); api.SFX.rgSnare && api.SFX.rgSnare(); api.teach('snare'); return true; }
  function snareStep(p, dt) { if (!p.rgSnares || !p.rgSnares.length) return; const tr = T().toothed, tooth = tr ? (fk('rthold') ? 1 : mulK(fk('rtbite') ? 2 : RG.snare.toothed, tr)) : 1, holdK = tr ? (fk('rtbite') ? 1 : mulK(fk('rthold') ? 2 : RG.snare.toothed, tr)) : 1;   /* TOOTHED SNARE: SHARP TEETH = bite x2, DEEP SNARE = hold x2 (rank scaled) */
    for (const s of p.rgSnares) { s.life -= dt; if (s.sprung > 0) { s.sprung -= dt; if (s.held && s.held.alive) { s.held.vx = 0; s.held.x += (s.x - s.held.x) * Math.min(1, dt * 10); } continue; }
      for (const e of api.enemies) { if (!e.alive || e.harmless || e.gone > 0 || e.turncoat || e.noGrav || e.fly || Math.abs(e.x - s.x) > (e.w || 12) / 2 + 4 || Math.abs(e.y - s.y) > 6) continue;
        stats.snared++; api.hurtAs('sweep', e, Math.max(1, Math.round(dmgBase() * RG.snare.dmg * tooth)), s.x, false); api.SFX.rgSnap && api.SFX.rgSnap(); api.sparks(s.x, s.y - 2, 0, 5);
        if (e.maxHp || e.mini || e === api.boss) { api.poiseLean(e, RG.snare.bossLean * tooth); e.stagger = Math.max(e.stagger || 0, 0.2); s.life = 0; api.number(e.x, e.y - (e.h || 16) - 14, 'CHECKED', '#c8e89a'); }   /* (a boss is checked, never held: B3/B13) */
        else { const hold = (e.elite ? RG.snare.eliteHold : RG.snare.hold) * holdK * (s.hk || 1); e.stagger = Math.max(e.stagger || 0, hold); e.vx = 0; s.sprung = hold; s.held = e; s.life = Math.min(s.life, hold + 0.1); api.number(e.x, e.y - (e.h || 16) - 14, 'SNARED', '#c8e89a'); }
        break; } }
    p.rgSnares = p.rgSnares.filter(s => s.life > 0); }

  /* ---- THE BACKFLIP (main.js dodge start calls flip()): up and back, facing what she left ---- */
  function flip(p, dir) { const k = fk('rhighflip') ? RG.flip.high : T().highFlip ? mulK(RG.flip.high, T().highFlip) : 1; stats.flips++; p.rgFlip = { t: 0, dir }; p.rgFlipShots = 0;
    if (p.ground && !p.swim) p.vy = RG.flip.vy * Math.sqrt(k);
    if (T().cover && api.time - (p.rgCoverAt ?? -9) >= (fk('rtquickcover') ? 1.5 : 3) / T().cover) { const got = giveArrow(p, 1, 'cover'); if (got || fk('rtbreathcover')) { p.rgCoverAt = api.time; if (fk('rtbreathcover')) p.st = Math.min(p.maxSt || 100, (p.st || 0) + (p.maxSt || 100) / 3 * T().cover); } }   /* TAKE COVER: QUICK COVER every 1.5 s, DEEP BREATH also gives back a third of the wind bar */
    api.SFX.rgFlip && api.SFX.rgFlip(); return RG.flip.vx * k * (fk('rpartshot') ? 4 / 3 : 1); }

  function restock(dt, keys) { const p = P(); ensure(p); p.rgDuckT = p.ducking && p.ground && !p.swim ? (p.rgDuckT || 0) + dt : 0; if (p.rgKneel && !p.ducking && !(p.charge > 0)) p.rgKneel = false;   /* (claude/heropassa) how long she has been knelt: THE KNEELING DRAW's settle */
    /* CROUCH TO RESTOCK (main.js calls it right after P.ducking is known this frame): a held, still duck on the ground (main.js sets p.ducking: no walk, swing, guard or roll) draws from the pouch; anything else resets the delay */
    if (p.ducking && p.ground && !p.swim && !p.dead && !(p.hurt > 0) && !(p.dodge > 0) && !p.rgNock && !(p.atk > 0) && !keys.atk && p.rgQ < maxQ()) { p.rgRsT = (p.rgRsT || 0) + dt;
      if (p.rgRsT >= RG.restock.delay) { p.rgRsE = (p.rgRsE || 0) + dt; const ph = p.rgRsE / RG.restock.each; api.kitPose(p, 'rgRestock' + (ph < 0.4 ? 0 : ph < 0.8 ? 1 : 2), 0.1); if (p.rgRsE >= RG.restock.each) { p.rgRsE = 0; if (giveArrow(p, 1, 'restock')) { stats.restocked++; api.trialEvent('restock'); api.SFX.rgTick ? api.SFX.rgTick() : api.SFX.rgPick && api.SFX.rgPick(); } } } }
    else { p.rgRsT = 0; p.rgRsE = 0; }
  }
  /* ---- EVERY FRAME (main.js updatePlayer, the hero's own C block): the timers, the trickle, C, the arrows ---- */
  function update(dt, keys, ctx) {
    const p = P(), t = T(); ensure(p); RGF.winEx = fk('rbreath') ? 0.2 : 0; RGF.focusWin = fk('rtdeepeye') ? 2 : 1;
    for (const k of ['rgBashT', 'rgCd', 'rgSnareCd', 'rgWildT', 'parryT', 'blastT']) p[k] = Math.max(0, (p[k] || 0) - dt);
    if (p.rgSnatchFx) { p.rgSnatchFx.t -= dt; if (p.rgSnatchFx.t <= 0) p.rgSnatchFx = null; }
    if (p.rgQ > maxQ()) p.rgQ = maxQ();
    p.rgMaxQ = maxQ(); p.rgRefMax = refillT();
    if (p.rgQ < maxQ()) { p.rgRefT = (p.rgRefT || 0) + dt; if (p.rgRefT >= refillT()) { p.rgRefT = 0; giveArrow(p, 1, 'refill'); stats.refilled++; api.SFX.rgPick && api.SFX.rgPick(); } } else p.rgRefT = 0;
    if (p.rgFlip) { p.rgFlip.t += dt; if (!(p.dodge > 0) && (p.ground || p.swim || p.rgFlip.t > 0.8)) p.rgFlip = null; }
    if (p.rgMarkE && !markOn(p.rgMarkE)) p.rgMarkE = null;
    nockStep(p, dt, !!keys.atk);
    const cDown = keys.block && !p.cWas; p.cWas = !!keys.block;
    const free = !ctx.stunned && !p.plunge && !(p.rgBashT > 0) && !p.dead && !p.rgRecall && !(ctx.dodging && !p.rgFlip);
    if (p.rgGreat) greatStep(p, dt, ctx);
    if (cDown && free && keys.up) { if (!focusFull(p) && (!p.rgFocusSaid || api.time - p.rgFocusSaid > 1.2)) { p.rgFocusSaid = api.time; api.number(p.x, p.y - 26, 'FOCUS ' + Math.floor(p.rgFocus || 0) + '%: SWEET-SPOT HITS FILL IT', '#9aa39a'); } }   /* UP+C is THE GREAT ARROW (main.js's ultimate input fires it at a full Focus before this runs); below full it only says why */
    else if (cDown && free && keys.down && p.ground) startRecall(p);                              /* DOWN+C: ARROW RECALL (claude/herofeel; the snare is a store skill now) */
    else if (cDown && free && !ctx.dodging) { if (ctx.guardOk === false) p.stFlash = 0.35; else bash(p); }   /* C: THE BOW-BASH (WINDED: none) */
    guardStep(p, dt, keys, ctx);   /* (claude/heroblocksb) HOLD C: THE BOW GUARD */
    recallStep(p, dt); bashStep(p); stepArrows(p, dt); snareStep(p, dt);
    /* THE DRAW ROOTS HER (SOFT STEP: a slow walk; AIR DRAW: the fall slows while she holds it) */
    if (p.charge > 0) { if (p.ground || p.swim) { if (!t.softStep) p.vx = 0; else p.vx *= RG.draw.slow * t.softStep; } else { const ad = t.airDraw || (fk('rhighflip') ? 1 : 0); if (ad && p.vy > 40 + 80 * (1 - ad)) p.vy = 40 + 80 * (1 - ad); } }
  }

  /* ---- HER NINE BOUGHT ACTIVES (main.js rangerKit presses them through skillPress / cdReady / spend, like everyone's) ---- */
  /* ---- ARROW RECALL (DOWN+C): see RG.recall ---- */
  const recallable = (p, a) => (a.state === 'lie' || a.state === 'stuck' || a.state === 'foe') && Math.abs(a.x - p.x) <= RG.recall.range && Math.abs(a.y - p.y) <= RG.recall.range;
  function startRecall(p) { if (!p.ground || p.rgRecall || p.rgCd > 0) return false; ensure(p);
    if (!(p.rgArrows || []).some(a => recallable(p, a))) { api.number(p.x, p.y - 26, 'NO ARROWS OUT', '#9aa39a'); return false; }
    if (!api.spend(Math.round((p.maxSt || 100) * RG.recall.stFrac))) { api.tired(); return false; }
    p.rgRecall = { t: 0, yanked: false, hp: p.hp }; p.rgNock = null; p.charge = 0; stats.recalls = (stats.recalls || 0) + 1; p.vx = 0; api.kitPose(p, 'rgSnare', 0.3); api.SFX.rgSnare && api.SFX.rgSnare(); return true; }
  function recallStep(p, dt) { const R = p.rgRecall; if (!R) return;
    if (p.dead || p.hurt > 0 || p.hp < R.hp) { p.rgRecall = null; api.SFX.rgSnap && api.SFX.rgSnap(); return; }   /* a blow lands on her and breaks the kneel; what she already called keeps flying */
    R.t += dt; p.vx = 0; p.rgNock = null; p.charge = 0; api.kitPose(p, 'rgSnare', 0.1);
    if (!R.yanked && R.t >= RG.recall.yank) { R.yanked = true; let n = 0; for (const a of p.rgArrows) if (recallable(p, a)) { a.state = 'recall'; a.foe = null; a.t = 0; a.hit = new Set(); n++; }
      api.number(p.x, p.y - 28, 'ARROW RECALL', '#c8e89a'); api.SFX.rgSnap && api.SFX.rgSnap(); api.shakeCam(2); api.streaks(p.x, p.y - 8, 6, ['#e8dcb0', '#c8e89a'], 90); stats.recalled = (stats.recalled || 0) + n; }
    if (R.t >= RG.recall.root) p.rgRecall = null; }
  function recallFly(p, a, dt) { const dx = p.x - a.x, dy = (p.y - 8) - a.y, d = Math.hypot(dx, dy) || 1, st = Math.min(d, RG.recall.speed * dt); a.x += dx / d * st; a.y += dy / d * st; a.vx = dx / d * RG.recall.speed; a.vy = dy / d * RG.recall.speed; a.ang = Math.atan2(a.vy, a.vx);
    for (const e of api.enemies) { if (!e.alive || e.harmless || e.gone > 0 || e.turncoat || a.hit.has(e) || !api.overlap({ l: a.x - ARROW_HIT, r: a.x + ARROW_HIT, t: a.y - ARROW_HIT, b: a.y + ARROW_HIT }, api.box(e))) continue;
      a.hit.add(e); api.hurtAs('shot', e, Math.max(1, Math.round(dmgBase() * RG.recall.dmg)), a.x - Math.sign(a.vx || 1) * 10, false); api.sparks(a.x, a.y, Math.sign(a.vx) || 1, 3); stats.recallHits = (stats.recallHits || 0) + 1; }
    if (d < 10) { a.state = 'gone'; if (giveArrow(p, 1, 'recall')) api.SFX.rgPick && api.SFX.rgPick(); } }
  const kit = {
    /* (claude/herofeel) THE SNARE, now a STORE skill (progression-catalog rgSetSnare): the same RG.snare numbers, set from the skill slot (main.js pays the wind) */
    snare() { const p = P(); if (!p.ground) return false; ensure(p); const n = T().snares || fk('rtwosnares') ? 2 : 1; while (p.rgSnares.length >= n) p.rgSnares.shift(); p.rgSnares.push({ x: p.x, y: p.y, life: RG.snare.life * (T().snares || 1), sprung: 0, held: null, hk: snareHk() }); stats.snares++; api.kitPose(p, 'rgSnare', 0.3); api.SFX.rgSnare && api.SFX.rgSnare(); api.teach('snare'); return true; },
    /* (claude/rangerid, Daniel 10-31 Q9) VOLLEY: 6 s apart (main.js CD_MAX.rgVolley) and TWO ARROWS FROM THE QUIVER - two of its three arrows are hers to pick up again, the third is free. Short of two arrows it does not go */
    volley() { const p = P(); if ((p.rgQ | 0) < RG.volleyCost) return false; for (let i = 0; i < RG.volleyCost; i++) takeArrow(p); stats.volleys++; api.kitPose(p, 'rgVolleyPose', 0.3); const hv = fk('rhighvolley'), bb = fk('rbarbed'); let n = 0; for (const [k, vy] of hv ? [[0.92, -205], [1, -190], [1.06, -175]] : [[0.92, -95], [1, -55], [1.06, -18]]) { const i = n; const a = loose(p, { kind: 'skill', vx: p.face * RG.draw.vx1 * k * (hv ? 0.55 : 1), vy, g: RG.draw.g, dmg: dmgBase() * SKK.K.rgVolley * api.amul('rgVolley'), tag: 'shot', free: n++ === 2 }); if (bb) { a.barbed = true; if (i === 1) a.barbedMark = true; } } api.SFX.rgLoose && api.SFX.rgLoose(2); return true; },   /* (claude/rangerfork) HIGH VOLLEY lobs it steeply (lands ~0.5 s later, farther); BARBED staggers and marks with the middle arrow */
    hawk() { const p = P(), e = quarry(p, 220); api.kitPose(p, 'rgHawkPose', 0.35); p.rgHawk = { x: p.x, y: p.y - 22, e, t: 0, strikes: 0, back: false, stoop: fk('rstoop'), harry: fk('rharry'), done: [] }; api.SFX.rgHawk && api.SFX.rgHawk(); },
    leap() { const p = P(); api.kitPose(p, 'rgLeapPose', 0.4); p.vx = -p.face * 300; p.vy = -260; p.inv = Math.max(p.inv || 0, 0.3); loose(p, { kind: 'skill', vx: p.face * 120, vy: 260, g: 400, dmg: dmgBase() * 1.2 * api.amul('rgLeap'), tag: ['plunge', 'shot'], free: true }); api.SFX.rgFlip && api.SFX.rgFlip(); },
    bearTrap() { const p = P(); api.kitPose(p, 'rgTrapPose', 0.35); p.rgTraps = p.rgTraps || []; p.rgTraps.push({ x: p.x + p.face * 48, y: p.y, vy: -120, fly: 0.35, life: 16, held: null, sprung: 0 }); api.SFX.rgSnare && api.SFX.rgSnare(); },
    rain() { const p = P(); api.kitPose(p, 'rgRainPose', 0.35); p.rgRain = { x: p.x + p.face * 80, t: 1.0, hit: new Set(), dmg: dmgBase() * 1.1 * api.amul('rgRain') }; api.SFX.rgLoose && api.SFX.rgLoose(2); },
    smoke() { const p = P(); api.kitPose(p, 'rgSmokePose', 0.3);
      if (fk('rveil')) { puff(p.x, p.y - 8, 34); RFK.cloud(p.x, p.y - 8, 'veil'); api.number(p.x, p.y - 30, 'VEIL', '#b8bcb0'); api.SFX.rgLoose && api.SFX.rgLoose(1); return; }   /* (claude/rangerfork) VEIL: the smoke bursts at her feet */
      const a = loose(p, { kind: 'skill', vx: p.face * RG.draw.vx0, vy: -60, g: RG.draw.g, dmg: dmgBase() * 0.6 * api.amul('rgSmoke'), tag: 'shot', free: true }); a.smoke = true; if (fk('rbigcloud')) a.bigCloud = true; api.SFX.rgLoose && api.SFX.rgLoose(1); },
    refill() { const p = P(); api.kitPose(p, 'rgRefillPose', 0.35); const n = giveArrow(p, maxQ(), 'skill'); p.st = Math.min(p.maxSt || 100, (p.st || 0) + 40); api.ringAt(p.x, p.y - 14, 18, '#e8dcb0', 0.35); api.number(p.x, p.y - 28, n > 0 ? 'QUIVER FULL' : 'WIND BACK', '#e8dcb0'); },
    heart() { const p = P(); api.kitPose(p, 'rgHeartPose', 0.4); const dd = fk('rdeadeye'), sk = fk('rseeker'), a = loose(p, { kind: 'skill', vx: p.face * 640 * (dd ? 0.6 : sk ? 1.2 : 1), vy: 0, g: 0, dmg: dmgBase() * 3 * (dd ? 1.6 : 1) * api.amul('rgHeart'), tag: ['heavy', 'shot'], pierce: !dd, free: true, range: 420 }); if (sk) a.seek = true;   /* (claude/rangerfork) DEAD CENTRE: slow, stops in the first foe, x1.6; SEEKER: fast, steers onto the nearest foe ahead */ api.shakeCam(5, p.face * 3); api.zoomKick(1.06, 0.25); api.SFX.rgLoose && api.SFX.rgLoose(2); },
    wildHunt() { const p = P(); api.kitPose(p, 'rgHuntPose', 0.45); p.rgWildT = 8; api.ringAt(p.x, p.y - 14, 40, '#ff7a5a', 0.5); api.number(p.x, p.y - 30, 'THE WILD HUNT', '#ff7a5a'); api.SFX.rgHawk && api.SFX.rgHawk(); },
  };
  function harryNext(p, h) { let best = null, bd = 1e9; for (const e of api.enemies) { if (!e.alive || e.harmless || e.gone > 0 || e.turncoat || h.done.includes(e)) continue; const d = Math.hypot(e.x - p.x, e.y - p.y); if (d < 240 && d < bd) { bd = d; best = e; } } return best; }   /* (claude/rangerfork) the hawk's next quarry */
  /* THE KIT'S BODIES IN MOTION (every frame, after update): the hawk, the bear traps, the rain, the smoke */
  function kitStep(dt) { const p = P(); RFK.step(dt);
    const h = p.rgHawk; if (h) { h.t += dt; if (h.harry && !h.back && !(h.e && h.e.alive && !(h.e.gone > 0))) h.e = harryNext(p, h);   /* (claude/rangerfork) HARRY: the next foe, nearest first */
      const e = h.e && h.e.alive && !(h.e.gone > 0) ? h.e : null, orbit = h.harry && !e && !h.back, tx = orbit ? p.x + Math.cos(h.t * 6) * 30 : h.back || !e ? p.x : e.x, ty = orbit ? p.y - 34 + Math.sin(h.t * 6) * 8 : h.back || !e ? p.y - 22 : e.y - (e.h || 16) - 4, d = Math.hypot(tx - h.x, ty - h.y) || 1, sp = 260 * dt;
      h.x += (tx - h.x) / d * Math.min(d, sp); h.y += (ty - h.y) / d * Math.min(d, sp);
      if (!h.back && e && d < 8) { h.strikes++; api.hurtAs('rise', e, Math.max(1, Math.round(dmgBase() * 0.7 * (h.stoop ? 2 : h.harry ? 5 / 7 : 1) * api.amul('rgHawk'))), h.x, false); api.sparks(e.x, e.y - (e.h || 16), 0, 4); h.y -= 20;
        if (h.harry) { h.done.push(e); h.e = null; if (h.done.length >= 3) h.back = true; }
        else if (h.stoop) { markFoe(p, e); if (!(e.maxHp || e.mini || e === api.boss)) e.stagger = Math.max(e.stagger || 0, 0.6); h.back = true; }
        else if (h.strikes >= 2) { markFoe(p, e); h.back = true; } }
      if (h.harry && h.t > 4) h.back = true;
      if ((h.back || (!e && !h.harry)) && d < 8) p.rgHawk = null; else if (h.t > (h.harry ? 5.5 : 4)) p.rgHawk = null; }
    if (p.rgTraps && p.rgTraps.length) { for (const s of p.rgTraps) { s.life -= dt;
        if (s.fly > 0) { s.fly -= dt; s.vy += 600 * dt; s.y += s.vy * dt; const ty = Math.floor((s.y + 1) / api.TS); if (s.vy > 0 && (api.isSolid(Math.floor(s.x / api.TS), ty) || api.isOneWay(api.tileAt(Math.floor(s.x / api.TS), ty)))) { s.y = ty * api.TS - 1; s.fly = 0; } continue; }
        if (s.sprung > 0) { s.sprung -= dt; if (s.held && s.held.alive) s.held.vx = 0; if (s.sprung <= 0) s.life = 0; continue; }
        for (const e of api.enemies) { if (!e.alive || e.harmless || e.gone > 0 || e.noGrav || Math.abs(e.x - s.x) > (e.w || 12) / 2 + 5 || Math.abs(e.y - s.y) > 8) continue;
          api.hurtAs('heavy', e, Math.max(1, Math.round(dmgBase() * 1.6 * api.amul('rgBearTrap'))), s.x, false); api.SFX.rgSnap && api.SFX.rgSnap(); api.shakeCam(2);
          if (e.maxHp || e.mini) { api.poiseLean(e, 30); e.stagger = Math.max(e.stagger || 0, 0.35); s.life = 0; } else { e.stagger = Math.max(e.stagger || 0, 2.5); s.sprung = 2.5; s.held = e; }
          break; } }
      p.rgTraps = p.rgTraps.filter(s => s.life > 0); }
    const r = p.rgRain; if (r) { const was = r.t; r.t -= dt; if (r.t <= 0) { for (const e of api.enemies) { if (!e.alive || e.harmless || e.gone > 0 || r.hit.has(e) || Math.abs(e.x - r.x) > 32 + (e.w || 12) / 2 || Math.abs(e.y - p.y) > 70) continue; r.hit.add(e); api.hurtAs(['plunge', 'shot'], e, Math.max(1, Math.round(r.dmg)), e.x, false); api.sparks(e.x, e.y - (e.h || 16), 0, 3); }
        if (was > 0) { api.shakeCam(2); api.dust(r.x, p.y, 6); } if (r.t < -0.15) p.rgRain = null; } }
    for (const a of p.rgArrows || []) if (a.smoke && a.state !== 'fly' && !a.puffed) { a.puffed = true; a.state = 'gone'; puff(a.x, a.y, a.bigCloud ? 58 : 34); if (a.bigCloud) RFK.cloud(a.x, a.y, 'big');
      for (let i = 0; i < 18; i++) api.parts.push({ x: a.x + (Math.random() - 0.5) * 20, y: a.y - Math.random() * 16, vx: (Math.random() - 0.5) * 30, vy: -10 - Math.random() * 15, life: 1.4, max: 1.4, col: Math.random() < 0.5 ? '#b8bcb0' : '#8a9088', size: 3, grav: -8 }); }
  }
  const puff = (x, y, r) => { for (const e of api.enemies) { if (!e.alive || e.harmless || e.gone > 0 || Math.hypot(e.x - x, e.y - y) > r) continue; e.stagger = Math.max(e.stagger || 0, e.maxHp || e.mini ? 0.4 : 2); } };   /* the smoke's first puff: what stands in it reels (a boss 0.4 s) */
  /* A FOE OF HERS DIED (main.js hurtEnemy, a kill): THE KILL and BLOOD TRAIL read it */
  function killed(e) { const p = P(); if (!markOn(e) && !((e.rgMarkT || 0) > api.time - 0.05)) return;
    if (T().kill) { const ra = fk('rtkillarrows') ? 3 : fk('rtkillfocus') ? 1 : 2, rf = fk('rtkillarrows') ? 10 : fk('rtkillfocus') ? 40 : 20; giveArrow(p, Math.max(1, Math.round(ra * T().kill)), 'kill'); focusGain(p, rf * T().kill); }   /* THE KILL: ARROWS BACK / FOCUS FEAST */   /* THE KILL: two arrows and a fifth of her focus at rank III; rank I one arrow */
    if (T().trail && !fk('rtlongmark')) { let q = null, qd = 1e9; for (const f of api.enemies) { if (f === e || !f.alive || f.harmless || f.gone > 0) continue; const d = Math.hypot(f.x - e.x, f.y - e.y); if (d < 160 && d < qd) { q = f; qd = d; } } if (q) markFoe(p, q, undefined, RG.mark.t * T().trail); }
    e.rgMarkT = 0; }

  /* ---- DRAWN (after the hero): her arrows (in flight, in foes, stuck and glinting), the snare, the bear traps, the hawk, the rain; the nocked string ---- */
  /* THE ARROW, drawn pixel by pixel along its angle: a shaft with a lit side, a steel head with a barb, and a white-and-red fletching three long (the same look as the quiver on her back) */
  function drawArrowAt(g, x, y, ang, len = 7, dim = false) { const c = Math.cos(ang), s = Math.sin(ang), P2 = (u, col, v = 0) => { g.fillStyle = col; g.fillRect(Math.round(x + u * c - v * s), Math.round(y + u * s + v * c), 1, 1); };
    for (let u = -len; u <= -1; u++) { P2(u, dim ? '#6a5236' : u % 2 ? '#cfa86a' : '#a8844a'); }                         /* the shaft */
    P2(0, '#c9d4e0'); P2(1, '#ffffff'); P2(-1, '#8a96a8', 1);                                                                /* the steel head and its barb */
    if (!dim) { P2(-len, '#f0ead8'); P2(-len + 1, '#c9352a'); P2(-len, '#f0ead8', 1); P2(-len, '#c9352a', -1); P2(-len + 1, '#f0ead8', 1); P2(-len + 1, '#f0ead8', -1); }
    else { P2(-len, '#e8e0c8'); P2(-len - 1, '#c03a2a'); } }
  /* (claude/heropassaart) THE SNATCH, drawn: a gold four-point star on the fist where the arrow was taken, a pale ghost of the shaft drawn into the hand along its line, and a ring - the catch at game scale */
  function drawSnatchFx(g, cx, cy, f) { const k = 1 - f.t / f.max, x = Math.round(f.hx - cx), y = Math.round(f.y - cy), r = 2 + Math.round(k * 5);
    g.globalAlpha = Math.max(0, 1 - k * 1.2); g.fillStyle = '#fff6c8'; g.fillRect(x, y, 1, 1);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { g.fillStyle = '#ffd36b'; g.fillRect(x + dx * (1 + Math.round(k * 4)), y + dy * (1 + Math.round(k * 4)), 1, 1); }
    g.fillStyle = '#e8dcb0'; const x0 = Math.round(f.x - cx), n = Math.max(1, Math.abs(x0 - x)); for (let i = 0; i < n; i += 2) { const q = i / n; if (q > k * 1.6) break; g.fillRect(Math.round(x0 + (x - x0) * q), Math.round(y + (Math.round(f.y - cy) - y) * (1 - q)), 1, 1); }
    g.strokeStyle = f.fling ? '#ffd36b' : '#e8dcb0'; g.beginPath(); g.arc(x + 0.5, y + 0.5, r, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; }
  function render(g, cx, cy) { const p = P(); if (!api.isRg()) return; ensure(p);
    if (p.rgSnatchFx) drawSnatchFx(g, cx, cy, p.rgSnatchFx);
    for (const a of p.rgArrows) { const x = a.x - cx, y = a.y - cy, ang = a.state === 'fly' ? angleOf(a) : (a.ang ?? 0);
      if (a.state === 'foe' && a.foe) drawArrowAt(g, x, y, (a.foe.face || 1) > 0 ? ang : Math.PI - ang, 5, true);
      else if (a.great) { const dir = Math.sign(a.vx) || 1, X = Math.round(x), Y = Math.round(y);   /* (claude/ults) THE GREAT ARROW: a long gold shaft three pixels thick with a fat white-hot head, and a bright trail the length of the screen's last stretch */
        for (let u = 14; u <= 90; u++) { g.globalAlpha = 0.8 * (1 - (u - 14) / 80); g.fillStyle = u % 7 < 3 ? '#fff3b0' : '#ffd36b'; g.fillRect(X - dir * u, Y - (u % 5 === 0 ? 1 : 0), 1, u < 40 ? 3 : 1); } g.globalAlpha = 1;
        for (let u = -26; u <= 0; u++) { g.fillStyle = u % 3 === 0 ? '#fff3b0' : '#c9a24a'; g.fillRect(X + dir * u, Y - 1, 1, 3); g.fillStyle = '#6a4a1a'; g.fillRect(X + dir * u, Y + 2, 1, 1); }
        g.fillStyle = '#ffffff'; for (let k = 0; k < 5; k++) g.fillRect(X + dir * (1 + k), Y - 2 + (k > 2 ? k - 2 : 0), 1, 5 - 2 * (k > 2 ? k - 2 : 0)); g.fillStyle = '#ff6a3a'; g.fillRect(X - dir * 26, Y - 3, 1, 7); g.fillRect(X - dir * 24, Y - 3, 1, 7); }
      else { const len = a.kind === 'fan' ? 9 : a.kind === 'pierce' || (a.kind === 'skill' && a.pierce) ? 9 : 7;
        if (a.state === 'fly' && a.kind !== 'pierce' && a.kind !== 'fan') { const c = Math.cos(ang), s = Math.sin(ang);   /* (Daniel 10-15: easier to see in flight) a pale streak behind it, fading */
          for (let u = len + 1; u <= len + 10; u++) { g.globalAlpha = 0.75 * (1 - (u - len) / 11); g.fillStyle = '#fff6d8'; g.fillRect(Math.round(x - u * c), Math.round(y - u * s), 1, 1); } g.globalAlpha = 1; }
        g.globalAlpha = 0.55; drawArrowAt(g, x, y + 1, ang, len, true); g.globalAlpha = 1;   /* a dark copy under it: it reads on pale stone and sky */
        drawArrowAt(g, x, y, ang, len); }
      if (a.kind === 'fan' && a.state === 'fly') { const c = Math.cos(ang), sn = Math.sin(ang), dx = Math.sign(a.vx);   /* (claude/chargetiers) THE TRIPLE SHOT: each of the three trails an amber streak and a white core (three lines at once read as a fan) */
        g.globalAlpha = 0.55; g.fillStyle = RG.tiers.cols[3]; for (let u = 6; u <= 20; u += 2) g.fillRect(Math.round(x - u * c), Math.round(y - u * sn), 1, 1); g.globalAlpha = 0.85; g.fillStyle = '#ffffff'; for (let u = 4; u <= 9; u++) g.fillRect(Math.round(x - u * c), Math.round(y - u * sn), 1, 1); g.globalAlpha = 1; void dx; }
      if (a.kind === 'pierce' && a.state === 'fly') { g.globalAlpha = 0.5; g.fillStyle = '#dfffb0'; g.fillRect(Math.round(x - Math.sign(a.vx) * 16), Math.round(y), 12, 1); g.globalAlpha = 0.3; g.fillRect(Math.round(x - Math.sign(a.vx) * 22), Math.round(y - 1), 8, 3); g.globalAlpha = 0.8; g.fillStyle = '#ffffff'; g.fillRect(Math.round(x - Math.sign(a.vx) * 8), Math.round(y), 6, 1); g.globalAlpha = 1; }
      if (a.state === 'lie' || a.state === 'stuck') { const k = 0.5 + 0.5 * Math.sin(api.time * 6 + a.x), gx = Math.round(x), gy = Math.round(y) - 3;   /* THE GLINT: go and get it */
        g.globalAlpha = 0.45 + 0.55 * k; g.fillStyle = '#fff6c8'; g.fillRect(gx, gy - 2, 1, 5); g.fillRect(gx - 2, gy, 5, 1); g.globalAlpha = 1; g.fillStyle = '#ffffff'; g.fillRect(gx, gy, 1, 1);
        const by = gy - 9 + Math.round(Math.sin(api.time * 4 + a.x * 0.1) * 1.5);   /* (Daniel 10-15: easier to find) a bobbing chevron over it, dark-rimmed */
        g.fillStyle = '#2a2418'; for (let i = -3; i <= 3; i++) g.fillRect(gx + i, by - Math.abs(i) - 1, 1, 3);
        g.fillStyle = '#e8dcb0'; for (let i = -2; i <= 2; i++) g.fillRect(gx + i, by - Math.abs(i), 1, 1); } }
    for (const s of p.rgSnares || []) { const x = Math.round(s.x - cx), y = Math.round(s.y - cy), sp = s.sprung > 0;   /* THE SNARE: a peg with a cord looped to a ring on the turf; sprung it is drawn up tight, a pale knot with the cord standing */
      g.fillStyle = '#4a3a26'; g.fillRect(x - 5, y - 4, 2, 4); g.fillStyle = '#8a6a42'; g.fillRect(x - 5, y - 4, 1, 4); g.fillStyle = '#cfa86a'; g.fillRect(x - 5, y - 5, 2, 1);
      g.fillStyle = sp ? '#f0ead8' : '#d8c890'; for (const [u, v] of sp ? [[-3, -3], [-2, -4], [-1, -4], [0, -3], [0, -2], [-1, -1], [-2, -1], [-3, -2]] : [[-4, -1], [-3, 0], [-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0], [3, -1], [2, -1], [-3, -1], [3, 0], [4, 0]]) g.fillRect(x + u, y + v, 1, 1);
      if (!sp) { g.fillStyle = '#f0ead8'; g.fillRect(x - 1, y - 1, 2, 1); } }
    for (const s of p.rgTraps || []) { const x = Math.round(s.x - cx), y = Math.round(s.y - cy), shut = s.sprung > 0;   /* THE BEAR TRAP: a flat iron plate and two toothed jaws, open and flat in the grass, or SHUT, the teeth meshed upright */
      g.fillStyle = '#2a2e34'; g.fillRect(x - 6, y - 1, 13, 2); g.fillStyle = '#6a727e'; g.fillRect(x - 6, y - 1, 13, 1); g.fillStyle = '#8a6a42'; g.fillRect(x - 1, y, 3, 1);
      if (shut) { g.fillStyle = '#9aa4b2'; for (let i = -5; i <= 5; i += 2) g.fillRect(x + i, y - 5, 1, 4); g.fillStyle = '#e8eef6'; for (let i = -5; i <= 5; i += 2) g.fillRect(x + i, y - 6, 1, 1); g.fillStyle = '#6a727e'; g.fillRect(x - 5, y - 2, 11, 1); }
      else { g.fillStyle = '#9aa4b2'; for (let i = -5; i <= 5; i += 2) g.fillRect(x + i, y - 3, 1, 2); g.fillStyle = '#e8eef6'; for (let i = -5; i <= 5; i += 2) g.fillRect(x + i, y - 4, 1, 1); } }
    const h = p.rgHawk; if (h) { const x = Math.round(h.x - cx), y = Math.round(h.y - cy), f = Math.floor(api.time * 12) % 2, dir = (h.e ? h.e.x : h.x + 1) >= h.x ? 1 : -1;   /* THE HAWK: a barred brown body, broad wings (up, down, and swept back for the strike), a hooked beak and a bright eye */
      g.fillStyle = '#4a2e18'; g.fillRect(x - 2, y - 1, 5, 3); g.fillStyle = '#8a5a30'; g.fillRect(x - 2, y - 1, 5, 1); g.fillStyle = '#e8d8b0'; g.fillRect(x - 1, y + 1, 3, 1);
      const wy = f ? -3 : 1; g.fillStyle = '#6a4426'; g.fillRect(x - 5, y + wy - 1, 4, 2); g.fillRect(x + 2, y + wy - 1, 4, 2); g.fillStyle = '#a8743c'; g.fillRect(x - 5, y + wy - 1, 4, 1); g.fillRect(x + 2, y + wy - 1, 4, 1);
      g.fillStyle = '#c9a070'; g.fillRect(x - dir * 4 - (dir > 0 ? 0 : -1), y, 2, 1);
      g.fillStyle = '#e8c860'; g.fillRect(x + dir * 3, y - 1, 1, 1); g.fillRect(x + dir * 3 + (dir > 0 ? 1 : -1), y, 1, 1); g.fillStyle = '#ffffff'; g.fillRect(x + dir * 2, y - 1, 1, 1); }
    const r = p.rgRain; if (r && r.t < 0.35) { for (let i = 0; i < 9; i++) { const x = Math.round(r.x - 32 + i * 8 - cx), y = Math.round(p.y - 40 + (0.35 - Math.max(0, r.t)) * 120 - cy) - (i % 3) * 5; g.fillStyle = '#cfa86a'; g.fillRect(x, y + 1, 1, 4); g.fillStyle = '#ffffff'; g.fillRect(x, y + 5, 1, 2); g.fillStyle = '#c9d4e0'; g.fillRect(x, y + 4, 1, 1); g.fillStyle = i % 2 ? '#f0ead8' : '#c9352a'; g.fillRect(x, y, 1, 1); g.fillRect(x + 1, y, 1, 1); g.globalAlpha = 0.35; g.fillStyle = '#e8dcb0'; g.fillRect(x, y - 5, 1, 5); g.globalAlpha = 1; } }
    if (p.rgWildT > 0 && Math.random() < 0.2) api.parts.push({ x: p.x + (Math.random() - 0.5) * 10, y: p.y - 4 - Math.random() * 16, vx: 0, vy: -16, life: 0.4, max: 0.4, col: '#ff7a5a', size: 1, grav: 0 });
    /* THE BOW-BASH: the stave's arc in front of her, bright on the beat (placeholder for the bash frames) */
    if (bashUp(p)) { const x = Math.round(p.x - cx) + p.face * 12, y = Math.round(p.y - cy) - 12, beat = onBeat(p); g.fillStyle = beat ? '#f2ffd8' : '#c8e89a';   /* a bow-length arc of the stave's sweep, three pixels thick on the beat with a gold star at its middle */
      for (let v = -9; v <= 9; v++) if (beat || Math.abs(v) % 2 === 0) { const bx = x + Math.round((9 - Math.abs(v)) * 0.35 * p.face); g.fillRect(bx, y + v, 1, 1); if (beat && Math.abs(v) < 7) { g.fillStyle = '#c8e89a'; g.fillRect(bx - p.face, y + v, 1, 1); g.fillStyle = '#f2ffd8'; } }
      if (beat) { g.fillStyle = '#ffd36b'; g.fillRect(x + p.face * 3, y - 1, 1, 3); g.fillRect(x + p.face * 2, y, 3, 1); g.fillStyle = '#ffffff'; g.fillRect(x + p.face * 3, y, 1, 1); } } }
  /* THE MARK, on the late pass (main.js draws it after the walls and the foreground): a red reticle over the quarry, seen through stone */
  function drawMarks(g, cx, cy) { for (const e of api.enemies) { if (!markOn(e)) continue; const x = Math.round(e.x - cx), y = Math.round(e.y - (e.h || 16) / 2 - cy), r = Math.max(8, Math.round(Math.max(e.w || 12, e.h || 16) * 0.55)), k = Math.floor(api.time * 4) % 2, left = Math.max(0, e.rgMarkT - api.time);
      /* THE MARK: a red reticle - a broken ring of four arcs, a cross-hair tick on each side, a bright centre, a dark rim so it reads on pale stone - tightening as its ten seconds run out, and a pulse */
      const rr = r + (left < 2 ? Math.round(Math.sin(api.time * 14) * 1) : 0);
      for (const [col, o] of [['#2a0a08', 1], ['#ff5a40', 0]]) { g.fillStyle = col;
        for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { g.fillRect(x + sx * rr - (sx > 0 ? 3 - o : o), y + sy * rr - (o && sy > 0 ? 0 : 0), 4, 1); g.fillRect(x + sx * rr, y + sy * rr - (sy > 0 ? 3 : 0), 1, 4); }
        g.fillRect(x - rr - 3, y, 3, 1); g.fillRect(x + rr + 1, y, 3, 1); g.fillRect(x, y - rr - 3, 1, 3); g.fillRect(x, y + rr + 1, 1, 3); }
      g.fillStyle = '#ffd0c0'; g.fillRect(x, y, 1, 1); if (k) { g.fillRect(x - 1, y, 1, 1); g.fillRect(x + 1, y, 1, 1); g.fillRect(x, y - 1, 1, 1); g.fillRect(x, y + 1, 1, 1); } } }
  function clear() { const p = P(); RFK.clear(); p.rgArrows = []; p.rgSnares = []; p.rgRecall = null; p.rgTraps = []; p.rgHawk = null; p.rgRain = null; p.rgNock = null; p.rgBashT = 0; p.rgGuard = false; p.rgHeld = 0; p.rgFlip = null; p.rgWildT = 0; p.rgQ = maxQ(); p.rgRefT = 0; p.rgRsT = 0; p.rgRsE = 0; }
  const read = () => { const p = P(); ensure(p); return { stance: p.rgStance || 'bow', q: p.rgQ, max: maxQ(), focus: +(p.rgFocus || 0).toFixed(1), nock: !!p.rgNock, bashUp: bashUp(p), onBeat: onBeat(p), flip: !!p.rgFlip, cd: +(p.rgCd || 0).toFixed(3),
    arrows: p.rgArrows.map(a => ({ kind: a.kind, state: a.state, x: Math.round(a.x), y: Math.round(a.y), tag: a.tag, rip: a.rip, vy: Math.round(a.vy), free: !!a.free, emp: !!a.emp })), snares: (p.rgSnares || []).map(s => ({ x: Math.round(s.x), sprung: s.sprung > 0 })),
    refT: +(p.rgRefT || 0).toFixed(2), wildT: p.rgWildT || 0, stats: { ...stats } }; };
  /* (claude/rangerhud) WHAT THE QUIVER ROW DRAWS: her stance, the arrows in the quiver / her most, the ones lying in the world she could take back, and how far the trickle is to the next */
  const hudOf = (p, mq, rt) => { ensure(p); let lying = 0; for (const a of p.rgArrows) if ((a.state === 'lie' || a.state === 'stuck') && !a.free && !a.wild) lying++;
    return { stance: p.rgStance || 'bow', q: p.rgQ, mq, lying, refill: p.rgQ < mq ? Math.min(1, (p.rgRefT || 0) / rt) : 0 }; };   /* (a seat's plate reads the maxima her own update stored: p.rgMaxQ / p.rgRefMax) */
  const hud = () => hudOf(P(), maxQ(), refillT());
  return { RG, distMul, greatReady, greatArrow, greatDrawing: () => !!P().rgGreat, kickHit: e => kickHit(P(), e), arrows, maxQ, hud, hudOf: p => hudOf(p, p.rgMaxQ || RG.quiver.n, p.rgRefMax || RG.quiver.refill), toggleStance: () => toggleStance(P()), bowReady, stance: () => P().rgStance || 'bow', press, nockStep, release: (w, tier, shaky) => release(P(), w, tier || 0, !!shaky), focusFull: () => focusFull(P()), quickShot: () => quickShot(P(), !P().ground), riseShot: () => riseShot(P()), downShot: () => downShot(P()),
    bashTakes, guardTakes, guardUp: () => guardUp(P()), snatchSeeds, kneeling: () => !!P().rgKneel, onBeat: () => onBeat(P()), bashUp: () => bashUp(P()), bash: () => bash(P()), setSnare: () => setSnare(P()), spendMark: () => spendMark(P()), markFoe: e => markFoe(P(), e), markMul, markOn, killed,
    flip: dir => flip(P(), dir), focusGain: n => focusGain(P(), n), giveArrow: n => giveArrow(P(), n), takeArrow: () => takeArrow(P()), pointBlank: () => pointBlank(P()),
    update, restock, kit, kitStep, softK, forkBodies: RFK, draw: render, drawMarks, clear, read, resetStats: () => { for (const k in stats) stats[k] = 0; } };
}
