// src/demon-king-hands.js - THE DEMON KING, WIRED (lane S2 DEMONKING, claude/demonking, 11-04). src/demon-king.js is the fight (pure); this binds it
// to main.js on a skyMount level (the hidden lab 'skylab' now; the Heart of the Mountain's sky fight when lane SC wires the scene).
// HOW A BOLT IS RETURNED, FOR EVERY HERO WITH NO PER-KIT CODE (src/reflect-kit.js):
//   every hellbolt in flight is a tiny entity in main.js's `enemies` (t 'hellbolt'), so ANY blow box and ANY hero projectile that can hit a foe hits
//   it; hurtEnemy0 hands the blow to struck() before anything else (no damage, no number) and the bolt turns for home. The bolt REACHING a hero
//   goes through damagePlayer: that hero's own guard branches decide (blocked / hit / nothing) and, ON THE BEAT, call src/riposte.js RP.parried,
//   which stamps P.rpLookAt - a changed stamp = a POWER return.
// HIM: one entity t 'demonking' in `enemies` (so blows land through the normal pipeline); hurtEnemy0's last word before `e.hp -= dmg` is take()
//   (B15 x0.4 / x1.5 downed + the phase line, never 0). His returned bolts land through hurtAs('reflect') - whole (a ROOM tag: never chipped).
// GREYBOX pictures (art before live: lane S4 SKYART paints him, the bolts, the imps' reskin). main.js hooks: see tools/demon-king.mjs (the list).
import * as DKM from './demon-king.js';
import * as RK from './reflect-kit.js';
import { surfaceY } from './sky-mount.js';
import * as KA from './redraw/demon_king_art.js';   /* (claude/skyart) his sprites, bolts, glyph, bomb, bar, pips; the greybox below is the fallback if one throws */
const { DK } = DKM;
const R = Math.round;
let artBad = false;
export const WON_AFTER = 2.6;   /* (claude/scenes) seconds from his 'beaten' to the hand-off to scene B */
/* his sounds -> main.js SFX names that exist (the art lane S4 adds his own: SOUND list in the lane report) */
const SND = { dkHum: ['dkHum', 'mageBolt', 'charge'], dkThrow: ['dkThrow', 'throwWhoosh'], dkHumDim: ['dkHumDim', 'charge'], dkFizzle: ['dkFizzle', 'fizzle', 'pStep'], dkHumTwo: ['dkHumTwo', 'mageBolt', 'charge'],
  dkShriek: ['dkShriek', 'queenShriek', 'roar'], dkSwoop: ['dkSwoop', 'throwWhoosh'], dkChain: ['dkChain', 'clank'], dkCrack: ['dkCrack', 'crack'], dkChant: ['dkChant', 'callerChant', 'charge'],
  impShriek: ['impShriek', 'queenShriek'], dkGather: ['dkGather', 'charge'], dkBlast: ['dkBlast', 'stone', 'thud'], dkClaw: ['dkClaw', 'tell'], dkBat: ['dkBat', 'pSlash'],
  dkPowerChime: ['dkPowerChime', 'aegis', 'sting'], dkReturnCrack: ['dkReturnCrack', 'crack'], dkPowerHit: ['dkPowerHit', 'sting', 'crack'], dkReturnHit: ['dkReturnHit', 'crack'],
  dkTumble: ['dkTumble', 'roar'], dkCrash: ['dkCrash', 'stone', 'thud'], dkScream: ['dkScream', 'queenShriek', 'roar'], dkBomb: ['dkBomb', 'stone', 'thud'], dkEruption: ['dkEruption', 'boreRoar', 'roar'] };
const C = { skin: '#2a2230', skinL: '#463a4a', vein: '#ff7a2a', smoke: 'rgba(40,30,44,0.75)', horn: '#d8ccb8', eye: '#ffd36b', bolt: '#3a0a14', boltRim: '#c0283a', core: '#ffffff',
  gold: '#ffd36b', ret: '#f2e2a0', pow: '#fffbe8', red: '#ff4a3a', glyph: '#c04a7a', ward: '#d8e2ee' };

export function makeDemonKingHands(ctx) {
  // ctx: { L(), players(), P(), enemies(), asPlayer(p, fn), damage(fromX, dmg, o) -> 'hit'|'blocked'|false, rpStamp() -> P.rpLookAt, heroId(), swordDmg(),
  //        hurtAs(tag, e, dmg, fromX), spawnImp(x, y) -> entity, number(x, y, t, col), sfx: SFX, shake(n), ring(x, y, r, col), burst(x, y, n, cols), scale(), skh(), bk() }
  let f = null, king = null; const ents = new Map();
  const lvl = () => { const L = ctx.L(); return L && L.skyMount && !L.skyMount.noKing ? L : null; };
  const back = () => { const S = ctx.skh && ctx.skh(); return S ? S.back() : null; };
  const on = () => !!(f && lvl());
  const owns = e => !!e && (e.t === 'demonking' || e.t === 'hellbolt');
  const sound = id => { for (const k of SND[id] || [id]) { const fn = ctx.sfx && ctx.sfx[k]; if (typeof fn === 'function') { try { fn(); } catch {} return; } } };
  const heroes = () => (ctx.players() || []).filter(Boolean);
  function clear() {
    const es = ctx.enemies(); for (let i = es.length - 1; i >= 0; i--) { const e = es[i]; if (owns(e)) es.splice(i, 1); else if (e.dkImp) e.alive = false; }
    ents.clear(); f = null; king = null;
  }
  function spawn(b) {
    f = DKM.newFight(b, { scale: ctx.scale ? ctx.scale() : 1 });
    king = { t: 'demonking', x: f.x, y: f.y, w: DK.w, h: DK.h, hp: f.hp, maxHp: 3 * f.bar, alive: true, dying: 0, noGrav: true, face: -1, flash: 0, stagger: 0, anim: 0, vx: 0, vy: 0, mode: 'enter', modeT: 0, dk: true };
    ctx.enemies().push(king); labHooks();
  }
  function labHooks() {   /* the lab's handles: BK.demonKing.phase(2) / .pips(2) / .knock() / .off() - for a person at the console and the owed page checks */
    const BK = ctx.bk && ctx.bk(); if (!BK) return;
    BK.demonKing = { f: () => f, read: () => (f ? DKM.readOf(f) : null), DK,
      phase: n => { if (!f) return; f.hp = Math.min(f.hp, (DK.phases - n + 1) * f.bar); },   /* empty the bars down to phase n's start: the gate runs the fall + climb */
      pips: n => { if (f) f.pips = n; }, knock: () => { if (f) { f.pips = DK.knock.pips - 1; const q = f.bolts.find(b => b.st === 'in'); if (q) DKM.meet(f, q, 'normal'); } },
      off: () => { const L = ctx.L(); if (L && L.skyMount) L.skyMount.noKing = true; clear(); }, on: () => { const L = ctx.L(); if (L && L.skyMount) L.skyMount.noKing = false; } };
  }
  /* a blow / shot met a bolt entity (hurtEnemy0, before anything else) -> true = handled (no damage, no number) */
  function struck(e, dmg, tag) {
    if (!f || e.t !== 'hellbolt') return false;
    const b = f.bolts.find(q => q.id === e.dkBolt); if (!b || b.st !== 'in') return true;
    const how = RK.classify(ctx.heroId(), { via: tag === 'shot' ? 'shot' : 'blow', tag });
    if (how === 'normal' || how === 'power') { const i = Math.max(0, heroes().indexOf(ctx.P())); DKM.meet(f, b, how, i); ctx.burst(b.x, b.y, 8, [C.ret, C.gold]); }
    return true;
  }
  /* B15 + the phase line, last before e.hp -= dmg */
  function take(e, dmg, tag) { if (!f || e !== king) return dmg; const d = DKM.take(f, dmg, tag); if (tag !== DK.returnTag && d > 0 && dmg > d * 1.5 && !(f.saidChip > f.t)) { f.saidChip = f.t + 4; ctx.number(king.x, king.y - DK.h - 12, DKM.kingLow(f) ? 'CHIP - KNOCK HIM DOWN' : 'OUT OF REACH - STRIKE HIS BOLTS BACK', '#9aa39a'); } return d; }
  function hurtHero(i, fromX, dmg, name) {
    const p = heroes()[i]; if (!p || p.dead) return null; let out = null;
    ctx.asPlayer(p, () => { const st = ctx.rpStamp(); const r = ctx.damage(fromX, dmg, { who: king, name, blow: name }); out = { r, parried: ctx.rpStamp() !== st, hero: ctx.heroId() }; });
    return out;
  }
  function update(dt) {
    const L = lvl(), b = L && back();
    if (!L || !b) { if (f || king) clear(); return; }
    if (!f) spawn(b);
    const hs = heroes().map(p => ({ x: p.x, y: p.y, h: 14, duck: !!(p.ducking || p.lowSlide), down: p.mountDown || 0, dead: !!p.dead }));
    const imps = ctx.enemies().filter(e => e.dkImp && e.alive).length;
    const ev = DKM.stepKing(f, dt, { heroes: hs, imps });
    for (let k = 0; k < ev.length; k++) { const e = ev[k];
      if (e.k === 'boltAt') { const r = hurtHero(e.hero, e.bolt.x, DK.bolt.dmg, 'HELLBOLT'); if (!r) continue;
        const how = RK.classify(r.hero, { via: 'body', result: r.r, parried: r.parried }); DKM.resolveBody(f, e.bolt, how, e.hero);
        if (how === 'block') { ctx.number(e.bolt.x, e.bolt.y - 10, DKM.DK_SAY.block, C.ward); ctx.burst(e.bolt.x, e.bolt.y, 10, [C.boltRim, C.bolt]); } }
      else if (e.k === 'hit') hurtHero(e.hero, e.x, e.dmg, e.name);
      else if (e.k === 'returnHit') { const p = heroes()[e.hero] || ctx.P(); ctx.asPlayer(p, () => { ctx.hurtAs(DK.returnTag, king, Math.max(1, R(ctx.swordDmg() * e.mul)), e.x); });
        ctx.ring(king.x, king.y - DK.h / 2, e.power ? 26 : 18, e.power ? C.pow : C.ret); ctx.number(king.x, king.y - DK.h - 8, e.power ? 'POWER  +2' : '+1', e.power ? C.pow : C.gold); ctx.shake(e.power ? 4 : 2); }
      else if (e.k === 'spawnImp') { const m = ctx.spawnImp(e.x, e.y); if (m) { m.dkImp = true; m.dkSkin = 'demon'; m.cnSkin = 'demonimp'; ctx.burst(e.x, e.y - 6, 14, [C.glyph, C.red]); } }
      else if (e.k === 'clearImps') { for (const m of ctx.enemies()) if (m.dkImp && m.alive) { m.alive = false; ctx.burst(m.x, m.y - 6, 10, [C.smoke, C.red]); } }
      else if (e.k === 'say') ctx.number(f.x, f.y - DK.h - (e.big ? 26 : 16), e.text, e.big ? C.gold : '#e8d8c8');
      else if (e.k === 'sound') sound(e.id);
      else if (e.k === 'knockdown') ctx.shake(5);
      else if (e.k === 'crash') { ctx.shake(8); ctx.burst(f.x, f.y, 24, ['#3a2a26', C.vein, C.smoke]); ctx.ring(f.x, f.y - 8, 30, C.gold); }
      else if (e.k === 'beaten') { ctx.shake(10); const BK = ctx.bk && ctx.bk(); if (BK) BK.demonKingBeaten = (BK.demonKingBeaten || 0) + 1; }   /* lane SC: scene B starts here (after WON_AFTER s, below) */
    }
    /* (claude/scenes) HE IS KNOCKED DOWN FOR GOOD: his scream and the crash play out (WON_AFTER s), then main.js ends the fight - the clear is credited and SCENE B (the escape) begins. Once. */
    if (f.beaten && !f.wonCalled) { f.wonT = (f.wonT || 0) + dt; if (f.wonT >= WON_AFTER) { f.wonCalled = true; if (ctx.won) ctx.won(); } }
    /* sync the entities: him, and one per bolt coming AT the heroes (a return cannot be struck again) */
    const prone = f.mode === 'downed' || f.mode === 'repulseTell' || f.mode === 'beaten';
    king.x = f.x; king.y = f.y; king.w = prone ? DK.proneW : DK.w; king.h = prone ? DK.proneH : DK.h; king.hp = f.hp; king.maxHp = 3 * f.bar; king.mode = f.mode; king.face = f.face; king.alive = true; king.vx = king.vy = 0;
    if (!ctx.enemies().includes(king)) ctx.enemies().push(king);
    const live = new Set();
    for (const q of f.bolts) { if (q.st !== 'in') continue; live.add(q.id); let e = ents.get(q.id);
      if (!e) { e = { t: 'hellbolt', dkBolt: q.id, hp: 9999, alive: true, dying: 0, noGrav: true, face: 1, flash: 0, stagger: 0, anim: 0, vx: 0, vy: 0, w: 0, h: 0, x: 0, y: 0 }; ents.set(q.id, e); ctx.enemies().push(e); }
      e.w = e.h = q.r * 2 + 4; e.x = q.x; e.y = q.y + q.r + 2; e.vx = e.vy = 0; e.alive = true; }
    for (const [id, e] of ents) if (!live.has(id)) { e.alive = false; const es = ctx.enemies(), i = es.indexOf(e); if (i >= 0) es.splice(i, 1); ents.delete(id); }
  }

  /* ---- GREYBOX PICTURES ---- */
  function orb(g, x, y, r, rim, body, core, glow) { if (glow) { g.fillStyle = glow; g.beginPath(); g.arc(x, y, r + 3, 0, 7); g.fill(); } g.fillStyle = rim; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.fillStyle = body; g.beginPath(); g.arc(x, y, r - 2, 0, 7); g.fill(); if (core) { g.fillStyle = core; g.beginPath(); g.arc(x, y, Math.max(1, r * 0.35), 0, 7); g.fill(); } }
  function drawKing(g, cx, cy, time) {
    const p = DKM.poseOf(f), X = R(f.x - cx), Y = R(f.y - cy), fl = f.face, b = back();
    g.save(); g.translate(X, Y);
    let drawn = false;
    if (!artBad) { try { drawn = artKing(g, p, fl, time); } catch (e) { artBad = true; if (typeof console !== 'undefined') console.warn('demon king art failed, greybox', e); drawn = false; } }
    if (drawn) { /* painted: see artKing */ }
    else if (p.body === 'prone') {   /* on the drake's back, flat */
      g.fillStyle = C.skin; g.fillRect(-20, -9, 40, 9); g.fillStyle = C.skinL; g.fillRect(-20, -9, 40, 2); g.fillStyle = C.vein; for (let i = -16; i < 18; i += 7) g.fillRect(i, -6, 3, 1);
      g.fillStyle = C.horn; g.fillRect(fl * 18, -13, 2, 5); g.fillRect(fl * 22, -12, 2, 4); g.fillStyle = C.eye; g.fillRect(fl * 16, -7, 2, 1);
      if (p.orb === 'ring') { g.strokeStyle = '#100810'; g.lineWidth = 2; g.beginPath(); g.arc(0, -6, 10 + (f.mT / f.T) * 30, 0, 7); g.stroke(); g.lineWidth = 1; }
    } else {
      const tilt = p.body === 'tumble' ? f.mT * 12 : p.body === 'flat' ? fl * 1.2 : 0; g.rotate(tilt);
      for (let i = 0; i < 4; i++) { g.fillStyle = C.smoke; g.beginPath(); g.arc(Math.sin(time * 5 + i) * 3, -4 - i * 4, 7 - i, 0, 7); g.fill(); }   /* the smoke tail (no legs: half-formed) */
      g.fillStyle = C.skin; g.fillRect(-9, -40, 18, 24); g.fillStyle = C.skinL; g.fillRect(-9, -40, 18, 3);
      g.fillStyle = C.vein; g.fillRect(-5, -34, 1, 10); g.fillRect(3, -30, 1, 8); g.fillRect(-1, -25, 1, 6);
      g.fillStyle = C.skin; g.fillRect(-6, -50, 12, 10); g.fillStyle = C.horn; g.fillRect(-8, -56, 2, 7); g.fillRect(6, -56, 2, 7); g.fillRect(-3, -54, 2, 4); g.fillRect(1, -54, 2, 4);
      g.fillStyle = p.scream ? C.red : C.eye; g.fillRect(fl > 0 ? 1 : -4, -46, 3, 2);
      if (p.cape === 'flare') { g.fillStyle = 'rgba(90,20,30,0.85)'; g.fillRect(-16, -42, 6, 20); g.fillRect(10, -42, 6, 20); }
      const hand = { down: [10, -18], palmUp: [12, -34], thrown: [18, -30], pulled: [6, -30], both: [12, -36], thrownBoth: [18, -32], clawUp: [8, -52], swat: [18, -44], clawBack: [-14, -38], clawFwd: [20, -24],
        chainBack: [-16, -40], chainLash: [22, -20], spread: [16, -38], flail: [14, -46], out: [16, -10], flat: [10, -4] }[p.arm] || [10, -18];
      g.strokeStyle = C.skin; g.lineWidth = 3; g.beginPath(); g.moveTo(fl * 6, -36); g.lineTo(fl * hand[0], hand[1]); g.stroke(); if (p.arm === 'both' || p.arm === 'thrownBoth' || p.arm === 'spread') { g.beginPath(); g.moveTo(-fl * 6, -36); g.lineTo(-fl * hand[0], hand[1]); g.stroke(); } g.lineWidth = 1;
      if (p.arm === 'chainBack' || p.arm === 'chainLash') { g.strokeStyle = '#e8e0d0'; g.beginPath(); g.moveTo(fl * hand[0], hand[1]); g.lineTo(fl * (hand[0] + 16), hand[1] + 6); g.stroke(); }
      const k = clamp01(f.mT / Math.max(0.01, f.T));
      if (p.orb === 'grow') orb(g, fl * hand[0], hand[1] - 4, 3 + k * 4, C.boltRim, C.bolt, C.core, 'rgba(255,211,107,0.3)');
      if (p.orb === 'dim') { g.globalAlpha = 0.45 + 0.3 * Math.sin(time * 30); orb(g, fl * hand[0], hand[1] - 4, 3 + k * 4, '#5a2a30', '#2a1418', null, null); g.globalAlpha = 1; }   /* a FEINT: dim, flickering, no white core */
      if (p.orb === 'two') { orb(g, fl * hand[0], hand[1] - 4, 3 + k * 4, C.boltRim, C.bolt, C.core); orb(g, -fl * hand[0], hand[1] - 4, 3 + k * 4, C.boltRim, C.bolt, C.core); }
      if (p.orb === 'glyph') { g.strokeStyle = C.glyph; g.beginPath(); g.arc(0, -60, 6 + k * 4, 0, 7); g.stroke(); }
    }
    g.restore();
    /* the mark over him during a tell; the shared read (B10) */
    const tm = Object.values(DKM.TOLD).find(T => T.tell === f.mode); if (tm) drawMark(g, X, Y - (p.body === 'prone' ? 22 : 66), tm.mark, time);
    const rd = DKM.readOf(f);
    if (rd.open) { g.strokeStyle = Math.floor(time * 8) % 2 ? C.gold : '#ffffff'; g.beginPath(); g.arc(X, Y - 6, 24, 0, 7); g.stroke(); const w = R(40 * clamp01(rd.t / rd.T)); g.fillStyle = 'rgba(255,255,255,0.2)'; g.fillRect(X - 20, Y - 30, 40, 3); g.fillStyle = C.gold; g.fillRect(X - 20, Y - 30, w, 3); }
    else if (rd.ward) { g.strokeStyle = C.ward; g.globalAlpha = 0.6; g.beginPath(); g.arc(X, Y - 24, 22, 0, 7); g.stroke(); g.globalAlpha = 1; }
    if (b && f.mode === 'swoopTell') { const s = surfaceY(b, b.cx) - cy; g.fillStyle = 'rgba(255,74,58,' + (0.35 + 0.35 * Math.sin(time * 20)) + ')'; g.fillRect(R(b.x0 - cx), R(s - 18), b.len, 2); }   /* the red line at head height */
    if (b && f.mode === 'whipTell') { const s = surfaceY(b, b.cx) - cy, yy = f.whipHi ? s - 18 : s - 3; g.fillStyle = 'rgba(255,74,58,' + (0.35 + 0.35 * Math.sin(time * 20)) + ')'; g.fillRect(R(b.x0 - cx), R(yy), b.len, 2); }
    if (b && f.mode === 'whip') { const s = surfaceY(b, b.cx) - cy, yy = f.whipHi ? s - 18 : s - 3; g.fillStyle = '#e8e0d0'; g.fillRect(R(b.x0 - cx), R(yy), b.len, 1); }
  }
  /* the painted king: his sprite (pose x phase x 2 frames), the orb in his hand, the ring of the repulse. Returns true when drawn. */
  function artKing(g, p, fl, time) {
    const frame = Math.floor(time * 3) % 2, s = KA.kingSprite({ body: p.body, arm: p.arm, scream: p.scream, cape: p.cape, ph: f.ph, frame });
    g.save();
    if (p.body === 'tumble') { g.translate(0, -26); g.rotate(f.mT * 12); g.translate(0, 26); }
    if (fl < 0) g.scale(-1, 1);
    if (!s.halo) s.halo = KA.kingHalo(s);
    g.globalAlpha = 0.5; for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) g.drawImage(s.halo, -s.ax + ox, -s.ay + oy); g.globalAlpha = 1;   /* an ember rim so he reads against the dark-red sky and the drake */
    g.drawImage(s.c, -s.ax, -s.ay); g.restore();
    const hx = fl * (s.hand[0] - s.ax), hy = s.hand[1] - s.ay - 4, k = clamp01(f.mT / Math.max(0.01, f.T));
    if (p.orb === 'grow' || p.orb === 'dim') KA.drawHandOrb(g, hx, hy, k, p.orb, time);
    if (p.orb === 'two') { KA.drawHandOrb(g, hx, hy, k, 'grow', time); KA.drawHandOrb(g, -hx, hy, k, 'grow', time + 0.3); }
    if (p.orb === 'glyph') KA.drawGlyph(g, 0, -66, k, time, false);
    if (p.orb === 'ring') { g.strokeStyle = '#100810'; g.lineWidth = 2; g.beginPath(); g.arc(0, -6, 10 + k * 30, 0, 7); g.stroke(); g.strokeStyle = '#c0283a'; g.lineWidth = 1; g.beginPath(); g.arc(0, -6, 12 + k * 30, 0, 7); g.stroke(); }
    return true;
  }
  function drawMark(g, x, y, mark, time) { g.fillStyle = mark === '!!' ? C.red : C.gold; const n = mark.length; for (let i = 0; i < n; i++) { g.fillRect(x - n * 2 + i * 4, y, 2, 6); g.fillRect(x - n * 2 + i * 4, y + 8, 2, 2); } }
  const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
  function draw(g, cx, cy, time) {
    if (!on()) return; const b = back();
    for (const r of f.rings) { const x = R(r.x - cx), y = R(surfaceY(b, r.x) - cy), k = clamp01(r.t / r.T);
      if (!artBad && r.kind === 'glyph') KA.drawGlyph(g, x, y - 1, k, time, true);
      else if (!artBad) { g.strokeStyle = Math.floor(time * 10) % 2 ? C.red : '#ffb04a'; g.beginPath(); g.ellipse(x, y - 1, DK.bombs.r, 4, 0, 0, 7); g.stroke(); KA.drawBomb(g, x, R(y - 120 * (1 - k)), time); }
      else if (r.kind === 'glyph') { g.strokeStyle = C.glyph; g.beginPath(); g.ellipse(x, y - 1, 10, 3, 0, 0, 7); g.stroke(); g.fillStyle = C.glyph; g.fillRect(x - 1, y - 2 - R(k * 8), 2, 2); }
      else { g.strokeStyle = Math.floor(time * 10) % 2 ? C.red : '#ffb04a'; g.beginPath(); g.ellipse(x, y - 1, DK.bombs.r, 4, 0, 0, 7); g.stroke(); orb(g, x, R(y - 120 * (1 - k)), 4, '#ffb04a', '#a8301a', null, null); } }
    drawKing(g, cx, cy, time);
    for (const q of f.bolts) { const x = R(q.x - cx), y = R(q.y - cy);
      if (!artBad) { try { KA.drawBolt(g, x, y, q.r, q.st === 'in' ? (q.feint ? 'feint' : 'in') : q.st, time, q.vx || 0, q.vy || 0); continue; } catch (e) { artBad = true; } }
      if (q.st === 'in') { orb(g, x, y, q.r, C.boltRim, C.bolt, C.core); g.strokeStyle = C.gold; g.globalAlpha = 0.7; g.beginPath(); g.arc(x, y, q.r + 3, 0, 7); g.stroke(); g.globalAlpha = 1; }   /* the gold ring: returnable */
      else if (q.st === 'bat') orb(g, x, y, q.r, C.red, '#ff8a7a', C.core, 'rgba(255,74,58,0.5)');
      else { const pw = q.st === 'pow'; g.fillStyle = pw ? 'rgba(255,251,232,0.4)' : 'rgba(242,226,160,0.35)'; for (let i = 1; i <= 3; i++) { g.beginPath(); g.arc(R(x - q.vx * 0.012 * i), R(y - q.vy * 0.012 * i), q.r - i, 0, 7); g.fill(); }
        orb(g, x, y, q.r, pw ? C.pow : C.ret, pw ? '#ffffff' : '#e8d080', null, pw ? 'rgba(255,255,255,0.5)' : null); } }
  }
  /* screen space: his bar (three segments, one per phase) and the pips */
  function hud(g, VW, VH, time) {
    if (!on()) return; const w = 150, x = R((VW - w) / 2), y = 10, seg = w / 3;
    if (!artBad) { try { KA.drawKingBar(g, VW / 2, y, w, [1, 2, 3].map(ph => Math.max(0, Math.min(f.bar, f.hp - (DK.phases - ph) * f.bar)) / f.bar), f.ph, DKM.kingOpen(f), time);
      if (ctx.text) ctx.text('THE DEMON KING', VW / 2, y + 7, '#e8d8c8', 'center', 6);
      for (let i = 0; i < DK.knock.pips; i++) KA.drawPip(g, VW / 2 - 12 + i * 12, y + 20, i < f.pips, f.pips >= 2, time); return; } catch (e) { artBad = true; } }
    g.fillStyle = 'rgba(10,8,14,0.8)'; g.fillRect(x - 2, y - 2, w + 4, 8);
    for (let i = 0; i < 3; i++) { const ph = i + 1, hp = Math.max(0, Math.min(f.bar, f.hp - (DK.phases - ph) * f.bar)), sx = x + R((2 - i) * seg);
      g.fillStyle = '#3a1a22'; g.fillRect(sx + 1, y, R(seg) - 2, 4); g.fillStyle = ph === f.ph ? (DKM.kingOpen(f) ? C.gold : '#c0283a') : '#7a2a30'; g.fillRect(sx + 1, y, R((seg - 2) * hp / f.bar), 4); }
    if (ctx.text) ctx.text('THE DEMON KING', VW / 2, y + 7, '#e8d8c8', 'center', 6);
    for (let i = 0; i < DK.knock.pips; i++) { const px = R(VW / 2 - 12 + i * 12), py = y + 18, lit = i < f.pips; g.fillStyle = lit ? C.gold : 'rgba(255,255,255,0.18)'; g.fillRect(px - 2, py, 5, 5); if (lit && f.pips >= 2) { g.fillStyle = '#ffffff'; g.fillRect(px - 1, py + 1, 3, 3); } }
  }
  /* (claude/scenes) A DEATH IN THE SKY FIGHT RESTARTS IT AT MOUNT-UP: a fresh fight (his bars full) the next frame, nothing of the old one left (src/heart-scenes.js checkpointOf) */
  function restart() { if (f || king) clear(); }
  return { on, owns, struck, take, update, draw, hud, clear, restart, fight: () => f, king: () => king };
}
