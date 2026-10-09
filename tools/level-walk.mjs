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
        [--jobs=1] [--profile=human+first|human|none] [--level=N] [--tonics=N] [--charm=heart|iron|none] [--json=out.json] [--strict] [--subs=0 (no side trips for a key / escapes from a pit, claude/walkerctl)] [--reach-hero (the route in each hero's own legs, claude/reachcore)]
        [--trace=x0-x1] (a frame log while the hero is between those columns)
   V2 HANDS (claude/walkerhands):
   - AN ELITE IS A DUEL (src/walk-duel.js + src/lab.js labDuelFrame): the elite on his floor (footing all the way, a row and a bit) within 9 tiles ahead /
     4 behind is fought with the elite lab's own hands under the human gates, plus his READ - his guard by angle (a low blow goes under it; one cut short
     of the mash count he goes low), his riposte (shield it, or step out), his spines (out of their ring), his marks (off them); a common foe on top of
     him is cut first. 20 s without landing a blow, or 90 s in all, and the elite is written off for 30 s. The row's 'elite duels' line: won/lost, secs, hp.
     --duel=0: the old hands (makeBot's mash).
   - THE MINI HANDED OFF (--mini=0: stop at his door): his door hp kept (miniHp), he is put down the game's way (BKT.hurtEnemy: his wall and gate open, his
     XP paid), and the walk goes on; the section after his door is postMini (its arrival is left out of the means: it does not carry his fight).
   - A LEVEL'S VERBS: BK.walkHint() (the Ksar lane's hook, a level module's own) else src/walk-hints.js WALK_HINTS[level] (bot-side, same shape:
     { x, y feet, key, face, r, hold }): stood at x he faces it and presses key every 12 frames; hold = stand and wait. The glass sea's mirrors are taught there.
   - STAIRS: a climb over ~3.4 rows (more than a jump) is taken one footing at a time; A SLICK SLOPE before a gap: hold DOWN and leap at its foot; A SHUT
     LOCKGATE with its key in the open on his floor: the key first; a hunt (a locked room is a fight) only on his own floor; a level-up card is tapped through.
   V3 CONTROLS (claude/walkerctl, Daniel 10-09: Stormhold stuck on the walker's OWN controls, not the level) - src/walk-graph.js (the reach fill's edges + a Dijkstra) and:
   - A SIDE TRIP FOR A KEY (sub-route 'key'): a shut lockgate on the route whose key stands off the floor (a tower deck, behind nets): the graph gives route -> key ->
     back onto the route, walked node by node (each node reached within a tile and a row); the key first; once it is in his pack, straight back onto the route.
   - AN ESCAPE (sub-route 'escape'): 2.5 s off the route by more than four rows (a pit, a chimney slot): routed back onto it from where he stands.
   - NETS: up a net of any height, off it sideways (a jump clears ~2 rows; higher ledges: on up until within one), to the top rung; a foe on the top rung is jumped round.
   - A RUNNING LEAP between ledges (the zigzag one-way stair): walk back along the ledge for the run, leap at the tip with the run on, flown without the bot.
   - NO more: striking a kennel (drop) winch, hunting a foe behind him or on another floor, door-hunting on a level whose keys are off the floor, a stale 'climb the
     ledges' plan after an ambush wall lifts, a progress clock that a door loop could re-earn for ever (progress = a NEW best route node).
   --subs=0: no side trips/escapes. --nofoes=x0-x1 (remove the foes in those columns: read the footwork alone). --dk (trace the keys at three points of the hands).
   A measuring tool, not a gate (tools/level-walk-selftest.mjs is the check: it runs and reports; tools/walk-controls.mjs keeps the four moves taught). */
import { writeFileSync } from 'node:fs';
import { LEVELS } from '../src/level.js';
import { depthsOf, gateOf } from '../src/campaign-order.js';
import { pacing } from './pacing.mjs';
import { campaignLevel, levelOverride } from './boss-level.mjs';
import { openRetry } from './boss-run.mjs';
import { beatenBeforeIn, tonicsAt, charmAt } from '../src/campaign-kit.js';
const DEPTH = depthsOf(LEVELS), BYID = Object.fromEntries(LEVELS.map(l => [l.id, l]));
export const TARGET = { deathsLo: 1, deathsHi: 2, arriveHp: 50 };
/* the woods beaten before id (its ancestors on the gate chain) */
export const beatenBefore = id => beatenBeforeIn(LEVELS, id);   /* (src/campaign-kit.js: the same kit the playtest jump ?level=<id>&campaign=1 gives) */
export { tonicsAt, charmAt };
/* THE ROUTE: tools/pacing.mjs's main route (the reach fill's movement graph, start to gate), every node: [x, y] = the column and the BODY row (feet at (y+1)*16) */
export const routeOf = (lv, hero) => pacing(lv, { hero }).route.map(([x, y]) => [x, y]);   /* hero (claude/reachcore, --reach-hero): the route the hero's OWN legs reach (src/reachcore.js opts.hero); none = the shared fill, as before */
export function walkCfg(id, hero, seed, o = {}) {
  const lv = BYID[id]; if (!lv) throw Error('no such level ' + id);
  const d = DEPTH[id] ?? 1, lvl = o.level ?? campaignLevel(id), route = routeOf(lv, o.reachHero ? hero : undefined);
  return { id, hero, seed, lvl, depth: d, beaten: beatenBefore(id), tonics: o.tonics ?? tonicsAt(d), charm: o.charm === undefined ? charmAt(d) : o.charm,
    profile: o.profile ?? 'human+first', strict: !!o.strict, trace: o.trace || null, traceFrom: o.traceFrom || 0, traceN: o.traceN || 400, coins: o.coins ?? 60 * d, skills: o.skills ?? true, frames: o.frames ?? 36000, stuck: o.stuck ?? 1500, deathCap: o.deaths ?? 8, from: o.from ?? null, duel: o.duel ?? true, mini: o.mini ?? true, nofoes: o.nofoes || null, dk: !!o.dk, reachHero: !!o.reachHero, subs: o.subs ?? true, route };
}
/* THE DRINK HOOK (page side): one place, so the walker keeps working when the manual flask lands */
export const drinkJs = `const heldNow=()=>{try{if(typeof BK.flasks==='function')return +BK.flasks()||0;const PG=BKT.PROG;return +(PG.flasks??PG.tonics??0)||0;}catch{return 0;}};
  let drinkCd=0;const drinkHook=()=>{const p=BK.P;drinkCd=Math.max(0,drinkCd-1);if(!p||p.dead>0||p.hp<=0||p.hp>=p.maxHp*0.35||heldNow()<=0||drinkCd>0)return;
    if(typeof BK.drinkFlask==='function'){if(BK.drinkFlask())drinkCd=45;}else if(BK.flaskKey){BK.press(BK.flaskKey);drinkCd=45;}};`;
export function walkJs(c) { return `(async()=>{const c=${JSON.stringify(c)},h=c.hero,lvl=c.lvl,TS=16;BK.manualSimulation=true;
  const B=await import('/src/bot-profile.js'),PR=await import('/src/progression.js'),CK=await import('/src/campaign-kit.js'),{makeBot}=await import('/src/playtest.js'),PC=await import('/src/lab-perceive.js'),{mulberry}=await import('/src/px.js'),{LEVELS,T:TT}=await import('/src/level.js'),WH=await import('/src/walk-hints.js'),LD=await import('/src/lab.js'),WD=await import('/src/walk-duel.js'),FR=await import('/src/foe-react.js'),WG2=await import('/src/walk-graph.js');
  const GR=WG2.makeGraph(LEVELS.find(l=>l.id===c.id).build(),TT,{hero:c.reachHero?h:undefined});   /* (claude/walkerctl) the movement graph: side trips for a key and the way back from a pit */
  const P0=BKT.PROG,kit=CK.kitPre(BKT,BK,c);
  BK.setHero(h);BK.reset({fresh:true});CK.kitPost(BKT,BK,c);
  const seedOf=s=>{let x=2166136261;for(let i=0;i<s.length;i++)x=Math.imul(x^s.charCodeAt(i),16777619);return x>>>0;};
  const rnd0=Math.random;Math.random=mulberry(seedOf('walk|'+c.id+'|'+h+'|'+c.seed));
  try{
  BK.load(LEVELS.findIndex(l=>l.id===c.id));BK.state='play';BK.start();BK.god=false;BK.reset();P0.tonics=c.tonics;
  const gear=Object.keys(P0.items).filter(k=>P0.items[k]),maxHp0=BK.P.maxHp,G=BK.L.grid,GW=BK.L.W;let R=c.route;
  ${drinkJs}
  const prof=c.profile&&c.profile!=='none'?B.profileOf(c.profile):null,perc=prof&&prof.perceive?PC.makePerception(BK,prof,c.id+'|'+h+'|'+c.seed,null,{}):null;
  let cur=null;const tgt=new Proxy({},{get:(_,k)=>cur?cur[k]:(k==='alive'?false:undefined)});
  const SKH=kit.length&&c.skills?PC.makeSkillHands(BK,tgt,h,B.SKILL_RANGE,24,true):null;
  const skip=new Set(['folk','fisher','bale','dummy','sheep']);
  const pickTarget=(gx)=>{const p=BK.P,dir=Math.sign(gx-p.x);let best=null,bd=1e9;for(const e of BK.enemies()){if(!e||!e.alive||e.harmless||e.dying>0||skip.has(e.t))continue;const dx=e.x-p.x,d=Math.abs(dx);if(Math.abs(e.y-p.y)>48||d>170)continue;if(d>40&&dir&&Math.sign(dx)!==dir)continue;if(d<bd){bd=d;best=e;}}return best;};
  const feet=k=>(R[k][1]+1)*TS,cxR=k=>R[k][0]*TS+8,dist=k=>Math.abs(cxR(k)-BK.P.x)+2*Math.abs(feet(k)-BK.P.y);
  /* WHERE ON THE ROUTE AM I: the nearest node a little behind to well ahead; a door or a warp (nothing near) looks down the whole route */
  const nearest=(lo,hi)=>{let bi=lo,bd=1e9;for(let k=Math.max(0,lo);k<Math.min(R.length,hi);k++){const d=dist(k);if(d<bd){bd=d;bi=k;}}return [bi,bd];};
  const track=()=>{if(sub){const p=BK.P;let nr=ri;   /* (a sub-route is walked node by node, each one reached within a tile across and a row up or down: its end sits beside its start, so nearest-node tracking would skip it) */for(let k=ri+1;k<Math.min(R.length,ri+3);k++){if(Math.abs(cxR(k)-p.x)<=1.0*TS&&Math.abs(feet(k)-p.y)<=1.1*TS&&(p.ground||p.climb||p.onMover))nr=k;}if(sub.keyIdx>=0&&nr>sub.keyIdx&&!BK.props().some(q=>q.t==='key'&&q.got&&q.kind===sub.meta.key))nr=sub.keyIdx;ri=nr;if(ri>riSince){riSince=ri;lastProg=frames;}if(ri>riBest)riBest=ri;return;}   /* (a sub-route is followed node by node: its end sits beside its start) */let [bi,bd]=nearest(ri-8,ri+48);if(bd>6*TS){const [b2,d2]=nearest(ri+48,R.length);if(d2<bd)bi=b2;}ri=bi;if(ri>riSince){riSince=ri;if(ri>riMax){riMax=ri;lastProg=frames;}}   /* (progress is a NEW best node: a door loop - out of a house and back to the gate - lowers riSince on every teleport and so re-earned 'progress' for ever, and was never a STUCK) */if(ri>riBest)riBest=ri;};
  /* A LOCKED ROOM IS A FIGHT (an ambush or an elite shuts the portcullis until its foes are down): the hands only fight what stands in the way and write a foe off after 4 s, so they waited at the bars forever. Not getting on for 1.5 s with a foe near: go and kill it, and never write it off */
  const huntNo=new Map();let huntE=null,huntT=0,huntHp=0;
  const huntOf=()=>{const p=BK.P;let best=null,bd=1e9;for(const e of BK.enemies()){if(!e||!e.alive||e.harmless||e.dying>0||skip.has(e.t)||(huntNo.get(e)||0)>frames||(e.t==='eel'&&e.leap))continue;const dx=Math.abs(e.x-p.x),dy=Math.abs(e.y-p.y);if(dx>12*TS||dy>5*TS)continue;if(dx>3*TS&&ri+1<R.length&&Math.sign(e.x-p.x)!==(Math.sign(R[ri+1][0]*TS+8-p.x)||Math.sign(e.x-p.x)))continue;   /* (claude/walkerctl) never a foe BEHIND him on the walk: a stalled hero hunted an archer 30 tiles back and the walk went west for a minute */   /* (a river eel is not hunted: it lives under the water between two pads - claude/levelpilot) */const lo=Math.min(e.x,p.x),hi=Math.max(e.x,p.x);if((BK.L.pools||[]).some(q=>!q.shallow&&!q.swim&&!q.dry&&(q.fire||!BK.L.waterHurts)&&q.x1>lo&&q.x0<hi&&Math.abs(q.y-p.y)<3*TS))continue;   /* never across a pit that kills */
    const d=dx+3*dy;if(d<bd&&(e.fly||e.flying||e.air||oneFloor(e))){bd=d;best=e;}}   /* (claude/walkerhands: on his own floor, never over a gap to it - the crown's fire pit was walked into after a soldier across it) */
    /* one he cannot hurt (a shell, a perch): 6 s with its health not moving, and he tries another for 10 s */
    if(best!==huntE){huntE=best;huntT=0;huntHp=best?best.hp:0;}else if(best){huntT++;if(best.hp<huntHp){huntHp=best.hp;huntT=0;lastProg=frames;}if(huntT>360){huntNo.set(best,frames+600);huntE=null;}}return best;};
  /* THE LEVEL'S MACHINES (a crank that drops a palisade, a sluice that fills a basin, a lever, a winch): a player works the one by the way on.
     Ahead of a stretch of route the reach model could not follow (one step longer than 8 tiles), or when not getting on and no foe is near:
     the nearest unworked machine within 12 tiles - walk to it, face it, swing (and press TALK and UP for a lever or a winch); 8 s and he tries another */
  const MACH=/^(crank|sluice|lever|winch|wheel|bulkhead|tidegate|gplate)$/,workNo=new Map();let workE=null,workT=0;
  const workOf=()=>{const p=BK.P;let best=null,bd=1e9;for(const o of BK.props()){const fare=o&&o.t==='npc'&&o.kind==='ferryman'&&BK.movers().some(m=>m.ferry&&!m.paid&&!m.free&&m.toll);if(o&&o.raftCall){const m=BK.movers().find(q=>q.kind==='raft'&&q.callId===o.raftCall);if(!m||m.x<=m.x0+1||m.returning||m.called||m.moving)continue;}if(!o||(!fare&&(o.drop||o.open||o.done||o.got||(!MACH.test(o.t)&&typeof o.hits!=='number')||o.t==='lantern'||o.t==='npc'))||(workNo.get(o)||0)>frames)continue;const dx=Math.abs(o.x-p.x),dy=Math.abs(o.y-p.y);if(dx>12*TS||dy>6*TS)continue;const d=dx+2*dy;if(d<bd){bd=d;best=o;}}
    if(best!==workE){workE=best;workT=0;}else if(best&&++workT>480){workNo.set(best,frames+1800);workE=null;return null;}return best;};
  /* A LEVEL'S OWN LOCKS (BK.walkHint, the Ksar lane's hook: the level says where a player goes and what he presses there - its gong, its winch, its kegs), else the
     bot-side table src/walk-hints.js WALK_HINTS[level] in the same shape (the glass sea's mirrors). Stood at it, he faces it and presses; { hold } stands and waits */
  const hintMem={T:TT,route:R};const hintOf=()=>typeof BK.walkHint==='function'?BK.walkHint():(WH.WALK_HINTS[c.id]?WH.WALK_HINTS[c.id](BK,BK.P,hintMem):null);
  const hintHands=h=>{const p=BK.P,dx=h.x-p.x;if(Math.abs(dx)<10&&Math.abs(h.y-p.y)<28&&p.ground){BK.keys.left=BK.keys.right=false;p.face=h.face||Math.sign(dx)||p.face;if(h.key&&frames%12===0&&!(h.key==='atk'&&p.atk>=0))BK.press(h.key);}};
  /* (claude/walkerhands) A SHUT LOCKGATE AHEAD AND ITS KEY IN THE OPEN NEAR HIM, ON HIS FLOOR (the crown's iron key before its hall gate): the key first. The play bot only looked for a key from 90 px off the bars, and then for one out of doors - an interior's key sent it back to a door. It is handed to the bot's own key-walk (bot.climbKey) */
  const keyFirst=()=>{const p=BK.P,pr=BK.props();for(const g of pr){if(g.t!=='lockgate'||g.open||g.x<p.x-2*TS||g.x>p.x+25*TS||Math.abs(g.y-p.y)>3*TS)continue;if(pr.some(q=>q.t==='key'&&q.got&&q.kind===g.needs))continue;const k=pr.find(q=>q.t==='key'&&!q.got&&q.kind===g.needs&&Math.abs(q.y-p.y)<2.5*TS&&Math.abs(q.x-p.x)<30*TS);if(k)return k;}return null;};
  const oneFloor=e=>{const p=BK.P,a=Math.floor(Math.min(p.x,e.x)/TS)+1,b=Math.floor(Math.max(p.x,e.x)/TS)-1,r=Math.floor(p.y/TS);for(let x=a;x<=b;x++){if(!TSTAND.has(tAt(x,r))&&!TSTAND.has(tAt(x,r+1))&&!isSl(tAt(x,r))&&!isSl(tAt(x,r-1)))return false;}return true;};   /* (claude/walkerhands) footing all the way to him on his floor: the duel is fought on one floor */
  const bridgeAhead=()=>{for(let k=ri;k<Math.min(R.length-1,ri+6);k++)if(Math.abs(R[k+1][0]-R[k][0])+Math.abs(R[k+1][1]-R[k][1])>8)return true;return false;};
  const workHands=o=>{const p=BK.P,dx=o.x-p.x;if(Math.abs(dx)<12&&Math.abs(o.y-p.y)<28){BK.keys.left=BK.keys.right=false;p.face=Math.sign(dx)||p.face;if(p.atk<0&&frames%10===0)BK.press('atk');if((o.raftCall||o.t==='npc'||!/crank|sluice/.test(o.t))&&frames%20===0){BK.press('talk');BK.keys.up=true;}}};
  /* UP IS A JUMP A PLAYER TAKES (the hands jump only at a wall or a hole, so a stair of ledges over the floor was walked under: the pilot lifted it).
     The next route node 1.5-6.5 tiles above him, within 2.5 tiles across: a full jump, steered onto it. Not at a rope or a vine (the hands climb those). */
  let climb=null,climbHold=0,climbAir=false,climbT=0;
  const climbAssist=()=>{const p=BK.P;if(netGoalY!==null){ropeT++;if(!p.climb||ropeT>420||p.dead>0||p.swim||p.y<=netGoalY)netGoalY=null;else{BK.keys.up=true;BK.keys.down=false;BK.keys.left=BK.keys.right=false;return;}}if(netTop){ropeT++;if(!p.climb||ropeT>420||p.dead>0||p.swim)netTop=false;else{BK.keys.up=true;BK.keys.down=false;BK.keys.left=BK.keys.right=false;return;}}if(rope!==null){ropeT++;if(p.y<=feet(rope)+2||ropeT>420||p.dead>0||p.swim){rope=null;}else{BK.keys.up=true;BK.keys.down=false;if(p.climb){BK.keys.left=BK.keys.right=false;}return;}}
    if(ropeUp!==null){rope=ropeUp;ropeUp=null;ropeT=0;BK.keys.up=true;BK.keys.left=BK.keys.right=false;return;}
    if(climb!==null){climbT++;BK.keys.down=false;   /* (a deliberate climb-jump is not a pogo: the bot pressed DOWN over a foe below and the 3-row hop fell a row short) */if(climbHold>0){BK.keys.jump=true;climbHold--;}if(!p.ground)climbAir=true;
      if((p.ground&&climbAir)||climbT>100||p.swim||p.climb||p.dead>0){climb=null;return;}const dx=climbX-p.x;BK.keys.left=dx<-3;BK.keys.right=dx>3;return;}
    if(upJump!==null){const k=upJump,cx0=upJumpX!==null?upJumpX:cxR(k),dx=cx0-p.x;upJump=null;upJumpX=null;climb=k;climbX=cx0;climbHold=26;climbAir=false;climbT=0;BK.press('jump');BK.keys.jump=true;BK.keys.left=dx<-3;BK.keys.right=dx>3;}};
  /* (claude/walkerhands) THE NEXT STEP UP toward route node k: a footing 1-3 rows over his feet (standable top, two rows of room over it) within 4 columns of him, toward the node */
  const TSTAND=new Set([TT.SOLID,TT.CRATE,TT.PALISADE,TT.PORT,TT.SOFT,TT.ICE,TT.ONEWAY,TT.PLANK,TT.SHELF,TT.RAIL,TT.REED,TT.CRYST].filter(v=>v!==undefined)),TSOL=new Set([TT.SOLID,TT.CRATE,TT.PALISADE,TT.PORT,TT.SOFT,TT.ICE,TT.CLIMB].filter(v=>v!==undefined));
  const tAt=(x,y)=>(x<0||y<0||x>=GW||y>=BK.L.H)?TT.SOLID:G[y*GW+x];
  const stepUp=(p,k)=>{const hx=Math.floor(p.x/TS),fr=Math.round(p.y/TS),tx=R[k][0],dir=Math.sign(tx-hx)||p.face||1;let best=null,bs=1e9;
    for(let c=hx-4;c<=hx+4;c++)for(let r=fr-1;r>=fr-3;r--){const t=tAt(c,r);if(!TSTAND.has(t)||TSOL.has(tAt(c,r-1))||TSOL.has(tAt(c,r-2))||tAt(c,r-1)===t)continue;const sc=Math.abs(c-tx)+0.5*Math.abs(c-hx)-(fr-r)*0.8+(Math.sign(c-hx)===-dir?3:0);if(sc<bs){bs=sc;best={x:c*TS+8,feet:r*TS};}}
    return best;};
  /* (claude/walkerhands) A SLICK SLOPE BEFORE A GAP ('HOLD DOWN TO SLIDE; LEAP AT THE FOOT'): on a slope that runs down the way on, with a hole within 10 columns
     ahead, he holds DOWN (the slide); at its foot with no footing ahead, a full leap. The hands walked down and hopped from a standstill: a slide gap is a slide's length */
  let leapHold=0;const isSl=t=>t>=20&&t<=25,downOf=t=>(t===20||t===22||t===23)?-1:1;
  const gapAhead=(p,sd)=>{const tx=Math.floor(p.x/TS),fr=Math.floor(p.y/TS);for(let c=tx+sd;Math.abs(c-tx)<=10;c+=sd){let foot=false;for(let r=fr-1;r<=fr+4;r++){const t=tAt(c,r);if(TSTAND.has(t)||isSl(t)){foot=true;break;}}if(!foot)return true;}return false;};
  const slideHands=sd=>{const p=BK.P;if(leapHold>0){BK.keys.jump=true;BK.keys.down=false;leapHold--;if(p.ground&&leapHold<20)leapHold=0;return;}if(!p.ground||p.swim||p.climb||!sd)return;
    const tx=Math.floor(p.x/TS);let kind=0;for(const r of [Math.floor((p.y-1)/TS),Math.floor(p.y/TS)]){const t=tAt(tx,r);if(isSl(t)){kind=t;break;}}
    if(kind&&downOf(kind)===sd&&gapAhead(p,sd)){BK.keys.down=true;return;}
    if(p.slideOn&&!kind){const ax=Math.floor((p.x+sd*12)/TS),fr=Math.floor(p.y/TS);if(!TSTAND.has(tAt(ax,fr))&&!TSTAND.has(tAt(ax,fr+1))&&!isSl(tAt(ax,fr))){BK.press('jump');BK.keys.jump=true;BK.keys.down=false;leapHold=26;}else BK.keys.down=true;}};
  /* THE TAKE-OFF: the route node before the step up is where the reach model jumps from - walk there (the hands' goal), then jump (after the hands) */
  let upJump=null,upJumpX=null,climbX=0,ropeUp=null,rope=null,ropeT=0,netTop=false,netGoalY=null;const isNetNode=k=>{const a=G[R[k][1]*GW+R[k][0]],b=G[(R[k][1]+1)*GW+R[k][0]];return a===9||a===13||b===9||b===13;};
  let hop=null,dk1='',dk2='',dk3='';const hopNo=new Map();   /* (claude/walkerctl) the running leap between ledges: see upPlan and hopStep */
  const hopStep=()=>{if(!hop)return;const p=BK.P,K=BK.keys,d=hop.d;if(p.dead>0||p.swim||p.climb||frames-hop.f0>420){hopNo.set(hop.k,frames+900);hop=null;return;}
    if(hop.ph==='app'){if(++hop.fk>200){hopNo.set(hop.k,frames+900);hop=null;return;}const dx=hop.spot-p.x;if(!p.ground){hop=null;return;}if(Math.abs(dx)<=5&&Math.abs(p.vx)<25)hop.ph='run';else{K.left=dx<-3;K.right=dx>3;K.jump=false;K.down=false;p.jbuf=0;return;}}
    if(hop.ph==='run'){if(++hop.fk>100){hopNo.set(hop.k,frames+900);hop=null;return;}   /* (no run to be had - a wall, a low roof: the old hands take it) */K.left=d<0;K.right=d>0;K.jump=false;K.down=false;p.jbuf=0;if((p.x-hop.tx)*d>=-3&&p.vx*d>=60&&p.ground){BK.press('jump');K.jump=true;hop.ph='air';hop.t=0;}return;}
    hop.t++;K.left=d<0;K.right=d>0;K.down=false;K.jump=hop.t<26;if((p.ground&&hop.t>6)||hop.t>100)hop=null;};
  const upPlan=()=>{const p=BK.P;if(bot.rwJob||hop)return null;
    /* (claude/walkerctl) OFF A NET SIDEWAYS: the climb is done (the rope hands let go at the node) and the next node is a ledge or a floor beside the rungs, up to ~3 rows over his feet: a player lets go with a jump toward it (the game's own net jump: 0.72 of a jump, 110 px/s sideways) */
    if(p.climb&&climb===null&&rope===null&&ropeUp===null&&!netTop&&netGoalY===null&&p.dead<=0){if(isNetNode(ri)&&p.y-feet(ri)>6&&Math.abs(cxR(ri)-p.x)<=6){ropeUp=ri;return null;}   /* (the node he is on is further up the rungs: first on to it) */
      for(let k=ri+1;k<Math.min(R.length,ri+3);k++){const dx=cxR(k)-p.x,rise=p.y-feet(k);
      if(isNetNode(k)&&Math.abs(dx)<=6&&rise>=0.5*TS){ropeUp=k;return null;}   /* more net above: on up */
      if(!isNetNode(k)&&Math.abs(dx)>=0.7*TS&&Math.abs(dx)<=5*TS&&rise>=-0.6*TS&&rise<=1.9*TS){upJump=k;upJumpX=cxR(k);return null;}   /* beside the rungs, level or a row over his feet: let go with a jump (the game's net jump clears ~2 rows) */
      if(!isNetNode(k)&&Math.abs(dx)>=0.7*TS&&Math.abs(dx)<=5*TS&&rise>1.9*TS&&rise<=4.5*TS&&G[(Math.floor((p.y-1)/TS)-1)*GW+Math.floor(p.x/TS)]===9){netGoalY=feet(k)+1.6*TS;ropeT=0;return null;}   /* higher: on up until the ledge is within a net jump (not to the top rung - a foe stands there) */
      if(!isNetNode(k)&&rise>4.5*TS&&G[(Math.floor((p.y-1)/TS)-1)*GW+Math.floor(p.x/TS)]===9){netTop=true;ropeT=0;return null;}}return null;}   /* the ledge is higher than a net-jump: on up to the top rung (he steps onto it) first */
    if(climb!==null||rope!==null||!p.ground||p.swim||p.climb||p.dead>0)return null;
    if(sub&&BK.enemies().some(e=>e&&e.alive&&!e.harmless&&e.dying<=0&&!skip.has(e.t)&&Math.abs(e.x-p.x)<2.5*TS&&Math.abs(e.y-p.y)<1.5*TS))return null;   /* (a foe at his elbow first: a committed swing eats the jump key, so the hop was tried for a hundred frames and timed out) */
    for(let k=ri+1;k<Math.min(R.length,ri+(sub?2:14));k++){const up=p.y-feet(k);if(up<-2*TS)return null;{const nt0=G[R[k][1]*GW+R[k][0]],nt1=G[(R[k][1]+1)*GW+R[k][0]];if((nt0===9||nt0===13||nt1===9||nt1===13)&&up>=1.0*TS&&up<=26*TS){const rx=cxR(k);if(Math.abs(rx-p.x)<=6){ropeUp=k;return null;}return Math.abs(rx-p.x)<8*TS?rx:null;}}   /* (claude/walkerctl) A NET OF ANY HEIGHT (the chimney slots are 12 rows): stand under it and climb */
        if(up>=1.5*TS&&up<=6.5*TS){if(up>3.4*TS){const st=stepUp(p,k);if(st){if(Math.abs(st.x-p.x)<=1.2*TS){if(Math.abs(st.x-p.x)>=2*TS&&Math.abs(st.x-p.x)<=4*TS&&Math.abs(p.vx)>14)return p.x;upJump=k;upJumpX=st.x;return null;}return st.x;}}   /* (claude/walkerhands) A CLIMB HIGHER THAN A JUMP (~3.2 rows) IS A STAIR: the reach model took the steps between in one edge; a player takes them one at a time */
        const t=G[R[k][1]*GW+R[k][0]];if(t===9||t===13){const rx=cxR(k);if(Math.abs(rx-p.x)<=6){ropeUp=k;return null;}return Math.abs(rx-p.x)<6*TS?rx:null;}   /* A ROPE OR A VINE UP: stand under it and climb (the hands only tried one after half a second of not getting on) */
        const tk=k-1>=ri?k-1:-1,tx=tk>=0&&Math.abs(feet(tk)-p.y)<=TS?cxR(tk):null;
        if(tx!==null&&Math.abs(cxR(k)-tx)>=1.5*TS&&Math.abs(cxR(k)-tx)<=5.5*TS&&Math.abs(tx-p.x)<=5*TS){   /* (claude/walkerctl) A GAP HOP BETWEEN LEDGES (the zigzag stair: planks four wide, two tiles apart) IS A RUNNING LEAP: the arc from rest is three tiles and short of a plank on the far side; with the run it is five. At the tip with the run on, leap; at the tip without it, walk back along the ledge and take the run again */
          const d=Math.sign(cxR(k)-tx)||1;let room=0;const cx0=Math.floor(tx/TS),fr=Math.round(p.y/TS);for(let i=1;i<=4;i++){if(TSTAND.has(tAt(cx0-d*i,fr)))room=i;else break;}
          let wall=false;{const c0=Math.floor(Math.min(tx,cxR(k))/TS),c1=Math.floor(Math.max(tx,cxR(k))/TS);for(let cc=c0;cc<=c1;cc++)if(TSOL.has(tAt(cc,fr-1))||TSOL.has(tAt(cc,fr-2))){wall=true;break;}}   /* (a wall between the ledges is a climb, not a leap) */
          if(!wall&&(hopNo.get(k)||0)<frames){if(!hop)hop={k,tx,d,spot:room>=2?tx-d*Math.min(room,3)*TS:p.x,ph:'app',f0:frames,fk:0};return null;}}
        if(Math.abs(cxR(k)-p.x)<=1.5*TS||(tx!==null&&Math.abs(tx-p.x)<=6)){if(Math.abs(cxR(k)-p.x)>=2*TS&&Math.abs(cxR(k)-p.x)<=4*TS&&Math.abs(p.vx)>14)return p.x;   /* (claude/walkerctl) A SHORT HOP UP FROM A TIP LEAPS FROM REST: landing on a plank at +86 px/s and leaping at once put the zigzag stair's hops on the floor (the leap carries the run: ~5 tiles) - from rest the arc is 3 tiles and lands */upJump=k;return null;}
        return tx!==null&&Math.abs(tx-p.x)<5*TS?tx:null;}}return null;};
  /* UNDER WATER THE ROUTE HAS A HEIGHT: the hands stroke for the surface and only duck when the floor ahead drops, so a culvert under a wall was never found. Swimming, he steers to the route node in both axes, and comes up for air when the breath runs low */
  const swimTo=k=>{const p=BK.P;if(!p.swim||p.dead>0)return;const br=p.breath===undefined?6:p.breath;if(br<2.5)return;const dy=feet(k)-p.y,dx=cxR(k)-p.x;BK.keys.down=dy>10;BK.keys.up=dy<-10;BK.keys.left=dx<-4;BK.keys.right=dx>4;};
  const litN=()=>BK.shrines().filter(s=>s.lit).length;
  const sec=()=>({postMini:false,lost:0,small:0,drinks:0,drinkHp:0,deaths:0,hits:0,kills:0,frames:0,lvup:0});
  const S=[sec()],arrivals=[];const deathLog=[],trace=[];const stucks=[];let miniT=0,cardT=0,miniHp=null,resumeTo=null,resumeAt=false,resumes=0,secStart=0;let ri=0,riBest=0,riSince=0,riMax=0,lastProg=0,frames=0,end='frames',stuck=null,deaths=0,levelups=0;
  const st0=BK.stats(),d00=st0.deaths,k00=st0.kills,hit00=BK.hitsTaken;let kPrev=k00,hPrev=hit00,dPrev=d00,wasDead=false;
  let bot=makeBot(BK),jumpX=null;
  /* A PLAYER STEERS HIS FALL ONTO A PAD (the hands only ever hold the way on, so a hop off one lily pad sailed past the next into the marsh): falling, with a floating pad or raft ahead of where the jump began and under him, he leans onto its middle */
  const steer=sd=>{const p=BK.P;if(p.ground||p.onMover){jumpX=p.x;return;}if(p.swim||p.climb||!(p.vy>0)||!sd)return;let best=null,bd=1e9;for(const m of BK.movers()){if(m.gone||(m.sink||0)>0.55||(m.kind!=='pad'&&m.kind!=='raft'))continue;const cx=m.x+(m.w||16)/2,dy=m.y-p.y,dx=cx-p.x;if(dy<-2||dy>5*TS||Math.abs(dx)>4*TS)continue;if(jumpX!==null&&(cx-jumpX)*sd<12)continue;if(Math.abs(dx)<bd){bd=Math.abs(dx);best=dx;}}if(best===null)return;BK.keys.left=best<-3;BK.keys.right=best>3;};
  /* --from=X (a DEBUG start, not a first run: claude/levelpilot): put him on the route at column X to read one stretch without walking to it */
  if(c.from!==null){const k=R.findIndex(n=>n[0]>=c.from);if(k>0){const p=BK.P;p.x=cxR(k);p.y=feet(k);p.vx=p.vy=0;ri=riSince=riBest=riMax=k;}}
  /* ON A SINKING PAD A PLAYER DOES NOT STOP TO FIGHT THE FISH (claude/levelpilot: the hands turned round on the marsh river's pad to cut the eel behind them, sank, and were handed back to the bank - STUCK 229,17 in every run): a fish in the water by the pad is left to its leap */
  const padSkip=()=>{const p=BK.P,m=p.onMover;if(!m||m.kind!=='pad'||!bot.skip)return;for(const e of BK.enemies())if(e&&e.alive&&/^(eel|gar)$/.test(e.t)&&Math.abs(e.x-p.x)<4*TS)bot.skip.set(e,(bot.frame||0)+20);};
  /* AND HE WAITS OUT A TOLD LEAP (the sign: 'wait on the pad and go after it drops'): footed, a river eel's ! or leap in the next gap ahead holds him where he stands */
  const eelWait=sd=>{const p=BK.P;if(!(p.ground||p.onMover)||p.swim||!sd)return;for(const e of BK.enemies()){if(!e||!e.alive||e.t!=='eel'||!e.leap)continue;const dx=(e.x-p.x)*sd;if(dx<-6||dx>4.5*TS)continue;if(e.mode==='leapTell'||e.mode==='leap'){if(padGo!==null&&padT>2)return false;padGo=null;BK.keys.left=BK.keys.right=false;BK.keys.jump=false;lastProg=frames;return true;}}return false;};
  /* PAD TO PAD IS A FULL HOP (the hands' short hop off a two-tile leaf came down in the gap between it and the next): footed on a lily pad, the next one ahead on the same row that is still afloat gets a held jump, steered onto its middle */
  let padGo=null,padHold=0,padT=0,pendDrink=0;const hitBy={};const padHop=sd=>{const p=BK.P;if(padGo!==null){padT++;if(padHold>0){BK.keys.jump=true;padHold--;}const dx=padGo-p.x;BK.keys.left=dx<-3;BK.keys.right=dx>3;if(((p.ground||p.onMover)&&padT>6)||p.swim||p.dead>0||padT>90)padGo=null;return;}
    const m=p.onMover;if(!m||m.kind!=='pad'||!sd)return;let best=null;for(const q of BK.movers()){if(q===m||q.kind!=='pad'||q.gone||(q.sink||0)>0.3)continue;const cx=q.x+(q.w||16)/2,dx=(cx-p.x)*sd;if(dx<20||dx>6*TS||Math.abs((q.y0??q.y)-(m.y0??m.y))>8)continue;if(!best||dx<best.dx)best={cx,dx};}
    if(!best)return;padGo=best.cx;padT=0;padHold=best.dx>3.5*TS?24:16;BK.press('jump');BK.keys.jump=true;BK.keys.left=sd<0;BK.keys.right=sd>0;};
  /* (claude/walkerhands) AN ELITE IS A DUEL, NOT A MASH: src/walk-duel.js picks the elite in the way and reads his guard, his riposte, his spines and his marks; the lab's duel hands
     (src/lab.js labDuelFrame - the elite lab's own, under the human gates) fight him. 20 s without a blow landing on him, or 90 s in all, and he is written off for 30 s (the walk goes on: a gate he holds is then a STUCK) */
  const ER=WD.makeEliteRead({mashAt:(FR.actOf(c.id,c.depth)||{mashAt:3}).mashAt}),duelNo=new Map(),duels=[];let duelPend=null,duelE=null,duelRow=null,duelT=0,duelHp=0;
  const duelEnd=(won)=>{if(duelRow&&!won&&duelE&&duelE.alive&&!(BK.P.dead>0)){duelPend={e:duelE,row:duelRow,f:frames};duelRow=null;duelE=null;bot=makeBot(BK);climb=null;return;}if(duelRow){duelRow.secs=Math.round((frames-duelRow.f0)/6)/10;duelRow.won=won;duelRow.hpEnd=Math.round(100*Math.max(0,BK.P.hp)/(BK.P.maxHp||100));delete duelRow.f0;duelRow=null;}duelE=null;bot=makeBot(BK);climb=null;};
  /* (claude/walkerctl) SUB-ROUTES - the walker's hands follow ONE route; two moves were not on it:
     A SIDE TRIP FOR A KEY: a shut lockgate on the route whose key stands off the floor (a tower deck, a ledge): the movement graph (src/walk-graph.js, the
       reach fill's own edges) gives the way from the route to the key's footing and back onto the route; the hands walk it as a route of its own when he
       is at the node nearest the key, and the walk goes on from where it leaves the route.
     AN ESCAPE: off the route by more than four rows for 2.5 s (a pit, a chimney slot): routed back onto it from where he stands.
     --subs=0 turns both off. A sub-route that makes no progress for 15 s (or 80 s in all) is dropped and written to the row (subs). */
  const mri=()=>sub?main.ri:ri;let sub=null,main=null;const subLog=[];let escCd=0,escN=0;
  const cellIdx=new Map();c.route.forEach((n,i)=>cellIdx.set(GR.cell(n[0],n[1]),i));
  const heroCell=()=>GR.near(Math.floor(BK.P.x/TS),Math.floor((BK.P.y-1)/TS),1,2);
  const pushSub=(kind,nodes,back,meta)=>{if(sub||nodes.length<2)return false;main={R,ri,riBest,riSince};sub={kind,back,meta:{...(meta||{}),path:nodes.map(n=>n.join(',')).join(' ')},f0:frames,n:nodes.length,rr:0};R=nodes;ri=0;riBest=0;riSince=0;lastProg=frames;bot=makeBot(BK);climb=null;rope=null;ropeUp=null;upJump=null;netTop=false;netGoalY=null;return true;};
  const popSub=ok=>{if(!sub)return;const m=main;R=m.R;ri=m.ri;riBest=m.riBest;riSince=m.riSince;if(ok&&sub.back!==null&&sub.back!==undefined){ri=Math.max(ri,sub.back);riSince=Math.max(riSince,ri);riBest=Math.max(riBest,ri);}subLog.push({kind:sub.kind,ok,got:sub.kind==='key'&&BK.props().some(q=>q.t==='key'&&q.got&&q.kind===sub.meta.key),secs:Math.round((frames-sub.f0)/6)/10,n:sub.n,f:sub.f0,rrLog:sub.rrLog,...(sub.meta||{})});if(sub.det&&(sub.det.tries||0)>=2)sub.det.done=true;sub=null;main=null;lastProg=frames;bot=makeBot(BK);climb=null;rope=null;ropeUp=null;upJump=null;netTop=false;netGoalY=null;};
  const dets=[];if(c.subs){const pr=BK.props();for(const g of pr){if(g.t!=='lockgate'||!g.needs)continue;const k=pr.find(q=>q.t==='key'&&q.kind===g.needs);if(!k)continue;
      if((BK.L.interiors||[]).some(([x0,x1,y0,y1])=>k.x>=x0*TS&&k.x<=(x1+1)*TS&&k.y>=(y0-1)*TS&&k.y<=(y1+2)*TS))continue;   /* indoors: a door's business */
      const gc=Math.floor(g.x/TS),gr=Math.floor(g.y/TS);let gi=-1,gd=1e9;R.forEach((n,i)=>{const d=Math.abs(n[0]-gc)+Math.abs(n[1]-gr)*2;if(d<gd){gd=d;gi=i;}});if(gi<1||gd>10)continue;   /* the gate is on the route */
      const kx=Math.floor(k.x/TS),ky=Math.floor(k.y/TS),kc=GR.settle(kx,ky);if(kc<0)continue;
      const order=R.map((n,i)=>i).filter(i=>i<gi).sort((a,b)=>Math.hypot(R[a][0]-kx,R[a][1]-ky)-Math.hypot(R[b][0]-kx,R[b][1]-ky)).slice(0,6);
      let best=null;for(const a of order){const p=GR.path(GR.cell(R[a][0],R[a][1]),v=>v===kc);if(p&&(!best||p.length<best.p.length))best={a,p};}if(!best||Math.abs(ky-R[best.a][1])<=2)continue;   /* (a key on his own floor is the hands' own: keyFirst) */
      const back=GR.path(kc,v=>{const i=cellIdx.get(v);return i!==undefined&&i>best.a;});if(!back)continue;
      dets.push({kind:g.needs,a:best.a,gi,nodes:best.p.concat(back.slice(1)),ki:best.p.length-1,back:cellIdx.get(GR.cell(back[back.length-1][0],back[back.length-1][1])),key:[kx,ky]});}}
  while(frames<c.frames){
    if(c.nofoes){for(const e of BK.enemies())if(e&&e.alive&&e.x/TS>=c.nofoes[0]&&e.x/TS<=c.nofoes[1]){e.alive=false;e.hp=0;}}   /* (--nofoes=x0-x1: a debug aid - the foes in those columns are removed every frame, to read the hands' footwork alone) */
    if(BK.bossActive){end='boss';break;}
    /* (claude/walkerhands) THE MINI HANDED OFF (--mini=0: stop at his door as before): boss-rates measures his room (row 'level:mini'); the walk keeps the hp at his door, puts him down the game's own way (his death opens his wall and his gate, his XP is paid as a player's would be) and walks on. The section after his door is marked postMini: its arrival does not carry the fight's cost, so it is left out of the arrival means */
    if(BK.miniActive&&c.mini){const mb=BK.enemies().find(e=>e&&e.alive&&e.mini);if(miniHp===null){miniHp=Math.round(100*Math.max(0,BK.P.hp)/(BK.P.maxHp||100));const cs0=S[S.length-1];cs0.end=mri();S.push({...sec(),start:mri(),postMini:true});}if(mb&&++miniT<240){BKT.hurtEnemy(mb,mb.hp+999,BK.P.x,false);BK.sim(1);frames++;lastProg=frames;continue;}if(!mb){bot=makeBot(BK);continue;}}
    if(BK.state==='card'){if(++cardT>40){BK.press('confirm');cardT=0;}BK.sim(1);frames++;lastProg=frames;continue;}   /* a level-up's card: the first pick, as a player taps through it */
    if(BK.miniActive){end='mini';miniHp=Math.round(100*Math.max(0,BK.P.hp)/(BK.P.maxHp||100));break;}   /* THE MINI'S ROOM: the mini is measured by tools/boss-rates.mjs (row 'level:mini'); its walls hold him in, so the walk stops at its door (hp on arrival kept) */
    if(BK.state==='talk'){BK.press('confirm');BK.sim(1);frames++;continue;}
    if(BK.state==='card'&&BK.cardClose){BK.cardClose();BK.sim(1);frames++;continue;}   /* a level-up card (a low-level walk levels up mid-level): take it and walk on (claude/rootway) */   /* a word from somebody: read on */
    if(BK.state!=='play'){end=BK.state==='win'?'gate':'state:'+BK.state;break;}
    if(c.subs&&!duelE&&BK.P.dead<=0&&BK.P.ground&&!BK.P.swim){const pp=BK.P;
      if(!sub)for(const d of dets){if(d.done||ri<d.a||ri>=d.gi){d.dbg=(d.dbg||'')===''||/^w/.test(d.dbg)?'w'+ri:d.dbg;continue;}d.dbg='in '+ri+' x'+Math.floor(pp.x/TS)+' y'+Math.floor(pp.y/TS);if(frames%60===0&&(d.log=d.log||[]).length<12)d.log.push('f'+frames+' ri'+ri+' x'+(pp.x/TS).toFixed(1)+' y'+(pp.y/TS).toFixed(1)+' dxa'+((cxR(d.a)-pp.x)/TS).toFixed(1)+' dya'+((feet(d.a)-pp.y)/TS).toFixed(1));const pr=BK.props();if(pr.some(q=>q.t==='key'&&q.got&&q.kind===d.kind)){d.done=true;continue;}const g=pr.find(q=>q.t==='lockgate'&&q.needs===d.kind);if(!g||g.open){d.done=true;continue;}
        if((d.tries||0)<2){let nodes=d.nodes,ki=d.ki;
          if(!(Math.abs(cxR(d.a)-pp.x)<10*TS&&Math.abs(feet(d.a)-pp.y)<3*TS)){const hc=heroCell(),kc=GR.settle(d.key[0],d.key[1]),p1=hc>=0&&kc>=0?GR.path(hc,v=>v===kc):null;   /* (past the node the trip was planned from - a dash carried him on: from where he stands) */if(p1&&p1.length>1&&p1.length<80){nodes=p1.concat(d.nodes.slice(d.ki+1));ki=p1.length-1;}else continue;}
          d.tries=(d.tries||0)+1;if(pushSub('key',nodes.map(n=>n.slice()),d.back,{key:d.kind,at:d.key,try:d.tries}))sub.keyIdx=ki,sub.det=d;break;}}
      if(sub&&sub.kind==='key'&&BK.props().some(q=>q.t==='key'&&q.got&&q.kind===sub.meta.key)&&(!sub.ret||(frames>escCd&&frames-lastProg>120&&sub.rr<6&&(sub.rr++,escCd=frames+180,true)))){sub.ret=true;sub.keyIdx=-1;const hc=heroCell(),tb=sub.back,p2=hc>=0?GR.path(hc,v=>{const i=cellIdx.get(v);return i!==undefined&&i>=tb;}):null;   /* THE KEY IS IN HIS PACK: from where he stands, straight back onto the route */if(p2&&p2.length>1){R=p2;ri=0;riBest=0;riSince=0;lastProg=frames;bot=makeBot(BK);climb=null;rope=null;ropeUp=null;upJump=null;netTop=false;netGoalY=null;}}
      if(sub&&!sub.ret&&frames>escCd&&frames-lastProg>120&&sub.rr<6){const [bi]=nearest(Math.max(0,ri-6),Math.min(R.length,ri+30));if(Math.abs(feet(bi)-pp.y)>3*TS||dist(bi)>10*TS){escCd=frames+180;const nx=Math.min(R.length-1,Math.max(riBest,ri)+1),hc=heroCell(),tc=GR.cell(R[nx][0],R[nx][1]),p2=hc>=0?GR.path(hc,v=>v===tc):null;   /* (off the sub-route - knocked from a net, a fall: routed to the next node he had not reached, and on along the rest of it) */if(p2&&p2.length>1){sub.rr++;(sub.rrLog=sub.rrLog||[]).push(frames+': hero '+Math.floor(pp.x/TS)+','+Math.floor(pp.y/TS)+' cell '+(hc%GR.W)+','+((hc/GR.W)|0)+' -> '+p2.map(n=>n.join(',')).join(' '));if(sub.keyIdx>=nx)sub.keyIdx=p2.length-1+(sub.keyIdx-nx);else sub.keyIdx=-1;R=p2.concat(R.slice(nx+1));ri=0;riBest=0;riSince=0;lastProg=frames;bot=makeBot(BK);climb=null;rope=null;ropeUp=null;upJump=null;netTop=false;netGoalY=null;}}}
      if(!sub&&frames>escCd&&frames-lastProg>150&&escN<8&&!(BK.L.interiors||[]).some(([x0,x1,y0,y1])=>pp.x>=x0*TS&&pp.x<=(x1+1)*TS&&pp.y>=(y0-1)*TS&&pp.y<=(y1+2)*TS)){const [bi]=nearest(Math.max(0,ri-6),Math.min(R.length,ri+30));if(Math.abs(feet(bi)-pp.y)>4*TS){escCd=frames+300;const hc=heroCell(),p2=hc>=0?GR.path(hc,v=>{const i=cellIdx.get(v);return i!==undefined&&i>=ri-3;}):null;if(p2&&p2.length>1){escN++;pushSub('escape',p2,cellIdx.get(GR.cell(p2[p2.length-1][0],p2[p2.length-1][1])),{from:[Math.floor(pp.x/TS),Math.floor(pp.y/TS)]});}}}}
    if(hop&&hop.ph==='air'&&hop.t>6&&BK.P.ground)hop=null;   /* (landed: the next hop of a stair is planned on this very frame, before the hands act) */
    const heldTop=heldNow();const p=BK.P;let gi=Math.min(R.length-1,ri+1);if(!sub)for(let k=gi+1;k<=Math.min(R.length-1,ri+3);k++){if(Math.abs(feet(k)-feet(gi))<2*TS&&Math.sign(R[k][0]-R[gi][0])===Math.sign(R[gi][0]*TS+8-p.x))gi=k;else break;}let wx=R[gi][0],why='';dk1=dk2=dk3='';if(sub&&sub.keyIdx>=0&&ri>=sub.keyIdx){const kp=BK.props().find(q=>q.t==='key'&&q.kind===sub.meta.key);if(kp&&!kp.got){wx=(kp.x-8)/TS;why='k';}}   /* (at the key's node and the key not yet his: walk onto the key itself) */   /* AIM ONE TO THREE NODES ON, along the same floor and the same way: the hands stop at their goal (a goal on a lily pad or a ledge lip is a stop in the water), and a goal further on, on a tall level, is on another floor */
    if(perc)perc.apply();
    try{const riding=p.onMover&&(p.onMover.moving||p.onMover.returning);if(riding)lastProg=frames;   /* ON A RIDE (a ferry, a raft, a lift): stand and let it carry him */
      const de=c.duel&&!riding&&!(p.dead>0)?WD.duelPick(BK,duelE,{floor:oneFloor,dir:Math.sign(wx*TS+8-p.x)||p.face||1,no:duelNo,frame:frames,pools:BK.L.pools,waterHurts:BK.L.waterHurts}):null;
      if(de!==duelE){if(duelE)duelEnd(!duelE.alive);if(de&&duelPend&&duelPend.e===de&&frames-duelPend.f<300){duelE=de;duelT=0;duelHp=de.hp;duelRow=duelPend.row;duelPend=null;}else if(de){if(duelPend){const pr=duelPend.row;pr.secs=Math.round((duelPend.f-pr.f0)/6)/10;pr.won=false;pr.hpEnd=pr.hp0;delete pr.f0;duelPend=null;}duelE=de;duelT=0;duelHp=de.hp;duelRow={t:de.t,affix:de.affix||null,at:[Math.floor(de.x/TS),Math.floor(de.y/TS)],f0:frames,hp0:Math.round(100*Math.max(0,p.hp)/(p.maxHp||100))};duels.push(duelRow);}}
      if(duelE){duelT++;if(duelE.hp<duelHp){duelHp=duelE.hp;duelT=0;}if(duelT>1200||frames-(duelRow?duelRow.f0:frames)>5400){duelNo.set(duelE,frames+1800);duelEnd(false);}}
      if(duelE){lastProg=frames;   /* (a common foe on top of him while the elite is further off - an archer, a wasp, a summoned one - is cut down first: the duel hands take one foe at a time) */let tg=duelE,nd=Math.abs(duelE.x-p.x)-10;for(const e of BK.enemies()){if(!e||!e.alive||e.elite||e.harmless||e.dying>0||skip.has(e.t)||Math.abs(e.y-p.y)>1.5*TS)continue;const d=Math.abs(e.x-p.x);if(d<44&&d<nd){nd=d;tg=e;}}cur=tg;drinkHook();LD.labDuelFrame(BK,h,tg,frames,c.profile&&c.profile!=='none'?c.profile:'human',tg===duelE?ER:null);if(SKH)SKH.step();drinkHook();}else{
      const stall=!riding&&frames-lastProg>90,hunt0=stall?huntOf():null,hunt=hunt0&&(!sub||(Math.abs(hunt0.x-p.x)<=6*TS&&Math.abs(hunt0.y-p.y)<=2*TS))?hunt0:null,work=!sub&&!riding&&!hunt&&(stall||bridgeAhead())?workOf():null;   /* (a sub-route is no time for the bell: the machines are the main route's, and only a foe at hand is hunted) */if(hunt){why='H';wx=(hunt.x-8)/TS;if(bot.skip)bot.skip.clear();}else if(work){why='W';wx=(work.x-8)/TS;}else{const kf=keyFirst();if(kf){why='K';wx=(kf.x-8)/TS;if(!bot.climbKey)bot.climbKey=kf;}else{const ux=upPlan();if(ux!==null){why='U';wx=(ux-8)/TS;}}}const lh0=!hunt&&!work?hintOf():null,lh=lh0&&Math.abs(lh0.x-p.x)<(lh0.r||6)*TS&&Math.abs(lh0.y-p.y)<2*TS?lh0:null;   /* (a lock in reach: the level's hands; out of reach the route walks him there) */if(lh){why='L';wx=(lh.x-8)/TS;if(lh.hold||Math.abs(lh.x-p.x)<12)lastProg=frames;}cur=pickTarget(wx*TS+8);padSkip();drinkHook();bot.noKeyWalk=!!sub||dets.length>0;   /* (a level whose keys stand off the floor: the hands' door-hunting - 'still 60 frames: walk to the nearest door' - took a hero 40 tiles back west to a hearth house every time a pike held him a second) */if(bot.climbX!==undefined){const bfx=Math.floor(p.x/TS),bfy=Math.floor(p.y/TS);if(![1,2,3].some(d=>tAt(bfx+d,bfy-1)===TT.PORT||tAt(bfx-d,bfy-1)===TT.PORT))bot.climbX=undefined;}   /* (the bot's 'shut portcullis: climb the ledges' plan outlived the ambush wall: it jumped under a plank for ever) */
    bot.noDrop=!(ri+1<R.length&&feet(ri+1)-p.y>=1.5*TS);if(hop){BK.keys.left=BK.keys.right=BK.keys.jump=BK.keys.up=BK.keys.down=false;hopStep();}else   /* (a running leap is flown without the bot: its own hops at every landing cut this one short) */   /* (claude/walkerctl) the bot drops through a ledge after standing still 70 frames: only when the way on is under him (it dropped off the Stormhold plank mid-fight) */bot(wx*TS+8);dk1=(BK.keys.left?'<':'')+(BK.keys.right?'>':'')+(BK.keys.down?'D':'');{const nt=tAt(Math.floor(p.x/TS),Math.floor(p.y/TS));if(p.ground&&!p.climb&&rope===null&&ropeUp===null&&!netTop&&nt===9){const dx=wx*TS+8-p.x;if(Math.abs(dx)>6){BK.keys.up=false;BK.keys.left=dx<0;BK.keys.right=dx>0;}}}   /* (claude/walkerctl) STANDING ON THE TOP RUNG the bot holds UP (its rope hands) and never stepped off to the side: step off toward the goal */if(lh)hintHands(lh);else if(work)workHands(work);else{climbAssist();if(climb===null&&rope===null)slideHands(Math.sign(wx*TS+8-p.x));}swimTo(gi);{const sd=Math.sign(wx*TS+8-p.x);if(padGo===null)steer(sd);if(!eelWait(sd))padHop(sd);}dk2=(BK.keys.left?'<':'')+(BK.keys.right?'>':'')+(BK.keys.down?'D':'');if(SKH&&cur)SKH.step();drinkHook();dk3=(BK.keys.left?'<':'')+(BK.keys.right?'>':'')+(BK.keys.down?'D':'');}}finally{if(perc)perc.restore();}
    const h0=p.hp,mh0=p.maxHp||100,lit0=litN(),held0=heldNow(),hl0=BKT.heroLevel?BKT.heroLevel(h):0,dead0=p.dead>0||h0<=0,px0=p.x;
    BK.sim(1);frames++;if(perc)perc.update();
    const q=BK.P,cs=S[S.length-1],h1=q.hp;if(resumeTo){const rt=resumeTo;resumeTo=null;if(Math.abs(q.x-rt.x)>2*TS){stucks[stucks.length-1].locked=true;end='locked';break;}}   /* the restart did not take: walls hold him (an ambush or an arena still shut) */if(c.trace&&trace.length<(c.traceN||400)&&frames>=(c.traceFrom||0)&&q.x/TS>=c.trace[0]&&q.x/TS<=c.trace[1]&&frames%3===0)trace.push(frames+':'+(q.x/TS).toFixed(1)+','+(q.y/TS).toFixed(1)+(q.onMover?'M'+(q.onMover.moving?'m':'')+(q.onMover.paid?'p':''):'')+(q.ground?'g':'')+(q.climb?'c':'')+(q.swim?'S':'')+(BK.keys.jump?'J':'')+(BK.keys.right?'>':'')+(BK.keys.left?'<':'')+(BK.keys.block?'B':'')+(BK.keys.down?'D':'')+(BK.keys.up?'U':'')+(q.atk>=0?'A':'')+(q.vx?'v'+Math.round(q.vx):'')+' r'+ri+'g'+wx+(climb!==null?'C':'')+(sub?'S'+sub.kind[0]:'')+(rope!==null?'R':'')+(hop?'h'+hop.ph[0]+hop.k+(hop.d>0?'+':'-'):'')+why+(c.dk?' k['+dk1+'|'+dk2+'|'+dk3+']':'')+(()=>{let b=null,bd=1e9;for(const e of BK.enemies()){if(!e||!e.alive||e.harmless||e.dying>0)continue;const d=Math.abs(e.x-q.x)+Math.abs(e.y-q.y);if(d<bd&&d<6*TS){bd=d;b=e;}}return b?' F'+b.t+':'+Math.round((b.x-q.x)/TS*10)/10+':'+Math.round((b.y-q.y)/TS*10)/10+(b.mode?':'+b.mode:''):'';})()+' hp'+Math.round(h1));const mh=q.maxHp||mh0;cs.frames++;
    /* a tonic drunk on the frame of the blow nets out against it: the drink goes back on both sides (lost and healed) */
    const flaskGame=typeof BK.drinkFlask==='function',drank=Math.max(0,heldTop-heldNow()),dAmt=drank&&!flaskGame?drank*((PR.perkOn(P0,h,'tonic')?60:45)):0;
    if(h1-dAmt<h0)cs.lost+=(h0-Math.max(0,h1-dAmt))/mh0;
    const st=BK.stats();if(st.kills>kPrev){cs.kills+=st.kills-kPrev;kPrev=st.kills;}if(BK.hitsTaken>hPrev){cs.hits+=BK.hitsTaken-hPrev;hPrev=BK.hitsTaken;let nb=null,nd=80;for(const e of BK.enemies()){if(!e||!e.alive)continue;const d=Math.abs(e.x-q.x)+Math.abs(e.y-q.y)*0.5;if(d<nd){nd=d;nb=e;}}const hk=nb?nb.t+(nb.elite?'*':''):'other',hb=hitBy[hk]=hitBy[hk]||[0,0];hb[0]++;hb[1]+=Math.max(0,h0-h1)/mh0;}   /* WHAT HIT HIM (the nearest foe at the blow: an estimate, * an elite) */
    if(st.deaths>dPrev){const K=q.killer;deathLog.push({at:[Math.floor(q.x/TS),Math.floor(q.y/TS)],ri,by:K?(typeof K==='string'?K:K.name||K.t||K.who||'?'):'?',el:!!(K&&typeof K==='object'&&K.foe&&K.foe.elite),sec:S.length-1});cs.deaths+=st.deaths-dPrev;deaths+=st.deaths-dPrev;dPrev=st.deaths;}
    const lit1=litN(),held1=heldNow(),hl1=BKT.heroLevel?BKT.heroLevel(h):0;
    if(lit1>lit0&&resumeAt){resumeAt=false;cs.end=mri();S.push({...sec(),resumed:true,start:mri()});}
    else if(lit1>lit0){cs.end=mri();arrivals.push({i:arrivals.length+1,hp:Math.round(100*Math.max(0,h0)/mh0),x:Math.round(q.x/TS),frame:frames,deathsBefore:deaths,start:frames<120,postMini:!!cs.postMini});S.push({...sec(),start:mri()});}
    else if(held1<heldTop&&!dead0){cs.drinks+=heldTop-held1;if(flaskGame)pendDrink=frames+90;else cs.drinkHp+=Math.max(0,Math.min(dAmt,h1-Math.max(0,h1-dAmt<h0?h1-dAmt:h0)))/mh;}
    else if(h1>h0&&!dead0&&!(q.dead>0)){const g=(h1-Math.max(0,h0))/mh;
      if(hl1>hl0){cs.lvup++;levelups++;} else if(pendDrink>=frames&&g>0.15){cs.drinkHp+=g;pendDrink=0;} else cs.small+=g;}   /* (the flask's swallow lands ~0.3 s after the lift: the heal that follows a drink is the drink's) */
    /* woke at a shrine (or put back on the bank by deep water): the walk picks up from the route node nearest him, never past where it had got; fresh hands */
    if(sub&&(q.dead>0||Math.abs(q.x-px0)>3*TS))popSub(false);
    if(duelE&&(q.dead>0||!duelE.alive))duelEnd(!duelE.alive&&!(q.dead>0));
    if(dead0&&!(q.dead>0)&&q.hp>0){ri=nearest(0,riBest+1)[0];riSince=ri;lastProg=frames;bot=makeBot(BK);climb=null;}
    else if(!resumeAt&&!(q.dead>0)&&Math.abs(q.x-px0)>3*TS){ri=nearest(0,riBest+1)[0];riSince=ri;bot=makeBot(BK);climb=null;}
    if(!(q.dead>0)&&q.hp>0)track();
    if(sub){if(ri>=R.length-2&&dist(R.length-1)<3*TS)popSub(true);else if(frames-lastProg>900||frames-sub.f0>4800)popSub(false);}
    if(!sub&&ri>=R.length-2){end='route';break;}
    if(deaths>=c.deathCap){end='wall';break;}
    if(frames-lastProg>c.stuck&&!(q.dead>0)){const w=R[Math.min(riSince+1,R.length-1)];const stuck={ri:riSince,of:R.length,way:w,at:[Math.floor(q.x/TS),Math.floor(q.y/TS)],near:BK.enemies().filter(e=>e&&e.alive&&Math.abs(e.x-q.x)<96&&Math.abs(e.y-q.y)<64).map(e=>e.t+(e.mode?':'+e.mode:'')+'@'+(e.x/TS).toFixed(1)+','+(e.y/TS).toFixed(1)).slice(0,6),pst:Object.entries(q).filter(([k,v])=>(typeof v==='number'&&v!==0&&!/^(x|y|hp|maxHp|st|maxSt|face|hpShown|safe.*)$/.test(k))||(v===true)).map(([k,v])=>k+'='+(typeof v==='number'?Math.round(v*100)/100:v)).slice(0,40).join(' '),tiles:[-2,-1].map(dy=>{const ty=Math.floor(q.y/TS)+dy;let r='';for(let tx=Math.floor(q.x/TS)-3;tx<=Math.floor(q.x/TS)+4;tx++)r+=BK.L.grid[ty*BK.L.W+tx];return r;}).join('/'),props:BK.props().filter(o=>Math.abs(o.x-q.x)<64&&Math.abs(o.y-q.y)<48).map(o=>o.t).slice(0,6),sec:S.length-1};stucks.push(stuck);cs.stuck=true;
      /* NO LIFT THROUGH A SECTION: this one is STUCK and not measured. Unless --strict, he starts again at the NEXT SHRINE on the route, as a respawn there would (full health), so the sections after it are still read */
      let nx=null,ni=1e9;if(!c.strict)for(const sh of BK.shrines()){if(sh.lit)continue;let bi=-1,bd=1e9;for(let k=0;k<R.length;k++){const d=Math.abs(cxR(k)-sh.x)+Math.abs(feet(k)-sh.y);if(d<bd){bd=d;bi=k;}}if(bd<8*TS&&bi>riSince&&bi<ni){ni=bi;nx=sh;}}
      if(!nx){end='stuck';break;}
      q.onMover=null;q.x=nx.x;q.y=nx.y;q.vx=q.vy=0;q.hp=q.maxHp;resumeAt=true;resumeTo=nx;ri=ni;riSince=ni;if(ni>riBest)riBest=ni;if(ni>riMax)riMax=ni;lastProg=frames;bot=makeBot(BK);climb=null;rope=null;resumes++;continue;}
    if(frames%600===0)await new Promise(r=>setTimeout(r,0));
  }
  if(sub)popSub(false);
  if(duelPend){const pr=duelPend.row;pr.secs=Math.round((duelPend.f-pr.f0)/6)/10;pr.won=false;pr.hpEnd=pr.hp0;delete pr.f0;duelPend=null;}if(duelRow)duelEnd(!!(duelE&&!duelE.alive));   /* (a duel still open when the walk ends is booked) */
  const r2=x=>Math.round(x*100);
  return {id:c.id,hero:h,seed:c.seed,lvl,depth:c.depth,maxHp:maxHp0,kit,gear,tonics:c.tonics,flasks:typeof BK.flaskMax==='function'?BK.flaskMax():null,charm:c.charm,end,miniHp,deaths,levelups,frames,secs:Math.round(frames/60),
    kills:BK.stats().kills-k00,hits:BK.hitsTaken-hit00,walked:Math.round(100*riBest/R.length),stuck:stucks[0]||null,stucks,resumes,deathLog,hitBy:Object.fromEntries(Object.entries(hitBy).map(([k,v])=>[k,[v[0],Math.round(v[1]*100)]])),trace:c.trace?trace:undefined,arrivals,shrines:BK.shrines().length,
    coverage:Math.round(100*S.reduce((a,s,i)=>a+(!s.stuck&&(s.end!==undefined||(i===S.length-1&&/route|boss|gate/.test(end)))?((s.end??ri)-(s.start||0)):0),0)/R.length),
    sections:S.map(s=>({postMini:!!s.postMini,stuck:!!s.stuck,resumed:!!s.resumed,lost:r2(s.lost),small:r2(s.small),drinks:s.drinks,drinkHp:r2(s.drinkHp),deaths:s.deaths,hits:s.hits,kills:s.kills,secs:Math.round(s.frames/60),lvup:s.lvup})),
    duels,subs:subLog,dets:dets.map(d=>({kind:d.kind,a:d.a,gi:d.gi,tries:d.tries||0,done:!!d.done,dbg:d.dbg,log:d.log,n:d.nodes.length})),eyes:perc?perc.stats():null,casts:SKH?SKH.casts():null};
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
  : r.id + ' ' + r.hero + ' s' + r.seed + ' L' + r.lvl + ' (' + r.maxHp + 'hp, ' + (r.kit.join('+') || 'no skills') + ', ' + (r.flasks != null ? r.flasks + ' flasks' : r.tonics + ' tonics') + (r.charm ? ', ' + r.charm + ' charm' : '') + '): ' + r.end.toUpperCase()
    + ' ' + r.deaths + ' deaths, ' + r.secs + 's, ' + r.kills + ' kills, ' + r.hits + ' hits, walked ' + r.walked + '%, arrivals ' + (r.arrivals.map(a => a.hp + '%').join(' ') || '-')
    + ', measured ' + r.coverage + '% of the route' + (r.miniHp !== null && r.miniHp !== undefined ? ', AT THE MINI DOOR with ' + r.miniHp + '%' : '') + (r.stucks || []).map(st => '\n    STUCK (section #' + st.sec + ') at route node ' + st.ri + '/' + st.of + ' next tile ' + st.way.join(',') + ' (hero ' + st.at.join(',') + (st.near && st.near.length ? '; near ' + st.near.join(' ') : '') + (st.props && st.props.length ? '; props ' + st.props.join(' ') : '') + ')').join('')
    + '\n    sections: ' + r.sections.map((s, i) => '#' + i + (s.stuck ? ' STUCK' : '') + (s.resumed ? ' (resumed)' : '') + ' lost ' + s.lost + '% heal ' + (s.small + s.drinkHp) + '% (' + s.drinks + ' drinks) ' + s.deaths + 'd ' + s.hits + 'h ' + s.kills + 'k ' + s.secs + 's').join(' | ')
    + (r.hitBy && Object.keys(r.hitBy).length ? '\n    hit by (nearest foe, hits/%hp): ' + Object.entries(r.hitBy).sort((a, b) => b[1][1] - a[1][1]).map(([k, v]) => k + ' ' + v[0] + '/' + v[1] + '%').join(' ') : '') + (r.deathLog && r.deathLog.length ? '\n    deaths: ' + r.deathLog.map(d => d.by + (d.el ? '(elite)' : '') + '@' + d.at.join(',')).join(' ') : '') + (r.subs && r.subs.length ? String.fromCharCode(10) + '    sub-routes: ' + r.subs.map(q => q.kind + '@f' + q.f + (q.key ? ' ' + q.key + '@' + q.at.join(',') : '') + (q.from ? ' from ' + q.from.join(',') : '') + ' ' + (q.ok ? 'ok' : 'DROPPED') + (q.got ? ' (KEY GOT)' : '') + ' ' + q.secs + 's').join(', ') : '') + (r.duels && r.duels.length ? String.fromCharCode(10) + '    elite duels: ' + r.duels.map(d => d.t + (d.affix ? '/' + d.affix : '') + '@' + d.at[0] + ' ' + (d.won ? 'WON' : 'lost') + ' ' + d.secs + 's ' + d.hp0 + '->' + d.hpEnd + '%').join(', ') : '') + (r.pageErrors ? '\n    PAGE ERRORS ' + JSON.stringify(r.pageErrors) : '');
/* one row a level x hero: means over its seeds, read against the targets */
export function summarize(rows) {
  const by = {}; for (const r of rows) { if (r.err) continue; (by[r.id + '|' + r.hero] = by[r.id + '|' + r.hero] || []).push(r); }
  return Object.values(by).map(R => { const arr = R.flatMap(r => r.arrivals.filter(a => !a.start && !a.postMini).map(a => a.hp)), d = mean(R.map(r => r.deaths)), a = mean(arr), lost = mean(R.flatMap(r => r.sections.slice(0, r.arrivals.length).map(s => s.lost)));
    const miss = []; if (d < TARGET.deathsLo) miss.push('deaths ' + d.toFixed(1) + ' < ' + TARGET.deathsLo); if (d > TARGET.deathsHi) miss.push('deaths ' + d.toFixed(1) + ' > ' + TARGET.deathsHi);
    if (a !== null && a >= TARGET.arriveHp) miss.push('arrive ' + Math.round(a) + '% >= ' + TARGET.arriveHp);
    return { id: R[0].id, hero: R[0].hero, lvl: R[0].lvl, runs: R.length, deaths: d, arriveMean: a, arriveMin: arr.length ? Math.min(...arr) : null, lostPerSection: lost,
      drinks: mean(R.map(r => r.sections.reduce((s, x) => s + x.drinks, 0))), kills: mean(R.map(r => r.kills)), secs: mean(R.map(r => r.secs)), walked: mean(R.map(r => r.walked)),
      coverage: mean(R.map(r => r.coverage)), stucks: R.flatMap(r => (r.stucks || []).map(st => st.way.join(','))), hazard: mean(R.map(r => (r.deathLog || []).filter(d => HAZARD.test(d.by)).length)), elite: mean(R.map(r => (r.deathLog || []).filter(d => d.el).length)), ends: R.map(r => r.end).join('/'), miss }; });
}
export const table = S => ['level'.padEnd(11) + 'hero'.padEnd(7) + 'L'.padStart(3) + ' runs deaths(haz/elite) arrive%(mean/min)  lost%/sec  drinks  kills  secs  walked  meas  end            vs target',
  ...S.map(s => s.id.padEnd(11) + s.hero.padEnd(7) + String(s.lvl).padStart(3) + String(s.runs).padStart(5) + (s.deaths.toFixed(1) + '(' + s.hazard.toFixed(1) + '/' + s.elite.toFixed(1) + ')').padStart(16) + ((s.arriveMean === null ? '-' : Math.round(s.arriveMean)) + '/' + (s.arriveMin ?? '-')).padStart(19)
    + (s.lostPerSection === null ? '-' : Math.round(s.lostPerSection)).toString().padStart(11) + s.drinks.toFixed(1).padStart(8) + Math.round(s.kills).toString().padStart(7) + Math.round(s.secs).toString().padStart(6) + (Math.round(s.walked) + '%').padStart(8) + (Math.round(s.coverage) + '%').padStart(6) + '  ' + s.ends.padEnd(15)
    + (s.miss.length ? 'MISS: ' + s.miss.join(', ') : 'on target') + (s.stucks.length ? '  STUCK ' + [...new Set(s.stucks)].join(' ') : ''))].join('\n');

if (process.argv[1] && /level-walk\.mjs$/.test(process.argv[1])) {
  const args = process.argv.slice(2), opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
  const ids = args.filter(a => !a.startsWith('-')).flatMap(a => a.split(',')).filter(Boolean);
  if (!ids.length) { console.log('usage: PORT=8708 node tools/level-walk.mjs <id>[,<id>..] [--heroes=knight,warden,pyro] [--seeds=2] [--frames=36000] [--stuck=1500] [--jobs=1] [--json=out.json]'); process.exit(2); }
  const heroes = opt('heroes', 'knight,warden,pyro').split(','), seeds = +opt('seeds', 2), jobs = Math.max(1, +opt('jobs', 1)), OUT = opt('json', '');
  const o = { level: levelOverride() ?? undefined, frames: +opt('frames', 36000), stuck: +opt('stuck', 1500), deaths: +opt('deaths', 8), profile: opt('profile', 'human+first'), skills: opt('skills', '1') !== '0', strict: args.includes('--strict'), reachHero: args.includes('--reach-hero'), dk: args.includes('--dk'), nofoes: opt('nofoes', '') ? opt('nofoes').split('-').map(Number) : null, trace: opt('trace', '') ? opt('trace').split('-').map(Number) : null, traceFrom: +opt('tracefrom', 0), traceN: +opt('tracen', 400), from: opt('from', '') ? +opt('from') : null, duel: opt('duel', '1') !== '0', subs: opt('subs', '1') !== '0', mini: opt('mini', '1') !== '0' };
  if (opt('tonics', null) !== null) o.tonics = +opt('tonics'); if (opt('charm', null) !== null) o.charm = opt('charm') === 'none' ? null : opt('charm');
  const cfgs = []; for (const id of ids) for (const h of heroes) for (let s = 1; s <= seeds; s++) cfgs.push(walkCfg(id, h, s, o));
  const t0 = Date.now(), rows = await runWalks(cfgs, { jobs, onRow: (r, all) => { console.log(line(r)); if (r.trace) console.log('    trace: ' + r.trace.join(' ')); if (OUT) writeFileSync(OUT, JSON.stringify(all, null, 1)); } });
  console.log('\nLEVEL WALK  (campaign level, typical build, profile ' + o.profile + ', ' + rows.length + ' runs, ' + Math.round((Date.now() - t0) / 60000) + ' min)  target: ' + TARGET.deathsLo + '-' + TARGET.deathsHi + ' deaths a first run, arrive < ' + TARGET.arriveHp + '%');
  console.log(table(summarize(rows)));
  if (OUT) writeFileSync(OUT, JSON.stringify(rows, null, 1));
}
