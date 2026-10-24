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
  { id: 'scene_secret', hud: 1, note: "a hidden way: the third lost banner, 'A HIDDEN WAY OPENS', and the road drawing itself on the map", js: `
    const wipe = () => { for (const l of LEVELS) delete BKT.PROG[l.id]; for (const k of ['lostBanners','fieldOpen','fieldPathDrawn','votive','churchOpen','secretTold','secretNew','bossDown']) delete BKT.PROG[k]; BKT.PROG.bannerMig = 1; BKT.PROG.churchMig = 1; BKT.PROG.heroes = { knight: true }; };
    BK.setHero('knight'); BK.reset({ fresh: true }); wipe(); for (const id of ['fair','fields','burial','witchlight','waymeet']) BKT.PROG[id] = { cleared: true, medal: 1, best: 400 };
    const take = id => { BK.load(idx(id)); BK.state = 'play'; BK.sim(4); BK.banners().pickup(id); BK.sim(1); };
    take('fields'); take('burial');
    BK.load(idx('witchlight')); BK.state = 'play'; BK.god = true; BK.sim(4); const b = BK.banners().live.find(q => q.id === 'witchlight'); const P = BK.P;
    P.x = b.x - 70; P.y = b.y + 8; P.vx = 0; P.vy = 0; BK.sim(3); BK.keys.right = true; cap(30);
    for (let i = 0; i < 40 && !BK.banners().owned.includes('witchlight'); i++) { cap(2); if (Math.abs(P.x - b.x) < 12) BK.banners().pickup('witchlight'); } BK.keys.right = false;
    cap(150);
    BK.state = 'gameover'; BK.press('confirm'); BK.sim(2); BK.mapLook('witchlight'); BK.state = 'map'; BK.step(10); cap(330);` },
  { id: 'scene_act', hud: 1, note: "the act card: 'ACT II - THE CRAGS' over the first screen of Scree", js: `
    BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(idx('scree')); BK.start(); BK.keys.right = true; cap(190);` },
  { id: 'scene_tavern', zoom: 1, note: 'the tavern: the heroes at the bar, a second seat sits down', js: `
    BK.reset({ fresh: true }); BK.setDev(true);
    BK.tavern.record(null); BK.tavern.p1Pad(null); await BK.tavern.enter(); BK.sim(10); cap(30); BK.keys.right = true; cap(60);
    BK.tavern.join({ kind: 'pad', pad: 3 }); BK.keys.right = false; cap(120); BK.keys.right = true; cap(60);` },
  { id: 'scene_roster', mask: [0, 310, 640, 50, '0x0e0c16'], note: 'the hero roster: the nine heroes, one by one', js: `
    BK.reset({ fresh: true }); BK.setDev(true); BKT.PROG.heroPicked = true;
    BK.state = 'heropick'; BK.ui.heroPickStage = 'pick'; for (let i = 0; i < 9; i++) { BK.ui.heroPickI = i; BK.step(4); cap(26); }` },
  { id: 'scene_store', mask: [10, 324, 620, 26, '0x13101d'], note: 'the store: the stock, page by page', js: `
    BK.setHero('warden'); BK.reset({ fresh: true }); BKT.PROG.coins = 900; BKT.PROG.heroes = { knight: true, warden: true }; BK.state = 'store';
    for (let tab = 0; tab < Math.min(4, BK.ui.tabs()); tab++) { BK.ui.storeTab = tab; for (let i = 0; i < 3; i++) { BK.ui.storeI = i; BK.step(4); cap(26); } }` },
];
