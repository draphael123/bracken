// tools/colossus-respawn.mjs - DRAWN AS A PLATFORM = SOLID; NOT SOLID = NOT DRAWN AS ONE (claude/colossusrework, Daniel's 10-13 playtest).
//
// Daniel, 10-13, on THE GLASS COLOSSUS: "after you die the LASERS stay in position but you cannot jump on them". The cause: a respawn puts the grid back
// as built (main.js spawnEntitiesTail: grid0) - the fused glass of every sand bed goes back to AIR - but src/glass-sea-hands.js reset KEEPS the rule's state
// through a respawn (the mirrors as turned, the beds as fused: b.set tiles counted as laid), and the beam still lands on the heap, so nothing re-laid the
// cells: THE STEPS' BRIDGE beside the last checkpoint (and the vault stair, the head's road...) was drawn as glass, lit by its beam, and fell through.
//
// In the page, THE GLASS SEA: every bed's mirror turned (fused), into the arena, the fight woken, the giant made to WALK to another station (his holds
// move with him: claude/colossusrework), his SUN LANCE told and fired - and the hero killed mid-lance. After the respawn (and again settled):
//   - every bed tile DRAWN as glass (index < b.set) is a ONEWAY cell, and no bed tile that is not drawn is solid (drawn = solid, both ways);
//   - every hold the art draws on the giant (S.G knee / hip / shoulder ledges) is ONEWAY, and no ONEWAY cell stands in the arena's air that is not a drawn hold;
//   - JUMPABLE: the hero dropped on a drawn bed tile and on every drawn hold lands and STANDS on it (ground, feet on the tile's top).
//   PORT=<your port> node tools/colossus-respawn.mjs        (PROVED RED FIRST on master 7d920edb: see work/claude/lane-done/claude-colossusrework.md)
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false }); let r;
try {
  r = await pg.evalp(`(async()=>{const {LEVELS,T}=await import('/src/level.js');BK.manualSimulation=true;
  const gi=LEVELS.findIndex(l=>l.id==='glasssea');BK.setHero('knight');BK.reset({fresh:true});BK.load(gi);BK.start();BK.god=true;BK.sim(10);
  const GS=BK.glassSea(),L=BK.L,TS=16,cell=(x,y)=>L.grid[y*L.W+x];
  const want={stepsRelay:'/',first:'\\\\',bridge:'\\\\',chainA:'/',chainB:'/',gaze:'/',spire:'\\\\'};
  for(const m of GS.mirrors){const s=want[m.id];if(s==null)continue;const n=m.notches.indexOf(s);if(n>=0){m.n=n;m.state=s;}}
  for(let i=0;i<240;i++){BK.P.hp=BK.P.maxHp;BK.sim(1);}
  const fusedBefore=GS.beds.filter(b=>b.set>0).map(b=>b.id+':'+b.set);
  /* into the arena; wake him */
  const A=L.arena;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);let f=0;for(;f<600&&!BK.bossActive;f++){BK.P.hp=BK.P.maxHp;BK.sim(1);}
  const CO=BK.colossusHands(),S0=CO.show(),e=BK.boss;let moved=null;
  for(let i=0;i<300&&(e.mode==='wake'||e.mode==='sleep');i++)BK.sim(1);
  const scan=(phase)=>{const bad=[];const S=CO.show();
    for(const b of GS.beds){b.tiles.forEach(([x,y],i)=>{const c=cell(x,y);if(i<b.set&&c!==T.ONEWAY)bad.push('bed '+b.id+' tile '+x+','+y+' DRAWN as glass but cell '+c);if(i>=b.set&&c===T.ONEWAY)bad.push('bed '+b.id+' tile '+x+','+y+' solid but NOT drawn');});}
    const holds=[];if(S&&S.G){for(const l of [...S.G.knee,...S.G.hip,...S.G.shoulder]){const y=Math.round(l.y/TS);for(let x=Math.round(l.l/TS);x<Math.round(l.r/TS);x++){holds.push(x+','+y);if(cell(x,y)!==T.ONEWAY)bad.push('hold '+x+','+y+' DRAWN but cell '+cell(x,y));}}}
    const ax0=Math.round(A.x0/TS),ax1=Math.round(A.x1/TS),F=Math.round(A.floor/TS);for(let y=F-16;y<F;y++)for(let x=ax0;x<ax1;x++)if(cell(x,y)===T.ONEWAY&&!holds.includes(x+','+y))bad.push('arena cell '+x+','+y+' solid but no hold drawn there');
    return {phase,bad};};
  /* (claude/colossusrework) he walks between his stations: make him walk once, so his holds are somewhere else when the hero dies */
  if(CO.forceWalk){const x0=e.x;CO.forceWalk();for(let i=0;i<1800&&(CO.show().walk||Math.abs(e.x-x0)<8);i++){BK.P.hp=BK.P.maxHp;BK.tp(Math.round((A.x0+40)/16),Math.round(A.floor/16)-1);BK.sim(1);}moved=Math.round(e.x-x0);}
  const walked=scan('after he walked to another station (his holds moved with him)');
  /* his lance: told and fired, the hero out on the floor in its line */
  const S=CO.show(),CG=await import('/src/glass-colossus.js');S.cd=0;S.lock=0;S.ward=0;
  let lanced=false;for(let i=0;i<900;i++){BK.P.hp=BK.P.maxHp;if(e.mode==='idle'&&S.cd<=0.05){const k=CG.COL.chain[S.ph].indexOf('lance');if(k>=0)S.i=k;}BK.sim(1);if(e.mode==='lance'&&S.lance&&S.lance.head>20){lanced=true;break;}}
  BK.god=false;BK.P.inv=0;BK.damagePlayer(BK.P.x,99999,{unblockable:true,name:'TEST'});let died=!!BK.P.dead;for(let i=0;i<600&&BK.P.dead;i++)BK.sim(1);if(BK.P.dead)BK.respawn();BK.god=true;
  const land=(x,y)=>{BK.tp(x,y-3);BK.P.vx=0;BK.P.vy=0;for(let i=0;i<50;i++){BK.P.hp=BK.P.maxHp;BK.sim(1);}return BK.P.ground&&Math.abs(BK.P.y-y*TS)<3;};
  BK.sim(60);const ph=[walked,scan('after the respawn')];
  for(const q of BK.enemies())if(q.alive&&q.t!=='colossus')q.alive=false;   /* (the steps' throwers knock a test hero off the glass: the landing asks only the tiles) */
  const fell=[];
  for(const b of GS.beds){if(!b.set)continue;const ks=[...new Set([0,Math.floor((b.set-1)/2),b.set-1])];for(const k of ks){const [x,y]=b.tiles[k];if(!land(x,y))fell.push('bed '+b.id+' '+x+','+y+' (drawn) - fell through');}}
  { const S=CO.show();if(S&&S.G)for(const l of [...S.G.knee,...S.G.hip,...S.G.shoulder]){const x=Math.floor(((l.l+l.r)/2)/TS),y=Math.round(l.y/TS);if(!land(x,y))fell.push('hold '+x+','+y+' (drawn) - fell through');}}
  BK.sim(600);ph.push(scan('after the respawn, settled'));
  return {fusedBefore,moved,lanced,died,ph,fell,fusedAfter:GS.beds.filter(b=>b.set>0).map(b=>b.id+':'+b.set),errs:null};})()`, 900000);
  r.errors = pg.errors.slice(0, 3);
} finally { pg.close(); }
let bad = 0; const say = (ok, m) => { console.log((ok ? 'ok   ' : 'FAIL ') + m); if (!ok) bad++; };
say(r.fusedBefore.length >= 4, 'beds fused before the fight: ' + r.fusedBefore.join(' '));
say(r.lanced, 'the hero died mid-lance (the bolt in flight)' + (r.moved != null ? '; he had walked ' + r.moved + ' px to another station first' : ''));
say(r.died, 'the hero died (and respawned)');
for (const p of r.ph) say(!p.bad.length, p.phase + ': ' + (p.bad.length ? p.bad.length + ' mismatch(es): ' + p.bad.slice(0, 6).join('; ') : 'every drawn platform is solid and every solid one drawn'));
say(!r.fell.length, 'JUMPABLE: every drawn bed and hold sampled holds the hero up' + (r.fell.length ? ': ' + r.fell.slice(0, 6).join('; ') : ''));
if (r.errors && r.errors.length) say(false, 'page errors ' + JSON.stringify(r.errors));
if (bad) { console.log('COLOSSUS-RESPAWN: ' + bad + ' problem(s)'); process.exit(1); }
console.log('COLOSSUS-RESPAWN OK: killed mid-lance, every platform drawn after the respawn is one you stand on (fused: ' + r.fusedAfter.join(' ') + ')');
