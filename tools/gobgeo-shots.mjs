/* tools/gobgeo-shots.mjs [outDir] - THE GOBLIN GEOMANCER AND HIS REFLECTED ROCKS, PHOTOGRAPHED IN THE REAL PAGE (claude/gobgeo): the page's own buffer at 2x to
   work/claude/shots/gobgeo/ (or outDir) plus a contact sheet. One headless page (tools/cdp.mjs: it kills its own browser). Not in the suite.
   Each reflect use: the hero stands where the room puts him, the Geomancer tells and throws, and when his rock reaches the hero it is SENT BACK (the hands' own
   sendBack - the parry itself is tools/gobgeo.mjs's to prove); the stills catch the tell, the rock in flight, the rock going home, and what it smashed. */
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const dir = join(ROOT, process.argv[2] || 'work/claude/shots/gobgeo'); mkdirSync(dir, { recursive: true });
const pg = await openPage();
try {
  const d = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); const shots = {}; const info = [];
    const cv = document.createElement('canvas'); cv.width = 640; cv.height = 360; const cg = cv.getContext('2d'); cg.imageSmoothingEnabled = false;
    const sheet = document.createElement('canvas'); sheet.width = 1920; sheet.height = 360 * 9; const sg = sheet.getContext('2d'); sg.imageSmoothingEnabled = false; let n = 0;
    const snap = (id, label) => { cg.drawImage(BK.buf, 0, 0, 640, 360); shots[id] = cv.toDataURL('image/png'); const x = (n % 3) * 640, y = Math.floor(n / 3) * 360; sg.drawImage(BK.buf, x, y, 640, 360);
      sg.fillStyle = 'rgba(0,0,0,0.6)'; sg.fillRect(x, y, 640, 22); sg.fillStyle = '#ffd36b'; sg.font = '15px monospace'; sg.fillText((n + 1) + '. ' + label, x + 6, y + 16); n++; };
    const hold = () => { if (BK.state === 'card') BK.cardClose(); BK.P.hp = BK.P.maxHp; BK.P.vx = 0; };
    const fresh = () => { BK.PROG.xp = Object.assign(BK.PROG.xp || {}, { knight: 1e6 }); BK.setHero('knight'); BK.load(LEVELS.findIndex(l => l.id === 'crown')); BK.start(); BK.god = true; BK.sim(30); for (let k = 0; k < 200; k++) { hold(); BK.step(1); } };
    const G = () => BK.gobgeo();
    const geoNear = x => BK.enemies().filter(e => e.t === 'gobgeo' && e.alive).sort((a, b) => Math.abs(a.x - x * 16) - Math.abs(b.x - x * 16))[0];
    /* one reflect use: stand at (hx, hy) facing face; wait for his tell (snap), his rock near you (snap), send it back (snap mid-way), and after (snap) */
    const use = (key, hx, hy, face, geoX, label, after = 50, setup, every) => { fresh(); BK.tp(hx, hy); BK.P.face = face; if (setup) setup(); for (let k = 0; k < 20; k++) { hold(); BK.step(1); }
      const g = geoNear(geoX); if (g) g.cd = 0.2; let told = false, flying = false, back = false, t = 0;
      for (; t < 60 * 8; t++) { hold(); BK.P.face = face; if (every) every(); BK.step(1); const gg = geoNear(geoX);
        if (!told && gg && gg.mode === 'rockTell' && gg.modeT < 0.4) { snap(key + '-1tell', label + ': his tell (rock over his head)'); told = true; }
        const rocks = G().test.rocks() || []; const r = rocks.find(q => !q.back && q.kind === 'rock');
        if (told && !flying && r && Math.abs(r.x - BK.P.x) < 90) { snap(key + '-2rock', label + ': the rock comes'); flying = true; }
        if (flying && !back && r && Math.abs(r.x - BK.P.x) < 20 && Math.abs(r.y - (BK.P.y - 14)) < 30) { G().test.sendBack(r); back = true; for (let k = 0; k < 8; k++) { hold(); BK.step(1); } snap(key + '-3back', label + ': SENT BACK'); break; }
        if (gg && gg.mode === 'slateTell') gg.n = 0; }
      for (let k = 0; k < after; k++) { hold(); BK.step(1); } snap(key + '-4after', label + ': after');
      info.push({ key, told, flying, back, n: G().read().n }); };
    /* 0. the Geomancer himself, close (the shield beat's pair, before they move) */
    fresh(); BK.tp(447, 19); BK.P.face = 1; for (let k = 0; k < 120; k++) { hold(); BK.step(1); } snap('geo-0close', 'the shield-bearer and the Geomancer');
    use('teach', 438, 19, 1, 448, 'TEACH: the seal on the gate', 70);
    { for (let k = 0; k < 120; k++) { hold(); BK.step(1); } snap('teach-5open', 'TEACH: the gate up, after the seal'); }
    use('shield', 449, 19, 1, 458, 'SHIELD: the shield-bearer', 30);
    use('lamp', 460, 19, 1, 478, 'CHANDELIER', 90, () => { const h = BK.enemies().find(e => e.t === 'heavy' && Math.abs(e.x - 470 * 16) < 40); if (h) h.x = 471 * 16 + 8; for (const e of BK.enemies()) if (e.t === 'gobgeo' && e.x < 470 * 16) e.alive = false; });   /* the teach and shield Geomancers are behind you by now */
    use('secret', 549, 21, 1, 559, 'SECRET: tower 1, the old stone', 140, () => { for (const e of BK.enemies()) if (e.t === 'soldier' && Math.abs(e.x - 547 * 16) < 120) e.alive = false; }, () => { for (const e of BK.enemies()) if (e.alive && e.t !== 'gobgeo' && Math.abs(e.x - BK.P.x) < 200 && e.y > 15 * 16) e.alive = false; });   /* the walk's soldier and tower 1's wave walk into the line: out of the still */
    { BK.tp(558, 13); for (let k = 0; k < 40; k++) { hold(); BK.step(1); } snap('secret-5room', 'SECRET: inside the tower chamber'); }
    use('combined', 593, 21, 1, 604, 'COMBINED: tower 2 gate bell', 60); for (let k = 0; k < 140; k++) { hold(); BK.step(1); } snap('combined-5drop', 'COMBINED: the arch gate down on them');
    /* the frames in the page: kill one and photograph the heap; stagger one */
    fresh(); BK.tp(452, 19); for (let k = 0; k < 20; k++) { hold(); BK.step(1); } { const g = geoNear(458); if (g) { g.stagger = 1.4; g.orbit = 0; } for (let k = 0; k < 10; k++) { hold(); BK.step(1); } snap('geo-1stagger', 'staggered (orbit dropped)'); if (g) { BK.env().hurt(g, 999, g.x - 20); } for (let k = 0; k < 40; k++) { hold(); BK.step(1); } snap('geo-2dead', 'dead: the heap'); }
    return { shots, sheet: sheet.toDataURL('image/png'), n, info }; })()`);
  for (const [id, png] of Object.entries(d.shots)) writeFileSync(join(dir, id + '.png'), Buffer.from(png.split(',')[1], 'base64'));
  writeFileSync(join(dir, 'sheet.png'), Buffer.from(d.sheet.split(',')[1], 'base64'));
  console.log(dir, Object.keys(d.shots).length, 'shots'); for (const i of d.info) console.log(JSON.stringify(i)); console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
