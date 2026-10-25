// src/ai-companion.js - AI COMPANIONS, THE CORE (claude/aicompanions; scratch brief-aicompanions.md, the '!! 10-14 LATE' interview lines).
// The pure half: what a companion IS (its kind, its behaviour), the numbers each behaviour plays by, when it is pulled along (the told CATCH-UP puff),
// how much of a partner it counts as when the wood scales for co-op, and the words the party board and the win card say about it. main.js allyTick
// is the hands (the lab's duel hands + the playtest walker, as the old ally was); tools/ai-companion.mjs puts every function here through its cases.
//   TWO KINDS (Daniel 10-14):
//     LINKED   a hero from ONE OF YOUR OTHER SAVES: the AI plays THAT character (its level, talents, skills, gear) and EARNS XP + LEVELS into its own save
//              (src/coop-save.js applyCredit xpOnly) - silver, unlocks and level clears stay with YOUR save. The slot is locked while it plays (one character,
//              one place: kind 'companion').
//     DEFAULT  any hero you have unlocked: it plays at YOUR level (the lent level co-op has always used - main.js coopLent), nothing saved.
//   FOUR BEHAVIOURS: AGGRESSIVE (presses, goes for openings), BALANCED (default), DEFENSIVE (hangs back, guards, stays alive), SUPPORT (sticks close,
//   revives you first, peels foes off you) - parameters on the same hands: how far from you it fights, how far it strays, where it stands, when it drinks.
//   LIGHTER: an AI is never a whole extra player - a party of you and AIs scales the wood by AI_WEIGHT per AI (a human partner is the old x2, unchanged).

export const BEH_ORDER = ['balanced', 'aggressive', 'defensive', 'support'];   /* the board's order: BALANCED first (the default) */
export const BEH_NAME = { balanced: 'BALANCED', aggressive: 'AGGRESSIVE', defensive: 'DEFENSIVE', support: 'SUPPORT' };
export const BEH_LINE = {
  balanced: 'FIGHTS BESIDE YOU, KEEPS UP',
  aggressive: 'PRESSES FOES, GOES FOR OPENINGS',
  defensive: 'HANGS BACK, GUARDS, STAYS ALIVE',
  support: 'STICKS CLOSE, LIFTS YOU FIRST',
};
/* engage: px from the AI a foe may stand to be fought; stray: px from its leader it will follow a fight; back: px behind the leader's shoulder it walks at;
   flask: drinks under this share of its health; guard: under this share it stops swinging and only defends; near: only foes within this of the leader
   (SUPPORT peels them off you); reviveAll: picks up a downed AI partner as well as a human; risk: swings into a tell a beat later (0 = never) */
export const BEH = {
  balanced:   { engage: 130, stray: 120, back: 22, flask: 0.33, guard: 0,    near: 0,  reviveAll: true },
  aggressive: { engage: 170, stray: 160, back: 16, flask: 0.25, guard: 0,    near: 0,  reviveAll: false },
  defensive:  { engage: 80,  stray: 80,  back: 34, flask: 0.45, guard: 0.5,  near: 0,  reviveAll: true },
  support:    { engage: 110, stray: 70,  back: 14, flask: 0.4,  guard: 0.3,  near: 90, reviveAll: true },
};
export const behOf = c => BEH[(c && c.beh) in BEH ? c.beh : 'balanced'];
export const cleanCfg = c => ({ beh: c && BEH[c.beh] ? c.beh : 'balanced', linked: !!(c && c.linked) });

/* LIGHTER IN THE SCALING (brief: 'enemy scaling counts an AI as a lighter partner'). Co-op has always been x2 for everything that fights and x2 for
   every blow on a hero, with any number of seats. A party with a HUMAN partner keeps that exactly. A party of one human and AIs is 1 + AI_WEIGHT a seat,
   never more than the human x2. bodies: [{ ai }] (seat one first). */
export const AI_WEIGHT = 0.5;
export function coopMulOf(bodies) {
  if (!bodies || bodies.length < 2) return 1;
  const rest = bodies.slice(1);
  if (rest.some(b => b && !b.ai)) return 2;
  return Math.min(2, 1 + AI_WEIGHT * rest.length);
}

/* WHO AN AI FOLLOWS: player one while he stands; else the nearest standing human; an AI never leads a human (the leash never pulls a person to a bot) */
export function leadOf(bodies, me) {
  const up = b => b && !b.dead && !(b.down > 0);
  if (up(bodies[0])) return bodies[0];
  let best = null, bd = 1e9;
  for (const b of bodies) { if (b === me || b.ai || !up(b)) continue; const d = Math.abs(b.x - me.x) + Math.abs(b.y - me.y); if (d < bd) { bd = d; best = b; } }
  return best || bodies[0];
}
/* WHO IT LIFTS FIRST: a downed human (SUPPORT: player one before anyone), the nearest; then (unless AGGRESSIVE) a downed AI partner */
export function reviveTarget(bodies, me, cfg) {
  const b = behOf(cfg), downs = bodies.filter(q => q !== me && q.down > 0 && !q.dead);
  if (!downs.length) return null;
  if ((cfg && cfg.beh) === 'support' && bodies[0] && bodies[0].down > 0) return bodies[0];
  const near = list => list.reduce((a, q) => (!a || Math.abs(q.x - me.x) < Math.abs(a.x - me.x) ? q : a), null);
  return near(downs.filter(q => !q.ai)) || (b.reviveAll ? near(downs.filter(q => q.ai)) : null);
}

/* THE TOLD CATCH-UP (the brief's 'CATCH-UP PUFF when behind/stuck, WAITING at hard platforming instead of dying repeatedly'). The party's leash (src/party.js)
   already pulls anyone off the picture or stretched at the back edge; an AI is also pulled when it is:
     'far'    a long way from its leader (a door, a lift, a ferry, a teleport took him somewhere it cannot walk) - CATCH.far px across or CATCH.farY down
     'stuck'  it has not closed on him for CATCH.stuck s while more than CATCH.near px away (a ledge it cannot make, a wall)
     'wait'   it fell into a hazard in the last CATCH.wait s and he is still ahead: it stands still and waits for the pull instead of jumping again
     'raft'   it stands alone on a raft or ferry (a raft that leaves without its player would strand him: it never rides one without a human aboard)
   The meter builds over the leash's own LEASH.build (a rope to him, CATCH UP over its head) and the pull is the leash's puff. */
export const CATCH = { far: 260, farY: 150, near: 72, stuck: 2.5, wait: 4, gain: 6 };
export function catchWhy(me, lead, s) {
  if (!me || !lead || me === lead || me.dead || me.down > 0 || me.held || me.flying) return '';
  if (s && s.raft) return 'raft';
  const dx = Math.abs(lead.x - me.x), dy = Math.abs(lead.y - me.y);
  if (dx > CATCH.far || dy > CATCH.farY) return 'far';
  if (s && s.wait) return 'wait';
  if (s && s.stuckT >= CATCH.stuck) return 'stuck';
  return '';
}
/* one frame of the stuck clock: s = { best, stuckT }, d = how far it is from its leader now; fighting/reviving pauses it */
export function stuckStep(s, d, dt, busy) {
  if (busy || d <= CATCH.near) return { best: d, stuckT: 0 };
  if (!(d < s.best - CATCH.gain)) return { best: s.best, stuckT: s.stuckT + dt };
  return { best: d, stuckT: 0 };
}

// A grounded spear cannot reach a body entirely below its footing. Walk down before duelling;
// a live attack that already reaches the body keeps its original combat path.
export function needsLowerFooting(me, targetBox, attackBox) {
  return !!(me && me.hero === 'warden' && me.ground && !me.swim && !me.climb && !me.flip && !me.held && !me.flying
    && targetBox && Number.isFinite(targetBox.t) && targetBox.t > me.y && (!attackBox || attackBox.b <= targetBox.t));
}

/* THE WORDS (claude/coopclarity's rule: every seat line says where what it earns goes) */
export const AI_TAG = 'AI PARTNER';
export const DEFAULT_LINE = 'DEFAULT: PLAYS AT YOUR LEVEL - NOTHING IS SAVED';
export const LINKED_TAIL = n => 'EARNS XP INTO SAVE ' + n;
/* a slot in the AI picker: 'SAVE 2 - PYRO LV 6: EARNS XP INTO SAVE 2' (the save module's summary decides empty / damaged / held) */
export function linkedLine(i, s, name = h => String(h || '').toUpperCase(), held = false) {
  const n = 'SAVE ' + (i + 1), tail = held ? (typeof held === 'string' ? held : 'IN USE ELSEWHERE') : null;
  if (s.state === 'corrupt') return n + ' - DAMAGED';
  if (s.state === 'newer') return n + ' - FROM A NEWER BRACKEN';
  if (s.state === 'empty') return n + ' - EMPTY: ' + (tail || 'A NEW HERO, ' + LINKED_TAIL(i + 1));
  return n + ' - ' + name(s.hero) + ' LV ' + s.level + ': ' + (tail || LINKED_TAIL(i + 1));
}
/* the seat's row on the board: 'AI PARTNER - KNIGHT LV 6, BALANCED: EARNS XP INTO SAVE 2' / 'AI PARTNER - PYRO, SUPPORT: YOUR LEVEL - NOTHING SAVED' */
export function seatLine(heroName, lv, slot, beh) {
  const b = BEH_NAME[beh] || BEH_NAME.balanced;
  return AI_TAG + ' - ' + heroName + (lv != null ? ' LV ' + lv : '') + ', ' + b + ': ' + (Number.isInteger(slot) && slot >= 0 ? LINKED_TAIL(slot + 1) : 'YOUR LEVEL - NOTHING SAVED');
}
/* the win card's SAVED TO cell for an AI seat: its save (linked), else AI (nothing saved) */
export const savedCell = slot => (Number.isInteger(slot) && slot >= 0 ? 'SAVE ' + (slot + 1) : 'AI');
