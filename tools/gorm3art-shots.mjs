// tools/gorm3art-shots.mjs - KING GORM 3 ART (claude/gorm3art): his new poses in the real fight, one still each (2x, the hero in frame), plus the baked-frame sheets.
//   PORT=<free port> node tools/gorm3art-shots.mjs <outdir> [tag]      (tag: 'after' | 'before', prefixes the file names; run it in the checkout you want to shoot)
// Stills: potTell / pot / pot in flight / pitch patch (the hero on a deck, the hall), sceptreTell / Out (low pass) / high pass / Catch, rageTell (plain crown, then split), enraged stand,
// burnChargeTell / run / end / fire trail. The sheets (frames x4, plain and ENRAGED set, the props) only exist from this lane on: tag 'after'. Not in the suite.
import { openPage } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = process.argv[2] || 'gorm3art-shots', tag = process.argv[3] || 'after'; mkdirSync(out, { recursive: true });
const save = (name, d) => { writeFileSync(join(out, tag + '-' + name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log(tag + '-' + name + '.png'); };
for (const PART of ['hall', 'glade']) { const pg = await openPage({ audio: false, fonts: false, seed: 7 });
try {
  const r = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); const res = [], note = {};
    BK.manualSimulation = true; BKT.setHeroLevel('knight', 9); BK.setHero('knight'); BK.reset({ fresh: false }); BK.load(LEVELS.findIndex(l => l.id === 'kings')); BK.state = 'play'; BK.god = false; BK.sim(10);
    const P = BK.P, step = n => { for (let i = 0; i < n; i++) { if (BK.state === 'card') BK.cardClose(); BK.sim(1); } }, keep = () => { P.hp = P.maxHp; P.dead = 0; };
    const king = () => BK.enemies().find(e => e.t === 'king');
    const snap = (name, x0, y0, w, h) => { BK.step(1); const c = document.createElement('canvas'); const Z = 3, sw = w || BK.view.VW, sh = h || BK.view.VH; c.width = sw * Z; c.height = sh * Z; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.view.buf, x0 || 0, y0 || 0, sw, sh, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    const until = (fn, max) => { for (let i = 0; i < max; i++) { keep(); if (fn()) return true; step(1); } return false; };
    const crop = e => { const cx = Math.round(e.x - BK.view.x), cy = Math.round(e.y - BK.view.y); return [Math.max(0, cx - 110), Math.max(0, cy - 120), 220, 150]; };
    const snapK = name => { const e = king(); const [a, b, w, h] = crop(e); snap(name, a, b, w, h); };
    const PART = '${PART}', up = fn => fn(); let b, saw = {};
    if (PART === 'hall') {
    BK.tp(426, 13); until(() => false, 400); b = king();
    until(() => BK.gorm().bows.length > 0, 600);
    const bw = BK.gorm().bows[0]; note.bow = bw ? [bw.x, bw.y] : null;
    if (bw) { for (const q of BK.enemies().filter(e => e.gormBow)) BKT.hurtEnemy(q, 999, q.x, false); }
    const deck = () => { P.x = bw.x + 30; P.y = bw.y; P.vx = 0; P.vy = 0; P.ground = true; };
    b.potT = 0; b.perchT = 2;
    for (let i = 0; i < 400; i++) { keep(); deck(); b.ward = 0; step(1); b = king();
      if (b.mode === 'potTell' && !saw.tell && b.modeT < 0.5) { saw.tell = 1; snap('potTell'); snapK('potTell-king'); }
      if (b.mode === 'pot' && !saw.pot) { saw.pot = 1; snap('pot'); snapK('pot-king'); }
      if (saw.pot && !saw.fl && BK.gorm().pots.length) { saw.fl = 1; step(20); snap('pot-flight'); }
      if (saw.fl && !saw.patch && BK.gorm().pitch.length) { saw.patch = 1; step(10); snap('pitch-patch'); break; } }
    note.pot = saw; }
    if (PART === 'glade') {
    BK.gorm().skipTo('glade'); BK.tp(650, 13); keep(); for (let i = 0; i < 500; i++) { keep(); step(1); } b = king();
    note.glade = { stage: b.stage, mode: b.mode, x: Math.round(b.x), hp: b.hp, max: b.maxHp };
    const settle = () => { for (let i = 0; i < 90; i++) BK.step(1); }; P.x = b.x - 150; P.y = b.y - 1; settle();
    const hold = (fn, max) => { for (let i = 0; i < max; i++) { keep(); b.ward = 0; b.open = 0; if (fn()) return true; step(1); b = king(); } return false; };
    b.club = true; b.sceptreT = 0; b.burnT = 99; b.mode = 'walk'; b.modeT = 1; saw = {};
    hold(() => { P.x = b.x - 150; P.y = b.y - 1; P.vx = 0; P.vy = 0; if (b.mode === 'sceptreTell' && !saw.t && b.modeT < 0.4) { saw.t = 1; snap('sceptre-tell'); snapK('sceptre-tell-king'); }
      if (b.mode === 'sceptreOut' && !saw.o) { saw.o = 1; step(14); snap('sceptre-out'); snapK('sceptre-out-king'); }
      if (saw.o && !saw.h && BK.gorm().sceptres.length && BK.gorm().sceptres[0].u > 0.6) { saw.h = 1; snap('sceptre-high-back'); }
      if (b.mode === 'sceptreCatch' && !saw.c) { saw.c = 1; step(4); snap('sceptre-catch'); snapK('sceptre-catch-king'); return true; } return false; }, 900);
    note.sc = saw;
    /* ---- THE ENRAGE ---- */
    b.mode = 'walk'; b.modeT = 1; b.sceptreT = 99; b.burnT = 99; b.hp = Math.floor(b.maxHp * 0.24); saw = {};
    hold(() => { P.x = b.x - 150; P.y = b.y - 1; P.vx = 0; P.vy = 0; if (b.mode === 'rageTell') { if (!saw.a && b.rageT > 0.4) { saw.a = 1; snapK('rage-tell-a'); } if (!saw.b && b.rageT > 1.2) { saw.b = 1; snapK('rage-tell-b'); snap('rage-tell-wide'); } if (!saw.c && b.rageT > 1.9) { saw.c = 1; snapK('rage-tell-c'); } } return saw.c; }, 400);
    note.rage = saw; hold(() => b.mode === 'walk' || b.mode === 'sleep' ? true : false, 600); b.mode = 'walk'; b.modeT = 1; step(2); P.x = b.x - 90; snapK('enraged-stand'); snap('enraged-wide');
    /* ---- THE BURNING CHARGE ---- */
    b.rageBoar = true; b.lastHorn = true; b.huntN = 99; b.clubT = 99; b.logT = 99; b.quakeT = 99; b.burnT = 0; b.mode = 'walk'; b.modeT = 0; saw = {};
    hold(() => { P.x = b.face > 0 ? b.x - 180 : b.x + 180; P.y = b.y - 1; P.vx = 0; P.vy = 0; if (b.mode === 'burnChargeTell' && !saw.t && b.modeT < 0.5) { saw.t = 1; snap('burning-charge-tell'); snapK('burning-charge-tell-king'); }
      if (b.mode === 'burnCharge' && !saw.r) { saw.r = 1; step(8); snapK('burning-charge-run-a'); step(3); snapK('burning-charge-run-b'); step(3); snapK('burning-charge-run-c'); }
      if (b.mode === 'burnChargeEnd' && !saw.e) { saw.e = 1; step(6); snapK('burning-charge-end'); snap('burning-charge-trail'); return true; } return false; }, 900);
    note.charge = saw;
    }
    return { res, note }; })()`, 600000);
  console.log(JSON.stringify(r.note));
  for (const [n, d] of r.res) save(n, d);
  if (tag === 'after' && PART === 'hall') {
    const sheet = await pg.evalp(`(async () => { const F = await import('/src/redraw/gorm_frames.js'); const P = await import('/src/redraw/gorm_poses.js');
      const names = ['potTellUp', 'potUp', 'sceptreTell', 'sceptreOut', 'sceptreCatch', 'rageTell', 'burnChargeTell', 'bc0', 'bc1', 'bc2', 'bc3', 'burnChargeEnd', 'stand', 'walkClub'], Z = 3, cw = 176, ch = 100, cols = 4;
      const mk = (set, label) => { const rows = Math.ceil(names.length / cols), c = document.createElement('canvas'); c.width = cols * cw * Z; c.height = rows * ch * Z; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#4a5a3a'; g.fillRect(0, 0, c.width, c.height); g.font = '12px monospace';
        names.forEach((n, i) => { const x = (i % cols) * cw * Z, y = Math.floor(i / cols) * ch * Z, f = set.R[F.upFrame(n)]; g.fillStyle = '#5a6a48'; g.fillRect(x + 2, y + 2, cw * Z - 4, ch * Z - 4); g.drawImage(f, x, y, f.width * Z, f.height * Z); g.fillStyle = '#fff'; g.fillText(label + ' ' + n, x + 6, y + 14); g.fillStyle = '#f33'; g.fillRect(x + set.ax * Z, y + set.ay * Z - 2, 6, 3); });
        return c.toDataURL('image/png'); };
      const seat = () => { const S = F.SEAT.set, nm = ['potTell', 'pot', 'grabTell', 'idle'], c = document.createElement('canvas'); c.width = nm.length * 128 * Z; c.height = 64 * Z; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#4a5a3a'; g.fillRect(0, 0, c.width, c.height); g.font = '12px monospace';
        nm.forEach((n, i) => { const f = S.R[F.seatFrame(n)]; g.drawImage(f, i * 128 * Z, 0, f.width * Z, f.height * Z); g.fillStyle = '#fff'; g.fillText(n, i * 128 * Z + 6, 14); }); return c.toDataURL('image/png'); };
      const props = () => { const c = document.createElement('canvas'); c.width = 12 * 30 * Z; c.height = 2 * 30 * Z; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#4a5a3a'; g.fillRect(0, 0, c.width, c.height);
        for (let k = 0; k < 4; k++) { const p = F.potProp(k / 1.3 + 0.01); g.drawImage(p.c, k * 30 * Z, 0, p.c.width * Z, p.c.height * Z); }
        for (let k = 0; k < 8; k++) { const p = F.sceptreProp(k * Math.PI / 4); g.drawImage(p.c, (4 + k) * 30 * Z, 0, p.c.width * Z, p.c.height * Z); } return c.toDataURL('image/png'); };
      return { plain: mk(F.UP.set, 'plain'), rage: mk(F.UPR.set, 'ENRAGED'), seat: seat(), props: props() }; })()`, 120000);
    for (const k of Object.keys(sheet)) save('sheet-' + k, sheet[k]);
  }
  console.log('page errors:', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); } }
