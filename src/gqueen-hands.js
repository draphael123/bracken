// src/gqueen-hands.js - THE GOBLIN QUEEN 3's HANDS (claude/gqueen3, scratch/plan-goblinqueen3-1104.md; modelled on src/gorm-hands.js: P1 -> flee -> P2 persists across death).
// main.js owns the world and her mode machine (updateGQueen); this file owns what is NEW:
//   - her CROWN and her PORTAL ROCK SHARDS, in their OWN arrays (never `seeds`: the pyro's ember ward, the pirate's hook catch and the ranger's snatch eat seeds)
//   - the PARRY of either one: gqHit() asks damagePlayer and reads the shared parry counter (RP.stats.parries), so every hero's beat path covers it
//   - STUNNED (the main opening), the flee, the escape up the burning hall, the portal step and phase two on THE TOWER TOP (later commits)
// Starting numbers are the plan's (tune lane next week). Art = placeholders (frames 2/6/7/15/16 until the art lane).
import * as GA from './redraw/gqueen_art.js'; import * as BW from './bell-winch.js';   /* (claude/highcrown3) the bell lure + the winch wave, shared with the Goblin Princess */   /* (claude/gq2art) the art */
export const GQ3 = {
  stunGuard: 1.5, stunRoof: 3.0,       // s after a stun in which no second stun can land (no stunlock, B12); the stun a parry gives on the tower top
  crown: { cd: 7, cd2: 5.5, tell: 0.8, out: 230, reach: 210, hang: 0.15, back: 260, dmg: 16, home: 340, stun: 3.5, stunHp: 0.04, fetch: 1.2, dy: 14, r: 5 },
  portal: { cd: 8, cd2: 6, tell: 1.0, n: 2, n2: 3, glow: 0.9, gap: 0.35, fan: 3, spread: 14, v: 210, dmg: 10, minDist: 90, home: 320, stun: 2.2, stunHp: 0.03, clankHp: 0.01, rows: [12, 13, 14, 15, 16], r: 4 },
};
GQ3.hp2 = 1600;   // phase two's bar (THE TOWER TOP)
GQ3.flee = { tell: 1.6 };
GQ3.roof = { crownCd: 6, portalCd: 8, lashTell: 0.7, lashReach: 120, lashDmg: 18, lashCd: 2.4, ambushTell: 0.8, ambushCd: 9, ambushDmg: 15, geyserTell: 0.9, geyserN: 5, geyserGap: 0.25, geyserStep: 20, geyserDmg: 16, geyserCd: 7,
  leapCd: 5, orbitR: 40, orbitTurn: 1.2, orbitDmg: 12, orbitHit: 0.8, stormStun: 4.0, stormHp: 0.06, stormRegrow: 12, portalBelow: 0.6, stormBelow: 0.3, addAt: [0.66, 0.33], hatch: 0.8 };
GQ3.esc = { fire: 3, fireEvery: 0.8, push: 150, fan: 3.5, cue: 0.5, collapse: 0.6, relay: 6, slate: 0.5, slateRelay: 5, step: 0.5, shardDmg: 6 };
/* (claude/gq2mech) HIGHCROWN'S MECHANICS IN HER HALL (Daniel 11-06): (1) THE BELL IS YOURS - ring it (a blow on the bell) and she STORMS to the sound; under the grate when it drops she is PINNED ~4 s (a bigger
   window, x1.35 a blow); the bell has a cooldown. (2) THE BARRACKS GATE (her west door) rises at 66 / 33 % of her hall bar: crank the winch (3 blows, each inside 2 s of the last, any seat) before the horn
   runs out and the gate drops on her guards; fail and they join her. Hall only. Numbers are starting values for the tune lane. */
GQ3.mech = { bellCd: 10, lureMax: 3.2, speed: 250, tell: 0.9, under: 13, pin: 4.0, pinMul: 1.35, contact: 14, contactR: 26, grateHold: 3.5, queue: 1.5,
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
  H.load = () => { S = null; persist = null; const A = L() && L().arena; hallSnap = A && A.boss === 'gqueen' ? { ...A } : null; };
  const fresh = () => ({ crown: null, rocks: [], portals: [], cast: null, stunUntil: 0, stunGuardUntil: 0, stuns: 0, said: new Set(), rid: 0, esc: null, coll: new Map(), slate: new Map(), mech: { cd: 0, lure: null, queued: 0, waves: new Set(), wave: null, crank: 0, crankAt: -9, kept: 0, joined: 0, rings: 0, pins: 0, winchObj: {}, bellObj: {} } });
  /* her hall's arena as it was built (a portal step turns L.arena into the tower top's; a death turns it back) */
  function restoreHall() {
    const A = L().arena; if (!A || !hallSnap) return;
    for (const k of Object.keys(A)) if (!(k in hallSnap) && !['laid', 'taken', 'holeOpen', 'escLaid'].includes(k)) delete A[k];
    Object.assign(A, hallSnap);
  }
  H.reset = () => {
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
    if (!S || !e || e.t !== 'gqueen' || (e.stage && e.stage !== 'hall')) return false;
    const P0 = ctx.P();
    e.maxHp2 = G.hp2; e.maxHp = G.hp2; e.hp = G.hp2; e.stage = 'flee'; e.phase = 3; e.mode = 'fleeTell'; e.modeT = G.flee.tell; e.vx = 0; e.crownOut = false; e.alive = true; e.dying = 0; e.open = 0; e.stagger = 0;
    S.crown = null; S.rocks = []; S.portals = []; S.cast = null;
    persist = { stage: 'escape' };
    ctx.endFight(); ctx.shutWest(); ctx.layEscape();
    everyone(P1 => { if (P1 && !P1.dead) fullHeal(P1); });   /* (claude/gq2) the WHOLE PARTY is fully healed (each seat out of his own save: asPlayer swaps PROG for flaskMax) */
    const E = L().gqEscape; if (E) ctx.setCheckpoint(E.start.x * TS + 8, (E.start.y + 1) * TS);   /* escapeStart, on T1 */
    ctx.number(e.x, e.y - e.h - 30, GQ_SAY.flee, '#ff6b5c'); sfx('bellow'); ctx.shake(8); ctx.zoom(1.12, 0.5);
    ctx.hint('SHE HAS FLED THROUGH A PORTAL AND THE HALL IS ON FIRE. CLIMB OUT THROUGH THE ROOF - AND FOLLOW HER.');
    startEscape(false);
    return true;
  };
  /* her frame while she is not the hall's: the flee (a quiet tell, then through her portal), then nothing (hidden). main.js asks first; true = it ran her frame */
  H.step = (e, dt) => {
    if (!S) return false;
    if (e.stage === 'flee') {
      e.modeT -= dt; e.anim += dt; e.vx = 0; e.hidden = false;
      if (!S.fleeP) S.fleeP = { x: e.x + 40, y: e.y - 20, t0: now() };
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
    S.esc = { on: true, fireOn: false, fireT: 0.4, fanT: G.esc.fan, cueT: 0, checked: !!checked, step: null, musicSet: false, graceUntil: now() + (checked ? 0 : G.flee.tell) };
    for (const t of E.throwers) ctx.spawnEnt({ t: t.t, x: t.x, y: t.y, face: -1 });
  }
  function gqRed(x, dmg, name, extra) { return ctx.damage(x, dmg, { unblockable: true, name, ...(extra || {}) }); }
  function escapeStep(dt) {
    const E = L().gqEscape, esc = S.esc, A = L().arena, t = now();
    if (!E || !esc || !esc.on) return;
    if (!esc.musicSet) { esc.musicSet = true; ctx.music('gqescape'); }
    if (t >= esc.graceUntil) esc.fireOn = true;
    const here = []; seats(p => here.push(p));
    if (!here.length) return;
    const inHallP = p => p.x > A.x0 && p.x < A.x1 && p.y > 10 * TS;
    /* the floor of the hall burns: a gentle tick and a push up, never a death pit (the blow spares: it hurts, it does not kill). Each hero has his own tick clock */
    seats(P1 => {
      if (esc.fireOn && inHallP(P1) && P1.ground && P1.y >= A.floor - 3) {
        P1.gqFireT = (P1.gqFireT ?? 0.4) - dt;
        if (P1.gqFireT <= 0) { P1.gqFireT = G.esc.fireEvery; gqRed(P1.x, G.esc.fire, 'THE BURNING FLOOR', { spare: true, noKnock: true }); P1.vy = -G.esc.push; P1.ground = false; ctx.burst(P1.x, A.floor - 2, 6, ['#ff9a5c', '#ffd36b', '#ff6b2c'], 60, 0.4); }
      } else P1.gqFireT = Math.min(P1.gqFireT ?? 0.25, 0.25);
    });
    /* the two hall portals fan shards at you while you are in the hall (yellow, dodgeable: no queen to send a parry back to) - at a hero still in the hall */
    const inHall = here.find(inHallP);
    if (esc.fireOn && inHall) {
      esc.fanT -= dt;
      if (esc.fanT <= 0 && esc.cueT <= 0) { esc.cueT = G.esc.cue; ctx.number(E.hallPortals[0].x * TS, E.hallPortals[0].y * TS - 14, '!', '#ffd36b'); sfx('portalOpen'); }
      if (esc.cueT > 0) { esc.cueT -= dt; if (esc.cueT <= 0) { esc.fanT = G.esc.fan; for (const hp of E.hallPortals) fan(hp.x * TS + 8, hp.y * TS + 8, inHall.x, inHall.y - 8, true); } }
    }
    /* the burning rafter T4 and the roof slates go under a foot: each tile 0.6 s after a hero stood on it, relaid after a while */
    for (const tier of E.tiers) if (tier.collapse) crumble(S.coll, tier.row, tier.x0, tier.x1, 'lay', G.esc.collapse, G.esc.relay, here);
    crumble(S.slate, E.slates.row, E.slates.x0, E.slates.x1, 'restore', G.esc.slate, G.esc.slateRelay, here);
    /* the roof's shrine: lit when any hero reaches it */
    const atShrine = here.find(p => Math.abs(p.x - (E.check.x * TS + 8)) < 20 && Math.abs(p.y - (E.check.y + 1) * TS) < 30);
    if (!esc.checked && atShrine) {
      esc.checked = true; if (persist) persist.stage = 'roof'; ctx.setCheckpoint(E.check.x * TS + 8, (E.check.y + 1) * TS); sfx('sting');
      ctx.burst(E.check.x * TS + 8, E.check.y * TS, 14, ['#ffd36b', '#fff6c8', '#8fd160'], 50, 0.9); ctx.number(E.check.x * TS + 8, E.check.y * TS - 20, GQ_SAY.check, '#ffd36b');
      ctx.hint(GQ_SAY.step + '. SHE WAITS ON THE OTHER SIDE.');
    }
    /* HER PORTAL: walk into it (any hero: the party follows him through). A short swirl, then the tower top: your own choice, told */
    if (esc.step) {
      const k = (t - esc.step.t0) / G.esc.step, P0 = esc.step.p || ctx.P(); P0.vx = 0; P0.inv = Math.max(P0.inv || 0, 0.6);
      if (Math.random() < dt * 60) ctx.part({ x: P0.x + (Math.random() - 0.5) * 12, y: P0.y - 8 + (Math.random() - 0.5) * 16, vx: 0, vy: -30, life: 0.3, max: 0.3, col: '#b28cff', size: 2, grav: 0, glow: true });
      if (k >= 1) { esc.step = null; toRoof(); }
    } else {
      const px = E.portal.x * TS + 8, who = here.find(p => Math.abs(p.x - px) < 9 && Math.abs(p.y - (E.portal.y + 1) * TS) < 24);
      if (who) { esc.step = { t0: t, p: who }; sfx('portalOpen'); ctx.number(px, E.portal.y * TS - 10, GQ_SAY.step, '#b28cff'); }
    }
  }
  /* a crumbling run of tiles (a row, x0..x1): a hero standing on a tile starts its clock; at the end of it the tile is gone, and comes back (laid / restored) after relay seconds. heroes: the seats standing */
  function crumble(map, row, x0, x1, back, delay, relay, heroes) {
    const t = now();
    for (const P0 of heroes) if (P0.ground && Math.abs(P0.y - row * TS) < 3) { const c = Math.floor(P0.x / TS); if (c >= x0 && c <= x1 && !map.has(c)) { map.set(c, { at: t + delay, gone: false }); ctx.dust(c * TS + 8, row * TS, 3); sfx('crack'); } }
    for (const [c, m] of map) {
      if (!m.gone && t >= m.at) { m.gone = true; m.back = t + relay; ctx.tiles(row, c, c, 'drop'); ctx.burst(c * TS + 8, row * TS + 4, 6, ['#5a5a68', '#8a5a32', '#ff9a5c'], 60, 0.5); }
      else if (m.gone && t >= m.back) { ctx.tiles(row, c, c, back); map.delete(c); }
    }
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
  function roofBegin(e) { S.roof = { lash: 0, ambushCd: 6, geyserCd: 4, lashCd: 2, stormAt: null, stormBreakAt: 0, adds: new Set(), hatch: null, geysers: [], banner: null, orbit: null }; }
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
  H.roofStep = (e, dt) => {
    if (!S) return undefined;
    if (!S.roof) roofBegin(e);
    const R0 = S.roof, P0 = ctx.P(), RA = L().arena, d = P0.x - e.x, ad = Math.abs(d), tt = now();
    R0.lashCd -= dt; R0.ambushCd -= dt; R0.geyserCd -= dt; R0.leapCd = (R0.leapCd ?? 3) - dt;
    switch (e.mode) {
      case 'wake': if (e.modeT <= 0) { e.mode = 'roofStand'; e.modeT = 0.6; ctx.number(e.x, e.y - 70, 'THE TOWER TOP', '#ffd36b'); } return 0;
      case 'roofStand': case 'stand': {
        e.mode = 'roofStand'; e.face = sign(d) || e.face;
        const want = ad > 56 ? e.face * 62 : 0;
        if (e.modeT <= 0 && !P0.dead) {
          const hpk = e.hp / e.maxHp, stormUp = hpk < G.roof.stormBelow && !R0.storm && tt >= (R0.stormAt ?? 0);
          if (stormUp) { e.mode = 'stormTell'; e.modeT = 0.8; ctx.number(e.x, e.y - e.h - 12, '!', '#ffd36b'); sfx('callerChant'); }
          else if (R0.ambushCd <= 0 && R0.last !== 'ambush' && ad > 60) { R0.last = 'ambush'; startAmbush(e); }
          else if (R0.geyserCd <= 0 && ad < 280) { R0.last = 'geyser'; startGeyser(e); }
          else if ((e.crownCd ?? 3) <= 0 && ad > 60 && !R0.storm) { R0.last = 'crown'; roofCrown(e); }
          else if (hpk < G.roof.portalBelow && (e.portalCd ?? 6) <= 0 && ad > 40) { R0.last = 'portal'; roofPortal(e); }
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
      case 'stormTell': e.face = sign(d) || e.face; if (e.modeT <= 0) { R0.storm = { ang: 0, hitAt: 0 }; e.mode = 'rec'; e.modeT = 0.4; sfx('callerBlast'); ctx.ring(e.x, e.y - 30, 30, '#ffd36b', 0.4); } return 0;
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
    stormStep(dt);
    /* the guards: up a hatch (it bangs open for 0.8 s first), a soldier and a javelin, the hatch farther from you */
    for (const k of G.roof.addAt) {
      if (e.hp <= e.maxHp * k && !R0.adds.has(k)) {
        R0.adds.add(k); const hs = RA.hatches || [616, 656], far = Math.abs(P0.x - hs[0] * TS) > Math.abs(P0.x - hs[1] * TS) ? hs[0] : hs[1];
        R0.hatch = { x: far, at: tt + G.roof.hatch }; ctx.number(far * TS + 8, RA.floor - 20, '!', '#ffd36b'); sfx('crack'); ctx.shake(4);
      }
    }
    if (R0.hatch && tt >= R0.hatch.at) {
      const hx = R0.hatch.x, dir = hx < (RA.x0 + RA.x1) / 2 / TS ? 1 : -1; R0.hatch = null;
      ctx.spawnEnt({ t: 'soldier', x: hx, y: 19, face: dir }); ctx.spawnEnt({ t: 'javelin', x: hx + dir * 2, y: 19, face: dir }); ctx.burst(hx * TS + 8, RA.floor - 6, 12, ['#5a5a68', '#8a5a32'], 70, 0.5); sfx('gateDrop');
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
  H.test = H.test || {}; H.test.roof = () => S && S.roof;
  H.test.begin = () => { const e = q(); if (e && S) roofBegin(e); };
  /* the hall portals' (and the escape's) fan of shards: three, +-14 deg, at the spot given, yellow and blockable; a parry only clanks here (nobody to send it back to) */
  function fan(px, py, tx, ty, esc) {
    const pc = G.portal, base = Math.atan2(ty - py, tx - px);
    for (let k = 0; k < pc.fan; k++) { const a = base + (k - (pc.fan - 1) / 2) * pc.spread * Math.PI / 180; S.rocks.push({ x: px, y: py, vx: Math.cos(a) * pc.v, vy: Math.sin(a) * pc.v, t: 0, dead: false, home: false, cast: null, esc: !!esc, id: 'r' + (++S.rid) }); }
    ctx.burst(px, py, 8, ['#b28cff', '#e8dcff', '#8a8a9c'], 60, 0.4); sfx('crack');
  }

  /* ---------------- THE CROWN (her boomerang) ---------------- */
  /* tell 0.8 s (the crown lifted, a glint, the caller's chant), then a boomerang at chest height: out 230 px/s to 210 px or a wall, a breath, back 260 px/s. Blockable; duck, jump or roll it.
     PARRIED on either pass: it flies home at 340 px/s and she is STUNNED. A plain block only knocks it to the floor: she walks to fetch it (bare-headed, not open). */
  function launchCrown(e, P0) {
    const c = G.crown, dir = sign(P0.x - e.x);
    e.face = dir; e.crownOut = true;
    S.crown = { x: e.x + dir * 24, y: P0.y - c.dy, x0: e.x + dir * 24, vx: dir * c.out, dir, state: 'out', t: 0, hit: false, pass: 1, home: false, id: 'c' + (++S.rid) };
    sfx('throwWhoosh');
  }
  function crownStep(dt) {
    const c = S.crown, e = q(), P0 = ctx.P(), cc = G.crown;
    if (!c) return;
    if (!e) { S.crown = null; return; }
    c.t += dt; c.spin = (c.spin || 0) + dt * 14;
    if (Math.random() < dt * 30) ctx.part({ x: c.x, y: c.y, vx: 0, vy: 0, life: 0.25, max: 0.25, col: '#ffd36b', size: 1, grav: 0, glow: true });
    if (c.state === 'out') {
      c.x += c.vx * dt;
      if (Math.abs(c.x - c.x0) >= cc.reach || ctx.solid(Math.floor((c.x + c.dir * 6) / TS), Math.floor(c.y / TS))) { c.state = 'hang'; c.t = 0; c.vx = 0; }
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
        const h = gqHit(r.x - sign(r.vx) * 12, pc.dmg, e, 'A PORTAL SHARD');
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
    return false;
  };
  H.tick = (e, dt) => { if (!S) return; e.crownCd = (e.crownCd ?? 3) - dt; e.portalCd = (e.portalCd ?? 6) - dt; };

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
  Object.assign(H.test = H.test || {}, { ringBell: () => { const e = q(), b = bellProp(); if (e && b && S) ringIt(e, b); } });

  /* ---------------- PER FRAME ---------------- */
  H.update = dt => {
    if (!S) return;
    if (S.esc && S.esc.on) escapeStep(dt);
    if (S.rocks.length) rockStep(dt);
    if (!ctx.bossActive() || !q()) { S.crown = null; if (!(S.esc && S.esc.on)) { S.rocks = []; } S.portals = []; return; }
    crownStep(dt); portalStep(dt); if (S.roof) roofUpdate(dt); mechStep(dt);
  };

  /* ---------------- DRAW ---------------- */
  /* the escape's picture (placeholders until the art lane): the floor on fire, flames on the rafters, the two hall portals, the roof shrine, HER PORTAL */
  function portalDraw(g, x, y, t, k, col) {
    g.save(); g.translate(Math.round(x), Math.round(y));
    g.fillStyle = '#2a1a3a'; g.beginPath(); g.ellipse(0, 0, 6 + 4 * k, 11 + 5 * k, 0, 0, 6.3); g.fill();
    g.strokeStyle = col; g.lineWidth = 2; g.beginPath(); g.ellipse(0, 0, 6 + 4 * k, 11 + 5 * k, t * 3, 0, 5); g.stroke();
    g.strokeStyle = '#e8dcff'; g.lineWidth = 1; g.beginPath(); g.ellipse(0, 0, 3 + 2 * k, 7 + 3 * k, -t * 4, 0, 4); g.stroke(); g.restore();
  }
  function escapeDraw(g, cx, cy, t) {
    const E = L().gqEscape, A = L().arena, esc = S.esc; if (!E || !esc || !esc.on) return;
    if (esc.fireOn) { g.globalAlpha = 0.85; for (let x = A.x0; x < A.x1; x += 9) { const h = 4 + 5 * (0.5 + 0.5 * Math.sin(t * 9 + x * 0.37)), fx = Math.round(x - cx), fy = Math.round(A.floor - cy);
      g.fillStyle = '#ff6b2c'; g.fillRect(fx, fy - h, 5, h); g.fillStyle = '#ffd36b'; g.fillRect(fx + 1, fy - h * 0.55, 3, h * 0.55); } g.globalAlpha = 1; }
    for (const tier of E.tiers) for (let x = tier.x0; x <= tier.x1; x += 3) { const h = 2 + 3 * (0.5 + 0.5 * Math.sin(t * 11 + x * 1.3)); g.fillStyle = '#ff9a5c'; g.fillRect(Math.round(x * TS + 4 - cx), Math.round(tier.row * TS - h - cy), 3, h); }
    for (const hp of E.hallPortals) portalDraw(g, hp.x * TS + 8 - cx, hp.y * TS + 8 - cy, t, esc.cueT > 0 ? 1 : 0.4, esc.cueT > 0 ? '#fff6c8' : '#b28cff');
    portalDraw(g, E.portal.x * TS + 8 - cx, E.portal.y * TS + 2 - cy, t, 0.5 + 0.5 * Math.sin(t * 3), '#b28cff');
    const bx = Math.round(E.check.x * TS + 8 - cx), by = Math.round((E.check.y + 1) * TS - cy);   // the roof shrine: a brazier, lit once you have been there
    g.fillStyle = '#3a3a44'; g.fillRect(bx - 4, by - 8, 8, 8); if (esc.checked) { const h = 5 + 4 * (0.5 + 0.5 * Math.sin(t * 12)); g.fillStyle = '#ffd36b'; g.fillRect(bx - 3, by - 8 - h, 6, h); g.fillStyle = '#ff6b2c'; g.fillRect(bx - 2, by - 8 - h * 0.6, 4, h * 0.6); }
    if (esc.step) { const k = Math.min(1, (t - esc.step.t0) / G.esc.step); portalDraw(g, E.portal.x * TS + 8 - cx, E.portal.y * TS + 2 - cy, t, 1 + k, '#fff6c8'); }
  }
  H.drawWorld = (g, cx, cy, t) => {
    if (!S) return;
    escapeDraw(g, cx, cy, t);
    if (S.fleeP && !(S.fleeP.done && t - S.fleeP.done > 0.6)) portalDraw(g, S.fleeP.x - cx, S.fleeP.y - cy, t, 0.8, '#b28cff');
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
    const e = q();
    if (e && e.mode === 'stunned') { for (let k = 0; k < 3; k++) { const a = t * 4 + k * 2.09; g.fillStyle = '#ffd36b'; g.fillRect(Math.round(e.x - cx + Math.cos(a) * 16), Math.round(e.y - 64 - cy + Math.sin(a) * 4), 2, 2); } }
    if (e && e.mode === 'crownTossTell') { const k = 0.5 + 0.5 * Math.sin(t * 30); g.globalAlpha = 0.5 + 0.4 * k; g.fillStyle = '#fff6c8'; g.fillRect(Math.round(e.x - cx + e.face * 6) - 1, Math.round(e.y - 60 - cy), 3, 3); g.globalAlpha = 1; }
  };

  /* (claude/gq2art) THE ART: the same world, drawn by src/redraw/gqueen_art.js. Any throw falls back to the greybox above for the rest of the session (and says so once). */
  let artOff = false;
  function artWorld(g, cx, cy, t) {
    const E = L().gqEscape, A = L().arena, esc = S.esc, VW0 = (g.canvas && g.canvas.width) || 320;
    if (E && esc && esc.on) {
      if (esc.fireOn) GA.drawFloorFire(g, A.x0, A.x1, A.floor, cx, cy, t, VW0);
      for (const tier of E.tiers) GA.drawRafterFire(g, tier, TS, cx, cy, t);
      for (const [c, m] of S.slate) if (!m.gone) GA.drawSlateCrack(g, c * TS - cx, E.slates.row * TS - cy, Math.max(0, Math.min(1, 1 - (m.at - t) / G.esc.slate)), t);
      for (const hp of E.hallPortals) GA.drawPortal(g, hp.x * TS + 8 - cx, hp.y * TS + 8 - cy, t, esc.cueT > 0 ? 1 : 0.4, esc.cueT > 0 ? '#fff6c8' : '#b28cff');
      GA.drawPortal(g, E.portal.x * TS + 8 - cx, E.portal.y * TS + 2 - cy, t, 0.5 + 0.5 * Math.sin(t * 3), '#b28cff');
      GA.drawShrine(g, E.check.x * TS + 8 - cx, (E.check.y + 1) * TS - cy, !!esc.checked, t);
      if (esc.step) GA.drawPortal(g, E.portal.x * TS + 8 - cx, E.portal.y * TS + 2 - cy, t, 1 + Math.min(1, (t - esc.step.t0) / G.esc.step), '#fff6c8');
    }
    if (S.fleeP && !(S.fleeP.done && t - S.fleeP.done > 0.6)) GA.drawPortal(g, S.fleeP.x - cx, S.fleeP.y - cy, t, 0.8, '#b28cff');
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
    try { mechDraw(g, cx, cy, t); } catch (err) { /* greybox only */ }
    if (artOff) return greyWorld(g, cx, cy, t);
    try { artWorld(g, cx, cy, t); } catch (err) { artOff = true; console.warn('gqueen art off (greybox):', err && err.message); greyWorld(g, cx, cy, t); }
  };

  /* ---------------- TOOLS / BOT ---------------- */
  H.shots = () => {
    if (!S) return [];
    const out = [];
    if (S.crown && S.crown.state !== 'floor') out.push({ id: S.crown.id, x: S.crown.x, y: S.crown.y, vx: S.crown.vx, vy: 0, kind: 'crown', home: !!S.crown.home });
    for (const r of S.rocks) if (!r.dead) out.push({ id: r.id, x: r.x, y: r.y, vx: r.vx, vy: r.vy, kind: 'rock', home: !!r.home });
    const st = S.roof && S.roof.storm; if (st && st.x !== undefined) { const w = Math.PI * 2 / G.roof.orbitTurn; out.push({ id: 's' + Math.floor(st.ang / (Math.PI * 2)), x: st.x, y: st.y, vx: -Math.sin(st.ang) * G.roof.orbitR * w, vy: Math.cos(st.ang) * G.roof.orbitR * 0.55 * w, kind: 'storm', home: false }); }
    return out;
  };
  H.stage = () => { const e = q(); return e && e.stage ? e.stage : 'hall'; };
  H.portals = () => (S ? S.portals.map(p => ({ x: p.x, y: p.y, state: p.state })) : []);
  H.read = () => S ? { crown: S.crown ? { ...S.crown } : null, rocks: S.rocks.length, portals: S.portals.length, stunUntil: S.stunUntil, stuns: S.stuns, persist: persist ? { ...persist } : null,
    esc: S.esc ? { on: S.esc.on, fireOn: S.esc.fireOn, checked: S.esc.checked } : null,
    roof: S.roof ? { ambushX: S.roof.ambushX, geysers: S.roof.geysers.map(g => ({ x: g.x, at: g.at })), storm: !!S.roof.storm, adds: [...S.roof.adds] } : null } : null;
  /* (claude/gq2) THE LAB'S SKIP (src/lab-gqueen.js, King Gorm's gormSkipRun precedent): from the escape, light the roof shrine (checkpoint + persist 'roof') and take her portal - the tower top
     begins as if the hero had climbed and stepped in. Only the lab calls it (opts.gqEscape 'skip', or its stall guard). true = it went to the roof. */
  H.skipRoof = () => {
    const e = q(), E = L().gqEscape; if (!S || !e || e.stage !== 'escape' || !E) return false;
    if (!S.esc) startEscape(false);
    S.esc.checked = true; if (persist) persist.stage = 'roof'; ctx.setCheckpoint(E.check.x * TS + 8, (E.check.y + 1) * TS);
    S.esc.step = null; toRoof(); return e.stage === 'roof';
  };
  Object.assign(H.test = H.test || {}, { toss:() => { const e = q(); if (e && S) { e.mode = 'crownTossTell'; e.modeT = 0.01; } }, stun: (d, p) => stun(q(), d, p || 0) });
  return H;
}
