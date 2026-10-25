// tools/hornsman.mjs - THE HORNSMAN (claude/palisadefoe, src/hornsman.js): the Palisade Wood's siege-crew handler, a foe of the level's own.
//   Node half: the step (a post he holds, the horn only with an archer in earshot, the told bar, the blast, the maul, a blow in the windup cuts the order short, a backward step
//   when you come in) and the tables (EHP, threat, marks, voice, bestiary card).
//   Page half (headless Chrome, tools/cdp.mjs): the level places 4; the sprite bakes 8 frames; a blast hurries the archers of the towers (they draw at once and shoot at the
//   quick beat, tick for tick faster than their own); a blow while the horn is up leaves the archers on their own beat (ORDER LOST); killing him ends it; no page error.
//   node tools/hornsman.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as HM from '../src/hornsman.js';
import { MARK, ANSWER, HEIGHT } from '../src/marks.js';
import { THREAT } from '../src/threat.js';
const rd = f => readFileSync(new URL('../' + f, import.meta.url), 'utf8');
let bad = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };

/* ---- node: the step ---- */
const C = HM.HORNSMAN, hero = { x: 130, y: 0, alive: true };
const run = (s, w, secs, onEv) => { const evs = []; for (let t = 0; t < secs; t += 1 / 60) for (const v of HM.hornsmanStep(s, w, 1 / 60)) { evs.push([+t.toFixed(2), v]); if (onEv) onEv(v, s); } return evs; };
{ const s = HM.newHornsman(0, 0, 1), ev = run(s, { heroes: [hero], archers: 2, canStep: () => true }, 4);
  const tell = ev.find(([, v]) => v.t === 'orderTell'), blast = ev.find(([, v]) => v.t === 'order');
  ok(tell && Math.abs(tell[0] - C.first) < 0.1, 'the horn comes up ' + (tell && tell[0]) + ' s after he sees you (first ' + C.first + ')');
  ok(blast && Math.abs(blast[0] - tell[0] - C.orderTell) < 0.1, 'the blast comes ' + C.orderTell + ' s after the horn is up (a told windup): ' + (blast && (blast[0] - tell[0]).toFixed(2))); }
{ const s = HM.newHornsman(0, 0, 1), ev = run(s, { heroes: [hero], archers: 0, canStep: () => true }, 12);
  ok(!ev.some(([, v]) => v.t === 'orderTell'), 'no archer in earshot: no horn (he is only a man with a maul)'); }
{ const s = HM.newHornsman(0, 0, 1), ev = run(s, { heroes: [{ x: 3000, y: 0, alive: true }], archers: 3, canStep: () => true }, 8);
  ok(!ev.length && s.mode === 'stand', 'no hero in sight: he holds his post and blows nothing'); }
{ const s = HM.newHornsman(0, 0, 1); let cut = null;
  run(s, { heroes: [hero], archers: 2, canStep: () => true }, 3, (v, st) => { if (v.t === 'orderTell' && !cut) { cut = 'up'; } });
  const s2 = HM.newHornsman(0, 0, 1); let struck = null, after = [];
  for (let t = 0; t < 4; t += 1 / 60) { const ev = HM.hornsmanStep(s2, { heroes: [hero], archers: 2, canStep: () => true }, 1 / 60);
    if (s2.mode === 'orderTell' && !struck) { for (let k = 0; k < 20; k++) HM.hornsmanStep(s2, { heroes: [hero], archers: 2, canStep: () => true }, 1 / 60); struck = HM.hornsmanStruck(s2); }
    if (struck) { after.push(...ev); if (!after.mode) after.mode = s2.mode; } }
  ok(struck === 'lost' && after.mode === 'lost', 'a blow while the horn is up cuts the order short (' + struck + ')');
  const more = run(s2, { heroes: [hero], archers: 2, canStep: () => true }, C.lost + 1);
  ok(!more.some(([t, v]) => v.t === 'order' && t < C.lost + 0.9), 'and the blast does not come on the same breath'); }
{ const near = { x: 20, y: 0, alive: true }, s = HM.newHornsman(0, 0, 1), ev = run(s, { heroes: [near], archers: 0, canStep: () => true }, 2);
  const mt = ev.find(([, v]) => v.t === 'maulTell'), m = ev.find(([, v]) => v.t === 'maul');
  ok(mt && m && Math.abs(m[0] - mt[0] - C.maulTell) < 0.1 && m[1].dmg === C.dmg, 'within a maul\'s length: the maul, told ' + C.maulTell + ' s first (' + C.dmg + ')');
  const far = { x: 50, y: 0, alive: true }, s2 = HM.newHornsman(0, 0, 1); let sawBack = false; for (let t = 0; t < 1; t += 1 / 60) { HM.hornsmanStep(s2, { heroes: [far], archers: 0, canStep: () => true }, 1 / 60); if (s2.vx < 0) sawBack = true; }
  ok(sawBack, 'he backs off a hero who comes in (keeps ' + C.keep + ' px), and holds a ledge (canStep)');
  const s3 = HM.newHornsman(0, 0, 1); let moved = false; for (let t = 0; t < 1; t += 1 / 60) { HM.hornsmanStep(s3, { heroes: [far], archers: 0, canStep: () => false }, 1 / 60); if (s3.vx) moved = true; }
  ok(!moved, 'at the edge of his scaffold he does not step off'); }

/* ---- node: the tables ---- */
const main = rd('src/main.js');
ok(/hornsman: HM\.HORNSMAN\.hp/.test(main), 'EHP.hornsman is the module\'s ' + C.hp);
ok(THREAT.hornsman > 0, 'a threat weight (' + THREAT.hornsman + ')');
ok(MARK['hornsman|maulTell'] === '!' && MARK['hornsman|orderTell'] === '' && ANSWER['hornsman|maulTell'] === 'block' && HEIGHT['hornsman|maulTell'] === 'low', 'the maul wears a yellow !, the horn no blow-mark; the shield answer and height rows');
ok(/\{ t: 'hornsman', name: 'THE HORNSMAN'/.test(main), 'a bestiary card');
const { SFX } = await import('../src/audio.js');
ok(SFX.hurtOf('hornsman') && SFX.dieOf('hornsman'), 'a hurt and a death voice');
const { ROSTER } = await import('../src/foe-react.js');
ok(ROSTER[1].support.includes('hornsman'), 'act I\'s roster knows him (a support)');

/* ---- page ---- */
const { openPage } = await import('./cdp.mjs');
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const out={};
    const id=LEVELS.findIndex(l=>l.id==='palisadewood');BK.setHero('knight');BK.reset({fresh:true});BK.load(id);BK.start();BK.god=true;BK.sim(60);
    const E=()=>BK.enemies(), H=()=>E().filter(e=>e.t==='hornsman');
    out.n=H().length; out.xs=H().map(e=>Math.round(e.x/16));
    const hs=H()[1]; /* tower two's */
    const A8=(await import('/src/redraw/hornsman_art.js')).bakeHornsman();out.sprite=A8.R.length===8&&A8.L.length===8&&A8.white.R.length===8;
    const archersNear=h=>E().filter(e=>e.alive&&e.t==='archer'&&Math.abs(e.x-h.x)<=${C.earR}&&Math.abs(e.y-h.y)<=${C.earY});
    out.arch=archersNear(hs).map(a=>Math.round(a.x/16));
    /* count the draws an archer makes over 6 s of the hero standing on the boards under tower two, with the hornsman alive, then with him killed */
    const trial=(kill,cut)=>{BK.reset({fresh:true});BK.load(id);BK.start();BK.god=true;BK.sim(30);const h=H()[1];if(cut){for(const q of H())if(q!==h)BKT.hurtEnemy(q,9999,q.x-20,false);}if(kill){for(const q of H())BKT.hurtEnemy(q,9999,q.x-20,false);}BK.tp(344,20);BK.sim(2);
      const A=archersNear({x:350*16,y:17*16});const was=new Map(A.map(a=>[a,0]));let t0=-1,vol=null,draws=0,ordered=0,lost=0,tellSeen=false,afterCut=-1,cutAt=0;
      for(let i=0;i<60*14;i++){BK.sim(1);BK.P.hp=BK.P.maxHp;if(t0<0&&A.some(a=>a.ordered>${C.len}-0.05))t0=i;if(t0>=0&&i===t0+30){const see=A.filter(a=>Math.abs(a.x-BK.P.x)<230);vol={see:see.length,drew:see.filter(a=>a.draw>0||a.loose>0).length};}for(const a of A){if(a.draw>0&&!was.get(a))draws++;was.set(a,a.draw>0);if(a.ordered>0)ordered++;}
        if(cut&&!lost&&h.alive&&h.mode==='orderTell'){BKT.hurtEnemy(h,1,h.x-20,false);lost=1;afterCut=0;}if(lost&&i<cutAt+60*3)afterCut+=A.filter(a=>a.ordered>0).length;if(lost&&!cutAt)cutAt=i;
        if(h.alive&&h.mode==='orderTell')tellSeen=true;}
      return {vol,draws,ordered,tellSeen,lost,afterCut,mode:h.mode,alive:h.alive};};
    out.alive=trial(false,false);out.killed=trial(true,false);out.cut=trial(false,true);
    BK.manualSimulation=false;return out;})()`, 240000);
  console.log('   ', JSON.stringify(r));
  ok(r.n === 4 && r.sprite, 'the level places 4 hornsmen (' + r.xs.join(',') + ') and the sprite is baked');
  ok(r.arch.length >= 1, 'tower two\'s hornsman has archers in earshot: ' + r.arch.join(','));
  ok(r.alive.tellSeen && r.alive.ordered > 0, 'alive: the horn goes up and the archers are ORDERED (' + r.alive.ordered + ' archer-frames under the order)');
  ok(r.killed.ordered === 0, 'every hornsman killed first: no order ever lands');
  ok(r.alive.vol && r.alive.vol.see > 0 && r.alive.vol.drew === r.alive.vol.see, 'the blast is a VOLLEY: half a second after it every archer who can see you has the bow drawn or loosed (' + JSON.stringify(r.alive.vol) + '); ' + r.alive.draws + ' draws in 14 s against ' + r.killed.draws + ' with no hornsman alive');
  ok(r.cut.lost === 1 && r.cut.afterCut === 0, 'a blow while the horn is up: the order is lost - no archer is ordered in the next 3 s (' + r.cut.afterCut + ' ordered frames)');
  ok(pg.errors.length === 0, 'no page error' + (pg.errors.length ? ': ' + JSON.stringify(pg.errors.slice(0, 3)) : ''));
} finally { await pg.close(); }
console.log(bad ? 'hornsman: ' + bad + ' FAIL' : 'hornsman: all green');
process.exit(bad ? 1 : 0);
