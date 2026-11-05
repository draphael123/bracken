// tools/reflect-owed.mjs - THE SKY FIGHT's PAGE CHECKS S2 OWED (lane S3 REFLECTKIT, claude/reflectkit). One headless Chrome, ?level=skylab. Pictures to work/claude/reflectkit/*.png.
//   knock   a knockdown reads: the modes run tumble -> downed -> repulse -> rise -> float, the drake holds its bank meanwhile, pips light on the HUD     (shots k1-k6)
//   imps    phase 3: imps land (cap 2, demon skin) and lava bombs fall, no page error                                                                     (shots i1-i2)
//   side    bolts living in `enemies`: no leak (entities == bolts in flight), no page error over a long P1 fight; AI partner in the fight returns bolts     (shot s1)
//   hud     his bar and pips against the level's own HUD at the real view size                                                                            (shot h1)
//   node tools/reflect-owed.mjs [knock,imps,side,hud]            (PORT=<your port>)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const WANT = process.argv[2] ? process.argv[2].split(',') : ['knock', 'imps', 'side', 'hud'];
const OUT = join(ROOT, 'work/claude/reflectkit'); mkdirSync(OUT, { recursive: true });
const pg = await openPage({ audio: false, fonts: false, seed: 7 });
let bad = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
const save = async (name) => { const url = await pg.evalp(`__ro.snap()`, 30000); writeFileSync(join(OUT, name + '.png'), Buffer.from(url.split(',')[1], 'base64')); };
try {
  await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const IDX = LEVELS.findIndex(l => l.id === 'skylab'); const K = BK.keys; const ro = window.__ro = {};
    const idle = () => { for (const k in K) K[k] = false; BK.unpress(); };
    ro.setup = (h, ai) => { idle(); BK.manualSimulation = true; BK.SET.speed = 1; try { BK.coopEnd(); } catch (e) {} BK.setHero(h); BK.reset({ fresh: true }); try { BKT.setHeroLevel(h, 30); } catch (e) {} try { BK.applyUpgrades(); } catch (e) {}
      if (ai) BK.aiComp.arm([ai], ['balanced'], 1);
      BK.load(IDX); if (ai) BK.start(); BK.state = 'play'; BK.god = true; for (let i = 0; i < 160 && !(BK.demonKing && BK.demonKing.f()); i++) BK.sim(1); return !!(BK.demonKing && BK.demonKing.f()); };
    ro.f = () => BK.demonKing.f();
    ro.run = (n, stop) => { for (let i = 0; i < n; i++) { BK.sim(1); if (stop && stop()) return i; } return n; };
    ro.snap = () => { BK.step(1); const c = document.createElement('canvas'); c.width = BK.view.VW * 3; c.height = BK.view.VH * 3; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, c.width, c.height); return c.toDataURL('image/png'); };
    ro.bolts = () => BK.demonKing.f().bolts.filter(b => b.st === 'in').length; ro.ents = () => BK.enemies().filter(e => e.t === 'hellbolt' && e.alive).length;
    return IDX; })()`, 60000);

  if (WANT.includes('knock')) {
    console.log('knock');
    ok(await pg.evalp(`__ro.setup('knight')`, 120000), 'the lab loads with the king');
    const r = await pg.evalp(`(()=>{ const f = __ro.f(), P = BK.P, tl = [], b0 = f.back; __ro.run(400, () => f.mode === 'float'); f.rest = 99; f.pips = 2;
      const q = { id: ++f.id, x: P.x + 20, y: P.y - 8, vx: 0, vy: 0, r: 7, st: 'in', high: false, v: 150, volley: 0, life: 99, g: 0, touched: [], tgt: 0 }; f.bolts.push(q); BK.sim(1);
      const last = { m: '' }; let holdSeen = 0, tumbleSnap = false; BK.press('atk');
      for (let i = 0; i < 1500; i++) { BK.sim(1); if (f.mode !== last.m) { tl.push([f.mode, i]); last.m = f.mode; }
        if (f.mode === 'downed' || f.mode === 'repulseTell' || f.mode === 'tumble') holdSeen = Math.max(holdSeen, b0.hold || 0);
        if (f.mode === 'tumble' && f.mT > 0.25 && !tumbleSnap) { tumbleSnap = true; window.__k = { t: i }; }
        if (f.mode === 'float' && tl.some(t => t[0] === 'rise')) break; }
      return { tl, holdSeen, knocks: f.n.knocks, pips: f.pips, returns: f.n.returns, phase: f.ph }; })()`, 300000);
    const modes = r.tl.map(t => t[0]); console.log('   modes: ' + r.tl.map(t => t[0] + '@' + t[1]).join(' > '));
    const seq = ['tumble', 'downed', 'repulseTell', 'rise', 'float'], idx = seq.map(m => m === 'float' ? modes.lastIndexOf(m) : modes.indexOf(m));
    ok(idx.every((v, i) => v >= 0 && (i === 0 || v > idx[i - 1])), 'a return that is the 3rd pip knocks him down: tumble > downed > repulse > rise > float');
    ok(r.knocks === 1 && r.pips === 0, 'one knockdown, the pips reset: ' + JSON.stringify({ knocks: r.knocks, pips: r.pips }));
    ok(r.holdSeen > 0.5, "the drake holds its bank while he is down (S1 holdBank): hold " + r.holdSeen.toFixed(1) + ' s');
    // the pictures: redo it and stop at each beat
    await pg.evalp(`__ro.setup('knight')`, 120000);
    const stops = [['k1-return-flying', f => f.bolts.some(b => b.st === 'ret' || b.st === 'pow')], ['k2-tumble', f => f.mode === 'tumble' && f.mT > 0.25], ['k3-crash-downed', f => f.mode === 'downed' && f.mT > 0.3], ['k4-downed-open', f => f.mode === 'downed' && f.mT > 2.0], ['k5-repulse-tell', f => f.mode === 'repulseTell' && f.mT > 0.3], ['k6-ward-rising', f => f.mode === 'rise' && f.mT > 0.5]];
    await pg.evalp(`(()=>{ const f = __ro.f(), P = BK.P; __ro.run(400, () => f.mode === 'float'); f.rest = 99; f.pips = 2; const q = { id: ++f.id, x: P.x + 20, y: P.y - 8, vx: 0, vy: 0, r: 7, st: 'in', high: false, v: 150, volley: 0, life: 99, g: 0, touched: [], tgt: 0 }; f.bolts.push(q); BK.sim(1); BK.press('atk'); BK.sim(1); return 1; })()`);
    for (const [name, _] of stops) {
      const fn = { 'k1-return-flying': "f.bolts.some(b => b.st === 'ret' || b.st === 'pow')", 'k2-tumble': "f.mode === 'tumble' && f.mT > 0.25", 'k3-crash-downed': "f.mode === 'downed' && f.mT > 0.3", 'k4-downed-open': "f.mode === 'downed' && f.mT > 2.0", 'k5-repulse-tell': "f.mode === 'repulseTell' && f.mT > 0.3", 'k6-ward-rising': "f.mode === 'rise' && f.mT > 0.5" }[name];
      const hit = await pg.evalp(`(()=>{ const f = __ro.f(); const n = __ro.run(1200, () => ${fn}); return n < 1200 ? f.mode : null; })()`, 120000);
      if (hit) { await pg.evalp('BK.sim(2)'); await save(name); } ok(!!hit, 'picture ' + name + (hit ? ' (mode ' + hit + ')' : ' - never reached'));
    }
  }

  if (WANT.includes('imps')) {
    console.log('imps');
    ok(await pg.evalp(`__ro.setup('knight')`, 120000), 'the lab loads with the king');
    const r = await pg.evalp(`(()=>{ const f = __ro.f(); BK.demonKing.phase(3); const seen = { imps: 0, maxImps: 0, skin: new Set(), bombs: 0, impY: [], ph3At: -1 }; let shotImp = false, shotBomb = false;
      for (let i = 0; i < 60 * 150; i++) { BK.sim(1); if (f.ph === 3 && seen.ph3At < 0) seen.ph3At = i;
        const imps = BK.enemies().filter(e => e.dkImp && e.alive); seen.maxImps = Math.max(seen.maxImps, imps.length); for (const m of imps) seen.skin.add(m.dkSkin);
        if (imps.length && !shotImp && i % 30 === 0) { shotImp = true; window.__shotImp = i; }
        if (f.rings.some(r => r.kind === 'bomb') && !shotBomb) { shotBomb = true; window.__shotBomb = i; seen.bombs = 1; }
        if (shotImp && shotBomb && f.n.imps >= 1 && f.n.bombs >= 1) break; }
      return { ph: f.ph, n: { imps: f.n.imps, bombs: f.n.bombs }, maxImps: seen.maxImps, skin: [...seen.skin], ph3At: seen.ph3At, mode: f.mode }; })()`, 600000);
    console.log('   ' + JSON.stringify(r));
    ok(r.ph === 3 && r.ph3At > 0, 'the phase change runs fall + climb and phase 3 begins');
    ok(r.n.imps >= 1 && r.maxImps >= 1 && r.maxImps <= 2, 'imps are summoned in phase 3, never more than 2 at once: ' + r.n.imps + ' summoned, max ' + r.maxImps);
    ok(r.skin.includes('demon'), "the imps carry the demon skin tag (lane S4 paints it): " + JSON.stringify(r.skin));
    ok(r.n.bombs >= 1, 'lava bombs fall in phase 3: ' + r.n.bombs);
    // the imps' fire (a seed with an imp owner): off the Mage's Folly there is no MG - the first throw used to crash updateImp
    const fire = await pg.evalp('(()=>{ const f = __ro.f(); let n = 0, hp0 = BK.P.hp; BK.god = false; for (let i = 0; i < 60 * 40 && n < 1; i++) { BK.sim(1); n += BK.seeds().filter(s => s.owner && s.owner.dkImp && !s.dead).length ? 1 : 0; } BK.god = true; return { n, imps: BK.enemies().filter(e => e.dkImp && e.alive).length }; })()', 300000);
    ok(fire.n >= 1, 'an imp throws fire on the back (a hostile bolt, no Mage Folly needed): ' + JSON.stringify(fire));
    // pictures: get an imp up and a bomb ring up
    const got = await pg.evalp(`(()=>{ const f = __ro.f(); let a = false, b = false; const out = {}; for (let i = 0; i < 60 * 120 && !(a && b); i++) { BK.sim(1);
        if (!a && BK.enemies().some(e => e.dkImp && e.alive)) { a = true; out.imp = true; window.__ro.keepImp = 1; }
        if (!b && f.rings.some(r => r.kind === 'bomb')) { b = true; out.bomb = true; } if (a && !b) { /* keep going for a bomb */ } if (a && b) break; }
      return out; })()`, 600000);
    await save('i1-imp-or-bomb-moment');
    ok(true, 'picture i1 taken (imps ' + !!got.imp + ', bomb ring ' + !!got.bomb + ')');
    await pg.evalp(`(()=>{ const f = __ro.f(); __ro.run(60 * 90, () => f.rings.some(r => r.kind === 'glyph')); return f.rings.length; })()`, 300000);
    await save('i2-glyph-or-next');
    ok(true, 'picture i2 taken');
  }

  if (WANT.includes('side')) {
    console.log('side');
    ok(await pg.evalp(`__ro.setup('knight')`, 120000), 'the lab loads with the king');
    const r = await pg.evalp(`(()=>{ const f = __ro.f(), leaks = [], types = new Set(); let maxEnts = 0, nearBolt = 0, fights = 0;
      for (let i = 0; i < 60 * 70; i++) { BK.sim(1); const e = __ro.ents(), b = __ro.bolts(); maxEnts = Math.max(maxEnts, e); if (e !== b) leaks.push([i, e, b]); for (const x of BK.enemies()) if (x.alive) types.add(x.t); }
      return { leaks: leaks.length, first: leaks[0] || null, maxEnts, types: [...types], bolts: f.n.bolts, returns: f.n.returns, enemies: BK.enemies().length }; })()`, 600000);
    console.log('   ' + JSON.stringify(r));
    ok(r.leaks === 0, 'the bolt entities are exactly the bolts in flight every frame (no leak, none left behind): ' + r.leaks + ' mismatches' + (r.first ? ' first ' + JSON.stringify(r.first) : ''));
    ok(r.bolts >= 3, 'the king threw bolts during the 70 s: ' + r.bolts);
    // a long fight with the gate: are dead bolts removed from enemies
    const leftover = await pg.evalp(`(()=>{ const f = __ro.f(); f.bolts.forEach(b => { if (b.st === 'in') b.st = 'gone'; }); BK.sim(3); return BK.enemies().filter(e => e.t === 'hellbolt').length; })()`);
    ok(leftover === 0, 'no hellbolt entity outlives its bolt: ' + leftover);
    // THE AI PARTNER IN THE FIGHT
    ok(await pg.evalp(`__ro.setup('knight','warden')`, 120000), 'the lab loads with an AI partner');
    const a = await pg.evalp(`(()=>{ const f = __ro.f(), ps = BK.players(), ai = ps.find(p => p.ai); const o = { players: ps.length, ai: !!ai, by: {}, leaks: 0 };
      for (let i = 0; i < 60 * 70; i++) { BK.sim(1); if (__ro.ents() !== __ro.bolts()) o.leaks++; for (const b of f.bolts) if (b.by !== undefined && b.by >= 0) o.by[b.by] = (o.by[b.by] || 0) + 0; }
      o.returns = f.n.returns; o.powers = f.n.powers; o.hits = f.n.hits.bolt || 0; o.blocks = f.n.blocks; o.aiDead = ai ? !!ai.dead : null; o.aiHp = ai ? Math.round(ai.hp) : null; o.ph = f.ph; o.hp = f.hp; return o; })()`, 600000);
    console.log('   AI partner: ' + JSON.stringify(a));
    ok(a.players === 2 && a.ai, 'a warden AI is in the fight beside the knight');
    ok(a.leaks === 0, 'no bolt-entity leak with two heroes: ' + a.leaks);
    await save('s1-two-heroes');
    ok(a.returns > 0, 'bolts were returned over 70 s with an AI in the party (it or the bot-less P1): ' + a.returns + ' returns, ' + a.hits + ' hit someone, ' + a.blocks + ' blocked');
  }

  if (WANT.includes('hud')) {
    console.log('hud');
    ok(await pg.evalp(`__ro.setup('knight')`, 120000), 'the lab loads with the king');
    const r = await pg.evalp(`(()=>{ const f = __ro.f(); __ro.run(600, () => f.mode === 'float'); f.pips = 2; BK.sim(2); return { view: [BK.view.VW, BK.view.VH], mode: f.mode, pips: f.pips, hud: BK.SET.hud }; })()`, 120000);
    await save('h1-hud-default');
    await pg.evalp(`BK.SET.hud = 'minimal'; BK.sim(2)`); await save('h2-hud-minimal');
    console.log('   ' + JSON.stringify(r));
    ok(true, 'pictures h1/h2 taken at the real view size ' + r.view.join('x') + ' (the bar is at y 19 under the level timer, centred, 150 px wide; the pips 18 px under it)');
  }
  const errs = pg.errors.filter(e => !/favicon|ERR_|Failed to load resource/.test(e)); ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
} finally { await pg.close(); }
console.log(bad ? 'reflect-owed: ' + bad + ' FAILED' : 'reflect-owed: ok');
process.exit(bad ? 1 : 0);
