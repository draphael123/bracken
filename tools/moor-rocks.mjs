/* tools/moor-rocks.mjs - GALE MOOR's WIND ROCKS and GOBLIN SCAFFOLDS (claude/moor2, scratch/brief-moor2.md; src/moor-rocks-hands.js).
   The kite ride is gone (flight is the Sky Road's) and two ground sections of told gusts stand in its columns. This proves they are what the
   brief says, off the BUILT level (Node) and then in the real page (the hero's own keys, no god mode, knight / warden / pyro):

   STATIC
   1. A GROUND LEVEL: no kite, no flight; THE WIND ROCKS and THE GOBLIN SCAFFOLDS are named sections between the Tumble and the landing.
   2. A CREVICE IS A BURST, NOT A RIDE: every crevice whistles before it blows (its still spell holds the whistle), its burst is short, and the
      height the reach model is told (h) is no more than the burst can throw (lift^2 / 2g). Each one lifts you to footing a real jump cannot
      reach (more than JUMP_UP rows) and the burst can (inside its throw, with a tile to spare).
   3. EVERY ROUTE NEED IS NEEDED: the relic-free fill reaches the landing's checkpoint; with the crevices gone it does not reach Tor A's top,
      and with the half-built frame never laid down it does not reach the landing. (Glint + nudge on each: src/stuck-spots.js, tools/stuck.mjs.)
   4. BASE MOVEMENT: the one gap on the rocks' main route (ridge to Tor B) is two tiles, under the shortest real jump (~3.2).
   5. THE HIGH TOR: its crevice blows twice a turn, once in the still of the headwind on top (lands you to stay) and once into it.
   6. THE GAP TO THE LANDING is wider than any jump, and the gust that lays the frame down stops so far short of it that no carried jump
      crosses it (a carried run is 240 px/s for a 0.64 s jump: 154 px, under 10 tiles).
   7. THE WIND AS A WEAPON: every scaffold gust lies over deep water, so a goblin it takes off a deck goes into the tarn; every deep pool on the
      moor hurts and hands you back (L.waterHurts, L.noWade), and every other pool is a shallow bog as before.
   RUNTIME (node tools/moor-rocks.mjs; --static for Node only)
   8. Per hero: the first crevice throws you onto Tor A; a gust on the ridge unbraced puts you in the tarn (hurt, handed back to dry rock) and
      braced holds you; Tor B is a jump from the ridge's end; the high tor's crevice burst in the still leaves you on top and the one into the
      gust does not; the two gust shafts put you on the first deck and the top deck; a goblin struck as the deck's gust blows is taken into
      the tarn and one struck in the still is not; the frame's rope struck in the still holds, struck in the gust lays the bridge, and the
      hero walks over it onto the landing. */
import assert from 'node:assert/strict';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { CREVICE } from '../src/moor-rocks-hands.js';

const TS = 16, G = 1000, JUMP_UP = 3, REAL_JUMP = 3.2, CARRY_PX = 240 * 0.64;
const lv = LEVELS.find(l => l.id === 'moor'), L = lv.build(), at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H) ? T.SOLID : L.grid[y * L.W + x];
const stand = t => t === T.SOLID || t === T.ONEWAY || t === T.PLANK || t === T.NET;
const surface = (x, from = 0) => { for (let y = from; y < L.H; y++) if (stand(at(x, y)) && !stand(at(x, y - 1))) return y; return null; };
const out = [];

/* 1 */
assert(!L.flight && !L.ents.some(e => e.t === 'stormkite'), 'no kite ride on the moor');
const sec = id => L.sections.find(s => s.id === id), R = sec('wind-rocks'), S = sec('goblin-scaffolds'), LD = sec('landing');
assert(R && S && LD && sec('tumble').x1 + 1 === R.x0 && R.x1 + 1 === S.x0 && S.x1 + 1 === LD.x0, 'the Tumble, THE WIND ROCKS, THE GOBLIN SCAFFOLDS and the landing, in that order');

/* 2 */
const crev = L.ents.filter(e => e.t === 'vent' && e.crevice);
assert(crev.length >= 4, 'two crevices and two gust shafts: ' + crev.length);
for (const c of crev) {
  const throwPx = c.lift * c.lift / (2 * G), foot = c.y + 1;
  assert(c.period - c.on >= CREVICE.tell, 'the crevice at ' + c.x + ' whistles for ' + CREVICE.tell + ' s before it blows (still ' + (c.period - c.on) + ' s)');
  assert(c.on <= 0.6, 'the crevice at ' + c.x + ' is a burst, not a ride: ' + c.on + ' s');
  assert(c.h <= throwPx, 'the reach model is told no more than the throw (' + c.h + ' <= ' + Math.round(throwPx) + ' px) at ' + c.x);
  /* the footing it is for: the nearest standable surface above the mouth within three columns that a jump does not reach */
  let best = null; for (let dx = -3; dx <= 3; dx++) { for (let y = foot - 1; y >= 0; y--) if (stand(at(c.x + dx, y)) && !stand(at(c.x + dx, y - 1)) && foot - y > JUMP_UP) { if (!best || y > best.y) best = { x: c.x + dx, y }; break; } }
  assert(best, 'the crevice at ' + c.x + ' lifts you to footing a jump cannot reach');
  const rise = (foot - best.y) * TS; assert(rise + TS <= throwPx, 'and its throw reaches it with a tile to spare: ' + rise + ' + 16 <= ' + Math.round(throwPx) + ' px');
  out.push((c.shaft ? 'shaft ' : 'crevice ') + c.x + ' (' + (foot - best.y) + ' rows, throw ' + Math.round(throwPx / TS * 10) / 10 + ')');
}

/* 3 */
const check = L.ents.find(e => e.t === 'check' && e.x >= LD.x0 && e.x <= LD.x1), torA = crev[0];
const reach = M => floodReach(M, T, { rides: true });
const full = reach(L); assert(full.jumpNear(check.x, check.y), 'the relic-free fill reaches the landing checkpoint ' + check.x + ',' + check.y);
const topA = [torA.x + 2, surface(torA.x + 2) - 1];
assert(full.seen.has(topA.join(',')), 'and Tor A\'s top ' + topA);
const noCrev = reach({ ...L, ents: L.ents.filter(e => !e.crevice) });
assert(!noCrev.seen.has(topA.join(',')), 'without the crevice nothing reaches Tor A\'s top: the crevice is the way');
const noFrame = reach({ ...L, ents: L.ents.filter(e => e.t !== 'gustframe') });
assert(!noFrame.jumpNear(check.x, check.y), 'without the frame laid down nothing reaches the landing: the frame is the way');

/* 4 */
{ let x = R.x0, gaps = []; const row = 8;   /* the ridge and Tor B stand on row 8 */
  for (let c = R.x0; c <= R.x1; c++) if (at(c, row) === T.AIR && at(c - 1, row) !== T.AIR && at(c - 1, row - 1) === T.AIR) { let n = 0; while (at(c + n, row) === T.AIR) n++; if (at(c + n, row) !== T.AIR && c + n <= R.x1) gaps.push(n); }
  assert(gaps.length >= 1 && gaps.every(n => n < REAL_JUMP), 'the rocks\' gaps on the ridge row are under a real jump: ' + gaps); out.push('ridge gap ' + gaps.join(',')); x; }

/* 5 */
{ const head = L.gusts.find(z => z.shove && z.dir < 0 && z.x0 >= R.x0 * TS && z.x1 <= (R.x1 + 1) * TS), c2 = crev[1];
  assert(head && c2 && !c2.shaft, 'the high tor has a headwind on top and a crevice at its foot');
  const bursts = []; for (let t = 0; t < head.period * 2; t += 0.01) { const ph = (t + c2.phase) % c2.period; if (ph < 0.01) bursts.push(t); }
  const blowing = t => { const g = (t + head.phase) % head.period; return g < head.on || g > head.period - 1.2; };   /* blowing, or heard building */
  const lands = t => !blowing(t + 0.5) && !blowing(t + 0.5 + 0.8);   /* half a second up, and a hop's worth of still after */
  assert(bursts.some(lands) && bursts.some(t => !lands(t)), 'one burst a turn lands you in the still on top, and one throws you into the gust: ' + bursts.map(t => t.toFixed(2) + (lands(t) ? ' still' : ' gust')).join(', '));
  out.push('high tor bursts ' + bursts.map(t => t.toFixed(1) + (lands(t) ? ' still' : ' gust')).join(' / ')); }

/* 6 */
{ const fr = L.ents.find(e => e.t === 'gustframe'), gap = fr.span[1] - fr.span[0] + 1, z = L.gusts.find(q => q.scaffold && fr.x * TS > q.x0 && fr.x * TS < q.x1);
  assert(gap > REAL_JUMP + 2 && gap > 6, 'the gap to the landing is wider than any jump, the model\'s six included: ' + gap);
  assert(z && z.dir > 0, 'an east gust blows over the frame');
  assert(LD.x0 * TS - z.x1 > CARRY_PX + TS, 'its gust stops ' + Math.round((LD.x0 * TS - z.x1) / TS) + ' tiles short of the landing: no carried jump crosses (' + Math.round(CARRY_PX / TS) + ' tiles at most)');
  for (let x = fr.span[0]; x <= fr.span[1]; x++) assert(at(x, fr.row) === T.AIR, 'the span is open until the frame falls: ' + x);
  out.push('frame gap ' + gap); }

/* 7 */
assert(L.waterHurts && L.noWade, 'the moor\'s deep water hurts and hands you back');
const deep = L.pools.filter(p => !p.shallow), shallow = L.pools.filter(p => p.shallow);
assert(deep.every(p => p.x0 >= R.x0 * TS && p.x1 <= (S.x1 + 1) * TS), 'the only deep water is the two tarns in the new sections');
assert(shallow.length >= 3, 'the bogs are still bogs');
for (const z of L.gusts.filter(q => q.scaffold)) for (let x = Math.floor(z.x0 / TS) + 1; x < Math.ceil(z.x1 / TS); x++)
  assert(deep.some(p => x * TS >= p.x0 && x * TS < p.x1), 'a goblin the scaffold gust takes at column ' + x + ' falls into the tarn');
console.log('moor-rocks (static) OK: ' + out.join('; ') + '.');
if (process.argv.includes('--static')) process.exit(0);

/* ---------------- RUNTIME ---------------- */
const { openPage } = await import('./cdp.mjs');
const heroes = (process.argv.find(a => a.startsWith('--heroes=')) || '--heroes=knight,warden,pyro').slice(9).split(',');
const pg = await openPage({ audio: false, fonts: false });
let rows;
try {
  rows = await pg.evalp(`(async()=>{
  const {LEVELS,T}=await import('/src/level.js');const lvI=LEVELS.findIndex(l=>l.id==='moor');BK.manualSimulation=true;const out=[];
  for(const hero of ${JSON.stringify(heroes)}){
    const boot=()=>{BK.setHero(hero);BK.reset({fresh:true});BK.load(lvI);BK.state='play';BK.god=false;BK.sim(20);for(const e of BK.enemies())if(!e.maxHp)e.alive=false;};
    boot();const L=BK.L,K=BK.keys,P=()=>BK.P,clear=()=>{for(const k of ['left','right','jump','block','up','down','atk'])K[k]=false;};
    const ents=L.ents,crev=ents.filter(e=>e.t==='vent'&&e.crevice),fr=ents.find(e=>e.t==='gustframe');
    const gz=L.gusts.filter(z=>z.shove&&!z.arena),ridge=gz.find(z=>z.dir>0&&!z.scaffold&&z.x0>=530*16),head=gz.find(z=>z.dir<0&&z.x0>=560*16),deck1=gz.find(z=>z.scaffold&&z.y1>=17*16),deck2=gz.find(z=>z.scaffold&&z.y1<=13*16);
    const ph=(o)=>(BK.time+(o.phase||0))%o.period, waitPh=(o,lo,hi)=>{for(let i=0;i<60*12&&!(ph(o)>=lo&&ph(o)<hi);i++)BK.sim(1);};
    const put=(x,y)=>{BK.tp(x,y);P().vx=0;P().vy=0;BK.sim(4);}, tile=()=>[Math.floor(P().x/16),Math.floor((P().y-1)/16)];
    const full=()=>{P().hp=P().maxHp;P().inv=0;return P().hp;};
    const r={hero};
    /* the first crevice: stand in it, hold toward the tor after the burst */
    boot();clear();waitPh(crev[0],crev[0].period-0.4,crev[0].period-0.35);put(crev[0].x,crev[0].y);full();for(let i=0;i<150;i++){if(P().vy<-50)K.right=true;BK.sim(1);}clear();BK.sim(20);r.torA=tile();
    /* the ridge: a gust unbraced near its end, then the same braced */
    const onA=()=>{put(546,7);BK.sim(10);};   /* (dry rock first: the tarn hands you back to the last dry footing you stood on) */
    boot();clear();onA();waitPh(ridge,ridge.period-0.2,ridge.period-0.1);put(560,7);let h=full();for(let i=0;i<150;i++)BK.sim(1);r.ridgeUnbraced={at:tile(),hurt:P().hp<h,dead:!!P().dead};
    boot();clear();onA();waitPh(ridge,ridge.period-0.4,ridge.period-0.3);put(560,7);h=full();K.block=true;K.down=false;for(let i=0;i<150;i++)BK.sim(1);clear();r.ridgeBraced={at:tile(),hurt:P().hp<h};
    /* Tor B from the ridge's end, in the still */
    boot();clear();onA();waitPh(ridge,ridge.on+0.1,ridge.on+0.2);put(561,7);h=full();K.right=true;let j=-1;for(let i=0;i<90;i++){if(j<0&&P().x>=562*16+8){K.jump=true;BK.press('jump');j=i;}if(j>=0&&i===j+16)K.jump=false;BK.sim(1);}clear();BK.sim(20);r.torB={at:tile(),hurt:P().hp<h};
    /* the high tor's crevice: each burst of a turn, holding toward the boulders once in the air */
    const burstAt=(c,which)=>{waitPh(head,0,0.02);let n=0;for(let i=0;i<60*6;i++){const p=ph(c);if(p<0.02){if(n===which)return;n++;BK.sim(3);}BK.sim(1);}};
    r.highTor=[];for(const which of [0,1]){boot();clear();put(crev[1].x,crev[1].y);h=full();for(const e of BK.enemies())if(!e.maxHp)e.alive=false;
      burstAt(crev[1],which);const t0=(BK.time+head.phase)%head.period;for(let i=0;i<140;i++){if(P().vy<-50||(!P().ground&&P().y<6*16))K.right=true;else if(P().ground)K.right=false;BK.sim(1);}clear();BK.sim(30);r.highTor.push({burstInHeadwindTurn:+t0.toFixed(2),at:tile()});}
    /* the gust shafts */
    boot();clear();waitPh(crev[2],crev[2].period-0.4,crev[2].period-0.35);put(crev[2].x,crev[2].y);for(let i=0;i<120;i++)BK.sim(1);BK.sim(20);r.shaft1=tile();
    boot();clear();waitPh(crev[3],crev[3].period-0.4,crev[3].period-0.35);put(crev[3].x,crev[3].y);for(let i=0;i<120;i++)BK.sim(1);BK.sim(20);r.shaft2=tile();
    /* the wind as a weapon: a goblin on the first deck, struck as the gust blows, and one struck in the still */
    const strikeFoe=(inGust)=>{BK.setHero(hero);BK.reset({fresh:true});BK.load(lvI);BK.state='play';BK.god=true;BK.sim(10);
      const f=BK.enemies().find(e=>e.alive&&e.t==='archer'&&e.y<=17*16+2&&e.y>=16*16&&e.x>=600*16&&e.x<=629*16);   /* (the bow: the shield goblin turns a blow from the front on his shield, and the wind takes no one a blow did not reach) */for(const e of BK.enemies())if(e!==f&&!e.maxHp)e.alive=false;
      if(!f)return {none:true};if(inGust)waitPh(deck1,0.1,0.15);else waitPh(deck1,deck1.on+0.3,deck1.on+0.4);put(Math.floor(f.x/16)-1,16);P().face=1;
      for(let i=0;i<40;i++){if(i%8===0)BK.press('atk');BK.sim(1);}for(let i=0;i<120;i++)BK.sim(1);return {alive:f.alive,x:Math.floor(f.x/16),y:Math.floor(f.y/16),t:f.t};};
    r.blowGust=strikeFoe(true);r.blowStill=strikeFoe(false);
    /* the frame: its rope struck in the still holds; struck as the gust blows, the wind lays it over the gap; then walk onto the landing */
    BK.setHero(hero);BK.reset({fresh:true});BK.load(lvI);BK.state='play';BK.god=true;BK.sim(10);for(const e of BK.enemies())if(!e.maxHp)e.alive=false;
    waitPh(deck2,deck2.on+0.4,deck2.on+0.5);put(fr.anchor-1,12);P().face=1;for(let i=0;i<30;i++){if(i%10===0)BK.press('atk');BK.sim(1);}BK.sim(60);
    const span=()=>{   /* (BK.L: every boot is a fresh level, and its grid with it) */let n=0;for(let x=fr.span[0];x<=fr.span[1];x++)if(BK.L.grid[fr.row*BK.L.W+x]===T.PLANK)n++;return n;};
    r.ropeStill=span();waitPh(deck2,0.05,0.1);put(fr.anchor-1,12);P().face=1;for(let i=0;i<30;i++){if(i%10===0)BK.press('atk');BK.sim(1);}BK.sim(150);r.ropeGust=span();
    BK.god=false;put(fr.span[0]-2,12);K.right=true;for(let i=0;i<240;i++)BK.sim(1);clear();r.overBridge=tile();
    out.push(r);}
  BK.manualSimulation=false;return out;})()`, 1800000);
} finally { pg.close(); }
let bad = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) bad++; };
const torAx = [541, 562], onTop = (t, x0, x1, row) => t[0] >= x0 && t[0] <= x1 && t[1] === row;
for (const r of rows) {
  ok(onTop(r.torA, ...torAx, 7), r.hero + ': the first crevice throws you onto Tor A (or on along its ridge) ' + r.torA);
  ok(r.ridgeUnbraced.hurt && !r.ridgeUnbraced.dead && r.ridgeUnbraced.at[0] <= 550, r.hero + ': unbraced on the ridge, the gust puts you in the tarn: hurt and handed back to dry rock ' + JSON.stringify(r.ridgeUnbraced));
  ok(!r.ridgeBraced.hurt && r.ridgeBraced.at[1] === 7 && r.ridgeBraced.at[0] >= 551, r.hero + ': braced, the ridge holds you ' + JSON.stringify(r.ridgeBraced));
  ok(!r.torB.hurt && onTop(r.torB.at, 565, 572, 7), r.hero + ': Tor B is a jump from the ridge\'s end ' + JSON.stringify(r.torB));
  const up = r.highTor.filter(q => q.at[1] <= 2 && q.at[0] >= 573), down = r.highTor.filter(q => !(q.at[1] <= 2 && q.at[0] >= 573));
  ok(up.length === 1 && down.length === 1, r.hero + ': the high tor - one burst leaves you on top, the one into the gust does not ' + JSON.stringify(r.highTor));
  ok(r.shaft1[1] === 16, r.hero + ': the first gust shaft puts you on the first deck ' + r.shaft1);
  ok(r.shaft2[1] === 12, r.hero + ': the second puts you on the top deck ' + r.shaft2);
  ok(!r.blowGust.none && !r.blowGust.alive, r.hero + ': a goblin struck as the deck\'s gust blows goes into the tarn ' + JSON.stringify(r.blowGust));
  ok(!r.blowStill.none && (r.blowStill.alive ? r.blowStill.y <= 17 : true) && !(r.blowStill.y >= 22), r.hero + ': one struck in the still is not taken by the wind ' + JSON.stringify(r.blowStill));
  ok(r.ropeStill === 0 && r.ropeGust === 7, r.hero + ': the rope struck in the still holds (' + r.ropeStill + ' planks), struck in the gust lays the bridge (' + r.ropeGust + ')');
  ok(r.overBridge[0] >= 647 && r.overBridge[1] === 12, r.hero + ': and walks over it onto the landing ' + r.overBridge);
}
console.log(bad ? 'moor-rocks: ' + bad + ' failure(s)' : 'moor-rocks OK: ' + rows.length + ' heroes, every crevice, crossing, shaft, wind-blow and the frame behave as built.');
process.exitCode = bad ? 1 : 0;
