// tools/dances.mjs — A DANCE PER HERO (dances lane, 2026-09-29). Every hero has a victory dance of his own: the knight's sword
// salute, the pyromancer's fire twirl, the freebooter's jig, the death knight's blade-plant and bow, the geomancer's stones round
// her staff, the warden's spear flourish and the paladin's maul raised to the light. It plays on the EMOTE key (H), after every
// boss as the arena opens, and on a long idle; it cancels on any move, and it must never hold a fight's end or the walk-out.
//   1. BAKED. Every hero in every skin has dance frames (R and L, and the white flash set), at least four different drawings,
//      and no two heroes have the same dance.
//   2. THE EMOTE KEY. H starts the hero's own dance (the draw picks the 'dance' key and walks its frames), and a step, a jump,
//      a swing or a blow ends it on the next frame. The controls list names the key.
//   3. AFTER A BOSS. Each hero kills a boss in a real arena; the fight ends as before (bossActive false), and the hero dances as
//      it opens. Nothing he does while dancing is held: a step ends it.
//   4. LONG IDLE. Half a minute of standing about in no danger is a couple of seconds of the dance, and it ends by itself.
//   5. CO-OP. The second player's key dances the SECOND player's hero, in his own frames, and not the first.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { openPage } from './cdp.mjs';
import { cardRows } from '../src/controls.js';

const HEROES = ['knight', 'pyro', 'pirate', 'reaper', 'warden', 'paladin', 'geomancer'];
const MAIN = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
assert.ok(cardRows({ hero: 'knight' }).some(r => r[0] === 'emote' && /^H: DANCE/.test(r[1])), 'the controls list does not name the emote key (H)');   /* (the card is built by src/controls.js since claude/storeui) */
const pg = await openPage({ audio: false, fonts: false });
try {
  /* 1. BAKED, in every skin */
  const baked = await pg.evalp(`(()=>{const rows=[],sig={};const sg=c=>c.toDataURL();
    for(const h of ${JSON.stringify(HEROES)})for(const sk of BKT.skinIds()){const s=BKT.heroSet(sk,undefined,false,h),R=s.R.dance,Lf=s.L.dance,Wf=s.white&&s.white.R.dance;
      const u=R?new Set(R.map(sg)).size:0;rows.push({h,sk,n:R?R.length:0,l:Lf?Lf.length:0,w:Wf?Wf.length:0,u});
      if(sk==='bracken')sig[h]=R?[...new Set(R.map(sg))].sort().join('|'):'';}
    const dup=Object.entries(sig).filter(([a,x])=>Object.entries(sig).some(([b,y])=>a<b&&x===y)).map(e=>e[0]);
    return {rows,dup,skins:BKT.skinIds().length};})()`);
  for (const r of baked.rows) {
    assert.ok(r.n >= 8, r.h + ' in ' + r.sk + ' has no dance (' + r.n + ' ticks)');
    assert.equal(r.l, r.n, r.h + ' in ' + r.sk + ': the left-facing dance is missing frames');
    assert.equal(r.w, r.n, r.h + ' in ' + r.sk + ': the white flash set has no dance');
    assert.ok(r.u >= 4, r.h + ' in ' + r.sk + ' dances in only ' + r.u + ' different drawings (want 4 or more)');
  }
  assert.deepEqual(baked.dup, [], 'these heroes have the same dance: ' + baked.dup.join(', '));
  console.log('ok  baked          ' + HEROES.length + ' heroes x ' + baked.skins + ' skins: every one has a dance of its own, R + L + white, at least 4 drawings');

  /* the flat floor every gameplay row stands on */
  await pg.evalp(`window.__flat=(hero)=>{BK.manualSimulation=true;BK.SET.speed=1;BK.coopEnd();BK.setHero(hero);BK.reset({fresh:true});BK.load(0);BK.state='play';
    BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');const L=BK.L;for(let x=2;x<40;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;
    BK.tp(10,21);BK.sim(120);const P=BK.P;P.hp=P.maxHp;P.inv=0;P.st=P.maxSt;P.face=1;for(const k of Object.keys(BK.keys))BK.keys[k]=false;return P;}`);

  /* 2. THE EMOTE KEY, and 4. THE LONG IDLE, per hero */
  for (const h of HEROES) {
    const r = await pg.evalp(`(()=>{const P=__flat('${h}');BK.step(2);const o={};
      BK.keys.dance=true;BK.sim(1);BK.keys.dance=false;BK.sim(1);o.started=P.dance>0;
      const seen=new Set(),keys=new Set();for(let i=0;i<40;i++){BK.step(1);seen.add(P.lastFrame);keys.add(P.lastKey);}o.frames=seen.size;o.drawnAs=[...keys].join(',');o.stillOn=P.dance>0;
      BK.keys.right=true;BK.sim(2);BK.keys.right=false;o.endedOnStep=!(P.dance>0);
      BK.sim(10);BK.keys.dance=true;BK.sim(1);BK.keys.dance=false;BK.sim(1);const on=P.dance>0;BK.keys.jump=true;BK.sim(2);BK.keys.jump=false;o.endedOnJump=on&&!(P.dance>0);
      BK.sim(90);BK.keys.dance=true;BK.sim(1);BK.keys.dance=false;BK.sim(1);const on2=P.dance>0;BK.keys.dance=true;BK.sim(1);BK.keys.dance=false;BK.sim(1);o.keyTogglesOff=on2&&!(P.dance>0);
      const P2=__flat('${h}');BK.sim(30);let idleAt=-1,endAt=-1;for(let i=0;i<60*40;i++){BK.sim(1);if(idleAt<0&&P2.dance>0)idleAt=i/60;if(idleAt>=0&&!(P2.dance>0)){endAt=i/60;break;}}
      o.idleAt=idleAt;o.idleLen=endAt-idleAt;return o;})()`);
    assert.ok(r.started, h + ': the emote key (H) does not start a dance');
    assert.ok(r.drawnAs.split(',').every(k => k === 'dance'), h + ': while dancing the draw chose ' + r.drawnAs + ', not the dance');
    assert.ok(r.frames >= 4, h + ': the dance walks only ' + r.frames + ' different frames in four seconds');
    assert.ok(r.stillOn, h + ': the key-started dance stopped by itself (it goes on until you stop it)');
    assert.ok(r.endedOnStep, h + ': a step does not end the dance');
    assert.ok(r.endedOnJump, h + ': a jump does not end the dance');
    assert.ok(r.keyTogglesOff, h + ': the emote key does not stop the dance again');
    assert.ok(r.idleAt > 25 && r.idleAt < 45, h + ': the long-idle dance came at ' + r.idleAt + ' s (want about 30)');
    assert.ok(r.idleLen > 1 && r.idleLen < 6, h + ': the idle dance lasted ' + r.idleLen + ' s (one turn, then it stops)');
  }
  console.log("ok  emote + idle   all 7: H starts the hero's own dance, a step or jump or H again ends it, and half a minute of standing about is a couple of seconds of it");

  /* 3. AFTER A BOSS: the first level's own boss, killed the way tools/boss-fight-end.mjs does it, by every hero */
  const bossRows = [];
  for (const h of HEROES) {
    const r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');
      const i=LEVELS.findIndex(lv=>{try{return !!lv.build().arena;}catch{return false;}});
      BK.manualSimulation=true;BK.coopEnd();BK.setHero('${h}');BK.reset({fresh:true});BK.load(i);BK.start();BK.god=true;BK.sim(10);BK.reset();
      const L=BK.L,A=L.arena,e=BK.enemies().find(q=>q.t===A.boss&&q.alive);if(!e)return {res:'NO BOSS'};
      for(const q of BK.enemies())if(q!==e&&!q.maxHp)q.alive=false;
      if(A.carpet){BK.board();BK.sim(30);}else{BK.tp(Math.round(A.trigger/16)+(A.reverse?-1:1),Math.round(A.floor/16)-1);BK.sim(200);}
      if(!BK.bossActive&&e.alive){BKT.hurtEnemy(e,1,e.x-10,false);BK.sim(120);}
      const started=BK.bossActive;let n=0,duringFight=false;
      for(const k of Object.keys(BK.keys))BK.keys[k]=false;
      for(;n<1000&&e.alive;n++){BK.P.inv=99;BK.P.hp=BK.P.maxHp;e.hp=Math.min(e.hp,1);e.inv=0;if(BK.P.dance>0)duringFight=true;BKT.hurtEnemy(e,999,BK.P.x+BK.P.face*8,true);BK.sim(1);}
      if(e.alive)return {res:'UNKILLABLE BY SCRIPT'};
      for(const k of Object.keys(BK.keys))BK.keys[k]=false;
      let f=0,dancedAt=-1,endedAt=-1;for(;f<300;f++){BK.P.inv=99;BK.sim(1);if(endedAt<0&&!BK.bossActive)endedAt=f;if(dancedAt<0&&BK.P.dance>0)dancedAt=f;if(BK.state!=='play'&&dancedAt>=0)break;}
      return {res:'ok',started,ended:endedAt>=0,dancedAt,duringFight,state:BK.state};})()`, 600000);
    bossRows.push(r);
    assert.equal(r.res, 'ok', h + ': ' + r.res + ' (this check cannot put the boss down, so it proves nothing)');
    assert.ok(r.started && r.ended, h + ': the boss fight did not start and end (started ' + r.started + ', ended ' + r.ended + ') - a dance must never hold a fight open');
    assert.ok(!r.duringFight, h + ': he danced DURING the fight');
    assert.ok(r.dancedAt >= 0, h + ': no dance after the boss fell (' + r.state + ')');
  }
  console.log('ok  after a boss   all 7 heroes dance as the arena opens (first at frame ' + bossRows.map(r => r.dancedAt).join('/') + ' after the kill) and every fight still ends');

  /* the walk-out: a dancing hero told to walk is walking at once, and nothing owes the dance a second */
  const walk = await pg.evalp(`(()=>{const P=__flat('knight');BK.step(2);BK.keys.dance=true;BK.sim(1);BK.keys.dance=false;BK.sim(3);const was=P.dance>0,x0=P.x;BK.keys.right=true;BK.sim(20);return {was,dx:P.x-x0,dancing:P.dance>0};})()`);
  assert.ok(walk.was && walk.dx > 20 && !walk.dancing, 'a dancing hero told to walk did not walk out at once (' + JSON.stringify(walk) + ')');

  /* 5. CO-OP: the second player's own key, his own hero */
  const co = await pg.evalp(`(()=>{const P0=__flat('knight');const heroes=BK.coopStart('warden',false);BK.sim(2);const [a,b]=BK.players();b.x=a.x+24;b.y=a.y;b.vx=b.vy=0;BK.sim(40);
    for(const p of [a,b]){p.hp=p.maxHp;}b.keys.dance=true;BK.sim(1);b.keys.dance=false;BK.sim(2);
    const o={heroes,aDance:a.dance>0,bDance:b.dance>0,bHero:b.hero};BK.coopEnd();return o;})()`);
  assert.deepEqual(co.heroes, ['knight', 'warden'], 'co-op did not start with two heroes: ' + co.heroes);
  assert.ok(co.bDance && !co.aDance, "co-op: player two's emote key should dance player two only (" + JSON.stringify(co) + ')');
  console.log("ok  co-op          player two's key danced player two's own " + co.bHero + ' and left player one standing');
  if (pg.errors.length) throw new Error(pg.errors.join('\n'));
} finally { pg.close(); }
console.log('ok  dances         seven heroes, one dance each: baked in every skin, on H, after every boss, on a long idle, and never in the way');
