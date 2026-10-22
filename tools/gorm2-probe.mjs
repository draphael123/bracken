// tools/gorm2-probe.mjs - KING GORM 2 in the page, quickly (claude/gorm2). A smoke test of his three acts with the game's own hands, not a playtest
// (the rates are tools/boss-rates.mjs kings; the burning wood's walk is tools/level-walk.mjs kings --from=470 --setup="BK.gorm().flee()"):
//   THE HALL: he wakes on his litter; the court files two rafter archers onto the live rope's deck and they loose told arrows; E at a heap takes a rock,
//   the told arc's ring goes gold on a bowman from the floor, and the rock thrown UP knocks him off his deck; the rope is free once both are down;
//   a real blow on its peg drops the cage on him: HELD; his blade-take outside an opening is the B15 0.4.
//   THE FLEE: his P1 bar empties through hurtEnemy: no death - the flee, the hero healed, the fire lit behind him; the King set down in his glade.
//   THE BURNING WOOD: the fire comes after a hero standing still and drains him (no stagger); a death keeps P1 beaten (he waits in his glade).
//   THE GLADE: he wakes on his stump, tears a burning limb, and his moves run; a real blow on the log trap's peg rolls the log into him: KNOCKED DOWN;
//   his death ends the fight. 0 page errors.
//     node tools/gorm2-probe.mjs        (PORT=<your port>)
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false }); let bad = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
try {
  const r = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); const out = {};
    BK.manualSimulation = true; BKT.setHeroLevel('knight', 8); BK.setHero('knight'); BK.reset({ fresh: false }); BK.load(LEVELS.findIndex(l => l.id === 'kings')); BK.state = 'play'; BK.god = false; BK.sim(10);
    const P = BK.P, step = n => { for (let i = 0; i < n; i++) { if (BK.state === 'card') BK.cardClose(); BK.sim(1); } }, keep = () => { P.hp = P.maxHp; P.dead = 0; };
    const b = BK.enemies().find(e => e.t === 'king');
    BK.tp(426, 13); for (let i = 0; i < 400; i++) { keep(); step(1); }
    out.wake = { active: BK.bossActive, stage: b.stage, mode: b.mode };
    let G = BK.gorm(); out.bows = G.bows.length; out.act = G.act;
    for (let i = 0; i < 900 && !BK.gorm().n.arrows; i++) { keep(); step(1); } G = BK.gorm(); out.arrows = G.n.arrows;
    /* a rock off the heap, the arc gold on a bowman, thrown up */
    const heap = G.heaps.slice().sort((a, c) => Math.abs(a - P.x) - Math.abs(c - P.x))[0]; P.x = heap; P.y = 224; P.vx = 0; step(4); BK.press('talk'); step(3); out.held = BK.gorm().held;
    const bw = BK.gorm().bows[0]; out.aim = null; if (bw) for (const off of [-96, -88, -80, -72, 72, 80, 88, 96]) { P.x = bw.x + off; P.face = off < 0 ? 1 : -1; BK.keys.up = true; step(2); const a = BK.gorm().aim(); if (a === 'high') { out.aim = off; break; } }
    BK.press('atk'); for (let i = 0; i < 200 && BK.gorm().n.knocked < 1; i++) { keep(); step(1); } BK.keys.up = false; out.knocked = BK.gorm().n.knocked;
    for (const q of BK.enemies().filter(e => e.gormBow && e.alive)) BKT.hurtEnemy(q, 999, q.x, false); step(10);
    G = BK.gorm(); const live = G.ropes.find(q => q.i === G.act); out.free = !!(live && live.free);
    if (live) { b.x = live.x; b.mode = b.phase >= 2 ? 'walk' : 'carried'; b.modeT = 3; b.grabT = 9; b.chargeT = 9; b.hornT = 9; b.ward = 0; b.open = 0; P.x = live.pegs[0] - 10; P.y = 224; P.face = 1; P.vx = 0; step(2); BK.press('atk'); for (let i = 0; i < 90 && b.mode !== 'held'; i++) step(1); }
    out.heldMode = b.mode;
    /* B15: a blade outside an opening */
    for (let i = 0; i < 1200 && (b.mode === 'held' || b.open > 0); i++) { keep(); step(1); } b.ward = 0; const h0 = b.hp; BKT.hurtEnemy(b, 20, b.x - 10, false); out.chip = h0 - b.hp;
    /* the flee */
    b.mode = b.phase >= 2 ? 'walk' : 'carried'; b.open = 0; P.hp = 30; b.hp = 3; BKT.hurtEnemy(b, 40, b.x - 10, false); step(2);
    out.flee = { stage: b.stage, alive: b.alive, hp: P.hp, max: P.maxHp, active: BK.bossActive, run: BK.gorm().run.on, arena: BK.L.arena === BK.L.glade };
    for (let i = 0; i < 500; i++) step(1); out.inGlade = b.stage;
    /* the fire on a hero standing still */
    BK.tp(472, 13); P.hp = P.maxHp; const hp0 = P.hp; for (let i = 0; i < 1400; i++) step(1); out.burnt = hp0 - P.hp; out.fireX = BK.gorm().run.fireX;
    /* a death keeps P1 beaten */
    P.hp = 1; BKT.hurtPlayer ? 0 : 0; for (let i = 0; i < 600 && !P.dead; i++) step(1); for (let i = 0; i < 300 && P.dead; i++) step(1); step(30);
    const b2 = BK.enemies().find(e => e.t === 'king'); out.afterDeath = { stage: b2 && b2.stage, mode: b2 && b2.mode, persist: BK.gorm().persist, arena: BK.L.arena === BK.L.glade, hallActive: BK.bossActive };
    /* the glade */
    BK.gorm().skipTo('glade'); BK.tp(610, 13); keep(); for (let i = 0; i < 500; i++) { keep(); step(1); }
    const k = BK.enemies().find(e => e.t === 'king'); out.glade = { active: BK.bossActive, mode: k.mode, club: !!k.club };
    const seen = new Set(); for (let i = 0; i < 4000; i++) { keep(); step(1); seen.add(k.mode); } out.p2 = [...seen];
    const lg = BK.gorm().hangs.find(h => h.kind === 'log'); k.mode = 'walk'; k.modeT = 5; k.ward = 0; k.open = 0; k.x = lg.x + 160; P.x = lg.pegs[0] - 10; P.y = 224; P.face = 1; step(2); BK.press('atk');
    for (let i = 0; i < 300 && k.mode !== 'downed'; i++) { keep(); step(1); } out.downed = k.mode;
    k.hp = 1; k.mode = 'downed'; BKT.hurtEnemy(k, 50, k.x - 10, false); for (let i = 0; i < 400; i++) step(1); out.end = { alive: k.alive, active: BK.bossActive };
    return out; })()`, 900000);
  ok(r.wake.active && r.wake.stage === 'court', 'THE HALL: he wakes on his litter (' + r.wake.mode + ')');
  ok(r.bows === 2, 'the court files two rafter archers onto the live rope\'s deck');
  ok(r.arrows > 0, 'they loose told arrows');
  ok(r.held, 'E at a heap takes a rock');
  ok(r.aim !== null, 'the told arc goes gold on a bowman from the floor (' + r.aim + ' px off)');
  ok(r.knocked >= 1, 'the rock thrown UP knocks him off his deck');
  ok(r.free, 'both down: the rope is free');
  ok(r.heldMode === 'held', 'a real blow on its peg drops the cage on him: HELD (' + r.heldMode + ')');
  ok(r.chip >= 6 && r.chip <= 10, 'outside an opening a blade lands at 0.4 (20 -> ' + r.chip + ')');
  ok(r.flee.stage === 'flee' && r.flee.alive && r.flee.hp === r.flee.max && !r.flee.active && r.flee.run && r.flee.arena, 'his P1 bar empties: no death - THE FLEE, the hero FULLY HEALED, the fire lit: ' + JSON.stringify(r.flee));
  ok(r.inGlade === 'glade', 'his bearers set him down in his glade');
  ok(r.burnt > 20, 'the fire comes after a hero standing still: a drain (' + r.burnt + ' hp)');
  ok(r.afterDeath.stage === 'glade' && r.afterDeath.arena && !r.afterDeath.hallActive && r.afterDeath.persist && r.afterDeath.persist.stage === 'flee', 'a death keeps P1 beaten: he waits in his glade, the hall stays quiet');
  ok(r.glade.active && r.glade.club, 'THE GLADE: he wakes on his stump and tears a burning limb (' + r.glade.mode + ')');
  ok(['clubHiTell', 'clubLoTell', 'quakeTell', 'logTell', 'shakeTell'].filter(m => r.p2.includes(m)).length >= 3, 'his P2 moves run: ' + r.p2.join(' '));
  ok(r.downed === 'downed', 'a real blow on the log trap\'s peg rolls the log into him: KNOCKED DOWN');
  ok(!r.end.alive && !r.end.active, 'his death ends the fight');
  ok(pg.errors.length === 0, '0 page errors' + (pg.errors.length ? ': ' + pg.errors.slice(0, 3).join(' | ') : ''));
} finally { pg.close(); }
console.log(bad ? 'gorm2-probe: ' + bad + ' FAILED' : 'gorm2-probe: all green'); process.exit(bad ? 1 : 0);
