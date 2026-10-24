// tools/trailer-scenes.mjs - the trailer's SCRIPTED scenes: the game's own screens and moments that no walker or boss bot reaches (the world map, a secret's
// reveal, the act card, the tavern, the hero roster, the store, a seat joining). Each is a page-side async body run on the real build; `cap(n)` keeps n game
// frames (30 fps pictures), `idx(id)` is a level's index. Nothing is faked: every number and sprite is the game's own, only the state is walked into place.
// (claude/trailer, 10-24; tools/trailer.mjs imports SCENES)
export const SCENES = [
  { id: 'scene_map', note: 'the world map: the road walked from the Lumber Trail, node by node', js: `
    BK.setHero('knight'); BK.reset({ fresh: true }); for (const l of LEVELS.slice(0, 40)) BKT.PROG[l.id] = { cleared: true, medal: 3, silver: 7, quest: true };
    BK.state = 'map'; BK.mapLook('wood'); BK.step(60);
    const goal = ['hornetsnest', 'marsh', 'fenroad', 'stockade', 'burning', 'spore', 'rootway', 'kings'];
    const here = () => { const m = BK.mapNodes(); return m.ids[m.node]; };
    for (const id of goal) { if (!BK.mapNodes().ids.includes(id)) continue; let n = 0;
      for (let i = 0; i < 400 && here() !== id; i++) { if (!BK.mapNodes().walking && i % 8 === 0) BK.press(i % 16 === 0 ? 'right' : 'up'); cap(2); n++; } }
    cap(40);` },
  { id: 'scene_secret', from: 70, note: "a hidden way: the third lost banner, 'A HIDDEN WAY OPENS', and the road drawing itself on the map", js: `
    const wipe = () => { for (const l of LEVELS) delete BKT.PROG[l.id]; for (const k of ['lostBanners','fieldOpen','fieldPathDrawn','votive','churchOpen','secretTold','secretNew','bossDown']) delete BKT.PROG[k]; BKT.PROG.bannerMig = 1; BKT.PROG.churchMig = 1; BKT.PROG.heroes = { knight: true }; };
    BK.setHero('knight'); BK.reset({ fresh: true }); wipe(); for (const id of ['fair','fields','burial','witchlight','waymeet']) BKT.PROG[id] = { cleared: true, medal: 1, best: 400 };
    const take = id => { BK.load(idx(id)); BK.state = 'play'; BK.sim(4); BK.banners().pickup(id); BK.sim(1); };
    take('fields'); take('burial');
    BK.load(idx('witchlight')); BK.state = 'play'; BK.god = true; BK.sim(4); const b = BK.banners().live.find(q => q.id === 'witchlight'); const P = BK.P;
    P.x = b.x - 70; P.y = b.y + 8; P.vx = 0; P.vy = 0; BK.sim(3); BK.keys.right = true; cap(30);
    for (let i = 0; i < 40 && !BK.banners().owned.includes('witchlight'); i++) { cap(2); if (Math.abs(P.x - b.x) < 12) BK.banners().pickup('witchlight'); } BK.keys.right = false;
    cap(150);
    BK.state = 'gameover'; BK.press('confirm'); BK.sim(2); BK.mapLook('witchlight'); BK.state = 'map'; BK.step(10); cap(330);` },
  { id: 'scene_act', from: 22, note: "the act card: 'ACT II - THE CRAGS' over the first screen of Scree", js: `
    BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(idx('scree')); BK.start(); BK.keys.right = true; cap(190);` },
  { id: 'scene_tavern', zoom: 1, from: 24, note: 'the tavern: the heroes at the bar, a second seat sits down', js: `
    BK.reset({ fresh: true }); BK.setDev(true);
    BK.tavern.record(null); BK.tavern.p1Pad(null); await BK.tavern.enter(); BK.sim(10); cap(30); BK.keys.right = true; cap(60);
    BK.tavern.join({ kind: 'pad', pad: 3 }); BK.keys.right = false; cap(120); BK.keys.right = true; cap(60);` },
  { id: 'scene_roster', mask: [0, 320, 640, 40, '0x0e0c16'], note: 'the hero roster: the nine heroes, one by one', js: `
    BK.reset({ fresh: true }); BK.setDev(true); BK.SET.godmode = true; BKT.PROG.heroPicked = true;
    BK.state = 'heropick'; BK.ui.heroPickStage = 'pick'; for (let i = 0; i < 9; i++) { BK.ui.heroPickI = i; BK.step(4); cap(26); }` },
  { id: 'scene_store', mask: [10, 324, 620, 26, '0x13101d'], note: 'the store: the stock, page by page', js: `
    BK.setHero('warden'); BK.reset({ fresh: true }); BKT.PROG.coins = 900; BKT.PROG.heroes = { knight: true, warden: true }; BK.state = 'store';
    for (let tab = 0; tab < Math.min(4, BK.ui.tabs()); tab++) { BK.ui.storeTab = tab; for (let i = 0; i < 3; i++) { BK.ui.storeI = i; BK.step(4); cap(26); } }` },
];

/* the key-driven helpers every play scene shares (real key input, no god mode): hold a key n frames (stops early on until()), hop, run with hops */
export const PLAY = `
  const K = BK.keys, TS = 16, P = () => BK.P, clr = () => { K.left = K.right = K.jump = K.up = K.down = K.atk = K.block = false; };
  const hold = (key, n, until) => { clr(); for (let i = 0; i < n; i += 2) { K[key] = true; cap(2); if (until && until()) break; } clr(); };
  const hop = (dir, n = 26) => { clr(); BK.press('jump'); for (let i = 0; i < n; i += 2) { K.jump = true; if (dir) K[dir] = true; cap(2); } clr(); };
  const runTo = (dir, x, n = 400) => { clr(); for (let i = 0, lx = P().x, st = 0; i < n; i += 2) { K[dir] = true; cap(2); if ((dir === 'right' ? P().x >= x : P().x <= x)) break; st = Math.abs(P().x - lx) < 0.4 ? st + 1 : 0; lx = P().x; if (st >= 3 && P().ground) { BK.press('jump'); K.jump = true; } else K.jump = false; } clr(); };
  const fresh = (id, hero = 'knight') => { BK.setHero(hero); BK.reset({ fresh: true }); BK.load(idx(id)); BK.state = 'play'; BK.start(); BK.god = false; BK.reset(); BK.sim(30); for (const e of BK.enemies()) e.alive = false; };
`;
export const SCENES2 = [
  { id: 'verb_comb', zoom: 1, from: 46, hero: 'knight', level: 'hornetsnest', note: "the Hornet's Nest: strike the hanging comb, it drops and becomes a step up the wall", js: PLAY + `
    fresh('hornetsnest'); BK.tp(33, 65); BK.sim(20); P().face = 1; cap(30);
    runTo('right', 36.2 * TS, 200); clr(); cap(10); hop(null, 22); BK.press('atk'); cap(30); clr();
    cap(70); runTo('right', 44 * TS, 300); cap(40);` },
  { id: 'verb_hoist', zoom: 1, from: 30, hero: 'knight', level: 'hanging', note: 'the Hanging Village: carry a coil to the hoist, ride the deck up to the market', js: PLAY + `
    fresh('hanging'); const H = id => BK.hoists().find(m => m.hoist === id), m = H('rope'); BK.tp(11, 93); BK.sim(20); cap(20);
    clr(); K.down = true; cap(2); K.down = false; cap(6);
    runTo('left', 6 * TS, 260); hop('left'); hold('left', 80, () => m.hs && m.hs.load > 0);
    for (let i = 0; i < 400 && !(m.hs && m.hs.state === 'top'); i += 2) cap(2); cap(20);
    hop('right'); hold('right', 50); cap(40);` },
  { id: 'verb_barrel', zoom: 1, from: 14, hero: 'knight', level: 'burning', note: 'the Burning Village (burning3): strike the rain barrel, the wave puts out the yard and knocks the goblins down', js: PLAY + `
    BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(idx('burning')); BK.state = 'play'; BK.god = true; BK.P.hp = BK.P.maxHp; BK.tp(122, 25); BK.sim(2);
    P().x = 122 * TS; P().face = -1; const G = BK.village().G(); for (const c of G.cells.filter(c => !c.square && c.y === 25 && c.x >= 114 && c.x <= 128)) { c.s = 2; c.t = 0; }
    cap(60); BK.press('atk'); cap(160); BK.god = false;` },
];
