/* tools/underleafart.mjs - THE ART PASS OF UNDERLEAF 3 + THE GRANDMOTHER 3 (claude/underleafart), in the page. Art only: it must leave the level's data alone and draw what the greybox left flat.
     THE LEVEL IS UNTOUCHED  its levelHash equals the greybox's (3d5dd5571299): the reskin is a table (L.reskin) the page applies at spawn, the dressing is derived from the grid at the load
     THE PEOPLE              every sprig / thief / shield / rockgoblin / archer / brute is reskinned (cnSkin) with its own sheet (the goblin's frame count, mirrored, white-flash) and a bestiary card; the thorn-beast has a bare sheet too
     HER FRAMES (B16)        every windup and release has a picture of its own, none the walk, all different; phase two wears its own set
   node tools/underleafart.mjs        (PORT=<your port>) */
import { openPage } from './cdp.mjs';
import { levelHash } from './level-quality.mjs';
import { LEVELS } from '../src/level.js';
const pg = await openPage({ audio: false, fonts: false }); let bad = 0;
const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
ok(levelHash(LEVELS.find(l => l.id === 'underleaf')) === '9aea76bcc829', "the level hash is underleaf4's greybox (art lanes never change the level data)");
try {
  const r = await pg.evalp(`(async()=>{
    const LV=(await import('/src/level.js')).LEVELS, idx=LV.findIndex(l=>l.id==='underleaf'); BK.manualSimulation=true; BK.setHero('knight'); BK.reset({fresh:true}); BK.load(idx); BK.start(); BK.god=true; BK.sim(120);
    const out={}, S=BK.SPR, want={sprig:'herbgatherer',thief:'herbthief',shield:'herbwarden',rockgoblin:'jarthrower',archer:'leafarcher',brute:'thornbeast'};
    out.reskin=JSON.stringify(BK.L.reskin); out.foes={};
    for(const e of BK.enemies()){ if(want[e.t]){ const o=(out.foes[e.t]=out.foes[e.t]||{n:0,skinned:0}); o.n++; if(e.cnSkin===want[e.t]) o.skinned++; } }
    out.sheets={}; for(const [t,sk] of Object.entries(want)){ out.sheets[sk]={have:!!S[sk], frames:S[sk]&&S[sk].R.length, base:S[t].R.length, white:!!(S[sk]&&S[sk].white), left:S[sk]&&S[sk].L.length}; }
    out.bare=!!S.thornbare&&S.thornbare.R.length===S.brute.R.length; out.brood=!!S.grandbrood&&S.grandbrood.R.length===S.sprig.R.length;
    const sig=cv=>{const d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;let h=2166136261;for(let i=0;i<d.length;i++){h=Math.imul(h^d[i],16777619)>>>0;}return h;};
    out.g1=S.grandmother.R.map(sig); out.g2=S.grandmother2.R.map(sig); out.gw=S.grandmother.R[0].width; out.gh=S.grandmother.R[0].height; out.card=S.grandmotherCard.R.length;
    { const G=await import('/src/redraw/underleaf3_gran.js'); out.N=G.N; out.F=G.F; out.deadF=[0,0.3,0.5,0.9].map(G.deathFrame); }
    out.desc=[...BK.BEASTS?BK.BEASTS.map(b=>b.t):[]];
    BK.manualSimulation=false; return JSON.stringify(out); })()`, 300000);
  const o = JSON.parse(r);
  ok(o.reskin.includes('"brute":"thornbeast"'), 'the level carries its reskin table: ' + o.reskin);
  for (const [t, v] of Object.entries(o.foes)) ok(v.n > 0 && v.n === v.skinned, 'every ' + t + ' in the village is reskinned on the page (' + v.skinned + '/' + v.n + ')');
  for (const [sk, v] of Object.entries(o.sheets)) ok(v.have && v.frames === v.base && v.left === v.base && v.white, sk + " has its own sheet with the goblin's " + v.base + ' frames, mirrored and white-flash');
  ok(o.bare, 'the thorn-beast has a bare (coat burnt off) sheet'); ok(o.brood, 'her brood has its own sheet');
  ok(o.gw >= 54 && o.gh >= 60, 'the Grandmother is ~1.3x the old 42x48 sheet (' + o.gw + 'x' + o.gh + ')');
  const seen = new Map(), dup = []; o.g1.forEach((s, i) => { if (seen.has(s)) dup.push(i + '=' + seen.get(s)); seen.set(s, i); });
  const moves = ['sleep', 'wake', 'idle', 'walk', 'hurt', 'staffTell', 'staff', 'fireballTell', 'cast', 'jarTellG', 'jarTellR', 'hurledG', 'hurledR', 'broodTell', 'kick', 'stirTell', 'stir', 'ward', 'floated', 'dead', 'lashTell', 'lash', 'trapTell', 'singed', 'snared', 'aloft'];   /* (claude/underleaf4art) her underleaf4 moves + the two staggers + the aloft hover; 'trap' is 2 frames, counted below */
  ok(moves.every(m => o.N[m] >= 3), 'every move is animated (>= 3 frames each): ' + moves.map(m => m + ' ' + o.N[m]).join(', '));
  ok(o.g1.length === o.g2.length && o.g1.length === moves.reduce((n, m) => n + o.N[m], 0) + o.N.trap, 'a frame set for every move in each phase: ' + o.g1.length + ' frames');
  ok(dup.length === 0, 'each frame is its own picture, none the walk (B16)' + (dup.length ? ': ' + dup.join(',') : ''));
  ok(o.deadF[0] === o.F.dead && o.deadF[3] === o.F.dead + 3 && new Set(o.deadF).size === 4, 'her death plays four frames (clutch, kneel, slump, heap)');
  ok(o.g2.every((s, i) => i === o.F.dead + 3 || s !== o.g1[i]), 'phase two wears its own set');
  ok(o.card === 2, "her bestiary card shows her walking (2 frames)");
  ok(pg.errors.length === 0, 'no page error' + (pg.errors.length ? ': ' + JSON.stringify(pg.errors.slice(0, 2)) : ''));
} finally { await pg.close(); }
console.log(bad ? 'underleafart: ' + bad + ' FAIL' : 'underleafart: all green'); process.exit(bad ? 1 : 0);
