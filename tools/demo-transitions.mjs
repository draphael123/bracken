/* tools/demo-transitions.mjs - THE DEMO'S LEVEL-TO-LEVEL TRANSITIONS, pinned (claude/demotransitions, Daniel 11-02 13:33).
   Every connected level of the demo road (Lumber Trail -> Hornet's Nest -> Marsh -> Fen Road -> Stockade -> Sporewood -> Rootway -> Underleaf -> Palisade Wood -> Kingswood + the Burning Village spur) has a row in
   src/transitions.js; three have a scene on top (Nest -> Marsh: the FERRY; Fen Road -> Stockade: the ROAD to the walls; Kingswood -> Burning Village: SMOKE on the horizon).
     node tools/demo-transitions.mjs                node only: the table (every pair, in road order), the beats of every row, a skip at every moment of every row lands done, the scene maths, the source wiring, the files' names
     node tools/demo-transitions.mjs --browser      adds the page, one run per row: the boss falls (or the party walks into the gate), the clear is credited and SAVED first, the way opens (tiles go to air), the walk, the scene, the fade,
                                                    the next level loads and the party ARRIVES at its start (solid footing, clear of walls, unhurt, control returns); a skip mid-scene; 4 seats; reduce-motion; console clean
     node tools/demo-transitions.mjs --browser --shots=<dir>   also writes pictures per row (the scenes at three moments)
   Exit 1 on any red row. */
import { readFileSync, mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import * as TRM from '../src/transitions.js';
const rows = []; const ok = (name, pass, why = '') => { rows.push({ name, pass: !!pass, why }); console.log((pass ? 'ok   ' : 'FAIL ') + name + (pass ? '' : '  ' + why)); };
const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const artSrc = readFileSync(new URL('../src/transitions-art.js', import.meta.url), 'utf8');
const levelSrc = readFileSync(new URL('../src/level.js', import.meta.url), 'utf8');

/* ---- the table: every pair of the demo road, in order ---- */
const ROAD = ['wood', 'hornetsnest', 'marsh', 'fenroad', 'stockade', 'spore', 'rootway', 'underleaf', 'palisadewood', 'kings'];
const SCENES = { 'hornetsnest>marsh': 'ferry', 'fenroad>stockade': 'road', 'kings>burning': 'smoke' };
const rowOf = (a, b) => TRM.TABLE.find(e => e.from === a && e.to === b);
for (let i = 0; i < ROAD.length - 1; i++) {
  const a = ROAD[i], b = ROAD[i + 1], key = a + '>' + b, e = rowOf(a, b);
  ok('the table has a row ' + key, !!e);
  if (!e) continue;
  ok(key + ': ' + (SCENES[key] ? 'a ' + SCENES[key] + ' SCENE on top of the walk' : 'a plain WALK-OUT (no scene)'), (SCENES[key] ? e.scene === SCENES[key] : e.scene === null));
}
ok('the spur row kings > burning (scene smoke, plays only when the spur is open) and the shut-spur fallback kings > scree exist', rowOf('kings', 'burning') && rowOf('kings', 'burning').scene === 'smoke' && rowOf('kings', 'burning').when.burningOpen === true && rowOf('kings', 'scree') && rowOf('kings', 'scree').when.burningOpen === false);
ok('entryFor honours when: kings with the spur open -> burning, shut -> scree; every other level ignores the flags', TRM.entryFor('kings', undefined, { burningOpen: true }).to === 'burning' && TRM.entryFor('kings', undefined, { burningOpen: false }).to === 'scree' && TRM.entryFor('marsh', undefined, {}).to === 'fenroad' && TRM.entryFor('marsh', undefined, { burningOpen: true }).to === 'fenroad');
ok('no row for the wood > marsh ferry any more (the road runs through the nest) and every row\'s `from` is unique per flag state', !rowOf('wood', 'marsh') && TRM.TABLE.every((e, i) => TRM.TABLE.findIndex(q => q.from === e.from && JSON.stringify(q.when || {}) === JSON.stringify(e.when || {})) === i));
for (const e of TRM.TABLE) {
  const key = e.from + '>' + e.to, ids = e.beats.map(b => b.id), last = ids[ids.length - 1], hasScene = e.beats.some(TRM.isSceneBeat);
  ok(key + ': beats walk -> (scene) -> fade, fade last, walk before any scene, an open beat (if any) first', ids.includes('walk') && last === 'fade' && (!ids.includes('open') || ids[0] === 'open') && (!hasScene || ids.indexOf('walk') < e.beats.findIndex(TRM.isSceneBeat)), ids.join());
  ok(key + ': a scene row has scene beats and a scene name, a walk-out has neither', !!e.scene === hasScene, JSON.stringify([e.scene, hasScene]));
  ok(key + ': the walk is capped (max) and short; the whole row is ' + TRM.length(e).toFixed(1) + ' s (a walk-out <= 6 s, a scene <= 15 s)', e.beats.find(b => b.id === 'walk').max >= e.beats.find(b => b.id === 'walk').dur && TRM.length(e) <= (hasScene ? 15 : 6), TRM.length(e).toFixed(1));
  if (e.endOnMap) ok(key + ': it ENDS ON THE MAP (endOnMap, no arrival): the spur is chosen by the player, not auto-loaded', e.endOnMap === true && !e.arrive && e.to === 'burning'); else ok(key + ': it arrives walking in from the left for 1-3 s' + (e.arrive.ferry ? ' off the ferry' : ''), e.arrive && e.arrive.walk >= 1 && e.arrive.walk <= 3 && (e.scene === 'ferry') === !!e.arrive.ferry);
  if (e.open) ok(key + ': the way opens in the arena\'s last column(s) - ' + (e.open.kind || 'pine') + (e.open.w ? ' x' + e.open.w : ''), e.open.rows[0] < e.open.rows[1] && ['pine', 'bog', 'palisade', 'leaf', 'light', undefined].includes(e.open.kind) && (e.open.w || 1) <= 3);
  /* a skip at ANY moment lands in the same place: the timeline reaches done, with fade once, never stuck (soft-lock) */
  let worst = 0, bad = '';
  for (let t = 0.05; t < TRM.length(e) + 1; t += 0.11) {
    const tl = TRM.start(e); let g = 0, time = 0;
    while (!tl.done && g++ < 3000 && time < t) { TRM.step(tl, 1 / 60, { ready: true }); time += 1 / 60; }
    if (!tl.done) { TRM.step(tl, 1 / 60, { press: true }); const sk = tl.skipped; let n = 0; while (!tl.done && n++ < 60 * (TRM.length(e) + 4)) TRM.step(tl, 1 / 60, {}); if (!tl.done) bad = 'stuck after a press at ' + t.toFixed(2); if (sk) worst = Math.max(worst, n); }   /* a press under MIN_SKIP (0.8 s) is ignored by design: the row then plays on; later it skips */
    if (tl.log[tl.log.length - 1] !== 'done' || tl.log.filter(x => x === 'fade').length > 1) bad = bad || 'log ' + tl.log.join();
  }
  ok(key + ': a skip at any moment ends done through a short fade (worst ' + (worst / 60).toFixed(2) + ' s)', !bad && worst <= 0.35 * 60 + 3, bad);
  const tl2 = TRM.start(e); while (TRM.phase(tl2) !== 'walk') TRM.step(tl2, 1 / 60, {}); let t2 = 0; while (TRM.phase(tl2) === 'walk' && t2 < 10) { TRM.step(tl2, 1 / 60, { ready: false }); t2 += 1 / 60; }
  ok(key + ': the walk cannot run past its cap if a hero never arrives', t2 <= e.beats.find(b => b.id === 'walk').max + 0.05, t2.toFixed(2));
}
/* ---- every `to` is the NEXT level on the road (needs), or a spur hanging off the level ---- */
for (const e of TRM.TABLE) {
  const re = new RegExp("id: '" + e.to + "'[^\\n]*?needs: '([a-z]+)'"), m = levelSrc.match(re);
  const spur = /opensOn: \{ level: '([a-z]+)'/.exec((levelSrc.match(new RegExp("id: '" + e.to + "'[^\\n]*\\n?[^\\n]*opensOn: \\{ level: '[a-z]+'")) || [''])[0]);
  ok(e.from + '>' + e.to + ': level.js has ' + e.to + ' needing ' + e.from + (spur ? ' (or a spur: opensOn ' + spur[1] + ')' : ''), (m && m[1] === e.from) || (spur && spur[1] === e.from), m ? m[1] : 'no needs found');
}
/* ---- the scenes' maths ---- */
{ const VW = 320;
  ok('ROAD: the world slides monotonically after a short ramp; the stockade grows 0 -> 1 over the scene; reduce-motion slows the slide', TRM.roadScroll(0) === 0 && TRM.roadScroll(3) < TRM.roadScroll(4) && TRM.roadScroll(7) > TRM.roadScroll(6) && TRM.roadGrowth(0) === 0 && Math.abs(TRM.roadGrowth(TRM.ROAD.dur) - 1) < 1e-9 && TRM.roadScroll(6, true) < TRM.roadScroll(6) * 0.6);
  ok('ROAD: every hero walks in from off-screen left and takes a station on the screen (4 seats side by side, inside the left half)', [0, 1, 2, 3].every(i => TRM.roadHero(i, 4, 0, VW).x < 0 && TRM.roadHero(i, 4, 4, VW).x > 0 && TRM.roadHero(i, 4, 4, VW).x < VW * 0.6));
  ok('SMOKE: the party walks in and STOPS (not walking after inT); the glow and the plumes both start at 0 and end at 1', TRM.smokeHero(0, 4, 0, VW).x < 0 && TRM.smokeHero(0, 4, 0.5, VW).walking && !TRM.smokeHero(0, 4, 6, VW).walking && TRM.smokeHero(0, 4, 6, VW).x > 0 && TRM.smokeRise(8) === 1 && TRM.smokeGlow(8) === 1 && TRM.smokeRise(0) === 0 && TRM.smokeGlow(0) === 0);
  { const S = TRM.SMOKE, e = TRM.entryFor('kings', 'burning', { burningOpen: true }), sc = e.beats.find(q => q.id === 'smoke'), at = (s, r) => TRM.smokeStance(s, r);
  ok('KINGSCENE: a SHORT beat (the scene <= 6 s, the whole row <= 9 s), ends on the map (endOnMap, no arrive), thinner bars (entry.bar < the default 22)', sc.dur === S.dur && S.dur <= 6 && TRM.length(e) <= 9 && e.endOnMap === true && e.arrive === null && e.bar > 0 && e.bar < TRM.BAR && TRM.barIn(9, e.bar) === e.bar && TRM.barIn(9) === TRM.BAR);
  ok('KINGSCENE: the order of the beat - walk in, pick up, lift, look back + horn, turn, pan, caption - all inside the scene, the horn while the leader looks back', S.inT < S.pickAt && S.pickAt + 0.3 + S.liftT < S.backAt + 0.2 && S.backAt <= S.hornAt && S.hornAt < S.turnAt && S.turnAt <= S.panAt && S.panAt + S.panDur <= S.dur && S.wordAt < S.dur - 0.5);
  ok('KINGSCENE: the leader stoops and the crown goes from the road (0) to overhead (1) and stays held; he looks back (face -1) then turns (+1) and walks on with the pan', at(0).crown === 0 && at(S.pickAt + 0.2).stoop > 0.5 && at(S.pickAt + 0.3 + S.liftT + 0.05).crown === 1 && at(S.dur).crown === 1 && at(S.backAt + 0.1).face === -1 && at(S.turnAt + 0.1).face === 1 && at(S.panAt + 1).walking && !at(S.backAt + 0.1).walking);
  ok('KINGSCENE: the camera pan 0 -> 1 is monotonic and complete by the end of the scene; reduce-motion never slides (0 then 1, no value between) and walks nothing on', TRM.smokePan(0) === 0 && TRM.smokePan(S.panAt + 1) > 0.2 && TRM.smokePan(S.panAt + 1) < 0.8 && TRM.smokePan(S.dur) === 1 && TRM.smokePan(S.panAt + 0.5) < TRM.smokePan(S.panAt + 1) && [0, 1, 2, 3, 4, 5, 5.4].every(s => [0, 1].includes(TRM.smokePan(s, true))) && !at(S.panAt + 1, true).walking);
  ok('KINGSCENE: the caption fades in after the pan starts and is full before the fade', TRM.smokeWord(S.wordAt - 0.01) === 0 && TRM.smokeWord(S.dur) === 1 && S.wordAt >= S.panAt); }
  ok('SMOKE: every seat is on the screen when it stops', [0, 1, 2, 3].every(i => { const x = TRM.smokeHero(i, 4, 8, VW).x; return x > 0 && x < VW * 0.7; })); }
/* ---- GORMBURN (claude/gormburn, Daniel 11-07): the MOUNTAIN scene on the shut-spur row kings > scree; the demo plays it as a teaser then the END CARD ---- */
{ const VW = 384, e = rowOf('kings', 'scree'), M = TRM.MOUNTAIN, at = s => TRM.mountainStance(s), ids = e.beats.map(b => b.id);
  ok('GORMBURN: kings > scree (spur shut) is the MOUNTAIN scene: walk -> mountain (a scene beat) -> fade, demoEnd, thinner bars, arrives walking at the Scree Path', e.scene === 'mountain' && e.when.burningOpen === false && ids.join() === 'walk,mountain,fade' && TRM.isSceneBeat(e.beats[1]) && e.demoEnd === true && e.bar < TRM.BAR && e.arrive && e.arrive.walk >= 1 && !e.endOnMap && e.walk.to === 478);
  ok('GORMBURN: the scene beat is the MOUNTAIN dur and the whole row stays short (<= 11 s)', e.beats[1].dur === M.dur && TRM.length(e) <= 11, TRM.length(e).toFixed(1));
  ok('GORMBURN: they walk in, the leader looks BACK at the wood (face -1) then turns and walks on with the pan (face +1, walking)', at(0).face === 1 && at((M.lookAt + M.turnAt) / 2).face === -1 && at(M.turnAt + 0.5).face === 1 && at(M.panAt + 0.5).walking === true && at(M.inT + 0.1).walking === false && at(0).walking === true);
  ok('GORMBURN: the pan is 0 before panAt, monotonic, 1 by the end of the scene; reduce-motion never slides (0 then 1) and walks nothing on', TRM.mountainPan(0) === 0 && TRM.mountainPan(M.panAt + 1) > 0 && TRM.mountainPan(M.panAt + 1) < 1 && TRM.mountainPan(M.dur) >= TRM.mountainPan(M.panAt + 1) && TRM.mountainPan(M.panAt + M.panDur) === 1 && [0, 1, 2, 3, 4, 5, 6, 7].every(s => { const v = TRM.mountainPan(s, true); return v === 0 || v === 1; }) && at(M.panAt + 1).walking === true && TRM.mountainStance(M.panAt + 1, true).walking === false);
  ok('GORMBURN: every seat is on screen when they stop', [0, 1, 2, 3].every(i => { const x = TRM.mountainHero(i, 4, M.inT + 0.5, VW).x; return x > 0 && x < VW * 0.7; }) && TRM.mountainHero(0, 4, 0, VW).x < 0);
  ok('GORMBURN: the fire is told early (glow and smoke up before the look back ends) and is full before the pan', TRM.mountainGlow(M.turnAt) > 0.99 && TRM.mountainRise(M.turnAt) > 0.9 && TRM.mountainGlow(0) === 0);
  ok('GORMBURN main.js: the scene is drawn (drawMountainScene), keeps the forest ambience, and the DEMO plays the row as a teaser then the END CARD (demoEnd: no level loads, demoEndOpen); a locked row without demoEnd still returns false', src.includes('TRA.drawMountainScene(env, s)') && src.includes("tr.entry.scene === 'mountain' ? 'forest'") && src.includes('if (demoTeaser && !entry.demoEnd) return false;') && /entry\.demoEnd && DS\.DEMO\) \{ TRN = null;[^}]*demoEndOpen\(\); return; \}/.test(src));
  ok('GORMBURN art: the mountain scene reads reduce (mountainPan with calm), is dialogue-free, and bakes its peak once', artSrc.includes('mountainPan(s, calm)') && artSrc.includes("once('mountainSprite'")); }
/* ---- the source wiring ---- */
ok('main.js: a GATE-END level starts the transition at the gate (winLevel then trnBegin)', /else \{ winLevel\(\); trnBegin\(\); \} \}/.test(src));
ok('main.js: trnBegin passes the spur flag to the table and lets a SPUR (opensOn.level) through the needs check', src.includes("TRM.entryFor(LEVELS[levelIndex].id, undefined, { burningOpen: !!PROG.burningOpen })") && src.includes('LEVELS[to].opensOn.level === LEVELS[levelIndex].id'));
ok('main.js: the walk target honours walk.to; the way opens across open.w columns; kind light has no wall', src.includes('entry.walk.to * TS') && src.includes('o.col + (o.w || 1)') && src.includes("o.kind === 'light'"));
ok('main.js: the scene is drawn by kind (ferry / road / smoke) and for every scene beat; the arrival keeps its level\'s own ambience unless it is a ferry', src.includes('TRA.drawRoadScene(env, s)') && src.includes('TRA.drawSmokeScene(env, s)') && src.includes('TRM.isSceneBeat(TRN.tl.beats[TRN.tl.i])') && src.includes("if (entry.arrive.ferry) ambient.set('water');"));
ok('KINGSCENE main.js: the war horn (SFX.hornBlast) sounds once at hornAt, the caption THE VILLAGE BURNS is drawn by main (fitText, house text), the thin bar + smaller skip hint follow entry.bar, the lit spur path draws on the map', src.includes('SFX.hornBlast(); if (!SET.reduceMotion) shakeCam(2)') && src.includes("fitText('THE VILLAGE BURNS'") && src.includes('TRM.barIn(tl.t, TRN.entry.bar || TRM.BAR)') && src.includes("THE SPUR'S PATH LIT"));
ok('KINGSCENE art: the red standard heap / stump are gone (no gormStandard), the crown is baked, and the scene reads reduce (smokePan with calm)', !artSrc.includes('gormStandard()') && artSrc.includes('const gormCrown') && artSrc.includes('smokePan(s, calm)'));
ok('the art is dialogue-free (no text() in transitions-art.js)', !/\btext\(/.test(artSrc.replace(/\/\*[^]*?\*\//g, '')));
ok('NEW FILES have no ad-block-looking names (admiral, ads, banner, track, analytics...)', !readdirSync(new URL('.', import.meta.url)).concat(readdirSync(new URL('../src/', import.meta.url))).some(n => /(^|[-_.])(ad|ads|admiral|banner|track|tracker|analytics|pixel|beacon)([-_.]|$)/i.test(n) && /demo-transitions|transitions/.test(n)));

/* ---- the page ---- */
if (process.argv.includes('--browser')) {
  const shotsArg = process.argv.find(a => a.startsWith('--shots=')), SHOTS = shotsArg ? shotsArg.slice(8) : null; if (SHOTS) mkdirSync(SHOTS, { recursive: true });
  const { openPage } = await import('./cdp.mjs'); let pg = await openPage({ audio: false }); const oldErrors = [];
  const ev = x => pg.evalp(x, 600000);
  const shot = async n => { if (!SHOTS) return; await ev('BK.step(1);0'); await new Promise(r => setTimeout(r, 250)); const r = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(SHOTS + '/' + n + '.png', Buffer.from(r.result.data, 'base64')); };
  /* the browser side: set a level up, bring the party to the end of it, end it, and watch the transition. mode: { seats, reduce, skipAt: a beat id to press in (after 1 s), shots: name prefix } */
  const run = (from, mode = {}) => ev(`(async()=>{ const MODE = ${JSON.stringify(mode)}; const { LEVELS } = await import('/src/level.js'); const idx = id => LEVELS.findIndex(l => l.id === id); const out = { log: [], shots: [] };
    BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true }); delete BK.PROG.transSeen; BK.SET.transitions = 'always'; BK.SET.reduceMotion = !!MODE.reduce; BK.trans.force(true);
    if (MODE.burning === true) BK.PROG.burningOpen = 1; else if (MODE.burning === false) delete BK.PROG.burningOpen;
    BK.load(idx(${JSON.stringify(from)})); BK.start(); BK.sim(20);
    if (MODE.seats > 1) { BK.coopStart('warden', false, MODE.seats > 2 ? [{ hero: 'warden' }, { hero: 'pyro' }, { hero: 'knight' }].slice(0, MODE.seats - 1) : undefined); BK.sim(4); }
    const L = BK.L, A = L.arena; out.seats = BK.players().length; out.W = L.W;
    const dismiss = () => { for (let k = 0; k < 12 && BK.state === 'card'; k++) { for (let i = 0; i < 4 && BK.state === 'card'; i++) { try { BK.cardTake(i); } catch (e) {} } if (BK.state === 'card') { try { BK.cardClose(); } catch (e) {} } } };   /* the level-up card a fresh knight earns off the boss: a player picks (or leaves it) and goes on */
    const killBoss = () => { const e = BK.enemies().find(q => q.t === A.boss && q.alive); BK.god = true; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); BK.players().forEach((p, i) => { if (i) { p.x = BK.P.x - 10 * i; p.y = BK.P.y; } }); BK.sim(200);
      for (let n = 0; n < 1500 && e && e.alive; n++) { BK.players().forEach(p => { p.inv = 99; p.hp = p.maxHp; }); e.hp = Math.min(e.hp, 1); e.inv = 0; e.open = 9; e.passThrough = true; BKT.hurtEnemy(e, 1e6, e.x + (n % 2 ? 10 : -10), n % 3 === 0); dismiss(); if (e.alive) BK.sim(6); } return !!e && !e.alive; };
    if (MODE.direct) { BK.state = 'win'; out.began = BK.trans.begin(); }   /* the shut-spur fallback: begin straight off the table */
    else { out.killed = killBoss();
      if (L.gateAfterBoss || ${JSON.stringify(from)} === 'stockade') { for (let i = 0; i < 400 && !(L.gateOpen || (${JSON.stringify(from)} === 'stockade' && i > 30)); i++) { dismiss(); BK.sim(1); } out.gateOpen = !!L.gateOpen; const g = BK.gate; BK.players().forEach((p, i) => { p.x = g.x - i * 2; p.y = g.y - (MODE.air ? 28 : 0); p.vx = p.vy = 0; }); }
      for (let i = 0; i < 900 && !BK.trans.tr && BK.state !== 'win'; i++) { if (MODE.air && !L.gateAfterBoss && !BK.enemies().some(q => q.t === A.boss && q.alive)) { if (!MODE.hover) MODE.hover = BK.players().map(p => p.y - 56); BK.players().forEach((p, k) => { p.y = MODE.hover[k]; p.vy = 0; p.ground = false; }); } dismiss(); BK.sim(1); } }   /* (claude/transland) air: the party hangs 3.5 tiles above the floor from the kill until the transition begins - in the air at trnBegin, as when a boss falls to a mid-air blow */
    for (let i = 0; i < 200 && !BK.trans.tr && BK.state === 'win'; i++) { dismiss(); BK.sim(1); }
    out.tr = !!BK.trans.tr; if (!out.tr) { out.state = BK.state; return out; }
    out.to = BK.trans.tr.entry.to; out.walkers = BK.trans.tr.pos.length; out.scene = BK.trans.tr.entry.scene; out.cleared = !!(BK.PROG[${JSON.stringify(from)}] && BK.PROG[${JSON.stringify(from)}].cleared);
    out.saved = Object.keys(localStorage).some(k => new RegExp('"${from}":\\\\{[^}]*"cleared":(true|1)').test(localStorage.getItem(k) || ''));
    const open = BK.trans.tr.entry.open, tl0 = BK.trans.tr.tl; let skipped = false, opened = false;
    out.minX = 1e9; out.shotAt = [];
    if (MODE.air) { const ps = BK.trans.tr.pos; out.air0 = ps.map(q => [Math.round(q.y), Math.round(q.landY), q.grounded]); out.ax0 = ps.map(q => q.x); out.airF = 0; out.walkedInAir = false; out.landPose = false; out.fallDy = 0; }
    for (let f = 0; f < 4000 && BK.trans.tr; f++) {
      const tr = BK.trans.tr, tl = tr.tl, ph = BK.trans.TRM.phase(tl);
      if (MODE.air) tr.pos.forEach((q, i) => { if (!q.grounded) out.airF++; if (q.landT > 0) out.landPose = true; if (Math.abs(q.x - out.ax0[i]) > 0.01 && (!q.grounded || q.landT > 0)) out.walkedInAir = true; if (q.y > q.landY + 0.01) out.walkedInAir = true; });
      if (open && tr.opened && !opened) { opened = true; out.openedTiles = []; for (let c = open.col; c < open.col + (open.w || 1); c++) for (let r = open.rows[0]; r <= open.rows[1]; r++) out.openedTiles.push(BK.L.grid[r * BK.L.W + c]); out.wallWas = true; }
      if (MODE.skipAt && !skipped && ph === MODE.skipAt && tl.pt > 1.0) { BK.trans.press(); skipped = true; out.skipPhase = ph; }
      if (MODE.shots && !skipped) { const want = MODE.shots.find(w => !out.shotAt.includes(w.n) && w.ph === ph && tl.pt >= w.pt); if (want) { BK.step(1); out.shotAt.push(want.n); out.pending = want.n; out.pendingReady = true; return Object.assign(out, { stoppedFor: want.n, f }); } }
      BK.sim(1);
    }
    for (const until = Date.now() + 20000; BK.trans.tr && Date.now() < until;) { BK.sim(2); await new Promise(r => setTimeout(r, 40)); }   /* the next level loads on its own clock */
    out.done = !BK.trans.tr; out.lvl = BK.trans.levelId();
    return out; })()`);
  /* a run that pauses for a picture: the page keeps its state, the tool shoots, then continues */
  let runs = 0;   /* a fresh page every 3 runs: one page that loads thirty levels in a row grew until Chrome crashed it (Inspector.targetCrashed) */
  const watch = async (from, mode = {}) => {
    if (runs++ % 2 === 1) { oldErrors.push(...pg.errors); pg.close(); pg = await openPage({ audio: false }); }
    const key = from + '-' + (mode.tag || 'full');
    const base = await run(from, { ...mode, shots: SHOTS && mode.shots ? mode.shots : null });
    let r = base; const shotsDone = [];
    while (r.stoppedFor) { await shot(key + '-' + r.stoppedFor); shotsDone.push(r.stoppedFor); r = await ev(`(async()=>{ const out = { shotAt: ${JSON.stringify(shotsDone)} }; const want = ${JSON.stringify(mode.shots || [])};
      for (let f = 0; f < 4000 && BK.trans.tr; f++) { const tr = BK.trans.tr, tl = tr.tl, ph = BK.trans.TRM.phase(tl); const w = want.find(q => !out.shotAt.includes(q.n) && q.ph === ph && tl.pt >= q.pt); if (w) { BK.step(1); out.shotAt.push(w.n); return Object.assign(out, { stoppedFor: w.n }); } BK.sim(1); }
      for (const until = Date.now() + 20000; BK.trans.tr && Date.now() < until;) { BK.sim(2); await new Promise(r => setTimeout(r, 40)); }
      out.done = !BK.trans.tr; out.lvl = BK.trans.levelId(); return out; })()`); }
    return { base, end: r };
  };
  try {
    for (const e of TRM.TABLE) {
      const key = e.from + '>' + e.to, fl = e.from === 'kings' && e.to === 'scree';
      if (process.env.DT_ONLY && key !== process.env.DT_ONLY) continue;   /* (claude/kingscene) DT_ONLY=kings>burning [DT_SEATS=3] [DT_REDUCE=1]: one row, six pictures through the beat */
      const shots = SHOTS ? (process.env.DT_ONLY === 'kings>burning' ? [0.9, 1.9, 2.7, 3.7, 4.5, 5.2].map((pt, i) => ({ n: 'k' + (i + 1), ph: 'smoke', pt })) : e.scene ? [{ n: 'a', ph: e.beats.find(TRM.isSceneBeat).id, pt: 1.6 }, { n: 'b', ph: e.beats.find(TRM.isSceneBeat).id, pt: e.beats.find(TRM.isSceneBeat).dur * 0.5 }, { n: 'c', ph: e.beats.find(TRM.isSceneBeat).id, pt: e.beats.find(TRM.isSceneBeat).dur * 0.9 }].concat(e.scene === 'ferry' ? [{ n: 'd', ph: 'ride', pt: 4.5 }, { n: 'e', ph: 'ride', pt: 7.0 }] : []) : e.open ? (process.env.DT_GATES ? [{ n: 'g', ph: 'open', pt: 0.15 }, { n: 'h', ph: 'open', pt: 0.6 }] : []).concat([{ n: 'a', ph: 'open', pt: 1.25 }, { n: 'b', ph: 'walk', pt: 1.2 }]) : [{ n: 'a', ph: 'walk', pt: 0.4 }]) : null;
      const w = await watch(e.from, { tag: process.env.DT_ONLY ? 'only' + (process.env.DT_SEATS || '') + (process.env.DT_REDUCE ? 'r' : '') : 'full', seats: +process.env.DT_SEATS || undefined, reduce: !!process.env.DT_REDUCE, direct: fl, burning: e.when ? e.when.burningOpen : undefined, shots });
      const a = w.base, z = w.end;
      ok(key + ': the boss falls' + (fl ? '' : '') + (fl ? ' (begun off the table)' : '') + ' and the transition PLAYS (state win, TRN set)', a.tr, JSON.stringify(a).slice(0, 300));
      if (!a.tr) continue;
      ok(key + ': it is the ' + (e.scene || 'walk-out') + ' row into ' + e.to, a.to === e.to && (a.scene || null) === (e.scene || null), JSON.stringify([a.to, a.scene]));
      if (!fl) ok(key + ': the clear is CREDITED and SAVED before the cutscene', a.cleared && a.saved, JSON.stringify([a.cleared, a.saved]));
      if (e.open && e.open.kind !== 'light') ok(key + ': the way OPENED - every tile of the gap is air after the open beat', a.openedTiles && a.openedTiles.length > 0 && a.openedTiles.every(v => v === 0), JSON.stringify(a.openedTiles));
      if (e.endOnMap) { const mp = await ev(`(()=>{ for (let i = 0; i < 30; i++) BK.sim(1); return { state: BK.state, node: BK.map ? BK.map.node : null, lit: BK.mapSpurLit ? BK.mapSpurLit() : null, trn: !!BK.trans.tr }; })()`);
        ok(key + ': the transition ends ON THE MAP with the Burning Village node selected and LIT (no level loaded)', z.done && (mp.state === 'map' || mp.state === 'card') && !mp.trn && mp.lit === e.to, JSON.stringify([z, mp]).slice(0, 260)); await ev('(()=>{ if (BK.state === "card") BK.cardClose(); for (let i = 0; i < 20; i++) BK.sim(1); return 0; })()'); await shot('after-kings-map-lit'); continue; }
      ok(key + ': the transition ends, the next level (' + e.to + ') is loaded', z.done && z.lvl === e.to, JSON.stringify(z).slice(0, 200));
      const arr = await ev(`(async()=>{ const out = {}; const A = BK.trans.arrive; out.hasArrive = !!A; const L = BK.L, W = L.W, ps = BK.players();
        const solid = (cx, cy) => cx < 0 || cy < 0 || cy >= L.grid.length / W || (L.grid[cy * W + cx] === 1);
        out.start = L.START; out.pos = ps.map(p => [Math.round(p.x), Math.round(p.y)]); out.hp0 = ps.map(p => p.hp / p.maxHp);
        out.foot = ps.every(p => solid(Math.floor(p.x / 16), Math.floor((p.y + 1) / 16))); out.clear = ps.every(p => !solid(Math.floor(p.x / 16), Math.floor((p.y - 6) / 16)) && !solid(Math.floor(p.x / 16), Math.floor((p.y - 20) / 16)));
        const t0 = ps.map(p => p.x); for (let i = 0; i < 60 * 4; i++) BK.sim(1);
        out.afterX = ps.map(p => Math.round(p.x)); out.afterY = ps.map(p => Math.round(p.y)); out.hp1 = ps.map(p => p.hp / p.maxHp); out.alive = ps.every(p => !p.dead && p.hp > 0); out.state = BK.state; out.arriveDone = BK.trans.arrive ? BK.trans.arrive.done : true;
        out.moved = ps.every((p, i) => p.x > t0[i] - 1); out.fell = ps.some((p, i) => Math.abs(p.y - out.pos[i][1]) > 20); out.errors = 0; return out; })()`);
      ok(key + ': the party ARRIVES at the start of ' + e.to + ' on SOLID footing, in clear air, left of the first fight', arr.foot && arr.clear && arr.pos.every(p => p[0] < 200), JSON.stringify([arr.pos, arr.foot, arr.clear]));
      ok(key + ': after the arrival walk control is back (state play, arrival done), nobody fell, nobody was hurt, nobody died', arr.state === 'play' && arr.arriveDone && !arr.fell && arr.alive && arr.hp1.every((h, i) => h >= arr.hp0[i] - 0.001), JSON.stringify([arr.state, arr.arriveDone, arr.afterY, arr.hp0, arr.hp1]));
    }
    /* a skip in the middle of each scene and in a walk-out lands in the SAME state as a full watch: the next level, the party in it, the clear credited */
    for (const [from, tag, at] of [['hornetsnest', 'skip-ride', 'ride'], ['fenroad', 'skip-road', 'road'], ['kings', 'skip-smoke', 'smoke'], ['marsh', 'skip-walk', 'walk'], ['underleaf', 'skip-open', 'open'], ['palisadewood', 'skip-walk', 'walk']]) {
      const e = TRM.entryFor(from, undefined, { burningOpen: true });
      const w = await watch(from, { tag, skipAt: at, burning: from === 'kings' ? true : undefined });
      if (e.endOnMap) { const mp = await ev(`(()=>{ for (let i = 0; i < 30; i++) BK.sim(1); return { state: BK.state, lit: BK.mapSpurLit ? BK.mapSpurLit() : null }; })()`); ok(from + ' > ' + e.to + ': a SKIP in the ' + at + ' beat ends on the map with the spur lit', w.end.done && w.base.skipPhase === at && (mp.state === 'map' || mp.state === 'card') && mp.lit === e.to, JSON.stringify([w.end, mp]).slice(0, 260)); continue; }
      ok(from + ' > ' + e.to + ': a SKIP in the ' + at + ' beat ends in ' + e.to + ' with the party standing in it (control back)', w.end.done && w.end.lvl === e.to && w.base.skipPhase === at, JSON.stringify(w).slice(0, 260));
      const st = await ev(`(()=>{ for (let i = 0; i < 300; i++) BK.sim(1); const ps = BK.players(); return { state: BK.state, alive: ps.every(p => p.hp > 0), cleared: !!(BK.PROG['${from}'] && BK.PROG['${from}'].cleared), a: BK.trans.arrive ? BK.trans.arrive.done : true }; })()`);
      ok(from + ': after the skip the state is play, the arrival done, the party alive, the clear credited', st.state === 'play' && st.alive && st.cleared && st.a, JSON.stringify(st));
    }
    /* four seats, reduce motion, ?trans off, the setting NEVER */
    /* (claude/transland) THE HERO IS IN THE AIR WHEN THE BOSS FALLS: every seat falls under gravity to the floor, lands (the landing pose), THEN walks - never walks while airborne - and the row still ends in the next level, arrived on solid footing */
    for (const [from, tag, m] of [['marsh', 'air', { air: true }], ['spore', 'air3', { air: true, seats: 3 }], ['palisadewood', 'air-skip', { air: true, skipAt: 'walk' }], ['hornetsnest', 'air-gate', { air: true }]]) {
      const e = TRM.entryFor(from, undefined, { burningOpen: true });
      const w = await watch(from, { tag, ...m }), a = w.base;
      ok(from + ' > ' + e.to + ' (' + tag + '): the party is IN THE AIR when the transition begins (every seat starts above its floor)', a.tr && a.air0 && a.air0.every(v => !v[2] && v[0] < v[1]), JSON.stringify(a.air0));
      ok(from + ' > ' + e.to + ' (' + tag + '): every seat FELL (frames airborne > 0), took the landing pose, and never walked (x moved / below the floor) until it had landed', a.airF > 0 && a.landPose && !a.walkedInAir, JSON.stringify([a.airF, a.landPose, a.walkedInAir]));
      ok(from + ' > ' + e.to + ' (' + tag + '): the transition plays through to the next level' + (m.skipAt ? ' (a skip in the walk)' : ''), w.end.done && w.end.lvl === e.to, JSON.stringify(w.end).slice(0, 200));
      const st = await ev(`(()=>{ const L = BK.L, ps = BK.players(); const solid = (cx, cy) => cx < 0 || cy < 0 || (L.grid[cy * L.W + cx] === 1); const foot = ps.every(p => solid(Math.floor(p.x / 16), Math.floor((p.y + 1) / 16))); for (let i = 0; i < 300; i++) BK.sim(1); return { state: BK.state, foot, alive: ps.every(p => p.hp > 0) }; })()`);
      ok(from + ' (' + tag + '): the arrival side - control back, everyone standing on solid ground (never spawned mid-air), alive', st.state === 'play' && st.foot && st.alive, JSON.stringify(st));
    }
    for (const [from, tag, m] of [['fenroad', '4seats', { seats: 4 }], ['hornetsnest', '3seats', { seats: 3 }], ['kings', 'reduce', { reduce: true, burning: true }], ['fenroad', 'reduce', { reduce: true }], ['hornetsnest', 'reduce', { reduce: true }]]) {
      const e = TRM.entryFor(from, undefined, { burningOpen: true });
      const w = await watch(from, { tag, ...m });
      if (e.endOnMap) { ok(from + ' > ' + e.to + ' (' + tag + '): the transition plays through to the map' + (m.reduce ? ' and reduce-motion' : ''), w.base.tr && w.end.done, JSON.stringify([w.base.tr, w.end]).slice(0, 200)); continue; }
      ok(from + ' > ' + e.to + ' (' + tag + '): the transition plays through to the next level' + (m.seats ? ' with ' + m.seats + ' seats' : '') + (m.reduce ? ' and reduce-motion' : ''), w.base.tr && w.end.done && w.end.lvl === e.to && (!m.seats || w.base.walkers === m.seats), JSON.stringify([w.base.tr, w.base.walkers, w.end]).slice(0, 260));   /* every seat is walked out (BK.load drops a co-op session in the harness, so the arrival of 4 is not measurable here - owed to a hand test) */
    }
    { const off = await ev(`(async()=>{ const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true }); delete BK.PROG.transSeen; BK.trans.force(false); BK.load(LEVELS.findIndex(l => l.id === 'fenroad')); BK.start(); BK.sim(5); BK.state = 'win'; const a = BK.trans.begin();
        BK.trans.force(true); BK.SET.transitions = 'never'; const b = BK.trans.begin(); BK.SET.transitions = 'first'; BK.PROG.transSeen = { 'fenroad>stockade': 1 }; const c = BK.trans.begin(); BK.SET.transitions = 'always'; const d = BK.trans.begin(); return { a, b, c, d }; })()`);
      ok('?trans off, the setting NEVER and FIRST TIME on a seen pair do not play the Fen Road scene; ALWAYS does', !off.a && !off.b && !off.c && off.d, JSON.stringify(off)); }
    const errs = oldErrors.concat(pg.errors).filter(x => !/favicon/.test(JSON.stringify(x)));
    ok('no page errors / console clean through every row', errs.length === 0, JSON.stringify(errs.slice(0, 3)));
  } finally { pg.close(); }
}
/* ---- the three scenes on a phone: 915x412 landscape at DPR 2.625, CPU throttled (MP_CPU, default 4x), the game on its own requestAnimationFrame loop; frames per second over the scene beats (>= MP_FPS_MIN, default 40) ---- */
if (process.argv.includes('--perf')) {
  const { openPage } = await import('./cdp.mjs'); const sleep = ms => new Promise(r => setTimeout(r, ms));
  const CPU = +(process.env.MP_CPU || 4), FPS_MIN = +(process.env.MP_FPS_MIN || 40);
  for (const from of ['hornetsnest', 'fenroad', 'kings']) {
    const pg = await openPage({ audio: false, fonts: false, speed: 0.6 });
    try {
      await pg.send('Emulation.setDeviceMetricsOverride', { width: 915, height: 412, deviceScaleFactor: 2.625, mobile: true, screenOrientation: { type: 'landscapePrimary', angle: 90 } });
      await pg.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
      await pg.send('Emulation.setCPUThrottlingRate', { rate: CPU });
      await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); BK.setHero('knight'); BK.reset({ fresh: true }); BK.trans.force(true); BK.SET.transitions = 'always'; BK.PROG.burningOpen = 1; BK.manualSimulation = true;
        BK.load(LEVELS.findIndex(l => l.id === '${from}')); BK.start(); BK.sim(20); const L = BK.L, A = L.arena, e = BK.enemies().find(q => q.t === A.boss && q.alive); BK.god = true; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); BK.sim(200);
        const dismiss = () => { for (let k = 0; k < 12 && BK.state === 'card'; k++) { for (let i = 0; i < 4 && BK.state === 'card'; i++) { try { BK.cardTake(i); } catch (e) {} } if (BK.state === 'card') { try { BK.cardClose(); } catch (e) {} } } };
        for (let n = 0; n < 1500 && e && e.alive; n++) { BK.P.inv = 99; BK.P.hp = BK.P.maxHp; e.hp = Math.min(e.hp, 1); e.inv = 0; e.open = 9; e.passThrough = true; BKT.hurtEnemy(e, 1e6, e.x + (n % 2 ? 10 : -10), n % 3 === 0); dismiss(); if (e.alive) BK.sim(6); }
        if (L.gateAfterBoss) { for (let i = 0; i < 400 && !L.gateOpen; i++) { dismiss(); BK.sim(1); } BK.P.x = BK.gate.x; BK.P.y = BK.gate.y; }
        for (let i = 0; i < 900 && !BK.trans.tr && BK.state !== 'win'; i++) { dismiss(); BK.sim(1); }
        BK.manualSimulation = false; return 1; })()`, 600000);
      const wait = async (pred, ms) => { for (const until = Date.now() + ms; Date.now() < until;) { if (await pg.evalp(pred, 5000).catch(() => false)) return true; await sleep(100); } return false; };
      const inScene = await wait("!!(BK.trans.tr && !BK.trans.tr.loading && BK.trans.TRM.isSceneBeat(BK.trans.tr.tl.beats[BK.trans.tr.tl.i]))", 120000);
      ok('PERF ' + from + ': the page reached the scene on its own loop', inScene);
      if (inScene) {
        await pg.evalp("(() => { const a = window.__fr = { n: 0, dts: [], last: performance.now(), on: true }; const f = t => { if (!a.on) return; a.n++; a.dts.push(t - a.last); a.last = t; requestAnimationFrame(f); }; requestAnimationFrame(f); window.__t0 = performance.now(); })()");
        await wait("!BK.trans.tr || BK.trans.TRM.phase(BK.trans.tr.tl) === 'fade'", 60000);
        const r = await pg.evalp("(() => { const a = window.__fr; a.on = false; const d = a.dts.slice().sort((x, y) => x - y); return { n: a.n, wall: (performance.now() - window.__t0) / 1000, p95: d[Math.floor(d.length * 0.95)] || 0, worst: d[d.length - 1] || 0 }; })()");
        const fps = r.n / r.wall; console.log(from + ' scene: ' + JSON.stringify({ fps: +fps.toFixed(1), p95: +r.p95.toFixed(1), worst: +r.worst.toFixed(1), secs: +r.wall.toFixed(1), cpu: CPU + 'x' }));
        ok('PERF ' + from + ': >= ' + FPS_MIN + ' fps over the scene at ' + CPU + 'x CPU on a phone viewport', fps >= FPS_MIN, fps.toFixed(1) + ' fps');
      }
      ok('PERF ' + from + ': no page errors', pg.errors.length === 0, JSON.stringify(pg.errors.slice(0, 3)));
    } finally { pg.close(); }
  }
}
const bad = rows.filter(x => !x.pass); console.log(bad.length ? bad.length + ' red of ' + rows.length : 'all ' + rows.length + ' green'); process.exit(bad.length ? 1 : 0);
