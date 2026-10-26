/* tools/palisadeart.mjs - THE ART PASS OF THE PALISADE WOOD + THE BATTERING BEAST (claude/palisadeart), in the page. Art only: it must leave the level's data alone and draw everything the greybox left flat.
     THE LEVEL IS UNTOUCHED  its levelHash equals the greybox's stamp (344234fcd689): the reskins are a table (L.reskin) and the setter's skin is given at spawn (pw.pwSetter), never an ent flag; the tint / palette / ambient
                             data it adds are not hashed.
     THE KIT                 the TIMBER table (src/redraw/palisade_tiles.js) names only cells that ARE solid in the level; a tile of earth, of the palisade's logs, of the gatehouse's beams and of a scaffold deck are four pictures.
     ITS PEOPLE              the STAKE-SETTER (his own sheet, the sprig's 8 frames: the raise and the drive are not the walk), the LANTERN-HAND and the MAUL CREW (the rock goblin's and the brute's frames), each with a bestiary card;
                             every foe of the level is on its own sheet on the page.
     HIM                     THE BATTERING BEAST: every windup and release has a picture of its own (B16), none the rest pose, the cut-harness set is a different picture, he leaves a body, he has a card.
     ITS AIR                 its own ambient bed ('palisade': synth + the one creak clip), a frame of every area draws with no page error.
   node tools/palisadeart.mjs        (PORT=<your port>) */
import { readFileSync } from 'node:fs';
import { openPage } from './cdp.mjs';
import { levelHash } from './level-quality.mjs';
import { LEVELS } from '../src/level.js';
import * as AU from '../src/audio.js';
const src = f => readFileSync(new URL('../' + f, import.meta.url), 'utf8');
const pg = await openPage({ audio: false, fonts: false }); let bad = 0;
const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
const lv = LEVELS.find(l => l.id === 'palisadewood');
ok(levelHash(lv) === '344234fcd689', 'the level hash is the greybox\'s (art lanes never change the level data): ' + levelHash(lv));
const main = src('src/main.js');
for (const t of ['stakesetter', 'lanternhand', 'maulcrew', 'batteringbeast']) ok(new RegExp("\\{ t: '" + t + "', name:").test(main), 'a bestiary row for ' + t);
ok(AU.AMBIENT_NAMES.includes('palisade') && !!AU.AMBIENT_SOURCES.palisade && (lv.build().ambient || []).every(a => a.kind === 'palisade'), 'its own ambient bed (palisade: ' + AU.AMBIENT_SOURCES.palisade.join(', ') + ')');
try {
  const r = await pg.evalp(`(async()=>{
    const LV=(await import('/src/level.js')).LEVELS, idx=LV.findIndex(l=>l.id==='palisadewood'); BK.manualSimulation=true; BK.setHero('knight'); BK.reset({fresh:true}); BK.load(idx); BK.start(); BK.god=true; BK.sim(120);
    const out={}, S=BK.SPR, L=BK.L;
    const sig=cv=>{const d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;let h=2166136261;for(let i=0;i<d.length;i+=1){h=Math.imul(h^d[i],16777619)>>>0;}return h;};
    out.reskin=JSON.stringify(L.reskin);
    /* the timber table lies on solid cells */
    const PT=await import('/src/redraw/palisade_tiles.js'); out.timberBad=[]; for(const r of PT.TIMBER){ let n=0,s=0; for(let y=r.y0;y<=r.y1;y++)for(let x=r.x0;x<=r.x1;x++){ n++; if(L.grid[y*L.W+x]===1) s++; } if(r.k==='wall'?s/n<0.7:s<n) out.timberBad.push(r.k+' '+r.x0+'-'+r.x1+' '+s+'/'+n); }   /* a block must be solid throughout; the wall has its slot gaps (at least 70% solid) */
    /* four pictures: earth top, wall log, gatehouse beam, deck */
    const T={AIR:0,SOLID:1,ONEWAY:2,NET:99}, at=(x,y)=>L.grid[y*L.W+x]; const sg=(t,x,y)=>sig(PT.pwTile(t,x,y,at,T,L));
    out.tiles={ earth: sg(1,30,33), wall: sg(1,230,20), gate: sg(1,350,10), deck: sg(2,239,13)?0:0 };
    out.deckTop=(()=>{ for(let x=0;x<L.W;x++)for(let y=0;y<L.H;y++) if(at(x,y)===2) return sg(2,x,y); return 0; })();
    /* the foes */
    const en=BK.enemies(); out.foes={ setter:{n:0,skinned:0}, rock:{n:0,skinned:0}, brute:{n:0,skinned:0} };
    for(const e of en){ if(e.pwSetter){out.foes.setter.n++; if(e.cnSkin==='stakesetter') out.foes.setter.skinned++;} if(e.t==='rockgoblin'){out.foes.rock.n++; if(e.cnSkin==='lanternhand') out.foes.rock.skinned++;} if(e.t==='brute'){out.foes.brute.n++; if(e.cnSkin==='maulcrew') out.foes.brute.skinned++;} }
    out.sheets={}; for(const [sk,base] of [['stakesetter','sprig'],['lanternhand','rockgoblin'],['maulcrew','brute']]){ const s=S[sk]; out.sheets[sk]={have:!!s, frames:s&&s.R.length, base:S[base].R.length, left:s&&s.L.length, white:!!(s&&s.white)}; }
    const ss=S.stakesetter.R.map(sig); out.setterSig=ss;
    /* his frames */
    const B=await import('/src/redraw/battering_beast_art.js'); const modes=Object.keys(B.POSES); out.modes=modes; out.bsig={}; for(const m of modes){ out.bsig[m]=sig(B.frame(m,false,0,1)); out.bsig[m+'/cut']=sig(B.frame(m,true,0,1)); }
    out.dead={ok:!!B.deadSet().R[0], w:B.deadSet().R[0].width}; const card=BK.SPR.batteringbeastCard; out.card={w:card.R[0].width,h:card.R[0].height,n:card.R.length};
    /* the areas draw */
    out.area=[]; for(const x of [14,120,214,260,330,380]){ BK.tp(x, x<100?37:x<200?31:x<230?25:x<300?12:x<350?24:24); BK.sim(30); out.area.push(x); }
    BK.manualSimulation=false; return JSON.stringify(out); })()`, 300000);
  const o = JSON.parse(r);
  ok(o.reskin === '{"rockgoblin":"lanternhand","brute":"maulcrew"}', 'the level carries its reskin table: ' + o.reskin);
  ok(o.timberBad.length === 0, 'the TIMBER table lies on solid blocks of the level (the wall >= 70%, every other block whole)' + (o.timberBad.length ? ': ' + o.timberBad.join(' ') : ''));
  const ts = Object.values(o.tiles).filter(Boolean).concat([o.deckTop]); ok(new Set(ts).size === ts.length && ts.length === 4, 'earth, palisade log, gatehouse beam and scaffold deck are four different pictures');
  for (const [k, v] of Object.entries(o.foes)) ok(v.n > 0 && v.n === v.skinned, 'every ' + k + ' of the level wears its own skin on the page (' + v.skinned + '/' + v.n + ')');
  for (const [sk, v] of Object.entries(o.sheets)) ok(v.have && v.frames === v.base && v.left === v.base && v.white, sk + ' has its own sheet with the base\'s ' + v.base + ' frames, mirrored and white-flash');
  const [w0, w1, w2, w3, look, raise, drive, hurt] = o.setterSig; ok(new Set([w0, raise, drive, hurt, look]).size === 5 && raise !== w1 && drive !== w1 && raise !== w2 && raise !== w3, 'the stake-setter\'s raise (5), drive (6), look (4) and hurt (7) are each their own picture, none the walk');
  const need = ['sleep', 'wake', 'walk', 'recover', 'chargeTell', 'charge', 'dazed', 'sweepTell', 'sweep', 'volleyTell', 'volley', 'trampleTell', 'trample', 'stuck', 'tear', 'loose', 'dead'];
  ok(need.every(n => o.modes.includes(n)), 'every windup and release of the beast has a pose: ' + need.join(' '));
  const all = new Map(), dup = []; for (const n of need) { const s = o.bsig[n]; if (all.has(s)) dup.push(n + '=' + all.get(s)); all.set(s, n); }
  ok(dup.length === 0, 'each beast frame is its own picture (B16), none a copy of another' + (dup.length ? ': ' + dup.join(',') : ''));
  const walk = o.bsig.walk, told = ['chargeTell', 'sweepTell', 'volleyTell', 'trampleTell']; ok(told.every(n => o.bsig[n] !== walk), 'no told move is drawn as the walk');
  ok(['walk', 'chargeTell', 'charge', 'sweep', 'volley'].every(n => o.bsig[n] !== o.bsig[n + '/cut']), 'the cut-harness set (no ram, no handlers) is a different picture');
  ok(o.dead.ok && o.dead.w > 60, 'he leaves a body (' + o.dead.w + ' px)'); ok(o.card.n === 2 && o.card.w >= 60 && o.card.h >= 40, 'his bestiary card is painted (' + o.card.w + 'x' + o.card.h + ')');
  ok(o.area.length === 6, 'a frame of every area draws');
  ok(pg.errors.length === 0, 'no page error' + (pg.errors.length ? ': ' + JSON.stringify(pg.errors.slice(0, 2)) : ''));
} finally { await pg.close(); }
console.log(bad ? 'palisadeart: ' + bad + ' FAIL' : 'palisadeart: all green'); process.exit(bad ? 1 : 0);
