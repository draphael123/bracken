// tools/palart-shots.mjs - PALADIN 2 ART (claude/palart; not in the suite): contact sheets of the Paladin's new pieces, in the game.
//   usage: PORT=8900 node tools/palart-shots.mjs <tag>   -> work/claude/shots/palart/<tag>-poses.png, -circle.png, -throw.png, -smite.png, -aegis.png, -hud.png
// Each cell is a 3x crop round the paladin's feet, labelled; the sim runs with the real keys on flat Stockade floor.
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'after', out = join(ROOT, 'work/claude/shots/palart'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false, fonts: false, seed: 7 });
const save = (name, d) => { writeFileSync(join(out, tag + '-' + name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('work/claude/shots/palart/' + tag + '-' + name + '.png'); };
try {
  await pg.reload();
  const R = await pg.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js'); const res = {};
    BK.SET.speed = 1; BK.setHero('paladin'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === '${process.env.LV || 'wood'}')); BK.start(); BK.god = false; BK.sim(200);
    const ONLY = '${process.env.ONLY || "poses,circle,throw,smite,aegis,hud"}'; const L0 = BK.L, W = L0.W, at = (x, y) => L0.grid[y * W + x]; let spot = null;
    for (let x0 = Math.floor(BK.P.x / 16) + 14; x0 < W - 40 && !spot; x0++) for (let y = 7; y < L0.H - 2 && !spot; y++) { let ok = true; for (let x = x0; x < x0 + ${process.env.SPOTW || 30} && ok; x++) ok = at(x, y + 1) === 1 && [0,1,2,3,4,5,6,7,8].every(k => at(x, y - k) === 0); if (ok) spot = [x0 + ${(process.env.SPOTW || 30) / 2 | 0}, y]; }
    if (!spot) return { err: 'no flat floor' };
    const K = BK.keys, none = () => { for (const k of ['left','right','up','down','jump','block','atk']) K[k] = false; };
    const clear = () => { for (const e of BK.enemies()) e.alive = false; for (const s of BK.seeds()) s.dead = true; };
    const home = () => { clear(); none(); BK.holyHands().clear(); BK.god = true; BK.tp(spot[0], spot[1]); BK.sim(40); BK.god = false; const P = BK.P; P.hp = P.maxHp; P.st = P.maxSt; P.light = 0; P.face = 1; BK.sim(2); };
    const tap = (o = {}) => { none(); if (o.up) K.up = true; K.block = true; BK.sim(3); K.block = false; BK.sim(1); K.up = false; };
    const mk = (cols, cw, ch, n) => { const c = document.createElement('canvas'); c.width = cols * cw; c.height = Math.ceil(n / cols) * ch; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#1a1a22'; g.fillRect(0, 0, c.width, c.height); return { c, g, cols, cw, ch, i: 0, CW: cw / 3, CH: ch / 3 }; };
    const VW = BK.view.VW, VH = BK.view.VH, Z = 3, CW = 64, CH = 36;   /* crop: 64 x 36 game px round the feet */
    const cell = (S, label, ox = 0, oy = 0) => { const x = (S.i % S.cols) * S.cw, y = Math.floor(S.i / S.cols) * S.ch; S.i++;
      const CW = S.CW, CH = S.CH, cam = BK.cam, px = BK.P.x - cam[0] + ox, py = BK.P.y - cam[1] + oy; S.g.drawImage(BK.buf, Math.max(0, Math.min(VW - CW, Math.round(px - CW / 2 + (S.sx || 0)))), Math.max(0, Math.min(VH - CH, Math.round(py - CH + 8))), CW, CH, x, y, S.cw, S.ch);
      S.g.fillStyle = '#ffd36b'; S.g.font = '11px monospace'; S.g.fillText(label, x + 4, y + 12); S.g.strokeStyle = '#333'; S.g.strokeRect(x + 0.5, y + 0.5, S.cw - 1, S.ch - 1); };
    const shot = (S, label, f = 1, o = {}) => { BK.sim(f); BK.step(1); cell(S, label, o.ox, o.oy); };
    const ZW = CW * Z, ZH = CH * Z;
    /* ---- POSES: the sprite frames themselves ---- */
    if (ONLY.includes('poses')) { const C = await import('/src/chars.js'); const SP = C.bakePaladin(); const R = SP.R; res.keys = Object.keys(R);
      const want = [['idle',0],['hallow',0],['hallow',1],['sanctify',0],['sanctify',1],['sanctify',2],['hurlH',0],['hurlH',1],['windup',0],['windup',1],['windup',2],['heavy',0],['heavy',1],['overhead',0],['overhead',1]].filter(([k,i]) => R[k] && R[k][i]);
      const S = mk(5, 220, 190, want.length); const z = 4;
      want.forEach(([k, i], n) => { const f = R[k][i], x = (n % 5) * 220, y = Math.floor(n / 5) * 190; S.g.fillStyle = (n % 2) ? '#2a2a34' : '#22222c'; S.g.fillRect(x, y, 220, 190); S.g.drawImage(f, x + 4, y + 16, f.width * z, f.height * z); S.g.fillStyle = '#ffd36b'; S.g.font = '12px monospace'; S.g.fillText(k + ' ' + i + ' ' + f.width + 'x' + f.height, x + 4, y + 12); });
      res.poses = S.c.toDataURL('image/png'); }
    /* ---- THE CIRCLE: plant, steady, empowered, going out ---- */
    if (ONLY.includes('circle')) { const S = mk(3, 360, 150, 18); S.CW = 120; S.CH = 50;
      home(); shot(S, 'before'); tap(); for (const [l, f] of [['plant +0.03s', 1], ['+0.1s', 4], ['+0.2s', 6], ['+0.35s', 9], ['+0.6s', 15], ['+1s', 24]]) shot(S, l, f);
      BK.sim(30); shot(S, 'steady');
      BK.P.light = 60; BK.sim(60); tap(); for (const [l, f] of [['EMPOWER +0.03s', 1], ['+0.15s', 8], ['+0.4s', 15], ['+1s', 36]]) shot(S, l, f);
      shot(S, 'empowered', 20);
      BK.holyHands().list()[0].life = 1.4; for (const f of [1, 8, 6, 8]) shot(S, 'going out', f);
      res.circle = S.c.toDataURL('image/png'); }
    /* ---- THE CIRCLE, close: the sigil at 6x (steady, empowered, going out half dark) ---- */
    if (ONLY.includes('circlez')) { const S = mk(1, 720, 300, 3); S.CW = 120; S.CH = 50; home(); tap(); BK.sim(60); shot(S, 'steady 6x', 1); BK.P.light = 60; BK.sim(30); tap(); BK.sim(70); shot(S, 'empowered 6x', 1); BK.holyHands().list()[0].life = 0.8; shot(S, 'going out 6x', 1); res.circlez = S.c.toDataURL('image/png'); }
    /* ---- THE THROW ---- */
    if (ONLY.includes('throw')) { const S = mk(3, 384, 150, 12); S.CW = 128; S.CH = 50; S.sx = 30; home(); tap(); BK.P.light = 60; BK.sim(20);
      const [f] = BK.spawnFoe({ t: 'sprig', x: spot[0] + 5, y: spot[1], face: -1 }); f.hp = f.maxHp = 900; f.stagger = 99;
      shot(S, 'before'); tap({ up: true }); for (let n = 0; n < 11; n++) { f.x = (spot[0] + 5) * 16 + 8; f.stagger = 99; shot(S, 'throw +' + ((n * 8 + 4) / 60).toFixed(2) + 's', n === 0 ? 1 : 8); }
      res.throw = S.c.toDataURL('image/png'); }
    /* ---- SMITE vs the plain overhead ---- */
    if (ONLY.includes('smite')) { const S = mk(3, 384, 150, 20); S.CW = 128; S.CH = 50; S.sx = 30; const heavy = label => { none(); K.atk = true; BK.sim(8); for (let i = 0; i < 4; i++) shot(S, label + ' hold', 6); K.atk = false; for (const [l, f] of [['rel +1', 1], ['+3', 2], ['+6', 3], ['+10', 4], ['+16', 6], ['+26', 10]]) shot(S, label + ' ' + l, f); };
      home(); BK.P.light = 60; heavy('plain'); home(); tap(); BK.P.light = 60; BK.sim(60); heavy('SMITE');
      res.smite = S.c.toDataURL('image/png'); }
    /* ---- AEGIS COVERS A PARTNER ---- */
    if (ONLY.includes('aegis')) { const S = mk(3, 384, 160, 8); S.CW = 96; S.CH = 40; S.sx = 18; home(); BK.coopStart('knight', false); BK.sim(2); BK.holyHands().clear(); BK.god = true; BK.tp(spot[0], spot[1]); BK.sim(40); BK.god = false; tap(); BK.sim(20); const [a, b] = BK.players();
      const place = dx => { b.x = a.x + dx; b.y = a.y; b.vx = 0; b.hurt = 0; b.inv = 0; b.hp = b.maxHp; b.ground = true; }; const shot2 = (S, l, f = 1) => { for (let i = 0; i < f; i++) { place(40); BK.sim(1); } place(40); BK.step(1); cell(S, l); };
      none(); K.block = true; BK.sim(30); place(40); res.dbg = { circles: BK.holy().circles, aegis: !!a.aegis, ax: a.x, bx: b.x, hero: a.hero }; shot2(S, 'aegis up', 2); shot2(S, 'aegis up', 20);
      BK.holyHurt(b, b.x + 30, 12, {}); for (const [l, f] of [['covered +0.02s', 1], ['+0.07s', 3], ['+0.12s', 3], ['+0.25s', 8], ['+0.5s', 15]]) shot2(S, l, f);
      K.block = false; BK.sim(30); shot(S, 'aegis down'); BK.coopEnd(); res.aegis = S.c.toDataURL('image/png'); }
    /* ---- THE HUD ---- */
    if (ONLY.includes('hud')) { home(); const S = mk(2, 480, 150, 4); const hud = (l, v) => { BK.P.light = v; BK.sim(2); BK.step(1); const x = (S.i % 2) * 480, y = Math.floor(S.i / 2) * 150; S.i++; S.g.drawImage(BK.buf, 0, 0, 80, 40, x, y, 480, 150 - 12); S.g.fillStyle = '#ffd36b'; S.g.font = '11px monospace'; S.g.fillText(l, x + 4, y + 146); };
      hud('light 0', 0); hud('light 22', 22); hud('light 30', 30); hud('light 100', 100); res.hud = S.c.toDataURL('image/png'); }
    none(); return res; })()`, 300000);
  if (R.err) { console.log('FAIL ' + R.err); process.exitCode = 1; }
  else { for (const k of ['poses', 'circle', 'circlez', 'throw', 'smite', 'aegis', 'hud']) if (R[k]) save(k, R[k]); if (process.env.KEYS) console.log(R.keys.join(' ')); if (R.dbg) console.log(JSON.stringify(R.dbg)); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} catch (e) { console.log('FAIL the page: ' + e.message); process.exitCode = 1; }
finally { pg.close(); }
