// tools/lesson-opening.mjs - THE ROADSIDE LESSON (claude/tutorial1, Daniel 11-05 22:05): the generic opening for a new save, replayable from the inn.
//   pure   src/opening-tutorial.js: the level builds (one floor, a curb, a ditch, a ledge, straw, a gate per gated step, an inn door), is hidden, has NO `trial` flag (co-op),
//          every step has a prompt line that fits three rows of the panel for every key set (keyboard, pad, touch words), the demo slice names it, the append log keeps its order
//   walk   a scripted player does the lesson for three heroes (knight, ranger = ranged, paladin = heavy): every step ends on the thing it asks for, the gates lift, PROG.taught
//          is written, the door enters the inn, PROG.lesson = 1
//   skip   the pause row says SKIP LESSON and goes to the inn (PROG.lesson = 2); the stall rule opens a gate by itself after STALL_S
//   inn    the first arrival shows the card once (PROG.innTold); the LESSON BOARD station replays it and the way back is the inn
//   flow   a NEW save's hero pick starts the lesson (not the old Arena Yard question); an old save with progress is not sent there
//   sim    (claude/tutorial2) NO BROWSER: the lesson runtime driven with a stub api - the straw yard's four credits (heavy, rising, sweep, plunge) from a blow's own tag and from the yard's events,
//          the wrong blow, the hero with no sweep (ranger) skipping it, PROG.taught marks, the stall gate, the panel count
// node tools/lesson-opening.mjs [pure,sim,walk,skip,inn,flow]   (pure and sim need no browser; the rest need a headless browser: RAM >= 1500 MB free)
import { OT, STEPS, GEO, stepLine, STALL_S, INN_CARD, INN_SIGN, LESSON_TIPS, SKIP_LINE, WRONG_HIT, makeLesson, moveWords, blowKinds, liveSteps, stepCount } from '../src/opening-tutorial.js';
import { cardRows } from '../src/controls.js';
import { DEMO_IDS } from '../src/demo-slots.js';
import { STATIONS } from '../src/tavern.js';
const ALL = ['pure', 'sim', 'walk', 'skip', 'inn', 'flow'];
const HEROES = ['knight', 'pyro', 'paladin', 'pirate', 'reaper', 'warden', 'geomancer', 'berserker', 'ranger'];
const WANT = process.argv[2] ? process.argv[2].split(',') : ALL;
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log('  FAIL ' + m); } else console.log('  ok   ' + m); };
const WORDS = { kb: { up: 'UP', down: 'DOWN', move: 'ARROWS OR A D', jump: 'Z', atk: 'X', block: 'C', dodge: 'TAP A WAY TWICE, OR V', flask: 'U', pause: 'ESC', talk: 'E' },
  pad: { up: 'D-UP', down: 'D-DOWN', move: 'THE STICK OR D-PAD', jump: 'A', atk: 'X', block: 'RB', dodge: 'B', flask: 'LT', pause: 'START', talk: 'D-UP' },
  touch: { up: 'STICK UP', down: 'STICK DOWN', move: 'THE STICK', jump: 'THE JUMP BUTTON', atk: 'THE ATTACK BUTTON', block: 'DEFEND', dodge: 'TAP DEFEND', flask: 'THE FLASK BUTTON', pause: 'THE BACK BUTTON', talk: 'THE USE BUTTON' } };

if (WANT.includes('pure')) {
  console.log('pure');
  ok(STEPS.length === 12 && STEPS.map(s => s.id).join() === 'move,jump,high,attack,heavy,rise,sweep,plunge,block,dodge,flask,shrine', 'twelve steps: move, jump, higher, attack, the straw yard (heavy, rise, sweep, plunge), block, dodge, flask, shrine');
  ok(STEPS.filter(s => s.move).map(s => s.move).join() === 'heavy,rise,sweep,plunge' && STEPS.filter(s => s.move).every(s => s.gate && s.need === undefined && Array.isArray(s.taught)), 'each straw-yard step is gated, names its move, and writes a list of taught marks');
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
  ok(c.dummy === 7 && c.swornsword === 2 && c.check === 1, 'three straw men + the four straw-yard targets, two straw swordsmen, one shrine (' + JSON.stringify(c) + ')');
  ok(L.ents.filter(e => e.t === 'swornsword').every(e => e.trainer === 'drill' && e.yardPace >= 1.5), 'the swordsmen are slow trainers (never down)');
  ok(L.opening.gates.length === STEPS.filter(s => s.gate).length && L.opening.gates.length === 9, 'nine gates (attack, heavy, rise, sweep, plunge, block, dodge, flask, shrine)');
  { const yard = L.ents.filter(e => e.t === 'dummy' && e.otKind), by = Object.fromEntries(yard.map(e => [e.otKind, e]));
    ok(yard.length === 4 && ['armour', 'bird', 'rat', 'barrel'].every(k => by[k]), 'the straw yard: an armoured man, a bird, a rat, a barrel lid');
    const inSt = (e, id) => { const s = STEPS.find(q => q.id === id); return e.x >= s.x0 + 1 && e.x <= s.x1 - 1; };
    ok(inSt(by.armour, 'heavy') && inSt(by.bird, 'rise') && inSt(by.rat, 'sweep') && inSt(by.barrel, 'plunge'), 'each target stands inside its own station');
    ok(L.grid[(OT.FLOOR - 2) * L.W + GEO.bird] === T.ONEWAY && by.bird.y === OT.FLOOR - 3 && by.bird.otH <= 18, 'the bird stands on a one-way plank two rows up (above a standing swing, inside a rising cut)');
    ok(by.rat.y === OT.FLOOR - 1 && by.rat.otH <= 12 && by.barrel.y === OT.FLOOR - 1, 'the rat and the barrel lid stand on the floor, low');
    ok(g2(L, GEO.pledge[0], OT.FLOOR - 2) === T.SOLID && g2(L, GEO.pledge[0], OT.FLOOR - 3) === T.AIR && GEO.pledge[1] < GEO.lid && GEO.pledge[0] > STEPS.find(q => q.id === 'plunge').x0, 'a two-row ledge beside the barrel lid to drop from');
    ok(L.opening.props.some(p => p.k === 'pole' && p.x0 === GEO.bird) && L.opening.props.some(p => p.k === 'beam' && p.x0 === GEO.beam[0] && p.x1 === GEO.beam[1]), 'a post under the bird and a beam over the rat are drawn as props (not tiles: nothing blocks the road)');
    ok(L.W === OT.W && OT.W > GEO.inn.x1 + 2 && GEO.door > STEPS[STEPS.length - 1].gate, 'the room is as wide as OT.W and the door is past the last gate'); }
  const g = (x, y) => L.grid[y * L.W + x];
  function g2(Lv, x, y) { return Lv.grid[y * Lv.W + x]; }
  ok(L.opening.gates.every(q => { for (let y = 14; y <= OT.FLOOR - 1; y++) if (g(q.col, y) !== T.PORT) return false; for (let y = 0; y <= 13; y++) if (g(q.col, y) !== T.SOLID) return false; return true; }), 'every gate is a full-height port under stone: no jump gets over one');
  ok(g(GEO.curb, OT.FLOOR - 1) === T.SOLID && g(GEO.curb + 1, OT.FLOOR - 1) === T.AIR, 'a one-tile curb');
  ok([0, 1].every(y => g(GEO.pit[0], OT.FLOOR + y) === T.AIR) && g(GEO.pit[0], OT.FLOOR + 2) === T.SOLID && g(GEO.pit[1] + 1, OT.FLOOR) === T.SOLID, 'a ditch two rows deep with a floor in it (a jump climbs out; nothing is lost)');
  ok(g(GEO.ledge[0], OT.FLOOR - 2) === T.SOLID && g(GEO.ledge[0], OT.FLOOR - 3) === T.AIR, 'a two-row ledge (only a held jump climbs it)');
  ok(L.START.x === OT.START && Math.abs(L.START.x * 16) < 8 * 16, 'start at the west end');
  /* the prompts */
  for (const [set, k] of Object.entries(WORDS)) for (const h of HEROES) for (const s of STEPS) { const line = stepLine(s.id, k, h); const none = s.id === 'sweep' && !moveWords(h).sweep; ok(none ? line === '' : line.length > 10 && !/undefined/.test(line) && line.length <= 96, set + ' / ' + h + ' / ' + s.id + ': ' + line.length + ' letters'); }
  /* the words are the controls card's own: every hero's heavy, rising and plunge names are the names on his card (src/controls.js cardRows) */
  for (const h of HEROES) { const rows = cardRows({ hero: h }), name = n => (rows.find(r => r[0] === n) || [])[0], mv = moveWords(h);
    const heavyRow = ['heavy cut', 'fault line', 'double chop', 'draw', 'heavy blow'].find(n => name(n)), riseRow = ['rising shot', 'rising cut'].find(n => name(n)), plungeRow = rows[4][0];
    ok(heavyRow && mv.heavy.name.toLowerCase() === heavyRow, h + ': heavy move is the card row (' + mv.heavy.name + ' / ' + heavyRow + ')');
    ok(riseRow && mv.rise.name.toLowerCase() === riseRow, h + ': rising move is the card row (' + mv.rise.name + ' / ' + riseRow + ')');
    ok(mv.plunge.name.toLowerCase() === plungeRow, h + ': plunge move is the card row (' + mv.plunge.name + ' / ' + plungeRow + ')');
    ok(h === 'ranger' ? mv.sweep === null : !!mv.sweep, h + ': ' + (h === 'ranger' ? 'no low sweep to teach (skips the rat)' : 'has the low sweep'));
    ok(stepCount(h) === STEPS.length - (h === 'ranger' ? 1 : 0), h + ': the panel counts ' + stepCount(h) + ' steps'); }
  ok(JSON.stringify(blowKinds('heavy')) === '["heavy"]' && JSON.stringify(blowKinds(['rise', 'shot'])) === '["rise"]' && JSON.stringify(blowKinds('plunge', false)) === '["plunge"]' && JSON.stringify(blowKinds('light', true)) === '["plunge"]' && blowKinds('light').length === 0 && JSON.stringify(blowKinds('sweep')) === '["sweep"]', 'blowKinds reads the blow tag (a list for a shot, and the plunge flag)');
  ok(WORDS.kb.jump !== WORDS.kb.atk, 'jump and attack are named differently');
  ok(/FAULT LINE: HOLD X, LET GO/.test(stepLine('heavy', WORDS.kb, 'geomancer')) && /DOUBLE CHOP: HOLD X\./.test(stepLine('heavy', WORDS.kb, 'berserker')) && /HEAVY CUT: HOLD X\./.test(stepLine('heavy', WORDS.kb, 'knight')) && /DRAW: HOLD X, LET GO/.test(stepLine('heavy', WORDS.kb, 'ranger')), 'heavy prompts use each hero own names and inputs');
  ok(/RISING SHOT: UP \+ X/.test(stepLine('rise', WORDS.kb, 'ranger')) && /RISING CUT: STICK UP \+ THE ATTACK BUTTON/.test(stepLine('rise', WORDS.touch, 'knight')) && /DOWN SHOT: JUMP, THEN DOWN \+ X/.test(stepLine('plunge', WORDS.kb, 'ranger')) && /DAWN HAMMER/.test(stepLine('plunge', WORDS.kb, 'paladin')), 'rising and plunge prompts use each hero own names, keyboard, pad and touch words');
  ok(/HOLD Z|HOLD THE JUMP/.test(stepLine('high', WORDS.kb) + stepLine('high', WORDS.touch)), 'the held jump is taught');
  ok(INN_CARD.body.length <= 110 && INN_SIGN === "THE CROSSROADS INN", 'the inn card and sign');
  ok(LESSON_TIPS.length === 3, 'three loading tips');
  const lesson = STATIONS.find(s => s.id === 'lesson'); ok(lesson && lesson.verb === 'TUTORIAL' && !STATIONS.some(s => s !== lesson && Math.abs(s.x - lesson.x) < 3), 'the inn has a TUTORIAL BOARD station, three tiles clear of any other');
  const { TIPS } = await import('../src/loading-screen.js'); ok(LESSON_TIPS.every(t => TIPS.includes('TIP: ' + t)), 'the loading screen carries the three tips');
}

if (WANT.includes('sim')) {
  console.log('sim');
  const noop = new Proxy({}, { get: () => () => {}, set: () => true });
  const mk = hero => {
    const log = { taught: [], opened: [], said: [], text: [] }; let t = 0;
    const P = { x: 4 * 16, y: OT.FLOOR * 16, dead: false, ground: true, vy: 0, dodge: 0, drinkT: 0, heavySwing: false, heavy: false };
    const L = { opening: { steps: STEPS, gates: STEPS.filter(s => s.gate).map(s => ({ id: s.id, col: s.gate })), door: GEO.door, floor: OT.FLOOR } };
    const api = { L: () => L, P: () => P, hero: () => hero, enemies: () => [], guarding: () => false, time: () => t, TS: 16, shrines: () => [], words: () => WORDS.kb, openGate: c => log.opened.push(c), sfx() {}, say: m => log.said.push(m),
      taught: k => log.taught.push(...[].concat(k)), hint() {}, hurtMe() {}, save() {}, leave() {}, text: (s, ...r) => log.text.push(s), wrap: s => [s], board() {}, VW: 320, VH: 180 };
    const O = makeLesson(api); O.reset();
    const at = col => { P.x = col * 16 + 8; }, step = (n = 1) => { for (let i = 0; i < n; i++) { t += 1 / 60; O.tick(1 / 60); } };
    /* the lesson up to and including ATTACK, the way a hero does it: walk, a jump, the ledge, three blows (the third a heavy one) */
    const toYard = () => { at(15); step(2); P.ground = false; P.vy = -200; at(20); step(2); P.ground = true; P.vy = 0; at(28); step(2); at(37); step(2); at(45); P.heavySwing = true; O.dummyHit(P, 'light', false); P.heavySwing = false; O.dummyHit(P, 'light', false); O.dummyHit(P, 'light', false); step(2); };
    return { O, P, log, at, step, toYard, t: () => t };
  };
  for (const hero of HEROES) {
    const S = mk(hero); S.toYard();
    ok(S.O.st.done.attack === 'ok' && S.O.st.i === 4 && S.log.taught.includes('third'), hero + ': move..attack done in order (st.i ' + S.O.st.i + ')');
    const yard = ['heavy', 'rise', 'sweep', 'plunge'].filter(m => moveWords(hero)[m]);
    const home = { heavy: 55, rise: 67, sweep: 79, plunge: 94 }, blow = { heavy: ['heavy', false], rise: [['rise', 'shot'], false], sweep: ['sweep', false], plunge: ['plunge', true] };
    for (const m of yard) {
      const stp = STEPS.find(q => q.id === m); S.at(home[m]); S.step(2);
      ok(S.O.st.i === STEPS.indexOf(stp), hero + ': standing in the ' + m + ' station the lesson is on that step (' + S.O.st.i + ')');
      const wrongKind = m === 'heavy' ? 'light' : 'heavy'; S.step(80); S.log.said.length = 0; S.O.dummyHit(S.P, wrongKind, false); S.step(2);
      ok(!S.O.st.done[m] && S.log.said.includes(WRONG_HIT[m]), hero + ': a wrong blow does not pass the ' + m + ' step and says ' + WRONG_HIT[m]);
      S.O.dummyHit(S.P, blow[m][0], blow[m][1]); S.step(2);
      ok(S.O.st.done[m] === 'ok' && S.log.opened.includes(stp.gate) && stp.taught.every(k => S.log.taught.includes(k)), hero + ': the ' + m + ' blow passes it, lifts gate ' + stp.gate + ' and writes ' + stp.taught.join('+'));
    }
    if (hero === 'ranger') ok(S.O.st.done.sweep === 'skip' && S.log.opened.includes(87) && !S.log.taught.includes('sweep'), 'ranger: the sweep station opened by itself at the start and taught nothing');
    ok(S.O.st.i === 8 && stepCount(hero) === liveSteps(hero).length, hero + ': the straw yard done, on to BLOCK (st.i ' + S.O.st.i + ')');
    S.log.text.length = 0; S.O.drawStep(noop, 320, 180);
    const cnt = S.log.text.find(x => / OF /.test(x)); ok(cnt === (liveSteps(hero).indexOf(STEPS[8]) + 1) + ' OF ' + liveSteps(hero).length + '  BLOCK', hero + ': the panel counts only his steps (' + cnt + ')');
  }
  { /* the yard's own events and the credit window */
    const S = mk('paladin'); S.toYard(); S.at(55); S.step(2);
    S.at(30); S.O.event('verdict'); S.step(2); ok(!S.O.st.done.heavy, 'a held-blow event out of the station credits nothing');
    S.at(55); S.O.event('hammerfall'); S.step(2); ok(!S.O.st.done.heavy, 'the wrong verb (a plunge event in the heavy station) credits nothing');
    S.O.event('verdict'); S.step(2); ok(S.O.st.done.heavy === 'ok', 'the paladin VERDICT event credits the heavy step');
    S.at(67); S.O.event('rise'); S.step(2); ok(S.O.st.done.rise === 'ok', 'the rise event credits the rising step');
    S.at(79); S.O.event('sweep'); S.step(2); ok(S.O.st.done.sweep === 'ok', 'the sweep event credits the sweep step');
    S.at(94); S.O.event('hammerfall'); S.step(2); ok(S.O.st.done.plunge === 'ok', 'the paladin DAWNFALL event credits the plunge step');
    for (const [ev, st] of [['fault', 'heavy'], ['runthrough', 'heavy'], ['pogo', 'plunge'], ['down', 'plunge'], ['spin', 'plunge']]) { const R = mk('knight'); R.toYard(); const h = { heavy: 55, plunge: 94 }[st]; for (const q of ['heavy', 'rise', 'sweep'].slice(0, st === 'plunge' ? 3 : 0)) { R.at({ heavy: 55, rise: 67, sweep: 79 }[q]); R.step(2); R.O.dummyHit(R.P, q === 'rise' ? ['rise'] : q, false); R.step(2); } R.at(h); R.step(2); R.O.event(ev); R.step(2); ok(R.O.st.done[st] === 'ok', 'the ' + ev + ' event credits the ' + st + ' step'); }
  }
  { /* the stall gate still opens after STALL_S with no headway, and teaches nothing */
    const T = mk('knight'); T.toYard(); T.at(55); T.step(2); T.O.st.inStep = STALL_S - 0.1; T.log.taught.length = 0; T.step(12);
    ok(T.O.st.done.heavy === 'stall' && T.log.opened.includes(63) && !T.log.taught.includes('heavy') && T.O.st.stats.stalls === 1, STALL_S + ' s with no headway opens the heavy gate by itself and teaches nothing (' + T.O.st.done.heavy + ')');
  }
  { /* a replay: reset clears the credits (the inn board replays the lesson) */
    const S = mk('knight'); S.toYard(); S.at(55); S.step(2); S.O.dummyHit(S.P, 'heavy', false); S.O.reset();
    ok(!S.O.st.got.heavy && S.O.st.i === 0 && Object.keys(S.O.st.done).length === 0, 'reset clears the straw-yard credits and the steps done');
  }
}

if (WANT.some(w => ['walk', 'skip', 'inn', 'flow'].includes(w))) {
  const { openPage } = await import('./cdp.mjs');
  const pg = await openPage({ audio: false, fonts: false, seed: 11 }); const E = e => pg.evalp(e); const sleep = ms => new Promise(r => setTimeout(r, ms));
  try {
    await E(`(async()=>{const {LEVELS,T}=await import('/src/level.js');window.__LV=LEVELS;window.__T=T;window.__IDX=LEVELS.findIndex(l=>l.id==='lesson');window.__TAV=LEVELS.findIndex(l=>l.id==='tavern');
      window.__go=(h)=>{BK.manualSimulation=true;for(const k in BK.keys)BK.keys[k]=false;BK.setHero(h);BK.reset({fresh:true});BK.applyUpgrades();BK.load(__IDX);BK.start();BK.lesson().O.reset();BK.god=false;BK.sim(30);};
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
        /* THE STRAW YARD (claude/tutorial2; written without a browser, owed a run): each target is struck with its own verb, from its own station. A hero with no such move is skipped by the lesson */
        await E(`__stand(53,1);BK.sim(10)`);
        for (const m of ['heavy', 'rise', 'sweep', 'plunge']) { const s0 = STEPS.find(q => q.id === m), mv = (await E(`JSON.stringify(${JSON.stringify(moveWords(hero))})`)); if (!moveWords(hero)[m]) { ok(await E(`__gateOpen(${s0.gate})`), hero + ': ' + m + ' has no move for him: its gate is already up'); continue; }
          const x = { heavy: GEO.armour - 2, rise: GEO.bird - 1, sweep: GEO.rat - 1, plunge: GEO.lid - 1 }[m];
          await E(`__stand(${x},1);BK.sim(12)`);
          for (let n = 0; n < 6 && !(await E(`!!__O().st.done.${m}`)); n++) {
            if (m === 'heavy') await E(`(()=>{BK.keys.atk=true;BK.sim(60);BK.keys.atk=false;BK.sim(40);})()`);
            else if (m === 'rise') await E(`(()=>{BK.keys.up=true;BK.press('atk');BK.sim(20);BK.keys.up=false;BK.sim(30);})()`);
            else if (m === 'sweep') await E(`(()=>{BK.keys.down=true;BK.press('atk');BK.sim(20);BK.keys.down=false;BK.sim(30);})()`);
            else await E(`(()=>{const p=__p();p.x=${GEO.lid}*16+8-6;BK.press('jump');BK.sim(18);BK.keys.down=true;BK.press('atk');BK.sim(40);BK.keys.down=false;BK.sim(30);})()`); }
          ok(await E(`__O().st.done.${m}==='ok'`), hero + ': the ' + m + ' target is passed by its own blow'); ok(await E(`__gateOpen(${s0.gate})`), hero + ': the ' + m + ' gate lifted'); }
        await E(`__stand(103,1);BK.sim(60)`);   /* (batch150) 60 not 180: the swing used to land in the wait and knock a light hero out of the block station, where the foe (leashed to it) stopped coming */
        let blocked = false; for (let n = 0; n < 400 && !blocked; n++) { await E(`(()=>{const K=BK.keys,p=__p(),f=BK.enemies().filter(e=>e.t==='swornsword'&&e.x>p.x-40).sort((a,b)=>a.x-b.x)[0];K.block=!!(f&&Math.abs(f.x-p.x)<64&&(f.mode==='cutTell'||f.mode==='cut'));K.right=!!((f&&f.x-p.x>34&&p.x/16<113)||p.x/16<102.8);BK.sim(8);K.right=false;})()`); blocked = await E(`__O().st.done.block!==undefined`); if (process.env.DBG && n % 40 === 0) console.log(n, JSON.stringify(await E(`(()=>{const p=__p(),f=BK.enemies().filter(e=>e.t==='swornsword')[0];return {px:+(p.x/16).toFixed(1),fx:+(f.x/16).toFixed(1),fm:f.mode,st:Math.round(p.st),ev:__O().st.ev,i:__O().st.i,ph:p.hurt,inv:p.inv}})()`))); }
        if (process.env.DBG) console.log(JSON.stringify(await E(`(()=>{const p=__p();return {state:BK.state,px:p.x/16,st:p.st,hp:p.hp,blk:p.block,foes:BK.enemies().filter(e=>e.t==='swornsword').map(e=>({x:e.x/16,m:e.mode,cd:e.cd}))}})()`)));
        await E(`BK.keys.block=false`); ok(blocked, hero + ': BLOCK done by holding the guard as he swings (' + (await E(`__O().st.ev.blocked`)) + ' turned)');
        ok(await E(`__gateOpen(114)`), hero + ': the block gate lifted');
        /* dodge: roll through his swing */
        await E(`__stand(116,1);BK.sim(120)`);
        let dodged = false; for (let n = 0; n < 700 && !dodged; n++) { await E(`(()=>{const p=__p(),f=BK.enemies().filter(e=>e.t==='swornsword'&&e.x>116*16).sort((a,b)=>a.x-b.x)[0];if(f&&Math.abs(f.x-p.x)<70&&(f.mode==='cutTell'&&f.modeT<0.3||f.mode==='cut')){BK.keys.right=true;BK.press('dodge');BK.sim(2);BK.keys.right=false;}else if(f&&f.x-p.x>44){BK.keys.right=true;}BK.sim(3);BK.keys.right=false;})()`); dodged = await E(`__O().st.done.dodge!==undefined`); if (process.env.DBG && n % 1 === 0 && process.env.DBG === '2') console.log(n, JSON.stringify(await E(`(()=>{const p=__p(),f=BK.enemies().filter(e=>e.t==='swornsword'&&e.x>116*16).sort((a,b)=>a.x-b.x)[0];return {px:+(p.x/16).toFixed(1),dg:p.dodge,fx:f&&+(f.x/16).toFixed(1),fm:f&&f.mode,mt:f&&+f.modeT.toFixed(2),ev:__O().st.ev}})()`))); }
        const dd = await E(`({dodged:__O().st.ev.dodged,blocked:__O().st.ev.blocked,stall:__O().st.stats.stalls})`);
        ok(dodged, hero + ': DODGE done (' + JSON.stringify(dd) + ')');
        ok(await E(`__gateOpen(127)`), hero + ': the dodge gate lifted');
        /* flask: the road bites you, you drink */
        await E(`__stand(130,1);BK.sim(80)`); const hp0 = await E(`BK.lesson().hp()`); ok(hp0.hp < hp0.max && hp0.flasks >= 1, hero + ': the flask step hurts you to 45% and gives a flask (' + hp0.hp + '/' + hp0.max + ', ' + hp0.flasks + ' flask)');
        if (process.env.DBG) console.log('flask pre', JSON.stringify(await E(`(()=>{const p=__p();return {hp:p.hp,fl:p.flasks,drinkT:p.drinkT,hurt:p.hurt,dodge:p.dodge,ground:p.ground,carry:!!p.carry,ptC:!!p.ptC,inv:p.inv,st:BK.state,px:p.x/16,foes:BK.enemies().filter(e=>e.alive!==false).map(e=>[e.t,Math.round(e.x/16),e.mode])}})()`)));
        await E(`(()=>{BK.press('flask');BK.sim(150);})()`);
        if (process.env.DBG) console.log('flask post', JSON.stringify(await E(`(()=>{const p=__p();return {hp:p.hp,fl:p.flasks,drinkT:p.drinkT,drunk:p.drunk,hurt:p.hurt}})()`))); const hp1 = await E(`BK.lesson().hp()`); st = await E(`({done:Object.keys(__O().st.done)})`);
        ok(hp1.hp > hp0.hp && st.done.includes('flask'), hero + ': FLASK done by drinking (' + hp0.hp + ' -> ' + hp1.hp + ')');
        ok(await E(`__gateOpen(139)`), hero + ': the flask gate lifted');
        /* shrine */
        await E(`__walk(144.4,600)`); await E(`BK.sim(30)`); st = await E(`({done:Object.keys(__O().st.done),i:__O().st.i})`);
        ok(st.done.includes('shrine') && st.i === STEPS.length, hero + ': SHRINE done by lighting it; all ' + STEPS.length + ' steps done');
        ok(await E(`__gateOpen(150)`), hero + ': the last gate lifted');
        const pr = await E(`BK.lesson().PROG().taught||{}`); ok((pr.third === 1 || ['ranger', 'berserker', 'geomancer'].includes(hero)) && pr.block === 1 && pr.dodge === 1 && pr.flask === 1 && pr.shrine === 1 && pr.jump === 1, hero + ': PROG.taught carries third, jump, block, dodge, flask, shrine (' + JSON.stringify(pr) + ')');
        /* the door */
        await E(`__stand(${GEO.door - 1},1);BK.sim(10)`); const nd = await E(`__O().st.nearDoor`); ok(nd, hero + ': near the inn door the prompt is up');
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
      const sv = await E(`(()=>{const o={};for(const k of Object.keys(localStorage))if(/^bracken\\.progress/.test(k)){try{const j=JSON.parse(localStorage.getItem(k));if(j&&(j.lesson||j.innTold))o[k]={lesson:j.lesson,innTold:j.innTold};}catch{}}return o;})()`);
      ok(Object.values(sv).some(v => v.lesson === 2 && v.innTold === 1), 'the save carries PROG.lesson and PROG.innTold (' + JSON.stringify(sv) + ')');
      /* the stall rule: a gate opens by itself and teaches nothing */
      await E(`__go('knight')`); await E(`__walk(38.5,1500)`);
      const stall = await E(`(()=>{const O=__O();BK.lesson().PROG().taught={};O.st.i=3;O.st.inStep=${STALL_S - 0.2};__stand(45,1);BK.sim(40);return {i:O.st.i,stalls:O.st.stats.stalls,third:(BK.lesson().PROG().taught||{}).third||0,done:O.st.done.attack};})()`);
      ok(stall.done === 'stall' && stall.stalls === 1 && stall.third === 0, 'forty seconds with no headway opens the gate and teaches nothing (' + JSON.stringify(stall) + ')');
    }
    if (WANT.includes('inn')) {
      console.log('inn');
      await E(`(()=>{BK.manualSimulation=true;BK.setHero('knight');BK.reset({fresh:true});BK.lesson().PROG().innTold=0;BK.lesson().O.st.card=null;})()`);
      await E(`BK.lesson().O.innCard(9)`); const c0 = await E(`!!BK.lesson().O.st.card`); ok(c0, 'the inn card can be raised');
      await E(`(()=>{BK.load(__TAV);BK.start();BK.sim(5);})()`);
      const stn = await E(`(()=>{const T=BK.tavern;return T?T.debug().stations.map(s=>s.id):null;})()`); ok(stn && stn.includes('lesson'), 'the tavern lists the lesson station (' + stn + ')');
      /* use the station: it leads into the lesson and the way back is the inn */
      await E(`(()=>{const p=__p();p.x=55*16+8;p.y=20*16-0.01;p.vy=0;p.ground=true;BK.sim(5);})()`);
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
