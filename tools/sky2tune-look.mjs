// tools/sky2tune-look.mjs - SKYHOOK 2 IN THE REAL PAGE (claude/sky2tune, 11-14). Not in the suite. Stills of every phase / lever / state / the 3 new attacks, at real viewport sizes, camera WIDE,
// plus the functional looks (all 9 heroes strike every lever, soft-lock, co-op set-only, console errors, frame time).
//   BRACKEN_SKY2=1 PORT=8652 node tools/sky2tune-look.mjs --out=DIR [--sizes=1920x1080,1280x720] [--mode=wide] [--part=stills|heroes|perf|all] [--root=<checkout>]
// (without BRACKEN_SKY2 = the flag-OFF live fight: `--part=off` takes the identical-stills scene for the OFF compare, run it on master and on the branch and compare the sha lines)
import { pathToFileURL, fileURLToPath } from 'node:url';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
const arg = (k, d = '') => { const a = process.argv.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const ROOT = arg('root', fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '')), OUT = arg('out', 'sky2tune-look'), PART = arg('part', 'stills');
const SIZES = arg('sizes', '1920x1080').split(',').map(s => s.split('x').map(Number)), MODE = arg('mode', 'wide');
mkdirSync(OUT, { recursive: true });
const { openPage } = await import(pathToFileURL(ROOT + '/tools/cdp.mjs').href);
const pg = await openPage({ audio: false, fonts: false, seed: 20261114 });
const ev = (x, t = 300000) => pg.evalp(x, t);
const note = { part: PART, shots: [], facts: [] };
const SCALE = +arg('scale', 0.5);
const shot = async (label, extra) => {
  await ev('BK.step(2)');
  const vp = await ev('({w: innerWidth, h: innerHeight})');
  const r = await pg.send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: vp.w, height: vp.h, scale: SCALE } });
  const buf = Buffer.from(r.result.data, 'base64'); writeFileSync(join(OUT, label + '.png'), buf); note.shots.push({ label, sha: createHash('sha1').update(buf).digest('hex').slice(0, 12), ...(extra || {}) });
};
// ---- the in-page kit
const KIT = `window.__K = (async () => {
  const M = await import('/src/skyhook2.js'); const K = { M };
  K.S = () => BK.skyhookHands().show(); K.e = () => BK.enemies().find(e => e.t === 'skyhook' && e.alive);
  K.run = (n) => { for (let i = 0; i < n; i++) { BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
  K.keysOff = () => { const k = BK.keys; k.left = k.right = k.up = k.down = k.jump = k.atk = k.block = false; };
  K.lever = id => BK.enemies().find(e => e.t === 'skylever' && (e.id === id || e.lever === id || e.name === id)) || null;
  K.place = (x, y) => { const P = BK.P; P.x = x; P.y = y; P.vx = P.vy = 0; P.ground = true; };
  K.info = () => { const S = K.S(), e = K.e(); if (!S || !e) return null; return { mode: e.mode, route: e.route, hp: Math.round(e.hp), max: e.maxHp, ph: S.ph, pts: S.points, held: S.held, enr: S.enraged, x: Math.round(e.x), y: Math.round(e.y), lamps: M.lamps ? M.lamps(e, S) : null, bar: BK.skyhookHands().barName ? BK.skyhookHands().barName(e) : null, n: S.n, t: Math.round(S.t) }; };
  return K; })()`;
await ev(KIT);
const kit = x => ev('(async()=>{ const K = await window.__K; ' + x + ' })()');
try {
  for (const [W, H] of SIZES) {
    await pg.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
    await ev('new Promise(r => setTimeout(r, 400))');
    const tag = W + 'x' + H + '-' + MODE;
    await ev(`(async()=>{ BK.manualSimulation = true; BK.SET.zoom = ${JSON.stringify(MODE)}; BK.SET.reduceMotion = false; BK.setHero('knight'); BK.reset({ fresh: true }); BK.god = true; BK.bossJump.go('skyhook'); let f = 0; for (; f < 1500 && !BK.bossActive; f++) { BK.P.inv = 99; BK.sim(1); if (f % 8 === 0) BK.step(1); } })()`);
    note.flag = await ev('(async()=>{ const m = await import("/src/skyhook2.js"); return m.SKY2; })()'); console.log('sky2 flag in page:', note.flag);
    if (PART === 'off') {
      // identical-stills scene: hero at a fixed spot, 400 sim frames, one still of the fight (deterministic seed); compare the sha between master and the branch
      await kit(`K.keysOff(); K.place(24*16, 48*16); K.run(400); return 1;`); await shot('off-' + tag + '-a'); await kit(`K.run(300); return 1;`); await shot('off-' + tag + '-b');
      continue;
    }
    await kit(`K.keysOff(); const S0=K.S(); K.place(S0.G.mid, S0.G.floorY); K.run(420); return 1;`);
    note.facts.push(['start', await kit('return K.info()')]);
    // ---- P1 stills
    if (PART === 'stills' || PART === 'all') {
      const P = async (label, setup, frames = 4, hx = null) => { const m = /K\.place\((.*?)\);/.exec(setup); const pre = m ? `{ const S=K.S(), e=K.e(); try { K.place(${m[1]}); } catch (x) {} K.run(60); }` : ''; const info = await kit(`${pre} ${setup}; K.run(${frames}); return K.info();`); await shot(tag + '-' + label, { info }); return info; };
      await P('p1-idle-crown', `const S=K.S(), e=K.e(); K.place(24*16,48*16); e.mode='perch'; S.restT=99; K.M.atCrown(e,S);`, 8);
      await P('p1-ride-sky-outofreach', `const S=K.S(), e=K.e(); e.mode='ride'; e.route='sky'; e.rideTo='E'; S.side='W'; K.M.hangOn(e,S,'sky',S.G.mid-40); K.place(S.G.mid*1,S.G.floorY);`, 6);
      await P('p1-ride-sky-lamp-points-sky', `const S=K.S(), e=K.e(); e.mode='ride'; e.route='sky'; K.M.hangOn(e,S,'sky',S.G.mid+30); K.place(S.G.levers[0].x+30,S.G.floorY);`, 4);
      await P('p1-hook-tell', `const S=K.S(), e=K.e(); K.M.atCrown(e,S); e.mode='hookTell'; e.modeT=0.5; e.target=BK.P; e.aimX=BK.P.x; e.aimY=BK.P.y-8;`, 10);
      await P('p1-drop-tell', `const S=K.S(), e=K.e(); K.M.hangOn(e,S,'sky',S.G.mid); e.mode='dropTell'; e.modeT=0.7; e.locked=true; e.lockX=e.x; K.place(e.x, S.G.floorY);`, 4);
      await P('p1-points-low-ride-low', `const S=K.S(), e=K.e(); S.points='LOW'; e.mode='ride'; e.route='low'; e.lowDir=1; S.onLow=0; S.lowVisit=1; K.M.hangOn(e,S,'low',S.G.mid-60);`, 6);
      await P('p1-rehook-tell', `const S=K.S(), e=K.e(); S.points='LOW'; e.mode='rehookTell'; e.modeT=0.9; K.M.hangOn(e,S,'low',S.G.mid-30); K.place(S.G.levers[0].x+24,S.G.floorY);`, 6);
      await P('p1-weight-lamp-low-ready', `const S=K.S(), e=K.e(); S.points='LOW'; e.mode='ride'; e.route='low'; K.M.hangOn(e,S,'low',S.G.mid+40); K.place(S.G.levers[1].x-24,S.G.floorY);`, 4);
      await P('p1-downed', `const S=K.S(), e=K.e(); e.mode='downed'; e.modeT=3; S.purse=e.maxHp*0.22; e.y=S.G.floorY; e.x=S.G.mid-30;`, 8);
      await P('p1-jarred', `const S=K.S(), e=K.e(); e.mode='jarred'; e.modeT=1; S.purse=e.maxHp*0.08; e.y=S.G.floorY; e.x=S.G.mid+30;`, 8);
      await P('p1-smashed', `const S=K.S(), e=K.e(); e.mode='smashed'; e.modeT=3; S.purse=e.maxHp*0.3; e.y=S.G.floorY; e.x=S.G.mid;`, 8);
      await P('p1-sweep-tell', `const S=K.S(), e=K.e(); e.mode='sweepTell'; e.modeT=0.6; e.y=S.G.floorY; e.x=S.G.mid; K.place(e.x+30,S.G.floorY);`, 4);
      // A1 and A2 in P1/P2 poses
      await P('a1-cw-tell-W', `const S=K.S(), e=K.e(); S.side='W'; K.M.atCrown(e,S); e.mode='cwTell'; e.modeT=0.85; K.place(S.G.feet.W.x+70, S.G.floorY);`, 3);
      await P('a1-cw-fall-W', `const S=K.S(), e=K.e(); S.side='W'; K.M.atCrown(e,S); e.mode='cw'; e.modeT=0.35; K.place(S.G.feet.W.x+60, S.G.floorY);`, 12);
      await P('a1-iron-step', `const S=K.S(), e=K.e(); K.place(S.G.feet.W.x+60, S.G.floorY); K.run(20); return K.info()`, 12);
      // P2
      await kit(`const S=K.S(), e=K.e(); e.hp = e.maxHp*0.64; K.M.atCrown(e,S); e.mode='perch'; S.restT=0; K.run(30); return 1`);
      await P('p2-phase-tell', `const S=K.S(), e=K.e(); e.mode='phaseTell'; e.modeT=1.2; S.ward=1.2; S.ph=2; K.M.atCrown(e,S);`, 3);
      await P('p2-cut-tell', `const S=K.S(), e=K.e(); S.ph=2; e.mode='cutTell'; e.modeT=1.2; S.side='W'; K.M.atCrown(e,S); K.place(S.G.feet.W.x+60, S.G.floorY);`, 4);
      await P('p2-swing-tell', `const S=K.S(), e=K.e(); S.ph=2; e.mode='swingTell'; e.modeT=0.7; S.side='W'; K.M.atCrown(e,S); K.place(S.G.mid, S.G.floorY);`, 4);
      await P('p2-swing', `const S=K.S(), e=K.e(); S.ph=2; e.mode='swing'; e.modeT=0.5; e.swFrom='W'; e.swTo='E'; S.side='W'; K.place(S.G.mid-120, S.G.floorY);`, 12);
      await P('p2-fray-tell', `const S=K.S(), e=K.e(); S.ph=2; S.points='LOW'; e.mode='frayTell'; e.modeT=1.2; K.M.hangOn(e,S,'low',S.G.mid); K.place(S.G.levers[1].x-20,S.G.floorY);`, 6);
      await P('p2-fray-cut-whip', `const S=K.S(), e=K.e(); S.ph=2; S.points='SKY'; S.lowCut=5; S.whip={t:0.05,key:'wpx'}; e.mode='swingBack'; e.modeT=0.5; e.bx0=S.G.mid; e.by0=S.G.lowY; e.climbTo='W'; K.place(S.G.mid-80,S.G.floorY);`, 4);
      await P('p2-low-locked-points-bar', `const S=K.S(), e=K.e(); S.ph=2; S.lowCut=4; K.M.atCrown(e,S); e.mode='perch'; S.restT=99; K.place(S.G.levers[0].x+24,S.G.floorY);`, 20);
      await P('a2-rivet-tell', `const S=K.S(), e=K.e(); S.ph=2; S.lowCut=0; K.M.atCrown(e,S); e.mode='rivetTell'; e.modeT=0.75; K.place(S.G.mid-40,S.G.floorY);`, 3);
      await P('a2-rivet-fall', `const S=K.S(), e=K.e(); K.M.atCrown(e,S); e.mode='rivet'; e.modeT=0.3; K.place(S.G.mid-40,S.G.floorY);`, 8);
      // P3
      await kit(`const S=K.S(), e=K.e(); e.hp = e.maxHp*0.34; S.ph=2; K.M.atCrown(e,S); e.mode='perch'; S.restT=0; K.run(30); return 1`);
      await P('p3-phase-tell', `const S=K.S(), e=K.e(); S.ph=3; e.mode='phaseTell'; e.modeT=1.2; S.ward=1.2; K.M.atCrown(e,S);`, 3);
      await P('p3-crane-lit-idle', `const S=K.S(), e=K.e(); S.ph=3; K.M.atCrown(e,S); e.mode='perch'; S.restT=99; S.craneT=0; K.place(S.G.mid-60,S.G.floorY);`, 10);
      // strike the CRANE for real: knight stands next to it and attacks
      await kit(`const S=K.S(), e=K.e(); S.ph=3; K.place(S.G.levers[2].x-18, S.G.floorY); BK.P.face=1; BK.press('atk'); K.run(10); return K.info()`);
      await shot(tag + '-p3-crane-struck-tell', { info: await kit('return K.info()') });
      await kit(`K.run(50); return 1`); await shot(tag + '-p3-skip-sweeping', { info: await kit('return K.info()') });
      await kit(`K.run(40); return 1`); await shot(tag + '-p3-skip-after', { info: await kit('return K.info()') });
      await P('p3-cooling-struck-again', `const S=K.S(); K.place(S.G.levers[2].x-18, S.G.floorY); BK.P.face=1; BK.press('atk');`, 10);
      // enrage
      await P('enrage-tell', `const S=K.S(), e=K.e(); S.ph=3; S.craneT=0; K.M.atCrown(e,S); e.mode='enrageTell'; e.modeT=1.3; S.ward=1.3; S.enraged=false; K.place(S.G.mid-60,S.G.floorY);`, 3);
      await kit(`const S=K.S(), e=K.e(); S.enraged=true; S.skip.cycle=0.6; K.M.atCrown(e,S); e.mode='perch'; S.restT=99; K.place(S.G.mid-90,S.G.floorY); K.run(5); return 1`);
      for (let i = 0; i < 5; i++) { await kit(`K.run(${i === 0 ? 20 : 25}); return 1`); await shot(tag + '-enraged-runaway-' + i, { info: await kit('return K.info()') }); }
      await kit(`const S=K.S(), e=K.e(); S.craneT=0; K.place(S.G.levers[2].x-18, S.G.floorY); BK.P.face=1; BK.press('atk'); K.run(10); return 1`); await shot(tag + '-enraged-crane-pause', { info: await kit('return K.info()') });
      // OUT OF REACH first-hit tip: hit him at a crown with a ranged blow
      await kit(`const S=K.S(), e=K.e(); S.ph=1; S.enraged=false; K.M.atCrown(e,S); e.mode='perch'; S.restT=99; return 1`);
    }
    if (PART === 'attacks' || PART === 'all') {
      // the real scheduler picks the attack (counters set so it is next); stills at the tell, the release, and after
      const seq = async (label, setup, wantRe, offsets, o = {}) => {
        await kit(`const S=K.S(), e=K.e(); ${setup}; return 1`);
        const got = await kit(`const re = new RegExp(${JSON.stringify(wantRe)}); let f = 0; for (; f < 900 && !re.test(K.e().mode); f++) K.run(1); return { f, mode: K.e().mode };`);
        note.facts.push([label + ' reached', got]);
        let at = 0;
        for (const off of offsets) { await kit(`K.run(${off - at}); return 1`); at = off; await shot(tag + '-' + label + '-t' + String(off).padStart(3, '0'), { info: await kit('return K.info()'), extra: await kit(o.read || 'return null') }); }
      };
      const base = (ph = 1) => `S.ph = ${ph}; K.M.atCrown(e,S); e.mode='perch'; S.restT=0; S.sinceRide=0; S.sinceSwing=0; S.sinceRivet=0; S.sinceCw=0; S.craneT=0; S.points='SKY'; S.lowCut=0;`;
      await kit(`const S=K.S(), e=K.e(); e.hp=e.maxHp*0.9; K.place(S.G.mid-40, S.G.floorY); K.run(40); return 1`);
      await seq('A1-counterweight', base() + `S.sinceCw=K.M.SK.cw.every-1;`, '^cwTell$', [6, 30, 52, 62, 75, 90, 110, 150, 240], { read: 'return { cw: K.S().cw && JSON.parse(JSON.stringify(K.S().cw)) }' });
      await seq('A2-rivet', base(2) + `S.sinceRivet=K.M.SK.rivet.every-1; e.hp=e.maxHp*0.6;`, '^rivetTell$', [5, 30, 50, 62, 70, 85, 110], { read: 'return { rivets: K.S().rivets.length }' });
      await seq('P2-cutter-swing', base(2) + `S.sinceSwing=9; S.sinceRide=-9; e.hp=e.maxHp*0.6;`, '^(swingTell|cutTell)$', [5, 30, 60, 75, 90, 110], {});
    }
    if (PART === 'crane' || PART === 'all') {
      await kit(`const S=K.S(), e=K.e(); e.hp=e.maxHp*0.3; S.ph=3; K.M.atCrown(e,S); e.mode='perch'; S.restT=99; S.craneT=0; S.enraged=false; K.place(S.G.levers[2].x-18, S.G.floorY); K.run(70); return 1`);
      await kit(`BK.P.face=1; BK.press('atk'); K.run(2); return 1`);
      const sk = 'const S=K.S(); return { ...K.info(), skip: S.skip && { st: S.skip.st, t: +S.skip.t.toFixed(2), dir: S.skip.dir } }';
      let at = 2; for (const off of [6, 20, 36, 52, 66, 80, 92, 110, 150, 200]) { await kit(`K.run(${off - at}); return 1`); at = off; await shot(tag + '-crane-t' + String(off).padStart(3, '0'), { info: await kit(sk) }); }
      await kit(`const S=K.S(), e=K.e(); S.enraged=true; S.skip.cycle=0.3; S.skip.st='rest'; K.M.atCrown(e,S); e.mode='perch'; S.restT=99; K.place(S.G.mid-90, S.G.floorY); K.run(5); return 1`);
      at = 0; for (const off of [20, 40, 55, 70, 85, 100, 120, 140]) { await kit(`K.run(${off - at}); return 1`); at = off; await shot(tag + '-runaway-t' + String(off).padStart(3, '0'), { info: await kit(sk) }); }
    }
  }
  // ---- console errors
  note.errors = pg.errors.slice(0, 10);
} finally { writeFileSync(join(OUT, 'note-' + PART + '.json'), JSON.stringify(note, null, 1)); console.log(JSON.stringify(note.facts.slice(0, 4)), 'shots', note.shots.length, 'errors', JSON.stringify(pg.errors.slice(0, 5))); await pg.close(); }
