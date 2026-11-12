// src/gqueen-hands.js - THE GOBLIN QUEEN 3's HANDS (claude/gqueen3, scratch/plan-goblinqueen3-1104.md; modelled on src/gorm-hands.js: P1 -> flee -> P2 persists across death).
// main.js owns the world and her mode machine (updateGQueen); this file owns what is NEW:
//   - her CROWN and her PORTAL ROCK SHARDS, in their OWN arrays (never `seeds`: the pyro's ember ward, the pirate's hook catch and the ranger's snatch eat seeds)
//   - the PARRY of either one: gqHit() asks damagePlayer and reads the shared parry counter (RP.stats.parries), so every hero's beat path covers it
//   - STUNNED (the main opening), the flee, the escape up the burning hall, the portal step and phase two on THE TOWER TOP (later commits)
// Starting numbers are the plan's (tune lane next week). Art = placeholders (frames 2/6/7/15/16 until the art lane).
import * as GQ4A from './redraw/gq4_art.js'; import { Q4, Q4N } from './gq4q.js'; import { Q5, Q5N, makeGQ5Q1 } from './gq5q1.js'; import { grateTiles as hcGrateTiles } from './redraw/highcrown2_art.js';   /* (claude/gq5q1) THE BELL HOISTS + THE THRONE FIRE, behind src/gq5q1.js's switch (Q5) */ import { heroStrikes } from './hero-strikes.js'; import { Q52, Q52N, makeGQ5Q2 } from './gq5q2.js';   /* (claude/gq5q2) THE TOWER TOP, CLEAR: the teach shard, THE BELL PERCH + rope, the sceptre sweep, the hatch (src/gq5q2.js; flag off) */   /* (claude/gq4q) GQ4Q: the hearth jet + the reach, struck shards, the P2 shard fight */
import * as GA from './redraw/gqueen_art.js'; import * as GQ3A from './redraw/gq3_art.js';   /* (claude/gq3art) the GQ3 art: royal portal, geode, tower, roof, stair */ import * as BW from './bell-winch.js';   /* (claude/highcrown3) the bell lure + the winch wave, shared with the Goblin Princess */   /* (claude/gq2art) the art */
export const GQ3 = {
  stunGuard: 1.5, stunRoof: 3.0,       // s after a stun in which no second stun can land (no stunlock, B12); the stun a parry gives on the tower top
  crown: { cd: 7, cd2: 5.5, tell: 0.8, out: 230, reach: 210, hang: 0.15, back: 260, dmg: 16, home: 340, stun: 3.0, stunHp: 0.04, fetch: 1.2, dy: 14, r: 5 },
  portal: { cd: 8, cd2: 6, tell: 1.0, n: 2, n2: 3, glow: 0.9, gap: 0.35, fan: 3, spread: 14, v: 210, dmg: 10, minDist: 90, home: 320, stun: 2.2, stunHp: 0.03, clankHp: 0.01, rows: [12, 13, 14, 15, 16], r: 4 },
};
GQ3.hp2 = 1775;   /* (gq3 item 6: 1750 -> 1400 with the P2 resist 0.5x; the tune lane owns it) */
void 1750;   // phase two's bar (THE TOWER TOP) (claude/hcfix: 1600 -> 1750, the band after all nine can parry her crown)
GQ3.flee = { tell: 1.6 };
/* (gq3 item 5) THE GEODE LOB, P1's new attack: the hall's reflecting rock, mother's version. Tell 1.0 s ('!': sceptre up, a small portal over her head, a geode grinds out; a red ring marks the landing and tracks you 0.6 s, then locks), lob 0.9 s (apex 70 px).
   STRIKE IT BACK (any blow, shot or parry) -> 300 px/s home -> SENT BACK: stunned 2.0 s, 3% (shares stunGuard). Else 18 and it SHATTERS into 2 low shards running the floor 40 px each way (8, jump). cd 9 s (7 below half), range > 90 px, never under a wave or a lure. */
GQ3.geode = { tell: 1.0, track: 0.6, throw: 0.3, air: 0.9, apex: 70, cd: 9, cd2: 7, minDist: 90, dmg: 18, r: 8, home: 300, stun: 2.0, stunHp: 0.03, clankHp: 0.01, shardDmg: 8, shardRun: 40, shardV: 130 };
GQ3.fled = { kneel: 0.8, slam: 1.0, back: 0.8, hold: 0.25 };   /* (gq3 item 1) P2's bar empties: she KNEELS (beaten, crown clutched), slams her sceptre, a ROYAL PORTAL opens behind her, she backs into it and it snaps shut - she ESCAPES, no corpse (PROG.gqFled) */
GQ3.roof = { crownCd: 6, portalCd: 8, lashTell: 0.7, lashReach: 120, lashDmg: 18, lashCd: 2.4, ambushTell: 0.8, ambushCd: 9, ambushDmg: 15, geyserTell: 0.9, geyserN: 5, geyserGap: 0.25, geyserStep: 20, geyserDmg: 16, geyserCd: 7,
  leapCd: 7, orbitR: 40, orbitTurn: 1.2, orbitDmg: 12, orbitHit: 0.8, stormStun: 4.0, stormHp: 0.06, stormRegrow: 12, portalBelow: 0.6, stormBelow: 0.3, addAt: [0.8, 0.55, 0.3], hatch: 0.8 };
/* (gq3 items 6 + 7) THE TOWER TOP, REBUILT: she resists 0.5x outside openings (never below 0.4). BLINK: into one ring, out of another (the exit glows WHITE 0.8 s + a chime); she steps out STUMBLING 1.2 s = THE OPENING (x1.5, 8% of the bar at most).
   CROWN THROUGH A PORTAL: into a ring, out of another (the exit glows GOLD 0.6 s), chest height at 260 px/s toward you: PARRY it and she is STUNNED 3.0 s (x1.25). REINFORCEMENTS at 80 / 55 / 30%: a GREEN ring 1.0 s + a horn,
   two goblins drop (+1 at 3-4 seats), never more than two alive. BURNING BAYS: one bay of the deck every 9 s (A, C, B, D): smoke 1.5 s, burn 6 s (3 hp / 0.8 s + a push up, spare). DESPERATION under 25%: a PORTAL STORM every 12 s: the five rings
   light in order (0.6 s each) and each fans three shards at 165 px/s, two bays burn; she stumbles out of the cupola ring: OPEN 2.0 s (x1.5). */
GQ3.p2 = { resist: 0.5, blinkCd: 5, blinkTell: 0.5, blinkGone: 0.8, blinkGlow: 0.8, stumble: 1.2, stumbleMul: 1.5, stumbleCap: 0.08, crownGlow: 0.6, crownV: 260, crownReach: 440, crownMinDx: 100,
  addGlow: 1.0, addMax: 2, bayEvery: 9, baySmoke: 1.5, bayBurn: 6, bayOrder: [0, 2, 1, 3], desperate: 0.25, stormEvery: 12, stormStep: 0.6, stormTell: 0.8, stormOpen: 2.0, stormMul: 1.5, stormBays: 2 };
/* (gq3 items 4 + 6) THE ESCAPE is THE BURNING TOWER now: her flee portal in the hall takes you to the foot of the tower. fire / fireEvery / push: a burning floor (spare, never kills). The PHOTO'S ATTACK (item 4): ONE portal per volley,
   hers, above you, three shards at shardV 165 px/s (was two fans at 210), glow 0.9 s (cue), every fan = 6.0 s, 4 dmg. */
GQ3.esc = { fire: 3, fireEvery: 0.8, push: 150, fan: 6.0, cue: 0.9, step: 0.5, shardDmg: 4, shardV: 165, shards: 3 };
GQ3.tower = { catch: 2.0, smoke: 1.0, beamEvery: [6, 8], beamFirst: 5, beamTell: 1.0, beamDmg: 14, beamW: 11, hopEvery: 8, hopOpen: 1.5, hopX: [788, 800], start: 1 };
/* (claude/gq2mech) HIGHCROWN'S MECHANICS IN HER HALL (Daniel 11-06): (1) THE BELL IS YOURS - ring it (a blow on the bell) and she STORMS to the sound; under the grate when it drops she is PINNED ~3.5 s (a bigger
   window, x1.1 a blow, at most 15% of her bar a pin); the bell has a cooldown. (2) THE BARRACKS GATE (her west door) rises at 66 / 33 % of her hall bar: crank the winch (3 blows, each inside 2 s of the last, any seat) before the horn
   runs out and the gate drops on her guards; fail and they join her. Hall only. Numbers are starting values for the tune lane. */
GQ3.mech = { bellCd: 10, lureMax: 3.2, speed: 250, tell: 0.9, under: 13, pin: 3.5, pinMul: 1.1, pinCap: 0.15,   /* (claude/hcqueen: pin 4.0 x1.35 uncapped -> 3.5 s x1.1, a pin's blows at most 15% of her bar (main.js gqPinCap). The tally put 50-80% of her hall bar in the lured pin, a pyro 1000+ a pin. Band 75% -> 70% n=108) */ contact: 14, contactR: 26, wind: 0.6, grateHold: 3.5, queue: 1.5,
  addAt: [0.66, 0.33], delay: 5.5, closeAfter: 1.5, crank: 3, crankWin: 2.0, winchCol: 9, guards: [['soldier'], ['soldier', 'javelin']] };
if (Q4) { GQ3.hp2 = Q4N.p2.hp; GQ3.p2.resist = Q4N.p2.chip; GQ3.roof.addAt = [...Q4N.p2.addAt, Q4N.p2.rage.at]; GQ3.p2.bayEvery = Q4N.p2.bayEvery; GQ3.p2.addMax = 1; /* (GQ4TUNE r3: 2 -> 1 reinforcement alive; soldiers were 15% of P2 damage) */ GQ3.p2.desperate = 0; GQ3.portal.dmg = 8; GQ3.crown.dmg = 13; /* (GQ4TUNE-t, flag ON only: portal shard 10 -> 8, crown 16 -> 13; q1: P1 hall deaths 5 -> 2) */ }   /* (claude/gq4q) P2: 1500, chips at 0.4, reinforcements 80 / 55 % + the enrage's pair, bays every 12 s, no desperation storm (the enrage replaces it) */
if (Q5) GQ3.mech.bellCd = Q5N.bellCd;   /* (claude/gq5q1) the bell cools down 16 s: it raises the hoists for 8 s */
export const GQ_SAY = { healed: 'FULLY HEALED', flee: 'SHE FLEES', step: 'STEP INTO HER PORTAL', check: 'SHRINE', crowned: 'CROWNED', clank: 'CLANK', fetch: 'SHE FETCHES HER CROWN' };

import { makeTowerClimb } from './tower-climb.js';   /* (claude/gq4l) THE BURNING TOWER's seven storeys + the outside stretch (only when the level carries TW.OUT: GQ4L_SHIPS) */
export function makeGQueenHands(ctx) {
  const TS = ctx.TS, H = {};
  const L = () => ctx.L;
  let S = null;
  let G52 = null;   /* (claude/gq5q2) the tower top's engine (src/gq5q2.js makeGQ5Q2), null when the flag is off */
  let G5 = null;   /* (claude/gq5q1) THE BELL HOISTS + THE THRONE FIRE (src/gq5q1.js makeGQ5Q1), null when the flag is off */
  const q = () => { const b = ctx.boss(); return b && b.t === 'gqueen' && b.alive ? b : null; };
  const now = () => ctx.time();
  const sfx = k => { const f = ctx.sfx[k]; if (f) f(); };
  const sign = v => (v < 0 ? -1 : 1);
  const G = GQ3;
  const HSX = { eachSeat: fn => seats(fn), hero: () => ctx.P(), attackBox: () => (ctx.attackBox ? ctx.attackBox() : null), overlap: (a, b) => ctx.overlap(a, b), players: () => (typeof ctx.players === 'function' ? ctx.players() : ctx.players) || [] };
  const strikes = (b, k) => heroStrikes(b, k, HSX);   /* (claude/gq4q) any blow or hero shot (main.js configures the real arrays; a tool's fake world falls back to ctx) */
  /* (claude/gq2) EVERY SEAT (1-4 heroes): the hits below test each hero still on his feet, with main.js's asPlayer swap (ctx.eachHero), as the game's other bosses do;
     a fake world / single player without it is the one hero. allHeroes = every seat, downed too (the portal step takes the whole party). */
  const seats = fn => { if (ctx.eachHero) ctx.eachHero(fn); else { const p = ctx.P(); if (p && !p.dead) fn(p); } };
  const everyone = fn => { if (ctx.allHeroes) ctx.allHeroes(fn); else fn(ctx.P()); };
  const target = () => (ctx.target ? ctx.target() : ctx.P()) || ctx.P();
  H.on = () => !!(L() && L().arena && L().arena.boss === 'gqueen');
  /* STAGE ACROSS DEATH (as King Gorm's persist): once her P1 bar has emptied, P1 is never fought again. persist = { stage: 'escape' | 'roof' } until a new level load. */
  let persist = null, hallSnap = null;
  H.persist = () => persist;
  H.load = () => { musicLift(0); S = null; persist = null; const A = L() && L().arena; hallSnap = A && A.boss === 'gqueen' ? { ...A } : null; };
  const fresh = () => ({ h4: null, crown: null, geode: null, geodeBits: [], rocks: [], portals: [], cast: null, stunUntil: 0, stunGuardUntil: 0, stuns: 0, said: new Set(), rid: 0, esc: null, coll: new Map(), slate: new Map(), mech: { cd: 0, lure: null, queued: 0, waves: new Set(), wave: null, crank: 0, crankAt: -9, kept: 0, joined: 0, rings: 0, pins: 0, winchObj: {}, bellObj: {} } });
  /* (claude/gqmusic, Daniel 11-08) THE TOWER TOP'S MUSIC: lifted (x1.06, the told stinger) when the roof stage begins, a second step (x1.10) when her crown first circles her (the final stretch); always let go (lift false) on her death, a death, a retry, the arena left, or a level load */
  let mLvl = 0;
  const musicLift = n => { if (n === mLvl) return; mLvl = n; if (ctx.lift) ctx.lift(n); };
  const roofMus = n => { if (S && S.roof) S.roof.mus = Math.max(S.roof.mus || 0, n); musicLift(S && S.roof ? S.roof.mus : n); };   /* the level wanted is kept on the roof state: a co-op party all down lets the track go, the revive lifts it again */
  H.musicLevel = () => mLvl;
  /* her hall's arena as it was built (a portal step turns L.arena into the tower top's; a death turns it back) */
  function restoreHall() {
    const A = L().arena; if (!A || !hallSnap) return;
    for (const k of Object.keys(A)) if (!(k in hallSnap) && !['laid', 'taken', 'holeOpen', 'escLaid'].includes(k)) delete A[k];
    Object.assign(A, hallSnap);
  }
  H.reset = () => {
    musicLift(0);   /* (claude/gqmusic) a death / retry / load: the tower top's lifted track is let go (the next track starts at x1 anyway) */
    if (!H.on()) { S = null; return; }
    S = fresh(); restoreHall(); if (G5) G5.reset();
    const e = ctx.boss();
    if (persist && e && e.t === 'gqueen') { toEscape(e); ctx.layEscape(); ctx.shutWest(); startEscape(persist.stage === 'roof'); }
  };
  /* while she is gone (the flee, the escape, a retry of phase two) the ordinary arena trigger must not wake her in the hall */
  H.hold = () => { const e = q(); return !!(e && e.stage && e.stage !== 'hall'); };
  function toEscape(e) { sealHatch(false); e.stage = 'escape'; e.phase = 3; e.mode = 'gone'; e.modeT = 0; e.hidden = true; e.alive = true; e.dying = 0; e.maxHp = e.hp = G.hp2; e.maxHp2 = G.hp2; e.vx = 0; e.vy = 0; e.crownOut = false; e.open = 0; }

  /* ONE DOOR for every blow of hers that can be parried: a yellow, blockable damagePlayer, and the answer is whether the shared parry counter moved.
     (Every hero's beat path - the knight's raised shield, the warden's deflect, the pyro's ward, the pirate's catch - calls RP.parried, so all nine are covered with no per-hero code.)
     Never `unblockable`, never `pierce`: a red or a piercing blow is TOO STRONG and is never parried. */
  function gqHit(x, dmg, who, name) {
    if (Q4 && who && who.t === 'gqueen') { const k = who.stage === 'roof' ? (Q52 ? Q52N.dmgK : Q4N.p2.dmgK) : (!who.stage || who.stage === 'hall') ? Q4N.p1.dmgK : 1; if (k !== 1) dmg = Math.max(1, Math.round(dmg * k)); }   /* (GQ4TUNE r3) ONE LEVER PER PHASE for everything she throws through gqHit (hall: crown, portal, geode, charge, reach; tower top: volley, crown, lash, boulder, rocks): Q4N.p1.dmgK / Q4N.p2.dmgK (the hearth jet has its own dmg) */
    const n0 = ctx.parries();
    const r = ctx.damage(x, dmg, { who, name });
    return { res: r, parried: ctx.parries() > n0 };
  }
  H.hit = gqHit;

  /* ---------------- STUNNED: the main opening ---------------- */
  /* A parry on her crown (or a portal shard) stuns her. One stun at a time, and a guard after it so a bot that parries every beat cannot stunlock her (B12). true = it stunned. */
  function stun(e, dur, pct, say) {
    if (!e || !e.alive || e.mode === 'stunned' || now() < S.stunGuardUntil) return false;
    e.mode = 'stunned'; e.modeT = dur; e.vx = 0; e.crownOut = false;
    S.stunGuardUntil = now() + dur + G.stunGuard; S.stunUntil = now() + dur; S.stuns = (S.stuns || 0) + 1;
    if (S.cast) S.cast.stunned = true;
    e.hp -= Math.round(e.maxHp * pct); e.flash = 0.4;
    ctx.number(e.x, e.y - 70, say || GQ_SAY.crowned, '#ffd36b'); ctx.ring(e.x, e.y - 40, 34, '#ffd36b', 0.4);
    ctx.burst(e.x, e.y - 52, 14, ['#ffd36b', '#fff6c8', '#e0b040'], 90, 0.7); sfx('golemShatter'); ctx.shake(6); ctx.zoom(1.08, 0.3);
    if (e.hp <= 0) ctx.hurt(e, 1, e.x);   /* the stun that empties her bar: the blow's own gate (spare / death) takes it */
    return true;
  }
  H.stun = stun;

  /* ---------------- THE FLEE (her P1 bar empties) ---------------- */
  /* No death: she lifts her sceptre, a portal opens behind the dais and she steps through. You are FULLY HEALED (hp, stamina, flasks), the fight ends (the camera is yours), the hall catches
     (the burning rafters and the hole are laid) and the west door stays shut. true = the death is spared. */
  function fullHeal(P0) {
    P0.hp = P0.maxHp; if (P0.hpShown !== undefined) P0.hpShown = P0.maxHp; P0.st = P0.maxSt || P0.st; P0.flasks = ctx.flaskMax();
    ctx.number(P0.x, P0.y - 40, GQ_SAY.healed, '#8fd160'); sfx('heal');
  }
  H.spare = e => {
    if (S && e && e.t === 'gqueen' && e.stage === 'roof') { fledBegin(e); return true; }   /* (gq3 item 1) the tower top's bar empties: she does not die, she ESCAPES */
    if (!S || !e || e.t !== 'gqueen' || (e.stage && e.stage !== 'hall')) return false;
    const P0 = ctx.P();
    e.maxHp2 = G.hp2; e.maxHp = G.hp2; e.hp = G.hp2; e.stage = 'flee'; e.phase = 3; e.mode = 'fleeTell'; e.modeT = G.flee.tell; e.vx = 0; e.crownOut = false; e.alive = true; e.dying = 0; e.open = 0; e.stagger = 0;
    S.crown = null; S.rocks = []; S.portals = []; S.cast = null; S.geode = null; S.geodeBits = [];
    persist = { stage: 'escape' };
    ctx.endFight(); ctx.shutWest(); ctx.layEscape();
    everyone(P1 => { if (P1 && !P1.dead) fullHeal(P1); });   /* (claude/gq2) the WHOLE PARTY is fully healed (each seat out of his own save: asPlayer swaps PROG for flaskMax) */
    ctx.number(e.x, e.y - e.h - 30, GQ_SAY.flee, '#ff6b5c'); sfx('bellow'); ctx.shake(8); ctx.zoom(1.12, 0.5);
    ctx.hint('SHE HAS FLED THROUGH A PORTAL AND THE TOWER IS ON FIRE. STEP INTO HER PORTAL - AND FOLLOW HER UP.');
    startEscape(false);
    return true;
  };
  /* ---------------- (gq3 item 1) THE QUEEN ESCAPES ---------------- */
  function fledBegin(e) {
    e.hp = 1; e.stage = 'fled'; e.mode = 'fledKneel'; e.modeT = G.fled.kneel; e.vx = 0; e.vy = 0; e.crownOut = false; e.open = 0; e.alpha = 1; e.alive = true;
    S.crown = null; S.rocks = []; S.portals = []; S.cast = null; S.geode = null; S.geodeBits = []; if (S.roof) { S.roof.storm = null; S.roof.geysers = []; S.roof.hatch = null; }
    S.fled = { t0: now(), px: e.x - (e.face || 1) * 44, py: e.y - 18, open: 0, snap: 0 };
    for (const q2 of ctx.enemies()) if (q2.alive && q2 !== e && !q2.mini && q2.hp > 0 && Math.abs(q2.x - e.x) < 700) { q2.alive = false; ctx.burst(q2.x, q2.y - 8, 8, ['#5a2a7a', '#e0b040', '#b28cff'], 60, 0.5); }   /* her roof guards burst away */
    ctx.number(e.x, e.y - e.h - 30, 'SHE FALLS TO HER KNEES', '#ffd36b'); sfx('bellow'); ctx.shake(6); ctx.zoom(1.1, 0.5);
    musicLift(0);
  }
  function fledStep(e, dt) {
    const F0 = S.fled, tt = now(), K = G.fled; e.modeT -= dt; e.anim += dt; e.vx = 0;
    if (e.mode === 'fledKneel') { if (e.modeT <= 0) { e.mode = 'fledSlam'; e.modeT = K.slam; F0.open = 0.01; sfx('portalOpen'); sfx('forgeHammer'); ctx.shake(7); ctx.number(F0.px, F0.py - 30, 'HER SCEPTRE SLAMS: A PORTAL OPENS', '#b28cff'); } }
    else if (e.mode === 'fledSlam') { F0.open = Math.min(1, 1 - e.modeT / K.slam); if (Math.random() < dt * 40) ctx.part({ x: F0.px + (Math.random() - 0.5) * 14, y: F0.py + (Math.random() - 0.5) * 30, vx: 0, vy: -24, life: 0.4, max: 0.4, col: '#b28cff', size: 2, grav: 0, glow: true });
      if (e.modeT <= 0) { e.mode = 'fledBack'; e.modeT = K.back; F0.from = e.x; e.face = sign(F0.px - e.x) || e.face; } }
    else if (e.mode === 'fledBack') { const k = Math.max(0, Math.min(1, 1 - e.modeT / K.back)); e.x = F0.from + (F0.px - F0.from) * k; e.alpha = 1 - 0.8 * k; F0.open = 1;
      if (e.modeT <= 0) { e.mode = 'fledSnap'; e.modeT = K.hold; F0.snap = 1; e.alpha = 0; e.hidden = true; ctx.burst(F0.px, F0.py, 22, ['#b28cff', '#e8dcff', '#2a1a3a', '#e0b040'], 110, 0.7); sfx('portalOpen'); sfx('callerBlast'); ctx.ring(F0.px, F0.py, 30, '#e8dcff', 0.4); ctx.shake(8); } }
    else if (e.mode === 'fledSnap') { F0.open = Math.max(0, e.modeT / K.hold);
      if (e.modeT <= 0) { e.mode = 'gone'; e.stage = 'fledDone'; e.gqFled = true; e.hp = 0; e.alpha = 1; F0.open = 0; ctx.hurt(e, 1, e.x); } }   /* the ordinary death path, no body (main.js spawnCorpse skips a fled queen): alive=false, kills++, xpKill, beastSlain, the fight ends, THE QUEEN HAS FLED */
  }
  H.fled = () => !!(S && S.fled);
  /* her frame while she is not the hall's: the flee (a quiet tell, then through her portal), then nothing (hidden). main.js asks first; true = it ran her frame */
  H.step = (e, dt) => {
    if (!S) return false;
    if (e.stage === 'fled') { fledStep(e, dt); return true; }
    if (e.stage === 'fledDone') return true;
    if (e.stage === 'flee') {
      e.modeT -= dt; e.anim += dt; e.vx = 0; e.hidden = false;
      if (!S.fleeP) { const E0 = L().gqEscape; S.fleeP = E0 && E0.portal ? { x: E0.portal.x * TS + 8, y: (E0.portal.y + 1) * TS - 14, t0: now() } : { x: e.x + 40, y: e.y - 20, t0: now() }; }   /* (gq3) the portal she leaves by is the one you follow: it stays open in the hall */
      if (Math.random() < dt * 30) ctx.part({ x: S.fleeP.x + (Math.random() - 0.5) * 8, y: S.fleeP.y + (Math.random() - 0.5) * 24, vx: 0, vy: -20, life: 0.4, max: 0.4, col: '#b28cff', size: 2, grav: 0, glow: true });
      if (e.modeT <= 0) { ctx.burst(S.fleeP.x, S.fleeP.y, 14, ['#b28cff', '#e8dcff', '#2a1a3a'], 90, 0.6); toEscape(e); e.x = S.fleeP.x; S.fleeP.done = now(); }
      else e.x += (S.fleeP.x - e.x) * Math.min(1, dt * 1.5);
      return true;
    }
    if (e.stage === 'escape') return true;
    return false;
  };

  /* ---------------- THE ESCAPE (the burning hall, the roof, her portal) ---------------- */
  function startEscape(checked) {
    const E = L().gqEscape; if (!E) return;
    const tt = now();
    S.esc = { on: true, tower: true, inTower: false, fireOn: false, checked: !!checked, step: null, musicSet: false, graceUntil: tt + (checked ? 0 : G.flee.tell),
      volT: G.esc.fan, vol: null, beams: [], beamT: G.tower.beamFirst, fl: Array.from({ length: E.tower.OUT ? E.tower.FLOORS.length : 4 }, () => ({ lastOn: tt, smokeAt: 0, burning: false, tick: new Map() })),
      q: { k: G.tower.start, x: (E.tower.SHAFT[0] + 14) * TS + 8, hopAt: tt + G.tower.hopEvery, entry: null, flash: null } };
    for (const t0 of E.throwers || []) ctx.spawnEnt({ t: t0.t, x: t0.x, y: t0.y, face: -1 });
    TCL.init(S.esc, E);   /* (gq4l) the climb's own state (tapestries, hoarding boards, debris, boulder, her hop) - a retry restores the boards */
  }
  function gqRed(x, dmg, name, extra) { return ctx.damage(x, dmg, { unblockable: true, name, ...(extra || {}) }); }
  const asSeat = (p, fn) => seats(P1 => { if (P1 === p) fn(); });   /* a hit on one seat runs as that seat (main.js asPlayer: P, PROG and the keys are his for the call) */
  const TCL = makeTowerClimb({ ctx, TS, seats, now, sfx, hit: (a, b, c) => hit(a, b, c), strikes: (b, k) => strikes(b, k), q, asSeat, gqRed, L, portalDraw: (...a) => portalDraw(...a) });
  /* which storey of THE BURNING TOWER a hero's feet are in (0 = the foot, 4 = the top, 5 = the deck above the hatch); -1 = not in the tower */
  function storeyOf(p, E) {
    const Tw = E.tower, nS = Tw.FLOORS.length, DK = Tw.OUT ? nS + 1 : nS;   /* (gq4l) ON: 0..nS-1 the storeys, nS the OUTSIDE, nS + 1 the deck; OFF: the deck is index 5 as it was */
    if (Tw.OUT) { const O = Tw.OUT; if (p.y < 21 * TS && p.x > Tw.DECK.x0 * TS) return DK; if (p.x >= O.x0 * TS - 4 && p.x <= (O.x1 + 1) * TS + 4 && p.y >= 21 * TS && p.y <= (O.floor + 1) * TS) return nS; }
    if (p.x < (Tw.SHAFT[0] - 2) * TS || p.x > (Tw.SHAFT[1] + 2) * TS) return p.y < 21 * TS && p.x > Tw.DECK.x0 * TS ? DK : -1;
    if (p.y < 22 * TS) return DK;
    for (let k = 0; k < Tw.FLOORS.length; k++) if (p.y > (Tw.FLOORS[k] - 12) * TS && p.y <= Tw.FLOORS[k] * TS + 2) return k;
    return -1;
  }
  function escapeStep(dt) {
    const E = L().gqEscape, esc = S.esc, A = L().arena, t = now();
    if (!E || !esc || !esc.on) return;
    if (!esc.musicSet) { esc.musicSet = true; ctx.music('gqescape'); }
    if (t >= esc.graceUntil) esc.fireOn = true;
    const here = []; seats(p => here.push(p));
    if (!here.length) return;
    const Tw = E.tower, F = Tw.FLOORS;
    if (!esc.inTower) {
      if (here.some(p => storeyOf(p, E) >= 0)) esc.inTower = true;   // (a retry respawns you at the tower foot or at its roof shrine)
      /* HER PORTAL, in the hall: walk into it (any hero: the party follows him through). A short swirl, then the foot of the tower */
      if (esc.step) {
        const k = (t - esc.step.t0) / G.esc.step, P0 = esc.step.p || ctx.P(); P0.vx = 0; P0.inv = Math.max(P0.inv || 0, 0.6);
        if (Math.random() < dt * 60) ctx.part({ x: P0.x + (Math.random() - 0.5) * 12, y: P0.y - 8 + (Math.random() - 0.5) * 16, vx: 0, vy: -30, life: 0.3, max: 0.3, col: '#b28cff', size: 2, grav: 0, glow: true });
        if (k >= 1) { esc.step = null; towerEnter(E); }
      } else {
        const px = E.portal.x * TS + 8, who = here.find(p => Math.abs(p.x - px) < 10 && Math.abs(p.y - (E.portal.y + 1) * TS) < 24);
        if (who && !esc.inTower) { esc.step = { t0: t, p: who }; sfx('portalOpen'); ctx.number(px, E.portal.y * TS - 10, GQ_SAY.step, '#b28cff'); }
      }
      return;
    }
    // ---- IN THE TOWER ----
    const hs = here.map(p => ({ p, k: storeyOf(p, E) })), top = Math.max(...hs.map(h0 => h0.k));
    for (let k = 0; k < esc.fl.length; k++) {   // each timber floor catches 2.0 s after the last hero has left it (smoke 1.0 s first); fire = 3 hp / 0.8 s + a push up, spare (never kills)
      const f = esc.fl[k]; if (hs.some(h0 => h0.k === k)) f.lastOn = t;
      if (!f.burning && top > k && t - f.lastOn >= G.tower.smoke) { if (!f.smokeAt) { f.smokeAt = t; ctx.number((Tw.SHAFT[0] + Tw.SHAFT[1]) / 2 * TS, F[k] * TS - 30, 'THE FLOOR SMOKES', '#c9c9d6'); sfx('crumble'); } if (t - f.lastOn >= G.tower.catch) { f.burning = true; ctx.number((Tw.SHAFT[0] + Tw.SHAFT[1]) / 2 * TS, F[k] * TS - 30, 'THE FLOOR CATCHES', '#ff9a5c'); sfx('crack'); } }
      if (f.burning) for (const h0 of hs) if (h0.k === k && h0.p.ground && Math.abs(h0.p.y - F[k] * TS) < 4) {
        const P1 = h0.p; P1.gqFireT = (P1.gqFireT ?? 0.4) - dt;
        if (P1.gqFireT <= 0) { P1.gqFireT = G.esc.fireEvery; asSeat(P1, () => gqRed(P1.x, G.esc.fire, 'THE BURNING FLOOR', { spare: true, noKnock: true })); P1.vy = -G.esc.push; P1.ground = false; ctx.burst(P1.x, F[k] * TS - 2, 6, ['#ff9a5c', '#ffd36b', '#ff6b2c'], 60, 0.4); }
      } else if (h0.p.gqFireT !== undefined) h0.p.gqFireT = Math.min(h0.p.gqFireT, 0.25);
    }
    // ---- THE BURNING BEAMS: a creak and a shadow on the floor (1.0 s, '!!'), then a beam down the shaft: 14 red, step aside ----
    const nS = F.length;
    if (top >= 0 && top < nS) {
      esc.beamT -= dt;
      if (esc.beamT <= 0) { const tg = hs.find(h0 => h0.k === top).p, bx = Math.max(Tw.SHAFT[0] * TS + 10, Math.min(Tw.SHAFT[1] * TS - 10, tg.x + (Math.random() - 0.5) * 70));
        esc.beams.push({ x: bx, k: top, at: t + G.tower.beamTell, state: 'tell', done: false }); const be = (Tw.BURN || []).includes(top) ? [5, 7] : G.tower.beamEvery; esc.beamT = be[0] + Math.random() * (be[1] - be[0]);   /* (gq4l) the burning storeys let go a little oftener: every 5-7 s */
        ctx.number(bx, F[top] * TS - 34, '!!', '#ff6b6b'); sfx('crack'); sfx('crumble'); }
    }
    for (const b of esc.beams) {
      if (b.state === 'tell' && t >= b.at) { b.state = 'fall'; b.at = t + 0.3; ctx.shake(5); sfx('thud'); ctx.dust(b.x, F[b.k] * TS, 8); ctx.burst(b.x, F[b.k] * TS - 6, 12, ['#ff9a5c', '#ffd36b', '#5a3a1a'], 110, 0.5);
        for (const h0 of hs) if (h0.k === b.k && Math.abs(h0.p.x - b.x) < G.tower.beamW) asSeat(h0.p, () => gqRed(b.x, G.tower.beamDmg, 'A BURNING BEAM', {})); }
      else if (b.state === 'fall' && t >= b.at) b.done = true;
    }
    esc.beams = esc.beams.filter(b => !b.done);
    // ---- HER: seen a storey ahead; she hops up by portal every ~8 s (her entry portal stays open 1.5 s: step in = a SHORTCUT) ----
    const e = q(), qq = esc.q;
    if (Tw.OUT) { TCL.step(dt, esc, E, hs, top, t); TCL.queen(esc, E, hs, top, t, e); }   /* (gq4l) ON: the burning storeys, the outside stretch and HER hop in view (src/tower-climb.js) */
    else if (e) {
      e.hidden = false; e.x = qq.x; e.y = F[qq.k] * TS; e.face = -1; e.mode = (qq.flash && t < qq.flash.until) ? 'towerHop' : (qq.hopAt - t < 0.7 ? 'towerCrouch' : 'towerWatch'); e.vx = 0; e.vy = 0;
      if (t >= qq.hopAt && qq.k < 4 && qq.k <= top) {
        const nx = Tw.SHAFT[0] + 6 + Math.floor(Math.random() * 14), ex = { x: nx * TS + 8, y: F[qq.k + 1] * TS };
        qq.entry = { x: qq.x, y: F[qq.k] * TS, until: t + G.tower.hopOpen, exit: ex }; qq.flash = { x: ex.x, y: ex.y, until: t + 0.5 };
        ctx.burst(qq.x, F[qq.k] * TS - 20, 12, ['#b28cff', '#e8dcff', '#2a1a3a'], 80, 0.5); sfx('portalOpen'); ctx.number(qq.x, F[qq.k] * TS - 44, 'SHE HOPS UP', '#b28cff');
        qq.k++; qq.x = ex.x; qq.hopAt = t + G.tower.hopEvery;
      }
      if (qq.entry && t < qq.entry.until) {
        const en = qq.entry, who = en.exit && en.exit.out ? null : hs.find(h0 => h0.k >= 0 && Math.abs(h0.p.x - en.x) < 12 && Math.abs(h0.p.y - en.y) < 26);   /* (gq4l) her shortcut portal stays INSIDE the tower */
        if (who) { const ex = en.exit; qq.entry = null; let n = 0; for (const h0 of hs) { h0.p.x = ex.x - 26 + ([0, 14, 28, 42][n++] ?? 14); h0.p.y = ex.y; h0.p.vx = 0; h0.p.vy = 0; } sfx('portalOpen'); ctx.burst(ex.x, ex.y - 12, 12, ['#b28cff', '#e8dcff'], 80, 0.5); ctx.number(ex.x, ex.y - 40, 'A SHORTCUT', '#b28cff'); }
      } else if (qq.entry) qq.entry = null;
    }
    // ---- THE PHOTO'S ATTACK (item 4): ONE portal above you, glowing 0.9 s, then three shards at 165 px/s (4 each) every 6.0 s ----
    if (esc.fireOn && top >= 0 && top < nS) {
      esc.volT -= dt;
      if (esc.volT <= 0 && !esc.vol) { const tg = hs.find(h0 => h0.k === top).p; esc.vol = { at: t + G.esc.cue, px: tg.x + (Math.random() < 0.5 ? -22 : 22), py: Math.max((F[top] - 11) * TS + 14, tg.y - 70), k: top }; esc.volT = G.esc.fan; ctx.number(esc.vol.px, esc.vol.py - 14, '!', '#ffd36b'); sfx('portalOpen'); }
      if (esc.vol && t >= esc.vol.at) { const tg = ctx.P(); fan(esc.vol.px, esc.vol.py, tg.x, tg.y - 8, true); esc.vol = null; }
    }
    // ---- the roof shrine at the hatch top, then the fight: walk past the shrine ----
    const sx = E.check.x * TS + 8, sy = (E.check.y + 1) * TS;
    if (!esc.checked && here.some(p => Math.abs(p.x - sx) < 20 && Math.abs(p.y - sy) < 30)) {
      esc.checked = true; if (persist) persist.stage = 'roof'; ctx.setCheckpoint(sx, sy); sfx('sting');
      ctx.burst(sx, sy - 16, 14, ['#ffd36b', '#fff6c8', '#8fd160'], 50, 0.9); ctx.number(sx, sy - 36, GQ_SAY.check, '#ffd36b');
      ctx.hint(Q52 ? Q52N.hint : 'THE TOWER TOP. SHE WAITS ON THE ROOF.');   /* (claude/gq5q2) the rule, told on entry */
    }
    const beginX = (Tw.FOLLOW.begin) * TS + 8;
    if (esc.checked && here.some(p => p.y <= 20 * TS && p.x > beginX && p.x < Tw.DECK.x1 * TS)) { esc.on = false; toRoof(); }
  }
  /* her portal in the hall: the whole party is set down at the foot of the tower, and that is the checkpoint from now on */
  function towerEnter(E) {
    const esc = S.esc; esc.inTower = true; let n = 0;
    everyone(P1 => { P1.x = E.start.x * TS + 8 + ([0, 14, 28, 42][n++] ?? 14); P1.y = (E.start.y + 1) * TS; P1.vx = 0; P1.vy = 0; P1.face = 1; });
    ctx.setCheckpoint(E.start.x * TS + 8, (E.start.y + 1) * TS);
    const P0 = ctx.P(); ctx.burst(P0.x, P0.y - 10, 18, ['#b28cff', '#e8dcff', '#2a1a3a'], 90, 0.7); sfx('portalOpen');
    ctx.number(P0.x, P0.y - 40, 'THE BURNING TOWER', '#ff9a5c'); ctx.hint('THE FLOORS BEHIND YOU CATCH. CLIMB. MIND THE BEAMS.');
    esc.q.hopAt = now() + G.tower.hopEvery; esc.q.k = G.tower.start; esc.q.x = (E.tower.SHAFT[0] + 14) * TS + 8; esc.volT = G.esc.fan;
  }
  /* the portal step: the WHOLE PARTY is set down at the tower top's portal exit (seat n a step aside, as a respawn), her arena becomes the tower top's, and phase two begins (bossStart: the name card, the walls, the music) */
  function toRoof() {
    const e = ctx.boss(), RA = L().arenaRoof; if (!e || !RA) return;
    if (S.esc) S.esc.on = false;
    S.rocks = []; S.portals = [];
    e.stage = 'roof'; e.phase = 3; e.hidden = false; e.alive = true; e.hp = e.maxHp = G.hp2; e.x = RA.x1 - 6 * TS; e.y = RA.floor; e.vx = 0; e.vy = 0; e.face = -1;
    let n = 0; everyone(P1 => { P1.x = RA.exit.x * TS + 8 + ([0, 14, 28, 42][n++] ?? 14); P1.y = (RA.exit.y + 1) * TS; P1.vx = 0; P1.vy = 0; P1.face = 1; });
    ctx.enterRoof();
    roofBegin(e);
    const P0 = ctx.P(); ctx.burst(P0.x, P0.y - 10, 18, ['#b28cff', '#e8dcff', '#2a1a3a'], 90, 0.7);
  }
  /* (gq3fix) THE HATCH IS SHUT for the fight on the deck: a two-column hole in the middle of the west deck swallowed the melee bots (and any hero who mistimed a jump) into the burning shaft, with no way back into the fight. The oak trap (the old hatch art, closed) lies flush; a retry into the tower opens it again. */
  function sealHatch(on) {
    const Lv = L(), A0 = Lv && Lv.arenaRoof, Tw = A0 && A0.tower; if (!Tw || !Lv.grid) return; const [c0, c1] = Tw.HATCH.cols, fy = Tw.DECK.floor;
    if (Tw.OUT) { const [m0, m1] = Tw.OUT.mouth; for (let y = fy; y <= fy + 1; y++) for (let x = m0; x <= m1; x++) Lv.grid[y * Lv.W + x] = on ? 8 : (x === Tw.OUT.mouthLadder ? 9 : 0); }   /* (gq4l) the outside stretch's mouth in the deck floor (a ladder up it) */
    else for (let y = fy; y <= fy + 1; y++) { Lv.grid[y * Lv.W + c0] = on ? 8 : 9; Lv.grid[y * Lv.W + c1] = on ? 8 : 0; }   /* 8 = T.PLANK, 9 = T.NET (the ladder), 0 = air */
    S.hatchShut = !!on;
  }
  function roofBegin(e) { sealHatch(true); S.roof = { lash: 0, ambushCd: 6, geyserCd: 4, lashCd: 2, blinkCd: 3, stormAt: 0, stormBreakAt: 0, adds: new Set(), hatch: null, geysers: [], banner: null, orbit: null, blink: null, reinf: null, pstorm: null,
    bays: [0, 1, 2, 3].map(() => ({ state: 'idle', at: 0, until: 0 })), bayT: G.p2.bayEvery, bayNext: 0, bayN: 0 };
    if (Q4) { S.roof.geyserCd = 1e9; S.roof.q4 = { homes: [], ward: 0, volleyCd: 1.6, boulderCd: 5, rockCd: 7, mtnCd: 0, bombSeen: new Set(), rage: false, rageDone: false, vol: null, boulder: null, fall: [], bomb: null, mtn: null, volLit: null }; }   /* (claude/gq4q) the rubble geyser is retired */
    if (G52) G52.begin(S.roof); }
  const rings = () => { const A0 = L().arena, TWd = (A0 && A0.tower) || (L().arenaRoof && L().arenaRoof.tower); return TWd ? TWd.RINGS : []; };
  const bays = () => { const A0 = L().arena, TWd = (A0 && A0.tower) || (L().arenaRoof && L().arenaRoof.tower); return TWd ? TWd.BAYS : []; };
  const ringPos = r => ({ x: r.x * TS + 8, y: (r.y + 1) * TS });   // feet
  const lightBay = (R0, i, tt) => { const b = R0.bays[i]; if (b && b.state === 'idle') { b.state = 'smoke'; b.at = tt + G.p2.baySmoke; b.until = b.at + G.p2.bayBurn; const sp = bays()[i]; if (sp) { ctx.number(((sp[0] + sp[1]) / 2) * TS, L().arena.floor - 34, 'THE ROOF CATCHES', '#ff9a5c'); sfx('crumble'); } } };
  /* ---------------- PHASE TWO: THE TOWER TOP ---------------- */
  /* A sealed rooftop island. Full damage the whole phase (gqOpen: stage 'roof'); a stun adds the riposte window. Three attacks of her own - a BANNER LASH (high: duck / low: jump, alternating), a PORTAL AMBUSH
     (she steps out behind you into a sweep; yellow, a parry pays a riposte) and a RUBBLE GEYSER (a line of marked tiles toward you, jump it) - her quake stomp, the CROWN TOSS (parried: stunned 3.0 s), the portal
     shards under 60%, the CROWN STORM under 30% and two goblin guards up a hatch at 66% and 33%. */
  const roofCrown = (e) => { e.crownCd = G.roof.crownCd; e.mode = 'crownTossTell'; e.modeT = G.crown.tell; ctx.number(e.x, e.y - e.h - 12, '!', '#ffd36b'); sfx('callerChant'); };
  const roofPortal = (e) => { e.portalCd = G.roof.portalCd; e.mode = 'portalTell'; e.modeT = G.portal.tell; ctx.number(e.x, e.y - e.h - 12, '!', '#ffd36b'); sfx('callerChant'); };
  function startLash(e) {
    const R0 = S.roof; R0.lashCd = G.roof.lashCd; R0.lashHigh = !R0.lashHigh;
    e.mode = R0.lashHigh ? 'lashHighTell' : 'lashLowTell'; e.modeT = G.roof.lashTell; ctx.number(e.x, e.y - e.h - 12, '!!', '#ff6b6b'); sfx('snort');
  }
  function startAmbush(e) {
    const R0 = S.roof, P0 = ctx.P(), RA = L().arenaRoof || L().arena;
    R0.ambushCd = G.roof.ambushCd; e.mode = 'ambushTell'; e.modeT = G.roof.ambushTell;
    R0.ambushX = Math.max(RA.x0 + 30, Math.min(RA.x1 - 30, P0.x - (P0.face || 1) * 46));   /* the exit portal glows BEHIND you */
    ctx.number(e.x, e.y - e.h - 12, '!', '#ffd36b'); sfx('callerChant');
  }
  function startGeyser(e) {
    const R0 = S.roof, P0 = ctx.P(); R0.geyserCd = G.roof.geyserCd; e.mode = 'geyserTell'; e.modeT = G.roof.geyserTell; e.face = sign(P0.x - e.x);
    const t0 = now() + G.roof.geyserTell, RA = L().arena;
    R0.geysers = [];
    for (let k = 0; k < G.roof.geyserN; k++) { const x = e.x + e.face * (26 + k * G.roof.geyserStep); if (x > RA.x0 + 10 && x < RA.x1 - 10) R0.geysers.push({ x, at: t0 + k * G.roof.geyserGap, done: false, until: 0, hit: false }); }
    ctx.number(e.x, e.y - e.h - 12, '!!', '#ff6b6b'); sfx('charge');
  }
  function startLeap(e) {
    const R0 = S.roof, P0 = ctx.P(), RA = L().arena; R0.leapCd = G.roof.leapCd;
    e.tx = Math.max(RA.x0 + 40, Math.min(RA.x1 - 40, P0.x + (Math.random() < 0.5 ? -1 : 1) * 70)); e.mode = 'hallLeapTell'; e.modeT = 0.6; e.face = sign(e.tx - e.x);
    ctx.number(e.x, e.y - e.h - 12, '!!', '#ff6b6b'); sfx('charge');
  }
  /* BLINK: she steps into a ring (a burst where she stood), the EXIT ring - one near you but not under you - glows white 0.8 s with a chime, she steps out stumbling: the opening */
  function startBlink(e) {
    const R0 = S.roof; R0.blinkCd = G.p2.blinkCd; e.mode = 'blinkTell'; e.modeT = G.p2.blinkTell; ctx.number(e.x, e.y - e.h - 12, '!', '#ffd36b'); sfx('portalOpen');
    ctx.burst(e.x, e.y - 24, 10, ['#b28cff', '#e8dcff'], 60, 0.4);
  }
  function pickExit(P0, minDx, noCupola, level) {
    /* (gq3fix) EVERY HERO MUST BE ABLE TO HIT HER: she steps out of a ring on the HERO'S OWN LEVEL (the deck rings for a hero on the deck, the parapet rings for one up there). The cupola's top, 96 px over the deck and two climbs away, is where she
       stood for her whole storm opening and her blinks - a blade could not reach her there (the melee heroes did 0 damage in P2 in three runs). */
    const all = rings().map(r => ({ r, p: ringPos(r) })).filter(o => !(noCupola && o.r.id === 'cu')), dv = o => Math.abs(o.p.y - P0.y), best = level ? Math.min(...all.map(dv)) : 1e9;   /* level: blink + storm only (the crown flies at the hero's chest height from any ring) */
    const rs = all.filter(o => dv(o) <= best + 8 && Math.abs(o.p.x - P0.x) >= minDx);   /* (the crown flies at chest height: it cannot come out of the cupola's stone) */
    if (!rs.length) { const lv = all.filter(o => dv(o) <= best + 8).sort((a, b) => Math.abs(b.p.x - P0.x) - Math.abs(a.p.x - P0.x)); return lv[0] || (rings()[0] ? { r: rings()[0], p: ringPos(rings()[0]) } : null); }
    rs.sort((a, b) => Math.abs(a.p.x - P0.x) - Math.abs(b.p.x - P0.x)); return rs[Math.floor(Math.random() * Math.min(2, rs.length))];
  }
  function blinkGo(e) {
    const R0 = S.roof, P0 = ctx.P(), ex = pickExit(P0, 60, false, true); if (!ex) { e.mode = 'rec'; e.modeT = 0.5; return; }
    ctx.burst(e.x, e.y - 24, 14, ['#3a2a4a', '#7a4aa0', '#c9a0ff'], 80, 0.5); e.hidden = true; e.vx = 0; e.mode = 'blinkGone'; e.modeT = G.p2.blinkGone + 5;
    R0.blink = { ring: ex.r.id, x: ex.p.x, y: ex.p.y, at: now() + G.p2.blinkGlow, kind: 'blink' }; sfx('portalOpen');
  }
  H.roofStep = (e, dt) => {
    if (!S) return undefined;
    if (!S.roof) roofBegin(e);
    const R0 = S.roof, P0 = ctx.P(), RA = L().arena, d = P0.x - e.x, ad = Math.abs(d), tt = now();
    if (R0.q4) { const P4 = R0.q4; P4.volleyCd -= dt; P4.boulderCd -= dt; P4.rockCd -= dt; P4.mtnCd -= dt; if (P4.ward && now() >= P4.ward) P4.ward = 0; }
    R0.lashCd -= dt; R0.ambushCd -= dt; R0.geyserCd -= dt; R0.leapCd = (R0.leapCd ?? 3) - dt; R0.blinkCd -= dt;   /* (gq3fix) THE BLINK CLOCK WAS NEVER RUN DOWN: blinkCd started at 3 and only the blink itself reset it, so the P2 blink (and its stumble opening) never fired in any run - melee heroes, who wait for openings, had none */
    if (R0.q4) { const qw = q4Mode(e, dt); if (qw !== undefined) return qw; }
    switch (e.mode) {
      case 'wake': if (e.modeT <= 0) { e.mode = 'roofStand'; e.modeT = 0.6; roofMus(1); ctx.number(e.x, e.y - 70, 'THE TOWER TOP', '#ffd36b'); } return 0;
      case 'roofStand': case 'stand': {
        e.mode = 'roofStand'; e.face = sign(d) || e.face;
        const want = ad > 56 ? e.face * 62 : 0;
        if (e.modeT <= 0 && !P0.dead && R0.q4 && q4Choose(e, ad)) return 0;
        if (e.modeT <= 0 && !P0.dead) {
          const hpk = e.hp / e.maxHp, stormUp = hpk < G.p2.desperate && !R0.pstorm && tt >= (R0.stormAt ?? 0);
          if (stormUp) { e.mode = 'stormTell'; e.modeT = G.p2.stormTell; R0.stormAt = tt + G.p2.stormEvery; ctx.number(e.x, e.y - e.h - 12, '!', '#ffd36b'); sfx('callerChant'); }
          else if (R0.blinkCd <= 0 && R0.last !== 'blink' && ad > 50) { R0.last = 'blink'; startBlink(e); }
          else if (R0.geyserCd <= 0 && ad < 280) { R0.last = 'geyser'; startGeyser(e); }
          else if ((e.crownCd ?? 3) <= 0 && ad > 60) { R0.last = 'crown'; roofCrown(e); }
          else if (R0.lashCd <= 0 && ad < G.roof.lashReach) { R0.last = 'lash'; startLash(e); }
          else if (R0.leapCd <= 0 && ad > 70) { R0.last = 'leap'; startLeap(e); }
        }
        return want; }
      case 'lashHighTell': case 'lashLowTell': e.face = sign(d) || e.face;
        if (e.modeT <= 0) {
          const high = e.mode === 'lashHighTell'; e.mode = high ? 'lashHigh' : 'lashLow'; e.modeT = 0.3; sfx('slash'); ctx.shake(3); R0.whip = { t0: tt, high, face: e.face };
          seats(P1 => { const d1 = P1.x - e.x, front = sign(d1) === e.face && Math.abs(d1) < G.roof.lashReach;   /* (claude/gq2) every seat in front of her */
            if (front && !P1.dead && (high ? !ctx.ducking() : P1.y > RA.floor - 6)) gqRed(e.x, G.roof.lashDmg, 'HER BANNER LASH', {}); });
        }
        return 0;
      case 'lashHigh': case 'lashLow': if (e.modeT <= 0) { e.mode = 'rec'; e.modeT = 0.5; } return 0;
      case 'ambushTell': {
        e.alpha = Math.max(0.15, e.modeT / G.roof.ambushTell);
        if (Math.random() < dt * 50) ctx.part({ x: R0.ambushX + (Math.random() - 0.5) * 14, y: RA.floor - Math.random() * 28, vx: 0, vy: -20, life: 0.4, max: 0.4, col: '#c9a0ff', size: 2, grav: 0, glow: true });
        if (e.modeT <= 0) {
          ctx.burst(e.x, e.y - 26, 14, ['#3a2a4a', '#7a4aa0'], 60, 0.5); e.x = R0.ambushX; e.y = RA.floor; e.vy = 0; e.vx = 0; e.alpha = 1; e.face = sign(P0.x - e.x) || 1;
          ctx.burst(e.x, e.y - 26, 16, ['#3a2a4a', '#c9a0ff'], 70, 0.5); e.mode = 'ambushOut'; e.modeT = 0.32; sfx('snort');
          seats(P1 => { if (!P1.dead && P1.ground && Math.abs(P1.x - e.x) < 64) gqHit(e.x, G.roof.ambushDmg, e, 'HER AMBUSH'); });   /* (claude/gq2) every seat */   /* yellow: turned on the beat, it pays a riposte */
        }
        return 0; }
      case 'ambushOut': e.alpha = 1; if (e.modeT <= 0) { e.mode = 'rec'; e.modeT = 0.6; } return 0;
      case 'geyserTell': e.face = sign(R0.geysers.length ? R0.geysers[0].x - e.x : d) || e.face; if (e.modeT <= 0) { e.mode = 'geyser'; e.modeT = G.roof.geyserN * G.roof.geyserGap + 0.5; ctx.shake(5); sfx('forgeHammer'); } return 0;
      case 'geyser': if (e.modeT <= 0) { e.mode = 'rec'; e.modeT = 0.6; } return 0;
      case 'stormTell': e.face = sign(d) || e.face;   /* DESPERATION: the portal storm */
        if (e.modeT <= 0) { R0.pstorm = { i: 0, at: tt + 0.3, shard: [] }; roofMus(2); e.mode = 'stormFire'; e.modeT = 99; sfx('callerBlast'); ctx.ring(e.x, e.y - 30, 30, '#ffd36b', 0.4); ctx.shake(5);
          const idle = R0.bays.map((b, i) => i).filter(i => R0.bays[i].state === 'idle'); for (let k = 0; k < G.p2.stormBays && idle.length; k++) lightBay(R0, idle.splice(Math.floor(Math.random() * idle.length), 1)[0], tt); }
        return 0;
      case 'stormFire': return 0;   // roofUpdate runs the five rings; it ends in stormOpen
      case 'stormOpen': e.vx = 0; if (e.modeT <= 0) { e.mode = 'rec'; e.modeT = 0.6; ctx.shake(3); sfx('bellow'); } return 0;
      case 'blinkTell': e.face = sign(d) || e.face; if (e.modeT <= 0) { blinkGo(e); } return 0;
      case 'blinkGone': e.vx = 0; return 0;   // roofUpdate: the exit ring glows, then she steps out
      case 'stumble': e.vx = 0; if (e.modeT <= 0) { e.mode = 'rec'; e.modeT = 0.6; } return 0;
      case 'hallLeapTell': if (e.modeT <= 0) { const T0 = 0.75; e.vx = (e.tx - e.x) / T0; e.vy = -500 * T0; e.mode = 'hallLeap'; e.modeT = T0 + 0.8; e.airT = 0; sfx('leap'); ctx.dust(e.x, e.y, 10); } return 0;
      case 'hallLeap': e.airT += dt;
        if ((e.onGround && e.airT > 0.2) || e.modeT <= 0) { e.vx = 0; e.mode = 'quake'; e.modeT = 0.45; sfx('forgeHammer'); sfx('heavy'); ctx.shake(9); ctx.zoom(1.08, 0.25); ctx.dust(e.x, e.y, 18);
          for (const dd of [-1, 1]) ctx.wave({ x: e.x + dd * 30, y: RA.floor, dir: dd, life: 1.4, sp: 190, royal: true });
          seats(P1 => { if (!P1.dead && P1.ground && Math.abs(P1.x - e.x) < 70 && Math.abs(P1.y - e.y) < 30) gqRed(e.x, 20, 'HER STOMP', { up: true }); }); }   /* (claude/gq2) every seat */
        return 0;
      case 'quake': if (e.modeT <= 0) { e.mode = 'rec'; e.modeT = 0.45; } return 0;
      case 'rec': case 'slamRec': if (e.modeT <= 0) { e.mode = 'roofStand'; e.modeT = 0.5; } return 0;
    }
    const w = H.mode(e, dt);   /* the crown toss, the fetch, the portal cast, the stun: shared with the hall */
    if (w !== undefined) return w;
    return 0;
  };
  /* every frame of phase two: the geysers, the crown storm, the hatch and its guards */
  function roofUpdate(dt) {
    const e = q(), R0 = S.roof, P0 = ctx.P(), RA = L().arena, tt = now(); if (!e || !R0 || e.stage !== 'roof') return;
    for (const g of R0.geysers) {
      if (!g.done && tt >= g.at) { g.done = true; g.until = tt + 0.28; ctx.dust(g.x, RA.floor, 6); ctx.burst(g.x, RA.floor - 6, 10, ['#5a5a68', '#8a5a32', '#ff9a5c'], 110, 0.5); sfx('crack'); }
      if (g.done && tt < g.until) seats(P1 => { const hs = g.hits || (g.hits = new Set()); if (!hs.has(P1) && !P1.dead && Math.abs(P1.x - g.x) < 11 && P1.y > RA.floor - 10) { hs.add(P1); g.hit = true; gqRed(g.x, G.roof.geyserDmg, 'THE RUBBLE GEYSER', { up: true }); } });   /* (claude/gq2) once a hero, every seat */
    }
    R0.geysers = R0.geysers.filter(g => tt < g.at + 0.6);
    // ---- the blink's exit: glowing white 0.8 s, then she steps out STUMBLING (the opening) ----
    if (R0.blink && tt >= R0.blink.at) {
      const b = R0.blink; R0.blink = null; e.hidden = false; e.x = b.x; e.y = b.y - 1; e.vx = 0; e.vy = 0; e.face = sign(P0.x - e.x) || e.face; e.gqOpenTaken = 0;
      e.mode = 'stumble'; e.modeT = G.p2.stumble; if (Q4) { e.mode = 'rec'; e.modeT = 0.4; }   /* (claude/gq4q) BLINK IS MOVEMENT ONLY: no stumble opening */
      ctx.burst(b.x, b.y - 22, 16, ['#fff6c8', '#e8dcff', '#b28cff'], 90, 0.5); ctx.ring(b.x, b.y - 20, 22, '#fff6c8', 0.35); sfx('callerBlast'); ctx.number(b.x, b.y - 46, 'SHE STEPS OUT', '#8fd160');
    }
    // ---- REINFORCEMENTS at 80 / 55 / 30%: a green ring and a horn, two goblins drop (never more than two alive) ----
    for (const k of G.roof.addAt) {
      if (e.hp <= e.maxHp * k && !R0.adds.has(k)) {
        R0.adds.add(k); const rs = rings(), r = rs[Math.floor(Math.random() * rs.length)]; if (!r) continue;
        R0.reinf = { ring: r, at: tt + G.p2.addGlow }; const p = ringPos(r); ctx.number(p.x, p.y - 40, '!', '#8fd160'); sfx('portalOpen'); sfx('callerBlast'); ctx.shake(3);
      }
    }
    if (R0.reinf && tt >= R0.reinf.at) {
      const r = R0.reinf.ring; R0.reinf = null; const alive = ctx.enemies().filter(q2 => q2.alive && q2 !== e && !q2.mini && (q2.t === 'soldier' || q2.t === 'javelin') && Math.abs(q2.x - e.x) < 900).length;
      if (alive < G.p2.addMax) {
        const kinds = ['soldier', 'javelin']; let seats0 = 0; seats(() => seats0++); if (seats0 >= 3) kinds.push('soldier');
        kinds.slice(0, Math.max(0, G.p2.addMax - alive) + (seats0 >= 3 ? 1 : 0)).forEach((t0, i) => ctx.spawnEnt({ t: t0, x: r.x + (i ? 1 : -1), y: r.y, face: Math.sign(P0.x - (r.x * TS)) || 1 }));
        const p = ringPos(r); ctx.burst(p.x, p.y - 14, 14, ['#8fd160', '#e8ffd0', '#5a8a3a'], 80, 0.5); sfx('gateDrop'); ctx.number(p.x, p.y - 44, 'REINFORCEMENTS', '#8fd160');
      }
    }
    // ---- THE BURNING BAYS: one every 9 s (A, C, B, D): smoke 1.5 s, burn 6 s (3 hp / 0.8 s and a push up: spare, never kills) ----
    R0.bayT -= dt;
    if (R0.bayT <= 0) { R0.bayT = G.p2.bayEvery; lightBay(R0, G.p2.bayOrder[R0.bayNext % 4], tt); R0.bayNext++; }
    R0.bays.forEach((b, i) => {
      if (b.state === 'smoke' && tt >= b.at) { b.state = 'burn'; sfx('crack'); }
      else if (b.state === 'burn' && tt >= b.until) { b.state = 'idle'; return; }
      if (b.state !== 'burn') return; const sp = bays()[i]; if (!sp) return;
      seats(P1 => { if (!P1.dead && P1.ground && P1.y >= RA.floor - 3 && P1.x >= sp[0] * TS && P1.x <= (sp[1] + 1) * TS) {
        P1.gqFireT = (P1.gqFireT ?? 0.4) - dt; if (P1.gqFireT <= 0) { P1.gqFireT = G.esc.fireEvery; gqRed(P1.x, G.esc.fire, 'THE BURNING ROOF', { spare: true, noKnock: true }); P1.vy = -G.esc.push; P1.ground = false; ctx.burst(P1.x, RA.floor - 2, 6, ['#ff9a5c', '#ffd36b', '#ff6b2c'], 60, 0.4); } } });
    });
    // ---- DESPERATION: the portal storm - the five rings light in order and each fans three shards; she stumbles out of the cupola ring ----
    const ps = R0.pstorm;
    if (ps) {
      const rs = rings().filter(r => !r.noStorm);
      if (ps.i < rs.length && tt >= ps.at) { const r = rs[ps.i], p = ringPos(r), tg = target(); ps.lit = { id: r.id, until: tt + 0.35 }; fan(p.x, p.y - 14, tg.x, tg.y - 8, true); ps.i++; ps.at = tt + G.p2.stormStep; sfx('portalOpen'); }
      else if (ps.i >= rs.length && tt >= ps.at) {
        R0.pstorm = null; const cu = (pickExit(P0, 40, false, true) || {}).r || rs[rs.length - 1], cp = ringPos(cu);   /* (gq3fix) a ring on your level, not the cupola's top */
        e.x = cp.x; e.y = cp.y - 1; e.vx = 0; e.vy = 0; e.hidden = false; e.mode = 'stormOpen'; e.modeT = G.p2.stormOpen; e.gqOpenTaken = 0;
        ctx.burst(cp.x, cp.y - 22, 18, ['#fff6c8', '#e8dcff', '#b28cff'], 100, 0.6); ctx.ring(cp.x, cp.y - 20, 26, '#fff6c8', 0.4); sfx('callerBlast'); ctx.number(cp.x, cp.y - 48, 'SHE STUMBLES OUT: STRIKE', '#8fd160');
      }
    }
  }
  /* THE CROWN STORM (under 30%): her crown circles her (r 40, a turn in 1.2 s), touch 12. PARRY it once: it breaks into her - STUNNED 4.0 s + 6% - and the storm ends; it re-forms after 12 s. */
  function stormStep(dt) {
    const e = q(), R0 = S.roof, P0 = ctx.P(), cc = G.roof; if (!e || !R0 || !R0.storm) return;
    const st = R0.storm; st.ang += dt * Math.PI * 2 / cc.orbitTurn;
    const x = e.x + Math.cos(st.ang) * cc.orbitR, y = e.y - 30 + Math.sin(st.ang) * cc.orbitR * 0.55, vx = -Math.sin(st.ang);
    st.x = x; st.y = y; if (Math.random() < dt * 30) ctx.part({ x, y, vx: 0, vy: 0, life: 0.25, max: 0.25, col: '#ffd36b', size: 1, grav: 0, glow: true });
    seats(P1 => {   /* (claude/gq2) every seat */
      if (P1.dead || now() < st.hitAt || R0.storm !== st) return;
      if (ctx.overlap({ l: x - G.crown.r - 1, r: x + G.crown.r + 1, t: y - G.crown.r, b: y + G.crown.r }, ctx.hurtBox())) {
        st.hitAt = now() + cc.orbitHit;
        const h = gqHit(x - sign(vx) * 12, cc.orbitDmg, e, 'HER CROWN STORM');
        if (h.parried) { R0.storm = null; R0.stormAt = now() + cc.stormRegrow; ctx.ring(x, y, 16, '#fff6c8', 0.3); stun(e, cc.stormStun, cc.stormHp, GQ_SAY.crowned); }
      }
    });
  }
  H.test = H.test || {}; H.test.roof = () => S && S.roof; H.test.geode = () => S && S.geode; H.test.esc = () => S && S.esc; H.test.crown = () => S && S.crown; H.test.geodeBits = () => (S ? S.geodeBits : []);
  H.test.begin = () => { const e = q(); if (e && S) roofBegin(e); };
  /* the hall portals' (and the escape's) fan of shards: three, +-14 deg, at the spot given, yellow and blockable; a parry only clanks here (nobody to send it back to) */
  function fan(px, py, tx, ty, esc) {
    const pc = G.portal, base = Math.atan2(ty - py, tx - px), sv = esc ? G.esc.shardV : pc.v, nf = esc ? G.esc.shards : pc.fan;
    for (let k = 0; k < nf; k++) { const a = base + (k - (nf - 1) / 2) * pc.spread * Math.PI / 180; S.rocks.push({ x: px, y: py, vx: Math.cos(a) * sv, vy: Math.sin(a) * sv, t: 0, dead: false, home: false, cast: null, esc: !!esc, id: 'r' + (++S.rid) }); }
    ctx.burst(px, py, 8, ['#b28cff', '#e8dcff', '#8a8a9c'], 60, 0.4); sfx('crack');
  }

  /* ---------------- THE CROWN (her boomerang) ---------------- */
  /* tell 0.8 s (the crown lifted, a glint, the caller's chant), then a boomerang at chest height: out 230 px/s to 210 px or a wall, a breath, back 260 px/s. Blockable; duck, jump or roll it.
     PARRIED on either pass: it flies home at 340 px/s and she is STUNNED. A plain block only knocks it to the floor: she walks to fetch it (bare-headed, not open). */
  function launchCrown(e, P0) {
    const c = G.crown, dir = sign(P0.x - e.x);
    e.face = dir; e.crownOut = true;
    if (e.stage === 'roof') {   /* (gq3 item 6) CROWN THROUGH A PORTAL: into a ring, out of another - the exit glows GOLD 0.6 s, then chest height toward you at 260 px/s (parry it: STUNNED) */
      const ex = pickExit(P0, G.p2.crownMinDx, true), p = ex ? ex.p : { x: e.x + dir * 24, y: e.y }, d2 = sign(P0.x - p.x);
      S.crown = { x: p.x, y: P0.y - c.dy, x0: p.x, vx: d2 * G.p2.crownV, dir: d2, state: 'ringwait', ring: ex ? ex.r.id : null, at: now() + G.p2.crownGlow, t: 0, hit: false, pass: 1, home: false, portal: true, id: 'c' + (++S.rid) };
      sfx('throwWhoosh'); sfx('portalOpen'); ctx.burst(e.x + dir * 12, e.y - 54, 8, ['#ffd36b', '#fff6c8'], 50, 0.3); return;
    }
    S.crown = { x: e.x + dir * 24, y: P0.y - c.dy, x0: e.x + dir * 24, vx: dir * c.out, dir, state: 'out', t: 0, hit: false, pass: 1, home: false, id: 'c' + (++S.rid) };
    sfx('throwWhoosh');
  }
  function crownStep(dt) {
    const c = S.crown, e = q(), P0 = ctx.P(), cc = G.crown;
    if (!c) return;
    if (!e) { S.crown = null; return; }
    c.t += dt; c.spin = (c.spin || 0) + dt * 14;
    if (c.state === 'ringwait') { c.y = ctx.P().y - G.crown.dy; if (now() >= c.at) { c.state = 'out'; c.t = 0; c.x0 = c.x; c.dir = sign(ctx.P().x - c.x) || c.dir; c.vx = c.dir * G.p2.crownV; sfx('callerBlast'); ctx.ring(c.x, c.y, 16, '#ffd36b', 0.3); } return; }
    if (Math.random() < dt * 30) ctx.part({ x: c.x, y: c.y, vx: 0, vy: 0, life: 0.25, max: 0.25, col: '#ffd36b', size: 1, grav: 0, glow: true });
    if (c.state === 'out') {
      c.x += c.vx * dt;
      if (c.portal) { if (Math.abs(c.x - c.x0) >= G.p2.crownReach || ctx.solid(Math.floor((c.x + c.dir * 6) / TS), Math.floor(c.y / TS))) { S.crown = null; e.crownOut = false; ctx.ring(c.x, c.y, 14, '#c9c9d6', 0.25); sfx('clank'); return; }   /* a portal crown does not come back: it is spent where it ends */ }
      else if (Math.abs(c.x - c.x0) >= cc.reach || ctx.solid(Math.floor((c.x + c.dir * 6) / TS), Math.floor(c.y / TS))) { c.state = 'hang'; c.t = 0; c.vx = 0; }
    } else if (c.state === 'hang') {
      if (c.t >= cc.hang) { c.state = 'back'; c.vx = -c.dir * cc.back; c.hit = false; c.pass = 2; sfx('throwWhoosh'); }
    } else if (c.state === 'back') {
      c.x += c.vx * dt;
      if (Math.abs(c.x - e.x) < 16 || (c.x - e.x) * c.dir < 0) { S.crown = null; e.crownOut = false; ctx.ring(e.x, e.y - 52, 18, '#e0b040', 0.25); sfx('clank'); return; }
    } else if (c.state === 'home') {
      const dx = e.x - c.x, dy = (e.y - 52) - c.y, dd = Math.hypot(dx, dy) || 1, sp = cc.home * dt;
      if (dd <= sp + 10) { S.crown = null; e.crownOut = false; stun(e, e.stage === 'roof' ? G.stunRoof : cc.stun, cc.stunHp, GQ_SAY.crowned); return; }
      c.x += dx / dd * sp; c.y += dy / dd * sp;
    } else if (c.state === 'floor') {
      return;
    }
    if ((c.state === 'out' || c.state === 'back') && !c.hit) seats(P0 => {   /* (claude/gq2) every seat: the first hero it meets takes it (or parries it) */
      if (c.hit || P0.dead || S.crown !== c || !(c.state === 'out' || c.state === 'back')) return;
      const hb = ctx.hurtBox();
      if (ctx.overlap({ l: c.x - cc.r - 1, r: c.x + cc.r + 1, t: c.y - cc.r + 1, b: c.y + cc.r - 1 }, hb)) {
        c.hit = true;
        const h = gqHit(c.x - sign(c.vx) * 12, cc.dmg, e, 'HER CROWN');
        if (h.parried) {
          if (now() < S.stunGuardUntil || e.mode === 'stunned') { ctx.number(P0.x, P0.y - 34, GQ_SAY.clank, '#ffd36b'); S.crown = null; e.crownOut = false; sfx('clank'); }
          else { c.state = 'home'; c.home = true; ctx.ring(c.x, c.y, 16, '#fff6c8', 0.3); sfx('clank'); }
        } else if (h.res === 'blocked') { c.state = 'floor'; c.vx = 0; c.y = Math.min(c.y + 10, (L().arena ? L().arena.floor : c.y) - 3); c.t = 0; sfx('clank'); ctx.dust(c.x, c.y, 6); ctx.number(c.x, c.y - 14, GQ_SAY.clank, '#c9c9d6'); }
      }
    });
  }
  /* ---------------- (gq3 item 5) THE GEODE LOB ---------------- */
  function geodeBegin(e) {
    const P0 = target(), A = L().arena, gc = G.geode;
    e.mode = 'geodeTell'; e.modeT = gc.tell; e.vx = 0; e.crownOut = false; e.face = sign(P0.x - e.x) || e.face;
    S.geode = { state: 'tell', t: 0, tx: P0.x, locked: false, id: 'g' + (++S.rid), fy: A.floor, hit: new Set(), key: {} };
    ctx.number(e.x, e.y - e.h - 12, '!', '#ffd36b'); sfx('geodeGrind');
  }
  function geodeTellStep(e, dt) {
    const Ge = S.geode, P0 = target(), gc = G.geode; e.vx = 0; if (!Ge) { e.mode = 'rec'; e.modeT = 0.5; return 0; }
    Ge.t += dt; e.face = sign(Ge.tx - e.x) || e.face;
    if (!Ge.locked) { Ge.tx = P0.x; if (Ge.t >= gc.track) { Ge.locked = true; Ge.tx = Math.max(L().arena.x0 + 12, Math.min(L().arena.x1 - 12, P0.x)); } }
    if (Math.random() < dt * 30) ctx.part({ x: e.x + e.face * 6 + (Math.random() - 0.5) * 12, y: e.y - 70 - Math.random() * 8, vx: 0, vy: -20, life: 0.4, max: 0.4, col: Math.random() < 0.5 ? '#b28cff' : '#e8dcff', size: 2, grav: 0, glow: true });
    if (e.modeT <= 0) {   // the release: a lob from over her head to the locked spot
      Ge.state = 'fly'; Ge.t = 0; Ge.x0 = e.x + e.face * 6; Ge.y0 = e.y - 62; Ge.x = Ge.x0; Ge.y = Ge.y0; Ge.spin = 0;
      e.mode = 'geodeThrow'; e.modeT = gc.throw; sfx('throwWhoosh');
    }
    return 0;
  }
  function geodeShatter(Ge, x, why) {
    const gc = G.geode; S.geode = null; ctx.burst(x, Ge.fy - 6, 14, ['#b28cff', '#e8dcff', '#8a8a9c'], 90, 0.6); sfx('golemShatter'); ctx.shake(4); ctx.dust(x, Ge.fy, 6);
    for (const dir of [-1, 1]) S.geodeBits.push({ x, x0: x, dir, id: 'b' + (++S.rid), fy: Ge.fy, hit: new Set(), dead: false });
    if (why) ctx.number(x, Ge.fy - 22, why, '#c9c9d6');
  }
  function geodeStep(dt) {
    const Ge = S.geode, e = q(), gc = G.geode; if (!Ge || Ge.state === 'tell') { if (Ge && (!e || e.mode !== 'geodeTell')) S.geode = null; return; }   /* a tell cut short (a stun, a flee): nothing is thrown */
    if (!e) { S.geode = null; return; }
    Ge.t += dt; Ge.spin = (Ge.spin || 0) + dt * 9;
    if (Ge.state === 'back') {   // flies home: the SENT BACK stun
      const dx = e.x - Ge.x, dy = (e.y - 40) - Ge.y, dd = Math.hypot(dx, dy) || 1, sp = gc.home * dt;
      if (dd <= sp + 12) { S.geode = null; if (stun(e, gc.stun, gc.stunHp, 'SENT BACK')) { /* stunned: the rock is spent */ } else { e.hp -= Math.round(e.maxHp * gc.clankHp); e.flash = 0.25; ctx.number(e.x, e.y - 60, GQ_SAY.clank, '#c9c9d6'); sfx('clank'); if (e.hp <= 0) ctx.hurt(e, 1, e.x); } return; }
      Ge.x += dx / dd * sp; Ge.y += dy / dd * sp; return;
    }
    const k = Math.min(1, Ge.t / gc.air); Ge.x = Ge.x0 + (Ge.tx - Ge.x0) * k; Ge.y = Ge.y0 + (Ge.fy - 6 - Ge.y0) * k - 4 * gc.apex * k * (1 - k);
    const box = { l: Ge.x - gc.r, r: Ge.x + gc.r, t: Ge.y - gc.r, b: Ge.y + gc.r };
    const sendBack = how => { Ge.state = 'back'; Ge.t = 0; ctx.ring(Ge.x, Ge.y, 14, '#c8f08a', 0.25); sfx('parry'); ctx.number(Ge.x, Ge.y - 14, how === 'parry' ? 'PARRIED: SENT BACK' : 'SENT BACK', '#8fd160'); };
    // any blow or shot that meets it in the air
    if (Q4) { if (Ge.state === 'fly' && strikes(box, Ge.key)) sendBack('blow'); }   /* (claude/gq4q) ANY blow or hero shot sends it back */
    else seats(P1 => { if (Ge.state !== 'fly' || P1.dead) return; if (hit(P1, box, Ge.key)) sendBack('blow'); });
    if (!Q4 && Ge.state === 'fly') for (const pp of (typeof ctx.players === 'function' ? ctx.players() : ctx.players) || []) for (const ar of pp.rgArrows || []) { if (Ge.state !== 'fly' || ar.state !== 'fly' || ar.ggHit) continue; if (Math.abs(ar.x - Ge.x) < gc.r + 10 && Math.abs(ar.y - Ge.y) < gc.r + 8) { ar.ggHit = true; ar.state = 'drop'; sendBack('blow'); } }
    if (Ge.state === 'fly' && k >= 1) {   // it lands: 18 (a parry sends it back from the floor), else it shatters
      let parried = false, hurtAny = false;
      seats(P1 => { if (parried || P1.dead || Math.abs(P1.x - Ge.tx) > 20 || P1.y < Ge.fy - 34) return; const r = gqHit(Ge.tx, gc.dmg, e, 'HER GEODE'); hurtAny = true; if (r.parried) parried = true; });
      if (parried) { Ge.y = Ge.fy - 8; sendBack('parry'); } else geodeShatter(Ge, Ge.tx, hurtAny ? '' : 'IT SHATTERS');
    }
  }
  function bitsStep(dt) {   // the two low shards running the floor 40 px each way: jump them (8)
    const gc = G.geode, e = q();
    for (const b of S.geodeBits) {
      if (b.dead) continue; b.x += b.dir * gc.shardV * dt;
      if (Math.abs(b.x - b.x0) >= gc.shardRun || ctx.solid(Math.floor((b.x + b.dir * 4) / TS), Math.floor((b.fy - 4) / TS))) { b.dead = true; continue; }
      seats(P1 => { if (b.hit.has(P1) || P1.dead || Math.abs(P1.x - b.x) > 7 || P1.y < b.fy - 7) return; b.hit.add(P1); gqHit(b.x, gc.shardDmg, e, 'A GEODE SHARD'); });
    }
    S.geodeBits = S.geodeBits.filter(b => !b.dead);
  }
  /* (claude/gq3art) THE GQ3 ART. Each call in art3(): any throw falls back to the greybox below for the rest of the session (and says so once). */
  let art3Off = false;
  const art3 = fn => { if (art3Off) return false; try { fn(); return true; } catch (err) { art3Off = true; console.warn('gq3 art off (greybox):', err && err.message); return false; } };
  function geodeArt(g, cx, cy, t) {
    const Ge = S.geode, e = q();
    if (Ge && (Ge.state === 'tell' || Ge.state === 'fly')) GQ3A.drawGeodeMark(g, Ge.tx - cx, Ge.fy - cy, !!Ge.locked, t);
    if (Ge && Ge.state === 'tell' && e) GQ3A.drawGeodeTell(g, e.x + e.face * 6 - cx, e.y - 76 - cy, t, Math.min(1, Ge.t / G.geode.tell));
    if (Ge && (Ge.state === 'fly' || Ge.state === 'back')) GQ3A.drawGeode(g, Ge.x - cx, Ge.y - cy, t, { spin: Ge.spin || 0, home: Ge.state === 'back', vx: Ge.state === 'back' ? (e ? e.x - Ge.x : 1) : (Ge.tx - Ge.x0), vy: Ge.state === 'back' ? 0 : -2 });
    let shown = false;
    for (const b of S.geodeBits) { GQ3A.drawGeodeBit(g, b.x - cx, b.fy - cy, b.dir, t); const run = Math.abs(b.x - b.x0); if (!shown && run < 16) { shown = true; GQ3A.drawGeodeShatter(g, b.x0 - cx, b.fy - cy, run / 16); } }
  }
  function towerArt(g, cx, cy, t) {
    const E = L().gqEscape, esc = S.esc; if (!E || !esc || !esc.on) return; const Tw = E.tower, F = Tw.FLOORS;
    const stepK = esc.step ? Math.min(1, (t - esc.step.t0) / G.esc.step) : 0;
    GQ3A.drawRoyalPortal(g, E.portal.x * TS + 8 - cx, E.portal.y * TS - 8 - cy, t, { state: 'idle', tint: esc.step ? 'white' : 'royal', s: 1 + 0.12 * stepK });
    if (!esc.inTower && !esc.step) return;
    const x0 = Tw.SHAFT[0] * TS - cx, x1 = (Tw.SHAFT[1] + 1) * TS - cx;
    for (let k = 1; k <= 4; k++) { const [a, b] = Tw.GAPS[k - 1]; GQ3A.drawStairwell(g, a * TS - cx, (b + 1) * TS - cx, F[k] * TS - cy); }
    esc.fl.forEach((f, k) => { const st = f.burning ? 'burn' : f.smokeAt ? 'smoke' : null; if (!st) return; const fy = F[k] * TS - cy;
      if (k >= 1) { const [a, b] = Tw.GAPS[k - 1]; GQ3A.drawTimberFloor(g, x0, a * TS - cx, fy, st, t, k); GQ3A.drawTimberFloor(g, (b + 1) * TS - cx, x1, fy, st, t, k + 4); }
      else GQ3A.drawTimberFloor(g, x0, x1, fy, st, t, k); });
    for (const b of esc.beams) { const bx = b.x - cx, fy = F[b.k] * TS - cy; if (b.state === 'tell') GQ3A.drawBeamTell(g, bx, fy, t); else GQ3A.drawBeamFall(g, bx, fy, Math.max(0, (b.at - t) / 0.3), t); }
    const qq = esc.q; if (qq.entry) GQ3A.drawShortcut(g, qq.entry.x - cx, qq.entry.y - 20 - cy, t);
    if (qq.flash && t < qq.flash.until) GQ3A.drawRoyalPortal(g, qq.flash.x - cx, qq.flash.y - 24 - cy, t, { state: 'snap', k: Math.max(0, (qq.flash.until - t) / 0.5), tint: 'white' });
    if (esc.vol) { const k = Math.min(1, 1 - (esc.vol.at - t) / G.esc.cue); GQ3A.drawRoyalPortal(g, esc.vol.px - cx, esc.vol.py - 6 - cy, t, { state: k < 0.35 ? 'open' : 'idle', k: k / 0.35, tint: k > 0.7 ? 'white' : 'royal', s: 0.7 }); }
  }
  /* the tower top's STATIC dressing (parapet walks, stone steps, the bell cupola, the hatch) and the bays / rings, in the order they stack */
  function deckArt(g, cx, cy, t, VW0) {
    const A0 = L().arenaRoof, Tw = A0 && A0.tower; if (!Tw || cx + VW0 < Tw.DECK.x0 * TS - 20 || cx > (Tw.DECK.x1 + 2) * TS) return;
    const P = Tw.PARAPETS, C = Tw.CUPOLA, fy = Tw.DECK.floor * TS - cy;
    GQ3A.drawParapetWalk(g, P.w[0], P.w[1], P.row, cx, cy, t); GQ3A.drawParapetWalk(g, P.e[0], P.e[1], P.row, cx, cy, t);
    GQ3A.drawStoneStep(g, P.stepW[0], P.stepW[1], P.stepRow, cx, cy); GQ3A.drawStoneStep(g, P.stepE[0], P.stepE[1], P.stepRow, cx, cy);
    GQ3A.drawCupola(g, C.x0, C.x1, C.solid[0], C.frame[0], C.frame[1], C.frame[2], cx, cy, t);
    if (S.hatchShut) GA.drawHatch(g, Tw.HATCH.cols[0] * TS - cx + 4, fy, false, t); else GQ3A.drawTowerHatch(g, Tw.HATCH.cols[0] * TS - cx, fy, t);
    const R0 = S.roof; Tw.BAYS.forEach((sp, i) => GQ3A.drawBay(g, sp[0] * TS - cx, (sp[1] + 1) * TS - cx, fy, R0 && R0.bays[i] ? R0.bays[i].state : 'idle', t, i));
  }
  function roofArt(g, cx, cy, t) {
    const R0 = S.roof; if (!R0) return;
    const cr = S.crown && S.crown.state === 'ringwait' ? S.crown : null, rf = R0.reinf, bl = R0.blink, ps = R0.pstorm;
    for (const r of rings()) { const p = ringPos(r); let col = '#5a3a8a', k = 0.35;
      if (bl && bl.ring === r.id) { col = '#fff6c8'; k = 0.5 + 0.5 * Math.min(1, 1 - (bl.at - now()) / G.p2.blinkGlow); }
      else if (cr && cr.ring === r.id) { col = '#ffd36b'; k = 0.5 + 0.5 * Math.min(1, 1 - (cr.at - now()) / G.p2.crownGlow); }
      else if (rf && rf.ring.id === r.id) { col = '#8fd160'; k = 0.5 + 0.5 * Math.min(1, 1 - (rf.at - now()) / G.p2.addGlow); }
      else if (ps && ps.lit && ps.lit.id === r.id && now() < ps.lit.until) { col = '#fff6c8'; k = 1; }
      GQ3A.drawRing(g, p.x - cx, p.y - 17 - cy, t, k, col); }
    const e = q(); if (e && (e.mode === 'stumble' || e.mode === 'stormOpen')) GA.drawStunStars(g, e.x - cx, e.y - 64 - cy, t);
  }
  function geodeDraw(g, cx, cy, t) {   // GREYBOX (the art is geodeArt above)
    if (art3(() => geodeArt(g, cx, cy, t))) return;
    const Ge = S.geode, e = q();
    if (Ge && (Ge.state === 'tell' || Ge.state === 'fly')) {   // the red ring on the floor where it will land
      const k = 0.5 + 0.5 * Math.sin(t * 16), lx = Math.round(Ge.tx - cx), ly = Math.round(Ge.fy - cy) - 1; g.globalAlpha = Ge.locked ? 0.9 : 0.5 + 0.2 * k; g.strokeStyle = '#ff6b6b'; g.lineWidth = 1; g.beginPath(); g.ellipse(lx, ly, 14, 3, 0, 0, 6.3); g.stroke(); if (Ge.locked) { g.beginPath(); g.ellipse(lx, ly, 8, 2, 0, 0, 6.3); g.stroke(); } g.globalAlpha = 1; }
    if (Ge && Ge.state === 'tell' && e) { portalDraw(g, e.x + e.face * 6 - cx, e.y - 72 - cy, t, Math.min(1, Ge.t / 0.5), '#b28cff'); const gx = Math.round(e.x + e.face * 6 - cx), gy = Math.round(e.y - 66 - cy + 6 * (1 - Math.min(1, Ge.t / G.geode.tell))); g.fillStyle = '#7a4aa8'; g.fillRect(gx - 3, gy - 3, 6, 6); g.fillStyle = '#e8dcff'; g.fillRect(gx - 1, gy - 1, 2, 2); }
    if (Ge && (Ge.state === 'fly' || Ge.state === 'back')) { const x = Math.round(Ge.x - cx), y = Math.round(Ge.y - cy); g.save(); g.translate(x, y); g.rotate(Ge.spin || 0); g.fillStyle = Ge.state === 'back' ? '#c8f08a' : '#7a4aa8'; g.fillRect(-5, -5, 10, 10); g.fillStyle = '#b28cff'; g.fillRect(-3, -3, 6, 6); g.fillStyle = '#e8dcff'; g.fillRect(-1, -4, 2, 3); g.restore(); }
    for (const b of S.geodeBits) { const x = Math.round(b.x - cx), y = Math.round(b.fy - cy); g.fillStyle = '#b28cff'; g.fillRect(x - 3, y - 5, 6, 5); g.fillStyle = '#e8dcff'; g.fillRect(x - 1, y - 5, 2, 2); }
  }
  /* ---------------- THE PORTAL CAST (rock shards) ---------------- */
  /* tell 1.0 s (the sceptre up), then 2 portals (3 in P1b) open at fixed hall-wall anchors at least 90 px from you; each glows 0.9 s with three faint fan lines, and they fire 0.35 s apart: a fan
     of three rock shards (+-14 deg) at the spot you stand on AT THE MOMENT IT FIRES, 210 px/s, yellow, blockable. A PARRIED shard homes on her (320 px/s): STUNNED 2.2 s; at most ONE stun a cast,
     and a return after that only clanks (1%). */
  function anchors() {
    const A = L().arena, out = [];
    for (const wx of [A.x0 + 4, A.x1 - 4]) for (const r of G.portal.rows) if (r % 2 === 0) out.push({ x: wx, y: r * TS + 8 });
    return out;
  }
  function openPortals(e, n) {
    const P0 = ctx.P(), pc = G.portal;
    let pool = anchors().map(a => ({ ...a, d: Math.hypot(a.x - P0.x, a.y - (P0.y - 8)) }));
    let ok = pool.filter(a => a.d >= pc.minDist);
    if (ok.length < n) ok = pool.sort((a, b) => b.d - a.d).slice(0, n);
    const picks = [];
    while (picks.length < n && ok.length) picks.push(ok.splice(Math.floor(Math.random() * ok.length), 1)[0]);
    const t0 = now();
    S.portals = picks.map((a, i) => ({ x: a.x, y: a.y, state: 'glow', t0, fireAt: t0 + pc.glow + i * pc.gap, fired: false, aimX: P0.x, aimY: P0.y - 8 }));
    S.cast = { n: picks.length, stunned: false, at: t0 };
    sfx('portalOpen'); sfx('callerChant');
    return pc.glow + (picks.length - 1) * pc.gap + 0.7;
  }
  function portalStep(dt) {
    const P0 = target(), pc = G.portal, t = now();   /* (claude/gq2) the hero she means (main.js: the nearest on his feet), not always seat one */
    for (const p of S.portals) {
      if (p.fired) { if (t - p.firedAt > 0.35) p.dead = true; continue; }
      p.aimX = P0.x; p.aimY = P0.y - 8;   /* the faint fan lines follow you until it fires */
      if (t >= p.fireAt) {
        p.fired = true; p.firedAt = t; p.state = 'fired';
        const base = Math.atan2(p.aimY - p.y, p.aimX - p.x);
        for (let k = 0; k < pc.fan; k++) { const a = base + (k - (pc.fan - 1) / 2) * pc.spread * Math.PI / 180; S.rocks.push({ x: p.x, y: p.y, vx: Math.cos(a) * pc.v, vy: Math.sin(a) * pc.v, t: 0, dead: false, home: false, cast: S.cast, id: 'r' + (++S.rid) }); }
        ctx.burst(p.x, p.y, 8, ['#b28cff', '#e8dcff', '#8a8a9c'], 60, 0.4); sfx('crack');
      } else if (Math.random() < dt * 26) ctx.part({ x: p.x + (Math.random() - 0.5) * 10, y: p.y + (Math.random() - 0.5) * 16, vx: 0, vy: -10, life: 0.3, max: 0.3, col: '#b28cff', size: 1, grav: 0, glow: true });
    }
    S.portals = S.portals.filter(p => !p.dead);
  }
  function rockStep(dt) {
    const e = q(), P0 = ctx.P(), pc = G.portal;
    if (!e) S.rocks = S.rocks.filter(r => r.esc);   /* nobody to send a parried shard home to */
    for (const r of S.rocks) {
      if (r.dead) continue;
      r.t += dt;
      if (Math.random() < dt * 24) ctx.part({ x: r.x, y: r.y, vx: 0, vy: 0, life: 0.2, max: 0.2, col: r.home ? '#fff6c8' : '#b28cff', size: 1, grav: 0, glow: true });
      if (r.hang > 0) {   // (claude/gq4q) a HANGING shard (a boulder's burst, the great geode's): strike it home or it fades
        r.hang -= dt; if (r.hang <= 0) { r.dead = true; ctx.burst(r.x, r.y, 4, ['#b28cff', '#8a8a9c'], 40, 0.3); continue; }
        if (!r.home && strikes({ l: r.x - Q4N.shardHurt, r: r.x + Q4N.shardHurt, t: r.y - Q4N.shardHurt, b: r.y + Q4N.shardHurt }, 'rk' + r.id)) { r.hang = 0; r.home = true; r.dead = false; ctx.ring(r.x, r.y, 12, '#fff6c8', 0.25); sfx('clank'); ctx.number(r.x, r.y - 14, 'STRUCK HOME', '#8fd160'); }
        if (!r.home) continue;
      }
      if (r.home) {
        const dx = e.x - r.x, dy = (e.y - 36) - r.y, dd = Math.hypot(dx, dy) || 1, sp = (r.p2 ? Q4N.p2.home : pc.home) * dt;
        if (dd <= sp + 12) {
          r.dead = true;
          if (r.p2) { r.arrived = true; shardHome(e, r); continue; }
          if (!(r.cast && r.cast.stunned) && stun(e, pc.stun, pc.stunHp, GQ_SAY.crowned)) { /* stunned: the shard is spent */ }
          else { e.hp -= Math.round(e.maxHp * pc.clankHp); e.flash = 0.25; ctx.number(e.x, e.y - 60, GQ_SAY.clank, '#c9c9d6'); sfx('clank'); if (e.hp <= 0) ctx.hurt(e, 1, e.x); }
          continue;
        }
        r.x += dx / dd * sp; r.y += dy / dd * sp; continue;
      }
      r.x += r.vx * dt; r.y += r.vy * dt;
      if (r.t > 4 || ctx.solid(Math.floor(r.x / TS), Math.floor(r.y / TS))) { r.dead = true; ctx.dust(r.x, r.y, 3); continue; }
      if (Q4 && !r.esc && !r.home && e) { const sh = Q4N.shardHurt;   /* (claude/gq4q) ANY blow or hero shot KNOCKS A P1 SHARD OUT (a parry still sends it home for the stun) and sends a P2 shard HOME */
        const hs = strikes({ l: r.x - sh, r: r.x + sh, t: r.y - sh, b: r.y + sh }, 'rk' + r.id);
        if (hs) { if (r.p2) { r.home = true; ctx.ring(r.x, r.y, 12, '#fff6c8', 0.25); sfx('clank'); ctx.number(r.x, r.y - 14, 'STRUCK HOME', '#8fd160'); } else { r.dead = true; ctx.burst(r.x, r.y, 10, ['#b28cff', '#e8dcff', '#8a8a9c'], 80, 0.5); sfx('golemShatter'); ctx.number(r.x, r.y - 14, 'KNOCKED OUT', '#8fd160'); S.knockedOut = (S.knockedOut || 0) + 1; if (Q4N.p1.knockChip) { e.hp = Math.max(1, e.hp - Math.round(e.maxHp * Q4N.p1.knockChip)); e.flash = 0.2; } }   /* (GQ4TUNE r3) a knocked-out shard pays a small chip (the report's rec): striking costs the bot the stun a parry gave */ continue; } }
      seats(P1 => {   /* (claude/gq2) every seat: the first hero it meets */
        if (r.dead || r.home || P1.dead || !ctx.overlap({ l: r.x - pc.r, r: r.x + pc.r, t: r.y - pc.r, b: r.y + pc.r }, ctx.hurtBox())) return;
        r.dead = true;
        const h = gqHit(r.x - sign(r.vx) * 12, r.dmg ?? (r.esc ? G.esc.shardDmg : pc.dmg), e, 'A PORTAL SHARD');
        if (h.parried && !r.esc && e) { r.dead = false; r.home = true; if (r.p2) r.glint = false; ctx.ring(r.x, r.y, 12, '#fff6c8', 0.25); sfx('clank'); }
        else if (h.parried) { ctx.ring(r.x, r.y, 12, '#c9c9d6', 0.25); sfx('clank'); }
        else { ctx.burst(r.x, r.y, 5, ['#b28cff', '#8a8a9c'], 50, 0.3); }
      });
    }
    S.rocks = S.rocks.filter(r => !r.dead);
  }

  /* she is bare-headed and only walks (no other attack) until the crown is back on: the fetch after a plain block */
  function fetchStep(e) {
    const c = S.crown;
    if (!c) { e.mode = 'rec'; e.modeT = 0.5; e.crownOut = false; return 0; }
    e.face = sign(c.x - e.x);
    if (e.modeT <= -2.5) { S.crown = null; e.crownOut = false; e.mode = 'rec'; e.modeT = 0.6; return 0; }   /* (crownfix) the fetch had no end: a crown on the far side of something she cannot cross held her in 'SHE FETCHES HER CROWN' for ever (a lab run sat 270 s, bar 100%). modeT starts at 4 and runs down: 2.5 s past zero she gives it up. */
    if (Math.abs(c.x - e.x) < 18 && c.t >= G.crown.fetch) { S.crown = null; e.crownOut = false; e.mode = 'rec'; e.modeT = 0.6; ctx.ring(e.x, e.y - 52, 18, '#e0b040', 0.25); sfx('clank'); return 0; }
    return Math.abs(c.x - e.x) < 18 ? 0 : e.face * 90;
  }

  /* ---------------- HER MODES (called from main.js updateGQueen's switch: returns the walk speed she wants, or undefined = not mine) ---------------- */
  H.mode = (e, dt) => {
    if (!S) return undefined;
    const P0 = ctx.P();
    switch (e.mode) {
      case 'crownTossTell':
        e.face = sign(P0.x - e.x) || e.face;
        if (Math.random() < dt * 24) ctx.part({ x: e.x + e.face * 6 + (Math.random() - 0.5) * 14, y: e.y - 58 - Math.random() * 8, vx: 0, vy: -26, life: 0.35, max: 0.35, col: '#fff6c8', size: 1, grav: 0, glow: true });
        if (e.modeT <= 0) { launchCrown(e, P0); e.mode = 'crownToss'; e.modeT = 6; }
        return 0;
      case 'crownToss':
        if (!S.crown) { e.mode = 'rec'; e.modeT = 0.5; e.crownOut = false; }
        else if (S.crown.state === 'floor') { e.mode = 'crownFetch'; e.modeT = 4; ctx.number(e.x, e.y - 70, GQ_SAY.fetch, '#c9c9d6'); }
        else if (e.modeT <= 0) { S.crown = null; e.crownOut = false; e.mode = 'rec'; e.modeT = 0.5; }
        return 0;
      case 'crownFetch': return fetchStep(e);
      case 'geodeTell': return geodeTellStep(e, dt);
      case 'geodeThrow': e.vx = 0; if (e.modeT <= 0) { e.mode = 'rec'; e.modeT = 0.6; } return 0;
      case 'lure': return lureStep(e, dt);
      case 'fireTell': case 'fireBurn': return G5 ? G5.mode(e, dt) : undefined;   /* (claude/gq5q1) THE THRONE FIRE */
      case 'portalTell':
        e.face = sign(P0.x - e.x) || e.face;
        if (Math.random() < dt * 30) ctx.part({ x: e.x + e.face * 10 + (Math.random() - 0.5) * 10, y: e.y - 66 - Math.random() * 10, vx: 0, vy: -24, life: 0.4, max: 0.4, col: '#b28cff', size: 2, grav: 0, glow: true });
        if (e.modeT <= 0) { e.mode = 'portalCast'; e.modeT = openPortals(e, e.stage === 'roof' ? G.portal.n : (e.phase >= 2 ? G.portal.n2 : G.portal.n)); }
        return 0;
      case 'portalCast':
        if (e.modeT <= 0) { e.mode = 'rec'; e.modeT = 0.5; }
        return 0;
      case 'hearthTell': { const h4 = g4(), hh = h4.hearth; e.vx = 0; if (!hh) { e.mode = 'rec'; e.modeT = 0.4; return 0; }
        if (Math.random() < dt * 40) ctx.part({ x: hh.src + (Math.random() - 0.5) * 16, y: L().arena.floor - 22 - Math.random() * 6, vx: 0, vy: -34, life: 0.5, max: 0.5, col: Math.random() < 0.5 ? '#6a6a78' : '#ff9a5c', size: 2, grav: 0, glow: true });
        if (e.modeT <= 0) { h4.jet = { t0: now(), src: hh.src, far: hh.far, hit: new Set() }; e.mode = 'hearthJet'; e.modeT = Q4N.hearth.jet + 0.2; sfx('callerBlast'); ctx.shake(4); } return 0; }
      case 'hearthJet': e.vx = 0; if (e.modeT <= 0) { e.mode = 'rec'; e.modeT = 0.8; } return 0;
      case 'reachTell': { const h4 = g4(), Rr = h4.reach, P1x = target(); e.vx = 0; if (!Rr) { e.mode = 'rec'; e.modeT = 0.4; return 0; }
        if (!Rr.locked) { Rr.px = P1x.x - (P1x.face || 1) * Q4N.reach.behind; Rr.py = P1x.y - 14; Rr.dir = sign(P1x.x - Rr.px) || Rr.dir; if (Q4N.reach.tell - e.modeT >= 0.5) Rr.locked = true; }
        if (e.modeT <= 0) { Rr.state = 'jab'; Rr.jabAt = now(); e.mode = 'reachJab'; e.modeT = 0.35; sfx('slash'); ctx.shake(3); } return 0; }
      case 'reachJab': e.vx = 0; if (e.modeT <= 0) { e.mode = 'rec'; e.modeT = 0.7; } return 0;
      case 'dazed': case 'jarred': { const dz = e.mode === 'dazed'; e.vx = 0;
        if (Math.random() < dt * 12) ctx.part({ x: e.x + (Math.random() - 0.5) * 30, y: e.y - 60 - Math.random() * 8, vx: 0, vy: -16, life: 0.5, max: 0.5, col: dz ? '#8fd160' : '#ffd36b', size: 2, grav: 0, glow: true });
        if (e.modeT <= 0) { e.mode = 'rec'; e.modeT = 0.6; ctx.shake(3); sfx('bellow'); if (dz && S.roof && S.roof.q4) { S.roof.q4.ward = now() + Q4N.p2.ward; ctx.number(e.x, e.y - 70, 'WARDED: SHARDS GLANCE', '#c9a0ff'); ctx.ring(e.x, e.y - 40, 34, '#c9a0ff', 0.5); } } return 0; }
      case 'stunned':
        e.vx = 0;
        if (Math.random() < dt * 12) ctx.part({ x: e.x + (Math.random() - 0.5) * 30, y: e.y - 60 - Math.random() * 8, vx: 0, vy: -16, life: 0.5, max: 0.5, col: '#ffd36b', size: 2, grav: 0, glow: true });
        if (e.modeT <= 0) { e.mode = 'rec'; e.modeT = 0.6; ctx.shake(3); sfx('bellow'); if (G5 && e.scorch) G5.scorchEnd(e); if (G52 && e.q52Down) G52.downEnd(e); }
        return 0;
    }
    return undefined;
  };
  /* her choice, called from 'stand' when she is free to act: true = it set her mode */
  H.choose = (e, ad) => {
    if (!S || e.crownOut || (e.stage && e.stage !== 'hall')) return false;
    const p2 = e.phase >= 2;
    if (G5 && inHall(e) && G5.fireWanted(e)) { G5.fireStart(e); return true; }   /* (claude/gq5q1) THE THRONE FIRE: the bell ready, the hoists down, no horn, first at 12 s then every 20 s */
    if (Q4 && inHall(e)) { const h4 = g4(), free = !S.mech.wave && !S.mech.lure && !S.geode && now() >= h4.gapUntil;   /* (claude/gq4q) the two new P1 moves, spaced by gapUntil */
      if (free && h4.hearthCd <= 0 && e.modeT <= 0 && ad > 40 && !p2) { hearthStart(e); return true; }
      if (free && h4.reachCd <= 0 && ad > Q4N.reach.minDist) { reachStart(e); return true; } }
    if ((e.crownCd ?? 3) <= 0 && ad > 60) {
      e.crownCd = p2 ? G.crown.cd2 : G.crown.cd; e.mode = 'crownTossTell'; e.modeT = G.crown.tell; ctx.number(e.x, e.y - e.h - 12, '!', '#ffd36b'); sfx('callerChant'); return true;
    }
    if ((e.portalCd ?? 6) <= 0 && ad > 40) {
      e.portalCd = p2 ? G.portal.cd2 : G.portal.cd; e.mode = 'portalTell'; e.modeT = G.portal.tell; ctx.number(e.x, e.y - e.h - 12, '!', '#ffd36b'); sfx('callerChant'); return true;
    }
    if ((e.geodeCd ?? 5) <= 0 && ad > G.geode.minDist && !S.geode && !S.mech.wave && !S.mech.lure && inHall(e)) { e.geodeCd = p2 ? G.geode.cd2 : G.geode.cd; geodeBegin(e); return true; }
    return false;
  };
  H.tick = (e, dt) => { if (!S) return; if (Q4 && S.h4) { S.h4.hearthCd -= dt; S.h4.reachCd -= dt; } e.crownCd = (e.crownCd ?? 3) - dt; e.portalCd = (e.portalCd ?? 6) - dt; e.geodeCd = (e.geodeCd ?? 5) - dt; };

  /* ---------------- (claude/gq2mech) THE BELL LURE and THE BARRACKS GATE (her hall only) ---------------- */
  const GM = G.mech;
  const inHall = e => !!(e && (!e.stage || e.stage === 'hall') && L().arena && L().arena.boss === 'gqueen');
  const bellProp = () => (ctx.bell ? ctx.bell() : null);
  const hit = (P1, box, key) => BW.struck(ctx.attackBox, ctx.overlap, P1, box, key);   /* (claude/highcrown3) the shared rule code, src/bell-winch.js */
  const winchAt = () => { const A = L().arena; return { x: A.x0 + GM.winchCol * TS + 8, y: A.floor }; };
  const safeToLure = e => ['stand', 'rec', 'slamRec', 'point', 'sceptreWait'].includes(e.mode) && !e.crownOut;
  /* a blow on the bell: she hears it (queued up to GM.queue s if she is mid-move) */
  function ringIt(e, b) {
    const M = S.mech, tt = now();
    if (BW.ringBell(M, tt, GM.bellCd, G5 ? 0 : GM.queue) === 'swinging') { ctx.number(b.x, b.y - 30, 'STILL SWINGING', '#c9c9d6'); sfx('clank'); return; }
    b.swingT = 1.4; b.swing = 0.8;
    if (G5) { G5.onRing(e, b); ctx.number(b.x, b.y - 30, 'THE HOISTS RISE', '#ffd36b'); } else ctx.number(b.x, b.y - 30, 'YOU RING THE BELL', '#ffd36b'); sfx('seaBell'); sfx('clank'); ctx.shake(2);
  }
  function lureBegin(e, b) {
    const M = S.mech, gx = b.gate * TS + 8;
    M.queued = 0; M.lure = { x: gx, state: 'wind', wind: GM.wind, wait: 0, hit: new Set() };   /* (gq3fix) a told WIND-UP before the charge: she plants and gathers (her slam-tell pose, dust, the bell glow) - the run's contact blow is never a surprise */
    e.mode = 'lure'; e.modeT = GM.lureMax + GM.wind; e.crownOut = false; e.face = sign(gx - e.x) || e.face;
    ctx.number(e.x, e.y - e.h - 12, '!!', '#ff6b6b'); ctx.number(e.x, e.y - 70, 'SHE HEARS IT', '#ff6b6b'); sfx('bellow'); sfx('callerChant');
  }
  /* the storm: a blockable charge at the sound (a parry on it stuns her, as on every told blow), then 0.9 s under the grate while its column glows, then the grate drops */
  function lureStep(e, dt) {
    const M = S.mech, Lu = M.lure, b = bellProp();
    if (!Lu || !b) { e.mode = 'rec'; e.modeT = 0.5; M.lure = null; return 0; }
    const dx = Lu.x - e.x; e.face = sign(dx) || e.face; e.luWind = Lu.state === 'wind' ? 1 : 0;
    if (Lu.state === 'wind') {
      Lu.wind -= dt; e.vx = 0; b.tellUntil = now() + 0.12; b.tellK = Math.max(0, 1 - Lu.wind / GM.wind) * 0.6;
      if (Math.random() < dt * 40) ctx.dust(e.x - e.face * 14, e.y, 1);
      if (Lu.wind <= 0) Lu.state = 'run';
      return 0;
    }
    if (Lu.state === 'run') {
      if (Math.abs(dx) < 8 || e.modeT <= 0) { Lu.state = 'wait'; Lu.wait = GM.tell; e.vx = 0; }
      else {
        const eta = Math.abs(dx) / GM.speed, glow = BW.grateGlow(eta, GM.tell); if (glow > 0) { b.tellUntil = now() + 0.12; b.tellK = glow; }
        if (Math.random() < dt * 50) ctx.dust(e.x - e.face * 20, e.y, 1);
        seats(P2 => {
          if (Lu.hit.has(P2) || P2.dead || Math.abs(P2.x - e.x) > GM.contactR || Math.abs(P2.y - e.y) > 34) return;
          Lu.hit.add(P2); const r = gqHit(e.x, GM.contact, e, 'HER CHARGE');
          if (r.parried) { M.lure = null; b.tellUntil = 0; stun(e, G.crown.stun, G.crown.stunHp, 'PARRIED HER CHARGE'); }
        });
        if (!M.lure) return 0;
        return sign(dx) * GM.speed;
      }
    }
    if (Lu.state === 'wait') {
      Lu.wait -= dt; b.tellUntil = now() + 0.12; b.tellK = 1 - Math.max(0, Lu.wait) / GM.tell;
      if (Math.random() < dt * 14) ctx.part({ x: Lu.x + (Math.random() - 0.5) * 14, y: b.gy0 * TS, vx: 0, vy: 30, life: 0.4, max: 0.4, col: '#c9c9d6', size: 1, grav: 200 });
      if (Lu.wait <= 0) dropGrate(e, b);
      return 0;
    }
    return 0;
  }
  function dropGrate(e, b) {
    const M = S.mech, Lu = M.lure, gx = Lu.x; M.lure = null; b.tellUntil = 0;
    if (ctx.grate) ctx.grate(GM.grateHold, 'lure');
    seats(P1 => { if (Math.abs(P1.x - gx) < 14 && P1.y > b.gy0 * TS && P1.y - 14 < (b.gy1 + 1) * TS) { ctx.damage(gx, ctx.slamDmg ? ctx.slamDmg() : 14, { up: true, unblockable: true, name: 'THE GRATE' }); P1.x = gx + (P1.x < gx ? -16 : 16); } });   /* you rang it: do not stand under it */
    if (Math.abs(e.x - gx) < GM.under && ctx.pin && ctx.pin(e, gx, 'lure', 'THE GRATE COMES DOWN ON HER', GM.pin)) { b.pinned = e; b.pinMode = 'pinned'; b.open = 9; M.pins++; }
    else { e.mode = 'rec'; e.modeT = 0.8; ctx.number(e.x, e.y - 70, 'SHE MISSED THE GRATE', '#c9c9d6'); }
  }
  const westGate = open => { if (ctx.westGate) ctx.westGate(open); };
  function startWave(e, k) {
    const M = S.mech, A = L().arena, w = winchAt(), idx = M.waves.size - 1;
    M.wave = BW.waveOpen(now(), GM.delay, { k, idx: Math.max(0, idx) });
    M.crank = 0; westGate(true);
    ctx.number(w.x, w.y - 44, 'CRANK THE WINCH', '#ffd36b'); ctx.number(A.x0 + 24, A.floor - 60, 'HER GUARDS COME', '#ff6b6b'); sfx('bellow'); ctx.shake(4);
    ctx.hint('HER BARRACKS GATE IS RISING. CRANK THE WINCH (3 BLOWS) BEFORE HER GUARDS COME THROUGH.');
  }
  function mechStep(dt) {
    const e = q(), M = S.mech, tt = now(); if (!e || !M || !inHall(e) || e.hidden) return;
    const b = bellProp();
    /* THE BELL: any seat's blow rings it */
    if (b && !b.broken) {
      const box = { l: b.x - 7, r: b.x + 7, t: b.y - 22, b: b.y };
      seats(P1 => { if (hit(P1, box, M.bellObj)) ringIt(e, b); });
      if (!G5 && !M.lure && BW.ringFresh(M, tt) && safeToLure(e) && !(b.open > 0)) lureBegin(e, b);   /* (claude/gq5q1) flag ON: the lure, the grate and her charge are gone */
    }
    /* THE BARRACKS GATE */
    const W0 = M.wave;
    if (!W0) {
      for (const k of GM.addAt) if (e.hp <= e.maxHp * k && !M.waves.has(k) && e.mode !== 'sleep' && e.mode !== 'wake') { if (G5 && !G5.waveMayOpen(e, k)) break; M.waves.add(k); startWave(e, k); break; }   /* (claude/gq5q1) THE THRONE FIRE opens each wave: its horn starts after the fire */
      return;
    }
    const A = L().arena, wx = winchAt();
    if (W0.state === 'open') {
      seats(P1 => { if (P1.x < A.x0 + 6) { P1.x = A.x0 + 6; P1.vx = Math.max(0, P1.vx || 0); } });   /* the door is open for her guards, not for you */
      seats(P1 => { if (W0.state === 'open' && hit(P1, { l: wx.x - 10, r: wx.x + 10, t: wx.y - 26, b: wx.y }, M.winchObj)) crank(W0); });
      const ev = BW.waveTick(W0, tt, GM.crankWin, GM.closeAfter); M.crank = W0.n || 0;
      if (ev === 'spawn') {
        const kinds = GM.guards[Math.min(W0.idx, GM.guards.length - 1)], col = Math.floor(A.x0 / TS) + 2;
        kinds.forEach((t, i) => ctx.spawnEnt({ t, x: col + i * 2, y: Math.floor(A.floor / TS) - 1, face: 1 }));
        M.joined++; ctx.number(A.x0 + 40, A.floor - 60, 'THE GUARDS ARE IN', '#ff6b6b'); sfx('gateDrop'); ctx.shake(3);
      }
    } else if (W0.state === 'in') {
      seats(P1 => { if (P1.x < A.x0 + 6) { P1.x = A.x0 + 6; P1.vx = Math.max(0, P1.vx || 0); } });
      if (BW.waveTick(W0, tt, GM.crankWin, GM.closeAfter) === 'close') { westGate(false); M.wave = null; }
    }
  }
  function crank(W0) {
    const M = S.mech, tt = now(), w = winchAt();
    const r = BW.crankWinch(W0, tt, GM.crank, GM.crankWin); M.crank = W0.n; sfx('clank'); ctx.shake(2);
    if (r === 'kept') { M.crank = 0; westGate(false); M.wave = null; M.kept++; ctx.number(w.x, w.y - 44, 'THE GATE DROPS: GUARDS KEPT OUT', '#8fd160'); sfx('gateDrop'); ctx.shake(5); ctx.burst(w.x, w.y - 12, 10, ['#8a8a9c', '#c9c9d6'], 70, 0.5); }
    else ctx.number(w.x, w.y - 40, M.crank + ' / ' + GM.crank, '#ffd36b');
  }
  /* greybox: the winch (a drum and a rope, wound as it is cranked) while a wave is up, and the barracks horn's count */
  function mechDraw(g, cx, cy, t) {
    const e = q(), M = S && S.mech; if (!e || !M || !inHall(e)) return;
    const W0 = M.wave, w = winchAt(), x = Math.round(w.x - cx), y = Math.round(w.y - cy);
    g.fillStyle = W0 && W0.state === 'open' ? '#5a4a30' : '#3a3a44'; g.fillRect(x - 6, y - 22, 12, 22); g.fillStyle = W0 && W0.state === 'open' ? '#ffd36b' : '#6a6a78'; g.fillRect(x - 9, y - 18, 18, 4); g.fillRect(x - 2, y - 26, 4, 8);
    if (W0 && W0.state === 'open') { const left = Math.max(0, W0.at - now()), A = L().arena; g.fillStyle = '#ff6b6b'; g.fillRect(Math.round(A.x0 - cx) + 2, Math.round(A.floor - cy) - 70, Math.round(Math.min(1, left / GM.delay) * 40), 3);
      g.fillStyle = '#ffd36b'; g.fillRect(x - 8, y - 32, 4 * M.crank + 1, 3); }
  }
  H.mechDraw = mechDraw;
  /* the LAB BOT's duty (src/lab.js): crank the winch while a wave is up, ring the bell when it is ready and she is free, then stand clear of the grate's column while she storms. null = no duty. */
  H.labDuty = P0 => {
    if (G52) { const e1 = q(); if (e1 && e1.stage === 'roof') return G52.labDuty(P0, e1); }   /* (claude/gq5q2) ring the rope when she hides in the bell */
    const e = q(), M = S && S.mech, b = bellProp(); if (!e || !M || !inHall(e) || !b) return null;
    const A = L().arena, w = winchAt(), gx = b.gate * TS + 8;
    if (M.wave && M.wave.state === 'open') return { x: w.x, face: sign(w.x - P0.x), swing: true, why: 'winch' };
    if (M.lure) return { x: Math.max(A.x0 + 24, Math.min(A.x1 - 24, gx + (P0.x < gx ? -80 : 80))), face: sign(e.x - P0.x), swing: false, why: 'clear' };
    if (G5) return G5.labDuty(P0, e, b, M);   /* (claude/gq5q1) ring on the fire's tell, climb the hoist beside her, plunge onto her */
    if (now() >= M.cd && safeToLure(e) && !(b.open > 0)) return { x: b.x + 18, face: -1, swing: true, why: 'bell' };
    return null;
  };
  H.mech = () => (S ? S.mech : null);
  Object.assign(H.test = H.test || {}, { geodeBegin: () => { const e = q(); if (e && S) geodeBegin(e); }, ringBell: () => { const e = q(), b = bellProp(); if (e && b && S) ringIt(e, b); } });

  /* ================= (claude/gq4q) GQ4Q: THE GEODE THRONE (P1) AND THE SHARD FIGHT (P2) - all behind src/gq4q.js's switch (Q4) =================
     P1: THE HEARTH JET (smoke + glow 1.0 s '!!', a jet along the floor 0.6 s at knee height: jump it or stand on a gallery) and THE SCEPTRE REACH (a portal behind you, white rim + chime 0.8 s '!', chest height:
     duck, roll, or PARRY it = STAGGERED 1.5 s). Her geode and her portal shards are struck out / sent back by ANY blow or hero shot (src/hero-strikes.js).
     P2: the STONE SHARDS you knock home are the damage (3% each, 6 inside 10 s = DAZED, then a 3 s WARD); SHARD VOLLEY, PORTAL BOULDER, ROCKFALL, THE BOMBARDMENT at 70 / 45%, blink = movement only, ENRAGE at 25% (THE MOUNTAIN FALLS). */
  const g4 = () => S.h4 || (S.h4 = { hearthCd: Q4N.hearth.firstCd, reachCd: 3, gapUntil: 0, hearth: null, jet: null, reach: null, side: 1 });
  const liveShards = () => S.rocks.filter(r => r.p2 && !r.dead).length;
  function addShard(o) { if (liveShards() >= Q4N.p2.capLive) return false; S.rocks.push({ x: 0, y: 0, vx: 0, vy: 0, t: 0, dead: false, home: false, cast: null, esc: false, p2: true, id: 'r' + (++S.rid), ...o }); return true; }
  /* her hall's galleries (one-way, 4 rows over the floor): the jet's answer. Laid at the boss's wake (and again after a reset clears them). */
  function layGalleries() {
    const e = q(); if (!Q4 || Q5 || !e || !inHall(e)) return; const A = L().arena, row = Math.round(A.floor / TS) - 4, x0t = Math.round(A.x0 / TS), x1t = Math.round(A.x1 / TS) - 1;
    if (L().grid && L().grid[row * L().W + x0t + 4] === 0) { ctx.tiles(row, x0t + 2, x0t + 7, 'lay'); ctx.tiles(row, x1t - 7, x1t - 2, 'lay');
      const fr = Math.round(A.floor / TS); for (const lx of [x0t + 8, x1t - 8]) for (let r = row; r < fr; r++) ctx.tiles(r, lx, lx, 'ladder'); }   /* (claude/gq4art) a ladder at each gallery's inner end (GQ4Q built them 4 rows up with none) */
  }
  G5 = Q5 ? makeGQ5Q1({ TS, ctx, L, q, now, seats, sfx, gqRed: (...a) => gqRed(...a), inHall, hearthXs: () => hearthXs(), mech: () => (S ? S.mech : null), geodeOn: () => !!(S && S.geode), bossOn: () => ctx.bossActive(),
    guard: v => (v === undefined ? (S ? S.stunGuardUntil : 0) : (S.stunGuardUntil = Math.max(S.stunGuardUntil, v))), markStun: d => { S.stunUntil = now() + d; }, gap: t => { const h4 = g4(); h4.gapUntil = Math.max(h4.gapUntil, t); },
    bell: bellProp, hearth: (g, x, fy, live, t) => GQ4A.drawHearth(g, x, fy, live, t, false), ward: (g, x, y, t) => GQ4A.drawWardShell(g, x, y, t), grate: () => hcGrateTiles(1) }) : null;   /* (claude/gq5q1) */
  G52 = Q52 ? makeGQ5Q2({ TS, ctx, L, q, now, seats, sfx, gqRed: (...a) => gqRed(...a), gqHit: (...a) => gqHit(...a), jarr: e => jarr(e), strikes: (b, k) => strikes(b, k), ringPos: r => ringPos(r), rings: () => rings(), lvlRings: n => lvlRings(n), pickExit: (...a) => pickExit(...a), target: () => target(), addShardRef: o => (addShard(o) ? S.rocks[S.rocks.length - 1] : null), setCrown: v => { S.crown = v; },
    R0: () => (S ? S.roof : null), lightBay: (R0, i, tt) => lightBay(R0, i, tt), art: GQ3A, stunGap: () => G.stunGuard,
    guard: v => (v === undefined ? (S ? S.stunGuardUntil : 0) : (S.stunGuardUntil = Math.max(S.stunGuardUntil, v))), markStun: d => { S.stunUntil = now() + d; } }) : null;   /* (claude/gq5q2) */
  H.q52 = () => G52; H.q52Ward = (e, fx) => (G52 ? G52.ward(e, fx) : false); H.q52Take = (e, dmg) => (G52 ? G52.take(e, dmg) : dmg);
  H.q5 = () => G5; H.q5Scorch = (e, plunge) => (G5 ? G5.onHurt(e, plunge) : false); H.q5Take = (e, dmg) => (G5 ? G5.take(e, dmg) : dmg);
  const hearthXs = () => { const A = L().arena, e = q(), tx = e && e.throneX; let ex = A.x1 - 3 * TS - 8; if (tx && Math.abs(ex - tx) < 84) ex = tx - 84; return [A.x0 + 3 * TS + 8, ex]; };   /* (GQ5FIX 11-12, Daniel still b: the geode throne's crystals were drawn over the east hearth gate - both stood at tile 858; the east hearth now stands 84 px (5 tiles) clear of the throne) */
  function hearthStart(e) {
    const A = L().arena, h4 = g4(), [wx, ex] = hearthXs(); h4.side = -h4.side; const src = h4.side > 0 ? wx : ex;
    h4.hearth = { src, far: src === wx ? A.x1 - 8 : A.x0 + 8 }; h4.hearthCd = Q4N.hearth.cd; h4.gapUntil = now() + 2.5;
    e.mode = 'hearthTell'; e.modeT = Q4N.hearth.tell; e.vx = 0; e.face = sign(src - e.x) || e.face; ctx.number(e.x, e.y - e.h - 12, '!!', '#ff6b6b'); sfx('bellow');
  }
  function reachStart(e) {
    const P0 = target(), h4 = g4(); h4.reachCd = Q4N.reach.cd; h4.gapUntil = now() + 2.0; h4.reach = { t0: now(), px: P0.x - (P0.face || 1) * Q4N.reach.behind, py: P0.y - 14, locked: false, dir: sign(P0.x - e.x) };
    e.mode = 'reachTell'; e.modeT = Q4N.reach.tell; e.vx = 0; e.face = sign(P0.x - e.x) || e.face; ctx.number(e.x, e.y - e.h - 12, '!', '#ffd36b'); sfx('seaBell');
  }
  function jarr(e) {   // a parried reach: her arm is jarred
    if (!e || e.mode === 'jarred' || e.mode === 'stunned' || now() < S.stunGuardUntil) return false;
    e.mode = 'jarred'; e.modeT = Q4N.reach.stagger; e.vx = 0; e.gqOpenTaken = 0; S.stunGuardUntil = now() + Q4N.reach.stagger + G.stunGuard; e.flash = 0.4;
    ctx.number(e.x, e.y - 70, 'STAGGERED', '#ffd36b'); ctx.ring(e.x, e.y - 40, 30, '#ffd36b', 0.4); ctx.burst(e.x, e.y - 52, 12, ['#ffd36b', '#fff6c8'], 90, 0.6); sfx('golemShatter'); ctx.shake(5); return true;
  }
  /* ---- P2 helpers ---- */
  const lvlRings = n => { const P0 = ctx.P(), out = [], used = new Set(); for (let k = 0; k < n * 4 && out.length < n; k++) { const ex = pickExit(P0, k < n ? 40 : 0, true, true); if (ex && !used.has(ex.r.id)) { used.add(ex.r.id); out.push(ex); } } return out; };
  function shardHome(e, r) {   // a shard reached her
    const R0 = S.roof, P4 = R0 && R0.q4; if (!P4) return;
    if (now() < P4.ward) { ctx.number(e.x, e.y - 60, 'GLANCES', '#c9c9d6'); ctx.ring(e.x, e.y - 40, 26, '#c9a0ff', 0.3); sfx('clank'); return; }
    e.hp -= Math.round(e.maxHp * Q4N.p2.shardPct); e.flash = 0.3; ctx.number(e.x, e.y - 60, 'STRUCK', '#ffd36b'); if (G52 && r && r.teach) G52.teachHome(e, r); ctx.burst(e.x, e.y - 40, 8, ['#ffd36b', '#fff6c8', '#b28cff'], 70, 0.4); sfx('parry'); P4.homes.push(now());
    if (e.mode === 'roofStand' || e.mode === 'rec') e.modeT = Math.max(e.modeT, Q4N.p2.flinch);
    P4.homes = P4.homes.filter(t => now() - t <= Q4N.p2.dazeWin); S.homeTotal = (S.homeTotal || 0) + 1;
    if (P4.homes.length >= Q4N.p2.dazeN && e.mode !== 'dazed' && e.hp > 0) daze(e);
    if (e.hp <= 0) ctx.hurt(e, 1, e.x);
  }
  function daze(e) {
    const P4 = S.roof.q4; P4.homes = []; e.mode = 'dazed'; e.modeT = Q4N.p2.daze; e.vx = 0; e.gqOpenTaken = 0; e.crownOut = false; if (P4.bomb) P4.bomb = null; S.dazes = (S.dazes || 0) + 1;
    ctx.number(e.x, e.y - 70, 'DAZED', '#8fd160'); ctx.ring(e.x, e.y - 40, 40, '#8fd160', 0.5); ctx.burst(e.x, e.y - 50, 16, ['#8fd160', '#e8ffd0', '#ffd36b'], 100, 0.7); sfx('golemShatter'); ctx.shake(7); ctx.zoom(1.08, 0.3);
  }
  function startVolley(e) {
    const R0 = S.roof, P4 = R0.q4, two = e.hp / e.maxHp < 0.6; P4.volleyCd = P4.rage ? Q4N.p2.volley.cdRage : (Q52 ? Q52N.volleyCd : Q4N.p2.volley.cd);
    P4.vol = { rings: lvlRings(two ? 2 : 1), at: now() + Q4N.p2.volley.tell }; e.mode = 'volleyTell'; e.modeT = Q4N.p2.volley.tell; ctx.number(e.x, e.y - e.h - 12, '!', '#ffd36b'); sfx('crack');
  }
  function volleyFire(e, v, glint) {
    const P0 = target(), P4 = S.roof.q4, V = Q4N.p2.volley; for (const o of (P4.vol ? P4.vol.rings : [])) { const p = ringPos(o.r), px = p.x, py = p.y - 14, base = Math.atan2(P0.y - 8 - py, P0.x - px);
      for (let k = 0; k < V.n; k++) { const a = base + (k - (V.n - 1) / 2) * G.portal.spread * Math.PI / 180; addShard({ x: px, y: py, vx: Math.cos(a) * (v || V.v), vy: Math.sin(a) * (v || V.v), dmg: V.dmg, glint: !!glint }); }
      ctx.burst(px, py, 8, ['#b28cff', '#e8dcff', '#8a8a9c'], 60, 0.4); }
    sfx('crack'); P4.volLit = { until: now() + 0.3, rings: P4.vol ? P4.vol.rings.map(o => o.r.id) : [] }; P4.vol = null;
  }
  function startBoulder(e) {
    const R0 = S.roof, P4 = R0.q4, P0 = target(), ex = lvlRings(1)[0]; if (!ex) { e.mode = 'rec'; e.modeT = 0.4; return; } P4.boulderCd = Q4N.p2.boulder.cd;
    const p = ringPos(ex.r); P4.boulder = { state: 'tell', ring: ex.r.id, x0: p.x, y0: p.y - 14, tx: P0.x, t: 0, locked: false }; e.mode = 'boulderTell'; e.modeT = Q4N.p2.boulder.tell; ctx.number(e.x, e.y - e.h - 12, '!', '#ffd36b'); sfx('geodeGrind');
  }
  function startRockfall(e) {
    const P4 = S.roof.q4; P4.rockCd = Q4N.p2.rockfall.cd; e.mode = 'rockfallTell'; e.modeT = Q4N.p2.rockfall.tell; e.vx = 0; ctx.number(e.x, e.y - e.h - 12, '!!', '#ff6b6b'); sfx('rumble');
  }
  function rockfallFire(tg) {
    const A = L().arena, P4 = S.roof.q4, RF = Q4N.p2.rockfall, xs = [tg.x]; let guard = 0;
    while (xs.length < RF.n && guard++ < 60) { const x = A.x0 + 24 + Math.random() * (A.x1 - A.x0 - 48); if (xs.every(o => Math.abs(o - x) >= 26)) xs.push(x); }
    xs.sort(() => Math.random() - 0.5); const t0 = now(); P4.fall = (P4.fall || []).concat(xs.map((x, i) => ({ x, at: t0 + RF.shadow + i * 0.1, t0, done: false, until: 0 })));
  }
  function startBombard(e) {
    const P4 = S.roof.q4; e.mode = 'bombardTell'; e.modeT = 0.6; e.vx = 0; ctx.number(e.x, e.y - e.h - 12, '!', '#ffd36b'); sfx('portalOpen'); ctx.burst(e.x, e.y - 24, 10, ['#b28cff', '#e8dcff'], 60, 0.4); P4.bombs = (P4.bombs || 0) + 1;
  }
  function startRage(e) {
    const P4 = S.roof.q4; P4.rageDone = true; P4.rage = true; P4.volleyCd = 0.6 + Q4N.p2.rage.tell; P4.mtnCd = 3.0 + Q4N.p2.rage.tell; P4.rageT = now(); S.rages = (S.rages || 0) + 1; e.mode = 'rageTell'; e.modeT = Q4N.p2.rage.tell; e.vx = 0; e.crownOut = false; S.crown = null; roofMus(2);
    ctx.number(e.x, e.y - 76, 'MY CASTLE!', '#ff6b6b'); ctx.ring(e.x, e.y - 40, 50, '#ff6b6b', 0.6); ctx.burst(e.x, e.y - 50, 24, ['#ff6b6b', '#b28cff', '#ffd36b'], 120, 0.9); sfx('bellow'); ctx.shake(8); ctx.zoom(1.12, 0.5);
    if (ctx.hint) ctx.hint('SHE IS ENRAGED: FASTER, AND THE MOUNTAIN FALLS. STRIKE HER SHARDS HOME.');
  }
  function startMountain(e) {
    const P4 = S.roof.q4, M = Q4N.p2.rage.mtn, A = L().arena, P0 = target(); P4.mtnCd = M.cd; e.mode = 'mountainTell'; e.modeT = M.tell; e.vx = 0;
    P4.mtn = { t0: now() + M.tell, gapX: Math.max(A.x0 + 40, Math.min(A.x1 - 40, P0.x + (Math.random() < 0.5 ? -1 : 1) * 60)), state: 'tell', cols: null, geode: null };
    ctx.number(e.x, e.y - e.h - 12, '!!', '#ff6b6b'); sfx('rumble');
  }
  /* what her modes do (roofStep calls this before its own switch; the hall's two (hearth, reach) are in H.mode) */
  function q4Mode(e, dt) {
    const R0 = S.roof, P4 = R0.q4, P0 = ctx.P(), d = P0.x - e.x; if (G52) { const w52 = G52.mode(e, dt); if (w52 !== undefined) return w52; }   /* (claude/gq5q2) sweep + perch modes */
    switch (e.mode) {
      case 'volleyTell': e.face = sign(d) || e.face; e.vx = 0; if (e.modeT <= 0) { volleyFire(e); e.mode = 'rec'; e.modeT = 0.5; } return 0;
      case 'boulderTell': { e.face = sign(d) || e.face; e.vx = 0; const B = P4.boulder; if (!B) { e.mode = 'rec'; e.modeT = 0.4; return 0; }
        if (!B.locked) { B.tx = P0.x; if (Q4N.p2.boulder.tell - e.modeT >= 0.5) { B.locked = true; B.tx = Math.max(L().arena.x0 + 14, Math.min(L().arena.x1 - 14, P0.x)); } }
        if (e.modeT <= 0) { B.state = 'fly'; B.t = 0; sfx('throwWhoosh'); e.mode = 'rec'; e.modeT = 0.6; } return 0; }
      case 'rockfallTell': e.face = sign(d) || e.face; e.vx = 0; if (e.modeT <= 0) { rockfallFire(P0); e.mode = 'rec'; e.modeT = 0.9; sfx('crumble'); } return 0;
      case 'bombardTell': e.vx = 0; if (e.modeT <= 0) {
        const cu = rings().find(r => r.id === 'cu'); if (!cu) { e.mode = 'rec'; e.modeT = 0.4; return 0; } const p = ringPos(cu);
        ctx.burst(e.x, e.y - 24, 14, ['#3a2a4a', '#7a4aa0', '#c9a0ff'], 80, 0.5); e.x = p.x; e.y = p.y - 1; e.vy = 0; e.vx = 0; e.mode = 'bombard'; e.modeT = Q4N.p2.bombard.dur; P4.bomb = { t0: now(), i: 0, fell: false };
        ctx.burst(e.x, e.y - 22, 14, ['#fff6c8', '#e8dcff', '#b28cff'], 90, 0.5); sfx('callerBlast'); ctx.number(e.x, e.y - 76, 'THE BOMBARDMENT', '#ff6b6b'); } return 0;
      case 'bombard': e.vx = 0; e.face = sign(d) || e.face; if (e.modeT <= 0) { P4.bomb = null; const ex = pickExit(P0, 60, true, true); if (ex) { e.x = ex.p.x; e.y = ex.p.y - 1; e.vy = 0; ctx.burst(e.x, e.y - 22, 14, ['#fff6c8', '#e8dcff', '#b28cff'], 90, 0.5); } e.mode = 'rec'; e.modeT = 0.8; sfx('portalOpen'); } return 0;
      case 'rageTell': e.vx = 0; if (Math.random() < dt * 40) ctx.part({ x: e.x + (Math.random() - 0.5) * 40, y: e.y - 20 - Math.random() * 50, vx: 0, vy: -30, life: 0.4, max: 0.4, col: Math.random() < 0.5 ? '#ff6b6b' : '#b28cff', size: 2, grav: 0, glow: true });
        if (e.modeT <= 0) { e.mode = 'rec'; e.modeT = 0.6; } return 0;
      case 'mountainTell': e.vx = 0; e.face = sign(d) || e.face; if (e.modeT <= 0) { e.mode = 'mountainWait'; e.modeT = 3.2; sfx('heavy'); } return 0;
      case 'mountainWait': e.vx = 0; if (e.modeT <= 0) { e.mode = 'rec'; e.modeT = 0.6; } return 0;
    }
    return undefined;
  }
  /* her choice on the tower top (true = it set her mode); the old chain (crown, lash, leap, blink) runs after it when this says no */
  function q4Choose(e, ad) {
    const R0 = S.roof, P4 = R0.q4, hpk = e.hp / e.maxHp;
    if (hpk <= Q4N.p2.rage.at && !P4.rageDone) { startRage(e); return true; }
    if (G52 && G52.choose(e, ad)) return true;   /* (claude/gq5q2) THE BELL PERCH replaces the bombardment's triggers; the sceptre sweep */
    if (!G52) for (const k of Q4N.p2.bombard.at) if (hpk <= k && !P4.bombSeen.has(k)) { P4.bombSeen.add(k); startBombard(e); return true; }
    if (P4.rage && P4.mtnCd <= 0 && !P4.mtn) { startMountain(e); return true; }
    if (P4.rockCd <= 0 && !(P4.fall && P4.fall.length)) { startRockfall(e); return true; }
    if (P4.boulderCd <= 0 && ad > 50 && !P4.boulder) { startBoulder(e); return true; }
    if (P4.volleyCd <= 0) { startVolley(e); return true; }
    return false;
  }
  /* every frame (hall: the jet and the reach; tower top: the boulder, the rockfall, the bombardment, the mountain, the ward) */
  function q4Update(dt) {
    const e = q(), tt = now(); if (!e) return; const A = L().arena, h4 = S.h4;
    if (inHall(e)) layGalleries();
    if (h4) {
      if (h4.jet) { const J = h4.jet, age = tt - J.t0; if (age > Q4N.hearth.jet) h4.jet = null; else {
        const front = Math.min(1, age / 0.25), x1 = J.src + (J.far - J.src) * front, lo = Math.min(J.src, x1), hi = Math.max(J.src, x1);
        if (Math.random() < dt * 80) ctx.part({ x: lo + Math.random() * (hi - lo), y: A.floor - 4 - Math.random() * 8, vx: 0, vy: -30, life: 0.3, max: 0.3, col: Math.random() < 0.5 ? '#ff9a5c' : '#ffd36b', size: 2, grav: 0, glow: true });
        seats(P1 => { if (J.hit.has(P1) || P1.dead || P1.x < lo || P1.x > hi || P1.y <= A.floor - Q4N.hearth.knee) return; J.hit.add(P1); gqRed(J.src, Q4N.hearth.dmg, 'THE HEARTH JET', { noKnock: true }); }); } }
      if (h4.reach && h4.reach.state === 'jab') { const Rr = h4.reach; if (tt - Rr.jabAt > Q4N.reach.jab) h4.reach = null; else if (!Rr.did) { Rr.did = true;
        seats(P1 => { const box = { l: Math.min(Rr.px, Rr.px + Rr.dir * 44), r: Math.max(Rr.px, Rr.px + Rr.dir * 44), t: Rr.py - 5, b: Rr.py + 5 }; if (P1.dead || !ctx.overlap(box, ctx.hurtBox())) return;
          const h = gqHit(Rr.px, Q4N.reach.dmg, e, 'HER SCEPTRE'); if (h.parried) jarr(e); }); } }
    }
    const R0 = S.roof, P4 = R0 && R0.q4; if (!P4 || e.stage !== 'roof') return;
    const RA = L().arena, P0 = target();
    // ENRAGE at 25%: it plays the moment she is free (a blow that would kill her first leaves a sliver: rageSave)
    if (!P4.rageDone && e.hp > 0 && e.hp / e.maxHp <= Q4N.p2.rage.at && (e.mode === 'roofStand' || e.mode === 'rec' || (e.mode === 'dazed' && e.modeT < 0.3))) startRage(e);
    // the portal boulder
    const B = P4.boulder; if (B) {
      if (B.state === 'fly') { B.t += dt; const k = Math.min(1, B.t / Q4N.p2.boulder.air); B.x = B.x0 + (B.tx - B.x0) * k; B.y = B.y0 + (RA.floor - 8 - B.y0) * k - 4 * 60 * k * (1 - k);
        if (k >= 1) { P4.boulder = null; ctx.burst(B.tx, RA.floor - 6, 16, ['#5a5a68', '#8a8a9c', '#b28cff'], 100, 0.6); ctx.dust(B.tx, RA.floor, 8); ctx.shake(5); sfx('heavy');
          seats(P1 => { if (!P1.dead && Math.abs(P1.x - B.tx) < Q4N.p2.boulder.r && P1.y > RA.floor - 14) gqRed(B.tx, Q4N.p2.boulder.dmg, 'A PORTAL BOULDER', {}); });
          for (const dx of [-14, 0, 14]) addShard({ x: B.tx + dx, y: RA.floor - 14, hang: Q4N.p2.boulder.hang, glint: true }); } } }
    // the rockfall: shadows 1.0 s, then each rock drops
    if (P4.fall) { for (const f of P4.fall) { if (!f.done && tt >= f.at) { f.done = true; f.until = tt + 0.3; ctx.dust(f.x, RA.floor, 5); ctx.burst(f.x, RA.floor - 6, 8, ['#5a5a68', '#8a8a9c'], 80, 0.4); sfx('crack');
          seats(P1 => { if (!P1.dead && Math.abs(P1.x - f.x) < Q4N.p2.rockfall.r && P1.y > RA.floor - 40) gqRed(f.x, Q4N.p2.rockfall.dmg, 'A FALLING ROCK', { noKnock: true }); }); } }
      P4.fall = P4.fall.filter(f => tt < f.at + 0.4); }
    // the bombardment: the five rings fire in order 0.6 s apart (the last two slow and glinting), a rockfall after
    if (P4.bomb && e.mode === 'bombard') { const Bm = P4.bomb, rs = rings().filter(r => r.id !== 'cu'), age = tt - Bm.t0;
      if (Bm.i < rs.length && age >= 0.6 * (Bm.i + 1)) { const slow = Bm.i >= rs.length - 2; P4.vol = { rings: [{ r: rs[Bm.i], p: ringPos(rs[Bm.i]) }] }; volleyFire(e, slow ? Q4N.p2.volley.vSlow : 0, slow); Bm.i++; }
      if (!Bm.fell && age >= 3.6) { Bm.fell = true; rockfallFire(P0); sfx('rumble'); ctx.number(e.x, e.y - 60, 'ROCKFALL', '#ff6b6b'); } }
    else if (P4.bomb && e.mode !== 'bombard') P4.bomb = null;
    // THE MOUNTAIN FALLS (rage only): a sky portal, a line of rocks west -> east with one glowing gap, then a great geode that bursts into hanging shards
    const M = P4.mtn, MT = Q4N.p2.rage.mtn; if (M) {
      if (M.state === 'tell' && tt >= M.t0) { M.state = 'fall'; const w = (RA.x1 - RA.x0) / MT.cols; M.cols = []; for (let i = 0; i < MT.cols; i++) { const x = RA.x0 + (i + 0.5) * w; if (Math.abs(x - M.gapX) < MT.gap / 2) continue; M.cols.push({ x, at: M.t0 + i * (MT.sweep / MT.cols), done: false }); } sfx('rumble'); }
      if (M.state === 'fall') { for (const c of M.cols) if (!c.done && tt >= c.at) { c.done = true; ctx.dust(c.x, RA.floor, 4); ctx.burst(c.x, RA.floor - 6, 5, ['#5a5a68', '#8a8a9c'], 70, 0.4);
            seats(P1 => { if (!P1.dead && Math.abs(P1.x - c.x) < 12 && P1.y > RA.floor - 40) gqRed(c.x, MT.dmg, 'THE MOUNTAIN FALLS', { noKnock: true }); }); }
        if (tt >= M.t0 + MT.sweep + 0.3 && !M.geode) { M.geode = { x: Math.max(RA.x0 + 30, Math.min(RA.x1 - 30, P0.x)), at: tt + 0.9, done: false }; ctx.number(M.geode.x, RA.floor - 40, 'A GREAT GEODE', '#c9a0ff'); }
        if (M.geode && !M.geode.done && tt >= M.geode.at) { const gx = M.geode.x; M.geode.done = true; ctx.burst(gx, RA.floor - 8, 22, ['#b28cff', '#e8dcff', '#8a8a9c'], 120, 0.7); ctx.shake(9); sfx('golemShatter'); sfx('heavy');
          seats(P1 => { if (!P1.dead && Math.abs(P1.x - gx) < 20 && P1.y > RA.floor - 20) gqRed(gx, MT.geode, 'A GREAT GEODE', {}); });
          for (let k = 0; k < MT.shards; k++) addShard({ x: gx + (k - (MT.shards - 1) / 2) * 16, y: RA.floor - 14 - (k % 2) * 8, hang: MT.hang, glint: true }); }
        if (M.geode && M.geode.done && tt > M.geode.at + 0.5) P4.mtn = null; } }
    if (P4.volLit && tt > P4.volLit.until) P4.volLit = null;
  }
  /* (claude/gq4art) THE GQ4 PICTURE, DRAWN (src/redraw/gq4_art.js): same fields, same timings as the greybox below; any throw falls back to it for the rest of the session */
  let art4Off = false;
  function q4DrawArt(g, cx, cy, t) {
    const e = q(); if (!e) return; const A = L().arena, VW0 = (g.canvas && g.canvas.width) || 320, fy = Math.round(A.floor - cy), Z = GQ4A;
    if (inHall(e)) {
      const tx = Math.round((e.throneX || (A.x0 + A.x1) / 2) - cx), lit = S.geode && S.geode.state === 'tell';
      if (tx > -90 && tx < VW0 + 90) { Z.drawGeodeThrone(g, tx, fy, !!lit, t); Z.drawRoseWindow(g, tx, fy - 168, t, 30); }
      for (let i = 0; i < 4; i++) { const lx = Math.round((A.x0 + (A.x1 - A.x0) * (0.2 + i * 0.2)) - cx); Z.drawLightPatches(g, lx, fy, t, i); }
      const h4 = S.h4, hs = hearthXs();
      hs.forEach(hx => { const x = Math.round(hx - cx); if (x < -40 || x > VW0 + 40) return; const live = h4 && h4.hearth && Math.abs(h4.hearth.src - hx) < 4 && (e.mode === 'hearthTell' || e.mode === 'hearthJet');
        Z.drawHearth(g, x, fy, !!live, t, !!(live && e.mode === 'hearthTell'));
        if (live && e.mode === 'hearthTell') { const far = Math.round(h4.hearth.far - cx), kk = 1 - e.modeT / Q4N.hearth.tell; g.globalAlpha = 0.3 + 0.5 * kk; g.fillStyle = '#ff6b6b'; g.fillRect(Math.min(x, far), fy - 3, Math.abs(far - x), 3); g.globalAlpha = 1; Z.drawHearthPortal(g, far, fy - 10, 0.5 + 0.5 * kk, t); Z.drawHearthPortal(g, x, fy - 12, 0.5 + 0.5 * kk, t); } });
      if (h4 && h4.jet) { const J = h4.jet, age = t - J.t0, front = Math.min(1, age / 0.25); Z.drawHearthJet(g, Math.round(J.src - cx), Math.round(J.src + (J.far - J.src) * front - cx), fy, age, Q4N.hearth.jet, t); }
      const Rr = h4 && h4.reach; if (Rr) { const x = Math.round(Rr.px - cx), y = Math.round(Rr.py - cy), kk = Rr.state === 'jab' ? 1 : Math.min(1, (t - Rr.t0) / Q4N.reach.tell);
        Z.drawReachPortal(g, x, y, 0.4 + 0.6 * kk, t); if (Rr.state === 'jab') Z.drawSceptreJab(g, x, y, Rr.dir, 44, t);
        if (e.mode === 'reachTell') Z.drawReachPortal(g, Math.round(e.x - cx + e.face * 16), Math.round(e.y - 30 - cy), 0.4 + 0.5 * kk, t); }
      { const row = Math.round(A.floor / TS) - 4, x0t = Math.round(A.x0 / TS), x1t = Math.round(A.x1 / TS) - 1; if (L().grid && L().grid[row * L().W + x0t + 4] !== 0) { Z.drawGalleryTrim(g, (x0t + 2) * TS, (x0t + 8) * TS, row * TS, cx, cy, VW0); Z.drawGalleryTrim(g, (x1t - 7) * TS, (x1t - 1) * TS, row * TS, cx, cy, VW0); for (const lx of [x0t + 8, x1t - 8]) Z.drawGalleryLadder(g, lx * TS + 8, row * TS, A.floor, cx, cy, VW0); } }
    }
    const R0 = S.roof, P4 = R0 && R0.q4; if (!P4 || e.stage !== 'roof') return;
    const RA = L().arena, now0 = t, rfy = Math.round(RA.floor - cy);
    if (P4.rage) Z.drawRageAura(g, Math.round(e.x - cx), Math.round(e.y - cy), t);
    if (P4.vol) for (const o of P4.vol.rings) { const p = ringPos(o.r); Z.drawHearthPortal(g, p.x - cx, p.y - 14 - cy, 0.5 + 0.5 * Math.min(1, 1 - (P4.vol.at - now0) / Q4N.p2.volley.tell), t, P4.rage ? '#ff6b9a' : '#e8dcff'); }
    if (P4.volLit) for (const id of P4.volLit.rings) { const r = rings().find(rr => rr.id === id); if (r) { const p = ringPos(r); Z.drawHearthPortal(g, p.x - cx, p.y - 14 - cy, 1, t, '#fff6c8'); } }
    const B = P4.boulder; if (B) { if (B.state === 'tell') { Z.drawHearthPortal(g, B.x0 - cx, B.y0 - cy, 0.5 + 0.5 * (1 - e.modeT / Q4N.p2.boulder.tell), t, '#ffd36b'); Z.drawRockShadow(g, Math.round(B.tx - cx), rfy, 0.4, t); }
      else if (B.x !== undefined) { Z.drawBoulder(g, Math.round(B.x - cx), Math.round(B.y - cy), Math.floor(t * 10) & 3, false); Z.drawRockShadow(g, Math.round(B.tx - cx), rfy, 0.7, t); } }
    for (const f of P4.fall || []) { if (f.done) { const kk = Math.max(0, (f.until - t) / 0.3); Z.drawRock(g, Math.round(f.x - cx), rfy - Math.round(26 * kk) - 4, 0, t); continue; } Z.drawRockShadow(g, Math.round(f.x - cx), rfy, Math.min(1, (t - f.t0) / Q4N.p2.rockfall.shadow), t); }
    const M = P4.mtn; if (M) { const MT = Q4N.p2.rage.mtn, w = (RA.x1 - RA.x0) / MT.cols;
      if (M.state === 'tell') Z.drawSkyPortal(g, Math.round(RA.x0 - cx), Math.round(RA.x1 - cx), Math.round(RA.floor - 120 - cy), Math.max(0, Math.min(1, 1 - (M.t0 - t) / MT.tell)), t);
      const sweepK = Math.max(0, Math.min(1, (t - (M.t0 - MT.tell)) / (MT.tell + MT.sweep))); for (let i = 0; i < MT.cols; i++) { const x = RA.x0 + (i + 0.5) * w; if (Math.abs(x - M.gapX) < MT.gap / 2 || i / MT.cols > sweepK + 0.15) continue; Z.drawRockShadow(g, Math.round(x - cx), rfy, 0.35, t); }
      g.globalAlpha = 0.35 + 0.25 * Math.sin(t * 14); g.fillStyle = '#8fd160'; g.fillRect(Math.round(M.gapX - MT.gap / 2 - cx), rfy - 3, MT.gap, 3); g.globalAlpha = 1;
      if (M.cols) for (const c of M.cols) if (c.done && t < c.at + 0.25) Z.drawRock(g, Math.round(c.x - cx), rfy - 10, 1, t);
      if (M.geode && !M.geode.done) { Z.drawRockShadow(g, Math.round(M.geode.x - cx), rfy, 0.6, t); Z.drawGreatGeode(g, Math.round(M.geode.x - cx), rfy - 22 - Math.round(Math.max(0, M.geode.at - t) / 0.9 * 170), t, 0); } }
    for (const r of S.rocks) if (r.p2 && !r.dead && (r.glint || r.hang > 0)) Z.drawHangGlint(g, Math.round(r.x - cx), Math.round(r.y - cy), t + r.t);
    if (now() < (P4.ward || 0)) Z.drawWardShell(g, Math.round(e.x - cx), Math.round(e.y - cy), t);
  }
  /* the picture (GREYBOX; the art lane replaces it): the geode throne, the rose window's light, the grated hearths, the jet, the reach's portal; on the tower top the volley's rings, the boulder, the shadows, the ward */
  function q4Draw(g, cx, cy, t) {
    const e = q(); if (!e) return; const A = L().arena, VW0 = (g.canvas && g.canvas.width) || 320, fy = Math.round(A.floor - cy);
    if (inHall(e)) {
      const tx = Math.round((e.throneX || (A.x0 + A.x1) / 2) - cx), lit = S.geode && S.geode.state === 'tell', k = 0.5 + 0.5 * Math.sin(t * 4);
      if (tx > -80 && tx < VW0 + 80) {   // THE GEODE THRONE: an amethyst cluster behind the dais
        const crystals = [[-34, 46, 7], [-22, 66, 9], [-8, 84, 11], [8, 74, 10], [22, 60, 9], [36, 42, 7]];
        g.globalAlpha = 0.9; for (const [dx, h, w] of crystals) { g.fillStyle = '#3a1a6a'; g.beginPath(); g.moveTo(tx + dx - w, fy - 6); g.lineTo(tx + dx, fy - 6 - h); g.lineTo(tx + dx + w, fy - 6); g.fill(); g.fillStyle = lit ? '#e8dcff' : '#8a5ad0'; g.beginPath(); g.moveTo(tx + dx - w * 0.3, fy - 6); g.lineTo(tx + dx, fy - 6 - h); g.lineTo(tx + dx + w * 0.5, fy - 6); g.fill(); }
        g.globalAlpha = (lit ? 0.35 : 0.12) + 0.08 * k; g.fillStyle = '#b28cff'; g.beginPath(); g.ellipse(tx, fy - 40, 50, 46, 0, 0, 6.3); g.fill(); g.globalAlpha = 1; }
      for (let i = 0; i < 4; i++) { const lx = Math.round((A.x0 + (A.x1 - A.x0) * (0.2 + i * 0.2)) - cx) + Math.round(Math.sin(t * 0.3 + i) * 2); g.globalAlpha = 0.1; g.fillStyle = i % 2 ? '#ffd36b' : '#b28cff';   // THE ROSE WINDOW's light on the floor
        g.beginPath(); g.moveTo(lx, fy - 14); g.lineTo(lx + 22, fy - 14); g.lineTo(lx + 34, fy); g.lineTo(lx + 12, fy); g.fill(); g.globalAlpha = 1; }
      const h4 = S.h4, hs = hearthXs();   // THE TWO GRATED HEARTHS
      hs.forEach((hx, i) => { const x = Math.round(hx - cx); if (x < -40 || x > VW0 + 40) return; const live = h4 && h4.hearth && Math.abs(h4.hearth.src - hx) < 4 && (e.mode === 'hearthTell' || e.mode === 'hearthJet');
        g.fillStyle = '#2a2a34'; g.fillRect(x - 14, fy - 26, 28, 26); g.fillStyle = '#12101a'; g.fillRect(x - 10, fy - 20, 20, 20); g.fillStyle = '#6a6a7c'; for (let b = -8; b <= 8; b += 4) g.fillRect(x + b, fy - 20, 1, 20);
        g.globalAlpha = live ? 0.9 : 0.35; g.fillStyle = live ? '#ff6b2c' : '#7a2a1a'; g.fillRect(x - 8, fy - 8, 16, 8); g.fillStyle = '#ffd36b'; g.fillRect(x - 4, fy - 5, 8, 5); g.globalAlpha = 1;
        if (live && e.mode === 'hearthTell') { g.globalAlpha = 0.5; for (let s = 0; s < 6; s++) { const ph = (t * 1.3 + s * 0.17) % 1; g.fillStyle = '#6a6a78'; g.fillRect(x - 10 + s * 4 + Math.round(Math.sin(t * 3 + s) * 3), fy - 28 - Math.round(ph * 30), 5, 5); } g.globalAlpha = 1;
          const far = Math.round(h4.hearth.far - cx), kk = 1 - e.modeT / Q4N.hearth.tell; g.globalAlpha = 0.3 + 0.5 * kk; g.fillStyle = '#ff6b6b'; g.fillRect(Math.min(x, far), fy - 3, Math.abs(far - x), 3); g.globalAlpha = 1; portalDraw(g, far, fy - 10, t, 0.5 + 0.5 * kk, '#ff9a5c'); portalDraw(g, x, fy - 12, t, 0.5 + 0.5 * kk, '#ff9a5c'); } });
      if (h4 && h4.jet) { const J = h4.jet, age = t - J.t0, front = Math.min(1, age / 0.25), a = Math.round(J.src - cx), b = Math.round(J.src + (J.far - J.src) * front - cx), lo = Math.min(a, b), w = Math.abs(b - a), fade = Math.max(0, 1 - age / Q4N.hearth.jet);
        g.globalAlpha = 0.85 * fade; for (let x = 0; x < w; x += 6) { const h0 = 8 + 8 * (0.5 + 0.5 * Math.sin(t * 25 + x * 0.4)); g.fillStyle = '#ff6b2c'; g.fillRect(lo + x, fy - h0, 5, h0); g.fillStyle = '#ffd36b'; g.fillRect(lo + x + 1, fy - h0 * 0.5, 3, h0 * 0.5); } g.globalAlpha = 1; }
      const Rr = h4 && h4.reach; if (Rr) { const x = Math.round(Rr.px - cx), y = Math.round(Rr.py - cy), kk = Rr.state === 'jab' ? 1 : Math.min(1, (t - Rr.t0) / Q4N.reach.tell);
        portalDraw(g, x, y, t, 0.4 + 0.6 * kk, '#ffffff'); if (Rr.state === 'jab') { g.strokeStyle = '#ffd36b'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Rr.dir * 44, y); g.stroke(); g.fillStyle = '#c9a0ff'; g.fillRect(x + Rr.dir * 44 - 2, y - 3, 5, 6); }
        if (e.mode === 'reachTell') portalDraw(g, Math.round(e.x - cx + e.face * 16), Math.round(e.y - 30 - cy), t, 0.4 + 0.5 * kk, '#ffffff'); }
    }
    const R0 = S.roof, P4 = R0 && R0.q4; if (!P4 || e.stage !== 'roof') return;
    const RA = L().arena, now0 = t, rageCol = P4.rage ? '#ff6b9a' : null;
    if (P4.vol) for (const o of P4.vol.rings) { const p = ringPos(o.r); portalDraw(g, p.x - cx, p.y - 14 - cy, t, 0.5 + 0.5 * Math.min(1, 1 - (P4.vol.at - now0) / Q4N.p2.volley.tell), '#fff6c8'); }
    if (P4.volLit) for (const id of P4.volLit.rings) { const r = rings().find(rr => rr.id === id); if (r) { const p = ringPos(r); portalDraw(g, p.x - cx, p.y - 14 - cy, t, 1, '#fff6c8'); } }
    const B = P4.boulder; if (B) { if (B.state === 'tell') { portalDraw(g, B.x0 - cx, B.y0 - cy, t, 0.5 + 0.5 * (1 - e.modeT / Q4N.p2.boulder.tell), '#ffd36b'); g.globalAlpha = 0.6; g.strokeStyle = '#ff6b6b'; g.lineWidth = 1; g.beginPath(); g.ellipse(Math.round(B.tx - cx), Math.round(RA.floor - cy) - 2, 16, 4, 0, 0, 6.3); g.stroke(); g.globalAlpha = 1; }
      else if (B.x !== undefined) { const x = Math.round(B.x - cx), y = Math.round(B.y - cy); g.fillStyle = '#5a5a68'; g.beginPath(); g.arc(x, y, 9, 0, 6.3); g.fill(); g.fillStyle = '#8a8a9c'; g.fillRect(x - 5, y - 5, 4, 3); g.strokeStyle = '#ff6b6b'; g.beginPath(); g.ellipse(Math.round(B.tx - cx), Math.round(RA.floor - cy) - 2, 16, 4, 0, 0, 6.3); g.stroke(); } }
    for (const f of P4.fall || []) { if (f.done) { const kk = Math.max(0, (f.until - t) / 0.3); g.fillStyle = '#8a8a9c'; g.fillRect(Math.round(f.x - cx) - 5, Math.round(RA.floor - cy) - Math.round(26 * kk) - 4, 10, 8); continue; }
      const kk = Math.min(1, (t - f.t0) / Q4N.p2.rockfall.shadow); g.globalAlpha = 0.3 + 0.5 * kk; g.fillStyle = '#12101a'; g.beginPath(); g.ellipse(Math.round(f.x - cx), Math.round(RA.floor - cy) - 1, 4 + 8 * kk, 2 + 2 * kk, 0, 0, 6.3); g.fill(); g.globalAlpha = 1; }
    const M = P4.mtn; if (M) { const MT = Q4N.p2.rage.mtn, w = (RA.x1 - RA.x0) / MT.cols;
      if (M.state === 'tell') { const kk = Math.max(0, Math.min(1, 1 - (M.t0 - t) / MT.tell)); g.globalAlpha = 0.5 + 0.4 * kk; g.fillStyle = '#2a1a3a'; g.fillRect(Math.round(RA.x0 - cx), Math.round(RA.floor - 120 - cy), Math.round(RA.x1 - RA.x0), 6); g.strokeStyle = '#ff6b9a'; g.lineWidth = 2; g.strokeRect(Math.round(RA.x0 - cx), Math.round(RA.floor - 120 - cy), Math.round(RA.x1 - RA.x0), 6); g.globalAlpha = 1; }
      const sweepK = Math.max(0, Math.min(1, (t - (M.t0 - MT.tell)) / (MT.tell + MT.sweep))); g.globalAlpha = 0.55; g.fillStyle = '#12101a'; for (let i = 0; i < MT.cols; i++) { const x = RA.x0 + (i + 0.5) * w; if (Math.abs(x - M.gapX) < MT.gap / 2 || i / MT.cols > sweepK + 0.15) continue; g.fillRect(Math.round(x - cx) - 5, Math.round(RA.floor - cy) - 2, 10, 2); } g.globalAlpha = 1;
      g.globalAlpha = 0.35 + 0.25 * Math.sin(t * 14); g.fillStyle = '#8fd160'; g.fillRect(Math.round(M.gapX - MT.gap / 2 - cx), Math.round(RA.floor - cy) - 3, MT.gap, 3); g.globalAlpha = 1;
      if (M.cols) for (const c of M.cols) if (c.done && t < c.at + 0.25) { g.fillStyle = '#8a8a9c'; g.fillRect(Math.round(c.x - cx) - 5, Math.round(RA.floor - cy) - 16, 10, 14); }
      if (M.geode && !M.geode.done) { g.globalAlpha = 0.5; g.strokeStyle = '#ff6b6b'; g.beginPath(); g.ellipse(Math.round(M.geode.x - cx), Math.round(RA.floor - cy) - 2, 22, 5, 0, 0, 6.3); g.stroke(); g.globalAlpha = 1; } }
    if (P4.rage) for (const r of rings()) { const p = ringPos(r); g.globalAlpha = 0.5; g.strokeStyle = rageCol; g.lineWidth = 1; g.beginPath(); g.ellipse(Math.round(p.x - cx), Math.round(p.y - 14 - cy), 8, 13, 0, 0, 6.3); g.stroke(); g.globalAlpha = 1; }
    for (const r of S.rocks) if (r.p2 && !r.dead && (r.glint || r.hang > 0)) { const x = Math.round(r.x - cx), y = Math.round(r.y - cy), k = 0.5 + 0.5 * Math.sin(t * 16 + r.t * 9); g.globalAlpha = 0.5 + 0.4 * k; g.fillStyle = '#fff6c8'; g.fillRect(x - 5, y - 1, 10, 2); g.fillRect(x - 1, y - 5, 2, 10); g.globalAlpha = 1; }
    if (now() < (P4.ward || 0)) { g.globalAlpha = 0.35 + 0.15 * Math.sin(t * 8); g.strokeStyle = '#e8dcff'; g.lineWidth = 2; g.beginPath(); g.ellipse(Math.round(e.x - cx), Math.round(e.y - 36 - cy), 30, 40, 0, 0, 6.3); g.stroke(); g.globalAlpha = 0.12; g.fillStyle = '#e8dcff'; g.fill(); g.globalAlpha = 1; }
    if (e.mode === 'dazed') for (let k = 0; k < 3; k++) { const a = t * 4 + k * 2.09; g.fillStyle = '#8fd160'; g.fillRect(Math.round(e.x - cx + Math.cos(a) * 16), Math.round(e.y - 64 - cy + Math.sin(a) * 4), 3, 3); }
  }
  H.rageOn = () => !!(Q4 && S && S.roof && S.roof.q4 && S.roof.q4.rage && !(q() && q().mode === 'rageTell'));
  H.rageSave = e => { const P4 = S && S.roof && S.roof.q4; if (!P4) return false; if (e.mode === 'rageTell') return true; if (P4.rageDone || P4.rageSaved) return false; P4.rageSaved = true; return true; };
  H.hearthSlot = e => { if (!Q4 || !S || !inHall(e) || e.hp > e.maxHp * 0.5) return false; const h4 = g4(); if (h4.hearthCd > 0 || now() < h4.gapUntil || S.mech.wave || S.mech.lure || S.geode) return false; hearthStart(e); return true; };
  H.test = H.test || {}; Object.assign(H.test, { q4: () => S && S.roof && S.roof.q4, h4: () => S && S.h4, shards: () => (S ? S.rocks.filter(r => r.p2).map(r => ({ x: r.x, y: r.y, home: r.home, hang: r.hang })) : []), homeTotal: () => (S && S.homeTotal) || 0, knocked: () => (S && S.knockedOut) || 0, spawnShard: o => { if (!S) return false; S.rocks.push({ x: 0, y: 0, vx: 0, vy: 0, t: 0, dead: false, home: false, cast: null, esc: false, id: 'r' + (++S.rid), ...o }); return true; }, geodeLob: () => { const e = q(); if (e && S) { geodeBegin(e); return true; } return false; }, dazes: () => (S && S.dazes) || 0, rages: () => (S && S.rages) || 0,
    startQ4: k => { const e = q(); if (!e || !S) return false; if (k === 'hearth') hearthStart(e); else if (k === 'reach') reachStart(e); else { if (!S.roof) roofBegin(e); if (k === 'volley') startVolley(e); else if (k === 'boulder') startBoulder(e); else if (k === 'rockfall') startRockfall(e); else if (k === 'bombard') startBombard(e); else if (k === 'rage') startRage(e); else if (k === 'mountain') { S.roof.q4.rage = true; startMountain(e); } else return false; } return e.mode; } });

  /* ---------------- PER FRAME ---------------- */
  H.update = dt => {
    if (!S) return;
    { const e0 = q(), R1 = S.roof; let up = false; seats(p => { if (!p.dead) up = true; });
      if (mLvl && (!e0 || e0.hp <= 0 || e0.stage !== 'roof' || !ctx.bossActive() || !up)) musicLift(0);   /* (claude/gqmusic) she is dead, the fight is over, or every hero is down */
      else if (!mLvl && R1 && R1.mus && e0 && e0.stage === 'roof' && ctx.bossActive() && up) musicLift(R1.mus); }
    if (S.esc && S.esc.on) escapeStep(dt);
    if (S.rocks.length) rockStep(dt);
    if (!ctx.bossActive() || !q()) { S.crown = null; S.geode = null; S.geodeBits = []; if (!(S.esc && S.esc.on)) { S.rocks = []; } S.portals = []; return; }
    crownStep(dt); portalStep(dt); geodeStep(dt); bitsStep(dt); if (S.roof) roofUpdate(dt); mechStep(dt); if (G5) G5.update(dt); if (Q4) q4Update(dt); if (G52) G52.update(dt);
  };

  /* ---------------- DRAW ---------------- */
  /* the escape's picture (placeholders until the art lane): the floor on fire, flames on the rafters, the two hall portals, the roof shrine, HER PORTAL */
  function portalDraw(g, x, y, t, k, col) {
    g.save(); g.translate(Math.round(x), Math.round(y));
    g.fillStyle = '#2a1a3a'; g.beginPath(); g.ellipse(0, 0, 6 + 4 * k, 11 + 5 * k, 0, 0, 6.3); g.fill();
    g.strokeStyle = col; g.lineWidth = 2; g.beginPath(); g.ellipse(0, 0, 6 + 4 * k, 11 + 5 * k, t * 3, 0, 5); g.stroke();
    g.strokeStyle = '#e8dcff'; g.lineWidth = 1; g.beginPath(); g.ellipse(0, 0, 3 + 2 * k, 7 + 3 * k, -t * 4, 0, 4); g.stroke(); g.restore();
  }
  /* (gq3 GREYBOX) THE BURNING TOWER's picture: her portal in the hall, the smoking and burning floors, the beams' shadows and their fall, her hop's portals, the volley's portal. GQ3ART draws the stone shaft, the timber floors
     (smoke / burning / charred), the falling beam x2 + its impact, the stairs, the hatch and the slit-window backdrop. */
  function towerDraw(g, cx, cy, t) {
    if (art3(() => towerArt(g, cx, cy, t))) { const E1 = L().gqEscape, es = S.esc; if (E1 && E1.tower.OUT && es && es.on && (es.inTower || es.step)) TCL.draw(g, cx, cy, t, es, E1); return; }
    const E = L().gqEscape, esc = S.esc; if (!E || !esc || !esc.on) return; const Tw = E.tower, F = Tw.FLOORS;
    portalDraw(g, E.portal.x * TS + 8 - cx, E.portal.y * TS + 2 - cy, t, esc.step ? 1 + Math.min(1, (t - esc.step.t0) / G.esc.step) : 0.5 + 0.5 * Math.sin(t * 3), esc.step ? '#fff6c8' : '#b28cff');
    if (!esc.inTower && !esc.step) return;
    const x0 = Math.round(Tw.SHAFT[0] * TS - cx), x1 = Math.round((Tw.SHAFT[1] + 1) * TS - cx);
    esc.fl.forEach((f, k) => { const fy = Math.round(F[k] * TS - cy);
      if (f.burning) { g.globalAlpha = 0.85; for (let x = x0; x < x1; x += 8) { const h0 = 4 + 5 * (0.5 + 0.5 * Math.sin(t * 9 + x * 0.37 + k)); g.fillStyle = '#ff6b2c'; g.fillRect(x, fy - h0, 5, h0); g.fillStyle = '#ffd36b'; g.fillRect(x + 1, fy - h0 * 0.55, 3, h0 * 0.55); } g.globalAlpha = 1; }
      else if (f.smokeAt) { g.globalAlpha = 0.45; for (let x = x0; x < x1; x += 14) { const ph = (t * 0.8 + x * 0.13) % 1; g.fillStyle = '#6a6a78'; g.fillRect(x + Math.round(Math.sin(t + x) * 3), fy - 4 - Math.round(ph * 26), 6, 5); } g.globalAlpha = 1; } });
    for (const b of esc.beams) { const bx = Math.round(b.x - cx), fy = Math.round(F[b.k] * TS - cy);
      if (b.state === 'tell') { const k = 0.5 + 0.5 * Math.sin(t * 22); g.globalAlpha = 0.5 + 0.4 * k; g.fillStyle = '#ff6b6b'; g.fillRect(bx - 11, fy - 2, 22, 2); g.globalAlpha = 0.25; g.fillRect(bx - 11, fy - 80, 22, 78); g.globalAlpha = 1; }
      else { const k = Math.max(0, (b.at - t) / 0.3); g.fillStyle = '#5a3a1a'; g.fillRect(bx - 5, fy - Math.round(150 * k) - 8, 10, 40); g.fillStyle = '#ff9a5c'; g.fillRect(bx - 5, fy - Math.round(150 * k) - 8, 10, 4); g.fillRect(bx - 3, fy - 2, 6, 2); } }
    const qq = esc.q; if (qq.entry) portalDraw(g, qq.entry.x - cx, qq.entry.y - 14 - cy, t, 0.8, '#ffd36b');
    if (qq.flash && t < qq.flash.until) portalDraw(g, qq.flash.x - cx, qq.flash.y - 14 - cy, t, 0.6, '#fff6c8');
    if (esc.vol) { const k = Math.min(1, 1 - (esc.vol.at - t) / G.esc.cue); portalDraw(g, esc.vol.px - cx, esc.vol.py - cy, t, 0.4 + 0.6 * k, k > 0.7 ? '#fff6c8' : '#b28cff'); }
    if (Tw.OUT) TCL.draw(g, cx, cy, t, esc, E);
  }
  function escapeDraw(g, cx, cy, t) { towerDraw(g, cx, cy, t); }
  H.drawWorld = (g, cx, cy, t) => {
    if (!S) return;
    escapeDraw(g, cx, cy, t);
    if (S.fleeP && !(S.fleeP.done && (t - S.fleeP.done > 0.6 || (S.esc && S.esc.on)))) portalDraw(g, S.fleeP.x - cx, S.fleeP.y - cy, t, 0.8, '#b28cff');
    const c = S.crown;
    if (c) {
      const x = Math.round(c.x - cx), y = Math.round(c.y - cy);
      g.save(); g.translate(x, y); g.rotate(c.state === 'floor' ? 0.4 : c.spin || 0);
      g.fillStyle = c.home ? '#fff6c8' : '#e0b040'; g.fillRect(-5, 0, 10, 3);
      g.beginPath(); g.moveTo(-5, 0); g.lineTo(-5, -4); g.lineTo(-2, -1); g.lineTo(0, -5); g.lineTo(2, -1); g.lineTo(5, -4); g.lineTo(5, 0); g.fill();
      g.fillStyle = '#c9463d'; g.fillRect(-1, 0, 2, 2); g.restore();
    }
    for (const p of S.portals) {
      const x = Math.round(p.x - cx), y = Math.round(p.y - cy), k = p.fired ? 1 : Math.min(1, (t - p.t0) / G.portal.glow);
      g.save(); g.translate(x, y);
      if (!p.fired) { g.globalAlpha = 0.18 + 0.2 * k; g.strokeStyle = '#e8dcff'; g.lineWidth = 1;
        for (let j = 0; j < G.portal.fan; j++) { const a = Math.atan2(p.aimY - p.y, p.aimX - p.x) + (j - (G.portal.fan - 1) / 2) * G.portal.spread * Math.PI / 180; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * 150, Math.sin(a) * 150); g.stroke(); }
        g.globalAlpha = 1; }
      g.fillStyle = '#2a1a3a'; g.beginPath(); g.ellipse(0, 0, 5 + 5 * k, 9 + 6 * k, 0, 0, 6.3); g.fill();
      g.strokeStyle = p.fired ? '#fff6c8' : '#b28cff'; g.lineWidth = 2; g.beginPath(); g.ellipse(0, 0, 5 + 5 * k, 9 + 6 * k, t * 3, 0, 5); g.stroke();
      g.restore();
    }
    for (const r of S.rocks) { const x = Math.round(r.x - cx), y = Math.round(r.y - cy); g.fillStyle = r.home ? '#fff6c8' : '#8a8a9c'; g.fillRect(x - 3, y - 3, 6, 6); g.fillStyle = r.home ? '#ffd36b' : '#b28cff'; g.fillRect(x - 1, y - 1, 2, 2); }
    const R0 = S.roof;
    if (R0) {
      const RA = L().arena, e0 = q();
      for (const hx of (RA.hatches || [])) { const open = R0.hatch && R0.hatch.x === hx; g.fillStyle = '#2a1a1a'; g.fillRect(Math.round(hx * TS - cx), Math.round(RA.floor - cy) - (open ? 6 : 3), 22, open ? 6 : 3); g.fillStyle = '#8a5a32'; g.fillRect(Math.round(hx * TS - cx), Math.round(RA.floor - cy) - (open ? 6 : 3), 22, 1); }
      for (const gy of R0.geysers) { const k = gy.done ? Math.max(0, (gy.until - t) / 0.28) : 0, gx = Math.round(gy.x - cx), gfy = Math.round(RA.floor - cy);
        if (!gy.done) { g.globalAlpha = 0.5 + 0.4 * Math.sin(t * 24); g.fillStyle = '#ff6b6b'; g.fillRect(gx - 5, gfy - 2, 10, 2); g.globalAlpha = 1; }
        else if (k > 0) { g.fillStyle = '#8a5a32'; g.fillRect(gx - 5, gfy - Math.round(30 * k), 10, Math.round(30 * k)); g.fillStyle = '#ff9a5c'; g.fillRect(gx - 2, gfy - Math.round(36 * k), 4, 6); } }
      if (R0.whip && t - R0.whip.t0 < 0.3 && e0) { const k = (t - R0.whip.t0) / 0.3, wy = Math.round(e0.y - (R0.whip.high ? 30 : 5) - cy), wx = Math.round(e0.x - cx);
        g.strokeStyle = '#ff9a5c'; g.lineWidth = 3; g.beginPath(); g.moveTo(wx, wy); g.lineTo(wx + R0.whip.face * G.roof.lashReach * Math.min(1, k * 3), wy + Math.sin(t * 60) * 2); g.stroke(); g.strokeStyle = '#ffd36b'; g.lineWidth = 1; g.stroke(); }
      if (e0 && e0.mode === 'ambushTell') portalDraw(g, R0.ambushX - cx, RA.floor - 14 - cy, t, 1 - e0.modeT / G.roof.ambushTell, '#c9a0ff');
      if (R0.storm && R0.storm.x !== undefined) { const x = Math.round(R0.storm.x - cx), y = Math.round(R0.storm.y - cy); g.fillStyle = '#e0b040'; g.fillRect(x - 5, y, 10, 3); g.beginPath(); g.moveTo(x - 5, y); g.lineTo(x - 5, y - 4); g.lineTo(x - 2, y - 1); g.lineTo(x, y - 5); g.lineTo(x + 2, y - 1); g.lineTo(x + 5, y - 4); g.lineTo(x + 5, y); g.fill(); }
    }
    if (S.fled && S.fled.open > 0) portalDraw(g, S.fled.px - cx, S.fled.py - cy, t, S.fled.open * 1.4, '#ffd36b');   /* (gq3 item 1 GREYBOX) the ROYAL PORTAL: GQ3ART draws it (48 px: open x3, idle x4, snap x2) */
    const e = q();
    if (e && e.mode === 'stunned') { for (let k = 0; k < 3; k++) { const a = t * 4 + k * 2.09; g.fillStyle = '#ffd36b'; g.fillRect(Math.round(e.x - cx + Math.cos(a) * 16), Math.round(e.y - 64 - cy + Math.sin(a) * 4), 2, 2); } }
    if (e && e.mode === 'crownTossTell') { const k = 0.5 + 0.5 * Math.sin(t * 30); g.globalAlpha = 0.5 + 0.4 * k; g.fillStyle = '#fff6c8'; g.fillRect(Math.round(e.x - cx + e.face * 6) - 1, Math.round(e.y - 60 - cy), 3, 3); g.globalAlpha = 1; }
  };

  /* (gq3 GREYBOX) THE TOWER TOP's kit: the five portal rings (dim; white = the blink's exit, gold = the crown's, green = reinforcements, lit in order in the storm), the burning bays, the stumble's stars. GQ3ART draws the royal ring set, the bays x3 burn states, the parapets, the cupola. */
  function roofDraw(g, cx, cy, t) {
    if (art3(() => roofArt(g, cx, cy, t))) return;
    const R0 = S.roof; if (!R0) return; const A0 = L().arena;
    const cr = S.crown && S.crown.state === 'ringwait' ? S.crown : null, rf = R0.reinf, bl = R0.blink, ps = R0.pstorm;
    for (const r of rings()) { const p = ringPos(r); let col = '#5a3a8a', k = 0.35;
      if (bl && bl.ring === r.id) { col = '#fff6c8'; k = 0.5 + 0.5 * Math.min(1, 1 - (bl.at - now()) / G.p2.blinkGlow); }
      else if (cr && cr.ring === r.id) { col = '#ffd36b'; k = 0.5 + 0.5 * Math.min(1, 1 - (cr.at - now()) / G.p2.crownGlow); }
      else if (rf && rf.ring.id === r.id) { col = '#8fd160'; k = 0.5 + 0.5 * Math.min(1, 1 - (rf.at - now()) / G.p2.addGlow); }
      else if (ps && ps.lit && ps.lit.id === r.id && now() < ps.lit.until) { col = '#fff6c8'; k = 1; }
      portalDraw(g, p.x - cx, p.y - 14 - cy, t, k, col); }
    R0.bays.forEach((b, i) => { const sp = bays()[i]; if (!sp || b.state === 'idle') return; const x0 = Math.round(sp[0] * TS - cx), x1 = Math.round((sp[1] + 1) * TS - cx), fy = Math.round(A0.floor - cy);
      if (b.state === 'burn') { g.globalAlpha = 0.85; for (let x = x0; x < x1; x += 8) { const h0 = 5 + 6 * (0.5 + 0.5 * Math.sin(t * 9 + x * 0.37 + i)); g.fillStyle = '#ff6b2c'; g.fillRect(x, fy - h0, 5, h0); g.fillStyle = '#ffd36b'; g.fillRect(x + 1, fy - h0 * 0.55, 3, h0 * 0.55); } g.globalAlpha = 1; }
      else { g.globalAlpha = 0.5; for (let x = x0; x < x1; x += 12) { const ph = (t * 0.9 + x * 0.17) % 1; g.fillStyle = '#6a6a78'; g.fillRect(x + Math.round(Math.sin(t + x) * 3), fy - 4 - Math.round(ph * 24), 6, 5); } g.globalAlpha = 1; } });
    const e = q(); if (e && (e.mode === 'stumble' || e.mode === 'stormOpen')) for (let k = 0; k < 3; k++) { const a = t * 5 + k * 2.09; g.fillStyle = '#8fd160'; g.fillRect(Math.round(e.x - cx + Math.cos(a) * 16), Math.round(e.y - 64 - cy + Math.sin(a) * 4), 2, 2); }
  }
  /* (claude/gq2art) THE ART: the same world, drawn by src/redraw/gqueen_art.js. Any throw falls back to the greybox above for the rest of the session (and says so once). */
  let artOff = false;
  function artWorld(g, cx, cy, t) {
    const E = L().gqEscape, A = L().arena, esc = S.esc, VW0 = (g.canvas && g.canvas.width) || 320;
    if (!art3(() => { GQ3A.drawStairSet(g, cx, cy, t, VW0); deckArt(g, cx, cy, t, VW0); })) { /* the greybox stands */ }
    try { towerDraw(g, cx, cy, t); } catch (err) { /* nothing */ }
    if (S.fleeP && !(S.fleeP.done && (t - S.fleeP.done > 0.6 || (S.esc && S.esc.on)))) { const fk = Math.min(1, (t - (S.fleeP.t0 || 0)) / 0.45); if (!art3(() => GQ3A.drawRoyalPortal(g, S.fleeP.x - cx, S.fleeP.y - 10 - cy, t, fk < 1 ? { state: 'open', k: fk } : { state: 'idle' }))) GA.drawPortal(g, S.fleeP.x - cx, S.fleeP.y - cy, t, 0.8, '#b28cff'); }
    if (S.fled && S.fled.open > 0) { const F0 = S.fled, ee = q(), sn = ee && ee.mode === 'fledSnap'; if (!art3(() => GQ3A.drawRoyalPortal(g, F0.px - cx, F0.py - 6 - cy, t, sn ? { state: 'snap', k: F0.open, tint: 'royal' } : F0.open < 1 ? { state: 'open', k: F0.open, tint: 'royal' } : { state: 'idle', tint: 'royal' }))) GA.drawPortal(g, F0.px - cx, F0.py - cy, t, F0.open * 1.4, '#ffd36b'); }
    const c = S.crown;
    if (c) GA.drawCrown(g, c.x - cx, c.y - cy - 3, t, { ang: c.state === 'floor' ? 0.4 : c.spin || 0, home: !!c.home });
    for (const p of S.portals) {
      if (!p.fired) { const a0 = Math.atan2(p.aimY - p.y, p.aimX - p.x), k0 = Math.min(1, (t - p.t0) / G.portal.glow);
        for (let j = 0; j < G.portal.fan; j++) GA.drawAimLine(g, p.x - cx, p.y - cy, a0 + (j - (G.portal.fan - 1) / 2) * G.portal.spread * Math.PI / 180, 150, t, 0.2 + 0.25 * k0); }
      GA.drawPortal(g, p.x - cx, p.y - cy, t, p.fired ? 1 : Math.min(1, (t - p.t0) / G.portal.glow), p.fired ? '#fff6c8' : '#b28cff');
    }
    for (const r of S.rocks) GA.drawShard(g, r.x - cx, r.y - cy, t, { home: !!r.home, vx: r.vx, vy: r.vy, id: r.id | 0 });
    const R0 = S.roof, e = q();
    if (R0) {
      const RA = L().arena;
      for (const hx of (RA.hatches || [])) GA.drawHatch(g, hx * TS - cx, RA.floor - cy, !!(R0.hatch && R0.hatch.x === hx), t);
      for (const gy of R0.geysers) GA.drawGeyser(g, gy.x - cx, RA.floor - cy, !!gy.done, gy.done ? Math.max(0, (gy.until - t) / 0.28) : 0, t);
      if (R0.whip && t - R0.whip.t0 < 0.3 && e) GA.drawLash(g, e.x - cx + R0.whip.face * 14, e.y - (R0.whip.high ? 30 : 5) - cy, R0.whip.face, G.roof.lashReach, (t - R0.whip.t0) / 0.3, t, !!R0.whip.high);
      if (e && (e.mode === 'lashHighTell' || e.mode === 'lashLowTell')) GA.drawLashTell(g, e.x - cx + e.face * 14, e.y - (e.mode === 'lashHighTell' ? 36 : 5) - cy, e.face, e.mode === 'lashHighTell', t);
      if (e && e.mode === 'ambushTell') GA.drawPortal(g, R0.ambushX - cx, RA.floor - 14 - cy, t, 1 - e.modeT / G.roof.ambushTell, '#c9a0ff');
      if (R0.storm && R0.storm.x !== undefined) GA.drawCrown(g, R0.storm.x - cx, R0.storm.y - cy - 3, t, { ang: R0.storm.ang || 0, glow: 1 });
    }
    if (e && e.mode === 'stunned') GA.drawStunStars(g, e.x - cx, e.y - 64 - cy, t);
    if (e && e.mode === 'crownTossTell') GA.drawGlint(g, e.x - cx + e.face * 24, e.y - 56 - cy, t);
  }
  const greyWorld = H.drawWorld;
  H.drawWorld = (g, cx, cy, t) => {
    if (!S) return;
    try { mechDraw(g, cx, cy, t); geodeDraw(g, cx, cy, t); roofDraw(g, cx, cy, t); } catch (err) { /* greybox only */ }
    if (G52) { try { G52.draw(g, cx, cy, t); } catch (err) { /* greybox only */ } }   /* (claude/gq5q2) the rope, the perch ward, the hatch, the sweep */
    if (G5) { try { G5.draw(g, cx, cy, t); } catch (err) { /* greybox only */ } }   /* (claude/gq5q1) the hoists, the floor fire */
    if (Q4) { if (!art4Off) { try { q4DrawArt(g, cx, cy, t); } catch (err) { art4Off = true; console.warn('gq4 art off (greybox):', err && err.message); } } if (art4Off) { try { q4Draw(g, cx, cy, t); } catch (err) { /* greybox only */ } } }
    if (artOff) return greyWorld(g, cx, cy, t);
    try { artWorld(g, cx, cy, t); } catch (err) { artOff = true; console.warn('gqueen art off (greybox):', err && err.message); greyWorld(g, cx, cy, t); }
  };

  /* ---------------- TOOLS / BOT ---------------- */
  H.shots = () => {
    if (!S) return [];
    const out = [];
    if (S.crown && S.crown.state !== 'floor' && S.crown.state !== 'ringwait') out.push({ id: S.crown.id, x: S.crown.x, y: S.crown.y, vx: S.crown.vx, vy: 0, kind: 'crown', home: !!S.crown.home });
    for (const r of S.rocks) if (!r.dead) out.push({ id: r.id, x: r.x, y: r.y, vx: r.vx, vy: r.vy, kind: 'rock', home: !!r.home, p2: !!r.p2, hang: r.hang > 0 });
    if (S.geode && (S.geode.state === 'fly' || S.geode.state === 'back')) out.push({ id: S.geode.id, x: S.geode.x, y: S.geode.y, vx: S.geode.state === 'back' ? 0 : (S.geode.tx - S.geode.x0) / G.geode.air, vy: 0, kind: 'geode', home: S.geode.state === 'back' });
    const st = S.roof && S.roof.storm; if (st && st.x !== undefined) { const w = Math.PI * 2 / G.roof.orbitTurn; out.push({ id: 's' + Math.floor(st.ang / (Math.PI * 2)), x: st.x, y: st.y, vx: -Math.sin(st.ang) * G.roof.orbitR * w, vy: Math.cos(st.ang) * G.roof.orbitR * 0.55 * w, kind: 'storm', home: false }); }
    return out;
  };
  H.stage = () => { const e = q(); return e && e.stage ? e.stage : 'hall'; };
  H.portals = () => (S ? S.portals.map(p => ({ x: p.x, y: p.y, state: p.state })) : []);
  H.read = () => S ? { crown: S.crown ? { ...S.crown } : null, rocks: S.rocks.length, portals: S.portals.length, stunUntil: S.stunUntil, stuns: S.stuns, persist: persist ? { ...persist } : null,
    esc: S.esc ? { on: S.esc.on, fireOn: S.esc.fireOn, checked: S.esc.checked, inTower: S.esc.inTower, burning: S.esc.fl ? S.esc.fl.map(f => f.burning) : [], beams: S.esc.beams ? S.esc.beams.length : 0, queenK: S.esc.q ? S.esc.q.k : null } : null,
    roof: S.roof ? { ambushX: S.roof.ambushX, geysers: S.roof.geysers.map(g => ({ x: g.x, at: g.at })), storm: !!S.roof.storm, adds: [...S.roof.adds] } : null } : null;
  /* (claude/gq2) THE LAB'S SKIP (src/lab-gqueen.js, King Gorm's gormSkipRun precedent): from the escape, light the roof shrine (checkpoint + persist 'roof') and take her portal - the tower top
     begins as if the hero had climbed and stepped in. Only the lab calls it (opts.gqEscape 'skip', or its stall guard). true = it went to the roof. */
  H.skipRoof = () => {
    const e = q(), E = L().gqEscape; if (!S || !e || e.stage !== 'escape' || !E) return false;
    if (!S.esc) startEscape(false);
    S.esc.checked = true; if (persist) persist.stage = 'roof'; ctx.setCheckpoint(E.check.x * TS + 8, (E.check.y + 1) * TS);
    S.esc.step = null; toRoof(); return e.stage === 'roof';
  };
  /* (claude/hcfix) tools/hcfix-fights-sheet.mjs: start each told move the way her own chooser does (the mark, the sound, the set-up), for the stills */
  Object.assign(H.test = H.test || {}, { start: k => { const e = q(); if (!e || !S) return false; if (k !== 'crown' && k !== 'portal' && !S.roof) roofBegin(e); if (k === 'lash') startLash(e); else if (k === 'ambush') startAmbush(e); else if (k === 'geyser') startGeyser(e); else if (k === 'leap') startLeap(e); else if (k === 'crown') roofCrown(e); else if (k === 'portal') roofPortal(e); else if (k === 'blink') startBlink(e); else if (k === 'storm') { e.mode = 'stormTell'; e.modeT = 0.5; } else if (k === 'bays') { for (let i = 0; i < S.roof.bays.length; i++) lightBay(S.roof, i, now()); } else return false; return e.mode; } });
  Object.assign(H.test = H.test || {}, { toss:() => { const e = q(); if (e && S) { e.mode = 'crownTossTell'; e.modeT = 0.01; } }, stun: (d, p) => stun(q(), d, p || 0) });
  return H;
}
