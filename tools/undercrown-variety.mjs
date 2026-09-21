// tools/undercrown-variety.mjs — THE UNDERCROWN GOES FURTHER, AND ITS PRINCE IS A GOBLIN (batch 3 of work/claude/KICKOFF.md).
// Built: the level is wider and has more ground to walk than the 104-wide mine it was (768 standing cells), it has three
// kinds of wall (the mine, THE GLITTER VEIN's crystal, THE GOBLIN BARROW's ossuary), the stope's old shaft into the Last
// Drift is shut so the new places are ON the route, the vein is crossed on its crystal ledges alone (its floor is poison,
// counted here as nowhere to stand), and the barrow, the drift and the tomb are reached through it.
// Page: a crystal ledge crazes and goes under a standing hero and grows back once he is off it (L.hasCryst), the
// barrow's dead are bone goblins, and THE BURIED PRINCE's baked frame is a goblin's: an ear that stands OUT behind and
// ABOVE his head (the old one hung down it) and a jaw gone to bone. No page errors.
import assert from 'node:assert/strict';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { openPage } from './cdp.mjs';

const L = LEVELS.find(l => l.id === 'undercrown').build(), W = L.W, at = (x, y) => L.grid[y * W + x];
assert(W >= 150, 'the level is wider: ' + W);
const kinds = new Set(L.interiors.map(i => i[4]));
for (const k of ['mine', 'crystal', 'ossuary']) assert(kinds.has(k), 'a ' + k + ' wall');
assert(L.hasCryst, 'the vein\'s crystal is live');
const cryst = L.grid.filter(t => t === T.CRYST).length; assert(cryst >= 20, 'crystal ledges: ' + cryst);
for (let x = 84; x <= 91; x++) assert.notEqual(at(x, 122), T.AIR, 'the stope\'s old shaft into the drift is shut at ' + x);

// THE ROUTE, on the ledges alone: the vein's floor is poison (a spike here), and crystal is a plain ledge (the reach model's
// "crystal gives way" fall runs through rock, which would put the barrow under any ledge)
const G = L.grid.slice();
for (let x = 0; x < W; x++) if (L.grid[122 * W + x] === T.AIR && x >= 106 && x <= 140) G[122 * W + x] = T.SPIKE;
for (let i = 0; i < G.length; i++) if (G[i] === T.CRYST) G[i] = T.ONEWAY;
const R = floodReach({ ...L, grid: G }, T), has = (x, y) => R.seen.has(x + ',' + y);
const stand = [...R.seen].length;
assert(stand >= 850, 'more ground to walk than the old mine\'s 768: ' + stand);
const route = { veinWest: has(100, 121), veinEast: has(142, 121), silver: has(129, 115), barrow: has(120, 140), drift: has(50, 140), tomb: has(40, 166) };
for (const [k, v] of Object.entries(route)) assert(v, 'reached on the ledges alone: ' + k);
// and without the vein's ledges, nothing past it is: the vein is the way
const G2 = G.slice(); for (let i = 0; i < G2.length; i++) if (G2[i] === T.ONEWAY && Math.floor(i / W) >= 110 && Math.floor(i / W) <= 121 && i % W >= 106 && i % W <= 140) G2[i] = T.AIR;
const R2 = floodReach({ ...L, grid: G2 }, T);
assert(!R2.seen.has('142,121') && !R2.seen.has('50,140'), 'the Glitter Vein is on the route, not beside it');
const foes = L.ents.filter(e => ['bonegob', 'bonearcher', 'shardling'].includes(e.t) && e.x >= 96);
assert(foes.filter(e => e.t === 'bonegob').length >= 4 && foes.some(e => e.t === 'shardling'), 'the new places have their own dead and their own glass');

const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='undercrown'));BK.start();BK.sim(10);
   for(const e of BK.enemies())e.alive=false;
   const Lv=BK.L,T=${JSON.stringify(T)},i=120*Lv.W+108;const before=Lv.grid[i];
   BK.tp(108,119);let broke=false;for(let f=0;f<240&&!broke;f++){BK.sim(1);if(Lv.grid[i]!==T.CRYST)broke=true;}
   BK.tp(100,121);let back=false;for(let f=0;f<600&&!back;f++){BK.sim(1);if(Lv.grid[i]===T.CRYST)back=true;}
   const c=BK.SPR.prince.R[0],g=c.getContext('2d'),d=g.getImageData(0,0,c.width,c.height).data;
   const skin=['#9cb46c','#6c8a4c','#4a6238','#2c3e24'].map(h=>[1,3,5].map(k=>parseInt(h.slice(k,k+2),16)).join()),bone='228,220,194';
   let ear=0,jaw=0,green=0;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){const o=(y*c.width+x)*4;if(!d[o+3])continue;const k=d[o]+','+d[o+1]+','+d[o+2];
     if(skin.includes(k)){green++;if(x<33&&y<22)ear++;}if(k===bone&&x>=46&&x<=62&&y>=24&&y<=36)jaw++;}
   return{before,broke,back,ear,jaw,green};})()`);
  assert.equal(r.before, T.CRYST);
  assert(r.broke, 'a crystal ledge goes under a standing hero'); assert(r.back, 'and grows back once he is off it');
  assert(r.ear >= 15, 'the Prince\'s ear stands out behind and above his head: ' + r.ear);
  assert(r.jaw >= 6, 'the Prince\'s jaw is bone: ' + r.jaw);
  assert.deepEqual(pg.errors, []);
  console.log('Undercrown variety: ' + W + ' wide, ' + stand + ' standing cells (was 768), walls ' + [...kinds].join('/') + ', ' + cryst + ' crystal tiles that break (' + r.broke + ') and grow back (' + r.back + '), ' + foes.length + ' new-place foes; the Prince: ' + r.ear + ' px of ear out behind, ' + r.jaw + ' px of bone jaw, ' + r.green + ' px of goblin green');
} finally { pg.close(); }
