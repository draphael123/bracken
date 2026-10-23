// tools/ai-companion.mjs - AI COMPANIONS, THE CORE (claude/aicompanions; scratch brief-aicompanions.md '!! 10-14 LATE', brief-coopprogress.md 10-19: the tavern
// PARTY BOARD's AI PARTNER seat). src/ai-companion.js is the pure half; main.js allyTick the hands (the lab's duel hands + the playtest walker).
//   pure    the four behaviours (BALANCED default; numbers differ measurably), the LIGHTER scaling (a human partner keeps x2; one AI 1.5; never past 2), who an
//           AI follows (never another AI while a person stands; the party leader is never an AI while a person stands), who it lifts first (SUPPORT: P1),
//           the catch-up reasons (far / stuck / wait after a fall / alone on a raft; never a downed, dead, held or thrown body), the stuck clock, the words
//   board   in the tavern: the PARTY BOARD's AI PARTNER is live: LINKED (another of this browser's saves; P1's own refused) or DEFAULT, a hero, a behaviour;
//           the seat's row says 'AI PARTNER - <HERO> LV n, <BEH>: EARNS XP INTO SAVE n'; the slot is locked (the save picker refuses it); DISMISS frees it
//   save    a LINKED companion earns XP + levels into ITS save only (xpOnly): its silver goes to player one's purse, clears never written to it; P1's
//           save never takes its XP; a repeat credit pays nothing; a DEFAULT companion writes nothing anywhere
//   follow  THE LUMBER TRAIL (act I) start to the boss door: player one walks the route (the playtest walker; a lift past what it cannot do), the AI follows
//           on its own legs and the told catch-up: it ends beside him, is near him most of the walk, never apart long, no page error
//   raft    THE MARSH: an AI on the dock when player one rides the raft ends on the far side with him; an AI alone on a docked raft is taken off it (told)
//           and the raft is never stranded (player one can board it)
//   fight   OLD TUSKER's clearing: the AI goes in with him, fights (damage dealt), stays in the arena, is never left down (up again, or lifted); a downed
//           player one is lifted by the AI
//   rates   (opt-in: --rates[=N]) knight + AI warden vs knight alone on OLD TUSKER, the boss lab's human profile at campaign level, N seeds each (default 6)
// node tools/ai-companion.mjs [pure,board,save,follow,raft,fight,rates]   (PORT from the environment)
import { openLevelPage } from './boss-level.mjs';
import { campaignLevel, levelJs } from './boss-level.mjs';
import { LEVELS } from '../src/level.js';
import { routeOf } from './level-walk.mjs';
import * as AIC from '../src/ai-companion.js';
import { LEASH } from '../src/party.js';
import { leaderOf } from '../src/party.js';

const ALL = ['pure', 'board', 'save', 'follow', 'raft', 'fight', 'chain', 'linked', 'pausebd', 'reload'];
const argv = process.argv.slice(2), ratesArg = argv.find(a => /^--rates/.test(a));
const WANT = argv.find(a => !a.startsWith('--')) ? argv.find(a => !a.startsWith('--')).split(',') : ALL.concat(ratesArg ? ['rates'] : []);
const NRATE = ratesArg && /=\d+/.test(ratesArg) ? +ratesArg.split('=')[1] : 6;
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log('  FAIL ' + m); } else console.log('  ok   ' + m); };

if (WANT.includes('pure')) {
  console.log('pure');
  ok(AIC.BEH_ORDER[0] === 'balanced' && AIC.BEH_ORDER.length === 4 && AIC.BEH_ORDER.every(b => AIC.BEH[b] && AIC.BEH_NAME[b] && AIC.BEH_LINE[b]), 'four behaviours, BALANCED first, each named and explained');
  const B = AIC.BEH;
  ok(B.aggressive.engage > B.balanced.engage && B.balanced.engage > B.defensive.engage && B.aggressive.stray > B.defensive.stray && B.defensive.back > B.balanced.back && B.support.back < B.balanced.back, 'the behaviours differ measurably: AGGRESSIVE reaches and strays furthest, DEFENSIVE hangs back, SUPPORT sticks closest');
  ok(B.defensive.flask > B.balanced.flask && B.balanced.flask > B.aggressive.flask && B.defensive.guard > 0 && B.support.guard > 0 && B.aggressive.guard === 0 && B.support.near > 0, '...drinks earlier when careful, a hurt DEFENSIVE / SUPPORT only defends, SUPPORT fights only what is on you');
  ok(AIC.cleanCfg({ beh: 'nope' }).beh === 'balanced' && AIC.cleanCfg(null).beh === 'balanced' && AIC.cleanCfg({ beh: 'support', linked: 1 }).linked === true, 'a missing or unknown behaviour is BALANCED');
  ok(AIC.coopMulOf([{}]) === 1 && AIC.coopMulOf([{}, {}]) === 2 && AIC.coopMulOf([{}, {}, {}, {}]) === 2, 'scaling: solo x1, any HUMAN partner the old x2 (any number of seats)');
  ok(AIC.coopMulOf([{}, { ai: true }]) === 1.5 && AIC.coopMulOf([{}, { ai: true }, { ai: true }]) === 2 && AIC.coopMulOf([{}, { ai: true }, { ai: true }, { ai: true }]) === 2 && AIC.coopMulOf([{}, { ai: true }, {}]) === 2, 'scaling: an AI is LIGHTER - one AI x1.5, never past x2; a human in the party keeps x2');
  const p1 = { x: 100, y: 0 }, p2 = { x: 300, y: 0 }, a = { x: 120, y: 0, ai: true }, a2 = { x: 500, y: 0, ai: true };
  ok(AIC.leadOf([p1, a, p2], a) === p1 && AIC.leadOf([{ ...p1, down: 3 }, a, p2], a) === p2 && AIC.leadOf([{ ...p1, down: 3 }, a, a2], a) !== a2, 'an AI follows P1; P1 down, the nearest standing person; never another AI');
  ok(leaderOf([p1, { x: 900, ai: true }]) === 0 && leaderOf([p1, { x: 900 }]) === 1 && leaderOf([{ ...p1, down: 2 }, { x: 900, ai: true }]) === 1, 'the party leader is never an AI while a person stands (the leash pulls a bot to a person)');
  ok(AIC.reviveTarget([{ ...p1, down: 5 }, a, { ...p2, down: 5 }], a, { beh: 'support' }).x === 100 && AIC.reviveTarget([{ ...p1, x: 10, down: 5 }, { ...a, x: 290 }, { ...p2, down: 5 }], { ...a, x: 290 }, { beh: 'balanced' }).x === 300, 'SUPPORT lifts P1 first; the others the nearest downed person');
  ok(AIC.reviveTarget([p1, a, { ...a2, down: 4 }], a, { beh: 'balanced' }) && !AIC.reviveTarget([p1, a, { ...a2, down: 4 }], a, { beh: 'aggressive' }) && !AIC.reviveTarget([p1, a], a, {}), 'a downed AI partner is lifted (not by AGGRESSIVE); nobody down, nothing');
  const L0 = { x: 0, y: 0 };
  ok(AIC.catchWhy({ x: AIC.CATCH.far + 10, y: 0 }, L0, null) === 'far' && AIC.catchWhy({ x: 10, y: AIC.CATCH.farY + 5 }, L0, null) === 'far' && AIC.catchWhy({ x: 100, y: 0 }, L0, { stuckT: AIC.CATCH.stuck }) === 'stuck' && AIC.catchWhy({ x: 100, y: 0 }, L0, { wait: true }) === 'wait' && AIC.catchWhy({ x: 5, y: 0 }, L0, { raft: true }) === 'raft' && AIC.catchWhy({ x: 50, y: 0 }, L0, { stuckT: 0 }) === '', 'catch-up: far, stuck, waiting after a fall, alone on a raft; near and moving, nothing');
  for (const k of ['dead', 'down', 'held', 'flying']) ok(AIC.catchWhy({ x: 900, y: 0, [k]: 3 }, L0, { raft: true }) === '', 'catch-up: never a ' + k + ' AI');
  let s = { best: 1e9, stuckT: 0 }; for (let i = 0; i < 200; i++) s = AIC.stuckStep(s, 200, 1 / 60, false); ok(s.stuckT > AIC.CATCH.stuck, 'the stuck clock runs while it does not close on him (' + s.stuckT.toFixed(1) + ' s)');
  s = { best: 1e9, stuckT: 0 }; for (let i = 0; i < 200; i++) s = AIC.stuckStep(s, 300 - i, 1 / 60, false); ok(s.stuckT < 0.5, '...not while it closes the gap');
  ok(AIC.stuckStep({ best: 300, stuckT: 9 }, 300, 1 / 60, true).stuckT === 0 && AIC.stuckStep({ best: 300, stuckT: 9 }, 40, 1 / 60, false).stuckT === 0, '...a fight or a revive, or being near him, resets it');
  ok(AIC.seatLine('KNIGHT', 6, 1, 'balanced') === 'AI PARTNER - KNIGHT LV 6, BALANCED: EARNS XP INTO SAVE 2' && AIC.seatLine('PYRO', null, -1, 'support') === 'AI PARTNER - PYRO, SUPPORT: YOUR LEVEL - NOTHING SAVED', 'the seat line says where what it earns goes');
  ok(AIC.linkedLine(2, { state: 'ok', hero: 'pyro', level: 6 }) === 'SAVE 3 - PYRO LV 6: EARNS XP INTO SAVE 3' && /EMPTY/.test(AIC.linkedLine(0, { state: 'empty' })) && /DAMAGED/.test(AIC.linkedLine(0, { state: 'corrupt' })) && /YOUR OWN/.test(AIC.linkedLine(0, { state: 'ok', hero: 'knight', level: 1 }, undefined, 'YOUR OWN SAVE')), 'the AI picker lines: a save, an empty one, a damaged one, a held one');
  ok(AIC.savedCell(1) === 'SAVE 2' && AIC.savedCell(-1) === 'AI', 'the win card cell: SAVE n for a linked AI, AI for a default one');
}

const PAGE = WANT.filter(w => w !== 'pure');
if (PAGE.length) {
  const pg = await openLevelPage({ audio: false, fonts: false });
  const E = (x, t = 600000) => pg.evalp(x, t);
  try {
    await E(`(()=>{
      window.__keys=()=>{for(const k in BK.keys)BK.keys[k]=false;};
      window.__fresh=async()=>{__keys();BK.manualSimulation=true;BK.SET.speed=1;BK.coopEnd();BK.reset({fresh:true});await BK.allyReady();return BK.state;};
      window.__P=n=>BK.players()[n-1];
      window.__ai=()=>BK.players().find(p=>p.ai);
      window.__inn=async()=>{await __fresh();BK.tavern.record(null);BK.tavern.p1Pad(null);await BK.tavern.enter();BK.sim(10);return BK.state;};
      window.__level=async(id,seats)=>{await __fresh();if(seats)BK.aiComp.arm(seats.map(s=>s[0]),seats.map(s=>s[1]),seats.length);const {LEVELS}=await import('/src/level.js');BK.load(LEVELS.findIndex(l=>l.id===id));BK.start();BK.sim(5);return BK.players().length;};
      window.__board=()=>document.getElementById('olparty');
      window.__click=pred=>{const b=[...__board().querySelectorAll('button')].find(pred);if(!b)return false;b.click();return true;};
      return true;})()`);
    const STN = (await import('../src/tavern.js')).STATIONS;
    const at = x => `{const p=__P(1);p.x=${x}*16+8;p.y=20*16;p.vx=p.vy=0;p.face=1;for(let i=0;i<40;i++){p.x=${x}*16+8;BK.sim(1);}}`;

    if (PAGE.includes('board') || PAGE.includes('save')) {
      console.log('board');
      await E('__inn()');
      const seed = await E(`(async()=>{const {migrateProgress}=await import('/src/progression.js');const {xpFloor}=await import('/src/xp.js');
        const p=migrateProgress(JSON.stringify({hero:'pyro',heroes:{knight:true,pyro:true},coins:333,xp:{pyro:xpFloor(6)},perHero:1,xpVersion:1,sentinel:'slot3'}),[]).progress;localStorage.setItem('bracken.progress.2',JSON.stringify(p));
        return {p1:BK.slot,raw:localStorage.getItem('bracken.progress.2'),hostCoins:BK.PROG.coins||0,hostRaw:localStorage.getItem('bracken.progress.'+BK.slot)};})()`);
      ok(seed.p1 !== 2, 'player one plays save ' + (seed.p1 + 1) + '; save 3 holds a PYRO LV 6');
      const pick = await E(`(async()=>{${at(STN[1].x)}BK.press('talk');BK.sim(1);await new Promise(r=>setTimeout(r,100));const o={};
        o.seats=BK.aiComp.board();o.aiBtn=o.seats.buttons.filter(b=>b.act==='ai');
        __click(b=>b.dataset.act==='ai');o.kind=BK.aiComp.board();
        __click(b=>b.dataset.act==='ailinked'&&b.dataset.slot==='2');o.hero=BK.aiComp.board();
        __click(b=>b.dataset.hero==='pyro');o.beh=BK.aiComp.board();
        __click(b=>b.dataset.beh==='support');o.after=BK.aiComp.board();o.n=BK.players().length;o.ai=BK.aiComp.seats();o.holder=BK.coopSave.holder(2);
        return o;})()`);
      ok(pick.aiBtn.length === 3 && pick.aiBtn.every(b => !b.dis && b.t === 'AI PARTNER'), 'every empty seat offers AI PARTNER, live (was COMING SOON): ' + JSON.stringify(pick.aiBtn.map(b => b.t)));
      const kb = pick.kind.buttons;
      ok(pick.kind.view === 'aikind' && kb.some(b => b.act === 'ailinked' && b.slot === '2' && !b.dis && /SAVE 3 - PYRO LV 6: EARNS XP INTO SAVE 3/.test(b.t)) && kb.some(b => b.act === 'ailinked' && b.slot === String(seed.p1) && b.dis && /YOUR OWN SAVE/.test(b.t)) && kb.some(b => b.act === 'aidefault' && /NOTHING IS SAVED/.test(b.t)), 'the AI picker: LINKED saves (P1\'s own refused, told) and DEFAULT: ' + kb.map(b => b.t).join(' | ').slice(0, 300));
      ok(pick.hero.view === 'aihero' && pick.hero.buttons.some(b => b.hero === 'pyro') && pick.hero.buttons.some(b => b.hero === 'knight') && /SAVE 3/.test(pick.hero.text), 'a linked pick offers that save\'s heroes and says its XP goes back to it');
      ok(pick.beh.view === 'aibeh' && ['balanced', 'aggressive', 'defensive', 'support'].every(b => pick.beh.buttons.some(x => x.beh === b)) && pick.beh.buttons.findIndex(x => x.beh) === pick.beh.buttons.findIndex(x => x.beh === 'balanced'), 'then HOW IT PLAYS: the four behaviours, BALANCED first');
      const ai = pick.ai[0] || {};
      ok(pick.n === 2 && ai.hero === 'pyro' && ai.beh === 'support' && ai.linked && ai.slot === 2 && ai.lv === 6, 'seated: P2 is an AI PYRO LV 6 from save 3, SUPPORT: ' + JSON.stringify(ai));
      ok(pick.after.view === 'seats' && /AI PARTNER - PYRO LV 6, SUPPORT: EARNS XP INTO SAVE 3/.test(pick.after.text) && pick.after.buttons.some(b => b.act === 'dismiss'), 'its row says so (and offers DISMISS): ' + pick.after.text.replace(/\s+/g, ' ').slice(0, 220));
      ok(pick.holder && pick.holder.kind === 'companion', 'save 3 is locked while the AI plays it (the save picker refuses it): ' + JSON.stringify(pick.holder));
      const twice = await E(`(()=>{const r=BK.aiComp.join(2,'knight','balanced');return r;})()`);
      ok(!twice.ok && /ALREADY PLAYING HERE/.test(twice.why || ''), 'the same save cannot seat a second AI (one character, one place): ' + twice.why);
      const def = await E(`(async()=>{const o={};__click(b=>b.dataset.act==='ai');__click(b=>b.dataset.act==='aidefault');o.h=BK.aiComp.board().buttons.filter(b=>b.hero).map(b=>b.hero);__click(b=>b.dataset.hero==='knight');__click(b=>b.dataset.beh==='balanced');o.after=BK.aiComp.board();o.ai=BK.aiComp.seats();o.mul=BK.aiComp.mul();return o;})()`);
      ok(def.ai.length === 2 && def.ai[1].hero === 'knight' && !def.ai[1].linked && def.ai[1].beh === 'balanced' && /AI PARTNER - KNIGHT, BALANCED: YOUR LEVEL - NOTHING SAVED/.test(def.after.text), 'a DEFAULT AI KNIGHT takes P3 (two AIs in one party): ' + JSON.stringify(def.ai[1]));
      ok(def.mul === 2, 'two AIs scale the wood to x2 (each a lighter partner): ' + def.mul);
      if (PAGE.includes('save')) {
        console.log('save');
        const cr = await E(`(async()=>{const o={};const host0=JSON.parse(localStorage.getItem('bracken.progress.'+BK.slot)||'{}');o.hostXp0=(host0.xp||{}).pyro||0;const p1c=BK.PROG.coins||0;
          BK.coopSave.gain(2,120,0);BK.coopSave.gain(2,0,25);BK.sim(2);BK.coopSave.bank(2);o.p1Coins=(BK.PROG.coins||0)-p1c;o.viewCoins=BK.aiComp.seats()[0].coins;
          BK.coopSave.creditAll(false);const s3=JSON.parse(localStorage.getItem('bracken.progress.2'));o.s3xp=s3.xp.pyro;o.s3coins=s3.coins;o.s3done=Object.keys((s3.done||{}).pyro||{}).length;
          const host1=JSON.parse(localStorage.getItem('bracken.progress.'+BK.slot)||'{}');o.hostXp1=(host1.xp||{}).pyro||0;
          BK.coopSave.creditAll(false);o.s3xp2=JSON.parse(localStorage.getItem('bracken.progress.2')).xp.pyro;o.toast=JSON.stringify(BK.coopSave.seats()[1].prof.lastWrite);
          o.dis=BK.aiComp.board();__click(b=>b.dataset.act==='dismiss'&&b.dataset.seat==='2');BK.sim(2);BK.coopSave.reconcile();o.holderAfter=BK.coopSave.holder(2);o.left=BK.aiComp.seats().map(s=>s.hero);
          const def=JSON.stringify(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k).length]));o.defKeys=def;return o;})()`);
        const xp6 = JSON.parse(seed.raw).xp.pyro;
        ok(cr.s3xp === xp6 + 120, 'a linked AI\'s XP is written to ITS save (save 3: ' + xp6 + ' -> ' + cr.s3xp + ')');
        ok(cr.s3coins === JSON.parse(seed.raw).coins && cr.s3done === 0, '...and only XP: its silver and clears are never written to it (coins ' + cr.s3coins + ', clears ' + cr.s3done + ')');
        ok(cr.p1Coins === 25 && cr.viewCoins === JSON.parse(seed.raw).coins, 'the silver it picks up goes to player one\'s purse (+' + cr.p1Coins + '), its own purse is untouched (' + cr.viewCoins + ')');
        ok(cr.hostXp1 === cr.hostXp0, 'player one\'s save takes none of its XP');
        ok(cr.s3xp2 === cr.s3xp, 'a repeat credit pays nothing: ' + cr.toast);
        ok(cr.holderAfter === null && cr.left.length === 1 && cr.left[0] === 'knight', 'DISMISS: the AI leaves the party and save 3 is free again');
      }
    }

    if (PAGE.includes('follow')) {
      console.log('follow');
      const lv = LEVELS.find(l => l.id === 'wood'), route = routeOf(lv), Lb = lv.build(), A = Lb.arena;
      const stopX = A ? Math.floor(A.x0 / 16) - 3 : 1e9, nodes = route.filter(([x]) => x < stopX);
      for (const [beh, hero] of [['balanced', 'warden'], ['support', 'knight']]) {
        const r = await E(`(async()=>{await __level('wood',[[${JSON.stringify(hero)},${JSON.stringify(beh)}]]);const PT=await import('/src/playtest.js');const walk=PT.makeBot(BK);BK.god=true;const N=${JSON.stringify(nodes)};
          const a=__P(1),q=__ai(),o={frames:0,lifts:0,samples:0,near:0,maxApart:0,apartRun:0,ups:0,downs:0,end:null,err:''};let i=0,bestI=0,still=0,wasDown=0;
          let liftF=-999;for(let f=0;f<60*420&&i<N.length-1&&a.x<${stopX}*16;f++){
            while(i<N.length-1&&Math.abs(N[i][0]*16+8-a.x)<20&&Math.abs((N[i][1]+1)*16-a.y)<40)i++;
            if(i>bestI){bestI=i;still=0;}else if(++still>240){i=Math.min(N.length-1,i+3);BK.tp(N[i][0],N[i][1]);a.vx=a.vy=0;still=0;o.lifts++;bestI=i;liftF=f;}
            walk(N[i][0]*16+8);BK.sim(1);o.frames++;
            if(BK.state!=='play'){BK.state='play';}
            if(q.down>0&&!wasDown)o.downs++;wasDown=q.down>0;
            if(f%30===0&&f-liftF>360){o.samples++;const gap=Math.abs(q.x-a.x)/16+Math.abs(q.y-a.y)/32;if(gap<=10)o.near++;if(gap>12){o.apartRun+=0.5;o.maxApart=Math.max(o.maxApart,o.apartRun);}else o.apartRun=0;}
          }
          __keys();for(let f=0;f<60*8;f++){__keys();BK.sim(1);}
          o.end=BK.aiComp.seats()[0];o.boss=BK.bossActive;o.gapEnd=+(Math.abs(o.end.x-a.x)/16).toFixed(1);o.p1x=Math.round(a.x/16);o.reached=i>=N.length-1||a.x>=${stopX}*16;o.nodes=N.length;return o;})()`);
        const s = r.end || {};
        console.log('    ' + beh + ' ' + hero + ': ' + JSON.stringify({ secs: Math.round(r.frames / 60), lifts: r.lifts, nearPct: Math.round(100 * r.near / Math.max(1, r.samples)), maxApartS: r.maxApart, gapEnd: r.gapEnd, pulls: s.pulls, downs: r.downs, ups: s.ups, kills: s.kills, revives: s.revives, flasks: s.flasks, deaths: s.deaths }));
        ok(r.reached, beh + ' ' + hero + ': player one walked THE LUMBER TRAIL to the boss door (col ' + r.p1x + ', ' + r.lifts + ' lifts)');
        ok(r.gapEnd <= 4 && !(s.down > 0), '...and the AI ended beside him (' + r.gapEnd + ' tiles)');
        ok(r.near / Math.max(1, r.samples) >= 0.8, '...near him (10 tiles: its widest stray, AGGRESSIVE) most of the walk (lifts and the 6 s after them not counted): ' + Math.round(100 * r.near / Math.max(1, r.samples)) + '%');
        ok(r.maxApart <= 10, '...never apart (12+ tiles) longer than 10 s - the catch-up comes (longest ' + r.maxApart + ' s, ' + s.pulls + ' catch-ups)');
      }
    }

    if (PAGE.includes('raft')) {
      console.log('raft');
      const r = await E(`(async()=>{await __level('marsh',[['knight','balanced']]);BK.god=true;BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');
        const pr=BK.props().find(p=>p.raftCall==='marsh-grove'),m=BK.movers().find(m=>m.callId==='marsh-grove');const a=__P(1),q=__ai(),o={};
        BK.tp(pr.x/16-.5,pr.y/16-1);BK.sim(5);m.x=m.x0;m.moving=false;m.done=false;m.returning=false;m.called=false;m.paid=true;m.free=true;
        a.x=m.x+m.w/2;a.y=m.y;a.vx=a.vy=0;a.onMover=m;a.ground=true;q.x=m.x-30;q.y=m.y;q.vx=q.vy=0;BK.sim(2);
        let lone=0,f=0;for(;f<60*60&&!m.done;f++){BK.sim(1);if(m.moving&&!BK.players().some(p=>!p.ai&&p.onMover===m))lone++;}
        for(let k=0;k<60*6;k++)BK.sim(1);o.done=m.done;o.secs=+(f/60).toFixed(1);o.lone=lone;o.gap=+(Math.abs(q.x-a.x)/16).toFixed(1);o.aiOn=q.onMover===m;o.pulls=q.leashes||0;o.why=q.leashWhy;
        /* an AI alone on a docked raft, player one on the dock */
        await __level('marsh',[['warden','balanced']]);BK.god=true;BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');
        const m2=BK.movers().find(m=>m.callId==='marsh-grove'),pr2=BK.props().find(p=>p.raftCall==='marsh-grove'),a2=__P(1),q2=__ai();BK.tp(pr2.x/16-.5,pr2.y/16-1);BK.sim(5);
        m2.x=m2.x0;m2.moving=false;m2.done=false;m2.returning=false;m2.called=false;m2.paid=true;m2.free=true;a2.x=m2.x-40;a2.y=m2.y;a2.vx=0;a2.face=-1;
        q2.x=m2.x+m2.w/2;q2.y=m2.y;q2.vx=q2.vy=0;q2.onMover=m2;q2.ground=true;let off=-1,why='';for(let k=0;k<60*20;k++){BK.sim(1);a2.vx=0;if(q2.leashWhy==='raft')why='raft';if(off<0&&q2.onMover!==m2)off=k;}
        o.offS=+(off/60).toFixed(1);o.toldRaft=why;o.m2x=Math.round(m2.x-m2.x0);o.m2done=m2.done;o.m2ret=m2.returning;
        a2.x=m2.x+m2.w/2;a2.y=m2.y;a2.vy=0;a2.onMover=m2;a2.ground=true;BK.sim(90);o.reboard=m2.x>m2.x0+4||m2.moving;return o;})()`);
      console.log('    ' + JSON.stringify(r));
      const idle = await E(`(async()=>{await __level('marsh',[['knight','balanced']]);BK.god=true;BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');const m=BK.movers().find(m=>m.callId==='marsh-grove'),a=__P(1),q=__ai();m.x=m.x1;m.moving=false;m.done=true;m.returning=false;m.called=false;m.paid=true;m.free=true;a.x=m.x+m.w/2;a.y=m.y;a.vx=a.vy=0;a.onMover=m;a.ground=true;a.face=1;q.x=a.x-22;q.y=a.y;q.vx=q.vy=0;q.onMover=m;q.ground=true;q.aiWalk=null;q.aiS=null;let airborne=0,maxGap=0;for(let f=0;f<720;f++){BK.sim(1);if(!q.ground)airborne++;maxGap=Math.max(maxGap,Math.abs(q.x-a.x));}const x0=q.x;a.x+=40;BK.sim(180);return{airborne,maxGap,moved:q.x-x0,gap:Math.abs(q.x-a.x)};})()`);console.log('    idle raft '+JSON.stringify(idle));
      ok(idle.airborne===0 && idle.maxGap<=64, 'a companion already beside the leader waits on the settled raft without inventing jumps ('+JSON.stringify(idle)+')');
      ok(idle.moved>20 && idle.gap<=64, '...then follows when the leader moves on ('+JSON.stringify(idle)+')');
      ok(r.done && r.lone === 0, 'player one rides the marsh raft to its far dock; it never moved without a person aboard (' + r.secs + ' s)');
      ok(r.gap <= 4, '...and the AI that stood on the dock is on the far side with him (' + r.gap + ' tiles; ' + r.pulls + ' catch-ups' + (r.aiOn ? ', it rode along' : '') + ')');
      ok(r.offS >= 0 && r.offS <= 4 && r.toldRaft === 'raft', 'an AI alone on a docked raft is taken off it, told (catch-up \'raft\', off in ' + r.offS + ' s)');
      ok(!r.m2done && r.m2x <= 4 && r.reboard, '...the raft is not stranded: back at her dock (' + r.m2x + ' px off) and player one boards and rides her');
    }

    if (PAGE.includes('fight')) {
      console.log('fight');
      const r = await E(`(async()=>{await __level('wood',[['warden','aggressive']]);const A=BK.L.arena;BK.enemies().forEach(e=>{if(!e.maxHp)e.alive=false;});const b=BK.enemies().find(e=>e.t===A.boss&&e.alive);const a=__P(1),q=__ai(),o={boss:b&&b.t};
        BK.god=true;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);q.x=A.x0-60;q.y=a.y;q.vx=q.vy=0;BK.sim(30);o.startOut=true;const hp0=b.hp;let inside=0,n=0,maxDown=0,downs=0,wd=0;
        for(let f=0;f<60*40&&b.alive;f++){a.keys&&0;BK.keys.block=true;BK.sim(1);n++;if(q.x>=A.x0-8&&q.x<=A.x1+8)inside++;if(q.down>0){maxDown=Math.max(maxDown,q.down);if(!wd)downs++;}wd=q.down>0;}
        BK.keys.block=false;o.dealt=hp0-b.hp;o.inside=+(inside/n).toFixed(2);o.downs=downs;o.end=BK.aiComp.seats()[0];o.bossActive=BK.bossActive;
        /* player one goes down in the fight: the AI comes and lifts him */
        BK.god=false;b.alive=false;BK.sim(5);a.hp=a.maxHp;BK.coopDown(0);const t0=a.down;let up=-1;for(let f=0;f<60*20;f++){BK.sim(1);if(!(a.down>0)){up=f;break;}}o.p1Up=+(up/60).toFixed(1);o.p1DownT=t0;o.rev=BK.aiComp.seats()[0].revives;return o;})()`);
      console.log('    ' + JSON.stringify({ boss: r.boss, dealt: r.dealt, inside: r.inside, downs: r.downs, ai: { hp: r.end.hp, down: r.end.down, ups: r.end.ups, flasks: r.end.flasks, pulls: r.end.pulls }, p1Up: r.p1Up, revives: r.rev }));
      ok(r.boss === 'oldtusker' && r.bossActive !== false, 'OLD TUSKER\'s fight starts with the AI in it');
      ok(r.dealt > 0, '...the AI fights him with its own kit (' + r.dealt + ' damage in 40 s while player one only guards)');
      ok(r.inside >= 0.85, '...it started outside his clearing: it comes in and stays in (' + Math.round(r.inside * 100) + '% of frames inside)');
      ok(!(r.end.down > 0) || r.end.down < 19, '...it is never left lying (downs ' + r.downs + ', back up ' + r.end.ups + ')');
      ok(r.p1Up >= 0 && r.rev >= 1, 'player one goes down: the AI lifts him (' + r.p1Up + ' s)');
    }

    if (PAGE.includes('chain')) {
      /* (claude/partypersist) THE PARTY SURVIVES THE ROAD: clear -> NEXT (one button, no map) -> map -> boss select -> boss -> map -> next wood; an AI partner and a guest seat in every step */
      console.log('chain');
      const snap = `(()=>({n:BK.players().length,ai:BK.players().filter(p=>p.ai).length,heroes:BK.players().map(p=>p.hero).join(','),want:((BK.tavern.want()||{}).seats||[]).length,st:BK.state,lv:BK.tavern.levelIndex()}))()`;
      const r = await E(`(async()=>{const o={};const S=()=>${snap};const wait=async(pred,n=900)=>{for(let i=0;i<n&&!pred();i++){BK.step(1);if(i%40===0)await new Promise(r=>setTimeout(r,5));}return pred();};
        await __fresh();BK.aiComp.arm(['knight'],['balanced'],1);BK.tavern.want().seats.push({hero:'pyro',ally:false});
        const {LEVELS}=await import('/src/level.js');BK.load(LEVELS.findIndex(l=>l.id==='wood'));BK.start();BK.sim(5);await BK.allyReady();BK.sim(5);o.start=S();
        BK.god=true;BK.coopSave.win();BK.sim(4);delete BK.tavern.prog().cardNew;/* (integ112) the earlier sections leave the hero XP: a win then owes a level-up card and NEXT rightly falls back to the map; this step is about NEXT, not the card */o.won=S();o.next1=BK.tavern.next();o.nextName=o.next1>=0?LEVELS[o.next1].id:null;
        BK.press('confirm');o.arrived=await wait(()=>BK.state==='play'&&BK.tavern.levelIndex()===o.next1);BK.sim(5);await BK.allyReady();BK.sim(5);o.level2=S();
        BK.god=true;BK.coopSave.win();BK.sim(4);BK.press('pause');/* (integ112) ESC = the map, whether or not a level-up card is owed */BK.sim(3);if(BK.state==='card')BK.cardClose();BK.sim(2);o.map=S();o.roster=BK.tavern.roster().map(r=>r.tag+' '+r.hero+' '+r.lv);
        BK.bossSelect.open('map');BK.sim(3);o.bsOpen=S();
        for(let i=0;i<4&&!BK.bossSelect.rows().some(r=>r.beaten);i++)BK.sim(30);const rows=BK.bossSelect.rows();const bi=rows.findIndex(r=>r.beaten);o.beaten=bi;
        if(bi>=0){BK.bossSelect.cursor=bi;BK.bossSelect.hero='knight';o.fightOk=BK.bossSelect.start();BK.sim(5);await BK.allyReady();BK.sim(5);o.boss=S();o.xpGuard=true;BK.bossSelect.quit();BK.sim(3);o.afterQuit=S();}
        if(BK.state==='card')BK.cardClose();BK.state='map';BK.sim(2);const m=BK.mapNodes();BK.mapLook(m.ids[2]);BK.step(2);BK.press('confirm');for(let i=0;i<400&&BK.state!=='play';i++){if(BK.state==='card')BK.cardClose();BK.step(1);if(i===3&&BK.state==='map')BK.press('confirm');}BK.sim(5);await BK.allyReady();BK.sim(5);o.fromMap=S();
        return o;})()`);
      console.log('    ' + JSON.stringify(r));
      const full = x => x && x.n === 3 && x.ai === 1 && /pyro/.test(x.heroes);
      ok(full(r.start), 'the party starts the wood whole: P1, an AI KNIGHT and a PYRO guest');
      ok(r.next1 >= 0 && r.won.st === 'win', 'the win card offers NEXT for a party: ' + r.nextName);
      ok(r.arrived && full(r.level2) && r.level2.lv === r.next1, 'Z on the win card goes straight to the next wood (no map) with all three seats');
      ok(r.map.st === 'map' && r.map.want === 2 && r.roster.length === 3 && /AI/.test(r.roster[1] || ''), 'on the map (after a card where the road stops) the party is still wanted (2 seats) and the map draws its three chips: ' + JSON.stringify(r.roster));
      ok(r.bsOpen.st === 'bossselect' && r.bsOpen.want === 2, 'BOSS SELECT keeps the party (it used to wipe it)');
      ok(r.beaten >= 0 && r.fightOk && full(r.boss), 'a boss fought from BOSS SELECT brings the whole party');
      ok(r.afterQuit.want === 2 && r.afterQuit.st === 'bossselect', '...and leaving the fight finds the party again');
      ok(full(r.fromMap), 'entering a wood from the map after all that still brings all three seats');
    }

    if (PAGE.includes('linked')) {
      /* a LINKED AI keeps its save lock and its XP credit across the whole road: wood -> NEXT -> map -> BOSS SELECT (sandbox: nothing credited) -> map */
      console.log('linked');
      const r = await E(`(async()=>{const o={};await __fresh();const {migrateProgress}=await import('/src/progression.js');const {xpFloor}=await import('/src/xp.js');const {LEVELS}=await import('/src/level.js');
        const p=migrateProgress(JSON.stringify({hero:'pyro',heroes:{knight:true,pyro:true},coins:50,xp:{pyro:xpFloor(6)},perHero:1,xpVersion:1}),[]).progress;localStorage.setItem('bracken.progress.2',JSON.stringify(p));const xp0=p.xp.pyro;o.xp0=xp0;
        BK.load(LEVELS.findIndex(l=>l.id==='wood'));BK.start();BK.sim(5);o.join=BK.aiComp.join(2,'pyro','balanced');await BK.allyReady();BK.sim(5);
        const S=()=>({n:BK.players().length,linked:BK.aiComp.seats().filter(s=>s.linked).length,holder:(BK.coopSave.holder(2)||{}).kind||null,st:BK.state});o.a=S();
        BK.god=true;BK.coopSave.gain(2,40,0);BK.coopSave.win();BK.sim(4);BK.press('confirm');for(let i=0;i<600&&BK.state!=='play';i++){if(BK.state==='card')BK.cardClose();BK.step(1);}BK.sim(5);await BK.allyReady();BK.sim(5);o.b=S();
        o.xp1=JSON.parse(localStorage.getItem('bracken.progress.2')).xp.pyro;
        BK.state='map';BK.sim(2);BK.bossSelect.open('map');BK.sim(3);o.c={holder:(BK.coopSave.holder(2)||{}).kind||null,want:((BK.tavern.want()||{}).seats||[]).length};
        const bi=BK.bossSelect.rows().findIndex(r=>r.beaten);if(bi>=0){BK.bossSelect.cursor=bi;BK.bossSelect.hero='knight';BK.bossSelect.start();BK.sim(5);await BK.allyReady();BK.sim(5);BK.coopSave.gain(2,500,0);BK.coopSave.creditAll(false);o.d=S();BK.bossSelect.quit();}
        o.xp2=JSON.parse(localStorage.getItem('bracken.progress.2')).xp.pyro;o.e={holder:(BK.coopSave.holder(2)||{}).kind||null};return o;})()`);
      console.log('    ' + JSON.stringify(r));
      ok(r.join && r.join.ok && r.a.linked === 1 && r.a.holder === 'companion', 'a LINKED AI PYRO (save 3) is seated mid-wood and holds save 3');
      ok(r.b.n === 2 && r.b.linked === 1 && r.b.holder === 'companion', '...after NEXT it is in the next wood, still linked, still holding its save');
      ok(r.xp1 > r.xp0, '...and its XP was credited to save 3 on the way (' + r.xp0 + ' -> ' + r.xp1 + ')');
      ok(r.c.holder === 'companion' && r.c.want === 1, '...BOSS SELECT keeps its lock and the party');
      ok(!r.d || (r.d.n === 2 && r.d.linked === 1), '...and it fights the boss with the party');
      ok(r.xp2 === r.xp1, '...but a boss-select fight (a sandbox) credits nothing to its save (' + r.xp1 + ' -> ' + r.xp2 + ')');
      ok(r.e.holder === 'companion', '...and the lock survives leaving the fight');
    }

    if (PAGE.includes('pausebd')) {
      console.log('pausebd');
      const r = await E(`(async()=>{const o={};await __fresh();const {LEVELS}=await import('/src/level.js');BK.load(LEVELS.findIndex(l=>l.id==='wood'));BK.start();BK.sim(5);
        o.solo=BK.players().length;
        BK.aiComp.openBoard();await new Promise(r=>setTimeout(r,60));const b0=BK.aiComp.board();o.join=b0.buttons.filter(b=>b.act==='join').map(b=>b.dis);o.ai=b0.buttons.filter(b=>b.act==='ai').map(b=>b.dis);
        __click(b=>b.dataset.act==='ai');__click(b=>b.dataset.act==='aidefault');__click(b=>b.dataset.hero==='warden');__click(b=>b.dataset.beh==='support');await BK.allyReady();BK.sim(3);
        o.afterAdd={n:BK.players().length,ai:BK.aiComp.seats().map(s=>s.hero+':'+s.beh),want:((BK.tavern.want()||{}).seats||[]).length,gap:Math.abs(BK.players()[1].x-BK.players()[0].x)};
        __click(b=>b.dataset.act==='retune');__click(b=>b.dataset.beh==='aggressive');o.retuned=BK.aiComp.seats().map(s=>s.beh);
        __click(b=>b.dataset.act==='dismiss');BK.sim(3);o.afterDismiss={n:BK.players().length,want:BK.tavern.want()};
        return o;})()`);
      console.log('    ' + JSON.stringify(r));
      ok(r.solo === 1 && r.join.every(d => d === true) && r.ai.length === 3 && r.ai.every(d => d === false), 'the pause board in a wood: JOIN is the inn\'s (greyed), AI PARTNER is live on every empty seat');
      ok(r.afterAdd.n === 2 && r.afterAdd.ai[0] === 'warden:support' && r.afterAdd.want === 1 && r.afterAdd.gap < 40, 'an AI WARDEN (SUPPORT) steps in beside player one mid-wood and is wanted for the next one');
      ok(r.retuned[0] === 'aggressive', 'HOW IT PLAYS retunes it live (SUPPORT -> AGGRESSIVE)');
      ok(r.afterDismiss.n === 1 && !r.afterDismiss.want, 'DISMISS sends it off: solo again, nothing wanted');
    }

    if (PAGE.includes('reload')) {
      console.log('reload');
      await E(`(async()=>{await __fresh();BK.aiComp.arm(['warden'],['defensive'],1);BK.tavern.saveParty();return sessionStorage.getItem('bracken.party.v1');})()`);
      const sv = await E(`sessionStorage.getItem('bracken.party.v1')`);
      ok(/defensive/.test(sv || ''), 'the party is written to the session as it changes: ' + sv);
      await pg.send('Page.navigate', { url: 'http://localhost:' + pg.PORT + '/?partyreload=1' });
      for (let i = 0; i < 200; i++) { await new Promise(r => setTimeout(r, 150)); if (await E('!!(window.BK&&BK.tavern&&BK.tavern.want)').catch(() => false)) break; }
      const w = await E(`JSON.stringify(BK.tavern.want())`);
      ok(/defensive/.test(w || ''), 'after a page reload the party is back (one AI, DEFENSIVE): ' + w);
      await E(`(()=>{sessionStorage.removeItem('bracken.party.v1');return 1;})()`);
    }

    if (PAGE.includes('rates')) {
      console.log('rates (OLD TUSKER, knight, profile human at campaign level ' + campaignLevel('wood') + ', ' + NRATE + ' seeds)');
      await E(levelJs(campaignLevel('wood')));
      const run = async withAi => {
        const res = [];
        for (let s = 0; s < NRATE; s++) {
          const r = await E(`(async()=>{BK.coopEnd();${withAi ? `BK.aiComp.arm('warden','balanced');` : `BK.coopArm(null);`}const tp0=BK.tp;BK.tp=function(x,y){const r=tp0.call(BK,x,y);const q=BK.players().find(p=>p.ai);if(q){q.x=BK.P.x-24;q.y=BK.P.y;q.vx=q.vy=0;q.down=0;q.hp=q.maxHp;}return r;};
            try{const out=await BK.bossLab({bosses:['wood'],heroes:['knight'],seed:'aic${s}',healthMode:'normal',maxSecs:150,profile:'human'});const row=out.rows[0]||{};const q=BK.players().find(p=>p.ai);const wipes=BK.stats().deaths;
              /* WON: the boss down. Solo: the lab's own outcome (win, or a trade). With an AI a hero goes DOWN, not dead - a party back at the shrine (a wipe, the run's death count) is a loss */
              return {won:${withAi ? '!!row.killed&&wipes===0' : "row.outcome==='win'||row.outcome==='trade'"},outcome:row.outcome,wipes,secs:row.secs,hpLeft:row.hpLeftPct,coop:BK.players().length,ai:q?{dmg:Math.round(q.score.dmg),ups:q.aiUps||0,revives:q.score.revives}:null};}finally{BK.tp=tp0;}})()`);
          res.push(r);
        }
        return res;
      };
      const solo = await run(false), duo = await run(true);
      const w = a => a.filter(r => r.won).length;
      console.log('    solo  ' + w(solo) + '/' + solo.length + ' ' + JSON.stringify(solo.map(r => [r.won ? 'W' : 'L', r.secs])));
      console.log('    +AI   ' + w(duo) + '/' + duo.length + ' ' + JSON.stringify(duo.map(r => [r.won ? 'W' : 'L', r.secs, r.ai && r.ai.dmg])) + ' coop seats ' + (duo[0] || {}).coop);
      ok(duo.every(r => r.coop === 2), 'the AI was in every co-op row');
    }
    ok(!pg.errors.length, 'no page errors: ' + pg.errors.slice(0, 3).join(' | '));
  } finally { pg.close(); }
}
console.log(fails.length ? '\nai-companion: ' + fails.length + ' FAILED' : '\nai-companion: GREEN');
process.exit(fails.length ? 1 : 0);
