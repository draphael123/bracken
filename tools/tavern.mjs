// tools/tavern.mjs - THE TAVERN, CO-OP PHASE 2 (claude/tavern; Daniel 10-12, scratch brief-tavern.md): Waymeet's Crossroads Inn and the four-player party.
//   pure     src/party.js: four seats, eight colours (no two seats share one), cleanTavern reads ANY save shape whole (old saves fine), the party view is one
//            whole pixel-scale step out and never more than 1.25x, the camera's hysteresis, the leash's cases (off the picture / stretched / never a downed,
//            held or thrown hero / never into the air); src/tavern.js: every station has its art listed, the room is closed and has no hazard or foe
//   join     the title's LOCAL CO-OP and ONLINE CO-OP and the map's F all lead into the inn; a free pad's JUMP walks a new player in THROUGH THE DOOR (the real
//            pollGamepad path, a faked pad); player one's own pad never joins; four is full; the walk-in lets go of RIGHT
//   stations each station by walking up and pressing INTERACT: the door (P1 to the map with the party armed, P2 leaves), the invite board (the online
//            room card), the campaign table (the party armed for the next wood, which then starts with all of them), the wardrobe (HERO / WEAPON / COLOUR /
//            RING on that player's own card, driven by his own hands), the drills board, the sparring bell (a partner goes DOWN; standing on him lifts him:
//            the REVIVE drill; left alone he is stood up, no death), TEAM HIT on a dummy, the THROW drill into the hay target, the practice door, the arena
//            pit (COMING SOON); the first-visit glints go as each is used, and the first approach says what a station does
//   camera   two players spread wide (or three or four at all) put the 'coop' view up and every hero is inside it; together again it comes back after the hold
//   leash    in a real wood: a player left on a floor under the picture, and a player at the back edge while the leader pushes on at the front, are TOLD
//            (CATCH UP, a rope) and then PULLED ALONG beside the leader; a downed one is not
//   rings    each seat's floor ring is drawn in its colour under his feet (pixels), off when RING is off; the tags P1..P4 are drawn; four HUD plates
//   save     an old save with no tavern record, and a save with a broken one, load and play; the record is written back whole; nothing else in the save moves
// node tools/tavern.mjs [pure,join,stations,camera,leash,rings,save]   (PORT from the environment)
import { MAX_PLAYERS, COLOURS, SEAT_DEFAULT, cleanTavern, colourOf, stepColour, coopViewSize, camStep, CAM, leashWhy, leashStep, leaderOf, LEASH, DRILL_IDS, spreadOf } from '../src/party.js';
import { STATIONS, TAVERN_ART, ROOM, DUMMIES, TARGET, START } from '../src/tavern.js';
const ALL = ['pure', 'join', 'stations', 'camera', 'leash', 'rings', 'save', 'online', 'fixes'];
const WANT = process.argv[2] ? process.argv[2].split(',') : ALL;
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log('  FAIL ' + m); } else console.log('  ok   ' + m); };

if (WANT.includes('pure')) {
  console.log('pure');
  ok(MAX_PLAYERS === 4, 'up to four players');
  ok(COLOURS.length >= 6 && new Set(COLOURS.map(c => c.id)).size === COLOURS.length && new Set(COLOURS.map(c => c.c)).size === COLOURS.length, 'the colours are distinct: ' + COLOURS.map(c => c.id).join(','));
  ok(new Set(SEAT_DEFAULT).size === 4 && SEAT_DEFAULT[1] === 'green', 'the four seats start in four different colours, P2 in the green P2 has always worn');
  for (const raw of [undefined, null, 'x', 7, [], [1, 2], { colours: 'red' }, { colours: ['nope', 'teal', 3] }, { seen: 'all', drills: { throw: 'x', team: -5 } }, { ring: false }]) {
    let t = null, err = '';
    try { t = cleanTavern(raw); } catch (e) { err = String(e); }
    ok(!err && t && t.colours.length === 4 && t.colours.every(id => COLOURS.some(c => c.id === id)) && typeof t.seen === 'object' && DRILL_IDS.every(k => Number.isInteger(t.drills[k]) && t.drills[k] >= 0) && typeof t.ring === 'boolean', 'cleanTavern reads ' + JSON.stringify(raw) + ' whole: ' + (err || JSON.stringify(t)));
  }
  ok(cleanTavern({ colours: ['nope', 'teal'] }).colours[1] === 'teal' && cleanTavern({ ring: false }).ring === false && cleanTavern(undefined).ring === true, 'a good colour and a ring choice are kept; the defaults fill the rest');
  ok(colourOf(undefined, 3).id === 'blue' && colourOf({ colours: ['gold', 'green', 'violet'] }, 3).id === 'violet', 'seat 3 is blue by default, his saved colour when he has one');
  ok(stepColour('gold', 1, ['green']) === 'blue' && stepColour('gold', -1, []) === COLOURS[COLOURS.length - 1].id, 'the wardrobe steps past a colour another seat is wearing');
  for (const [w, h] of [[1280, 720], [1920, 1080], [2560, 1440], [1366, 768], [640, 360], [800, 600], [390, 844], [320, 180]]) {
    const [vw, vh] = coopViewSize(w, h), S0 = Math.max(1, Math.floor(Math.min(w / 320, h / 180))), S1 = Math.max(1, S0 - 1);
    ok(vw >= 320 && vh >= 180 && vw <= CAM.capW && vh <= CAM.capH && vw / 320 <= 1.25 + 1e-9, 'the party view at ' + w + 'x' + h + ' is ' + vw + 'x' + vh + ' (x' + (vw / 320).toFixed(2) + ', a whole pixel scale ' + S1 + ')');
  }
  let c = null; c = camStep(c, { w: 100, h: 10 }, 2, 0.1); ok(!c.wide, 'two together: the normal view');
  c = camStep(c, { w: 250, h: 10 }, 2, 0.1); ok(c.wide, 'two spread past ' + Math.round(320 * CAM.wideAt) + ' px: the party view');
  c = camStep(c, { w: 100, h: 10 }, 2, 0.5); ok(c.wide, '...together again it holds a moment (no pumping)');
  for (let i = 0; i < 10; i++) c = camStep(c, { w: 100, h: 10 }, 2, 0.2); ok(!c.wide, '...then comes back after ' + CAM.hold + ' s');
  c = camStep(null, { w: 160, h: 10 }, 2, 0.1); c = camStep(c, { w: 160, h: 10 }, 2, 5); ok(!c.wide, 'between the two bands nothing changes from normal');
  ok(camStep(null, { w: 0, h: 0 }, 3, 0.1).wide && camStep(null, { w: 0, h: 0 }, 4, 0.1).wide && !camStep(null, { w: 999, h: 0 }, 1, 0.1).wide, 'three or four always take the party view; one never');
  const cam = { x: 0, y: 100, w: 320, h: 180 }, lead = { x: 300, y: 200, pushing: true };
  ok(leashWhy({ x: 290, y: 200 + 180 + LEASH.offY + 20 }, lead, cam) === 'off', 'leash: a hero under the picture is off it');
  ok(leashWhy({ x: 290, y: 100 - LEASH.offY - 5 }, lead, cam) === 'off', 'leash: a hero over the top of it too');
  ok(leashWhy({ x: 12, y: 200 }, lead, cam) === 'stretch', 'leash: at the back edge while the leader pushes at the front: stretched');
  ok(leashWhy({ x: 12, y: 200 }, { ...lead, pushing: false }, cam) === '', '...but not while the leader stands still');
  ok(leashWhy({ x: 150, y: 200 }, lead, cam) === '', '...nor a hero in the middle of the picture');
  for (const k of ['dead', 'down', 'held', 'flying']) ok(leashWhy({ x: 290, y: 900, [k]: k === 'down' ? 3 : 1 }, lead, cam) === '', 'leash: never a ' + k + ' hero');
  let m = 0, pulled = false, t = 0; while (!pulled && t < 5) { const r = leashStep(m, 'off', 0.1, true); m = r.m; pulled = r.pull; t += 0.1; }
  ok(pulled && Math.abs(t - LEASH.build) < 0.15, 'leash: the pull comes after the told ' + LEASH.build + ' s (' + t.toFixed(1) + ')');
  ok(!leashStep(0.99, 'off', 0.1, false).pull, 'leash: never into the air (it waits for the leader on the ground)');
  ok(leashStep(0.5, '', 0.1, true).m < 0.5, 'leash: the meter drains when the reason goes');
  ok(leaderOf([{ x: 10 }, { x: 90 }, { x: 50 }], 100) === 1 && leaderOf([{ x: 10 }, { x: 90, down: 3 }], 100) === 0 && leaderOf([{ x: 10 }, { x: 50 }], null) === 1, 'the leader is the upright one nearest the exit');
  ok(spreadOf([{ x: 10, y: 0 }, { x: 110, y: 40 }]).w === 100 && spreadOf([]).w === 0, 'the spread of a party');
  const artIds = TAVERN_ART.map(a => a[0]);
  ok(STATIONS.every(s => artIds.includes(s.id) || (s.id === 'door' && artIds.includes('door'))), 'every station has its art on the ART list: ' + STATIONS.filter(s => !artIds.includes(s.id)).map(s => s.id));
  ok(['tiles', 'dummies', 'target', 'dressing', 'glint', 'rings'].every(k => artIds.includes(k)), 'the room, the dummies, the target, the dressing, the glint and the rings are on it too');
  const xs = STATIONS.map(s => s.x); ok(xs.every((x, i) => i === 0 || x - xs[i - 1] >= 3), 'the stations stand apart (3+ tiles), west to east: ' + xs.join(','));
  const { LEVELS, T } = await import('../src/level.js');
  const lv = LEVELS.find(l => l.id === 'tavern'), L = lv && lv.build();
  ok(!!lv && lv.hidden && L.tavern && L.openYard, 'THE CROSSROADS INN is a hidden level, flagged tavern (no death cost: openYard)');
  if (L) {
    const at = (x, y) => L.grid[y * L.W + x];
    ok(xs.every(x => x > ROOM.wallL && x < ROOM.wallR && at(x, ROOM.FLOOR) === T.SOLID && at(x, ROOM.FLOOR - 1) === T.AIR), 'every station stands on the inn floor inside its walls');
    ok(at(START.x, START.y) === T.AIR && at(START.x, START.y + 1) === T.SOLID, 'player one stands up inside the door');
    let hazard = 0; for (let i = 0; i < L.grid.length; i++) if (L.grid[i] === T.SPIKE) hazard++; ok(hazard === 0 && (L.pools || []).length === 0, 'no spike, no pool: nothing in the inn hurts');
    const foes = L.ents.filter(e => !['sign', 'torch', 'deco', 'guest', 'carpet', 'dummy'].includes(e.t)); ok(foes.length === 0, 'nothing in the room but furniture, drinkers and the straw men: ' + foes.map(e => e.t));
    ok(L.ents.filter(e => e.t === 'dummy').map(e => e.x).join() === DUMMIES.join() && TARGET.x > DUMMIES[DUMMIES.length - 1], 'the training yard: two dummies and the hay target past them');
    ok((L.ambient || []).some(a => a.kind === 'tavern') && L.music, 'its own air (the tavern ambient: the crowd and the fire) and music');
    ok(L.ents.some(e => e.t === 'deco' && e.kind === 'hearth') && L.ents.filter(e => e.t === 'deco' && e.kind === 'longTable').length >= 2 && L.ents.filter(e => e.t === 'guest').length >= 3 && L.ents.some(e => e.t === 'deco' && e.kind === 'hallWindow'), 'a warm room: the fireplace, long tables, drinkers, a window onto the road');
  }
}

const PAGE = ALL.slice(1).filter(k => k !== 'online' && WANT.includes(k));
if (PAGE.length) {
  const { openPage } = await import('./cdp.mjs');
  const pg = await openPage({ audio: false, fonts: false });
  const E = (expr, ms = 120000) => pg.evalp(expr, ms);
  try {
    await E(`(()=>{
      BK.manualSimulation=true;const pads=[];Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>pads.slice()});
      window.__pads=pads;window.__pad=(index,btns=[])=>({index,id:'fake '+index,connected:true,buttons:Array.from({length:17},(_,i)=>({pressed:btns.includes(i),value:btns.includes(i)?1:0})),axes:[0,0,0,0]});
      window.__setPads=list=>{pads.length=0;for(const p of list)pads.push(p);};
      window.__fresh=async()=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;__setPads([]);BK.coopEnd();BK.reset({fresh:true});BK.tavern.record(null);BK.tavern.p1Pad(null);await BK.tavern.enter();BK.sim(10);return BK.state;};
      window.__P=n=>BK.players()[n-1];
      window.__at=(p,tx,alone)=>{const put=(q,x)=>{q.x=x*16+8;q.y=20*16;q.vx=q.vy=0;q.face=1;};const plan=new Map([[p,tx]]);if(!alone){let k=0;for(const q of BK.players())if(q!==p){k++;plan.set(q,tx+(k%2?-1:1)*(1.6+Math.floor((k-1)/2)*1.4));}}else for(const q of BK.players())if(q!==p)plan.set(q,(q.x-8)/16);for(let i=0;i<90;i++){for(const [q,x] of plan)put(q,x);BK.sim(1);}for(const [q,x] of plan)put(q,x);BK.sim(1);};
      window.__st=id=>BK.tavern.debug().stations.find(s=>s.id===id);
      window.__talk=p=>{if(p===BK.players()[0])BK.press('talk');else p.press=Object.assign(p.press||{},{talk:true});BK.sim(1);};
      window.__key=(p,k)=>{if(p===BK.players()[0])BK.press(k);else p.press=Object.assign(p.press||{},{[k]:true});BK.sim(1);};
      window.__frame=()=>{BK.draw1();};
      return 1;})()`);

    if (PAGE.includes('join')) {
      console.log('join');
      const top = await E('BK.ui.titleTop()');
      ok(top.includes('LOCAL CO-OP') && top.includes('ONLINE CO-OP'), 'the title keeps LOCAL CO-OP and ONLINE CO-OP: ' + top.join(','));
      for (const row of ['LOCAL CO-OP', 'ONLINE CO-OP']) {
        const r = await E(`(async()=>{BK.coopEnd();BK.load(0);BK.state='title';BK.ui.titleOpts=false;BK.ui.titleI=BK.ui.titleTop().indexOf(${JSON.stringify(row)});BK.ui.pressCard=false;BK.press('confirm');BK.step(1);
          for(let i=0;i<200&&!(BK.state==='play'&&BK.L&&BK.L.tavern);i++)await new Promise(r=>setTimeout(r,50));
          await new Promise(r=>setTimeout(r,200));const b=document.getElementById('olhost');const o={st:BK.state,tav:!!(BK.L&&BK.L.tavern),board:!!(b&&b.style.display!=='none'),txt:b?b.innerText.slice(0,400):''};
          if(b)[...b.querySelectorAll('button')].find(x=>x.textContent==='BACK').click();return o;})()`);
        ok(r.st === 'play' && r.tav, 'the title\'s ' + row + ' leads into the inn: ' + JSON.stringify(r));
        if (row === 'ONLINE CO-OP') ok(r.board && /HOST A GAME/.test(r.txt), '...with the online room card up (HOST / JOIN): ' + r.txt);
      }
      const mf = await E(`(async()=>{BK.load(0);BK.state='map';BK.step(1);BK.press('throw');BK.step(1);for(let i=0;i<200&&!(BK.state==='play'&&BK.L&&BK.L.tavern);i++)await new Promise(r=>setTimeout(r,50));return {st:BK.state,tav:!!(BK.L&&BK.L.tavern),foot:BK.mapFooter()[0].map(f=>f.t)};})()`);
      ok(mf.st === 'play' && mf.tav, "the map's F goes to the inn: " + JSON.stringify(mf));
      ok(mf.foot.some(t => /F TAVERN/.test(t)), '...and the map footer says so: ' + mf.foot.join(' | '));
      await E('__fresh()');
      const j = await E(`(()=>{const o={};BK.ui.pollPad();__setPads([__pad(2,[])]);BK.ui.pollPad();BK.sim(1);__setPads([__pad(2,[0])]);BK.ui.pollPad();BK.sim(1);
        const p=BK.players()[1];o.n=BK.players().length;o.src=p&&p.src;o.walk=p&&p.walkIn;o.x0=p&&p.x;o.door=__st('door').x;
        __setPads([__pad(2,[])]);for(let i=0;i<90;i++){BK.ui.pollPad();BK.sim(1);}o.x1=p&&p.x;o.walk1=p&&p.walkIn;o.right=p&&!!p.keys.right;const x1=p.x;for(let i=0;i<40;i++){BK.ui.pollPad();BK.sim(1);}o.x2=p&&p.x;return o;})()`);
      ok(j.n === 2 && j.src && j.src.kind === 'pad' && j.src.pad === 2, 'a free pad\'s JUMP in the inn seats a new player on THAT pad (the real pollGamepad path): ' + JSON.stringify(j.src));
      ok(j.walk > 0 && Math.abs(j.x0 - j.door) < 24, '...he appears in the doorway (x ' + Math.round(j.x0) + ', the door ' + j.door + ')');
      ok(j.x1 - j.x0 > 20 && j.walk1 === 0, '...and walks in through it (' + Math.round(j.x0) + ' -> ' + Math.round(j.x1) + ')');
      ok(!j.right && Math.abs(j.x2 - j.x1) < 2, '...and lets go of RIGHT when he is in (stands still: ' + Math.round(j.x1) + ' -> ' + Math.round(j.x2) + ')');
      const mine = await E(`(()=>{BK.tavern.p1Pad(5);__setPads([__pad(2,[]),__pad(5,[])]);BK.ui.pollPad();BK.sim(1);__setPads([__pad(2,[]),__pad(5,[0])]);BK.ui.pollPad();BK.sim(1);__setPads([__pad(2,[]),__pad(5,[])]);BK.ui.pollPad();BK.sim(1);return BK.players().length;})()`);
      ok(mine === 2, "player one's own pad (the one he played on) never seats a joiner: " + mine);
      const full = await E(`(()=>{const o={};o.a=BK.tavern.join({kind:'pad',pad:7});o.b=BK.tavern.join({kind:'pad',pad:8});o.c=BK.tavern.join({kind:'pad',pad:9});o.n=BK.players().length;o.tags=BK.players().map(p=>p.n);o.cols=BK.tavern.party().map(p=>p.colour);return o;})()`);
      ok(full.a === 3 && full.b === 4 && full.c === 0 && full.n === 4, 'up to four: the fifth is told the inn is full: ' + JSON.stringify(full));
      ok(new Set(full.cols).size === 4, '...four seats in four colours: ' + full.cols.join(','));
      const lv = await E(`(()=>{BK.sim(70);const p3=BK.players()[2];__at(p3,3);BK.sim(2);__talk(p3);BK.sim(2);return {n:BK.players().length,ns:BK.players().map(p=>p.n).join(),want:(BK.tavern.seats()||[]).length};})()`);
      ok(lv.n === 3 && lv.ns === '1,2,3' && lv.want === 2, 'a seat walking out of the door LEAVES the party; the others close up and the party for the road follows: ' + JSON.stringify(lv));
    }

    if (PAGE.includes('stations')) {
      console.log('stations');
      await E('__fresh()');
      const g0 = await E('BK.tavern.debug().stations.filter(s=>!s.seen).length');
      ok(g0 === STATIONS.length, 'a fresh save: every station glints (' + g0 + ' unseen)');
      const first = await E(`(()=>{const p=__P(1);__at(p,${STATIONS.find(s => s.id === 'wardrobe').x});BK.sim(3);return BK.tavern.hint().msg;})()`);
      ok(/WARDROBE/.test(first || ''), 'the first approach to a station says what it does: ' + first);
      /* the board */
      const brd = await E(`(async()=>{const p=__P(1);__at(p,${STATIONS[1].x});BK.sim(2);__talk(p);await new Promise(r=>setTimeout(r,150));const b=document.getElementById('olhost');const o={board:!!(b&&b.style.display!=='none'),txt:b?b.innerText.slice(0,40):''};if(b)[...b.querySelectorAll('button')].find(x=>x.textContent==='BACK').click();o.seen=__st('board').seen;return o;})()`);
      ok(brd.board && brd.seen, 'THE INVITE BOARD opens the online room card (HOST / JOIN), and stops glinting: ' + JSON.stringify(brd));
      /* the wardrobe, driven by P2's own hands */
      const wd = await E(`(()=>{BK.tavern.join({kind:'pad',pad:3});BK.sim(80);const p=__P(2),o={};__at(p,${STATIONS.find(s => s.id === 'wardrobe').x});BK.sim(3);o.h0=p.hero;__talk(p);o.card=BK.tavern.debug().cards;
        __key(p,'right');o.h1=p.hero;o.set=!!p.set;__key(p,'down');__key(p,'down');const c0=BK.tavern.party()[1].colour;__key(p,'right');o.c0=c0;o.c1=BK.tavern.party()[1].colour;o.c1p1=BK.tavern.party()[0].colour;
        __key(p,'down');const r0=BK.tavern.debug().tavern.ring;__key(p,'right');o.r0=r0;o.r1=BK.tavern.debug().tavern.ring;__key(p,'right');
        const x0=p.x;o.cb=JSON.stringify(BK.tavern.debug().cards);p.press={right:true};p.keys.right=true;o.tr=[];for(let i=0;i<10;i++){BK.sim(1);o.tr.push(Math.round(p.x)+':vx'+Math.round(p.vx)+':'+['slide','dash','rush','dodge','surf','onMover','ground'].map(k=>k+'='+JSON.stringify(p[k]===undefined?null:(typeof p[k]==='object'&&p[k]?'obj':p[k]))).join(','));}o.moved=Math.abs(p.x-x0);p.keys.right=false;__key(p,'talk');o.closed=BK.tavern.debug().cards.length===0;o.p1hero=__P(1).hero;o.want=BK.tavern.seats()[0];return o;})()`);
      ok(wd.card.length === 1 && wd.card[0].n === 2 && wd.card[0].row === 'HERO', "THE WARDROBE opens P2's OWN card when P2 uses it: " + JSON.stringify(wd.card));
      ok(wd.h1 !== wd.h0 && wd.set, 'HERO: his RIGHT steps his hero (' + wd.h0 + ' -> ' + wd.h1 + '), baked in his own frames');
      ok(wd.c1 !== wd.c0 && wd.c1 !== wd.c1p1, 'COLOUR: his colour steps, never onto player one\'s (' + wd.c0 + ' -> ' + wd.c1 + ', P1 ' + wd.c1p1 + ')');
      ok(wd.r0 !== wd.r1, 'RING: the floor rings toggle (' + wd.r0 + ' -> ' + wd.r1 + ')');
      ok(wd.moved < 1 && wd.closed, 'the card holds his feet (moved ' + wd.moved.toFixed(1) + ' px ' + wd.cb + ' ' + (wd.tr||[]).join(' ') + ') and his INTERACT closes it');
      ok(wd.p1hero === 'knight' && wd.want && wd.want.hero === wd.h1, "player one is untouched, and the party for the road wears P2's pick: " + JSON.stringify(wd.want));
      const wpn = await E(`(()=>{const PR=BK.tavern.prog();PR.swords=Object.assign(PR.swords||{},{ember:true});const p=__P(1);__at(p,${STATIONS.find(s => s.id === 'wardrobe').x});BK.sim(2);__talk(p);__key(p,'down');const s0=PR.sword||'steel';__key(p,'right');const s1=PR.sword;__key(p,'talk');return {s0,s1,owned:Object.keys(PR.swords)};})()`);
      ok(wpn.s1 && wpn.s1 !== wpn.s0, "WEAPON: player one's weapon skin steps through the ones his save owns (" + wpn.s0 + ' -> ' + wpn.s1 + ')');
      /* drills board, practice, arena */
      const dr = await E(`(()=>{const p=__P(1);__at(p,${STATIONS.find(s => s.id === 'drills').x});BK.sim(3);__talk(p);return BK.tavern.hint().msg;})()`);
      ok(/THROW/.test(dr) && /REVIVE/.test(dr) && /TEAM HIT/.test(dr), 'THE DRILLS BOARD names the three partner drills: ' + dr.slice(0, 90));
      const ar = await E(`(()=>{const p=__P(1);__at(p,${STATIONS.find(s => s.id === 'arena').x});BK.sim(3);__talk(p);BK.sim(2);return {st:BK.state,h:BK.tavern.hint().msg,seen:__st('arena').seen};})()`);
      ok(ar.st === 'play' && /COMING SOON/.test(ar.h) && ar.seen, 'THE ARENA PIT is roped off: COMING SOON, nothing opens: ' + JSON.stringify(ar));
      /* the bell + revive drill */
      const bl = await E(`(()=>{const a=__P(1),b=__P(2),o={};for(const q of [a,b]){q.hp=q.maxHp;q.down=0;}__at(a,${STATIONS.find(s => s.id === 'bell').x});__at(b,${STATIONS.find(s => s.id === 'bell').x + 3},true);BK.sim(3);const d0=BK.stats().deaths;__talk(a);o.down=b.down;o.d0=d0;
        b.x=a.x+4;b.y=a.y;for(let i=0;i<150&&b.down>0;i++)BK.sim(1);o.up=!(b.down>0);o.hp=b.hp;o.rev=BK.tavern.debug().tavern.drills.revive;
        __talk(a);o.down2=b.down;b.x=a.x+120;for(let i=0;i<60*14&&b.down>0;i++)BK.sim(1);o.feet=!(b.down>0)&&b.hp===b.maxHp;o.deaths=BK.stats().deaths-d0;o.p1x=Math.round(a.x);o.inTav=!!BK.L.tavern;return o;})()`);
      ok(bl.down > 0, 'THE SPARRING BELL puts a partner DOWN (' + bl.down + ' s on his clock)');
      ok(bl.up && bl.rev >= 1, '...standing on him lifts him: the REVIVE drill counts it (' + bl.rev + ')');
      ok(bl.down2 > 0 && bl.feet && bl.deaths === 0 && bl.inTav, '...and left alone he is stood up at full health when his clock runs out - no death, no shrine: ' + JSON.stringify(bl));
      const solo = await E(`(async()=>{BK.coopEnd();await BK.tavern.enter();BK.sim(10);const a=__P(1);__at(a,${STATIONS.find(s => s.id === 'bell').x});BK.sim(3);__talk(a);return {n:BK.players().length,down:a.down||0,h:BK.tavern.hint().msg};})()`);
      ok(solo.down === 0 && /PARTNER/.test(solo.h), 'alone, the bell asks for a partner and knocks nobody down: ' + solo.h.slice(0, 60));
      /* team hit */
      const th = await E(`(()=>{BK.tavern.join({kind:'pad',pad:3});BK.sim(80);const a=__P(1),b=__P(2);const d=BK.enemies().find(e=>e.t==='dummy');a.x=d.x-14;a.y=b.y=d.y;b.x=d.x+14;a.face=1;b.face=-1;a.vx=b.vx=0;BK.sim(20);const t0=BK.tavern.debug().tavern.drills.team;
        BK.press('atk');BK.sim(8);b.press={atk:true};BK.sim(30);return {t0,t1:BK.tavern.debug().tavern.drills.team,stats:BK.tavern.debug().stats.team};})()`);
      ok(th.t1 === th.t0 + 1, 'TEAM HIT: two players striking one dummy inside ' + 1 + ' s counts once: ' + JSON.stringify(th));
      /* throw drill: aim at the hay */
      const tw = await E(`(()=>{const a=__P(1),b=__P(2),tx=${TARGET.x}*16+8;const one=x0=>{for(const q of [a,b]){q.vx=q.vy=0;q.hp=q.maxHp;q.st=q.maxSt;q.inv=0;q.grace=0;q.hurt=0;q.down=0;q.ptSafe=0;q.ptCd=0;}BK.partnerThrow().reset();a.x=x0;b.x=x0+10;a.y=b.y=20*16;a.face=1;b.face=-1;BK.sim(30);
        BK.press('grab');BK.sim(10);const held=!!b.ptH;BK.sim(20);BK.press('grab');let fl=false;for(let i=0;i<200;i++){BK.sim(1);if(b.ptF)fl=true;if(fl&&!b.ptF)break;}return {held,fl,land:b.x};};
        const r1=one(tx-140);const r2=one(tx-140+(tx-r1.land));return {r1,r2,tx,bulls:BK.tavern.debug().tavern.drills.throw};})()`);
      ok(tw.r1.held && tw.r1.fl, 'THE THROW DRILL: P1 grabs P2 and throws him (' + JSON.stringify(tw.r1) + ')');
      ok(Math.abs(tw.r2.land - tw.tx) <= TARGET.r && tw.bulls >= 1, '...landed in the hay target it counts a BULLSEYE: land ' + Math.round(tw.r2.land) + ' vs ' + tw.tx + ', bullseyes ' + tw.bulls);
      /* the table: the party takes the road, and the next wood starts with all of them */
      const tb = await E(`(async()=>{BK.tavern.join({kind:'pad',pad:4});BK.sim(80);const a=__P(1);__at(a,${STATIONS.find(s => s.id === 'table').x});for(const q of BK.players())if(q!==a){q.x=a.x+30;}BK.sim(3);__talk(a);BK.sim(2);
        const o={st:BK.state,seats:BK.tavern.seats().map(s=>s.hero+':'+(s.src&&s.src.kind)+':'+(s.src&&s.src.pad))};
        const {LEVELS}=await import('/src/level.js');BK.load(LEVELS.findIndex(l=>l.id==='wood'));BK.start();BK.sim(5);o.wood=BK.players().map(p=>p.hero+':'+(p.src?p.src.kind+':'+p.src.pad:'kb'));o.coop=BK.coop;return o;})()`);
      ok(tb.st === 'map' && tb.seats.length === 2, 'THE CAMPAIGN TABLE takes the party to the map, armed: ' + JSON.stringify(tb.seats));
      ok(tb.wood.length === 3 && tb.coop && tb.wood.slice(1).join() === tb.seats.map(s => s.split(':').slice(0, 3).join(':')).join(), '...and the next wood starts with all three, each on his own pad: ' + tb.wood.join(' '));
      /* the door, P1: out to the map with the party; practice */
      const dp = await E(`(async()=>{BK.coopEnd();await BK.tavern.enter();BK.sim(10);BK.tavern.join({kind:'pad',pad:3});BK.sim(80);const a=__P(1);__at(a,${STATIONS[0].x});BK.sim(3);__talk(a);BK.sim(1);const o={st:BK.state,seats:BK.tavern.seats().length};
        await BK.tavern.enter();BK.sim(5);o.back=BK.players().length;const b=__P(1);__at(b,${STATIONS.find(s => s.id === 'practice').x});BK.sim(3);__talk(b);o.pr=BK.state;BK.state='play';return o;})()`);
      ok(dp.st === 'map' && dp.seats === 1, 'THE DOOR, for player one: out to the map, the party with him: ' + JSON.stringify(dp));
      ok(dp.back === 2, '...and back into the inn the party comes in with him: ' + dp.back);
      ok(dp.pr === 'practice', 'THE PRACTICE DOOR opens the practice yards: ' + dp.pr);
      const seen = await E('BK.tavern.debug().stations.filter(s=>!s.seen).map(s=>s.id)');
      ok(seen.length === 0, 'every station used once: no glint left: ' + seen.join(','));
      const touchVerb = await E(`(()=>{BK.state='play';const a=__P(1);__at(a,${STATIONS.find(s => s.id === 'table').x});BK.sim(2);return BK.touchVerb?BK.touchVerb():null;})()`).catch(() => null);
      if (touchVerb !== null) ok(touchVerb && /ROAD/.test(JSON.stringify(touchVerb)), 'the touch USE button names the station (touch-friendly): ' + JSON.stringify(touchVerb));
    }

    if (PAGE.includes('fixes')) {
      /* claude/tavernfix (Daniel 10-18): the four-column win/victory card, the party pips under the map token, Practice back to the inn */
      console.log('fixes');
      const SHOT = process.env.TAVERN_SHOTS || ''; const fsx = await import('node:fs');
      const shot = async name => { if (!SHOT) return; const d = await E("document.querySelector('canvas').toDataURL('image/png')"); fsx.mkdirSync(SHOT, { recursive: true }); fsx.writeFileSync(SHOT + '/' + name + '.png', Buffer.from(d.split(',')[1], 'base64')); };
      const woodI = await E("(async()=>{const {LEVELS}=await import('/src/level.js');return LEVELS.findIndex(l=>l.id==='wood');})()");
      const VALS = '[[9,40,31,2,0,0],[22,70,12,0,3,1],[14,10,5,1,1,0],[30,90,20,0,0,2]]';
      const seat = (n, st) => "(()=>{BK.tavern.join({kind:'pad',pad:3});" + (n > 2 ? "BK.tavern.join({kind:'pad',pad:4});" : "") + (n > 3 ? "BK.tavern.join({kind:'pad',pad:5});" : "") + "BK.sim(90);BK.load(" + woodI + ");BK.start();BK.sim(5);const ps=BK.players();const v=" + VALS + ";ps.forEach((p,i)=>{const [k,d,c,r,t,x]=v[i];p.score={kills:k,dmg:d,coins:c,revives:r,turns:t,deaths:x};p.total={kills:k*3,dmg:d*3,coins:c*3,revives:r*3,turns:t*3,deaths:x*3};});BK.state='" + st + "';for(let i=0;i<240;i++)BK.draw1();return ps.length;})()";
      for (const [n, st, nm] of [[4, 'win', 'win-4'], [3, 'win', 'win-3'], [2, 'win', 'win-2'], [4, 'victory', 'victory-4'], [3, 'victory', 'victory-3'], [2, 'victory', 'victory-2']]) {
        await E('__fresh()');
        const e0 = pg.errors.length;
        const got = await E(seat(n, st)).catch(e => 'ERR ' + String(e.message || e).slice(0, 120));
        ok(got === n && pg.errors.length === e0, 'the ' + st + ' card for ' + n + ' players draws (' + nm + '): ' + got + ' ' + pg.errors.slice(e0, e0 + 2).join(' | '));
        await shot(nm);
      }
      /* the table of who is ahead, for three or four (the card's winner line) */
      await E('__fresh()');
      /* THE MAP TOKEN: a pip for every seat. Count the seat colours' pixels on the map frame with the party and without */
      const COLS = { blue: [0x6b, 0xb8, 0xff], rose: [0xff, 0x7a, 0x9a] };
      const count = "(()=>{BK.draw1();const c=document.querySelector('canvas'),t=document.createElement('canvas');t.width=c.width;t.height=c.height;const x=t.getContext('2d');x.drawImage(c,0,0);const d=x.getImageData(0,0,t.width,t.height).data,o={blue:0,rose:0};for(let i=0;i<d.length;i+=4){if(d[i]===107&&d[i+1]===184&&d[i+2]===255)o.blue++;if(d[i]===255&&d[i+1]===122&&d[i+2]===154)o.rose++;}return o;})()";
      const toMap = n => "(()=>{" + (n > 1 ? "BK.tavern.join({kind:'pad',pad:3});" : "") + (n > 2 ? "BK.tavern.join({kind:'pad',pad:4});" : "") + (n > 3 ? "BK.tavern.join({kind:'pad',pad:5});" : "") + "BK.sim(90);const a=__P(1);__at(a," + STATIONS[0].x + ");BK.sim(3);__talk(a);BK.sim(2);return BK.state;})()";
      const m1 = await E('__fresh()').then(() => E(toMap(1))); const c1 = await E(count); await shot('map-pips-1');
      const m4 = await E('__fresh()').then(() => E(toMap(4))); const c4 = await E(count); await shot('map-pips-4');
      const m3 = await E('__fresh()').then(() => E(toMap(3))); const c3 = await E(count); await shot('map-pips-3');
      ok(m1 === 'map' && m3 === 'map' && m4 === 'map', 'the door takes the party to the map: ' + [m1, m3, m4]);
      ok(c4.blue >= c1.blue + 4 && c4.rose >= c1.rose + 4, 'four seats: the blue (P3) and rose (P4) pips are on the map under the token: ' + JSON.stringify(c1) + ' -> ' + JSON.stringify(c4));
      ok(c3.blue >= c1.blue + 4 && c3.rose === c1.rose, 'three seats: P3 blue is there and P4 rose is not: ' + JSON.stringify(c3));
      /* PRACTICE, from the inn: leaving it goes back to the inn with the party; from the title it still goes to the title */
      await E('__fresh()');
      const esc = "(async()=>{document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',code:'Escape',bubbles:true}));BK.step(1);for(let i=0;i<200&&!(BK.state==='play'&&BK.L&&BK.L.tavern);i++)await new Promise(r=>setTimeout(r,50));return {st:BK.state,tav:!!(BK.L&&BK.L.tavern),n:BK.players().length};})()";
      const pr = await E("(()=>{BK.tavern.join({kind:'pad',pad:3});BK.sim(90);const b=__P(1);__at(b," + STATIONS.find(s => s.id === 'practice').x + ");BK.sim(3);__talk(b);BK.sim(1);return BK.state;})()");
      const back = await E(esc);
      ok(pr === 'practice' && back.st === 'play' && back.tav && back.n === 2, 'PRACTICE entered from the inn: ESC returns to the INN with the party: ' + pr + ' ' + JSON.stringify(back));
      const t0 = await E("(()=>{BK.coopEnd();BK.load(0);BK.state='practice';BK.step(1);return BK.state;})()");
      const t1 = await E("(()=>{document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',code:'Escape',bubbles:true}));BK.step(1);return BK.state;})()");
      ok(t0 === 'practice' && t1 === 'title', 'PRACTICE entered any other way: ESC still goes to the title: ' + t0 + ' -> ' + t1);
    }


    if (PAGE.includes('camera')) {
      console.log('camera');
      await E('__fresh()');
      const c = await E(`(()=>{BK.tavern.join({kind:'pad',pad:3});BK.sim(80);const a=__P(1),b=__P(2),o={};__at(a,14);__at(b,17,true);for(let i=0;i<100;i++){BK.sim(1);}__frame();o.near=BK.tavern.cam();
        __at(a,14);__at(b,29,true);for(let i=0;i<30;i++){BK.sim(1);}__frame();o.far=BK.tavern.cam();const v=BK.view;o.inside=BK.players().every(p=>p.x>=v.x&&p.x<=v.x+v.VW);
        b.x=16*16+8;b.y=320;b.vx=0;for(let i=0;i<20;i++){BK.sim(1);__frame();}o.hold=BK.tavern.cam();for(let i=0;i<120;i++){BK.sim(1);__frame();}o.back=BK.tavern.cam();
        BK.tavern.join({kind:'pad',pad:4});BK.sim(80);__frame();o.three=BK.tavern.cam();return o;})()`);
      ok(c.near.view === 'normal' && c.near.VW === 320, 'two together: the normal 320x180 view: ' + JSON.stringify(c.near));
      ok(c.far.view === 'coop' && c.far.VW > 320 && c.far.VW / 320 <= 1.25 + 1e-9 && c.inside, 'two spread out: the ONE shared camera steps out a little (' + c.far.VW + 'x' + c.far.VH + ') and both are in it');
      ok(c.hold.view === 'coop' && c.back.view === 'normal', '...together again it holds, then comes back: ' + c.hold.view + ' -> ' + c.back.view);
      ok(c.three.view === 'coop', 'three in the party: the party view: ' + JSON.stringify(c.three));
    }

    if (PAGE.includes('leash')) {
      console.log('leash');
      const r = await E(`(async()=>{await __fresh();const {LEVELS}=await import('/src/level.js');BK.load(LEVELS.findIndex(l=>l.id==='wood'));BK.start();BK.god=true;BK.enemies().forEach(e=>e.alive=false);BK.coopStart('warden',false);BK.sim(30);
        const L=BK.L;for(let x=2;x<160;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=26?1:0;for(let x=20;x<=27;x++)L.grid[4*L.W+x]=1;BK.resolve&&BK.resolve();
        const a=__P(1),b=__P(2),o={};BK.tp(34,25);b.x=a.x-10;b.y=a.y;BK.sim(60);
        /* stranded: P2 left on a ledge high over the picture */
        b.x=23*16+8;b.y=4*16;b.vx=b.vy=0;let saw=0;for(let i=0;i<150;i++){BK.sim(1);if(b.leash>0)saw=Math.max(saw,b.leash);}o.saw=saw;o.pulled=b.leashes||0;o.dx=Math.round(Math.abs(b.x-a.x));o.dy=Math.round(Math.abs(b.y-a.y));o.why=b.leashWhy;
        /* stretched: P2 stands, P1 runs on to the front edge and keeps pushing */
        BK.tp(34,25);b.x=a.x-4;b.y=a.y;b.vx=0;BK.sim(60);const p0=b.leashes||0;let t=0;BK.keys.right=true;for(let i=0;i<60*8&&(b.leashes||0)===p0;i++){BK.sim(1);t++;}BK.keys.right=false;o.stretch=(b.leashes||0)-p0;o.st=+(t/60).toFixed(1);o.gap=Math.round(Math.abs(b.x-a.x));
        /* downed: never */
        BK.tp(34,25);BK.sim(20);b.x=23*16+8;b.y=4*16;b.vx=b.vy=0;BK.sim(5);BK.coopDown(1);const p1=b.leashes||0;BK.sim(200);o.downPulled=(b.leashes||0)-p1;o.fx=BK.tavern.leashFx();return o;})()`);
      ok(r.saw > 0.3, 'a player left on a ledge high over the picture is TOLD first (the rope + CATCH UP: meter ' + r.saw.toFixed(2) + ')');
      ok(r.pulled === 1 && r.dx <= 20 && r.dy <= 4, '...then PULLED ALONG beside the leader in a puff (' + r.dx + ' px off him, ' + r.dy + ' px up/down)');
      ok(r.stretch === 1 && r.gap <= 20, 'a player left at the back edge while the leader pushes on at the front is pulled along too (after ' + r.st + ' s of pushing)');
      ok(r.downPulled === 0, 'a DOWNED player is never leashed (his partner comes back for him): ' + r.downPulled);
    }

    if (PAGE.includes('rings')) {
      console.log('rings');
      await E('__fresh()');
      const r = await E(`(()=>{BK.tavern.join({kind:'pad',pad:3});BK.tavern.join({kind:'pad',pad:4});BK.tavern.join({kind:'pad',pad:5});BK.sim(90);const ps=BK.players();ps.forEach((p,i)=>{__at(p,14+i*3,true);});BK.sim(60);
        const shot=()=>{__frame();const v=BK.view,c=v.buf.getContext('2d'),out=[];for(const p of ps){const x=Math.round(p.x-v.x),y=Math.round(p.y-v.y);const d=c.getImageData(x-11,y-6,23,18).data;out.push(d);}return out;};
        const hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];const cols=BK.tavern.party().map(p=>p.colour);
        __frame();__frame();window.__textRec=[];const on=shot();const tags=window.__textRec.filter(t=>t.kind==='text'&&/^P[1-4]$/.test(t.s)).map(t=>t.s);window.__textRec=null;
        const t=BK.tavern.prog().tavern;t.ring=false;const off=shot();t.ring=true;
        const dist=(d,i,rgb)=>Math.abs(d[i]-rgb[0])+Math.abs(d[i+1]-rgb[1])+Math.abs(d[i+2]-rgb[2]);let OFF=null;const near=(d,rgb,k)=>{let n=0;for(let i=0;i<d.length;i+=4)if(OFF?dist(d,i,rgb)<dist(OFF[k],i,rgb)-60:dist(d,i,rgb)<60)n++;return n;};
        const HX=${JSON.stringify(Object.fromEntries(COLOURS.map(c => [c.id, c.c])))};const offN=off.map((d,i)=>near(d,hex(HX[cols[i]]),i));OFF=off;const dbg0=[BK.tavern.debug().tavern.ring,BK.PROG.tavern&&BK.PROG.tavern.ring,BK.state];const dbg=ps.map(p=>[Math.round(p.x-BK.view.x),Math.round(p.y-BK.view.y),BK.view.VW,BK.coop]);let md=0;for(let k=0;k<on.length;k++)for(let i=0;i<on[k].length;i++)md=Math.max(md,Math.abs(on[k][i]-off[k][i]));return {dbg:[dbg0,dbg],md,cols,off:offN,on:on.map((d,i)=>near(d,hex(HX[cols[i]]),i)),tags:[...new Set(tags)].sort(),view:BK.tavern.cam()};})()`);
      ok(r.on.every(n => n >= 6), 'each hero\'s FLOOR RING is drawn in his colour under his feet (' + r.cols.map((c, i) => c + ' ' + r.on[i] + ' px, off ' + r.off[i]).join('; ') + ') ' + JSON.stringify([r.dbg, r.md]));
      ok(r.tags.join() === 'P1,P2,P3,P4', 'the name tags P1..P4 are drawn: ' + r.tags.join(','));
      const hud = await E(`(()=>{BK.state='play';__frame();const hr=(BK.hudRects?BK.hudRects():null);return hr?hr.length:-1;})()`).catch(() => -1);
      if (hud >= 0) ok(hud >= 3, 'three seat plates go in the HUD for P2..P4: ' + hud);
    }

    if (PAGE.includes('save')) {
      console.log('save');
      const OLD = { hero: 'knight', heroes: { knight: true, warden: true }, coins: 321, wood: { cleared: true, best: 200 }, mapNode: 1, sentinel: 'keep-me' };
      const sv = await E(`(async()=>{const o={};BK.coopEnd();localStorage.setItem('bracken.progress.3',${JSON.stringify(JSON.stringify(OLD))});BK.loadSlot(3);o.slot=BK.slot;o.loadedTav=BK.tavern.prog().tavern===undefined?'none':typeof BK.tavern.prog().tavern;BK.tavern.save();const base=JSON.parse(localStorage.getItem('bracken.progress.3'));
        await BK.tavern.enter();BK.sim(10);o.st=BK.state;o.tav=!!BK.L.tavern;BK.tavern.join({kind:'pad',pad:3});BK.sim(80);const p=__P(2);__at(p,${STATIONS.find(s => s.id === 'wardrobe').x});BK.sim(3);__talk(p);__key(p,'down');__key(p,'down');__key(p,'right');__key(p,'talk');BK.tavern.save();
        const raw=JSON.parse(localStorage.getItem('bracken.progress.3'));o.written=raw.tavern;o.keep=raw.sentinel===OLDS.sentinel&&raw.coins===base.coins&&raw.wood&&raw.wood.cleared===true&&raw.heroes.warden===true;o.raw={c:raw.coins,s:raw.sentinel,w:raw.wood,h:raw.heroes};o.moved=[...new Set(Object.keys(base).concat(Object.keys(raw)))].filter(k=>k!=="tavern"&&JSON.stringify(base[k])!==JSON.stringify(raw[k]));
        localStorage.setItem('bracken.progress.4',JSON.stringify(Object.assign({},OLDS,{tavern:{colours:'red',seen:[1,2],drills:{throw:'lots'},ring:'yes'}})));BK.coopEnd();BK.loadSlot(4);await BK.tavern.enter();BK.sim(10);o.broken={st:BK.state,tav:BK.tavern.debug().tavern};return o;})()`.replace(/OLDS/g, JSON.stringify(OLD)));
      ok(sv.loadedTav === 'none' && sv.st === 'play' && sv.tav, 'an OLD save (no tavern record) loads and walks into the inn: ' + JSON.stringify({ l: sv.loadedTav, st: sv.st }));
      ok(sv.written && Array.isArray(sv.written.colours) && sv.written.colours.length === 4 && sv.written.colours[1] !== 'green' && typeof sv.written.ring === 'boolean', 'the tavern record is written back whole (P2\'s wardrobe colour kept): ' + JSON.stringify(sv.written));
      ok(sv.keep && sv.moved.every(k => /^(coopTips|heardMusic|crouchFirst|hintSeen)$/.test(k)), 'nothing else in the old save moved (heroes, coins, clears, its own fields - only play bookkeeping: music heard, the co-op tips, first-crouch; vs the same save loaded and saved without the inn): ' + JSON.stringify([sv.keep, sv.moved, sv.raw]));
      ok(sv.broken.st === 'play' && sv.broken.tav.colours.length === 4 && sv.broken.tav.drills.throw === 0, 'a save with a BROKEN tavern record loads and is read whole: ' + JSON.stringify(sv.broken.tav));
    }
    ok(pg.errors.length === 0, 'no page error: ' + pg.errors.slice(0, 3).join(' | '));
  } catch (e) { fails.push('aborted: ' + String(e && e.message || e).split('\n')[0]); console.log('ABORT ' + (e && e.stack || e)); }
  finally { pg.close(); }
}

/* ONLINE IN THE INN (two browsers over the local signalling stub, as tools/online-coop.mjs): a guest who picks his hero WALKS IN THROUGH THE DOOR as a
   seat beside local pads (mixed); his own hands drive his seat; with the party full a guest is told THAT GAME IS FULL; when he goes, his seat goes */
if (WANT.includes('online')) {
  console.log('online');
  const { openPage } = await import('./cdp.mjs'); const { startStub } = await import('./online-stub.mjs'); const { PORT_BASE } = await import('./ports.mjs');
  const PORT = +(process.env.PORT || PORT_BASE), RELAY = +(process.env.ONLINE_RELAY || PORT + 1), URL0 = 'http://localhost:' + PORT + '/';
  const ARGS = ['--disable-features=WebRtcHideLocalIpsWithMdns', '--allow-loopback-in-peer-connection'];
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const until = async (pg, expr, ms = 20000, what = expr) => { const t0 = Date.now(); let v; while (Date.now() - t0 < ms) { try { v = await pg.evalp(expr, 5000); } catch { v = undefined; } if (v) return v; await sleep(150); } throw new Error('timed out waiting for ' + what); };
  async function nav(pg, url, ready) { const t0 = await pg.evalp('performance.timeOrigin', 5000).catch(() => 0); await pg.send('Page.navigate', { url }); await until(pg, 'performance.timeOrigin !== ' + t0 + ' && location.href === ' + JSON.stringify(url) + ' && (' + ready + ')', 90000, 'the page at ' + url); }
  let stub = null, host = null, guest = null;
  try {
    stub = await startStub(RELAY);
    host = await openPage({ audio: true, fonts: false, args: ARGS });
    guest = await openPage({ audio: false, fonts: false, args: ARGS, noWait: true });
    await nav(host, URL0 + '?net=local&relay=' + RELAY, 'typeof window.BK === "object" && !!window.BK.lookPass && !!window.BKONLINE');
    const H = e => host.evalp(e, 60000), Gu = e => guest.evalp(e, 60000);
    await H('(async()=>{BK.SET.speed=1;BK.reset({fresh:true});await BK.tavern.enter();BK.tavern.join({kind:"pad",pad:3});return true})()');
    await until(host, 'BK.players().length===2&&!(BK.players()[1].walkIn>0)', 15000, 'the local P2 in');
    await H('[...document.querySelectorAll("#olhost button")].find(b=>b.textContent==="HOST A GAME")?1:(BKONLINE.open(),1)');
    await H('[...document.querySelectorAll("#olhost button")].find(b=>b.textContent==="HOST A GAME").click()');
    const code = await until(host, 'BKONLINE.debug().sess && BKONLINE.debug().sess.phase === "waiting" && BKONLINE.debug().sess.code', 15000, 'the room');
    await nav(guest, URL0 + '?join=' + code + '&net=local&relay=' + RELAY, '!!window.BKGUEST');
    await until(guest, 'BKGUEST.state().phase === "pick"', 25000, 'the guest pick');
    const chalk = await H('(async()=>{const b=document.getElementById("olhost");if(b)b.style.display="none";const p=BK.players()[0];p.x=7*16+8;await new Promise(r=>setTimeout(r,400));window.__textRec=[];await new Promise(r=>setTimeout(r,300));const t=(window.__textRec||[]).filter(x=>x.kind==="text").map(x=>x.s);window.__textRec=null;if(b)b.style.display="";return t.find(s=>/^[A-Z]{4}$/.test(s)&&s===BKONLINE.debug().sess.code)||t.join(",").slice(0,80)})()');
    ok(chalk === code, 'the room code is the one chalked on the invite board: ' + chalk);
    await Gu('[...document.querySelectorAll("#olguest button")].find(b=>b.textContent==="PYRO"||b.textContent==="RANGER"||b.textContent==="GEOMANCER").click()');
    const w = await until(host, '(()=>{const p=BK.players()[2];return p&&p.src&&p.src.kind==="online"&&{n:p.n,x:p.x,walk:p.walkIn,hero:p.hero,door:BK.tavern.debug().stations[0].x}})()', 15000, 'the guest seated');
    ok(w.n === 3 && w.walk > 0 && Math.abs(w.x - w.door) < 24, 'the online guest WALKS IN THROUGH THE DOOR as P3, beside the local P2 (mixed): ' + JSON.stringify(w));
    await until(guest, 'BKGUEST.state().phase === "play" && BKGUEST.state().seat === 3', 10000, 'the guest told he is P3');
    ok(true, '...and the guest page says P3');
    await until(host, '!(BK.players()[2].walkIn>0)', 5000, 'walked in');
    const x0 = await H('BK.players()[2].x');
    await guest.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 });
    const moved = await until(host, '(()=>{const p=BK.players()[2];return p.x-' + x0 + '>12&&Math.round(p.x)})()', 6000, 'P3 moving').catch(() => 0);
    await guest.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 });
    ok(moved > 0, "the guest's own keys drive HIS seat (P3): " + Math.round(x0) + ' -> ' + moved);
    /* a fourth (local) fills the party; the guest leaves and comes back: THAT GAME IS FULL */
    await H('BK.tavern.join({kind:"pad",pad:4})');
    await nav(guest, URL0 + 'manifest.webmanifest', 'true');
    await until(host, 'BK.players().length===3 && !BK.players().some(p=>p.src&&p.src.kind==="online")', 15000, 'his seat to go');
    ok(true, 'the guest leaving takes his seat away; the local seats stay');
    await H('BK.tavern.join({kind:"pad",pad:5})');
    await nav(guest, URL0 + '?join=' + code + '&net=local&relay=' + RELAY, '!!window.BKGUEST');
    const full = await until(guest, 'BKGUEST.state().phase === "ended" && BKGUEST.state().err', 25000, 'the guest told').catch(e => String(e));
    ok(full === 'full', 'with four in the party a joining guest is told THAT GAME IS FULL: ' + full);
    ok(host.errors.length === 0 && guest.errors.length === 0, 'no page error: ' + host.errors.concat(guest.errors).slice(0, 2).join(' | '));
    await H('BKONLINE.end()');
  } catch (e) { fails.push('online aborted: ' + String(e && e.message || e).split('\n')[0]); }
  finally { for (const pg of [guest, host]) if (pg) try { await pg.close(); } catch {} if (stub) await stub.close(); }
}
if (fails.length) { console.log('tavern: ' + fails.length + ' failed'); for (const f of fails) console.log('FAIL ' + f); process.exit(1); }
console.log('tavern: OK - four seats (pads walk in through the door), every station, the shared camera\'s step out, the leash, rings + tags, old saves fine');
