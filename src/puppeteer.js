// src/puppeteer.js - THE PUPPETEER, the boss of THE MASKWRIGHT'S THEATRE (claude/puppeteer; PUPPETEER3 2026-09-30; THEATRE3 2026-10-02; PUPPETEER2 2026-10-04).
//
// PUPPETEER2 (Daniel, 10-02 night: the level is very good and the puppets are "pretty cool to fight"; rework the BOSS). The fight is three VISITS:
//   1. THE PUPPETS ARE THE MAIN EVENT, on the stage floor, slow and deliberate:
//        THE HARLEQUIN  FAST AND WEAK: short strings of quick jabs (!, block or step back) and a low kick (!!, jump it); he darts round you, and a hero who
//                       stands still is jumped at once. Fragile: PUP.harl.hp, and ONE string - one cut drops him.
//        THE BRUTE      SLOW AND HEAVY: a long-told HEAVY CHOP (!!), a GROUND SLAM (!!, jump it) and a GRAB (!!), then a long RECOVERY. Two strings: the ARM
//                       (cut it: no chop, no grab) and the BACK (cut it: no slam).
//      A PUPPET IS HURT ONLY IN ITS TOLD RECOVERY: after every blow it hangs spent and GLOWS GREEN (or staggers from a GOLD cut in a windup) - then a blow
//      takes its health and a swing across a string cuts it. Any other time the wood turns the blade: a CLANK, a grey spark, a line once.
//      A puppet with its strings all cut, or its health gone, DROPS in a heap for PUP.downT s (x cycleK), then he strings it again.
//   2. HE ADDS TWO SLOW ATTACKS from over the stage, NEVER BOTH AT ONCE, with long gaps (PUP.over.gap):
//        THE PROP DROP   a sandbag or a set piece let go from the flies onto a spot marked by a GROWING SHADOW (!!; step off it).
//        THE SNARE LINE  a line dropped from the grid with a bar on its end, swept SLOWLY across the stage at a TOLD height (!!): low, jump it; high, duck it.
//   3. THE LEVER (the way up to him: the pin rail at the stage door that sends the batten up) is LOCKED, visibly CHAINED, until both puppets are down - a
//      strike just clunks (said once). Both down: the chain drops, the lever GLINTS (src/stuck-guide.js drawGlint, as the canal and the gorge) and a cue
//      sounds. His bar goes slack and he stumbles along the fly gallery towards the batten's end; ride up within PUP.slackT s (x cycleK) or he strings
//      them again.
//   4. NO FALL. On the gallery he is STAGGERED PUP.staggerT s (open, x PUP.openMul) - a visit takes at most PUP.visitCap of his health - then a TOLD
//      KNOCKBACK (he whirls his bar: the gallery is swept) throws every hero on it back down to the stage. His puppets are strung again, the scene changes,
//      the next visit begins. Three good visits end him; a short one costs a fourth.
//   5. SCENE CHANGES WITH IMPACT (Daniel picked four). Each cycle (each visit) brings a different scene, drawn from STORM / NIGHT / INFERNO / SEA in an
//      order shuffled for every fight; the scene left over is the FINALE's MID-CYCLE SHIFT (the first puppet down in phase 3 brings it on). Every effect told:
//        STORM    the curtains billow, then a GUST shoves heroes and puppets one way (brace: hold DOWN or block, as on the moor)
//        NIGHT    the lights drop: two SPOTLIGHTS drift over the boards, and a puppet in the dark cannot be hurt - fight in the light
//        INFERNO  trapdoor FLAMES in a readable pattern: two sets of traps take turns, each glowing and smoking before it burns; the strips between never burn
//        SEA      a painted WAVE FLAT rises in a wing, then rolls the length of the stage (low: jump it)
//      A hazard never starts its tell while another tell (his or the scene's) is running: one windup at a time.
// PHASES (each changes how the duo combines):  1 one at a time;  2 together, and the Brute's slam breaks the boards (a pit that mends);  3 THE MASTERPIECE
//      (the Brute packed away, a wooden king in his place) with the Harlequin.
// Health is never the lever. PURE: no DOM, no main.js; the world is `c` (src/puppeteer-hands.js). tools/puppeteer.mjs proves it.

export const PUP = {
  hp: 720, w: 16, h: 40, markH: 50,
  ward: 0.05, openMul: 0.8,           // (PUPPETEER2: "full damage" on the gallery - the visit cap is what holds a visit to a third)
  staggerT: 3.0,                       // ON THE GALLERY: he is staggered this long (boss-openings asserts >= 3 s)
  visitCap: 1 / 4,                     // A VISIT takes at most this share of his health (then the knockback comes at once). (claude/theatre4: 1/3 -> 1/4 - at the CAMPAIGN level, L22 with the HARNESSCARD card spread, the human bot won 20/21 in 57-130 s; four visits make the fight its 90-150 s)
  dmgK: 1.35,                          // (claude/theatre4) every blow of his, his puppets' and his scenes' lands x this (the same tells, the same answers): the L22 campaign hero has 196-208 health
  slackT: 12.0,                        // BOTH PUPPETS DOWN: the lever is free and his bar slack this long (x cycleK) - the time to ride up
  slumpX: 72, slumpSpeed: 150,          // SLACK: he stumbles along the gallery to this far past its batten end (so a visit is a fight, not a walk)
  knockTell: 1.0, knockT: 0.3, knockVx: 150, knockDmg: 12,   // THE KNOCKBACK: told (his bar whirls, the gallery glows red), then every hero on the gallery is thrown down
  hangLow: 56,                         // one puppet down: his bar sinks this far below the gallery (still out of reach from the boards)
  riseT: 0.8,
  sceneT: 1.6,
  downT: { harlequin: 3.5, marionette: 4.5, masterpiece: 5.5 },   // a dropped puppet stays down this long (x cycleK), then he strings it again
  restring: 0.08, restringMin: 0.75,   // EACH CYCLE he re-strings faster: his down and slack times x (1 - restring x cycle), never under restringMin
  cutStun: 0.7,                        // a GOLD cut: the puppet staggers this long (and glows green: it can be hurt)
  flySpeed: 170,
  /* HIS TWO SLOW ATTACKS, taking turns, never both at once: the rest after one ends before the next is told (by phase) */
  over: { first: 3.0, gap: [4.0, 3.8, 3.5] },
  drop: { tell: 1.4, half: 20, dmg: 30, top: 26 },                         // THE PROP DROP: a growing shadow, then the sandbag (!!, no shield turns it)
  snare: { tell: 1.3, speed: 115, dmg: 26, hold: 0.6, bar: 12 },           // THE SNARE LINE: told at the wing it starts from, then swept across (115 px/s)
  /* THE SCENES */
  storm: { first: 3.0, every: 5.0, tell: 1.4, on: 2.6, shove: 150, pup: 40 },
  night: { half: 67, speed: 24, dark: 0.6 },   // (claude/theatre4: the pools ~1.6x wider - 42 was a puppet's width; Daniel 10-05)
  grace: 0.25,                         // (claude/theatre4) a blow begun in a puppet's slack window still lands this long after it closes
  inferno: { first: 2.5, tell: 1.3, burn: 1.4, rest: 0.9, dmg: 28, top: 30, hitEvery: 0.6 },
  sea: { first: 3.5, every: 4.8, tell: 1.3, speed: 150, half: 9, dmg: 28 },
  harl: { hp: 70, speed: 130, jabTell: 0.36, jabNext: 0.24, jabT: 0.1, jabs: 2, jabReach: 26, jab: 10, kickTell: 0.5, kickT: 0.2, kickReach: 34, kick: 12,
    rest: 0.6, still: 0.7, dart: 2.2 },
  brute: { hp: 220, speed: 58, chopTell: 1.0, chopReach: 40, chop: 32, slamTell: 1.15, slamReach: 70, slamTop: 12, slam: 34, grabTell: 1.0, grabReach: 30, grab: 35,
    recover: 1.2, range: 44, scale: 1.5 },
  master: { hp: 200, swatTell: 0.9, swatReach: 58, swatTop: 64, swat: 24, stompTell: 1.1, stompHalf: 24, stomp: 30, reachTell: 1.0, reachT: 0.45, reachSpan: 200, reach: 22,
    recover: 2.2, speed: 34, lowerT: 1.6 },
  slamPitT: 4.0, slamPitHalf: 1,       // phase 2: the slam breaks the boards (its column and one each side) for this long
  lowTop: 10, highTop: 24, highBot: 10,
  gap: [0.6, 0.45, 0.45],                // P1: the rest between one duo blow and the next
  pace: 26, keep: 72, mW: 34, mH: 92,
  p2: 2 / 3, p3: 1 / 3,
};
export const PUPPETS = { marionette: { w: 26, h: 64, bodyK: 1.5 },   /* (claude/theatre4: the Brute is DRAWN at x1.5 - his box was the 18 x 44 of the unscaled frame, so a blow at his chest or head met nothing at all; now struck where drawn, as the elites: bodyK keeps his plate where it was) */
  harlequin: { w: 12, h: 28 }, acrobat: { w: 12, h: 28 }, masterpiece: { w: PUP.mW, h: PUP.mH } };
/* THE STRINGS: where each attaches, and the LIMB it holds up (cut it and that limb's attacks are gone) */
export const STRINGS = {
  marionette: [{ k: 'arm', limb: 'arm', dx: 10, up: 9 }, { k: 'back', limb: 'back', dx: -7, up: 10 }],   /* (x the Brute's 1.5: 13-15 px up - where every hero's blade from the boards reaches: the knight's to 17, the pyromancer's staff to 15) */
  harlequin: [{ k: 'cross', limb: 'all', dx: 0, up: 12 }],
  acrobat: [{ k: 'wrist', limb: 'all', dx: 5, up: 13 }],
  masterpiece: [{ k: 'left hand', limb: 'swat', dx: -18, up: 38 }, { k: 'right hand', limb: 'reach', dx: 18, up: 38 }, { k: 'head', limb: 'stomp', dx: 0, up: 94 }, { k: 'back', limb: 'body', dx: -6, up: 70 }],
};
/* which limb a move needs: a move whose limb's string is cut is gone */
export const NEEDS = { chop: 'arm', grab: 'arm', slam: 'back', jab: 'all', kick: 'all', swat: 'swat', stomp: 'stomp', reach: 'reach' };
export const NAME = { marionette: 'THE BRUTE', harlequin: 'THE HARLEQUIN', masterpiece: 'THE MASTERPIECE' };
export const isPuppet = e => !!e && (e.t === 'marionette' || e.t === 'harlequin' || e.t === 'acrobat' || e.t === 'masterpiece');
export const PUP_F = { work: [0, 1], tell: 2, whip: 3, snareTell: 4, ride: 5, restring: [6, 7], fallen: 8, climb: 9, hurt: 10, dead: 11, cut: 12 };
export const MAR_F = { hang: 0, hop: [1, 2], tell: 3, blow: 4, stagger: 5, heap: 6, rise: 7, drop: 8, highTell: 9, high: 10 };
export const MP_F = { hang: 0, walk: [1, 2], swatTell: 3, swat: 4, stompTell: 5, stomp: 6, reachTell: 7, reach: 8, stagger: 9, heap: 10 };
/* SCENES: painted flats brought on with each ([x0, x1, rows up], stage columns 1..38; the batten's columns 1-3 and the lever's never touched) and the scene's rule */
export const SCENES = [
  { key: 'bare', name: 'THE BARE STAGE', flats: [] },
  { key: 'storm', name: 'THE STORM', flats: [[9, 12, 3], [27, 30, 3]] },
  { key: 'night', name: 'THE NIGHT', flats: [[18, 21, 3]] },
  { key: 'inferno', name: 'THE INFERNO', flats: [[6, 8, 3], [30, 32, 3]] },
  { key: 'sea', name: 'THE SEA', flats: [[16, 22, 3]] },
];
export const SCENE_KEYS = ['storm', 'night', 'inferno', 'sea'];
export const sceneKey = show => (SCENES[show && show.scene] || SCENES[0]).key;
/* INFERNO: the trapdoors (stage columns [c0, c1]); set A = the even ones, set B = the odd ones - they take turns; the strips between never burn */
export const TRAPS = [[5, 8], [11, 14], [17, 20], [23, 26], [29, 32], [35, 37]];
export const trapSet = (i) => i % 2;
/* A SHUFFLED ORDER of the four scenes for one fight (rng: the fight's dice) */
export function sceneOrder(rng = Math.random) {
  const o = [1, 2, 3, 4]; for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; } return o;
}

export const pupPhase = e => (e.hp <= e.maxHp * PUP.p3 ? 3 : e.hp <= e.maxHp * PUP.p2 ? 2 : 1);
/* OPEN: staggered on the gallery (PUPPETEER2: no fall - the visit is the opening) */
export const OPEN_MODES = ['staggered'];
export const pupOpen = e => !!e && OPEN_MODES.includes(e.mode);
export const pupTake = e => (pupOpen(e) ? PUP.openMul : PUP.ward);
/* A PUPPET CAN BE HURT (a blow takes its health, a swing across a string cuts it) only in its told recovery, glowing green - or staggered by a gold cut -
   and never in the NIGHT's dark (p.dark, set each frame by the show) */
export const spent = p => !!p && p.alive !== false && !heaped(p) && (p.mode === 'recover' || p.mode === 'stagger');
/* (claude/theatre4, Daniel 10-05: "sometimes invisible, invincible and you can't hit them") THE SHARED READ (design standard B10): HITTABLE = its strings go
   SLACK, it slumps, a GOLD outline and a timer pip; a blow begun in the window that lands just after it still lands (PUP.grace - the window is the
   promise, not the frame). NOT HITTABLE = taut, glowing strings and a grey-steel tint, and a blow CLANKS and says STRINGS TAUT every time */
export const hurtable = p => !!p && p.alive !== false && !heaped(p) && !p.dark && (spent(p) || (p.lateT || 0) > 0);
/* the window's clock: p.winLen is how long this window was when it opened, p.lateT the grace after it closes */
export function winTrack(p, dt) { if (spent(p) && !p.dark) { if (!p.winLen || p.modeT > p.winLen) p.winLen = Math.max(0.05, p.modeT); p.lateT = PUP.grace; }
  else { p.winLen = 0; p.lateT = Math.max(0, (p.lateT || 0) - dt); if (heaped(p) || p.dark) p.lateT = 0; } }
export const winK = p => (p && p.winLen ? Math.max(0, Math.min(1, p.modeT / p.winLen)) : 0);
/* EACH CYCLE HE RE-STRINGS FASTER */
export const cycleK = cycle => Math.max(PUP.restringMin, 1 - PUP.restring * Math.max(0, cycle || 0));
/* BOTH DOWN: the lever is free and his bar slack while show.slack runs */
export const slackNow = (e, show) => !!e && !!show && show.slack > 0 && e.mode === 'slack';
export const snareBand = (kind, floor) => (kind === 'low' ? [floor - PUP.lowTop, floor] : [floor - PUP.highTop, floor - PUP.highBot]);
export const whipBand = snareBand;   /* (the masterpiece's reach uses the same high band) */
export const bandCatches = (kind, floor, box) => { const [t, b] = snareBand(kind, floor); return box.b > t && box.t < b; };
const BLOWS = ['jab', 'kick', 'chop', 'slam', 'grab', 'swat', 'stomp', 'reach'];
const tellOf = m => (typeof m === 'string' && m.endsWith('Tell') ? m.slice(0, -4) : null);
export const limbGone = (p, limb) => limb && p.str.some((s, i) => s.cut && (STRINGS[p.t][i].limb === limb || STRINGS[p.t][i].limb === 'all'));
export const canUse = (p, move) => !limbGone(p, NEEDS[move]);

/* ---------- THE STRINGS ---------- */
/* GOLD: a cut in a windup or a blow is a bonus cut (it cancels the blow) */
export const pupTaut = p => { if (!p || !p.alive) return false; const m = p.mode || '';
  return m.endsWith('Tell') || BLOWS.includes(m) || m === 'fly'; };
export function barOf(e, big) { const y = e.y - (e.mode === 'slack' || e.mode === 'staggered' ? 14 : 34);
  return big ? { x0: e.x - 22, x1: e.x + 22, y } : { x0: e.x - 7, x1: e.x + 7, y }; }
export const heaped = p => !p.alive || p.mode === 'heap' || p.mode === 'fall' || p.mode === 'collapse' || p.mode === 'packed';
/* EVERY STRING NOW: { p, i, k, limb, x0, y0, x1, y1, taut } (cut ones are left out) */
export function stringsOf(e, show) {
  const out = []; if (!e || !show) return out;
  for (const p of show.puppets) { if (heaped(p) || p.mode === 'lower' || p.mode === 'lowerIn') continue;
    const S = STRINGS[p.t], big = p.t === 'masterpiece', bar = barOf(e, big), taut = pupTaut(p), f = p.face || 1, sc = p.t === 'marionette' ? PUP.brute.scale : 1;
    S.forEach((s, i) => { const st = p.str[i]; if (!st || st.cut) return;
      const n = S.length, x0 = bar.x0 + (bar.x1 - bar.x0) * (n === 1 ? 0.5 : i / (n - 1));
      const x1 = p.x + s.dx * f * sc, y1 = p.y - s.up * sc, slack = !taut && hurtable(p), sag = slack ? Math.min(18, 0.22 * Math.hypot(x1 - x0, y1 - bar.y)) : 0;   /* (claude/theatre4) SLACK: hittable, the string droops - its middle hangs `sag` px low (the cut test follows the droop) */
      out.push({ p, i, k: s.k, limb: s.limb, x0, y0: bar.y, x1, y1, taut, slack, mx: (x0 + x1) / 2, my: (bar.y + y1) / 2 + sag }); }); }
  return out;
}
export function segHitsBox(x0, y0, x1, y1, b) {
  let t0 = 0, t1 = 1; const dx = x1 - x0, dy = y1 - y0;
  for (const [p, q] of [[-dx, x0 - b.l], [dx, b.r - x0], [-dy, y0 - b.t], [dy, b.b - y0]]) {
    if (p === 0) { if (q < 0) return false; continue; }
    const r = q / p; if (p < 0) { if (r > t1) return false; if (r > t0) t0 = r; } else { if (r < t0) return false; if (r < t1) t1 = r; } }
  return t0 <= t1;
}
/* A BLOW IN BOX hb: every string it crosses is cut - one of each puppet a swing (`seen` is the swing's hit set) - IF the string is in the GOLD
   (a windup or a blow) or its puppet glows GREEN (hurtable). A slack string on a puppet that is not spent CLANKS: show.clanks gets { p, at }.
   Returns [{ p, k, limb, gold, at }] */
export function strikeStrings(e, show, hb, seen) {
  const cuts = []; if (!e || !show || !hb) return cuts;
  const once = seen || new Set();
  for (const s of stringsOf(e, show)) { const pt = s.p.strTag || (s.p.strTag = {});
    if (once.has(pt) || !(s.slack ? segHitsBox(s.x0, s.y0, s.mx, s.my, hb) || segHitsBox(s.mx, s.my, s.x1, s.y1, hb) : segHitsBox(s.x0, s.y0, s.x1, s.y1, hb))) continue;
    once.add(pt); const st = s.p.str[s.i], at = { x: Math.max(hb.l, Math.min(hb.r, s.x1)), y: Math.max(hb.t, Math.min(hb.b, s.y1)) };
    if (!(s.taut && !s.p.dark) && !hurtable(s.p)) { (show.clanks = show.clanks || []).push({ p: s.p, at }); show.n.clank = (show.n.clank || 0) + 1; continue; }
    st.cut = true; st.cutAt = at; st.gold = s.taut; show.n.cut++; if (s.taut) show.n.goldCut++;
    cuts.push({ p: s.p, k: s.k, limb: s.limb, gold: s.taut, at }); }
  return cuts;
}
export const stringsLeft = p => (p.str || []).filter(s => !s.cut).length;

/* ---------- THE LEVER: the pin rail at the stage door sends the batten up - CHAINED until both puppets are down ---------- */
export const BATTEN = { riseSpeed: 170, lowerSpeed: 110, hold: 3.5, cool: 0.6 };
export function pinStrike(b, free) { if (!free) return 'locked'; if (b.st !== 'down' || b.t > 0) return 'busy'; b.st = 'rise'; return 'free'; }
export function stepBatten(b, dt) {
  b.t = Math.max(0, (b.t || 0) - dt);
  if (b.st === 'rise') { b.y = Math.max(b.up, b.y - BATTEN.riseSpeed * dt); if (b.y <= b.up) { b.st = 'up'; b.t = BATTEN.hold; } }
  else if (b.st === 'up') { if (b.t <= 0) b.st = 'lower'; }
  else if (b.st === 'lower') { b.y = Math.min(b.down, b.y + BATTEN.lowerSpeed * dt); if (b.y >= b.down) { b.st = 'down'; b.t = BATTEN.cool; } }
  return b.y;
}
export const sandbagK = b => (b.down === b.up ? 0 : (b.down - b.y) / (b.down - b.up));

/* ---------- THE SHOW ---------- */
export function newShow(A, rng = Math.random) {
  return { A, puppets: [], turn: 0, gap: 1.0, free: false, cycle: 0, scene: 0, nextScene: 0, order: sceneOrder(rng), shifted: false, change: null, pits: [], slack: 0,
    drops: [], snare: null, overCd: PUP.over.first, overN: 0, visitLeft: 0, gust: null, gustCd: PUP.storm.first, spots: null, trap: null, wave: null, waveCd: PUP.sea.first,
    clanks: [], rng,
    n: { cut: 0, goldCut: 0, cancel: 0, heap: 0, drop: 0, slack: 0, stagger: 0, knock: 0, thrown: 0, restrung: 0, scene: 0, shift: 0, jab: 0, kick: 0, chop: 0, slam: 0, grab: 0,
      swat: 0, stomp: 0, reach: 0, prop: 0, snare: 0, gust: 0, flame: 0, wave: 0, clank: 0, pit: 0, pin: 0, locked: 0, unchain: 0, fly: 0, dart: 0, rise: 0 } };
}
export function newPuppet(p, show) {
  const S = STRINGS[p.t]; p.str = S.map(() => ({ cut: false })); p.mode = p.t === 'masterpiece' ? 'lower' : 'hang'; p.modeT = p.t === 'masterpiece' ? PUP.master.lowerT : 0;
  p.anim = 0; p.vx = 0; p.hopT = 0; p.flown = false; p.floorY = show.A.floor; p.face = p.face || -1; p.puppet = true; p.downT = 0; p.dark = false;
  p.hp = p.maxHp = p.t === 'harlequin' ? PUP.harl.hp : p.t === 'masterpiece' ? PUP.master.hp : p.t === 'marionette' ? PUP.brute.hp : 40;
  if (p.t === 'acrobat') { p.mode = 'packed'; p.alive = false; }   /* (PUPPETEER3: the acrobat is out of the fight - the duo is the fight) */
  show.puppets.push(p); return p;
}
export function newPuppeteer(e) {
  return Object.assign(e, { mode: 'sleep', modeT: 0, phase: 1, open: 0, home: e.x, anim: 0, vx: 0, hang: 0, cast: null, castT: 0 });
}
export function heroFloor(show, h) { const A = show.A;
  if (h.ground && Math.abs(h.y - A.gallery) < 6) return A.gallery;
  if (h.ground && h.y > A.gallery + 20) return Math.round(h.y);
  return h.lastFloor || A.floor; }
const onLoft = (show, h) => !!h && h.ground && Math.abs(h.y - show.A.gallery) < 6;
const startTell = (p, mode, len) => { p.mode = mode; p.modeT = len; p.tellLen = len; p.tellId = (p.tellId || 0) + 1; };
/* DROP A PUPPET: its strings are all cut or its health is gone - a heap, down PUP.downT s */
function drop(p, show, ev, c) { if (heaped(p)) return; const big = p.t === 'masterpiece';
  p.mode = big ? 'collapse' : p.y < show.A.floor - 4 ? 'fall' : 'heap'; p.modeT = big ? 0.6 : 0; p.vy = 0; p.flown = false; p.downT = (PUP.downT[p.t] || 6) * cycleK(show.cycle); p.str.forEach(s => { s.cut = true; });
  show.n.heap++; ev.push({ t: 'heap', p }); c.sound(big ? 'collapse' : 'heap'); }
function restring(p) { p.str.forEach(s => { s.cut = false; s.cutAt = null; s.gold = false; }); p.hp = p.maxHp; p.alive = true; p.flown = false; p.downT = 0; p.left0 = undefined; }

/* ---------- ONE PUPPET'S FRAME ---------- */
function puppetStep(p, e, show, dt, c, ev, hero, mayStrike) {
  const A = show.A; p.anim = (p.anim || 0) + dt; p.modeT -= dt; p.vx = 0;
  const big = p.t === 'masterpiece', brute = p.t === 'marionette', harl = p.t === 'harlequin';
  /* A CUT, SEEN: in the gold it cancels the blow and staggers it; any cut takes that limb's moves away. Strings all gone, or health gone: it drops */
  const left = stringsLeft(p); if (p.left0 === undefined) p.left0 = left;
  if (!heaped(p) && (left === 0 || p.hp <= 0)) { drop(p, show, ev, c); p.left0 = 0; return; }
  if (left < p.left0 && !heaped(p)) { const gold = p.str.some(s => s.cut && s.gold && !s.seen);
    for (const s of p.str) if (s.cut) s.seen = true;
    if (gold && (/Tell$/.test(p.mode) || BLOWS.includes(p.mode))) { show.n.cancel++; ev.push({ t: 'cancel', p, was: p.mode }); p.mode = 'stagger'; p.modeT = PUP.cutStun; }
    else if (/Tell$/.test(p.mode) && !canUse(p, tellOf(p.mode))) { ev.push({ t: 'cancel', p, was: p.mode }); p.mode = 'stagger'; p.modeT = PUP.cutStun; }
    ev.push({ t: 'limp', p }); }
  p.left0 = left;
  switch (p.mode) {
    case 'packed': return;
    case 'fall': p.vy = (p.vy || 0) + 900 * dt; p.y = Math.min(A.floor, p.y + p.vy * dt); if (p.y >= A.floor) { p.mode = 'heap'; c.sound('heap'); } return;
    case 'collapse': if (p.modeT <= 0) p.mode = 'heap'; return;
    case 'heap': p.y = A.floor; if (p.downT > 0) p.downT -= dt; return;
    case 'lower': { const k = 1 - Math.max(0, p.modeT) / PUP.master.lowerT; p.y = A.gallery + 20 + (A.floor - A.gallery - 20) * k; if (p.modeT <= 0) { p.y = A.floor; p.mode = 'hang'; p.modeT = 0.3; } return; }
    case 'rise': if (p.modeT <= 0) { p.mode = 'hang'; p.modeT = 0.2; } return;
    case 'stagger': if (p.modeT <= 0) { p.mode = 'hang'; p.modeT = 0.1; } return;
    case 'recover': if (p.modeT <= 0) { p.mode = 'hang'; p.modeT = 0; if (show.turn === p) show.turn = 0; show.gap = PUP.gap[(e.phase || 1) - 1]; } return;
  }
  /* FLOWN: the Harlequin goes to the height its hero stands at (a flat's top; never the gallery - the gallery is the visit) */
  const hf0 = harl && hero ? heroFloor(show, hero) : A.floor, floor = hf0 <= A.gallery + 4 ? A.floor : hf0;
  if (harl && Math.abs(p.y - floor) > 3 && (p.mode === 'hang' || p.mode === 'fly')) {
    if (p.mode !== 'fly') { p.mode = 'fly'; show.n.fly++; ev.push({ t: 'fly', p }); c.sound('fly'); }
    const d = floor - p.y; p.y += Math.sign(d) * Math.min(Math.abs(d), PUP.flySpeed * dt);
    if (hero) { const dx = hero.x - p.x; p.face = Math.sign(dx) || p.face; p.x += Math.sign(dx) * Math.min(Math.abs(dx) * 0.5, 80 * dt); }
    return; }
  if (p.mode === 'fly') { p.mode = 'hang'; p.y = floor; }
  if (p.mode === 'hang') { p.floorY = floor; p.y = floor; }
  p.flown = p.floorY < A.floor - 4;
  const tm = tellOf(p.mode), f = p.face || 1;
  /* A TELL RUNS OUT: the blow */
  if (tm) { if (p.modeT > 0) return;
    const hitFront = (reach, top, dmg, name, o = {}) => { const x0 = o.both ? p.x - reach : f > 0 ? p.x : p.x - reach, x1 = o.both ? p.x + reach : f > 0 ? p.x + reach : p.x;
      c.hit([x0, x1, p.floorY - top, p.floorY], dmg, name, { from: p.x, unblockable: !!o.unblockable, up: !!o.up, grab: !!o.grab }); };
    show.n[tm] = (show.n[tm] || 0) + 1; ev.push({ t: tm, p }); c.sound(tm);
    if (tm === 'jab') { hitFront(PUP.harl.jabReach, 26, PUP.harl.jab, 'THE HARLEQUIN'); p.mode = 'jab'; p.modeT = PUP.harl.jabT; return; }
    if (tm === 'kick') { hitFront(PUP.harl.kickReach, PUP.lowTop + 2, PUP.harl.kick, 'THE HARLEQUIN', { unblockable: true }); p.mode = 'kick'; p.modeT = PUP.harl.kickT; return; }
    if (tm === 'chop') { hitFront(PUP.brute.chopReach, 44, PUP.brute.chop, 'THE BRUTE', { unblockable: true }); p.mode = 'chop'; p.modeT = 0.25; return; }
    if (tm === 'grab') { hitFront(PUP.brute.grabReach, 40, PUP.brute.grab, 'THE BRUTE', { unblockable: true, grab: true }); p.mode = 'grab'; p.modeT = 0.35; return; }
    if (tm === 'slam') { hitFront(PUP.brute.slamReach, PUP.brute.slamTop, PUP.brute.slam, 'THE SLAM', { unblockable: true, both: true, up: true }); p.mode = 'slam'; p.modeT = 0.3;
      if (p.slamY) c.hit([p.x - PUP.brute.slamReach, p.x + PUP.brute.slamReach, p.slamY - PUP.brute.slamTop, p.slamY], PUP.brute.slam, 'THE SLAM', { from: p.x, unblockable: true, up: true });
      if (e.phase >= 2) { const tx = Math.floor(p.x / A.TS); show.pits.push({ x0: tx - PUP.slamPitHalf, x1: tx + PUP.slamPitHalf, t: PUP.slamPitT }); show.n.pit++; ev.push({ t: 'pit', x: p.x }); c.pit(tx - PUP.slamPitHalf, tx + PUP.slamPitHalf, true); }
      return; }
    if (tm === 'swat') { hitFront(PUP.master.swatReach, PUP.master.swatTop, PUP.master.swat, 'THE MASTERPIECE'); p.mode = 'swat'; p.modeT = 0.3; return; }
    if (tm === 'stomp') { c.hit([p.stompX - PUP.master.stompHalf, p.stompX + PUP.master.stompHalf, A.floor - 22, A.floor], PUP.master.stomp, 'THE STOMP', { from: p.stompX, unblockable: true, up: true }); p.mode = 'stomp'; p.modeT = 0.25; return; }
    if (tm === 'reach') { p.mode = 'reach'; p.modeT = PUP.master.reachT; p.reachR = 0; return; }
  }
  switch (p.mode) {
    case 'jab': if (p.modeT <= 0) { if ((p.combo || 0) > 1 && canUse(p, 'jab') && hero && Math.abs(hero.x - p.x) < PUP.harl.jabReach + 18) { p.combo--; startTell(p, 'jabTell', PUP.harl.jabNext); p.face = Math.sign(hero.x - p.x) || p.face; c.say('!', '#ffd36b'); }
      else { p.mode = 'recover'; p.modeT = PUP.harl.rest; } } return;
    case 'kick': if (p.modeT <= 0) { p.mode = 'recover'; p.modeT = PUP.harl.rest; } return;
    case 'chop': case 'grab': case 'slam': if (p.modeT <= 0) { p.mode = 'recover'; p.modeT = PUP.brute.recover; if (show.turn === p) show.turn = 0; ev.push({ t: 'recover', p }); } return;   /* (his recovery is no blow: the Harlequin may strike in it - that is the duo) */
    case 'swat': case 'stomp': if (p.modeT <= 0) { p.mode = 'recover'; p.modeT = PUP.master.recover; } return;
    case 'reach': { const r1 = PUP.master.reachSpan * Math.min(1, 1 - Math.max(0, p.modeT) / PUP.master.reachT); p.reachR = r1;
      c.band('high', p.reachY || A.gallery, p.x - r1, p.x + r1, PUP.master.reach, 'THE REACH', 'reach' + show.n.reach);
      if (p.modeT <= 0) { p.mode = 'recover'; p.modeT = PUP.master.recover; } return; }
  }
  /* HANGING */
  if (!hero) return;
  const hf = heroFloor(show, hero), dx = hero.x - p.x, adx = Math.abs(dx), same = Math.abs(hf - p.floorY) < 6;
  p.face = Math.sign(dx) || p.face;
  if (harl) {
    /* HE DARTS: round to your other side now and then, fast (a hop you see) */
    p.dartT = (p.dartT || PUP.harl.dart) - dt;
    if (p.dartT <= 0 && same && adx < 70) { p.dartT = PUP.harl.dart + (show.n.dart % 3) * 0.4; p.dartTo = Math.max(A.x0 + 12, Math.min(A.x1 - 12, hero.x - Math.sign(dx || 1) * 30)); show.n.dart++; ev.push({ t: 'dart', p }); c.sound('dart'); }
    if (p.dartTo !== undefined) { const d = p.dartTo - p.x; p.x += Math.sign(d) * Math.min(Math.abs(d), 260 * dt); if (Math.abs(d) < 2) p.dartTo = undefined; return; }
    if (mayStrike && same && canUse(p, 'jab')) {
      const stillPunish = hero.stillT > PUP.harl.still;
      if (adx < PUP.harl.jabReach + 10 && (show.gap <= 0 || stillPunish)) { const k = (show.n.jab + show.n.kick) % 3 === 2 ? 'kick' : 'jab';
        show.turn = e.phase >= 2 ? show.turn : p; p.combo = k === 'jab' ? PUP.harl.jabs : 0; startTell(p, k + 'Tell', k === 'jab' ? PUP.harl.jabTell : PUP.harl.kickTell); ev.push({ t: k + 'Tell', p });
        c.say(k === 'jab' ? '!' : '!!', k === 'jab' ? '#ffd36b' : '#ff6b6b'); c.sound(k + 'Tell'); return; } }
    if (same && adx > PUP.harl.jabReach - 4) { p.vx = Math.sign(dx) * PUP.harl.speed; p.x = Math.max(A.x0 + 10, Math.min(A.x1 - 10, p.x + p.vx * dt)); }
    return; }
  if (brute) {
    /* A HERO ON A FLAT, OR IN A PIT, is no safer: the Brute's slam shakes the boards he stands on (and only the slam reaches him there) */
    const onFlat = Math.abs(hf - A.floor) > 4 && hf > A.gallery + 20;   /* (a flat's top, or down in a broken-board pit) */
    if (mayStrike && (same || onFlat) && show.gap <= 0) {
      const opts = []; if (same && canUse(p, 'chop') && adx < PUP.brute.chopReach + 6) opts.push('chop'); if (same && canUse(p, 'grab') && adx < PUP.brute.grabReach + 4) opts.push('grab');
      if (canUse(p, 'slam') && adx < PUP.brute.slamReach - 10) opts.push('slam');
      p.slamY = onFlat ? hf : null;
      if (opts.length) { const k = opts[(p.blows = (p.blows || 0) + 1) % opts.length]; show.turn = e.phase >= 2 ? show.turn : p;
        startTell(p, k + 'Tell', PUP.brute[k + 'Tell']); ev.push({ t: k + 'Tell', p }); c.say('!!', '#ff6b6b'); c.sound(k + 'Tell'); return; } }
    if ((same || onFlat) && adx > PUP.brute.range - 12) { p.hopT = (p.hopT || 0) + dt; { p.vx = Math.sign(dx) * PUP.brute.speed; p.x = Math.max(A.x0 + 14, Math.min(A.x1 - 14, p.x + p.vx * dt)); } }
    return; }
  if (big) {
    if (mayStrike && show.gap <= 0) { const M = PUP.master;
      if (!same && hero.ground && hf > A.gallery + 4 && canUse(p, 'reach')) { p.reachY = hf; startTell(p, 'reachTell', M.reachTell); show.turn = show.turn || p; ev.push({ t: 'reachTell', p }); c.say('!!', '#ff6b6b'); c.sound('reachTell'); return; }
      if (same && adx < M.swatReach + 6 && canUse(p, 'swat')) { startTell(p, 'swatTell', M.swatTell); show.turn = show.turn || p; ev.push({ t: 'swatTell', p }); c.say('!', '#ffd36b'); c.sound('swatTell'); return; }
      if (same && adx < 160 && adx > M.swatReach && canUse(p, 'stomp') && ((p.blows = (p.blows || 0) + 1) % 2 === 0)) { startTell(p, 'stompTell', M.stompTell); p.stompX = hero.x; show.turn = show.turn || p; ev.push({ t: 'stompTell', p }); c.say('!!', '#ff6b6b'); c.sound('stompTell'); return; } }
    if (same && adx > 44) { p.hopT = (p.hopT || 0) + dt; if (p.hopT % 0.5 < 0.3) { p.vx = Math.sign(dx) * PUP.master.speed; p.x = Math.max(A.x0 + 20, Math.min(A.x1 - 20, p.x + p.vx * dt)); } } }
}

/* ---------- ONE FRAME OF THE SHOW ----------
   c = { heroes: [{ x, y, face, alive, ground, lastFloor, stillT }], say, sound, number(x, y, line, col) (a src/hint-lines.js line), hit(box, dmg, name, { from,
         unblockable, up, grab }), band(kind, floorY, x0, x1, dmg, name, key, { snare }), tile(x, y, 'air'|'ledge'|'floor'), pit(x0, x1, open), summon, pack,
         fling(hero, dir) (THE KNOCKBACK: thrown off the gallery, down to the stage) } */
export function stepShow(e, show, dt, c) {
  const ev = []; if (!e || !show) return ev;
  const A = show.A, heroes = (c.heroes || []).filter(h => h.alive);
  e.anim = (e.anim || 0) + dt; e.modeT -= dt; e.vx = 0;
  if (e.mode !== e.lastMode) { e.lastMode = e.mode; e.tellId = (e.tellId || 0) + 1; }
  if (!e.alive || e.mode === 'sleep') return ev;
  if (e.mode === 'wake') { if (e.modeT <= 0) { e.mode = 'scene'; e.modeT = PUP.sceneT; show.nextScene = show.order[0]; ev.push({ t: 'sceneTell', to: show.nextScene }); c.sound('sceneTell');
      c.number(e.x, e.y - 60, 'DROP BOTH PUPPETS: THE LEVER FREES', '#ffd36b'); } return ev; }
  const hero = heroes.slice().sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0] || null;
  const stageHero = heroes.filter(h => !onLoft(show, h)).sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0] || hero;
  for (const h of heroes) if (h.lastFloor === undefined) h.lastFloor = heroFloor(show, h);
  /* the slam's broken boards mend */
  for (const pt of show.pits) { pt.t -= dt; if (pt.t <= 0 && !heroes.some(h => Math.floor(h.x / A.TS) >= pt.x0 && Math.floor(h.x / A.TS) <= pt.x1 && h.y > A.floor + 2)) { pt.done = true; c.pit(pt.x0, pt.x1, false); } }
  show.pits = show.pits.filter(pt => !pt.done);
  /* ---- THE PHASE, between beats ---- */
  const ph = pupPhase(e);
  if (ph > e.phase && (e.mode === 'work' || e.mode === 'hang1')) {
    e.phase = ph; ev.push({ t: 'phase', ph });
    if (ph === 3) { for (const p of show.puppets) if (p.t === 'marionette' && p.alive) { p.mode = 'packed'; p.alive = false; c.pack(p); }
      if (!show.puppets.some(p => p.t === 'masterpiece')) c.summon('masterpiece', (A.x0 + A.x1) / 2, A.gallery + 10);
      c.sound('masterTell'); c.number(e.x, e.y - 60, 'THE MASTERPIECE: DROP IT AND THE HARLEQUIN', '#ffd36b'); }
    if (ph === 2) c.number(e.x, e.y - 60, 'TOGETHER NOW: HIS SLAM BREAKS THE BOARDS', '#ffd36b'); }
  e.open = pupOpen(e) ? Math.max(0, e.openT || 0) : 0;
  const stage = show.puppets.filter(p => p.mode !== 'packed' && p.t !== 'acrobat');
  const live = stage.filter(p => !heaped(p));
  const fighting = e.mode === 'work' || e.mode === 'hang1';
  /* THE SCENE CHANGE in the middle of the finale (and every cycle's): told, then the flats are laid */
  if (show.change) { show.change.t -= dt; if (show.change.t <= 0) { sceneLay(show, c); show.change = null; ev.push({ t: 'sceneDone' }); } }
  /* NIGHT: the spotlights drift; a puppet outside them is in the dark */
  nightStep(show, dt, stage);
  const busy = !fighting || show.slack > 0;
  if (show.turn && (heaped(show.turn) || !show.puppets.includes(show.turn) || !(/Tell$/.test(show.turn.mode) || BLOWS.includes(show.turn.mode) || show.turn.mode === 'recover'))) show.turn = 0;
  if (!show.turn) show.gap -= dt;
  /* WHO MAY STRIKE: phase 1, one at a time (the turn); phase 2 on, both */
  for (const p of show.puppets) { if (p.mode === 'packed' || !p.alive && p.mode !== 'heap') continue;
    if (busy && !heaped(p) && /Tell$/.test(p.mode)) p.mode = 'hang';
    const may = !busy && (e.phase >= 2 || !show.turn || show.turn === p || (p.t === 'harlequin' && show.turn && show.turn.t !== 'harlequin' && !/Tell$/.test(show.turn.mode) ? true : p.t === 'harlequin' && show.turn && show.turn.mode.endsWith('Tell') && show.turn.modeT < show.turn.tellLen - 0.4));   /* (phase 1: they do not START together; the Harlequin may come in while the Brute is well into a windup or a swing) */
    puppetStep(p, e, show, dt, c, ev, stageHero, may); winTrack(p, dt); }
  /* HIS TWO SLOW ATTACKS and THE SCENE's rule (only while the duo fights: the visit and the scene change are clean) */
  hazardsStep(e, show, dt, c, ev, stageHero, heroes, fighting && !show.change, (fighting || e.mode === 'slack') && !show.change);   /* (his drops keep coming while you make for the lever and ride: up under fire) */
  /* ---- HIS OWN BEATS ---- */
  switch (e.mode) {
    case 'scene': if (e.modeT <= 0) { sceneLay(show, c); for (const p of stage) { restring(p); p.mode = p.t === 'masterpiece' ? 'lower' : 'rise'; p.modeT = p.t === 'masterpiece' ? PUP.master.lowerT : PUP.riseT; if (p.t !== 'masterpiece') p.y = A.floor; }
        show.n.rise++; c.sound('rise'); e.mode = 'work'; show.turn = 0; show.gap = 1.0; show.free = false; ev.push({ t: 'restrung' }); } return ev;
    case 'slack': {
      /* BOTH PUPPETS DOWN: the lever is free, his bar slack - he stumbles along the gallery towards the batten's end. A hero who stands on the gallery staggers him */
      e.y += Math.sign(A.gallery - e.y) * Math.min(Math.abs(A.gallery - e.y), 120 * dt);
      const sx = A.gx0 + PUP.slumpX; if (Math.abs(sx - e.x) > 2) { e.vx = Math.sign(sx - e.x) * PUP.slumpSpeed; e.x += e.vx * dt; }
      if (hero) e.face = Math.sign(hero.x - e.x) || e.face;
      const up = heroes.find(h => onLoft(show, h));
      if (up && Math.abs(e.y - A.gallery) < 4) { e.mode = 'staggered'; e.openT = PUP.staggerT; e.open = e.openT; show.slack = 0; show.free = false; show.visitLeft = Math.round(e.maxHp * PUP.visitCap);
        show.n.stagger++; ev.push({ t: 'stagger' }); c.sound('stagger'); c.number(e.x, e.y - 60, 'HE REELS: STRIKE HIM', '#ffd36b'); return ev; }
      slackClock(e, show, dt, c, ev, stage); return ev; }
    case 'staggered': {
      /* OPEN on the gallery (PUPPETEER2: no fall). He stands his ground; the visit ends with the time or the cap */
      e.openT = (e.openT || 0) - dt; e.open = Math.max(0, e.openT);
      if (hero) e.face = Math.sign(hero.x - e.x) || e.face;
      if (e.openT <= 0 || show.visitLeft <= 0) { e.mode = 'knockTell'; e.modeT = PUP.knockTell; e.tellLen = PUP.knockTell; e.open = 0; ev.push({ t: 'knockTell' }); c.sound('knockTell');
        c.number(e.x, e.y - 60, 'HE THROWS YOU OFF THE GALLERY', '#ff9a5c'); }
      return ev; }
    case 'knockTell': if (e.modeT <= 0) { e.mode = 'knock'; e.modeT = PUP.knockT; show.n.knock++; ev.push({ t: 'knock' }); c.sound('knock');
        for (const h of heroes) if (onLoft(show, h) || (h.y < A.floor - 20 && h.y <= A.gallery + 8)) { show.n.thrown++; c.hit([h.x - 4, h.x + 4, h.y - 30, h.y + 2], PUP.knockDmg, 'THE KNOCKBACK', { from: e.x, unblockable: true }); c.fling(h, 1); }   /* (still up there when it comes: it hurts - told a second ahead, so drop off first) */   /* (always out over the stage, away from the batten's well at the door) */ }
      return ev;
    case 'knock': if (e.modeT <= 0 && e.noScene) { e.noScene = false; e.mode = 'work'; return ev; }   /* (a hero thrown off the gallery outside a visit: no new scene) */
      if (e.modeT <= 0) { show.cycle++; show.nextScene = nextSceneOf(show); e.mode = 'scene'; e.modeT = PUP.sceneT; ev.push({ t: 'sceneTell', to: show.nextScene }); c.sound('sceneTell');
        c.number(e.x, e.y - 60, 'SCENE CHANGE: WATCH THE BOARDS', '#ffd36b'); }
      return ev;
  }
  /* ---- WORK: he hangs from his bar over the stage. How many of his puppets are down sets how low it hangs; with them all down the lever is FREE ---- */
  const down = stage.filter(p => heaped(p)).length;
  if (stage.length && down === stage.length) { show.slack = PUP.slackT * cycleK(show.cycle); e.mode = 'slack'; e.modeT = 0; show.free = true; show.n.slack++; show.n.drop++; show.n.unchain++;
    show.drops.length = 0; show.snare = null; if (show.gust) show.gust = null; if (show.wave) show.wave = null; if (show.trap) show.trap.ph = 'rest';
    ev.push({ t: 'slack' }); ev.push({ t: 'unchain' }); c.sound('unchain'); c.number(e.x, e.y - 60, 'THE LEVER IS FREE: RIDE UP TO HIM', '#ffd36b'); return ev; }
  /* THE FINALE's MID-CYCLE SHIFT: the first of its puppets down brings on the scene left over */
  if (e.phase >= 3 && !show.shifted && down > 0 && !show.change && show.order[3]) { show.shifted = true; show.nextScene = show.order[3]; show.change = { t: PUP.sceneT, len: PUP.sceneT };
    show.n.shift++; ev.push({ t: 'sceneTell', to: show.nextScene, shift: true }); c.sound('sceneTell'); c.number(e.x, e.y - 60, 'THE SCENE SHIFTS', '#ffd36b'); }
  /* one down: the other is being strung again once its time is out (he cannot hold a bar with a dead puppet for ever) */
  for (const p of stage) if (heaped(p) && p.downT <= 0 && p.mode === 'heap') { restring(p); p.mode = p.t === 'masterpiece' ? 'lower' : 'rise'; p.modeT = p.t === 'masterpiece' ? PUP.master.lowerT : PUP.riseT; p.y = p.t === 'masterpiece' ? A.gallery + 20 : A.floor; ev.push({ t: 'rise', p }); c.sound('rise'); }
  const hangTo = A.gallery + (down > 0 ? PUP.hangLow : 0);
  e.y += Math.sign(hangTo - e.y) * Math.min(Math.abs(hangTo - e.y), 80 * dt);
  e.mode = down > 0 ? 'hang1' : 'work';
  /* A HERO ON THE GALLERY OUTSIDE A VISIT (the batten still up as the slack ran out): he throws him down, told */
  const loft = heroes.find(h => onLoft(show, h));
  if (loft) { e.mode = 'knockTell'; e.modeT = PUP.knockTell; e.tellLen = PUP.knockTell; ev.push({ t: 'knockTell' }); c.sound('knockTell'); c.number(e.x, e.y - 60, 'HE THROWS YOU OFF THE GALLERY', '#ff9a5c'); e.noScene = true; return ev; }
  /* HIS FEET: over his puppets */
  let tx = e.home; const tgt = live.length ? live : stage;
  if (tgt.length) tx = tgt.reduce((a, p) => a + p.x, 0) / tgt.length;
  tx = Math.max(A.gx0 + 16, Math.min(A.gx1 - 16, tx));
  if (Math.abs(tx - e.x) > 4) { e.vx = Math.sign(tx - e.x) * PUP.pace * 1.6; e.x += e.vx * dt; }
  if (hero) e.face = Math.sign(hero.x - e.x) || e.face;
  return ev;
}
/* the next cycle's scene: the shuffled order's next (the 4th is kept for the finale's shift); a fourth visit takes one again, never the scene just played */
function nextSceneOf(show) {
  const k = show.cycle; if (k <= 2) return show.order[k];
  const pool = show.order.filter(s => s !== show.scene); return pool[k % pool.length];
}
/* THE SLACK RUNS OUT: he strings both again (faster each cycle), his bar is taut and the lever chained */
function slackClock(e, show, dt, c, ev, stage) {
  if (!(show.slack > 0)) return; show.slack -= dt; if (show.slack > 0) return;
  show.slack = 0; show.free = false; const A = show.A; show.n.restrung++;
  for (const p of stage) if (heaped(p)) { restring(p); p.mode = p.t === 'masterpiece' ? 'lower' : 'rise'; p.modeT = p.t === 'masterpiece' ? PUP.master.lowerT : PUP.riseT; p.y = p.t === 'masterpiece' ? A.gallery + 20 : A.floor; }
  if (e.mode === 'slack') e.mode = 'work'; show.turn = 0; show.gap = 1.0; ev.push({ t: 'restrung' }); ev.push({ t: 'chain' }); c.sound('rise'); c.number(e.x, e.y - 60, 'TOO SLOW: HE STRINGS THEM AGAIN', '#ff9a5c');
}
/* ---------- HIS TWO SLOW ATTACKS AND THE SCENE'S RULE ---------- */
/* A TELL IS RUNNING (his or the scene's): nothing else may start one - one windup at a time */
export const tellRunning = show => !!(show.drops.length || (show.snare && show.snare.ph === 'tell') || (show.gust && show.gust.ph === 'tell') || (show.trap && show.trap.ph === 'tell') || (show.wave && show.wave.ph === 'tell'));
const hisBusy = show => !!(show.drops.length || show.snare);
function hazardsStep(e, show, dt, c, ev, hero, heroes, on, onHis) {
  const A = show.A;
  /* ---- THE PROP DROP and THE SNARE LINE, taking turns ---- */
  if (onHis && hero && !hisBusy(show)) { show.overCd -= dt;
    if (show.overCd <= 0 && !tellRunning(show)) { const kind = show.overN % 2 === 0 ? 'drop' : 'snare'; show.overN++; show.overArmed = true;
      if (kind === 'drop') { const D = PUP.drop, fy = heroFloor(show, hero) <= A.gallery + 4 ? A.floor : heroFloor(show, hero);
        const d = { id: (show.dropN = (show.dropN || 0) + 1), x: Math.max(A.x0 + 8, Math.min(A.x1 - 8, hero.x)), fy, t: D.tell, len: D.tell, half: D.half, dmg: D.dmg, bag: true, piece: show.dropN % 2 === 0 };
        show.drops.push(d); show.n.prop++; e.cast = 'dropTell'; e.castT = D.tell; ev.push({ t: 'dropTell', x: d.x, fy }); c.say('!!', '#ff6b6b'); c.sound('dropTell'); }
      else { const S = PUP.snare, kind2 = Math.floor(show.overN / 2) % 2 ? 'high' : 'low', dir = hero.x < (A.x0 + A.x1) / 2 ? -1 : 1;   /* (from the wing farther from you: it takes its time coming) */
        show.snare = { id: (show.snareN = (show.snareN || 0) + 1), kind: kind2, dir, x: dir > 0 ? A.x0 + 4 : A.x1 - 4, ph: 'tell', t: S.tell, len: S.tell };
        show.n.snare++; e.cast = kind2 === 'low' ? 'snareLowTell' : 'snareHighTell'; e.castT = S.tell; ev.push({ t: e.cast, kind: kind2 }); c.say('!!', '#ff6b6b'); c.sound('snareTell');
        if (!show.saidSnare) { show.saidSnare = true; c.number(e.x, e.y - 60, kind2 === 'low' ? 'THE SNARE LINE, LOW: JUMP IT' : 'THE SNARE LINE, HIGH: DUCK IT', '#ff6b6b'); } } } }
  if (e.castT > 0) { e.castT -= dt; if (e.castT <= 0) e.cast = null; }
  for (const d of show.drops) { d.t -= dt; if (d.t > 0) continue; d.done = true; ev.push({ t: 'prop', x: d.x });
    c.hit([d.x - d.half, d.x + d.half, d.fy - PUP.drop.top, d.fy + 2], d.dmg, 'THE PROP DROP', { from: d.x, unblockable: true, up: true }); c.sound('propLand'); }
  show.drops = show.drops.filter(d => !d.done);
  if (show.overArmed && show.drops.length === 0 && !show.snare) show.overArmed = false, show.overCd = PUP.over.gap[Math.max(0, Math.min(2, (e.phase || 1) - 1))];
  const sn = show.snare;
  if (sn) { if (sn.ph === 'tell') { sn.t -= dt; if (sn.t <= 0) { sn.ph = 'sweep'; c.sound('snare'); } }
    else { sn.x += sn.dir * PUP.snare.speed * dt; const b = PUP.snare.bar / 2;
      c.band(sn.kind, A.floor, sn.x - b, sn.x + b, PUP.snare.dmg, 'THE SNARE LINE', 'snare' + sn.id, { snare: PUP.snare.hold });
      if (sn.x < A.x0 - 8 || sn.x > A.x1 + 8) { show.snare = null; show.overCd = PUP.over.gap[Math.max(0, Math.min(2, (e.phase || 1) - 1))]; } } }
  /* ---- THE SCENE ---- */
  const key = sceneKey(show);
  if (key === 'storm') stormStep(show, dt, c, ev, on);
  if (key === 'inferno') infernoStep(show, dt, c, ev, on);
  if (key === 'sea') seaStep(show, dt, c, ev, on, heroes);
}
/* STORM: a gust, told by the curtains billowing (show.gust.ph 'tell'), then on for PUP.storm.on s - the world shoves the heroes (src/puppeteer-hands.js windShove,
   from main.js's wind pass, the way the moor and the Windcaller's howl do it) and the puppets drift */
function stormStep(show, dt, c, ev, on) {
  const S = PUP.storm, A = show.A;
  if (!show.gust) { if (!on) return; show.gustCd -= dt; if (show.gustCd <= 0 && !tellRunning(show)) { show.gustN = (show.gustN || 0) + 1; show.gust = { dir: show.gustN % 2 ? 1 : -1, ph: 'tell', t: S.tell, len: S.tell };
      ev.push({ t: 'gustTell', dir: show.gust.dir }); c.sound('gustTell'); if (!show.saidGust) { show.saidGust = true; c.number((A.x0 + A.x1) / 2, A.floor - 80, 'THE WIND RISES: HOLD DOWN TO BRACE', '#9ad0ff'); } } return; }
  const G = show.gust; G.t -= dt;
  if (G.ph === 'tell') { if (G.t <= 0) { G.ph = 'on'; G.t = S.on; G.len = S.on; show.n.gust++; ev.push({ t: 'gust', dir: G.dir }); c.sound('gust'); } return; }
  for (const p of show.puppets) if (!heaped(p) && p.mode !== 'lower' && p.mode !== 'packed') p.x = Math.max(A.x0 + 12, Math.min(A.x1 - 12, p.x + G.dir * S.pup * dt));
  if (G.t <= 0) { show.gust = null; show.gustCd = S.every - S.tell; }
}
/* NIGHT: two spotlights drift over the boards; a puppet outside both is in the dark (it cannot be hurt). Off the night scene, nobody is in the dark */
export function lit(show, x) { if (!show.spots) return true; return show.spots.some(s => Math.abs(s.x - x) <= PUP.night.half); }
function nightStep(show, dt, stage) {
  const A = show.A, night = sceneKey(show) === 'night' && !show.change;
  if (!night) { show.spots = null; for (const p of stage) p.dark = false; return; }
  if (!show.spots) { const w = A.x1 - A.x0; show.spots = [{ x: A.x0 + w * 0.3, v: PUP.night.speed }, { x: A.x0 + w * 0.72, v: -PUP.night.speed }]; }
  for (const s of show.spots) { s.x += s.v * dt; if (s.x < A.x0 + 60) { s.x = A.x0 + 60; s.v = Math.abs(s.v); } if (s.x > A.x1 - 40) { s.x = A.x1 - 40; s.v = -Math.abs(s.v); } }
  for (const p of stage) p.dark = !lit(show, p.x);
}
/* INFERNO: the trapdoors' two sets take turns: rest, TELL (a glow and smoke), BURN (flames to PUP.inferno.top over the boards) */
export const trapPx = (A, i) => { const [c0, c1] = TRAPS[i]; return [(A.sx + c0) * A.TS, (A.sx + c1 + 1) * A.TS]; };
function infernoStep(show, dt, c, ev, on) {
  const I = PUP.inferno, A = show.A;
  if (!show.trap) show.trap = { set: 1, ph: 'rest', t: I.first, hitT: 0 };
  const T = show.trap; if (!on && T.ph !== 'burn') return;
  T.t -= dt;
  if (T.ph === 'rest') { if (T.t <= 0 && !tellRunning(show)) { T.set = 1 - T.set; T.ph = 'tell'; T.t = I.tell; T.len = I.tell; ev.push({ t: 'flameTell', set: T.set }); c.sound('flameTell');
      if (!show.saidFlame) { show.saidFlame = true; c.number((A.x0 + A.x1) / 2, A.floor - 80, 'THE TRAPS GLOW: STAND BETWEEN THEM', '#ff9a5c'); } } return; }
  if (T.ph === 'tell') { if (T.t <= 0) { T.ph = 'burn'; T.t = I.burn; T.len = I.burn; T.hitT = 0; show.n.flame++; ev.push({ t: 'flame', set: T.set }); c.sound('flame'); } return; }
  T.hitT -= dt;
  if (T.hitT <= 0) { T.hitT = I.hitEvery; TRAPS.forEach((tr, i) => { if (trapSet(i) !== T.set) return; const [x0, x1] = trapPx(A, i); c.hit([x0, x1, A.floor - I.top, A.floor + 2], I.dmg, 'THE TRAPDOOR FLAMES', { from: (x0 + x1) / 2, unblockable: true, up: true }); }); }
  if (T.t <= 0) { T.ph = 'rest'; T.t = I.rest; }
}
/* SEA: a wave flat rises in a wing (told), then rolls the length of the stage, low: jump it */
function seaStep(show, dt, c, ev, on, heroes) {
  const S = PUP.sea, A = show.A;
  if (!show.wave) { if (!on) return; show.waveCd -= dt; if (show.waveCd <= 0 && !tellRunning(show)) { show.waveN = (show.waveN || 0) + 1; const dir = show.waveN % 2 ? 1 : -1;
      show.wave = { id: show.waveN, dir, x: dir > 0 ? A.x0 + 6 : A.x1 - 6, ph: 'tell', t: S.tell, len: S.tell }; ev.push({ t: 'waveTell', dir }); c.sound('waveTell');
      if (!show.saidWave) { show.saidWave = true; c.number((A.x0 + A.x1) / 2, A.floor - 80, 'A WAVE IN THE WINGS: JUMP IT', '#9ad0ff'); } } return; }
  const W = show.wave;
  if (W.ph === 'tell') { W.t -= dt; if (W.t <= 0) { W.ph = 'roll'; show.n.wave++; ev.push({ t: 'wave', dir: W.dir }); c.sound('wave'); } return; }
  W.x += W.dir * S.speed * dt; c.band('low', A.floor, W.x - S.half, W.x + S.half, S.dmg, 'THE WAVE', 'wave' + W.id);
  if (W.x < A.x0 - 10 || W.x > A.x1 + 10) { show.wave = null; show.waveCd = S.every - S.tell; }
}
/* HIS LINE, from the grid to his bar (drawn) */
export function hangLine(e, show) { const A = show.A; return { x0: e.x + 3, y0: A.y0, x1: e.x + 3, y1: e.y - 40 }; }
function sceneLay(show, c) {
  const A = show.A, sx = A.sx, R = Math.round(A.floor / A.TS), cells = new Map();
  for (const [x0, x1, h] of SCENES[show.scene].flats) for (let x = x0; x <= x1; x++) cells.set((sx + x) + ',' + (R - h), { x: sx + x, y: R - h, t: 'air' });
  for (const [x0, x1, h] of SCENES[show.nextScene].flats) for (let x = x0; x <= x1; x++) cells.set((sx + x) + ',' + (R - h), { x: sx + x, y: R - h, t: 'ledge' });
  for (const o of cells.values()) c.tile(o.x, o.y, o.t);
  show.scene = show.nextScene; show.n.scene++; show.gust = null; show.wave = null; show.trap = null; show.spots = null;
  show.gustCd = PUP.storm.first; show.waveCd = PUP.sea.first;
}

/* ---------- THE STAGE ----------
   FOOTPRINT: 40 columns wall to wall, rows R-16 .. R+1 the stage's own, and ROW R+2 SOLID under the whole stage (the slam's broken boards drop to it).
   Returns { arena, movers } (movers: the batten, for moversExtra). */
export const STAGE = { W: 40, gallery: 9, grid: 16, door: 6 };
export function stagePuppeteer(W, T, TS, sx, R) {
  const { set, block, plat, ent } = W, G = R - STAGE.gallery, top = R - STAGE.grid, ex = sx + STAGE.W - 1;
  block(sx, sx, 0, R - 1); block(ex, ex, 0, R - 1);
  for (let y = R - STAGE.door; y <= R - 1; y++) { set(sx, y, T.AIR); set(ex, y, T.AIR); }
  block(sx, ex, 0, top);
  for (let x = sx + 1; x < ex; x++) for (let y = top + 1; y < R; y++) set(x, y, T.AIR);
  block(sx + 1, ex - 1, R, R + 1);
  set(sx + 1, R, T.AIR); set(sx + 2, R, T.AIR);
  plat(sx + 3, G, ex - sx - 3);
  ent('puppeteer', sx + 30, G - 1, { face: -1 });
  ent('marionette', sx + 16, R - 1, { face: -1 });
  ent('harlequin', sx + 24, R - 1, { face: -1 });
  const arena = { x0: (sx + 1) * TS, x1: ex * TS, floor: R * TS, y0: (top + 1) * TS, trigger: (sx + 5) * TS, wallL: sx, wallR: ex, boss: 'puppeteer', music: 'puppeteer',
    tint: '#6a1a2a', tintA: 0.1, camFrame: true,
    stage: { gallery: G * TS, gx0: (sx + 3) * TS, gx1: ex * TS, pinX: (sx + 3) * TS + 8, sx, R } };
  const batten = { kind: 'lift', batten: true, x: (sx + 1) * TS, y: R * TS, y0: R * TS, y1: G * TS, down: R * TS, up: G * TS, w: 32, h: 8, speed: 0, st: 'down', t: 0 };
  return { arena, movers: [batten] };
}
/* ---------- THE BOT'S READING (src/lab.js): A HUMAN BOT ----------
   It sees a tell PLAN.react s after it began, misreads PLAN.missDodge of them, and goes for a string (rather than the body) PLAN.goString of the time.
   s = { P: { x, y, face, ground, atk }, e, show, reach, shield, onBatten, t, rng, mem } */
export const PLAN = { react: 0.25, missDodge: 0.2, goString: 0.5, goGold: 0.3, goLoft: 0.3, missBrace: 0.25 };   /* (goLoft: kept for tools/boss-navigation.mjs; the bot rides up whenever the lever is free) */
export function puppetPlan(s) { const out = planOf(s), P = s.P, A = s.show.A;
  if (P.ground && P.y > A.floor + 8 && !out.down) { out.jump = true; if (out.gx == null) out.gx = P.x + (P.face || 1) * 30; }   /* in a broken-board pit, going somewhere: jump out */
  return out; }
function planOf(s) {
  const { P, e, show, reach } = s, A = show.A, out = { gx: null, face: P.face, atk: false, jump: false, down: false, drop: false, block: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0;
  mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 600) { mem.seen.clear(); mem.roll.clear(); }
  const seenFor = key => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= PLAN.react; };
  const roll = (key, pr) => { if (!mem.roll.has(key)) mem.roll.set(key, rng() < pr); return mem.roll.get(key); };
  const keyOf = p => (p.t || 'him') + '|' + p.mode + '|' + (p.tellId || 0);
  const sees = p => seenFor(keyOf(p)), dodges = p => sees(p) && !roll(keyOf(p) + '|d', PLAN.missDodge);
  const onGal = Math.abs(P.y - A.gallery) < 6 && P.ground, onStage = P.y > A.gallery + 20, onFloor = P.ground && Math.abs(P.y - A.floor) < 6, clampX = x => Math.max(A.x0 + 12, Math.min(A.x1 - 12, x));
  const pups = show.puppets.filter(p => p.alive && !heaped(p) && p.mode !== 'packed' && p.mode !== 'lower');
  const near = (p, r) => Math.abs(p.x - P.x) < r && Math.abs((p.floorY ?? p.y) - P.y) < 14;
  const open = pupOpen(e), key = sceneKey(show);
  /* ---- 1. HE IS STAGGERED ON THE GALLERY: at him ---- */
  if (open && onGal) { const d = e.x - P.x; out.face = Math.sign(d) || 1; out.gx = Math.abs(d) > reach - 6 ? clampX(e.x - out.face * (reach - 10)) : null; out.atk = Math.abs(d) < reach + 4; out.why = 'strike him'; return out; }
  /* ---- 0. A PROP COMING DOWN ON YOU (its shadow under you): step off it, a human beat late ---- */
  for (const d of show.drops || []) { if (Math.abs(d.fy - P.y) > 10 || Math.abs(d.x - P.x) > d.half + 10) continue;
    const k = 'drop|' + d.id; if (!seenFor(k) || roll(k + '|d', PLAN.missDodge) || d.t > 0.6) continue;
    out.gx = clampX(d.x + (P.x < d.x ? -1 : 1) * (d.half + 20)); out.why = 'off the shadow'; return out; }
  /* ---- 0b. THE SNARE LINE: low, jump it; high, duck it (on the boards) ---- */
  const sn = show.snare;
  if (sn && sn.ph === 'sweep' && onFloor && Math.sign(P.x - sn.x) === sn.dir && seenFor('snare|' + sn.id) && !roll('snare|' + sn.id + '|d', PLAN.missDodge)) {
    const gapX = Math.abs(P.x - sn.x);
    if (sn.kind === 'low' && gapX < 30 && gapX > 8) { out.jump = true; out.why = 'jump the snare'; return out; }
    if (sn.kind === 'high' && gapX < 44) { out.down = true; out.why = 'duck the snare'; return out; } }
  /* ---- 0c. THE SEA's wave: jump it ---- */
  const W = show.wave;
  if (W && W.ph === 'roll' && onFloor && Math.sign(P.x - W.x) === W.dir && seenFor('wave|' + W.id) && !roll('wave|' + W.id + '|d', PLAN.missDodge)) { const gapX = Math.abs(P.x - W.x);
    if (gapX < 34 && gapX > 10) { out.jump = true; out.why = 'jump the wave'; return out; } }
  /* ---- 0d. THE INFERNO: out of a glowing or burning trap ---- */
  const T = show.trap, inTrap = x => (key === 'inferno' && T && (T.ph === 'tell' || T.ph === 'burn')) ? TRAPS.findIndex((tr, i) => trapSet(i) === T.set && (() => { const [x0, x1] = trapPx(A, i); return x > x0 - 6 && x < x1 + 6; })()) : -1;
  if (onFloor && inTrap(P.x) >= 0 && seenFor('trap|' + show.n.flame + '|' + T.ph) && !roll('trap|' + show.n.flame + '|d', PLAN.missDodge)) { const [x0, x1] = trapPx(A, inTrap(P.x));
    out.gx = clampX(P.x - x0 < x1 - P.x ? x0 - 12 : x1 + 12); out.why = 'off the trap'; return out; }
  /* ---- 0e. THE STORM: brace through a gust (hold down), unless striking a green puppet ---- */
  const G = show.gust, bracing = G && (G.ph === 'on' || (G.ph === 'tell' && G.t < 0.3)) && P.ground && !roll('gust|' + show.gustN + '|d', PLAN.missBrace);
  /* ---- 2. A BLOW COMING at you: answer it (a misread is a miss) ---- */
  const threats = pups.filter(p => { const k = tellOf(p.mode) || p.mode; return BLOWS.includes(k) && (/Tell$/.test(p.mode) || BLOWS.includes(p.mode)) && sees(p); })
    .sort((a, b) => (/Tell$/.test(a.mode) ? a.modeT : 0) - (/Tell$/.test(b.mode) ? b.modeT : 0));
  for (const p of threats) { const k = tellOf(p.mode) || p.mode, tell = /Tell$/.test(p.mode); if (!dodges(p)) continue;
    const r = k === 'slam' ? PUP.brute.slamReach : k === 'chop' ? PUP.brute.chopReach : k === 'grab' ? PUP.brute.grabReach : k === 'jab' ? PUP.harl.jabReach : k === 'kick' ? PUP.harl.kickReach : k === 'swat' ? PUP.master.swatReach : 60;
    if (k === 'stomp' && Math.abs(p.stompX - P.x) < PUP.master.stompHalf + 14) { out.gx = clampX(p.stompX + (P.x < p.stompX ? -50 : 50)); out.atk = false; out.why = 'the stomp'; return out; }
    if (k === 'reach' && Math.abs((p.reachY || A.gallery) - P.y) < 6 && (!tell || p.modeT < 0.35)) { out.down = true; out.atk = false; out.why = 'duck the reach'; return out; }
    if (!near(p, r + 16)) continue;
    if ((k === 'slam' || k === 'kick') && (!tell || p.modeT < 0.18) && P.ground) { out.jump = true; out.why = 'jump the ' + k; return out; }
    if ((k === 'jab' || k === 'swat') && s.shield && (!tell || p.modeT < (k === 'jab' ? 0.2 : 0.35))) { out.block = true; out.atk = false; out.face = Math.sign(p.x - P.x) || 1; out.why = 'block the ' + k; return out; }
    if (tell && p.modeT < (k === 'jab' ? 0.25 : 0.45) && k !== 'slam' && k !== 'kick') { out.gx = clampX(p.x + (P.x < p.x ? -1 : 1) * (r + 22)); out.atk = false; out.why = 'back off the ' + k; return out; } }
  /* ---- 3. THE LEVER IS FREE: up the batten ---- */
  if (slackNow(e, show) && seenFor('slack|' + show.n.slack)) { if (onGal) { out.gx = clampX(e.x - (reach - 10)); out.face = 1; out.why = 'to him'; return out; } return climb(out, P, show.batten, s); }
  if (s.onBatten && !onGal && show.batten && show.batten.st !== 'down') { out.drop = true; out.why = 'off the batten'; return out; }
  if (onGal) { out.drop = true; out.why = 'back down'; return out; }
  if (bracing) { out.down = true; out.why = 'brace'; return out; }
  /* ---- 4. OFFENCE: a puppet glowing green (spent, or staggered) and lit - its body, or a string (decided once a window) ---- */
  const brute = pups.find(p => p.t === 'marionette' || p.t === 'masterpiece'), harl = pups.find(p => p.t === 'harlequin');
  const green = pups.filter(p => hurtable(p) && sees(p)).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
  const blade = P.y - 9, stringAt = tgt => stringsOf(e, show).filter(q => q.p === tgt).map(q => { const k2 = q.y1 === q.y0 ? 1 : Math.max(0, Math.min(1, (blade - q.y0) / (q.y1 - q.y0))); return { x: q.x0 + (q.x1 - q.x0) * k2, y: q.y0 + (q.y1 - q.y0) * k2 }; }).filter(o => Math.abs(o.y - blade) < 7);
  const safeX = x => { const i = inTrap(x); if (i < 0) return x; const [x0, x1] = trapPx(A, i); return x - x0 < x1 - x ? x0 - 12 : x1 + 12; };
  if (green) { const wantString = roll(keyOf(green) + '|s', PLAN.goString), strs = stringAt(green);
    const aim = wantString && strs.length ? strs.sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0].x : green.x;
    if (P.ground && P.y < A.floor - 20 && P.y > A.gallery + 20 && (green.floorY ?? green.y) > P.y + 20 && Math.abs(green.x - P.x) < 120) { out.drop = true; out.why = 'down off the flat'; return out; }
    const d = aim - P.x, side = Math.sign(d) || 1, stand = (green === brute && !wantString ? (green.w || 18) / 2 + reach - 8 : reach - 10);
    out.face = side; if (Math.abs(d) > stand + 2) out.gx = clampX(safeX(aim - side * stand));
    out.atk = Math.abs(d) < stand + 8 && Math.abs((green.floorY ?? green.y) - P.y) < 30; out.why = (wantString ? 'cut the ' : 'hit the ') + NAME[green.t]; return out; }
  /* ---- 5. NOTHING GREEN: draw a blow and wait it out just inside his reach (a gold cut of a winding string, now and then); at night, in a spotlight ---- */
  const tgt = harl && near(harl, 60) ? harl : brute || harl;
  if (!tgt) return out;
  if (/Tell$/.test(tgt.mode) && sees(tgt) && !tgt.dark && roll(keyOf(tgt) + '|g', PLAN.goGold)) { const strs = stringAt(tgt);
    if (strs.length) { const x = strs.sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0].x, d = x - P.x; out.face = Math.sign(d) || 1;
      if (Math.abs(d) > reach - 10) out.gx = clampX(x - out.face * (reach - 12)); out.atk = Math.abs(d) < reach - 2; out.why = 'gold cut'; return out; } }
  if (tgt === brute && /Tell$/.test(brute.mode) && dodges(brute)) { const r = PUP.brute.slamReach + 20; out.gx = clampX(safeX(brute.x + (P.x < brute.x ? -1 : 1) * r)); out.face = Math.sign(brute.x - P.x) || 1; out.why = 'wait out the windup'; return out; }
  if (P.ground && P.y < A.floor - 20 && P.y > A.gallery + 20 && (tgt.floorY ?? tgt.y) > P.y + 20 && Math.abs(tgt.x - P.x) < 120) { out.drop = true; out.why = 'down off the flat'; return out; }
  if (key === 'night' && show.spots && !lit(show, P.x)) { const sp = show.spots.slice().sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0]; out.gx = clampX(sp.x); out.face = Math.sign(tgt.x - P.x) || 1; out.why = 'into the light'; return out; }
  const d = tgt.x - P.x, side = Math.sign(d) || 1, bait = tgt === brute ? PUP.brute.chopReach - 6 : PUP.harl.jabReach;
  out.face = side; if (Math.abs(Math.abs(d) - bait) > 6) out.gx = clampX(safeX(tgt.x - side * bait)); out.why = 'draw the ' + NAME[tgt.t];
  /* THE HARLEQUIN PUNISHES STANDING STILL: shuffle */
  if (!out.gx && harl && near(harl, 50)) out.gx = clampX(P.x + (P.x < harl.x ? -14 : 14));
  return out;
}

/* the bot's way up: to the batten, strike the lever from it, ride it up, step off onto the gallery */
function climb(out, P, bat, s) {
  if (!bat) return out;
  const onBat = s.onBatten, mid = bat.x + bat.w / 2, edge = bat.x + bat.w - 7;   /* (on the batten's lever end, so the shortest blade reaches the lever) */
  if (bat.st === 'down' && !onBat) { out.gx = edge; out.face = 1; out.why = 'to the batten'; return out; }
  if (bat.st === 'down' && onBat) { out.gx = Math.abs(P.x - edge) > 3 ? edge : null; out.face = 1; out.atk = !(bat.t > 0) && Math.abs(P.x - edge) < 6; out.why = 'strike the lever'; return out; }
  if (onBat && bat.st !== 'down') { out.gx = null; out.why = 'ride'; if (bat.st === 'up') { out.gx = bat.x + bat.w + 24; out.why = 'step off'; } return out; }
  out.gx = mid + 40; out.why = 'wait for the batten'; return out;
}

/* ---------- THE FRAME each body shows ---------- */
export function pupFrame(e) {
  const a = e.anim || 0, m = e.mode || '';
  if (e.t === 'puppeteer') {
    if (m === 'knockTell') return PUP_F.tell;
    if (m === 'knock') return PUP_F.whip;
    if (m === 'staggered') return Math.floor(a * 4) % 2 ? PUP_F.hurt : PUP_F.restring[0];   /* reeling on the gallery, his bar slack in his lap */
    if (m === 'slack') return PUP_F.climb;          /* stumbling along the gallery */
    if (e.cast) return e.cast === 'dropTell' ? PUP_F.tell : PUP_F.snareTell;
    if (m === 'hang1') return PUP_F.ride;
    if (e.flash > 0.05) return PUP_F.hurt;
    return PUP_F.work[Math.floor(a * 3) % 2];
  }
  if (e.t === 'masterpiece') {
    if (m === 'heap' || m === 'collapse') return MP_F.heap;
    if (m === 'swatTell') return MP_F.swatTell; if (m === 'swat') return MP_F.swat;
    if (m === 'stompTell') return MP_F.stompTell; if (m === 'stomp') return MP_F.stomp;
    if (m === 'reachTell') return MP_F.reachTell; if (m === 'reach') return MP_F.reach;
    if (m === 'stagger' || m === 'recover') return MP_F.stagger;
    if (Math.abs(e.vx || 0) > 2) return MP_F.walk[Math.floor(a * 4) % 2];
    return MP_F.hang;
  }
  if (m === 'heap') return MAR_F.heap;
  if (m === 'fall' || m === 'fly') return MAR_F.drop;
  if (m === 'slamTell') return MAR_F.highTell; if (m === 'slam') return MAR_F.drop;
  if (m === 'kickTell') return MAR_F.highTell; if (m === 'kick') return MAR_F.high;
  if (m === 'grabTell') return MAR_F.highTell; if (m === 'grab') return MAR_F.high;
  if (m.endsWith('Tell')) return MAR_F.tell;
  if (BLOWS.includes(m)) return MAR_F.blow;
  if (m === 'stagger' || m === 'recover') return MAR_F.stagger;
  if (m === 'rise') return MAR_F.rise;
  if (e.str && e.str.some(s => s.cut)) return MAR_F.stagger;   /* a limb hangs limp */
  if (Math.abs(e.vx || 0) > 2) return MAR_F.hop[Math.floor(a * 5) % 2];
  return MAR_F.hang;
}
