// src/shriek-sisters-hands.js - THE SHRIEK SISTERS' HANDS (claude/rookery). src/shriek-sisters.js is the fight (pure); this binds it to the world: the boss is an ANCHOR
// (the game's one boss: its bar is the three sisters' health together, it dies when the last of them does) and the three SISTERS are bodies in the foe list a blow can
// find (main.js hurtEnemy0 hands their blows here: hit). Their told blows on the heroes (keyed once a blow; a shield turns the dive - she is knocked down - and the
// wave), the summit's cracked slabs, the stones, the rocks, the marks - and the drawing.
// GREYBOX ART (readable shapes; the sonnet art lane draws them - see the lane report's ART NOTES): every move its OWN windup and release pose (B16, POSE below): the dive's
// stoop (wings back, talons forward, head down) and the dive (folded, a spear), STUNNED (sprawled in rubble, wings splayed, stars), the tear (wings up, rubble flying),
// the scream's windup (head thrown back, wings wide) and the scream (beak at you, rings), the swoop (low, wings level), the wave's breath (chest out) and the wave
// (beak forward, a cone), the pick (head down to the rock on the shelf), the carry (rock in the talons), the drop's windup (talons open over the ring) and the drop
// (talons spread, empty), the snatch's windup (low, talons spread) and the snatch (flat out, talons first).
// THE SHARED READ (B10): OPEN = a gold ring and a timer bar (STUNNED / DOWN); WARDED = a pale ring and the word; ON THE WING = a turned blow sparks and says so.
// (claude/sisters2) THE SIGNATURE MOVES' hands: the SHOCK SHRIEK's shove (a shield braces it, a roll goes through it) and the TEETER on the summit's crumbling lip; THE GRAB's
// catch, the hold (main.js updatePlayer hands a held hero to H.held: he hangs from her talons, every swing a strike on her) and the let-go; and their reads - the chain's numbered
// rings, the rake's chevrons, the shock's cone, the echo's shivering tile and the cracked tiles it leaves, the boulder's shadow, the grab's talon line, the escape bar.
// main.js calls: spawnBoss, owns, on, update, hit, held, drawBack, drawBoss, drawOver, barName, end, read, show, clear.
import * as SSM from './shriek-sisters.js';
import { BOSS_PHASE } from './boss-music.js';
import { canvas, flipX, whiten } from './px.js';
import { drawSister } from './redraw/shriek_sisters_art.js';
import { drawHang } from './redraw/rookery_hang.js';
import { drawArena, drawWind } from './redraw/rookery_arena_art.js';
import { bakeSummitSlab, bakeSummitRubble, bakeSummitStone, bakeSummitEcho, bakeBoulder, bakeSummitLip } from './redraw/rookery_world.js';   /* (claude/rookerypolish) the summit's slabs, rubble and stones in the Sisters' Crag stone */
const { SS, ROLES } = SSM;

const SOUND = { screech: s => (s.screech || s.tell)(), lock: s => (s.tell || s.clank)(), dive: s => (s.whoosh || s.throwWhoosh || s.screech || s.tell)(), smash: s => { (s.crack || s.stone || s.thud)(); (s.heavy || s.thud)(); },
  skid: s => (s.skid || s.stone || s.thud)(), screamTell: s => (s.screech || s.tell)(), scream: s => (s.queenShriek || s.screech)(), inhale: s => (s.tell)(), shriek: s => (s.queenShriek || s.screech)(),
  pick: s => (s.stone || s.thud)(), rockTell: s => (s.tell)(), drop: s => (s.throwWhoosh || s.tell)(), rockLand: s => { (s.heavy || s.thud)(); (s.crack || s.stone)(); }, snatchTell: s => (s.screech || s.tell)(),
  swoop: s => (s.whoosh || s.throwWhoosh || s.tell)(), crack: s => (s.crack || s.stone)(), fall: s => (s.queenShriek || s.screech)(), clank: s => (s.clank || s.thud)(),
  /* (claude/sisters2) the signature moves */
  chainTell: s => { (s.screech || s.tell)(); (s.whoosh || s.tell)(); }, rakeTell: s => (s.clank || s.tell)(), rake: s => (s.skid || s.stone || s.thud)(), shockTell: s => (s.tell)(), shock: s => { (s.queenShriek || s.screech)(); (s.heavy || s.thud)(); },
  echoTell: s => (s.screech || s.tell)(), echo: s => { (s.crack || s.stone)(); (s.stone || s.thud)(); }, grabTell: s => (s.screech || s.tell)(), grab: s => (s.whoosh || s.throwWhoosh || s.tell)(), caught: s => (s.thud || s.heavy)(),
  free: s => (s.clank || s.thud)(), letGo: s => (s.whoosh || s.tell)(), teeter: s => (s.stone || s.thud)(),
  /* (claude/rookery3) THE TEMPO CUES, over each windup's own sound: HEAVY a deep throat and a wingbeat that lands (slow: you have time), LIGHT a small bright tick (quick: move now);
     MEDIUM is the windup's own sound alone */
  tempoHeavy: s => { (s.bellow || s.heavy || s.thud)(); (s.thud || s.heavy)(); }, tempoLight: s => (s.tink || s.strikeTell || s.tell)() };
const COL = { diver: { body: '#6a7890', dark: '#3e4a5e', light: '#9aaac4', crest: '#c8d4e8' }, shrieker: { body: '#7a4a5a', dark: '#4a2634', light: '#b0707e', crest: '#e04a3a' }, snatcher: { body: '#7a6448', dark: '#4a3a26', light: '#a88c64', crest: '#d8b070' } };
const R = Math.round;
const rect = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(R(x), R(y), R(w), R(h)); };
/* THE POSE A MODE WEARS (local px, facing right, her talons at 0,0): wing angle (rad, up is negative), body pitch, head [dx, dy], beak (open), talons (spread / fwd), rock */
export const POSE = {
  sleep: { wing: 0.9, pitch: 0, head: [6, 2], fold: true, tuck: true }, wake: { wing: -0.6, pitch: 0, head: [8, -6], beak: true },
  hover: { wing: -0.4, flap: true, pitch: 0, head: [8, -2] }, rise: { wing: -0.7, flap: true, pitch: -0.2, head: [8, -4] }, fly: { wing: -0.3, flap: true, pitch: 0.1, head: [9, -1] },
  diveTell: { wing: -1.2, pitch: 0.35, head: [9, 4], talon: 'fwd', eye: 'red' }, dive: { wing: 0.15, pitch: 0.9, head: [11, 2], fold: true, talon: 'fwd', eye: 'red' },
  land: { wing: -0.2, pitch: 0.1, head: [8, 0], talon: 'spread' }, downed: { wing: 0.6, pitch: 0.12, head: [7, 4], sprawl: true, stars: true },
  stuck: { wing: 0.8, pitch: 0.12, head: [6, 6], sprawl: true, stars: true, rubble: true }, tear: { wing: -1.3, pitch: -0.2, head: [8, -6], beak: true, rubble: true },
  screamTell: { wing: -1.5, pitch: -0.35, head: [4, -9], beak: true, eye: 'red' }, scream: { wing: -0.9, pitch: 0.15, head: [12, -2], beak: true, rings: true },
  swoop: { wing: -0.05, pitch: 0.05, head: [10, 0] }, waveTell: { wing: -1.0, pitch: -0.3, head: [5, -6], chest: true, eye: 'red' }, wave: { wing: -0.6, pitch: 0.2, head: [13, 0], beak: true, cone: true },
  pick: { wing: 0.4, pitch: 0.5, head: [9, 6], talon: 'grip', rock: true }, carry: { wing: -0.5, flap: true, pitch: 0, head: [8, -2], rock: true, talon: 'grip' },
  dropTell: { wing: -1.1, pitch: -0.1, head: [7, 2], rock: true, talon: 'open', eye: 'red' }, drop: { wing: -0.8, pitch: 0, head: [8, -2], talon: 'spread' },
  snatchTell: { wing: -1.0, pitch: 0.3, head: [10, 2], talon: 'spread', eye: 'red' }, snatch: { wing: 0.1, pitch: 0.15, head: [13, 1], talon: 'fwd', fold: true },
  /* (claude/sisters2) THE SIGNATURE MOVES, each its own windup and release (B16):
     CHAIN STOOP - the climb (wings flung up and back, head up, beak open, talons cocked) then the ordinary dive; between dives the JAR (thrown back off the rock, wings out low, rubble)
     TALON RAKE  - the plant (crouched flat, head low, legs out ahead, sparks off the claws) and the rake (sliding, legs thrust out, a dust streak behind)
     SHOCK SHRIEK - the swell (leaning back, wings drawn in low, the throat sac blown up tight) and the shriek (lunging forward, beak wide, blast rings)
     CRACKING ECHO - head down at the floor (wings high, beak open) and the scream into it (pitched over, rings at the floor)
     THE GRAB     - wings high, both feet reaching forward claws open; the lunge (wings back, feet out); THE LIFT and THE HOLD (beating hard, claws closed on your shoulders) */
  chainTell: { wing: -1.45, pitch: -0.45, head: [6, -8], beak: true, talon: 'fwd', eye: 'red' }, jar: { wing: 0.35, pitch: 0.1, head: [9, 3], talon: 'spread', rubble: true, beak: true },
  rakeTell: { wing: -0.1, pitch: 0.25, head: [12, 6], talon: 'rake', eye: 'red', sparks: true }, rake: { wing: 0.3, pitch: 0.08, head: [13, 3], talon: 'rake', streak: true },
  shockTell: { wing: 0.55, pitch: -0.5, head: [2, -9], chest: true, sac: true, eye: 'red' }, shock: { wing: -1.0, pitch: 0.3, head: [14, 1], beak: true, sac: true, blast: true },
  echoTell: { wing: -1.25, pitch: 0.75, head: [10, 8], beak: true, eye: 'red' }, echo: { wing: -0.55, pitch: 0.95, head: [12, 9], beak: true, down: true },
  grabTell: { wing: -1.35, pitch: 0.2, head: [10, -1], talon: 'reach', eye: 'red' }, grab: { wing: -0.15, pitch: 0.25, head: [12, 1], talon: 'reach' },
  lift: { wing: -1.0, flap: true, pitch: -0.15, head: [8, -4], talon: 'clutch', beak: true }, hold: { wing: -0.7, flap: true, pitch: 0, head: [8, -1], talon: 'clutch' },
  /* (claude/rookery2) PLACEHOLDER POSES with their real timings (the sonnet art lane draws them): THE CLIMB OFF THE ROCK a downed sister makes (ferryWait, SS.ride.window: wings
     beating low and hard, talons hanging - GRAB HER), THE FERRY (beating up with the hero in her talons, SS.ride.v), THE SHRIEKER PERCHED on her nest (wings folded, head up),
     CORNERED (reared back on the nest, wings flung, beak open: SS.ride.startle), THE GROWTH into phase 2 (wings flung wide, head thrown back, SS.p2.grow) */
  ferryWait: { wing: 0.2, flap: true, pitch: 0.15, head: [8, 2], talon: 'spread', beak: true }, ferry: { wing: -1.1, flap: true, pitch: -0.25, head: [9, -4], talon: 'clutch' },
  perched: { wing: 0.85, pitch: 0, head: [6, -5], fold: true, tuck: true }, startled: { wing: -1.5, pitch: -0.4, head: [3, -8], beak: true, eye: 'red' },
  grow: { wing: -1.55, pitch: -0.5, head: [3, -10], beak: true, chest: true, eye: 'red' },
  /* (claude/rookery2art) THE FAR-MORE-FRAMES PASS (Daniel 10-27: "far more Sisters animations"). poseOf() below picks among these by how long she has been in her mode: the dive's WIND-UP
     (a crouch, then wings rising), the RECOVER after a dive (wings dragging up), the shriek's INHALE (chest swelling) and its fading TAIL, HURT (a wince), the STUN's nodding head,
     the PERCH's preening head, the CORNERED flail, the GROWTH in three beats, the FALL (a downed bird still in the air), the SNATCH's carry (wings beating) and the DEATH in three */
  diveWind: { wing: 0.3, pitch: 0.15, head: [8, 5], talon: 'fwd', eye: 'red' }, diveWind2: { wing: -0.7, pitch: 0.28, head: [9, 5], talon: 'fwd', eye: 'red' },
  recover: { wing: 0.35, pitch: 0.2, head: [8, 3], talon: 'spread', beak: true }, recover2: { wing: -0.1, flap: true, pitch: 0.05, head: [8, 0], talon: 'hang' },
  inhale: { wing: -0.9, pitch: -0.2, head: [6, -6], chest: true, sac: true, eye: 'red' }, inhale2: { wing: -1.2, pitch: -0.3, head: [5, -8], chest: true, sac: true, beak: true, eye: 'red' }, screamTail: { wing: -0.7, pitch: 0.05, head: [11, -3], beak: true },
  hurt: { wing: -0.9, pitch: -0.28, head: [4, 3], hurt: true, beak: true, talon: 'spread' },
  stuckB: { wing: 0.8, pitch: 0.14, head: [7, 3], sprawl: true, stars: true, rubble: true }, stuckC: { wing: 0.7, pitch: 0.1, head: [6, 8], sprawl: true, stars: true, rubble: true },
  perchedB: { wing: 0.85, pitch: 0, head: [9, -3], fold: true, tuck: true }, perchedC: { wing: 0.8, pitch: 0.05, head: [3, -4], fold: true, beak: true, tuck: true },
  startledB: { wing: -0.9, pitch: -0.25, head: [5, -6], beak: true, eye: 'red', flap: true, flapOff: 2 },
  grow1: { wing: 0.5, pitch: 0.2, head: [6, 5], chest: true, eye: 'red' }, grow3: { wing: -1.7, pitch: -0.6, head: [2, -11], beak: true, chest: true, sac: true, eye: 'red', rings: true },
  fall: { wing: -1.3, pitch: -0.35, head: [4, -6], beak: true, hurt: true, talon: 'spread', feathers: true },
  carryB: { wing: -1.1, flap: true, flapOff: 3, pitch: -0.05, head: [8, -3], rock: true, talon: 'grip' },
  dead1: { wing: -1.2, pitch: -0.5, head: [3, -9], beak: true, dead: true, talon: 'spread', feathers: true }, dead2: { wing: 0.15, pitch: 0.9, head: [6, 5], fold: true, dead: true, talon: 'spread', feathers: true },
  dead3: { wing: 0.6, pitch: 0.05, head: [6, 8], sprawl: true, dead: true, rubble: true },
  /* (claude/rookery3) SPENT - the heavy boulder drop's recovery: empty talons hanging, wings dragging low, beak open (she sinks to your height: the punish) */
  spent: { wing: 0.35, pitch: 0.2, head: [8, 3], talon: 'spread', beak: true }, spentB: { wing: -0.1, flap: true, pitch: 0.05, head: [8, 1], talon: 'hang', beak: true },
};
/* HOW LONG she has been in this mode (s). The hands note the mode change as it happens; poseOf reads it */
const modeAge = (b, s, time) => { if (b.__m !== s.mode) { b.__m = s.mode; b.__t0 = time; } return time - b.__t0; };
/* (claude/rookery2art) the pose a sister wears NOW: her mode, how long she has been in it, a blow just landed (hurt), her height (a downed bird in the air falls) */
export function poseOf(s, b, time, flash, G) {
  const m = s.mode, age = modeAge(b, s, time); if (flash) b.__hurt = time + 0.24;
  const hurting = (b.__hurt || 0) > time;
  switch (m) {
    case 'hover': case 'fly': case 'rise': return hurting ? POSE.hurt : POSE[m];
    case 'swoop': return hurting ? POSE.hurt : POSE.swoop;
    case 'spent': return hurting ? POSE.hurt : Math.floor(age * 4) % 2 ? POSE.spentB : POSE.spent;   /* (claude/rookery3) */
    case 'diveTell': return age < 0.28 ? POSE.diveWind : age < 0.5 ? POSE.diveWind2 : POSE.diveTell;
    case 'land': return age < 0.22 ? POSE.land : age < 0.5 ? POSE.recover : POSE.recover2;
    case 'screamTell': return age < 0.35 ? POSE.inhale : age < 0.65 ? POSE.inhale2 : POSE.screamTell;
    case 'scream': return age < 0.8 ? POSE.scream : POSE.screamTail;
    case 'stuck': return hurting ? POSE.hurt : (Math.floor(age * 1.6) % 3 === 0 ? POSE.stuck : Math.floor(age * 1.6) % 3 === 1 ? POSE.stuckB : POSE.stuckC);
    case 'downed': return G && s.y < G.floorY - 9 ? POSE.fall : POSE.downed;
    case 'perched': return Math.floor(age * 0.7) % 4 === 1 ? POSE.perchedB : Math.floor(age * 0.7) % 4 === 3 ? POSE.perchedC : POSE.perched;
    case 'startled': return Math.floor(age * 5) % 2 ? POSE.startledB : POSE.startled;
    case 'grow': { const k = Math.min(1, age / SS.p2.grow); return k < 0.3 ? POSE.grow1 : k < 0.75 ? POSE.grow : POSE.grow3; }
    case 'carry': return Math.floor(time * 3.1) % 2 ? POSE.carryB : POSE.carry;
    case 'ferryWait': case 'ferry': return hurting ? POSE.hurt : POSE[m];
    default: return POSE[m] || POSE.hover;
  }
}
/* A SISTER FALLS (3 beats, 1.5 s): struck up and back (dead1), tumbling down (dead2, spinning, feathers loose), and lying in the rubble (dead3) - then she fades. drawDeaths paints them over the summit */
const DEATH = { T: 1.9, struck: 0.28, fall: 0.8 };
/* her gifts, by who is dead (S.dead) - painted into HER sheet now (the diver's crest and wing bar, the shrieker's crest fan and throat sac, the snatcher's satchel and talons) */
const giftsOf = dead => (dead.diver ? 'D' : '') + (dead.shrieker ? 'S' : '') + (dead.snatcher ? 'N' : '');
/* A SISTER is drawn by src/redraw/shriek_sisters_art.js (claude/rookeryart: three different birds, baked per pose; the greybox's rectangles are gone) */

export function makeShriekSistersHands(ctx) {
  let S = null, A0 = null; const H = {}, bodies = {};
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'shrieksisters' ? ctx.L.arena : null);
  H.show = () => S;
  H.on = () => !!(S && A());
  H.owns = e => e.t === 'shrieksisters' || e.t === 'shrieksister';
  const unhold = () => { for (const pp of ctx.players || []) { pp.ssHeld = null; pp.ssShove = null; pp.ssRide = null; } };
  H.clear = () => { S = null; A0 = null; BOSS_PHASE.shrieksisters = 1; unhold(); };
  const anchor = () => { const e = ctx.boss; return e && e.t === 'shrieksisters' ? e : null; };
  const hurt = (name, fn) => { const P = ctx.hero(), h0 = P.hp; fn(); if (S) { S.hurt = S.hurt || {}; S.hurt[name] = (S.hurt[name] || 0) + Math.max(0, h0 - Math.max(0, P.hp)); } };
  const keyed = (pp, key) => { pp.ssKeys = pp.ssKeys || new Map(); if (pp.ssKeys.size > 160) pp.ssKeys.clear(); if (pp.ssKeys.has(key)) return true; pp.ssKeys.set(key, 1); return false; };
  H.spawnBoss = base => { const Ar = A(); if (!Ar) return null;
    S = SSM.newFight(SSM.geom(Ar, ctx.TS)); BOSS_PHASE.shrieksisters = 1;
    const hp = ROLES.reduce((n, r) => n + S.sis[r].maxHp, 0);
    const e = { ...base, t: 'shrieksisters', w: 2, h: 2, hp, maxHp: hp, noGrav: true, face: -1, mode: 'sleep', modeT: 0, phase: 1, boss: true, ward: 0 };
    e.x = S.G.mid; e.y = S.G.floorY - 15 * ctx.TS; A0 = e;
    for (const r of ROLES) { const s = S.sis[r]; const b = { t: 'shrieksister', role: r, x: s.x, y: s.y, w: SS.sister.w, h: SS.sister.h, hp: s.hp, maxHp: s.maxHp, alive: true, dying: 0, noGrav: true, face: -1, anim: 0, flash: 0, stagger: 0, vx: 0, vy: 0, mode: 'sleep', boss: false };
      bodies[r] = b; ctx.addEnemy(b); }
    for (const pp of ctx.players) { pp.ssKeys = null; pp.ssHeld = null; pp.ssShove = null; pp.ssRide = null; } return e; };
  const heroes = () => ctx.players.map(pp => ({ x: pp.x, y: pp.y, ground: !!pp.ground, alive: ctx.upright(pp) && !pp.dead, face: pp.face || 1, pp }));
  function world() {
    return {
      number: (x, y, t, col) => ctx.number(x, y, t, col), sound: k => { const f = SOUND[k]; if (f) try { f(ctx.sfx); } catch {} }, shake: n => ctx.shake(n),
      music: ph => { BOSS_PHASE.shrieksisters = Math.min(3, ph); },   tempo: (s, cls) => { s.tempoAt = ctx.time(); if (cls === 'heavy') SOUND.tempoHeavy(ctx.sfx); else if (cls === 'light') SOUND.tempoLight(ctx.sfx); },   /* (claude/rookery3) */
      mark: (s, m) => ctx.number(s.x, s.y - 34, m, m === '!' ? '#ffd36b' : '#ff6b6b'),
      dust: (x, y, n) => ctx.dust(x, y, n),
      fx: (k, x, y) => { if (k === 'open') { ctx.ring(x, y - 10, 34, '#ffd36b'); } else if (k === 'ward') ctx.ring(x, y - 10, 36, '#c8d8e8'); },
      rubble: x => { ctx.burst(x, S.G.floorY - 4, 18, ['#e8e4d8', '#8a8478', '#5e594f'], 120, 0.8); },
      hit: (s, bx, d, name, o = {}) => { let out = null; for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead || pp.ssHeld) return;   /* (claude/sisters2: in her talons, no other blow finds you) */
          if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P)) || keyed(pp, o.key || name)) return;
          let res = null; hurt(name, () => { res = ctx.damagePlayer(s.x, d, { who: A0, name, unblockable: !o.blockable }); }); out = out || res;
          if (res === 'hit' && o.knockUp) { P.vy = Math.min(P.vy || 0, -220); P.vx = (P.x < s.x ? -1 : 1) * 120; } });
        return out; },
      hitArea: (bx, d, name, key) => { for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead || pp.ssHeld) return; if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P)) || keyed(pp, key)) return; hurt(name, () => ctx.damagePlayer((bx[0] + bx[1]) / 2, d, { who: A0, name, unblockable: true })); }); },
      hitHero: (h, d, name, key, blockable) => { const pp = h.pp; ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead || pp.ssHeld) return; if (key && keyed(pp, key)) return; hurt(name, () => ctx.damagePlayer(P.x - 10, d, { who: A0, name, unblockable: !blockable })); }); },
      /* (claude/sisters2) THE SHOCK SHRIEK's shove: a shield braces it (no shove), a roll goes through it (no blow at all), else it throws you toward the edge */
      shove: (s, h, dir, key) => { const pp = h.pp; let r = null; ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead || pp.ssHeld || keyed(pp, key)) return;
          hurt('shock', () => { r = ctx.damagePlayer(s.x, SS.shock.dmg, { who: A0, name: 'shock' }); });
          if (r === 'hit') { P.vx = dir * SS.shock.vx; P.vy = SS.shock.vy; P.ground = false; pp.ssShove = { t: 0.9, dir }; }
          else if (r === 'blocked') { P.vx = dir * 50; ctx.number(P.x, P.y - 30, SSM.SS_SAY.braced, '#8fd160'); } }); return r; },
      /* THE GRAB's catch: her talons find you (a roll goes through them) - you hang from her */
      grab: (s, bx, d, key) => { let caught = null; for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (caught || !ctx.upright(pp) || P.dead || pp.ssHeld) return;
          if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P)) || keyed(pp, key)) return;
          let res = null; hurt('grab', () => { res = ctx.damagePlayer(s.x, d, { who: A0, name: 'grab', unblockable: true }); });
          if (res === 'hit' && !P.dead && P.hp > 0 && ctx.upright(pp)) { pp.ssHeld = true; caught = pp; P.vx = 0; P.vy = 0; } });
        return caught; },
      /* she lets go: you drop to the summit floor (she only ever holds you over it) - the drop hurts, unless she fell with you */
      /* (claude/rookery2) the nest tips a hero off the perch (toward the summit's middle); a ride ended by a fall */
      tip: (h, P0) => { const pp = h.pp; if (!pp) return; ctx.asPlayer(pp, () => { const P = ctx.hero(); P.vx = (P.x < S.G.mid ? 1 : -1) * 150; P.vy = -90; P.ground = false; }); ctx.dust(P0.x, P0.y, 8); SOUND.teeter(ctx.sfx); },
      unride: pp => { if (pp) { pp.ssRide = null; } },
      letGo: (s, pp, d) => { if (!pp) return; ctx.asPlayer(pp, () => { const P = ctx.hero(); pp.ssHeld = null; P.vx = 0; P.vy = 0; P.ground = false;
          if (d > 0 && ctx.upright(pp) && !P.dead) { hurt('drop', () => ctx.damagePlayer(P.x, d, { who: A0, name: 'drop', unblockable: true, noKnock: true })); ctx.number(P.x, P.y - 30, SSM.SS_SAY.letGo, '#ff6b6b'); SOUND.letGo(ctx.sfx); } }); },
    };
  }
  H.update = (e, dt) => {
    if (!S || !e.alive || !A()) return; const w = world();
    /* THE GAME'S SCALING (the road's tier, the difficulty) is on the anchor's health: share it out to the three, once */
    if (!S.scaled) { S.scaled = true; const sum0 = ROLES.reduce((n, r) => n + S.sis[r].maxHp, 0), k = (e.maxHp || sum0) / sum0;
      for (const r of ROLES) { const s = S.sis[r]; s.maxHp = s.hp = Math.round(s.maxHp * k); if (bodies[r]) bodies[r].maxHp = bodies[r].hp = s.hp; } e.maxHp = ROLES.reduce((n, r) => n + S.sis[r].maxHp, 0); e.hp = e.maxHp; }
    if (e.mode === 'wake' && !S.woke) { S.woke = true; e.modeT = 1.8; ctx.number(S.G.mid, S.G.floorY - 120, SSM.SS_SAY.wake, '#ffd36b'); SOUND.scream(ctx.sfx); ctx.shake(4);
      ROLES.forEach((r, i) => { const s = S.sis[r]; s.mode = 'wake'; s.modeT = 1.2 + i * 0.35; }); }
    if (S.woke && !S.told.rule && e.modeT <= 0.2) { S.told.rule = 1; ctx.number(S.G.mid, S.G.floorY - 104, SSM.SS_SAY.rule, '#ffd36b'); ctx.hint && ctx.hint(SSM.SS_SAY.rule); }
    if (!S.woke) return;
    /* (claude/sisters2) a held hero who went down: she drops him; a shoved hero who reaches the summit's lip TEETERS (a told stagger) */
    if (S.held && (!ctx.upright(S.held.pp) || S.held.pp.dead || !(S.held.pp.hp > 0))) { S.held.pp.ssHeld = null; const sn = S.sis[S.held.by || 'snatcher']; S.held = null; if (sn.alive && (sn.mode === 'lift' || sn.mode === 'hold')) { sn.mode = 'rise'; sn.modeT = SS.dive.rise; } }
    if (S.ride && (!ctx.upright(S.ride.pp) || S.ride.pp.dead)) { S.ride.pp.ssRide = null; S.ride = null; }
    for (const pp of ctx.players) { const q = pp.ssShove; if (!q) continue; q.t -= dt; const edge = SS.shock.edge, atL = pp.x < S.G.x0 + edge, atR = pp.x > S.G.x1 - edge;
      if ((atL && q.dir < 0) || (atR && q.dir > 0)) { pp.ssShove = null; S.n.teeters++; ctx.asPlayer(pp, () => { const P = ctx.hero(); P.hurt = Math.max(P.hurt || 0, SS.shock.teeter); P.vx = 0; });
        ctx.number(pp.x, pp.y - 34, SSM.SS_SAY.teeter, '#ff6b6b'); SOUND.teeter(ctx.sfx); ctx.burst(pp.x + q.dir * 6, S.G.floorY - 2, 8, ['#bf9fa0', '#725a62', '#e4c8c4'], 70, 0.7); ctx.shake(2); }
      else if (q.t <= 0) pp.ssShove = null; }
    SSM.stepSisters(S, dt, heroes(), w);
    /* the bodies follow the sisters; a sister at 0 falls */
    let sum = 0;
    for (const r of ROLES) { const s = S.sis[r], b = bodies[r]; if (!b) continue;
      if (s.alive && s.hp <= 0) { s.alive = false; b.alive = false; b.dying = 0; b.__death = { t0: ctx.time(), x: s.x, y: s.y, face: s.face || -1, sc: scaleOf(s), g: giftsOf(S.dead) }; ctx.burst(s.x, s.y - 10, 26, [COL[r].body, COL[r].light, '#e6dcc0'], 140, 0.9); SSM.fell(S, r, w); }
      if (s.alive) { b.x = s.x; b.y = s.y; b.face = s.face || b.face; b.mode = s.mode; b.hp = s.hp; b.ward = s.ward; b.open = SSM.sisOpen(s) ? Math.max(0, s.modeT) : 0; sum += s.hp;
        const sc = scaleOf(s); b.w = Math.round(SS.sister.w * sc); b.h = Math.round(SS.sister.h * sc); } }   /* (claude/rookery2) the survivor's body grows with her */
    e.hp = Math.max(sum, ROLES.some(r => S.sis[r].alive) ? 1 : 0); e.phase = S.ph; e.mode = SSM.ssOpen(S) ? 'open' : e.mode === 'wake' && e.modeT > 0 ? 'wake' : 'fight';
    e.open = SSM.ssOpen(S) ? 1 : 0; e.ward = ROLES.some(r => S.sis[r].alive && S.sis[r].ward > 0) ? 1 : 0;
    if (!ROLES.some(r => S.sis[r].alive) && e.alive) { e.hp = 1; e.ssPass = true; ctx.killBoss(e); }
  };
  /* A BLOW ON A SISTER (main.js hurtEnemy0): her own number (B15), shown on her, then off the anchor's bar */
  H.hit = (b, dmg, fromX, pl) => { if (!S || !b || !b.alive) return; const s = S.sis[b.role]; if (!s || !s.alive || s.mode === 'sleep') return;
    const [d, word] = SSM.takeBlow(s, dmg, pl); s.hp = Math.max(0, s.hp - d); b.hp = s.hp; b.flash = 0.12; b.hurtT = 0.12;
    if (word) { S.n[word === 'WARDED' ? 'wardHits' : 'wingHits']++; b.guardFx = 0.3; b.guardWord = word; ctx.sfx.clank && ctx.sfx.clank(); const sd = Math.sign(fromX - s.x) || 1; ctx.sparks(s.x + sd * 10, s.y - 10, -sd, 4);
      if (!S.told.wing && word === 'ON THE WING') { S.told.wing = 1; ctx.hint && ctx.hint('ON THE WING A BLOW BARELY LANDS. STAND ON A CRACK, LET HER DIVE, STEP OFF: SHE LIES STUNNED IN THE RUBBLE. CUT THEM WHEN THEY COME LOW.'); } }
    else S.n[SSM.sisOpen(s) ? 'openHits' : 'lowHits']++;
    ctx.number(s.x, s.y - 26, d, SSM.sisOpen(s) ? '#ffd36b' : word ? '#9aa39a' : '#fff6e0'); ctx.hitstop && ctx.hitstop(0.03);
    const e = anchor(); if (e) e.hp = Math.max(1, ROLES.reduce((n, r) => n + (S.sis[r].alive ? S.sis[r].hp : 0), 0)); };
  /* (claude/sisters2) THE HOLD: main.js updatePlayer hands a held hero here every frame instead of moving him - he hangs from her talons; a swing is a STRIKE on her (a real blow,
     whole: her hands are full) and SS.grab.strikes of them break her grip (she falls, KNOCKED DOWN). false = not held (any more) */
  const scaleOf = s => S && S.p2 === s.role ? (s.mode === 'grow' ? 1 + (SS.p2.scale - 1) * (1 - Math.max(0, s.modeT) / SS.p2.grow) : SS.p2.scale) : 1;
  /* (claude/rookery2) THE RIDE TO THE PERCH: UP / GRAB by a sister climbing off the rock (main.js updatePlayer, the hero it moves) - true = she has him */
  H.tryRide = P => { if (!S || !A() || P.dead || P.ssRide || P.ssHeld) return false; const ok = SSM.tryRide(S, { x: P.x, y: P.y, pp: P }); if (ok) { P.ssRide = true; ctx.number(P.x, P.y - 40, SSM.SS_SAY.ferry, '#ffd36b'); SOUND.caught(ctx.sfx); } return ok; };
  /* riding: he hangs from her talons (no swing); JUMP lets go; at the perch she lets him down onto it. false = not riding (any more) */
  H.ride = (P, jump) => { const R = S && S.ride; if (!R || R.pp !== P) { P.ssRide = null; return false; } const s = S.sis[R.by];
    if (!s.alive || R.done || jump) { S.ride = null; P.ssRide = null; P.vx = 0; P.vy = jump && !R.done ? -150 : 0; P.ground = false; if (s.alive && s.mode === 'ferry') { s.mode = 'rise'; s.modeT = SS.dive.rise; } return false; }
    P.x = s.x; P.y = s.y + SS.ride.hang; P.vx = 0; P.vy = 0; P.ground = false; return true; };
  H.held = (P, swing) => { if (!S || !S.held || S.held.pp !== P) { P.ssHeld = null; return false; } const s = S.sis[S.held.by || 'snatcher'], b = bodies[S.held.by || 'snatcher'];
    if (!s.alive || !(s.mode === 'lift' || s.mode === 'hold')) { S.held = null; P.ssHeld = null; return false; }
    P.x = s.x; P.y = s.y + SS.grab.hang; P.vx = 0; P.vy = 0; P.ground = false;
    if (swing) { const r = SSM.strikeHeld(S, world()); if (r) { if (ctx.strike && b) ctx.strike(b); ctx.sparks(s.x, s.y + 4, P.face || 1, 5); ctx.hitstop && ctx.hitstop(0.03); }
      if (r === 'free' || r === 'fall') { P.vy = r === 'fall' ? 20 : -40; P.ssHeld = null; return false; } }
    if (!S.held) P.ssHeld = null; return !!S.held; };
  /* (claude/rookery2) THREE BARS (brief B1): one per sister, side by side under the plate, each in her colour with her pip and her name; a fallen sister's bar is crossed out;
     the survivor's bar glows in phase 2. main.js draws the plate and calls this instead of the one bar */
  /* (claude/rookery2art) THE THREE-BAR STYLE: each sister a carved bone-and-stone plate - her BIRD-HEAD ICON in her colours (the diver's pale crest, the shrieker's red fan, the snatcher's scarred
     brow) in a notched socket, then her bar: a bone frame, a two-tone fill with quarter ticks, her colour at its head; OPEN = a gold blink and a bright socket; the survivor of phase 2 glows ember;
     a fallen sister's plate is CRACKED - the icon greyed with a black fracture, the bar empty with a crack through it and a feather laid on it */
  const ICON = { diver: { a: '#6a7890', b: '#dce6f4', c: '#c8d4e8' }, shrieker: { a: '#8a4a5a', b: '#e04a3a', c: '#c0302a' }, snatcher: { a: '#8a7048', b: '#d8b070', c: '#8a2a2a' } };
  const bird = (g, x, y, r, dead, lit) => { const I = ICON[r], sk = dead ? '#6a6478' : '#e8e0d4', ac = dead ? '#4a4658' : I.a, hi = dead ? '#8a8498' : I.b;
    const R2 = (dx, dy, w, h, c) => { g.fillStyle = c; g.fillRect(x + dx, y + dy, w, h); };
    R2(0, 0, 9, 9, lit ? '#6a5a3a' : '#24202e'); R2(1, 1, 7, 7, lit ? '#3a3020' : '#1a1624');   /* the socket */
    if (r === 'shrieker') { R2(2, 1, 1, 2, hi); R2(4, 0, 1, 3, I.c); R2(6, 1, 1, 2, hi); } else if (r === 'diver') { R2(1, 1, 3, 2, hi); R2(2, 0, 2, 1, I.c); } else { R2(2, 1, 5, 2, ac); R2(1, 2, 1, 2, ac); }   /* the crest / mane */
    R2(2, 3, 4, 4, sk); R2(2, 3, 4, 1, ac); R2(3, 4, 1, 1, dead ? '#14101e' : '#ff4a2a'); if (dead) { R2(4, 4, 1, 1, '#14101e'); }   /* the face and its eye (an X when she is down) */
    R2(6, 5, 2, 1, dead ? '#8a8498' : '#e8c870'); R2(6, 6, 1, 1, dead ? '#6a6478' : '#a88838');   /* the beak */
    if (r === 'snatcher' && !dead) R2(4, 2, 1, 3, '#8a2a2a');   /* the scar */
    if (dead) { g.fillStyle = '#0a0810'; for (let q = 0; q < 9; q++) g.fillRect(x + q, y + Math.round(q * 0.9), 1, 1); } };
  H.drawBars = (g, VW, VH, y, h, time) => { if (!S) return false; const w = 42, gap = 5, x0 = Math.round(VW / 2 - (w * 3 + gap * 2) / 2), ih = Math.max(9, h + 2);
    ROLES.forEach((r, i) => { const s = S.sis[r], bx = x0 + i * (w + gap), k = s.alive ? Math.max(0, s.hp) / s.maxHp : 0, open = SSM.sisOpen(s), p2 = S.p2 === r, dead = !s.alive, fx = bx + 10, fw = w - 10;
      bird(g, bx, y + Math.round((h - 9) / 2), r, dead, open || p2);
      g.fillStyle = '#14101e'; g.fillRect(fx - 1, y - 1, fw + 2, h + 2); g.fillStyle = dead ? '#3a3646' : '#2a2236'; g.fillRect(fx, y, fw, h);
      const col = open ? (Math.floor(time * 8) % 2 ? '#ffd36b' : '#fff6c8') : p2 ? (Math.floor(time * 5) % 2 ? '#ff8a4a' : '#ff6b3a') : COL[r].crest, fl = Math.round(fw * k);
      if (!dead && fl > 0) { g.fillStyle = col; g.fillRect(fx, y, fl, h); g.fillStyle = 'rgba(255,255,255,0.28)'; g.fillRect(fx, y, fl, 1); g.fillStyle = 'rgba(0,0,0,0.28)'; g.fillRect(fx, y + h - 1, fl, 1); }
      g.fillStyle = 'rgba(20,16,30,0.7)'; for (let q = 1; q < 4; q++) g.fillRect(fx + Math.round(fw * q / 4), y, 1, h);   /* quarter ticks */
      g.fillStyle = p2 ? '#ff8a4a' : open ? '#ffd36b' : '#8a8098'; g.fillRect(fx - 1, y - 1, fw + 2, 1); g.fillRect(fx - 1, y + h, fw + 2, 1);   /* the frame's lit edges */
      if (dead) { g.fillStyle = '#0a0810'; let cy2 = y; for (let q = 0; q < fw; q++) { if (q % 5 === 2) cy2 = y + ((q * 7) % h); g.fillRect(fx + q, Math.max(y, Math.min(y + h - 1, cy2)), 1, 1); } g.fillStyle = '#e6e4ec'; g.fillRect(fx + fw - 12, y + 1, 8, 1); g.fillStyle = '#c0bece'; g.fillRect(fx + fw - 10, y + 2, 5, 1); }   /* cracked, a feather laid on it */
      ctx.text(r === 'diver' ? 'DIVER' : r === 'shrieker' ? 'SHRIEKER' : 'SNATCHER', bx + w / 2, y - 7, dead ? '#5a5468' : COL[r].light, 'center', 5); });   /* (her name over her bar: main.js lifts the plate 7 px for it) */
    return true; };
  H.barName = () => { if (!S) return 'THE SHRIEK SISTERS'; const left = ROLES.filter(r => S.sis[r].alive), open = left.find(r => SSM.sisOpen(S.sis[r]));
    return 'THE SHRIEK SISTERS' + (open ? '  ' + SSM.NAME[open] + ' ' + SSM.OPEN_NAME[S.sis[open].mode] : left.length < 3 ? '  ' + left.length + ' LEFT' : ''); };
  H.end = () => { if (S) { S.rocks = []; S.waves = []; S.marks = []; S.echoes = []; S.held = null; S.ride = null; } unhold(); BOSS_PHASE.shrieksisters = 1; for (const r of ROLES) if (bodies[r]) bodies[r].alive = false; };
  H.read = () => S && { ph: S.ph, p2: S.p2, ride: S.ride ? S.ride.by : null, dead: { ...S.dead }, sis: Object.fromEntries(ROLES.map(r => [r, { mode: S.sis[r].mode, hp: S.sis[r].hp, alive: S.sis[r].alive, ward: S.sis[r].ward, x: S.sis[r].x, y: S.sis[r].y }])),
    slabs: S.G.slabs.map(s => ({ x: s.x, st: s.st })), stones: S.stones.length, echoes: S.echoes.length, held: !!S.held, n: JSON.parse(JSON.stringify(S.n)), hurt: { ...(S.hurt || {}) } };
  const X = cx => v => R(v - cx), Y = cy => v => R(v - cy);
  /* THE SUMMIT: the slabs (cracked, or rubble growing back), the stones the snatcher left, the shelves' guano, the Roc's peak beyond */
  H.drawBack = (g, cx, cy, time) => { if (!S) return; const x = X(cx), y = Y(cy), G = S.G, fy = y(G.floorY);
    drawArena(g, cx, cy, g.canvas.width, g.canvas.height, time, A(), G);   /* (claude/rookery2art) the perch's nest, the shelves' eggs, the monastery on the far crag */
    for (const sl of G.slabs) { const sx = x(sl.x) - SS.slab.w / 2;
      if (sl.st === 'crack') { g.drawImage(bakeSummitSlab(SS.slab.w), sx, fy - 1);
        g.strokeStyle = Math.floor(time * 3) % 2 ? '#ffd36b' : 'rgba(255,211,107,0.5)'; g.strokeRect(sx + 0.5, fy - 2.5, SS.slab.w - 1, 5); }
      else { g.drawImage(bakeSummitRubble(SS.slab.w), sx, fy - 4); const k = 1 - sl.t / SS.slab.regrow[0]; rect(g, sx, fy + 3, R(SS.slab.w * Math.max(0, k)), 1, '#c8d8e8'); } }
    for (const q of S.stones) { const sx = x(q.x), a = q.t < 2 ? (Math.floor(time * 8) % 2 ? 0.4 : 1) : 1; g.globalAlpha = a; g.drawImage(bakeSummitStone(), sx - 10, fy - 11); g.strokeStyle = '#ffd36b'; g.strokeRect(sx - 10.5, fy - 10.5, 21, 11); g.globalAlpha = 1; }
    /* (claude/sisters2) THE ECHO'S CRACKED TILES (bait: the gold glint ring, blinking out as they crumble) and THE LIP at each end of the summit (it blinks while a shock shriek swells) */
    const ew = SS.echo.w; for (const q of S.echoes) { const sx = x(q.x) - ew / 2, a = q.t < 2 ? (Math.floor(time * 8) % 2 ? 0.4 : 1) : 1; g.globalAlpha = a; g.drawImage(bakeSummitEcho(ew), sx, fy - 1); g.strokeStyle = Math.floor(time * 3) % 2 ? '#ffd36b' : 'rgba(255,211,107,0.5)'; g.strokeRect(sx + 0.5, fy - 2.5, ew - 1, 5); g.globalAlpha = 1; }
    const shocking = ROLES.some(r => S.sis[r].alive && S.sis[r].mode === 'shockTell'), E = SS.shock.edge;
    for (const [ex, side] of [[x(G.x0), -1], [x(G.x1) - E, 1]]) { g.drawImage(bakeSummitLip(side), ex, fy - 1);
      if (shocking) { g.globalAlpha = 0.45 + 0.35 * Math.sin(time * 12); g.strokeStyle = '#ff6b6b'; g.strokeRect(ex + 0.5, fy - 3.5, E - 1, 5); g.globalAlpha = 1; } } };
  H.drawBoss = (g, b, cx, cy, time) => { if (!S || !b || b.t !== 'shrieksister') return; const s = S.sis[b.role]; if (!s) return; b.guardFx = Math.max(0, (b.guardFx || 0) - 1 / 60);
    const flash = (b.hurtT || 0) > 0 || (b.flash || 0) > 0.06; b.hurtT = Math.max(0, (b.hurtT || 0) - 1 / 60); const p = poseOf(s, b, time, flash, S.G);
    g.globalAlpha = 0.25; g.fillStyle = '#10060a'; g.fillRect(R(s.x - 12 - cx), R(S.G.floorY - 2 - cy), 24, 2); g.globalAlpha = 1;
    /* (claude/rookery3) THE TEMPO, SEEN: HEAVY - she swells into her biggest pose (up to +16%) over a dark blood pool that spreads under her, slow crimson rings; MEDIUM - one amber
       ring tightening on her; LIGHT - a white flash of her whole body and a glint at her head, gone in a blink */
    const tc = SSM.sisTelling(s) ? s.tempo : null, tk = tc ? Math.min(1, 1 - Math.max(0, s.modeT) / (s.tempoT || 1)) : 0, tAge = ctx.time() - (s.tempoAt || -9), bx = R(s.x - cx), by = R(s.y - cy);
    let sc = scaleOf(s); if (tc === 'heavy') sc *= 1 + 0.16 * Math.sin(Math.min(1, tk * 1.4) * Math.PI / 2);
    if (tc === 'heavy') { const fy = R(S.G.floorY - cy), rw = 10 + 16 * tk; g.globalAlpha = 0.16 + 0.24 * tk; g.fillStyle = '#4a0610'; g.beginPath(); g.ellipse(bx, fy - 1, rw, 2.5 + 2 * tk, 0, 0, Math.PI * 2); g.fill();
      g.lineWidth = 2; for (let q = 0; q < 2; q++) { const ph = ((time * 1.6 + q * 0.5) % 1); g.globalAlpha = (1 - ph) * (0.35 + 0.4 * tk); g.strokeStyle = '#b8202c'; g.beginPath(); g.arc(bx, by - 10, 14 + ph * 20 * sc, 0, Math.PI * 2); g.stroke(); } g.lineWidth = 1; g.globalAlpha = 1; }
    if (tc === 'medium') { g.globalAlpha = 0.35 + 0.45 * tk; g.strokeStyle = '#ffb04a'; g.beginPath(); g.arc(bx, by - 10, 28 - 12 * tk, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; }
    const lit = tc === 'light' && tAge < 0.14;
    g.save(); g.translate(bx, by); g.scale((s.face || -1) * sc, sc); drawSister(g, b.role, p, flash || lit, time, b.role === 'snatcher' ? undefined : false, S.p2 === b.role ? giftsOf(S.dead) : ''); g.restore();
    if (tc === 'light' && tAge < 0.3) { const k = 1 - tAge / 0.3, L = Math.round(3 + 7 * k), hx = bx + (s.face || -1) * 8, hy = by - 24; g.globalAlpha = 0.5 + 0.5 * k; g.fillStyle = '#ffffff';
      g.fillRect(hx - L, hy, L * 2 + 1, 1); g.fillRect(hx, hy - L, 1, L * 2 + 1); g.fillRect(hx - 1, hy - 1, 3, 3); g.globalAlpha = 1; } };
  /* (claude/rookery2art) A SISTER'S DEATH: struck up and back, a tumbling fall with loose feathers, lying in the rubble, fading (the body is not in the foe list once she is dead) */
  const drawDeaths = (g, x, y, fy, time) => { for (const r of ROLES) { const d = bodies[r] && bodies[r].__death; if (!d) continue; const age = ctx.time() - d.t0; if (age < 0 || age > DEATH.T) continue;
    const sx = x(d.x), fl = fy; let sy = y(d.y), rot = 0, pn = 'dead1', gx = 0; const fall = age - DEATH.struck;
    if (age < DEATH.struck) { sy -= Math.round(Math.sin(age / DEATH.struck * Math.PI) * 7); rot = -0.25 * (age / DEATH.struck); }
    else if (fall < DEATH.fall) { pn = 'dead2'; const t = fall; sy = Math.min(fl, sy + Math.round(60 * t + 340 * t * t * 0.5)); rot = -d.face * 0 + 2.6 * (t / DEATH.fall); gx = -d.face * Math.round(22 * t); if (sy >= fl && t > 0.3) { pn = 'dead3'; rot = 0; } }
    else { pn = 'dead3'; sy = fl; gx = -d.face * 18; }
    const a = age > DEATH.T - 0.55 ? Math.max(0, (DEATH.T - age) / 0.55) : 1; g.globalAlpha = a;
    if (pn === 'dead3') { g.globalAlpha = a * 0.28; g.fillStyle = '#10060a'; g.fillRect(sx + gx - 14, fl - 2, 28, 2); g.globalAlpha = a; }
    g.save(); g.translate(sx + gx, sy); g.scale(d.face * d.sc, d.sc); g.translate(0, -15); g.rotate(rot); g.translate(0, 15); drawSister(g, r, POSE[pn], false, time, r === 'snatcher' ? undefined : false, d.g); g.restore();
    g.fillStyle = COL[r].light; for (let k = 0; k < 7; k++) { const t2 = (age * 0.9 + k * 0.17) % 1.3, fx = sx + gx + Math.round(Math.sin(age * 4 + k * 1.9) * (10 + k * 2)), fy2 = Math.round(sy - 30 + t2 * 44 + k * 2); if (fy2 < fl) { g.fillRect(fx, fy2, 3, 1); g.fillRect(fx + 1, fy2 - 1, 1, 1); } }
    g.globalAlpha = 1; } };
  H.drawOver = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar) return; drawWind(g, g.canvas.width, g.canvas.height, time);   /* (claude/rookery2art) the summit's wind */
    if (!ctx.bossActive) return; const G = S.G, x = X(cx), y = Y(cy), fy = y(G.floorY);
    const blink = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0';
    drawDeaths(g, x, y, fy, time);
    /* the rocks falling, and the red ring where each will land */
    /* (claude/sisters2) THE BOULDER DROP: its SHADOW on the floor - soft while she carries it over you, dark and red-rimmed once it is fixed, growing as the boulder comes down */
    const shadow = (sx, k, fixed) => { const rw = Math.round(SS.rock.r * (0.55 + 0.45 * k)); g.globalAlpha = 0.25 + 0.4 * k; g.fillStyle = '#10060a'; g.beginPath(); g.ellipse(sx, fy - 1, rw, 3 + 2 * k, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
      if (fixed) { g.fillStyle = blink; for (let a = 0; a < 16; a++) { const t2 = a / 16 * Math.PI * 2; g.fillRect(Math.round(sx + Math.cos(t2) * (rw + 2)), Math.round(fy - 1 + Math.sin(t2) * (4 + 2 * k)), 1, 1); } } };
    for (const r of ROLES) { const s = S.sis[r]; if (!s.alive) continue; if (s.mode === 'carry') shadow(x(s.x), 0.2, false); if (s.mode === 'dropTell') shadow(x(s.dropX), 0.45 + 0.3 * (1 - Math.max(0, s.modeT) / SS.rock.tell), true); }
    for (const c of S.rocks) { const q = SSM.rockAt(c, G.floorY); shadow(x(c.x), 0.6 + 0.4 * q.k, true); g.drawImage(bakeBoulder(), x(q.x) - 13, y(q.y) - 17); }
    /* the marks */
    for (const m of S.marks) { const mx = x(m.x), k = m.t / m.T; g.globalAlpha = 0.5 + 0.5 * k; g.strokeStyle = '#ff5a4a'; g.lineWidth = 2; g.strokeRect(mx - 14, fy - 4, 28, 5); g.lineWidth = 1; rect(g, mx - 1, fy - 14, 2, 10, '#ff5a4a'); g.globalAlpha = 1; }
    /* the waves */
    for (const q of S.waves) for (let k = 0; k < 3; k++) { g.strokeStyle = 'rgba(255,211,107,' + (0.8 - k * 0.25) + ')'; g.beginPath(); g.arc(x(q.x) - q.dir * k * 6, fy - 12, 10 + k * 3, q.dir > 0 ? -1 : 2.1, q.dir > 0 ? 1 : 4.2); g.stroke(); }
    /* every aim: the red line from her to her spot - dotted while it follows you, SOLID once it LOCKS */
    for (const r of ROLES) { const s = S.sis[r]; if (!s.alive) continue; const sx = x(s.x), sy = y(s.y - 8);
      if (s.mode === 'diveTell' && s.aim) { const tx = x(s.aim.x), n = Math.max(2, Math.floor(Math.hypot(tx - sx, fy - sy) / 7));
        g.fillStyle = s.aim.lock ? '#ff3a2a' : blink; for (let i = 1; i < n; i++) g.fillRect(R(sx + (tx - sx) * i / n), R(sy + (fy - sy) * i / n), s.aim.lock ? 3 : 2, s.aim.lock ? 3 : 2);
        g.strokeStyle = '#ff3a2a'; g.strokeRect(tx - 12, fy - 3, 24, 4); }
      if (s.mode === 'snatchTell') { g.fillStyle = 'rgba(255,90,74,0.35)'; for (let q = G.x0; q < G.x1; q += 12) g.fillRect(x(q), y(G.floorY - SS.snatch.h) - 1, 7, 2); }
      /* (claude/sisters2) the signature moves' reads */
      if (s.mode === 'diveTell' && s.aim && s.aim.n) ctx.text(s.aim.n + '/' + s.aim.of, x(s.aim.x), fy - 40, s.aim.lock ? '#ff3a2a' : '#ffd36b', 'center', 8);   /* CHAIN STOOP: which dive of the chain */
      if (s.mode === 'chainTell') { g.globalAlpha = 0.5 + 0.4 * Math.sin(time * 14); g.strokeStyle = '#ff3a2a'; g.lineWidth = 2; g.beginPath(); g.moveTo(sx - 8, sy + 10); g.lineTo(sx, sy + 2); g.lineTo(sx + 8, sy + 10); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1; }
      if (s.mode === 'rakeTell') { g.fillStyle = Math.floor(time * 10) % 2 ? '#ffd36b' : 'rgba(255,211,107,0.45)'; const L = SS.rake.v * SS.rake.T; for (let q = 14; q < L; q += 14) { const cx2 = x(s.x + s.rDir * q); for (let k = 0; k < 4; k++) { g.fillRect(cx2 - s.rDir * k, fy - 3 - k, 1, 1); g.fillRect(cx2 - s.rDir * k, fy - 9 + k, 1, 1); } } }   /* TALON RAKE: chevrons along her path */
      if (s.mode === 'shockTell' || s.mode === 'shock') { const k = s.mode === 'shock' ? 1 : 1 - Math.max(0, s.modeT) / SS.shock.tell, L = SS.shock.range, top = fy - SS.shock.h;   /* SHOCK SHRIEK: the cone, pale, filling as she swells */
        g.globalAlpha = 0.12 + 0.22 * k; g.fillStyle = '#ffe9a0'; g.beginPath(); g.moveTo(sx + s.face * 8, sy + 2); g.lineTo(sx + s.face * L, top); g.lineTo(sx + s.face * L, fy); g.lineTo(sx + s.face * 8, fy); g.closePath(); g.fill(); g.globalAlpha = 0.6 + 0.3 * k;
        g.strokeStyle = '#ffd36b'; for (let q = 1; q <= 3; q++) { const r0 = (q / 3) * L * (s.mode === 'shock' ? 1 : 0.35 + 0.65 * k); g.beginPath(); if (s.face > 0) g.arc(sx, sy + 2, r0, -0.45, 0.18); else g.arc(sx, sy + 2, r0, Math.PI - 0.18, Math.PI + 0.45); g.stroke(); } g.globalAlpha = 1; }
      if (s.mode === 'echoTell' && s.echoX != null) { const ex = x(s.echoX), w2 = SS.echo.w / 2; g.strokeStyle = blink; g.strokeRect(ex - w2 - 0.5, fy - 3.5, w2 * 2 + 1, 5);   /* CRACKING ECHO: the tile shivers red */
        g.fillStyle = '#ff3a2a'; for (let k = 0; k < 6; k++) { const jx = Math.round(Math.sin(time * 40 + k * 2.3) * 1.5); g.fillRect(ex - w2 + 2 + k * 3 + jx, fy - 1 - (k % 3), 2, 1); } }
      if (s.mode === 'grabTell') { const L = 150, hy = fy - SS.grab.h - 6; g.fillStyle = Math.floor(time * 12) % 2 ? '#ff3a2a' : 'rgba(255,58,42,0.5)'; for (let q = 10; q < L; q += 9) g.fillRect(sx + s.gDir * q, hy, 5, 2);   /* THE GRAB: the talon line at your height */
        const tx2 = sx + s.gDir * L; g.fillRect(tx2, hy - 4, 1, 10); g.fillRect(tx2 - s.gDir * 3, hy - 3, 1, 2); g.fillRect(tx2 - s.gDir * 3, hy + 3, 1, 2); }
      /* the shared read (B10): OPEN gold ring + bar, WARDED pale ring, a turned blow's word */
      if (SSM.sisOpen(s)) { const kk = Math.max(0, s.modeT / (s.openT0 || 1)); g.globalAlpha = 0.6 + 0.3 * Math.sin(time * 10); g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.strokeRect(sx - 20, sy - 18, 40, 30); g.lineWidth = 1; g.globalAlpha = 1;
        ctx.text(SSM.OPEN_NAME[s.mode] || 'OPEN', sx, sy - 30, '#ffd36b', 'center', 6); g.fillStyle = '#1b1626'; g.fillRect(sx - 16, sy - 24, 32, 3); g.fillStyle = '#ffd36b'; g.fillRect(sx - 16, sy - 24, R(32 * kk), 3); }
      if (s.ward > 0) { g.globalAlpha = 0.35 + 0.25 * Math.sin(time * 6); g.strokeStyle = '#c8d8e8'; g.lineWidth = 2; g.strokeRect(sx - 21, sy - 19, 42, 32); g.lineWidth = 1; g.globalAlpha = 1; ctx.text('WARDED', sx, sy - 30, '#c8d8e8', 'center', 5); }
      const b = bodies[r]; if (b && b.guardFx > 0 && b.guardWord) ctx.text(b.guardWord, sx, sy - 40 - R((0.3 - b.guardFx) * 30), Math.floor(time * 12) % 2 ? '#ffffff' : '#c8d8e8', 'center', 5);
      /* her name over her the first seconds, and a pip of her health */
      if (S.woke && (ctx.time() < (S.nameT || (S.nameT = ctx.time() + 6)))) ctx.text(SSM.NAME[r], sx, sy - 48, '#ece8dc', 'center', 5);
      g.fillStyle = '#1b1626'; g.fillRect(sx - 12, sy + 14, 24, 2); g.fillStyle = COL[r].crest; g.fillRect(sx - 12, sy + 14, R(24 * s.hp / s.maxHp), 2); }
    /* (claude/rookery2) THE RIDE: GRAB over a sister climbing off the rock; her talons on a ferried hero; THE PERCH's nest drawn (greybox: a bone nest lashed to its spire) */
    for (const r of ROLES) { const s = S.sis[r]; if (!s.alive) continue; const sx = x(s.x), sy = y(s.y);
      if (s.mode === 'ferryWait') { g.globalAlpha = 0.55 + 0.4 * Math.sin(time * 12); g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.strokeRect(sx - 16, sy - 12, 32, 26); g.lineWidth = 1; g.globalAlpha = 1; ctx.text(SSM.SS_SAY.ride, sx, sy - 40, Math.floor(time * 8) % 2 ? '#ffd36b' : '#fff6e0', 'center', 5); }
      if (s.mode === 'ferry' && S.ride && S.ride.pp) drawHang(g, sx, sy + 2, y(S.ride.pp.y), time, { lean: -(s.face || 1) * 1 });
      if ((s.mode === 'lift' || s.mode === 'hold') && S.held && S.held.pp) drawHang(g, sx, sy + 2, y(S.held.pp.y), time, { lean: 0 }); }
    if (G.perchS && !S.p2 && S.sis.shrieker.alive && ROLES.some(r => S.sis[r].alive && (S.sis[r].mode === 'ferryWait' || S.sis[r].mode === 'downed'))) { const P0 = G.perchS, px = x(P0.x), py = y(P0.y);   /* where a ride goes: a dotted line up to her nest */
      g.fillStyle = 'rgba(255,233,160,0.5)'; for (let k = 0; k < 10; k++) g.fillRect(px - 30 + k * 3, py - 4 - Math.round(Math.sin(k / 9 * Math.PI) * 6), 1, 1); }
    /* (claude/sisters2) HELD: the escape read over the held hero - STRIKE HER, a pip a strike, the time left before she lets go */
    if (S.held && S.held.pp) { const pp = S.held.pp, hx = x(pp.x), hy = y(pp.y) - 44, k = Math.max(0, 1 - S.held.t / SS.grab.hold);
      ctx.text(S.held.p2 ? 'STRIKE HER: FALL TOGETHER' : 'STRIKE HER', hx, hy - 8, Math.floor(time * 8) % 2 ? '#ffd36b' : '#fff6e0', 'center', 6);
      for (let i = 0; i < (S.held.p2 ? SS.p2.strikes : SS.grab.strikes); i++) { g.fillStyle = '#1b1626'; g.fillRect(hx - 13 + i * 9, hy, 7, 4); g.fillStyle = i < S.held.strikes ? '#8fd160' : '#4a4060'; g.fillRect(hx - 12 + i * 9, hy + 1, 5, 2); }
      g.fillStyle = '#1b1626'; g.fillRect(hx - 14, hy + 6, 28, 3); g.fillStyle = '#ff6b6b'; g.fillRect(hx - 13, hy + 7, R(26 * k), 1); }
  };
  return H;
}
/* THEIR BESTIARY CARD: the three, small (main.js SPR.shrieksistersCard) */
function bakeCardLedge(g) { const S = ['#1c161e', '#30242c', '#4e3c46', '#725a62', '#98807f', '#bf9fa0', '#e4c8c4'];   /* (claude/rookerypolish) the Sisters' Crag shelf they roost on */
  rect(g, 1, 37, 62, 3, S[2]); rect(g, 1, 36, 62, 1, S[5]); rect(g, 1, 35, 62, 1, S[6]); rect(g, 1, 39, 62, 1, S[1]); for (const [x, w] of [[5, 9], [22, 7], [38, 12], [53, 6]]) { rect(g, x, 35, w, 1, '#f8f6f0'); rect(g, x + 1, 34, Math.max(2, w - 3), 1, '#e6e4e0'); } for (const x of [14, 31, 49]) rect(g, x, 37, 1, 3, '#1c1a22'); rect(g, 9, 37, 2, 1, '#e6e4e0'); rect(g, 27, 38, 2, 1, '#e6e4e0'); }
export function bakeShriekSistersCard() {
  const fr = [0, 1].map(i => { const [c, g] = canvas(64, 40); g.imageSmoothingEnabled = false; bakeCardLedge(g);
    ROLES.forEach((r, k) => { g.save(); g.translate(12 + k * 20, 26 + (k % 2) * 8); g.scale(0.55, 0.55); drawSister(g, r, POSE[i ? (r === 'diver' ? 'diveTell' : r === 'shrieker' ? 'screamTell' : 'carry') : 'hover'], false, i * 0.3, undefined); g.restore(); }); return c; });
  const white = fr.map(c => whiten(c)); return { R: fr, L: fr.map(flipX), white: { R: white, L: white.map(flipX) }, ax: 32, ay: 38, w: 56, h: 36 };
}
export const _drawSister = drawSister;
