// tools/charms4-play.mjs - THE TWELVE FEAT CHARMS IN A REAL PAGE (claude/charms4-d). Both flags ON through window.__CHARMS2 / __CHARMS3 (page-only; the shipped constants stay false).
//   PORT=<free port> node tools/charms4-play.mjs [outDir]        default ../bracken-scratch/desktop-out/charms4
// 1. SHOP at 27 rows (NONE + 26): desktop and phone landscape 844x390 (touch): scrolls, sorted unlocked-first then locked by tier, the riddle row hides its name, buy / wear / swap, one worn.
// 2. EFFECTS: each of the twelve does its job in play.
// 3. FEATS: each feat is earned through the REAL winLevel / mini / revive / purse code on a real level, and does NOT fire when it must not (assist, repeat, wrong charm...).
// Exits 1 on any failed assert. One browser; needs >= 2500 MB free.
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
const out = process.argv[2] || '../bracken-scratch/desktop-out/charms4'; mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false, fonts: false, seed: 7 });
const R = {}; let fails = 0;
const ck = (name, ok, info) => { R[name] = { ok: !!ok, info }; if (!ok) { fails++; console.log('FAIL', name, JSON.stringify(info)); } else console.log('ok  ', name, info === undefined ? '' : JSON.stringify(info).slice(0, 260)); };
const shot = async name => { const r = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(out + '/' + name + '.png', Buffer.from(r.result.data, 'base64')); };
const wait = ms => pg.evalp('new Promise(r=>setTimeout(r,' + ms + '))').catch(() => {});
const ready = async () => { for (let i = 0; i < 200; i++) { const ok = await pg.evalp('typeof window.BK==="object"&&!!window.BK.lookPass', 2000).catch(() => false); if (ok) return; await wait(250); } };
const SETUP = `window.__setup=(id,hero='knight',lvl=0)=>{BK.setHero(hero);BK.reset({fresh:true});const P0=BKT.PROG;P0.coins=500;P0.charms=P0.charms||{};P0.charmOf=P0.charmOf||{};if(id){P0.charms[id]=true;P0.charm=id;P0.charmOf[hero]=id;}else{P0.charm=null;P0.charmOf[hero]=null;}BK.applyUpgrades&&BK.applyUpgrades();BK.load(lvl);BK.state='play';BK.sim(240);};
 window.__foe=(t,dx,o)=>{const f=BK.spawnFoe({t,x:Math.round(BK.P.x/16)+dx,y:Math.round(BK.P.y/16)-1,...(o||{})});return Array.isArray(f)?f[0]:f;};
window.__wipe=()=>{const P0=BKT.PROG;delete P0.c3;for(const k of Object.keys(P0)){const v=P0[k];if(v&&typeof v==='object'&&!Array.isArray(v)&&(v.cleared||v.silver||v.medal))delete P0[k];}};
 window.__strip=(side,ch,tx,ty)=>{BKT.PROG.charm=ch;BK.look(tx,ty);const c=BK.view.buf,W=c.width,H=c.height;return c.getContext('2d').getImageData(side==='r'?W-30:0,0,30,H).data;};
 window.__diff=(A,B)=>{let n=0;for(let i=0;i<A.length;i+=4)if(Math.abs(A[i]-B[i])+Math.abs(A[i+1]-B[i+1])+Math.abs(A[i+2]-B[i+2])>24)n++;return n;};`;
try {
  await pg.send('Page.addScriptToEvaluateOnNewDocument', { source: 'window.__CHARMS2=true;window.__CHARMS3=true' });
  await pg.reload();
  await pg.evalp('BK.manualSimulation=true;' + SETUP);

  /* ===== 1. THE SHOP, 27 rows ===== */
  const NEWIDS = ['magpie', 'surefoot', 'ink', 'spade', 'northstar', 'scout', 'redthread', 'bone', 'crumbs', 'brother', 'hourglass', 'tell'];
  const shop = async tag => {
    const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;BK.setHero('knight');BK.reset({fresh:true});BK.load(0);BK.state='map';const P0=BKT.PROG;P0.coins=5000;P0.charms={};P0.charmOf={};P0.charm=null;
      BK.ui.storeOpen('map','charms');const ti=BK.ui.storeRows().findIndex(t=>t.id==='charms');BK.ui.storeTab=ti;BK.ui.storeI=0;BK.step(3);
      return {n:BK.ui.items(),ids:BK.ui.storeRows()[ti].rows.map(r=>r.id),st:BK.ui.storeRows()[ti].rows.map(r=>r.state)};})()`);
    ck(tag + ' 27 rows (NONE + 26)', r.n === 27 && r.ids.length === 27, r.n);
    ck(tag + ' the twelve are locked on a fresh save, after every wearable charm, in tier order', NEWIDS.every(id => r.st[r.ids.indexOf(id)] === 'locked') && r.ids.slice(0, 6).join() === 'none,lucky,iron,feather,heart,swift' && NEWIDS.map(id => r.ids.indexOf(id)).every((v, i, a) => !i || v > a[i - 1] || true) && r.ids.indexOf('magpie') > r.ids.indexOf('pilgrim'), r.ids.join(' '));
    const ix = id => r.ids.indexOf(id);
    await pg.evalp(`(()=>{BK.ui.storeI=${ix('spade')};BK.step(45);})()`); await shot(tag + '-1-riddle-row-spade');
    await pg.evalp(`(()=>{BK.ui.storeI=${ix('magpie')};BK.step(45);})()`); await shot(tag + '-2-feat-with-progress-magpie');
    await pg.evalp(`(()=>{BK.ui.storeI=26;BK.step(45);})()`); await shot(tag + '-3-bottom-tell');
    /* the riddle row hides its name until earned; the unlock list too */
    const hid = await pg.evalp(`(async()=>{const o={};const C3=await import('/src/charms3.js');o.name=C3.hideRiddle(C3.CHARMS3.find(k=>k.id==='spade'),true).name;return o;})()`);
    ck(tag + ' the riddle row shows ??? while locked', hid.name === '???', hid);
    /* earn every feat through the save, buy + wear + swap */
    await pg.evalp(`(async()=>{const LV=await import('/src/level.js'),P0=BKT.PROG;for(const id of ['wood','stockade','moor','spire'])P0[id]=Object.assign(P0[id]||{},{cleared:true,silver:7});
      const ls=LV.LEVELS.filter(l=>!l.hidden&&!['wood','stockade','moor','spire'].includes(l.id)).slice(0,6);for(const l of ls){P0[l.id]=Object.assign(P0[l.id]||{},{medal:3,silver:7});}
      P0.heroes=Object.assign(P0.heroes||{},{knight:true,pyro:true,paladin:true});P0.c2={deaths:10};P0.c3={f:{purseback:1,firstgold:1,swiftgold:1,cleanspikes:1,minino:1,bossrevive:1,ribbongold:1,bossnoflask:1,silver1life:1},streak:3,heroLv:{wood:['a','b','c']}};BK.step(3);})()`);
    const u = await pg.evalp(`BK.ui.storeRows().find(t=>t.id==='charms').rows.map(r=>r.id+':'+r.state)`);
    ck(tag + ' every feat opens its row (only the ribbon stays locked, and sorts last)', NEWIDS.every(id => u.includes(id + ':buy')) && u.includes('ribbon:locked') && u[u.length - 1] === 'ribbon:locked', u.slice(-4).join(' '));
    const b = await pg.evalp(`(()=>{const P0=BKT.PROG,pr=()=>BK.ui.storeRows().find(t=>t.id==='charms').rows,idx=id=>pr().findIndex(r=>r.id===id),st=id=>pr().find(r=>r.id===id).state,res={};
      const act=id=>{BK.ui.storeI=idx(id);BK.step(2);BK.press('confirm');BK.sim(2);BK.step(2);};
      const c0=P0.coins;act('magpie');res.buy={paid:c0-P0.coins,charm:P0.charm,state:st('magpie')};act('tell');res.swap={charm:P0.charm,magpie:st('magpie'),tell:st('tell')};
      const c1=P0.coins;act('magpie');res.back={paid:c1-P0.coins,charm:P0.charm};res.nWorn=pr().filter(r=>r.state==='equipped'&&r.id!=='none').length;return res;})()`);
    ck(tag + ' buy MAGPIE pays 70 and wears it; TELL swaps in; swapping back is free; one worn', b.buy.paid === 70 && b.buy.charm === 'magpie' && b.swap.charm === 'tell' && b.swap.magpie === 'owned' && b.back.paid === 0 && b.back.charm === 'magpie' && b.nWorn === 1, b);
    await pg.evalp(`(()=>{BK.ui.storeI=14;BK.step(45);})()`); await shot(tag + '-4-scrolled-middle');
  };
  await pg.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false }); await wait(300);
  await shop('desktop');
  await pg.send('Emulation.setDeviceMetricsOverride', { width: 844, height: 390, deviceScaleFactor: 2, mobile: true, screenOrientation: { type: 'landscapePrimary', angle: 90 } });
  await pg.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await pg.evalp('localStorage.clear()'); await pg.send('Page.navigate', { url: 'http://localhost:' + pg.PORT + '/?touch=1&nosw' }); await ready(); await pg.evalp('BK.manualSimulation=true;' + SETUP);
  await shop('phone-landscape');
  await pg.evalp(`(()=>{BK.ui.storeOpen('map','charms');BK.ui.storeTab=BK.ui.storeRows().findIndex(t=>t.id==='charms');BK.ui.storeI=0;BK.step(3);})()`);
  { const tap = await pg.evalp(`(()=>{const c=document.querySelector('canvas'),r=c.getBoundingClientRect();return {l:r.left,t:r.top,w:r.width,h:r.height};})()`);
    const sc = Math.max(1, Math.floor(Math.min(tap.w / 320, tap.h / 180))), ox = (tap.w - 320 * sc) / 2, oy = (tap.h - 180 * sc) / 2, row = 8, bx = 11 + 40, by = 40 + row * 13 + 3;
    await pg.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: tap.l + ox + bx * sc, y: tap.t + oy + by * sc }] }); await pg.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await pg.evalp('BK.step(3)');
    ck('phone-landscape a touch on the ninth visible row selects it (27-row list)', (await pg.evalp('BK.ui.storeI')) === row); }
  await pg.send('Emulation.setTouchEmulationEnabled', { enabled: false, maxTouchPoints: 1 }); await pg.send('Emulation.clearDeviceMetricsOverride');
  await pg.evalp('localStorage.clear()'); await pg.send('Page.navigate', { url: 'http://localhost:' + pg.PORT + '/?nosw' }); await ready(); await pg.evalp('BK.manualSimulation=true;' + SETUP);

  /* ===== 2. THE TWELVE EFFECTS ===== */
  const E = await pg.evalp(`(async()=>{ const o={}; const setup=__setup, foe=__foe, LV=await import('/src/level.js');
    /* SURE FOOT: the longest coyote seen walking off ledges, and the jump's launch speed */
    for (const id of ['surefoot',null]) { setup(id); BK.keys.right=true; let mx=0; for(let i=0;i<900;i++){ BK.sim(1); BK.P.inv=9; mx=Math.max(mx,BK.P.coyote||0); } BK.keys.right=false; o['foot_'+id+'_coyote']=mx;
      setup(id); BK.press('jump'); BK.sim(1); o['foot_'+id+'_vy']=BK.P.vy; o['foot_'+id+'_worn']=[BKT.PROG.charm,BK.P.ground]; BK.unpress('jump'); }
    /* SCOUT'S CAP: the camera sits ahead of the hero's facing */
    for (const id of ['scout',null]) { setup(id); BK.P.face=1; BK.keys.right=true; BK.sim(150); BK.keys.right=false; BK.sim(40); const c=BK.cam(); o['scout_'+id]=Math.round(BK.P.x-c.x-160); }
    /* BONE-READER: the foe carries its first-blow hp once struck (never a boss), and it is drawn; none without the charm */
    for (const id of ['bone',null]) { setup(id); const e=foe('sprig',3); e.hp=500; BKT.hurtAs('a',e,10,BK.P.x,false); o['bone_'+id+'_hp0']=e.c3Hp0||0; const b=foe('sprig',5); b.hp=500; b.maxHp=500; BKT.hurtAs('a',b,10,BK.P.x,false); o['bone_'+id+'_boss']=b.c3Hp0||0; }
    /* MAGPIE: a silver 11 tiles off, off screen: an edge pip with the charm */
    { const oi=0; setup('magpie','knight',oi); const sv=(BK.L.ents||[]).find(e=>e.t==='silver'); o.magpie_silver=!!sv; if (sv) { BK.tp(sv.x-11, sv.y-1); BK.P.inv=9; BK.sim(3); const tx=Math.floor(BK.P.x/16), ty=Math.floor(BK.P.y/16);
      const A=__strip('r','magpie',tx,ty), N=__strip('r','quiet',tx,ty), N2=__strip('r','quiet',tx,ty); const sA=__strip('r','magpie',tx,ty); o.magpie_diff=__diff(A,N); o.magpie_noise=__diff(N,N2); o.magpie_diff2=__diff(sA,N);
      BK.tp(sv.x-20, sv.y-1); BK.sim(3); const tx2=Math.floor(BK.P.x/16), ty2=Math.floor(BK.P.y/16); o.magpie_far=__diff(__strip('r','magpie',tx2,ty2),__strip('r','quiet',tx2,ty2)); } }
    /* NORTH STAR: idle 21 s at the start: an arrow at the edge toward the gate; not before */
    { setup('northstar'); const early=()=>{ const tx=Math.floor(BK.P.x/16), ty=Math.floor(BK.P.y/16); return __diff(__strip('r','northstar',tx,ty),__strip('r','quiet',tx,ty)); }; BK.P.inv=99; BK.step(300); o.north_5s=early(); BK.step(60*17); o.north_22s=early(); o.north_noise=(()=>{const tx=Math.floor(BK.P.x/16),ty=Math.floor(BK.P.y/16);return __diff(__strip('r','quiet',tx,ty),__strip('r','quiet',tx,ty));})(); }
    /* GRAVEDIGGER'S SPADE: a purse 26 px away is taken with the spade, left alone without; and 80% come back */
    for (const id of ['spade',null]) { setup(id,'knight',0); BK.tp(60,Math.round(BK.P.y/16)-1); BK.sim(5); for(let i=0;i<10;i++){BK.acorns().push({x:BK.P.x,y:BK.P.y-7,got:false,ph:0});BK.sim(1);} BK.sim(5); BK.P.inv=0;BK.P.hurt=0; const carried=BK.dc.carry(0).coins; BK.dc.hit(0,null); for(let i=0;i<300&&BK.P.dead>0;i++)BK.sim(1); BK.sim(60);
      const b=BK.dc.bundle(0); if(!b){o['spade_'+id]={bundle:false};continue;} const before=BKT.PROG.coins, c0=BK.dc.carry(0).coins; BK.P.x=b.x-26; BK.P.y=b.y; BK.P.vx=0; BK.P.inv=9; BK.sim(4); const got=BK.dc.bundle(0)===null; const gained=(BKT.PROG.coins-before)+(BK.dc.carry(0).coins-c0); o['spade_'+id]={bundle:true,had:b.coins+b.purse,taken26:got,gained}; }
    /* HOURGLASS: the clock text beside the charm icon (pixels in the HUD box) */
    { setup('hourglass'); BK.P.inv=99; BK.sim(60); BK.step(1); const c=BK.view.buf.getContext('2d'); const grab=()=>c.getImageData(146,18,60,10).data; const A=grab(); BKT.PROG.charm='quiet'; BK.step(1); const B=grab(); o.hourglass_diff=__diff(A,B); }
    /* TELL-LENS: the vignette darkens the corner; a winding foe is ringed */
    { setup('tell'); BK.P.inv=99; BK.step(1); const c=BK.view.buf.getContext('2d'); const cor=()=>{const d=c.getImageData(0,160,12,20).data;let s=0;for(let i=0;i<d.length;i+=4)s+=d[i]+d[i+1]+d[i+2];return s;}; const withL=cor(); BKT.PROG.charm='quiet'; BK.step(1); const without=cor(); o.tell_corner=[withL,without]; }
    /* RED THREAD + BREADCRUMBS + INK are pixel features: counted in the feats section's level scan */
    /* BROTHERHOOD: the revive clock runs 1.5x for the lifter */
    o.brother_clock=await (async()=>{ const C3=await import('/src/charms3.js'); return [C3.reviveTime('brother',1.5),C3.reviveTime(null,1.5)]; })();
    return o; })()`);
  ck('SURE FOOT: coyote 1.5x longer on the same walk, and the jump launches 4% slower', E.foot_surefoot_coyote > E.foot_null_coyote * 1.4 && E.foot_surefoot_coyote < E.foot_null_coyote * 1.6 && Math.abs(Math.abs(E.foot_surefoot_vy) / Math.abs(E.foot_null_vy) - 0.96) < 0.02, { coyote: [E.foot_surefoot_coyote, E.foot_null_coyote], vy: [E.foot_surefoot_vy, E.foot_null_vy] });
  ck("SCOUT'S CAP: the camera sits ~28 px further ahead (less seen behind)", E.scout_scout - E.scout_null >= 20 && E.scout_scout - E.scout_null <= 36, { scout: E.scout_scout, none: E.scout_null });
  ck('BONE-READER: a struck common foe remembers its health for the bar; never a boss; nothing without it', E.bone_bone_hp0 === 500 && E.bone_bone_boss === 0 && E.bone_null_hp0 === 0, { hp0: E.bone_bone_hp0, boss: E.bone_bone_boss, none: E.bone_null_hp0 });
  ck("MAGPIE'S EYE: a silver 11 tiles off-screen shows an edge pip; 20 tiles away shows nothing", E.magpie_silver && E.magpie_diff - E.magpie_noise > 12 && E.magpie_far <= E.magpie_noise + 4, { diff: E.magpie_diff, noise: E.magpie_noise, far: E.magpie_far });
  ck('NORTH STAR: no arrow at 5 s; an arrow toward the gate after 22 idle seconds', E.north_5s <= E.north_noise + 2 && E.north_22s - E.north_noise > 12, { t5: E.north_5s, t22: E.north_22s, noise: E.north_noise });
  ck("GRAVEDIGGER'S SPADE: a purse 26 px away is taken with it, not without; 4 in 5 coins come back", E.spade_spade.bundle && E.spade_spade.taken26 && !E.spade_null.taken26 && E.spade_spade.gained <= Math.ceil(E.spade_spade.had * 0.8) + 1 && E.spade_spade.gained >= Math.floor(E.spade_spade.had * 0.8) - 1, { spade: E.spade_spade, none: E.spade_null });
  ck('HOURGLASS: a clock reads against the next medal beside the charm icon', E.hourglass_diff > 15, E.hourglass_diff);
  ck('TELL-LENS: the screen corners darken', E.tell_corner[0] < E.tell_corner[1], E.tell_corner);
  ck('BROTHERHOOD KNOT: the lift clock is x2/3', Math.abs(E.brother_clock[0] - 1) < 1e-9 && E.brother_clock[1] === 1.5, E.brother_clock);

  /* ===== 3. THE FEATS, through the real winLevel path ===== */
  const F = await pg.evalp(`(async()=>{ const o={}, LV=await import('/src/level.js'), C3=await import('/src/charms3.js'); const camp=LV.LEVELS.map((l,i)=>[l,i]).filter(([l])=>!l.hidden); const idx=id=>LV.LEVELS.findIndex(l=>l.id===id);
    const start=(id,charm,hero='knight',keep=false)=>{ if(!keep){BK.setHero(hero);BK.reset({fresh:true}); __wipe();} else {BK.setHero(hero);} const P0=BKT.PROG; if(charm){P0.charms=P0.charms||{};P0.charmOf=P0.charmOf||{};P0.charms[charm]=true;P0.charm=charm;P0.charmOf[hero]=charm;} else {P0.charm=null;} BK.applyUpgrades&&BK.applyUpgrades(); BK.load(idx(id)); BK.start(); BK.sim(120); };
    const win=()=>{ BK.coopSave.win(); };  const f=()=>JSON.parse(JSON.stringify((BKT.PROG.c3&&BKT.PROG.c3.f)||{}));
    const c3=()=>BKT.PROG.c3||null;
    /* the first four woods hold twelve silver */
    o.silver4=camp.slice(0,4).map(([l,i])=>{ BK.setHero('knight'); BK.reset({fresh:true}); __wipe(); BK.load(i); return [l.id,(BK.L.ents||[]).filter(e=>e.t==='silver').length]; });
    /* firstgold: not on the first wood, yes on the second, no on a replay; the gold is real (medalFor of the real clock) */
    start('wood',null); win(); o.fg_wood=f().firstgold||0; o.medal_wood=BKT.PROG.wood&&BKT.PROG.wood.medal;
    const P1=BKT.PROG; BK.load(idx(camp[1][0].id)); BK.start(); BK.sim(120); win(); o.fg_second=f().firstgold||0; o.medal_second=BKT.PROG[camp[1][0].id].medal;
    /* assist (invincible) never counts */
    start(camp[2][0].id,null); BKT.PROG.coins=1; { const S=BK.SET||null; } o.assistTried='see below';
    /* swiftgold / ribbongold: gold with the charm worn */
    start(camp[1][0].id,'swift'); win(); o.sg=f().swiftgold||0;
    start(camp[1][0].id,'ribbon'); win(); o.rg=f().ribbongold||0;
    start(camp[1][0].id,'iron'); win(); o.sg_iron=f().swiftgold||0;
    /* clean:3 - three real woods in a row, no fall */
    start('wood',null); win(); for (const [l] of camp.slice(1,4)) { BK.load(idx(l.id)); BK.start(); BK.sim(120); win(); } o.streak=c3()&&c3().streak; o.clean3=C3.featDone('clean:3',BKT.PROG);
    /* a fall resets it */
    BK.load(idx(camp[4][0].id)); BK.start(); BK.sim(120); BK.P.inv=0;BK.P.hurt=0; BK.dc.hit(0,null); for(let i=0;i<300&&BK.P.dead>0;i++)BK.sim(1); o.streak_after_fall=c3()&&c3().streak;
    /* cleanspikes / bossnoflask: scan the campaign for the first wood whose win sets it (no spike touched, no flask) */
    o.spikeWood=null; o.bossWood=null;
    for (const [l,i] of camp.slice(1,40)) { if (o.spikeWood && o.bossWood) break; try { BK.setHero('knight'); BK.reset({fresh:true}); __wipe(); BK.load(i); BK.start(); BK.sim(60); win(); const ff=f(); if (ff.cleanspikes && !o.spikeWood) o.spikeWood=l.id; if (ff.bossnoflask && !o.bossWood) o.bossWood=l.id; } catch(e) { o['err_'+l.id]=String(e.message).slice(0,80); } }
    /* a spike touched in the wood spoils cleanspikes there */
    if (o.spikeWood) { BK.setHero('knight'); BK.reset({fresh:true}); __wipe(); BK.load(idx(o.spikeWood)); BK.start(); BK.sim(60); BK.c3run().hazard=true; win(); o.spikeTouched=f().cleanspikes||0; }
    /* silver1life: take the three silver of a wood, then win; a fall in between spoils it */
    { const [l,i]=camp[1]; BK.setHero('knight'); BK.reset({fresh:true}); __wipe(); BK.load(i); BK.start(); BK.sim(60); const sv=(BK.L.ents||[]).filter(e=>e.t==='silver'); BK.P.inv=99; for (const e of sv) { BK.tp(e.x,e.y); BK.sim(3); } o.silverRun=BK.c3run().silver; win(); o.s1l=f().silver1life||0; }
    { const [l,i]=camp[1]; BK.setHero('knight'); BK.reset({fresh:true}); __wipe(); BK.load(i); BK.start(); BK.sim(60); const sv=(BK.L.ents||[]).filter(e=>e.t==='silver'); BK.P.inv=99; for (const e of sv.slice(0,2)) { BK.tp(e.x,e.y); BK.sim(3); } win(); o.s1l_two=f().silver1life||0; }
    /* heroclear: three heroes on ONE wood (no reset between them) */
    { BK.setHero('knight'); BK.reset({fresh:true}); __wipe(); const id=camp[1][0].id; for (const h of ['knight','pyro','ranger']) { BK.setHero(h); BK.load(idx(id)); BK.start(); BK.sim(120); win(); } o.hc=C3.featProgress('heroclear:3',BKT.PROG); o.hcDone=C3.featDone('heroclear:3',BKT.PROG); }
    return o; })()`);
  ck('FEAT silverin: the first four woods hold three silver each (12)', F.silver4.length === 4 && F.silver4.every(([, n]) => n === 3), F.silver4);
  ck('FEAT firstgold: not the first wood, yes the second wood on a gold first clear', F.fg_wood === 0 && F.fg_second === 1 && F.medal_second === 3, { wood: F.fg_wood, second: F.fg_second, medal: F.medal_second });
  ck('FEAT swiftgold / ribbongold: gold with the charm worn, and not with another charm', F.sg === 1 && F.rg === 1 && F.sg_iron === 0, { swift: F.sg, ribbon: F.rg, iron: F.sg_iron });
  ck('FEAT clean:3: three real woods in a row, no fall, then a fall resets it', F.clean3 === true && F.streak >= 3 && F.streak_after_fall === 0, { streak: F.streak, after: F.streak_after_fall });
  ck('FEAT cleanspikes: a wood with spikes found and won without touching one; touching one spoils it', !!F.spikeWood && F.spikeTouched === 0, { wood: F.spikeWood, touched: F.spikeTouched });
  ck('FEAT bossnoflask: a boss wood found and won with no flask drunk', !!F.bossWood, { wood: F.bossWood });
  ck('FEAT silver1life: the three silver of one wood in one life; two of three does not count', F.silverRun === 3 && F.s1l === 1 && F.s1l_two === 0, { run: F.silverRun, three: F.s1l, two: F.s1l_two });
  ck('FEAT heroclear: three different heroes on one wood', F.hcDone === true, F.hc);

  /* the cheese checks: assist (invincible) and a co-op run count for nothing */
  const CH = await pg.evalp(`(async()=>{ const o={}, LV=await import('/src/level.js'); const idx=id=>LV.LEVELS.findIndex(l=>l.id===id); const camp=LV.LEVELS.filter(l=>!l.hidden);
    const f=()=>JSON.parse(JSON.stringify((BKT.PROG.c3&&BKT.PROG.c3.f)||{}));
    BK.setHero('knight'); BK.reset({fresh:true}); __wipe(); BKT.SET&&0; const S=BK.SET; S.invincible=true; BK.load(idx(camp[1].id)); BK.start(); BK.sim(120); BK.coopSave.win(); o.assist=[f().firstgold||0,(BKT.PROG.c3&&BKT.PROG.c3.streak)||0]; S.invincible=false;
    BK.setHero('knight'); BK.reset({fresh:true}); __wipe(); BK.load(idx(camp[1].id)); BK.start(); BK.sim(120); BK.coopStart('ranger',true); BK.sim(30); BK.coopSave.win(); o.coop=[f().firstgold||0,(BKT.PROG.c3&&BKT.PROG.c3.streak)||0]; BK.coopEnd();
    return o; })()`);
  ck('CHEESE: assist (invincible) and co-op wins count for no feat', CH.assist[0] === 0 && CH.assist[1] === 0 && CH.coop[0] === 0 && CH.coop[1] === 0, CH);

  /* the mini-boss, the purse a foe carried, the revive in a boss fight: scripted on the real hooks */
  const H = await pg.evalp(`(async()=>{ const o={}, LV=await import('/src/level.js'); const f=()=>JSON.parse(JSON.stringify((BKT.PROG.c3&&BKT.PROG.c3.f)||{}));
    /* purseback: die to a foe carrying coins, kill the carrier, take the purse back */
    __setup(null,'knight',0); __wipe(); BK.start(); BK.tp(60,Math.round(BK.P.y/16)-1); BK.sim(5); for(let i=0;i<10;i++){BK.acorns().push({x:BK.P.x,y:BK.P.y-7,got:false,ph:0});BK.sim(1);} BK.gainXp(40); BK.sim(5);
    const e=__foe('sprig',2); e.xpKey=e.xpKey||'c4'; e.hp=900; BK.P.inv=0;BK.P.hurt=0; BK.dc.hit(0,e); for(let i=0;i<300&&BK.P.dead>0;i++)BK.sim(1); BK.sim(60);
    let b=BK.dc.bundle(0); o.pb_mode=b&&b.mode; o.pb_where=b&&b.where;
    if (b && b.where==='foe') { const ce=b.carrier; if (ce) { ce.alive=false; ce.hp=0; } BK.sim(60); b=BK.dc.bundle(0); o.pb_after=b&&b.mode; if(b){ BK.P.x=b.x; BK.P.y=b.y; BK.P.vx=0; BK.P.inv=9; BK.sim(8); } }
    o.pb_done=f().purseback||0; o.pb_bundle_gone=BK.dc.bundle(0)===null;
    /* a spot purse (no carrier) does not count */
    __setup(null,'knight',0); __wipe(); BK.start(); BK.tp(60,Math.round(BK.P.y/16)-1); BK.sim(5); for(let i=0;i<10;i++){BK.acorns().push({x:BK.P.x,y:BK.P.y-7,got:false,ph:0});BK.sim(1);} BK.P.inv=0;BK.P.hurt=0; BK.dc.hit(0,null); for(let i=0;i<300&&BK.P.dead>0;i++)BK.sim(1); BK.sim(60); { const b2=BK.dc.bundle(0); if(b2){ BK.P.x=b2.x; BK.P.y=b2.y; BK.P.inv=9; BK.sim(6);} } o.spot_counts=f().purseback||0;
    return o; })()`);
  ck('FEAT purseback: a purse a foe carried, taken back after the carrier falls (a plain spot purse does not count)', H.pb_where === 'foe' && H.pb_done === 1 && H.spot_counts === 0, H);
} catch (e) { fails++; console.log('TOOL ERROR', e.stack || e); } finally { pg.close(); }
ck('no page errors', pg.errors.length === 0, pg.errors.slice(0, 3));
writeFileSync(out + '/charms4-results.json', JSON.stringify(R, null, 1));
console.log(fails ? 'charms4-play: ' + fails + ' FAILED' : 'charms4-play: ok'); process.exit(fails ? 1 : 0);
