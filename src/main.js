// BRACKEN — a 16-bit forest platformer with a knight, a sword, a shield, and a plunge.
import { canvas, mulberry, fromGrid, outline } from './px.js';
import * as ART from './art.js';
import { bakeKnight, bakeSprig, bakeShield, bakeSpitter, bakeSpitterParts, bakeWasp, bakeSeed, bakeThornback, bakeQueen, bakeArcher, bakeBird, bakeFrog, bakeHopper } from './chars.js';
import { LEVELS, T, TS } from './level.js';
import { initAudio, SFX, music, ambient, ready as audioReady, setVolume, setSfxFiles, setMusicVolume } from './audio.js';

// ---------- display ----------
const VW = 320, VH = 180;
const disp = document.getElementById('c');
const dg = disp.getContext('2d');
const [buf, g] = canvas(VW, VH);
let S = 3, offX = 0, offY = 0, scanPat = null;
function resize() {
  disp.width = innerWidth || 1280; disp.height = innerHeight || 720;
  S = Math.max(1, Math.floor(Math.min(disp.width / VW, disp.height / VH)));
  let cap = 'auto'; try { cap = SET.scale; } catch {} // SET is declared below; the first resize runs before it exists
  if (cap !== 'auto') S = Math.min(S, cap);
  scanPat = null;
  offX = Math.floor((disp.width - VW * S) / 2); offY = Math.floor((disp.height - VH * S) / 2);
  dg.imageSmoothingEnabled = false;
}
addEventListener('resize', resize); resize();
const q = new URLSearchParams(location.search);

// ---------- settings + progress ----------
const SET = { music: true, sfx: 0.5, musicVol: 0.8, shake: true, sfxFiles: true, hitstop: true, numbers: true, timer: true, ambient: true, difficulty: 'normal', swapZX: false, scanlines: false, scale: 'auto' };
const DIFF = { easy: { take: 0.6, ehp: 0.8, label: 'EASY' }, normal: { take: 1, ehp: 1, label: 'NORMAL' }, hard: { take: 1.4, ehp: 1.3, label: 'HARD' } };
const DIFFS = ['easy', 'normal', 'hard'], SCALES = ['auto', 2, 3, 4];
try { Object.assign(SET, JSON.parse(localStorage.getItem('bracken.settings') || '{}')); } catch {}
function saveSettings() { try { localStorage.setItem('bracken.settings', JSON.stringify(SET)); } catch {} }
function applySettings() { setVolume(SET.sfx); setMusicVolume(SET.musicVol); music.set(SET.music); setSfxFiles(SET.sfxFiles); resize(); }
applySettings();
const PROG = {};
try { Object.assign(PROG, JSON.parse(localStorage.getItem('bracken.progress') || '{}')); } catch {}
PROG.coins = PROG.coins || 0; PROG.skins = PROG.skins || { bracken: true }; PROG.skin = PROG.skin || 'bracken'; PROG.swords = PROG.swords || { steel: true }; PROG.sword = PROG.sword || 'steel'; PROG.items = PROG.items || {};
function saveProgress() { try { localStorage.setItem('bracken.progress', JSON.stringify(PROG)); } catch {} }

// ---------- tuning ----------
const RUN = 100, GRAV = 1000, JUMPV = -320, POGO = -330;
const SWORD_DMG = 10, PLUNGE_DMG = 20;
const DMG = { sprig: 20, shield: 25, spit: 15, wasp: 15, thorn: 30, spike: 20, seed: 15, spined: 20, queen: 30, wave: 20, venom: 18, archer: 15, arrow: 18, frog: 25, tongue: 25, hopper: 15, crown: 15 };
const EHP = { sprig: 10, shield: 20, spit: 10, wasp: 10, thorn: 30, queen: 220, archer: 10, frog: 340, hopper: 10 };
const ST = { swing: 12, plunge: 15, dodge: 25, blockHit: 16, hold: 9, regen: 48, delay: 0.5 };

// ---------- bake ----------
const SKINS = [
  { id: 'bracken', name: 'BRACKEN BLUE', price: 0, pal: {} },
  { id: 'black', name: 'BLACK KNIGHT', price: 30, pal: { b: '#2a2a34', B: '#15151c', r: '#c9463d', y: '#c9d1dc' } },
  { id: 'purple', name: 'VIOLET KNIGHT', price: 40, pal: { b: '#6a3aa0', B: '#40206a', r: '#ffd36b', y: '#ffd36b' } },
  { id: 'blue', name: 'RIVER BLUE', price: 50, pal: { b: '#2f7fe0', B: '#1f4fa0', r: '#fff6e0', y: '#e0b040' } },
];
const SWORDS = [
  { id: 'steel', name: 'STEEL', price: 0, pal: {} },
  { id: 'ember', name: 'EMBER BLADE', price: 25, pal: { s: '#ffb060', S: '#b8541c' } },
  { id: 'frost', name: 'FROST BLADE', price: 35, pal: { s: '#bfe6f5', S: '#4fa0c8' } },
  { id: 'gilded', name: 'GILDED BLADE', price: 45, pal: { s: '#ffe27a', S: '#c9962a' } },
];
const UPGRADES = [
  { id: 'heart', name: 'HEART OF OAK', price: 60, desc: '+25 max health' },
  { id: 'wind', name: 'SECOND WIND', price: 60, desc: '+30 max stamina' },
];
const STORE_TABS = [{ name: 'SKINS', items: SKINS, key: 'skin', owned: 'skins' }, { name: 'SWORDS', items: SWORDS, key: 'sword', owned: 'swords' }, { name: 'UPGRADES', items: UPGRADES, key: null, owned: 'items' }];
const skinById = id => SKINS.find(k => k.id === id) || SKINS[0];
const swordById = id => SWORDS.find(k => k.id === id) || SWORDS[0];
let K = bakeKnight();
function applySkin() { K = bakeKnight(Object.assign({}, skinById(PROG.skin).pal, swordById(PROG.sword).pal)); }
function applyUpgrades() { P.maxHp = 100 + (PROG.items.heart ? 25 : 0); P.maxSt = 100 + (PROG.items.wind ? 30 : 0); }
const SPR = { sprig: bakeSprig(), shield: bakeShield(), spit: bakeSpitter(), wasp: bakeWasp(), seed: bakeSeed(), thorn: bakeThornback(), queen: bakeQueen(), archer: bakeArcher(), frog: bakeFrog(), hopper: bakeHopper() };
const BIRD = bakeBird();
const PARTS = bakeSpitterParts();
const PAL0 = Object.assign({}, ART.C);
let TILE, PROP, BG;
function bakeAll(pal = {}) {
  Object.assign(ART.C, PAL0, pal);
  TILE = {
    dirt: [0, 1, 2, 3].map(i => ART.bakeDirt(10 + i)), top: {}, edge: {},
    log: [0, 1, 2].map(i => ART.bakeLog(50 + i)), logL: ART.bakeLogEnd(60, false), logR: ART.bakeLogEnd(61, true),
    thorns: [0, 1, 2, 3].map(i => ART.bakeThorns(70 + i)), crate: ART.bakeCrate(), roots: [0, 1, 2].map(i => ART.bakeDirtRoots(80 + i)),
    reeds: [0, 1, 2].map(i => ART.bakeReeds(90 + i)), silt: [0, 1, 2].map(i => ART.bakeSilt(85 + i)), vine: [0, 1, 2, 3].map(i => ART.bakeVineWall(95 + i)),
  };
  for (const eL of [0, 1]) for (const eR of [0, 1]) {
    TILE.top[eL + '' + eR] = [0, 1, 2, 3].map(i => ART.bakeGrassTop(100 + i + eL * 7 + eR * 13, eL, eR));
    TILE.edge[eL + '' + eR] = [0, 1].map(i => ART.bakeDirtEdge(140 + i + eL * 3 + eR * 5, eL, eR));
  }
  PROP = {
    coin: ART.bakeCoin(), shrine: [ART.bakeShrine(false), ART.bakeShrine(true)], gate: ART.bakeGate(), sign: ART.bakeSign(),
    tuft: [0, 1, 2, 3].map(i => ART.bakeTuft(200 + i)), flower: [0, 1, 2, 3].map(i => ART.bakeFlower(210 + i)),
    mushroom: [0, 1].map(i => ART.bakeMushroom(220 + i)), bush: [0, 1, 2].map(i => ART.bakeBush(230 + i)),
    shadow: ART.bakeShadow(6, 2), pad: ART.bakeLilyPad(), raft: ART.bakeRaft(), throne: ART.bakeThronePad(), plank: ART.bakePlank(), drop: ART.bakeDrop(),
    heart: outline(fromGrid(['.ww.ww.', 'wwwwwww', 'wLwwwww', '.wwwww.', '..www..', '...w...'], { w: '#e04848', L: '#ff9a9a' }, 1), ART.OUT),
    bolt: outline(fromGrid(['..gg.', '.gg..', 'gggg.', '..gg.', '.gg..'], { g: '#8fd160' }, 1), ART.OUT),
    lock: outline(fromGrid(['.SSS.', 'S...S', 'SSSSS', 'SSySS', 'SSSSS'], { S: '#8b8378', y: '#e0b040' }, 1), ART.OUT),
  };
  const sky = pal.sky || [[104, 170, 220], [205, 232, 210]];
  BG = { sky: ART.bakeSky(VH, sky[0], sky[1]), skyDusk: ART.bakeSkyDusk(VH), sun: ART.bakeSun(), far: ART.bakeFar(320, 90, 1), mid: ART.bakeMid(480, 140, 2), near: ART.bakeNear(640, 300, 3, pal.canopy), fg: ART.bakeFG(640, VH, 4) };
}
bakeAll();
applySkin();

// ---------- level ----------
let L = null, LW = 0, LH = 0, levelIndex = 0, grid0 = null, tileSpr = null;
const decor = [];
const tileAt = (tx, ty) => (tx < 0 || tx >= LW) ? T.SOLID : (ty < 0 || ty >= LH) ? T.AIR : L.grid[ty * LW + tx];
function resolveTiles() {
  const rnd = mulberry(7);
  decor.length = 0;
  for (let y = 0; y < LH; y++) for (let x = 0; x < LW; x++) {
    const t = tileAt(x, y); let s = null;
    const underPool = t === T.SOLID && (L.pools || []).some(p => p.shallow && x * TS >= p.x0 && x * TS < p.x1 && y * TS >= p.y - 4 && y * TS < p.y + (p.depth || 12) + 4);
    if (underPool) { tileSpr[y * LW + x] = TILE.silt[(rnd() * 3) | 0]; continue; }
    if (t === T.SOLID) {
      const up = tileAt(x, y - 1), l = tileAt(x - 1, y), r = tileAt(x + 1, y);
      const eL = l === T.AIR || l === T.ONEWAY || l === T.REED || l === T.SPIKE ? 1 : 0, eR = r === T.AIR || r === T.ONEWAY || r === T.REED || r === T.SPIKE ? 1 : 0;
      if (up !== T.SOLID && up !== T.CRATE) {
        s = TILE.top[eL + '' + eR][(rnd() * 4) | 0];
        const roll = rnd();
        if (roll < 0.3) decor.push({ k: 'tuft', x: x * TS + ((rnd() * 8) | 0), y: y * TS - 5, c: PROP.tuft[(rnd() * 4) | 0], sway: 0 });
        else if (roll < 0.42) decor.push({ k: 'flower', x: x * TS + 3 + ((rnd() * 8) | 0), y: y * TS - 6, c: PROP.flower[(rnd() * 4) | 0], sway: 0 });
        else if (roll < 0.5) decor.push({ k: 'mushroom', x: x * TS + 2 + ((rnd() * 7) | 0), y: y * TS - 6, c: PROP.mushroom[(rnd() * 2) | 0], wob: 0 });
        else if (roll < 0.56 && tileAt(x + 1, y - 1) === T.AIR && tileAt(x + 1, y) === T.SOLID) decor.push({ k: 'bush', x: x * TS - 4, y: y * TS - 15, c: PROP.bush[(rnd() * 3) | 0], birds: rnd() < 0.5 });
      } else if (eL || eR) s = TILE.edge[eL + '' + eR][(rnd() * 2) | 0];
      else if (tileAt(x, y - 2) !== T.SOLID && rnd() < 0.4) s = TILE.roots[(rnd() * 3) | 0];
      else s = TILE.dirt[(rnd() * 4) | 0];
    } else if (t === T.ONEWAY) {
      const l = tileAt(x - 1, y) === T.ONEWAY, r = tileAt(x + 1, y) === T.ONEWAY;
      s = !l ? TILE.logL : !r ? TILE.logR : TILE.log[(rnd() * 3) | 0];
    } else if (t === T.REED) s = TILE.reeds[(rnd() * 3) | 0];
    else if (t === T.SPIKE) s = TILE.thorns[(rnd() * 4) | 0];
    else if (t === T.CRATE) s = TILE.crate;
    tileSpr[y * LW + x] = s;
  }
}

// ---------- world state ----------
const P = { x: 0, y: 0, vx: 0, vy: 0, w: 10, h: 14, face: 1, ground: false, groundTile: 0, coyote: 0, jbuf: 0, abuf: 0, dbuf: 0, atk: -1, plunge: false, plungeRec: 0, canCut: false,
  hp: 100, maxHp: 100, hpShown: 100, st: 100, maxSt: 100, stDelay: 0, stFlash: 0, block: false, dodge: 0, dodgeCd: 0, inv: 0, hurt: 0, anim: 0, dead: 0, onMover: null, hitSet: new Set(), drop: 0, dust: 0, sqX: 1, sqY: 1, sqT: 0, landT: 0, guardTired: 0 };
let enemies = [], seeds = [], movers = [], parts = [], leaves = [], nums = [], ghosts = [], corpses = [], trail = [], fireflies = [], waves = [];
let acorns = [], signs = [], shrines = [], gate = null;
let checkpoint = { x: 0, y: 0 };
let state = 'title', time = 0, levelTime = 0, deaths = 0, got = 0, total = 0, kills = 0, pogoCount = 0, parries = 0, blocks = 0, dodges = 0, hitsTaken = 0;
const MEDALS = { wood: [240, 360, 540], marsh: [300, 450, 660] };
const medalFor = (id, t) => { const m = MEDALS[id] || [300, 450, 660]; return t <= m[0] ? 3 : t <= m[1] ? 2 : t <= m[2] ? 1 : 0; };
const MEDAL_NAME = ['', 'BRONZE', 'SILVER', 'GOLD'], MEDAL_COL = ['#5a5a5a', '#b87333', '#c9d1dc', '#ffd34a'];
let stop = 0, shake = 0, kick = 0, camX = 0, camY = 0, flash = 0, killFlash = 0, introSeen = false, earned = 0;
let boss = null, bossActive = false, bossWon = 0, camLock = null, bossMusicT = 0;
let zoomT = 0, zoomAmt = 1, birds = [], drops = [], pollen = [], lightT = 8, lightFlash = 0, thunderT = 0, pogoChain = 0, tongue = null;
let ripples = [];
let slowT = 0, flyCoins = [], coinCombo = 0, coinComboT = 0, heartT = 0, cricketT = 0, fish = [], fishT = 3, clouds = [], mapClouds = [], mapBirds = [];
const CLOUD = ART.bakeClouds(), MAPSIGN = ART.bakeMapSign(), FISH = ART.bakeFish();
for (let i = 0; i < 6; i++) clouds.push({ x: Math.random() * 900, y: 8 + Math.random() * 50, k: i % 3, sp: 4 + Math.random() * 5 });
for (let i = 0; i < 4; i++) mapClouds.push({ x: Math.random() * VW, y: 10 + Math.random() * 120, k: i % 3, sp: 5 + Math.random() * 4 });
for (let i = 0; i < 2; i++) mapBirds.push({ t: Math.random() * 6, cx: 90 + i * 120, cy: 60 + i * 30, r: 24 + i * 10 });
const collectedCrates = new Set();

function loadLevel(i) {
  levelIndex = i; L = LEVELS[i].build(); LW = L.W; LH = L.H; bakeAll(L.palette || {});
  grid0 = new Uint8Array(L.grid); tileSpr = new Array(LW * LH).fill(null); resolveTiles();
  checkpoint = { x: L.START.x * TS + 8, y: (L.START.y + 1) * TS };
  acorns = []; signs = []; shrines = []; gate = null; total = 0;
  for (const e of L.ents) {
    const px = e.x * TS + 8, py = (e.y + 1) * TS;
    if (e.t === 'coin') { acorns.push({ x: px, y: py - 6, got: false, ph: Math.random() * 6 }); total++; }
    if (e.t === 'sign') signs.push({ x: px, y: py, text: e.text });
    if (e.t === 'check') shrines.push({ x: px, y: py, lit: false });
    if (e.t === 'gate') gate = { x: px, y: py };
  }
  for (let i2 = 0; i2 < LW * LH; i2++) if (grid0[i2] === T.CRATE) total++;
  spawnEntities();
  P.x = checkpoint.x; P.y = checkpoint.y; P.face = 1; camX = 0; camY = LH * TS - VH;
}
function spawnEntities() {
  enemies = []; seeds = []; movers = []; corpses = []; waves = []; boss = null; bossActive = false; bossWon = 0; camLock = null;
  for (const e of L.ents) {
    const px = e.x * TS + 8, py = (e.y + 1) * TS;
    const base = { x: px, y: py, vx: 0, vy: 0, face: e.face || 1, alive: true, dying: 0, anim: Math.random() * 3, flash: 0, stagger: 0 };
    switch (e.t) {
      case 'sprig': enemies.push({ ...base, t: 'sprig', w: 8, h: 10, hp: EHP.sprig, speed: 28 }); break;
      case 'shield': enemies.push({ ...base, t: 'shield', w: 10, h: 14, hp: EHP.shield, speed: 26, turnT: 0 }); break;
      case 'spit': enemies.push({ ...base, t: 'spit', w: 12, h: 12, hp: EHP.spit, timer: 1 + Math.random(), mouth: 0 }); break;
      case 'wasp': enemies.push({ ...base, t: 'wasp', hx: px, hy: py, w: 8, h: 6, hp: EHP.wasp, face: -1 }); break;
      case 'thorn': enemies.push({ ...base, t: 'thorn', w: 14, h: 8, hp: EHP.thorn, speed: 22, mode: 'walk', modeT: 0 }); break;
      case 'queen': boss = { ...base, t: 'queen', w: 22, h: 12, hp: EHP.queen, maxHp: EHP.queen, mode: 'sleep', modeT: 0, face: -1, tx: px, ty: py, dive: null, phase: 1 }; enemies.push(boss); break;
      case 'frog': boss = { ...base, t: 'frog', w: 28, h: 14, hp: EHP.frog, maxHp: EHP.frog, mode: 'sleep', modeT: 0, face: -1, phase: 1, last: '' }; enemies.push(boss); break;
      case 'archer': enemies.push({ ...base, t: 'archer', w: 8, h: 10, hp: EHP.archer, speed: 24, timer: 1 + Math.random(), draw: 0 }); break;
      case 'hopper': enemies.push({ ...base, t: 'hopper', w: 8, h: 6, hp: EHP.hopper, timer: 0.5 + Math.random(), air: false }); break;
      case 'pad': movers.push({ kind: 'pad', x0: px - 12, x: px - 12, y0: py - 2, y: py - 2, w: 24, h: 6, sink: 0, dx: 0, dy: 0 }); break;
      case 'mover': movers.push({ x0: e.x * TS, x: e.x * TS, y: e.y * TS, w: e.len * TS, h: 8, range: e.range * TS, p: 0, dir: 1, dx: 0, speed: 36 }); break;
    }
  }
  for (const e of enemies) { e.hp = Math.round(e.hp * DIFF[SET.difficulty].ehp); if (e.maxHp) e.maxHp = e.hp; }
  for (const m of (L.moversExtra || [])) movers.push({ ...m, dx: 0, dy: 0, moving: false, done: false, x: m.x });
  birds = []; tongue = null; waves = [];
  for (const d of decor) if (d.k === 'bush') d.birds = true;
  for (let i = 0; i < LW * LH; i++) if (grid0[i] !== L.grid[i]) { L.grid[i] = grid0[i]; tileSpr[i] = grid0[i] === T.CRATE ? TILE.crate : null; }
}
function respawn() {
  applyUpgrades();
  Object.assign(P, { x: checkpoint.x, y: checkpoint.y, vx: 0, vy: 0, hp: P.maxHp, hpShown: P.maxHp, st: P.maxSt, inv: 1, hurt: 0, dead: 0, atk: -1, plunge: false, onMover: null, face: 1, block: false, dodge: 0 });
  spawnEntities(); seeds = []; nums = []; ghosts = []; music.play(L.music || 'theme');
}
function startGame() {
  state = 'play'; levelTime = 0; deaths = 0; kills = 0; got = 0; pogoCount = 0; parries = 0; blocks = 0; dodges = 0; hitsTaken = 0;
  for (const a of acorns) a.got = false; for (const s of shrines) s.lit = false; collectedCrates.clear();
  checkpoint = { x: L.START.x * TS + 8, y: (L.START.y + 1) * TS };
  if (q.get('tx')) checkpoint = { x: +q.get('tx') * TS + 8, y: (+(q.get('ty') || 21) + 1) * TS };
  respawn(); camX = P.x - VW / 2; camY = P.y - 100;
}
function winLevel() {
  state = 'win'; SFX.win();
  const id = LEVELS[levelIndex].id, p = PROG[id] || {};
  PROG[id] = { cleared: true, best: p.best ? Math.min(p.best, levelTime) : levelTime, gold: Math.max(p.gold || 0, got), total, deaths: p.deaths === undefined ? deaths : Math.min(p.deaths, deaths) };
  PROG.coins = (PROG.coins || 0) + got; earned = got;
  PROG[id].medal = Math.max(p.medal || 0, medalFor(id, levelTime)); if (got >= total) PROG[id].allGold = true; if (hitsTaken === 0 && deaths === 0) PROG[id].noHit = true;
  saveProgress();
}

const levelLocked = lv => !!lv.locked || (lv.needs && !(PROG[lv.needs] && PROG[lv.needs].cleared) && !q.get('unlock'));

// ---------- world map ----------
const NODES = [
  { id: 'wood', kind: 'level', level: 0, x: 62, y: 112, name: 'BRACKEN WOOD' },
  { id: 'store', kind: 'store', x: 156, y: 66, name: 'THE STORE' },
  { id: 'marsh', kind: 'level', level: 1, x: 246, y: 118, name: 'MARSH WOOD' },
];
const PATH = [[62, 112], [96, 100], [126, 74], [156, 66], [190, 78], [222, 104], [246, 118]];
const NODE_AT = [0, 3, 6]; // PATH index of each node
const MAPC = ART.bakeMap(VW, VH, NODES, PATH, 11);
const HUT = ART.bakeHut(), FLAG = ART.bakeFlag();
const map = { node: 0, seg: 0, t: 0, walking: 0, target: 0 }; // token position: on PATH segment seg at fraction t
const nodeLocked = nd => nd.kind === 'level' && levelLocked(LEVELS[nd.level]);
function mapPos() { const a = PATH[map.seg], b = PATH[Math.min(PATH.length - 1, map.seg + 1)]; return [a[0] + (b[0] - a[0]) * map.t, a[1] + (b[1] - a[1]) * map.t]; }
function mapGo(dir) {
  if (map.walking) return;
  const nx = map.node + dir; if (nx < 0 || nx >= NODES.length) { SFX.buzz(); return; }
  if (nodeLocked(NODES[nx])) { SFX.buzz(); number(NODES[nx].x, NODES[nx].y - 14, 'LOCKED', '#9aa39a'); return; }
  map.target = nx; map.walking = dir; SFX.ui();
}
function updateMap(dt) {
  if (map.walking) {
    const goal = NODE_AT[map.target]; const sp = 1.6 * dt; // segments per second-ish, scaled below by length
    const a = PATH[map.seg], b = PATH[Math.min(PATH.length - 1, map.seg + 1)]; const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    map.t += map.walking * (90 * dt) / len;
    if (map.walking > 0 && map.t >= 1) { map.seg++; map.t = 0; if (map.seg >= goal) { map.seg = goal; map.t = 0; map.node = map.target; map.walking = 0; SFX.uiSel(); } }
    if (map.walking < 0 && map.t <= 0) { if (map.seg <= goal) { map.seg = goal; map.t = 0; map.node = map.target; map.walking = 0; SFX.uiSel(); } else { map.seg--; map.t = 1; } }
    if (Math.random() < dt * 10) { const [px, py] = mapPos(); parts.push({ x: px + camX + (Math.random() - 0.5) * 4, y: py + camY, vx: 0, vy: -8, life: 0.3, max: 0.3, col: '#c9b27c', size: 1, grav: 0 }); }
  }
  if (leftPress) mapGo(-1); if (rightPress) mapGo(1);
  if (confirmPress && !map.walking) { const nd = NODES[map.node]; if (nd.kind === 'store') { state = 'store'; storeI = 0; SFX.uiSel(); } else { selI = nd.level; selectStart(); } }
  if (atkPress && !map.walking) { state = 'bestiary'; bestI = 0; SFX.uiSel(); }
  if (pausePress) { state = 'title'; SFX.ui(); }
  PROG.mapNode = map.node;
}
function drawMap() {
  g.drawImage(MAPC, 0, 0);
  // river sparkle
  g.fillStyle = 'rgba(230,245,255,0.8)'; for (let i = 0; i < 8; i++) { const t = (time * 0.4 + i * 0.13) % 1; const pts = [[VW - 34, 0], [VW - 58, 40], [VW - 26, 82], [VW - 70, 122], [VW - 44, VH]]; const k = Math.min(3, Math.floor(t * 4)); const a = pts[k], b = pts[k + 1]; const u = t * 4 - k; if (Math.sin(time * 3 + i) > 0.4) g.fillRect(Math.round(a[0] + (b[0] - a[0]) * u) - 1 + (i & 1), Math.round(a[1] + (b[1] - a[1]) * u), 2, 1); }
  // cloud shadows drift over the land, then the clouds themselves later
  for (const c of mapClouds) { c.x += c.sp * 0.016; if (c.x > VW + 60) c.x = -60; g.globalAlpha = 0.18; g.fillStyle = '#0a1a0a'; g.beginPath(); g.ellipse(c.x + 6, c.y + 10, CLOUD[c.k].width * 0.5, CLOUD[c.k].height * 0.45, 0, 0, 7); g.fill(); g.globalAlpha = 1; }
  // boss portraits: the queen hangs over the wood, the frog sits by the pond
  { const nw = NODES[0], nm = NODES[NODES.length - 1]; const qb = Math.round(Math.sin(time * 2.5) * 2); drawSet(SPR.queen, null, Math.floor(time * 20) % 2, nw.x + 30, nw.y - 16 + qb, -1, false, 0.75, 0.75, PROG.wood && PROG.wood.cleared ? 0.45 : 1); drawSet(SPR.frog, null, Math.floor(time * 1.5) % 2, nm.x - 26, nm.y + 4, 1, false, 0.55, 0.55, PROG.marsh && PROG.marsh.cleared ? 0.45 : 1); }
  for (const nd of NODES) {
    g.drawImage(MAPSIGN, nd.x + 8, nd.y - 12);
    const lk = nodeLocked(nd); const p = nd.kind === 'level' ? PROG[LEVELS[nd.level].id] : null;
    if (nd.kind === 'store') g.drawImage(HUT, nd.x - 10, nd.y - 20);
    else if (lk) g.drawImage(PROP.lock, nd.x - 3, nd.y - 16);
    else if (p && p.cleared) g.drawImage(FLAG, nd.x - 3, nd.y - 18);
    if (NODES[map.node] === nd && !map.walking) { g.strokeStyle = '#8fd160'; g.lineWidth = 1; g.beginPath(); g.arc(nd.x, nd.y, 9 + Math.sin(time * 6), 0, 7); g.stroke(); }
  }
  const [px, py] = mapPos();
  g.drawImage(PROP.shadow, Math.round(px) - 6, Math.round(py) - 1);
  for (const b of mapBirds) { b.t += 0.016; const bx = b.cx + Math.cos(b.t * 0.6) * b.r, by = b.cy + Math.sin(b.t * 0.6) * b.r * 0.4; drawSet(BIRD, null, Math.floor(b.t * 10) % 2, bx, by, Math.sin(b.t * 0.6) < 0 ? 1 : -1, false); }
  for (const c of mapClouds) { g.globalAlpha = 0.7; g.drawImage(CLOUD[c.k], Math.round(c.x), Math.round(c.y)); g.globalAlpha = 1; }
  drawSet(K, map.walking ? 'run' : 'idle', Math.floor(time * (map.walking ? 12 : 3)) % (map.walking ? 6 : 4), px, py + 2, map.walking < 0 ? -1 : 1, false);
  // header + node card
  g.fillStyle = 'rgba(20,16,30,0.8)'; g.fillRect(0, 0, VW, 18); text('BRACKEN', 6, 5, '#ffd36b'); g.drawImage(PROP.coin[Math.floor(time * 8) % 4], VW - 62, 5); text(String(PROG.coins), VW - 6, 6, '#ffd34a', 'right');
  const nd = NODES[map.node];
  if (!map.walking) {
    const cw = 200, cx0 = Math.max(4, Math.min(VW - cw - 4, nd.x - cw / 2)), cy0 = VH - 44;
    g.fillStyle = 'rgba(20,16,30,0.85)'; g.fillRect(cx0, cy0, cw, 30); g.strokeStyle = '#8fd160'; g.strokeRect(cx0 + 0.5, cy0 + 0.5, cw - 1, 29);
    text(nd.name, cx0 + cw / 2, cy0 + 5, '#fff6e0', 'center');
    if (nd.kind === 'store') text('Z  enter', cx0 + cw / 2, cy0 + 17, '#9aa39a', 'center');
    else { const p = PROG[LEVELS[nd.level].id]; text(p ? fmt(p.best) + '   ' + p.gold + '/' + p.total + (p.cleared ? '   CLEARED' : '') : 'Z  play', cx0 + cw / 2, cy0 + 17, p ? '#dfe8ff' : '#9aa39a', 'center');
      if (p) { let mx = cx0 + 8; if (p.medal) { g.fillStyle = MEDAL_COL[p.medal]; g.beginPath(); g.arc(mx + 4, cy0 + 9, 4, 0, 7); g.fill(); g.fillStyle = ART.OUT; g.fillRect(mx + 3, cy0 + 8, 2, 2); mx += 12; } if (p.allGold) { g.drawImage(PROP.coin[0], mx, cy0 + 5); mx += 12; } if (p.noHit) { g.drawImage(PROP.heart, mx, cy0 + 5); } } }
  }
  text('ARROWS walk   Z enter   X bestiary   ESC', VW / 2, VH - 10, '#9aa39a', 'center');
}

// ---------- store ----------
let storeI = 0, storeMsg = '', storeMsgT = 0, storeTab = 0;
function updateStore(dt) {
  storeMsgT = Math.max(0, storeMsgT - dt);
  const tab = STORE_TABS[storeTab], items = tab.items;
  if (leftPress) { storeTab = (storeTab + STORE_TABS.length - 1) % STORE_TABS.length; storeI = 0; SFX.ui(); }
  if (rightPress) { storeTab = (storeTab + 1) % STORE_TABS.length; storeI = 0; SFX.ui(); }
  if (upPress) { storeI = (storeI + items.length - 1) % items.length; SFX.ui(); }
  if (downPress) { storeI = (storeI + 1) % items.length; SFX.ui(); }
  if (confirmPress) {
    const k = items[storeI], owned = PROG[tab.owned][k.id];
    if (owned && tab.key) { PROG[tab.key] = k.id; applySkin(); saveProgress(); SFX.uiSel(); storeMsg = k.name + ' equipped'; storeMsgT = 2; }
    else if (owned) { SFX.ui(); storeMsg = 'already yours'; storeMsgT = 1.5; }
    else if (PROG.coins >= k.price) { PROG.coins -= k.price; PROG[tab.owned][k.id] = true; if (tab.key) PROG[tab.key] = k.id; applySkin(); applyUpgrades(); saveProgress(); SFX.coin(); SFX.sting(); storeMsg = 'bought ' + k.name; storeMsgT = 2; burst(VW / 2 + camX, 60 + camY, 16, ['#ffd36b', '#fff6c8'], 60, 0.6, -20, 1); }
    else { SFX.buzz(); storeMsg = 'need ' + (k.price - PROG.coins) + ' more gold'; storeMsgT = 2; }
  }
  if (pausePress) { state = 'map'; SFX.ui(); }
}
function drawStore() {
  g.drawImage(MAPC, 0, 0); g.fillStyle = 'rgba(10,14,12,0.75)'; g.fillRect(0, 0, VW, VH);
  const x = 20, y = 10, w = VW - 40, h = VH - 20;
  g.fillStyle = 'rgba(20,16,30,0.92)'; g.fillRect(x, y, w, h); g.strokeStyle = '#ffd36b'; g.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  text('THE STORE', x + 10, y + 7, '#ffd36b'); g.drawImage(PROP.coin[Math.floor(time * 8) % 4], x + w - 58, y + 6); text(String(PROG.coins), x + w - 10, y + 7, '#ffd34a', 'right');
  STORE_TABS.forEach((t, i) => { const tx = x + 10 + i * 82, sel = i === storeTab; g.fillStyle = sel ? 'rgba(60,90,60,0.7)' : 'rgba(40,36,50,0.7)'; g.fillRect(tx, y + 20, 76, 13); text((sel ? '< ' : '') + t.name + (sel ? ' >' : ''), tx + 38, y + 23, sel ? '#8fd160' : '#9aa39a', 'center'); });
  const tab = STORE_TABS[storeTab];
  tab.items.forEach((k, i) => {
    const yy = y + 42 + i * 22, sel = i === storeI, owned = !!PROG[tab.owned][k.id], eq = tab.key && PROG[tab.key] === k.id;
    if (sel) { g.fillStyle = 'rgba(60,90,60,0.5)'; g.fillRect(x + 6, yy - 3, w - 12, 20); text('>', x + 10, yy + 3, '#8fd160'); }
    if (tab.key === 'skin') { const kk = bakeKnight(Object.assign({}, k.pal, swordById(PROG.sword).pal)); g.drawImage(kk.R.idle[0], x + 20, yy - 6); }
    else if (tab.key === 'sword') { const kk = bakeKnight(Object.assign({}, skinById(PROG.skin).pal, k.pal)); g.drawImage(kk.R.atk[1], x + 18, yy - 6); }
    else g.drawImage(k.id === 'heart' ? PROP.heart : PROP.bolt, x + 28, yy + 2);
    text(k.name, x + 52, yy + 1, sel ? '#fff6e0' : '#c9d1dc');
    if (k.desc) text(k.desc, x + 52, yy + 11, '#9aa39a');
    text(eq ? 'EQUIPPED' : owned ? 'owned' : k.price + ' gold', x + w - 10, yy + 3, eq ? '#8fd160' : owned ? '#9aa39a' : (PROG.coins >= k.price ? '#ffd34a' : '#ff6b6b'), 'right');
  });
  text(storeMsgT > 0 ? storeMsg : 'LEFT/RIGHT tabs   Z buy / equip   ESC back', VW / 2, y + h - 12, storeMsgT > 0 ? '#ffd36b' : '#9aa39a', 'center');
}

// ---------- bestiary ----------
const BEASTS = [
  { t: 'sprig', name: 'SPRIG', sub: 'brush goblin', desc: 'Walks straight at you and bites. Sword it, stomp it, plunge it, or shove it back with the shield.' },
  { t: 'shield', name: 'SHIELDBEARER', sub: 'helmed goblin', desc: 'Blocks anything from the front with a clank. Turns slowly, so cross behind him and strike, or plunge from above. Stomps clank off the helm.' },
  { t: 'spit', name: 'SPITTER', sub: 'toadstool', desc: 'Spits a seed straight at your chest when you come near. Step aside, jump, block, or slash the seed out of the air.' },
  { t: 'wasp', name: 'WASP', sub: 'over water', desc: 'A stepping stone with wings. Stomp or plunge it to bounce, and chain the bounces across a pit.' },
  { t: 'thorn', name: 'THORNBACK', sub: 'spined beetle', desc: 'Winds up with a ! and charges. Block the charge to stagger it, or dodge through and hit it while it rests. The spines punish stomps and plunges. Sword only.' },
  { t: 'hopper', name: 'HOPPER', sub: 'marsh frog', desc: 'Leaps at you in long arcs and leaps aboard rafts from the water. Swing when it lands, stomp it out of the air, or block the leap and it bounces off.' },
  { t: 'archer', name: 'GOBLIN ARCHER', sub: 'keeps its distance', desc: 'Backs away and looses arcing arrows after a draw. Block them, or slash one to send it straight back and kill the archer. It will not cross water.' },
  { t: 'queen', name: 'HORNET QUEEN', sub: 'hive ruler', desc: 'Hovers out of reach and calls drones you can pogo off. Block her dive and she is staggered on the floor, where she takes double damage. Jump or block her low sweep. Half health and she is enraged.' },
  { t: 'frog', name: 'BULLFROG KING', sub: 'lord of the pond', desc: 'Lashes a tongue at head height: block it or duck under. Leaps at you and shakes the ground: jump the waves, then hit him while he is dazed. Croaks flies out of the reeds; strike the swollen throat for double.' },
];
function beastRec(t) { PROG.beasts = PROG.beasts || {}; return PROG.beasts[t] = PROG.beasts[t] || { seen: false, slain: 0 }; }
function beastSeen(t) { const r = beastRec(t); if (!r.seen) { r.seen = true; saveProgress(); } }
function beastSlain(t) { const r = beastRec(t); r.seen = true; r.slain++; saveProgress(); }
function drawBestiary() {
  const vg = g.createRadialGradient(VW / 2, VH / 2, 40, VW / 2, VH / 2, 200); vg.addColorStop(0, 'rgba(10,20,14,0.6)'); vg.addColorStop(1, 'rgba(10,20,14,0.9)'); g.fillStyle = vg; g.fillRect(0, 0, VW, VH);
  text('BESTIARY', VW / 2, 6, '#ffd36b', 'center');
  const lx = 8, ly = 26;
  BEASTS.forEach((b, i) => { const r = PROG.beasts && PROG.beasts[b.t]; const sel = i === bestI; if (sel) text('>', lx, ly + i * 13, '#8fd160'); text(r && r.seen ? b.name : '? ? ?', lx + 10, ly + i * 13, sel ? '#fff6e0' : (r && r.seen ? '#c9d1dc' : '#6a6a6a')); });
  const b = BEASTS[bestI], r = PROG.beasts && PROG.beasts[b.t], seen = !!(r && r.seen);
  const px = 134, pw = VW - px - 8, py = 20, ph = VH - 40;
  g.fillStyle = 'rgba(20,16,30,0.85)'; g.fillRect(px, py, pw, ph); g.strokeStyle = '#8fd160'; g.strokeRect(px + 0.5, py + 0.5, pw - 1, ph - 1);
  const set = SPR[b.t]; const c = set.R[0]; const sc = b.t === 'queen' ? 2 : 3; const cxp = px + 30, cyp = py + 26;
  if (!seen) g.globalAlpha = 0.25;
  drawSet(set, null, 0, cxp - (c.width / 2 - set.ax) * sc, cyp + (set.ay - c.height / 2) * sc, 1, !seen, sc, sc);
  g.globalAlpha = 1;
  text(seen ? b.name : 'UNKNOWN', px + 62, py + 10, '#ffd36b');
  text(seen ? b.sub : 'not yet met', px + 62, py + 22, '#9aa39a');
  if (seen) { text('slain ' + r.slain, px + 62, py + 34, '#c9d1dc'); const lines = wrap(b.desc, pw - 12); lines.slice(0, 9).forEach((l, i) => text(l, px + 6, py + 54 + i * 10, '#fff6e0')); }
  else text('Meet it in the wood.', px + 6, py + 54, '#9aa39a');
  text('UP/DOWN browse   ESC map', VW / 2, VH - 12, '#9aa39a', 'center');
}

// ---------- intro ----------
const INTRO = [
  'The forest of Bracken has gone quiet. No birds, no woodcutters. Only the hum of wasps.',
  'Every knight the king sent came back with the same story. Most did not come back at all.',
  'Beyond the old gate lies whatever silenced the wood. You are the last one he can spare.',
];
const intro = { card: 0, chars: 0, t: 0, kx: -20 };
function startIntro() { state = 'intro'; intro.card = 0; intro.chars = 0; intro.t = 0; intro.kx = -20; introSeen = true; camX = 0; camY = LH * TS - VH; music.play(L.music || 'theme'); }
function introNext() { const line = INTRO[intro.card]; if (intro.chars < line.length) { intro.chars = line.length; return; } intro.card++; intro.chars = 0; if (intro.card >= INTRO.length) startGame(); }

// ---------- menu ----------
const MENU = ['Difficulty', 'Music', 'Music volume', 'Sound', 'Sound FX', 'Swap Z / X', 'Screen shake', 'Hit stop', 'Damage numbers', 'Timer', 'Ambient life', 'Scanlines', 'Pixel scale', 'Reset progress', 'Resume', 'Quit to title'];
const MENU_ROWS = 10;
let menuI = 0, menuFrom = 'play', selI = 0, menuMsg = '', menuMsgT = 0, bestI = 0;
function openMenu(from) { menuFrom = from; menuI = 0; state = 'menu'; }
function menuAdjust(dir) {
  const k = MENU[menuI];
  if (k === 'Music') SET.music = !SET.music; else if (k === 'Sound') SET.sfx = Math.round(Math.max(0, Math.min(1, SET.sfx + dir * 0.1)) * 10) / 10; else if (k === 'Screen shake') SET.shake = !SET.shake; else if (k === 'Sound FX') SET.sfxFiles = !SET.sfxFiles;
  else if (k === 'Hit stop') SET.hitstop = !SET.hitstop; else if (k === 'Damage numbers') SET.numbers = !SET.numbers; else if (k === 'Timer') SET.timer = !SET.timer; else if (k === 'Ambient life') SET.ambient = !SET.ambient;
  else if (k === 'Difficulty') SET.difficulty = DIFFS[(DIFFS.indexOf(SET.difficulty) + dir + 3) % 3]; else if (k === 'Music volume') SET.musicVol = Math.round(Math.max(0, Math.min(1, SET.musicVol + dir * 0.1)) * 10) / 10; else if (k === 'Swap Z / X') SET.swapZX = !SET.swapZX; else if (k === 'Scanlines') SET.scanlines = !SET.scanlines; else if (k === 'Pixel scale') SET.scale = SCALES[(SCALES.indexOf(SET.scale) + dir + 4) % 4]; else return;
  applySettings(); saveSettings(); SFX.ui();
}
function menuConfirm() {
  const k = MENU[menuI];
  if (k === 'Resume') { state = menuFrom; SFX.uiSel(); }
  else if (k === 'Quit to title') { state = 'title'; music.play('select'); SFX.uiSel(); }
  else if (k === 'Reset progress') { if (menuMsg === 'press again to confirm' && menuMsgT > 0) { for (const key in PROG) delete PROG[key]; saveProgress(); menuMsg = 'progress cleared'; SFX.crack(); } else { menuMsg = 'press again to confirm'; SFX.ui(); } menuMsgT = 2.5; }
  else menuAdjust(1);
}
function selectStart() {
  const lv = LEVELS[selI];
  if (levelLocked(lv)) { SFX.buzz(); return; }
  if (levelIndex !== selI || !L) loadLevel(selI);
  SFX.uiSel();
  if (introSeen || q.get('tx') || PROG[lv.id]) startGame(); else startIntro();
}

// ---------- input ----------
const keys = {};
let jumpPress = false, atkPress = false, dodgePress = false, pausePress = false, anyPress = false, upPress = false, downPress = false, leftPress = false, rightPress = false, confirmPress = false;
const isKey = (e, names) => names.includes(e.key) || names.includes(e.code);
const KEYS = {
  jump: ['z', 'Z', ' ', 'Space', 'ArrowUp', 'w', 'W', 'k', 'K'], atk: ['x', 'X', 'j', 'J', 'Enter'], block: ['c', 'C', 'l', 'L'], dodge: ['v', 'V', 'Shift'],
  left: ['ArrowLeft', 'a', 'A'], right: ['ArrowRight', 'd', 'D'], down: ['ArrowDown', 's', 'S'], up: ['ArrowUp', 'w', 'W'], pause: ['Escape', 'p', 'P'],
};
addEventListener('keydown', e => {
  if (e.repeat) { e.preventDefault(); return; }
  initAudio(); anyPress = true;
  const zx = SET.swapZX && (e.key === 'z' || e.key === 'Z' || e.key === 'x' || e.key === 'X');
  const jumpK = zx ? isKey(e, ['x', 'X']) : isKey(e, KEYS.jump), atkK = zx ? isKey(e, ['z', 'Z']) : isKey(e, KEYS.atk);
  if (jumpK) { jumpPress = true; keys.jump = true; }
  if (atkK) { atkPress = true; keys.atk = true; }
  if (isKey(e, KEYS.block)) keys.block = true;
  if (isKey(e, KEYS.dodge)) { dodgePress = true; keys.dodge = true; }
  if (isKey(e, KEYS.left)) { keys.left = true; leftPress = true; }
  if (isKey(e, KEYS.right)) { keys.right = true; rightPress = true; }
  if (isKey(e, KEYS.down)) { keys.down = true; downPress = true; }
  if (isKey(e, KEYS.up)) upPress = true;
  if (isKey(e, ['z', 'Z', 'Enter', ' ', 'Space'])) confirmPress = true;
  if (isKey(e, KEYS.pause)) pausePress = true;
  if (isKey(e, ['m', 'M'])) { SET.music = !SET.music; applySettings(); saveSettings(); }
  if (isKey(e, ['r', 'R']) && state === 'play') die();
  e.preventDefault();
});
addEventListener('keyup', e => {
  const zx = SET.swapZX && (e.key === 'z' || e.key === 'Z' || e.key === 'x' || e.key === 'X');
  if (zx ? isKey(e, ['x', 'X']) : isKey(e, KEYS.jump)) keys.jump = false;
  if (zx ? isKey(e, ['z', 'Z']) : isKey(e, KEYS.atk)) keys.atk = false;
  if (isKey(e, KEYS.block)) keys.block = false;
  if (isKey(e, KEYS.dodge)) keys.dodge = false;
  if (isKey(e, KEYS.left)) keys.left = false;
  if (isKey(e, KEYS.right)) keys.right = false;
  if (isKey(e, KEYS.down)) keys.down = false;
});
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
// Gamepad: A jump, X swing, B dodge, RB/LB block, Start pause, d-pad or left stick to move.
const pad = { prev: {} };
function pollGamepad() {
  const gps = navigator.getGamepads ? navigator.getGamepads() : []; let gp = null; for (const p of gps) if (p && p.connected) { gp = p; break; }
  if (!gp) return;
  const b = i => !!(gp.buttons[i] && gp.buttons[i].pressed);
  const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
  const now = { jump: b(0), atk: b(2), dodge: b(1), block: b(4) || b(5), pause: b(9), left: b(14) || ax < -0.5, right: b(15) || ax > 0.5, up: b(12) || ay < -0.5, down: b(13) || ay > 0.5 };
  const rose = k => now[k] && !pad.prev[k];
  if (Object.values(now).some(Boolean)) { initAudio(); anyPress = anyPress || Object.keys(now).some(rose); }
  if (rose('jump')) { jumpPress = true; confirmPress = true; } if (rose('atk')) atkPress = true; if (rose('dodge')) dodgePress = true; if (rose('pause')) pausePress = true;
  if (rose('left')) leftPress = true; if (rose('right')) rightPress = true; if (rose('up')) upPress = true; if (rose('down')) downPress = true;
  for (const k of ['jump', 'atk', 'dodge', 'block', 'left', 'right', 'down']) { if (now[k]) keys[k] = true; else if (pad.prev[k]) keys[k] = false; }
  pad.prev = now;
}
// Touch: on-screen pad on touch devices (or ?touch=1). Zones are in display pixels.
const touchOn = ('ontouchstart' in window && navigator.maxTouchPoints > 0) || q.get('touch') === '1';
const touches = new Map(); let touchZones = [];
function layoutTouch() {
  const W = disp.width, H = disp.height, b = Math.round(Math.min(W, H) * 0.11);
  touchZones = [
    { k: 'left', x: b * 0.4, y: H - b * 2.4, w: b * 1.4, h: b * 1.4, label: '<' }, { k: 'right', x: b * 2.2, y: H - b * 2.4, w: b * 1.4, h: b * 1.4, label: '>' },
    { k: 'up', x: b * 1.3, y: H - b * 3.9, w: b * 1.4, h: b * 1.4, label: '^' }, { k: 'down', x: b * 1.3, y: H - b * 1.3, w: b * 1.4, h: b * 1.2, label: 'v' },
    { k: 'jump', x: W - b * 1.8, y: H - b * 2.6, w: b * 1.4, h: b * 1.4, label: 'A' }, { k: 'atk', x: W - b * 3.4, y: H - b * 1.8, w: b * 1.4, h: b * 1.4, label: 'X' },
    { k: 'dodge', x: W - b * 3.4, y: H - b * 3.6, w: b * 1.4, h: b * 1.4, label: 'B' }, { k: 'block', x: W - b * 1.8, y: H - b * 4.4, w: b * 1.4, h: b * 1.4, label: 'Y' },
    { k: 'pause', x: W - b * 1.4, y: b * 0.3, w: b * 1.1, h: b * 0.8, label: 'II' },
  ];
}
function zoneAt(x, y) { for (const z of touchZones) if (x >= z.x && x < z.x + z.w && y >= z.y && y < z.y + z.h) return z.k; return null; }
function touchPress(k) { initAudio(); anyPress = true; if (k === 'jump') { jumpPress = true; confirmPress = true; } if (k === 'atk') atkPress = true; if (k === 'dodge') dodgePress = true; if (k === 'pause') pausePress = true; if (k === 'left') leftPress = true; if (k === 'right') rightPress = true; if (k === 'up') upPress = true; if (k === 'down') downPress = true; if (k !== 'pause' && k !== 'up') keys[k] = true; }
function touchRelease(k) { if (k && k !== 'pause' && k !== 'up') keys[k] = false; }
if (touchOn) {
  layoutTouch(); addEventListener('resize', layoutTouch);
  const upd = e => { e.preventDefault(); for (const t of e.changedTouches) { const k = zoneAt(t.clientX, t.clientY); const old = touches.get(t.identifier); if (old !== k) { touchRelease(old); if (k) touchPress(k); touches.set(t.identifier, k); } } };
  disp.addEventListener('touchstart', upd, { passive: false }); disp.addEventListener('touchmove', upd, { passive: false });
  const end = e => { e.preventDefault(); for (const t of e.changedTouches) { touchRelease(touches.get(t.identifier)); touches.delete(t.identifier); } };
  disp.addEventListener('touchend', end, { passive: false }); disp.addEventListener('touchcancel', end, { passive: false });
}
function drawTouch() {
  if (!touchOn) return;
  dg.font = Math.round(touchZones[0].w * 0.45) + 'px "Press Start 2P", monospace'; dg.textAlign = 'center'; dg.textBaseline = 'middle';
  for (const z of touchZones) { const held = [...touches.values()].includes(z.k); dg.fillStyle = held ? 'rgba(143,209,96,0.55)' : 'rgba(20,16,30,0.42)'; dg.beginPath(); dg.roundRect(z.x, z.y, z.w, z.h, z.w * 0.25); dg.fill(); dg.strokeStyle = 'rgba(255,246,224,0.6)'; dg.lineWidth = 2; dg.stroke(); dg.fillStyle = 'rgba(255,246,224,0.85)'; dg.fillText(z.label, z.x + z.w / 2, z.y + z.h / 2); }
}
function clearPresses() { jumpPress = atkPress = dodgePress = pausePress = anyPress = upPress = downPress = leftPress = rightPress = confirmPress = false; }

// ---------- collision ----------
const isSolid = (tx, ty) => { const t = tileAt(tx, ty); return t === T.SOLID || t === T.CRATE; };
function moveBody(b, dx, dy, allowDrop = false) {
  const r = { hitX: false, hitY: false, ground: false, groundTile: null };
  if (dx !== 0) {
    const dir = Math.sign(dx); let nx = b.x + dx;
    const top = b.y - b.h + 0.5, bot = b.y - 0.5;
    const ty0 = Math.floor(top / TS), ty1 = Math.floor(bot / TS);
    const edge = dir > 0 ? nx + b.w / 2 - 0.01 : nx - b.w / 2;
    const tx = Math.floor(edge / TS);
    for (let ty = ty0; ty <= ty1; ty++) if (isSolid(tx, ty)) { nx = dir > 0 ? tx * TS - b.w / 2 : (tx + 1) * TS + b.w / 2; r.hitX = true; break; }
    b.x = nx;
  }
  if (dy !== 0) {
    const dir = Math.sign(dy); let ny = b.y + dy;
    const l = b.x - b.w / 2 + 0.5, rr = b.x + b.w / 2 - 0.5;
    const tx0 = Math.floor(l / TS), tx1 = Math.floor(rr / TS);
    if (dir > 0) {
      const ty = Math.floor((ny - 0.01) / TS);
      for (let tx = tx0; tx <= tx1; tx++) {
        const t = tileAt(tx, ty);
        if (t === T.SOLID || t === T.CRATE) { ny = ty * TS; r.ground = true; r.hitY = true; r.groundTile = t; break; }
        if ((t === T.ONEWAY || t === T.REED) && !allowDrop && b.y <= ty * TS + 0.5) { ny = ty * TS; r.ground = true; r.groundTile = t; }
      }
    } else {
      const ty = Math.floor((ny - b.h) / TS);
      for (let tx = tx0; tx <= tx1; tx++) if (isSolid(tx, ty)) { ny = (ty + 1) * TS + b.h; r.hitY = true; break; }
    }
    b.y = ny;
  }
  return r;
}
const box = b => ({ l: b.x - b.w / 2, r: b.x + b.w / 2, t: b.y - b.h, b: b.y });
const overlap = (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;

// ---------- feel helpers ----------
function burst(x, y, n, cols, spd = 70, life = 0.5, grav = 300, size = 2) {
  for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, s = spd * (0.4 + Math.random() * 0.8); parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - spd * 0.3, life: life * (0.6 + Math.random() * 0.6), max: life, col: cols[(Math.random() * cols.length) | 0], size, grav }); }
}
function sparks(x, y, dir, n = 8) { for (let i = 0; i < n; i++) { const a = (Math.random() - 0.5) * 1.6 + (dir > 0 ? 0 : Math.PI); const s = 90 + Math.random() * 120; parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 30, life: 0.25 + Math.random() * 0.2, max: 0.4, col: i & 1 ? '#fff6c8' : '#ffd36b', size: i % 3 === 0 ? 2 : 1, grav: 200 }); } }
function dust(x, y, n = 4) { for (let i = 0; i < n; i++) parts.push({ x: x + (Math.random() - 0.5) * 8, y, vx: (Math.random() - 0.5) * 40, vy: -20 - Math.random() * 20, life: 0.3, max: 0.3, col: '#c9b27c', size: 2, grav: 60 }); }
function number(x, y, txt, col) { if (!SET.numbers && typeof txt === 'number') return; nums.push({ x, y, txt, col, life: 0.75, vy: -38 }); }
function hitstop(t) { if (SET.hitstop) stop = Math.max(stop, t); }
function shakeCam(n, k = 0) { if (SET.shake) { shake = Math.max(shake, n); kick += k; } }
function squash(sx, sy, t = 0.12) { P.sqX = sx; P.sqY = sy; P.sqT = t; }
function zoomKick(amt, t = 0.14) { if (SET.shake) { zoomAmt = Math.max(zoomAmt, amt); zoomT = Math.max(zoomT, t); } }
const invulnerable = () => P.inv > 0 || P.dodge > 0 || (window.BK && window.BK.god);
const COLS = { hopper: ['#5a9a3a', '#d8e0a0', '#3a6a2a'], archer: ['#3f5a33', '#6b4a2a', '#6faa4a'], frog: ['#5a9a3a', '#d8e0a0', '#c9463d'], sprig: ['#6faa4a', '#c9463d', '#3f6e2c'], shield: ['#5d4a8a', '#8a5a32', '#c9d1dc'], spit: ['#c9463d', '#f0e6c8', '#ff9a5c'], thorn: ['#5a3a24', '#e8dcc0', '#3a2214'], wasp: ['#e0b040', '#1b1626', '#dfe8ff'], queen: ['#e0b040', '#1b1626', '#fff1a0', '#c9463d'] };

// ---------- damage ----------
function damagePlayer(fromX, dmg, { up = false, unblockable = false } = {}) {
  if (P.dead || invulnerable()) return false;
  const front = Math.sign(fromX - P.x) === P.face || fromX === P.x;
  if (P.block && front && !unblockable) {
    if (P.st >= ST.blockHit) {
      P.st -= ST.blockHit; P.stDelay = ST.delay; blocks++;
      P.vx = -P.face * 90; hitstop(0.05); shakeCam(1.5, -P.face * 2); SFX.block();
      sparks(P.x + P.face * 9, P.y - 8, P.face, 7);
      return 'blocked';
    }
    P.st = 0; P.stFlash = 0.5; P.block = false; SFX.guardBreak(); SFX.gasp(); shakeCam(5, -P.face * 4); hitstop(0.1);
    dmg = Math.ceil(dmg / 2); P.hurt = 0.55;
    number(P.x, P.y - 22, 'GUARD BREAK', '#ffd36b');
  }
  dmg = Math.max(1, Math.round(dmg * DIFF[SET.difficulty].take));
  P.hp -= dmg; P.inv = 1.1; P.hurt = Math.max(P.hurt, 0.35); P.atk = -1; P.plunge = false; P.block = false;
  const dir = Math.sign(P.x - fromX) || -P.face;
  P.vx = dir * 150; P.vy = up ? -230 : -170; P.ground = false;
  hitstop(0.08); shakeCam(5, dir * 3); flash = 0.14; SFX.hurt();
  burst(P.x, P.y - 8, 8, ['#e04848', '#ffd36b'], 60, 0.4);
  number(P.x, P.y - 20, '-' + dmg, '#ff6b6b'); hitsTaken++;
  if (P.hp <= 0) die();
  return 'hit';
}
function die() {
  if (P.dead) return;
  P.dead = 1.2; deaths++; P.hp = 0; SFX.die(); shakeCam(7);
  burst(P.x, P.y - 8, 22, ['#c9d1dc', '#3d5aa8', '#c9463d'], 120, 0.9);
}
// Per-enemy death: a corpse object animates the fall so every foe dies its own way.
function spawnCorpse(e, dir) {
  const c = { t: e.t, x: e.x, y: e.y, vx: 0, vy: 0, rot: 0, spin: 0, face: e.face, life: 1, max: 1, frame: 0, grav: 900, bounced: false, ground: false };
  switch (e.t) {
    case 'sprig': case 'archer': Object.assign(c, { vx: dir * 90, vy: -190, spin: dir * 14, life: 1.0, max: 1.0 }); SFX.gobDie(); break;
    case 'hopper': Object.assign(c, { vx: dir * 70, vy: -160, spin: dir * 10, life: 0.9, max: 0.9 }); SFX.croak(); break;
    case 'shield': Object.assign(c, { vx: dir * 55, vy: -60, spin: 0, life: 1.1, max: 1.1, tip: true }); SFX.gobDie(); break;
    case 'wasp': Object.assign(c, { vx: dir * 30, vy: 10, spin: 11, life: 1.2, max: 1.2, wobble: true, grav: 500 }); break;
    case 'thorn': Object.assign(c, { vx: dir * 40, vy: -140, spin: 0, life: 1.3, max: 1.3, flip: true }); break;
    case 'spit':
      corpses.push({ t: 'cap', x: e.x, y: e.y - 6, vx: dir * 40, vy: -210, rot: 0, spin: dir * 9, face: e.face, life: 1.0, max: 1.0, frame: 0, grav: 900 });
      Object.assign(c, { t: 'stem', vx: 0, vy: 0, spin: 0, life: 0.6, max: 0.6, grav: 0, crumple: true }); break;
    case 'queen': Object.assign(c, { vx: -dir * 20, vy: -40, spin: dir * 1.5, life: 1.6, max: 1.6, grav: 500, royal: true }); break;
    case 'frog': Object.assign(c, { vx: -dir * 10, vy: -120, spin: dir * 0.8, life: 1.6, max: 1.6, grav: 600, royal: true }); break;
  }
  corpses.push(c);
}
function hurtEnemy(e, dmg, fromX, plunge) {
  if (e.t === 'queen' && e.mode === 'winded') dmg *= 2;
  if (e.t === 'frog' && (e.mode === 'croak' || e.mode === 'dazed')) { dmg *= 2; if (e.mode === 'croak') number(e.x, e.y - e.h - 16, 'THROAT', '#8fd160'); }
  if (e.t === 'frog' && e.mode === 'idle') { e.idleHits = (e.idleHits || 0) + 1; if (e.idleHits >= 2) { e.idleHits = 0; e.mode = 'hopAway'; e.modeT = 0.2; } }
  e.hp -= dmg; e.flash = 0.12; if (e.t !== 'queen') e.stagger = 0.35;
  if (e.t === 'thorn' && e.mode === 'charge') { e.mode = 'rest'; e.modeT = 0.7; }
  number(e.x, e.y - e.h - 6, dmg, plunge ? '#ffd36b' : '#fff6e0');
  const dir = Math.sign(e.x - fromX) || 1;
  if (e.hp <= 0) {
    e.alive = false; kills++; killFlash = 0.05; SFX.kill(); if (e.t === 'thorn' || e.t === 'shield' || e.t === 'queen') SFX.heavy();
    hitstop(e.t === 'queen' || e.t === 'frog' ? 0.25 : 0.09); shakeCam(e.t === 'queen' || e.t === 'frog' ? 8 : 3, dir * 2); zoomKick(e.t === 'queen' || e.t === 'frog' ? 1.18 : 1.07, e.t === 'queen' || e.t === 'frog' ? 0.5 : 0.14);
    burst(e.x, e.y - e.h / 2, e.t === 'queen' ? 40 : 12, COLS[e.t], 100, 0.6);
    sparks(e.x, e.y - e.h / 2, dir, 6);
    spawnCorpse(e, dir); beastSlain(e.t);
    if (e.t === 'queen' || e.t === 'frog') queenDies();
  } else {
    if (e.t === 'queen') SFX.bossHurt(); else if (e.t === 'frog') SFX.croak(); else if (e.t === 'sprig' || e.t === 'shield' || e.t === 'archer') SFX.gobHurt(); else SFX.hit();
    hitstop(0.05); shakeCam(1.5, dir * 1.5);
    sparks(e.x - dir * 2, e.y - e.h / 2, dir, 5);
    if (e.t !== 'wasp' && e.t !== 'spit' && e.t !== 'queen') e.vx = dir * (plunge ? 30 : 80);
    if ((e.t === 'queen' || e.t === 'frog') && e.hp <= e.maxHp / 2 && e.phase === 1) { e.phase = 2; number(e.x, e.y - 24, 'ENRAGED', '#ff6b6b'); SFX.roar(); }
  }
}
function breakCrate(tx, ty) {
  const i = ty * LW + tx; L.grid[i] = T.AIR; tileSpr[i] = null;
  SFX.crack(); hitstop(0.03); shakeCam(1.5);
  burst(tx * TS + 8, ty * TS + 8, 10, ['#8a5a32', '#a8743f', '#5c3a1d'], 80, 0.5, 350, 2);
  const key = tx + ',' + ty;
  if (!collectedCrates.has(key)) acorns.push({ x: tx * TS + 8, y: ty * TS + 8, got: false, ph: 0, crate: key, vy: -60 });
}

// ---------- player ----------
function attackBox() {
  if (P.plunge) return { l: P.x - 10, r: P.x + 10, t: P.y - 6, b: P.y + 12 };
  if (P.atk >= 0.04 && P.atk < 0.16) return P.face > 0 ? { l: P.x + 2, r: P.x + 19, t: P.y - 17, b: P.y - 1 } : { l: P.x - 19, r: P.x - 2, t: P.y - 17, b: P.y - 1 };
  return null;
}
function spend(cost) {
  if (P.st < cost) { P.stFlash = 0.35; return false; }
  P.st -= cost; P.stDelay = ST.delay; return true;
}
function updatePlayer(dt) {
  if (P.dead) { P.dead -= dt; if (P.dead <= 0) respawn(); return; }
  for (const k of ['inv', 'hurt', 'coyote', 'jbuf', 'abuf', 'dbuf', 'plungeRec', 'drop', 'dodgeCd', 'stFlash', 'sqT', 'stDelay', 'landT', 'guardTired']) P[k] = Math.max(0, P[k] - dt);
  if (P.stDelay <= 0 && P.st < P.maxSt) P.st = Math.min(P.maxSt, P.st + ST.regen * dt);
  P.hpShown += (P.hp - P.hpShown) * Math.min(1, dt * 6);
  const stunned = P.hurt > 0;
  const attacking = P.atk >= 0;
  const dodging = P.dodge > 0;
  P.block = !!keys.block && P.ground && !attacking && !P.plunge && !dodging && !stunned && P.guardTired <= 0 && P.st > 0;
  if (P.block) {
    P.st -= ST.hold * dt; P.stDelay = ST.delay;
    if (P.st <= 0) { P.st = 0; P.block = false; P.guardTired = 0.8; P.stFlash = 0.5; SFX.guardBreak(); number(P.x, P.y - 22, 'TIRED', '#ffd36b'); }
  }
  const move = (stunned || dodging) ? 0 : (keys.left ? -1 : 0) + (keys.right ? 1 : 0);
  if (P.onMover) { const m = P.onMover; if (P.x + 4 > m.x && P.x - 4 < m.x + m.w && Math.abs(P.y - m.y) < 3) { P.x += m.dx; P.y += m.dy || 0; } else P.onMover = null; }

  if (P.dbuf > 0 && P.ground && !attacking && !stunned && !P.plunge && !dodging && P.dodgeCd <= 0) {
    P.dbuf = 0;
    if (spend(ST.dodge)) { P.dodge = 0.3; P.dodgeCd = 0.5; P.vx = P.face * 215; P.block = false; dodges++; SFX.dodge(); dust(P.x, P.y, 5); squash(1.2, 0.8, 0.1); }
  }
  if (dodging) { P.dodge -= dt; ghosts.push({ x: P.x, y: P.y, face: P.face, life: 0.22, frame: Math.floor(Math.max(0, P.dodge) * 14) % 2 }); }

  const groundAtk = attacking && P.ground;
  const wading = !P.dead && (L.pools || []).some(p => p.shallow && P.x > p.x0 && P.x < p.x1 && P.y > p.y + 2);
  if (wading) { P.st = Math.max(0, P.st - 5 * dt); P.stDelay = Math.max(P.stDelay, 0.2); P.rippleT = (P.rippleT || 0) - dt; if (P.rippleT <= 0 && (Math.abs(P.vx) > 15 || !P.ground)) { P.rippleT = 0.28; ripples.push({ x: P.x, life: 1 }); } if (Math.abs(P.vx) > 20 && Math.random() < dt * 8) parts.push({ x: P.x + (Math.random() - 0.5) * 8, y: P.y - 1, vx: (Math.random() - 0.5) * 30, vy: -30, life: 0.3, max: 0.3, col: '#bfe6f5', size: 2, grav: 150 }); }
  const cap = P.block ? 32 : wading ? 46 : RUN;
  if (move && !groundAtk) {
    const acc = P.ground ? 1000 : 700;
    if (Math.abs(P.vx) > cap && Math.sign(P.vx) === move) P.vx = move * Math.max(cap, Math.abs(P.vx) - 400 * dt);
    else { P.vx += move * acc * dt; if (Math.abs(P.vx) > cap) P.vx = move * cap; }
    if (!attacking) P.face = move;
  } else if (!dodging) {
    const fr = P.ground ? (groundAtk ? 1600 : 1100) : 200;
    const s = Math.sign(P.vx); P.vx -= s * fr * dt; if (Math.sign(P.vx) !== s) P.vx = 0;
  } else { P.vx *= Math.pow(0.05, dt); }
  if (P.plunge) {
    P.vx *= Math.pow(0.15, dt);
    let best = null, bd = 30;
    for (const e of enemies) { if (!e.alive) continue; const dx = e.x - P.x, dy = (e.y - e.h) - P.y; if (dy > -6 && dy < 70 && Math.abs(dx) < bd) { bd = Math.abs(dx); best = e; } }
    if (best) P.vx += Math.sign(best.x - P.x) * Math.min(Math.abs(best.x - P.x) * 45, 700) * dt;
  }

  if (P.jbuf > 0 && (P.ground || P.coyote > 0) && !stunned && !P.plunge && !dodging && !P.block) {
    if (keys.down && P.ground && (P.groundTile === T.ONEWAY || P.groundTile === T.REED)) { P.drop = 0.2; P.jbuf = 0; }
    else { P.vy = JUMPV; P.ground = false; P.coyote = 0; P.jbuf = 0; P.onMover = null; P.canCut = true; SFX.jump(); dust(P.x, P.y, 3); squash(0.8, 1.2, 0.1); }
  }
  if (!keys.jump && P.canCut && P.vy < -110 && !P.plunge) P.vy = -110;

  if (P.abuf > 0 && !stunned && !P.plunge && !dodging) {
    if (!P.ground && (keys.down || P.abufDown)) { P.abuf = 0; P.abufDown = false; if (spend(ST.plunge)) { P.plunge = true; P.vy = Math.max(P.vy, 60); P.atk = -1; P.hitSet.clear(); SFX.slash(); } }
    else if (P.atk < 0 && P.plungeRec <= 0) { P.abuf = 0; if (spend(ST.swing)) { P.atk = 0; P.hitSet.clear(); SFX.slash(); if (Math.random() < 0.35) SFX.effort(); if (P.ground) P.vx = P.face * 75; } }
  }
  if (P.atk >= 0) {
    P.atk += dt; if (P.atk > 0.3) P.atk = -1;
    if (P.atk >= 0.03 && P.atk < 0.17) {
      const k = (P.atk - 0.03) / 0.14, ang = -1.9 + k * 2.6;
      const px0 = P.x + P.face * 2, py0 = P.y - 9;
      trail.push({ x0: px0, y0: py0, x: px0 + Math.cos(ang) * 18 * P.face, y: py0 + Math.sin(ang) * 18, life: 0.11 });
    }
  }

  P.vy += GRAV * dt * (P.plunge ? 1.6 : 1);
  const maxFall = P.plunge ? 340 : 270; if (P.vy > maxFall) P.vy = maxFall;

  const wasGround = P.ground, prevY = P.y;
  P.ground = false;
  const r = moveBody(P, P.vx * dt, P.vy * dt, P.drop > 0);
  if (r.hitX) P.vx = 0;
  if (r.ground) { P.ground = true; P.groundTile = r.groundTile; P.vy = 0; P.coyote = 0.1; }
  else if (r.hitY) P.vy = 0;
  if (!P.ground && wasGround && !P.onMover) P.coyote = 0.1;
  if (!P.ground && P.vy >= 0) for (const m of movers) {
    if (prevY <= m.y + 1 && P.y >= m.y && P.y <= m.y + 12 && P.x + 4 > m.x && P.x - 4 < m.x + m.w) { P.y = m.y; P.vy = 0; P.ground = true; P.groundTile = T.SOLID; P.onMover = m; P.coyote = 0.1; }
  }
  if (camLock) { P.x = Math.max(camLock.x0 + 6, Math.min(camLock.x1 - 6, P.x)); }
  if (P.ground && !wasGround) {
    if (P.plunge) {
      const ty = Math.floor((P.y + 2) / TS); let broke = false;
      for (const tx of [Math.floor((P.x - 4) / TS), Math.floor((P.x + 4) / TS)]) if (tileAt(tx, ty) === T.CRATE) { breakCrate(tx, ty); broke = true; }
      if (broke) { P.vy = POGO; P.ground = false; P.plunge = false; P.canCut = false; SFX.pogo(); P.hitSet.clear(); squash(0.8, 1.25, 0.1); }
      else { P.plunge = false; P.plungeRec = 0.12; shakeCam(3); dust(P.x, P.y, 10); SFX.thud(); squash(1.4, 0.6, 0.14); }
    } else { dust(P.x, P.y, 4); SFX.land(); squash(1.25, 0.75, 0.1); P.landT = 0.1; }
    pogoChain = 0;
    for (const d of decor) if (d.k === 'mushroom' && Math.abs(d.x - P.x) < 30 && Math.abs(d.y - P.y) < 20) d.wob = 0.4;
  }
  if (P.ground && Math.abs(P.vx) > 40 && !dodging) { P.dust -= dt; if (P.dust <= 0) { P.dust = 0.18; dust(P.x - P.face * 4, P.y, 1); SFX.step(); } for (const d of decor) if ((d.k === 'tuft' || d.k === 'flower') && Math.abs(d.x + 4 - P.x) < 12 && Math.abs(d.y + 5 - P.y) < 10) d.sway = 0.45; }
  for (const d of decor) if (d.k === 'bush' && d.birds && Math.abs(d.x + 13 - P.x) < 26 && Math.abs(d.y + 16 - P.y) < 24) { d.birds = false; SFX.bird(); for (let i = 0; i < 2 + (Math.random() * 2 | 0); i++) birds.push({ x: d.x + 6 + Math.random() * 14, y: d.y + 4, vx: (Math.random() < 0.5 ? -1 : 1) * (40 + Math.random() * 40), vy: -70 - Math.random() * 40, t: Math.random() * 3, life: 3 }); }
  P.anim += dt;

  const pb = box(P);
  for (let ty = Math.floor(pb.t / TS); ty <= Math.floor((pb.b - 1) / TS); ty++) for (let tx = Math.floor(pb.l / TS); tx <= Math.floor((pb.r - 1) / TS); tx++) {
    if (tileAt(tx, ty) === T.SPIKE && pb.b > ty * TS + 6) damagePlayer(tx * TS + 8, DMG.spike, { up: true, unblockable: true });
  }
  if (P.y > LH * TS + 30) { die(); P.dead = 0.6; }
  for (const p of (L.pools || [])) if (!P.dead && !p.shallow && P.x > p.x0 && P.x < p.x1 && P.y > p.y + 9) {
    burst(P.x, p.y, 16, ['#eefaff', '#bfe6f5', '#7fc4e0'], 90, 0.6, 500, 2); SFX.crack(); number(P.x, p.y - 14, 'SPLASH', '#bfe6f5');
    die(); P.dead = 0.8; break;
  }

  const hb = attackBox();
  if (hb) {
    for (const e of enemies) {
      if (!e.alive || P.hitSet.has(e)) continue;
      if (!overlap(hb, box(e))) continue;
      P.hitSet.add(e);
      if (P.plunge) {
        if (e.t === 'thorn' || (e.t === 'frog' && e.mode !== 'dazed')) {
          P.plunge = false; P.ground = false; P.canCut = false; P.hitSet.clear();
          SFX.clank(); sparks(P.x, P.y + 4, P.face, 8); number(e.x, e.y - e.h - 6, e.t === 'frog' ? 'CROWN OF THORNS' : 'SPINED', '#ffd36b');
          P.inv = 0; damagePlayer(e.x, e.t === 'frog' ? DMG.crown : DMG.spined, { up: true, unblockable: true }); P.vy = -250;
          continue;
        }
        if (e.t === 'queen') { e.headHits = (e.headHits || 0) + 1; e.headT = 4; if (e.headHits >= 3 && e.mode !== 'winded') { e.headHits = 0; e.mode = 'buck'; e.modeT = 0.3; e.vx = (Math.sign(e.x - P.x) || 1) * 320; e.vy = -60; P.inv = 0; P.vx = -e.vx * 0.7; P.vy = -170; P.hurt = 0.3; P.plunge = false; P.ground = false; number(e.x, e.y - 20, 'BUCKS', '#ff6b6b'); SFX.roar(); shakeCam(4); continue; } }
        hurtEnemy(e, PLUNGE_DMG, P.x, true); P.vy = POGO; P.ground = false; P.plunge = false; P.canCut = false; P.hitSet.clear(); SFX.pogo(); pogoCount++; pogoChain++; if (pogoChain === 3) { SFX.laugh(); number(P.x, P.y - 26, 'CHAIN!', '#8fd160'); } squash(0.8, 1.25, 0.1); continue;
      }
      const front = Math.sign(P.x - e.x) === e.face;
      if (e.t === 'shield' && front) {
        SFX.clank(); hitstop(0.05); P.vx = e.face * 170; P.vy = Math.min(P.vy, -70); P.ground = false; e.stagger = 0.4; P.atk = 0.22; shakeCam(2, e.face * 2);
        sparks(e.x + e.face * 8, e.y - 8, e.face, 7);
      } else hurtEnemy(e, SWORD_DMG, P.x, false);
    }
    for (const s of seeds) if (!s.dead && !s.reflected && overlap(hb, { l: s.x - 3, r: s.x + 3, t: s.y - 3, b: s.y + 3 })) { parries++; SFX.parry(); sparks(s.x, s.y, P.face, 6); number(s.x, s.y - 8, 'PARRY', '#8fd160'); if (s.arrow && s.owner && s.owner.alive) { const dx = s.owner.x - s.x, dy = (s.owner.y - 5) - s.y, d = Math.hypot(dx, dy) || 1; s.vx = dx / d * 260; s.vy = dy / d * 260; s.g = 0; s.reflected = true; s.life = 2; } else s.dead = true; }
    if (!P.plunge) for (let ty = Math.floor(hb.t / TS); ty <= Math.floor((hb.b - 1) / TS); ty++) for (let tx = Math.floor(hb.l / TS); tx <= Math.floor((hb.r - 1) / TS); tx++) if (tileAt(tx, ty) === T.CRATE) breakCrate(tx, ty);
  }
  const cb = { l: pb.l + 1, r: pb.r - 1, t: pb.t + 2, b: pb.b - 1 };
  for (const e of enemies) {
    if (!e.alive || e.flash > 0 || !overlap(cb, box(e))) continue;
    if (e.t === 'queen' && (e.mode === 'winded' || e.mode === 'sleep' || e.mode === 'slamRest')) continue;
    const stompable = !P.plunge && P.vy > 40 && pb.b <= e.y - e.h + 7 && P.dodge <= 0;
    if (e.t === 'frog' && (e.mode === 'sleep' || (e.mode === 'dazed' && !stompable))) continue;
    // stomp: falling onto a foe's head
    if (!P.plunge && P.vy > 40 && pb.b <= e.y - e.h + 7 && P.dodge <= 0) {
      P.hitSet.clear(); P.canCut = false; P.ground = false;
      if (e.t === 'thorn' || (e.t === 'frog' && e.mode !== 'dazed')) { P.inv = 0; SFX.clank(); sparks(P.x, P.y + 4, P.face, 8); number(e.x, e.y - e.h - 6, e.t === 'frog' ? 'CROWN OF THORNS' : 'SPINED', '#ffd36b'); damagePlayer(e.x, e.t === 'frog' ? DMG.crown : DMG.spined, { up: true, unblockable: true }); P.vy = -250; continue; }
      if (e.t === 'shield' || e.t === 'queen') { P.vy = keys.jump ? -260 : -190; SFX.clank(); sparks(e.x, e.y - e.h, P.face, 6); e.stagger = Math.max(e.stagger, 0.3); number(e.x, e.y - e.h - 6, 'HELM', '#c9d1dc'); squash(0.85, 1.2, 0.1); continue; }
      if (e.t === 'queen') { e.headHits = (e.headHits || 0) + 1; e.headT = 4; if (e.headHits >= 3 && e.mode !== 'winded') { e.headHits = 0; e.mode = 'buck'; e.modeT = 0.3; e.vx = (Math.sign(e.x - P.x) || 1) * 320; e.vy = -60; P.vx = -e.vx * 0.7; P.vy = -170; P.hurt = 0.3; P.ground = false; number(e.x, e.y - 20, 'BUCKS', '#ff6b6b'); SFX.roar(); shakeCam(4); continue; } }
      hurtEnemy(e, 10, P.x, true); P.vy = keys.jump ? -290 : -220; SFX.pogo(); squash(0.8, 1.25, 0.1); continue;
    }
    const res = damagePlayer(e.x, DMG[e.t]);
    if (res === 'blocked') {
      if (e.t === 'queen') { if (e.mode === 'dive' || e.mode === 'sweep') queenWinded(e, true); }
      else if (e.t !== 'wasp' && e.t !== 'spit') { e.vx = Math.sign(e.x - P.x) * 150; e.stagger = 0.5; if (e.t === 'thorn' && e.mode === 'charge') { e.mode = 'rest'; e.modeT = 0.9; } }
    }
  }
  for (const s of seeds) if (!s.dead && !s.reflected && overlap(cb, { l: s.x - 2, r: s.x + 2, t: s.y - 2, b: s.y + 2 })) { s.dead = true; damagePlayer(s.x - s.vx * 0.1, s.venom ? DMG.venom : s.arrow ? DMG.arrow : DMG.seed); }
  if (tongue && tongue.active && !P.dead && Math.abs(P.y - 8 - tongue.y) < 9 && ((tongue.dir > 0 && P.x > tongue.x0 && P.x < tongue.x0 + tongue.len) || (tongue.dir < 0 && P.x < tongue.x0 && P.x > tongue.x0 - tongue.len))) { const res = damagePlayer(tongue.x0, DMG.tongue); if (res === 'blocked') { tongue.active = false; boss.mode = 'dazed'; boss.modeT = 1.3; number(boss.x, boss.y - 24, 'BITTEN TONGUE', '#8fd160'); SFX.tongue(); } else if (res === 'hit') { P.vx = tongue.dir * -160; tongue.active = false; } }
  for (const a of acorns) {
    if (a.got) continue;
    if (a.vy !== undefined) { a.vy += 400 * dt; a.y += a.vy * dt; const ty = Math.floor((a.y + 3) / TS); if (isSolid(Math.floor(a.x / TS), ty)) { a.y = ty * TS - 3; a.vy = 0; } }
    if (Math.abs(a.x - P.x) < 10 && Math.abs(a.y - (P.y - 7)) < 12) { a.got = true; got++; coinCombo = coinComboT > 0 ? coinCombo + 1 : 0; coinComboT = 1.2; SFX.coinUp(Math.min(coinCombo, 10)); if (a.crate) collectedCrates.add(a.crate); burst(a.x, a.y, 6, ['#ffd36b', '#fff6c8'], 40, 0.35, -40, 1); flyCoins.push({ x: a.x - camX, y: a.y - 5 - camY, t: 0 }); }
  }
  for (const s of shrines) if (!s.lit && Math.abs(s.x - P.x) < 12 && Math.abs(s.y - P.y) < 20) { s.lit = true; checkpoint = { x: s.x, y: s.y }; P.hp = P.maxHp; P.st = P.maxSt; SFX.sting(); burst(s.x, s.y - 22, 14, ['#ffd36b', '#fff6c8', '#8fd160'], 50, 0.9, -30, 1); number(s.x, s.y - 40, 'SHRINE', '#ffd36b'); }
  if (gate && !L.arena && Math.abs(gate.x - P.x) < 12 && Math.abs(gate.y - P.y) < 30 && state === 'play') winLevel();
  // boss arena trigger
  if (L.arena && boss && boss.alive && !bossActive && P.x > L.arena.trigger - 40 * TS) music.preload('boss');
  if (L.arena && boss && boss.alive && !bossActive && P.x > L.arena.trigger && P.ground) bossStart();
}

// ---------- boss: the Hornet Queen ----------
function setWall(col, solid) {
  const A = L.arena; const top = A.floor / TS - 6, bot = A.floor / TS - 1;
  for (let ty = top; ty <= bot; ty++) { const i = ty * LW + col; L.grid[i] = solid ? T.SOLID : T.AIR; tileSpr[i] = solid ? TILE.vine[(ty + col) % 4] : null; }
}
function bossStart() {
  bossActive = true; boss.mode = 'wake'; boss.modeT = 1.6; camLock = { x0: L.arena.x0, x1: L.arena.x1 }; if (boss.t === 'frog') SFX.croak();
  setWall(L.arena.wallL, true); setWall(L.arena.wallR, true);
  SFX.roar(); shakeCam(6); music.stop(); bossMusicT = 1.1; number(boss.x, boss.y - 30, boss.t === 'frog' ? 'THE BULLFROG KING' : 'THE HORNET QUEEN', '#ffd36b'); zoomKick(1.1, 0.4);
  burst(L.arena.wallL * TS + 8, L.arena.floor - 40, 12, ['#2f3d2a', '#8fd160'], 60, 0.6); burst(L.arena.wallR * TS + 8, L.arena.floor - 40, 12, ['#2f3d2a', '#8fd160'], 60, 0.6);
}
function queenWinded(e, blocked) {
  e.mode = 'winded'; e.modeT = e.phase === 2 ? 1.1 : 1.5; e.vx = 0; e.vy = 0; e.y = L.arena.floor;
  shakeCam(4); SFX.thud(); dust(e.x, e.y, 10); number(e.x, e.y - 20, blocked ? 'STAGGERED' : 'WINDED', '#8fd160');
}
function queenDies() {
  bossWon = 2.2; bossActive = false; camLock = null; tongue = null; slowT = 1.0; music.play(L.music || 'theme');
  for (const e of enemies) if (e.alive && e.t === 'wasp' && e.drone) { e.alive = false; burst(e.x, e.y - 3, 8, COLS.wasp, 70, 0.5); spawnCorpse(e, 1); }
  setWall(L.arena.wallL, false); setWall(L.arena.wallR, false);
}
function updateQueen(e, dt) {
  const A = L.arena, floor = A.floor, p2 = e.phase === 2;
  e.modeT -= dt; e.anim += dt;
  if (e.headT > 0) { e.headT -= dt; if (e.headT <= 0) e.headHits = 0; }
  const drones = enemies.filter(d => d.alive && d.t === 'wasp' && d.drone).length;
  const hoverTo = (tx, ty, sp) => { e.vx += (Math.max(-sp, Math.min(sp, (tx - e.x) * 3)) - e.vx) * Math.min(1, dt * 4); e.vy += (Math.max(-sp, Math.min(sp, (ty - e.y) * 3)) - e.vy) * Math.min(1, dt * 4); };
  switch (e.mode) {
    case 'sleep': e.y = e.ty + Math.sin(e.anim * 1.5) * 3; return;
    case 'wake': hoverTo((A.x0 + A.x1) / 2, floor - 74, 60); if (e.modeT <= 0) { e.mode = 'hover'; e.modeT = 1.2; } break;
    case 'hover': {
      hoverTo(P.x + Math.sin(e.anim * 0.9) * 30, floor - 74 + Math.sin(e.anim * 2) * 6, p2 ? 110 : 75);
      e.face = Math.sign(P.x - e.x) || e.face;
      if (e.modeT <= 0) {
        // pick a move she hasn't just used; drones first if the swarm is thin
        const pool = ['dive', 'sweep', 'volley', 'slam']; if (drones < (p2 ? 3 : 2)) pool.push('call', 'call');
        let pick = pool[(Math.random() * pool.length) | 0]; if (pick === e.last) pick = pool[(Math.random() * pool.length) | 0];
        e.last = pick;
        if (pick === 'call') { e.mode = 'call'; e.modeT = 0.9; SFX.buzz(); number(e.x, e.y - 20, 'CALLS THE SWARM', '#ffd36b'); }
        else if (pick === 'dive') { e.mode = 'aim'; e.modeT = p2 ? 0.6 : 0.8; SFX.buzz(); }
        else if (pick === 'sweep') { e.mode = 'sweepStart'; e.modeT = 0.5; e.face = e.x < (A.x0 + A.x1) / 2 ? 1 : -1; }
        else if (pick === 'volley') { e.mode = 'volleyUp'; e.modeT = 0.7; SFX.buzz(); }
        else { e.mode = 'slamUp'; e.modeT = 0.8; SFX.buzz(); }
      }
      break;
    }
    // venom volley: climb, hang, then a fan of seeds straight down at you. Step through the gaps or slash them.
    case 'volleyUp': hoverTo(P.x, floor - 110, 140); if (e.modeT <= 0) { e.mode = 'volley'; e.modeT = 0.8; e.shots = 1; e.shotT = 0.1; } break;
    case 'volley': {
      hoverTo(P.x, floor - 110, 90); e.face = Math.sign(P.x - e.x) || e.face;
      e.shotT -= dt;
      if (e.shots > 0 && e.shotT <= 0) {
        e.shots--; e.shotT = 0.42; SFX.spit(); number(e.x, e.y - 18, 'VENOM', '#8fd160');
        const n = p2 ? 5 : 4, spread = 1.5;
        for (let i = 0; i < n; i++) { const a = Math.PI / 2 + (i - (n - 1) / 2) * (spread / (n - 1)) + (Math.random() - 0.5) * 0.1; seeds.push({ x: e.x, y: e.y - 4, vx: Math.cos(a) * 150, vy: Math.sin(a) * 150, dead: false, life: 3, venom: true }); }
      }
      if (e.modeT <= 0 && e.shots <= 0) { e.mode = 'rise'; e.modeT = 0.5; }
      break;
    }
    // slam: hover straight over you, drop like a stone, shockwaves run both ways along the floor. Jump them.
    case 'slamUp': hoverTo(P.x, floor - 96, 150); e.face = Math.sign(P.x - e.x) || e.face; if (e.modeT <= 0) { e.mode = 'slamHang'; e.modeT = p2 ? 0.45 : 0.6; number(e.x, e.y - 18, '!', '#ffd36b'); } break;
    case 'slamHang': e.vx = 0; e.vy = 0; if (e.modeT <= 0) { e.mode = 'slam'; e.vy = 250; e.vx = 0; SFX.charge(); } break;
    case 'slam': if (e.y >= floor) {
      e.y = floor; e.vy = 0; shakeCam(7); SFX.heavy(); dust(e.x, e.y, 14);
      for (const d of [-1, 1]) waves.push({ x: e.x + d * 12, y: floor, dir: d, life: 2.2, sp: p2 ? 190 : 150 });
      e.mode = 'slamRest'; e.modeT = p2 ? 0.55 : 0.8; number(e.x, e.y - 20, 'SLAM', '#ffd36b');
    } break;
    case 'slamRest': if (e.modeT <= 0) { e.mode = 'rise'; e.modeT = 0.6; } break;
    case 'buck': if (e.modeT <= 0) { e.vx = 0; e.vy = 0; e.mode = 'hover'; e.modeT = 1.2; } break;
    case 'call': hoverTo(e.x, floor - 84, 60); if (e.modeT <= 0) { for (let i = 0; i < 2; i++) { const dx = A.x0 + (A.x1 - A.x0) * (0.3 + i * 0.4) + (Math.random() - 0.5) * 30; enemies.push({ t: 'wasp', x: dx, y: floor - 40, hx: dx, hy: floor - 40, vx: 0, vy: 0, w: 8, h: 6, hp: EHP.wasp, face: -1, alive: true, dying: 0, anim: Math.random() * 6, flash: 0, stagger: 0, drone: true }); burst(dx, floor - 40, 6, COLS.wasp, 50, 0.4); } e.mode = 'hover'; e.modeT = p2 ? 1.2 : 1.8; } break;
    case 'aim': hoverTo(P.x, floor - 78, 140); e.face = Math.sign(P.x - e.x) || e.face; if (e.modeT <= 0) { const dx = P.x - e.x, dy = floor - e.y, d = Math.hypot(dx, dy) || 1, sp = p2 ? 280 : 220; e.vx = dx / d * sp; e.vy = dy / d * sp; e.mode = 'dive'; e.modeT = 1.2; SFX.charge(); } break;
    case 'dive': if (e.y >= floor || e.modeT <= 0) { e.y = Math.min(e.y, floor); queenWinded(e, false); } break;
    case 'winded': if (e.modeT <= 0) { e.mode = 'rise'; e.modeT = 0.6; } break;
    case 'rise': hoverTo(e.x, floor - 74, 130); if (e.modeT <= 0) { e.mode = 'hover'; e.modeT = p2 ? 1.3 : 2.0; } break;
    case 'sweepStart': hoverTo(e.face > 0 ? A.x0 + 16 : A.x1 - 16, floor - 16, 220); if (e.modeT <= 0) { e.mode = 'sweep'; e.modeT = 2.4; e.vx = e.face * (p2 ? 180 : 140); e.vy = 0; SFX.charge(); } break;
    case 'sweep': e.y += (floor - 16 - e.y) * Math.min(1, dt * 6); if ((e.face > 0 && e.x > A.x1 - 16) || (e.face < 0 && e.x < A.x0 + 16) || e.modeT <= 0) { e.vx = 0; e.mode = 'rise'; e.modeT = 0.6; if (p2 && Math.random() < 0.5) { e.mode = 'sweepStart'; e.modeT = 0.4; e.face = -e.face; } } break;
  }
  e.x += e.vx * dt; e.y += e.vy * dt;
  if (e.mode !== 'dive' && e.mode !== 'sweep') { e.x = Math.max(A.x0 + 14, Math.min(A.x1 - 14, e.x)); }
  else e.x = Math.max(A.x0 + 6, Math.min(A.x1 - 6, e.x));
  if (e.y > floor) e.y = floor;
  if (e.mode !== 'winded' && e.mode !== 'sleep') e.face = e.vx !== 0 && (e.mode === 'dive' || e.mode === 'sweep') ? Math.sign(e.vx) : (Math.sign(P.x - e.x) || e.face);
}

// ---------- boss: the Bullfrog King ----------
function updateFrog(e, dt) {
  const A = L.arena, floor = A.floor, p2 = e.phase === 2;
  e.modeT -= dt; e.anim += dt;
  const flies = enemies.filter(d => d.alive && d.t === 'wasp' && d.drone).length;
  e.vy += 1000 * dt; if (e.vy > 400) e.vy = 400;
  const grounded = e.y >= floor;
  switch (e.mode) {
    case 'sleep': e.y = floor; e.vy = 0; return;
    case 'wake': e.y = floor; e.vy = 0; if (e.modeT <= 0) { e.mode = 'idle'; e.modeT = 1.0; } break;
    case 'idle': e.y = floor; e.vy = 0; e.face = Math.sign(P.x - e.x) || e.face;
      if (e.modeT <= 0) {
        const pool = ['tongue', 'leap', 'spit']; if (flies < (p2 ? 3 : 2)) pool.push('croak', 'croak'); if (p2) pool.push('leap');
        let pick = pool[(Math.random() * pool.length) | 0]; if (pick === e.last) pick = pool[(Math.random() * pool.length) | 0]; e.last = pick;
        if (pick === 'tongue') { e.mode = 'tongueTell'; e.modeT = p2 ? 0.35 : 0.5; SFX.buzz(); }
        else if (pick === 'leap') { e.mode = 'crouch'; e.modeT = p2 ? 0.3 : 0.45; number(e.x, e.y - e.h - 12, '!', '#ffd36b'); }
        else if (pick === 'spit') { e.mode = 'spit'; e.modeT = 0.6; e.shots = p2 ? 2 : 1; e.shotT = 0.2; }
        else { e.mode = 'croak'; e.modeT = 1.0; SFX.croak(); number(e.x, e.y - e.h - 12, 'CROAK', '#ffd36b'); }
      }
      break;
    case 'tongueTell': if (e.modeT <= 0) { e.mode = 'tongue'; e.modeT = 0.55; tongue = { x0: e.x + e.face * 12, y: floor - 10, dir: e.face, len: 0, max: p2 ? 130 : 110, active: true }; SFX.tongue(); } break;
    case 'tongue': { const t = 0.55 - e.modeT; tongue.len = t < 0.2 ? tongue.max * (t / 0.2) : t < 0.35 ? tongue.max : tongue.max * Math.max(0, (0.55 - t) / 0.2); if (e.modeT <= 0) { tongue = null; e.mode = 'idle'; e.modeT = p2 ? 0.7 : 1.0; } break; }
    case 'hopAway': e.y = floor; e.vy = 0; if (e.modeT <= 0) { const dir = P.x < e.x ? 1 : -1; const tx = Math.max(A.x0 + 24, Math.min(A.x1 - 24, e.x + dir * 90)); e.mode = 'hop'; e.vy = -260; e.vx = (tx - e.x) / 0.52; e.modeT = 1; SFX.leap(); number(e.x, e.y - e.h - 12, 'HOP', '#9aa39a'); } break;
    case 'hop': e.x += e.vx * dt; if (e.vy > 0 && grounded) { e.y = floor; e.vy = 0; e.vx = 0; dust(e.x, e.y, 6); e.mode = 'idle'; e.modeT = 0.5; e.idleHits = 0; } break;
    case 'crouch': if (e.modeT <= 0) { e.mode = 'leap'; const dx = Math.max(A.x0 + 20, Math.min(A.x1 - 20, P.x)) - e.x; e.vy = -380; e.vx = dx / 0.76; e.modeT = 2; SFX.leap(); } break;
    case 'leap': e.x += e.vx * dt; if (e.vy > 0 && grounded) { e.y = floor; e.vy = 0; e.vx = 0; shakeCam(7); SFX.heavy(); zoomKick(1.12, 0.2); dust(e.x, e.y, 16); for (const d of [-1, 1]) waves.push({ x: e.x + d * 18, y: floor, dir: d, life: 2.2, sp: p2 ? 180 : 150 }); e.mode = 'dazed'; e.modeT = p2 ? 0.7 : 1.0; number(e.x, e.y - e.h - 12, 'DAZED', '#8fd160'); } break;
    case 'dazed': e.y = floor; e.vy = 0; if (e.modeT <= 0) { e.mode = 'idle'; e.modeT = 0.8; } break;
    case 'spit': { e.y = floor; e.vy = 0; e.shotT -= dt; if (e.shots > 0 && e.shotT <= 0) { e.shots--; e.shotT = 0.35; SFX.spit(); const n = 3; for (let i = 0; i < n; i++) { const dx = P.x - e.x, dir = Math.sign(dx) || e.face; const a = -1.15 + i * 0.2; seeds.push({ x: e.x + dir * 12, y: e.y - 10, vx: Math.cos(a) * 170 * dir, vy: Math.sin(a) * 170, dead: false, life: 3, venom: true, g: 320 }); } } if (e.modeT <= 0 && e.shots <= 0) { e.mode = 'idle'; e.modeT = 0.9; } break; }
    case 'croak': e.y = floor; e.vy = 0; if (e.modeT <= 0) { for (let i = 0; i < 2; i++) { const dx = e.x + (i ? 60 : -60) + (Math.random() - 0.5) * 30; enemies.push({ t: 'wasp', x: dx, y: floor - 42, hx: dx, hy: floor - 42, vx: 0, vy: 0, w: 8, h: 6, hp: EHP.wasp, face: -1, alive: true, dying: 0, anim: Math.random() * 6, flash: 0, stagger: 0, drone: true }); burst(dx, floor - 42, 6, COLS.wasp, 50, 0.4); } e.mode = 'idle'; e.modeT = 0.9; } break;
  }
  if (e.mode !== 'leap' && e.mode !== 'hop') e.y = Math.min(e.y, floor);
  e.x = Math.max(A.x0 + 16, Math.min(A.x1 - 16, e.x));
  if (e.mode !== 'leap' && e.mode !== 'dazed' && e.mode !== 'hop') e.face = Math.sign(P.x - e.x) || e.face;
}

// ---------- enemies ----------
function updateEnemies(dt) {
  for (const e of enemies) {
    if (!e.alive) continue;
    e.flash = Math.max(0, e.flash - dt); e.stagger = Math.max(0, e.stagger - dt); e.anim += dt;
    if (e.t === 'queen') { if (bossActive) beastSeen('queen'); if (bossActive || e.mode === 'sleep') updateQueen(e, dt); continue; }
    if (e.t === 'frog') { if (bossActive) beastSeen('frog'); if (bossActive || e.mode === 'sleep') updateFrog(e, dt); continue; }
    if (Math.abs(e.x - P.x) > 420) continue;
    if (Math.abs(e.x - P.x) < 190 && !(PROG.beasts && PROG.beasts[e.t] && PROG.beasts[e.t].seen)) beastSeen(e.t);
    if (e.t === 'wasp') {
      if (e.drone && !P.dead) { // hive drones dart at you, then drift back to their post
        e.dartT = (e.dartT === undefined ? 1.5 + Math.random() * 1.5 : e.dartT - dt);
        if (e.dart) { e.dart -= dt; e.x += e.dvx * dt; e.y += e.dvy * dt; if (e.dart <= 0) { e.dart = 0; e.dartT = 2.2 + Math.random() * 1.6; } e.face = Math.sign(e.dvx) || e.face; continue; }
        if (e.dartT <= 0 && Math.abs(P.x - e.x) < 160) { const dx = P.x - e.x, dy = (P.y - 8) - e.y, d = Math.hypot(dx, dy) || 1; e.dvx = dx / d * 150; e.dvy = dy / d * 150; e.dart = Math.min(0.7, d / 150); SFX.buzz(); number(e.x, e.y - 10, '!', '#ffd36b'); continue; }
        e.hx += (Math.max(L.arena ? L.arena.x0 + 20 : 0, Math.min(L.arena ? L.arena.x1 - 20 : 99999, e.x)) - e.hx) * Math.min(1, dt * 2); e.hy += ((L.arena ? L.arena.floor - 42 : e.hy) - e.hy) * Math.min(1, dt * 1.5);
        e.x += (e.hx + Math.sin(e.anim * 1.3) * 5 - e.x) * Math.min(1, dt * 3); e.y += (e.hy + Math.sin(e.anim * 2.4) * 5 - e.y) * Math.min(1, dt * 3); e.face = Math.sign(P.x - e.x) || e.face; continue;
      }
      e.x = e.hx + Math.sin(e.anim * 1.3) * 5; e.y = e.hy + Math.sin(e.anim * 2.4) * 5; e.face = Math.sign(Math.cos(e.anim * 1.3)) || 1; continue;
    }
    if (e.t === 'spit') {
      const near = Math.abs(e.x - P.x) < 150 && Math.abs(e.y - P.y) < 90 && !P.dead;
      if (near) e.face = Math.sign(P.x - e.x) || e.face;
      e.timer -= dt; e.mouth = Math.max(0, e.mouth - dt);
      if (near && e.timer <= 0) {
        e.timer = 1.8; e.mouth = 0.3;
        const sx = e.x + e.face * 8, sy = e.y - 8, dx = P.x - sx, dy = (P.y - 7) - sy, d = Math.hypot(dx, dy) || 1, sp = 125;
        seeds.push({ x: sx, y: sy, vx: dx / d * sp, vy: dy / d * sp, dead: false, life: 3 }); SFX.spit();
      }
      continue;
    }
    if (e.t === 'hopper') {
      const d = P.x - e.x, near = Math.abs(d) < 170 && Math.abs(e.y - P.y) < 80 && !P.dead;
      e.timer -= dt; e.vy += 1000 * dt; if (e.vy > 300) e.vy = 300;
      if (!e.air && e.stagger <= 0 && near && e.timer <= 0) { e.face = Math.sign(d) || e.face; e.vx = e.face * (60 + Math.min(40, Math.abs(d) * 0.3)); e.vy = -230; e.air = true; e.timer = 1.1 + Math.random() * 0.5; if (Math.random() < 0.4) SFX.croak(); }
      if (!e.air) e.vx *= Math.pow(0.02, dt);
      const oldY = e.y; e.x += e.vx * dt; e.y += e.vy * dt;
      // land on the raft it rode in on, or on tiles
      let landed = false;
      if (e.raft && e.vy >= 0 && oldY <= e.raft.y + 1 && e.y >= e.raft.y && e.x > e.raft.x - 2 && e.x < e.raft.x + e.raft.w + 2) { e.y = e.raft.y; e.vy = 0; landed = true; e.x += e.raft.dx; }
      else if (e.raft && !e.air && e.x > e.raft.x - 2 && e.x < e.raft.x + e.raft.w + 2 && Math.abs(e.y - e.raft.y) < 2) { e.x += e.raft.dx; landed = true; }
      else { const ty = Math.floor((e.y - 0.01) / TS); for (const tx of [Math.floor((e.x - 3) / TS), Math.floor((e.x + 3) / TS)]) { const t = tileAt(tx, ty); if (t === T.SOLID || t === T.CRATE || ((t === T.ONEWAY || t === T.REED) && oldY <= ty * TS + 0.5 && e.vy >= 0)) { e.y = ty * TS; e.vy = 0; landed = true; break; } } }
      if (landed && e.air) { e.air = false; dust(e.x, e.y, 3); e.stagger = 0.15; }
      if (!landed && e.vy > 0) e.air = true;
      // deep water swallows them
      if (e.vy > 0) for (const p of (L.pools || [])) if (!p.shallow && e.x > p.x0 && e.x < p.x1 && e.y > p.y + 6) { e.alive = false; burst(e.x, p.y, 8, ['#eefaff', '#bfe6f5'], 60, 0.4); SFX.splash(); break; }
      if (e.y > LH * TS + 20) e.alive = false;
      continue;
    }
    if (e.t === 'archer') {
      const d = P.x - e.x, ad = Math.abs(d), near = ad < 230 && Math.abs(e.y - P.y) < 70 && !P.dead;
      if (near) e.face = Math.sign(d) || e.face;
      e.timer -= dt; e.draw = Math.max(0, e.draw - dt);
      let want = 0;
      if (near && ad < 64 && e.draw <= 0) want = -e.face * e.speed * 1.6; // back off
      else if (near && ad > 170 && e.draw <= 0) want = e.face * e.speed * 0.6;
      if (near && e.timer <= 0 && e.draw <= 0 && ad > 40) { e.draw = 0.55; e.timer = 2.4; SFX.bow(); }
      if (e.draw > 0 && e.draw - dt <= 0) {
        const sx = e.x + e.face * 5, sy = e.y - 7, Tf = 0.75, G = 320, dx = P.x - sx, dy = (P.y - 8) - sy;
        seeds.push({ x: sx, y: sy, vx: Math.max(-200, Math.min(200, dx / Tf)), vy: dy / Tf - 0.5 * G * Tf, dead: false, life: 3, arrow: true, g: G, owner: e });
      }
      if (e.stagger > 0 || e.draw > 0) want = 0;
      e.vx += (want - e.vx) * Math.min(1, dt * 8);
      e.vy += 1000 * dt; if (e.vy > 270) e.vy = 270;
      const dirM = Math.sign(e.vx) || e.face; const aheadX = e.x + dirM * (e.w / 2 + 2), ftx = Math.floor(aheadX / TS), fty = Math.floor((e.y + 1) / TS);
      const aheadT = tileAt(ftx, fty);
      const r = moveBody(e, e.vx * dt, e.vy * dt, false);
      if (r.ground) e.vy = 0;
      if (r.ground && (aheadT === T.AIR || aheadT === T.SPIKE) && Math.sign(e.vx) === dirM) e.vx = 0; // won't step off into water
      if (r.hitX) e.vx = 0;
      continue;
    }
    let want = e.face * e.speed;
    if (e.t === 'shield') {
      const near = Math.abs(e.x - P.x) < 130 && Math.abs(e.y - P.y) < 40 && !P.dead;
      const wantFace = near ? (Math.sign(P.x - e.x) || e.face) : e.face;
      if (wantFace !== e.face && e.stagger <= 0) { e.turnT += dt; if (e.turnT > 0.5) { e.face = wantFace; e.turnT = 0; } } else e.turnT = 0;
      want = (near && Math.abs(e.x - P.x) > 14 && wantFace === e.face) ? e.face * e.speed : 0;
    }
    if (e.t === 'thorn') {
      const near = Math.abs(e.x - P.x) < 120 && Math.abs(e.y - P.y) < 30 && !P.dead;
      e.modeT -= dt;
      if (e.mode === 'walk' && near && e.stagger <= 0) { e.mode = 'wind'; e.modeT = 0.45; e.face = Math.sign(P.x - e.x) || e.face; }
      if (e.mode === 'wind') { want = 0; if (e.modeT <= 0) { e.mode = 'charge'; e.modeT = 1.1; SFX.charge(); } }
      else if (e.mode === 'charge') { want = e.face * 95; if (e.modeT <= 0) { e.mode = 'rest'; e.modeT = 0.8; } }
      else if (e.mode === 'rest') { want = 0; if (e.modeT <= 0) e.mode = 'walk'; }
    }
    if (e.stagger > 0) want = 0;
    e.vx += (want - e.vx) * Math.min(1, dt * (e.mode === 'charge' ? 14 : 8));
    e.vy += 1000 * dt; if (e.vy > 270) e.vy = 270;
    const aheadX = e.x + e.face * (e.w / 2 + 2), ftx = Math.floor(aheadX / TS), fty = Math.floor((e.y + 1) / TS);
    const aheadT = tileAt(ftx, fty), aheadUp = tileAt(ftx, fty - 1);
    const r = moveBody(e, e.vx * dt, e.vy * dt, false);
    if (r.ground) e.vy = 0;
    const edge = (aheadT === T.AIR || aheadT === T.SPIKE) || aheadUp === T.SPIKE;
    if (r.ground && edge && e.stagger <= 0 && Math.sign(e.vx) === e.face) {
      if (e.t === 'thorn' && e.mode === 'charge') { e.mode = 'rest'; e.modeT = 0.8; e.vx = 0; }
      else { e.face = -e.face; e.vx = 0; }
    }
    if (r.hitX) {
      if (e.t === 'thorn' && e.mode === 'charge') { e.mode = 'rest'; e.modeT = 1.0; e.stagger = 0.6; SFX.thud(); shakeCam(3); burst(e.x + e.face * 7, e.y - 4, 6, ['#c9b27c', '#e8dcc0'], 50, 0.3); }
      e.face = -e.face; e.vx = 0;
    }
  }
  for (const w of waves) {
    w.life -= dt; w.x += w.dir * w.sp * dt;
    if (Math.random() < dt * 30) parts.push({ x: w.x + (Math.random() - 0.5) * 6, y: w.y - Math.random() * 4, vx: w.dir * 30, vy: -60 - Math.random() * 60, life: 0.35, max: 0.35, col: Math.random() < 0.5 ? '#c9b27c' : '#8a5a32', size: 2, grav: 300 });
    if (L.arena && (w.x < L.arena.x0 + 4 || w.x > L.arena.x1 - 4)) w.life = 0;
    if (!P.dead && P.ground && Math.abs(P.x - w.x) < 9 && P.y > w.y - 4) { if (damagePlayer(w.x - w.dir * 20, DMG.wave)) w.life = 0; }
  }
  waves = waves.filter(w => w.life > 0);
  for (const s of seeds) {
    if (s.dead) continue; if (s.g) s.vy += s.g * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt;
    if (s.life <= 0 || isSolid(Math.floor(s.x / TS), Math.floor(s.y / TS))) { s.dead = true; burst(s.x, s.y, 3, [s.arrow ? '#e8dcc0' : '#ff9a5c'], 30, 0.2, 0, 1); continue; }
    if (s.reflected) for (const e of enemies) if (e.alive && e.t !== 'queen' && e.t !== 'frog' && overlap({ l: s.x - 3, r: s.x + 3, t: s.y - 3, b: s.y + 3 }, box(e))) { s.dead = true; hurtEnemy(e, 10, s.x - s.vx, false); number(e.x, e.y - e.h - 14, 'RETURNED', '#8fd160'); break; }
  }
  seeds = seeds.filter(s => !s.dead);
  if (bossMusicT > 0) { bossMusicT -= dt; if (bossMusicT <= 0 && bossActive) music.play('boss'); }
  if (bossWon > 0) { bossWon -= dt; if (Math.random() < dt * 6) burst(boss.x + (Math.random() - 0.5) * 40, boss.y - 10 - Math.random() * 20, 8, COLS.queen, 80, 0.5); if (bossWon <= 0) winLevel(); }
}
function updateCorpses(dt) {
  for (const c of corpses) {
    c.life -= dt;
    if (c.crumple) continue;
    c.vy += c.grav * dt; c.x += c.vx * dt; c.y += c.vy * dt;
    if (c.wobble) c.x += Math.sin(c.life * 18) * 30 * dt;
    if (c.flip) c.rot += (Math.PI - c.rot) * Math.min(1, dt * 12); else if (c.tip) c.rot += ((-c.face) * Math.PI / 2 - c.rot) * Math.min(1, dt * 7); else c.rot += c.spin * dt;
    if (c.flip && c.ground) c.frame = Math.floor(c.life * 12) % 2;
    const ty = Math.floor(c.y / TS);
    if (c.vy > 0 && isSolid(Math.floor(c.x / TS), ty)) {
      c.y = ty * TS; c.ground = true;
      if (c.t === 'wasp' || c.t === 'cap' || c.t === 'queen') { burst(c.x, c.y - 2, 6, COLS[c.t] || COLS.spit, 50, 0.4); if (c.t === 'queen') { shakeCam(6); SFX.heavy(); } c.vy = c.t === 'cap' ? -40 : 0; c.vx *= 0.4; if (c.t === 'wasp') c.life = Math.min(c.life, 0.25); }
      else if (!c.bounced) { c.vy = -c.vy * 0.35; c.bounced = true; c.vx *= 0.6; dust(c.x, c.y, 3); if (c.t === 'thorn') { SFX.stone(); } }
      else { c.vy = 0; c.vx *= 0.8; c.spin *= 0.3; }
    }
  }
  corpses = corpses.filter(c => c.life > 0);
}
function updateMovers(dt) {
  for (const m of movers) {
    const oldX = m.x, oldY = m.y; m.dy = 0;
    if (m.kind === 'pad') { // sinks while stood on, floats back up when left
      const on = P.onMover === m; m.sink = Math.max(0, Math.min(1, m.sink + (on ? 0.5 : -1.4) * dt)); m.y = m.y0 + m.sink * 16; m.dy = m.y - oldY;
      if (on && m.sink > 0.15 && Math.random() < dt * 6) parts.push({ x: m.x + Math.random() * m.w, y: m.y0 + 2, vx: 0, vy: -20, life: 0.3, max: 0.3, col: '#bfe6f5', size: 1, grav: 0 });
    } else if (m.kind === 'drift') { // rides the current against you and wraps around
      m.x -= m.speed * dt; if (m.x + m.w * 0.5 < m.x0) { m.x = m.x1; if (P.onMover === m) P.onMover = null; m.dx = 0; continue; }
      if (P.onMover === m && P.x < m.x0 + 4) P.onMover = null; // the log slides under the bank; you step off
    } else if (m.kind === 'raft') { // waits at the dock until you board, then poles downstream
      if (P.onMover === m && !m.done) m.moving = true;
      if (m.moving && m.frogs) { m.frogT = (m.frogT || 2) - dt; const aboard = enemies.filter(e => e.alive && e.t === 'hopper' && e.raft === m).length; if (m.frogT <= 0 && aboard < 2) { m.frogT = 3 + Math.random() * 2.5; const side = Math.random() < 0.5 ? -1 : 1; const fx = m.x + m.w / 2 + side * (m.w / 2 + 20); const target = m.x + m.w / 2 + side * (m.w / 2 - 22) + m.speed * 0.58; enemies.push({ t: 'hopper', x: fx, y: m.y + 26, vx: (target - fx) / 0.58, vy: -330, w: 8, h: 6, hp: EHP.hopper, face: -side, alive: true, dying: 0, anim: 0, flash: 0, stagger: 0, timer: 1.4, air: true, raft: m, drone: true }); burst(fx, m.y + 26, 8, ['#eefaff', '#bfe6f5'], 60, 0.4); SFX.splash(); number(fx, m.y + 10, 'FROG', '#8fd160'); } }
      if (m.moving) { m.x += m.speed * dt; if (m.x >= m.x1) { m.x = m.x1; m.moving = false; m.done = true; SFX.thud(); number(m.x + m.w / 2, m.y - 12, 'DOCKED', '#bfe6f5'); } if (Math.random() < dt * 8) parts.push({ x: m.x + (m.speed > 0 ? 0 : m.w), y: m.y + 6, vx: -30, vy: -10, life: 0.4, max: 0.4, col: '#eefaff', size: 2, grav: 0 }); }
    } else {
      m.p += m.dir * m.speed / m.range * dt;
      if (m.p >= 1) { m.p = 1; m.dir = -1; } else if (m.p <= 0) { m.p = 0; m.dir = 1; }
      m.x = m.x0 + m.p * m.range;
    }
    m.dx = m.x - oldX;
  }
}
const dusk = () => L && L.duskStart !== undefined ? Math.max(0, Math.min(1, (camX - L.duskStart) / L.duskLen)) : 0;
function updatePolish(dt) {
  coinComboT = Math.max(0, coinComboT - dt);
  for (const f of flyCoins) f.t += dt * 2.4; flyCoins = flyCoins.filter(f => f.t < 1);
  for (const r of ripples) r.life -= dt * 1.4; ripples = ripples.filter(r => r.life > 0);
  for (const e of enemies) if (e.alive && e.t === 'hopper' && !e.air && Math.random() < dt * 0.5) for (const p of (L.pools || [])) if (p.shallow && e.x > p.x0 && e.x < p.x1 && Math.abs(e.y - (p.y + 12)) < 8) ripples.push({ x: e.x, life: 1 });
  if (P.hp > 0 && P.hp <= 30 && !P.dead) { heartT -= dt; if (heartT <= 0) { heartT = P.hp <= 15 ? 0.55 : 0.85; SFX.heart(); } } else heartT = 0;
  if (dusk() > 0.5 && SET.ambient) { cricketT -= dt; if (cricketT <= 0) { cricketT = 0.5 + Math.random() * 1.2; SFX.cricket(); } }
  for (const c of clouds) { c.x += c.sp * dt; if (c.x > camX * 0.1 + VW + 80) c.x -= VW + 160; }
  fishT -= dt;
  if (fishT <= 0) { fishT = 3 + Math.random() * 5; const pools = (L.pools || []).filter(p => !p.shallow && p.x1 > camX && p.x0 < camX + VW); if (pools.length) { const p = pools[(Math.random() * pools.length) | 0]; const x = Math.max(p.x0 + 12, Math.min(p.x1 - 12, camX + Math.random() * VW)); fish.push({ x, y: p.y + 2, vx: (Math.random() < 0.5 ? -1 : 1) * 30, vy: -110, sy: p.y + 2, life: 1.5 }); SFX.fish(); burst(x, p.y, 4, ['#eefaff', '#bfe6f5'], 40, 0.3, 300, 1); } }
  for (const f of fish) { f.vy += 380 * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.life -= dt; if (f.vy > 0 && f.y >= f.sy) { f.life = 0; burst(f.x, f.sy, 5, ['#eefaff', '#bfe6f5'], 50, 0.3, 300, 1); } }
  fish = fish.filter(f => f.life > 0);
}
const weatherAt = () => { let w = null; for (const z of (L.weather || [])) if (camX + VW / 2 >= z.x0 && camX + VW / 2 < z.x1) w = w ? w + '+' + z.kind : z.kind; return w || ''; };
function updateWeather(dt) {
  const w = weatherAt();
  if (SET.ambient && w.includes('rain')) {
    for (let i = 0; i < 3; i++) if (drops.length < 90) drops.push({ x: camX - 20 + Math.random() * (VW + 60), y: camY - 10, vx: -50, vy: 300 + Math.random() * 60, life: 1.2 });
    lightT -= dt; if (lightT <= 0) { lightT = 7 + Math.random() * 9; lightFlash = 0.18; thunderT = 0.5 + Math.random() * 0.6; }
  }
  for (const d of drops) { d.life -= dt; d.x += d.vx * dt; d.y += d.vy * dt; if (d.y > camY + VH + 4) d.life = 0; }
  drops = drops.filter(d => d.life > 0);
  lightFlash = Math.max(0, lightFlash - dt); if (thunderT > 0) { thunderT -= dt; if (thunderT <= 0) { SFX.thunder(); shakeCam(2); } }
  if (SET.ambient && w.includes('pollen')) { if (pollen.length < 28 && Math.random() < dt * 8) pollen.push({ x: camX + Math.random() * VW, y: camY + Math.random() * VH * 0.8, t: Math.random() * 6, life: 8 }); }
  for (const p of pollen) { p.t += dt; p.life -= dt; p.x += (8 + Math.sin(p.t * 1.1) * 10) * dt; p.y += (4 + Math.cos(p.t * 0.9) * 8) * dt; }
  pollen = pollen.filter(p => p.life > 0 && p.x < camX + VW + 10 && p.x > camX - 10);
  for (const b of birds) { b.t += dt; b.life -= dt; b.x += b.vx * dt; b.y += b.vy * dt; b.vy += Math.sin(b.t * 6) * 30 * dt - 10 * dt; }
  birds = birds.filter(b => b.life > 0);
  for (const d of decor) { if (d.sway > 0) d.sway = Math.max(0, d.sway - dt); if (d.wob > 0) d.wob = Math.max(0, d.wob - dt); }
  zoomT = Math.max(0, zoomT - dt); if (zoomT <= 0) zoomAmt = 1;
  // ambient bed by zone, and the music ducks while something winds up nearby
  let amb = 'forest'; for (const z of (L.ambient || [])) if (camX + VW / 2 >= z.x0 && camX + VW / 2 < z.x1) amb = z.kind; ambient.set(amb);
  const tense = enemies.some(e => e.alive && Math.abs(e.x - P.x) < 220 && ((e.t === 'thorn' && (e.mode === 'wind' || e.mode === 'charge')) || (e.t === 'queen' && (e.mode === 'aim' || e.mode === 'slamHang')) || (e.t === 'frog' && (e.mode === 'crouch' || e.mode === 'tongueTell'))));
  music.duck(tense);
}
function updateParticles(dt) {
  for (const p of parts) { p.life -= dt; p.vy += p.grav * dt; p.x += p.vx * dt; p.y += p.vy * dt; }
  parts = parts.filter(p => p.life > 0);
  for (const n of nums) { n.life -= dt; n.y += n.vy * dt; n.vy *= Math.pow(0.05, dt); }
  nums = nums.filter(n => n.life > 0);
  for (const gh of ghosts) gh.life -= dt; ghosts = ghosts.filter(gh => gh.life > 0);
  for (const t of trail) t.life -= dt; trail = trail.filter(t => t.life > 0);
  killFlash = Math.max(0, killFlash - dt);
  const want = SET.ambient ? 6 + Math.round(dusk() * 14) : 0;
  if (fireflies.length < want && Math.random() < dt * 3) fireflies.push({ x: camX + Math.random() * VW, y: camY + 20 + Math.random() * (VH - 60), t: Math.random() * 6, life: 6 + Math.random() * 6 });
  for (const f of fireflies) { f.t += dt; f.life -= dt; f.x += Math.sin(f.t * 1.7) * 14 * dt; f.y += Math.cos(f.t * 1.3) * 10 * dt; }
  fireflies = fireflies.filter(f => f.life > 0 && f.x > camX - 20 && f.x < camX + VW + 20);
  if (SET.ambient && Math.random() < dt * 2.5) leaves.push({ x: camX + Math.random() * (VW + 60) - 30, y: camY - 6, t: Math.random() * 6, life: 9, col: ['#8fd160', '#e0b040', '#c9463d', '#5aa33e'][(Math.random() * 4) | 0] });
  for (const l of leaves) { l.t += dt; l.life -= dt; l.y += 22 * dt; l.x += Math.sin(l.t * 2.2) * 18 * dt + 6 * dt; }
  leaves = leaves.filter(l => l.life > 0 && l.y < camY + VH + 10);
}
function updateCamera(dt) {
  const tx = P.x + P.face * 26 - VW / 2, ty = P.y - 104;
  camX += (tx - camX) * Math.min(1, dt * 5); camY += (ty - camY) * Math.min(1, dt * 4);
  const x0 = camLock ? camLock.x0 - 8 : 0, x1 = camLock ? camLock.x1 + 8 - VW : LW * TS - VW;
  camX = Math.max(x0, Math.min(x1, camX)); camY = Math.max(0, Math.min(LH * TS - VH, camY));
  shake = Math.max(0, shake - dt * 18); kick *= Math.pow(0.002, dt);
}

function update(dt) {
  time += dt;
  if (state === 'title') { ambient.set('forest'); if (fireflies.length < 12 && Math.random() < dt * 4) fireflies.push({ x: camX + Math.random() * VW, y: camY + 30 + Math.random() * (VH - 70), t: Math.random() * 6, life: 5 + Math.random() * 5 }); for (const f of fireflies) { f.t += dt; f.life -= dt; f.x += Math.sin(f.t * 1.7) * 14 * dt; f.y += Math.cos(f.t * 1.3) * 10 * dt; } fireflies = fireflies.filter(f => f.life > 0); if (pausePress) openMenu('title'); else if (anyPress) { state = 'map'; map.node = Math.min(NODES.length - 1, PROG.mapNode || 0); map.seg = NODE_AT[map.node]; map.t = 0; map.walking = 0; SFX.uiSel(); music.play('select'); } return; }
  if (state === 'map') { updateMap(dt); updateParticles(dt); return; }
  if (state === 'store') { updateStore(dt); updateParticles(dt); return; }
  if (state === 'bestiary') {
    if (upPress) { bestI = (bestI + BEASTS.length - 1) % BEASTS.length; SFX.ui(); }
    if (downPress) { bestI = (bestI + 1) % BEASTS.length; SFX.ui(); }
    if (pausePress || confirmPress) { state = 'map'; SFX.ui(); }
    updateParticles(dt);
    return;
  }
  if (state === 'menu') {
    menuMsgT = Math.max(0, menuMsgT - dt);
    if (upPress) { menuI = (menuI + MENU.length - 1) % MENU.length; SFX.ui(); }
    if (downPress) { menuI = (menuI + 1) % MENU.length; SFX.ui(); }
    if (leftPress) menuAdjust(-1); if (rightPress) menuAdjust(1);
    if (confirmPress) menuConfirm();
    if (pausePress) { state = menuFrom; SFX.uiSel(); }
    return;
  }
  if (state === 'intro') {
    intro.t += dt; const line = INTRO[intro.card];
    if (intro.chars < line.length) { const n = intro.chars; intro.chars = Math.min(line.length, intro.chars + dt * 28); if (Math.floor(intro.chars) > Math.floor(n) && line[Math.floor(n)] !== ' ') SFX.text(); }
    intro.kx = Math.min(56, intro.kx + 14 * dt);
    if (confirmPress || atkPress) introNext();
    if (pausePress) startGame();
    updateParticles(dt);
    return;
  }
  if (state === 'win') { if (confirmPress) { state = 'map'; map.node = NODES.findIndex(n => n.level === levelIndex); map.seg = NODE_AT[map.node]; map.t = 0; map.walking = 0; PROG.mapNode = map.node; saveProgress(); music.play('select'); } updateParticles(dt); updateCorpses(dt); updateWeather(dt); updateCamera(dt); return; }
  if (pausePress) { openMenu('play'); return; }
  if (jumpPress) P.jbuf = 0.12; if (atkPress) { P.abuf = 0.15; P.abufDown = !!keys.down && !P.ground; } if (dodgePress) P.dbuf = 0.12;
  if (stop > 0) { stop -= dt; return; }
  levelTime += dt;
  slowT = Math.max(0, slowT - dt); const wdt = slowT > 0 ? dt * 0.3 : dt;
  updateMovers(wdt); updatePlayer(wdt); updateEnemies(wdt); updateCorpses(wdt); updateParticles(wdt); updateWeather(dt); updateCamera(dt);
  updatePolish(dt);
  flash = Math.max(0, flash - dt);
}

// ---------- render ----------
function text(s, x, y, col = '#fff6e0', align = 'left', size = 8) {
  g.font = size + 'px "Press Start 2P", monospace'; g.textAlign = align; g.textBaseline = 'top';
  g.fillStyle = ART.OUT; g.fillText(s, x + 1, y + 1); g.fillStyle = col; g.fillText(s, x, y);
}
function wrap(s, maxW) { const words = s.split(' '), lines = []; let cur = ''; g.font = '8px "Press Start 2P", monospace'; for (const w of words) { const t = cur ? cur + ' ' + w : w; if (g.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; } if (cur) lines.push(cur); return lines; }
function pickFrame(set, key, frame, face) {
  const dir = face < 0 ? 'L' : 'R'; let c = key == null ? set[dir] : set[dir][key]; if (Array.isArray(c)) c = c[((frame % c.length) + c.length) % c.length]; return c;
}
function drawSet(set, key, frame, x, y, face, white, sx = 1, sy = 1, alpha = 1) {
  const c = pickFrame(white ? set.white : set, key, frame, face);
  const ax = face < 0 ? c.width - set.ax : set.ax;
  if (sx === 1 && sy === 1 && alpha === 1) { g.drawImage(c, Math.round(x - ax), Math.round(y - set.ay)); return; }
  g.save(); g.globalAlpha = alpha; g.translate(Math.round(x), Math.round(y)); g.scale(sx, sy); g.drawImage(c, -ax, -set.ay); g.restore();
}
// Rotated draw about the sprite's centre (for corpses).
function drawRot(set, frame, x, y, face, rot, alpha = 1) {
  const c = pickFrame(set, null, frame, face); const ax = face < 0 ? c.width - set.ax : set.ax;
  g.save(); g.globalAlpha = alpha; g.translate(Math.round(x), Math.round(y - c.height / 2)); g.rotate(rot); g.drawImage(c, -ax, -(set.ay - c.height / 2)); g.restore();
}
function drawLayer(c, f, baseY, cx, cy) {
  const w = c.width; const dY = (LH * TS - VH) - cy;
  let x = ((-cx * f) % w + w) % w; if (x > 0) x -= w;
  const y = Math.round(baseY + dY * f);
  for (; x < VW; x += w) g.drawImage(c, Math.round(x), y);
}
function bar(x, y, w, h, frac, col, ghost = null, colGhost = '#fff6e0') {
  g.fillStyle = ART.OUT; g.fillRect(x - 1, y - 1, w + 2, h + 2);
  g.fillStyle = '#2a2230'; g.fillRect(x, y, w, h);
  if (ghost !== null && ghost > frac) { g.fillStyle = colGhost; g.fillRect(x, y, Math.round(w * ghost), h); }
  g.fillStyle = col; g.fillRect(x, y, Math.round(w * Math.max(0, frac)), h);
  g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(x, y, Math.round(w * Math.max(0, frac)), 1);
}
function drawWater(cx, cy, surfaceOnly = false) {
  for (const p of (L.pools || [])) {
    if (p.x1 < cx || p.x0 > cx + VW || p.y > cy + VH) continue;
    const x0 = Math.max(p.x0, cx) - cx, x1 = Math.min(p.x1, cx + VW) - cx, y = p.y - cy, h = p.shallow ? (p.depth || 22) : VH - y;
    if (!surfaceOnly) {
      if (p.shallow) {
        const d = p.depth || 22;
        g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgba(70,120,160,0.7)'; g.fillRect(x0, y, x1 - x0, d); g.globalCompositeOperation = 'source-over';
        g.fillStyle = 'rgba(30,60,50,0.35)'; g.fillRect(x0, y + d - 2, x1 - x0, 2); // silt line
        g.fillStyle = 'rgba(200,235,255,0.22)';
        for (let x = p.x0 + 4; x < p.x1; x += 9) { const sx = x + Math.round(Math.sin(time * 1.6 + x * 0.21) * 3) - cx; if (sx > x0 && sx < x1 - 2) { g.fillRect(sx, y + 6 + Math.round(Math.sin(time * 2 + x) * 2), 2, 1); g.fillRect(sx + 3, y + 14 + Math.round(Math.cos(time * 1.7 + x) * 2), 3, 1); } }
      }
      else {
        const gr = g.createLinearGradient(0, y, 0, y + Math.max(40, h)); gr.addColorStop(0, '#5aa6c9'); gr.addColorStop(0.35, '#3b7fae'); gr.addColorStop(1, '#22456e');
        g.fillStyle = gr; g.fillRect(x0, y, x1 - x0, h);
        g.fillStyle = 'rgba(160,215,240,0.18)';
        for (let x = p.x0; x < p.x1; x += 14) { const sx = x + Math.round(Math.sin(time * 0.8 + x * 0.05) * 3) - cx; if (sx > x0 && sx < x1 - 3) g.fillRect(sx, y + 6, 3, h); }
      }
      continue;
    }
    if (p.shallow) { // the water itself, over the legs of whoever is wading; lighter near the surface
      const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, 'rgba(90,175,215,0.5)'); gr.addColorStop(1, 'rgba(40,110,150,0.55)');
      g.fillStyle = gr; g.fillRect(x0, y, x1 - x0, h);
      // wet mud lips on the banks
      g.fillStyle = '#3d3128'; g.fillRect(x0 - 1, y - 2, 2, h + 2); g.fillRect(x1 - 1, y - 2, 2, h + 2); g.fillStyle = 'rgba(40,30,20,0.5)'; g.fillRect(x0 - 8, y - 4, 8, 2); g.fillRect(x1, y - 4, 8, 2);
      for (const r of ripples) if (r.x > p.x0 && r.x < p.x1) { g.globalAlpha = Math.max(0, r.life) * 0.7; g.strokeStyle = '#dff5ff'; g.lineWidth = 1; g.beginPath(); g.ellipse(Math.round(r.x - cx), Math.round(p.y - cy) + 1, (1 - r.life) * 14 + 2, ((1 - r.life) * 14 + 2) * 0.3, 0, 0, 7); g.stroke(); }
      g.globalAlpha = 1;
    }
    // surface: a bright band with travelling crests, and a darker line under it
    g.fillStyle = '#bfe6f5'; g.fillRect(x0, y, x1 - x0, 2);
    g.fillStyle = '#7fc4e0'; g.fillRect(x0, y + 2, x1 - x0, 1);
    g.fillStyle = '#eefaff';
    for (let x = p.x0; x < p.x1; x += 7) { const ph = Math.sin(time * 2.4 + x * 0.35); const sx = x + Math.round((time * 9) % 7) - cx; if (ph > 0.2 && sx >= x0 && sx < x1 - 3) g.fillRect(sx, y - 1 + (ph > 0.8 ? -1 : 0), 3, 1); }
    // foam where the stream meets the banks, and a few rising bubbles
    g.fillStyle = 'rgba(240,250,255,0.85)';
    for (const bx of [p.x0, p.x1 - 3]) { if (bx - cx < -3 || bx - cx > VW) continue; for (let k = 0; k < 5; k++) { const w = Math.sin(time * 5 + k * 1.7 + bx) > 0 ? 3 : 2; g.fillRect(bx - cx + (bx === p.x0 ? 0 : 3 - w), y + k * 2 - 1, w, 1); } }
    g.fillStyle = 'rgba(220,245,255,0.7)';
    for (let k = 0; k < 4; k++) { const t = (time * 0.6 + k * 0.37) % 1; const bx = p.x0 + 8 + ((k * 53) % Math.max(1, p.x1 - p.x0 - 16)) - cx; const by = y + 30 - t * 28; if (bx > x0 && bx < x1 && by > y + 2) g.fillRect(bx, by, 2, 2); }
  }
}
function drawWorld(cx, cy, showPlayer) {
  g.drawImage(BG.sky, 0, 0, 1, VH, 0, 0, VW, VH);
  const dk = dusk();
  if (dk > 0) { g.globalAlpha = dk; g.drawImage(BG.skyDusk, 0, 0, 1, VH, 0, 0, VW, VH); g.drawImage(BG.sun, Math.round(VW * 0.7 - cx * 0.03), Math.round(70 - dk * 30 + ((LH * TS - VH) - cy) * 0.1)); g.globalAlpha = 1; }
  if (!(L.weather || []).length || !weatherAt().includes('rain')) for (const c of clouds) { const x = Math.round(c.x - cx * 0.1), y = Math.round(c.y + ((LH * TS - VH) - cy) * 0.05); g.globalAlpha = 0.85; g.drawImage(CLOUD[c.k], ((x % (VW + 160)) + VW + 160) % (VW + 160) - 80, y); g.globalAlpha = 1; }
  drawLayer(BG.far, 0.15, VH - 90, cx, cy);
  drawLayer(BG.mid, 0.3, VH - 140, cx, cy);
  drawLayer(BG.near, 0.55, -120, cx, cy);
  const tx0 = Math.floor(cx / TS), ty0 = Math.floor(cy / TS);
  for (let ty = ty0; ty <= ty0 + 12; ty++) for (let tx = tx0; tx <= tx0 + 21; tx++) {
    if (tx < 0 || ty < 0 || tx >= LW || ty >= LH) continue;
    const s = tileSpr[ty * LW + tx]; if (s) g.drawImage(s, tx * TS - cx, ty * TS - cy - (L.grid[ty * LW + tx] === T.REED ? 8 : 0));
  }
  drawWater(cx, cy, false);
  for (const m of movers) {
    if (m.x + m.w < cx - 10 || m.x > cx + VW + 10) continue;
    if (m.kind === 'pad') g.drawImage(PROP.pad[m.sink > 0.55 ? 1 : 0], Math.round(m.x) - cx, Math.round(m.y) - cy);
    else if (m.kind === 'raft') g.drawImage(PROP.raft, Math.round(m.x) - cx, m.y - cy);
    else if (m.kind === 'drift') { g.save(); g.beginPath(); g.rect(m.x0 - cx, 0, m.x1 + m.w - m.x0, VH); g.clip(); const n = m.w / TS; for (let i = 0; i < n; i++) g.drawImage(i === 0 ? TILE.logL : i === n - 1 ? TILE.logR : TILE.log[i % 3], Math.round(m.x) + i * TS - cx, m.y - cy); g.restore(); }
    else { const n = m.w / TS; for (let i = 0; i < n; i++) g.drawImage(i === 0 ? TILE.logL : i === n - 1 ? TILE.logR : TILE.log[i % 3], Math.round(m.x) + i * TS - cx, m.y - cy); }
  }
  if (boss && boss.t === 'frog') g.drawImage(PROP.throne, Math.round(boss.x) - 32 - cx, L.arena.floor - 4 - cy);
  for (const d of decor) if (d.x > cx - 30 && d.x < cx + VW + 4) {
    if (d.sway > 0) g.drawImage(d.c, d.x - cx + Math.round(Math.sin(time * 28) * d.sway * 3), d.y - cy);
    else if (d.wob > 0) { const k = 1 + Math.sin(time * 30) * d.wob * 0.4; g.drawImage(d.c, Math.round(d.x - cx + d.c.width * (1 - k) / 2), Math.round(d.y - cy + d.c.height * (1 - k)), Math.round(d.c.width * k), Math.round(d.c.height * k)); }
    else g.drawImage(d.c, d.x - cx, d.y - cy);
  }
  for (const s of signs) g.drawImage(PROP.sign, s.x - 9 - cx, s.y - 18 - cy);
  for (const s of shrines) { g.drawImage(PROP.shrine[s.lit ? 1 : 0], s.x - 10 - cx, s.y - 34 - cy); if (s.lit) { g.globalAlpha = 0.25 + Math.sin(time * 5) * 0.08; g.fillStyle = '#ffd36b'; g.beginPath(); g.arc(s.x - cx, s.y - 24 - cy, 14, 0, 7); g.fill(); g.globalAlpha = 1; } }
  if (gate) g.drawImage(PROP.gate, gate.x - 24 - cx, gate.y - 52 - cy);
  for (const a of acorns) if (!a.got && a.x > cx - 10 && a.x < cx + VW + 10) g.drawImage(PROP.coin[Math.floor(time * 8 + a.ph) % 4], a.x - 4 - cx, Math.round(a.y - 5 + Math.sin(time * 4 + a.ph) * 1.5) - cy);
  for (const c of corpses) {
    if (c.x < cx - 40 || c.x > cx + VW + 40) continue;
    const al = Math.min(1, c.life / c.max * 2.5);
    if (c.t === 'cap') drawRot(PARTS.cap, 0, c.x - cx, c.y - cy, c.face, c.rot, al);
    else if (c.t === 'stem') { const k = c.life / c.max; drawSet(PARTS.stem, null, 0, c.x - cx, c.y - cy, c.face, false, 1 + (1 - k) * 0.4, Math.max(0.1, k), al); }
    else drawRot(SPR[c.t], c.frame, c.x - cx, c.y - cy, c.face, c.rot, al);
  }
  for (const e of enemies) {
    if (!e.alive || e.x < cx - 40 || e.x > cx + VW + 40) continue;
    if (e.t !== 'wasp' && e.t !== 'queen') g.drawImage(PROP.shadow, Math.round(e.x) - 6 - cx, Math.round(e.y) - 2 - cy);
    let frame = 0;
    if (e.t === 'spit') frame = e.mouth > 0 ? 2 : (Math.floor(e.anim * 1.5) % 4 === 1 ? 1 : 0);
    else if (e.t === 'wasp') frame = Math.floor(e.anim * 30) % 3;
    else if (e.t === 'queen') frame = e.mode === 'winded' ? 1 : Math.floor(e.anim * 26) % 2;
    else if (e.t === 'hopper') frame = e.air ? 1 : 0;
    else frame = Math.abs(e.vx) > 4 ? Math.floor(e.anim * (e.mode === 'charge' ? 22 : 10)) % 4 : 0;
    const wind = (e.t === 'thorn' && e.mode === 'wind') || (e.t === 'queen' && e.mode === 'aim');
    const bob = e.t === 'spit' ? Math.round(Math.sin(e.anim * 3) * 0.6) : 0;
    if (e.t === 'queen') { g.globalAlpha = 0.3; g.drawImage(PROP.shadow, Math.round(e.x) - 6 - cx, L.arena.floor - 2 - cy); g.globalAlpha = 1; }
    drawSet(SPR[e.t], null, frame, e.x - cx + (wind ? Math.round(Math.sin(e.anim * 60)) : 0), e.y - cy + bob, e.face, e.flash > 0 || (wind && Math.floor(e.anim * 12) % 2 === 0));
    if (wind) text('!', e.x - cx, e.y - e.h - 12 - cy, '#ffd36b', 'center');
  }
  if (tongue && tongue.active) { const x0 = Math.round(tongue.x0 - cx), y = Math.round(tongue.y - cy), len = Math.round(tongue.len); g.fillStyle = '#ff7a9a'; g.fillRect(tongue.dir > 0 ? x0 : x0 - len, y - 2, len, 4); g.fillStyle = '#ffb0c0'; g.fillRect(tongue.dir > 0 ? x0 : x0 - len, y - 2, len, 1); g.fillStyle = '#c9463d'; g.fillRect(tongue.dir > 0 ? x0 + len - 4 : x0 - len, y - 3, 4, 6); }
  for (const f of fish) { g.save(); g.translate(Math.round(f.x - cx), Math.round(f.y - cy)); g.rotate(Math.atan2(f.vy, f.vx) * 0.6); if (f.vx < 0) g.scale(-1, 1); g.drawImage(FISH, -3, -2); g.restore(); }
  for (const s of seeds) { if (s.arrow) { const a = Math.atan2(s.vy, s.vx); g.save(); g.translate(Math.round(s.x - cx), Math.round(s.y - cy)); g.rotate(a); g.fillStyle = '#e8dcc0'; g.fillRect(-5, -1, 8, 1); g.fillStyle = '#c9d1dc'; g.fillRect(3, -1, 3, 2); g.fillStyle = s.reflected ? '#8fd160' : '#c9463d'; g.fillRect(-6, -2, 2, 3); g.restore(); } else if (s.venom) { g.fillStyle = '#8fd160'; g.fillRect(Math.round(s.x - cx) - 2, Math.round(s.y - cy) - 2, 4, 4); g.fillStyle = '#dfffa0'; g.fillRect(Math.round(s.x - cx) - 1, Math.round(s.y - cy) - 2, 2, 1); } else drawSet(SPR.seed, null, 0, s.x - cx, s.y + 3 - cy, 1, false); }
  for (const w of waves) { const x = Math.round(w.x - cx), y = Math.round(w.y - cy); g.fillStyle = '#8a5a32'; g.fillRect(x - 4, y - 5, 8, 5); g.fillStyle = '#c9b27c'; g.fillRect(x - 2, y - 8, 4, 3); g.fillRect(x - 5 + (w.dir > 0 ? 0 : 6), y - 3, 4, 2); }
  if (showPlayer && !P.dead) {
    for (const gh of ghosts) drawSet(K, 'roll', gh.frame, gh.x - cx, gh.y - cy, gh.face, true, 1, 1, gh.life * 2);
    const vis = P.inv <= 0 || Math.floor(P.inv * 20) % 2 === 0;
    if (vis) {
      g.drawImage(PROP.shadow, Math.round(P.x) - 6 - cx, Math.round(P.y) - 2 - cy);
      let key = 'idle', frame = Math.floor(P.anim * 3) % 4;
      if (P.hurt > 0) key = 'hurt';
      else if (P.dodge > 0) { key = 'roll'; frame = Math.floor((0.3 - P.dodge) / 0.3 * 4) * (P.face > 0 ? 1 : -1); }
      else if (P.plunge) key = 'plunge';
      else if (P.atk >= 0) { key = 'atk'; frame = P.atk < 0.04 ? 0 : P.atk < 0.10 ? 1 : P.atk < 0.17 ? 2 : P.atk < 0.24 ? 3 : 4; }
      else if (P.block) { key = 'block'; frame = Math.floor(P.anim * 2) % 2; }
      else if (!P.ground) { key = P.vy < 0 ? 'jump' : 'fall'; frame = P.vy < 0 ? (P.vy < -150 ? 0 : 1) : (P.vy > 220 ? 1 : 0); }
      else if (keys.down && Math.abs(P.vx) < 10) key = 'crouch';
      else if (P.landT > 0 && Math.abs(P.vx) < 40) key = 'land';
      else if (Math.abs(P.vx) > 10) { key = 'run'; frame = Math.floor(P.anim * 13) % 6; }
      const k = P.sqT > 0 ? P.sqT / 0.12 : 0, sx = 1 + (P.sqX - 1) * Math.min(1, k), sy = 1 + (P.sqY - 1) * Math.min(1, k);
      drawSet(K, key, frame, P.x - cx, P.y - cy, P.face, false, sx, sy);
    }
  }
  if (showPlayer && trail.length > 1) {
    for (let i = 1; i < trail.length; i++) {
      const a = trail[i - 1], b = trail[i]; const al = Math.min(1, b.life / 0.11);
      g.globalAlpha = al * 0.75; g.fillStyle = i === trail.length - 1 ? '#fff6c8' : '#ffe9a0';
      g.beginPath(); g.moveTo(b.x0 - cx, b.y0 - cy); g.lineTo(a.x - cx, a.y - cy); g.lineTo(b.x - cx, b.y - cy); g.closePath(); g.fill();
    }
    g.globalAlpha = 1;
    const tip = trail[trail.length - 1]; g.fillStyle = '#ffffff'; g.fillRect(Math.round(tip.x - cx) - 1, Math.round(tip.y - cy) - 1, 2, 2);
  }
  drawReflections(cx, cy); drawWater(cx, cy, true);
  for (const b of birds) drawSet(BIRD, null, Math.floor(b.t * 12) % 2, b.x - cx, b.y - cy, Math.sign(b.vx) || 1, false);
  for (const p of parts) { g.globalAlpha = Math.min(1, p.life / p.max * 2); g.fillStyle = p.col; g.fillRect(Math.round(p.x - cx), Math.round(p.y - cy), p.size, p.size); }
  g.globalAlpha = 1;
  for (const pl of pollen) { g.globalAlpha = 0.35 + 0.35 * Math.sin(pl.t * 3); g.fillStyle = '#fff6c8'; g.fillRect(Math.round(pl.x - cx), Math.round(pl.y - cy), 1, 1); }
  g.globalAlpha = 1;
  for (const l of leaves) { g.fillStyle = l.col; g.fillRect(Math.round(l.x - cx), Math.round(l.y - cy), 2, 2); }
  for (const f of fireflies) { const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(f.t * 4)); g.globalAlpha = a * Math.min(1, f.life); g.fillStyle = '#fff0a0'; g.fillRect(Math.round(f.x - cx), Math.round(f.y - cy), 2, 2); g.globalAlpha = a * 0.25; g.fillRect(Math.round(f.x - cx) - 1, Math.round(f.y - cy) - 1, 4, 4); }
  g.globalAlpha = 1;
  const wz = weatherAt();
  if (wz.includes('mist')) { // low ground fog: soft wide bands that drift, brightest near the floor line
    const gy = Math.round(P.y - cy);
    for (let i = 0; i < 4; i++) { const yy = gy - 14 + i * 7 + Math.round(Math.sin(time * 0.5 + i) * 2); const off = Math.round((time * (6 + i * 3) + i * 110) % (VW + 200)) - 100;
      for (const [bx, bw] of [[off - 120, 200], [off + 130, 150], [off - 330, 170]]) { const gr = g.createLinearGradient(bx, 0, bx + bw, 0); gr.addColorStop(0, 'rgba(223,232,255,0)'); gr.addColorStop(0.5, 'rgba(223,232,255,' + (0.11 - i * 0.02) + ')'); gr.addColorStop(1, 'rgba(223,232,255,0)'); g.fillStyle = gr; g.fillRect(bx, yy, bw, 9); } }
  }
  for (const d of drops) g.drawImage(PROP.drop, Math.round(d.x - cx), Math.round(d.y - cy));
  if (lightFlash > 0) { g.fillStyle = 'rgba(235,240,255,' + (lightFlash > 0.12 ? 0.75 : lightFlash > 0.06 ? 0.2 : 0.45) + ')'; g.fillRect(0, 0, VW, VH); }
  drawLayer(BG.fg, 1.25, 0, cx, cy);
  if (dk > 0) { g.globalCompositeOperation = 'multiply'; g.globalAlpha = dk * 0.55; const gr = g.createLinearGradient(0, 0, 0, VH); gr.addColorStop(0, '#8a6aa0'); gr.addColorStop(1, '#ffb070'); g.fillStyle = gr; g.fillRect(0, 0, VW, VH); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; }
  if (killFlash > 0) { g.fillStyle = 'rgba(255,255,255,' + (killFlash * 9) + ')'; g.fillRect(0, 0, VW, VH); }
  for (const n of nums) { g.globalAlpha = Math.min(1, n.life * 3); text(String(n.txt), Math.round(n.x - cx), Math.round(n.y - cy), n.col, 'center'); }
  g.globalAlpha = 1;
}
// Reflections: the strip of world above each pool, flipped into the water with a blue wash.
const [reflC, reflG] = canvas(VW, 48);
function drawReflections(cx, cy) {
  for (const p of (L.pools || [])) {
    if (p.shallow || p.x1 < cx || p.x0 > cx + VW || p.y > cy + VH || p.y < cy - 48) continue;
    const x0 = Math.max(p.x0, cx) - cx, x1 = Math.min(p.x1, cx + VW) - cx, y = p.y - cy, H = Math.min(44, y);
    if (H <= 4 || x1 - x0 <= 2) continue;
    reflG.clearRect(0, 0, VW, 48); reflG.drawImage(buf, x0, y - H, x1 - x0, H, x0, 0, x1 - x0, H);
    g.save(); g.globalAlpha = 0.28; g.translate(0, y * 2 + 2); g.scale(1, -1); g.drawImage(reflC, x0, 0, x1 - x0, H, x0, y - H + 2 + Math.round(Math.sin(time * 3) * 0.5), x1 - x0, H); g.restore();
    g.fillStyle = 'rgba(60,120,160,0.25)'; g.fillRect(x0, y + 2, x1 - x0, H);
  }
}
function drawMenu() {
  g.fillStyle = 'rgba(10,14,12,0.7)'; g.fillRect(0, 0, VW, VH);
  const x = 54, y = 6, w = VW - 108, h = 168;
  g.fillStyle = 'rgba(20,16,30,0.92)'; g.fillRect(x, y, w, h); g.strokeStyle = '#ffd36b'; g.lineWidth = 1; g.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  text('SETTINGS', VW / 2, y + 6, '#ffd36b', 'center');
  const off = Math.max(0, Math.min(MENU.length - MENU_ROWS, menuI - MENU_ROWS + 2));
  if (off > 0) text('^', x + w / 2, y + 14, '#9aa39a', 'center'); if (off + MENU_ROWS < MENU.length) text('v', x + w / 2, y + h - 22, '#9aa39a', 'center');
  MENU.forEach((k, i) => {
    if (i < off || i >= off + MENU_ROWS) return;
    const yy = y + 22 + (i - off) * 12, sel = i === menuI; const col = sel ? '#fff6e0' : '#9aa39a';
    if (sel) text('>', x + 10, yy, '#8fd160');
    text(k, x + 22, yy, col);
    const onoff = v => v ? 'ON' : 'OFF';
    const v = k === 'Music' ? onoff(SET.music) : k === 'Sound' ? Math.round(SET.sfx * 100) + '%' : k === 'Music volume' ? Math.round(SET.musicVol * 100) + '%' : k === 'Screen shake' ? onoff(SET.shake) : k === 'Sound FX' ? (SET.sfxFiles ? 'FILES' : 'SYNTH') : k === 'Hit stop' ? onoff(SET.hitstop) : k === 'Damage numbers' ? onoff(SET.numbers) : k === 'Timer' ? onoff(SET.timer) : k === 'Ambient life' ? onoff(SET.ambient) : k === 'Difficulty' ? DIFF[SET.difficulty].label : k === 'Swap Z / X' ? (SET.swapZX ? 'X jump' : 'Z jump') : k === 'Scanlines' ? onoff(SET.scanlines) : k === 'Pixel scale' ? String(SET.scale).toUpperCase() : '';
    if (v) text('< ' + v + ' >', x + w - 12, yy, col, 'right');
  });
  text(menuMsgT > 0 && menuMsg ? menuMsg : 'ESC close', VW / 2, y + h - 12, menuMsgT > 0 ? '#ffd36b' : '#9aa39a', 'center');
}
function drawSelect() {
  const vg = g.createRadialGradient(VW / 2, VH / 2, 40, VW / 2, VH / 2, 200); vg.addColorStop(0, 'rgba(10,20,14,0.5)'); vg.addColorStop(1, 'rgba(10,20,14,0.85)'); g.fillStyle = vg; g.fillRect(0, 0, VW, VH);
  text('CHOOSE YOUR WOOD', VW / 2, 18, '#ffd36b', 'center');
  LEVELS.forEach((lv, i) => {
    const y = 46 + i * 50, sel = i === selI, x = 40, w = VW - 80;
    g.fillStyle = sel ? 'rgba(40,60,40,0.85)' : 'rgba(20,16,30,0.7)'; g.fillRect(x, y, w, 40);
    g.strokeStyle = sel ? '#8fd160' : '#5a5a5a'; g.strokeRect(x + 0.5, y + 0.5, w - 1, 39);
    if (sel && Math.floor(time * 3) % 2 === 0) text('>', x - 12, y + 8, '#8fd160');
    const lk = levelLocked(lv);
    text((i + 1) + '.  ' + (lk ? '? ? ?' : lv.name), x + 8, y + 6, lk ? '#7a7a7a' : '#fff6e0');
    text(lk ? 'clear the wood first' : lv.sub, x + 8, y + 18, lk ? '#6a6a6a' : '#9aa39a');
    if (levelLocked(lv)) g.drawImage(PROP.lock, x + w - 16, y + 8);
    else {
      const p = PROG[lv.id];
      if (p) { text(fmt(p.best), x + w - 8, y + 6, '#dfe8ff', 'right'); g.drawImage(PROP.coin[0], x + w - 52, y + 18); text(p.gold + '/' + p.total, x + w - 8, y + 19, '#ffd34a', 'right'); if (p.cleared) text('CLEARED', x + 8, y + 30, '#8fd160'); }
      else text('not yet', x + w - 8, y + 30, '#9aa39a', 'right');
    }
  });
  text('Z  play     X  bestiary     ESC  back', VW / 2, VH - 14, '#9aa39a', 'center');
}
// Title illustration: the knight small before the great gate at dusk.
function drawTitle(cx, cy) {
  g.drawImage(BG.skyDusk, 0, 0, 1, VH, 0, 0, VW, VH);
  g.drawImage(BG.sun, Math.round(VW * 0.62), 46);
  g.globalAlpha = 0.9; drawLayer(BG.far, 0.15, VH - 90, 0, LH * TS - VH); g.globalAlpha = 1;
  g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgba(120,80,140,0.6)'; g.fillRect(0, 0, VW, VH); g.globalCompositeOperation = 'source-over';
  drawLayer(BG.near, 0.55, -120, 40, LH * TS - VH);
  g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgba(90,70,120,0.55)'; g.fillRect(0, 0, VW, VH); g.globalCompositeOperation = 'source-over';
  const gx = VW / 2 - 60, gy = VH - 132; g.drawImage(PROP.gate, gx, gy, 120, 130);
  g.fillStyle = '#2a2230'; g.fillRect(0, VH - 22, VW, 22); for (let x = 0; x < VW; x += 16) g.drawImage(TILE.top['00'][(x / 16) % 4], x, VH - 22);
  g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgba(110,90,140,0.5)'; g.fillRect(0, VH - 22, VW, 22); g.globalCompositeOperation = 'source-over';
  drawSet(K, 'idle', Math.floor(time * 3) % 4, VW / 2 - 52, VH - 22, 1, false);
  for (const f of fireflies) { const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(f.t * 4)); g.globalAlpha = a; g.fillStyle = '#fff0a0'; g.fillRect(Math.round(f.x - camX), Math.round(f.y - camY), 2, 2); }
  g.globalAlpha = 1;
  const vg = g.createRadialGradient(VW / 2, VH / 2, 60, VW / 2, VH / 2, 220); vg.addColorStop(0, 'rgba(10,6,20,0)'); vg.addColorStop(1, 'rgba(10,6,20,0.7)'); g.fillStyle = vg; g.fillRect(0, 0, VW, VH);
}
function render() {
  const sh = SET.shake ? shake : 0;
  const cx = Math.round(camX + kick + (sh ? (Math.random() - 0.5) * sh * 2 : 0)), cy = Math.round(camY + (sh ? (Math.random() - 0.5) * sh * 2 : 0));
  if (state === 'intro') {
    drawWorld(cx, cy, false);
    drawSet(K, 'run', Math.floor(intro.t * 8) % 4, intro.kx - cx, checkpoint.y - cy, 1, false);
    const bx = 16, by = VH - 52, bw = VW - 32, bh = 40;
    g.fillStyle = 'rgba(14,10,22,0.88)'; g.fillRect(bx, by, bw, bh); g.strokeStyle = '#ffd36b'; g.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
    const line = INTRO[intro.card].slice(0, Math.floor(intro.chars)); const lines = wrap(line, bw - 16);
    lines.forEach((l, i) => text(l, bx + 8, by + 7 + i * 11, '#fff6e0'));
    if (intro.chars >= INTRO[intro.card].length && Math.floor(time * 3) % 2 === 0) text('Z', bx + bw - 12, by + bh - 11, '#8fd160', 'right');
    text('ESC skip', VW - 6, 4, '#9aa39a', 'right');
  } else if (state === 'title') drawTitle(cx, cy);
  else if (state === 'map') { drawMap(); for (const p of parts) { g.globalAlpha = Math.min(1, p.life / p.max * 2); g.fillStyle = p.col; g.fillRect(Math.round(p.x - camX), Math.round(p.y - camY), p.size, p.size); } g.globalAlpha = 1; }
  else if (state === 'store') { drawStore(); for (const p of parts) { g.globalAlpha = Math.min(1, p.life / p.max * 2); g.fillStyle = p.col; g.fillRect(Math.round(p.x - camX), Math.round(p.y - camY), p.size, p.size); } g.globalAlpha = 1; }
  else {
    const z = zoomT > 0 ? zoomAmt : 1;
    if (z > 1) { g.save(); g.translate(VW / 2, VH * 0.55); g.scale(z, z); g.translate(-VW / 2, -VH * 0.55); }
    drawWorld(cx, cy, true);
    if (z > 1) g.restore();
  }
  if (flash > 0) { g.fillStyle = 'rgba(255,80,80,' + (flash * 2.5) + ')'; g.fillRect(0, 0, VW, VH); }
  for (const s of signs) if (state === 'play' && Math.abs(s.x - P.x) < 28) {
    g.font = '8px "Press Start 2P", monospace'; const w = g.measureText(s.text).width + 12; const x = Math.max(4, Math.min(VW - w - 4, Math.round(s.x - cx - w / 2)));
    g.fillStyle = 'rgba(20,16,30,0.85)'; g.fillRect(x, 30, w, 16); g.strokeStyle = '#ffd36b'; g.lineWidth = 1; g.strokeRect(x + 0.5, 30.5, w - 1, 15);
    text(s.text, x + 6, 34, '#fff6e0');
  }
  if (state === 'play' || state === 'win' || (state === 'menu' && menuFrom === 'play')) {
    g.drawImage(PROP.heart, 5, 5);
    bar(16, 6, 70, 6, P.hp / P.maxHp, P.hp > 30 ? '#e04848' : (Math.floor(time * 6) % 2 ? '#ff7a6b' : '#e04848'), P.hpShown / P.maxHp);
    g.drawImage(PROP.bolt, 6, 15);
    const low = P.stFlash > 0 && Math.floor(time * 12) % 2 === 0;
    bar(16, 16, 56, 4, P.st / P.maxSt, low ? '#ff6b6b' : '#8fd160');
    for (const f of flyCoins) { const e = 1 - Math.pow(1 - f.t, 3); const x = f.x + (VW - 42 - f.x) * e, y = f.y + (9 - f.y) * e - Math.sin(f.t * Math.PI) * 14; g.drawImage(PROP.coin[Math.floor(f.t * 12) % 4], Math.round(x), Math.round(y)); }
    g.drawImage(PROP.coin[0], VW - 46, 5); text(got + '/' + total, VW - 36, 7, '#ffd34a');
    if (P.hp > 0 && P.hp <= 30 && state === 'play') { const k = 0.5 + 0.5 * Math.sin(time * (P.hp <= 15 ? 11 : 7)); const vg = g.createRadialGradient(VW / 2, VH / 2, 70, VW / 2, VH / 2, 200); vg.addColorStop(0, 'rgba(180,20,20,0)'); vg.addColorStop(1, 'rgba(180,20,20,' + (0.18 + 0.22 * k) + ')'); g.fillStyle = vg; g.fillRect(0, 0, VW, VH); }
    if (state === 'play' && SET.timer) text(fmt(levelTime), VW / 2, 7, '#dfe8ff', 'center');
    if (bossActive && boss && boss.alive) { const nm = boss.t === 'frog' ? 'BULLFROG KING' : 'HORNET QUEEN'; text(boss.phase === 2 ? nm + '  ENRAGED' : nm, VW / 2, VH - 22, boss.phase === 2 ? '#ff6b6b' : '#ffd36b', 'center'); bar(VW / 2 - 60, VH - 11, 120, 5, boss.hp / boss.maxHp, boss.phase === 2 ? '#ff6b6b' : '#e0b040'); }
  }
  if (state === 'title') {
    g.drawImage(PROP.plank, VW / 2 - 70, 14);
    text('BRACKEN', VW / 2 + 1, 21, '#3a2214', 'center', 16); text('BRACKEN', VW / 2, 20, '#ffd36b', 'center', 16);
    if (Math.floor(time * 2) % 2 === 0) text('PRESS ANY KEY', VW / 2, 112, '#8fd160', 'center');
    text('ARROWS move  Z jump  X swing', VW / 2, 128, '#fff6e0', 'center');
    text('C block  V dodge  DOWN+X plunge', VW / 2, 139, '#fff6e0', 'center');
    text(touchOn ? 'touch pad on screen' : 'ESC settings   gamepad ok', VW / 2, 169, '#9aa39a', 'center');
  }

  if (state === 'bestiary') drawBestiary();
  if (state === 'map' || state === 'store') { for (const n of nums) { g.globalAlpha = Math.min(1, n.life * 3); text(String(n.txt), Math.round(n.x), Math.round(n.y), n.col, 'center'); } g.globalAlpha = 1; }
  if (state === 'menu') drawMenu();
  if (state === 'win') {
    g.fillStyle = 'rgba(10,20,14,0.6)'; g.fillRect(40, 26, VW - 80, 130); g.strokeStyle = '#ffd36b'; g.strokeRect(40.5, 26.5, VW - 81, 129);
    text(L.arena ? (L.arena.boss === 'frog' ? 'THE KING CROAKS' : 'THE QUEEN FALLS') : 'THE GATE OPENS', VW / 2, 38, '#ffd36b', 'center', 12);
    text('time     ' + fmt(levelTime), VW / 2, 64, '#fff6e0', 'center');
    text('gold     ' + got + ' / ' + total + '   +' + earned + ' purse', VW / 2, 77, '#ffd34a', 'center');
    text('foes     ' + kills, VW / 2, 90, '#fff6e0', 'center');
    text('blocks   ' + blocks + '   dodges ' + dodges, VW / 2, 103, '#fff6e0', 'center');
    text('deaths   ' + deaths, VW / 2, 116, '#fff6e0', 'center');
    { const id = LEVELS[levelIndex].id, m = medalFor(id, levelTime); const bits = [m ? MEDAL_NAME[m] + ' TIME' : null, got >= total ? 'ALL GOLD' : null, hitsTaken === 0 && deaths === 0 ? 'NO DAMAGE' : null].filter(Boolean); if (bits.length) text(bits.join('  '), VW / 2, 128, m === 3 ? '#ffd34a' : '#8fd160', 'center'); }
    if (Math.floor(time * 2) % 2 === 0) text('Z  continue', VW / 2, 140, '#8fd160', 'center');
  }
  if (P.dead && state === 'play') { g.fillStyle = 'rgba(10,6,14,' + Math.min(0.7, (1.2 - P.dead) * 1.2) + ')'; g.fillRect(0, 0, VW, VH); }
  if (!audioReady() && state === 'play') text('press a key for sound', VW - 4, VH - 12, '#9aa39a', 'right');
  if (window.BK && window.BK.sheet) {
    g.fillStyle = '#3a4a6a'; g.fillRect(0, 0, VW, VH);
    let x = 4; const row = (set, keys, y) => { for (const k of keys) { let c = k == null ? set.R : set.R[k]; const arr = Array.isArray(c) ? c : [c]; for (const f of arr) { g.drawImage(f, x, y, f.width * 2, f.height * 2); x += f.width * 2 + 4; } } };
    row(K, ['idle', 'run'], 4); x = 4; row(K, ['jump', 'fall', 'land', 'atk'], 34); x = 4; row(K, ['plunge', 'block', 'roll', 'hurt'], 64); x = 4;
    row(SPR.sprig, [null], 100); row(SPR.shield, [null], 100); row(SPR.queen, [null], 100); x = 4;
    row(SPR.spit, [null], 136); row(SPR.wasp, [null], 136); row(SPR.thorn, [null], 136); row(SPR.archer, [null], 136); row(SPR.frog, [null], 136);
  }
  dg.fillStyle = '#0b1410'; dg.fillRect(0, 0, disp.width, disp.height);
  dg.drawImage(buf, offX, offY, VW * S, VH * S);
  drawTouch();
  if (SET.scanlines && S >= 2) { if (!scanPat) { const [pc, pg] = canvas(1, S); pg.fillStyle = 'rgba(0,0,0,0.22)'; pg.fillRect(0, S - 1, 1, 1); scanPat = dg.createPattern(pc, 'repeat'); } dg.fillStyle = scanPat; dg.fillRect(offX, offY, VW * S, VH * S); }
}
const fmt = t => { const m = Math.floor(t / 60), s = Math.floor(t % 60), d = Math.floor((t * 10) % 10); return m + ':' + String(s).padStart(2, '0') + '.' + d; };

// ---------- loop ----------
let last = performance.now(), acc = 0, lastTick = 0, rafQueued = false; const STEP = 1 / 60;
function tick(now) {
  lastTick = performance.now();
  pollGamepad();
  let dt = (now - last) / 1000; last = now;
  if (!(dt >= 0)) dt = 0; if (dt > 0.12) dt = 0.12;
  acc += dt;
  let n = 0;
  while (acc >= STEP && n < 8) { update(STEP); acc -= STEP; n++; clearPresses(); }
  render();
}
function frame(now) { rafQueued = false; tick(now); if (!rafQueued) { rafQueued = true; requestAnimationFrame(frame); } }
setInterval(() => { if (performance.now() - lastTick > 200) tick(performance.now()); }, 125);
loadLevel(0);
document.getElementById('boot').remove();
window.BK = {
  P, god: false, keys, SET, PROG,
  step(n = 1) { for (let i = 0; i < n; i++) { update(STEP); clearPresses(); } render(); },
  tp(tx, ty) { P.x = tx * TS + 8; P.y = (ty + 1) * TS; P.vx = P.vy = 0; },
  reset() { Object.assign(P, { dead: 0, hp: P.maxHp, hpShown: P.maxHp, st: P.maxSt, inv: 0, hurt: 0, vx: 0, vy: 0, plunge: false, atk: -1, onMover: null, dodge: 0, dodgeCd: 0, block: false }); },
  get state() { return state; }, set state(v) { state = v; }, start() { introSeen = true; startGame(); }, intro() { startIntro(); }, load: loadLevel,
  enemies: () => enemies, movers: () => movers, seeds: () => seeds, corpses: () => corpses, waves: () => waves, respawnEnemies: () => spawnEntities(),
  get map() { return map; }, SKINS, SWORDS, UPGRADES, applySkin, applyUpgrades, ripples: () => ripples, get hitsTaken() { return hitsTaken; }, touchOn, touchZones: () => touchZones, medalFor, get boss() { return boss; }, get bossActive() { return bossActive; }, get bossMusicT() { return bossMusicT; }, get tongue() { return tongue; }, birds: () => birds, get weather() { return weatherAt(); }, get level() { return L; },
  stats: () => ({ got, total, kills, deaths, levelTime, pogoCount, parries, blocks, dodges }),
  get cam() { return [camX, camY]; }, get stop() { return stop; }, buf, g,
};
if (document.fonts && document.fonts.load) document.fonts.load('8px "Press Start 2P"').catch(() => {});
rafQueued = true; requestAnimationFrame(frame);
