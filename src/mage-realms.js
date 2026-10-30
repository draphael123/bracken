// src/mage-realms.js - THE UNDEAD ARCHMAGE'S SPELL REALMS (claude/undead3; Daniel, 2026-09-29: "needs more portals than just desert;
// fire/ice/poison portals as his spells; more mechanics").
//
// THE FIGHT BY PHASE. At 75%, 50% and 25% of his health he TEARS A PORTAL (realmTell: a great ring of the realm's colour opens by him and
// flares, and the screen says which) and pulls you through it, carpet and all, into a short room made of that spell. The room is narrower
// than his hall (REALM.w) and all of it is on the screen. In a realm his ward holds: no blow bites him (main.js hurtEnemy0) until you find
// the realm's ONE opening; then he is open for REALM.openT at double damage, and when that runs out the realm tears and you are back in his
// hall. Each realm's damage can take him no lower than the next realm's mark (realmFloor): every realm is its own fight, never skipped.
// His health is his own (600): nothing here adds any. Every blow in a realm is TOLD - a glow, a crack, a ring, his own marks - and every
// one comes from inside the room you can see.
//
//   FIRE    THE BURNING FLOOR  the floor is seven tiles, and they burn in a PATTERN: a set glows (fire.tell) then stands up as pillars of
//                              fire, floor to ceiling (fire.burn) - be over a dark tile. He rolls a FIRE WALL at you (wallTell !!): a
//                              sheet of flame that follows your height, slowly, and runs to the far wall and ROLLS BACK.
//           THE OPENING        LURE HIS FIRE WALL BACK THROUGH HIM. Coming back it hunts your height and breaks on the first body it
//                              meets. Taken, it breaks on you; DODGE THROUGH IT (or get past him, so he is between you and it) and it
//                              runs on into him, and his own wall burns him (SCORCHED).
//   ICE     THE FROZEN HALL    the cold takes the carpet's grip (ice.grip: it slides), and icicles hang the length of the ceiling: one over
//                              you CRACKS (ice.crack: it shakes and a line of frost runs down to the floor under it), then falls - get out
//                              from under. He hangs low in a shell of ice, drifting, and throws his ice lances (iceTell !).
//           THE OPENING        SHATTER HIS WARD WITH A DROPPED ICICLE: strike an icicle over him and it falls on his shell (SHATTERED).
//   POISON  THE MIRE           the floor is a mire that RISES (poison.rise) while you are in the realm: you must stay above it - it bites
//                              and poisons and throws you up. He hangs over its VENT, fed by a green beam; he throws spore clouds (sporeTell
//                              !!: three rings on the air where they will bloom).
//           THE OPENING        STRIKE THE MIRE'S VENT WHILE HE IS EXPOSED: casting the spores cuts the beam (poison.exposed), and a blow on
//                              the vent then bursts back up it into him (VENTED) and the mire drains. Struck while he feeds, it holds.
// This module knows nothing of the player's health or the screen: c.hit / c.say / c.sound / c.venom / c.pull / c.leave are main.js's.
export const REALM = {
  at: [0.75, 0.5, 0.25], kinds: ['fire', 'ice', 'poison'],
  name: { fire: 'THE FIRE REALM', ice: 'THE ICE REALM', poison: 'THE POISON REALM' },
  col: { fire: ['#ff9b49', '#ffe9b0', '#c9463d'], ice: ['#9be2ff', '#ffffff', '#3a6a9a'], poison: ['#8fd160', '#d8ffb0', '#3a5a2a'] },
  w: 420,                   /* the realm is this wide, centred on his hall: the whole of it on a zoomed screen */
  tear: 1.2,                /* the tear's tell: his ring opens and flares this long before it takes you */
  openT: 3.0, openMul: 1.5,   /* the opening: this long, at x1.5 (claude/archmage4: was x2 through his hall's MAGE.openMul - the three realms' openings were about 40% of what the human bot dealt him) */
  rest: 6,                  /* seconds in his hall after a realm before the next can be torn */
  bolt: { v: 150, fire: 14, ice: 12, tellFire: 0.9, tellIce: 0.9 },
  fire: { n: 7, grace: 2.0, tell: 1.2, burn: 0.8, every: 3.6, dmg: 16, wallTell: 1.4, wallV: 120, wallH: 64, track: 45, trackBack: 140, wallDmg: 18, cast: 2.4,
    /* (claude/fallingtower2, Daniel 10-08 'the fire room'): grace - an ARRIVAL GRACE, nothing burns or is cast while you get your bearings; the tile tell
       and the wall tell are longer and HISS as they start (the wall's vents glow where it will rise: drawRealmFx) */
    patterns: [[0, 2, 4, 6], [1, 3, 5], [0, 1, 2], [4, 5, 6], [0, 3, 6], [1, 2, 4, 5], [2, 3, 4]] },
  ice: { n: 7, crack: 0.9, fallV: 380, every: 1.7, regrow: 3.0, dmg: 14, drift: 42, grip: 0.3, cast: 2.4, len: 20,
    home: 40, homeV: 240, hitW: 22 },   /* claude/archfix (Daniel: "easier to hit him with"): an icicle struck within home px of him falls ONTO him (it homes at homeV), and it breaks his shell anywhere within hitW of his middle */
  poison: { rise: 5, cap: 0.55, bite: 10, warm: 0.12, tick: 0.6, lift: 170, sporeTell: 1.1, sporeLife: 2.6, sporeR: 26, exposed: 3.0,   /* (claude/archmage4: exposed 2.4 -> 3.0 s: the knight never reached the vent in 2.4) */ every: 4.2, drain: 60, cast: 2.2 },
  /* claude/archfix (Daniel played both archmages, 2026-09-29: "these need to be more obvious" - in the fire realm he could not tell how to
     hurt him). EACH REALM SAYS ITS OPENING IN PLAIN WORDS: a banner every time you are pulled in (cueLen s; never the 2-per-save hint cap),
     and again for cueAgain s whenever a blow is turned by his ward */
  cue: { fire: 'LET HIS FIRE WALL PASS, THEN PUT HIM BETWEEN YOU AND IT', ice: 'STRIKE THE ICICLE ABOVE HIM', poison: 'WHEN HE CASTS, STRIKE THE VENT' },
  cueLen: 4.5, cueAgain: 2.5,
  openWord: { scorched: 'HE BURNS', shattered: 'HIS SHELL SHATTERS', vented: 'HE CHOKES' },
  /* LIVING REALMS (claude/ft4c, scratch/brief-fallingtower4-1029.md #4 A, Daniel 10-29 'the element rooms feel STATIC'). EACH REALM COMES APART IN 3 BEATS
     (beat.at s after you arrive - the fire room's after its grace), each beat SAID and shaken in, and the realm's walls break off in chunks as they run:
       FIRE    1 the tile pattern   2 burnt tiles CRACK AND FALL (a tile glows dark fire2.drop s, then drops: a burning pit, low)   3 the realm TILTS toward his perch
       ICE     1 icicles            2 the CEILING COMES DOWN (frost creeps ice2.creep s, then 2 rows)  3 2 more rows, and the floor freezes into drifting FLOES he hides behind
       POISON  1 the mire rises     2 the VENTS WAKE (3 vents; the next one BUBBLES poison2.bubble s, then he hops to it)  3 the mire SURGES (told), and bone RAFTS float up
     AND A SECOND THING TO HIT BACK (cue2, on the banner under the first): FIRE strike his firebolt into the BRAZIER hung over his perch (it spills on him);
     ICE bat his ice lances back - two in his shell shatter it; POISON strike a spore ring back at him before it blooms. HE MOVES: between two perches (fire),
     behind the floes (ice), from vent to vent (poison). Everything here keys off the realm's box (realmBox), never off the level's tiles: no level hash change. */
  cue2: { fire: 'OR STRIKE HIS FIREBOLT INTO THE BRAZIER OVER HIM', ice: 'OR BAT TWO ICE LANCES BACK INTO HIS SHELL', poison: 'OR STRIKE A SPORE RING BACK BEFORE IT BLOOMS' },
  beat: { at: [7, 14], crumble: 10, every: 0.7, sayT: 2.5,
    say: { fire: ['', 'THE FLOOR BREAKS UP: BURNT TILES FALL', 'THE REALM TILTS TOWARD HIM'], ice: ['', 'THE CEILING COMES DOWN', 'THE FLOOR FREEZES: HE HIDES BEHIND THE FLOES'], poison: ['', 'THE VENTS WAKE: HE MOVES', 'THE MIRE SURGES: FIND A RAFT'] } },
  ret: { v: 260, turn: 5, r: 16, cd: 0.25 },   /* a blow struck back in a realm: his fight's speed (MAGE.reflect), a little keener on the turn (the room is small) */
  fire2: { drop: 0.8, maxHoles: 3, holeH: 44, holeDmg: 10, holeCd: 0.9, tilt: 24, perch: 64, cross: 7, crossV: 110, brazierY: 30, brazierR: 22, relight: 6, pourT: 0.6 },
  ice2: { ceil: 32, creep: 1.5, ceilV: 30, cracks: 2, floes: [0.22, 0.55, 0.86], floeW: 34, floeH: 38, floeV: 18 },
  poison2: { vents: [0.28, 0.5, 0.72], first: 2, hop: 6.5, bubble: 1.4, surgeEvery: 8, surgeFirst: 2, surgeTell: 1.5, surgeUp: 0.4, surgeHold: 1.8, surgeDown: 0.6, surgeH: 44,
    rafts: [0.39, 0.61], raftW: 40, sporeV: 170 },
};
export const OPEN = new Set(['scorched', 'shattered', 'vented']);
/* the realm he is due to tear: the index of the next mark he is at or under, or -1 */
/* (claude/fallingtower3) e.realmAt: THE CHASE brings him into his hall with part of his health gone (src/archmage-chase.js), and his three realms come at marks
   cut from what is LEFT of him there (main.js chaseToHall), so each is still had in turn - REALM.at otherwise, unchanged */
const realmMarks = e => (e && e.realmAt) || REALM.at;
export function realmDue(e) { const n = e.realmN || 0, at = realmMarks(e); if (n >= at.length || e.realm || (e.realmRest || 0) > 0) return -1;
  return e.hp <= (e.hp0 || e.maxHp) * at[n] ? n : -1; }
/* THE REALM'S ROOM, in the hall's own coordinates: the middle REALM.w of it; the mire lifts its floor */
export function realmBox(e, A) {
  const mid = (A.x0 + A.x1) / 2, b = { x0: mid - REALM.w / 2, x1: mid + REALM.w / 2, y0: A.y0 + 24, y1: A.floor - 4 };
  if (e && e.realm && e.realm.kind === 'poison') b.y1 = Math.min(b.y1, e.realm.mire + 20);
  if (e && e.realm && e.realm.ceil) b.y0 += e.realm.ceil;   /* (claude/ft4c) THE ICE REALM's ceiling, come down */
  return b;
}
export const realmWarded = e => !!(e && e.realm && !OPEN.has(e.mode));
/* how low this realm can take him: the next realm's mark (none past the last) */
export const realmFloor = e => e && e.realm && e.realm.i + 1 < realmMarks(e).length ? Math.ceil((e.hp0 || e.maxHp) * realmMarks(e)[e.realm.i + 1]) : 0;

/* INTO IT. P and he are set down at opposite ends; his hall's rings, shots and marks do not come with you. */
export function enterRealm(e, A, P, c) {
  const i = e.realmN || 0, kind = REALM.kinds[i], R = { kind, i, t: 0, A };
  const b = realmBox(null, A);
  if (kind === 'fire') Object.assign(R, { graceT: REALM.fire.grace, tiles: [], ph: 'wait', phT: 1.6, pat: 0, lit: [], wall: null, castT: 1.4, nextWall: true });
  if (kind === 'ice') { const n = REALM.ice.n; R.icicles = []; for (let k = 0; k < n; k++) { const x = b.x0 + (k + 0.5) * REALM.w / n; R.icicles.push({ x, x0: x, st: 'hang', t: 0, y: 0 }); }
    Object.assign(R, { dropT: 1.4, castT: 1.8, goX: b.x1 - 90, goT: 2.5 }); }
  if (kind === 'poison') Object.assign(R, { mire: A.floor - 26, mire0: A.floor - 26, burnT: 0, vent: { x: b.x0 + REALM.w * 0.72 }, sporeT: 2.2, castT: 1.2, exposedT: 0, spores: [], clouds: [], drain: false });
  R.cueT = REALM.cueLen; R.wardT = 0;   /* the banner naming its opening, every time (drawn by main.js drawRealmBanner) */
  /* (claude/ft4c) LIVING REALMS: the beat clock, the crumbling border, what was told (R.told: [t, what] - the tests read it), the second return */
  Object.assign(R, { beat: 1, bt: 0, chunks: [], bites: [], told: [], crumT: 0, rets: [], retCd: 0 });
  if (kind === 'fire') { const F2 = REALM.fire2; Object.assign(R, { perch: 1, crossT: F2.cross, crossing: false, holes: [], drop: null, holeCd: 0, tilt: 0, pour: null, debris: [],
    braziers: [-1, 1].map(s => ({ side: s, lit: true, cd: 0 })) }); }
  if (kind === 'ice') Object.assign(R, { ceil: 0, ceilTo: 0, creepT: 0, cracks: 0, floes: null });
  if (kind === 'poison') { const Q2 = REALM.poison2; R.vents = Q2.vents.map(f => ({ x: b.x0 + REALM.w * f })); R.vent = R.vents[Q2.first];
    Object.assign(R, { mireBase: R.mire, surgeOff: 0, surge: null, sgT: 0, hopT: Q2.hop, next: null, bubT: 0, rafts: null }); }
  e.realm = R; e.shots = []; e.clouds = []; e.rings = []; e.deathMark = null; e.fireRing = null; e.chained = false; e.flashT = 0;
  P.x = b.x0 + 70; P.y = (b.y0 + b.y1) / 2 + 20; P.vx = P.vy = 0;
  e.x = b.x1 - 90; e.y = (b.y0 + b.y1) / 2; e.face = -1; e.mode = 'rhover'; e.modeT = 0.8;
  c.pull && c.pull(kind);
}
function leaveRealm(e, c) { const kind = e.realm.kind; e.realm = null; e.realmN = (e.realmN || 0) + 1; e.realmRest = REALM.rest; e.shots = []; e.clouds = [];
  e.mode = 'hover'; e.modeT = 0.6; c.sound && c.sound('golemChime'); c.leave && c.leave(kind); }
function open(e, mode, c, msg) { e.mode = mode; e.modeT = REALM.openT; e.open = REALM.openT; e.shots = []; if (e.realm) e.realm.cueT = 0; c.say(msg, true); c.sound('crack'); c.sound('sting'); }   /* (claude/archfix: a sting as he opens, a chime as the window shuts) */
/* A BLOW HIS WARD TURNS (main.js hurtEnemy0 asks): the banner comes back and his shell flares - never a silent nothing. Returns the word */
export function realmWardHit(e) { const R = e && e.realm; if (!R) return null; R.cueT = Math.max(R.cueT || 0, REALM.cueAgain); R.wardT = 0.35; R.wardSayT = 0.9; return 'WARDED'; }
/* WHAT THE SCREEN SHOWS OF THE OPENING RIGHT NOW (the cues drawRealmFx draws, and what the tests read):
     fire   the wall coming BACK, and the first body in its road - 'him' (it will burn him: you are behind him) or 'you' (it will break
            on you unless you dodge through it)
     ice    the hanging icicle over his shell (strike it and it falls on him)
     poison the vent LIT while the beam is cut (strike it now), dark while he feeds */
export function realmCue(e, P) {
  const R = e && e.realm; if (!R) return null; const out = { kind: R.kind, text: REALM.cue[R.kind], text2: REALM.cue2[R.kind], bannerT: Math.max(0, R.cueT || 0), open: OPEN.has(e.mode), beat: R.beat || 1, beatLine: R.beatSayT > 0 ? R.beatLine : null };
  if (R.kind === 'fire') { const W = R.wall; out.wall = !!W; out.back = !!(W && W.back); out.first = null;
    if (W && W.back) { const ahead = x => (x - W.x) * W.d;
      const him = ahead(e.x) > -12 ? ahead(e.x) : Infinity, you = !P.dead && ahead(P.x) > -8 ? ahead(P.x) : Infinity;   /* (it hunts your height, and he keeps yours: whichever is nearer in its road is the one it meets) */
      out.first = him === Infinity && you === Infinity ? null : him <= you ? 'him' : 'you'; } }
  if (R.kind === 'ice') { let best = null; for (const q of R.icicles) if (q.st === 'hang' && Math.abs(q.x - e.x) < REALM.ice.home && (!best || Math.abs(q.x - e.x) < Math.abs(best.x - e.x))) best = q; out.icicle = best; }
  if (R.kind === 'poison') out.vent = R.exposedT > 0 && !out.open;
  /* (claude/ft4c) THE SECOND RETURN: the lit brazier over him (fire), the cracks in his shell (ice), a spore ring you can strike back (poison) */
  if (R.kind === 'fire') { const br = brazierOver(e); out.brazier = br && br.lit && !out.open ? br.side : 0; }
  if (R.kind === 'ice') out.cracks = R.cracks || 0;
  if (R.kind === 'poison') { out.spore = e.mode === 'sporeTell' && (R.spores || []).length > 0 && !out.open; out.next = R.next ? R.next.x : null; }
  return out;
}
const hurtBy = (c, x, y, d, hard, blow) => c.hit(x, y, d, hard, blow);
/* ---------------------------------------------------------------- LIVING REALMS (claude/ft4c) */
/* a perch / brazier's x in the realm's box: his two perches are at its ends, a brazier hung over each */
const perchX = (b, side) => side > 0 ? b.x1 - REALM.fire2.perch : b.x0 + REALM.fire2.perch;
/* the brazier over him (the one nearer him), or null */
function brazierOver(e) { const R = e && e.realm; if (!R || !R.braziers) return null; const b = realmBox(e, R.A);
  return R.braziers.reduce((a, q) => !a || Math.abs(perchX(b, q.side) - e.x) < Math.abs(perchX(b, a.side) - e.x) ? q : a, null); }
/* the realm's own dice for its looks (chunks, notches): never the fight's rnd, so a beat never shifts what the fight rolls */
const rr = R => (R.seed = ((R.seed || 7919) * 16807) % 2147483647) / 2147483647;
/* THE BORDER IS THE TOWER CRUMBLING: chunks off its walls fall into the realm (looks only, they hurt no one); a big crumble also bites a notch out of the wall */
function crumble(R, b, n, big) { for (let i = 0; i < n; i++) { const side = rr(R) < 0.5 ? -1 : 1, x = side < 0 ? b.x0 + 2 : b.x1 - 2;
    R.chunks.push({ x, y: b.y0 + rr(R) * (b.y1 - b.y0) * 0.8, vx: -side * (20 + rr(R) * 50), vy: -20 - rr(R) * 40, s: 2 + Math.floor(rr(R) * 3), t: 2.5 }); }
  if (big) for (let i = 0; i < 2; i++) { if (R.bites.length >= 12) break; R.bites.push({ side: rr(R) < 0.5 ? -1 : 1, y: b.y0 + rr(R) * (b.y1 - b.y0 - 20), h: 8 + Math.floor(rr(R) * 14), d: 4 + Math.floor(rr(R) * 6) }); } }
/* THE BEAT CLOCK: beat 2 at beat.at[0] s, beat 3 at beat.at[1] s after you arrive (the fire room's after its grace) - each SAID, shaken in, with a crumble */
function stepBeat(e, R, dt, c, b) {
  if (R.graceT > 0) return; R.bt += dt; const B = REALM.beat, n = R.bt >= B.at[1] ? 3 : R.bt >= B.at[0] ? 2 : 1;
  R.beatSayT = Math.max(0, (R.beatSayT || 0) - dt);
  if (n > R.beat) { R.beat = n; R.told.push([R.t, 'beat' + n]); c.say(B.say[R.kind][n - 1], true); R.beatLine = B.say[R.kind][n - 1]; R.beatSayT = B.sayT;   /* (said on the realm's own banner: number() drops an unrouted line, and the hint box is capped) */ c.sound('heavy'); c.sound('crack'); c.shake && c.shake(5); crumble(R, b, B.crumble, true);
    if (R.kind === 'fire' && n === 3) R.tilt = R.perch;
    if (R.kind === 'ice') { R.ceilTo += REALM.ice2.ceil; R.creepT = REALM.ice2.creep; R.told.push([R.t, 'creep']);
      if (n === 3) { R.floes = REALM.ice2.floes.map((f, i) => ({ x: b.x0 + REALM.w * f, d: i % 2 ? -1 : 1 })); R.hide = R.floes.reduce((a, f) => Math.abs(f.x - e.x) < Math.abs(a.x - e.x) ? f : a); } }
    if (R.kind === 'poison') { if (n === 2) R.hopT = 1.0; if (n === 3) { R.rafts = REALM.poison2.rafts.map(f => ({ x: b.x0 + REALM.w * f })); R.sgT = REALM.poison2.surgeFirst; } } }
  if (R.beat >= 2) { R.crumT -= dt; if (R.crumT <= 0) { R.crumT = B.every * (0.6 + rr(R) * 0.8); crumble(R, b, 1, false); } }
}
function stepChunks(R, dt, b) { for (const k of R.chunks) { k.t -= dt; k.vy += 420 * dt; k.x += k.vx * dt; k.y += k.vy * dt; } R.chunks = R.chunks.filter(k => k.t > 0 && k.y < b.y1 + 60); }
/* A FLOE (beat 3 of the ice realm): a block of ice drifting on the floor - his lances break on it, and so do yours struck back at him */
const floeAt = (R, b, x, y) => !!R.floes && R.floes.some(f => Math.abs(x - f.x) < REALM.ice2.floeW / 2 && y > b.y1 - REALM.ice2.floeH && y < b.y1 + 6);
/* THE SECOND RETURN, HIS SHOTS (undead-mage.js asks, in its shots loop): his firebolt in the fire realm and his ice lances in the ice realm can be struck back
   by any blow that meets them (the fight's rule, blowMeets). The firebolt flies to the lit brazier over him; a lance flies into his shell. */
export const realmCanReturn = (e, q) => { const R = e && e.realm; return !!(R && q && q.realmRet && !q.reflected && !OPEN.has(e.mode) && !(R.retCd > 0)); };
function retTarget(e, q, b) { if (q.braz) return [perchX(b, q.braz.side), b.y0 + REALM.fire2.brazierY]; return [e.x, e.y - 26]; }
export function realmSendBack(e, q, c) { const R = e.realm, b = realmBox(e, R.A); R.retCd = REALM.ret.cd; q.reflected = true; q.t = 3; q.hit = false; q.kind0 = q.kind; q.col = '#e8fff0';
  if (R.kind === 'fire') { const br = brazierOver(e); q.braz = br && br.lit ? br : null; }
  const [tx, ty] = retTarget(e, q, b); q.a = Math.atan2(ty - q.y, tx - q.x); q.vx = Math.cos(q.a) * REALM.ret.v; q.vy = Math.sin(q.a) * REALM.ret.v;
  R.told.push([R.t, 'ret:' + R.kind]); c.say(q.braz ? 'STRUCK BACK: INTO THE BRAZIER' : 'STRUCK BACK', false); c.sound('crack'); }
/* one step of a shot struck back in a realm: true when it is done (reached its mark, or broke on a floe) */
export function realmHomeStep(e, q, dt, c) { const R = e.realm; if (!R) return true; const b = realmBox(e, R.A), [tx, ty] = retTarget(e, q, b);
  let d = Math.atan2(ty - q.y, tx - q.x) - q.a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
  q.a += Math.max(-REALM.ret.turn * dt, Math.min(REALM.ret.turn * dt, d)); q.vx = Math.cos(q.a) * REALM.ret.v; q.vy = Math.sin(q.a) * REALM.ret.v; q.x += q.vx * dt; q.y += q.vy * dt;
  if (floeAt(R, b, q.x, q.y)) { c.say('THE FLOE TAKES IT', false); c.sound('crack'); return true; }
  if (Math.hypot(q.x - tx, q.y - ty) > REALM.ret.r) return q.t <= 0;
  if (OPEN.has(e.mode)) return true;
  if (q.braz) { const br = q.braz, bx = perchX(b, br.side); br.lit = false; br.cd = REALM.fire2.relight; R.pour = { x: bx, t: REALM.fire2.pourT }; c.sound('heavy'); R.told.push([R.t, 'spill']);
    if (Math.abs(e.x - bx) < REALM.fire2.brazierR + 6) { R.wall = null; open(e, 'scorched', c, 'THE BRAZIER SPILLS ON HIM. HE IS OPEN'); } else c.say('IT SPILLS: HE WAS NOT UNDER IT', false); return true; }
  if (R.kind === 'ice') { R.cracks = (R.cracks || 0) + 1; R.told.push([R.t, 'crack' + R.cracks]);
    if (R.cracks >= REALM.ice2.cracks) open(e, 'shattered', c, 'TWO LANCES: HIS SHELL SHATTERS. HE IS OPEN'); else { R.wardT = 0.35; c.say('HIS SHELL CRACKS: ONE MORE', true); c.sound('crack'); } return true; }
  R.wardT = 0.35; c.sound('clank'); return true; }

/* ONE STEP OF A REALM: its hazard, his moves in it, and its opening. c: { P, hit, say, sound, venom, box } (box: realmBox) */
export function updateRealm(e, dt, c) {
  const R = e.realm, P = c.P, b = c.box, py = P.y - 8; R.t += dt; R.cueT = Math.max(0, (R.cueT || 0) - dt); R.wardT = Math.max(0, (R.wardT || 0) - dt); R.wardSayT = Math.max(0, (R.wardSayT || 0) - dt);
  stepChunks(R, dt, b); if (R.pour && (R.pour.t -= dt) <= 0) R.pour = null;
  if (OPEN.has(e.mode)) { e.y += Math.sin(e.anim * 2) * 4 * dt; if (R.kind === 'poison' && R.drain) { R.mireBase = Math.min(R.mire0, R.mireBase + REALM.poison.drain * dt); R.mire = R.mireBase - (R.surgeOff || 0); } if (e.modeT <= 0) leaveRealm(e, c); return; }   /* the opening runs out: the realm tears */
  R.retCd = Math.max(0, (R.retCd || 0) - dt); stepBeat(e, R, dt, c, b);
  /* (claude/ft4c) A SPORE RING STRUCK BACK (strikeRealm) flies home into him: HE CHOKES */
  for (const s of R.rets) { const d0 = Math.atan2(e.y - 26 - s.y, e.x - s.x); let d = d0 - s.a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
    s.a += Math.max(-REALM.ret.turn * dt, Math.min(REALM.ret.turn * dt, d)); s.x += Math.cos(s.a) * REALM.poison2.sporeV * dt; s.y += Math.sin(s.a) * REALM.poison2.sporeV * dt; s.t -= dt;
    if (Math.hypot(s.x - e.x, s.y - (e.y - 26)) < REALM.ret.r + 6) { R.rets = []; R.spores = []; open(e, 'vented', c, 'HIS OWN SPORES CHOKE HIM. HE IS OPEN'); return; } }
  R.rets = R.rets.filter(s => s.t > 0);
  const keep = (x, y) => [Math.max(b.x0 + 20, Math.min(b.x1 - 20, x)), Math.max(b.y0 + 44, Math.min(b.y1 - 10, y))];
  const bolt = (spell) => { const hx = e.x + e.face * 20, hy = e.y - 51,   /* (archmage3: from the head of his staff - undead-mage.js MAGE.staff) */ a = Math.atan2(py - hy, P.x - hx), B = REALM.bolt;
    /* (claude/ft4c) realmRet: this realm's own shot can be struck back (its second return); noReturn: it cannot (his firebolt in the poison realm), and it wears no gold ring */
    if (spell === 'fire') { e.shots.push({ x: hx, y: hy, vx: Math.cos(a) * B.v, vy: Math.sin(a) * B.v, a, sp: B.v, r: 5, dmg: B.fire, kind: 'fire', col: '#ff9b49', t: 4, realmRet: R.kind === 'fire', noReturn: R.kind !== 'fire' }); c.sound('mageBolt'); }
    else { for (let k = -2; k <= 2; k++) { const q = a + k * 0.3; e.shots.push({ x: hx, y: hy, vx: Math.cos(q) * 120, vy: Math.sin(q) * 120, a: q, sp: 120, r: 4, dmg: B.ice, kind: 'ice', col: '#9be2ff', t: 4, realmRet: R.kind === 'ice', noReturn: R.kind !== 'ice' }); } c.sound('hiss'); } };
  /* HIS TELLS in a realm are his fight's (fireTell, iceTell) and the realm's own (wallTell, sporeTell) */
  const tell = (mode, T, say, hard) => { e.mode = mode; e.modeT = T; c.say(say, hard); if (mode === 'wallTell') c.sound('hiss'); };   /* (fallingtower2: the wall HISSES as its vents light) */
  const casting = /Tell$/.test(e.mode);
  if (casting) { e.face = Math.sign(P.x - e.x) || e.face;
    if (e.modeT <= 0) { const m = e.mode; e.mode = 'rhover'; e.modeT = 0.4;
      if (m === 'fireTell') bolt('fire'); else if (m === 'iceTell') bolt('ice');
      else if (m === 'wallTell') { const d = Math.sign(P.x - e.x) || 1; R.wall = { x: e.x + d * 20, d, y: py, back: false, hitP: false }; c.sound('heavy'); }
      else if (m === 'sporeTell') { for (const s of R.spores) R.clouds.push({ x: s.x, y: s.y, r: REALM.poison.sporeR, t: REALM.poison.sporeLife }); R.spores = []; c.sound('hiss'); } } }
  // ---------------------------------------------------------------- FIRE
  if (R.kind === 'fire') { const F = REALM.fire, tw = REALM.w / F.n;
    if (R.graceT > 0) { R.graceT -= dt; e.face = Math.sign(P.x - e.x) || e.face; return; }   /* THE ARRIVAL GRACE (fallingtower2): a safe beat - nothing burns, nothing is cast */
    R.phT -= dt;
    if (R.ph === 'wait' && R.phT <= 0) { R.lit = F.patterns[R.pat++ % F.patterns.length]; R.ph = 'tell'; R.phT = F.tell; c.sound('charge'); c.sound('hiss'); }
    else if (R.ph === 'tell' && R.phT <= 0) { R.ph = 'burn'; R.phT = F.burn; R.burnHit = false; c.sound('heavy'); }
    else if (R.ph === 'burn') { const k = Math.floor((P.x - b.x0) / tw);
      if (!R.burnHit && !P.dead && R.lit.includes(k)) { R.burnHit = true; hurtBy(c, P.x, py, F.dmg, true, 'pillar'); }
      if (R.phT <= 0) { R.ph = 'wait'; R.phT = F.every - F.tell - F.burn;
        /* (claude/ft4c) BEAT 2: A BURNT TILE CRACKS AND FALLS - one the pattern just burned, never the one under you as it is picked; it glows dark first (fire2.drop s) */
        if (R.beat >= 2 && !R.drop && R.holes.length < REALM.fire2.maxHoles) { const under = Math.floor((P.x - b.x0) / tw), can = R.lit.filter(t => !R.holes.includes(t) && t !== under);
          if (can.length) { R.drop = { k: can[Math.floor((c.rnd || Math.random)() * can.length)], t: REALM.fire2.drop }; R.told.push([R.t, 'drop']); c.sound('crack'); } }
        R.lit = []; } }
    /* (claude/ft4c) THE BURNT FLOOR: a told tile drops, and its pit burns low (fire2.holeH over the floor) - fly over it */
    { const F2 = REALM.fire2, flTop = R.A.floor - 22;
      if (R.drop && (R.drop.t -= dt) <= 0) { R.holes.push(R.drop.k); const tx = b.x0 + (R.drop.k + 0.5) * tw; for (let j = 0; j < 6; j++) R.debris.push({ x: tx + (j - 2.5) * 8, y: flTop + 4, vy: 40 + j * 15, t: 0.9 }); R.drop = null; c.sound('heavy'); c.shake && c.shake(3); R.told.push([R.t, 'hole']); }
      for (const d of R.debris) { d.t -= dt; d.vy += 300 * dt; d.y += d.vy * dt; } R.debris = R.debris.filter(d => d.t > 0);
      R.holeCd = Math.max(0, R.holeCd - dt); const under = Math.floor((P.x - b.x0) / tw);
      if (!P.dead && R.holeCd <= 0 && R.holes.includes(under) && P.y > flTop - F2.holeH) { R.holeCd = F2.holeCd; hurtBy(c, P.x, py, F2.holeDmg, true, 'hole'); P.vy = -150; if (P.carpet) P.carpet.hitT = 0.2; }
      /* BEAT 3: THE REALM TILTS toward his perch - the carpet slides that way, slowly */
      if (R.beat >= 3) { R.tilt = R.perch; if (!P.dead) P.x = Math.max(b.x0 + 8, Math.min(b.x1 - 8, P.x + R.tilt * F2.tilt * dt)); }
      for (const br of R.braziers) if (!br.lit && (br.cd -= dt) <= 0) { br.lit = true; c.sound('charge'); } }
    const W = R.wall;
    if (W) { W.x += W.d * F.wallV * dt; const dy = py - W.y; W.y += Math.sign(dy) * Math.min(Math.abs(dy), (W.back ? F.trackBack : F.track) * dt);
      /* going out it follows your height slowly: get over or under it. COMING BACK it hunts you, and it BREAKS ON THE FIRST BODY IT MEETS -
         you, unless you dodge through it (then it runs on), or him, if he is between you and it: THE LURE */
      if (!W.hitP && !P.dead && Math.abs(P.x - W.x) < 8 && Math.abs(py - W.y) < F.wallH / 2) { W.hitP = true;
        if (c.dodging && c.dodging()) c.say('THROUGH IT', false);
        else { hurtBy(c, W.x, W.y, F.wallDmg, true, 'firewall'); if (W.back) { R.wall = null; c.say('IT BREAKS ON YOU', false); return; } } }
      if (W.back && Math.abs(e.x - W.x) < 12 && Math.abs((e.y - 20) - W.y) < F.wallH / 2 + 10) { R.wall = null; open(e, 'scorched', c, 'HIS OWN FIRE WALL: HE BURNS. HE IS OPEN'); return; }
      if (!W.back && (W.x <= b.x0 || W.x >= b.x1)) { W.back = true; W.d = -W.d; W.hitP = false; c.say('IT ROLLS BACK FOR YOU: DODGE THROUGH IT, OR PUT HIM IN ITS WAY', true); }
      else if (W.back && (W.x <= b.x0 - 4 || W.x >= b.x1 + 4)) R.wall = null; }
    if (!casting && e.mode === 'rhover') { /* (claude/ft4c) HE MOVES BETWEEN TWO PERCHES at the realm's ends, a brazier hung over each (was: he kept his side of you) - at your height,
         so his own wall coming back still meets him. He crosses every fire2.cross s when his wall is not out, said */
      const F2 = REALM.fire2; R.crossT -= dt;
      if (R.crossT <= 0 && !R.wall && !R.crossing) { R.perch = -R.perch; R.crossing = true; R.crossT = F2.cross; c.say('HE CROSSES TO HIS OTHER BRAZIER', false); R.told.push([R.t, 'cross']); }
      const [tx, ty] = keep(perchX(b, R.perch), P.y - 24), dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy), sp = R.crossing ? F2.crossV : 70; if (d > 2) { e.x += dx / d * Math.min(d, sp * dt); e.y += dy / d * Math.min(d, sp * dt); }
      if (Math.abs(tx - e.x) < 4) R.crossing = false;
      e.face = Math.sign(P.x - e.x) || e.face; R.castT -= dt;
      if (R.castT <= 0 && e.modeT <= 0 && !R.crossing) { R.castT = F.cast; if (!R.wall && R.nextWall) tell('wallTell', F.wallTell, 'HIS FIRE WALL: GET OVER OR UNDER IT', true); else tell('fireTell', REALM.bolt.tellFire, 'FIRE: GUARD OR FLY', false); R.nextWall = !R.nextWall; } }
    return; }
  // ---------------------------------------------------------------- ICE
  if (R.kind === 'ice') { const I = REALM.ice, I2 = REALM.ice2;
    /* (claude/ft4c) THE CEILING COMES DOWN (beats 2 and 3): frost creeps down the band it will take (ice2.creep s), then it lowers, icicles and all */
    if (R.creepT > 0) { R.creepT -= dt; if (R.creepT <= 0) { R.told.push([R.t, 'ceil']); c.sound('crack'); c.shake && c.shake(3); } }
    else if (R.ceil < R.ceilTo) R.ceil = Math.min(R.ceilTo, R.ceil + I2.ceilV * dt);
    /* BEAT 3: THE FLOES drift on the floor, wall to wall; his lances break on them */
    if (R.floes) { for (const f of R.floes) { f.x += f.d * I2.floeV * dt; if (f.x < b.x0 + I2.floeW / 2) { f.x = b.x0 + I2.floeW / 2; f.d = 1; } if (f.x > b.x1 - I2.floeW / 2) { f.x = b.x1 - I2.floeW / 2; f.d = -1; } }
      for (const q of e.shots) if (!q.reflected && !q.gone && floeAt(R, b, q.x, q.y)) { q.gone = true; q.hit = true; q.t = 0; } }
    R.dropT -= dt;
    if (R.dropT <= 0) { R.dropT = I.every; let best = null; for (const q of R.icicles) if (q.st === 'hang' && (!best || Math.abs(q.x - P.x) < Math.abs(best.x - P.x))) best = q;
      if (best && Math.abs(best.x - P.x) < REALM.w / I.n) { best.st = 'crack'; best.t = I.crack; c.sound('crack'); } }
    for (const q of R.icicles) {
      if (q.st === 'crack') { q.t -= dt; if (q.t <= 0) { q.st = 'fall'; q.y = b.y0 - 6 + I.len; } }
      else if (q.st === 'fall') { q.y += I.fallV * dt; if (q.struck && q.home) { const dx = e.x - q.x; q.x += Math.sign(dx) * Math.min(Math.abs(dx), I.homeV * dt); }   /* struck near him, it falls onto him */
        if (!q.struck && !q.hitP && !P.dead && Math.abs(P.x - q.x) < 10 && q.y > py - 12 && q.y - I.len < py + 10) { q.hitP = true; hurtBy(c, q.x, q.y, I.dmg, true, 'icicle'); }
        if (q.struck && Math.abs(e.x - q.x) < I.hitW && q.y > e.y - 50 && q.y - I.len < e.y) { q.st = 'gone'; q.t = I.regrow; c.sound('crack'); open(e, 'shattered', c, 'THE ICICLE BREAKS HIS WARD. HE IS OPEN'); return; }
        if (q.y > b.y1 + 8) { q.st = 'gone'; q.t = I.regrow; c.sound('crack'); } }
      else if (q.st === 'gone') { q.t -= dt; if (q.t <= 0) { q.st = 'hang'; q.struck = false; q.home = false; q.hitP = false; q.x = q.x0 ?? q.x; } } }
    if (!casting && e.mode === 'rhover') { R.goT -= dt; if (R.goT <= 0) { R.goT = 2.5 + (c.rnd || Math.random)() * 1.5; R.goX = R.icicles[Math.floor((c.rnd || Math.random)() * R.icicles.length)].x; if (R.floes) R.hide = R.floes.reduce((q, f) => Math.abs(f.x - e.x) < Math.abs(q.x - e.x) ? f : q); }
      /* (claude/ft4c) BEAT 3: HE HIDES BEHIND A FLOE, low, drifting with it - strike back from over it, or bring an icicle down on him */
      const hid = R.floes && R.hide, [tx, ty] = keep(hid ? R.hide.x : R.goX, hid ? b.y1 - 8 : b.y0 + (b.y1 - b.y0) * 0.66), dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy); const dv = (hid ? 1.6 : 1) * I.drift; if (d > 2) { e.x += dx / d * Math.min(d, dv * dt); e.y += dy / d * Math.min(d, dv * dt); }
      e.face = Math.sign(P.x - e.x) || e.face; R.castT -= dt;
      if (R.castT <= 0 && e.modeT <= 0) { R.castT = I.cast; tell('iceTell', REALM.bolt.tellIce, 'FROST: FLY ACROSS IT', false); } }
    return; }
  // ---------------------------------------------------------------- POISON
  if (R.kind === 'poison') { const Q = REALM.poison, A = R.A, cap = b.y0 + (A.floor - b.y0) * Q.cap;
    const Q2 = REALM.poison2;
    R.mireBase = R.drain ? Math.min(R.mire0, R.mireBase + Q.drain * dt) : Math.max(cap, R.mireBase - Q.rise * dt);
    /* (claude/ft4c) BEAT 3: THE MIRE SURGES - told (a wave line where it will reach, Q2.surgeTell s), up, held, down; then again */
    if (R.beat >= 3 && !R.drain) { const S = R.surge;
      if (!S) { R.sgT -= dt; if (R.sgT <= 0) { R.surge = { ph: 'tell', t: Q2.surgeTell }; c.say('THE MIRE SURGES: GET HIGH, OR ON A RAFT', true); c.sound('hiss'); R.told.push([R.t, 'surge']); } }
      else if ((S.t -= dt) <= 0) { if (S.ph === 'tell') { S.ph = 'up'; S.t = Q2.surgeUp; c.sound('heavy'); c.shake && c.shake(3); } else if (S.ph === 'up') { S.ph = 'hold'; S.t = Q2.surgeHold; } else if (S.ph === 'hold') { S.ph = 'down'; S.t = Q2.surgeDown; } else { R.surge = null; R.sgT = Q2.surgeEvery; } } }
    else if (R.surge && R.drain) R.surge = null;
    { const S = R.surge; R.surgeOff = !S ? 0 : S.ph === 'up' ? Q2.surgeH * (1 - Math.max(0, S.t) / Q2.surgeUp) : S.ph === 'hold' ? Q2.surgeH : S.ph === 'down' ? Q2.surgeH * Math.max(0, S.t) / Q2.surgeDown : 0; }
    R.mire = R.mireBase - R.surgeOff;
    R.exposedT = Math.max(0, R.exposedT - dt);
    /* (claude/ft4c) BEAT 2: THE VENTS WAKE - the next one BUBBLES (Q2.bubble s) and he hops to it; its beam feeds him from there */
    if (R.beat >= 2 && !R.drain) { if (R.next) { R.bubT -= dt; if (R.bubT <= 0 && !(R.exposedT > 0)) { R.vent = R.next; R.next = null; R.hopT = Q2.hop; R.told.push([R.t, 'hop']); c.sound('hiss'); } }
      else { R.hopT -= dt; if (R.hopT <= 0 && !(R.exposedT > 0) && !casting) { const o = R.vents.filter(v => v !== R.vent); R.next = o[Math.floor((c.rnd || Math.random)() * o.length)]; R.bubT = Q2.bubble; R.told.push([R.t, 'bubble']); c.say('THE NEXT VENT BUBBLES: HE GOES TO IT', false); c.sound('hiss'); } } }
    /* BEAT 3: BONE RAFTS float on the mire - over one you ride it, and the mire cannot reach you */
    if (R.rafts && !P.dead) for (const r of R.rafts) if (Math.abs(P.x - r.x) < Q2.raftW / 2 && P.y > R.mire - 6) { P.y = R.mire - 6; P.vy = Math.min(P.vy || 0, 0); }
    /* THE MIRE: a breath of warning, then a bite, poison and a throw back up - the way out of it is up */
    if (!P.dead && P.y > R.mire) { R.burnT += dt; if (R.burnT >= Q.warm && ((R.burnT - Q.warm) % Q.tick) <= dt) { hurtBy(c, P.x, P.y, Q.bite, true, R.surgeOff > 0 ? 'surge' : 'mire'); c.venom && c.venom(); P.vy = -Q.lift; if (P.carpet) P.carpet.hitT = 0.2; } }
    else R.burnT = 0;
    for (const cl of R.clouds) { cl.t -= dt; if (!P.dead && Math.hypot(P.x - cl.x, py - cl.y) < cl.r) c.venom && c.venom(); }
    R.clouds = R.clouds.filter(cl => cl.t > 0);
    if (!casting && e.mode === 'rhover') { const [tx, ty] = keep(R.vent.x - 60, R.mire - 90), dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy); if (d > 2) { e.x += dx / d * Math.min(d, 60 * dt); e.y += dy / d * Math.min(d, 60 * dt); }
      e.face = Math.sign(P.x - e.x) || e.face; R.sporeT -= dt; R.castT -= dt;
      if (R.sporeT <= 0 && e.modeT <= 0) { R.sporeT = Q.every; R.spores = [-70, 0, 70].map(o => ({ x: Math.max(b.x0 + 20, Math.min(b.x1 - 20, P.x + o)), y: Math.max(b.y0 + 20, Math.min(R.mire - 16, py)) }));
        R.exposedT = Q.sporeTell + Q.exposed; tell('sporeTell', Q.sporeTell, 'SPORES: THE BEAM IS CUT - STRIKE THE VENT', true); }
      else if (R.castT <= 0 && e.modeT <= 0) { R.castT = Q.cast; tell('fireTell', REALM.bolt.tellFire, 'FIRE: GUARD OR FLY', false); } }
    return; }
}
/* A BLOW IN A REALM, on the realm itself: an icicle struck from under it, or the vent struck from over it. hb is the swing's box; `seen`
   is the swing's own set (one blow, one thing). Returns what it struck, or null. */
export function strikeRealm(e, hb, seen, c) {
  const R = e && e.realm; if (!R || !hb || OPEN.has(e.mode)) return null; const b = c.box;
  const over = (x0, x1, y0, y1) => hb.l < x1 && hb.r > x0 && hb.t < y1 && hb.b > y0;
  if (R.kind === 'ice') for (const q of R.icicles) { if (q.st !== 'hang' || seen.has(q) || !over(q.x - 6, q.x + 6, b.y0 - 16, b.y0 + REALM.ice.len)) continue;
    seen.add(q); q.st = 'fall'; q.struck = true; q.home = Math.abs(q.x - e.x) < REALM.ice.home; q.y = b.y0 - 6 + REALM.ice.len; c.sound('crack'); c.say('IT FALLS', false); return 'icicle'; }
  /* (claude/ft4c) THE SECOND RETURN, POISON: a spore ring struck before it blooms flies back into him (HE CHOKES) */
  if (R.kind === 'poison' && e.mode === 'sporeTell') for (const s of R.spores) { const r = REALM.poison.sporeR * 0.8, nx = Math.max(hb.l, Math.min(hb.r, s.x)), ny = Math.max(hb.t, Math.min(hb.b, s.y));
    if (seen.has(s) || Math.hypot(nx - s.x, ny - s.y) > r) continue; seen.add(s); R.spores = R.spores.filter(q => q !== s);
    R.rets.push({ x: s.x, y: s.y, a: Math.atan2(e.y - 26 - s.y, e.x - s.x), t: 3 }); R.told.push([R.t, 'ret:poison']); c.sound('crack'); c.say('STRUCK BACK: HIS SPORES GO HOME', false); return 'spore'; }
  if (R.kind === 'poison') { const v = R.vent; if (seen.has(v) || !over(v.x - 14, v.x + 14, R.mire - 14, R.mire + 10)) return null; seen.add(v);
    if (R.exposedT > 0) { R.drain = true; R.clouds = []; R.spores = []; open(e, 'vented', c, 'THE VENT BURSTS UP HIS BEAM. HE IS OPEN'); return 'vent'; }
    c.say('THE MIRE FEEDS HIM: IT HOLDS', false); c.sound('clank'); return 'held'; }
  return null;
}

// ---------------------------------------------------------------- drawing
const BACK = { fire: ['#1a0806', '#2a0c08', '#3a140a', '#5a200c'], ice: ['#060e1a', '#0c1a2c', '#14283e', '#1e3a56'], poison: ['#060e08', '#0c1a0e', '#142816', '#1e3a20'] };
const WALL = { fire: ['#2a1410', '#4a2418', '#7a3a20'], ice: ['#1a2a3a', '#2e4a64', '#8ac8f0'], poison: ['#18241a', '#2a3a2a', '#5a7a4a'] };
/* THE ROOM: the whole screen is the realm (a realm is somewhere else, not a tint on his hall), walled at the realm's box */
export function drawRealm(g, e, A, cx, cy, time) {
  const R = e.realm, k = R.kind, VW = g.canvas.width, H = g.canvas.height, b = realmBox(e, A), bb = realmBox(null, A);
  const C = BACK[k]; for (let i = 0; i < 4; i++) { g.fillStyle = C[i]; g.fillRect(0, Math.round(H * i / 4), VW, Math.ceil(H / 4) + 1); }
  /* its weather: embers rising, snow falling, spores drifting */
  for (let i = 0; i < 40; i++) { const s = Math.sin(i * 91.7) * 43758.5, r = s - Math.floor(s), x = ((r * 997 + (k === 'ice' ? 0 : time * 11 * (i % 3 + 1))) % VW + VW) % VW;
    const y = k === 'fire' ? ((H - (time * (20 + r * 30) + r * 700) % (H + 20)) + H) % H : k === 'ice' ? ((time * (14 + r * 20) + r * 600) % (H + 10)) : ((H * r + Math.sin(time + i) * 20) % H);
    g.fillStyle = k === 'fire' ? (i % 3 ? '#ff9b49' : '#ffe9b0') : k === 'ice' ? (i % 3 ? '#9be2ff' : '#ffffff') : (i % 3 ? '#6a9a40' : '#a6e04a'); g.fillRect(Math.round(x), Math.round(y), i % 5 ? 1 : 2, i % 5 ? 1 : 2); }
  /* its walls, outside the realm's box on both sides, and its ceiling */
  const W = WALL[k], x0 = Math.round(bb.x0 - cx) - 12, x1 = Math.round(bb.x1 - cx) + 12, top = Math.round(b.y0 - cy) - 10;   /* (claude/ft4c: b - the ice realm's ceiling comes down) */
  g.fillStyle = W[0]; if (x0 > 0) g.fillRect(0, 0, x0, H); if (x1 < VW) g.fillRect(x1, 0, VW - x1, H); if (top > 0) g.fillRect(0, 0, VW, top);
  g.fillStyle = W[1]; g.fillRect(x0 - 4, 0, 4, H); g.fillRect(x1, 0, 4, H); g.fillRect(0, top - 4, VW, 4);
  g.fillStyle = W[2]; g.fillRect(x0 - 1, 0, 1, H); g.fillRect(x1, 0, 1, H); g.fillRect(0, top - 1, VW, 1);
  for (let y = ((-cy) % 18 + 18) % 18; y < H; y += 18) { g.fillStyle = W[1]; g.fillRect(x0 - 12, y, 8, 1); g.fillRect(x1 + 4, y, 8, 1); }
  /* (claude/ft4c) THE BORDER CRUMBLING: notches broken out of its walls as the beats run (R.bites), the realm's dark showing through */
  for (const q of R.bites || []) { const y = Math.round(q.y - cy), wx = q.side < 0 ? x0 - q.d : x1; g.fillStyle = C[2]; g.fillRect(wx, y, q.d, q.h); g.fillStyle = W[2]; g.fillRect(q.side < 0 ? wx - 1 : wx + q.d, y, 1, q.h); g.fillRect(wx, y - 1, q.d, 1); g.fillRect(wx, y + q.h, q.d, 1); }
  const flr = Math.round(A.floor - cy);
  if (k === 'fire') { const F = REALM.fire, tw = REALM.w / F.n;   /* THE FLOOR TILES: charred slabs, the lit ones glowing through their cracks */
    for (let t = 0; t < F.n; t++) { const tx = Math.round(bb.x0 - cx + t * tw), lit = R.lit && R.lit.includes(t), telling = lit && R.ph === 'tell', tl = R.tilt ? Math.round(R.tilt * (t - 3) * 3) : 0;
      /* (claude/ft4c) A FALLEN TILE: a pit, fire deep in it. A TILE ABOUT TO FALL: it glows DARK, shakes and cracks (fire2.drop s) */
      if ((R.holes || []).includes(t)) { g.fillStyle = '#0c0302'; g.fillRect(tx + 1, flr - 22 + tl, Math.round(tw) - 2, 30); g.fillStyle = Math.floor(time * 10 + t) % 2 ? '#c9463d' : '#ff6b2c'; g.fillRect(tx + 3, flr + 2 + tl, Math.round(tw) - 6, 6);
        g.fillStyle = '#ff9b49'; for (let j = 0; j < 5; j++) g.fillRect(tx + 6 + j * 11, flr + 1 + tl - Math.round(Math.abs(Math.sin(time * 9 + j)) * 5), 3, 2); continue; }
      const dropping = R.drop && R.drop.k === t, sh = dropping ? Math.round(Math.sin(time * 50)) : 0;
      if (dropping) { g.fillStyle = Math.floor(time * 10) % 2 ? '#3a0604' : '#5a0c06'; g.fillRect(tx + 1 + sh, flr - 22 + tl, Math.round(tw) - 2, 30); g.fillStyle = '#ff4a2a'; g.fillRect(tx + 8 + sh, flr - 20 + tl, 1, 12); g.fillRect(tx + 9 + sh, flr - 9 + tl, 14, 1); g.fillRect(tx + 30 + sh, flr - 21 + tl, 1, 18); g.fillRect(tx + 31 + sh, flr - 4 + tl, 12, 1); continue; }
      g.fillStyle = '#2a1008'; g.fillRect(tx + 1, flr - 22 + tl, Math.round(tw) - 2, 30);
      if (tl) { g.save(); g.translate(0, tl); }
      g.fillStyle = telling ? (Math.floor(time * 12) % 2 ? '#ff6b2c' : '#ffd36b') : '#4a1c0c'; g.fillRect(tx + 1, flr - 22, Math.round(tw) - 2, 2);
      if (telling) { g.fillStyle = 'rgba(255,155,73,0.35)'; g.fillRect(tx + 1, flr - 22, Math.round(tw) - 2, 28); g.fillStyle = '#ffe9b0'; for (let j = 0; j < 4; j++) g.fillRect(tx + 6 + j * 13, flr - 20 + (j % 2) * 6, 6, 1); }
      if (tl) g.restore(); } }
  if (k === 'ice') { g.fillStyle = '#8ac8f0'; g.fillRect(x0, flr - 22, x1 - x0, 2); g.fillStyle = '#2e4a64'; g.fillRect(x0, flr - 20, x1 - x0, 30); g.fillStyle = 'rgba(255,255,255,0.25)'; for (let x = x0; x < x1; x += 23) g.fillRect(x, flr - 18, 9, 1); }
}
/* THE REALM'S HAZARDS AND HIS WARD, over the world: pillars, the wall, the icicles, the mire, the vent and its beam, the spores */
export function drawRealmFx(g, e, cx, cy, time, P, T) {   /* P: the hero (the fire wall's road), T(s, x, y, col): main.js's words in the world */
  const R = e && e.realm; if (!R) return; R.cueDrawn = null; const A = R.A, b = realmBox(e, A), bb = realmBox(null, A), H = g.canvas.height, py0 = Math.round(b.y0 - cy);   /* (claude/ft4c: b - the ice ceiling comes down) */
  if (R.kind === 'fire') { const F = REALM.fire, tw = REALM.w / F.n;
    if (R.ph === 'tell') for (const t of R.lit) { const tx = Math.round(bb.x0 - cx + t * tw), w = Math.round(tw) - 2, flr = Math.round(A.floor - cy) - 22;   /* THE TELL: the columns it will stand up in shimmer first */
      g.fillStyle = 'rgba(255,155,73,' + (0.08 + 0.06 * Math.sin(time * 24)).toFixed(3) + ')'; g.fillRect(tx + 1, py0, w, flr - py0);
      g.fillStyle = 'rgba(255,211,107,0.5)'; for (let y = flr - ((time * 90) % 24); y > py0; y -= 24) g.fillRect(tx + 6 + ((y | 0) % 3) * 10, Math.round(y), 2, 3); }
    if (R.ph === 'burn') for (const t of R.lit) { const tx = Math.round(bb.x0 - cx + t * tw), w = Math.round(tw) - 2, flr = Math.round(A.floor - cy) - 22;
      g.fillStyle = 'rgba(201,70,61,0.85)'; g.fillRect(tx + 1, py0, w, flr - py0);
      g.fillStyle = 'rgba(255,155,73,0.9)'; g.fillRect(tx + 8, py0, w - 14, flr - py0);
      g.fillStyle = 'rgba(255,233,176,0.9)'; for (let y = py0; y < flr; y += 7) g.fillRect(tx + 14 + Math.round(Math.sin(time * 20 + y) * 4), y, w - 28, 3); }
    if (e.mode === 'wallTell' && e.alive) { const d = e.face || 1, vx = Math.round(e.x + d * 20 - cx), vy = Math.round((P ? P.y - 8 : e.y - 20) - cy), h = F.wallH / 2, k = 1 - Math.max(0, e.modeT) / F.wallTell, on = Math.floor(time * 14) % 2;   /* THE WALL'S TELL (fallingtower2): a column of VENTS glowing where it will rise, at your height, brighter as it comes */
      g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,155,73,' + (0.12 + 0.25 * k).toFixed(2) + ')'; g.fillRect(vx - 8, vy - h, 16, h * 2); g.globalCompositeOperation = 'source-over';
      for (let j = -h + 4; j < h; j += 8) { g.fillStyle = '#2a1008'; g.fillRect(vx - 5, vy + j, 10, 4); g.fillStyle = on ? '#ffd36b' : '#ff6b2c'; g.fillRect(vx - 4, vy + j + 1, Math.max(1, Math.round(8 * k)), 2); }
      if (T) T('FIRE WALL: OVER OR UNDER', vx, vy - h - 10, on ? '#ffe9b0' : '#ff9b49'); }
    const W = R.wall; if (W) { const x = Math.round(W.x - cx), y = Math.round(W.y - cy), h = F.wallH / 2;
      /* COMING BACK it is another thing: white-hot gold, not red, with arrows on it the way it runs (claude/archfix) */
      const CW = W.back ? ['#ffb020', '#ffe46b', '#ffffff'] : ['#c9463d', '#ff9b49', '#ffe9b0'];
      for (let i = -6; i <= 6; i++) { const tongue = Math.round(Math.sin(time * 19 + i * 1.3) * 4); g.fillStyle = Math.abs(i) > 3 ? CW[0] : Math.abs(i) > 1 ? CW[1] : CW[2]; g.fillRect(x + i, y - h - tongue, 1, h * 2 + tongue * 2); }
      g.globalCompositeOperation = 'lighter'; g.fillStyle = W.back ? 'rgba(255,228,107,0.24)' : 'rgba(255,155,73,0.16)'; g.fillRect(x - 14, y - h - 8, 28, h * 2 + 16); g.globalCompositeOperation = 'source-over';
      if (W.back && !OPEN.has(e.mode)) { const cue = realmCue(e, P || { x: -1e9, y: 0 }), d = W.d, run = ((time * 60) % 10) | 0;
        for (let k = 0; k < 3; k++) { const ax = x + d * (14 + k * 10 + run), ay = y; g.fillStyle = k === 1 ? '#ffe46b' : '#fff6c8'; for (let j = 0; j < 6; j++) { g.fillRect(ax - d * j, ay - j, 2, 1); g.fillRect(ax - d * j, ay + j, 2, 1); } }   /* the arrows: the way it runs */
        /* ITS ROAD: a line from the wall to the first body in it - gold to him (it will burn him), red to you (it breaks on you) */
        const tgt = cue.first === 'him' ? [e.x, e.y - 20] : cue.first === 'you' && P ? [P.x, P.y - 8] : null;
        if (tgt) { const tx = Math.round(tgt[0] - cx), ty = Math.round(tgt[1] - cy), hot = cue.first === 'him', blink = Math.floor(time * 8) % 2;
          g.fillStyle = hot ? (blink ? '#ffe46b' : '#ffffff') : '#ff6b6b'; const n = Math.max(1, Math.floor(Math.abs(tx - x) / 6));
          for (let s = 1; s < n; s++) { if ((s + ((time * 20) | 0)) % 2) continue; g.fillRect(Math.round(x + (tx - x) * s / n), Math.round(y + (ty - y) * s / n), 2, 1); }
          if (T) T(hot ? 'IT WILL BURN HIM' : 'IN ITS ROAD: DODGE THROUGH IT', x, y - h - 18, hot ? '#ffe46b' : '#ff9b9b');
          R.cueDrawn = hot ? 'fire:him' : 'fire:you'; }
        else R.cueDrawn = 'fire:back'; } } }
  if (R.kind === 'ice') { const I = REALM.ice;
    for (const q of R.icicles) { if (q.st === 'gone') continue; const x = Math.round(q.x - cx), shake = q.st === 'crack' ? Math.round(Math.sin(time * 60)) : 0, top = q.st === 'fall' ? Math.round(q.y - cy) - I.len : py0 - 6;
      if (q.st === 'crack') { g.fillStyle = 'rgba(155,226,255,' + (0.25 + 0.2 * Math.sin(time * 20)).toFixed(2) + ')'; g.fillRect(x - 1, top + I.len, 2, Math.round(A.floor - cy) - top - I.len - 20); }   /* THE TELL: a line of frost down to the floor it will hit */
      for (let j = 0; j < I.len; j++) { const w = Math.max(1, Math.round(5 * (1 - j / I.len))); g.fillStyle = j < 3 ? '#ffffff' : q.st === 'crack' ? '#d8f4ff' : '#9be2ff'; g.fillRect(x - (w >> 1) + shake, top + j, w, 1); } }
    /* THE ICICLE OVER HIS SHELL (claude/archfix): it pulses gold-white, a strike mark on it and a dotted line down to him */
    if (!OPEN.has(e.mode) && e.alive) { const cue = realmCue(e, P || { x: -1e9, y: 0 }), q = cue && cue.icicle;
      if (q) { const x = Math.round(q.x - cx), top = py0 - 6, p = 0.5 + 0.5 * Math.sin(time * 9);
        g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,236,160,' + (0.25 + 0.35 * p).toFixed(2) + ')'; g.fillRect(x - 6, top - 2, 12, I.len + 4); g.globalCompositeOperation = 'source-over';
        g.strokeStyle = Math.floor(time * 6) % 2 ? '#ffe46b' : '#ffffff'; g.lineWidth = 1; g.strokeRect(x - 7.5, top - 3.5, 15, I.len + 6);   /* the strike mark: a box round it */
        g.fillStyle = '#ffe46b'; for (let yy = top + I.len + 6; yy < Math.round(e.y - cy) - 50; yy += 5) g.fillRect(x, yy, 1, 2);
        if (T) T('STRIKE IT', x, top + I.len + 6, '#ffe46b'); R.cueDrawn = 'ice:icicle'; } }
    if (!OPEN.has(e.mode) && e.alive) { const x = Math.round(e.x - cx), y = Math.round(e.y - cy);   /* HIS SHELL */
      g.strokeStyle = 'rgba(200,240,255,0.8)'; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y - 22, 17, 27, 0, 0, Math.PI * 2); g.stroke();
      g.fillStyle = 'rgba(155,226,255,0.18)'; g.beginPath(); g.ellipse(x, y - 22, 16, 26, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#ffffff'; g.fillRect(x - 9 + Math.round(Math.sin(time * 2) * 3), y - 40, 2, 5); } }
  if (R.kind === 'poison') { const Q = REALM.poison, my = Math.round(R.mire - cy), mx0 = Math.max(0, Math.round(bb.x0 - cx)), mx1 = Math.min(g.canvas.width, Math.round(bb.x1 - cx)), MW = Math.max(0, mx1 - mx0);
    g.fillStyle = '#2a3a1a'; g.fillRect(mx0, my + 4, MW, H - my); g.fillStyle = '#4a6a2a'; g.fillRect(mx0, my, MW, 5);   /* the mire, between the realm's walls */
    g.fillStyle = '#8fd160'; for (let x = mx0; x < mx1; x += 3) { const s = Math.round(Math.sin((x + cx) * 0.11 + time * 2.4) * 1.5); g.fillRect(x, my + s, 3, 1); }
    for (let i = 0; i < 8; i++) { const bx = mx0 + ((i * 97 + time * 13) % Math.max(1, MW)), ph = (time * 1.3 + i * 0.37) % 1; g.fillStyle = 'rgba(166,224,74,' + (0.7 * (1 - ph)).toFixed(2) + ')'; g.fillRect(Math.round(bx), my - Math.round(ph * 6), 2, 2); }
    /* THE VENT (claude/archfix: "when he casts, strike the vent"): DARK while he feeds - a shut black mouth, a slow green seep - and LIT
       while the beam is cut: it blazes gold, pulses, rings out and says STRIKE THE VENT. That lit window is the whole of the opening */
    const vx = Math.round(R.vent.x - cx), cut = R.exposedT > 0 && !OPEN.has(e.mode);
    g.fillStyle = cut ? '#3a2a08' : '#080c06'; g.fillRect(vx - 14, my - 4, 28, 8); g.fillStyle = cut ? '#ffd36b' : '#26361a'; g.fillRect(vx - 16, my - 5, 32, 2);
    if (cut) { const p = 0.5 + 0.5 * Math.sin(time * 14);
      for (let i = 0; i < 8; i++) { const ph = (time * 2.2 + i / 8) % 1, bxx = vx + Math.round(Math.sin(i * 2.3 + time) * 7); g.fillStyle = i % 2 ? '#ffd36b' : '#fff0c0'; g.fillRect(bxx, my - 4 - Math.round(ph * 30), 2, 2); }
      g.fillStyle = Math.floor(time * 10) % 2 ? '#ffffff' : '#ffd36b'; g.fillRect(vx - 10, my - 3, 20, 2);
      g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,211,107,' + (0.18 + 0.22 * p).toFixed(2) + ')'; g.fillRect(vx - 20, my - 34, 40, 38); g.globalCompositeOperation = 'source-over';
      g.strokeStyle = '#ffe46b'; g.lineWidth = 1; g.beginPath(); g.ellipse(vx, my - 1, 18 + p * 6, 5 + p * 2, 0, 0, Math.PI * 2); g.stroke();
      const w = Math.min(1, R.exposedT / REALM.poison.exposed); g.fillStyle = 'rgba(10,8,20,0.8)'; g.fillRect(vx - 16, my + 8, 32, 3); g.fillStyle = '#ffd36b'; g.fillRect(vx - 16, my + 8, Math.round(32 * w), 3);   /* how long it stays lit */
      if (T) T('STRIKE THE VENT', vx, my - 48, '#ffe46b'); R.cueDrawn = 'poison:lit'; }
    else { g.fillStyle = '#3a5a20'; for (let i = 0; i < 2; i++) { const ph = (time * 0.6 + i / 2) % 1; g.fillRect(vx - 2 + i * 4, my - 3 - Math.round(ph * 6), 1, 1); } R.cueDrawn = 'poison:dark'; }
    if (R.exposedT <= 0 && !OPEN.has(e.mode) && e.alive) { const ex = Math.round(e.x - cx), ey = Math.round(e.y - cy) - 20;   /* THE BEAM that feeds him */
      g.strokeStyle = 'rgba(143,209,96,' + (0.5 + 0.3 * Math.sin(time * 9)).toFixed(2) + ')'; g.lineWidth = 3; g.beginPath(); g.moveTo(vx, my - 2); g.lineTo(ex, ey); g.stroke(); g.lineWidth = 1;
      g.strokeStyle = 'rgba(143,209,96,0.6)'; g.beginPath(); g.ellipse(ex, ey, 16, 26, 0, 0, Math.PI * 2); g.stroke(); }
    for (const s of R.spores) { const r = Q.sporeR * (0.6 + 0.4 * ((time * 4) % 1)); g.strokeStyle = Math.floor(time * 10) % 2 ? '#ff6b6b' : '#a6e04a'; g.lineWidth = 1; g.beginPath(); g.arc(Math.round(s.x - cx), Math.round(s.y - cy), r, 0, Math.PI * 2); g.stroke(); }   /* THE TELL: rings where they will bloom */
    for (const cl of R.clouds) { const a = Math.min(1, cl.t) * 0.5; g.fillStyle = 'rgba(110,170,60,' + a.toFixed(2) + ')'; g.beginPath(); g.arc(Math.round(cl.x - cx), Math.round(cl.y - cy), cl.r + Math.sin(time * 3 + cl.x) * 2, 0, Math.PI * 2); g.fill(); } }
  drawLiving(g, e, R, b, bb, cx, cy, time, T, P);   /* (claude/ft4c) the realm coming apart, its braziers, floes, vents and rafts - over him (he hides behind a floe), under his ward and OPEN words */
  /* WARDED, THE REST OF THE TIME (claude/archfix): a ring of his ward's runes turning round him in the realm's colour, and the word dim at
     his feet - so the moment it is gone (OPEN) reads as a change */
  if (!OPEN.has(e.mode) && e.alive) { const x = Math.round(e.x - cx), y = Math.round(e.y - cy) - 22, C = REALM.col[R.kind];
    for (let i = 0; i < 10; i++) { const a = time * 1.6 + i * Math.PI / 5; g.fillStyle = i % 2 ? C[0] : C[1]; g.fillRect(x + Math.round(Math.cos(a) * 21) - 1, y + Math.round(Math.sin(a) * 31) - 1, 2, 2); }
    if (T) T('WARDED', x, y + 36, C[2], 6); }
  /* A BLOW HIS WARD TURNED (realmWardHit): his ward flares round him in the realm's colour for a breath - the clang has a shape */
  if (R.wardT > 0 && !OPEN.has(e.mode) && e.alive) { const x = Math.round(e.x - cx), y = Math.round(e.y - cy) - 22, k = R.wardT / 0.35, C = REALM.col[R.kind];
    g.globalAlpha = Math.min(1, 0.4 + k); g.strokeStyle = C[1]; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y, 19 + (1 - k) * 8, 29 + (1 - k) * 8, 0, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = C[0]; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y, 22 + (1 - k) * 12, 32 + (1 - k) * 12, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; }
  if (R.wardSayT > 0 && !OPEN.has(e.mode) && e.alive && T) T('WARDED', Math.round(e.x - cx), Math.round(e.y - cy) - 62 - Math.round((0.9 - R.wardSayT) * 20), Math.floor(time * 12) % 2 ? '#ffffff' : REALM.col[R.kind][0], 8);   /* the clang, in words */
  /* OPEN (claude/archfix: "make his OPEN state unmistakable"): he BURNS, his shell SHATTERS off him, or he CHOKES on his own vent - over
     him a bold OPEN x2 and the bar of the window running out, round him the flashing gold frame */
  if (OPEN.has(e.mode) && e.alive) { const x = Math.round(e.x - cx), y = Math.round(e.y - cy), m = e.mode, k = Math.max(0, Math.min(1, e.modeT / REALM.openT));
    for (let i = 0; i < 14; i++) { const s = Math.sin(i * 12.9898) * 43758.5, r = s - Math.floor(s), ph = (time * (m === 'shattered' ? 0.9 : 1.6) + r) % 1;
      if (m === 'scorched') { g.fillStyle = i % 3 ? '#ff9b49' : i % 2 ? '#ffe9b0' : '#c9463d'; g.fillRect(x - 12 + Math.round(r * 24), y - 4 - Math.round(ph * 50), 2, 3); }   /* flames up off him */
      else if (m === 'shattered') { const a = r * Math.PI * 2; g.fillStyle = i % 2 ? '#ffffff' : '#9be2ff'; g.fillRect(x + Math.round(Math.cos(a) * (10 + ph * 30)), y - 22 + Math.round(Math.sin(a) * (14 + ph * 30) + ph * ph * 20), 2, 2); }   /* the shell in pieces */
      else { g.fillStyle = 'rgba(143,209,96,' + (0.7 * (1 - ph)).toFixed(2) + ')'; g.beginPath(); g.arc(x - 10 + Math.round(r * 20), y - 30 - Math.round(ph * 26), 2 + ph * 4, 0, Math.PI * 2); g.fill(); } }   /* he chokes: green gas out of him */
    g.strokeStyle = Math.floor(time * 8) % 2 ? '#ffd36b' : '#ffffff'; g.lineWidth = 2; g.strokeRect(x - 15, y - 47, 30, 50); g.lineWidth = 1;
    g.fillStyle = 'rgba(10,8,20,0.85)'; g.fillRect(x - 20, y - 57, 40, 4); g.fillStyle = '#ffd36b'; g.fillRect(x - 20, y - 57, Math.round(40 * k), 4);   /* the window, running out */
    if (T) { T('OPEN x2', x, y - 72, Math.floor(time * 8) % 2 ? '#ffffff' : '#ffd36b', 8); T(REALM.openWord[m] || '', x, y - 84, REALM.col[R.kind][0]); }
    R.cueDrawn = 'open:' + m; }
  void b;
}
/* (claude/ft4c) LIVING REALMS, DRAWN (greybox - the art lane dresses them): the border's chunks; FIRE the burning pits, the falling slab, the two braziers (the one
   over him ringed gold while lit) and a brazier's pour; ICE the frost creeping down the band the ceiling will take, the floes, the cracks in his shell; POISON the
   other vents (the next one bubbling), the bone rafts, the surge's wave line, a spore ring struck back flying home */
function drawLiving(g, e, R, b, bb, cx, cy, time, T, P) {
  const k = R.kind, Wc = WALL[k], A = R.A, blink = Math.floor(time * 8) % 2;
  for (const q of R.chunks) { g.fillStyle = q.s > 3 ? Wc[1] : Wc[2]; g.fillRect(Math.round(q.x - cx), Math.round(q.y - cy), q.s, q.s); }
  if (k === 'fire') { const F2 = REALM.fire2, tw = REALM.w / REALM.fire.n, flTop = Math.round(A.floor - 22 - cy);
    for (const t of R.holes) { const x0 = Math.round(bb.x0 - cx + t * tw) + 3, w = Math.round(tw) - 6;   /* the pit's fire, low: fly over it */
      g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,107,44,0.22)'; g.fillRect(x0, flTop - F2.holeH, w, F2.holeH); g.globalCompositeOperation = 'source-over';
      for (let j = 0; j < 7; j++) { const h = Math.round(F2.holeH * (0.45 + 0.55 * Math.abs(Math.sin(time * (5 + j) + j * 1.7)))); g.fillStyle = j % 3 ? '#ff9b49' : '#ffe9b0'; g.fillRect(x0 + 2 + Math.round(j * (w - 6) / 6), flTop - h, 2, h); } }
    for (const d of R.debris) { g.fillStyle = '#4a1c0c'; g.fillRect(Math.round(d.x - cx) - 3, Math.round(d.y - cy), 6, 4); }
    const over = brazierOver(e);
    for (const br of R.braziers) { const x = Math.round(perchX(b, br.side) - cx), ctop = Math.round(b.y0 - cy), y = Math.round(b.y0 + F2.brazierY - cy);
      g.fillStyle = '#3a2a24'; for (let yy = ctop; yy < y - 3; yy += 4) g.fillRect(x - 1 + ((yy >> 2) % 2), yy, 2, 3);   /* its chain */
      g.fillStyle = '#2a1a14'; g.fillRect(x - 9, y - 2, 18, 6); g.fillStyle = '#6a4a3a'; g.fillRect(x - 10, y - 3, 20, 2); g.fillRect(x - 3, y + 4, 6, 2);
      if (br.lit) { g.fillStyle = '#ff6b2c'; g.fillRect(x - 7, y - 4, 14, 2); for (let j = 0; j < 5; j++) { const h = 3 + Math.round(Math.abs(Math.sin(time * 11 + j * 1.9)) * 6); g.fillStyle = j % 2 ? '#ffd36b' : '#ff9b49'; g.fillRect(x - 6 + j * 3, y - 4 - h, 2, h); } }
      else { g.fillStyle = '#555'; for (let j = 0; j < 3; j++) { const ph = (time * 0.8 + j / 3) % 1; g.fillRect(x - 2 + j * 2, y - 6 - Math.round(ph * 14), 1, 1); } }
      if (br === over && br.lit && !OPEN.has(e.mode) && e.alive) { g.strokeStyle = blink ? '#ffe46b' : '#ffffff'; g.lineWidth = 1; g.strokeRect(x - 13.5, y - 15.5, 27, 23);   /* THE ONE OVER HIM: strike his fire into it */
        if (e.shots && e.shots.some(q => q.realmRet && !q.reflected)) { g.fillStyle = '#ffe46b'; for (let yy = y + 8; yy < Math.round(e.y - cy) - 50; yy += 5) g.fillRect(x, yy, 1, 2); if (T) T('INTO THE BRAZIER', x, y - 24, '#ffe46b'); }
        R.brazDrawn = br.side; } }
    if (R.pour) { const x = Math.round(R.pour.x - cx), y0 = Math.round(b.y0 + F2.brazierY - cy), y1 = Math.round(A.floor - 22 - cy);   /* the brazier spills: a fall of fire */
      g.fillStyle = 'rgba(255,155,73,0.85)'; g.fillRect(x - 6, y0, 12, y1 - y0); g.fillStyle = '#ffe9b0'; for (let y = y0; y < y1; y += 6) g.fillRect(x - 2 + Math.round(Math.sin(time * 30 + y) * 2), y, 4, 3); } }
  if (k === 'ice') { const I2 = REALM.ice2, top = Math.round(b.y0 - cy);
    if (R.creepT > 0) { const p = 1 - R.creepT / I2.creep, h = Math.round((R.ceilTo - R.ceil) * p), x0 = Math.round(bb.x0 - cx), w = Math.round(REALM.w);   /* THE TELL: frost creeping down the band it will take */
      g.fillStyle = 'rgba(216,244,255,' + (0.18 + 0.12 * blink).toFixed(2) + ')'; g.fillRect(x0, top, w, Math.round(R.ceilTo - R.ceil));
      g.fillStyle = 'rgba(255,255,255,0.55)'; g.fillRect(x0, top, w, h); g.fillStyle = '#ffffff'; for (let x = x0; x < x0 + w; x += 7) g.fillRect(x, top + h, 2, 2 + ((x >> 3) % 3)); }
    for (const f of R.floes || []) { const x = Math.round(f.x - cx - I2.floeW / 2), y = Math.round(b.y1 - I2.floeH - cy);
      g.fillStyle = 'rgba(190,232,255,0.92)'; g.fillRect(x, y, I2.floeW, I2.floeH); g.fillStyle = '#ffffff'; g.fillRect(x, y, I2.floeW, 2); g.fillRect(x + 4, y + 6, 2, 10); g.fillStyle = '#8ac8f0'; g.fillRect(x + I2.floeW - 3, y + 2, 3, I2.floeH - 2); g.fillRect(x, y + I2.floeH - 3, I2.floeW, 3); }
    if (R.cracks > 0 && !OPEN.has(e.mode) && e.alive) { const x = Math.round(e.x - cx), y = Math.round(e.y - cy) - 22;   /* his shell, cracked: one more */
      g.fillStyle = '#ffffff'; for (let j = 0; j < 9; j++) g.fillRect(x - 6 + j, y - 12 + Math.round(Math.abs(Math.sin(j * 1.3)) * 6) + j * 2, 1, 2); for (let j = 0; j < 6; j++) g.fillRect(x + 4 + j, y + 4 - j * 2, 1, 2);
      if (T) T('CRACKED: ONE MORE', x, y + 46, blink ? '#ffffff' : '#9be2ff'); } }
  if (k === 'poison') { const Q2 = REALM.poison2, my = Math.round(R.mire - cy);
    for (const v of R.vents) { if (v === R.vent) continue; const x = Math.round(v.x - cx), nx = v === R.next;   /* the other vents: shut, or BUBBLING - the next one */
      g.fillStyle = nx ? '#1a2a0c' : '#080c06'; g.fillRect(x - 10, my - 3, 20, 6); g.fillStyle = nx ? '#8fd160' : '#26361a'; g.fillRect(x - 12, my - 4, 24, 2);
      if (nx) { for (let j = 0; j < 6; j++) { const ph = (time * 2.6 + j / 6) % 1; g.fillStyle = j % 2 ? '#a6e04a' : '#d8ffb0'; g.fillRect(x - 6 + j * 2, my - 4 - Math.round(ph * 22), 2 + (j % 2), 2 + (j % 2)); }
        g.strokeStyle = blink ? '#a6e04a' : '#d8ffb0'; g.beginPath(); g.ellipse(x, my - 1, 14 + (time * 20 % 6), 4, 0, 0, Math.PI * 2); g.stroke(); if (T) T('NEXT', x, my - 32, '#a6e04a'); } }
    for (const r of R.rafts || []) { const x = Math.round(r.x - cx - Q2.raftW / 2), y = my - 6 + Math.round(Math.sin(time * 2 + r.x) * 1);   /* a raft of bone */
      g.fillStyle = '#c8bea0'; g.fillRect(x, y + 2, Q2.raftW, 3); g.fillStyle = '#e8e0c8'; for (let j = 2; j < Q2.raftW; j += 6) g.fillRect(x + j, y, 2, 6); g.fillRect(x + Q2.raftW - 6, y - 3, 6, 5); g.fillStyle = '#2a2a1a'; g.fillRect(x + Q2.raftW - 5, y - 2, 1, 1); g.fillRect(x + Q2.raftW - 3, y - 2, 1, 1); }
    if (R.surge && R.surge.ph === 'tell') { const y = Math.round(R.mireBase - Q2.surgeH - cy), x0 = Math.max(0, Math.round(bb.x0 - cx)), x1 = Math.min(g.canvas.width, Math.round(bb.x1 - cx));   /* THE TELL: where the surge will reach */
      g.fillStyle = blink ? '#ff6b6b' : '#a6e04a'; for (let x = x0; x < x1; x += 8) g.fillRect(x, y + Math.round(Math.sin(x * 0.2 + time * 6) * 1.5), 5, 1);
      for (let x = x0 + 30; x < x1; x += 70) for (let j = 0; j < 4; j++) { g.fillRect(x - j, y + 8 + j, 1, 1); g.fillRect(x + j, y + 8 + j, 1, 1); }
      if (T) T('THE MIRE WILL REACH HERE', Math.round((x0 + x1) / 2), y - 12, blink ? '#ff9b9b' : '#d8ffb0'); }
    if (R.surgeOff > 0) { const x0 = Math.max(0, Math.round(bb.x0 - cx)), x1 = Math.min(g.canvas.width, Math.round(bb.x1 - cx)); g.fillStyle = '#d8ffb0'; for (let x = x0; x < x1; x += 4) g.fillRect(x, my - 1 + Math.round(Math.sin(x * 0.3 + time * 9) * 1.5), 2, 1); }
    for (const s of R.rets) { const x = Math.round(s.x - cx), y = Math.round(s.y - cy); g.fillStyle = 'rgba(166,224,74,0.8)'; g.beginPath(); g.arc(x, y, 6, 0, Math.PI * 2); g.fill(); g.fillStyle = '#ffe46b'; g.fillRect(x - 1, y - 1, 3, 3); } }
  void P;
}
/* HIS TEAR: the great ring he opens by him in his hall, full of the realm it goes to, flaring before it takes you */
export function drawTear(g, e, cx, cy, time) {
  if (!e || e.mode !== 'realmTell' || !e.alive) return; const kind = REALM.kinds[e.realmN || 0], C = REALM.col[kind], k = Math.min(1, (REALM.tear - Math.max(0, e.modeT)) / 0.4);
  const x = Math.round(e.x - cx + (e.face || 1) * -34), y = Math.round(e.y - cy - 24), rw = Math.round(22 * k), rh = Math.round(32 * k); if (rw < 2) return;
  g.fillStyle = BACK[kind][1]; g.beginPath(); g.ellipse(x, y, rw, rh, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = C[0]; for (let i = 0; i < 6; i++) g.fillRect(x + Math.round(Math.sin(time * 3 + i) * rw * 0.5), y + Math.round(Math.cos(time * 2 + i * 1.7) * rh * 0.5), 2, 2);
  for (let i = 0; i < 36; i++) { const a = (i / 36) * Math.PI * 2 + time * 4; g.fillStyle = Math.floor(time * 14 + i) % 3 ? C[0] : C[1]; g.fillRect(x + Math.round(Math.cos(a) * (rw + 1)), y + Math.round(Math.sin(a) * (rh + 1)), 2, 2); }
}
