/* tools/witchlight.mjs — THE WITCHLIGHT STAIR, REDESIGNED (2026-09-22). Brief: .claude/briefs/witchlight-redesign.md.
   Daniel rejected the first build ("climb and go right with a massive enemy gauntlet... looks like a repeat"). This proves the
   redesign by the map (Node) and then on the page:
     1. it is plugged in: appended to LEVELS (no index moves), needs the Burial Caverns, and the Folly needs it
     2. FIVE PLACES, each walked from the cavern mouth: the Bramble Foot, the Drifting Aqueduct, the Upside-Down Cloister, the
        Rune Stair, the Topiary Maze - and the Gargoyle's slabs on top; every silver and checkpoint reached; about a third of it
        vertical, not half; route-breaks finds nothing
     2b. THE GATE GARGOYLE on top: his arena of slabs over the garden terrace, some CRACKED and held still, three rune columns from
        the terrace back up past the slabs, no gate - the level ends on his kill; his marks (red for the dive and the flare)
     3. ONE VERB A PLACE: the aqueduct's slabs (seven, at different speeds, one that SINKS, one that rises) and its sweeping
        brooms, with a rope up every pier out of the gorge; the cloister floored with brambles and crossed only by the glyphs
        (take their footing away and it is cut), under a roof of tiles within the flip's reach; the rune stair's three columns lit
        one after another, and the library chunk; the garden's hedges to go under and over
     4. THE HEDGE WARDEN holds the garden gate (moved as-is): a mini with a height, his gate a portcullis the way on goes through
     5. ENCOUNTERS, NOT A SPRINKLE: every group 3-5 strong, at least one a place, no GARRISON row and no calm, a total in the range
        of its neighbours, the elites captains of encounters, one a place at most
     6. ITS OWN LOOK: the light by place (twilight and witchlight-night tints, the dusk grade under 0.45), its own runed stone, one
        landmark a place, its own music
     7. on the page: it boots clean; a glyph turns the hero over and the roof carries him over the brambles to the next glyph; a
        rune column lifts; the sinking slab sinks under him and comes back; a sweeping broom takes an unguarded hero off his slab
        and a shield braces him; the roof armour hangs from the roof until he turns over, then falls with him; the Hedge Warden
        wakes at his gate, touching him costs nothing, and his gate opens when he dies; the Gargoyle wakes when you come onto his
        slabs, touching him costs nothing, and his kill wins the level
   The Gargoyle's opening: tools/boss-openings.mjs. His pilot: tools/gargoyle-pilot.mjs.
   His opening: tools/boss-openings.mjs. His pilot (24 fights, normal health): tools/hedge-warden-pilot.mjs. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { WL } from '../src/witchlight.js';
import { markOf } from '../src/marks.js';
import { audit } from './route-breaks.mjs';
import { openPage } from './cdp.mjs';

const TS = 16, idx = id => LEVELS.findIndex(l => l.id === id);
const build = () => LEVELS[idx('witchlight')].build();
// 1. plugged in
assert.ok(idx('witchlight') > idx('burning'), 'appended after the village: no level index moves');
assert.equal(LEVELS[idx('witchlight')].needs, 'burial'); assert.equal(LEVELS[idx('mage')].needs, 'witchlight', 'the Folly needs the stair');
const L = build(), R = floodReach(L, T, { rides: true }), reached = (x, y) => R.seen.has(x + ',' + y);
const seen = [...R.seen].map(k => k.split(',').map(Number)), rows = seen.map(([, y]) => y);
const near = e => { for (let dy = -2; dy <= 5; dy++) for (let dx = -3; dx <= 3; dx++) if (reached(e.x + dx, e.y + dy)) return true; return false; };
const at = (x, y) => L.grid[y * L.W + x];
// 2. five places
for (const [name, [a, b]] of Object.entries(WL.PLACES)) { const n = seen.filter(([x]) => x >= a && x <= b).length; assert.ok(n > 25, name + ' is walked: ' + n); }
const onSlabs = Rs => [...Rs.seen].some(k => { const [x, y] = k.split(',').map(Number); return x >= WL.ARENA.x0 && x <= WL.ARENA.x1 && y <= 31; });
assert.ok(onSlabs(R), "the Gargoyle's slabs are reached from the cavern mouth");
const silvers = L.ents.filter(e => e.t === 'silver'); assert.equal(silvers.length, 3, 'three silvers');
for (const s of silvers) assert.ok(near(s), 'silver reachable at ' + s.x + ',' + s.y);
for (const c of L.ents.filter(e => e.t === 'check')) assert.ok(near(c), 'checkpoint reachable at ' + c.x + ',' + c.y);
const band = Math.max(...rows) - Math.min(...rows); assert.ok(band >= 45, 'the stair climbs: a band of ' + band + ' rows');
{ const up = seen.filter(([x]) => (x >= 220 && x <= 249) || (x >= 336 && x <= 425)).length / seen.length;
  assert.ok(up > 0.15 && up < 0.45, 'about a third of it vertical, not half: ' + Math.round(100 * up) + '%'); }
{ const f = audit(L).findings; for (const q of f) console.log('  route-break ' + q.k + ' ' + q.what); assert.equal(f.length, 0, 'route-breaks finds nothing on the stair'); }
// 2b. the Gate Gargoyle
{ const A = L.arena, TSZ = 16; assert.equal(A.boss, 'gargoyle'); const g = L.ents.find(e => e.t === 'gargoyle'); assert.ok(g && g.x > WL.ARENA.x1 - 6, 'he is bolted over the tower gate');
  assert.ok(!L.ents.some(e => e.t === 'gate'), 'no gate: the level ends on his kill');
  const sl = L.ents.filter(e => e.t === 'mover' && e.arena), cr = sl.filter(e => e.cracked); assert.ok(sl.length >= 8 && cr.length >= 3, 'slabs, some cracked: ' + sl.length + '/' + cr.length);
  assert.ok(cr.every(e => !e.range), 'a cracked slab holds still: his opening is a place you choose to stand');
  for (const e of sl) assert.ok(e.y < A.floor / TSZ - 8, 'every slab is over the terrace, not on it');
  const lifts = L.ents.filter(e => e.t === 'vent' && e.rune && e.x > WL.ARENA.x0 && e.x < WL.ARENA.x1); assert.ok(lifts.length >= 3, 'rune columns from the terrace back up');
  for (const v of lifts) { assert.ok(v.y === A.floor / TSZ - 1 && v.y + 1 - v.h / TSZ < Math.min(...sl.map(e => e.y)), 'the column at ' + v.x + ' lifts from the terrace past the slabs');
    assert.ok(!sl.some(e => v.x >= e.x && v.x < e.x + (e.len || 3)), 'nothing over the column at ' + v.x); }
  assert.deepEqual(['diveTell', 'flareTell', 'gustTell', 'spitTell'].map(mode => markOf({ t: 'gargoyle', mode })), ['!!', '!!', '!', '!'], 'the dive and the flare wear the red mark; a shield turns the gust and the spit'); }
// 3. one verb a place
const inX = ([a, b]) => e => e.x >= a && e.x <= b;
const slabs = L.ents.filter(e => e.t === 'mover' && e.slab && inX(WL.PLACES.aqueduct)(e));
assert.ok(slabs.length >= 7, 'the aqueduct is crossed on seven slabs: ' + slabs.length);
assert.equal(slabs.filter(e => e.sink).length, 1, 'one of them sinks'); assert.equal(slabs.filter(e => e.vert).length, 1, 'one of them rises');
assert.ok(new Set(slabs.filter(e => !e.vert && !e.sink).map(e => e.speed)).size >= 3, 'the sliders go at different speeds');
assert.ok(L.ents.filter(e => e.t === 'broom' && e.sweep && inX(WL.PLACES.aqueduct)(e)).length >= 4, 'brooms that sweep you off the slabs');
for (const [a] of WL.PIERS.slice(1)) assert.equal(at(a - 1, WL.PIER + 2), T.NET, 'a rope up the face of the pier at ' + a);
{ let spikes = 0; for (let x = 140; x <= 219; x++) if (at(x, WL.PIER) === T.SPIKE) spikes++; assert.ok(spikes / 80 > 0.55, 'the cloister is floored with brambles: ' + spikes + ' of 80'); }
{ const g = L.ents.filter(e => e.t === 'glyph'); assert.equal(g.length, 6); assert.equal(g.filter(e => e.ceiling).length, 3, 'three glyphs up, three down'); assert.ok(g.every(e => !e.brief), 'toggle glyphs, not brief ones');
  for (const [u, d] of WL.GLYPHS) { assert.notEqual(at(u, WL.PIER), T.SPIKE, 'the up glyph at ' + u + ' is on safe floor'); assert.notEqual(at(d, WL.PIER), T.SPIKE, 'the down glyph at ' + d + ' lands on safe floor');
    for (let x = u; x <= d; x++) { let k = 1; while (k <= 14 && at(x, WL.PIER - k) === T.AIR) k++; assert.ok(k <= 14 && at(x, WL.PIER - k) === T.SOLID, 'a roof of tiles within the flip\'s 14 rows at ' + x); } } }
{ const S = build(); S.glyphBridges = []; const Rs = floodReach(S, T, { rides: true }); assert.ok(![...Rs.seen].some(k => +k.split(',')[0] > 214), 'without the glyphs the cloister cannot be crossed'); }
{ const cols = L.ents.filter(e => e.t === 'vent' && e.rune && inX(WL.PLACES.runestair)(e)); assert.equal(cols.length, 3, 'three rune columns up the shaft');
  assert.equal(new Set(cols.map(e => e.phase)).size, 3, 'lit one after another'); const [a, b, y0, y1] = L.witch.library;
  for (let y = y0; y <= y1; y++) for (let x = a; x <= b; x++) assert.equal(at(x, y), T.SOLID, 'the library chunk is stone'); assert.ok(silvers.some(s => s.x >= a && s.x <= b && s.y === y0 - 1), 'a silver on the library chunk'); }
{ const hs = L.mage.hedges.filter(([a]) => a >= 250 && a < WL.MINI.x0), G = WL.GARDEN;
  assert.ok(hs.some(([a, b, y0, y1]) => y1 <= G - 3 && at(a, G) === T.AIR && at(a, G - 2) === T.AIR), 'a tall hedge to go under');
  assert.ok(hs.some(([a, b, y0, y1]) => y1 === G && y0 >= G - 1), 'a low hedge to hop'); }
// 4. the Hedge Warden
assert.equal(L.mini.boss, 'hedgewarden'); assert.ok(L.ents.find(e => e.t === 'hedgewarden' && e.mini), 'he is placed, marked the mini');
assert.ok(L.mini.y0 !== undefined && L.mini.y1 !== undefined, 'his room has a height');
assert.equal(at(L.mini.gate, L.mini.floor / TS - 1), T.PORT, 'his gate is a portcullis');
{ const S = build(); for (let y = 0; y < S.H; y++) if (S.grid[y * S.W + S.mini.gate] === T.PORT) S.grid[y * S.W + S.mini.gate] = T.SOLID;
  const Rs = floodReach(S, T, { rides: true }); assert.ok(!onSlabs(Rs), 'his gate holds the way on'); }
assert.equal(L.witch.braziers.length, 2); for (const [x] of L.witch.braziers) assert.ok(x * TS > L.mini.x0 && x * TS < L.mini.x1, 'his braziers stand in his room');
assert.deepEqual(['cutTell', 'rushTell', 'thornTell'].map(mode => markOf({ t: 'hedgewarden', mode })), ['!', '!', '!!'], 'the cut and the rush a shield turns; the thorns wear the red mark');
assert.equal(markOf({ t: 'broom', mode: 'sweepTell' }), '!', 'the broom\'s sweep a shield braces against');
// 5. encounters
const src = readFileSync(new URL('../src/level.js', import.meta.url), 'utf8');
{ const at0 = src.indexOf('const GARRISON = {'); assert.ok(!src.slice(at0, at0 + 20000).includes('\n  witchlight: [['), 'no GARRISON row: its creatures are authored'); }
assert.ok(!(L.calm || []).length, 'no calm');
const NOT = new Set(['sign', 'check', 'coin', 'deco', 'silver', 'vent', 'mover', 'glyph', 'gate', 'hedgewarden', 'gargoyle', 'heart', 'coffer', 'stray', 'key', 'shrine', 'stal', 'mend']);
const foes = L.ents.filter(e => !NOT.has(e.t));
for (const e of L.encounters) assert.ok(e.n >= 3 && e.n <= 5, e.name + ' is 3-5 strong: ' + e.n);
for (const [name, [a, b]] of Object.entries(WL.PLACES)) if (name !== 'top') assert.ok(L.encounters.some(e => e.x0 >= a - 2 && e.x0 <= b), name + ' has an encounter');
const loose = foes.filter(e => !e.enc && !e.straggler); assert.deepEqual(loose.map(e => e.t + '@' + e.x), [], 'every creature is in an encounter or a straggler of the dead');
assert.ok(foes.filter(e => e.straggler).length <= 6, 'a handful of stragglers, not a sprinkle');
const perScreen = foes.length / (L.W / 24);
console.log('  ' + L.encounters.length + ' encounters (' + L.encounters.map(e => e.n).join(' ') + '), ' + foes.length + ' creatures, ' + perScreen.toFixed(2) + ' a screen');
assert.ok(foes.length >= 40 && foes.length <= 75 && perScreen >= 2.2 && perScreen <= 4.2, 'a total in the range of its neighbours (Fields 2.9, Folly 3.2, Burial 3.9 a screen)');
{ const els = foes.filter(e => e.elite); assert.ok(els.length >= 1 && els.every(e => e.enc), 'the elites are captains of encounters');
  for (const [name, [a, b]] of Object.entries(WL.PLACES)) assert.ok(els.filter(e => e.x >= a && e.x <= b).length <= 1, 'one elite in ' + name + ' at most'); }
// 6. its own look
assert.equal(L.music, 'witchlight', 'its own music');
assert.ok(L.duskLen && (L.W * TS) / L.duskLen < 0.45, 'the dusk grade stays under 0.45: ' + ((L.W * TS) / L.duskLen).toFixed(2));
assert.ok(L.tints.some(([a, b]) => a === 140) && L.tints.some(([a, b]) => b === L.W - 1), 'the light changes by place: twilight from the cloister, witchlight night from the garden');
assert.ok(L.mage.skins.filter(s => s[4] === 'witch').length >= 5, 'its own runed stone');
assert.equal(Object.keys(L.marks).length, 6, 'one landmark a place and the tower');

// 7. on the page
const I = idx('witchlight');
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{
    const boot=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(${I});BK.state='play';BK.god=true;BK.P.hp=BK.P.maxHp;BK.sim(10);};
    const clear=keep=>{for(const e of BK.enemies())if(e.t!=='hedgewarden'&&!(keep&&keep(e)))e.alive=false;};
    const out={};
    boot();BK.sim(120);out.boot={id:BK.L.witch?'witch':'?',hp:BK.P.hp,dead:!!BK.P.dead};
    /* THE CLOISTER: on the first glyph, holding right, he is turned over, walks the roof over the brambles and comes down at the next */
    {boot();clear();BK.tp(145,${WL.PIER});BK.sim(20);BK.keys.right=true;let up=false,hurt=0;const hp0=BK.P.hp;BK.god=false;
     for(let i=0;i<420;i++){BK.sim(1);if(BK.P.flip)up=true;if(up&&!BK.P.flip&&BK.P.ground)break;}BK.keys.right=false;BK.sim(30);
     out.cloister={up,x:Math.floor(BK.P.x/16),row:Math.round(BK.P.y/16)-1,flip:!!BK.P.flip,hurt:hp0-BK.P.hp};BK.god=true;}
    /* A RUNE COLUMN lifts him */
    {boot();clear();const v=BK.props().find(p=>p.t==='vent'&&p.rune);BK.tp(Math.floor(v.x/16),Math.round(v.y/16)-1);const y0=BK.P.y;let top=y0;for(let i=0;i<360;i++){BK.sim(1);top=Math.min(top,BK.P.y);}
     out.rune={rise:Math.round((y0-top)/16)};}
    /* THE SINKING SLAB: stood on, it goes down; left, it comes back */
    {boot();clear();const m=BK.movers().find(q=>q.sink);BK.P.x=m.x+m.w/2;BK.P.y=m.y-1;BK.P.vy=0;BK.sim(4);const y0=m.y;BK.sim(300);const sunk=Math.round((m.y-y0)/16);
     BK.P.x=m.x0-120;BK.P.y=m.y0-200;BK.sim(900);out.sink={sunk,back:Math.round((m.y-m.y0)/16),rode:0};}
    /* THE SWEEP: a broom by his slab sweeps an unguarded hero off it; a shield braces him */
    {const run=guard=>{boot();clear(e=>e.t==='broom'&&e.sweep);const b=BK.enemies().filter(e=>e.t==='broom'&&e.sweep).sort((a,c)=>a.x-c.x)[0];for(const e of BK.enemies())if(e.t==='broom'&&e!==b)e.alive=false;
       BK.tp(52,${WL.PIER});BK.sim(20);b.x=BK.P.x+60;b.y=BK.P.y-30;b.cd=0;b.mode='fly';BK.god=false;BK.P.hp=BK.P.maxHp;const x0=BK.P.x;let told=false,off=false;
       for(let i=0;i<150;i++){if(guard)BK.keys.block=true;BK.sim(1);if(b.mode==='sweepTell')told=true;if(Math.abs(BK.P.vx)>150&&!BK.P.ground)off=true;}BK.keys.block=false;BK.god=true;
       return {told,off,moved:Math.round(BK.P.x-x0),hurt:BK.P.maxHp-BK.P.hp};};
     out.sweep={open:run(false),guarded:run(true)};}
    /* THE ROOF ARMOUR hangs from the roof while he walks the floor, and falls with him when he turns over */
    {boot();clear(e=>e.t==='armour'&&e.ceiling);const a=BK.enemies().filter(e=>e.t==='armour'&&e.ceiling).sort((p,q)=>p.x-q.x)[0];BK.tp(145,${WL.PIER});BK.sim(90);const before={gs:a.gs,row:+(a.y/16).toFixed(1)};
     BK.keys.right=true;for(let i=0;i<200&&!BK.P.flip;i++)BK.sim(1);BK.keys.right=false;BK.sim(90);const flipped={gs:a.gs,row:+(a.y/16).toFixed(1),ground:!!a.onGround};
     out.armour={before,flipped};}
    /* THE HEDGE WARDEN: he wakes at the trigger; standing in him costs nothing; his gate opens on his death */
    {boot();const M=BK.L.mini;BK.tp(Math.round(M.trigger/16)+1,Math.round(M.floor/16)-1);BK.sim(120);const w=BK.enemies().find(e=>e.t==='hedgewarden');
     const woke={active:!!BK.miniActive,mode:w.mode};BK.god=false;BK.P.hp=BK.P.maxHp;const hp0=BK.P.hp;
     for(let i=0;i<90;i++){w.cd=99;if(w.mode!=='stalk')w.mode='stalk';BK.P.x=w.x;BK.P.y=w.y;BK.sim(1);}const touch=hp0-BK.P.hp;BK.god=true;
     const gi=(Math.round(M.floor/16)-1)*BK.L.W+M.gate,before=BK.L.grid[gi];w.growth=2;w.mode='stump';w.modeT=9;w.hp=3;BKT.hurtEnemy(w,50,w.x-20,false);BK.sim(120);
     out.warden={woke,touch,alive:w.alive,gateBefore:before,gateAfter:BK.L.grid[gi]};}
    /* THE GATE GARGOYLE: asleep on the gate until you are on his slabs; touching him costs nothing; his kill wins the level */
    {boot();clear(e=>e.t==='gargoyle');const g=BK.enemies().find(e=>e.t==='gargoyle');const asleep=g.mode;const s=BK.movers().filter(m=>m.arena&&!m.cracked).sort((a,b)=>a.x-b.x)[0];
     BK.P.x=s.x+s.w/2;BK.P.y=s.y-1;BK.P.vy=0;BK.sim(90);const woke={active:!!BK.bossActive,mode:g.mode};BK.god=false;BK.P.hp=BK.P.maxHp;const hp0=BK.P.hp;
     for(let i=0;i<90;i++){g.mode='hover';g.cd=99;g.x=BK.P.x;g.y=BK.P.y;BK.sim(1);}const touch=hp0-BK.P.hp;BK.god=true;
     g.hp=1;BKT.hurtEnemy(g,40,g.x-20,false);let won=false;for(let i=0;i<900&&!won;i++){BK.sim(1);if(BK.state!=='play')won=BK.state;}
     out.gargoyle={asleep,woke,touch,alive:g.alive,won};}
    out.errors=(window.__errs||[]).slice(0,3);return out;})()`, 300000);
  console.log(JSON.stringify(r));
  assert.ok(!r.boot.dead && r.boot.id === 'witch', 'the stair boots: ' + JSON.stringify(r.boot));
  assert.ok(r.cloister.up && !r.cloister.flip && r.cloister.x >= 166 && r.cloister.x <= 175 && Math.abs(r.cloister.row - WL.PIER) <= 1 && r.cloister.hurt === 0, 'a glyph turns him over and the roof carries him over the brambles to the safe pocket, unhurt: ' + JSON.stringify(r.cloister));
  assert.ok(r.rune.rise >= 8, 'a rune column lifts him: ' + JSON.stringify(r.rune));
  assert.ok(r.sink.sunk >= 3 && r.sink.back === 0, 'the slab sinks under him and comes back when he leaves it: ' + JSON.stringify(r.sink));
  assert.ok(r.sweep.open.told && r.sweep.open.off && r.sweep.open.hurt > 0, 'a sweeping broom tells, then takes an unguarded hero off his feet: ' + JSON.stringify(r.sweep));
  assert.ok(r.sweep.guarded.told && !r.sweep.guarded.off && r.sweep.guarded.hurt === 0, 'a shield braces him against it: ' + JSON.stringify(r.sweep));
  assert.ok(r.armour.before.gs === -1 && r.armour.flipped.gs === -1, 'the roof armour hangs from the roof until he turns over, and stays with him up there: ' + JSON.stringify(r.armour));
  assert.ok(r.warden.woke.active && r.warden.woke.mode !== 'sleep', 'he wakes at his gate: ' + JSON.stringify(r.warden));
  assert.equal(r.warden.touch, 0, 'touching him costs nothing (the touch rule)');
  assert.ok(!r.warden.alive && r.warden.gateBefore === T.PORT && r.warden.gateAfter !== T.PORT, 'his gate opens when he dies: ' + JSON.stringify(r.warden));
  assert.ok(r.gargoyle.asleep === 'sleep' && r.gargoyle.woke.active && r.gargoyle.woke.mode !== 'sleep', 'the Gargoyle sleeps on his gate and wakes when you come onto his slabs: ' + JSON.stringify(r.gargoyle));
  assert.equal(r.gargoyle.touch, 0, 'touching the Gargoyle costs nothing (the touch rule)');
  assert.ok(!r.gargoyle.alive && r.gargoyle.won, 'his kill ends the level: ' + JSON.stringify(r.gargoyle));
  assert.deepEqual(pg.errors.slice(0, 3), [], 'no errors on the page');
} finally { pg.close(); }
console.log('THE WITCHLIGHT STAIR: five places, one verb each, encounters not a sprinkle, its own light - the Hedge Warden holds the gate, and the Gargoyle the top.');
