// tools/charms3.mjs - THE EIGHT NEW CHARMS IN A REAL PAGE (claude/charms3-d). One browser, flag ON through window.__CHARMS2 (src/charms2.js; the shipped CHARMS2_SHIP stays false).
//   node tools/charms3.mjs [outDir]       default ../bracken-scratch/desktop-out/charms3
// 1. SHOP: the CHARMS tab at desktop size and at phone width (844x390 and 390x844, touch): 15 rows (NONE + 14), locked rows say what to do, buy + wear + swap, ONE charm worn per hero, a row tap scrolls the list.
// 2. EFFECTS: each of the eight does its job in play (thorn, stone, hound, gambler, quiet, lantern, pilgrim by number; salt by its edge bag on screen).
// 3. SAVE: an old save loads with the flag ON and OFF; a new charm in a save with the flag off is read as nothing.
// Exits 1 on any failed assert. Needs >= 1500 MB free (one browser).
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
const out = process.argv[2] || '../bracken-scratch/desktop-out/charms3'; mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false, fonts: false, seed: 7 });
const R = {}; let fails = 0;
const ck = (name, ok, info) => { R[name] = { ok: !!ok, info }; if (!ok) { fails++; console.log('FAIL', name, JSON.stringify(info)); } else console.log('ok  ', name, info === undefined ? '' : JSON.stringify(info).slice(0, 300)); };
const shot = async name => { const r = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(out + '/' + name + '.png', Buffer.from(r.result.data, 'base64')); };
const wait = ms => pg.evalp('new Promise(r=>setTimeout(r,' + ms + '))').catch(() => {});
const ready = async () => { for (let i = 0; i < 200; i++) { const ok = await pg.evalp('typeof window.BK==="object"&&!!window.BK.lookPass', 2000).catch(() => false); if (ok) return; await wait(250); } };
const SETUP = `window.__setup=(id,hero='knight',lvl=0)=>{BK.setHero(hero);BK.reset({fresh:true});const P0=BKT.PROG;P0.coins=500;P0.charms=P0.charms||{};P0.charmOf=P0.charmOf||{};if(id){P0.charms[id]=true;P0.charm=id;P0.charmOf[hero]=id;}else{P0.charm=null;P0.charmOf[hero]=null;}BK.applyUpgrades&&BK.applyUpgrades();BK.load(lvl);BK.state='play';BK.sim(240);};
 window.__foe=(t,dx,o)=>{const f=BK.spawnFoe({t,x:Math.round(BK.P.x/16)+dx,y:Math.round(BK.P.y/16)-1,...(o||{})});return Array.isArray(f)?f[0]:f;};`;
try {
  await pg.send('Page.addScriptToEvaluateOnNewDocument', { source: 'window.__CHARMS2=true' });
  await pg.reload();
  await pg.evalp('BK.manualSimulation=true;' + SETUP);

  /* ===== 1. THE SHOP ===== */
  const shop = async tag => {
    const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;BK.setHero('knight');BK.reset({fresh:true});BK.load(0);BK.state='map';const P0=BKT.PROG;P0.coins=5000;P0.charms={};P0.charmOf={};P0.charm=null;
      BK.ui.storeOpen('map','charms');const ti=BK.ui.storeRows().findIndex(t=>t.id==='charms');BK.ui.storeTab=ti;BK.ui.storeI=0;BK.step(3);
      return {ti,n:BK.ui.items(),rows0:BK.ui.storeRows()[ti].rows};})()`);
    ck(tag + ' 15 rows (NONE + 14)', r.n === 15 && r.rows0.length === 15, r.n);
    ck(tag + ' the eight new rows are locked on a fresh save', ['thorn', 'stone', 'hound', 'gambler', 'salt', 'quiet', 'lantern', 'pilgrim'].every(id => r.rows0.find(x => x.id === id).state === 'locked'));
    await pg.evalp(`(()=>{BK.ui.storeI=11;BK.step(45);})()`); await shot(tag + '-1-locked-salt-row');   /* SALT: 'fall 10 times to earn it' in the panel */
    await pg.evalp(`(()=>{BK.ui.storeI=0;BK.step(45);})()`); await shot(tag + '-0-top');
    /* unlock every gate through the save, the way a player would: levels cleared, 15 medals, 12 silver, 10 falls, three heroes */
    const u = await pg.evalp(`(async()=>{const LV=await import('/src/level.js'),P0=BKT.PROG;for(const id of ['wood','stockade','moor','spire'])P0[id]=Object.assign(P0[id]||{},{cleared:true});
      const ls=LV.LEVELS.filter(l=>!l.hidden&&!['wood','stockade','moor','spire'].includes(l.id)).slice(0,6);for(const l of ls){P0[l.id]=Object.assign(P0[l.id]||{},{medal:3});}
      for(const id of ['wood','stockade','moor','spire'])P0[id].silver=7;P0.heroes=Object.assign(P0.heroes||{},{knight:true,pyro:true,paladin:true});P0.c2={deaths:10};BK.step(3);
      return BK.ui.storeRows().find(t=>t.id==='charms').rows.map(r=>r.id+':'+r.state);})()`);
    ck(tag + ' every gate opens (ribbon stays locked: 45 medals)', u.filter(s => /^(thorn|stone|hound|gambler|salt|quiet|lantern|pilgrim):buy$/.test(s)).length === 8 && u.includes('ribbon:locked'), u.join(' '));
    /* buy + wear + swap: ONE worn */
    const b = await pg.evalp(`(()=>{const P0=BKT.PROG,pr=()=>BK.ui.storeRows().find(t=>t.id==='charms').rows,idx=id=>pr().findIndex(r=>r.id===id),st=id=>pr().find(r=>r.id===id).state,res={};
      const act=id=>{BK.ui.storeI=idx(id);BK.step(2);BK.press('confirm');BK.sim(2);BK.step(2);};
      const c0=P0.coins;act('thorn');res.thorn1={coins:c0-P0.coins,charm:P0.charm,own:!!P0.charms.thorn,state:st('thorn')};
      act('stone');res.stone1={charm:P0.charm,thornOwned:!!P0.charms.thorn,thornState:st('thorn'),stoneState:st('stone'),charmOf:P0.charmOf.knight};
      const c1=P0.coins;act('thorn');res.swapBack={paid:c1-P0.coins,charm:P0.charm,state:st('thorn')};
      act('quiet');act('thorn');res.nWorn=pr().filter(r=>r.state==='equipped'&&r.id!=='none').length;
      act('none');res.none={charm:P0.charm,state:st('none')};act('thorn');res.rewear=P0.charm;
      const c2=P0.coins;BK.ui.storeI=idx('ribbon');BK.step(2);BK.press('confirm');BK.sim(2);res.lockedBuy={coins:c2-P0.coins,own:!!P0.charms.ribbon};
      return res;})()`);
    ck(tag + ' buy THORN pays 80 and wears it', b.thorn1.coins === 80 && b.thorn1.charm === 'thorn' && b.thorn1.state === 'equipped', b.thorn1);
    ck(tag + ' buying STONE swaps it in: thorn kept but not worn', b.stone1.charm === 'stone' && b.stone1.thornOwned && b.stone1.thornState === 'owned' && b.stone1.stoneState === 'equipped' && b.stone1.charmOf === 'stone', b.stone1);
    ck(tag + ' swapping back to an owned charm is free', b.swapBack.paid === 0 && b.swapBack.charm === 'thorn' && b.swapBack.state === 'equipped', b.swapBack);
    ck(tag + ' exactly one charm worn in the list', b.nWorn === 1, b.nWorn);
    ck(tag + ' NONE takes it off, and it goes back on', (b.none.charm == null || b.none.charm === 'none') && b.none.state === 'equipped' && b.rewear === 'thorn', b);
    ck(tag + ' a locked row cannot be bought', b.lockedBuy.coins === 0 && !b.lockedBuy.own, b.lockedBuy);
    /* one charm per HERO */
    const h = await pg.evalp(`(()=>{const P0=BKT.PROG;BK.setHero('pyro');const pyroStart=P0.charm;P0.charms.quiet=true;P0.charm='quiet';P0.charmOf.pyro='quiet';BK.setHero('knight');const knightBack=P0.charm;BK.setHero('pyro');const pyroBack=P0.charm;BK.setHero('knight');return {pyroStart,knightBack,pyroBack,of:JSON.stringify(P0.charmOf)};})()`);
    ck(tag + ' one charm worn per hero (the knight keeps his, the pyromancer his own)', h.pyroStart == null && h.knightBack === 'thorn' && h.pyroBack === 'quiet', h);
    /* scroll: the last row, and the middle */
    await pg.evalp(`(()=>{BK.ui.storeOpen('map','charms');BK.ui.storeTab=BK.ui.storeRows().findIndex(t=>t.id==='charms');BK.ui.storeI=14;BK.step(45);})()`); await shot(tag + '-2-bottom-pilgrim');
    await pg.evalp(`(()=>{BK.ui.storeI=7;BK.step(45);})()`); await shot(tag + '-3-middle-thorn-owned');
  };
  /* DESKTOP 1280x720 */
  await pg.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
  await wait(300);
  await shop('desktop');
  /* PHONE: 844x390 landscape and 390x844 portrait, touch on */
  /* (the game plays landscape only: upright it shows 'TURN IT SIDEWAYS', so the phone case is 844x390, the repo's phone viewport in tools/boss-select.mjs; the rotate screen is captured once below) */
  for (const [w, h, tag] of [[844, 390, 'phone-landscape']]) {
    await pg.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 2, mobile: true, screenOrientation: w > h ? { type: 'landscapePrimary', angle: 90 } : { type: 'portraitPrimary', angle: 0 } });
    await pg.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await pg.evalp('localStorage.clear()'); await pg.send('Page.navigate', { url: 'http://localhost:' + pg.PORT + '/?touch=1&nosw' }); await ready();
    await pg.evalp('BK.manualSimulation=true;' + SETUP);
    await shop(tag);
    /* a TOUCH on a row picks it (the ninth visible row) and the list follows */
    await pg.evalp(`(()=>{BK.ui.storeOpen('map','charms');BK.ui.storeTab=BK.ui.storeRows().findIndex(t=>t.id==='charms');BK.ui.storeI=0;BK.step(3);})()`);
    const tap = await pg.evalp(`(()=>{const c=document.querySelector('canvas'),r=c.getBoundingClientRect();return {l:r.left,t:r.top,w:r.width,h:r.height,i:BK.ui.storeI};})()`);
    const sc = Math.max(1, Math.floor(Math.min(tap.w / 320, tap.h / 180))), ox = (tap.w - 320 * sc) / 2, oy = (tap.h - 180 * sc) / 2, row = 8, bx = 11 + 40, by = 40 + row * 13 + 3;
    await pg.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: tap.l + ox + bx * sc, y: tap.t + oy + by * sc }] }); await pg.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await pg.evalp('BK.step(3)'); const after = await pg.evalp('BK.ui.storeI');
    ck(tag + ' a touch on the ninth visible row selects it', after === row, { before: tap.i, after, canvasCss: [Math.round(tap.w), Math.round(tap.h)] });
    await pg.evalp(`(()=>{BK.ui.storeI=9;BK.step(45);})()`); await shot(tag + '-4-scrolled-row9');
    await pg.send('Emulation.setTouchEmulationEnabled', { enabled: false, maxTouchPoints: 1 });
  }
  await pg.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true, screenOrientation: { type: 'portraitPrimary', angle: 0 } }); await wait(500); await shot('phone-upright-rotate-screen');
  await pg.send('Emulation.clearDeviceMetricsOverride');
  await pg.evalp('localStorage.clear()'); await pg.send('Page.navigate', { url: 'http://localhost:' + pg.PORT + '/?nosw' }); await ready();
  await pg.evalp('BK.manualSimulation=true;' + SETUP);

  /* ===== 2. THE EIGHT EFFECTS ===== */
  const E = await pg.evalp(`(async()=>{ const out={}, XP=await import('/src/xp.js'), LV=await import('/src/level.js'); const setup=__setup, foe=__foe;
    for (const id of ['thorn',null]) { setup(id); let e=foe('sprig',1); e.hp=500; let h=e.hp; BK.damagePlayer(e.x,5,{who:e}); out['thorn_'+id+'_melee']=h-e.hp; BK.sim(90);
      e=foe('sprig',1); e.hp=500; e.maxHp=500; h=e.hp; BK.damagePlayer(e.x,5,{who:e}); out['thorn_'+id+'_boss']=h-e.hp; BK.sim(90);
      e=foe('sprig',9); e.hp=500; h=e.hp; BK.damagePlayer(e.x,5,{who:e}); out['thorn_'+id+'_far']=h-e.hp; BK.sim(90);
      e=foe('sprig',1); e.hp=500; h=e.hp; BK.damagePlayer(e.x,5,{who:e,geo:true}); out['thorn_'+id+'_hazard']=h-e.hp; }
    for (const id of ['stone',null]) { setup(id); for (const d of [4,10,13,14,25]) { BK.sim(120); BK.P.inv=0;BK.P.hurt=0;BK.P.block=false;BK.P.vx=0;BK.P.vy=0;BK.P.hp=BK.P.maxHp; const hp0=BK.P.hp; BK.damagePlayer(BK.P.x+10,d,{name:'A BLOW'}); out['stone_'+id+'_'+d]={thrown:!BK.P.ground,lost:hp0-BK.P.hp}; } }
    for (const id of ['hound',null]) { setup(id); let e=foe('sprig',2); e.hp=900; let h=e.hp; BKT.hurtAs('a',e,10,BK.P.x,false); out['hound_'+id+'_first']=h-e.hp; h=e.hp; BKT.hurtAs('a',e,10,BK.P.x,false); out['hound_'+id+'_second']=h-e.hp;
      const m=foe('sprig',3); m.hp=900; m.mini=true; h=m.hp; BKT.hurtAs('a',m,10,BK.P.x,false); out['hound_'+id+'_mini']=h-m.hp; const b=foe('sprig',4); b.hp=900; b.maxHp=900; h=b.hp; BKT.hurtAs('a',b,10,BK.P.x,false); out['hound_'+id+'_boss']=h-b.hp; }
    for (const id of ['gambler',null]) { setup(id); BK.sim(120); const e=foe('sprig',3); const hp0=BK.P.hp; BK.P.inv=0; BK.damagePlayer(e.x,20,{who:e}); out['gambler_'+id+'_taken']=hp0-BK.P.hp; BK.sim(90); const c0=BK.dc.carry(0).coins; const a=BK.acorns(); for(let i=0;i<20;i++) a.push({x:BK.P.x,y:BK.P.y-7,got:false,ph:0}); BK.sim(20); out['gambler_'+id+'_coins20']=BK.dc.carry(0).coins-c0; }
    const reach=(id,t)=>{ setup(id); let best=0; for (let d=60; d<=300; d+=4) { const f=BK.spawnFoe({t,x:Math.round((BK.P.x+d)/16),y:Math.round(BK.P.y/16)-1}); const e=Array.isArray(f)?f[0]:f; if(!e) continue; e.x=BK.P.x+d; e.y=BK.P.y; const x0=e.x; BK.sim(24); if (x0-e.x>3 || e.woke) best=d; e.alive=false; e.hp=0; BK.sim(2); } return best; };
    for (const t of ['hound','drone','sapper']) out['quiet_'+t]=[reach('quiet',t),reach(null,t)];
    { const oi=LV.LEVELS.findIndex(l=>l.id==='oreroad'); for (const id of ['lantern',null]) { setup(id,'knight',oi); const w=BK.L.walls[0], cx=(w.x0+1)*8+w.x0*8, cy=(w.y0+1)*8+w.y0*8; for (const tiles of [3,8]) { let n=0; for(let k=0;k<20;k++){ BK.P.x=cx-tiles*16; BK.P.y=cy; BK.P.vx=0;BK.P.vy=0;BK.P.inv=5; BK.sim(6); n+=BK.parts().filter(p=>p.col==='#fff6c8'&&p.vy===-6&&p.size===1&&Math.abs(p.x-cx)<30).length; BK.parts().length=0;} out['lantern_'+id+'_'+tiles+'tiles']=n; } } }
    const xpc=(id,pxp,kxp,raw)=>{ setup(id); const P0=BKT.PROG; P0.xp=P0.xp||{}; P0.heroes=P0.heroes||{}; P0.heroes.pyro=true; P0.xp.pyro=pxp; P0.xp.knight=kxp; const b=P0.xp.knight; BK.gainXp(raw); return P0.xp.knight-b; };
    for (const [g,k] of [[18,2],[5,15],[4,16],[2,18]]) out['pilgrim_gap'+g]=[xpc('pilgrim',XP.xpFloor(20),XP.xpFloor(k),100),xpc(null,XP.xpFloor(20),XP.xpFloor(k),100)];
    { setup('pilgrim'); const P0=BKT.PROG; P0.heroes.pyro=true; P0.xp.pyro=XP.xpFloor(50); P0.xp.knight=XP.xpFloor(40); BK.gainXp(1e9); out.pilgrim_cap=[P0.xp.knight,XP.xpCap()]; }
    return out; })()`);
  ck('THORN: a melee blow returns 1; none on a boss, a bolt from afar, a hazard; none without the charm', E.thorn_thorn_melee === 1 && E.thorn_thorn_boss === 0 && E.thorn_thorn_far === 0 && E.thorn_thorn_hazard === 0 && E.thorn_null_melee === 0, { melee: E.thorn_thorn_melee, boss: E.thorn_thorn_boss, far: E.thorn_thorn_far, hazard: E.thorn_thorn_hazard, none: E.thorn_null_melee });
  ck('STONE: taken <= 10 (10% of max hp, floor 6) no longer throws you; 11+ still does; without it every blow throws', [4, 10].every(d => !E['stone_stone_' + d].thrown) && [14, 25].every(d => E['stone_stone_' + d].thrown) && [4, 10, 14, 25].every(d => E['stone_null_' + d].thrown), { stone: [4, 10, 13, 14, 25].map(d => [d, E['stone_stone_' + d].thrown, E['stone_stone_' + d].lost]), none: [4, 10, 14, 25].map(d => E['stone_null_' + d].thrown) });
  ck('HOUND: first blow +15% (10 -> 12), second 10, never a mini or a boss, none without it', E.hound_hound_first === 12 && E.hound_hound_second === 10 && E.hound_hound_mini === 10 && E.hound_hound_boss === 10 && E.hound_null_first === 10, { first: E.hound_hound_first, second: E.hound_hound_second, mini: E.hound_hound_mini, boss: E.hound_hound_boss, none: E.hound_null_first });
  ck('GAMBLER: 20 coins pay 25 (+25%), and a blow costs more (+10%)', E.gambler_gambler_coins20 === 25 && E.gambler_null_coins20 === 20 && E.gambler_gambler_taken > E.gambler_null_taken, { coins: [E.gambler_gambler_coins20, E.gambler_null_coins20], taken: [E.gambler_gambler_taken, E.gambler_null_taken] });
  ck('QUIET BOOTS: the notice radius is 0.7x on the stock chase checks (hound, drone, sapper)', ['hound', 'drone', 'sapper'].every(t => { const [a, b] = E['quiet_' + t]; return b > 0 && Math.abs(a / b - 0.7) < 0.04; }), { hound: E.quiet_hound, drone: E.quiet_drone, sapper: E.quiet_sapper });
  ck('LANTERN: breakable walls glint within 6 tiles and not at 8; nothing without it', E.lantern_lantern_3tiles > 0 && E.lantern_lantern_8tiles === 0 && E.lantern_null_3tiles === 0, { l3: E.lantern_lantern_3tiles, l8: E.lantern_lantern_8tiles, none3: E.lantern_null_3tiles });
  ck('PILGRIM: +15% XP at a 5+ level gap (230/200, 46/40), none at 4 or 2, never past the cap', E.pilgrim_gap18[0] === 230 && E.pilgrim_gap18[1] === 200 && E.pilgrim_gap5[0] === 46 && E.pilgrim_gap4[0] === E.pilgrim_gap4[1] && E.pilgrim_gap2[0] === E.pilgrim_gap2[1] && E.pilgrim_cap[0] <= E.pilgrim_cap[1], { g18: E.pilgrim_gap18, g5: E.pilgrim_gap5, g4: E.pilgrim_gap4, g2: E.pilgrim_gap2, cap: E.pilgrim_cap });
  /* SALT: die carrying coins; the purse lies off screen: an edge bag + arrow with the charm and none without; the world-map bag by its wood */
  const S = await pg.evalp(`(async()=>{ const o={}; __setup('salt','knight',0); BKT.PROG.charms.quiet=true; BK.tp(60,Math.round(BK.P.y/16)-1); BK.sim(5); for(let i=0;i<6;i++){BK.acorns().push({x:BK.P.x,y:BK.P.y-7,got:false,ph:0});BK.sim(1);} BK.gainXp(40); BK.sim(10); BK.P.inv=0;BK.P.hurt=0; BK.dc.hit(0,null); for(let i=0;i<300&&BK.P.dead>0;i++)BK.sim(1); BK.sim(120);
    const b=BK.dc.bundle(0); o.bundle=!!b; if(!b) return o; const ty=Math.round(b.y/16)-3;
    const strip=ch=>{ BKT.PROG.charm=ch; BK.look(10,ty); const c=BK.view.buf,W=c.width,H=c.height; return c.getContext('2d').getImageData(W-30,0,30,H).data; };
    const diff=(A,B)=>{let n=0;for(let i=0;i<A.length;i+=4) if(Math.abs(A[i]-B[i])+Math.abs(A[i+1]-B[i+1])+Math.abs(A[i+2]-B[i+2])>24) n++; return n;};
    const sA=strip('salt'), nA=strip('quiet'), nB=strip('quiet'); o.edgeDiff=diff(sA,nA); o.edgeNoise=diff(nA,nB); BKT.PROG.charm='salt'; BK.look(10,ty); o.shotS=BK.view.buf.toDataURL(); BKT.PROG.charm='quiet'; BK.look(10,ty); o.shotN=BK.view.buf.toDataURL();
    BKT.PROG.charm='salt'; BK.state='map'; BK.step(30); o.mapS=BK.view.buf.toDataURL(); BKT.PROG.charm='quiet'; BK.step(1); o.mapN=BK.view.buf.toDataURL(); return o; })()`);
  for (const [k, f] of [['shotS', 'salt-edge-with'], ['shotN', 'salt-edge-without'], ['mapS', 'salt-map-with'], ['mapN', 'salt-map-without']]) if (S[k]) writeFileSync(out + '/' + f + '.png', Buffer.from(S[k].split(',')[1], 'base64'));
  ck('SALT: the purse is dropped; with the charm the screen edge carries the bag + arrow (pixels that differ in the right-edge strip vs another charm, minus the frame-to-frame noise > 40)', S.bundle && S.edgeDiff - S.edgeNoise > 40, { diffPx: S.edgeDiff, noise: S.edgeNoise });

  /* ===== 3. SAVE ROUND TRIP, flag on and off ===== */
  const sv = await pg.evalp(`(async()=>{ const PR=await import('/src/progression.js'),C2=await import('/src/charms2.js'); const o={};
    const old={progressionVersion:2,hero:'knight',xp:{knight:500},done:{},coins:40,charm:'iron',charms:{iron:true},charmOf:{knight:'iron'}};
    const a=PR.migrateProgress(JSON.stringify(old),[]).progress; o.oldOn={charm:a.charm,own:Object.keys(a.charms),worn:C2.worn(a.charm),ship:C2.charms2Ship()};
    const nw={...old,charm:'thorn',charms:{thorn:true,iron:true},charmOf:{knight:'thorn'},c2:{deaths:4}}; const b=PR.migrateProgress(JSON.stringify(nw),[]).progress; PR.validateProgress(JSON.parse(JSON.stringify(b))); o.newOn={charm:b.charm,of:b.charmOf,c2:b.c2,worn:C2.worn(b.charm)};
    C2.setCharms2Ship(false); o.offWorn=C2.worn('thorn'); o.offRows=C2.rows().length; o.offDeath=C2.noteDeath({coins:1}); const c=PR.migrateProgress(JSON.stringify(nw),[]).progress; o.offKept={charm:c.charm,own:Object.keys(c.charms)}; C2.setCharms2Ship(true); return o; })()`);
  ck('SAVE: an old save loads with the flag ON (iron still worn, nothing added)', sv.oldOn.charm === 'iron' && sv.oldOn.worn === null && sv.oldOn.ship === true, sv.oldOn);
  ck('SAVE: a save wearing THORN round-trips through migrate + validate with the flag ON', sv.newOn.charm === 'thorn' && sv.newOn.of.knight === 'thorn' && sv.newOn.c2.deaths === 4 && sv.newOn.worn === 'thorn', sv.newOn);
  ck('SAVE: flag OFF reads THORN as nothing, adds no rows, writes nothing, and keeps the save intact', sv.offWorn === null && sv.offRows === 0 && sv.offDeath === false && sv.offKept.charm === 'thorn' && sv.offKept.own.includes('thorn'), sv);
  ck('no page errors', pg.errors.length === 0, pg.errors.slice(0, 3));
} catch (e) { fails++; console.log('TOOL ERROR', e.stack || e); } finally { pg.close(); }
writeFileSync(out + '/charms3-results.json', JSON.stringify(R, null, 1));
console.log(fails ? 'charms3: ' + fails + ' FAILED' : 'charms3: ok'); process.exit(fails ? 1 : 0);
