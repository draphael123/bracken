/* tools/courtyard.mjs — THE WARDED COURTYARD and THE COMMON WHELP'S FIREBALL (claude/courtyard; Daniel, 2026-09-28):
     1. "REPLACE section 1 of THE MAGE'S FOLLY (the hedge maze, topiary, gate) with THE WARDED COURTYARD, ~60-70 columns ... a stone
        courtyard at the tower's foot. It TEACHES THE TOWER'S RULE OUTDOORS - strike a rune and the paving slabs slide (a path, a bridge,
        a step), so the library DEVELOPS it instead of introducing it ... APPRENTICES + GARGOYLES (whelps) on the courtyard walls. The
        tower rises right in front. Keep the barred gatehouse beat if it fits."
     2. "GARGOYLES ONLY WHERE THERE ARE SPIKES to kill them: every whelp ... needs spikes (or a cracked ledge over spikes) it can be
        stomped onto, as on the Witchlight Stair."
     3. "THE COMMON GARGOYLE (whelp) GETS A FIREBALL: ONE smaller, weaker told fireball (the Gate Gargoyle now throws TWO - keep his
        distinct) ... it applies wherever whelps appear (the Witchlight Stair too)."
   Node first (the level's shape, the numbers, the mark), then the page (the three slabs struck and moved, a whelp over the bridge
   stuck on the drain's spikes and stomped, its fireball told, single, blocked, and thrown on the Witchlight Stair too).
   Every assertion is SOFT and all are printed, so a run on the old code lists everything it does not do. */
import { install } from './node-canvas.mjs';
import { LEVELS, T } from '../src/level.js';
import { markOf } from '../src/marks.js';
import { openPage } from './cdp.mjs';
install();
const fails = [], ok = (c, m) => { if (!c) fails.push(m); console.log((c ? '  ok   ' : '  FAIL ') + m); };
const WHF = await import('../src/gargoyle-whelp.js'), { GARG } = await import('../src/gate-gargoyle.js');
const I = LEVELS.findIndex(l => l.id === 'mage'), L = LEVELS[I].build(), G = 40, at = (x, y, LL = L) => LL.grid[y * LL.W + x];
const door = L.mage && L.mage.outside, yard = L.ents.filter(e => e.x < door);
// 1. THE WARDED COURTYARD: its size, and the tower after it moved whole
ok(door >= 60 && door <= 70 && L.W === 712 - (118 - door), 'the yard is ' + door + ' columns (60-70), and the level is shorter by what the grounds lost: W ' + L.W);
ok(at(door, G - 1) === T.AIR && at(door + 1, G - 1) === T.AIR && at(door + 2, G - 3) === T.AIR, 'the tower\'s front door opens at the yard\'s end (column ' + door + ')');
ok(L.arena && L.arena.x0 === (657 - (118 - door)) * 16 && L.mini && L.mini.gate === 262 - (118 - door), 'the Archmage\'s room and the Homunculus\'s gate moved with the tower: ' + (L.arena && L.arena.x0 / 16) + ', ' + (L.mini && L.mini.gate));
ok(!yard.some(e => ['topiary', 'imp', 'broom'].includes(e.t)) && !(L.mage.hedges || []).length, 'no hedge maze left: no topiary, imp or broom in the yard, no hedges');
ok(yard.filter(e => e.t === 'apprentice').length >= 2 && yard.filter(e => e.t === 'whelp').length >= 2, 'its foes are his apprentices and whelps: ' + yard.filter(e => e.t === 'apprentice' || e.t === 'whelp').map(e => e.t + '@' + e.x).join(' '));
ok((L.mage.skins || []).some(s => s[4] === 'paving' && s[0] === 0 && s[1] >= door - 1), 'the yard is paved (its own skin), not grass');
ok(L.mage.yard === G && L.towerBackdrop !== false, 'the yard has its backdrop row (the tower rising over the yard wall, src/tower-ascent.js)');
{ const S = (L.mage.shelves || []).filter(s => s.slab), post = r => L.ents.find(e => e.t === 'rune' && e.shelf === L.mage.shelves.indexOf(r));
  const step = S.find(s => s.yUp < s.yDown && s.yDown === G), bridge = S.find(s => s.tile === T.ONEWAY && s.yUp === G), path = S.find(s => s.yUp < s.yDown && s.yDown < G && s.h >= 3);
  ok(S.length === 3 && S.every(s => s.x1 < door), 'THREE WARDED SLABS in the yard, all before the door: ' + S.map(s => s.x0 + '-' + s.x1).join(' '));
  ok(S.every(s => { const r = post(s); return r && r.post && r.y === G - 1 && at(r.x, G) === T.SOLID; }), 'every one\'s rune stands on a warding post on the paving, where a blade finds it');
  if (step) { let tall = step.x1 + 1; while (at(tall, G - 1) !== T.SOLID && tall < door) tall++; let h = 0; while (at(tall, G - 1 - h) === T.SOLID) h++;
    ok(h >= 5 && step.yUp === G - h + 2 && at(step.x0 - 1, G - 1) === T.SOLID, 'A STEP: the terrace is ' + h + ' rows (no hero jumps it); the slab comes up out of the floor to two rows under its top, beside a mounting block'); }
  else ok(false, 'A STEP: a slab that rises out of the floor');
  if (bridge) { let x0 = bridge.x0; while (at(x0 - 1, G) === T.AIR) x0--; let x1 = bridge.x1; while (at(x1 + 1, G) === T.AIR) x1++; const spiked = [...Array(x1 - x0 + 1)].map((_, i) => x0 + i).filter(x => [...Array(8)].some((_, d) => at(x, G + d) === T.SPIKE));
    ok(x1 - x0 + 1 >= 7 && bridge.x0 - x0 <= 2 && x1 - bridge.x1 <= 2 && spiked.length >= 6, 'A BRIDGE: the drain is ' + (x1 - x0 + 1) + ' wide and spiked (' + spiked.length + ' columns); up, a one-way slab leaves two short jumps (' + (bridge.x0 - x0) + ', ' + (x1 - bridge.x1) + ')');
    ok((L.winds || []).some(z => z.x0 <= bridge.x0 && z.x1 >= bridge.x1 && z.exits.every(([x]) => x < z.x0)), 'the drain is a wind zone that brings a fall back behind it (spike-winds.js)'); }
  else ok(false, 'A BRIDGE: a one-way slab that rises out of a spiked drain to the floor');
  if (path) { const gate = (L.mage.skins || []).find(s => s[4] === 'gate' && s[0] <= path.x0 && s[1] >= path.x1);
    ok(!!gate && at(gate[1], path.yDown) === T.AIR && gate[2] < G - 10, 'A PATH: the postern through the barred gatehouse (' + (gate ? gate[0] + '-' + gate[1] : '-') + '), a stack of slabs across it that slides up into the wall'); }
  else ok(false, 'A PATH: slabs across a passage that slide up out of it');
  ok(!!L.mage.portcullis && L.ents.some(e => e.t === 'sign' && /BARRED/.test(e.text) && e.x < door), 'THE BARRED GATE is kept: its portcullis drawn down, and the sign that says so'); }
{ const lib = L.ents.find(e => e.t === 'sign' && /^THE LIBRARY\./.test(e.text));
  ok(lib && !/STRIKE THE RUNE ON A STACK AND THE STACK SLIDES/.test(lib.text) && /TOO/.test(lib.text), 'the library DEVELOPS the rule, not introduces it: ' + (lib && lib.text)); }
// 2. every whelp over spikes it can be stomped onto - here and on the Witchlight Stair
const W2 = LEVELS[LEVELS.findIndex(l => l.id === 'witchlight')].build();
for (const [name, LL] of [['the Folly', L], ['the Witchlight Stair', W2]]) {
  const bad = LL.ents.filter(e => e.t === 'whelp').filter(e => { for (let dx = -4; dx <= 4; dx++) for (let d = 1; d <= LL.H; d++) { const y = e.y + d; if (y < LL.H && at(e.x + dx, y, LL) === T.SPIKE && (LL.winds || []).some(z => e.x + dx >= z.x0 && e.x + dx <= z.x1 && Math.abs(z.row - y) <= 1)) return false; } return true; });
  ok(LL.ents.some(e => e.t === 'whelp') && bad.length === 0, 'every whelp on ' + name + ' sits over a wind zone\'s spikes (within four columns, anywhere below): ' + (bad.map(e => e.x + ',' + e.y).join(' ') || 'all')); }
{ const W = L.ents.filter(e => e.t === 'whelp' && e.x < door), footing = e => { for (let dx = -6; dx <= 6; dx++) { const x = e.x + dx;
    if (L.ents.some(m => m.t === 'mover' && m.brittle && x >= m.x && x < m.x + (m.len || 3))) return 'a cracked ledge'; if ((L.mage.shelves || []).some(s => s.tile === T.ONEWAY && x >= s.x0 && x <= s.x1)) return 'the one-way bridge'; } return null; };
  ok(W.length && W.every(footing), 'and each yard whelp is over footing it dives THROUGH onto them: ' + W.map(e => e.x + ' ' + footing(e)).join(', ')); }
// 3. the whelp's one fireball, next to his two
{ const B = WHF.WH.ball || {};
  ok(B.r < GARG.ball.r && WHF.WH.dmg.fire < GARG.dmg.fireball && B.v <= GARG.ball.v && B.tell > 0.5, 'THE WHELP\'S FIREBALL is smaller (r ' + B.r + ' < ' + GARG.ball.r + '), weaker (' + WHF.WH.dmg.fire + ' < ' + GARG.dmg.fireball + '), no faster, and told (' + B.tell + ' s)');
  ok(GARG.ball.n === 2, 'the Gate Gargoyle keeps his two');
  ok(markOf({ t: 'whelp', mode: 'fireTell' }) === '!', 'its tell wears the yellow mark: a shield takes it');
  ok(WHF.whelpFrame({ mode: 'fireTell' }) === WHF.WHELP_F.spit && WHF.bakeWhelp().R.length >= 10 && WHF.WHELP_CLIPPED.length === 0, 'a pose of its own for the spit, on its grid'); }
// 4. on the page
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;const out={},G=${G},T=${JSON.stringify({ AIR: T.AIR, SOLID: T.SOLID, ONEWAY: T.ONEWAY })};
    const boot=(id,keep)=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(id);BK.state='play';BK.god=true;BK.P.hp=BK.P.maxHp;BK.sim(10);for(const e of BK.enemies())if(!keep(e))e.alive=false;};
    const tile=(x,y)=>BK.L.grid[y*BK.L.W+x];
    /* THE THREE SLABS: struck, each moves */
    boot(${I},()=>false);const S=BK.mg().shelves;out.slabs=[];
    for(const s of S.filter(s=>s.slab)){const i=S.indexOf(s),pr=BK.props().find(p=>p.t==='rune'&&p.shelf===i);const before=tile(s.x0,s.yUp);
      BK.P.x=pr.x-10;BK.P.y=pr.y;BK.P.vx=BK.P.vy=0;BK.P.face=1;BK.sim(5);for(let f=0;f<6&&!s.up;f++){BK.P.x=pr.x-10;BK.P.face=1;BK.press('atk');BK.sim(20);}BK.sim(90);
      out.slabs.push({x:s.x0,struck:s.up,k:s.k,before,after:tile(s.x0,s.yUp),down:tile(s.x0,s.yDown),want:s.tile,sunk:!!s.sunk});}
    /* A WHELP OVER THE BRIDGE: on the bridge, it dives through it and sticks on the spikes; stomped, it breaks and the wind lifts you, no bite */
    {boot(${I},e=>e.t==='whelp'&&e.x<31*16+40&&e.x>31*16);const w=BK.enemies().find(e=>e.t==='whelp'&&e.alive);const b=BK.mg().shelves.find(s=>s.slab&&s.tile===T.ONEWAY);if(b&&!b.up){b.up=true;b.k=1;for(let x=b.x0;x<=b.x1;x++)BK.L.grid[b.yUp*BK.L.W+x]=T.ONEWAY;}
     BK.tp(b.x0+1,G-1);BK.sim(3);w.cd=0.1;w.last='fire';const seen=new Set();for(let f=0;f<240&&w.mode!=='stuck';f++){BK.tp(b.x0+1,G-1);BK.sim(1);seen.add(w.mode);}
     out.dive={seen:[...seen],mode:w.mode};if(w.mode==='stuck'){BK.god=false;BK.P.hp=BK.P.maxHp;const hp0=BK.P.hp;BK.P.x=w.x;BK.P.y=w.y-w.h-10;BK.P.vy=200;for(let f=0;f<30&&w.alive;f++)BK.sim(1);
       out.dive.stomp={alive:w.alive,rode:!!BK.P.windRide,bite:hp0-BK.P.hp};BK.god=true;}}
    /* THE FIREBALL: past its dive it spits - told, ONE ball, a hit that is its own damage; a shield takes it */
    const spit=(id,pick,guard,dx)=>{boot(id,e=>e.t==='whelp');const w=BK.enemies().filter(e=>e.t==='whelp'&&e.alive).sort(pick)[0];for(const e of BK.enemies())if(e!==w)e.alive=false;
      const home=w.home||{x:w.x,y:w.y};BK.P.x=home.x+dx;BK.P.y=home.y+48;
      /* stand on the floor under that point */ let ty=Math.floor(BK.P.y/16);while(ty<BK.L.H&&tile(Math.floor(BK.P.x/16),ty)!==T.SOLID)ty++;BK.P.y=ty*16;BK.P.vx=BK.P.vy=0;
      BK.sim(2);BK.god=false;BK.P.hp=BK.P.maxHp;BK.P.inv=0;BK.P.grace=0;const hp0=BK.P.hp;w.cd=0.1;w.last='swoop';const modes=[];let tells=0,maxBalls=0,prev='';
      for(let f=0;f<360;f++){if(guard){BK.keys.block=true;BK.P.face=Math.sign(w.x-BK.P.x)||1;}BK.P.x=home.x+dx;BK.sim(1);if(w.mode!==prev){modes.push(w.mode);if(w.mode==='fireTell')tells++;}prev=w.mode;maxBalls=Math.max(maxBalls,(w.balls||[]).length);if(tells&&w.mode==='perch'&&!(w.balls||[]).length)break;}
      BK.keys.block=false;const o={modes:modes.slice(0,8),tells,maxBalls,thrown:w.thrown||0,took:hp0-BK.P.hp};BK.god=true;return o;};
    out.open=spit(${I},(a,b)=>a.x-b.x,false,150);out.guard=spit(${I},(a,b)=>a.x-b.x,true,150);
    out.witch=spit(${LEVELS.findIndex(l => l.id === 'witchlight')},(a,b)=>a.x-b.x,false,150);
    out.errors=(window.__errs||[]).slice(0,3);return out;})()`, 600000);
  console.log(JSON.stringify(r));
  const sl = r.slabs || [];
  ok(sl.length === 3 && sl.every(s => s.struck && s.k >= 1 && s.after === (s.want ?? 1) && (s.down === 0 || s.sunk)), 'ON THE PAGE, every warded slab moves when its rune is struck: the new place is footing, the old one is open: ' + JSON.stringify(sl));
  ok(r.dive && r.dive.mode === 'stuck' && r.dive.seen.includes('crouchTell'), 'a whelp over the bridge, with you on it, dives THROUGH it and sticks on the drain\'s spikes: ' + JSON.stringify(r.dive && r.dive.seen));
  ok(r.dive && r.dive.stomp && !r.dive.stomp.alive && r.dive.stomp.rode && r.dive.stomp.bite === 0, 'stomped there it breaks, and the wind lifts you with no bite: ' + JSON.stringify(r.dive && r.dive.stomp));
  ok(r.open.tells >= 1 && r.open.maxBalls === 1 && r.open.thrown >= 1 && r.open.took > 0 && r.open.took < Math.round(GARG.dmg.fireball * 1.3), 'past its dive it SPITS: told, one ball at a time, and it takes less than one of his (' + WHF.WH.dmg.fire + ' before the health scaling): ' + JSON.stringify(r.open));
  ok(r.guard.thrown >= 1 && r.guard.took === 0, 'a shield takes it: ' + JSON.stringify(r.guard));
  ok(r.witch.thrown >= 1 && r.witch.maxBalls === 1, 'the Witchlight Stair\'s whelps spit it too: ' + JSON.stringify(r.witch));
  ok((r.errors || []).length === 0 && pg.errors.length === 0, 'no errors on the page: ' + JSON.stringify((r.errors || []).concat(pg.errors).slice(0, 3)));
} finally { pg.close(); }
console.log(fails.length ? '\n' + fails.length + ' FAILED' : '\nTHE WARDED COURTYARD: a step, a bridge and a path in paving, taught before the library; every whelp over spikes; and the whelp\'s one small told fireball.');
process.exitCode = fails.length ? 1 : 0;
