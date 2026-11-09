// tools/ft5-stills.mjs - FALLING TOWER 5 browser stills (claude/ft5stills). FT5 is switched on in the page (globalThis.__FT5) before the level builds.
// God mode, BK.tp + BK.step, 2x PNGs into <out>. Pictures are for eyes, not in the suite.
// usage: node tools/ft5-stills.mjs <outdir> [part ...]     parts: tower run arena folly   (default all)
//        node tools/ft5-stills.mjs <outdir> sheet <sheet.png>   (contact sheet from the PNGs in outdir, per <outdir>/sheet.json = [[file, label], ...])
import { openPage } from './cdp.mjs';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
const out = process.argv[2], parts = process.argv.slice(3); mkdirSync(out, { recursive: true });
const SHEET = existsSync(join(out, 'sheet.json')) ? JSON.parse(readFileSync(join(out, 'sheet.json'), 'utf8')) : [];
const pg = await openPage({ hints: 'none' });
const save = (name, d) => writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64'));
try {
  if (parts[0] === 'eval') { console.log(JSON.stringify(await pg.evalp('(async () => { globalThis.__FT5 = true; const { LEVELS } = await import("/src/level.js"); const step = n => { for (let k = 0; k < n; k++) BK.step(1); }; const fresh = id => { BK.setHero("knight"); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === id)); BK.start(); BK.god = true; step(300); }; ' + readFileSync(process.argv[4], 'utf8') + ' })()', 600000))); }
  else if (parts[0] === 'sheet') {
    const imgs = SHEET.map(([f, label]) => [label, existsSync(join(out, f + '.png')) ? 'data:image/png;base64,' + readFileSync(join(out, f + '.png')).toString('base64') : null]);
    const d = await pg.evalp(`(async () => { const imgs = ${JSON.stringify(imgs)}, cols = 4, tw = 480, th = 270, lab = 18, n = imgs.length, rows = Math.ceil(n / cols);
      const c = document.createElement('canvas'); c.width = cols * tw; c.height = rows * (th + lab); const g = c.getContext('2d'); g.fillStyle = '#10121a'; g.fillRect(0, 0, c.width, c.height); g.imageSmoothingEnabled = false;
      for (let i = 0; i < n; i++) { const [label, src] = imgs[i], x = (i % cols) * tw, y = Math.floor(i / cols) * (th + lab);
        if (src) { const im = new Image(); im.src = src; await im.decode(); g.drawImage(im, x, y + lab, tw - 2, th - 2); } else { g.fillStyle = '#331'; g.fillRect(x, y + lab, tw - 2, th - 2); g.fillStyle = '#fa6'; g.font = '14px monospace'; g.fillText('NOT CAPTURED', x + 10, y + lab + 30); }
        g.fillStyle = '#e8e2c8'; g.font = 'bold 12px monospace'; g.fillText(label, x + 4, y + 13); }
      return c.toDataURL('image/png'); })()`, 120000);
    writeFileSync(process.argv[4], Buffer.from(d.split(',')[1], 'base64')); console.log('sheet', process.argv[4], imgs.length, 'tiles');
  } else {
    const want = parts.length ? parts : ['tower', 'run', 'arena', 'folly'];
    const res = await pg.evalp(`(async () => {
      globalThis.__FT5 = true; const { LEVELS } = await import('/src/level.js'); const want = ${JSON.stringify(want)}, shots = [], notes = [];
      const snap = (name) => { const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360); shots.push([name, c.toDataURL('image/png')]); };
      const step = n => { for (let k = 0; k < n; k++) BK.step(1); };
      const fresh = (id) => { BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === id)); BK.start(); BK.god = true; step(900); };
      const at = (x, row, n = 60) => { BK.tp(x, row - 1); BK.P.face = 1; step(n); };
      const T = (name, f) => { try { f(); } catch (e) { notes.push(name + ': ' + (e && e.message)); } };
      const L = () => BK.L; const dismiss = () => { for (let k = 0; k < 1; k++) { for (const t of ['keydown', 'keyup']) window.dispatchEvent(new KeyboardEvent(t, { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true })); step(20); } };
      if (want.includes('tower')) { fresh('fallingtower');
        T('act1', () => { at(30, 309); snap('01-act1-library'); at(28, 276); snap('02-act1-reading-window'); });
        T('teach', () => { at(26, 312, 30); snap('03-teach-crumble-count'); step(150); snap('03b-teach-after'); });
        T('shelves', () => { at(50, 301, 5); step(30); snap('04-shelves-tell'); step(160); snap('05-shelves-lying'); });
        T('braced1', () => { at(22, 252, 90); snap('06-braced-reading'); });
        T('act2', () => { at(24, 242, 60); snap('07-act2-observatory'); });
        T('quick', () => { at(33, 239, 25); snap('08-quick-count'); step(60); snap('08b-quick-fell'); });
        T('dome', () => { at(54, 233, 5); step(30); snap('09-dome-tell'); step(160); snap('10-dome-ribs'); });
        T('shear', () => { const mv = () => (typeof BK.movers === 'function' ? BK.movers() : BK.movers).find(q => q.ft5 === 'shear'); BK.tp(30, 203); step(30); const hold = () => { const m = mv(); BK.P.x = m.x + m.w / 2; BK.P.y = m.y; BK.P.vy = 0; BK.P.vx = 0; }; for (let i = 0; i < 70; i++) { hold(); step(1); } snap('11-shear-tell'); for (let i = 0; i < 140; i++) { hold(); step(1); } step(10); snap('12-shear-landing'); notes.push('shear st ' + JSON.stringify(L().ft5.rt.pieces.shear)); });
        T('slab', () => { at(29, 165, 20); snap('13-slab-wait'); step(40); snap('13b-slab-tell'); step(70); snap('14-slab-slide'); });
        T('shaft', () => { fresh('fallingtower'); at(20, 221, 200); snap('15-poison-shaft-flood'); step(500); snap('16-poison-shaft-later'); for (let k = 0; k < 8; k++) { step(150); snap('17-poison-contact-' + k); } });
        T('bellfresh', () => { fresh('fallingtower'); });
        T('bell', () => { for (const e of BK.enemies()) if (e.t === 'sexton') { e.alive = false; e.hp = 0; } notes.push('sexton left ' + BK.enemies().filter(e => e.t === 'sexton' && e.alive).length); at(50, 153, 20); step(30); notes.push('bell st ' + JSON.stringify(L().ft5.rt.pieces.bell)); snap('19-bell-tell'); step(90); snap('20-bell-drop'); at(46, 155, 60); snap('21-bell-wedged'); at(71, 135, 60); snap('18-act3-bell-loft'); });
        T('snapchain', () => { at(77, 120, 5); step(24); snap('22-snap-chain'); step(60); snap('22b-snap-chain-after'); });
        T('treasury', () => { at(68, 123, 60); snap('23-act3-treasury'); at(46, 122, 5); snap('23b-treasury-slab'); });
        T('breach', () => { at(60, 102, 120); snap('24-act3-breach'); });
        T('harry', () => { at(66, 227, 10); step(150); snap('25-harry-ring'); });
        T('braced3', () => { at(78, 114, 90); snap('26-braced-treasury-ledge'); });
      }
      if (want.includes('run')) { fresh('fallingtower');
        T('outer', () => { at(104, 99, 60); snap('30-outer-face-climb'); });
        T('over', () => { at(112, 77, 5); step(40); snap('31-over-tell'); step(150); snap('32-over-after'); });
        T('run', () => { at(137, 63, 60); snap('33-run-windows'); at(148, 63, 60); snap('34-run-buttress'); at(162, 63, 5); step(20); snap('35-run-snap-chain'); step(60); snap('35b-run-snap-after'); });
        T('front', () => { at(150, 63, 360); snap('36-run-poison-front'); at(190, 63, 40); snap('37-run-slab-hop'); });
        T('crown', () => { at(222, 63, 90); snap('38-crown-to-arena'); });
      }
      if (want.includes('arena')) { fresh('fallingtower');
        const F = L().spireField, R = () => F.rt, boss = () => BK.boss;
        T('p1', () => { at(228, 63, 10); step(120); snap('40-p1-calm'); notes.push('boss mode ' + (boss() && boss().mode) + ' started ' + R().started); });
        T('tide', () => { const e = boss(); e.hp = Math.floor(e.maxHp * 0.84); step(50); snap('41-p1-tide-tell'); step(90); snap('42-p1-tide-rising'); step(200); snap('43-p1-tide-held'); notes.push('spires ' + JSON.stringify(R().spires.map(s => s.st))); });
        T('spire', () => { const e = boss(); e.hp = Math.floor(e.maxHp * 0.69); step(110); snap('44-p1-tide2-spire-tell'); step(120); snap('45-p1-spire-collapse'); });
        T('butt', () => { const bi = F.spires.findIndex((s, i) => s.buttress && R().spires[i].st === 'up'); if (bi < 0) throw new Error('no live buttress'); const s = F.spires[bi]; at(Math.floor((s.x0 + s.x1) / 2), s.top, 30); snap('46-buttress-live'); R().butt[bi].st = 'down'; R().butt[bi].t = 0; step(20); snap('47-buttress-down'); notes.push('buttress spire ' + s.id); });
        T('fade', () => { const e = boss(); e.hp = Math.floor(e.maxHp * 0.49); let got = {}; for (let i = 0; i < 900; i++) { step(1); const f = R().fade; if (f && got.a === undefined) got.a = i; if (got.a !== undefined) { const d = i - got.a; for (const [t, nm] of [[20, '48-fade-shimmer'], [70, '49-fade-clear'], [130, '50-fall'], [200, '51-fall-rugs'], [300, '52-caught']]) if (d === t) snap(nm); } if (BK.P.carpet && got.c === undefined) { got.c = i; snap('53-carpet-caught'); } if (got.c !== undefined && i - got.c > 200) break; } notes.push('fade got ' + JSON.stringify(got) + ' phase ' + R().phase + ' mode ' + (boss() && boss().mode)); });
        T('p2', () => { step(200); snap('54-p2-open-hall'); const e = boss(); e.hp = Math.floor(e.maxHp * 0.39); let k0 = -1; for (let i = 0; i < 1500; i++) { step(1); if (e.realm && k0 < 0) { k0 = i; } if (k0 >= 0 && i === k0 + 150) { snap('55-p2-fire-realm'); break; } } notes.push('fire realm at ' + k0 + ' kind ' + (e.realm && e.realm.kind));
          e.realm = null; e.realmN = 1; e.realmRest = 0; e.hp = Math.floor(e.maxHp * 0.19); k0 = -1; for (let i = 0; i < 1500; i++) { step(1); if (e.realm && k0 < 0) { k0 = i; } if (k0 >= 0 && i === k0 + 150) { snap('56-p2-ice-realm'); break; } } notes.push('ice realm at ' + k0 + ' kind ' + (e.realm && e.realm.kind)); });
        T('win', () => { const e = boss(); e.realm = null; let n = 0; for (; n < 60 && e.alive; n++) { e.realm = null; e.wardHold = 0; BK.env().hurt(e, 1e6, BK.P.x); step(15); } notes.push('boss alive ' + e.alive + ' mode ' + e.mode + ' after ' + n); step(60); dismiss(); step(140); snap('57-win-after-death'); step(300); snap('57b-win-later'); at(30, 6, 80); snap('58-win-sand-door'); });
      }
      if (want.includes('folly')) { fresh('mage');
        T('folly', () => { const A = BK.L.arena; BK.tp(Math.round(A.trigger / 16) + 2, A.floor / 16 - 1); let i = 0; for (; i < 900 && !(BK.bossActive && BK.boss && BK.boss.mode === 'idle'); i++) step(1); notes.push('folly boss ready after ' + i + ' ' + (BK.boss && BK.boss.mode)); step(60); snap('60-folly-before'); const e = BK.boss; e.stage = 3; e.hp = Math.floor(e.maxHp * 0.02); notes.push('folly start hp ' + e.hp + ' mode ' + e.mode); let n = 0; for (; n < 120 && e.alive; n++) { e.wardHold = 0; if (e.T) { e.T.ward = 99; e.T.blink = 99; e.T.bolt = 99; } BK.env().hurt(e, 40, BK.P.x); step(10); if (n % 20 === 0) notes.push('folly n' + n + ' hp ' + e.hp + ' stage ' + e.stage + ' mode ' + e.mode); } notes.push('folly alive ' + e.alive + ' after ' + n); step(30); dismiss(); step(20); snap('61-folly-lurch'); step(60); snap('61b-folly-lurch2'); step(120); snap('62-folly-after'); step(200); snap('63-folly-later'); });
      }
      return { shots, notes };
    })()`, 1500000);
    res.shots.forEach(([n, d]) => save(n, d)); console.log(res.shots.map(s => s[0]).join(' ')); console.log('NOTES', JSON.stringify(res.notes)); console.log('errors', JSON.stringify(pg.errors.slice(0, 6)));
  }
} finally { pg.close(); }
