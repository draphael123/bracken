/* tools/sporewood2art.mjs - THE ART PASS OF SPOREWOOD 2 + THE MOTHER CAP 2 (claude/sporewood2art), in the page. Art only: it must leave the level's data alone and draw everything the greybox left flat.
     THE LEVEL IS UNTOUCHED  its levelHash equals the TUNE lane's stamp (claude/sporewood2tune; was the greybox's c0b80ba1d0de) (3bf985fd9575 after batch132 bossheal moved the larder shrine; 4e934206a409 after claude/sporeplat: three gauntlets; 237f11b92bb5 after integ117: terrace sign, three-cap approach pillar, perch flags; f48637fe943d at the tune lane): the reskin is a table (L.reskin) the page applies at spawn, never an ent flag.
     THE RESKIN              every shield / brute / archer in the level is a MYCONID GUARD / CAP BRUTE / SPORE ARCHER on the page (cnSkin), each skin has its own sheet (same frame count as the goblin's)
                             and a bestiary card; a killed one lies in its own skin (tools/corpses.mjs lists the wood: CORPSES_ONLY=spore); no goblin sheet is drawn in the wood.
     HER FRAMES (B16)        every windup and release has a picture of its own: lash, crush, bloom, brood, wither x tell + release, the open crown, the ward, the rise, the wake - all different
                             from the idle and from each other, and the second phase (the net) wears its own set.
     THE PLACES              the six areas have their own tile kit colours, backdrop colours and floor dressing (the palette per area differs), the knot is drawn behind the mid row, and a frame of each area
                             draws with no page error.
   node tools/sporewood2art.mjs        (PORT=<your port>) */
import { openPage } from './cdp.mjs';
import { levelHash } from './level-quality.mjs';
import { LEVELS } from '../src/level.js';
const pg = await openPage({ audio: false, fonts: false }); let bad = 0;
const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
ok(levelHash(LEVELS.find(l => l.id === 'spore')) === '3bf985fd9575', 'the level hash is the greybox\'s (art lanes never change the level data)');
try {
  const r = await pg.evalp(`(async()=>{
    const LV=(await import('/src/level.js')).LEVELS, idx=LV.findIndex(l=>l.id==='spore'); BK.manualSimulation=true; BK.setHero('knight'); BK.reset({fresh:true}); BK.load(idx); BK.start(); BK.god=true; BK.sim(120);
    const out={}, S=BK.SPR;
    const L=BK.L; out.reskin=JSON.stringify(L.reskin);
    const en=BK.enemies(); const want={shield:'myconidguard',brute:'capbrute',archer:'sporearcher'};
    out.foes={}; for(const e of en){ if(want[e.t]){ (out.foes[e.t]=out.foes[e.t]||{n:0,skinned:0}); out.foes[e.t].n++; if(e.cnSkin===want[e.t]) out.foes[e.t].skinned++; } }
    out.sheets={}; for(const [t,sk] of Object.entries(want)){ out.sheets[sk]={have:!!S[sk], frames:S[sk]&&S[sk].R.length, base:S[t].R.length, white:!!(S[sk]&&S[sk].white), left:S[sk]&&S[sk].L.length}; }
    out.brood={have:!!S.puffbrood, frames:S.puffbrood&&S.puffbrood.R.length, base:S.sporeling.R.length};
    out.icon={w:S.mother.R[0].width,h:S.mother.R[0].height};
    /* her frames */
    const M=await import('/src/redraw/sporewood2_mother.js'); const sig=cv=>{const d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;let h=2166136261;for(let i=0;i<d.length;i+=1){h=Math.imul(h^d[i],16777619)>>>0;}return h;};
    const F1=M.frames(1),F2=M.frames(2);out.poses=Object.keys(F1);out.sig={};for(const n of out.poses){out.sig[n]=F1[n].map(sig);}
    out.p2diff=out.poses.every(n=>F2[n].every((c,i)=>sig(c)!==out.sig[n][i]));
    /* the places: draw each area's frame */
    out.area=[]; for(const x of [30,120,214,320,380,430]){ BK.tp(x, x<100?40:x<200?38:x<300?26:x<350?19:x<410?11:14); BK.sim(30); out.area.push(x); }
    BK.manualSimulation=false; return JSON.stringify(out); })()`, 300000);
  const o = JSON.parse(r);
  ok(o.reskin === '{"shield":"myconidguard","brute":"capbrute","archer":"sporearcher"}', 'the level carries its reskin table: ' + o.reskin);
  for (const [t, v] of Object.entries(o.foes)) ok(v.n > 0 && v.n === v.skinned, 'every ' + t + ' in the wood is reskinned on the page (' + v.skinned + '/' + v.n + ')');
  for (const [sk, v] of Object.entries(o.sheets)) ok(v.have && v.frames === v.base && v.left === v.base && v.white, sk + ' has its own sheet with the goblin\'s ' + v.base + ' frames, mirrored and white-flash');
  ok(o.brood.have && o.brood.frames === o.brood.base, 'her brood (puffbrood) has its own ' + o.brood.base + ' frames');
  ok(o.icon.w >= 40 && o.icon.h >= 40, 'the Mother Cap\'s bestiary portrait is repainted (' + o.icon.w + 'x' + o.icon.h + ')');
  { const src = (await import('node:fs')).readFileSync(new URL('./corpses.mjs', import.meta.url), 'utf8'); ok(/'spore'(,|])/.test(src), 'tools/corpses.mjs kills the wood\'s reskins and reads their bodies back (CORPSES_ONLY=spore node tools/corpses.mjs)'); }
  const need = ['idle', 'lashTell', 'lash', 'crushTell', 'crush', 'bloomTell', 'bloom', 'broodTell', 'brood', 'witherTell', 'wither', 'open', 'ward', 'phaseRise', 'wake', 'dead'];
  ok(need.every(n => o.poses.includes(n)), 'every windup and release has its own frame set: ' + need.join(' '));
  const idle = o.sig.idle[0], all = new Map(); let dup = [];
  for (const n of need) for (const [i, s] of o.sig[n].entries()) { if (n !== 'idle' && s === idle) dup.push(n + i); if (all.has(s)) dup.push(n + i + '=' + all.get(s)); all.set(s, n + i); }
  ok(dup.length === 0, 'each frame is its own picture, none the idle (B16)' + (dup.length ? ': ' + dup.join(',') : ''));
  ok(o.p2diff, 'the second phase (the net) wears its own set');
  ok(pg.errors.length === 0, 'no page error' + (pg.errors.length ? ': ' + JSON.stringify(pg.errors.slice(0, 2)) : ''));
} finally { await pg.close(); }
console.log(bad ? 'sporewood2art: ' + bad + ' FAIL' : 'sporewood2art: all green'); process.exit(bad ? 1 : 0);
