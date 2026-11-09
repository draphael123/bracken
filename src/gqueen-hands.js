// src/gqueen-hands.js - THE GOBLIN QUEEN 3's HANDS (claude/gqueen3, scratch/plan-goblinqueen3-1104.md; modelled on src/gorm-hands.js: P1 -> flee -> P2 persists across death).
// main.js owns the world and her mode machine (updateGQueen); this file owns what is NEW:
//   - her CROWN and her PORTAL ROCK SHARDS, in their OWN arrays (never `seeds`: the pyro's ember ward, the pirate's hook catch and the ranger's snatch eat seeds)
//   - the PARRY of either one: gqHit() asks damagePlayer and reads the shared parry counter (RP.stats.parries), so every hero's beat path covers it
//   - STUNNED (the main opening), the flee, the escape up the burning hall, the portal step and phase two on THE TOWER TOP (later commits)
// Starting numbers are the plan's (tune lane next week). Art = placeholders (frames 2/6/7/15/16 until the art lane).
import * as GA from './redraw/gqueen_art.js'; import * as BW from './bell-winch.js';   /* (claude/highcrown3) the bell lure + the winch wave, shared with the Goblin Princess */   /* (claude/gq2art) the art */
export const GQ3 = {
  stunGuard: 1.5, stunRoof: 3.0,       // s after a stun in which no second stun can land (no stunlock, B12); the stun a parry gives on the tower top
  crown: { cd: 7, cd2: 5.5, tell: 0.8, out: 230, reach: 210, hang: 0.15, back: 260, dmg: 16, home: 340, stun: 3.0, stunHp: 0.04, fetch: 1.2, dy: 14, r: 5 },
  portal: { cd: 8, cd2: 6, tell: 1.0, n: 2, n2: 3, glow: 0.9, gap: 0.35, fan: 3, spread: 14, v: 210, dmg: 10, minDist: 90, home: 320, stun: 2.2, stunHp: 0.03, clankHp: 0.01, rows: [12, 13, 14, 15, 16], r: 4 },
};
GQ3.hp2 = 1400;   /* (gq3 item 6: 1750 -> 1400 with the P2 resist 0.5x; the tune lane owns it) */
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
GQ3.mech = { bellCd: 10, lureMax: 3.2, speed: 250, tell: 0.9, under: 13, pin: 3.5, pinMul: 1.1, pinCap: 0.15,   /* (claude/hcqueen: pin 4.0 x1.35 uncapped -> 3.5 s x1.1, a pin's blows at most 15% of her bar (main.js gqPinCap). The tally put 50-80% of her hall bar in the lured pin, a pyro 1000+ a pin. Band 75% -> 70% n=108) */ contact: 14, contactR: 26, grateHold: 3.5, queue: 1.5,
  addAt: [0.66, 0.33], delay: 5.5, closeAfter: 1.5, crank: 3, crankWin: 2.0, winchCol: 9, guards: [['soldier'], ['soldier', 'javelin']] };
export const GQ_SAY = { healed: 'FULLY HEALED', flee: 'SHE FLEES', step: 'STEP INTO HER PORTAL', check: 'SHRINE', crowned: 'CROWNED', clank: 'CLANK', fetch: 'SHE FETCHES HER CROWN' };

export function makeGQueenHands(ctx) {
  const TS = ctx.TS, H = {};
  const L = () => ctx.L;
  let S = null;
  const q = () => { const b = ctx.boss(); return b && b.t === 'gqueen' && b.alive ? b : null; };
  const now = () => ctx.time();
  const sfx = k => { const f = ctx.sfx[k]; if (f) f(); };
  const sign = v => (v < 0 ? -1 : 1);
  const G = GQ3;
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
  const fresh = () => ({ crown: null, geode: null, geodeBits: [], rocks: [], portals: [], cast: null, stunUntil: 0, stunGuardUntil: 0, stuns: 0, said: new Set(), rid: 0, esc: null, coll: new Map(), slate: new Map(), mech: { cd: 0, lure: null, queued: 0, waves: new Set(), wave: null, crank: 0, crankAt: -9, kept: 0, joined: 0, rings: 0, pins: 0, winchObj: {}, bellObj: {} } });
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
    S = fresh(); restoreHall();
    const e = ctx.boss();
    if (persist && e && e.t === 'gqueen') { toEscape(e); ctx.layEscape(); ctx.shutWest(); startEscape(persist.stage === 'roof'); }
  };
  /* while she is gone (the flee, the escape, a retry of phase two) the ordinary arena trigger must not wake her in the hall */
  H.hold = () => { const e = q(); return !!(e && e.stage && e.stage !== 'hall'); };
  function toEscape(e) { e.stage = 'escape'; e.phase = 3; e.mode = 'gone'; e.modeT = 0; e.hidden = true; e.alive = true; e.dying = 0; e.maxHp = e.hp = G.hp2; e.maxHp2 = G.hp2; e.vx = 0; e.vy = 0; e.crownOut = false; e.open = 0; }

  /* ONE DOOR for every blow of hers that can be parried: a yellow, blockable damagePlayer, and the answer is whether the shared parry counter moved.
     (Every hero's beat path - the knight's raised shield, the warden's deflect, the pyro's ward, the pirate's catch - calls RP.parried, so all nine are covered with no per-hero code.)
     Never `unblockable`, never `pierce`: a red or a piercing blow is TOO STRONG and is never parried. */
  function gqHit(x, dmg, who, name) {
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
      volT: G.esc.fan, vol: null, beams: [], beamT: G.tower.beamFirst, fl: [0, 1, 2, 3].map(() => ({ lastOn: tt, smokeAt: 0, burning: false, tick: new Map() })),
      q: { k: G.tower.start, x: 796 * TS + 8, hopAt: tt + G.tower.hopEvery, entry: null, flash: null } };
    for (const t0 of E.throwers || []) ctx.spawnEnt({ t: t0.t, x: t0.x, y: t0.y, face: -1 });
  }
  function gqRed(x, dmg, name, extra) { return ctx.damage(x, dmg, { unblockable: true, name, ...(extra || {}) }); }
  /* which storey of THE BURNING TOWER a hero's feet are in (0 = the foot, 4 = the top, 5 = the deck above the hatch); -1 = not in the tower */
  function storeyOf(p, E) {
    const Tw = E.tower; if (p.x < (Tw.SHAFT[0] - 2) * TS || p.x > (Tw.SHAFT[1] + 2) * TS) return p.y < 21 * TS && p.x > Tw.DECK.x0 * TS ? 5 : -1;
    if (p.y < 22 * TS) return 5;
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
        if (P1.gqFireT <= 0) { P1.gqFireT = G.esc.fireEvery; gqRed(P1.x, G.esc.fire, 'THE BURNING FLOOR', { spare: true, noKnock: true }); P1.vy = -G.esc.push; P1.ground = false; ctx.burst(P1.x, F[k] * TS - 2, 6, ['#ff9a5c', '#ffd36b', '#ff6b2c'], 60, 0.4); }
      } else if (h0.p.gqFireT !== undefined) h0.p.gqFireT = Math.min(h0.p.gqFireT, 0.25);
    }
    // ---- THE BURNING BEAMS: a creak and a shadow on the floor (1.0 s, '!!'), then a beam down the shaft: 14 red, step aside ----
    if (top >= 0 && top < 5) {
      esc.beamT -= dt;
      if (esc.beamT <= 0) { const tg = hs.find(h0 => h0.k === top).p, bx = Math.max(Tw.SHAFT[0] * TS + 10, Math.min(Tw.SHAFT[1] * TS - 10, tg.x + (Math.random() - 0.5) * 70));
        esc.beams.push({ x: bx, k: top, at: t + G.tower.beamTell, state: 'tell', done: false }); esc.beamT = G.tower.beamEvery[0] + Math.random() * (G.tower.beamEvery[1] - G.tower.beamEvery[0]);
        ctx.number(bx, F[top] * TS - 34, '!!', '#ff6b6b'); sfx('crack'); sfx('crumble'); }
    }
    for (const b of esc.beams) {
      if (b.state === 'tell' && t >= b.at) { b.state = 'fall'; b.at = t + 0.3; ctx.shake(5); sfx('thud'); ctx.dust(b.x, F[b.k] * TS, 8); ctx.burst(b.x, F[b.k] * TS - 6, 12, ['#ff9a5c', '#ffd36b', '#5a3a1a'], 110, 0.5);
        for (const h0 of hs) if (h0.k === b.k && Math.abs(h0.p.x - b.x) < G.tower.beamW) gqRed(b.x, G.tower.beamDmg, 'A BURNING BEAM', {}); }
      else if (b.state === 'fall' && t >= b.at) b.done = true;
    }
    esc.beams = esc.beams.filter(b => !b.done);
    // ---- HER: seen a storey ahead; she hops up by portal every ~8 s (her entry portal stays open 1.5 s: step in = a SHORTCUT) ----
    const e = q(), qq = esc.q;
    if (e) {
      e.hidden = false; e.x = qq.x; e.y = F[qq.k] * TS; e.face = -1; e.mode = 'gone'; e.vx = 0; e.vy = 0;
      if (t >= qq.hopAt && qq.k < 4 && qq.k <= top) {
        const nx = Tw.SHAFT[0] + 6 + Math.floor(Math.random() * 14), ex = { x: nx * TS + 8, y: F[qq.k + 1] * TS };
        qq.entry = { x: qq.x, y: F[qq.k] * TS, until: t + G.tower.hopOpen, exit: ex }; qq.flash = { x: ex.x, y: ex.y, until: t + 0.5 };
        ctx.burst(qq.x, F[qq.k] * TS - 20, 12, ['#b28cff', '#e8dcff', '#2a1a3a'], 80, 0.5); sfx('portalOpen'); ctx.number(qq.x, F[qq.k] * TS - 44, 'SHE HOPS UP', '#b28cff');
        qq.k++; qq.x = ex.x; qq.hopAt = t + G.tower.hopEvery;
      }
      if (qq.entry && t < qq.entry.until) {
        const en = qq.entry, who = hs.find(h0 => h0.k >= 0 && Math.abs(h0.p.x - en.x) < 12 && Math.abs(h0.p.y - en.y) < 26);
        if (who) { const ex = en.exit; qq.entry = null; let n = 0; for (const h0 of hs) { h0.p.x = ex.x - 26 + ([0, 14, 28, 42][n++] ?? 14); h0.p.y = ex.y; h0.p.vx = 0; h0.p.vy = 0; } sfx('portalOpen'); ctx.burst(ex.x, ex.y - 12, 12, ['#b28cff', '#e8dcff'], 80, 0.5); ctx.number(ex.x, ex.y - 40, 'A SHORTCUT', '#b28cff'); }
      } else if (qq.entry) qq.entry = null;
    }
    // ---- THE PHOTO'S ATTACK (item 4): ONE portal above you, glowing 0.9 s, then three shards at 165 px/s (4 each) every 6.0 s ----
    if (esc.fireOn && top >= 0 && top < 5) {
      esc.volT -= dt;
      if (esc.volT <= 0 && !esc.vol) { const tg = hs.find(h0 => h0.k === top).p; esc.vol = { at: t + G.esc.cue, px: tg.x + (Math.random() < 0.5 ? -22 : 22), py: Math.max((F[top] - 11) * TS + 14, tg.y - 70), k: top }; esc.volT = G.esc.fan; ctx.number(esc.vol.px, esc.vol.py - 14, '!', '#ffd36b'); sfx('portalOpen'); }
      if (esc.vol && t >= esc.vol.at) { const tg = ctx.P(); fan(esc.vol.px, esc.vol.py, tg.x, tg.y - 8, true); esc.vol = null; }
    }
    // ---- the roof shrine at the hatch top, then the fight: walk past the shrine ----
    const sx = E.check.x * TS + 8, sy = (E.check.y + 1) * TS;
    if (!esc.checked && here.some(p => Math.abs(p.x - sx) < 20 && Math.abs(p.y - sy) < 30)) {
      esc.checked = true; if (persist) persist.stage = 'roof'; ctx.setCheckpoint(sx, sy); sfx('sting');
      ctx.burst(sx, sy - 16, 14, ['#ffd36b', '#fff6c8', '#8fd160'], 50, 0.9); ctx.number(sx, sy - 36, GQ_SAY.check, '#ffd36b');
      ctx.hint('THE TOWER TOP. SHE WAITS ON THE ROOF.');
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
    esc.q.hopAt = now() + G.tower.hopEvery; esc.q.k = G.tower.start; esc.q.x = 796 * TS + 8; esc.volT = G.esc.fan;
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
  function roofBegin(e) { S.roof = { lash: 0, ambushCd: 6, geyserCd: 4, lashCd: 2, blinkCd: 3, stormAt: 0, stormBreakAt: 0, adds: new Set(), hatch: null, geysers: [], banner: null, orbit: null, blink: null, reinf: null, pstorm: null,
    bays: [0, 1, 2, 3].map(() => ({ state: 'idle', at: 0, until: 0 })), bayT: G.p2.bayEvery, bayNext: 0, bayN: 0 }; }
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
  function pickExit(P0, minDx, noCupola) {
    const rs = rings().map(r => ({ r, p: ringPos(r) })).filter(o => Math.abs(o.p.x - P0.x) >= minDx && !(noCupola && o.r.id === 'cu'));   /* (the crown flies at chest height: it cannot come out of the cupola's stone) */
    if (!rs.length) return rings()[0] ? { r: rings()[0], p: ringPos(rings()[0]) } : null;
    rs.sort((a, b) => Math.abs(a.p.x - P0.x) - Math.abs(b.p.x - P0.x)); return rs[Math.floor(Math.random() * Math.min(2, rs.length))];
  }
  function blinkGo(e) {
    const R0 = S.roof, P0 = ctx.P(), ex = pickExit(P0, 60); if (!ex) { e.mode = 'rec'; e.modeT = 0.5; return; }
    ctx.burst(e.x, e.y - 24, 14, ['#3a2a4a', '#7a4aa0', '#c9a0ff'], 80, 0.5); e.hidden = true; e.vx = 0; e.mode = 'blinkGone'; e.modeT = G.p2.blinkGone + 5;
    R0.blink = { ring: ex.r.id, x: ex.p.x, y: ex.p.y, at: now() + G.p2.blinkGlow, kind: 'blink' }; sfx('portalOpen');
  }
  H.roofStep = (e, dt) => {
    if (!S) return undefined;
    if (!S.roof) roofBegin(e);
    const R0 = S.roof, P0 = ctx.P(), RA = L().arena, d = P0.x - e.x, ad = Math.abs(d), tt = now();
    R0.lashCd -= dt; R0.ambushCd -= dt; R0.geyserCd -= dt; R0.leapCd = (R0.leapCd ?? 3) - dt;
    switch (e.mode) {
      case 'wake': if (e.modeT <= 0) { e.mode = 'roofStand'; e.modeT = 0.6; roofMus(1); ctx.number(e.x, e.y - 70, 'THE TOWER TOP', '#ffd36b'); } return 0;
      case 'roofStand': case 'stand': {
        e.mode = 'roofStand'; e.face = sign(d) || e.face;
        const want = ad > 56 ? e.face * 62 : 0;
        if (e.modeT <= 0 && !P0.dead) {
          const hpk = e.hp / e.maxHp, stormUp = hpk < G.p2.desperate && !R0.pstorm && tt >= (R0.stormAt ?? 0);
          if (stormUp) { e.mode = 'stormTell'; e.modeT = G.p2.stormTell; R0.stormAt = tt + G.p2.stormEvery; ctx.number(e.x, e.y - e.h - 12, '!', '#ffd36b'); sfx('callerChant'); roofMus(2); }
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
        if (e.modeT <= 0) { R0.pstorm = { i: 0, at: tt + 0.3, shard: [] }; e.mode = 'stormFire'; e.modeT = 99; sfx('callerBlast'); ctx.ring(e.x, e.y - 30, 30, '#ffd36b', 0.4); ctx.shake(5);
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
      e.mode = 'stumble'; e.modeT = G.p2.stumble; ctx.burst(b.x, b.y - 22, 16, ['#fff6c8', '#e8dcff', '#b28cff'], 90, 0.5); ctx.ring(b.x, b.y - 20, 22, '#fff6c8', 0.35); sfx('callerBlast'); ctx.number(b.x, b.y - 46, 'SHE STEPS OUT', '#8fd160');
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
      const rs = rings();
      if (ps.i < rs.length && tt >= ps.at) { const r = rs[ps.i], p = ringPos(r), tg = target(); ps.lit = { id: r.id, until: tt + 0.35 }; fan(p.x, p.y - 14, tg.x, tg.y - 8, true); ps.i++; ps.at = tt + G.p2.stormStep; sfx('portalOpen'); }
      else if (ps.i >= rs.length && tt >= ps.at) {
        R0.pstorm = null; const cu = rs.find(r => r.id === 'cu') || rs[rs.length - 1], cp = ringPos(cu);
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
    const sendBack = how => { Ge.state = 'back'; Ge.t = 0; ctx.ring(Ge.x, Ge.y, 14, '#c8f08a', 0.25); sfx('parry'); ctx.number(Ge.x, Ge.y - 14, how === 'parry' ? 'PARRIED: SENT BACK' : 'STRUCK BACK', '#8fd160'); };
    // any blow or shot that meets it in the air
    seats(P1 => { if (Ge.state !== 'fly' || P1.dead) return; if (hit(P1, box, Ge.key)) sendBack('blow'); });
    if (Ge.state === 'fly') for (const pp of ctx.players ? ctx.players() : []) for (const ar of pp.rgArrows || []) { if (Ge.state !== 'fly' || ar.state !== 'fly' || ar.ggHit) continue; if (Math.abs(ar.x - Ge.x) < gc.r + 10 && Math.abs(ar.y - Ge.y) < gc.r + 8) { ar.ggHit = true; ar.state = 'drop'; sendBack('blow'); } }
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
  function geodeDraw(g, cx, cy, t) {   // GREYBOX (GQ3ART draws the geode x3 rot, the shatter, the floor mark)
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
      if (r.home) {
        const dx = e.x - r.x, dy = (e.y - 36) - r.y, dd = Math.hypot(dx, dy) || 1, sp = pc.home * dt;
        if (dd <= sp + 12) {
          r.dead = true;
          if (!(r.cast && r.cast.stunned) && stun(e, pc.stun, pc.stunHp, GQ_SAY.crowned)) { /* stunned: the shard is spent */ }
          else { e.hp -= Math.round(e.maxHp * pc.clankHp); e.flash = 0.25; ctx.number(e.x, e.y - 60, GQ_SAY.clank, '#c9c9d6'); sfx('clank'); if (e.hp <= 0) ctx.hurt(e, 1, e.x); }
          continue;
        }
        r.x += dx / dd * sp; r.y += dy / dd * sp; continue;
      }
      r.x += r.vx * dt; r.y += r.vy * dt;
      if (r.t > 4 || ctx.solid(Math.floor(r.x / TS), Math.floor(r.y / TS))) { r.dead = true; ctx.dust(r.x, r.y, 3); continue; }
      seats(P1 => {   /* (claude/gq2) every seat: the first hero it meets */
        if (r.dead || r.home || P1.dead || !ctx.overlap({ l: r.x - pc.r, r: r.x + pc.r, t: r.y - pc.r, b: r.y + pc.r }, ctx.hurtBox())) return;
        r.dead = true;
        const h = gqHit(r.x - sign(r.vx) * 12, r.esc ? G.esc.shardDmg : pc.dmg, e, 'A PORTAL SHARD');
        if (h.parried && !r.esc && e) { r.dead = false; r.home = true; ctx.ring(r.x, r.y, 12, '#fff6c8', 0.25); sfx('clank'); }
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
      case 'portalTell':
        e.face = sign(P0.x - e.x) || e.face;
        if (Math.random() < dt * 30) ctx.part({ x: e.x + e.face * 10 + (Math.random() - 0.5) * 10, y: e.y - 66 - Math.random() * 10, vx: 0, vy: -24, life: 0.4, max: 0.4, col: '#b28cff', size: 2, grav: 0, glow: true });
        if (e.modeT <= 0) { e.mode = 'portalCast'; e.modeT = openPortals(e, e.stage === 'roof' ? G.portal.n : (e.phase >= 2 ? G.portal.n2 : G.portal.n)); }
        return 0;
      case 'portalCast':
        if (e.modeT <= 0) { e.mode = 'rec'; e.modeT = 0.5; }
        return 0;
      case 'stunned':
        e.vx = 0;
        if (Math.random() < dt * 12) ctx.part({ x: e.x + (Math.random() - 0.5) * 30, y: e.y - 60 - Math.random() * 8, vx: 0, vy: -16, life: 0.5, max: 0.5, col: '#ffd36b', size: 2, grav: 0, glow: true });
        if (e.modeT <= 0) { e.mode = 'rec'; e.modeT = 0.6; ctx.shake(3); sfx('bellow'); }
        return 0;
    }
    return undefined;
  };
  /* her choice, called from 'stand' when she is free to act: true = it set her mode */
  H.choose = (e, ad) => {
    if (!S || e.crownOut || (e.stage && e.stage !== 'hall')) return false;
    const p2 = e.phase >= 2;
    if ((e.crownCd ?? 3) <= 0 && ad > 60) {
      e.crownCd = p2 ? G.crown.cd2 : G.crown.cd; e.mode = 'crownTossTell'; e.modeT = G.crown.tell; ctx.number(e.x, e.y - e.h - 12, '!', '#ffd36b'); sfx('callerChant'); return true;
    }
    if ((e.portalCd ?? 6) <= 0 && ad > 40) {
      e.portalCd = p2 ? G.portal.cd2 : G.portal.cd; e.mode = 'portalTell'; e.modeT = G.portal.tell; ctx.number(e.x, e.y - e.h - 12, '!', '#ffd36b'); sfx('callerChant'); return true;
    }
    if ((e.geodeCd ?? 5) <= 0 && ad > G.geode.minDist && !S.geode && !S.mech.wave && !S.mech.lure && inHall(e)) { e.geodeCd = p2 ? G.geode.cd2 : G.geode.cd; geodeBegin(e); return true; }
    return false;
  };
  H.tick = (e, dt) => { if (!S) return; e.crownCd = (e.crownCd ?? 3) - dt; e.portalCd = (e.portalCd ?? 6) - dt; e.geodeCd = (e.geodeCd ?? 5) - dt; };

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
    if (BW.ringBell(M, tt, GM.bellCd, GM.queue) === 'swinging') { ctx.number(b.x, b.y - 30, 'STILL SWINGING', '#c9c9d6'); sfx('clank'); return; }
    b.swingT = 1.4; b.swing = 0.8;
    ctx.number(b.x, b.y - 30, 'YOU RING THE BELL', '#ffd36b'); sfx('seaBell'); sfx('clank'); ctx.shake(2);
  }
  function lureBegin(e, b) {
    const M = S.mech, gx = b.gate * TS + 8;
    M.queued = 0; M.lure = { x: gx, state: 'run', wait: 0, hit: new Set() };
    e.mode = 'lure'; e.modeT = GM.lureMax; e.crownOut = false; e.face = sign(gx - e.x) || e.face;
    ctx.number(e.x, e.y - e.h - 12, '!!', '#ff6b6b'); ctx.number(e.x, e.y - 70, 'SHE HEARS IT', '#ff6b6b'); sfx('bellow'); sfx('callerChant');
  }
  /* the storm: a blockable charge at the sound (a parry on it stuns her, as on every told blow), then 0.9 s under the grate while its column glows, then the grate drops */
  function lureStep(e, dt) {
    const M = S.mech, Lu = M.lure, b = bellProp();
    if (!Lu || !b) { e.mode = 'rec'; e.modeT = 0.5; M.lure = null; return 0; }
    const dx = Lu.x - e.x; e.face = sign(dx) || e.face;
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
      if (!M.lure && BW.ringFresh(M, tt) && safeToLure(e) && !(b.open > 0)) lureBegin(e, b);
    }
    /* THE BARRACKS GATE */
    const W0 = M.wave;
    if (!W0) {
      for (const k of GM.addAt) if (e.hp <= e.maxHp * k && !M.waves.has(k) && e.mode !== 'sleep' && e.mode !== 'wake') { M.waves.add(k); startWave(e, k); break; }
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
    const e = q(), M = S && S.mech, b = bellProp(); if (!e || !M || !inHall(e) || !b) return null;
    const A = L().arena, w = winchAt(), gx = b.gate * TS + 8;
    if (M.wave && M.wave.state === 'open') return { x: w.x, face: sign(w.x - P0.x), swing: true, why: 'winch' };
    if (M.lure) return { x: Math.max(A.x0 + 24, Math.min(A.x1 - 24, gx + (P0.x < gx ? -80 : 80))), face: sign(e.x - P0.x), swing: false, why: 'clear' };
    if (now() >= M.cd && safeToLure(e) && !(b.open > 0)) return { x: b.x + 18, face: -1, swing: true, why: 'bell' };
    return null;
  };
  H.mech = () => (S ? S.mech : null);
  Object.assign(H.test = H.test || {}, { geodeBegin: () => { const e = q(); if (e && S) geodeBegin(e); }, ringBell: () => { const e = q(), b = bellProp(); if (e && b && S) ringIt(e, b); } });

  /* ---------------- PER FRAME ---------------- */
  H.update = dt => {
    if (!S) return;
    { const e0 = q(), R1 = S.roof; let up = false; seats(p => { if (!p.dead) up = true; });
      if (mLvl && (!e0 || e0.hp <= 0 || e0.stage !== 'roof' || !ctx.bossActive() || !up)) musicLift(0);   /* (claude/gqmusic) she is dead, the fight is over, or every hero is down */
      else if (!mLvl && R1 && R1.mus && e0 && e0.stage === 'roof' && ctx.bossActive() && up) musicLift(R1.mus); }
    if (S.esc && S.esc.on) escapeStep(dt);
    if (S.rocks.length) rockStep(dt);
    if (!ctx.bossActive() || !q()) { S.crown = null; S.geode = null; S.geodeBits = []; if (!(S.esc && S.esc.on)) { S.rocks = []; } S.portals = []; return; }
    crownStep(dt); portalStep(dt); geodeStep(dt); bitsStep(dt); if (S.roof) roofUpdate(dt); mechStep(dt);
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
    try { towerDraw(g, cx, cy, t); } catch (err) { /* nothing */ }   /* (gq3) greybox until GQ3ART */
    if (S.fleeP && !(S.fleeP.done && (t - S.fleeP.done > 0.6 || (S.esc && S.esc.on)))) GA.drawPortal(g, S.fleeP.x - cx, S.fleeP.y - cy, t, 0.8, '#b28cff');
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
    if (artOff) return greyWorld(g, cx, cy, t);
    try { artWorld(g, cx, cy, t); } catch (err) { artOff = true; console.warn('gqueen art off (greybox):', err && err.message); greyWorld(g, cx, cy, t); }
  };

  /* ---------------- TOOLS / BOT ---------------- */
  H.shots = () => {
    if (!S) return [];
    const out = [];
    if (S.crown && S.crown.state !== 'floor' && S.crown.state !== 'ringwait') out.push({ id: S.crown.id, x: S.crown.x, y: S.crown.y, vx: S.crown.vx, vy: 0, kind: 'crown', home: !!S.crown.home });
    for (const r of S.rocks) if (!r.dead) out.push({ id: r.id, x: r.x, y: r.y, vx: r.vx, vy: r.vy, kind: 'rock', home: !!r.home });
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
  Object.assign(H.test = H.test || {}, { start: k => { const e = q(); if (!e || !S) return false; if (k !== 'crown' && k !== 'portal' && !S.roof) roofBegin(e); if (k === 'lash') startLash(e); else if (k === 'ambush') startAmbush(e); else if (k === 'geyser') startGeyser(e); else if (k === 'leap') startLeap(e); else if (k === 'crown') roofCrown(e); else if (k === 'portal') roofPortal(e); else return false; return e.mode; } });
  Object.assign(H.test = H.test || {}, { toss:() => { const e = q(); if (e && S) { e.mode = 'crownTossTell'; e.modeT = 0.01; } }, stun: (d, p) => stun(q(), d, p || 0) });
  return H;
}
