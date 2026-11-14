// PAGE TOOL: launches headless Chrome
// tools/bog-stills150.mjs - stills + a plank-throw reach test for the Bog Troll (claude/bosstune150; a capture tool, not a check).
// usage: node tools/bog-stills150.mjs <outdir>
import { openPage } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = process.argv[2] || 'work/bog150'; mkdirSync(out, { recursive: true });
const pg = await openPage();
const key = async (k, code) => { for (const type of ['keyDown', 'keyUp']) await pg.send('Input.dispatchKeyEvent', { type, key: k, code, windowsVirtualKeyCode: k.toUpperCase().charCodeAt(0), nativeVirtualKeyCode: k.toUpperCase().charCodeAt(0) }); };
const save = (n, v) => { if (v) { writeFileSync(join(out, n + '.png'), Buffer.from(v.split(',')[1], 'base64')); console.log('saved', n); } };
const crop = `(w,h)=>{BK.step(1);const v=BK.view,P=BK.P,S=3,c=document.createElement('canvas');c.width=w*S;c.height=h*S;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(v.buf,Math.max(0,Math.round(P.x-v.x)-w/2),Math.max(0,Math.round(P.y-v.y)-h*0.75),w,h,0,0,w*S,h*S);return c.toDataURL('image/png');}`;
try {
  await pg.evalp(`(async()=>{const M=await import('/src/level.js');const i=M.LEVELS.findIndex(l=>l.id==='fenroad');BK.setHero('knight');BK.reset({fresh:true});BK.load(i);BK.start();BK.god=true;BK.sim(10);BK.reset();window.__crop=${crop};window.__fp=0;return i})()`);
  /* take a plank at the arena bundle (408,17) */
  await pg.evalp(`(()=>{BK.tp(408,17);for(let k=0;k<30;k++){BK.P.hp=BK.P.maxHp;BK.sim(1);BK.step(1);}return 1})()`);
  await key('e', 'KeyE'); const carry = await pg.evalp(`(()=>{for(let k=0;k<6;k++){BK.sim(1);BK.step(1);}return BK.P.carry&&BK.P.carry.t})()`); console.log('carry', carry);
  save('plank-glow', await pg.evalp(`(()=>{for(let k=0;k<400;k++){BK.P.hp=BK.P.maxHp;BK.sim(1);BK.step(1);}return window.__crop(260,120)})()`));
  /* the arena: wait for the troll to hunt / be 'up', record modes, shoot the marked section calm and pulsing, then throw when he is up and in reach */
  const R = { modes: {} }; await pg.evalp('BK.tp(414,17)');
  for (let round = 0; round < 400 && !R.throwNow; round++) {
    const r = await pg.evalp(`(()=>{const o={};BK.P.carry||0;for(let k=0;k<30;k++){BK.P.hp=BK.P.maxHp;BK.P.inv=9;BK.sim(1);BK.step(1);const b=BK.boss;if(!b)continue;o.modes=o.modes||{};o.modes[b.mode]=(o.modes[b.mode]||0)+1;
      if(b.mode==='wake'&&!window.__calm){window.__calm=1;o.calm=window.__crop(260,120);} if((b.mode==='burstTell'||b.mode==='waveGo')&&!window.__pulse){window.__pulse=1;o.pulse=window.__crop(260,120);}}
      const b=BK.boss;o.mode=b&&b.mode;o.carry=!!(BK.P.carry&&BK.P.carry.t==='fplank');o.d=b?Math.round(b.x-BK.P.x):null;o.ground=BK.P.ground;return o})()`);
    for (const [k, v] of Object.entries(r.modes || {})) R.modes[k] = (R.modes[k] || 0) + v; if (r.calm) R.calm = r.calm; if (r.pulse) R.pulse = r.pulse;
    if (!r.carry) { await pg.evalp('BK.tp(408,17)'); await pg.evalp('(()=>{for(let k=0;k<20;k++){BK.sim(1);BK.step(1);}})()'); await key('e', 'KeyE'); await pg.evalp('(()=>{for(let k=0;k<6;k++){BK.sim(1);BK.step(1);}})()'); continue; }
    if (r.mode === 'up' && r.d !== null && Math.abs(r.d) < 400) { /* walk the carried hero in front of him at 70 px */ await pg.evalp('(()=>{const b=BK.boss;BK.tp(Math.round((b.x-70*Math.sign(b.x-BK.P.x))/16),17);BK.P.face=Math.sign(b.x-BK.P.x)||1;for(let k=0;k<2;k++){BK.sim(1);BK.step(1);}})()');
      const q = await pg.evalp('(()=>{const b=BK.boss;return {m:b.mode,d:Math.round(b.x-BK.P.x),c:!!(BK.P.carry&&BK.P.carry.t),g:BK.P.ground}})()'); if (q.m === 'up' && q.c && Math.abs(q.d) > 40 && Math.abs(q.d) < 120) { R.thrown = q; R.throwNow = true; } }
  }
  console.log('modes', JSON.stringify(R.modes), 'thrown', JSON.stringify(R.thrown)); save('rags-calm', R.calm); save('rags-pulse', R.pulse); const R0 = R;
  if (R.throwNow) { await key('x', 'KeyX'); const T = await pg.evalp(`(()=>{const o={};let st=false;for(let k=0;k<200;k++){BK.P.hp=BK.P.maxHp;BK.P.inv=9;BK.sim(1);BK.step(1);const b=BK.boss;if(b.mode==='stun'&&!st){st=true;o.stunAt=k;o.shot=window.__crop(260,120);} if(st&&k===o.stunAt+25)o.shot2=window.__crop(260,120); if(st&&k===o.stunAt+60)o.shot3=window.__crop(260,120);}o.stunned=st;o.carry=BK.P.carry&&BK.P.carry.t;return o})()`); console.log('throw: stunned', T.stunned, 'at', T.stunAt, 'carry after', T.carry); save('stun', T.shot); save('stun-b', T.shot2); save('stun-c', T.shot3); }
} finally { pg.close(); }
