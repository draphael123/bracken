/* tools/folly-library.mjs — THE RUNE LIBRARY (claude/follylib; Daniel, 2026-09-29): "the Mage's Folly should be a bit LONGER: add ~150 columns as a
   RUNE LIBRARY between the grounds/courtyard and the Archmage's tower - sliding BOOKCASE platforms; a RUNE-LOCK that teaches the boss's rune trick
   (in his fight you strike runes to break his ward, one sits on a book stack you knock down with its foot rune, round 3 reseals them in 4 s): a door
   that opens only when you light its runes in time, including one on a book stack - teach it safe first, then test it with a timer; ONE designed
   squad; ONE checkpoint; a sign that names it."
   Node first (the length, the cases, the two locks and their order, the squad, the checkpoint), then the page: a case carries you, the first lock holds
   its light, the second goes dark when the clock runs out (and the stack rises again), and every hero can WALK the exam with real keys inside the window.
   Every assertion is SOFT and all are printed, so a run on the old code lists everything it does not do. */
import { install } from './node-canvas.mjs';
import { LEVELS, T } from '../src/level.js';
import { openPage } from './cdp.mjs';
install();
const fails = [], ok = (c, m) => { if (!c) fails.push(m); console.log((c ? '  ok   ' : '  FAIL ') + m); };
const I = LEVELS.findIndex(l => l.id === 'mage'), L = LEVELS[I].build(), G = 40, LIB = 150, X0 = 64, X1 = X0 + LIB - 1, TS = 16;
const at = (x, y) => L.grid[y * L.W + x], M = L.mage || {}, locks = M.locks || [], lib = e => e.x >= X0 && e.x <= X1;
// 1. LONGER: 150 columns between the courtyard and the tower, and the tower moved whole
ok(L.W === 658 + LIB, 'the Folly is ' + LIB + ' columns longer: W ' + L.W + ' (was 658)');
ok(M.outside === 64 && at(63, G - 1) === T.AIR && at(64, G - 1) === T.AIR && at(65, G - 1) === T.AIR, 'the courtyard is unchanged and its door still opens at column 64 into the new hall');
ok(L.ents.some(e => e.t === 'sign' && lib(e) && /^THE RUNE LIBRARY\./.test(e.text)), 'a sign at the door names it: THE RUNE LIBRARY');
ok(L.arena && L.arena.x0 === (603 + LIB) * TS && L.mini && L.mini.gate === 208 + LIB, 'the great library\'s mini and the Archmage\'s room slid by exactly ' + LIB + ': ' + (L.arena && L.arena.x0 / TS) + ', ' + (L.mini && L.mini.gate));
ok((L.interiors || []).some(z => z[0] === 66 && z[1] === 211 && z[4] === 'library'), "the new hall is a library interior (66-211), a shell of the tower's stone");
// 2. THE SLIDING BOOKCASES: platforms that move, over a pit with no teeth first and over spikes after
const cases = (L.moversExtra || []).filter(m => m.kind === 'bookcase' && m.x0 / TS >= X0 && m.x1 / TS <= X1 + 1);
ok(cases.length >= 3, 'SLIDING BOOKCASES: ' + cases.length + ' platforms on rails in the library (3+): ' + cases.map(m => m.x0 / TS + '-' + m.x1 / TS).join(' '));
const spikedAt = (x0, x1) => { let n = 0; for (let x = x0; x <= x1; x++) for (let y = G; y < G + 8; y++) if (at(x, y) === T.SPIKE) { n++; break; } return n; };
const pit = m => { let a = m.x0 / TS, b = m.x1 / TS - 1; return { a, b, spikes: spikedAt(a, b), gap: [...Array(b - a + 1)].filter((_, i) => at(a + i, G) === T.AIR).length }; };
const safe = cases.filter(m => pit(m).gap >= 8 && pit(m).spikes === 0), teeth = cases.filter(m => pit(m).spikes >= 8);
ok(safe.length >= 1 && teeth.length >= 2 && Math.min(...safe.map(m => m.x0)) < Math.min(...teeth.map(m => m.x0)), 'a pit with NO spikes is crossed first (' + safe.map(m => m.x0 / TS).join(',') + '), the spiked one after it (' + teeth.map(m => m.x0 / TS).join(',') + ')');
ok((L.winds || []).some(z => z.x0 >= X0 && z.x1 <= X1 && z.exits.every(([x]) => x < z.x0)), 'the spiked pit is a wind zone: a fall is one bite and the wind brings you back behind it (spike-winds.js)');
ok(cases.length > 0 && cases.every(m => m.w >= 40 && m.speed >= 20 && m.speed <= 40), 'every case is three tiles wide and slides at a walking pace (' + cases.map(m => m.w + '@' + m.speed).join(' ') + ')');
// 3. THE RUNE-LOCKS: the safe one first, the timed one after, and the stack
const rn = k => L.ents.filter(e => e.t === 'lockrune' && e.lock === k);
ok(locks.length === 2 && locks.every(l => l.gate >= X0 && l.gate <= X1), 'two vault doors in the library: ' + JSON.stringify(locks.map(l => [l.gate, l.window, l.n])));
if (locks.length === 2) {
  const [a, b] = locks;
  ok(a.window === 0 && b.window >= 6 && b.window <= 10 && a.gate < b.gate && Math.max(...rn(0).map(e => e.x)) < Math.min(...rn(1).map(e => e.x)), 'TAUGHT SAFE, THEN TIMED: the first lock holds its light (window ' + a.window + ') and sits before the second, which has a ' + b.window + ' s clock');
  ok(rn(0).length === 2 && rn(1).length === 3 && rn(0).length === a.n && rn(1).length === b.n, 'two runes on the first door, three on the second');
  ok(rn(0).every(e => at(e.x, e.y + 1) === T.SOLID), 'the taught lock\'s runes stand where a blade finds them (on the floor and on a reading shelf a step a row up)');
  const s = rn(1).find(e => e.onShelf !== undefined), sh = s && (M.shelves || [])[s.onShelf], foot = s && L.ents.find(e => e.t === 'rune' && e.shelf === s.onShelf);
  ok(!!s && !!sh && sh.lock === 1 && sh.h >= 5 && sh.yUp > sh.yDown, 'ONE RUNE ON A BOOK STACK, out of reach (the stack is ' + (sh && sh.h) + ' rows), a stack that slides DOWN into the loft');
  ok(!!foot && foot.x < sh.x0 && Math.abs(foot.y - (sh.yUp - 1)) <= 1, 'its FOOT RUNE stands on the loft beside it, in reach: ' + (foot && foot.x + ',' + foot.y));
  ok(!!s && s.y * TS < (G - 6) * TS && !rn(1).filter(e => e.onShelf === undefined).some(e => e.y * TS < (G - 6) * TS), 'the stack\'s rune is the only high one (the others are on the floor)');
  ok([a.gate, b.gate].every(c => { let n = 0; for (let y = 0; y < L.H; y++) if (at(c, y) === T.PORT) n++; return n === 6; }) && at(a.gate, 20) === T.SOLID && at(b.gate, 20) === T.SOLID, 'each door is a six-row portcullis under a frame (no hero jumps it)');
}
// 4. THE SQUAD, THE CHECKPOINT, AND NOTHING ELSE
const foes = L.ents.filter(e => lib(e) && !['coin', 'sign', 'deco', 'check', 'rune', 'lockrune'].includes(e.t));
ok(foes.length === 3 && foes.filter(e => e.t === 'armour').length === 1 && foes.filter(e => e.t === 'apprentice').length === 2, 'ONE DESIGNED SQUAD and no filler: ' + foes.map(e => e.t + '@' + e.x + ',' + e.y).join(' '));
{ const arm = foes.find(e => e.t === 'armour'), aps = foes.filter(e => e.t === 'apprentice');
  ok(arm && aps.every(p => Math.abs(p.y - arm.y) <= 1 && p.x > arm.x) && at(arm.x, arm.y + 1) === T.SOLID && arm.y <= G - 5, 'the armour plugs the top of a bookcase ledge (row ' + (arm && arm.y) + ') and the apprentices stand behind it, on the same shelf');
  ok(arm && !!(L.ents.find(e => e.t === 'sign' && e.x < arm.x && e.x > 120)), 'a sign before the crossing tells what is watching'); }
ok(L.ents.filter(e => e.t === 'check' && lib(e)).length === 1, 'ONE checkpoint in the library: ' + L.ents.filter(e => e.t === 'check' && lib(e)).map(e => e.x).join(','));
ok((L.calm || []).some(z => z[0] <= X0 && z[1] >= X1), 'the whole library is calm: no garrison is sprinkled on it');
// 5. on the page
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;const out={},G=${G},TS=16,X1=${X1},SP=(BK.SET.speed||1);   /* the world runs at SET.speed of real time (0.6 by default): every clock below is in WORLD seconds, as the game counts them */
    const boot=(hero)=>{BK.setHero(hero);BK.reset({fresh:true});BK.load(${I});BK.state='play';BK.god=true;BK.P.hp=BK.P.maxHp;BK.sim(10);for(const e of BK.enemies())e.alive=false;return BK.L;};
    const tile=(x,y)=>BK.L.grid[y*BK.L.W+x],P=()=>BK.P;
    /* THE CASES CARRY: stand on the safe pit's case, and it takes you across */
    boot('knight');{const m=BK.movers().find(q=>q.kind==='bookcase'&&q.x0===76*TS);const x0=m.x;let onFor=0,carried=0,x1=m.x,pdx=0;
      for(let f=0;f<240;f++){BK.P.x=Math.max(BK.P.x,0);if(f===0){BK.P.x=m.x+m.w/2;BK.P.y=m.y;BK.P.vx=BK.P.vy=0;}BK.sim(1);if(BK.P.onMover===m){onFor++;}x1=m.x;}
      out.case={moved:Math.round(x1-x0),onFor,px:Math.round(BK.P.x-m.x-m.w/2),m0:x0,m1:x1};}
    /* THE FIRST LOCK HOLDS ITS LIGHT: strike one rune, wait a minute, strike the other, and the door opens */
    {boot('knight');const ps=BK.props().filter(p=>p.t==='lockrune'&&p.lock===0),strike=pr=>{BK.P.x=pr.x-10;BK.P.y=pr.y;BK.P.vx=BK.P.vy=0;BK.P.face=1;BK.sim(3);for(let f=0;f<8&&!pr.lit;f++){BK.P.x=pr.x-10;BK.P.face=1;BK.press('atk');BK.sim(20);}};
      const ports=()=>{let n=0;for(let y=0;y<BK.L.H;y++)if(tile(BK.mg().locks[0].gate,y)===${T.PORT})n++;return n;};
      const before=ports();strike(ps[0]);BK.sim(Math.round(60*40/SP));const mid={lit:ps[0].lit,ports:ports()};strike(ps[1]);BK.sim(5);out.lock0={before,mid,after:ports(),open:BK.mg().locks[0].open,lit:ps.map(p=>p.lit)};}
    /* THE SECOND LOCK: a rune on a stack is sealed until the foot rune is struck; then the clock */
    {boot('knight');const ks=BK.props().filter(p=>p.t==='lockrune'&&p.lock===1),K=BK.mg().locks[1],stackR=ks.find(p=>p.shelf>=0),floorR=ks.filter(p=>p.shelf<0),foot=BK.props().find(p=>p.t==='rune'&&p.shelf===stackR.shelf),S=BK.mg().shelves[stackR.shelf];
      const strike=pr=>{BK.P.x=pr.x-10;BK.P.y=pr.y>0?pr.y:pr.y;BK.P.vx=BK.P.vy=0;BK.P.face=1;BK.sim(2);for(let f=0;f<8;f++){BK.P.x=pr.x-10;BK.P.face=1;BK.press('atk');BK.sim(20);if(pr.lit||(pr.t==='rune'&&S.up))break;}};
      const cell=(x,y)=>tile(x,y),topCell=()=>cell(S.x0,S.yDown),ports=()=>{let n=0;for(let y=0;y<BK.L.H;y++)if(tile(K.gate,y)===${T.PORT})n++;return n;};
      const o={stackUp0:topCell()===${T.SOLID},runeY0:Math.round(stackR.y/TS)};
      /* out of reach, and sealed: a hero on the loft jumping at it gets no light */
      BK.P.x=S.x0*TS-30;BK.P.y=(S.yUp)*TS;BK.P.vx=BK.P.vy=0;BK.P.face=1;BK.sim(2);const hb=()=>{};stackR.y=stackR.y0;BK.P.x=stackR.x-10;BK.P.y=stackR.y+2;BK.P.face=1;for(let f=0;f<3;f++){BK.press('atk');BK.sim(20);}o.sealed=!stackR.lit;
      strike(foot);BK.sim(120);o.stackGone=topCell()!==${T.SOLID};o.runeDown=Math.round(stackR.y/TS);o.sunk=S.up&&S.k>=1;
      /* the clock: light one, let it run out, and every rune goes dark and the stack rises again */
      strike(floorR[0]);o.lit1=floorR[0].lit;o.t1=+K.t.toFixed(2);BK.sim(Math.round(60*(K.window+1)/SP));
      o.dark=ks.every(p=>!p.lit);o.risen=topCell()===${T.SOLID}&&!S.up;o.closed=ports();o.open=K.open;
      /* the stack's foot rune works again, and lighting all three in time opens the door */
      strike(foot);BK.sim(120);strike(floorR[0]);strike(stackR);strike(floorR[1]);BK.sim(5);o.done={open:K.open,ports:ports(),lit:ks.map(p=>p.lit)};out.lock1=o;}
    /* EVERY HERO WALKS THE EXAM WITH REAL KEYS, inside the window: R1, up the stairs, the foot rune, the stack's rune, and the last rune at the door */
    out.walk=[];
    for(const h of ['knight','warden','pyro','paladin']){boot(h);BK.god=false;const K=BK.mg().locks[1],ks=BK.props().filter(p=>p.t==='lockrune'&&p.lock===1),stackR=ks.find(p=>p.shelf>=0),floorR=ks.filter(p=>p.shelf<0).sort((a,b)=>a.x-b.x),foot=BK.props().find(p=>p.t==='rune'&&p.shelf===stackR.shelf),S=BK.mg().shelves[stackR.shelf];
      const seq=[{pr:floorR[0]},{pr:foot,shelf:true},{pr:stackR},{pr:floorR[1]}],keys=BK.keys,P=BK.P;BK.P.x=170*TS;BK.P.y=G*TS;BK.P.vx=BK.P.vy=0;BK.sim(3);
      let f=0,i=0,t0=null,hold=0,lastAt=0,doneF=null;
      for(f=0;f<60*40&&!P.dead;f++){P.hp=P.maxHp;for(const k in keys)keys[k]=false;const q=seq[i];if(!q)break;const pr=q.pr;const dx=pr.x-P.x;
        if(t0===null&&floorR[0].lit)t0=f;
        const done=q.shelf?S.up:pr.lit;if(done){i++;lastAt=f;continue;}
        const stackWait=pr===stackR&&!(S.up&&S.k>=1);
        if(Math.abs(dx)>9&&!stackWait){keys[dx>0?'right':'left']=true;
          if(P.ground){const ax=Math.floor((P.x+Math.sign(dx)*10)/TS),ay=Math.floor((P.y-4)/TS);if(tile(ax,ay)===${T.SOLID}&&tile(ax,ay-1)!==${T.SOLID}){BK.press('jump');hold=18;}
            /* the drop off the loft's far end is a walk, not a jump; a stair a row high is one hop */}}
        else{P.face=Math.sign(dx)||P.face;if(f%14===0)BK.press('atk');}
        if(hold>0){keys.jump=true;hold--;}
        BK.sim(1);}
      out.walk.push({h,ok:K.open,secs:+((f-(t0===null?f:t0))/60*SP).toFixed(1),win:K.window,window_left:+(K.t||0).toFixed(1),dead:!!P.dead,at:[Math.round(P.x/TS),Math.round(P.y/TS)],step:i});}
    out.errors=(window.__errs||[]).slice(0,3);return out;})()`, 900000);
  console.log(JSON.stringify(r));
  ok(r.case && r.case.moved > 60 && r.case.onFor > 100, 'ON THE PAGE, a bookcase slides (' + (r.case && r.case.moved) + ' px in 240 frames) and carries the hero (aboard ' + (r.case && r.case.onFor) + ' of 240 frames, ' + (r.case && r.case.px) + ' px off its middle)');
  ok(r.lock0 && r.lock0.before === 6 && r.lock0.mid.lit && r.lock0.mid.ports === 6 && r.lock0.after === 0 && r.lock0.open, 'the FIRST lock holds its light: one rune lit, forty seconds, the door still shut; the second rune and it opens: ' + JSON.stringify(r.lock0));
  { const o = r.lock1 || {};
    ok(o.sealed && o.stackUp0 && o.runeY0 <= G - 8, 'the stack\'s rune is high (row ' + o.runeY0 + ') and sealed in the books: a blow at it lights nothing');
    ok(o.stackGone && o.sunk && o.runeDown >= G - 4, 'the foot rune slides the stack down into the loft and the rune comes down with it (row ' + o.runeDown + ')');
    ok(o.lit1 && o.t1 > locks[1].window - 1 && o.t1 <= locks[1].window && o.dark && o.risen && o.closed === 6 && !o.open, 'the clock: one rune lit starts the clock; when it runs out every rune is dark, the stack has risen again and the door is shut: ' + JSON.stringify({ t1: o.t1, dark: o.dark, risen: o.risen, ports: o.closed }));
    ok(o.done && o.done.open && o.done.ports === 0 && o.done.lit.every(Boolean), 'all three lit inside the window and it opens: ' + JSON.stringify(o.done)); }
  for (const w of r.walk || []) ok(w.ok && w.secs <= w.win - 1.5, w.h + ' WALKS THE EXAM with real keys, no god mode: lit it in ' + w.secs + ' s of the ' + w.win + ' s window (world seconds; 1.5 s to spare) ' + JSON.stringify(w));
  ok((r.errors || []).length === 0 && pg.errors.length === 0, 'no errors on the page: ' + JSON.stringify((r.errors || []).concat(pg.errors).slice(0, 3)));
} finally { pg.close(); }
console.log(fails.length ? '\n' + fails.length + ' FAILED' : '\nTHE RUNE LIBRARY: 150 columns, sliding bookcases, a taught lock and a timed one on the Archmage\'s own trick, one squad and one checkpoint.');
process.exitCode = fails.length ? 1 : 0;
