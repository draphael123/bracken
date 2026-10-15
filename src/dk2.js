// src/dk2.js — THE DEATH KNIGHT 2: THE BLOOD PRICE AND THE DRAIN (claude/dk2b, Daniel 10-12 + 10-13 + 10-14 LATE, scratch/brief-dk2.md).
// He SPENDS HIS OWN BLOOD to power his blood moves and DRAINS it back out of what he cuts - hurt yourself, drain to heal, is his loop.
// HE NEVER KILLS HIMSELF (the Berserker 2 rule): every price his own kit puts on his health is floored at 1 hp; a foe can still kill him.
//   REAPER'S RHYTHM (X, the chain)  ~35% quicker than the old swing (it was too slow and knight-like). 1 a RISING LOW DIAGONAL cut,
//                                   2 a hooking REVERSE SWEEP that pulls what it lands on a step toward him (the chain's echo), 3 a heavy
//                                   downward DRAG that DRAINS a sliver of hp if it lands. The blade leaves a short BLOOD TRAIL, and every
//                                   cut of the chain that lands FEEDS THE BLOOD WARD (what the ward holds is the nova it lets go).
//   BLOOD PRICE CLEAVE (hold X)     while held the blade DRINKS HIS OWN BLOOD - a price every PRICE.every s (PRICE.pct of his max health,
//                                   floored at 1 hp) and it glows redder and grows. RELEASE = a huge CRESCENT CLEAVE whose damage scales
//                                   with what he paid, and it DRAINS BACK DOUBLE the price if it lands (nothing hit = the blood is lost).
//                                   Tagged heavy (B14). THE PLANTED BLADE's blood bolts LEFT the heavy: they are THE RED VOLLEY talent now
//                                   (fullCircle), loosed where a DEEP-PAID crescent lands (paid PRICE.volleyAt times or more).
//   GRAVE KNEEL (crouch)            down on one knee with the greatsword PLANTED POINT-DOWN in front: it BLOCKS LOW blows from the front
//                                   (a sweep, a roller - src/marks.js HEIGHT 'low', or a blow handed o.low) for a guard's wind; kneeling
//                                   over a body HARVESTS it (src/crouch-b.js, unchanged). Hers (the Ranger's kneeling draw) ducks HIGH; his
//                                   blocks LOW.
//   THE DEAD LINGER                 for him (only while he is the hero) a body lies LINGER.body s, not 24, and glows a faint red while it
//                                   can still be harvested or raised; the fallen body's picture stays as long as its blood does.
// main.js binds it: the numbers below, and the few pure helpers the hero code and tools/dk2.mjs share.
export const DK2 = {
  /* REAPER'S RHYTHM: rate is P.atk's speed (the old swing 0.34 -> x1.35); pull px a hooked foe is drawn toward him (never a boss or a mini,
     never through a wall); drain: the drag gives back drain x the blow's damage (drainMin..drainMax hp); ward: what one landed cut of the chain
     puts in the ward (P.wardG) - never past wardTop of a full ward, so feeding it never breaks it */
  rhythm: { rate: 0.46, pull: 12, drain: 0.2, drainMin: 1, drainMax: 5, ward: 7, wardTop: 0.75, trail: 0.24 },
  /* BLOOD PRICE CLEAVE: a price of pct of max health the moment the wind starts, then one every `every` s held, at most `ticks`; each paid
     price adds mul to the crescent's multiplier; a crescent that lands drains back `back` x what was paid; rate is the release's P.atk speed;
     reach is the crescent's box (px in front), +grow a price; volleyAt: the price count that looses THE RED VOLLEY (with its talent) */
  price: { every: 0.5, pct: 0.03, ticks: 6, mul: 0.22, back: 2, rate: 0.32, reach: 38, grow: 3, top: 42, live: [0.12, 0.26], volleyAt: 3 },
  /* GRAVE KNEEL: what a low blow turned on the planted blade costs him (the guard's own price, src/commit.js blockCost) */
  kneel: { said: 1.2 },
  /* THE DEAD LINGER for him: a body's life (s) and the last `fade` s it dims over */
  linger: { body: 45, fade: 3 },
};

/* HE NEVER KILLS HIMSELF: what his own kit costs leaves him at least one, and never takes a last point he has */
export const selfFloor = (hp, cost) => hp <= 1 ? hp : Math.max(1, hp - cost);
/* one price of the cleave, for a max health */
export const priceOf = maxHp => Math.max(1, Math.round(maxHp * DK2.price.pct));
/* which cut of the rhythm this is, from the run count: 0 the rising diagonal, 1 the reverse sweep, 2 the drag */
export const rhythmStep = combo => ((Math.max(1, combo || 1) - 1) % 3);
export const RHYTHM_NAMES = ['THE RISING CUT', 'THE HOOK', 'THE DRAG'];
/* the crescent's multiplier for what was paid */
export const cleaveMul = ticks => 1 + DK2.price.mul * Math.max(0, ticks | 0);
/* what a landed drag gives back */
export const dragDrain = dmg => Math.max(DK2.rhythm.drainMin, Math.min(DK2.rhythm.drainMax, Math.round(dmg * DK2.rhythm.drain)));

/* THE CUTS' BOXES (x, y the hero's feet, face +-1, atk P.atk). The rhythm's windows are the old swing's (0.12-0.24 of the art clock - it is
   the clock that is quicker); the crescent reaches further, higher and lower than any of them, and grows with what he paid. */
export function rhythmBox(x, y, face, atk, step, longHaft) {
  if (atk < 0.12 || atk >= 0.24) return null;
  const lh = 14 * (longHaft || 0);
  const r = (step === 0 ? (atk < 0.15 ? 22 : 30) : step === 1 ? (atk < 0.15 ? 24 : 32) : (atk < 0.15 ? 22 : 31)) + lh;
  const top = step === 0 ? 26 : step === 1 ? 18 : 30, bot = 2;   /* the diagonal rises from the ankle, the hook goes along the shins, the drag comes down from overhead */
  return face > 0 ? { l: x + 2, r: x + r, t: y - top, b: y + bot } : { l: x - r, r: x - 2, t: y - top, b: y + bot };
}
export function crescentBox(x, y, face, atk, ticks, longHaft) {
  const S = DK2.price; if (atk < S.live[0] || atk >= S.live[1]) return null;
  const r = S.reach + S.grow * Math.min(S.ticks, ticks | 0) + 14 * (longHaft || 0);
  return face > 0 ? { l: x - 6, r: x + r, t: y - S.top, b: y + 4 } : { l: x - r, r: x + 6, t: y - S.top, b: y + 4 };   /* (a crescent: it starts a little behind him, over his shoulder) */
}
