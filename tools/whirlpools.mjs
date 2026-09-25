/* tools/whirlpools.mjs — THE KEEP'S WHIRLPOOLS do what Daniel asked (docs/briefs/keep-rework-2.md; src/whirlpools.js).
   "Each drags you toward its centre and burns air faster while you are in its pull. Entering its area SHOWS ITS SWITCH; strike the
   lever and the whirlpool winds down and stays off (through a death)." In Node, on the module: the drag is toward the eye, the air
   goes faster inside than out, entering lights the niche, a blow on the lever stills it over its wind-down, and a struck lever is
   still struck after whirlInit (a respawn). In the page, on the real Keep: the same, with the game's own swim, breath, attack box
   and death - and every whirlpool's lever can be reached and struck from the water. */
import assert from 'node:assert/strict';
import { WHIRL, whirlInit, whirlAt, updateWhirlpools, strikeLever, whirlKey, eyeOf, leverOf } from '../src/whirlpools.js';
import { openPage } from './cdp.mjs';

{ const L = { whirlpools: [{ x: 20, y: 20, r: 4, lever: [12, 24] }] }; whirlInit(L, new Set()); const w = L.whirlpools[0], e = eyeOf(w);
  const P = { x: e.x + 40, y: e.y + 12 + 10, breath: 18, dead: false }; let moved = [0, 0];
  const io = { swim: true, breathMax: 18, inAir: () => false, move: (dx, dy) => { P.x += dx; P.y += dy; moved[0] += dx; moved[1] += dy; }, emit: () => {} };
  assert(!w.lit, 'the niche is dark before you come'); const d0 = Math.hypot(P.x - e.x, P.y - 12 - e.y);
  const ev = updateWhirlpools(L, P, 1 / 60, io); assert(ev.some(v => v.t === 'enter'), 'entering the pull is an event (the sound, the words)'); assert(w.lit, 'entering its pull lights its lever\'s niche');
  for (let i = 0; i < 60; i++) updateWhirlpools(L, P, 1 / 60, io);
  assert(Math.hypot(P.x - e.x, P.y - 12 - e.y) < d0 - 8, 'the pull drags you toward the eye'); assert(P.breath < 18 - WHIRL.drain * 0.4 * 0.9, 'the pull burns air: ' + P.breath);
  const out = { x: e.x + 200, y: e.y, breath: 18, dead: false }; updateWhirlpools(L, out, 1, io); assert.equal(out.breath, 18, 'outside its reach it takes nothing');
  assert(!strikeLever(L, { l: e.x - 5, r: e.x + 5, t: e.y - 5, b: e.y + 5 }), 'a blow at the eye is not a blow on the lever');
  const q = leverOf(w); assert.equal(strikeLever(L, { l: q.x - 6, r: q.x + 6, t: q.y - 20, b: q.y - 4 }), w, 'a blow on the lever stops it');
  for (let i = 0; i < WHIRL.windDown * 60 + 5; i++) updateWhirlpools(L, P, 1 / 60, io); assert.equal(w.k, 0, 'it winds down to nothing');
  const b0 = P.breath; updateWhirlpools(L, P, 1, io); assert.equal(P.breath, b0, 'a still whirlpool takes no air');
  whirlInit(L, new Set([whirlKey(w)])); assert(w.off && w.k === 0, 'a struck lever stays struck through a respawn');
  whirlInit(L, new Set()); assert(!w.off && w.k === 1, 'and an unstruck one comes back whole'); }

const pg = await openPage({ fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');const WH=await import('/src/whirlpools.js');BK.manualSimulation=true;BK.SET.speed=1;
    BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='keep'));BK.start();BK.sim(5);for(const e of BK.enemies())e.alive=false;BK.god=true;
    const L=BK.L,P=BK.P,out=[];
    for(const w of L.whirlpools){const e=WH.eyeOf(w),row={at:w.x+','+w.y};
      /* in the pull: dragged, and the air going */
      /* on its far side from any air (the pocket it guards is beside it), a second with it turning and a second with it still: the difference is the drag */
      const run=on=>{const k0=w.k;if(!on)w.k=0;P.x=e.x-w.r*16*0.6;P.y=e.y+12;P.vx=P.vy=0;P.breath=18;BK.sim(1);const b0=P.breath;for(let i=0;i<60;i++){P.vx=P.vy=0;BK.sim(1);}const r2={d:Math.hypot(P.x-e.x,P.y-12-e.y),b:b0-P.breath,wh:P.whirled||0};w.k=k0;return r2;};
      const off=run(false),on=run(true);row.lit=w.lit;row.dragged=Math.round(off.d-on.d);row.drain=+(on.b-off.b).toFixed(2);row.whirled=+on.wh.toFixed(2);
      /* the lever, struck from the water in front of it */
      const q=WH.leverOf(w);let struck=false;for(const side of [-1,1]){if(struck)break;for(let k=0;k<4&&!w.off;k++){P.x=q.x-side*14;P.y=q.y;P.vx=P.vy=0;P.face=side;BK.sim(2);BK.press('atk');BK.sim(18);}struck=w.off;}
      row.struck=w.off;BK.sim(90);row.k=+w.k.toFixed(2);
      out.push(row);}
    /* THROUGH A DEATH: kill the hero and let the level put him back */
    BK.god=false;P.inv=0;BKT.damagePlayer(P.x,9999,{unblockable:true});const died=!!P.dead;let back=0;for(let i=0;i<600&&!back;i++){BK.sim(1);if(died&&!P.dead&&BK.state==='play')back=1;}
    const after=L.whirlpools.map(w=>w.off&&w.k===0);return{out,after,died,back};})()`, 300000);
  for (const w of r.out) { assert(w.lit, 'whirlpool ' + w.at + ': its niche did not light when the hero was in the pull');
    assert(w.dragged > 3, 'whirlpool ' + w.at + ' did not drag the hero toward its eye: ' + w.dragged); assert(w.drain > 0.25, 'whirlpool ' + w.at + ' did not burn air: ' + w.drain);
    assert(w.struck, 'whirlpool ' + w.at + ': its lever could not be struck from the water in front of it'); assert.equal(w.k, 0, 'whirlpool ' + w.at + ' did not wind down'); }
  assert(r.died && r.back, 'the hero did not die and come back: ' + JSON.stringify([r.died, r.back])); assert(r.after.every(Boolean), 'a struck whirlpool came back after a death: ' + JSON.stringify(r.after));
  assert.deepEqual(pg.errors, []);
  console.log('whirlpools  module: pull, drain, the niche lit on entry, the lever, the wind-down, kept through a respawn; page: ' + JSON.stringify(r.out));
} finally { pg.close(); }
