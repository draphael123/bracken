// tools/trailer-scenes3.mjs - TRAILER 3's scripted scenes and extra shots (claude/trailer3, 11-06). Imported by tools/trailer.mjs (SHOTS3, SCENES3).
// Same contract as tools/trailer-scenes.mjs: `js` is a page-side async body run on the real build, cap(n) keeps n game frames (a picture every 2nd one = 30 fps),
// idx(id) = a level's index. NOTHING HERE HAS BEEN RUN (code-only lane, a gate was running): every scene is built from calls other tools in this repo already make
// (tools/tavern.mjs, duel-roster-shots.mjs, pvp-duel-flow.mjs, transition-clips.mjs, palisadewood-shots.mjs, lesson-shots.mjs); the SAT lane runs `preview` on each first.
// All scenes are written for the DEMO build (?demo=1: tools/trailer.mjs record --demo): demo levels, the five demo heroes (knight warden geomancer ranger pyro) only.
// hud:true = the game's own HUD stays on (a duel's bars and banners are HUD); every other scene runs with the HUD, hints and foe bars off (__TR.clean).
import { PLAY } from './trailer-scenes.mjs';

/* the demo's five heroes, in the order the parts JSONs use them */
export const DEMO_FIVE = ['knight', 'warden', 'geomancer', 'ranger', 'pyro'];

/* ---------------- extra record-kind shots (bot-played, like SHOTS0): a demo hero against a demo boss ---------------- */
export const SHOTS3 = [
  { id: 'c3_beast_ranger', kind: 'boss', level: 'palisadewood', hero: 'ranger', lvl: 20, secs: 6, note: 'the Battering Beast, as the Ranger' },
  { id: 'c3_gorm_pyro', kind: 'boss', level: 'kings', hero: 'pyro', lvl: 20, secs: 6, note: 'King Gorm, as the Pyromancer' },
  { id: 'c3_queen_knight', kind: 'boss', level: 'hornetsnest', hero: 'knight', lvl: 20, secs: 6, note: "the Hornet Queen, as the Knight" },
  { id: 'c3_wood_party', kind: 'walk', level: 'wood', hero: 'knight', lvl: 6, from: 0.05, to: 0.7, secs: 6, zoom: 1, ally: ['warden', 'balanced'], note: 'the Lumber Trail with a partner at his side (co-op, AI partner)' },
  { id: 'c3_marsh_rangr', kind: 'walk', level: 'marsh', hero: 'ranger', lvl: 8, from: 0.05, to: 0.9, secs: 6, zoom: 1, note: 'Marsh Wood pads, bigger hero' },
  { id: 'c3_rootway', kind: 'walk', level: 'rootway', hero: 'geomancer', lvl: 10, from: 0.1, to: 0.9, secs: 6, zoom: 1, note: 'the Rootway' },
  { id: 'c3_underleaf', kind: 'walk', level: 'underleaf', hero: 'warden', lvl: 12, from: 0.1, to: 0.9, secs: 6, zoom: 1, note: 'the Underleaf' },
];

/* ---------------- helpers shared by the scenes ---------------- */
/* a level's boss falls under the hero's own blade: he walks up and strikes (a god-mode hero, the boss left at a sliver), the death is captured, then the hero dances (the game's own after-boss emote) */
const BOSSFALL = (level, hero) => PLAY + `
  BK.setHero(${JSON.stringify(hero)}); BK.reset({ fresh: true }); BKT.setHeroLevel(${JSON.stringify(hero)}, 24); BK.setHero(${JSON.stringify(hero)}); BK.load(idx(${JSON.stringify(level)})); BK.state = 'play'; BK.start(); BK.sim(20); __TR.clean(); BK.god = true; BK.sim(300); const A = BK.L.arena; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); BK.sim(200); cap(20);
  const e = BK.enemies().find(q => q.t === A.boss && q.alive); BK.god = false;
  if (e) { for (let n = 0; n < 700 && e.alive; n++) { const P0 = P(); P0.hp = P0.maxHp; if (e.hp > 30 && n > 100) e.hp = Math.min(e.hp, 30);
      const dx = e.x - P0.x; clr(); if (Math.abs(dx) > 26) K[dx > 0 ? 'right' : 'left'] = true; else if (n % 14 === 0) BK.press('atk'); cap(2); } }
  clr(); cap(150);`;

/* THE INN with n seats: P1 the Knight walks in, the others walk in through the door one by one (BK.tavern.join, each 0.9 s of walk-in), each as a different demo hero */
const INN = `
  BK.setHero('knight'); BK.reset({ fresh: true }); BK.setDev(true); BKT.PROG.innTold = 1; BK.tavern.record(null); BK.tavern.p1Pad(null); try { BKT.PROG.tavern = BKT.PROG.tavern || { seen: {} }; BKT.PROG.tavern.seen = BKT.PROG.tavern.seen || {}; for (const q of ['door','board','wardrobe','guestbook','arena','fire','bar','trainer','store','map']) BKT.PROG.tavern.seen[q] = 1; } catch (e) {} await BK.tavern.enter(); try { for (const q of BK.tavern.debug().stations) BKT.PROG.tavern.seen[q.id] = 1; } catch (e) {} __TR.clean(); BK.sim(360);
  const K = BK.keys, TS = 16, Ps = () => BK.players(), put = (p, tx) => { p.x = tx * TS + 8; p.y = 20 * TS; p.vx = p.vy = 0; p.face = 1; p.ground = true; };
  const pk = (p, k) => { if (p === Ps()[0]) BK.press(k); else p.press = Object.assign(p.press || {}, { [k]: true }); };
  const emote = p => { const kk = p === Ps()[0] ? K : p.keys; kk.dance = true; BK.sim(1); kk.dance = false; };
  const joinAll = (heroes, gap) => { heroes.forEach((h, i) => { BK.tavern.join({ kind: 'pad', pad: 3 + i }, h); cap(gap); }); };
  const dancing = n => { for (let i = 0; i < n; i += 8) { for (const p of Ps()) if (!(p.dance > 0)) emote(p); cap(8); } };`;

const TRANS = (from, endOnMap) => PLAY + `
  BK.setHero('knight'); BK.reset({ fresh: true }); BKT.setHeroLevel('knight', 24); BK.setHero('knight'); delete BKT.PROG.transSeen; BK.SET.transitions = 'always'; BK.trans.force(true); ${endOnMap ? 'BKT.PROG.burningOpen = 1;' : ''}
  BK.load(idx(${JSON.stringify(from)})); BK.start(); BK.sim(20);
  const L = BK.L, A = L.arena, dismiss = () => { for (let k = 0; k < 12 && BK.state === 'card'; k++) { for (let i = 0; i < 4 && BK.state === 'card'; i++) { try { BK.cardTake(i); } catch (e) {} } if (BK.state === 'card') { try { BK.cardClose(); } catch (e) {} } } };
  const e = BK.enemies().find(q => q.t === A.boss && q.alive); BK.god = true; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); BK.sim(200);
  /* the transition runs on the page's own clock (real time, like tools/transition-clips.mjs): from the kill on the page is left to run on its rAF loop and the canvas is sampled at 30 fps */
  for (let n = 0; n < 1500 && e && e.alive; n++) { BK.players().forEach(p => { p.inv = 99; p.hp = p.maxHp; }); e.hp = Math.min(e.hp, 1); e.inv = 0; e.open = 9; e.passThrough = true; BKT.hurtEnemy(e, 1e6, e.x + (n % 2 ? 10 : -10), n % 3 === 0); dismiss(); if (e.alive) BK.sim(6); }
  dismiss();
  BK.manualSimulation = false;
  const sleep = ms => new Promise(r => setTimeout(r, ms)), cvs = document.querySelector('canvas'), cv2 = document.createElement('canvas'); cv2.width = 640; cv2.height = 360; const c2 = cv2.getContext('2d'); c2.imageSmoothingEnabled = false;
  if (L.gateAfterBoss) { for (let i = 0; i < 300 && !L.gateOpen; i++) { await sleep(100); dismiss(); } const g = BK.gate; if (g) BK.players().forEach((p, k) => { p.x = g.x - k * 2; p.y = g.y; p.vx = p.vy = 0; }); }
  let sawTr = false, doneAt = -1, nxt = performance.now();
  for (let i = 0; i < 4200; i++) { dismiss(); if (BK.trans.tr) sawTr = true;
    __TR.out.push(__TR.shot()); __TR.hxs.push([0.5, 0.5, 0.5, 0.5]);
    const fin = sawTr && !BK.trans.tr && (${endOnMap ? "BK.state === 'map'" : "BK.state === 'play' && BK.trans.arrive && BK.trans.arrive.done"}); if (fin && doneAt < 0) doneAt = i; if (doneAt >= 0 && i - doneAt > 45) break;
    nxt += 33.3; await sleep(Math.max(1, nxt - performance.now())); }
  BK.manualSimulation = true;`;

export const SCENES3 = [
  /* ------------- LEVEL VERBS (the demo's own: Palisade) ------------- */
  { id: 's3_palprop', zoom: 1, from: 20, hero: 'knight', level: 'palisadewood', note: 'Palisade Wood: a prop knocked down (the stake tower) and the ramp it makes', js: PLAY + `
    fresh('palisadewood'); BK.god = true; BK.tp(138, 31); BK.sim(30); P().face = 1; cap(40);
    BK.press('atk'); cap(10); BK.pwood().knockProp('yardTower'); for (let i = 0; i < 90; i += 2) cap(2); runTo('right', 146 * TS, 300); cap(30);` },
  { id: 's3_palbeast', from: 40, hero: 'knight', level: 'palisadewood', note: 'the Battering Beast STUCK in the wreck, the hero cutting him down while he is held', js: PLAY + `
    fresh('palisadewood'); BK.god = true; BK.tp(462, 24); BK.sim(260); const b = BK.boss, S = BK.batteringBeastHands().show();
    if (b) { b.mode = 'stuck'; b.modeT = 3.0; b.x = 478 * 16; b.face = -1; BK.tp(Math.floor(b.x / 16) - 3, 24); BK.sim(4); P().face = 1; }
    cap(40); for (let k = 0; k < 7; k++) { BK.press('atk'); cap(22); } cap(60);` },
  /* ------------- WORLD ------------- */
  { id: 's3_shrine', zoom: 1, from: 20, hero: 'knight', level: 'wood', note: 'a shrine lit by walking up to it (the Lumber Trail)', js: PLAY + `
    fresh('wood', 'knight', 2); BK.god = true; const s0 = BK.shrines()[0]; if (s0) { BK.tp(Math.floor(s0.x / 16) - 7, Math.floor(s0.y / 16)); BK.sim(30); }
    cap(30); runTo('right', (s0 ? s0.x : P().x + 112) + 4, 400); cap(10); clr(); cap(110);` },
  { id: 's3_map', note: 'the world map of the demo: the road drawn node by node from the Lumber Trail to Kingswood, the Burning Village spur last', js: `
    const road = ['wood', 'hornetsnest', 'marsh', 'fenroad', 'stockade', 'spore', 'rootway', 'underleaf', 'palisadewood', 'kings', 'burning'];
    BK.setHero('knight'); BK.reset({ fresh: true }); BK.state = 'map'; BK.mapLook('wood'); BK.step(60); cap(20);
    for (let i = 0; i < road.length; i++) { const id = road[i]; if (i > 0 && !BK.mapNodes().ids.includes(id)) continue;
      BKT.PROG[road[Math.max(0, i - 1)]] = { cleared: true, medal: 3, silver: 7, quest: true }; if (id === 'burning') BKT.PROG.burningOpen = 1;
      const here = () => { const m = BK.mapNodes(); return m.ids[m.node]; };
      for (let k = 0; k < 400 && here() !== id; k++) { if (!BK.mapNodes().walking && k % 8 === 0) BK.press(k % 16 === 0 ? 'right' : 'up'); cap(2); } cap(14); }
    cap(40);` },
  { id: 's3_ferry', note: "the ferry transition: the Hornet Queen falls, the party boards the ferry and crosses to Marsh Wood", js: TRANS('hornetsnest', false) },
  { id: 's3_smoke', note: 'Kingswood: King Gorm falls, smoke rises on the horizon, the map opens the way to the Burning Village (the demo\'s hidden spur)', js: TRANS('kings', true) },
  { id: 's3_bossfall', hero: 'knight', level: 'stockade', note: 'the Goblin Chieftain falls to the Knight (the closing beat of the combat montage)', js: BOSSFALL('stockade', 'knight') },
  { id: 's3_gormfall', hero: 'pyro', level: 'kings', note: 'King Gorm falls to the Pyromancer', js: BOSSFALL('kings', 'pyro') },
  /* ------------- THE INN ------------- */
  { id: 's3_inn_join', note: 'the inn: P1 stands by the fire, three friends walk in through the door one by one (seats 2, 3, 4)', js: INN + `
    cap(40); K.right = true; cap(50); K.right = false; cap(10); joinAll(['warden', 'ranger', 'pyro'], 64); K.right = true; cap(40); K.right = false; cap(30);` },
  { id: 's3_inn_dance', note: 'the inn: all four heroes do their own dance (the emote key) together, side by side', js: INN + `
    joinAll(['warden', 'ranger', 'pyro'], 64); Ps().forEach((p, i) => put(p, 28 + i * 2.2)); BK.sim(4); cap(20); dancing(260); cap(20);` },
  { id: 's3_inn_wardrobe', note: 'the inn: P2 at THE WARDROBE changes hero colour while the others look on', js: INN + `
    joinAll(['warden'], 64); put(Ps()[0], 37.5); put(Ps()[1], 40); BK.sim(4); cap(20); BK.tavern.use('wardrobe', 2); cap(26);
    const p2 = Ps()[1]; pk(p2, 'down'); cap(16); pk(p2, 'down'); cap(16); for (let i = 0; i < 5; i++) { pk(p2, 'right'); cap(22); } pk(p2, 'talk'); cap(40);` },
  { id: 's3_inn_book', mask: [0, 324, 640, 36, '0x13101d'], note: 'the inn: P1 opens THE GUEST BOOK (the five save slots)', js: INN + `
    put(Ps()[0], 10); BK.sim(4); cap(30); BK.tavern.use('guestbook', 1); cap(60); BK.ui.slotI = 1; cap(30); BK.ui.slotI = 2; cap(30); cap(20);` },
  { id: 's3_inn_party', note: 'the inn: P2 walks in and joins the party board seat (a seat filling)', js: INN + `
    put(Ps()[0], 7); BK.sim(4); cap(30); BK.tavern.use('board', 1); cap(50); BK.tavern.join({ kind: 'pad', pad: 3 }, 'warden'); cap(100); cap(30);` },
  /* ------------- THE STORE ------------- */
  { id: 's3_store_buy', mask: [10, 324, 620, 26, '0x13101d'], note: 'the store: browse the heroes tab, then buy a hero (gold, then the confirm key); the purchase flash', js: `
    BK.setHero('warden'); BK.reset({ fresh: true }); for (const id of ['wood','hornetsnest','marsh','fenroad','stockade']) BKT.PROG[id] = { cleared: true, medal: 3, silver: 7, quest: true };
    BKT.PROG.coins = 900; BKT.PROG.heroes = { knight: true, warden: true }; BK.state = 'store'; BK.ui.storeTab = 0;
    const key = k => { dispatchEvent(new KeyboardEvent('keydown', { key: k, code: k })); BK.step(1); dispatchEvent(new KeyboardEvent('keyup', { key: k, code: k })); };
    for (let i = 0; i < 4; i++) { BK.ui.storeI = i; BK.step(4); cap(24); }
    BK.ui.storeI = 2; BK.step(4); cap(20); key('z'); cap(70);
    BK.ui.storeTab = Math.min(1, BK.ui.tabs() - 1); for (let i = 0; i < 3; i++) { BK.ui.storeI = i; BK.step(4); cap(26); }` },
  /* ------------- DUEL PIT ------------- */
  { id: 's3_duel_roster', mask: [0, 322, 640, 38, '0x0e0c16'], note: 'the duel pit: the Smash-style roster pick screen (heroes hover and pick), TEAMS switched on', js: `
    BK.setHero('knight'); BK.reset({ fresh: true }); BK.tavern.record(null); BK.tavern.p1Pad(null); await BK.tavern.enter(); BK.sim(10);
    try { localStorage.removeItem('bracken.duelSettings'); } catch (e) {} BK.duel().D.setSettings({ teams: false, seats: [{ hero: '' }, { isBot: true, hero: 'random' }] });
    const s = BK.tavern.debug().stations.find(q => q.id === 'arena'), p = BK.players()[0]; for (let i = 0; i < 60; i++) { p.x = s.x; p.y = 20 * 16; p.vx = p.vy = 0; p.face = 1; BK.sim(1); }
    BK.press('talk'); BK.sim(3); cap(50); const R = BK.duel().D.roster;
    for (let i = 0; i < 5; i++) { BK.press('right'); cap(18); } BK.press('left'); cap(20); BK.press('talk'); cap(40);
    BK.duel().D.setSettings({ teams: true, seats: [{ hero: '' }, { isBot: true, hero: 'warden' }, { isBot: true, hero: 'pyro' }, { isBot: true, hero: 'ranger' }] }); cap(60);` },
  { id: 's3_duel_2v2', hud: true, zoom: 1, from: 150, note: 'the duel pit: a 2v2 on the planks, Knight + Warden against Pyromancer + Ranger, the P1 knight played by a tiny chase script; the clock is run to SUDDEN DEATH (ONE HIT) and the match ends', js: `
    BK.setHero('knight'); BK.reset({ fresh: true }); BK.tavern.record(null); BK.tavern.p1Pad(null); await BK.tavern.enter(); BK.sim(10);
    BK.SET.hideHud = false; const settings = { teams: true, rounds: 1, timeLimit: 60, lives: 1, seats: [{ hero: '' }, { isBot: true, hero: 'warden', team: 1 }, { isBot: true, hero: 'pyro', team: 2 }, { isBot: true, hero: 'ranger', team: 2 }] };
    BK.duel().enter(null, settings); BK.sim(90);
    const brawl = n => { for (let i = 0; i < n; i += 6) { const D = BK.duel().debug(); if (!D.m || D.m.phase === 'over') return false; const a = D.seats[0], f = D.seats[2] || D.seats[1], dx = f.x - a.x, K = BK.keys;
      K.left = K.right = K.block = false; if (Math.abs(dx) > 22) K[dx > 0 ? 'right' : 'left'] = true; else BK.press('atk'); if (i % 90 === 60) BK.press('jump'); cap(6); } return true; };
    cap(60); brawl(420);
    const m = BK.duel().debug().m; if (m && m.phase !== 'over') m.clock = Math.max(m.clock, m.fightT - 1.4);
    brawl(420); BK.keys.left = BK.keys.right = false; cap(90); __TR.hxs.fill([0.5, 0.78, 0.5, 0.78]);` },
  /* ------------- TUTORIAL + HERO PICK ------------- */
  { id: 's3_tutorial', zoom: 1, from: 10, hero: 'knight', level: 'lesson', hud: true, note: "the roadside lesson: the game's own prompts as a new hero walks, jumps and strikes", js: PLAY + `
    fresh('lesson'); cap(30); BK.lesson().O.st.i = 0; runTo('right', 20 * TS, 300); BK.lesson().O.st.i = 1; hop('right'); runTo('right', 40 * TS, 300);
    BK.lesson().O.st.i = 3; clr(); BK.press('atk'); cap(26); BK.press('atk'); cap(26); BK.press('atk'); cap(40);` },
  { id: 's3_heropick', mask: [0, 320, 640, 40, '0x0e0c16'], note: 'the hero pick (the five demo heroes, one by one)', js: `
    BK.reset({ fresh: true }); BK.SET.godmode = true; BKT.PROG.heroPicked = true;
    BK.state = 'heropick'; BK.ui.heroPickStage = 'pick'; for (let i = 0; i < 5; i++) { BK.ui.heroPickI = i; BK.step(4); cap(26); }` },
];
