// src/stilt-walker.js - THE GOBLIN STILT-WALKER (claude/fenroad; scratch/brief-fenroad-1020.md, Daniel 10-20: "a boardwalk lookout on tall stilts with a long gaff ...
// REUSE him in other levels (Stockade walkway lookouts, later camps/bogs) - build him as a general bestiary foe"). A GENERAL FOE: ent('stiltwalker', x, y,
// { face, horn: true, beat: tiles, pack: [{ dx, y, t }] }) anywhere; a CV machine (main.js updateDesertFoe runs it: this step says where he goes and what he strikes).
// (claude/fenroad2, Daniel 10-22: "STILT-WALKERS must look like they walk on stilts - stomp around"; scratch/brief-fenroad2-1022.md LANE B) HE IS A MOVER, NOT A POST:
//   THE STOMP GAIT: he walks in slow HIGH STEPS - a stilt lifted high (the LIFT, its landing told by a shadow where the tip will come down: s.footX), then planted
//     with a STOMP (an event 'step' { x, y }: main.js bows the boards under it - src/fen-road-hands.js stomp: a bowed section bows further, and one already
//     bowing goes under). He PATROLS his beat (home +- beat tiles) when he has not seen you, and steps toward a gaff's length of you when he has.
//   HIS TOLD STOMP ON YOU: a hero UNDER him (inside his stilts, where a stilt-cutter stands) - he rears a stilt high over you (red !!, its own windup pose:
//     frame 13) and drives it down (frame 14): no shield turns a stilt - step out or roll. It bows the boards like any step.
//   HIS TOLD ATTACK - THE DOWNWARD GAFF JAB (unchanged): he draws the gaff up and back over his head (a yellow !, his own windup pose), then drives it down
//     at a standing hero's head and shoulders: DUCK under it (a ducked hero is under its box) or PARRY it. Answered by a duck, it OVERREACHES (src/told-attacks.js SIG).
//   HIS STILTS ARE HIS WEAKNESS: a LOW blow - the low sweep, the running slide, a heavy from the ground - CUTS A STILT and he TOPPLES: down on his
//     back, BROKEN (main.js floorFoe), so the next blow is the foe-pass FINISHER (src/finishers.js). Up again he is a goblin with a knife (stiltless).
//     (claude/fenroad2) A THROWN PLANK (src/fen-planks.js) knocks his stilts from under him the same way.
//   HIS HORN (horn: true): seeing you he lowers the gaff and winds the horn - the Stockade's horn bar over him (main.js drawHornTell) - and if it
//     sounds, his crew (pack) comes (main.js hornSounds). Strike him (a stagger breaks his breath) or topple him before it fills.
import { bakeStiltSheet } from './redraw/stilt_walker_art.js';
export const STILT = {
  hp: 32, w: 10, h: 30, hLow: 14, walk: 30, walkLow: 42, sight: 200, keep: 30, back: 22,
  /* THE GAIT (claude/fenroad2): a stride of `stride` px, the stilt up for `lift` s (the told shadow where it comes down), planted for `plant` s; his beat
     (home +- beat tiles) when he has not seen you */
  stride: 18, lift: 0.42, plant: 0.36, beat: 3,
  jabAt: 50, jabTell: 0.55, jab: 0.18, jabReach: 46, jabDmg: 14, jabTop: 16, jabBot: 9, recover: 0.6, cd: 1.3,
  /* HIS STOMP ON A HERO UNDER HIM (claude/fenroad2): within stompAt px (inside his stilts), a told rear (stompTell s, red !!) and the stilt driven down: stompHalf px either side
     of where the tip lands, unblockable (a stilt, not a blade), stompDmg */
  stompAt: 15, stompTell: 0.6, stomp: 0.14, stompHalf: 11, stompDmg: 13, stompRec: 0.55, stompCd: 1.4,
  stabAt: 20, stabTell: 0.42, stab: 0.12, stabDmg: 8, stabCd: 1.1,
  horn: 2.0, hornSee: 172,
  topple: 0.45, down: 2.6, getup: 0.5,
};
export const SW_SAY = { topple: 'A STILT CUT: HE TOPPLES', knocked: 'THE PLANK TAKES HIS STILTS', stomp: 'HIS STILT COMES DOWN: STEP OUT' };
/* THE POSE IDS (the art lane's contract, claude/fenroad2): one frame each - the sheet's index */
export const SW_POSE = { idle: 0, liftA: 1, liftB: 2, jabTell: 3, jab: 4, horn: 5, topple: 6, down: 7, lowA: 8, lowB: 9, stabTell: 10, stab: 11, hurt: 12, stompTell: 13, stomp: 14, riseA: 15, riseB: 16, reachA: 17, reachB: 18, plant: 19 };   /* (claude/fenroad2art) 15-19: the walk cycle's in-betweens - the foot off the boards, reaching, and the LANDING (dust) */
/* the blow that cuts a stilt: a LOW blow (main.js's blow tags) - the low sweep and the running slide ('sweep'), or a HEAVY struck from the ground */
export const cutsStilt = (blow, heroGround) => { const has = v => blow === v || (Array.isArray(blow) && blow.includes(v)); return has('sweep') || (has('heavy') && !!heroGround); };
export const newStilt = (x, y, o = {}) => ({ kind: 'stiltwalker', x, y, face: o.face || -1, mode: 'walk', t: 0, cd: 0.8 + (Math.floor(x) % 4) * 0.2, frame: 0, stilts: true, horn: !!o.horn, hornT: 0, blown: false, seen: false,
  home: x, beat: (o.beat === undefined ? STILT.beat : o.beat) * 16, pdir: o.face || -1, ph: 'plant', phT: STILT.plant * ((Math.floor(x) % 3) / 3), leg: 0, want: 0, footX: null, liftX: x, stompX: null });
/* where he wants to go this stride: toward a gaff's length of a hero he sees, away from one too close; else his beat (and back at its ends) */
function wantOf(s, w, ad, dy, sees) {
  if (sees) { const tw = Math.sign(w.px - s.x) || s.face; if (ad > STILT.keep + 6) return tw; if (ad < STILT.back && ad >= STILT.stompAt) return -tw; return 0; }
  if (s.beat <= 0) return 0;
  if (s.x > s.home + s.beat) s.pdir = -1; else if (s.x < s.home - s.beat) s.pdir = 1;
  return s.pdir;
}
/* ONE FRAME OF HIM. w = { px, py (the hero), time, ducking }. Returns the CV events: { t: 'tell'|'hit'|'horn'|'step' } */
export function stiltStep(s, w, dt) {
  const out = [], ev = (t, o) => out.push({ t, ...(o || {}) }); s.t -= dt; s.cd -= dt;
  const dx = w.px - s.x, dy = w.py - s.y, ad = Math.abs(dx), f = s.face || -1, step = Math.floor(w.time * 5) % 2;
  if (!s.stilts && (s.mode === 'walk' || s.mode === 'jabTell' || s.mode === 'jab' || s.mode === 'hornTell' || s.mode === 'stompTell' || s.mode === 'stomp')) s.mode = 'walkLow';
  const sees = ad < STILT.sight && Math.abs(dy) < 60;
  switch (s.mode) {
    case 'walk': {
      if (ad < 260 && Math.abs(dy) < 80) s.seen = true;
      /* ON HIS FEET (planted): the horn, the stomp on a hero under him, the jab - all from both stilts down */
      if (s.ph === 'plant') {
        s.frame = s.fresh && s.phT > STILT.plant - 0.16 ? SW_POSE.plant : SW_POSE.idle; if (s.phT <= STILT.plant - 0.16) s.fresh = false; s.footX = null;
        if (sees) s.face = Math.sign(dx) || s.face;
        /* THE HORN: he must SEE you (on the screen with him, the Stockade's rule), then he winds it */
        if (s.horn && !s.blown && ad < STILT.hornSee && Math.abs(dy) < 120) { s.mode = 'hornTell'; s.hornT = 0; s.frame = SW_POSE.horn; ev('tell', { what: 'horn' }); break; }
        if (s.cd <= 0 && ad < STILT.stompAt && Math.abs(dy) < 24) { s.mode = 'stompTell'; s.t = STILT.stompTell; s.stompX = w.px; s.frame = SW_POSE.stompTell; ev('tell', { what: 'stomp', mark: '!!' }); break; }
        if (s.cd <= 0 && ad < STILT.jabAt && ad >= STILT.stompAt && Math.abs(dy) < 28) { s.mode = 'jabTell'; s.t = STILT.jabTell; s.frame = SW_POSE.jabTell; ev('tell', { what: 'jab', mark: '!' }); break; }
        s.phT -= dt; if (s.phT > 0) break;
        const want = wantOf(s, w, ad, dy, sees); if (!want) { s.phT = 0.15; break; }
        /* A HIGH STEP: the stilt comes up; where it will come down is told (footX) */
        s.ph = 'lift'; s.phT = STILT.lift; s.want = want; s.leg = 1 - s.leg; s.liftX = s.x; s.footX = s.x + want * STILT.stride; if (!sees) s.face = want;
        break; }
      /* THE LIFT: he moves over the raised stilt; down it comes with a STOMP */
      { const p = 1 - Math.max(0, s.phT) / STILT.lift; s.frame = s.leg ? (p < 0.28 ? SW_POSE.riseB : p < 0.7 ? SW_POSE.liftB : SW_POSE.reachB) : (p < 0.28 ? SW_POSE.riseA : p < 0.7 ? SW_POSE.liftA : SW_POSE.reachA); }   /* (claude/fenroad2art) rise, high step, reach */
      s.x += s.want * (STILT.stride / STILT.lift) * dt; s.phT -= dt;
      if (s.phT <= 0) { s.ph = 'plant'; s.phT = STILT.plant;
        if (Math.abs(s.x - s.liftX) < 2) s.pdir = -s.pdir;   /* stopped at an edge: his beat turns back */
        ev('step', { x: s.x + s.want * 4, y: s.y }); s.footX = null; s.fresh = true; }
      break; }
    case 'hornTell': s.frame = SW_POSE.horn; s.hornT += dt; if (ad > STILT.hornSee * 1.5) { s.hornT = Math.max(0, s.hornT - dt * 2); if (s.hornT <= 0) s.mode = 'walk'; }
      if (s.hornT >= STILT.horn) { s.blown = true; s.mode = 'recover'; s.t = 0.6; ev('horn'); } break;
    case 'jabTell': s.frame = SW_POSE.jabTell; if (s.t <= 0) { s.mode = 'jab'; s.t = STILT.jab; } break;
    case 'jab': s.frame = SW_POSE.jab; ev('hit', { what: 'gaff', box: f > 0 ? [s.x + 6, s.x + STILT.jabReach, s.y - STILT.jabTop, s.y - STILT.jabBot] : [s.x - STILT.jabReach, s.x - 6, s.y - STILT.jabTop, s.y - STILT.jabBot], dmg: STILT.jabDmg, blockable: true });
      if (s.t <= 0) { s.mode = 'recover'; s.t = STILT.recover; s.cd = STILT.cd; } break;
    /* THE STOMP ON YOU: reared over where you stood when he saw you under him (it does not follow you: step out) */
    case 'stompTell': s.frame = SW_POSE.stompTell; if (s.t <= 0) { s.mode = 'stomp'; s.t = STILT.stomp; ev('step', { x: s.stompX, y: s.y, hard: true }); } break;
    case 'stomp': s.frame = SW_POSE.stomp; ev('hit', { what: 'stomp', box: [s.stompX - STILT.stompHalf, s.stompX + STILT.stompHalf, s.y - 20, s.y + 2], dmg: STILT.stompDmg, blockable: false });
      if (s.t <= 0) { s.mode = 'recover'; s.t = STILT.stompRec; s.cd = STILT.stompCd; s.stompX = null; } break;
    case 'recover': s.frame = s.stilts ? SW_POSE.idle : SW_POSE.lowA; if (s.t <= 0) { s.mode = s.stilts ? 'walk' : 'walkLow'; s.ph = 'plant'; s.phT = STILT.plant; } break;
    case 'topple': s.frame = SW_POSE.topple; if (s.t <= 0) { s.mode = 'down'; s.t = STILT.down; } break;
    case 'down': s.frame = SW_POSE.down; if (s.t <= 0) { s.mode = 'getup'; s.t = STILT.getup; } break;
    case 'getup': s.frame = SW_POSE.down; if (s.t <= 0) { s.mode = 'walkLow'; s.cd = 0.5; } break;
    /* STILTLESS: a goblin with a knife (the gaff's broken haft) */
    case 'walkLow': s.frame = SW_POSE.lowA + step; s.face = Math.sign(dx) || s.face; s.footX = null;
      if (s.cd <= 0 && ad < STILT.stabAt && Math.abs(dy) < 16) { s.mode = 'stabTell'; s.t = STILT.stabTell; s.frame = SW_POSE.stabTell; ev('tell', { what: 'slash', mark: '!' }); break; }
      if (ad < 220 && Math.abs(dy) < 50 && ad > 10) s.x += s.face * STILT.walkLow * dt; break;
    case 'stabTell': s.frame = SW_POSE.stabTell; if (s.t <= 0) { s.mode = 'stab'; s.t = STILT.stab; } break;
    case 'stab': s.frame = SW_POSE.stab; ev('hit', { what: 'knife', box: f > 0 ? [s.x, s.x + 18, s.y - 12, s.y - 2] : [s.x - 18, s.x, s.y - 12, s.y - 2], dmg: STILT.stabDmg, blockable: true });
      if (s.t <= 0) { s.mode = 'recover'; s.t = 0.45; s.cd = STILT.stabCd; } break;
    default: s.mode = s.stilts ? 'walk' : 'walkLow';
  }
  return out;
}
/* A STILT CUT (main.js, a low blow landed - or a thrown plank, src/fen-planks.js): he topples. Returns true when it took (on his stilts, not already falling) */
export function cutStilt(s) { if (!s || !s.stilts) return false; s.stilts = false; s.mode = 'topple'; s.t = STILT.topple; s.frame = SW_POSE.topple; s.hornT = 0; s.footX = null; s.stompX = null; return true; }

/* ---------- GREYBOX SHEET (the art lane draws him; this is the contract: one frame per pose, SW_POSE) ----------
   0 idle (both stilts planted)  1-2 HIGH STEP (one stilt lifted high and forward - A the near, B the far)  3 JAB WINDUP (gaff up and back over his head)
   4 JAB (driven down and forward)  5 HORN (gaff grounded, horn at his mouth)  6 TOPPLE (tipping, a stilt snapped)  7 DOWN (on his back, stilts broken)
   8-9 stiltless walk  10 STAB WINDUP  11 STAB  12 hurt  13 STOMP WINDUP (a stilt reared high over the hero under him, leaning back on the other)
   14 STOMP (the stilt driven down, dust and splinters at its tip) */
export function bakeStiltWalker(canvas, flipX, whiten) { return bakeStiltSheet(canvas, flipX, whiten, STILT); }   /* (claude/fenroadart) the drawn sheet: src/redraw/stilt_walker_art.js */
