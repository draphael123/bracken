// tools/paladin-d-proof.mjs - THE PALADIN REWORK, PROVED IN A PAGE (claude/paladin-d; a desktop proof, not in the suite).
//   usage: node tools/paladin-d-proof.mjs <outDir> [sections]     sections: poses,pips,hud,coop,foe,text,touch (default all)
//   poses  every baked pose frame of the mace Paladin against the maul set (the foe's): a frame that is identical to the maul frame has no mace kit in it, a frame with no
//          steel sun-shield pixel has no shield in it. Counted per key; the stills show them.
//   pips   UP+C at 0..5 pips on flat ground with a foe ahead: what flew, what was spent, what the foe took, what the buzz said (game state, not looks)
//   hud    the HUD plate at 0 / 2 / 3 / 4 / 5 pips (stills) + the meter prompt word
//   coop   two players: whose hammer, whose pips; knight+paladin, paladin+knight, paladin+paladin both pressing
//   foe    ?boss=church (the Lit Church Paladin) and ?boss=waymeet (the Crusader): drawn beside the hero; the church foe's set is the MAUL set (bakePaladin(.., true))
//   text   the controls-card rows for the Paladin (keyboard + pad words), the picker role / loop words
//   touch  ?touch=1: the Paladin's page as a phone shows it (a screenshot) and the card rows
// Stills are written to <outDir> (never into the repo). The page carries BRACKEN_QS like every tool page.
import { openPage } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const OUT = process.argv[2] || 'work/claude/shots/paladin-d', ONLY = process.argv[3] || 'poses,pips,hud,coop,foe,text,touch'; mkdirSync(OUT, { recursive: true });
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL', m); } else console.log('ok  ', m); };
const save = (name, d) => { if (!d) return; writeFileSync(join(OUT, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('wrote', join(OUT, name + '.png')); };
const PRE = `
  const { LEVELS } = await import('/src/level.js'); const HGm = await import('/src/holy-ground.js'), HG = HGm.HG;
  const PR = typeof BK.PROG === 'function' ? BK.PROG() : BKT.PROG; const K = BK.keys, none = () => { for (const k of ['left','right','up','down','jump','block','atk','dodge']) K[k] = false; };
  const sheet = (cells, cols, cw, ch) => { const c = document.createElement('canvas'); c.width = cols * cw; c.height = Math.ceil(cells.length / cols) * ch; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
    g.fillStyle = '#1a1a22'; g.fillRect(0, 0, c.width, c.height); cells.forEach((d, n) => { const x = (n % cols) * cw, y = Math.floor(n / cols) * ch; g.fillStyle = n % 2 ? '#3a4a46' : '#34443f'; g.fillRect(x, y, cw, ch); d(g, x, y); }); return c; };
  const boot = hero => { PR.sword = 'steel'; BK.SET.speed = 1; BK.setHero(hero); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'wood')); BK.start(); BK.god = false; BK.sim(200);
    const L0 = BK.L, W = L0.W, at = (x, y) => L0.grid[y * W + x]; let spot = null;
    for (let x0 = Math.floor(BK.P.x / 16) + 14; x0 < W - 40 && !spot; x0++) for (let y = 7; y < L0.H - 2 && !spot; y++) { let ok = true; for (let x = x0; x < x0 + 30 && ok; x++) ok = at(x, y + 1) === 1 && [0,1,2,3,4,5,6,7,8].every(k => at(x, y - k) === 0); if (ok) spot = [x0 + 8, y]; }
    return spot; };
  const clear = () => { for (const e of BK.enemies()) e.alive = false; for (const s of BK.seeds()) s.dead = true; };
  const home = (spot, face = 1) => { clear(); none(); if (BK.holyHands) BK.holyHands().clear(); BK.god = true; BK.tp(spot[0], spot[1]); BK.sim(40); BK.god = false; const P = BK.P; P.hp = P.maxHp; P.st = P.maxSt; P.light = 0; P.face = face; P.palHamCd = 0; BK.sim(2); };
  const foe = (spot, t, dx, hp = 900) => { const r = BK.spawnFoe({ t, x: spot[0] + dx, y: spot[1], face: -1 }); const f = Array.isArray(r) ? r[0] : r; if (f) { f.hp = f.maxHp = hp; f.cd = 99; f.stagger = 0; } return f; };
  const holy = () => BK.hammers().filter(m => m.holy);
`;
const pg = await openPage({ audio: false, fonts: false, seed: 7 });
const run = async (name, code, ms = 600000) => { try { return await pg.evalp(`(async()=>{${PRE}${code}})()`, ms); } catch (e) { fails++; console.log('FAIL section ' + name + ' threw: ' + String(e.message || e).slice(0, 300)); return null; } };
try {
  await pg.reload();
  if (ONLY.includes('poses')) {
    const R = await run('poses', `
      const C = await import('/src/chars.js'); const mace = C.bakePaladin({}), maul = C.bakePaladin({}, false, true);
      const px = f => { const c = document.createElement('canvas'); c.width = f.width; c.height = f.height; const g = c.getContext('2d'); g.drawImage(f, 0, 0); return g.getImageData(0, 0, f.width, f.height).data; };
      const rows = []; for (const k of Object.keys(mace.R)) { const a = [].concat(mace.R[k]), b = [].concat(maul.R[k] || []);
        a.forEach((f, i) => { const d = px(f); let sh = 0; for (let j = 0; j < d.length; j += 4) if (d[j + 3] > 200 && ((d[j] === 164 && d[j + 1] === 173 && d[j + 2] === 187) || (d[j] === 210 && d[j + 1] === 216 && d[j + 2] === 226))) sh++;
          const m = b[i]; let diff = -1; if (m) { const e = px(m); if (e.length === d.length) { diff = 0; for (let j = 0; j < d.length; j++) if (d[j] !== e[j]) diff++; } else diff = -2; } rows.push({ k, i, sh, diff }); }); }
      const foeKeys = Object.keys(maul.R).length; return { mace: HGm.PAL_MACE, nKeys: Object.keys(mace.R).length, foeKeys, rows };`);
    if (R) { const by = {}; for (const r of R.rows) (by[r.k] ||= []).push(r);
      ok(R.mace === true, 'PAL_MACE is ON in the page'); ok(R.nKeys === R.foeKeys, 'mace set and foe set carry the same ' + R.nKeys + ' pose keys');
      const noShield = [], same = []; for (const k of Object.keys(by)) { const z = by[k].filter(r => r.sh < 3).map(r => r.i), s = by[k].filter(r => r.diff === 0).map(r => r.i); if (z.length) noShield.push(k + '[' + z.join(',') + ']/' + by[k].length); if (s.length) same.push(k + '[' + s.join(',') + ']/' + by[k].length); }
      console.log('poses: ' + R.rows.length + ' frames in ' + R.nKeys + ' keys'); console.log('frames with NO steel shield pixel (<3): ' + (noShield.join(' ') || 'none')); console.log('frames IDENTICAL to the foe maul frame: ' + (same.join(' ') || 'none'));
      writeFileSync(join(OUT, 'poses.json'), JSON.stringify(R.rows)); ok(same.length === 0, 'no pose frame is the foe maul frame (every frame carries the mace kit)'); }
  }
  if (ONLY.includes('pips')) {
    const R = await run('pips', `
      const spot = boot('paladin'); if (!spot) return { err: 'no flat floor' }; const out = [];
      for (const pips of [0, 1, 2, 3, 4, 5]) for (const face of [1, -1]) { home(spot, face); const P = BK.P; P.light = pips * HG.conv.pip; const f = foe(spot, 'sprig', 5);
        if (f) { f.x = P.x + face * 70; f.y = P.y; f.face = -face; f.hp = f.maxHp = 900; f.cd = 99; } const hp0 = f ? f.hp : 0, u0 = PR.palSunUsed || 0, l0 = P.light;
        none(); K.up = true; K.block = true; BK.sim(3); K.block = false; BK.sim(1); K.up = false; const at3 = { h: holy().length, light: P.light, empty: +(P.palEmptyT || 0).toFixed(2) };
        let hamOwnerOK = holy().every(m => m.owner === P), maxH = holy().length, dir = holy()[0] ? holy()[0].dir : 0; for (let k = 0; k < 90; k++) { if (f && f.alive) { f.cd = 99; f.stagger = Math.max(f.stagger || 0, 0.1); } BK.sim(1); maxH = Math.max(maxH, holy().length); }
        out.push({ pips, face, light0: l0, light1: at3.light, hammers: maxH, hamDir: dir, ownerOK: hamOwnerOK, sunUsed: (PR.palSunUsed || 0) - u0, buzz: at3.empty, foeDmg: f ? Math.round(hp0 - f.hp) : null, foeAlive: f ? f.alive : null }); }
      return { out };`);
    if (R && R.err) { fails++; console.log('FAIL pips: ' + R.err); } else if (R) { for (const r of R.out) console.log('pips ' + r.pips + ' face ' + r.face + ': ' + JSON.stringify(r));
      const at = (p, k) => R.out.filter(r => r.pips === p).every(k);
      ok(at(0, r => r.hammers === 0 && r.sunUsed === 0 && r.light1 === 0 && r.buzz > 0), '0 pips: nothing flies, nothing spent, the buzz/red pips fire');
      ok(at(1, r => r.hammers === 0 && r.sunUsed === 0 && r.light1 === r.light0 && r.buzz > 0), '1 pip: nothing flies, nothing spent');
      ok(at(2, r => r.hammers === 0 && r.sunUsed === 0 && r.light1 === r.light0 && r.buzz > 0), '2 pips: nothing flies, nothing spent');
      ok(at(3, r => r.hammers === 1 && r.sunUsed === 0 && r.light0 - r.light1 === 3 * 20 && r.ownerOK && r.foeDmg > 0), '3 pips: ONE holy hammer, 3 pips spent, it hurt the foe');
      ok(at(4, r => r.hammers === 1 && r.sunUsed === 0 && r.light0 - r.light1 === 3 * 20 && r.ownerOK && r.foeDmg > 0), '4 pips: ONE holy hammer, 3 pips spent (1 left), it hurt the foe');
      ok(at(5, r => r.hammers === 0 && r.sunUsed === 1 && r.light1 < r.light0 && r.foeDmg > 0), '5 pips: SUNFALL (no hammer), the pips spent, it hurt the foe');
      ok(R.out.filter(r => r.pips >= 3 && r.pips <= 4).every(r => r.hamDir === r.face), 'the hammer flies the way he faces (both facings)'); }
  }
  if (ONLY.includes('hud')) {
    const R = await run('hud', `
      const spot = boot('paladin'); if (!spot) return { err: 'no flat floor' }; const cells = [], words = []; const VW = BK.view.VW, VH = BK.view.VH;
      for (const pips of [0, 1, 2, 3, 4, 5]) { home(spot, 1); BK.P.light = pips * HG.conv.pip + (pips === 1 ? 9 : 0); BK.sim(30); BK.step(1); const buf = BK.buf; const snap = document.createElement('canvas'); snap.width = 150; snap.height = 44; snap.getContext('2d').drawImage(buf, 0, 0, 150, 44, 0, 0, 150, 44);
        words.push({ pips, now: BK.P.light }); cells.push((g, x, y) => { g.imageSmoothingEnabled = false; g.drawImage(snap, 0, 0, 150, 44, x + 4, y + 16, 150 * 3, 44 * 3); g.fillStyle = '#ffd36b'; g.font = '12px monospace'; g.fillText(pips + ' pips (light ' + Math.round(BK.P.light) + ')', x + 6, y + 12); }); }
      return { words, png: sheet(cells, 2, 466, 160).toDataURL('image/png') };`);
    if (R && R.err) { fails++; console.log('FAIL hud: ' + R.err); } else if (R) save('hud-pips', R.png);
  }
  if (ONLY.includes('coop')) {
    const R = await run('coop', `
      const res = {}; const spot = boot('paladin'); if (!spot) return { err: 'no flat floor' };
      const kk = p => (p === BK.players()[0] ? K : p.keys), press = p => { kk(p).up = true; kk(p).block = true; }, rel = p => { kk(p).up = false; kk(p).block = false; };
      const trial = (name, h1, h2, pips1, pips2, who) => { BK.coopEnd(); const sp = boot(h1); BK.coopStart(h2, false); BK.sim(3); const [a, b] = BK.players(); clear(); BK.god = true; BK.tp(sp[0], sp[1]); b.x = a.x - 24; b.y = a.y; BK.sim(30); BK.god = false; a.hp = a.maxHp; b.hp = b.maxHp; a.light = pips1; b.light = pips2; a.palHamCd = 0; b.palHamCd = 0; a.face = 1; b.face = 1;
        const L1 = a.light, L2 = b.light; for (const p of who) press(p === 'a' ? a : b); BK.sim(3); for (const p of who) rel(p === 'a' ? a : b); BK.sim(2); const hs = holy(); const owners = hs.map(m => m.owner === a ? 'P1' : m.owner === b ? 'P2' : 'OTHER').sort();
        for (let k = 0; k < 20; k++) BK.sim(1); res[name] = { heroes: [a.hero, b.hero], hammers: hs.length, owners, p1Spent: L1 - a.light, p2Spent: L2 - b.light, p1pal: a.hero === 'paladin', p2pal: b.hero === 'paladin' }; BK.coopEnd(); };
      trial('knight+paladin, P2 throws', 'knight', 'paladin', 0, 60, ['b']);
      trial('paladin+knight, P1 throws', 'paladin', 'knight', 60, 0, ['a']);
      trial('paladin+paladin, both throw', 'paladin', 'paladin', 80, 60, ['a', 'b']);
      trial('paladin+paladin, only P2 throws', 'paladin', 'paladin', 100, 60, ['b']);
      return { res };`);
    if (R && R.err) { fails++; console.log('FAIL coop: ' + R.err); } else if (R) { for (const [k, v] of Object.entries(R.res)) console.log('coop ' + k + ': ' + JSON.stringify(v)); const r = R.res;
      ok(r['knight+paladin, P2 throws'].owners.join() === 'P2' && r['knight+paladin, P2 throws'].p2Spent === 60 && r['knight+paladin, P2 throws'].p1Spent === 0, 'knight + paladin: the hammer is P2s, 3 pips off P2');
      ok(r['paladin+knight, P1 throws'].owners.join() === 'P1' && r['paladin+knight, P1 throws'].p1Spent === 60, 'paladin + knight: the hammer is P1s, 3 pips off P1');
      ok(r['paladin+paladin, both throw'].owners.join() === 'P1,P2' && r['paladin+paladin, both throw'].p1Spent === 60 && r['paladin+paladin, both throw'].p2Spent === 60, 'two paladins: two hammers, one each, 3 pips off each');
      ok(r['paladin+paladin, only P2 throws'].owners.join() === 'P2' && r['paladin+paladin, only P2 throws'].p1Spent === 0 && r['paladin+paladin, only P2 throws'].p2Spent === 60, 'two paladins, P2 presses: only P2 throws and pays (P1 at five pips stays at five)'); }
  }
  if (ONLY.includes('text')) {
    const R = await run('text', `
      const CTL = await import('/src/controls.js'); const rows = CTL.cardRows({ hero: 'paladin' }); return { rows: rows.map(r => r.slice(0, 3)), ctl: typeof BK.controlsRows === 'function' ? BK.controlsRows().map(r => r.slice(0, 3)) : null };`);
    if (R) { for (const r of R.rows) console.log('card row: ' + JSON.stringify(r)); const all = JSON.stringify(R.rows);
      ok(/HAMMER/i.test(all) && /3-4|THREE OR FOUR|3 OR 4/i.test(all), 'the controls card names the hammer at 3-4 pips'); ok(!/SUN 5/.test(all), 'the controls card no longer says a TAP spends five pips on SUN');
      ok(/SUNFALL/i.test(all), 'the controls card names SUNFALL'); }
  }
  if (ONLY.includes('foe')) {
    for (const [id, tag] of [['church:mini', 'foe-church-mini'], ['waymeet', 'foe-waymeet'], ['waymeet:mini', 'foe-waymeet-mini'], ['church', 'foe-church']]) {
      await pg.send('Page.navigate', { url: 'http://localhost:' + pg.PORT + '/?boss=' + id + '&hero=paladin&nosw' }); await new Promise(r => setTimeout(r, 4000));
      let ready = false; for (let i = 0; i < 120 && !ready; i++) { ready = await pg.evalp('typeof window.BK === "object" && !!window.BK.lookPass && !!BK.P', 2000).catch(() => false); if (!ready) await new Promise(r => setTimeout(r, 500)); }
      const R = await pg.evalp(`(async()=>{ BK.manualSimulation = true; BK.SET.speed = 1; for (let i = 0; i < 240; i++) BK.sim(1); BK.step(1); const near = BK.enemies().filter(e => e.alive && Math.abs(e.x - BK.P.x) < 700).map(e => e.t + '@' + Math.round(e.x - BK.P.x)); const es = BK.enemies().filter(e => e.alive && (e.t === 'paladinboss' || e.t === 'crusader' || e.t === 'closedhelm' || e.boss || e.maxHp > 200)); const b = es.sort((p, q) => Math.abs(p.x - BK.P.x) - Math.abs(q.x - BK.P.x))[0];
        BK.god = true; for (let i = 0; i < 200; i++) BK.sim(1); BK.step(1); const VW = BK.view.VW, VH = BK.view.VH, cam = BK.cam, c = document.createElement('canvas'); c.width = 200; c.height = 90; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#000'; g.fillRect(0, 0, 200, 90);
        const o = document.createElement('canvas'); o.width = VW * 3; o.height = VH * 3; const og = o.getContext('2d'); og.imageSmoothingEnabled = false; og.drawImage(BK.buf, 0, 0, VW, VH, 0, 0, VW * 3, VH * 3);
        return { near, boss: b ? { t: b.t, x: Math.round(b.x), dist: Math.round(Math.abs(b.x - BK.P.x)) } : null, hero: BK.P.hero, png: o.toDataURL('image/png') }; })()`, 120000).catch(e => ({ err: String(e.message).slice(0, 200) }));
      console.log(tag + ': ' + JSON.stringify({ boss: R.boss, near: R.near, hero: R.hero, err: R.err })); if (R.png) save(tag, R.png); }
    const R2 = await pg.evalp(`(async()=>{ const C = await import('/src/chars.js'); const HGm = await import('/src/holy-ground.js'); const f = C.bakePaladin({}, false, true), m = C.bakePaladin({}); const px = c => { const k = document.createElement('canvas'); k.width = c.width; k.height = c.height; const g = k.getContext('2d'); g.drawImage(c, 0, 0); return g.getImageData(0, 0, c.width, c.height).data; };
      const sh = c => { const d = px(c); let n = 0; for (let j = 0; j < d.length; j += 4) if (d[j + 3] > 200 && ((d[j] === 164 && d[j + 1] === 173 && d[j + 2] === 187) || (d[j] === 210 && d[j + 1] === 216 && d[j + 2] === 226))) n++; return n; };
      const fi = [].concat(f.R.idle)[0], mi = [].concat(m.R.idle)[0]; return { mace: HGm.PAL_MACE, foeIdleShieldPx: sh(fi), heroIdleShieldPx: sh(mi), sprPaladinboss: !!(window.SPR && window.SPR.paladinboss) }; })()`).catch(e => ({ err: e.message }));
    console.log('foe set vs hero set: ' + JSON.stringify(R2)); ok(R2.foeIdleShieldPx === 0 && R2.heroIdleShieldPx > 3, 'the foe Paladin set (bakePaladin(.., true)) has NO sun shield pixel; the hero set has');
  }
  if (ONLY.includes('touch')) {
    await pg.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await pg.send('Emulation.setDeviceMetricsOverride', { width: 844, height: 390, deviceScaleFactor: 2, mobile: true });
    await pg.send('Page.navigate', { url: 'http://localhost:' + pg.PORT + '/?touch=1&nosw&noattract&hero=paladin' }); await new Promise(r => setTimeout(r, 4000));
    let ready = false; for (let i = 0; i < 120 && !ready; i++) { ready = await pg.evalp('typeof window.BK === "object" && !!window.BK.lookPass && !!BK.P', 2000).catch(() => false); if (!ready) await new Promise(r => setTimeout(r, 500)); }
    const R = await run('touch', `BK.manualSimulation = true; BK.SET.speed = 1; BK.setHero('paladin'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'wood')); BK.start(); BK.sim(120); BK.P.light = 60; BK.sim(20); BK.step(1);
      return { hero: BK.P.hero, touch: !!(window.BK.touchOn || (BK.touch && BK.touch.on)) , rows: typeof BK.controlsRows === 'function' ? BK.controlsRows().map(r => r.slice(0, 3)) : null };`);
    console.log('touch page: ' + JSON.stringify(R && { hero: R.hero, touch: R.touch })); if (R && R.rows) for (const r of R.rows.filter(r => /hammer|spend|ultim|sun/i.test(r.join(' ')))) console.log('touch card row: ' + JSON.stringify(r));
    const shot = await pg.send('Page.captureScreenshot', { format: 'png' }); if (shot && shot.data) save('touch-paladin', 'x,' + shot.data);
    await pg.send('Emulation.setDeviceMetricsOverride', { width: 0, height: 0, deviceScaleFactor: 0, mobile: false }); await pg.send('Emulation.setTouchEmulationEnabled', { enabled: false, maxTouchPoints: 1 });
  }
  if (pg.errors.length) console.log('page errors:', pg.errors.slice(0, 8));
} finally { pg.close(); }
console.log(fails ? 'paladin-d-proof: ' + fails + ' FAIL' : 'paladin-d-proof: PASS'); process.exit(fails ? 1 : 0);
