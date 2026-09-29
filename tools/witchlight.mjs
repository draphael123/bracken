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
/* THE ARENA'S LIP is reached (the reach model does not ride his slabs; the slab chain itself - its gaps and the rune columns up to it - is
   asked by tools/gargoyle-smash.mjs). The row comes from WL.TOP: the rework lowered the room, and the fixed row 31 it replaced went stale */
const onSlabs = Rs => [...Rs.seen].some(k => { const [x, y] = k.split(',').map(Number); return x >= WL.ARENA.x0 && x <= WL.ARENA.x1 && y <= WL.TOP - 1; });
assert.ok(onSlabs(R), "the Gargoyle's slabs are reached from the cavern mouth");
const silvers = L.ents.filter(e => e.t === 'silver'); assert.equal(silvers.length, 3, 'three silvers');
for (const s of silvers) assert.ok(near(s), 'silver reachable at ' + s.x + ',' + s.y);
for (const c of L.ents.filter(e => e.t === 'check')) assert.ok(near(c), 'checkpoint reachable at ' + c.x + ',' + c.y);
const band = Math.max(...rows) - Math.min(...rows); assert.ok(band >= 45, 'the stair climbs: a band of ' + band + ' rows');
{ const up = seen.filter(([x]) => (x >= 220 && x <= 249) || (x >= WL.PLACES.battlements[0] && x <= WL.PLACES.battlements[1])).length / seen.length;   /* the rune stair and the battlements' climb (it read 336-425, the old stair's top and arena, before the battlements moved the top on) */
  assert.ok(up > 0.15 && up < 0.45, 'about a third of it vertical, not half: ' + Math.round(100 * up) + '%'); }
{ const f = audit(L).findings; for (const q of f) console.log('  route-break ' + q.k + ' ' + q.what); assert.equal(f.length, 0, 'route-breaks finds nothing on the stair'); }
// 2b. the Gate Gargoyle
{ const A = L.arena, TSZ = 16; assert.equal(A.boss, 'gargoyle'); const g = L.ents.find(e => e.t === 'gargoyle'); assert.ok(g && g.x > WL.ARENA.x1 - 6, 'he is bolted over the tower gate');
  assert.ok(!L.ents.some(e => e.t === 'gate'), 'no gate: the level ends on his kill');
  const sl = L.ents.filter(e => e.t === 'mover' && e.arena); assert.ok(sl.length >= 12 && new Set(sl.map(e => e.y)).size === 2, 'thirteen slabs in two tiers (round three, 2026-09-27: every one gives under him, GARG.smashAny): ' + sl.length);
  for (const e of sl) assert.ok(e.y <= A.floor / TSZ - 6, 'every slab is over the terrace, not on it (six rows at least: the rework lowered them from 11-13, tools/gargoyle-smash.mjs)');
  for (let x = WL.ARENA.x0; x <= WL.ARENA.x1; x++) assert.equal(at(x, A.floor / TSZ - 1), T.SPIKE, 'his floor is spikes at ' + x);
  assert.ok((L.winds || []).some(z => z.arena && (z.wells || []).length >= 3), 'and its wind brings you back up to his slabs (it replaced the rune columns from the terrace)');
  assert.deepEqual(['diveTell', 'flareTell', 'fireballTell', 'breathTell'].map(mode => markOf({ t: 'gargoyle', mode })), ['!!', '!!', '!', '!'], 'the dive and the flare wear the red mark; a shield turns the fireball (the wing gust\'s place since 2026-09-28) and the fire breath'); }
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
assert.deepEqual(['cutTell', 'rushTell', 'thornTell', 'lashTell', 'rootsTell'].map(mode => markOf({ t: 'hedgewarden', mode })), ['!', '!', '!!', '!', '!!'], 'the cut, the rush and the thorn lash a shield turns; the thorns and the roots wear the red mark');
/* THE ROOTED GARDEN (claude/hedgewarden2, Daniel's playtest 2026-09-28: his section a bit longer): half as long again to his gate, braziers on
   its lawn, and hedges that put out roots toward one - every root runs at a fire, so standing at the fire is always an answer */
{ const G0 = WL.PLACES.garden[0], lead = WL.MINI.x0 - G0, fires = ((L.witch && L.witch.fires) || []).map(([x]) => x), roots = (L.witch && L.witch.roots) || [];
  assert.ok(lead >= 70, 'the garden before his gate is half as long again: ' + lead + ' columns (it was 50)');
  assert.ok(fires.length >= 3 && fires.every(x => x > G0 && x < WL.MINI.x0), 'braziers on the garden lawn: ' + fires);
  assert.ok(roots.length >= 3 && roots.every(m => fires.some(x => (x - m.x) * m.dir > 0 && (m.to - x) * m.dir >= 0)), 'hedges that put out roots, each toward a brazier: ' + JSON.stringify(roots));
  assert.ok(new Set(roots.map(m => m.dir)).size === 2, 'and somewhere they run out both ways (the twist, his room in small)'); }
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
assert.equal(Object.keys(L.marks).length, 7, 'one landmark a place and the tower (the battlements, 2026-09-26, are the sixth place)');

// 7. on the page
const I = idx('witchlight');
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{
    const boot=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(${I});BK.state='play';BK.god=true;BK.P.hp=BK.P.maxHp;BK.sim(10);};
    const clear=keep=>{for(const e of BK.enemies())if(e.t!=='hedgewarden'&&!(keep&&keep(e)))e.alive=false;};
    const need=(v,what)=>{if(!v)throw new Error('the stair did not put up '+what+' (a contended page: the level had not settled)');return v;};   /* a missing thing names itself: under a loaded machine this used to read as "cannot read properties of undefined" */
    const out={};
    boot();BK.sim(120);out.boot={id:BK.L.witch?'witch':'?',hp:BK.P.hp,dead:!!BK.P.dead};
    /* THE CLOISTER: on the first glyph, holding right, he is turned over, walks the roof over the brambles and comes down at the next */
    {boot();clear();BK.tp(145,${WL.PIER});BK.sim(20);BK.keys.right=true;let up=false,hurt=0;const hp0=BK.P.hp;BK.god=false;
     for(let i=0;i<420;i++){BK.sim(1);if(BK.P.flip)up=true;if(up&&!BK.P.flip&&BK.P.ground)break;}BK.keys.right=false;BK.sim(30);
     out.cloister={up,x:Math.floor(BK.P.x/16),row:Math.round(BK.P.y/16)-1,flip:!!BK.P.flip,hurt:hp0-BK.P.hp};BK.god=true;}
    /* A RUNE COLUMN lifts him */
    {boot();clear();const v=need(BK.props().find(p=>p.t==='vent'&&p.rune),'a rune column');BK.tp(Math.floor(v.x/16),Math.round(v.y/16)-1);const y0=BK.P.y;let top=y0;for(let i=0;i<360;i++){BK.sim(1);top=Math.min(top,BK.P.y);}
     out.rune={rise:Math.round((y0-top)/16)};}
    /* THE SINKING SLAB: stood on, it goes down; left, it comes back */
    {boot();clear();const m=need(BK.movers().find(q=>q.sink),'the sinking slab');BK.P.x=m.x+m.w/2;BK.P.y=m.y-1;BK.P.vy=0;BK.sim(4);const y0=m.y;BK.sim(300);const sunk=Math.round((m.y-y0)/16);
     BK.P.x=m.x0-120;BK.P.y=m.y0-200;BK.sim(900);out.sink={sunk,back:Math.round((m.y-m.y0)/16),rode:0};}
    /* THE SWEEP: a broom by his slab sweeps an unguarded hero off it; a shield braces him */
    {const run=guard=>{boot();clear(e=>e.t==='broom'&&e.sweep);const b=need(BK.enemies().filter(e=>e.t==='broom'&&e.sweep).sort((a,c)=>a.x-c.x)[0],'a sweeping broom');for(const e of BK.enemies())if(e.t==='broom'&&e!==b)e.alive=false;
       BK.tp(52,${WL.PIER});BK.sim(20);b.x=BK.P.x+60;b.y=BK.P.y-30;b.cd=0;b.mode='fly';BK.god=false;BK.P.hp=BK.P.maxHp;const x0=BK.P.x;let told=false,off=false;
       for(let i=0;i<150;i++){if(guard)BK.keys.block=true;BK.sim(1);if(b.mode==='sweepTell')told=true;if(Math.abs(BK.P.vx)>150&&!BK.P.ground)off=true;}BK.keys.block=false;BK.god=true;
       return {told,off,moved:Math.round(BK.P.x-x0),hurt:BK.P.maxHp-BK.P.hp};};
     out.sweep={open:run(false),guarded:run(true)};}
    /* THE ROOF ARMOUR hangs from the roof while he walks the floor, and falls with him when he turns over */
    {boot();clear(e=>e.t==='armour'&&e.ceiling);const a=need(BK.enemies().filter(e=>e.t==='armour'&&e.ceiling).sort((p,q)=>p.x-q.x)[0],'a roof armour');BK.tp(145,${WL.PIER});BK.sim(90);const before={gs:a.gs,row:+(a.y/16).toFixed(1)};
     BK.keys.right=true;for(let i=0;i<200&&!BK.P.flip;i++)BK.sim(1);BK.keys.right=false;BK.sim(90);const flipped={gs:a.gs,row:+(a.y/16).toFixed(1),ground:!!a.onGround};
     out.armour={before,flipped};}
    /* THE HEDGE WARDEN: he wakes at the trigger; standing in him costs nothing; his gate opens on his death */
    {boot();const M=BK.L.mini;BK.tp(Math.round(M.trigger/16)+1,Math.round(M.floor/16)-1);BK.sim(120);const w=need(BK.enemies().find(e=>e.t==='hedgewarden'),'the Hedge Warden');
     const woke={active:!!BK.miniActive,mode:w.mode};BK.god=false;BK.P.hp=BK.P.maxHp;const hp0=BK.P.hp;
     for(let i=0;i<90;i++){w.cd=99;if(w.mode!=='stalk')w.mode='stalk';BK.P.x=w.x;BK.P.y=w.y;BK.sim(1);}const touch=hp0-BK.P.hp;BK.god=true;
     const gi=(Math.round(M.floor/16)-1)*BK.L.W+M.gate,before=BK.L.grid[gi];w.growth=2;w.mode='stump';w.modeT=9;w.burnT=3;w.hp=3;BKT.hurtEnemy(w,50,w.x-20,false);   /* (a burning stump: since claude/hedgewarden2 no other takes a blow) */BK.sim(120);
     out.warden={woke,touch,alive:w.alive,gateBefore:before,gateAfter:BK.L.grid[gi]};}
    /* THE LAWN ROUTE AND THE FIRE ROUTE (claude/hedgewarden3, Daniel's playtest 2026-09-28: the green stump took nothing and regrew, so
       he looked to heal for no reason). The same blow every third of a second, held at one spot, to his death: on the open lawn a green
       stump takes a quarter and nothing grows back, so it is slow but it gets there; at a brazier the stump burns and it is quick. His
       bar never goes up on either route */
    const route=at=>{boot();const M=BK.L.mini;BK.tp(Math.round(M.trigger/16)+1,Math.round(M.floor/16)-1);BK.sim(120);const w=need(BK.enemies().find(e=>e.t==='hedgewarden'),'the Hedge Warden');
      const x=at(M);let blows=0,rise=0,prev=w.hp,burnt=0;const seen=new Set();
      for(let i=0;i<60*600&&w.alive;i++){w.x=x;BK.P.x=x-30;BK.P.y=M.floor;BK.P.hp=BK.P.maxHp;if(i%20===0&&w.mode!=='wake'){BKT.hurtEnemy(w,30,w.x-20,false);blows++;}BK.sim(1);
        if(w.hp>prev+1e-6)rise++;prev=w.hp;seen.add(w.mode);if((w.burnT||0)>0)burnt++;}
      return {dead:!w.alive,blows,rise,burnt,seen:[...seen]};};
    out.routes={lawn:route(M=>(M.x0+M.x1)/2),fire:route(M=>BK.L.witch.braziers[0][0]*16+20)};
    /* THE HEDGE WARDEN'S NEW ATTACKS (claude/hedgewarden2): each told, and each with its answer. THE THORN LASH lands well out of his
       cut's reach on a hero standing, not on one in the air, and a shield turns it; THE ROOTS crawl out and bite a hero on the lawn, and
       burn out at a brazier before they reach one standing past it. In the garden a rooted hedge's root bites a hero in its strip and
       burns out at the fire. And a fight left running (god mode, hero standing off) tells all five attacks */
    {boot();const M=BK.L.mini;BK.tp(Math.round(M.trigger/16)+1,Math.round(M.floor/16)-1);BK.sim(120);const w=need(BK.enemies().find(e=>e.t==='hedgewarden'),'the Hedge Warden');
     const mid=(M.x0+M.x1)/2;
     const hit=(what,px,each)=>{BK.god=true;w.mode='stalk';w.cd=99;BK.sim(20);w.x=mid;w.face=Math.sign(px-w.x)||1;w.cd=99;w.burnT=0;w.phase=1;BK.P.x=px;BK.P.y=M.floor;BK.P.vy=0;BK.P.vx=0;BK.sim(2);
       BK.god=false;BK.P.hp=BK.P.maxHp;BK.P.inv=0;const hp0=BK.P.hp;w.mode=what+'Tell';w.modeT=0.02;const seen=new Set();
       for(let i=0;i<150;i++){if(each)each(i);else BK.P.x=px;BK.sim(1);seen.add(w.mode);w.cd=99;}
       BK.keys.block=false;BK.god=true;const o={seen:[...seen],took:hp0-BK.P.hp};BK.P.hp=BK.P.maxHp;return o;};
     const lash={stood:hit('lash',mid+100),jumped:hit('lash',mid+100,i=>{if(i<2){BK.P.y=M.floor-30;BK.P.vy=-150;}}),guarded:hit('lash',mid+100,()=>{BK.keys.block=true;BK.P.face=-1;})};
     const bz=BK.L.witch.braziers.map(([x])=>x*16+8),far=Math.max(...bz);BK.L.hedgeRoots=[];
     const roots={bit:hit('roots',mid+120)};BK.L.hedgeRoots=[];roots.past=hit('roots',far+14);roots.burnt=(BK.L.hedgeRoots||[]).some(r=>r.burnt);
     BK.god=true;w.mode='stalk';w.cd=0;const told=new Set();for(let i=0;i<60*60;i++){BK.P.x=w.x+90;BK.P.y=M.floor;BK.sim(1);told.add(w.mode);if(w.mode==='felled'||w.mode==='stump'){w.mode='stalk';w.hp=w.maxHp;}}
     const G=${WL.GARDEN},fx=((BK.L.witch.fires||[])[0]||[262])[0],garden=g=>{boot();clear(()=>false);BK.tp(g,G);BK.god=false;BK.P.hp=BK.P.maxHp;const hp0=BK.P.hp;BK.L.hedgeRoots=[];let burnt=0;
       for(let i=0;i<60*8;i++){BK.P.x=g*16+8;BK.P.hp=Math.max(BK.P.hp,20);BK.sim(1);burnt=Math.max(burnt,(BK.L.hedgeRoots||[]).filter(r=>r.burnt).length);}const o={took:hp0-BK.P.hp,burnt};BK.god=true;return o;};
     out.newAttacks={lash,roots,told:[...told],garden:{strip:garden(fx+5),fire:garden(fx)}};}
    /* THE GATE GARGOYLE: asleep on the gate until you are on his slabs; touching him costs nothing; his kill wins the level */
    {boot();clear(e=>e.t==='gargoyle');const g=need(BK.enemies().find(e=>e.t==='gargoyle'),'the Gate Gargoyle');const asleep=g.mode;const s=need(BK.movers().filter(m=>m.arena).sort((a,b)=>a.x-b.x)[0],'his slabs');
     BK.P.x=s.x+s.w/2;BK.P.y=s.y-1;BK.P.vy=0;BK.sim(90);const woke={active:!!BK.bossActive,mode:g.mode};BK.god=false;BK.P.hp=BK.P.maxHp;const hp0=BK.P.hp;
     for(let i=0;i<90;i++){g.mode='hover';g.cd=99;g.x=BK.P.x;g.y=BK.P.y;BK.sim(1);}const touch=hp0-BK.P.hp;BK.god=true;
     g.mode='stunned';g.modeT=3;g.stompNow=g.hp;BKT.hurtEnemy(g,g.hp,g.x-20,true);g.stompNow=0;let won=false;   /* (he is stone: the kill is a stomp on the spikes, tools/gargoyle-stomp.mjs) */for(let i=0;i<900&&!won;i++){BK.sim(1);if(BK.state!=='play')won=BK.state;}
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
  console.log('  the Warden, the lawn route and the fire route: ' + JSON.stringify(r.routes));
  assert.ok(r.routes.lawn.dead && r.routes.lawn.burnt === 0 && r.routes.lawn.seen.includes('stump'), 'on the open lawn alone, green wood a blow only chips, he still comes down in the end: ' + JSON.stringify(r.routes.lawn));
  assert.ok(r.routes.lawn.rise === 0 && r.routes.fire.rise === 0, 'damage done stays done: his bar never goes up, on the lawn or at the fire: ' + JSON.stringify(r.routes));
  assert.ok(r.routes.fire.dead && r.routes.fire.burnt > 0 && r.routes.fire.blows * 2 <= r.routes.lawn.blows, 'the brazier is the big payoff: at the fire he comes down in half the blows or fewer: ' + JSON.stringify(r.routes));
  { const n = r.newAttacks; console.log('  the Warden\'s new attacks: ' + JSON.stringify(n));
    assert.ok(n && n.lash.stood.seen.includes('lash') && n.lash.stood.took > 0, 'THE THORN LASH lands well out past his cut, on a hero standing: ' + JSON.stringify(n && n.lash));
    assert.ok(n.lash.jumped.took === 0 && n.lash.guarded.took === 0, 'a jump clears the lash, and a shield turns it: ' + JSON.stringify(n.lash));
    assert.ok(n.roots.bit.seen.includes('roots') && n.roots.bit.took > 0, 'THE ROOTS crawl out along the lawn and bite a hero on it: ' + JSON.stringify(n.roots));
    assert.ok(n.roots.past.took === 0 && n.roots.burnt, 'and burn out at a brazier before they reach a hero standing past it: ' + JSON.stringify(n.roots));
    assert.ok(['cutTell', 'rushTell', 'thornTell', 'lashTell', 'rootsTell'].every(m => n.told.includes(m)), 'a fight left running tells all five of his attacks: ' + n.told);
    assert.ok(n.garden.strip.took > 0 && n.garden.fire.took === 0 && n.garden.fire.burnt > 0, 'THE ROOTED GARDEN: a hedge\'s root bites a hero in its strip, and burns out at the fire he can stand by: ' + JSON.stringify(n.garden)); }
  assert.ok(r.gargoyle.asleep === 'sleep' && r.gargoyle.woke.active && r.gargoyle.woke.mode !== 'sleep', 'the Gargoyle sleeps on his gate and wakes when you come onto his slabs: ' + JSON.stringify(r.gargoyle));
  assert.equal(r.gargoyle.touch, 0, 'touching the Gargoyle costs nothing (the touch rule)');
  assert.ok(!r.gargoyle.alive && r.gargoyle.won, 'his kill ends the level: ' + JSON.stringify(r.gargoyle));
  assert.deepEqual(pg.errors.slice(0, 3), [], 'no errors on the page');
} finally { pg.close(); }
console.log('THE WITCHLIGHT STAIR: five places, one verb each, encounters not a sprinkle, its own light - the Hedge Warden holds the gate, and the Gargoyle the top.');
