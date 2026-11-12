// src/highlines-hands.js - THE HIGH LINES' HANDS (claude/highlines1, the OPUS GREYBOX, 11-05): main.js owns the world; this module owns THE LINE KIT on the level
// (src/line-kit.js - docs/linekit.md's wiring sketch, done) and THE HOOKJACK (src/hookjack.js) inside main.js's own foe list. Every hook is opt-in: on() is false on
// every level without L.highlines, so no other level runs a line of it.
//   load()            a level load: the kit from L.lineKit (its own lines, never L.zipLines), the moving floors (the gondola cab, the counterweight pair) as movers
//   reset()           a respawn / party wipe: lineRespawn - lines strung, the cab and the weights home, the winds calm >= LK.GRACE and told (spawnEntities calls it)
//   world(dt)         once a frame BEFORE the movers: kitStep with SHADOW seats (the kit counts who stands where; main.js's movers carry the real ones), its events -> sound
//   seat(dt)          per seat inside updatePlayer (P is that seat): riderStep (UP takes a line, JUMP kicks off, DOWN drops, ATTACK while hanging = a crank stroke,
//                     points on UP), a blow from the ground works a hopper/post, the air carries a jump in a gust; the first hold of each kind is told once
//   held(P)           true while the kit places the seat on a line: main.js skips moveBody for him that frame (the kit already put him there)
//   mover(m)          a mover tagged m.lk follows the kit's moving floor of that id (main.js's own rider-carry does the rest)
//   owns(e) / spawn(e) / hookUpdate(e, dt) / hookTake(e, dmg, fromX)   THE HOOKJACK as a main.js foe (any blow, any shot: hurtEnemy routes it here)
//   (claude/linekit) letGoFirst() / moveSkill(k)   a movement skill or an ultimate lets go of the line first (0.6 s skip), then runs as on the ground
//   climbCam()        L.climbCam: { foot, lead } while ANY seat hangs on a winch (main.js eases it), else null     allyLine(p, lead, keys, press, t)  the AI partner's hand on a line (no new brain)
//   shoveRider(P, vx) a gale harpy's beat on a rider swings him on his line (it does not tear him off)
//   drawWorld / drawRider / drawHook   the greybox pictures (art owed: docs/linekit.md, zipclimb-plan.md 6)
import * as LKT from './line-kit.js';
import * as HLA from './redraw/high_lines_art.js'; import { drawHookjack } from './redraw/line_crew_art.js';   /* (claude/hlart) the hand-drawn line machinery, grip and Hookjack */
import { promptsOf, promptWords } from './line-prompts.js';   /* (claude/hlfix) the in-world key prompts at every grab point, points board, winch grip and strike-post */
import { HK, HK_SAY, newHook, hookStep, hookTake as hkTake, drawHook as hkDraw } from './hookjack.js';

/* (claude/hlswitch) the switch rule's words (said instead of the stroke rule's while the kit's rule is 'switch'; each is told once) */
export const HLX_SAY_SW = { take: 'ONE BLOW: THE LINE CARRIES YOU UP.', hold: 'STRIKE ONCE TO LAUNCH. PICK YOUR GUST.', points: 'THE POINTS TAKE YOU ON', throw: 'THE LEVER THROWS: THE LAMP FLIPS' };
export const HLX_SAY = { take: 'STRIKE TO HAUL. THE RATCHET HOLDS YOU.', glide: 'JUMP KICKS OFF. DOWN DROPS. HOLD BACK TO BRAKE.', points: 'THE POINTS: YOU TOOK THE BRANCH', parted: 'THE LINE PARTS', creak: 'THE LINE CREAKS', gust: 'THE GUST IS COMING' };
/* movement skills (a lunge, a dash, a vault, a leap, a rising cut) - pressing one on a line lets go FIRST */
export const MOVE_SKILLS = new Set(['lunge', 'cinderStep', 'holyCharge', 'hammerLeap', 'harrier', 'boarding', 'rgLeap', 'risingCut']);
const MV_FLAGS = ['plunge', 'lungeT', 'chargeT', 'hleapT', 'riseT', 'pounceT', 'pounceRec', 'dodge', 'dashRec'];
const mvMask = P => { let m = 0; for (let i = 0; i < MV_FLAGS.length; i++) if (P[MV_FLAGS[i]] > 0 || P[MV_FLAGS[i]] === true) m |= 1 << i; return m; };
export function makeHighLinesHands(c) {
  let kit = null, lastSwipe = -9, prompts = []; const told = new Set(), used = new Set();   /* prompts: src/line-prompts.js; used: the ones the player has already done once (gone for the rest of the level) */
  const postKey = p => 'post:' + p.kind + ':' + Math.round(p.x) + ',' + Math.round(p.y);
  const on = () => !!(c.L && c.L.highlines && kit);
  const sfx = k => { const S = c.sfx; const f = S && S[k]; if (f) f(); };
  const say = (t, x, y) => { if (told.has(t)) return; told.add(t); c.callout(t, x, y); };
  function lineSfx(e) {
    if (e.t === 'take') used.add('grab:' + e.id); else if (e.t === 'stroke' || e.t === 'latch') used.add('hit:' + e.id); else if (e.t === 'points') used.add('points:' + e.from);   /* the prompt for it has done its job */
    if (e.t === 'throw') { const lp = kit && kit.posts.find(q => q.kind === 'lever' && q.sw === e.id); if (lp) { used.add(postKey(lp)); lp.swing = 1; if (!e.spring) say(HLX_SAY_SW.throw, lp.x, lp.y - 20); } }   /* (hlswitch) a lever thrown: its own prompt is done, the plate swings, told once */
    switch (e.t) {
      case 'take': sfx('ratchet'); break; case 'stroke': sfx('ratchet'); break; case 'latch': sfx('ratchet'); break; case 'throw': sfx('clank'); break;   /* (hlswitch) latch = the one blow that starts a line; throw = a lever */ case 'top': case 'end': sfx('pStep'); break;
      case 'kick': sfx('pJump'); break; case 'points': sfx('clank'); break; case 'creak': sfx('ratchet'); say(HLX_SAY.creak); break;
      case 'snap': case 'parted': sfx('crack'); if (e.t === 'parted') say(HLX_SAY.parted); break; case 'restrung': sfx('ratchet'); break;
      case 'gustTell': sfx('gustRise'); break; case 'cabBoard': case 'cabGo': case 'cabDock': sfx('clank'); break; case 'cabCatch': sfx('crack'); c.shake && c.shake(4); break;
      case 'cwStart': case 'stonesOut': sfx('thud'); break; case 'strike': sfx('clank'); break;
    }
  }
  function load() {
    kit = c.L && c.L.highlines && c.L.lineKit ? LKT.lineInit(c.L) : null; told.clear(); used.clear(); prompts = kit ? promptsOf(kit).filter(p => !(kit.rule === 'switch' && p.kind === 'points')) : [];   /* (hlswitch) no 'hold UP at the board' prompt under the switch rule: a lever sets the points */ lastSwipe = -9; for (const p of c.players()) if (p) { p.lk = null; p.lkHeld = false; p.lkSkip = null; }   /* nobody carries a grip into a level (or out of this one) */
  }
  function reset() { if (!on()) return; LKT.lineRespawn(kit, c.players()); lastSwipe = -9; }
  /* a shadow of each seat for the kit's load counts (cab boarding, which side of the weight is heavier) - the kit's own carry moves the shadows, never the seats */
  const shadow = p => ({ x: p.x, y: p.y, vy: p.vy || 0, lk: p.lk || null, dead: !!p.dead });
  function world(dt) {
    if (!on()) return;
    for (const e of LKT.kitStep(kit, c.players().map(shadow), dt)) lineSfx(e);
  }
  function mover(m) {
    if (!on()) return false; const p = LKT.platforms(kit).find(q => q.id === m.lk); if (!p) return false;
    const ox = m.x, oy = m.y; m.x = p.x0; m.y = p.top; m.w = p.x1 - p.x0; m.dx = m.x - ox; m.dy = m.y - oy; m.broken = !!(p.cab && p.cab.st === 'gone'); return true;
  }
  /* ONE SEAT, ONE FRAME (P is the seat: main.js calls this inside asPlayer) */
  function seat(dt) {
    if (!on()) return; const P = c.P(), k = c.keys(), pr = c.presses();
    if (P.dead || P.down > 0) { if (P.lk) { P.lk = null; P.lkHeld = false; } return; }
    const strike = !!pr.atk;   /* KIT Q1 (rec, accepted): ANY blow while hanging is a crank stroke - one button, every hero (the ranged ones too) */
    const hb = strike ? (P.face > 0 ? { l: P.x, r: P.x + 26, t: P.y - 22, b: P.y - 2 } : { l: P.x - 26, r: P.x, t: P.y - 22, b: P.y - 2 }) : null;
    if (hb && !P.lk) { const post = LKT.kitStrike(kit, hb, 'foot'); if (post) { used.add(postKey(post)); lineSfx({ t: 'strike' }); if (post.kind === 'hopper') say('THE STONE DROPS: THE CAGE GOES UP', post.x, post.y); } }
    /* a jump pressed on an UP key (ArrowUp / W, main.js jumpUpKey) is the take and the points, never the kick: the kick is Z / Space / the pad's A */
    const was = P.lk ? P.lk.id : null;
    /* LET GO FIRST: a movement flag that rose AFTER he took hold (a skill, a dash, a leap, a plunge) is not a hang - the grip goes (0.6 s skip) and the move runs as on the ground */
    if (P.lk) { const m = mvMask(P); if (m & ~(P.lkMv || 0)) { lineSfx(LKT.releaseRider(kit, P) || {}); P.lkHeld = false; return; } P.lkMv = m; } else P.lkMv = mvMask(P);
    /* THE TUCK: the dodge button on a line is i-frames, never a roll (main.js clears its dodge buffer for a held seat) - it costs the dodge's stamina once per cooldown */
    const tuck = !!(P.lk && pr.dodge && !(P.lkTuckCd > 0) && (!c.spend || c.spend()));
    const ev = LKT.riderStep(kit, P, { up: !!k.up, down: !!k.down, left: !!k.left, right: !!k.right, dodgePress: tuck, upPress: !!pr.up, jumpPress: !!pr.jump && !(c.jumpUp && c.jumpUp()), strike, hb }, dt);
    for (const e of ev) { lineSfx(e);
      if (e.t === 'drop') { P.abuf = 0; P.abufDown = false; P.plunge = false; }   /* a DOWN never does anything else: it drops - no plunge rides the same press */
      if (e.t === 'tuck') sfx('pStep');
      if (e.t === 'take') { const z = kit.lines[e.id], S = kit.rule === 'switch'; say(z.kind === 'winch' ? (S ? HLX_SAY_SW.take : HLX_SAY.take) : S && z.hold ? HLX_SAY_SW.hold : HLX_SAY.glide); }
      if (e.t === 'points') say(kit.rule === 'switch' ? HLX_SAY_SW.points : HLX_SAY.points); }
    if (P.lk) { c.eatJump(); P.climb = false; P.onMover = null; }   /* hanging: the jump was the kick, and nothing else stands him anywhere */
    else if (was && !P.lk) P.lkHeld = false;
    if (!P.lk) LKT.windPush(kit, P, dt);
  }
  const held = P => !!(on() && P && P.lk && P.lkHeld);
  /* a movement skill / an ultimate: let go first (called from main.js's skillPress and the ultimate's fire) */
  function letGoFirst() { if (!on()) return false; const P = c.P(); if (!P || !P.lk) return false; const e = LKT.releaseRider(kit, P); if (e) { P.lkHeld = false; lineSfx(e); } return !!e; }
  const moveSkill = k => MOVE_SKILLS.has(k) && letGoFirst();
  /* L.climbCam: the look main.js eases toward while any seat hangs on a winch */
  const climbCam = () => (on() && c.L.climbCam ? LKT.climbLook(kit, c.players()) : null);
  /* THE AI PARTNER (no new brain): it takes a line the leader is holding when one is in reach (UP), cranks a winch every 0.3 s, and otherwise rides the leash. true = this frame is the line's */
  function allyLine(p, lead, keys, press, t) {
    if (!on() || !p) return false;
    if (p.lk && kit.rule === 'switch') { const z = kit.lines[p.lk.id]; if (z && (z.kind === 'winch' || z.hold) && !p.lk.latch && t - (p.aiCrank || -9) >= 0.3) { p.aiCrank = t; press('atk'); } return true; }   /* (hlswitch) ONE BLOW starts the line: it presses attack once after taking hold (until latched); it never throws a lever */
    if (p.lk) { const z = kit.lines[p.lk.id]; if (z && z.kind === 'winch' && z.d.drive !== 'post' && t - (p.aiCrank || -9) >= LKT.LK.STROKE_T) { p.aiCrank = t; press('atk'); } return true; }
    if (lead && lead.lk && !p.dead && !(p.down > 0)) { const z = LKT.findLine(kit, p, true, false); if (z) { keys.up = true; return true; } }
    return false;
  }
  /* ---------- THE HOOKJACK ---------- */
  const owns = e => !!e && e.t === 'hookjack';
  /* ---------- THE LEVERS (hlswitch): props in main.js's foe list - any blow, any shot throws one (kitThrow); never harmed, never a kill; foes never reach them ---------- */
  const ownsLever = e => !!e && e.t === 'hllever';
  const leverSpawn = e => ({ t: 'hllever', sw: e.sw, from: e.from || 'foot', w: 12, h: 22, hp: 9999, maxHp: 9999, noGrav: true, alive: true, face: 1, mode: 'idle', modeT: 0, prop: true, markH: 26, xpKey: undefined, swing: 0, cool: 0 });
  function leverTick(e, dt) { e.cool = Math.max(0, (e.cool || 0) - dt); e.hp = e.maxHp; }
  /* A LEVER STRUCK (main.js hurtEnemy0 hands every blow and shot on an 'hllever' here): the same throw a foot blow / a line swing does through kitStrike; the 0.4 s cooldown in kitThrow stops a blow that reaches both */
  function lever(e, fromX) { if (!e || !on()) return; e.hp = e.maxHp; if (e.cool > 0) return; const ev = LKT.kitThrow(kit, e.sw); if (!ev) return; e.cool = 0.25; e.swing = 0.35; lineSfx(ev); }
  function spawn(e) { const o = newHook({ line: e.line || null, role: e.role, dir: e.dir || -1 }); if (kit && e.line && kit.lines[e.line] && e.role !== 'cutter') { const z = kit.lines[e.line]; o.lx = Math.max(z.xa + 8, Math.min(z.xb - 8, e.x * c.TS + 8)); } return o; }
  function hkWorld() {
    return { kit, LK: LKT, heroes: () => c.players().filter(p => !p.dead && !(p.down > 0)), time: () => c.time(), lastSwipe: () => lastSwipe, swiped: t => { lastSwipe = t; },
      hurt: (h, dmg, fromX) => c.asPlayer(h, () => { const hp0 = h.hp, r = c.damage(fromX, dmg, { name: 'THE HOOKJACK' }); return r === 'blocked' ? (h.parryT > 0.2 ? 'parried' : 'blocked') : h.hp < hp0 || h.hurt > 0 ? 'hit' : 'miss'; }),
      landingUnder: (x, y0, y1) => { const tx = Math.floor(x / c.TS); for (let ty = Math.floor(y0 / c.TS); ty <= Math.floor(y1 / c.TS); ty++) { if (ty * c.TS < y0 - 0.5) continue; const t = c.tileAt(tx, ty); if (t === c.T.SOLID || t === c.T.ONEWAY) return ty * c.TS; } return null; },
      pitY: (c.L.h + 2) * c.TS, say: (x, y, t, col) => c.callout(t, x, y, col), sound: k => sfx(k === 'tell' ? 'tell' : k === 'swipe' ? 'throwWhoosh' : k === 'clank' || k === 'parried' ? 'clank' : k === 'saw' ? 'ratchet' : k === 'cut' ? 'crack' : k === 'fell' ? 'thud' : 'pStep'),
      mark: (e, m) => c.number(e.x, e.y - 28, m, m === '!!' ? '#ff6b6b' : '#ffd36b') };
  }
  function hookUpdate(e, dt) {
    if (!on()) return; hookStep(e, dt, hkWorld());
    if (e.gone) { e.alive = false; }
  }
  const hookTake = (e, dmg, fromX, tag) => hkTake(e, dmg, fromX, hkWorld(), tag);   /* (claude/linekit) the blow's tag rides along (blow-tags): the Hookjack's guard reads the blow, not a boss key */
  function shoveRider(P, vx) { if (!on() || !P.lk) return false; P.lk.swayV += vx * 0.5; return true; }
  /* ---------- DRAWING (greybox) ---------- */
  function drawWorld(g, cx, cy, VW, VH, time) {
    if (!on()) return;
    HLA.drawLines(g, kit, cx, cy, VW, VH, time, c.players().filter(p => p && p.lk).map(p => ({ id: p.lk.id, x: p.lk.x, haul: p.lk.haul, buf: p.lk.buf, sway: p.lk.sway })));   /* (claude/hlart) winches, ropes, anchors, points boards, posts, hopper, cab, weights, gusts (the cargo nets are tiles now) */
    drawPrompts(g, cx, cy, VW, VH, time);   /* (claude/hlfix) over the ropes */
  }
  /* THE LINE PROMPTS: a grab / points prompt shows while a hero stands near it and not yet used; a hit prompt shows over the rider while he hangs on a grip-winch and has not cranked it once; a post prompt near an unstruck post */
  function drawPrompts(g, cx, cy, VW, VH, time) {
    if (!on() || !prompts.length || !c.text) return; const lab = c.promptLabels ? c.promptLabels() : { kind: 'kb' }, heroes = c.players().filter(p => p && !p.dead && !(p.down > 0));
    for (const p of prompts) { if (used.has(p.key)) continue; let X = p.x, Y = p.y;
      if (p.kind === 'hit') { const h = heroes.find(q => q.lk && q.lk.id === p.line); if (!h) continue; X = h.lk.x + (h.lk.sway || 0); Y = h.y - 12; }
      else if (!heroes.some(q => !q.lk && Math.abs(q.x - p.x) < 150 && Math.abs(q.y - p.y) < 110)) continue;
      if (X - cx < -40 || X - cx > VW + 40 || Y - cy < -10 || Y - cy > VH + 60) continue;
      HLA.drawPrompt(g, p, X - cx, Y - cy, time, promptWords(p, lab), c.text); }
  }
  function drawRider(g, P, cx, cy) { if (on() && P && P.lk) HLA.drawGrip(g, kit, P.lk, cx, cy, c.time()); }
  function drawHook(g, e, cx, cy, time) { if (e.alive) drawHookjack(g, e, cx, cy, time); }
  return { on, load, reset, world, seat, held, letGoFirst, moveSkill, climbCam, allyLine, mover, owns, ownsLever, leverSpawn, leverTick, lever, spawn, hookUpdate, hookTake, shoveRider, drawWorld, drawRider, drawHook, kit: () => kit, HK, HK_SAY };
}
