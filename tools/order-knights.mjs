// tools/order-knights.mjs - THE BROKEN ORDER DOES WHAT THE BRIEF SAYS (claude/order, scratch/brief-elite-order.md; src/order-chapters.js,
// src/order-knights.js).
//   table   (node) every ORDER_AT row names a real body, chapter, twist and built signature moves; one affix at most, and it fits the level;
//           a twist is wired only on its own level and two levels of one region never share one; the level's ELITES row puts THAT knight
//           at THAT column holding THAT gate, and the elite he replaces is gone (review-first2: replace, not add); every windup a knight can
//           enter has its mark in src/marks.js BY_HAND, the same as ORDER_MARKS; the guard layer (orderGuard) as specified
//   moves   (page) each of the four bodies, as an elite on a flat floor beside a hero who only stands there: every move he starts is TOLD -
//           the mark the table names (a yellow ! / a red !! / none for a quiet one), a WORD and a sound - and none of his windups begins while
//           another foe's is under 0.5 s old (one windup at a time)
//   bodies  (page) THE DUELIST guards high (a plunge clanks, no damage); THE LANCER thrusts up at a hero over him; THE BRUTE catches a hero in
//           the air and no heavy blow throws him until he is broken; THE ORE plates turn a light cut and a heavy cracks one; THE BATTLE MAGE is
//           INTERRUPTED by a blow in his cast and wards a shot off his front
//   twists  (page) WOOD's TIMBER fells the pine once he is roused, and a swing across the trunk STICKS IN WOOD; MARSH's SHOVE drives a hero
//           back; THE ORE ROAD's RUST gives under a hero standing on it
//   levels  (page) the three exams: the knight stands in his chapter's skin and name, holds his gate shut (his banner on it), and the gate
//           lifts when he falls; he dies in his chapter's skin
// node tools/order-knights.mjs [table,moves,bodies,twists,levels]      (PORT from the environment)
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as OC from '../src/order-chapters.js';
import { orderGuard, BODY_MOVES } from '../src/order-knights.js';
import { LEVELS } from '../src/level.js';
import { kindOf } from '../src/exit-gates.js';
import { affixFits } from '../src/elite-kit.js';
import { BY_HAND } from '../src/marks.js';
const WANT = process.argv[2] ? process.argv[2].split(',') : ['table', 'moves', 'bodies', 'twists', 'levels'];
let n = 0; const ok = (c, m) => { assert(c, m); n++; console.log('  ok  ' + m); };

if (WANT.includes('table')) {
  console.log('table');
  const used = {};
  for (const [id, o] of Object.entries(OC.ORDER_AT)) {
    const lv = LEVELS.find(l => l.id === id); ok(!!lv, id + ': a real level');
    ok(!!OC.BODY[o.body] && !!OC.CHAPTERS[o.chapter], id + ': body ' + o.body + ', chapter ' + o.chapter);
    ok(kindOf(id) === o.chapter, id + ': its chapter is its region (' + kindOf(id) + ')');
    ok(OC.TWISTS[o.twist] && OC.TWISTS[o.twist].level === id, id + ': its twist ' + o.twist + ' is wired on this level only');
    const k = kindOf(id) + '|' + o.twist; ok(!used[k], id + ': no other level of ' + kindOf(id) + ' has the twist ' + o.twist); used[k] = id;
    ok(o.sig.every(s => OC.CHAPTERS[o.chapter].moves.includes(s) && OC.SIG_BUILT.has(s)), id + ': signature moves ' + o.sig.join('+') + ' are its chapter\'s, and built');
    ok(OC.CHAPTERS[o.chapter].built, id + ': its chapter is a built one');
    ok(!o.affix || affixFits(id, o.affix, false), id + ': affix ' + (o.affix || 'none') + ' (one at most) fits the level');
    const L = lv.build(), kn = L.ents.filter(e => OC.isKnightT(e.t));
    ok(kn.length === 1 && kn[0].t === o.body && kn[0].x === o.at[0] && kn[0].y === o.at[1] && kn[0].gate === o.gate && kn[0].elite, id + ': the level puts ' + o.name + ' at ' + o.at + ' holding gate ' + o.gate);
    ok(kn[0].cnSkin === OC.skinOf(o.body, o.chapter) && kn[0].affix === (o.affix || undefined), id + ': in his chapter skin ' + kn[0].cnSkin + ' with the table\'s affix');
    ok(!L.ents.some(e => e.t === o.replaces && e.y === o.at[1] && Math.abs(e.x - o.at[0]) <= 3), id + ': the ' + o.replaces + ' he replaces is gone');
    ok(L.ents.filter(e => e.elite && !e.ambush).length >= 1 && !L.ents.some(e => e.elite && e !== kn[0] && Math.abs(e.x - o.at[0]) < 20), id + ': no second elite beside him (replace, not add)');
  }
  const moves = new Set([...Object.values(BODY_MOVES).flat(), ...Object.keys(OC.SIG).filter(s => !OC.SIG[s].passive), 'timber', 'shove', 'rust']);
  for (const m of moves) ok(OC.ORDER_MARKS[m + 'Tell'] !== undefined, 'the windup ' + m + 'Tell has a mark (' + JSON.stringify(OC.ORDER_MARKS[m + 'Tell']) + ')');
  for (const t of OC.TYPES) for (const [m, v] of Object.entries(OC.ORDER_MARKS)) assert(BY_HAND[t + '|' + m] === v, 'BY_HAND ' + t + '|' + m);
  ok(true, 'src/marks.js BY_HAND has every body x windup (' + OC.TYPES.length * Object.keys(OC.ORDER_MARKS).length + ' rows)');
  for (const [k, T] of Object.entries(OC.TWISTS)) ok(OC.ORDER_MARKS[{ timber: 'timberTell', channel: 'shoveTell', rust: 'rustTell' }[k]] === T.mark, 'twist ' + k + ' marks ' + T.mark + ' as its table says');
  /* the guard layer */
  const ore = { t: 'oathlance', okPlate: 2, face: 1, alive: true };
  ok(orderGuard(ore, 10, 'light', false, 20, 'light').turn === 'ORE' && orderGuard(ore, 10, 'light', false, -20, 'light').turn === 'ORE', 'ORE: a light cut is turned from either side');
  const hv = orderGuard(ore, 10, 'heavy', false, 20, 'heavy'); ok(hv.dmg === 5 && ore.okPlate === 1 && hv.word === 'CRACKED', 'ORE: a heavy cracks a plate and goes in at half');
  orderGuard(ore, 10, 'light', false, 20, ['light', 'riposte']); ok(ore.okPlate === 0 && orderGuard(ore, 10, 'light', false, 20, 'light') === null, 'ORE: a riposte cracks the last; then the elite guard decides');
  const mg = { t: 'oathmage', face: 1, ekSide: 1, alive: true };
  ok(orderGuard(mg, 8, 'shot', false, 30, 'shot').turn === 'WARDED' && orderGuard(mg, 8, 'shot', false, -30, 'shot') === null && orderGuard(mg, 8, 'dash', false, 30, 'dash') === null, 'THE MAGE: a shot off his front is WARDED; from behind or a dash, not');
  ok(orderGuard({ t: 'oathblade', face: 1 }, 10, 'light', false, 20, 'light') === null && orderGuard({ t: 'shield', okPlate: 2 }, 10, 'light', false, 20, 'light') === null, 'no opinion on anyone else');
  ok(orderGuard({ t: 'oathlance', okPlate: 2, broken: 1 }, 10, 'light', false, 20, 'light') === null, 'ORE: a broken knight is open (his opening is not plated)');
}

if (WANT.some(w => w !== 'table')) {
  const { openPage } = await import('./cdp.mjs');
  const pg = await openPage({ audio: false, fonts: false });
  try {
    await pg.evalp(`(()=>{
      window.__arena=(h,o={})=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero(h||'knight');BK.reset({fresh:true});
        BK.load(0);BK.state='play';BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');
        const L=BK.L;for(let x=2;x<90;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;L.pools=[];BK.fires().length=0;BK.props().length=0;
        BK.god=false;BK.tp(10,21);BK.sim(30);const P=BK.P;P.hp=P.maxHp;P.inv=0;P.face=1;BK.order().stats.reset();return P;};
      window.__knight=(t,dx,o={})=>{const P=BK.P;BK.spawnEnt({t,x:Math.round((P.x+dx)/16),y:21,elite:true,face:-1,chapter:'forest',sig:[],...o});const e=BK.enemies().at(-1);if(o.affix===undefined)e.affix=null;e.ekKeyed=true;return e;};
      return 1;})()`);
    if (WANT.includes('moves')) {
      console.log('moves');
      const r = await pg.evalp(`(()=>{const out={};
        const SIGS={oathblade:[['mud'],'channel'],oathmaul:[['vine','snare'],'timber'],oathlance:[['plate'],'rust'],oathmage:[['plate','snuff'],null]};
        for(const t of ['oathblade','oathmaul','oathlance','oathmage']){const P=__arena('knight');BK.god=true;
          BK.props().push({t:'minerlamp',x:P.x+150,y:P.y,lit:true,hitCd:0});
          const e=__knight(t,40,{sig:SIGS[t][0],twist:SIGS[t][1]});const starts=[];let last=null;
          for(let i=0;i<60*40;i++){P.hp=P.maxHp;P.inv=0;if(i===900)e.hp=Math.round(e.hp0*0.45);if((t==='oathlance'||t==='oathmage')&&i===300)e.okPlate=1;
            if(i%150===75){const far=[24,70,130,190][(i/150|0)%4];P.x=e.x-far;P.vx=0;}
            BK.sim(1);if(e.mode!==last&&/Tell$/.test(e.mode||''))starts.push(e.mode);last=e.mode;}
          out[t]={starts:[...new Set(starts)],told:BK.order().stats.told.filter(s=>s.t===t).map(s=>[s.mode,s.mark,s.col,s.word,s.sound])};}
        return out;})()`);
      const want = { oathblade: ['cutTell', 'lungeTell', 'mudTell', 'shoveTell'], oathmaul: ['slamTell', 'sweepTell', 'vineTell', 'snareTell', 'timberTell'], oathlance: ['thrustTell', 'chargeTell', 'rustTell'], oathmage: ['bladeTell', 'castTell', 'snuffTell'] };
      for (const [t, w] of Object.entries(want)) {
        const got = r[t]; console.log('  ' + t + ': ' + got.starts.join(' '));
        ok(w.every(m => got.starts.includes(m)), t + ': uses every move he has (' + w.join(', ') + ')');
        for (const [mode, mark, col, word, sound] of got.told) assert(mark === OC.ORDER_MARKS[mode] && (!mark || col === (mark === '!!' ? '#ff6b6b' : '#ffd36b')) && word && sound, t + ' ' + mode + ' told ' + mark + ' ' + col + ' ' + word + ' ' + sound);
        ok(got.told.length >= w.length, t + ': every one of his ' + got.told.length + ' windups TOLD - the mark the table names in its colour, a word, a sound');
      }
      /* one windup at a time: two knights side by side, a hero between them */
      const o = await pg.evalp(`(()=>{const P=__arena('knight');BK.god=true;const a=__knight('oathblade',30),b=__knight('oathmaul',-30);b.face=1;const starts=[];let la=null,lb=null;
        for(let i=0;i<60*20;i++){P.hp=P.maxHp;P.x=(a.x+b.x)/2;BK.sim(1);for(const [e,k] of [[a,'a'],[b,'b']]){const m=e.mode;if(/Tell$/.test(m||'')&&m!==(k==='a'?la:lb))starts.push(BK.time);if(k==='a')la=m;else lb=m;}}
        starts.sort((x,y)=>x-y);let close=0;for(let i=1;i<starts.length;i++)if(starts[i]-starts[i-1]<0.45)close++;return {n:starts.length,close};})()`);
      ok(o.n >= 6 && o.close === 0, 'one windup at a time: two knights over one hero started ' + o.n + ' windups, none within 0.45 s of another');
    }
    if (WANT.includes('bodies')) {
      console.log('bodies');
      const r = await pg.evalp(`(()=>{const o={};const C=BK.combat2();
        { const P=__arena('knight');const e=__knight('oathblade',30);e.elT=99;BK.sim(2);P.x=e.x;P.y=e.y-70;P.vy=0;let hp0=e.hp;for(let i=0;i<14;i++){P.x=e.x;P.y=e.y-70;P.vy=0;BK.sim(1);} o.raHigh=e.raHigh;
          P.x=e.x;P.y=e.y-e.h-6;P.plunge=true;P.vy=260;P.ground=false;let words=[];for(let i=0;i<10;i++){BK.sim(1);} o.bladeHp=hp0-e.hp;o.bounced=P.vy<0||!P.plunge;o.turned=e.raTurned||0; }
        { const P=__arena('knight');BK.god=true;const e=__knight('oathlance',30);e.elT=99;BK.sim(2);let saw=null;for(let i=0;i<40;i++){P.x=e.x+2;P.y=e.y-60;P.vy=0;P.ground=false;BK.sim(1);if(e.aa)saw=saw||e.aa;} o.antiAir=saw; }
        { const P=__arena('knight');BK.god=true;const e=__knight('oathmaul',30);e.elT=99;BK.sim(2);let saw=null;for(let i=0;i<50;i++){P.x=e.x-14;P.y=e.y-20;P.vy=0;P.ground=false;BK.sim(1);if(e.ct)saw=saw||e.ct;if(e.ctN)break;} o.catch=saw;o.caught=e.ctN||0; }
        for (const [k,t,af] of [['mau','oathmaul',null],['uns','brute','UNSTOPPABLE'],['plain','brute',null]]) { const P=__arena('knight');const e=__knight(t,24);e.affix=af;e.elT=99;e.face=-1;BK.sim(1);P.x=e.x-20;C.strike(e,'heavy',30);o[k+'Knock']=+(e.knock||0).toFixed(2);e.knock=0;e.broken=1.5;e.ekOpenT=1.5;e.brokeAt=BK.time-1;e.stagger=0;C.strike(e,'heavy',30);o[k+'KnockBroken']=+(e.knock||0).toFixed(2); }
        { const P=__arena('knight');const e=__knight('oathlance',24,{sig:['plate']});e.elT=99;BK.sim(1);P.x=e.x-20;const h0=e.hp;C.strike(e,'light',10);o.oreLight=h0-e.hp;o.orePlate1=e.okPlate;const h1=e.hp;C.strike(e,'heavy',10);o.oreHeavy=h1-e.hp;o.orePlate2=e.okPlate; }
        { const P=__arena('knight');BK.god=true;const e=__knight('oathmage',90);e.elT=0;let cast=false;for(let i=0;i<240&&!cast;i++){P.x=e.x-110;BK.sim(1);if(e.mode==='castTell')cast=true;} o.castTell=cast;const h0=e.hp;BK.sim(4);e.ekStunT=0;P.x=e.x+20;e.ekSide=-1;C.strike(e,'light',8);let im=null;for(let i=0;i<60&&!im;i++){BK.sim(1);if(e.mode==='castBroken')im=e.mode;}o.interrupted=im||e.mode;o.mageHit=h0-e.hp;
          const f=__knight('oathmage',60);f.elT=99;f.face=-1;f.ekSide=-1;BK.sim(1);P.x=f.x-30;const h2=f.hp;C.strike(f,'shot',8);o.wardFront=h2-f.hp;P.x=f.x+30;const h3=f.hp;C.strike(f,'shot',8);o.wardBack=h3-f.hp; }
        return o;})()`);
      console.log('  ' + JSON.stringify(r));
      ok(r.raHigh >= 1 && r.bladeHp === 0 && r.turned >= 1, 'THE DUELIST GUARDS HIGH: his shield up with a hero over him, a plunge turned, no damage (rule a)');
      ok(r.antiAir === 'tell', 'THE LANCER: a hero over him -> the told upward thrust (rule b)');
      ok(r.catch === 'tell' && r.caught >= 1, 'THE BRUTE: a hero in the air before him -> the told CATCH, and he throws (rule d)');
      ok(r.mauKnock === 0 && r.plainKnock > 0 && r.mauKnock === r.unsKnock && r.mauKnockBroken === r.unsKnockBroken, 'THE BRUTE stands like an UNSTOPPABLE elite: a heavy that throws a plain elite brute (' + r.plainKnock + ') does not move him, broken or not as the affix (' + r.mauKnockBroken + '/' + r.unsKnockBroken + ')');
      ok(r.oreLight === 0 && r.orePlate1 === 2 && r.oreHeavy > 0 && r.orePlate2 === 1, 'THE ORE: a light cut is turned (ORE), a heavy cracks a plate and goes in');
      ok(r.castTell && r.interrupted === 'castBroken' && r.mageHit > 0, 'THE BATTLE MAGE: struck in his cast he is INTERRUPTED (his opening)');
      ok(r.wardFront === 0 && r.wardBack > 0, 'THE BATTLE MAGE: a shot off his front is WARDED, from behind it lands');
    }
    if (WANT.includes('twists')) {
      console.log('twists');
      const r = await pg.evalp(`(()=>{const o={};
        { const P=__arena('knight');BK.god=true;const e=__knight('oathmaul',40,{twist:'timber'});e.hp=Math.round(e.hp0*0.45);let felled=false,stuck=false;
          for(let i=0;i<60*12&&!stuck;i++){P.hp=P.maxHp;if(!felled){P.x=e.x-60;}else{const L0=e.okFx.log;P.x=(L0.f<0?L0.x0-14:L0.x1+14);}BK.sim(1);if(e.okFx.log)felled=true;if(e.mode==='woodStuck')stuck=true;}
          o.felled=felled;o.stuck=stuck; }
        { const P=__arena('knight');const e=__knight('oathblade',28,{twist:'channel'});e.elT=0;let x0=null,pushed=0;for(let i=0;i<240;i++){P.hp=P.maxHp;if(x0===null)P.x=e.x-24;BK.sim(1);if(e.mode==='shove'&&x0===null)x0=P.x;if(x0!==null&&e.mode!=='shove'&&e.mode!=='shoveTell'){BK.sim(20);pushed=x0-P.x;break;}} o.shoveLast=e.okLast;o.pushed=Math.round(pushed);o.shoveHp=P.maxHp-P.hp; }
        { const P=__arena('knight');const e=__knight('oathlance',60,{twist:'rust'});e.elT=0;const hp0=P.hp;let fired=false;for(let i=0;i<200;i++){P.x=e.x-60;P.vx=0;BK.sim(1);if(e.mode==='rust'||e.mode==='rustRec'){fired=true;BK.sim(2);break;}} o.rust=fired;o.rustDmg=hp0-P.hp; }
        return o;})()`);
      console.log('  ' + JSON.stringify(r));
      ok(r.felled && r.stuck, 'WOOD - TIMBER: roused, he fells the pine; a swing across the trunk STICKS IN WOOD');
      ok(r.shoveLast === 'shove' && r.pushed > 20, 'MARSH - THE SHOVE drives the hero back toward the channel (' + r.pushed + ' px)');
      ok(r.rust && r.rustDmg > 0, 'THE ORE ROAD - RUST: the patch under the hero gives (' + r.rustDmg + ' hp)');
    }
    if (WANT.includes('levels')) {
      console.log('levels');
      for (const id of Object.keys(OC.ORDER_AT)) {
        const o = OC.ORDER_AT[id];
        const r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.setHero('knight');BK.reset({fresh:true});
          BK.load(LEVELS.findIndex(l=>l.id==='${id}'));BK.state='play';BK.god=true;BK.sim(3);const e=BK.enemies().find(q=>q.t==='${o.body}'&&q.elite);if(!e)return {none:true};
          const G=e.G, shut=(e.shut||[]).length, set=BK.SPR[e.cnSkin];BK.tp(Math.round(e.x/16)-4,Math.round(e.y/16)-1);BK.sim(2);BK.look(Math.round(e.x/16),Math.round(e.y/16)-1);BK.step(1);const drawn=e.lastSet===set;
          const n0=BK.corpses().length;e.hp=1;BK.combat2().strike(e,'heavy',1);BK.sim(8);BK.step(4);const c=BK.corpses().slice(n0).find(q=>q.t===e.t)||BK.corpses().slice(n0)[0];
          return {skin:e.cnSkin,name:e.eliteName,affix:e.affix,chapter:e.okChapter,twist:e.okTwist,gate:G&&G.col,shut,drawn,dead:!e.alive,lifted:(e.shut||[]).length===0,corpse:c?(c.shown===set?'skin':c.shown===BK.SPR[e.t]?'BASE':'other'):'none'};})()`);
        console.log('  ' + id + ' ' + JSON.stringify(r));
        ok(!r.none && r.skin === OC.skinOf(o.body, o.chapter) && r.name === o.name && r.chapter === o.chapter && r.twist === o.twist && (r.affix || null) === o.affix, id + ': ' + o.name + ' stands in his chapter (' + r.skin + ', ' + r.twist + ', ' + r.affix + ')');
        ok(r.gate === o.gate && r.shut > 0 && r.drawn, id + ': he holds gate ' + o.gate + ' shut, drawn in his chapter skin');
        ok(r.dead && r.lifted && r.corpse === 'skin', id + ': he falls, the gate lifts, and he dies in his chapter skin');
      }
    }
    ok(!(pg.errors && pg.errors.length), 'no page errors' + (pg.errors && pg.errors.length ? ': ' + pg.errors.slice(0, 3).join(' | ') : ''));
  } finally { await pg.close(); }
}
console.log('\n' + n + ' checks: the order holds.');
