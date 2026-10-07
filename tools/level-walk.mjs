/* tools/level-walk.mjs - THE CAMPAIGN-LEVEL LEVEL WALKER (claude/walker, Daniel 10-07: "levels are still incredibly easy"; scratch/audit-healing.md sec.2).
   The level-1 pilot (tools/level1-pilot.mjs) walks a level with a FRESH SAVE (level 0, no skills, no gear, no tonics) and LIFTS the bot past
   what it cannot work. A player arrives with the campaign behind him. This plays a whole level as that player:
   - THE HERO AT THE LEVEL'S CAMPAIGN LEVEL (tools/boss-level.mjs campaignLevel, the same formula the boss standard uses) WITH A TYPICAL BUILD:
     src/bot-profile.js typicalWalkCard (typicalCard + the L5-20 small perks + his own perk), his best damaging skills in the slots his level
     has (TYPICAL_SKILLS, as the boss rates' 'built' way), the smith's gear of every wood beaten before this one (BK.UPGRADES `needs` on the gate
     chain; the unlocked basics from depth 2), the tonics a player carries (1 / 3 / 5 by depth) and a charm (HEART CHARM from depth 4).
   - THE HUMAN PROFILE'S EYES ON EVERY FOE, AS A FIRST RUN (src/lab-perceive.js makePerception with no boss; profile human+first: drawn tells
     read a reaction late, misreads - a tell seen fewer than twice at the first-attempt rate - greed, nothing off the screen), the play bot's hands
     (src/playtest.js makeBot) with a player's additions here (aim along the route's floor, the jump up to the next route node from its take-off,
     ropes, steering a fall onto a lily pad, swimming to the route's depth, a locked room is a fight, the level's machines and the ferryman),
     and the lab's skill hands aimed at the foe in the way.
   - HEALING AS A PLAYER: ONE HOOK (drinkJs) - under 35% health with a flask or tonic held it drinks: BK.drinkFlask() when the game has it (the
     SURVIVAL lane's manual flask), else a press of BK.flaskKey; today the RED TONIC drinks itself (under 25%, main.js damagePlayer) and the hook
     leaves it to the game. Drinks are counted by the held count going down, whichever path drank.
   - NO LIFTS INSIDE A SECTION (start or shrine -> next shrine): a route node it cannot get past in --stuck frames makes that section STUCK - the
     spot is reported and the section is NOT MEASURED (no arrival, no hp, not in the coverage). He then starts again at the next shrine on the route
     as a respawn there would (full health), so the sections after it are still read; --strict ends the run at the first STUCK instead. A death is
     the game's own (die(): the checkpoint, full health, the death-cost bundle) and the walk picks up at the route node nearest the shrine he woke
     at. It stops at a mini's door and the boss arena (both measured by tools/boss-rates.mjs) or the gate.
   PER RUN: deaths, hp% on arrival at each checkpoint (the frame BEFORE the shrine's touch), per section (start or shrine -> next shrine) hp lost
   (% of max, gross), healing used (drinks + small heals: hearts, kill heals), deaths, hits, kills; time; stuck spots; the share of the route measured. TARGETS (brief-levelsweep v2):
   a first run = 1-2 deaths; arrive at each checkpoint under ~50% health.
     PORT=8708 node tools/level-walk.mjs <id>[,<id>..] [--heroes=knight,warden,pyro] [--seeds=2] [--frames=36000] [--stuck=1500] [--deaths=8]
        [--jobs=1] [--profile=human+first|human|none] [--level=N] [--tonics=N] [--charm=heart|iron|none] [--json=out.json] [--strict]
        [--trace=x0-x1] (a frame log while the hero is between those columns)
   A measuring tool, not a gate (tools/level-walk-selftest.mjs is the check: it runs and reports). */
import { writeFileSync } from 'node:fs';
import { LEVELS } from '../src/level.js';
import { depthsOf, gateOf } from '../src/campaign-order.js';
import { pacing } from './pacing.mjs';
import { campaignLevel, levelOverride } from './boss-level.mjs';
import { openRetry } from './boss-run.mjs';
const DEPTH = depthsOf(LEVELS), BYID = Object.fromEntries(LEVELS.map(l => [l.id, l]));
export const TARGET = { deathsLo: 1, deathsHi: 2, arriveHp: 50 };
/* the woods beaten before id (its ancestors on the gate chain) */
export function beatenBefore(id) { const out = []; let p = gateOf(BYID[id]); while (p && !out.includes(p)) { out.push(p); p = gateOf(BYID[p]); } return out; }
export const tonicsAt = d => d <= 1 ? 1 : d < 8 ? 3 : 5;
export const charmAt = d => d >= 4 ? 'heart' : null;
/* THE ROUTE: tools/pacing.mjs's main route (the reach fill's movement graph, start to gate), every node: [x, y] = the column and the BODY row (feet at (y+1)*16) */
export const routeOf = lv => pacing(lv).route.map(([x, y]) => [x, y]);
export function walkCfg(id, hero, seed, o = {}) {
  const lv = BYID[id]; if (!lv) throw Error('no such level ' + id);
  const d = DEPTH[id] ?? 1, lvl = o.level ?? campaignLevel(id), route = routeOf(lv);
  return { id, hero, seed, lvl, depth: d, beaten: beatenBefore(id), tonics: o.tonics ?? tonicsAt(d), charm: o.charm === undefined ? charmAt(d) : o.charm,
    profile: o.profile ?? 'human+first', strict: !!o.strict, trace: o.trace || null, coins: o.coins ?? 60 * d, skills: o.skills ?? true, frames: o.frames ?? 36000, stuck: o.stuck ?? 1500, deathCap: o.deaths ?? 8, route };
}
/* THE DRINK HOOK (page side): one place, so the walker keeps working when the manual flask lands */
export const drinkJs = `const heldNow=()=>{try{if(typeof BK.flasks==='function')return +BK.flasks()||0;const PG=BKT.PROG;return +(PG.flasks??PG.tonics??0)||0;}catch{return 0;}};
  let drinkCd=0;const drinkHook=()=>{const p=BK.P;drinkCd=Math.max(0,drinkCd-1);if(!p||p.dead>0||p.hp<=0||p.hp>=p.maxHp*0.35||heldNow()<=0||drinkCd>0)return;
    if(typeof BK.drinkFlask==='function'){BK.drinkFlask();drinkCd=45;}else if(BK.flaskKey){BK.press(BK.flaskKey);drinkCd=45;}};`;
export function walkJs(c) { return `(async()=>{const c=${JSON.stringify(c)},h=c.hero,lvl=c.lvl,TS=16;BK.manualSimulation=true;
  const B=await import('/src/bot-profile.js'),PR=await import('/src/progression.js'),{makeBot}=await import('/src/playtest.js'),PC=await import('/src/lab-perceive.js'),{mulberry}=await import('/src/px.js'),{LEVELS}=await import('/src/level.js');
  const P0=BKT.PROG;BKT.setHeroLevel(h,lvl);P0.skillOwned=P0.skillOwned||{};P0.loadouts=P0.loadouts||{};P0.skillOwned[h]={};P0.loadouts[h]=[];if(P0.talents)P0.talents[h]={};
  P0.card[h]=B.typicalWalkCard(h,lvl,n=>(PR.heroPerkAt(h,n)||{}).id);
  const kit=(B.TYPICAL_SKILLS[h]||[]).filter(id=>{const n=PR.skillFor(h,id);return n&&n.active&&n.level<=lvl;}).slice(0,PR.slotsAt(lvl));for(const id of kit)P0.skillOwned[h][id]=true;P0.loadouts[h]=kit.slice();
  P0.items=P0.items||{};for(const u of BK.UPGRADES){if(u.consumable)continue;P0.items[u.id]=u.needs?c.beaten.includes(u.needs):c.depth>=2;}
  P0.charmOf=P0.charmOf||{};P0.charm=c.charm||null;P0.charmOf[h]=c.charm||null;
  BK.setHero(h);BK.reset({fresh:true});P0.tonics=c.tonics;P0.coins=c.coins;BK.applyUpgrades();
  const seedOf=s=>{let x=2166136261;for(let i=0;i<s.length;i++)x=Math.imul(x^s.charCodeAt(i),16777619);return x>>>0;};
  const rnd0=Math.random;Math.random=mulberry(seedOf('walk|'+c.id+'|'+h+'|'+c.seed));
  try{
  BK.load(LEVELS.findIndex(l=>l.id===c.id));BK.state='play';BK.start();BK.god=false;BK.reset();P0.tonics=c.tonics;
  const gear=Object.keys(P0.items).filter(k=>P0.items[k]),maxHp0=BK.P.maxHp,R=c.route,G=BK.L.grid,GW=BK.L.W;
  ${drinkJs}
  const prof=c.profile&&c.profile!=='none'?B.profileOf(c.profile):null,perc=prof&&prof.perceive?PC.makePerception(BK,prof,c.id+'|'+h+'|'+c.seed,null,{}):null;
  let cur=null;const tgt=new Proxy({},{get:(_,k)=>cur?cur[k]:(k==='alive'?false:undefined)});
  const SKH=kit.length&&c.skills?PC.makeSkillHands(BK,tgt,h,B.SKILL_RANGE,24,true):null;
  const skip=new Set(['folk','fisher','bale','dummy','sheep']);
  const pickTarget=(gx)=>{const p=BK.P,dir=Math.sign(gx-p.x);let best=null,bd=1e9;for(const e of BK.enemies()){if(!e||!e.alive||e.harmless||e.dying>0||skip.has(e.t))continue;const dx=e.x-p.x,d=Math.abs(dx);if(Math.abs(e.y-p.y)>48||d>170)continue;if(d>40&&dir&&Math.sign(dx)!==dir)continue;if(d<bd){bd=d;best=e;}}return best;};
  const feet=k=>(R[k][1]+1)*TS,cxR=k=>R[k][0]*TS+8,dist=k=>Math.abs(cxR(k)-BK.P.x)+2*Math.abs(feet(k)-BK.P.y);
  /* WHERE ON THE ROUTE AM I: the nearest node a little behind to well ahead; a door or a warp (nothing near) looks down the whole route */
  const nearest=(lo,hi)=>{let bi=lo,bd=1e9;for(let k=Math.max(0,lo);k<Math.min(R.length,hi);k++){const d=dist(k);if(d<bd){bd=d;bi=k;}}return [bi,bd];};
  const track=()=>{let [bi,bd]=nearest(ri-8,ri+48);if(bd>6*TS){const [b2,d2]=nearest(ri+48,R.length);if(d2<bd)bi=b2;}ri=bi;if(ri>riSince){riSince=ri;lastProg=frames;}if(ri>riBest)riBest=ri;};
  /* A LOCKED ROOM IS A FIGHT (an ambush or an elite shuts the portcullis until its foes are down): the hands only fight what stands in the way and write a foe off after 4 s, so they waited at the bars forever. Not getting on for 1.5 s with a foe near: go and kill it, and never write it off */
  const huntNo=new Map();let huntE=null,huntT=0,huntHp=0;
  const huntOf=()=>{const p=BK.P;if(!p.ground&&!p.swim&&!p.climb)return huntE&&huntE.alive?huntE:null;   /* (a hunt starts from his feet: in a jump's arc a man on a roof overhead is not in the way) */
    let best=null,bd=1e9;for(const e of BK.enemies()){if(!e||!e.alive||e.harmless||e.dying>0||skip.has(e.t)||e.mode==='sleep'||(huntNo.get(e)||0)>frames)continue;   /* (a sleeping man is not in the way: a player walks past him) */const dx=Math.abs(e.x-p.x),dy=Math.abs(e.y-p.y);if(dx>12*TS||dy>5*TS)continue;const lo=Math.min(e.x,p.x),hi=Math.max(e.x,p.x);if((BK.L.pools||[]).some(q=>!q.shallow&&!q.swim&&!q.dry&&(q.fire||!BK.L.waterHurts)&&q.x1>lo&&q.x0<hi&&Math.abs(q.y-p.y)<3*TS))continue;   /* never across a pit that kills */
    const d=dx+3*dy;if(d<bd){bd=d;best=e;}}
    /* one he cannot hurt (a shell, a perch): 6 s with its health not moving, and he tries another for 10 s */
    if(best!==huntE){huntE=best;huntT=0;huntHp=best?best.hp:0;}else if(best){huntT++;if(best.hp<huntHp){huntHp=best.hp;huntT=0;lastProg=frames;}if(huntT>360){huntNo.set(best,frames+600);huntE=null;}}return best;};
  /* THE LEVEL'S MACHINES (a crank that drops a palisade, a sluice that fills a basin, a lever, a winch): a player works the one by the way on.
     Ahead of a stretch of route the reach model could not follow (one step longer than 8 tiles), or when not getting on and no foe is near:
     the nearest unworked machine within 12 tiles - walk to it, face it, swing (and press TALK and UP for a lever or a winch); 8 s and he tries another */
  const MACH=/^(crank|sluice|lever|winch|wheel|bulkhead|tidegate|gplate)$/,workNo=new Map();let workE=null,workT=0;
  const workOf=()=>{const p=BK.P;let best=null,bd=1e9;for(const o of BK.props()){const fare=o&&o.t==='npc'&&o.kind==='ferryman'&&BK.movers().some(m=>m.ferry&&!m.paid&&!m.free&&m.toll);if(o&&o.raftCall){const m=BK.movers().find(q=>q.kind==='raft'&&q.callId===o.raftCall);if(!m||m.x<=m.x0+1||m.returning||m.called||m.moving)continue;}if(!o||(!fare&&(o.open||o.done||o.got||(!MACH.test(o.t)&&typeof o.hits!=='number')||o.t==='lantern'||o.t==='npc'))||(workNo.get(o)||0)>frames)continue;const dx=Math.abs(o.x-p.x),dy=Math.abs(o.y-p.y);if(dx>12*TS||dy>6*TS)continue;const d=dx+2*dy;if(d<bd){bd=d;best=o;}}
    if(best!==workE){workE=best;workT=0;}else if(best&&++workT>480){workNo.set(best,frames+1800);workE=null;return null;}return best;};
  /* A LEVEL'S OWN LOCKS (BK.walkHint, when the level has one: the Ksar's great gong and winch, its keg chain, its bridge gong, its tower door): the level says where a player goes and what he presses there - stood at it, he faces it and presses */
  const hintHands=h=>{const p=BK.P,dx=h.x-p.x;if(Math.abs(dx)<10&&Math.abs(h.y-p.y)<28&&p.ground){BK.keys.left=BK.keys.right=false;p.face=h.face||Math.sign(dx)||p.face;if(h.key&&frames%12===0&&!(h.key==='atk'&&p.atk>=0))BK.press(h.key);}};
  const bridgeAhead=()=>{for(let k=ri;k<Math.min(R.length-1,ri+6);k++)if(Math.abs(R[k+1][0]-R[k][0])+Math.abs(R[k+1][1]-R[k][1])>8)return true;return false;};
  const workHands=o=>{const p=BK.P,dx=o.x-p.x;if(Math.abs(dx)<12&&Math.abs(o.y-p.y)<28){BK.keys.left=BK.keys.right=false;p.face=Math.sign(dx)||p.face;if(p.atk<0&&frames%10===0)BK.press('atk');if((o.raftCall||o.t==='npc'||!/crank|sluice/.test(o.t))&&frames%20===0){BK.press('talk');BK.keys.up=true;}}};
  /* UP IS A JUMP A PLAYER TAKES (the hands jump only at a wall or a hole, so a stair of ledges over the floor was walked under: the pilot lifted it).
     The next route node 1.5-6.5 tiles above him, within 2.5 tiles across: a full jump, steered onto it. Not at a rope or a vine (the hands climb those). */
  let climb=null,climbHold=0,climbAir=false,climbT=0;
  const climbAssist=()=>{const p=BK.P;if(rope!==null){ropeT++;if(p.y<=feet(rope)+2||ropeT>420||p.dead>0||p.swim){rope=null;}else{BK.keys.up=true;BK.keys.down=false;if(p.climb){BK.keys.left=BK.keys.right=false;}return;}}
    if(ropeUp!==null){rope=ropeUp;ropeUp=null;ropeT=0;BK.keys.up=true;BK.keys.left=BK.keys.right=false;return;}
    if(climb!==null){climbT++;if(climbHold>0){BK.keys.jump=true;climbHold--;}if(!p.ground)climbAir=true;
      if((p.ground&&climbAir)||climbT>100||p.swim||p.climb||p.dead>0){climb=null;return;}const dx=cxR(climb)-p.x;BK.keys.left=dx<-3;BK.keys.right=dx>3;return;}
    if(upJump!==null){const k=upJump,dx=cxR(k)-p.x;upJump=null;climb=k;climbHold=26;climbAir=false;climbT=0;BK.press('jump');BK.keys.jump=true;BK.keys.left=dx<-3;BK.keys.right=dx>3;}};
  /* THE TAKE-OFF: the route node before the step up is where the reach model jumps from - walk there (the hands' goal), then jump (after the hands) */
  let upJump=null,ropeUp=null,rope=null,ropeT=0;const upPlan=()=>{const p=BK.P;if(climb!==null||rope!==null||!p.ground||p.swim||p.climb||p.dead>0)return null;
    for(let k=ri+1;k<Math.min(R.length,ri+14);k++){const up=p.y-feet(k);if(up<-2*TS)return null;if(up>=1.5*TS&&up<=6.5*TS){const t=G[R[k][1]*GW+R[k][0]];if(t===9||t===13){const rx=cxR(k);if(Math.abs(rx-p.x)<=6){ropeUp=k;return null;}return Math.abs(rx-p.x)<6*TS?rx:null;}   /* A ROPE OR A VINE UP: stand under it and climb (the hands only tried one after half a second of not getting on) */
        const tk=k-1>=ri?k-1:-1,tx=tk>=0&&Math.abs(feet(tk)-p.y)<=TS?cxR(tk):null;
        if(Math.abs(cxR(k)-p.x)<=1.5*TS||(tx!==null&&Math.abs(tx-p.x)<=6)){upJump=k;return null;}
        return tx!==null&&Math.abs(tx-p.x)<5*TS?tx:null;}}return null;};
  /* UNDER WATER THE ROUTE HAS A HEIGHT: the hands stroke for the surface and only duck when the floor ahead drops, so a culvert under a wall was never found. Swimming, he steers to the route node in both axes, and comes up for air when the breath runs low */
  const swimTo=k=>{const p=BK.P;if(!p.swim||p.dead>0)return;const br=p.breath===undefined?6:p.breath;if(br<2.5)return;const dy=feet(k)-p.y,dx=cxR(k)-p.x;BK.keys.down=dy>10;BK.keys.up=dy<-10;BK.keys.left=dx<-4;BK.keys.right=dx>4;};
  const litN=()=>BK.shrines().filter(s=>s.lit).length;
  const sec=()=>({lost:0,small:0,drinks:0,drinkHp:0,deaths:0,hits:0,kills:0,frames:0,lvup:0});
  const S=[sec()],arrivals=[];const deathLog=[],trace=[];const stucks=[];let miniHp=null,resumeTo=null,resumeAt=false,resumes=0,secStart=0;let ri=0,riBest=0,riSince=0,lastProg=0,frames=0,end='frames',stuck=null,deaths=0,levelups=0;
  const st0=BK.stats(),d00=st0.deaths,k00=st0.kills,hit00=BK.hitsTaken;let kPrev=k00,hPrev=hit00,dPrev=d00,wasDead=false;
  let bot=makeBot(BK),jumpX=null;
  /* A PLAYER STEERS HIS FALL ONTO A PAD (the hands only ever hold the way on, so a hop off one lily pad sailed past the next into the marsh): falling, with a floating pad or raft ahead of where the jump began and under him, he leans onto its middle */
  const steer=sd=>{const p=BK.P;if(p.ground||p.onMover){jumpX=p.x;return;}if(p.swim||p.climb||!(p.vy>0)||!sd)return;let best=null,bd=1e9;for(const m of BK.movers()){if(m.gone||(m.sink||0)>0.55||(m.kind!=='pad'&&m.kind!=='raft'))continue;const cx=m.x+(m.w||16)/2,dy=m.y-p.y,dx=cx-p.x;if(dy<-2||dy>5*TS||Math.abs(dx)>4*TS)continue;if(jumpX!==null&&(cx-jumpX)*sd<12)continue;if(Math.abs(dx)<bd){bd=Math.abs(dx);best=dx;}}if(best===null)return;BK.keys.left=best<-3;BK.keys.right=best>3;};
  while(frames<c.frames){
    if(BK.bossActive){end='boss';break;}
    if(BK.miniActive){end='mini';miniHp=Math.round(100*Math.max(0,BK.P.hp)/(BK.P.maxHp||100));break;}   /* THE MINI'S ROOM: the mini is measured by tools/boss-rates.mjs (row 'level:mini'); its walls hold him in, so the walk stops at its door (hp on arrival kept) */
    if(BK.state==='talk'){BK.press('confirm');BK.sim(1);frames++;continue;}   /* a word from somebody: read on */
    if(BK.state!=='play'){end=BK.state==='win'?'gate':'state:'+BK.state;break;}
    const p=BK.P;let gi=Math.min(R.length-1,ri+1);for(let k=gi+1;k<=Math.min(R.length-1,ri+3);k++){if(Math.abs(feet(k)-feet(gi))<2*TS&&Math.sign(R[k][0]-R[gi][0])===Math.sign(R[gi][0]*TS+8-p.x))gi=k;else break;}let wx=R[gi][0];   /* AIM ONE TO THREE NODES ON, along the same floor and the same way: the hands stop at their goal (a goal on a lily pad or a ledge lip is a stop in the water), and a goal further on, on a tall level, is on another floor */
    if(perc)perc.apply();
    try{const riding=p.onMover&&(p.onMover.moving||p.onMover.returning);if(riding)lastProg=frames;   /* ON A RIDE (a ferry, a raft, a lift): stand and let it carry him */
      const stall=!riding&&frames-lastProg>90,hunt=stall?huntOf():null,work=!riding&&!hunt&&(stall||bridgeAhead())?workOf():null;if(hunt){wx=(hunt.x-8)/TS;if(bot.skip)bot.skip.clear();}else if(work)wx=(work.x-8)/TS;else{const ux=upPlan();if(ux!==null)wx=(ux-8)/TS;}const lh0=!hunt&&!work&&typeof BK.walkHint==='function'?BK.walkHint():null,lh=lh0&&Math.abs(lh0.x-p.x)<(lh0.r||6)*TS&&Math.abs(lh0.y-p.y)<2*TS?lh0:null;   /* (a lock in reach: the level's hands; out of reach the route walks him there) */if(lh)wx=(lh.x-8)/TS;cur=pickTarget(wx*TS+8);bot(wx*TS+8);if(lh)hintHands(lh);else if(work)workHands(work);else climbAssist();swimTo(gi);steer(Math.sign(wx*TS+8-p.x));if(SKH&&cur)SKH.step();drinkHook();}finally{if(perc)perc.restore();}
    const h0=p.hp,mh0=p.maxHp||100,lit0=litN(),held0=heldNow(),hl0=BKT.heroLevel?BKT.heroLevel(h):0,dead0=p.dead>0||h0<=0,px0=p.x;
    BK.sim(1);frames++;if(perc)perc.update();
    const q=BK.P,cs=S[S.length-1],h1=q.hp;if(resumeTo){const rt=resumeTo;resumeTo=null;if(Math.abs(q.x-rt.x)>2*TS){stucks[stucks.length-1].locked=true;end='locked';break;}}   /* the restart did not take: walls hold him (an ambush or an arena still shut) */if(c.trace&&trace.length<(c.traceN||400)&&q.x/TS>=c.trace[0]&&q.x/TS<=c.trace[1]&&frames%3===0)trace.push(frames+':'+(q.x/TS).toFixed(1)+','+(q.y/TS).toFixed(1)+(q.onMover?'M'+(q.onMover.moving?'m':'')+(q.onMover.paid?'p':''):'')+(q.ground?'g':'')+(q.swim?'S':'')+(BK.keys.jump?'J':'')+(BK.keys.right?'>':'')+(BK.keys.left?'<':'')+(BK.keys.block?'B':'')+(q.atk>=0?'A':'')+(q.vx?'v'+Math.round(q.vx):'')+' r'+ri+'g'+wx+(climb!==null?'C':'')+' hp'+Math.round(h1));const mh=q.maxHp||mh0;cs.frames++;
    /* a tonic drunk on the frame of the blow nets out against it: the drink goes back on both sides (lost and healed) */
    const drank=Math.max(0,held0-heldNow()),dAmt=drank?drank*(typeof BK.drinkFlask==='function'?0.35*mh0:(PR.perkOn(P0,h,'tonic')?60:45)):0;
    if(h1-dAmt<h0)cs.lost+=(h0-Math.max(0,h1-dAmt))/mh0;
    const st=BK.stats();if(st.kills>kPrev){cs.kills+=st.kills-kPrev;kPrev=st.kills;}if(BK.hitsTaken>hPrev){cs.hits+=BK.hitsTaken-hPrev;hPrev=BK.hitsTaken;}
    if(st.deaths>dPrev){const K=q.killer;deathLog.push({at:[Math.floor(q.x/TS),Math.floor(q.y/TS)],ri,by:K?(typeof K==='string'?K:K.name||K.t||K.who||'?'):'?',sec:S.length-1});cs.deaths+=st.deaths-dPrev;deaths+=st.deaths-dPrev;dPrev=st.deaths;}
    const lit1=litN(),held1=heldNow(),hl1=BKT.heroLevel?BKT.heroLevel(h):0;
    if(lit1>lit0&&resumeAt){resumeAt=false;cs.end=ri;S.push({...sec(),resumed:true,start:ri});}
    else if(lit1>lit0){cs.end=ri;arrivals.push({i:arrivals.length+1,hp:Math.round(100*Math.max(0,h0)/mh0),x:Math.round(q.x/TS),frame:frames,deathsBefore:deaths,start:frames<120});S.push({...sec(),start:ri});}
    else if(held1<held0&&!dead0){cs.drinks+=held0-held1;cs.drinkHp+=Math.max(0,Math.min(dAmt,h1-Math.max(0,h1-dAmt<h0?h1-dAmt:h0)))/mh;}
    else if(h1>h0&&!dead0&&!(q.dead>0)){const g=(h1-Math.max(0,h0))/mh;
      if(hl1>hl0){cs.lvup++;levelups++;} else cs.small+=g;}
    /* woke at a shrine (or put back on the bank by deep water): the walk picks up from the route node nearest him, never past where it had got; fresh hands */
    if(dead0&&!(q.dead>0)&&q.hp>0){ri=nearest(0,riBest+1)[0];riSince=ri;lastProg=frames;bot=makeBot(BK);climb=null;}
    else if(!resumeAt&&!(q.dead>0)&&Math.abs(q.x-px0)>3*TS){ri=nearest(0,riBest+1)[0];riSince=ri;bot=makeBot(BK);climb=null;}
    if(!(q.dead>0)&&q.hp>0)track();
    if(ri>=R.length-2){end='route';break;}
    if(deaths>=c.deathCap){end='wall';break;}
    if(frames-lastProg>c.stuck&&!(q.dead>0)){const w=R[Math.min(riSince+1,R.length-1)];const stuck={ri:riSince,of:R.length,way:w,at:[Math.floor(q.x/TS),Math.floor(q.y/TS)],near:BK.enemies().filter(e=>e&&e.alive&&Math.abs(e.x-q.x)<96&&Math.abs(e.y-q.y)<64).map(e=>e.t+(e.mode?':'+e.mode:'')+'@'+(e.x/TS).toFixed(1)+','+(e.y/TS).toFixed(1)).slice(0,6),pst:Object.entries(q).filter(([k,v])=>(typeof v==='number'&&v!==0&&!/^(x|y|hp|maxHp|st|maxSt|face|hpShown|safe.*)$/.test(k))||(v===true)).map(([k,v])=>k+'='+(typeof v==='number'?Math.round(v*100)/100:v)).slice(0,40).join(' '),tiles:[-2,-1].map(dy=>{const ty=Math.floor(q.y/TS)+dy;let r='';for(let tx=Math.floor(q.x/TS)-3;tx<=Math.floor(q.x/TS)+4;tx++)r+=BK.L.grid[ty*BK.L.W+tx];return r;}).join('/'),props:BK.props().filter(o=>Math.abs(o.x-q.x)<64&&Math.abs(o.y-q.y)<48).map(o=>o.t).slice(0,6),sec:S.length-1};stucks.push(stuck);cs.stuck=true;
      /* NO LIFT THROUGH A SECTION: this one is STUCK and not measured. Unless --strict, he starts again at the NEXT SHRINE on the route, as a respawn there would (full health), so the sections after it are still read */
      let nx=null,ni=1e9;if(!c.strict)for(const sh of BK.shrines()){if(sh.lit)continue;let bi=-1,bd=1e9;for(let k=0;k<R.length;k++){const d=Math.abs(cxR(k)-sh.x)+Math.abs(feet(k)-sh.y);if(d<bd){bd=d;bi=k;}}if(bd<8*TS&&bi>riSince&&bi<ni){ni=bi;nx=sh;}}
      if(!nx){end='stuck';break;}
      q.onMover=null;q.x=nx.x;q.y=nx.y;q.vx=q.vy=0;q.hp=q.maxHp;resumeAt=true;resumeTo=nx;ri=ni;riSince=ni;if(ni>riBest)riBest=ni;lastProg=frames;bot=makeBot(BK);climb=null;rope=null;resumes++;continue;}
    if(frames%600===0)await new Promise(r=>setTimeout(r,0));
  }
  const r2=x=>Math.round(x*100);
  return {id:c.id,hero:h,seed:c.seed,lvl,depth:c.depth,maxHp:maxHp0,kit,gear,tonics:c.tonics,charm:c.charm,end,miniHp,deaths,levelups,frames,secs:Math.round(frames/60),
    kills:BK.stats().kills-k00,hits:BK.hitsTaken-hit00,walked:Math.round(100*riBest/R.length),stuck:stucks[0]||null,stucks,resumes,deathLog,trace:c.trace?trace:undefined,arrivals,shrines:BK.shrines().length,
    coverage:Math.round(100*S.reduce((a,s,i)=>a+(!s.stuck&&(s.end!==undefined||(i===S.length-1&&/route|boss|gate/.test(end)))?((s.end??ri)-(s.start||0)):0),0)/R.length),
    sections:S.map(s=>({stuck:!!s.stuck,resumed:!!s.resumed,lost:r2(s.lost),small:r2(s.small),drinks:s.drinks,drinkHp:r2(s.drinkHp),deaths:s.deaths,hits:s.hits,kills:s.kills,secs:Math.round(s.frames/60),lvup:s.lvup})),
    eyes:perc?perc.stats():null,casts:SKH?SKH.casts():null};
  }finally{Math.random=rnd0;}})()`; }
export async function runWalks(cfgs, { jobs = 1, onRow = null } = {}) {
  const queue = cfgs.slice(), out = [], pages = [await openRetry()];
  for (let i = 1; i < Math.min(jobs, cfgs.length); i++) pages.push(await openRetry());
  const worker = async i => { for (;;) { const c = queue.shift(); if (!c) return; let row;
    try { await pages[i].reload(); row = await pages[i].evalp(walkJs(c), 1800000); const errs = pages[i].errors.splice(0); if (errs.length) row.pageErrors = errs.slice(0, 3); }
    catch (e) { row = { id: c.id, hero: c.hero, seed: c.seed, err: String(e.message).slice(0, 160) }; try { pages[i].close(); } catch {} pages[i] = await openRetry(); }
    out.push(row); if (onRow) onRow(row, out); } };
  try { await Promise.all(pages.map((_, i) => worker(i))); } finally { for (const p of pages) try { p.close(); } catch {} }
  return out;
}
/* a death to the level itself (deep water, a fall, spikes, fire) and not to a foe: the hands' platforming is part of that count */
export const HAZARD = /^(A TRAP|THE FALL|DROWNED|THE FIRE|THE SPIKES|SPIKES|THE WATER|THE CRACK|BURNED)/;
const mean = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : null;
export const line = r => r.err ? r.id + ' ' + r.hero + ' s' + r.seed + ': ERR ' + r.err
  : r.id + ' ' + r.hero + ' s' + r.seed + ' L' + r.lvl + ' (' + r.maxHp + 'hp, ' + (r.kit.join('+') || 'no skills') + ', ' + r.tonics + ' tonics' + (r.charm ? ', ' + r.charm + ' charm' : '') + '): ' + r.end.toUpperCase()
    + ' ' + r.deaths + ' deaths, ' + r.secs + 's, ' + r.kills + ' kills, ' + r.hits + ' hits, walked ' + r.walked + '%, arrivals ' + (r.arrivals.map(a => a.hp + '%').join(' ') || '-')
    + ', measured ' + r.coverage + '% of the route' + (r.miniHp !== null && r.miniHp !== undefined ? ', AT THE MINI DOOR with ' + r.miniHp + '%' : '') + (r.stucks || []).map(st => '\n    STUCK (section #' + st.sec + ') at route node ' + st.ri + '/' + st.of + ' next tile ' + st.way.join(',') + ' (hero ' + st.at.join(',') + (st.near && st.near.length ? '; near ' + st.near.join(' ') : '') + (st.props && st.props.length ? '; props ' + st.props.join(' ') : '') + ')').join('')
    + '\n    sections: ' + r.sections.map((s, i) => '#' + i + (s.stuck ? ' STUCK' : '') + (s.resumed ? ' (resumed)' : '') + ' lost ' + s.lost + '% heal ' + (s.small + s.drinkHp) + '% (' + s.drinks + ' drinks) ' + s.deaths + 'd ' + s.hits + 'h ' + s.kills + 'k ' + s.secs + 's').join(' | ')
    + (r.deathLog && r.deathLog.length ? '\n    deaths: ' + r.deathLog.map(d => d.by + '@' + d.at.join(',')).join(' ') : '') + (r.pageErrors ? '\n    PAGE ERRORS ' + JSON.stringify(r.pageErrors) : '');
/* one row a level x hero: means over its seeds, read against the targets */
export function summarize(rows) {
  const by = {}; for (const r of rows) { if (r.err) continue; (by[r.id + '|' + r.hero] = by[r.id + '|' + r.hero] || []).push(r); }
  return Object.values(by).map(R => { const arr = R.flatMap(r => r.arrivals.filter(a => !a.start).map(a => a.hp)), d = mean(R.map(r => r.deaths)), a = mean(arr), lost = mean(R.flatMap(r => r.sections.slice(0, r.arrivals.length).map(s => s.lost)));
    const miss = []; if (d < TARGET.deathsLo) miss.push('deaths ' + d.toFixed(1) + ' < ' + TARGET.deathsLo); if (d > TARGET.deathsHi) miss.push('deaths ' + d.toFixed(1) + ' > ' + TARGET.deathsHi);
    if (a !== null && a >= TARGET.arriveHp) miss.push('arrive ' + Math.round(a) + '% >= ' + TARGET.arriveHp);
    return { id: R[0].id, hero: R[0].hero, lvl: R[0].lvl, runs: R.length, deaths: d, arriveMean: a, arriveMin: arr.length ? Math.min(...arr) : null, lostPerSection: lost,
      drinks: mean(R.map(r => r.sections.reduce((s, x) => s + x.drinks, 0))), kills: mean(R.map(r => r.kills)), secs: mean(R.map(r => r.secs)), walked: mean(R.map(r => r.walked)),
      coverage: mean(R.map(r => r.coverage)), stucks: R.flatMap(r => (r.stucks || []).map(st => st.way.join(','))), hazard: mean(R.map(r => (r.deathLog || []).filter(d => HAZARD.test(d.by)).length)), ends: R.map(r => r.end).join('/'), miss }; });
}
export const table = S => ['level'.padEnd(11) + 'hero'.padEnd(7) + 'L'.padStart(3) + ' runs  deaths(hazard)  arrive%(mean/min)  lost%/sec  drinks  kills  secs  walked  meas  end            vs target',
  ...S.map(s => s.id.padEnd(11) + s.hero.padEnd(7) + String(s.lvl).padStart(3) + String(s.runs).padStart(5) + (s.deaths.toFixed(1) + '(' + s.hazard.toFixed(1) + ')').padStart(16) + ((s.arriveMean === null ? '-' : Math.round(s.arriveMean)) + '/' + (s.arriveMin ?? '-')).padStart(19)
    + (s.lostPerSection === null ? '-' : Math.round(s.lostPerSection)).toString().padStart(11) + s.drinks.toFixed(1).padStart(8) + Math.round(s.kills).toString().padStart(7) + Math.round(s.secs).toString().padStart(6) + (Math.round(s.walked) + '%').padStart(8) + (Math.round(s.coverage) + '%').padStart(6) + '  ' + s.ends.padEnd(15)
    + (s.miss.length ? 'MISS: ' + s.miss.join(', ') : 'on target') + (s.stucks.length ? '  STUCK ' + [...new Set(s.stucks)].join(' ') : ''))].join('\n');

if (process.argv[1] && /level-walk\.mjs$/.test(process.argv[1])) {
  const args = process.argv.slice(2), opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
  const ids = args.filter(a => !a.startsWith('-')).flatMap(a => a.split(',')).filter(Boolean);
  if (!ids.length) { console.log('usage: PORT=8708 node tools/level-walk.mjs <id>[,<id>..] [--heroes=knight,warden,pyro] [--seeds=2] [--frames=36000] [--stuck=1500] [--jobs=1] [--json=out.json]'); process.exit(2); }
  const heroes = opt('heroes', 'knight,warden,pyro').split(','), seeds = +opt('seeds', 2), jobs = Math.max(1, +opt('jobs', 1)), OUT = opt('json', '');
  const o = { level: levelOverride() ?? undefined, frames: +opt('frames', 36000), stuck: +opt('stuck', 1500), deaths: +opt('deaths', 8), profile: opt('profile', 'human+first'), skills: opt('skills', '1') !== '0', strict: args.includes('--strict'), trace: opt('trace', '') ? opt('trace').split('-').map(Number) : null };
  if (opt('tonics', null) !== null) o.tonics = +opt('tonics'); if (opt('charm', null) !== null) o.charm = opt('charm') === 'none' ? null : opt('charm');
  const cfgs = []; for (const id of ids) for (const h of heroes) for (let s = 1; s <= seeds; s++) cfgs.push(walkCfg(id, h, s, o));
  const t0 = Date.now(), rows = await runWalks(cfgs, { jobs, onRow: (r, all) => { console.log(line(r)); if (r.trace) console.log('    trace: ' + r.trace.join(' ')); if (OUT) writeFileSync(OUT, JSON.stringify(all, null, 1)); } });
  console.log('\nLEVEL WALK  (campaign level, typical build, profile ' + o.profile + ', ' + rows.length + ' runs, ' + Math.round((Date.now() - t0) / 60000) + ' min)  target: ' + TARGET.deathsLo + '-' + TARGET.deathsHi + ' deaths a first run, arrive < ' + TARGET.arriveHp + '%');
  console.log(table(summarize(rows)));
  if (OUT) writeFileSync(OUT, JSON.stringify(rows, null, 1));
}
