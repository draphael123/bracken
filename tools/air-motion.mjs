// PAGE TOOL: launches headless Chrome
/* tools/air-motion.mjs (claude/airmotion) - THE BODY IS DRAWN MOVING, AND ONLY DRAWN (src/air-motion.js).
   It reads what the draw really did: P.artTurn (the tilt, radians) and P.artTall (the vertical scale), set beside P.lastKey.
   1. ART ONLY: the same running jump, with all of it on and with it zeroed, travels the same path and lands on the same frame.
   2. THE JUMP: leans into the run on the way up, swings over when he turns in the air, upright on the ground; taller on the
      climb than at the top; a heavy hero leans less than a light one.
   3. THE HIT: thrown back the way the blow sends him (on the ground and in the air), righting as the hurt runs out.
   4. THE SKID: leaning back against the slide, sat into it, gone when it ends.
   5. THE SLIDE: drawn long and low at speed down a dune.
   6. THE CROUCH: squashed going down, stretched coming back up.
   7. REDUCE MOTION: none of it. Every hero jumps with it, and the page logs nothing.   node tools/air-motion.mjs */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { portFor } from './ports.mjs';

const pg = await openPage({ port: portFor(6), audio: false, seed: 4 });
try {
  const r = await pg.evalp(`(async () => {
    const M = await import('/src/air-motion.js'), JFm = await import('/src/jump-feel.js'), { LEVELS } = await import('/src/level.js'), r = {};
    const keep = { air: { ...M.AIR }, mv: JSON.parse(JSON.stringify(M.MOVES)) };
    const off = () => { Object.assign(M.AIR, { lean: 0, stretch: 0, hang: 0 }); Object.assign(M.MOVES.hurt, { lean: 0 }); Object.assign(M.MOVES.skid, { lean: 0, squash: 0 }); Object.assign(M.MOVES.slide, { stretch: 0 }); Object.assign(M.MOVES.crouch, { down: 0, up: 0 }); };
    const on = () => { Object.assign(M.AIR, keep.air); for (const k in keep.mv) Object.assign(M.MOVES[k], keep.mv[k]); };
    const none = () => { for (const k of ['left', 'right', 'up', 'down', 'jump', 'block', 'atk', 'dodge']) BK.keys[k] = false; };
    const kd = k => dispatchEvent(new KeyboardEvent('keydown', { key: k })), ku = k => dispatchEvent(new KeyboardEvent('keyup', { key: k }));
    const wood = (hero = 'knight') => { BK.setHero(hero); BK.load(1); BK.state = 'play'; BK.god = true; BK.step(240); for (const q of BK.enemies()) q.alive = false; BK.step(20); none(); };
    const row = () => ({ key: BK.P.lastKey, rot: BK.P.artTurn || 0, sy: BK.P.artTall || 1, g: !!BK.P.ground, vy: BK.P.vy });
    const jump = (hero, opts = {}) => { wood(hero);
      kd('ArrowRight'); BK.step(30); const x0 = BK.P.x, y0 = BK.P.y; kd('z'); const path = []; let landed = -1;
      for (let i = 0; i < 120; i++) { BK.step(1); if (i === 20) ku('z'); if (opts.turn && i === opts.turn) { ku('ArrowRight'); kd('ArrowLeft'); }
        path.push({ ...row(), x: BK.P.x - x0, y: BK.P.y - y0, lean: BK.P.airLeanA || 0 });
        if (BK.P.ground && i > 3 && landed < 0) landed = i; if (landed >= 0 && i - landed > 3) break; }
      ku('z'); ku('ArrowRight'); ku('ArrowLeft'); return { path, landed }; };
    const watch = (n, setup, script) => { setup(); const out = []; for (let f = 0; f < n; f++) { if (script) script(f); BK.step(1); out.push(row()); } none(); return out; };
    const deg = v => Math.round(v * 180 / Math.PI);
    // 1. art only
    jump('knight');   /* a first run after the page loads starts a few px off (the run-up, not the air): warm up, then compare from the take-off */
    off(); const a = jump('knight'); on(); const b = jump('knight');
    r.samePath = a.landed === b.landed && a.path.length === b.path.length && a.path.every((p, i) => Math.abs(p.x - b.path[i].x) < 1e-6 && Math.abs(p.y - b.path[i].y) < 1e-6);
    r.offIsFlat = a.path.every(p => p.rot === 0);
    // 2. the jump
    const up = b.path.filter(p => !p.g && p.vy < -100); r.leansUp = up.length > 3 && up.slice(3).every(p => p.rot > 0);
    r.maxLeanDeg = deg(Math.max(...b.path.map(p => p.rot)));
    r.flatOnGround = b.path.filter(p => p.g && (p.key === 'idle' || p.key === 'run')).every(p => p.rot === 0);
    const t = jump('knight', { turn: 14 }), late = t.path.filter(p => !p.g).slice(-4); r.swingsOver = late.length > 0 && late.every(p => p.lean < 0);
    /* (after the one-tick press squash) the whole climb is drawn tall - the take-off stretch hands over to the arc's, he never shrinks back to size between them - and the top squashed */
    const rise = b.path.filter(p => !p.g && p.vy < -130).slice(1), top = b.path.find(p => !p.g && Math.abs(p.vy) < 30), riseOff = a.path.filter(p => !p.g && p.vy < -130).slice(1);
    r.climbTaller = rise.length > 5 && rise.every(p => p.sy > 1.001) && !!top && top.sy < 1 && riseOff.some(p => Math.abs(p.sy - 1) < 0.001);
    const lean = h => Math.max(...jump(h).path.map(p => p.rot)); r.paladinLean = deg(lean('paladin')); r.pyroLean = deg(lean('pyro')); r.heavyLeansLess = r.paladinLean < r.pyroLean;
    // 3. the hit
    const hit = (fromAhead, air) => watch(20, () => { wood(); BK.god = false; BK.P.hp = BK.P.maxHp; BK.P.face = 1; BK.P.inv = 0; if (air) { BK.P.y -= 48; BK.P.vy = -150; BK.P.ground = false; } BK.step(1); BK.damagePlayer(BK.P.x + (fromAhead ? 20 : -20), 1); });
    const hg = hit(true, false).filter(p => p.key === 'hurt'), ha = hit(false, true).filter(p => p.key === 'hurt'); BK.god = true;
    r.hitGround = hg.length ? deg(hg[0].rot) : null; r.hitAir = ha.length ? deg(ha[0].rot) : null;
    r.hitThrown = r.hitGround < -4 && r.hitAir > 4 && Math.abs(hg[hg.length - 1].rot) <= Math.abs(hg[0].rot);
    // 4. the skid
    const sk = watch(16, () => { wood(); BK.keys.right = true; BK.step(40); }, f => { if (f === 0) { BK.keys.right = false; BK.keys.left = true; } });
    const sks = sk.filter(p => p.key === 'skid'); r.skidDeg = sks.length ? deg(sks[0].rot) : null;
    r.skidLeansBack = sks.length > 0 && sks[0].rot < 0 && sks[0].sy < 1 && sk.filter(p => p.key !== 'skid' && p.g).every(p => p.rot === 0);
    // 5. the crouch (before the slide: the dune leaves its slide behind for the next load)
    const cr = watch(24, () => wood('pyro'), f => { BK.keys.down = f >= 2 && f < 12; });
    r.crouchDown = cr.slice(2, 5).some(p => p.sy < 1); r.crouchUp = cr.slice(12, 16).some(p => p.sy > 1); r.crouchSettles = cr.slice(-4).every(p => Math.abs(p.sy - 1) < 0.001);
    // 6. the slide
    BK.setHero('knight'); BK.load(LEVELS.findIndex(l => l.id === 'caravan')); BK.state = 'play'; BK.god = true; BK.step(5); for (const e of BK.enemies()) e.alive = false;
    const L = BK.L, W = L.W, at = (x, y) => L.grid[y * W + x]; let hill = null;
    for (let y = 2; y < L.H - 2 && !hill; y++) for (let x = 2; x < W - 12 && !hill; x++) if (at(x, y) === 21 && at(x - 1, y) === 1 && at(x - 1, y - 1) === 0) hill = [x, y];
    const sl = watch(50, () => { none(); BK.tp(hill[0] - 1, hill[1] - 1); BK.step(3); }, () => { BK.keys.right = true; BK.keys.down = true; }).filter(p => p.key === 'slide');
    r.slideLow = sl.length > 5 && sl.slice(-3).every(p => p.sy < 1);
    // 7. reduce motion, every hero
    BK.SET.reduceMotion = true; const rm = jump('knight'), rmc = watch(24, () => wood('pyro'), f => { BK.keys.down = f >= 2 && f < 12; }); BK.SET.reduceMotion = false;
    r.reduceOff = rm.path.concat(rmc).every(p => p.rot === 0) && rmc.every(p => p.sy === 1) && rm.path.filter(p => !p.g && Math.abs(p.vy) < 30).every(p => p.sy === 1);
    r.heroes = []; for (const h of Object.keys(JFm.JUMP_FEEL)) { const j = jump(h); r.heroes.push(h + ':' + (j.landed > 0 && j.path.some(p => p.rot !== 0) ? 'ok' : 'NO')); }
    return r;
  })()`, 400000);
  console.log(JSON.stringify(r));
  for (const k of ['samePath', 'offIsFlat', 'leansUp', 'flatOnGround', 'swingsOver', 'climbTaller', 'heavyLeansLess', 'hitThrown', 'skidLeansBack', 'slideLow', 'crouchDown', 'crouchUp', 'crouchSettles', 'reduceOff'])
    assert(r[k], 'body motion: ' + k + ' failed ' + JSON.stringify(r));
  assert(r.heroes.every(h => h.endsWith(':ok')), 'a hero jumped without air motion: ' + r.heroes.join(' '));
  assert(r.maxLeanDeg >= 4 && r.maxLeanDeg <= 12, 'the knight leans ' + r.maxLeanDeg + ' degrees (4-12 reads as motion without toppling)');
  assert.deepEqual(pg.errors, [], 'page errors: ' + pg.errors.join(' | '));
  console.log('air-motion: the jump leans (knight ' + r.maxLeanDeg + ' deg) and stretches with the arc, a hit throws him back (' + r.hitGround + '/' + r.hitAir + ' deg), the skid leans back (' + r.skidDeg + ' deg), the slide runs long, the crouch squashes and springs; the path is unchanged, reduce motion is untouched, all ' + r.heroes.length + ' heroes.');
} finally { pg.close(); }
