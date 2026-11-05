// tools/geofix-shots.mjs - THE GEOFIX PROOF SHOTS (claude/geofix, Daniel 11-04). One headless browser, closed at the end.
//   node tools/geofix-shots.mjs <outdir> <mode>      mode: knee | collapse | recall | tusker
//   knee      plants a knee stone, walks the Geomancer through it (the stone is her own: no obstruction), a foe bumps it; frame strip + JSON of x travel
//   collapse  a full board, UP+C: MOUNTAIN COLLAPSE frames (whole screen) + the damage a spawned foe took
//   recall    a full board, a TAP of DOWN: the stones slide back and re-plant; frame strip
//   tusker    Old Tusker's stomp (boss forced into stompTell, god mode): the SPLINTERED SHOCKWAVE frames
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { openPage } from './cdp.mjs';
import { deflateSync } from 'node:zlib';
const crcT = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = b => { let c = ~0; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return ~c >>> 0; };
function png(rgba, w, h) { const raw = Buffer.alloc((w * 4 + 1) * h); for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; Buffer.from(rgba.buffer, y * w * 4, w * 4).copy(raw, y * (w * 4 + 1) + 1); }
  const chunk = (ty, d) => { const b = Buffer.alloc(12 + d.length); b.writeUInt32BE(d.length, 0); b.write(ty, 4); d.copy(b, 8); b.writeUInt32BE(crc(b.subarray(4, 8 + d.length)), 8 + d.length); return b; };
  const ih = Buffer.alloc(13); ih.writeUInt32BE(w, 0); ih.writeUInt32BE(h, 4); ih[8] = 8; ih[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]); }
const out = process.argv[2] || 'shots', MODE = process.argv[3] || 'knee', TAG = process.argv[4] || 'after';
mkdirSync(out, { recursive: true });
const FULL = MODE === 'collapse', WIDE = MODE === 'tusker', CW = FULL ? 320 : WIDE ? 250 : 130, CH = FULL ? 180 : WIDE ? 90 : 70, S = FULL ? 2 : WIDE ? 3 : 4;
const sheet = (frames, cols) => { const W = CW * S, H = CH * S, rows = Math.ceil(frames.length / cols), o = new Uint8Array(W * cols * H * rows * 4);
  frames.forEach((f, i) => { const ox = (i % cols) * W, oy = Math.floor(i / cols) * H;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const s = ((y / S | 0) * CW + (x / S | 0)) * 4, d = ((oy + y) * W * cols + ox + x) * 4; o[d] = f[s]; o[d + 1] = f[s + 1]; o[d + 2] = f[s + 2]; o[d + 3] = 255; } });
  return png(o, W * cols, H * rows); };
const pg = await openPage({ audio: false, fonts: false, seed: 11 });
try {
  await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');const IDX=LEVELS.findIndex(l=>l.id==='arena_yard');
    window.__stand=(p,col)=>{p.x=col*16+8;p.y=22*16-0.01;p.vx=0;p.vy=0;p.face=1;p.ground=true;};
    window.__go=()=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero('geomancer');BK.reset({fresh:true});BK.applyUpgrades();BK.load(IDX);BK.start();BK.god=false;BK.sim(30);
      const P=BK.P;P.hp=P.maxHp=9999;__stand(P,13);BK.sim(20);return 1;};
    window.__foe=(t,dx,o={})=>{BK.spawnEnt({t,x:(BK.P.x+dx)/16,y:21});const e=BK.enemies().at(-1);e.hp=e.hp0=o.hp||50000;e.cd=99;e.biteCd=99;e.y=352;return e;};
    window.__cap=(n,mid)=>{BK.step(n);const v=BK.view,z=v.z||1,P=BK.P,mx=mid?mid():P.x,sx=v.VW/2+(mx-v.x-v.VW/2)*z,sy=v.VH/2+(P.y-v.y-v.VH/2)*z,c=document.createElement('canvas');c.width=${CW};c.height=${CH};
      const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#223';g.fillRect(0,0,${CW},${CH});
      if(${FULL}) g.drawImage(v.buf,0,0); else g.drawImage(v.buf,Math.round(sx-${CW}/2+30),Math.round(sy-${CH}+22),${CW},${CH},0,0,${CW},${CH});
      const d=g.getImageData(0,0,${CW},${CH}).data;let s='';for(let i=0;i<d.length;i+=8192)s+=String.fromCharCode.apply(null,d.subarray(i,i+8192));return btoa(s);};
    window.__goBoss=()=>{const into=()=>{const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+(A.reverse?-1:1),Math.round(A.floor/16)-1);BK.sim(120);};
      for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero('geomancer');BK.reset({fresh:true});BKT.setHeroLevel('geomancer',20);BK.applyUpgrades();BK.load(LEVELS.findIndex(l=>l.id==='wood'));BK.state='play';BK.start&&BK.start();BK.sim(30);BK.god=true;into();BK.sim(100);
      window.__mid=()=>BK.boss?BK.boss.x-30:BK.P.x;return BK.boss?1:0;};
    return 1;})()`);
  const frames = [], grab = async (n, mid) => { frames.push(new Uint8Array(Buffer.from(await pg.evalp(`__cap(${n},${mid ? '__mid' : 'null'})`), 'base64'))); };
  let info = {};
  if (MODE === 'bosscol') {   // real boss (Old Tusker, god mode, hp padded): the HP one collapse takes off him, for the old-vs-new parity line
    console.log('boss', await pg.evalp('__goBoss()'));
    await pg.evalp("(()=>{const b=BK.boss;b.hp=b.maxHp=999999;b.mode='recover';b.modeT=9;b.vx=0;const P=BK.P;P.x=b.x-100;P.y=b.y-0.01;P.face=1;P.vx=0;P.ground=true;BK.geo().fillBoard();BK.sim(20);window.__hp0=b.hp;return 1;})()");
    info.stones = await pg.evalp('BK.geo().standing()');
    await pg.evalp("(()=>{BK.boss.mode='recover';BK.boss.modeT=9;BK.keys.up=true;BK.keys.block=true;return 1;})()"); await pg.evalp('BK.step(2)'); await pg.evalp("(()=>{BK.keys.up=false;BK.keys.block=false;return 1;})()");
    for (let i = 0; i < 160; i++) { await pg.evalp('(()=>{if(BK.boss){BK.boss.mode="recover";BK.boss.modeT=9;}return 1;})()'); await pg.evalp('BK.step(3)'); }
    info.bossHpLost = await pg.evalp('window.__hp0-BK.boss.hp'); info.dist = await pg.evalp('Math.round(BK.boss.x-BK.P.x)'); info.old = !(await pg.evalp('typeof BK.geo().collapsing==="function"'));
  } else if (MODE === 'tusker') {
    console.log('boss', await pg.evalp('__goBoss()'));
    await pg.evalp("(()=>{BK.sim(150);const b=BK.boss;b.hp=b.maxHp=99999;BK.P.x=b.x-150;BK.P.face=1;b.mode='stompTell';b.modeT=0.04;return 1;})()");
    await grab(3, true); await grab(8, true);
    for (let i = 0; i < 7; i++) await grab(6, true);
    info = JSON.parse(await pg.evalp('JSON.stringify({mode:BK.boss.mode,t:BK.boss.t})'));
  } else {
    await pg.evalp('__go()');
    if (MODE === 'knee') {
      await pg.evalp("(()=>{__stand(BK.P,13);for(let j=0;j<3;j++){BK.press('atk');BK.sim(24);}BK.sim(10);return 1;})()");
      info.plant = JSON.parse(await pg.evalp('JSON.stringify(BK.geo().pieces().map(p=>({x0:p.x0,x1:p.x1,knee:!!p.knee})))'));
      const st = info.plant[0]; if (!st) throw new Error('no knee stone planted');
      // walk back to the left of it, then right THROUGH it
      await pg.evalp(`(()=>{const P=BK.P;P.x=${st.x0}-34;P.y=22*16-0.01;P.vx=0;P.ground=true;P.face=1;BK.sim(4);return 1;})()`);
      await grab(1);
      await pg.evalp("(()=>{BK.keys.right=true;return 1;})()");
      const xs = [];
      for (let i = 0; i < 12; i++) { await grab(i < 6 ? 6 : 0); if (i >= 6) await pg.evalp('BK.step(6)'); xs.push(Math.round(await pg.evalp('BK.P.x'))); }
      frames.length = Math.min(frames.length, 7);
      await pg.evalp("(()=>{BK.keys.right=false;return 1;})()");
      info.stone = st; info.xs = xs; info.passed = xs[xs.length - 1] > st.x1;
      // a dodge through it (from the right back to the left)
      await pg.evalp(`(()=>{const P=BK.P;P.x=${st.x1}+10;P.face=-1;BK.keys.left=true;BK.press('dodge');return 1;})()`);
      await pg.evalp('BK.sim(24)'); info.dodgeX = Math.round(await pg.evalp('BK.P.x')); await pg.evalp("(()=>{BK.keys.left=false;return 1;})()");
      // standing on top still works: drop onto it from above
      await pg.evalp(`(()=>{const P=BK.P;P.x=${st.x0}+8;P.y=22*16-40;P.vy=0;P.vx=0;P.dodge=0;P.ground=false;for(const k in BK.keys)BK.keys[k]=false;BK.sim(40);return 1;})()`);
      info.topDbg = JSON.parse(await pg.evalp('JSON.stringify({n:BK.geo().pieces().length,cells:BK.geo().pieces().map(p=>p.cells.map(c=>c.tx+","+c.ty)),px:BK.P.x,py:BK.P.y})'));
      info.top = { y: Math.round(await pg.evalp('BK.P.y')), ground: await pg.evalp('BK.P.ground'), want: st ? 22 * 16 - 16 : 0 };
      // a foe still bumps it
      await pg.evalp(`(()=>{const P=BK.P;__stand(P,10);BK.sim(2);const e=__foe('sprig',0);e.x=${st.x1}+30;e.vx=-60;window.__e=e;e.face=-1;return 1;})()`);
      for (let i = 0; i < 4; i++) { await pg.evalp('(()=>{window.__e.vx=-60;return 1;})()'); await pg.evalp('BK.sim(20)'); }
      info.foeX = Math.round(await pg.evalp('window.__e.x')); info.foeStoppedRight = info.foeX >= st.x1 - 4;
    } else if (MODE === 'collapse') {
      await pg.evalp("(()=>{__stand(BK.P,13);BK.geo().fillBoard();BK.sim(20);return 1;})()");
      info.stones = await pg.evalp('BK.geo().standing()');
      await pg.evalp("(()=>{const P=BK.P;window.__f=[__foe('sprig',60),__foe('sprig',-70),__foe('sprig',120)];for(const e of window.__f){e.hp=e.hp0=99999;e.vx=0;}window.__f[2].mini=true;window.__hp0=window.__f.map(e=>e.hp);return 1;})()");
      await grab(1);
      await pg.evalp("(()=>{BK.keys.up=true;BK.keys.block=true;return 1;})()"); await pg.evalp('BK.step(2)'); await pg.evalp("(()=>{BK.keys.up=false;BK.keys.block=false;return 1;})()");
      info.fired = await pg.evalp('BK.geo().standing()===0');
      const old = !(await pg.evalp('typeof BK.geo().collapsing==="function"')); info.old = old;
      if (old) { for (let i = 0; i < 6; i++) await grab(18); await pg.evalp('BK.sim(240)'); }
      else {
      for (const tgt of [0.05, 0.5, 1.0, 1.5, 2.0, 2.8]) {
        for (let k = 0; k < 400; k++) { const t = await pg.evalp('(BK.geo().collapsing()||{t:99}).t'); if (t >= tgt) break; await pg.evalp('BK.step(2)'); }
        await grab(0);
      }
      for (let k = 0; k < 300 && (await pg.evalp('!!BK.geo().collapsing()')); k++) await pg.evalp('BK.step(3)'); }
      info.hpLost = JSON.parse(await pg.evalp('JSON.stringify(window.__f.map((e,i)=>window.__hp0[i]-e.hp))')); info.swordDmg = await pg.evalp('BK.env().swordDmg?BK.env().swordDmg():null').catch(() => null);
      info.stats = JSON.parse(await pg.evalp('JSON.stringify(BK.geo().tierStats())'));
    } else if (MODE === 'recall') {
      await pg.evalp("(()=>{__stand(BK.P,13);BK.geo().fillBoard();BK.sim(20);return 1;})()");
      info.before = JSON.parse(await pg.evalp('JSON.stringify(BK.geo().pieces().map(p=>Math.round((p.x0+p.x1)/2)))'));
      await pg.evalp("(()=>{window.__f=__foe('sprig',60);window.__f.hp=window.__f.hp0=99999;window.__f.vx=0;window.__hp0=window.__f.hp;return 1;})()");
      await grab(1);
      await pg.evalp("(()=>{BK.keys.down=true;return 1;})()"); await pg.evalp('BK.step(4)'); await pg.evalp("(()=>{BK.keys.down=false;return 1;})()");
      info.rec = await pg.evalp('BK.geo().recalls().length');
      for (let i = 0; i < 6; i++) await grab(5);
      await pg.evalp('BK.step(30)');
      info.after = JSON.parse(await pg.evalp('JSON.stringify(BK.geo().pieces().map(p=>Math.round((p.x0+p.x1)/2)))'));
      info.px = Math.round(await pg.evalp('BK.P.x')); info.foeHpLost = (await pg.evalp('window.__hp0-window.__f.hp'));
      info.stats = JSON.parse(await pg.evalp('JSON.stringify(BK.geo().tierStats())'));
      // a HOLD of DOWN (crouch) must not recall; DOWN+C still detonates
      await pg.evalp("(()=>{BK.geo().fillBoard();BK.sim(5);BK.keys.down=true;return 1;})()"); await pg.evalp('BK.step(40)'); await pg.evalp("(()=>{BK.keys.down=false;BK.step(4);return 1;})()");
      info.holdRecalled = await pg.evalp('BK.geo().recalls().length');
      await pg.evalp("(()=>{BK.sim(60);BK.geo().fillBoard();BK.sim(5);BK.keys.down=true;BK.keys.block=true;return 1;})()"); await pg.evalp('BK.step(3)'); await pg.evalp("(()=>{BK.keys.down=false;BK.keys.block=false;return 1;})()");
      info.detRecalled = await pg.evalp('BK.geo().recalls().length'); info.detDetonating = await pg.evalp('BK.geo().detonating()');
    }
  }
  const png1 = sheet(frames, MODE === 'collapse' ? 2 : 2);
  writeFileSync(join(out, MODE + '-' + TAG + '.png'), png1);
  console.log(MODE, TAG, frames.length + ' frames', JSON.stringify(info));
} finally { pg.close(); }
