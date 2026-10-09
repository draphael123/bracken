/* tools/flasks2.mjs - FLASKS 2 (claude/flasks2, Daniel 2026-10-08; src/flasks2.js). PORT=<port> node tools/flasks2.mjs  (~3-5 min with the page)
 *   A. RULES (no page): the nine store lines (3 COUNT / 3 POTENCY / 3 PERKS; 3 hidden), the unlock rules (a level beaten, a find, an objective),
 *      '???' for a hidden line, the heal tiers and the card's +10, QUICK DRAUGHT's drink, the objectives (God Mode earns none), the typical kit along
 *      the road (counts never fall, the hidden ones never in it), OLD SAVES (flaskUp 1/2 -> EXTRA FLASK I/II, nothing lost), the HUD row's layout
 *      (5 bottles and a 2-digit count stay left of the skill slots at x 70).
 *   B. THE HIDDEN FINDS ARE REACHABLE: each find's tile is open, has footing under it, and is joined through open tiles (a secret wall counts as
 *      open) to the wood's START or one of its silvers.
 *   C. THE PAGE: the flask row under the health bar, NEVER under a skill slot, in both HUD modes and at every screen size (desktop 16:9, 4:3,
 *      ultrawide, a phone in landscape with the touch buttons on); the bottles count right (1 to start, a buy is +1 at once, 4 at most, a broken
 *      shrine's extra is gold); the DRINK (the swallow at the drink's time, QUICK sooner; a blow before it SPILLS - spent, nothing healed, the flask
 *      flies, the row shakes red; STEADY HAND keeps it); the unlocks in the store (locked lines say why, hidden say '???', a find reveals and opens
 *      its line); the objectives (a dry clear, five shrines; God Mode earns neither); a find picked up in the Glass Sea; an old save's flasks kept. */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { LEVELS, T } from '../src/level.js';
import * as F2 from '../src/flasks2.js';
import * as SV from '../src/survival.js';
import { depthsOf } from '../src/campaign-order.js';
import { flaskKitAt, beatenBeforeIn } from '../src/campaign-kit.js';
import { actOf } from '../src/foe-react.js';

const fails = [], ok = (c, m) => { if (!c) fails.push(m); };
/* ---------- A. the rules ---------- */
{
  const groups = F2.FLASK_ITEMS.reduce((o, k) => ((o[k.group] = (o[k.group] || 0) + 1), o), {});
  assert.deepEqual(groups, { COUNT: 3, POTENCY: 3, PERKS: 3 }, 'three lines a group: ' + JSON.stringify(groups));
  assert.deepEqual(F2.FLASK_ITEMS.filter(k => k.hidden).map(k => k.id), ['extra3', 'sunlight', 'steady'], 'the three hidden lines');
  assert.equal(F2.itemOf('tonic').name, 'EXTRA FLASK I'); assert.equal(F2.itemOf('tonic').price, 150); assert.ok(!F2.itemOf('tonic').req, 'EXTRA FLASK I is open from the start');
  const want = { extra2: { beat: 'crown' }, extra3: { find: 'flaskshard' }, rich: { beat: 'stockade' }, distilled: { beat: 'keep' }, sunlight: { find: 'sunlight' }, quick: { obj: 'dry' }, steady: { find: 'steady' }, blessing: { obj: 'shrines5' } };
  for (const [id, r] of Object.entries(want)) { const k = F2.itemOf(id), key = Object.keys(r)[0]; assert.equal(k.req[key], r[key], id + ' is gated on ' + JSON.stringify(r)); }
  for (const lv of ['crown', 'stockade', 'keep']) assert.ok(LEVELS.some(l => l.id === lv), 'no level ' + lv);
  const p0 = F2.migrate({});
  assert.equal(F2.lockText(F2.itemOf('tonic'), p0), null);
  assert.match(F2.lockText(F2.itemOf('extra2'), p0), /GOBLIN QUEEN/); assert.match(F2.lockText(F2.itemOf('rich'), p0), /CHIEFTAIN/); assert.match(F2.lockText(F2.itemOf('distilled'), p0), /DROWNED KING/);
  assert.match(F2.lockText(F2.itemOf('quick'), p0), /without drinking/); assert.match(F2.lockText(F2.itemOf('blessing'), p0), /break 5 shrines/);
  for (const id of ['extra3', 'sunlight', 'steady']) { assert.equal(F2.displayName(F2.itemOf(id), p0), '???', id + ' is not ???'); assert.ok(!/SHARD|SUNLIGHT|STEADY/i.test(F2.lockText(F2.itemOf(id), p0)), id + "'s lock gives it away"); }
  const p1 = F2.migrate({ crown: { cleared: true }, stockade: { cleared: true }, keep: { cleared: true }, flaskFinds: { sunlight: true }, flaskObj: { dry: true } });
  for (const id of ['extra2', 'rich', 'distilled', 'sunlight', 'quick']) assert.equal(F2.lockText(F2.itemOf(id), p1), null, id + ' still locked once its rule is met');
  assert.equal(F2.displayName(F2.itemOf('sunlight'), p1), 'BOTTLED SUNLIGHT', 'a found line still ???');
  /* the heal and the drink */
  assert.equal(F2.healPct({}), 0.35); assert.equal(F2.POTENCY.cap, 0.50);   /* (Daniel 10-09: the store's tiers only - the card no longer heals) */
  { const PR = await import('../src/progression.js'), c = PR.MINOR_PERKS.find(k => k.id === 'tonic'); assert.ok(c && c.name === 'SECOND DRAUGHT' && !/HEAL|%/.test(c.what), 'the old RICH FLASK card is not the non-heal SECOND DRAUGHT: ' + JSON.stringify(c)); }
  const own = (...ids) => ({ flaskItems: Object.fromEntries(ids.map(i => [i, true])) });
  assert.equal(F2.healPct(own('rich')), 0.40); assert.equal(F2.healPct(own('rich', 'distilled')), 0.45); assert.equal(F2.healPct(own('sunlight')), 0.50); assert.equal(F2.healPct(own('rich', 'sunlight')), 0.50, 'the best one owned'); assert.equal(F2.healPct(own('rich', 'distilled', 'sunlight')), 0.50, 'potency caps at 50%');
  assert.deepEqual(F2.drinkTimes({}, SV.FLASK), { drinkT: SV.FLASK.drinkT, swallowAt: SV.FLASK.swallowAt });
  const q = F2.drinkTimes(own('quick'), SV.FLASK); assert.ok(q.drinkT < SV.FLASK.drinkT && q.swallowAt < SV.FLASK.swallowAt && Math.abs(q.drinkT / 0.6 - 0.5) < 0.02, 'QUICK DRAUGHT is ~0.5 s on the clock: ' + JSON.stringify(q));
  assert.equal(F2.shrineGives({}), 1); assert.equal(F2.shrineGives(own('blessing')), 2);
  assert.equal(SV.flaskMax({ flaskUp: F2.countOf(own('tonic', 'extra2', 'extra3')) }), 4, 'three extra flasks make four');
  /* the objectives */
  { const p = F2.migrate({}); assert.deepEqual(F2.objLevelCleared(p, { drinks: 1 }), []); assert.deepEqual(F2.objLevelCleared(p, { drinks: 0, assist: true }), [], 'God Mode earned QUICK DRAUGHT');
    assert.deepEqual(F2.objLevelCleared(p, { drinks: 0 }), ['dry']); assert.deepEqual(F2.objLevelCleared(p, { drinks: 0 }), [], 'earned twice');
    for (let i = 0; i < 6; i++) F2.objShrineBroken(p, { assist: true }); assert.equal(p.shrinesBroken, 0, 'God Mode counted a broken shrine');
    const got = []; for (let i = 0; i < 6; i++) got.push(...F2.objShrineBroken(p)); assert.deepEqual(got, ['shrines5'], 'five broken shrines: ' + JSON.stringify(got)); assert.equal(p.shrinesBroken, 6); }
  /* OLD SAVES keep every flask they had */
  for (const [up, ids] of [[0, []], [1, ['tonic']], [2, ['tonic', 'extra2']]]) { const p = F2.migrate({ flaskUp: up }); assert.deepEqual(Object.keys(p.flaskItems).sort(), ids.slice().sort(), 'flaskUp ' + up); assert.equal(p.flaskUp, up); assert.equal(SV.flaskMax(p), 1 + up); }
  { const p = F2.migrate({ flaskUp: 2, flaskItems: { tonic: true, extra2: true, extra3: true, quick: true } }); assert.equal(p.flaskUp, 3, 'a save with items: the count is the items'); assert.ok(p.flaskItems.quick); }
  { const p = F2.migrate(F2.migrate({ flaskUp: 1 })); assert.equal(p.flaskUp, 1, 'migrating twice moved the count'); }
  /* the typical kit, along the road */
  const D = depthsOf(LEVELS), road = LEVELS.filter(l => !l.hidden && D[l.id] != null).sort((a, b) => D[a.id] - D[b.id]); let last = 0;
  for (const l of road) { const k = flaskKitAt(l.id, D[l.id], beatenBeforeIn(LEVELS, l.id)), n = 1 + F2.countOf({ flaskItems: k });
    ok(!k.extra3 && !k.sunlight && !k.steady, l.id + ': a hidden line in the typical kit'); ok(n >= 1 && n <= 3, l.id + ': ' + n + ' flasks');
    if (beatenBeforeIn(LEVELS, l.id).includes('crown')) ok(k.extra2, l.id + ': past the Goblin Queen without EXTRA FLASK II');
    if (actOf(l.id, D[l.id]).act >= 2) ok(k.quick, l.id + ': act II+ without QUICK DRAUGHT');
    last = n; }
  ok(flaskKitAt('crown', D.crown, beatenBeforeIn(LEVELS, 'crown')).extra2 !== true, 'the Goblin Queen fought with her own reward');
  ok(F2.countOf({ flaskItems: flaskKitAt('stockade', D.stockade, beatenBeforeIn(LEVELS, 'stockade')) }) === 0, 'the Chieftain is the first boss: one flask');
  /* the HUD row's layout: never reaching the slots (x 70) */
  const R = F2.rowLayout(5, 4, { numW: 8 }); ok(R.x + R.w < 70, 'five bottles and the count reach x ' + (R.x + R.w)); ok(R.y >= 19 && R.y + R.h <= 30, 'the row is not under the bars: ' + JSON.stringify([R.y, R.h]));
  assert.deepEqual(F2.rowLayout(2, 3).bottles.map(b => b.kind), ['full', 'full', 'empty']); assert.deepEqual(F2.rowLayout(4, 3).bottles.map(b => b.kind), ['full', 'full', 'full', 'over']);
  /* the drink, phase by phase */
  { const Tm = { drinkT: 0.45, swallowAt: 0.3 }, ph = [0, 0.05, 0.12, 0.2, 0.29, 0.31, 0.44].map(t => F2.drinkPhase(t, Tm).ph);
    assert.deepEqual(ph, ['uncork', 'uncork', 'gulp1', 'gulp2', 'gulp2', 'lower', 'lower'], 'the drink phases: ' + ph); }
  assert.deepEqual(Object.keys(F2.MOUTH).sort(), ['geomancer', 'knight', 'paladin', 'pirate', 'pyro', 'reaper', 'warden'], 'a mouth for all seven heroes');
}
/* ---------- B. the hidden finds are reachable ---------- */
const BLOCK = new Set([T.SOLID, T.CRATE, T.PALISADE, T.PORT, T.SOFT, T.ICE, T.CRYST]);
const finds = {};
for (const f of F2.FINDS) {
  const lv = LEVELS.find(l => l.id === f.level); ok(lv, f.id + ': no level ' + f.level); if (!lv) continue;
  const L = lv.build(), at = (x, y) => x < 0 || y < 0 || x >= L.W || y >= L.H ? T.SOLID : L.grid[y * L.W + x];
  const wallAt = (x, y) => (L.walls || []).some(w => x >= (w.x0 ?? w.x) && x <= (w.x1 ?? w.x0 ?? w.x) && y >= (w.y0 ?? w.y) && y <= (w.y1 ?? w.y0 ?? w.y));
  const open = (x, y) => !BLOCK.has(at(x, y)) || wallAt(x, y);
  ok(open(f.x, f.y) && at(f.x, f.y) !== T.SPIKE, f.id + ': its tile is not open');
  ok([1, 2].some(d => at(f.x, f.y + d) !== T.AIR && at(f.x, f.y + d) !== T.SPIKE), f.id + ': nothing to stand on under it');
  const seen = new Uint8Array(L.W * L.H), q = [[f.x, f.y]]; seen[f.y * L.W + f.x] = 1;
  const goals = new Set([L.START.x + ',' + L.START.y, ...L.ents.filter(e => e.t === 'silver').map(e => e.x + ',' + e.y)]); let reached = null;
  while (q.length && !reached) { const [x, y] = q.shift(); if (goals.has(x + ',' + y)) { reached = x + ',' + y; break; }
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= L.W || ny >= L.H || seen[ny * L.W + nx] || !open(nx, ny)) continue; seen[ny * L.W + nx] = 1; q.push([nx, ny]); } }
  ok(reached, f.id + ' in ' + f.level + ' is sealed off from the start and every silver'); finds[f.id] = reached;
}
/* ---------- C. the page ---------- */
const pg = await openPage({ audio: false, fonts: false });
const E = (e, t = 300000) => pg.evalp(e, t);
const W = id => LEVELS.findIndex(l => l.id === id);
const res = {};
const nav = async q => { await pg.send('Page.navigate', { url: 'http://localhost:' + pg.PORT + '/' + q }); await new Promise(r => setTimeout(r, 1500)); for (let i = 0; i < 300; i++) { if (await E('typeof window.BK === "object" && !!window.BK.lookPass', 3000).catch(() => false)) break; await new Promise(r => setTimeout(r, 400)); } await E('BK.ui.pressCard = false').catch(() => {}); };
const hit = (a, b) => a && b && a[0] < b[0] + b[2] && b[0] < a[0] + a[2] && a[1] < b[1] + b[3] && b[1] < a[1] + a[3];
try {
  const go = (id, extra = '', keep = false) => `var P0=BKT.PROG;BK.manualSimulation=true;BK.setHero('knight');BK.reset({fresh:true});${keep ? '' : 'Object.assign(P0,{flaskItems:{},flaskUp:0,flaskFinds:{},flaskObj:{},shrinesBroken:0});'}BK.flaskHud.spills=[];BK.flaskHud.spillT=0;BK.flaskHud.flashT=0;${extra}BK.load(${W(id)});BK.state='play';BK.start();BK.god=false;BK.SET.invincible=false;BK.SET.godmode=false;BK.enemies().forEach(e=>{e.alive=false;});BK.sim(20);`;
  /* C1. the row, the slots: both HUD modes, every screen */
  const screens = [['desktop 16:9', 1280, 720, false], ['4:3', 1024, 768, false], ['ultrawide', 2560, 1080, false], ['phone landscape', 844, 390, true], ['phone portrait', 390, 844, true]];
  res.layout = []; let curMob = false;
  for (const [name, w, h, mob] of screens) {
    await pg.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: mob ? 2 : 1, mobile: mob, ...(mob ? { screenOrientation: w > h ? { type: 'landscapePrimary', angle: 90 } : { type: 'portraitPrimary', angle: 0 } } : {}) });
    await pg.send('Emulation.setTouchEmulationEnabled', { enabled: mob, maxTouchPoints: mob ? 5 : 1 }); if (mob !== curMob) { curMob = mob; await nav(mob ? '?touch=1&nosw' : '?nosw'); }
    for (const mode of ['minimal', 'full']) {
      const r = await E(`(async()=>{${go('wood', "BKT.setHeroLevel('knight',40);P0.skillOwned.knight={};")}
        const act=(BKT.TREE||[]).filter(n=>n.hero==='knight'&&n.active&&(n.level||0)<=40).map(n=>n.id).slice(0,4);for(const id of act)P0.skillOwned.knight[id]=true;P0.loadouts.knight=act.slice();
        BK.SET.hud=${JSON.stringify(mode)};BKT.PROG.flaskUp=3;BKT.PROG.flaskItems={tonic:true,extra2:true,extra3:true};BK.P.flasks=5;BK.P.hp=BK.P.maxHp*0.5;BK.P.cds={};BK.step(4);
        const row=BK.flaskRow(),slots=BK.skillSlots(),dbg=BK.touch&&BK.touch.debug?BK.touch.debug():null;let btn=[];
        if(dbg&&dbg.on&&row){const a=BK.touch.gameToClient(row[0],row[1]),b=BK.touch.gameToClient(row[0]+row[2],row[1]+row[3]);const cr=[a[0],a[1],b[0]-a[0],b[1]-a[1]];
          for(const B of dbg.buttons.concat(dbg.pills||[])){const c0=B.r!=null?BK.touch.displayToClient(B.cx-B.r,B.cy-B.r):BK.touch.displayToClient(B.x,B.y),c1=B.r!=null?BK.touch.displayToClient(B.cx+B.r,B.cy+B.r):BK.touch.displayToClient(B.x+B.w,B.y+B.h);btn.push({k:B.k||B.id||B.press||'?',r:[c0[0],c0[1],c1[0]-c0[0],c1[1]-c0[1]],row:cr});}}
        return {row,slots,act:act.length,touch:!!(dbg&&dbg.on),btn,VW:BK.VW||null};})()`);
      res.layout.push({ name, mode, ...r, btn: undefined, btnN: r.btn.length });
      ok(r.row, name + '/' + mode + ': no flask row drawn');
      if (r.row) { ok(r.row[1] >= 18, name + '/' + mode + ': the flask row is up in the health bar: y ' + r.row[1]);
        ok(r.slots.length >= 2, name + '/' + mode + ': only ' + r.slots.length + ' skill slots drawn (the test needs them)');
        for (const s of r.slots) ok(!hit(r.row, s), name + '/' + mode + ': a skill slot ' + JSON.stringify(s) + ' over the flask row ' + JSON.stringify(r.row));
        for (const b of r.btn) ok(!hit(b.row, b.r), name + '/' + mode + ': the touch button ' + b.k + ' over the flask row'); }
      if (mob) ok(r.touch, name + ': the touch buttons were not on');
    }
  }
  await pg.send('Emulation.setTouchEmulationEnabled', { enabled: false, maxTouchPoints: 1 });
  await pg.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false }); await nav('?nosw');
  /* C2. counts: 1 to start, a buy is one more at once, a broken shrine's extra is gold over the max */
  res.count = await E(`(async()=>{${go('wood')}const P=BK.P,o={start:P.flasks,max:BK.flaskMax()};BK.step(2);o.row0=BK.flaskRow();
    P0.coins=5000;BK.state='map';BK.ui.storeOpen('map','flasks');const t=BK.ui.storeRows().find(q=>q.id==='flasks');BK.ui.storeI=t.rows.findIndex(k=>k.id==='tonic');BK.step(2);BK.press('confirm');BK.sim(1);BK.press('pause');BK.sim(2);
    o.afterBuy={flasks:P.flasks,max:BK.flaskMax(),own:!!P0.flaskItems.tonic,up:P0.flaskUp,coins:5000-P0.coins};
    ${go('wood')}const SH=BK.shrines().filter(s=>!s.lit).sort((a,b)=>a.x-b.x);const s=SH[0];BK.P.x=s.x;BK.P.y=s.y;BK.sim(3);BK.breakShrine(s);BK.step(2);
    o.broken={flasks:BK.P.flasks,max:BK.flaskMax(),kinds:(await import('/src/flasks2.js')).rowLayout(BK.P.flasks,BK.flaskMax()).bottles.map(b=>b.kind),flash:BK.flaskHud.flashT>0};return o;})()`);
  ok(res.count.start === 1 && res.count.max === 1, 'a fresh save does not start with one flask: ' + JSON.stringify(res.count));
  ok(res.count.afterBuy.own && res.count.afterBuy.up === 1 && res.count.afterBuy.max === 2 && res.count.afterBuy.coins === 150, 'buying EXTRA FLASK I: ' + JSON.stringify(res.count.afterBuy));
  ok(res.count.broken.flasks === res.count.broken.max + 1 && res.count.broken.kinds.at(-1) === 'over' && res.count.broken.flash, 'a broken shrine: ' + JSON.stringify(res.count.broken));
  /* C3. THE DRINK: the swallow at its time, QUICK sooner; a blow before it spills; STEADY HAND keeps it */
  res.drink = await E(`(async()=>{const o={};const sp=BK.SET.speed||1;
    const swallow=(extra)=>{${go('wood')}eval(extra);const P=BK.P;P.flasks=2;P.hp=30;P.inv=0;BK.sim(5);const hp0=P.hp;const began=BK.drinkFlask();let n=0;while(n<90&&P.hp===hp0){BK.sim(1);n++;}return {began,frames:n,heal:P.hp-hp0,pct:BK.flaskHealPct()};};
    o.std=swallow('');o.card=swallow("BKT.PROG.card=BKT.PROG.card||{};const cc=BKT.PROG.card.knight||(BKT.PROG.card.knight={});cc.ms=Object.assign({},cc.ms,{5:'tonic'});BK.P.st=1;");o.cardSt=BK.P.st>=BK.P.maxSt-0.5;o.quick=swallow("BKT.PROG.flaskItems.quick=true;");o.rich=swallow("BKT.PROG.flaskItems.rich=true;");
    const spill=(extra)=>{${go('wood')}eval(extra);const P=BK.P;P.flasks=2;P.hp=30;P.inv=0;P.hurt=0;BK.sim(5);BK.drinkFlask();BK.sim(6);P.inv=0;BKT.damagePlayer(P.x+20,10,{unblockable:true});const hpHit=P.hp;for(let i=0;i<40&&P.drinkT>0;i++)BK.sim(1);
      const r={spent:2-P.flasks,flying:BK.flaskHud.spills.filter(s=>!s.cork).length,shake:BK.flaskHud.spillT>0};BK.sim(60);r.healed=P.hp-hpHit;r.drinking=P.drinkT>0;return r;};
    o.spill=spill('');o.steady=spill("BKT.PROG.flaskItems.steady=true;");o.speed=sp;return o;})()`);
  { const d = res.drink, want = Math.round(SV.FLASK.swallowAt * 60 / (d.speed || 1)), wantQ = Math.round(F2.QUICK.swallowAt * 60 / (d.speed || 1));
    ok(d.card.pct === d.std.pct && d.card.heal === d.std.heal, 'the SECOND DRAUGHT card changed the heal: ' + JSON.stringify([d.card, d.std]));
    ok(d.cardSt, 'SECOND DRAUGHT did not refill the stamina');
    ok(d.std.began && Math.abs(d.std.frames - want) <= 3, 'the swallow lands at ' + d.std.frames + ' frames, want ~' + want);
    ok(d.quick.began && Math.abs(d.quick.frames - wantQ) <= 3 && d.quick.frames < d.std.frames, 'QUICK DRAUGHT swallows at ' + d.quick.frames + ', want ~' + wantQ);
    ok(Math.abs(d.rich.pct - 0.40) < 1e-9 && d.rich.heal > d.std.heal, 'RICH DRAUGHT: ' + JSON.stringify(d.rich) + ' vs ' + JSON.stringify(d.std));
    ok(d.spill.spent === 1 && d.spill.healed === 0 && !d.spill.drinking && d.spill.flying === 1 && d.spill.shake, 'a blow before the swallow: ' + JSON.stringify(d.spill));
    ok(d.steady.spent === 0 && d.steady.healed === 0 && !d.steady.drinking && d.steady.flying === 0, 'STEADY HAND: ' + JSON.stringify(d.steady)); }
  /* C4. the store's unlocks, the objectives, a find */
  res.store = await E(`(async()=>{${go('wood')}const o={};const rows=()=>Object.fromEntries(BK.flaskRows().map(r=>[r.id,r]));o.fresh=rows();
    BKT.PROG.stockade={cleared:true};BKT.PROG.crown={cleared:true};BKT.PROG.keep={cleared:true};o.beaten=rows();
    /* a dry clear */
    ${go('marsh')}BK.xpWin();o.dry=!!(BKT.PROG.flaskObj&&BKT.PROG.flaskObj.dry);o.afterDry=rows().quick.state;
    /* God Mode earns nothing */
    BKT.PROG.flaskObj={};${go('marsh')}BK.SET.invincible=true;BK.xpWin();o.godDry=!!BKT.PROG.flaskObj.dry;BK.SET.invincible=false;
    /* a drink in the wood: not dry */
    ${go('marsh')}BK.P.hp=20;BK.P.inv=0;BK.drinkFlask();BK.sim(60);BK.xpWin();o.wetDry=!!BKT.PROG.flaskObj.dry;
    /* five shrines */
    BKT.PROG.shrinesBroken=0;for(let i=0;i<5;i++){${go('wood', '', true)}const s=BK.shrines().filter(q=>!q.lit).sort((a,b)=>a.x-b.x)[0];BK.P.x=s.x;BK.P.y=s.y;BK.sim(3);BK.breakShrine(s);}
    o.shrines={n:BKT.PROG.shrinesBroken,obj:!!BKT.PROG.flaskObj.shrines5,state:rows().blessing.state};
    /* SHRINE BLESSING: a shrine gives two */
    BKT.PROG.flaskItems.blessing=true;BKT.PROG.flaskUp=2;${go('wood', '', true)}BK.P.flasks=0;const s2=BK.shrines().filter(q=>!q.lit).sort((a,b)=>a.x-b.x)[0];BK.P.x=s2.x;BK.P.y=s2.y;BK.sim(3);o.blessing=BK.P.flasks;delete BKT.PROG.flaskItems.blessing;BKT.PROG.flaskUp=0;
    /* a find: the Glass Sea's vault */
    ${go('glasssea')}const f=BK.flaskFinds().find(q=>q.id==='sunlight');o.find={there:!!f};if(f){BK.P.x=f.px;BK.P.y=f.py+7;BK.P.vx=BK.P.vy=0;BK.sim(2);o.find.got=!!(BKT.PROG.flaskFinds&&BKT.PROG.flaskFinds.sunlight);o.find.row=rows().sunlight;}
    ${go('glasssea', '', true)}o.findGone=!BK.flaskFinds().some(q=>q.id==='sunlight');return o;})()`);
  { const s = res.store;
    ok(s.fresh.tonic.state === 'buy', 'EXTRA FLASK I is not on sale from the start');
    for (const id of ['extra2', 'rich', 'distilled', 'quick', 'blessing']) ok(s.fresh[id].state === 'locked' && s.fresh[id].lock && s.fresh[id].name !== '???', id + ' not locked-with-a-reason on a fresh save: ' + JSON.stringify(s.fresh[id]));
    for (const id of ['extra3', 'sunlight', 'steady']) ok(s.fresh[id].state === 'locked' && s.fresh[id].name === '???', id + ' not ??? on a fresh save: ' + JSON.stringify(s.fresh[id]));
    for (const id of ['extra2', 'rich', 'distilled']) ok(s.beaten[id].state === 'buy', id + ' not on sale once its boss is beaten');
    ok(s.dry && s.afterDry === 'buy', 'a dry clear did not open QUICK DRAUGHT: ' + JSON.stringify([s.dry, s.afterDry]));
    ok(!s.godDry, 'God Mode earned QUICK DRAUGHT'); ok(!s.wetDry, 'a clear with a drink earned QUICK DRAUGHT');
    ok(s.shrines.n === 5 && s.shrines.obj && s.shrines.state === 'buy', 'five broken shrines: ' + JSON.stringify(s.shrines));
    ok(s.blessing === 2, 'SHRINE BLESSING: a shrine gave back ' + s.blessing);
    ok(s.find.there && s.find.got && s.find.row.name === 'BOTTLED SUNLIGHT' && s.find.row.state === 'buy', 'the Glass Sea find: ' + JSON.stringify(s.find));
    ok(s.findGone, 'a find picked up is there again'); }
  /* C5. an OLD SAVE (survival2: two EXTRA FLASKS bought) keeps its flasks */
  res.old = await E(`(async()=>{localStorage.clear();localStorage.setItem('bracken.progress.0',JSON.stringify({progressionVersion:2,xpVersion:1,perHero:1,medalPurseGranted:true,skillRefund:true,coins:300,hero:'knight',heroes:{knight:true},items:{heart:true},flaskUp:2}));BK.loadSlot(0);BK.applyUpgrades();
    const P0=BKT.PROG;return {up:P0.flaskUp,items:P0.flaskItems,max:BK.flaskMax(),coins:P0.coins};})()`);
  ok(res.old.up === 2 && res.old.items.tonic && res.old.items.extra2 && res.old.max === 3 && res.old.coins === 300, 'an old save lost its flasks: ' + JSON.stringify(res.old));
  ok(pg.errors.length === 0, 'the page threw: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
console.log(JSON.stringify(res.layout.map(l => [l.name, l.mode, l.row, l.slots.length, l.btnN])));
if (fails.length) { console.log('FLASKS2 FAIL\n  ' + fails.join('\n  ')); process.exit(1); }
console.log('FLASKS2: 9 store lines (3 hidden) gated right, old saves keep their flasks, finds reachable (' + Object.entries(finds).map(([k, v]) => k + '->' + v).join(', ') + '); the row clear of the slots on ' + res.layout.length + ' screens/modes; drink swallow ' + res.drink.std.frames + 'f (quick ' + res.drink.quick.frames + 'f), spill and steady hand; objectives and God Mode guard.');
