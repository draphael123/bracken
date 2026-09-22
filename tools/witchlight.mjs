/* tools/witchlight.mjs — THE WITCHLIGHT STAIR (batch 4c, 2026-09-22). Brief: .claude/briefs/witchlight-stair.md.
   Proves, by the map (Node) and then on the page:
     1. it is plugged in: appended to LEVELS (no index moves), needs the Burial Caverns, and the Folly needs it
     2. the climb: from the cavern's mouth the reach model gets to the tower gate, every silver and every checkpoint; the
        reachable band is 70+ rows, and about half the road is the two stairs
     3. the loose magic: a slab over the brambles, three slabs that rise up bends, rune columns, and two glyph crossings the
        road cannot be walked without (take the glyphs' footing away and the gate is out of reach)
     4. THE HEDGE WARDEN holds the garden gate: a mini with a height (y0), his gate a portcullis the way on goes through
     5. the level rules: a GARRISON row and no blanket calm, an ELITES row, 3.5-4.5 foes a screen along the road and no stretch
        under 2.5, three silvers, no water, one ambush at most, his marks (! for the cut and the rush, red for the thorns)
     6. on the page: it boots clean; a brief glyph turns the hero over and lets him go; a rune column lifts; he wakes at his
        gate, touching him costs nothing, and his gate opens when he dies
   His opening: tools/boss-openings.mjs. His pilot (24 fights, normal health): tools/hedge-warden-pilot.mjs. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { WITCH, bendsBelow } from '../src/witchlight.js';
import { markOf } from '../src/marks.js';
import { openPage } from './cdp.mjs';

const TS = 16, idx = id => LEVELS.findIndex(l => l.id === id);
const build = () => LEVELS[idx('witchlight')].build();
// 1. plugged in
assert.ok(idx('witchlight') > idx('burning'), 'appended after the village: no level index moves');
assert.equal(LEVELS[idx('witchlight')].needs, 'burial'); assert.equal(LEVELS[idx('mage')].needs, 'witchlight', 'the Folly needs the stair now');
const L = build(), R = floodReach(L, T, { rides: true }), reached = (x, y) => R.seen.has(x + ',' + y);
const seen = [...R.seen].map(k => k.split(',').map(Number)), rows = seen.map(([, y]) => y);
// 2. the climb
const gate = L.ents.find(e => e.t === 'gate'); assert.ok(gate && reached(gate.x, gate.y), 'the tower gate is reached from the cavern mouth');
const silvers = L.ents.filter(e => e.t === 'silver'); assert.equal(silvers.length, 3, 'three silvers');
for (const s of silvers) assert.ok(reached(s.x, s.y), 'silver reachable at ' + s.x + ',' + s.y);
for (const c of L.ents.filter(e => e.t === 'check')) assert.ok(reached(c.x, c.y), 'checkpoint reachable at ' + c.x + ',' + c.y);
assert.ok(Math.max(...rows) - Math.min(...rows) >= 70, 'the band climbs 70+ rows: ' + Math.min(...rows) + '-' + Math.max(...rows));
const stairCells = seen.filter(([x]) => WITCH.SHAFTS.some(([a, b]) => x >= a && x <= b)).length;
assert.ok(stairCells / seen.length > 0.45, 'about half the road is the stairs: ' + Math.round(100 * stairCells / seen.length) + '%');
// 3. the loose magic
const slabs = L.ents.filter(e => e.t === 'mover' && e.slab), runes = L.ents.filter(e => e.t === 'vent' && e.rune), glyphs = L.ents.filter(e => e.t === 'glyph');
assert.equal(slabs.filter(e => e.vert).length, 3, 'three slabs rise up bends'); assert.equal(slabs.filter(e => !e.vert).length, 1, 'one drifts over the brambles');
assert.ok(runes.length >= 4, 'rune columns up two bends and to two silvers: ' + runes.length);
assert.equal(glyphs.length, 4); assert.ok(glyphs.every(g => g.brief > 0), 'every glyph here is brief');
{ const S = build(); S.glyphBridges = []; const Rs = floodReach(S, T, { rides: true }); assert.ok(!Rs.seen.has(gate.x + ',' + gate.y), 'without the glyphs the broken road cannot be crossed'); }
for (const [x0, x1, row] of WITCH.GAPS) { for (let x = x0; x <= x1; x++) assert.equal(L.grid[(row + 1) * L.W + x], T.AIR, 'the road is broken at ' + x + ',' + (row + 1));
  for (let x = x0; x <= x1; x++) { let y = row; while (y > 0 && L.grid[y * L.W + x] === T.AIR) y--; assert.ok(row - y <= 7, 'a road overhead to walk upside down at ' + x); } }
assert.deepEqual([bendsBelow(L.witch.bends, WITCH.GROUND), bendsBelow(L.witch.bends, WITCH.GARDEN.row), bendsBelow(L.witch.bends, WITCH.TOP)], [0, 4, L.witch.bends.length - 1], 'the tower grows a step at every bend');
// 4. the Hedge Warden
assert.equal(L.mini.boss, 'hedgewarden'); assert.ok(L.ents.find(e => e.t === 'hedgewarden' && e.mini), 'he is placed, marked the mini');
assert.ok(L.mini.y0 !== undefined && L.mini.y1 !== undefined, 'his room has a height: the stair runs under it');
assert.equal(L.grid[(L.mini.floor / TS - 1) * L.W + L.mini.gate], T.PORT, 'his gate is a portcullis');
{ const S = build(); for (let y = 0; y < S.H; y++) if (S.grid[y * S.W + S.mini.gate] === T.PORT) S.grid[y * S.W + S.mini.gate] = T.SOLID;
  const Rs = floodReach(S, T, { rides: true }); assert.ok(!Rs.seen.has(gate.x + ',' + gate.y), 'his gate holds the way on'); }
assert.equal(L.witch.braziers.length, 2); for (const [x] of L.witch.braziers) assert.ok(x * TS > L.mini.x0 && x * TS < L.mini.x1, 'his braziers stand in his room');
assert.deepEqual(['cutTell', 'rushTell', 'thornTell'].map(mode => markOf({ t: 'hedgewarden', mode })), ['!', '!', '!!'], 'the cut and the rush a shield turns; the thorns wear the red mark');
// 5. the level rules
const src = readFileSync(new URL('../src/level.js', import.meta.url), 'utf8');
for (const table of ['GARRISON', 'ELITES']) { const at = src.indexOf('const ' + table + ' = {'); assert.ok(at > 0 && src.slice(at, at + 20000).includes('\n  witchlight: [['), table + ' has a witchlight row'); }
assert.ok(!(L.calm || []).length, 'no blanket calm: the garrison walks the whole stair');
assert.ok(!(L.pools || []).length, 'no water on the hill'); assert.ok((L.ambushes || []).length <= 1, 'one ambush at most');
const NOT = new Set(['sign', 'check', 'coin', 'deco', 'silver', 'vent', 'mover', 'glyph', 'gate', 'hedgewarden', 'heart', 'coffer', 'stray', 'key', 'shrine', 'stal']);
const foes = L.ents.filter(e => !NOT.has(e.t));
/* THE ROAD, stretch by stretch: [x0, x1, standing row] - the foot, each terrace of each stair, the garden walk (his room is not road) */
const road = [[0, 61, WITCH.GROUND]].concat(...WITCH.SHAFTS.map(([a, b, rs]) => rs.map(r => [a, b, r])), [[161, 190, WITCH.GARDEN.row]]);
const per = road.map(([a, b, r]) => { const n = foes.filter(e => e.x >= a && e.x <= b && e.y <= r && e.y >= r - 7).length; return { a, r, n, per: n / ((b - a + 1) / 24) }; });
const total = per.reduce((s, p) => s + p.n, 0), screens = road.reduce((s, [a, b]) => s + (b - a + 1) / 24, 0), mean = total / screens;
console.log('foes a screen along the road: ' + mean.toFixed(2) + ' (' + total + ' on ' + screens.toFixed(1) + ' screens); by stretch ' + per.map(p => p.a + '/' + p.r + ':' + p.per.toFixed(1)).join(' '));
assert.ok(mean >= 3.5 && mean <= 4.5, 'foes a screen along the road ' + mean.toFixed(2) + ' (3.5-4.5)');
for (const p of per) assert.ok(p.per >= 2.5, 'the stretch at x ' + p.a + ' row ' + p.r + ' is thin: ' + p.per.toFixed(1));

// 6. on the page
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const I=BK.LEVELS?BK.LEVELS.findIndex(l=>l.id==='witchlight'):${idx('witchlight')};
    const boot=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(I);BK.state='play';BK.god=true;BK.P.hp=BK.P.maxHp;BK.sim(10);};
    const clear=()=>{for(const e of BK.enemies())if(e.t!=='hedgewarden')e.alive=false;};
    const out={};
    boot();BK.sim(120);out.boot={id:BK.L.witch?'witch':'?',hp:BK.P.hp,dead:!!BK.P.dead};
    /* THE GLYPH: stand on the first one, and it turns him over; three and a half seconds later he is let go */
    {boot();clear();const gl=BK.props().filter(p=>p.t==='glyph').sort((a,b)=>a.x-b.x)[0];BK.tp(Math.round(gl.x/16),Math.round(gl.y/16)-1);let flipped=false,at=0;
     for(let i=0;i<60&&!flipped;i++){BK.sim(1);if(BK.P.flip){flipped=true;at=i;}}let held=0;for(let i=0;i<400&&BK.P.flip;i++){BK.sim(1);held++;}
     out.glyph={brief:gl.brief,flipped,released:!BK.P.flip,held:+(held/60).toFixed(2)};}
    /* AND IT CROSSES THE GAP: on the glyph, holding the way on, he walks the road overhead and comes down past the break */
    for(const [gi,dir] of [[0,1],[3,-1]]){boot();clear();const gl=BK.props().filter(p=>p.t==='glyph').sort((a,b)=>a.x-b.x)[gi];BK.tp(Math.round(gl.x/16),Math.round(gl.y/16)-1);
     BK.keys[dir>0?'right':'left']=true;for(let i=0;i<60&&!BK.P.flip;i++)BK.sim(1);for(let i=0;i<500&&BK.P.flip;i++)BK.sim(1);BK.keys.right=BK.keys.left=false;BK.sim(90);
     (out.cross||(out.cross=[])).push({from:Math.round(gl.x/16),dir,x:Math.floor(BK.P.x/16),row:Math.round(BK.P.y/16)-1,ground:BK.P.ground});}
    /* A RUNE COLUMN: stand in the first one and wait for it to glow: it lifts him */
    {boot();clear();const v=BK.props().find(p=>p.t==='vent'&&p.rune);BK.tp(Math.floor(v.x/16),Math.round(v.y/16)-1);const y0=BK.P.y;let top=y0;for(let i=0;i<360;i++){BK.sim(1);top=Math.min(top,BK.P.y);}
     out.rune={rise:Math.round((y0-top)/16)};}
    /* THE HEDGE WARDEN: he wakes at the trigger; standing in him costs nothing; his gate opens on his death */
    {boot();const M=BK.L.mini;BK.tp(Math.round(M.trigger/16)+1,Math.round(M.floor/16)-1);BK.sim(120);const w=BK.enemies().find(e=>e.t==='hedgewarden');
     const woke={active:!!BK.miniActive,mode:w.mode};BK.god=false;BK.P.hp=BK.P.maxHp;const hp0=BK.P.hp;
     for(let i=0;i<90;i++){w.cd=99;if(w.mode!=='stalk')w.mode='stalk';BK.P.x=w.x;BK.P.y=w.y;BK.sim(1);}const touch=hp0-BK.P.hp;BK.god=true;
     const gi=(Math.round(M.floor/16)-1)*BK.L.W+M.gate,before=BK.L.grid[gi];w.growth=2;w.mode='stump';w.modeT=9;w.hp=3;BKT.hurtEnemy(w,50,w.x-20,false);BK.sim(120);
     out.warden={woke,touch,alive:w.alive,gateBefore:before,gateAfter:BK.L.grid[gi]};}
    out.errors=(window.__errs||[]).slice(0,3);return out;})()`, 300000);
  console.log(JSON.stringify(r));
  assert.ok(!r.boot.dead && r.boot.id === 'witch', 'the stair boots: ' + JSON.stringify(r.boot));
  assert.ok(r.glyph.flipped && r.glyph.released, 'a brief glyph turns him over and lets him go: ' + JSON.stringify(r.glyph));
  assert.ok(r.glyph.held >= r.glyph.brief - 0.1 && r.glyph.held <= r.glyph.brief / 0.5, 'it holds for its brief, in game seconds (the default speed runs the world at 60%): ' + JSON.stringify(r.glyph));
  for (const c of r.cross) { const gap = WITCH.GAPS.find(([a, b2]) => Math.abs(c.from - (c.dir > 0 ? a - 3 : b2 + 3)) <= 1);
    assert.ok(gap && c.row === gap[2] && (c.dir > 0 ? c.x > gap[1] : c.x < gap[0]), 'holding the way on, the glyph carries him over the break: ' + JSON.stringify(c)); }
  assert.ok(r.rune.rise >= 8, 'a rune column lifts him up the bend: ' + JSON.stringify(r.rune));
  assert.ok(r.warden.woke.active && r.warden.woke.mode !== 'sleep', 'he wakes at his gate: ' + JSON.stringify(r.warden));
  assert.equal(r.warden.touch, 0, 'touching him costs nothing (the touch rule)');
  assert.ok(!r.warden.alive && r.warden.gateBefore === T.PORT && r.warden.gateAfter !== T.PORT, 'his gate opens when he dies: ' + JSON.stringify(r.warden));
  assert.deepEqual(pg.errors.slice(0, 3), [], 'no errors on the page');
} finally { pg.close(); }
console.log('THE WITCHLIGHT STAIR: plugged in, climbed, its loose magic carries the road, the Hedge Warden holds the gate.');
