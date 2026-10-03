// tools/welltown-polish-shots.mjs - THE WELL TOWN's polish pictures (claude/welltown-polish): the Gang Leader's new courtyard (the market square), the Kasbah's garrison
// courtyard, the venom HUD icon, and the Cistern Queen's poses. Not in the suite: god mode, pictures not a playtest.
//   node tools/welltown-polish-shots.mjs <tag> [courtyard|hud|queen|all]   -> work/claude/welltown-polish/<tag>/*.png (2x frames from the game's own canvas)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'after', what = process.argv[3] || 'all';
const out = join(ROOT, 'work/claude/welltown-polish', tag); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const res = []; const what = ${JSON.stringify(what)}, want = k => what === 'all' || what === k;
    BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true });
    const fi = LEVELS.findIndex(l => l.id === 'welltown'); const fresh = () => { BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(4); };
    const snap = name => { const c = document.createElement('canvas'); c.width = BK.view.VW * 2; c.height = BK.view.VH * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    const zoom = (name, x, y, w, h, k) => { const c = document.createElement('canvas'); c.width = w * k; c.height = h * k; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, x, y, w, h, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    const run = n => { for (let i = 0; i < n; i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
    const until = (pred, max = 1800) => { for (let i = 0; i < max && !pred(); i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); } BK.step(1); };
    if (want('courtyard')) {
      BK.SET.hud = 'minimal';
      fresh(); BK.tp(148, 25); run(60); BK.look && BK.look(148, 25); snap('1-square-door-and-checkpoint');
      fresh(); for (const e of BK.enemies()) if (e.t !== 'gangleader') e.alive = false; const M = BK.L.mini; BK.tp(Math.round(M.trigger / 16) + 2, Math.round(M.floor / 16) - 1); run(90); snap('2-gang-leader-wakes-in-the-square');
      const gl = BK.enemies().find(e => e.t === 'gangleader'); until(() => gl.mode === 'throwTell'); snap('3-gang-leader-bottle-over-the-well');
      until(() => gl.mode === 'whirlTell'); snap('4-gang-leader-whirl');
      BK.tp(177, 25); run(10); BK.P.face = -1; BK.press('atk'); run(14); snap('5-windlass-fouled');
      fresh(); BK.tp(492, 27); run(100); BK.tp(492, 27); BK.look(492, 27); snap('6-kasbah-courtyard-garrison');
      fresh(); BK.tp(468, 27); run(100); BK.tp(468, 27); BK.look(468, 27); snap('7-kasbah-courtyard-door');
    }
    if (want('hud')) {
      BK.SET.hud = 'normal'; fresh(); BK.tp(12, 29); run(40);
      snap('hud-0-clean'); zoom('hud-0z-clean', 0, 0, 130, 40, 6);
      BK.P.cqVenom = [6]; BK.P.venomSlow = 0.75; BK.P.venomT = 1.2; BK.step(1); snap('hud-1-one-stack'); zoom('hud-1z-one-stack', 0, 0, 130, 40, 6);
      BK.P.cqVenom = [6, 3.5, 1.2]; BK.P.venomSlow = 0.25; BK.P.venomT = 1.2; BK.step(1); snap('hud-3-three-stacks'); zoom('hud-3z-three-stacks-mixed', 0, 0, 130, 40, 6);
      BK.P.cqVenom = []; BK.P.venomT = 1.5; BK.P.venomSlow = 1; BK.step(1); snap('hud-2-plain-poison'); zoom('hud-2z-plain-poison', 0, 0, 130, 40, 6);
    }
    if (want('queen')) {
      BK.SET.hud = 'minimal'; fresh();
      for (const e of BK.enemies()) if (e.t !== 'gangleader' && e.t !== 'cisternqueen') e.alive = false;
      const A = BK.L.arena; BK.tp(A.start[0], A.start[1]); run(40); snap('q01-wakes');
      const q = BK.boss, S = () => BK.cisternQueenHands().show();
      until(() => q.mode === 'walk'); run(20); snap('q02-guard');
      const tell = (mode, name, max = 2400, extra = 8) => { until(() => q.mode === mode, max); run(extra); snap(name); };
      tell('lanceTell', 'q03-tail-lance-told'); tell('pincerTell', 'q04-pincer-told', 2400, 4); tell('snapTell', 'q05-snap-told', 2400, 4);
      until(() => q.mode === 'burrow'); run(30); BK.P.skin.sips = 3; run(2); snap('q06-burrowed-mound');
      until(() => q.mode === 'strikeTell' || q.mode === 'chargeTell'); run(8); snap('q07-strike-told');
      q.open = 3; q.mode = 'soaked'; q.modeT = 3; run(6); snap('q08-soaked');
      q.hp = Math.round(q.maxHp * 0.6); until(() => S().pose === 'wall' && q.mode === 'cling', 2400); run(4); snap('q09-on-the-wall');
      tell('spitTell', 'q10-venom-spit-told', 2400, 4); tell('sweepLowTell', 'q11-sweep-low-told', 2400, 10); tell('sweepHighTell', 'q12-sweep-high-told', 2400, 10);
      tell('pounceTell', 'q13-pounce-shadow', 3600, 20); tell('pinTell', 'q14-stinger-pin-told', 2400, 6);
      q.open = 3; q.mode = 'fallen'; q.modeT = 3; run(6); snap('q15-on-her-back');
      q.hp = Math.round(q.maxHp * 0.3); until(() => S().flood && S().water > 15, 2400); run(30); snap('q16-flood');
      tell('grabTell', 'q17-grab-told', 2400, 10); tell('rollTell', 'q18-death-roll-told', 2400, 6); tell('tidalTell', 'q19-tidal-tail-told', 2400, 6);
      q.open = 3; q.mode = 'rear'; q.modeT = 3; run(6); snap('q20-rearing-open');
    }
    return res; })()`, 900000);
  for (const [name, d] of r) { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('work/claude/welltown-polish/' + tag + '/' + name + '.png'); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
