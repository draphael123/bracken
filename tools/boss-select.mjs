// Boss Select uses the campaign save's kit and writes only its per-slot records.
import { openPage } from './cdp.mjs';

const pg = await openPage({ audio: false, fonts: false });
const failures = [], ok = (yes, why) => { if (!yes) failures.push(why); };
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const seed = { hero: 'knight', progressionVersion: 2, heroes: { knight: true, warden: true }, xp: { knight: 840, warden: 240 },
  skillOwned: { knight: { shieldThrow: true } }, loadouts: { knight: ['shieldThrow'] },
  flaskUp: 1, wood: { cleared: true, medal: 1 }, kings: { mini: true } };
const slotKey = 'bracken.progress.2';
const read = () => pg.evalp(`JSON.parse(localStorage.getItem(${JSON.stringify(slotKey)})||'null')`);
try {
  // Start with a pre-records save in slot 3; the other four slots must remain untouched.
  await pg.evalp(`(()=>{localStorage.clear();localStorage.setItem(${JSON.stringify(slotKey)},${JSON.stringify(JSON.stringify(seed))});localStorage.setItem('bracken.slot','2');window.__old=1;setTimeout(()=>location.assign('/?noopening=1'),0)})()`);
  for (let i = 0; i < 240; i++) { await sleep(150); if (await pg.evalp('!window.__old&&window.BK?.slot===2').catch(() => false)) break; }
  const before = await pg.evalp('({slot:BK.slot,xp:BK.PROG.xp.knight,flaskUp:BK.PROG.flaskUp,records:BK.PROG.bossRecords,items:BK.ui.titleTop()})');
  ok(before.slot === 2 && before.xp === 840 && before.flaskUp === 1, 'old save did not migrate with its real kit');
  ok(JSON.stringify(before.records) === '{}', 'old save did not get empty records in memory');
  ok(before.items.includes('BOSS SELECT'), 'title has no Boss Select entry');
  const rows = await pg.evalp(`(()=>{BK.bossSelect.open('title');return BK.bossSelect.rows()})()` , 120000);
  const table = await pg.evalp('BK.bossJump.table()', 120000);
  ok(rows.length === table.length && rows.length > 40, 'list is not derived from the full boss table');
  const queen = rows.findIndex(r => r.key === 'wood:boss');
  ok(queen >= 0 && rows[queen].beaten && rows[queen].name !== '???', 'beaten queen hidden');
  ok(rows.some(r => !r.beaten && r.name === '???' && r.level === null && r.key === null), 'unbeaten boss revealed');
  ok(rows.some(r => r.key === 'kings:mini' && r.beaten), 'beaten mini absent');
  ok(rows.every((r, i) => !i || rows[i - 1].act <= r.act), 'bosses are not grouped by act');
  const savedBeforeFight = await read();
  const locked = rows.findIndex(r => !r.beaten);
  const lockResult = await pg.evalp(`(()=>{BK.bossSelect.cursor=${locked};return BK.bossSelect.start()})()`);
  ok(lockResult === false && await pg.evalp('BK.state') === 'bossselect', 'locked boss started');
  const illegal = await pg.evalp(`(()=>{BK.bossSelect.cursor=${queen};BK.bossSelect.hero='pyro';return BK.bossSelect.start()})()`);
  ok(illegal === false, 'unowned hero started');
  const started = await pg.evalp(`(()=>{BK.manualSimulation=true;BK.bossSelect.hero='knight';return BK.bossSelect.start()})()`, 120000);
  ok(started && await pg.evalp('BK.state') === 'play', 'owned hero did not enter fight');
  const fight = await pg.evalp(`({level:BK.L.arena?.boss,hero:BK.PROG.hero,xp:BK.PROG.xp.knight,skill:BK.PROG.skillOwned?.knight?.shieldThrow,loadout:BK.PROG.loadouts?.knight?.[0],flaskUp:BK.PROG.flaskUp,flasks:BK.P.flasks,x:BK.P.x,trigger:BK.L.arena?.trigger,on:BK.bossJump.on,fighting:BK.bossSelect.fighting})`);
  ok(fight.level === 'oldtusker' && fight.hero === 'knight' && fight.xp === 840 && fight.skill === true && fight.loadout === 'shieldThrow' && fight.flaskUp === 1 && fight.flasks > 0 && Math.abs(fight.x - fight.trigger) <= 32 && fight.on && fight.fighting,
    'fight did not use the saved hero, level and flask kit: ' + JSON.stringify(fight));
  const backAtDoor = await pg.evalp(`(()=>{BK.P.dead=0.01;BK.sim(4);return{state:BK.state,x:BK.P.x,hp:BK.P.hp,max:BK.P.maxHp}})()`);
  ok(backAtDoor.state === 'play' && Math.abs(backAtDoor.x - fight.x) < 2 && backAtDoor.hp === backAtDoor.max, 'death did not return to the boss door at full health: ' + JSON.stringify(backAtDoor));
  const kill = await pg.evalp(`(()=>{let f=0;for(;f<600&&!BK.bossActive;f++)BK.sim(1);const woke=BK.bossActive;const e=BK.boss;if(e){for(let j=0;j<200&&e.alive;j++){BK.P.inv=99;e.hp=1;e.inv=0;BKT.hurtEnemy(e,999,e.x-10,false);BK.sim(2)}}return{woke,alive:e?.alive,frames:f}})()`, 120000);
  ok(kill.woke && !kill.alive, 'boss did not wake and fall: ' + JSON.stringify(kill));
  const afterKill = await read();
  const record = afterKill?.bossRecords?.['wood:boss']?.knight;
  ok(record?.best > 0 && record.noHit === true, 'best/no-hit record was not saved: ' + JSON.stringify(record));
  const withoutRecords = structuredClone(afterKill); delete withoutRecords.bossRecords;
  const savedBeforeWithoutRecords = structuredClone(savedBeforeFight); delete savedBeforeWithoutRecords.bossRecords;
  ok(JSON.stringify(withoutRecords) === JSON.stringify(savedBeforeWithoutRecords), 'fight changed campaign save data: ' + JSON.stringify({ before: savedBeforeWithoutRecords, after: withoutRecords }));
  const quit = await pg.evalp(`(()=>{BK.ui.openMenu('play');const has=BK.ui.menuRows().includes('Quit to Boss Select');BK.bossSelect.quit();return{has,state:BK.state,xp:BK.PROG.xp.knight,fighting:BK.bossSelect.fighting}})()`);
  ok(quit.has && quit.state === 'bossselect' && quit.xp === 840 && !quit.fighting, 'quit did not restore list/save: ' + JSON.stringify(quit));
  const miniIndex = rows.findIndex(r => r.key === 'kings:mini');
  const miniStarted = await pg.evalp(`(()=>{BK.bossSelect.cursor=${miniIndex};BK.bossSelect.hero='warden';return BK.bossSelect.start()})()`, 120000);
  ok(miniStarted && await pg.evalp('BK.PROG.xp.warden') === 240, 'owned Warden did not enter mini with her saved XP');
  const miniKill = await pg.evalp(`(()=>{let f=0;for(;f<600&&!BK.miniActive;f++)BK.sim(1);const woke=BK.miniActive;const e=BK.enemies().find(q=>q.t==='greathound'&&q.alive);if(e){for(let j=0;j<200&&e.alive;j++){BK.P.inv=99;e.hp=1;e.inv=0;BKT.hurtEnemy(e,999,e.x-10,false);BK.sim(2)}}return{woke,alive:e?.alive,frames:f}})()`, 120000);
  ok(miniKill.woke && !miniKill.alive, 'mini did not wake and fall: ' + JSON.stringify(miniKill));
  const miniRecord = (await read())?.bossRecords?.['kings:mini']?.warden;
  ok(miniRecord?.best > 0 && miniRecord.noHit === true, 'mini/Warden record missing: ' + JSON.stringify(miniRecord));
  await pg.evalp('BK.bossSelect.quit()');
  await pg.evalp(`(()=>{window.__old=1;setTimeout(()=>location.assign('/?noopening=1&recordreload=1'),0)})()`);
  for (let i = 0; i < 240; i++) { await sleep(150); if (await pg.evalp('!window.__old&&window.BK?.slot===2').catch(() => false)) break; }
  const reloaded = await pg.evalp(`BK.PROG.bossRecords?.['wood:boss']?.knight`);
  ok(reloaded?.best === record?.best && reloaded?.noHit === true, 'record did not survive reload');
  ok((await read())?.bossRecords?.['wood:boss']?.knight?.best === record?.best, 'slot 3 record not on disk');
  ok(await pg.evalp(`!localStorage.getItem('bracken.progress.0')&&!localStorage.getItem('bracken.progress.1')&&!localStorage.getItem('bracken.progress.3')&&!localStorage.getItem('bracken.progress.4')`), 'another slot changed');
  const keyboard = await pg.evalp(`(()=>{BK.manualSimulation=true;BK.bossSelect.open('map');BK.sim(3);const key=k=>{window.dispatchEvent(new KeyboardEvent('keydown',{key:k,bubbles:true}));BK.sim(1);window.dispatchEvent(new KeyboardEvent('keyup',{key:k,bubbles:true}));BK.sim(1)};const at=BK.bossSelect.cursor;key('ArrowDown');const down=BK.bossSelect.cursor;key('ArrowUp');const up=BK.bossSelect.cursor;key('ArrowRight');const hero=BK.bossSelect.hero;key('Escape');return{at,down,up,hero,state:BK.state}})()`);
  ok(keyboard.down === keyboard.at + 1 && keyboard.up === keyboard.at && keyboard.hero === 'warden' && keyboard.state === 'map', 'keyboard navigation failed: ' + JSON.stringify(keyboard));
  const pad = await pg.evalp(`(()=>{BK.bossSelect.open('map');window.__bossPad=Array.from({length:16},()=>({pressed:false}));Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[{connected:true,buttons:window.__bossPad,axes:[0,0]}]});const press=i=>{window.__bossPad[i].pressed=true;BK.ui.pollPad();BK.sim(1);window.__bossPad[i].pressed=false;BK.ui.pollPad();BK.sim(1)};const at=BK.bossSelect.cursor;press(13);const down=BK.bossSelect.cursor;press(12);const up=BK.bossSelect.cursor;press(15);const hero=BK.bossSelect.hero;press(0);const state=BK.state;const fighting=BK.bossSelect.fighting;BK.bossSelect.quit();return{at,down,up,hero,state,fighting}})()`, 120000);
  ok(pad.down === pad.at + 1 && pad.up === pad.at && pad.hero === 'warden' && pad.state === 'play' && pad.fighting, 'gamepad navigation/fight failed: ' + JSON.stringify(pad));
  await pg.send('Emulation.setDeviceMetricsOverride', { width: 844, height: 390, deviceScaleFactor: 2, mobile: true, screenOrientation: { type: 'landscapePrimary', angle: 90 } });
  await pg.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await pg.send('Page.navigate', { url: 'http://localhost:' + pg.PORT + '/?touch=1&nosw&bossselect=1' });
  for (let i = 0; i < 240; i++) { await sleep(150); if (await pg.evalp('window.BK?.touchOn&&window.BK?.slot===2').catch(() => false)) break; }
  const tapGame = async (gx, gy) => { const [x, y] = await pg.evalp(`BK.touch.gameToClient(${gx},${gy})`);
    await pg.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 9 }] }); await sleep(60);
    await pg.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [{ x, y, id: 9 }] }); await sleep(150); };
  const mapHeader = await pg.evalp(`(()=>{BK.ui.pressCard=false;BK.load(0);BK.mapLook('wood');window.dispatchEvent(new KeyboardEvent('keydown',{key:'Tab',bubbles:true}));BK.step(1);window.dispatchEvent(new KeyboardEvent('keyup',{key:'Tab',bubbles:true}));return BK.touch.hitBoxes().find(h=>h.w===54&&h.h===10&&h.y===22)||null})()`, 120000);
  ok(!!mapHeader, 'map level list did not draw the Boss Select touch entry');
  if (mapHeader) await tapGame(mapHeader.x + mapHeader.w / 2, mapHeader.y + mapHeader.h / 2);
  const touchReady = await pg.evalp(`(()=>{BK.step(20);return{state:BK.state,on:BK.touchOn,boxes:BK.touch.hitBoxes().length,pills:BK.touch.debug().pills.map(p=>p.label)}})()`);
  ok(touchReady.state === 'bossselect' && touchReady.on && touchReady.boxes >= 11 && touchReady.pills.includes('FIGHT') && touchReady.pills.includes('BACK'), 'touch Boss Select controls missing: ' + JSON.stringify(touchReady));
  await tapGame(220, 148);   // right half of the hero choice
  ok(await pg.evalp(`BK.bossSelect.hero==='warden'`), 'touch hero choice did not select owned Warden');
  await tapGame(100, 29);   // the beaten queen's first row
  ok(await pg.evalp(`BK.state==='play'&&BK.PROG.hero==='warden'&&BK.bossSelect.fighting`), 'touch row did not start the selected boss and hero');
  await pg.evalp('BK.bossSelect.quit()');
  console.log('  table ' + rows.length + ' bosses/minis, act groups, locked silhouettes');
  console.log('  old save migrated; slot 3 kit and ' + kill.frames + ' frame door wake; boss record ' + JSON.stringify(record) + '; mini record ' + JSON.stringify(miniRecord));
  console.log('  campaign save unchanged except records; quit, reload, keyboard, pad and touch verified');
} finally { await pg.close(); }
if (failures.length) { for (const f of failures) console.error('  FAIL ' + f); process.exitCode = 1; }
else console.log('  boss-select ok');
