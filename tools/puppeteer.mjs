// tools/puppeteer.mjs - THE PUPPETEER, the Maskwright's Theatre's boss (claude/puppeteer; PUPPETEER2 after Daniel played it). src/puppeteer.js is the
// fight (its header is the design). Every rule below was proved red first on a sabotaged copy of the module (the lane report lists the sabotages).
// PURE (src/puppeteer.js, no page):
//   - THE GLOW: a windup's strings are taut only for its LAST PUP.glowT s - a swing before the gold cuts nothing; in the gold it cuts one string and
//     CANCELS the blow; the second cut drops it in a heap; a HALF-CUT puppet RE-TIES after PUP.retieT s unless it is finished
//   - THE GREY DECOY (from the second act): never gold; a swing that cuts nothing real and crosses it springs it (the hands snare you); a swing that cuts
//     a real string does not
//   - EVERY CYCLE CHANGES: the pairings (Soldier+Harlequin, Harlequin+Acrobat, all three); a puppet that comes back re-strung has one more move (the
//     thrust, the high kick, the swing never fire in the first act and do later); a told SCENE CHANGE (at least PUP.sceneT s before a board moves)
//     lays a new layout - flats as ledges, trapdoors opened - and no two cycles in a row share a layout; a trapdoor with a hero in its pit waits
//   - A PAIR: a high blow and a low one told together, the low landing PUP.pairGap s after the high; a hero who ducks the one and jumps the other
//     takes nothing (answerable, never a sure hit); a cut in either cancels only that one
//   - HE FIGHTS TOO: the sandbag, the spotlight and the scenery, each told its full time before it lands; none begins over a puppet's windup, and no
//     puppet begins over his; a hero standing where the spotlight settles is dazzled and one who stepped out is not
//   - THE NUMBERS: the re-string window 1.8 s, the fall 3 s, the chip x0.05, the blows harder than the first build; every attack fires (rule A3) and
//     wears its mark, answer and height
//   - THE OPENINGS ARE CAUSED: a minute left alone opens nothing; all cut down, he comes down and re-strings, open; the lowering string can be cut;
//     phase 2 frees the counterweight (locked before), the batten rises and returns, the loft re-string; the bands; the snare; phase 3's masterpiece,
//     its fall dragging him down, open
// THE STAGE: the standalone level holds the arena (walls, trigger past the door, a checkpoint outside, ~40 wide, the gallery, the batten, all three
//   puppets, his music)
// IN THE PAGE: the fight wakes; a body blow does nothing; a real swing in the glow cuts one string and staggers it; a blow on him working is warded; both
//   cut down he comes down open; the gallery wears the iron grating; a scene change lays its flats and trapdoors into the grid, and a fresh attempt
//   puts the boards back; the pin rail frees the batten in phase 2; his death ends the fight and brings the curtain down.
//   node tools/puppeteer.mjs        (PORT from tools/ports.mjs)
import { openPage } from './cdp.mjs';
import * as M from '../src/puppeteer.js';
import { MARK, ANSWER, HEIGHT } from '../src/marks.js';
import { LEVELS } from '../src/level.js';

const bad = [], ok = (c, m) => { if (!c) bad.push(m); };
const DT = 1 / 60, TS = 16, R = 20, SX = 14, FLOOR = R * TS, GAL = (R - 9) * TS;
const A = { x0: (SX + 1) * TS, x1: (SX + 39) * TS, floor: FLOOR, gallery: GAL, gx0: (SX + 3) * TS, gx1: (SX + 39) * TS, sx: SX, TS, y0: (R - 15) * TS };
/* a show and a world. o.quiet: his own blows never come (so a puppet test is only the puppets). `log` counts what the world was asked to do */
function rig(o = {}) {
  const show = M.newShow(A), e = M.newPuppeteer({ t: 'puppeteer', x: o.bx ?? (SX + 30) * TS, y: GAL, hp: o.hp ?? 720, maxHp: 720, alive: true });
  e.mode = 'work'; e.modeT = 0; if (o.quiet) e.actCd = 1e9;
  if (o.cycle) show.cycle = o.cycle;
  const mk = (t, x) => M.newPuppet({ t, x, y: FLOOR, alive: true, face: -1, hp: 999, maxHp: 999 }, show);
  const sol = mk('marionette', o.sx ?? 420), har = mk('harlequin', o.hx ?? 520), acr = mk('acrobat', o.ax ?? 470);
  for (const p of [sol, har, acr]) { if (p.alive) p.seen = true; if (o.lvl) p.lvl = o.lvl; if (o.decoy) p.decoy = true; }
  if (o.noSoldier) { sol.alive = false; sol.mode = 'packed'; } if (o.noHarlequin) { har.alive = false; har.mode = 'packed'; }
  const hero = { x: o.x ?? 380, y: FLOOR, face: 1, alive: true, ground: true, duck: false };
  const log = { hits: [], bands: [], snares: 0, dazzles: 0, lines: [], summons: 0, tiles: [], events: {}, hurt: 0 };
  /* a hero's box as he stands: ducked (8 tall), standing (16), or in the air */
  const heroBox = (duck) => ({ l: hero.x - 5, r: hero.x + 5, t: hero.y - (duck && hero.duck ? 8 : 16), b: hero.y });
  const c = { heroes: [hero], say: () => {}, sound: () => {}, number: (x, y, t) => log.lines.push(t),
    hit: (box, d, name, opt = {}) => { const hb = heroBox(opt.duck), took = hb.l < box[1] && hb.r > box[0] && hb.t < box[3] && hb.b > box[2]; log.hits.push({ box, d, name, opt, took }); if (took) log.hurt += d; },
    band: (kind, fy, x0, x1, d, name, key) => log.bands.push({ kind, fy, x0, x1, d, name, key }),
    snare: () => log.snares++, dazzle: () => log.dazzles++, tile: (x, y, t) => log.tiles.push({ x, y, t }), pack: p => { p.alive = false; },
    summon: (t, x, y) => { log.summons++; const p = { t, x, y, alive: true, face: -1, hp: 999, maxHp: 999 }; M.newPuppet(p, show); return null; } };
  const step = () => { hero.lastFloor = M.heroFloor(show, { ...hero, lastFloor: hero.lastFloor }); const ev = M.stepShow(e, show, DT, c); for (const v of ev) log.events[v.t] = (log.events[v.t] || 0) + 1; return ev; };
  const swingAt = (px, py, face = 1) => M.strikeStrings(e, show, face > 0 ? { l: px + 2, r: px + 26, t: py - 22, b: py } : { l: px - 26, r: px - 2, t: py - 22, b: py }, new Set());
  return { show, e, sol, har, acr, hero, log, c, step, swingAt };
}
const until = (r, pred, n = 600) => { for (let i = 0; i < n; i++) { if (pred()) return true; r.step(); } return pred(); };

// ---- THE GLOW: slack before its last glowT s, gold in it; a cut cancels; the second heaps ----
{ const r = rig({ noHarlequin: true, x: 390, sx: 410, quiet: true }); const s = r.sol;
  ok(until(r, () => s.mode === 'chopTell', 600), 'the soldier never wound up its chop at a hero 20 px away (mode ' + s.mode + ')');
  ok(!M.pupTaut(s) && s.modeT > M.PUP.glowT, 'the chop\'s strings are gold from the start of its windup (the glow must come only at its end)');
  ok(r.swingAt(r.hero.x, FLOOR).length === 0, 'a swing before the gold cut a string');
  ok(until(r, () => s.modeT <= M.PUP.glowT, 120) && M.pupTaut(s), 'the chop\'s strings never turned gold in its last ' + M.PUP.glowT + ' s');
  const c1 = r.swingAt(r.hero.x, FLOOR); ok(c1.length === 1, 'a swing through both hands in the gold cut ' + c1.length + ' strings (one a swing)');
  r.step(); ok(s.mode === 'stagger' && r.log.events.cancel === 1, 'the cut in the gold did not cancel the chop (mode ' + s.mode + ')');
  for (let i = 0; i < 40; i++) r.step(); ok(!r.log.hits.some(h => h.name === 'THE SOLDIER'), 'the cancelled chop landed anyway');
  ok(until(r, () => M.pupTaut(s) && /Tell$/.test(s.mode), 60 * 3) && M.stringsLeft(s) === 1, 'the half-cut soldier did not come into the gold again before its string re-tied');
  r.swingAt(r.hero.x, FLOOR); for (let i = 0; i < 10; i++) r.step();
  ok(M.heaped(s), 'two strings cut and the soldier is not in a heap (' + s.mode + ')'); }
// ---- THE RE-TIE: a half-cut puppet left alone ties itself back ----
{ const r = rig({ noHarlequin: true, x: 200, sx: 600, quiet: true }); const s = r.sol; s.str[0].cut = true; s.str[0].retie = M.PUP.retieT;
  let t = 0; while (M.stringsLeft(s) < 2 && t < 60 * 6) { r.step(); t++; }
  ok(M.stringsLeft(s) === 2 && Math.abs(t * DT - M.PUP.retieT) < 0.1 && r.show.n.retie === 1, 'a half-cut puppet did not re-tie its string after ' + M.PUP.retieT + ' s (' + (t * DT).toFixed(2) + ' s)'); }
// ---- THE GREY DECOY ----
{ const r = rig({ noHarlequin: true, x: 390, sx: 410, quiet: true, cycle: 1, decoy: true }); const s = r.sol; s.alive = true; s.mode = 'hang';
  const d = M.stringsOf(r.e, r.show).find(q => q.decoy); ok(d && !d.taut, 'the soldier of the second act has no grey decoy string, or it glows');
  ok(until(r, () => s.mode === 'chopTell', 600), 'no windup to test the decoy on');
  const early = r.swingAt(r.hero.x, FLOOR); ok(early.length === 0 && early.decoy === s, 'a swing before the gold that crossed the decoy did not spring it');
  until(r, () => s.modeT <= M.PUP.glowT, 120); const real = r.swingAt(r.hero.x, FLOOR);
  ok(real.length === 1 && !real.decoy, 'a swing that cut a real string also sprang the decoy (' + JSON.stringify({ n: real.length, d: !!real.decoy }) + ')'); }
// ---- EVERY CYCLE CHANGES: pairings, a new move each, a told scene change, a new layout ----
{ const r = rig({ quiet: true, x: 250 }); let scenes = [], tellAt = -1, laidAt = -1, lineups = [];
  const lineup = () => r.show.puppets.filter(p => p.t !== 'masterpiece' && p.mode !== 'packed').map(p => p.t).sort().join('+');
  lineups.push(lineup());
  for (let cyc = 0; cyc < 4; cyc++) {
    for (const p of r.show.puppets) if (p.t !== 'masterpiece' && p.mode !== 'packed' && p.alive) for (const st of p.str) st.cut = true;
    let f = 0; while (r.e.mode !== 'scene' && f < 60 * 12) { r.step(); f++; if (r.e.mode === 'descendTell') r.e.modeT = Math.min(r.e.modeT, 0.02); }
    tellAt = f; const from = r.show.scene, to = r.show.nextScene; const n0 = r.log.tiles.length; let g = 0;
    while (r.log.tiles.length === n0 && g < 60 * 4) { r.step(); g++; }
    laidAt = g; scenes.push([from, to]);
    ok(g * DT >= M.PUP.sceneT - 0.05, 'cycle ' + cyc + ': the boards moved ' + (g * DT).toFixed(2) + ' s after the scene change was told (told ' + M.PUP.sceneT + ' s)');
    ok(from !== to, 'cycle ' + cyc + ': the scene did not change (' + from + ' to ' + to + ')');
    const S1 = M.SCENES[to], laid = r.log.tiles.slice(n0);
    ok(S1.flats.every(([x0, x1, h]) => laid.some(o => o.t === 'ledge' && o.x === SX + x0 && o.y === R - h)) && S1.traps.every(([x0]) => laid.some(o => o.t === 'air' && o.x === SX + x0 && o.y === R)), 'cycle ' + cyc + ': the scene ' + S1.name + ' did not lay its flats and trapdoors');
    for (let i = 0; i < 90; i++) r.step(); lineups.push(lineup()); }
  ok(lineups[0] === 'harlequin+marionette' && lineups[1] === 'acrobat+harlequin' && lineups[2] === 'acrobat+harlequin+marionette', 'the pairings are not Soldier+Harlequin, Harlequin+Acrobat, all three: ' + lineups.join(' / '));
  const lv = t => r.show.puppets.find(p => p.t === t).lvl;
  ok(lv('harlequin') >= 2 && lv('marionette') >= 1 && lv('acrobat') >= 1, 'a puppet that came back re-strung did not learn a move: levels ' + ['marionette', 'harlequin', 'acrobat'].map(t => t + ' ' + lv(t)).join(', '));
  for (let i = 1; i < scenes.length; i++) ok(scenes[i][1] !== scenes[i - 1][1], 'two cycles in a row played on the same layout (' + scenes.map(q => q[1]).join(',') + ')'); }
{ const r = rig({ quiet: true, x: 250 }); let hi = 0; for (let i = 0; i < 60 * 40; i++) { r.hero.x = 380 + 60 * Math.sin(i / 90); r.step(); }
  ok(!r.show.n.thrust && !r.show.n.kick && !r.show.n.swing, 'a high move (thrust, kick, swing) fired in the first act, before any puppet came back re-strung'); }
// ---- A TRAPDOOR WITH A HERO IN ITS PIT WAITS ----
{ const r = rig({ quiet: true }); r.show.scene = 1; r.show.nextScene = 2; r.e.mode = 'scene'; r.e.modeT = 0.01; const tx = SX + M.SCENES[1].traps[0][0];
  r.hero.x = tx * TS + 8; r.hero.y = FLOOR + 32; r.step();
  ok(!r.log.tiles.some(o => o.x === tx && o.t === 'floor') && r.show.deferred.some(o => o.x === tx), 'a trapdoor closed on a hero standing in its pit');
  r.hero.x = 200; r.hero.y = FLOOR; r.step(); ok(r.log.tiles.some(o => o.x === tx && o.t === 'floor'), 'the trapdoor never closed once its pit was empty'); }
// ---- A PAIR: told together, the low PUP.pairGap after the high; ducking then jumping takes nothing; a cut cancels only its own ----
{ const run = (answer) => { const r = rig({ quiet: true, x: 470, sx: 440, hx: 500, lvl: 1, noSoldier: false, cycle: 2 });
    for (const p of [r.sol, r.har, r.acr]) { p.alive = true; p.mode = 'hang'; p.lvl = 1; } r.acr.alive = false; r.acr.mode = 'packed';
    r.show.turns = M.PUP.pairEvery - 1; r.show.gap = 0; let pairAt = -1, hiAt = -1, loAt = -1, f = 0;
    for (; f < 60 * 8 && !(loAt >= 0 && f > loAt + 5); f++) {
      const ev = r.step(); for (const v of ev) { if (v.t === 'pair' && pairAt < 0) pairAt = f; if (v.pair && M.MOVES[v.t] && M.MOVES[v.t].h === 'high') hiAt = f; if (v.pair && M.MOVES[v.t] && M.MOVES[v.t].h === 'low') loAt = f; }
      if (pairAt >= 0 && answer === 'answer') { const hp = [r.sol, r.har].find(p => /Tell$/.test(p.mode) && M.MOVES[p.mode.slice(0, -4)] && M.MOVES[p.mode.slice(0, -4)].h === 'high'), lp = [r.sol, r.har].find(p => /Tell$/.test(p.mode) && M.MOVES[p.mode.slice(0, -4)] && M.MOVES[p.mode.slice(0, -4)].h === 'low');
        r.hero.duck = !!hp && hp.modeT < 0.15; r.hero.y = lp && !hp && lp.modeT < 0.2 ? FLOOR - 30 : FLOOR; }
      if (pairAt >= 0 && answer === 'cut' && f === pairAt + 1) { const hp = [r.sol, r.har].find(p => /Tell$/.test(p.mode) && M.MOVES[p.mode.slice(0, -4)].h === 'high'); if (hp) { while (hp.modeT > M.PUP.glowT) r.step(); hp.str[0].cut = true; hp.str[0].retie = M.PUP.retieT; } } }
    return { r, pairAt, hiAt, loAt }; };
  const a = run('answer');
  ok(a.pairAt >= 0, 'a Soldier and a Harlequin that know a high and a low move never paired');
  ok(a.hiAt > 0 && a.loAt > a.hiAt && Math.abs((a.loAt - a.hiAt) * DT - M.PUP.pairGap) < 0.06, 'the pair\'s low blow did not land ' + M.PUP.pairGap + ' s after its high one (' + ((a.loAt - a.hiAt) * DT).toFixed(2) + ' s)');
  ok(a.r.log.hurt === 0, 'a hero who ducked the high blow and jumped the low one was still hit (' + a.r.log.hurt + '): the pair is not answerable');
  const b = run('none'); ok(b.r.log.hurt > 0, 'a hero who stood still through a pair was not hit: the test hits nothing');
  const c = run('cut'); ok(c.hiAt < 0 && c.loAt > 0, 'a cut in the high blow\'s glow did not cancel only it (high landed ' + (c.hiAt >= 0) + ', low landed ' + (c.loAt >= 0) + ')'); }
// ---- HE FIGHTS TOO: each told its full time, never over a puppet's windup ----
{ const r = rig({ x: 300 }); const told = {}, landed = {}; let overlap = 0, wasBusy = false;
  let seed = 3; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 60 * 90; i++) { if (i % 120 === 0) r.hero.x = A.x0 + 40 + rnd() * (A.x1 - A.x0 - 80);
    const ev = r.step(); for (const v of ev) { if (['sandbagTell', 'spotTell', 'sceneryTell'].includes(v.t)) told[v.t.slice(0, -4)] = i; if (['sandbag', 'spot', 'scenery'].includes(v.t) && told[v.t] !== undefined) landed[v.t] = Math.max(landed[v.t] || 0, (i - told[v.t]) * DT); }
    const busy = [r.sol, r.har].some(p => p.alive && (/Tell$/.test(p.mode) || ['chop', 'spin', 'drop', 'thrust', 'kick', 'swing'].includes(p.mode)));
    if (/^(sandbag|spot|scenery)Tell$/.test(r.e.mode) && [r.sol, r.har].some(p => p.alive && /Tell$/.test(p.mode) && p.tellLen - p.modeT < DT * 1.5)) overlap++;   /* a puppet began over his */
    if (ev.some(v => ['sandbagTell', 'spotTell', 'sceneryTell'].includes(v.t)) && wasBusy) overlap++;   /* he began over a puppet's */
    wasBusy = busy;
    for (const p of [r.sol, r.har]) if (p.alive && p.mode !== 'heap' && M.stringsLeft(p) < 2 && M.stringsLeft(p) > 0) { for (const s of p.str) s.cut = false; } }
  for (const k of ['sandbag', 'spot', 'scenery']) ok(landed[k] >= M.PUP[k + 'Tell'] - 0.03, 'his ' + k + ' never landed after its full told time (' + (landed[k] || 0).toFixed(2) + ' s)');
  ok(overlap === 0, 'a puppet began a windup over one of his own told blows (' + overlap + ' frames)'); }
{ for (const stay of [true, false]) { const r = rig({ x: 300, noHarlequin: true }); r.sol.x = 700; r.e.actN = 1; r.e.actCd = 0;
    for (let i = 0; i < 5 && r.e.mode !== 'spotTell'; i++) r.step(); ok(r.e.mode === 'spotTell', 'the spotlight was never told');
    for (let i = 0; i < 80; i++) { if (!stay && r.e.modeT < 0.5) r.hero.x = 380; r.step(); }
    ok(stay ? r.log.dazzles === 1 : r.log.dazzles === 0, stay ? 'a hero standing where the spotlight settled was not dazzled' : 'a hero who stepped out of the spotlight was dazzled'); } }
// ---- THE NUMBERS, the marks, and every attack fires (A3) ----
ok(M.PUP.restringT === 1.8 && M.PUP.loftRestringT === 1.8 && M.PUP.fallT === 3.0 && M.PUP.ward === 0.05, 'the tightened numbers moved: restring ' + M.PUP.restringT + ', loft ' + M.PUP.loftRestringT + ', fall ' + M.PUP.fallT + ', ward ' + M.PUP.ward);
ok(M.PUP.dmg.chop >= 18 && M.PUP.dmg.spin >= 20 && M.PUP.dmg.drop >= 22 && M.PUP.dmg.stomp >= 28, 'the puppets\' blows are no harder than the first build (chop 16, spin 18, drop 22, stomp 26)');
const ROWS = { 'marionette|chopTell': ['!', 'block', 'low'], 'marionette|thrustTell': ['!!', 'duck', 'high'], 'harlequin|spinTell': ['!!', 'jump', 'low'], 'harlequin|kickTell': ['!!', 'duck', 'high'],
  'acrobat|dropTell': ['!!', 'dodge', 'low'], 'acrobat|swingTell': ['!!', 'duck', 'high'], 'puppeteer|whipLowTell': ['!!', 'jump', 'low'], 'puppeteer|whipHighTell': ['!!', 'duck', 'high'],
  'puppeteer|snareTell': ['!!', 'dodge', 'low'], 'puppeteer|sandbagTell': ['!!', 'dodge', 'low'], 'puppeteer|sceneryTell': ['!!', 'dodge', 'low'],
  'masterpiece|swatTell': ['!', 'block', 'low'], 'masterpiece|stompTell': ['!!', 'dodge', 'low'], 'masterpiece|reachTell': ['!!', 'duck', 'high'] };
for (const [k, [m, a, hgt]] of Object.entries(ROWS)) { ok(MARK[k] === m, k + ' wears ' + JSON.stringify(MARK[k]) + ', not ' + m); ok(ANSWER[k] === a, k + ' is answered ' + JSON.stringify(ANSWER[k]) + ', not ' + a); ok(HEIGHT[k] === hgt, k + ' is ' + JSON.stringify(HEIGHT[k]) + ' high, not ' + hgt); }
for (const k of ['puppeteer|descendTell', 'puppeteer|masterTell', 'puppeteer|spotTell']) ok(MARK[k] === '', k + ' throws no blow but wears ' + JSON.stringify(MARK[k]));
{ const fired = {}; let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (const ph of [1, 2, 3]) for (const cyc of [0, 1, 2]) { const r = rig({ hp: ph === 1 ? 720 : ph === 2 ? 400 : 200, x: 400, cycle: cyc, lvl: cyc ? 1 : 0 });
    if (cyc) { for (const p of [r.sol, r.har, r.acr]) if (M.lineupOf(cyc).includes(p.t)) { p.alive = true; p.mode = 'hang'; } else { p.alive = false; p.mode = 'packed'; } }
    for (let i = 0; i < 60 * 50; i++) { if (i % 90 === 0) { r.hero.x = A.x0 + 40 + rnd() * (A.x1 - A.x0 - 80); r.hero.y = ph > 1 && rnd() < 0.5 ? GAL : FLOOR; }
      r.step(); for (const k of ['chop', 'thrust', 'spin', 'kick', 'drop', 'swing', 'whip', 'snare', 'swat', 'stomp', 'reach', 'sandbag', 'spot', 'scenery', 'pair']) if (r.show.n[k]) fired[k] = true; } }
  for (const k of ['chop', 'thrust', 'spin', 'kick', 'drop', 'swing', 'whip', 'snare', 'swat', 'stomp', 'reach', 'sandbag', 'spot', 'scenery', 'pair']) ok(fired[k], 'THE ' + k.toUpperCase() + ' never fired in a fuzz of every phase and act (rule A3)'); }
// ---- THE OPENINGS ARE CAUSED ----
{ const r = rig({ x: 250, quiet: true }); let opened = 0; for (let i = 0; i < 60 * 60; i++) { r.hero.x = 250; r.step(); for (const p of [r.sol, r.har]) for (const s of p.str) if (s.cut) s.cut = false; if (M.pupOpen(r.e)) opened++; }
  ok(opened === 0, 'left alone for a minute (nobody cutting) he was open ' + opened + ' frames');
  ok(M.pupTake(r.e) === M.PUP.ward, 'working the bars he takes ' + M.pupTake(r.e) + ' of a blow, not the ward ' + M.PUP.ward); }
{ const r = rig({ quiet: true }); for (const p of [r.sol, r.har]) for (const s of p.str) s.cut = true; r.step(); r.step();
  ok(r.e.mode === 'descendTell', 'both puppets cut down and he did not start down his line (mode ' + r.e.mode + ')');
  ok(until(r, () => r.e.mode === 'restring', 200), 'he never reached the stage to re-string (mode ' + r.e.mode + ')');
  ok(r.e.y === FLOOR && M.pupOpen(r.e) && M.pupTake(r.e) === M.PUP.openMul, 'kneeling on the stage re-stringing he is not open at ' + M.PUP.openMul);
  ok(r.log.lines.includes('HE IS RE-STRINGING THEM: CUT HIM'), 'his opening was not said in the hint box');
  let t = 0; while (r.e.mode === 'restring' && t < 400) { r.step(); t++; } ok(Math.abs(t * DT - M.PUP.restringT) < 0.05, 'the re-string window is ' + (t * DT).toFixed(2) + ' s, not ' + M.PUP.restringT); }
{ const r = rig({ x: 250, quiet: true }); for (const s of r.sol.str) s.cut = true; r.step(); r.step();
  ok(until(r, () => !!r.show.lowering, 60 * 12), 'one puppet down for ' + M.PUP.lonelyT + ' s and no new string came down to it');
  if (r.show.lowering) { for (let i = 0; i < 40; i++) r.step(); const s = M.stringsOf(r.e, r.show).find(q => q.lowering);
    ok(s && s.taut, 'the new string on its way down is not taut (it must glow)');
    const cut = s && M.strikeStrings(r.e, r.show, { l: s.x1 - 4, r: s.x1 + 4, t: s.y1 - 4, b: s.y1 + 4 }, new Set());
    ok(cut && cut.length === 1 && !r.show.lowering && r.show.n.lowerCut === 1, 'the new string could not be cut on its way down'); } }
{ const b = { x: 240, w: 32, y: FLOOR, down: FLOOR, up: GAL, st: 'down', t: 0 };
  ok(M.pinStrike(b, false) === 'locked' && b.st === 'down', 'the pin rail is not locked in phase 1');
  const r = rig({ hp: 470, quiet: true }); r.step(); ok(r.e.phase === 2 && r.e.mode === 'cutLine' && !r.show.line && r.show.free, 'below 2/3 he did not cut his own line and free the counterweight');
  ok(M.pinStrike(b, true) === 'free', 'struck in phase 2 the pin rail did not free the batten');
  let t = 0; while (b.st === 'rise' && t < 200) { M.stepBatten(b, DT); t++; } ok(b.st === 'up' && b.y === GAL && t * DT < 1.3, 'the batten did not reach the gallery in time');
  for (let i = 0; i < 60 * 9 && b.st !== 'down'; i++) M.stepBatten(b, DT); ok(b.st === 'down' && b.y === FLOOR, 'the batten never came back down');
  r.hero.y = GAL; r.hero.x = 500; ok(until(r, () => r.sol.flown && r.har.flown, 60 * 4), 'with a hero in the loft his puppets were not flown up to the gallery');
  for (const p of [r.sol, r.har]) for (const s of p.str) s.cut = true;
  ok(until(r, () => r.e.mode === 'restring', 60 * 4), 'cut down in the loft, he did not re-string them (mode ' + r.e.mode + ')');
  ok(r.e.y === GAL && M.pupOpen(r.e), 'phase 2: he came down his cut line, or is not open re-stringing in the loft'); }
{ for (const [kind, box, hit] of [['low', { t: FLOOR - 28, b: FLOOR }, true], ['low', { t: FLOOR - 58, b: FLOOR - 30 }, false], ['high', { t: FLOOR - 28, b: FLOOR }, true], ['high', { t: FLOOR - 8, b: FLOOR }, false]])
    ok(M.bandCatches(kind, FLOOR, box) === hit, 'the ' + kind + ' band ' + (hit ? 'misses a standing hero' : 'catches a ' + (kind === 'low' ? 'jumping' : 'ducked') + ' one')); }
{ for (const stay of [true, false]) { const r = rig({ hp: 400, quiet: true }); r.e.phase = 2; r.show.line = false; r.show.free = true; r.hero.y = GAL; r.hero.x = r.e.x - 60; r.e.snareCd = 0; r.e.whipCd = 99;
    for (let i = 0; i < 30 && r.e.mode !== 'snareTell'; i++) r.step(); ok(r.e.mode === 'snareTell' && r.show.snare, 'with a hero in the loft near him the snare was never told');
    if (!stay) r.hero.x += 40; for (let i = 0; i < 70; i++) r.step();
    ok(stay ? r.log.snares === 1 : r.log.snares === 0, stay ? 'a hero standing on the loop was not snared' : 'a hero who stepped out of the loop was snared'); } }
{ const r = rig({ hp: 230, x: 300, quiet: true }); r.e.phase = 2; r.show.line = false; r.show.free = true; r.step();
  ok(r.e.phase === 3 && r.e.mode === 'masterTell', 'below 1/3 he did not lower his masterpiece (mode ' + r.e.mode + ')');
  ok(!r.sol.alive && !r.har.alive, 'the small puppets were not packed away for the masterpiece');
  ok(until(r, () => r.show.puppets.some(p => p.t === 'masterpiece'), 120) && r.log.summons === 1, 'the masterpiece never came');
  const mp = r.show.puppets.find(p => p.t === 'masterpiece'); ok(mp && mp.str.length === 4, 'the masterpiece does not hang on four strings');
  if (mp) { until(r, () => r.e.mode === 'work' && mp.mode === 'hang', 400); for (const s of mp.str) s.cut = true;
    ok(until(r, () => r.e.mode === 'yanked', 120), 'all four strings cut and the crossbar did not drag him off the gallery');
    ok(until(r, () => r.e.mode === 'fallen', 120) && r.e.y === FLOOR && M.pupTake(r.e) === M.PUP.fallMul, 'he did not land on the stage fallen and open');
    let t = 0; while (r.e.mode === 'fallen' && t < 600) { r.step(); t++; } ok(Math.abs(t * DT - M.PUP.fallT) < 0.05, 'the fall window is ' + (t * DT).toFixed(2) + ' s, not ' + M.PUP.fallT);
    ok(until(r, () => r.e.mode === 'scene', 60 * 8) && until(r, () => r.e.mode === 'work', 60 * 4) && M.stringsLeft(mp) === 4, 'after the fall he did not climb back, change the scene and rig the masterpiece again'); } }
// ---- THE STAGE ----
{ const lv = LEVELS.find(l => l.id === 'puppetstage'); ok(lv && lv.hidden, 'the standalone stage is not a hidden level');
  if (lv) { const L = lv.build(), A2 = L.arena; ok(A2 && A2.boss === 'puppeteer' && A2.music === 'puppeteer', 'the stage is not his arena with his music');
    const w = A2.wallR - A2.wallL; ok(w >= 36 && w <= 44, 'the stage is ' + w + ' wide (rule A7: about forty)');
    ok(A2.trigger > (A2.wallL + 1) * 16, 'the trigger is not past the door');
    ok(L.ents.some(e => e.t === 'check' && e.x < A2.wallL), 'no checkpoint stands outside the stage door');
    ok(L.ents.filter(e => e.t === 'puppeteer').length === 1 && ['marionette', 'harlequin', 'acrobat'].every(t => L.ents.some(e => e.t === t)), 'he and his three puppets are not on the stage');
    ok((L.moversExtra || []).some(m => m.batten), 'the stage has no batten'); const G = A2.stage.gallery / 16;
    let boards = 0; for (let x = A2.wallL + 3; x < A2.wallR; x++) if (L.grid[G * L.W + x] === 2) boards++; ok(boards >= 30, 'the fly gallery has ' + boards + ' boards');
    let under = 0; for (let x = A2.wallL + 1; x < A2.wallR; x++) if (L.grid[(A2.stage.R + 2) * L.W + x] === 1) under++; ok(under >= 36, 'row R+2 under the stage is not solid (a trapdoor\'s pit needs a floor): ' + under); } }

// ---- IN THE PAGE ----
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;const out={};
    const boot=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='puppetstage'));BK.state='play';BK.god=true;BK.sim(10);
      const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);BK.sim(150);return BK.boss;};
    const e=boot(),PH=BK.puppeteerHands(),S=PH.show(),A=BK.L.arena,P=BK.P;e.actCd=1e9;
    out.woke=BK.bossActive&&e&&e.t==='puppeteer';out.iron=PH.read().iron;
    const sol=S.puppets.find(p=>p.t==='marionette'),har=S.puppets.find(p=>p.t==='harlequin');
    const hp0=sol.hp;BKT.hurtEnemy(sol,40,sol.x-10,false);out.wood={hp:sol.hp-hp0,alive:sol.alive,left:sol.str.filter(s=>!s.cut).length};
    const bh=e.hp;BKT.hurtEnemy(e,50,e.x-10,false);out.ward=bh-e.hp;
    har.x=A.x1-40;S.gap=0;S.turn=0;let tries=0;
    for(;tries<600&&!(sol.mode==='chopTell'&&sol.modeT<=0.3);tries++){P.x=sol.x-18;P.face=1;P.vx=0;BK.sim(1);}
    const inTell=sol.mode==='chopTell',left0=sol.str.filter(s=>!s.cut).length;P.face=1;BK.press('atk');BK.sim(14);
    out.swing={inTell,left0,left1:sol.str.filter(s=>!s.cut).length,mode:sol.mode};
    for(const p of [sol,har])for(const s of p.str)s.cut=true;let f=0;for(;f<400&&e.mode!=='restring';f++)BK.sim(1);
    const oh=e.hp;BKT.hurtEnemy(e,50,e.x-10,false);out.open={mode:e.mode,y:e.y,dmg:oh-e.hp,floor:A.floor,bar:BK.bossOpen(e)};
    /* the scene change lays its boards into the grid */
    const L=BK.L,W=L.W;for(let i=0;i<60*8&&e.mode!=='scene';i++)BK.sim(1);const to=S.nextScene;for(let i=0;i<60*4&&e.mode==='scene';i++)BK.sim(1);
    const Sc=(await import('/src/puppeteer.js')).SCENES[to],st=A.stage,fl=Sc.flats[0],tr=Sc.traps[0];
    out.scene={to,flat:L.grid[(st.R-fl[2])*W+st.sx+fl[0]],trap:L.grid[st.R*W+st.sx+tr[0]]};
    out.pin1=PH.read().free;
    for(let i=0;i<400&&e.mode!=='work';i++)BK.sim(1);e.hp=Math.floor(e.maxHp*0.6);for(let i=0;i<5;i++)BK.sim(1);out.phase2={phase:e.phase,free:S.free,line:S.line};
    const b=S.batten;P.x=b.x+b.w/2-4;P.y=A.floor;P.face=1;P.vx=0;BK.sim(20);P.face=1;BK.press('atk');BK.sim(10);for(let i=0;i<120;i++){BK.sim(1);if(b.st==='up')break;}
    out.batten={st:b.st,pin:S.n.pin,onIt:P.onMover===b,heroY:Math.round(P.y),up:b.up};
    /* a fresh attempt puts the boards back as the stage laid them */
    BK.reset();BK.sim(5);BK.P.dead=1;BK.sim(200);const e2=BK.boss;out.reset={flat:L.grid[(st.R-fl[2])*W+st.sx+fl[0]],trap:L.grid[st.R*W+st.sx+tr[0]]};
    const e3=boot();e3.hp=1;e3.mode='restring';e3.modeT=3;BKT.hurtEnemy(e3,99,e3.x-10,false);for(let i=0;i<200&&BK.bossActive;i++){BK.P.inv=99;BK.sim(1);}
    const S3=BK.puppeteerHands().show();out.death={alive:e3.alive,active:BK.bossActive,curtain:S3.curtain>0,heaps:S3.puppets.filter(p=>p.alive&&p.mode==='heap').length};
    return out;})()`, 300000);
  ok(r.woke, 'the fight did not wake past the stage door');
  ok(r.iron >= 30, 'the fly gallery does not wear the iron grating (' + r.iron + ' cells)');
  ok(r.wood.hp === 0 && r.wood.alive && r.wood.left === 2, 'a blow on a puppet\'s body did something: ' + JSON.stringify(r.wood));
  ok(r.ward > 0 && r.ward <= Math.ceil(50 * M.PUP.ward * 1.3) + 1, 'a blow on him working the bars was not warded at ' + M.PUP.ward + ' (' + r.ward + ' of 50)');
  ok(r.swing.inTell && r.swing.left1 === r.swing.left0 - 1 && r.swing.mode === 'stagger', 'a real swing in the gold did not cut ONE string and stagger it: ' + JSON.stringify(r.swing));
  ok(r.open.mode === 'restring' && r.open.y === r.open.floor && r.open.bar && r.open.dmg > r.ward * 10, 'both puppets down, he did not come down open: ' + JSON.stringify(r.open));
  ok(r.scene.flat === 2 && r.scene.trap === 0, 'the scene change did not lay its flat (ONEWAY) and open its trapdoor (AIR) in the grid: ' + JSON.stringify(r.scene));
  ok(r.reset.flat === 0 && r.reset.trap === 1, 'a fresh attempt did not put the boards back as the stage laid them: ' + JSON.stringify(r.reset));
  ok(r.pin1 === false, 'the pin rail was free in phase 1');
  ok(r.phase2.phase === 2 && r.phase2.free && !r.phase2.line, 'phase 2 did not free the counterweight: ' + JSON.stringify(r.phase2));
  ok(r.batten.pin >= 1 && r.batten.st === 'up' && r.batten.onIt && Math.abs(r.batten.heroY - r.batten.up) < 3, 'a swing at the pin rail from the batten did not carry the hero up: ' + JSON.stringify(r.batten));
  ok(!r.death.alive && !r.death.active && r.death.curtain && r.death.heaps >= 2, 'his death did not end the fight and bring the curtain down: ' + JSON.stringify(r.death));
  ok(pg.errors.length === 0, 'the page threw: ' + pg.errors.slice(0, 3).join(' | '));
  console.log(JSON.stringify(r));
} finally { pg.close(); }

if (bad.length) { console.log('PUPPETEER: ' + bad.length + ' problem(s):'); for (const b of bad) console.log('  - ' + b); process.exit(1); }
console.log('ok  puppeteer  the glow comes late and a cut cancels, decoys snare, strings re-tie, every cycle changes (pairings, a new move, a told scene change), pairs are answerable, he fights too, the numbers, the caused openings, the stage, and in the page');
