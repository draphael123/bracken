// tools/run-slide.mjs - THE RUNNING SLIDE (claude/slope, src/run-slide.js; scratch/brief-combat2.md section 2). A page check (PORT).
// On a long flat floor of the Greenwood, a fresh save, base movement, keys held as a hand holds them (BK.keys, BK.press), for every hero this fails when:
//   - IT STARTS WHERE IT MUST NOT: DOWN pressed standing (that is the duck: he must duck and not slide), DOWN pressed at a walk under RUN_SLIDE.minRun of a run,
//     DOWN held BEFORE the run begins (only a press at a run is a slide), or a second press inside the cooldown
//   - IT DOES NOT START at a run, or is not low (BK.duck().box DUCK_H tall, P.lowSlide), or costs no wind
//   - THE PACE: it gains speed (it keeps the run's pace, never adds), it stops short of RUN_SLIDE.t, or runs on past it
//   - A JUMP out of it is refused, or leaves the slide on in the air; an ATTACK in it is not the low sweep
//   - THE LOW BLOW: a small foe (a sprig) in the way is not hurt, not TRIPPED, or stops the slide; a strong one (a brute) is not hurt or does NOT stop it;
//     the blow is not a SWEEP (BK's blow tag: the B14 low key)
//   - A HIGH BLOW finds him: a level arrow (an archer's) over the slide must miss, and must hit him running (the control)
//   PORT=8857 node tools/run-slide.mjs [heroes]   exit 1 on any failure
import { openPage } from './cdp.mjs';
const HEROES = (process.argv[2] || 'knight,warden,pyro,paladin,pirate,reaper,geomancer,berserker').split(',');
let fails = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const pg = await openPage({ audio: false, fonts: false });
try {
  for (const hero of HEROES) {
    const r = await pg.evalp(`(async()=>{ const { LEVELS, T } = await import('/src/level.js'); const RS = await import('/src/run-slide.js'); const { DUCK_H } = await import('/src/duck.js');
      const errs = []; window.addEventListener('error', e => errs.push(String(e.message)));
      BK.manualSimulation = true; BK.setHero(${JSON.stringify(hero)}); BK.reset({ fresh: true }); const S = BK.ui.settings(); const sp0 = S.speed; S.speed = 1;
      BK.load(LEVELS.findIndex(l => l.id === 'wood')); BK.state = 'play'; BK.god = false; BK.sim(5);
      const L = BK.level, W = L.W, at = (x, y) => L.grid[y * W + x]; let spot = null;
      for (let y = 6; y < L.H - 1 && !spot; y++) for (let x = 2; x < W - 45 && !spot; x++) { let good = true; for (let k = 0; k < 40 && good; k++) { if (at(x + k, y + 1) !== T.SOLID) good = false; for (let d = 0; d < 6 && good; d++) if (at(x + k, y - d) !== T.AIR) good = false; } if (good) spot = [x, y]; }
      const k = BK.keys, P = () => BK.P, none = () => { for (const q of ['left', 'right', 'jump', 'down', 'up', 'atk', 'block', 'dodge']) k[q] = false; };
      const kill = () => { for (const e of BK.enemies()) e.alive = false; for (const s of BK.seeds()) s.dead = true; };
      const reset = () => { none(); kill(); const p = P(); p.hp = p.maxHp; p.st = p.stMax || 100; p.hurt = 0; p.inv = 0; p.rsl = 0; p.lowSlide = false; p.rslCd = 0; p.flatT = 0; BK.tp(spot[0] + 1, spot[1]); p.vx = 0; p.vy = 0; BK.sim(30); P().runT = 0; };
      const run = n => { for (let i = 0; i < n; i++) { k.right = true; BK.sim(1); } };
      const out = { hero: ${JSON.stringify(hero)}, errs, minRun: RS.RUN_SLIDE.minRun, t: RS.RUN_SLIDE.t };
      /* standing: down is the duck */
      reset(); k.down = true; BK.sim(8); out.standDuck = !!P().ducking; out.standSlide = !!(P().rsl > 0); none(); BK.sim(5);
      /* at a walk too slow (held back under minRun of a run): no slide */
      reset(); for (let i = 0; i < 2; i++) { k.right = true; BK.sim(1); } out.slowVx = Math.abs(P().vx); k.down = true; BK.sim(2); out.slowSlide = !!(P().rsl > 0); none(); BK.sim(10);
      /* down held first, then the run: no slide */
      reset(); k.down = true; BK.sim(3); for (let i = 0; i < 40; i++) { k.right = true; k.down = true; BK.sim(1); } out.heldSlide = !!(P().rsl > 0); none(); BK.sim(10);
      /* THE SLIDE: run, then press down (held) */
      reset(); run(40); const v0 = Math.abs(P().vx), st0 = P().st; k.down = true; k.right = true; BK.sim(1);
      out.on = !!(P().rsl > 0); out.low = !!P().lowSlide; out.boxH = (() => { const b = BK.duck().box; return b.b - b.t; })(); out.DUCK_H = DUCK_H; out.cost = st0 - P().st; out.v0 = v0;
      let frames = 1, vmax = Math.abs(P().vx); while (P().rsl > 0 && frames < 120) { k.right = true; k.down = true; BK.sim(1); frames++; vmax = Math.max(vmax, Math.abs(P().vx)); }
      out.frames = frames; out.vmax = vmax; out.lowAfter = !!P().lowSlide;
      /* the cooldown: let go of down, press it again at once */
      k.down = false; BK.sim(1); k.down = true; BK.sim(1); out.cdSlide = !!(P().rsl > 0); none(); BK.sim(40);
      /* a jump out of it */
      reset(); run(40); k.down = true; BK.sim(4); k.jump = true; BK.press('jump'); let air = false, onAir = false; for (let i = 0; i < 12; i++) { k.right = true; BK.sim(1); if (!P().ground) { air = true; if (P().rsl > 0 || P().lowSlide) onAir = true; } } out.jumpAir = air; out.jumpOnAir = onAir; none(); BK.sim(60);
      /* an attack in it: the low sweep */
      reset(); run(40); k.down = true; BK.sim(4); BK.press('atk'); k.atk = true; let sweep = false; for (let i = 0; i < 8; i++) { k.down = true; BK.sim(1); if (P().swingKind === 'sweep') sweep = true; } out.atkSweep = sweep; out.atkEnds = !(P().rsl > 0); none(); BK.sim(60);
      /* THE LOW BLOW: a foe ahead on the same floor, the slide started a tile and a half short of it */
      const foeRun = (t, hp) => { reset(); run(40); BK.spawnEnt({ t, x: (P().x + 30 - 8) / 16, y: spot[1] });   /* (spawnEnt: x*16+8, feet on row y+1) */ const e = BK.enemies().at(-1); e.hp = e.hp0 = hp; e.cd = 99; e.elT = 99; e.vx = 0; e.face = -1; e.stagger = 0.5;
        const ex0 = e.x; k.down = true; let hit = false, stopped = false, tripped = false; const hp0 = e.hp;
        for (let i = 0; i < 30; i++) { k.right = true; k.down = true; e.vx = 0; BK.sim(1); if (e.hp < hp0) hit = true; if (e.broken > 0 || (e.tripImm || 0) > 0) tripped = true; if (hit && !(P().rsl > 0) && i < 24) stopped = true; }
        const res = { t, hit, dmg: hp0 - e.hp, tripped, stopped, past: P().x > ex0 + 4, last: P().rslLast || null }; none(); kill(); BK.sim(60); return res; };
      out.weak = foeRun('sprig', 200); out.strong = foeRun('brute', 2000);
      /* A HIGH BLOW: an arrow loosed level at his chest, sliding and (the control) running */
      const arrow = slide => { reset(); run(40); if (slide) { k.down = true; BK.sim(2); } const p = P(); const hp0 = p.hp; p.inv = 0;
        BK.seeds().push({ x: p.x + 60, y: p.y - 11, vx: -260, vy: 0, g: 0, dead: false, life: 2, arrow: true, high: true }); let hurt = false;
        for (let i = 0; i < 14; i++) { k.right = true; k.down = slide; BK.sim(1); if (P().hp < hp0) hurt = true; } none(); BK.sim(30); return hurt; };
      out.arrowSlide = arrow(true); out.arrowRun = arrow(false);
      S.speed = sp0; return out; })()`, 300000);
    const h = r.hero, cap = 92;
    ok(!r.errs.length, `${h}: no page errors (${r.errs.slice(0, 2).join(' | ') || 'none'})`);
    ok(r.standDuck && !r.standSlide, `${h}: DOWN standing is the duck (ducked ${r.standDuck}, slide ${r.standSlide})`);
    ok(!r.slowSlide, `${h}: DOWN at a walk (${r.slowVx.toFixed(0)} px/s, under ${(r.minRun * cap).toFixed(0)}) is no slide`);
    ok(!r.heldSlide, `${h}: DOWN held before the run is no slide`);
    ok(r.on && r.low && Math.abs(r.boxH - r.DUCK_H) < 0.01, `${h}: DOWN pressed at a run (${r.v0.toFixed(0)} px/s) slides, low (hurt box ${r.boxH} px, DUCK_H ${r.DUCK_H})`);
    ok(r.cost > 0, `${h}: it costs wind (${r.cost})`);
    ok(r.vmax <= r.v0 + 0.5, `${h}: it keeps the run's pace and never adds (in ${r.v0.toFixed(1)}, top ${r.vmax.toFixed(1)})`);
    ok(Math.abs(r.frames - r.t * 60) <= 2 && !r.lowAfter, `${h}: it lasts ${r.frames} frames (${(r.t * 60).toFixed(0)}) and ends upright`);
    ok(!r.cdSlide, `${h}: a press inside the cooldown is no slide`);
    ok(r.jumpAir && !r.jumpOnAir, `${h}: a jump out of it leaves the ground and ends it (air ${r.jumpAir}, still sliding in the air ${r.jumpOnAir})`);
    ok(r.atkSweep && r.atkEnds, `${h}: an attack in it is the low sweep (sweep ${r.atkSweep}, slide ended ${r.atkEnds})`);
    ok(r.weak.hit && r.weak.tripped && !r.weak.stopped, `${h}: a sprig in the way is hit (${r.weak.dmg}), TRIPPED (${r.weak.tripped}) and slid past (stopped ${r.weak.stopped})`);
    ok(r.strong.hit && r.strong.stopped, `${h}: a brute in the way is hit (${r.strong.dmg}) and stops the slide (${r.strong.stopped})`);
    ok(!r.arrowSlide && r.arrowRun, `${h}: a level arrow goes over the slide (hurt ${r.arrowSlide}) and finds him running (hurt ${r.arrowRun})`);
  }
} finally { await pg.close(); }
console.log(fails ? '\nFAIL  run-slide: ' + fails : '\nok  run-slide: DOWN at a run is a short low slide for every hero - not standing, not slow, not held; its pace kept; jump and sweep out of it; a sweep into the legs; under a high arrow');
process.exit(fails ? 1 : 0);
