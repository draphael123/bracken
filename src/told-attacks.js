// src/told-attacks.js - THE FOE PASS, LEVER 4b: EVERY FOE FAMILY'S ONE TOLD ATTACK YOU MUST ANSWER (claude/foepass; scratch/brief-foepass-1016.md).
//
// The marks (src/marks.js) already say over every windup whether the shield turns it, and its ANSWER row what to do. What a family lacked
// was a SIGNATURE: the one blow of its kit that is THE question it asks - answered by PARRY (the shield / the hero's own beat on a yellow !),
// JUMP (a low blow) or DUCK (a high one) - and a windup SHAPE of its own, so the answer is read off the body before the mark is even read:
//   PARRY  'draw'  drawn back and up, weight on the back foot: the blow is coming AT you - meet it on the beat (a gold shield beside the !)
//   JUMP   'low'   down on its haunches, wide and low: it is coming along the floor - be over it (the jump arrow beside the !, as today)
//   DUCK   'high'  up tall, reaching over: it is coming at head height - be under it (the duck arrow beside the !, as today)
// THE ANSWER PAYS. A parried signature is the universal parry (src/riposte.js: the foe reels, the riposte window). A JUMPED or DUCKED one -
// the hero inside its reach and in the answer's posture as it comes down, and not hurt by it - OVERREACHES: TOLD.overreach of its bar at once
// (often a break, so a finisher), the word over it in gold. Answering well carries you on, as the finisher's refund does.
//
// ONE ROW A FAMILY (a family = a kind and its reskins: cnSkin bodies run the kind's AI). The row names an EXISTING told blow (a MARK row):
// the sweep lanes by act add the rest - and where a family's only blows are red !! dodges (a thief's snatch, a sapper's fuse), they build it
// a new answerable one with its own windup pose (B16) and take it off TOLD_TODO. tools/foe-pass.mjs GATES acts I-II (every family that stands
// in an act I-II level has a row or a TOLD_TODO line; the list may only shrink) and REPORTS acts III-V.
// main.js hooks: poseOf (toldPose instead of the shared windKeys for a signature), the tell queue's lane (laneFor: the parry shield), the
// release beat in updateEnemies (released) and once a frame (frame).

export const TOLD = {
  overreach: 0.6,      // of its bar, added at once to a foe whose JUMP / DUCK signature was answered (a light bar: a break)
  reach: 52,           // px: the hero within this of it (and 40 up/down) when it comes down counts as answering it, not standing off it
  judge: 0.35,         // s after the release: unhurt by then = answered
  col: '#ffd36b',      // the answer read is gold (the tell-colour language: gold = parryable / answer it, red = get clear, white = breakable)
};
/* POSES: the shape of the windup by its answer */
export const POSE_OF = { parry: 'draw', jump: 'low', duck: 'high' };

/* THE SIGNATURES, acts I-II (the first application; the act sweeps add acts III-V). mode = the MARK row's mode (type|mode). */
export const SIG = {
  /* act I - the greenwood */
  archer: { mode: 'draw', answer: 'duck' },        sprig: { mode: 'biteTell', answer: 'parry' },     wasp: { mode: 'stingTell', answer: 'parry' },
  shield: { mode: 'shoveTell', answer: 'parry' },  sporeling: { mode: 'biteTell', answer: 'parry' }, lurker: { mode: 'springTell', answer: 'parry' },
  thorn: { mode: 'wind', answer: 'parry' },        hopper: { mode: 'hopTell', answer: 'parry' },     brute: { mode: 'wind', answer: 'parry' },
  pike: { mode: 'tell', answer: 'parry' },         hound: { mode: 'pounceTell', answer: 'jump' },    weaver: { mode: 'spitTell', answer: 'parry' },
  burngob: { mode: 'swingTell', answer: 'parry' }, spider: { mode: 'dropTell', answer: 'parry' },    assassin: { mode: 'stabTell', answer: 'parry' },
  stiltwalker: { mode: 'jabTell', answer: 'duck' },   leech: { mode: 'rear', answer: 'jump' },   /* (claude/fenroad2) THE BOG LEECH's lunge comes up out of the water at where you stand: be over it (a roll goes through it too) */   /* (claude/fenroad) THE GOBLIN STILT-WALKER's downward gaff jab: under it, or parry it */
  trophyhunter: { mode: 'lungeTell', answer: 'parry' }, spit: { mode: 'spitTell', answer: 'parry' }, bellman: { mode: 'swingTell', answer: 'parry' }, drummer: { mode: 'shoveTell', answer: 'parry' },   /* (claude/warcairn) THE DRUMMER's shove (src/war-cairn-hands.js) */
  badger: { mode: 'chargeTell', answer: 'parry' }, crow: { mode: 'diveTell', answer: 'duck' },      heavy: { mode: 'slashTell', answer: 'parry' },
  soldier: { mode: 'slashTell', answer: 'parry' }, berserker: { mode: 'flailTell', answer: 'parry' }, cutter: { mode: 'raise', answer: 'parry' },
  swornsword: { mode: 'cutTell', answer: 'parry' }, hearthgob: { mode: 'raise', answer: 'parry' },
  forgemaster: { mode: 'tongsTell', answer: 'parry' },   /* (batch125 integ, foe-pass) THE FORGEMASTER's HAMMER AND TONGS is a ! block (the shield turns it) */
  shrieker: { mode: 'aim', answer: 'parry' }, galeharpy: { mode: 'galeTell', answer: 'parry' },   /* (claude/rookery2) THE GALE HARPY: her gust told by wings back (a ! the shield braces) */ butcher: { mode: 'wind', answer: 'parry' },   /* (BATCH123 integ, foe-pass) THE ROOKERY's SHRIEKER aims like the harpy it is (a ! block), THE KITCHEN GATE's BUTCHER winds a ! cleaver chop (block) before his red !! raise */
  hornsman: { mode: 'maulTell', answer: 'parry' },   /* (batch122, claude/palisadefoe) THE HORNSMAN's MAUL: a shield turns it (the horn is no blow) */
  honeyhornet: { mode: 'ramTell', answer: 'parry' },   /* (claude/hornetsnest2) THE FAT HONEY HORNET's RAM: meet it on the shield - it reels, its soft head to you */
  swarm: { mode: 'rise', answer: 'jump' },   /* (integ116, claude/hornetsnest: THE SWARM's red !! rise is the told beat before it stings - its mark is low, so the answer read is the jump out of the cloud) */
  royalboar: { mode: 'tell', answer: 'parry' },   /* (integ115: King Gorm's hall boar - its charge is told '!' and a shield turns it (src/royal-boar.js), so the answer is the parry) */
  eel: { mode: 'lungeTell', answer: 'parry' }, gar: { mode: 'lungeTell', answer: 'parry' }, turtle: { mode: 'snapTell', answer: 'parry' }, heronfoe: { mode: 'strikeTell', answer: 'parry' },
  /* act II - the crags */
  rockgoblin: { mode: 'throw', answer: 'parry' },  harpy: { mode: 'aim', answer: 'parry' },          bat: { mode: 'diveTell', answer: 'duck' },
  miner: { mode: 'swingTell', answer: 'parry' },   javelin: { mode: 'slashTell', answer: 'parry' },  goat: { mode: 'charge', answer: 'parry' },
  troll: { mode: 'ripTell', answer: 'jump' },      fledgling: { mode: 'peckTell', answer: 'parry' }, tippler: { mode: 'barTell', answer: 'parry' },
  snuffer: { mode: 'swipeTell', answer: 'parry' }, gobpriest: { mode: 'censerTell', answer: 'parry' }, gobmage: { mode: 'boltTell', answer: 'duck' },
  kite: { mode: 'dropTell', answer: 'parry' },     horn: { mode: 'tell', answer: 'duck' },           sheargob: { mode: 'snipTell', answer: 'parry' },
  hare: { mode: 'run', answer: 'parry' },          gaffer: { mode: 'hookTell', answer: 'duck' },     scalder: { mode: 'ladleTell', answer: 'parry' },
  sailer: { mode: 'sail', answer: 'parry' },       kiterider: { mode: 'kickTell', answer: 'parry' }, bale: { mode: 'rollTell', answer: 'jump' },
  temperer: { mode: 'cutTell', answer: 'parry' },  sweep: { mode: 'popTell', answer: 'parry' },      propman: { mode: 'raise', answer: 'parry' },
  whelp: { mode: 'crouchTell', answer: 'parry' },  grub: { mode: 'spit', answer: 'parry' },          bonearcher: { mode: 'draw', answer: 'duck' },
  bonegob: { mode: 'throw', answer: 'parry' },
  /* THE SEVEN THAT WERE ON TOLD_TODO (claude/sweepact12, 10-20): each got a NEW answerable told attack with its own windup (src/main.js, each family's update) */
  drone: { mode: 'puffTell', answer: 'parry' },   /* (claude/sporewood2tune) the spore drone rears back, then lunges: a shield turns it */
  thief: { mode: 'swipeTell', answer: 'jump' },   spitcap: { mode: 'spitTell', answer: 'duck' },   sapper: { mode: 'shoveTell', answer: 'parry' },   emberwisp: { mode: 'dartTell', answer: 'parry' },   stormshaman: { mode: 'jabTell', answer: 'parry' },   clinger: { mode: 'lashTell', answer: 'duck' },   shardling: { mode: 'flickTell', answer: 'jump' },
};
/* THE FAMILIES OF ACTS I-II WHOSE EVERY BLOW IS A RED !! (dodge) - no blow they have can be parried, jumped or ducked. Each needs a NEW told attack
   with its own windup pose, built by its act's sweep lane. This list may only shrink (tools/foe-pass.mjs). */
export const TOLD_TODO = {};   /* EMPTY (claude/sweepact12): thief, spitcap, sapper, emberwisp, stormshaman, clinger and shardling each have a signature now */
/* NOT FAMILIES THE PLAYER FIGHTS: the Road Wardens' knights (elites with their own kit), the King's Road's ram (a trap prop), the oath-mage */
export const NOT_FAMILY = new Set(['oathblade', 'oathmaul', 'oathlance', 'oathmage', 'ram', 'ramlord']);

/* is e in its family's signature windup right now? (the row, or null). base: the kind its AI runs on (a cnSkin body is its kind) */
export const sigOf = e => { const r = e && SIG[e.t]; return r && !e.elite && !e.maxHp && !e.mini && e.mode === r.mode ? r : (r && e.t === 'archer' && r.mode === 'draw' && e.draw > 0.3 && !e.elite ? r : null); };

/* THE SHAPE. o: poseOf's pose; a: seconds into the windup (main.js tellClock); f: facing. True: the signature owns the pose (the shared windKeys is skipped) */
export function toldPose(o, e, a, now) {
  const r = sigOf(e); if (!r) return false;
  const f = e.face || 1, k = Math.min(1, a / 0.14), shake = a > 0.3 && Math.floor(now * 24) % 2 ? f : 0;
  const p = POSE_OF[r.answer];
  if (p === 'low') { o.sy *= 1 - 0.2 * k; o.sx *= 1 + 0.16 * k; o.dy += Math.round(1 * k); o.rot = (o.rot || 0) + f * 0.06 * k; o.dx -= f * Math.round(2 * k) - shake; }   /* down on its haunches: it comes along the floor */
  else if (p === 'high') { o.sy *= 1 + 0.12 * k; o.sx *= 1 - 0.08 * k; o.dy -= Math.round(2 * k); o.rot = (o.rot || 0) - f * 0.1 * k; o.dx -= f * Math.round(1 * k) - shake; }   /* up tall, reaching over: head height */
  else { o.sy *= 1 + 0.04 * k; o.sx *= 1 - 0.03 * k; o.rot = (o.rot || 0) - f * 0.24 * k; o.dx -= f * Math.round(3 * k) - shake; o.dy -= Math.round(1 * k); }   /* drawn back and up: meet it on the beat */
  return true;
}
/* THE LANE GLYPH beside its mark: the parry shield for a PARRY signature; the duck / jump arrows stay the HEIGHT table's (src/marks.js laneOf) */
export const laneFor = (e, lane) => { const r = sigOf(e); return r && r.answer === 'parry' ? 'parry' : lane; };
export const PARRY_PIX = ['#######', '#.###.#', '#######', '.#####.', '.#####.', '..###..', '...#...', '.......'];

/* THE RELEASE (main.js, the frame a windup ends): a JUMP / DUCK signature coming down with the hero near it is watched for TOLD.judge s */
export function released(e, mode, hero, now) {
  const r = SIG[e.t]; if (!r || r.mode !== mode || r.answer === 'parry' || !hero || hero.dead || e.elite || e.maxHp || e.mini) return false;
  if (Math.abs(hero.x - e.x) > TOLD.reach * 1.5 + (e.w || 12) / 2 || Math.abs(hero.y - e.y) > 48) return false;
  e.taAt = now; e.taAns = r.answer; e.taOk = false; return true;
}
/* is the hero in the answer's posture inside its reach right now? (jump: off the floor and over its feet; duck: down) */
export const inPosture = (e, hero, ducking) => !!hero && !hero.dead && Math.abs(hero.x - e.x) <= TOLD.reach + (e.w || 12) / 2 && Math.abs(hero.y - e.y) <= 40
  && (e.taAns === 'jump' ? !hero.ground && hero.y < e.y - 4 : !!ducking);
/* ONCE A FRAME, per watched foe: in posture at some frame of the window, and unhurt at its end -> OVERREACHED: api.lean(e, share), api.say(e, word, col).
   hurtAt: when the hero last lost health */
export function judge(e, now, hero, ducking, hurtAt, api) {
  if (e.taAt === undefined) return false;
  if (now - e.taAt < TOLD.judge) { if (inPosture(e, hero, ducking)) e.taOk = true; return false; }
  const at = e.taAt, ans = e.taAns, ok = e.taOk; e.taAt = undefined; e.taAns = undefined; e.taOk = false;
  if (!ok || !e.alive || (hurtAt !== undefined && hurtAt >= at)) return false;
  api.lean(e, TOLD.overreach); api.say(e, ans === 'jump' ? 'OVER IT' : 'UNDER IT', TOLD.col); return true;
}
/* the words an answered signature says (main.js MOVE_WORDS) */
export const WORDS = ['OVER IT', 'UNDER IT'];
/* ONE TELL-COLOUR LANGUAGE (scratch/brief-polishpro-1016.md 1, rec): GOLD = answer it on the beat (parry), RED = nothing turns it (get clear), WHITE = it breaks
   (a shell, a guard you break with the right blow). The marks keep their two (src/marks.js, tools/tells.mjs); the foe pass's reads use these three, and
   tools/foe-pass.mjs holds them to it. */
export const TELL_COLOURS = { parry: '#ffd36b', dodge: '#ff6b6b', breakable: '#f4f8ff' };
