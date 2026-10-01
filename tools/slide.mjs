// tools/slide.mjs - THE BUTT-SLIDE (claude/slide, Daniel 2026-10-01: "holding down on any slope is a butt-slide, like you're on
// your butt sliding"). src/slopes.js's slideStep is the movement (hold DOWN on a slope tile and you go downhill, faster the steeper);
// src/slide.js adds the hit, the bounce and the dust, src/chars.js the 'slide' pose of every hero in every skin. In the Sunken
// Caravan's dunes (a level with real slope tiles) this fails when:
//   - STARTS ONLY ON SLOPES: down held on the flat starts a slide, or down held on a slope (with or without a way) starts none
//   - SPEED GROWS: the slide does not pick up speed down the hill, or does not beat a walk
//   - ENDS: letting go of down does not end it; a jump out of it is refused or leaves the slide on in the air
//   - A WEAK FOE (a sprig: no poise bar) in the way is not hurt, or STOPS the slide, or is neither dead nor knocked down
//   - A STRONG FOE (a brute; and any ELITE or MINI) takes no damage, or does NOT stop the hero, or does not leave him on his back
//     (P.flatT) with no way to act for the whole window, or is hit twice in one slide
//   - A BOSS (a maxHp body) takes more than the chip (x0.05) or does not stop the hero
//   - THE SPEED SCALE: a slow blow does as much as a fast one; a slide under the minimum speed hurts anything
//   - THE PYROMANCER: a press of down on a slope opens the ember flare (the slide must win there), or the same press on the
//     flat no longer does (tools/ember-flare.mjs is the full check of the flare)
//   - THE POSE: any of the 7 heroes in any skin has no 'slide' pose, or its boots are off the standing hero's row, or ANY pixel
//     of it is under the floor (the boot row + the one outline row)
//   - THE LINES: the teach line is not in hint-lines.js; the controls card has no 'slide' row; the SFX table has no slide sound
//   node tools/slide.mjs     (PORT from tools/ports.mjs)
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { openPage } from './cdp.mjs';

const pg = await openPage({ audio: false, fonts: false });
let R;
try {
  await pg.reload();
  R = await pg.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js');
    const out = { errs: [] };
    window.addEventListener('error', e => out.errs.push(String(e.message)));
    const setUp = h => { BK.setHero(h); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'caravan')); BK.start(); BK.god = false; BK.sim(5); };
    const clear = () => { for (const e of BK.enemies()) e.alive = false; for (const s of BK.seeds()) s.dead = true; };
    const none = () => { for (const k of ['left', 'right', 'up', 'down', 'jump', 'block', 'atk', 'dodge']) BK.keys[k] = false; };
    setUp('knight'); clear();
    const L = BK.L, W = L.W, at = (x, y) => L.grid[y * W + x];
    /* the steep dune: a kind-21 slope (rises left) with rock on its high side and air above it, so down-right is DOWN the hill */
    let hill = null;
    for (let y = 2; y < L.H - 2 && !hill; y++) for (let x = 2; x < W - 12 && !hill; x++) if (at(x, y) === 21 && at(x - 1, y) === 1 && at(x - 1, y - 1) === 0) hill = [x, y];
    out.hill = hill;
    const lap = (opts = {}) => {
      none(); clear(); BK.P.hp = BK.P.maxHp; BK.P.flatT = 0; BK.P.hurt = 0; BK.P.inv = 0; BK.P.dead = 0; BK.P.slideOn = false; if (BK.P.sandSlide) { BK.P.sandSlide.sliding = false; BK.P.sandSlide.carry = false; }
      BK.tp(hill[0] - 1, hill[1] - 1); BK.sim(3);
      const rows = [];
      for (let f = 0; f < (opts.frames || 100); f++) { if (opts.script) opts.script(f); else { BK.keys.right = true; BK.keys.down = !opts.noDown; }
        if (opts.foe && f === opts.foeAt) opts.foe();
        BK.sim(1); const P = BK.P; rows.push({ x: P.x, y: P.y, vx: P.vx, on: !!P.slideOn, g: !!P.ground, flat: P.flatT || 0, f }); }
      none(); return rows; };
    /* STARTS ONLY ON SLOPES */
    let flat = null; /* a flat run of floor: rock with two tiles of air over it and no slope within five tiles either way */
    for (let d = 3; d < 60 && !flat; d++) for (const x of [hill[0] - d, hill[0] + d]) { for (let y = 3; y < L.H - 2 && !flat; y++) { let good = at(x, y) === 1 && at(x, y - 1) === 0 && at(x, y - 2) === 0; for (let k = -5; k <= 5 && good; k++) for (let j = -3; j <= 3 && good; j++) { const t = at(x + k, y + j); if (t >= 20 && t <= 25) good = false; } if (good) flat = [x, y - 1]; } }
    out.flat = flat;
    none(); BK.tp(flat[0], flat[1]); BK.sim(5); BK.keys.right = true; BK.keys.down = true; let flatOn = 0; for (let f = 0; f < 20; f++) { BK.sim(1); if (BK.P.slideOn) flatOn++; } none();
    out.flatOn = flatOn;
    out.flatStill = (() => { BK.tp(flat[0], flat[1]); BK.sim(5); BK.keys.down = true; let n = 0; for (let f = 0; f < 20; f++) { BK.sim(1); if (BK.P.slideOn) n++; } none(); return n; })();
    const free = lap();
    out.freeOn = free.filter(r => r.on).length; out.freeMax = Math.max(...free.map(r => Math.abs(r.vx)));
    const onRows = free.filter(r => r.on); out.speedUp = onRows.length > 8 && Math.abs(onRows[onRows.length - 1].vx) > Math.abs(onRows[0].vx) + 40;
    const walk = lap({ noDown: true }); out.walkMax = Math.max(...walk.map(r => Math.abs(r.vx))); out.walkOn = walk.filter(r => r.on).length;
    out.downNoMove = (() => { const r = lap({ script: f => { if (f === 0) { BK.P.x = (free.find(q => q.on) || free[20]).x; BK.P.y = (free.find(q => q.on) || free[20]).y; BK.P.vx = 0; } BK.keys.down = true; BK.keys.right = false; }, frames: 60 }); return { on: r.filter(q => q.on).length, dx: r[r.length - 1].x - r[0].x }; })();
    /* ENDS: let go of down mid-hill; a jump out of it */
    const rel = lap({ script: f => { BK.keys.right = true; BK.keys.down = f < 30; }, frames: 60 }); out.relOn = rel.slice(36).filter(r => r.on).length; out.relBefore = rel.slice(20, 30).filter(r => r.on).length;
    const jmp = lap({ script: f => { BK.keys.right = true; BK.keys.down = true; if (f === 36) { BK.keys.jump = true; BK.press('jump'); } if (f === 40) BK.keys.jump = false; }, frames: 60 });
    out.jumpOnAfter = jmp.slice(40).filter(r => r.on && !r.g).length; out.jumpAir = jmp.slice(38).some(r => !r.g); out.jumpBefore = jmp.slice(30, 36).filter(r => r.on).length;
    /* FOES. Calibrate where the boots are at a good speed, put the foe just ahead of them there on the same line, rerun. */
    const spot = free.find(r => r.on && r.g && Math.abs(r.vx) > 110) || free[20]; out.spot = free.some(r => r.on) ? [spot.x, spot.y, spot.f, spot.vx] : null;   /* (the fallback keeps the page from throwing on code with no slide: the asserts then fail cleanly) */
    const foeRun = (type, tweak) => { let foe = null;
      const rr = lap({ frames: 80, foeAt: Math.max(0, spot.f - 6), foe: () => { [foe] = BK.spawnFoe({ t: type, x: (spot.x + 22) / 16, y: spot.y / 16, face: -1 }); if (foe) { if (tweak) tweak(foe); foe.stagger = 6; foe.vx = 0; foe.hp0x = foe.hp; } } });
      return { foe, rr }; };
    const stat = (type, tweak) => { const { foe, rr } = foeRun(type, tweak); if (!foe) return { err: type + ' did not spawn' };
      const P = BK.P; const first = rr.findIndex(r => r.flat > 0);
      return { hp0: foe.hp0x, hp: foe.hp, alive: foe.alive, knock: foe.knock || 0, stagger: foe.stagger || 0, bounced: first >= 0, flatMax: Math.max(...rr.map(r => r.flat)), vxAfter: first >= 0 ? rr[Math.min(rr.length - 1, first + 2)].vx : null, vxBefore: first > 0 ? rr[first - 1].vx : null,
        last: P.slideLast || null, stillSlidingEnd: rr.slice(-8).some(r => r.on), flatFrames: rr.filter(r => r.flat > 0).length, poise: BK.combat2().poiseMax(foe) }; };
    out.weak = stat('sprig'); out.strong = stat('brute');
    out.elite = stat('sprig', f => { f.elite = true; });
    out.boss = stat('brute', f => { f.maxHp = f.hp = 400; });
    out.mini = stat('sprig', f => { f.mini = true; });
    /* ONE HIT PER FOE PER SLIDE: a weak foe that lives (hp raised) is hit once */
    { const { foe, rr } = foeRun('sprig', f => { f.hp = 100; }); out.once = foe ? { hp: foe.hp, hit: 100 - foe.hp, last: BK.P.slideLast } : null; }
    /* ON HIS BACK: he can not act for the whole window (a jump pressed while flat does nothing) */
    { const { rr } = foeRun('brute'); const first = rr.findIndex(r => r.flat > 0);
      if (first >= 0) { none(); let w = 0; while (!BK.P.ground && w++ < 90) BK.sim(1); BK.keys.jump = true; BK.press('jump'); let up = false; for (let f = 0; f < 6; f++) { BK.sim(1); if (BK.P.vy < -50) up = true; } BK.keys.jump = false; out.flatJump = up; out.flatLeft = BK.P.flatT; } }
    /* A SLOW SLIDE HURTS NOTHING, a fast one hurts once: the real function on a fake world, one foe in the boot box */
    const m = await import('/src/slide.js').catch(() => null);   /* (no src/slide.js on code without the slide: the asserts below fail cleanly) */
    if (m) { const run = vx => { const hits = []; const P = { x: 100, y: 100, vx, face: 1, ground: true, slideHits: null }, ss = { sliding: true, vx }, e = { alive: true, x: 108, y: 100, w: 8, h: 10, t: 'sprig', hp: 10 };
        const c = { P, ss, dt: 1 / 60, time: 0, enemies: [e], box: q => ({ l: q.x - 4, r: q.x + 4, t: q.y - q.h, b: q.y }), overlap: (p, q) => p.l < q.r && p.r > q.l && p.t < q.b && p.b > q.t, poiseMax: () => 0, swordDmg: () => 12,
          hurtEnemy: (f, d) => { hits.push(d); e.alive = false; }, knockFoe() {}, SFX: {}, dust() {}, parts: [], shakeCam() {}, hitstop() {}, sparks() {}, lowParts: true };
        m.buttUpdate(c); m.buttUpdate(c); return hits; };
      out.slowHits = run(m.BUTT.minSpeed - 10).length; out.fastHits = run(m.BUTT.minSpeed + 40).length; }
    /* THE SPEED SCALE (the pure function) */
    if (m) { out.blow = [60, 70, 120, 180].map(v => m.slideBlow(v, 12)); out.minSpeed = m.BUTT.minSpeed; out.chip = m.BUTT.chip; }
    /* THE PYROMANCER: a press of down on the slope is a slide, on the flat the flare */
    setUp('pyro'); clear();
    { const on0 = free.find(r => r.on) || free[20]; BK.P.x = on0.x; BK.P.y = on0.y; BK.P.vx = 0; BK.sim(2); none(); BK.press('down'); BK.keys.down = true; let flare = 0, slide = 0; for (let f = 0; f < 30; f++) { BK.sim(1); if (BK.P.emberUp) flare++; if (BK.P.slideOn) slide++; } none(); out.pyroSlope = { flare, slide }; }
    { BK.tp(flat[0], flat[1]); BK.sim(8); none(); BK.press('down'); BK.keys.down = true; let flare = 0; for (let f = 0; f < 12; f++) { BK.sim(1); if (BK.P.emberUp) flare++; } none(); out.pyroFlat = { flare }; }
    /* THE POSE: every hero, every skin */
    out.poses = [];
    for (const h of ['knight', 'warden', 'pirate', 'paladin', 'geomancer', 'reaper', 'pyro']) for (const s of BKT.skinIds()) {
      const K = BKT.heroSet(s, BKT.PROG.sword, false, h), I = Array.isArray(K.R.idle) ? K.R.idle[0] : K.R.idle, fr = K.R.slide;
      if (!fr) { out.poses.push({ h, s, none: true }); continue; }
      (Array.isArray(fr) ? fr : [fr]).forEach((c, i) => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let low = -1; for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 0) low = y;
        out.poses.push({ h, s, i, feet: c.feet, stand: I.feet, low, n: Array.isArray(fr) ? fr.length : 1 }); }); }
    return out; })()`);
} finally { pg.close(); }

const bad = [], ok = (c, m) => { if (!c) bad.push(m); };
assert.ok(R.flat, 'no flat floor found in the Caravan');
assert.ok(R.hill, 'no steep dune found in the Caravan: the check has stopped covering the slide');
ok(R.errs.length === 0, 'the page threw: ' + R.errs.join('; '));
ok(R.flatOn === 0 && R.flatStill === 0, 'DOWN on FLAT ground started a slide (' + R.flatOn + ' and ' + R.flatStill + ' frames)');
ok(R.freeOn > 20, 'DOWN + a way on the steep dune started no slide (' + R.freeOn + ' frames on)');
ok(R.walkOn === 0, 'walking the dune with down NOT held started a slide (' + R.walkOn + ' frames)');
ok(R.downNoMove && R.downNoMove.on > 15 && R.downNoMove.dx > 40, 'DOWN alone on the slope did not slide it downhill: ' + JSON.stringify(R.downNoMove));
ok(R.speedUp, 'the slide did not gain speed down the dune');
ok(R.freeMax > R.walkMax * 1.3, 'the slide (' + Math.round(R.freeMax) + ' px/s) is not faster than the walk (' + Math.round(R.walkMax) + ')');
ok(R.relBefore > 5 && R.relOn === 0, 'letting go of down did not end the slide (on before ' + R.relBefore + ', after ' + R.relOn + ')');
ok(R.jumpBefore > 3 && R.jumpAir && R.jumpOnAfter === 0, 'a jump out of the slide did not leave the ground and end it (before ' + R.jumpBefore + ', air ' + R.jumpAir + ', still on in the air ' + R.jumpOnAfter + ')');
ok(R.spot, 'no calibration spot for the foes');
const Wk = R.weak, S = R.strong, E = R.elite, B = R.boss, M = R.mini;
for (const [n, x] of [['weak', Wk], ['strong', S], ['elite', E], ['boss', B], ['mini', M]]) ok(x && !x.err, n + ' foe: ' + (x && x.err));
if (Wk && !Wk.err) { ok(Wk.hp < Wk.hp0 || !Wk.alive, 'WEAK foe took nothing (hp ' + Wk.hp0 + ' -> ' + Wk.hp + ')'); ok(!Wk.alive || Wk.knock > 0 || Wk.stagger > 0, 'WEAK foe lived and was not knocked down'); ok(!Wk.bounced, 'a WEAK foe STOPPED the slide (flat ' + Wk.flatMax + ')'); ok(Wk.last && Wk.last.kind === 'weak', 'a sprig was not read as weak: ' + JSON.stringify(Wk.last)); }
for (const [n, x] of [['STRONG', S], ['ELITE', E], ['MINI', M]]) if (x && !x.err) {
  ok(x.hp < x.hp0 || !x.alive, n + ' foe took no damage (hp ' + x.hp0 + ' -> ' + x.hp + ')'); ok(x.bounced, n + ' foe did NOT stop the hero (no time on his back)'); ok(x.flatMax > 0.5, n + ': on his back for only ' + x.flatMax + ' s');
  ok(x.vxBefore !== null && x.vxAfter !== null && Math.sign(x.vxAfter) !== Math.sign(x.vxBefore), n + ': not thrown back off it (vx ' + x.vxBefore + ' -> ' + x.vxAfter + ')'); ok(x.last && x.last.kind === 'strong', n + ' read as ' + (x.last && x.last.kind)); }
if (B && !B.err) { const lost = B.hp0 - B.hp; ok(B.last && B.last.kind === 'boss', 'a maxHp body read as ' + (B.last && B.last.kind)); ok(lost >= 0 && lost <= Math.max(1, Math.round((B.last ? B.last.blow : 99) * R.chip)), 'a BOSS took more than the chip: ' + lost + ' of a blow of ' + (B.last && B.last.blow)); ok(B.bounced, 'a BOSS did not stop the hero'); }
ok(R.flatJump === false && R.flatLeft > 0, 'on his back he could JUMP (or the timer was already gone): ' + R.flatJump + ' left ' + R.flatLeft);
ok(R.once && R.once.hit > 0 && R.once.last && R.once.hit <= R.once.last.blow, 'a foe was not hit exactly once in one slide: ' + JSON.stringify(R.once));
ok(R.slowHits === 0 && R.fastHits === 1, 'a slide under the minimum speed hurt a foe (' + R.slowHits + ') or a fast one did not hit exactly once (' + R.fastHits + ')');
ok(R.blow && R.blow[0] === R.blow[1] && R.blow[2] > R.blow[1] && R.blow[3] > R.blow[2], 'the blow does not scale with speed: ' + R.blow);
ok(R.pyroSlope && R.pyroSlope.flare === 0 && R.pyroSlope.slide > 8, 'the Pyromancer pressing down on a slope: ' + JSON.stringify(R.pyroSlope) + ' (the slide must win)');
ok(R.pyroFlat && R.pyroFlat.flare > 0, 'the Pyromancer pressing down on the flat no longer opens the ember flare');
const heroes = new Set(R.poses.map(p => p.h)); ok(heroes.size === 7, 'poses measured for ' + heroes.size + ' heroes');
const skins = new Set(R.poses.map(p => p.s)).size;
for (const p of R.poses) { if (p.none) { ok(false, p.h + '/' + p.s + ' has no slide pose'); continue; }
  ok(p.n >= 2, p.h + '/' + p.s + ' slide pose has ' + p.n + ' frame'); ok(p.feet === p.stand, p.h + '/' + p.s + '#' + p.i + ' boots row ' + p.feet + ' vs standing ' + p.stand); ok(p.low <= p.stand + 1, p.h + '/' + p.s + '#' + p.i + ' has pixels UNDER the floor (lowest row ' + p.low + ', floor ' + (p.stand + 1) + ')'); }
ok(R.poses.length >= 7 * 2 * 3, 'only ' + R.poses.length + ' slide frames measured');
const rd = f => fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8');
ok(/HOLD DOWN TO SLIDE/.test(rd('src/hint-lines.js')), 'the teach line is not in src/hint-lines.js');
ok(/'slide', 'HOLD ' \+ k1\('down'\) \+ ' ON A SLOPE'/.test(rd('src/controls.js')), 'the controls card has no slide row');
ok(/slide\(\)\s*\{/.test(rd('src/audio.js')) && /slideHit\(\)\s*\{/.test(rd('src/audio.js')), 'the SFX table has no slide sounds');
console.log('weak', JSON.stringify(Wk), '\nstrong', JSON.stringify(S), '\nelite', JSON.stringify(E), '\nboss', JSON.stringify(B), '\nmini', JSON.stringify(M));
console.log('slide ' + Math.round(R.freeMax) + ' px/s on the steep dune vs walk ' + Math.round(R.walkMax) + '; blow at 60/70/120/180 px/s of a 12 cut: ' + (R.blow || []).join('/') + '; pyro slope ' + JSON.stringify(R.pyroSlope) + ' flat ' + JSON.stringify(R.pyroFlat) + '; ' + R.poses.length + ' slide frames in ' + skins + ' skins');
assert.equal(bad.length, 0, bad.slice(0, 14).join('\n  '));
console.log('ok  slide           down on a slope slides feet first: starts only on slopes, speeds up, ends on release / jump; weak foes die or fall, strong and elite are hurt and stop you (on your back ' + (S && S.flatMax ? S.flatMax.toFixed(2) : '?') + ' s), bosses chipped; 7 heroes x ' + skins + ' skins have a pose that stands on the floor.');
