// tools/church3art-shots.mjs - LIT CHURCH 3's art pictures (claude/church3art). Not in the suite. god mode, a picture not a playtest.
//   usage: PORT=8745 node tools/church3art-shots.mjs [name-filter,...]   -> work/claude/church3-art/*.png (the game's own canvas, 2x)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const filt = process.argv[2] || '', out = join(ROOT, 'work/claude/church3-art'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: true });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const res = []; const filt = ${JSON.stringify(filt)}, want = n => !filt || filt.split(',').some(f => n.includes(f));
    BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true });
    const fi = LEVELS.findIndex(l => l.id === 'church'); const fresh = () => { BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(4); };
    const snap = name => { const c = document.createElement('canvas'); c.width = BK.view.VW * 2; c.height = BK.view.VH * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    const run = n => { for (let i = 0; i < n; i++) { BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
    const at = (name, x, y, f, ly) => { if (!want(name)) return; fresh(); BK.tp(x, y); run(20); if (f) f(); BK.look(x, ly == null ? y : ly); run(6); snap(name); };
    /* the foes in the ossuary and the crypt altar */
    at('f01-ossuary-undead', 84, 53); at('f02-ossuary-priest', 90, 53); at('f03-altar-paladin', 156, 53);
    /* the sanctuary: the braziers in three states, the fight (modes forced one frame at a time: a picture, not a playtest) */
    const fight = (name, f, o = {}) => { if (!want(name)) return; fresh(); const A = BK.L.arena; BK.tp(A.start[0], A.start[1]); run(150); const K = BK.litChurchHands().state(), ar = K.lamps.filter(l => l.room === 'sanctuary'), H = BK.paladinHands(), S = H.show(), e = BK.boss;
      const od = H.drawOver; H.drawOver = (g, cx, cy, t) => { window.__t = t; return od(g, cx, cy, t); };
      BK.step(1); const T = window.__t || 0; if (o.tp) BK.tp(o.tp[0], o.tp[1]);
      if (f) f({ ar, K, H, S, e, T, A }); BK.look(o.lookAbs ? A.x0 / 16 + 21 : e.x / 16 - 6, A.start[1]); BK.step(1); snap(name); H.drawOver = od; };
    fight('s01-sanctuary-start', ({ e }) => { });
    fight('s02-braziers-dark-lit-snuffed', ({ ar, e }) => { ar[0].lit = true; ar[1].lit = false; ar[1].snuffed = true; ar[2].lit = false; e.x = 700; }, { look: [ 0 ], lookAbs: 1 });
    fight('s03-ward', ({ e, S }) => { e.mode = 'guard'; e.modeT = 9; S.conv = 3.4; });
    fight('s04-smite-windup', ({ e, S }) => { e.mode = 'smiteTell'; e.modeT = 0.2; S.conv = 2.2; });
    fight('s05-radiance-windup', ({ e, S }) => { e.mode = 'radianceTell'; e.modeT = 0.5; S.conv = 4.6; });
    fight('s06-falter-ward-broken', ({ e, S, T }) => { e.mode = 'falter'; e.open = 3; e.modeT = 3; S.broke = { t: T - 0.25, bx: e.x - 70, ex: e.x, ey: e.y }; S.conv = 1; });
    fight('s07-prayer-at-brazier', ({ e, S, ar }) => { ar[1].lit = true; e.mode = 'pray'; e.modeT = 4; S.kneelId = 'arena1'; e.x = (S.G.lamps.find(q => q.id === 'arena1').x) + 14; S.conv = 2; });
    fight('s08-snuff-windup', ({ e, S, ar }) => { ar[1].lit = true; e.mode = 'snuffTell'; e.modeT = 0.4; S.snuffId = 'arena1'; e.x = (S.G.lamps.find(q => q.id === 'arena1').x) + 22; S.conv = 2; });
    fight('s09-verdict', ({ e, S, A }) => { e.mode = 'verdictTell'; e.modeT = 3; S.sigils = [{ x: e.x - 50 }, { x: e.x - 90 }]; S.conv = 4; });
    fight('s10-dawn', ({ e, S }) => { e.mode = 'dawnTell'; e.modeT = 0.5; S.leap = { x: e.x - 80, fx: e.x }; S.conv = 3; });
    /* the Deacon: his crossing - the douse, a doused lamp, the dark's grates */
    const mini = (name, f) => { if (!want(name)) return; fresh(); const A = BK.L.mini; BK.tp(A.start ? A.start[0] : A.x0 / 16 + 3, A.start ? A.start[1] : A.floor / 16 - 1); run(120); const K = BK.litChurchHands().state(), H = BK.deaconHands(), S = H.show(), e = BK.enemies().find(q => q.t === 'deacon');
      if (f) f({ K, H, S, e, A }); BK.look((e ? e.x : A.x0) / 16 - 3, (A.floor / 16) - 4); BK.step(1); snap(name); };
    mini('d01-deacon-arena', ({ }) => { });
    mini('d02-douse-windup', ({ K, S, e }) => { const dl = K.lamps.filter(l => l.deacon && !l.hang); S.douseId = dl[0].id; e.mode = 'douseTell'; e.modeT = 0.5; e.x = dl[0].x * 16 - 40; e.face = 1; });
    mini('d03-douse-release', ({ K, S, e }) => { const dl = K.lamps.filter(l => l.deacon && !l.hang); S.douseId = dl[0].id; dl[0].lit = false; dl[0].doused = true; e.mode = 'douse'; e.modeT = 0.25; e.x = dl[0].x * 16 - 40; e.face = 1; });
    mini('d04-dark-grates', ({ K, S, e }) => { for (const l of K.lamps.filter(l => l.deacon)) { l.lit = false; l.doused = !l.hang; } for (const g of K.grates) { g.glow = 1; g.k = 0.7; } e.mode = 'grope'; e.modeT = 9; e.x = e.x - 60; });
    res.push(['dbg', 'a,' + btoa(String(window.__lcerr) + ' ' + (BK.L.arena && JSON.stringify(BK.L.arena.start)))]); return res; })()`, 900000);
  for (const [name, d] of r) { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('work/claude/church3-art/' + name + '.png'); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
