// src/order-knights.js - THE ROAD WARDENS'S FOUR BODIES (claude/order, Daniel 2026-10-11, scratch/brief-elite-order.md). WHO they are, region by
// region and level by level, is src/order-chapters.js; this file is what they DO and (placeholder, for the Sonnet art lane) what they LOOK like.
//
// ELITE KINDS, NOT A PARALLEL SYSTEM. A knight is an ELITE (main.js ELITE row, eliteMake, the leash, the gate he holds, the purse) and his guard,
// his poise, his opening, his riposte to a mash, his ROUSED and his affix are src/elite-kit.js's, exactly as every elite's. What is his:
//   - his BODY's two moves (BODY_RUN below), told like every elite move: a mark ('!' yellow: a shield turns it / '!!' red: nothing does) over his
//     head, a WORD over his plate in his chapter's colour, and a sound - one windup at a time (eliteMay / eliteTake: lastTellT)
//   - his anti-plunge POSE from src/foe-react.js REACT_AIR (scratch/brief-combat2.md section 4's update): the Duelist GUARDS HIGH (a), the
//     Lancer thrusts UP (b), the Brute CATCHES and throws (d); the Battle Mage wards spells instead
//   - his CHAPTER's signature moves (SIG_RUN) and his LEVEL's twist (TWIST_RUN): the moves the level's rule gives him
//   - two guard rules src/elite-kit.js asks this file about (orderGuard): THE ORE CHAPTER's plates (a light blade only chips them, x0.4, from any side; a heavy,
//     a riposte or a throw cracks one) and THE BATTLE MAGE's ward (a shot turned off his front; a dash goes through)
// main.js keeps only commented hooks (search 'claude/order'). The windups' marks are src/marks.js BY_HAND rows (ORDER_MARKS below): a module
// foe's windups are if-chains the tells audit cannot follow, and every one of his is written down there.
import { BODY, CHAPTERS, ORDER_AT, TWISTS, SIG, TYPES, isKnightT, skinOf, ORDER, ORDER_MARKS } from './order-chapters.js';
import { kindOf } from './exit-gates.js';
import * as OA from './redraw/order_art.js';
import { guardsHighTick, guardsHigh, antiAirTick, catchThrowTick } from './foe-react.js';

export const is = e => !!e && isKnightT(e.t);
const SOFT = '#ffd36b', HARD = '#ff6b6b';

/* THE NUMBERS. Times in s, reach in px past his half-width, dmg before main.js eliteDmg (x1.25, and a quarter more an act). tell is the windup
   as built (EK.tell shortens it when ROUSED or SWIFT, never under 0.35 s); rec is the told recovery after the blow - his opening in that move. */
export const K = {
  every: 2.6,                                                                                   // the gap after a move (EK.every: sooner once ROUSED)
  cut: { tell: 0.62, t: 0.18, reach: 32, dmg: 12, rec: 0.55, glint: 0.16, near: 36 },             // THE DUELIST's yellow cut: it glints on the parry beat
  lunge: { tell: 0.7, t: 0.26, v: 250, reach: 22, dmg: 14, rec: 0.6, min: 56, max: 140 },
  slam: { tell: 0.85, t: 0.2, reach: 40, dmg: 20, stuck: 1.25, near: 44 },                       // THE BRUTE's red slam: the maul stays in the floor
  sweep: { tell: 0.65, t: 0.24, reach: 52, dmg: 13, rec: 0.55, near: 60 },
  thrust: { tell: 0.6, t: 0.18, reach: 60, dmg: 13, rec: 0.5, near: 66 },                        // THE LANCER
  charge: { tell: 0.75, v: 240, run: 1.0, dmg: 15, pin: 22, pinGap: 40, dazed: 1.4, rebound: 1.0, teeter: 1.4, end: 0.5, min: 80, max: 230 },
  cast: { tell: 0.85, v: 150, dmg: 11, life: 2.4, rec: 0.45, broken: 1.3, min: 48, max: 220 },   // THE BATTLE MAGE
  blade: { tell: 0.5, t: 0.16, reach: 28, dmg: 10, rec: 0.5, near: 34 },
  vine: { tell: 0.65, t: 0.22, reach: 104, dmg: 7, pull: 250, rec: 0.5, min: 44, max: 118, cd: 5 },   // THE THORN CHAPTER
  snare: { tell: 0.8, half: 20, dmg: 6, hold: 0.8, rec: 0.3, max: 170, cd: 7 },
  mud: { tell: 0.8, half: 26, life: 4.5, rec: 0.35, max: 170, cd: 8 },                            // THE BOG CHAPTER
  snuff: { tell: 0.6, r: 220, regrow: 4.0, cd: 10 },                                              // THE ORE CHAPTER
  plate: { pips: 2, through: 0.5, chip: 0.4 },
};
/* WHICH MOVES A BODY HAS, in the order he reaches for them (a twist first, then his chapter's, then his own; never the same move twice running
   when another is ready). */
export const BODY_MOVES = { oathblade: ['cut', 'lunge'], oathmaul: ['slam', 'sweep'], oathlance: ['thrust', 'charge'], oathmage: ['blade', 'cast'] };
const TWIST_MOVE = { timber: 'timber', channel: 'shove', rust: 'rust' };
/* THE MARK OVER EVERY WINDUP: src/order-chapters.js ORDER_MARKS (src/marks.js reads it there for its BY_HAND rows) */
/* THE WORD over his plate as each windup starts (the chapter's colour), and the sound */
const WORD = { cut: 'CUT', lunge: 'LUNGE', slam: 'SLAM', sweep: 'SWEEP', thrust: 'THRUST', charge: 'CHARGE', blade: 'BLADE', vine: 'VINE PULL', snare: 'SNARE',
  mud: 'MUD', snuff: 'SNUFF', timber: 'TIMBER', shove: 'SHOVE', rust: 'RUST' };
const SOUND = { cut: 'charge', lunge: 'charge', slam: 'charge', sweep: 'charge', thrust: 'charge', charge: 'shieldSlam', cast: 'charge', blade: 'charge', vine: 'bow',
  snare: 'clatter', mud: 'squelch', snuff: 'hiss', timber: 'crack', shove: 'shieldSlam', rust: 'clank' };

/* ============================ THE GUARD LAYER (src/elite-kit.js take asks this first) ============================
   null: no opinion (the elite guard by angle decides). { turn: word }: the blow is TURNED (a clank, the word). { dmg, word }: it goes in at dmg. */
export function orderGuard(e, dmg, k, fromAbove, dx, blow) {
  if (!is(e) || !(dmg > 0) || e.broken > 0) return null;
  const has = v => blow === v || (Array.isArray(blow) && blow.includes(v));
  if (e.okPlate > 0) {   /* THE ORE CHAPTER: ORE-PLATED all round. The key is weight - a heavy, a riposte, a thrown thing - and it cracks a plate */
    if (k === 'heavy' || has('riposte') || has('throw')) { e.okPlate--; e.okPlateCd = K.snuff.regrow; return { dmg: Math.max(1, Math.round(dmg * K.plate.through)), word: e.okPlate > 0 ? 'CRACKED' : 'ORE BROKEN', col: '#e0a050' }; }
    if (k === 'light' || k === 'rise' || k === 'dash' || k === 'sweep' || k === 'shot' || fromAbove) return { dmg: Math.max(1, Math.round(dmg * K.plate.chip)), word: 'ORE', col: '#e0a050', clank: true };   /* a light blade only CHIPS the ore (design-standard B15's floor: never a wall), with a clank and the word; his front still GUARDS by angle as every elite's */
  }
  if (e.t === 'oathmage' && !(e.ekStunT > 0) && (k === 'shot' || has('shot')) && Math.sign(dx) === (e.ekSide || e.face || 1)) return { turn: 'WARDED', col: '#c8a0ff' };   /* HIS WARD: shots off his front (a dash goes through it - the key he teaches) */
  return null;
}
export const unmovedBody = e => is(e) && !!BODY[e.t].unmoved;

/* ============================ THE ART (claude/orderart) ============================
   Painted in src/redraw/order_art.js: one painter, four bodies, the chapter palette (src/order-chapters.js CHAPTERS.pal) and what the chapter wears (PROPS there),
   so a later chapter is a palette row plus a props entry. 12 frames a body, facing right, feet on the anchor: 0-1 walk, 2 the windup, 3 the blow, 4 the recovery
   (his opening), 5 and 6 his body's own (the duelist: the lunge drawn back, his GUARD HIGH; the brute: the sweep drawn back, the CATCH; the lancer: the lance
   couched, the UPWARD thrust; the mage: the blade drawn back, the blade), 7 TEETER, 8 INTERRUPTED, 9 DEATH, 10 CORPSE, 11 HURT (last: main.js HAS_HURT reads it).
   The hit box is the body's, as it was; the sprite is drawn at x1 (main.js bigF/bodyK) now it is painted at the size he is struck at. */
export const bakeSet = (t, chapter) => { const C = CHAPTERS[chapter] || CHAPTERS.forest; return OA.bakeKnight(t, C, C.id, BODY[t]); };
export const bakeCardFor = t => { const C = CHAPTERS.forest; return OA.bakeCard(t, C, C.id, BODY[t]); };   /* the bestiary portrait, in the road's own grey-green */
export const bakeBase = () => Object.fromEntries(TYPES.map(t => [t, bakeSet(t, 'forest')]));
const MODE_FRAME = {
  oathblade: { cutTell: 2, cut: 3, cutRec: 4, lungeTell: 5, lunge: 3, lungeRec: 4, shoveTell: 2, shove: 3, shoveRec: 4 },
  oathmaul: { slamTell: 2, slam: 3, slamStuck: 4, sweepTell: 5, sweep: 3, sweepRec: 4, woodStuck: 4, timberTell: 2, timber: 3 },
  oathlance: { thrustTell: 2, thrust: 3, thrustRec: 4, chargeTell: 5, charge: 5, chargeEnd: 4, dazed: 8, teeter: 7, rustTell: 6, rust: 4 },
  oathmage: { castTell: 2, cast: 3, castRec: 4, castBroken: 8, bladeTell: 5, blade: 6, bladeRec: 4 },
};
export function frameOf(e) {
  const m = String(e.mode || ''), own = MODE_FRAME[e.t] || {};
  if (e.t === 'oathblade' && (e.raHigh || 0) >= 0.5) return 6;
  if (e.t === 'oathlance' && (e.aa === 'tell' || e.aa === 'thrust')) return 6;
  if (e.t === 'oathmaul' && (e.ct === 'tell' || e.ct === 'grab')) return 6;
  if (own[m] !== undefined) return own[m];
  if (/Tell$/.test(m)) return 2;
  if (/Rec$|Stuck$/.test(m)) return 4;
  if (WORD[m]) return 3;
  return Math.abs(e.vx || 0) > 6 ? Math.floor((e.anim || 0) * 6) % 2 : 0;
}

/* ============================ THE RUNTIME ============================ */
export function installOrder(api) {
  /* api: { P(), heroes(), time(), TS, levelId(), solid(tx, ty), standable(tx, ty), body(e, dt), moveP(dx, dy), may(e, reach), take(e), done(e),
     drop(e, every), lost(e), tell(e, t), every(e, t), footed(e), edge(e), front(e, reach, dy), told(), sinceTell(), hit(e, dmg, o) -> 'hit' |
     'blocked' | undefined, hurtFoe(e, dmg, word), mark(e, word, col), say(e, word, col, t), sfx(name), ring(x, y, r, col, t), shake(n),
     dust(x, y, n), sparks(x, y, dir, n), part(p), hitstop(t), props(), enemies(), ra (main.js RA_API), tellBar(x0, x1, fy, h, k, col, a), spr() } */
  const TS = api.TS, P = () => api.P(), now = () => api.time();
  const stats = { told: [], reset() { this.told.length = 0; } };   /* every windup as it was told (tools/order-knights.mjs: the mark, the word, the sound) */
  const chapterOf = e => CHAPTERS[e.okChapter] || CHAPTERS.forest;
  const B = e => BODY[e.t];
  const S = n => api.sfx(n);
  /* HIS ENT -> HIS BODY. The order row (level -> chapter, twist, signature moves, health) is read off the ent (src/order-chapters.js knightRow);
     a knight put down with no row (a lab, a later lane's test) takes his chapter from the level's region and all its signature moves */
  function spawn(base, ent, EHP) {
    const b = BODY[ent.t], row = ORDER_AT[ent.order] || null, chapter = row ? row.chapter : (ent.chapter || kindOf(api.levelId()));
    const C = CHAPTERS[chapter] || CHAPTERS.forest, skin = ent.cnSkin || skinOf(ent.t, chapter);
    const sig = (row ? row.sig : ent.sig || C.moves).filter(m => SIG[m]);
    const m = { ...base, t: ent.t, w: b.w, h: b.h, hp: Math.round((EHP[ent.t] || b.hp) * (row ? row.hp : ent.hpK || 1)), speed: b.speed, mode: 'walk', modeT: 0, cd: 0,
      okChapter: chapter, okSig: sig, okTwist: row ? row.twist : (ent.twist || null), cnSkin: skin, okCd: {}, okFx: { bolts: [], mud: [], rust: [], snares: [], chips: [], sparks: [] },
      eliteName: ent.eliteName || (C.title + ' ' + b.name) };
    if (sig.includes('plate')) m.okPlate = K.plate.pips;
    const spr = api.spr(); if (!spr[skin]) spr[skin] = bakeSet(ent.t, chapter);   /* his chapter's skin, baked the first time one is put down (he dies in it: main.js reskinSet) */
    return m;
  }
  /* WHAT RUNS EVERY FRAME FOR HIM (once a frame, whichever of walk/elite asks first) */
  function own(e, dt) {
    if (e.okT === now()) return; e.okT = now();
    for (const k in e.okCd) if (e.okCd[k] > 0) e.okCd[k] -= dt;
    if (B(e).react === 'guardsHigh') guardsHighTick(e, api.heroes(), dt);   /* (a) the shield goes up over his helm while you are over him */
  }
  /* HIS FEET, between moves: close to his own distance (the duelist and the brute in your face, the lancer at his lance's length, the mage at
     arm's length of his spell - backing off a hero who closes, if there is floor behind him), facing you, never off a ledge */
  function walk(e, dt) {
    own(e, dt);
    const p = P(), d = p.x - e.x, ad = Math.abs(d), dy = Math.abs(p.y - e.y), keep = B(e).keep;
    e.vy = Math.min(400, (e.vy || 0) + 1000 * dt); e.anim = (e.anim || 0) + dt;
    if (p.dead || ad > 280 || dy > 80 || e.sleeper && !e.woke) { e.vx = 0; }
    else { e.face = Math.sign(d) || e.face;
      let dir = ad > keep + 6 ? e.face : (e.t === 'oathmage' && ad < 60) ? -e.face : 0;
      if (dir && logAhead(e, dir)) { e.okAtLog = (e.okAtLog || 0) + dt; if (e.okAtLog < 3.2) dir = 0; } else if (!e.okOnLog) e.okAtLog = 0;   /* (he waits at the trunk a beat for you to come to his swing, then climbs over) */
      if (dir && !floorAt(e, dir)) dir = 0;
      e.vx = dir * e.speed * (dir === -e.face ? 0.8 : 1); }
    api.body(e, dt);
  }
  /* THE FELLED PINE is a wall to his feet (not to yours: it lies flat, and you step over it) - he swings across it instead, and the swing sticks */
  const logAhead = (e, dir) => { const L0 = e.okFx && e.okFx.log; if (!L0 || Math.abs(L0.y - e.y) > 12) return false; const fx = e.x + dir * (e.w / 2 + 2); return fx > L0.x0 - 1 && fx < L0.x1 + 1 && !(e.x > L0.x0 && e.x < L0.x1); };
  const floorAt = (e, dir) => { const tx = Math.floor((e.x + dir * (e.w / 2 + 6)) / TS); return api.standable(tx, Math.floor((e.y + 2) / TS)) && !api.solid(tx, Math.floor((e.y - 6) / TS)); };
  /* the floor under a hero (or under where he will come down) */
  const floorUnder = (x, y) => { let fy = Math.floor(y / TS); for (let k = 0; k < 8 && !api.standable(Math.floor(x / TS), fy); k++) fy++; return fy * TS; };

  /* ---- WHAT HE MAY DO NOW (the moves he could start, by where you are) ---- */
  function ready(e, id) {
    const p = P(), d = p.x - e.x, ad = Math.abs(d), dy = Math.abs(p.y - e.y), w2 = e.w / 2, cd = e.okCd[id] || 0;
    if (cd > 0) return false;
    switch (id) {
      case 'cut': return ad < K.cut.near + w2 && dy < 18;
      case 'lunge': return ad > K.lunge.min && ad < K.lunge.max && dy < 16 && floorAt(e, Math.sign(d) || e.face);
      case 'slam': return ad < K.slam.near + w2 + overLog(e, d) && dy < 22;
      case 'sweep': return ad < K.sweep.near + w2 + overLog(e, d) && dy < 20;   /* (WOOD: with the felled pine between you he reaches for you across it - and the swing sticks) */
      case 'thrust': return ad < K.thrust.near + w2 && dy < 18;
      case 'charge': return ad > K.charge.min && ad < K.charge.max && dy < 14 && floorAt(e, Math.sign(d) || e.face);
      case 'cast': return ad > K.cast.min && ad < K.cast.max && dy < 60;
      case 'blade': return ad < K.blade.near + w2 && dy < 18;
      case 'vine': return ad > K.vine.min && ad < K.vine.max && dy < 20;
      case 'snare': return ad < K.snare.max && dy < 40 && !!p.ground;
      case 'mud': return ad < K.mud.max && dy < 40 && !!p.ground;
      case 'snuff': return e.okPlate < K.plate.pips && !!lampNear(e, true);
      case 'timber': return e.ekRoused && !e.okFelled && ad < 160 && dy < 24;
      case 'shove': return ad < TWISTS.channel.n.reach + w2 + 6 && dy < 18;
      case 'rust': return ad < 170 && dy < 40 && !!p.ground;
    }
    return false;
  }
  const overLog = (e, d) => { const L0 = e.okFx && e.okFx.log; if (!L0 || e.okTwist !== 'timber' || Math.abs(L0.y - e.y) > 12) return 0; const a = Math.min(e.x, e.x + d), b = Math.max(e.x, e.x + d); return L0.x1 > a && L0.x0 < b && !(e.x > L0.x0 && e.x < L0.x1) ? 34 : 0; };
  const lampNear = (e, lit) => { let best = null, bd = K.snuff.r; for (const pr of api.props()) if ((pr.t === 'minerlamp' || pr.t === 'lantern') && !!pr.lit === lit && Math.abs(pr.y - e.y) < 80) { const q = Math.abs(pr.x - e.x); if (q < bd) { bd = q; best = pr; } } return best; };
  function choose(e) {
    const list = [];
    if (e.okTwist && TWIST_MOVE[e.okTwist]) list.push(TWIST_MOVE[e.okTwist]);
    for (const s of e.okSig) if (!SIG[s].passive) list.push(s);
    list.push(...BODY_MOVES[e.t]);
    const ok = list.filter(id => ready(e, id)), used = e.okUsed || (e.okUsed = {});
    if (!ok.length) return null;   /* THE ONE HE HAS GONE LONGEST WITHOUT (a move never used first, in the list's order): his kit comes round in turn, never the same move twice running while another is ready */
    let best = null; for (const id of ok) if (id !== e.okLast || ok.length === 1) { if (best === null || (used[id] ?? -1e9) < (used[best] ?? -1e9)) best = id; }
    return best;
  }
  /* ---- A MOVE BEGINS: told. The mark over his head (the same pair as every foe), the word over his plate, the sound ---- */
  function start(e, id) {
    const C = chapterOf(e), p = P(), tw = e.okTwist && TWISTS[e.okTwist];
    api.take(e); e.okLast = id; (e.okUsed || (e.okUsed = {}))[id] = now(); e.elHit = false;
    const T = id === 'timber' ? tw.n.tell : id === 'shove' ? tw.n.tell : id === 'rust' ? tw.n.tell : K[id].tell;
    e.mode = id + 'Tell'; e.modeT = api.tell(e, T); e.okTell0 = e.modeT;
    const mk = ORDER_MARKS[e.mode]; if (mk) api.mark(e, mk, mk === '!!' ? HARD : SOFT);
    const word = WORD[id] || (id === 'cast' ? C.element : id.toUpperCase()); api.say(e, word, mk === '!!' ? HARD : C.col, Math.max(0.8, e.modeT + 0.2)); S(SOUND[id]);
    if (stats.told.length < 400) stats.told.push({ t: e.t, id, mode: e.mode, mark: mk || '', col: mk ? (mk === '!!' ? HARD : SOFT) : '', word, sound: SOUND[id], at: now(), tell: e.modeT });
    if (id === 'snare' || id === 'mud' || id === 'rust') { const half = id === 'rust' ? tw.n.half : K[id].half; e.okMark = { x: p.x, y: floorUnder(p.x, p.y), half, kind: id, t: 0 }; }
    if (id === 'timber') { const f = Math.sign(p.x - e.x) || e.face, x0 = e.x + f * (e.w / 2 + 2), x1 = x0 + f * tw.n.len * TS; e.okMark = { x: (x0 + x1) / 2, y: e.y, half: Math.abs(x1 - x0) / 2, kind: 'timber', t: 0, f }; }
    if (id === 'cast') e.okCastHp = e.hp;
    if (id === 'snuff') e.okLamp = lampNear(e, true);
  }
  function finish(e, every) { e.okMark = null; e.okVine = null; api.done(e); e.elT = api.every(e, every || K.every); }
  function abandon(e) { e.okMark = null; e.okVine = null; api.drop(e, 1.2); }

  /* ---- THE ANTI-PLUNGE POSES THAT TAKE THE BODY (b, d): only when no windup is running anywhere, and they say their own mark ---- */
  function react(e, dt) {
    const r = B(e).react;
    if (r === 'antiAir') { const was = !!e.aa; if (!was && (api.sinceTell() < 0.5 || !api.footed(e))) return false;
      if (antiAirTick(e, api.heroes(), dt, api.ra)) { if (!was) api.told(); e.vx = 0; e.vy = Math.min(400, (e.vy || 0) + 1000 * dt); api.body(e, dt); return true; } return false; }
    if (r === 'catchThrow') { const was = !!e.ct; if (!was && (api.sinceTell() < 0.5 || !api.footed(e))) return false;
      if (catchThrowTick(e, api.heroes(), dt, api.ra)) { if (!was) api.told(); e.vx = 0; e.vy = Math.min(400, (e.vy || 0) + 1000 * dt); api.body(e, dt); return true; } return false; }
    return false;
  }
  /* (a) a plunge onto THE DUELIST while his shield is up: CLANK, bounced, 'GUARDS HIGH' - go low or go round (main.js plunge loop) */
  const plunge = (e, hero) => !!e && e.alive && e.t === 'oathblade' && guardsHigh(e, hero, api.ra);

  /* ---- HIS MOVES (main.js updateElite: true while he has the body) ---- */
  function elite(e, dt) {
    own(e, dt);
    if (!e.elBack && react(e, dt)) return true;
    if (!e.elBack) {
      e.elT -= dt;
      if (!api.may(e, 240)) return false;
      const id = choose(e); if (!id) return false;
      start(e, id);
    }
    if (!/^(cut|lunge|slam|sweep|thrust|charge|cast|blade|vine|snare|mud|snuff|timber|shove|rust)(Tell)?$|Rec$|Stuck$|^(dazed|teeter|chargeEnd|castBroken)$/.test(e.mode || '')) { abandon(e); return false; }   /* not one of his: the elite's own (riposte, thorns) had it */
    e.modeT -= dt; e.vy = Math.min(400, (e.vy || 0) + 1000 * dt); e.anim = (e.anim || 0) + dt;
    if (api.lost(e)) { abandon(e); return false; }
    if (e.okMark) e.okMark.t += dt;
    const p = P(), C = chapterOf(e), tw = e.okTwist && TWISTS[e.okTwist];
    const strike = (reach, dmg, o) => { if (e.elHit || !api.front(e, reach, 22)) return null; e.elHit = true; return api.hit(e, dmg, o); };
    switch (e.mode) {
      /* THE DUELIST: THE CUT (yellow; it glints on the parry beat - the last K.cut.glint of the windup) and THE LUNGE */
      case 'cutTell': e.vx = 0; e.face = Math.sign(p.x - e.x) || e.face; if (e.modeT <= K.cut.glint && !e.okGlint) { e.okGlint = true; S('spark'); } if (e.modeT <= 0) { e.okGlint = false; e.mode = 'cut'; e.modeT = K.cut.t; S('slash'); } break;
      case 'cut': e.vx = api.edge(e) ? 0 : e.face * 60; strike(K.cut.reach, K.cut.dmg, { blow: 'the order cut' }); if (e.modeT <= 0) { e.mode = 'cutRec'; e.modeT = K.cut.rec; } break;
      case 'cutRec': e.vx = 0; if (e.modeT <= 0) finish(e); break;
      case 'lungeTell': e.vx = 0; if (e.modeT <= 0) { e.mode = 'lunge'; e.modeT = K.lunge.t; S('slash'); } break;
      case 'lunge': e.vx = api.edge(e) ? 0 : e.face * K.lunge.v; strike(K.lunge.reach, K.lunge.dmg, { blow: 'the lunge' }); if (e.modeT <= 0 || api.edge(e)) { e.mode = 'lungeRec'; e.modeT = K.lunge.rec; e.vx = 0; } break;
      case 'lungeRec': e.vx = 0; if (e.modeT <= 0) finish(e); break;
      /* THE BRUTE: THE SLAM (red: the maul goes into the floor and stays - his opening) and THE SWEEP (yellow) */
      case 'slamTell': e.vx = 0; e.face = Math.sign(p.x - e.x) || e.face; if (e.modeT <= 0) { e.mode = 'slam'; e.modeT = K.slam.t; } break;
      case 'slam': e.vx = 0;
        if (!e.elHit) { e.elHit = true; if (woodBite(e, K.slam.reach)) break; S('heavy'); api.shake(4); api.dust(e.x + e.face * 18, e.y, 8);
          if (!p.dead && Math.sign(p.x - e.x) === e.face && Math.abs(p.x - e.x) < K.slam.reach + e.w / 2 && Math.abs(p.y - e.y) < 24) api.hit(e, K.slam.dmg, { unblockable: true, blow: 'the maul' }); }
        if (e.modeT <= 0) { e.mode = 'slamStuck'; e.modeT = K.slam.stuck; api.mark(e, 'STUCK', '#8fd160'); } break;
      case 'slamStuck': e.vx = 0; if (Math.random() < dt * 6) api.dust(e.x + e.face * 18, e.y, 1); if (e.modeT <= 0) finish(e); break;
      case 'sweepTell': e.vx = 0; e.face = Math.sign(p.x - e.x) || e.face; if (e.modeT <= 0) { e.mode = 'sweep'; e.modeT = K.sweep.t; S('slash'); } break;
      case 'sweep': e.vx = 0; if (!e.elHit && woodBite(e, K.sweep.reach)) { e.elHit = true; break; } strike(K.sweep.reach, K.sweep.dmg, { blow: 'the sweep' }); if (e.modeT <= 0) { e.mode = 'sweepRec'; e.modeT = K.sweep.rec; } break;
      case 'sweepRec': e.vx = 0; if (e.modeT <= 0) finish(e); break;
      case 'woodStuck': e.vx = 0; if (Math.random() < dt * 8) api.part({ x: e.x + e.face * 22, y: e.y - 6, vx: (Math.random() - 0.5) * 30, vy: -30, life: 0.4, max: 0.4, col: '#a07a46', size: 1, grav: 200 }); if (e.modeT <= 0) finish(e); break;
      /* THE LANCER: THE THRUST (yellow, the length of his lance) and THE CHARGE (yellow) */
      case 'thrustTell': e.vx = 0; e.face = Math.sign(p.x - e.x) || e.face; if (e.modeT <= 0) { e.mode = 'thrust'; e.modeT = K.thrust.t; S('slash'); } break;
      case 'thrust': e.vx = 0; strike(K.thrust.reach, K.thrust.dmg, { blow: 'the lance' }); if (e.modeT <= 0) { e.mode = 'thrustRec'; e.modeT = K.thrust.rec; } break;
      case 'thrustRec': e.vx = 0; if (e.modeT <= 0) finish(e); break;
      case 'chargeTell': e.vx = 0; if (Math.random() < dt * 12) api.dust(e.x - e.face * 6, e.y, 1); if (e.modeT <= 0) { e.mode = 'charge'; e.modeT = K.charge.run; S('charge'); } break;
      case 'charge': {
        if (!floorAt(e, e.face)) { e.mode = 'teeter'; e.modeT = K.charge.teeter; e.vx = 0; api.mark(e, 'TEETERS', '#8fd160'); S('clatter'); break; }   /* THE LIP: he skids to a stop at the edge, arms wheeling - his opening, and a heavy throws him in (knock-into) */
        e.vx = e.face * K.charge.v; if (Math.random() < dt * 24) api.dust(e.x - e.face * 8, e.y, 1);
        if (!e.elHit && !p.dead && Math.abs(p.x - e.x) < e.w / 2 + 8 && Math.abs(p.y - e.y) < 20) {
          let wall = 0; for (let k = 8; k <= K.charge.pinGap; k += 8) if (api.solid(Math.floor((p.x + e.face * k) / TS), Math.floor((p.y - 8) / TS))) { wall = k; break; }
          const res = api.hit(e, wall ? K.charge.pin : K.charge.dmg, { blow: wall ? 'pinned to the wall' : 'the charge' }); if (res) e.elHit = true;
          if (res === 'blocked') { e.mode = 'dazed'; e.modeT = K.charge.rebound; e.vx = -e.face * 90; p.vx = e.face * 180; api.mark(e, 'TURNED', '#8fd160'); S('clank'); api.shake(3); }
          else if (res === 'hit') { if (wall) { api.moveP(e.face * (wall - 6), 0); p.vx = 0; api.mark(e, 'PINNED', HARD); api.shake(6); api.hitstop(0.08); } e.mode = 'chargeEnd'; e.modeT = K.charge.end; } }
        if (e.mode === 'charge' && e.modeT <= 0) { e.mode = 'chargeEnd'; e.modeT = K.charge.end; } break; }
      case 'chargeEnd': e.vx *= Math.pow(0.02, dt); if (e.modeT <= 0) finish(e); break;
      case 'dazed': e.vx *= Math.pow(0.02, dt); if (e.modeT <= 0) finish(e); break;
      case 'teeter': e.vx = 0; e.ekStunT = Math.max(e.ekStunT || 0, 0.1); if (e.modeT <= 0) finish(e); break;   /* (his guard is down at the lip) */
      /* THE BATTLE MAGE: THE CAST (yellow: his chapter's element - a shield turns it, a parry sends it back; struck while he casts, he is
         INTERRUPTED) and THE BLADE (yellow, up close) */
      case 'castTell': e.vx = 0; e.face = Math.sign(p.x - e.x) || e.face;
        if (e.hp < (e.okCastHp ?? e.hp)) { e.mode = 'castBroken'; e.modeT = K.cast.broken; e.ekStunT = Math.max(e.ekStunT || 0, K.cast.broken); api.mark(e, 'INTERRUPTED', '#8fd160'); S('crack'); e.okMark = null; break; }
        if (Math.random() < dt * 20) api.part({ x: e.x + e.face * 10, y: e.y - e.h - 2, vx: (Math.random() - 0.5) * 20, vy: -30, life: 0.3, max: 0.3, col: C.pal.eye, size: 1, grav: 0 });
        if (e.modeT <= 0) { e.mode = 'cast'; e.modeT = 0.12; const ang = Math.atan2((p.y - 10) - (e.y - e.h * 0.6), p.x - e.x); e.okFx.bolts.push({ x: e.x + e.face * 10, y: e.y - e.h * 0.6, vx: Math.cos(ang) * K.cast.v, vy: Math.sin(ang) * K.cast.v, life: K.cast.life, by: e, col: C.pal.eye, ch: C.id }); S('bow'); } break;
      case 'cast': e.vx = 0; if (e.modeT <= 0) { e.mode = 'castRec'; e.modeT = K.cast.rec; } break;
      case 'castRec': e.vx = 0; if (e.modeT <= 0) finish(e); break;
      case 'castBroken': e.vx = 0; if (e.modeT <= 0) finish(e, K.every * 0.8); break;
      case 'bladeTell': e.vx = 0; e.face = Math.sign(p.x - e.x) || e.face; if (e.modeT <= 0) { e.mode = 'blade'; e.modeT = K.blade.t; S('slash'); } break;
      case 'blade': e.vx = 0; strike(K.blade.reach, K.blade.dmg, { blow: 'the mage blade' }); if (e.modeT <= 0) { e.mode = 'bladeRec'; e.modeT = K.blade.rec; } break;
      case 'bladeRec': e.vx = 0; if (e.modeT <= 0) finish(e); break;
      /* THE THORN CHAPTER: THE VINE PULL (yellow: it lands and hauls you in) and THE SNARE (red: the briars root you) */
      case 'vineTell': e.vx = 0; e.face = Math.sign(p.x - e.x) || e.face; if (e.modeT <= 0) { e.mode = 'vine'; e.modeT = K.vine.t; e.okVine = { len: 0 }; S('slash'); } break;
      case 'vine': { e.vx = 0; const V = e.okVine || (e.okVine = { len: 0 }); V.len = Math.min(K.vine.reach, V.len + dt * K.vine.reach / (K.vine.t * 0.6));
        if (!e.elHit && !p.dead && Math.sign(p.x - e.x) === e.face && Math.abs(p.x - e.x) < V.len + e.w / 2 && Math.abs(p.y - (e.y - 6)) < 22) { e.elHit = true;
          const res = api.hit(e, K.vine.dmg, { blow: 'the vine' }); if (res === 'hit') { p.vx = -e.face * K.vine.pull; p.vy = -90; p.ground = false; api.mark(e, 'PULLED IN', C.col); } }
        if (e.modeT <= 0) { e.mode = 'vineRec'; e.modeT = K.vine.rec; e.okCd.vine = K.vine.cd; } break; }
      case 'vineRec': e.vx = 0; if (e.okVine) e.okVine.len = Math.max(0, e.okVine.len - dt * 400); if (e.modeT <= 0) finish(e); break;
      case 'snareTell': case 'mudTell': case 'rustTell': e.vx = 0; if (e.modeT <= 0) { const id = e.mode.slice(0, -4); fireFloor(e, id); e.mode = id; e.modeT = 0.15; } break;
      case 'snare': case 'mud': case 'rust': e.vx = 0; if (e.modeT <= 0) { const id = e.mode; e.mode = id + 'Rec'; e.modeT = id === 'rust' ? 0.4 : K[id].rec; e.okCd[id] = id === 'rust' ? tw.n.every : K[id].cd; } break;
      case 'snareRec': case 'mudRec': case 'rustRec': e.vx = 0; if (e.modeT <= 0) finish(e); break;
      /* THE ORE CHAPTER: THE SNUFF (quiet: no blow - the lamp goes out, and in the dark his ore grows back) */
      case 'snuffTell': e.vx = 0; if (e.modeT <= 0) { const L0 = e.okLamp; if (L0 && L0.lit) { L0.lit = false; L0.hits = 0; e.okFx.dark = L0; api.mark(e, 'DARK', '#e0a050'); S('hiss'); api.sparks(L0.x, L0.y - 8, e.face, 6); e.okFx.sparks.push({ x: L0.x, y: L0.y - 8, t: 0 }); } e.okCd.snuff = K.snuff.cd; e.mode = 'snuffRec'; e.modeT = 0.3; } break;
      case 'snuffRec': e.vx = 0; if (e.modeT <= 0) finish(e); break;
      /* THE TWISTS. WOOD - TIMBER (red): the pine comes down along the strip; it lies there, and a sweep or a slam swung across it STICKS */
      case 'timberTell': e.vx = 0; if (Math.random() < dt * 10) api.part({ x: e.x - e.face * 4, y: e.y - e.h - 6, vx: 0, vy: 30, life: 0.5, max: 0.5, col: '#3f7a48', size: 1, grav: 60 });
        if (e.modeT <= 0) { const M = e.okMark; e.mode = 'timber'; e.modeT = 0.3; e.okFelled = true; S('crack'); S('thud'); api.shake(5);
          if (M) { e.okFx.log = { x0: M.x - M.half, x1: M.x + M.half, y: M.y, f: M.f, t: 0 };
            if (!p.dead && Math.abs(p.x - M.x) < M.half + 4 && p.y > M.y - 30 && p.y <= M.y + 6) api.hit(e, tw.n.dmg, { unblockable: true, blow: 'the falling pine' });
            for (let x = M.x - M.half; x < M.x + M.half; x += 10) api.dust(x, M.y, 2); }
          e.okMark = null; } break;
      case 'timber': e.vx = 0; if (e.modeT <= 0) finish(e); break;
      /* MARSH - THE SHOVE (yellow): his shield drives you back toward the channel. A shield turns it to a step; a parry is the riposte */
      case 'shoveTell': e.vx = 0; e.face = Math.sign(p.x - e.x) || e.face; if (e.modeT <= 0) { e.mode = 'shove'; e.modeT = 0.16; S('shieldSlam'); } break;
      case 'shove': { e.vx = api.edge(e) ? 0 : e.face * 70; const res = strike(tw.n.reach, tw.n.dmg, { blow: 'the shield shove' });
        if (res === 'hit') { p.vx = e.face * tw.n.push; p.vy = -110; p.ground = false; api.mark(e, 'SHOVED', C.col); } else if (res === 'blocked') p.vx = e.face * tw.n.blockedPush;
        if (e.modeT <= 0) { e.mode = 'shoveRec'; e.modeT = 0.45; e.okCd.shove = tw.n.every; } break; }
      case 'shoveRec': e.vx = 0; if (e.modeT <= 0) finish(e); break;
      default: abandon(e); return false;
    }
    if (e.mode === 'castTell' || /Tell$/.test(e.mode)) e.vx = 0;
    api.body(e, dt);
    return true;
  }
  /* a told floor patch springs (the snare roots, the mud lies, the rust gives) - only where the mark was; a hero standing in it is caught */
  function fireFloor(e, id) {
    const M = e.okMark; e.okMark = null; if (!M) return; const p = P(), tw = e.okTwist && TWISTS[e.okTwist];
    const inIt = !p.dead && Math.abs(p.x - M.x) < M.half + 4 && p.y > M.y - 40 && p.y <= M.y + 6;
    if (id === 'snare') { S('crack'); e.okFx.snares.push({ x: M.x, y: M.y, t: 0.5 }); for (let k = -2; k <= 2; k++) api.part({ x: M.x + k * 6, y: M.y - 2, vx: 0, vy: -60, life: 0.35, max: 0.35, col: '#5a8a3a', size: 2, grav: 200 });
      if (inIt) { const res = api.hit(e, K.snare.dmg, { unblockable: true, blow: 'the briar snare' }); if (res === 'hit') { e.okFx.snare = { x: p.x, t: K.snare.hold }; api.mark(e, 'ROOTED', '#8fd160'); } } }
    if (id === 'mud') { S('squelch'); e.okFx.mud.push({ x0: M.x - M.half, x1: M.x + M.half, y: M.y, life: K.mud.life }); }
    if (id === 'rust') { S('crack'); e.okFx.rust.push({ x0: M.x - M.half, x1: M.x + M.half, y: M.y, life: 1.6 });
      if (inIt) { const res = api.hit(e, tw.n.dmg, { unblockable: true, blow: 'the rust gives' }); if (res === 'hit') { p.vy = -150; p.ground = false; api.mark(e, 'IT GIVES', '#c07048'); } } }
  }
  /* WOOD: is the felled pine between him and the end of his swing? Then the blade bites into it and stays (his long opening) */
  function woodBite(e, reach) {
    const L0 = e.okFx && e.okFx.log; if (!L0 || e.okTwist !== 'timber') return false;
    const a = Math.min(e.x, e.x + e.face * (reach + e.w / 2)), b = Math.max(e.x, e.x + e.face * (reach + e.w / 2));
    if (L0.x1 < a || L0.x0 > b || Math.abs(L0.y - e.y) > 12 || (e.x > L0.x0 && e.x < L0.x1)) return false;
    const bx = Math.max(L0.x0 + 4, Math.min(L0.x1 - 4, e.x + e.face * (reach * 0.8 + e.w / 2))); (L0.cuts || (L0.cuts = [])).push(bx); for (let i = 0; i < 6; i++) e.okFx.chips.push({ x: bx, y: L0.y - 8, vx: (Math.random() - 0.5) * 90, vy: -60 - Math.random() * 70, life: 0.7, i: i % 3 });
    e.mode = 'woodStuck'; e.modeT = TWISTS.timber.n.stuck; api.mark(e, 'STUCK IN WOOD', '#8fd160'); S('thud'); api.shake(2); return true;
  }

  /* ---- THE WORLD HE LEAVES: bolts in flight, patches on the floor, the felled pine, the dark - once a frame for every knight (and what a
     dead one left behind) ---- */
  function world(dt) {
    const p = P(); let slowed = false;
    for (const e of api.enemies()) { if (!is(e) || !e.okFx) continue; const F = e.okFx;
      for (const b of F.bolts) { b.life -= dt; b.x += b.vx * dt; b.y += b.vy * dt;
        if (api.solid(Math.floor(b.x / TS), Math.floor(b.y / TS))) b.life = 0;
        else if (b.back) { if (e.alive && Math.abs(b.x - e.x) < e.w / 2 + 4 && b.y > e.y - e.h - 4 && b.y < e.y + 2) { b.life = 0; api.hurtFoe(e, Math.round(K.cast.dmg * 2), 'REFLECTED'); e.mode = 'castBroken'; e.modeT = K.cast.broken; e.ekStunT = Math.max(e.ekStunT || 0, K.cast.broken); e.elBack = e.elBack || ['walk', 0]; } }
        else if (!p.dead && Math.abs(b.x - p.x) < 8 && b.y > p.y - 24 && b.y < p.y + 2) { b.life = 0;
          const res = api.hit(e, K.cast.dmg, { blow: (chapterOf(e).element || 'the bolt').toLowerCase() });
          if (res === 'blocked' && p.ripSrc === 'parry' && (p.riposteT || 0) > 0.4 && e.alive) { F.bolts.push({ x: b.x, y: b.y, vx: -b.vx * 1.3, vy: -b.vy * 1.3, life: 1.5, by: e, col: '#ffd36b', back: true }); api.mark(e, 'SENT BACK', SOFT); } } }
      F.bolts = F.bolts.filter(b => b.life > 0);
      for (const m of F.mud) { m.life -= dt; if (!p.dead && p.ground && p.x > m.x0 && p.x < m.x1 && Math.abs(p.y - m.y) < 4) slowed = true; }
      F.mud = F.mud.filter(m => m.life > 0);
      for (const r of F.rust) r.life -= dt; F.rust = F.rust.filter(r => r.life > 0);
      if (F.snare) { F.snare.t -= dt; if (F.snare.t > 0 && !p.dead) { p.x = F.snare.x; p.vx = 0; } else F.snare = null; }
      if (F.log) F.log.t += dt;
      for (const s of F.snares) s.t -= dt; F.snares = F.snares.filter(s => s.t > 0);
      for (const s of F.sparks) s.t += dt; F.sparks = F.sparks.filter(s => s.t < 0.45);
      for (const c of F.chips) { c.life -= dt; c.vy += 380 * dt; c.x += c.vx * dt; c.y += c.vy * dt; } F.chips = F.chips.filter(c => c.life > 0);
      /* the ORE in the dark grows back, a plate every K.snuff.regrow (RE-PLATED); light the lamp again and it stops */
      if (e.alive && e.okSig && e.okSig.includes('plate')) { if (F.dark && F.dark.lit) F.dark = null;
        if (F.dark && e.okPlate < K.plate.pips && !(e.broken > 0)) { e.okPlateCd = (e.okPlateCd ?? K.snuff.regrow) - dt; if (e.okPlateCd <= 0) { e.okPlate++; e.okPlateCd = K.snuff.regrow; api.say(e, 'RE-PLATED', '#e0a050', 1.2); S('clank'); } } } }
    if (slowed) p.syrupT = 0.12; else if (p.syrupT > 0 && p.okSlowed) p.syrupT = Math.max(0, p.syrupT - dt);   /* THE MUD holds your feet (main.js reads P.syrupT: the run's cap) */
    p.okSlowed = slowed || (p.okSlowed && p.syrupT > 0);
  }

  /* ---- WHAT HE SHOWS beside his sprite and plate: the baked FX of src/redraw/order_art.js (bakeFx), drawn here, never baked per frame ---- */
  const tile = (g, spr, x0, x1, fy, up, fr) => {   /* a strip of floor: a left cap, tiles of the body, a right cap */
    const w = Math.round(x1 - x0); if (w < 14) return; const cw = spr.l.width, mid = spr.mid[fr % spr.mid.length], mw = mid.width;
    g.drawImage(spr.l, Math.round(x0), fy - up); g.drawImage(spr.r, Math.round(x0) + w - cw, fy - up);
    for (let xx = cw; xx < w - cw; xx += mw) { const sw = Math.min(mw, w - cw - xx); g.drawImage(mid, 0, 0, sw, mid.height, Math.round(x0) + xx, fy - up, sw, mid.height); } };
  function draw(g, e, cx, cy) {
    const C = chapterOf(e), F = e.okFx || {}, fx = OA.bakeFx(), x = Math.round(e.x - cx), y = Math.round(e.y - cy), f = e.face || 1, t = now(), ph = Math.floor(t * 3) % 2;
    /* a told patch on the floor: its colour and its word's (red where nothing turns it); the briars sprout in it as it fills */
    if (e.alive && e.okMark && /Tell$/.test(e.mode || '')) { const M = e.okMark, k = Math.min(1, M.t / Math.max(0.2, e.okTell0 || 0.7)), red = ORDER_MARKS[e.mode] === '!!';
      api.tellBar(Math.round(M.x - M.half - cx), Math.round(M.x + M.half - cx), Math.round(M.y - cy), M.kind === 'timber' ? 6 : 4, k, red ? HARD : C.col, 0.7 + 0.3 * Math.sin(t * 18));
      if (e.mode === 'snareTell') { const sp = fx.snare[k < 0.4 ? 0 : k < 0.8 ? 1 : 2]; for (let q = -1; q <= 1; q++) g.drawImage(sp, Math.round(M.x - cx) - 15 + q * 26, Math.round(M.y - cy) - 19); } }
    for (const m of F.mud || []) { g.globalAlpha = Math.min(1, m.life); tile(g, fx.mud, m.x0 - cx, m.x1 - cx, Math.round(m.y - cy), 5, ph); g.globalAlpha = 1; }
    for (const r of F.rust || []) { g.globalAlpha = Math.min(1, r.life); tile(g, { l: fx.rust.mid[0], r: fx.rust.mid[1], mid: fx.rust.mid }, r.x0 - cx, r.x1 - cx, Math.round(r.y - cy), 4, ph);
      for (let xx = r.x0 + 4, i = 0; xx < r.x1 - 4; xx += 11, i++) g.drawImage(fx.rust.flake[i % 3], Math.round(xx - cx), Math.round(r.y - cy) - 6 - Math.round((1.6 - Math.min(1.6, r.life)) * 5)); g.globalAlpha = 1; }
    for (const s of F.snares || []) { g.globalAlpha = Math.min(1, s.t * 3); for (let q = -1; q <= 1; q++) g.drawImage(fx.snare[2], Math.round(s.x - cx) - 15 + q * 26, Math.round(s.y - cy) - 19); g.globalAlpha = 1; }
    if (F.snare) { const pp = P(); g.drawImage(fx.snare[2], Math.round(F.snare.x - cx) - 15, Math.round(pp.y - cy) - 19); }   /* the held hero in his cage */
    if (F.log) { const L0 = F.log, k = Math.min(1, L0.t / 0.25), w = Math.round(L0.x1 - L0.x0), tr = OA.trunkFor(w), fy = Math.round(L0.y - cy), bx = Math.round((L0.f > 0 ? L0.x0 : L0.x1) - cx);
      g.save(); g.translate(bx, fy); if (L0.f < 0) g.scale(-1, 1); g.rotate(-(1 - k * k) * Math.PI / 2 * (k >= 1 ? 0 : 1)); g.drawImage(tr.c, -tr.ox, -tr.oy); g.restore();
      for (const cutX of L0.cuts || []) g.drawImage(fx.wood.gash, Math.round(cutX - cx) - 3, fy - 9); }
    for (const c of F.chips || []) g.drawImage(fx.wood.chips[c.i], Math.round(c.x - cx), Math.round(c.y - cy));
    for (const s of F.sparks || []) g.drawImage(fx.snuff[Math.min(4, Math.floor(s.t / 0.09))], Math.round(s.x - cx) - 9, Math.round(s.y - cy) - 9);
    for (const b of F.bolts || []) { const spr = fx.bolt[b.back ? 'back' : (b.ch || 'back')][Math.floor(t * 14) % 2]; g.save(); g.translate(Math.round(b.x - cx), Math.round(b.y - cy)); g.rotate(Math.atan2(b.vy, b.vx)); g.drawImage(spr, -7, -7); g.restore(); }
    if (!e.alive) return;
    if (e.okVine && e.okVine.len > 0) { const len = Math.round(e.okVine.len + e.w / 2), n = Math.ceil(len / 12), vy = y - 8;
      g.save(); g.translate(x, vy); g.scale(f, 1); for (let i = 0; i < n; i++) g.drawImage(fx.vine.seg[(Math.floor(t * 14) + i) % 2], i * 12, -5); g.drawImage(fx.vine.tip, len - 4, -7); g.restore(); }
  }
  /* WHAT GOES OVER HIS SPRITE (main.js draws this right after it): the duelist's parry GLINT on the blade's point, and the ORE plates on his pauldrons (whole or cracked) */
  function drawOver(g, e, dx0, dy0, frame, ps) {
    if (!e.alive) return; const fx = OA.bakeFx(), f = (ps && ps.face) || e.face || 1, M = OA.META[e.t] && OA.META[e.t][frame], t = now();
    if (e.mode === 'cutTell' && e.modeT <= K.cut.glint && M && M.glintAt) g.drawImage(fx.glint[Math.floor(t * 30) % 2], Math.round(dx0 + f * (M.glintAt[0] - OA.AX)) - 9, Math.round(dy0 + (M.glintAt[1] - OA.AY)) - 9);
    if (e.okPlate !== undefined && e.okSig && e.okSig.includes('plate') && M && M.pauld) [M.pauld.f, M.pauld.n].forEach((pp, i) => g.drawImage(i < e.okPlate ? fx.stud.whole : fx.stud.cracked, Math.round(dx0 + f * (pp[0] - OA.AX)) - 4, Math.round(dy0 + (pp[1] - OA.AY)) - 4));
  }
  /* HIS CHAPTER'S BANNER ON THE GATE HE HOLDS (drawn over the gate's own tiles, which are the region's barrier look: src/barriers.js): baked once a chapter, five sway phases */
  const BANNERS = {};
  function drawBanner(g, e, cx, cy, TS2) {
    const G = e.G; if (!G || !e.shut || !e.shut.length) return; const C = chapterOf(e), t = now();
    const fr = BANNERS[C.id] || (BANNERS[C.id] = OA.bakeBanner(C.pal)), sw = Math.round(Math.sin(t * 1.7 + G.col) * 2 + Math.sin(t * 4.3 + G.col * 2) * 0.4) + 2;
    g.drawImage(fr[Math.max(0, Math.min(4, sw))], Math.round(G.col * TS2 + 8 - cx) - 13, Math.round(Math.max(G.top, G.bot - 1) * TS2 - cy) - 7);   /* hung at a man's chest on the gate's face, where you meet it */
  }
  return { is, spawn, walk, elite, plunge, world, draw, drawOver, drawBanner, frameOf, orderGuard, K, ORDER, stats };
}
