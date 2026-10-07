// src/walk-duel.js - THE LEVEL WALKER'S DUEL WITH AN ELITE (claude/walkerhands). tools/level-walk.mjs only; no game code reads it.
//
// The walker's hands (src/playtest.js makeBot) get THROUGH fights: they swing at whatever is in arm's reach and write a foe off after four
// seconds. Against an ELITE that is a mash: his guard by angle (src/elite-kit.js) turns every light cut off his front, and the mash is
// answered with a told riposte (or a THORNED one's spines). So every elite death in the walker's tables was the bot's hands, and every elite
// gate a STUCK. A player duels him. This is that duel, built on the hands the elite lab measures every elite with (src/lab.js labDuelFrame:
// labBotFrame under the human gates, ~80% wins in docs/elite-lab.json), with the elite's READ on top - what the screen shows a player:
//   HIS SPINES (THORNED, a red !! and the spines rising round him)  out of their ring (K.thornR past his edge) until they have burst
//   HIS RIPOSTE (a yellow !, his guard coming down)                  a shield takes it face on (the warden deflects on the beat); the rest
//                                                                    step out of its step-in
//   HIS MARK ON THE FLOOR (a leap, a pot, a belly-flop: e.vol)       off it, the way the mark tells you
//   HIS OWN TELLS                                                    the lab's defence (block, roll late, the red ones rolled out of)
//   HIS GUARD (the steel edge on his front, while he stands or tells) a LOW blow (the sweep / the crouched trip or poke) goes under it whole
//                                                                    and is no cut of a mash; from behind, in his blow and his recovery,
//                                                                    and while he is OPEN (the gold ring) the lab's cuts land whole
//   THE MASH COUNT (e.ekCuts in K.mashWindow)                        one cut short of the act's mashAt (a THORNED one's thornAt) he stops
//                                                                    cutting and goes low instead
// makeEliteRead({ mashAt }) -> pre(BK, h, e, f): true when it took the frame (its keys stand), false to leave it to the lab's hands.
// duelPick(BK, prev, o) -> the elite to duel now (or null): the walker hands its frame to labDuelFrame(BK, h, e, f, profile, pre).
import { K as EKK } from './elite-kit.js';
import { LAB_REACH, SHIELDED, DEFLECT_TAP, threatOf } from './lab.js';

const TS = 16;
export function makeEliteRead({ mashAt = 3 } = {}) {
  return function eliteRead(BK, h, e, f) {
    if (!e || !e.elite || !e.alive) return false;
    const P = BK.P, k = BK.keys, d = e.x - P.x, ad = Math.abs(d), side = Math.sign(P.x - e.x) || 1, hw = (e.w || 12) / 2, mode = e.mode || '';
    const clear = () => { k.left = k.right = k.up = k.down = k.jump = k.block = k.atk = false; };
    const back = () => { k[side > 0 ? 'right' : 'left'] = true; k[side > 0 ? 'left' : 'right'] = false; };
    const toward = () => { k[side > 0 ? 'left' : 'right'] = true; k[side > 0 ? 'right' : 'left'] = false; };
    /* HIS SPINES: a red !! and they burst all round him - stand off past their ring until they have */
    if (mode === 'ekThornsTell' || mode === 'ekThorns') { clear(); const out = EKK.thornR + hw + 12;
      if (ad < out) { back(); if (ad < out - 20 && P.ground && h !== 'warden' && mode === 'ekThornsTell' && e.modeT < 0.3) BK.press('dodge'); }
      return true; }
    /* HIS RIPOSTE: a yellow ! - a shield takes it face on, the warden's deflect on the beat; the others step out of his step-in */
    if (mode === 'ekRiposteTell' || mode === 'ekRiposte') { clear(); P.face = -side;
      if (ad < 80 && P.ground && SHIELDED(h)) { k.block = true; return true; }
      if (ad < 80 && P.ground && h === 'warden') { k.block = DEFLECT_TAP(f); return true; }
      const out = EKK.ripReach + hw + 30; if (ad < out) { back(); if (ad < EKK.ripReach + hw + 8 && P.ground && mode === 'ekRiposteTell' && e.modeT < 0.25) BK.press('dodge'); }
      return true; }
    /* HIS MARK ON THE FLOOR: off it, the near way */
    const V = e.vol; if (V && /Tell$/.test(mode) && Math.abs(P.x - V.x) < (V.half || 20) + 10 && Math.abs(P.y - V.y) < 3 * TS) {
      clear(); const s2 = Math.sign(P.x - V.x) || side; k[s2 > 0 ? 'right' : 'left'] = true; return true; }
    if (e.broken > 0) return false;                 /* OPEN: the gold ring - the lab's cuts, all in */
    if (threatOf(e) && ad < 96) return false;       /* his own tell: the lab's defence */
    /* HIS GUARD BY ANGLE, AND THE MASH COUNT */
    const front = ad < hw + 2 || side === (e.ekSide || e.face || 1);
    const at = e.affix === 'THORNED' ? (e.ekRoused ? EKK.thornRoused : EKK.thornAt) : mashAt;
    const cuts = (BK.time ?? 0) - (e.ekCutAt ?? -99) < EKK.mashWindow ? (e.ekCuts || 0) : 0;
    const guarded = !!e.ekGuarding && front, mashy = cuts >= at - 1;
    if (!guarded && !mashy) return false;           /* round him, or in his blow and his recovery: the lab's cut lands whole */
    if (P.swim || P.climb) return false;
    clear(); P.face = -side;
    if (!P.ground) return true;
    /* THE LOW: under his guard, and no cut of the mash */
    const reach = (LAB_REACH[h] || 22) + hw, cost = BK.stepCost ? BK.stepCost() : 12;
    if (ad > reach - 2) { toward(); return true; }
    if (P.atk < 0 && P.st >= cost + 6) { k.down = true; BK.press('atk'); return true; }
    if (P.atk < 0) back();                          /* no wind for it: a step back out of his reach while it comes back */
    return true;
  };
}
/* WHICH ELITE TO DUEL: the one already on (until he is dead, written off, or well away), else an elite in the way - on his floor (a row and a bit; kept while within 2),
   within 9 tiles ahead or 4 behind, with no deadly water or pit between. o: { dir, no: Map(e -> frame written off until), frame, pools } */
export function duelPick(BK, prev, o = {}) {
  const P = BK.P; if (!P || P.dead > 0) return null;
  const ok = e => e && e.alive && e.elite && !e.harmless && !(e.dying > 0) && !((o.no && o.no.get(e)) > (o.frame || 0));
  if (ok(prev) && Math.abs(prev.x - P.x) < 14 * TS && Math.abs(prev.y - P.y) < 2 * TS && (!o.floor || o.floor(prev))) return prev;   /* (up on a ledge over him: the walk climbs to him, the duel takes up again on his floor) */
  if (!(P.ground || P.swim)) return null;
  let best = null, bd = 1e9;
  for (const e of BK.enemies()) { if (!ok(e)) continue; const dx = e.x - P.x, dy = Math.abs(e.y - P.y);
    if (dy > 1.2 * TS) continue; if (dx * (o.dir || 1) < -4 * TS || Math.abs(dx) > 9 * TS) continue;
    const lo = Math.min(e.x, P.x), hi = Math.max(e.x, P.x);
    if ((o.pools || []).some(q => !q.shallow && !q.swim && !q.dry && (q.fire || !o.waterHurts) && q.x1 > lo && q.x0 < hi && Math.abs(q.y - P.y) < 3 * TS)) continue;
    if (o.floor && !o.floor(e)) continue;   /* a gap between (water, a pit): the walk takes him over it first - the duel is fought on one floor */
    if (Math.abs(dx) < bd) { bd = Math.abs(dx); best = e; } }
  return best;
}
