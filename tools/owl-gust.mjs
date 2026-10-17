// tools/owl-gust.mjs - THE OWL REEVE 3, IN THE PAGE (claude/owl3, Daniel 2026-10-15: "too easy - lit lanterns last 14 s and each crash opens her").
//
// Daniel's calls, each held here:
//   - A LIT LAMP BURNS ~2 s (OWL_LAMP.burn) and goes out; out, its wick smokes OWL_LAMP.cool s and a strike will not light it; struck again while
//     it burns it does NOT burn longer; ONE CRASH SPENDS IT (her swoop through a lit lamp: she crashes, the lamp is out)
//   - HER WING BEAT is a real gust: an unbraced hero on the boards between her and THE DROP is carried toward it (or into it); one braced (DOWN
//     held) holds his ground; one on a rope (a vine) is not carried; every lit floor lamp downwind of her goes out, one upwind keeps burning
//   - THE DROP: a hero who falls into a break in the crown boards loses a hazard's share and is handed back onto the boards, alive, out of it
//   - THE BONE PELLET LOB: a hero standing on a mark is struck as the pellet bursts; one off the marks is not; her windup and release are their
//     own poses (owl frames 15/16, the wing beat 13/14 - B16) and the tell table has the pellet (!!, dodge, low) and the wing beat as QUIET
//   - the page throws nothing
//   PORT=8955 node tools/owl-gust.mjs        (PORT from tools/ports.mjs by default)
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { openPage } from './cdp.mjs';
import { HEIGHT, ANSWER, MARK, QUIET } from '../src/marks.js';

const bad = [];
if (MARK['owl|pelletTell'] !== '!!') bad.push('owl|pelletTell MARK ' + MARK['owl|pelletTell']);
if (ANSWER['owl|pelletTell'] !== 'dodge') bad.push('owl|pelletTell ANSWER ' + ANSWER['owl|pelletTell']);
if (HEIGHT['owl|pelletTell'] !== 'low') bad.push('owl|pelletTell HEIGHT ' + HEIGHT['owl|pelletTell']);
if (!QUIET.has('updateOwl|gustTell')) bad.push('updateOwl|gustTell is not QUIET (a shove, no blow)');
{ const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'), fr = src.slice(src.indexOf("else if (e.t === 'owl') frame ="), src.indexOf("else if (e.t === 'owl') frame =") + 400);
  for (const [m, n] of [['gustTell', 13], ['gust', 14], ['pelletTell', 15]]) if (!fr.includes(`e.mode === '${m}' ? ${n}`)) bad.push(`owl ${m} is not on its own frame ${n} (B16)`); }

const pg = await openPage({ audio: false, fonts: false });
let R;
try {
  R = await pg.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; BK.SET.speed = 1; const out = {};
    const K = BK.keys, none = () => { for (const k of ['left', 'right', 'up', 'down', 'jump', 'block', 'atk', 'dodge']) K[k] = false; };
    let owl = null;
    BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'hanging')); BK.state = 'play'; BK.start(); BK.god = true; BK.sim(5); BK.reset();
    const A = BK.L.arena, FL = A.floor; BK.tp(Math.round(A.trigger / 16) + 4, Math.round(FL / 16) - 1); BK.sim(150); none();
    owl = BK.enemies().find(e => e.t === 'owl' && e.alive); if (!owl) return { err: 'no owl' };
    const lamps = BK.props().filter(p => p.owl && !p.perch).sort((a, b) => a.x - b.x), all = BK.props().filter(p => p.owl);
    const dark = () => { for (const p of all) { p.lit = false; p.lampT = 0; p.wasBurning = false; p.cool = 0; } };
    const calm = () => { for (const e of BK.enemies()) if (e !== owl) e.alive = false; Object.assign(owl, { mode: 'sit', modeT: 99, perchI: 1, x: owl.perches[1].x, y: owl.perches[1].y, ward: 0, eyesT: 99, hootCd: 99, douseT: 99, ropeDone: true, hp: owl.maxHp, oil: null, pel: null, pMarks: null }); };
    const at = x => { none(); BK.P.x = x; BK.P.y = FL; BK.P.vx = 0; BK.P.vy = 0; BK.P.climb = false; BK.P.hp = BK.P.maxHp; BK.P.inv = 0; BK.P.dropT = 0; };
    out.drops = A.drops;
    BK.god = false; dark(); calm();
    /* THE LAMP: struck, it burns about two seconds and goes out; out, a strike will not take; once the wick has stopped smoking, it does; struck again while lit it does not burn longer */
    { const L = lamps[0]; at(L.x - 14); BK.P.face = 1; BK.sim(2); BK.press('atk'); let litAt = -1, outAt = -1, f = 0, restruck = false;
      for (; f < 400; f++) { if (litAt >= 0 && !restruck && f - litAt === 40 && BK.P.atk < 0) { BK.press('atk'); restruck = true; } BK.sim(1); if (L.lit && litAt < 0) litAt = f; if (litAt >= 0 && !L.lit) { outAt = f; break; } }
      out.burn = { litAt, outAt, secs: (outAt - litAt) / 60, cool: L.cool, restruck };
      for (let k = 0; k < 12 && BK.P.atk >= 0; k++) BK.sim(1); BK.press('atk'); BK.sim(20); out.burn.smokingTakes = L.lit;
      for (let k = 0; k < 200 && L.cool > 0; k++) BK.sim(1); for (let k = 0; k < 20 && BK.P.atk >= 0; k++) BK.sim(1); BK.press('atk'); BK.sim(20); out.burn.afterCoolTakes = L.lit; }
    /* ONE CRASH SPENDS IT: her swoop run along her line through a lit lamp */
    { dark(); calm(); const L = lamps[1]; at(L.x + 30); L.lit = true; L.wasBurning = true; L.lampT = 9; owl.mode = 'swoop'; owl.vx = -330; owl.swLeft = 400; owl.modeT = 2; owl.hitT = 1; owl.grab = false; owl.x = L.x + 120; owl.y = FL - 9; owl.ward = 0;
      let crashed = false; for (let k = 0; k < 90; k++) { BK.P.inv = 1; BK.sim(1); if (owl.mode === 'crash') { crashed = true; break; } } out.crash = { crashed, lampLit: L.lit, cool: L.cool }; calm(); BK.P.inv = 0; }
    /* THE WING BEAT: from the west perch, blowing west toward the west drop; the hero two tiles east of the drop's east lip */
    const gust = (how) => { dark(); calm(); BK.sim(30); const d = A.drops[0], lip = (d[1] + 1) * 16; at(lip + 40); if (how === 'vine') { const vx = BK.L.vines ? null : null; }
      Object.assign(owl, { mode: 'gustTell', modeT: 0.2, gustDir: -1, perchI: 0, x: owl.perches[0].x, y: owl.perches[0].y });
      const up = lamps.find(p => (p.x - owl.x) > 40), down = lamps.find(p => (p.x - owl.x) < -24 && p.x > lip); for (const p of [up, down]) if (p) { p.lit = true; p.wasBurning = true; p.lampT = 9; }
      const x0 = BK.P.x, hp0 = BK.P.hp; let fell = false, minX = x0, gusted = false;
      for (let k = 0; k < 200; k++) { if (how === 'brace') K.down = true; const h0 = BK.P.hp; BK.sim(1); if (owl.mode === 'gust') gusted = true; if (BK.P.hp < h0 && BK.P.dropT > 0.9) fell = true; minX = Math.min(minX, BK.P.x); if (gusted && owl.mode !== 'gust') break; }
      none(); return { how, x0: Math.round(x0), minX: Math.round(minX), moved: Math.round(x0 - minX), fell, lost: hp0 - BK.P.hp, gusted, upLit: up ? up.lit : null, downLit: down ? down.lit : null, upX: up && up.x, downX: down && down.x }; };
    out.gustStand = gust('stand'); out.gustBrace = gust('brace');
    /* on a rope: the vine west of her middle perch, the hero holding it at the boards */
    { dark(); calm(); const vx = 48 * 16 + 8; Object.assign(owl, { mode: 'gustTell', modeT: 0.2, gustDir: -1, perchI: 2, x: owl.perches[2].x, y: owl.perches[2].y });
      at(vx); BK.P.y = FL - 20; BK.P.climb = true; const x0 = BK.P.x; let gusted = false, maxD = 0;
      for (let k = 0; k < 200; k++) { BK.sim(1); if (owl.mode === 'gust') gusted = true; maxD = Math.max(maxD, Math.abs(BK.P.x - x0)); if (gusted && owl.mode !== 'gust') break; }
      out.gustRope = { gusted, maxD: Math.round(maxD), climb: BK.P.climb }; none(); }
    /* THE DROP: dropped into the east break, he is handed back, alive, out of it */
    { dark(); calm(); const d = A.drops[1]; at((d[0] + d[1] + 1) * 8); BK.P.y = FL + 4; const hp0 = BK.P.hp; let back = false; for (let k = 0; k < 90; k++) { BK.sim(1); if (BK.P.dropT > 0) { back = true; break; } }
      out.drop = { back, lost: hp0 - BK.P.hp, pct: Math.round(100 * (hp0 - BK.P.hp) / BK.P.maxHp), x: Math.round(BK.P.x), y: Math.round(BK.P.y), dead: !!BK.P.dead, outOf: !(BK.P.x > d[0] * 16 - 2 && BK.P.x < (d[1] + 1) * 16 + 2) }; }
    /* THE BONE PELLET LOB: on a mark, then off them */
    const pellet = onMark => { dark(); calm(); at(56 * 16); Object.assign(owl, { mode: 'sit', modeT: 0, bag: ['pellet'], bagPh: 1, lastMove: null, perchI: 1, x: owl.perches[1].x, y: owl.perches[1].y, phase: 1, hootCd: 99, skimCd: 99 });
      for (let k = 0; k < 20 && owl.mode !== 'pelletTell'; k++) BK.sim(1); if (owl.mode !== 'pelletTell') return { err: 'no pellet: ' + owl.mode }; const marks = owl.pMarks.slice();
      let x = onMark ? marks[0] : null; if (!onMark) { for (let dx = 0; dx < 200 && x === null; dx += 4) for (const c of [BK.P.x - dx, BK.P.x + dx]) if (x === null && marks.every(m => Math.abs(m - c) > 34) && !A.drops.some(([a, b]) => c > a * 16 - 12 && c < (b + 1) * 16 + 12)) x = c; }
      let lost = 0, released = false; for (let k = 0; k < 200; k++) { BK.P.x = x; BK.P.vx = 0; BK.P.inv = 0; const h0 = BK.P.hp; BK.sim(1); if (BK.P.hp < h0) lost += h0 - BK.P.hp; if (owl.mode === 'pellet') released = true; if (released && owl.mode !== 'pellet') break; }
      return { marks: marks.map(Math.round), x: Math.round(x), lost, released }; };
    out.pelletOn = pellet(true); out.pelletOff = pellet(false);
    return out;
  })()`, 600000);
} finally { pg.close(); }
const errs = pg.errors || [];
console.log(JSON.stringify(R, null, 1));
if (R.err) bad.push(R.err);
else {
  const b = R.burn; if (!(b.secs > 1.6 && b.secs < 2.6)) bad.push(`a struck lamp burned ${b.secs} s, not ~2 (re-struck at 0.66 s: ${b.restruck})`);
  if (!(b.cool > 0)) bad.push('a lamp gone out does not smoke (cool ' + b.cool + ')'); if (b.smokingTakes) bad.push('a smoking wick took a light'); if (!b.afterCoolTakes) bad.push('the lamp would not light again after its wick stopped smoking');
  if (!R.crash.crashed) bad.push('her swoop through a lit lamp did not crash her'); else if (R.crash.lampLit || !(R.crash.cool > 0)) bad.push('the crash did not spend the lamp');
  const s = R.gustStand, br = R.gustBrace;
  if (!s.gusted) bad.push('no gust'); else if (!(s.fell || s.moved >= 36)) bad.push(`the gust carried an unbraced hero only ${s.moved} px toward the drop`);
  if (br.moved > 12 || br.fell) bad.push(`a braced hero was carried ${br.moved} px (fell: ${br.fell})`);
  if (s.downLit !== false) bad.push('a lit lamp downwind of her stayed lit in the gust'); if (s.upLit !== true) bad.push('a lit lamp upwind of her went out in the gust');
  if (!R.gustRope.gusted || R.gustRope.maxD > 6) bad.push(`a hero on a vine was carried ${R.gustRope.maxD} px`);
  const d = R.drop; if (!d.back || d.dead || !d.outOf || !(d.pct >= 15 && d.pct <= 40)) bad.push('THE DROP: ' + JSON.stringify(d));
  if (R.pelletOn.err || !(R.pelletOn.lost > 0)) bad.push('a hero on a pellet mark was not struck: ' + JSON.stringify(R.pelletOn));
  if (R.pelletOff.err || R.pelletOff.lost > 0 || !R.pelletOff.released) bad.push('a hero off the marks was struck: ' + JSON.stringify(R.pelletOff));
}
if (errs.length) bad.push('page errors: ' + errs.slice(0, 3).join(' | '));
if (bad.length) { console.log('\nOWL GUST: ' + bad.length + ' problem(s)\n  ' + bad.join('\n  ')); process.exit(1); }
console.log('\nOWL GUST: the lamp burns ' + R.burn.secs.toFixed(2) + ' s and a crash spends it; the wing beat carried an unbraced hero ' + (R.gustStand.fell ? 'into the drop' : R.gustStand.moved + ' px') + ', a braced one ' + R.gustBrace.moved + ' px, one on a vine ' + R.gustRope.maxD + ' px; the drop costs ' + R.drop.pct + '% and hands back; the pellets strike on the mark and not off it.');
