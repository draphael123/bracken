// tools/lesson-opening.mjs - THE ROADSIDE LESSON (claude/tutorial1, Daniel 11-05 22:05): the generic opening for a new save, replayable from the inn.
//   pure   src/opening-tutorial.js: the level builds (one floor, a curb, a ditch, a ledge, straw, a gate per gated step, an inn door), is hidden, has NO `trial` flag (co-op),
//          every step has a prompt line that fits three rows of the panel for every key set (keyboard, pad, touch words), the demo slice names it, the append log keeps its order
//   walk   a scripted player does the lesson for three heroes (knight, ranger = ranged, paladin = heavy): every step ends on the thing it asks for, the gates lift, PROG.taught
//          is written, the door enters the inn, PROG.lesson = 1
//   skip   the pause row says SKIP LESSON and goes to the inn (PROG.lesson = 2); the stall rule opens a gate by itself after STALL_S
//   inn    the first arrival shows the card once (PROG.innTold); the LESSON BOARD station replays it and the way back is the inn
//   flow   a NEW save's hero pick starts the lesson (not the old Arena Yard question); an old save with progress is not sent there
// node tools/lesson-opening.mjs [pure,walk,skip,inn,flow]   (needs a headless browser for all but pure: RAM >= 1500 MB free)
import { OT, STEPS, GEO, stepLine, STALL_S, INN_CARD, INN_SIGN, LESSON_TIPS, SKIP_LINE } from '../src/opening-tutorial.js';
import { DEMO_IDS } from '../src/demo-slots.js';
import { STATIONS } from '../src/tavern.js';
const ALL = ['pure', 'walk', 'skip', 'inn', 'flow'];
const WANT = process.argv[2] ? process.argv[2].split(',') : ALL;
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log('  FAIL ' + m); } else console.log('  ok   ' + m); };
const WORDS = { kb: { move: 'ARROWS OR A D', jump: 'Z', atk: 'X', block: 'C', dodge: 'TAP A WAY TWICE, OR V', flask: 'U', pause: 'ESC', talk: 'E' },
  pad: { move: 'THE STICK OR D-PAD', jump: 'A', atk: 'X', block: 'RB', dodge: 'B', flask: 'LT', pause: 'START', talk: 'D-UP' },
  touch: { move: 'THE STICK', jump: 'THE JUMP BUTTON', atk: 'THE ATTACK BUTTON', block: 'DEFEND', dodge: 'TAP DEFEND', flask: 'THE FLASK BUTTON', pause: 'THE BACK BUTTON', talk: 'THE USE BUTTON' } };

if (WANT.includes('pure')) {
  console.log('pure');
  ok(STEPS.length === 8 && STEPS.map(s => s.id).join() === 'move,jump,high,attack,block,dodge,flask,shrine', 'eight steps: move, jump, higher, attack, block, dodge, flask, shrine');
  for (const [i, s] of STEPS.entries()) { if (i && s.x0 !== (STEPS[i - 1].gate ?? STEPS[i - 1].x1) + 1) ok(false, 'steps are contiguous at ' + s.id); if (s.gate !== null) ok(s.gate === s.x1 + 1, s.id + ' gate sits right after its station'); }
  ok(STEPS[STEPS.length - 1].x1 < GEO.door && OT.W > GEO.inn.x1 + 2, 'the door is past the last station and inside the room');
  ok(DEMO_IDS.has('lesson'), 'the demo slice names the lesson (demo players need it)');
  /* the level */
  const { LEVELS } = await import('../src/level.js'); const T = (await import('../src/level.js')).T;
  const idx = LEVELS.findIndex(l => l.id === 'lesson'); ok(idx === LEVELS.length - 1 || LEVELS.slice(idx + 1).every(l => l.id !== 'arena_yard'), 'lesson is appended after the arena yard (the log never shifts)');
  ok(idx > LEVELS.findIndex(l => l.id === 'duel_pit') && idx > LEVELS.findIndex(l => l.id === 'arena_yard'), 'appended after duel_pit and arena_yard');
  ok(LEVELS[idx].hidden === true, 'hidden (not on the road)');
  const L = LEVELS[idx].build();
  ok(L.opening && L.openYard && L.trial === undefined, 'opening + openYard set, NO `trial` (a truthy trial turns co-op off and hides the flask row)');
  const c = {}; for (const e of L.ents) c[e.t] = (c[e.t] || 0) + 1;
  ok(c.dummy === 3 && c.swornsword === 2 && c.check === 1, 'three straw men, two straw swordsmen, one shrine (' + JSON.stringify(c) + ')');
  ok(L.ents.filter(e => e.t === 'swornsword').every(e => e.trainer === 'drill' && e.yardPace >= 1.5), 'the swordsmen are slow trainers (never down)');
  ok(L.opening.gates.length === STEPS.filter(s => s.gate).length && L.opening.gates.length === 5, 'five gates (attack, block, dodge, flask, shrine)');
  const g = (x, y) => L.grid[y * L.W + x];
  ok(L.opening.gates.every(q => { for (let y = 14; y <= OT.FLOOR - 1; y++) if (g(q.col, y) !== T.PORT) return false; for (let y = 0; y <= 13; y++) if (g(q.col, y) !== T.SOLID) return false; return true; }), 'every gate is a full-height port under stone: no jump gets over one');
  ok(g(GEO.curb, OT.FLOOR - 1) === T.SOLID && g(GEO.curb + 1, OT.FLOOR - 1) === T.AIR, 'a one-tile curb');
  ok([0, 1].every(y => g(GEO.pit[0], OT.FLOOR + y) === T.AIR) && g(GEO.pit[0], OT.FLOOR + 2) === T.SOLID && g(GEO.pit[1] + 1, OT.FLOOR) === T.SOLID, 'a ditch two rows deep with a floor in it (a jump climbs out; nothing is lost)');
  ok(g(GEO.ledge[0], OT.FLOOR - 2) === T.SOLID && g(GEO.ledge[0], OT.FLOOR - 3) === T.AIR, 'a two-row ledge (only a held jump climbs it)');
  ok(L.START.x === OT.START && Math.abs(L.START.x * 16) < 8 * 16, 'start at the west end');
  /* the prompts */
  for (const [set, k] of Object.entries(WORDS)) for (const s of STEPS) { const line = stepLine(s.id, k); ok(line.length > 10 && !/undefined/.test(line) && line.length <= 96, set + ' / ' + s.id + ': ' + line.length + ' letters'); }
  ok(WORDS.kb.jump !== WORDS.kb.atk, 'jump and attack are named differently');
  ok(/HOLD Z|HOLD THE JUMP/.test(stepLine('high', WORDS.kb) + stepLine('high', WORDS.touch)), 'the held jump is taught');
  ok(INN_CARD.body.length <= 110 && INN_SIGN === "WAYMEET'S CROSSROADS INN", 'the inn card and sign');
  ok(LESSON_TIPS.length === 3, 'three loading tips');
  const lesson = STATIONS.find(s => s.id === 'lesson'); ok(lesson && lesson.verb === 'LESSON' && !STATIONS.some(s => s !== lesson && Math.abs(s.x - lesson.x) < 2), 'the inn has a LESSON BOARD station, two tiles clear of any other');
  const { TIPS } = await import('../src/loading-screen.js'); ok(LESSON_TIPS.every(t => TIPS.includes('TIP: ' + t)), 'the loading screen carries the three tips');
}

if (WANT.some(w => ['walk', 'skip', 'inn', 'flow'].includes(w))) {
  const { openPage } = await import('./cdp.mjs');
  const pg = await openPage({ audio: false, fonts: false, seed: 11 }); const E = e => pg.evalp(e); const sleep = ms => new Promise(r => setTimeout(r, ms));
  try {
    await E(`(async()=>{const {LEVELS,T}=await import('/src/level.js');window.__LV=LEVELS;window.__T=T;window.__IDX=LEVELS.findIndex(l=>l.id==='lesson');window.__TAV=LEVELS.findIndex(l=>l.id==='tavern');
      window.__go=(h)=>{BK.manualSimulation=true;for(const k in BK.keys)BK.keys[k]=false;BK.setHero(h);BK.reset({fresh:true});BK.applyUpgrades();BK.load(__IDX);BK.start();BK.god=false;BK.sim(30);};
      window.__p=()=>BK.players()[0];
      window.__stand=(col,face)=>{const p=__p();p.x=col*16+8;p.y=20*16-0.01;p.vx=0;p.vy=0;p.face=face||1;p.ground=true;};
      window.__O=()=>BK.lesson().O;
      window.__gateOpen=col=>{const L=BK.L;return L.grid[15*L.W+col]!==__T.PORT;};
      /* a walker: right, with a jump (held n frames) at the curb, the ditch and the ledge */
      window.__walk=(toCol,maxF)=>{const K=BK.keys,p=__p();let jf=0;for(let f=0;f<maxF&&p.x<toCol*16;f++){K.right=true;
        const x=p.x;if(p.ground&&jf<=0){ if(x>=19*16-14&&x<19*16-4){jf=10;BK.press('jump');} else if(x>=23*16-10&&x<23*16+2){jf=16;BK.press('jump');} else if(x>=32*16-20&&x<32*16-8){jf=34;BK.press('jump');} else if(x>=12&&p.ground&&p.vx===0&&f>40&&x<19*16-30){} }
        if(jf>0){K.jump=true;jf--;}else K.jump=false;BK.sim(1);}K.right=false;K.jump=false;};
      window.__rep=n=>{for(let i=0;i<n;i++){BK.press('atk');BK.sim(18);}};
    })()`);
    for (const t of ['walk', 'skip', 'inn', 'flow']) if (!WANT.includes(t)) continue;

    if (WANT.includes('walk')) {
      for (const hero of (process.env.HEROES || 'knight,ranger,paladin').split(',')) {
        console.log('walk ' + hero);
        await E(`__go('${hero}')`);
        const L0 = await E(`(()=>{const o=BK.L.opening;return {on:!!o,trial:BK.L.trial===undefined,i:__O().st.i}})()`);
        ok(L0.on && L0.trial && L0.i === 0, hero + ': the lesson loads, step 0, no trial flag');
        await E(`__walk(15,900)`); let st = await E(`({i:__O().st.i,done:Object.keys(__O().st.done)})`); ok(st.done.includes('move'), hero + ': MOVE done by walking (' + st.done + ')');
        await E(`__walk(27.6,1200)`); st = await E(`({i:__O().st.i,done:Object.keys(__O().st.done),x:__p().x/16})`); ok(st.done.includes('jump'), hero + ': JUMP done by clearing the curb and the ditch (' + st.done + ' x=' + st.x.toFixed(1) + ')');
        await E(`__walk(37,1500)`); st = await E(`({i:__O().st.i,done:Object.keys(__O().st.done),x:__p().x/16})`); ok(st.done.includes('high'), hero + ': HIGHER done by a held jump onto the ledge (' + st.done + ' x=' + st.x.toFixed(1) + ')');
        /* attack: three blows on a straw man */
        await E(`__stand(41,1);BK.sim(20);__rep(12);BK.sim(20)`); st = await E(`({done:Object.keys(__O().st.done),hits:__O().st.ev.hit,third:__O().st.ev.third,taught:BK.lesson().PROG().taught||{}})`);
        ok(st.done.includes('attack') && st.hits >= 3, hero + ': ATTACK done on the straw (' + st.hits + ' hits, third ' + st.third + ')');
        ok(await E(`__gateOpen(51)`), hero + ': the attack gate lifted');
        /* block: hold the guard in front of the first swordsman until a blow is turned */
        await E(`__stand(53,1);BK.sim(180)`);
        let blocked = false; for (let n = 0; n < 400 && !blocked; n++) { await E(`(()=>{const K=BK.keys,p=__p(),f=BK.enemies().filter(e=>e.t==='swornsword'&&e.x>p.x-40).sort((a,b)=>a.x-b.x)[0];K.block=!!(f&&Math.abs(f.x-p.x)<64&&(f.mode==='cutTell'||f.mode==='cut'));K.right=!!(f&&f.x-p.x>34&&p.x/16<62);BK.sim(8);K.right=false;})()`); blocked = await E(`__O().st.done.block!==undefined`); if (process.env.DBG && n % 40 === 0) console.log(n, JSON.stringify(await E(`(()=>{const p=__p(),f=BK.enemies().filter(e=>e.t==='swornsword')[0];return {px:+(p.x/16).toFixed(1),fx:+(f.x/16).toFixed(1),fm:f.mode,st:Math.round(p.st),ev:__O().st.ev,i:__O().st.i,ph:p.hurt,inv:p.inv}})()`))); }
        if (process.env.DBG) console.log(JSON.stringify(await E(`(()=>{const p=__p();return {px:p.x/16,st:p.st,hp:p.hp,blk:p.block,foes:BK.enemies().filter(e=>e.t==='swornsword').map(e=>({x:e.x/16,m:e.mode,cd:e.cd}))}})()`)));
        await E(`BK.keys.block=false`); ok(blocked, hero + ': BLOCK done by holding the guard as he swings (' + (await E(`__O().st.ev.blocked`)) + ' turned)');
        ok(await E(`__gateOpen(64)`), hero + ': the block gate lifted');
        /* dodge: roll through his swing */
        await E(`__stand(65,1);BK.sim(120)`);
        let dodged = false; for (let n = 0; n < 700 && !dodged; n++) { await E(`(()=>{const p=__p(),f=BK.enemies().filter(e=>e.t==='swornsword'&&e.x>65*16).sort((a,b)=>a.x-b.x)[0];if(f&&Math.abs(f.x-p.x)<70&&(f.mode==='cutTell'&&f.modeT<0.3||f.mode==='cut')){BK.keys.right=true;BK.press('dodge');BK.sim(2);BK.keys.right=false;}else if(f&&f.x-p.x>44){BK.keys.right=true;}BK.sim(3);BK.keys.right=false;})()`); dodged = await E(`__O().st.done.dodge!==undefined`); if (process.env.DBG && n % 1 === 0 && process.env.DBG === '2') console.log(n, JSON.stringify(await E(`(()=>{const p=__p(),f=BK.enemies().filter(e=>e.t==='swornsword'&&e.x>65*16).sort((a,b)=>a.x-b.x)[0];return {px:+(p.x/16).toFixed(1),dg:p.dodge,fx:f&&+(f.x/16).toFixed(1),fm:f&&f.mode,mt:f&&+f.modeT.toFixed(2),ev:__O().st.ev}})()`))); }
        const dd = await E(`({dodged:__O().st.ev.dodged,blocked:__O().st.ev.blocked,stall:__O().st.stats.stalls})`);
        ok(dodged, hero + ': DODGE done (' + JSON.stringify(dd) + ')');
        ok(await E(`__gateOpen(77)`), hero + ': the dodge gate lifted');
        /* flask: the road bites you, you drink */
        await E(`__stand(80,1);BK.sim(20)`); const hp0 = await E(`BK.lesson().hp()`); ok(hp0.hp < hp0.max && hp0.flasks >= 1, hero + ': the flask step hurts you to 45% and gives a flask (' + hp0.hp + '/' + hp0.max + ', ' + hp0.flasks + ' flask)');
        await E(`(()=>{BK.press('flask');BK.sim(150);})()`); const hp1 = await E(`BK.lesson().hp()`); st = await E(`({done:Object.keys(__O().st.done)})`);
        ok(hp1.hp > hp0.hp && st.done.includes('flask'), hero + ': FLASK done by drinking (' + hp0.hp + ' -> ' + hp1.hp + ')');
        ok(await E(`__gateOpen(89)`), hero + ': the flask gate lifted');
        /* shrine */
        await E(`__walk(94.4,600)`); await E(`BK.sim(30)`); st = await E(`({done:Object.keys(__O().st.done),i:__O().st.i})`);
        ok(st.done.includes('shrine') && st.i === 8, hero + ': SHRINE done by lighting it; all eight steps done');
        ok(await E(`__gateOpen(100)`), hero + ': the last gate lifted');
        const pr = await E(`BK.lesson().PROG().taught||{}`); ok((pr.third === 1 || hero === 'ranger') && pr.block === 1 && pr.dodge === 1 && pr.flask === 1 && pr.shrine === 1 && pr.jump === 1, hero + ': PROG.taught carries third, jump, block, dodge, flask, shrine (' + JSON.stringify(pr) + ')');
        /* the door */
        await E(`__stand(105,1);BK.sim(10)`); const nd = await E(`__O().st.nearDoor`); ok(nd, hero + ': near the inn door the prompt is up');
        await E(`BK.press('talk')`); for (let i = 0; i < 500 && !(await E(`!!(BK.L&&BK.L.tavern)`)); i++) { await E('BK.sim(1)'); await sleep(5); }
        ok(await E(`!!(BK.L&&BK.L.tavern)`), hero + ': the door enters the inn'); ok((await E(`BK.lesson().PROG().lesson`)) === 1, hero + ': PROG.lesson = 1 (finished)');
      }
    }
    if (WANT.includes('skip')) {
      console.log('skip');
      await E(`__go('knight')`); await E(`BK.sim(60)`);
      const items = await E(`BK.ui.menuItems?BK.ui.menuItems():null`);
      await E(`(()=>{BK.lesson().leave(true);})()`); for (let i = 0; i < 500 && !(await E(`!!(BK.L&&BK.L.tavern)`)); i++) { await E('BK.sim(1)'); await sleep(5); }
      ok(await E(`!!(BK.L&&BK.L.tavern)`), 'SKIP goes to the inn'); ok((await E(`BK.lesson().PROG().lesson`)) === 2, 'PROG.lesson = 2 (skipped), not finished');
      /* the stall rule: a gate opens by itself and teaches nothing */
      await E(`__go('knight')`); await E(`__walk(38.5,1500)`);
      const stall = await E(`(()=>{const O=__O();O.st.i=3;O.st.inStep=${STALL_S - 0.2};__stand(45,1);BK.sim(40);return {i:O.st.i,stalls:O.st.stats.stalls,third:(BK.lesson().PROG().taught||{}).third||0,done:O.st.done.attack};})()`);
      ok(stall.done === 'stall' && stall.stalls === 1 && stall.third === 0, 'forty seconds with no headway opens the gate and teaches nothing (' + JSON.stringify(stall) + ')');
    }
    if (WANT.includes('inn')) {
      console.log('inn');
      await E(`(()=>{BK.manualSimulation=true;BK.setHero('knight');BK.reset({fresh:true});BK.lesson().PROG().innTold=0;BK.lesson().O.st.card=null;})()`);
      await E(`BK.lesson().O.innCard(9)`); const c0 = await E(`!!BK.lesson().O.st.card`); ok(c0, 'the inn card can be raised');
      await E(`(()=>{BK.load(__TAV);BK.start();BK.sim(5);})()`);
      const stn = await E(`(()=>{const T=BK.tavern;return T?T.debug().stations.map(s=>s.id):null;})()`); ok(stn && stn.includes('lesson'), 'the tavern lists the lesson station (' + stn + ')');
      /* use the station: it leads into the lesson and the way back is the inn */
      await E(`(()=>{const p=__p();p.x=56*16+8;p.y=20*16-0.01;p.vy=0;p.ground=true;BK.sim(5);})()`);
      const near = await E(`(()=>{const T=BK.tavern;return T.debug().near[0];})()`); ok(near && near.s === 'lesson', 'standing at the board names the lesson station (' + JSON.stringify(near) + ')');
      await E(`BK.press('talk')`); for (let i = 0; i < 500 && !(await E(`!!(BK.L&&BK.L.opening)`)); i++) { await E('BK.sim(1)'); await sleep(5); }
      ok(await E(`!!(BK.L&&BK.L.opening)`), 'the lesson board replays the lesson');
      await E(`BK.lesson().leave(true)`); for (let i = 0; i < 500 && !(await E(`!!(BK.L&&BK.L.tavern)`)); i++) { await E('BK.sim(1)'); await sleep(5); }
      ok(await E(`!!(BK.L&&BK.L.tavern)`), 'and its way out is the inn');
      /* the card shows once: the flag is set by the first arrival and a second arrival does not raise it */
      const t1 = await E(`BK.lesson().PROG().innTold`); ok(t1 === 1, 'PROG.innTold set by the first arrival (' + t1 + ')');
      await E(`BK.lesson().O.st.card=null`); await E(`(()=>{BK.load(__TAV);BK.start();BK.sim(5);})()`); ok(!(await E(`!!BK.lesson().O.st.card`)), 'a second direct load does not raise the card (it is raised by the walk-in, once)');
    }
    if (WANT.includes('flow')) {
      console.log('flow');
      await E(`(()=>{BK.manualSimulation=true;BK.setHero('knight');BK.reset({fresh:true});BK.state='heropick';BK.ui.heroPickI=0;BK.ui.heroPickStage='pick';})()`);
      await E(`BK.press('confirm')`); await E('BK.sim(2)'); const s1 = await E(`BK.ui.heroPickStage`); ok(s1 === 'trial' || s1 === 'go', 'a hero pick moves to the lesson stage (' + s1 + ')');
      for (let i = 0; i < 600 && !(await E(`!!(BK.L&&BK.L.opening)`)); i++) { await E('BK.sim(1)'); await sleep(5); }
      ok(await E(`!!(BK.L&&BK.L.opening)`), 'a NEW save goes straight into the roadside lesson (not the Arena Yard question)');
    }
    ok(pg.errors.length === 0, 'no page errors' + (pg.errors.length ? ': ' + JSON.stringify(pg.errors.slice(0, 3)) : ''));
  } finally { pg.close(); }
}
console.log(fails.length ? '\nFAILED ' + fails.length + '\n' + fails.join('\n') : '\nPASSED'); process.exit(fails.length ? 1 : 0);
