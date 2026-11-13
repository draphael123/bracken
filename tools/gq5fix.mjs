// tools/gq5fix.mjs - GQ5FIX (Daniel 11-12 14:04, Highcrown pass 4 feedback). NODE ONLY, no page.
//   C  THE PRINCESS'S BELL: every hero reaches the bell's hit box with a standing JUMP blow from the belfry landing, and the rope with a standing blow from the floor;
//      the Queen's hall bell (the winch box, t = y-22) with a standing blow. Hero rise = src/hero-move.js flown by src/reach-hero.js; the blow boxes are the plain
//      air/stand boxes of main.js attackBox0 (the table below). The weakest plain blow of each hero is used (the up-slash and the rising cut reach higher).
//   D  THE ALARM TIMERS: no forced idle over 3 s at the pass-4 alarm gates.
//   E  THE QUEEN'S STAFF: a 'back' sceptre is drawn over her body (not behind it), so no pose drops it.
//   F  MUSIC: the Princess's fight and the castle's climb name tracks that exist as files and in the table.
//   B  THE GEODE THRONE'S CRYSTALS (Daniel still b): the east hearth gate stands clear of the throne's crystal cluster (+-54 px + the hearth's 16).
//   P  PROPS: every standing prop of the pass-4 columns (x >= 520) has a floor to stand on; every gate pin's ring-plate has stone above it.
//   node tools/gq5fix.mjs
import { readFileSync, existsSync } from 'node:fs';
import { LEVELS, T } from '../src/level.js';
import { HERO_MOVE_IDS } from '../src/hero-move.js';
import { heroJumps } from '../src/reach-hero.js';
import { GP } from '../src/goblin-princess.js';
const rd = f => readFileSync(new URL('../' + f, import.meta.url), 'utf8');
let fails = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const TS = 16, L = LEVELS.find(l => l.id === 'crown').build(), W = L.W, g = (x, y) => (x < 0 || y < 0 || x >= W || y >= L.H) ? T.SOLID : L.grid[y * W + x];
const solidish = v => v !== T.AIR && v !== T.NET && v !== T.SPIKE;

console.log("== C. the Princess's bell");
{ const M = L.mini, Ar = M.grate, bx = Ar.col * TS + 8, by0 = (Ar.gy0 + GP.bell.hang) * TS, box = { l: bx - 12, r: bx + 13, t: by0, b: by0 + 30 };
  const landing = M.land.y;   /* the belfry landing's top: where a hero's feet stand on it */
  /* the plain blow box in the air, [top, bottom, reach] from the feet y (P.y): main.js attackBox0 - generic swing (t -17, b -1, 22 out), pirate (-19), warden thrust (-16, 40 out),
     ranger knife (-22 / +2, 17 out), berserker AIR SPIN (-26, 17 both sides), geomancer head-strike (-28), paladin hammer (-24); pyromancer and reaper use the generic top (weaker than theirs) */
  const AIR = { knight: [-17, -1, 22], warden: [-16, -1, 40], pyro: [-17, -1, 22], paladin: [-24, 1, 22], pirate: [-19, -1, 22], reaper: [-17, -1, 22], geomancer: [-28, -1, 26], berserker: [-26, 3, 17], ranger: [-22, 2, 17] };
  for (const h of HERO_MOVE_IDS) { const J = heroJumps(h), rise = J.risePx, a = AIR[h]; if (!a) { ok(false, h + ': no blow table'); continue; }
    const apex = landing - rise, atk = { l: bx - 4 - a[2], r: bx + 4 + a[2], t: apex + a[0], b: apex + a[1] };   /* standing under the bell's centre line, at the top of the jump */
    const hit = atk.l < box.r && atk.r > box.l && atk.t < box.b && atk.b > box.t, slack = Math.min(atk.b, box.b) - Math.max(atk.t, box.t);
    ok(hit, h + ': a standing jump from the landing (rise ' + rise.toFixed(1) + ' px) reaches the bell: blow y ' + atk.t.toFixed(0) + '..' + atk.b.toFixed(0) + ' vs bell ' + box.t + '..' + box.b + ' (overlap ' + slack.toFixed(0) + ' px)'); }
  ok(box.b < landing - 28, 'the bell hangs clear above a standing hero on the landing (bell bottom ' + box.b + ', head ' + (landing - 28) + ')');
  const rope = { l: M.rope - 8, r: M.rope + 8, t: M.floor - 34, b: M.floor };
  for (const h of HERO_MOVE_IDS) { const a = AIR[h], atk = { l: M.rope - 4 - a[2], r: M.rope + 4 + a[2], t: M.floor + a[0], b: M.floor + a[1] }; ok(atk.l < rope.r && atk.r > rope.l && atk.t < rope.b && atk.b > rope.t, h + ': a standing blow at the rope on the floor reaches it'); }
  const w = L.ents.find(e => e.t === 'winch' && e.bell && e.bossGate), wy = (w.y + 1) * TS, qb = { t: wy - 22, b: wy };
  for (const h of HERO_MOVE_IDS) { const a = AIR[h]; ok(wy + a[0] < qb.b && wy + a[1] > qb.t, h + ": a standing blow reaches the Queen's hall bell (box " + qb.t + '..' + qb.b + ')'); } }

console.log('== D. the alarm timers (forced idle <= 3 s)');
ok(GP.chase.horn <= 3 && GP.guards.horn <= 3, "alarm-tower guard gate / the Princess's guard call: horn " + GP.chase.horn + ' / ' + GP.guards.horn + ' s (was 6.0 / 6.0)');
ok(GP.gate.lantern <= 2.0 && GP.gate.callTell <= 1.0, "the gates' call: tell " + GP.gate.callTell + ' + lantern ' + GP.gate.lantern + ' s (was 1.0 + 3.5)');
{ const gb = L.ents.find(e => e.t === 'gatebell'); ok(gb && gb.hold === 3, 'the tower-2 grate (gatebell gg-t2) stays down ' + (gb && gb.hold) + ' s (was 6)'); }

console.log("== E. the Queen's staff");
{ const s = rd('src/chars.js'), i = s.indexOf('export function bakeGoblinQueen'), j = s.indexOf('export function bakeThrone'), q = s.slice(i, j);
  const back = q.indexOf("if (rod && rod[4] === 'back') rodDraw();   /* (GQ5FIX)"), belt = q.indexOf('the belt, UNDER her'), far = q.indexOf('// the far arm, as thick as a leg');
  ok(back > belt && back < far, "a 'back' sceptre is drawn after the body and the belt, before her arms (it was before the gown)");
  const frames = [...q.matchAll(/frame\(\{[^\n]*\}\),\s*\/\* (\d+) /g)], norod = frames.filter(m => !/rod:/.test(m[0]));
  ok(frames.length > 50 && norod.length === 0, 'every one of her ' + frames.length + ' frames has a rod' + (norod.length ? ' (without: ' + norod.map(m => m[1]).join(',') + ')' : '')); }

console.log('== F. music');
{ const A = rd('src/audio.js'), file = id => { const m = A.match(new RegExp('[ ,{]' + id + ": '\\./(audio/[^']+)'")); return m && existsSync(new URL('../' + m[1], import.meta.url)); };
  ok(L.music === 'warcairn' && file('warcairn'), 'the castle climb plays ' + L.music + ' (was highcrown)');
  ok(L.mini.music === 'king' && file('king'), "the Princess's fight plays " + L.mini.music + ' (was goblinroyal)');
  ok(!/ctx\.music\('goblinroyal'\)/.test(rd('src/goblin-princess.js')), 'her phase-two restart no longer names goblinroyal'); }

console.log('== B. the geode throne vs the hearth gates');
{ const A = L.arena, q = L.ents.find(e => e.t === 'gqueen'), tx = q.x * TS + 8, src = rd('src/gqueen-hands.js'), TSZ = 16;
  let ex = A.x1 - 3 * TSZ - 8; const was = ex; if (Math.abs(ex - tx) < 84) ex = tx - 84;
  ok(src.includes('if (tx && Math.abs(ex - tx) < 84) ex = tx - 84;'), 'hearthXs pushes the east hearth off the throne (src/gqueen-hands.js)');
  ok(Math.abs(was - tx) <= 16 && Math.abs(ex - tx) - 16 >= 54, 'the east hearth was ' + (was - tx) + ' px from the throne (on it); now ' + (ex - tx) + ' px: its edge clears the cluster (54 px) by ' + (Math.abs(ex - tx) - 16 - 54) + ' px');
  const wx = A.x0 + 3 * TSZ + 8; ok(Math.abs(wx - tx) - 16 >= 54, 'the west hearth is clear of the throne too'); }

console.log('== P. the pass-4 props (x >= 520) have something to stand / hang on');
{ const STAND = new Set(['torch', 'sign', 'check', 'lantern']), bad = [];
  for (const e of L.ents) { if (e.x < 520 || !STAND.has(e.t)) continue; let f = false; for (let dy = 0; dy <= 3 && !f; dy++) if (solidish(g(e.x, e.y + 1 + dy))) f = true; if (!f) bad.push(e.t + '@' + e.x + ',' + e.y); }
  ok(!bad.length, 'every torch / sign / checkpoint / lamp has a floor within 3 rows' + (bad.length ? ': ' + bad.join(' ') : ''));
  for (const k of ['W', 'E', 'U']) { const G = L.mini.gq4Gates && L.mini.gq4Gates[k]; if (!G) continue;
    const topRow = (k === 'U' ? G.pin[1] : G.pin[1] - 2);
    const roofRow = L.mini.y0 / TS; let clear = true; for (let r = roofRow + 1; r < topRow; r++) if (solidish(g(G.pin[0], r))) clear = false;
    ok(solidish(g(G.pin[0], roofRow)) && clear && rd('src/goblin-princess.js').includes('G.ceil = (Ar.y0 || 0) + TS') && rd('src/redraw/gq4_art.js').includes('G.ceil !== undefined'), 'gate ' + k + ": the pin's ring-plate (col " + G.pin[0] + ', row ' + topRow + ') hangs from stone above it, and its chain is drawn from the roof (G.ceil)'); } }
console.log(fails ? '\nFAIL: ' + fails : '\nall ok'); process.exit(fails ? 1 : 0);
