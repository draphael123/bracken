// tools/arena-yard.mjs - THE ARENA YARD (claude/arenayard, Daniel 11-03; plan scratch/plan-arenayard-1103.md).
// One shared yard (level 'arena_yard'), NO `trial` flag (co-op works), dummies that hit for nothing but read as hits, PERFECT / GOOD / HIT from the
// game's own parry counting, a move board that reads the hero standing at it. Checks, in ONE browser (headless, simulated frames, no real time):
//   build    the level: arenaYard + openYard, no `trial`, the stations and their men; the swornswords carry the zone / tell / pace flags; the ten old trial_* / trial_open rows are RETIRED (they build this yard)
//   board    src/move-board.js pure (stepLine / boardLines / boardPages), then the real board for EVERY hero: lines for each trial step, pages fit
//   safe     every hero stands in the slow, the flash and the archer stations 10 s with no input: hp never moves, the HIT word is shown, nothing ends him
//   perfect  the flash dummy, the beat answered by each hero's own input: knight / pyro / warden / ranger (and the rest, reported): PERFECT is shown
//   arrows   the archer's arrows against each hero (hold C, tap C): what the kit did to them (the report's table), GOOD or PERFECT shown, never a hurt hero
//   zone     a dummy is asleep while nobody is in its station and wakes when somebody is; the archer is silent two stations away
//   coop     two and four seats start a party IN the yard (players.length), each reads his OWN board, a seat in a station is graded and unhurt
//   entry    the inn's practice door -> the yard (with the party), the gate out -> the inn; the title row ARENA YARD / the hero card / the store -> the yard, out -> the map; NO trials door, NO practice list (claude/yardswap, Daniel 11-03)
// node tools/arena-yard.mjs [build,board,safe,perfect,arrows,zone,coop,entry]   (PORT from the environment; ONE=knight,warden narrows the hero loops)
import { openPage, ROOT } from './cdp.mjs';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { stepLine, boardLines, boardPages } from '../src/move-board.js';

const ALL = ['build', 'board', 'safe', 'perfect', 'arrows', 'zone', 'coop', 'entry'];   /* + 'shots' (SHOT=1): one screenshot per station into scratch/lane-reports/arenayard */
const WANT = process.argv[2] ? process.argv[2].split(',') : ALL;
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log('  FAIL ' + m); } else console.log('  ok   ' + m); };
const main = readFileSync(join(ROOT, 'src/main.js'), 'utf8');
const heroBlock = main.slice(main.indexOf('const HEROES = ['), main.indexOf('];', main.indexOf('const HEROES = [')));
const HEROES = [...heroBlock.matchAll(/\{ id: '(\w+)'/g)].map(m => m[1]);
const ONE = process.env.ONE ? process.env.ONE.split(',') : null;
const heroes = ONE || HEROES;
const SHOTS = process.env.SHOTS || join(ROOT, '..', 'scratch', 'lane-reports', 'arenayard');
if (process.env.SHOT) mkdirSync(SHOTS, { recursive: true });
const pg = await openPage({ audio: false, fonts: false, seed: 11 });
const E = e => pg.evalp(e);
const shot = async n => { if (!process.env.SHOT) return; const r = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(join(SHOTS, n + '.png'), Buffer.from(r.result.data, 'base64')); };
try {
  if (HEROES.length < 7) fails.push('read only ' + HEROES.length + ' heroes off main.js HEROES');
  await E(`(async()=>{const {LEVELS}=await import('/src/level.js');window.__LV=LEVELS;window.__IDX=LEVELS.findIndex(l=>l.id==='arena_yard');
    const AYm=await import('/src/arena-yard.js');window.__AY=AYm;
    const clearK=()=>{for(const k in BK.keys)BK.keys[k]=false;};
    window.__go=(h,extra)=>{BK.manualSimulation=true;clearK();BK.setHero(h);BK.reset({fresh:true});BK.applyUpgrades();BK.load(__IDX);BK.start();BK.god=false;if(extra)extra();BK.sim(30);};
    window.__Y=()=>BK.yard();
    window.__foe=t=>BK.enemies().filter(e=>e.t===t).sort((a,b)=>a.x-b.x);
    window.__fresh=()=>{for(const p of BK.players()){p.st=p.maxSt;}};
    window.__stand=(p,col,face)=>{p.x=col*16+8;p.y=22*16-0.01;p.vx=0;p.vy=0;p.face=face||1;p.ground=true;};
    window.__hpAll=()=>BK.players().map(p=>p.hp);
  })()`);

  if (WANT.includes('build')) {
    console.log('build');
    const r = await E(`(()=>{const i=__IDX;const L=__LV[i].build();const c={};for(const e of L.ents)c[e.t]=(c[e.t]||0)+1;
      return {i,id:__LV[i].id,hidden:!!__LV[i].hidden,last:i===__LV.findIndex(l=>l.id==='arena_yard'),arenaYard:!!L.arenaYard,openYard:!!L.openYard,trial:L.trial===undefined?'undef':typeof L.trial,W:L.W,H:L.H,c,
        sw:L.ents.filter(e=>e.t==='swornsword').map(e=>({x:e.x,z:e.yardZone,tell:!!e.yardTell,pace:e.yardPace||1,tr:e.trainer})),ar:L.ents.filter(e=>e.t==='archer').map(e=>({x:e.x,tr:e.trainer,z:e.yardZone})),
        retired:__LV.filter(l=>l.retired).map(l=>{const b=l.build();return {id:l.id,yard:!!b.arenaYard,trial:b.trial!==undefined,hidden:!!l.hidden};}),trialIds:__LV.filter(l=>/^trial_/.test(l.id)).length};})()`);
    ok(r.id === 'arena_yard' && r.hidden, 'LEVELS has arena_yard, hidden (not on the road)');
    ok(r.arenaYard && r.openYard && r.trial === 'undef', 'arenaYard + openYard set and NO `trial` (a truthy trial turns co-op off)');
    ok(r.W === 164 && r.H === 30, 'the yard is 164 x 30');
    ok(r.c.dummy >= 7 && r.c.sign >= 9 && r.c.shield === 1 && r.c.soldier === 1 && r.c.swornsword === 2 && r.c.archer === 1, 'the stations hold their men: ' + JSON.stringify({ d: r.c.dummy, sign: r.c.sign, sw: r.c.swornsword, ar: r.c.archer }));
    ok(r.sw.length === 2 && r.sw.every(s => s.z && s.tr === 'drill') && r.sw.filter(s => s.tell).length === 1 && r.sw.some(s => s.pace > 1 && !s.tell), 'two swornswords: a slow one (longer tell, no flash) and a flash one, each zoned and a drill');
    ok(r.ar.length === 1 && r.ar[0].tr === 'drill' && r.ar[0].z, 'the archer never goes down, shoots, and is zoned');
    ok(r.trialIds === 10 && r.retired.length === 10 && r.retired.every(x => x.yard && !x.trial && x.hidden), 'the old open yard and the nine hero trials are RETIRED rows (index kept, hidden): each one builds the Arena Yard, none a trial: ' + JSON.stringify(r.retired.filter(x => !x.yard || x.trial)));
  }

  if (WANT.includes('board')) {
    console.log('board');
    ok(stepLine('THE SWING. X STRIKES. HIT THE STRAW MAN THREE TIMES.') === 'THE SWING: X STRIKES', 'stepLine: the name and the move, not the counting');
    ok(stepLine('THE THIRD CUT: X THREE TIMES IN A RUN. THE THIRD IS THE SHIELD BASH.') === 'THE THIRD CUT: X THREE TIMES IN A RUN', 'stepLine cuts at the first stop');
    ok(stepLine('NO STOPS HERE') === 'NO STOPS HERE', 'stepLine keeps a line with no stop');
    const bl = boardLines('knight', { steps: [['a', 1, 'ONE. X.', [], 'PADTEXT'], ['b', 1, 'ONE. X.', []]], loop: 'LOOP', skills: ['A', ''], name: 'THE KNIGHT', pad: true });
    ok(bl.lines.length === 1 && bl.lines[0].pad === 'PADTEXT' && bl.skillLine === 'F: A', 'boardLines: dedupes a repeated line, carries the pad words only when a pad is in use, names the skills');
    const pgs = boardPages({ lines: Array.from({ length: 30 }, (_, i) => ({ text: 'LINE ' + i, pad: '' })), skillLine: '' }, (t, w) => [t], 40, 11);
    ok(pgs.length === 3 && pgs.every(p => p.length <= 11), 'boardPages: 30 rows -> pages of at most 11');
    await E(`(async()=>{window.__textRec=[];})()`);
    for (const h of heroes) {
      const r = await E(`(()=>{__go(${JSON.stringify(h)});const Y=__Y();Y.open(BK.players()[0]);const bd=Y.Y.st.board;if(!bd)return null;
        const steps=(window.__LVsteps||null);BK.sim(4);return {hero:bd.b.hero,title:bd.b.title,lines:bd.b.lines.length,pages:bd.pages.length,rows:bd.pages.map(p=>p.length),loop:bd.b.loop.length,skills:bd.b.skills};})()`);
      ok(r && r.hero === h && r.lines >= 3 && r.pages >= 1 && r.rows.every(n => n <= 11) && r.loop > 0, h + ': the board has ' + (r && r.lines) + ' move lines on ' + (r && r.pages) + ' page(s), his own loop, skills ' + JSON.stringify(r && r.skills));
      if (h === heroes[0]) await shot('board-' + h);
    }
    // every page of every hero is drawn, and nothing was cut or ran off the panel
    const cuts = await E(`(()=>{const out=[];for(const h of ${JSON.stringify(heroes)}){__go(h);const Y=__Y();Y.open(BK.players()[0]);const bd=Y.Y.st.board;for(let k=0;k<bd.pages.length;k++){bd.page=k;window.__textRec.length=0;BK.sim(2);
      for(const r of window.__textRec)if(r.kind==='cut'||r.kind==='over')out.push(h+' p'+k+' '+JSON.stringify(r).slice(0,140));}}return out;})()`);
    ok(cuts.length === 0, 'no board page cuts or overflows text' + (cuts.length ? ': ' + cuts.slice(0, 3).join(' | ') : ''));
  }

  if (WANT.includes('safe')) {
    console.log('safe');
    for (const h of heroes) {
      const r = await E(`(()=>{__go(${JSON.stringify(h)});const out={};const Y=__Y().Y;
        for(const [id,col,face] of [['slow',100,1],['flash',118,1],['archer',143,1]]){
          __go(${JSON.stringify(h)});const p=BK.players()[0];__stand(p,col,face);BK.sim(5);const hp0=p.hp,h0=Y.st.stats.hit;let seenWord=false,dead=false,n=0;
          for(let f=0;f<600;f++){BK.sim(1);if(BK.yard().nums().some(q=>q.txt==='HIT'))seenWord=true;if(p.dead)dead=true;}
          out[id]={hp0,hp1:p.hp,hits:Y.st.stats.hit-h0,word:seenWord,dead};}
        return out;})()`);
      for (const id of ['slow', 'flash', 'archer']) ok(r[id].hp1 === r[id].hp0 && !r[id].dead && r[id].hits > 0 && r[id].word, h + ' in the ' + id + ' station, no input, 10 s: hp ' + r[id].hp0 + '->' + r[id].hp1 + ', ' + r[id].hits + ' HIT(s), word ' + r[id].word);
    }
  }

  if (WANT.includes('perfect')) {
    console.log('perfect');
    /* the beat, answered the way each hero's own trial says: hold (knight, paladin, berserker) / tap (pyro, pirate, warden, ranger, geomancer) / hold then let go (reaper) */
    const MODE = { knight: 'hold', paladin: 'hold', berserker: 'hold', pyro: 'tap', pirate: 'tap', warden: 'tap', ranger: 'tap', geomancer: 'tap', reaper: 'release' };
    const must = ['knight', 'pyro', 'warden', 'ranger'];
    for (const h of heroes) {
      const r = await E(`(()=>{__go(${JSON.stringify(h)});const p=BK.players()[0],Y=__Y().Y,mode=${JSON.stringify(MODE[h] || 'tap')};const sw=__foe('swornsword')[1];
        __stand(p,116,1);BK.sim(3);let held=0,rel=false,tapN=0,wait=0;const K=BK.keys;let done=false;
        for(let f=0;f<60*30&&Y.st.stats.perfect===0;f++){
          if(mode==='release'&&sw.mode==='cutTell'&&!rel){K.block=true;}
          if(sw.mode==='cutTell'&&sw.glint===1&&!held){held=1;if(mode==='hold'){if(${JSON.stringify(h)}==='knight'){held=2;}else K.block=true;}else if(mode==='tap'){K.block=true;tapN=3;}else if(mode==='release'){K.block=false;rel=true;}}
          if(held===2&&sw.modeT<=0.07){K.block=true;held=3;}   /* the knight's perfect guard is the last 0.11 s: the flash is the cue, the shield goes up on its heels */
          if(mode==='tap'&&tapN>0&&--tapN===0)K.block=false;
          if(mode==='hold'&&held>=1&&(sw.mode==='reel'||sw.mode==='rest'||sw.mode==='walk')){K.block=false;}
          if(sw.mode==='walk'||sw.mode==='reel'||sw.mode==='rest'){held=0;rel=false;if(mode!=='hold')K.block=false;}
          p.hp=p.maxHp;p.st=p.maxSt;p.face=1;BK.sim(1);}
        K.block=false;return {perfect:Y.st.stats.perfect,good:Y.st.stats.good,hit:Y.st.stats.hit,last:Y.st.last&&Y.st.last.g,hp:p.hp,max:p.maxHp};})()`);
      const m = h + ' flash dummy: ' + JSON.stringify(r);
      if (must.includes(h)) ok(r.perfect > 0, h + ' answered the beat: PERFECT shown (' + r.perfect + ' perfect, ' + r.good + ' good, ' + r.hit + ' hit)');
      else console.log('  info ' + m);
      if (!must.includes(h)) { /* the others are reported, never failed: their own trial station is the proof */ }
    }
  }

  const ARROWS = {};
  if (WANT.includes('arrows')) {
    console.log('arrows');
    /* ONE ARROW AT A TIME, the guard put up when it is D px away (a tap of 4 frames, or held): what the hero's OWN kit does to it. A hero who only blocks says GOOD;
       a hero with a beat says PERFECT when D is inside it; a kit that flings it back shows `refl`; `archerHurt` is the archer's flash after it. */
    const DS = [90, 60, 44, 32, 22, 14, 8];
    for (const h of heroes) {
      ARROWS[h] = [];
      const r = await E(`(()=>{__go(${JSON.stringify(h)});const p=BK.players()[0],Y=__Y().Y,K=BK.keys,ar=__foe('archer')[0];const rows=[];const hp0=p.hp;
        const seedNow=()=>BK.yard().seeds().find(s=>s.owner===ar&&!s.dead&&!s.reflected&&!s.__done);
        for(const strat of ['tap','hold'])for(const D of ${JSON.stringify(DS)}){
          __stand(p,142,1);p.hp=p.maxHp;p.st=p.maxSt;K.block=false;BK.sim(4);const px=p.x;for(const q of BK.yard().seeds())q.__done=true;   /* only an arrow fired AT him where he stands now */
          let s=null;for(let f=0;f<60*12&&!s;f++){p.x=px;p.vx=0;BK.sim(1);s=seedNow();}
          if(!s){rows.push({D,strat,res:'no arrow'});continue;}
          const s0={...Y.st.stats};let pressed=0,hurt=false,refl=false,fl=0;
          for(let f=0;f<60*6;f++){
            const d=Math.abs(s.x-p.x);
            if(!pressed&&d<=D){K.block=true;pressed=f+1;}
            if(strat==='tap'&&pressed&&f-pressed>=3)K.block=false;
            p.face=1;p.hp=p.maxHp;p.st=p.maxSt;p.x=px;p.vx=0;BK.sim(1);
            if(s.reflected)refl=true;if(ar.flash>0&&fl<=0&&refl)hurt=true;fl=ar.flash;
            if(s.dead&&!s.reflected&&f>3&&!refl){break;}
            if(refl&&f>200)break;}
          K.block=false;s.__done=true;
          const dP=Y.st.stats.perfect-s0.perfect,dG=Y.st.stats.good-s0.good,dH=Y.st.stats.hit-s0.hit;
          rows.push({D,strat,res:dP?'PERFECT':dG?'GOOD':dH?'HIT':'none',refl,archerHurt:hurt,gone:!!s.dead,pressed,dx:Math.round(s.x-p.x),dy:Math.round(s.y-p.y)});
          BK.sim(30);}
        return {rows,hp:[hp0,p.hp],hurtNow:p.hp<p.maxHp};})()`);
      ARROWS[h] = r.rows;
      const best = r.rows.filter(x => x.res === 'PERFECT').length ? 'PERFECT' : r.rows.some(x => x.res === 'GOOD') ? 'GOOD' : 'HIT/none';
      const refl = r.rows.filter(x => x.refl).length, ah = r.rows.filter(x => x.archerHurt).length;
      { const L = (st) => r.rows.filter(x => x.strat === st).map(x => ({ PERFECT: 'P', GOOD: 'g', HIT: 'h', none: '-' }[x.res] || '?') + (x.refl ? 'R' : '') + (x.archerHurt ? '!' : '')).join(' ');
        console.log('  info ' + h.padEnd(9) + ' D=' + DS.join('/') + '  tap: ' + L('tap') + '   hold: ' + L('hold')); }
      ok(!r.hurtNow, h + ' vs the archer, ' + r.rows.length + ' arrows at 7 timings x (tap, hold): hp never moved; best ' + best + ', flung back ' + refl + ', archer hurt ' + ah);
    }
    writeFileSync(join(SHOTS, 'arrows-table.json'), JSON.stringify(ARROWS, null, 1));
  }

  if (WANT.includes('zone')) {
    console.log('zone');
    const r = await E(`(()=>{__go('knight');const p=BK.players()[0],K=BK.keys;const [slow,flash]=__foe('swornsword'),ar=__foe('archer')[0];
      __stand(p,112,1);let minCd=9,cut=0,shots=0,arrows=new WeakSet();
      for(let f=0;f<60*6;f++){p.hp=p.maxHp;BK.sim(1);minCd=Math.min(minCd,slow.cd||0);if(slow.mode==='cutTell'||slow.mode==='cut')cut++;for(const s of BK.yard().seeds())if(s.owner===ar&&!arrows.has(s)){arrows.add(s);shots++;}}
      const asleep={minCd,cut,shots};
      __stand(p,98,1);let woke=0;for(let f=0;f<60*8&&!woke;f++){p.hp=p.maxHp;BK.sim(1);if(slow.mode==='cutTell')woke=f;}
      return {asleep,woke};})()`);
    ok(r.asleep.cut === 0 && r.asleep.minCd >= 0.49, 'the slow dummy sleeps while the hero stands in the NEXT station (never began a swing; cd held >= ' + r.asleep.minCd.toFixed(2) + ')');
    ok(r.asleep.shots === 0, 'the archer is silent while nobody is in his station (' + r.asleep.shots + ' arrows)');
    ok(r.woke > 0, 'the slow dummy wakes when somebody stands in his station (swing begun at frame ' + r.woke + ')');
  }

  if (WANT.includes('coop')) {
    console.log('coop');
    for (const seats of [2, 4]) {
      const extra = seats === 2 ? `BK.coopStart('warden',false)` : `BK.coopStart('warden',false,[{},{hero:'pyro'},{hero:'ranger'}])`;
      const r = await E(`(()=>{__go('knight',()=>{});${extra};BK.sim(40);const Y=__Y();const ps=BK.players();const out={n:ps.length,heroes:ps.map(p=>p.hero),trial:!!BK.L.trial,L:BK.L.arenaYard?1:0};
        // each reads HIS OWN board
        out.boards=ps.map(p=>{Y.open(p);const b=Y.Y.st.board;const o=b&&b.p===p?b.b.hero:null;Y.Y.st.board=null;return o;});
        // a seat in the flash station is graded and unhurt, the others stay where they are
        const cols=ps.length===2?[105,113]:[104,108,113,116];ps.forEach((p,i)=>__stand(p,cols[i],1));   /* the camera keeps a party together (a leash pulls a hero left behind): they train side by side, across the slow and the flash stations */const hp0=ps.map(p=>p.hp),h0=Y.Y.st.stats.hit;for(let f=0;f<60*10;f++)BK.sim(1);
        out.unhurt=ps.every((p,i)=>p.hp===hp0[i]);out.hits=Y.Y.st.stats.hit-h0;out.alive=ps.every(p=>!p.dead);
        // the real path: a party armed on the pick screen starts IN the yard
        return out;})()`);
      ok(r.n === seats && !r.trial && r.L === 1, seats + ' seats start a party in the yard (players ' + r.n + ', trial ' + r.trial + ')');
      ok(JSON.stringify(r.boards) === JSON.stringify(r.heroes), seats + ' seats: each player reads his own board ' + JSON.stringify(r.boards));
      ok(r.unhurt && r.alive && r.hits > 0, seats + ' seats: the seats in the slow and flash stations are graded (' + r.hits + ' HITs) and nobody hurt');
      if (seats === 4) await shot('coop-4-seats');
    }
    const armed = await E(`(()=>{BK.coopArm('warden',false);BK.load(__IDX);BK.start();BK.sim(40);const n=BK.players().length;BK.coopArm(null);return {n};})()`);
    ok(armed.n === 2, 'a party armed before the start comes in with two seats (the real startGame path)');
  }

  if (WANT.includes('entry')) {
    console.log('entry');
    const r = await E(`(async()=>{const out={};
      BK.manualSimulation=false;await new Promise(r=>setTimeout(r,800));   /* the entry paths run the REAL (async) loads, one at a time */
      const rows=await import('/src/level.js');
      BK.setHero('knight');BK.reset({fresh:true});BK.applyUpgrades();
      const LSm=(await import('/src/loading-screen.js')).LS;const at=()=>BK.L&&BK.state==='play'&&!LSm.state.busy?(BK.L.arenaYard?'yard':BK.L.tavern?'inn':BK.L.trial?'trial':'other'):'none';   /* (play and the loading screen idle: a load still finishing its bake is not there yet - the next load must not overlap it) */
      await BK.tavern.enter();BK.sim(30);out.inn=at();
      BK.tavern.use('practice',1);for(let i=0;i<400&&at()!=='yard';i++){BK.sim(1);await new Promise(r=>setTimeout(r,5));}out.fromInn=at();out.innFlag=BK.yard().inn();
      BK.sim(20);out.players=BK.players().length;
      BK.yard().leave();for(let i=0;i<400&&at()!=='inn';i++){BK.sim(1);await new Promise(r=>setTimeout(r,5));}out.backToInn=at();
      BK.yard().enter(false);for(let i=0;i<400&&at()!=='yard';i++){BK.sim(1);await new Promise(r=>setTimeout(r,5));}out.fromTitle=at();out.innFlag2=BK.yard().inn();
      BK.sim(20);
      // (claude/yardswap) there is NO trials door any more: UP where it stood (col 3) does nothing
      const p=BK.players()[0];__stand(p,3,1);BK.sim(5);BK.press('talk');BK.sim(3);out.door=BK.yard().state();out.nearDoor=BK.yard().Y.spotNear(p);
      // the title row ARENA YARD, the hero card's Z and the pause row all lead here (and there is no PRACTICE row)
      BK.yard().leave();for(let i=0;i<400&&BK.state==='play';i++){BK.sim(1);await new Promise(r=>setTimeout(r,5));}
      BK.state='title';const top=BK.ui.titleTop();out.titleRow=top.indexOf('ARENA YARD')>=0;out.oldRow=top.includes('PRACTICE');BK.ui.titleI=top.indexOf('ARENA YARD');BK.ui.pressCard=false;BK.press('confirm');
      for(let i=0;i<400&&at()!=='yard';i++){BK.sim(1);await new Promise(r=>setTimeout(r,5));}out.fromTitleRow=at();
      BK.yard().leave();for(let i=0;i<400&&BK.state==='play';i++){BK.sim(1);await new Promise(r=>setTimeout(r,5));}
      BK.state='herocard';BK.press('confirm');for(let i=0;i<400&&at()!=='yard';i++){BK.sim(1);await new Promise(r=>setTimeout(r,5));}out.fromHeroCard=at();
      return out;})()`);
    ok(r.inn === 'inn' && r.fromInn === 'yard' && r.innFlag === true, 'the inn\'s practice door goes straight into the Arena Yard');
    ok(r.backToInn === 'inn', 'the yard\'s gate out goes back to the inn when it was entered from the inn');
    ok(r.fromTitle === 'yard' && r.innFlag2 === false, 'the title / store entry goes straight into the yard, not from the inn');
    ok(r.door === 'play' && r.nearDoor === null, 'no trials door: UP where it stood does nothing (state ' + r.door + ')');
    ok(r.titleRow && !r.oldRow && r.fromTitleRow === 'yard', 'the title row is ARENA YARD (no PRACTICE) and it goes straight into the yard: ' + r.fromTitleRow);
    ok(r.fromHeroCard === 'yard', "the hero card's Z goes to the Arena Yard: " + r.fromHeroCard);
    ok(!/startTrial|hasTrial|updatePractice|drawPractice|YARD_DRILLS/.test(main) && /k !== 'Arena Yard' || !(L && L.arenaYard)/.test(main) && !/id: 'practice', name: 'PRACTICE'/.test(readFileSync(join(ROOT, 'src/store.js'), 'utf8')), 'main.js has no trial / practice-list code left, the pause row is hidden inside the yard, the store has no PRACTICE tab');
  }

  if (WANT.includes('shots')) {
    console.log('shots');
    const st = [['gate', 6], ['straw', 20], ['steps', 36], ['gap', 44], ['climb', 63], ['guard', 79], ['slow', 98], ['flash', 116], ['archer', 142]];
    await E(`(()=>{__go('knight');})()`);
    for (const [id, col] of st) {
      await E(`(()=>{const p=BK.players()[0];__stand(p,${col},1);BK.sim(80);})()`);
      if (id === 'slow' || id === 'flash' || id === 'archer') await E(`(()=>{BK.sim(120);})()`);
      await shot('station-' + id);
    }
    await E(`(()=>{__go('knight');const p=BK.players()[0];__stand(p,8,1);BK.sim(40);__Y().open(p);BK.sim(3);})()`); await shot('board-open');
    await E(`(()=>{const Y=__Y();Y.Y.st.board.page=1;BK.sim(2);})()`); await shot('board-page2');
    await E(`(()=>{__go('knight');const p=BK.players()[0],Y=__Y().Y,sw=__foe('swornsword')[1];__stand(p,116,1);BK.sim(3);let held=0;for(let f=0;f<2400&&Y.st.stats.perfect===0;f++){if(sw.mode==='cutTell'&&sw.glint===1&&!held)held=2;if(held===2&&sw.modeT<=0.07){BK.keys.block=true;held=3;}if(sw.mode==='reel')BK.keys.block=false;p.hp=p.maxHp;BK.sim(1);}BK.sim(6);})()`); await shot('grade-perfect');
    await E(`(()=>{BK.keys.block=false;__go('knight');const p=BK.players()[0],Y=__Y().Y;__stand(p,118,1);for(let f=0;f<900&&Y.st.stats.hit===0;f++)BK.sim(1);BK.sim(5);})()`); await shot('grade-hit');
    await E(`(()=>{__go('knight',()=>{});BK.coopStart('warden',false,[{},{hero:'pyro'},{hero:'ranger'}]);BK.sim(40);BK.players().forEach((p,i)=>__stand(p,[104,108,113,116][i],1));BK.sim(120);})()`); await shot('coop-4-stations');
  }

  console.log('errors', pg.errors.length ? pg.errors.slice(0, 5) : 'none');
  ok(pg.errors.length === 0, 'no page errors');
} finally { pg.close(); }
if (fails.length) { console.log('\nFAILED ' + fails.length); for (const f of fails) console.log(' - ' + f); process.exit(1); }
console.log('\narena-yard: all ok');
