// BRACKEN — a 16-bit forest platformer with a knight, a sword, a shield, and a plunge.
import { canvas, mulberry, fromGrid, outline, flipX, whiten } from './px.js';
import * as ART from './art.js';
import { bakeFrog } from './redraw/frogking.js';
import { bakeSweep, bakePaladin, bakeGoblinLance, bakeCrow, bakeHornblower, bakeBale, bakeCook, bakeSnuffer, bakeSailer, bakeHearthGob, bakeCutter, bakeLance, bakeShardling, bakeSuncatcher, bakeRoc, bakeSentry, bakeGoblinQueen, bakeThrone, bakeKeeper, bakeBard, bakeOldKnight, bakeMiner, bakeBat, bakeForeman, bakeLamplighter, bakeKingBig, bakeChandelier, bakeForgemaster, bakeForgemasterBig, bakeRockGoblin, bakeGolem, bakeHare, bakeWight, bakePyro, bakeCragRam, bakeSpider, bakeSquirrel, bakeOwl, bakeWoodsman, bakeFerryman, bakeSquire, bakeElder, bakeGoatRider, bakeShepherd, bakeSheep, bakeKnight, bakeSprig, bakeShield, bakeSpitter, bakeSpitterParts, bakeWasp, bakeSeed, bakeArcher, bakeBird, HOPPER_COLORS, bakeSapper, bakeBomb, bakeBrute, bakeFox, bakeSporeling, bakeLurker, bakeShaman, bakeThief, bakePike, bakeFolk, bakeMaster, bakeKing, bakeGoblinShaman } from './chars.js';
import { bakeQueen, bakeChief } from './redraw/queenchief.js';
import { bakeWindcaller, bakeRamLord } from './redraw/callerram.js';
import { bakeThornback, bakeHopper, bakeHarpy, bakeHound } from './redraw/foes1.js';
import { bakeGrub, bakeDrone, bakeGreatHound, bakeTroll } from './redraw/foes2.js';
import { LEVELS, T, TS, CUSTOM } from './level.js';
import { initAudio, SFX, music, ambient, ready as audioReady, setVolume, setSfxFiles, setMusicVolume, SFX_NAMES, MUSIC_NAMES, AMBIENT_NAMES, setHeroVoice, emitAt, emitNow, debugAudio, setUiVolume, setReverb, setAmbientVolume } from './audio.js';

// ---------- display ----------
let VW = 320, VH = 180;
const disp = document.getElementById('c');
const dg = disp.getContext('2d');
const [buf, g] = canvas(VW, VH);
// The view is 320x180, or a zoomed-out size picked from the display so the pixel scale stays an integer and the game never shrinks on screen:
// the zoom drops the scale by a third and fills the display with it, capped at 640x360 (twice the world).
let viewMode = 'normal';
function viewFor(mode) {
  if (mode !== 'zoom') return [320, 180];
  const dw = innerWidth || 1280, dh = innerHeight || 720;
  const S0 = Math.max(1, Math.floor(Math.min(dw / 320, dh / 180))), S1 = Math.max(1, Math.floor(S0 / 1.5));
  return [Math.max(320, Math.min(640, Math.floor(dw / S1))), Math.max(180, Math.min(360, Math.floor(dh / S1)))];
}
function setView(mode) {
  viewMode = mode; const [w, h] = viewFor(mode); if (VW === w && VH === h) return;
  VW = w; VH = h; buf.width = w; buf.height = h; g.imageSmoothingEnabled = false; resize(); if (L) bakeAll(L.palette || {});
}
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
addEventListener('resize', () => { if (viewMode === 'zoom') setView('zoom'); resize(); }); resize();
const q = new URLSearchParams(location.search);

// ---------- settings + progress ----------
const SET = { music: true, sfx: 0.5, musicVol: 0.8, shake: true, sfxFiles: true, hitstop: true, numbers: true, timer: true, ambient: true, difficulty: 'normal', iron: false, zoom: 'close', hud: 'full', filter: 'none', foeBars: true, lookDown: true, bossIntro: true, rumble: true, tenths: true, flashes: true, vignette: true, weather: true, impact: true, tips: true, blockToggle: false, textFast: false, reduceMotion: false, swapZX: false, scanlines: false, scale: 'auto', speed: 1, assist: false, ambVol: 1, uiVol: 0.8, bigText: false, colorSafe: false, fps: false, bright: 1, shakeAmt: 1, parallax: 'full', tint: 'full', parts: 'normal', rim: false, grain: false };
const TIER = { wood: 0, marsh: 0.15, stockade: 0.3, spore: 0.45, kings: 0.6, scree: 0.75, hanging: 0.9, spire: 1, moor: 1.1, storm: 1.2, crown: 1.3 }; // how far up the slope a level sits
const tierOf = id => TIER[id] || 0; const curId = () => (LEVELS[levelIndex] || {}).id;
// DIFFICULTY is chosen per wood, on the map (up and down on a level's card): how much everything hurts you,
// how much it takes to put a foe down, and a boss on its own dial. The Settings value is the default for a wood
// you have not set; from the pause menu it sets the wood you are in.
const DIFF = { easy: { take: 0.6, ehp: 0.75, bhp: 0.7, label: 'EASY', col: '#8fd160' }, normal: { take: 1, ehp: 1, bhp: 1, label: 'NORMAL', col: '#ffd36b' }, hard: { take: 1.4, ehp: 1.3, bhp: 1.3, label: 'HARD', col: '#ff6b6b' } };
const diffOf = id => (PROG.diff && DIFF[PROG.diff[id]] ? PROG.diff[id] : DIFF[SET.difficulty] ? SET.difficulty : 'normal');
const diffNow = () => DIFF[diffOf(curId())];
const DIFFS = ['easy', 'normal', 'hard'], SCALES = ['auto', 2, 3, 4];
try { Object.assign(SET, JSON.parse(localStorage.getItem('bracken.settings') || '{}')); } catch {}
function saveSettings() { try { localStorage.setItem('bracken.settings', JSON.stringify(SET)); } catch {} }
function applySettings() { setVolume(SET.sfx); setMusicVolume(SET.musicVol); music.set(SET.music); setSfxFiles(SET.sfxFiles); setUiVolume(SET.uiVol); setAmbientVolume(SET.ambVol); resize(); }
applySettings();
// Progress lives in one of three save slots. The old single save becomes slot 1 the first time it is read.
const PROG = {}; const SLOTS = 3; let slot = 0, slotI = 0, slotMsg = '', slotMsgT = 0;
try { slot = Math.max(0, Math.min(SLOTS - 1, +(localStorage.getItem('bracken.slot') || 0))); } catch {}
const slotKey = i => 'bracken.progress.' + i;
function readSlot(i) { try { const raw = localStorage.getItem(slotKey(i)) || (i === 0 ? localStorage.getItem('bracken.progress') : null); return raw ? JSON.parse(raw) : null; } catch { return null; } }
function progDefaults() { if (!PROG.heroes) PROG.heroes = { knight: true }; if (!PROG.hero) PROG.hero = 'knight'; if (!PROG.music) PROG.music = { select: true }; if (!PROG.music.select) PROG.music.select = true; PROG.coins = PROG.coins || 0; PROG.skins = PROG.skins || { bracken: true }; PROG.skin = PROG.skin || 'bracken'; PROG.swords = PROG.swords || { steel: true }; PROG.sword = PROG.sword || 'steel'; PROG.items = PROG.items || {}; PROG.charms = PROG.charms || {}; PROG.ranks = PROG.ranks || {}; if (!PROG.skill && PROG.items.shieldThrow) PROG.skill = 'shieldThrow';
  { const OLD = { vigour: [40, 60, 90, 130, 180], breath: [40, 60, 90, 130, 180], recovery: [60, 100, 160], temper: [50, 80, 120, 170, 230], footing: [60, 100, 160] }; let back = 0; for (const id in OLD) for (let r = 0; r < (PROG.ranks[id] || 0); r++) back += OLD[id][r] || 0; if (back) { PROG.coins += back; PROG.ranks = {}; PROG.refundNote = back; } } // the training went: its gold comes back
  if (!PROG.skillRefund) { const OLD = { shieldThrow: 80, groundSlam: 90, fireWall: 80, cinderStep: 90, risingCut: 100, vent: 100, kindle: 90, wisp: 120 }; let back = 0; for (const id in OLD) if (PROG.items[id]) { back += OLD[id]; delete PROG.items[id]; } PROG.skillRefund = true; if (back) { PROG.coins += back; PROG.refundNote = (PROG.refundNote || 0) + back; } } // the skills left the store for the trees: their gold comes back
  PROG.talents = PROG.talents || {}; PROG.tonics = PROG.tonics || 0; }
function loadSlot(i) { slot = i; for (const k in PROG) delete PROG[k]; Object.assign(PROG, readSlot(i) || {}); progDefaults(); try { localStorage.setItem('bracken.slot', String(i)); } catch {} }
function eraseSlot(i) { try { localStorage.removeItem(slotKey(i)); if (i === 0) localStorage.removeItem('bracken.progress'); } catch {} if (i === slot) { for (const k in PROG) delete PROG[k]; progDefaults(); } }
function saveProgress() { try { localStorage.setItem(slotKey(slot), JSON.stringify(PROG)); } catch {} }
loadSlot(slot);

// ---------- tuning ----------
const RUN = 100, GRAV = 1000, JUMPV = -320, POGO = -330;
const SWORD_DMG = 10, PLUNGE_DMG = 20, PYRO_PLUNGE_DMG = 7;
// The pyromancer does not come down like a man in armour. The drop itself is light; what does the
// work is the fireball she sheds on the way, which lands where she was aiming and burns what it hits.
const plungeDmg = () => Math.round((isPyro() ? PYRO_PLUNGE_DMG : PLUNGE_DMG) * (1 + 0.15 * (tal('heavyPlunge') + tal('firedropDmg')))); // (HEAVY PLUNGE, FIREDROP)
const DMG = { dummy: 0, gqSceptre: 18, sweep: 10, stormshaman: 10, crow: 8, skybolt: 14, horn: 12, bale: 14, lanceBash: 10, lanceVault: 16, lanceJav: 11, shardFall: 16, shardling: 14, shardBurst: 18, sunShard: 16, rocDive: 22, rocFeather: 12, sentry: 10, gqSlam: 26, gqSweep: 20, gqCharge: 30, gqSlate: 14, gqBolt: 24, gqArrow: 12, crush: 18, sunSpire: 22, sunGlare: 20, hearthgob: 16, cutter: 14, lanceCharge: 30, lanceThrust: 22, lanceRush: 18, lanceSweep: 18, lanceGuard: 20, snuffer: 8, sailer: 14, sailerBig: 20, web: 10, miner: 22, bat: 10, cartHit: 12, gas: 20, piston: 25, steam: 12, hammer: 30, greathound: 20, pounce: 25, snap: 15, spider: 15, owlSwoop: 25, screech: 12, feather: 10, troll: 25, sprig: 15, shield: 25, spit: 15, wasp: 15, thorn: 30, spike: 20, seed: 15, spined: 20, queen: 30, wave: 20, venom: 18, archer: 15, arrow: 18, frog: 25, tongue: 25, hopper: 15, crown: 15, sapper: 15, bomb: 25, brute: 20, bruteOver: 30, bruteSweep: 20, hound: 18, chief: 25, chiefOver: 35, chiefSweep: 20, chiefGrab: 20, fire: 15, sporeling: 15, lurker: 22, drone: 15, shaman: 15, root: 15, roller: 12, sporeRain: 10, pike: 20, master: 20, whip: 15, goblet: 15, sceptre: 25, shout: 10, kingSlam: 28, grab: 22, throne: 30, ram: 20, cage: 15, skull: 20, vent: 15, ramLeap: 28, litter: 24, crush: 35, beam: 15, slide: 22, counter: 18, acid: 15, lantern: 10, gasBlast: 22, shard: 15, golemStomp: 25, golem: 20, blast: 12, staff: 20, grub: 12, rockgoblin: 12, hare: 10, wight: 15, kite: 12, windcaller: 20, hurlCart: 26, anvilHammer: 30, breath: 18, hotplate: 12, bolt: 20, crownToss: 18, lash: 15, vine: 15, harpy: 18, goat: 20, ramLord: 30, ramStamp: 20, rock: 20 };
const EHP = { dummy: 9999, sweep: 14, stormshaman: 20, crow: 6, horn: 22, bale: 12, shardling: 18, suncatcher: 420, roc: 440, sentry: 14, gqueen: 560, hearthgob: 24, cutter: 20, lance: 380, snuffer: 16, sailer: 18, miner: 30, bat: 8, forgemaster: 480, golem: 400, kite: 15, hare: 8, wight: 12, windcaller: 170, grub: 26, rockgoblin: 20, greathound: 220, spider: 15, owl: 320, troll: 60, sprig: 10, shield: 20, spit: 10, wasp: 10, thorn: 30, queen: 220, archer: 10, frog: 280, hopper: 10, sapper: 10, brute: 40, hound: 15, chief: 400, sporeling: 10, lurker: 20, drone: 10, shaman: 20, gill: 20, heart: 6, mother: 9999, thief: 10, pike: 20, folk: 1, master: 160, bearer: 20, king: 420, harpy: 18, goat: 20, ram: 360 };
const ST = { swing: 12, plunge: 32, dodge: 25, blockHit: 16, hold: 9, regen: 48, delay: 0.5 };

// ---------- bake ----------
const SKINS = [
  { id: 'bracken', name: 'BRACKEN BLUE', price: 0, pal: {} },
  { id: 'black', name: 'BLACK KNIGHT', price: 30, pal: { b: '#2a2a34', B: '#15151c', r: '#c9463d', y: '#c9d1dc' } },
  { id: 'purple', name: 'VIOLET KNIGHT', price: 40, pal: { b: '#6a3aa0', B: '#40206a', r: '#ffd36b', y: '#ffd36b' } },
  { id: 'blue', name: 'RIVER BLUE', price: 50, pal: { b: '#2f7fe0', B: '#1f4fa0', r: '#fff6e0', y: '#e0b040' } },
  { id: 'marsh', name: 'MARSH GREEN', price: 35, pal: { b: '#5a7a3a', B: '#3a4e24', r: '#8fd160', y: '#c9b27c' } },
  { id: 'rose', name: 'ROSE KNIGHT', price: 40, pal: { b: '#d0648a', B: '#8a3a5a', r: '#fff6e0', y: '#ffd36b' } },
  { id: 'crimson', name: 'CRIMSON GUARD', price: 45, pal: { b: '#a8323a', B: '#6a1c24', r: '#ffd36b', y: '#e8dcc0' } },
  { id: 'verdant', name: 'VERDANT', price: 45, pal: { b: '#3a8a4a', B: '#245a30', r: '#ffd36b', y: '#c9b27c' } },
  { id: 'frost', name: 'FROST PLATE', price: 55, pal: { b: '#c9d8e8', B: '#7a9ab8', r: '#3d5aa8', y: '#bfe6f5' } },
  { id: 'shadow', name: 'SHADOW', price: 60, pal: { b: '#3a2f4a', B: '#1e1828', r: '#6a3aa0', y: '#8a8a9a' } },
  { id: 'gilded', name: 'GILDED PLATE', price: 70, pal: { b: '#d9a83a', B: '#8f6a1c', r: '#c9463d', y: '#fff6c8' } },
  { id: 'iron', name: 'IRON KNIGHT', price: 0, pal: { b: '#7c8797', B: '#4a525e', r: '#c9d1dc', y: '#3a3040' }, feat: 'iron', featName: 'clear a level in Iron Knight' },
  { id: 'spore', name: 'SPOREBORN', price: 0, pal: { b: '#8a8a54', B: '#5a5a34', r: '#b8c060', y: '#9a5aa8' }, feat: 'spore', featName: 'clear Sporewood' },
  { id: 'dawn', name: 'DAWN', price: 60, pal: { b: '#e8a0b0', B: '#a0606a', r: '#fff6e0', y: '#ffd36b' } },
  { id: 'emberplate', name: 'EMBER', price: 75, pal: { b: '#3a3030', B: '#1e1818', r: '#ff9a5c', y: '#ffd36b' } },
  { id: 'tide', name: 'TIDE', price: 90, pal: { b: '#2a8a8a', B: '#1a5a5a', r: '#e8ecff', y: '#bfe6f5' } },
  { id: 'silverknight', name: 'THE SILVER KNIGHT', price: 4, silver: true, pal: { b: '#c9d1dc', B: '#7c8797', r: '#dfe8ff', y: '#e8ecff' } },
];
const SWORDS = [
  { id: 'steel', name: 'STEEL', price: 0, pal: {}, dmg: 10, cost: 12, desc: 'the plain blade' },
  { id: 'ember', name: 'EMBER BLADE', price: 25, pal: { s: '#ffb060', S: '#b8541c' }, dmg: 9, cost: 12, burn: true, desc: 'foes burn after a hit' },
  { id: 'frost', name: 'FROST BLADE', price: 35, pal: { s: '#bfe6f5', S: '#4fa0c8' }, dmg: 10, cost: 12, freeze: true, desc: 'hits hold foes still' },
  { id: 'gilded', name: 'GILDED BLADE', price: 45, pal: { s: '#ffe27a', S: '#c9962a' }, dmg: 10, cost: 12, gold: true, desc: 'kills shake out a coin' },
  { id: 'shadow', name: 'SHADOW EDGE', price: 55, pal: { s: '#5a5468', S: '#2c2736' }, dmg: 8, cost: 7, desc: 'light: swings cost little' },
  { id: 'thorn', name: 'THORN BLADE', price: 60, pal: { s: '#8fd160', S: '#3a6a2a' }, dmg: 10, cost: 12, leech: true, desc: 'each hit mends 2' },
  { id: 'silverleaf', name: 'SILVERLEAF', price: 8, silver: true, pal: { s: '#e8ecff', S: '#9aa8c8' }, dmg: 10, cost: 12, freeze: true, gold: true, desc: 'found silver, not bought: hits hold foes still and kills shake out a coin' },
  { id: 'moon', name: 'MOONSILVER', price: 80, pal: { s: '#e8ecff', S: '#8090c8' }, dmg: 15, cost: 16, heavy: true, desc: 'heavy: 15 a swing, shoves hard' },
];
const UPGRADES = [
  { id: 'heart', name: 'HEART OF OAK', price: 60, desc: '+25 max health' },
  { id: 'wind', name: 'SECOND WIND', price: 60, desc: '+30 max stamina' },
  { id: 'edge', name: 'KEEN EDGE', price: 90, desc: '+3 sword damage' },
  { id: 'edge2', name: 'RAZOR EDGE', price: 160, desc: '+3 more sword damage', needs: 'spore', needsName: 'Sporewood' },
  // THE SMITH's new work, for the gold the training used to take: better edges and armour as the woods open, and tonics to carry
  { id: 'edge3', name: 'MASTERWORK EDGE', price: 260, desc: '+3 more damage: the best the smith can do', needs: 'spire', needsName: 'the Sunspire' },
  { id: 'mail', name: 'RINGMAIL', price: 150, desc: 'a tenth less damage from every blow', needs: 'kings', needsName: 'Kingswood' },
  { id: 'plate', name: 'PLATE', price: 280, desc: 'another tenth less damage', needs: 'moor', needsName: 'Gale Moor' },
  { id: 'tonic', name: 'RED TONIC', price: 40, consumable: true, max: 3, desc: 'carry up to three. when a blow leaves you under a quarter of your health you drink one at once: +45 health. it will even save you from a killing blow.' },
];
const CHARMS = [
  { id: 'lucky', name: 'LUCKY CHARM', price: 70, desc: 'gold drifts to you' },
  { id: 'iron', name: 'IRON CHARM', price: 90, desc: 'a fifth less damage taken' },
  { id: 'feather', name: 'FEATHER CHARM', price: 80, desc: 'jump a little higher' },
  { id: 'heart', name: 'HEART CHARM', price: 100, desc: 'every kill heals 5' },
  { id: 'swift', name: 'SWIFT CHARM', price: 80, desc: 'run a little faster' },
];
const ABILITIES = [
  { id: 'shieldThrow', name: 'SHIELD THROW', price: 80, desc: 'F: hurl the shield. 20 stamina, 2.5s', needs: 'stockade', needsName: 'the Stockade', hero: 'knight' },
  { id: 'groundSlam', name: 'GROUND SLAM', price: 90, desc: 'F: quake the floor both ways. 25 stamina, 3s', needs: 'kings', needsName: 'Kingswood', hero: 'knight' },
  { id: 'fireWall', name: 'FIRE WALL', price: 80, desc: 'F: a line of flame ahead for 3s. 25 stamina, 4s', needs: 'stockade', needsName: 'the Stockade', hero: 'pyro' },
  { id: 'cinderStep', name: 'CINDER STEP', price: 90, desc: 'F: a burning dash you cannot be hit in. 20 stamina, 3s', needs: 'kings', needsName: 'Kingswood', hero: 'pyro' },
  { id: 'risingCut', name: 'RISING CUT', price: 100, desc: 'F: an uppercut that launches you and the foe. plunge after it. 20 stamina, 2s', needs: 'scree', needsName: 'the Scree Path', hero: 'knight' },
  { id: 'vent', name: 'VENT', price: 100, desc: 'F: blast all your heat out at once. the hotter, the harder. lights lamps. 15 stamina', needs: 'scree', needsName: 'the Scree Path', hero: 'pyro' },
  { id: 'kindle', name: 'KINDLE', price: 90, desc: 'always on: fire mends you instead of burning you. stand in your own wall', needs: 'hanging', needsName: 'the Hanging Village', hero: 'pyro', passive: true },
  { id: 'wisp', name: 'WISP', price: 120, desc: 'F: a flame that follows you, lights every lamp it passes and dives at foes. 20 stamina, 8s', needs: 'mineworks', needsName: 'the Mineworks', hero: 'pyro' },
];
const MENU_MUSIC = [
  { id: 'select', name: 'STAGE SELECT', price: 0, desc: 'the map tune you know' },
  { id: 'town', name: 'EXPLORING TOWN', price: 60, desc: 'a wandering tune for the map and menus' },
  { id: 'adventure', name: 'THE ADVENTURE BEGINS', price: 60, desc: 'a bright march for the map and menus' },
];
const menuTrack = () => (PROG.menu && PROG.music && PROG.music[PROG.menu]) ? PROG.menu : 'select';
const HEROES = [
  { id: 'knight', name: 'THE KNIGHT', price: 15, silver: true, desc: 'sword, shield and the plunge. 100 health' },
  { id: 'pyro', name: 'THE PYROMANCER', price: 15, silver: true, desc: 'staff and ember, no shield. tap C for an ember, hold C for a jet of flame. the hotter she runs the harder it all lands. fill the bar and press C again: THE PYRE, one great fireball that spends it all. 80 health, quicker on foot, a lighter blow, one jump like anyone else' },
  { id: 'paladin', name: 'THE PALADIN', price: 15, silver: true, desc: 'maul and holy light. slower and heavier, 120 health. every blow and every hit turned aside fills the LIGHT. tap C: MEND (half the bar). hold C: AEGIS, a ward in front of him for a breath and a half; it cannot turn what a shield cannot. a full bar and C again: JUDGEMENT, light out of the sky on everything near. the plunge is HAMMERFALL. the dead take double' },
];
const TRAINING = [
  { id: 'vigour', name: 'VIGOUR', per: '+10 health a rank', max: 5, prices: [40, 60, 90, 130, 180] },
  { id: 'breath', name: 'BREATH', per: '+10 stamina a rank', max: 5, prices: [40, 60, 90, 130, 180] },
  { id: 'recovery', name: 'RECOVERY', per: 'stamina returns 15% faster a rank', max: 3, prices: [60, 100, 160] },
  { id: 'temper', name: 'TEMPER', per: '+1 damage a rank', max: 5, prices: [50, 80, 120, 170, 230] },
  { id: 'footing', name: 'FOOTING', per: 'dodge and plunge cost 2 less a rank', max: 3, prices: [60, 100, 160] },
];
const rankOf = id => (PROG.ranks && PROG.ranks[id]) || 0; // (TRAINING is gone from the store: kept only to refund old saves)
// THE TALENT TREES, the old way (the second Diablo's): every hero has three trees of skills side by side, each
// a column of rows that open as the hero's level climbs (0, 2, 5 and 8), each skill joined by a line to the one
// it grows from. A wood cleared the first time is a level and TWO points. A skill can take one point or up to three
// (the ones with numbers in them grow with every point). The ACTIVE skills - the ones on F - live in the trees
// now, not the store: a point learns one, more points shorten its wait and deepen its blow. F on a learned one
// puts it on F. Forgetting everything is free.
const TBR = { knight: ['BLADE', 'SHIELD', 'ROAD'], pyro: ['EMBER', 'JET', 'ASH'], paladin: ['LIGHT', 'AEGIS', 'HAMMER'] };
const ROW_LV = [0, 2, 5, 8];
const TREE = [];
{ const N = (hero, branch, row, col, id, name, max, desc, parent, active) => TREE.push({ id, hero, branch, row, col, name, max, desc, parent: parent || null, active: !!active });
  // THE KNIGHT
  N('knight', 0, 0, 0, 'thirdCut', 'THIRD CUT', 1, 'every third swing in a quick run of them is a heavy cut: half as hard again, and it shoves');
  N('knight', 0, 1, 0, 'riposte', 'RIPOSTE', 1, 'turn a blow on the shield and your next swing, within a breath, cuts twice as hard', 'thirdCut');
  N('knight', 0, 1, 1, 'risingCut', 'RISING CUT', 3, 'F: an uppercut that launches you and the foe. plunge after it', 'thirdCut', true);
  N('knight', 0, 2, 0, 'reaper', 'REAPER', 3, 'every kill gives you back 3 stamina a point', 'riposte');
  N('knight', 0, 3, 0, 'flurry', 'FLURRY', 1, 'swings cost half the stamina', 'reaper');
  N('knight', 1, 0, 0, 'steady', 'STEADY', 3, 'blows on the shield cost 15% less stamina a point', null);
  N('knight', 1, 1, 0, 'parry', 'PERFECT GUARD', 1, 'raise the shield just as a blow lands and it costs nothing, and whoever swung it reels', 'steady');
  N('knight', 1, 1, 1, 'shieldThrow', 'SHIELD THROW', 3, 'F: hurl the shield. it comes back', 'steady', true);
  N('knight', 1, 2, 0, 'bash', 'SHIELD BASH', 1, 'swing while the shield is up and you bash with it: it shoves and staggers what is in front, and knocks back what flies at you', 'parry');
  N('knight', 1, 3, 0, 'bulwark', 'BULWARK', 1, 'arrows, seeds and spells that hit your shield fly back where they came from', 'bash');
  N('knight', 2, 0, 0, 'footing', 'SURE FOOTING', 3, 'the dodge and the plunge cost 2 less stamina a point', null);
  N('knight', 2, 1, 0, 'breath', 'SECOND BREATH', 3, 'stamina comes back 10% faster a point', 'footing');
  N('knight', 2, 1, 1, 'groundSlam', 'GROUND SLAM', 3, 'F: quake the floor both ways', 'footing', true);
  N('knight', 2, 2, 0, 'bounding', 'BOUNDING', 1, 'each pogo in a row without landing hits a quarter harder, up to double, and gives back 8 stamina', 'breath');
  N('knight', 2, 3, 0, 'airRoll', 'AIR ROLL', 1, 'dodge once in the air, every jump', 'bounding');
  // THE PYROMANCER
  N('pyro', 0, 0, 0, 'skip', 'SKIPPING EMBER', 1, 'an ember that hits the ground bounces once, and burns where it lands');
  N('pyro', 0, 1, 0, 'twin', 'TWIN EMBER', 1, 'a tap throws two embers, one high and one low', 'skip');
  N('pyro', 0, 1, 1, 'vent', 'VENT', 3, 'F: blast all your heat out at once. the hotter, the harder. lights lamps', 'skip', true);
  N('pyro', 0, 2, 0, 'stoke', 'STOKE', 3, 'every ember that hits a foe adds 2 heat a point', 'twin');
  N('pyro', 0, 3, 0, 'brand', 'BRAND', 1, 'a burning foe takes half as much again from everything', 'stoke');
  N('pyro', 1, 0, 0, 'longFlame', 'LONG FLAME', 3, 'the jet reaches 11% further a point', null);
  N('pyro', 1, 1, 0, 'updraft', 'UPDRAFT', 1, 'jetting in the air holds you up: you fall slowly for as long as it burns', 'longFlame');
  N('pyro', 1, 1, 1, 'fireWall', 'FIRE WALL', 3, 'F: a line of flame ahead of you for three seconds', 'longFlame', true);
  N('pyro', 1, 2, 0, 'searing', 'SEARING', 1, 'what the jet touches burns three times as long', 'updraft');
  N('pyro', 1, 2, 1, 'wisp', 'WISP', 3, 'F: a flame that follows you, lights every lamp it passes and dives at foes', 'fireWall', true);
  N('pyro', 1, 3, 0, 'blaze', 'BLAZE', 1, 'full heat holds twice as long before it starts to go', 'searing');
  N('pyro', 2, 0, 0, 'fleet', 'FLEET', 3, 'the dodge and the firedrop cost 2 less a point, and stamina returns 7% faster a point', null);
  N('pyro', 2, 1, 0, 'emberSkin', 'EMBER SKIN', 1, 'whatever strikes you catches fire', 'fleet');
  N('pyro', 2, 1, 1, 'cinderStep', 'CINDER STEP', 3, 'F: a burning dash you cannot be hit in', 'fleet', true);
  N('pyro', 2, 2, 0, 'heatShield', 'HEAT SHIELD', 1, 'above half heat you take a quarter less damage', 'emberSkin');
  N('pyro', 2, 2, 1, 'kindle', 'KINDLE', 1, 'always on: fire mends you instead of burning you. stand in it', 'cinderStep');
  N('pyro', 2, 3, 0, 'phoenix', 'PHOENIX', 1, 'once a wood, a killing blow leaves you on your feet in a burst of fire', 'heatShield');
  // THE PALADIN
  N('paladin', 0, 0, 0, 'radiance', 'RADIANCE', 3, 'the light fills 10% faster a point', null);
  N('paladin', 0, 1, 0, 'mercy', 'MERCY', 1, 'mend gives back 30 stamina as well', 'radiance');
  N('paladin', 0, 1, 1, 'consecrate', 'CONSECRATE', 3, 'F: hallow the ground around you. foes on it burn with holy fire, and you mend while you stand in it', 'radiance', true);
  N('paladin', 0, 2, 0, 'smite', 'SMITE', 1, 'judgement leaves every foe it strikes burning', 'mercy');
  N('paladin', 0, 3, 0, 'martyr', 'MARTYR', 1, 'once a life, falling under a quarter health fills the light at once', 'smite');
  N('paladin', 1, 0, 0, 'stalwart', 'STALWART', 3, 'the aegis drains 15% less stamina a point', null);
  N('paladin', 1, 1, 0, 'reflect', 'REFLECTION', 1, 'arrows, seeds and spells the aegis turns fly back where they came from', 'stalwart');
  N('paladin', 1, 1, 1, 'holyCharge', 'HOLY CHARGE', 3, 'F: charge shield-first. whatever you hit is thrown aside and reels, and nothing touches you while you go', 'stalwart', true);
  N('paladin', 1, 2, 0, 'retribution', 'RETRIBUTION', 1, 'whoever lands a blow on the aegis reels from it', 'reflect');
  N('paladin', 1, 3, 0, 'sanctuary', 'SANCTUARY', 1, 'while you hold the aegis you mend, 3 health a second', 'retribution');
  N('paladin', 2, 0, 0, 'ironLungs', 'IRON LUNGS', 3, 'the heavy step costs 2 less a point, and stamina returns 7% faster a point', null);
  N('paladin', 2, 1, 0, 'shockwave', 'SHOCKWAVE', 1, 'hammerfall waves travel twice as far', 'ironLungs');
  N('paladin', 2, 1, 1, 'blessedHammer', 'BLESSED HAMMER', 3, 'F: a hammer of light that spins out from you in a widening spiral, striking all it passes', 'ironLungs', true);
  N('paladin', 2, 2, 0, 'concuss', 'CONCUSSION', 1, 'every third maul blow in a quick run lands half as hard again and leaves a small foe reeling', 'shockwave');
  N('paladin', 2, 3, 0, 'wrath', 'WRATH', 3, 'every kill fills 5 light a point', 'concuss');
  // THE STAT SKILLS, in the second column: small, stacking, three points each
  N('knight', 0, 0, 1, 'whetstone', 'WHETSTONE', 3, '+1 sword damage a point');
  N('knight', 0, 2, 1, 'heavyPlunge', 'HEAVY PLUNGE', 3, 'the plunge and the pogo hit 15% harder a point', 'risingCut');
  N('knight', 1, 0, 1, 'ironhide', 'IRONHIDE', 3, '+8 health a point');
  N('knight', 2, 0, 1, 'swiftness', 'SWIFTNESS', 3, 'run 4% faster a point');
  N('knight', 2, 2, 1, 'spring', 'SPRING', 3, 'jump about 4% higher a point', 'groundSlam');
  N('pyro', 0, 0, 1, 'hotFlame', 'HOTTER FLAME', 3, 'all your fire hits 10% harder a point');
  N('pyro', 0, 2, 1, 'leapFlame', 'LEAPING FLAME', 3, 'jump about 4% higher a point', 'vent');
  N('pyro', 1, 0, 1, 'firedropDmg', 'FIREDROP', 3, 'the firedrop hits 15% harder a point');
  N('pyro', 2, 0, 1, 'lightFeet', 'LIGHT FEET', 3, 'run 4% faster a point');
  N('pyro', 2, 3, 1, 'hearth', 'HEARTH', 3, '+6 health a point', 'kindle');
  N('paladin', 0, 0, 1, 'devotion', 'DEVOTION', 3, 'mend heals 10% more a point');
  N('paladin', 0, 2, 1, 'ascension', 'ASCENSION', 3, 'jump about 4% higher a point', 'consecrate');
  N('paladin', 1, 0, 1, 'faithHp', 'STEADFAST', 3, '+10 health a point');
  N('paladin', 1, 2, 1, 'sureStride', 'SURE STRIDE', 3, 'run 4% faster a point', 'holyCharge');
  N('paladin', 2, 0, 1, 'heavyMaul', 'HEAVY MAUL', 3, '+1 maul damage a point');
  N('paladin', 2, 2, 1, 'hammerfallDmg', 'HAMMERFALL', 3, 'hammerfall waves hit 15% harder a point', 'blessedHammer'); }
const TALENTS = [{ id: 'tree', name: 'THE TALENT TREES', desc: 'three trees of skills for this hero, and the skills on F among them. two points for every wood cleared the first time. Z to open' }];
const heroLevel = () => LEVELS.filter(lv => !lv.hidden && PROG[lv.id] && PROG[lv.id].cleared).length;
const talentsOf = h => { PROG.talents = PROG.talents || {}; const m = (PROG.talents[h] = PROG.talents[h] || {}); for (const k in m) if (m[k] === true) m[k] = 1; return m; };
const tal = id => { const m = PROG.talents && PROG.talents[hero()]; const v = m ? m[id] : 0; return v === true ? 1 : (v || 0); };
const ptsSpent = h => { const m = talentsOf(h); return TREE.filter(n => n.hero === h).reduce((s, n) => s + Math.min(n.max, m[n.id] || 0), 0); };
const ptsTotal = () => godMode() ? 99 : 2 * heroLevel();
const ptsLeft = h => ptsTotal() - ptsSpent(h);
const nodeState = n => { const m = talentsOf(n.hero), r = m[n.id] || 0; if (r >= n.max) return 'max'; if (heroLevel() < ROW_LV[n.row] && !godMode()) return 'level'; if (n.parent && !(m[n.parent] > 0)) return 'parent'; return r > 0 ? 'some' : 'open'; };
const cdOf = k => (CD_MAX[k] || 3) * (1 - 0.15 * Math.max(0, tal(k) - 1)); // a skill's wait shortens with every point past the first
const amul = k => 1 + 0.25 * Math.max(0, tal(k) - 1); // and its blow deepens
const STORE_TABS = [{ name: 'HEROES', items: HEROES, key: 'hero', owned: 'heroes' }, { name: 'SKINS', items: SKINS, key: 'skin', owned: 'skins' }, { name: 'SWORDS', items: SWORDS, key: 'sword', owned: 'swords' }, { name: 'SMITH', items: UPGRADES, key: null, owned: 'items' }, { name: 'TALENTS', items: TALENTS, key: null, owned: 'talents', talent: true }, { name: 'CHARMS', items: CHARMS, key: 'charm', owned: 'charms' }, { name: 'MUSIC', items: MENU_MUSIC, key: 'menu', owned: 'music' }];
let storeMode = 'buy', equipFrom = 'map';
const EQUIP_TABS = STORE_TABS.filter(t => t.key || t.talent); // (talents can be learned from the map and the pause menu too)
const storeTabs = () => storeMode === 'equip' ? EQUIP_TABS : STORE_TABS;
const equipItems = tab => tab.talent ? tab.items : (tab.key === 'skill' || tab.key === 'charm' ? [{ id: 'none', name: 'NONE', desc: tab.key === 'skill' ? 'nothing on F' : 'nothing worn', price: 0 }] : []).concat(tab.items.filter(k => owns(tab, k.id)));
const storeItems = tab => (storeMode === 'equip' ? equipItems(tab) : tab.items).filter(k => !k.hero || k.hero === hero());
function openEquip(from) { storeMode = 'equip'; equipFrom = from; storeTab = 0; storeI = 0; storeMsgT = 0; state = 'store'; SFX.uiSel(); }
const skinById = id => SKINS.find(k => k.id === id) || SKINS[0];
const swordById = id => SWORDS.find(k => k.id === id) || SWORDS[0];
const sword = () => swordById(PROG.sword);
const swordDmg = () => Math.round(((isPaladin() ? 16 : sword().dmg) + (PROG.items.edge ? 3 : 0) + (PROG.items.edge2 ? 3 : 0) + (PROG.items.edge3 ? 3 : 0) + Math.floor(heroLevel() / 2) + tal('whetstone') + tal('heavyMaul')) * (isPyro() ? 0.7 : 1)); // +1 damage every second level
const footTal = () => tal('footing') + tal('fleet') + tal('ironLungs');
const dodgeCost = () => Math.max(8, ST.dodge - 2 * footTal()), plungeCost = () => Math.max(12, ST.plunge - 2 * footTal());
const featDone = f => f === 'iron' ? LEVELS.some(l => PROG[l.id] && PROG[l.id].iron) : !!(PROG[f] && PROG[f].cleared);
let K = bakeKnight();
// TESTING (for now): GOD MODE owns everything and every wood is open, for as long as it is on - nothing is written into
// the save, so switching it off puts the game back; INVINCIBLE takes no damage and a fall puts you back on the last checkpoint.
const godMode = () => !!SET.godmode;
const owns = (tab, id) => godMode() || !!(PROG[tab.owned] && PROG[tab.owned][id]);
const hero = () => PROG.hero || 'knight'; const isPyro = () => hero() === 'pyro'; const isPaladin = () => hero() === 'paladin';
const silverTotal = () => LEVELS.filter(lv => !lv.hidden).reduce((n, lv) => n + [1, 2, 4].filter(b => ((PROG[lv.id] || {}).silver || 0) & b).length, 0);
const silverAvail = () => silverTotal() - (PROG.silverSpent || 0);
const PYRO_SETS = { dawn: { s: '#f0b0c0', S: '#a86070', b: '#8a4a5a', B: '#5a2a3a', r: '#fff6e0' }, emberplate: { s: '#ff9a5c', S: '#b8541c', b: '#3a3030', B: '#1e1818', r: '#ffd36b' }, tide: { s: '#4ab0b0', S: '#2a7070', b: '#1a5a5a', B: '#0e3a3a', r: '#bfe6f5' }, bracken: {}, silverknight: { s: '#dfe8f0', S: '#8aaac8', b: '#aab6c8', B: '#6a7a90', r: '#e8ecff' }, black: { s: '#3a3040', S: '#1e1826', b: '#2a2a34', B: '#15151c', r: '#c9463d' }, purple: { s: '#8a4ac0', S: '#50287a', b: '#3a2050', B: '#241238', r: '#ffd36b' }, blue: { s: '#4a90e0', S: '#2a5aa0', b: '#243a78', B: '#16244a', r: '#bfe6f5' }, marsh: { s: '#7a9a4a', S: '#4a6a2a', b: '#3a4e24', B: '#243018', r: '#8fd160' }, rose: { s: '#e07a9a', S: '#a03a5a', b: '#8a3a5a', B: '#5a2038', r: '#fff6e0' }, crimson: { s: '#c83a3a', S: '#7a1c24', b: '#5a1a1a', B: '#3a1010', r: '#ffd36b' }, verdant: { s: '#4aa05a', S: '#2a6a38', b: '#245a30', B: '#143a1c', r: '#ffd36b' }, frost: { s: '#dfe8f0', S: '#8aaac8', b: '#7a9ab8', B: '#4a6a88', r: '#3d5aa8' }, shadow: { s: '#4a3a5a', S: '#241a30', b: '#1e1828', B: '#100c18', r: '#6a3aa0' }, gilded: { s: '#e8c050', S: '#a0781c', b: '#8f6a1c', B: '#5a4010', r: '#c9463d' }, iron: { s: '#9aa3b0', S: '#5a6270', b: '#4a525e', B: '#2e343c', r: '#c9d1dc' }, spore: { s: '#9a5aa8', S: '#5a3068', b: '#5a5a34', B: '#3a3a20', r: '#b8c060' } };
// a skin dresses every hero: the paladin's plate and tabard take its colours too
const PAL_SETS = { black: { s: '#6a6a76', S: '#3a3a44', b: '#2a2a34', B: '#15151c', r: '#c9463d', y: '#c9463d' }, purple: { b: '#6a3aa0', B: '#40206a' }, blue: { b: '#2f7fe0', B: '#1f4fa0' }, marsh: { b: '#5a7a3a', B: '#3a4e24', r: '#c9b27c', y: '#c9b27c' }, rose: { b: '#d0648a', B: '#8a3a5a' }, crimson: { b: '#a8323a', B: '#6a1c24' }, verdant: { b: '#3a8a4a', B: '#245a30' }, frost: { s: '#e8f2ff', S: '#9ab8d8', b: '#7a9ab8', B: '#4a6a88', r: '#bfe6f5', y: '#bfe6f5' }, shadow: { s: '#6a6078', S: '#3a3048', b: '#3a2f4a', B: '#1e1828', r: '#8a6ac0', y: '#8a6ac0' }, gilded: { s: '#ffe6a0', S: '#c9a040', b: '#d9a83a', B: '#8f6a1c' }, iron: { s: '#9aa3b0', S: '#5a6270', b: '#4a525e', B: '#2e343c' }, spore: { b: '#8a8a54', B: '#5a5a34', r: '#9a5aa8', y: '#9a5aa8' }, silverknight: { s: '#f4f8ff', S: '#aab6c8', b: '#c9d1dc', B: '#7c8797', r: '#dfe8ff', y: '#dfe8ff' }, dawn: { b: '#e8a0b0', B: '#a0606a' }, emberplate: { s: '#7a7070', S: '#4a4040', b: '#b8541c', B: '#7a3010' }, tide: { b: '#2a8a8a', B: '#1a5a5a', r: '#bfe6f5', y: '#bfe6f5' } };
function applySkin() { setHeroVoice(hero()); const sk = skinById(PROG.skin); const pal = Object.assign({}, isPyro() ? (PYRO_SETS[sk.id] || sk.pal) : sk.pal, swordById(PROG.sword).pal); K = isPyro() ? bakePyro(pal) : isPaladin() ? bakePaladin(PAL_SETS[sk.id] || {}) : bakeKnight(pal); }
function applyUpgrades() { const lv = heroLevel(); P.maxHp = (isPyro() ? 80 : isPaladin() ? 120 : 100) + (PROG.items.heart ? 25 : 0) + 3 * lv + 8 * tal('ironhide') + 6 * tal('hearth') + 10 * tal('faithHp'); P.maxSt = 100 + (PROG.items.wind ? 30 : 0) + 5 * lv; } // the hero's level: +3 health and +5 stamina a wood (more would flatten the slope the tiers build)
let statFlash = 0; // the HUD plate flashes when a rank lands
function bakeMotherIcon() {
  const [c, g] = canvas(44, 40);
  g.fillStyle = '#3a3444'; g.fillRect(17, 14, 10, 26); g.fillStyle = '#5a5468'; g.fillRect(17, 14, 2, 26); g.fillStyle = '#241f2c'; g.fillRect(25, 14, 2, 26);
  g.fillStyle = '#4a2a5a'; g.beginPath(); g.ellipse(22, 14, 21, 5, 0, 0, 7); g.fill();
  g.strokeStyle = '#9a5aa8'; for (let x = 4; x < 40; x += 4) { g.beginPath(); g.moveTo(x, 13); g.lineTo(22 + (x - 22) * 0.7, 18); g.stroke(); }
  g.fillStyle = '#6a3a7a'; g.beginPath(); g.ellipse(22, 10, 21, 9, 0, 0, 7); g.fill();
  g.fillStyle = '#9a5aa8'; g.beginPath(); g.ellipse(18, 6, 12, 4, 0, 0, 7); g.fill();
  g.fillStyle = '#e8e0f0'; for (const [sx, sy, r] of [[8, 9, 2], [15, 4, 2.5], [26, 6, 2], [34, 9, 2.5], [22, 12, 1.5]]) { g.beginPath(); g.ellipse(sx, sy, r, r * 0.7, 0, 0, 7); g.fill(); }
  g.fillStyle = '#ffd0ff'; g.fillRect(16, 15, 3, 2); g.fillRect(25, 15, 3, 2); g.fillStyle = '#1b1626'; g.fillRect(17, 15, 1, 2); g.fillRect(26, 15, 1, 2);
  const o = outline(c, '#1b1626'); return { R: [o], L: [o], white: { R: [o], L: [o] }, ax: 22, ay: 41, w: 40, h: 40 };
}
function bakeShieldIcon() { const [c, g] = canvas(10, 12); g.fillStyle = '#c9d1dc'; g.fillRect(1, 1, 8, 7); g.fillRect(2, 8, 6, 2); g.fillRect(3, 10, 4, 1); g.fillRect(4, 11, 2, 1); g.fillStyle = '#7c8797'; g.fillRect(1, 1, 8, 1); g.fillRect(1, 1, 1, 7); g.fillStyle = '#c9463d'; g.fillRect(4, 3, 2, 5); g.fillRect(3, 4, 4, 2); g.fillStyle = '#fff6e0'; g.fillRect(2, 2, 2, 1); return outline(c, '#1b1626'); }
const SHIELD_ICON = bakeShieldIcon();
function bakeSlamIcon() { const [c, g] = canvas(10, 12); g.fillStyle = '#7c8797'; g.fillRect(1, 1, 8, 5); g.fillStyle = '#c9d1dc'; g.fillRect(1, 1, 8, 1); g.fillRect(1, 1, 2, 5); g.fillStyle = '#5c3a1d'; g.fillRect(4, 6, 2, 6); g.fillStyle = '#ffd36b'; g.fillRect(0, 10, 2, 1); g.fillRect(8, 10, 2, 1); return outline(c, '#1b1626'); }
const SLAM_ICON = bakeSlamIcon();
function bakeRiseIcon() { const [c, g] = canvas(10, 12); g.fillStyle = '#c9d1dc'; g.fillRect(4, 0, 2, 8); g.fillStyle = '#fff6e0'; g.fillRect(4, 0, 1, 7); g.fillStyle = '#8b6a2a'; g.fillRect(2, 8, 6, 1); g.fillRect(4, 9, 2, 3); g.fillStyle = '#ffd36b'; g.fillRect(1, 3, 1, 2); g.fillRect(8, 3, 1, 2); g.fillRect(0, 6, 1, 1); g.fillRect(9, 6, 1, 1); return outline(c, '#1b1626'); }
const RISE_ICON = bakeRiseIcon();
function bakeFlameIcon() { const [c, g] = canvas(10, 12); g.fillStyle = '#ff6b2c'; g.fillRect(2, 5, 6, 6); g.fillRect(3, 3, 4, 2); g.fillRect(4, 1, 2, 2); g.fillStyle = '#ffd36b'; g.fillRect(3, 7, 4, 4); g.fillRect(4, 5, 2, 2); g.fillStyle = '#fff6c8'; g.fillRect(4, 9, 2, 2); return outline(c, '#1b1626'); }
const FLAME_ICON = bakeFlameIcon();
const TONIC_ICON = (() => { const [c, q] = canvas(7, 9); q.fillStyle = '#c9d1dc'; q.fillRect(2, 0, 3, 3); q.fillStyle = '#c9463d'; q.fillRect(1, 3, 5, 5); q.fillRect(0, 4, 7, 3); q.fillStyle = '#ff9a9a'; q.fillRect(2, 4, 1, 2); return outline(c, '#1b1626'); })();
// the pyromancer's five skills each get a picture of what they do, not the same flame five times
const PIX_PAL = { o: '#ff6b2c', y: '#ffd36b', w: '#fff6c8', r: '#c9463d', R: '#8f2f28', d: '#1b1626', b: '#5c3a1d', s: '#7c8797' };
function pixIcon(rows) { const [c, g] = canvas(rows[0].length, rows.length); rows.forEach((row, y) => [...row].forEach((ch, x) => { if (PIX_PAL[ch]) { g.fillStyle = PIX_PAL[ch]; g.fillRect(x, y, 1, 1); } })); return outline(c, '#1b1626'); }
const PYRO_ICONS = {
  fireWall: pixIcon(['....o.....', '....o.....', '.o..oo..o.', '.oo.oyo.o.', 'oyo.oyo.oo', 'oyooyyooyo', 'oyyoyyoyyo', 'oywyywyywo', 'oyyyyyyyyo', 'ssssssssss', 'bbbbbbbbbb', '..........']),
  cinderStep: pixIcon(['..........', '......oo..', '.....oyyo.', '....oywyyo', 'yy..oywwyo', '...oyywyo.', 'oo.oyyyo..', '..oyyoo...', 'yyoo......', '.o..o.....', '...o......', '..........']),
  vent: pixIcon(['..........', '....y.....', '.y..o..y..', '..o.o.o...', '...ooo....', 'yooowoooy.', '...ooo....', '..o.o.o...', '.y..o..y..', '....y.....', '..........', '..........']),
  kindle: pixIcon(['....o.....', '...oyo....', '...oyo....', '.rr.o.rr..', 'rrrrrrrrr.', 'rwwrrrrrr.', 'rwrrrrrrR.', '.rrrrrrR..', '..rrrrR...', '...rrR....', '....R.....', '..........']),
  wisp: pixIcon(['.....o....', '....oyo...', '...oyyyo..', '..oywwwyo.', '..oydwdyo.', '..oywwwyo.', '...oyyyo..', '..o.ooo...', '.o........', 'o..o......', '..o.......', '..........']),
};
const PAL_ICONS = {
  consecrate: pixIcon(['....y.....', '.y..y..y..', '..yyyyy...', 'yyywwwyyy.', '..yyyyy...', '.y..y..y..', '..........', 'yyyyyyyyyy', '.ssssssss.', '..........', '..........', '..........']),
  holyCharge: pixIcon(['..........', '.ssssss...', 'sssyysss..', 'ssyyyyss..', 'ssyyyyss.y', '.ssyyss.yy', '.ssssss.y.', '..ssss....', '...ss.....', '..........', '..........', '..........']),
  blessedHammer: pixIcon(['.y......y.', '..wwwww...', '.ywwwwwy..', '..wwwww...', '....b.....', '....b...y.', '....b.....', '.y..b.....', '....b.....', '..........', '..........', '..........']) };
const skillIcon = k => k === 'groundSlam' ? SLAM_ICON : k === 'shieldThrow' ? SHIELD_ICON : k === 'risingCut' ? RISE_ICON : PYRO_ICONS[k] || PAL_ICONS[k] || FLAME_ICON;
let wisp = null; // the pyromancer's flame familiar
let hallows = [], hammers = []; // the paladin's consecrated ground, and his blessed hammers in flight
function updateHoly(dt) {
  for (const h2 of hallows) { h2.life -= dt; h2.tick -= dt;
    if (Math.random() < dt * 14) parts.push({ x: h2.x + (Math.random() - 0.5) * h2.r * 2, y: h2.y - 1, vx: 0, vy: -24 - Math.random() * 20, life: 0.8, max: 0.8, col: Math.random() < 0.5 ? '#fff6c8' : '#ffd36b', size: 1, grav: -6, glow: true });
    if (h2.tick <= 0) { h2.tick = 0.4; for (const e of enemies) if (e.alive && !e.harmless && Math.abs(e.x - h2.x) < h2.r && Math.abs(e.y - h2.y) < 30) { hurtEnemy(e, Math.round(4 * amul('consecrate')), h2.x, false); if (e.t === 'wight') e.burn = Math.max(e.burn || 0, 1); } }
    if (!P.dead && Math.abs(P.x - h2.x) < h2.r && Math.abs(P.y - h2.y) < 30) P.hp = Math.min(P.maxHp, P.hp + 3 * dt); }
  hallows = hallows.filter(h2 => h2.life > 0);
  for (const m of hammers) { m.t += dt; const r = 8 + m.t * 70, a = m.t * 8; m.x = m.x0 + m.dir * Math.sin(a) * r * 0.2 + m.dir * r * 0.9 * Math.min(1, m.t * 1.2) * Math.cos(a * 0.5); m.y = m.y0 + Math.sin(a) * r * 0.35;
    if (Math.random() < dt * 30) parts.push({ x: m.x, y: m.y, vx: 0, vy: 0, life: 0.3, max: 0.3, col: '#fff6c8', size: 1, grav: 0, glow: true });
    for (const e of enemies) { if (!e.alive || e.harmless) continue; const last = m.hit.get(e) || -9; if (m.t - last < 0.35) continue; if (overlap({ l: m.x - 6, r: m.x + 6, t: m.y - 6, b: m.y + 6 }, box(e))) { m.hit.set(e, m.t); hurtEnemy(e, Math.round(9 * amul('blessedHammer')), m.x, false); sparks(m.x, m.y, m.dir, 5); } } }
  hammers = hammers.filter(m => m.t < 1.6);
}
function drawHoly(cx, cy) {
  for (const h2 of hallows) { const k = Math.min(1, h2.life), x = Math.round(h2.x - cx), y = Math.round(h2.y - cy); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.28 * k; g.fillStyle = '#ffd36b'; g.beginPath(); g.ellipse(x, y - 1, h2.r, 6, 0, 0, 7); g.fill(); g.globalAlpha = 0.6 * k; g.strokeStyle = '#fff6c8'; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y - 1, h2.r * (0.85 + 0.1 * Math.sin(time * 4)), 5, 0, 0, 7); g.stroke(); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; }
  for (const m of hammers) { g.save(); g.translate(Math.round(m.x - cx), Math.round(m.y - cy)); g.rotate(m.t * 14); g.fillStyle = '#c9a040'; g.fillRect(-1, -1, 2, 7); g.fillStyle = '#fff6c8'; g.fillRect(-4, -5, 8, 4); g.fillStyle = '#ffd36b'; g.fillRect(-4, -5, 8, 1); g.restore(); bloom(m.x - cx, m.y - cy, 10, 0.4, 'gold'); }
}
const abilityHero = id => { const a = ABILITIES.find(x => x.id === id); return a ? a.hero : 'knight'; };
const CD_MAX = { shieldThrow: 2.5, groundSlam: 3, fireWall: 4, cinderStep: 3, risingCut: 2, vent: 3, wisp: 8, consecrate: 7, holyCharge: 4, blessedHammer: 2.5 };
const skillCd = k => (k === 'groundSlam' || k === 'fireWall') ? (P.slamCd || 0) : (P.throwCd || 0);
const skillNow = () => { const mine = TREE.filter(n => n.hero === hero() && n.active && tal(n.id)); if (!mine.length) return null; const k = PROG.skill; return mine.some(n => n.id === k) ? k : mine[0].id; };
const SPR = { mother: bakeMotherIcon(), sprig: bakeSprig(), shield: bakeShield(), spit: bakeSpitter(), wasp: bakeWasp(), seed: bakeSeed(), thorn: bakeThornback(), queen: bakeQueen(), archer: bakeArcher(), frog: bakeFrog(), hopper: bakeHopper('green'), hopper_yellow: bakeHopper('yellow'), hopper_blue: bakeHopper('blue'), sapper: bakeSapper(), bomb: bakeBomb(), brute: bakeBrute(), hound: bakeHound(), dog: bakeHound({ h: '#e8e0d0', H: '#3a3040', e: '#2a2230' }), fox: bakeFox(), chief: bakeChief(), sporeling: bakeSporeling(), lurker: bakeLurker(), drone: bakeDrone(), shaman: bakeShaman(), thief: bakeThief(), pike: bakePike(), folk: bakeFolk(false), folk2: bakeFolk(true), master: null, king: null };
const MASTER = bakeMaster(), KING = bakeKingBig(); SPR.chandelier = bakeChandelier(); SPR.harpy = bakeHarpy(); SPR.crow = bakeCrow(); SPR.horn = bakeHornblower(); SPR.bale = bakeBale(); SPR.goat = bakeCragRam(); SPR.troll = bakeTroll(); SPR.greathound = bakeGreatHound(); SPR.spider = bakeSpider(); SPR.squirrel = bakeSquirrel(); SPR.owl = bakeOwl(); SPR.lamplighter = bakeLamplighter(); SPR.keeper = bakeKeeper(); SPR.bard = bakeBard(); SPR.oldknight = bakeOldKnight(); SPR.miner = bakeMiner(); SPR.bat = bakeBat(); SPR.forgemaster = bakeForgemasterBig(); SPR.grub = bakeGrub(); SPR.rockgoblin = bakeRockGoblin(); SPR.golem = bakeGolem(); SPR.hare = bakeHare(); SPR.wight = bakeWight(); SPR.kite = SPR.sprig; SPR.windcaller = bakeWindcaller(); SPR.stormshaman = bakeGoblinShaman(); /* the boss has his own sprite now; the storm shaman keeps the old one */
SPR.dummy = (() => { const pal = { s: '#b8a888', S: '#8a7a60', e: '#2a2230', w: '#6a4a2c', W: '#4a3220', y: '#c9b27c', Y: '#9a8050', r: '#c9463d' };
  const rows = ['....ssss....', '...ssssss...', '...sesess...', '...ssssss...', '....SSSS....', '.....ww.....', '.yyyyyyyyyy.', 'yyYyyyyyyYyy', '.YyyyrryyyY.', '..yyrrrryy..', '..yyrrrryy..', '..yyyrryyy..', '..yYyyyyYy..', '...yyyyyy...', '.....ww.....', '.....ww.....', '.....ww.....', '.....ww.....', '...WWWWWW...', '..WWWWWWWW..'];
  const tilt = rows.map((r, i) => i < 14 ? '.' + r.slice(0, -1) : r);
  const f = r => outline(fromGrid(r, pal, 1), '#1b1626'); const R = [f(rows), f(tilt)], white = R.map(c => whiten(c));
  return { R, L: R.map(flipX), white: { R: white, L: white.map(flipX) }, ax: 7, ay: 21, w: 10, h: 18 }; })(); /* the trials' straw man */ SPR.sweep = bakeSweep(); SPR.foreman = bakeForeman(); SPR.cook = bakeCook(); SPR.snuffer = bakeSnuffer(); SPR.sailer = bakeSailer(); SPR.hearthgob = bakeHearthGob(); SPR.cutter = bakeCutter(); SPR.lance = bakeGoblinLance(); SPR.shardling = bakeShardling(); SPR.suncatcher = bakeSuncatcher(); SPR.roc = bakeRoc(); SPR.sentry = bakeSentry(); SPR.gqueen = bakeGoblinQueen(); SPR.throne = bakeThrone(); SPR.ram = bakeRamLord(); SPR.shepherd = bakeShepherd(); SPR.sheep = bakeSheep(); SPR.keeper = bakeKeeper(); SPR.woodsman = bakeWoodsman(); SPR.ferryman = bakeFerryman(); SPR.squire = bakeSquire(); SPR.elder = bakeElder(); SPR.master = MASTER.mounted; SPR.masterFoot = MASTER.foot; SPR.king = KING.seated; SPR.kingUp = KING.standing; SPR.bearer = SPR.sprig;
// hopper kinds: hop cooldown, hop speed, health, damage
const HOP = { green: { cd: 1.1, sp: 1, hp: 10, dmg: 15 }, yellow: { cd: 0.55, sp: 1.35, hp: 10, dmg: 12 }, blue: { cd: 1.9, sp: 0.75, hp: 20, dmg: 22 } };
const BIRD = bakeBird();
const PARTS = bakeSpitterParts();
const PAL0 = Object.assign({}, ART.C);
let TILE, PROP, BG;
function bakeAll(pal = {}) {
  Object.assign(ART.C, PAL0, pal);
  TILE = {
    dirt: [0, 1, 2, 3].map(i => ART.bakeDirt(10 + i)), top: {}, edge: {},
    log: [0, 1, 2].map(i => ART.bakeLog(50 + i)), logL: ART.bakeLogEnd(60, false), logR: ART.bakeLogEnd(61, true), comb: [0, 1, 2].map(i => ART.bakeCombPlat(560 + i)), combL: ART.bakeCombPlat(563, 'L'), combR: ART.bakeCombPlat(564, 'R'), ropeNet: [0, 1].map(i => ART.bakeRopeNet(i)), vine: [0, 1].map(i => ART.bakeVine(i)), rail: [0, 1].map(i => ART.bakeRail(i)), soft: [0, 1, 2].map(i => ART.bakeSoftRock(930 + i)), ladder: { S: [0, 1].map(i => ART.bakeRopeLadder(i, null)), L: [0, 1].map(i => ART.bakeRopeLadder(i, 'L')), R: [0, 1].map(i => ART.bakeRopeLadder(i, 'R')) }, ledge: [0, 1, 2].map(i => ART.bakeLedge(570 + i, null)), ledgeL: ART.bakeLedge(573, 'L'), ledgeR: ART.bakeLedge(574, 'R'), climb: [ART.bakeClimbFace(0), ART.bakeClimbFace(1)],
    thorns: [0, 1, 2, 3].map(i => ART.bakeThorns(70 + i)), crate: ART.bakeCrate(), roots: [0, 1, 2].map(i => ART.bakeDirtRoots(80 + i)),
    reeds: [0, 1, 2].map(i => ART.bakeReeds(90 + i)), silt: [0, 1, 2].map(i => ART.bakeSilt(85 + i)), palisade: [0, 1, 2].map(i => ART.bakePalisade(300 + i)), palisadeTop: ART.bakePalisadeTop(), bouncer: ART.bakeBouncer(), shelf: [0, 1].map(i => ART.bakeShelf(330 + i)), cryst: [0, 1].map(l => [0, 1, 2].map(st => ART.bakeCrystalTile(st, !!l))), spire: [0, 1].map(l => [0, 1].map(v => ART.bakeSpire(v, !!l))), port: [0, 1].map(i => ART.bakePortcullis(600 + i)), drystone: [0, 1, 2].map(i => ART.bakeDrystone(700 + i)), drystoneTop: [0, 1].map(i => ART.bakeDrystoneTop(710 + i)), scree: { 1: ART.bakeScreeTop(720, 1), '-1': ART.bakeScreeTop(721, -1) }, hall: [0, 1, 2].map(i => ART.bakeHallWall(610 + i)), mycTop: {}, mycDirt: [0, 1, 2].map(i => ART.bakeMycDirt(340 + i)), plank: [0, 1].map(i => ART.bakeBridgePlank(310 + i)), net: ART.bakeNet(), vine: [0, 1, 2, 3].map(i => ART.bakeVineWall(95 + i)),
  };
  for (const eL of [0, 1]) for (const eR of [0, 1]) {
    TILE.mycTop[eL + '' + eR] = [0, 1, 2].map(i => ART.bakeMycTop(350 + i + eL * 7 + eR * 13, eL, eR));
    TILE.top[eL + '' + eR] = [0, 1, 2, 3].map(i => ART.bakeGrassTop(100 + i + eL * 7 + eR * 13, eL, eR));
    TILE.edge[eL + '' + eR] = [0, 1].map(i => ART.bakeDirtEdge(140 + i + eL * 3 + eR * 5, eL, eR));
  }
  PROP = {
    coin: ART.bakeCoin(), shrine: [ART.bakeShrine(false), ART.bakeShrine(true)], gate: ART.bakeGate(), sign: ART.bakeSign(),
    tuft: [0, 1, 2, 3].map(i => ART.bakeTuft(200 + i)), flower: [0, 1, 2, 3].map(i => ART.bakeFlower(210 + i)),
    mushroom: [0, 1].map(i => ART.bakeMushroom(220 + i)), bush: [0, 1, 2].map(i => ART.bakeBush(230 + i)),
    shadow: ART.bakeShadow(6, 2), pad: ART.bakeLilyPad(), raft: ART.bakeRaft(), throne: ART.bakeThronePad(), plank: ART.bakePlank(), drop: ART.bakeDrop(),
    motherCap: ART.bakeMotherCap(), impact: ART.bakeImpact(), impactSteel: ART.bakeImpact('#c9d1dc'), impactRed: ART.bakeImpact('#ff6b6b'),
    fern: [0, 1, 2].map(i => ART.bakeFern(400 + i)), stump: [0, 1].map(i => ART.bakeStump(410 + i)), rock: [0, 1, 2].map(i => ART.bakeRock(420 + i)), cattail: [0, 1, 2].map(i => ART.bakeCattail(430 + i)), lilyFlower: ART.bakeLilyFlower(), skullPost: ART.bakeSkullPost(), tent: [0, 1].map(i => ART.bakeTent(440 + i)), campfire: ART.bakeCampfire(), tinyCap: [ART.bakeTinyCap('#4aa0b0', 450), ART.bakeTinyCap('#ff7a9a', 451), ART.bakeTinyCap('#9a5aa8', 452), ART.bakeTinyCap('#4aa0b0', 453)], moss: [0, 1, 2].map(i => ART.bakeMoss(460 + i)), butterfly: [ART.bakeButterfly('#ffd36b'), ART.bakeButterfly('#ff9ab0'), ART.bakeButterfly('#bfe6f5')], dragonfly: ART.bakeDragonfly(), crow: ART.bakeCrow(),
    hiveBg: ART.bakeHiveBg(500), honeyDrip: ART.bakeHoneyDrip(), frogStatue: [0, 1].map(i => ART.bakeFrogStatue(510 + i)), lilyLantern: ART.bakeLilyLantern(), banner: [0, 1].map(i => ART.bakeWarBanner(520 + i)), bannerHung: [0, 1].map(i => ART.bakeWarBanner(520 + i, true)), gibbet: ART.bakeGibbet(), eyrie: ART.bakeEyrie(), siege: ART.bakeSiege(), boneThrone: ART.bakeBoneThrone(), skullPile: [0, 1].map(i => ART.bakeSkullPile(530 + i)), hangCage: ART.bakeHangCage(), rootDecor: [0, 1, 2].map(i => ART.bakeRootDecor(540 + i)), sporePod: ART.bakeSporePod(),
    oldOak: [0, 1].map(i => ART.bakeOldOak(470 + i)), boat: ART.bakeBoat(480), heron: ART.bakeHeron(), totem: [0, 1].map(i => ART.bakeTotem(490 + i)), giantCap: ART.bakeGiantCap(495),
    skullMini: ART.bakeSkullMini(), compass: ART.bakeCompass(), relic: ART.bakeRelics(), bough: ART.bakeBough(), charm: ART.bakeCharms(), counter: ART.bakeCounter(), wares: [ART.bakeWares(0), ART.bakeWares(1)], shopDoor: ART.bakeShopDoor(), lanternPost: ART.bakeLanternPost(), beehive: ART.bakeBeehive(), birdhouse: ART.bakeBirdhouse(), fishTrap: [0, 1].map(i => ART.bakeFishTrap(800 + i)), spearRack: ART.bakeSpearRack(), barrelStack: ART.bakeBarrelStack(), bones: [0, 1].map(i => ART.bakeBones(810 + i)), fallenLog: [0, 1].map(i => ART.bakeFallenLog(770 + i)), fence: [0, 1].map(i => ART.bakeFence(780 + i)), cart: ART.bakeCart(790), well: ART.bakeWell(), heather: [0, 1, 2].map(i => ART.bakeHeather(730 + i)), gorse: [0, 1].map(i => ART.bakeGorse(740 + i)), thistle: [0, 1].map(i => ART.bakeThistle(750 + i)), standingStone: [0, 1, 2].map(i => ART.bakeStandingStone(760 + i)), cairn: ART.bakeCairn(), boulder: ART.bakeBoulder(), bothy: ART.bakeBothy(), mill: ART.bakeMill(), sail: ART.bakeSail(), foldGate: ART.bakeFoldGate(),
    bell: ART.bakeBell(), ramLog: ART.bakeRamLog(), lever: [ART.bakeLever(false), ART.bakeLever(true)], plate: [ART.bakePlate(false), ART.bakePlate(true)], palanquin: ART.bakePalanquin(), door: [ART.bakeDoor(false), ART.bakeDoor(true)], carpet: ART.bakeCarpet(),
    puffball: ART.bakePuffball(), keyIcon: { brass: ART.bakeKeyIcon('brass'), iron: ART.bakeKeyIcon('iron'), bone: ART.bakeKeyIcon('bone') }, lockPlate: ART.bakeLockPlate(), doorway: ART.bakeDoorway(), cupIcon: ART.bakeCupIcon(), lensIcon: ART.bakeLensIcon(), honeyPot: ART.bakeHoneyPot(), coffer: ART.bakeCoffer(), brightCap: ART.bakeBrightCap(), questIcon: ART.bakeQuestIcon(), cabin: ART.bakeCabin(), pine: ART.bakePine(), fallenPine: ART.bakeFallenPine(14), sluice: [ART.bakeSluice(false), ART.bakeSluice(true)], catapult: [0, 1, 2].map(i => ART.bakeCatapult(i)), nest: ART.bakeNest(), chainPost: ART.bakeChainPost(), grate: ART.bakeGrate(), silver: ART.bakeSilver(), trunk: [0, 1, 2].map(i => ART.bakeTrunk(900 + i)), bracket: [ART.bakeBracket(0), ART.bakeBracket(1)], axle: ART.bakeAxle(), pillar: [0, 1, 2].map(i => ART.bakeRockPillar(910 + i)), strut: [ART.bakeStrut(0), ART.bakeStrut(1)], mineCart: ART.bakeMineCart(), canary: ART.bakeCanary(), gasSeam: ART.bakeGasSeam(), minerLamp: [ART.bakeMinerLamp(false), ART.bakeMinerLamp(true)], timber: [ART.bakeTimberFrame(160), ART.bakeTimberFrame(144), ART.bakeTimberFrame(48)], orePan: ART.bakeOrePan(), hammer: ART.bakeHammer(), boiler: [ART.bakeBoiler(false), ART.bakeBoiler(true)], snowCap: (() => { const [c, g] = canvas(16, 5); g.fillStyle = '#dfe8ee'; g.fillRect(0, 2, 16, 3); g.fillStyle = '#ffffff'; g.fillRect(2, 1, 5, 2); g.fillRect(10, 1, 4, 2); return c; })(), lampIcon: ART.bakeLampIcon(), crownLantern: [ART.bakeCrownLantern(false), ART.bakeCrownLantern(true)], cottage: [ART.bakeCottage(false), ART.bakeCottage(true)], deadTree: [0, 1].map(i => ART.bakeDeadTree(880 + i)), glow: [ART.bakeGlowShroom(true), ART.bakeGlowShroom(false)], gillpod: ART.bakeGillPod(), moteV: ART.bakeMote('#9a5aa8'), moteT: ART.bakeMote('#4aa0b0'),
    sunshardIcon: ART.bakeSunshardIcon(), cobweb: [0, 1, 2].map(v => ART.bakeCobweb(v)), orbWeb: ART.bakeOrbWeb(), stilt: ART.bakeStilt(), groundWeb: ART.bakeGroundWeb(), bridgePost: ART.bakeBridgePost(), bridgeTower: ART.bakeBridgeTower(), gatehouse: ART.bakeGatehouse(), forge: ART.bakeForge(), anvil: ART.bakeAnvil(), folkIcon: ART.bakeFolkIcon(), castle: ART.bakeCastle(5), towertop: ART.bakeTowerTop(), treehouse: [0, 1].map(i => ART.bakeTreehouse(320 + i)), torch: ART.bakeTorch(), cage: ART.bakeCage(), barrel: ART.bakeBarrel(), brazier: [ART.bakeBrazier(false), ART.bakeBrazier(true)], crank: ART.bakeCrank(), lift: ART.bakeLift(), horn: ART.bakeHorn(), fire: ART.bakeFire(),
    heart: outline(fromGrid(['.ww.ww.', 'wwwwwww', 'wLwwwww', '.wwwww.', '..www..', '...w...'], { w: '#e04848', L: '#ff9a9a' }, 1), ART.OUT),
    bolt: outline(fromGrid(['..gg.', '.gg..', 'gggg.', '..gg.', '.gg..'], { g: '#8fd160' }, 1), ART.OUT),
    lock: outline(fromGrid(['.SSS.', 'S...S', 'SSSSS', 'SSySS', 'SSSSS'], { S: '#8b8378', y: '#e0b040' }, 1), ART.OUT),
  };
  PROP.relic.fleece = ART.bakeFleeceIcon(); PROP.relic.spurs = ART.bakeSpursIcon(); PROP.relic.shoes = ART.bakeShoesIcon(); PROP.relic.sunshard = ART.bakeSunshardIcon(); PROP.relic.banner = (() => { const [c, g2] = canvas(10, 12); g2.fillStyle = '#5a6270'; g2.fillRect(1, 0, 1, 12); g2.fillStyle = '#5a2a7a'; g2.fillRect(2, 1, 7, 7); g2.fillStyle = '#e0b040'; g2.fillRect(4, 3, 3, 3); g2.fillStyle = '#5a2a7a'; g2.fillRect(2, 8, 3, 2); g2.fillRect(6, 8, 3, 2); return c; })(); PROP.sealIcon = (() => { const [c, g2] = canvas(10, 10); g2.fillStyle = '#7a1c24'; g2.beginPath(); g2.arc(5, 5, 4.5, 0, 7); g2.fill(); g2.fillStyle = '#c9463d'; g2.beginPath(); g2.arc(5, 5, 3, 0, 7); g2.fill(); g2.fillStyle = '#e0b040'; g2.fillRect(3, 3, 1, 1); g2.fillRect(6, 3, 1, 1); g2.fillRect(4, 5, 2, 2); g2.fillRect(3, 7, 4, 1); return c; })(); PROP.relic.lamp = PROP.relic.lamp || PROP.lampIcon; /* the miner's lamp relic had no icon: the HUD threw every frame once you held it */ PROP.relic.windcloak = (() => { const [c, g] = canvas(10, 12); g.fillStyle = '#bfe6f5'; g.beginPath(); g.moveTo(5, 0); g.lineTo(9, 3); g.lineTo(9, 11); g.lineTo(5, 9); g.lineTo(1, 11); g.lineTo(1, 3); g.closePath(); g.fill(); g.fillStyle = '#7aa8c8'; g.fillRect(4, 1, 2, 8); g.fillStyle = '#ffd36b'; g.fillRect(4, 0, 2, 1); return c; })();
  const sky = (pal.sky === 'night' || pal.sky === 'teal' || pal.sky === 'autumn' || pal.sky === 'crag') ? null : (pal.sky || [[104, 170, 220], [205, 232, 210]]);
  BG = { sky: sky ? ART.bakeSky(VH, sky[0], sky[1]) : pal.sky === 'teal' ? ART.bakeSkyTeal(VH) : pal.sky === 'autumn' ? ART.bakeSkyAutumn(VH) : pal.sky === 'crag' ? ART.bakeSkyCrag(VH) : ART.bakeSkyNight(VH), skyDusk: ART.bakeSkyDusk(VH), sun: ART.bakeSun(), far: pal.far === 'crag' ? ART.bakeFarCrags(320, 90, 1) : ART.bakeFar(320, 90, 1), mid: pal.mid === 'crag' ? ART.bakeMidCrags(480, 140, 2) : ART.bakeMid(480, 140, 2), near: pal.near === 'crag' ? ART.bakeNearCrag(640, 300, 3) : pal.near === 'mushroom' ? ART.bakeNearMushrooms(640, 300, 3) : pal.near === 'autumn' ? ART.bakeNearAutumn(640, 300, 3) : ART.bakeNear(640, 300, 3, pal.canopy), nearTrees: pal.near === 'mushroom' ? ART.bakeNear(640, 300, 5, pal.canopy) : null, fg: ART.bakeFG(640, VH, 4) };
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
      const inZone = (L.stone || []).some(z => x >= z[0] && x <= z[1] && y >= z[2] && y <= z[3]) || (L.scree || []).some(z => x >= z.x0 && x <= z.x1 && y === z.y);
      const eL = l === T.AIR || isOneWay(l) || l === T.SPIKE ? 1 : 0, eR = r === T.AIR || isOneWay(r) || r === T.SPIKE ? 1 : 0;
      if (up !== T.SOLID && up !== T.CRATE) {
        s = L.palette && L.palette.myc ? TILE.mycTop[eL + '' + eR][(rnd() * 3) | 0] : TILE.top[eL + '' + eR][(rnd() * 4) | 0];
        const dress = (L.palette && L.palette.dress) || (L.palette && L.palette.myc ? 'myc' : 'wood');
        const flat2 = tileAt(x + 1, y - 1) === T.AIR && tileAt(x + 1, y) === T.SOLID && tileAt(x + 2, y - 1) === T.AIR && tileAt(x + 2, y) === T.SOLID;
        let roll = rnd();
        if ((L.interiors || []).some(([ix0, ix1, iy0]) => x >= ix0 && x <= ix1 && y >= iy0 - 4 && y < iy0)) roll = 1; // a roof over a hall: no ferns, stumps or fences up there
        if (L.snowLine !== undefined && y <= L.snowLine && rnd() < 0.85) decor.push({ k: 'snow', x: x * TS, y: y * TS - 3, c: PROP.snowCap });
        if (dress === 'myc') { roll = 1; if (rnd() < 0.42) decor.push({ k: 'tiny', x: x * TS + ((rnd() * 10) | 0), y: y * TS - 6, c: PROP.tinyCap[(rnd() * 4) | 0], ph: rnd() * 6 }); if (rnd() < 0.08) decor.push({ k: 'rock', x: x * TS + 2, y: y * TS - 6, c: PROP.rock[(rnd() * 3) | 0] }); }
        else if (dress === 'none') { roll = 1; }
        else if (dress === 'crag') { roll = 1; if (!inZone) { const r2 = rnd(); if (r2 < 0.16) decor.push({ k: 'tuft', x: x * TS + ((rnd() * 6) | 0), y: y * TS - 7, c: PROP.heather[(rnd() * 3) | 0], sway: 0 }); else if (r2 < 0.21 && flat2) decor.push({ k: 'bush', x: x * TS - 2, y: y * TS - 12, c: PROP.gorse[(rnd() * 2) | 0], birds: false }); else if (r2 < 0.26) decor.push({ k: 'fern', x: x * TS + 4, y: y * TS - 14, c: PROP.thistle[(rnd() * 2) | 0], sway: 0 }); else if (r2 < 0.32) decor.push({ k: 'rock', x: x * TS + 2, y: y * TS - 6, c: PROP.rock[(rnd() * 3) | 0] }); } }
        else if (dress === 'camp') { roll = 1; const r2 = rnd(); if (r2 < 0.03 && flat2) decor.push({ k: 'cart', x: x * TS, y: y * TS - 16, c: PROP.cart, bg: true }); else if (r2 < 0.16) decor.push({ k: 'tuft', x: x * TS + ((rnd() * 8) | 0), y: y * TS - 5, c: PROP.tuft[(rnd() * 4) | 0], sway: 0 }); else if (r2 < 0.21) { decor.push({ k: 'skull', x: x * TS + 3, y: y * TS - 24, c: PROP.skullPost, crow: rnd() < 0.5 }); } else if (r2 < 0.25 && flat2) decor.push({ k: 'tent', x: x * TS - 4, y: y * TS - 22, c: PROP.tent[(rnd() * 2) | 0], bg: true }); else if (r2 < 0.28) { decor.push({ k: 'fire', x: x * TS + 1, y: y * TS - 14, c: PROP.campfire[0], fire: true }); lights.push({ x: x * TS + 8, y: y * TS - 6, r: 38 }); } else if (r2 < 0.34) decor.push({ k: 'rock', x: x * TS + 2, y: y * TS - 7, c: PROP.rock[(rnd() * 3) | 0] }); }
        else if (dress === 'marsh') { const r2 = rnd(); if (r2 < 0.24) { decor.push({ k: 'cattail', x: x * TS + 3, y: y * TS - 22, c: PROP.cattail[(rnd() * 3) | 0], sway: 0 }); roll = 1; } else if (r2 < 0.34) { decor.push({ k: 'fern', x: x * TS + 1, y: y * TS - 10, c: PROP.fern[(rnd() * 3) | 0], sway: 0 }); roll = 1; } else if (r2 < 0.37 && flat2) { decor.push({ k: 'log', x: x * TS, y: y * TS - 10, c: PROP.fallenLog[(rnd() * 2) | 0] }); roll = 1; } else if (r2 < 0.42) { decor.push({ k: 'rock', x: x * TS + 2, y: y * TS - 7, c: PROP.rock[(rnd() * 3) | 0] }); roll = 1; } else roll = 0.5 + rnd() * 0.5; }
        else { const r2 = rnd(); if (r2 < 0.09) { decor.push({ k: 'fern', x: x * TS + 1, y: y * TS - 10, c: PROP.fern[(rnd() * 3) | 0], sway: 0 }); roll = 1; } else if (r2 < 0.13 && flat2) { decor.push({ k: 'stump', x: x * TS + 1, y: y * TS - 10, c: PROP.stump[(rnd() * 2) | 0] }); roll = 1; } else if (r2 < 0.16 && flat2) { decor.push({ k: 'log', x: x * TS, y: y * TS - 10, c: PROP.fallenLog[(rnd() * 2) | 0] }); roll = 1; } else if (r2 < 0.21) { decor.push({ k: 'rock', x: x * TS + 2, y: y * TS - 7, c: PROP.rock[(rnd() * 3) | 0] }); roll = 1; } else if (r2 < 0.235 && flat2 && dress === 'wood') { decor.push({ k: 'fence', x: x * TS, y: y * TS - 12, c: PROP.fence[(rnd() * 2) | 0], bg: true }); roll = 1; } }
        if (roll < 0.36) decor.push({ k: 'tuft', x: x * TS + ((rnd() * 8) | 0), y: y * TS - 5, c: PROP.tuft[(rnd() * 4) | 0], sway: 0 });
        else if (roll < 0.5) decor.push({ k: 'flower', x: x * TS + 3 + ((rnd() * 8) | 0), y: y * TS - 6, c: PROP.flower[(rnd() * 4) | 0], sway: 0 });
        else if (roll < 0.58) decor.push({ k: 'mushroom', x: x * TS + 2 + ((rnd() * 7) | 0), y: y * TS - 6, c: PROP.mushroom[(rnd() * 2) | 0], wob: 0 });
        else if (roll < 0.65 && tileAt(x + 1, y - 1) === T.AIR && tileAt(x + 1, y) === T.SOLID) decor.push({ k: 'bush', x: x * TS - 4, y: y * TS - 15, c: PROP.bush[(rnd() * 3) | 0], birds: rnd() < 0.5 });
      } else if (eL || eR) s = TILE.edge[eL + '' + eR][(rnd() * 2) | 0];
      else if (!(L.palette && L.palette.myc) && tileAt(x, y - 2) !== T.SOLID && rnd() < 0.4) s = TILE.roots[(rnd() * 3) | 0];
      else s = L.palette && L.palette.myc ? TILE.mycDirt[(rnd() * 3) | 0] : TILE.dirt[(rnd() * 4) | 0];
      if (L.palette && L.palette.myc && (eL || eR)) s = TILE.mycDirt[(rnd() * 3) | 0];
      if (L.palette && L.palette.hall && up === T.SOLID && tileAt(x, y + 1) !== T.SOLID) s = TILE.hall[(rnd() * 3) | 0]; // the underside of a hall's ceiling
      if (L.palette && L.palette.hall && up === T.SOLID && tileAt(x, y + 1) === T.SOLID && y < 15 && rnd() < 0.5) s = TILE.hall[(rnd() * 3) | 0];
      for (const z of (L.stone || [])) if (x >= z[0] && x <= z[1] && y >= z[2] && y <= z[3]) s = TILE.clear || (TILE.clear = canvas(TS, TS)[0]); // the menhir is drawn whole, over the column
      for (const z of (L.scree || [])) if (x >= z.x0 && x <= z.x1 && y === z.y) s = TILE.scree[z.dir];
    } else if (t === T.AIR && L.palette && L.palette.dress === 'myc' && tileAt(x, y - 1) === T.SOLID && rnd() < 0.22) { decor.push({ k: 'moss', x: x * TS + 3, y: y * TS, c: PROP.moss[(rnd() * 3) | 0], sway: 0 });
    } else if (t === T.ONEWAY) {
      const l = tileAt(x - 1, y) === T.ONEWAY, r = tileAt(x + 1, y) === T.ONEWAY;
      const inHive = L.arena && L.arena.boss === 'queen' && x * TS >= L.arena.x0 && x * TS < L.arena.x1;
      const crag = L.palette && L.palette.dress === 'crag';
      s = inHive ? (!l ? TILE.combL : !r ? TILE.combR : TILE.comb[(rnd() * 3) | 0]) : crag ? (!l ? TILE.ledgeL : !r ? TILE.ledgeR : TILE.ledge[(rnd() * 3) | 0]) : !l ? TILE.logL : !r ? TILE.logR : TILE.log[(rnd() * 3) | 0];
    } else if (t === T.REED) s = TILE.reeds[(rnd() * 3) | 0];
    else if (t === T.PALISADE) s = TILE.palisade[(rnd() * 3) | 0];
    else if (t === T.BOUNCER) s = TILE.bouncer[0];
    else if (t === T.PORT) s = TILE.port[(x + y) % 2];
    else if (t === T.SHELF) s = TILE.shelf[(rnd() * 2) | 0];
    else if (t === T.CRYST) s = TILE.cryst[litRow(y) ? 1 : 0][Math.max(0, Math.min(2, crackAt[y * LW + x] || 0))];
    else if (t === T.PLANK) s = TILE.plank[(rnd() * 2) | 0];
    else if (t === T.NET) { const n = (dx, dy) => tileAt(x + dx, y + dy) === T.NET; let vr = 1, hr = 1; for (let k = 1; n(0, -k); k++) vr++; for (let k = 1; n(0, k); k++) vr++; for (let k = 1; n(-k, 0); k++) hr++; for (let k = 1; n(k, 0); k++) hr++; s = hr > vr ? TILE.ropeNet[(x + y) % 2] : (L.vines && L.vines.includes(x)) ? TILE.vine[y % 2] : TILE.ladder[n(1, 0) && !n(-1, 0) ? 'L' : n(-1, 0) && !n(1, 0) ? 'R' : 'S'][y % 2]; }
    else if (t === T.CLIMB) s = TILE.climb[(x + y) % 2];
    else if (t === T.ICE) s = TILE.ice || (TILE.ice = bakeIceTile());
    else if (t === T.WEB) s = TILE.web || (TILE.web = bakeWebTile());
    else if (t === T.RAIL) s = TILE.rail[x % 2];
    else if (t === T.SOFT) s = TILE.soft[(x + y) % 3];
    else if (t === T.SPIKE) s = TILE.thorns[(rnd() * 4) | 0];
    else if (t === T.CRATE) s = TILE.crate;
    tileSpr[y * LW + x] = s;
  }
  // a boss floor is a fighting floor: no fallen logs, stumps, fences, bushes, carts or campfires scattered on it (they read as things to jump or hide behind)
  const BULKY = new Set(['log', 'stump', 'fence', 'bush', 'cart', 'tent', 'fire', 'skull']);
  for (const A of [L.arena, L.mini]) if (A) for (let i = decor.length - 1; i >= 0; i--) { const d = decor[i]; if (BULKY.has(d.k) && d.x > A.x0 - TS && d.x < A.x1 + TS) { decor.splice(i, 1); if (d.fire) for (let j = lights.length - 1; j >= 0; j--) if (lights[j].x === d.x + 7 && lights[j].y === d.y + 8) lights.splice(j, 1); } }
}

// ---------- world state ----------
const P = { x: 0, y: 0, vx: 0, vy: 0, w: 10, h: 14, face: 1, ground: false, groundTile: 0, coyote: 0, jbuf: 0, abuf: 0, dbuf: 0, atk: -1, plunge: false, plungeRec: 0, canCut: false,
  hp: 100, maxHp: 100, hpShown: 100, st: 100, maxSt: 100, stDelay: 0, stFlash: 0, block: false, dodge: 0, dodgeCd: 0, inv: 0, grace: 0, hurt: 0, anim: 0, dead: 0, onMover: null, hitSet: new Set(), drop: 0, dust: 0, sqX: 1, sqY: 1, sqT: 0, landT: 0, guardTired: 0 };
let enemies = [], seeds = [], movers = [], parts = [], leaves = [], nums = [], ghosts = [], corpses = [], trail = [], fireflies = [], waves = [];
let acorns = [], signs = [], shrines = [], gate = null;
let checkpoint = { x: 0, y: 0 };
let state = 'title', time = 0, levelTime = 0, deaths = 0, got = 0, total = 0, kills = 0, pogoCount = 0, parries = 0, blocks = 0, dodges = 0, hitsTaken = 0;
const MEDALS = { crown: [660, 900, 1260], storm: [600, 820, 1150], moor: [480, 660, 960], scree: [450, 630, 920], spire: [520, 700, 980], hanging: [480, 660, 960], wood: [240, 360, 540], marsh: [300, 450, 660], stockade: [330, 480, 720], spore: [360, 520, 780], kings: [420, 600, 900] };
const medalFor = (id, t) => { const m = MEDALS[id] || [300, 450, 660]; return t <= m[0] ? 3 : t <= m[1] ? 2 : t <= m[2] ? 1 : 0; };
const MEDAL_NAME = ['', 'BRONZE', 'SILVER', 'GOLD'], MEDAL_COL = ['#5a5a5a', '#b87333', '#c9d1dc', '#ffd34a'];
let lives = Infinity, bannerT = 0, soundI = 0, soundCat = 0;
let stop = 0, shake = 0, kick = 0, camX = 0, camY = 0, flash = 0, killFlash = 0, introSeen = false, earned = 0;
let boss = null, bossActive = false, bossWon = 0, camLock = null, bossMusicT = 0;
let zoomT = 0, zoomAmt = 1, birds = [], drops = [], pollen = [], lightT = 8, lightFlash = 0, thunderT = 0, pogoChain = 0, tongue = null;
let burnT = {}; // per-tile burn timers for stake walls
let ripples = [], bombs = [], fires = [], props = [], lights = [], bridges = [], foxes = [], hornSquadT = 0, fireT = 0;
let clouds2 = [], roots = [], vines = [], shelfT = {}, mother = null;
let throneBlock = null, talkTo = null, talk = null; // talk: the open dialogue { lines, i, who, name }; the world stands still while it is up // talkTo: the person you pressed UP beside; their words show while you stand there // the King's thrown litter, once it lands: solid tiles you can stand on
let impacts = [], rings = [], critters = [], escape = null, stormT = 0, thrown = null, deco = [], pwaves = [], rain = [], bolts = [], rocks = [], straysGot = new Set(), strayLast = null;
const RELICS = { banner: { name: 'THE QUEEN\'S BANNER', desc: 'goblins pull their blows: a fifth less hurt', col: '#c9a0ff' }, sunshard: { name: 'SUNSHARD', desc: 'crystal holds you twice as long', col: '#bfe6f5' }, shoes: { name: 'IRON SHOES', desc: 'the planks do not give under you', col: '#8a919c' }, spurs: { name: 'CLIMBING SPURS', desc: 'cling to rock without sliding', col: '#c9d1dc' }, lamp: { name: "MINER'S LAMP", desc: 'light around you in the dark', col: '#ffd36b' }, fleece: { name: 'GOLDEN FLEECE', desc: 'stamina returns twice as fast', col: '#ffe6a0' }, crown: { name: 'HORNET CROWN', desc: 'stomps strike like plunges', col: '#e0b040' }, charm: { name: "HUNTER'S CHARM", desc: 'gold comes to you', col: '#ffd34a' }, gauntlet: { name: 'IRON GAUNTLET', desc: 'swings cost no stamina', col: '#c9d1dc' }, lantern: { name: 'GLOW LANTERN', desc: 'spores cannot put you to sleep', col: '#4aa0b0' }, windcloak: { name: 'WINDCLOAK', desc: 'hold jump to glide', col: '#bfe6f5' }, cloak: { name: 'THIEF CLOAK', desc: 'thieves cannot take your gold', col: '#6a3aa0' } };
function impactAt(x, y, kind = 'hit') { if (SET.impact) impacts.push({ x, y, t: 0, kind }); }
function ringAt(x, y, r = 18, col = '#fff6e0', life = 0.28) { if (SET.impact) rings.push({ x, y, r, col, t: 0, life }); }
let slowT = 0, flyCoins = [], coinCombo = 0, coinComboT = 0, heartT = 0, cricketT = 0, dripT = 0, fish = [], fishT = 3, clouds = [], mapClouds = [], mapBirds = [];
const CLOUD = ART.bakeClouds(), MAPSIGN = ART.bakeMapSign(), FISH = ART.bakeFish();
for (let i = 0; i < 6; i++) clouds.push({ x: Math.random() * 900, y: 8 + Math.random() * 50, k: i % 3, sp: 4 + Math.random() * 5 });
for (let i = 0; i < 4; i++) mapClouds.push({ x: Math.random() * VW, y: 10 + Math.random() * 120, k: i % 3, sp: 5 + Math.random() * 4 });
for (let i = 0; i < 2; i++) mapBirds.push({ t: Math.random() * 6, cx: 90 + i * 120, cy: 60 + i * 30, r: 24 + i * 10 });
const collectedCrates = new Set();
// DOORWAYS. A room is not a second level: it is a part of this level's own grid, built off where the
// street can reach, with an `interiors` rectangle over it so it reads as indoors. Stepping into a
// doorway wipes, moves the knight to the doorway it is paired with, and locks the camera to that room.
// Everything else - checkpoints, foes, props, what you already killed - comes along for free.
let warp = null; // { t, dur, to, phase }
function warpTo(from) {
  const dest = props.find(pr => pr.t === 'doorway' && pr.id === from.to);
  if (!dest) return;
  warp = { t: 0, dur: 0.42, dest, half: false };
  SFX.thud(); P.vx = 0; P.vy = 0;
}
function updateWarp(dt) {
  if (!warp) return true;
  warp.t += dt;
  if (!warp.half && warp.t >= warp.dur / 2) {
    warp.half = true;
    const d = warp.dest;
    P.x = d.x; P.y = d.y; P.vx = 0; P.vy = 0; P.onMover = null;
    camX = P.x - VW / 2; camY = P.y - VH * 0.6;
    camLock = d.lock ? { x0: d.lock[0] * TS, x1: d.lock[1] * TS } : null;
    setReverb(d.lock ? 0.22 : (L.dark ? 0.34 : 0.04));
    if (d.label) number(P.x, P.y - 34, d.label, '#ffd36b');
  }
  if (warp.t >= warp.dur) warp = null;
  return false; // the world holds still while the door is closing
}
function drawWarp() {
  if (!warp) return;
  const k = warp.t / warp.dur, a = k < 0.5 ? k * 2 : (1 - k) * 2;
  g.fillStyle = 'rgba(8,6,12,' + Math.min(1, a * 1.15).toFixed(3) + ')'; g.fillRect(0, 0, VW, VH);
}
// ---------------- CRYSTAL ----------------
// The mountain is coming apart. A crystal ledge cracks in stages under a standing weight - it rings
// first, then it crazes, then it goes - and when it goes it takes the crystals TOUCHING it with it and
// drops the pieces on whatever is below. You can also break one on purpose, which is how you open a
// route and how you drop a ledge on a goblin. Above the cloud line the sun is on the rock and it all
// happens half again as fast.
let crackAt = {}, crystT = {}, shards = [];
const litRow = ty => !!(L && L.cloudLine !== undefined && ty < L.cloudLine);
const crystSpeed = ty => litRow(ty) ? 1.5 : 1;
function crystSpr(i) { const ty = Math.floor(i / LW); return TILE.cryst[litRow(ty) ? 1 : 0][Math.max(0, Math.min(2, crackAt[i] || 0))]; }
function crackCrystal(i, amount) {
  if (L.grid[i] !== T.CRYST) return;
  crackAt[i] = (crackAt[i] || 0) + amount;
  const tx = i % LW, ty = Math.floor(i / LW);
  if (crackAt[i] >= 3) { breakCrystal(i); return; }
  tileSpr[i] = crystSpr(i);
  if (Math.random() < 0.5) parts.push({ x: tx * TS + Math.random() * 16, y: ty * TS + 4, vx: 0, vy: 30, life: 0.4, max: 0.4, col: '#dff2ff', size: 1, grav: 260 });
}
function breakCrystal(i, chain) {
  if (L.grid[i] !== T.CRYST) return;
  const tx = i % LW, ty = Math.floor(i / LW);
  L.grid[i] = T.AIR; tileSpr[i] = null; destroyed.add(i); crackAt[i] = 0; crystT[i] = -(4 + Math.random() * 2);
  SFX.crack(); if (!chain) SFX.clank();
  burst(tx * TS + 8, ty * TS + 6, 8, ['#dff2ff', '#8fc8e8', '#ffffff'], 70, 0.5, 260, 2);
  // the pieces fall, and they are not fussy about what is under them
  shards.push({ x: tx * TS + 8, y: ty * TS + 10, vy: 40, life: 2.4, hit: new Set() });
  if (!chain) shakeCam(2);
  // and it takes its neighbours with it
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
    const j = (ty + dy) * LW + (tx + dx);
    if (L.grid[j] === T.CRYST && (crackAt[j] || 0) >= 1) { crystT[j] = 0.0001; crackAt[j] = 2.6; } // already crazed: this one is going too
  }
  resolveTiles();
}
function updateCrystal(dt) {
  if (!L.hasCryst) return;
  // a standing weight crazes what is under you. The pyromancer is lighter and gets longer.
  if (P.ground && P.groundTile === T.CRYST && P.relic !== 'shoes') {
    const w = (isPyro() ? 0.7 : 1) * (P.relic === 'sunshard' ? 0.5 : 1);
    for (const tx of [Math.floor((P.x - 4) / TS), Math.floor((P.x + 4) / TS)]) {
      const ty = Math.floor((P.y + 1) / TS), i = ty * LW + tx;
      if (L.grid[i] !== T.CRYST) continue;
      crystT[i] = (crystT[i] || 0) + dt * w * crystSpeed(ty);
      const want = crystT[i] > 1.15 ? 2 : crystT[i] > 0.5 ? 1 : 0;
      if (want > (crackAt[i] || 0)) { crackAt[i] = want; tileSpr[i] = crystSpr(i); if (want === 1) SFX.spark(); else SFX.crack(); }
      if (crystT[i] > 1.7) breakCrystal(i);
    }
  }
  // crystals a break has doomed go a beat later, so a run of them comes down like a run of them should
  for (const k in crystT) { if (crystT[k] > 0 && crackAt[k] >= 2.5) { crystT[k] += dt * 3; if (crystT[k] > 0.35) breakCrystal(+k, true); } }
  // and they grow back, out of the way, so a fall is never the end of the level
  for (const k in crystT) { if (crystT[k] < 0) { crystT[k] += dt; if (crystT[k] >= 0) { const i = +k;
    if (L.grid[i] === T.AIR && grid0[i] === T.CRYST && !(Math.abs(P.x - ((i % LW) * TS + 8)) < 14 && Math.abs(P.y - Math.floor(i / LW) * TS) < 20)) {
      L.grid[i] = T.CRYST; crackAt[i] = 0; crystT[i] = 0; tileSpr[i] = crystSpr(i); destroyed.delete(i);
      burst((i % LW) * TS + 8, Math.floor(i / LW) * TS + 6, 5, ['#dff2ff'], 34, 0.35); resolveTiles();
    } else crystT[k] = -0.5; } } }
  // falling pieces
  for (const sh of shards) { sh.vy = Math.min(340, sh.vy + 780 * dt); sh.y += sh.vy * dt; sh.life -= dt;
    if (Math.random() < dt * 30) parts.push({ x: sh.x + (Math.random() - 0.5) * 6, y: sh.y, vx: 0, vy: 0, life: 0.25, max: 0.25, col: '#dff2ff', size: 1, grav: 0 });
    for (const e of enemies) if (e.alive && !e.harmless && !sh.hit.has(e) && Math.abs(e.x - sh.x) < e.w / 2 + (e.t === 'suncatcher' ? 16 : 6) && sh.y > e.y - e.h && sh.y < e.y + 6) { sh.hit.add(e);
      if (e.t === 'suncatcher') { e.dimmed = 5; e.mode = 'dim'; e.modeT = 3.2; e.stagger = 3.2; hurtEnemy(e, 30, sh.x, true); number(e.x, e.y - 46, 'DIMMED: CUT IT', '#8fd160'); SFX.golemShatter(); shakeCam(7); zoomKick(1.1, 0.35); }
      else if (e.t === 'roc') { hurtEnemy(e, 20, sh.x, true); if (!rocOpen(e) && e.mode !== 'dive') { e.mode = 'downed'; e.modeT = 3; e.vx = 0; e.vy = 40; SFX.queenShriek(); shakeCam(6); zoomKick(1.1, 0.3); burst(e.x, e.y - 14, 18, ['#bfe6f5', '#eefaff', '#8a8478'], 90, 0.6); } }
      else hurtEnemy(e, DMG.shardFall, sh.x, true); }
    // a live thermal under a falling piece of glass throws it back up (and a piece on its way up is not falling on you)
    for (const pr of props) if (pr.t === 'vent' && pr.active && Math.abs(sh.x - pr.x) < (pr.w || 13) + 4 && sh.y <= pr.y + 2 && sh.y > pr.y - pr.h) { if (!sh.up) { sh.up = true; sh.life = Math.max(sh.life, 2); } sh.vy = Math.min(sh.vy, -300); }
    const ty = Math.floor(sh.y / TS), tx = Math.floor(sh.x / TS);
    if (isSolid(tx, ty)) { sh.life = 0; burst(sh.x, sh.y, 6, ['#dff2ff', '#8fc8e8'], 50, 0.4); SFX.clank(); continue; }
    if (sh.vy < 0) continue;
    if (!P.dead && !sh.hit.has(P) && Math.abs(P.x - sh.x) < 9 && sh.y > P.y - 16 && sh.y < P.y + 4) { sh.hit.add(P); damagePlayer(sh.x, DMG.shardFall, { up: true }); } }
  shards = shards.filter(sh => sh.life > 0);
}
function drawShards(cx, cy) { for (const sh of shards) { const x = Math.round(sh.x - cx), y = Math.round(sh.y - cy);
  g.fillStyle = '#dff2ff'; g.beginPath(); g.moveTo(x, y - 5); g.lineTo(x + 3, y + 3); g.lineTo(x - 3, y + 3); g.closePath(); g.fill();
  g.fillStyle = '#ffffff'; g.fillRect(x - 1, y - 3, 1, 3); } }
let webs = []; // web the Weaver spat onto the floor: { x, y, t } - it holds your feet until you cut it
let destroyed = new Set(), cutBridges = new Set(); // tiles the player broke this attempt: they stay broken
let embers = []; // the pyromancer's fireballs: { x, y, vx, vy, life, hit }
let FOGC = null, DARKC = null, darkNow = 0.5;
let silvers = []; // the three silver coins of the level: { x, y, i, got }
let marks = new Set(); // world changes that persist through death: 'tree:x' felled, 'pool:x0' drained, 'cat:x' wrecked, 'ferry:x0' paid, 'cage:x' opened
function resetPools() { for (const p of (L.pools || [])) if (p.y0 !== undefined) { p.y = p.y0; p.shallow = p.shallow0; p.depth = p.depth0; p.draining = false; } }
// re-apply the persistent world changes to a freshly restored grid; true if any tile changed
// Keys live in `marks`, like the felled tree and the drained channel, so dying does not take them
// off you and make the wood a chore. A gate you have opened stays open for the rest of the attempt.
const hasKey = k => marks.has('key:' + k);
const KEY_NAME = { brass: 'THE BRASS KEY', iron: 'THE IRON KEY', bone: 'THE BONE KEY' };
// A PORTCULLIS IS SEEN TO MOVE. Every gate the game drops or lifts slides in its slot - down fast with a clang,
// up slowly on its chains - instead of blinking in or out. The tiles change at once (nobody slips under a
// falling gate); only the drawing catches up.
let gateFx = [];
function closeGate(col, y0, y1) { const ys = [];
  for (let ty = y0; ty <= y1; ty++) { const i = ty * LW + col; if (L.grid[i] === T.AIR) { L.grid[i] = T.PORT; ys.push(ty); } }
  if (!ys.length) return; resolveTiles(); for (const ty of ys) tileSpr[ty * LW + col] = null;
  gateFx.push({ col, ys, t: 0, dur: 0.28, closing: true }); SFX.gateDrop(); }
function openGate(col, y0 = 0, y1 = LH - 1, mark = false) { const ys = [];
  for (let ty = y0; ty <= y1; ty++) { const i = ty * LW + col; if (L.grid[i] === T.PORT) { L.grid[i] = T.AIR; tileSpr[i] = null; if (mark) destroyed.add(i); ys.push(ty); } }
  if (!ys.length) return; resolveTiles(); gateFx.push({ col, ys, t: 0, dur: 0.7, closing: false }); SFX.gateLift(); }
function updateGateFx(dt) { for (const f of gateFx) { f.t += dt;
    if (f.closing && f.t >= f.dur && !f.landed) { f.landed = true; f.ys.forEach((ty, k) => { const i = ty * LW + f.col; if (L.grid[i] !== T.AIR) tileSpr[i] = f.spr ? f.spr[k] : TILE.port[(ty + f.col) % 2]; });
      const bx = f.col * TS + 8, by = (Math.max(...f.ys) + 1) * TS; dust(bx, by, 6); shakeCam(2.5); SFX.gateLand(); } }
  gateFx = gateFx.filter(f => f.t < f.dur + 0.02); }
// HOW A GATE OPENS, said over it in pictures (never words): a winch's gate has a crank over it and a rope run from
// the winch to it; a gate the alarm dropped has a bell, a red pip for every guard still up, and a bar running down
// to when it lifts anyway; the armoury door has the smith's hammer; a locked gate points you toward its key.
function drawGateHints(cx, cy) {
  const gateTop = col => { for (let ty = 0; ty < LH; ty++) if (L.grid[ty * LW + col] === T.PORT) return ty; return -1; };
  const plate = (x, y, edge) => { g.fillStyle = 'rgba(10,8,20,0.75)'; g.fillRect(x - 9, y - 9, 18, 18); g.strokeStyle = edge; g.lineWidth = 1; g.strokeRect(x - 8.5, y - 8.5, 17, 17); };
  const bob = Math.round(Math.sin(time * 3) * 1.5);
  for (const pr of props) if (pr.t === 'winch' && !(pr.open > 0)) { const top = gateTop(pr.gate); if (top < 0) continue; const gx = pr.gate * TS + 8 - cx, gy = top * TS - cy; if (gx < -60 || gx > VW + 60) continue;
    g.strokeStyle = 'rgba(201,178,124,0.75)'; g.lineWidth = 1; g.setLineDash([2, 2]); g.beginPath(); g.moveTo(pr.x - cx + 0.5, pr.y - 18 - cy); g.lineTo(pr.x - cx + 0.5, gy - 4); g.lineTo(gx, gy - 4); g.stroke(); g.setLineDash([]); // the rope from the drum to the gate
    const py2 = gy - 16 + bob; plate(gx, py2, '#c9a040'); g.strokeStyle = '#e8dcc0'; g.lineWidth = 1; g.beginPath(); g.arc(gx, py2, 4, 0, 7); g.stroke(); const a = time * 3; g.beginPath(); g.moveTo(gx, py2); g.lineTo(gx + Math.cos(a) * 6, py2 + Math.sin(a) * 6); g.stroke(); g.fillStyle = '#ffd36b'; g.fillRect(Math.round(gx + Math.cos(a) * 6) - 1, Math.round(py2 + Math.sin(a) * 6) - 1, 2, 2); // a turning crank
    if (Math.abs(P.x - pr.x) < 120) { const k = 0.5 + 0.5 * Math.sin(time * 6); g.globalAlpha = 0.4 + 0.4 * k; g.strokeStyle = '#ffd36b'; g.beginPath(); g.ellipse(Math.round(pr.x - cx), Math.round(pr.y - 10 - cy), 10 + k * 2, 12 + k * 2, 0, 0, 7); g.stroke(); g.globalAlpha = 1; } } // and the winch itself glows: strike it
  for (const sec of (L.alarms || [])) if (sec.on && !sec.done) { const left = enemies.filter(e => e.alive && e.garrison === sec.id).length;
    for (const [col] of sec.gates) { const top = gateTop(col); if (top < 0) continue; const gx = col * TS + 8 - cx, gy = top * TS - cy - 16 + bob; if (gx < -40 || gx > VW + 40) continue;
      plate(gx, gy, '#ff6b6b'); g.fillStyle = '#e0b040'; g.fillRect(gx - 3, gy - 4, 6, 5); g.fillRect(gx - 4, gy + 1, 8, 1); g.fillRect(gx - 1, gy + 2, 2, 2); // the bell
      for (let i = 0; i < left; i++) { g.fillStyle = '#ff6b6b'; g.fillRect(gx - 8 + i * 5, gy + 11, 3, 3); } // a pip for every guard still standing
      g.fillStyle = '#3a3040'; g.fillRect(gx - 9, gy - 13, 18, 2); g.fillStyle = '#ffd36b'; g.fillRect(gx - 9, gy - 13, Math.round(18 * Math.max(0, 1 - (sec.onT || 0) / 20)), 2); } } // and time running down to when it lifts anyway
  if (L.mini && !miniDone) { const top = gateTop(L.mini.gate); if (top >= 0) { const gx = L.mini.gate * TS + 8 - cx, gy = top * TS - cy - 16 + bob; if (gx > -40 && gx < VW + 40) { plate(gx, gy, '#ff9a5c'); g.fillStyle = '#8a919c'; g.fillRect(gx - 5, gy - 5, 10, 5); g.fillStyle = '#5c3a1d'; g.fillRect(gx - 1, gy, 2, 6); } } } // the smith's hammer: he holds this door
  for (const st of (L.trial || [])) if (!st.done) { const gx = st.gate * TS + 8 - cx, gy = 14 * TS - cy - 14 + bob; if (gx < -40 || gx > VW + 40) continue; plate(gx, gy, '#8fd160'); for (let i = 0; i < st.n; i++) { g.fillStyle = i < (st.got || 0) ? '#8fd160' : '#3a3a44'; g.fillRect(gx - st.n * 3 + i * 6 + 1, gy - 2, 4, 4); } } // a trial's gate: a pip for each time it wants
  for (const pr of props) if (pr.t === 'lockgate' && !pr.open && !hasKey(pr.needs) && Math.abs(P.x - pr.x) < 80 && Math.abs(P.y - pr.y) < 60) { const k = props.find(q => q.t === 'key' && q.kind === pr.needs && !q.got); if (!k) continue;
    const dx = k.x - P.x, dy = k.y - P.y, d = Math.hypot(dx, dy) || 1, ax = Math.round(P.x - cx + dx / d * 22), ay = Math.round(P.y - 30 - cy + dy / d * 10), an = Math.atan2(dy, dx), pulse = 0.5 + 0.5 * Math.sin(time * 6);
    g.globalAlpha = 0.6 + 0.4 * pulse; g.fillStyle = '#e0b040'; g.beginPath(); g.moveTo(ax + Math.cos(an) * 6, ay + Math.sin(an) * 6); g.lineTo(ax + Math.cos(an + 2.5) * 5, ay + Math.sin(an + 2.5) * 5); g.lineTo(ax + Math.cos(an - 2.5) * 5, ay + Math.sin(an - 2.5) * 5); g.closePath(); g.fill(); g.globalAlpha = 1; } // the key is that way
}
function trialEvent(kind) { if (!L || !L.trial) return; const st = L.trial.find(q => !q.done && P.x / TS >= q.x0 - 1 && P.x / TS < q.gate + 1); if (!st || st.kind !== kind) return;
  st.got = (st.got || 0) + 1; SFX.coin(); if (st.got >= st.n) { st.done = true; openGate(st.gate, 0, LH - 1); SFX.sting(); ringAt(P.x, P.y - 10, 20, '#8fd160', 0.4); } }
function updateTrial() { if (!L || !L.trial) return; for (const st of L.trial) if (!st.done && st.fill && !st.filled && P.x / TS >= st.x0 && P.x / TS < st.gate) { st.filled = true; P.light = Math.max(P.light || 0, st.fill); motes(P.x, P.y - 12, 12, 10); } }
function drawGateFx(cx, cy) { for (const f of gateFx) { const top = Math.min(...f.ys), bot = Math.max(...f.ys), h = (bot - top + 1) * TS, x = f.col * TS - cx;
    if (x < -TS || x > VW) continue; const k = Math.min(1, f.t / f.dur), off = f.closing ? -h * (1 - k * k) : -h * (k * k * (3 - 2 * k));
    g.save(); g.beginPath(); g.rect(x, top * TS - cy, TS, h); g.clip();
    f.ys.forEach((ty, k) => g.drawImage(f.spr ? f.spr[k] : TILE.port[(ty + f.col) % 2], x, Math.round(ty * TS - cy + off)));
    g.restore(); } }
function openGateCol(col) { openGate(col, 0, LH - 1, true); }
function applyWorld() { let ch = false;
  for (const e of L.ents) if (e.t === 'lockgate' && marks.has('gate:' + e.x)) { for (let ty = 0; ty < LH; ty++) { const i = ty * LW + e.x; if (L.grid[i] === T.PORT) { L.grid[i] = T.AIR; tileSpr[i] = null; destroyed.add(i); ch = true; } } } for (const e of L.ents) if (e.t === 'felltree' && marks.has('tree:' + e.x)) for (let x = e.x + 1; x <= e.x + (e.len || 12); x++) { const i = e.y * LW + x; if (L.grid[i] !== T.PLANK) { L.grid[i] = T.PLANK; tileSpr[i] = null; ch = true; } } return ch; }
const questOf = () => L.quest || (L.strays ? { n: L.strays, item: 'sheep', name: 'EWE', done: 'THE FLOCK IS WHOLE', reward: 'fleece' } : { n: 3, item: 'none', name: 'ITEM', done: 'DONE' });
function questDone(x, y) {
  const Q = questOf(); number(x, y - 30, Q.done, '#ffd36b'); SFX.medal(); slowT = 0.4;
  { const id = LEVELS[levelIndex].id; PROG[id] = PROG[id] || {}; PROG[id].quest = true; saveProgress(); }
  if (Q.reward === 'fleece') props.push({ t: 'relic', x, y, kind: 'fleece', got: false, ph: 0 });
  else if (Q.reward === 'relic') props.push({ t: 'relic', x, y, kind: Q.relic, got: false, ph: 0 });
  else { P.hp = P.maxHp; number(P.x, P.y - 42, Q.thanks || 'THANKS', '#8fd160'); number(P.x, P.y - 52, 'HEALED', '#8fd160'); burst(P.x, P.y - 8, 14, ['#8fd160', '#fff6e0'], 50, 0.7, -20, 1); }
  for (let i = 0; i < (Q.reward === 'fleece' || Q.reward === 'relic' ? 5 : 10); i++) acorns.push({ x: x + (i - 4.5) * 5, y: y - 10, got: false, ph: Math.random() * 6, crate: 'quest' + i, vy: -110 - Math.random() * 60 });
}
function drainPool(pr) { const p = (L.pools || []).find(p => p.x0 === pr.pool); if (!p) return; marks.add('pool:' + pr.pool); pr.open = true; p.yTo = pr.to * TS + 4; p.draining = true; number(pr.x, pr.y - 30, 'THE CHANNEL DRAINS', '#bfe6f5'); SFX.splash(); SFX.heavy(); shakeCam(2); }

function loadLevel(i) {
  flight = null; if (typeof P !== 'undefined' && P) P.fly = false;
  setView('normal'); levelIndex = i; L = LEVELS[i].build(); LW = L.W; LH = L.H; bakeAll(L.palette || {});
  grid0 = new Uint8Array(L.grid); destroyed = new Set(); cutBridges = new Set(); mending = []; marks = new Set(); straysGot = new Set(); strayLast = null; for (const p of (L.pools || [])) { p.y0 = p.y; p.shallow0 = p.shallow; p.depth0 = p.depth; } tileSpr = new Array(LW * LH).fill(null); resolveTiles();
  checkpoint = { x: L.START.x * TS + 8, y: (L.START.y + 1) * TS };
  acorns = []; signs = []; shrines = []; gate = null; total = 0; silvers = [];
  for (const e of L.ents) {
    const px = e.x * TS + 8, py = (e.y + 1) * TS;
    if (e.t === 'coin') { acorns.push({ x: px, y: py - 6, got: false, ph: Math.random() * 6 }); total++; }
    if (e.t === 'sign') signs.push({ x: px, y: py, text: e[hero()] || e.text }); // a sign speaks to the hero reading it
    if (e.t === 'silver') silvers.push({ x: px, y: py - 6, i: silvers.length, got: false, ph: Math.random() * 6 });
    if (e.t === 'check') shrines.push({ x: px, y: py, lit: false });
    if (e.t === 'gate') gate = { x: px, y: py };
  }
  for (let i2 = 0; i2 < LW * LH; i2++) if (grid0[i2] === T.CRATE) total++;
  spawnEntities();
  P.x = checkpoint.x; P.y = checkpoint.y; P.face = 1; camX = 0; camY = LH * TS - VH;
}
function spawnEntities() {
  webs = []; shards = []; crackAt = {}; crystT = {}; enemies = []; seeds = []; movers = []; corpses = []; waves = []; bombs = []; fires = []; props = []; lights = []; bridges = []; foxes = []; clouds2 = []; roots = []; shelfT = {}; mother = null; boss = null; throneBlock = null; talkTo = null; talk = null; slide = null; flood = null; burnT = {}; beams = []; meltT = {}; bossActive = false; bossWon = 0; camLock = null; impacts = []; rings = []; escape = null; thrown = null; deco = []; pwaves = []; rain = []; bolts = []; vines = []; rocks = []; miniActive = false; miniDone = false;
  for (const e of L.ents) spawnEnt(e);
  spawnEntitiesTail();
}
function spawnEnt(e) {
  if (e.ifDrained !== undefined && !marks.has('pool:' + e.ifDrained * TS)) return; // lives on the channel floor: only once the water is gone
  const n0 = enemies.length;
  {
    const px = e.x * TS + 8, py = (e.y + 1) * TS;
    const base = { x: px, y: py, vx: 0, vy: 0, face: e.face || 1, alive: true, dying: 0, anim: Math.random() * 3, flash: 0, stagger: 0 };
    switch (e.t) {
      case 'sprig': enemies.push({ ...base, t: 'sprig', w: 8, h: 10, hp: EHP.sprig, speed: 28, cutter: !!e.cutter, ringer: !!e.ringer, bell: e.bell ? e.bell * TS + 8 : 0 }); break;
      case 'shield': enemies.push({ ...base, t: 'shield', w: 10, h: 14, hp: EHP.shield, speed: 26, turnT: 0 }); break;
      case 'spit': enemies.push({ ...base, t: 'spit', w: 12, h: 12, hp: EHP.spit, timer: 1 + Math.random(), mouth: 0 }); break;
      case 'wasp': enemies.push({ ...base, t: 'wasp', hx: px, hy: py, w: 8, h: 6, hp: EHP.wasp, face: -1 }); break;
      case 'thorn': enemies.push({ ...base, t: 'thorn', w: 12, h: 11, hp: EHP.thorn, speed: 22, mode: 'walk', modeT: 0 }); break;
      case 'queen': boss = { ...base, t: 'queen', w: 40, h: 20, hp: EHP.queen, maxHp: EHP.queen, mode: 'sleep', modeT: 0, face: -1, tx: px, ty: py, dive: null, phase: 1 }; enemies.push(boss); break;
      case 'frog': boss = { ...base, t: 'frog', w: 40, h: 30, hp: EHP.frog, maxHp: EHP.frog, mode: 'sleep', modeT: 0, face: -1, phase: 1, last: '' }; enemies.push(boss); break;
      case 'archer': enemies.push({ ...base, t: 'archer', w: 8, h: 10, hp: EHP.archer, speed: 24, timer: 1 + Math.random(), draw: 0, horn: !!e.horn, hornT: 0, blown: false, fire: !!e.fire }); break;
      case 'hopper': { const col = e.color || 'green'; enemies.push({ ...base, t: 'hopper', color: col, w: 8, h: 6, hp: HOP[col].hp, timer: 0.5 + Math.random(), air: false }); break; }
      case 'pad': movers.push({ kind: 'pad', x0: px - 12, x: px - 12, y0: py - 2, y: py - 2, w: 24, h: 6, sink: 0, dx: 0, dy: 0 }); break;
      case 'sapper': enemies.push({ ...base, t: 'sapper', w: 8, h: 12, hp: EHP.sapper, speed: 62, fuse: 0, fleeT: 0 }); break;
      case 'brute': enemies.push({ ...base, t: 'brute', w: 12, h: 16, hp: EHP.brute, speed: 20, mode: 'walk', modeT: 0 }); break;
      case 'hound': enemies.push({ ...base, t: 'hound', w: 12, h: 7, hp: EHP.hound, speed: 105, timer: 0, air: false }); break;
      case 'chief': boss = { ...base, t: 'chief', w: 22, h: 34, hp: EHP.chief, maxHp: EHP.chief, mode: 'sleep', modeT: 0, face: -1, phase: 1, last: '', stance: 'club', swapN: 0, leapT: 3 }; enemies.push(boss); break;
      case 'cage': { const op = marks.has('cage:' + e.x); props.push({ t: 'cage', x: px, y: py, kind: e.kind || 'bird', open: op, hp: 2, tx: e.x }); if (op && e.kind === 'squire') props.push({ t: 'npc', x: px, y: py, kind: 'squire', anim: 0 }); break; }
      case 'barrel': props.push({ t: 'barrel', x: px, y: py, x0: px, y0: py, vx: 0, rolling: false, fuse: 0, gone: false, respawnT: 0 }); break;
      case 'brazier': props.push({ t: 'brazier', x: px, y: py, lit: true, tipped: false }); break;
      case 'firepit': for (const dx of [-8, 8]) if (!fires.some(f => f.life > 9000 && Math.abs(f.x - (px + dx)) < 4)) fires.push({ x: px + dx, y: py + TS, life: 99999, delay: 0 }); lights.push({ x: px, y: py, r: 46, glow: true, warm: true }); break;
      case 'rack': props.push({ t: 'rack', x: px, y: py, kind: e.kind || 'club', hp: 3, broken: false }); break;
      case 'wisp': props.push({ t: 'wisp', x: px, y: py, y0: py, cut: false, ph: Math.random() * 6 }); break;
      case 'dog': props.push({ t: 'dog', x: px, y: py, vx: 0, vy: 0, w: 12, h: 7, face: 1, anim: 0, barkT: 0, sit: 0 }); break;
      case 'crank': props.push({ t: 'crank', x: px, y: py, wall: e.wall, hits: 0, open: false }); break;
      case 'torch': lights.push({ x: px, y: py - 10, r: 46, torch: true }); break;
      case 'treehouse': props.push({ t: 'treehouse', x: px, y: py, v: e.x % 2 }); break;
      case 'towertop': props.push({ t: 'towertop', x: px, y: py }); lights.push({ x: px, y: py - 10, r: 40 }); break;
      case 'bridge': bridges.push({ x0: e.x, x1: e.x1, y: e.y, cut: cutBridges.has(e.x), cutT: 0 }); break;
      case 'throne': props.push({ t: 'throne', x: px, y: py }); break;
      case 'relic': props.push({ t: 'relic', x: px, y: py, kind: e.kind, got: false, ph: Math.random() * 6 }); break;
      case 'key': props.push({ t: 'key', x: px, y: py - 6, kind: e.kind || 'brass', ph: Math.random() * 6, got: marks.has('key:' + (e.kind || 'brass')) }); break;
      case 'lockgate': props.push({ t: 'lockgate', x: px, y: py, col: e.x, needs: e.needs || 'brass', open: marks.has('gate:' + e.x), h: e.h || 5 }); break;
      case 'doorway': props.push({ t: 'doorway', x: px, y: py, id: e.id, to: e.to, lock: e.lock || null, kind: e.kind || 'goblin', label: e.label || null, needs: e.needs || null }); break;
      case 'door': props.push({ t: 'door', x: px, y: py, shut: false, kind: e.kind || 'goblin' }); if (e.kind === 'cottage') lights.push({ x: px - 8, y: py - 12, r: 36, glow: true }); break;
      case 'carpet': props.push({ t: 'carpet', x: px, y: py }); break;
      case 'folk': enemies.push({ ...base, t: 'folk', w: 6, h: 9, hp: EHP.folk, speed: 70, door: (e.door || 0) * TS + 8, alt: !!e.alt, court: !!e.court, harmless: true }); break;
      case 'thief': enemies.push({ ...base, t: 'thief', w: 8, h: 11, hp: EHP.thief, speed: 70, loot: 0, mode: 'stalk' }); break;
      case 'pike': enemies.push({ ...base, t: 'pike', w: 10, h: 12, hp: EHP.pike, speed: 20, mode: 'guard', modeT: 0 }); break;
      case 'bell': props.push({ t: 'bell', x: px, y: py, hp: 3, rung: false, broken: false, gate: e.gate, section: e.section, ringT: 0 }); break;
      case 'lever': props.push({ t: 'lever', x: px, y: py, ram: e.ram, on: false }); break;
      case 'ram': props.push({ t: 'ram', x: px, y: py - 16, th: 0, active: 0, tm: 0, hit: new Set() }); break;
      case 'plate': props.push({ t: 'plate', x: px, y: py, cage: e.cage, down: false }); break;
      case 'dropcage': props.push({ t: 'dropcage', x: px, y: py, y0: py, dropped: false, landed: 0, hit: new Set(), boss: !!e.boss, resetT: 0 }); break;
      case 'miner': enemies.push({ ...base, t: 'miner', w: 10, h: 11, hp: EHP.miner, speed: 26, mode: 'walk', modeT: 0, digT: 0, glass: !!e.glass }); break;
      case 'bat': enemies.push({ ...base, t: 'bat', hx: px, hy: py, w: 10, h: 6, hp: EHP.bat, mode: 'hang', modeT: 0, cd: 0, face: -1 }); break;
      case 'grub': enemies.push({ ...base, t: 'grub', w: 14, h: 7, hp: EHP.grub, speed: 14, mode: 'crawl', modeT: 0, spitT: 2 + Math.random() * 2, glow: true }); lights.push({ x: px, y: py - 4, r: 52, glow: true, ref: enemies[enemies.length - 1] }); break;
      case 'rockgoblin': enemies.push({ ...base, t: 'rockgoblin', w: 10, h: 11, hp: EHP.rockgoblin, speed: 30, mode: 'walk', modeT: 0, throwT: 2 + Math.random() * 2 }); break;
      case 'cagelift': movers.push({ kind: 'orelift', player: true, x: px - 16, y: (e.y + 1) * TS - 6, y0: (e.y + 1) * TS - 6, y1: e.to * TS - 6, w: 32, h: 6, dx: 0, dy: 0 }); break;
      case 'anvil': props.push({ t: 'anvil', x: px, y: py, ring: 0 }); break;
      case 'crystal': props.push({ t: 'crystal', x: px, y: py, dir: e.dir || [1, 0], col: e.col || 'blue', hang: !!e.hang }); lights.push({ x: px, y: py - 8, r: 60, glow: true }); break;
      case 'shard': props.push({ t: 'shard', x: px, y: py, v: e.v || 0, up: !!e.up, big: !!e.big, ph: Math.random() * 6 }); if (e.big) lights.push({ x: px, y: py - (e.up ? -8 : 8), r: 44, glow: true }); break;
      case 'mirror': props.push({ t: 'mirror', x: px, y: py, o: e.o || 0, turnT: 0, fixed: !!e.fixed }); break;
      case 'receiver': props.push({ t: 'receiver', x: px, y: py, gate: e.gate, hatch: e.hatch, gx0: e.gx0, gx1: e.gx1, lit: false, litT: 0, opened: false }); break;
      case 'works': props.push({ t: 'works', x: px, y: py, kind: e.kind, v: e.v || 0, ph: Math.random() * 6 }); if (e.kind === 'kiln' || e.kind === 'crucible') lights.push({ x: px, y: py - 10, r: e.kind === 'kiln' ? 70 : 40, glow: true, warm: true }); if (e.kind === 'window') lights.push({ x: px, y: py - 20, r: 50, glow: true }); break;
      case 'kite': enemies.push({ ...base, t: 'kite', hx: px, hy: py, w: 10, h: 12, hp: EHP.kite, mode: 'hover', modeT: 0, dropT: 1.5 + Math.random() * 2, col: ['#c9463d', '#ffd36b', '#6faa4a', '#5aa0e0'][(Math.random() * 4) | 0], face: -1 }); break;
      case 'crow': enemies.push({ ...base, t: 'crow', y: py - 8, hx: px, hy: py - 8, w: 9, h: 5, hp: EHP.crow, vx: -(e.speed || 110), amp: e.amp ?? 12, freq: e.freq || 3, ph: e.ph || 0, wake: e.wake || 330, go: false, face: -1 }); break;
      case 'horn': enemies.push({ ...base, t: 'horn', w: 8, h: 10, hp: EHP.horn, mode: 'idle', modeT: 1 + Math.random(), face: e.face || -1 }); break;
      case 'bale': enemies.push({ ...base, t: 'bale', w: 11, h: 11, hp: EHP.bale, x0: e.x0 ?? e.x - 20, x1: e.x1 ?? e.x + 20, y0: py, spin: 0, gone: 0, lastW: 1 }); break;
      case 'stormkite': props.push({ t: 'stormkite', x: px, y: py, ph: 0 }); break;
      case 'skybolt': props.push({ t: 'skybolt', x: px, y0: (e.top || 0) * TS, y1: py, period: e.period || 3.2, phase: e.phase || 0 }); break;
      case 'hare': enemies.push({ ...base, t: 'hare', hx: px, hy: py, w: 10, h: 7, hp: EHP.hare, mode: 'sit', modeT: 0, hopT: 0, hitT: 0, speed: 190 }); break;
      case 'wight': enemies.push({ ...base, t: 'wight', w: 8, h: 13, hp: EHP.wight, mode: 'rise', modeT: 0.5, life: 7, hitT: 0 }); break;
      case 'tether': props.push({ t: 'tether', x: px, y: py, hp: 2, cut: false, hitCd: 0 }); break;
      case 'flagpost': props.push({ t: 'flagpost', x: px, y: py, ph: Math.random() * 6 }); break;
      case 'windcaller': boss = { ...base, t: 'windcaller', w: 16, h: 32, hp: EHP.windcaller, maxHp: EHP.windcaller, mode: 'sleep', modeT: 0, face: -1, phase: 1, hitT: 0, sweepT: 3, liftT: 6, stillT: 11, sx: px, sy: py }; enemies.push(boss); break;
      case 'golem': boss = { ...base, t: 'golem', w: 30, h: 34, hp: EHP.golem, maxHp: EHP.golem, mode: 'sleep', modeT: 0, face: -1, phase: 1, hitT: 0, stompT: 3, throwT: 5, shroudT: 8, lit: false, facets: 0 }; enemies.push(boss); break;
      case 'hotplate': props.push({ t: 'hotplate', x: px, y: py, glow: 0, hot: 0 }); lights.push({ x: px, y: py - 4, r: 40, glow: true, warm: true, plate: props[props.length - 1] }); break;
      case 'forgemaster': { const fm = { ...base, t: 'forgemaster', mini: !!e.mini, w: 40, h: 32, hp: EHP.forgemaster, maxHp: EHP.forgemaster, mode: 'sleep', modeT: 0, face: -1, phase: 1, hitT: 0, slamT: 3, sprayT: 6, dragT: 7, anvilT: 10, breathT: 5, hammerT: 2.6, cartT: 5, slagT: 6, plateT: 4 }; if (!e.mini) boss = fm; enemies.push(fm); } break;
      case 'cart': movers.push({ kind: 'cart', x: px - 14, y: py - 10, x0: px - 14, y0: py - 10, w: 28, h: 10, dir: e.dir || 1, vx: 0, vy: 0, rolling: !!e.auto, auto: !!e.auto, gone: false, respawnT: 0, hit: new Set(), speed: e.speed || 140, dx: 0, dy: 0 }); break;
      case 'orelift': movers.push({ kind: 'orelift', x: px - 32, y: (e.y + 1) * TS - 6, y0: (e.y + 1) * TS - 6, y1: e.to * TS - 6, w: 64, h: 6, dx: 0, dy: 0 }); break;
      case 'gas': props.push({ t: 'gas', x: px, y: py, period: e.period || 7, on: 2.2, phase: e.phase || 0, vent: 0, lit: 0, armT: 0 }); break;
      case 'minerlamp': props.push({ t: 'minerlamp', x: px, y: py, lit: e.lit !== false, hitCd: 0 }); lights.push({ x: px, y: py - 8, r: 76, glow: true, warm: true, lantern: props[props.length - 1] }); break;
      case 'boiler': props.push({ t: 'boiler', x: px, y: py, hp: 6, burst: 0, cool: 0 }); lights.push({ x: px, y: py - 20, r: 70, glow: true, warm: true, forge: true }); break;
      case 'hammer': props.push({ t: 'hammer', x: px, y: py, drop: 0, tell: 0 }); lights.push({ x: px, y: py - 26, r: 64, glow: true, warm: true, forge: true }); break;
      case 'greathound': enemies.push({ ...base, t: 'greathound', w: 32, h: 17, hp: EHP.greathound, maxHp: EHP.greathound, mode: 'wait', modeT: 0, face: -1, speed: 150, lungeT: 2, pounceT: 3.5, howlT: 5, hitT: 0, air: false, phase: 1 }); break;
      case 'spider': enemies.push({ ...base, t: 'spider', w: e.big ? 20 : 10, h: e.big ? 16 : 8, hp: e.big ? EHP.spider * 12 : EHP.spider, maxHp: e.big ? EHP.spider * 12 : undefined, big: !!e.big, mini: !!e.mini, restY: py, drop: e.drop || 100, mode: 'hang', modeT: 0, cd: 0, face: 1 }); break;
      case 'squirrel': enemies.push({ ...base, t: 'thief', squirrel: true, w: 8, h: 9, hp: EHP.spider, speed: 92, loot: 0, mode: 'stalk' }); break;
      case 'owl': boss = { ...base, t: 'owl', w: 24, h: 14, hp: EHP.owl, maxHp: EHP.owl, mode: 'sleep', modeT: 0, face: -1, phase: 1, px: px, py: py, tx: px, ty: py, swoopT: 2, screechT: 6, gustT: 9, featherT: 4, hitT: 0 }; enemies.push(boss); break;
      case 'lantern': props.push({ t: 'lantern', x: px, y: py, lit: !e.dark, hits: 0, perch: !!e.perch }); lights.push({ x: px, y: py - 30, r: 50, glow: true, lantern: props[props.length - 1] }); break;
      case 'shardling': enemies.push({ ...base, t: 'shardling', w: 9, h: 11, hp: EHP.shardling, speed: 40, mode: 'walk', modeT: 0 }); break;
      case 'gqueen': boss = { ...base, t: 'gqueen', w: 30, h: 52, hp: EHP.gqueen, maxHp: EHP.gqueen, mode: 'sleep', modeT: 0, face: -1, phase: 1, hitT: 0, pointT: 2.2, bombT: 4, guardT: 1, slamT: 2.5, sweepT: 1.5, chargeT: 5, gustT: 4, slateT: 2, leapT: 1.4, boltT: 3, throneX: px, throneY: py }; enemies.push(boss); break;
      case 'sentry': enemies.push({ ...base, t: 'sentry', w: 8, h: 11, hp: EHP.sentry, speed: 26, section: e.section, range: (e.range || 4) * TS, ringer: true, mode: 'patrol', modeT: 2, hx: px }); break;
      case 'winch': props.push({ t: 'winch', x: px, y: py, gate: e.gate, gy0: e.gy0, gy1: e.gy1, open: 0, spin: 0, hold: e.hold || 6 }); break;
      case 'weight': props.push({ t: 'weight', x: px, y: e.y * TS, len: (e.len || 3) * TS, state: 'hang', fy: 0, vy: 0, lamp: !!e.lamp, hang: !!e.hang, gq: !!e.gq, downT: 0 }); break;
      case 'support': props.push({ t: 'support', x: px, y: py, top: (e.top || e.y - 5) * TS + TS, hp: 4, broken: false, shake: 0 }); break;
      case 'rod': props.push({ t: 'rod', x: px, y: py }); break;
      case 'scaffold': props.push({ t: 'scaffold', x0: e.x * TS, x1: (e.x1 + 1) * TS, top: e.y * TS, crane: !!e.crane }); break;
      case 'cascade': props.push({ t: 'cascade', x: e.x * TS + 12, y0: e.y * TS, y1: (e.y1 + 1) * TS, ph: Math.random() * 3 }); break;
      case 'stal': props.push({ t: 'stal', x: px, y: e.y * TS, state: 'hang', t0: 0 }); break; // a crystal hanging from the shelf's underside
      case 'roc': boss = { ...base, t: 'roc', w: 34, h: 26, hp: EHP.roc, maxHp: EHP.roc, mode: 'sleep', modeT: 0, face: -1, phase: 1, diveT: 2.2, gustT: 5.5, featherT: 3, hitT: 0, vy: 0, side: 1, nestX: px, nestY: py }; enemies.push(boss); break;
      case 'suncatcher': boss = { ...base, t: 'suncatcher', w: 26, h: 28, hp: EHP.suncatcher, maxHp: EHP.suncatcher, mode: 'sleep', modeT: 0, face: -1, phase: 1, drinkT: 5, throwT: 2.4, spireT: 4, spires: [], hitT: 0 }; enemies.push(boss); break;
      case 'hearthgob': enemies.push({ ...base, t: 'hearthgob', w: 10, h: 13, hp: EHP.hearthgob, speed: 42, mode: 'asleep', modeT: 0, swingT: 0 }); break;
      case 'sweep': enemies.push({ ...base, t: 'sweep', w: 8, h: 12, hp: EHP.sweep, mode: 'hide', modeT: Math.random(), gone: 1 }); break;
      case 'chimpot': props.push({ t: 'chimpot', x: px, y: py, ph: Math.random() * 3 }); break;
      case 'dummy': enemies.push({ ...base, t: 'dummy', w: 12, h: 22, hp: 9999, hp0: 9999, face: -1 }); break;
      case 'stormshaman': enemies.push({ ...base, t: 'stormshaman', w: 10, h: 14, hp: EHP.stormshaman, castT: 1.2 + Math.random(), castFlash: 0 }); break;
      case 'cutter': enemies.push({ ...base, t: 'cutter', w: 10, h: 13, hp: EHP.cutter, speed: 40, mode: 'work', modeT: 0, bridge: e.bridge, chopT: 1.4 }); break;
      case 'lance': boss = { ...base, t: 'lance', w: 26, h: 30, hp: EHP.lance, maxHp: EHP.lance, mode: 'sleep', modeT: 0, face: -1, phase: 1, chargeT: 2.4, thrustT: 1.6, sweepT: 3, hitT: 0, broke: new Set() }; enemies.push(boss); break;
      case 'snuffer': enemies.push({ ...base, t: 'snuffer', w: 10, h: 14, hp: EHP.snuffer, speed: 46, mode: 'seek', modeT: 0, swipeT: 1.2, target: null }); break;
      case 'sailer': { const big = !!e.big; enemies.push({ ...base, t: 'sailer', w: big ? 20 : 12, h: big ? 22 : 14, hp: EHP.sailer * (big ? 11 : 1), maxHp: big ? EHP.sailer * 11 : undefined, speed: 22, mode: 'plant', modeT: 0, big, mini: !!e.mini, hitT: 0, phase: 1 }); break; }
      case 'troll': enemies.push({ ...base, t: 'troll', w: e.big ? 30 : 18, h: e.big ? 36 : 21, big: !!e.big, mini: !!e.mini, maxHp: e.big ? Math.round(EHP.troll * 3.4) : undefined, hp: e.big ? Math.round(EHP.troll * 3.4) : EHP.troll, speed: e.big ? 34 : 22, mode: 'walk', modeT: 0, throwT: 2, hitT: 0 }); break;
      case 'harpy': enemies.push({ ...base, t: 'harpy', hx: px, hy: py, w: 12, h: 7, hp: EHP.harpy, mode: 'hover', modeT: 0, face: -1, cd: 0 }); break;
      case 'goat': enemies.push({ ...base, t: 'goat', w: 14, h: 11, hp: EHP.goat, speed: 30, mode: 'patrol', modeT: 0, rider: true, timer: 0, air: false, hitT: 0 }); break;
      case 'ramlord': boss = { ...base, t: 'ram', w: 48, h: 32, hp: EHP.ram, maxHp: EHP.ram, mode: 'sleep', modeT: 0, face: -1, phase: 1, hitT: 0, n: 0 }; enemies.push(boss); break;
      case 'npc': props.push({ t: 'npc', x: px, y: py, kind: e.kind, ride: !!e.ride, anim: Math.random() * 6 }); break;
      case 'exit': props.push({ t: 'exit', x: px, y: py }); break;
      case 'stray': props.push({ t: 'stray', kind: e.kind || 'sheep', x: px, y: py, got: straysGot.has(px), anim: Math.random() * 6 }); if (e.kind === 'folk' && straysGot.has(px)) props.push(camper([...straysGot].indexOf(px))); break;
      case 'rockfall': props.push({ t: 'rockfall', x: px, y: py, every: e.every || 2.5, timer: 1 + (e.x % 3) * 0.5 }); break; /* a steady beat, no dice: learn it and walk it */
      case 'crusher': props.push({ t: 'crusher', x: px, y: py, every: e.every || 3, timer: 1 + (e.phase || 0), st: 'up', h: 0, D: 7 * TS }); break;
      case 'beam': props.push({ t: 'beam', x: px, y: py, cd: 0 }); break;
      case 'torchbracket': props.push({ t: 'torchbracket', x: px, y: py, taken: false, respawnT: 0 }); lights.push({ x: px, y: py - 14, r: 40, glow: true, warm: true, bracket: props[props.length - 1] }); break;
      case 'firevent': props.push({ t: 'firevent', x: px, y: py, every: e.every || 2.8, timer: 1 + Math.random() * 2, tell: 0, on: 0 }); break;
      case 'master': enemies.push({ ...base, t: 'master', w: 20, h: 16, hp: EHP.master, maxHp: EHP.master, mounted: true, mode: 'wait', modeT: 0, whistleT: 4, air: false, timer: 0, speed: 130 }); break;
      case 'king': boss = { ...base, t: 'king', w: 54, h: 45, hp: EHP.king, maxHp: EHP.king, mode: 'sleep', modeT: 0, phase: 1, dir: -1, gobletT: 3, summonT: 8, sweepT: 4, shoutT: 7, grabT: 5, cageT: 7, stepT: 0, throneT: 0, last: '' }; enemies.push(boss); break;
      case 'deco': { const K = { hiveBg: [PROP.hiveBg, true], drip: [PROP.honeyDrip[0], false, PROP.honeyDrip], frogStatue: [PROP.frogStatue[e.v || 0], true], lilyLantern: [PROP.lilyLantern[0], false, PROP.lilyLantern], banner: [(e.hang ? PROP.bannerHung : PROP.banner)[e.v || 0], true], boneThrone: [PROP.boneThrone, true], skullPile: [PROP.skullPile[e.v || 0], false], hangCage: [e.hang ? PROP.hangCage : PROP.gibbet, true], eyrie: [PROP.eyrie, false], siege: [PROP.siege, true], bough: [PROP.bough, true], bothy: [PROP.bothy, true], cabin: [PROP.cabin, true], trunk: [PROP.trunk[e.v || 0], true], bracket: [PROP.bracket[e.v || 0], true], axle: [PROP.axle, true], pillar: [PROP.pillar[e.v || 0], true], strut: [PROP.strut[e.v || 0], true], deadTree: [PROP.deadTree[e.v || 0], true], counter: [PROP.counter, false], wares: [PROP.wares[e.v || 0], true], barrels: [PROP.barrelStack, true], lanternPost: [PROP.lanternPost, true], beehive: [PROP.beehive, true], birdhouse: [PROP.birdhouse, true], fishTrap: [PROP.fishTrap[e.v || 0], true], spearRack: [PROP.spearRack, true], bones: [PROP.bones[e.v || 0], false], well: [PROP.well, true], cart: [PROP.cart, true], fence: [PROP.fence[e.v || 0], true], mill: [PROP.mill, true], stone: [PROP.standingStone[e.v || 0], true], cairn: [PROP.cairn, false], foldGate: [PROP.foldGate, true], rootDecor: [PROP.rootDecor[e.v || 0], false], sporePod: [PROP.sporePod[0], false, PROP.sporePod], timber: [PROP.timber[e.v || 0], true], cobweb: [PROP.cobweb[e.v || 0], true], tent: [PROP.tent[e.v || 0], true], spire: [TILE.spire[0][e.v || 0], true], throne: [SPR.throne, true], hallWindow: [HALLWIN || (HALLWIN = bakeHallWindow()), true], bridgepost: [PROP.bridgePost, false], bridgetower: [PROP.bridgeTower, true], gatehouse: [PROP.gatehouse, true], forge: [PROP.forge, true], anvil: [PROP.anvil, false], stilt: [PROP.stilt, true] }[e.kind]; if (!K) break; const c = K[0]; const onPlank = !e.hang && tileAt(e.x, e.y + 1) === T.PLANK; // a bridge plank's board sits a few pixels down its tile: stand things on the board, not in the air over it
        deco.push({ k: 'deco', kind: e.kind, x: px - Math.floor(c.width / 2), y: e.hang ? e.y * TS : py - c.height + (onPlank ? 3 : 0), c, bg: K[1], anim: K[2] || null, ph: Math.random() * 6 }); if (e.kind === 'lilyLantern') lights.push({ x: px, y: py - 6, r: 34, glow: true, pink: true }); if (e.kind === 'bothy') lights.push({ x: px + 8, y: py - 12, r: 44, glow: true }); if (e.kind === 'cabin') lights.push({ x: px - 11, y: py - 11, r: 40, glow: true }); if (e.kind === 'lanternPost') lights.push({ x: px, y: py - 18, r: 40, torch: true }); if (e.kind === 'counter') lights.push({ x: px + 6, y: py - 20, r: 56, glow: true }); if (e.kind === 'mill') lights.push({ x: px, y: py - 46, r: 30, glow: true }); if (e.kind === 'sporePod') lights.push({ x: px, y: py - 8, r: 40, glow: true }); break; }
      case 'sporeling': enemies.push({ ...base, t: 'sporeling', w: 8, h: 10, hp: EHP.sporeling, speed: 24 }); break;
      case 'lurker': enemies.push({ ...base, t: 'lurker', w: 12, h: 12, hp: EHP.lurker, mode: 'hide', modeT: 0 }); break;
      case 'drone': enemies.push({ ...base, t: 'drone', hx: px, hy: py, w: 9, h: 7, hp: EHP.drone }); break;
      case 'shaman': enemies.push({ ...base, t: 'shaman', w: 12, h: 13, hp: EHP.shaman, speed: 20, timer: 2, cast: 0 }); break;
      case 'gill': enemies.push({ ...base, t: 'gill', w: 16, h: 14, hp: EHP.gill, y: py }); break;
      case 'mother': boss = { ...base, t: 'mother', w: 28, h: 96, hp: EHP.mother, maxHp: 4, mode: 'sleep', modeT: 0, rootT: 2.5, belchT: 6, rainT: 6, tipped: false, phase: 1, gillsOpen: false, openT: 0, broodT: 0 }; mother = boss; enemies.push(boss); break;
      case 'puffball': props.push({ t: 'puffball', x: px, y: py, popped: false }); break;
      case 'sluice': props.push({ t: 'sluice', x: px, y: py, pool: e.pool * TS, to: e.to, hits: 0, open: marks.has('pool:' + e.pool * TS) }); break;
      case 'felltree': { const f = marks.has('tree:' + e.x); props.push({ t: 'felltree', x: px, y: py, hp: 4, len: e.len || 12, dir: e.dir || 1, fall: f ? 1 : 0, felled: f, tx: e.x, ty: e.y, shake: 0 }); break; }
      case 'catapult': props.push({ t: 'catapult', x: px, y: py, hp: 5, every: e.every || 2.6, timer: 1.4, fired: 0, wrecked: marks.has('cat:' + e.x), tx: e.x }); break;
      case 'nest': props.push({ t: 'nest', x: px, y: py, every: e.every || 2.4, dir: e.dir || -1, timer: 1, puff: 0 }); break;
      case 'firepit': props.push({ t: 'firepit', x: px, y: py, period: e.period || 3, on: e.on || 1.4, phase: e.phase || 0, lit: false }); break;
      case 'chainpost': { const cut = marks.has('chain:' + e.x); props.push({ t: 'chainpost', x: px, y: py, hp: 3, cut, tx: e.x }); break; }
      case 'glow': props.push({ t: 'glow', x: px, y: py, dark: 0 }); lights.push({ x: px, y: py - 8, r: 52, glow: true, ref: null }); lights[lights.length - 1].ref = props[props.length - 1]; break;
      case 'mover': movers.push({ x0: e.x * TS, x: e.x * TS, y: e.y * TS, w: e.len * TS, h: 8, range: e.range * TS, p: 0, dir: 1, dx: 0, speed: e.speed || 36, cap: !!e.cap }); break;
      case 'vent': props.push({ t: 'vent', x: px, y: py, period: e.period || 4, on: e.on || 1.6, phase: e.phase || 0, h: e.h || 112, wind: !!e.wind, heat: !!e.heat, glass: !!e.glass, lift: e.lift || 190, w: e.w || 13 }); break;
      case 'roller': props.push({ t: 'roller', x: px, y: py, vx: (e.face || 1) * (e.speed || 55), alive: true, rot: 0 }); break;
    }
  }
  const tr = tierOf(curId()); for (let i = n0; i < enemies.length; i++) { const e2 = enemies[i]; const isBoss = (L.arena && L.arena.boss === e2.t) || (L.mini && L.mini.boss === e2.t); e2.hp = Math.round(e2.hp * (isBoss ? diffNow().bhp : diffNow().ehp) * (isBoss ? 1 + 0.25 * tr : 1 + 0.5 * tr)); if (e2.maxHp) e2.maxHp = e2.hp; e2.hp0 = e2.hp; }
}
function spawnEntitiesTail() {
  if (L.strays && straysGot.size >= L.strays && strayLast) props.push({ t: 'relic', x: strayLast.x, y: strayLast.y, kind: 'fleece', got: false, ph: 0 });
  for (const m of (L.moversExtra || [])) movers.push({ ...m, dx: 0, dy: 0, moving: false, done: false, x: m.x, y: m.y, paid: m.ferry ? marks.has('ferry:' + m.x0) : undefined });
  birds = []; tongue = null; waves = [];
  for (const d of decor) if (d.k === 'bush') d.birds = true;
  let changed = false; for (let i = 0; i < LW * LH; i++) if (grid0[i] !== L.grid[i]) { if (destroyed.has(i)) continue; L.grid[i] = grid0[i]; changed = true; }
  if (applyWorld()) changed = true;
  if (changed) resolveTiles();
  spawnCritters();
}
function respawn() { P.martyrUsed = false; P.airRolled = false;
  if (flight || P.fly) { P.fly = false; flight = null; }
  setView('normal'); applyUpgrades();
  if (P.relic) { number(P.x, P.y - 30, RELICS[P.relic].name + ' LOST', '#9aa39a'); } P.relic = null;
  Object.assign(P, { x: checkpoint.x, y: checkpoint.y, vx: 0, vy: 0, hp: P.maxHp, hpShown: P.maxHp, st: P.maxSt, inv: 1, hurt: 0, dead: 0, atk: -1, plunge: false, onMover: null, face: 1, block: false, dodge: 0, throwCd: 0, slamCd: 0, riseT: 0, riseUsed: false, torch: 0 }); wisp = null;
  mendAll(); resetCastle(); spawnEntities(); seeds = []; gateFx = []; hallows = []; hammers = []; sceptres = []; embers = []; pyres = []; P.full = false; P.fullT = 0; nums = []; ghosts = []; wisp = null; rain = []; P.heat = 0; P.overheat = 0; P.light = 0; P.cHeld = 0; music.play(L.music || 'theme'); setReverb(L.dark ? 0.34 : (L.interiors && L.interiors.length) ? 0.16 : (L.palette && L.palette.hall) ? 0.12 : 0.04);
  if (escape) { escape.t = 0; escape.fireY = L.arena.floor + 6; for (const e of enemies) if (e.t === 'chief') e.alive = false; boss = null; bossActive = false; setWall(L.arena.wallL, false); setWall(L.arena.wallR, false); }
}
function startGame() {
  state = 'play'; levelTime = 0; deaths = 0; P.phoenixUsed = false; kills = 0; got = 0; lives = SET.iron ? 3 : Infinity; pogoCount = 0; parries = 0; blocks = 0; dodges = 0; hitsTaken = 0;
  for (const a of acorns) a.got = false; { const sv = (PROG[LEVELS[levelIndex].id] || {}).silver || 0; for (const s of silvers) s.got = !!(sv & (1 << s.i)); } for (const s of shrines) s.lit = false; collectedCrates.clear(); healCrates.clear(); healths = []; destroyed = new Set(); cutBridges = new Set(); marks = new Set(); straysGot = new Set(); strayLast = null; resetPools();
  checkpoint = { x: L.START.x * TS + 8, y: (L.START.y + 1) * TS };
  if (q.get('tx')) checkpoint = { x: +q.get('tx') * TS + 8, y: (+(q.get('ty') || 21) + 1) * TS };
  respawn(); camX = P.x - VW / 2; camY = P.y - 100; bannerT = 2.6; SFX.levelStart();
}
let winLevelUp = false;
function winLevel() {
  winLevelUp = !((PROG[LEVELS[levelIndex].id] || {}).cleared) && !LEVELS[levelIndex].hidden;
  state = 'win'; SFX.win(); setTimeout(() => { if (state === 'win') SFX.medal(); }, 900);
  const id = LEVELS[levelIndex].id, p = PROG[id] || {};
  PROG[id] = { relic: p.relic, quest: p.quest, silver: p.silver, cleared: true, best: p.best ? Math.min(p.best, levelTime) : levelTime, gold: Math.max(p.gold || 0, got), total, deaths: p.deaths === undefined ? deaths : Math.min(p.deaths, deaths) };
  PROG.coins = (PROG.coins || 0) + got; earned = got;
  if (winLevelUp) { applyUpgrades(); P.hp = P.maxHp; setTimeout(() => { if (state === 'win') SFX.rankUp(); }, 1500); }
  PROG[id].medal = Math.max(p.medal || 0, medalFor(id, levelTime)); if (got >= total) PROG[id].allGold = true; if (hitsTaken === 0 && deaths === 0) PROG[id].noHit = true; if (SET.iron) PROG[id].iron = true;
  saveProgress();
}

const levelLocked = lv => !godMode() && (!!lv.locked || (lv.needs && !(PROG[lv.needs] && PROG[lv.needs].cleared) && !q.get('unlock')));

// ---------- world map ----------
// One map, two regions: the Wood on the lower sheet, the Crags above it. The path climbs through the pass once Kingswood falls.
const MAPW = 320, MAPH = 360, CRAG_H = 180;
const WOOD_NODES = [
  { id: 'wood', kind: 'level', level: 0, x: 62, y: 112, name: 'BRACKEN WOOD' },
  { id: 'store', kind: 'store', shop: 'shop', x: 156, y: 66, name: 'THE STORE' },
  { id: 'marsh', kind: 'level', level: 1, x: 246, y: 118, name: 'MARSH WOOD' },
  { id: 'stockade', kind: 'level', level: 2, x: 296, y: 34, name: 'THE STOCKADE' },
  { id: 'spore', kind: 'level', level: 3, x: 214, y: 26, name: 'SPOREWOOD' },
  { id: 'kings', kind: 'level', level: 4, x: 120, y: 30, name: 'KINGSWOOD' },
];
const WOOD_PATH = [[62, 112], [96, 100], [126, 74], [156, 66], [190, 78], [222, 104], [246, 118], [268, 84], [296, 34], [258, 22], [214, 26], [170, 22], [120, 30], [92, 42], [64, 54], [40, 64]];
const CRAG_NODES = [
  { id: 'scree', kind: 'level', level: 5, x: 120, y: 92, name: 'THE SCREE PATH' },
  { id: 'hanging', kind: 'level', level: 6, x: 214, y: 58, name: 'THE HANGING VILLAGE' },
  { id: 'highstore', kind: 'store', shop: 'shopCrag', needs: 'scree', x: 280, y: 36, name: 'THE HIGH STORE' },
  { id: 'spire', kind: 'level', level: 7, x: 232, y: 118, name: 'THE SUNSPIRE' },
  { id: 'moor', kind: 'level', level: 8, x: 160, y: 150, name: 'GALE MOOR' },
  { id: 'storm', kind: 'level', level: 9, x: 82, y: 150, name: 'STORMHOLD' },
  { id: 'crown', kind: 'level', level: 10, x: 50, y: 40, name: 'HIGHCROWN' },
];
const CRAG_PATH = [[36, 128], [62, 120], [92, 104], [120, 92], [150, 84], [184, 66], [214, 58], [250, 50], [280, 36], [270, 72], [252, 100], [232, 118], [210, 134], [184, 146], [160, 150], [134, 148], [108, 144], [82, 150], [54, 162], [22, 140], [18, 100], [30, 66], [50, 40]];
const NODES = WOOD_NODES.map(n => ({ ...n, y: n.y + CRAG_H })).concat(CRAG_NODES);
const PATH = WOOD_PATH.map(([x, y]) => [x, y + CRAG_H]).concat([[38, 200]], CRAG_PATH);
const NODE_AT = [0, 3, 6, 8, 10, 12, 20, 23, 25, 28, 31, 34, 39]; // PATH index of each node: wood 0-5, then scree, the village, the high store
const MAPC = ART.bakeWorldMap(MAPW, MAPH, [{ x: 0, y: 0, w: 320, h: 180, nodes: CRAG_NODES, path: CRAG_PATH, seed: 23, style: 'crag', seam: CRAG_H }, { x: 0, y: CRAG_H, w: 320, h: 180, nodes: WOOD_NODES, path: WOOD_PATH, seed: 11, style: 'wood' }], [[[40, 64 + CRAG_H], [38, 200]], [[38, 200], [36, 128]]]);
let mapCamY = MAPH - 180;
function gotoLevelNode(li) { const k = NODES.findIndex(n => n.level === li); map.node = Math.max(0, k); map.seg = NODE_AT[map.node]; map.t = 0; map.walking = 0; PROG.mapNode = map.node; }
const HUT = ART.bakeHut(), FLAG = ART.bakeFlag();
const map = { node: 0, seg: 0, t: 0, walking: 0, target: 0 }; // token position: on PATH segment seg at fraction t
const nodeLocked = nd => nd.kind === 'level' ? levelLocked(LEVELS[nd.level]) : nd.kind === 'store' ? !godMode() && !!(nd.needs && !(PROG[nd.needs] && PROG[nd.needs].cleared) && !q.get('unlock')) : false;
function mapPos() { const a = PATH[map.seg], b = PATH[Math.min(PATH.length - 1, map.seg + 1)]; return [a[0] + (b[0] - a[0]) * map.t, a[1] + (b[1] - a[1]) * map.t]; }
function mapGo(dir) {
  if (map.walking) return;
  const nx = map.node + dir; if (nx < 0 || nx >= NODES.length) { SFX.buzz(); return; }
  if (nodeLocked(NODES[nx]) && NODES[nx].kind === 'level') { SFX.buzz(); number(NODES[nx].x, NODES[nx].y - 14, 'LOCKED', '#9aa39a'); return; }
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
  // up and down set the difficulty of the wood you are standing at
  if ((upPress || downPress) && !map.walking) { const nd = NODES[map.node]; if (nd.kind !== 'store' && !nodeLocked(nd)) { const id = LEVELS[nd.level].id; PROG.diff = PROG.diff || {}; PROG.diff[id] = DIFFS[(DIFFS.indexOf(diffOf(id)) + (upPress ? 1 : -1) + 3) % 3]; SFX.ui(); saveProgress(); } }
  if (confirmPress && !map.walking) { const nd = NODES[map.node]; if (nd.kind === 'store') { selI = LEVELS.findIndex(l => l.id === (nd.shop || 'shop')); selectStart(); } else { selI = nd.level; selectStart(); } }
  if (atkPress && !map.walking) { state = 'bestiary'; bestI = 0; SFX.uiSel(); }
  if (dodgePress && !map.walking) openEquip('map');
  if (pausePress) { state = 'title'; SFX.ui(); }
  PROG.mapNode = map.node;
  { const [, py] = mapPos(); const want = Math.max(0, Math.min(MAPH - VH, py - VH * 0.55)); mapCamY += (want - mapCamY) * Math.min(1, dt * 4); }
}
function drawMap() {
  g.save(); g.translate(0, -Math.round(mapCamY));
  g.drawImage(MAPC, 0, 0);
  if (PROG.storeHint) { const n = NODES.find(n => n.kind === 'store'); if (n) { const by = n.y - 26 + Math.round(Math.sin(time * 4) * 2); g.fillStyle = '#ffd36b'; g.fillRect(n.x - 1, by, 3, 6); g.fillRect(n.x - 1, by + 8, 3, 2); text('NEW', n.x + 1, by - 10, '#ffd36b', 'center'); } }
  // river sparkle (the river is on the wood sheet)
  g.fillStyle = 'rgba(230,245,255,0.8)'; for (let i = 0; i < 8; i++) { const t = (time * 0.4 + i * 0.13) % 1; const pts = [[VW - 34, CRAG_H], [VW - 58, 40 + CRAG_H], [VW - 26, 82 + CRAG_H], [VW - 70, 122 + CRAG_H], [VW - 44, VH + CRAG_H]]; const k = Math.min(3, Math.floor(t * 4)); const a = pts[k], b = pts[k + 1]; const u = t * 4 - k; if (Math.sin(time * 3 + i) > 0.4) g.fillRect(Math.round(a[0] + (b[0] - a[0]) * u) - 1 + (i & 1), Math.round(a[1] + (b[1] - a[1]) * u), 2, 1); }
  // cloud shadows drift over the land, then the clouds themselves later
  for (const c of mapClouds) { c.x += c.sp * 0.016; if (c.x > VW + 60) c.x = -60; g.globalAlpha = 0.18; g.fillStyle = '#0a1a0a'; g.beginPath(); g.ellipse(c.x + 6, c.y + 10, CLOUD[c.k].width * 0.5, CLOUD[c.k].height * 0.45, 0, 0, 7); g.fill(); g.globalAlpha = 1; }
  // boss portraits: the queen hangs over the wood, the frog sits by the pond
  { const nd = id => NODES.find(n => n.id === id); const cl = id => PROG[id] && PROG[id].cleared ? 0.45 : 1; const qb = Math.round(Math.sin(time * 2.5) * 2);
    const nw = nd('wood'), nm = nd('marsh'), ns = nd('stockade'), np = nd('spore'), nk = nd('kings'), nh = nd('hanging');
    if (nw) drawSet(SPR.queen, null, Math.floor(time * 20) % 2, nw.x + 30, nw.y - 16 + qb, -1, false, 0.75, 0.75, cl('wood'));
    if (nh) drawSet(SPR.owl, null, 0, nh.x + 30, nh.y - 10 + qb, -1, false, 0.55, 0.55, cl('hanging'));
    { const nc = nd('crown'); if (nc) { g.globalAlpha = 0.85; g.drawImage(PROP.castle, Math.round(nc.x - 30), Math.round(nc.y - 58), 60, Math.round(60 * PROP.castle.height / PROP.castle.width)); g.globalAlpha = 1; drawSet(SPR.gqueen, null, 3, nc.x + 30, nc.y + 6, -1, false, 0.45, 0.45, cl('crown')); } }
    { const nr = nd('scree'); if (nr) drawSet(SPR.ram, null, 0, nr.x + 28, nr.y + 8, -1, false, 0.5, 0.5, cl('scree')); }
    if (nm) drawSet(SPR.frog, null, Math.floor(time * 1.5) % 2, nm.x - 26, nm.y + 4, 1, false, 0.42, 0.42, cl('marsh'));
    if (ns) drawSet(SPR.chief, null, Math.floor(time * 4) % 2, ns.x - 22, ns.y + 6, 1, false, 0.7, 0.7, cl('stockade'));
    if (np) drawSet(SPR.mother, null, 0, np.x + 26, np.y + 8, 1, false, 0.5, 0.5, cl('spore'));
    if (nk) drawSet(SPR.king, null, 0, nk.x - 24, nk.y + 6, 1, false, 0.7, 0.7, cl('kings'));
    const st = nd('store'); if (st && Math.random() < 0.5) parts.push({ x: st.x + 3 + camX, y: st.y - 22 + camY, vx: 4 + Math.random() * 4, vy: -12, life: 1.6, max: 1.6, col: 'rgba(230,230,230,0.7)', size: 2, grav: -6 }); }
  for (const nd of NODES) {
    g.drawImage(MAPSIGN, nd.x + 8, nd.y - 12);
    const lk = nodeLocked(nd); const p = nd.kind === 'level' ? PROG[LEVELS[nd.level].id] : null;
    if (nd.kind === 'store') g.drawImage(HUT, nd.x - 10, nd.y - 20);
    else if (lk) g.drawImage(PROP.lock, nd.x - 3, nd.y - 16);
    else if (p && p.cleared) g.drawImage(FLAG, nd.x - 3, nd.y - 18);
    if (NODES[map.node] === nd && !map.walking) { g.globalAlpha = 0.25; g.fillStyle = '#8fd160'; g.beginPath(); g.arc(nd.x, nd.y, 11 + Math.sin(time * 6) * 1.5, 0, 7); g.fill(); g.globalAlpha = 1; g.strokeStyle = '#8fd160'; g.lineWidth = 1; g.beginPath(); g.arc(nd.x, nd.y, 9 + Math.sin(time * 6), 0, 7); g.stroke(); }
  }
  const [px, py] = mapPos();
  g.drawImage(PROP.shadow, Math.round(px) - 6, Math.round(py) - 1);
  for (const b of mapBirds) { b.t += 0.016; const bx = b.cx + Math.cos(b.t * 0.6) * b.r, by = b.cy + Math.sin(b.t * 0.6) * b.r * 0.4; drawSet(BIRD, null, Math.floor(b.t * 10) % 2, bx, by, Math.sin(b.t * 0.6) < 0 ? 1 : -1, false); }
  for (const c of mapClouds) { g.globalAlpha = 0.7; g.drawImage(CLOUD[c.k], Math.round(c.x), Math.round(c.y)); g.globalAlpha = 1; }
  if (map.walking) map.lastDir = map.walking < 0 ? -1 : 1;
  { // the road not yet walked: dotted, past the last node you can enter
    let last = 0; for (let k = 0; k < NODES.length; k++) if (!nodeLocked(NODES[k])) last = k; const from = NODE_AT[last]; g.fillStyle = 'rgba(20,16,30,0.55)'; for (let sgi = from; sgi < PATH.length - 1; sgi++) { const a = PATH[sgi], b = PATH[sgi + 1]; const len = Math.hypot(b[0] - a[0], b[1] - a[1]); for (let d = 0; d < len; d += 6) { const t = d / len; g.fillRect(Math.round(a[0] + (b[0] - a[0]) * t) - 1, Math.round(a[1] + (b[1] - a[1]) * t) - 1, 3, 3); } } }
  drawSet(K, map.walking ? 'run' : 'idle', Math.floor(time * (map.walking ? 12 : 3)) % (map.walking ? 6 : 4), px, py + 2, map.lastDir || 1, false);
  // node labels
  // node plates. The name is on a board you can read over the trees, and what you have taken out of that
  // wood is written under it, so the map answers "what have I left there?" without walking to it.
  const placed = [], hit = (x, y, w, h) => placed.some(r => x < r.x + r.w + 2 && x + w + 2 > r.x && y < r.y + r.h + 2 && y + h + 2 > r.y);
  for (const n2 of NODES) placed.push({ x: n2.x - 8, y: n2.y - 20, w: 16, h: 26 }); // the nodes and their flags are not to be covered either
  for (const nd of NODES) {
    const lk = nodeLocked(nd), here = NODES[map.node] === nd;
    const lbl = nd.kind === 'store' ? (nd.id === 'highstore' ? 'HIGH STORE' : 'STORE') : LEVELS[nd.level].name;
    const p = nd.kind === 'level' ? PROG[LEVELS[nd.level].id] : null;
    const twoLine = !!p && !lk;
    const tw = Math.max(lbl.length * 6 + 10, twoLine ? 44 : 0), th = twoLine ? 17 : 10;
    let lx = Math.max(tw / 2 + 6, Math.min(VW - tw / 2 - 6, nd.x)), ly = nd.y + 12;
    { const own = placed.findIndex(r => r.x === nd.x - 8 && r.y === nd.y - 20); const mine = own >= 0 ? placed.splice(own, 1)[0] : null;
      const tries = [[0, 12], [-tw / 2 - 4, 12], [tw / 2 + 4, 12], [0, -22 - th], [0, 22], [-tw / 2 - 4, -10], [tw / 2 + 4, -10]];
      for (const [dx, dy] of tries) { const x = Math.max(tw / 2 + 6, Math.min(VW - tw / 2 - 6, nd.x + dx)), y = nd.y + dy; if (!hit(x - tw / 2, y, tw, th)) { lx = x; ly = y; break; } }
      if (mine) placed.push(mine); placed.push({ x: lx - tw / 2, y: ly, w: tw, h: th }); }
    g.fillStyle = lk ? 'rgba(18,14,24,0.78)' : 'rgba(28,22,18,0.86)'; g.fillRect(lx - tw / 2, ly, tw, th);
    g.strokeStyle = here ? UI.sel : lk ? 'rgba(140,130,120,0.35)' : 'rgba(201,178,124,0.55)'; g.lineWidth = 1;
    g.strokeRect(lx - tw / 2 + 0.5, ly + 0.5, tw - 1, th - 1);
    text(lbl, lx, ly + 2, lk ? '#7a7a8a' : here ? UI.title : UI.text, 'center', 6);
    if (twoLine) { // one strip: medal, silver taken, quest, relic
      let bx = lx - tw / 2 + 4; const by = ly + 11;
      if (p.medal) { g.fillStyle = MEDAL_COL[p.medal]; g.beginPath(); g.arc(bx + 2, by + 2, 2.5, 0, 7); g.fill(); } else { g.strokeStyle = 'rgba(255,255,255,0.2)'; g.beginPath(); g.arc(bx + 2, by + 2, 2.5, 0, 7); g.stroke(); }
      bx += 8;
      const sv = [1, 2, 4].filter(b => ((p.silver || 0) & b)).length;
      for (let i = 0; i < 3; i++) { g.fillStyle = i < sv ? UI.silver : 'rgba(255,255,255,0.16)'; g.fillRect(bx + i * 4, by + 1, 3, 3); }
      bx += 14;
      g.fillStyle = p.quest ? '#8fd160' : 'rgba(255,255,255,0.16)'; g.fillRect(bx, by + 1, 3, 3); bx += 6;
      g.fillStyle = p.relic ? '#c9a0ff' : 'rgba(255,255,255,0.16)'; g.fillRect(bx, by + 1, 3, 3); bx += 6;
      if (p.cleared) { g.fillStyle = '#8fd160'; g.fillRect(lx + tw / 2 - 7, by, 2, 4); g.fillRect(lx + tw / 2 - 6, by + 3, 4, 2); g.fillRect(lx + tw / 2 - 4, by, 2, 4); }
    }
  }
  g.restore();
  // parchment frame + compass
  g.strokeStyle = 'rgba(60,40,20,0.7)'; g.lineWidth = 3; g.strokeRect(1.5, 1.5, VW - 3, VH - 3); g.strokeStyle = 'rgba(255,230,180,0.25)'; g.lineWidth = 1; g.strokeRect(4.5, 4.5, VW - 9, VH - 9);
  g.drawImage(PROP.compass, VW - 30, VH - 52);
  // header + node card
  { const region = mapCamY < CRAG_H - 60 ? 'THE CRAGS' : 'THE WOOD'; if (region !== map.region) { map.region = region; map.regionT = map.regionT === undefined ? 0 : 2.2; } map.regionT = Math.max(0, (map.regionT || 0) - 1 / 60); if (map.regionT > 0) { const a = Math.min(1, map.regionT > 1.8 ? (2.2 - map.regionT) / 0.4 : map.regionT / 0.6); g.globalAlpha = a; text(region, VW / 2 + 1, 41, '#3a2214', 'center', 12); text(region, VW / 2, 40, UI.title, 'center', 12); g.globalAlpha = 1; } }
  g.fillStyle = 'rgba(20,16,30,0.8)'; g.fillRect(0, 0, VW, 18); text(mapCamY < CRAG_H - 60 ? 'THE CRAGS' : 'THE WOOD', 6, 5, UI.title);
  { const real = LEVELS.filter(lv => !lv.hidden); const cl = real.filter(lv => PROG[lv.id] && PROG[lv.id].cleared).length;
    const md = real.reduce((n, lv) => n + ((PROG[lv.id] && PROG[lv.id].medal) || 0), 0), mdMax = real.length * 3;
    g.drawImage(FLAG, 92, 4); text(cl + '/' + real.length, 104, 7, UI.dim, 'left', 6);
    g.fillStyle = md >= mdMax ? MEDAL_COL[3] : '#8a8378'; g.beginPath(); g.arc(140, 9, 4, 0, 7); g.fill(); g.fillStyle = ART.OUT; g.fillRect(139, 8, 2, 2);
    text(md + '/' + mdMax, 148, 7, UI.dim, 'left', 6); } g.drawImage(PROP.coin[Math.floor(time * 8) % 4], VW - 62, 5); text(String(PROG.coins), VW - 6, 6, '#ffd34a', 'right'); { g.drawImage(PROP.silver[Math.floor(time * 6 + 2) % 4], VW - 112, 5); text(String(silverAvail()), VW - 78, 6, '#dfe8ff', 'right'); }
  const nd = NODES[map.node];
  if (!map.walking) {
    const store = nd.kind === 'store';
    const tamLine = !store && TAM_MAP[LEVELS[nd.level].id] ? ('TAM: ' + TAM_MAP[LEVELS[nd.level].id][(PROG[LEVELS[nd.level].id] || {}).cleared ? 1 : 0]) : '';
    const cw = Math.min(VW - 8, Math.max(200, tamLine.length * 6 + 18)), ch = store ? 26 : 58, cx0 = Math.max(4, Math.min(VW - cw - 4, nd.x - cw / 2)), low = nd.y - mapCamY > VH * 0.55, cy0 = low ? 22 : VH - 12 - ch;
    panel(cx0, cy0, cw, ch, UI.sel);
    text(nd.name, cx0 + 8, cy0 + 5, UI.title);
    if (store) text(nodeLocked(nd) ? 'SHUT UNTIL THE SCREE PATH IS WALKED' : 'Z  enter', cx0 + 8, cy0 + 16, UI.dim, 'left', 6);
    else {
      const lv = LEVELS[nd.level], id = lv.id, p = PROG[id] || {};
      const hasRun = p.best !== undefined && p.best !== null && !Number.isNaN(p.best);
      // top right: how hard this wood is meant to be
      const pips = 1 + Math.round(tierOf(id) * 4);
      for (let i = 0; i < 5; i++) { g.fillStyle = i < pips ? '#c9463d' : 'rgba(255,255,255,0.15)'; g.fillRect(cx0 + cw - 8 - (5 - i) * 6, cy0 + 6, 4, 4); }
      text(lv.sub || '', cx0 + 8, cy0 + 16, UI.dim, 'left', 6);
      { const D = DIFF[diffOf(id)], rx = cx0 + cw - 8; text(D.label, rx, cy0 + 16, D.col, 'right', 6); const ax = rx - D.label.length * 6 - 8; g.fillStyle = D.col; g.fillRect(ax + 1, cy0 + 16, 1, 1); g.fillRect(ax, cy0 + 17, 3, 1); g.fillRect(ax, cy0 + 20, 3, 1); g.fillRect(ax + 1, cy0 + 21, 1, 1); } // this wood's difficulty, and the up/down that changes it
      // line one: your best, and what it was worth
      const M = MEDALS[id] || [300, 450, 660];
      text(hasRun ? 'BEST ' + fmt(p.best) : 'NOT WALKED', cx0 + 8, cy0 + 26, hasRun ? UI.text : UI.dim, 'left', 6);
      if (p.medal) { g.fillStyle = MEDAL_COL[p.medal]; g.beginPath(); g.arc(cx0 + 94, cy0 + 28, 4, 0, 7); g.fill(); g.fillStyle = ART.OUT; g.fillRect(cx0 + 93, cy0 + 27, 2, 2); text(MEDAL_NAME[p.medal], cx0 + 102, cy0 + 26, MEDAL_COL[p.medal], 'left', 6); }
      else text('GOLD AT ' + fmt(M[0]), cx0 + 92, cy0 + 26, UI.dim, 'left', 6);
      text(p.cleared ? 'CLEARED' : '', cx0 + cw - 8, cy0 + 26, UI.sel, 'right', 6);
      // line two: what is still in there
      const sv = [1, 2, 4].filter(b => ((p.silver || 0) & b)).length;
      let bx = cx0 + 8; const by = cy0 + 36;
      g.drawImage(PROP.silver[0], bx, by - 1); text(sv + '/3', bx + 12, by, sv >= 3 ? UI.silver : UI.dim, 'left', 6); bx += 30;
      g.drawImage(PROP.coin[0], bx, by - 1); text((p.gold || 0) + '/' + (p.total || '?'), bx + 12, by, p.allGold ? UI.gold : UI.dim, 'left', 6); bx += 40;
      g.drawImage(PROP.questIcon, bx, by - 1); text(p.quest ? 'DONE' : 'OPEN', bx + 12, by, p.quest ? UI.sel : UI.dim, 'left', 6); bx += 40;
      if (PROP.relic[p.relic] || p.relic) { g.drawImage(PROP.relic[p.relic] || PROP.lampIcon, bx, by - 2); bx += 12; }
      if (p.noHit) { g.drawImage(PROP.heart, bx, by - 1); bx += 12; }
      if (p.iron) { g.fillStyle = '#c9d1dc'; g.fillRect(bx + 1, by - 1, 7, 8); g.fillStyle = '#7c8797'; g.fillRect(bx + 1, by + 5, 7, 2); g.fillStyle = ART.OUT; g.fillRect(bx + 4, by, 1, 6); g.fillRect(bx + 2, by + 2, 5, 1); bx += 12; }
      const tm = TAM_MAP[id]; if (tm && !nodeLocked(nd)) text('TAM: ' + tm[p.cleared ? 1 : 0], cx0 + 8, cy0 + 47, '#c9d1dc', 'left', 6);
    }
  }
  text('ARROWS MOVE  UP/DOWN DIFFICULTY  Z ENTER  X BEASTS  V EQUIP', VW / 2, VH - 8, '#9aa39a', 'center', 6);
}

// ---------- store ----------
let storeI = 0, storeMsg = '', storeMsgT = 0, storeTab = 0;
function learnTalent(k) { treeFrom = state; treeI = 0; state = 'tree'; SFX.menuOpen(); }
// ---------- the tree screen ----------
let treeFrom = 'store', treeI = 0, treeMsg = '', treeMsgT = 0;
const treeNodes = () => TREE.filter(n => n.hero === hero());
function updateTree(dt) {
  treeMsgT = Math.max(0, treeMsgT - dt);
  const ns = treeNodes(), cur = ns[treeI] || null, respec = treeI >= ns.length;
  const gx = n => n.branch * 2 + n.col; // six columns across the three trees
  const go = (dxc, dr) => { if (respec) { if (dr < 0) treeI = ns.findIndex(n => n.row === 3) >= 0 ? ns.findIndex(n => n.row === 3) : 0; return; }
    let best = null, bs = 1e9; for (let i = 0; i < ns.length; i++) { const n = ns[i]; if (n === cur) continue; const cx = gx(n) - gx(cur), ry = n.row - cur.row;
      if (dxc && Math.sign(cx) !== dxc) continue; if (dr && Math.sign(ry) !== dr) continue; const s = dxc ? Math.abs(cx) * 4 + Math.abs(ry) * 3 : Math.abs(ry) * 4 + Math.abs(cx) * 2; if (s < bs) { bs = s; best = i; } }
    if (best !== null) treeI = best; else if (dr > 0) treeI = ns.length; };
  if (leftPress) { go(-1, 0); SFX.ui(); } if (rightPress) { go(1, 0); SFX.ui(); } if (upPress) { go(0, -1); SFX.ui(); } if (downPress) { go(0, 1); SFX.ui(); }
  const say = (m, snd) => { treeMsg = m; treeMsgT = 2.2; (snd || SFX.ui)(); };
  if (confirmPress) {
    if (respec) { if (!ptsSpent(hero())) say('nothing to forget'); else { PROG.talents[hero()] = {}; if (PROG.skill && TREE.some(n => n.id === PROG.skill && n.hero === hero())) PROG.skill = 'none'; applyUpgrades(); saveProgress(); say('forgotten: ' + ptsLeft(hero()) + ' points to spend', SFX.menuClose); } }
    else if (cur) { const st = nodeState(cur), m = talentsOf(hero());
      if (st === 'max') say(cur.name + ' is at its peak');
      else if (st === 'level') say('opens at hero level ' + ROW_LV[cur.row], SFX.buzz);
      else if (st === 'parent') say('learn ' + TREE.find(n => n.id === cur.parent && n.hero === cur.hero).name + ' first', SFX.buzz);
      else if (ptsLeft(hero()) < 1) say('no points left: clear another wood', SFX.buzz);
      else { m[cur.id] = (m[cur.id] || 0) + 1; if (cur.active && (!PROG.skill || PROG.skill === 'none' || !TREE.some(n => n.id === PROG.skill && n.hero === hero() && tal(n.id)))) PROG.skill = cur.id; applyUpgrades(); saveProgress(); statFlash = 0.8; say(cur.name + ' ' + m[cur.id] + ' of ' + cur.max, SFX.rankUp); burst(camX + VW / 2, camY + 30, 12, ['#fff6c8', '#ffd36b'], 50, 0.5, -20, 1); } } }
  if (throwPress && cur && cur.active) { if (tal(cur.id)) { PROG.skill = cur.id; saveProgress(); say(cur.name + ' is on F', SFX.equip); } else say('learn it first', SFX.buzz); }
  if (pausePress) { state = treeFrom; SFX.menuClose(); }
}
const TREE_ICON = {};
function treeIcon(n) { if (n.active) return skillIcon(n.id); return TREE_ICON[n.hero + n.branch] || (TREE_ICON[n.hero + n.branch] = pixIcon(BRANCH_PIX[n.hero][n.branch])); }
const BRANCH_PIX = {
  knight: [['.......ss.', '......sws.', '.....sws..', '....sws...', '...sws....', '..sws.....', 'bbss......', '.bb.......', 'b.b.......', '..........'],
    ['.ssssss...', 'sssrrsss..', 'ssrrrrss..', 'ssrrrrss..', '.ssrrss...', '.sssss....', '..sss.....', '...s......', '..........', '..........'],
    ['..........', '..bbb.....', '..bbb.....', '..bbb.....', '..bbbb....', '..bbbbbb..', '.bbbbbbbb.', '.ssssssss.', '..........', '..........']],
  pyro: [['..........', '....o.....', '...oyo....', '..oywyo...', '..oyyyo...', '...ooo....', '..........', '..........', '..........', '..........'],
    ['..........', '..........', 'yoooo.....', 'wyyyooo...', 'yoooo.o...', '..........', '..........', '..........', '..........', '..........'],
    ['.....ro...', '....roo...', '...rooy...', '..rooyy...', '..roy.....', '.ro.......', '.r........', 'r.........', '..........', '..........']],
  paladin: [['....y.....', '.y..y..y..', '..yyyyy...', 'yyywwyyyy.', '..yyyyy...', '.y..y..y..', '....y.....', '..........', '..........', '..........'],
    ['...yyyy...', '..y....y..', '.y......y.', '.y......y.', '.y..ww..y.', '.y......y.', 'ssssssssss', '..........', '..........', '..........'],
    ['.sssss....', '.swwws....', '.sssss....', '...b......', '...b......', '...b......', '...b......', '..........', '..........', '..........']] };
function drawTree() {
  g.drawImage(MAPC, 0, 0); g.fillStyle = 'rgba(10,10,18,0.86)'; g.fillRect(0, 0, VW, VH);
  const h = hero(), ns = treeNodes(), respec = treeI >= ns.length, cur = ns[treeI] || null;
  panel(4, 3, VW - 8, VH - 6);
  text('TALENTS  ' + (HEROES.find(k => k.id === h) || {}).name, 10, 8, UI.title, 'left', 6);
  text('LEVEL ' + heroLevel() + '   POINTS ' + (godMode() ? 'ANY' : ptsLeft(h)), VW - 10, 8, ptsLeft(h) > 0 ? UI.gold : UI.dim, 'right', 6);
  const pw = Math.floor((VW - 20) / 3), top = 26, rowH = Math.floor((VH - 26 - 50) / 4), NS = 16;
  const pos = n => [8 + n.branch * (pw + 2) + Math.round(pw * (n.col ? 0.72 : 0.3)), top + 4 + n.row * rowH];
  for (let b = 0; b < 3; b++) { const px0 = 8 + b * (pw + 2); g.fillStyle = 'rgba(40,36,54,0.6)'; g.fillRect(px0, top - 8, pw, rowH * 4 + 6); const sp = TREE.filter(n => n.hero === h && n.branch === b).reduce((s, n) => s + (tal(n.id) || 0), 0); text(TBR[h][b] + (sp ? '  ' + sp : ''), px0 + pw / 2, top - 7, sp ? UI.sel : UI.dim, 'center', 6); }
  // the level each row opens at, down the left edge of the first tree
  for (let r = 0; r < 4; r++) if (heroLevel() < ROW_LV[r] && !godMode()) { g.fillStyle = 'rgba(10,8,18,0.45)'; g.fillRect(8, top + 2 + r * rowH, VW - 16, rowH - 2); text('LEVEL ' + ROW_LV[r], VW - 12, top + 4 + r * rowH, '#7a7a84', 'right', 6); }
  // the lines: from each skill down to what grows from it
  for (const n of ns) if (n.parent) { const p = ns.find(q => q.id === n.parent); if (!p) continue; const [x0, y0] = pos(p), [x1, y1] = pos(n); g.strokeStyle = tal(p.id) ? '#c9a040' : '#4a4658'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0 + 0.5, y0 + NS); if (x0 !== x1) { g.lineTo(x0 + 0.5, y1 + NS / 2); g.lineTo(x1 - NS / 2, y1 + NS / 2); } else g.lineTo(x1 + 0.5, y1); g.stroke(); }
  for (let i = 0; i < ns.length; i++) { const n = ns[i], [x, y] = pos(n), st = nodeState(n), r = tal(n.id), sel = i === treeI, lit = r > 0;
    g.fillStyle = lit ? '#2a2438' : '#16141e'; g.fillRect(x - NS / 2, y, NS, NS);
    g.strokeStyle = sel ? '#fff6e0' : st === 'max' ? '#ffd36b' : lit ? '#c9a040' : (st === 'open' && ptsLeft(h) > 0) ? '#8fd160' : '#4a4658'; g.lineWidth = n.active ? 2 : 1; g.strokeRect(x - NS / 2 + 0.5, y + 0.5, NS - 1, NS - 1);
    const ic = treeIcon(n); g.globalAlpha = lit ? 1 : st === 'level' || st === 'parent' ? 0.3 : 0.65; g.drawImage(ic, x - 5, y + 3, 10, 10); g.globalAlpha = 1;
    text(r + '/' + n.max, x + NS / 2 + 2, y + NS - 6, st === 'max' ? UI.gold : lit ? UI.sel : '#7a7a84', 'left', 6);
    if (n.active && PROG.skill === n.id && lit) text('F', x - NS / 2 - 1, y - 1, UI.gold, 'right', 6);
    if (sel) { g.globalAlpha = 0.25 + 0.2 * Math.sin(time * 6); g.fillStyle = '#fff6e0'; g.fillRect(x - NS / 2, y, NS, NS); g.globalAlpha = 1; } }
  // FORGET ALL, under the trees
  const fy = top + rowH * 4 + 2; g.fillStyle = respec ? 'rgba(90,60,60,0.8)' : 'rgba(40,36,54,0.7)'; g.fillRect(VW / 2 - 34, fy, 68, 10); text('FORGET ALL', VW / 2, fy + 2, respec ? UI.title : UI.dim, 'center', 6);
  // what the chosen one does
  const dy = fy + 13; g.fillStyle = 'rgba(20,16,30,0.8)'; g.fillRect(8, dy, VW - 16, VH - dy - 6);
  if (treeMsgT > 0) text(treeMsg, VW / 2, dy + 3, UI.gold, 'center', 6);
  else if (respec) text('forget every skill this hero has learned and have all the points back. it costs nothing.', VW / 2, dy + 3, UI.dim, 'center', 6);
  else if (cur) { const st = nodeState(cur);
    text(cur.name + (cur.active ? '  (F SKILL)' : '') + '   ' + tal(cur.id) + ' / ' + cur.max, 12, dy + 3, UI.title, 'left', 6);
    const need = st === 'level' ? 'opens at level ' + ROW_LV[cur.row] : st === 'parent' ? 'needs ' + TREE.find(q => q.id === cur.parent && q.hero === cur.hero).name : st === 'max' ? 'at its peak' : 'Z learn' + (cur.active && tal(cur.id) ? '   F put on F' : '');
    text(need, VW - 12, dy + 3, st === 'level' || st === 'parent' ? '#ff9a5c' : UI.sel, 'right', 6);
    const lines = wrap(cur.desc + (cur.active && cur.max > 1 ? '. every point past the first: a shorter wait and a harder blow' : ''), VW - 28, 6); lines.slice(0, 3).forEach((ln, k) => text(ln, 12, dy + 12 + k * 7, UI.dim, 'left', 6)); }
}
function updateStore(dt) {
  if (PROG.refundNote) { storeMsg = PROG.refundNote + ' gold back: training and skills are learned in the talent trees now'; storeMsgT = 4; PROG.refundNote = 0; saveProgress(); }
  storeMsgT = Math.max(0, storeMsgT - dt);
  const tabs = storeTabs(), tab = tabs[storeTab], items = storeItems(tab);
  if (leftPress) { storeTab = (storeTab + tabs.length - 1) % tabs.length; storeI = 0; SFX.ui(); }
  if (rightPress) { storeTab = (storeTab + 1) % tabs.length; storeI = 0; SFX.ui(); }
  if (items.length && upPress) { storeI = (storeI + items.length - 1) % items.length; SFX.ui(); }
  if (items.length && downPress) { storeI = (storeI + 1) % items.length; SFX.ui(); }
  if (confirmPress && items.length) {
    const k = items[storeI], owned = tab.talent || k.consumable ? false : (k.id === 'none' || owns(tab, k.id));
    if (tab.talent) learnTalent(k);
    else if (k.consumable) { const n = PROG.tonics || 0; if (n >= k.max) { SFX.ui(); storeMsg = 'you carry all you can'; storeMsgT = 1.5; } else if (godMode() || PROG.coins >= k.price) { if (!godMode()) PROG.coins -= k.price; PROG.tonics = n + 1; saveProgress(); SFX.coin(); storeMsg = k.name + ' ' + (n + 1) + ' of ' + k.max; storeMsgT = 2; } else { SFX.buzz(); storeMsg = 'need ' + (k.price - PROG.coins) + ' more gold'; storeMsgT = 2; } }
    else if (tab.rank) { const r = rankOf(k.id); if (r >= k.max) { SFX.ui(); storeMsg = k.name + ' is at its peak'; storeMsgT = 1.5; } else if (godMode() || PROG.coins >= k.prices[r]) { if (!godMode()) PROG.coins -= k.prices[r]; PROG.ranks[k.id] = r + 1; applyUpgrades(); if (k.id === 'vigour') P.hp = Math.min(P.maxHp, P.hp + 10); if (k.id === 'breath') P.st = Math.min(P.maxSt, P.st + 10); saveProgress(); SFX.coin(); SFX.rankUp(); statFlash = 0.8; storeMsg = k.name + ' rank ' + (r + 1); storeMsgT = 2; burst(VW / 2 + camX, 60 + camY, 16, ['#8fd160', '#fff6c8'], 60, 0.6, -20, 1); } else { SFX.buzz(); storeMsg = 'need ' + (k.prices[r] - PROG.coins) + ' more gold'; storeMsgT = 2; } }
    else if (owned && tab.key) { PROG[tab.key] = k.id; if (tab.key === 'menu') music.play(menuTrack()); if (tab.key === 'hero') { applySkin(); applyUpgrades(); P.hp = Math.min(P.hp, P.maxHp); } applySkin(); saveProgress(); SFX.equip(); storeMsg = k.passive ? k.name + ' is always on' : k.name + ' equipped' + (tab.key === 'skill' ? ' on F' : tab.key === 'charm' ? ' (worn)' : ''); storeMsgT = 2; }
    else if (owned) { SFX.ui(); storeMsg = 'already yours'; storeMsgT = 1.5; }
    else if (k.needs && !(PROG[k.needs] && PROG[k.needs].cleared)) { SFX.buzz(); storeMsg = 'clear ' + k.needsName + ' first'; storeMsgT = 2; }
    else if (k.feat && !featDone(k.feat)) { SFX.buzz(); storeMsg = k.featName + ' to earn it'; storeMsgT = 2; }
    else if (k.silver) { if (silverAvail() >= k.price) { PROG.silverSpent = (PROG.silverSpent || 0) + k.price; PROG[tab.owned][k.id] = true; PROG[tab.key] = k.id; applySkin(); applyUpgrades(); P.hp = Math.min(P.hp, P.maxHp); saveProgress(); SFX.coin(); SFX.sting(); SFX.medal(); storeMsg = 'bought ' + k.name; storeMsgT = 2; } else { SFX.buzz(); storeMsg = 'need ' + (k.price - silverAvail()) + ' more silver'; storeMsgT = 2; } }
    else if (PROG.coins >= k.price) { PROG.coins -= k.price; PROG[tab.owned][k.id] = true; if (tab.key) PROG[tab.key] = k.id; if (tab.key === 'menu') music.play(menuTrack()); if (tab.key === 'hero') { applySkin(); applyUpgrades(); P.hp = Math.min(P.hp, P.maxHp); } applySkin(); applyUpgrades(); saveProgress(); SFX.coin(); SFX.sting(); storeMsg = 'bought ' + k.name; storeMsgT = 2; if (PROG.storeHint === k.id) PROG.storeHint = null; burst(VW / 2 + camX, 60 + camY, 16, ['#ffd36b', '#fff6c8'], 60, 0.6, -20, 1); }
    else { SFX.buzz(); storeMsg = 'need ' + (k.price - PROG.coins) + ' more gold'; storeMsgT = 2; }
  }
  if (pausePress) { if (storeMode === 'equip') { storeMode = 'buy'; state = equipFrom === 'map' ? 'map' : 'menu'; SFX.ui(); } else if (L && L.shop && state === 'store') { state = 'play'; SFX.ui(); } else { state = 'map'; SFX.ui(); } }
}
const previewCache = {};
// a skin, shown on the hero you are playing: the pyromancer in its robes, the paladin in its plate and tabard
const skinPreview = k => preview('skin:' + hero() + ':' + k.id + ':' + PROG.sword, () => isPyro() ? bakePyro(Object.assign({}, PYRO_SETS[k.id] || k.pal, swordById(PROG.sword).pal)) : isPaladin() ? bakePaladin(PAL_SETS[k.id] || {}) : bakeKnight(Object.assign({}, k.pal, swordById(PROG.sword).pal)));
const preview = (key, make) => previewCache[key] || (previewCache[key] = make());
function drawStore() {
  if (storeMode === 'equip' && equipFrom !== 'map') { g.fillStyle = '#0a0810'; g.fillRect(0, 0, VW, VH); } else { g.drawImage(MAPC, 0, 0); g.fillStyle = 'rgba(10,14,12,0.75)'; g.fillRect(0, 0, VW, VH); }
  const x = 12, y = 6, w = VW - 24, h = VH - 12; const tabs = storeTabs();
  panel(x, y, w, h);
  text(storeMode === 'equip' ? 'EQUIP' : 'THE STORE', x + 8, y + 6, UI.title);
  g.drawImage(PROP.coin[Math.floor(time * 8) % 4], x + w - 60, y + 5); text(String(PROG.coins), x + w - 8, y + 6, UI.gold, 'right');
  g.drawImage(PROP.silver[Math.floor(time * 6 + 2) % 4], x + w - 108, y + 5); text(String(silverAvail()), x + w - 72, y + 6, UI.silver, 'right');
  // two rows of tabs, four across
  const perRow = 4, tw = Math.floor((w - 16) / perRow);
  tabs.forEach((t, k) => { const row = Math.floor(k / perRow), col = k % perRow, tx = x + 8 + col * tw, ty = y + 17 + row * 12, sel = k === storeTab; g.fillStyle = sel ? 'rgba(60,90,60,0.8)' : 'rgba(40,36,50,0.7)'; g.fillRect(tx, ty, tw - 3, 11); if (sel) { g.strokeStyle = UI.sel; g.lineWidth = 1; g.strokeRect(tx + 0.5, ty + 0.5, tw - 4, 10); } text(t.name, tx + (tw - 3) / 2, ty + 3, sel ? UI.sel : UI.dim, 'center', 6); });
  const tab = tabs[storeTab], items = storeItems(tab);
  // The list carries names and prices only; everything you have to read lives in the panel on the right,
  // where it has the room to be read. The old rows clipped every description at two short lines.
  const listX = x + 8, listW = w - 16 - 112, pvX = x + w - 108, pvY = y + 42, pvW = 100, pvH = h - 60;
  const ROWS = 8, ROWH = 13, off = Math.max(0, Math.min(Math.max(0, items.length - ROWS), storeI - ROWS + 2));
  if (off > 0) text('^', listX + listW - 6, y + 42, UI.dim, 'center');
  if (off + ROWS < items.length) text('v', listX + listW - 6, y + h - 20, UI.dim, 'center');
  if (!items.length) text('nothing here yet.', listX + listW / 2, y + 70, UI.dim, 'center');
  const iconOf = k => k.id === 'none' ? null
    : tab.key === 'skin' ? skinPreview(k).R.idle[0]
    : tab.key === 'sword' ? preview('sword:' + k.id + ':' + PROG.skin, () => bakeKnight(Object.assign({}, skinById(PROG.skin).pal, k.pal))).R.atk[1]
    : tab.talent ? treeIcon(treeNodes()[0]) : k.id === 'tonic' ? TONIC_ICON : (k.id === 'heart' || k.id === 'vigour') ? PROP.heart : k.id === 'shieldThrow' ? SHIELD_ICON : k.id === 'groundSlam' ? SLAM_ICON : k.id === 'risingCut' ? RISE_ICON
    : PYRO_ICONS[k.id] ? PYRO_ICONS[k.id]
    : PROP.charm[k.id] ? PROP.charm[k.id] : PROP.bolt;
  const lockedOf = k => (k.needs && !(PROG[k.needs] && PROG[k.needs].cleared)) || (k.feat && !featDone(k.feat));
  items.forEach((k, i) => {
    if (i < off || i >= off + ROWS) return;
    const yy = y + 44 + (i - off) * ROWH, sel = i === storeI;
    const owned = tab.talent ? false : k.consumable ? (PROG.tonics || 0) >= k.max : tab.rank ? rankOf(k.id) >= k.max : (k.id === 'none' || owns(tab, k.id));
    const eq = tab.key && (PROG[tab.key] === k.id || (k.id === 'none' && (!PROG[tab.key] || PROG[tab.key] === 'none') && !(tab.key === 'skill' && skillNow())));
    if (sel) { g.fillStyle = 'rgba(60,90,60,0.45)'; g.fillRect(listX, yy - 2, listW, ROWH - 1); g.fillStyle = UI.sel; g.fillRect(listX, yy - 2, 2, ROWH - 1); }
    const icon = iconOf(k);
    if (icon) { if (tab.key === 'skin' || tab.key === 'sword') g.drawImage(icon, 0, 0, icon.width, icon.height, listX + 4, yy - 3, 12, 12); else g.drawImage(icon, 0, 0, icon.width, icon.height, listX + 5, yy - 1, 9, 9); }
    else { g.fillStyle = '#5a5f5a'; g.fillRect(listX + 8, yy + 2, 5, 5); }
    text((tab.talent && k.tier > 1 ? '  '.repeat(k.tier - 1) : '') + k.name, listX + 20, yy, sel ? UI.title : UI.text, 'left', 6);
    if (tab.talent) { text(ptsLeft(hero()) > 0 ? ptsLeft(hero()) + ' TO SPEND' : 'Z OPEN', listX + listW - 4, yy, ptsLeft(hero()) > 0 ? UI.gold : UI.sel, 'right', 6); return; }
    if (k.consumable) { text((PROG.tonics || 0) + '/' + k.max + '  ' + k.price + ' GOLD', listX + listW - 4, yy, (PROG.tonics || 0) >= k.max ? UI.sel : PROG.coins >= k.price ? UI.gold : '#ff6b6b', 'right', 6); return; }
    if (tab.rank) { const rr = rankOf(k.id);
      for (let q = 0; q < k.max; q++) { g.fillStyle = q < rr ? UI.sel : '#3a3a44'; g.fillRect(listX + listW - 46 - k.max * 5 + q * 5, yy + 1, 4, 4); }
      text(rr >= k.max ? 'PEAK' : k.prices[rr] + 'g', listX + listW - 4, yy, rr >= k.max ? UI.sel : PROG.coins >= k.prices[rr] ? UI.gold : '#ff6b6b', 'right', 6); return; }
    const locked = lockedOf(k);
    text(eq ? 'EQUIPPED' : owned ? 'OWNED' : locked ? 'LOCKED' : k.price === 0 ? 'FREE' : k.price + (k.silver ? ' SILVER' : ' GOLD'),
      listX + listW - 4, yy, eq ? UI.sel : owned ? UI.dim : locked ? '#6a6a7a' : ((k.silver ? silverAvail() : PROG.coins) >= k.price ? (k.silver ? UI.silver : UI.gold) : '#ff6b6b'), 'right', 6);
  });
  // ---- the panel: what it looks like on you, what it costs, and the whole of what it does ----
  g.fillStyle = 'rgba(20,16,30,0.6)'; g.fillRect(pvX, pvY, pvW, pvH);
  g.strokeStyle = 'rgba(255,255,255,0.12)'; g.strokeRect(pvX + 0.5, pvY + 0.5, pvW - 1, pvH - 1);
  { const k = items[storeI]; const mx = pvX + pvW / 2;
    if (k) {
      // the art sits in the top 46px, feet on that line - unless the words need the room: then the art shrinks and
      // the words move up (the WISP's line ran off the bottom of the box)
      const lk0 = lockedOf(k), body0 = lk0 ? (k.feat ? k.featName : 'clear ' + k.needsName + ' first') : (k.desc || k.per || '');
      const need = 8 * Math.min(2, wrap(k.name, pvW - 10, 6).length) + 11 + 7 * wrap(body0, pvW - 10, 6).length, room = pvH - 10 - 50;
      const squeeze = Math.max(0, Math.min(24, need - room)), artB = pvY + 46 - squeeze;
      if (tab.key === 'skin' || tab.key === 'sword' || tab.key === 'hero') {
        const set = tab.key === 'hero' ? (k.id === 'paladin' ? preview('hero:paladin:' + PROG.skin, () => bakePaladin(PAL_SETS[PROG.skin] || {})) : k.id === 'pyro' ? preview('hero:pyro', () => bakePyro(PYRO_SETS[PROG.skin] || {})) : preview('hero:knight', () => bakeKnight(Object.assign({}, skinById(PROG.skin).pal, swordById(PROG.sword).pal))))
          : tab.key === 'skin' ? skinPreview(k)
          : preview('sword:' + k.id + ':' + PROG.skin, () => bakeKnight(Object.assign({}, skinById(PROG.skin).pal, k.pal)));
        const fr = tab.key === 'sword' ? set.R.atk[Math.floor(time * 6) % 2 + 1] : set.R.idle[Math.floor(time * 3) % 4];
        const sc = squeeze ? 1.6 * (46 - squeeze) / 46 : 1.6; g.drawImage(fr, 0, 0, fr.width, fr.height, Math.round(mx - fr.width * sc / 2), Math.round(artB - fr.height * sc), Math.round(fr.width * sc), Math.round(fr.height * sc));
      } else if (tab.rank) {
        const rr = rankOf(k.id);
        text(rr + ' / ' + k.max, mx, pvY + 10, UI.title, 'center');
        for (let q = 0; q < k.max; q++) { g.fillStyle = q < rr ? UI.sel : '#3a3a44'; g.fillRect(mx - k.max * 5 + q * 10 + 1, pvY + 24, 8, 8); }
        text(k.id === 'vigour' ? 'HEALTH' : k.id === 'breath' ? 'STAMINA' : k.id === 'recovery' ? 'REGEN' : k.id === 'temper' ? 'DAMAGE' : 'COST', mx, pvY + 36, UI.dim, 'center', 6);
      } else {
        const icon = iconOf(k);
        const isc = squeeze > 8 ? 2 : 3; if (icon) g.drawImage(icon, 0, 0, icon.width, icon.height, Math.round(mx - icon.width * isc / 2), Math.round(artB - icon.height * isc), icon.width * isc, icon.height * isc);
        if (tab.key === 'menu') text('~ ~', mx, pvY + 30, UI.dim, 'center');
      }
      let ty = pvY + 50 - squeeze;
      for (const ln of wrap(k.name, pvW - 10, 6).slice(0, 2)) { text(ln, mx, ty, UI.title, 'center', 6); ty += 8; }
      // what it costs, or what you already have
      const locked = lockedOf(k);
      const owned = tab.rank ? rankOf(k.id) >= k.max : (k.id === 'none' || owns(tab, k.id));
      const eq = tab.key && PROG[tab.key] === k.id;
      const cost = tab.talent ? 'LEVEL ' + heroLevel() + '  ' + ptsLeft(hero()) + ' POINTS' : k.consumable ? (PROG.tonics || 0) + ' OF ' + k.max + ' CARRIED' : tab.rank ? (rankOf(k.id) >= k.max ? 'AT ITS PEAK' : k.prices[rankOf(k.id)] + ' GOLD')
        : eq ? 'EQUIPPED' : owned ? 'OWNED' : locked ? 'LOCKED' : k.price === 0 ? 'FREE' : k.price + (k.silver ? ' SILVER' : ' GOLD');
      text(cost, mx, ty, eq || owned ? UI.sel : locked ? '#ff9a5c' : k.silver ? UI.silver : UI.gold, 'center', 6); ty += 11;
      const body = locked ? (k.feat ? k.featName : 'clear ' + k.needsName + ' first') : (k.desc || k.per || '');
      for (const ln of wrap(body, pvW - 10, 6)) { if (ty > pvY + pvH - 10) break; text(ln, pvX + 5, ty, locked ? '#ff9a5c' : UI.dim, 'left', 6); ty += 7; }
    } }
  text(storeMsgT > 0 ? storeMsg : storeMode === 'equip' ? 'LEFT/RIGHT tabs   Z equip   ESC back' : 'LEFT/RIGHT tabs   Z buy or equip   ESC back', VW / 2, y + h - 10, storeMsgT > 0 ? UI.title : UI.dim, 'center', 6);
}

// ---------- bestiary ----------
const BEASTS = [
  { t: 'sprig', name: 'SPRIG', sub: 'brush goblin', desc: 'Walks straight at you and bites. Sword it, stomp it, plunge it, or shove it back with the shield.' },
  { t: 'shield', name: 'SHIELDBEARER', sub: 'helmed goblin', desc: 'Blocks anything from the front with a clank. Turns slowly, so cross behind him and strike, or plunge from above. Stomps clank off the helm.' },
  { t: 'spit', name: 'SPITTER', sub: 'toadstool', desc: 'Spits a seed straight at your chest when you come near. Step aside, jump, block, or slash the seed out of the air.' },
  { t: 'wasp', name: 'WASP', sub: 'over water', desc: 'A stepping stone with wings. Stomp or plunge it to bounce, and chain the bounces across a pit.' },
  { t: 'thorn', name: 'SPIKE GOBLIN', sub: 'spiked iron back', desc: 'Winds up with a ! and charges. Block the charge to stagger him, or dodge through and hit him while he rests. The spikes on his back and helm punish stomps: sword only.' },
  { t: 'hopper', name: 'HOPPER', sub: 'marsh frog', desc: 'Leaps at you and leaps aboard rafts. Green is the common kind. Yellow hops quick and low. Blue is slow, heavy, and bites hard. Swing when it lands, stomp it, or block the leap.' },
  { t: 'archer', name: 'GOBLIN ARCHER', sub: 'keeps its distance', desc: 'Backs away and looses arcing arrows after a draw. Block them, or slash one to send it straight back and kill the archer. It will not cross water.' },
  { t: 'sapper', name: 'SAPPER', sub: 'goblin with a bomb', desc: 'Runs at you and drops a lit bomb at your feet. Block him and he drops it on himself. Dodge through and the bomb lands where you were.' },
  { t: 'brute', name: 'BRUTE', sub: 'club goblin', desc: 'Two tells. A double mark is the overhead: it cannot be blocked, so dodge it. A single mark is the sweep, which the shield holds. Hit him while the club is raised or while he rests.' },
  { t: 'hound', name: 'WAR HOUND', sub: 'goblin dog', desc: 'Runs straight at you and leaps low at the last stride. Stomp it, swing as it lands, or put fire between you.' },
  { t: 'grub', name: 'CAVE GRUB', sub: 'it glows because it burns', desc: 'A soft thing lit from inside. Touching it burns, so do not stomp it barefoot: cut it, or keep out of the arc of acid it spits when you stand off. It leaves its light behind for a moment when it dies.' },
  { t: 'rockgoblin', name: 'ROCK GOBLIN', sub: 'thrower in the dark', desc: 'Squat, patient, and armed with whatever the roof has dropped. It lobs a lit lantern that breaks into fire and light where it lands, which is a problem and a favour at once. Close the distance and it has nothing.' },
  { t: 'shardling', name: 'SHARDLING', sub: 'a knot of crystal that walks', desc: 'Easy to kill and a poor idea to kill from close. It bursts when it goes, and the burst does not care whose side anyone is on: put one next to a rock goblin and let it do the work.' },
  { t: 'sentry', name: 'CASTLE SENTRY', sub: 'the Queen\'s watch', desc: 'A goblin in a kettle helm whose whole job is a bell. See him before he sees you: once he has you he runs for it, and a rung bell drops the gates of that hall and turns out the garrison. Catch him on the way, or break the bell.' },
  { t: 'gqueen', name: 'THE GOBLIN QUEEN', sub: 'the last of the goblin line', desc: 'Old, huge and clever, and she has never fought alone. On her throne she points and her gallery looses where she points; bring the gallery down on her. On her feet she swings an iron sceptre that splits the floor, and charges the length of her hall. On the roof, in the storm, the lightning looks for the tallest iron on the mountain, and that is her crown.' },
  { t: 'roc', name: 'THE ROC', sub: 'mother of harpies', desc: 'She nests on the Sunspire and the glare has turned the ends of her feathers to glass. In the air she is quick and hard to hurt. She comes down for two reasons: to take you, and because something knocked her down. A shadow marks where she will dive, and if she dives onto glass her talons go through it and she is stuck. She beats her wings to throw you on the thorns, and hurt, she sheds her glass. Break crystal over a thermal and it goes up, not down: a shard in the air brings her out of the sky.' },
  { t: 'hearthgob', name: 'HEARTH GOBLIN', sub: 'it lives here', desc: 'Asleep by its own fire until you are close enough to wake it, and then it comes at you with a stool. Not a soldier. Worse than it sounds in a room you cannot back out of.' },
  { t: 'sweep', name: 'CHIMNEY SWEEP', sub: 'up the flue', desc: 'He lives in the stacks. Walk past and he comes up out of one with a handful of soot, throws it, and stays up a moment to watch it land: that moment is the only time you can reach him. Then he is back down the flue.' },
  { t: 'stormshaman', name: 'STORM SHAMAN', sub: 'the weather is his', desc: 'A goblin with a staff who stands at the far end of a span and throws the storm at whoever is crossing it. His bolts are slow: strike one, or take it on a shield, and it goes back at him.' },
  { t: 'lance', name: "THE QUEEN'S LANCE", sub: 'he holds the bridge', desc: 'A goblin knight in plate the size of a door, and every blade turns on it except when he is committed. He cannot steer a charge: step off his line and the lance goes into a post and he goes with it, and that is when he bleeds. His thrust can be parried; the low sweep cannot, so jump it. His charges take the deck out behind him. Half dead he throws the lance away, takes a shield, and becomes the opposite problem.' },
  { t: 'snuffer', name: 'THE SNUFFER', sub: 'lamp-killer', desc: 'It is not hunting you. It walks the boughs putting the village out, one lantern at a time, and the Reeve is glad of it. It swings the pole if you crowd it. Light what it snuffs, or cut it and the lamps stay lit.' },
  { t: 'sailer', name: 'SAIL GOBLIN', sub: 'carried, not driven', desc: 'A plank of sail and no way to steer. In the lull she shuffles at you and is nothing. When the gust takes her she is a battering ram: block her and she spills, or step aside and let the stone take her. THE MASTHEAD is the biggest of them.' },
  { t: 'horn', name: 'HORNBLOWER', sub: 'a gale of his own', desc: 'A goblin on a mound with a ram\'s horn. He winds it at you and a horn\'s worth of wind comes with it: on the ground it slides you back, in the air it throws you. Get under it or get to him; one good cut and he stops blowing.' },
  { t: 'crow', name: 'STORM CROW', sub: 'they do not turn', desc: 'They come down the wind over the high moor in strings of four and five, and a string does not turn for anyone. On the Sky Road there is no ground to stand and cut them from: go over, go under, or go through with a dart.' },
  { t: 'queen', name: 'HORNET QUEEN', sub: 'hive ruler', desc: 'Hovers out of reach and calls drones you can pogo off. Block her dive and she is staggered on the floor, where she takes double damage. Jump or block her low sweep. Half health and she is enraged.' },
  { t: 'frog', name: 'BULLFROG KING', sub: 'lord of the marsh', desc: 'Sits on his mud dais and hops the court. Tongue, leap, venom, and a great breath in: block to dig your heels in or be dragged to his teeth. His throat is soft mid-croak; his head takes two stomps before he hops off.' },
  { t: 'sporeling', name: 'SPORELING', sub: 'walking cap', desc: 'Wanders and bites. Kill it and it bursts into a spore cloud that slows and tires you, so finish it at range or step back.' },
  { t: 'lurker', name: 'LURKER', sub: 'hungry mushroom', desc: 'Looks like scenery until you pass, then lunges. Walk, do not run, through mushroom groves, and swing at caps that look too plump.' },
  { t: 'drone', name: 'SPORE DRONE', sub: 'floating puffball', desc: 'Drifts toward you and bursts. Swords bounce off it. Stomp it out of the air or plunge it.' },
  { t: 'shaman', name: 'TOAD SHAMAN', sub: 'walking toadstool', desc: 'Raises sporelings from the ground and vanishes in a puff when struck. Chase it down first.' },
  { t: 'thief', name: 'GOBLIN THIEF', sub: 'cutpurse', desc: 'Stalks you and snatches gold from your pockets on touch, then runs. Catch him and it comes back with interest. Runs from a thrown shield too slowly.' },
  { t: 'pike', name: 'PIKEMAN', sub: 'holds the line', desc: 'A long pike that turns your blade from the front. Jump over him, get behind, or throw the shield. Block the thrust to parry it.' },
  { t: 'folk', name: 'TOWNSFOLK', sub: 'they live here', desc: 'Harmless. They run for their doors and slam them. The court cheers the King and hides when he stands. Hurting them is beneath you.' },
  { t: 'greathound', name: 'THE GREAT HOUND', sub: 'the kennels\' own', desc: 'A hound the length of a cart. LUNGE: jump it, or block it and it skids past you, open. POUNCE: dodge sideways; it lands stunned. HOWL: two pups come; kill both quickly and it whines, open for a long while. Past half its blood it snaps at anything beside it. The chained kennel hound, freed, bites it too.' },
  { t: 'spider', name: 'BOUGH SPIDER', sub: 'thread and fang', desc: 'Hangs from the bough above on a thread. Walk under it and it drops, bites, and yanks you sideways off the ledge. It climbs back up slowly: hit it then, or stomp it as it hangs.' },
  { t: 'squirrel', name: 'SQUIRREL KNIGHT', sub: 'the tree-city\'s cutpurse', desc: 'A red squirrel in a tabard. Snatches your gold on touch and hops up the tree with it. Catch it before it climbs out of reach and the gold comes back with interest.' },
  { t: 'miner', name: 'GOBLIN MINER', sub: 'pick and candle', desc: 'Digs through soft rock toward you and leaves the tunnel behind for you to use. Swings a pick with a slow, heavy tell: block it and he is open. Drops his lamp when he dies, and the lamp stays lit.' },
  { t: 'bat', name: 'CAVE BAT', sub: 'hunter of lamps', desc: 'Hangs in the dark and cannot see you. It sees light: a lamp, a fire, an ember, the lamp you carry. Stand in the dark and it stays put; carry light through its roost and it comes. One hit kills it.' },
  { t: 'windcaller', name: 'THE WINDCALLER', sub: 'lord of the moor', desc: 'The goblin shaman of the moor. He stands on the standing stones and throws bolts of sky at you, and the moment you cut him twice he is gone in a gust and on another stone. The wind is the only stair up to him: the gust for the ledges, the updrafts for the high stones. Every so often he calls the wind itself, and it drags you toward the thorns. Below half he throws three at once and will not stay for a second blow.' },
  { t: 'kite', name: 'KITE GOBLIN', sub: 'hangs under a box kite', desc: 'Drifts on the gusts, edges over you and drops a stone. One cut, to the string or the goblin, and both come down: the goblin gets up as a sprig.' },
  { t: 'hare', name: 'MOOR HARE', sub: 'runs with the wind', desc: 'Sits until you are close, then bolts with the wind, straight through you. Jump it.' },
  { t: 'wight', name: 'PEAT WIGHT', sub: 'stands up out of the bog', desc: 'Stand still in the bog and it rises beside you, cold hands out. It holds and drains. Keep moving and it never comes.' },
  // THE FACET's row went with the Glassworks. Its code is still here (spawn case, updateGolem, art) if it is ever re-homed.
  { t: 'forgemaster', name: 'THE FORGEMASTER', sub: 'engineer of the deep', desc: 'Twice the smith. His iron turns half of every cut; a cart into him stuns him and a stunned smith takes it all, doubled. Cut a standing tub to send it, ride one at him, or cut the beam tub off its rail onto his head. He drags tubs to himself on a chain and hurls them. He rings the anvil and hammers fall where you stand. Half dead the furnace opens: a fire breath, and the floor plates glow before they burn. Strapped into a steam rig at the forge. Three things never stop: the hammer stamps the floor on a rhythm, carts roll through on the rail, slag drips from marked spots. He lunges on a piston, sprays scalding steam, and kicks carts at you. Ride a cart into his boiler, or burn it with embers, and it bursts: he is scalded and open. Past half his blood the lamps go out and the bats come.' },
  { t: 'owl', name: 'THE OWL REEVE', sub: 'lord of the crown', desc: 'Perches on the great bough where you cannot reach it. It swoops in straight lines: stand beside a lit lantern and step aside, and it crashes into the light, dazed. It lands to screech (block it) and is open on the ground. Past half its blood it beats out two lanterns: strike them twice to relight them.' },
  { t: 'king', name: 'KING GORM UNDERLEAF', sub: 'lord of the court', desc: 'Three times the goblin. Rides a litter that four bearers can barely lift: cut them and the throne falls. Then the sceptre sweeps, the hand reaches for you and hurls you the length of the hall, cages drop from the rafters, and the court throws when he shouts. At the end he stands, the roof comes down where he walks, and he throws the throne itself.' },
  { t: 'chief', name: 'GOBLIN CHIEFTAIN', sub: 'lord of the stockade', desc: 'Red tells and a stamp: the club. Blue tells and a glint: sword and shield. Green: the bow. He swaps at the racks by the walls; break a rack and that weapon is out of the fight. The dais is beyond his club and sword, not his arrows or his leap. He swaps weapons every few swings. Club: dodge the slam and hit him while it is planted. Sword and shield: block his slash to parry it, or get behind the shield. Bow: parry the arrows back at him. Whatever he holds, when he crouches he is about to leap on you: move.' },
  { t: 'mother', name: 'THE MOTHER CAP', sub: 'root of the wood', desc: 'She never moves; the hollow is her, and she breathes. IN: her gills seal, she drags you toward the stalk, roots stab, pods and sleep spores fly, her brood climbs up. OUT: the gills flare open and everything stops. Bounce off the caps and cut them then. Every gill you cut drops a chunk of cap that springs you higher. Cut all four and she tips: the heart shows, vines whip, and six hits of anything end her.' },
  { t: 'harpy', name: 'CRAG HARPY', sub: 'diver of the cliffs', desc: 'Hangs in the wind above you, screams, and dives in a straight line. Block the dive and she hits the ground stunned: plunge her there. A sword hit sends her back to her perch.' },
  { t: 'goat', name: 'CRAG RAM', sub: 'the hill charger', desc: 'A wild ram of the scree. It charges and hops walls and ledges. Block the charge and it rears, turned and open for a moment.' },
  { t: 'troll', name: 'HILL TROLL', sub: 'boulder-thrower', desc: 'Slow, mossy, taller than a door. From range it hurls a boulder in an arc at where you are going: watch the shadow and the whistle. Up close it swats, heavy but blockable. Its hide is soft: the sword and the plunge both bite.' },
  { t: 'ram', name: 'THE RAM LORD', sub: 'lord of the fold', desc: 'A green ring under him means he is dazed and soft: after he hits the wall, and for a breath after he lands from a leap. His horns turn your blade from the front. Dodge or jump his charge and he hits the wall, stunned and soft: cut him from behind or plunge between the horns. He stamps the ground and hops at you. Half dead, he charges twice and rocks fall.' },
];
function beastRec(t) { PROG.beasts = PROG.beasts || {}; return PROG.beasts[t] = PROG.beasts[t] || { seen: false, slain: 0 }; }
function beastSeen(t) { const r = beastRec(t); if (!r.seen) { r.seen = true; saveProgress(); } }
function beastSlain(t) { const r = beastRec(t); r.seen = true; r.slain++; saveProgress(); }
function drawSlots() {
  g.fillStyle = 'rgba(10,6,20,0.55)'; g.fillRect(0, 0, VW, VH);
  text('CHOOSE A SAVE', VW / 2, 12, UI.title, 'center');
  const levels = LEVELS.filter(l => !l.hidden).length, cw = 92, gap = 8, x0 = (VW - (cw * SLOTS + gap * (SLOTS - 1))) / 2;
  for (let i = 0; i < SLOTS; i++) {
    const p = readSlot(i), x = x0 + i * (cw + gap), sel = i === slotI, y = 34 - (sel ? 3 : 0), h = 104;
    if (sel) { g.globalAlpha = 0.18 + 0.08 * Math.sin(time * 5); g.fillStyle = '#ffd36b'; g.fillRect(x - 2, y - 2, cw + 4, h + 4); g.globalAlpha = 1; }
    g.fillStyle = sel ? 'rgba(30,26,44,0.95)' : 'rgba(20,16,30,0.85)'; g.fillRect(x, y, cw, h); g.strokeStyle = sel ? '#ffd36b' : '#4a4a5a'; g.strokeRect(x + 0.5, y + 0.5, cw - 1, h - 1);
    text('SLOT ' + (i + 1), x + cw / 2, y + 8, sel ? '#fff6e0' : '#9aa39a', 'center');
    if (!p) { text('empty', x + cw / 2, y + 44, '#6a6a7a', 'center'); text('new game', x + cw / 2, y + 58, sel ? '#8fd160' : '#4a5a4a', 'center'); continue; }
    const cleared = LEVELS.filter(l => p[l.id] && p[l.id].cleared).length, medals = LEVELS.reduce((a, l) => a + ((p[l.id] && p[l.id].medal) || 0), 0);
    const skin = SKINS.find(k => k.id === (p.skin || 'bracken')); const K2 = p.hero === 'paladin' ? preview('slot:paladin', () => bakePaladin({})) : p.hero === 'pyro' ? preview('slot:pyro:' + (p.skin || 'bracken'), () => bakePyro(PYRO_SETS[p.skin || 'bracken'] || {})) : skin ? preview('slot:' + skin.id + ':' + (p.sword || 'steel'), () => bakeKnight(Object.assign({}, skin.pal, (SWORDS.find(w => w.id === (p.sword || 'steel')) || SWORDS[0]).pal))) : K;
    drawSet(K2, 'idle', Math.floor(time * 3) % 4, x + cw / 2, y + 44, 1, false);
    text(cleared + ' / ' + levels + ' woods', x + cw / 2, y + 52, '#fff6e0', 'center');
    text((p.coins || 0) + ' gold', x + cw / 2, y + 64, '#ffd34a', 'center');
    text(medals + ' medal pts', x + cw / 2, y + 76, '#c9d1dc', 'center');
    if (cleared >= levels) text('COMPLETE', x + cw / 2, y + 90, '#8fd160', 'center');
  }
  text(slotMsgT > 0 && slotMsg ? slotMsg : 'ARROWS pick  Z play  X erase  ESC', VW / 2, VH - 24, slotMsgT > 0 ? '#ffd36b' : '#9aa39a', 'center');
}
function drawBestiary() {
  const vg = g.createRadialGradient(VW / 2, VH / 2, 40, VW / 2, VH / 2, 200); vg.addColorStop(0, 'rgba(10,20,14,0.6)'); vg.addColorStop(1, 'rgba(10,20,14,0.9)'); g.fillStyle = vg; g.fillRect(0, 0, VW, VH);
  text('BESTIARY', VW / 2, 4, UI.title, 'center');
  text((bestTab === 0 ? '>' : ' ') + 'FOES', 14, 15, bestTab === 0 ? '#8fd160' : '#6a7a6a'); text((bestTab === 1 ? '>' : ' ') + 'BOSSES', 68, 15, bestTab === 1 ? '#8fd160' : '#6a7a6a');
  const list = beastList(), lx = 8, ly = 30, ROWS = 11, off = Math.max(0, Math.min(list.length - ROWS, bestI - ROWS + 2));
  list.forEach((b, i) => { if (i < off || i >= off + ROWS) return; const r = PROG.beasts && PROG.beasts[b.t]; const sel = i === bestI; const yy = ly + (i - off) * 12; if (sel) text('>', lx, yy, '#8fd160'); text(r && r.seen ? (BEAST_SHORT[b.t] || b.name) : '? ? ?', lx + 10, yy, sel ? '#fff6e0' : (r && r.seen ? '#c9d1dc' : '#6a6a6a')); });
  if (off > 0) text('^', 64, ly - 8, '#9aa39a', 'center'); if (off + ROWS < list.length) text('v', 64, ly + ROWS * 12, '#9aa39a', 'center');
  const b = list[bestI], r = PROG.beasts && PROG.beasts[b.t], seen = !!(r && r.seen);
  const px = 122, pw = VW - px - 8, py = 20, ph = VH - 40;
  g.fillStyle = 'rgba(20,16,30,0.85)'; g.fillRect(px, py, pw, ph); g.strokeStyle = '#8fd160'; g.strokeRect(px + 0.5, py + 0.5, pw - 1, ph - 1);
  const set = SPR[b.t]; const c = set.R[0]; const sc = c.width > 26 ? 1 : c.width > 18 ? 2 : 3; const cxp = px + 30, cyp = py + 26;
  if (!seen) g.globalAlpha = 0.25;
  { const nF = set.R.length, fr = seen ? Math.floor(time * (nF > 6 ? 4 : 7)) % nF : 0; const pace = seen ? Math.sin(time * 1.1) * 8 : 0, face = !seen ? 1 : (Math.cos(time * 1.1) >= 0 ? 1 : -1); const bob = seen && (b.t === 'wasp' || b.t === 'drone' || b.t === 'harpy' || b.t === 'queen') ? Math.round(Math.sin(time * 5) * 2) : 0; drawSet(set, null, fr, cxp + pace - (c.width / 2 - set.ax) * sc, cyp + bob + (set.ay - c.height / 2) * sc, face, !seen, sc, sc); }
  g.globalAlpha = 1;
  const fit = t => t.length * 8 > pw - 66 ? 6 : 8;
  text(seen ? b.name : 'UNKNOWN', px + 62, py + 10, '#ffd36b', 'left', fit(seen ? b.name : 'UNKNOWN'));
  text(seen ? b.sub : 'not yet met', px + 62, py + 22, '#9aa39a', 'left', fit(seen ? b.sub : 'not yet met'));
  if (seen) { text('slain ' + (r.slain || 0), px + 62, py + 34, '#c9d1dc'); let lines = wrap(b.desc, pw - 12), sz = 8, lh = 9; if (lines.length > 9) { lines = wrap(b.desc, pw - 12, 6); sz = 6; lh = 7; } lines.slice(0, 12).forEach((l, i) => text(l, px + 6, py + 52 + i * lh, '#fff6e0', 'left', sz)); }
  else text('Meet it in the wood.', px + 6, py + 54, '#9aa39a');
  text('UP/DOWN browse  L/R group  ESC map', VW / 2, VH - 12, '#9aa39a', 'center');
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
// Two menus: a short PAUSE menu in a level (the things you reach for), and the full SETTINGS list (from the title, or via Settings in the pause menu).
const PAUSE_ITEMS = ['Resume', 'Equip', 'Hero', 'Back to shrine', 'Restart level', 'Return to map', 'Music volume', 'Effects vol', 'Settings', 'Quit to title'];
const SETTINGS_ITEMS = ['- GAME -', 'Difficulty', 'Game speed', 'Jump assist', 'Iron Knight', 'Block', 'Text speed', 'Swap Z / X', 'Controls', 'Rumble', '- AUDIO -', 'Sound test', 'Music', 'Music volume', 'Effects vol', 'Ambience vol', 'UI volume', 'Sound FX', '- VIDEO -', 'Camera', 'Look down', 'HUD', 'Big text', 'Colour tells', 'FPS counter', 'Brightness', 'Screen filter', 'Film grain', 'Parallax', 'Arena tint', 'Particles', 'Foe outline', 'Boss intro', 'Foe health', 'Reduce motion', 'Screen shake', 'Hit stop', 'Flashes', 'Vignette', 'Weather', 'Impact FX', 'Hit numbers', 'Timer', 'Tenths', 'Ambient life', 'Scanlines', 'Pixel scale', '- SAVE -', 'Erase this save', '- TESTING -', 'God mode', 'Invincible', 'Back'];
const FILTERS = ['none', 'warm', 'cool', 'sepia', 'night', 'grey', 'vivid'];
const BRIGHTS = [0.8, 0.9, 1, 1.1, 1.25], PARALLAX = ['full', 'near', 'off'], TINTS = ['off', 'half', 'full'], PARTQ = ['few', 'normal', 'many'], SHAKES = [0, 0.5, 1];
const partScale = () => SET.parts === 'few' ? 0.5 : SET.parts === 'many' ? 1.8 : 1;
let menuKind = 'pause';
// one line each, so nobody has to guess what a switch does
const SETTING_TIPS = {
  'Difficulty': 'how hard foes hit and how much they take', 'Game speed': 'slow the whole game down', 'Jump assist': 'a longer coyote step off ledges',
  'Iron Knight': 'one life, one run, for the medal', 'Block': 'hold the key or toggle it', 'Text speed': 'how fast talk boxes fill',
  'Swap Z / X': 'which key jumps', 'Rumble': 'gamepad rumble',
  'Music': 'the soundtrack on or off', 'Music volume': 'the soundtrack', 'Effects vol': 'swings, hits and voices', 'Ambience vol': 'wind, water, the wood',
  'UI volume': 'menu clicks', 'Sound FX': 'recorded clips or the synth',
  'Camera': 'close, or wide for more of the room', 'Look down': 'hold down to look below you', 'HUD': 'full, or just the bars',
  'Big text': 'larger talk and menu text', 'Colour tells': 'shapes as well as colour on wind-ups', 'FPS counter': 'frames and milliseconds',
  'Brightness': 'lifts or drops the whole picture', 'Screen filter': 'a colour grade over everything', 'Film grain': 'a faint moving grain, like old tape',
  'Parallax': 'how many background layers move', 'Arena tint': 'the colour wash over boss rooms', 'Particles': 'how much comes off a hit',
  'Foe outline': 'a bright rim on foes, easier to pick out', 'Boss intro': 'the letterbox and the name card', 'Foe health': 'bars over hurt foes',
  'Reduce motion': 'less shake, less zoom, calmer screen', 'Screen shake': 'how hard the camera kicks', 'Hit stop': 'the freeze on a landed hit',
  'Flashes': 'white flashes on big hits', 'Vignette': 'the dark edge of the screen', 'Weather': 'rain, spores, pollen, wind motes',
  'Impact FX': 'stars and rings where things land', 'Hit numbers': 'the numbers off a hit', 'Timer': 'the run clock', 'Tenths': 'tenths on the clock',
  'Ambient life': 'birds, fish, critters and idle folk', 'Scanlines': 'CRT lines over the picture', 'Pixel scale': 'how the picture fits your screen',
  'Erase this save': 'erases this save', 'Sound test': 'listen to every track and cry',
};
const menuItems = () => menuKind === 'pause' ? PAUSE_ITEMS : (menuFrom === 'play' ? SETTINGS_ITEMS.filter(k => k !== 'Sound test') : SETTINGS_ITEMS);
const isHeader = k => k[0] === '-';
const MENU_ROWS = 10;
let menuBarY = null, menuI = 0, menuFrom = 'play', selI = 0, menuMsg = '', menuMsgT = 0, bestI = 0, bestTab = 0;
const BOSS_T = ['queen', 'frog', 'chief', 'mother', 'greathound', 'king', 'ram', 'owl', 'forgemaster', 'golem', 'windcaller', 'lance', 'roc', 'gqueen'];
const beastList = () => BEASTS.filter(b => bestTab === 1 ? BOSS_T.includes(b.t) : !BOSS_T.includes(b.t));
const BEAST_SHORT = { greathound: 'GREAT HOUND', owl: 'OWL REEVE', forgemaster: 'FORGEMASTER', king: 'KING GORM', chief: 'CHIEFTAIN', mother: 'MOTHER CAP', ram: 'RAM LORD' };
function openMenu(from) { menuFrom = from; menuKind = from === 'play' ? 'pause' : 'settings'; menuI = menuKind === 'pause' ? 0 : 1; state = 'menu'; SFX.menuOpen(); }
function menuAdjust(dir) {
  const k = menuItems()[menuI];
  if (isHeader(k)) return;
  if (k === 'Brightness') SET.bright = BRIGHTS[(BRIGHTS.indexOf(SET.bright) + dir + BRIGHTS.length) % BRIGHTS.length];
  else if (k === 'Parallax') SET.parallax = PARALLAX[(PARALLAX.indexOf(SET.parallax) + dir + PARALLAX.length) % PARALLAX.length];
  else if (k === 'Arena tint') SET.tint = TINTS[(TINTS.indexOf(SET.tint) + dir + TINTS.length) % TINTS.length];
  else if (k === 'Particles') SET.parts = PARTQ[(PARTQ.indexOf(SET.parts) + dir + PARTQ.length) % PARTQ.length];
  else if (k === 'Foe outline') SET.rim = !SET.rim;
  else if (k === 'Film grain') SET.grain = !SET.grain;
  else if (k === 'Screen shake') { const i = SHAKES.indexOf(SET.shakeAmt); SET.shakeAmt = SHAKES[(i < 0 ? 2 : i + dir + SHAKES.length) % SHAKES.length]; SET.shake = SET.shakeAmt > 0; }
  else if (k === 'HUD') SET.hud = SET.hud === 'full' ? 'minimal' : 'full'; else if (k === 'Screen filter') SET.filter = FILTERS[(FILTERS.indexOf(SET.filter) + dir + FILTERS.length) % FILTERS.length]; else if (k === 'Foe health') SET.foeBars = !SET.foeBars; else if (k === 'Look down') SET.lookDown = !SET.lookDown; else if (k === 'Boss intro') SET.bossIntro = !SET.bossIntro; else if (k === 'Rumble') SET.rumble = !SET.rumble; else if (k === 'Tenths') SET.tenths = !SET.tenths;
  else if (k === 'Flashes') SET.flashes = !SET.flashes; else if (k === 'Vignette') SET.vignette = !SET.vignette; else if (k === 'Weather') SET.weather = !SET.weather; else if (k === 'Impact FX') SET.impact = !SET.impact; else if (k === 'Tips') SET.tips = !SET.tips; else if (k === 'Block') SET.blockToggle = !SET.blockToggle; else if (k === 'Text speed') SET.textFast = !SET.textFast; else if (k === 'Reduce motion') { SET.reduceMotion = !SET.reduceMotion; if (SET.reduceMotion) { SET.shake = false; SET.hitstop = false; SET.flashes = false; } menuMsg = SET.reduceMotion ? 'no shake, no stop, no flashes, no zoom' : 'motion back on'; menuMsgT = 3; }
  else if (k === 'Music') SET.music = !SET.music; else if (k === 'Camera') { SET.zoom = SET.zoom === 'wide' ? 'close' : 'wide'; } else if (k === 'God mode') { SET.godmode = !SET.godmode; menuMsg = SET.godmode ? 'everything unlocked and free while this is on' : 'back to what you have earned'; menuMsgT = 2; if (!SET.godmode) { for (const tb of STORE_TABS) if (tb.key && tb.owned && PROG[tb.key] && !(PROG[tb.owned] || {})[PROG[tb.key]] && PROG[tb.key] !== 'none') PROG[tb.key] = tb.key === 'hero' ? 'knight' : (tb.items[0] || {}).id; applySkin(); applyUpgrades(); } }
  else if (k === 'Invincible') { SET.invincible = !SET.invincible; menuMsg = SET.invincible ? 'nothing can hurt you (for testing)' : 'you can be hurt again'; menuMsgT = 2; }
  else if (k === 'Iron Knight') { SET.iron = !SET.iron; menuMsg = SET.iron ? 'three lives a level, then back to the map' : 'shrines forever'; menuMsgT = 3; } else if (k === 'Effects vol') SET.sfx = Math.round(Math.max(0, Math.min(1, SET.sfx + dir * 0.1)) * 10) / 10; else if (k === 'Screen shake') SET.shake = !SET.shake; else if (k === 'Sound FX') SET.sfxFiles = !SET.sfxFiles;
  else if (k === 'Hit stop') SET.hitstop = !SET.hitstop; else if (k === 'Hit numbers') SET.numbers = !SET.numbers; else if (k === 'Timer') SET.timer = !SET.timer; else if (k === 'Ambient life') SET.ambient = !SET.ambient;
  else if (k === 'Game speed') { const SP = [1, 0.9, 0.8]; SET.speed = SP[(SP.indexOf(SET.speed) + dir + 3) % 3]; menuMsg = SET.speed < 1 ? 'the world runs slower. the timer does not' : 'full speed'; menuMsgT = 3; } else if (k === 'Jump assist') { SET.assist = !SET.assist; menuMsg = SET.assist ? 'longer coyote time and jump buffer' : 'standard jumps'; menuMsgT = 3; } else if (k === 'Ambience vol') SET.ambVol = Math.round(Math.max(0, Math.min(1, SET.ambVol + dir * 0.1)) * 10) / 10; else if (k === 'UI volume') SET.uiVol = Math.round(Math.max(0, Math.min(1, SET.uiVol + dir * 0.1)) * 10) / 10; else if (k === 'Big text') SET.bigText = !SET.bigText; else if (k === 'FPS counter') SET.fps = !SET.fps; else if (k === 'Colour tells') { SET.colorSafe = !SET.colorSafe; menuMsg = SET.colorSafe ? 'red tells turn blue, orange turns violet' : 'the usual colours'; menuMsgT = 3; }
  else if (k === 'Difficulty') { if (menuFrom === 'play' && L && !L.shop) { PROG.diff = PROG.diff || {}; PROG.diff[curId()] = DIFFS[(DIFFS.indexOf(diffOf(curId())) + dir + 3) % 3]; saveProgress(); } else SET.difficulty = DIFFS[(DIFFS.indexOf(SET.difficulty) + dir + 3) % 3]; } else if (k === 'Music volume') SET.musicVol = Math.round(Math.max(0, Math.min(1, SET.musicVol + dir * 0.1)) * 10) / 10; else if (k === 'Swap Z / X') SET.swapZX = !SET.swapZX; else if (k === 'Scanlines') SET.scanlines = !SET.scanlines; else if (k === 'Pixel scale') SET.scale = SCALES[(SCALES.indexOf(SET.scale) + dir + 4) % 4]; else return;
  applySettings(); saveSettings(); SFX.ui();
}
function menuConfirm() {
  const k = menuItems()[menuI];
  if (k === 'Resume') { state = menuFrom; SFX.menuClose(); }
  else if (k === 'Settings') { menuKind = 'settings'; menuI = 1; SFX.uiSel(); }
  else if (k === 'Back') { if (menuFrom === 'play') { menuKind = 'pause'; menuI = PAUSE_ITEMS.indexOf('Settings'); SFX.ui(); } else { state = menuFrom; SFX.menuClose(); } }
  else if (k === 'Equip') { openEquip('menu'); }
  else if (k === 'Hero') { state = 'herocard'; SFX.uiSel(); }
  else if (k === 'Return to map') { setView('normal'); state = 'map'; gotoLevelNode(levelIndex); music.play(menuTrack()); SFX.menuClose(); }
  else if (k === 'Sound test') { state = 'soundtest'; soundI = 0; soundCat = 0; SFX.uiSel(); }
  else if (k === 'Controls') { state = 'controls'; SFX.uiSel(); }
  else if (k === 'Quit to title') { setView('normal'); state = 'title'; music.play(menuTrack()); SFX.uiSel(); }
  else if (k === 'Erase this save') { if (menuMsg === 'press again to confirm' && menuMsgT > 0) { eraseSlot(slot); saveProgress(); menuMsg = 'slot ' + (slot + 1) + ' cleared'; SFX.crack(); } else { menuMsg = 'press again to confirm'; SFX.ui(); } menuMsgT = 2.5; }
  else if (k === 'Back to shrine') { if (menuFrom !== 'play') { menuMsg = 'not in a level'; menuMsgT = 2; SFX.buzz(); } else { state = 'play'; if (!P.dead) die(); SFX.uiSel(); } }
  else if (k === 'Restart level') { if (menuFrom !== 'play') { menuMsg = 'not in a level'; menuMsgT = 2; SFX.buzz(); } else if (menuMsg === 'press again to restart' && menuMsgT > 0) { loadLevel(levelIndex); startGame(); SFX.uiSel(); } else { menuMsg = 'press again to restart'; menuMsgT = 2.5; SFX.ui(); } }
  else menuAdjust(1);
}
// THE HERO CHOICE: a new save picks any one of the three to start with; the other two are 15 silver each at the store
let heroPick = { i: 0, stage: 'pick' };
const PICK = ['knight', 'pyro', 'paladin'];
function startTrial(h) { const i = LEVELS.findIndex(l => l.id === 'trial_' + h); if (i < 0) return; loadLevel(i); introSeen = true; startGame(); SFX.uiSel(); }
function updateHeroPick() {
  if (heroPick.stage === 'pick') {
    if (leftPress) { heroPick.i = (heroPick.i + 2) % 3; SFX.ui(); } if (rightPress) { heroPick.i = (heroPick.i + 1) % 3; SFX.ui(); }
    if (confirmPress) { const h = PICK[heroPick.i]; PROG.heroes = { [h]: true }; PROG.hero = h; PROG.heroPicked = true; applySkin(); applyUpgrades(); saveProgress(); SFX.equip(); SFX.sting(); heroPick.stage = 'trial'; } }
  else { if (confirmPress) startTrial(hero()); else if (atkPress || pausePress) { state = 'map'; SFX.ui(); } }
}
function drawHeroPick() {
  g.fillStyle = '#0e0c16'; g.fillRect(0, 0, VW, VH);
  if (heroPick.stage === 'trial') { const H = HEROES.find(k => k.id === hero()); text(H.name, VW / 2, VH / 2 - 30, UI.title, 'center', 12); text('TAKE THE TRIAL FIRST?', VW / 2, VH / 2, UI.text, 'center'); text('a short practice yard for this hero. nothing in it can hurt you.', VW / 2, VH / 2 + 14, UI.dim, 'center', 6); text('Z  YES        X  STRAIGHT TO THE MAP', VW / 2, VH / 2 + 32, UI.sel, 'center', 6); return; }
  text('CHOOSE YOUR HERO', VW / 2, 10, UI.title, 'center', 12);
  const cw = Math.floor((VW - 24) / 3), LINES = { knight: ['sword and shield', 'the steady way in', '100 health'], pyro: ['staff and fire', 'no shield', '80 health', 'HARDER'], paladin: ['maul and light', 'slow and heavy', '120 health'] };
  PICK.forEach((h, k) => { const x = 8 + k * (cw + 4), y = 30, sel = k === heroPick.i, H = HEROES.find(q => q.id === h);
    g.fillStyle = sel ? 'rgba(60,90,60,0.55)' : 'rgba(40,36,54,0.6)'; g.fillRect(x, y, cw, VH - 58); if (sel) { g.strokeStyle = UI.sel; g.lineWidth = 1; g.strokeRect(x + 0.5, y + 0.5, cw - 1, VH - 59); }
    const set = h === 'pyro' ? preview('pick:pyro', () => bakePyro(PYRO_SETS.bracken)) : h === 'paladin' ? preview('pick:paladin', () => bakePaladin({})) : preview('pick:knight', () => bakeKnight({})); const fr = set.R.idle[Math.floor(time * 3 + k) % 4];
    const sc = 2; g.drawImage(fr, 0, 0, fr.width, fr.height, Math.round(x + cw / 2 - fr.width * sc / 2), y + 8, fr.width * sc, fr.height * sc);
    text(H.name, x + cw / 2, y + 70, sel ? UI.title : UI.text, 'center', 6); let ly = y + 82; for (const ln of LINES[h]) for (const w2 of wrap(ln, cw - 8, 6)) { text(w2, x + cw / 2, ly, ln.includes('HARDER') ? '#ff9a5c' : UI.dim, 'center', 6); ly += 8; } });
  text('LEFT/RIGHT choose    Z take this hero', VW / 2, VH - 20, UI.sel, 'center', 6); text('the other two are 15 silver each, later', VW / 2, VH - 11, UI.dim, 'center', 6);
}
function selectStart() {
  const lv = LEVELS[selI];
  if (levelLocked(lv)) { SFX.buzz(); return; }
  if (levelIndex !== selI || !L) loadLevel(selI);
  SFX.uiSel();
  if (lv.hidden || introSeen || q.get('tx') || PROG[lv.id]) startGame(); else startIntro();
}

// ---------- input ----------
const keys = {};
let throwPress = false, talkPress = false, padLast = false; // padLast: the last press came from a gamepad (prompts show pad glyphs)
let jumpPress = false, atkPress = false, dodgePress = false, pausePress = false, anyPress = false, upPress = false, downPress = false, leftPress = false, rightPress = false, confirmPress = false;
const isKey = (e, names) => names.includes(e.key) || names.includes(e.code);
const KEYS = {
  jump: ['z', 'Z', ' ', 'Space', 'ArrowUp', 'w', 'W', 'k', 'K'], atk: ['x', 'X', 'j', 'J', 'Enter'], block: ['c', 'C', 'l', 'L'], dodge: ['v', 'V', 'Shift'],
  throw: ['f', 'F', 'b', 'B'], talk: ['e', 'E', 't', 'T'],
  left: ['ArrowLeft', 'a', 'A'], right: ['ArrowRight', 'd', 'D'], down: ['ArrowDown', 's', 'S'], up: ['ArrowUp', 'w', 'W'], pause: ['Escape', 'p', 'P'],
};
addEventListener('keydown', e => {
  if (e.repeat) { e.preventDefault(); return; }
  initAudio(); anyPress = true;
  if (state === 'editor') { // the editor owns the letters; only the arrows fall through, to pan
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key.toLowerCase();
    if (edKey(k, e)) { e.preventDefault(); return; }
    if (isKey(e, KEYS.left)) keys.left = true; if (isKey(e, KEYS.right)) keys.right = true;
    if (isKey(e, KEYS.up)) keys.up = true; if (isKey(e, KEYS.down)) keys.down = true;
    if (isKey(e, KEYS.block)) keys.block = true;
    e.preventDefault(); return;
  }
  const zx = SET.swapZX && (e.key === 'z' || e.key === 'Z' || e.key === 'x' || e.key === 'X');
  const jumpK = zx ? isKey(e, ['x', 'X']) : isKey(e, KEYS.jump), atkK = zx ? isKey(e, ['z', 'Z']) : isKey(e, KEYS.atk);
  if (jumpK) { jumpPress = true; keys.jump = true; }
  if (atkK) { atkPress = true; keys.atk = true; }
  if (isKey(e, KEYS.block)) keys.block = SET.blockToggle ? !keys.block : true;
  if (isKey(e, KEYS.dodge)) { dodgePress = true; keys.dodge = true; }
  if (isKey(e, KEYS.throw)) throwPress = true;
  if (isKey(e, KEYS.talk)) talkPress = true;
  padLast = false;
  if (isKey(e, KEYS.left)) { keys.left = true; leftPress = true; }
  if (isKey(e, KEYS.right)) { keys.right = true; rightPress = true; }
  if (isKey(e, KEYS.down)) { keys.down = true; downPress = true; }
  if (isKey(e, KEYS.up)) { upPress = true; keys.up = true; }
  if (isKey(e, ['z', 'Z', 'Enter', ' ', 'Space'])) confirmPress = true;
  if (isKey(e, KEYS.pause)) pausePress = true;
  if (isKey(e, ['m', 'M'])) { SET.music = !SET.music; applySettings(); saveSettings(); }
  if (isKey(e, ['r', 'R']) && state === 'play') die();
  e.preventDefault();
});
addEventListener('keyup', e => {
  if (state === 'editor') { if (isKey(e, KEYS.left)) keys.left = false; if (isKey(e, KEYS.right)) keys.right = false; if (isKey(e, KEYS.up)) keys.up = false; if (isKey(e, KEYS.down)) keys.down = false; if (isKey(e, KEYS.block)) keys.block = false; return; }
  const zx = SET.swapZX && (e.key === 'z' || e.key === 'Z' || e.key === 'x' || e.key === 'X');
  if (zx ? isKey(e, ['x', 'X']) : isKey(e, KEYS.jump)) keys.jump = false;
  if (zx ? isKey(e, ['z', 'Z']) : isKey(e, KEYS.atk)) keys.atk = false;
  if (isKey(e, KEYS.block) && !SET.blockToggle) keys.block = false;
  if (isKey(e, KEYS.dodge)) keys.dodge = false;
  if (isKey(e, KEYS.left)) keys.left = false;
  if (isKey(e, KEYS.right)) keys.right = false;
  if (isKey(e, KEYS.down)) keys.down = false;
  if (isKey(e, KEYS.up)) keys.up = false;
});
addEventListener('blur', () => { for (const k in keys) keys[k] = false; edPaint = 0; });
// ---- the editor's mouse. Screen pixels come in; edMouse turns them into tiles. ----
{
  const toGame = ev => { const r = disp.getBoundingClientRect(); return [(ev.clientX - r.left - offX) / S, (ev.clientY - r.top - offY) / S]; };
  disp.addEventListener('contextmenu', ev => { if (state === 'editor') ev.preventDefault(); });
  disp.addEventListener('mousedown', ev => { if (state !== 'editor') return; initAudio(); const [x, y] = toGame(ev); edMouse(x, y, ev.button, true, false); ev.preventDefault(); });
  disp.addEventListener('mousemove', ev => { if (state !== 'editor') return; const [x, y] = toGame(ev); edMouse(x, y, ev.button, false, true); });
  addEventListener('mouseup', () => { if (state === 'editor') { edPaint = 0; edPainted = null; } });
  disp.addEventListener('wheel', ev => { if (state !== 'editor') return; const items = edItems(edCat); const d = ev.deltaY > 0 ? 1 : -1;
    if (ev.shiftKey) edCat = (edCat + d + ED_CATS.length) % ED_CATS.length; else edSel[edCat] = (edSel[edCat] + d + items.length) % items.length;
    SFX.ui(); ev.preventDefault(); }, { passive: false });
}
// Gamepad: A jump, X swing, B dodge, RB/LB block, Start pause, d-pad or left stick to move.
const pad = { prev: {} };
function pollGamepad() {
  const gps = navigator.getGamepads ? navigator.getGamepads() : []; let gp = null; for (const p of gps) if (p && p.connected) { gp = p; break; }
  if (!gp) return;
  const b = i => !!(gp.buttons[i] && gp.buttons[i].pressed);
  const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
  const now = { jump: b(0), atk: b(2), dodge: b(1), throw: b(3), talk: b(12) || b(6), block: b(4) || b(5), pause: b(9), left: b(14) || ax < -0.5, right: b(15) || ax > 0.5, up: b(12) || ay < -0.5, down: b(13) || ay > 0.5 };
  const rose = k => now[k] && !pad.prev[k];
  if (Object.values(now).some(Boolean)) { initAudio(); if (Object.keys(now).some(rose)) { anyPress = true; padLast = true; } }
  if (rose('jump')) { jumpPress = true; confirmPress = true; } if (rose('atk')) atkPress = true; if (rose('dodge')) dodgePress = true; if (rose('throw')) throwPress = true; if (rose('talk')) talkPress = true; if (rose('pause')) pausePress = true;
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
    { k: 'throw', x: W - b * 5.0, y: H - b * 2.6, w: b * 1.2, h: b * 1.2, label: 'F', skill: 'any' },
  ];
}
const zoneOn = z => !z.skill || (z.skill === 'any' ? !!skillNow() : (PROG.items && PROG.items[z.skill]));
function zoneAt(x, y) { for (const z of touchZones) if (zoneOn(z) && x >= z.x && x < z.x + z.w && y >= z.y && y < z.y + z.h) return z.k; return null; }
function touchPress(k) { initAudio(); anyPress = true; if (k === 'jump') { jumpPress = true; confirmPress = true; } if (k === 'atk') atkPress = true; if (k === 'dodge') dodgePress = true; if (k === 'throw') throwPress = true; if (k === 'up') talkPress = true; if (k === 'pause') pausePress = true; if (k === 'left') leftPress = true; if (k === 'right') rightPress = true; if (k === 'up') upPress = true; if (k === 'down') downPress = true; if (k !== 'pause' && k !== 'up') keys[k] = true; }
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
  for (const z of touchZones) { if (!zoneOn(z)) continue; const held = [...touches.values()].includes(z.k); dg.fillStyle = held ? 'rgba(143,209,96,0.55)' : 'rgba(20,16,30,0.42)'; dg.beginPath(); dg.roundRect(z.x, z.y, z.w, z.h, z.w * 0.25); dg.fill(); dg.strokeStyle = 'rgba(255,246,224,0.6)'; dg.lineWidth = 2; dg.stroke(); dg.fillStyle = 'rgba(255,246,224,0.85)'; dg.fillText(z.label, z.x + z.w / 2, z.y + z.h / 2); }
}
function clearPresses() { jumpPress = atkPress = dodgePress = pausePress = anyPress = upPress = downPress = leftPress = rightPress = confirmPress = throwPress = talkPress = false; }

// ---------- collision ----------
const isSolid = (tx, ty) => { const t = tileAt(tx, ty); return t === T.SOLID || t === T.CRATE || t === T.PALISADE || t === T.PORT || t === T.CLIMB || t === T.SOFT || t === T.ICE || t === T.WEB; };
function bakeKiteIcon() { const [c, g] = canvas(14, 20); g.fillStyle = '#5aa0e0'; g.beginPath(); g.moveTo(7, 0); g.lineTo(13, 6); g.lineTo(7, 14); g.lineTo(1, 6); g.closePath(); g.fill(); g.fillStyle = '#2a2230'; g.fillRect(7, 0, 1, 14); g.fillRect(1, 6, 12, 1); g.fillStyle = '#ffd36b'; g.fillRect(6, 15, 2, 2); g.fillRect(8, 18, 2, 2); return c; }
function bakeIceTile() { const [c, g] = canvas(16, 16); g.fillStyle = '#9fd0e8'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#c8ecf8'; g.fillRect(2, 1, 5, 3); g.fillRect(9, 6, 4, 2); g.fillRect(3, 10, 3, 4); g.fillStyle = '#6aa0c0'; g.fillRect(0, 15, 16, 1); g.fillRect(15, 0, 1, 16); g.fillRect(7, 3, 1, 6); g.fillRect(10, 11, 4, 1); g.fillStyle = '#eefaff'; g.fillRect(1, 0, 14, 1); return c; }
function bakeWebTile() { const [c, g] = canvas(16, 16); g.fillStyle = 'rgba(40,40,52,0.35)'; g.fillRect(0, 0, 16, 16); g.strokeStyle = '#e8e8f0'; g.lineWidth = 1; g.beginPath(); for (let k = 0; k < 16; k += 5) { g.moveTo(0, k + 0.5); g.lineTo(16, k + 0.5); g.moveTo(k + 0.5, 0); g.lineTo(k + 0.5, 16); } g.moveTo(0, 0); g.lineTo(16, 16); g.moveTo(16, 0); g.lineTo(0, 16); g.stroke(); return c; }
const isOneWay = t => t === T.ONEWAY || t === T.REED || t === T.PLANK || t === T.NET || t === T.BOUNCER || t === T.SHELF || t === T.RAIL || t === T.CRYST;
function moveBody(b, dx, dy, allowDrop = false) {
  const r = { hitX: false, hitY: false, ground: false, groundTile: null };
  if (dx !== 0) {
    const dir = Math.sign(dx); let nx = b.x + dx;
    const edge = dir > 0 ? nx + b.w / 2 - 0.01 : nx - b.w / 2;
    const tx = Math.floor(edge / TS);
    // LEDGE ASSIST, the knight's only: in the air, a ledge whose lip is within a few pixels of your feet is a step
    // up, not a wall. A full jump clears three rows by half a pixel; without this a three-row jump was a coin toss.
    if (b === P && !P.fly && !P.ground && P.vy > -90) { const fr = Math.floor((b.y - 0.5) / TS), lip = fr * TS;
      if (isSolid(tx, fr) && b.y - lip > 0 && b.y - lip <= 6) { let room = true; for (let ty = Math.floor((lip - b.h) / TS); ty < fr && room; ty++) if (isSolid(tx, ty) || isSolid(Math.floor(b.x / TS), ty)) room = false; if (room) { b.y = lip; P.vy = Math.min(P.vy, 0); } } }
    const top = b.y - b.h + 0.5, bot = b.y - 0.5;
    const ty0 = Math.floor(top / TS), ty1 = Math.floor(bot / TS);
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
        if (t === T.SOLID || t === T.CRATE || t === T.PALISADE || t === T.PORT || t === T.CLIMB || t === T.SOFT) { ny = ty * TS; r.ground = true; r.hitY = true; r.groundTile = t; break; }
        if (isOneWay(t) && !allowDrop && b.y <= ty * TS + (b === P && !P.fly ? 6 : 0.5)) { ny = ty * TS; r.ground = true; r.groundTile = t; } // the knight is caught by a jump-through he is a few pixels short of
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
  n = Math.max(1, Math.round(n * partScale()));
  for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, s = spd * (0.4 + Math.random() * 0.8); parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - spd * 0.3, life: life * (0.6 + Math.random() * 0.6), max: life, col: cols[(Math.random() * cols.length) | 0], size, grav }); }
}
function sparks(x, y, dir, n = 8) { for (let i = 0; i < n; i++) { const a = (Math.random() - 0.5) * 1.6 + (dir > 0 ? 0 : Math.PI); const s = 90 + Math.random() * 120; parts.push({ streak: true,  x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 30, life: 0.25 + Math.random() * 0.2, max: 0.4, col: i & 1 ? '#fff6c8' : '#ffd36b', size: i % 3 === 0 ? 2 : 1, grav: 200 }); } }
// FIRE, LIGHT AND SPARKS. Particles with a life of their own: drawParts() ramps a flame from white-hot through orange
// and red to a puff of smoke, draws a spark as a streak along its flight, and lays a soft glow over anything hot.
function flame(x, y, n = 4, spread = 5, up = 50, size = 3) { const m = Math.max(1, Math.round(n * partScale())); for (let i = 0; i < m; i++) { const l = 0.3 + Math.random() * 0.35; parts.push({ x: x + (Math.random() - 0.5) * spread * 2, y: y + (Math.random() - 0.5) * spread, vx: (Math.random() - 0.5) * 24, vy: -up * (0.5 + Math.random() * 0.7), life: l, max: l, col: '#ffd36b', size, grav: -30, fire: true, drag: 1.5 }); } }
function motes(x, y, n = 6, spread = 10, cols = ['#fff6c8', '#ffd36b']) { const m = Math.max(1, Math.round(n * partScale())); for (let i = 0; i < m; i++) { const l = 0.7 + Math.random() * 0.5; parts.push({ x: x + (Math.random() - 0.5) * spread * 2, y: y + (Math.random() - 0.5) * spread, vx: (Math.random() - 0.5) * 16, vy: -20 - Math.random() * 40, life: l, max: l, col: cols[(Math.random() * cols.length) | 0], size: Math.random() < 0.3 ? 2 : 1, grav: -8, glow: true }); } }
function streaks(x, y, n = 6, cols = ['#fff6c8', '#ffd36b'], spd = 160) { const m = Math.max(1, Math.round(n * partScale())); for (let i = 0; i < m; i++) { const a = Math.random() * Math.PI * 2, v = spd * (0.5 + Math.random() * 0.6), l = 0.22 + Math.random() * 0.18; parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, life: l, max: l, col: cols[(Math.random() * cols.length) | 0], size: 1, grav: 260, streak: true }); } }
function smoke(x, y, n = 4, spread = 8) { for (let i = 0; i < n; i++) { const l = 0.8 + Math.random() * 0.5; parts.push({ x: x + (Math.random() - 0.5) * spread * 2, y: y + (Math.random() - 0.5) * spread, vx: (Math.random() - 0.5) * 14, vy: -18 - Math.random() * 16, life: l, max: l, col: Math.random() < 0.5 ? '#5a5460' : '#4a4450', size: 3, grav: -6, drag: 0.8 }); } }
const HOT = new Set(['#fff6c8', '#ffd36b', '#ff9a5c', '#ff6b2c', '#dfffa0', '#c9a0ff', '#f0e4ff', '#bfe6f5', '#eefaff', '#fff6e0', '#9ab8ff', '#ffd34a']);
function drawParts(cx, cy) {
  for (const p of parts) { const f = Math.max(0, p.life / p.max), x = Math.round(p.x - cx), y = Math.round(p.y - cy);
    if (x < -8 || x > VW + 8 || y < -8 || y > VH + 8) continue;
    if (p.fire) { const c = f > 0.72 ? '#fff6c8' : f > 0.5 ? '#ffd36b' : f > 0.32 ? '#ff9a5c' : f > 0.18 ? '#c9463d' : '#4a4450'; const sz = Math.max(1, Math.round(p.size * (f > 0.18 ? 0.5 + f : 1.4 + (0.18 - f) * 4)));
      g.globalAlpha = f > 0.18 ? 1 : f / 0.18 * 0.5; g.fillStyle = c; g.fillRect(x - (sz >> 1), y - (sz >> 1), sz, sz); continue; }
    if (p.streak) { g.globalAlpha = Math.min(1, f * 2); g.strokeStyle = p.col; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 0.5, y + 0.5); g.lineTo(x + 0.5 - p.vx * 0.035, y + 0.5 - p.vy * 0.035); g.stroke(); continue; }
    g.globalAlpha = Math.min(1, f * 2); g.fillStyle = p.col; g.fillRect(x, y, p.size, p.size); }
  if (SET.parts !== 'low') { g.globalCompositeOperation = 'lighter'; // the hot ones glow
    for (const p of parts) { const f = Math.max(0, p.life / p.max); if (!(p.fire ? f > 0.32 : p.glow || HOT.has(p.col))) continue; const x = Math.round(p.x - cx), y = Math.round(p.y - cy); if (x < -8 || x > VW + 8 || y < -8 || y > VH + 8) continue;
      const r = (p.size || 1) + (p.fire ? 3 : 2); g.globalAlpha = (p.fire ? 0.16 : 0.22) * Math.min(1, f * 2); g.fillStyle = p.fire ? '#ff9a5c' : p.col; g.fillRect(x - r + 1, y - r + 1, r * 2 - 2 + (p.size || 1), r * 2 - 2 + (p.size || 1)); }
    g.globalCompositeOperation = 'source-over'; }
  g.globalAlpha = 1;
}
function dust(x, y, n = 4) { for (let i = 0; i < n; i++) parts.push({ x: x + (Math.random() - 0.5) * 8, y, vx: (Math.random() - 0.5) * 40, vy: -20 - Math.random() * 20, life: 0.3, max: 0.3, col: '#c9b27c', size: 2, grav: 60 }); }
function number(x, y, txt, col) { if (SET.colorSafe) col = col === '#ff6b6b' ? '#5aa8ff' : col === '#ff9a5c' ? '#c080ff' : col; if (!SET.numbers && typeof txt === 'number') return; if (typeof txt === 'string' && /[A-Z]/.test(txt)) return; /* words never float in play: they belong on signs and with the folk */ nums.push({ x, y, txt, col, life: 0.75, vy: -38 }); }
function hitstop(t) { if (SET.hitstop) stop = Math.max(stop, t); }
function shakeCam(n, k = 0) { const a = SET.shakeAmt === undefined ? (SET.shake ? 1 : 0) : SET.shakeAmt; if (a > 0) { shake = Math.max(shake, n * a); kick += k * a; } }
function squash(sx, sy, t = 0.12) { P.sqX = sx; P.sqY = sy; P.sqT = t; }
function zoomKick(amt, t = 0.14) { if (SET.shake && !SET.reduceMotion) { zoomAmt = Math.max(zoomAmt, amt); zoomT = Math.max(zoomT, t); } }
const invulnerable = () => P.inv > 0 || P.grace > 0 || P.dodge > 0 || SET.invincible || (window.BK && window.BK.god);
const COLS = { dummy: ['#c9b27c', '#8a5a32', '#e8dcc0'], sweep: ['#2a2630', '#5a7a3a', '#b8a888'], stormshaman: ['#6faa4a', '#c9a0ff', '#e8dcc0'], crow: ['#2a2433', '#4a4458', '#ff4a3a'], horn: ['#6faa4a', '#e0b040', '#c9463d'], bale: ['#d9b44a', '#8a6a32', '#9a5aa8'], shardling: ['#bfe6f5', '#eefaff', '#7aa8c8'], suncatcher: ['#bfe6f5', '#ffe6a0', '#7aa8c8'], roc: ['#8a8478', '#bfe6f5', '#c9a83a'], sentry: ['#6faa4a', '#5a2a7a', '#e0b040'], gqueen: ['#5a2a7a', '#6faa4a', '#e0b040'], hearthgob: ['#6faa4a', '#c9463d', '#8a5a32'], cutter: ['#6faa4a', '#8a919c', '#5d4a8a'], lance: ['#9aa3b0', '#c9463d', '#e0b040'], snuffer: ['#3a3448', '#8a5a32', '#ffd36b'], sailer: ['#6faa4a', '#c9b27c', '#c9463d'], miner: ['#6faa4a', '#c9b27c', '#8a919c'], bat: ['#3a3448', '#5a5468'], grub: ['#b8d878', '#e8ff9a', '#7a9a48'], rockgoblin: ['#6faa4a', '#8a919c', '#ffd36b'], golem: ['#bfe6f5', '#7aa8c8', '#ff7ab8'], kite: ['#c9463d', '#ffd36b', '#6faa4a'], hare: ['#8a6a4a', '#e8dcc0'], wight: ['#c8d8c8', '#8aa08a'], windcaller: ['#6faa4a', '#c9a0ff', '#e8dcc0'], forgemaster: ['#8a919c', '#6a4a3a', '#ffd36b'], greathound: ['#5a4a3a', '#3a2e22', '#ff4a3a'], spider: ['#3a3448', '#5a5468'], owl: ['#7a5a3a', '#e8dcc0', '#ffd36b'], troll: ['#6a7a5a', '#3f6e2c', '#46543a'], harpy: ['#8a8478', '#c9a83a', '#5a5448'], goat: ['#e8e0d0', '#6faa4a', '#7a5a8a'], ram: ['#d8d0c0', '#c9a83a', '#c9463d'], thief: ['#6faa4a', '#7a5a2a', '#c9463d'], pike: ['#6faa4a', '#5a4a3a', '#c9d1dc'], folk: ['#6faa4a', '#c9b27c'], master: ['#8a7a68', '#5a4a3a', '#c9463d'], bearer: ['#6faa4a', '#c9463d'], king: ['#c9463d', '#ffd36b', '#6faa4a'], sporeling: ['#9a5aa8', '#f0e6c8', '#6a3a7a'], lurker: ['#7a5aa8', '#f0e6c8', '#c9463d'], drone: ['#e8e0f0', '#c8bcb0'], shaman: ['#4aa0b0', '#f0e6c8', '#2a6a7a'], gill: ['#9a5aa8', '#e0b0f0', '#ffd0ff'], heart: ['#ff7a9a', '#ffd0ff', '#c9463d'], mother: ['#8a8a54', '#b8c060', '#4a3a2a'], sapper: ['#6faa4a', '#1b1626', '#c9463d'], brute: ['#6faa4a', '#5d4a8a', '#6b4a2a'], hound: ['#5a4a3a', '#3a2e22', '#c9463d'], chief: ['#8f2f28', '#c9d1dc', '#6faa4a', '#e0b040'], fox: ['#d9782a', '#fff6e0'], hopper: ['#5a9a3a', '#d8e0a0', '#3a6a2a'], archer: ['#3f5a33', '#6b4a2a', '#6faa4a'], frog: ['#5a9a3a', '#d8e0a0', '#c9463d'], sprig: ['#6faa4a', '#c9463d', '#3f6e2c'], shield: ['#5d4a8a', '#8a5a32', '#c9d1dc'], spit: ['#c9463d', '#f0e6c8', '#ff9a5c'], thorn: ['#6faa4a', '#c9d1dc', '#c9463d'], wasp: ['#e0b040', '#1b1626', '#dfe8ff'], queen: ['#e0b040', '#1b1626', '#fff1a0', '#c9463d'] };

// ---------- damage ----------
function rumble(ms, mag) { if (!SET.rumble) return; try { const gps = navigator.getGamepads ? navigator.getGamepads() : []; for (const gp of gps) if (gp && gp.vibrationActuator && gp.vibrationActuator.playEffect) { gp.vibrationActuator.playEffect('dual-rumble', { duration: ms, strongMagnitude: mag, weakMagnitude: mag * 0.6 }); break; } } catch {} }
// where a sound is, for the mixer: full and centred on screen, panned and fading off it (bosses never fade far)
function sndAt(x, y, big) { const dx = x - (camX + VW / 2), dy = y - (camY + VH / 2), d = Math.hypot(dx, dy * 1.3), near = VW * 0.55;
  return { pan: Math.max(-0.7, Math.min(0.7, dx / (VW * 0.75))), v: d <= near ? 1 : Math.max(big ? 0.6 : 0.18, 1 - (d - near) / (VW * 0.9)) }; }
// the player's own sounds are never placed: whatever hurts them, the cry is theirs
function damagePlayer(fromX, dmg, o) { const was = emitNow(); emitAt(null); try { return damagePlayer0(fromX, dmg, o); } finally { emitAt(was); } }
// whoever is near the blow that just landed (for the talents that answer it)
const nearFoe = x => { let b = null, bd = 60; for (const e of enemies) if (e.alive && !e.harmless) { const d = Math.abs(e.x - x) + Math.abs(e.y - P.y) * 0.5; if (d < bd && Math.abs(e.x - P.x) < 70) { bd = d; b = e; } } return b; };
function reflectSeed(s) { s.dead = false; s.reflected = true; s.g = 0; s.life = 2;
  if (s.owner && s.owner.alive) { const dx = s.owner.x - s.x, dy = (s.owner.y - (s.owner.h || 10) / 2) - s.y, d = Math.hypot(dx, dy) || 1, sp = Math.max(200, Math.hypot(s.vx, s.vy)); s.vx = dx / d * sp; s.vy = dy / d * sp; }
  else { s.vx = -s.vx * 1.1 || -P.face * 200; s.vy = -Math.abs(s.vy) * 0.3; }
  SFX.parry(); streaks(s.x, s.y, 5, ['#fff6e0', '#c9d1dc'], 120); }
function phoenixBurst() { SFX.pyreBoom(); shakeCam(8); zoomKick(1.1, 0.3); ringAt(P.x, P.y - 10, 50, '#ff6b2c', 0.5); flame(P.x, P.y - 10, 24, 14, 110, 4); smoke(P.x, P.y - 10, 6, 10);
  for (const e of enemies) if (e.alive && !e.harmless && Math.abs(e.x - P.x) < 64 && Math.abs(e.y - P.y) < 50) { hurtEnemy(e, 20, P.x, false); e.burn = Math.max(e.burn || 0, 2); } }
function damagePlayer0(fromX, dmg, { up = false, unblockable = false } = {}) {
  if (!(dmg > 0)) dmg = 10; // a missing table entry must never poison the health bar
  if (P.relic === 'banner') dmg = Math.max(1, Math.round(dmg * 0.8)); // the Queen's banner: they pull their blows
  if (P.dead || invulnerable()) return false;
  const frontA = Math.sign(fromX - P.x) === P.face || fromX === P.x;
  if (P.aegis && frontA && !unblockable) { gainLight(5); trialEvent('aegis'); P.st = Math.max(0, P.st - 8 * (1 - 0.15 * tal('stalwart'))); if (tal('retribution')) { const f = nearFoe(fromX); if (f && !f.maxHp) { f.stagger = Math.max(f.stagger || 0, 0.9); f.flash = 0.15; } } P.stDelay = ST.delay; hitstop(0.05); shakeCam(1.5); SFX.aegis(); ringAt(P.x, P.y - 10, 16, '#ffd36b', 0.25); streaks(P.x + P.face * 10, P.y - 12, 8, ['#fff6c8', '#ffd36b'], 150); const sd = Math.sign(fromX - P.x) || P.face; sparks(P.x + sd * 11, P.y - 10, sd, 6); return 'blocked'; } // the ward stops everything, even what a shield cannot
  const front = Math.sign(fromX - P.x) === P.face || fromX === P.x;
  if (P.block && front && !unblockable) {
    const perfect = tal('parry') && (P.blockT || 0) < 0.2, bc = perfect ? 0 : Math.round(ST.blockHit * (1 - 0.15 * tal('steady')));
    if (P.st >= bc) {
      P.st -= bc; P.stDelay = ST.delay; blocks++; trialEvent('block'); if (tal('riposte')) P.riposteT = 1;
      if (perfect) { const f = nearFoe(fromX); if (f && !f.maxHp) { f.stagger = Math.max(f.stagger || 0, 1); f.flash = 0.15; } SFX.parry(); ringAt(P.x + P.face * 9, P.y - 9, 16, '#fff6e0', 0.25); }
      P.vx = -P.face * 90; hitstop(0.05); shakeCam(1.5, -P.face * 2); SFX.block(); impactAt(P.x + P.face * 9, P.y - 9, 'steel'); ringAt(P.x + P.face * 8, P.y - 9, 10, '#c9d1dc', 0.2);
      sparks(P.x + P.face * 9, P.y - 8, P.face, 7);
      return 'blocked';
    }
    P.st = 0; P.stFlash = 0.5; P.block = false; SFX.guardBreak(); SFX.gasp(); shakeCam(5, -P.face * 4); hitstop(0.1);
    dmg = Math.ceil(dmg / 2); P.hurt = 0.55;
    number(P.x, P.y - 22, 'GUARD BREAK', '#ffd36b');
  }
  if (L && L.trial) { P.inv = 0.8; P.hurt = 0.2; flash = 0.08; SFX.pHurt(); P.vx = (Math.sign(P.x - fromX) || -P.face) * 120; P.vy = -120; P.ground = false; return 'hit'; } // a trial never hurts
  dmg = Math.max(1, Math.round(dmg * diffNow().take * (1 + 0.4 * tierOf(curId()))));
  if (PROG.charm === 'iron') dmg = Math.max(1, Math.round(dmg * 0.8));
  dmg = Math.max(1, Math.round(dmg * (PROG.items.mail ? 0.9 : 1) * (PROG.items.plate ? 0.9 : 1) * (isPyro() && tal('heatShield') && (P.heat || 0) >= 50 ? 0.75 : 1)));
  P.hp -= dmg; P.inv = 1.1; P.hurt = Math.max(P.hurt, 0.35); P.atk = -1; P.plunge = false; P.block = false; impactAt(P.x, P.y - 9, 'red');
  const dir = Math.sign(P.x - fromX) || -P.face;
  P.vx = dir * 150; P.vy = up ? -230 : -170; P.ground = false;
  hitstop(0.08); shakeCam(5, dir * 3); flash = 0.14; SFX.pHurt(); rumble(180, 0.8);
  burst(P.x, P.y - 8, 8, ['#e04848', '#ffd36b'], 60, 0.4);
  number(P.x, P.y - 20, '-' + dmg, '#ff6b6b'); hitsTaken++;
  if (isPyro() && tal('emberSkin')) { const f = nearFoe(fromX); if (f) { f.burn = Math.max(f.burn || 0, 2.4); flame(f.x, f.y - f.h / 2, 4, 4, 40, 2); } }
  if (P.hp <= 0 && isPyro() && tal('phoenix') && !P.phoenixUsed) { P.phoenixUsed = true; P.hp = Math.min(P.maxHp, 20); P.inv = 2; phoenixBurst(); }
  if (P.hp < P.maxHp * 0.25 && (PROG.tonics || 0) > 0) { PROG.tonics--; P.hp = Math.min(P.maxHp, Math.max(0, P.hp) + 45); SFX.mend(); motes(P.x, P.y - 10, 12, 8, ['#ff9a9a', '#ffd0d0', '#fff6e0']); ringAt(P.x, P.y - 10, 16, '#ff9a9a', 0.35); saveProgress(); } // a RED TONIC, drunk at once
  if (isPaladin() && tal('martyr') && !P.martyrUsed && P.hp > 0 && P.hp < P.maxHp * 0.25) { P.martyrUsed = true; P.light = 99; gainLight(1); motes(P.x, P.y - 12, 14, 10); }
  if (P.hp > 0) crowdJeer(false);
  if (P.hp <= 0) die();
  return 'hit';
}
function die() {
  if (P.dead) return;
  P.dead = 1.2; deaths++; P.hp = 0; SFX.pDie(); SFX.jet(false); shakeCam(7); crowdJeer(true); if (SET.iron) { lives--; if (lives > 0) number(P.x, P.y - 30, lives + (lives === 1 ? ' LIFE LEFT' : ' LIVES LEFT'), '#ff6b6b'); }
  burst(P.x, P.y - 8, 22, ['#c9d1dc', '#3d5aa8', '#c9463d'], 120, 0.9);
}
// Per-enemy death: a corpse object animates the fall so every foe dies its own way.
function spawnCorpse(e, dir) {
  const c = { t: e.t, color: e.color, x: e.x, y: e.y, vx: 0, vy: 0, rot: 0, spin: 0, face: e.face, life: 1, max: 1, frame: 0, grav: 900, bounced: false, ground: false };
  switch (e.t) {
    case 'sprig': case 'archer': Object.assign(c, { vx: dir * 90, vy: -190, spin: dir * 14, life: 1.0, max: 1.0 }); SFX.gobDie(); break;
    case 'hopper': Object.assign(c, { vx: dir * 70, vy: -160, spin: dir * 10, life: 0.9, max: 0.9 }); SFX.ribbit(); break;
    case 'sapper': Object.assign(c, { vx: dir * 90, vy: -190, spin: dir * 14, life: 1.0, max: 1.0 }); SFX.gobDie(); bombs.push({ x: e.x, y: e.y - 4, vx: 0, vy: -30, fuse: 0.6 }); break;
    case 'hearthgob': Object.assign(c, { vx: dir * 40, vy: -130, spin: dir * 5, life: 1.1, max: 1.1 }); SFX.gobDie(); break;
    case 'cutter': Object.assign(c, { vx: dir * 40, vy: -130, spin: dir * 5, life: 1.1, max: 1.1 }); SFX.gobDie(); break;
    case 'lance': Object.assign(c, { vx: dir * 30, vy: -170, spin: dir * 2, life: 1.8, max: 1.8 }); SFX.heavy(); break;
    case 'snuffer': Object.assign(c, { vx: dir * 40, vy: -140, spin: dir * 5, life: 1.1, max: 1.1 }); break;
    case 'sailer': Object.assign(c, { vx: dir * 50, vy: -110, spin: dir * 4, life: 1.2, max: 1.2 }); break;
    case 'troll': Object.assign(c, { vx: dir * 30, vy: -120, spin: dir * 3, life: 1.3, max: 1.3 }); SFX.thump(); break;
    case 'greathound': Object.assign(c, { vx: dir * 40, vy: -160, spin: dir * 2, life: 1.4, max: 1.4 }); SFX.yelp(); break;
    case 'spider': Object.assign(c, { vx: dir * 30, vy: -80, spin: dir * 10, life: 0.9, max: 0.9, grav: 600 }); SFX.hiss(); break;
    case 'grub': Object.assign(c, { vx: dir * 20, vy: -60, spin: 0, life: 0.7, max: 0.7 }); SFX.grubDie(); break;
    case 'golem': Object.assign(c, { vx: 0, vy: -40, spin: 0, life: 1.6, max: 1.6 }); SFX.golemShatter(); break;
    case 'hare': Object.assign(c, { vx: dir * 60, vy: -120, spin: dir * 10, life: 0.8, max: 0.8 }); SFX.yelp(); break;
    case 'wight': Object.assign(c, { vx: 0, vy: -20, spin: 0, life: 0.6, max: 0.6, grav: -100 }); SFX.hiss(); break;
    case 'windcaller': Object.assign(c, { vx: dir * 60, vy: -150, spin: dir * 8, life: 1.2, max: 1.2 }); SFX.gobDie(); SFX.callerBlast(); break;
    case 'kite': Object.assign(c, { vx: dir * 40, vy: -40, spin: dir * 4, life: 1.2, max: 1.2, grav: 200 }); SFX.kiteChatter(); break;
    case 'rockgoblin': Object.assign(c, { vx: dir * 90, vy: -190, spin: dir * 14, life: 1.0, max: 1.0 }); SFX.gobDie(); SFX.rockLaugh(); break;
    case 'owl': Object.assign(c, { vx: dir * 20, vy: -100, spin: dir * 1, life: 1.6, max: 1.6 }); SFX.screech(); break;
    case 'harpy': Object.assign(c, { vx: dir * 40, vy: -60, spin: dir * 8, life: 1.0, max: 1.0, grav: 500 }); SFX.screech(); break;
    case 'goat': Object.assign(c, { vx: dir * 60, vy: -140, spin: dir * 6, life: 1.0, max: 1.0 }); SFX.goatCry(); break;
    case 'ram': Object.assign(c, { vx: -dir * 10, vy: -100, spin: dir * 0.6, life: 1.8, max: 1.8, grav: 600, royal: true }); SFX.bellow(); SFX.roar(); break;
    case 'thief': Object.assign(c, { vx: dir * 100, vy: -170, spin: dir * 16, life: 1.0, max: 1.0 }); SFX.gobDie(); break;
    case 'bearer': Object.assign(c, { vx: dir * 80, vy: -160, spin: dir * 12, life: 0.9, max: 0.9 }); SFX.gobDie(); break;
    case 'pike': Object.assign(c, { vx: dir * 40, vy: -70, spin: 0, life: 1.1, max: 1.1, tip: true }); SFX.gobDie(); SFX.clank(); break;
    case 'folk': Object.assign(c, { vx: dir * 40, vy: -110, spin: dir * 6, life: 0.8, max: 0.8 }); break;
    case 'master': c.t = e.mounted ? 'master' : 'masterFoot'; Object.assign(c, { vx: -dir * 20, vy: -140, spin: dir * 3, life: 1.5, max: 1.5, grav: 600 }); SFX.gobDieLow(); SFX.yelp(); break;
    case 'king': c.t = 'kingUp'; Object.assign(c, { vx: -dir * 10, vy: -110, spin: dir * 0.7, life: 1.8, max: 1.8, grav: 600, royal: true }); SFX.gobDieLow(); SFX.roar(); break;
    case 'hound': Object.assign(c, { vx: dir * 60, vy: -120, spin: dir * 6, life: 0.9, max: 0.9 }); SFX.yelp(); break;
    case 'brute': Object.assign(c, { vx: dir * 30, vy: -80, spin: 0, life: 1.2, max: 1.2, tip: true }); SFX.gobDieLow(); break;
    case 'chief': Object.assign(c, { vx: -dir * 10, vy: -100, spin: dir * 0.6, life: 1.8, max: 1.8, grav: 600, royal: true }); SFX.gobDieLow(); SFX.roar(); break;
    case 'sporeling': case 'shaman': Object.assign(c, { vx: dir * 60, vy: -150, spin: dir * 8, life: 0.8, max: 0.8 }); SFX.squelch(); SFX.puff(); break;
    case 'lurker': Object.assign(c, { vx: 0, vy: -40, spin: 0, life: 0.7, max: 0.7, crumple: true }); SFX.squelch(); break;
    case 'drone': case 'gill': case 'heart': case 'mother': c.life = 0.01; if (e.t === 'drone') SFX.puff(); else SFX.squelch(); break;
    case 'shield': Object.assign(c, { vx: dir * 55, vy: -60, spin: 0, life: 1.1, max: 1.1, tip: true }); SFX.gobDie(); break;
    case 'wasp': Object.assign(c, { vx: dir * 30, vy: 10, spin: 11, life: 1.2, max: 1.2, wobble: true, grav: 500 }); SFX.chitter(); break;
    case 'thorn': Object.assign(c, { vx: dir * 80, vy: -170, spin: dir * 12, life: 1.0, max: 1.0 }); SFX.gobDie(); SFX.clatter(); break;
    case 'spit':
      corpses.push({ t: 'cap', x: e.x, y: e.y - 6, vx: dir * 40, vy: -210, rot: 0, spin: dir * 9, face: e.face, life: 1.0, max: 1.0, frame: 0, grav: 900 });
      Object.assign(c, { t: 'stem', vx: 0, vy: 0, spin: 0, life: 0.6, max: 0.6, grav: 0, crumple: true }); SFX.squelch(); break;
    case 'queen': Object.assign(c, { vx: -dir * 20, vy: -40, spin: dir * 1.5, life: 1.6, max: 1.6, grav: 500, royal: true }); break;
    case 'frog': Object.assign(c, { vx: -dir * 10, vy: -120, spin: dir * 0.8, life: 1.6, max: 1.6, grav: 600, royal: true }); break;
  }
  corpses.push(c);
}
// what the blade does besides cut
function swordEffect(e) {
  const w = sword();
  if (w.burn && e.alive && e.t !== 'drone') { e.burn = 1.2; }
  if (w.freeze && e.alive) { e.stagger = Math.max(e.stagger, 0.9); e.frozen = 0.9; burst(e.x, e.y - e.h / 2, 5, ['#bfe6f5', '#ffffff'], 30, 0.4, 0, 1); }
  if (w.leech && P.hp < P.maxHp) { P.hp = Math.min(P.maxHp, P.hp + 2); number(P.x, P.y - 24, '+2', '#8fd160'); }
  if (w.heavy && e.alive && e.t !== 'queen' && e.t !== 'frog' && e.t !== 'chief' && e.t !== 'mother' && e.t !== 'gill' && e.t !== 'heart') { e.vx = (Math.sign(e.x - P.x) || P.face) * 200; }
  if (w.gold && !e.alive) { PROG.coins = (PROG.coins || 0) + 1; earned++; number(e.x, e.y - e.h - 12, '+1 gold', '#ffd34a'); SFX.coin(); }
}
const ONE_HIT = new Set(['wasp', 'harpy', 'bat', 'kite', 'drone', 'crow']); // wings: one blow of anything brings it down
function hurtEnemy(e, dmg, fromX, plunge) { const was = emitNow(); emitAt(sndAt(e.x, e.y - e.h / 2, !!e.maxHp)); try { return hurtEnemy0(e, dmg, fromX, plunge); } finally { emitAt(was); } }
function hurtEnemy0(e, dmg, fromX, plunge) {
  if (e.t === 'dummy') { e.flash = 0.12; SFX.stone(); burst(e.x, e.y - 12, 6, COLS.dummy, 50, 0.4); if (dmg > 0) number(e.x, e.y - e.h - 6, Math.round(dmg), '#fff6e0'); return; } // straw takes it and stands
  if (L && L.trial && e.t === 'archer') { SFX.clank(); return; } // the trial's archer is there to shoot at you
  if (dmg > 0 && isPyro() && tal('brand') && e.burn > 0) dmg = Math.round(dmg * 1.5); // BRAND
  if (isPaladin() && e.t === 'wight') dmg *= 2; // the light is hard on the dead
  if (e.t === 'bale') { if (e.gone > 0) return; e.gone = 3; e.vx = 0; burst(e.x, e.y - 6, 14, COLS.bale, 70, 0.6); SFX.baleBurst(); return; } // a bale bursts, and another comes tumbling after
  if (ONE_HIT.has(e.t) && !e.maxHp && !e.big && !e.mini) dmg = Math.max(dmg, e.hp);
  if (e.t === 'king' && e.mode !== 'held' && !(e.open > 0)) { SFX.clank(); sparks(e.x + (Math.sign(fromX - e.x) || 1) * 20, e.y - 30, Math.sign(e.x - fromX) || 1, 5); return; } // his crown turns every blade: only a cage brings his head down
  if (e.t === 'bearer') { SFX.clank(); return; }
  if (e.t === 'gill' && mother && !mother.gillsOpen) { SFX.clank(); sparks(e.x, e.y - 6, Math.sign(e.x - fromX) || 1, 4); number(e.x, e.y - 18, 'SHE HOLDS HER BREATH', '#9aa39a'); P.grace = Math.max(P.grace, 0.3); return; }
  if (e.t === 'queen' && e.mode === 'winded') dmg *= 2;
  if (e.t === 'chief' && e.mode === 'planted') dmg *= 2;
  if (e.t === 'ram' && ramOpen(e)) dmg *= 2;
  if (e.t === 'heart') dmg = 1; // the heart counts hits, not damage: six of anything
  if (e.t === 'owl' && (e.mode === 'crash' || e.mode === 'grounded')) dmg *= 2;
  if (e.t === 'owl' && e.mode === 'sit') e.hits = (e.hits || 0) + 1;
  if (e.t === 'king' && e.mode === 'held') dmg *= 2; // held by a cage: his head is down
  if (e.t === 'windcaller' && !callerOpen(e)) { SFX.buzz(); return; } // between stones there is nothing to cut
  if (e.t === 'windcaller') e.hits = (e.hits || 0) + 1;
  if (e.t === 'gqueen') { if (e.mode === 'ceil' || e.mode === 'roofWait' || e.mode === 'sleep' || (e.phase === 1 && e.mode !== 'topple')) { SFX.clank(); sparks(e.x + (Math.sign(fromX - e.x) || 1) * 14, e.y - 40, Math.sign(e.x - fromX) || 1, 4); return; } if (gqOpen(e)) dmg = Math.round(dmg * 1.5); } // on her throne she is armoured by the whole court: bring the gallery down on her
  if (e.t === 'roc') { if (rocOpen(e)) dmg = Math.round(dmg * 1.5); else { dmg = Math.max(1, Math.round(dmg * 0.5)); if (Math.random() < 0.5) { sparks(e.x, e.y - 14, Math.sign(e.x - fromX) || 1, 3); } } } // in the air she is quick and hard to hurt; down, she is not
  if (e.t === 'kite' && e.mode !== 'fall') { e.mode = 'fall'; e.vy = -40; e.vx = (Math.sign(e.x - fromX) || 1) * 60; number(e.x, e.y - 40, 'THE STRING', '#ffd36b'); SFX.crack(); }
  if (e.t === 'golem') { const need = e.need || 'blue', cols = e.litCols || new Set(); const ok = need === 'both' ? cols.size >= 2 : cols.has(need); if (!ok) { SFX.clank(); sparks(e.x + (Math.sign(fromX - e.x) || 1) * 12, e.y - 18, Math.sign(e.x - fromX) || 1, 4); return; } } // dark crystal turns the blade; lit in the right colour, it bleeds
  if (e.t === 'golem' && e.mode === 'stagger') dmg *= 1.5;
  if (e.t === 'suncatcher') { if (!sunOpen(e) && !e.dimmed) { SFX.clank(); sparks(e.x + (Math.sign(fromX - e.x) || 1) * 14, e.y - 20, Math.sign(e.x - fromX) || 1, 4); number(e.x, e.y - 44, 'TOO BRIGHT TO TOUCH', '#9aa39a'); return; } if (e.dimmed) dmg = Math.round(dmg * 1.5); }
  if (e.t === 'lance') { if (lanceOpen(e)) { if (e.mode === 'planted') dmg = Math.round(dmg * 1.6); } else { SFX.clank(); sparks(e.x + (Math.sign(fromX - e.x) || 1) * 12, e.y - 18, Math.sign(e.x - fromX) || 1, 4); number(e.x, e.y - e.h - 8, 'HIS PLATE TURNS IT', '#9aa39a'); return; } }
  if (e.t === 'forgemaster') { if (forgeOpen(e)) dmg *= 2; else { dmg = Math.max(1, Math.round(dmg * 0.5)); SFX.clank(); sparks(e.x + (Math.sign(fromX - e.x) || 1) * 14, e.y - 16, Math.sign(e.x - fromX) || 1, 3); } } // his iron turns half of every cut; stunned or scalded he takes it doubled
  if (e.t === 'frog' && (e.mode === 'croak' || e.mode === 'dazed')) { dmg *= 2; if (e.mode === 'croak') number(e.x, e.y - e.h - 16, 'THROAT', '#8fd160'); }
  if (e.t === 'frog' && e.mode === 'idle') { e.idleHits = (e.idleHits || 0) + 1; if (e.idleHits >= 2) { e.idleHits = 0; e.mode = 'hopAway'; e.modeT = 0.2; } }
  if (e.t === 'frog' && plunge && e.mode !== 'dazed') { e.headHits = (e.headHits || 0) + 1; e.headT = 4; if (e.headHits >= 2 && e.mode === 'idle') { e.headHits = 0; e.mode = 'hopAway'; e.modeT = 0.1; } }
  e.hp -= dmg; e.flash = 0.12; if (e.t !== 'queen') e.stagger = 0.35; e.sq = 0.16;
  impactAt(e.x + (Math.sign(e.x - fromX) || 1) * -3, e.y - e.h / 2 - (plunge ? 4 : 0), plunge ? 'plunge' : 'hit');
  if (e.t === 'gill' || e.t === 'heart') P.grace = Math.max(P.grace, 0.7); else if (e.t === 'queen' || e.t === 'frog' || e.t === 'chief' || e.t === 'ram') P.grace = Math.max(P.grace, 0.3); // landing a hit on a boss is never punished
  if (e.t === 'thorn' && e.mode === 'charge') { e.mode = 'rest'; e.modeT = 0.7; }
  number(e.x, e.y - e.h - 6, dmg, plunge ? '#ffd36b' : '#fff6e0');
  const dir = Math.sign(e.x - fromX) || 1;
  if (SET.impact !== false) for (let i = 0; i < 3; i++) { const an = (Math.random() - 0.5) * 1.1; parts.push({ x: e.x, y: e.y - e.h / 2, vx: Math.cos(an) * dir * (260 + Math.random() * 120), vy: Math.sin(an) * 200 - 30, life: 0.12, max: 0.12, col: i ? '#fff6e0' : '#ffffff', size: 1, grav: 0 }); }
  if (!e.maxHp && e.alive && !isSolid(Math.floor((e.x + dir * (e.w / 2 + 3)) / TS), Math.floor((e.y - 4) / TS))) e.x += dir * 2;
  if (e.hp <= 0) {
    e.alive = false; kills++; startle(e); if (tal('reaper')) P.st = Math.min(P.maxSt, P.st + 3 * tal('reaper')); if (tal('wrath')) gainLight(5 * tal('wrath')); killFlash = 0.05; rumble(70, 0.35); ringAt(e.x, e.y - e.h / 2, e.t === 'queen' || e.t === 'frog' || e.t === 'chief' ? 40 : 16, COLS[e.t] ? COLS[e.t][0] : '#fff6e0'); { const cry = SFX.dieOf(e.t); if (cry) cry(); else SFX.kill(); } if (e.t === 'shield' || e.t === 'queen' || e.t === 'frog' || e.t === 'chief') SFX.heavy(); // every creature dies in its own voice
    { const big = e.t === 'queen' || e.t === 'frog' || e.t === 'chief' || e.t === 'king' || e.t === 'ram' || e.t === 'master'; hitstop(big ? 0.25 : 0.09); shakeCam(big ? 8 : 3, dir * 2); zoomKick(big ? 1.18 : 1.07, big ? 0.5 : 0.14); if (big) killFlash = 0.09; }
    burst(e.x, e.y - e.h / 2, e.t === 'queen' ? 40 : 12, COLS[e.t], 100, 0.6);
    sparks(e.x, e.y - e.h / 2, dir, 6);
    spawnCorpse(e, dir); beastSlain(e.t);
    if (PROG.charm === 'heart' && !e.harmless && P.hp > 0 && P.hp < P.maxHp) { P.hp = Math.min(P.maxHp, P.hp + 5); number(P.x, P.y - 30, '+5', '#8fd160'); }
    if (e.t === 'shardling') { burst(e.x, e.y - 6, 18, ['#bfe6f5', '#eefaff', '#7aa8c8'], 130, 0.7, 320, 2); ringAt(e.x, e.y - 6, 22, '#bfe6f5', 0.35); SFX.crack();
      for (const q of enemies) if (q.alive && q !== e && !q.harmless && Math.abs(q.x - e.x) < 26 && Math.abs(q.y - e.y) < 24) hurtEnemy(q, DMG.shardBurst, e.x, false);
      if (!P.dead && Math.abs(P.x - e.x) < 22 && Math.abs(P.y - e.y) < 22) damagePlayer(e.x, DMG.shardBurst); }
    if (e.t === 'sporeling') clouds2.push({ x: e.x, y: e.y - 5, r: 22, life: 3.5 });
    if (e.t === 'drone') clouds2.push({ x: e.x, y: e.y - 3, r: 18, life: 2.5 });
    if (e.t === 'gill' && mother) { number(e.x, e.y - 18, 'GILL SNAPS', '#e0b0f0'); { const tx = Math.floor(e.x / TS), ty = Math.floor(L.arena.floor / TS) - 1, i = ty * LW + tx; if (L.grid[i] === T.AIR) { L.grid[i] = T.BOUNCER; tileSpr[i] = null; resolveTiles(); number(e.x, L.arena.floor - 26, 'A CAP FALLS: A SPRING', '#8fd160'); burst(e.x, L.arena.floor - 8, 14, ['#e8e0d0', '#9a5aa8'], 70, 0.7); shakeCam(3); } } for (let i = 0; i < 2; i++) enemies.push({ t: 'sporeling', x: e.x + (i ? 14 : -14), y: e.y - 20, vx: 0, vy: -60, w: 8, h: 10, hp: EHP.sporeling, speed: 30, face: i ? 1 : -1, alive: true, dying: 0, anim: 0, flash: 0, stagger: 0.3 }); const left = enemies.filter(g => g.alive && g.t === 'gill').length; mother.rootT = Math.min(mother.rootT, 0.8); if (left === 0) { mother.mode = 'tip'; mother.modeT = 1.6; L.violet = true; for (const pr of props) if (pr.t === 'glow') pr.dark = 999; number(mother.x, mother.y - 110, 'SHE TIPS', '#ff7a9a'); SFX.roar(); SFX.dieOf('mother')(); shakeCam(8); zoomKick(1.1, 0.5); } }
    if (e.t === 'heart' && mother) { mother.alive = false; kills++; queenDies(mother); L.violet = false; L.healed = true; for (const pr of props) if (pr.t === 'glow') pr.dark = 0; number(mother.x, mother.y - 130, 'THE WOOD BREATHES AGAIN', '#8fd160'); burst(mother.x, mother.y - 60, 40, COLS.mother, 120, 1.2); }
    if (e.t === 'chief') chiefDies(); else if (!e.mini && (e.t === 'gqueen' || e.t === 'queen' || e.t === 'frog' || e.t === 'king' || e.t === 'ram' || e.t === 'owl' || e.t === 'forgemaster' || e.t === 'golem' || e.t === 'windcaller' || e.t === 'lance' || e.t === 'suncatcher' || e.t === 'roc')) queenDies(e);
    if (e.t === 'thief' && e.loot > 0) { for (let i = 0; i < e.loot + 3; i++) acorns.push({ x: e.x + (i - e.loot / 2) * 6, y: e.y - 10, got: false, ph: Math.random() * 6, crate: 'thief' + e.x + i, vy: -110 - Math.random() * 60 }); number(e.x, e.y - 24, 'WITH INTEREST', '#ffd34a'); SFX.coin(); }
    if (e.t === 'folk') number(e.x, e.y - 18, 'SHAME', '#9aa39a');
    if (e.t === 'greathound') { for (const h of enemies) if (h.alive && h.t === 'hound' && h.pack) { h.alive = false; burst(h.x, h.y - 3, 6, COLS.hound, 50, 0.4); } miniEnd(e); }
    if (miniActive && e.mini && L.mini && e.t === L.mini.boss) { shakeCam(7); zoomKick(1.14, 0.5); burst(e.x, e.y - e.h / 2, 22, COLS[e.t] || ['#e8dcc0'], 110, 0.9); miniEnd(e); }
  } else {
    if (e.t === 'shaman' && e.hp > 0) { burst(e.x, e.y - 6, 12, ['#4aa0b0', '#e8e0f0'], 70, 0.5); const dir2 = Math.sign(e.x - P.x) || 1; let nx = e.x + dir2 * 70; if (isSolid(Math.floor(nx / TS), Math.floor((e.y - 1) / TS)) || !isSolid(Math.floor(nx / TS), Math.floor((e.y + 1) / TS))) nx = e.x - dir2 * 70; e.x = nx; e.flash = 0.3; burst(e.x, e.y - 6, 12, ['#4aa0b0', '#e8e0f0'], 70, 0.5); number(e.x, e.y - 18, 'POOF', '#4aa0b0'); }
    const voice = SFX.hurtOf(e.t); if (voice) voice(); else SFX.hit(); // every creature is hurt in its own voice if (e.t === 'thorn' || e.t === 'sprig' || e.t === 'archer' || e.t === 'sapper' || e.t === 'shield' || e.t === 'brute' || e.t === 'chief') SFX.hit();
    hitstop(0.05); shakeCam(1.5, dir * 1.5);
    sparks(e.x - dir * 2, e.y - e.h / 2, dir, 5);
    if (e.t !== 'wasp' && e.t !== 'spit' && e.t !== 'queen' && e.t !== 'ram' && e.t !== 'harpy') e.vx = dir * (plunge ? 30 : 80);
    if (e.t === 'king' && e.phase === 1 && e.hp <= e.maxHp * 0.66) { e.phase = 2; e.y = L.arena.floor; e.mode = 'rise'; e.modeT = 1.3; e.h = 60; e.throne = { x: e.x, y: L.arena.floor }; number(e.x, e.y - 36, 'THE LITTER BREAKS. HE STANDS', '#ff6b6b'); SFX.heavy(); SFX.crack(); shakeCam(8); zoomKick(1.12, 0.4); burst(e.x, e.y, 16, ['#8b6a2a', '#c9b27c', '#c9463d'], 80, 0.7); }
    if (e.t === 'king' && e.phase === 2 && e.hp <= e.maxHp * 0.4) { e.phase = 3; e.throneT = 5; number(e.x, e.y - 70, 'THE KING RAGES', '#ff6b6b'); SFX.roar(); shakeCam(6); zoomKick(1.1, 0.3); for (const f of enemies) if (f.alive && f.t === 'folk' && f.court) f.cower = true; }
      if (e.t === 'suncatcher') { e.dimmed = Math.max(0, (e.dimmed || 0) - 1); if (e.dimmed <= 0 && e.mode === 'dim') { e.mode = 'still'; e.modeT = 0.4; e.stagger = 0; } }
    if (e.t === 'lance' && e.hp <= e.maxHp / 2 && e.phase === 1) { e.phase = 2; e.mode = 'rise'; e.modeT = 1.1; e.stagger = 1.1; e.sweepT = 1;
      number(e.x, e.y - e.h - 16, 'HE THROWS IT AWAY', '#ff6b6b'); SFX.roar(); SFX.clank(); shakeCam(8); zoomKick(1.12, 0.4);
      for (let k = 0; k < 12; k++) parts.push({ x: e.x, y: e.y - 20, vx: -e.face * (120 + Math.random() * 160), vy: -120 - Math.random() * 80, life: 1.4, max: 1.4, col: k % 2 ? '#8a5a32' : '#9aa3b0', size: 2, grav: 420 }); }
    if ((e.t === 'queen' || e.t === 'frog' || e.t === 'chief' || e.t === 'ram' || e.t === 'owl' || e.t === 'greathound' || e.t === 'forgemaster') && e.hp <= e.maxHp / 2 && e.phase === 1) { e.phase = 2; number(e.x, e.y - 24, 'ENRAGED', '#ff6b6b'); SFX.roar(); killFlash = 0.06; shakeCam(5); zoomKick(1.08, 0.3); }
  }
}
function breakCrate(tx, ty) {
  const i = ty * LW + tx; L.grid[i] = T.AIR; tileSpr[i] = null;
  SFX.crack(); hitstop(0.03); shakeCam(1.5);
  burst(tx * TS + 8, ty * TS + 8, 10, ['#8a5a32', '#a8743f', '#5c3a1d'], 80, 0.5, 350, 2);
  const key = tx + ',' + ty;
  if (!collectedCrates.has(key)) acorns.push({ x: tx * TS + 8, y: ty * TS + 8, got: false, ph: 0, crate: key, vy: -60 });
  if (!healCrates.has(key) && Math.random() < 0.3) { healCrates.add(key); healths.push({ x: tx * TS + 8, y: ty * TS + 8, vy: -140, t: 0 }); } // a crate sometimes holds a heart
}
let healths = []; const healCrates = new Set();
function updateHealths(dt) { for (const h of healths) { h.t += dt; h.vy = Math.min(300, h.vy + 700 * dt); const ny = h.y + h.vy * dt, tx = Math.floor(h.x / TS), ty = Math.floor(ny / TS);
    if (h.vy > 0 && (isSolid(tx, ty) || isOneWay(tileAt(tx, ty)))) { h.y = ty * TS; h.vy = 0; } else h.y = ny;
    if (!P.dead && P.hp < P.maxHp && Math.abs(P.x - h.x) < 10 && Math.abs(P.y - 8 - (h.y - 5)) < 14) { h.got = true; P.hp = Math.min(P.maxHp, P.hp + 20); SFX.mend(); number(P.x, P.y - 22, '+20', '#8fd160'); motes(h.x, h.y - 5, 10, 6, ['#ff9a9a', '#ffd0d0', '#fff6e0']); } }
  healths = healths.filter(h => !h.got && h.t < 25); }
function drawHealths(cx, cy) { for (const h of healths) { if (h.t > 21 && Math.floor(h.t * 8) % 2) continue; const x = Math.round(h.x - cx), y = Math.round(h.y - cy - 8 + Math.sin(h.t * 4) * 1.5); bloom(h.x - cx, h.y - cy - 5, 10, 0.3, 'warm'); g.drawImage(PROP.heart, x - Math.floor(PROP.heart.width / 2), y); } }

// ---------- player ----------
function surface() { // what is underfoot, for the step and the landing
  if (!L) return 'grass'; if ((L.pools || []).some(p => p.shallow && P.x > p.x0 && P.x < p.x1 && P.y > p.y + 2)) return 'water';
  const m = P.onMover; if (m && (m.kind === 'cart' || m.kind === 'orelift')) return 'iron'; if (m) return 'wood';
  const tx = Math.floor(P.x / TS), ty = Math.floor((P.y + 1) / TS), t = tileAt(tx, ty);
  if (t === T.RAIL) return 'iron'; if (t === T.CRYST) return 'stone'; if (t === T.ONEWAY || t === T.PLANK || t === T.SHELF) return 'wood';
  if (L.snowLine !== undefined && ty <= L.snowLine) return 'snow';
  if (L.dark || (L.stone || []).some(z => tx >= z[0] && tx <= z[1] && ty >= z[2] && ty <= z[3]) || (L.palette && (L.palette.dress === 'crag' || L.palette.hall))) return 'stone';
  return 'grass';
}
const JET_BASE = 56; const jetLen = () => Math.round(JET_BASE * (1 + 0.11 * tal('longFlame'))); // (LONG FLAME) // three and a half tiles of flame: a staff's reach, not a hose
// HEAT IS THE PYROMANCER'S DAMAGE. Everything she throws hits harder the hotter she is running,
// A full bar no longer overheats her: it banks, and the next press of C throws it all as THE PYRE.
const heatMul = () => 1 + (P.heat || 0) / 100 * 0.4; // up to +40% at a full bar: a bit, not half again
const heatDmg = n => Math.max(1, Math.round(n * heatMul() * (1 + 0.1 * tal('hotFlame')))); // (HOTTER FLAME)
function jetBox() { if (!P.jet) return null; const x0 = P.x + P.face * 8, x1 = P.x + P.face * (8 + jetLen()); return { l: Math.min(x0, x1), r: Math.max(x0, x1), t: P.y - 17, b: P.y - 1 }; }
const inJet = (x, y, pad = 6) => { const j = jetBox(); return !!j && x > j.l - pad && x < j.r + pad && y > j.t - pad && y < j.b + pad; };
function attackBox() {
  if (P.plunge) return { l: P.x - 10, r: P.x + 10, t: P.y - 6, b: P.y + 12 };
  if (isPyro() && P.atk >= 0.04 && P.atk < 0.18) return P.face > 0 ? { l: P.x + 2, r: P.x + 32, t: P.y - 15, b: P.y - 3 } : { l: P.x - 32, r: P.x - 2, t: P.y - 15, b: P.y - 3 }; // the staff thrusts: a lighter blow, a tile more reach
  if (isPaladin() && P.atk >= 0.06 && P.atk < 0.18) return P.face > 0 ? { l: P.x + 2, r: P.x + 26, t: P.y - 24, b: P.y + 1 } : { l: P.x - 26, r: P.x - 2, t: P.y - 24, b: P.y + 1 }; // the maul: over and down, a wide heavy arc
  if (P.atk >= 0.04 && P.atk < 0.16) return P.face > 0 ? { l: P.x + 2, r: P.x + 19, t: P.y - 17, b: P.y - 1 } : { l: P.x - 19, r: P.x - 2, t: P.y - 17, b: P.y - 1 };
  return null;
}
function spend(cost) {
  if (P.st < cost) { P.stFlash = 0.35; return false; }
  P.st -= cost; P.stDelay = ST.delay; return true;
}
function updatePlayer(dt) {
  if (P.dead) { P.dead -= dt; if (P.dead <= 0) { if (SET.iron && lives <= 0) { state = 'gameover'; setView('normal'); music.play(menuTrack()); SFX.roar(); } else respawn(); } return; }
  if (P.fly && flight) { for (const k of ['inv', 'grace', 'hurt', 'stFlash', 'sqT']) P[k] = Math.max(0, (P[k] || 0) - dt); P.hpShown += (P.hp - P.hpShown) * Math.min(1, dt * 6); flyPlayer(dt); return; }
  if (P.ground && ((keys.left && P.vx > 55) || (keys.right && P.vx < -55)) && !(P.skidT > 0) && !P.block) { P.skidT = 0.3; dust(P.x + Math.sign(P.vx) * 4, P.y, 6); SFX.land(); }
  if (throwPress && isPyro() && skillNow() === 'fireWall' && P.ground && !(P.slamCd > 0) && !P.dead && !(P.hurt > 0) && !(P.asleep > 0) && !(P.dodge > 0)) { if (spend(25)) { P.slamCd = cdOf('fireWall'); P.atk = -1; for (let i = 1; i <= 5; i++) fires.push({ x: P.x + P.face * i * 14, y: P.y, life: 3, delay: i * 0.08, own: true }); SFX.heavy(); SFX.puff(); number(P.x, P.y - 24, 'FIRE WALL', '#ff9a5c'); shakeCam(2); } else number(P.x, P.y - 22, 'TIRED', '#9aa39a'); }
  if (throwPress && isPyro() && skillNow() === 'cinderStep' && !(P.throwCd > 0) && !P.dead && !(P.hurt > 0) && !(P.asleep > 0) && !(P.dodge > 0)) { if (spend(20)) { P.throwCd = cdOf('cinderStep'); P.dodge = 0.3; P.vx = P.face * 320; P.inv = Math.max(P.inv, 0.4); P.cinderT = 0.3; streaks(P.x, P.y - 8, 8, ['#fff6c8', '#ffd36b', '#ff9a5c'], 160); for (let i = 0; i < 3; i++) fires.push({ x: P.x - P.face * i * 14, y: P.y, life: 1.6, delay: 0, own: true }); SFX.throwWhoosh(); number(P.x, P.y - 24, 'CINDER STEP', '#ff9a5c'); } else number(P.x, P.y - 22, 'TIRED', '#9aa39a'); }
  if (throwPress && skillNow() === 'risingCut' && !(P.throwCd > 0) && !P.dead && !(P.hurt > 0) && !(P.asleep > 0) && !(P.dodge > 0) && !P.plunge && !(P.riseUsed && !P.ground)) { if (spend(20)) { P.throwCd = cdOf('risingCut'); P.riseT = 0.3; P.riseUsed = true; P.vy = -335; P.ground = false; P.coyote = 0; P.onMover = null; P.canCut = false; P.block = false; P.atk = -1; P.hitSet.clear(); SFX.slash(); SFX.pPogo(); squash(0.8, 1.25, 0.12); dust(P.x, P.y, 6); ringAt(P.x, P.y - 10, 14, '#fff6e0', 0.2); streaks(P.x + P.face * 6, P.y - 16, 8, ['#fff6e0', '#c9d1dc'], 170); } else number(P.x, P.y - 22, 'TIRED', '#ffd36b'); } // RISING CUT: the blade goes up and so do you, and whatever it catches
  if (throwPress && isPyro() && skillNow() === 'vent' && !(P.throwCd > 0) && !P.dead && !(P.hurt > 0) && !(P.asleep > 0) && !(P.dodge > 0)) { if ((P.heat || 0) < 15) { SFX.buzz(); number(P.x, P.y - 22, 'COLD', '#9aa39a'); } else if (spend(15)) { const heat = P.heat; P.throwCd = cdOf('vent'); const dmg = Math.round(10 + heat * 0.5), R = 30 + heat * 0.25; P.heat = 0; P.overheat = 0; P.light = 0; P.atk = -1; ringAt(P.x, P.y - 8, R, '#ff9a5c', 0.35); for (let a = 0; a < 18; a++) { const an = a / 18 * Math.PI * 2, sp = 70 + heat * 1.2; parts.push({ x: P.x, y: P.y - 8, vx: Math.cos(an) * sp, vy: Math.sin(an) * sp, life: 0.45, max: 0.45, col: '#ffd36b', size: 3, grav: -20, fire: true, drag: 2.5 }); } smoke(P.x, P.y - 10, 5, 8); burst(P.x, P.y - 8, 18 + Math.round(heat / 6), ['#ff9a5c', '#ffd36b', '#ff6b2c'], 60 + heat, 0.5, 0, 2); shakeCam(3 + heat / 25); zoomKick(1.06, 0.15); SFX.heavy(); SFX.puff(); for (const e of enemies) if (e.alive && !e.harmless && Math.abs(e.x - P.x) < R && Math.abs(e.y - 6 - (P.y - 8)) < R) { const big = !!e.maxHp; hurtEnemy(e, big ? Math.round(dmg * 0.5) : dmg, P.x, false); if (!big) { e.burn = Math.max(e.burn || 0, 1.5); flinch(e); } } for (const s2 of seeds) if (!s2.dead && Math.abs(s2.x - P.x) < R && Math.abs(s2.y - P.y + 8) < R) { s2.dead = true; burst(s2.x, s2.y, 4, ['#ff9a5c'], 40, 0.3, 0, 1); } for (const pr of props) { if ((pr.t === 'minerlamp' || pr.t === 'lantern') && !pr.lit && Math.abs(pr.x - P.x) < R + 10 && Math.abs(pr.y - P.y) < R + 10) { pr.lit = true; pr.hits = 0; burst(pr.x, pr.y - 8, 8, ['#ffd36b', '#fff6c8'], 50, 0.5); SFX.spark(); } } } else number(P.x, P.y - 22, 'TIRED', '#9aa39a'); } // VENT: the heat bar is the ammunition
  if (throwPress && isPyro() && skillNow() === 'wisp' && !(P.throwCd > 0) && !P.dead && !(P.hurt > 0) && !(P.asleep > 0) && !(P.dodge > 0)) { if (spend(20)) { P.throwCd = cdOf('wisp'); wisp = { x: P.x, y: P.y - 14, t: 0, life: 8, cd: 0, target: null }; SFX.spark(); SFX.puff(); burst(P.x, P.y - 14, 8, ['#ffd36b', '#fff6c8'], 40, 0.4, 0, 1); } else number(P.x, P.y - 22, 'TIRED', '#9aa39a'); } // WISP: a flame that keeps you company
  if (P.cinderT > 0) { P.cinderT -= dt; flame(P.x - P.face * 4, P.y - 7, 2, 4, 30, 3); ghosts.push({ x: P.x, y: P.y, face: P.face, life: 0.12, frame: 1 }); } // the cinder step leaves fire where you were
  if (P.riseT > 0) { P.riseT -= dt; ghosts.push({ x: P.x, y: P.y, face: P.face, life: 0.16, frame: 1 }); const hb = { l: P.x - 11, r: P.x + 11, t: P.y - 36, b: P.y - 2 }; for (const e of enemies) { if (!e.alive || e.harmless || P.hitSet.has(e)) continue; if (overlap(hb, { l: e.x - e.w / 2, r: e.x + e.w / 2, t: e.y - e.h, b: e.y })) { P.hitSet.add(e); const big = !!e.maxHp; hurtEnemy(e, swordDmg() + 4, P.x, false); if (!big && e.t !== 'king' && e.t !== 'mother') { e.vy = -240; e.y -= 2; e.stagger = Math.max(e.stagger || 0, 0.7); e.air = true; } sparks(e.x, e.y - e.h / 2, P.face, 6); hitstop(0.05); } } }
  if (P.ground) P.riseUsed = false;
  // THE PALADIN'S SKILLS
  if (throwPress && isPaladin() && skillNow() === 'consecrate' && P.ground && !(P.slamCd > 0) && !P.dead && !(P.hurt > 0) && !(P.asleep > 0) && !(P.dodge > 0)) { if (spend(25)) { P.slamCd = cdOf('consecrate'); hallows.push({ x: P.x, y: P.y, life: 4 + tal('consecrate'), r: 40, tick: 0 }); SFX.mend(); SFX.heavy(); ringAt(P.x, P.y - 4, 40, '#ffd36b', 0.5); motes(P.x, P.y - 6, 14, 30); P.castT = 0.3; } else number(P.x, P.y - 22, 'TIRED', '#9aa39a'); }
  if (throwPress && isPaladin() && skillNow() === 'holyCharge' && !(P.throwCd > 0) && !P.dead && !(P.hurt > 0) && !(P.asleep > 0) && !(P.dodge > 0)) { if (spend(20)) { P.throwCd = cdOf('holyCharge'); P.chargeT = 0.3; P.dodge = 0.3; P.vx = P.face * 330; P.inv = Math.max(P.inv, 0.4); P.chargeHit = new Set(); SFX.throwWhoosh(); SFX.aegis(); streaks(P.x, P.y - 10, 8, ['#fff6c8', '#ffd36b'], 160); } else number(P.x, P.y - 22, 'TIRED', '#9aa39a'); }
  if (throwPress && isPaladin() && skillNow() === 'blessedHammer' && !(P.throwCd > 0) && !P.dead && !(P.hurt > 0) && !(P.asleep > 0) && !(P.dodge > 0)) { if (spend(15)) { P.throwCd = cdOf('blessedHammer'); hammers.push({ x0: P.x, y0: P.y - 12, dir: P.face, t: 0, x: P.x, y: P.y - 12, hit: new Map() }); SFX.throwWhoosh(); SFX.lightFull(); P.castT = 0.25; } else number(P.x, P.y - 22, 'TIRED', '#9aa39a'); }
  if (P.chargeT > 0) { P.chargeT -= dt; P.vx = P.face * 330; if (Math.random() < dt * 40) parts.push({ x: P.x - P.face * 6, y: P.y - 4 - Math.random() * 14, vx: -P.face * 60, vy: 0, life: 0.3, max: 0.3, col: '#ffd36b', size: 1, grav: 0, glow: true });
    for (const e of enemies) if (e.alive && !e.harmless && !P.chargeHit.has(e) && overlap({ l: P.x - 10, r: P.x + 10, t: P.y - 18, b: P.y }, box(e))) { P.chargeHit.add(e); hurtEnemy(e, Math.round(12 * amul('holyCharge')), P.x, false); if (!e.maxHp) { e.stagger = Math.max(e.stagger || 0, 1); e.vx = P.face * 240; e.vy = -150; } sparks(e.x, e.y - e.h / 2, P.face, 8); shakeCam(3, P.face * 2); hitstop(0.04); } }
  if (throwPress && skillNow() === 'groundSlam' && P.ground && !(P.slamCd > 0) && !P.dead && !(P.hurt > 0) && !(P.asleep > 0) && !(P.dodge > 0) && P.atk < 0) { if (spend(25)) { P.slamCd = cdOf('groundSlam'); P.block = false; P.atk = -1; shakeCam(7); zoomKick(1.1, 0.22); ringAt(P.x, P.y - 2, 32, '#ffd36b', 0.35); dust(P.x - 10, P.y, 6); dust(P.x + 10, P.y, 6); SFX.heavy(); SFX.stone(); squash(1.45, 0.6, 0.14); hitstop(0.04); for (const d of [-1, 1]) pwaves.push({ x: P.x + d * 8, y: P.y, dir: d, life: 1.2, sp: 210, hit: new Set() }); for (const tx of [Math.floor((P.x - 12) / TS), Math.floor((P.x + 12) / TS)]) { const ty = Math.floor((P.y + 2) / TS); if (tileAt(tx, ty) === T.CRATE) breakCrate(tx, ty); } number(P.x, P.y - 24, 'SLAM', '#ffd36b'); } else number(P.x, P.y - 22, 'TIRED', '#ffd36b'); }
  if (throwPress && skillNow() === 'shieldThrow' && !thrown && !(P.throwCd > 0) && tal('shieldThrow') && !P.dead && !(P.hurt > 0) && !(P.asleep > 0) && !P.plunge && !(P.dodge > 0)) { if (spend(20)) { thrown = { x: P.x + P.face * 6, y: P.y - 9, dir: P.face, t: 0, back: false, hit: new Set() }; P.block = false; SFX.throwWhoosh(); squash(0.85, 1.15, 0.08); } else number(P.x, P.y - 22, 'TIRED', '#ffd36b'); }
  if (P.caged > 0) { P.caged -= dt; P.vx = 0; }
  for (const k of ['inv', 'grace', 'skidT', 'throwCd', 'slamCd', 'hurt', 'coyote', 'jbuf', 'abuf', 'dbuf', 'plungeRec', 'drop', 'dodgeCd', 'stFlash', 'sqT', 'stDelay', 'landT', 'guardTired']) P[k] = Math.max(0, P[k] - dt);
  if (P.stDelay <= 0 && P.st < P.maxSt) P.st = Math.min(P.maxSt, P.st + ST.regen * (P.relic === 'fleece' ? 2 : 1) * (1 + 0.1 * tal('breath') + 0.07 * (tal('fleet') + tal('ironLungs'))) * dt);
  P.hpShown += (P.hp - P.hpShown) * Math.min(1, dt * 6);
  // sleep spores: stay in the violet and you drop; block holds your breath; mash to wake
  const haven = props.some(pr => pr.t === 'glow' && pr.dark <= 0 && Math.abs(pr.x - P.x) < 30 && Math.abs(pr.y - P.y) < 30);
  const inSleep = !haven && P.relic !== 'lantern' && ((L.sleeps || []).some(z => P.x > z.x0 && P.x < z.x1 && P.y > z.y0 && P.y - 14 < z.y1) || clouds2.some(c => c.sleep && Math.hypot(P.x - c.x, P.y - 8 - c.y) < c.r));
  if (P.asleep > 0) { P.asleep -= dt; if (jumpPress || atkPress || dodgePress) { P.asleep -= 0.35; SFX.ui(); } if (P.asleep <= 0) { P.asleep = 0; P.sleepM = 0; number(P.x, P.y - 22, 'AWAKE', '#8fd160'); } }
  else if (inSleep && !P.block) { P.sleepM = (P.sleepM || 0) + dt; if (P.sleepM > 1.3) { P.asleep = 2.2; P.vx = 0; SFX.gasp(); number(P.x, P.y - 22, 'ASLEEP  mash to wake', '#c9a0ff'); } }
  else P.sleepM = Math.max(0, (P.sleepM || 0) - dt * 1.5);
  const stunned = P.hurt > 0 || P.asleep > 0 || P.caged > 0;
  const attacking = P.atk >= 0;
  const dodging = P.dodge > 0;
  P.jet = false;
  if (isPyro()) { // C tapped = an ember; C held = the jet. A FULL bar banks for a few seconds and the next press of C is THE PYRE.
    P.heat = Math.max(0, Math.min(100, (P.heat || 0))); P.overheat = 0;
    P.castT = Math.max(0, (P.castT || 0) - dt); P.blastT = Math.max(0, (P.blastT || 0) - dt);
    const cDown = keys.block && !P.cWas; P.cWas = !!keys.block;
    if (P.full && cDown && !stunned && !dodging && !P.plunge && !thrown) castPyre();
    if (keys.block) P.cHeld = (P.cHeld || 0) + dt; else { if (P.cHeld > 0 && P.cHeld < 0.14) castEmber(0); P.cHeld = 0; }
    P.jet = keys.block && P.cHeld >= 0.14 && !P.full && !stunned && !dodging && !attacking && !P.plunge && !thrown && !(P.blastT > 0);
    if (P.jet) { P.heat += 18 * dt; if (P.heat >= 100) { P.heat = 100; P.jet = false; bankHeat(); } }
    else if (P.full && P.fullT > 0) P.fullT -= dt;   // banked: it holds a few seconds before it starts to go
    else P.heat -= (P.asleep > 0 || P.sleepM > 0.2 ? 8 : 16) * dt;
    if (P.full && P.heat < 100) P.full = false;
    SFX.jet(P.jet && !P.dead); // the jet roars for as long as it is held
    if (P.full && Math.random() < dt * 30) parts.push({ x: P.x + (Math.random() - 0.5) * 12, y: P.y - 4 - Math.random() * 14, vx: 0, vy: -40 - Math.random() * 30, life: 0.45, max: 0.45, col: Math.random() < 0.5 ? '#ffd36b' : '#fff6c8', size: 1, grav: -20 });
  }
  P.aegis = false;
  if (isPaladin()) { // C tapped = MEND. C held = AEGIS. A full bar and the next press of C is JUDGEMENT.
    P.light = Math.max(0, Math.min(100, P.light || 0)); P.castT = Math.max(0, (P.castT || 0) - dt); P.blastT = Math.max(0, (P.blastT || 0) - dt);
    const cDown = keys.block && !P.cWas; P.cWas = !!keys.block;
    const free = !stunned && !dodging && !P.plunge && !attacking && !(P.blastT > 0);
    if (cDown && free && P.light >= 100) { castJudgement(); P.cHeld = -99; }
    else if (keys.block) { P.cHeld = (P.cHeld || 0) + dt; if (P.cHeld >= 0.16 && free && P.ground && P.st > 0 && !(P.aegisCd > 0)) { P.aegisT = (P.aegisT || 0) + dt; if (P.aegisT > 1.5) { P.aegisCd = 2; P.aegisT = 0; SFX.guardBreak(); ringAt(P.x, P.y - 10, 14, '#9a8a60', 0.3); } /* the ward holds a breath and a half, then it must rest */ } if (P.cHeld >= 0.16 && free && P.ground && P.st > 0 && !(P.aegisCd > 0)) { P.aegis = true; P.st = Math.max(0, P.st - 22 * dt * (1 - 0.15 * tal('stalwart'))); if (tal('sanctuary')) P.hp = Math.min(P.maxHp, P.hp + 3 * dt); P.stDelay = ST.delay; if (!P.aegisWas) { SFX.block(); ringAt(P.x, P.y - 10, 18, '#fff6c8', 0.3); } } }
    else { if (P.cHeld > 0 && P.cHeld < 0.16 && free) castMend(); P.cHeld = 0; P.aegisT = 0; }
    P.aegisCd = Math.max(0, (P.aegisCd || 0) - dt);
    P.aegisWas = P.aegis;
  }
  P.block = !!keys.block && P.ground && !attacking && !P.plunge && !dodging && !stunned && P.guardTired <= 0 && P.st > 0 && !thrown && hero() === 'knight';
  P.blockT = P.block ? (P.blockT || 0) + dt : 0; P.riposteT = Math.max(0, (P.riposteT || 0) - dt); P.bashCd = Math.max(0, (P.bashCd || 0) - dt); if (P.ground) P.airRolled = false;
  if (isPyro() && P.jet && !P.ground && tal('updraft')) P.vy = Math.min(P.vy, 45); // UPDRAFT: the jet holds her up
  if (isPyro() && P.jet) { // the jet: a held tongue of flame five tiles long. It burns what stands in it and what flies through it. Heat is the cost.
    const j = jetBox();
    for (let i = 0; i < 3; i++) if (Math.random() < dt * 70) { const k = Math.random(); parts.push({ fire: true, drag: 1, x: P.x + P.face * (8 + k * jetLen()), y: P.y - 9 + (Math.random() - 0.5) * (4 + k * 14), vx: P.face * (60 + Math.random() * 60), vy: -20 - Math.random() * 30, life: 0.25 + k * 0.2, max: 0.45, col: k < 0.3 ? '#fff6c8' : Math.random() < 0.5 ? '#ff9a5c' : '#ffd36b', size: k < 0.5 ? 1 : 2, grav: -60 }); }
    P.jetTick = (P.jetTick || 0) - dt; if (P.jetTick <= 0) { P.jetTick = 0.2; for (const e of enemies) if (e.alive && !e.harmless && e.x + e.w / 2 > j.l && e.x - e.w / 2 < j.r && e.y > j.t && e.y - e.h < j.b) { hurtEnemy(e, heatDmg(e.maxHp ? 2 : 4), P.x - P.face * 10, false); e.burn = Math.max(e.burn || 0, tal('searing') ? 2.4 : 0.8); } }
    for (const s of seeds) if (!s.dead && s.x > j.l - 6 && s.x < j.r + 6 && s.y > j.t - 6 && s.y < j.b + 6) { s.dead = true; parries++; burst(s.x, s.y, 4, ['#ff9a5c', '#ffd36b'], 40, 0.3, 0, 1); }
    for (const c of clouds2) if (c.x + c.r > j.l && c.x - c.r < j.r && Math.abs(c.y - (P.y - 8)) < 24) c.life = Math.min(c.life, 0.2);
  }
  if (keys.block && thrown && !P.saidNoShield) { P.saidNoShield = true; number(P.x, P.y - 22, 'NO SHIELD', '#9aa39a'); } if (!thrown) P.saidNoShield = false;
  if (P.block) {
    P.st -= ST.hold * dt; P.stDelay = ST.delay;
    if (P.st <= 0) { P.st = 0; P.block = false; P.guardTired = 0.8; P.stFlash = 0.5; SFX.guardBreak(); number(P.x, P.y - 22, 'TIRED', '#ffd36b'); }
  }
  P.rootT = Math.max(0, (P.rootT || 0) - dt); if (P.rootT > 0 && P.ground) P.vx *= Math.pow(0.02, dt); // (a mend roots him)
  const move = (stunned || dodging || P.aegis || P.rootT > 0) ? 0 : (keys.left ? -1 : 0) + (keys.right ? 1 : 0);
  if (P.onMover) { const m = P.onMover; if (P.x + 4 > m.x && P.x - 4 < m.x + m.w && Math.abs(P.y - m.y) < 3) { P.x += m.dx; P.y += m.dy || 0; } else P.onMover = null; }

  if (P.dbuf > 0 && (P.ground || (tal('airRoll') && !P.airRolled)) && !attacking && !stunned && !P.plunge && !dodging && P.dodgeCd <= 0) {
    P.dbuf = 0;
    if (spend(dodgeCost())) { if (!P.ground) { P.airRolled = true; P.vy = Math.min(P.vy, -80); streaks(P.x, P.y - 8, 5, ['#fff6e0', '#c9d1dc'], 90); } /* AIR ROLL */ P.dodge = isPaladin() ? 0.24 : 0.3; P.dodgeCd = 0.5; P.vx = P.face * (isPaladin() ? 165 : 215); P.block = false; dodges++; trialEvent('dodge'); SFX.pDodge(); dust(P.x, P.y, 5); squash(1.2, 0.8, 0.1); }
  }
  if (dodging) { P.dodge -= dt; ghosts.push({ x: P.x, y: P.y, face: P.face, life: 0.22, frame: Math.floor(Math.max(0, P.dodge) * 14) % 2 }); }

  const groundAtk = attacking && P.ground;
  const wading = !P.dead && (L.pools || []).some(p => p.shallow && P.x > p.x0 && P.x < p.x1 && P.y > p.y + 2);
  P.cbHit = Math.max(0, (P.cbHit || 0) - dt); P.gasCd = Math.max(0, (P.gasCd || 0) - dt); if (isPyro() && P.jet && inGas() && !P.gasCd) { P.gasCd = 2; gasBlast(P.x, P.y); } if (P.torch > 0 && inGas() && !P.gasCd) { P.gasCd = 2; gasBlast(P.x, P.y); P.torch = 0; }
  if (L.hags && !P.dead) { const inHag = P.ground && (L.hags || []).some(z => P.x > z.x0 && P.x < z.x1); P.stillT = inHag && Math.abs(P.vx) < 8 ? (P.stillT || 0) + dt : 0; P.hagCd = Math.max(0, (P.hagCd || 0) - dt); if (P.stillT > 1.4 && P.hagCd <= 0) { P.stillT = 0; P.hagCd = 4; const side = Math.random() < 0.5 ? -1 : 1; const wx = P.x + side * 36; enemies.push({ t: 'wight', x: wx, y: P.y, vx: 0, vy: 0, w: 8, h: 13, hp: EHP.wight, hp0: EHP.wight, mode: 'rise', modeT: 0.5, life: 7, hitT: 0, face: -side, alive: true, dying: 0, anim: 0, flash: 0, stagger: 0, riseY: P.y }); burst(wx, P.y, 8, COLS.wight, 30, 0.6, -20, 1); SFX.wightMoan(); number(wx, P.y - 20, 'IT STANDS UP', '#c8d8c8'); } }
  if (L.thermals && !P.ground && !P.plunge) { for (const f of fires) if (f.delay <= 0 && Math.abs(P.x - f.x) < 14 && P.y < f.y && P.y > f.y - 120) { P.vy = Math.min(P.vy, -170); P.canCut = false; if (Math.random() < dt * 20) parts.push({ x: f.x + (Math.random() - 0.5) * 10, y: f.y - 20 - Math.random() * 60, vx: 0, vy: -120, life: 0.3, max: 0.3, col: '#ffd36b', size: 1, grav: 0 }); break; } } // the pyromancer's own updraft
  if (P.relic === 'windcloak' && keys.jump && !P.ground && !P.plunge && P.vy > 30 && !(P.hurt > 0)) { P.vy = 30; if (Math.random() < dt * 14) parts.push({ x: P.x - P.face * 6 + (Math.random() - 0.5) * 8, y: P.y - 14, vx: -P.face * 30, vy: 10, life: 0.35, max: 0.35, col: '#bfe6f5', size: 1, grav: 0 }); } // the cloak fills and you glide
  if (P.torch > 0) { P.torch -= dt; if (wading) { P.torch = 0; SFX.hiss(); number(P.x, P.y - 24, 'OUT', '#9aa39a'); } else if (Math.random() < dt * 12) parts.push({ x: P.x - P.face * 7 + (Math.random() - 0.5) * 3, y: P.y - 16, vx: 0, vy: -30, life: 0.3, max: 0.3, col: Math.random() < 0.5 ? '#ffd36b' : '#ff9a5c', size: 1, grav: 0 }); }
  if (wading) { P.st = Math.max(0, P.st - 5 * dt); P.stDelay = Math.max(P.stDelay, 0.2); P.rippleT = (P.rippleT || 0) - dt; if (P.rippleT <= 0 && (Math.abs(P.vx) > 15 || !P.ground)) { P.rippleT = 0.28; ripples.push({ x: P.x, life: 1 }); } if (Math.abs(P.vx) > 20 && Math.random() < dt * 8) parts.push({ x: P.x + (Math.random() - 0.5) * 8, y: P.y - 1, vx: (Math.random() - 0.5) * 30, vy: -30, life: 0.3, max: 0.3, col: '#bfe6f5', size: 2, grav: 150 }); }
  const spored = clouds2.some(c => Math.hypot(P.x - c.x, P.y - 8 - c.y) < c.r);
  if (spored && clouds2.some(c => !c.mild && Math.hypot(P.x - c.x, P.y - 8 - c.y) < c.r)) { P.st = Math.max(0, P.st - 8 * dt); P.stDelay = Math.max(P.stDelay, 0.3); }
  P.gustT = Math.max(0, (P.gustT || 0) - dt);
  const cap = ((P.block || P.jet) ? 32 : wading ? 46 : spored ? 40 : RUN * (PROG.charm === 'swift' ? 1.12 : 1) * (1 + 0.04 * (tal('swiftness') + tal('lightFeet') + tal('sureStride'))) * (isPyro() ? 1.15 : isPaladin() ? 0.9 : 1)) + (P.gustT > 0 && !P.ground ? 150 : 0); // a gust can carry you faster than your legs
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

  if (P.asleep > 0) { P.jbuf = 0; P.abuf = 0; P.dbuf = 0; }
  P.kickT = Math.max(0, (P.kickT || 0) - dt);
  // (she has one jump, like anyone else: the flame kick in the air was a second one and it is gone)
  if (P.jbuf > 0 && (P.ground || P.coyote > 0) && !stunned && !P.plunge && !dodging && !P.block && !P.aegis) {
    if (keys.down && P.ground && isOneWay(P.groundTile)) { P.drop = 0.2; P.jbuf = 0; }
    else { P.vy = JUMPV * (PROG.charm === 'feather' ? 1.09 : 1) * (1 + 0.02 * (tal('spring') + tal('leapFlame') + tal('ascension'))); P.ground = false; P.coyote = 0; P.jbuf = 0; P.onMover = null; P.canCut = true; SFX.pJump(); dust(P.x, P.y, 3); squash(0.8, 1.2, 0.1); }
  }
  if (!keys.jump && P.canCut && P.vy < -110 && !P.plunge) P.vy = -110;

  if (P.abuf > 0 && !stunned && !P.plunge && !dodging && !P.aegis) {
    if (!P.ground && (keys.down || P.abufDown)) { P.abuf = 0; P.abufDown = false; if (spend(plungeCost())) { P.plunge = true; P.vy = Math.max(P.vy, 60); P.atk = -1; P.hitSet.clear(); SFX.slash();
      if (isPyro()) { // the fireball goes down ahead of her and lands first
        embers.push({ x: P.x, y: P.y - 4, vx: 0, vy: 300, life: 1.1, hit: new Set(), plunge: true });
        P.heat = Math.min(100, (P.heat || 0) + 10); if (P.heat >= 100 && !P.full) bankHeat(); SFX.puff();
        burst(P.x, P.y + 2, 8, ['#ff9a5c', '#ffd36b', '#ff6b2c'], 60, 0.4, 120, 2);
        number(P.x, P.y - 26, 'FIREDROP', '#ff9a5c'); } } }
    else if (tal('bash') && keys.block && P.ground && P.plungeRec <= 0) { P.abuf = 0; if (!(P.bashCd > 0) && spend(10)) shieldBash(); }
    else if (P.atk < 0 && P.plungeRec <= 0) { P.abuf = 0; if (spend(P.relic === 'gauntlet' ? 0 : Math.round((isPaladin() ? 22 : sword().cost) * (tal('flurry') ? 0.5 : 1)))) { P.atk = 0; P.hitSet.clear(); SFX.pSlash(); startSwing(); if (inGas() && !P.gasCd) { P.gasCd = 2; gasBlast(P.x, P.y); } if (Math.random() < 0.35) SFX.pEffort(); if (P.ground) P.vx = P.face * 75; } }
  }
  if (P.atk >= 0) {
    P.atk += dt * (isPaladin() ? 0.56 : 1); if (P.atk > 0.3) P.atk = -1;
    if (P.atk >= 0.03 && P.atk < 0.17) {
      const k = (P.atk - 0.03) / 0.14, ang = -1.9 + k * 2.6;
      const px0 = P.x + P.face * 2, py0 = P.y - 9;
      if (isPyro()) { const reach = 10 + Math.min(1, k * 1.6) * 24; trail.push({ x0: px0, y0: py0, x: px0 + P.face * reach, y: py0 - 1, life: 0.09 }); for (let i = 0; i < 2; i++) parts.push({ x: px0 + P.face * (reach - Math.random() * 10), y: py0 + (Math.random() - 0.5) * 6, vx: P.face * (40 + Math.random() * 60), vy: -20 - Math.random() * 30, life: 0.22, max: 0.22, col: Math.random() < 0.4 ? '#fff6c8' : Math.random() < 0.5 ? '#ff9a5c' : '#ffd36b', size: Math.random() < 0.5 ? 1 : 2, grav: -40 }); }
      else trail.push({ x0: px0, y0: py0, x: px0 + Math.cos(ang) * 18 * P.face, y: py0 + Math.sin(ang) * 18, life: 0.11 });
    }
  }

  P.vy += GRAV * dt * (P.plunge ? 1.6 : 1);
  const maxFall = P.plunge ? 340 : 270; if (P.vy > maxFall) P.vy = maxFall;
  { // crag rock faces: hold into the rock while airborne to cling and slide slowly; jump to kick up and away
    const dir = keys.left ? -1 : keys.right ? 1 : 0, tx = Math.floor((P.x + dir * 6) / TS), ty = Math.floor((P.y - 8) / TS);
    const grip = dir !== 0 && !P.ground && P.vy > -40 && !(P.hurt > 0) && !P.plunge && (tileAt(tx, ty) === T.CLIMB || tileAt(tx, ty + 1) === T.CLIMB);
    if (grip) { if (!P.cling) { P.cling = true; SFX.pStep(); } P.vy = Math.min(P.vy, P.relic === 'spurs' ? 0 : 26); P.face = dir; if (Math.random() < dt * 10) parts.push({ x: P.x + dir * 6, y: P.y - 4, vx: -dir * 20, vy: 24, life: 0.3, max: 0.3, col: '#8a919c', size: 1, grav: 200 });
      if (P.jbuf > 0) { P.jbuf = 0; P.vy = JUMPV; P.vx = -dir * 150; P.cling = false; P.canCut = true; P.kicked = false; SFX.pJump(); dust(P.x + dir * 6, P.y - 6, 4); } }
    else P.cling = false;
  }

  const wasGround = P.ground, prevY = P.y;
  P.ground = false;
  const prevVy = P.vy;
  const r = moveBody(P, P.vx * dt, P.vy * dt, P.drop > 0);
  if (r.hitX) P.vx = 0;
  if (r.ground) { P.ground = true; P.groundTile = r.groundTile; P.vy = 0; P.coyote = SET.assist ? 0.2 : 0.1; P.kicked = false; }
  else if (r.hitY) P.vy = 0;
  if (!P.ground && wasGround && !P.onMover) P.coyote = SET.assist ? 0.2 : 0.1;
  if (!P.ground && P.vy >= 0) for (const m of movers) {
    if (prevY <= m.y + 1 + Math.max(0, m.dy || 0) && P.y >= m.y && P.y <= m.y + 12 && P.x + 4 > m.x && P.x - 4 < m.x + m.w) { P.y = m.y; P.vy = 0; P.ground = true; P.groundTile = m.cap ? T.BOUNCER : T.SOLID; P.onMover = m; P.coyote = 0.1; P.kicked = false; }
  }
  if (camLock) { P.x = Math.max(camLock.x0 + 6, Math.min(camLock.x1 - 6, P.x)); }
  if (!P.ground) P.fallV = Math.max(P.fallV || 0, P.vy);
  if (P.ground && !wasGround && P.groundTile === T.BOUNCER) { // springy cap
    const plunged = P.plunge; P.ground = false; P.vy = plunged ? -560 : keys.jump ? -480 : -400; P.canCut = false; P.plunge = false; SFX.leap(); squash(plunged ? 0.6 : 0.7, plunged ? 1.5 : 1.35, 0.14); burst(P.x, P.y, plunged ? 12 : 6, ['#c9463d', '#ff9a9a'], plunged ? 80 : 50, 0.3); if (plunged) { number(P.x, P.y - 24, 'SPRING', '#ff9a9a'); SFX.pPogo(); }
    const tx = Math.floor(P.x / TS), ty = Math.floor((P.y + 2) / TS); const i = ty * LW + tx; if (L.grid[i] === T.BOUNCER) { tileSpr[i] = TILE.bouncer[1]; setTimeout(() => { if (L.grid[i] === T.BOUNCER) tileSpr[i] = TILE.bouncer[0]; }, 180); }
  }
  if (P.ground && !P.onMover && L.scree && !P.dead) for (const z of L.scree) if (Math.abs(P.y - z.y * TS) < 2 && P.x >= z.x0 * TS && P.x < (z.x1 + 1) * TS) { const sp = P.block ? 24 : 70; P.x += z.dir * sp * dt; P.screeT = (P.screeT || 0) - dt; if (P.screeT <= 0) { P.screeT = 0.12; dust(P.x - z.dir * 4, P.y, 1); if (Math.random() < 0.5) SFX.step(); } }
  if (P.ground && P.groundTile === T.SHELF) { // shelf fungus snaps under a standing weight
    if (P.relic === 'shoes') { /* iron shoes: the planks hold */ } else for (const tx of [Math.floor((P.x - 4) / TS), Math.floor((P.x + 4) / TS)]) { const ty = Math.floor((P.y + 1) / TS); const i = ty * LW + tx; if (L.grid[i] !== T.SHELF) continue; if ((shelfT[i] || 0) < 0) continue; shelfT[i] = (shelfT[i] || 0) + dt; if (shelfT[i] > 0.4 && Math.random() < dt * 20) parts.push({ x: tx * TS + Math.random() * 16, y: ty * TS + 5, vx: 0, vy: 30, life: 0.3, max: 0.3, col: '#d9a55b', size: 1, grav: 200 }); if (shelfT[i] > 0.9) { L.grid[i] = T.AIR; tileSpr[i] = null; shelfT[i] = -4; SFX.crack(); burst(tx * TS + 8, ty * TS + 4, 8, ['#d9a55b', '#8a5a32'], 60, 0.5); if (L.dark) { shakeCam(3); SFX.rumble(); for (let k = 0; k < 4; k++) parts.push({ x: tx * TS + Math.random() * 48 - 16, y: ty * TS - 100 - Math.random() * 40, vx: 0, vy: 40, life: 0.9, max: 0.9, col: '#5a5a66', size: 2, grav: 500 }); } } }
  }
  if (P.ground && !wasGround) {
    if (!P.plunge && P.fallV > 250) { const k = Math.min(1, (P.fallV - 250) / 200); dust(P.x - 6, P.y, 2 + Math.round(k * 4)); dust(P.x + 6, P.y, 2 + Math.round(k * 4)); if (k > 0.5) { shakeCam(1 + k * 2); squash(1.25, 0.75, 0.1); } } P.fallV = 0;
    if (P.plunge) { ringAt(P.x, P.y - 2, 22, '#e8dcc0', 0.3); for (let i = 0; i < 2; i++) dust(P.x + (i ? 10 : -10), P.y, 4); shakeCam(3); }
    if (P.plunge) {
      const ty = Math.floor((P.y + 2) / TS); let broke = false;
      for (const tx of [Math.floor((P.x - 4) / TS), Math.floor((P.x + 4) / TS)]) if (tileAt(tx, ty) === T.CRATE) { breakCrate(tx, ty); broke = true; }
      if (broke) { P.vy = POGO; P.ground = false; P.plunge = false; P.canCut = false; SFX.pPogo(); P.hitSet.clear(); squash(0.8, 1.25, 0.1); }
      else { P.plunge = false; P.plungeRec = 0.12; shakeCam(3); dust(P.x, P.y, 10); SFX.thud(); squash(1.4, 0.6, 0.14);
        if (isPaladin()) { for (const d of [-1, 1]) pwaves.push({ x: P.x + d * 8, y: P.y, dir: d, life: tal('shockwave') ? 2.0 : 1.0, sp: 200, hit: new Set() }); shakeCam(6); zoomKick(1.06, 0.2); ringAt(P.x, P.y - 2, 30, '#ffd36b', 0.3); SFX.hammerfall(); } } // HAMMERFALL: the maul comes down and the ground carries it both ways
    } else { const heavy = prevVy > 250; dust(P.x, P.y, heavy ? 9 : 4); SFX.pLand(surface()); squash(heavy ? 1.4 : 1.25, heavy ? 0.6 : 0.75, 0.1); P.landT = heavy ? 0.16 : 0.1; if (heavy) { shakeCam(2); ringAt(P.x, P.y - 1, 12, '#c9b27c', 0.2); } }
    pogoChain = 0;
    for (const d of decor) if ((d.k === 'mushroom' || d.k === 'tiny') && Math.abs(d.x - P.x) < 30 && Math.abs(d.y - P.y) < 20) d.wob = 0.4;
  }
  if (P.ground && Math.abs(P.vx) > 90 && Math.sign(P.vx) !== P.face && !dodging) { if (Math.random() < dt * 30) dust(P.x + P.face * 3, P.y, 1); SFX.skid(); } // turning at a run: the boots skid
  if (P.ground && Math.abs(P.vx) > 40 && !dodging) { P.dust -= dt; if (P.dust <= 0) { P.dust = 0.18; dust(P.x - P.face * 4, P.y, 1); SFX.pStep(surface()); } for (const d of decor) if ((d.k === 'tuft' || d.k === 'flower' || d.k === 'fern' || d.k === 'cattail') && Math.abs(d.x + 4 - P.x) < 12 && Math.abs(d.y + 5 - P.y) < 10) d.sway = 0.45; }
  for (const d of decor) if (d.k === 'bush' && d.birds && Math.abs(d.x + 13 - P.x) < 26 && Math.abs(d.y + 16 - P.y) < 24) { d.birds = false; SFX.bird(); for (let i = 0; i < 2 + (Math.random() * 2 | 0); i++) birds.push({ x: d.x + 6 + Math.random() * 14, y: d.y + 4, vx: (Math.random() < 0.5 ? -1 : 1) * (40 + Math.random() * 40), vy: -70 - Math.random() * 40, t: Math.random() * 3, life: 3 }); }
  P.anim += dt;

  const pb = box(P);
  for (let ty = Math.floor(pb.t / TS); ty <= Math.floor((pb.b - 1) / TS); ty++) for (let tx = Math.floor(pb.l / TS); tx <= Math.floor((pb.r - 1) / TS); tx++) {
    if (tileAt(tx, ty) === T.SPIKE && pb.b > ty * TS + 6) damagePlayer(tx * TS + 8, DMG.spike, { up: true, unblockable: true });
  }
  if (P.y > LH * TS + 30) { if (SET.invincible) { P.x = checkpoint.x; P.y = checkpoint.y; P.vx = 0; P.vy = 0; } else { die(); P.dead = 0.6; } }
  for (const p of (L.pools || [])) if (!P.dead && !p.shallow && P.x > p.x0 && P.x < p.x1 && P.y > p.y + 9) {
    burst(P.x, p.y, 16, ['#eefaff', '#bfe6f5', '#7fc4e0'], 90, 0.6, 500, 2); SFX.crack(); number(P.x, p.y - 14, 'SPLASH', '#bfe6f5');
    die(); P.dead = 0.8; break;
  }

  const hb = attackBox();
  if (hb) {
    for (const e of enemies) {
      if (!e.alive || P.hitSet.has(e) || e.gone > 0) continue;
      if (!overlap(hb, box(e))) continue;
      P.hitSet.add(e);
      if (P.plunge) {
        if (e.t === 'master' && e.mounted) { if (e.stagger > 0) { hurtEnemy(e, 30, P.x, true); e.stagger = Math.max(e.stagger, 0.9); e.mode = 'stagger'; e.modeT = Math.max(e.modeT, 0.9); number(e.x, e.y - 24, 'STUNNED', '#8fd160'); SFX.gobHurtLow(); SFX.thud(); burst(e.x, e.y - 8, 12, COLS.master, 80, 0.6); } else { SFX.clank(); number(e.x, e.y - e.h - 6, 'THE HOUND GUARDS HIM', '#9aa39a'); } P.vy = POGO; P.ground = false; P.plunge = false; P.canCut = false; P.hitSet.clear(); continue; }
        if (e.t === 'ram') { if (e.mode === 'crash') { hurtEnemy(e, plungeDmg() * 2, P.x, true); number(e.x, e.y - 30, 'BETWEEN THE HORNS', '#ffd36b'); } else { SFX.clank(); number(e.x, e.y - 24, 'HE SHRUGS IT OFF', '#9aa39a'); } P.vy = POGO; P.ground = false; P.plunge = false; P.canCut = false; P.hitSet.clear(); continue; }
        if (e.t === 'king' && e.mode !== 'held' && !(e.open > 0)) { SFX.clank(); sparks(e.x, e.y - 40, P.face, 5); P.vy = POGO; P.ground = false; P.plunge = false; P.canCut = false; continue; }
        if (e.t === 'chief') { e.plungeN = (e.plungeN || 0) + 1; e.plungeT = 2.5; if (e.plungeN >= 2) { e.plungeN = 0; e.plungeT = 0; P.vx = (Math.sign(P.x - e.x) || -e.face) * 280; P.vy = -230; P.inv = Math.max(P.inv, 0.5); P.plunge = false; P.canCut = false; P.ground = false; P.hitSet.clear(); number(e.x, e.y - e.h - 12, 'SHAKEN OFF', '#ff6b6b'); SFX.roar(); SFX.clank(); shakeCam(4); e.stagger = 0; continue; } }
        if (e.t === 'mother' && e.tipped) continue;
        if (e.t === 'mother') { P.plunge = false; P.vy = -200; P.ground = false; P.canCut = false; SFX.clank(); number(e.x, P.y - 10, 'ARMOURED', '#9aa39a'); continue; }
        if (e.t === 'heart') { hurtEnemy(e, 1, P.x, true); P.vy = POGO; P.ground = false; P.plunge = false; P.canCut = false; P.hitSet.clear(); SFX.pPogo(); pogoCount++; squash(0.8, 1.25, 0.1); continue; }
        if (e.t === 'thorn') {
      if (e.mode === 'charge' && Math.random() < dt * 9) SFX.clatter();
          P.plunge = false; P.ground = false; P.canCut = false; P.hitSet.clear();
          SFX.clank(); sparks(P.x, P.y + 4, P.face, 8); number(e.x, e.y - e.h - 6, e.t === 'frog' ? 'CROWN OF THORNS' : 'SPIKED', '#ffd36b');
          P.inv = 0; damagePlayer(e.x, e.t === 'frog' ? DMG.crown : DMG.spined, { up: true, unblockable: true }); P.vy = -250;
          continue;
        }
        if (e.t === 'queen') { e.headHits = (e.headHits || 0) + 1; e.headT = 4; if (e.headHits >= 3 && e.mode !== 'winded') { e.headHits = 0; e.mode = 'buck'; e.modeT = 0.3; e.vx = (Math.sign(e.x - P.x) || 1) * 320; e.vy = -60; P.inv = 0; P.vx = -e.vx * 0.7; P.vy = -170; P.hurt = 0.3; P.plunge = false; P.ground = false; number(e.x, e.y - 20, 'BUCKS', '#ff6b6b'); SFX.roar(); shakeCam(4); continue; } }
        hurtEnemy(e, Math.round(plungeDmg() * (tal('bounding') ? Math.min(2, 1 + 0.25 * pogoChain) : 1)), P.x, true); if (tal('bounding')) P.st = Math.min(P.maxSt, P.st + 8); if (e.t === 'dummy') trialEvent('pogo'); P.vy = POGO; P.ground = false; P.plunge = false; P.canCut = false; P.hitSet.clear(); SFX.pPogo(); pogoCount++; pogoChain++; if (pogoChain === 3) { SFX.laugh(); number(P.x, P.y - 26, 'CHAIN!', '#8fd160'); } squash(0.8, 1.25, 0.1); continue;
      }
      const front = Math.sign(P.x - e.x) === e.face;
      if (e.t === 'mother' && e.tipped) continue;
      if (e.t === 'drone' || e.t === 'mother') { SFX.clank(); sparks(e.x, e.y - e.h / 2, P.face, 4); number(e.x, e.y - e.h - 6, e.t === 'mother' ? 'ARMOURED' : 'PUFF', '#9aa39a'); continue; }
      if (e.t === 'ram' && !ramOpen(e)) { SFX.clank(); hitstop(0.05); sparks(e.x + e.face * 14, e.y - 8, P.face, 5); P.vx = e.face * 120; number(e.x, e.y - e.h - 6, 'HORNS', '#c9a83a'); continue; }
      if (e.t === 'pike' && front && e.stagger <= 0) { SFX.clank(); hitstop(0.05); sparks(e.x + e.face * 12, e.y - 8, P.face, 4); P.vx = e.face * 100; number(e.x, e.y - e.h - 6, 'PIKE', '#c9d1dc'); continue; }
      if (e.t === 'king' && e.mode !== 'held' && !(e.open > 0)) { SFX.clank(); sparks(e.x + P.face * -20, e.y - 30, P.face, 5); continue; }
      if (e.turncoat) continue;
      if (e.t === 'master' && e.mounted && e.stagger <= 0) { SFX.clank(); sparks(e.x, e.y - 8, P.face, 4); number(e.x, e.y - e.h - 6, 'THE HOUND GUARDS HIM', '#9aa39a'); continue; }
      if (chiefShielded(e) && front) { SFX.clank(); hitstop(0.05); sparks(e.x + e.face * 8, e.y - 10, P.face, 6); P.vx = e.face * 120; number(e.x, e.y - e.h - 6, 'SHIELD', '#c9d1dc'); continue; }
      if (e.t === 'brute' && e.mode === 'raise') { hurtEnemy(e, swingDmg(e), P.x, false); swordEffect(e); continue; }
      if (e.t === 'shield' && front) {
        SFX.clank(); hitstop(0.05); P.vx = e.face * 170; P.vy = Math.min(P.vy, -70); P.ground = false; e.stagger = 0.4; P.atk = 0.22; shakeCam(2, e.face * 2);
        sparks(e.x + e.face * 8, e.y - 8, e.face, 7);
      } else { hurtEnemy(e, swingDmg(e), P.x, false); swordEffect(e); if (isPaladin()) { gainLight(5); if (P.combo % 3 === 0 && !e.maxHp && e.alive) { e.stagger = Math.max(e.stagger || 0, 0.5); e.vx = P.face * 120; } shakeCam(2, P.face * 2); } /* only the third blow of a run staggers */ }
    }
    for (const s of seeds) if (!s.dead && !s.reflected && overlap(hb, { l: s.x - 3, r: s.x + 3, t: s.y - 3, b: s.y + 3 })) { parries++; SFX.parry(); sparks(s.x, s.y, P.face, 6); number(s.x, s.y - 8, 'PARRY', '#8fd160'); if (s.bolt && returnBolt(s)) { /* back at the shaman */ } else if (s.arrow && s.owner && s.owner.alive) { const dx = s.owner.x - s.x, dy = (s.owner.y - 5) - s.y, d = Math.hypot(dx, dy) || 1; s.vx = dx / d * 260; s.vy = dy / d * 260; s.g = 0; s.reflected = true; s.life = 2; } else s.dead = true; }
    if (!P.plunge) for (let ty = Math.floor(hb.t / TS); ty <= Math.floor((hb.b - 1) / TS); ty++) for (let tx = Math.floor(hb.l / TS); tx <= Math.floor((hb.r - 1) / TS); tx++) if (tileAt(tx, ty) === T.CRATE) breakCrate(tx, ty);
  }
  const cb = { l: pb.l + 1, r: pb.r - 1, t: pb.t + 2, b: pb.b - 1 };
  for (const e of enemies) {
    if (!e.alive || e.flash > 0 || e.gone > 0 || !overlap(cb, box(e))) continue;
    if (e.t === 'queen' && (e.mode === 'winded' || e.mode === 'sleep' || e.mode === 'slamRest')) continue;
    const stompable = !P.plunge && P.vy > 40 && pb.b <= e.y - e.h + 7 && P.dodge <= 0;
    if (e.t === 'frog' && (e.mode === 'sleep' || (e.mode === 'dazed' && !stompable))) continue;
    if (e.t === 'frog' && stompable && e.mode !== 'dazed') { e.headHits = (e.headHits || 0) + 1; e.headT = 4; if (e.headHits >= 2 && e.mode === 'idle') { e.headHits = 0; e.mode = 'hopAway'; e.modeT = 0.1; } }
    // stomp: falling onto a foe's head
    if (!P.plunge && P.vy > 40 && pb.b <= e.y - e.h + 7 && P.dodge <= 0) {
      P.hitSet.clear(); P.canCut = false; P.ground = false;
      if (e.t === 'thorn') { P.inv = 0; SFX.clank(); sparks(P.x, P.y + 4, P.face, 8); number(e.x, e.y - e.h - 6, e.t === 'frog' ? 'CROWN OF THORNS' : 'SPIKED', '#ffd36b'); damagePlayer(e.x, e.t === 'frog' ? DMG.crown : DMG.spined, { up: true, unblockable: true }); P.vy = -250; continue; }
      if (e.t === 'mother' || e.t === 'gill' || e.t === 'heart' || e.t === 'folk') { continue; }
      if (e.t === 'master' && e.mounted && e.stagger > 0) { hurtEnemy(e, 20, P.x, true); e.stagger = Math.max(e.stagger, 0.7); number(e.x, e.y - 24, 'STUNNED', '#8fd160'); SFX.gobHurtLow(); SFX.thud(); P.vy = -260; P.plunge = false; P.ground = false; P.canCut = false; burst(e.x, e.y - 8, 12, COLS.master, 80, 0.6); continue; }
      if (e.t === 'shield' || e.t === 'queen' || e.t === 'brute' || e.t === 'chief' || e.t === 'king' || (e.t === 'master' && e.mounted) || (e.t === 'ram' && !ramOpen(e))) { P.vy = keys.jump ? -260 : -190; SFX.clank(); sparks(e.x, e.y - e.h, P.face, 6); e.stagger = Math.max(e.stagger, 0.3); number(e.x, e.y - e.h - 6, 'HELM', '#c9d1dc'); squash(0.85, 1.2, 0.1); continue; }
      if (e.t === 'queen') { e.headHits = (e.headHits || 0) + 1; e.headT = 4; if (e.headHits >= 3 && e.mode !== 'winded') { e.headHits = 0; e.mode = 'buck'; e.modeT = 0.3; e.vx = (Math.sign(e.x - P.x) || 1) * 320; e.vy = -60; P.vx = -e.vx * 0.7; P.vy = -170; P.hurt = 0.3; P.ground = false; number(e.x, e.y - 20, 'BUCKS', '#ff6b6b'); SFX.roar(); shakeCam(4); continue; } }
      hurtEnemy(e, P.relic === 'crown' ? plungeDmg() : 10, P.x, true); P.vy = keys.jump ? -290 : -220; SFX.pPogo(); squash(0.8, 1.25, 0.1); continue;
    }
    if (e.t === 'dummy' || e.t === 'brute' || e.t === 'chief' || e.t === 'mother' || e.t === 'gill' || e.t === 'heart' || e.t === 'folk' || e.t === 'king' || e.t === 'bearer' || e.t === 'pike' || e.t === 'master' || e.t === 'thief' || e.t === 'ram' || e.t === 'goat' || e.t === 'harpy' || e.t === 'troll' || e.t === 'greathound' || e.t === 'spider' || e.t === 'owl' || e.t === 'miner' || e.t === 'bat' || e.t === 'forgemaster' || e.t === 'lance' || e.t === 'suncatcher' || e.t === 'roc' || e.t === 'gqueen' || (e.big && e.t !== 'sailer') || (e.t === 'bale' && Math.abs(e.vx) < 40)) continue; // their damage comes from their attacks, not from touching them
    const res = e.turncoat ? 'none' : damagePlayer(e.x, e.t === 'hopper' ? HOP[e.color || 'green'].dmg : e.pack ? 12 : (DMG[e.t] || 12));
    if (res === 'blocked') {
      if (e.t === 'sapper' && e.fleeT <= 0) { bombs.push({ x: e.x, y: e.y - 4, vx: -Math.sign(P.x - e.x) * 20, vy: -40, fuse: 0.45 }); e.fleeT = 0; e.stagger = 0.7; e.vx = 0; number(e.x, e.y - 18, 'DROPPED IT', '#ffd36b'); }
      if (e.t === 'queen') { if (e.mode === 'dive' || e.mode === 'sweep') queenWinded(e, true); }
      else if (e.t !== 'wasp' && e.t !== 'spit') { e.vx = Math.sign(e.x - P.x) * 150; e.stagger = 0.5; if (e.t === 'thorn' && e.mode === 'charge') { e.mode = 'rest'; e.modeT = 0.9; } }
    }
  }
  for (const s of seeds) if (!s.dead && !s.reflected && overlap(cb, { l: s.x - 2, r: s.x + 2, t: s.y - 2, b: s.y + 2 })) { s.dead = true; if (s.web) { const res = damagePlayer(s.x, DMG.web); if (res === 'hit') { P.vx *= 0.1; P.vy = Math.max(P.vy, 40); P.stDelay = 1.1; number(P.x, P.y - 24, 'STUCK', '#e8dcc0'); burst(s.x, s.y, 8, ['#e8dcc0', '#b8a888'], 40, 0.6, 60, 2); } continue; } const sres = damagePlayer(s.x - s.vx * 0.1, s.slate ? DMG.gqSlate : s.rocFeather ? DMG.rocFeather : s.sunshard ? DMG.sunShard : s.venom ? DMG.venom : s.bolt ? DMG.bolt : s.jav ? DMG.lanceJav : s.arrow ? DMG.arrow : s.spore ? DMG.sporeRain : s.skull ? DMG.skull : s.shard ? DMG.shard : s.soot ? DMG.sweep : s.acid ? DMG.acid : s.lantern ? DMG.lantern : s.goblet ? DMG.goblet : s.feather ? DMG.feather : s.steam ? DMG.steam : s.slag ? DMG.fire : DMG.seed); if (sres === 'blocked' && s.bolt) returnBolt(s); else if (sres === 'blocked' && ((P.block && tal('bulwark')) || (P.aegis && tal('reflect')))) reflectSeed(s); }
  if (tongue && tongue.active && !P.dead && Math.abs(P.y - 8 - tongue.y) < 9 && ((tongue.dir > 0 && P.x > tongue.x0 && P.x < tongue.x0 + tongue.len) || (tongue.dir < 0 && P.x < tongue.x0 && P.x > tongue.x0 - tongue.len))) { const res = damagePlayer(tongue.x0, DMG.tongue); if (res === 'blocked') { tongue.active = false; boss.mode = 'dazed'; boss.modeT = 1.3; number(boss.x, boss.y - 24, 'BITTEN TONGUE', '#8fd160'); SFX.tongue(); } else if (res === 'hit') { P.vx = tongue.dir * -160; tongue.active = false; } }
  if ((P.relic === 'charm' || PROG.charm === 'lucky') && !P.dead) for (const a of acorns) if (!a.got && Math.abs(a.x - P.x) < 70 && Math.abs(a.y - P.y) < 50) { a.x += (P.x - a.x) * Math.min(1, dt * 6); a.y += ((P.y - 8) - a.y) * Math.min(1, dt * 6); }
  for (const a of acorns) {
    if (a.got) continue;
    if (a.vy !== undefined) { a.vy += 400 * dt; a.y += a.vy * dt; const ty = Math.floor((a.y + 3) / TS); if (isSolid(Math.floor(a.x / TS), ty)) { a.y = ty * TS - 3; a.vy = 0; } }
    if (Math.abs(a.x - P.x) < 10 && Math.abs(a.y - (P.y - 7)) < 12) { a.got = true; got++; coinCombo = coinComboT > 0 ? coinCombo + 1 : 0; coinComboT = 1.2; SFX.coinUp(Math.min(coinCombo, 10)); if (a.crate) collectedCrates.add(a.crate); burst(a.x, a.y, 6, ['#ffd36b', '#fff6c8'], 40, 0.35, -40, 1); flyCoins.push({ x: a.x - camX, y: a.y - 5 - camY, t: 0 }); }
  }
  for (const s of shrines) if (!s.lit && Math.abs(s.x - P.x) < 12 && Math.abs(s.y - P.y) < 20) { s.lit = true; checkpoint = { x: s.x, y: s.y }; P.hp = P.maxHp; P.st = P.maxSt; SFX.sting(); burst(s.x, s.y - 22, 14, ['#ffd36b', '#fff6c8', '#8fd160'], 50, 0.9, -30, 1); number(s.x, s.y - 40, 'SHRINE', '#ffd36b'); }
  if (gate && (!L.arena || escape) && Math.abs(gate.x - P.x) < 12 && Math.abs(gate.y - P.y) < 30 && state === 'play') { escape = null; winLevel(); }
  // boss arena trigger
  if (L.arena && boss && boss.alive && !bossActive && P.x > L.arena.trigger - 40 * TS) music.preload(L.arena.music || 'boss');
  // A mini arena needs a HEIGHT as well as a width: the Hanging Village stacks eight floors at the same x,
  // and without y0/y1 the Weaver's fight started while you were three tiers below her.
  if (L.mini && !miniActive && !miniDone && P.x > L.mini.trigger && P.x < L.mini.x1 - 24 && P.ground
    && (L.mini.y0 === undefined || (P.y > L.mini.y0 && P.y < L.mini.y1))) { const mb = miniOne(); if (mb) { miniActive = true; miniIntroT = 1.6; if (mb.t === 'forgemaster') { mb.mode = 'wake'; mb.modeT = 1.6; SFX.forgeHammer(); } if (mb.t === 'greathound') { mb.mode = 'idle'; mb.modeT = 1.2; } music.play(L.mini.music || 'boss'); setWallAt(L.mini.wallL, true, L.mini.floor); camLock = { x0: L.mini.x0, x1: L.mini.x1 }; number(mb.x, mb.y - 30, miniName(), '#ffd36b'); ({ greathound: SFX.bark, troll: SFX.snort, spider: SFX.hiss, sailer: SFX.puff }[mb.t] || SFX.roar)(); SFX.roar(); shakeCam(4); zoomKick(1.08, 0.3); } }
  if (L.arena && boss && boss.alive && !bossActive && P.x > L.arena.trigger && P.ground && Math.abs(P.y - L.arena.floor) < 48) bossStart(); // the floor check keeps a tall level's lower tiers from waking the boss
}

// ---------- boss: the Hornet Queen ----------
let titleI = 0, titleBarY = null;
const titleItems = () => (readSlot(slot) ? ['CONTINUE', 'CHOOSE A SAVE', 'THE EDITOR', 'SETTINGS', 'CONTROLS'] : ['NEW GAME', 'CHOOSE A SAVE', 'THE EDITOR', 'SETTINGS', 'CONTROLS']);
let miniActive = false, miniDone = false, miniIntroT = 0;
// The mini-boss slot used to be the Great Hound and nothing else. Any creature can hold it now.
const MINI_NAME = { forgemaster: 'THE FORGEMASTER', greathound: 'THE GREAT HOUND', troll: 'THE HILL TROLL', spider: 'THE WEAVER', sailer: 'THE MASTHEAD' };
const MINI_DONE = { forgemaster: 'THE FORGE GOES COLD', greathound: 'THE KENNELS OPEN', troll: 'THE GULLY IS CLEAR', spider: 'THE WEB COMES DOWN', sailer: 'THE ROAD IS OPEN' };
const miniName = () => (L.mini && MINI_NAME[L.mini.boss]) || 'THE BEAST';
const miniOne = () => L.mini ? enemies.find(e => e.alive && e.t === L.mini.boss && (e.mini || e.t === 'greathound')) : null;
// A mini dies: the wall it closed behind you opens, and so does the gate it was standing in front of.
function miniEnd(e) {
  if (!L.mini) return;
  openGate(L.mini.gate, 0, LH - 1, true);
  setWallAt(L.mini.wallL, false, L.mini.floor); miniActive = false; miniDone = true; camLock = null;
  number(e.x, e.y - 30, MINI_DONE[e.t] || 'THE WAY OPENS', '#8fd160'); SFX.heavy(); music.play(L.music || 'theme');
}
function setWallAt(col, solid, floorY) { const top = floorY / TS - 6, bot = floorY / TS - 1; for (let ty = top; ty <= bot; ty++) { const i = ty * LW + col; L.grid[i] = solid ? T.SOLID : T.AIR; tileSpr[i] = solid ? TILE.palisade[(ty + col) % 3] : null; } }
function setWall(col, solid) {
  const A = L.arena; const top = A.floor / TS - 6, bot = A.floor / TS - 1;
  for (let ty = top; ty <= bot; ty++) { const i = ty * LW + col; L.grid[i] = solid ? T.SOLID : T.AIR; tileSpr[i] = solid ? (L.arena.boss === 'chief' ? TILE.palisade[(ty + col) % 3] : (L.arena.boss === 'ram' || L.arena.boss === 'lance' || L.arena.boss === 'suncatcher' || L.arena.boss === 'roc') ? TILE.drystone[(ty + col) % 3] : L.arena.boss === 'gqueen' ? TILE.port[(ty + col) % 2] : TILE.vine[(ty + col) % 4]) : null; }
  // her hall is shut by portcullises, and you see them come down: both doors, with the clang, when she wakes
  if (solid && L.arena.boss === 'gqueen') { const ys = []; for (let ty = top; ty <= bot; ty++) ys.push(ty); const spr = ys.map(ty => tileSpr[ty * LW + col]); for (const ty of ys) tileSpr[ty * LW + col] = null; gateFx.push({ col, ys, t: 0, dur: 0.3, closing: true, spr }); SFX.gateDrop(); }
  if (L.arena.boss === 'mother') for (let ty = 0; ty < L.arena.floor / TS - 6; ty++) { const i = ty * LW + col; L.grid[i] = solid ? T.SOLID : T.AIR; tileSpr[i] = solid ? TILE.vine[(ty + col) % 4] : null; }
}
function bossStart() {
  bossActive = true; boss.mode = 'wake'; boss.modeT = 1.6; if (boss.t === 'mother') { boss.rootT = 3; boss.belchT = 8; setView('zoom'); } if (boss.t === 'owl' || boss.t === 'forgemaster' || boss.t === 'golem' || boss.t === 'windcaller' || boss.t === 'king' || boss.t === 'lance' || boss.t === 'suncatcher' || boss.t === 'roc' || boss.t === 'gqueen') setView('zoom'); camLock = { x0: L.arena.x0, x1: L.arena.x1 }; if (boss.t === 'frog') SFX.croak(); if (boss.t === 'chief') SFX.gobDie(); if (boss.t === 'ram') SFX.bellow();
  setWall(L.arena.wallL, true); setWall(L.arena.wallR, true);
  ({ queen: SFX.queenShriek, frog: SFX.frogBoom, chief: SFX.chiefBark, mother: SFX.gillOpen, king: SFX.kingLaugh, ram: SFX.bellow, owl: SFX.owlHoot, forgemaster: SFX.forgeHammer, golem: SFX.golemChime, windcaller: SFX.callerChant, lance: SFX.bellow, suncatcher: SFX.golemChime, roc: SFX.queenShriek, gqueen: SFX.bellow }[boss.t] || SFX.roar)(); shakeCam(6); music.stop(); bossMusicT = 1.1; number(boss.x, boss.y - 30, boss.t === 'gqueen' ? (gqOpen(boss) ? 'THE GOBLIN QUEEN  OPEN' : boss.phase === 3 ? 'THE GOBLIN QUEEN  THE CROWN' : boss.phase === 2 ? 'THE GOBLIN QUEEN  RISEN' : 'THE GOBLIN QUEEN') : boss.t === 'roc' ? (rocOpen(boss) ? 'THE ROC  GROUNDED' : boss.phase === 2 ? 'THE ROC  SHEDDING' : 'THE ROC') : boss.t === 'suncatcher' ? (boss.dimmed ? 'THE SUNCATCHER  DIMMED' : 'THE SUNCATCHER') : boss.t === 'lance' ? (lanceOpen(boss) ? "THE QUEEN'S LANCE  OPEN" : boss.phase === 2 ? "THE QUEEN'S LANCE  NO LANCE" : "THE QUEEN'S LANCE") : boss.t === 'frog' ? 'THE BULLFROG KING' : boss.t === 'chief' ? 'THE GOBLIN CHIEFTAIN' : boss.t === 'mother' ? 'THE MOTHER CAP' : boss.t === 'king' ? 'KING GORM UNDERLEAF' : boss.t === 'ram' ? (ramOpen(boss) ? 'THE RAM LORD  DAZED' : 'THE RAM LORD') : boss.t === 'owl' ? 'THE OWL REEVE' : boss.t === 'golem' ? (boss.mode === 'counter' || boss.mode === 'drink' ? 'THE FACET  OFF THE LINE' : 'THE FACET  NEEDS ' + (boss.need || 'blue').toUpperCase()) : boss.t === 'windcaller' ? (boss.mode === 'howl' || boss.mode === 'howlTell' ? 'THE WINDCALLER  HOLD ON' : boss.mode === 'blink' || boss.mode === 'appear' ? 'THE WINDCALLER  GONE' : boss.phase === 2 ? 'THE WINDCALLER  WRATH' : 'THE WINDCALLER') : boss.t === 'forgemaster' ? (boss.mode === 'stun' ? 'THE FORGEMASTER  STUNNED' : boss.mode === 'scald' ? 'THE FORGEMASTER  SCALDED' : 'THE FORGEMASTER') : 'THE HORNET QUEEN', '#ffd36b'); zoomKick(1.1, 0.4);
  burst(L.arena.wallL * TS + 8, L.arena.floor - 40, 12, ['#2f3d2a', '#8fd160'], 60, 0.6); burst(L.arena.wallR * TS + 8, L.arena.floor - 40, 12, ['#2f3d2a', '#8fd160'], 60, 0.6);
}
function queenWinded(e, blocked) {
  e.mode = 'winded'; e.modeT = e.phase === 2 ? 1.1 : 1.5; e.vx = 0; e.vy = 0; e.y = L.arena.floor;
  shakeCam(4); SFX.thud(); dust(e.x, e.y, 10); number(e.x, e.y - 20, blocked ? 'STAGGERED' : 'WINDED', '#8fd160');
}
function queenDies(who) {
  SFX.bossDown(); setView('normal'); bossWon = 2.2; bossActive = false; camLock = null; tongue = null; slowT = 1.0; fires = fires.filter(f => f.life < 900); music.play(L.music || 'theme');
  for (const e of enemies) if (e.alive && (e.t === 'wasp' || e.t === 'hopper') && e.drone) { e.alive = false; burst(e.x, e.y - 3, 8, COLS[e.t], 70, 0.5); spawnCorpse(e, 1); }
  setWall(L.arena.wallL, false); setWall(L.arena.wallR, false);
  bossEnd(who);
}

// Each of them goes out in its own way. One shared thud for eight bosses was the cheapest thing in the game.
function bossEnd(e) {
  if (!e) return;
  const A = L.arena, floor = A ? A.floor : e.y, x = e.x, y = e.y;
  const say = (t, col) => number(x, y - 40, t, col || '#ffd36b');
  switch (e.t) {
    case 'queen': { // the hive loses its head: the comb spills, the swarm drops out of the air
      shakeCam(9); zoomKick(1.16, 0.6); killFlash = 0.12;
      for (let i = 0; i < 40; i++) burst(x + (Math.random() - 0.5) * 60, y - 10 - Math.random() * 40, 1, ['#e0b040', '#fff1a0', '#6a4a2a'], 130, 1.1, 420, Math.random() < 0.4 ? 2 : 1);
      for (let i = 0; i < 10; i++) parts.push({ x: x + (Math.random() - 0.5) * 50, y: y - 30, vx: (Math.random() - 0.5) * 40, vy: -60, life: 1.6, max: 1.6, col: '#dfe8ff', size: 2, grav: 90 }); // the wings shed
      for (const pr of props) if (pr.t === 'nest') { pr.fallen = true; burst(pr.x, pr.y, 16, ['#c9b27c', '#e0b040'], 80, 0.9); }
      ringAt(x, y - 12, 56, '#ffd36b', 0.6); SFX.queenShriek(); say('THE COMB SPILLS'); break;
    }
    case 'frog': { // he goes down on the boards and the whole pond answers
      shakeCam(10); zoomKick(1.18, 0.6);
      for (const d of [-1, 1]) waves.push({ x: x + d * 24, y: floor, dir: d, life: 2.6, sp: 210 });
      for (let i = 0; i < 30; i++) parts.push({ x: x + (Math.random() - 0.5) * 90, y: floor - 4, vx: (Math.random() - 0.5) * 150, vy: -80 - Math.random() * 120, life: 1.2, max: 1.2, col: Math.random() < 0.5 ? '#bfe6f5' : '#8fd160', size: 2, grav: 380 });
      for (const pl of (L.pools || [])) if (pl.x0 !== undefined) for (let i = 0; i < 8; i++) ripples.push({ x: pl.x0 + Math.random() * (pl.x1 - pl.x0), life: 1 });
      SFX.frogBoom(); SFX.splash(); say('THE POND GOES QUIET', '#8fd160'); break;
    }
    case 'king': { // the crown comes off, the fires die, and what is left of the court runs
      shakeCam(11); zoomKick(1.2, 0.7); killFlash = 0.14;
      for (let i = 0; i < 26; i++) burst(x + (Math.random() - 0.5) * 40, y - 20 - Math.random() * 30, 1, ['#ffd34a', '#fff6c8', '#c9463d'], 150, 1.3, 400, 2);
      for (let i = 0; i < 9; i++) parts.push({ x: x + (Math.random() - 0.5) * 8, y: y - 44, vx: -60 - Math.random() * 90, vy: -200 - Math.random() * 60, life: 1.7, max: 1.7, col: i % 2 ? '#ffd34a' : '#fff6c8', size: 2, grav: 420 }); // the crown, going over the carpet
      for (const pr of props) if (pr.t === 'firepit') { pr.period = 99999; pr.lit = false; }
      fires = fires.filter(f => !f.pit && f.life < 900);
      for (const h of enemies) if (h.alive && (h.t === 'hound' || h.t === 'sprig' || h.t === 'shield')) { h.face = Math.sign(h.x - x) || 1; h.vx = h.face * 150; h.vy = -140; h.stagger = Math.max(h.stagger || 0, 0.8); burst(h.x, h.y - 6, 5, ['#e8dcc0'], 40, 0.4); }
      SFX.kingLaugh(); SFX.crack(); say('THE CROWN COMES OFF'); break;
    }
    case 'ram': { // he takes the wall one last time and the hill comes down with him
      shakeCam(12); zoomKick(1.18, 0.7); rumble(90, 0.9);
      for (let i = 0; i < 34; i++) parts.push({ x: x + (Math.random() - 0.5) * 70, y: floor - Math.random() * 30, vx: (Math.random() - 0.5) * 140, vy: -60 - Math.random() * 100, life: 1.4, max: 1.4, col: ['#8a919c', '#5a6270', '#c9b27c'][(Math.random() * 3) | 0], size: 2, grav: 420 });
      for (let i = 0; i < 6; i++) rocks.push({ x: x + (Math.random() - 0.5) * 80, y: floor - 150, vx: 0, vy: 0, t: 0, dead: false });
      dust(x - 20, floor, 14); dust(x + 20, floor, 14);
      SFX.bellow(); SFX.stone(); say('THE HORNS BREAK', '#c9d1dc'); break;
    }
    case 'owl': { // it comes down through the boughs and every lantern in the village catches
      shakeCam(9); zoomKick(1.15, 0.6);
      for (let i = 0; i < 44; i++) parts.push({ x: x + (Math.random() - 0.5) * 56, y: y - 16 - Math.random() * 40, vx: (Math.random() - 0.5) * 90, vy: -20 + Math.random() * 40, life: 2.2 + Math.random(), max: 3.2, col: ['#e8dcc0', '#c9b27c', '#7a5a3a'][(Math.random() * 3) | 0], size: 2, grav: 26 }); // feathers, and they take their time
      let lit = 0; for (const pr of props) if ((pr.t === 'lantern' || pr.t === 'minerlamp') && !pr.lit) { pr.lit = true; pr.hits = 0; lit++; burst(pr.x, pr.y - 8, 6, ['#ffd36b', '#fff6c8'], 40, 0.6); }
      SFX.owlHoot(); if (lit) SFX.spark(); say('THE VILLAGE LIGHTS UP'); break;
    }
    case 'golem': { // it comes apart along its colours
      shakeCam(10); zoomKick(1.2, 0.7); killFlash = 0.16; flash = Math.max(flash, 0.3);
      for (const [col, n] of [['#bfe6f5', 18], ['#c8a8ff', 18], ['#a8ffb8', 18], ['#ff7ab8', 10], ['#ffffff', 8]])
        for (let i = 0; i < n; i++) parts.push({ x: x + (Math.random() - 0.5) * 34, y: y - 8 - Math.random() * 34, vx: (Math.random() - 0.5) * 220, vy: -140 + Math.random() * 90, life: 1.1 + Math.random() * 0.8, max: 1.9, col, size: Math.random() < 0.5 ? 2 : 1, grav: 380 });
      for (let k = 0; k < 4; k++) ringAt(x, y - 16, 20 + k * 14, ['#bfe6f5', '#c8a8ff', '#a8ffb8', '#ffffff'][k], 0.5 + k * 0.12);
      SFX.golemShatter(); SFX.crack(); say('IT COMES APART', '#bfe6f5'); break;
    }
    case 'windcaller': { // the kite takes him off the summit, and the moor stops breathing
      shakeCam(8); zoomKick(1.14, 0.8);
      for (const z of (L.gusts || [])) { z.wasOn = z.on; z.on = 0; }
      for (let i = 0; i < 50; i++) parts.push({ x: camX + Math.random() * VW, y: camY + Math.random() * VH, vx: 200 + Math.random() * 200, vy: (Math.random() - 0.5) * 40, life: 0.9, max: 0.9, col: '#dfe8c0', size: 1, grav: 0 }); // one last gust, going out
      for (let i = 0; i < 16; i++) parts.push({ x: x + (Math.random() - 0.5) * 30, y: y - 20 - Math.random() * 20, vx: (Math.random() - 0.5) * 60, vy: -120 - Math.random() * 60, life: 1.8, max: 1.8, col: ['#9a5acc', '#f0e4ff', '#c9463d'][(Math.random() * 3) | 0], size: 2, grav: 120 });
      SFX.callerBlast(); say('THE WIND DROPS', '#bfe6f5'); break;
    }
    case 'gqueen': { // the last of the goblin line: the crown comes off and goes over the edge
      shakeCam(14); zoomKick(1.24, 1.0); killFlash = 0.25; flash = Math.max(flash, 0.45); rumble(120, 1); bossWon = 3.4;
      for (let k = 0; k < 6; k++) ringAt(x, y - 26, 16 + k * 16, k % 2 ? '#e0b040' : '#c9a0ff', 0.5 + k * 0.12);
      for (let i = 0; i < 60; i++) parts.push({ x: x + (Math.random() - 0.5) * 40, y: y - 10 - Math.random() * 46, vx: (Math.random() - 0.5) * 280, vy: -220 + Math.random() * 120, life: 1.4 + Math.random() * 1.2, max: 2.6, col: ['#5a2a7a', '#e0b040', '#6faa4a', '#f2ece0', '#c9463d'][(Math.random() * 5) | 0], size: 2, grav: 280 });
      bolts.push({ x, y: y - 20, life: 0.5, storm: true }); SFX.thunder(); SFX.bellow(); SFX.golemShatter(); say('THE QUEEN IS FALLEN', '#e0b040'); break; }
    case 'roc': { // she comes down for the last time, and the glass comes off her all at once
      shakeCam(12); zoomKick(1.2, 0.8); killFlash = 0.16; rumble(80, 0.8);
      for (let k = 0; k < 4; k++) ringAt(x, y - 14, 14 + k * 14, k % 2 ? '#bfe6f5' : '#e8e0d0', 0.5 + k * 0.1);
      for (let i = 0; i < 46; i++) parts.push({ x: x + (Math.random() - 0.5) * 50, y: y - 10 - Math.random() * 30, vx: (Math.random() - 0.5) * 240, vy: -200 + Math.random() * 120, life: 1.4 + Math.random(), max: 2.4, col: ['#bfe6f5', '#eefaff', '#8a8478', '#e8e0d0'][(Math.random() * 4) | 0], size: 2, grav: 300 });
      SFX.queenShriek(); SFX.golemShatter(); say('SHE COMES DOWN FOR GOOD', '#bfe6f5'); break; }
    case 'suncatcher': { // it lets go of a thousand years of light all at once
      shakeCam(12); zoomKick(1.22, 0.9); killFlash = 0.2; flash = Math.max(flash, 0.35);
      for (let k = 0; k < 5; k++) ringAt(x, y - 24, 16 + k * 16, k % 2 ? '#ffe6a0' : '#bfe6f5', 0.5 + k * 0.1);
      for (let i = 0; i < 54; i++) parts.push({ x: x + (Math.random() - 0.5) * 40, y: y - 20 - Math.random() * 40, vx: (Math.random() - 0.5) * 260, vy: -180 + Math.random() * 100, life: 1.4 + Math.random(), max: 2.4, col: ['#bfe6f5', '#eefaff', '#ffe6a0', '#ffffff'][(Math.random() * 4) | 0], size: 2, grav: 340 });
      SFX.golemShatter(); SFX.crack(); say('THE LIGHT GOES OUT OF IT', '#ffe6a0'); break; }
    case 'lance': { // he goes down on the boards and the bridge feels it
      shakeCam(12); zoomKick(1.2, 0.8); killFlash = 0.14; rumble(90, 0.9);
      for (let i = 0; i < 30; i++) parts.push({ x: x + (Math.random() - 0.5) * 40, y: y - 10 - Math.random() * 34, vx: (Math.random() - 0.5) * 180, vy: -140 + Math.random() * 80, life: 1.5, max: 1.5, col: ['#9aa3b0', '#5a6270', '#c9463d', '#e0b040'][(Math.random() * 4) | 0], size: 2, grav: 420 });
      for (const dd of [-1, 1]) waves.push({ x: x + dd * 20, y: floor, dir: dd, life: 2.4, sp: 200 });
      SFX.bellow(); SFX.heavy(); SFX.crack(); say('THE BRIDGE IS YOURS', '#ffd36b'); break; }
    case 'mother': { shakeCam(10); zoomKick(1.18, 0.8); say('THE WOOD BREATHES AGAIN', '#8fd160'); break; }
    default: { shakeCam(8); zoomKick(1.12, 0.5); break; }
  }
}
// The Chieftain's death is not the end: the hall burns from the floor up and you climb the rafters to the way out.
function chiefDies() {
  SFX.bossDown();
  setView('normal'); bossActive = false; camLock = null; slowT = 1.0; music.play(L.music || 'theme');
  setWall(L.arena.wallL, false); setWall(L.arena.wallR, false);
  const A = L.arena; escape = { t: 0, fireY: A.floor + 6, x0: A.x0 - 8, x1: A.x1 + 8, hurtT: 0 };
  gate = { x: (L.escapeGate || 344) * TS + 8, y: 9 * TS };
  fires = fires.filter(f => f.life < 900); for (const pr of props) if (pr.t === 'brazier') { pr.lit = false; pr.tipped = true; }
  number(P.x, P.y - 40, 'THE HALL BURNS. CLIMB.', '#ff6b2c'); SFX.roar(); shakeCam(6); zoomKick(1.1, 0.5);
}
function updateVines(dt) {
  for (const v of vines) { v.t += dt; if (v.t < v.tell) { if (Math.random() < dt * 30) parts.push({ x: v.x + (Math.random() - 0.5) * 8, y: v.y - Math.random() * 10, vx: v.dir * 20, vy: -40, life: 0.3, max: 0.3, col: '#8fd160', size: 2, grav: 100 }); continue; }
    if (v.t - dt < v.tell) { shakeCam(2); SFX.crack(); }
    v.x += v.dir * 120 * dt; if ((v.dir > 0 && v.x > v.end) || (v.dir < 0 && v.x < v.end)) v.done = true;
    if (!P.dead && P.y > v.y - 10 && P.y <= v.y + 2 && P.x > Math.min(v.x, v.x - v.dir * v.len) - 4 && P.x < Math.max(v.x, v.x - v.dir * v.len) + 4 && !(v.hitT > 0)) { v.hitT = 0.6; const res = damagePlayer(v.x, DMG.vine, { up: true, unblockable: true }); if (res === 'hit') number(P.x, P.y - 24, 'TRIPPED', '#8fd160'); }
    v.hitT = Math.max(0, (v.hitT || 0) - dt);
  }
  vines = vines.filter(v => !v.done);
}
function updateRain(dt) {
  for (const r of rain) { r.t -= dt; if (r.t <= 0 && !r.fired) { r.fired = true; if (r.bolt) {} else seeds.push({ x: r.x, y: r.y - 170, vx: 0, vy: 240, g: 260, dead: false, life: 1.6, arrow: true, owner: r.owner }); } }
  for (const b of bolts) b.life -= dt; bolts = bolts.filter(b => b.life > 0);
  rain = rain.filter(r => r.t > -0.2);
}
function updateEscape(dt) {
  if (!escape) return; escape.t += dt; escape.hurtT = Math.max(0, escape.hurtT - dt);
  escape.fireY = Math.max(10 * TS + 2, escape.fireY - (escape.t < 2 ? 2 : 7.5) * dt);
  if (Math.random() < dt * 30) parts.push({ x: escape.x0 + Math.random() * (escape.x1 - escape.x0), y: escape.fireY - Math.random() * 6, vx: (Math.random() - 0.5) * 20, vy: -40 - Math.random() * 60, life: 0.7, max: 0.7, col: Math.random() < 0.5 ? '#ff9a5c' : '#ffd36b', size: Math.random() < 0.3 ? 2 : 1, grav: -20 });
  for (const e of enemies) if (e.alive && e.t !== 'chief' && e.y > escape.fireY + 2 && e.x > escape.x0 && e.x < escape.x1 && !(e.fireT > 0)) { e.fireT = 0.6; hurtEnemy(e, 10, e.x, false); }
  if (Math.floor(escape.t * 2) !== Math.floor((escape.t - dt) * 2) && Math.random() < 0.4) shakeCam(1);
}
function drawEscape(cx, cy) {
  if (!escape) return; const y = Math.round(escape.fireY - cy), x0 = Math.round(escape.x0 - cx), x1 = Math.round(escape.x1 - cx);
  const gr = g.createLinearGradient(0, y, 0, y + 60); gr.addColorStop(0, 'rgba(255,140,60,0.75)'); gr.addColorStop(1, 'rgba(180,40,20,0.35)'); g.fillStyle = gr; g.fillRect(x0, y, x1 - x0, VH);
  for (let x = x0 - 6; x < x1; x += 14) g.drawImage(PROP.fire[Math.floor(time * 12 + x) % 3], x, y - 16 + Math.round(Math.sin(time * 5 + x) * 2));
  g.globalCompositeOperation = 'lighter'; const gl = g.createLinearGradient(0, y - 60, 0, y); gl.addColorStop(0, 'rgba(255,120,40,0)'); gl.addColorStop(1, 'rgba(255,120,40,0.35)'); g.fillStyle = gl; g.fillRect(x0, y - 60, x1 - x0, 60); g.globalCompositeOperation = 'source-over';
}
function drawEscapeHUD() {
  if (!escape || !gate || state !== 'play') return; const gx = Math.round(gate.x - camX), gy = Math.round(gate.y - camY); const bob = Math.round(Math.sin(time * 6) * 2);
  if (gy < 10 || gx < 0 || gx > VW) { const ax = Math.max(8, Math.min(VW - 8, gx)); g.fillStyle = '#ffd36b'; g.fillRect(ax - 1, 30 + bob, 2, 8); g.fillRect(ax - 3, 32 + bob, 6, 2); g.fillRect(ax - 5, 34 + bob, 10, 1); text('GATE', ax, 40 + bob, '#ffd36b', 'center', 6); }
  else { g.fillStyle = '#ffd36b'; g.fillRect(gx - 1, gy - 64 + bob, 2, 6); g.fillRect(gx - 3, gy - 60 + bob, 6, 2); }
  if (escape.t < 6) text('THE HALL BURNS. CLIMB TO THE GATE', VW / 2, 34, Math.floor(time * 4) % 2 ? '#ff9a5c' : '#fff6e0', 'center');
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
const frogFloor = (A, x) => { const tx = Math.floor(x / TS); for (let ty = Math.floor(A.floor / TS) - 3; ty <= Math.floor(A.floor / TS) + 2; ty++) if (isSolid(tx, ty)) return ty * TS; return A.floor; }; // the real ground: the dais lifts him, the shallows drop him to the pond bed (he used to stand on the water)
function updateFrog(e, dt) {
  const A = L.arena, p2 = e.phase === 2; const floor = frogFloor(A, e.x);
  e.modeT -= dt; e.anim += dt;
  if (e.headT > 0) { e.headT -= dt; if (e.headT <= 0) e.headHits = 0; }
  const flies = enemies.filter(d => d.alive && d.t === 'hopper' && d.drone).length;
  e.vy += 1000 * dt; if (e.vy > 400) e.vy = 400;
  const grounded = e.y >= frogFloor(A, e.x);
  switch (e.mode) {
    case 'sleep': e.y = floor; e.vy = 0; return;
    case 'wake': e.y = floor; e.vy = 0; if (e.modeT <= 0) { e.mode = 'idle'; e.modeT = 1.0; } break;
    case 'idle': e.y = floor; e.vy = 0; e.face = Math.sign(P.x - e.x) || e.face; if (e.vaultT > 0) e.vaultT -= dt;
      if (!(e.vaultT > 0) && Math.min(e.x - A.x0, A.x1 - e.x) < 72 && Math.abs(P.x - e.x) < 90) { e.mode = 'crouch'; e.vault = true; e.modeT = 0.3; number(e.x, e.y - e.h - 12, '!', '#ffd36b'); break; } /* pinned to a wall with you on him: he vaults the court instead of dying there */
      if (e.modeT <= 0) {
        const pool = ['tongue', 'leap', 'spit', 'hopAway', 'inhale']; if (flies < (p2 ? 3 : 2)) pool.push('croak', 'croak'); if (p2) pool.push('leap', 'hopAway', 'inhale');
        let pick = pool[(Math.random() * pool.length) | 0]; if (pick === e.last) pick = pool[(Math.random() * pool.length) | 0]; e.last = pick;
        if (pick === 'tongue') { e.mode = 'tongueTell'; e.modeT = p2 ? 0.35 : 0.5; SFX.buzz(); }
        else if (pick === 'leap') { e.mode = 'crouch'; e.modeT = p2 ? 0.3 : 0.45; number(e.x, e.y - e.h - 12, '!', '#ffd36b'); }
        else if (pick === 'spit') { e.mode = 'spit'; e.modeT = 0.6; e.shots = p2 ? 2 : 1; e.shotT = 0.2; }
        else if (pick === 'hopAway') { e.mode = 'hopAway'; e.modeT = 0.15; }
        else if (pick === 'inhale') { e.mode = 'inhaleTell'; e.modeT = 0.5; number(e.x, e.y - e.h - 12, 'BREATHES IN', '#ffd36b'); SFX.gasp(); }
        else { e.mode = 'croak'; e.modeT = 1.0; SFX.croak(); number(e.x, e.y - e.h - 12, 'CROAK', '#ffd36b'); }
      }
      break;
    case 'tongueTell': if (e.modeT <= 0) { e.mode = 'tongue'; e.modeT = 0.55; tongue = { x0: e.x + e.face * 22, y: floor - 13, dir: e.face, len: 0, max: p2 ? 130 : 110, active: true }; SFX.tongue(); } break;
    case 'inhaleTell': e.y = floor; e.vy = 0; if (e.modeT <= 0) { e.mode = 'inhale'; e.modeT = p2 ? 1.6 : 1.3; SFX.buzz(); } break;
    case 'inhale': { e.y = floor; e.vy = 0; // the pull: block to dig in, or you are dragged to his mouth and bitten
      if (!P.dead && Math.abs(P.y - e.y) < 40 && Math.abs(P.x - e.x) < 190) { const dir = Math.sign(e.x - P.x) || 1; const pull = P.block ? 22 : P.ground ? 84 : 120; P.x += dir * pull * dt; if (Math.random() < dt * 40) parts.push({ x: P.x + (Math.random() - 0.5) * 30, y: P.y - 4 - Math.random() * 12, vx: dir * 120, vy: (Math.random() - 0.5) * 20, life: 0.35, max: 0.35, col: '#dfe8ff', size: 1, grav: 0 });
        if (Math.abs(P.x - e.x) < 26) { const res = damagePlayer(e.x, DMG.frog, {}); if (res === 'blocked') { e.mode = 'dazed'; e.modeT = 1.2; number(e.x, e.y - e.h - 12, 'CHOKED', '#8fd160'); SFX.croak(); } else if (res === 'hit') { P.vx = -dir * 200; P.vy = -220; number(P.x, P.y - 24, 'BITTEN', '#ff6b6b'); e.mode = 'idle'; e.modeT = 1.0; } } }
      if (e.mode === 'inhale' && e.modeT <= 0) { e.mode = 'idle'; e.modeT = 0.9; } break; }
    case 'tongue': { const t = 0.55 - e.modeT; tongue.len = t < 0.2 ? tongue.max * (t / 0.2) : t < 0.35 ? tongue.max : tongue.max * Math.max(0, (0.55 - t) / 0.2); if (e.modeT <= 0) { tongue = null; e.mode = 'idle'; e.modeT = p2 ? 0.7 : 1.0; } break; }
    case 'hopAway': e.y = floor; e.vy = 0; if (e.modeT <= 0) { const dir = P.x < e.x ? 1 : -1; if ((dir > 0 ? A.x1 - e.x : e.x - A.x0) < 110) { e.mode = 'crouch'; e.vault = true; e.modeT = 0.25; break; } const tx = Math.max(A.x0 + 24, Math.min(A.x1 - 24, e.x + dir * 120)); e.mode = 'hop'; e.vy = -260; e.vx = (tx - e.x) / 0.52; e.modeT = 1; SFX.leap(); number(e.x, e.y - e.h - 12, 'HOP', '#9aa39a'); } break;
    case 'hop': e.x += e.vx * dt; e.y += e.vy * dt; if (e.vy > 0 && e.y >= frogFloor(A, e.x)) { e.y = frogFloor(A, e.x); e.vy = 0; e.vx = 0; dust(e.x, e.y, 6); e.mode = 'idle'; e.modeT = 0.5; e.idleHits = 0; } break;
    case 'crouch': if (e.modeT <= 0) { e.mode = 'leap';
        if (e.vault) { const away = Math.sign((A.x0 + A.x1) / 2 - e.x) || 1, tx = Math.max(A.x0 + 30, Math.min(A.x1 - 30, e.x + away * (220 + Math.random() * 80))); e.vy = -470; e.vx = (tx - e.x) / 0.94; e.face = away; } /* a high bound over your head to the far side */
        else { const dx = Math.max(A.x0 + 20, Math.min(A.x1 - 20, P.x)) - e.x; e.vy = -380; e.vx = dx / 0.76; }
        e.modeT = 2; SFX.leap(); } break;
    case 'leap': e.x += e.vx * dt; e.y += e.vy * dt; /* he never left the ground before: vy was integrated but never applied */ if (e.vy > 0 && e.y >= frogFloor(A, e.x) && e.vault) { const fl2 = frogFloor(A, e.x); e.y = fl2; e.vy = 0; e.vx = 0; e.vault = false; e.vaultT = 3.5; shakeCam(5); SFX.heavy(); dust(e.x, e.y, 12); if (p2) for (const d of [-1, 1]) waves.push({ x: e.x + d * 22, y: fl2, dir: d, life: 1.6, sp: 150 }); e.mode = 'idle'; e.modeT = 0.55; e.idleHits = 0; break; }
      if (e.vy > 0 && e.y >= frogFloor(A, e.x)) { const fl2 = frogFloor(A, e.x); e.y = fl2; e.vy = 0; e.vx = 0; shakeCam(7); SFX.heavy(); zoomKick(1.12, 0.2); dust(e.x, e.y, 16); for (const d of [-1, 1]) waves.push({ x: e.x + d * 22, y: fl2, dir: d, life: 2.2, sp: p2 ? 180 : 150 }); e.mode = 'dazed'; e.modeT = p2 ? 0.7 : 1.0; number(e.x, e.y - e.h - 12, 'DAZED', '#8fd160'); } break;
    case 'dazed': e.y = floor; e.vy = 0; if (e.modeT <= 0) { e.mode = 'idle'; e.modeT = 0.8; } break;
    case 'spit': { e.y = floor; e.vy = 0; e.shotT -= dt; if (e.shots > 0 && e.shotT <= 0) { e.shots--; e.shotT = 0.35; SFX.spit(); const n = 3; for (let i = 0; i < n; i++) { const dx = P.x - e.x, dir = Math.sign(dx) || e.face; const a = -1.15 + i * 0.2; seeds.push({ x: e.x + dir * 20, y: e.y - 18, vx: Math.cos(a) * 170 * dir, vy: Math.sin(a) * 170, dead: false, life: 3, venom: true, g: 320 }); } } if (e.modeT <= 0 && e.shots <= 0) { e.mode = 'idle'; e.modeT = 0.9; } break; }
    case 'croak': e.y = floor; e.vy = 0; if (!e.rose) { e.rose = true; for (const p of (L.pools || [])) if (p.shallow && p.x0 >= A.x0 - 40 && p.x1 <= A.x1 + 40) { p.rise = p2 ? 5 : 3.5; } number(e.x, e.y - e.h - 24, 'THE POND RISES', '#bfe6f5'); SFX.splash(); } if (e.modeT <= 0) { e.rose = false; for (let i = 0; i < 2; i++) { const dx = Math.max(A.x0 + 16, Math.min(A.x1 - 16, e.x + (i ? 70 : -70) + (Math.random() - 0.5) * 30)); const col = Math.random() < 0.6 ? 'green' : 'yellow'; enemies.push({ t: 'hopper', color: col, x: dx, y: floor, vx: 0, vy: -200, w: 8, h: 6, hp: HOP[col].hp, face: -1, alive: true, dying: 0, anim: 0, flash: 0, stagger: 0, timer: 0.6, air: true, drone: true }); burst(dx, floor, 6, ['#5a9a3a', '#8fc85a'], 50, 0.4); } e.mode = 'idle'; e.modeT = 0.9; } break;
  }
  if (e.mode !== 'leap' && e.mode !== 'hop') e.y = Math.min(e.y, frogFloor(A, e.x));
  e.x = Math.max(A.x0 + 20, Math.min(A.x1 - 20, e.x));
  if (e.mode !== 'leap' && e.mode !== 'dazed' && e.mode !== 'hop') e.face = Math.sign(P.x - e.x) || e.face;
}

// ---------- boss: the Goblin Chieftain ----------
// He rotates three weapons: the club (slow, heavy), sword and shield (fast, and the shield turns your blade), and the bow (he backs off and shoots; parry the arrows back).
// Every stance can end in a leap-and-stomp. Half health: he kicks the brazier and two short patches of floor burn by the walls.
const CHIEF_ORDER = ['club', 'sword', 'bow'];
const chiefNext = e => { let i = CHIEF_ORDER.indexOf(e.stance); for (let k = 0; k < 3; k++) { i = (i + 1) % 3; const st = CHIEF_ORDER[i]; if (st === 'sword' || !props.some(pr => pr.t === 'rack' && pr.kind === st && pr.broken)) return st; } return 'sword'; }; // a broken rack takes that weapon out of the fight
const chiefRack = st => props.find(pr => pr.t === 'rack' && pr.kind === st && !pr.broken);
const CHIEF_COL = { club: '#ff6b6b', sword: '#bfe6f5', bow: '#8fd160' }; // every stance tells in its own colour
function chiefSwap(e, st) {
  e.stance = st || chiefNext(e); e.swapN = 0;
  number(e.x, e.y - e.h - 14, e.stance === 'club' ? 'HEFTS THE CLUB' : e.stance === 'sword' ? 'SWORD AND SHIELD' : 'DRAWS THE BOW', '#ffd36b'); SFX.charge();
}
const chiefFloor = (A, x) => { const tx = Math.floor(x / TS); for (let ty = Math.floor(A.floor / TS) - 3; ty <= Math.floor(A.floor / TS); ty++) if (isSolid(tx, ty)) return ty * TS; return A.floor; }; // the dais counts as floor for his leap
function updateChief(e, dt) {
  const A = L.arena, floor = A.floor, p2 = e.phase === 2;
  if (e.plungeT > 0) { e.plungeT -= dt; if (e.plungeT <= 0) e.plungeN = 0; }
  e.modeT -= dt; e.anim += dt; e.vy += 1000 * dt; if (e.vy > 400) e.vy = 400;
  const d = P.x - e.x, ad = Math.abs(d);
  if (!e.stance) { e.stance = 'club'; e.swapN = 0; e.leapT = 5; }
  let want = 0;
  const pickAttack = () => {
    e.swapN++;
    if (e.swapN > 3) { const nx = chiefNext(e); const rk = nx === 'sword' ? null : chiefRack(nx); if (!rk) { e.mode = 'swap'; e.modeT = 0.7; chiefSwap(e, nx); } else { e.mode = 'toRack'; e.next = nx; e.modeT = 4; number(e.x, e.y - e.h - 12, 'TO THE RACK', '#ffd36b'); SFX.chiefBark(); } return; }
    e.leapT -= 1;
    if (e.leapT <= 0 || (ad > 90 && e.stance !== 'bow' && Math.random() < 0.5)) { e.leapT = p2 ? 2 : 3; e.mode = 'crouch'; e.modeT = p2 ? 0.4 : 0.55; number(e.x, e.y - e.h - 12, '!!', '#ff6b6b'); SFX.charge(); return; }
    if (e.stance === 'club') { const pool = ['over', 'sweep', 'grab', 'whirl', 'sweep']; let pick = pool[(Math.random() * pool.length) | 0]; if (pick === e.last) pick = pool[(Math.random() * pool.length) | 0]; e.last = pick;
      dust(e.x - e.face * 6, e.y, 5); shakeCam(1); // the club: a stamp before every swing
      if (pick === 'over') { e.mode = 'raise'; e.modeT = p2 ? 0.7 : 0.9; number(e.x, e.y - e.h - 12, '!!', CHIEF_COL.club); SFX.charge(); }
      else if (pick === 'sweep') { e.mode = 'wind'; e.modeT = p2 ? 0.4 : 0.55; number(e.x, e.y - e.h - 12, '!', CHIEF_COL.club); SFX.buzz(); }
      else if (pick === 'whirl') { e.mode = 'whirlWind'; e.modeT = 0.5; number(e.x, e.y - e.h - 12, '!!', CHIEF_COL.club); SFX.charge(); }
      else { e.mode = 'reach'; e.modeT = 0.5; number(e.x, e.y - e.h - 12, '?', CHIEF_COL.club); } }
    else if (e.stance === 'sword') { const pick = Math.random() < 0.6 ? 'slash' : 'bash'; e.last = pick;
      sparks(e.x + e.face * 8, e.y - 12, e.face, 4); SFX.clank(); // the sword: a glint off the shield before every cut
      if (pick === 'slash') { e.mode = 'slashWind'; e.modeT = p2 ? 0.28 : 0.38; e.combo = 2; number(e.x, e.y - e.h - 12, '!', CHIEF_COL.sword); SFX.buzz(); }
      else { e.mode = 'bashWind'; e.modeT = 0.45; number(e.x, e.y - e.h - 12, '!!', CHIEF_COL.sword); SFX.charge(); } }
    else if (Math.random() < (p2 ? 0.5 : 0.4) && e.last !== 'rain') { e.last = 'rain'; e.mode = 'rainAim'; e.modeT = 0.6; number(e.x, e.y - e.h - 12, '^^', CHIEF_COL.bow); SFX.bow(); }
    else { e.last = 'aim'; e.mode = 'aim'; e.modeT = 0.55; e.shots = p2 ? 3 : 2; number(e.x, e.y - e.h - 12, '^', CHIEF_COL.bow); SFX.bow(); }
  };
  switch (e.mode) {
    case 'sleep': e.y = floor; e.vy = 0; return;
    case 'wake': if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.4; } break;
    case 'swap': if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.3; } break;
    case 'toRack': { const rk = chiefRack(e.next); if (!rk) { e.mode = 'swap'; e.modeT = 0.5; chiefSwap(e, chiefNext(e)); break; } const rd = rk.x - e.x; e.face = Math.sign(rd) || e.face; want = Math.abs(rd) > 10 ? e.face * (p2 ? 80 : 64) : 0; if (Math.abs(rd) <= 10 || e.modeT <= 0) { e.mode = 'swap'; e.modeT = 0.7; chiefSwap(e, e.next); burst(rk.x, rk.y - 10, 6, ['#c9b27c', '#8b6a2a'], 40, 0.4); } break; }
    case 'walk': e.face = Math.sign(d) || e.face;
      if (e.stance === 'bow') { want = ad < 80 ? -e.face * (p2 ? 50 : 36) : ad > 150 ? e.face * 30 : 0; if (e.modeT <= 0 && (ad > 70 || e.x <= A.x0 + 14 || e.x >= A.x1 - 14)) pickAttack(); }
      else { want = ad > 30 ? e.face * (p2 ? 48 : (e.stance === 'sword' ? 40 : 30)) : 0; if (e.modeT <= 0 && ad < (e.stance === 'sword' ? 36 : 40)) pickAttack(); }
      break;
    // club
    case 'raise': if (e.modeT <= 0) { e.mode = 'slam'; e.modeT = 0.35; shakeCam(6); SFX.heavy(); zoomKick(1.08, 0.2); dust(e.x + e.face * 18, e.y, 12); for (const dd of [-1, 1]) if (p2) waves.push({ x: e.x + dd * 20, y: floor, dir: dd, life: 1.6, sp: 150 }); if (!P.dead && Math.sign(P.x - e.x) === e.face && ad < 34 && Math.abs(P.y - e.y) < 22) damagePlayer(e.x, DMG.chiefOver, { unblockable: true }); } break;
    case 'slam': if (e.modeT <= 0) { e.mode = 'planted'; e.modeT = p2 ? 1.0 : 1.4; number(e.x, e.y - e.h - 12, 'PLANTED', '#8fd160'); } break;
    case 'planted': if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.6; } break;
    case 'wind': if (e.modeT <= 0) { e.mode = 'sweep'; e.modeT = 0.3; SFX.slash(); if (!P.dead && Math.sign(P.x - e.x) === e.face && ad < 48 && Math.abs(P.y - e.y) < 22) { const res = damagePlayer(e.x, DMG.chiefSweep); if (res === 'blocked') { e.mode = 'planted'; e.modeT = 0.8; number(e.x, e.y - e.h - 12, 'PARRIED', '#8fd160'); } } } break;
    case 'sweep': if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.7; } break;
    case 'whirlWind': if (e.modeT <= 0) { e.mode = 'whirl'; e.modeT = p2 ? 1.5 : 1.2; e.whirlHit = 0; SFX.slash(); number(e.x, e.y - e.h - 12, 'WHIRL', '#ff6b6b'); } break;
    case 'whirl': e.face = Math.sign(d) || e.face; want = e.face * (p2 ? 72 : 56); e.whirlHit -= dt; if (Math.random() < dt * 24) sparks(e.x + (Math.random() - 0.5) * 30, e.y - 8 - Math.random() * 8, e.face, 2);
      if (Math.floor(e.anim * 6) !== Math.floor((e.anim - dt) * 6)) SFX.slash();
      if (!P.dead && ad < 27 && Math.abs(P.y - e.y) < 22 && !(e.whirlHit > 0)) { e.whirlHit = 0.4; const res = damagePlayer(e.x, DMG.chiefSweep); if (res === 'hit') { P.vx = e.face * 200; P.vy = Math.min(P.vy, -80); } }
      if (e.modeT <= 0) { e.mode = 'planted'; e.modeT = p2 ? 0.9 : 1.2; e.vx = 0; number(e.x, e.y - e.h - 12, 'DIZZY', '#8fd160'); dust(e.x, e.y, 6); } break;
    case 'rainAim': e.face = Math.sign(d) || e.face; if (e.modeT <= 0) { e.mode = 'rainLoose'; e.modeT = 0.5; SFX.bow(); const n = p2 ? 5 : 4; for (let i = 0; i < n; i++) { const x = Math.max(A.x0 + 10, Math.min(A.x1 - 10, P.x + (i - (n - 1) / 2) * 24 + (Math.random() - 0.5) * 10)); rain.push({ x, y: floor, t: 0.85 + i * 0.07, owner: e, fired: false }); seeds.push({ x: e.x + e.face * 6, y: e.y - 14, vx: (x - e.x) / 1.4, vy: -340, g: 0, dead: false, life: 0.45, arrow: true, owner: e }); } number(e.x, e.y - e.h - 12, 'VOLLEY', '#ff6b6b'); } break;
    case 'rainLoose': if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.9; } break;
    case 'reach': if (e.modeT <= 0) { e.mode = 'lunge'; e.modeT = 0.3; e.vx = e.face * 220; SFX.charge(); } break;
    case 'lunge': want = e.vx; if (!P.dead && Math.sign(P.x - e.x) === e.face && ad < 22 && Math.abs(P.y - e.y) < 22 && P.dodge <= 0) { const res = damagePlayer(e.x, DMG.chiefGrab); if (res === 'hit') { P.vx = e.face * 260; P.vy = -200; number(P.x, P.y - 24, 'THROWN', '#ff6b6b'); } e.mode = 'walk'; e.modeT = 0.8; e.vx = 0; } else if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.5; e.vx = 0; } break;
    // sword and shield
    case 'slashWind': if (e.modeT <= 0) { e.mode = 'slash'; e.modeT = 0.22; SFX.slash(); e.x += e.face * 6; if (!P.dead && Math.sign(P.x - e.x) === e.face && ad < 40 && Math.abs(P.y - e.y) < 22) { const res = damagePlayer(e.x, DMG.chiefSweep); if (res === 'blocked') { e.combo = 0; e.mode = 'planted'; e.modeT = 0.9; number(e.x, e.y - e.h - 12, 'PARRIED', '#8fd160'); } } } break;
    case 'slash': if (e.modeT <= 0) { e.combo--; if (e.combo > 0) { e.mode = 'slashWind'; e.modeT = 0.22; e.face = Math.sign(d) || e.face; } else { e.mode = 'walk'; e.modeT = 0.5; } } break;
    case 'bashWind': if (e.modeT <= 0) { e.mode = 'bash'; e.modeT = 0.3; e.vx = e.face * 170; SFX.charge(); } break;
    case 'bash': want = e.vx; if (!P.dead && Math.sign(P.x - e.x) === e.face && ad < 24 && Math.abs(P.y - e.y) < 22) { const res = damagePlayer(e.x, DMG.chiefGrab, { unblockable: true }); if (res === 'hit') { P.vx = e.face * 220; number(P.x, P.y - 24, 'SHIELD BASH', '#ff6b6b'); } e.mode = 'walk'; e.modeT = 0.7; e.vx = 0; } else if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.5; e.vx = 0; } break;
    // bow
    case 'aim': e.face = Math.sign(d) || e.face; if (e.modeT <= 0) { e.mode = 'shoot'; e.modeT = 0.15; e.shots--; SFX.bow(); const sx = e.x + e.face * 10, sy = e.y - 12, Tf = 0.7, G = 320, dx = P.x - sx, dy = (P.y - 8) - sy; seeds.push({ x: sx, y: sy, vx: Math.max(-220, Math.min(220, dx / Tf)), vy: dy / Tf - 0.5 * G * Tf, dead: false, life: 3, arrow: true, g: G, owner: e }); } break;
    case 'shoot': if (e.modeT <= 0) { if (e.shots > 0) { e.mode = 'aim'; e.modeT = 0.4; } else { e.mode = 'walk'; e.modeT = 0.9; number(e.x, e.y - e.h - 12, 'QUIVER EMPTY', '#8fd160'); } } break;
    // the leap and stomp: any stance
    case 'crouch': if (e.modeT <= 0) { e.mode = 'leap'; const tx = Math.max(A.x0 + 16, Math.min(A.x1 - 16, P.x)); e.vy = -400; e.vx = (tx - e.x) / 0.8; e.modeT = 2; e.leapAir = 0; SFX.leap(); } break;
    case 'leap': { const fl = chiefFloor(A, e.x); want = e.vx; e.leapAir += dt; if (e.leapAir > 0.15 && e.vy > 0 && e.y >= fl - 1) { e.y = fl; e.vy = 0; e.vx = 0; shakeCam(8); SFX.heavy(); zoomKick(1.12, 0.25); dust(e.x, e.y, 16); for (const dd of [-1, 1]) waves.push({ x: e.x + dd * 16, y: floor, dir: dd, life: 1.8, sp: p2 ? 170 : 140 }); if (!P.dead && ad < 26 && Math.abs(P.y - e.y) < 20 && P.ground) damagePlayer(e.x, DMG.chiefOver, { unblockable: true }); e.mode = 'landed'; e.modeT = p2 ? 0.7 : 1.0; number(e.x, e.y - e.h - 12, 'STOMP', '#ff6b6b'); } break; }
    case 'landed': if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.5; } break;
  }
  if (e.mode !== 'lunge' && e.mode !== 'bash' && e.mode !== 'leap') e.vx += (want - e.vx) * Math.min(1, dt * (e.mode === 'whirl' ? 3 : 6));
  if (e.mode === 'leap') { e.x += e.vx * dt; e.y += e.vy * dt; const fl = chiefFloor(A, e.x); if (e.y > fl) e.y = fl; }
  else { const r = moveBody(e, e.vx * dt, e.vy * dt, false); if (r.ground) e.vy = 0; }
  e.x = Math.max(A.x0 + 12, Math.min(A.x1 - 12, e.x));
  // phase two: he kicks the brazier and two short strips of floor burn by the walls
  if (p2 && !e.burning) { e.burning = true; number(e.x, e.y - 30, 'BURN IT DOWN', '#ff6b2c'); SFX.roar(); for (const pr of props) if (pr.t === 'brazier') { pr.lit = false; pr.tipped = true; } for (let i = 0; i < 3; i++) { fires.push({ x: A.x0 + 10 + i * 14, y: floor, life: 999, delay: Math.random() * 0.8 }); fires.push({ x: A.x1 - 10 - i * 14, y: floor, life: 999, delay: Math.random() * 0.8 }); } }
}
const chiefShielded = e => e.t === 'chief' && e.stance === 'sword' && e.mode !== 'planted' && e.mode !== 'landed' && e.mode !== 'swap' && e.mode !== 'leap' && e.mode !== 'crouch';

// ---------- mini-boss: the Hound Master ----------
// ---------- The Crags: harpies dive, goat riders charge and hop, the Ram Lord hits walls ----------
// The hill troll: keeps its distance and hurls boulders in an arc at where you are heading; swats when you close. Soft hide: everything hurts it.
// Goblin miner: walks at you, digs through soft rock in the way, swings a pick with a slow tell. Drops a lit lamp.
function updateMiner(e, dt) {
  e.modeT -= dt; e.vy += 1000 * dt; if (e.vy > 300) e.vy = 300;
  const d = P.x - e.x, ad = Math.abs(d), near = ad < 220 && Math.abs(e.y - P.y) < 60 && !P.dead;
  let want = 0;
  if (e.glass && e.mode !== 'smashTell' && e.mode !== 'swingTell' && e.mode !== 'swing' && near && ad < 110 && P.ground && P.groundTile === T.CRYST && (e.smashCd = (e.smashCd || 0) - dt) <= 0) { e.mode = 'smashTell'; e.modeT = 0.8; e.smashCd = 3.5; e.face = Math.sign(d) || e.face; number(e.x, e.y - e.h - 12, 'HE BREAKS THE GLASS', '#bfe6f5'); SFX.gobHurt(); }
  if (e.mode === 'smashTell') { if (e.modeT <= 0) { e.mode = 'swing'; e.modeT = 0.4; SFX.crack(); SFX.clank(); shakeCam(3); const ty = Math.floor((P.y + 2) / TS); for (const tx of [Math.floor((P.x - 6) / TS), Math.floor(P.x / TS), Math.floor((P.x + 6) / TS)]) { const i = ty * LW + tx; if (L.grid[i] === T.CRYST) crackCrystal(i, 3); } sparks(e.x + e.face * 8, e.y - 4, e.face, 6); } }
  else if (e.mode === 'swingTell') { if (e.modeT <= 0) { e.mode = 'swing'; e.modeT = 0.3; SFX.slash(); if (!P.dead && Math.sign(P.x - e.x) === e.face && ad < 26 && Math.abs(P.y - e.y) < 20) { const res = damagePlayer(e.x, DMG.miner); if (res === 'hit') P.vx = e.face * 160; else if (res === 'blocked') { e.stagger = 1.0; number(e.x, e.y - e.h - 10, 'PARRIED', '#8fd160'); } } } }
  else if (e.mode === 'swing') { if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.8; } }
  else if (e.mode === 'dig') { e.digT -= dt; if (Math.random() < dt * 20) parts.push({ x: e.x + e.face * 8, y: e.y - 6 + (Math.random() - 0.5) * 12, vx: -e.face * 40, vy: -30, life: 0.3, max: 0.3, col: '#7a6a58', size: 1, grav: 300 }); if (e.digT <= 0) { const tx = Math.floor((e.x + e.face * 10) / TS); for (const ty of [Math.floor((e.y - 4) / TS), Math.floor((e.y - 14) / TS)]) { const i = ty * LW + tx; if (L.grid[i] === T.SOFT) { L.grid[i] = T.AIR; tileSpr[i] = null; destroyed.add(i); burst(tx * TS + 8, ty * TS + 8, 8, ['#7a6a58', '#5a4a3a'], 60, 0.5); } } SFX.stone(); shakeCam(2); e.mode = 'walk'; e.modeT = 0.2; } }
  else if (e.stagger > 0) want = 0;
  else if (near) { e.face = Math.sign(d) || e.face; const tx = Math.floor((e.x + e.face * 10) / TS), soft = tileAt(tx, Math.floor((e.y - 4) / TS)) === T.SOFT || tileAt(tx, Math.floor((e.y - 14) / TS)) === T.SOFT;
    if (soft) { e.mode = 'dig'; e.digT = 0.7; number(e.x, e.y - e.h - 10, 'DIGS', '#c9b27c'); }
    else if (ad < 24 && e.modeT <= 0) { e.mode = 'swingTell'; e.modeT = 0.55; number(e.x, e.y - e.h - 10, '!', '#ffd36b'); SFX.gobHurt(); }
    else want = ad > 20 ? e.face * e.speed : 0; }
  else want = e.face * 10;
  e.vx += (want - e.vx) * Math.min(1, dt * 6);
  const aheadX = e.x + Math.sign(e.vx || e.face) * (e.w / 2 + 2), ftx = Math.floor(aheadX / TS), fty = Math.floor((e.y + 1) / TS);
  const r = moveBody(e, e.vx * dt, e.vy * dt, false); if (r.ground) e.vy = 0;
  if (r.ground && tileAt(ftx, fty) === T.AIR && !isOneWay(tileAt(ftx, fty))) { e.vx = 0; if (!near) e.face = -e.face; }
  if (r.hitX) { e.vx = 0; if (!near) e.face = -e.face; }
}
// how bright the knight is: the lamp relic, the pyromancer's flare, nearby fires
function playerLight() { let r = P.relic === 'lamp' ? 90 : 26; if (wisp) r = Math.max(r, 64); if (P.torch > 0) r = Math.max(r, 84); if (isPyro() && P.jet) r = Math.max(r, 70); if (isPyro() && embers.length) r = Math.max(r, 50); return r; }
// Cave bat: hangs in the dark; flies at the nearest light, bites what carries it, then goes back to its roost.
const windAt = (x, y) => { for (const z of (L.gusts || [])) { if (z.arena && (!bossActive || callerCalm())) continue; if (x > z.x0 && x < z.x1 && y > z.y0 && y <= z.y1 + 4) { const ph = (time + (z.phase || 0)) % z.period; if (ph >= z.on) return 0; return z.alt ? (Math.floor((time + (z.phase || 0)) / z.period) % 2 ? -z.dir : z.dir) : z.dir; } } return 0; };
function updateCrow(e, dt) { // storm crows: they come down the wind in strings, and they do not turn for anyone
  if (!e.go) { if (!P.dead && Math.abs(e.x - P.x) < e.wake) { e.go = true; SFX.caw(); } else return; }
  e.x += e.vx * dt; e.y = e.hy + Math.sin(e.anim * e.freq + e.ph) * e.amp; e.face = e.vx >= 0 ? 1 : -1;
  if (e.x < camX - 60) e.alive = false;
}
function updateHorn(e, dt) { // a goblin with a ram's horn: he winds it at you, and a horn's worth of wind is a gust of your own to fight
  e.modeT -= dt; e.vy = Math.min(320, e.vy + 1000 * dt); const r = moveBody(e, 0, e.vy * dt, false); if (r.ground) e.vy = 0;
  const d = P.x - e.x, ad = Math.abs(d), near = !P.dead && ad < 170 && Math.abs(P.y - e.y) < 60;
  if (e.stagger > 0) { e.mode = 'idle'; e.modeT = 1.2; return; }
  if (e.mode === 'idle') { e.face = Math.sign(d) || e.face; if (near && e.modeT <= 0) { e.mode = 'tell'; e.modeT = 0.7; SFX.snort(); } }
  else if (e.mode === 'tell') { if (e.modeT <= 0) { e.mode = 'blow'; e.modeT = 1.5; SFX.hornBlast(); } }
  else if (e.mode === 'blow') {
    if (!P.dead && Math.sign(d) === e.face && ad < 160 && Math.abs(P.y - e.y) < 44) { const k = 1 - ad / 180; if (P.ground) moveBody(P, e.face * 120 * k * dt, 0, false); else P.vx += e.face * 520 * k * dt; P.gustT = 0.25; }
    if (Math.random() < dt * 50) parts.push({ x: e.x + e.face * (10 + Math.random() * 30), y: e.y - 8 + (Math.random() - 0.5) * 16, vx: e.face * (220 + Math.random() * 120), vy: (Math.random() - 0.5) * 20, life: 0.5, max: 0.5, col: Math.random() < 0.5 ? '#ffffff' : '#dfe8c0', size: Math.random() < 0.3 ? 2 : 1, grav: 0 });
    if (e.modeT <= 0) { e.mode = 'idle'; e.modeT = 2.2; } }
}
function updateBale(e, dt) { // a heather bale the wind rolls along the moor; cut it and it bursts, and the next one comes tumbling after
  e.burn = 0;
  if (e.gone > 0) { e.gone -= dt; if (e.gone <= 0) { const w = windAt(e.x, e.y - 6) || e.lastW || 1; e.x = (w > 0 ? e.x0 : e.x1) * TS + 8; e.y = e.y0 - 40; e.vx = w * 60; e.vy = 0; e.hp = e.hp0; burst(e.x, e.y - 6, 6, COLS.bale, 30, 0.4); } return; }
  const w = windAt(e.x, e.y - 6); if (w) e.lastW = w;
  e.vx += ((w ? w * 150 : 0) - e.vx) * Math.min(1, dt * (w ? 1.6 : 0.7));
  e.vy = Math.min(320, e.vy + 1000 * dt);
  const r = moveBody(e, e.vx * dt, e.vy * dt, false); if (r.ground) { e.vy = Math.abs(e.vx) > 70 && Math.random() < dt * 5 ? -110 : 0; if (e.vy < 0 && Math.abs(e.x - P.x) < 200) SFX.baleBump(); } if (r.hitX) e.vx = -e.vx * 0.4;
  e.spin = (e.spin || 0) + e.vx * dt / 6; e.face = 1;
  if (e.x < e.x0 * TS - 8 || e.x > e.x1 * TS + 24) e.gone = 1.5;
  if (Math.abs(e.vx) > 60 && r.ground && Math.random() < dt * 8) dust(e.x - Math.sign(e.vx) * 5, e.y, 1);
}
function updateKite(e, dt) { // a goblin under a box kite: drifts on the gusts, edges over you, drops a stone. Cut the string or the goblin and both come down.
  e.anim += dt; e.modeT -= dt;
  if (e.mode === 'fall') { e.vy += 700 * dt; e.y += e.vy * dt; e.x += e.vx * dt; e.vx *= Math.pow(0.2, dt); const ty = Math.floor((e.y + 1) / TS); if (isSolid(Math.floor(e.x / TS), ty)) { e.y = ty * TS; e.alive = false; dust(e.x, e.y, 6); SFX.thud(); enemies.push({ t: 'sprig', x: e.x, y: e.y, vx: 0, vy: 0, w: 8, h: 10, hp: EHP.sprig, speed: 44, face: Math.sign(P.x - e.x) || 1, alive: true, dying: 0, anim: Math.random(), flash: 0, stagger: 0.5 }); number(e.x, e.y - 14, 'DOWN', '#8fd160'); const c = { t: 'kite', color: e.col, x: e.x, y: e.y - 30, vx: 40, vy: -30, rot: 0, spin: 4, face: 1, life: 1.2, max: 1.2, frame: 0, grav: 200, bounced: false, ground: false }; corpses.push(c); } return; }
  const w = windAt(e.x, e.y); e.vx += ((w * 60) + (Math.abs(P.x - e.x) < 220 && !P.dead ? Math.sign(P.x - e.x) * 28 : Math.sign(e.hx - e.x) * 14) - e.vx) * Math.min(1, dt * 2);
  e.x += e.vx * dt; e.y = e.hy + Math.sin(e.anim * 1.6) * 5 + (w ? Math.sin(e.anim * 5) * 2 : 0); e.face = Math.sign(P.x - e.x) || e.face;
  if (e.x < 16) e.x = 16; if (e.x > LW * TS - 16) e.x = LW * TS - 16;
  e.dropT -= dt; if (e.dropT <= 0 && !P.dead && Math.abs(P.x - e.x) < 26 && P.y > e.y) { e.dropT = 2.6; rocks.push({ x: e.x, y: e.y + 10, vx: 0, vy: 40, t: 0, dead: false, thrown: true }); number(e.x, e.y - 40, '!', '#ff6b6b'); SFX.kiteChatter(); }
}
function updateHare(e, dt) { // sits until you are close, then runs with the wind, and it does not go round you
  e.anim += dt; e.hitT = Math.max(0, e.hitT - dt); e.vy += 1000 * dt; if (e.vy > 320) e.vy = 320; e.hopT -= dt;
  const d = P.x - e.x, ad = Math.abs(d);
  if (e.mode === 'sit') { e.vx *= Math.pow(0.05, dt); if (!P.dead && ad < 150 && Math.abs(P.y - e.y) < 40) { e.mode = 'run'; const w = windAt(e.x, e.y); e.face = w || (d > 0 ? 1 : -1); e.runT = 2.6; SFX.hareSqueak(); number(e.x, e.y - 12, '!', '#ffd36b'); } }
  else if (e.mode === 'run') { e.runT -= dt; e.vx += (e.face * e.speed - e.vx) * Math.min(1, dt * 8); if (e.hopT <= 0) { e.hopT = 0.35; e.vy = -120; } if (!P.dead && ad < 12 && Math.abs(P.y - e.y) < 16 && e.hitT <= 0) { e.hitT = 1; const res = damagePlayer(e.x, DMG.hare); if (res === 'hit') { P.vx = e.face * 200; P.vy = -90; number(P.x, P.y - 24, 'BOWLED', '#ff6b6b'); } } if (e.runT <= 0 || Math.abs(e.x - e.hx) > 380) { e.mode = 'gone'; e.modeT = 5; } }
  else if (e.mode === 'gone') { e.vx = 0; e.modeT -= dt; if (e.modeT <= 0 && Math.abs(P.x - e.hx) > 200) { e.x = e.hx; e.y = e.hy; e.mode = 'sit'; } }
  const ftx = Math.floor((e.x + Math.sign(e.vx || e.face) * 7) / TS), fty = Math.floor((e.y + 1) / TS);
  if (e.mode === 'run' && e.vy === 0 && isSolid(ftx, fty - 1)) e.vy = -230;
  const r = moveBody(e, e.vx * dt, e.vy * dt, false); if (r.ground) e.vy = 0; if (r.hitX && e.mode === 'run') { e.face = -e.face; }
}
function updateWight(e, dt) { // bog-mist with hands: slow, cold, and it holds you
  e.anim += dt; e.modeT -= dt; e.hitT = Math.max(0, e.hitT - dt); e.life -= dt;
  const d = P.x - e.x, ad = Math.abs(d);
  if (e.mode === 'rise') { e.y = e.riseY + Math.max(0, e.modeT) * 24; if (e.modeT <= 0) e.mode = 'drift'; return; }
  if (e.life <= 0 || P.dead) { e.alive = false; burst(e.x, e.y - 6, 6, COLS.wight, 20, 0.6, -10, 1); return; }
  e.face = Math.sign(d) || e.face; e.x += e.face * 46 * dt; e.y = e.riseY - 1 + Math.sin(e.anim * 3) * 2;
  if (Math.random() < dt * 8) parts.push({ x: e.x + (Math.random() - 0.5) * 8, y: e.y - Math.random() * 12, vx: 0, vy: -15, life: 0.6, max: 0.6, col: '#c8d8c8', size: 1, grav: 0 });
  if (!P.dead && ad < 10 && Math.abs(P.y - e.y) < 18 && e.hitT <= 0) { e.hitT = 1.2; const res = damagePlayer(e.x, DMG.wight); if (res === 'hit') { P.vx *= 0.2; P.stDelay = 0.8; number(P.x, P.y - 24, 'COLD', '#c8d8c8'); } }
}
function updateWindcaller(e, dt) {
  // The shaman of the moor. He stands on a stone and throws bolts of sky at you. Struck twice, or left too long, he is gone in a gust and on another stone.
  // The wind is the only stair up to him. Every so often he calls it, and it takes you off your feet toward the thorns.
  const A = L.arena, roosts = L.roosts || []; e.modeT -= dt; e.anim = (e.anim || 0) + dt; e.hitT = Math.max(0, e.hitT - dt); e.castFlash = Math.max(0, (e.castFlash || 0) - dt);
  const d = P.x - e.x, p2 = e.phase === 2;
  if (e.mode === 'sleep') { e.x = e.sx; e.y = e.sy; return; }
  if (!p2 && e.hp < e.maxHp * 0.5) { e.phase = 2; number(e.x, e.y - 30, 'THE SKY DARKENS', '#c9a0ff'); SFX.callerChant(); shakeCam(3); }
  e.face = Math.sign(d) || e.face;
  const castLen = p2 ? 4.5 : 6;
  const goBlink = () => { e.mode = 'blink'; e.modeT = 0.35; e.hits = 0; burst(e.x, e.y - 12, 14, ['#c9a0ff', '#e8dcc0', '#6faa4a'], 60, 0.5, -40, 1); SFX.puff(); };
  switch (e.mode) {
    case 'wake': if (e.modeT <= 0) { e.mode = 'cast'; e.modeT = castLen; e.castT = 0.9; e.howlT = 9; } break;
    case 'cast': { e.castT -= dt; e.howlT -= dt;
      if (e.castT <= 0 && !P.dead) { e.castT = p2 ? 1.2 : 1.8; e.castN = (e.castN || 0) + 1; const n = 1; const a0 = Math.atan2((P.y - 8) - (e.y - 14), P.x - e.x);
        for (let k = 0; k < n; k++) { const a = a0 + (k - (n - 1) / 2) * 0.28; seeds.push({ x: e.x + Math.cos(a) * 12, y: e.y - 14 + Math.sin(a) * 12, vx: Math.cos(a) * 150, vy: Math.sin(a) * 150, dead: false, life: 3.4, bolt: true }); }
        e.castFlash = 0.25; SFX.callerBlast(); }
      if ((e.hits || 0) >= (p2 ? 1 : 2)) { number(e.x, e.y - 30, 'GONE', '#c9a0ff'); goBlink(); }
      else if (e.modeT <= 0) { if (e.howlT <= 0 && !P.dead) { e.howlT = p2 ? 8 : 11; e.mode = 'howlTell'; e.modeT = 1.1; number(e.x, e.y - 30, 'HE CALLS THE WIND', '#bfe6f5'); SFX.callerChant(); SFX.gasp(); } else goBlink(); }
      break; }
    case 'howlTell': if (e.modeT <= 0) { e.mode = 'howl'; e.modeT = 2.2; e.howlDir = Math.sign(P.x - (A.x0 + A.x1) / 2) || 1; SFX.buzz(); shakeCam(3); } break;
    case 'howl': { const dir = e.howlDir; if (!P.dead && P.x > A.x0 && P.x < A.x1) { P.vx += dir * (P.ground ? 210 : 260) * dt; P.gustT = 0.25; if (Math.random() < dt * 70) parts.push({ x: camX + Math.random() * VW, y: camY + Math.random() * VH, vx: dir * 320, vy: 0, life: 0.3, max: 0.3, col: '#e8f0f8', size: 1, grav: 0 }); } if ((e.hits || 0) >= (p2 ? 1 : 2)) goBlink(); else if (e.modeT <= 0) goBlink(); break; }
    case 'blink': if (e.modeT <= 0 && (e.blinks = (e.blinks || 0) + 1) % 3 === 0) { const gx = Math.max(A.x0 + 48, Math.min(A.x1 - 48, P.x + (P.x < (A.x0 + A.x1) / 2 ? 110 : -110))); e.x = gx; e.y = A.floor; e.grounded = true; e.mode = 'appear'; e.modeT = 0.45; burst(e.x, e.y - 12, 14, ['#c9a0ff', '#e8dcc0'], 60, 0.5, -40, 1); SFX.puff(); }
      else if (e.modeT <= 0) { e.grounded = false; const far = roosts.filter(r => Math.abs(r[0] * TS + 16 - e.x) > 20 && Math.abs(r[0] * TS + 16 - P.x) > 50); const pool = far.length ? far : roosts; const pick = pool[Math.floor(Math.random() * pool.length)]; if (pick) { e.x = pick[0] * TS + 16; e.y = (pick[1] + 1) * TS; } e.mode = 'appear'; e.modeT = 0.45; burst(e.x, e.y - 12, 14, ['#c9a0ff', '#e8dcc0'], 60, 0.5, -40, 1); SFX.puff(); } break;
    case 'appear': if (e.modeT <= 0) { if (e.grounded) { e.mode = 'ground'; e.modeT = 3.4; e.hits = 0; SFX.callerChant(); } else { e.mode = 'cast'; e.modeT = castLen; e.castT = 0.6; } } break;
    // on the ground he gathers something big: he will not blink for being struck while he does, and when it goes it is a slow ring of bolts
    case 'ground': { e.y = A.floor; e.hits = 0; e.castFlash = 0.1; if (Math.random() < dt * 30) parts.push({ x: e.x + (Math.random() - 0.5) * 40, y: e.y - Math.random() * 40, vx: (e.x - P.x > 0 ? -1 : 1) * 0, vy: -30, life: 0.5, max: 0.5, col: Math.random() < 0.5 ? '#c9a0ff' : '#e8dcc0', size: 1, grav: 0 });
      if (e.modeT <= 0) { for (let k = 0; k < 6; k++) { const a = -Math.PI * (k + 0.5) / 6; seeds.push({ x: e.x, y: e.y - 16, vx: Math.cos(a) * 110, vy: Math.sin(a) * 110, dead: false, life: 3, bolt: true }); } SFX.callerBlast(); shakeCam(3); goBlink(); } break; }
    // knocked off his stone by his own bolt: down on the ground and open until he gathers himself
    case 'fallen': { e.y = Math.min(A.floor, e.y + 360 * dt); e.hits = 0; if (e.y >= A.floor && !e.fellT) { e.fellT = 1; dust(e.x, e.y, 10); SFX.thud(); shakeCam(4); } if (e.modeT <= 0) { e.fellT = 0; goBlink(); } break; }
  }
}
const callerOpen = e => e.mode === 'cast' || e.mode === 'howlTell' || e.mode === 'howl' || e.mode === 'ground' || e.mode === 'fallen';
// the wind in his arena drops while he is casting or down: the pushing is what the howl is for
const callerCalm = () => !!(boss && boss.t === 'windcaller' && boss.alive && ['cast', 'ground', 'fallen', 'appear'].includes(boss.mode));
// his bolts come back at him: struck, blocked, or caught in the Aegis
function returnBolt(s) { const wc = (s.owner && s.owner.alive) ? s.owner : enemies.find(e => e.t === 'windcaller' && e.alive); if (!wc) return false; const dx = wc.x - s.x, dy = (wc.y - 14) - s.y, d = Math.hypot(dx, dy) || 1; s.dead = false; s.vx = dx / d * 270; s.vy = dy / d * 270; s.g = 0; s.reflected = true; s.life = 2.5; SFX.parry(); return true; }
function knockCaller(e) { if (!['cast', 'howlTell', 'howl', 'appear'].includes(e.mode)) return; e.mode = 'fallen'; e.modeT = 3; e.hits = 0; e.fellT = 0; e.grounded = false; burst(e.x, e.y - 12, 16, ['#c9a0ff', '#e8dcc0', '#6faa4a'], 70, 0.5, -20, 1); SFX.callerChant(); shakeCam(5); }
// the storm shaman: he holds the far end of a span and throws slow bolts at anyone on it. They can be sent back.
function updateStormShaman(e, dt) {
  e.vy = Math.min(320, (e.vy || 0) + 1000 * dt); const r = moveBody(e, 0, e.vy * dt, false); if (r.ground) e.vy = 0;
  e.castFlash = Math.max(0, e.castFlash - dt); const d = P.x - e.x; e.face = Math.sign(d) || e.face;
  if (e.stagger > 0 || P.dead || Math.abs(d) > 220 || Math.abs(P.y - e.y) > 110) return;
  e.castT -= dt; if (e.castT <= 0.4 && e.castT + dt > 0.4) { e.castFlash = 0.4; SFX.stormChant(); }
  if (e.castT <= 0) { e.castT = 2.4; const a = Math.atan2((P.y - 8) - (e.y - 12), P.x - e.x); seeds.push({ x: e.x + Math.cos(a) * 10, y: e.y - 12 + Math.sin(a) * 10, vx: Math.cos(a) * 135, vy: Math.sin(a) * 135, dead: false, life: 3, bolt: true, owner: e }); SFX.stormZap(); }
}
// the chimney sweep: he lives down a stack. Come near and he comes up with a handful of soot, throws it, and stays up a
// moment to see it land - the only moment he can be reached - then he is back down the flue.
function updateSweep(e, dt) {
  e.modeT -= dt; const d = P.x - e.x, ad = Math.abs(d), near = !P.dead && ad < 110 && Math.abs(P.y - e.y) < 90;
  if (e.mode === 'hide') { e.gone = 1; if (near && e.modeT <= 0) { e.mode = 'pop'; e.modeT = 0.45; e.gone = 0; SFX.sweepPop(); burst(e.x, e.y - 8, 6, ['#2a2630', '#5a5460'], 30, 0.4, -20, 1); } }
  else if (e.mode === 'pop') { e.face = Math.sign(d) || e.face; if (e.modeT <= 0) { e.mode = 'throw'; e.modeT = 0.3; const sx = e.x + e.face * 6, sy = e.y - 12, Tf = 0.8, G = 420; seeds.push({ x: sx, y: sy, vx: (P.x - sx) / Tf, vy: ((P.y - 8) - sy) / Tf - 0.5 * G * Tf, g: G, dead: false, life: 3, soot: true, owner: e }); SFX.throwWhoosh(); } }
  else if (e.mode === 'throw') { if (e.modeT <= 0) { e.mode = 'up'; e.modeT = 1.3; } }
  else if (e.mode === 'up') { e.face = Math.sign(d) || e.face; if (e.modeT <= 0) { e.mode = 'hide'; e.modeT = 2.2; e.gone = 1; SFX.sweepHide(); burst(e.x, e.y - 8, 4, ['#2a2630'], 20, 0.3, -20, 1); } }
}
function updateGrub(e, dt) { // slow, fat, glowing: touching it burns, and it spits an arc of acid at you
  e.modeT -= dt; e.spitT -= dt; e.vy += 1000 * dt; if (e.vy > 300) e.vy = 300; e.anim += dt;
  const d = P.x - e.x, ad = Math.abs(d), near = ad < 160 && Math.abs(e.y - P.y) < 50 && !P.dead;
  let want = 0;
  if (e.mode === 'spit') { want = 0; if (e.modeT <= 0) e.mode = 'crawl'; }
  else if (near && e.spitT <= 0) { e.mode = 'spit'; e.modeT = 0.6; e.spitT = 3.2; e.face = Math.sign(d) || e.face; const sx = e.x + e.face * 8, sy = e.y - 6, Tf = 0.9, G = 380, dx = P.x - sx, dy = (P.y - 8) - sy; seeds.push({ x: sx, y: sy, vx: Math.max(-160, Math.min(160, dx / Tf)), vy: dy / Tf - 0.5 * G * Tf, dead: false, life: 3, g: G, acid: true }); SFX.grubSpit(); number(e.x, e.y - e.h - 8, '!', '#b8d878'); }
  else { if (e.timer === undefined || (e.timer -= dt) <= 0) { e.timer = 2 + Math.random() * 2; if (!near) e.face = Math.random() < 0.5 ? -1 : 1; } if (near) e.face = Math.sign(d) || e.face; want = e.face * e.speed; }
  if (!P.dead && Math.abs(P.x - e.x) < 12 && P.y > e.y - 12 && P.y < e.y + 4 && !(e.touchT > 0)) { e.touchT = 0.8; damagePlayer(e.x, DMG.acid, { unblockable: true }); number(P.x, P.y - 24, 'IT BURNS', '#b8d878'); } e.touchT = Math.max(0, (e.touchT || 0) - dt);
  if (Math.random() < dt * 6) parts.push({ x: e.x + e.face * -6, y: e.y - 4, vx: 0, vy: -12, life: 0.5, max: 0.5, col: '#e8ff9a', size: 1, grav: 0 });
  e.vx += (want - e.vx) * Math.min(1, dt * 4);
  const ftx = Math.floor((e.x + Math.sign(e.vx || e.face) * 9) / TS), fty = Math.floor((e.y + 1) / TS);
  const r = moveBody(e, e.vx * dt, e.vy * dt, false); if (r.ground) e.vy = 0;
  if ((r.ground && tileAt(ftx, fty) === T.AIR && !isOneWay(tileAt(ftx, fty))) || r.hitX) { e.vx = 0; e.face = -e.face; }
}
function updateRockGoblin(e, dt) { // keeps its distance and throws lanterns: they burn where they land, and light the way
  e.modeT -= dt; e.throwT -= dt; e.vy += 1000 * dt; if (e.vy > 300) e.vy = 300; e.anim += dt;
  const d = P.x - e.x, ad = Math.abs(d), near = ad < 200 && Math.abs(e.y - P.y) < 60 && !P.dead;
  let want = 0;
  if (e.mode === 'throw') { want = 0; if (e.modeT <= 0) e.mode = 'walk'; }
  else if (e.stagger > 0) want = 0;
  else if (near) { e.face = Math.sign(d) || e.face; if (e.throwT <= 0 && ad > 40) { e.mode = 'throw'; e.modeT = 0.5; e.throwT = 3.4; const sx = e.x + e.face * 6, sy = e.y - 12, Tf = 0.8, G = 380, dx = P.x - sx, dy = (P.y - 8) - sy; seeds.push({ x: sx, y: sy, vx: Math.max(-200, Math.min(200, dx / Tf)), vy: dy / Tf - 0.5 * G * Tf, dead: false, life: 3, g: G, lantern: true }); SFX.throwWhoosh(); SFX.rockLaugh(); number(e.x, e.y - e.h - 10, '!', '#ffd36b'); } else want = ad < 60 ? -e.face * e.speed : ad > 120 ? e.face * e.speed : 0; }
  else { if (e.modeT <= 0) { e.modeT = 1.5 + Math.random() * 2; e.face = Math.random() < 0.5 ? -1 : 1; } want = e.face * 12; }
  e.vx += (want - e.vx) * Math.min(1, dt * 6);
  const ftx = Math.floor((e.x + Math.sign(e.vx || e.face) * 7) / TS), fty = Math.floor((e.y + 1) / TS);
  const r = moveBody(e, e.vx * dt, e.vy * dt, false); if (r.ground) e.vy = 0;
  if (r.ground && tileAt(ftx, fty) === T.AIR && !isOneWay(tileAt(ftx, fty))) { e.vx = 0; if (!near) e.face = -e.face; }
  if (r.hitX) { e.vx = 0; if (!near) e.face = -e.face; }
}
function updateBat(e, dt) {
  e.modeT -= dt; e.cd = Math.max(0, e.cd - dt);
  const lightHere = (x, y) => { let best = null, bd = 150; const try1 = (lx, ly, lr, who) => { const dd = Math.hypot(lx - x, ly - y); if (dd < bd && lr > 20) { bd = dd; best = { x: lx, y: ly, who }; } }; for (const lt of lights) if (!(lt.ref && lt.ref.dark > 0) && !(lt.lantern && !lt.lantern.lit)) try1(lt.x, lt.y, lt.r, null); for (const f of fires) if (f.delay <= 0) try1(f.x, f.y - 6, 40, null); if (!P.dead && (playerLight() > 40 || Math.hypot(P.x - x, P.y - 8 - y) < 90)) try1(P.x, P.y - 8, Math.max(playerLight(), 60), 'P'); return best; }; // a bat goes for the nearest light, or for you if you are close enough to hear
  if (e.mode === 'hang') { e.x = e.hx; e.y = e.hy + Math.sin(e.anim * 2) * 0.5; if (e.cd <= 0) { const tgt = lightHere(e.x, e.y); if (tgt) { e.mode = 'fly'; e.tgt = tgt; SFX.chitter(); } } }
  else if (e.mode === 'fly') { const tgt = e.tgt.who === 'P' ? { x: P.x, y: P.y - 8 } : e.tgt; const dx = tgt.x - e.x, dy = tgt.y - e.y, dd = Math.hypot(dx, dy) || 1; e.x += dx / dd * 95 * dt; e.y += dy / dd * 80 * dt + Math.sin(e.anim * 9) * 10 * dt; e.face = Math.sign(dx) || e.face;
    if (!P.dead && Math.abs(P.x - e.x) < 10 && Math.abs((P.y - 8) - e.y) < 10) { const res = damagePlayer(e.x, DMG.bat); if (res === 'blocked') { e.alive = false; burst(e.x, e.y, 6, COLS.bat, 50, 0.4); kills++; number(e.x, e.y - 10, 'SWATTED', '#8fd160'); return; } e.mode = 'back'; e.cd = 2; SFX.chitter(); }
    else if (dd < 8 || e.modeT < -6) { e.mode = 'back'; e.cd = 1.5; } }
  else { const dx = e.hx - e.x, dy = e.hy - e.y, dd = Math.hypot(dx, dy) || 1; e.x += dx / dd * 110 * dt; e.y += dy / dd * 110 * dt; e.face = Math.sign(dx) || e.face; if (dd < 4) { e.mode = 'hang'; e.modeT = 0; } }
}
// Mine carts: iron tubs on rails. They roll when ridden (or on their own), fly broken rails, and smash gates, barricades and goblins.
function updateCarts(dt) {
  for (const m of movers) {
    if (m.kind === 'orelift') { const loaded = m.player ? P.onMover === m : movers.some(c => c.kind === 'cart' && !c.gone && c.x + c.w > m.x && c.x < m.x + m.w && Math.abs(c.y + c.h - m.y) < 8); const oy = m.y; m.y = loaded ? Math.min(m.y1, m.y + 40 * dt) : Math.max(m.y0, m.y - 30 * dt); m.dy = m.y - oy; if (loaded && m.dy !== 0 && Math.random() < dt * 8) parts.push({ x: m.x + Math.random() * m.w, y: m.y, vx: 0, vy: 20, life: 0.3, max: 0.3, col: '#8a919c', size: 1, grav: 0 }); continue; }
    if (m.kind !== 'cart') continue;
    if (m.gone) { m.respawnT -= dt; if (m.respawnT <= 0 && Math.abs(P.x - m.x0) > 60) { m.gone = false; m.x = m.x0; m.y = m.y0; m.vx = 0; m.vy = 0; m.rolling = m.auto; m.ridden = false; m.kicked = false; m.hit.clear(); number(m.x + 14, m.y - 10, 'ANOTHER CART', '#8a919c'); } continue; }
    const ox = m.x, oy = m.y;
    if (P.onMover === m) { m.rolling = true; m.ridden = true; }
    { const hb = attackBox(); if (hb && P.onMover !== m && !P.hitSet.has(m) && overlap(hb, { l: m.x, r: m.x + m.w, t: m.y - 6, b: m.y + m.h })) { P.hitSet.add(m); m.rolling = true; m.kicked = true; m.ridden = false; m.dir = P.face; m.vx = P.face * 250; m.hit.clear(); SFX.clank(); SFX.stone(); sparks(m.x + (P.face > 0 ? m.w : 0), m.y + 4, P.face, 6); shakeCam(2); number(m.x + m.w / 2, m.y - 12, 'LAUNCHED', '#8fd160'); } } // a cut sends a standing tub rolling
    if (m.hurled > 0) { m.hurled -= dt; if (!P.dead && P.onMover !== m && Math.abs(m.vx) > 60 && P.x > m.x - 6 && P.x < m.x + m.w + 6 && P.y > m.y - 4 && P.y - 16 < m.y + m.h && !(m.pHit > 0)) { m.pHit = 1; damagePlayer(m.x, DMG.hurlCart, { unblockable: true, up: true }); P.vx = Math.sign(m.vx) * 220; number(P.x, P.y - 24, 'RUN DOWN', '#ff6b6b'); } } m.pHit = Math.max(0, (m.pHit || 0) - dt); if (m.dragged) { m.dx = 0; m.dy = 0; continue; }
    { const boss = enemies.find(q => q.t === 'forgemaster' && q.alive); // a mini now, so not always THE boss
    if (boss && boss.t === 'forgemaster' && boss.alive && Math.abs(m.vx) > 60 && (m.ridden || m.kicked) && !m.hit.has(boss) && boss.x + 18 > m.x - 4 && boss.x - 18 < m.x + m.w + 4 && Math.abs(boss.y - (m.y + m.h)) < 24) { m.hit.add(boss); boss.mode = 'stun'; boss.modeT = 2.5; boss.stagger = 2.5; boss.vx = Math.sign(m.vx) * 70; boss.hp -= 40; boss.flash = 0.3; if (boss.hp <= 0) hurtEnemy(boss, 1, m.x, false); number(boss.x, boss.y - boss.h - 12, 'STUNNED', '#8fd160'); SFX.heavy(); SFX.clank(); shakeCam(7); hitstop(0.1); zoomKick(1.1, 0.3); burst(m.x + m.w / 2, m.y + 4, 14, ['#5a6270', '#8a919c', '#ffd36b'], 90, 0.6); m.gone = true; m.respawnT = 4; if (P.onMover === m) { P.onMover = null; P.vx = -Math.sign(m.vx) * 160; P.vy = -140; P.ground = false; } continue; } }
    const pan = movers.find(l => l.kind === 'orelift' && m.x + m.w > l.x && m.x < l.x + l.w && Math.abs(m.y + m.h - l.y) < 12);
    if (m.rolling && !pan) { m.vx += (m.dir * m.speed - m.vx) * Math.min(1, dt * 3); m.x += m.vx * dt; }
    const fx = Math.floor((m.x + m.w / 2 + m.dir * (m.w / 2 + 2)) / TS), fy = Math.floor((m.y + m.h + 1) / TS), under = tileAt(Math.floor((m.x + m.w / 2) / TS), fy);
    // rail ahead at cart height? a wall stops it dead; a gate, crate or stake wall breaks
    const ahead = tileAt(fx, Math.floor((m.y + m.h - 4) / TS));
    if (m.rolling && under !== T.RAIL && !pan && !m.auto && Math.abs(m.vx) > 0) m.vx *= Math.pow(0.03, dt); // off the rail a cart runs down
    // the end of a rail over a drop is a buffer stop, not a way out of the room: the Forgemaster's tubs rolled off his
    // armoury rail, down the stair and out of the fight. A tub he sent smashes on it (he sends another); one you
    // kicked, or rode, stops dead.
    if (m.rolling && !pan && under === T.RAIL && Math.abs(m.vx) > 5 && tileAt(fx, fy) !== T.RAIL && !isSolid(fx, fy)) {
      if (m.auto && !m.ridden) { m.gone = true; m.respawnT = 999; burst(m.x + m.w / 2, m.y + 4, 12, ['#5a6270', '#8a919c', '#8a5a32'], 80, 0.5); SFX.heavy(); shakeCam(2); if (P.onMover === m) P.onMover = null; continue; }
      m.x = ox; m.vx = 0; m.rolling = false; m.kicked = false; SFX.clank(); dust(m.x + m.w / 2, m.y + m.h, 4); }
    if (Math.abs(m.vx) > 50 && under === T.RAIL) { // wheels on iron: sparks off the flanges and a rattle you can hear from the next gallery
      if (Math.random() < dt * 14) parts.push({ x: m.x + (m.vx > 0 ? 2 : m.w - 2) + (Math.random() - 0.5) * 4, y: m.y + m.h - 1, vx: -Math.sign(m.vx) * (40 + Math.random() * 60), vy: -30 - Math.random() * 40, life: 0.25, max: 0.25, col: Math.random() < 0.5 ? '#ffd36b' : '#fff6c8', size: 1, grav: 500 });
      m.rattleT = (m.rattleT || 0) - dt; if (m.rattleT <= 0) { m.rattleT = 0.19; if (SET.ambient && Math.abs(P.x - m.x) < 260 && Math.abs(P.y - m.y) < 120) SFX.rattle(P.onMover === m ? 1 : 0.5); } }
    if (ahead === T.PORT || ahead === T.CRATE || ahead === T.PALISADE || ahead === T.SOFT) { const ry = Math.floor((m.y + m.h - 4) / TS); for (const yy of [ry, ry - 1]) { const t2 = tileAt(fx, yy); if (t2 !== ahead && !(t2 === T.SOFT || t2 === T.CRATE)) continue; const k = yy * LW + fx; L.grid[k] = T.AIR; tileSpr[k] = null; destroyed.add(k); } const i = ry * LW + fx; burst(fx * TS + 8, m.y + 4, 10, ['#8a5a32', '#c9b27c'], 80, 0.5); shakeCam(3); SFX.crack(); number(fx * TS + 8, m.y - 12, 'SMASHED', '#8fd160'); }
    else if (ahead === T.SOLID || ahead === T.CLIMB) { if (Math.abs(m.vx) > 40) { m.gone = true; m.respawnT = 5; burst(m.x + m.w / 2, m.y + 4, 14, ['#5a6270', '#8a919c'], 90, 0.6); shakeCam(4); SFX.heavy(); if (P.onMover === m) { P.onMover = null; P.vx = m.dir * 200; P.vy = -150; P.ground = false; damagePlayer(m.x, DMG.cartHit, { unblockable: true, up: true }); number(P.x, P.y - 24, 'THROWN', '#ff6b6b'); } continue; } m.vx = 0; }
    if (pan) { m.y = pan.y - m.h; m.vy = 0; m.rolling = m.auto; m.vx = 0; } // the pan is the end of the line: the tub sits while the lift works
    else if (under === T.RAIL || isSolid(Math.floor((m.x + m.w / 2) / TS), fy)) { m.y = fy * TS - m.h; m.vy = 0; }
    else { m.vy += 900 * dt; m.y += m.vy * dt; if (m.y > LH * TS) { m.gone = true; m.respawnT = 5; if (P.onMover === m) P.onMover = null; continue; } const ly = Math.floor((m.y + m.h) / TS), lt = tileAt(Math.floor((m.x + m.w / 2) / TS), ly); if (m.vy > 0 && (lt === T.RAIL || isSolid(Math.floor((m.x + m.w / 2) / TS), ly)) && (m.y + m.h) - ly * TS < (Math.abs(m.vx) > 90 ? 38 : 12)) { m.y = ly * TS - m.h; m.vy = 0; dust(m.x + m.w / 2, m.y + m.h, 4); } } // a fast tub lands on a rail it clears by less than two tiles
    m.dx = m.x - ox; m.dy = m.y - oy;
    if (P.onMover === m) { if (P.vy < -20) P.onMover = null; else { P.x += m.dx; P.y = m.y; P.vy = 0; P.ground = true; P.coyote = 0.1; m.dx = 0; m.dy = 0; } } // a rider stays in the tub through the drops
    if (Math.abs(m.vx) > 60) { for (const e of enemies) if (e.alive && !e.harmless && !m.hit.has(e) && !e.maxHp && e.x > m.x - 6 && e.x < m.x + m.w + 6 && e.y > m.y - 4 && e.y - e.h < m.y + m.h) { m.hit.add(e); hurtEnemy(e, 30, m.x, false); number(e.x, e.y - e.h - 10, 'RUN DOWN', '#8fd160'); } if (Math.random() < dt * 10) parts.push({ x: m.x + (m.dir > 0 ? 2 : m.w - 2), y: m.y + m.h, vx: -m.dir * 30, vy: -20, life: 0.3, max: 0.3, col: '#ffd36b', size: 1, grav: 0 }); }
    if (Math.abs(m.vx) < 5) m.hit.clear();
  }
}
// Bough spider: hangs from the bough above on a thread; drops on you when you pass under, bites, then climbs back.
function updateSpider(e, dt) {
  e.cd = Math.max(0, e.cd - dt); e.modeT -= dt;
  if (e.big) { updateWeaver(e, dt); return; }
  if (e.mode === 'hang') { e.y = e.restY + Math.sin(e.anim * 2) * 1.5; if (!P.dead && e.cd <= 0 && Math.abs(P.x - e.x) < 18 && P.y > e.y + 6 && P.y - e.y < e.drop + 24) { e.mode = 'drop'; e.dropY = e.y; SFX.hiss(); number(e.x, e.y - 14, '!', '#ff6b6b'); } }
  else if (e.mode === 'drop') { e.y += 330 * dt; const hit = !P.dead && Math.abs(P.x - e.x) < 12 && Math.abs((P.y - 8) - (e.y - 4)) < 12; if (hit) { const res = damagePlayer(e.x, DMG.spider); if (res === 'hit') { P.vx = (Math.sign(P.x - e.x) || 1) * 190; number(P.x, P.y - 24, 'YANKED', '#ff6b6b'); } e.mode = 'climb'; e.cd = 1.4; } else if (e.y - e.dropY >= e.drop || isSolid(Math.floor(e.x / TS), Math.floor((e.y + 1) / TS))) { e.mode = 'climb'; e.cd = 1.2; } }
  else if (e.mode === 'climb') { e.y -= 80 * dt; if (e.y <= e.restY) { e.y = e.restY; e.mode = 'hang'; } }
  e.face = Math.sign(P.x - e.x) || e.face;
}
// THE WEAVER - the big one does not wait to be walked under. She runs her thread to get over you, drops, and is worth
// hitting only while she is on the boards. Then she goes back up, and you do it again.
function updateWeaver(e, dt) {
  const A = L.mini || { x0: 0, x1: LW * TS, floor: e.y + 200 };
  const floor = A.floor, p2 = e.maxHp && e.hp <= e.maxHp / 2;
  if (!e.phase) e.phase = 1;
  if (p2 && e.phase === 1) { e.phase = 2; number(e.x, e.y - 20, 'ENRAGED', '#ff6b6b'); SFX.hiss(); SFX.roar(); }
  const d = P.x - e.x, ad = Math.abs(d);
  e.face = Math.sign(d) || e.face;
  e.spitT = (e.spitT === undefined ? 3.4 : e.spitT - dt);
  if (e.mode === 'hang') { // she runs the thread to get above you
    e.y = e.restY + Math.sin(e.anim * 3) * 1.5;
    const sp = e.phase === 2 ? 96 : 62;
    e.x += Math.max(-sp, Math.min(sp, d)) * dt * (sp / 60);
    e.x = Math.max(A.x0 + 14, Math.min(A.x1 - 14, e.x));
    if (Math.random() < dt * 6) parts.push({ x: e.x, y: e.y - 14, vx: 0, vy: -10, life: 0.3, max: 0.3, col: '#e8dcc0', size: 1, grav: 0 });
    // she does not only drop. From up on the thread she spits web down onto the boards, and the
    // boards she hits are no good to stand on until you cut them clear.
    if (e.spitT <= 0 && ad > 14 && !P.dead) { e.mode = 'spitTell'; e.modeT = 0.5; e.spitT = e.phase === 2 ? 4.2 : 6.5; number(e.x, e.y - 18, 'SHE SPITS', '#e8dcc0'); SFX.hiss(); }
    else if (e.cd <= 0 && ad < 16 && !P.dead) { e.mode = 'dropTell'; e.modeT = e.phase === 2 ? 0.36 : 0.55; number(e.x, e.y - 18, '!', '#ff6b6b'); SFX.hiss(); }
  }
  else if (e.mode === 'spitTell') { e.y = e.restY + Math.sin(e.anim * 14) * 2; if (e.modeT <= 0) {
    e.mode = 'spit'; e.modeT = 0.5; SFX.spit();
    const n = e.phase === 2 ? 4 : 3;
    for (let k = 0; k < n; k++) { const tx = P.x + (k - (n - 1) / 2) * 34 + P.vx * 0.3, tt = 0.75;
      seeds.push({ x: e.x, y: e.y + 6, vx: (tx - e.x) / tt, vy: 40, dead: false, life: 3, web: true, g: 620 }); }
  } }
  else if (e.mode === 'spit') { e.y = e.restY + Math.sin(e.anim * 3) * 1.5; if (e.modeT <= 0) e.mode = 'hang'; }
  else if (e.mode === 'dropTell') { if (e.modeT <= 0) { e.mode = 'drop'; e.dropY = e.y; e.vy = 0; SFX.hiss(); } }
  else if (e.mode === 'drop') {
    e.vy = Math.min(560, (e.vy || 0) + 1800 * dt); e.y += e.vy * dt;
    if (!P.dead && Math.abs(P.x - e.x) < 16 && Math.abs((P.y - 8) - (e.y - 6)) < 16) { const res = damagePlayer(e.x, DMG.spider + 6, { up: true }); if (res === 'hit') { P.vx = (Math.sign(P.x - e.x) || 1) * 200; P.vy = -140; } }
    if (e.y >= floor - 2) { e.y = floor; e.vy = 0; e.mode = 'ground'; e.modeT = e.phase === 2 ? 2.2 : 1.8; shakeCam(4); dust(e.x, e.y, 10); SFX.thud();
      number(e.x, e.y - 24, 'DOWN: CUT HER', '#8fd160');
      if (e.phase === 2) { for (const dx of [-16, 16]) enemies.push({ t: 'spider', x: e.x + dx, y: e.y - 6, vx: 0, vy: 0, w: 10, h: 8, hp: EHP.spider, restY: e.y - 40, drop: 60, mode: 'climb', modeT: 0, cd: 0.6, face: dx > 0 ? 1 : -1, alive: true, dying: 0, anim: 0, flash: 0, stagger: 0 }); }
    }
  }
  else if (e.mode === 'ground') { // her window: she scuttles at you on the boards and can be traded with
    const sp = e.phase === 2 ? 78 : 56;
    e.x += (ad > 14 ? Math.sign(d) * sp : 0) * dt; e.x = Math.max(A.x0 + 12, Math.min(A.x1 - 12, e.x));
    if (!P.dead && ad < 13 && Math.abs(P.y - e.y) < 18 && (e.hitT || 0) <= 0) { e.hitT = 0.9; damagePlayer(e.x, DMG.spider); }
    e.hitT = Math.max(0, (e.hitT || 0) - dt);
    if (e.modeT <= 0) { e.mode = 'climb'; SFX.hiss(); }
  }
  else if (e.mode === 'climb') { e.y -= (e.phase === 2 ? 130 : 96) * dt; if (e.y <= e.restY) { e.y = e.restY; e.mode = 'hang'; e.cd = e.phase === 2 ? 0.5 : 0.9; } }
  else { e.mode = 'hang'; }
}

// The Great Hound: a beast, not a rider. Lunge (jump it: blocked, it skids), pounce (dodge: it lands stunned), howl (kill both pups fast and it whines). Enraged, it snaps at anything next to it.
function updateGreatHound(e, dt) {
  e.modeT -= dt; e.vy += 1000 * dt; if (e.vy > 320) e.vy = 320; e.hitT = Math.max(0, e.hitT - dt);
  const d = P.x - e.x, ad = Math.abs(d); const M = L.mini || { x0: 0, x1: LW * TS, floor: e.y }; const p2 = e.phase === 2;
  if (e.mode === 'wait') { const r = moveBody(e, 0, e.vy * dt, false); if (r.ground) e.vy = 0; return; }
  const pups = enemies.filter(h => h.alive && h.t === 'hound' && h.pup);
  for (const k of ['lungeT', 'pounceT', 'howlT']) e[k] -= dt;
  const tell = (txt, col, t, mode) => { e.mode = mode; e.modeT = t; e.face = Math.sign(d) || e.face; e.vx *= 0.2; number(e.x, e.y - e.h - 12, txt, col); };
  const tc = enemies.find(h => h.alive && h.t === 'hound' && h.turncoat);
  if (tc && Math.abs(tc.x - e.x) < 20 && Math.abs(tc.y - e.y) < 16 && !(tc.biteT > 0) && e.mode !== 'pounce') { tc.biteT = 3.5; e.mode = 'stun'; e.modeT = 1.6; e.stagger = 1.6; e.vx = 0; number(e.x, e.y - e.h - 12, 'THE KENNEL HOUND BITES IT', '#8fd160'); SFX.yelp(); tc.retreat = 1.0; tc.vx = -(Math.sign(e.x - tc.x) || 1) * 150; }
  let want = 0;
  if (e.mode === 'stun' || e.mode === 'skid' || e.mode === 'whine' || e.mode === 'landed') { if (e.mode === 'skid') want = e.vx * 0.9; if (e.modeT <= 0) { e.mode = 'idle'; e.modeT = 0.4; e.stagger = 0; } }
  else if (e.mode === 'lungeTell') { if (e.modeT <= 0) { e.mode = 'lunge'; e.modeT = 0.55; e.vx = e.face * (p2 ? 300 : 270); SFX.bark(); dust(e.x - e.face * 10, e.y, 8); } }
  else if (e.mode === 'lunge') { want = e.face * (p2 ? 300 : 270); if (!P.dead && ad < 18 && Math.abs(P.y - e.y) < 18 && e.hitT <= 0) { e.hitT = 0.6; const res = damagePlayer(e.x, DMG.greathound); if (res === 'blocked') { e.mode = 'skid'; e.modeT = 1.0; e.stagger = 1.0; e.vx = e.face * 140; number(e.x, e.y - e.h - 12, 'IT SKIDS: HIT IT', '#8fd160'); SFX.yelp(); } else if (res === 'hit') { P.vx = e.face * 220; } } if (e.modeT <= 0) { e.mode = 'idle'; e.modeT = 0.6; } }
  else if (e.mode === 'pounceTell') { e.face = Math.sign(d) || e.face; if (e.modeT <= 0) { e.mode = 'pounce'; e.modeT = 1.4; e.vy = -320; const tx = ad < 64 ? P.x + e.face * 46 : P.x; e.vx = (tx - e.x) / 0.64; e.airT = 0; SFX.leap(); SFX.bark(); number(e.x, e.y - e.h - 12, ad < 64 ? 'OVER YOU' : 'POUNCE', '#ff6b6b'); } }
  else if (e.mode === 'pounce') { want = e.vx; e.airT += dt; if (e.airT > 0.15 && e.vy >= 0 && e.y >= M.floor - 1) { e.y = M.floor; e.vy = 0; e.vx = 0; shakeCam(5); SFX.thud(); dust(e.x, e.y, 12); for (const dd of [-1, 1]) waves.push({ x: e.x + dd * 16, y: M.floor, dir: dd, life: 1.2, sp: 150 }); e.mode = 'landed'; e.modeT = 0.8; e.stagger = 0.8; number(e.x, e.y - e.h - 12, 'IT LANDS: HIT IT', '#8fd160'); if (!P.dead && ad < 24 && Math.abs(P.y - e.y) < 20 && P.ground && P.dodge <= 0) { const res = damagePlayer(e.x, DMG.pounce); if (res === 'hit') P.vx = (Math.sign(P.x - e.x) || 1) * 220; } } }
  else if (e.mode === 'howlTell') { if (e.modeT <= 0) { e.mode = 'howl'; e.modeT = 0.8; SFX.bark(); SFX.roar(); number(e.x, e.y - e.h - 12, 'AWOOO', '#c080ff'); for (const s of [-1, 1]) { const x = s < 0 ? M.x0 + 14 : M.x1 - 14; enemies.push({ t: 'hound', x, y: e.y, vx: 0, vy: -120, w: 10, h: 6, hp: 10, hp0: 10, speed: 120, face: Math.sign(P.x - x) || 1, alive: true, dying: 0, anim: Math.random(), flash: 0, stagger: 0, timer: 0, air: false, pack: true, pup: true, packLife: 9 }); burst(x, e.y - 4, 6, COLS.hound, 50, 0.4); } number(P.x, P.y - 30, 'KILL THE PUPS FAST', '#ffd36b'); e.pupsCalled = 2; } }
  else if (e.mode === 'howl') { if (e.modeT <= 0) { e.mode = 'circle'; e.modeT = 9; } }
  else if (e.mode === 'circle') { // keeps its distance while the pups work; both pups dead in time and it whines
    e.face = Math.sign(d) || e.face; want = ad < 90 ? -e.face * 110 : ad > 150 ? e.face * 90 : 0;
    if (pups.length === 0) { e.mode = 'whine'; e.modeT = 2.4; e.stagger = 2.4; e.vx = 0; number(e.x, e.y - e.h - 12, 'IT WHINES: HIT IT', '#8fd160'); SFX.yelp(); SFX.yelp(); }
    else if (e.modeT <= 0) { e.mode = 'idle'; e.modeT = 0.5; }
  }
  else if (e.mode === 'snapTell') { if (e.modeT <= 0) { e.mode = 'idle'; e.modeT = 0.5; SFX.slash(); if (!P.dead && Math.sign(P.x - e.x) === e.face && ad < 30 && Math.abs(P.y - e.y) < 20) { const res = damagePlayer(e.x, DMG.snap); if (res === 'hit') P.vx = e.face * 160; else if (res === 'blocked') { e.stagger = 0.6; e.mode = 'stun'; e.modeT = 0.6; number(e.x, e.y - e.h - 12, 'PARRIED', '#8fd160'); } } for (const h of enemies) if (h.alive && h.turncoat && Math.sign(h.x - e.x) === e.face && Math.abs(h.x - e.x) < 30) hurtEnemy(h, 15, e.x, false); } }
  else { // idle: face you, keep a stride away, and pick the next move
    e.face = Math.sign(d) || e.face;
    if (e.modeT <= 0 && !P.dead) {
      if (e.howlT <= 0 && pups.length === 0) { e.howlT = 16; tell('HOWLS', '#c080ff', 0.7, 'howlTell'); }
      else if (p2 && ad < 28 && Math.abs(P.y - e.y) < 20) { tell('!', '#ffd36b', 0.25, 'snapTell'); }
      else if (e.pounceT <= 0 && ad > 26 && ad < 200) { e.pounceT = 4; tell('!!', '#ff6b6b', 0.5, 'pounceTell'); SFX.charge(); }
      else if (e.lungeT <= 0 && ad > 24) { e.lungeT = 3.4; tell('!', '#ff6b6b', 0.45, 'lungeTell'); SFX.charge(); }
      else if (ad < 34 && Math.random() < 0.5) { e.mode = 'backstep'; e.modeT = 0.32; e.vx = -e.face * 230; SFX.step(); }
      else want = ad > 70 ? e.face * 70 : ad < 36 ? -e.face * 60 : 0;
    } else want = ad > 70 ? e.face * 70 : ad < 36 ? -e.face * 60 : 0;
  }
  if (e.mode === 'backstep') { want = e.vx; if (e.modeT <= 0) { e.mode = 'idle'; e.modeT = 0.1; } }
  if (e.stagger > 0 && e.mode !== 'skid') want = 0;
  if (e.mode !== 'pounce') e.vx += (want - e.vx) * Math.min(1, dt * (e.mode === 'lunge' ? 12 : 7));
  if (e.mode === 'pounce') { e.x += e.vx * dt; e.y += e.vy * dt; if (e.y > M.floor) e.y = M.floor; }
  else { const r = moveBody(e, e.vx * dt, e.vy * dt, false); if (r.ground) e.vy = 0; if (r.hitX && e.mode === 'lunge') { e.mode = 'skid'; e.modeT = 0.6; e.stagger = 0.6; e.vx = 0; dust(e.x, e.y, 8); SFX.thud(); number(e.x, e.y - e.h - 12, 'INTO THE WALL', '#8fd160'); } }
  e.x = Math.max(M.x0 + 14, Math.min(M.x1 - 14, e.x));
}
// The Owl Reeve: perches on the great bough, swoops in straight lines, screeches from the ground, beats a gust toward the edge. A swoop through a lit lantern's glow crashes it.
function updateOwl(e, dt) {
  // The Reeve sits on one of three perches. From a perch it screeches spiders down, fans feathers at you, beats a gust along the floor, or flushes into a swoop
  // through you and on to another perch. Cut it twice on its perch and it flushes. A perch whose lantern is lit is denied it; deny all three and it must come down.
  const A = L.arena, floor = A.floor, p2 = e.phase === 2; e.modeT -= dt; e.hitT = Math.max(0, e.hitT - dt); e.anim = (e.anim || 0) + dt;
  const d = P.x - e.x, ad = Math.abs(d);
  if (e.mode === 'sleep') { if (!e.perches) { e.perches = (L.perches || [[54, 12]]).map(([tx, ty]) => ({ x: tx * TS + 8, y: ty * TS })); e.perchI = Math.floor(e.perches.length / 2); e.x = e.perches[e.perchI].x; e.y = e.perches[e.perchI].y; } return; }
  const lanterns = props.filter(pr => pr.t === 'lantern');
  const perchLit = k => lanterns.some(pr => pr.perch && pr.lit && Math.abs(pr.x - e.perches[k].x) < 40);
  const openPerches = () => e.perches.map((p, k) => k).filter(k => !perchLit(k));
  const toward = (tx, ty, sp) => { const dx = tx - e.x, dy = ty - e.y, dd = Math.hypot(dx, dy) || 1; const st = Math.min(dd, sp * dt); e.x += dx / dd * st; e.y += dy / dd * st; return dd - st; };
  const flush = (why) => { const open = openPerches().filter(k => k !== e.perchI); e.hits = 0; if (!open.length && !openPerches().includes(e.perchI)) { e.mode = 'descend'; e.modeT = 1.4; e.tx = Math.max(A.x0 + 40, Math.min(A.x1 - 40, P.x + (Math.sign(e.x - P.x) || 1) * 40)); number(e.x, e.y - 24, 'NOWHERE TO SIT', '#ffd36b'); SFX.screech(); return; } e.next = open.length ? open[Math.floor(Math.random() * open.length)] : e.perchI; e.mode = 'takeoff'; e.modeT = 0.25; e.grab = why === 'swoop' && Math.random() < (p2 ? 0.4 : 0.25); e.willSwoop = why !== 'denied'; SFX.screech(); if (why === 'denied') number(e.x, e.y - 24, 'THE LIGHT', '#ffd36b'); };
  if (e.mode !== 'wake' && e.mode !== 'sleep' && p2) { e.douseT = (e.douseT === undefined ? 10 : e.douseT - dt); if (e.douseT <= 0 && e.mode === 'sit') { const lit = lanterns.filter(pr => pr.perch && pr.lit); if (lit.length) { e.douseT = 12; const pr = lit[Math.floor(Math.random() * lit.length)]; pr.lit = false; pr.hits = 0; burst(pr.x, pr.y - 30, 8, ['#ffd36b', '#3a3444'], 40, 0.5); number(pr.x, pr.y - 42, 'BEATEN OUT', '#c080ff'); SFX.screech(); } } }
  switch (e.mode) {
    case 'wake': if (e.modeT <= 0) { e.mode = 'sit'; e.modeT = 1.6; e.hits = 0; } break;
    case 'sit': { e.x = e.perches[e.perchI].x; e.y = e.perches[e.perchI].y; e.face = Math.sign(d) || e.face;
      if (perchLit(e.perchI)) { flush('denied'); break; }
      if (e.hits >= 2) { flush('hit'); break; }
      if (e.modeT <= 0 && !P.dead) { const r = Math.random(); e.n = (e.n || 0) + 1;
        const nSp = enemies.filter(q => q.alive && q.t === 'spider').length;
        if (e.n % 3 === 0 && nSp < (p2 ? 3 : 2)) { e.mode = 'screechTell'; e.modeT = 0.5; number(e.x, e.y - 24, 'IT DRAWS BREATH', '#ffd36b'); }
        else if (r < 0.34) { e.mode = 'fanTell'; e.modeT = 0.45; number(e.x, e.y - 24, 'FEATHERS', '#e8dcc0'); SFX.buzz(); }
        else if (r < 0.5 && Math.abs(P.y - floor) < 30 && ad < 220) { e.mode = 'gust'; e.modeT = 1.4; e.gustDir = P.x - e.x > 0 ? 1 : -1; number(e.x, e.y - 24, 'WING BEAT', '#c9d1dc'); SFX.buzz(); }
        else flush('swoop'); }
      break; }
    case 'takeoff': if (e.modeT <= 0) { if (e.willSwoop) { e.mode = 'swoop'; e.modeT = 1.5; const tx = P.x + (Math.sign(P.x - e.x) || 1) * 24, ty = P.y - 8; const dd = Math.hypot(tx - e.x, ty - e.y) || 1; e.vx = (tx - e.x) / dd * 300; e.vy = (ty - e.y) / dd * 300; e.face = Math.sign(e.vx) || e.face; SFX.leap(); number(e.x, e.y - 24, e.grab ? 'TALONS' : '!!', e.grab ? '#ff9a5c' : '#ff6b6b'); } else { e.mode = 'fly'; e.modeT = 3; } } break;
    case 'swoop': { e.x += e.vx * dt; e.y += e.vy * dt;
      if (e.grab && !P.dead && ad < 20 && Math.abs((P.y - 8) - e.y) < 16 && e.hitT <= 0 && P.dodge <= 0) { e.hitT = 1; e.mode = 'carry'; e.modeT = 1.1; e.carryDir = P.x - (A.x0 + A.x1) / 2 > 0 ? 1 : -1; e.vy = -60; number(P.x, P.y - 24, 'CAUGHT', '#ff6b6b'); SFX.screech(); }
      else if (!P.dead && ad < 20 && Math.abs((P.y - 8) - e.y) < 16 && e.hitT <= 0) { e.hitT = 1; const res = damagePlayer(e.x, DMG.owlSwoop); if (res === 'hit') { P.vx = Math.sign(e.vx) * 220; P.vy = -120; } else if (res === 'blocked') { e.mode = 'parried'; e.modeT = 1.2; e.stagger = 1.2; e.vx = -e.vx * 0.3; e.vy = -80; number(e.x, e.y - 20, 'PARRIED', '#8fd160'); } }
      for (const pr of lanterns) if (pr.lit && !pr.perch && Math.abs(pr.x - e.x) < 16 && Math.abs((pr.y - 30) - e.y) < 18) { e.mode = 'crash'; e.modeT = p2 ? 2.0 : 2.5; e.stagger = e.modeT; e.vx = 0; e.vy = 0; number(e.x, e.y - 24, 'INTO THE LANTERN: HIT IT', '#8fd160'); SFX.heavy(); SFX.screech(); shakeCam(6); zoomKick(1.1, 0.3); burst(e.x, e.y, 16, COLS.owl, 80, 0.7); break; }
      if (e.y >= floor - 8) { e.y = floor - 8; e.vy = -Math.abs(e.vy) * 0.4; } if (e.x < A.x0 + 16 || e.x > A.x1 - 16) { e.x = Math.max(A.x0 + 16, Math.min(A.x1 - 16, e.x)); e.vx = -e.vx; }
      if (e.modeT <= 0 && e.mode === 'swoop') { e.mode = 'fly'; e.modeT = 3; } break; }
    case 'fly': { const p = e.perches[e.next]; e.face = Math.sign(p.x - e.x) || e.face; const left = toward(p.x, p.y - 10, 210); if (left <= 1) { e.mode = 'land'; e.modeT = 0.2; } else if (e.modeT <= 0) { e.x = p.x; e.y = p.y - 10; e.mode = 'land'; e.modeT = 0.2; } break; }
    case 'land': { const p = e.perches[e.next]; e.y = Math.min(p.y, e.y + 60 * dt); if (e.modeT <= 0) { e.perchI = e.next; e.x = p.x; e.y = p.y; e.mode = 'sit'; e.modeT = p2 ? 1.4 : 2.0; e.hits = 0; dust(e.x, e.y, 3); SFX.land(); } break; }
    case 'descend': { const left = toward(e.tx, floor - 8, 240); e.face = Math.sign(P.x - e.x) || e.face; if (left <= 1 || e.modeT <= 0) { e.y = floor - 8; e.mode = 'grounded'; e.modeT = p2 ? 3.2 : 4; e.stagger = e.modeT; number(e.x, e.y - 24, 'ON THE GROUND: HIT IT', '#8fd160'); shakeCam(3); } break; }
    case 'grounded': { e.y = floor - 8; if (Math.floor(e.modeT / 0.8) !== Math.floor((e.modeT + dt) / 0.8)) number(e.x, e.y - 24, 'HIT IT', '#8fd160'); if (e.modeT <= 0) { e.stagger = 0; const open = openPerches(); e.next = open.length ? open[Math.floor(Math.random() * open.length)] : e.perchI; e.mode = 'takeoff'; e.modeT = 0.25; e.willSwoop = true; e.grab = false; SFX.screech(); } break; }
    case 'carry': { e.x += e.carryDir * 170 * dt; e.y = Math.max(floor - 70, e.y + e.vy * dt); P.x = e.x; P.y = e.y + 12; P.vx = 0; P.vy = 0; P.ground = false; P.caged = 0.2; if (Math.random() < dt * 20) parts.push({ x: P.x, y: P.y - 8, vx: 0, vy: 30, life: 0.3, max: 0.3, col: '#e8dcc0', size: 1, grav: 0 }); if (e.modeT <= 0 || e.x < A.x0 + 30 || e.x > A.x1 - 30) { damagePlayer(e.x, DMG.screech, { unblockable: true, up: true }); P.vx = e.carryDir * 200; P.vy = 120; number(P.x, P.y - 24, 'DROPPED', '#ff6b6b'); e.mode = 'fly'; e.modeT = 3; e.next = e.perchI; } break; }
    case 'crash': { if (e.y < floor - 8) e.y = Math.min(floor - 8, e.y + 300 * dt); if (Math.floor(e.modeT / 0.7) !== Math.floor((e.modeT + dt) / 0.7)) number(e.x, e.y - 24, 'DAZED', '#8fd160'); if (e.modeT <= 0) { e.stagger = 0; e.mode = 'fly'; e.modeT = 3; const open = openPerches(); e.next = open.length ? open[Math.floor(Math.random() * open.length)] : e.perchI; } break; }
    case 'parried': if (e.modeT <= 0) { e.mode = 'fly'; e.modeT = 3; e.stagger = 0; e.next = e.perchI; } break;
    case 'screechTell': e.face = Math.sign(d) || e.face; if (e.modeT <= 0) { e.mode = 'screech'; e.modeT = 1.0; SFX.screech(); SFX.screech(); shakeCam(3); const n = p2 ? 2 : 1; for (let k = 0; k < n; k++) { const sx = Math.max(A.x0 + 40, Math.min(A.x1 - 40, P.x + (k ? -50 : 50))); enemies.push({ t: 'spider', x: sx, y: floor - 150, restY: floor - 150, drop: 130, mode: 'hang', modeT: 0, cd: 1.2, face: 1, w: 10, h: 8, hp: EHP.spider, hp0: EHP.spider, alive: true, dying: 0, anim: Math.random(), flash: 0, stagger: 0, vx: 0, vy: 0 }); } number(P.x, P.y - 30, 'SPIDERS', '#c080ff'); SFX.hiss(); if (!P.dead && ad < 60 && Math.abs(P.y - e.y) < 30) damagePlayer(e.x, DMG.screech); } break;
    case 'screech': if (e.modeT <= 0) { e.mode = 'sit'; e.modeT = 1.4; } break;
    case 'fanTell': e.face = Math.sign(d) || e.face; if (e.modeT <= 0) { e.mode = 'fan'; e.modeT = 0.6; const n = p2 ? 6 : 4; for (let k = 0; k < n; k++) { const a = Math.atan2((P.y - 8) - (e.y - 8), P.x - e.x) + (k - (n - 1) / 2) * 0.22; seeds.push({ x: e.x, y: e.y - 8, vx: Math.cos(a) * 170, vy: Math.sin(a) * 170, dead: false, life: 2.2, g: 60, feather: true }); } SFX.throwWhoosh(); } break;
    case 'fan': if (e.modeT <= 0) { e.mode = 'sit'; e.modeT = 1.2; } break;
    case 'gust': { if (!P.dead && Math.abs(P.y - floor) < 50) { P.vx += e.gustDir * 230 * dt; if (Math.random() < dt * 50) parts.push({ x: camX + Math.random() * VW, y: floor - 10 - Math.random() * 90, vx: e.gustDir * 240, vy: 0, life: 0.3, max: 0.3, col: '#e8dcc0', size: 1, grav: 0 }); } if (e.modeT <= 0) { e.mode = 'sit'; e.modeT = 1.0; } break; }
  }
  if (e.mode !== 'swoop' && e.mode !== 'crash' && e.mode !== 'carry') e.vy = 0;
  e.x = Math.max(A.x0 + 14, Math.min(A.x1 - 14, e.x));
}
// The Forgemaster. Layers: the hammer stamps on a rhythm, carts roll through on the rail, slag drips at marked spots. Moves: piston lunge, steam spray, a kicked cart. Window: burst his boiler.
function updateForgemaster(e, dt) {
  // Twice the smith he was. His iron turns half of every cut; a cart into him stuns him, and a stunned smith takes it all, doubled.
  // Always going: the hammer stamps, slag drips, a tub rolls in from the right. His moves: the hammer slam, steam, the DRAG (a chain to the
  // nearest tub, pulled to him, then hurled at you), the ANVIL (he rings it and hammers fall where you stand). Half dead: the furnace opens
  // for a fire breath, the floor plates glow and burn. In the castle he is the armoury's mini, not the level's boss.
  const A = e.mini ? L.mini : L.arena, floor = A.floor, p2 = e.phase === 2; e.modeT -= dt; e.hitT = Math.max(0, e.hitT - dt); e.vy += 1000 * dt; if (e.vy > 300) e.vy = 300; e.anim = (e.anim || 0) + dt;
  const d = P.x - e.x, ad = Math.abs(d);
  if (e.mode === 'sleep') return;
  if (e.mode !== 'wake' && e.mode !== 'stun') {
    e.hammerT -= dt; if (e.hammerT <= 0) { e.hammerT = p2 ? 2.6 : 3.4; const hm = props.find(pr => pr.t === 'hammer'); if (hm) { hm.tell = 0.6; SFX.charge(); } }
    e.cartT -= dt; if (e.cartT <= 0) { e.cartT = p2 ? 5 : 7; const c = movers.find(mv => mv.kind === 'cart' && mv.gone && mv.auto); if (c) { c.gone = false; c.x = c.x0; c.y = c.y0; c.vx = 0; c.vy = 0; c.rolling = true; c.ridden = false; c.kicked = false; c.hit.clear(); SFX.stone(); } }
    e.slagT -= dt; if (e.slagT <= 0) { e.slagT = p2 ? 4.5 : 6; for (const sx of (A.slag || [])) if (Math.random() < 0.7) { seeds.push({ x: sx, y: floor - 150, vx: 0, vy: 40, dead: false, life: 3, g: 300, slag: true }); parts.push({ x: sx, y: floor - 150, vx: 0, vy: 20, life: 0.5, max: 0.5, col: '#ff9a5c', size: 2, grav: 0 }); } }
    if (p2) { e.plateT -= dt; if (e.plateT <= 0) { e.plateT = 5; const pls = props.filter(pr => pr.t === 'hotplate'); const pick = pls.sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x)).slice(0, 2); for (const pl of pick) pl.glow = 0.9; SFX.hiss(); } }
    if (p2 && !e.opened) { e.opened = true; if (L.dark) L.dark = Math.min(L.dark, 0.5); number(e.x, e.y - e.h - 12, 'THE FURNACE OPENS', '#ff6b2c'); SFX.roar(); shakeCam(6); for (const dx of [-90, 90]) enemies.push({ t: 'bat', x: e.x + dx, y: floor - 90, hx: e.x + dx, hy: floor - 90, w: 10, h: 6, hp: EHP.bat, hp0: EHP.bat, mode: 'hang', modeT: 0, cd: 0.5, face: -1, alive: true, dying: 0, anim: Math.random(), flash: 0, stagger: 0, vx: 0, vy: 0 }); }
  }
  let want = 0;
  const nearestCart = () => { let best = null, bd = 1e9; for (const c of movers) if (c.kind === 'cart' && !c.gone && Math.abs(c.y + c.h - floor) < 20 && P.onMover !== c) { const dd = Math.abs(c.x + c.w / 2 - e.x); if (dd < bd && dd > 30) { bd = dd; best = c; } } return best; };
  switch (e.mode) {
    case 'wake': if (e.modeT <= 0) { e.mode = 'pace'; e.modeT = 1; } break;
    case 'stun': want = 0; if (Math.random() < dt * 12) parts.push({ x: e.x + (Math.random() - 0.5) * 30, y: e.y - e.h - 4, vx: 0, vy: -20, life: 0.5, max: 0.5, col: '#ffd36b', size: 2, grav: 0 }); if (e.modeT <= 0) { e.mode = 'pace'; e.modeT = 0.6; e.stagger = 0; number(e.x, e.y - e.h - 12, 'HE SHAKES IT OFF', '#9aa39a'); } break;
    case 'scald': want = 0; if (e.modeT <= 0) { e.mode = 'pace'; e.modeT = 0.6; e.stagger = 0; } break;
    case 'pace': { e.face = Math.sign(d) || e.face; want = ad > 110 ? e.face * 44 : ad < 50 ? -e.face * 30 : 0; for (const k of ['slamT', 'sprayT', 'dragT', 'anvilT', 'breathT']) e[k] -= dt;
      if (e.modeT <= 0 && !P.dead) {
        const cart = nearestCart();
        if (e.dragT <= 0 && cart) { e.dragT = p2 ? 9 : 12; e.mode = 'dragTell'; e.modeT = 0.7; e.cart = cart; number(e.x, e.y - e.h - 12, 'THE CHAIN', '#ffd36b'); SFX.forgeChain(); }
        else if (e.anvilT <= 0) { e.anvilT = p2 ? 9 : 13; e.mode = 'anvilTell'; e.modeT = 0.8; number(e.x, e.y - e.h - 12, 'HE RINGS THE ANVIL', '#ffd36b'); SFX.charge(); }
        else if (p2 && e.breathT <= 0 && ad < 140) { e.breathT = 9; e.mode = 'breathTell'; e.modeT = 0.8; number(e.x, e.y - e.h - 12, 'THE FURNACE', '#ff6b2c'); SFX.gasp(); }
        else if (e.sprayT <= 0 && ad < 120) { e.sprayT = p2 ? 6 : 8; e.mode = 'sprayTell'; e.modeT = 0.5; number(e.x, e.y - e.h - 12, 'STEAM', '#e8e0d0'); SFX.hiss(); }
        else if (e.slamT <= 0 && ad < 70) { e.slamT = p2 ? 3 : 4; e.mode = 'slamTell'; e.modeT = 0.7; number(e.x, e.y - e.h - 12, '!!', '#ff6b6b'); SFX.forgeSteam(); }
        else if (ad > 60) { e.mode = 'stride'; e.modeT = 0.9; }
      }
      break; }
    case 'stride': e.face = Math.sign(d) || e.face; want = e.face * 90; if (e.modeT <= 0 || ad < 50) { e.mode = 'pace'; e.modeT = 0.4; } break;
    case 'slamTell': e.face = Math.sign(d) || e.face; if (e.modeT <= 0) { e.mode = 'slam'; e.modeT = 0.5; shakeCam(8); SFX.forgeHammer(); zoomKick(1.1, 0.25); dust(e.x + e.face * 30, e.y, 14); for (const dd of [-1, 1]) waves.push({ x: e.x + dd * 34, y: floor, dir: dd, life: 1.5, sp: p2 ? 190 : 160 }); if (!P.dead && Math.sign(P.x - e.x) === e.face && ad < 58 && Math.abs(P.y - e.y) < 24) damagePlayer(e.x, DMG.hammer, { unblockable: true, up: true }); } break;
    case 'slam': want = 0; if (e.modeT <= 0) { e.mode = 'pace'; e.modeT = 0.9; } break;
    case 'sprayTell': e.face = Math.sign(d) || e.face; if (e.modeT <= 0) { e.mode = 'spray'; e.modeT = 0.9; e.sprayN = 0; } break;
    case 'spray': { e.sprayN = (e.sprayN || 0) + dt * 12; if (Math.floor(e.sprayN) !== Math.floor(e.sprayN - dt * 12) && Math.floor(e.sprayN) <= 8) { seeds.push({ x: e.x + e.face * 22, y: e.y - 20, vx: e.face * (200 + Math.random() * 40), vy: -20 + Math.random() * 40, dead: false, life: 0.7, g: 60, steam: true }); SFX.hiss(); } if (e.modeT <= 0) { e.mode = 'pace'; e.modeT = 0.7; } break; }
    case 'dragTell': { const c = e.cart; if (!c || c.gone) { e.mode = 'pace'; e.modeT = 0.4; break; } e.face = Math.sign(c.x + c.w / 2 - e.x) || e.face; if (e.modeT <= 0) { e.mode = 'drag'; e.modeT = 2.2; c.rolling = false; c.dragged = true; c.kicked = false; c.ridden = false; c.hit.clear(); SFX.rattle(1); } break; }
    case 'drag': { const c = e.cart; if (!c || c.gone) { e.mode = 'pace'; e.modeT = 0.4; break; } const tx = e.x + e.face * 26; const dx = tx - (c.x + c.w / 2); c.vx = Math.sign(dx) * Math.min(260, Math.abs(dx) * 6); c.x += c.vx * dt; if (Math.random() < dt * 20) parts.push({ x: c.x + c.w / 2, y: c.y + 4, vx: -Math.sign(dx) * 40, vy: -20, life: 0.3, max: 0.3, col: '#ffd36b', size: 1, grav: 200 }); if (Math.abs(dx) < 8 || e.modeT <= 0) { e.mode = 'hurlTell'; e.modeT = 0.5; c.vx = 0; number(e.x, e.y - e.h - 12, '!!', '#ff6b6b'); SFX.charge(); } break; }
    case 'hurlTell': { const c = e.cart; e.face = Math.sign(d) || e.face; if (c && !c.gone) { c.x = e.x + e.face * 26 - c.w / 2; } if (e.modeT <= 0) { e.mode = 'hurl'; e.modeT = 0.5; if (c && !c.gone) { c.dragged = false; c.rolling = true; c.kicked = true; c.dir = e.face; c.vx = e.face * 280; c.vy = -60; c.hurled = 1.2; c.hit.clear(); c.hit.add(e); } SFX.throwWhoosh(); SFX.bellow(); shakeCam(4); } break; }
    case 'hurl': want = 0; if (e.modeT <= 0) { e.mode = 'pace'; e.modeT = 0.8; } break;
    case 'anvilTell': { e.face = Math.sign(d) || e.face; const an = props.find(pr => pr.t === 'anvil'); if (an) { const ax = an.x - e.x; if (Math.abs(ax) > 30) want = Math.sign(ax) * 90; } if (e.modeT <= 0) { e.mode = 'anvil'; e.modeT = 0.6; if (an) { an.ring = 0.6; } SFX.clank(); SFX.heavy(); shakeCam(5); const n = p2 ? 3 : 2; for (let k = 0; k < n; k++) { const rx = Math.max(A.x0 + 16, Math.min(A.x1 - 16, P.x + (k - (n - 1) / 2) * 34 + P.vx * 0.4)); rocks.push({ x: rx, y: floor - 170, vx: 0, vy: 0, t: 0, dead: false, thrown: true, hammerRock: true, shadowT: 0.8 }); } number(e.x, e.y - e.h - 12, 'HAMMERS', '#ff6b6b'); } break; }
    case 'anvil': want = 0; if (e.modeT <= 0) { e.mode = 'pace'; e.modeT = 0.7; } break;
    case 'breathTell': e.face = Math.sign(d) || e.face; if (e.modeT <= 0) { e.mode = 'breath'; e.modeT = 1.4; for (let k = 1; k <= 8; k++) fires.push({ x: e.x + e.face * (24 + k * 14), y: floor, life: 1.6, delay: k * 0.08 }); SFX.roar(); SFX.puff(); shakeCam(3); } break;
    case 'breath': want = 0; if (Math.random() < dt * 30) parts.push({ x: e.x + e.face * (24 + Math.random() * 30), y: e.y - 20 + (Math.random() - 0.5) * 12, vx: e.face * 120, vy: (Math.random() - 0.5) * 30, life: 0.3, max: 0.3, col: Math.random() < 0.5 ? '#ff6b2c' : '#ffd36b', size: 2, grav: 0 }); if (e.modeT <= 0) { e.mode = 'pace'; e.modeT = 0.9; } break;
  }
  if (e.stagger > 0 && e.mode !== 'stun') want = 0;
  e.vx += (want - e.vx) * Math.min(1, dt * 6);
  const r = moveBody(e, e.vx * dt, e.vy * dt, false); if (r.ground) e.vy = 0;
  e.x = Math.max(A.x0 + 24, Math.min(A.x1 - 24, e.x));
  { const ph = Math.floor(e.anim * (Math.abs(e.vx) > 60 ? 4.5 : 3)); if (Math.abs(e.vx) > 10 && ph !== e.stepPh && ph % 2 === 0) { SFX.thump(); if (Math.abs(e.vx) > 60) shakeCam(1); } e.stepPh = ph; } // every plant of the boot lands
}
const forgeOpen = e => e.mode === 'stun' || e.mode === 'scald';
const FACET_COL = ['blue', 'violet', 'green', 'both'];
function updateGolem(e, dt) {
  // It only bleeds in the light. A beam on it lights a facet; cut the facet away. It stamps (a stamp turns a mirror it stands by), throws shards, and raises ice against the beam.
  const A = L.arena, floor = A.floor, p2 = e.phase === 2; e.modeT -= dt; e.hitT = Math.max(0, e.hitT - dt); e.vy += 1000 * dt; if (e.vy > 300) e.vy = 300; e.anim = (e.anim || 0) + dt;
  const d = P.x - e.x, ad = Math.abs(d);
  if (e.mode === 'sleep') return;
  const facet = Math.min(3, Math.floor((e.maxHp - e.hp) / (e.maxHp / 4))); e.need = FACET_COL[facet];
  // the counter-beam: lit for two seconds and it drinks the light and throws it back along a sweep
  e.litT = e.lit && e.mode !== 'stagger' ? (e.litT || 0) + dt : Math.max(0, (e.litT || 0) - dt * 2); e.cbCd = Math.max(0, (e.cbCd || 0) - dt);
  if (e.litT > 2 && e.cbCd <= 0 && e.mode === 'walk') { e.mode = 'drink'; e.modeT = 0.6; e.litT = 0; e.cbCd = 5; number(e.x, e.y - e.h - 12, 'IT DRINKS THE LIGHT', '#ff7ab8'); SFX.golemChime(); SFX.gasp(); }
  if (facet > e.facets) { e.facets = facet; e.mode = 'stagger'; e.modeT = 1.6; e.stagger = 1.6; e.vx = 0; burst(e.x, e.y - 20, 20, COLS.golem, 90, 0.8); shakeCam(6); zoomKick(1.1, 0.3); SFX.golemShatter(); number(e.x, e.y - e.h - 14, 'A FACET SHATTERS', '#ff7ab8'); if (facet >= 2) e.phase = 2; }
  let want = 0;
  switch (e.mode) {
    case 'wake': if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 1; } break;
    case 'stagger': want = 0; if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.6; e.stagger = 0; } break;
    case 'drink': want = 0; e.face = Math.sign(d) || e.face; if (Math.random() < dt * 40) parts.push({ x: e.x + (Math.random() - 0.5) * 40, y: e.y - 18 + (Math.random() - 0.5) * 30, vx: 0, vy: 0, life: 0.3, max: 0.3, col: '#eefaff', size: 1, grav: 0 }); if (e.modeT <= 0) { e.mode = 'counter'; e.modeT = 1.3; e.cbA0 = Math.atan2((P.y - 8) - (e.y - 18), P.x - e.x); e.cbDir = Math.random() < 0.5 ? -1 : 1; SFX.golemThrow(); SFX.callerBlast(); shakeCam(4); } break;
    case 'counter': { want = 0; const t = 1 - e.modeT / 1.3; const a = e.cbA0 + (t - 0.5) * 1.3 * e.cbDir; const ox = e.x, oy = e.y - 18, ex = ox + Math.cos(a) * 260, ey = oy + Math.sin(a) * 260; e.cb = { x0: ox, y0: oy, x1: ex, y1: ey }; if (!P.dead && !(P.cbHit > 0)) { const px = P.x - ox, py = (P.y - 8) - oy, len = 260, ux = Math.cos(a), uy = Math.sin(a); const along = px * ux + py * uy; if (along > 12 && along < len) { const dist = Math.abs(px * uy - py * ux); if (dist < 9) { P.cbHit = 0.6; damagePlayer(e.x, DMG.counter, { unblockable: true, up: true }); P.vx = Math.sign(P.x - e.x) * 200; number(P.x, P.y - 24, 'BURNED', '#ff7ab8'); } } } if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.8; e.cb = null; } break; }
    case 'walk': { e.face = Math.sign(d) || e.face; want = ad > 40 ? e.face * (p2 ? 44 : 30) : 0; for (const k of ['stompT', 'throwT', 'shroudT']) e[k] -= dt;
      if (e.modeT <= 0 && !P.dead) {
        const mirrorNear = props.find(pr => pr.t === 'mirror' && Math.abs(pr.x - e.x) < 44);
        if (e.stompT <= 0 && (ad < 60 || mirrorNear)) { e.stompT = p2 ? 4 : 5.5; e.mode = 'stompTell'; e.modeT = 0.7; number(e.x, e.y - e.h - 12, '!!', '#ff6b6b'); SFX.golemChime(); }
        else if (e.shroudT <= 0 && e.lit) { e.shroudT = p2 ? 8 : 11; e.mode = 'shroudTell'; e.modeT = 0.6; number(e.x, e.y - e.h - 12, 'IT RAISES ICE', '#bfe6f5'); SFX.hiss(); }
        else if (e.throwT <= 0 && ad > 50) { e.throwT = p2 ? 3.5 : 5; e.mode = 'throwTell'; e.modeT = 0.55; number(e.x, e.y - e.h - 12, '!', '#ffd36b'); SFX.buzz(); }
      } break; }
    case 'stompTell': e.face = Math.sign(d) || e.face; if (e.modeT <= 0) { e.mode = 'stomp'; e.modeT = 0.5; shakeCam(7); SFX.golemStomp(); zoomKick(1.08, 0.2); dust(e.x - 12, e.y, 8); dust(e.x + 12, e.y, 8); for (const dd of [-1, 1]) waves.push({ x: e.x + dd * 20, y: floor, dir: dd, life: 1.4, sp: p2 ? 170 : 140 }); if (!P.dead && ad < 34 && Math.abs(P.y - e.y) < 22 && P.ground) damagePlayer(e.x, DMG.golemStomp, { unblockable: true, up: true }); for (const pr of props) if (pr.t === 'mirror' && Math.abs(pr.x - e.x) < 44) { pr.o = 1 - pr.o; pr.turnT = 0.3; number(pr.x, pr.y - 22, 'THE MIRROR TURNS', '#ff6b6b'); SFX.clank(); } } break;
    case 'stomp': want = 0; if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.8; } break;
    case 'throwTell': e.face = Math.sign(d) || e.face; if (e.modeT <= 0) { e.mode = 'throw'; e.modeT = 0.5; const n = p2 ? 4 : 3; for (let k = 0; k < n; k++) { const sx = e.x + e.face * 12, sy = e.y - 26, Tf = 0.75 + k * 0.12, G = 380, dx = P.x - sx, dy = (P.y - 8) - sy; seeds.push({ x: sx, y: sy, vx: Math.max(-230, Math.min(230, dx / Tf)), vy: dy / Tf - 0.5 * G * Tf, dead: false, life: 3, g: G, shard: true }); } SFX.golemThrow(); } break;
    case 'throw': want = 0; if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.7; } break;
    case 'shroudTell': want = 0; if (e.modeT <= 0) { e.mode = 'shroud'; e.modeT = 0.6; const fy = Math.floor(floor / TS) - 1; for (const sx of [-3, 3]) { const tx = Math.floor(e.x / TS) + sx; for (const ty of [fy, fy - 1]) { if (tx <= A.x0 / TS || tx >= A.x1 / TS) continue; const i = ty * LW + tx; if (L.grid[i] === T.AIR && !(Math.abs(P.x - (tx * TS + 8)) < 14 && Math.abs(P.y - (ty + 1) * TS) < 20)) { L.grid[i] = T.ICE; tileSpr[i] = TILE.ice || (TILE.ice = bakeIceTile()); meltT[i] = 0; burst(tx * TS + 8, ty * TS + 8, 6, ['#eefaff', '#9fd0e8'], 40, 0.4); } } } SFX.crack(); shakeCam(3); } break;
    case 'shroud': want = 0; if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.8; } break;
  }
  if (e.stagger > 0 && e.mode !== 'stagger') want = 0;
  e.vx += (want - e.vx) * Math.min(1, dt * 5);
  const r = moveBody(e, e.vx * dt, e.vy * dt, false); if (r.ground) e.vy = 0;
  e.x = Math.max(A.x0 + 20, Math.min(A.x1 - 20, e.x));
}
// SHARDLING - a knot of crystal that walks. Killing one is easy; standing next to it when you do is not.
function updateShardling(e, dt) {
  e.modeT -= dt; e.vy += 1000 * dt; if (e.vy > 320) e.vy = 320;
  const d = P.x - e.x, ad = Math.abs(d);
  if (ad < 190 && !P.dead) e.face = Math.sign(d) || e.face;
  const want = ad < 190 && !P.dead && e.stagger <= 0 ? e.face * e.speed : 0;
  e.vx += (want - e.vx) * Math.min(1, dt * 6);
  { const was = e.mode; e.mode = ad < 40 ? 'bristle' : 'walk'; if (e.mode === 'bristle' && was !== 'bristle') SFX.shardBristle(); }
  const aheadX = e.x + Math.sign(e.vx || e.face) * (e.w / 2 + 2), ftx = Math.floor(aheadX / TS), fty = Math.floor((e.y + 1) / TS);
  const r = moveBody(e, e.vx * dt, e.vy * dt, false); if (r.ground) e.vy = 0;
  if (r.ground && tileAt(ftx, fty) === T.AIR) { e.vx = 0; e.face = -e.face; }
  if (r.hitX) { e.vx = 0; e.face = -e.face; }
}

// THE SUNCATCHER. It does not chase. It stands on the peak and works on the ground you are standing on:
// it turns rock to crystal, it raises spires, and it throws the light back. It is armoured while it is
// bright - the only thing that dims it is one of its own spires coming down on its head.
// THE ROC - the Sunspire's mother of harpies. She is in the air nearly all the time, quick and hard to
// hurt there, and she comes down for two reasons: to take you, and because something knocked her down.
// On the ground she is slow and open. Three things run at once: she DIVES (a shadow marks the spot; onto
// glass her talons go through it and she is stuck, onto rock she skids), she beats her wings in a GALE
// that walks you toward the thorns at either end of the crown, and once she is hurt she SHEDS her glass
// feathers. The thermals are the player's: glass that breaks over a vent goes up, and it knocks her down.
// THE GOBLIN QUEEN. Three phases, three layers each.
// 1 THE COURT: she sits her throne. Where she points, her gallery looses; she throws the court's bombs; her
//   guard keeps two between you and the dais. Break the gallery's supports and it comes down on her.
// 2 THE QUEEN RISES: on her feet with the iron sceptre - a slam that splits the floor both ways, a low sweep,
//   a charge the length of the hall that ends in the wall - and the storm comes in through the windows.
// 3 THE CROWN: she goes up through her own ceiling to the roof. Up there she leaps from peak to peak and
//   throws the slates, and the storm looks for the tallest iron on the mountain: stand where she jumps to
//   a peak with a rod on it, and the lightning finds her crown.
const gqOpen = e => ['slamRec', 'rec', 'dazed', 'struck', 'topple', 'sceptreWait'].includes(e.mode);
let sceptres = []; // her sceptre in flight: out along the floor, back at head height
const GQ_FRAME = { sleep: 0, wake: 0, court: 0, point: 1, throw: 2, topple: 10, rise: 3, stand: e => Math.abs(e.vx) > 6 ? 4 + Math.floor(e.anim * 5) % 2 : 3, slamTell: 6, slam: 7, slamRec: 7, sweepTell: 3, sweep: 8, rec: 8,
  chargeTell: 6, charge: 9, dazed: 10, chandTell: 2, decreeTell: 6, decree: 7, sceptreTell: 2, sceptreWait: 3, ceilTell: 6, ceil: 11, roofWait: 3, roof: e => Math.abs(e.vx) > 6 ? 4 + Math.floor(e.anim * 5) % 2 : 3, slateTell: 12, slate: 12, leapTell: 6, leap: 11, land: 7, struck: 13 };
let HALLWIN = null;
function bakeHallWindow() { const [c, g2] = canvas(18, 30); g2.fillStyle = '#1b1626'; g2.fillRect(0, 6, 18, 24); g2.beginPath(); g2.arc(9, 8, 9, Math.PI, 0); g2.fill(); g2.fillStyle = '#2a3050'; g2.fillRect(2, 8, 14, 20); g2.beginPath(); g2.arc(9, 8, 7, Math.PI, 0); g2.fill(); g2.fillStyle = '#3a4270'; for (let k = 0; k < 6; k++) g2.fillRect(3 + (k * 5) % 12, 10 + k * 3, 1, 4); g2.fillStyle = '#5a6270'; g2.fillRect(8, 2, 2, 26); g2.fillRect(2, 16, 14, 2); return c; }
// her callouts ride over her head, like every boss's last words do
const gqSay = (q, txt, col) => { if (q) number(q.x, q.y - 70, txt, col || '#ffd36b'); };
function gqCollapse(q) {
  if (L.galleryDown) return; L.galleryDown = true; L.windowsOut = true;
  const G = L.arena && L.arena.gallery; if (!G) return;
  const keep = L.arena.taken || (L.arena.taken = new Map());
  for (let x = G.x0; x <= G.x1; x++) { const i = G.row * LW + x; if (L.grid[i] !== T.AIR) { if (!keep.has(i)) keep.set(i, L.grid[i]); L.grid[i] = T.AIR; tileSpr[i] = null; destroyed.add(i); } if (x % 2 === 0) parts.push({ x: x * TS + 8, y: G.row * TS + 4, vx: (Math.random() - 0.5) * 60, vy: 20, life: 1.2, max: 1.2, col: Math.random() < 0.5 ? '#5a5a68' : '#8a5a32', size: 3, grav: 500 }); }
  resolveTiles();
  for (const en of enemies) if (en.alive && en.gallery) hurtEnemy(en, 999, en.x, false);
  for (const pr of props) if (pr.t === 'support') pr.broken = true;
  if (!P.dead && P.x > G.x0 * TS && P.x < (G.x1 + 1) * TS && P.y > G.row * TS) damagePlayer(P.x - 1, 15, { up: true, unblockable: true });
  SFX.heavy(); SFX.crack(); SFX.stone(); SFX.thunder(); shakeCam(12); zoomKick(1.12, 0.5); flash = Math.max(flash, 0.3);
  if (q && q.alive && q.phase === 1) { q.hp -= Math.round(q.maxHp * 0.22); q.flash = 0.4; q.mode = 'topple'; q.modeT = 2.6; burst(q.x, q.y - 40, 24, ['#5a5a68', '#8a5a32', '#e0b040'], 90, 0.8); gqSay(q, 'THE GALLERY COMES DOWN ON HER', '#8fd160'); }
}
function gqCeiling(q) { // she goes up through her own roof, and what she brings down is the way after her
  const A = L.arena, H0 = A.hole; if (!H0 || A.holeOpen) return; A.holeOpen = true;
  const keep = A.taken || (A.taken = new Map()), laid = A.laid || (A.laid = []);
  for (let ty = H0.y0; ty <= H0.y1; ty++) for (let tx = H0.x0; tx <= H0.x1; tx++) { const i = ty * LW + tx; if (L.grid[i] !== T.AIR) { if (!keep.has(i)) keep.set(i, L.grid[i]); L.grid[i] = T.AIR; tileSpr[i] = null; destroyed.add(i); } }
  for (const [x, y, n] of (A.rubble || [])) for (let k = 0; k < n; k++) { const i = y * LW + x + k; if (L.grid[i] === T.AIR) { L.grid[i] = T.ONEWAY; grid0[i] = T.ONEWAY; tileSpr[i] = null; laid.push(i); } }
  if (!L.galleryDown) gqCollapse(null);
  resolveTiles(); SFX.heavy(); SFX.crack(); shakeCam(10); flash = Math.max(flash, 0.25);
  for (let k = 0; k < 20; k++) parts.push({ x: (H0.x0 + Math.random() * (H0.x1 - H0.x0 + 1)) * TS, y: H0.y1 * TS + 8, vx: (Math.random() - 0.5) * 120, vy: 40 + Math.random() * 80, life: 1.2, max: 1.2, col: Math.random() < 0.5 ? '#5a5a68' : '#3a3a44', size: 3, grav: 500 });
}
function updateSceptres(dt) { const A = L.arena; if (!A) { sceptres = []; return; }
  for (const s of sceptres) { s.t += dt; s.x += s.dir * 250 * dt;
    if (!s.back && (s.x < A.x0 + 20 || s.x > A.x1 - 20 || s.t > 1.4)) { s.back = true; s.dir = -s.dir; s.y = A.floor - 30; s.hit = false; SFX.clank(); }
    if (Math.random() < dt * 30) parts.push({ x: s.x, y: s.y, vx: 0, vy: 0, life: 0.25, max: 0.25, col: '#c9a0ff', size: 1, grav: 0, glow: true });
    if (!P.dead && !s.hit && Math.abs(P.x - s.x) < 10 && s.y > P.y - 16 && s.y < P.y + 2) { s.hit = true; damagePlayer(s.x - s.dir * 10, DMG.gqSceptre); }
    if (s.back && Math.abs(s.x - s.owner.x) < 18) s.done = true; }
  sceptres = sceptres.filter(s => !s.done && s.t < 4 && s.owner.alive); }
function updateGQueen(e, dt) {
  const A = L.arena, hall = A.floor, roof = A.roof;
  if (e.phase > 1 && e.hp < e.maxHp * 0.15) { if (!e.enraged) { e.enraged = true; SFX.bellow(); shakeCam(8); flash = Math.max(flash, 0.25); } dt *= 1.3; if (Math.random() < dt * 30) parts.push({ x: e.x + (Math.random() - 0.5) * 30, y: e.y - 56 - Math.random() * 10, vx: 0, vy: -40, life: 0.4, max: 0.4, col: '#ff6b2c', size: 2, grav: 0, fire: true }); } // THE CROWN BURNS
  e.modeT -= dt; e.anim += dt; e.hitT = Math.max(0, e.hitT - dt);
  const d = P.x - e.x, ad = Math.abs(d);
  let want = 0, physics = e.phase > 1 && e.mode !== 'ceil';
  if (e.mode === 'sleep') return;
  // the phases turn on her health
  if (e.phase === 1 && e.hp <= e.maxHp * 0.7 && e.mode !== 'topple') { e.phase = 2; e.mode = 'rise'; e.modeT = 1.2; L.windowsOut = true; SFX.bellow(); shakeCam(6); gqSay(e, 'THE QUEEN RISES', '#ff6b6b'); }
  if (e.phase === 2 && e.hp <= e.maxHp * 0.35 && ['stand', 'slamRec', 'rec', 'dazed'].includes(e.mode)) { e.phase = 3; e.mode = 'ceilTell'; e.modeT = 1.0; SFX.bellow(); gqSay(e, 'SHE GOES FOR THE ROOF', '#ff6b6b'); }
  // THE STORM through the windows, once they are out: a gust down the hall on a beat
  if (e.phase === 2 && L.windowsOut) { e.gustT -= dt; if (e.gustT <= 0) { e.gustT = 7.5; e.gustDir = Math.random() < 0.5 ? -1 : 1; e.gusting = 2; SFX.thunder(); flash = Math.max(flash, 0.12); }
    if (e.gusting > 0) { e.gusting -= dt; if (!P.dead) P.vx += e.gustDir * (P.ground ? 150 : 200) * dt; if (Math.random() < dt * 40) parts.push({ x: camX + (e.gustDir > 0 ? 0 : VW), y: camY + Math.random() * VH, vx: e.gustDir * 280, vy: 20, life: 1.2, max: 1.2, col: '#dfe8ff', size: 1, grav: 0 }); } }
  // THE LIGHTNING on the roof
  if (e.phase === 3 && e.mode !== 'ceil' && e.mode !== 'ceilTell' && e.mode !== 'roofWait') {
    if (!(e.gather > 0)) { e.boltT -= dt; if (e.boltT <= 0) { e.boltT = 4; e.gather = 0.9; e.markX = P.x; e.marks = [P.x - 46, P.x, P.x + 46]; const rods = props.filter(p => p.t === 'rod'); const near = rods.sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0]; e.rodTarget = near && Math.abs(near.x - e.x) < 30 && e.y <= near.y + 6 ? near : null; SFX.thunder(); flash = Math.max(flash, 0.1); } }
    else { e.gather -= dt; if (e.gather <= 0) { e.gather = 0;
      const rods = props.filter(p => p.t === 'rod'), near = rods.sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0];
      if (near && Math.abs(near.x - e.x) < 30 && e.y <= near.y + 6) { // the tallest iron on the mountain is her crown
        bolts.push({ x: near.x, y: near.y - 18, life: 0.35, storm: true }); e.mode = 'struck'; e.modeT = 2.6; e.hp -= Math.round(e.maxHp * 0.06); e.flash = 0.5; e.vx = (e.x < near.x ? -1 : 1) * 70; e.vy = -140;
        SFX.thunder(); SFX.golemShatter(); shakeCam(10); flash = Math.max(flash, 0.5); gqSay(e, 'THE STORM FINDS HER CROWN', '#dfe8ff'); if (e.hp <= 0) hurtEnemy(e, 1, e.x, false); }
      else { for (const mx of (e.marks || [e.markX])) { bolts.push({ x: mx, y: roof, life: 0.3, storm: true }); if (!P.dead && Math.abs(P.x - mx) < 18 && P.y > roof - 48) damagePlayer(mx, DMG.gqBolt, { unblockable: true, up: true }); } SFX.thunder(); shakeCam(6); flash = Math.max(flash, 0.3); }
      e.rodTarget = null; } }
  }
  switch (e.mode) {
    case 'wake': e.x = e.throneX; e.y = e.throneY; if (e.modeT <= 0) { e.mode = 'court'; e.modeT = 0.8; for (const en of enemies) if (en.alive && en.t === 'archer' && A.gallery && Math.abs(en.y - A.gallery.row * TS) < 6) en.gallery = true; } break;
    // ---- phase one: the court ----
    case 'court': { e.x = e.throneX; e.y = e.throneY; e.vx = 0; e.vy = 0; e.face = -1; e.pointT -= dt; e.bombT -= dt; e.guardT -= dt;
      const guards = enemies.filter(en => en.alive && en.royal).length;
      if (guards < 3 && e.guardT <= 0) { e.guardT = 6; const n0 = enemies.length; let gx = Math.floor(e.throneX / TS) - 3; while (gx > A.x0 / TS && isSolid(gx, Math.floor(hall / TS) - 1)) gx--; spawnEnt({ t: 'shield', x: gx - 2 - guards * 3, y: Math.floor(hall / TS) - 1, face: -1 }); /* (they spawned inside the dais: now at its foot) */ for (let i = n0; i < enemies.length; i++) enemies[i].royal = true; SFX.clank(); }
      const archers = enemies.some(en => en.alive && en.gallery);
      if (e.modeT <= 0) {
        if (e.pointT <= 0 && archers && !L.galleryDown) { e.pointT = 3.0; e.mode = 'point'; e.modeT = 0.9; e.markX = Math.max(A.x0 + 20, Math.min(A.x1 - 60, P.x)); SFX.bellow(); }
        else if (e.bombT <= 0) { e.bombT = archers ? 5 : 3; e.mode = 'throw'; e.modeT = 0.6; e.thrown = false; }
      }
      break; }
    case 'point': e.x = e.throneX; e.y = e.throneY; if (e.modeT <= 0) { e.mode = 'court'; e.modeT = 0.6; SFX.bow();
      if (A.gallery && !L.galleryDown && enemies.some(en => en.alive && en.gallery)) for (let k = 0; k < 5; k++) seeds.push({ x: e.markX + (k - 2) * 13 + (Math.random() - 0.5) * 6, y: A.gallery.row * TS - 4, vx: (Math.random() - 0.5) * 20, vy: 80, dead: false, life: 3, g: 520, arrow: true }); }
      break;
    case 'throw': e.x = e.throneX; e.y = e.throneY; if (!e.thrown && e.modeT < 0.3) { e.thrown = true; const sx = e.x - 14, sy = e.y - 60; bombs.push({ x: sx, y: sy, vx: (P.x - sx) / 1.1, vy: -250, fuse: 1.4 }); SFX.throwWhoosh(); } if (e.modeT <= 0) { e.mode = 'court'; e.modeT = 0.5; } break;
    case 'topple': e.x = e.throneX; e.y = e.throneY; if (Math.random() < dt * 10) parts.push({ x: e.x + (Math.random() - 0.5) * 30, y: e.y - 60, vx: 0, vy: -20, life: 0.5, max: 0.5, col: '#ffd36b', size: 2, grav: 0 }); if (e.modeT <= 0) { e.phase = 2; e.mode = 'rise'; e.modeT = 1.0; SFX.bellow(); gqSay(e, 'THE QUEEN RISES', '#ff6b6b'); } break;
    case 'rise': want = 0; if (e.modeT <= 0) { e.mode = 'stand'; e.modeT = 0.6; } break;
    // ---- phase two: the sceptre ----
    case 'stand': { e.face = Math.sign(d) || e.face; want = ad > 44 ? e.face * 55 : 0; e.slamT -= dt; e.sweepT -= dt; e.chargeT -= dt; e.chandT = (e.chandT ?? 3) - dt; e.decreeT = (e.decreeT ?? 4) - dt; e.throwT2 = (e.throwT2 ?? 2.5) - dt;
      if (e.modeT <= 0 && !P.dead) {
        const ch = (e.chandT = (e.chandT ?? 3) - 0) <= 0 && props.find(pr => pr.t === 'weight' && pr.gq && pr.state === 'hang' && Math.abs(pr.x - P.x) < 34 && Math.abs(pr.x - e.x) > 30);
        if (ch) { e.chandT = 6.5; e.mode = 'chandTell'; e.modeT = 0.7; e.chand = ch; SFX.bellow(); gqSay(e, '!', '#ffd36b'); }
        else if (e.decreeT <= 0) { e.decreeT = 9; e.mode = 'decreeTell'; e.modeT = 0.9; SFX.callerChant(); ringAt(e.x, e.y - 30, 26, '#c9a0ff', 0.6); }
        else if (e.throwT2 <= 0 && ad > 70) { e.throwT2 = 6.5; e.mode = 'sceptreTell'; e.modeT = 0.6; SFX.snort(); }
        else if (e.chargeT <= 0 && ad > 100) { e.chargeT = 5.5; e.mode = 'chargeTell'; e.modeT = 0.8; SFX.bellow(); }
        else if (e.slamT <= 0 && ad < 96) { e.slamT = 2.6; e.mode = 'slamTell'; e.modeT = 0.7; SFX.charge(); }
        else if (e.sweepT <= 0 && ad < 54) { e.sweepT = 2.0; e.mode = 'sweepTell'; e.modeT = 0.45; SFX.snort(); }
      } break; }
    // she draws back and hurls the sceptre at the chain: it rings off it and comes back to her hand, and the chandelier shakes
    case 'chandTell': { const c = e.chand; e.face = Math.sign((c ? c.x : P.x) - e.x) || e.face; want = 0;
      if (e.modeT <= 0) { e.mode = 'rec'; e.modeT = 0.9;
        if (c && c.state === 'hang') { c.state = 'tell'; c.tellT = 0.8; c.fy = c.y + c.len; c.hitE = null; c.hitP = false; { let fy = Math.floor(c.fy / TS); while (fy < LH - 1 && !isSolid(Math.floor(c.x / TS), fy)) fy++; c.floorY = fy * TS; }
          for (let k = 0; k < 10; k++) { const q = k / 10; parts.push({ x: e.x + (c.x - e.x) * q, y: (e.y - 50) + (c.y + c.len - 10 - (e.y - 50)) * q, vx: 0, vy: 0, life: 0.25, max: 0.25, col: '#c9d1dc', size: 2, grav: 0 }); }
          SFX.clank(); SFX.forgeChain(); burst(c.x, c.y + c.len - 12, 8, ['#ffd36b', '#fff6c8'], 50, 0.4); } }
      break; }
    // THE DECREE: the sceptre goes up, the court's own ground answers - three royal shockwaves both ways, on a beat you
    // jump to - and a guard comes in at the door behind you
    case 'decreeTell': want = 0; e.face = Math.sign(d) || e.face; if (Math.random() < dt * 30) parts.push({ x: e.x + (Math.random() - 0.5) * 30, y: e.y - 60 - Math.random() * 10, vx: 0, vy: -30, life: 0.4, max: 0.4, col: '#c9a0ff', size: 2, grav: 0, glow: true });
      if (e.modeT <= 0) { e.mode = 'decree'; e.modeT = 1.5; e.decreeN = 0; e.decreeTick = 0; SFX.callerBlast(); shakeCam(5);
        if (enemies.filter(en => en.alive && en.royal).length < 3) { const n0 = enemies.length; spawnEnt({ t: 'shield', x: A.wallL + 2, y: Math.floor(hall / TS) - 1, face: 1 }); for (let i = n0; i < enemies.length; i++) enemies[i].royal = true; SFX.clank(); } } break;
    case 'decree': want = 0; e.decreeTick -= dt; if (e.decreeTick <= 0 && e.decreeN < 3) { e.decreeTick = 0.45; e.decreeN++; for (const dd of [-1, 1]) waves.push({ x: e.x + dd * 24, y: hall, dir: dd, life: 1.8, sp: 185, royal: true }); SFX.forgeHammer(); shakeCam(4); dust(e.x, e.y, 8); }
      if (e.modeT <= 0) { e.mode = 'rec'; e.modeT = 0.9; } break;
    // THE SCEPTRE: thrown the length of the hall, low along the floor going out (jump it), at head height coming back
    // (stay down). While it is out of her hand she has nothing to fight with.
    case 'sceptreTell': want = 0; e.face = Math.sign(d) || e.face; if (e.modeT <= 0) { e.mode = 'sceptreWait'; e.modeT = 3; sceptres.push({ x: e.x + e.face * 22, y: hall - 9, dir: e.face, back: false, t: 0, owner: e, hit: false }); SFX.throwWhoosh(); } break;
    case 'sceptreWait': want = 0; if (!sceptres.some(s => s.owner === e) || e.modeT <= 0) { e.mode = 'stand'; e.modeT = 0.4; } break;
    case 'slamTell': e.face = Math.sign(d) || e.face; if (e.modeT <= 0) { e.mode = 'slam'; e.modeT = 0.25; SFX.forgeHammer(); shakeCam(9); zoomKick(1.08, 0.2); dust(e.x + e.face * 26, e.y, 14);
      const fl = e.phase === 3 ? roof : hall; for (const dd of [-1, 1]) waves.push({ x: e.x + dd * 26, y: fl, dir: dd, life: 1.3, sp: 170 });
      if (!P.dead && ad < 40 && Math.abs(P.y - e.y) < 30) damagePlayer(e.x, DMG.gqSlam, { up: true, unblockable: true }); } break;
    case 'slam': if (e.modeT <= 0) { e.mode = 'slamRec'; e.modeT = 0.9; } break;
    case 'sweepTell': e.face = Math.sign(d) || e.face; if (e.modeT <= 0) { e.mode = 'sweep'; e.modeT = 0.25; SFX.slash(); shakeCam(3); if (!P.dead && P.ground && ad < 60 && Math.abs(P.y - e.y) < 22) { const res = damagePlayer(e.x, DMG.gqSweep, { unblockable: true }); if (res === 'hit') { P.vx = Math.sign(d || 1) * 240; P.vy = -120; } } } break;
    case 'sweep': if (e.modeT <= 0) { e.mode = 'rec'; e.modeT = 0.5; } break;
    case 'chargeTell': if (e.modeT <= 0) { e.mode = 'charge'; e.modeT = 2.6; e.vx = e.face * 240; SFX.charge(); } break;
    case 'charge': { want = e.face * 240; if (Math.random() < dt * 20) dust(e.x - e.face * 12, e.y, 2);
      if (!P.dead && e.hitT <= 0 && ad < 24 && Math.abs(P.y - e.y) < 34) { e.hitT = 0.8; const res = damagePlayer(e.x, DMG.gqCharge, { unblockable: true, up: true }); if (res === 'hit') { P.vx = e.face * 320; P.vy = -170; } }
      const edge = e.face > 0 ? e.x > A.x1 - 40 : e.x < A.x0 + 40;
      if (edge || e.modeT <= 0) { e.mode = 'dazed'; e.modeT = 2.2; e.vx = 0; SFX.heavy(); SFX.stone(); shakeCam(8); zoomKick(1.1, 0.3); dust(e.x + e.face * 16, e.y, 12); } break; }
    case 'slamRec': case 'rec': case 'dazed': want = 0; if (e.mode === 'dazed' && Math.random() < dt * 8) parts.push({ x: e.x + (Math.random() - 0.5) * 24, y: e.y - 60, vx: 0, vy: -20, life: 0.5, max: 0.5, col: '#ffd36b', size: 2, grav: 0 });
      if (e.modeT <= 0) { e.mode = e.phase === 3 ? 'roof' : 'stand'; e.modeT = 0.5; } break;
    // ---- phase three: the roof ----
    case 'ceilTell': want = 0; if (e.modeT <= 0) { e.mode = 'ceil'; e.modeT = 3; gqCeiling(e); } break;
    case 'ceil': { const hx = (A.hole.x0 + A.hole.x1 + 1) * TS / 2; e.x += (hx - e.x) * Math.min(1, dt * 5); e.y -= 360 * dt;
      if (e.y <= roof - 40) { e.x = hx + 48; e.y = roof; e.vy = 0; e.vx = 0; e.mode = 'roofWait'; e.modeT = 0.5; shakeCam(6); SFX.heavy(); for (const dx of [-7, 7]) spawnEnt({ t: 'harpy', x: Math.floor(hx / TS) + dx, y: Math.floor(roof / TS) - 7 }); SFX.screech(); } break; } // her harpies come down out of the storm with her
    case 'roofWait': want = 0; e.face = Math.sign(d) || e.face; if (!P.dead && P.y <= roof + 2 && P.ground) { e.mode = 'roof'; e.modeT = 1; SFX.bellow(); } break;
    case 'roof': { e.face = Math.sign(d) || e.face; want = ad > 60 ? e.face * 34 : 0; e.slateT -= dt; e.leapT -= dt;
      if (e.modeT <= 0 && !P.dead) {
        if (e.slateT <= 0 && ad > 50) { e.slateT = 2.2; e.mode = 'slateTell'; e.modeT = 0.45; }
        else if (e.leapT <= 0) { e.leapT = 2.4; const rods = props.filter(p => p.t === 'rod'), nearP = rods.sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
          // she goes up on the peak nearest you to throw from it - which is the whole idea
          if (nearP && Math.abs(nearP.x - P.x) < 110 && Math.random() < 0.65 && Math.abs(nearP.x - e.x) > 20) { e.tx = nearP.x; e.ty = nearP.y; } else { e.tx = Math.max(A.x0 + 30, Math.min(A.x1 - 30, P.x)); e.ty = roof; }
          e.mode = 'leapTell'; e.modeT = 0.5; }
        else if (ad < 50 && e.slamT <= 0) { e.slamT = 3.2; e.mode = 'slamTell'; e.modeT = 0.6; SFX.charge(); }
      } e.slamT -= dt; break; }
    case 'slateTell': e.face = Math.sign(d) || e.face; if (e.modeT <= 0) { e.mode = 'slate'; e.modeT = 0.4; SFX.throwWhoosh(); for (let k = 0; k < 3; k++) { const tx = P.x + (k - 1) * 22, tt = 0.8; seeds.push({ x: e.x, y: e.y - 50, vx: (tx - e.x) / tt, vy: -140 + (P.y - e.y) / tt, dead: false, life: 3, g: 480, slate: true }); } } break;
    case 'slate': if (e.modeT <= 0) { e.mode = 'roof'; e.modeT = 0.5; } break;
    case 'leapTell': e.face = Math.sign(e.tx - e.x) || e.face; if (e.modeT <= 0) { const T0 = 0.75; e.vx = (e.tx - e.x) / T0; e.vy = (e.ty - e.y) / T0 - 0.5 * 1000 * T0; e.mode = 'leap'; e.modeT = 1.6; e.airT = 0; SFX.leap(); } break;
    case 'leap': e.airT += dt; if ((e.onGround && e.airT > 0.15) || e.modeT <= 0) { e.mode = 'land'; e.modeT = 0.45; e.vx = 0; SFX.heavy(); shakeCam(5); dust(e.x, e.y, 10); if (!P.dead && ad < 36 && Math.abs(P.y - e.y) < 30) damagePlayer(e.x, DMG.gqSlam, { up: true, unblockable: true }); } break;
    case 'land': want = 0; if (e.modeT <= 0) { e.mode = 'roof'; e.modeT = 0.4; } break;
    case 'struck': want = 0; if (Math.random() < dt * 20) parts.push({ x: e.x + (Math.random() - 0.5) * 24, y: e.y - 40 - Math.random() * 20, vx: 0, vy: -30, life: 0.3, max: 0.3, col: '#dfe8ff', size: 1, grav: 0 }); if (e.modeT <= 0) { e.mode = 'roof'; e.modeT = 0.6; } break;
  }
  if (!physics) return;
  if (e.mode !== 'charge' && e.mode !== 'leap') e.vx += (want - e.vx) * Math.min(1, dt * 5);
  e.vy += 1000 * dt; if (e.vy > 380) e.vy = 380;
  const r = moveBody(e, e.vx * dt, e.vy * dt, false); e.onGround = r.ground; if (r.ground) e.vy = 0;
  if (r.hitX && e.mode === 'charge') { e.mode = 'dazed'; e.modeT = 2.2; e.vx = 0; SFX.heavy(); shakeCam(8); }
  e.x = Math.max(A.x0 + 18, Math.min(A.x1 - 18, e.x));
}
const rocOpen = e => e.mode === 'stuck' || e.mode === 'skid' || e.mode === 'downed';
function updateRoc(e, dt) {
  const A = L.arena, floor = A.floor;
  e.modeT -= dt; e.anim += dt; e.hitT = Math.max(0, e.hitT - dt);
  if (e.phase === 1 && e.hp <= e.maxHp / 2) { e.phase = 2; e.mode = 'shedTell'; e.modeT = 0.8; e.featherT = 0; SFX.queenShriek(); shakeCam(6); zoomKick(1.1, 0.3); }
  const d = P.x - e.x, ad = Math.abs(d), p2 = e.phase === 2;
  const hoverY = floor - 5.5 * TS + Math.sin(e.anim * 2.2) * 6;
  const fly = (tx, ty, sp) => { const want = Math.sign(tx - e.x) * Math.min(sp, Math.abs(tx - e.x) * 2.5); e.vx += (want - e.vx) * Math.min(1, dt * 3); e.vy += (Math.max(-sp, Math.min(sp, (ty - e.y) * 3)) - e.vy) * Math.min(1, dt * 3); };
  const feather = (x, y, vx, vy, g) => seeds.push({ x, y, vx, vy, dead: false, life: 3, sunshard: true, g, rocFeather: true });
  switch (e.mode) {
    case 'sleep': return;
    case 'wake': fly(e.x, hoverY, 70); if (e.modeT <= 0) { e.mode = 'hover'; e.modeT = 1.2; } break;
    case 'hover': {
      e.face = Math.sign(d) || e.face; e.diveT -= dt; e.gustT -= dt; e.featherT -= dt;
      // she keeps station high off your shoulder, and changes shoulders: never straight overhead, never far
      if ((e.sideT = (e.sideT === undefined ? 3 : e.sideT) - dt) <= 0) { e.sideT = 2.2 + Math.random() * 2; e.side = -(e.side || 1); }
      fly(Math.max(A.x0 + 48, Math.min(A.x1 - 48, P.x + (e.side || 1) * 76)), hoverY, p2 ? 130 : 95);
      if (e.modeT > 0) break;
      if (e.diveT <= 0) { e.diveT = p2 ? 3.1 : 4.2; e.mode = 'diveTell'; e.modeT = 0.85; e.tx = Math.max(A.x0 + 30, Math.min(A.x1 - 30, P.x + P.vx * 0.25)); SFX.queenShriek(); }
      else if (e.gustT <= 0 && ad < 170) { e.gustT = p2 ? 6.5 : 8.5; e.mode = 'gustTell'; e.modeT = 0.6; SFX.puff(); }
      else if (p2 && e.featherT <= 0) { e.featherT = 3.8; e.mode = 'shedTell'; e.modeT = 0.55; }
      break; }
    // the shadow goes down where she means to land, and she goes up a little before she drops
    case 'diveTell': fly(e.x, hoverY - 14, 50); e.face = Math.sign(e.tx - e.x) || e.face;
      if (e.modeT <= 0) { e.mode = 'dive'; e.modeT = 1.4; const dx = e.tx - e.x, dy = floor - e.y, tt = Math.max(0.3, Math.hypot(dx, dy) / 400); e.vx = dx / tt; e.vy = dy / tt; SFX.charge(); } break;
    case 'dive': {
      if (!P.dead && e.hitT <= 0 && Math.abs(P.x - e.x) < 18 && P.y > e.y - 30 && P.y < e.y + 8) { e.hitT = 0.8; const res = damagePlayer(e.x, DMG.rocDive, { up: true }); if (res === 'hit') { P.vx = (Math.sign(P.x - e.x) || 1) * 230; P.vy = -170; } }
      if (e.y >= floor - 1 || e.modeT <= 0) { e.y = floor; e.vy = 0; e.vx = 0;
        const tx = Math.floor(e.x / TS), ty = Math.floor(floor / TS);
        let glass = false; for (const dx of [-1, 0, 1]) { const i = ty * LW + tx + dx; if (L.grid[i] === T.CRYST) { glass = true; breakCrystal(i); } }
        shakeCam(glass ? 9 : 6); zoomKick(1.08, 0.2); SFX.heavy(); dust(e.x - 10, floor, 8); dust(e.x + 10, floor, 8);
        if (!P.dead && P.ground && Math.abs(P.x - e.x) < 34 && e.hitT <= 0) { e.hitT = 0.6; damagePlayer(e.x, Math.round(DMG.rocDive * 0.6), { up: true, unblockable: true }); }
        // onto glass her talons go through it up to the ankle: she is stuck, and she is yours
        if (glass) { e.mode = 'stuck'; e.modeT = p2 ? 2.2 : 2.8; SFX.crack(); } else { e.mode = 'skid'; e.modeT = p2 ? 0.8 : 1.1; } }
      break; }
    case 'stuck': case 'skid': e.vx = 0; e.vy = 0; e.y = floor; if (e.modeT <= 0) { e.mode = 'rise'; e.modeT = 0.6; SFX.puff(); } break;
    case 'downed': // knocked out of the sky: she comes down hard and lies there
      e.vy = Math.min(e.vy + 900 * dt, 340); e.vx *= Math.pow(0.1, dt);
      if (e.y >= floor) { e.y = floor; if (e.vy > 60) { shakeCam(7); SFX.heavy(); dust(e.x, floor, 10); } e.vy = 0; }
      if (e.modeT <= 0) { e.mode = 'rise'; e.modeT = 0.7; SFX.queenShriek(); } break;
    case 'rise': fly(e.x, hoverY, 110); if (e.modeT <= 0) { e.mode = 'hover'; e.modeT = 0.5; } break;
    // the gale: she backs off and beats her wings at you. Walk into it or it walks you onto the thorns.
    case 'gustTell': fly(e.x - (Math.sign(d) || 1) * 40, hoverY, 80); e.face = Math.sign(d) || e.face; if (e.modeT <= 0) { e.mode = 'gust'; e.modeT = p2 ? 2.6 : 2.2; } break;
    case 'gust': {
      fly(e.x, hoverY, 40); const dir = Math.sign(P.x - e.x) || 1; e.face = dir;
      if (!P.dead && Math.abs(P.y - e.y) < 90) { P.vx += dir * (P.ground ? 190 : 250) * dt; if (Math.random() < dt * 40) parts.push({ x: e.x + dir * 20, y: e.y - 20 + (Math.random() - 0.5) * 50, vx: dir * 260, vy: 0, life: 0.5, max: 0.5, col: '#eefaff', size: 1, grav: 0 }); }
      if (Math.random() < dt * (p2 ? 3.5 : 2.2)) feather(e.x + dir * 16, e.y - 18 + (Math.random() - 0.5) * 20, dir * 170, -10, 80); // glass rides the gale
      if (e.modeT <= 0) { e.mode = 'hover'; e.modeT = 0.8; } break; }
    // hurt, she sheds: a fan of glass feathers comes down around you
    case 'shedTell': fly(e.x, hoverY - 8, 60); if (e.modeT <= 0) { e.mode = 'shed'; e.modeT = 0.4; SFX.golemThrow();
      for (let k = 0; k < 5; k++) { const tx = P.x + (k - 2) * 26 + (Math.random() - 0.5) * 8, tt = 0.9; feather(e.x, e.y - 16, (tx - e.x) / tt, -80, 480); } } break;
    case 'shed': if (e.modeT <= 0) { e.mode = 'hover'; e.modeT = 0.6; } break;
  }
  if (e.mode !== 'stuck' && e.mode !== 'skid') { e.x += e.vx * dt; e.y += e.vy * dt; }
  e.x = Math.max(A.x0 + 20, Math.min(A.x1 - 20, e.x)); e.y = Math.min(e.y, floor);
}
function updateSuncatcher(e, dt) {
  const A = L.arena, floor = A.floor;
  e.modeT -= dt; e.anim += dt; e.hitT = Math.max(0, e.hitT - dt);
  const d = P.x - e.x, ad = Math.abs(d), p2 = e.hp <= e.maxHp / 2;
  e.face = Math.sign(d) || e.face;
  switch (e.mode) {
    case 'sleep': return;
    case 'wake': if (e.modeT <= 0) { e.mode = 'still'; e.modeT = 1; } break;
    case 'still': {
      e.drinkT -= dt; e.throwT -= dt; e.spireT -= dt;
      // it drifts along the crown. It is not chasing you - it is passing under its own canopy, which is
      // the only reason you can ever put a piece of that canopy on its head.
      if (e.driftT === undefined || (e.driftT -= dt) <= 0) { e.driftT = 3 + Math.random() * 2; e.driftTo = A.x0 + 40 + Math.random() * (A.x1 - A.x0 - 80); }
      e.vx += (Math.sign((e.driftTo || e.x) - e.x) * 26 - e.vx) * Math.min(1, dt * 2);
      if (e.spireT <= 0) { e.spireT = p2 ? 4 : 6; e.mode = 'raise'; e.modeT = 0.7; number(e.x, e.y - 40, 'IT RAISES ONE', '#bfe6f5'); SFX.golemChime(); }
      else if (e.throwT <= 0) { e.throwT = p2 ? 2.2 : 3.4; e.mode = 'throwTell'; e.modeT = 0.5; number(e.x, e.y - 40, '!', '#ffd36b'); }
      else if (e.drinkT <= 0) { e.drinkT = p2 ? 7 : 9; e.mode = 'drink'; e.modeT = 2.2; number(e.x, e.y - 44, 'IT TAKES THE SUN: GET OFF THE GLASS', '#ffe6a0'); SFX.charge(); }
      break; }
    // it raises a spire out of the ground beside you. Break it while it stands over him.
    case 'raise': if (e.modeT <= 0) { e.mode = 'still'; e.modeT = 0.6;
      const sx = Math.max(A.x0 / TS + 3, Math.min(A.x1 / TS - 3, Math.round((P.x + P.vx * 0.3) / TS)));
      const ty = Math.floor(floor / TS) - 1;
      for (let k = 0; k < 3; k++) { const i = (ty - k) * LW + sx; if (L.grid[i] === T.AIR) { L.grid[i] = T.CRYST; grid0[i] = T.CRYST; crackAt[i] = 0; crystT[i] = 0; tileSpr[i] = null; } }
      resolveTiles(); shakeCam(4); SFX.stone(); burst(sx * TS + 8, floor - 8, 12, ['#bfe6f5', '#eefaff'], 70, 0.6);
      number(sx * TS + 8, floor - 60, 'BREAK IT OVER HIM', '#8fd160'); } break;
    case 'throwTell': if (e.modeT <= 0) { e.mode = 'throw'; e.modeT = 0.4; SFX.golemThrow();
      const n = p2 ? 4 : 3;
      for (let k = 0; k < n; k++) { const tx = P.x + (k - (n - 1) / 2) * 30, tt = 0.85;
        seeds.push({ x: e.x, y: e.y - 26, vx: (tx - e.x) / tt, vy: -60, dead: false, life: 3, sunshard: true, g: 560 }); } } break;
    case 'throw': if (e.modeT <= 0) { e.mode = 'still'; e.modeT = 0.5; } break;
    // it drinks: every crystal in the arena crazes at once, and the glare sweeps the floor
    case 'drink': {
      if (Math.random() < dt * 40) parts.push({ x: e.x + (Math.random() - 0.5) * 44, y: e.y - 60 + Math.random() * 40, vx: 0, vy: 60, life: 0.5, max: 0.5, col: '#ffe6a0', size: 2, grav: 0 });
      e.glareT = (e.glareT || 0) - dt;
      if (e.glareT <= 0) { e.glareT = 0.5;
        for (let ty = Math.floor(A.y0 !== undefined ? A.y0 / TS : 0); ty < LH; ty++) {}
        // craze the crystal underfoot wherever you are standing
        const ti = Math.floor((P.y + 1) / TS) * LW + Math.floor(P.x / TS);
        if (L.grid[ti] === T.CRYST) crackCrystal(ti, 1);
        if (!P.dead && P.ground && P.groundTile === T.CRYST) { damagePlayer(P.x, DMG.sunGlare, { unblockable: true }); number(P.x, P.y - 26, 'THE GLASS BURNS', '#ffe6a0'); }
      }
      if (e.modeT <= 0) { e.mode = 'still'; e.modeT = 0.8; }
      break; }
    case 'dim': if (e.modeT <= 0) { e.mode = 'still'; e.modeT = 0.6; e.dimmed = 0; } break;
  }
  if (e.mode !== 'drink') { e.x += (e.vx || 0) * dt; e.x = Math.max(A.x0 + 24, Math.min(A.x1 - 24, e.x)); } else e.vx = 0;
  if (!P.dead && e.hitT <= 0 && ad < 22 && Math.abs(P.y - e.y) < 30) { e.hitT = 1; damagePlayer(e.x, DMG.sunShard); }
}
const sunOpen = e => e.mode === 'dim' || e.mode === 'drink';

// THE HEARTH GOBLIN - it is not a soldier, it lives here. It sleeps by the fire until you are close
// and then it comes at you with a stool, which is worse than it sounds in a room you cannot back out of.
function updateHearthGob(e, dt) {
  e.modeT -= dt; e.swingT -= dt; e.vy += 1000 * dt; if (e.vy > 320) e.vy = 320;
  const d = P.x - e.x, ad = Math.abs(d); let want = 0;
  if (e.mode === 'asleep') { if (!P.dead && ad < 62 && Math.abs(P.y - e.y) < 30) { e.mode = 'waking'; e.modeT = 0.55; number(e.x, e.y - 18, 'UP!', '#ffd36b'); SFX.gobHurt ? SFX.gobHurt() : SFX.snort(); } }
  else if (e.mode === 'waking') { if (e.modeT <= 0) e.mode = 'walk'; }
  else if (e.mode === 'raise') { e.face = Math.sign(d) || e.face; if (e.modeT <= 0) { e.mode = 'swing'; e.modeT = 0.3; SFX.slash();
    if (!P.dead && Math.sign(P.x - e.x) === e.face && ad < 24 && Math.abs(P.y - e.y) < 20) { const res = damagePlayer(e.x, DMG.hearthgob); if (res === 'blocked') { e.stagger = 0.9; number(e.x, e.y - 20, 'PARRIED', '#8fd160'); } } } }
  else if (e.mode === 'swing') { if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.35; } }
  else if (e.stagger > 0) want = 0;
  else { e.face = Math.sign(d) || e.face;
    if (ad < 20 && Math.abs(P.y - e.y) < 20 && e.swingT <= 0 && !P.dead) { e.swingT = 1.7; e.mode = 'raise'; e.modeT = 0.42; number(e.x, e.y - 20, '!', '#ffd36b'); }
    else want = ad < 180 && !P.dead ? e.face * e.speed : 0; }
  e.vx += (want - e.vx) * Math.min(1, dt * 8);
  const aheadX = e.x + Math.sign(e.vx || e.face) * (e.w / 2 + 2), ftx = Math.floor(aheadX / TS), fty = Math.floor((e.y + 1) / TS);
  const r = moveBody(e, e.vx * dt, e.vy * dt, false); if (r.ground) e.vy = 0;
  if (r.ground && tileAt(ftx, fty) === T.AIR) { e.vx = 0; e.face = -e.face; }
  if (r.hitX) { e.vx = 0; e.face = -e.face; }
}

// THE ROPE CUTTER - he wants the rope, not you. Ignoring him costs you the bridge.
function updateCutter(e, dt) {
  e.modeT -= dt; e.chopT -= dt; e.vy += 1000 * dt; if (e.vy > 320) e.vy = 320;
  const br = (L.bridges || []).find(b => b.x === e.bridge);
  const d = P.x - e.x, ad = Math.abs(d); let want = 0;
  if (br && !br.cut) {
    if (e.mode === 'raise') { if (e.modeT <= 0) { e.mode = 'chop'; e.modeT = 0.32; SFX.crack(); SFX.clank();
      br.frayed = (br.frayed || 0) + 1; shakeCam(2);
      if (br.frayed >= 3) { br.cut = true; cutBridges.add(br.x); dropBridge(br); number(e.x, e.y - 26, 'IT GOES', '#ff6b6b'); SFX.heavy(); shakeCam(6); }
      else number(e.x, e.y - 26, (3 - br.frayed) + ' MORE AND IT GOES', '#ff9a5c'); } }
    else if (e.mode === 'chop') { if (e.modeT <= 0) e.mode = 'work'; }
    else if (e.stagger > 0) want = 0;
    else if (e.chopT <= 0) { e.mode = 'raise'; e.modeT = 0.5; e.chopT = 2.2; e.face = br.x < e.x ? -1 : 1; number(e.x, e.y - 26, '!', '#ff9a5c'); }
    else if (!P.dead && ad < 26 && Math.abs(P.y - e.y) < 20) { const res = damagePlayer(e.x, DMG.cutter); if (res === 'blocked') e.stagger = 0.8; }
  } else { // the rope is gone: now he remembers you
    e.face = Math.sign(d) || e.face; e.mode = 'work';
    want = ad < 190 && !P.dead ? e.face * e.speed : 0;
    if (!P.dead && ad < 20 && Math.abs(P.y - e.y) < 20 && e.chopT <= 0) { e.chopT = 1.6; damagePlayer(e.x, DMG.cutter); }
  }
  e.vx += (want - e.vx) * Math.min(1, dt * 8);
  const r = moveBody(e, e.vx * dt, e.vy * dt, false); if (r.ground) e.vy = 0;
  if (r.hitX) e.vx = 0;
}

// A span goes: its planks come out and whatever was standing on them comes with them.
function dropBridge(br) {
  for (let x = br.x; x <= br.x1; x++) { const i = br.y * LW + x; if (L.grid[i] !== T.AIR) { L.grid[i] = T.AIR; tileSpr[i] = null; destroyed.add(i);
    for (let k = 0; k < 2; k++) parts.push({ x: x * TS + 8, y: br.y * TS + 8, vx: (Math.random() - 0.5) * 60, vy: 20 + Math.random() * 40, life: 1.2, max: 1.2, col: k ? '#8a5a32' : '#c9b27c', size: 2, grav: 420 }); } }
  resolveTiles(); SFX.crack();
}
// A span the goblins cut is hauled back up once nobody is standing in the gap, and the planks the
// Lance runs out from under himself are relaid behind him. Both used to stay broken until you left
// the level: one cut span, or one charge beside the checkpoint pier, and the level could not be finished.
let mending = []; // { i, t }: tiles the world broke that come back
function mendTile(i) { if (L.grid[i] === T.AIR && grid0[i] !== T.AIR) { L.grid[i] = grid0[i]; tileSpr[i] = null; destroyed.delete(i); return true; } return false; }
function mendSpan(br) { let any = false; for (let x = br.x; x <= br.x1; x++) any = mendTile(br.y * LW + x) || any; br.cut = false; br.frayed = 0; br.downT = 0; cutBridges.delete(br.x); if (any) resolveTiles(); return any; }
function mendAll() { for (const br of (L.bridges || [])) if (br.cut || br.frayed) mendSpan(br); for (const m of mending) mendTile(m.i); mending = []; resolveTiles(); }
function updateSpans(dt) {
  for (const br of (L.bridges || [])) if (br.cut) { br.downT = (br.downT || 0) + dt;
    const over = P.x > br.x * TS - 8 && P.x < (br.x1 + 1) * TS + 8 && P.y > br.y * TS - 40;
    if (br.downT > 8 && !over && mendSpan(br)) { SFX.clank(); for (let x = br.x; x <= br.x1; x += 2) parts.push({ x: x * TS + 8, y: br.y * TS + 30, vx: 0, vy: -60, life: 0.5, max: 0.5, col: '#c9b27c', size: 2, grav: 0 }); } }
  let any = false;
  for (const m of mending) { m.t -= dt; if (m.t > 0) continue;
    const tx = m.i % LW, ty = Math.floor(m.i / LW), cx = tx * TS + 8;
    const clear = (Math.abs(P.x - cx) > 14 || Math.abs(P.y - ty * TS) > 20) && !enemies.some(e => e.alive && Math.abs(e.x - cx) < e.w / 2 + 8 && Math.abs(e.y - ty * TS) < 30);
    if (!clear) { m.t = 0.4; continue; }
    if (mendTile(m.i)) { any = true; burst(cx, ty * TS + 6, 4, ['#c9b27c', '#8a5a32'], 30, 0.4); }
    m.done = true; }
  if (any) resolveTiles();
  if (mending.length) mending = mending.filter(m => !m.done);
}

// THE QUEEN'S LANCE - he holds the castle bridge, and the bridge is the fight. He cannot steer a
// charge: step off his line and the lance goes into a post and so does he. Half dead he throws it
// away and becomes the opposite problem, close and guarded.
function updateLance(e, dt) {
  const A = L.arena, floor = A.floor;
  e.modeT -= dt; e.anim += dt; e.hitT = Math.max(0, e.hitT - dt);
  e.vy += 1000 * dt; if (e.vy > 340) e.vy = 340;
  const d = P.x - e.x, ad = Math.abs(d), p2 = e.phase === 2;
  let want = 0;
  const reach = (dist, dmg, opt) => { if (!P.dead && Math.sign(P.x - e.x) === e.face && ad < dist && Math.abs(P.y - e.y) < 30) { const res = damagePlayer(e.x, dmg, opt); if (res === 'blocked' && !opt) { e.mode = 'reel'; e.modeT = 1.0; e.vx = -e.face * 60; number(e.x, e.y - e.h - 12, 'PARRIED', '#8fd160'); SFX.clank(); } return res || 'hit'; } return null; };
  switch (e.mode) {
    case 'sleep': return;
    case 'wake': if (e.modeT <= 0) { e.mode = 'pace'; e.modeT = 1.2; } break;
    // a thrust or a rush turned on your shield puts him off his feet, and his plate is no use to him there
    case 'reel': if (e.modeT <= 0) { e.mode = p2 ? 'guard' : 'pace'; e.modeT = 0.5; } break;
    // ---- phase one: the lance ----
    case 'pace': {
      e.face = Math.sign(d) || e.face; e.chargeT -= dt; e.thrustT -= dt; e.sweepT -= dt;
      e.bashT = (e.bashT ?? 1.5) - dt; e.vaultT = (e.vaultT ?? 4) - dt; e.javT = (e.javT ?? 3) - dt;
      want = ad > 40 ? e.face * 52 : 0;
      // up close he mixes a low sweep (jump it) with a shield bash (roll away from it): you cannot answer both the same way
      if (ad < 34 && e.sweepT <= 0 && !e.lastBash) { e.sweepT = 3.5; e.lastBash = true; e.mode = 'sweepTell'; e.modeT = 0.45; number(e.x, e.y - e.h - 12, 'LOW', '#ffd36b'); SFX.snort(); }
      else if (ad < 34 && e.bashT <= 0) { e.bashT = 4.5; e.lastBash = false; e.mode = 'bashTell'; e.modeT = 0.42; number(e.x, e.y - e.h - 12, '!', '#ff6b6b'); SFX.snort(); }
      else if (ad < 96 && ad > 30 && e.thrustT <= 0) { e.thrustT = 3.2; e.mode = 'thrustTell'; e.modeT = 0.5; number(e.x, e.y - e.h - 12, '!', '#ffd36b'); SFX.snort(); }
      // a stride or two off: he plants the lance and goes up it, and comes down on you point first
      else if (ad > 60 && ad < 150 && e.vaultT <= 0) { e.vaultT = 9; e.mode = 'vaultTell'; e.modeT = 0.6; number(e.x, e.y - e.h - 14, 'HE GOES UP', '#ff6b6b'); SFX.snort(); }
      // keep your distance and he throws: three javelins, and then his hands are empty for a moment
      else if (ad > 150 && e.javT <= 0) { e.javT = 6; e.mode = 'javTell'; e.modeT = 0.6; SFX.snort(); }
      else if (ad > 70 && e.chargeT <= 0) { e.chargeT = p2 ? 5 : 6.5; e.mode = 'couch'; e.modeT = 0.8; number(e.x, e.y - e.h - 14, 'HE LEVELS IT', '#ff6b6b'); SFX.bellow(); shakeCam(2); }
      break; }
    case 'couch': e.face = Math.sign(d) || e.face; if (e.modeT <= 0) { e.mode = 'charge'; e.modeT = 3.2; e.vx = e.face * 250; e.passT = -1; SFX.charge(); shakeCam(3); } break;
    case 'charge': {
      want = e.face * 250;
      if (!P.dead && e.hitT <= 0 && ad < 26 && Math.abs(P.y - e.y) < 32) { e.hitT = 0.8; const res = damagePlayer(e.x, DMG.lanceCharge, { unblockable: true, up: true }); if (res === 'hit') { P.vx = e.face * 340; P.vy = -170;
        e.mode = 'pace'; e.modeT = 0.9; e.vx = e.face * 60; break; } } // it went through you: he pulls up, and that is not an opening
      // once he is past you he has nowhere to aim, and the lance goes into the deck a few strides on
      if (e.passT < 0 && (P.x - e.x) * e.face < -6) e.passT = 0.18; else if (e.passT > 0) e.passT -= dt;
      // (the deck stays whole now: a fight on a bridge that comes apart under you was a fight with the bridge)
      if (Math.random() < dt * 26) dust(e.x - e.face * 12, e.y, 3);
      const edge = e.face > 0 ? e.x > A.x1 - 26 : e.x < A.x0 + 26;
      if (edge || e.modeT <= 0 || (e.passT !== -1 && e.passT <= 0)) { e.mode = 'planted'; e.modeT = p2 ? 1.5 : 2.2; e.stagger = e.modeT; e.vx = 0;
        number(e.x, e.y - e.h - 14, 'THE LANCE STICKS: CUT HIM', '#8fd160'); SFX.heavy(); SFX.stone(); shakeCam(7); zoomKick(1.1, 0.3); dust(e.x + e.face * 18, e.y, 12); }
      break; }
    case 'planted': if (e.modeT <= 0) { e.mode = 'pace'; e.modeT = 0.8; e.stagger = 0; } break;
    case 'thrustTell': e.face = Math.sign(d) || e.face; if (e.modeT <= 0) { e.mode = 'thrust'; e.modeT = 0.34; SFX.slash(); e.whiff = !reach(96, DMG.lanceThrust); } break;
    case 'thrust': if (e.modeT <= 0) { if (e.whiff) { e.mode = 'recover'; e.modeT = 0.55; } else { e.mode = 'pace'; e.modeT = 0.5; } } break;
    // a swing that finds nothing leaves him over his front foot: that is the answer for anyone who will not stand and block
    case 'recover': if (e.modeT <= 0) { e.mode = p2 ? 'guard' : 'pace'; e.modeT = 0.4; } break;
    case 'sweepTell': e.face = Math.sign(d) || e.face; if (e.modeT <= 0) { e.mode = 'sweep'; e.modeT = 0.3; SFX.slash(); shakeCam(3);
      if (!P.dead && ad < 52 && Math.abs(P.y - e.y) < 18 && P.ground) { const res = damagePlayer(e.x, DMG.lanceSweep, { unblockable: true }); if (res === 'hit') { P.vx = Math.sign(d) * 260; P.vy = -120; } } } break;
    case 'sweep': if (e.modeT <= 0) { e.mode = 'pace'; e.modeT = 0.6; } break;
    // THE BASH: the shield comes round and puts you on your back. Blocking does not stop a shield: get out from in front of it.
    case 'bashTell': e.face = Math.sign(d) || e.face; want = -e.face * 16; if (e.modeT <= 0) { e.mode = 'bash'; e.modeT = 0.26; e.vx = e.face * 140; SFX.clank(); SFX.heavy(); shakeCam(3);
      const hit = !P.dead && Math.sign(P.x - e.x) === e.face && ad < 40 && Math.abs(P.y - e.y) < 26; if (hit) { const res = damagePlayer(e.x, DMG.lanceBash, { unblockable: true }); if (res === 'hit') { P.vx = e.face * 330; P.vy = -150; } } e.whiff = !hit; } break;
    case 'bash': want = 0; if (e.modeT <= 0) { e.mode = e.whiff ? 'recover' : (p2 ? 'guard' : 'pace'); e.modeT = e.whiff ? 0.6 : 0.5; } break;
    // THE VAULT: up on the lance, over, and down point first; the landing throws a wave down the deck each way,
    // and the point goes into the boards and holds him there
    case 'vaultTell': e.face = Math.sign(d) || e.face; want = 0; if (e.modeT <= 0) { e.mode = 'vault'; e.airT = 0; e.tx = P.x; e.vx = Math.max(-270, Math.min(270, (P.x - e.x) / 0.8)); e.vy = -440; SFX.leap(); dust(e.x, e.y, 8); } break;
    case 'vault': e.airT += dt; break;
    // THE JAVELINS: three, in a fan, where you are and a stride either side
    case 'javTell': e.face = Math.sign(d) || e.face; want = 0; if (e.modeT <= 0) { e.mode = 'javThrow'; e.modeT = 1.0; SFX.throwWhoosh();
      for (let k = -1; k <= 1; k++) { const sx = e.x + e.face * 10, sy = e.y - 30, Tf = 0.85 + k * 0.08, G = 420, tx = P.x + k * 30, ty2 = P.y - 6; seeds.push({ x: sx, y: sy, vx: (tx - sx) / Tf, vy: (ty2 - sy) / Tf - 0.5 * G * Tf, g: G, dead: false, life: 3, arrow: true, jav: true }); } } break;
    case 'javThrow': want = 0; if (e.modeT <= 0) { e.mode = 'pace'; e.modeT = 0.5; } break;
    // ---- phase two: he throws it away ----
    case 'rise': if (e.modeT <= 0) { e.mode = 'guard'; e.modeT = 1; } break;
    case 'guard': {
      e.face = Math.sign(d) || e.face; e.sweepT -= dt; e.rushT = (e.rushT === undefined ? 2 : e.rushT) - dt;
      want = ad > 22 ? e.face * 78 : 0;
      e.bashT = (e.bashT ?? 1.5) - dt;
      if (ad < 30 && e.bashT <= 0 && e.sweepT > 0.6) { e.bashT = 3; e.mode = 'bashTell'; e.modeT = 0.36; number(e.x, e.y - e.h - 12, '!', '#ff6b6b'); }
      else if (ad < 30 && e.sweepT <= 0) { e.sweepT = 1.9; e.mode = 'guardTell'; e.modeT = 0.38; number(e.x, e.y - e.h - 12, '!', '#ffd36b'); }
      // back off him and he comes for you behind the shield: block it and he reels, jump it and he stumbles
      else if (ad > 44 && ad < 130 && e.rushT <= 0) { e.rushT = 3.4; e.mode = 'rushTell'; e.modeT = 0.5; SFX.snort(); }
      break; }
    case 'rushTell': e.face = Math.sign(d) || e.face; want = -e.face * 20; if (e.modeT <= 0) { e.mode = 'rush'; e.modeT = 0.55; e.vx = e.face * 230; e.hitT = 0; SFX.charge(); } break;
    case 'rush': {
      want = e.face * 230;
      if (!P.dead && e.hitT <= 0 && ad < 22 && Math.abs(P.y - e.y) < 24) { e.hitT = 1;
        const res = damagePlayer(e.x, DMG.lanceRush);
        if (res === 'blocked') { e.mode = 'reel'; e.modeT = 1.1; e.vx = -e.face * 90; number(e.x, e.y - e.h - 12, 'PARRIED', '#8fd160'); SFX.clank(); shakeCam(3); break; }
        if (res === 'hit') { P.vx = e.face * 280; P.vy = -150; } }
      if (e.modeT <= 0) { e.mode = e.hitT > 0 ? 'guard' : 'stumble'; e.modeT = e.hitT > 0 ? 0.5 : 0.8; e.vx = e.face * 40; if (e.mode === 'stumble') { SFX.heavy(); dust(e.x + e.face * 10, e.y, 6); } }
      break; }
    case 'stumble': if (e.modeT <= 0) { e.mode = 'guard'; e.modeT = 0.4; } break;
    case 'guardTell': e.face = Math.sign(d) || e.face; if (e.modeT <= 0) { e.mode = 'guardSwing'; e.modeT = 0.28; SFX.slash(); e.whiff = !reach(34, DMG.lanceGuard); } break;
    case 'guardSwing': if (e.modeT <= 0) { if (e.whiff) { e.mode = 'recover'; e.modeT = 0.55; } else { e.mode = 'guard'; e.modeT = 0.4; } } break;
  }
  if (e.mode !== 'charge' && e.mode !== 'rush' && e.mode !== 'vault') e.vx += (want - e.vx) * Math.min(1, dt * (e.mode === 'reel' || e.mode === 'stumble' ? 2 : 5));
  const r = moveBody(e, e.vx * dt, e.vy * dt, false); if (r.ground) e.vy = 0;
  e.x = Math.max(A.x0 + 18, Math.min(A.x1 - 18, e.x));
  if (e.mode === 'vault' && r.ground && e.airT > 0.2) { e.mode = 'planted'; e.modeT = p2 ? 1.1 : 1.5; e.stagger = e.modeT; e.vx = 0;
    SFX.heavy(); SFX.stone(); shakeCam(8); zoomKick(1.1, 0.3); dust(e.x, e.y, 14); for (const dd of [-1, 1]) waves.push({ x: e.x + dd * 14, y: floor, dir: dd, life: 1.2, sp: 175 });
    if (!P.dead && Math.abs(P.x - e.x) < 30 && Math.abs(P.y - e.y) < 30) damagePlayer(e.x, DMG.lanceVault, { up: true });
    number(e.x, e.y - e.h - 14, 'THE POINT STICKS: CUT HIM', '#8fd160'); }
  if (r.hitX && e.mode === 'rush') { e.mode = 'stumble'; e.modeT = 0.9; e.vx = 0; SFX.heavy(); shakeCam(4); }
  if (r.hitX && e.mode === 'charge') { e.mode = 'planted'; e.modeT = 2.2; e.stagger = 2.2; e.vx = 0; SFX.heavy(); shakeCam(7); }
}
const lanceOpen = e => e.mode === 'planted' || e.mode === 'thrust' || e.mode === 'sweep' || e.mode === 'guardSwing' || e.mode === 'reel' || e.mode === 'stumble' || e.mode === 'recover' || e.mode === 'javThrow';

// THE SNUFFER - it is not hunting you. It is putting the village out, one lamp at a time, and the Reeve likes that.
function updateSnuffer(e, dt) {
  e.modeT -= dt; e.swipeT -= dt; e.vy += 1000 * dt; if (e.vy > 320) e.vy = 320;
  const d = P.x - e.x, ad = Math.abs(d);
  let want = 0;
  // its target is the nearest lamp still burning on its own level
  if (!e.target || !e.target.lit || e.target.gone) {
    let best = null, bd = 1e9;
    for (const pr of props) if ((pr.t === 'lantern' || pr.t === 'minerlamp') && pr.lit && Math.abs(pr.y - e.y) < 40) { const q = Math.abs(pr.x - e.x); if (q < bd) { bd = q; best = pr; } }
    e.target = best;
  }
  if (e.mode === 'snuffTell') { if (e.modeT <= 0) { const pr = e.target; if (pr && pr.lit) { pr.lit = false; pr.hits = 0; burst(pr.x, pr.y - 10, 10, ['#3a3448', '#5a5468', '#8a919c'], 40, 0.8, -20, 2); number(pr.x, pr.y - 26, 'PUT OUT', '#9aa39a'); SFX.puff(); } e.target = null; e.mode = 'seek'; e.modeT = 0.6; } }
  else if (e.mode === 'swipe') { if (e.modeT <= 0) { e.mode = 'seek'; e.modeT = 0.3; } }
  else if (e.mode === 'swipeTell') { e.face = Math.sign(d) || e.face; if (e.modeT <= 0) { e.mode = 'swipe'; e.modeT = 0.3; SFX.slash(); if (!P.dead && Math.sign(P.x - e.x) === e.face && ad < 30 && Math.abs(P.y - e.y) < 20) { const res = damagePlayer(e.x, DMG.snuffer); if (res === 'blocked') { e.stagger = 0.8; number(e.x, e.y - e.h - 10, 'PARRIED', '#8fd160'); } } } }
  else if (e.stagger > 0) want = 0;
  else if (ad < 26 && Math.abs(P.y - e.y) < 22 && !P.dead && e.swipeT <= 0) { e.swipeT = 2.2; e.mode = 'swipeTell'; e.modeT = 0.35; number(e.x, e.y - e.h - 10, '!', '#ffd36b'); }
  else if (e.target) {
    const td = e.target.x - e.x; e.face = Math.sign(td) || e.face;
    if (Math.abs(td) < 13) { e.mode = 'snuffTell'; e.modeT = 0.85; number(e.x, e.y - e.h - 12, 'SNUFFING IT', '#9aa39a'); SFX.step(); }
    else want = e.face * e.speed;
  } else want = e.face * 18; // nothing left to put out: it patrols the dark it made
  e.vx += (want - e.vx) * Math.min(1, dt * 8);
  const aheadX = e.x + Math.sign(e.vx || e.face) * (e.w / 2 + 2), ftx = Math.floor(aheadX / TS), fty = Math.floor((e.y + 1) / TS);
  const r = moveBody(e, e.vx * dt, e.vy * dt, false); if (r.ground) e.vy = 0;
  // it will not walk off a bough for a lamp: the edge makes it give that one up
  if (r.ground && tileAt(ftx, fty) === T.AIR) { e.vx = 0; e.target = null; e.face = -e.face; }
  if (r.hitX) { e.vx = 0; e.target = null; e.face = -e.face; }
}

// THE SAILER - a goblin behind a plank of sail. Planted it is nothing. In a gust it is a battering ram, and the wall stops it, not you.
function updateSailer(e, dt) {
  e.modeT -= dt; e.hitT = Math.max(0, (e.hitT || 0) - dt); e.vy += 1000 * dt; if (e.vy > 320) e.vy = 320;
  const wind = windAt(e.x, e.y - 6), d = P.x - e.x, ad = Math.abs(d);
  const push = e.big ? 260 : 200;
  if (e.mode === 'tumble') { e.vx += (0 - e.vx) * Math.min(1, dt * 4); if (e.modeT <= 0) { e.mode = 'plant'; e.modeT = 0.4; } }
  else if (wind && e.stagger <= 0) {
    if (e.mode !== 'sail') { e.mode = 'sail'; SFX.puff(); number(e.x, e.y - e.h - 10, 'SHE FILLS', '#dfe8c0'); }
    e.face = wind; e.vx += (wind * push - e.vx) * Math.min(1, dt * 3);
    if (Math.random() < dt * 24) parts.push({ x: e.x - wind * 8, y: e.y - 4 - Math.random() * 12, vx: -wind * 60, vy: 0, life: 0.3, max: 0.3, col: '#dfe8c0', size: 1, grav: 0 });
    if (!P.dead && e.hitT <= 0 && ad < (e.big ? 20 : 14) && Math.abs(P.y - e.y) < (e.big ? 26 : 18)) {
      e.hitT = 0.7; const res = damagePlayer(e.x, e.big ? DMG.sailerBig : DMG.sailer, { up: true });
      if (res === 'hit') { P.vx = wind * 300; P.vy = -150; }
      else if (res === 'blocked') { e.mode = 'tumble'; e.modeT = e.big ? 2.4 : 1.6; e.stagger = e.modeT; e.vx = -wind * 90; number(e.x, e.y - e.h - 12, 'SHE SPILLS', '#8fd160'); SFX.clank(); shakeCam(3); }
    }
  } else { if (e.mode === 'sail') { e.mode = 'plant'; e.modeT = 0.5; } if (e.stagger <= 0) { e.face = Math.sign(d) || e.face; e.vx += ((ad < 200 && !P.dead ? e.face * e.speed : 0) - e.vx) * Math.min(1, dt * 4); } else e.vx += (0 - e.vx) * Math.min(1, dt * 6); }
  const r = moveBody(e, e.vx * dt, e.vy * dt, false); if (r.ground) e.vy = 0;
  if (r.hitX && e.mode === 'sail') { // the wall takes the sail out of her
    e.mode = 'tumble'; e.modeT = e.big ? 2.6 : 1.7; e.stagger = e.modeT; e.vx = 0;
    number(e.x, e.y - e.h - 12, e.big ? 'INTO THE STONE: CUT HER' : 'SHE PILES UP', '#8fd160'); SFX.thud(); shakeCam(e.big ? 6 : 2); dust(e.x, e.y, 8);
    if (e.big) { zoomKick(1.08, 0.25); for (let i = 0; i < 8; i++) parts.push({ x: e.x, y: e.y - 10 - Math.random() * 14, vx: (Math.random() - 0.5) * 120, vy: -80, life: 0.7, max: 0.7, col: '#c9b27c', size: 2, grav: 380 }); }
  }
  if (e.big && e.maxHp && e.phase === 1 && e.hp <= e.maxHp / 2) { e.phase = 2; e.speed = 34; number(e.x, e.y - e.h - 14, 'ENRAGED', '#ff6b6b'); SFX.roar(); }
}

function updateTroll(e, dt) {
  e.modeT -= dt; e.vy += 1000 * dt; if (e.vy > 320) e.vy = 320; e.hitT = Math.max(0, e.hitT - dt); e.throwT -= dt;
  const d = P.x - e.x, ad = Math.abs(d), near = ad < 260 && Math.abs(e.y - P.y) < 80 && !P.dead;
  let want = 0;
  if (e.mode === 'throwTell') { e.face = Math.sign(d) || e.face; if (e.modeT <= 0) { e.mode = 'throw'; e.modeT = 0.4; const tt = 0.9, tx = e.aimX !== undefined ? e.aimX : P.x; rocks.push({ x: e.x + e.face * 8, y: e.y - 24, vx: (tx - e.x) / tt, vy: -330, t: 0, dead: false, thrown: true, tx }); /* no leading: it lands where you stood when he picked it up */ SFX.heavy(); SFX.snort(); number(e.x, e.y - e.h - 10, 'HURLS', '#ff9a5c'); } }
  else if (e.mode === 'throw') { if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.5; } }
  else if (e.mode === 'swatTell') { e.face = Math.sign(d) || e.face; if (e.modeT <= 0) { e.mode = 'swat'; e.modeT = 0.35; SFX.slash(); if (!P.dead && Math.sign(P.x - e.x) === e.face && ad < 36 && Math.abs(P.y - e.y) < 26) { const res = damagePlayer(e.x, DMG.troll); if (res === 'hit') { P.vx = e.face * 240; P.vy = -120; } else if (res === 'blocked') { e.stagger = 0.9; number(e.x, e.y - e.h - 10, 'PARRIED', '#8fd160'); } } } }
  else if (e.mode === 'swat') { if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.7; } }
  else if (e.stagger > 0) want = 0;
  else if (near) { e.face = Math.sign(d) || e.face; if (ad < 32 && e.modeT <= 0) { e.mode = 'swatTell'; e.modeT = 0.5; number(e.x, e.y - e.h - 10, '!', '#ffd36b'); SFX.snort(); } else if (e.throwT <= 0 && ad > 56 && ad < 240) { e.throwT = 3.4; e.mode = 'throwTell'; e.modeT = 0.75; e.aimX = P.x; number(e.x, e.y - e.h - 10, '!!', '#ff9a5c'); SFX.snort(); } else want = ad > 64 ? e.face * e.speed : 0; }
  else want = e.face * 8;
  e.vx += (want - e.vx) * Math.min(1, dt * 5);
  const aheadX = e.x + Math.sign(e.vx || e.face) * (e.w / 2 + 2), ftx = Math.floor(aheadX / TS), fty = Math.floor((e.y + 1) / TS);
  const r = moveBody(e, e.vx * dt, e.vy * dt, false); if (r.ground) e.vy = 0;
  if (r.ground && tileAt(ftx, fty) === T.AIR && !isOneWay(tileAt(ftx, fty))) { e.vx = 0; if (!near) e.face = -e.face; }
  if (r.hitX) { e.vx = 0; if (!near) e.face = -e.face; }
}
function updateHarpy(e, dt) {
  e.modeT -= dt; const dx = P.x - e.x, dy = (P.y - 8) - e.y, ad = Math.abs(dx);
  if (e.mode === 'hover') { e.x += (e.hx + Math.sin(e.anim * 1.1) * 8 - e.x) * Math.min(1, dt * 3); { const w = windAt(e.x, e.y); if (w) e.x += w * 60 * dt; } /* the gust takes her too */ e.y += (e.hy + Math.sin(e.anim * 2.1) * 4 - e.y) * Math.min(1, dt * 3); e.face = Math.sign(dx) || e.face; e.cd = Math.max(0, (e.cd || 0) - dt);
    if (!P.dead && ad < 130 && dy > 10 && dy < 150 && e.cd <= 0 && e.stagger <= 0) { e.mode = 'aim'; e.modeT = 0.55; SFX.screech(); number(e.x, e.y - 12, '!', '#ff6b6b'); } return; }
  if (e.mode === 'aim') { e.face = Math.sign(dx) || e.face; if (e.stagger > 0) { e.mode = 'rise'; e.modeT = 1; return; } if (e.modeT <= 0) { const d = Math.hypot(dx, dy) || 1; e.dvx = dx / d * 240; e.dvy = dy / d * 240; e.mode = 'dive'; e.modeT = 0.85; e.hit = false; } return; }
  if (e.mode === 'dive') { e.x += (e.dvx + windAt(e.x, e.y) * 70) * dt; e.y += e.dvy * dt; e.face = Math.sign(e.dvx) || e.face;
    if (e.stagger > 0) { e.mode = 'rise'; e.modeT = 1; return; }
    if (!e.hit && !P.dead && Math.abs(P.x - e.x) < 10 && Math.abs((P.y - 8) - e.y) < 12) { e.hit = true; const res = damagePlayer(e.x, DMG.harpy); if (res === 'blocked') { e.mode = 'downed'; e.modeT = 1.6; e.vy = -60; e.stagger = 1.6; number(e.x, e.y - 12, 'KNOCKED DOWN', '#8fd160'); SFX.screech(); return; } else if (res === 'hit') { P.vx = e.dvx * 0.6; } e.mode = 'rise'; e.modeT = 1; return; }
    const tx = Math.floor(e.x / TS), ty = Math.floor((e.y + 4) / TS); if (isSolid(tx, ty) || e.modeT <= 0) { e.mode = 'rise'; e.modeT = 1; if (isSolid(tx, ty)) { e.y = ty * TS - 4; dust(e.x, e.y + 4, 4); } } return; }
  if (e.mode === 'downed') { e.vy = Math.min(300, (e.vy || 0) + 900 * dt); const r = moveBody(e, 0, e.vy * dt, false); if (r.ground) e.vy = 0; if (e.modeT <= 0) { e.mode = 'rise'; e.modeT = 1.2; e.stagger = 0; } return; }
  if (e.mode === 'rise') { e.x += (e.hx - e.x) * Math.min(1, dt * 2.5); e.y += (e.hy - e.y) * Math.min(1, dt * 2.5); if (e.modeT <= 0) { e.mode = 'hover'; e.cd = 1.2; } }
}
function updateGoat(e, dt) {
  e.timer -= dt; e.vy += 1000 * dt; if (e.vy > 320) e.vy = 320; e.modeT = (e.modeT || 0) - dt; e.hitT = Math.max(0, (e.hitT || 0) - dt);
  const d = P.x - e.x, ad = Math.abs(d), near = ad < 210 && Math.abs(e.y - P.y) < 48 && !P.dead;
  let want = 0;
  if (e.flung > 0) { e.flung -= dt; want = e.vx; if (!P.dead && ad < 14 && Math.abs(P.y - e.y) < 20 && e.hitT <= 0) { e.hitT = 0.8; const res = damagePlayer(e.x, DMG.goat, { unblockable: true }); if (res === 'hit') { P.vx = Math.sign(e.vx) * 200; P.vy = -120; } } if (e.flung <= 0) { e.fleeT = 3; e.face = Math.sign(P.x - e.x) || 1; } }
  else if (!e.rider) { e.fleeT = (e.fleeT || 0) - dt; want = e.face * 120; if (e.fleeT <= 0 || Math.abs(e.x - P.x) > 420) e.alive = false; }
  else if (e.mode === 'buck') { want = 0; if (e.modeT <= 0) e.mode = 'patrol'; }
  else if (e.stagger > 0) want = 0;
  else if (near) { e.face = Math.sign(d) || e.face; e.mode = 'charge'; want = e.face * 150; if (!e.bleated) { e.bleated = true; SFX.goatCry(); number(e.x, e.y - e.h - 8, '!', '#ffd36b'); }
    if (ad < 16 && Math.abs(P.y - e.y) < 20 && e.hitT <= 0) { e.hitT = 0.7; const res = damagePlayer(e.x, DMG.goat); if (res === 'blocked') { e.mode = 'buck'; e.modeT = 0.9; e.stagger = 0.9; e.face = -e.face; e.vx = e.face * 40; number(e.x, e.y - e.h - 10, 'REARS', '#8fd160'); SFX.goatCry(); } else if (res === 'hit') { P.vx = e.face * 230; P.vy = -120; } } }
  else { e.mode = 'patrol'; e.bleated = false; if (e.timer <= 0) { e.timer = 1.5 + Math.random() * 2; e.face = Math.random() < 0.5 ? -1 : 1; } want = e.face * 30; }
  if (!e.air) e.vx += (want - e.vx) * Math.min(1, dt * 8);
  const aheadX = e.x + Math.sign(e.vx || e.face) * (e.w / 2 + 3), ftx = Math.floor(aheadX / TS), fty = Math.floor((e.y + 1) / TS);
  const skid = () => { if (e.mode === 'charge') { e.mode = 'buck'; e.modeT = 0.6; dust(e.x + e.face * 6, e.y, 6); SFX.skid && SFX.skid(); } e.face = -e.face; e.vx = 0; }; /* the rams keep to their own ground: no hopping steps, no leaping walls, no running off the edge */
  if (!e.air && e.vy === 0 && isSolid(ftx, fty - 1) && !(e.flung > 0)) skid();
  const r = moveBody(e, e.vx * dt, e.vy * dt, false); if (r.ground) { e.vy = 0; e.air = false; }
  if (r.ground && !e.air && !(e.flung > 0) && tileAt(ftx, fty) === T.AIR && !isOneWay(tileAt(ftx, fty))) skid();
  if (r.hitX && !(e.flung > 0)) skid();
}
const ramOpen = e => e.mode === 'crash' || e.mode === 'land'; // the two windows: into the wall, and off the leap
function updateRam(e, dt) {
  const A = L.arena, floor = A.floor, p2 = e.phase === 2; e.modeT -= dt; e.anim += dt; e.hitT = Math.max(0, (e.hitT || 0) - dt);
  e.vy += 1000 * dt; if (e.vy > 400) e.vy = 400;
  const d = P.x - e.x, ad = Math.abs(d);
  let want = 0;
  const pick = () => { e.n = (e.n || 0) + 1; const r = Math.random(); for (let k = 0; k < 3; k++) parts.push({ x: e.x + e.face * 18, y: e.y - 8 + k, vx: e.face * (40 + k * 15), vy: -10 - k * 6, life: 0.4, max: 0.4, col: '#e8e0d0', size: 2, grav: -20 }); if (ad < 40 && r < 0.55) { e.mode = 'tossTell'; e.modeT = 0.45; number(e.x, e.y - e.h - 12, '!!!', '#ff9a5c'); SFX.snort(); } else if (e.n % 3 === 0 && r < 0.6) { e.mode = 'stampTell'; e.modeT = 0.5; number(e.x, e.y - e.h - 12, '!!', '#ff6b6b'); SFX.snort(); } else if (ad < 70 && r < 0.5) { e.mode = 'buttTell'; e.modeT = 0.35; number(e.x, e.y - e.h - 12, '!', '#ffd36b'); SFX.snort(); } else if (ad > 50 && r < (p2 ? 0.82 : 0.7)) { e.mode = 'leapTell'; e.modeT = 0.55; number(e.x, e.y - e.h - 12, '!!!', '#ff6b6b'); SFX.snort(); SFX.snort(); } else { e.mode = 'lower'; e.modeT = p2 ? 0.5 : 0.7; e.feint = ad > 60 && Math.random() < (p2 ? 0.5 : 0.35); number(e.x, e.y - e.h - 12, '!!', '#ff6b6b'); SFX.snort(); } };
  switch (e.mode) {
    case 'sleep': { const r = moveBody(e, 0, e.vy * dt, false); if (r.ground) e.vy = 0; return; }
    case 'wake': if (e.modeT <= 0) { e.mode = 'pace'; e.modeT = 0.8; } break;
    case 'pace': e.face = Math.sign(d) || e.face; want = e.face * (p2 ? 60 : 36); if (e.modeT <= 0) pick(); break;
    case 'lower': e.face = Math.sign(d) || e.face; if (e.modeT <= 0) { e.mode = 'charge'; e.modeT = 3; e.chain = p2 ? 1 : 0; SFX.bellow(); dust(e.x - e.face * 12, e.y, 8); } break;
    case 'charge': want = e.face * (p2 ? 290 : 220);
      for (const gt of enemies) if (gt.alive && gt.t === 'goat' && gt.called && !gt.flung && Math.abs(gt.x - e.x) < 18 && Math.abs(gt.y - e.y) < 16) { gt.flung = 1.2; gt.air = true; gt.vx = e.face * 250; gt.vy = -190; gt.y -= 2; gt.hitT = 0; SFX.goatCry(); number(gt.x, gt.y - gt.h - 8, 'FLUNG', '#ffd36b'); } // he goes through the flock and the flock goes through you
      if (e.feint && e.modeT < 2.55) { e.feint = false; e.mode = 'rear'; e.modeT = 0.55; e.vx *= 0.2; dust(e.x + e.face * 12, e.y, 10); SFX.snort(); number(e.x, e.y - e.h - 12, '!!', '#ff9a5c'); break; } // THE FEINT: he pulls up short and rears; the real charge follows
      if (!P.dead && ad < 22 && Math.abs(P.y - e.y) < 24 && e.hitT <= 0) { e.hitT = 0.8; const res = damagePlayer(e.x, DMG.ramLord); if (res === 'hit') { P.vx = e.face * 260; P.vy = -160; } else if (res === 'blocked') { P.vx = e.face * 200; number(P.x, P.y - 24, 'SHOVED', '#c9d1dc'); } }
      if (e.x <= A.x0 + 16 || e.x >= A.x1 - 16 || e.modeT <= 0) { e.x = Math.max(A.x0 + 16, Math.min(A.x1 - 16, e.x)); e.vx = 0; e.mode = 'crash'; e.modeT = p2 ? 1.7 : 2.4; shakeCam(9); SFX.heavy(); SFX.stone(); SFX.sting(); zoomKick(1.12, 0.3); dust(e.x + e.face * 14, e.y, 14); number(e.x, e.y - e.h - 12, 'INTO THE WALL', '#8fd160'); const n = p2 ? 4 : 2; for (let i = 0; i < n; i++) rocks.push({ x: A.x0 + 24 + Math.random() * (A.x1 - A.x0 - 48), y: floor - 150, vy: 0, t: 0, dead: false }); sparks(e.x + e.face * 14, e.y - 10, e.face, 8); }
      break;
    case 'rear': want = 0; e.face = Math.sign(d) || e.face; if (e.modeT <= 0) { e.mode = 'charge'; e.modeT = 3; e.chain = p2 ? 1 : 0; SFX.bellow(); dust(e.x - e.face * 12, e.y, 8); } break;
    case 'leapTell': want = 0; e.face = Math.sign(d) || e.face; if (e.modeT <= 0) { e.mode = 'leap'; e.modeT = 2; e.vy = -430; e.landX = Math.max(A.x0 + 20, Math.min(A.x1 - 20, P.x)); e.vx = (e.landX - e.x) / 0.86; e.airT = 0; SFX.leap(); dust(e.x, e.y, 10); } break;
    case 'leap': want = e.vx; e.airT += dt; // THE LEAP: he comes down where you stood; the shadow shows where
      if (e.airT > 0.2 && e.vy >= 0 && e.y >= floor - 1) { e.y = floor; e.vy = 0; e.vx = 0; e.mode = 'land'; e.modeT = 1.0; e.stagger = 1.0; shakeCam(9); SFX.heavy(); SFX.thud(); SFX.sting(); zoomKick(1.1, 0.25); dust(e.x - 12, e.y, 10); dust(e.x + 12, e.y, 10); for (const dd of [-1, 1]) waves.push({ x: e.x + dd * 16, y: floor, dir: dd, life: 1.6, sp: p2 ? 185 : 155 }); if (!P.dead && ad < 28 && Math.abs(P.y - e.y) < 22) damagePlayer(e.x, DMG.ramLeap, { unblockable: true, up: true }); const n = p2 ? 2 : 1; for (let i = 0; i < n; i++) rocks.push({ x: A.x0 + 24 + Math.random() * (A.x1 - A.x0 - 48), y: floor - 150, vy: 0, t: 0, dead: false }); for (const lx of [A.x0 + 40, A.x1 - 40]) rocks.push({ x: lx + (Math.random() - 0.5) * 12, y: floor - 160, vy: 0, t: 0, dead: false }); } break; // the ledges are safe from the stamp, not from the leap
    case 'land': want = 0; if (e.modeT <= 0) { e.mode = 'pace'; e.modeT = 0.5; e.stagger = 0; } break;
    case 'crash': if (Math.floor(e.modeT / 0.7) !== Math.floor((e.modeT + dt) / 0.7)) number(e.x, e.y - e.h - 12, 'DAZED: HIT HIM', '#8fd160'); if (e.modeT <= 0) { if (e.chain > 0) { e.chain--; e.face = -e.face; e.mode = 'charge'; e.modeT = 3; SFX.bellow(); number(e.x, e.y - e.h - 12, 'AGAIN', '#ff6b6b'); } else { e.mode = 'pace'; e.modeT = 0.6 + Math.random() * 0.6; } } break;
    case 'stampTell': e.face = Math.sign(d) || e.face; if (e.modeT <= 0) { e.mode = 'stamp'; e.modeT = 0.5; shakeCam(6); SFX.heavy(); dust(e.x, e.y, 12); for (const dd of [-1, 1]) waves.push({ x: e.x + dd * 18, y: floor, dir: dd, life: 1.7, sp: p2 ? 170 : 140 }); if (!P.dead && ad < 30 && Math.abs(P.y - e.y) < 20 && P.ground) damagePlayer(e.x, DMG.ramStamp, { unblockable: true }); } break;
    case 'stamp': if (e.modeT <= 0) { e.mode = 'pace'; e.modeT = 0.7; } break;
    case 'callTell': e.face = Math.sign(d) || e.face; if (e.modeT <= 0) { e.mode = 'call'; e.modeT = 0.6; for (const s of [-1, 1]) { const x = s < 0 ? A.x0 + 20 : A.x1 - 20; enemies.push({ t: 'goat', x, y: floor, vx: 0, vy: -80, w: 14, h: 11, hp: EHP.goat, hp0: EHP.goat, speed: 30, mode: 'patrol', modeT: 0, rider: false, timer: 0, air: false, hitT: 0, face: -s, fleeT: 4.5, called: true, alive: true, dying: 0, anim: Math.random(), flash: 0, stagger: 0 }); burst(x, floor - 6, 8, COLS.goat, 60, 0.5); } number(P.x, P.y - 30, 'JUMP THE FLOCK', '#ffd36b'); SFX.goatCry(); } break;
    case 'call': if (e.modeT <= 0) { e.mode = 'pace'; e.modeT = 0.8; } break;
    case 'tossTell': e.face = Math.sign(d) || e.face; if (e.modeT <= 0) { e.mode = 'toss'; e.modeT = 0.5; SFX.bellow(); dust(e.x + e.face * 12, e.y, 8); if (!P.dead && Math.sign(P.x - e.x) === e.face && ad < 38 && Math.abs(P.y - e.y) < 24 && P.dodge <= 0) { damagePlayer(e.x, DMG.ramLord, { unblockable: true, up: true }); P.vy = -340; P.vx = e.face * 230; P.ground = false; number(P.x, P.y - 24, 'TOSSED', '#ff6b6b'); shakeCam(4); } else number(e.x, e.y - e.h - 12, 'MISSED', '#9aa39a'); } break;
    case 'toss': if (e.modeT <= 0) { e.mode = 'pace'; e.modeT = 0.7; } break;
    case 'buttTell': e.face = Math.sign(d) || e.face; if (e.modeT <= 0) { e.mode = 'butt'; e.modeT = 1; e.vy = -300; e.vx = e.face * Math.min(160, Math.max(60, ad * 1.6)); e.airT = 0; SFX.leap(); } break;
    case 'butt': want = e.vx; e.airT += dt; if (!P.dead && ad < 20 && Math.abs(P.y - e.y) < 26 && e.hitT <= 0) { e.hitT = 0.8; const res = damagePlayer(e.x, DMG.ramLord); if (res === 'hit') { P.vx = e.face * 220; P.vy = -140; } }
      if (e.airT > 0.15 && e.vy >= 0 && e.y >= floor - 1) { e.y = floor; e.vy = 0; e.vx = 0; shakeCam(5); SFX.thud(); dust(e.x, e.y, 10); if (p2) for (const dd of [-1, 1]) waves.push({ x: e.x + dd * 14, y: floor, dir: dd, life: 1.2, sp: 150 }); e.mode = 'pace'; e.modeT = 0.8; } break;
  }
  if (e.mode !== 'butt' && e.mode !== 'leap') e.vx += (want - e.vx) * Math.min(1, dt * (e.mode === 'charge' ? 10 : 6));
  if (e.mode === 'butt' || e.mode === 'leap') { e.x += e.vx * dt; e.y += e.vy * dt; if (e.y > floor) e.y = floor; }
  else { const r = moveBody(e, e.vx * dt, e.vy * dt, false); if (r.ground) e.vy = 0; }
  e.x = Math.max(A.x0 + 14, Math.min(A.x1 - 14, e.x));
}
// rocks off the cliff: a shadow where one will land, then it shatters on whatever it hits
let beams = [], meltT = {}; // beam segments this frame; per-tile melt and burn timers
const MIRROR = [(dx, dy) => [-dy, -dx], (dx, dy) => [dy, dx]]; // o 0 is '/', o 1 is '\'
function traceBeams(dt) {
  beams = []; const litRx = new Set();
  for (const cr of props) { if (cr.t !== 'crystal') continue;
    let x = cr.x, y = cr.y - 8, [dx, dy] = cr.dir; let x0 = x, y0 = y; const col = cr.col || 'blue';
    for (let n = 0; n < 60; n++) {
      const nx = x + dx * TS, ny = y + dy * TS, tx = Math.floor(nx / TS), ty = Math.floor(ny / TS), t = tileAt(tx, ty);
      const mr = props.find(p => p.t === 'mirror' && Math.floor(p.x / TS) === tx && Math.floor((p.y - 8) / TS) === ty);
      if (mr) { beams.push({ x0, y0, x1: mr.x, y1: mr.y - 8, col }); x = mr.x; y = mr.y - 8; [dx, dy] = MIRROR[mr.o](dx, dy); x0 = x; y0 = y; mr.glow = 0.3; continue; }
      const rx = props.find(p => p.t === 'receiver' && Math.floor(p.x / TS) === tx && Math.floor((p.y - 8) / TS) === ty);
      if (rx) { beams.push({ x0, y0, x1: rx.x, y1: rx.y - 8, col }); litRx.add(rx); break; }
      if (t === T.ICE || t === T.WEB) { const i = ty * LW + tx; meltT[i] = (meltT[i] || 0) + dt; if (Math.random() < dt * 20) parts.push({ x: tx * TS + Math.random() * TS, y: ty * TS + Math.random() * TS, vx: 0, vy: t === T.ICE ? 30 : -30, life: 0.4, max: 0.4, col: t === T.ICE ? '#eefaff' : '#8a8478', size: 1, grav: t === T.ICE ? 200 : 0 }); if (meltT[i] > (t === T.ICE ? 0.9 : 0.5)) { let y0 = ty, y1 = ty; while (tileAt(tx, y0 - 1) === t) y0--; while (tileAt(tx, y1 + 1) === t) y1++; for (let yy = y0; yy <= y1; yy++) { const k = yy * LW + tx; L.grid[k] = T.AIR; tileSpr[k] = null; destroyed.add(k); burst(tx * TS + 8, yy * TS + 8, 8, t === T.ICE ? ['#eefaff', '#9fd0e8'] : ['#e8e8f0', '#8a8478'], 60, 0.5); } SFX[t === T.ICE ? 'crack' : 'puff'](); } /* the whole curtain goes, not one tile */ beams.push({ x0, y0, x1: nx, y1: ny, col }); break; }
      if (t === T.PORT) { x = nx; y = ny; continue; } // light goes through a barred door
      if (isSolid(tx, ty) || tx < 0 || ty < 0 || tx >= LW || ty >= LH) { beams.push({ x0, y0, x1: x + dx * (TS / 2), y1: y + dy * (TS / 2), col }); break; }
      x = nx; y = ny;
    }
  }
  for (const rx of props) if (rx.t === 'receiver') { rx.lit = litRx.has(rx); if (rx.lit && !rx.opened) { rx.litT += dt; if (rx.litT > 1.2) { rx.opened = true; let n = 0; if (rx.hatch !== undefined) { for (let tx = rx.gx0; tx <= rx.gx1; tx++) { const i = rx.hatch * LW + tx; if (L.grid[i] === T.PORT) { L.grid[i] = T.AIR; tileSpr[i] = null; destroyed.add(i); n++; if (tx % 3 === 0) burst(tx * TS + 8, rx.hatch * TS + 8, 3, ['#bfe6f5', '#7c8797'], 40, 0.4); } } if (n) { number(rx.x, rx.y - 20, 'THE HATCH OPENS', '#bfe6f5'); SFX.sting(); SFX.stone(); shakeCam(3); } } else for (let ty = 0; ty < LH; ty++) { const i = ty * LW + rx.gate; if (L.grid[i] === T.PORT) { L.grid[i] = T.AIR; tileSpr[i] = null; destroyed.add(i); n++; burst(rx.gate * TS + 8, ty * TS + 8, 4, ['#bfe6f5', '#7c8797'], 40, 0.4); } } if (n) { number(rx.gate * TS + 8, rx.y - 20, 'THE DOOR OPENS', '#bfe6f5'); SFX.sting(); SFX.stone(); shakeCam(3); } } } else if (!rx.lit) rx.litT = Math.max(0, rx.litT - dt); }
  // a beam burns what walks through it, and lights the thing that only bleeds lit
  for (const e of enemies) { if (!e.alive || e.harmless) continue; const hits = beams.filter(b => segHitsBox(b, e.x - e.w / 2, e.y - e.h, e.x + e.w / 2, e.y)); const hit = hits.length > 0; if (e.t === 'golem') { e.lit = hit; e.litCols = new Set(hits.map(b => b.col || 'blue')); continue; } if (hit && !(e.beamT > 0) && !e.maxHp) { e.beamT = 0.35; hurtEnemy(e, 12, e.x + 1, false); e.burn = Math.max(e.burn || 0, 0.6); } e.beamT = Math.max(0, (e.beamT || 0) - dt); }
}
function segHitsBox(b, l, t, r, bt) { // axis-aligned beams only
  if (b.y0 === b.y1) { const y = b.y0; if (y < t || y > bt) return false; const a = Math.min(b.x0, b.x1), c = Math.max(b.x0, b.x1); return c >= l && a <= r; }
  const x = b.x0; if (x < l || x > r) return false; const a = Math.min(b.y0, b.y1), c = Math.max(b.y0, b.y1); return c >= t && a <= bt;
}
const BEAM_COL = { blue: ['#bfe6f5', '#eefaff'], violet: ['#c8a8ff', '#f0e4ff'], green: ['#a8ffb8', '#e8fff0'] };
function drawBeams(cx, cy) {
  for (const b of beams) { const x0 = Math.round(b.x0 - cx), y0 = Math.round(b.y0 - cy), x1 = Math.round(b.x1 - cx), y1 = Math.round(b.y1 - cy); const bc = BEAM_COL[b.col] || BEAM_COL.blue; g.globalAlpha = 0.22 + 0.08 * Math.sin(time * 9); g.strokeStyle = bc[0]; g.lineWidth = 7; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.globalAlpha = 0.9; g.strokeStyle = bc[1]; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.globalAlpha = 1; if (Math.random() < 0.3) { const t = Math.random(); parts.push({ x: b.x0 + (b.x1 - b.x0) * t, y: b.y0 + (b.y1 - b.y0) * t, vx: (Math.random() - 0.5) * 16, vy: (Math.random() - 0.5) * 16, life: 0.3, max: 0.3, col: '#eefaff', size: 1, grav: 0 }); } }
}
let flood = null; // the flood: a deep pool whose front chases you down the last gallery
function updateFlood(dt) {
  const F = L.flood; if (!F) return;
  if (!flood && !marks.has('flood') && !P.dead && P.x > F.trigger && P.x < F.trigger + 60 && P.y > F.y - 60) { flood = { x0: F.x0, x1: F.x0, y: F.y, shallow: false, depth: 0, flood: true, t: 0 }; L.pools.push(flood); shakeCam(5); SFX.rumble(); SFX.splash(); number(P.x, P.y - 40, 'THE SUMP GATE GOES', '#bfe6f5'); }
  if (!flood) return; flood.t += dt;
  if (flood.x1 < F.x1) { flood.x1 = Math.min(F.x1, flood.x1 + F.speed * dt); if (Math.random() < dt * 30) parts.push({ x: flood.x1 + (Math.random() - 0.5) * 12, y: flood.y - Math.random() * 10, vx: 40, vy: -40 - Math.random() * 40, life: 0.5, max: 0.5, col: '#eefaff', size: 2, grav: 300 }); if (Math.floor(flood.t * 2) !== Math.floor((flood.t - dt) * 2) && Math.abs(P.x - flood.x1) < 300) SFX.splash(); }
  else if (flood.t > 14) { flood.x0 += 90 * dt; if (flood.x0 >= flood.x1 - 4) { L.pools = L.pools.filter(p => p !== flood); flood = null; marks.add('flood'); } }
}
let slide = null; // the rockslide: a front of boulders that chases you down the scree once
function updateSlide(dt) {
  const Z = L.slide; if (!Z || P.dead) return;
  if (!slide && !marks.has('slide') && P.x > Z.x0 + 16 && P.x < Z.x0 + 80 && P.y < LH * TS) { slide = { x: Z.x0 - 60, t: 0, hitT: 0, rockT: 0, rumT: 0 }; shakeCam(6); SFX.rumble(); SFX.thunder(); number(P.x, P.y - 40, 'THE HILL COMES DOWN', '#ff6b6b'); }
  if (!slide) return; const S = slide; S.t += dt; S.x += Z.speed * dt; S.hitT = Math.max(0, S.hitT - dt); S.rumT -= dt; S.rockT -= dt;
  if (S.rumT <= 0) { S.rumT = 0.6; shakeCam(3); if (SET.ambient) SFX.rumble(); }
  if (S.rockT <= 0) { S.rockT = 0.35; rocks.push({ x: S.x + 30 + Math.random() * 90, y: P.y - 150, vy: 0, t: 0, dead: false, thrown: true }); }
  if (Math.random() < dt * 40) parts.push({ x: S.x + (Math.random() - 0.5) * 40, y: slideFloor(S.x) - Math.random() * 20, vx: 60 + Math.random() * 60, vy: -40 - Math.random() * 60, life: 0.5, max: 0.5, col: ['#8a919c', '#5a6270', '#b0b8c4'][(Math.random() * 3) | 0], size: 2, grav: 400 });
  if (P.x < S.x + 12 && P.x > Z.x0 - 80 && S.hitT <= 0 && Math.abs(P.y - slideFloor(P.x)) < 40) { S.hitT = 0.9; damagePlayer(S.x - 20, DMG.slide, { unblockable: true, up: true }); P.vx = 260; P.vy = -160; P.ground = false; number(P.x, P.y - 24, 'CAUGHT', '#ff6b6b'); }
  if (S.x > Z.x1 + 40) { slide = null; marks.add('slide'); }
}
const slideFloor = x => { const tx = Math.floor(x / TS); for (let ty = 8; ty < LH; ty++) if (isSolid(tx, ty)) return ty * TS; return LH * TS; };
function drawSlide(cx, cy) { if (!slide) return; const S = slide; for (let i = 0; i < 9; i++) { const bx = S.x - i * 11 + Math.sin(S.t * 6 + i) * 3, fl = slideFloor(bx), by = fl - 5 - Math.abs(Math.sin(S.t * 7 + i * 1.3)) * 12 - (i % 3) * 5; const r = 4 + (i % 3) * 2; g.fillStyle = i % 2 ? '#8a919c' : '#5a6270'; g.beginPath(); g.arc(Math.round(bx - cx), Math.round(by - cy), r, 0, 7); g.fill(); g.fillStyle = '#b0b8c4'; g.fillRect(Math.round(bx - cx) - 1, Math.round(by - cy) - r + 1, 2, 2); } }
function updateRocks(dt) {
  for (const r of rocks) { r.vy = Math.min(420, r.vy + 700 * dt); r.y += r.vy * dt; r.x += (r.vx || 0) * dt; r.t += dt;
    const tx = Math.floor(r.x / TS), ty = Math.floor((r.y + 1) / TS), t = tileAt(tx, ty);
    if (t === T.SOLID || (isOneWay(t) && r.vy > 0 && (r.y % TS) < 7) || r.y > LH * TS) { r.dead = true; shatterRock(r); continue; }
    if (!P.dead && Math.abs(P.x - r.x) < (r.hammerRock ? 11 : 9) && P.y > r.y - 4 && P.y - 16 < r.y + 6) { r.dead = true; damagePlayer(r.x, r.hammerRock ? DMG.anvilHammer : DMG.rock, { up: true, unblockable: !!r.hammerRock }); shatterRock(r); continue; }
    for (const e of enemies) if (e.alive && e.t !== 'ram' && e.t !== 'harpy' && !(e.t === 'troll' && r.thrown) && !e.harmless && Math.abs(e.x - r.x) < 9 && e.y > r.y - 4 && e.y - e.h < r.y + 6) { r.dead = true; hurtEnemy(e, 15, r.x, false); shatterRock(r); break; }
  }
  rocks = rocks.filter(r => !r.dead);
}
function drawHammerRock(r, cx, cy) { const x = Math.round(r.x - cx), y = Math.round(r.y - cy); g.fillStyle = '#5c3a1d'; g.fillRect(x - 1, y - 12, 2, 10); g.fillStyle = '#3a3a44'; g.fillRect(x - 6, y - 16, 12, 6); g.fillStyle = '#8a919c'; g.fillRect(x - 6, y - 16, 12, 1); }
function shatterRock(r) { burst(r.x, r.y - 2, 8, ['#8a919c', '#5a6270', '#b0b8c4'], 60, 0.5); SFX.crumble ? SFX.crumble() : SFX.stone(); if (Math.abs(r.x - P.x) < 160) shakeCam(2); }
// Tam, the squire: at the trailhead of every level, before and after it is cleared. Caged in the Stockade (that level keeps the kit quest).
const TAM_LINES = {
  wood: [['SIR KNIGHT. I AM TAM. I CARRY YOUR SPARE BLADE AND I WILL KEEP THE TRAIL BEHIND YOU.', 'THE HIVE TOOK THE HONEY AND THE WOODSMAN\'S NERVE. THE QUEEN IS PAST THE BADGER SETT.'],
         ['THE QUEEN IS DEAD AND THE WOOD HUMS QUIETER. WELL STRUCK.', 'THE MARSH IS NEXT. THEY SAY A KING CROAKS THERE AND HIS COURT SITS ON A DAIS.']],
  marsh: [['THE FERRYMAN WANTS COIN FOR THE CROSSING. I HAVE NONE. I HAVE YOUR SPARE BLADE.', 'GOBLINS CAME THROUGH LAST NIGHT, BOUND FOR THEIR STOCKADE. I WILL SCOUT AHEAD AND COUNT THEM.'],
          ['THE FROG KING IS FROG SOUP. I WENT AHEAD TO COUNT GOBLINS.', 'THAT WAS A MISTAKE. COME QUICKLY.']],
  spore: [['THEY TOOK MY HELM, HORN AND BLADE. YOU TOOK THEM BACK. I OWE YOU A WOOD\'S WORTH.', 'THE SPOREWOOD IS SICK. THE ELDER SAYS SOMETHING BREATHES AT THE BOTTOM OF IT.'],
          ['THE WOOD BREATHES EASIER. THE ELDER WEPT.', 'THE GOBLIN KING HOLDS COURT PAST THE ROT. THEY SAY HE KEEPS A HOUND THE SIZE OF A CART.']],
  kings: [['KINGSWOOD. GORM CALLS HIMSELF KING OF ALL OF IT. HIS COURT IS ALL FIRE AND DOGS.', 'IF YOU FALL, I WILL SAY YOU TRIPPED.'],
          ['GORM IS DONE. THE GOBLINS ARE RUNNING FOR THE HILLS. THE CRAGS, THEY CALL THEM.', 'THE KEEPER SAYS THERE IS A HIGH ROAD, AND A HIGH STORE ON IT.']],
  scree: [['THE HILL FOLK BAR THEIR DOORS. I DO NOT BLAME THEM. THE RAMS UP HERE HAVE A LORD.', 'THERE IS A SHEPHERD WHO LOST HER EWES. YOU FIND EVERYONE\'S LOST THINGS. IT IS A HABIT.'],
          ['THE RAM LORD BROKE HIS OWN HORNS ON THE WALL. I SAW IT FROM THE FOLD GATE.', 'THERE IS A TOWN ON THE CLIFF ABOVE. IT HANGS. I AM NOT CLIMBING THAT.']],
  hanging: [['A TOWN ON A CLIFF. THE REEVE IS AN OWL, AND THE OWL TAKES WHAT IT LIKES.', 'I WILL MIND THE MARKET. THE LAMPLIGHTER NEEDS A HAND.'],
             ['THE REEVE IS FEATHERS. THE MARKET IS SINGING.', 'THE GOBLINS WENT UP THE GLASS MOUNTAIN. THE SUNSPIRE, THE LAMPLIGHTER CALLS IT. IT SHINES AT NIGHT.']],
  spire: [['THE SUNSPIRE. THE WHOLE MOUNTAIN IS GLASS, AND THE GLASS GIVES UNDER A STANDING WEIGHT. DO NOT STAND.', 'SOMETHING NESTS ON THE TOP. THE HILL FOLK CALL IT THE ROC, AND THEY DO NOT GO UP.'],
          ['THE ROC IS DOWN. I WATCHED IT FALL PAST THE CLOUD.', 'THE MOOR IS NEXT. THE WIND UP THERE COULD LIFT A HOUSE.']],
  moor: [['THE MOOR. THE WIND UP HERE COULD LIFT A HOUSE. IT WILL LIFT YOU, IF YOU LET IT.', 'THERE IS A BOTHY IN THE LEE OF THE HILL. I WILL WAIT FOR YOU THERE.'],
         ['THE WIND IS QUIET. YOU DID THAT.', 'THE SUMMIT IS ABOVE THE CLOUD. I WILL BE AT THE BOTHY. COME DOWN.']],
  storm: [['STORMHOLD. THE GOBLINS HAVE A TOWN ON THE PEAK, AND THE QUEEN\'S OWN KNIGHT HOLDS THE BRIDGE.', 'THE GATES WANT KEYS. THE GOBLINS CARRY THEM. YOU KNOW WHAT TO DO.'],
          ['THE LANCE IS IN THE RIVER AND THE BRIDGE IS YOURS.', 'HER CASTLE IS ABOVE US. HIGHCROWN. SHE IS THE LAST OF THEM.']],
  crown: [['HIGHCROWN. THE GOBLIN QUEEN. THE LAST OF THE LINE, AND SHE HAS NEVER FOUGHT ALONE.', 'HER SENTRIES RUN FOR THE BELLS. CATCH ONE BEFORE HE RINGS, OR THE GATES COME DOWN BEHIND YOU.'],
          ['SHE IS GONE, AND HER CROWN WENT OVER THE EDGE. THE MOUNTAIN IS QUIET.', 'THAT IS ALL OF THEM, SIR KNIGHT. I THINK WE CAN GO HOME.']],
};
// the errand he gives you in the levels where he is also the one asking: nothing yet, some, all of it
const TAM_QUEST = {
  spire: [['THREE SUNSHARDS FELL FROM THE TOP. BRING THEM DOWN AND I WILL HAVE ONE SET FOR YOU.'], n => ['THAT IS ' + n + ' OF THE THREE SHARDS.'], ['THE LIGHT IS CARRIED DOWN. IT IS WARM IN THE HAND.']],
  storm: [['THREE OF THE HILL FOLK ARE SHUT IN THEIR CELLARS. LET THEM OUT.'], n => ['THAT IS ' + n + ' OF THE THREE. THE OTHERS ARE STILL BELOW.'], ['THEY ARE OUT OF THEIR CELLARS. THE BAKER SENDS A LOAF.']],
  crown: [['THREE ROYAL SEALS SIGN HER ORDERS. TAKE THEM AND HER ORDERS MEAN NOTHING.'], n => ['THAT IS ' + n + ' OF HER THREE SEALS.'], ['HER ORDERS MEAN NOTHING NOW. THE BANNER IS YOURS.']],
};
const TAM_MAP = {
  wood: ['THE HIVE FIRST. I AM BEHIND YOU.', 'THE MARSH NEXT. A KING CROAKS.'], marsh: ['FERRY: PAY, OR BREAK THE SLUICE.', 'I WENT AHEAD. COME QUICKLY.'],
  stockade: ['TAM IS INSIDE. FOLLOW THE TRACKS.', 'MY KIT IS BACK. THE SPORES NEXT.'], spore: ['SOMETHING BREATHES DOWN THERE.', 'GORM HOLDS COURT PAST THE ROT.'],
  kings: ['GORM. ALL FIRE AND DOGS.', 'THEY RAN FOR THE CRAGS. SO DO WE'], scree: ['THE RAMS UP HERE HAVE A LORD.', 'A TOWN HANGS OFF THE CLIFF ABOVE'],
  hanging: ['THE REEVE IS AN OWL. I AM NOT.', 'THEY WENT UP THE GLASS MOUNTAIN.'], spire: ['THE GLASS GIVES. DO NOT STAND.', 'THE ROC IS DOWN. THE MOOR NEXT.'], moor: ['THE WIND OWNS THE MOOR.', 'THE WIND IS QUIET. THE SUMMIT IS NEXT.'],
  storm: ['HER KNIGHT HOLDS THE BRIDGE.', 'HER CASTLE IS ABOVE US.'], crown: ['THE QUEEN. THE LAST OF THEM.', 'IT IS DONE. WE CAN GO HOME.'],
};
const NPC_LINES = pr => {
  const n = straysGot.size, need = questOf().n;
  if (pr.kind === 'keeper') return PROG.storeHint ? ['SOMETHING NEW CAME IN.', 'UP AT THE COUNTER AND HAVE A LOOK.'] : ['WELCOME, KNIGHT. UP AT THE COUNTER TO TRADE.', 'GOLD BUYS STEEL. STEEL BUYS TIME.'];
  if (pr.kind === 'foreman' && curId() === 'spire') return ['WE CAME UP FOR THE GLASS AND THE GLASS CAME UP FOR US. SIT BY THE FIRE A MINUTE.', 'ABOVE THE CLOUD THE SUN IS ON IT ALL DAY. A LEDGE THAT HOLDS YOU FOR A BREATH DOWN HERE HOLDS YOU FOR HALF OF ONE UP THERE, AND THE VENTS BREATHE TWICE AS OFTEN.', 'SOME OF MY MEN WENT OVER TO THE GOBLINS. THEY SMASH THE GLASS UNDER ANYONE STANDING ON IT. DO NOT STAND ON IT NEAR THEM.'];
  if (pr.kind === 'foreman') return ['WE DUG FOR ORE AND HIT GLASS. THE CRYSTALS THROW LIGHT DOWN THE HALLS. STRIKE A MIRROR AND THE LIGHT TURNS.', 'THE BEAM BURNS WEB AND MELTS ICE AND OPENS THE DOORS WE SEALED. MY LAMP IS DOWN IN THE OLD WORKINGS, PAST A WEB.', 'SOMETHING GREW IN THE HEART OF IT. THE MEN WHO SAW IT SAY IT ONLY BLEEDS IN THE LIGHT.'];
  if (pr.kind === 'bard') { const seen = Object.values(PROG.beasts || {}).filter(b => b && b.seen).length; const cleared = LEVELS.filter(lv => PROG[lv.id] && PROG[lv.id].cleared).length; const pool = ['THEY SAY THE HORNET QUEEN HATES A THIEF. WHO DOES NOT?', 'THE FROG KING DRAWS BREATH BEFORE HE PULLS. HOLD YOUR SHIELD UP.', 'CUT THE CHAINED HOUND LOOSE IN THE KENNELS. IT HAS OPINIONS.', 'THE OWL REEVE CANNOT ABIDE A LIT LANTERN.', 'A SONG FOR THE KNIGHT WHO FOUND ' + silverTotal() + ' SILVER. THE CROWD GOES WILD.']; return [cleared === 0 ? 'A NEW FACE. I SING OF THE WOODS. ASK ME ANYTHING, I WILL SING IT WRONG.' : 'YOU HAVE MET ' + seen + ' BEASTS AND CLEARED ' + cleared + ' WOODS. THAT IS A BALLAD.', pool[Math.floor(time / 8) % pool.length]]; }
  if (pr.kind === 'oldknight') { const sv = silverAvail(); return [sv >= 15 ? 'FIFTEEN SILVER. THE KEEPER HAS A HERO FOR THAT. A HOT ONE.' : 'THREE SILVER COINS HIDE IN EVERY WOOD, TWENTY-SEVEN IN ALL. THE KEEPER TAKES THEM FOR A HERO, A BLADE AND A COAT.', PROG.hero === 'pyro' ? 'A PYROMANCER. IN MY DAY WE HAD SHIELDS. YOURS IS ON FIRE.' : 'BLOCK EARLY, PLUNGE LATE. I LIVED THIS LONG.', 'THE HIGH BOUGHS ARE MINE NO MORE. MY KNEES. GO UP FOR ME.']; }
  if (pr.kind === 'shepherd') { if (n >= need) return ['BLESS YOU, KNIGHT.', 'MIND THE OLD RAM ON THE TOP.']; if (n > 0) return ['THAT IS ' + n + ' OF MY THREE.', 'THE OTHERS WENT HIGHER.']; return ['MY THREE EWES STRAYED UP THE HILL.', 'BRING THEM AND THE FLEECE IS YOURS.']; }
  if (pr.kind === 'woodsman') { if (n >= need) return ['SWEET AS SUMMER. MY THANKS, KNIGHT.', 'MIND THE QUEEN. SHE HATES A THIEF.']; if (n > 0) return ['THAT IS ' + n + ' OF MY THREE POTS.', 'THE SETT, THE RIDGE, THE FALLEN GIANT.']; return ['THE HORNETS CARRIED OFF MY HONEY. THREE POTS.', 'BRING THEM BACK AND I WILL SEE YOU RIGHT.']; }
  if (pr.kind === 'ferryman') { const fm = movers.find(mv => mv.ferry), toll = fm ? fm.toll : 10; const pay = !fm || fm.paid ? ['HOLD ON. THE CURRENT IS QUICK TODAY.'] : PROG.coins >= toll ? [toll + ' GOLD AND I POLE YOU OVER. UP TO PAY.', 'OR BREAK THE SLUICE AND WADE. YOUR FUNERAL.'] : [toll + ' GOLD, KNIGHT. YOU HAVE ' + PROG.coins + '.', 'THE SLUICE WHEEL IS FREE. THE FROGS ARE NOT.']; const q = n >= need ? ['MY TRAPS! THERE IS A GOOD LAD.'] : n > 0 ? ['THAT IS ' + n + ' OF MY THREE TRAPS.'] : ['THE FLOOD TOOK MY EEL TRAPS. THREE OF THEM.', 'ONE IS UNDER THE CHANNEL, I SWEAR IT.']; return pay.concat(q); }
  if (pr.kind === 'hillfolk') return [['YOU CAME FOR US. I THOUGHT A GOBLIN WOULD BE THE LAST FACE I SAW.'], ['THE CELLAR DOOR WAS NEVER LOCKED. I WAS TOO FRIGHTENED TO TRY IT.'], ['TAM SAYS YOU ARE GOING UP TO THE CASTLE. SHE HAS OUR KIN UP THERE TOO.'], ['THANK YOU, KNIGHT.']][Math.min(3, pr.i || 0)];
  if (pr.kind === 'squire' && pr.bothy) return ['THIS IS AS HIGH AS I GO, KNIGHT. THE BOTHY IS WARM AND THE WIND IS NOT.', 'THE SHEPHERD\'S CHILDREN LOST THEIR KITES ON THE FIELD. BRING THEM AND THE OLD MAN WILL GIVE YOU HIS CLOAK. IT CATCHES THE WIND.', 'I WILL BE HERE WHEN YOU COME DOWN. COME DOWN.'];
  if (pr.kind === 'squire' && curId() !== 'stockade') { const cl = !!(PROG[curId()] && PROG[curId()].cleared); const T2 = TAM_LINES[curId()], TQ = TAM_QUEST[curId()];
    if (T2) return (cl ? T2[1] : T2[0]).concat(TQ ? (n >= need ? TQ[2] : n > 0 ? TQ[1](n) : TQ[0]) : []); }
  if (pr.kind === 'squire') { if (n >= need) return ['MY KIT! I OWE YOU, SIR KNIGHT.', 'THE CHIEFTAIN SWAPS WEAPONS. WATCH HIS HANDS.']; if (n > 0) return ['THAT IS ' + n + ' OF MY THREE COFFERS.', 'THE WALL, THE DITCH, THE TUNNEL.']; return ['THEY TOOK MY KIT. HELM, HORN AND BLADE.', 'THREE COFFERS. THE WALL, THE DITCH, THE TUNNEL.']; }
  if (pr.kind === 'cook') { if (n >= need) return ['THE KING\'S OWN CUPS. HE WILL MISS THEM. I WILL NOT.', 'HE DRINKS BEFORE HE THROWS. WATCH HIS HAND.']; if (n > 0) return ['THAT IS ' + n + ' OF THE THREE.', 'THE HALL, THE BURROW, THE ROOTS.']; return ['I SCOURED GORM\'S PLATE NINE YEARS. I TOOK THREE CUPS AND RAN.', 'HIS THIEVES TOOK THEM OFF ME: THE HALL, THE BURROW, THE ROOTS. BRING THEM AND I WILL SEE YOU RIGHT.']; }
  if (pr.kind === 'lamplighter') { if (n >= need) return ['EVERY LAMP BACK ON ITS POST. THE REEVE WILL HATE THAT.', 'IT WILL NOT SIT WHERE THE LIGHT IS. LIGHT THE PERCHES.']; if (n > 0) return ['THAT IS ' + n + ' OF MY THREE LAMPS.', 'THE LOW STREET, THE BOUGHS, THE LANTERN STAIR.']; return ['THE WIND TOOK THREE OF MY LAMPS UP THE BOUGHS.', 'A DARK TOWN IS THE REEVE\'S TOWN. BRING THEM BACK.']; }
  if (pr.kind === 'elder') { if (n >= need) return ['CLEAN LIGHT. THE WOOD REMEMBERS.', 'SHE HOLDS HER BREATH WHEN SHE PULLS. STRIKE WHEN SHE BREATHES OUT.']; if (n > 0) return ['THAT IS ' + n + ' OF THREE CLEAN CAPS.', 'THE CELLAR, THE CANOPY, THE BOG.']; return ['THE MOTHER IS SICK. HER SPORES ROT THE WOOD.', 'THREE CAPS STILL BURN CLEAN. BRING ME THEIR LIGHT.']; }
  return ['...'];
};
function updateMaster(e, dt) {
  // The Hound Master stays in the saddle. He is open only while the mount rears: block his charge, or loose the chained kennel hound on him.
  e.modeT -= dt; e.vy += 1000 * dt; if (e.vy > 320) e.vy = 320;
  const d = P.x - e.x, ad = Math.abs(d); const M = L.mini || { x0: 0, x1: LW * TS, floor: e.y };
  if (e.mode === 'wait') { const r = moveBody(e, 0, e.vy * dt, false); if (r.ground) e.vy = 0; return; }
  const hounds = enemies.filter(h => h.alive && h.t === 'hound' && h.pack);
  const spawnHound = (x, extra) => { const h = { t: 'hound', x, y: e.y, vx: 0, vy: -120, w: 12, h: 7, hp: EHP.hound, hp0: EHP.hound, speed: 105, face: Math.sign(P.x - x) || 1, alive: true, dying: 0, anim: Math.random(), flash: 0, stagger: 0, timer: 0, air: false, pack: true, ...extra }; enemies.push(h); burst(x, e.y - 4, 6, COLS.hound, 50, 0.4); return h; };
  const tell = (txt, col, t, mode) => { e.mode = mode; e.modeT = t; e.face = Math.sign(d) || e.face; e.vx *= 0.3; e.charging = false; number(e.x, e.y - e.h - 12, txt, col); SFX.charge(); };
  e.hitT = Math.max(0, (e.hitT || 0) - dt);
  const CD = { lashT: 2.5, leapT: 5, pincerT: 3, flankT: 9, crackT: 6 }; for (const k in CD) e[k] = e[k] === undefined ? CD[k] : e[k] - dt;
  // the turncoat reaches the mount: it rears, and he is open for a good while
  const tc = enemies.find(h => h.alive && h.t === 'hound' && h.turncoat);
  if (tc && Math.abs(tc.x - e.x) < 18 && Math.abs(tc.y - e.y) < 16 && e.mode !== 'leap' && !(tc.biteT > 0)) { tc.biteT = 3.5; e.stagger = 1.8; e.mode = 'stagger'; e.modeT = 1.8; e.vx = 0; e.charging = false; number(e.x, e.y - e.h - 12, 'THE HOUND TURNS ON HIM', '#8fd160'); SFX.yelp(); SFX.bark(); tc.retreat = 1.0; tc.vx = -(Math.sign(e.x - tc.x) || 1) * 150; }
  let want = 0;
  if (e.mode === 'stagger') { if (e.modeT <= 0) { e.mode = 'charge'; e.modeT = 0; e.stagger = 0; } }
  else if (e.mode === 'chargeTell') { if (e.modeT <= 0) { e.mode = 'charge'; e.modeT = 1.7; e.charging = true; SFX.bark(); SFX.roar(); dust(e.x, e.y, 6); } }
  else if (e.mode === 'lashTell') { e.face = Math.sign(d) || e.face; if (e.modeT <= 0) { e.mode = 'lash'; e.modeT = 0.25; SFX.slash(); if (!P.dead && Math.sign(P.x - e.x) === e.face && ad < 52 && Math.abs(P.y - e.y) < 22) { const res = damagePlayer(e.x, DMG.lash); if (res === 'blocked') { e.stagger = 0.8; e.mode = 'stagger'; e.modeT = 0.8; number(e.x, e.y - e.h - 10, 'PARRIED', '#8fd160'); } else if (res === 'hit') number(P.x, P.y - 24, 'LASHED', '#ff6b6b'); } for (const h of enemies) if (h.alive && h.turncoat && Math.sign(h.x - e.x) === e.face && Math.abs(h.x - e.x) < 52) { hurtEnemy(h, 15, e.x, false); number(h.x, h.y - 14, 'WHIPPED', '#ff6b6b'); } } }
  else if (e.mode === 'lash') { if (e.modeT <= 0) { e.mode = 'charge'; e.modeT = 0.4; e.face = Math.sign(d) || e.face; } }
  else if (e.mode === 'leapTell') { e.face = Math.sign(d) || e.face; if (e.modeT <= 0) { e.mode = 'leap'; e.modeT = 1.2; e.vy = -300; e.vx = e.face * Math.min(210, Math.max(120, ad * 1.5)); e.airT = 0; SFX.leap(); SFX.bark(); } }
  else if (e.mode === 'leap') { want = e.vx; e.airT += dt; if (e.airT > 0.15 && e.vy >= 0 && e.y >= M.floor - 1) { e.y = M.floor; e.vy = 0; e.vx = 0; shakeCam(5); SFX.thud(); dust(e.x, e.y, 10); e.stagger = 0.7; e.mode = 'landed'; e.modeT = 0.7; number(e.x, e.y - e.h - 10, 'LANDED: HIT HIM', '#8fd160'); if (!P.dead && ad < 22 && Math.abs(P.y - e.y) < 20 && P.ground) { const res = damagePlayer(e.x, DMG.master); if (res === 'hit') P.vx = (Math.sign(P.x - e.x) || 1) * 200; } } }
  else if (e.mode === 'landed') { if (e.modeT <= 0) { e.mode = 'charge'; e.modeT = 0.5; e.stagger = 0; } }
  else if (e.mode === 'pincerTell') { if (e.modeT <= 0) { e.mode = 'charge'; e.modeT = 1.2; for (const s of [-1, 1]) spawnHound(s < 0 ? M.x0 + 14 : M.x1 - 14, { pincer: true, pincerT: 0.4, speed: 165, packLife: 4.5 }); number(P.x, P.y - 30, 'JUMP', '#ffd36b'); SFX.bark(); } }
  else if (e.mode === 'flankTell') { if (e.modeT <= 0) { const side = Math.sign(P.x - e.x) || 1, fx = Math.max(M.x0 + 30, Math.min(M.x1 - 30, P.x + side * 64)); for (let i = 0; i < 2; i++) spawnHound(side > 0 ? M.x1 - 14 - i * 12 : M.x0 + 14 + i * 12, { flank: true, holdX: fx + i * 10 * side, holdT: 3, packLife: 6 }); number(P.x, P.y - 30, 'DRIVEN', '#c080ff'); e.mode = 'chargeTell'; e.modeT = 0.7; e.face = side; number(e.x, e.y - e.h - 12, 'CHARGE', '#ff6b6b'); } }
  else if (e.mode === 'crackTell') { if (e.modeT <= 0) { e.mode = 'crack'; e.modeT = 0.45; SFX.slash(); SFX.heavy(); shakeCam(3); waves.push({ x: e.x + e.face * 16, y: M.floor, dir: e.face, life: 1.8, sp: 170 }); number(e.x, e.y - e.h - 12, 'CRACK', '#ff9a5c'); } }
  else if (e.mode === 'crack') { if (e.modeT <= 0) { e.mode = 'charge'; e.modeT = 0.4; } }
  else { // between moves he paces; every move has a tell and a name
    if (e.modeT <= 0 && !P.dead) {
      if (e.pincerT <= 0 && hounds.length < 3) { e.pincerT = 9; tell('PINCER', '#c080ff', 0.75, 'pincerTell'); SFX.bird(); }
      else if (e.flankT <= 0 && hounds.length < 2) { e.flankT = 13; tell('FLANK', '#c080ff', 0.6, 'flankTell'); SFX.bird(); }
      else if (e.lashT <= 0 && ad < 56 && Math.abs(P.y - e.y) < 24) { e.lashT = 3.2; tell('!', '#ffd36b', 0.4, 'lashTell'); }
      else if (e.crackT <= 0 && ad > 60 && ad < 220) { e.crackT = 6.5; tell('WHIP', '#ff9a5c', 0.5, 'crackTell'); }
      else if (e.leapT <= 0 && ad < 110) { e.leapT = 7.5; tell('!!', '#ff6b6b', 0.5, 'leapTell'); }
      else { tell('CHARGE', '#ff6b6b', 0.5, 'chargeTell'); }
    }
    if (e.charging) {
      want = e.face * e.speed;
      if (!P.dead && ad < 16 && Math.abs(P.y - e.y) < 20 && e.hitT <= 0) { e.hitT = 0.6; const res = damagePlayer(e.x, DMG.master); if (res === 'blocked') { e.mode = 'stagger'; e.modeT = 1.9; e.stagger = 1.9; e.vx = -e.face * 60; e.charging = false; number(e.x, e.y - e.h - 10, 'THE HOUND REARS: HIT HIM', '#8fd160'); SFX.yelp(); } else if (res === 'hit') { P.vx = e.face * 220; } }
    } else want = 0;
    if (e.stagger > 0) want = 0;
  }
  if (e.mode !== 'leap') e.vx += (want - e.vx) * Math.min(1, dt * 6);
  if (e.mode === 'leap') { e.x += e.vx * dt; e.y += e.vy * dt; if (e.y > M.floor) e.y = M.floor; }
  else { const r = moveBody(e, e.vx * dt, e.vy * dt, false); if (r.ground) e.vy = 0; if (r.hitX && e.mode === 'charge' && e.charging) { e.charging = false; e.modeT = 0.2; e.vx = 0; dust(e.x, e.y, 6); } }
  if (e.mode === 'charge' && e.charging && e.modeT <= 0) e.charging = false;
  e.x = Math.max(M.x0 + 12, Math.min(M.x1 - 12, e.x));
}
// ---------- boss: King Gorm Underleaf ----------
function updateKing(e, dt) {
  const A = L.arena, floor = A.floor, d = P.x - e.x, ad = Math.abs(d); e.modeT -= dt; e.anim += dt;
  if (e.mode === 'sleep') { e.y = floor - 9; return; }
  if (e.mode === 'wake') { if (e.modeT <= 0) { e.mode = 'carried'; e.modeT = 0.5; } return; }
  const climbing = !P.dead && P.y < floor - 40; // you are up on the scaffold: he reaches for whatever is near
  const goblet = (skull = false) => { const sx = e.x + e.face * 20, sy = e.y - 30, Tf = skull ? 0.95 : 0.8, G = 380, dx = P.x - sx, dy = (P.y - 8) - sy; seeds.push({ x: sx, y: sy, vx: Math.max(-240, Math.min(240, dx / Tf)), vy: dy / Tf - 0.5 * G * Tf, dead: false, life: 3, g: G, goblet: true, skull }); if (skull) { SFX.throwWhoosh(); SFX.effort(); } else SFX.clank(); e.throwT = 0.35; };
  // THE ROYAL ARCHERS: stay up on the winch decks and he calls bowmen onto the roof perches at both ends; they lob arrows the length of the hall, a parried arrow knocks one down, and they go when you come down
  { const high = !P.dead && P.y < floor - 110, bows = enemies.filter(q => q.alive && q.bowman); e.highT = high ? Math.min(4, (e.highT || 0) + dt) : Math.max(0, (e.highT || 0) - dt); e.bowT = Math.max(0, (e.bowT || 0) - dt);
    if (e.highT > 2 && e.bowT <= 0 && !bows.length && e.mode !== 'held') { e.bowT = 11; SFX.hornBlast(); number(e.x, e.y - e.h - 16, '!!', '#ffd36b'); for (const px0 of [A.x0 + 7.5 * TS, A.x1 - 2.5 * TS]) { enemies.push({ t: 'archer', x: px0, y: 3 * TS - 18, vx: 0, vy: 0, w: 8, h: 10, hp: EHP.archer, speed: 0, face: Math.sign(P.x - px0) || 1, alive: true, dying: 0, anim: 0, flash: 0, stagger: 0, timer: 1.2 + Math.random() * 0.6, draw: 0, bowman: true, life: 16 }); burst(px0, 3 * TS - 6, 8, ['#c9b27c', '#8a5a32'], 60, 0.4); } }
    for (const q of bows) { q.life -= dt; if (q.life <= 0 || (!high && e.highT <= 0)) { q.alive = false; burst(q.x, q.y - 6, 8, ['#c9b27c', '#6faa4a'], 60, 0.4); } } }
  e.skullT = Math.max(0, (e.skullT || 0) - dt); if (climbing && e.skullT <= 0 && e.mode !== 'held' && e.mode !== 'wake' && e.mode !== 'sleep' && e.mode !== 'rise') { e.skullT = 5; goblet(true); }
  // THE GRAB: he reaches, and if the hand finds you it hurls you the length of the hall. Unblockable: dodge it, or be above it.
  const grab = () => { const reach = e.phase === 3 ? 74 : 62; if (!P.dead && Math.sign(P.x - e.x) === e.face && ad > 8 && ad < reach && P.y > e.y - 26 && P.y <= e.y + 4) { const res = damagePlayer(e.x, DMG.grab, { unblockable: true }); if (res === 'hit') { P.vx = e.face * 420; P.vy = -300; P.hurt = 0.7; P.ground = false; P.block = false; SFX.throwWhoosh(); SFX.bellow(); shakeCam(6); zoomKick(1.12, 0.3); } } };
  e.throwT = Math.max(0, (e.throwT || 0) - dt);
  e.open = Math.max(0, (e.open || 0) - dt);
  if (e.mode === 'held') { if (e.modeT <= 0) { e.mode = e.phase >= 2 ? 'walk' : 'carried'; e.modeT = 0.6; e.stagger = 0; e.open = 7; number(e.x, e.y - e.h - 16, 'HIS HEAD IS UP. HE IS OPEN', '#8fd160'); SFX.sting(); } return; } // after the cage he takes the blade like anyone for a while
  if (e.phase === 1) { // carried: the wheeled litter paces the hall, then CHARGES it; goblets, guards, and the hand if you stand close
    e.y = floor - 9;
    if (e.mode === 'chargeTell') { e.face = Math.sign(d) || e.face; if (e.modeT <= 0) { e.mode = 'charge'; e.modeT = 1.5; e.cdir = Math.sign(d) || e.dir; e.chargeHit = false; SFX.bellow(); SFX.rattle(1); } return; }
    if (e.mode === 'charge') { e.x += e.cdir * 250 * dt; e.face = e.cdir; if (Math.random() < dt * 30) parts.push({ x: e.x - e.cdir * 30, y: e.y + 8, vx: -e.cdir * 60, vy: -30, life: 0.3, max: 0.3, col: '#c9b27c', size: 2, grav: 200 });
      if (!e.chargeHit && !P.dead && ad < 36 && P.y > e.y - 30 && P.y <= e.y + 12) { e.chargeHit = true; damagePlayer(e.x, DMG.litter, { unblockable: true, up: true }); P.vx = e.cdir * 300; P.vy = -180; P.ground = false; number(P.x, P.y - 24, 'RUN DOWN', '#ff6b6b'); shakeCam(5); }
      if (e.x <= A.x0 + 50 || e.x >= A.x1 - 50 || e.modeT <= 0) { e.x = Math.max(A.x0 + 50, Math.min(A.x1 - 50, e.x)); e.mode = 'carried'; e.modeT = 0.9; e.dir = -e.cdir; shakeCam(6); SFX.heavy(); SFX.crack(); dust(e.x + e.cdir * 30, floor, 10); } return; }
    if (e.mode === 'grabTell') { e.face = Math.sign(d) || e.face; if (e.modeT <= 0) { e.mode = 'grab'; e.modeT = 0.3; e.grabT = 6; grab(); } return; }
    if (e.mode === 'grab') { if (e.modeT <= 0) { e.mode = 'carried'; e.modeT = 0.5; } return; }
    e.chargeT = (e.chargeT === undefined ? 5 : e.chargeT - dt); e.grabT -= dt;
    if (e.mode === 'carried' && e.modeT <= 0 && !P.dead) { if (e.chargeT <= 0 && ad > 40 && Math.abs(P.y - floor) < 40) { e.mode = 'chargeTell'; e.modeT = 0.7; e.chargeT = 7; number(e.x, e.y - 40, '!!', '#ff6b6b'); SFX.kingLaugh(); return; } if (e.grabT <= 0 && ad > 8 && ad < 62 && P.y > e.y - 26 && P.y <= e.y + 4) { e.mode = 'grabTell'; e.modeT = 0.8; SFX.charge(); return; } }
    e.face = Math.sign(d) || e.face; e.x += e.dir * 36 * dt; if (e.x < A.x0 + 60) e.dir = 1; if (e.x > A.x1 - 60) e.dir = -1;
    e.gobletT -= dt; if (e.gobletT <= 0) { e.gobletT = climbing ? 2.2 : 2.6; goblet(); }
    e.summonT -= dt; if (e.summonT <= 0 && enemies.filter(g => g.alive && g.t === 'shield' && g.guard).length < 2) { e.summonT = 12; SFX.roar(); for (const sx of [A.x0 + 20, A.x1 - 20]) enemies.push({ t: 'shield', x: sx, y: floor, vx: 0, vy: -100, w: 12, h: 14, hp: EHP.shield, speed: 24, face: Math.sign(P.x - sx) || 1, alive: true, dying: 0, anim: 0, flash: 0, stagger: 0.4, guard: true, turnT: 0 }); }
    return;
  }
  // phase 3: he stands. A walker whose every step shakes the roof down; the slam, the shout, the grab, the cages, and once, the throne.
  e.vy = (e.vy || 0) + 1000 * dt; if (e.vy > 300) e.vy = 300; let want = 0;
  if (e.mode === 'rise') { if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.4; e.h = 60; e.throne = e.throne || { x: e.x, y: floor }; e.throneT = 9; } }
  else if (e.mode === 'walk') { e.face = Math.sign(d) || e.face; want = ad > 30 ? e.face * (e.phase === 3 ? 62 : 44) : 0; e.shoutT -= dt; e.grabT -= dt; e.cageT -= dt; e.throneT -= dt; e.gobletT -= dt; if (climbing && e.gobletT <= 0) { e.gobletT = 2.4; goblet(); }
    const wantsThrone = e.phase === 3 && e.throneT <= 0 && e.throne && !e.thrown && !e.throneDone;
    if (wantsThrone) { const td = e.throne.x - e.x; if (Math.abs(td) > 14) { want = Math.sign(td) * 60; e.face = Math.sign(td); } else { e.mode = 'liftTell'; e.modeT = 1.0; SFX.charge(); want = 0; } }
    else if (e.modeT <= 0 && ad < 46) { e.mode = 'slamTell'; e.modeT = 0.7; SFX.charge(); }
    else if (e.grabT <= 0 && ad > 24 && ad < 100 && Math.abs(P.y - e.y) < 30) { e.mode = 'grabTell'; e.modeT = 0.7; SFX.charge(); }
    else if (e.shoutT <= 0 && ad < 110) { e.mode = 'shoutTell'; e.modeT = 0.9; SFX.charge(); }
    else if (e.cageT <= 0 && props.some(c => c.t === 'dropcage' && c.boss && !c.dropped && Math.abs(c.x - P.x) < 40)) { e.mode = 'cageTell'; e.modeT = 0.45; } }
  else if (e.mode === 'grabTell') { if (e.modeT <= 0) { e.mode = 'grab'; e.modeT = 0.3; e.grabT = 4.5; grab(); } }
  else if (e.mode === 'grab' && e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.6; }
  else if (e.mode === 'shoutTell' && e.modeT <= 0) { e.mode = 'shout'; e.modeT = 0.4; e.shoutT = 7; SFX.roar(); shakeCam(5); ringAt(e.x, e.y - 30, 90, '#ffd36b', 0.4); if (!P.dead && ad < 100 && Math.abs(P.y - e.y) < 60) { damagePlayer(e.x, DMG.shout, { unblockable: true }); P.vx = (Math.sign(P.x - e.x) || 1) * 240; P.vy = -150; } }
  else if (e.mode === 'shout' && e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.6; }
  else if (e.mode === 'cageTell' && e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.6; e.cageT = 7; kingCage(e); }
  else if (e.mode === 'slamTell' && e.modeT <= 0) { e.mode = 'slam'; e.modeT = 0.4; shakeCam(7); SFX.heavy(); zoomKick(1.1, 0.25); dust(e.x + e.face * 26, e.y, 14); for (const dd of [-1, 1]) waves.push({ x: e.x + dd * 30, y: floor, dir: dd, life: 1.6, sp: 160 }); if (!P.dead && Math.sign(P.x - e.x) === e.face && ad < 52 && Math.abs(P.y - e.y) < 24) damagePlayer(e.x, DMG.kingSlam, { unblockable: true }); }
  else if (e.mode === 'slam' && e.modeT <= 0) { e.mode = 'walk'; e.modeT = 1.1; }
  else if (e.mode === 'liftTell' && e.modeT <= 0) { e.mode = 'hurl'; e.modeT = 0.35; e.face = Math.sign(d) || e.face; e.thrown = { x: e.x, y: e.y - 70, vx: e.face * 230, vy: -220, hit: false }; e.throne = null; e.throneDone = true; SFX.throwWhoosh(); SFX.bellow(); shakeCam(4); }
  else if (e.mode === 'hurl' && e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.8; }
  // the thrown throne: an arc, then a landing that stays
  if (e.thrown) { const t = e.thrown; t.vy += 700 * dt; t.x += t.vx * dt; t.y += t.vy * dt; if (!t.hit && !P.dead && Math.abs(P.x - t.x) < 34 && P.y > t.y - 40 && P.y < t.y + 8) { t.hit = true; damagePlayer(t.x, DMG.throne, { unblockable: true, up: true }); } if (t.x < A.x0 + 36) { t.x = A.x0 + 36; t.vx = 0; } if (t.x > A.x1 - 36) { t.x = A.x1 - 36; t.vx = 0; } if (t.vy > 0 && t.y >= floor) { landThrone(t.x); e.thrown = null; } }
  // THE STRIDE: every footfall shakes a chandelier off the roof, near you
  if (e.phase === 3 && e.mode === 'walk') { e.courtT = (e.courtT === undefined ? 4 : e.courtT - dt); if (e.courtT <= 0 && enemies.filter(q => q.alive && q.court2).length < 3) { e.courtT = 11; number(e.x, e.y - e.h - 16, 'HE CALLS THE COURT', '#ffd36b'); SFX.roar(); SFX.laugh(); for (const gx of [A.x0 + 40, A.x1 - 40]) enemies.push({ t: 'sprig', x: gx, y: floor - 100, vx: 0, vy: 0, w: 8, h: 10, hp: EHP.sprig, speed: 50, face: Math.sign(P.x - gx) || 1, alive: true, dying: 0, anim: Math.random(), flash: 0, stagger: 0.4, court2: true }); if (Math.random() < 0.5) enemies.push({ t: 'shield', x: e.x + e.face * -40, y: floor - 100, vx: 0, vy: 0, w: 12, h: 14, hp: EHP.shield, speed: 24, face: e.face, alive: true, dying: 0, anim: 0, flash: 0, stagger: 0.4, guard: true, turnT: 0, court2: true }); } }
  if (false && e.phase === 3 && e.mode === 'walk' && Math.abs(e.vx) > 20 && e.grounded) { e.stepT -= dt; if (e.stepT <= 0) { e.stepT = 0.55; shakeCam(3); SFX.thud(); dust(e.x - e.face * 12, e.y, 6); const rx = Math.max(A.x0 + 16, Math.min(A.x1 - 16, P.x + (Math.random() - 0.5) * 60 + P.vx * 0.3)); rocks.push({ x: rx, y: floor - 170, vx: 0, vy: 0, t: 0, dead: false, thrown: true, lamp: true }); burst(rx, floor - 172, 4, ['#5a5a66', '#8a8478'], 30, 0.4); } }
  if (e.stagger > 0 && e.mode !== 'slam') want = 0;
  e.vx += (want - e.vx) * Math.min(1, dt * 6);
  const r = moveBody(e, e.vx * dt, e.vy * dt, false); if (r.ground) e.vy = 0; e.grounded = !!r.ground;
  e.x = Math.max(A.x0 + 30, Math.min(A.x1 - 30, e.x));
}
// The litter lands and stays: four tiles of solid oak you can climb onto to be above the reach of the hand.
function landThrone(x) { const A = L.arena, ty = Math.floor(A.floor / TS) - 1, tx0 = Math.max(Math.floor(A.x0 / TS) + 1, Math.min(Math.floor(A.x1 / TS) - 5, Math.floor(x / TS) - 2)); for (let dx = 0; dx < 4; dx++) for (let dy = 0; dy < 2; dy++) { const i = (ty - dy) * LW + tx0 + dx; L.grid[i] = T.SOLID; tileSpr[i] = null; } throneBlock = { x: (tx0 + 2) * TS, y: (ty + 1) * TS }; shakeCam(9); SFX.heavy(); SFX.crack(); zoomKick(1.12, 0.4); dust((tx0 + 2) * TS, (ty + 1) * TS, 20); for (const f of enemies) if (f.alive && f.t !== 'king' && f.t !== 'folk' && Math.abs(f.x - (tx0 + 2) * TS) < 40 && Math.abs(f.y - (ty + 1) * TS) < 20) hurtEnemy(f, 60, x, false); if (!P.dead && P.x > tx0 * TS - 6 && P.x < (tx0 + 4) * TS + 6 && P.y > ty * TS - 20 && P.y <= (ty + 1) * TS + 2) { P.y = (ty - 1) * TS; P.vy = -120; } }
function kingCage(e) { let best = null; for (const c of props) if (c.t === 'dropcage' && c.boss && !c.dropped && Math.abs(c.x - e.x) > 44 && (!best || Math.abs(c.x - P.x) < Math.abs(best.x - P.x))) best = c; if (!best) return; best.dropped = true; best.landed = 0; best.hit.clear(); best.resetT = 5; SFX.stone(); number(best.x, best.y - 10, 'HOLD HIM', '#ff6b6b'); }
function galleryVolley(e) { let n = 0; for (const f of enemies) if (f.alive && f.t === 'folk' && f.court && !f.cower && Math.random() < 0.7) { const sx = f.x, sy = f.y - 8, Tf = 0.9, G = 380, dx = P.x - sx, dy = (P.y - 8) - sy; seeds.push({ x: sx, y: sy, vx: Math.max(-200, Math.min(200, dx / Tf)), vy: dy / Tf - 0.5 * G * Tf, dead: false, life: 3, g: G, goblet: true }); n++; } if (n) { number(e.x, e.y - 44, 'THE COURT JOINS IN', '#ffd36b'); SFX.clank(); } }
// THE ALARM. A castle section (L.alarms) has a bell, its gates and a garrison. A sentry who sees you runs
// for the bell; a rung bell drops that section's gates and turns the garrison out, and the gates lift again
// only when the garrison is down. Catch the sentry, or break the bell, and the hall stays quiet.
function raiseAlarm(id) {
  const sec = (L.alarms || []).find(a => a.id === id); if (!sec || sec.on || sec.done) return;
  sec.on = true; sec.onT = 0; SFX.thunder(); SFX.clank(); SFX.bellow(); shakeCam(5); flash = Math.max(flash, 0.18);
  for (const [col, y0, y1] of sec.gates) closeGate(col, y0, y1);
  for (const gd of sec.garrison) { const n0 = enemies.length; spawnEnt({ t: gd.t, x: gd.x, y: gd.y, face: gd.face || -1 }); for (let i = n0; i < enemies.length; i++) enemies[i].garrison = id; burst(gd.x * TS + 8, gd.y * TS, 8, ['#5a2a7a', '#e0b040'], 50, 0.4); }
}
function updateAlarms(dt = 1 / 60) {
  // the gates lift when the garrison is down, or after twenty seconds whatever is left of it:
  // a garrison turned out on the far side of its own gate, or stuck in a pit, used to shut the hall for good
  for (const sec of (L.alarms || [])) if (sec.on && !sec.done) sec.onT = (sec.onT || 0) + dt;
  for (const sec of (L.alarms || [])) if (sec.on && !sec.done && (sec.onT > 20 || !enemies.some(e => e.alive && e.garrison === sec.id))) {
    sec.done = true; SFX.medal();
    for (const [col, y0, y1] of sec.gates) openGate(col, y0, y1);
  }
}
// dying puts the castle back: gates the alarm dropped go up (the section can be woken again), winch gates go down
function resetCastle() {
  for (const sec of (L.alarms || [])) if (sec.on && !sec.done) { sec.on = false; for (const [col, y0, y1] of sec.gates) for (let ty = y0; ty <= y1; ty++) { const i = ty * LW + col; if (L.grid[i] === T.PORT) { L.grid[i] = T.AIR; tileSpr[i] = null; } } }
  for (const pr of props) if (pr.t === 'weight') { pr.state = 'hang'; pr.hitE = null; pr.hitP = false; pr.vy = 0; } // the counterweights are wound back up
  for (const e of (L.ents || [])) if (e.t === 'winch') for (let ty = e.gy0; ty <= e.gy1; ty++) { const i = ty * LW + e.gate; if (L.grid[i] === T.AIR) { L.grid[i] = T.PORT; tileSpr[i] = TILE.port[(ty + e.gate) % 2]; } }
  // the Queen's hall goes back as it was: gallery floor, roof and all, and the rubble she brought down is gone
  if (L.arena && L.arena.boss === 'gqueen') { const A = L.arena; L.galleryDown = false; L.windowsOut = false; A.holeOpen = false;
    for (const i of (A.laid || [])) { L.grid[i] = T.AIR; grid0[i] = T.AIR; tileSpr[i] = null; } A.laid = [];
    for (const [i, t0] of (A.taken || new Map())) { L.grid[i] = t0; tileSpr[i] = null; destroyed.delete(i); } A.taken = new Map(); }
  resolveTiles();
}
function updateSentry(e, dt) {
  e.modeT -= dt; e.vy += 1000 * dt; if (e.vy > 300) e.vy = 300;
  const d = P.x - e.x, ad = Math.abs(d), level = Math.abs(P.y - e.y) < 40;
  const sec = (L.alarms || []).find(a => a.id === e.section), bell = props.find(p => p.t === 'bell' && p.section === e.section && !p.broken);
  const live = sec && bell && !sec.on && !sec.done;
  let want = 0; e.ringing = false;
  if (e.mode === 'patrol') {
    if (e.modeT <= 0) { e.modeT = 2 + Math.random() * 2; e.face = -e.face; }
    if (Math.abs(e.x - e.hx) > e.range) e.face = Math.sign(e.hx - e.x) || e.face;
    want = e.face * 26;
    const sees = !P.dead && level && ad < 150 && (Math.sign(d) === e.face || ad < 34);
    if (sees && live) { e.mode = 'spot'; e.modeT = 0.45; SFX.yelp(); number(e.x, e.y - 16, '!', '#ff6b6b'); }
    else if (sees && ad < 70) e.mode = 'fight';
  } else if (e.mode === 'spot') { e.face = Math.sign(d) || e.face; if (e.modeT <= 0) e.mode = live ? 'run' : 'fight'; }
  else if (e.mode === 'run') {
    if (!live) e.mode = 'fight';
    else { const dx = bell.x - e.x; e.face = Math.sign(dx) || e.face; want = e.face * 86;
      if (Math.abs(dx) < 8) { want = 0; e.ringing = true; bell.ringT = (bell.ringT || 0) + dt; bell.swing = 0.3; if (Math.random() < dt * 7) SFX.clank(); if (bell.ringT > 1.0) { ringBell(bell); e.mode = 'fight'; } } }
  } else { e.face = Math.sign(d) || e.face; want = level && ad > 8 ? e.face * 52 : 0; }
  if (e.stagger > 0) want = 0;
  e.vx += (want - e.vx) * Math.min(1, dt * 8);
  // on patrol he turns at a drop instead of walking off it
  if (e.mode === 'patrol') { const ax = Math.floor((e.x + e.face * 6) / TS), fy = Math.floor((e.y + 1) / TS); if (!isSolid(ax, fy) && !isOneWay(tileAt(ax, fy))) { e.face = -e.face; e.vx = 0; } }
  const r = moveBody(e, e.vx * dt, e.vy * dt, false); if (r.ground) e.vy = 0; if (r.hitX && e.mode === 'patrol') e.face = -e.face;
}
// THE SKY ROAD. At the edge of Gale Moor a great kite is tethered to a post. Take hold and it hauls you up
// over the wall and away down the wind: the view goes on without you, you steer through the stone and the
// crows and the storm, and you cannot fall behind - the edge of the view pushes you on, and a rock face in
// front of you with the edge behind you crushes. The storm cuts the string over the summit and drops you on
// the shaman. (The sword is no use up here: both hands are on the kite. The roll is a dart.)
let flight = null;
const freeAt = (x, y) => { for (let ty = Math.floor((y - 13) / TS); ty <= Math.floor((y - 1) / TS); ty++) for (let tx = Math.floor((x - 5) / TS); tx <= Math.floor((x + 5) / TS); tx++) if (isSolid(tx, ty)) return false; return true; };
function collectAcorn(a) { a.got = true; got++; coinCombo = coinComboT > 0 ? coinCombo + 1 : 0; coinComboT = 1.2; SFX.coinUp(Math.min(coinCombo, 10)); if (a.crate) collectedCrates.add(a.crate); burst(a.x, a.y, 6, ['#ffd36b', '#fff6c8'], 40, 0.35, -40, 1); flyCoins.push({ x: a.x - camX, y: a.y - 5 - camY, t: 0 }); }
function startFlight(pr) {
  const F = L.flight; if (!F || flight) return;
  flight = { cx: camX, cy: camY, lift: 1.3, F }; P.fly = true;
  Object.assign(P, { vx: 0, vy: -60, atk: -1, plunge: false, block: false, onMover: null, dodge: 0, jet: false, cling: false, ground: false });
  SFX.leap(); SFX.throwWhoosh(); shakeCam(3); number(P.x, P.y - 30, 'HOLD ON', '#bfe6f5');
}
function endFlight(cut) {
  if (!flight) return; const kx = P.x - 4, ky = P.y - 58;
  P.fly = false; flight = null; P.vx = 0; P.vy = -40; P.jbuf = 0; P.abuf = 0; P.dbuf = 0; P.coyote = 0; P.canCut = false; P.dodge = 0;
  if (cut) { bolts.push({ x: kx + 4, y: ky + 40, life: 0.35, storm: true }); SFX.thunder(); shakeCam(8); flash = Math.max(flash, 0.35); number(P.x, P.y - 34, 'THE STRING GOES', '#dfe8ff');
    for (let i = 0; i < 18; i++) parts.push({ x: kx + (Math.random() - 0.5) * 24, y: ky + (Math.random() - 0.5) * 20, vx: 40 + Math.random() * 90, vy: -30 - Math.random() * 60, life: 1.4, max: 1.4, col: Math.random() < 0.5 ? '#c9463d' : '#ffd36b', size: 2, grav: 60 }); }
}
function unpin(lx) { // the nearest open air at the front of the view
  for (let d = 0; d < VH; d += 6) for (const s of [1, -1]) { const x = Math.max(lx + 50, P.x + 30), y = P.y + s * d; if (y > flight.cy + 26 && y < flight.cy + VH - 6 && freeAt(x, y)) { P.x = x; P.y = y; P.vx = flight.F.speed; P.vy = 0; return; } } }
function flyPlayer(dt) {
  const F = flight.F, endCx = F.x1 * TS - VW * 0.45;
  if (flight.lift > 0) flight.lift -= dt; else flight.cx = Math.min(endCx, flight.cx + F.speed * dt);
  flight.cy += (F.camY * TS - flight.cy) * Math.min(1, dt * 2.2);
  const ax = (keys.right ? 1 : 0) - (keys.left ? 1 : 0), ay = (keys.down ? 1 : 0) - ((keys.up || keys.jump) ? 1 : 0);
  const atEnd = flight.cx >= endCx - 1, drift = flight.lift > 0 ? 0 : atEnd ? 150 : F.speed;
  let tvx = drift + ax * 125, tvy = flight.lift > 0 ? -200 : ay * 120;
  tvx += windAt(P.x, P.y - 8) * 70;
  for (const z of (F.down || [])) if (P.x > z[0] * TS && P.x < z[1] * TS) tvy += z[2];
  P.dodgeCd = Math.max(0, (P.dodgeCd || 0) - dt); P.stDelay = Math.max(0, P.stDelay - dt); if (P.stDelay <= 0 && P.st < P.maxSt) P.st = Math.min(P.maxSt, P.st + ST.regen * dt);
  if (dodgePress && P.dodgeCd <= 0 && flight.lift <= 0) { if (spend(dodgeCost())) { P.dodge = 0.22; P.dodgeCd = 0.55; P.inv = Math.max(P.inv, 0.3); P.vx = drift + (ax || 1) * 270; P.vy = ay * 220; SFX.pDodge(); } }
  if (P.dodge > 0) { P.dodge -= dt; ghosts.push({ x: P.x, y: P.y, face: P.face, life: 0.2, frame: 0 }); }
  else { P.vx += (tvx - P.vx) * Math.min(1, dt * 6); P.vy += (tvy - P.vy) * Math.min(1, dt * 6); }
  P.face = ax || 1; P.anim += dt;
  moveBody(P, P.vx * dt, P.vy * dt, true); P.ground = false;
  const lx = flight.cx + 10, rx = flight.cx + VW - 10, ty = flight.cy + 24, by = flight.cy + VH - 6;
  if (P.x < lx) { moveBody(P, lx - P.x, 0, true); if (P.x < lx - 1) { if (!(P.inv > 0)) { damagePlayer(P.x - 12, DMG.crush, { unblockable: true }); P.inv = Math.max(P.inv, 1.2); } if (!P.dead) unpin(lx); } }
  if (P.x > rx) P.x = rx; if (P.y < ty) moveBody(P, 0, ty - P.y, true); if (P.y > by) moveBody(P, 0, by - P.y, true);
  // the blade works up here too: one hand on the kite, one on the sword
  P.abuf = Math.max(0, (P.abuf || 0) - dt);
  if (P.abuf > 0 && P.atk < 0 && flight.lift <= 0) { P.abuf = 0; if (spend(P.relic === 'gauntlet' ? 0 : isPaladin() ? 22 : sword().cost)) { P.atk = 0; P.hitSet.clear(); SFX.pSlash(); P.swingMul = 1; P.heavySwing = false; } }
  if (P.atk >= 0) { P.atk += dt * (isPaladin() ? 0.56 : 1); if (P.atk > 0.3) P.atk = -1; }
  { const hb = attackBox(); if (hb) for (const e of enemies) { if (!e.alive || P.hitSet.has(e) || e.gone > 0 || !overlap(hb, box(e))) continue; P.hitSet.add(e); hurtEnemy(e, swingDmg(e), P.x, false); swordEffect(e); if (isPaladin()) gainLight(8); } }
  // what you fly into: crows and kite goblins by touch, and the gold
  const pb = box(P);
  for (const e of enemies) if (e.alive && (e.t === 'crow' || e.t === 'kite') && overlap(pb, box(e))) { const res = damagePlayer(e.x, DMG[e.t] || 12); if (res === 'hit' && e.t === 'crow') { e.alive = false; burst(e.x, e.y, 6, COLS.crow, 50, 0.4); } }
  for (const a of acorns) if (!a.got && Math.abs(a.x - P.x) < 12 && Math.abs(a.y - (P.y - 7)) < 14) collectAcorn(a);
  if (!P.dead && P.x >= F.x1 * TS) endFlight(true);
  if (Math.random() < dt * 24) parts.push({ x: P.x - 8 - Math.random() * 30, y: P.y - 44 + (Math.random() - 0.5) * 30, vx: -140, vy: 0, life: 0.3, max: 0.3, col: '#eefaff', size: 1, grav: 0 });
}
function updateSkyProps(dt) {
  for (const pr of props) {
    if (pr.t === 'npc' && pr.walkTo !== undefined) { const dx = pr.walkTo - pr.x; pr.x += Math.sign(dx) * 55 * dt; if (Math.abs(dx) < 3) { burst(pr.x, pr.y - 10, 10, ['#fff6c8', '#ffd36b'], 40, 0.5, -20, 1); pr.t = 'gone'; } continue; } // a freed prisoner going out of the door
    if (pr.t === 'stormkite') { pr.ph += dt; if (!P.fly && !P.dead && !flight && Math.abs(P.x - pr.x) < 16 && Math.abs(P.y - pr.y) < 30) startFlight(pr); }
    else if (pr.t === 'skybolt') { if (pr.x < camX - 24 || pr.x > camX + VW + 24) { pr.tk = undefined; pr.tell = false; continue; }
      if (pr.tk === undefined) pr.tk = pr.phase; pr.tk += dt; const cyc = pr.tk % pr.period; pr.tell = cyc > pr.period - 0.9;
      if (pr.lastC !== undefined && cyc < pr.lastC) { bolts.push({ x: pr.x, y: pr.y1, life: 0.35, storm: true }); SFX.thunder(); shakeCam(4); flash = Math.max(flash, 0.15);
        if (!P.dead && Math.abs(P.x - pr.x) < 13 && P.y > pr.y0 && P.y - 14 < pr.y1) damagePlayer(pr.x, DMG.skybolt, { unblockable: true }); }
      pr.lastC = cyc; }
  }
}
function drawBigKite(x, y, ph) { // the great kite: red and gold, a bow tail
  g.fillStyle = '#c9463d'; g.beginPath(); g.moveTo(x, y - 18); g.lineTo(x + 13, y); g.lineTo(x, y + 20); g.lineTo(x - 13, y); g.closePath(); g.fill();
  g.fillStyle = '#ffd36b'; g.beginPath(); g.moveTo(x, y - 18); g.lineTo(x + 13, y); g.lineTo(x, y); g.closePath(); g.fill(); g.beginPath(); g.moveTo(x, y + 20); g.lineTo(x - 13, y); g.lineTo(x, y); g.closePath(); g.fill();
  g.strokeStyle = '#1b1626'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y - 18); g.lineTo(x + 13, y); g.lineTo(x, y + 20); g.lineTo(x - 13, y); g.closePath(); g.stroke(); g.fillStyle = '#3a2618'; g.fillRect(x, y - 18, 1, 38); g.fillRect(x - 13, y, 26, 1);
  for (let k = 1; k <= 6; k++) { g.fillStyle = k % 2 ? '#ffd36b' : '#c9463d'; g.fillRect(Math.round(x - 1 + Math.sin(ph * 6 + k) * (2 + k * 0.6)) - k * 2, y + 20 + k * 5, 3, 3); }
}
// Where a spider waits, drawn over the dusk grade so the silk stays white: her orb web at the anchor, a dotted drop-line
// the whole way down, and a sheet of silk on the floor where she lands. You can read it from below when she is off the top of the screen.
function drawSpiderSigns(cx, cy) {
  for (const e of enemies) {
    if (!e.alive || e.t !== 'spider' || e.big) continue;
    if (e.gwy === undefined) { const tx = Math.floor(e.x / TS); let ty = Math.floor(e.restY / TS) + 1; const lim = Math.floor((e.restY + e.drop + 40) / TS); while (ty <= lim && !isSolid(tx, ty) && !isOneWay(tileAt(tx, ty))) ty++; e.gwy = ty <= lim ? ty * TS : null; }
    const wx = Math.round(e.x - cx), ay = Math.round(e.restY - 22 - cy), gy = e.gwy ? Math.round(e.gwy - cy) : null;
    if (wx < -30 || wx > VW + 30) continue;
    const near = Math.abs(P.x - e.x) < 40, k = near ? 0.75 + 0.25 * Math.sin(time * 10) : 0.6;
    if (ay > -20 && ay < VH + 20) { g.globalAlpha = 0.85; g.drawImage(PROP.orbWeb, wx - 14, ay - 14); }
    if (gy !== null) {
      g.globalAlpha = 0.3 * k + 0.1; g.fillStyle = '#f4f0ff'; for (let y = Math.max(0, Math.round(e.y - cy) + 4); y < gy - 6; y += 4) g.fillRect(wx, y, 1, 2);
      g.globalAlpha = k; g.drawImage(PROP.groundWeb, wx - 11, gy - 7);
    }
    g.globalAlpha = 1;
  }
}
function drawMillTower(m, cx, cy) {
  if (m.footY === undefined) { const tx = Math.floor(m.px / TS); let ty = Math.floor(m.py / TS) + 1; while (ty < LH && !isSolid(tx, ty)) ty++; m.footY = ty * TS; const pl = (L.pools || []).find(p => p.shallow && m.px > p.x0 && m.px < p.x1); m.doorY = pl ? Math.min(m.footY, pl.y) : m.footY; } /* the tower stands on the bed, not on the water: it runs down to the first rock under the hub */
  const x = Math.round(m.px - cx), y = Math.round(m.py - cy), h = m.footY - m.py - 2, dy = m.doorY - m.py - 2;
  g.fillStyle = '#5a5448'; g.fillRect(x - 10, y + 2, 20, h); g.fillStyle = '#6e685a'; g.fillRect(x - 9, y + 2, 5, h); for (let yy = y + 9; yy < y + h; yy += 8) { g.fillStyle = '#4a4438'; g.fillRect(x - 10, yy, 20, 1); }
  g.fillStyle = '#1b1626'; g.fillRect(x - 3, y + 26, 6, 9); g.fillStyle = '#ffb040'; g.fillRect(x - 2, y + 27, 4, 7); g.fillStyle = '#2a1a10'; g.fillRect(x - 4, y + dy - 14, 8, 14); g.fillStyle = '#4a4438'; g.fillRect(x - 6, y + dy, 12, 2);
  g.fillStyle = '#6a3a24'; g.beginPath(); g.moveTo(x - 13, y + 4); g.lineTo(x, y - 12); g.lineTo(x + 13, y + 4); g.closePath(); g.fill(); g.fillStyle = '#3a2214'; g.fillRect(x - 2, y - 2, 4, 4); }
// the Sunspire's stalactites: pass under one and it shivers, then drops; seven seconds later the glass has grown back
function updateStals(dt) {
  for (const pr of props) { if (pr.t !== 'stal') continue;
    if (pr.state === 'hang') { if (!P.dead && Math.abs(P.x - pr.x) < 14 && P.y > pr.y && P.y - pr.y < 150) { pr.state = 'shake'; pr.t0 = 0.55; SFX.crack(); } }
    else if (pr.state === 'shake') { pr.t0 -= dt; if (pr.t0 <= 0) { pr.state = 'gone'; pr.t0 = 7; shards.push({ x: pr.x, y: pr.y + 12, vy: 60, life: 2.4, hit: new Set() }); SFX.clank(); burst(pr.x, pr.y + 6, 6, ['#dff2ff', '#8fc8e8'], 50, 0.4); } }
    else { pr.t0 -= dt; if (pr.t0 <= 0) { pr.state = 'hang'; burst(pr.x, pr.y + 4, 4, ['#dff2ff'], 30, 0.3); } }
  }
}
function updateCastleProps(dt, hb) {
  for (const pr of props) {
    if (pr.t === 'winch') {
      const struck = hb && overlap(hb, { l: pr.x - 7, r: pr.x + 7, t: pr.y - 18, b: pr.y }) && !P.hitSet.has(pr);
      if (struck) { P.hitSet.add(pr); if (pr.open <= 0) { pr.open = pr.hold; SFX.clank(); openGate(pr.gate, pr.gy0, pr.gy1); } else { pr.open = pr.hold; SFX.ui(); } }
      if (pr.open > 0) { pr.open -= dt; pr.spin += dt * 6; if (Math.floor(pr.open * 2) !== Math.floor((pr.open + dt) * 2)) SFX.text();
        if (pr.open <= 0) { pr.open = 0; const gx = pr.gate * TS + 8;
          closeGate(pr.gate, pr.gy0, pr.gy1);
          if (!P.dead && Math.abs(P.x - gx) < 10 && P.y > pr.gy0 * TS && P.y - 14 < (pr.gy1 + 1) * TS) { damagePlayer(gx, DMG.crush, { unblockable: true }); P.x = gx + (P.x < gx ? -12 : 12); }
          for (const e of enemies) if (e.alive && !e.maxHp && Math.abs(e.x - gx) < 10 && e.y > pr.gy0 * TS && e.y - e.h < (pr.gy1 + 1) * TS) hurtEnemy(e, 999, gx, false); } }
    }
    if (pr.t === 'weight' && pr.lamp && pr.state === 'down') { pr.downT += dt; if (pr.downT > 7 && Math.abs(P.x - pr.x) > 30) { pr.state = 'hang'; pr.hitE = null; pr.hitP = false; pr.vy = 0; burst(pr.x, pr.y + pr.len - 8, 8, ['#ffd36b'], 40, 0.4); } }
    if (pr.t === 'weight') {
      if (pr.state === 'hang') { const by = pr.y + pr.len; if (hb && overlap(hb, { l: pr.x - 8, r: pr.x + 8, t: by - 10, b: by + 2 }) && !P.hitSet.has(pr)) { P.hitSet.add(pr); pr.state = 'fall'; pr.fy = by; pr.vy = 0; SFX.clank(); SFX.crack(); } }
      else if (pr.state === 'tell') { pr.tellT -= dt; if (Math.random() < dt * 20) parts.push({ x: pr.x + (Math.random() - 0.5) * 16, y: pr.y + pr.len - 10, vx: 0, vy: 30, life: 0.5, max: 0.5, col: '#ffd36b', size: 1, grav: 200 }); if (pr.tellT <= 0) { pr.state = 'fall'; pr.vy = 0; SFX.crack(); } }
      else if (pr.state === 'fall') { pr.vy = Math.min(420, pr.vy + 900 * dt); pr.fy += pr.vy * dt;
        const tx = Math.floor(pr.x / TS), ty = Math.floor(pr.fy / TS);
        // a ton of iron: whatever is under it is flat, however many of them (a boss only feels it)
        pr.hitE = pr.hitE || new Set();
        for (const e of enemies) if (e.alive && Math.abs(e.x - pr.x) < e.w / 2 + 7 && pr.fy > e.y - e.h && pr.fy < e.y + 4 && !pr.hitE.has(e)) { pr.hitE.add(e);
          if (e.t === 'gqueen' && e.alive && e.phase === 2) { e.mode = 'dazed'; e.modeT = 2.6; e.vx = 0; gqSay(e, 'HER OWN CHANDELIER', '#8fd160'); SFX.golemShatter(); shakeCam(7); zoomKick(1.1, 0.3); } // the thing she threw at comes down on her
          if (e.t === 'lance' && e.alive) { e.mode = 'reel'; e.modeT = 1.8; e.stagger = 1.8; e.vx = 0; number(e.x, e.y - e.h - 16, 'THE CAGE COMES DOWN ON HIM', '#8fd160'); SFX.golemShatter(); shakeCam(7); zoomKick(1.1, 0.3); } // knocked flat first, so his plate is no use to him
          hurtEnemy(e, e.maxHp ? (pr.lamp ? 36 : 30) : 999, pr.x, true); }
        if (!P.dead && Math.abs(P.x - pr.x) < 10 && pr.fy > P.y - 16 && pr.fy < P.y + 2 && !pr.hitP) { pr.hitP = true; damagePlayer(pr.x, DMG.crush, { up: true, unblockable: true }); }
        if (pr.gq && !isSolid(tx, ty) && isOneWay(tileAt(tx, ty)) && L.arena && L.arena.gallery && ty === L.arena.gallery.row) { const A = L.arena; A.taken = A.taken || new Map();
          for (let bx = tx - 1; bx <= tx + 1; bx++) { const i = ty * LW + bx; if (isOneWay(L.grid[i])) { if (!A.taken.has(i)) A.taken.set(i, L.grid[i]); L.grid[i] = T.AIR; tileSpr[i] = null; destroyed.add(i); } }
          burst(pr.x, pr.fy, 14, ['#8a5a32', '#c9b27c', '#ffd36b'], 90, 0.6, 200, 2); SFX.crack(); shakeCam(4); pr.fy += 2; } // through the gallery, not onto it
        else if (isSolid(tx, ty) || isOneWay(tileAt(tx, ty))) { pr.state = 'down'; pr.downT = 0; pr.fy = ty * TS; if (pr.lamp) { burst(pr.x, pr.fy - 6, 16, ['#ff9a5c', '#ffd36b', '#ff6b2c'], 90, 0.6, 0, 2); SFX.puff(); } if (pr.gq) for (const dx of [-14, 0, 14]) fires.push({ x: pr.x + dx, y: pr.fy, life: 2.6, delay: 0.05 }); /* her candles set the rushes alight */ SFX.heavy(); SFX.stone(); shakeCam(6); dust(pr.x - 6, pr.fy, 8); dust(pr.x + 6, pr.fy, 8); } }
    }
    if (pr.t === 'support' && !pr.broken) {
      if (pr.shake > 0) pr.shake -= dt;
      if (hb && overlap(hb, { l: pr.x - 6, r: pr.x + 6, t: pr.top, b: pr.y }) && !P.hitSet.has(pr)) { P.hitSet.add(pr); pr.hp--; pr.shake = 0.3; SFX.stone(); sparks(pr.x, P.y - 10, P.face, 5); burst(pr.x, P.y - 10, 5, ['#8a8a98', '#5a5a66'], 50, 0.4);
        if (pr.hp <= 0) { pr.broken = true; SFX.crack(); shakeCam(4); if (props.every(q => q.t !== 'support' || q.broken)) gqCollapse(boss && boss.t === 'gqueen' ? boss : null); } }
    }
  }
}
function ringBell(b) {
  if (b.section) { b.rung = true; raiseAlarm(b.section); return; } b.rung = true; SFX.thunder(); SFX.clank(); shakeCam(4); number(b.x, b.y - 30, 'THE GATE DROPS', '#ff6b6b'); for (let ty = 0; ty < LH; ty++) { const i = ty * LW + b.gate; if (ty >= 15 && ty <= 19 && L.grid[i] === T.AIR) { L.grid[i] = T.PORT; tileSpr[i] = TILE.port[(ty + b.gate) % 2]; } } burst(b.gate * TS + 8, 17 * TS, 10, ['#7c8797', '#c9d1dc'], 60, 0.5); }

// ---------- boss: the Mother Cap ----------
function callBrood(e) {
  const A = L.arena, floor = A.floor; e.broodT = 1.2;
  number(e.x, floor - 120, 'SHE CALLS HER BROOD', '#9a5aa8'); SFX.roar();
  for (const dx of [-100, 110]) { const x = Math.max(A.x0 + 16, Math.min(A.x1 - 16, e.x + dx)); enemies.push({ t: 'sporeling', x, y: floor, vx: 0, vy: -140, w: 8, h: 10, hp: EHP.sporeling, speed: 30, face: Math.sign(P.x - x) || 1, alive: true, dying: 0, anim: Math.random(), flash: 0, stagger: 0.5, brood: true }); burst(x, floor, 8, ['#9a5aa8', '#3a3040'], 50, 0.5); }
  const dx = Math.sign(P.x - e.x) || 1; enemies.push({ t: 'drone', x: e.x + dx * 40, y: floor - 60, hx: e.x + dx * 40, hy: floor - 60, vx: 0, vy: 0, w: 9, h: 7, hp: EHP.drone, face: 1, alive: true, dying: 0, anim: 0, flash: 0, stagger: 0, brood: true });
}
function updateMother(e, dt) {
  const A = L.arena, floor = A.floor; e.modeT -= dt; e.anim += dt;
  const gills = enemies.filter(g => g.alive && g.t === 'gill').length; const p2 = gills <= 2;
  if (e.mode === 'sleep') return;
  if (e.mode === 'wake') { if (e.modeT <= 0) { e.mode = 'idle'; e.gillsOpen = true; e.openT = 8; e.rainT = 5; e.vineT = 3; e.podT = 6; number(e.x, floor - 120, 'THE GILLS ARE OPEN. CUT THEM.', '#e0b0f0'); SFX.gillOpen(); } return; }
  if (e.mode === 'tip') { if (e.modeT <= 0) { e.mode = 'open'; e.tipped = true; enemies.push({ t: 'heart', x: e.x, y: floor - 70, vx: 0, vy: 0, w: 16, h: 14, hp: EHP.heart, face: 1, alive: true, dying: 0, anim: 0, flash: 0, stagger: 0 }); number(e.x, floor - 96, 'THE HEART', '#ff7a9a'); } return; }
  // she breathes. IN: the gills seal, she pulls you toward the stalk and her brood comes up. OUT: the gills flare open and nothing else attacks. Cut them then.
  if (e.mode !== 'open') {
    if (e.gillsOpen) { e.openT -= dt; if (e.openT <= 0) { e.gillsOpen = false; e.inT = p2 ? 4.5 : 4; number(e.x, floor - 120, 'SHE BREATHES IN', '#c9a0ff'); SFX.buzz(); if (enemies.filter(g => g.alive && g.brood).length < 3) callBrood(e); } }
    else { e.inT = (e.inT === undefined ? 4 : e.inT) - dt;
      if (!P.dead && Math.abs(P.x - e.x) < 220 && Math.abs(P.y - floor) < 60) { const dir = Math.sign(e.x - P.x) || 1; P.x += dir * (P.ground ? (P.block ? 16 : 44) : 68) * dt; if (Math.random() < dt * 30) parts.push({ x: P.x - dir * 30 + (Math.random() - 0.5) * 24, y: P.y - 8 + (Math.random() - 0.5) * 16, vx: dir * 70, vy: 0, life: 0.4, max: 0.4, col: '#c9a0ff', size: 1, grav: 0 }); }
      if (e.inT <= 0) { e.gillsOpen = true; e.openT = p2 ? 5 : 6.5; number(e.x, floor - 120, 'SHE BREATHES OUT. CUT THE GILLS.', '#e0b0f0'); SFX.gillOpen(); for (const gl of enemies) if (gl.alive && gl.t === 'gill') burst(gl.x, gl.y - 6, 6, ['#e0b0f0', '#ffd0ff'], 40, 0.5); } }
  }
  const calm = e.gillsOpen && e.mode !== 'open';
  // spore rain: she shakes, and clumps fall across the hollow
  if (!calm) e.rainT -= dt;
  if (e.rainT <= 0 && e.mode !== 'shake') { e.mode = 'shake'; e.modeT = 0.8; number(e.x, floor - 120, 'SHE SHAKES', '#ffd36b'); SFX.buzz(); }
  if (e.mode === 'shake' && e.modeT <= 0) { e.mode = 'idle'; e.rainT = p2 ? 8 : 11; const n = p2 ? 8 : 6; for (let i = 0; i < n; i++) { const x = e.x + (Math.random() - 0.5) * 220; seeds.push({ x: Math.max(A.x0 + 10, Math.min(A.x1 - 10, x)), y: floor - 84, vx: (Math.random() - 0.5) * 24, vy: 20 + Math.random() * 40, dead: false, life: 4, spore: true, g: 420 }); } SFX.crack(); shakeCam(3); }
  // roots stab up on a rhythm: three spots, one under you
  if (!calm) e.rootT -= dt;
  if (e.rootT <= 0) { e.rootT = e.mode === 'open' ? 1.9 : p2 ? 2.0 : 2.6; const xs = [P.x, P.x + 70, P.x - 70].map(x => Math.max(A.x0 + 12, Math.min(A.x1 - 12, x))); for (const x of xs) roots.push({ x, y: floor, t: 0, tell: 0.65, up: 0.7 }); SFX.stone(); }
  for (const rt of roots) { rt.t += dt; if (rt.t < rt.tell) { if (Math.random() < dt * 25) parts.push({ x: rt.x + (Math.random() - 0.5) * 10, y: rt.y, vx: (Math.random() - 0.5) * 30, vy: -50, life: 0.3, max: 0.3, col: '#4a4050', size: 2, grav: 200 }); } else if (rt.t < rt.tell + rt.up) { if (rt.t - dt < rt.tell) { shakeCam(2); SFX.crack(); } if (!P.dead && P.ground && Math.abs(P.x - rt.x) < 9 && Math.abs(P.y - rt.y) < 6) damagePlayer(rt.x, DMG.root, { up: true, unblockable: true }); } }
  roots = roots.filter(rt => rt.t < rt.tell + rt.up + 0.2);
  // the vine sweep: a thorned vine bursts from one wall and whips across the floor. Jump it.
  e.vineT = (e.vineT === undefined ? 3 : e.vineT - dt * (calm ? 0.7 : 1));
  if (e.vineT <= 0) { e.vineT = e.mode === 'open' ? 3.2 : p2 ? 5 : 6.5; const fromLeft = P.x > e.x; const x0 = fromLeft ? A.x0 + 4 : A.x1 - 4; vines.push({ x: x0, dir: fromLeft ? 1 : -1, y: floor, tell: 0.7, t: 0, len: 36, end: fromLeft ? A.x1 - 4 : A.x0 + 4, hitT: 0 }); number(x0, floor - 30, 'THE WALL STIRS', '#8fd160'); SFX.buzz(); }
  // the pod toss: three pods lob from the cap and burst into spore clouds where they land
  e.podT = (e.podT === undefined ? 6 : e.podT - dt * (calm ? 0.6 : 1));
  if (e.podT <= 0 && e.mode !== 'open' && e.mode !== 'shake') { e.podT = p2 ? 5.5 : 7.5; number(e.x, floor - 110, 'SHE SPITS PODS', '#c9a0ff'); SFX.squelch(); for (const off of [0, -50, 50]) { const sx = e.x, sy = floor - 90, Tf = 1.1, G = 380, tx = Math.max(A.x0 + 12, Math.min(A.x1 - 12, P.x + off)), dx = tx - sx, dy = floor - sy; seeds.push({ x: sx, y: sy, vx: dx / Tf, vy: dy / Tf - 0.5 * G * Tf, dead: false, life: 3, g: G, spore: true, pod: true }); } }
  // belch: sleep clouds roll out from the stalk both ways
  if (!calm) e.belchT -= dt;
  if (e.belchT <= 0 && e.mode !== 'open') { e.belchT = p2 ? 5 : 7; for (const dir of [-1, 1]) clouds2.push({ x: e.x + dir * 20, y: floor - 12, r: 20, life: 4.5, sleep: true, vx: dir * 42, arena: true }); number(e.x, floor - 110, 'SLEEP SPORES', '#c9a0ff'); SFX.buzz(); }
}

// ---------- critters: harmless life that reacts to you ----------
function placeLandmarks() {
  decor.forEach(d => { if (d.landmark) d.dead = true; }); for (let i = decor.length - 1; i >= 0; i--) if (decor[i].dead) decor.splice(i, 1);
  const dress = (L.palette && L.palette.dress) || (L.palette && L.palette.myc ? 'myc' : 'wood'); const rnd = mulberry(LW * 7 + 3);
  const arenaX0 = L.arena ? L.arena.x0 / TS - 6 : LW;
  const roof = (x, y) => (L.interiors || []).some(([ix0, ix1, iy0]) => x >= ix0 && x <= ix1 && y >= iy0 - 4 && y < iy0);
  const flats = []; for (let y = 4; y < LH - 1; y++) for (let x = 6; x < Math.min(LW - 8, arenaX0); x++) { let ok = !roof(x, y); for (let k = 0; k < 6 && ok; k++) if (!(tileAt(x + k, y) === T.SOLID && tileAt(x + k, y - 1) === T.AIR && tileAt(x + k, y - 2) === T.AIR && tileAt(x + k, y - 3) === T.AIR)) ok = false; if (ok) flats.push([x, y]); }
  const used = []; const pick = () => { for (let t = 0; t < 40; t++) { const f = flats[(rnd() * flats.length) | 0]; if (f && used.every(u => Math.abs(u[0] - f[0]) > 40)) { used.push(f); return f; } } return null; };
  const put = (c, dx, dy, extra = {}) => { const f = pick(); if (f) decor.push(Object.assign({ k: 'landmark', landmark: true, bg: true, x: f[0] * TS + dx, y: f[1] * TS - c.height + dy, c }, extra)); return f; };
  if (dress === 'wood') { put(PROP.oldOak[0], 8, 0); put(PROP.oldOak[1], 8, 0); put(PROP.beehive, 10, 0); put(PROP.beehive, 30, 0); put(PROP.birdhouse, 20, 0); put(PROP.birdhouse, 50, 0); put(PROP.lanternPost, 40, 0); }
  if (dress === 'marsh') { put(PROP.fishTrap[0], 12, 0); put(PROP.fishTrap[1], 44, 0); put(PROP.lanternPost, 24, 0); put(PROP.birdhouse, 60, 0); }
  if (dress === 'camp') { put(PROP.spearRack, 12, 0); put(PROP.spearRack, 52, 0); put(PROP.barrelStack, 30, 0); put(PROP.barrelStack, 70, 0); put(PROP.bones[0], 20, 0); put(PROP.bones[1], 60, 0); }
  if (dress === 'myc') { put(PROP.bones[0], 16, 0); put(PROP.bones[1], 56, 0); }
  if (dress === 'crag') { put(PROP.cart, 20, 0); put(PROP.fence[0], 40, 0); put(PROP.lanternPost, 60, 0); put(PROP.bones[1], 30, 0); }
  if (dress === 'marsh') { put(PROP.oldOak[1], 8, 0); put(PROP.oldOak[0], 8, 0); }
  if (dress === 'camp') { put(PROP.totem[0], 20, 0); put(PROP.totem[1], 20, 0); }
  if (dress === 'myc') { put(PROP.giantCap, 0, 0); }
}
function spawnCritters() {
  placeLandmarks();
  critters = []; const dress = (L.palette && L.palette.dress) || (L.palette && L.palette.myc ? 'myc' : 'wood'); const rnd = mulberry(LW * 3 + 5);
  const tops = []; for (let y = 2; y < LH - 1; y++) for (let x = 2; x < LW - 2; x++) if (tileAt(x, y) === T.SOLID && tileAt(x, y - 1) === T.AIR && tileAt(x, y - 2) === T.AIR) tops.push([x, y]);
  if (!tops.length) return;
  const pick = () => tops[(rnd() * tops.length) | 0];
  if (dress === 'wood') for (let i = 0; i < Math.min(14, LW / 22); i++) { const [x, y] = pick(); critters.push({ k: 'butterfly', x: x * TS + 8, y: y * TS - 14 - rnd() * 10, hx: x * TS + 8, hy: y * TS - 16, t: rnd() * 6, c: (rnd() * 3) | 0, vx: 0, vy: 0, flee: 0 }); }
  if (dress === 'marsh') for (const p of (L.pools || [])) if (!p.shallow && critters.filter(c => c.k === 'dragonfly').length < 8) for (let i = 0; i < Math.min(2, 1 + Math.floor((p.x1 - p.x0) / 260)); i++) critters.push({ k: 'dragonfly', x: p.x0 + rnd() * (p.x1 - p.x0), y: p.y - 12 - rnd() * 14, x0: p.x0, x1: p.x1, y0: p.y - 30, y1: p.y - 6, tx: 0, ty: 0, t: rnd() * 6, dart: 0, face: 1 });
  if (dress === 'marsh') { const sh = (L.pools || []).filter(p => p.shallow); for (let i = 0; i < Math.min(3, sh.length); i++) { const p = sh[(i * 2 + 1) % sh.length]; critters.push({ k: 'heron', x: p.x0 + 30 + rnd() * Math.max(10, p.x1 - p.x0 - 60), y: p.y + 4, t: rnd() * 6, perched: true, vx: 0, vy: 0, life: 99 }); } }
  if (dress === 'crag') for (let i = 0; i < Math.min(10, LW / 30); i++) { const [x, y] = pick(); if (L.arena && x * TS > L.arena.x0 - 40) continue; critters.push({ k: 'sheep', x: x * TS + 8, y: y * TS, t: rnd() * 6, vx: 0, vy: 0, flee: 0, face: rnd() < 0.5 ? -1 : 1, life: 99 }); }
  if (dress === 'camp') for (const d of decor) if (d.k === 'skull' && d.crow) critters.push({ k: 'crow', x: d.x + 5, y: d.y - 2, t: rnd() * 6, perched: true, vx: 0, vy: 0, life: 99 });
  if (dress === 'wood' || dress === 'marsh') for (const d of decor) if (d.k === 'stump' && rnd() < 0.7) critters.push({ k: 'butterfly', x: d.x + 7, y: d.y - 4, hx: d.x + 7, hy: d.y - 6, t: rnd() * 6, c: (rnd() * 3) | 0, vx: 0, vy: 0, flee: 0 });
}
function updateCritters(dt) {
  for (const c of critters) {
    c.t += dt;
    if (c.k === 'butterfly') {
      const near = !P.dead && Math.abs(P.x - c.x) < 22 && Math.abs(P.y - 8 - c.y) < 18;
      if (near && c.flee <= 0) c.flee = 1.4 + Math.random();
      if (c.flee > 0) { c.flee -= dt; c.vx += (Math.sign(c.x - P.x) || 1) * 40 * dt; c.vy -= 30 * dt; c.x += c.vx * dt + Math.sin(c.t * 9) * 20 * dt; c.y += c.vy * dt; if (c.flee <= 0) { c.hx = c.x; c.hy = Math.min(c.y, c.hy); c.vx = 0; c.vy = 0; } }
      else { c.x = c.hx + Math.sin(c.t * 0.9) * 9 + Math.sin(c.t * 2.3) * 3; c.y = c.hy + Math.sin(c.t * 1.7) * 4; }
    } else if (c.k === 'sheep') { const near = !P.dead && Math.abs(P.x - c.x) < 26 && Math.abs(P.y - c.y) < 16; if (near && c.flee <= 0) { c.flee = 1.2; c.face = Math.sign(c.x - P.x) || 1; if (Math.random() < 0.6) SFX.bleat(); } if (c.flee > 0) { c.flee -= dt; c.x += c.face * 55 * dt; const tx = Math.floor((c.x + c.face * 6) / TS), ty = Math.floor((c.y + 1) / TS); if (!isSolid(tx, ty) || isSolid(tx, ty - 1)) { c.x -= c.face * 55 * dt; c.flee = 0; } }
    } else if (c.k === 'dragonfly') {
      c.dart -= dt;
      if (c.dart <= 0) { c.dart = 0.8 + Math.random() * 1.6; c.tx = c.x0 + 10 + Math.random() * (c.x1 - c.x0 - 20); c.ty = c.y0 + Math.random() * (c.y1 - c.y0); if (!P.dead && Math.abs(P.x - c.x) < 40) c.tx = c.x + (Math.sign(c.x - P.x) || 1) * 60; }
      const dx = c.tx - c.x, dy = c.ty - c.y; c.x += dx * Math.min(1, dt * 4); c.y += dy * Math.min(1, dt * 4) + Math.sin(c.t * 11) * 4 * dt; if (Math.abs(dx) > 2) c.face = Math.sign(dx);
    } else if (c.k === 'heron') {
      if (c.perched) { if (!P.dead && Math.abs(P.x - c.x) < 70 && Math.abs(P.y - c.y) < 40) { c.perched = false; c.vx = (Math.sign(c.x - P.x) || 1) * 55; c.vy = -45; c.life = 4; SFX.bird(); for (let i = 0; i < 4; i++) parts.push({ x: c.x, y: c.y, vx: (Math.random() - 0.5) * 40, vy: -30, life: 0.4, max: 0.4, col: '#bfe6f5', size: 1, grav: 200 }); } }
      else { c.life -= dt; c.x += c.vx * dt; c.y += c.vy * dt; c.vy += Math.sin(c.t * 4) * 30 * dt - 6 * dt; }
    } else if (c.k === 'crow') {
      if (c.perched) { if (!P.dead && Math.abs(P.x - c.x) < 64 && Math.abs(P.y - c.y) < 40) { c.perched = false; c.vx = (Math.sign(c.x - P.x) || 1) * 70; c.vy = -70; c.life = 3; SFX.bird(); } }
      else { c.life -= dt; c.x += c.vx * dt; c.y += c.vy * dt; c.vy += Math.sin(c.t * 7) * 40 * dt - 8 * dt; }
    }
  }
  critters = critters.filter(c => (c.k !== 'crow' && c.k !== 'heron') || c.perched || c.life > 0);
}
function drawCritters(cx, cy) {
  for (const c of critters) { if (c.x < cx - 12 || c.x > cx + VW + 12) continue;
    if (c.k === 'butterfly') g.drawImage(PROP.butterfly[c.c][Math.floor(c.t * 10) % 2], Math.round(c.x - cx) - 3, Math.round(c.y - cy) - 2);
    else if (c.k === 'dragonfly') { const im = PROP.dragonfly[Math.floor(c.t * 30) % 2]; if (c.face < 0) { g.save(); g.translate(Math.round(c.x - cx), Math.round(c.y - cy)); g.scale(-1, 1); g.drawImage(im, -5, -2); g.restore(); } else g.drawImage(im, Math.round(c.x - cx) - 5, Math.round(c.y - cy) - 2); }
    else if (c.k === 'heron') { const im = PROP.heron[c.perched ? 0 : 1 + Math.floor(c.t * 5) % 2]; const fl = c.perched ? P.x < c.x : c.vx < 0; if (fl) { g.save(); g.translate(Math.round(c.x - cx), Math.round(c.y - cy)); g.scale(-1, 1); g.drawImage(im, -4, -im.height + 2); g.restore(); } else g.drawImage(im, Math.round(c.x - cx) - 4, Math.round(c.y - cy) - im.height + 2); }
    else if (c.k === 'sheep') drawSet(SPR.sheep, null, c.flee > 0 ? 2 : (Math.floor(c.t * 0.5 + c.x) % 3 === 0 ? 1 : 0), c.x - cx, c.y - cy, c.face, false);
    else if (c.k === 'crow') { const im = PROP.crow[c.perched ? 0 : 1 + Math.floor(c.t * 10) % 2]; if (c.vx < 0 || (c.perched && P.x < c.x)) { g.save(); g.translate(Math.round(c.x - cx), Math.round(c.y - cy)); g.scale(-1, 1); g.drawImage(im, -3, -5); g.restore(); } else g.drawImage(im, Math.round(c.x - cx) - 3, Math.round(c.y - cy) - 5); }
  }
}

// ---------- enemies ----------
// every enemy that winds up says so: the pose, the mark, and now a sound (a glint for the small, a bell for the big)
const windingUp = e => (e.t === 'thorn' && e.mode === 'wind') || (e.t === 'queen' && (e.mode === 'aim' || e.mode === 'slamHang')) || (e.t === 'frog' && e.mode === 'crouch') || (e.t === 'golem' && (e.mode === 'shroudTell' || e.mode === 'stompTell' || e.mode === 'throwTell')) || (e.t === 'windcaller' && e.mode === 'howlTell') || (e.t === 'gqueen' && (e.mode === 'decreeTell' || e.mode === 'sceptreTell' || e.mode === 'slamTell' || e.mode === 'chargeTell' || e.mode === 'chandTell')) || ((e.t === 'brute' || e.t === 'chief') && (e.mode === 'raise' || e.mode === 'wind' || e.mode === 'slashWind' || e.mode === 'bashWind' || e.mode === 'crouch' || e.mode === 'whirlWind' || e.mode === 'rainAim')) || (e.t === 'pike' && e.mode === 'tell') || (e.t === 'snuffer' && (e.mode === 'swipeTell' || e.mode === 'snuffTell')) || (e.t === 'sailer' && e.big && e.mode === 'sail') || (e.t === 'lance' && (e.mode === 'couch' || e.mode === 'thrustTell' || e.mode === 'sweepTell' || e.mode === 'guardTell' || e.mode === 'rushTell' || e.mode === 'bashTell' || e.mode === 'vaultTell' || e.mode === 'javTell')) || (e.t === 'horn' && e.mode === 'tell') || (e.t === 'hearthgob' && e.mode === 'raise') || (e.t === 'cutter' && e.mode === 'raise') || (e.t === 'spider' && e.big && e.mode === 'dropTell') || (e.t === 'ram' && (e.mode === 'lower' || e.mode === 'stampTell' || e.mode === 'buttTell'));
// PERSONALITY. What they do besides fight, all of it said with the body and the voice (never words):
//  - they NOTICE you: a jump and a startled cry the first time you come near, and they forget you when you leave;
//  - they LAUGH when one of them hits you, and all of them cheer when you fall;
//  - they FLINCH when the one next to them dies, and a goblin nearly dead shakes and sweats;
//  - at rest they breathe, look about, and mutter; walking they bob, and you hear their feet.
const GOBLINISH = new Set(['sprig', 'thief', 'sapper', 'archer', 'pike', 'shield', 'brute', 'hearthgob', 'miner', 'sentry', 'sweep', 'thorn', 'rockgoblin', 'snuffer', 'cutter', 'horn', 'shaman', 'stormshaman', 'master', 'sailer']);
const FLYERS = new Set(['wasp', 'bat', 'harpy', 'crow', 'drone', 'kite', 'sailer']);
const HEAVY = new Set(['brute', 'hearthgob', 'troll', 'master', 'shield', 'goat', 'greathound']);
function temper(e, dt) {
  e.popT = Math.max(0, (e.popT || 0) - dt); e.jeerT = Math.max(0, (e.jeerT || 0) - dt); e.emoteT = Math.max(0, (e.emoteT || 0) - dt); e.lookT = Math.max(0, (e.lookT || 0) - dt); e.relT = Math.max(0, (e.relT || 0) - dt);
  if (e.harmless || e.gone > 0 || e.maxHp || e.mini || e.t === 'dummy') return;
  const dx = P.x - e.x, dy = P.y - e.y;
  if (!e.seenP) {
    if (!P.dead && Math.abs(dx) < 150 && Math.abs(dy) < 60 && !['sleep', 'asleep', 'hide'].includes(e.mode)) { e.seenP = true; e.popT = 0.35; e.emote = 'alert'; e.emoteT = 0.7; SFX.foeNotice(e.t); }
    else if (Math.abs(e.vx || 0) < 4) { e.idleT = (e.idleT ?? 1 + Math.random() * 3) - dt; if (e.idleT <= 0) { e.idleT = 2.5 + Math.random() * 3.5; if (Math.random() < 0.6) e.lookT = 0.7 + Math.random() * 0.6; else if (GOBLINISH.has(e.t) && Math.abs(dx) < 240) SFX.foeMutter(e.t); } }
  } else if (Math.abs(dx) > 320) e.seenP = false; // it has lost you: it will jump at the sight of you again
  if (GOBLINISH.has(e.t) && e.hp0 && e.hp > 0 && e.hp < e.hp0 * 0.35 && Math.random() < dt * 2) parts.push({ x: e.x + (Math.random() < 0.5 ? -4 : 4), y: e.y - e.h - 2, vx: 0, vy: 20, life: 0.5, max: 0.5, col: '#9ad8ff', size: 1, grav: 120 }); // sweat
  if (Math.abs(e.vx || 0) > 12 && !FLYERS.has(e.t) && Math.abs(dx) < 170 && Math.abs(dy) < 80) { const ph = Math.floor(e.anim * 6); if (ph !== e.stepPh2) { e.stepPh2 = ph; if (ph % 2 === 0) { const h = HEAVY.has(e.t); SFX.foeStep(h); if (h) dust(e.x, e.y, 1); } } }
}
// the crowd: they laugh at your hurt, cheer your fall, and flinch at each other's deaths
function crowdJeer(cheer) { let who = null;
  for (const e of enemies) if (e.alive && !e.maxHp && !e.mini && GOBLINISH.has(e.t) && Math.abs(e.x - P.x) < (cheer ? 220 : 170) && Math.abs(e.y - P.y) < 90 && !windingUp(e) && (cheer || Math.random() < 0.7)) { e.jeerT = cheer ? 2.2 : 0.9; e.emote = 'laugh'; e.emoteT = e.jeerT; who = who || e; }
  if (who) SFX.foeJeer(who.t); }
function startle(dead) { let who = null;
  for (const o of enemies) if (o !== dead && o.alive && !o.maxHp && !o.mini && !o.harmless && Math.abs(o.x - dead.x) < 110 && Math.abs(o.y - dead.y) < 60) { o.popT = 0.3; o.emote = 'shock'; o.emoteT = 0.7; o.seenP = true; who = who || o; }
  if (who && GOBLINISH.has(who.t)) SFX.foeGasp(who.t); }
// THE BODY: breath at rest, a bob in the walk, a crouch into every wind-up and a stretch out of it, a recoil when struck,
// a hop when startled or laughing, a shake when nearly dead; drawn over whatever frame the creature is on
function poseOf(e, wind) {
  const o = { dx: 0, dy: 0, sx: 1, sy: 1, face: e.lookT > 0 && !e.seenP ? -e.face : e.face };
  if (!e.alive) return o;
  const fly = FLYERS.has(e.t), mv = Math.abs(e.vx || 0) > 4, seed = ((e.hx || e.x0 || 0) * 0.37) % 6;
  if (wind) { o.sy *= 0.9; o.sx *= 1.08; }
  else if (e.relT > 0) { const k = e.relT / 0.18; o.sy *= 1 + 0.12 * k; o.sx *= 1 - 0.08 * k; }
  else if (!mv && !fly) { const b = Math.sin(e.anim * 2.8 + seed); o.sy *= 1 + 0.03 * b; o.sx *= 1 - 0.015 * b; }
  if (mv && !fly) o.dy -= Math.round(Math.abs(Math.sin(e.anim * 9 + seed)) * 1.2);
  if (e.flash > 0) { o.dx -= (e.face || 1) * 1.5; o.sy *= 0.95; o.sx *= 1.04; }
  if (e.popT > 0) o.dy -= Math.round(Math.sin(Math.PI * (1 - e.popT / 0.35)) * 5);
  if (e.jeerT > 0) o.dy -= Math.round(Math.abs(Math.sin(e.jeerT * 13)) * 3);
  if (GOBLINISH.has(e.t) && e.hp0 && e.hp < e.hp0 * 0.35 && !wind && Math.floor(time * 24) % 3 === 0) o.dx += Math.floor(time * 48) % 2 ? 1 : -1;
  return o;
}
function drawEmote(e, x, y) { // x, y: over its head, on screen
  const k = e.emoteT;
  if (e.emote === 'alert') { g.globalAlpha = Math.min(1, k * 3); g.strokeStyle = '#fff6e0'; g.lineWidth = 1; g.beginPath(); g.moveTo(x - 4.5, y); g.lineTo(x - 7.5, y - 4); g.moveTo(x + 0.5, y - 2); g.lineTo(x + 0.5, y - 7); g.moveTo(x + 5.5, y); g.lineTo(x + 8.5, y - 4); g.stroke(); }
  else if (e.emote === 'laugh') { const b = Math.round(Math.abs(Math.sin(k * 13)) * 2); g.globalAlpha = Math.min(1, k * 3); g.fillStyle = '#ffd36b'; for (const ox of [-4, 3]) { g.fillRect(x + ox, y - 3 - b, 1, 1); g.fillRect(x + ox + 1, y - 2 - b, 1, 1); g.fillRect(x + ox + 2, y - 3 - b, 1, 1); } }
  else if (e.emote === 'shock') { g.globalAlpha = Math.min(1, k * 3); g.fillStyle = '#9ad8ff'; const dy = Math.round((0.7 - k) * 6); g.fillRect(x + 5, y - 2 + dy, 2, 2); g.fillRect(x + 5.5, y - 3 + dy, 1, 1); g.fillStyle = '#fff6e0'; g.fillRect(x - 6, y - 4, 1, 3); g.fillRect(x - 6, y, 1, 1); }
  g.globalAlpha = 1;
}
function updateEnemies(dt) {
  for (const e of enemies) {
    if (!e.alive) continue;
    emitAt(sndAt(e.x, e.y - e.h / 2, !!e.maxHp)); // everything this one does is heard from where it is
    { const wu = windingUp(e); if (wu && !e.wuWas && Math.abs(e.x - P.x) < 420) SFX.tell(!!e.maxHp || !!e.big || !!e.mini); if (!wu && e.wuWas) e.relT = 0.18; e.wuWas = wu; }
    if (Math.abs(e.x - P.x) < 420) temper(e, dt);
    e.flash = Math.max(0, e.flash - dt); e.stagger = Math.max(0, e.stagger - dt); e.anim += dt; if (e.sq > 0) e.sq = Math.max(0, e.sq - dt);
    if (e.burn > 0) { e.burn -= dt; e.burnTick = (e.burnTick || 0) - dt; if (e.burnTick <= 0) { e.burnTick = 0.3; if (e.alive) { e.hp -= 2; e.flash = 0.06; number(e.x, e.y - e.h - 8, 2, '#ff9a5c'); if (e.hp <= 0) hurtEnemy(e, 0, e.x + 1, false); } } if (Math.random() < dt * 20) parts.push({ x: e.x + (Math.random() - 0.5) * e.w, y: e.y - Math.random() * e.h, vx: 0, vy: -40, life: 0.3, max: 0.3, col: Math.random() < 0.5 ? '#ff9a5c' : '#ffd36b', size: 1, grav: 0 }); }
    if (e.frozen > 0) e.frozen -= dt;
    if (e.t === 'dummy') { e.vx = 0; e.hp = e.hp0; continue; } // a straw man stands there
    if (e.t === 'queen') { if (bossActive) beastSeen('queen'); if (bossActive || e.mode === 'sleep') updateQueen(e, dt); continue; }
    if (e.t === 'frog') { if (bossActive) beastSeen('frog'); if (bossActive || e.mode === 'sleep') updateFrog(e, dt); continue; }
    if (e.t === 'chief') { if (bossActive) beastSeen('chief'); if (bossActive || e.mode === 'sleep') updateChief(e, dt); continue; }
    if (e.t === 'mother') { if (bossActive) beastSeen('mother'); if (bossActive || e.mode === 'sleep') updateMother(e, dt); continue; }
    if (e.t === 'ram') { if (bossActive) beastSeen('ram'); if (bossActive || e.mode === 'sleep') updateRam(e, dt); continue; }
    if (e.t === 'greathound') { updateGreatHound(e, dt); continue; }
    if (e.t === 'owl') { if (bossActive) beastSeen('owl'); if (bossActive || e.mode === 'sleep') updateOwl(e, dt); continue; }
    if (e.t === 'forgemaster') { const live = e.mini ? miniActive : bossActive; if (live) beastSeen('forgemaster'); if (live || e.mode === 'sleep') updateForgemaster(e, dt); continue; }
    if (e.t === 'golem') { if (bossActive) beastSeen('golem'); if (bossActive || e.mode === 'sleep') updateGolem(e, dt); continue; }
    if (e.t === 'king') { if (bossActive) beastSeen('king'); if (bossActive || e.mode === 'sleep') updateKing(e, dt); continue; }
    if (e.t === 'gqueen') { if (bossActive) beastSeen('gqueen'); if (bossActive || e.mode === 'sleep') updateGQueen(e, dt); continue; }
    if (e.t === 'roc') { if (bossActive) beastSeen('roc'); if (bossActive || e.mode === 'sleep') updateRoc(e, dt); continue; }
    if (e.t === 'suncatcher') { if (bossActive) beastSeen('suncatcher'); if (bossActive || e.mode === 'sleep') updateSuncatcher(e, dt); continue; }
    if (e.t === 'lance') { if (bossActive) beastSeen('lance'); if (bossActive || e.mode === 'sleep') updateLance(e, dt); continue; }
    if (e.t === 'windcaller') { if (bossActive) beastSeen('windcaller'); if (bossActive || e.mode === 'sleep') updateWindcaller(e, dt); continue; }
    // (the Roc was 32 tiles off across her crown and simply stopped; the Lance could freeze at the far end of his own bridge)
    if (Math.abs(e.x - P.x) > 420) continue; // (bosses above never sleep at range: the Ram Lord used to freeze mid-charge when the fold was wide)
    { const bt = e.squirrel ? 'squirrel' : e.t; if (Math.abs(e.x - P.x) < 190 && !(PROG.beasts && PROG.beasts[bt] && PROG.beasts[bt].seen)) beastSeen(bt); }
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
      const hk = HOP[e.color || 'green'];
      if (!e.air && e.stagger <= 0 && near && e.timer <= 0) { e.face = Math.sign(d) || e.face; e.vx = e.face * (60 + Math.min(40, Math.abs(d) * 0.3)) * hk.sp; e.vy = e.color === 'blue' ? -260 : e.color === 'yellow' ? -190 : -230; e.air = true; e.timer = hk.cd + Math.random() * 0.4; if (Math.random() < 0.4) SFX.croak(); }
      if (!e.air) e.vx *= Math.pow(0.02, dt);
      const oldY = e.y; e.x += e.vx * dt; e.y += e.vy * dt;
      // land on the raft it rode in on, or on tiles
      let landed = false;
      if (e.raft && e.vy >= 0 && oldY <= e.raft.y + 1 && e.y >= e.raft.y && e.x > e.raft.x - 2 && e.x < e.raft.x + e.raft.w + 2) { e.y = e.raft.y; e.vy = 0; landed = true; e.x += e.raft.dx; }
      else if (e.raft && !e.air && e.x > e.raft.x - 2 && e.x < e.raft.x + e.raft.w + 2 && Math.abs(e.y - e.raft.y) < 6) { e.x += e.raft.dx; e.y = e.raft.y; e.vy = 0; landed = true; }
      else { const ty = Math.floor((e.y - 0.01) / TS); for (const tx of [Math.floor((e.x - 3) / TS), Math.floor((e.x + 3) / TS)]) { const t = tileAt(tx, ty); if (t === T.SOLID || t === T.CRATE || t === T.PALISADE || (isOneWay(t) && oldY <= ty * TS + 0.5 && e.vy >= 0)) { e.y = ty * TS; e.vy = 0; landed = true; break; } } }
      if (landed && e.air) { e.air = false; dust(e.x, e.y, 3); e.stagger = 0.15; }
      if (!landed && e.vy > 0) e.air = true;
      // deep water swallows them
      if (e.vy > 0) for (const p of (L.pools || [])) if (!p.shallow && e.x > p.x0 && e.x < p.x1 && e.y > p.y + 6) { e.alive = false; burst(e.x, p.y, 8, ['#eefaff', '#bfe6f5'], 60, 0.4); SFX.splash(); break; }
      if (e.y > LH * TS + 20) e.alive = false;
      continue;
    }
    if (e.t === 'gill' || e.t === 'heart') { e.y += Math.sin(e.anim * 3) * 0.02; continue; }
    if (e.t === 'bearer') { if (boss && boss.t === 'king' && boss.alive) { e.x = boss.x + e.off; e.y = L.arena.floor; e.face = boss.dir || -1; } continue; }
    if (e.t === 'folk') { // townsfolk: bolt for the nearest door and slam it; the court folk cheer from the gallery
      if (e.court) { e.vy = 0; continue; }
      const near = !P.dead && Math.abs(P.x - e.x) < 110 && Math.abs(P.y - e.y) < 40; e.vy += 1000 * dt; if (e.vy > 270) e.vy = 270;
      if (near || e.running) { e.running = true; const dx = e.door - e.x; e.face = Math.sign(dx) || e.face; e.vx += (e.face * e.speed - e.vx) * Math.min(1, dt * 10); if (Math.abs(dx) < 5) { e.alive = false; const d = props.find(p => p.t === 'door' && Math.abs(p.x - e.door) < 6); if (d) d.shut = true; SFX.thud(); number(e.x, e.y - 16, 'SLAM', '#9aa39a'); continue; } if (!e.said) { e.said = true; number(e.x, e.y - 16, ['EEK', 'THE KNIGHT', 'RUN', 'MUM'][(Math.random() * 4) | 0], '#c9b27c'); } }
      else e.vx *= Math.pow(0.02, dt);
      const r = moveBody(e, e.vx * dt, e.vy * dt, false); if (r.ground) e.vy = 0; continue;
    }
    if (e.t === 'thief') { // stalks you, snatches level gold on touch, runs; catch him and it comes back with interest. The squirrel knight does the same and hops up the tree.
      const d = P.x - e.x, ad = Math.abs(d); e.vy += 1000 * dt; if (e.vy > 270) e.vy = 270;
      if (e.squirrel && (e.loot > 0 || e.mode === 'flee') && e.vy === 0 && Math.random() < dt * 2.2) { e.vy = -300; SFX.leap(); }
      if (e.loot > 0) { const away = Math.sign(e.x - P.x) || e.face; e.face = away; e.vx += (away * 95 - e.vx) * Math.min(1, dt * 8); if (ad > 420) { e.alive = false; number(P.x, P.y - 30, 'THE THIEF GOT AWAY', '#9aa39a'); } }
      else { const near = ad < 200 && Math.abs(e.y - P.y) < 50 && !P.dead; if (near) { e.face = Math.sign(d) || e.face; e.vx += (e.face * e.speed - e.vx) * Math.min(1, dt * 8); } else e.vx *= Math.pow(0.05, dt);
        if (!P.dead && ad < 10 && Math.abs(e.y - P.y) < 14 && P.dodge <= 0) { if (P.relic === 'cloak') { number(e.x, e.y - 18, 'NOTHING TO TAKE', '#6a3aa0'); e.loot = -1; } else { const take = Math.min(5, got); if (take > 0) { got -= take; e.loot = take; number(P.x, P.y - 22, '-' + take + ' GOLD', '#ff6b6b'); SFX.coin(); } else { e.loot = -1; number(e.x, e.y - 18, 'EMPTY POCKETS', '#9aa39a'); } } e.vx = (Math.sign(e.x - P.x) || 1) * 95; }
        if (e.loot === -1) { e.loot = 0; e.mode = 'flee'; e.fleeT = 3; }
        if (e.mode === 'flee') { e.fleeT -= dt; e.vx += ((Math.sign(e.x - P.x) || 1) * 95 - e.vx) * Math.min(1, dt * 8); if (e.fleeT <= 0) e.mode = 'stalk'; } }
      const dirM = Math.sign(e.vx) || e.face; const aheadX = e.x + dirM * (e.w / 2 + 2), ftx = Math.floor(aheadX / TS), fty = Math.floor((e.y + 1) / TS);
      const r = moveBody(e, e.vx * dt, e.vy * dt, false); if (r.ground) e.vy = 0;
      if (r.ground && tileAt(ftx, fty) === T.AIR && !isOneWay(tileAt(ftx, fty))) { if (e.loot > 0 || e.mode === 'flee') { e.vy = -240; } else e.vx = 0; }
      if (r.hitX && r.ground) e.vy = -240; continue;
    }
    if (e.t === 'pike') { // holds a line: thrusts when you come within reach, turns slowly, parried if you block it
      const d = P.x - e.x, ad = Math.abs(d), near = ad < 100 && Math.abs(e.y - P.y) < 24 && !P.dead; e.vy += 1000 * dt; if (e.vy > 270) e.vy = 270; e.modeT -= dt;
      if (e.mode === 'guard') { if (near && Math.sign(d) !== e.face) { e.turnT = (e.turnT || 0) + dt; if (e.turnT > 0.6) { e.face = Math.sign(d); e.turnT = 0; } } else e.turnT = 0; if (near && Math.sign(d) === e.face && ad < 46 && e.stagger <= 0) { e.mode = 'tell'; e.modeT = 0.4; number(e.x, e.y - e.h - 8, '!', '#ffd36b'); } }
      else if (e.mode === 'tell' && e.modeT <= 0) { e.mode = 'thrust'; e.modeT = 0.25; SFX.slash(); if (!P.dead && Math.sign(P.x - e.x) === e.face && ad < 42 && Math.abs(P.y - e.y) < 20) { const res = damagePlayer(e.x, DMG.pike); if (res === 'blocked') { e.stagger = 0.9; number(e.x, e.y - e.h - 8, 'PARRIED', '#8fd160'); } } }
      else if (e.mode === 'thrust' && e.modeT <= 0) { e.mode = 'guard'; e.modeT = 0.5; }
      const r = moveBody(e, 0, e.vy * dt, false); if (r.ground) e.vy = 0; continue;
    }
    if (e.t === 'sentry') { updateSentry(e, dt); continue; }
    if (e.t === 'shardling') { updateShardling(e, dt); continue; }
    if (e.t === 'hearthgob') { updateHearthGob(e, dt); continue; }
    if (e.t === 'stormshaman') { updateStormShaman(e, dt); continue; }
    if (e.t === 'sweep') { updateSweep(e, dt); continue; }
    if (e.t === 'cutter') { updateCutter(e, dt); continue; }
    if (e.t === 'snuffer') { updateSnuffer(e, dt); continue; }
    if (e.t === 'sailer') { if (e.mini) beastSeen('sailer'); updateSailer(e, dt); continue; }
    if (e.t === 'troll') { updateTroll(e, dt); continue; }
    if (e.t === 'miner') { updateMiner(e, dt); continue; }
    if (e.t === 'bat') { updateBat(e, dt); continue; }
    if (e.t === 'grub') { updateGrub(e, dt); continue; }
    if (e.t === 'crow') { updateCrow(e, dt); continue; } if (e.t === 'horn') { updateHorn(e, dt); continue; } if (e.t === 'bale') { updateBale(e, dt); continue; }
    if (e.t === 'kite') { updateKite(e, dt); continue; }
    if (e.t === 'hare') { updateHare(e, dt); continue; }
    if (e.t === 'wight') { updateWight(e, dt); continue; }
    if (e.t === 'rockgoblin') { updateRockGoblin(e, dt); continue; }
    if (e.t === 'spider') { updateSpider(e, dt); continue; }
    if (e.t === 'harpy') { updateHarpy(e, dt); continue; }
    if (e.t === 'goat') { updateGoat(e, dt); continue; }
    if (e.t === 'drone') { // drifts at you and bursts
      const d = P.x - e.x, ad = Math.abs(d), near = ad < 200 && Math.abs(e.y - P.y) < 120 && !P.dead;
      if (near) { const dx = P.x - e.x, dy = (P.y - 8) - e.y, dd = Math.hypot(dx, dy) || 1; e.x += dx / dd * 34 * dt; e.y += dy / dd * 30 * dt + Math.sin(e.anim * 3) * 8 * dt; e.face = Math.sign(dx) || e.face; if (dd < 12) { e.alive = false; kills++; clouds2.push({ x: e.x, y: e.y, r: 20, life: 2.5 }); burst(e.x, e.y, 10, COLS.drone, 60, 0.5); SFX.crack(); damagePlayer(e.x, DMG.drone, { unblockable: true, up: true }); } }
      else { e.x += (e.hx + Math.sin(e.anim * 0.9) * 6 - e.x) * Math.min(1, dt * 2); e.y += (e.hy + Math.sin(e.anim * 1.6) * 5 - e.y) * Math.min(1, dt * 2); }
      continue;
    }
    if (e.t === 'lurker') { // scenery until you are close, then a lunge
      const d = P.x - e.x, ad = Math.abs(d); e.modeT -= dt;
      if (e.mode === 'hide') { if (ad < 42 && Math.abs(P.y - e.y) < 24 && !P.dead) { e.mode = 'lunge'; e.modeT = 0.4; e.face = Math.sign(d) || 1; e.vx = e.face * 190; SFX.thump(); number(e.x, e.y - e.h - 8, '!', '#ff6b6b'); } }
      else if (e.mode === 'lunge') { e.x += e.vx * dt; const ftx = Math.floor((e.x + e.face * 8) / TS), fty = Math.floor((e.y + 1) / TS); if (!isSolid(ftx, fty) && !isOneWay(tileAt(ftx, fty))) e.vx = 0; if (isSolid(Math.floor((e.x + e.face * 7) / TS), Math.floor((e.y - 6) / TS))) e.vx = 0; if (e.modeT <= 0) { e.mode = 'rest'; e.modeT = 1.6; e.vx = 0; } }
      else if (e.mode === 'rest' && e.modeT <= 0) { e.mode = 'hide'; e.home = true; }
      continue;
    }
    if (e.t === 'shaman') { // walks slowly, raises sporelings; blinks away when struck
      const d = P.x - e.x, ad = Math.abs(d), near = ad < 220 && Math.abs(e.y - P.y) < 60 && !P.dead;
      e.vy += 1000 * dt; if (e.vy > 270) e.vy = 270; e.timer -= dt; e.cast = Math.max(0, e.cast - dt);
      let want = 0; if (near) { e.face = Math.sign(d) || e.face; want = ad > 90 ? e.face * e.speed : ad < 50 ? -e.face * e.speed : 0; }
      const spawned = enemies.filter(g => g.alive && g.t === 'sporeling' && g.raised).length;
      if (near && e.timer <= 0 && spawned < 3) { e.timer = 4; e.cast = 0.6; const sx = e.x + e.face * (30 + Math.random() * 20); enemies.push({ t: 'sporeling', x: sx, y: e.y, vx: 0, vy: -120, w: 8, h: 10, hp: EHP.sporeling, speed: 26, face: -e.face, alive: true, dying: 0, anim: 0, flash: 0, stagger: 0.4, raised: true }); burst(sx, e.y, 8, ['#9a5aa8', '#3a3040'], 50, 0.5); SFX.spit(); number(e.x, e.y - e.h - 8, 'RISE', '#4aa0b0'); }
      if (e.cast > 0 || e.stagger > 0) want = 0;
      e.vx += (want - e.vx) * Math.min(1, dt * 8);
      const aheadX = e.x + Math.sign(e.vx || e.face) * (e.w / 2 + 2), ftx = Math.floor(aheadX / TS), fty = Math.floor((e.y + 1) / TS);
      const r = moveBody(e, e.vx * dt, e.vy * dt, false); if (r.ground) e.vy = 0;
      if (r.ground && tileAt(ftx, fty) === T.AIR && !isOneWay(tileAt(ftx, fty))) e.vx = 0;
      continue;
    }
    if (e.t === 'sprig' && e.ringer && e.bell) { const b = props.find(p => p.t === 'bell' && Math.abs(p.x - e.bell) < 6); if (b && !b.rung && !b.broken && !P.dead && Math.abs(P.x - e.x) < 200) { e.vy += 1000 * dt; if (e.vy > 270) e.vy = 270; const dx = b.x - e.x; e.face = Math.sign(dx) || e.face; e.vx += (e.face * 60 - e.vx) * Math.min(1, dt * 8); if (Math.abs(dx) < 8) { b.ringT += dt; if (!e.said) { e.said = true; number(e.x, e.y - 18, 'THE BELL!', '#ff6b6b'); } if (b.ringT > 1.0) ringBell(b); e.vx = 0; } const r = moveBody(e, e.vx * dt, e.vy * dt, false); if (r.ground) e.vy = 0; continue; } }
    if (e.t === 'sapper') { // runs at you with a lit bomb, drops it at your feet, and runs
      const d = P.x - e.x, ad = Math.abs(d), near = ad < 220 && Math.abs(e.y - P.y) < 60 && !P.dead;
      e.vy += 1000 * dt; if (e.vy > 270) e.vy = 270;
      let want = 0;
      if (e.fleeT > 0) { e.fleeT -= dt; want = -e.face * e.speed * 1.2; }
      else if (near && e.stagger <= 0) { e.face = Math.sign(d) || e.face; want = e.face * e.speed; if (ad < 22) { bombs.push({ x: e.x + e.face * 6, y: e.y - 4, vx: e.face * 30, vy: -60, fuse: 1.1 }); e.fleeT = 1.4; SFX.bow(); number(e.x, e.y - 20, 'BOMB', '#ff6b6b'); } }
      if (e.stagger > 0) want = 0;
      e.vx += (want - e.vx) * Math.min(1, dt * 10);
      const aheadX = e.x + Math.sign(e.vx || e.face) * (e.w / 2 + 2), ftx = Math.floor(aheadX / TS), fty = Math.floor((e.y + 1) / TS);
      const r = moveBody(e, e.vx * dt, e.vy * dt, false); if (r.ground) e.vy = 0;
      if (r.ground && tileAt(ftx, fty) === T.AIR && !isOneWay(tileAt(ftx, fty))) { e.vx = 0; if (e.fleeT > 0) e.fleeT = 0; }
      if (r.hitX) e.vx = 0;
      continue;
    }
    if (e.t === 'hound') {
      if (!P.dead && Math.abs(e.x - P.x) < 130 && Math.abs(e.y - P.y) < 40) { e.barkT = (e.barkT || 0) - dt; if (e.barkT <= 0) { e.barkT = 1.4 + Math.random() * 1.2; SFX.bark(); } } // straight-line chaser, leaps low at the last stride, won't cross fire
      let d = P.x - e.x, ad = Math.abs(d), near = ad < 240 && Math.abs(e.y - P.y) < 50 && !P.dead;
      e.vy += 1000 * dt; if (e.vy > 300) e.vy = 300; e.timer -= dt;
      let want = 0;
      if (e.turncoat) { // hunts the Hound Master's mount, bites, and backs off to come again
        const mb = enemies.find(q => q.alive && q.t === 'greathound'); if (!mb) { e.alive = false; burst(e.x, e.y - 3, 8, COLS.hound, 50, 0.4); number(e.x, e.y - 16, 'RUNS FREE', '#8fd160'); continue; }
        e.biteT = Math.max(0, (e.biteT || 0) - dt); e.retreat = Math.max(0, (e.retreat || 0) - dt);
        if (e.retreat > 0) { want = e.vx; } else if (e.biteT > 0) { e.face = Math.sign(mb.x - e.x) || e.face; want = Math.abs(mb.x - e.x) > 60 ? 0 : -e.face * 60; } else { e.face = Math.sign(mb.x - e.x) || e.face; want = e.face * e.speed; }
        e.vx += (want - e.vx) * Math.min(1, dt * 8); const r2 = moveBody(e, e.vx * dt, e.vy * dt, false); if (r2.ground) { e.vy = 0; e.air = false; } if (r2.hitX) e.vx = 0; continue;
      }
      if (e.pack && e.packLife !== undefined) { e.packLife -= dt; if (e.packLife <= 0) { e.alive = false; burst(e.x, e.y - 3, 6, COLS.hound, 50, 0.4); number(e.x, e.y - 14, 'RUNS OFF', '#9aa39a'); continue; } }
      if (e.pincer) { e.pincerT -= dt; if (e.pincerT > 0) { want = 0; e.face = Math.sign(d) || e.face; } else { const mate = enemies.find(q => q !== e && q.alive && q.t === 'hound' && q.pincer && q.pincerT <= 0); if (mate && Math.abs(mate.x - e.x) < 16 && !e.air && !mate.air) { for (const q of [e, mate]) { q.pincer = false; q.stagger = 1.6; q.vx = (q === e ? -1 : 1) * Math.sign(mate.x - e.x) * 60; number(q.x, q.y - 14, 'DAZED', '#8fd160'); } SFX.yelp(); SFX.thud(); dust(e.x, e.y, 8); } else if (e.stagger <= 0) { e.face = Math.sign(d) || e.face; want = e.face * 165; } }
        if (e.stagger > 0) want = 0; e.vx += (want - e.vx) * Math.min(1, dt * 10); const r3 = moveBody(e, e.vx * dt, e.vy * dt, false); if (r3.ground) { e.vy = 0; e.air = false; } if (r3.hitX) { e.vx = 0; e.pincer = false; } continue;
      }
      if (e.flank) { e.holdT -= dt; const dh = e.holdX - e.x; if (Math.abs(dh) > 6 && e.holdT > 0) { e.face = Math.sign(dh); want = e.face * 150; } else { want = 0; e.face = Math.sign(d) || e.face; } if (e.holdT <= 0) e.flank = false;
        e.vx += (want - e.vx) * Math.min(1, dt * 8); const r4 = moveBody(e, e.vx * dt, e.vy * dt, false); if (r4.ground) { e.vy = 0; e.air = false; } if (r4.hitX) e.vx = 0; continue;
      }
      if (near && e.stagger <= 0) { e.face = Math.sign(d) || e.face; want = e.face * e.speed; const fireAhead = fires.some(f => f.delay <= 0 && Math.sign(f.x - e.x) === e.face && Math.abs(f.x - e.x) < 30); if (fireAhead) want = -e.face * 40; else if (!e.air && ad < 46 && e.timer <= 0) { e.vy = -170; e.air = true; e.timer = 0.9; e.vx = e.face * 150; } }
      if (e.stagger > 0) want = 0;
      if (!e.air) e.vx += (want - e.vx) * Math.min(1, dt * 8);
      const aheadX = e.x + Math.sign(e.vx || e.face) * (e.w / 2 + 2), ftx = Math.floor(aheadX / TS), fty = Math.floor((e.y + 1) / TS);
      const r = moveBody(e, e.vx * dt, e.vy * dt, false); if (r.ground) { e.vy = 0; e.air = false; }
      if (r.ground && !e.air && tileAt(ftx, fty) === T.AIR && !isOneWay(tileAt(ftx, fty))) e.vx = 0;
      if (r.hitX) e.vx = 0;
      continue;
    }
    if (e.t === 'brute') { // slow, heavy: an unblockable overhead you dodge, a blockable sweep
      const d = P.x - e.x, ad = Math.abs(d), near = ad < 200 && Math.abs(e.y - P.y) < 40 && !P.dead;
      e.vy += 1000 * dt; if (e.vy > 270) e.vy = 270; e.modeT -= dt;
      let want = 0;
      if (e.mode === 'walk') { if (near && e.stagger <= 0) { e.face = Math.sign(d) || e.face; want = ad > 26 ? e.face * e.speed : 0; if (ad <= 30) { e.mode = Math.random() < 0.5 ? 'raise' : 'wind'; e.modeT = e.mode === 'raise' ? 0.9 : 0.5; number(e.x, e.y - e.h - 12, e.mode === 'raise' ? '!!' : '!', e.mode === 'raise' ? '#ff6b6b' : '#ffd36b'); SFX.charge(); } } }
      else if (e.mode === 'raise' && e.modeT <= 0) { e.mode = 'slam'; e.modeT = 0.35; shakeCam(4); SFX.heavy(); dust(e.x + e.face * 14, e.y, 8); if (!P.dead && Math.sign(P.x - e.x) === e.face && ad < 30 && Math.abs(P.y - e.y) < 20) damagePlayer(e.x, DMG.bruteOver, { unblockable: true }); }
      else if (e.mode === 'wind' && e.modeT <= 0) { e.mode = 'sweep'; e.modeT = 0.3; SFX.slash(); if (!P.dead && Math.sign(P.x - e.x) === e.face && ad < 44 && Math.abs(P.y - e.y) < 20) { const res = damagePlayer(e.x, DMG.bruteSweep); if (res === 'blocked') e.stagger = 0.6; } }
      else if ((e.mode === 'slam' || e.mode === 'sweep') && e.modeT <= 0) { e.mode = 'rest'; e.modeT = e.mode === 'slam' ? 1.1 : 0.6; }
      else if (e.mode === 'rest' && e.modeT <= 0) e.mode = 'walk';
      if (e.stagger > 0 && e.mode !== 'walk' && e.mode !== 'rest') { e.mode = 'rest'; e.modeT = 0.8; }
      e.vx += (want - e.vx) * Math.min(1, dt * 6);
      const aheadX = e.x + e.face * (e.w / 2 + 2), ftx = Math.floor(aheadX / TS), fty = Math.floor((e.y + 1) / TS);
      const r = moveBody(e, e.vx * dt, e.vy * dt, false); if (r.ground) e.vy = 0;
      if (r.ground && tileAt(ftx, fty) === T.AIR && !isOneWay(tileAt(ftx, fty))) e.vx = 0;
      continue;
    }
    if (e.t === 'archer') {
      if (e.horn && !e.blown && !P.dead && Math.abs(P.x - e.x) < 210 && Math.abs(P.y - e.y) < 120) { e.hornT += dt; if (e.hornT > 1.3) { e.blown = true; hornSquadT = 1.2; number(e.x, e.y - 18, 'THE HORN!', '#ff6b6b'); SFX.roar(); shakeCam(3); } } else if (e.horn && !e.blown) e.hornT = Math.max(0, e.hornT - dt);
      const d = P.x - e.x, ad = Math.abs(d), near = (e.bowman ? ad < 900 && Math.abs(e.y - P.y) < 120 : ad < 230 && Math.abs(e.y - P.y) < 70) && !P.dead;
      if (near) e.face = Math.sign(d) || e.face;
      e.timer -= dt; e.draw = Math.max(0, e.draw - dt);
      let want = 0;
      if (near && ad < 64 && e.draw <= 0) want = -e.face * e.speed * 1.6; // back off
      else if (near && ad > 170 && e.draw <= 0) want = e.face * e.speed * 0.6;
      if (near && e.timer <= 0 && e.draw <= 0 && ad > 40) { e.draw = 0.55; e.timer = 2.4; SFX.bow(); }
      if (e.draw > 0 && e.draw - dt <= 0) {
        const sx = e.x + e.face * 5, sy = e.y - 7, dx = P.x - sx, Tf = e.bowman ? Math.max(0.75, Math.abs(dx) / 300) : 0.75, G = 320, dy = (P.y - 8) - sy; /* a royal bowman lobs it the length of the hall */
        seeds.push({ x: sx, y: sy, vx: Math.max(-(e.bowman ? 320 : 200), Math.min(e.bowman ? 320 : 200, dx / Tf)), vy: dy / Tf - 0.5 * G * Tf, dead: false, life: 3, arrow: true, g: G, owner: e, fire: e.fire });
        if (e.fire) number(e.x, e.y - 20, 'FIRE', '#ff9a5c');
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
    { const tx = Math.floor(w.x / TS), ty = Math.floor(w.y / TS); if (!isSolid(tx, ty) && isSolid(tx, ty + 1)) w.y = (ty + 1) * TS; else if (isSolid(tx, ty - 1)) w.life = 0; }
    if (Math.random() < dt * 30) parts.push({ x: w.x + (Math.random() - 0.5) * 6, y: w.y - Math.random() * 4, vx: w.dir * 30, vy: -60 - Math.random() * 60, life: 0.35, max: 0.35, col: Math.random() < 0.5 ? '#c9b27c' : '#8a5a32', size: 2, grav: 300 });
    if (L.arena && (w.x < L.arena.x0 + 4 || w.x > L.arena.x1 - 4)) w.life = 0;
    if (!P.dead && P.ground && Math.abs(P.x - w.x) < 9 && P.y > w.y - 4) { if (damagePlayer(w.x - w.dir * 20, DMG.wave)) w.life = 0; }
  }
  waves = waves.filter(w => w.life > 0);
  for (const s of seeds) {
    if (s.dead) continue; if (s.g) s.vy += s.g * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt;
    if (s.fire && !s.reflected && Math.random() < dt * 40) parts.push({ x: s.x, y: s.y, vx: (Math.random() - 0.5) * 20, vy: -30, life: 0.25, max: 0.25, col: Math.random() < 0.5 ? '#ff9a5c' : '#ffd36b', size: 1, grav: 0 });
    if (s.bolt && Math.random() < dt * 50) parts.push({ x: s.x, y: s.y, vx: (Math.random() - 0.5) * 30, vy: (Math.random() - 0.5) * 30, life: 0.3, max: 0.3, col: Math.random() < 0.5 ? '#c9a0ff' : '#f0e4ff', size: 1, grav: 0 });
    if (s.life <= 0 || isSolid(Math.floor(s.x / TS), Math.floor(s.y / TS))) { s.dead = true; burst(s.x, s.y, 3, [s.arrow ? '#e8dcc0' : s.spore ? '#c9a0ff' : s.acid ? '#b8d878' : '#ff9a5c'], 30, 0.2, 0, 1); if (s.lantern) { const ty = Math.floor(s.y / TS); const fy = isSolid(Math.floor(s.x / TS), ty) ? ty * TS : Math.floor((s.y + 8) / TS) * TS; fires.push({ x: s.x, y: fy, life: 2.4, delay: 0 }); SFX.crack(); if (inGas(s.x, s.y) && !P.gasCd) { P.gasCd = 2; gasBlast(s.x, s.y); } } if (s.acid) { for (let k = 0; k < 4; k++) parts.push({ x: s.x + (Math.random() - 0.5) * 10, y: s.y, vx: (Math.random() - 0.5) * 40, vy: -20, life: 0.4, max: 0.4, col: '#b8d878', size: 1, grav: 200 }); } if (s.fire && !s.reflected && s.life > 0) { const fy = Math.floor(s.y / TS) * TS; fires.push({ x: s.x, y: fy, life: 2.6, delay: 0 }); SFX.crack(); } if (s.slag) { const fy = Math.floor(s.y / TS) * TS; fires.push({ x: s.x, y: fy, life: 1.6, delay: 0 }); } if (s.spore && s.life > 0) clouds2.push({ x: s.x, y: s.y - 6, r: s.pod ? 20 : 11, life: s.pod ? 2.6 : 1.6, mild: true }); continue; }
    if (s.reflected) for (const e of enemies) if (e.alive && e.t !== 'queen' && e.t !== 'frog' && overlap({ l: s.x - 3, r: s.x + 3, t: s.y - 3, b: s.y + 3 }, box(e))) { s.dead = true; if (e.t === 'windcaller') knockCaller(e); hurtEnemy(e, 10, s.x - s.vx, false); number(e.x, e.y - e.h - 14, 'RETURNED', '#8fd160'); break; }
  }
  seeds = seeds.filter(s => !s.dead);
  if (bossMusicT > 0) { bossMusicT -= dt; if (bossMusicT <= 0 && bossActive) music.play(L.arena.music || 'boss'); }
  updateRain(dt); updateVines(dt); updateRocks(dt); updateEscape(dt);
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
function explode(x, y, r, dmgP) {
  burst(x, y, 24, ['#ffd36b', '#ff6b2c', '#5f5a52', '#1b1626'], 130, 0.7, 250, 2); shakeCam(6); hitstop(0.06); SFX.heavy(); SFX.crack(); zoomKick(1.06, 0.15);
  if (!P.dead && Math.hypot(P.x - x, P.y - 8 - y) < r) damagePlayer(x, dmgP, { up: true, unblockable: true });
  for (const e of enemies) if (e.alive && e.t !== 'chief' && Math.hypot(e.x - x, e.y - e.h / 2 - y) < r + 6) hurtEnemy(e, 30, x, false);
  if (boss && boss.alive && boss.t === 'chief' && Math.hypot(boss.x - x, boss.y - 10 - y) < r + 6) hurtEnemy(boss, 40, x, false);
  // palisade within reach shatters
  for (let ty = Math.floor((y - r) / TS); ty <= Math.floor((y + r) / TS); ty++) for (let tx = Math.floor((x - r) / TS); tx <= Math.floor((x + r) / TS); tx++) if (tileAt(tx, ty) === T.PALISADE) { const i = ty * LW + tx; L.grid[i] = T.AIR; tileSpr[i] = null; destroyed.add(i); burst(tx * TS + 8, ty * TS + 8, 6, ['#8a5a32', '#5c3a1d'], 80, 0.5); }
  for (const pr of props) if (pr.t === 'barrel' && !pr.gone && pr.fuse <= 0 && Math.hypot(pr.x - x, pr.y - 7 - y) < r) { pr.fuse = 0.15; }
}
// The ember: the pyromancer's fireball. dir 0 = ahead, 1 = straight down (in the air).
const inGas = (x = P.x, y = P.y) => (L.noSwing || []).some(z => x > z.x0 && x < z.x1 && y > z.y0 && y < z.y1);
function gasBlast(x, y) { // the whole chamber goes up: fire along the floor, and you with it
  const z = (L.noSwing || []).find(z => x > z.x0 && x < z.x1) || { x0: x - 80, x1: x + 80, y1: y }; const fy = Math.floor((z.y1 - 1) / TS) * TS;
  for (let fx = z.x0 + 8; fx < z.x1; fx += 14) fires.push({ x: fx, y: fy, life: 1.6, delay: Math.abs(fx - x) / 600 });
  for (const pr of props) if (pr.t === 'gas' && pr.x > z.x0 && pr.x < z.x1) pr.lit = Math.max(pr.lit || 0, 1.5);
  shakeCam(9); zoomKick(1.12, 0.3); SFX.thunder(); SFX.heavy(); flash = 0.2; killFlash = 0.08;
  if (!P.dead && P.x > z.x0 - 20 && P.x < z.x1 + 20) { damagePlayer(x - 10, DMG.gasBlast, { unblockable: true, up: true }); number(P.x, P.y - 24, 'IT IGNITES', '#ff9a5c'); P.vy = -160; }
  for (const e of enemies) if (e.alive && !e.harmless && !e.maxHp && e.x > z.x0 && e.x < z.x1 && Math.abs(e.y - fy) < 40) hurtEnemy(e, 40, x, false);
}
// every swing: count the run of them (THIRD CUT, CONCUSSION), and spend a waiting RIPOSTE
function startSwing() { const quick = time - (P.lastSwingT ?? -9) < 0.75; P.combo = quick ? (P.combo || 0) + 1 : 1; P.lastSwingT = time;
  P.heavySwing = (tal('thirdCut') || tal('concuss')) && P.combo % 3 === 0; const rip = tal('riposte') && P.riposteT > 0;
  P.swingMul = (P.heavySwing ? 1.5 : 1) * (rip ? 2 : 1); if (rip) { P.riposteT = 0; ringAt(P.x + P.face * 10, P.y - 10, 12, '#ffd36b', 0.2); } if (P.heavySwing) { SFX.heavy(); streaks(P.x + P.face * 12, P.y - 12, 5, ['#fff6e0', '#c9d1dc'], 140); } }
function swingDmg(e) { if (e.t === 'dummy') trialEvent('hit'); if (P.heavySwing) { if (!e.maxHp) { e.stagger = Math.max(e.stagger || 0, isPaladin() ? 1.2 : 0.6); e.vx = P.face * 170; } sparks(e.x, e.y - e.h / 2, P.face, 8); shakeCam(2.5, P.face * 2); } return Math.round(swordDmg() * (P.swingMul || 1)); }
// SHIELD BASH: the shield itself, driven into whatever is in front
function shieldBash() { P.bashCd = 0.45; P.vx = P.face * 140; P.bashT = 0.2; SFX.clank(); SFX.heavy(); shakeCam(2.5, P.face * 2); streaks(P.x + P.face * 10, P.y - 10, 6, ['#fff6e0', '#c9d1dc'], 130); dust(P.x, P.y, 4);
  const hb = { l: P.x + (P.face > 0 ? 2 : -24), r: P.x + (P.face > 0 ? 24 : -2), t: P.y - 20, b: P.y };
  for (const e of enemies) if (e.alive && !e.harmless && overlap(hb, box(e))) { hurtEnemy(e, 6, P.x, false); if (!e.maxHp) { e.stagger = Math.max(e.stagger || 0, 0.9); e.vx = P.face * 220; } sparks(e.x, e.y - e.h / 2, P.face, 6); }
  for (const s of seeds) if (!s.dead && !s.reflected && overlap(hb, { l: s.x - 3, r: s.x + 3, t: s.y - 3, b: s.y + 3 })) reflectSeed(s); }
function castEmber(dir) {
  if (P.dead || P.hurt > 0 || P.asleep > 0 || P.full) return;
  P.heat = Math.min(100, P.heat + (dir ? 12 : 18)); if (P.heat >= 100) bankHeat();
  if (!dir) P.castT = 0.2;
  if (inGas() && !P.gasCd) { P.gasCd = 2; gasBlast(P.x, P.y); }
  embers.push(dir ? { x: P.x, y: P.y - 4, vx: 0, vy: 230, life: 0.8, hit: new Set() } : { x: P.x + P.face * 8, y: P.y - 12, vx: P.face * 200, vy: -55, life: tal('skip') ? 2 : 1.1, hit: new Set() }); // (a skipping ember lives long enough to come down and skip)
  if (!dir && tal('twin')) embers.push({ x: P.x + P.face * 8, y: P.y - 12, vx: P.face * 175, vy: -165, life: tal('skip') ? 2.4 : 1.2, hit: new Set() }); // TWIN EMBER: a high one after the low
  P.atk = -1; SFX.ember(); burst(P.x + P.face * 8, P.y - 10, 5, ['#ff9a5c', '#ffd36b'], 40, 0.25, 0, 1);
}
// THE PYRE. The whole bar, all at once: one great ball of it that burns straight through the small
// ones, bursts on the first big one or on stone, and leaves the ground on fire where it goes off.
let pyres = [];
const PYRE_DMG = 42, PYRE_SPLASH = 16;
// THE PALADIN'S LIGHT: it comes from the maul landing and from whatever the Aegis turns aside, and it goes on
// mending or on JUDGEMENT.
function gainLight(n) { const was = (P.light || 0) >= 100; P.light = Math.min(100, (P.light || 0) + n * (1 + 0.1 * tal('radiance'))); if (!was && P.light >= 100) { SFX.lightFull(); ringAt(P.x, P.y - 10, 22, '#fff6c8', 0.4); } }
function castMend() { if ((P.light || 0) < 50) { SFX.buzz(); P.stFlash = 0.3; return; } P.light -= 50; P.rootT = 0.5; trialEvent('mend'); P.hp = Math.min(P.maxHp, P.hp + Math.round(20 * (1 + 0.1 * tal('devotion')))); if (tal('mercy')) P.st = Math.min(P.maxSt, P.st + 30); P.castT = 0.3; SFX.mend(); motes(P.x, P.y - 10, 18, 10); ringAt(P.x, P.y - 12, 22, '#fff6c8', 0.45); ringAt(P.x, P.y - 12, 12, '#ffd36b', 0.3); number(P.x, P.y - 24, '+20', '#fff6c8');
  for (let i = 0; i < 14; i++) parts.push({ x: P.x + (Math.random() - 0.5) * 16, y: P.y - Math.random() * 20, vx: 0, vy: -40 - Math.random() * 40, life: 0.7, max: 0.7, col: Math.random() < 0.5 ? '#ffd36b' : '#fff6c8', size: Math.random() < 0.3 ? 2 : 1, grav: -20 }); }
function castJudgement() { trialEvent('judgement'); P.light = 0; P.blastT = 0.5; P.inv = Math.max(P.inv, 0.6); P.vx = 0; SFX.judgement(); shakeCam(9); zoomKick(1.12, 0.35); killFlash = 0.035; hitstop(0.08); // a white flash: the red one is for being hurt
  for (let k = -2; k <= 2; k++) { bolts.push({ x: P.x + k * 44, y: P.y, life: 0.45, storm: true, holy: true }); ringAt(P.x + k * 44, P.y - 2, 14, '#fff6c8', 0.4); motes(P.x + k * 44, P.y - 4, 5, 6); } streaks(P.x, P.y - 12, 14, ['#fff6c8', '#ffd36b'], 220);
  for (const e of enemies) if (e.alive && !e.harmless && Math.abs(e.x - P.x) < 110 && Math.abs(e.y - P.y) < 80) { bolts.push({ x: e.x, y: e.y, life: 0.45, storm: true, holy: true }); hurtEnemy(e, e.maxHp ? 20 : 30, P.x, true); if (!e.maxHp && e.alive) e.stagger = Math.max(e.stagger || 0, 1.2); if (tal('smite') && e.alive) e.burn = Math.max(e.burn || 0, 3); }
}
function bankHeat() { if (P.full) return; trialEvent('heat'); P.full = true; P.fullT = tal('blaze') ? 10 : 5; SFX.heatFull(); ringAt(P.x, P.y - 10, 18, '#ffd36b', 0.3); burst(P.x, P.y - 10, 10, ['#ffd36b', '#fff6c8'], 50, 0.4, -40, 1); }
function castPyre() {
  P.full = false; P.heat = 0; P.fullT = 0; P.cHeld = -99; P.blastT = 0.34; P.atk = -1; P.jet = false;
  pyres.push({ x: P.x + P.face * 12, y: P.y - 11, vx: P.face * 250, dir: P.face, life: 1.5, t: 0, hit: new Set() });
  P.vx -= P.face * 90; shakeCam(4, -P.face * 2); zoomKick(1.08, 0.2); hitstop(0.05); SFX.pyre();
  burst(P.x + P.face * 14, P.y - 11, 16, ['#fff6c8', '#ffd36b', '#ff9a5c', '#ff6b2c'], 90, 0.45, 0, 2); streaks(P.x + P.face * 14, P.y - 11, 10, ['#fff6c8', '#ffd36b', '#ff9a5c'], 220); flame(P.x + P.face * 10, P.y - 11, 6, 4, 40, 3);
}
function pyreBurst(b) {
  if (b.done) return; b.done = true; b.life = 0;
  ringAt(b.x, b.y, 30, '#ffd36b', 0.35); ringAt(b.x, b.y, 46, '#ff6b2c', 0.5); burst(b.x, b.y, 26, ['#fff6c8', '#ffd36b', '#ff9a5c', '#ff6b2c'], 120, 0.6, 60, 2); flame(b.x, b.y, 18, 14, 90, 4); streaks(b.x, b.y, 12, ['#fff6c8', '#ffd36b', '#ff9a5c'], 240); smoke(b.x, b.y - 6, 6, 10);
  shakeCam(6); zoomKick(1.06, 0.18); SFX.pyreBoom();
  for (const e of enemies) if (e.alive && !e.harmless && !b.hit.has(e) && Math.abs(e.x - b.x) < 30 + e.w / 2 && Math.abs(e.y - e.h / 2 - b.y) < 30) { hurtEnemy(e, PYRE_SPLASH, b.x, false); e.burn = Math.max(e.burn || 0, 2); }
  // and the ground under it catches: webs and palisades go up, the lamps light
  let gy = Math.floor(b.y / TS); for (let k = 0; k < 6 && !isSolid(Math.floor(b.x / TS), gy) && !isOneWay(tileAt(Math.floor(b.x / TS), gy)); k++) gy++;
  for (const dx of [-16, 0, 16]) fires.push({ x: b.x + dx, y: gy * TS, life: 2.2, delay: Math.abs(dx) / 160, own: true });
  for (const pr of props) if ((pr.t === 'minerlamp' || pr.t === 'lantern') && !pr.lit && Math.abs(pr.x - b.x) < 40 && Math.abs(pr.y - b.y) < 40) { pr.lit = true; pr.hits = 0; SFX.spark(); }
}
function updatePyres(dt) {
  for (const b of pyres) { b.life -= dt; b.t += dt; b.x += b.vx * dt;
    for (let i = 0; i < 3; i++) if (Math.random() < dt * 60) parts.push({ x: b.x - b.dir * (4 + Math.random() * 8), y: b.y + (Math.random() - 0.5) * 9, vx: -b.dir * (30 + Math.random() * 40), vy: -20 - Math.random() * 30, life: 0.35, max: 0.35, col: '#ffd36b', size: 3, grav: -40, fire: true, drag: 1 });
    for (const s2 of seeds) if (!s2.dead && Math.abs(s2.x - b.x) < 14 && Math.abs(s2.y - b.y) < 14) { s2.dead = true; burst(s2.x, s2.y, 4, ['#ff9a5c'], 40, 0.3, 0, 1); }
    for (const c of clouds2) if (Math.abs(c.x - b.x) < c.r + 8 && Math.abs(c.y - b.y) < c.r + 8) c.life = Math.min(c.life, 0.2);
    for (const e of enemies) { if (!e.alive || e.harmless || b.hit.has(e)) continue;
      if (Math.abs(e.x - b.x) < e.w / 2 + 8 && b.y > e.y - e.h - 8 && b.y < e.y + 6) { b.hit.add(e);
        hurtEnemy(e, PYRE_DMG, b.x - b.dir * 10, false); e.burn = Math.max(e.burn || 0, 2.5);
        if (e.maxHp) { pyreBurst(b); break; } // a big one stops it; the small ones it goes straight through
        sparks(e.x, e.y - e.h / 2, b.dir, 6); } }
    if (!b.done && (isSolid(Math.floor((b.x + b.dir * 6) / TS), Math.floor(b.y / TS)) || b.life <= 0)) pyreBurst(b);
  }
  pyres = pyres.filter(b => !b.done && b.life > 0);
}
function flinch(e) { // a foe struck by an ember in the middle of a tell loses the attack
  if (!/Tell$/.test(e.mode || '') || e.t === 'ram' || e.t === 'mother') return false;
  e.stagger = Math.max(e.stagger, 0.9); e.flash = 0.2; number(e.x, e.y - e.h - 12, 'FLINCHES', '#8fd160'); SFX.yelp();
  if (e.t === 'greathound') { e.mode = 'skid'; e.modeT = 1.0; e.vx = e.face * 80; }
  else if (e.t === 'owl') { e.mode = 'parried'; e.modeT = 1.2; e.vx = 0; e.vy = -60; }
  else { e.modeT = Math.max(e.modeT || 0, 0.9); }
  return true;
}
function updateWisp(dt) {
  if (!wisp) return; const w = wisp; w.t += dt; w.life -= dt; w.cd = Math.max(0, w.cd - dt); if (Math.random() < dt * 30) flame(w.x, w.y + 2, 1, 2, 20, 2);
  if (w.life <= 0 || P.dead || !isPyro()) { burst(w.x, w.y, 8, ['#ffd36b', '#ff9a5c'], 40, 0.4, 0, 1); wisp = null; return; }
  if (w.target && (!w.target.alive || Math.hypot(w.target.x - P.x, w.target.y - P.y) > 140)) w.target = null;
  if (!w.target && w.cd <= 0) { let best = null, bd = 90; for (const e of enemies) if (e.alive && !e.harmless && e.t !== 'folk') { const dd = Math.hypot(e.x - P.x, e.y - 8 - (P.y - 8)); if (dd < bd) { bd = dd; best = e; } } w.target = best; }
  let tx = P.x + Math.cos(w.t * 3) * 14, ty = P.y - 16 + Math.sin(w.t * 3) * 5;
  if (w.target) { tx = w.target.x; ty = w.target.y - w.target.h / 2; }
  const dx = tx - w.x, dy = ty - w.y, dd = Math.hypot(dx, dy) || 1, sp = w.target ? 240 : 160; const st = Math.min(dd, sp * dt); w.x += dx / dd * st; w.y += dy / dd * st;
  if (w.target && dd < 8) { const e = w.target; const big = !!e.maxHp; hurtEnemy(e, big ? 4 : 8, w.x, false); if (!big) e.burn = Math.max(e.burn || 0, 1); burst(w.x, w.y, 6, ['#ffd36b', '#ff9a5c'], 50, 0.3, 0, 1); SFX.spark(); w.target = null; w.cd = 1.4; }
  if (Math.random() < dt * 30) parts.push({ x: w.x + (Math.random() - 0.5) * 4, y: w.y, vx: (Math.random() - 0.5) * 10, vy: -25, life: 0.3, max: 0.3, col: Math.random() < 0.5 ? '#ffd36b' : '#fff6c8', size: 1, grav: 0 });
  for (const pr of props) if ((pr.t === 'minerlamp' || pr.t === 'lantern') && !pr.lit && Math.abs(pr.x - w.x) < 18 && Math.abs(pr.y - 14 - w.y) < 24) { pr.lit = true; pr.hits = 0; burst(pr.x, pr.y - 8, 8, ['#ffd36b', '#fff6c8'], 50, 0.5); SFX.spark(); }
}
function updateEmbers(dt) {
  for (const b of embers) { b.life -= dt; b.vy += 110 * dt; b.x += b.vx * dt; b.y += b.vy * dt;
    if (Math.random() < dt * 50) flame(b.x - b.vx * 0.01, b.y, 1, 2, 22, 2);
    for (const s of seeds) if (!s.dead && Math.abs(s.x - b.x) < 9 && Math.abs(s.y - b.y) < 9) { s.dead = true; parries++; number(s.x, s.y - 8, 'BURNED', '#ff9a5c'); burst(s.x, s.y, 4, ['#ff9a5c'], 40, 0.3, 0, 1); }
    for (const c of clouds2) if (Math.abs(c.x - b.x) < c.r + 4 && Math.abs(c.y - b.y) < c.r + 4) c.life = Math.min(c.life, 0.2);
    for (const pr of props) if (pr.t === 'puffball' && !pr.popped && Math.abs(pr.x - b.x) < 9 && Math.abs(pr.y - 6 - b.y) < 9) { pr.popped = true; clouds2.push({ x: pr.x, y: pr.y - 6, r: 12, life: 1.5 }); burst(pr.x, pr.y - 6, 10, ['#e8e0d0', '#c8bcb0'], 60, 0.5); b.life = 0; }
    for (const e of enemies) { if (!e.alive || e.harmless || b.hit.has(e)) continue; if (Math.abs(e.x - b.x) < e.w / 2 + 5 && b.y > e.y - e.h - 5 && b.y < e.y + 5) { b.hit.add(e); const big = !!e.maxHp; if (e.t === 'ram' && !ramOpen(e)) { SFX.clank(); number(e.x, e.y - e.h - 8, 'HIS HIDE TURNS IT', '#9aa39a'); } else if (e.t === 'mother' || e.t === 'gill' || e.t === 'heart' || e.t === 'drone') { SFX.clank(); } else { hurtEnemy(e, Math.round(heatDmg(b.plunge ? (big ? 6 : 16) : (big ? 4 : 12)) * (b.plunge ? 1 + 0.15 * tal('firedropDmg') : 1)), b.x, false); if (!big) e.burn = Math.max(e.burn || 0, 1.4); flinch(e); if (e.t === 'dummy') trialEvent(b.plunge ? 'firedrop' : 'ember'); if (tal('stoke')) { P.heat = Math.min(100, (P.heat || 0) + 2 * tal('stoke')); if (P.heat >= 100 && !P.full) bankHeat(); } } b.life = 0; burst(b.x, b.y, 8, ['#ff9a5c', '#ffd36b', '#ff6b2c'], 60, 0.4, 100, 2); break; } }
    const tx = Math.floor(b.x / TS), ty = Math.floor(b.y / TS);
    if (b.life > 0 && isSolid(tx, ty) && tal('skip') && !b.bounced && !b.plunge && b.vy > 0 && !isSolid(tx, ty - 1)) { b.bounced = true; b.y = ty * TS - 3; b.vy = -170; fires.push({ x: b.x, y: ty * TS, life: 0.9, delay: 0, own: true }); flame(b.x, b.y, 4, 3, 45, 2); SFX.crack(); } // SKIPPING EMBER
    else if (b.life > 0 && isSolid(tx, ty)) { b.life = 0; const fy = isSolid(tx, ty) && !isSolid(tx, ty - 1) ? ty * TS : Math.floor((b.y - b.vy * dt) / TS) * TS + TS; if (b.vy > 0) fires.push({ x: b.x, y: fy, life: 1.2, delay: 0, own: true }); burst(b.x, b.y, 6, ['#ff9a5c', '#ffd36b'], 50, 0.35, 100, 1); flame(b.x, b.y, 5, 4, 60, 3); ringAt(b.x, b.y, 10, '#ff9a5c', 0.2); SFX.crack(); }
  }
  embers = embers.filter(b => b.life > 0);
}
// ---------- talk: signs, folk and the caged squire. One press opens the words; the world waits until they close. ----------
const NPC_NAME = { hillfolk: 'HILL FOLK', squire: 'TAM', cook: 'THE SCULLION', keeper: 'THE KEEPER', bard: 'THE BARD', oldknight: 'THE OLD KNIGHT', shepherd: 'THE SHEPHERD', ferryman: 'THE FERRYMAN', foreman: 'THE FOREMAN', lamplighter: 'THE LAMPLIGHTER', woodsman: 'THE WOODSMAN', hermit: 'THE HERMIT', miller: 'THE MILLER', elder: 'THE ELDER' };
function talkers() { // everything that can be talked to and is in reach, nearest first
  const out = [];
  for (const sg of signs) if (Math.abs(sg.x - P.x) < 28 && Math.abs(sg.y - P.y) < 48) out.push({ x: sg.x, y: sg.y, lines: [sg.text], who: sg, name: null });
  for (const pr of props) {
    if (pr.t === 'npc' && pr.kind !== 'keeper' && pr.kind !== 'ferryman' && Math.abs(P.x - pr.x) < 24 && Math.abs(P.y - pr.y) < 24) out.push({ x: pr.x, y: pr.y, lines: NPC_LINES(pr), who: pr, name: NPC_NAME[pr.kind] || null });
    if (pr.t === 'torchbracket' && !pr.taken && Math.abs(P.x - pr.x) < 16 && Math.abs(P.y - pr.y) < 24) out.push({ x: pr.x, y: pr.y - 6, lines: ['TORCH'], who: pr, name: null, take: true });
    if (pr.t === 'cage' && pr.kind === 'squire' && !pr.open && Math.abs(P.x - pr.x) < 28 && Math.abs(P.y - pr.y) < 48) out.push({ x: pr.x, y: pr.y, lines: ['KNIGHT! BREAK THE BARS!', 'THEY TOOK MY KIT. THREE COFFERS, SOMEWHERE IN THE CAMP.'], who: pr, name: 'TAM' });
  }
  return out.sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x));
}
function takeTorch(pr) { pr.taken = true; pr.respawnT = 45; P.torch = 30; SFX.spark(); SFX.puff(); burst(P.x, P.y - 14, 8, ['#ffd36b', '#ff9a5c'], 40, 0.4, 0, 1); number(P.x, P.y - 24, 'TORCH', '#ffd36b'); }
const camper = n => ({ t: 'npc', kind: 'hillfolk', x: (13 + n * 3) * TS + 8, y: (L.START.y + 1) * TS, i: n, anim: Math.random() * 6 });
function freeFolk(pr) { const tx = Math.floor(pr.x / TS), room = (L.interiors || []).find(([x0, x1]) => tx >= x0 && tx <= x1); const door = room && L.ents.find(e => e.t === 'doorway' && e.lock && e.x >= room[0] && e.x <= room[1]);
  props.push({ t: 'npc', kind: 'hillfolk', x: pr.x, y: pr.y, walkTo: door ? door.x * TS + 8 : pr.x + 40, anim: 0, i: 9 });
  props.push(camper(straysGot.size - 1)); SFX.sting(); }
function openTalk(t) { if (t.take) { takeTorch(t.who); return; } talk = { lines: t.lines.filter(Boolean), i: 0, who: t.who, name: t.name }; if (!talk.lines.length) { talk = null; return; } talkTo = t.who; state = 'talk'; SFX.text(); if (t.who && t.who.t === 'npc') t.who.lineI = 0; }
function closeTalk() { talk = null; talkTo = null; state = 'play'; SFX.menuClose(); }
const talkGlyph = () => padLast ? 'UP' : touchOn ? '^' : 'E';
function updateProps(dt) {
  windFx.t = Math.max(0, windFx.t - dt); if (windFx.t <= 0) { windFx.on = false; windFx.soon = false; }
  if (talkPress && state === 'play' && !P.dead && !(P.hurt > 0) && !(P.asleep > 0)) { const t = talkers()[0]; if (t) openTalk(t); }
  const hb = attackBox();
  if (embers.length) updateEmbers(dt);
  for (const s of silvers) if (!s.got && !P.dead && Math.abs(s.x - P.x) < 10 && Math.abs(s.y - (P.y - 7)) < 13) { s.got = true; const id = LEVELS[levelIndex].id; PROG[id] = PROG[id] || {}; PROG[id].silver = (PROG[id].silver || 0) | (1 << s.i); saveProgress(); const n = silvers.filter(q => q.got).length; SFX.medal(); SFX.sting(); number(s.x, s.y - 18, 'SILVER ' + n + '/' + silvers.length, '#dfe8ff'); burst(s.x, s.y, 12, ['#dfe8ff', '#ffffff'], 60, 0.6, -30, 1); ringAt(s.x, s.y, 20, '#dfe8ff', 0.4); slowT = 0.3; }
  for (const z of (L.gusts || [])) { if (z.arena && (!bossActive || callerCalm())) continue; const ph = (time + (z.phase || 0)) % z.period, on = ph < z.on, soon = ph > z.period - 0.5; const zd = z.alt ? (Math.floor((time + (z.phase || 0)) / z.period) % 2 ? -z.dir : z.dir) : z.dir; if (P.x > z.x0 && P.x < z.x1 && P.y > z.y0 && P.y <= z.y1 + 4) { windFx.dir = zd; windFx.on = on; windFx.soon = !on && soon; windFx.k = z.k || 1; windFx.t = 0.2; if (on && !P.dead) { P.vx += zd * (P.ground ? 200 : 260) * (z.k || 1) * dt; if (z.moor) P.gustT = 0.25; if (Math.random() < dt * 40) parts.push({ x: camX + Math.random() * VW, y: z.y0 + Math.random() * (z.y1 - z.y0), vx: zd * 220, vy: 0, life: 0.35, max: 0.35, col: '#dfe8c0', size: 1, grav: 0 }); } else if (soon && Math.random() < dt * 12) parts.push({ x: camX + Math.random() * VW, y: z.y0 + Math.random() * (z.y1 - z.y0), vx: zd * 90, vy: 0, life: 0.4, max: 0.4, col: '#c9d1a0', size: 1, grav: 0 }); } }
  for (const p of (L.pools || [])) { if (p.draining || p.y0 === undefined) continue; let lift = 0; if (p.tide) lift = 8 + Math.sin(time * 2 * Math.PI / 26) * 8; if (p.rise > 0) { p.rise -= dt; lift = Math.max(lift, 14); } if (p.tide || p.rise !== undefined) { const want = p.y0 - lift; p.y += (want - p.y) * Math.min(1, dt * 4); p.depth = (p.depth0 || 12) + (p.y0 - p.y); } }
  for (const p of (L.pools || [])) if (p.draining) { p.y += 34 * dt; if (Math.random() < dt * 30) parts.push({ x: p.x0 + Math.random() * (p.x1 - p.x0), y: p.y, vx: 0, vy: -20, life: 0.4, max: 0.4, col: '#eefaff', size: 1, grav: 0 }); if (p.y >= p.yTo) { p.y = p.yTo; p.draining = false; p.shallow = true; p.depth = 12; resolveTiles(); for (const e of L.ents) if (e.ifDrained !== undefined && e.ifDrained * TS === p.x0) spawnEnt(e); number((p.x0 + p.x1) / 2, p.y - 24, 'THE FROGS COME OUT', '#8fd160'); SFX.croak(); } }
  updateStals(dt); updateSkyProps(dt); updateCastleProps(dt, hb); updateAlarms(dt); updateGateFx(dt); updateHealths(dt); updateHoly(dt); updateSceptres(dt); updateTrial();
  for (const pr of props) {
    if (pr.t === 'barrel' && pr.gone) { pr.respawnT -= dt; if (pr.respawnT <= 0 && Math.abs(P.x - pr.x0) > 24) { pr.gone = false; pr.rolling = false; pr.vx = 0; pr.fuse = 0; pr.x = pr.x0; pr.y = pr.y0; burst(pr.x, pr.y - 7, 8, ['#8a5a32', '#c9b27c'], 40, 0.4); number(pr.x, pr.y - 20, 'ANOTHER BARREL', '#c9b27c'); } }
    if (pr.t === 'barrel' && !pr.gone) {
      if (pr.rolling) { pr.x += pr.vx * dt; pr.vx *= Math.pow(0.5, dt); const tx = Math.floor((pr.x + Math.sign(pr.vx) * 6) / TS), ty = Math.floor((pr.y - 6) / TS); if (isSolid(tx, ty)) { pr.vx = -pr.vx * 0.3; } if (!isSolid(Math.floor(pr.x / TS), Math.floor(pr.y / TS))) { pr.y += 120 * dt; } }
      if (pr.fuse > 0) { pr.fuse -= dt; if (Math.random() < dt * 20) parts.push({ x: pr.x + 2, y: pr.y - 14, vx: (Math.random() - 0.5) * 20, vy: -40, life: 0.3, max: 0.3, col: '#ffd36b', size: 1, grav: 0 }); if (pr.fuse <= 0) { pr.gone = true; pr.respawnT = 6; explode(pr.x, pr.y - 6, 40, DMG.bomb); } }
      else if (hb && overlap(hb, { l: pr.x - 6, r: pr.x + 6, t: pr.y - 14, b: pr.y })) { pr.rolling = true; pr.vx = P.face * 110; pr.fuse = 1.6; SFX.stone(); number(pr.x, pr.y - 20, 'FUSE LIT', '#ffd36b'); sparks(pr.x, pr.y - 8, P.face, 4); }
    }
    if (pr.t === 'cage' && !pr.open && hb && overlap(hb, { l: pr.x - 8, r: pr.x + 8, t: pr.y - 16, b: pr.y })) {
      pr.hp--; SFX.clank(); sparks(pr.x, pr.y - 8, P.face, 5); if (pr.hp <= 0) { pr.open = true; SFX.crack(); burst(pr.x, pr.y - 8, 8, ['#8b8378', '#b3aca0'], 60, 0.4);
        if (pr.kind === 'bird') { SFX.bird(); for (let i = 0; i < 3; i++) birds.push({ x: pr.x, y: pr.y - 8, vx: (Math.random() - 0.5) * 100, vy: -80 - Math.random() * 40, t: Math.random() * 3, life: 3 }); for (let i = 0; i < 4; i++) acorns.push({ x: pr.x + (i - 1.5) * 10, y: pr.y - 10, got: false, ph: 0, crate: 'cage' + pr.x, vy: -90 - Math.random() * 40 }); number(pr.x, pr.y - 24, 'FREED', '#8fd160'); }
        else if (pr.kind === 'squire') { marks.add('cage:' + pr.tx); props.push({ t: 'npc', x: pr.x, y: pr.y, kind: 'squire', anim: 0 }); number(pr.x, pr.y - 24, 'FREED', '#8fd160'); SFX.medal(); }
        else { foxes.push({ x: pr.x, y: pr.y, vx: 0, face: P.face, life: 9, t: 0, bite: 0 }); number(pr.x, pr.y - 24, 'A FRIEND', '#d9782a'); } }
      if (hb) P.hitSet.add(pr);
    }
    if (pr.t === 'felltree' && !pr.felled) { // four strokes, then it falls across the gap and its trunk is a bridge
      if (pr.fall > 0) { pr.fall += dt / 0.7; if (pr.fall >= 1) { pr.fall = 1; pr.felled = true; marks.add('tree:' + pr.tx); for (let x = pr.tx + 1; x <= pr.tx + pr.len; x++) { const i = pr.ty * LW + x; L.grid[i] = T.PLANK; tileSpr[i] = null; } resolveTiles(); shakeCam(5); SFX.heavy(); SFX.thud(); dust(pr.x + pr.dir * pr.len * 8, pr.y - 16, 14); burst(pr.x + pr.dir * pr.len * 14, pr.y - 20, 10, ['#57964f', '#2f5e3a'], 60, 0.6); number(pr.x + pr.dir * 48, pr.y - 34, 'A BRIDGE', '#8fd160'); } }
      else if (hb && overlap(hb, { l: pr.x - 7, r: pr.x + 7, t: pr.y - 60, b: pr.y }) && !P.hitSet.has(pr)) { P.hitSet.add(pr); pr.hp--; SFX.crack(); sparks(pr.x, pr.y - 20, P.face, 5); burst(pr.x, pr.y - 24, 6, ['#c9b27c', '#8a5a32'], 60, 0.5); pr.shake = 0.25; number(pr.x, pr.y - 70, pr.hp > 0 ? pr.hp + ' MORE' : 'TIMBER', '#ffd36b'); if (pr.hp <= 0) { pr.fall = 0.001; SFX.crack(); } }
      if (pr.shake > 0) pr.shake -= dt;
    }
    if (pr.t === 'sluice' && !pr.open && hb && overlap(hb, { l: pr.x - 7, r: pr.x + 7, t: pr.y - 22, b: pr.y }) && !P.hitSet.has(pr)) { P.hitSet.add(pr); pr.hits++; SFX.stone(); sparks(pr.x, pr.y - 12, P.face, 4); number(pr.x, pr.y - 28, pr.hits >= 3 ? 'THE GATE GIVES' : (3 - pr.hits) + ' MORE', '#ffd36b'); if (pr.hits >= 3) drainPool(pr); }
    if (pr.t === 'catapult' && !pr.wrecked) { // lobs barrels at where you are heading while you are in front of it; five hits wreck it
      if (pr.fired > 0) pr.fired -= dt;
      const d = pr.x - P.x;
      if (!P.dead && d > 30 && d < 300 && Math.abs(P.y - pr.y) < 60) { pr.timer -= dt; if (pr.timer <= 0) { pr.timer = pr.every; pr.fired = 0.5; const tt = 0.86, ax = P.x + P.vx * 0.3, bx = pr.x - 12; bombs.push({ x: bx, y: pr.y - 18, vx: (ax - bx) / tt, vy: -300, fuse: tt + 0.1, barrel: true }); SFX.thud(); SFX.charge(); number(pr.x, pr.y - 32, 'LOOSE', '#ff9a5c'); shakeCam(1); } }
      if (hb && overlap(hb, { l: pr.x - 16, r: pr.x + 16, t: pr.y - 22, b: pr.y }) && !P.hitSet.has(pr)) { P.hitSet.add(pr); pr.hp--; SFX.clank(); sparks(pr.x, pr.y - 10, P.face, 5); number(pr.x, pr.y - 32, pr.hp > 0 ? pr.hp + ' MORE' : 'WRECKED', pr.hp > 0 ? '#ffd36b' : '#8fd160'); if (pr.hp <= 0) { pr.wrecked = true; marks.add('cat:' + pr.tx); SFX.crack(); SFX.heavy(); burst(pr.x, pr.y - 12, 16, ['#8a5a32', '#5c3a1d', '#c9b27c'], 80, 0.6); shakeCam(3); for (let i = 0; i < 4; i++) acorns.push({ x: pr.x + (i - 1.5) * 8, y: pr.y - 14, got: false, ph: 0, crate: 'cat' + pr.tx, vy: -100 - Math.random() * 40 }); } }
    }
    if (pr.t === 'gas') { // vents green on a rhythm; an ember, a fire or a lit lamp nearby sets the vent off early. Lit, it is a fire and a blast.
      const ph = (time + pr.phase) % pr.period, venting = ph < pr.on; pr.armT = Math.max(0, pr.armT - dt); pr.lit = Math.max(0, pr.lit - dt);
      if (venting && pr.armT <= 0 && !(pr.lit > 0)) { if (Math.random() < dt * 30) parts.push({ x: pr.x + (Math.random() - 0.5) * 12, y: pr.y - 2, vx: (Math.random() - 0.5) * 16, vy: -40 - Math.random() * 30, life: 0.8, max: 0.8, col: '#8fd160', size: 2, grav: -40 }); const spark = embers.some(b => Math.abs(b.x - pr.x) < 16 && Math.abs(b.y - pr.y) < 26) || fires.some(f => f.delay <= 0 && Math.abs(f.x - pr.x) < 22 && Math.abs(f.y - pr.y) < 10) || (ph > pr.on - 0.3); if (spark) { pr.lit = 1.4; pr.armT = pr.period; explode(pr.x, pr.y - 8, 30, DMG.gas); for (const dx of [-14, 0, 14]) fires.push({ x: pr.x + dx, y: pr.y, life: 1.4, delay: 0 }); number(pr.x, pr.y - 24, 'THE SEAM IGNITES', '#8fd160'); } }
      else if (!venting && ph > pr.period - 0.6 && Math.random() < dt * 10) parts.push({ x: pr.x + (Math.random() - 0.5) * 8, y: pr.y - 2, vx: 0, vy: -20, life: 0.4, max: 0.4, col: '#6a9a5a', size: 1, grav: 0 });
    }
    if (pr.t === 'boiler') pr.cool = Math.max(0, (pr.cool || 0) - dt);
    if (pr.t === 'minerlamp') { pr.hitCd = Math.max(0, pr.hitCd - dt); if (!pr.lit && !P.dead) { // a cold lamp: strike it with the sword, an ember, or the pyromancer's flare
      const hb = attackBox(); const struck = hb && !P.plunge && hb.r > pr.x - 6 && hb.l < pr.x + 6 && hb.b > pr.y - 16 && hb.t < pr.y + 2;
      const emb = embers.find(b => Math.abs(b.x - pr.x) < 12 && Math.abs(b.y - (pr.y - 8)) < 14);
      const flare = isPyro() && P.jet && inJet(pr.x, pr.y - 8, 10);
      if (struck || emb || flare) { pr.lit = true; if (emb) emb.life = 0; burst(pr.x, pr.y - 8, 8, ['#ffd36b', '#fff6c8'], 50, 0.5); number(pr.x, pr.y - 26, 'LIT', '#ffd36b'); SFX.spark(); } }
      if (pr.lit && Math.random() < dt * 1.5) parts.push({ x: pr.x + (Math.random() - 0.5) * 4, y: pr.y - 12, vx: 0, vy: -8, life: 0.5, max: 0.5, col: '#8a8478', size: 1, grav: 0 }); }
    if (pr.t === 'stray' && pr.kind === 'canary' && !pr.got && !P.dead) { pr.songT = (pr.songT || 0) - dt; if (pr.songT <= 0) { pr.songT = 1.6 + Math.random(); const dd = Math.hypot(pr.x - P.x, pr.y - P.y); if (dd < 220 && SET.ambient) { SFX.bird(); number(pr.x + (Math.random() - 0.5) * 8, pr.y - 22, '~', '#ffe6a0'); } } }
    if (pr.t === 'boiler' && !(pr.burst > 0) && !(pr.cool > 0)) { const cart = movers.find(c => c.kind === 'cart' && !c.gone && (c.ridden || c.kicked) && Math.abs(c.vx) > 60 && Math.abs((c.x + c.w / 2) - pr.x) < 18 && Math.abs(c.y + c.h - pr.y) < 14); const ember = embers.find(b => Math.abs(b.x - pr.x) < 14 && b.y > pr.y - 40 && b.y < pr.y); pr.hitCd = Math.max(0, (pr.hitCd || 0) - dt); const hb = attackBox(); const struck = hb && !(pr.hitCd > 0) && hb.r > pr.x - 15 && hb.l < pr.x + 15 && hb.b > pr.y - 40 && hb.t < pr.y; const cook = isPyro() && P.jet && inJet(pr.x, pr.y - 8, 12); pr.cookT = cook ? (pr.cookT || 0) + dt : 0; if (cook && pr.cookT >= 0.25) { pr.cookT = 0; pr.hp--; burst(pr.x, pr.y - 20, 3, ['#ff9a5c', '#ffd36b'], 40, 0.3); number(pr.x, pr.y - 44, pr.hp > 0 ? 'THE VALVE COOKS: ' + pr.hp + ' MORE' : 'IT BURSTS', '#ffd36b'); } // the pyromancer's flare cooks the valve
      if (struck) { pr.hitCd = 0.3; pr.hp--; SFX.clank(); burst(pr.x + (P.x < pr.x ? -12 : 12), pr.y - 20, 4, ['#ffd36b', '#e8e0d0'], 40, 0.3); number(pr.x, pr.y - 44, pr.hp > 0 ? 'THE VALVE: ' + pr.hp + ' MORE' : 'IT BURSTS', '#ffd36b'); } if (ember) { ember.life = 0; pr.hp--; burst(pr.x, pr.y - 20, 6, ['#ff9a5c', '#e8e0d0'], 50, 0.4); number(pr.x, pr.y - 44, pr.hp > 0 ? pr.hp + ' MORE' : 'IT BURSTS', '#ffd36b'); } if (cart || pr.hp <= 0) { pr.burst = 3.2; pr.cool = 14; pr.hp = 6; if (cart) { cart.gone = true; cart.respawnT = 6; if (P.onMover === cart) { P.onMover = null; P.vx = -200; P.vy = -180; P.ground = false; } } burst(pr.x, pr.y - 20, 30, ['#e8e0d0', '#ffffff', '#ff9a5c'], 120, 0.9); shakeCam(8); SFX.heavy(); SFX.crack(); zoomKick(1.1, 0.4); const fm = enemies.find(q => q.alive && q.t === 'forgemaster'); if (fm) { fm.mode = 'scald'; fm.modeT = 3; fm.stagger = 3; fm.vx = 0; fm.hp -= 24; fm.flash = 0.3; number(fm.x, fm.y - fm.h - 12, 'SCALDED: HIT HIM', '#8fd160'); number(fm.x, fm.y - fm.h - 24, '-24', '#ff6b6b'); SFX.snort(); SFX.bossHurt(); if (fm.hp <= 0) fm.hp = 1; } } }
    if (pr.t === 'boiler' && pr.cool > 0 && !(pr.burst > 0) && Math.random() < dt * 4) parts.push({ x: pr.x + (Math.random() - 0.5) * 10, y: pr.y - 38, vx: 0, vy: -20, life: 0.5, max: 0.5, col: '#8a8478', size: 1, grav: 0 });
    if (pr.t === 'boiler' && pr.burst > 0) { pr.burst -= dt; if (Math.random() < dt * 30) parts.push({ x: pr.x + (Math.random() - 0.5) * 16, y: pr.y - 36, vx: (Math.random() - 0.5) * 30, vy: -60, life: 0.6, max: 0.6, col: '#e8e0d0', size: 2, grav: -20 }); }
    if (pr.t === 'hammer' && pr.drop > 0) { pr.drop -= dt; if (pr.drop <= 0 && !P.dead && Math.abs(P.x - pr.x) < 18 && Math.abs(P.y - pr.y) < 16 && P.ground) damagePlayer(pr.x, DMG.hammer, { unblockable: true, up: true }); if (pr.drop <= 0) { shakeCam(6); SFX.heavy(); dust(pr.x, pr.y, 12); for (const dd of [-1, 1]) waves.push({ x: pr.x + dd * 18, y: pr.y, dir: dd, life: 1.1, sp: 160 }); const fm = enemies.find(q => q.alive && q.t === 'forgemaster'); if (fm && Math.abs(fm.x - pr.x) < 24 && Math.abs(fm.y - pr.y) < 16) { fm.hp -= 60; fm.flash = 0.3; fm.mode = 'stun'; fm.modeT = 2.2; fm.stagger = 2.2; number(fm.x, fm.y - fm.h - 14, 'HAMMERED', '#8fd160'); hitstop(0.14); zoomKick(1.12, 0.3); SFX.bossHurt(); SFX.heavy(); if (fm.hp <= 0) hurtEnemy(fm, 1, pr.x, false); } } } // his own hammer, if a cart put him under it
    if (pr.t === 'hammer' && pr.tell > 0) { pr.tell -= dt; if (Math.random() < dt * 20) parts.push({ x: pr.x + (Math.random() - 0.5) * 30, y: pr.y - 2, vx: 0, vy: -20, life: 0.3, max: 0.3, col: '#ff9a5c', size: 1, grav: 0 }); if (pr.tell <= 0) pr.drop = 0.25; }
    if (pr.t === 'key' && !pr.got && !P.dead && Math.abs(pr.x - P.x) < 12 && Math.abs(pr.y - P.y + 6) < 18) {
      pr.got = true; marks.add('key:' + pr.kind); SFX.coin(); SFX.medal();
      burst(pr.x, pr.y, 12, ['#ffd34a', '#fff6c8', '#c9a83a'], 60, 0.7, -30, 2);
      number(pr.x, pr.y - 18, (KEY_NAME[pr.kind] || 'A KEY') + ' IS YOURS', '#ffd34a'); ringAt(pr.x, pr.y, 22, '#ffd36b', 0.4);
    }
    if (pr.t === 'lockgate' && !pr.open && !P.dead && Math.abs(pr.x - P.x) < 30 && Math.abs(pr.y - P.y) < 44) {
      if (hasKey(pr.needs)) { pr.open = true; marks.add('gate:' + pr.col); openGateCol(pr.col);
        number(pr.x, pr.y - 40, (KEY_NAME[pr.needs] || 'THE KEY') + ' TURNS', '#8fd160'); SFX.heavy(); SFX.stone(); shakeCam(4); zoomKick(1.06, 0.25);
        burst(pr.x, pr.y - 24, 14, ['#8a919c', '#c9b27c', '#ffd36b'], 70, 0.7); }
      else if (!pr.saidT || pr.saidT < time - 2.4) { pr.saidT = time; number(pr.x, pr.y - 40, 'IT WANTS ' + (KEY_NAME[pr.needs] || 'A KEY'), '#ff9a5c'); SFX.clank(); }
    }
    // The doorway is on the TALK key, not UP: ArrowUp is bound to jump, so "press up to enter" would
    // just make the knight hop on the step. E is already how he speaks to people.
    if (pr.t === 'doorway' && !P.dead && !warp && !talk && (P.ground || P.coyote > 0) && Math.abs(pr.x - P.x) < 13 && Math.abs(pr.y - P.y) < 22) {
      if (pr.needs && !hasKey(pr.needs)) { if (talkPress) { number(pr.x, pr.y - 30, 'BARRED. ' + (KEY_NAME[pr.needs] || 'A KEY') + ' OPENS IT', '#ff9a5c'); SFX.clank(); } }
      else if (talkPress) warpTo(pr);
    }
    if (pr.t === 'firepit') { const ph = ((time + pr.phase) % pr.period), on = ph < pr.on; if (on && !pr.lit) { pr.lit = true; fires.push({ x: pr.x, y: pr.y, life: pr.on, delay: 0, pit: true }); SFX.puff(); } if (!on) pr.lit = false; if (!on && ph > pr.period - 0.5 && Math.random() < dt * 24) parts.push({ x: pr.x + (Math.random() - 0.5) * 10, y: pr.y - 2, vx: 0, vy: -30, life: 0.3, max: 0.3, col: '#ff9a5c', size: 1, grav: 0 }); }
    if (pr.t === 'chainpost' && !pr.cut && hb && overlap(hb, { l: pr.x - 8, r: pr.x + 10, t: pr.y - 24, b: pr.y }) && !P.hitSet.has(pr)) { P.hitSet.add(pr); pr.hp--; SFX.clank(); sparks(pr.x + 6, pr.y - 12, P.face, 5); number(pr.x, pr.y - 30, pr.hp > 0 ? pr.hp + ' MORE' : 'LOOSE', '#ffd36b'); if (pr.hp <= 0) { pr.cut = true; marks.add('chain:' + pr.tx); SFX.crack(); SFX.bark(); const mb = enemies.find(q => q.alive && q.t === 'greathound'); enemies.push({ t: 'hound', x: pr.x + 8, y: pr.y, vx: 0, vy: -100, w: 12, h: 7, hp: 30, hp0: 30, speed: 120, face: mb ? Math.sign(mb.x - pr.x) || 1 : 1, alive: true, dying: 0, anim: 0, flash: 0, stagger: 0, timer: 0, air: false, turncoat: true, retreat: 0, biteT: 0 }); number(pr.x + 8, pr.y - 20, 'IT HATES THE BIG ONE', '#8fd160'); } }
    // striking a crystal ledge is how you open a route, and how you drop one on a goblin
    if (L.hasCryst && hb && !P.crystHit) { const tx0 = Math.floor(hb.l / TS), tx1 = Math.floor(hb.r / TS), ty0 = Math.floor(hb.t / TS), ty1 = Math.floor(hb.b / TS);
      for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) { const i = ty * LW + tx;
        if (L.grid[i] === T.CRYST && !P.hitSet.has('c' + i)) { P.hitSet.add('c' + i); crackCrystal(i, 2); sparks(tx * TS + 8, ty * TS + 8, P.face, 4); } } }
    if (pr.t === 'lantern' && !pr.lit && hb && overlap(hb, { l: pr.x - 7, r: pr.x + 7, t: pr.y - 36, b: pr.y }) && !P.hitSet.has(pr)) { P.hitSet.add(pr); pr.hits++; SFX.clank(); sparks(pr.x, pr.y - 28, P.face, 4); if (pr.hits >= 2) { pr.lit = true; pr.hits = 0; number(pr.x, pr.y - 42, 'LIT', '#ffd36b'); SFX.sting(); burst(pr.x, pr.y - 30, 10, ['#ffd36b', '#fff6c8'], 50, 0.6, -20, 1); } else number(pr.x, pr.y - 42, 'STRIKE IT AGAIN', '#ffd36b'); }
    if (pr.t === 'nest') { if (pr.puff > 0) pr.puff -= dt; if (!P.dead && Math.abs(P.x - pr.x) < 340) { pr.timer -= dt; if (pr.timer <= 0) { pr.timer = pr.every; props.push({ t: 'roller', x: pr.x + pr.dir * 10, y: pr.y, vx: pr.dir * 55, alive: true, rot: 0, tumble: true, life: 10, vy: 0 }); SFX.puff(); burst(pr.x, pr.y - 8, 6, ['#e8e0d0', '#c8bcb0'], 40, 0.4); pr.puff = 0.3; } } }
    if (pr.t === 'tether' && !pr.cut) { pr.hitCd = Math.max(0, pr.hitCd - dt); if (hb && !P.hitSet.has(pr) && overlap(hb, { l: pr.x - 6, r: pr.x + 6, t: pr.y - 16, b: pr.y })) { P.hitSet.add(pr); pr.hp--; SFX.clank(); sparks(pr.x, pr.y - 10, P.face, 4); if (pr.hp <= 0) { pr.cut = true; SFX.crack(); SFX.throwWhoosh(); burst(pr.x, pr.y - 12, 8, ['#c9d1dc', '#8b6a2a'], 60, 0.5); number(pr.x, pr.y - 26, 'THE LINE GOES', '#bfe6f5'); const wc = enemies.find(q => q.alive && q.t === 'windcaller'); if (wc && wc.phase === 1 && wc.mode !== 'sleep') { const left = props.filter(q => q.t === 'tether' && !q.cut).length; if (left === 0) { wc.mode = 'torn'; wc.modeT = 2.4; wc.stagger = 2.4; wc.vx = 0; number(wc.x, wc.y - 30, 'THE KITE TEARS FREE', '#ff6b6b'); SFX.roar(); shakeCam(6); zoomKick(1.1, 0.3); } else { wc.mode = 'yanked'; wc.modeT = 2.6; wc.stagger = 2.6; number(wc.x, wc.y - 30, 'PULLED OFF HIS FEET', '#8fd160'); SFX.gasp(); } } } else number(pr.x, pr.y - 22, 'FRAYS', '#ffd36b'); } }
    if (pr.t === 'mirror') { pr.turnT = Math.max(0, pr.turnT - dt); pr.glow = Math.max(0, (pr.glow || 0) - dt); if (!pr.fixed && hb && !P.hitSet.has(pr) && overlap(hb, { l: pr.x - 7, r: pr.x + 7, t: pr.y - 16, b: pr.y })) { P.hitSet.add(pr); pr.o = 1 - pr.o; pr.turnT = 0.25; SFX.clank(); SFX.spark(); sparks(pr.x, pr.y - 8, P.face, 5); number(pr.x, pr.y - 22, 'TURNED', '#bfe6f5'); } }
    if (pr.t === 'rack' && !pr.broken && hb && overlap(hb, { l: pr.x - 7, r: pr.x + 7, t: pr.y - 18, b: pr.y }) && !P.hitSet.has(pr)) { P.hitSet.add(pr); pr.hp--; SFX.clank(); sparks(pr.x, pr.y - 10, P.face, 4); if (pr.hp <= 0) { pr.broken = true; SFX.crack(); burst(pr.x, pr.y - 8, 12, ['#8b6a2a', '#c9b27c', '#5c3a1d'], 70, 0.6); number(pr.x, pr.y - 26, (pr.kind === 'club' ? 'THE CLUB' : 'THE BOW') + ' IS GONE', '#8fd160'); const ch = enemies.find(q => q.alive && q.t === 'chief'); if (ch && ch.mode === 'toRack' && ch.next === pr.kind) { ch.mode = 'swap'; ch.modeT = 0.6; chiefSwap(ch, 'sword'); } } }
    if (pr.t === 'wisp' && !pr.cut) { pr.y = pr.y0 + Math.sin(time * 1.7 + pr.ph) * 4; if (hb && overlap(hb, { l: pr.x - 6, r: pr.x + 6, t: pr.y - 10, b: pr.y + 2 })) { pr.cut = true; SFX.spark(); SFX.sting(); burst(pr.x, pr.y - 4, 14, ['#bfe6f5', '#e8fff8', '#8fd160'], 60, 0.7, -20, 1); number(pr.x, pr.y - 20, 'THE FOG THINS', '#bfe6f5'); } }
    if (pr.t === 'brazier' && pr.lit && !pr.tipped && hb && overlap(hb, { l: pr.x - 7, r: pr.x + 7, t: pr.y - 16, b: pr.y })) {
      pr.tipped = true; pr.lit = false; SFX.crack(); const dir = P.face; number(pr.x, pr.y - 22, 'OIL!', '#ff9a5c');
      for (let i = 1; i <= 5; i++) fires.push({ x: pr.x + dir * i * 14, y: pr.y, life: 6 + i * 0.3, delay: i * 0.12 });
    }
    if (pr.t === 'crank' && !pr.open && hb && overlap(hb, { l: pr.x - 6, r: pr.x + 6, t: pr.y - 14, b: pr.y }) && !P.hitSet.has(pr)) {
      P.hitSet.add(pr); pr.hits++; SFX.stone(); sparks(pr.x, pr.y - 8, P.face, 4); number(pr.x, pr.y - 20, pr.hits >= 3 ? 'OPEN' : (3 - pr.hits) + ' MORE', '#ffd36b');
      if (pr.hits >= 3) { pr.open = true; for (let ty = 0; ty < LH; ty++) { const i = ty * LW + pr.wall; if (L.grid[i] === T.PALISADE) { L.grid[i] = T.AIR; tileSpr[i] = null; destroyed.add(i); burst(pr.wall * TS + 8, ty * TS + 8, 4, ['#8a5a32', '#5c3a1d'], 60, 0.5); } } SFX.heavy(); shakeCam(3); }
    }
  }
  for (const pr of props) {
    if (pr.t === 'relic' && !pr.got && !P.dead && Math.abs(pr.x - P.x) < 10 && Math.abs(pr.y - 6 - (P.y - 8)) < 14) { pr.got = true; P.relic = pr.kind; const R = RELICS[pr.kind]; { const id = LEVELS[levelIndex].id; PROG[id] = PROG[id] || {}; PROG[id].relic = pr.kind; saveProgress(); } number(pr.x, pr.y - 26, R.name, R.col); number(pr.x, pr.y - 16, R.desc, '#fff6e0'); SFX.sting(); SFX.medal(); burst(pr.x, pr.y - 8, 18, [R.col, '#fff6e0'], 60, 0.8, -30, 1); ringAt(pr.x, pr.y - 8, 24, R.col, 0.4); slowT = 0.5; }
    if (pr.t === 'bell' && !pr.broken) { if (hb && overlap(hb, { l: pr.x - 7, r: pr.x + 7, t: pr.y - 22, b: pr.y }) && !P.hitSet.has(pr)) { P.hitSet.add(pr); pr.hp--; SFX.clank(); sparks(pr.x, pr.y - 12, P.face, 5); pr.swing = 0.5; if (pr.hp <= 0) { pr.broken = true; SFX.crack(); burst(pr.x, pr.y - 12, 10, ['#e0b040', '#b8842a'], 70, 0.6); number(pr.x, pr.y - 30, 'SILENCED', '#8fd160'); } } if (pr.swing > 0) pr.swing -= dt; if (pr.ringT > 0 && !pr.rung && !enemies.some(e => e.alive && e.ringer && Math.abs(e.x - pr.x) < 10)) pr.ringT = Math.max(0, pr.ringT - dt); }
    if (pr.t === 'crusher' && Math.abs(P.x - pr.x) < 300) { // THE PRESS: dust, then the slab drops. Under it when it lands is the end of you.
      if (pr.st === 'up') { pr.timer -= dt; if (pr.timer <= 0) { pr.st = 'tell'; pr.timer = 0.5; SFX.rattle(0.6); } if (pr.timer < 0.5 && pr.timer > 0 && Math.random() < dt * 20) parts.push({ x: pr.x + (Math.random() - 0.5) * 24, y: pr.y - pr.D + 2, vx: 0, vy: 40 + Math.random() * 40, life: 0.5, max: 0.5, col: '#8a919c', size: 1, grav: 300 }); }
      else if (pr.st === 'tell') { pr.timer -= dt; if (Math.random() < dt * 30) parts.push({ x: pr.x + (Math.random() - 0.5) * 28, y: pr.y - pr.D + 4, vx: 0, vy: 60, life: 0.4, max: 0.4, col: '#8a919c', size: 1, grav: 400 }); if (pr.timer <= 0) { pr.st = 'drop'; SFX.rumble(); } }
      else if (pr.st === 'drop') { pr.h = Math.min(pr.D, pr.h + 900 * dt); if (pr.h >= pr.D) { pr.st = 'down'; pr.timer = 0.7; shakeCam(5); SFX.heavy(); SFX.stone(); dust(pr.x - 12, pr.y, 6); dust(pr.x + 12, pr.y, 6);
        if (!P.dead && Math.abs(P.x - pr.x) < 18 && P.y > pr.y - 22 && P.y <= pr.y + 2 && !invulnerable()) { damagePlayer(pr.x, DMG.crush, { unblockable: true }); P.vx = (Math.sign(P.x - pr.x) || 1) * 200; P.vy = -120; P.ground = false; if (P.onMover) P.onMover = null; number(P.x, P.y - 24, 'CRUSHED', '#ff6b6b'); hitstop(0.08); }
        for (const e of enemies) if (e.alive && !e.harmless && !e.maxHp && Math.abs(e.x - pr.x) < 18 && Math.abs(e.y - pr.y) < 8) { hurtEnemy(e, 40, pr.x, false); number(e.x, e.y - e.h - 12, 'PRESSED', '#8fd160'); } } }
      else if (pr.st === 'down') { pr.timer -= dt; if (pr.timer <= 0) pr.st = 'rise'; }
      else if (pr.st === 'rise') { pr.h = Math.max(0, pr.h - 70 * dt); if (pr.h <= 0) { pr.st = 'up'; pr.timer = pr.every; } }
    }
    if (pr.t === 'beam') { pr.cd = Math.max(0, pr.cd - dt); const m = P.onMover; if (m && m.kind === 'cart' && !keys.down && !P.dead && pr.cd <= 0 && Math.abs(P.x - pr.x) < 10 && Math.abs(P.y - pr.y) < 16) { pr.cd = 1; damagePlayer(pr.x, DMG.beam, { unblockable: true }); P.onMover = null; P.vy = -80; P.vx = -Math.sign(m.vx || m.dir) * 160; P.ground = false; number(P.x, P.y - 24, 'OFF THE CART', '#ff6b6b'); SFX.thud(); sparks(P.x, P.y - 16, 1, 5); } }
    if (pr.t === 'dog' && !P.dead) { pr.anim += dt; pr.barkT = Math.max(0, pr.barkT - dt); pr.vy = Math.min(320, pr.vy + 1000 * dt);
      const dx = P.x - pr.x, far = Math.abs(dx) > 40; let want = 0;
      if (Math.abs(dx) > 340 || Math.abs(P.y - pr.y) > 120) { pr.x = P.x - P.face * 20; pr.y = P.y; pr.vy = 0; } // it catches up the way dogs do
      else if (far) { pr.face = Math.sign(dx); want = pr.face * Math.min(150, 60 + Math.abs(dx)); pr.sit = 0; }
      else { pr.sit = (pr.sit || 0) + dt; if (Math.abs(P.vx) > 20) { pr.face = P.face; pr.sit = 0; } }
      pr.vx += (want - pr.vx) * Math.min(1, dt * 8);
      const ftx = Math.floor((pr.x + Math.sign(pr.vx || pr.face) * 8) / TS), fty = Math.floor((pr.y + 1) / TS);
      if (pr.vy === 0 && Math.abs(pr.vx) > 20 && isSolid(ftx, fty - 1) && !isSolid(ftx, fty - 3)) pr.vy = -230; // a low step: hop it
      const r = moveBody(pr, pr.vx * dt, pr.vy * dt, false); if (r.ground) pr.vy = 0;
      const ewe = props.find(q => q.t === 'stray' && !q.got && Math.abs(q.x - pr.x) < 150 && Math.abs(q.y - pr.y) < 80);
      if (ewe && pr.barkT <= 0) { pr.barkT = 1.6; pr.face = Math.sign(ewe.x - pr.x) || pr.face; SFX.bark(); }
    }
    if (pr.t === 'torchbracket' && pr.taken) { pr.respawnT -= dt; if (pr.respawnT <= 0 && Math.abs(P.x - pr.x) > 40) { pr.taken = false; SFX.spark(); } }
    if (pr.t === 'anvil') pr.ring = Math.max(0, (pr.ring || 0) - dt);
    if (pr.t === 'hotplate') { if (pr.glow > 0) { pr.glow -= dt; if (Math.random() < dt * 10) parts.push({ x: pr.x + (Math.random() - 0.5) * 24, y: pr.y - 1, vx: 0, vy: -20, life: 0.4, max: 0.4, col: '#ff6b2c', size: 1, grav: 0 }); if (pr.glow <= 0) { pr.hot = 3; SFX.hiss(); burst(pr.x, pr.y - 2, 8, ['#ff6b2c', '#ffd36b'], 40, 0.4, -60, 1); } }
      if (pr.hot > 0) { pr.hot -= dt; if (Math.random() < dt * 20) parts.push({ x: pr.x + (Math.random() - 0.5) * 28, y: pr.y - 2, vx: 0, vy: -50, life: 0.3, max: 0.3, col: Math.random() < 0.5 ? '#ff6b2c' : '#ffd36b', size: 2, grav: 0 }); if (!P.dead && P.ground && Math.abs(P.x - pr.x) < 16 && Math.abs(P.y - pr.y) < 4 && !(pr.cd > 0)) { pr.cd = 0.5; if (isPyro() && tal('kindle')) { if (P.hp < P.maxHp) { P.hp = Math.min(P.maxHp, P.hp + 1); } } else damagePlayer(pr.x, DMG.hotplate, { unblockable: true, up: true }); } } pr.cd = Math.max(0, (pr.cd || 0) - dt); }
    if (pr.t === 'firevent' && Math.abs(P.x - pr.x) < 260) { // a chimney: smoke first, then a gout of flame you jump
      pr.timer -= dt; pr.on = Math.max(0, pr.on - dt);
      if (pr.timer < 0.6 && pr.timer > 0 && Math.random() < dt * 24) parts.push({ x: pr.x + (Math.random() - 0.5) * 6, y: pr.y - 10, vx: (Math.random() - 0.5) * 12, vy: -30 - Math.random() * 20, life: 0.6, max: 0.6, col: '#8a8478', size: 2, grav: -10 });
      if (pr.timer <= 0) { pr.timer = pr.every; pr.on = 0.8; fires.push({ x: pr.x, y: pr.y, life: 0.8, delay: 0, vent: true }); SFX.puff(); burst(pr.x, pr.y - 14, 6, ['#ff9a5c', '#ffd36b'], 40, 0.4, -60, 2); }
      if (pr.on > 0 && Math.random() < dt * 30) parts.push({ x: pr.x + (Math.random() - 0.5) * 8, y: pr.y - 12 - Math.random() * 16, vx: (Math.random() - 0.5) * 10, vy: -60, life: 0.3, max: 0.3, col: Math.random() < 0.5 ? '#ff9a5c' : '#ffd36b', size: 2, grav: 0 });
    }
    if (pr.t === 'rockfall' && !P.dead && Math.abs(P.x - pr.x) < 230) { pr.timer -= dt; if (pr.timer < 0.8 && Math.random() < dt * 45) parts.push({ x: pr.x + (Math.random() - 0.5) * 10, y: pr.y + 2, vx: (Math.random() - 0.5) * 20, vy: 20 + Math.random() * 30, life: 0.4, max: 0.4, col: '#8a919c', size: 1, grav: 200 }); if (pr.timer <= 0) { pr.timer = pr.every; rocks.push({ x: pr.x, y: pr.y, vy: 0, t: 0, dead: false }); SFX.stone(); } }
    if (pr.t === 'npc' && pr.kind === 'keeper' && !P.dead && state === 'play' && talkPress && Math.abs(P.x - pr.x) < 24 && Math.abs(P.y - pr.y) < 20) { storeMode = 'buy'; state = 'store'; storeI = 0; SFX.uiSel(); SFX.menuOpen && SFX.menuOpen(); }
    if (pr.t === 'exit' && !P.dead && state === 'play' && talkPress && Math.abs(P.x - pr.x) < 14) { state = 'map'; map.node = Math.max(0, NODES.findIndex(n => n.kind === 'store' && (n.shop || 'shop') === LEVELS[levelIndex].id)); map.seg = NODE_AT[map.node]; map.t = 0; setView('normal'); SFX.uiSel(); music.play(menuTrack()); }
    if (pr.t === 'npc' && pr.ride) { const fm = movers.find(mv => mv.ferry); if (fm) { pr.x = fm.x + 16; pr.y = fm.y; } }
    if (pr.t === 'npc' && pr.kind === 'ferryman' && !P.dead && state === 'play' && talkPress && Math.abs(P.x - pr.x) < 30 && Math.abs(P.y - pr.y) < 24) { const fm = movers.find(mv => mv.ferry); if (fm && !fm.paid) { if (PROG.coins >= fm.toll) { PROG.coins -= fm.toll; saveProgress(); fm.paid = true; marks.add('ferry:' + fm.x0); SFX.coin(); SFX.uiSel(); number(pr.x, pr.y - 28, 'PAID ' + fm.toll + ' GOLD', '#ffd34a'); number(pr.x, pr.y - 38, 'STEP ABOARD', '#bfe6f5'); } else { SFX.clank(); number(pr.x, pr.y - 28, 'NOT ENOUGH GOLD', '#ff6b6b'); } } }
    if (pr.t === 'stray' && !pr.got && !P.dead && Math.abs(pr.x - P.x) < 12 && Math.abs(pr.y - P.y) < 16) { const Q = questOf(); pr.got = true; straysGot.add(pr.x); if (pr.kind === 'folk') freeFolk(pr); strayLast = { x: pr.x, y: pr.y }; if (pr.kind === 'sheep') SFX.bleat(); else if (pr.kind === 'canary') { SFX.bird(); SFX.sting(); } else { SFX.coin(); SFX.sting(); } burst(pr.x, pr.y - 4, 8, ['#e8e0d0', '#fff6c8'], 50, 0.5); number(pr.x, pr.y - 18, Q.name + ' ' + straysGot.size + '/' + Q.n, '#ffe6a0'); if (straysGot.size >= Q.n) questDone(pr.x, pr.y); }
    if (pr.t === 'lever' && !pr.on && hb && overlap(hb, { l: pr.x - 6, r: pr.x + 6, t: pr.y - 14, b: pr.y })) { pr.on = true; SFX.stone(); const ram = props.find(r => r.t === 'ram' && Math.floor(r.x / TS) === pr.ram); if (ram) { ram.active = 3.2; ram.tm = 0; ram.hit.clear(); number(pr.x, pr.y - 20, 'THE RAM SWINGS', '#ffd36b'); } }
    if (pr.t === 'ram' && pr.active > 0) { pr.active -= dt; pr.tm += dt; pr.th = Math.sin(pr.tm * 4.2) * 1.35 * Math.min(1, pr.active / 1.2); const pts = [30, 44, 58, 72].map(r => [pr.x + Math.sin(pr.th) * r, pr.y + Math.cos(pr.th) * r]); const nearSeg = (x, y) => pts.some(([qx, qy]) => Math.hypot(x - qx, y - qy) < 14); if (Math.abs(pr.th) > 0.12) { if (!P.dead && nearSeg(P.x, P.y - 8)) damagePlayer(pr.x, DMG.ram, { up: true, unblockable: true }); for (const e of enemies) if (e.alive && !pr.hit.has(e) && nearSeg(e.x, e.y - e.h / 2)) { pr.hit.add(e); hurtEnemy(e, 30, pr.x, false); } } if (pr.active <= 0) pr.th = 0; }
    if (pr.t === 'plate' && !pr.down) { const on = (!P.dead && P.ground && Math.abs(P.x - pr.x) < 10 && Math.abs(P.y - pr.y) < 4) || enemies.some(e => e.alive && Math.abs(e.x - pr.x) < 10 && Math.abs(e.y - pr.y) < 4); if (on) { pr.down = true; SFX.stone(); const cg = props.find(c => c.t === 'dropcage' && Math.floor(c.x / TS) === pr.cage); if (cg && !cg.dropped) { cg.dropped = true; cg.landed = 0; cg.hit.clear(); if (cg.boss) cg.resetT = 5; number(cg.x, cg.y - 20, 'THE CAGE FALLS', '#ffd36b'); SFX.crack(); shakeCam(2); } } }
    if (pr.t === 'dropcage' && pr.boss && pr.dropped && pr.landed > 0) { pr.resetT -= dt; if (pr.resetT <= 0) { pr.dropped = false; pr.landed = 0; pr.y = pr.y0; pr.hit.clear(); SFX.stone(); for (const pl of props) if (pl.t === 'plate' && pl.cage === Math.floor(pr.x / TS)) pl.down = false; } }
    if (pr.t === 'dropcage' && pr.dropped) { if (pr.landed <= 0) { pr.y += 320 * dt; const ty = Math.floor((pr.y + 1) / TS); if (isSolid(Math.floor(pr.x / TS), ty)) { pr.y = ty * TS; pr.landed = 1; shakeCam(4); SFX.heavy(); dust(pr.x, pr.y, 8); if (!P.dead && Math.abs(P.x - pr.x) < 9 && Math.abs(P.y - pr.y) < 6) { damagePlayer(pr.x, DMG.cage, { up: true, unblockable: true }); P.caged = 1.4; number(P.x, P.y - 24, 'CAUGHT', '#ff6b6b'); } let caught = false; for (const e of enemies) if (e.alive && e.t !== 'bearer' && Math.abs(e.x - pr.x) < (e.t === 'king' ? 30 : 10) && Math.abs(e.y - pr.y) < (e.t === 'king' ? 16 : 8)) { if (e.t === 'king') { caught = true; e.mode = 'held'; e.modeT = 3.2; e.stagger = 3.2; e.vx = 0; e.open = 0; e.thrown = e.thrown || null; SFX.bellow(); hitstop(0.12); zoomKick(1.1, 0.3); } hurtEnemy(e, e.t === 'king' ? 40 : 30, pr.x, false); number(e.x, e.y - e.h - 12, 'CAUGHT', '#8fd160'); }
      if (pr.boss && !caught && bossActive && !P.dead) { enemies.push({ t: 'hound', x: pr.x, y: pr.y, vx: 0, vy: -120, w: 12, h: 7, hp: EHP.hound, speed: 105, face: Math.sign(P.x - pr.x) || 1, alive: true, dying: 0, anim: Math.random(), flash: 0, stagger: 0.3 }); number(pr.x, pr.y - 26, 'IT WAS NOT EMPTY', '#ff6b6b'); SFX.bark(); } /* the King keeps hounds in his cages */ } } }
    if (pr.t === 'vent') { // an updraft of spores on a timer: ride it up
      const wasOn = pr.active;
      pr.active = ((time + pr.phase) % pr.period) < pr.on; pr.warm = ((time + pr.phase) % pr.period) > pr.period - 0.6;
      if (pr.heat && pr.active && !wasOn && Math.abs(pr.x - P.x) < 220 && Math.abs(pr.y - P.y) < 160) { SFX.puff(); SFX.charge(); }
      // a breath with glass over it crazes the glass and then blows it out, and the pieces go up with it
      if (pr.glass && pr.active && L.hasCryst) { pr.glassT = (pr.glassT || 0) + dt;
        const tx0 = Math.floor((pr.x - 12) / TS), tx1 = Math.floor((pr.x + 12) / TS), ty0 = Math.floor((pr.y - pr.h) / TS), ty1 = Math.floor(pr.y / TS) - 1;
        for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) { const i = ty * LW + tx; if (L.grid[i] !== T.CRYST) continue;
          if (pr.glassT < 0.5) { if ((crackAt[i] || 0) < 2) { crackAt[i] = 2; tileSpr[i] = crystSpr(i); SFX.crack(); } } else breakCrystal(i); } }
      else if (pr.glass) pr.glassT = 0;
      if (pr.active) {
        if (Math.random() < dt * 40) parts.push({ x: pr.x + (Math.random() - 0.5) * 16, y: pr.y - 2, vx: (Math.random() - 0.5) * 12, vy: -140 - Math.random() * 80, life: pr.h / 180, max: pr.h / 180, col: pr.heat ? (Math.random() < 0.3 ? '#fff6c8' : Math.random() < 0.6 ? '#ffb040' : '#ff6b2c') : pr.wind ? (Math.random() < 0.5 ? '#eefaff' : '#c8d8e8') : Math.random() < 0.5 ? '#c8bcb0' : '#9a5aa8', size: Math.random() < 0.3 ? 2 : 1, grav: 0 });
        if (!P.dead && Math.abs(P.x - pr.x) < (pr.w || 13) && P.y <= pr.y + 2 && P.y > pr.y - pr.h) { P.vy = Math.min(P.vy, -(pr.lift || 190)); P.ground = false; P.canCut = false; P.plunge = false; if (!pr.said) { pr.said = true; number(pr.x, pr.y - 20, 'UPDRAFT', '#c8bcb0'); } }
      } else if (pr.warm && Math.random() < dt * 8) parts.push({ x: pr.x + (Math.random() - 0.5) * 10, y: pr.y - 1, vx: 0, vy: -30, life: 0.4, max: 0.4, col: '#7a7078', size: 1, grav: 0 });
    }
    if (pr.t === 'roller' && pr.alive) { // a puffball the size of a barrel, rolling along the floor
      pr.x += pr.vx * dt; pr.rot += pr.vx * dt / 7;
      const dir = Math.sign(pr.vx) || 1, ftx = Math.floor((pr.x + dir * 8) / TS), fty = Math.floor((pr.y + 1) / TS);
      if (pr.tumble) { pr.life -= dt; if (pr.life <= 0) { pr.alive = false; clouds2.push({ x: pr.x, y: pr.y - 6, r: 14, life: 2 }); burst(pr.x, pr.y - 6, 8, ['#e8e0d0', '#c8bcb0'], 50, 0.5); continue; } }
      const wallAhead = isSolid(ftx, Math.floor((pr.y - 6) / TS)), edgeAhead = !isSolid(ftx, fty) && !isOneWay(tileAt(ftx, fty));
      if (wallAhead || (edgeAhead && !pr.tumble)) { pr.vx = -pr.vx; pr.x += pr.vx * dt * 2; }
      if (pr.tumble) { const gtx = Math.floor(pr.x / TS), gty = Math.floor((pr.y + 1) / TS); if (!isSolid(gtx, gty) && !isOneWay(tileAt(gtx, gty))) { pr.vy += 700 * dt; pr.y += pr.vy * dt; const ly = Math.floor(pr.y / TS); if (isSolid(gtx, ly) || isOneWay(tileAt(gtx, ly))) { pr.y = ly * TS; pr.vy = 0; dust(pr.x, pr.y, 3); } } else pr.vy = 0; }
      if (Math.random() < dt * 6) parts.push({ x: pr.x + (Math.random() - 0.5) * 10, y: pr.y - 1, vx: -dir * 20, vy: -20, life: 0.4, max: 0.4, col: '#c8bcb0', size: 1, grav: 0 });
      const rb = { l: pr.x - 7, r: pr.x + 7, t: pr.y - 13, b: pr.y };
      const pop = (big) => { pr.alive = false; SFX.puff(); burst(pr.x, pr.y - 6, 16, ['#e8e0d0', '#c8bcb0', '#9a5aa8'], 80, 0.6, 100, 2); clouds2.push({ x: pr.x, y: pr.y - 6, r: big ? 24 : 14, life: big ? 3.5 : 2 }); number(pr.x, pr.y - 20, 'POP', '#c8bcb0'); };
      if (hb && overlap(hb, rb)) { pop(false); sparks(pr.x, pr.y - 6, P.face, 4); continue; }
      const pb2 = box(P);
      if (!P.dead && overlap({ l: pb2.l + 1, r: pb2.r - 1, t: pb2.t + 2, b: pb2.b - 1 }, rb)) {
        if (P.vy > 40 && pb2.b <= pr.y - 8 && P.dodge <= 0) { pop(true); P.vy = keys.jump ? -290 : -220; P.ground = false; P.canCut = false; P.plunge = false; SFX.pPogo(); squash(0.8, 1.25, 0.1); }
        else { const res = damagePlayer(pr.x, DMG.roller); if (res === 'blocked') { pr.vx = -pr.vx; } else if (res === 'hit') pop(true); }
      }
    }
    if (pr.t === 'puffball' && !pr.popped) {
      const pb2 = box(P); const touch = !P.dead && overlap({ l: pb2.l, r: pb2.r, t: pb2.t, b: pb2.b }, { l: pr.x - 6, r: pr.x + 6, t: pr.y - 11, b: pr.y });
      const slashed = hb && overlap(hb, { l: pr.x - 7, r: pr.x + 7, t: pr.y - 12, b: pr.y });
      if (touch || slashed) { pr.popped = true; SFX.crack(); burst(pr.x, pr.y - 6, 14, ['#e8e0d0', '#c8bcb0', '#9a5aa8'], 70, 0.6, 100, 2); clouds2.push({ x: pr.x, y: pr.y - 6, r: touch ? 24 : 14, life: touch ? 4 : 2 }); number(pr.x, pr.y - 18, touch ? 'SPORES' : 'POP', '#c8bcb0'); }
    }
    if (pr.t === 'glow') { if (pr.dark > 0) pr.dark -= dt; else if (hb && overlap(hb, { l: pr.x - 6, r: pr.x + 6, t: pr.y - 14, b: pr.y }) && !P.hitSet.has(pr)) { P.hitSet.add(pr); pr.dark = 8; SFX.ui(); burst(pr.x, pr.y - 8, 6, ['#4aa0b0', '#bff0f0'], 40, 0.4); } }
  }
  for (const k in shelfT) { if (shelfT[k] < 0) { shelfT[k] += dt; if (shelfT[k] >= 0) { const i = +k; if (L.grid[i] === T.AIR && grid0[i] === T.SHELF && !(Math.abs(P.x - ((i % LW) * TS + 8)) < 14 && Math.abs(P.y - Math.floor(i / LW) * TS) < 20)) { L.grid[i] = T.SHELF; tileSpr[i] = TILE.shelf[i % 2]; shelfT[k] = 0; burst((i % LW) * TS + 8, Math.floor(i / LW) * TS + 4, 4, ['#f0d090'], 30, 0.3); } else shelfT[k] = -0.5; } } }
  if (L.storm && !P.dead && P.x > L.storm.x0 - 240 && P.x < L.storm.x1 + 60) { stormT -= dt; if (stormT <= 0) { stormT = 1.4; clouds2.push({ x: L.storm.x1 - 20, y: L.storm.y - 12 - Math.random() * 10, r: 17, life: 14, sleep: true, vx: -36, storm: true }); } }
  for (const c of clouds2) { c.life -= dt; if (c.vx) { c.x += c.vx * dt; if (c.arena && L.arena && (c.x < L.arena.x0 + 10 || c.x > L.arena.x1 - 10)) c.life = 0; if (c.storm && c.x < L.storm.x0 - 20) c.life = 0; }
 if (Math.random() < dt * 12) parts.push({ x: c.x + (Math.random() - 0.5) * c.r * 1.6, y: c.y + (Math.random() - 0.5) * c.r, vx: (Math.random() - 0.5) * 10, vy: -8, life: 0.8, max: 0.8, col: c.sleep ? '#c9a0ff' : '#d8d0c8', size: 1, grav: 0 }); }
  clouds2 = clouds2.filter(c => c.life > 0);
  for (const b of bombs) { b.fuse -= dt; b.vy += 700 * dt; b.x += b.vx * dt; b.y += b.vy * dt; if (isSolid(Math.floor(b.x / TS), Math.floor(b.y / TS))) { b.y = Math.floor(b.y / TS) * TS; b.vy = 0; b.vx *= 0.6; } if (Math.random() < dt * 20) parts.push({ x: b.x, y: b.y - 6, vx: 0, vy: -30, life: 0.25, max: 0.25, col: '#ffd36b', size: 1, grav: 0 }); if (b.fuse <= 0) { b.dead = true; explode(b.x, b.y - 2, 36, DMG.bomb); } }
  bombs = bombs.filter(b => !b.dead);
  for (const f of fires) { if (f.delay > 0) { f.delay -= dt; continue; } f.life -= dt;
    if (!f.vent && Math.abs(f.x - P.x) < 260 && Math.random() < dt * 9) flame(f.x, f.y - 7, 1, 5, 45, 3);
    { const ftx = Math.floor(f.x / TS), fty = Math.floor((f.y - 1) / TS); for (const dx of [-1, 0, 1]) for (let dy = 0; dy <= 2; dy++) { const tx = ftx + dx, ty = fty - dy; const tt = tileAt(tx, ty); if (tt !== T.PALISADE && tt !== T.WEB) continue; const i = ty * LW + tx; burnT[i] = (burnT[i] || 0) + dt; if (Math.random() < dt * 6) parts.push({ x: tx * TS + Math.random() * TS, y: ty * TS + Math.random() * TS, vx: 0, vy: -30, life: 0.4, max: 0.4, col: Math.random() < 0.5 ? '#ff9a5c' : '#5a5a66', size: 1, grav: 0 }); if (burnT[i] > 0.9) { L.grid[i] = T.AIR; tileSpr[i] = null; destroyed.add(i); burst(tx * TS + 8, ty * TS + 8, 8, ['#8a5a32', '#ff9a5c', '#3a2416'], 60, 0.5); SFX.crack(); if (!fires.some(q => Math.abs(q.x - (tx * TS + 8)) < 6 && Math.abs(q.y - (ty + 1) * TS) < 6)) fires.push({ x: tx * TS + 8, y: (ty + 1) * TS, life: 2.5, delay: 0.1, own: f.own }); } } } /* fire climbs and eats a stake wall */ if (!P.dead && !(f.own && isPyro()) && Math.abs(P.x - f.x) < 9 && P.y > f.y - 14 && P.y <= f.y + 2) { if (isPyro() && tal('kindle')) { P.kindleT = (P.kindleT || 0) + dt; if (P.kindleT >= 0.5) { P.kindleT = 0; if (P.hp < P.maxHp) { P.hp = Math.min(P.maxHp, P.hp + 1); number(P.x, P.y - 24, '+1', '#8fd160'); } if (Math.random() < 0.7) parts.push({ x: P.x + (Math.random() - 0.5) * 8, y: P.y - 10, vx: 0, vy: -30, life: 0.5, max: 0.5, col: '#8fd160', size: 1, grav: 0 }); } } else damagePlayer(f.x, DMG.fire, { up: true, unblockable: true }); } for (const e of enemies) if (e.alive && e.t !== 'chief' && e.t !== 'wasp' && e.t !== 'king' && e.t !== 'master' && Math.abs(e.x - f.x) < 9 && Math.abs(e.y - f.y) < 6 && !(e.fireT > 0)) { e.fireT = 0.6; hurtEnemy(e, 10, f.x, false); } }
  fires = fires.filter(f => f.life > 0);
  for (const e of enemies) if (e.fireT > 0) e.fireT -= dt;
  // rope bridges: the cutter at the far end saws through once you're out over the drop
  for (const br of bridges) {
    if (br.cut) continue;
    const mid = P.x > br.x0 * TS + 24 && P.x < br.x1 * TS - 24 && Math.abs(P.y - br.y * TS) < 20;
    const cutter = enemies.find(e => e.alive && e.cutter && Math.abs(e.x - br.x1 * TS) < 60);
    if (mid && cutter) { br.cutT += dt; if (br.cutT > 0.2 && br.cutT - dt <= 0.2) { number(cutter.x, cutter.y - 18, 'CUTS THE ROPE', '#ff6b6b'); SFX.bow(); } if (br.cutT > 1.0) { br.cut = true; cutBridges.add(br.x0); SFX.crack(); shakeCam(4); for (let x = br.x0; x <= br.x1; x++) for (let y = br.y; y <= br.y + 1; y++) { const i = y * LW + x; if (L.grid[i] === T.PLANK) { L.grid[i] = T.AIR; tileSpr[i] = null; destroyed.add(i); corpses.push({ t: 'plank', x: x * TS + 8, y: y * TS + 4, vx: (Math.random() - 0.5) * 30, vy: -20, rot: 0, spin: (Math.random() - 0.5) * 6, face: 1, life: 1.2, max: 1.2, frame: 0, grav: 500 }); } } if (P.onMover === null && P.ground) { P.ground = false; P.vy = 20; } } }
    else br.cutT = Math.max(0, br.cutT - dt);
  }
  // freed foxes: run at the nearest goblin and bite
  for (const f of foxes) {
    f.life -= dt; f.t += dt; f.bite = Math.max(0, f.bite - dt);
    let tgt = null, bd = 160; for (const e of enemies) if (e.alive && e.t !== 'chief' && e.t !== 'wasp' && Math.abs(e.x - f.x) < bd && Math.abs(e.y - f.y) < 30) { bd = Math.abs(e.x - f.x); tgt = e; }
    if (tgt) { f.face = Math.sign(tgt.x - f.x) || f.face; f.vx = f.face * 120; if (bd < 12 && f.bite <= 0) { f.bite = 0.6; hurtEnemy(tgt, 10, f.x, false); number(f.x, f.y - 12, 'BITE', '#d9782a'); } }
    else { f.vx = f.face * 40; f.face = Math.sign(P.x - f.x) || f.face; }
    f.x += f.vx * dt; const ty = Math.floor((f.y + 1) / TS); if (!isSolid(Math.floor(f.x / TS), ty) && !isOneWay(tileAt(Math.floor(f.x / TS), ty))) f.y += 200 * dt; else f.y = ty * TS;
  }
  foxes = foxes.filter(f => f.life > 0);
  // horn squads arrive from behind
  if (hornSquadT > 0) { hornSquadT -= dt; if (hornSquadT <= 0) { for (let i = 0; i < 5; i++) { const x = P.x - 90 - i * 20; enemies.push({ t: 'sprig', x, y: P.y - 40, vx: 0, vy: 0, w: 8, h: 10, hp: EHP.sprig, speed: 44, face: 1, alive: true, dying: 0, anim: Math.random(), flash: 0, stagger: 0 }); burst(x, P.y - 40, 5, COLS.sprig, 40, 0.4); } { const x = P.x - 200; enemies.push({ t: 'hound', x, y: P.y - 40, vx: 0, vy: 0, w: 12, h: 7, hp: EHP.hound, speed: 105, face: 1, alive: true, dying: 0, anim: Math.random(), flash: 0, stagger: 0, timer: 0, air: false }); burst(x, P.y - 40, 5, COLS.hound, 40, 0.4); } number(P.x - 60, P.y - 50, 'THE CAMP COMES', '#ff6b6b'); SFX.roar(); } }
}
function updateMovers(dt) {
  updateCarts(dt);
  for (const m of movers) {
    if (m.kind === 'cart' || m.kind === 'orelift') continue;
    const oldX = m.x, oldY = m.y; m.dy = 0;
    if (m.kind === 'pad') { // sinks while stood on, floats back up when left
      const on = P.onMover === m; m.sink = Math.max(0, Math.min(1, m.sink + (on ? 0.5 : -1.4) * dt)); m.y = m.y0 + m.sink * 16; m.dy = m.y - oldY;
      if (on && m.sink > 0.15 && Math.random() < dt * 6) parts.push({ x: m.x + Math.random() * m.w, y: m.y0 + 2, vx: 0, vy: -20, life: 0.3, max: 0.3, col: '#bfe6f5', size: 1, grav: 0 });
    } else if (m.kind === 'drift') { // rides the current against you and wraps around
      m.x -= m.speed * dt; if (m.x + m.w * 0.5 < m.x0) { m.x = m.x1; if (P.onMover === m) P.onMover = null; m.dx = 0; continue; }
      if (P.onMover === m && P.x < m.x0 + 4) P.onMover = null; // the log slides under the bank; you step off
    } else if (m.kind === 'lift') { // a pulley platform: rides toward the far stop while you stand on it, drifts home when you leave
      const on = P.onMover === m; const target = on ? m.y1 : m.y0; const dir = Math.sign(target - m.y);
      if (dir) { m.y += dir * m.speed * dt; if ((dir > 0 && m.y > target) || (dir < 0 && m.y < target)) m.y = target; }
      m.dy = m.y - oldY; if (on && Math.random() < dt * 4) SFX.stone();
    } else if (m.kind === 'wheel') { if (m.mill) { const w = windAt(m.px, m.py); if (w) m.lastW = w; m.ang = (m.ang || 0) + dt * 2 * Math.PI / m.period * (w ? w * 1.6 : 0.3 * (m.lastW || 1)); } const a = m.mill ? (m.ang || 0) + m.phase : time * 2 * Math.PI / m.period + m.phase; m.x = m.px + Math.cos(a) * m.r - m.w / 2; m.y = m.py + Math.sin(a) * m.r; m.dy = m.y - oldY;
    } else if (m.kind === 'punt') { // goes where you push it while you stand on it; the frogs come aboard while it moves
      const aboard = P.onMover === m; let dir = 0; if (aboard && !P.dead) dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
      m.moving = aboard && dir !== 0;
      if (m.moving && m.frogs) { m.frogT = (m.frogT || 2) - dt; const nAb = enemies.filter(e => e.alive && e.t === 'hopper' && e.raft === m).length; if (m.frogT <= 0 && nAb < (m.frogMax || 3)) { m.frogT = (m.frogEvery || 3) + Math.random() * 2; const side = Math.random() < 0.5 ? -1 : 1; const fx = m.x + m.w / 2 + side * (m.w / 2 + 20); const target = m.x + m.w / 2 + side * (m.w / 2 - 22); const col = ['green', 'green', 'yellow', 'blue'][(Math.random() * 4) | 0]; enemies.push({ t: 'hopper', color: col, x: fx, y: m.y + 26, vx: (target - fx) / 0.58, vy: -330, w: 8, h: 6, hp: HOP[col].hp, face: -side, alive: true, dying: 0, anim: 0, flash: 0, stagger: 0, timer: 1.4, air: true, raft: m, drone: true }); burst(fx, m.y + 26, 8, ['#eefaff', '#bfe6f5'], 60, 0.4); SFX.splash(); number(fx, m.y + 10, 'FROG', '#8fd160'); } }
      if (dir) { m.x = Math.max(m.x0, Math.min(m.x1, m.x + dir * m.speed * dt)); if (Math.random() < dt * 10) parts.push({ x: dir > 0 ? m.x : m.x + m.w, y: m.y + 6, vx: -dir * 30, vy: -10, life: 0.4, max: 0.4, col: '#eefaff', size: 2, grav: 0 }); }
      if (aboard) P.x = Math.max(m.x + 5, Math.min(m.x + m.w - 5, P.x));
    } else if (m.kind === 'raft') { // waits at the dock until you board, then poles downstream
      if (P.onMover === m && !m.done && (!m.ferry || m.paid)) m.moving = true;
      if (m.moving && m.frogs) { m.frogT = (m.frogT || 2) - dt; const aboard = enemies.filter(e => e.alive && e.t === 'hopper' && e.raft === m).length; if (m.frogT <= 0 && aboard < (m.frogMax || 3)) { m.frogT = (m.frogEvery || 3) + Math.random() * 2; const side = Math.random() < 0.5 ? -1 : 1; const fx = m.x + m.w / 2 + side * (m.w / 2 + 20); const target = m.x + m.w / 2 + side * (m.w / 2 - 22) + m.speed * 0.58; const col = ['green', 'green', 'yellow', 'blue'][(Math.random() * 4) | 0]; enemies.push({ t: 'hopper', color: col, x: fx, y: m.y + 26, vx: (target - fx) / 0.58, vy: -330, w: 8, h: 6, hp: HOP[col].hp, face: -side, alive: true, dying: 0, anim: 0, flash: 0, stagger: 0, timer: 1.4, air: true, raft: m, drone: true }); burst(fx, m.y + 26, 8, ['#eefaff', '#bfe6f5'], 60, 0.4); SFX.splash(); number(fx, m.y + 10, 'FROG', '#8fd160'); } }
      if (m.moving) { m.x += m.speed * dt; if (m.x >= m.x1) { m.x = m.x1; m.moving = false; m.done = true; SFX.thud(); number(m.x + m.w / 2, m.y - 12, 'DOCKED', '#bfe6f5'); } if (Math.random() < dt * 8) parts.push({ x: m.x + (m.speed > 0 ? 0 : m.w), y: m.y + 6, vx: -30, vy: -10, life: 0.4, max: 0.4, col: '#eefaff', size: 2, grav: 0 }); }
    } else {
      if (m.kind === 'swing') { const th = Math.sin(time * 2 * Math.PI / m.period + m.phase) * 0.9; m.x = m.px + Math.sin(th) * m.arm - m.w / 2; m.y = m.py + Math.cos(th) * m.arm; m.dy = m.y - oldY; }
      else { m.p += m.dir * m.speed / m.range * dt;
      if (m.p >= 1) { m.p = 1; m.dir = -1; } else if (m.p <= 0) { m.p = 0; m.dir = 1; }
      m.x = m.x0 + m.p * m.range; }
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
  if (L.dark && SET.ambient && state === 'play') { dripT -= dt; if (dripT <= 0) { dripT = 0.35 + Math.random() * 0.5; const tx = Math.floor((camX + Math.random() * VW) / TS); let ty = Math.floor(camY / TS); while (ty < LH - 1 && tileAt(tx, ty) !== T.AIR) ty++; if (ty < LH - 1 && tileAt(tx, ty) === T.AIR && tileAt(tx, ty - 1) === T.SOLID) { parts.push({ x: tx * TS + 4 + Math.random() * 8, y: ty * TS + 1, vx: 0, vy: 10, life: 1.4, max: 1.4, col: '#8ab0c8', size: 1, grav: 420, drip: true }); if (Math.random() < 0.35) SFX.drip(); } } }
  if (dusk() > 0.5 && SET.ambient) { cricketT -= dt; if (cricketT <= 0) { cricketT = 0.5 + Math.random() * 1.2; SFX.cricket(); } }
  for (const c of clouds) { c.x += c.sp * dt; if (c.x > camX * 0.1 + VW + 80) c.x -= VW + 160; }
  fishT -= dt;
  if (fishT <= 0) { fishT = 3 + Math.random() * 5; const pools = (L.pools || []).filter(p => !p.shallow && p.x1 > camX && p.x0 < camX + VW); if (pools.length) { const p = pools[(Math.random() * pools.length) | 0]; const x = Math.max(p.x0 + 12, Math.min(p.x1 - 12, camX + Math.random() * VW)); fish.push({ x, y: p.y + 2, vx: (Math.random() < 0.5 ? -1 : 1) * 30, vy: -110, sy: p.y + 2, life: 1.5 }); SFX.fish(); burst(x, p.y, 4, ['#eefaff', '#bfe6f5'], 40, 0.3, 300, 1); } }
  for (const f of fish) { f.vy += 380 * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.life -= dt; if (f.vy > 0 && f.y >= f.sy) { f.life = 0; burst(f.x, f.sy, 5, ['#eefaff', '#bfe6f5'], 50, 0.3, 300, 1); } }
  fish = fish.filter(f => f.life > 0);
}
const weatherAt = () => { let w = null; for (const z of (L.weather || [])) if (camX + VW / 2 >= z.x0 && camX + VW / 2 < z.x1) w = w ? w + '+' + z.kind : z.kind; return w || ''; };
function updateWeather(dt) {
  const area = VW * VH / 57600;
  if (bossActive && L.arena && L.arena.fx && SET.ambient) { const fx = L.arena.fx; if (fx === 'dust' && pollen.length < 30 * area && Math.random() < dt * 10) pollen.push({ x: camX - 20, y: camY + VH * 0.3 + Math.random() * VH * 0.7, t: Math.random() * 6, life: 3, wind: true }); if (fx === 'bees' && pollen.length < 22 * area && Math.random() < dt * 6) pollen.push({ x: camX + Math.random() * VW, y: camY + 20 + Math.random() * (VH - 60), t: Math.random() * 6, life: 6, bee: true }); if (fx === 'embers' && pollen.length < 40 * area && Math.random() < dt * 14) pollen.push({ x: camX + Math.random() * VW, y: camY + VH - 10, t: Math.random() * 6, life: 4, ember: true }); if (fx === 'motes' && pollen.length < 30 * area && Math.random() < dt * 8) pollen.push({ x: camX + Math.random() * VW, y: camY + Math.random() * VH, t: Math.random() * 6, life: 6, mote: true }); }
  const w = weatherAt();
  if (SET.ambient && SET.weather && w.includes('rain')) {
    for (let i = 0; i < 3 * area; i++) if (drops.length < 90 * area) drops.push({ x: camX - 20 + Math.random() * (VW + 60), y: camY - 10, vx: -50, vy: 300 + Math.random() * 60, life: 1.2 });
    lightT -= dt; if (lightT <= 0) { lightT = 7 + Math.random() * 9; lightFlash = 0.18; thunderT = 0.5 + Math.random() * 0.6; }
  }
  for (const d of drops) { d.life -= dt; d.x += d.vx * dt; d.y += d.vy * dt; if (d.y > camY + VH + 4) d.life = 0; }
  drops = drops.filter(d => d.life > 0);
  lightFlash = Math.max(0, lightFlash - dt); if (thunderT > 0) { thunderT -= dt; if (thunderT <= 0) { SFX.thunder(); shakeCam(2); } }
  if (SET.ambient && SET.weather && w.includes('wind')) { for (const d of decor) if ((d.k === 'tuft' || d.k === 'fern' || d.k === 'flower') && d.x > camX - 20 && d.x < camX + VW + 20) d.sway = Math.max(d.sway || 0, 0.25 + 0.25 * Math.sin(time * 2.2 + d.x * 0.03)); if (pollen.length < 34 * area && Math.random() < dt * 16) pollen.push({ x: camX - 20, y: camY + Math.random() * VH, t: Math.random() * 6, life: 4, wind: true }); }
  if (SET.ambient && SET.weather && w.includes('spore')) { if (pollen.length < 36 * area && Math.random() < dt * 10) pollen.push({ x: camX + Math.random() * VW, y: camY + Math.random() * VH, t: Math.random() * 6, life: 7, spore: true }); }
  if (SET.ambient && w.includes('smoke')) { if (pollen.length < 30 && Math.random() < dt * 6) pollen.push({ x: camX + Math.random() * VW, y: camY + VH * 0.5 + Math.random() * VH * 0.5, t: Math.random() * 6, life: 5, smoke: true }); }
  if (SET.ambient && SET.weather && w.includes('glitter')) { if (pollen.length < 40 && Math.random() < dt * 14) pollen.push({ x: camX + Math.random() * VW, y: camY + Math.random() * VH, t: Math.random() * 6, life: 5, glitter: true }); }
  if (SET.ambient && SET.weather && w.includes('pollen')) { if (pollen.length < 28 && Math.random() < dt * 8) pollen.push({ x: camX + Math.random() * VW, y: camY + Math.random() * VH * 0.8, t: Math.random() * 6, life: 8 }); }
  for (const p of pollen) { p.t += dt; p.life -= dt; if (p.bee) { p.x += Math.sin(p.t * 3) * 40 * dt + 12 * dt; p.y += Math.cos(p.t * 5) * 20 * dt; } else if (p.ember) { p.y -= (40 + Math.sin(p.t * 3) * 10) * dt; p.x += Math.sin(p.t * 2) * 12 * dt; } else if (p.wind) { p.x += (150 + Math.sin(p.t * 3) * 30) * dt; p.y += Math.sin(p.t * 4) * 12 * dt; } else if (p.mote) { p.x += Math.sin(p.t * 0.7) * 6 * dt; p.y -= 4 * dt; } else if (p.spore) { p.x += Math.sin(p.t * 0.8) * 8 * dt; p.y += (6 + Math.cos(p.t * 0.7) * 5) * dt; } else if (p.smoke) { p.x += Math.sin(p.t * 1.3) * 12 * dt; p.y -= 22 * dt; } else { p.x += (8 + Math.sin(p.t * 1.1) * 10) * dt; p.y += (4 + Math.cos(p.t * 0.9) * 8) * dt; } }
  pollen = pollen.filter(p => p.life > 0 && p.x < camX + VW + 10 && p.x > camX - 10);
  for (const b of birds) { b.t += dt; b.life -= dt; b.x += b.vx * dt; b.y += b.vy * dt; b.vy += Math.sin(b.t * 6) * 30 * dt - 10 * dt; }
  birds = birds.filter(b => b.life > 0);
  for (const d of decor) { if (d.sway > 0) d.sway = Math.max(0, d.sway - dt); if (d.wob > 0) d.wob = Math.max(0, d.wob - dt); }
  zoomT = Math.max(0, zoomT - dt); if (zoomT <= 0) zoomAmt = 1;
  // ambient bed by zone, and the music ducks while something winds up nearby
  let amb = 'forest'; for (const z of (L.ambient || [])) if (camX + VW / 2 >= z.x0 && camX + VW / 2 < z.x1) amb = z.kind; ambient.set(amb);
  const tense = enemies.some(e => e.alive && Math.abs(e.x - P.x) < 220 && ((e.t === 'thorn' && (e.mode === 'wind' || e.mode === 'charge')) || (e.t === 'queen' && (e.mode === 'aim' || e.mode === 'slamHang')) || (e.t === 'frog' && (e.mode === 'crouch' || e.mode === 'tongueTell' || e.mode === 'inhale')) || (e.t === 'chief' && (e.mode === 'crouch' || e.mode === 'aim' || e.mode === 'rainAim' || e.mode === 'whirl')) || (e.t === 'ram' && (e.mode === 'lower' || e.mode === 'charge')) || (e.t === 'harpy' && e.mode === 'aim')));
  music.duck(tense);
}
function updatePwaves(dt) {
  for (const w of pwaves) {
    w.life -= dt; w.x += w.dir * w.sp * dt;
    const tx = Math.floor(w.x / TS), ty = Math.floor(w.y / TS); if (!isSolid(tx, ty) && isSolid(tx, ty + 1)) w.y = (ty + 1) * TS; else if (isSolid(tx, ty - 1) || (!isSolid(tx, ty) && !isSolid(tx, ty + 1))) w.life = 0;
    if (Math.random() < dt * 30) parts.push({ x: w.x + (Math.random() - 0.5) * 6, y: w.y - Math.random() * 4, vx: w.dir * 30, vy: -60 - Math.random() * 60, life: 0.35, max: 0.35, col: Math.random() < 0.5 ? '#ffd36b' : '#c9b27c', size: 2, grav: 300 });
    if (tileAt(tx, ty) === T.CRATE) breakCrate(tx, ty);
    for (const e of enemies) { if (!e.alive || w.hit.has(e) || e.harmless || Math.abs(e.x - w.x) > 11 || Math.abs(e.y - w.y) > 14) continue; w.hit.add(e); if (e.t === 'mother' || e.t === 'king' || e.t === 'gill' || e.t === 'heart' || e.t === 'wasp' || e.t === 'drone') continue; hurtEnemy(e, Math.round(15 * (1 + 0.15 * tal('hammerfallDmg'))), w.x - w.dir * 20, false); if (e.t === 'dummy') trialEvent('hammerfall'); e.stagger = Math.max(e.stagger, 0.8); number(e.x, e.y - e.h - 14, 'QUAKED', '#ffd36b'); }
  }
  pwaves = pwaves.filter(w => w.life > 0);
}
function updateThrown(dt) {
  if (!thrown) return; const s = thrown; s.t += dt;
  if (!s.back) { s.x += s.dir * 290 * dt; s.y += Math.sin(s.t * 14) * 8 * dt; const wall = isSolid(Math.floor((s.x + s.dir * 7) / TS), Math.floor(s.y / TS)); if (s.t > 0.5 || wall) { s.back = true; if (wall) { SFX.clank(); sparks(s.x, s.y, -s.dir, 4); } } }
  else { const dx = P.x - s.x, dy = (P.y - 9) - s.y, d = Math.hypot(dx, dy) || 1; if (d < 10 || s.t > 3) { thrown = null; P.throwCd = cdOf('shieldThrow'); SFX.shieldCatch(); impactAt(P.x + P.face * 6, P.y - 9, 'steel'); return; } const sp = 300 + s.t * 60; s.x += dx / d * sp * dt; s.y += dy / d * sp * dt; }
  const sb = { l: s.x - 6, r: s.x + 6, t: s.y - 6, b: s.y + 6 };
  const RANGED = ['archer', 'spit', 'shaman', 'wasp', 'drone', 'bell', 'thief'];
  if (!s.back) for (const e of enemies) { if (!e.alive || s.hit.has(e) || !overlap(sb, box(e))) continue; s.hit.add(e); s.back = true; if (e.t === 'mother' || e.t === 'drone') { SFX.clank(); sparks(s.x, s.y, -s.dir, 3); break; } const ranged = RANGED.includes(e.t); hurtEnemy(e, ranged ? 15 : 10, s.x - s.dir * 10, false); impactAt(s.x, s.y, 'steel'); SFX.clank(); if (ranged) number(e.x, e.y - e.h - 14, 'STRUCK', '#c9d1dc'); break; }
  for (const sd of seeds) if (!sd.dead && !sd.reflected && overlap(sb, { l: sd.x - 3, r: sd.x + 3, t: sd.y - 3, b: sd.y + 3 })) { sd.dead = true; parries++; SFX.parry(); sparks(sd.x, sd.y, -s.dir, 4); number(sd.x, sd.y - 8, 'SWATTED', '#8fd160'); }
  for (const pr of props) if (pr.t === 'puffball' && !pr.popped && overlap(sb, { l: pr.x - 7, r: pr.x + 7, t: pr.y - 12, b: pr.y })) { pr.popped = true; SFX.crack(); burst(pr.x, pr.y - 6, 12, ['#e8e0d0', '#c8bcb0'], 60, 0.5); clouds2.push({ x: pr.x, y: pr.y - 6, r: 14, life: 2 }); }
}
function updateParticles(dt) {
  updateThrown(dt); updatePwaves(dt);
  for (const i of impacts) i.t += dt; impacts = impacts.filter(i => i.t < 0.16);
  for (const r of rings) r.t += dt; rings = rings.filter(r => r.t < r.life);
  updateCritters(dt);
  for (const p of parts) { p.life -= dt; p.vy += p.grav * dt; if (p.drag) { const k = 1 - p.drag * dt; p.vx *= k; p.vy *= k; } if (p.fire) p.vx += (Math.random() - 0.5) * 90 * dt; p.x += p.vx * dt; p.y += p.vy * dt; }
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
  const autumn = L.palette && L.palette.near === 'autumn';
  if (SET.ambient && SET.weather && Math.random() < dt * (autumn ? 9 : 2.5)) leaves.push({ x: camX + Math.random() * (VW + 60) - 30, y: camY - 6, t: Math.random() * 6, life: 9, col: (autumn ? ['#d9782a', '#c9463d', '#e0b040', '#f0a040', '#8a3a1a'] : ['#8fd160', '#e0b040', '#c9463d', '#5aa33e'])[(Math.random() * (autumn ? 5 : 4)) | 0] });
  for (const l of leaves) { l.t += dt; l.life -= dt; l.y += 22 * dt; l.x += Math.sin(l.t * 2.2) * 18 * dt + 6 * dt; }
  leaves = leaves.filter(l => l.life > 0 && l.y < camY + VH + 10);
}
function updateCamera(dt) {
  if (bannerT > 0) bannerT -= dt; if (miniIntroT > 0) miniIntroT -= dt;
  if (P.fly && flight) { camX = Math.max(0, Math.min(LW * TS - VW, flight.cx)); camY = Math.max(0, Math.min(LH * TS - VH, flight.cy)); shake = Math.max(0, shake - dt * 18); kick *= Math.pow(0.002, dt); return; }
  const lookDown = !SET.lookDown ? 0 : !P.ground && P.vy > 120 ? Math.min(60, (P.vy - 120) * 0.4) : (P.ground && keys.down && !P.block && P.atk < 0 ? 48 : 0);
  const tx = P.x + P.face * 26 - VW / 2, ty = P.y - (VH * 0.58) + lookDown - (bossActive && boss && boss.t === 'mother' ? 30 : 0); // falling or crouching peeks below; the hollow looks up at her gills
  camX += (tx - camX) * Math.min(1, dt * 5); camY += (ty - camY) * Math.min(1, dt * 4);
  const x0 = camLock ? camLock.x0 - 8 : 0, x1 = camLock ? camLock.x1 + 8 - VW : LW * TS - VW;
  camX = Math.max(x0, Math.min(x1, camX)); camY = Math.max(0, Math.min(LH * TS - VH, camY));
  // a level with its insides in a band of rock (Stormhold): from the street you never see into the band, and from a room you never see the street
  if (L.indoorRow !== undefined) { const edge = (L.indoorRow + 1) * TS; if (P.y > edge) camY = Math.max(camY, edge); else camY = Math.min(camY, edge - VH);
    // inside one of the cellars and halls: frame the whole room, ceiling and all, when it fits (the camera sat on the
    // floor and cut the ceiling off, and everything hung from it looked like it hung from nothing)
    const tx = P.x / TS, ty = P.y / TS, rm = (L.interiors || []).find(([x0, x1, y0, y1]) => tx >= x0 && tx <= x1 + 1 && ty >= y0 && ty <= y1 + 1.5);
    if (rm) { const top = (rm[2] - 1) * TS, bot = (rm[3] + 2) * TS; camY = bot - top <= VH ? (top + bot) / 2 - VH / 2 : Math.max(top, Math.min(bot - VH, camY)); } }
  shake = Math.max(0, shake - dt * 18); kick *= Math.pow(0.002, dt);
}

function update(dt) {
  time += dt;
  if (state !== 'play' || !isPyro()) SFX.jet(false);
  music.muffle(state === 'menu' || state === 'talk' || state === 'herocard' || state === 'bestiary' || (state === 'store' && !!(L && L.shop)));
  music.lowHealth(state === 'play' && !P.dead && P.hp > 0 && P.hp <= 25);
  if (state === 'editor') {
    if (!edDoc) { state = 'title'; return; }
    const sp = (keys.block ? 460 : 200) * dt; // hold block to fly
    if (keys.left) edCam.x -= sp; if (keys.right) edCam.x += sp;
    if (keys.up) edCam.y -= sp; if (keys.down) edCam.y += sp;
    edCam.x = Math.max(0, Math.min(LW * TS - VW, edCam.x)); edCam.y = Math.max(0, Math.min(LH * TS - VH, edCam.y));
    edMsgT = Math.max(0, edMsgT - dt); time += dt; return;
  }
  if (state === 'title') { ambient.set('forest'); if (titleLeaves.length < 26 && Math.random() < dt * 5) titleLeaves.push({ x: Math.random() * (VW + 40) - 20, y: -4, vy: 14 + Math.random() * 16, ph: Math.random() * 6, col: ['#d9782a', '#c9463d', '#e0b040', '#8fd160'][(Math.random() * 4) | 0] }); for (const lf of titleLeaves) { lf.y += lf.vy * dt; lf.x += Math.sin(time * 1.5 + lf.ph) * 18 * dt + 4 * dt; } titleLeaves = titleLeaves.filter(lf => lf.y < VH - 20); if (fireflies.length < 12 && Math.random() < dt * 4) fireflies.push({ x: camX + Math.random() * VW, y: camY + 30 + Math.random() * (VH - 70), t: Math.random() * 6, life: 5 + Math.random() * 5 }); for (const f of fireflies) { f.t += dt; f.life -= dt; f.x += Math.sin(f.t * 1.7) * 14 * dt; f.y += Math.cos(f.t * 1.3) * 10 * dt; } fireflies = fireflies.filter(f => f.life > 0); if (pausePress) openMenu('title');
    else {
      const items = titleItems();
      if (upPress) { titleI = (titleI + items.length - 1) % items.length; SFX.ui(); }
      if (downPress) { titleI = (titleI + 1) % items.length; SFX.ui(); }
      if (confirmPress || jumpPress) {
        const k = items[titleI]; SFX.uiSel(); music.play(menuTrack());
        if (k === 'CONTINUE') { loadSlot(slot); applySkin(); applyUpgrades(); state = 'map'; }
        else if (k === 'NEW GAME' || k === 'CHOOSE A SAVE') { state = 'slots'; slotI = slot; slotMsg = ''; }
        else if (k === 'THE EDITOR') edEnter();
        else if (k === 'SETTINGS') openMenu('title');
        else if (k === 'CONTROLS') state = 'controls';
      }
    }
    return; }
  if (state === 'slots') {
    slotMsgT = Math.max(0, slotMsgT - dt);
    if (leftPress) { slotI = (slotI + SLOTS - 1) % SLOTS; SFX.ui(); slotMsg = ''; }
    if (rightPress) { slotI = (slotI + 1) % SLOTS; SFX.ui(); slotMsg = ''; }
    if (confirmPress) { loadSlot(slotI); applySkin(); applyUpgrades(); map.node = Math.max(0, Math.min(NODES.length - 1, PROG.mapNode || 0)); { const [, py] = (() => { const a = PATH[NODE_AT[map.node]]; return [a[0], a[1]]; })(); mapCamY = Math.max(0, Math.min(MAPH - VH, py - VH * 0.55)); } if (nodeLocked(NODES[map.node])) map.node = 0; map.seg = NODE_AT[map.node]; map.t = 0; map.walking = 0; state = !PROG.heroPicked && !heroLevel() && !LEVELS.some(l => PROG[l.id]) ? 'heropick' : 'map'; heroPick = { i: 0, stage: 'pick' }; SFX.uiSel(); } // a new save chooses its hero
    if (atkPress) { if (!readSlot(slotI)) { slotMsg = 'already empty'; slotMsgT = 2; SFX.buzz(); } else if (slotMsg === 'X again to erase' && slotMsgT > 0) { eraseSlot(slotI); slotMsg = 'slot ' + (slotI + 1) + ' erased'; slotMsgT = 2; SFX.crack(); } else { slotMsg = 'X again to erase'; slotMsgT = 2.5; SFX.ui(); } }
    if (pausePress) { state = 'title'; SFX.ui(); }
    return;
  }
  if (state === 'controls') { if (pausePress || confirmPress) { state = 'menu'; SFX.menuClose(); } return; }
  if (state === 'heropick') { updateHeroPick(); return; }
  if (state === 'herocard') { if (confirmPress) startTrial(hero()); else if (pausePress) { state = 'menu'; SFX.menuClose(); } return; }
  if (state === 'soundtest') {
    const cats = [SFX_NAMES(), MUSIC_NAMES, AMBIENT_NAMES]; const list = cats[soundCat];
    if (leftPress) { soundCat = (soundCat + 2) % 3; soundI = 0; SFX.ui(); }
    if (rightPress) { soundCat = (soundCat + 1) % 3; soundI = 0; SFX.ui(); }
    if (upPress) { soundI = (soundI + list.length - 1) % list.length; SFX.ui(); }
    if (downPress) { soundI = (soundI + 1) % list.length; SFX.ui(); }
    if (confirmPress) { const n = list[soundI]; if (soundCat === 0) SFX[n](); else if (soundCat === 1) music.play(n); else ambient.set(n); }
    if (pausePress) { state = 'menu'; ambient.set(menuFrom === 'play' ? null : 'forest'); music.play(menuFrom === 'play' ? (L.music || 'theme') : 'select'); SFX.menuClose(); }
    return;
  }
  if (state === 'gameover') { if (confirmPress || pausePress) { state = 'map'; gotoLevelNode(levelIndex); SFX.uiSel(); } return; }
  if (state === 'map') { updateMap(dt); updateParticles(dt); return; }
  if (state === 'store') { updateStore(dt); updateParticles(dt); return; }
  if (state === 'tree') { updateTree(dt); updateParticles(dt); return; }
  if (state === 'bestiary') {
    { const n = beastList().length; if (upPress) { bestI = (bestI + n - 1) % n; SFX.ui(); } if (downPress) { bestI = (bestI + 1) % n; SFX.ui(); } if (leftPress || rightPress) { bestTab = 1 - bestTab; bestI = 0; SFX.ui(); } }
    if (pausePress || confirmPress) { state = 'map'; SFX.ui(); }
    updateParticles(dt);
    return;
  }
  if (state === 'menu') {
    menuMsgT = Math.max(0, menuMsgT - dt);
    { const M = menuItems(); if (upPress) { do { menuI = (menuI + M.length - 1) % M.length; } while (isHeader(M[menuI])); SFX.ui(); }
    if (downPress) { do { menuI = (menuI + 1) % M.length; } while (isHeader(M[menuI])); SFX.ui(); } }
    if (leftPress) menuAdjust(-1); if (rightPress) menuAdjust(1);
    if (confirmPress) menuConfirm();
    if (pausePress) { if (menuKind === 'settings' && menuFrom === 'play') { menuKind = 'pause'; menuI = PAUSE_ITEMS.indexOf('Settings'); SFX.ui(); } else { state = menuFrom; SFX.menuClose(); } }
    return;
  }
  if (state === 'intro') {
    intro.t += dt; const line = INTRO[intro.card];
    if (intro.chars < line.length) { const n = intro.chars; intro.chars = Math.min(line.length, intro.chars + dt * (SET.textFast ? 70 : 28)); if (Math.floor(intro.chars) > Math.floor(n) && line[Math.floor(n)] !== ' ') SFX.text(); }
    intro.kx = Math.min(56, intro.kx + 14 * dt);
    if (confirmPress || atkPress) introNext();
    if (pausePress) startGame();
    updateParticles(dt);
    return;
  }
  if (state === 'win') { if (Math.random() < dt * 14 && leaves.length < 90) leaves.push({ x: camX + Math.random() * (VW + 60) - 30, y: camY - 6, t: Math.random() * 6, life: 9, col: ['#ffd36b', '#fff6c8', '#8fd160', '#ffe6a0', '#d0648a'][(Math.random() * 5) | 0] }); if (confirmPress) { state = 'map'; gotoLevelNode(levelIndex); saveProgress(); music.play(menuTrack()); } updateParticles(dt); updateCorpses(dt); updateWeather(dt); updateCamera(dt); return; }
  if (state === 'talk') { if (!talk) { state = 'play'; return; } if (pausePress || dodgePress) closeTalk(); else if (talkPress || confirmPress || atkPress) { talk.i++; if (talk.i >= talk.lines.length) closeTalk(); else { SFX.text(); if (talk.who && talk.who.t === 'npc') talk.who.lineI = talk.i; } } return; }
  if (!updateWarp(dt)) { clearPresses(); return; }
  if (edTesting && pausePress) { edResume(); return; } // testing your own wood: ESC goes back to the editor, not the pause menu
  if (pausePress) { openMenu('play'); return; }
  if (jumpPress) P.jbuf = SET.assist ? 0.2 : 0.12; if (atkPress) { P.abuf = 0.15; P.abufDown = !!keys.down && !P.ground; } if (dodgePress) P.dbuf = 0.12;
  if (stop > 0) { stop -= dt; return; }
  levelTime += dt;
  slowT = Math.max(0, slowT - dt); const wdt = (slowT > 0 ? dt * 0.3 : dt) * (SET.speed || 1);
  updateMovers(wdt); updatePlayer(wdt); updateEnemies(wdt); emitAt(null); updateWisp(wdt); updateSlide(wdt); updateFlood(wdt); traceBeams(wdt); updateProps(wdt); updateCrystal(wdt); updateSpans(wdt); updatePyres(wdt); updateCorpses(wdt); updateParticles(wdt); updateWeather(dt); updateCamera(dt);
  updatePolish(dt);
  flash = Math.max(0, flash - dt);
}

// ---------- render ----------
function text(s, x, y, col = '#fff6e0', align = 'left', size = 8) {
  g.font = size + 'px "Press Start 2P", monospace'; g.textAlign = align; g.textBaseline = 'top';
  g.fillStyle = ART.OUT; g.fillText(s, x + 1, y + 1); g.fillStyle = col; g.fillText(s, x, y);
}
function wrap(s, maxW, size = 8) { const words = s.split(' '), lines = []; let cur = ''; g.font = size + 'px "Press Start 2P", monospace'; for (const w of words) { const t = cur ? cur + ' ' + w : w; if (g.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; } if (cur) lines.push(cur); return lines; }
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
function bakeMenhir(z) { // a standing stone: one leaning, lichened slab over its tile column, not a stack of blocks
  const cols = z[1] - z[0] + 1, rows = z[3] - z[2] + 1, w = cols * TS + 12, h = rows * TS + 8; const [c, g] = canvas(w, h);
  let seed = (z[0] * 7919 + z[2] * 104729) >>> 0; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const lean = (rnd() - 0.5) * 6, top = 8, bot = h, L = [], R = [];
  const n = Math.max(4, rows); for (let k = 0; k <= n; k++) { const t = k / n, y = top + (bot - top) * t; const narrow = t < 0.25 ? (0.25 - t) * 16 : 0; L.push([4 + narrow + rnd() * 3 + lean * (1 - t), y]); R.push([w - 4 - narrow - rnd() * 3 + lean * (1 - t), y]); }
  const path = () => { g.beginPath(); g.moveTo(L[0][0] + 3, top - 2); g.lineTo(R[0][0] - 3, top - 1); for (const [x, y] of R) g.lineTo(x, y); for (let k = L.length - 1; k >= 0; k--) g.lineTo(L[k][0], L[k][1]); g.closePath(); };
  path(); g.fillStyle = '#6e7480'; g.fill();
  g.save(); path(); g.clip(); g.fillStyle = '#525866'; g.fillRect(Math.round(w * 0.58), 0, w, h); g.fillStyle = '#7e8492'; g.fillRect(0, 0, Math.round(w * 0.22), h); g.fillStyle = '#9aa0ac'; for (let k = 0; k < L.length - 1; k++) g.fillRect(Math.round(L[k][0]), Math.round(L[k][1]), 2, Math.round(L[k + 1][1] - L[k][1]) + 1);
  g.fillStyle = '#3e4450'; for (let k = 0; k < 2 + rows; k++) { const x = 8 + rnd() * (w - 16), y = top + 6 + rnd() * (h - top - 12), len = 3 + rnd() * 7; g.fillRect(Math.round(x), Math.round(y), 1, Math.round(len)); if (rnd() < 0.5) g.fillRect(Math.round(x), Math.round(y + len), Math.round(2 + rnd() * 3), 1); }
  for (let k = 0; k < 2 + Math.floor(rows / 2); k++) { const x = 4 + rnd() * (w - 8), y = h - 6 - rnd() * Math.min(h - 12, 26), r = 2 + rnd() * 3; g.fillStyle = rnd() < 0.5 ? '#7a8a3a' : '#a8b84a'; g.beginPath(); g.ellipse(x, y, r + 1, r, 0, 0, 7); g.fill(); }
  g.fillStyle = '#8fa040'; g.beginPath(); g.ellipse(w * 0.4 + rnd() * 8, top + 2, 4, 2, 0, 0, 7); g.fill();
  g.restore(); path(); g.strokeStyle = '#2a2f3d'; g.lineWidth = 1; g.stroke();
  g.fillStyle = '#4a5a2a'; g.fillRect(2, h - 2, w - 4, 2);
  return c;
}
// LIGHT. A warm bloom round anything burning, day or night, and long shafts of sun through the canopy in
// a daylit wood. Both are baked once and stamped, so they cost nothing per frame.
let GLOWS = null, SHAFT = null;
function bakeGlows() {
  const make = (r, g0, b) => { const [c, cg] = canvas(64, 64); const gr = cg.createRadialGradient(32, 32, 1, 32, 32, 32); gr.addColorStop(0, `rgba(${r},${g0},${b},1)`); gr.addColorStop(0.35, `rgba(${r},${g0},${b},0.45)`); gr.addColorStop(1, `rgba(${r},${g0},${b},0)`); cg.fillStyle = gr; cg.fillRect(0, 0, 64, 64); return c; };
  GLOWS = { warm: make(255, 160, 80), gold: make(255, 220, 140), cool: make(150, 220, 255), green: make(160, 230, 120) };
  const [s, sg] = canvas(24, 200); const gr = sg.createLinearGradient(0, 0, 0, 200); gr.addColorStop(0, 'rgba(255,248,220,0.55)'); gr.addColorStop(0.6, 'rgba(255,240,200,0.18)'); gr.addColorStop(1, 'rgba(255,240,200,0)'); sg.fillStyle = gr; sg.fillRect(0, 0, 24, 200);
  const hg = sg.createLinearGradient(0, 0, 24, 0); sg.globalCompositeOperation = 'destination-in'; hg.addColorStop(0, 'rgba(0,0,0,0)'); hg.addColorStop(0.5, 'rgba(0,0,0,1)'); hg.addColorStop(1, 'rgba(0,0,0,0)'); sg.fillStyle = hg; sg.fillRect(0, 0, 24, 200);
  SHAFT = s;
}
const bloom = (x, y, r, a, kind = 'warm') => { if (!GLOWS) bakeGlows(); g.globalAlpha = Math.min(1, a); g.drawImage(GLOWS[kind], Math.round(x - r), Math.round(y - r), r * 2, r * 2); };
const daylit = () => !L.night && !L.glowNight && !L.dark && !L.violet && dusk() < 0.4 && !(L.weather || []).some(w => w.kind === 'rain' || w.kind === 'snow');
function drawShafts(cx, cy) {
  if (!SET.weather || SET.parts === 'low' || !daylit()) return;
  if (!SHAFT) bakeGlows();
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 5; i++) { const span = VW + 160, x = (((i * 131 + 40 - cx * 0.35 + Math.sin(time * 0.2 + i) * 12) % span) + span) % span - 80, a = 0.2 + 0.07 * Math.sin(time * 0.5 + i * 1.7);
    g.save(); g.translate(Math.round(x), -10); g.transform(1, 0, -0.35, 1, 0, 0); g.globalAlpha = a; g.drawImage(SHAFT, 0, 0, 24 + (i % 3) * 10, VH + 20); g.restore(); }
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}
// THE WIND, drawn big: streaks right across the view while a gust blows, chevrons at the edge it comes from,
// and a blinking warning at that edge a beat before it starts. You should never have to guess.
const windFx = { on: false, soon: false, dir: 1, k: 1, t: 0 };
function drawWindFx() {
  if (!windFx.on && !windFx.soon) return; const d = windFx.dir;
  if (windFx.on) { g.strokeStyle = '#ffffff'; g.lineWidth = 1;
    for (let i = 0; i < 46; i++) { const sp = 380 + (i * 53) % 220, len = 18 + (i * 29) % 30, span = VW + 120; let x = ((i * 137 + time * sp) % span); if (d < 0) x = span - x; x -= 60; const y = (i * 71 + Math.floor(i / 7) * 13) % VH;
      g.lineWidth = i % 3 === 0 ? 2 : 1; g.globalAlpha = 0.28 + ((i * 7) % 5) * 0.07; g.beginPath(); g.moveTo(Math.round(x), y + 0.5); g.lineTo(Math.round(x - d * len), y + 0.5); g.stroke(); }
    g.globalAlpha = 0.5 + 0.3 * Math.sin(time * 12); g.fillStyle = '#eefaff'; const ex = d > 0 ? 6 : VW - 6;
    for (let k = 0; k < 3; k++) { const cxk = ex + d * (k * 9 + ((time * 40) % 9)), cyk = VH * 0.42; g.beginPath(); g.moveTo(cxk + d * 6, cyk); g.lineTo(cxk - d * 2, cyk - 8); g.lineTo(cxk - d * 2, cyk - 4); g.lineTo(cxk + d * 1, cyk); g.lineTo(cxk - d * 2, cyk + 4); g.lineTo(cxk - d * 2, cyk + 8); g.closePath(); g.fill(); }
    g.globalAlpha = 1; }
  else if (Math.floor(time * 8) % 2 === 0) { const ex = d > 0 ? 8 : VW - 8; g.globalAlpha = 0.8; g.fillStyle = '#ffd36b'; for (let k = 0; k < 2; k++) { const cxk = ex + d * k * 10, cyk = VH * 0.42; g.beginPath(); g.moveTo(cxk + d * 6, cyk); g.lineTo(cxk - d * 2, cyk - 8); g.lineTo(cxk - d * 2, cyk + 8); g.closePath(); g.fill(); } g.globalAlpha = 1; }
}
function drawBloom(cx, cy) {
  if (SET.parts === 'low') return;
  const day = !(L.night || L.glowNight) && !L.dark, k = day ? 0.55 : 0.4;
  g.globalCompositeOperation = 'lighter';
  if (day) { for (const lt of lights) if (lt.x > cx - 40 && lt.x < cx + VW + 40 && !(lt.ref && lt.ref.dark > 0) && !(lt.lantern && !lt.lantern.lit)) bloom(lt.x - cx, lt.y - cy, (lt.torch ? 22 : 18) + Math.sin(time * 9 + lt.x) * 1.5, 0.22 * k, lt.glow ? (lt.pink ? 'gold' : 'cool') : 'warm');
    for (const f of fires) if (f.delay <= 0 && f.x > cx - 30 && f.x < cx + VW + 30) bloom(f.x - cx, f.y - 8 - cy, 20, 0.3 * k); }
  for (const b of embers) bloom(b.x - cx, b.y - cy, 12, 0.5);
  for (const b of pyres) bloom(b.x - cx, b.y - cy, 30, 0.55);
  if (isPyro() && P.jet) bloom(P.x + P.face * (8 + jetLen() / 2) - cx, P.y - 9 - cy, 38, 0.3);
  if (isPyro() && P.full) bloom(P.x - cx, P.y - 10 - cy, 20, 0.25 + 0.1 * Math.sin(time * 9), 'gold');
  if (isPaladin() && (P.light || 0) >= 100) bloom(P.x - cx, P.y - 12 - cy, 22, 0.28 + 0.1 * Math.sin(time * 7), 'gold'); // a full light shows on him
  if (wisp) bloom(wisp.x - cx, wisp.y - cy, 16, 0.4, 'gold');
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}
// THE SWING. A blade leaves a crescent behind it; a staff thrust leaves a streak of flame.
function drawSwing(cx, cy) {
  if (P.atk < 0.02 || P.atk > 0.2 || P.dead) return;
  const px = Math.round(P.x - cx), py = Math.round(P.y - cy) - 9, f = P.face, k = (P.atk - 0.02) / 0.18;
  g.globalCompositeOperation = 'lighter';
  if (isPyro()) { const len = 30 * Math.min(1, k * 2.5), a = 1 - k;
    for (let i = 0; i < 3; i++) { g.globalAlpha = a * (0.55 - i * 0.15); g.fillStyle = i === 0 ? '#fff6c8' : i === 1 ? '#ffd36b' : '#ff9a5c'; const w = 2 + i * 2; g.fillRect(f > 0 ? px + 10 : px - 10 - len, py - 1 - i, len, w); } }
  else { const pal = isPaladin(), a0 = -2.1, sweep = 2.6 * Math.min(1, k * 2.2), r = pal ? 23 : 17;
    for (let i = 0; i < 4; i++) { const tail = 0.5 + i * 0.35; g.globalAlpha = (1 - k) * (0.5 - i * 0.1); g.strokeStyle = pal ? (i === 0 ? '#fff6c8' : i === 1 ? '#ffd36b' : '#f0c040') : i === 0 ? '#ffffff' : i === 1 ? '#fff6e0' : '#dfe8ff'; g.lineWidth = 3 - i * 0.6; g.beginPath();
      const s = a0 + Math.max(0, sweep - tail), e = a0 + sweep; if (f > 0) g.arc(px, py, r - i, s, e); else g.arc(px, py, r - i, Math.PI - e, Math.PI - s); g.stroke(); } }
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}
// THE CASTLE, on its mountain, far off: it sits between the far crags and the near hills, its mountain runs
// down behind the hills and fades into the haze, and it grows as you cross the level toward it.
function drawCastleBack(cx, cy) {
  if (!L.castle) return; const art = PROP.castleRange || (PROP.castleRange = ART.bakeCastleRange(5));
  const k = Math.max(0, Math.min(1, cx / Math.max(1, (LW * TS - VW)))), sc = (0.75 + k * 0.9) * (VH / 180);
  const w = Math.round(art.width * sc), h = Math.round(art.height * sc);
  const bx = Math.round(VW * 0.62 - w / 2 - cx * 0.04), by = Math.round(VH * 0.30 - 120 * sc + (((LH * TS - VH) - cy) * 0.04));
  g.globalAlpha = 0.72 + k * 0.2; g.drawImage(art, bx, by, w, h); g.globalAlpha = 1;
}
// a goblin house front: timber boards between posts, a stone footing, lit windows with green shutters, horns
// over the door, and a barred door where there is no way in. Baked once per house.
function bakeHouseFront(h) {
  const w = (h.x1 - h.x0 + 1) * TS, ht = (h.y1 - h.y0 + 1) * TS, rnd = mulberry(h.seed * 7 + 3), fh = 6;
  const [c, x] = canvas(w, ht);
  for (let bx = 0; bx < w; bx += 4) { x.fillStyle = (bx / 4) % 3 === 0 ? '#4a3222' : (bx / 4) % 3 === 1 ? '#5a3e2a' : '#533826'; x.fillRect(bx, 0, 4, ht); x.fillStyle = '#3a2618'; x.fillRect(bx, 0, 1, ht); }
  for (let k = 0; k < w / 5; k++) { x.fillStyle = '#6a4a32'; x.fillRect((rnd() * w) | 0, (rnd() * ht) | 0, 1, 2 + ((rnd() * 3) | 0)); }
  x.fillStyle = '#2e1c10'; x.fillRect(0, 0, w, 4); x.fillRect(0, (ht * 0.45) | 0, w, 2);
  for (let p = 0; p < w - 4; p += 5 * TS) x.fillRect(p, 0, 3, ht); x.fillRect(w - 3, 0, 3, ht);
  x.fillStyle = 'rgba(0,0,0,0.4)'; x.fillRect(0, 4, w, 3);
  x.fillStyle = '#5a5850'; x.fillRect(0, ht - fh, w, fh); x.fillStyle = '#6e6c62'; for (let sx = 0; sx < w; sx += 9) x.fillRect(sx + ((sx / 9) % 2 ? 4 : 0), ht - fh + 2, 7, 2); x.fillStyle = '#3a3830'; x.fillRect(0, ht - fh, w, 1);
  const doorPx = h.door !== null ? (h.door - h.x0) * TS + 8 : w / 2;
  for (let wx = 14; wx < w - 22; wx += 4 * TS) { if (Math.abs(wx + 5 - doorPx) < 24) continue; const wy = 11, lit = rnd() < 0.8;
    x.fillStyle = '#1e120a'; x.fillRect(wx - 1, wy - 1, 12, 11); x.fillStyle = lit ? '#ffb040' : '#2a2438'; x.fillRect(wx, wy, 10, 9); if (lit) { x.fillStyle = '#ffe0a0'; x.fillRect(wx + 1, wy + 1, 3, 3); }
    x.fillStyle = '#1e120a'; x.fillRect(wx + 4, wy, 2, 9); x.fillRect(wx, wy + 4, 10, 1);
    x.fillStyle = '#3f5a2c'; x.fillRect(wx - 4, wy - 1, 3, 11); x.fillRect(wx + 11, wy - 1, 3, 11); x.fillStyle = '#2c4020'; x.fillRect(wx - 4, wy + 4, 3, 1); x.fillRect(wx + 11, wy + 4, 3, 1);
    x.fillStyle = '#6e6c62'; x.fillRect(wx - 2, wy + 10, 14, 2); }
  if (h.door === null) { const dx = ((w / 2) | 0) - 7, dy = ht - fh - 22; x.fillStyle = '#1e120a'; x.fillRect(dx - 1, dy - 1, 16, 23); x.fillStyle = '#6a4428'; x.fillRect(dx, dy, 14, 22); x.fillStyle = '#4a2e1c'; for (let k = 3; k < 14; k += 4) x.fillRect(dx + k, dy, 1, 22); x.fillStyle = '#3a3a44'; x.fillRect(dx - 2, dy + 9, 18, 3); x.fillStyle = '#8a919c'; x.fillRect(dx - 2, dy + 9, 18, 1); }
  { const hx = (doorPx | 0) - 8; x.fillStyle = '#e8dcc0'; x.fillRect(hx, 6, 4, 2); x.fillRect(hx - 2, 3, 2, 4); x.fillRect(hx + 12, 6, 4, 2); x.fillRect(hx + 16, 3, 2, 4); x.fillStyle = '#6a4428'; x.fillRect(hx + 4, 5, 8, 4); x.fillStyle = '#ff6b4a'; x.fillRect(hx + 6, 6, 1, 1); x.fillRect(hx + 9, 6, 1, 1); }
  return c;
}
function drawHouses(cx, cy) {
  for (const h of (L.houses || [])) { const x = h.x0 * TS - cx, y = h.y0 * TS - cy, w = (h.x1 - h.x0 + 1) * TS; if (x > VW || x + w < 0) continue;
    if (!h.spr) h.spr = bakeHouseFront(h); g.drawImage(h.spr, Math.round(x), Math.round(y));
    const chx = Math.round((h.x1 - 1) * TS - cx), chy = Math.round((h.y0 - 3) * TS - cy); g.fillStyle = '#4a4640'; g.fillRect(chx, chy - 10, 8, 10); g.fillStyle = '#5e5a52'; g.fillRect(chx, chy - 10, 2, 10); g.fillStyle = '#2a2622'; g.fillRect(chx - 1, chy - 12, 10, 3);
    for (let k = 0; k < 4; k++) { const t2 = (time * 0.5 + k / 4 + h.seed * 0.13) % 1; g.globalAlpha = 0.4 * (1 - t2); g.fillStyle = '#a8a8b8'; g.beginPath(); g.arc(chx + 4 + t2 * 16, chy - 14 - t2 * 30, 2 + t2 * 5, 0, 7); g.fill(); } g.globalAlpha = 1; }
}
// ...and its roof: the slab you can walk on is slate, laid in courses, with snow on it and an eave that
// overhangs the wall. Drawn over the tiles, after them.
function bakeRoof(h) { const x0 = h.x0 - 1, x1 = h.x1 + 1, w = (x1 - x0 + 1) * TS + 4, ht = 3 * TS + 3, rnd = mulberry(h.seed * 3 + 1); const [c, x] = canvas(w, ht);
  x.fillStyle = '#2a2c3a'; x.fillRect(0, 0, w, ht - 2);
  for (let row = 0, y = 5; y < ht - 4; y += 5, row++) for (let sx = (row % 2) * 4 - 4; sx < w; sx += 8) { x.fillStyle = rnd() < 0.15 ? '#4a4458' : '#3e4052'; x.fillRect(sx + 1, y, 7, 4); x.fillStyle = '#525468'; x.fillRect(sx + 1, y, 7, 1); }
  x.fillStyle = '#1b1626'; x.fillRect(0, ht - 3, w, 3); x.fillStyle = '#5a4a3a'; x.fillRect(0, ht - 4, w, 1); // the eave board
  x.fillStyle = '#eef4ff'; x.fillRect(0, 0, w, 4); x.fillStyle = '#c8d4e8'; x.fillRect(0, 3, w, 1);
  for (let sx = 2; sx < w - 2; sx += 3 + ((rnd() * 5) | 0)) { x.fillStyle = '#eef4ff'; x.fillRect(sx, 4, 2, 1 + ((rnd() * 3) | 0)); } // snow hanging over the slates
  for (let sx = 6; sx < w - 6; sx += 10 + ((rnd() * 14) | 0)) { x.fillStyle = '#dfe8ff'; x.fillRect(sx, ht - 2, 1, 2 + ((rnd() * 3) | 0)); } // icicles
  return c; }
function drawRoofs(cx, cy) { for (const h of (L.houses || [])) { const x = (h.x0 - 1) * TS - 2 - cx, y = (h.y0 - 3) * TS - cy; if (x > VW || x + (h.x1 - h.x0 + 4) * TS < 0) continue; if (!h.roof) h.roof = bakeRoof(h); g.drawImage(h.roof, Math.round(x), Math.round(y)); } }
function drawWorld(cx, cy, showPlayer) {
  g.drawImage(BG.sky, 0, 0, 1, VH, 0, 0, VW, VH);
  const dk = dusk();
  if (dk > 0) { g.globalAlpha = dk; g.drawImage(BG.skyDusk, 0, 0, 1, VH, 0, 0, VW, VH); g.drawImage(BG.sun, Math.round(VW * 0.7 - cx * 0.03), Math.round(70 - dk * 30 + ((LH * TS - VH) - cy) * 0.1)); g.globalAlpha = 1; }
  if (!L.night && (!(L.weather || []).length || !weatherAt().includes('rain'))) for (const c of clouds) { const x = Math.round(c.x - cx * 0.1), y = Math.round(c.y + ((LH * TS - VH) - cy) * 0.05); g.globalAlpha = 0.85; g.drawImage(CLOUD[c.k], ((x % (VW + 160)) + VW + 160) % (VW + 160) - 80, y); g.globalAlpha = 1; }
  if (L.dark) { g.fillStyle = '#1a1a22'; g.fillRect(0, 0, VW, VH); g.fillStyle = '#22222c'; for (let k = 0; k < 6; k++) g.fillRect(((k * 97 - cx * 0.2) % (VW + 80) + VW + 80) % (VW + 80) - 40, 20 + k * 25, 60 + k * 9, 8); } // under the mountain there is only more mountain
  else if (SET.parallax !== 'off') { if (SET.parallax === 'full') drawLayer(BG.far, 0.15, VH - 90, cx, cy);
  drawCastleBack(cx, cy); drawLayer(BG.mid, 0.3, VH - 140, cx, cy); }
  else drawCastleBack(cx, cy);
  g.fillStyle = L.violet ? 'rgba(110,30,130,0.34)' : (L.palette && L.palette.haze) || 'rgba(205,232,210,0.16)'; g.fillRect(0, 0, VW, VH);
  // a wood with parts in different light (L.tints: [x0, x1, rgb, alpha] in tiles), crossfaded over two dozen tiles at each seam
  if (L.tints) { const mx = (cx + VW / 2) / TS; for (const [x0, x1, c, a] of L.tints) { const k = Math.max(0, Math.min(1, Math.min(mx - x0 + 12, x1 - mx + 12) / 24)); if (k > 0.01) { g.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (a * k).toFixed(3) + ')'; g.fillRect(0, 0, VW, VH); } } }
  if (L.tall) { const k = Math.max(0, Math.min(1, (camY + VH / 2 - L.tall.top) / (L.tall.bottom - L.tall.top))); if (k > 0.02) { g.fillStyle = 'rgba(16,34,18,' + (0.4 * k).toFixed(3) + ')'; g.fillRect(0, 0, VW, VH); } } // the roots sit in the canopy's gloom; the crown is in the light
  if (L.rot && !L.healed && !L.violet) { const k = Math.max(0, Math.min(1, (camX + VW / 2 - L.rot.x0) / (L.rot.x1 - L.rot.x0))); if (k > 0) { g.fillStyle = 'rgba(110,30,130,' + (0.26 * k).toFixed(3) + ')'; g.fillRect(0, 0, VW, VH); } }
  drawShafts(cx, cy);
  if (BG.nearTrees) { g.globalAlpha = 0.85; drawLayer(BG.nearTrees, 0.45, VH - 300, cx, cy); g.globalAlpha = 1; }
  if (!L.castle) drawLayer(BG.near, 0.55, VH - 300, cx, cy);
  if (L.palette && L.palette.hall) { // Kingswood: every one-way ledge in the open hangs from the boughs on two ropes
    g.strokeStyle = 'rgba(160,120,70,0.75)'; g.lineWidth = 1; g.beginPath();
    const tx0 = Math.max(0, Math.floor(cx / TS) - 1), tx1 = Math.min(LW - 1, Math.ceil((cx + VW) / TS) + 1);
    for (let ty = 0; ty < LH; ty++) for (let tx = tx0; tx <= tx1; tx++) if (L.grid[ty * LW + tx] === T.ONEWAY && L.grid[ty * LW + tx - 1] !== T.ONEWAY) { let n = 1; while (L.grid[ty * LW + tx + n] === T.ONEWAY) n++; if ((L.interiors || []).some(([x0, x1, y0, y1]) => tx >= x0 && tx <= x1 && ty >= y0 - 4 && ty <= y1)) continue; if (L.arena && tx * TS >= L.arena.x0 && tx * TS < L.arena.x1) continue; const ya = ty * TS - cy; for (const rx of [tx * TS + 3, (tx + n) * TS - 4]) { g.moveTo(Math.round(rx - cx) + 0.5, Math.max(-2, ya - 140)); g.lineTo(Math.round(rx - cx) + 0.5, ya + 2); } }
    g.stroke();
  }
  for (const [x0, x1, y0, y1, st] of (L.interiors || [])) { const sx = x0 * TS - cx, sy = y0 * TS - cy, w = (x1 - x0 + 1) * TS, h = (y1 - y0 + 1) * TS; if (sx > VW || sx + w < 0) continue; const earth = st === 'earth', stone = st === 'stone', glass = st === 'crystal'; g.fillStyle = earth ? '#2c1e14' : stone ? '#2a2c36' : glass ? '#3a3c5a' : '#2a1a10'; g.fillRect(sx, sy, w, h);
    if (glass) { g.fillStyle = '#4a4e74'; for (let yy = sy; yy < sy + h; yy += 8) for (let xx = sx + ((yy / 8) % 2 ? 12 : 0); xx < sx + w; xx += 24) g.fillRect(xx, yy, 22, 7); g.fillStyle = '#2a2c44'; for (let yy = sy + 7; yy < sy + h; yy += 8) g.fillRect(sx, yy, w, 1); g.fillStyle = '#7a8ac8'; for (let i = 0; i < w * h / 700; i++) { const rx = sx + ((i * 97) % w), ry = sy + ((i * 61) % h); g.fillRect(rx, ry, 1, 3 + (i % 3) * 2); g.fillRect(rx + 1, ry + 2, 1, 2); } for (let i = 0; i < w * h / 500; i++) { const rx = sx + ((i * 131 + 7) % w), ry = sy + ((i * 71 + 3) % h); const tw = 0.5 + 0.5 * Math.sin(time * 3 + i * 1.7); if (tw > 0.75) { g.fillStyle = tw > 0.92 ? '#eefaff' : '#7aa8c8'; g.fillRect(rx, ry, 1, 1); } } continue; }
    if (stone) { g.fillStyle = '#363a46'; for (let yy = sy; yy < sy + h; yy += 8) for (let xx = sx + ((yy / 8) % 2 ? 12 : 0); xx < sx + w; xx += 24) g.fillRect(xx, yy, 22, 7); g.fillStyle = '#1e2028'; for (let yy = sy + 7; yy < sy + h; yy += 8) g.fillRect(sx, yy, w, 1); continue; } if (earth) { g.fillStyle = '#3a2a1c'; for (let i = 0; i < w * h / 90; i++) { const rx = sx + ((i * 37) % w), ry = sy + ((i * 53) % h); g.fillRect(rx, ry, 2, 1); } g.fillStyle = '#4a3626'; for (let xx = sx + 12; xx < sx + w; xx += 28) g.fillRect(xx, sy, 1, 6 + (xx % 5) * 2); continue; } g.fillStyle = '#3a2618'; for (let yy = sy + 4; yy < sy + h; yy += 8) g.fillRect(sx, yy, w, 1); g.fillStyle = '#1e120a'; for (let xx = sx + ((cx * 0) % 40); xx < sx + w; xx += 40) g.fillRect(xx, sy, 1, h); }
  drawHouses(cx, cy);
  const tx0 = Math.floor(cx / TS), ty0 = Math.floor(cy / TS);
  for (let ty = ty0; ty <= ty0 + Math.ceil(VH / TS) + 1; ty++) for (let tx = tx0; tx <= tx0 + Math.ceil(VW / TS) + 1; tx++) {
    if (tx < 0 || ty < 0 || tx >= LW || ty >= LH) continue;
    const s = tileSpr[ty * LW + tx]; if (s) g.drawImage(s, tx * TS - cx, ty * TS - cy - (L.grid[ty * LW + tx] === T.REED ? 8 : 0));
  }
  for (const z of (L.stone || [])) { if (!z.spr) z.spr = bakeMenhir(z); const x = z[0] * TS - 6 - cx, y = z[2] * TS - 8 - cy; if (x < VW && y < VH && x > -z.spr.width && y > -z.spr.height) g.drawImage(z.spr, Math.round(x), Math.round(y)); }
  for (const r of (L.ropes || [])) { g.strokeStyle = '#c9b27c'; g.lineWidth = 1; g.beginPath(); g.moveTo(Math.round(r.x0 - cx) + 0.5, Math.round(r.y0 - cy) + 0.5); g.lineTo(Math.round(r.x1 - cx) + 0.5, Math.round(r.y1 - cy) + 0.5); g.stroke(); for (const [px, py, gy] of (r.posts || [])) { const x = Math.round(px - cx); g.fillStyle = '#4a3020'; g.fillRect(x - 2, Math.round(py - cy) - 4, 4, gy - py + 4); g.fillStyle = '#6a4a30'; g.fillRect(x - 1, Math.round(py - cy) - 4, 1, gy - py + 4); g.fillStyle = '#8b8378'; g.fillRect(x - 4, Math.round(py - cy) - 6, 8, 3); } }
  drawShards(cx, cy);
  drawWater(cx, cy, false);
  for (const m of movers) {
    if (m.x + m.w < cx - 10 || m.x > cx + VW + 10) continue;
    if (m.kind === 'pad') { g.drawImage(PROP.pad[m.sink > 0.55 ? 1 : 0], Math.round(m.x) - cx, Math.round(m.y) - cy); if (Math.round(m.x0 / TS) % 3 === 0 && m.sink < 0.55) g.drawImage(PROP.lilyFlower, Math.round(m.x) + 4 - cx, Math.round(m.y) - 5 - cy); }
    else if (m.kind === 'cart') { if (!m.gone) g.drawImage(PROP.mineCart[Math.abs(m.vx) > 20 ? Math.floor(time * 12) % 2 : 0], Math.round(m.x) - 1 - cx, Math.round(m.y) - 4 - cy); }
    else if (m.kind === 'orelift') { g.fillStyle = '#8b8378'; g.fillRect(Math.round(m.x) + 2 - cx, 0, 2, Math.round(m.y) - cy); g.fillRect(Math.round(m.x) + 60 - cx, 0, 2, Math.round(m.y) - cy); g.drawImage(PROP.orePan, Math.round(m.x) - cx, Math.round(m.y) - 3 - cy); }
    else if (m.kind === 'lift') { const ry = m.top !== undefined ? Math.round(m.top - cy) : 0; g.fillStyle = '#b8a888'; g.fillRect(Math.round(m.x) + 15 - cx, ry, 2, Math.round(m.y) - cy - ry); if (m.top !== undefined) { g.fillStyle = '#3a2618'; g.beginPath(); g.arc(Math.round(m.x) + 16 - cx, ry, 4, 0, 7); g.fill(); g.fillStyle = '#8a919c'; g.fillRect(Math.round(m.x) + 15 - cx, ry - 1, 2, 2); } g.drawImage(PROP.lift, Math.round(m.x) - cx, Math.round(m.y) - cy); }
    else if (m.kind === 'orelift' && m.player) { const x = Math.round(m.x - cx), y = Math.round(m.y - cy); g.fillStyle = '#5a6270'; g.fillRect(x + 15, y - 200, 2, 200); g.fillStyle = '#3a3a44'; g.fillRect(x, y, m.w, 6); g.fillStyle = '#8a919c'; g.fillRect(x, y, m.w, 1); g.fillRect(x, y - 22, 2, 22); g.fillRect(x + m.w - 2, y - 22, 2, 22); g.fillRect(x, y - 22, m.w, 2); for (let k = 4; k < m.w - 4; k += 6) g.fillRect(x + k, y - 20, 1, 20); }
    else if (m.kind === 'raft' || m.kind === 'punt') { for (let rx = 0; rx < m.w; rx += 48) g.drawImage(PROP.raft, 0, 0, Math.min(48, m.w - rx), 8, Math.round(m.x) + rx - cx, m.y - cy, Math.min(48, m.w - rx), 8); }
    else if (m.kind === 'drift') { g.save(); g.beginPath(); g.rect(m.x0 - cx, 0, m.x1 + m.w - m.x0, VH); g.clip(); const n = m.w / TS; for (let i = 0; i < n; i++) g.drawImage(i === 0 ? TILE.logL : i === n - 1 ? TILE.logR : TILE.log[i % 3], Math.round(m.x) + i * TS - cx, m.y - cy); g.restore(); }
    else if (m.kind === 'wheel') { if (m.mill && m.first) drawMillTower(m, cx, cy); const a = m.mill ? (m.ang || 0) + m.phase : time * 2 * Math.PI / m.period + m.phase; g.save(); g.translate(Math.round(m.px - cx), Math.round(m.py - cy)); g.rotate(a - Math.PI / 2); g.drawImage(PROP.sail, -5, 0); g.restore(); g.fillStyle = '#5c3a1d'; g.fillRect(Math.round(m.x - cx), Math.round(m.y - cy), m.w, 3); g.fillStyle = '#8a5a32'; g.fillRect(Math.round(m.x - cx), Math.round(m.y - cy), m.w, 1); }
    else if (m.kind === 'swing' && m.bucket) { const bx = Math.round(m.x - cx), by = Math.round(m.y - cy), px2 = Math.round(m.px - cx), py2 = Math.round(m.py - cy); g.strokeStyle = '#8a919c'; g.lineWidth = 1; g.beginPath(); g.moveTo(px2 + 0.5, py2); g.lineTo(bx + m.w / 2 + 0.5, by - 10); g.stroke(); g.beginPath(); g.moveTo(bx + 3, by); g.lineTo(bx + m.w / 2, by - 10); g.lineTo(bx + m.w - 3, by); g.stroke();
      g.fillStyle = '#3a2618'; g.fillRect(px2 - 3, py2 - 2, 6, 4); g.fillStyle = '#5a3a24'; g.fillRect(bx + 1, by, m.w - 2, 10); g.fillStyle = '#7a5234'; for (let k = 3; k < m.w - 2; k += 6) g.fillRect(bx + k, by + 1, 2, 8); g.fillStyle = '#8a919c'; g.fillRect(bx, by, m.w, 2); g.fillRect(bx + 1, by + 8, m.w - 2, 2); g.fillStyle = '#a89a80'; g.fillRect(bx + 4, by - 2, m.w - 8, 2); } // the mason's bucket: iron-bound, a load of stone in it
    else if (m.kind === 'swing') { g.strokeStyle = m.vine ? '#3f6e2c' : '#c9b27c'; g.lineWidth = m.vine ? 2 : 1; g.beginPath(); g.moveTo(Math.round(m.px - cx) + 0.5, Math.round(m.py - cy)); g.lineTo(Math.round(m.x - cx) + 2.5, Math.round(m.y - cy)); g.moveTo(Math.round(m.px - cx) + 0.5, Math.round(m.py - cy)); g.lineTo(Math.round(m.x + m.w - cx) - 2.5, Math.round(m.y - cy)); g.stroke(); if (m.vine) { g.fillStyle = '#6faa4a'; for (let k = 1; k < 5; k++) { const t = k / 5; g.fillRect(Math.round(m.px + (m.x + 2 - m.px) * t - cx) + (k % 2 ? 1 : -3), Math.round(m.py + (m.y - m.py) * t - cy), 3, 2); g.fillRect(Math.round(m.px + (m.x + m.w - 2 - m.px) * t - cx) + (k % 2 ? -3 : 1), Math.round(m.py + (m.y - m.py) * t - cy) + 1, 3, 2); } } g.fillStyle = m.vine ? '#3f6e2c' : '#5c3a1d'; g.fillRect(Math.round(m.px - cx) - 3, Math.round(m.py - cy) - 3, 6, 4); const n = m.w / TS; for (let i = 0; i < n; i++) g.drawImage(i === 0 ? TILE.logL : i === n - 1 ? TILE.logR : TILE.log[i % 3], Math.round(m.x) + i * TS - cx, Math.round(m.y) - cy); }
    else if (m.cap) { const n = m.w / TS; for (let i = 0; i < n; i++) { g.drawImage(TILE.mycDirt[i % 3], 0, 0, 16, 8, Math.round(m.x) + i * TS - cx, m.y + 8 - cy, 16, 8); g.drawImage(TILE.bouncer[0], Math.round(m.x) + i * TS - cx, m.y - 8 - cy); } }
    else { const n = m.w / TS; for (let i = 0; i < n; i++) g.drawImage(i === 0 ? TILE.logL : i === n - 1 ? TILE.logR : TILE.log[i % 3], Math.round(m.x) + i * TS - cx, m.y - cy); }
  }
  drawRoofs(cx, cy);
  for (const pr of props) if (pr.t === 'treehouse' && pr.x > cx - 60 && pr.x < cx + VW + 60) g.drawImage(PROP.treehouse[pr.v], Math.round(pr.x) - 20 - cx, Math.round(pr.y) - 30 - cy);
  for (let ty = ty0; ty <= ty0 + Math.ceil(VH / TS) + 1; ty++) for (let tx = tx0; tx <= tx0 + Math.ceil(VW / TS) + 1; tx++) if (tx >= 0 && ty > 0 && tx < LW && ty < LH && L.grid[ty * LW + tx] === T.PALISADE && L.grid[(ty - 1) * LW + tx] !== T.PALISADE) g.drawImage(TILE.palisadeTop, tx * TS - cx, ty * TS - 6 - cy);
  drawGateFx(cx, cy); drawHoly(cx, cy); drawHealths(cx, cy);
  // SCAFFOLDING: poles from the top deck down to the bottom of the pit, braced in an X between each pair, lashed where
  // they cross the planks; the crane on the last tower reaches out over the hoist
  for (const pr of props) if (pr.t === 'scaffold' && pr.x1 > cx - 20 && pr.x0 < cx + VW + 20) { const bot = LH * TS - cy, top = Math.round(pr.top - cy) - 4;
    const poles = []; for (let x = pr.x0 + 2; x < pr.x1; x += 40) poles.push(x); if (poles[poles.length - 1] < pr.x1 - 12) poles.push(pr.x1 - 4);
    g.strokeStyle = '#4a3220'; g.lineWidth = 1;
    for (let i = 0; i + 1 < poles.length; i++) for (let y = top + 8; y < bot; y += 64) { g.beginPath(); g.moveTo(poles[i] - cx + 1, y); g.lineTo(poles[i + 1] - cx + 1, y + 64); g.moveTo(poles[i + 1] - cx + 1, y); g.lineTo(poles[i] - cx + 1, y + 64); g.stroke(); }
    for (const x of poles) { g.fillStyle = '#5c3a1d'; g.fillRect(Math.round(x - cx), top, 3, bot - top); g.fillStyle = '#7a5234'; g.fillRect(Math.round(x - cx), top, 1, bot - top); g.fillStyle = '#c9b27c'; for (let y = top + 4; y < bot; y += 64) g.fillRect(Math.round(x - cx) - 1, y, 5, 2); }
    if (pr.crane) { const mx = Math.round(pr.x1 - cx) - 2, jy = top; g.fillStyle = '#4a3220'; g.fillRect(mx - 2, jy - 20, 4, 20); g.fillRect(mx - 2, jy - 20, 4 * TS + 12, 4); g.fillStyle = '#6a4a2c'; g.fillRect(mx - 2, jy - 20, 4 * TS + 12, 1); g.strokeStyle = '#8a919c'; g.beginPath(); g.moveTo(mx, jy - 18); g.lineTo(mx + 4 * TS + 8, jy - 16); g.stroke(); } }
  // A FALL OF WATER over a lip of rock: streaks running down, spray where it goes out of sight
  for (const pr of props) if (pr.t === 'cascade' && pr.x > cx - 30 && pr.x < cx + VW + 30) { const x = Math.round(pr.x - cx), y0 = Math.round(pr.y0 - cy), y1 = Math.min(VH + 10, Math.round(pr.y1 - cy));
    if (y1 > y0) { g.fillStyle = 'rgba(150,190,230,0.55)'; g.fillRect(x - 5, y0, 12, y1 - y0); g.fillStyle = 'rgba(220,240,255,0.7)';
      for (let k = 0; k < 7; k++) { const sx = x - 4 + (k * 5) % 11, off = ((time * 90 + k * 37 + pr.ph * 40) % 40); for (let y = y0 - 40 + off; y < y1; y += 40) if (y > y0) g.fillRect(sx, Math.round(y), 1, 12); }
      g.fillStyle = 'rgba(240,250,255,0.8)'; g.fillRect(x - 6, y0, 14, 2);
      if (Math.random() < 0.3) parts.push({ x: pr.x + (Math.random() - 0.5) * 14, y: pr.y0 + 2, vx: (Math.random() - 0.5) * 20, vy: 10, life: 0.4, max: 0.4, col: '#e8f4ff', size: 1, grav: 60 }); } }
  for (const pr of props) {
    if (pr.x < cx - 40 || pr.x > cx + VW + 40) continue;
    if (pr.t === 'towertop') g.drawImage(PROP.towertop, Math.round(pr.x) - 16 - cx, Math.round(pr.y) - 18 - cy);
    else if (pr.t === 'cage') { g.drawImage(PROP.cage, Math.round(pr.x) - 8 - cx, Math.round(pr.y) - 16 - cy); if (!pr.open) { if (pr.kind === 'fox') drawSet(SPR.fox, null, Math.floor(time * 4) % 2, pr.x - cx, pr.y - 2 - cy, 1, false); else if (pr.kind === 'squire') drawSet(SPR.squire, null, Math.floor(time * 2) % 2, pr.x - cx, pr.y - 1 - cy, -1, false); else drawSet(BIRD, null, Math.floor(time * 6) % 2, pr.x - cx, pr.y - 7 - cy, 1, false); } }
    else if (pr.t === 'barrel' && !pr.gone) g.drawImage(PROP.barrel, Math.round(pr.x) - 6 - cx, Math.round(pr.y) - 14 - cy);
    else if (pr.t === 'rockfall') { if (pr.gy === undefined) { let gy = Math.floor(pr.y / TS) + 1; while (gy < LH && !isSolid(Math.floor(pr.x / TS), gy) && !isOneWay(tileAt(Math.floor(pr.x / TS), gy))) gy++; pr.gy = gy * TS; } /* the fall line: rubble where they land, and a red mark that pulses as the next one works loose */
      const rx = Math.round(pr.x - cx), ry = pr.gy - cy; g.fillStyle = '#6a6e78'; for (const [ox, w] of [[-7, 3], [-2, 2], [3, 3], [6, 2]]) g.fillRect(rx + ox, ry - 2, w, 2); g.fillStyle = '#9aa0aa'; g.fillRect(rx - 5, ry - 3, 2, 1); g.fillRect(rx + 4, ry - 3, 2, 1);
      if (Math.abs(P.x - pr.x) < 230 && pr.timer < 0.8) { const k = 1 - pr.timer / 0.8; g.globalAlpha = 0.35 + 0.5 * k; g.strokeStyle = '#ff6b4a'; g.lineWidth = 1; g.beginPath(); g.ellipse(rx, ry - 1, 10 - k * 3, 3, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; } }
    else if (pr.t === 'brazier') g.drawImage(PROP.brazier[pr.lit ? 1 : 0], Math.round(pr.x) - 7 - cx, Math.round(pr.y) - 16 - cy);
    else if (pr.t === 'crank') g.drawImage(PROP.crank, Math.round(pr.x) - 6 - cx, Math.round(pr.y) - 14 - cy);
    else if (pr.t === 'throne') g.drawImage(PROP.throne, Math.round(pr.x) - 32 - cx, Math.round(pr.y) - 4 - cy);
    else if (pr.t === 'key' && !pr.got) { const yy = Math.round(pr.y + Math.sin(time * 3 + pr.ph) * 2 - cy), xx = Math.round(pr.x - cx);
      g.globalAlpha = 0.3 + 0.15 * Math.sin(time * 4); g.fillStyle = '#ffd34a'; g.beginPath(); g.arc(xx, yy, 9, 0, 7); g.fill(); g.globalAlpha = 1;
      g.drawImage(PROP.keyIcon[pr.kind] || PROP.keyIcon.brass, xx - 4, yy - 5); }
    else if (pr.t === 'lockgate') { const xx = Math.round(pr.x - cx), yy = Math.round(pr.y - cy);
      if (!pr.open) { g.drawImage(PROP.lockPlate, xx - 6, yy - pr.h * TS / 2 - 6);
        if (Math.abs(P.x - pr.x) < 44) { const k = hasKey(pr.needs); text(k ? 'IT TURNS' : 'LOCKED', xx, yy - pr.h * TS / 2 - 20, k ? '#8fd160' : '#ff9a5c', 'center', 6); } } }
    else if (pr.t === 'doorway') { const xx = Math.round(pr.x - cx), yy = Math.round(pr.y - cy);
      g.drawImage(PROP.doorway[pr.needs && !hasKey(pr.needs) ? 1 : 0], xx - 10, yy - 26);
      if (!P.dead && Math.abs(P.x - pr.x) < 16 && Math.abs(P.y - pr.y) < 20 && !warp) {
        const barred = pr.needs && !hasKey(pr.needs);
        text(barred ? 'BARRED' : 'E', xx, yy - 36 + Math.round(Math.sin(time * 6)), barred ? '#ff9a5c' : '#8fd160', 'center', 6); } }
    else if (pr.t === 'door') { if (pr.kind === 'cottage') g.drawImage(PROP.cottage[pr.shut ? 1 : 0], Math.round(pr.x) - 18 - cx, Math.round(pr.y) - 32 - cy); else g.drawImage(PROP.door[pr.shut ? 1 : 0], Math.round(pr.x) - 17 - cx, Math.round(pr.y) - 34 - cy); }
    else if (pr.t === 'carpet') g.drawImage(PROP.carpet, Math.round(pr.x) - 8 - cx, Math.round(pr.y) - 3 - cy);
    else if (pr.t === 'winch') { const x = Math.round(pr.x - cx), y = Math.round(pr.y - cy); g.fillStyle = '#3a2214'; g.fillRect(x - 1, y - 16, 3, 16); g.fillStyle = '#5a3a24'; g.beginPath(); g.arc(x, y - 12, 6, 0, 7); g.fill(); g.strokeStyle = '#8a5a32'; g.lineWidth = 1; for (let k = 0; k < 4; k++) { const a = pr.spin + k * Math.PI / 2; g.beginPath(); g.moveTo(x, y - 12); g.lineTo(x + Math.cos(a) * 8, y - 12 + Math.sin(a) * 8); g.stroke(); } g.fillStyle = '#5a6270'; g.fillRect(x - 1, y - 13, 3, 3);
      g.strokeStyle = 'rgba(90,98,112,0.8)'; g.beginPath(); g.moveTo(x, y - 18); g.lineTo(pr.gate * TS + 8 - cx, pr.gy0 * TS - cy); g.stroke(); if (pr.open > 0) { g.fillStyle = '#ffd36b'; g.fillRect(x - 6, y - 24, Math.round(12 * pr.open / pr.hold), 2); } }
    else if (pr.t === 'weight' && pr.lamp) { const x = Math.round(pr.x - cx), top = Math.round(pr.y - cy), by = Math.round((pr.state === 'hang' ? pr.y + pr.len : pr.fy) - cy), sx = x - 22, deck = Math.round(pr.y + pr.len + 3 * TS - cy);
      if (!pr.hang) { g.fillStyle = '#3a2618'; g.fillRect(sx - 1, top - 2, 3, deck - top + 2); g.fillRect(sx - 1, top - 3, 26, 3); g.fillStyle = '#5a3a24'; g.fillRect(sx, top - 2, 1, deck - top); g.fillRect(sx + 18, top, 3, 5); } // the standard and its arm (a hung one has the ceiling instead)
      if (pr.state === 'tell' || pr.state === 'fall') { const fl = Math.round((pr.floorY || pr.y + pr.len + 5 * TS) - cy), k = pr.state === 'tell' ? 0.5 : Math.min(1, 0.5 + (pr.fy - pr.y - pr.len) / 120); g.fillStyle = `rgba(20,10,30,${0.25 + 0.35 * k})`; g.beginPath(); g.ellipse(x, fl, 8 + 10 * k, 3, 0, 0, 7); g.fill(); }
      if (pr.state === 'hang' || pr.state === 'tell') { g.strokeStyle = '#5a6270'; g.lineWidth = 1; for (let yy = top; yy < by - 12; yy += 3) { g.beginPath(); g.moveTo(x + 0.5, yy); g.lineTo(x + 0.5, yy + 2); g.stroke(); } }
      if (pr.hang && (pr.state !== 'down' || pr.downT < 1.2)) { const sh = pr.state === 'tell' ? Math.round(Math.sin(time * 70) * 2) : 0; g.drawImage(SPR.chandelier, x + sh - Math.round(SPR.chandelier.width / 2), by - SPR.chandelier.height); }
      else if (pr.state !== 'down' || pr.downT < 1.2) { const cy2 = by - 12; g.fillStyle = '#2a2a34'; g.fillRect(x - 6, cy2, 12, 12); g.fillStyle = '#5a6270'; for (let k = -6; k <= 6; k += 4) g.fillRect(x + k, cy2, 1, 12); g.fillRect(x - 6, cy2, 12, 1); g.fillRect(x - 6, cy2 + 11, 12, 1);
        if (pr.state !== 'down') { const f = Math.floor(time * 12) % 3; g.fillStyle = '#ff9a5c'; g.fillRect(x - 3, cy2 + 3 - (f === 1 ? 1 : 0), 6, 7); g.fillStyle = '#ffd36b'; g.fillRect(x - 2, cy2 + 5, 4, 4); g.fillStyle = '#fff6c8'; g.fillRect(x - 1, cy2 + 6, 2, 2); } } }
    else if (pr.t === 'weight') { const x = Math.round(pr.x - cx), top = Math.round(pr.y - cy), by = Math.round((pr.state === 'hang' ? pr.y + pr.len : pr.fy) - cy); if (pr.state === 'hang') { g.strokeStyle = '#5a6270'; g.lineWidth = 1; for (let yy = top; yy < by - 10; yy += 3) { g.beginPath(); g.moveTo(x, yy); g.lineTo(x, yy + 2); g.stroke(); } g.fillStyle = '#3a3e48'; g.fillRect(x - 3, top - 2, 7, 2); } g.fillStyle = '#3a3e48'; g.fillRect(x - 7, by - 10, 14, 10); g.fillStyle = '#5a6270'; g.fillRect(x - 6, by - 9, 12, 2); g.fillStyle = '#1b1626'; g.fillRect(x - 7, by - 1, 14, 1); if (pr.state === 'hang') { g.strokeStyle = '#8a919c'; g.beginPath(); g.arc(x, by - 12, 2, 0, 7); g.stroke(); } }
    else if (pr.t === 'support') { const x = Math.round(pr.x - cx) + (pr.shake > 0 ? Math.round(Math.sin(time * 60)) : 0), yb = Math.round(pr.y - cy), yt = Math.round(pr.top - cy); if (pr.broken) { g.fillStyle = '#4a4a58'; g.fillRect(x - 5, yb - 8, 10, 8); g.fillStyle = '#6a6a78'; g.fillRect(x - 4, yb - 9, 3, 2); g.fillRect(x + 1, yb - 10, 3, 3); }
      else { for (let yy = yt; yy < yb; yy += 8) { g.fillStyle = (yy / 8) % 2 ? '#5a5a68' : '#62626e'; g.fillRect(x - 5, yy, 10, Math.min(8, yb - yy)); g.fillStyle = '#3a3a44'; g.fillRect(x - 5, yy, 10, 1); } g.fillStyle = '#6e6e7a'; g.fillRect(x - 7, yt, 14, 3); g.fillRect(x - 7, yb - 3, 14, 3); if (pr.hp < 4) { g.strokeStyle = '#1b1626'; g.lineWidth = 1; g.beginPath(); g.moveTo(x - 3, yt + 10); for (let k = 0; k < 4 - pr.hp; k++) g.lineTo(x + (k % 2 ? 3 : -2), yt + 16 + k * 9); g.stroke(); } } }
    else if (pr.t === 'chimpot') { const x = Math.round(pr.x - cx), y = Math.round(pr.y - cy); g.fillStyle = '#6a3a2a'; g.fillRect(x - 5, y - 10, 10, 10); g.fillStyle = '#8a5038'; for (let yy = y - 10; yy < y; yy += 3) g.fillRect(x - 5, yy, 10, 1); g.fillStyle = '#2a1a14'; g.fillRect(x - 6, y - 12, 12, 3);
      for (let k = 0; k < 3; k++) { const t2 = (time * 0.5 + k / 3 + pr.ph) % 1; g.globalAlpha = 0.35 * (1 - t2); g.fillStyle = '#6a6470'; g.beginPath(); g.arc(x + t2 * 12, y - 14 - t2 * 26, 2 + t2 * 5, 0, 7); g.fill(); } g.globalAlpha = 1; }
    else if (pr.t === 'stormkite') { const x = Math.round(pr.x - cx), y = Math.round(pr.y - cy); g.fillStyle = '#5c3a1d'; g.fillRect(x - 1, y - 44, 3, 44); g.fillStyle = '#3a2214'; g.fillRect(x - 3, y - 4, 7, 4); g.fillRect(x - 4, y - 46, 9, 3);
      if (!(P.fly && flight)) { const kx = x + 30 + Math.round(Math.sin(time * 1.3) * 4), ky = y - 86 + Math.round(Math.sin(time * 2.1) * 3); g.strokeStyle = '#e8dcc0'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 0.5, y - 44); g.quadraticCurveTo(x + 22, y - 50, kx + 0.5, ky + 20); g.stroke(); drawBigKite(kx, ky, pr.ph);
        if (Math.abs(P.x - pr.x) < 70) { const k = 0.5 + 0.5 * Math.sin(time * 6); g.globalAlpha = 0.5 + 0.4 * k; text('TAKE HOLD', x, y - 56, '#ffd36b', 'center', 6); g.globalAlpha = 1; } } }
    else if (pr.t === 'skybolt') { const x = Math.round(pr.x - cx), y0 = Math.round(pr.y0 - cy), y1 = Math.round(pr.y1 - cy);
      g.globalAlpha = 0.55; g.fillStyle = '#3a3a52'; for (let k = -2; k <= 2; k++) { g.beginPath(); g.ellipse(x + k * 9, Math.max(y0, -4) + 10 + Math.abs(k) * 2, 12, 7, 0, 0, 7); g.fill(); } g.globalAlpha = 1; // the storm cloud it comes out of
      if (pr.tell) { const on = Math.floor(time * 16) % 2; g.globalAlpha = on ? 0.7 : 0.3; g.fillStyle = '#dfe8ff'; for (let yy = Math.max(y0, 0) + 16; yy < y1; yy += 8) g.fillRect(x - 1, yy, 3, 4); g.globalAlpha = 0.12; g.fillRect(x - 12, Math.max(y0, 0), 24, y1 - Math.max(y0, 0)); g.globalAlpha = 1; } }
    else if (pr.t === 'stal') { if (pr.state !== 'gone') { const x = Math.round(pr.x - cx) + (pr.state === 'shake' ? Math.round(Math.sin(time * 70)) : 0), y = Math.round(pr.y - cy), lit = L.cloudLine !== undefined && pr.y / TS < L.cloudLine;
      g.fillStyle = lit ? '#bfe6f5' : '#8fb8d8'; g.beginPath(); g.moveTo(x - 5, y); g.lineTo(x + 5, y); g.lineTo(x + 1, y + 16); g.lineTo(x - 1, y + 16); g.closePath(); g.fill(); g.fillStyle = '#eefaff'; g.fillRect(x - 2, y + 1, 1, 10); g.fillStyle = '#5a7a98'; g.fillRect(x + 2, y + 1, 1, 7);
      g.strokeStyle = '#1b1626'; g.lineWidth = 1; g.beginPath(); g.moveTo(x - 5.5, y); g.lineTo(x - 1, y + 16.5); g.lineTo(x + 1, y + 16.5); g.lineTo(x + 5.5, y); g.stroke(); } }
    else if (pr.t === 'rod') { const x = Math.round(pr.x - cx), y = Math.round(pr.y - cy), hot = boss && boss.t === 'gqueen' && boss.gather > 0; g.fillStyle = '#3a3e48'; g.fillRect(x - 1, y - 18, 2, 18); g.fillStyle = hot ? '#dfe8ff' : '#8a919c'; g.beginPath(); g.arc(x, y - 19, 2.5, 0, 7); g.fill(); if (hot) { g.globalAlpha = 0.3 + 0.3 * Math.sin(time * 30); g.fillStyle = '#9ab8ff'; g.beginPath(); g.arc(x, y - 19, 7, 0, 7); g.fill(); g.globalAlpha = 1; } }
    else if (pr.t === 'bell') g.drawImage(PROP.bell[pr.broken ? 3 : (pr.ringT > 0 || pr.swing > 0) ? 1 + Math.floor(time * 12) % 2 : 0], Math.round(pr.x) - 8 - cx, Math.round(pr.y) - 24 - cy);
    else if (pr.t === 'exit') { g.drawImage(PROP.shopDoor, Math.round(pr.x) - 10 - cx, Math.round(pr.y) - 30 - cy); if (Math.abs(P.x - pr.x) < 14) text('UP', pr.x - cx, pr.y - 40 - cy + Math.round(Math.sin(time * 5) * 2), '#ffd36b', 'center', 6); }
    else if (pr.t === 'npc') { /* drawn after the scenery, below, so counters and shelves never hide them */ }
    else if (pr.t === 'stray') { if (!pr.got) { if (pr.kind === 'sheep') drawSet(SPR.sheep, null, Math.floor(time * 0.7 + pr.anim) % 3 === 1 ? 1 : 0, pr.x - cx, pr.y - cy, 1, false); else { const c = pr.kind === 'pot' ? PROP.honeyPot : pr.kind === 'trap' ? PROP.fishTrap[0] : pr.kind === 'coffer' ? PROP.coffer : pr.kind === 'lamp' ? PROP.lampIcon : pr.kind === 'folk' ? PROP.folkIcon : pr.kind === 'shard' ? PROP.sunshardIcon : pr.kind === 'seal' ? PROP.sealIcon : pr.kind === 'cup' ? PROP.cupIcon : pr.kind === 'lens' ? PROP.lensIcon : pr.kind === 'canary' ? PROP.canary[Math.floor(time * 3 + pr.anim) % 2] : pr.kind === 'kite' ? (PROP.kiteIcon || (PROP.kiteIcon = bakeKiteIcon())) : PROP.brightCap; if (pr.kind === 'cap') { g.globalAlpha = 0.25 + 0.1 * Math.sin(time * 4); g.fillStyle = '#7fe0e8'; g.beginPath(); g.arc(Math.round(pr.x - cx), Math.round(pr.y - 6 - cy), 10, 0, 7); g.fill(); g.globalAlpha = 1; } g.drawImage(c, Math.round(pr.x) - (c.width >> 1) - cx, Math.round(pr.y) - c.height - cy); } const by = Math.round(pr.y - 18 + Math.sin(time * 4 + pr.anim) * 2 - cy); g.fillStyle = '#ffe6a0'; g.fillRect(Math.round(pr.x - cx) - 1, by, 2, 4); g.fillRect(Math.round(pr.x - cx) - 2, by + 1, 4, 2); } }
    else if (pr.t === 'felltree') { if (pr.felled) g.drawImage(PROP.fallenPine, Math.round(pr.x) + 8 - cx, pr.y - 18 - cy); else { g.save(); g.translate(Math.round(pr.x - cx), Math.round(pr.y - cy)); g.rotate(pr.fall > 0 ? Math.pow(pr.fall, 2) * Math.PI / 2 * pr.dir : (pr.shake > 0 ? Math.sin(time * 40) * 0.03 : 0)); g.drawImage(PROP.pine, -9, -66); g.restore(); } }
    else if (pr.t === 'sluice') g.drawImage(PROP.sluice[pr.open ? 1 : 0], Math.round(pr.x) - 8 - cx, Math.round(pr.y) - 24 - cy);
    else if (pr.t === 'catapult') g.drawImage(PROP.catapult[pr.wrecked ? 2 : pr.fired > 0 ? 1 : 0], Math.round(pr.x) - 18 - cx, Math.round(pr.y) - 26 - cy);
    else if (pr.t === 'chainpost') { g.drawImage(PROP.chainPost, Math.round(pr.x) - 6 - cx, Math.round(pr.y) - 28 - cy); if (!pr.cut) drawSet(SPR.hound, null, Math.floor(time * 3) % 2, pr.x + 12 - cx, pr.y - cy, 1, false); }
    else if (pr.t === 'firepit') g.drawImage(PROP.grate, Math.round(pr.x) - 8 - cx, Math.round(pr.y) - 5 - cy);
    else if (pr.t === 'lantern') { if (pr.lit) { g.globalAlpha = 0.18 + 0.05 * Math.sin(time * 4 + pr.x); g.fillStyle = '#ffd36b'; g.beginPath(); g.arc(Math.round(pr.x - cx), Math.round(pr.y - 30 - cy), 26, 0, 7); g.fill(); g.globalAlpha = 1; } g.drawImage(PROP.crownLantern[pr.lit ? 1 : 0], Math.round(pr.x) - 6 - cx, Math.round(pr.y) - 36 - cy); }
    else if (pr.t === 'gas') g.drawImage(PROP.gasSeam, Math.round(pr.x) - 8 - cx, Math.round(pr.y) - 6 - cy);
    else if (pr.t === 'minerlamp') g.drawImage(PROP.minerLamp[pr.lit ? 1 : 0], Math.round(pr.x) - 4 - cx, Math.round(pr.y) - 14 - cy);
    else if (pr.t === 'boiler') g.drawImage(PROP.boiler[pr.burst > 0 ? 1 : 0], Math.round(pr.x) - 15 - cx, Math.round(pr.y) - 40 - cy);
    else if (pr.t === 'hammer') { const hy = pr.drop > 0 ? 0 : pr.tell > 0 ? -40 - Math.round(Math.sin(time * 30) * 2) : -28; g.fillStyle = '#4a4f5a'; g.fillRect(Math.round(pr.x) - 2 - cx, 0, 4, Math.round(pr.y + hy) - 24 - cy); g.drawImage(PROP.hammer, Math.round(pr.x) - 14 - cx, Math.round(pr.y + hy) - 24 - cy); }
    else if (pr.t === 'nest') g.drawImage(PROP.nest, Math.round(pr.x) - 12 - cx, Math.round(pr.y) - 17 + (pr.puff > 0 ? 1 : 0) - cy);
    else if (pr.t === 'lever') g.drawImage(PROP.lever[pr.on ? 1 : 0], Math.round(pr.x) - 5 - cx, Math.round(pr.y) - 14 - cy);
    else if (pr.t === 'plate') g.drawImage(PROP.plate[pr.down ? 1 : 0], Math.round(pr.x) - 8 - cx, Math.round(pr.y) - 4 - cy);
    else if (pr.t === 'rack') { const x = Math.round(pr.x - cx), y = Math.round(pr.y - cy); g.fillStyle = '#5c3a1d'; g.fillRect(x - 7, y - 16, 2, 16); g.fillRect(x + 5, y - 16, 2, 16); g.fillRect(x - 7, y - 14, 14, 2); g.fillRect(x - 7, y - 6, 14, 2); if (!pr.broken) { if (pr.kind === 'club') { g.fillStyle = '#8b6a2a'; g.fillRect(x - 2, y - 13, 3, 11); g.fillStyle = '#7c8797'; g.fillRect(x - 3, y - 13, 5, 4); g.fillStyle = '#c9d1dc'; g.fillRect(x - 3, y - 13, 1, 1); g.fillRect(x + 1, y - 11, 1, 1); } else { g.strokeStyle = '#8b6a2a'; g.lineWidth = 1; g.beginPath(); g.arc(x, y - 8, 5, -1.2, 1.2); g.stroke(); g.fillStyle = '#e8dcc0'; g.fillRect(x + 1, y - 13, 1, 10); g.fillStyle = '#c9463d'; g.fillRect(x - 2, y - 14, 2, 2); } } else { g.fillStyle = '#3a2416'; g.fillRect(x - 5, y - 4, 10, 3); } }
    else if (pr.t === 'wisp') { if (!pr.cut) { const x = Math.round(pr.x - cx), y = Math.round(pr.y - cy); g.globalAlpha = 0.25 + 0.1 * Math.sin(time * 5 + pr.ph); g.fillStyle = '#bfe6f5'; g.beginPath(); g.arc(x, y - 4, 9, 0, 7); g.fill(); g.globalAlpha = 1; g.fillStyle = '#e8fff8'; g.fillRect(x - 2, y - 6, 4, 4); g.fillStyle = '#bfe6f5'; g.fillRect(x - 1, y - 8, 2, 2); g.fillRect(x - 3, y - 4, 1, 2); g.fillRect(x + 2, y - 4, 1, 2); } }
    else if (pr.t === 'dog') { drawSet(SPR.dog, null, pr.sit > 0 ? 2 : Math.abs(pr.vx) > 10 ? Math.floor(pr.anim * 10) % 2 : 0, Math.round(pr.x) - cx, Math.round(pr.y) - cy, pr.face, false); if (pr.barkT > 0.6) text('!', Math.round(pr.x - cx), Math.round(pr.y - cy) - 12, '#ffd36b', 'center', 6); }
    else if (pr.t === 'flagpost') { const x = Math.round(pr.x - cx), y = Math.round(pr.y - cy); let wd = 0, on = false; for (const z of (L.gusts || [])) if (pr.x > z.x0 && pr.x < z.x1 && (!z.arena || bossActive)) { const ph = (time + (z.phase || 0)) % z.period; on = ph < z.on; wd = z.alt ? (Math.floor((time + (z.phase || 0)) / z.period) % 2 ? -z.dir : z.dir) : z.dir; break; } g.fillStyle = '#5c3a1d'; g.fillRect(x - 1, y - 30, 2, 30); const len = on ? 12 : 5, wave = Math.sin(time * (on ? 14 : 3) + pr.ph) * (on ? 2 : 1); g.fillStyle = '#c9463d'; if (!wd) wd = 1; for (let k = 0; k < len; k++) g.fillRect(x + wd * k, y - 29 + Math.round(Math.sin(time * 12 + k * 0.8 + pr.ph) * (on ? 1.5 : 0.5)) + (on ? 0 : k * 0.6), 1, 6 - Math.floor(k / 3)); }
    else if (pr.t === 'tether') { const x = Math.round(pr.x - cx), y = Math.round(pr.y - cy); g.fillStyle = '#5c3a1d'; g.fillRect(x - 2, y - 10, 4, 10); g.fillStyle = '#8b6a2a'; g.fillRect(x - 3, y - 12, 6, 3); if (!pr.cut) { g.fillStyle = '#c9d1dc'; g.fillRect(x - 1, y - 14, 2, 2); if (!P.dead && Math.abs(P.x - pr.x) < 40 && Math.abs(P.y - pr.y) < 30) { const k = 0.5 + 0.5 * Math.sin(time * 8); text('CUT', x, y - 24 + Math.round(k * 2), '#bfe6f5', 'center', 6); } } else { g.fillStyle = '#3a2416'; g.fillRect(x - 3, y - 4, 6, 2); } }
    else if (pr.t === 'works') { const x = Math.round(pr.x - cx), y = Math.round(pr.y - cy), k = pr.kind, f = Math.floor(time * 10 + pr.ph) % 3;
      if (k === 'kiln') { g.fillStyle = '#4a3a34'; g.fillRect(x - 12, y - 26, 24, 26); g.fillStyle = '#6a4a3a'; for (let yy = y - 24; yy < y; yy += 4) for (let xx = x - 11 + ((yy / 4) % 2 ? 3 : 0); xx < x + 11; xx += 6) g.fillRect(xx, yy, 5, 3); g.fillStyle = '#2a1a14'; g.fillRect(x - 7, y - 12, 14, 12); g.fillStyle = f === 1 ? '#ffb040' : '#ff8030'; g.fillRect(x - 6, y - 11, 12, 10); g.fillStyle = '#fff0a0'; g.fillRect(x - 3, y - 8, 6, 5); g.fillStyle = '#3a3a44'; g.fillRect(x - 3, y - 34, 6, 8); g.globalAlpha = 0.22 + 0.06 * Math.sin(time * 7 + pr.ph); g.fillStyle = '#ffb060'; g.beginPath(); g.arc(x, y - 6, 26, 0, 7); g.fill(); g.globalAlpha = 1; if (Math.random() < 0.15) parts.push({ x: pr.x + (Math.random() - 0.5) * 4, y: pr.y - 34, vx: (Math.random() - 0.5) * 8, vy: -30, life: 0.6, max: 0.6, col: Math.random() < 0.5 ? '#ff9a5c' : '#5a5a66', size: 1, grav: 0 }); }
      else if (k === 'rack') { g.fillStyle = '#5c3a1d'; g.fillRect(x - 12, y - 22, 24, 2); g.fillRect(x - 12, y - 12, 24, 2); g.fillRect(x - 12, y - 22, 2, 22); g.fillRect(x + 10, y - 22, 2, 22); const cols = ['#bfe6f5', '#c8a8ff', '#a8ffb8', '#ffd36b', '#ff9ab0']; for (let i = 0; i < 4; i++) { g.fillStyle = cols[(i + pr.v) % 5]; g.fillRect(x - 9 + i * 5, y - 20, 3, 7); g.fillRect(x - 8 + i * 5, y - 21, 1, 1); g.fillStyle = cols[(i + pr.v + 2) % 5]; g.fillRect(x - 9 + i * 5, y - 10, 3, 9); } g.fillStyle = 'rgba(255,255,255,0.35)'; for (let i = 0; i < 4; i++) { g.fillRect(x - 9 + i * 5, y - 20, 1, 3); g.fillRect(x - 9 + i * 5, y - 10, 1, 4); } }
      else if (k === 'sand') { g.fillStyle = '#d8c8a0'; g.beginPath(); g.moveTo(x - 12, y); g.lineTo(x - 3, y - 9); g.lineTo(x + 4, y - 11); g.lineTo(x + 12, y); g.closePath(); g.fill(); g.fillStyle = '#eee0b8'; g.fillRect(x - 2, y - 9, 5, 2); g.fillStyle = '#b8a880'; g.fillRect(x - 8, y - 3, 3, 1); g.fillRect(x + 5, y - 5, 3, 1); }
      else if (k === 'blowpipe') { g.fillStyle = '#5c3a1d'; g.fillRect(x - 10, y - 6, 20, 2); g.fillRect(x - 9, y - 4, 2, 4); g.fillRect(x + 7, y - 4, 2, 4); for (let i = 0; i < 4; i++) { g.fillStyle = '#8a919c'; g.fillRect(x - 8 + i * 5, y - 30, 2, 24); g.fillStyle = i % 2 ? '#ff9a5c' : '#bfe6f5'; g.fillRect(x - 9 + i * 5, y - 32, 4, 3); } }
      else if (k === 'window') { const cols = ['#c9463d', '#ffd36b', '#4a9a6e', '#5aa0e0', '#c8a8ff']; g.fillStyle = '#2a2230'; g.fillRect(x - 11, y - 36, 22, 26); for (let i = 0; i < 6; i++) { g.fillStyle = cols[(i + pr.v) % 5]; g.globalAlpha = 0.85; g.fillRect(x - 10 + (i % 2) * 11, y - 35 + Math.floor(i / 2) * 9, 9, 7); } g.globalAlpha = 1; g.fillStyle = '#5a6270'; g.fillRect(x - 1, y - 36, 2, 26); g.fillRect(x - 11, y - 27, 22, 2); g.fillRect(x - 11, y - 18, 22, 2); g.globalAlpha = 0.12 + 0.04 * Math.sin(time * 2 + pr.ph); for (let i = 0; i < 3; i++) { g.fillStyle = cols[(i + pr.v) % 5]; g.fillRect(x - 12 + i * 8, y - 9, 8, 9); } g.globalAlpha = 1; }
      else if (k === 'crucible') { g.fillStyle = '#3a3a44'; g.fillRect(x - 7, y - 12, 14, 12); g.fillRect(x - 9, y - 14, 18, 3); g.fillStyle = f === 2 ? '#ffb040' : '#ff8030'; g.fillRect(x - 6, y - 13, 12, 3); g.fillStyle = '#fff0a0'; g.fillRect(x - 3, y - 13, 5, 2); g.fillStyle = '#5a6270'; g.fillRect(x - 9, y - 3, 3, 3); g.fillRect(x + 6, y - 3, 3, 3); if (Math.random() < 0.08) parts.push({ x: pr.x + (Math.random() - 0.5) * 8, y: pr.y - 14, vx: 0, vy: -20, life: 0.5, max: 0.5, col: '#ffd36b', size: 1, grav: 0 }); }
      else if (k === 'lensring') { g.fillStyle = '#5c3a1d'; g.fillRect(x - 1, y - 10, 2, 10); g.fillRect(x - 6, y - 1, 12, 1); g.strokeStyle = '#c9a83a'; g.lineWidth = 2; g.beginPath(); g.arc(x, y - 20, 10, 0, 7); g.stroke(); g.globalAlpha = 0.5; g.fillStyle = '#bfe6f5'; g.beginPath(); g.arc(x, y - 20, 8, 0, 7); g.fill(); g.globalAlpha = 1; g.fillStyle = '#eefaff'; g.fillRect(x - 4, y - 24, 3, 2); } }
    else if (pr.t === 'shard') { const x = Math.round(pr.x - cx), y = Math.round(pr.y - cy), dirY = pr.up ? 1 : -1, cols = pr.v % 3 === 0 ? ['#bfe6f5', '#eefaff', '#7aa8c8'] : pr.v % 3 === 1 ? ['#c8b0f0', '#ecdcff', '#8a6ab8'] : ['#a8e0d8', '#e8fff8', '#5a9a90']; const sz = pr.big ? 1.6 : 1; const spike = (ox, hgt, wd, c) => { g.fillStyle = c; for (let k = 0; k < hgt; k++) { const ww = Math.max(1, Math.round(wd * (1 - k / hgt))); g.fillRect(x + ox - (ww >> 1), y + dirY * k * -1 + (pr.up ? k : -k) - (pr.up ? 0 : 1), ww, 1); } }; spike(-5 * sz, Math.round(9 * sz), Math.round(4 * sz), cols[0]); spike(2 * sz, Math.round(14 * sz), Math.round(5 * sz), cols[0]); spike(7 * sz, Math.round(7 * sz), Math.round(3 * sz), cols[2]); g.fillStyle = cols[1]; g.fillRect(x + Math.round(2 * sz) - 1, y + (pr.up ? 2 : -Math.round(12 * sz)), 1, Math.round(6 * sz)); g.fillRect(x - Math.round(5 * sz), y + (pr.up ? 1 : -Math.round(7 * sz)), 1, Math.round(4 * sz)); if (pr.big) { g.globalAlpha = 0.16 + 0.06 * Math.sin(time * 3 + pr.ph); g.fillStyle = cols[0]; g.beginPath(); g.arc(x, y + (pr.up ? 8 : -8), 16, 0, 7); g.fill(); g.globalAlpha = 1; } if (Math.random() < 0.02) parts.push({ x: pr.x + (Math.random() - 0.5) * 12, y: pr.y + (pr.up ? 6 : -6), vx: 0, vy: pr.up ? 8 : -8, life: 0.8, max: 0.8, col: cols[1], size: 1, grav: 0 }); }
    else if (pr.t === 'crystal') { const x = Math.round(pr.x - cx), y = Math.round(pr.y - cy), bc = BEAM_COL[pr.col] || BEAM_COL.blue; if (pr.hang) { g.fillStyle = '#5a6270'; g.fillRect(x - 6, y - 18, 12, 4); g.fillStyle = bc[0]; g.fillRect(x - 4, y - 14, 3, 8); g.fillRect(x + 1, y - 14, 3, 12); g.fillRect(x - 1, y - 14, 2, 5); g.fillStyle = bc[1]; g.fillRect(x + 2, y - 13, 1, 6); } else { g.fillStyle = '#7aa8c8'; g.fillRect(x - 6, y - 4, 12, 4); g.fillStyle = bc[0]; g.fillRect(x - 4, y - 14, 3, 10); g.fillRect(x + 1, y - 17, 3, 13); g.fillRect(x - 1, y - 11, 2, 7); g.fillStyle = bc[1]; g.fillRect(x - 3, y - 13, 1, 4); g.fillRect(x + 2, y - 16, 1, 5); } g.globalAlpha = 0.2 + 0.08 * Math.sin(time * 5); g.fillStyle = bc[0]; g.beginPath(); g.arc(x, y - 9, 12, 0, 7); g.fill(); g.globalAlpha = 1; }
    else if (pr.t === 'mirror') { const x = Math.round(pr.x - cx), y = Math.round(pr.y - cy); const near = !pr.fixed && !P.dead && Math.abs(P.x - pr.x) < 44 && Math.abs(P.y - pr.y) < 40; g.fillStyle = '#5c3a1d'; g.fillRect(x - 1, y - 8, 2, 8); g.fillRect(x - 5, y - 1, 10, 1); g.fillStyle = '#8b6a2a'; g.fillRect(x - 8, y - 18, 16, 12); g.fillStyle = '#3a3a44'; g.fillRect(x - 7, y - 17, 14, 10); g.strokeStyle = pr.glow > 0 ? '#eefaff' : '#c9d1dc'; g.lineWidth = 2; g.beginPath(); if (pr.o === 0) { g.moveTo(x - 6, y - 8); g.lineTo(x + 6, y - 16); } else { g.moveTo(x - 6, y - 16); g.lineTo(x + 6, y - 8); } g.stroke(); if (near) { const k = 0.5 + 0.5 * Math.sin(time * 8); g.globalAlpha = 0.5 + 0.4 * k; g.strokeStyle = '#bfe6f5'; g.lineWidth = 1; g.strokeRect(x - 10.5, y - 21.5, 21, 17); g.globalAlpha = 1; text('STRIKE', x, y - 30 + Math.round(k * 2), '#bfe6f5', 'center', 6); } if (pr.turnT > 0) { g.globalAlpha = pr.turnT * 3; g.strokeStyle = '#bfe6f5'; g.beginPath(); g.arc(x, y - 10, 10, 0, 7); g.stroke(); g.globalAlpha = 1; } }
    else if (pr.t === 'receiver') { const x = Math.round(pr.x - cx), y = Math.round(pr.y - cy); g.fillStyle = '#5a6270'; g.fillRect(x - 5, y - 12, 10, 12); if (!pr.opened) { g.globalAlpha = 0.4 + 0.3 * Math.sin(time * 5); g.strokeStyle = '#bfe6f5'; g.lineWidth = 1; g.beginPath(); g.arc(x, y - 7, 8, 0, 7); g.stroke(); g.globalAlpha = 1; } g.fillStyle = pr.opened ? '#8fd160' : pr.lit ? '#eefaff' : '#3a4a60'; g.beginPath(); g.arc(x, y - 7, 3, 0, 7); g.fill(); if (pr.lit && !pr.opened) { g.fillStyle = '#bfe6f5'; g.fillRect(x - 5, y - 14, Math.round(10 * Math.min(1, pr.litT / 1.2)), 1); } }
    else if (pr.t === 'anvil') { const x = Math.round(pr.x - cx), y = Math.round(pr.y - cy); g.fillStyle = '#3a3a44'; g.fillRect(x - 6, y - 6, 12, 6); g.fillStyle = '#5a6270'; g.fillRect(x - 10, y - 12, 20, 6); g.fillRect(x - 12, y - 11, 3, 3); g.fillStyle = '#8a919c'; g.fillRect(x - 10, y - 12, 20, 1); if (pr.ring > 0) { g.globalAlpha = pr.ring; g.strokeStyle = '#ffd36b'; g.lineWidth = 1; g.beginPath(); g.arc(x, y - 9, 14 + (0.6 - pr.ring) * 30, 0, 7); g.stroke(); g.globalAlpha = 1; } }
    else if (pr.t === 'hotplate') { const x = Math.round(pr.x - cx), y = Math.round(pr.y - cy); g.fillStyle = pr.hot > 0 ? (Math.floor(time * 16) % 2 ? '#ff6b2c' : '#ffd36b') : pr.glow > 0 ? (Math.floor(time * 8) % 2 ? '#c9463d' : '#7a2a1a') : '#4a4a58'; g.fillRect(x - 16, y - 2, 32, 2); g.fillStyle = '#2a2a34'; for (let k = -14; k < 16; k += 6) g.fillRect(x + k, y - 2, 1, 2); }
    else if (pr.t === 'crusher') { const x = Math.round(pr.x - cx), bot = Math.round(pr.y - pr.D + pr.h - cy); g.fillStyle = '#3a3a44'; for (const dx of [-10, 10]) for (let yy = Math.round(pr.y - pr.D - 16 - cy); yy < bot - 14; yy += 4) g.fillRect(x + dx - 1, yy, 2, 2); g.fillStyle = '#5a6270'; g.fillRect(x - 16, bot - 14, 32, 14); g.fillStyle = '#8a919c'; g.fillRect(x - 16, bot - 14, 32, 2); g.fillRect(x - 14, bot - 10, 3, 6); g.fillRect(x + 11, bot - 10, 3, 6); g.fillStyle = '#2a2230'; g.fillRect(x - 16, bot - 2, 32, 2); g.fillRect(x - 6, bot - 9, 12, 3); if (pr.st === 'tell' || pr.st === 'drop') { g.fillStyle = Math.floor(time * 16) % 2 ? '#ff6b6b' : '#c9463d'; g.fillRect(x - 6, bot - 9, 12, 3); } }
    else if (pr.t === 'beam') { const x = Math.round(pr.x - cx), y = Math.round(pr.y - cy); g.fillStyle = '#3a2416'; g.fillRect(x - 22, y - 25, 44, 6); g.fillStyle = '#5c3a1d'; g.fillRect(x - 22, y - 25, 44, 2); g.fillStyle = '#2a1a10'; g.fillRect(x - 24, y - 26, 4, 8); g.fillRect(x + 20, y - 26, 4, 8); g.fillStyle = '#c9463d'; g.fillRect(x - 3, y - 23, 6, 2); for (const dx of [-16, 16]) { g.fillStyle = '#3a2416'; g.fillRect(x + dx - 1, y - 60, 2, 35); } }
    else if (pr.t === 'torchbracket') { const x = Math.round(pr.x - cx), y = Math.round(pr.y - cy); g.fillStyle = '#4a4a58'; g.fillRect(x - 3, y - 14, 6, 3); g.fillRect(x - 1, y - 11, 2, 4); if (!pr.taken) { g.fillStyle = '#5c3a1d'; g.fillRect(x - 1, y - 22, 2, 9); const f = Math.floor(time * 12 + pr.x) % 3; g.fillStyle = '#ff9a5c'; g.fillRect(x - 2, y - 27 - (f === 1 ? 1 : 0), 4, 5); g.fillStyle = '#ffd36b'; g.fillRect(x - 1, y - 26, 2, 3); } }
    else if (pr.t === 'firevent') { const x = Math.round(pr.x - cx), y = Math.round(pr.y - cy); g.fillStyle = '#4a3020'; g.fillRect(x - 5, y - 10, 10, 10); g.fillStyle = '#6a4a30'; g.fillRect(x - 4, y - 9, 3, 2); g.fillRect(x + 1, y - 6, 3, 2); g.fillRect(x - 4, y - 3, 3, 2); g.fillStyle = '#2c1a10'; g.fillRect(x - 6, y - 12, 12, 2); g.fillStyle = pr.on > 0 ? '#ffd36b' : '#1a1010'; g.fillRect(x - 3, y - 11, 6, 1); if (pr.on > 0) { g.fillStyle = Math.floor(time * 20) % 2 ? '#ff9a5c' : '#ffd36b'; g.fillRect(x - 3, y - 26, 6, 15); g.fillStyle = '#fff6c8'; g.fillRect(x - 1, y - 24, 2, 11); } }
    else if (pr.t === 'ram') { g.save(); g.translate(Math.round(pr.x - cx), Math.round(pr.y - cy)); g.rotate(-pr.th); g.strokeStyle = '#c9b27c'; g.lineWidth = 1; g.beginPath(); g.moveTo(0.5, 0); g.lineTo(0.5, 34); g.stroke(); g.drawImage(PROP.ramLog, -6, 32); g.restore(); }
    else if (pr.t === 'dropcage') { const cy2 = Math.round(pr.y - cy); if (!pr.dropped) { g.fillStyle = '#8b8378'; for (let yy = Math.round(pr.y0 - 40 - cy); yy < cy2 - 16; yy += 3) g.fillRect(Math.round(pr.x - cx), yy, 2, 2); } g.drawImage(PROP.cage, Math.round(pr.x) - 8 - cx, cy2 - 16); }
    else if (pr.t === 'relic' && !pr.got) { const R = RELICS[pr.kind], yy = Math.round(pr.y - 8 + Math.sin(time * 3 + pr.ph) * 2 - cy), xx = Math.round(pr.x - cx); g.globalAlpha = 0.35 + 0.15 * Math.sin(time * 4); g.fillStyle = R.col; g.beginPath(); g.arc(xx, yy, 10, 0, 7); g.fill(); g.globalAlpha = 1; g.drawImage(PROP.relic[pr.kind] || PROP.lampIcon || PROP.bolt, xx - 5, yy - 6); }
    else if (pr.t === 'puffball' && !pr.popped) g.drawImage(PROP.puffball, Math.round(pr.x) - 7 - cx, Math.round(pr.y) - 12 + Math.round(Math.sin(time * 2 + pr.x) * 0.5) - cy);
    else if (pr.t === 'glow') { g.drawImage(PROP.glow[pr.dark > 0 ? 1 : 0], Math.round(pr.x) - 6 - cx, Math.round(pr.y) - 14 - cy); if (L.storm && pr.dark <= 0 && pr.x > L.storm.x0 - 40 && pr.x < L.storm.x1 + 40) { g.globalAlpha = 0.12 + 0.05 * Math.sin(time * 3 + pr.x); g.fillStyle = '#4aa0b0'; g.beginPath(); g.arc(Math.round(pr.x - cx), Math.round(pr.y - 8 - cy), 30, 0, 7); g.fill(); g.globalAlpha = 1; } }
    else if (pr.t === 'vent' && pr.heat) { const x = Math.round(pr.x - cx), y = Math.round(pr.y - cy), ph = (time + pr.phase) % pr.period, warmK = pr.active ? 1 : pr.warm ? (ph - (pr.period - 0.6)) / 0.6 : 0.15;
      g.fillStyle = '#2a2230'; g.fillRect(x - 10, y - 2, 20, 2); g.fillStyle = '#4a4050'; g.fillRect(x - 12, y - 3, 4, 2); g.fillRect(x + 8, y - 3, 4, 2);
      g.fillStyle = warmK > 0.6 ? '#fff6c8' : warmK > 0.3 ? '#ffb040' : '#8a3a1c'; g.fillRect(x - 7, y - 2, 3, 1); g.fillRect(x - 2, y - 2, 4, 1); g.fillRect(x + 4, y - 2, 3, 1);
      if (warmK > 0.2) { g.globalAlpha = 0.25 * warmK; g.fillStyle = '#ff9a5c'; g.beginPath(); g.ellipse(x, y - 2, 14, 4, 0, 0, 7); g.fill(); g.globalAlpha = 1; }
      if (pr.active) { for (let k = 0; k < 4; k++) { const wob = Math.sin(time * 9 + k * 1.7) * 3; g.globalAlpha = 0.09 + 0.05 * Math.sin(time * 13 + k); g.fillStyle = k % 2 ? '#fff6c8' : '#ffb040'; g.fillRect(x - 9 + k * 5 + wob, y - pr.h, 3, pr.h - 2); } g.globalAlpha = 1; } }
    else if (pr.t === 'vent' && pr.wind) { const x = Math.round(pr.x - cx), y = Math.round(pr.y - cy), hw = pr.w || 13, top = y - pr.h, ph = (time + (pr.phase || 0)) % pr.period, on = pr.active, warm = !on && ph > pr.period - 1;
      g.globalAlpha = on ? 0.17 : warm ? (Math.floor(time * 10) % 2 ? 0.16 : 0.05) : 0.05; g.fillStyle = '#eefaff'; g.fillRect(x - hw, top, hw * 2, pr.h);
      g.globalAlpha = on ? 0.75 : 0.3; for (let xx = x - hw; xx < x + hw; xx += 4) g.fillRect(xx, top - 1, 2, 1); // the top of the lift, dashed
      if (on) { g.globalAlpha = 0.6; g.strokeStyle = '#ffffff'; g.lineWidth = 1; for (let k = 0; k < 7; k++) { const yy = y - 6 - ((time * 170 + k * pr.h / 7) % pr.h), xx = x - hw + 3 + ((k * 7) % Math.max(1, hw * 2 - 6)); g.beginPath(); g.moveTo(xx + 0.5, yy); g.lineTo(xx + 0.5, yy - 16); g.stroke(); } }
      g.globalAlpha = 1; g.fillStyle = '#5a5a66'; g.fillRect(x - 9, y - 3, 18, 3); g.fillStyle = '#8a8a98'; g.fillRect(x - 7, y - 5, 14, 2); g.fillStyle = '#3a3a44'; g.fillRect(x - 5, y - 4, 10, 1); }
    else if (pr.t === 'vent') { const x = Math.round(pr.x - cx), y = Math.round(pr.y - cy); g.fillStyle = '#241f2c'; g.beginPath(); g.ellipse(x, y - 1, 9, 3, 0, 0, 7); g.fill(); g.fillStyle = '#5a5468'; g.fillRect(x - 10, y - 3, 3, 2); g.fillRect(x + 7, y - 3, 3, 2); g.fillStyle = pr.active ? '#c8bcb0' : '#3a3444'; g.beginPath(); g.ellipse(x, y - 1, 5, 1.5, 0, 0, 7); g.fill(); if (pr.active) { g.globalAlpha = 0.16 + 0.08 * Math.sin(time * 14); g.fillStyle = '#e8e0f0'; g.fillRect(x - 11, y - pr.h, 22, pr.h); g.globalAlpha = 1; } }
    else if (pr.t === 'roller' && pr.alive) { g.save(); g.translate(Math.round(pr.x - cx), Math.round(pr.y - 7 - cy)); g.rotate(pr.rot); g.drawImage(PROP.puffball, -7, -6); g.restore(); g.drawImage(PROP.shadow, Math.round(pr.x) - 6 - cx, Math.round(pr.y) - 2 - cy); }
  }
  if (mother) drawMother(cx, cy);
  for (const rt of roots) { const x = Math.round(rt.x - cx), y = Math.round(rt.y - cy); if (rt.t >= rt.tell) { const k = Math.min(1, (rt.t - rt.tell) / 0.12) * Math.min(1, (rt.tell + rt.up - rt.t) / 0.15 + 0.2); const h = Math.round(22 * k); g.fillStyle = '#5a4a3a'; g.beginPath(); g.moveTo(x - 6, y); g.lineTo(x, y - h); g.lineTo(x + 6, y); g.closePath(); g.fill(); g.fillStyle = '#8a7a6a'; g.beginPath(); g.moveTo(x - 2, y); g.lineTo(x, y - h + 3); g.lineTo(x + 2, y); g.closePath(); g.fill(); } else { g.fillStyle = 'rgba(255,220,120,0.5)'; g.fillRect(x - 7, y - 1, 14, 2); } }
  for (const z of (L.sleeps || [])) { if (z.x1 < cx || z.x0 > cx + VW) continue; g.fillStyle = 'rgba(150,90,220,0.16)'; g.fillRect(z.x0 - cx, z.y0 - cy, z.x1 - z.x0, z.y1 - z.y0); for (let i = 0; i < 12; i++) { const mx = z.x0 + ((i * 53 + time * 9) % (z.x1 - z.x0)), my = z.y0 + ((i * 37 + Math.sin(time + i) * 6 + 100) % (z.y1 - z.y0)); g.drawImage(PROP.moteV, Math.round(mx - cx), Math.round(my - cy)); } }
  for (const c of clouds2) { g.globalAlpha = Math.min(0.55, c.life * 0.3); g.fillStyle = c.sleep ? '#9a5aa8' : '#c8bcb0'; g.beginPath(); g.ellipse(Math.round(c.x - cx), Math.round(c.y - cy), c.r, c.r * 0.7, 0, 0, 7); g.fill(); g.globalAlpha = 1; }
  for (const lt of lights) if (lt.torch && lt.x > cx - 20 && lt.x < cx + VW + 20) g.drawImage(PROP.torch, Math.round(lt.x) - 3 - cx, Math.round(lt.y) - 4 - cy);
  if (L.arena && L.arena.boss === 'queen') { for (let ty = 0; ty < LH; ty++) for (let tx = Math.floor(L.arena.x0 / TS); tx < Math.floor(L.arena.x1 / TS); tx++) if (L.grid[ty * LW + tx] === T.ONEWAY && L.grid[ty * LW + tx - 1] !== T.ONEWAY) { let n = 1; while (L.grid[ty * LW + tx + n] === T.ONEWAY) n++; const gx = tx * TS - cx, gy = ty * TS + 6 - cy; const gr = g.createRadialGradient(gx + n * 8, gy, 4, gx + n * 8, gy, n * 10 + 8); gr.addColorStop(0, 'rgba(255,220,120,0.35)'); gr.addColorStop(1, 'rgba(255,200,80,0)'); g.fillStyle = gr; g.fillRect(gx - 12, gy - 14, n * TS + 24, 28); } }
  if (bossActive && L.arena && L.arena.tint && SET.tint !== 'off') { g.globalAlpha = (L.arena.tintA || 0.14) * (SET.tint === 'half' ? 0.5 : 1); g.fillStyle = L.arena.tint; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; }
  drawEscape(cx, cy);
  for (const f of fires) { if (f.delay > 0 || f.vent || f.x < cx - 20 || f.x > cx + VW + 20) continue; g.drawImage(PROP.fire[Math.floor(time * 12 + f.x) % 3], Math.round(f.x) - 8 - cx, Math.round(f.y) - 16 - cy); }
  for (const e of enemies) if (e.alive && e.t === 'spider') { g.strokeStyle = 'rgba(230,230,240,0.7)'; g.lineWidth = 1; g.beginPath(); g.moveTo(Math.round(e.x - cx) + 0.5, Math.round(e.restY - 26 - cy)); g.lineTo(Math.round(e.x - cx) + 0.5, Math.round(e.y - 8 - cy)); g.stroke(); }
  for (const b of pyres) { const x = Math.round(b.x - cx), y = Math.round(b.y - cy), pulse = Math.sin(time * 30) * 1.2;
    g.globalAlpha = 0.35; g.fillStyle = '#ff6b2c'; g.beginPath(); g.arc(x - b.dir * 6, y, 9 + pulse, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
    g.fillStyle = '#ff9a5c'; g.beginPath(); g.arc(x, y, 7 + pulse * 0.5, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#ffd36b'; g.beginPath(); g.arc(x + b.dir, y, 5, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fff6c8'; g.beginPath(); g.arc(x + b.dir * 2, y - 1, 2.5, 0, Math.PI * 2); g.fill(); }
  for (const b of embers) { g.fillStyle = '#ff6b2c'; g.beginPath(); g.arc(Math.round(b.x - cx), Math.round(b.y - cy), 4, 0, 7); g.fill(); g.fillStyle = '#ffd36b'; g.beginPath(); g.arc(Math.round(b.x - cx) - 1, Math.round(b.y - cy) - 1, 2, 0, 7); g.fill(); }
  for (const b of bombs) if (b.barrel) { g.save(); g.translate(Math.round(b.x - cx), Math.round(b.y - 7 - cy)); g.rotate(time * 7); g.drawImage(PROP.barrel, -6, -7); g.restore(); } else drawSet(SPR.bomb, null, 0, b.x - cx, b.y - 2 - cy, 1, Math.floor(time * 10) % 2 === 0 && b.fuse < 0.5);
  for (const f of foxes) drawSet(SPR.fox, null, Math.floor(f.t * 10) % 2, f.x - cx, f.y - cy, f.face, false);
  for (const d of deco) if (d.bg && d.x > cx - 140 && d.x < cx + VW + 4) { if (d.kind === 'hiveBg') { g.globalAlpha = 0.5; g.drawImage(d.c, d.x - cx, d.y - cy); g.globalAlpha = 1; } else g.drawImage(d.c, d.x - cx, d.y - cy); } // (the great combs sit back: they are scenery, not somewhere to stand)
  for (const d of decor) if (d.bg && d.x > cx - 44 && d.x < cx + VW + 4) g.drawImage(d.c, d.x - cx, d.y - cy);
  for (const d of decor) if (!d.bg && d.x > cx - 30 && d.x < cx + VW + 4) {
    if (d.fire) { g.drawImage(PROP.campfire[Math.floor(time * 9 + d.x) % 3], d.x - cx, d.y - cy); continue; }
    if (d.k === 'tiny') { g.globalAlpha = 0.75 + 0.25 * Math.sin(time * 3 + d.ph); g.drawImage(d.c, d.x - cx, d.y - cy); g.globalAlpha = 1; continue; }
    if (d.k === 'cattail' || d.k === 'moss') { g.drawImage(d.c, d.x - cx + Math.round(Math.sin(time * 1.6 + d.x * 0.05) * (d.k === 'moss' ? 1 : 1.5) + (d.sway > 0 ? Math.sin(time * 28) * d.sway * 3 : 0)), d.y - cy); continue; }
    if (d.sway > 0) g.drawImage(d.c, d.x - cx + Math.round(Math.sin(time * 28) * d.sway * 3), d.y - cy);
    else if (d.wob > 0) { const k = 1 + Math.sin(time * 30) * d.wob * 0.4; g.drawImage(d.c, Math.round(d.x - cx + d.c.width * (1 - k) / 2), Math.round(d.y - cy + d.c.height * (1 - k)), Math.round(d.c.width * k), Math.round(d.c.height * k)); }
    else g.drawImage(d.c, d.x - cx, d.y - cy);
  }
  for (const d of deco) if (!d.bg && d.x > cx - 60 && d.x < cx + VW + 4) { const c = d.anim ? d.anim[Math.floor(time * (d.kind === 'drip' ? 2 : 3) + d.ph) % d.anim.length] : d.c; g.drawImage(c, d.x - cx, d.y - cy); }
  for (const s of signs) g.drawImage(PROP.sign, s.x - 9 - cx, s.y - 18 - cy);
  for (const pr of props) if (pr.t === 'npc' && pr.x > cx - 40 && pr.x < cx + VW + 40) { { const set = SPR[pr.kind] || SPR.shepherd, near = Math.abs(P.x - pr.x) < 90, ph = time + (pr.anim || 0) * 3, c0 = Array.isArray(set.R) ? set.R[0] : set.R, breathe = Math.sin(ph * 2.1) > 0.55 ? 1 + 1 / c0.height : 1;
        const face = near ? (P.x < pr.x ? -1 : 1) : (Math.floor(ph / 3.3) % 2 ? 1 : -1);
        drawSet(set, null, talkTo === pr ? Math.floor(time * 3) % 2 : 0, pr.x - cx, pr.y - cy, face, false, 1, breathe); } if (talkTo !== pr && !P.dead && state === 'play' && Math.abs(P.x - pr.x) < 24 && Math.abs(P.y - pr.y) < 24) text(talkGlyph(), pr.x - cx, pr.y - 28 - cy + Math.round(Math.sin(time * 5)), '#ffe6a0', 'center', 6); }
  if (state === 'play' && !P.dead) { const t = talkers()[0]; if (t && !(t.who && t.who.t === 'npc')) text(talkGlyph(), t.x - cx, t.y - 26 - cy + Math.round(Math.sin(time * 5)), '#ffe6a0', 'center', 6); }
  for (const s of shrines) { g.drawImage(PROP.shrine[s.lit ? 1 : 0], s.x - 10 - cx, s.y - 34 - cy); if (s.lit) { g.globalAlpha = 0.25 + Math.sin(time * 5) * 0.08; g.fillStyle = '#ffd36b'; g.beginPath(); g.arc(s.x - cx, s.y - 24 - cy, 14, 0, 7); g.fill(); g.globalAlpha = 1; } }
  if (gate) g.drawImage(PROP.gate, gate.x - 24 - cx, gate.y - 52 - cy);
  for (const a of acorns) if (!a.got && a.x > cx - 10 && a.x < cx + VW + 10 && ((time * 0.7 + a.ph) % 3) < 0.18) { const gx = Math.round(a.x - cx) + 2, gy = Math.round(a.y - 4 + Math.sin(time * 4 + a.ph) * 1.5 - cy) - 4; g.fillStyle = '#fff6c8'; g.fillRect(gx - 3, gy, 7, 1); g.fillRect(gx, gy - 3, 1, 7); } // a glint now and then
  for (const a of acorns) if (!a.got && a.x > cx - 10 && a.x < cx + VW + 10) g.drawImage(PROP.coin[Math.floor(time * 8 + a.ph) % 4], a.x - 4 - cx, Math.round(a.y - 5 + Math.sin(time * 4 + a.ph) * 1.5) - cy);
  for (const s of silvers) if (s.x > cx - 12 && s.x < cx + VW + 12) { if (s.got) { g.globalAlpha = 0.22; g.drawImage(PROP.silver[0], s.x - 4 - cx, Math.round(s.y - 5) - cy); g.globalAlpha = 1; } else { g.globalAlpha = 0.28 + 0.16 * Math.sin(time * 5 + s.ph); g.fillStyle = '#dfe8ff'; g.beginPath(); g.arc(Math.round(s.x - cx), Math.round(s.y - 2 - cy), 8, 0, 7); g.fill(); g.globalAlpha = 1; g.drawImage(PROP.silver[Math.floor(time * 6 + s.ph) % 4], s.x - 4 - cx, Math.round(s.y - 5 + Math.sin(time * 4 + s.ph) * 1.5) - cy); } }
  for (const c of corpses) {
    if (c.x < cx - 40 || c.x > cx + VW + 40) continue;
    const al = Math.min(1, c.life / c.max * 2.5);
    if (c.t === 'cap') drawRot(PARTS.cap, 0, c.x - cx, c.y - cy, c.face, c.rot, al);
    else if (c.t === 'stem') { const k = c.life / c.max; drawSet(PARTS.stem, null, 0, c.x - cx, c.y - cy, c.face, false, 1 + (1 - k) * 0.4, Math.max(0.1, k), al); }
    else if (c.t === 'plank') { g.save(); g.globalAlpha = al; g.translate(Math.round(c.x - cx), Math.round(c.y - cy)); g.rotate(c.rot); g.drawImage(TILE.plank[0], -8, -4); g.restore(); }
    else drawRot(c.t === 'hopper' && c.color && c.color !== 'green' ? SPR['hopper_' + c.color] : SPR[c.t], c.frame, c.x - cx, c.y - cy, c.face, c.rot, al);
  }
  for (const e of enemies) {
    if (!e.alive || e.gone > 0 || e.x < cx - 40 || e.x > cx + VW + 40) continue;
    if (e.t === 'mother' || e.t === 'heart') continue;
    if (e.t === 'king') { const fl = L.arena.floor; const litter = (lx, ly) => g.drawImage(PROP.palanquin, Math.round(lx) - 36 - cx, Math.round(ly) - 36 - cy, 72, 45);
      if (e.phase < 2) { litter(e.x, e.y + (e.mode === 'charge' ? Math.round(Math.sin(e.anim * 40)) : 0)); for (const wx of [-22, 22]) { const cxw = Math.round(e.x + wx - cx), cyw = Math.round(e.y + 6 - cy); g.fillStyle = '#3a2416'; g.beginPath(); g.arc(cxw, cyw, 5, 0, 7); g.fill(); g.fillStyle = '#8b6a2a'; g.beginPath(); g.arc(cxw, cyw, 2, 0, 7); g.fill(); g.strokeStyle = '#8b6a2a'; g.lineWidth = 1; g.beginPath(); const a = e.x * 0.12; g.moveTo(cxw + Math.cos(a) * 4, cyw + Math.sin(a) * 4); g.lineTo(cxw - Math.cos(a) * 4, cyw - Math.sin(a) * 4); g.moveTo(cxw + Math.cos(a + 1.57) * 4, cyw + Math.sin(a + 1.57) * 4); g.lineTo(cxw - Math.cos(a + 1.57) * 4, cyw - Math.sin(a + 1.57) * 4); g.stroke(); } const fr = e.mode === 'held' ? 4 : e.mode === 'grabTell' || e.mode === 'grab' ? 3 : e.throwT > 0 ? 1 : (e.mode === 'shout' || e.mode === 'shoutTell' || e.mode === 'charge' || e.mode === 'chargeTell') ? 2 : 0; drawSet(SPR.king, null, fr, e.x - cx + (e.mode === 'grabTell' ? Math.round(Math.sin(e.anim * 50)) : 0), e.y - 6 - cy, e.face, e.flash > 0 || (e.mode === 'grabTell' && Math.floor(e.anim * 12) % 2 === 0), 1, 1); }
      else { if (e.throne) litter(e.throne.x, e.throne.y); if (e.thrown) { g.save(); g.translate(Math.round(e.thrown.x - cx), Math.round(e.thrown.y - 20 - cy)); g.rotate(Math.sin(time * 6) * 0.15); g.drawImage(PROP.palanquin, -36, -22, 72, 45); g.restore(); }
        const fr = e.mode === 'held' ? 6 : e.mode === 'liftTell' || e.mode === 'hurl' ? 5 : e.mode === 'grab' ? 4 : e.mode === 'grabTell' ? 3 : e.mode === 'slam' || e.mode === 'slamTell' ? 2 : Math.abs(e.vx) > 20 && Math.floor(e.anim * 5) % 2 === 1 ? 1 : 0;
        const tell = e.mode === 'slamTell' || e.mode === 'grabTell' || e.mode === 'liftTell';
        if (e.mode === 'liftTell' && e.throne === null && !e.thrown) {} drawSet(SPR.kingUp, null, fr, e.x - cx + (tell ? Math.round(Math.sin(e.anim * 60)) : 0), e.y - cy, e.face, e.flash > 0 || (tell && Math.floor(e.anim * 12) % 2 === 0), 1, 1);
        if (e.mode === 'liftTell') g.drawImage(PROP.palanquin, Math.round(e.x) - 36 - cx, Math.round(e.y) - 100 - cy + Math.round(Math.sin(e.anim * 30) * 2), 72, 45); }
      if (bossActive && e.alive) { const hx = Math.round(e.x - cx), hy = Math.round(e.y - e.h - cy) - 6; if (e.mode === 'held') { } else if (e.open > 0) { for (let q = 0; q < 3; q++) { const a = time * 4 + q * 2.1; g.fillStyle = q % 2 ? '#8fd160' : '#fff6c8'; g.fillRect(hx + Math.round(Math.cos(a) * 14), hy + Math.round(Math.sin(a * 1.3) * 5), 2, 2); } } else { for (let q = 0; q < 4; q++) { const a = time * 5 + q * 1.6; const gx = hx + Math.round(Math.cos(a) * 16), gy = hy + Math.round(Math.sin(a) * 4); g.fillStyle = q % 2 ? '#ffd36b' : '#fff6c8'; g.fillRect(gx - 1, gy, 3, 1); g.fillRect(gx, gy - 1, 1, 3); } } } // the crown shimmers while it turns steel; green motes while he is open
      if (e.mode === 'shoutTell' || e.mode === 'slamTell' || e.mode === 'sweepTell' || e.mode === 'grabTell' || e.mode === 'liftTell') text(e.mode === 'grabTell' || e.mode === 'liftTell' ? '!!' : '!', e.x - cx, e.y - (e.phase < 3 ? 60 : 72) - cy, e.mode === 'grabTell' || e.mode === 'liftTell' ? '#ff6b6b' : '#ffd36b', 'center'); continue; }
    if (e.t === 'master') { if (e.mounted) { const tl = /Tell$/.test(e.mode || ''); drawSet(SPR.master, null, e.mode === 'leap' ? 1 : Math.abs(e.vx) > 10 ? Math.floor(e.anim * 12) % 2 : 0, e.x - cx, e.y - cy, e.face, e.flash > 0 || (e.stagger > 0 && Math.floor(e.anim * 10) % 2 === 0), tl ? 1.12 : 1, tl ? 0.86 : 1); if (e.mode === 'lash') { g.strokeStyle = '#c9b27c'; g.lineWidth = 1; g.beginPath(); g.moveTo(Math.round(e.x - cx), Math.round(e.y - 12 - cy)); g.lineTo(Math.round(e.x + e.face * 46 - cx), Math.round(e.y - 6 - cy + Math.sin(time * 40) * 3)); g.stroke(); } if (e.mode === 'lashTell' || e.mode === 'leapTell') text(e.mode === 'leapTell' ? '!!' : '!', e.x - cx, e.y - e.h - 12 - cy, e.mode === 'leapTell' ? '#ff6b6b' : '#ffd36b', 'center'); } else drawSet(SPR.masterFoot, null, e.mode === 'whip' || e.mode === 'whipTell' ? 1 : 0, e.x - cx, e.y - cy, e.face, e.flash > 0, 1, 1); if (e.mode === 'whipTell') text('!', e.x - cx, e.y - e.h - 10 - cy, '#ffd36b', 'center'); continue; }
    if (e.t === 'folk') { const set = e.alt ? SPR.folk2 : SPR.folk; const fr = e.cower ? 2 : (e.court ? (Math.floor(e.anim * 4) % 2) : (Math.abs(e.vx) > 8 ? Math.floor(e.anim * 12) % 2 : 0)); drawSet(set, null, fr, e.x - cx, e.y - cy + (e.court && !e.cower ? -Math.round(Math.abs(Math.sin(e.anim * 6)) * 3) : 0), e.face, e.flash > 0, 1, 1); continue; }
    if (e.t === 'gill') { g.drawImage(PROP.gillpod[Math.floor(e.anim * 3) % 2], Math.round(e.x) - 6 - cx, Math.round(e.y) - 8 - cy); if (mother && !mother.gillsOpen && !mother.tipped) { g.globalAlpha = 0.35 + 0.1 * Math.sin(time * 5 + e.x); g.fillStyle = '#c9a0ff'; g.beginPath(); g.ellipse(Math.round(e.x) - cx, Math.round(e.y) - 3 - cy, 10, 8, 0, 0, 7); g.fill(); g.globalAlpha = 1; } if (e.flash > 0) { g.fillStyle = 'rgba(255,255,255,0.6)'; g.fillRect(Math.round(e.x) - 6 - cx, Math.round(e.y) - 8 - cy, 12, 10); } continue; }
    if (e.t !== 'wasp' && e.t !== 'queen' && e.t !== 'drone') g.drawImage(PROP.shadow, Math.round(e.x) - 6 - cx, Math.round(e.y) - 2 - cy);
    let frame = 0;
    if (e.t === 'spit') frame = e.mouth > 0 ? 2 : (Math.floor(e.anim * 1.5) % 4 === 1 ? 1 : 0);
    else if (e.t === 'wasp') frame = Math.floor(e.anim * 30) % 3;
    else if (e.t === 'queen') frame = e.mode === 'winded' || e.mode === 'slamRest' ? 6 : e.mode === 'aim' ? 2 : e.mode === 'dive' ? 3 : (e.mode === 'volley' || e.mode === 'volleyUp') ? 4 : (e.mode === 'slamUp' || e.mode === 'slamHang' || e.mode === 'slam') ? 5 : (e.mode === 'sweep' || e.mode === 'sweepStart') ? 7 : Math.floor(e.anim * 26) % 2;
    else if (e.t === 'hopper') frame = e.air ? (e.vy < 0 ? 1 : 3) : (e.timer < 0.2 && Math.abs(P.x - e.x) < 170 ? 2 : 0);
    else if (e.t === 'frog') frame = e.mode === 'dazed' ? 6 : e.mode === 'crouch' ? 3 : (e.mode === 'leap' || e.mode === 'hop') ? (e.vy < 40 ? 4 : 5) : e.mode === 'croak' ? 1 : (e.mode === 'inhale' || e.mode === 'tongue' || e.mode === 'inhaleTell') ? 2 : 0;
    else if (e.t === 'sapper') frame = e.fleeT > 0 ? 4 + Math.floor(e.anim * 12) % 2 : Math.floor(e.anim * 12) % 4;
    else if (e.t === 'sporeling') frame = Math.abs(e.vx) > 4 ? [0, 2, 1, 3][Math.floor(e.anim * 9) % 4] : 0;
    else if (e.t === 'lurker') frame = e.mode === 'hide' ? 0 : e.mode === 'rest' ? 2 : 1;
    else if (e.t === 'drone') frame = Math.floor(e.anim * 1.1) % 6 === 0 && (e.anim * 1.1) % 1 < 0.15 ? 2 : [0, 3, 1, 3][Math.floor(e.anim * 5) % 4];
    else if (e.t === 'shaman') frame = e.cast > 0 ? (Math.floor(e.anim * 10) % 2 ? 4 : 1) : Math.abs(e.vx || 0) > 4 ? 2 + Math.floor(e.anim * 6) % 2 : 0;
    else if (e.t === 'hound') frame = e.air ? 2 : Math.floor(e.anim * 14) % 2;
    else if (e.t === 'brute') frame = e.mode === 'raise' ? 2 : (e.mode === 'slam' || e.mode === 'wind' || e.mode === 'sweep') ? 3 : (Math.abs(e.vx) > 4 ? Math.floor(e.anim * 6) % 2 : 0);
    else if (e.t === 'chief') frame = e.mode === 'leap' || e.mode === 'crouch' ? 9 : e.mode === 'whirl' ? (Math.floor(e.anim * 12) % 2 ? 4 : 3) : e.mode === 'whirlWind' ? 4 : e.mode === 'rainAim' || e.mode === 'rainLoose' ? 8 : e.mode === 'raise' ? 2 : e.mode === 'slam' || e.mode === 'planted' ? 3 : e.mode === 'wind' || e.mode === 'sweep' ? 4 : e.mode === 'reach' || e.mode === 'lunge' ? 5 : e.mode === 'slash' || e.mode === 'bash' ? 7 : e.mode === 'aim' || e.mode === 'shoot' ? 8 : (() => { const moving = Math.abs(e.vx) > 4, step = Math.floor(e.anim * 8) % 4; if (e.stance === 'sword') return moving ? [6, 11, 12, 11][step] : 6; if (e.stance === 'bow') return moving ? [8, 13, 14, 13][step] : 8; return moving ? [0, 1, 10, 1][step] : 0; })();
    else if (e.t === 'sprig' || e.t === 'bearer') frame = Math.abs(e.vx) > 4 || e.t === 'bearer' ? Math.floor(e.anim * 10) % 4 : (Math.floor(e.anim * 0.7) % 4 === 1 ? 4 : 0);
    else if (e.t === 'thief') frame = e.loot > 0 || Math.abs(e.vx) > 8 ? Math.floor(e.anim * 12) % 2 : (Math.floor(e.anim * 0.8) % 3 === 1 ? 2 : 0);
    else if (e.t === 'miner') frame = e.mode === 'dig' ? 2 : e.mode === 'swingTell' || e.mode === 'swing' ? 3 : Math.abs(e.vx) > 4 ? Math.floor(e.anim * 8) % 2 : 0;
    else if (e.t === 'bat') frame = e.mode === 'hang' ? 0 : 1 + Math.floor(e.anim * 16) % 2;
    else if (e.t === 'grub') frame = e.mode === 'spit' ? 2 : Math.floor(e.anim * 5) % 2;
    else if (e.t === 'kite') frame = 0;
    else if (e.t === 'stormshaman') frame = e.castFlash > 0 ? 1 : 0;
    else if (e.t === 'dummy') frame = e.flash > 0 ? 1 : 0;
    else if (e.t === 'sweep') frame = e.mode === 'pop' ? 2 : e.mode === 'throw' ? 1 : 0;
    else if (e.t === 'crow') frame = Math.floor(e.anim * 10) % 3;
    else if (e.t === 'horn') frame = e.mode === 'blow' ? 2 : e.mode === 'tell' ? 1 : 0;
    else if (e.t === 'bale') frame = ((Math.floor(e.spin || 0) % 4) + 4) % 4;
    else if (e.t === 'hare') frame = e.mode === 'run' ? Math.floor(e.anim * 12) % 2 : 2;
    else if (e.t === 'wight') frame = Math.floor(e.anim * 6) % 4;
    else if (e.t === 'windcaller') frame = e.mode === 'fallen' ? 2 : e.mode === 'ground' ? 3 : e.mode === 'blink' || e.mode === 'appear' ? 2 : (e.mode === 'howlTell' || e.mode === 'howl') ? 3 : e.castFlash > 0 ? 1 : Math.abs(e.vx) > 6 ? 4 + Math.floor(e.anim * 7) % 2 : 0;
    else if (e.t === 'golem') frame = e.mode === 'stagger' ? 5 : e.mode === 'drink' ? 7 : e.mode === 'counter' ? 8 : (e.mode === 'shroudTell' || e.mode === 'shroud') ? 6 : (e.mode === 'stompTell' || e.mode === 'stomp') ? 3 : e.mode === 'throwTell' || e.mode === 'throw' ? 4 : Math.abs(e.vx) > 4 ? 1 + Math.floor(e.anim * 5) % 2 : 0;
    else if (e.t === 'rockgoblin') frame = e.mode === 'throw' ? 2 : Math.abs(e.vx) > 4 ? Math.floor(e.anim * 8) % 2 : 0;
    else if (e.t === 'forgemaster') frame = e.mode === 'stun' || e.mode === 'scald' ? 5 : e.mode === 'slamTell' || e.mode === 'anvilTell' || e.mode === 'hurlTell' ? 1 : e.mode === 'slam' || e.mode === 'anvil' || e.mode === 'hurl' ? 2 : e.mode === 'drag' || e.mode === 'dragTell' || e.mode === 'spray' || e.mode === 'sprayTell' ? 3 : e.mode === 'breath' || e.mode === 'breathTell' ? 6 : Math.abs(e.vx) > 10 ? [7, 0, 8, 0][Math.floor(e.anim * (Math.abs(e.vx) > 60 ? 4.5 : 3)) % 4] : 0; // he walks now: plant, pass, plant (his anim runs at twice time)
    else if (e.t === 'greathound') frame = e.mode === 'stun' || e.mode === 'skid' || e.mode === 'whine' || e.mode === 'landed' ? 6 : e.mode === 'howlTell' || e.mode === 'howl' ? 5 : e.mode === 'pounce' ? 4 : e.mode === 'lungeTell' || e.mode === 'pounceTell' || e.mode === 'snapTell' ? 3 : Math.abs(e.vx) > 10 ? 1 + Math.floor(e.anim * 14) % 2 : 0;
    else if (e.t === 'spider') frame = (e.mode === 'drop' || e.mode === 'dropTell' || e.mode === 'ground') ? 1 : e.mode === 'climb' ? 3 + Math.floor(e.anim * 10) % 2 : (Math.floor(e.anim * 1.5) % 3 === 0 ? 2 : 0);
    else if (e.squirrel) frame = e.vy !== 0 ? 2 : Math.floor(e.anim * 12) % 2;
    else if (e.t === 'owl') frame = e.mode === 'crash' || e.mode === 'grounded' ? 4 : e.mode === 'screech' || e.mode === 'screechTell' ? 3 : e.mode === 'sit' || e.mode === 'sleep' || e.mode === 'wake' || e.mode === 'fanTell' || e.mode === 'fan' ? 0 : e.mode === 'swoop' ? 6 : e.mode === 'land' ? 7 : e.mode === 'takeoff' ? (Math.floor(e.anim * 14) % 2 ? 1 : 2) : e.mode === 'fly' ? (e.modeT > 2.4 ? 1 + Math.floor(e.anim * 9) % 2 : 5) : e.mode === 'carry' ? 1 + Math.floor(e.anim * 8) % 2 : 1 + Math.floor(e.anim * 8) % 2;
    else if (e.t === 'shardling') frame = e.mode === 'bristle' ? 2 : Math.abs(e.vx) > 4 ? Math.floor(e.anim * 8) % 2 : 0;
    else if (e.t === 'gqueen') frame = GQ_FRAME[e.mode] !== undefined ? (typeof GQ_FRAME[e.mode] === 'function' ? GQ_FRAME[e.mode](e) : GQ_FRAME[e.mode]) : 3;
    else if (e.t === 'sentry') frame = e.mode === 'run' ? 3 + Math.floor(e.anim * 12) % 2 : e.mode === 'spot' || e.ringing ? 2 : Math.abs(e.vx) > 4 ? Math.floor(e.anim * 8) % 2 : 0;
    else if (e.t === 'roc') frame = e.mode === 'dive' ? 4 : (e.mode === 'stuck' || e.mode === 'skid') ? 6 : e.mode === 'downed' ? 7 : (e.mode === 'gust') ? 5 : (e.mode === 'diveTell' || e.mode === 'shedTell' || e.mode === 'wake') ? 3 : e.mode === 'sleep' ? 6 : Math.floor(e.anim * 8) % 4 === 3 ? 1 : Math.floor(e.anim * 8) % 4;
    else if (e.t === 'suncatcher') frame = e.mode === 'dim' ? 7 : e.mode === 'drink' ? 3 : (e.mode === 'throw' || e.mode === 'throwTell') ? 4 : e.mode === 'raise' ? 5 : e.flash > 0 ? 6 : Math.floor(e.anim * 2) % 2 ? 1 : 2;
    else if (e.t === 'hearthgob') frame = e.mode === 'asleep' ? 0 : e.mode === 'waking' ? 1 : e.mode === 'raise' ? 2 : e.mode === 'swing' ? 3 : Math.abs(e.vx) > 4 ? 4 + Math.floor(e.anim * 9) % 2 : 1;
    else if (e.t === 'cutter') frame = e.mode === 'raise' ? 1 : e.mode === 'chop' ? 2 : Math.abs(e.vx) > 6 ? 3 : 0;
    else if (e.t === 'lance') { const p2 = e.phase === 2, mv = Math.abs(e.vx) > 6;
      frame = ({ reel: 18, stumble: 19, planted: 12, couch: 5, thrustTell: 8, thrust: 9, sweepTell: 10, sweep: 11, bashTell: p2 ? 13 : 25, bash: p2 ? 16 : 26, vaultTell: 20, vault: 21, javTell: 22, javThrow: 23, rise: 24, guardTell: 14, guardSwing: 15, rushTell: 16 })[e.mode];
      if (frame === undefined) frame = e.mode === 'charge' ? 6 + Math.floor(e.anim * 12) % 2 : e.mode === 'rush' ? 16 + Math.floor(e.anim * 12) % 2 : e.mode === 'recover' ? (p2 ? 15 : 9) : (p2 || e.mode === 'guard') ? (mv ? 27 + Math.floor(e.anim * 8) % 2 : 13) : (mv ? 1 + Math.floor(e.anim * 9) % 4 : 0); }
    else if (e.t === 'snuffer') frame = e.mode === 'snuffTell' ? 2 : (e.mode === 'swipeTell' || e.mode === 'swipe') ? 3 : Math.abs(e.vx) > 4 ? Math.floor(e.anim * 9) % 2 : 0;
    else if (e.t === 'sailer') frame = e.mode === 'tumble' ? 2 : e.mode === 'sail' ? 1 : 0;
    else if (e.t === 'troll') frame = e.mode === 'throwTell' || e.mode === 'throw' ? 3 : e.mode === 'swatTell' || e.mode === 'swat' ? 4 : Math.abs(e.vx) > 4 ? 1 + Math.floor(e.anim * 5) % 2 : 0;
    else if (e.t === 'harpy') frame = e.mode === 'dive' ? 2 : e.mode === 'downed' ? 3 : e.mode === 'aim' ? Math.floor(e.anim * 14) % 2 : Math.floor(e.anim * 6) % 2;
    else if (e.t === 'goat') frame = !e.rider ? 3 + Math.floor(e.anim * 12) % 2 : e.mode === 'buck' ? 2 : Math.abs(e.vx) > 4 ? Math.floor(e.anim * (e.mode === 'charge' ? 14 : 8)) % 2 : 0;
    else if (e.t === 'ram') frame = e.mode === 'lower' || e.mode === 'buttTell' || e.mode === 'leapTell' || e.mode === 'rear' ? 3 : e.mode === 'leap' ? 6 : e.mode === 'land' ? 4 : e.mode === 'crash' ? 4 : e.mode === 'tossTell' || e.mode === 'toss' || e.mode === 'call' ? 5 : e.mode === 'stampTell' || e.mode === 'stamp' || e.mode === 'butt' ? 5 : Math.abs(e.vx) > 4 ? 1 + Math.floor(e.anim * (e.mode === 'charge' ? 16 : 8)) % 2 : 0;
    else if (e.t === 'pike') frame = e.mode === 'thrust' ? 1 : e.mode === 'tell' ? 2 : 0;
    else if (e.t === 'archer') frame = e.draw > 0 ? 1 : Math.abs(e.vx) > 4 ? 2 + Math.floor(e.anim * 8) % 2 : (Math.floor(e.anim * 0.6) % 3 === 1 ? 4 : 0);
    else frame = Math.abs(e.vx) > 4 ? Math.floor(e.anim * (e.mode === 'charge' ? 22 : 10)) % 4 : 0;
    const wind = windingUp(e);
    const bob = e.t === 'spit' ? Math.round(Math.sin(e.anim * 3) * 0.6) : 0;
    if (e.t === 'queen') { g.globalAlpha = 0.3; g.drawImage(PROP.shadow, Math.round(e.x) - 6 - cx, L.arena.floor - 2 - cy); g.globalAlpha = 1; }
    if (e.t === 'kite' && e.alive) { const kx = Math.round(e.x - cx), ky = Math.round(e.y - e.h - 26 - cy) + (e.mode === 'fall' ? 10 : 0); g.strokeStyle = '#e8dcc0'; g.lineWidth = 1; g.beginPath(); g.moveTo(kx + 0.5, Math.round(e.y - e.h - cy)); g.lineTo(kx + 0.5, ky + 8); g.stroke(); g.fillStyle = e.col; g.beginPath(); g.moveTo(kx, ky - 8); g.lineTo(kx + 7, ky); g.lineTo(kx, ky + 8); g.lineTo(kx - 7, ky); g.closePath(); g.fill(); g.fillStyle = '#2a2230'; g.fillRect(kx, ky - 8, 1, 16); g.fillRect(kx - 7, ky, 14, 1); for (let k = 1; k < 4; k++) { g.fillStyle = k % 2 ? '#ffd36b' : e.col; g.fillRect(kx - 1 + Math.round(Math.sin(time * 6 + k) * 2), ky + 8 + k * 4, 2, 2); } }
    if (e.t === 'windcaller' && e.alive && callerOpen(e)) { const k = 0.5 + 0.5 * Math.sin(time * 10); g.globalAlpha = 0.35 + 0.35 * k; g.strokeStyle = '#8fd160'; g.lineWidth = 2; g.beginPath(); g.ellipse(Math.round(e.x - cx), Math.round(e.y - cy) - 2, 18 + k * 3, 5, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; }
    if (e.t === 'golem' && e.alive && e.cb) { const x0 = Math.round(e.cb.x0 - cx), y0 = Math.round(e.cb.y0 - cy), x1 = Math.round(e.cb.x1 - cx), y1 = Math.round(e.cb.y1 - cy); g.globalAlpha = 0.3; g.strokeStyle = '#ff7ab8'; g.lineWidth = 9; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.globalAlpha = 0.95; g.strokeStyle = '#fff0f6'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.globalAlpha = 1; }
    if (e.t === 'golem' && e.alive) { const gx = Math.round(e.x - cx), gy = Math.round(e.y - cy); const NEED = { blue: '#bfe6f5', violet: '#c8a8ff', green: '#a8ffb8', both: '#fff6e0' }; const gems = [[0, -34], [-11, -25], [11, -25], [0, -18]]; gems.forEach(([ox, oy], k) => { const broken = k < (e.facets || 0), isNext = k === (e.facets || 0); const okNow = e.lit && (e.need === 'both' ? (e.litCols && e.litCols.size >= 2) : (e.litCols && e.litCols.has(e.need))); g.fillStyle = broken ? '#2a3a50' : isNext ? (okNow ? (Math.floor(time * 10) % 2 ? '#fff6e0' : NEED[e.need]) : NEED[e.need]) : '#a8306a'; g.fillRect(gx + ox - 2, gy + oy - 2, 4, 4); if (!broken && e.lit) { g.globalAlpha = 0.35; g.fillStyle = '#ff7ab8'; g.beginPath(); g.arc(gx + ox, gy + oy, 7, 0, 7); g.fill(); g.globalAlpha = 1; } }); if (e.lit) { g.globalAlpha = 0.18; g.fillStyle = '#eefaff'; g.fillRect(gx - 18, gy - e.h - 2, 36, e.h + 2); g.globalAlpha = 1; } }
    if (e.t === 'forgemaster' && forgeOpen(e)) { const k = 0.5 + 0.5 * Math.sin(time * 10); g.globalAlpha = 0.35 + 0.35 * k; g.strokeStyle = '#8fd160'; g.lineWidth = 2; g.beginPath(); g.ellipse(Math.round(e.x - cx), Math.round(e.y - cy) - 2, 30 + k * 3, 7, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; }
    if (e.t === 'roc' && e.alive && (e.mode === 'diveTell' || e.mode === 'dive') && e.tx !== undefined) { const k = 0.5 + 0.5 * Math.sin(time * 16), fy = Math.round(L.arena.floor - cy); g.globalAlpha = 0.25 + 0.25 * k; g.fillStyle = '#1b1626'; g.beginPath(); g.ellipse(Math.round(e.tx - cx), fy - 1, 16 + k * 3, 4, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; }
    if (e.t === 'gqueen' && e.alive && gqOpen(e)) { const k = 0.5 + 0.5 * Math.sin(time * 10); g.globalAlpha = 0.35 + 0.35 * k; g.strokeStyle = '#8fd160'; g.lineWidth = 2; g.beginPath(); g.ellipse(Math.round(e.x - cx), Math.round(e.y - cy) - 2, 24 + k * 3, 6, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; }
    if (e.t === 'gqueen' && e.alive && e.mode === 'point' && e.markX) { const k = 0.5 + 0.5 * Math.sin(time * 18), fy = Math.round(L.arena.floor - cy) - 2, mx = Math.round(e.markX - cx); g.globalAlpha = 0.5 + 0.4 * k; g.strokeStyle = '#ff6b6b'; g.lineWidth = 2; g.beginPath(); g.moveTo(mx - 10, fy - 4); g.lineTo(mx + 10, fy + 2); g.moveTo(mx + 10, fy - 4); g.lineTo(mx - 10, fy + 2); g.stroke(); g.globalAlpha = 1; }
    if (e.t === 'gqueen' && e.alive && e.gather > 0 && e.markX !== undefined && !e.rodTarget) { const k = 1 - e.gather / 0.9, fy = Math.round(L.arena.roof - cy); g.globalAlpha = 0.3 + 0.5 * k; g.strokeStyle = '#dfe8ff'; g.lineWidth = 1; for (const mx of (e.marks || [e.markX])) { g.beginPath(); g.ellipse(Math.round(mx - cx), fy - 1, 22 - k * 10, 5 - k * 2, 0, 0, Math.PI * 2); g.stroke(); } g.globalAlpha = 1; }
    if (e.t === 'roc' && e.alive && rocOpen(e)) { const k = 0.5 + 0.5 * Math.sin(time * 10); g.globalAlpha = 0.35 + 0.35 * k; g.strokeStyle = '#8fd160'; g.lineWidth = 2; g.beginPath(); g.ellipse(Math.round(e.x - cx), Math.round(e.y - cy) - 2, 26 + k * 3, 6, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; }
    if (e.t === 'lance' && e.alive && lanceOpen(e)) { const k = 0.5 + 0.5 * Math.sin(time * 10); g.globalAlpha = 0.35 + 0.35 * k; g.strokeStyle = '#8fd160'; g.lineWidth = 2; g.beginPath(); g.ellipse(Math.round(e.x - cx), Math.round(e.y - cy) - 2, 24 + k * 3, 6, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; }
    if (e.t === 'ram' && ramOpen(e)) { const k = 0.5 + 0.5 * Math.sin(time * 10); g.globalAlpha = 0.35 + 0.35 * k; g.strokeStyle = '#8fd160'; g.lineWidth = 2; g.beginPath(); g.ellipse(Math.round(e.x - cx), Math.round(e.y - cy) - 2, 28 + k * 3, 7, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; for (let q = 0; q < 3; q++) { const a = time * 5 + q * 2.1; g.fillStyle = q % 2 ? '#8fd160' : '#fff6c8'; g.fillRect(Math.round(e.x - cx + Math.cos(a) * 22), Math.round(e.y - e.h * 1.5 - cy) - 8 + Math.round(Math.sin(a * 1.4) * 4), 2, 2); } } // dazed: a green ring under him, green motes over him
    if (e.t === 'ram' && e.mode === 'leap') { const fl = L.arena.floor; g.fillStyle = 'rgba(10,8,20,0.45)'; g.beginPath(); g.ellipse(Math.round(e.landX - cx), Math.round(fl - cy) - 1, 16, 4, 0, 0, Math.PI * 2); g.fill(); }
    const sprSet = e.squirrel ? SPR.squirrel : e.t === 'hopper' && e.color && e.color !== 'green' ? SPR['hopper_' + e.color] : SPR[e.t];
    const bigF = e.t === 'lance' ? 1.15 : e.big ? (e.t === 'spider' ? 2.1 : 1.7) : 1; const sq = e.sq > 0 ? e.sq / 0.16 : 0;
    if (e.t === 'windcaller' && (e.mode === 'blink' || e.mode === 'appear')) g.globalAlpha = 0.3 + 0.25 * Math.sin(time * 40);
    const ps = poseOf(e, wind), pSX = bigF * (1 + sq * 0.22) * ps.sx, pSY = bigF * (1 - sq * 0.22) * ps.sy;
    // a bright rim behind the sprite, for anyone who loses foes against the wood
    if (SET.rim && sprSet && !e.harmless) { const rx = e.x - cx + (wind ? Math.round(Math.sin(e.anim * 60)) : 0) + ps.dx, ry = e.y - cy + bob + ps.dy; g.globalAlpha = 0.5;
      for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) drawSet(sprSet, null, frame, rx + ox, ry + oy, ps.face, true, pSX, pSY);
      g.globalAlpha = 1; }
    drawSet(sprSet, null, frame, e.x - cx + (wind ? Math.round(Math.sin(e.anim * 60)) : 0) + ps.dx, e.y - cy + bob + ps.dy, ps.face, e.flash > 0 || (wind && Math.floor(e.anim * 12) % 2 === 0), pSX, pSY);
    g.globalAlpha = 1;
    if (e.t === 'windcaller' && e.alive && e.mode !== 'sleep' && (e.mode === 'howlTell' || e.mode === 'howl')) { const k = 0.5 + 0.5 * Math.sin(time * 12); g.globalAlpha = 0.5 + 0.4 * k; g.strokeStyle = '#bfe6f5'; g.lineWidth = 1; for (let q = 0; q < 3; q++) { g.beginPath(); g.arc(Math.round(e.x - cx), Math.round(e.y - cy) - 14, 14 + q * 8 + k * 4, 0, 7); g.stroke(); } g.globalAlpha = 1; }
    if (wind) text('!', e.x - cx, e.y - e.h - 12 - cy, '#ffd36b', 'center');
    else if (e.emoteT > 0 && e.alive) drawEmote(e, Math.round(e.x - cx + ps.dx), Math.round(e.y - e.h * bigF - cy + ps.dy) - 5);
    if (SET.foeBars && e.hp0 && e.hp < e.hp0 && e.hp > 0 && !e.maxHp && !e.harmless) { const bx = Math.round(e.x - cx) - 6, by = Math.round(e.y - e.h - cy) - 5; g.fillStyle = ART.OUT; g.fillRect(bx - 1, by - 1, 14, 4); g.fillStyle = '#2a2230'; g.fillRect(bx, by, 12, 2); g.fillStyle = e.hp / e.hp0 > 0.5 ? '#8fd160' : '#ff6b6b'; g.fillRect(bx, by, Math.round(12 * e.hp / e.hp0), 2); }
  }
  if (tongue && tongue.active) { const x0 = Math.round(tongue.x0 - cx), y = Math.round(tongue.y - cy), len = Math.round(tongue.len); g.fillStyle = '#ff7a9a'; g.fillRect(tongue.dir > 0 ? x0 : x0 - len, y - 2, len, 4); g.fillStyle = '#ffb0c0'; g.fillRect(tongue.dir > 0 ? x0 : x0 - len, y - 2, len, 1); g.fillStyle = '#c9463d'; g.fillRect(tongue.dir > 0 ? x0 + len - 4 : x0 - len, y - 3, 4, 6); }
  for (const f of fish) { g.save(); g.translate(Math.round(f.x - cx), Math.round(f.y - cy)); g.rotate(Math.atan2(f.vy, f.vx) * 0.6); if (f.vx < 0) g.scale(-1, 1); g.drawImage(FISH, -3, -2); g.restore(); }
  for (const s of seeds) { if (s.bolt) { const x = Math.round(s.x - cx), y = Math.round(s.y - cy); g.fillStyle = '#c9a0ff'; g.fillRect(x - 3, y - 1, 6, 2); g.fillRect(x - 1, y - 3, 2, 6); g.fillStyle = '#f0e4ff'; g.fillRect(x - 1, y - 1, 2, 2); g.globalAlpha = 0.5; g.fillStyle = '#9a5acc'; g.fillRect(x - Math.round(s.vx * 0.04) - 2, y - Math.round(s.vy * 0.04) - 2, 4, 4); g.globalAlpha = 1; } else if (s.jav) { g.save(); g.translate(Math.round(s.x - cx), Math.round(s.y - cy)); g.rotate(Math.atan2(s.vy, s.vx)); g.fillStyle = '#8a5a32'; g.fillRect(-10, -1, 14, 2); g.fillStyle = '#c9d1dc'; g.fillRect(4, -2, 4, 4); g.fillStyle = '#eef4ff'; g.fillRect(7, -1, 2, 2); g.fillStyle = '#5a2a7a'; g.fillRect(-11, -2, 3, 4); g.restore(); } else if (s.arrow) { const a = Math.atan2(s.vy, s.vx); g.save(); g.translate(Math.round(s.x - cx), Math.round(s.y - cy)); g.rotate(a); g.fillStyle = '#e8dcc0'; g.fillRect(-5, -1, 8, 1); g.fillStyle = '#c9d1dc'; g.fillRect(3, -1, 3, 2); g.fillStyle = s.reflected ? '#8fd160' : '#c9463d'; g.fillRect(-6, -2, 2, 3); g.restore(); } else if (s.shard) { g.save(); g.translate(Math.round(s.x - cx), Math.round(s.y - cy)); g.rotate(Math.atan2(s.vy, s.vx)); g.fillStyle = '#bfe6f5'; g.fillRect(-5, -2, 10, 4); g.fillStyle = '#eefaff'; g.fillRect(-4, -1, 6, 1); g.restore(); } else if (s.soot) { const x = Math.round(s.x - cx), y = Math.round(s.y - cy); g.fillStyle = '#2a2630'; g.beginPath(); g.arc(x, y, 3, 0, 7); g.fill(); g.fillStyle = '#5a5460'; g.fillRect(x - 1, y - 2, 2, 1); } else if (s.acid) { const x = Math.round(s.x - cx), y = Math.round(s.y - cy); g.fillStyle = '#b8d878'; g.fillRect(x - 2, y - 2, 4, 4); g.fillStyle = '#e8ff9a'; g.fillRect(x - 1, y - 1, 2, 2); } else if (s.lantern) { const x = Math.round(s.x - cx), y = Math.round(s.y - cy); g.fillStyle = '#5a6270'; g.fillRect(x - 2, y - 4, 4, 6); g.fillStyle = '#ffd36b'; g.fillRect(x - 1, y - 3, 2, 3); g.fillStyle = '#8a919c'; g.fillRect(x - 1, y - 5, 2, 1); } else if (s.skull) { g.save(); g.translate(Math.round(s.x - cx), Math.round(s.y - cy)); g.rotate(s.life * 6); g.fillStyle = '#e8e0d0'; g.fillRect(-4, -4, 8, 7); g.fillRect(-3, 3, 6, 2); g.fillStyle = '#2a2230'; g.fillRect(-3, -2, 2, 2); g.fillRect(1, -2, 2, 2); g.fillRect(-1, 3, 1, 2); g.fillRect(1, 3, 1, 2); g.restore(); } else if (s.goblet) { g.save(); g.translate(Math.round(s.x - cx), Math.round(s.y - cy)); g.rotate(s.life * 9); g.fillStyle = '#e0b040'; g.fillRect(-3, -3, 6, 4); g.fillRect(-1, 1, 2, 3); g.fillStyle = '#fff6c8'; g.fillRect(-2, -3, 2, 1); g.restore(); } else if (s.pod) { const x = Math.round(s.x - cx), y = Math.round(s.y - cy); g.fillStyle = '#6a3a7a'; g.fillRect(x - 4, y - 5, 8, 8); g.fillStyle = '#9a5aa8'; g.fillRect(x - 3, y - 4, 6, 6); g.fillStyle = '#e0b0f0'; g.fillRect(x - 2, y - 4, 2, 2); g.fillStyle = '#3f6e2c'; g.fillRect(x - 1, y - 7, 2, 2); } else if (s.spore) { g.fillStyle = '#9a5aa8'; g.fillRect(Math.round(s.x - cx) - 2, Math.round(s.y - cy) - 3, 5, 5); g.fillStyle = '#e0b0f0'; g.fillRect(Math.round(s.x - cx) - 1, Math.round(s.y - cy) - 3, 2, 2); } else if (s.venom) { g.fillStyle = '#8fd160'; g.fillRect(Math.round(s.x - cx) - 2, Math.round(s.y - cy) - 2, 4, 4); g.fillStyle = '#dfffa0'; g.fillRect(Math.round(s.x - cx) - 1, Math.round(s.y - cy) - 2, 2, 1); } else drawSet(SPR.seed, null, 0, s.x - cx, s.y + 3 - cy, 1, false); }
  if (throneBlock) g.drawImage(PROP.palanquin, Math.round(throneBlock.x) - 36 - cx, Math.round(throneBlock.y) - 45 - cy, 72, 45);
  for (const r of rocks) if (r.thrown && r.tx !== undefined && !r.dead) { let gy = Math.floor(r.y / TS); while (gy < LH && !isSolid(Math.floor(r.tx / TS), gy) && !isOneWay(tileAt(Math.floor(r.tx / TS), gy))) gy++; const k = 0.5 + 0.5 * Math.sin(time * 16); g.globalAlpha = 0.45 + 0.4 * k; g.strokeStyle = '#ff6b4a'; g.lineWidth = 1; g.beginPath(); g.ellipse(Math.round(r.tx - cx), gy * TS - 1 - cy, 11, 3, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; }
  for (const r of rocks) { let gy = Math.floor(r.y / TS); while (gy < LH && !isSolid(Math.floor(r.x / TS), gy) && !isOneWay(tileAt(Math.floor(r.x / TS), gy))) gy++; const k = Math.max(0.3, 1 - (gy * TS - r.y) / 200); g.globalAlpha = 0.35 * k; g.drawImage(PROP.shadow, Math.round(r.x - cx) - 6, gy * TS - 2 - cy, 12, 3); g.globalAlpha = 1; if (r.lamp) g.drawImage(SPR.chandelier, Math.round(r.x - cx) - 12, Math.round(r.y - cy) - 14); else if (r.hammerRock) drawHammerRock(r, cx, cy); else g.drawImage(PROP.boulder, Math.round(r.x - cx) - 7, Math.round(r.y - cy) - 11); }
  for (const v of vines) { if (v.t < v.tell) continue; const x1 = Math.round(v.x - cx), y = Math.round(v.y - cy), x0 = Math.round(v.x - v.dir * v.len - cx); const lo = Math.min(x0, x1), hi = Math.max(x0, x1); g.fillStyle = '#3f6e2c'; g.fillRect(lo, y - 4, hi - lo, 3); g.fillStyle = '#8fd160'; g.fillRect(lo, y - 4, hi - lo, 1); for (let x = lo; x < hi; x += 6) { g.fillStyle = '#dfffa0'; g.fillRect(x + ((y + x) % 3), y - 7, 1, 3); } g.fillStyle = '#3f6e2c'; g.fillRect(x1 - 2, y - 8, 4, 8); }
  for (const b of bolts) { const x = Math.round(b.x - cx), y = Math.round(b.y - cy), k = b.life / 0.28; if (b.storm) { g.globalAlpha = Math.min(1, k); g.fillStyle = b.holy ? '#ffd36b' : '#9ab8ff'; g.fillRect(x - 3, y - 220, 7, 220); g.fillStyle = b.holy ? '#fff6c8' : '#eef4ff'; for (let s = 0; s < 220; s += 14) g.fillRect(x - 1 + ((s * 7) % 5) - 2, y - s - 14, 3, 15); g.globalAlpha = 1; continue; } g.globalAlpha = k; g.fillStyle = '#dfffa0'; g.fillRect(x - 1, y - 200, 3, 200); g.fillStyle = '#8fd160'; g.fillRect(x - 3, y - 200, 7, 200); g.globalAlpha = 1; g.fillStyle = '#fff6e0'; g.fillRect(x - 1, y - 200, 2, 200); }
  for (const r of rain) { if (r.fired) continue; const x = Math.round(r.x - cx), y = Math.round(r.y - cy), hot = Math.floor(time * 10) % 2 === 0; g.fillStyle = r.bolt ? (hot ? '#8fd160' : '#dfffa0') : hot ? '#ff6b6b' : '#ffd36b'; g.fillRect(x - 4, y - 8, 2, 2); g.fillRect(x + 2, y - 8, 2, 2); g.fillRect(x - 2, y - 6, 2, 2); g.fillRect(x, y - 6, 2, 2); g.fillRect(x - 1, y - 4, 2, 2); g.globalAlpha = 0.25; g.fillRect(x - 6, y - 1, 12, 1); g.globalAlpha = 1; }
  for (const w of pwaves) { const x = Math.round(w.x - cx), y = Math.round(w.y - cy); g.fillStyle = '#b8842a'; g.fillRect(x - 4, y - 5, 8, 5); g.fillStyle = '#ffd36b'; g.fillRect(x - 2, y - 8, 4, 3); g.fillRect(x - 5 + (w.dir > 0 ? 0 : 6), y - 3, 4, 2); }
  for (const s of sceptres) { g.save(); g.translate(Math.round(s.x - cx), Math.round(s.y - cy)); g.rotate(s.t * 16); g.fillStyle = '#c9a040'; g.fillRect(-9, -1, 18, 2); g.fillStyle = '#8a5ac0'; g.fillRect(6, -3, 5, 5); g.fillStyle = '#e0c0ff'; g.fillRect(7, -2, 2, 2); g.restore(); bloom(s.x - cx, s.y - cy, 10, 0.35, 'cool'); }
  for (const w of waves) { const x = Math.round(w.x - cx), y = Math.round(w.y - cy); if (w.royal) { g.fillStyle = '#5a2a7a'; g.fillRect(x - 4, y - 7, 8, 7); g.fillStyle = '#c9a0ff'; g.fillRect(x - 2, y - 10, 4, 3); g.fillRect(x - 5 + (w.dir > 0 ? 0 : 6), y - 4, 4, 2); continue; } g.fillStyle = '#8a5a32'; g.fillRect(x - 4, y - 5, 8, 5); g.fillStyle = '#c9b27c'; g.fillRect(x - 2, y - 8, 4, 3); g.fillRect(x - 5 + (w.dir > 0 ? 0 : 6), y - 3, 4, 2); }
  drawGateHints(cx, cy);
  if (showPlayer && !P.dead) {
    for (const gh of ghosts) drawSet(K, 'roll', gh.frame, gh.x - cx, gh.y - cy, gh.face, true, 1, 1, gh.life * 2);
    const vis = P.inv <= 0 || Math.floor(P.inv * 20) % 2 === 0;
    if (vis) {
      if (!P.fly) g.drawImage(PROP.shadow, Math.round(P.x) - 6 - cx, Math.round(P.y) - 2 - cy);
      let key = 'idle', frame = Math.floor(P.anim * 3) % 4;
      if (P.fly) { const kx = Math.round(P.x - cx) - 4, ky = Math.round(P.y - cy) - 58; g.strokeStyle = '#e8dcc0'; g.lineWidth = 1; g.beginPath(); g.moveTo(Math.round(P.x - cx) + 0.5, Math.round(P.y - cy) - 14); g.lineTo(kx + 0.5, ky + 20); g.stroke(); drawBigKite(kx, ky, time); }
      if (P.fly && !(P.atk >= 0)) { key = 'jump'; frame = 1; }
      else if (P.hurt > 0) key = 'hurt';
      else if (P.dodge > 0) { key = 'roll'; frame = Math.floor((0.3 - P.dodge) / 0.3 * 4) * (P.face > 0 ? 1 : -1); }
      else if (P.plunge) key = 'plunge';
      else if (P.atk >= 0) { key = 'atk'; frame = P.atk < 0.04 ? 0 : P.atk < 0.10 ? 1 : P.atk < 0.17 ? 2 : P.atk < 0.24 ? 3 : 4; }
      else if (P.riseT > 0) { key = 'atk'; frame = P.riseT > 0.2 ? 1 : 2; }
      else if ((isPyro() || isPaladin()) && P.blastT > 0) { key = 'blast'; frame = P.blastT > 0.2 ? 0 : 1; }
      else if ((isPyro() || isPaladin()) && P.castT > 0) { key = 'cast'; frame = P.castT > 0.1 ? 0 : 1; }
      else if (P.block || P.jet || P.aegis) { key = 'block'; frame = Math.floor(P.anim * 2) % 2; }
      else if (!P.ground) { key = P.vy < 0 ? 'jump' : 'fall'; frame = P.vy < 0 ? (P.vy < -150 ? 0 : 1) : (P.vy > 220 ? 1 : 0); }
      else if (keys.down && Math.abs(P.vx) < 10) key = 'crouch';
      else if (P.landT > 0 && Math.abs(P.vx) < 40) key = 'land';
      else if (Math.abs(P.vx) > 10) { key = 'run'; frame = Math.floor(P.anim * 13) % 6; }
      const k = P.sqT > 0 ? P.sqT / 0.12 : 0, sx = 1 + (P.sqX - 1) * Math.min(1, k), sy = 1 + (P.sqY - 1) * Math.min(1, k);
      const br = key === 'idle' ? 1 + 0.018 * Math.sin(P.anim * 2.6) : 1; // at rest, he breathes
      drawSet(K, key, frame, P.x - cx, P.y - cy, P.face, false, sx * (2 - br), sy * br);
      drawSwing(cx, cy);
      if (P.aegis) { const k = 0.5 + 0.5 * Math.sin(time * 8), ex = Math.round(P.x - cx), ey = Math.round(P.y - cy) - 12; g.globalAlpha = 0.14 + 0.08 * k; g.fillStyle = '#fff6c8'; g.beginPath(); g.ellipse(ex, ey, 17, 19, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 0.55 + 0.3 * k; g.strokeStyle = '#ffd36b'; g.lineWidth = 1; g.beginPath(); g.ellipse(ex, ey, 17 + k, 19 + k, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; } // the AEGIS
      if (isPyro() && P.full) { const k = 0.5 + 0.5 * Math.sin(time * 9); g.globalAlpha = 0.18 + 0.14 * k; g.fillStyle = '#ffd36b'; g.beginPath(); g.ellipse(Math.round(P.x - cx), Math.round(P.y - cy) - 9, 11 + k * 2, 14 + k * 2, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; }
      if (isPyro() && P.jet) { const jx = Math.round(P.x - cx) + P.face * 8, jy = Math.round(P.y - cy) - 9, f = time * 30; g.globalAlpha = 0.55; for (let i = 0; i < 6; i++) { const k = i / 6, w = 7 + k * 7 + Math.sin(f + i) * 2, len = jetLen() / 6 + 2; g.fillStyle = k < 0.25 ? '#fff6c8' : k < 0.6 ? '#ffd36b' : '#ff9a5c'; g.fillRect(Math.round(P.face > 0 ? jx + k * jetLen() : jx - k * jetLen() - len), Math.round(jy - w / 2 + Math.sin(f * 0.7 + i * 2) * 1.5), len, Math.round(w)); } g.globalAlpha = 1; }
      if (P.torch > 0) { const tx = Math.round(P.x - cx) - P.face * 7, ty = Math.round(P.y - cy) - 12; g.fillStyle = '#5c3a1d'; g.fillRect(tx - 1, ty - 2, 2, 8); const f = Math.floor(time * 12) % 3; g.fillStyle = '#ff9a5c'; g.fillRect(tx - 2, ty - 7 - (f === 1 ? 1 : 0), 4, 5); g.fillStyle = '#ffd36b'; g.fillRect(tx - 1, ty - 6, 2, 3); }
      if (P.asleep > 0) text('z', Math.round(P.x - cx) + 8 + Math.round(Math.sin(time * 4) * 2), Math.round(P.y - cy) - 26 - Math.round((time * 10) % 8), '#c9a0ff', 'center');
      else if ((P.sleepM || 0) > 0.2) { g.fillStyle = '#c9a0ff'; g.fillRect(Math.round(P.x - cx) - 8, Math.round(P.y - cy) - 24, Math.round(16 * Math.min(1, P.sleepM / 1.3)), 2); }
    }
  }
  drawSlide(cx, cy); drawBeams(cx, cy);
  if (wisp) { const x = Math.round(wisp.x - cx), y = Math.round(wisp.y - cy), f = Math.floor(time * 12) % 3; g.globalAlpha = 0.35; g.fillStyle = '#ffd36b'; g.beginPath(); g.arc(x, y, 7, 0, 7); g.fill(); g.globalAlpha = 1; g.fillStyle = '#ff9a5c'; g.fillRect(x - 2, y - 2 - f, 4, 5); g.fillStyle = '#ffd36b'; g.fillRect(x - 1, y - 1 - f, 2, 3); g.fillStyle = '#fff6c8'; g.fillRect(x - 1, y + 1 - f, 2, 1); }
  if (L.palette && (L.palette.dress === 'wood' || L.palette.dress === 'marsh') && !L.night && !L.dark && SET.weather && SET.ambient) { // shafts of low sun through the leaves
    g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 5; i++) { const sx = ((i * 97 + 40) - cx * 0.35) % (VW + 120) - 60 + Math.sin(time * 0.3 + i) * 6; const a = 0.035 + 0.02 * Math.sin(time * 0.5 + i * 1.7); g.fillStyle = 'rgba(255,225,160,' + a.toFixed(3) + ')'; g.beginPath(); g.moveTo(sx, -10); g.lineTo(sx + 26, -10); g.lineTo(sx + 26 + 60, VH + 10); g.lineTo(sx + 60 - 8, VH + 10); g.closePath(); g.fill(); } g.restore(); }
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
  drawCritters(cx, cy);
  if (thrown) { const s = thrown; g.save(); g.translate(Math.round(s.x - cx), Math.round(s.y - cy)); g.rotate(s.t * 22 * s.dir); g.drawImage(SHIELD_ICON, -5, -6); g.restore(); if (Math.random() < 0.5) parts.push({ x: s.x, y: s.y, vx: 0, vy: 0, life: 0.15, max: 0.15, col: '#c9d1dc', size: 1, grav: 0 }); }
  for (const r of rings) { const k = r.t / r.life; g.globalAlpha = 1 - k; g.strokeStyle = r.col; g.lineWidth = k < 0.5 ? 2 : 1; g.beginPath(); g.arc(Math.round(r.x - cx), Math.round(r.y - cy), 2 + r.r * Math.pow(k, 0.6), 0, 7); g.stroke(); }
  g.globalAlpha = 1; g.lineWidth = 1;
  for (const i of impacts) { const set = i.kind === 'steel' ? PROP.impactSteel : i.kind === 'red' ? PROP.impactRed : PROP.impact; const c = set[i.t < 0.07 ? 0 : 1]; const sc = i.kind === 'plunge' ? 1.5 : 1; g.drawImage(c, Math.round(i.x - cx - 8 * sc), Math.round(i.y - cy - 8 * sc), 16 * sc, 16 * sc); }
  drawParts(cx, cy);
  g.globalAlpha = 1;
  for (const pl of pollen) { if (pl.glitter) { const k = 0.5 + 0.5 * Math.sin(pl.t * 6); if (k > 0.55) { g.globalAlpha = (k - 0.55) * 2; g.fillStyle = k > 0.92 ? '#eefaff' : '#bfe6f5'; g.fillRect(Math.round(pl.x - cx), Math.round(pl.y - cy), 1, 1); if (k > 0.9) { g.fillRect(Math.round(pl.x - cx) - 1, Math.round(pl.y - cy), 3, 1); g.fillRect(Math.round(pl.x - cx), Math.round(pl.y - cy) - 1, 1, 3); } g.globalAlpha = 1; } } else if (pl.wind) { g.globalAlpha = 0.35; g.fillStyle = '#fff6e0'; g.fillRect(Math.round(pl.x - cx), Math.round(pl.y - cy), 6, 1); g.globalAlpha = 1; } else if (pl.bee) { g.fillStyle = Math.floor(pl.t * 20) % 2 ? '#e0b040' : '#1b1626'; g.fillRect(Math.round(pl.x - cx), Math.round(pl.y - cy), 2, 1); } else if (pl.ember) { g.globalAlpha = Math.min(1, pl.life); g.fillStyle = Math.random() < 0.5 ? '#ff9a5c' : '#ffd36b'; g.fillRect(Math.round(pl.x - cx), Math.round(pl.y - cy), 1, 1); g.globalAlpha = 1; } else if (pl.mote) { g.globalAlpha = 0.4 + 0.3 * Math.sin(pl.t * 2); g.fillStyle = '#ffd0dc'; g.fillRect(Math.round(pl.x - cx), Math.round(pl.y - cy), 1, 1); g.globalAlpha = 1; } else if (pl.spore) { g.globalAlpha = 0.35 + 0.35 * Math.sin(pl.t * 2); g.drawImage(L.violet ? PROP.moteV : PROP.moteT, Math.round(pl.x - cx), Math.round(pl.y - cy)); } else if (pl.smoke) { g.globalAlpha = 0.18 * Math.min(1, pl.life); g.fillStyle = '#9aa39a'; g.fillRect(Math.round(pl.x - cx) - 2, Math.round(pl.y - cy) - 1, 4, 3); } else { g.globalAlpha = 0.35 + 0.35 * Math.sin(pl.t * 3); g.fillStyle = '#fff6c8'; g.fillRect(Math.round(pl.x - cx), Math.round(pl.y - cy), 1, 1); } }
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
  if (L.fog && L.fog.length && state !== 'win') { // marsh fog: a bank you see through only near yourself and the wisps
    if (!FOGC || FOGC.width !== VW || FOGC.height !== VH) { FOGC = document.createElement('canvas'); FOGC.width = VW; FOGC.height = VH; }
    const fg = FOGC.getContext('2d'); fg.globalCompositeOperation = 'source-over'; fg.clearRect(0, 0, VW, VH); let any = false;
    for (const z of L.fog) { if (z.x1 < cx || z.x0 > cx + VW) continue; const ws = props.filter(pr => pr.t === 'wisp' && pr.x >= z.x0 && pr.x <= z.x1), cut = ws.filter(w => w.cut).length; const a = z.alpha * (ws.length ? 1 - cut / ws.length : 1); if (a <= 0.02) continue; any = true; const x0 = Math.max(0, Math.round(z.x0 - cx)), x1 = Math.min(VW, Math.round(z.x1 - cx)); const gr = fg.createLinearGradient(x0, 0, x0 + 24, 0); fg.fillStyle = 'rgba(196,212,204,' + a.toFixed(3) + ')'; fg.fillRect(x0 + 12, 0, Math.max(0, x1 - x0 - 24), VH); const ge = fg.createLinearGradient(x0, 0, x0 + 12, 0); ge.addColorStop(0, 'rgba(196,212,204,0)'); ge.addColorStop(1, 'rgba(196,212,204,' + a.toFixed(3) + ')'); fg.fillStyle = ge; fg.fillRect(x0, 0, 12, VH); const ge2 = fg.createLinearGradient(x1 - 12, 0, x1, 0); ge2.addColorStop(0, 'rgba(196,212,204,' + a.toFixed(3) + ')'); ge2.addColorStop(1, 'rgba(196,212,204,0)'); fg.fillStyle = ge2; fg.fillRect(x1 - 12, 0, 12, VH); }
    if (any) { fg.globalCompositeOperation = 'destination-out'; const hole = (x, y, r) => { const gr = fg.createRadialGradient(x, y, r * 0.3, x, y, r); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); fg.fillStyle = gr; fg.fillRect(x - r, y - r, r * 2, r * 2); }; if (!P.dead) hole(P.x - cx, P.y - 8 - cy, 46); for (const pr of props) if (pr.t === 'wisp' && !pr.cut) hole(pr.x - cx, pr.y - 4 - cy, 30); g.drawImage(FOGC, 0, 0); }
  }
  drawBloom(cx, cy); drawWindFx(); drawSpiderSigns(cx, cy);
  if (L.dark && (L.dark > 0.05 || (L.darkZones || []).some(z => P.x > z.x0 - 200 && P.x < z.x1 + 200 && P.y > z.y0 - 100 && P.y < z.y1 + 100) || darkNow > 0.05)) { // the mine: black, with holes for every lamp, fire and the light you carry
    if (!DARKC || DARKC.width !== VW || DARKC.height !== VH) { DARKC = document.createElement('canvas'); DARKC.width = VW; DARKC.height = VH; }
    const dg = DARKC.getContext('2d'); dg.globalCompositeOperation = 'source-over'; dg.clearRect(0, 0, VW, VH); { let dk = L.dark; for (const z of (L.darkZones || [])) if (P.x > z.x0 && P.x < z.x1 && P.y > z.y0 && P.y < z.y1) dk = z.dark; darkNow += (dk - darkNow) * 0.08; } dg.fillStyle = 'rgba(4,4,10,' + darkNow.toFixed(3) + ')'; dg.fillRect(0, 0, VW, VH); dg.globalCompositeOperation = 'destination-out';
    const hole = (x, y, r, a = 1) => { const gr = dg.createRadialGradient(x, y, r * 0.15, x, y, r); gr.addColorStop(0, 'rgba(0,0,0,' + a + ')'); gr.addColorStop(1, 'rgba(0,0,0,0)'); dg.fillStyle = gr; dg.fillRect(x - r, y - r, r * 2, r * 2); };
    for (const lt of lights) { if (lt.ref && lt.ref.t === 'grub') { if (!lt.ref.alive) continue; lt.x = lt.ref.x; lt.y = lt.ref.y - 4; } if (lt.plate && !(lt.plate.hot > 0 || lt.plate.glow > 0)) continue; if (lt.r > 0 && lt.x > cx - 120 && lt.x < cx + VW + 120 && !(lt.ref && lt.ref.dark > 0) && !(lt.lantern && !lt.lantern.lit) && !(lt.bracket && lt.bracket.taken)) hole(lt.x - cx, lt.y - cy, lt.r * 1.3); }
    for (const m of movers) if (m.kind === 'cart' && !m.gone && (m.ridden || Math.abs(m.vx) > 30)) hole(m.x + m.w / 2 - cx, m.y - cy, 66); // a cart on the move carries its own lamp
    for (const f of fires) if (f.delay <= 0) hole(f.x - cx, f.y - 8 - cy, 44);
    if (wisp) hole(wisp.x - cx, wisp.y - cy, 56);
    for (const b of embers) hole(b.x - cx, b.y - cy, 36);
    for (const b of pyres) hole(b.x - cx, b.y - cy, 70);
    for (const sd of seeds) if (sd.lantern && !sd.dead) hole(sd.x - cx, sd.y - cy, 40);
    for (const pr of props) if (pr.t === 'gas' && pr.lit > 0) hole(pr.x - cx, pr.y - cy, 50);
    if (!P.dead) hole(P.x - cx, P.y - 8 - cy, playerLight() * (0.95 + 0.05 * Math.sin(time * 9)));
    g.drawImage(DARKC, 0, 0);
    { const gx0 = Math.floor(cx / TS), gy0 = Math.floor(cy / TS); const ORE = ['#ffd36b', '#e07a4a', '#dfe8f0', '#ffd36b']; // veins of ore glint in the rock
      for (let ty = gy0; ty <= gy0 + Math.ceil(VH / TS); ty++) for (let tx = gx0; tx <= gx0 + Math.ceil(VW / TS); tx++) { if (tx < 1 || ty < 1 || tx >= LW - 1 || ty >= LH - 1 || L.grid[ty * LW + tx] !== T.SOLID) continue; const hsh = ((tx * 73856093) ^ (ty * 19349663)) >>> 0; if ((hsh % 100) >= 7) continue; if (tileAt(tx - 1, ty) !== T.AIR && tileAt(tx + 1, ty) !== T.AIR && tileAt(tx, ty - 1) !== T.AIR && tileAt(tx, ty + 1) !== T.AIR) continue;
        const tw = 0.5 + 0.5 * Math.sin(time * (2 + (hsh % 5) * 0.4) + hsh % 17); g.globalAlpha = 0.25 + 0.6 * tw; g.fillStyle = ORE[hsh % 4]; const ox = tx * TS + 3 + (hsh >> 3) % 10, oy = ty * TS + 3 + (hsh >> 7) % 10; g.fillRect(ox - cx, oy - cy, 2, 1); g.fillRect(ox - cx, oy - cy - 1, 1, 3); }
      g.globalAlpha = 1; }
  }
  if (L.night || L.glowNight) { // the camp at night: a dark wash, then warm pools of torchlight and a glow around the knight (a glow-only wood skips the wash)
    if (L.night) { g.fillStyle = 'rgba(8,10,30,' + (L.nightA !== undefined ? L.nightA : 0.42) + ')'; g.fillRect(0, 0, VW, VH); }
    g.globalCompositeOperation = 'lighter';
    const glow = (x, y, r, a) => { const gr = g.createRadialGradient(x, y, 2, x, y, r); gr.addColorStop(0, 'rgba(255,170,80,' + a + ')'); gr.addColorStop(1, 'rgba(255,120,40,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); };
    for (const lt of lights) if (lt.x > cx - 60 && lt.x < cx + VW + 60 && !(lt.ref && lt.ref.dark > 0) && !(lt.lantern && !lt.lantern.lit)) { if (lt.glow) { const gr = g.createRadialGradient(lt.x - cx, lt.y - cy, 2, lt.x - cx, lt.y - cy, lt.r); gr.addColorStop(0, lt.pink ? 'rgba(255,160,200,0.34)' : 'rgba(90,200,210,0.34)'); gr.addColorStop(1, 'rgba(40,120,140,0)'); g.fillStyle = gr; g.fillRect(lt.x - cx - lt.r, lt.y - cy - lt.r, lt.r * 2, lt.r * 2); } else glow(lt.x - cx, lt.y - cy, lt.r + Math.sin(time * 9 + lt.x) * 2, 0.32); }
    for (const f of fires) if (f.delay <= 0 && f.x > cx - 40 && f.x < cx + VW + 40) glow(f.x - cx, f.y - 8 - cy, 30, 0.35);
    for (const pr of props) if (pr.t === 'brazier' && pr.lit) glow(pr.x - cx, pr.y - 12 - cy, 44, 0.3);
    if (!P.dead && L.night) glow(P.x - cx, P.y - 8 - cy, 48, L.glowNight ? 0.1 : 0.16);
    if (mother) { const gr = g.createRadialGradient(mother.x - cx, L.arena.floor - 96 - cy, 10, mother.x - cx, L.arena.floor - 96 - cy, 110); gr.addColorStop(0, 'rgba(180,100,220,0.3)'); gr.addColorStop(1, 'rgba(120,60,160,0)'); g.fillStyle = gr; g.fillRect(mother.x - cx - 110, L.arena.floor - 206 - cy, 220, 220); }
    g.globalCompositeOperation = 'source-over';
  }
  if (killFlash > 0 && SET.flashes) { g.fillStyle = 'rgba(255,255,255,' + (killFlash * 9) + ')'; g.fillRect(0, 0, VW, VH); }
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
// The Mother Cap: drawn from shapes; stalk, cap, gills, and the heart once she tips.
function drawMother(cx, cy) {
  const m = mother, floor = L.arena.floor, x = Math.round(m.x - cx), fy = Math.round(floor - cy);
  const tip = m.tipped ? 1 : m.mode === 'tip' ? Math.min(1, 1 - m.modeT / 1.6) : 0;
  const shakeX = m.mode === 'shake' ? Math.round(Math.sin(time * 40) * 3) : 0;
  // her breath IS the fight, so it is on her body: sealed she draws in and narrows, open she flares and lights up
  const open = !!m.gillsOpen && m.mode !== 'open', torn = m.tipped || m.mode === 'open';
  if (m.openWas !== open) { m.openWas = open; m.openT0 = time; }
  const ease = Math.min(1, (time - (m.openT0 || 0)) / 0.35); m.breathK = open ? ease : 1 - ease;
  const swell = 1 + m.breathK * 0.055, breathe = (1 + Math.sin(time * 1.2) * 0.02) * swell;
  const capY = fy - 96 + Math.round(Math.sin(time * 1.2) * 2) - Math.round(m.breathK * 3);
  const MC = PROP.motherCap;
  g.drawImage(MC.stalk, x - 16, fy - 100);
  g.save(); g.translate(x + shakeX, capY); g.rotate(tip * 0.45); g.scale(breathe, 1 / breathe);
  g.drawImage(torn ? MC.capTorn : open ? MC.capOpen : MC.cap, -80, -34);
  g.restore();
  if (open && !torn) { g.globalAlpha = 0.10 + 0.06 * Math.sin(time * 3); g.fillStyle = '#c9a0ff'; g.beginPath(); g.ellipse(x, capY + 16, 78, 22, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; }
  if (Math.random() < 0.12) parts.push({ x: m.x + 20 + Math.random() * 60, y: capY + cy + 8, vx: 0, vy: 30, life: 0.9, max: 0.9, col: '#b8c060', size: Math.random() < 0.4 ? 2 : 1, grav: 160 });
  // eyes under the cap, watching
  if (!m.tipped) { const ex = x + Math.sign(P.x - m.x) * 3, blink = Math.floor(time * 0.7) % 7 === 0; g.fillStyle = '#ffd0ff'; if (!blink) { g.fillRect(ex - 24, capY + 4, 5, 3); g.fillRect(ex + 19, capY + 4, 5, 3); g.fillStyle = '#1b1626'; g.fillRect(ex - 23 + Math.sign(P.x - m.x), capY + 5, 2, 2); g.fillRect(ex + 20 + Math.sign(P.x - m.x), capY + 5, 2, 2); } else { g.fillRect(ex - 24, capY + 5, 5, 1); g.fillRect(ex + 19, capY + 5, 5, 1); } }
  // the heart, once exposed
  const heart = enemies.find(e => e.alive && e.t === 'heart');
  if (heart) { const hx = Math.round(heart.x - cx), hy = Math.round(heart.y - 6 - cy); const pulse = 1 + Math.sin(time * 6) * 0.12; g.globalAlpha = 0.5; g.fillStyle = '#ff7a9a'; g.beginPath(); g.ellipse(hx, hy, 14 * pulse, 12 * pulse, 0, 0, 7); g.fill(); g.globalAlpha = 1; g.fillStyle = '#c9463d'; g.beginPath(); g.ellipse(hx, hy, 7 * pulse, 6 * pulse, 0, 0, 7); g.fill(); g.fillStyle = '#ffd0ff'; g.fillRect(hx - 3, hy - 3, 2, 2); if (heart.flash > 0) { g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(hx, hy, 8, 7, 0, 0, 7); g.fill(); } }
}
function drawHeroCard() { // who you are right now: the numbers behind the bars
  g.fillStyle = 'rgba(10,14,12,0.75)'; g.fillRect(0, 0, VW, VH);
  const x = 20, y = 6, w = VW - 40, h = VH - 12; panel(x, y, w, h);
  const H = HEROES.find(k => k.id === hero()) || HEROES[0]; text(H.name, VW / 2, y + 6, UI.title, 'center');
  drawSet(K, 'idle', Math.floor(time * 3) % 4, x + 30, y + 52, 1, false);
  const sk = skillNow(), skName = sk ? (ABILITIES.find(a => a.id === sk) || {}).name : 'NONE', ch = PROG.charm && PROG.charms[PROG.charm] ? (CHARMS.find(c => c.id === PROG.charm) || {}).name : 'NONE';
  const cleared = LEVELS.filter(l => !l.hidden && PROG[l.id] && PROG[l.id].cleared).length, total = LEVELS.filter(l => !l.hidden).length;
  const rows = [['health', String(P.maxHp)], ['stamina', String(P.maxSt)], ['damage', String(swordDmg())], ['sword', sword().name], ['skill', skName], ['charm', ch], ['skin', (skinById(PROG.skin) || {}).name || ''], ['levels', cleared + ' / ' + total], ['gold', String(PROG.coins)], ['silver', silverAvail() + ' spare']];
  rows.forEach(([a, b], i) => { const yy = y + 20 + i * 11; text(a, x + 62, yy, '#9aa39a'); text(b, x + w - 8, yy, '#fff6e0', 'right'); });
  text('Z  TAKE THIS HERO TRIAL', VW / 2, y + h - 32, UI.sel, 'center', 6); const tr = 'hero level ' + heroLevel() + '   skill points ' + ptsSpent(hero()) + ' of ' + ptsTotal() + '   tonics ' + (PROG.tonics || 0); text(tr, VW / 2, y + h - 22, '#8fd160', 'center', 6);
  text('ESC back', VW / 2, y + h - 10, '#9aa39a', 'center');
}
function drawControls() {
  g.fillStyle = 'rgba(10,14,12,0.75)'; g.fillRect(0, 0, VW, VH);
  const x = 20, y = 6, w = VW - 40, h = VH - 12; panel(x, y, w, h);
  text('CONTROLS', VW / 2, y + 6, UI.title, 'center');
  const rows = [['move', 'ARROWS / WASD', 'STICK'], ['jump', SET.swapZX ? 'X / SPACE' : 'Z / SPACE', 'A'], ['swing', SET.swapZX ? 'Z / J' : 'X / J', 'X'], ['plunge', 'DOWN+SWING IN AIR', 'DOWN+X'], ['block', 'C / L ' + (SET.blockToggle ? 'TOGGLE' : 'HOLD'), 'LB RB'], ['dodge', 'V / SHIFT', 'B'], ['skill', 'F / B (equipped)', 'Y'], ['talk', 'E / T (signs, folk)', 'D-PAD UP'], ['pause', 'ESC / P', 'START'], ['drop', 'DOWN ON A LEDGE', 'DOWN'], ['shrine', 'R (RETURN)', '']];
  text('keyboard', x + 66, y + 20, '#9aa39a'); text('pad', x + w - 10, y + 20, '#9aa39a', 'right');
  rows.forEach(([a, b, c], i) => { const yy = y + 32 + i * 12; text(a, x + 8, yy, UI.text); text(b, x + 66, yy, '#c9d1dc'); const btn = { A: '#8fd160', B: '#ff6b6b', X: '#5aa0e0', Y: '#ffd36b' }[c]; if (btn) { g.fillStyle = btn; g.beginPath(); g.arc(x + w - 12, yy + 4, 5, 0, 7); g.fill(); text(c, x + w - 12, yy + 1, '#1b1626', 'center', 6); } else text(c, x + w - 8, yy, '#c9d1dc', 'right', c.length > 6 ? 6 : 8); });
  text('ESC back', VW / 2, y + h - 10, '#9aa39a', 'center');
}
function drawSoundTest() {
  g.fillStyle = 'rgba(10,14,12,0.75)'; g.fillRect(0, 0, VW, VH);
  const x = 24, y = 6, w = VW - 48, h = VH - 12; panel(x, y, w, h);
  text('SOUND TEST', VW / 2, y + 6, UI.title, 'center');
  const cats = ['EFFECTS', 'MUSIC', 'AMBIENCE'], lists = [SFX_NAMES(), MUSIC_NAMES, AMBIENT_NAMES], list = lists[soundCat];
  cats.forEach((c, i) => { const sel = i === soundCat; text((sel ? '< ' : '') + c + (sel ? ' >' : ''), x + w / 2 + (i - 1) * 84, y + 18, sel ? '#8fd160' : '#9aa39a', 'center'); });
  const cols = soundCat === 0 ? 3 : 1, rows = 11, perPage = cols * rows, page = Math.floor(soundI / perPage), start = page * perPage;
  for (let i = start; i < Math.min(list.length, start + perPage); i++) { const k = i - start, cx0 = x + 10 + (k % cols) * (w - 20) / cols, cy0 = y + 32 + Math.floor(k / cols) * 11, sel = i === soundI; if (sel) text('>', cx0 - 2, cy0, '#8fd160'); text(list[i], cx0 + 8, cy0, sel ? '#fff6e0' : '#c9d1dc'); }
  if (list.length > perPage) text('page ' + (page + 1) + '/' + Math.ceil(list.length / perPage), x + w - 8, y + h - 20, '#9aa39a', 'right');
  text('Z play   LEFT/RIGHT group   ESC back', VW / 2, y + h - 10, '#9aa39a', 'center');
}
const UI = { text: '#e8dcc0', title: '#f2e8d0', dim: '#9aa39a', border: '#c9b27c', sel: '#8fd160', gold: '#ffd34a', silver: '#dfe8ff' };
function panel(x, y, w, h, col = UI.border) {
  g.fillStyle = 'rgba(20,16,30,0.92)'; g.fillRect(x, y, w, h);
  g.strokeStyle = col; g.lineWidth = 1; g.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  g.strokeStyle = 'rgba(255,255,255,0.12)'; g.strokeRect(x + 2.5, y + 2.5, w - 5, h - 5);
  g.fillStyle = col; for (const [cx, cy] of [[x, y], [x + w - 3, y], [x, y + h - 3], [x + w - 3, y + h - 3]]) g.fillRect(cx, cy, 3, 3);
}
function drawMenu() {
  const open = Math.min(1, (time - menuSince) / 0.22), eo = 1 - Math.pow(1 - open, 3);
  g.fillStyle = 'rgba(10,14,12,' + (0.7 * eo).toFixed(3) + ')'; g.fillRect(0, 0, VW, VH);
  const x = 54, y = 6 + Math.round((1 - eo) * -14), w = VW - 108, h = 168;
  panel(x, y, w, h);
  text(menuKind === 'pause' ? 'PAUSED' : 'SETTINGS', VW / 2, y + 6, UI.title, 'center');
  if (menuFrom === 'play' && L) text(LEVELS[levelIndex].name + '  ' + fmt(levelTime), VW / 2, y + h - 22, '#9aa39a', 'center');
  const M = menuItems();
  const off = Math.max(0, Math.min(M.length - MENU_ROWS, menuI - MENU_ROWS + 2));
  if (off > 0) text('^', x + w - 12, y + 14, '#9aa39a', 'center'); if (off + MENU_ROWS < M.length) text('v', x + w - 12, y + h - 22, '#9aa39a', 'center');
  { const want = y + 22 + (menuI - off) * 12; menuBarY = menuBarY === null || Math.abs(menuBarY - want) > 60 ? want : menuBarY + (want - menuBarY) * 0.35;
    if (!isHeader(M[menuI])) { g.fillStyle = 'rgba(143,209,96,0.13)'; g.fillRect(x + 5, Math.round(menuBarY) - 2, w - 10, 11); g.fillStyle = UI.sel; g.fillRect(x + 5, Math.round(menuBarY) - 2, 2, 11); } }
  M.forEach((k, i) => {
    if (i < off || i >= off + MENU_ROWS) return;
    const yy = y + 22 + (i - off) * 12, sel = i === menuI; const dim = (k === 'Back to shrine' || k === 'Restart level') && menuFrom !== 'play'; const col = sel ? (dim ? '#c9c2b4' : '#fff6e0') : (dim ? '#5a5f5a' : '#9aa39a');
    if (isHeader(k)) { const hw = k.length * 4 + 10; g.fillStyle = 'rgba(255,211,107,0.25)'; g.fillRect(x + 12, yy + 3, w / 2 - hw - 12, 1); g.fillRect(x + w / 2 + hw, yy + 3, w / 2 - hw - 12, 1); text(k, x + w / 2, yy, '#ffd36b', 'center'); return; }
    text(k, x + 16 + (sel ? 2 : 0), yy, col);
    const onoff = v => v ? 'ON' : 'OFF';
    const v = k === 'Sound test' || k === 'Settings' || k === 'Back' || k === 'Return to map' || k === 'Controls' ? '' : k === 'Brightness' ? Math.round(SET.bright * 100) + '%' : k === 'Parallax' ? SET.parallax.toUpperCase() : k === 'Arena tint' ? SET.tint.toUpperCase() : k === 'Particles' ? SET.parts.toUpperCase() : k === 'Foe outline' ? onoff(SET.rim) : k === 'Film grain' ? onoff(SET.grain) : k === 'HUD' ? SET.hud.toUpperCase() : k === 'Screen filter' ? SET.filter.toUpperCase() : k === 'Foe health' ? onoff(SET.foeBars) : k === 'Look down' ? onoff(SET.lookDown) : k === 'Boss intro' ? onoff(SET.bossIntro) : k === 'Rumble' ? onoff(SET.rumble) : k === 'Tenths' ? onoff(SET.tenths) : k === 'Flashes' ? onoff(SET.flashes) : k === 'Vignette' ? onoff(SET.vignette) : k === 'Weather' ? onoff(SET.weather) : k === 'Impact FX' ? onoff(SET.impact) : k === 'Tips' ? onoff(SET.tips) : k === 'Block' ? (SET.blockToggle ? 'TOGGLE' : 'HOLD') : k === 'Text speed' ? (SET.textFast ? 'FAST' : 'NORMAL') : k === 'Reduce motion' ? onoff(SET.reduceMotion) : k === 'Music' ? onoff(SET.music) : k === 'Iron Knight' ? onoff(SET.iron) : k === 'God mode' ? onoff(SET.godmode) : k === 'Invincible' ? onoff(SET.invincible) : k === 'Camera' ? (SET.zoom === 'wide' ? 'WIDE' : 'CLOSE') : k === 'Effects vol' ? Math.round(SET.sfx * 100) + '%' : k === 'Music volume' ? Math.round(SET.musicVol * 100) + '%' : k === 'Screen shake' ? (SET.shakeAmt === 0 ? 'OFF' : SET.shakeAmt < 1 ? 'LOW' : 'FULL') : k === 'Sound FX' ? (SET.sfxFiles ? 'FILES' : 'SYNTH') : k === 'Hit stop' ? onoff(SET.hitstop) : k === 'Hit numbers' ? onoff(SET.numbers) : k === 'Timer' ? onoff(SET.timer) : k === 'Ambient life' ? onoff(SET.ambient) : k === 'Difficulty' ? (menuFrom === 'play' && L && !L.shop ? DIFF[diffOf(curId())].label + ' HERE' : DIFF[SET.difficulty].label + ' (DEFAULT)') : k === 'Swap Z / X' ? (SET.swapZX ? 'X jump' : 'Z jump') : k === 'Scanlines' ? onoff(SET.scanlines) : k === 'Pixel scale' ? String(SET.scale).toUpperCase() : k === 'Game speed' ? (SET.speed === 1 ? 'FULL' : Math.round(SET.speed * 100) + '%') : k === 'Jump assist' ? onoff(SET.assist) : k === 'Ambience vol' ? Math.round(SET.ambVol * 100) + '%' : k === 'UI volume' ? Math.round(SET.uiVol * 100) + '%' : k === 'Big text' ? onoff(SET.bigText) : k === 'FPS counter' ? onoff(SET.fps) : k === 'Colour tells' ? onoff(SET.colorSafe) : k === 'Hero' ? '' : '';
    if (v) { const vw = String(v).length * 6 + (sel ? 22 : 8); g.fillStyle = sel ? 'rgba(143,209,96,0.22)' : 'rgba(255,255,255,0.06)'; g.fillRect(x + w - 10 - vw, yy - 1, vw, 9); text(sel ? '< ' + v + ' >' : String(v), x + w - 14, yy, col, 'right'); }
  });
  { const k = M[menuI], tip = SETTING_TIPS[k];
    if (menuMsgT > 0 && menuMsg) text(menuMsg, VW / 2, y + h - 12, '#ffd36b', 'center');
    else if (tip) text(tip, VW / 2, y + h - 12, '#9aa39a', 'center', 6);
    else text('ESC close', VW / 2, y + h - 12, '#9aa39a', 'center'); }
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
      if (p) { text(fmt(p.best), x + w - 8, y + 6, '#dfe8ff', 'right'); g.drawImage(PROP.coin[0], x + w - 52, y + 18); text(p.gold + '/' + p.total, x + w - 8, y + 19, '#ffd34a', 'right'); if (p.cleared) text('CLEARED', x + 8, y + 30, '#8fd160'); { const sv = [1, 2, 4].filter(b => (p.silver || 0) & b).length; g.drawImage(PROP.silver[0], x + w - 52, y + 30); text(sv + '/3', x + w - 8, y + 31, sv === 3 ? '#ffffff' : '#9aa3b0', 'right'); } }
      else text('not yet', x + w - 8, y + 30, '#9aa39a', 'right');
    }
  });
  text('Z  play     X  bestiary     ESC  back', VW / 2, VH - 14, '#9aa39a', 'center');
}
// Title illustration: dusk in the wood, the mountain the whole game climbs on the skyline - the Sunspire
// catching the last light and the Queen's castle on the peak beyond it - a knight at a campfire before
// the great gate, and the menu on its own board to the right so it never sits on the picture.
let titleLeaves = [], HORIZON = null, titleSince = 0;
function bakeHorizon() {
  const W = 480, H = 96, [c, hg] = canvas(W, H), rnd = mulberry(4242);
  const ridge = (base, amp, col, rim, step) => { hg.fillStyle = col; hg.beginPath(); hg.moveTo(0, H); let y = base;
    const pts = []; for (let x = 0; x <= W; x += step) { y = Math.max(base - amp, Math.min(base + amp * 0.3, y + (rnd() - 0.55) * amp * 0.5)); pts.push([x, y]); hg.lineTo(x, y); }
    hg.lineTo(W, H); hg.closePath(); hg.fill(); hg.fillStyle = rim; for (const [x, yy] of pts) if (rnd() < 0.7) hg.fillRect(x, Math.round(yy), step, 1); };
  ridge(70, 26, '#3a3050', 'rgba(255,190,160,0.35)', 6);
  // the Sunspire: a great blade of crystal with the sun still on one edge of it
  const sx = 300; hg.fillStyle = '#4a5a7a'; hg.beginPath(); hg.moveTo(sx - 22, 72); hg.lineTo(sx - 4, 6); hg.lineTo(sx + 2, 0); hg.lineTo(sx + 8, 10); hg.lineTo(sx + 26, 72); hg.closePath(); hg.fill();
  hg.fillStyle = '#8fb8d8'; hg.beginPath(); hg.moveTo(sx + 2, 0); hg.lineTo(sx + 8, 10); hg.lineTo(sx + 26, 72); hg.lineTo(sx + 12, 72); hg.closePath(); hg.fill();
  hg.fillStyle = '#dff2ff'; hg.fillRect(sx + 2, 1, 1, 6); hg.fillRect(sx + 5, 8, 1, 10); hg.fillRect(sx + 9, 22, 1, 14);
  for (const [dx, h] of [[-34, 22], [-26, 30], [34, 26], [44, 18]]) { hg.fillStyle = '#56688a'; hg.beginPath(); hg.moveTo(sx + dx - 5, 72); hg.lineTo(sx + dx, 72 - h); hg.lineTo(sx + dx + 5, 72); hg.closePath(); hg.fill(); hg.fillStyle = '#a8cce4'; hg.fillRect(sx + dx, 72 - h + 2, 1, 4); }
  // the castle on the far peak, a few windows lit
  const cx = 356; hg.fillStyle = '#2a2238'; hg.beginPath(); hg.moveTo(cx - 40, 72); hg.lineTo(cx - 8, 30); hg.lineTo(cx + 10, 26); hg.lineTo(cx + 44, 72); hg.closePath(); hg.fill();
  for (const [x, w, h] of [[-8, 8, 22], [2, 10, 30], [14, 7, 18], [-16, 6, 14]]) { hg.fillRect(cx + x, 30 - h + 8, w, h); for (let k = 0; k < w; k += 3) hg.fillRect(cx + x + k, 30 - h + 6, 2, 2); }
  hg.fillRect(cx + 6, 0, 1, 10); hg.fillStyle = '#c9463d'; hg.fillRect(cx + 7, 1, 4, 3);
  hg.fillStyle = '#ffb060'; for (const [x, y] of [[-5, 22], [5, 14], [9, 20], [16, 26], [-13, 28]]) hg.fillRect(cx + x, y, 1, 2);
  ridge(84, 12, '#2a2440', 'rgba(255,190,160,0.18)', 4);
  return c;
}
const easeOutBack = k => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
function drawTitle(cx, cy) {
  if (!HORIZON) HORIZON = bakeHorizon();
  g.drawImage(BG.skyDusk, 0, 0, 1, VH, 0, 0, VW, VH);
  g.drawImage(BG.sun, Math.round(VW * 0.62), 46);
  // a few long clouds lit from under
  for (let i = 0; i < 4; i++) { const x = ((time * (3 + i) + i * 97) % (VW + 120)) - 60, y = 26 + i * 11; g.globalAlpha = 0.28; g.fillStyle = '#ffb8a0'; g.fillRect(Math.round(x), y, 46 - i * 6, 2); g.fillStyle = '#8a6a98'; g.fillRect(Math.round(x) + 6, y + 2, 34 - i * 5, 2); g.globalAlpha = 1; }
  g.globalAlpha = 0.9; drawLayer(BG.far, 0.15, VH - 90, time * 6, LH * TS - VH); g.globalAlpha = 1;
  g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgba(120,80,140,0.45)'; g.fillRect(0, 0, VW, VH); g.globalCompositeOperation = 'source-over';
  g.drawImage(HORIZON, -70, VH - 140);
  // the Sunspire glints now and then
  { const k = (time % 5) / 5; if (k < 0.12) { g.globalAlpha = Math.sin(k / 0.12 * Math.PI) * 0.8; g.fillStyle = '#ffffff'; g.fillRect(232, VH - 139 + Math.round(k * 200), 2, 5); g.globalAlpha = 1; } }
  drawLayer(BG.near, 0.55, VH - 300, 40 + time * 3, LH * TS - VH);
  g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgba(90,70,120,0.5)'; g.fillRect(0, 0, VW, VH); g.globalCompositeOperation = 'source-over';
  const gx = 36, gy = VH - 132; g.drawImage(PROP.gate, gx, gy, 120, 130);
  for (const tx of [gx - 10, gx + 122]) { const f = Math.floor(time * 10 + tx) % 3; g.fillStyle = '#5c3a1d'; g.fillRect(tx + 2, gy + 60, 3, 22); g.fillStyle = '#ff9a5c'; g.fillRect(tx, gy + 52 - (f === 1 ? 1 : 0), 7, 9); g.fillStyle = '#ffd36b'; g.fillRect(tx + 2, gy + 55, 3, 5); g.globalAlpha = 0.16 + 0.04 * Math.sin(time * 9 + tx); g.fillStyle = '#ffb060'; g.beginPath(); g.arc(tx + 3, gy + 58, 34, 0, 7); g.fill(); g.globalAlpha = 1; }
  for (const lf of titleLeaves) { g.globalAlpha = 0.85; g.fillStyle = lf.col; g.fillRect(Math.round(lf.x), Math.round(lf.y), 2, 2); g.globalAlpha = 1; }
  g.fillStyle = '#2a2230'; g.fillRect(0, VH - 22, VW, 22); for (let x = 0; x < VW; x += 16) g.drawImage(TILE.top['00'][(x / 16) % 4], x, VH - 22);
  g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgba(110,90,140,0.5)'; g.fillRect(0, VH - 22, VW, 22); g.globalCompositeOperation = 'source-over';
  // the campfire, and the knight warming his hands at it
  { const fx = 150, fy = VH - 22, fl = Math.floor(time * 9) % 3;
    g.globalCompositeOperation = 'lighter'; const gl = g.createRadialGradient(fx, fy - 6, 2, fx, fy - 6, 46 + Math.sin(time * 11) * 2); gl.addColorStop(0, 'rgba(255,170,90,0.42)'); gl.addColorStop(1, 'rgba(255,120,60,0)'); g.fillStyle = gl; g.fillRect(fx - 50, fy - 56, 100, 70); g.globalCompositeOperation = 'source-over';
    g.drawImage(PROP.campfire[fl], fx - 7, fy - 13);
    for (let i = 0; i < 7; i++) { const ph = (time * 0.8 + i / 7) % 1, sx = fx + Math.sin(i * 3.1 + time * 2) * 4 * ph + (i % 3 - 1) * 2, sy = fy - 10 - ph * 44; g.globalAlpha = (1 - ph) * 0.9; g.fillStyle = ph < 0.4 ? '#ffd36b' : '#ff9a5c'; g.fillRect(Math.round(sx), Math.round(sy), 1, 1); } g.globalAlpha = 1;
    drawSet(K, 'idle', Math.floor(time * 3) % 4, fx + 20, fy, -1, false); }
  for (const f of fireflies) { const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(f.t * 4)); g.globalAlpha = a; g.fillStyle = '#fff0a0'; g.fillRect(Math.round(f.x - camX), Math.round(f.y - camY), 2, 2); }
  g.globalAlpha = 1;
  const vg = g.createRadialGradient(VW / 2, VH / 2, 60, VW / 2, VH / 2, 220); vg.addColorStop(0, 'rgba(10,6,20,0)'); vg.addColorStop(1, 'rgba(10,6,20,0.7)'); g.fillStyle = vg; g.fillRect(0, 0, VW, VH);
}
// SCREEN TRANSITIONS. Every change of screen comes up out of the dark instead of cutting, and a level opens
// on an iris round the knight. Opening a pause menu or a talk box is not a change of screen.
let transT = 0, transKind = 'fade', transPrev = null, transLast = 0, menuSince = 0;
const OVERLAY_STATES = new Set(['menu', 'talk', 'controls', 'soundtest', 'herocard', 'win', 'gameover']);
function drawTransition() {
  const dt = Math.min(1, Math.max(0, time - transLast)); transLast = time;
  if (state !== transPrev) {
    if (state === 'title') titleSince = time;
    if (state === 'menu') menuSince = time;
    const quiet = transPrev === null || OVERLAY_STATES.has(state) || OVERLAY_STATES.has(transPrev);
    if (!quiet) { transT = 1; transKind = state === 'play' ? 'iris' : 'fade'; }
    transPrev = state;
  }
  if (transT <= 0) return;
  transT = Math.max(0, transT - dt * (transKind === 'iris' ? 2 : 3.4));
  const k = transT;
  if (transKind === 'iris' && !SET.reduceMotion) {
    const ox = state === 'play' ? Math.round(P.x - camX) : VW / 2, oy = state === 'play' ? Math.round(P.y - camY) - 8 : VH / 2;
    const r = Math.max(0.5, (1 - k) * (1 - k) * 260);
    g.fillStyle = '#08060e'; g.beginPath(); g.rect(0, 0, VW, VH); g.arc(ox, oy, r, 0, Math.PI * 2, true); g.fill();
  } else { g.fillStyle = 'rgba(8,6,14,' + (k * k).toFixed(3) + ')'; g.fillRect(0, 0, VW, VH); }
}
function desiredView() { if (state === 'editor') return 'zoom';
  const inLevel = state === 'play' || state === 'talk' || state === 'win' || state === 'gameover' || (state === 'menu' && menuFrom === 'play'); if (!inLevel) return 'normal'; return (SET.zoom === 'wide' || (bossActive && boss && (boss.t === 'mother' || boss.t === 'owl' || boss.t === 'forgemaster' || boss.t === 'golem' || boss.t === 'windcaller' || boss.t === 'king' || boss.t === 'lance' || boss.t === 'suncatcher' || boss.t === 'roc' || boss.t === 'gqueen'))) ? 'zoom' : 'normal'; }

// ==================================================================================
// THE EDITOR
// A level in BRACKEN is already a plain object - a tile grid and a list of entities -
// so the editor does not build a second model of anything. It edits L in place, and
// PLAY hands the loader a copy. Painting a tile writes L.grid; placing a foe pushes
// onto L.ents and re-runs spawnEntities(). The world you paint on is drawn by the
// game's own drawWorld, so what you see is the level.
// ==================================================================================
let edDoc = null;              // { W, H, grid, ents, theme, name, start }
let edCam = { x: 0, y: 0 }, edCur = { x: 0, y: 0 }, edCat = 0, edSel = [1, 0, 0, 0];
let edUndo = [], edShowGrid = true, edMsg = '', edMsgT = 0, edPal = false, edTesting = false;
let edPaint = 0, edPainted = null, edSlot = 0, edThemes = null;
const ED_KEY = i => 'bracken.level.' + i, ED_SLOTS = 3;

// the nine woods, borrowed for their look. Built once, the first time the editor opens.
function edThemeList() {
  if (edThemes) return edThemes;
  edThemes = LEVELS.filter(l => !l.hidden).map(l => { const b = l.build();
    return { name: l.name, palette: b.palette, weather: b.weather, ambient: b.ambient, music: b.music,
      night: b.night, glowNight: b.glowNight, nightA: b.nightA, dark: b.dark, duskStart: b.duskStart, duskLen: b.duskLen }; });
  return edThemes;
}

const ED_TILES = [['ERASE', T.AIR], ['STONE', T.SOLID], ['LEDGE', T.ONEWAY], ['SPIKES', T.SPIKE], ['CRATE', T.CRATE],
  ['PLANK', T.PLANK], ['ROPE', T.NET], ['SPRING', T.BOUNCER], ['SHELF', T.SHELF], ['DOOR', T.PORT],
  ['ROCK FACE', T.CLIMB], ['RAIL', T.RAIL], ['SOFT ROCK', T.SOFT], ['ICE', T.ICE], ['WEB', T.WEB],
  ['REEDS', T.REED], ['PALISADE', T.PALISADE]];
const ED_FOES = ['sprig', 'shield', 'spit', 'wasp', 'thorn', 'archer', 'sapper', 'brute', 'hound', 'hopper',
  'sporeling', 'lurker', 'drone', 'shaman', 'thief', 'pike', 'spider', 'squirrel', 'harpy', 'goat',
  'troll', 'bat', 'grub', 'rockgoblin', 'miner', 'hare', 'kite', 'snuffer', 'sailer'];
const ED_THINGS = ['coin', 'silver', 'check', 'gate', 'sign', 'torch', 'brazier', 'barrel', 'glow', 'puffball',
  'lantern', 'firepit', 'rockfall', 'vent', 'npc'];
const ED_TOOLS = ['START', 'THEME', 'WIDER', 'NARROWER'];
const ED_CATS = ['TILES', 'FOES', 'THINGS', 'TOOLS'];
const edItems = c => c === 0 ? ED_TILES.map(t => t[0]) : c === 1 ? ED_FOES : c === 2 ? ED_THINGS : ED_TOOLS;
const edBrush = () => ({ cat: edCat, i: edSel[edCat], name: edItems(edCat)[edSel[edCat]] });

function edSay(m) { edMsg = m; edMsgT = 2.4; }

// ---- the document, and the level object the game reads ----
function edBlank(W = 120, H = 28) {
  const grid = new Uint8Array(W * H);
  for (let x = 0; x < W; x++) for (let y = 20; y < H; y++) grid[y * W + x] = T.SOLID; // a floor to stand on
  return { W, H, grid, ents: [{ t: 'gate', x: W - 6, y: 19 }], theme: 0, name: 'A NEW WOOD', start: { x: 3, y: 19 } };
}
function edLevelObj(doc, copy) {
  const th = edThemeList()[doc.theme] || edThemeList()[0];
  return { W: doc.W, H: doc.H,
    grid: copy ? new Uint8Array(doc.grid) : doc.grid,
    ents: copy ? doc.ents.map(e => Object.assign({}, e)) : doc.ents,
    START: { x: doc.start.x, y: doc.start.y },
    pools: [], falls: [], moversExtra: [], interiors: [], stone: [], scree: [], gusts: [], ropes: [],
    palette: th.palette, weather: th.weather, ambient: th.ambient, music: th.music,
    night: th.night, glowNight: th.glowNight, nightA: th.nightA, dark: th.dark,
    duskStart: th.duskStart === undefined ? -1 : th.duskStart, duskLen: th.duskLen || 1,
    custom: true, strays: 0 };
}
const edIndex = () => LEVELS.findIndex(l => l.id === 'custom');

// put the editor's document in front of the renderer without starting the game
function edMount(rebake) {
  L = edLevelObj(edDoc, false); LW = L.W; LH = L.H;
  if (rebake) bakeAll(L.palette || {});
  grid0 = new Uint8Array(L.grid); destroyed = new Set(); cutBridges = new Set(); mending = []; marks = new Set();
  tileSpr = new Array(LW * LH).fill(null); resolveTiles();
  acorns = []; signs = []; shrines = []; gate = null; total = 0; silvers = [];
  edRespawn();
}
// entities changed: rebuild the live ones so the editor shows the real sprites
function edRespawn() {
  acorns = []; signs = []; shrines = []; gate = null; silvers = [];
  for (const e of L.ents) { const px = e.x * TS + 8, py = (e.y + 1) * TS;
    if (e.t === 'coin') acorns.push({ x: px, y: py - 6, got: false, ph: Math.random() * 6 });
    if (e.t === 'sign') signs.push({ x: px, y: py, text: e.text || 'A SIGN' });
    if (e.t === 'silver') silvers.push({ x: px, y: py - 6, i: silvers.length, got: false, ph: Math.random() * 6 });
    if (e.t === 'check') shrines.push({ x: px, y: py, lit: false });
    if (e.t === 'gate') gate = { x: px, y: py }; }
  spawnEntities();
  for (const e of enemies) { e.stagger = 1e9; e.anim = 0; } // frozen while you work
}

function edEnter() {
  edThemeList();
  if (!edDoc) edDoc = edLoad(edSlot) || edBlank();
  edTesting = false; state = 'editor'; edPal = false; edMsgT = 0;
  edMount(true); music.stop(); setView('zoom');
  edCam.x = Math.max(0, edDoc.start.x * TS - VW / 2); edCam.y = Math.max(0, LH * TS - VH);
}
function edPlay() {
  if (!edDoc.ents.some(e => e.t === 'gate')) { edSay('no way out: put a GATE down first (THINGS)'); SFX.buzz(); return; }
  edPush(); edTesting = true;
  CUSTOM.build = () => edLevelObj(edDoc, true);
  const i = edIndex(); LEVELS[i].name = edDoc.name; LEVELS[i].sub = 'made by hand';
  loadLevel(i); startGame(); edSay('');
}
function edResume() { edTesting = false; state = 'editor'; edMount(true); music.stop(); edSay('back in the editor'); }

// ---- undo ----
function edPush() { edUndo.push({ g: new Uint8Array(edDoc.grid), e: JSON.stringify(edDoc.ents), s: { x: edDoc.start.x, y: edDoc.start.y } }); if (edUndo.length > 40) edUndo.shift(); }
function edPop() {
  const u = edUndo.pop(); if (!u) { edSay('nothing to undo'); return; }
  edDoc.grid = u.g; edDoc.ents = JSON.parse(u.e); edDoc.start = u.s; edMount(false); edSay('undone'); SFX.ui();
}

// ---- save and load: run-length on the grid, because most of a level is air and stone ----
function edRLE(gr) { let out = '', run = 1; for (let i = 1; i <= gr.length; i++) { if (i < gr.length && gr[i] === gr[i - 1]) { run++; continue; } out += gr[i - 1].toString(36) + (run > 1 ? run.toString(36) : '') + '.'; run = 1; } return out; }
function edUnRLE(str, n) { const gr = new Uint8Array(n); let at = 0; for (const part of str.split('.')) { if (!part) continue; const v = parseInt(part[0], 36), c = part.length > 1 ? parseInt(part.slice(1), 36) : 1; for (let k = 0; k < c && at < n; k++) gr[at++] = v; } return gr; }
function edSave(i) {
  try { localStorage.setItem(ED_KEY(i), JSON.stringify({ v: 1, name: edDoc.name, W: edDoc.W, H: edDoc.H, theme: edDoc.theme, start: edDoc.start, ents: edDoc.ents, grid: edRLE(edDoc.grid) })); edSay('saved to slot ' + (i + 1)); SFX.medal(); }
  catch (err) { edSay('could not save'); }
}
function edLoad(i) {
  try { const raw = localStorage.getItem(ED_KEY(i)); if (!raw) return null; const d = JSON.parse(raw);
    return { W: d.W, H: d.H, grid: edUnRLE(d.grid, d.W * d.H), ents: d.ents || [], theme: d.theme || 0, name: d.name || 'A WOOD', start: d.start || { x: 3, y: 19 } }; }
  catch (err) { return null; }
}
function edResize(dw) {
  const W2 = Math.max(40, Math.min(600, edDoc.W + dw)); if (W2 === edDoc.W) { edSay(dw > 0 ? 'that is as wide as it goes' : 'that is as narrow as it goes'); return; }
  edPush(); const g2 = new Uint8Array(W2 * edDoc.H);
  for (let y = 0; y < edDoc.H; y++) for (let x = 0; x < Math.min(W2, edDoc.W); x++) g2[y * W2 + x] = edDoc.grid[y * edDoc.W + x];
  if (W2 > edDoc.W) for (let x = edDoc.W; x < W2; x++) for (let y = 20; y < edDoc.H; y++) g2[y * W2 + x] = T.SOLID;
  edDoc.grid = g2; edDoc.W = W2; edDoc.ents = edDoc.ents.filter(e => e.x < W2 - 1);
  edMount(false); edSay('width ' + W2);
}

// ---- painting ----
const edEntAt = (tx, ty) => { for (let i = L.ents.length - 1; i >= 0; i--) { const e = L.ents[i]; if (e.x === tx && e.y === ty) return i; } return -1; };
function edPlace(tx, ty, erase) {
  if (tx < 1 || ty < 0 || tx >= LW - 1 || ty >= LH) return;
  const b = edBrush(), key = tx + ':' + ty;
  if (edPainted && edPainted.has(key)) return; edPainted && edPainted.add(key);
  if (b.cat === 3) return;
  if (erase) { const i = edEntAt(tx, ty); if (i >= 0) { L.ents.splice(i, 1); edRespawn(); return; } edSetTile(tx, ty, T.AIR); return; }
  if (b.cat === 0) { edSetTile(tx, ty, ED_TILES[b.i][1]); return; }
  const t = b.cat === 1 ? ED_FOES[b.i] : ED_THINGS[b.i];
  const old = edEntAt(tx, ty); if (old >= 0) L.ents.splice(old, 1);
  const e = { t, x: tx, y: ty };
  if (t === 'sign') e.text = 'A SIGN. WRITE ON IT LATER.';
  if (t === 'npc') e.kind = 'squire';
  if (t === 'vent') { e.period = 4; e.on = 2.4; e.h = 100; }
  if (t === 'rockfall') e.every = 2.6;
  if (t === 'spider') e.drop = 100;
  if (t === 'firepit') { e.period = 3.2; e.on = 1.4; }
  L.ents.push(e); edRespawn();
}
function edSetTile(tx, ty, v) { const i = ty * LW + tx; if (L.grid[i] === v) return; L.grid[i] = v; grid0[i] = v; tileSpr[i] = null; resolveTiles(); }

// ---- input ----
function edKey(k, ev) {
  const shift = ev && ev.shiftKey, ctrl = ev && (ev.ctrlKey || ev.metaKey);
  if (ctrl && k === 'z') { edPop(); return true; }
  if (k === 'tab') { edPal = !edPal; SFX.ui(); return true; }
  if (k === 'g') { edShowGrid = !edShowGrid; return true; }
  if (k === 'r') { const nm = prompt('Name this wood', edDoc.name); if (nm) { edDoc.name = nm.toUpperCase().slice(0, 22); edSay('called ' + edDoc.name); } return true; }
  if (k === 'p' || k === 'enter') { edPlay(); return true; }
  if (k === 'escape') { if (edPal) { edPal = false; return true; } state = 'title'; music.play(menuTrack()); return true; }
  if (k >= '1' && k <= '9') { const n = +k - 1; if (n < edItems(edCat).length) { edSel[edCat] = n; SFX.ui(); } return true; }
  if (k === 'q') { edCat = (edCat + ED_CATS.length - 1) % ED_CATS.length; SFX.ui(); return true; }
  if (k === 'e') { edCat = (edCat + 1) % ED_CATS.length; SFX.ui(); return true; }
  if (k === '[') { edSel[edCat] = (edSel[edCat] + edItems(edCat).length - 1) % edItems(edCat).length; SFX.ui(); return true; }
  if (k === ']') { edSel[edCat] = (edSel[edCat] + 1) % edItems(edCat).length; SFX.ui(); return true; }
  if (k === 's') { edSave(shift ? 1 : edSlot); return true; }
  if (k === 'l') { const d = edLoad(edSlot); if (d) { edPush(); edDoc = d; edMount(true); edSay('loaded slot ' + (edSlot + 1)); } else edSay('slot ' + (edSlot + 1) + ' is empty'); return true; }
  if (k === 'n') { edPush(); edDoc = edBlank(); edMount(true); edSay('a new wood'); return true; }
  if (k === 'f') { edSlot = (edSlot + 1) % ED_SLOTS; edSay('slot ' + (edSlot + 1) + (edLoad(edSlot) ? ' (' + edLoad(edSlot).name + ')' : ' (empty)')); return true; }
  if (k === 't') { edPush(); edDoc.theme = (edDoc.theme + 1) % edThemeList().length; edMount(true); edSay(edThemeList()[edDoc.theme].name); return true; }
  if (k === 'x') { edPush(); edDoc.start = { x: edCur.x, y: edCur.y }; edSay('the knight starts here'); SFX.equip(); return true; }
  if (k === '-') { edResize(-10); return true; }
  if (k === '=' || k === '+') { edResize(10); return true; }
  return false;
}
function edMouse(mx, my, btn, down, moved) {
  // screen pixels -> the level's tiles, through the same camera the world was drawn with
  const cx = Math.round(Math.max(0, Math.min(LW * TS - VW, edCam.x))), cy = Math.round(Math.max(0, Math.min(LH * TS - VH, edCam.y)));
  edCur.x = Math.floor((mx + cx) / TS); edCur.y = Math.floor((my + cy) / TS);
  if (edPal) { if (down) edPalClick(mx, my); return; }
  if (down) { edPush(); edPainted = new Set(); edPaint = btn === 2 ? 2 : 1; }
  if (edPaint && (down || moved)) {
    const b = edBrush();
    if (b.cat === 3 && down) { // the tools act once, where you clicked
      if (b.i === 0) { edDoc.start = { x: edCur.x, y: edCur.y }; edSay('the knight starts here'); SFX.equip(); }
      else if (b.i === 1) { edDoc.theme = (edDoc.theme + 1) % edThemeList().length; edMount(true); edSay(edThemeList()[edDoc.theme].name); }
      else if (b.i === 2) edResize(10); else edResize(-10);
      return;
    }
    edPlace(edCur.x, edCur.y, edPaint === 2);
  }
}
function edPalClick(mx, my) {
  const bw = 96, bh = 11, x0 = 8, y0 = 26;
  for (let c = 0; c < ED_CATS.length; c++) { const tx = x0 + c * 54; if (mx >= tx && mx < tx + 52 && my >= 12 && my < 23) { edCat = c; SFX.ui(); return; } }
  const items = edItems(edCat);
  for (let i = 0; i < items.length; i++) { const col = Math.floor(i / 12), row = i % 12; const bx = x0 + col * (bw + 4), by = y0 + row * bh;
    if (mx >= bx && mx < bx + bw && my >= by && my < by + bh) { edSel[edCat] = i; SFX.ui(); edPal = false; return; } }
  if (my > y0 + 12 * bh) edPal = false;
}

// ---- drawing ----
function edSprFor(t) { return SPR[t] || null; }
function drawEditor() {
  if (!edDoc || !L || !L.custom) { state = 'title'; return; } // the editor is entered through the menu; never draw it half-built
  const cx = Math.round(Math.max(0, Math.min(LW * TS - VW, edCam.x))), cy = Math.round(Math.max(0, Math.min(LH * TS - VH, edCam.y)));
  camX = cx; camY = cy;
  drawWorld(cx, cy, false);
  // the grid, so you can count tiles
  if (edShowGrid) {
    g.globalAlpha = 0.18; g.fillStyle = '#ffffff';
    for (let tx = Math.floor(cx / TS); tx <= Math.floor((cx + VW) / TS); tx++) { const x = tx * TS - cx; g.fillRect(x, 0, 1, VH); }
    for (let ty = Math.floor(cy / TS); ty <= Math.floor((cy + VH) / TS); ty++) { const y = ty * TS - cy; g.fillRect(0, y, VW, 1); }
    g.globalAlpha = 0.34;
    for (let tx = Math.floor(cx / TS); tx <= Math.floor((cx + VW) / TS); tx++) if (tx % 8 === 0) g.fillRect(tx * TS - cx, 0, 1, VH);
    for (let ty = Math.floor(cy / TS); ty <= Math.floor((cy + VH) / TS); ty++) if (ty % 8 === 0) g.fillRect(0, ty * TS - cy, VW, 1);
    g.globalAlpha = 1;
  }
  // the edges of the world
  g.strokeStyle = '#c9463d'; g.lineWidth = 1; g.strokeRect(0.5 - cx, 0.5 - cy, LW * TS - 1, LH * TS - 1);
  // where the knight starts
  { const sx = edDoc.start.x * TS + 8 - cx, sy = (edDoc.start.y + 1) * TS - cy;
    g.globalAlpha = 0.75; drawSet(K, 'idle', Math.floor(time * 3) % 4, sx, sy, 1, false); g.globalAlpha = 1;
    g.fillStyle = '#8fd160'; g.fillRect(sx - 9, sy - 30, 18, 7); text('START', sx, sy - 29, '#0f1a0f', 'center', 6); }
  // the cursor
  { const x = edCur.x * TS - cx, y = edCur.y * TS - cy, b = edBrush();
    g.strokeStyle = edPaint === 2 ? '#ff6b6b' : '#ffd36b'; g.lineWidth = 1; g.strokeRect(x + 0.5, y + 0.5, TS - 1, TS - 1);
    if (b.cat === 1 || b.cat === 2) { const sp = edSprFor(b.cat === 1 ? ED_FOES[b.i] : ED_THINGS[b.i]);
      if (sp) { g.globalAlpha = 0.55; drawSet(sp, null, 0, x + 8, y + TS, 1, false); g.globalAlpha = 1; } }
  }
  // ---- chrome ----
  g.fillStyle = 'rgba(12,10,18,0.86)'; g.fillRect(0, 0, VW, 11);
  text(edDoc.name, 4, 2, UI.title, 'left', 6);
  text(edThemeList()[edDoc.theme].name, 4 + edDoc.name.length * 6 + 14, 2, UI.dim, 'left', 6);
  { const foes = L.ents.filter(e => ED_FOES.includes(e.t)).length, coins = L.ents.filter(e => e.t === 'coin').length;
    const hasGate = L.ents.some(e => e.t === 'gate');
    text(edDoc.W + 'x' + edDoc.H + '   ' + foes + ' FOES   ' + coins + ' COIN   SLOT ' + (edSlot + 1), VW - 4, 2, UI.dim, 'right', 6);
    if (!hasGate) text('NO GATE: NO WAY OUT', VW / 2, 2, '#ff6b6b', 'center', 6); }
  g.fillStyle = 'rgba(12,10,18,0.86)'; g.fillRect(0, VH - 26, VW, 26);
  { const b = edBrush(); text(ED_CATS[edCat] + '  >  ' + b.name, 4, VH - 23, UI.sel, 'left', 6);
    text(edCur.x + ',' + edCur.y, VW - 4, VH - 23, UI.dim, 'right', 6); }
  if (edMsgT > 0) text(edMsg, 4, VH - 14, UI.title, 'left', 6);
  else { text('LMB paint   RMB erase   WHEEL item   SHIFT+WHEEL group   TAB palette   ARROWS pan (hold C to fly)', 4, VH - 15, UI.dim, 'left', 6);
    text('X start  T theme  R name  -/= width  P play  S/L save/load  N new  F slot  G grid  CTRL+Z undo  ESC out', 4, VH - 8, UI.dim, 'left', 6); }
  if (edPal) drawEdPalette();
}
function drawEdPalette() {
  g.fillStyle = 'rgba(10,8,16,0.94)'; g.fillRect(0, 0, VW, VH);
  text('THE PALETTE', VW / 2, 3, UI.title, 'center');
  const bw = 96, bh = 11, x0 = 8, y0 = 26;
  ED_CATS.forEach((c, i) => { const tx = x0 + i * 54, sel = i === edCat;
    g.fillStyle = sel ? 'rgba(60,90,60,0.9)' : 'rgba(40,36,50,0.8)'; g.fillRect(tx, 12, 52, 11);
    if (sel) { g.strokeStyle = UI.sel; g.strokeRect(tx + 0.5, 12.5, 51, 10); }
    text(c, tx + 26, 15, sel ? UI.sel : UI.dim, 'center', 6); });
  const items = edItems(edCat);
  items.forEach((it, i) => { const col = Math.floor(i / 12), row = i % 12, bx = x0 + col * (bw + 4), by = y0 + row * bh, sel = i === edSel[edCat];
    if (bx + bw > VW) return;
    g.fillStyle = sel ? 'rgba(60,90,60,0.7)' : 'rgba(30,26,40,0.7)'; g.fillRect(bx, by, bw, bh - 1);
    if (sel) { g.strokeStyle = UI.sel; g.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 2); }
    const sp = edCat === 1 ? SPR[ED_FOES[i]] : edCat === 2 ? SPR[ED_THINGS[i]] : null;
    if (sp) { g.globalAlpha = 0.9; drawSet(sp, null, 0, bx + 9, by + bh - 2, 1, false, 0.55, 0.55); g.globalAlpha = 1; }
    text(it, bx + 18, by + 2, sel ? UI.title : UI.text, 'left', 6); });
  text('CLICK TO TAKE ONE   TAB OR ESC TO CLOSE', VW / 2, VH - 10, UI.dim, 'center', 6);
}

function render() {
  setView(desiredView());
  const sh = SET.shake ? shake : 0;
  const cx = Math.round(Math.max(0, Math.min(LW * TS - VW, camX)) + kick + (sh ? (Math.random() - 0.5) * sh * 2 : 0)), cy = Math.round(Math.max(0, Math.min(LH * TS - VH, camY)) + (sh ? (Math.random() - 0.5) * sh * 2 : 0)); /* never past the level's edge, whatever moved the camera */
  if (state === 'intro') {
    drawWorld(cx, cy, false);
    drawSet(K, 'run', Math.floor(intro.t * 8) % 4, intro.kx - cx, checkpoint.y - cy, 1, false);
    const bx = 16, by = VH - 52, bw = VW - 32, bh = 40;
    g.fillStyle = 'rgba(14,10,22,0.88)'; g.fillRect(bx, by, bw, bh); g.strokeStyle = '#ffd36b'; g.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
    const line = INTRO[intro.card].slice(0, Math.floor(intro.chars)); const lines = wrap(line, bw - 16);
    lines.forEach((l, i) => text(l, bx + 8, by + 7 + i * 11, '#fff6e0'));
    if (intro.chars >= INTRO[intro.card].length && Math.floor(time * 3) % 2 === 0) text('Z', bx + bw - 12, by + bh - 11, '#8fd160', 'right');
    text('ESC skip', VW - 6, 4, '#9aa39a', 'right');
  } else if (state === 'title' || state === 'slots') drawTitle(cx, cy);
  else if (state === 'map') { drawMap(); for (const p of parts) { g.globalAlpha = Math.min(1, p.life / p.max * 2); g.fillStyle = p.col; g.fillRect(Math.round(p.x - camX), Math.round(p.y - camY), p.size, p.size); } g.globalAlpha = 1; }
  else if (state === 'editor') drawEditor();
  else if (state === 'tree') { drawTree(); }
  else if (state === 'store') { drawStore(); for (const p of parts) { g.globalAlpha = Math.min(1, p.life / p.max * 2); g.fillStyle = p.col; g.fillRect(Math.round(p.x - camX), Math.round(p.y - camY), p.size, p.size); } g.globalAlpha = 1; }
  else {
    const z = zoomT > 0 ? zoomAmt : 1;
    if (z > 1) { g.save(); g.translate(VW / 2, VH * 0.55); g.scale(z, z); g.translate(-VW / 2, -VH * 0.55); }
    drawWorld(cx, cy, true);
    if (z > 1) g.restore();
  }
  if (flash > 0 && SET.flashes) { g.fillStyle = 'rgba(255,80,80,' + (flash * 2.5) + ')'; g.fillRect(0, 0, VW, VH); }
  if (state === 'talk' && talk) { // the words: a box along the bottom, the speaker named, a glyph for the next page
    const big = !!SET.bigText; const sz = big ? 10 : 8; const bw = VW - 24, bx = 12; const body = talk.lines[talk.i] || ''; const lines = wrap(body, bw - 16, sz); const lh = big ? 14 : 10; const bh = 14 + lines.length * lh + (talk.name ? 10 : 0); const by = VH - bh - 8;
    const dress = (L && L.palette && L.palette.dress) || 'wood'; const bc = L && L.dark ? '#7aa8c8' : dress === 'crag' ? '#8a919c' : dress === 'marsh' ? '#4a9a6e' : dress === 'camp' ? '#8b6a2a' : (L && L.palette && L.palette.myc) ? '#9a5aa8' : '#8b6a2a';
    g.fillStyle = 'rgba(14,10,22,0.9)'; g.fillRect(bx, by, bw, bh); g.strokeStyle = bc; g.lineWidth = 1; g.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1); g.strokeStyle = 'rgba(255,255,255,0.1)'; g.strokeRect(bx + 2.5, by + 2.5, bw - 5, bh - 5);
    let ty = by + 7; if (talk.name) { text(talk.name, bx + 8, ty, UI.title, 'left', sz); ty += 10; }
    lines.forEach((ln, k) => text(ln, bx + 8, ty + k * lh, '#fff6e0', 'left', sz));
    if (Math.floor(time * 3) % 2 === 0) text(talk.i + 1 < talk.lines.length ? talkGlyph() + ' >' : talkGlyph() + ' x', bx + bw - 6, by + bh - 9, '#8fd160', 'right', 6);
    if (talk.lines.length > 1) text((talk.i + 1) + '/' + talk.lines.length, bx + 6, by + bh - 9, '#9aa39a', 'left', 6);
  }
  if (state === 'play' || state === 'talk' || state === 'win' || state === 'gameover' || (state === 'menu' && menuFrom === 'play')) {
    if (SET.hud === 'minimal' && state === 'play' && P.hp === P.maxHp && P.st >= P.maxSt - 1 && !bossActive && bannerT <= 0 && (P.throwCd || 0) <= 0) { /* nothing to say: hide the plates until something changes */ } else {
    if (SET.vignette) { const vg = g.createRadialGradient(VW / 2, VH / 2, VH * 0.55, VW / 2, VH / 2, VH * 1.05); vg.addColorStop(0, 'rgba(10,8,20,0)'); vg.addColorStop(1, 'rgba(10,8,20,0.34)'); g.fillStyle = vg; g.fillRect(0, 0, VW, VH); }
    if (SET.bossIntro && ((bossActive && boss && boss.mode === 'wake') || miniIntroT > 0)) { const k = Math.min(1, (1.6 - (miniIntroT > 0 ? miniIntroT : boss.modeT)) / 0.35), bh = Math.round(VH * 0.11 * k); g.fillStyle = '#0a0810'; g.fillRect(0, 0, VW, bh); g.fillRect(0, VH - bh, VW, bh); const nm = miniIntroT > 0 ? miniName() : boss.t === 'owl' ? 'THE OWL REEVE' : boss.t === 'golem' ? (boss.mode === 'counter' || boss.mode === 'drink' ? 'THE FACET  OFF THE LINE' : 'THE FACET  NEEDS ' + (boss.need || 'blue').toUpperCase()) : boss.t === 'windcaller' ? (boss.mode === 'howl' || boss.mode === 'howlTell' ? 'THE WINDCALLER  HOLD ON' : boss.mode === 'blink' || boss.mode === 'appear' ? 'THE WINDCALLER  GONE' : boss.phase === 2 ? 'THE WINDCALLER  WRATH' : 'THE WINDCALLER') : boss.t === 'forgemaster' ? (boss.mode === 'stun' ? 'THE FORGEMASTER  STUNNED' : boss.mode === 'scald' ? 'THE FORGEMASTER  SCALDED' : 'THE FORGEMASTER') : boss.t === 'gqueen' ? (gqOpen(boss) ? 'THE GOBLIN QUEEN  OPEN' : boss.phase === 3 ? 'THE GOBLIN QUEEN  THE CROWN' : boss.phase === 2 ? 'THE GOBLIN QUEEN  RISEN' : 'THE GOBLIN QUEEN') : boss.t === 'roc' ? (rocOpen(boss) ? 'THE ROC  GROUNDED' : boss.phase === 2 ? 'THE ROC  SHEDDING' : 'THE ROC') : boss.t === 'suncatcher' ? (boss.dimmed ? 'THE SUNCATCHER  DIMMED' : 'THE SUNCATCHER') : boss.t === 'lance' ? (lanceOpen(boss) ? "THE QUEEN'S LANCE  OPEN" : boss.phase === 2 ? "THE QUEEN'S LANCE  NO LANCE" : "THE QUEEN'S LANCE") : boss.t === 'frog' ? 'THE BULLFROG KING' : boss.t === 'chief' ? 'THE GOBLIN CHIEFTAIN' : boss.t === 'mother' ? 'THE MOTHER CAP' : boss.t === 'king' ? 'KING GORM UNDERLEAF' : boss.t === 'ram' ? (ramOpen(boss) ? 'THE RAM LORD  DAZED' : 'THE RAM LORD') : 'THE HORNET QUEEN'; if (k >= 1) { text(nm, VW / 2 + 1, VH / 2 - 5, '#3a2214', 'center', 12); text(nm, VW / 2, VH / 2 - 6, '#ffd36b', 'center', 12); } }
    g.fillStyle = 'rgba(10,8,20,0.38)'; g.beginPath(); g.roundRect(2, 2, 104, (SET.iron ? 36 : 24) + (isPyro() || isPaladin() ? 10 : 0), 4); g.fill();
    g.fillStyle = 'rgba(10,8,20,0.38)'; g.beginPath(); g.roundRect(VW - 54, 2, 52, 28, 4); g.fill();
    g.drawImage(PROP.heart, 5, 5);
    if (SET.iron) { for (let i = 0; i < 3; i++) { g.globalAlpha = i < lives ? 1 : 0.25; g.drawImage(K.R.idle[0], 0, 0, 12, 12, 6 + i * 11, 23, 12, 12); } g.globalAlpha = 1; text('IRON', 42, 26, '#c9d1dc'); }
    if (P.torch > 0 && state !== 'win') { const tx = 112, ty = 6; g.fillStyle = 'rgba(10,8,20,0.45)'; g.beginPath(); g.roundRect(tx - 4, ty - 2, 30, 16, 4); g.fill(); g.fillStyle = '#5c3a1d'; g.fillRect(tx, ty + 5, 2, 7); const f = Math.floor(time * 12) % 3; g.fillStyle = '#ff9a5c'; g.fillRect(tx - 1, ty - (f === 1 ? 1 : 0), 4, 5); g.fillStyle = '#ffd36b'; g.fillRect(tx, ty + 1, 2, 3); bar(tx + 6, ty + 4, 16, 3, Math.min(1, P.torch / 30), P.torch < 6 && Math.floor(time * 6) % 2 ? '#ff6b6b' : '#ffd36b'); }
    if (statFlash > 0) { statFlash -= 1 / 60; g.fillStyle = 'rgba(143,209,96,' + (statFlash * 0.5) + ')'; g.fillRect(2, 2, 104, 22); }
    bar(16, 6, 70, 6, P.hp / P.maxHp, P.hp > 30 ? '#e04848' : (Math.floor(time * 6) % 2 ? '#ff7a6b' : '#e04848'), P.hpShown / P.maxHp);
    g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(16, 6, Math.round(70 * Math.max(0, P.hp / P.maxHp)), 1); for (let i = 1; i < 4; i++) { g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(16 + Math.round(70 * i / 4), 6, 1, 6); }
    text(String(Math.max(0, Math.ceil(P.hp))), 90, 6, '#fff6e0');
    for (let i = 0; i < (PROG.tonics || 0); i++) g.drawImage(TONIC_ICON, 90 + i * 7, 14); // the tonics you carry
    if (SET.invincible || SET.godmode) text((SET.invincible ? 'INVINCIBLE ' : '') + (SET.godmode ? 'GOD MODE' : ''), 6, 30, '#ff9a5c', 'left', 6);
    g.drawImage(PROP.bolt, 6, 15);
    if (isPyro()) { const hy = SET.iron ? 41 : 29; bar(16, hy, 70, 4, (P.heat || 0) / 100, P.full ? (Math.floor(time * 10) % 2 ? '#fff6c8' : '#ffd36b') : '#ff9a5c', (P.heat || 0) / 100); g.drawImage(PROP.fire[Math.floor(time * 12) % 3], 4, hy - 8, 10, 12); if (P.full) text('PYRE: C', 90, hy - 1, Math.floor(time * 4) % 2 ? '#ffd36b' : '#fff6c8'); }
    if (isPaladin()) { const hy = SET.iron ? 41 : 29, full = (P.light || 0) >= 100; bar(16, hy, 70, 4, (P.light || 0) / 100, full ? (Math.floor(time * 10) % 2 ? '#fff6c8' : '#ffd36b') : '#f0c040', (P.light || 0) / 100); g.fillStyle = '#ffd36b'; g.fillRect(8, hy - 3, 2, 9); g.fillRect(5, hy, 8, 2); if (full) text('JUDGEMENT: C', 90, hy - 1, Math.floor(time * 4) % 2 ? '#ffd36b' : '#fff6c8'); }
    if (SET.hud === 'minimal') { g.globalAlpha = 1; } 
    if (P.relic && (PROP.relic[P.relic] || PROP.lampIcon)) { g.drawImage(PROP.relic[P.relic] || PROP.lampIcon, 92, 14); }
    if (PROG.charm && PROG.charms && PROG.charms[PROG.charm] && PROP.charm[PROG.charm]) { g.globalAlpha = 0.85; g.drawImage(PROP.charm[PROG.charm], P.relic ? 104 : 92, 14); g.globalAlpha = 1; }
    { const sk = skillNow(); if (sk) { const cd = skillCd(sk), max = CD_MAX[sk] || 3; g.globalAlpha = (sk === 'shieldThrow' && thrown) || cd > 0 ? 0.45 : 1; g.drawImage(skillIcon(sk), 76, 13); g.globalAlpha = 1; if (cd > 0) { g.fillStyle = '#c9d1dc'; g.fillRect(76, 26, Math.round(10 * (1 - cd / max)), 1); } } }
    const low = P.stFlash > 0 && Math.floor(time * 12) % 2 === 0;
    bar(16, 16, 56, 4, P.st / P.maxSt, low ? '#ff6b6b' : '#8fd160'); g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(16, 16, Math.round(56 * Math.max(0, P.st / P.maxSt)), 1);
    for (const f of flyCoins) { const e = 1 - Math.pow(1 - f.t, 3); const x = f.x + (VW - 42 - f.x) * e, y = f.y + (9 - f.y) * e - Math.sin(f.t * Math.PI) * 14; g.drawImage(PROP.coin[Math.floor(f.t * 12) % 4], Math.round(x), Math.round(y)); }
    g.drawImage(PROP.coin[0], VW - 46, 5); text((L && L.shop ? String(PROG.coins || 0) : got + '/' + total), VW - 36, 7, '#ffd34a');
    for (let i = 0; i < silvers.length; i++) { g.fillStyle = silvers[i].got ? '#dfe8ff' : 'rgba(223,232,255,0.28)'; g.beginPath(); g.arc(VW - 44 + i * 7, 22, 2.5, 0, 7); g.fill(); }
    { const Q = questOf(); if (Q.item !== 'none') { const n = straysGot.size, done = n >= Q.n; text(Q.name + ' ' + n + '/' + Q.n, VW - 6, 28, done ? '#ffd36b' : '#c9b27c', 'right', 6); } }
    if (P.hp > 0 && P.hp <= 30 && state === 'play') { const k = 0.5 + 0.5 * Math.sin(time * (P.hp <= 15 ? 11 : 7)); const vg = g.createRadialGradient(VW / 2, VH / 2, 70, VW / 2, VH / 2, 200); vg.addColorStop(0, 'rgba(180,20,20,0)'); vg.addColorStop(1, 'rgba(180,20,20,' + (0.18 + 0.22 * k) + ')'); g.fillStyle = vg; g.fillRect(0, 0, VW, VH); }
    if (state === 'play' && SET.timer && !(L && L.shop)) { text(fmt(levelTime), VW / 2 + 1, 5, 'rgba(0,0,0,0.6)', 'center'); text(fmt(levelTime), VW / 2, 4, UI.text, 'center'); }
    drawEscapeHUD();
    if (bannerT > 0 && state === 'play') { const k = Math.min(1, bannerT > 2.2 ? (2.6 - bannerT) / 0.4 : bannerT < 0.5 ? bannerT / 0.5 : 1); g.globalAlpha = k; g.fillStyle = 'rgba(10,8,20,0.7)'; g.fillRect(0, VH / 2 - 22, VW, 40); g.fillStyle = '#ffd36b'; g.fillRect(0, VH / 2 - 22, VW, 1); g.fillRect(0, VH / 2 + 17, VW, 1); text(LEVELS[levelIndex].name, VW / 2 + 1, VH / 2 - 12, '#3a2214', 'center', 12); text(LEVELS[levelIndex].name, VW / 2, VH / 2 - 13, '#ffd36b', 'center', 12); text(LEVELS[levelIndex].sub, VW / 2, VH / 2 + 5, '#c9d1dc', 'center'); g.globalAlpha = 1; }
    }
    if (miniActive && !bossActive) { const m = miniOne(); if (m) { text(m.phase === 2 ? miniName() + '  ENRAGED' : m.t === 'sailer' && m.mode === 'tumble' ? miniName() + '  SPILLED' : miniName(), VW / 2, VH - 22, m.phase === 2 ? '#ff6b6b' : '#ffd36b', 'center'); g.fillStyle = 'rgba(10,8,20,0.5)'; g.beginPath(); g.roundRect(VW / 2 - 76, VH - 28, 152, 26, 4); g.fill(); g.drawImage(PROP.skullMini, VW / 2 - 72, VH - 15); bar(VW / 2 - 60, VH - 11, 120, 5, Math.max(0, m.hp) / m.maxHp, m.mounted ? '#e0b040' : '#8fd160'); for (let i = 1; i < 10; i++) { g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(VW / 2 - 60 + i * 12, VH - 11, 1, 5); } } }
    if (bossActive && boss && boss.alive) { const nm = boss.t === 'owl' ? 'THE OWL REEVE' : boss.t === 'golem' ? (boss.mode === 'counter' || boss.mode === 'drink' ? 'THE FACET  OFF THE LINE' : 'THE FACET  NEEDS ' + (boss.need || 'blue').toUpperCase()) : boss.t === 'windcaller' ? (boss.mode === 'howl' || boss.mode === 'howlTell' ? 'THE WINDCALLER  HOLD ON' : boss.mode === 'blink' || boss.mode === 'appear' ? 'THE WINDCALLER  GONE' : boss.phase === 2 ? 'THE WINDCALLER  WRATH' : 'THE WINDCALLER') : boss.t === 'forgemaster' ? (boss.mode === 'stun' ? 'THE FORGEMASTER  STUNNED' : boss.mode === 'scald' ? 'THE FORGEMASTER  SCALDED' : 'THE FORGEMASTER') : boss.t === 'gqueen' ? (gqOpen(boss) ? 'THE GOBLIN QUEEN  OPEN' : boss.phase === 3 ? 'THE GOBLIN QUEEN  THE CROWN' : boss.phase === 2 ? 'THE GOBLIN QUEEN  RISEN' : 'THE GOBLIN QUEEN') : boss.t === 'roc' ? (rocOpen(boss) ? 'THE ROC  GROUNDED' : boss.phase === 2 ? 'THE ROC  SHEDDING' : 'THE ROC') : boss.t === 'suncatcher' ? (boss.dimmed ? 'THE SUNCATCHER  DIMMED' : 'THE SUNCATCHER') : boss.t === 'lance' ? (lanceOpen(boss) ? "THE LANCE  OPEN" : boss.phase === 2 ? "THE LANCE  UNARMED" : "THE QUEEN'S LANCE") : boss.t === 'frog' ? 'BULLFROG KING' : boss.t === 'chief' ? 'GOBLIN CHIEFTAIN  ' + (boss.stance || 'club').toUpperCase() : boss.t === 'mother' ? 'THE MOTHER CAP' : boss.t === 'king' ? 'KING GORM' : boss.t === 'ram' ? (ramOpen(boss) ? 'THE RAM LORD  DAZED' : 'THE RAM LORD') : 'HORNET QUEEN'; text(boss.t === 'king' ? (boss.mode === 'held' ? nm + '  HELD' : boss.open > 0 ? nm + '  OPEN' : nm + '  CROWNED') : boss.phase === 2 ? nm + '  ENRAGED' : nm, VW / 2, VH - 22, boss.phase >= 2 ? '#ff6b6b' : '#ffd36b', 'center'); g.fillStyle = 'rgba(10,8,20,0.5)'; g.beginPath(); g.roundRect(VW / 2 - 76, VH - 28, 152, 26, 4); g.fill(); g.drawImage(PROP.skullMini, VW / 2 - 72, VH - 15); if (boss.t === 'king' && (boss.mode === 'held' || boss.open > 0)) { bar(VW / 2 - 60, VH - 11, 120, 5, boss.hp / boss.maxHp, boss.mode === 'held' ? (Math.floor(time * 8) % 2 ? '#8fd160' : '#e0b040') : '#8fd160'); if (boss.open > 0) { g.fillStyle = '#8fd160'; g.fillRect(VW / 2 - 60, VH - 5, Math.round(120 * boss.open / 7), 1); } } else if (boss.t === 'mother') { const gl = enemies.filter(g => g.alive && g.t === 'gill').length, ht = enemies.find(g => g.alive && g.t === 'heart'); bar(VW / 2 - 60, VH - 11, 120, 5, ht ? ht.hp / EHP.heart * 0.3 : 0.3 + gl / 4 * 0.7, ht ? '#ff7a9a' : '#9a5aa8'); } else bar(VW / 2 - 60, VH - 11, 120, 5, boss.hp / boss.maxHp, boss.t === 'ram' && ramOpen(boss) ? (Math.floor(time * 8) % 2 ? '#8fd160' : '#fff6c8') : boss.phase === 2 ? '#ff6b6b' : '#e0b040'); for (let i = 1; i < 10; i++) { g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(VW / 2 - 60 + i * 12, VH - 11, 1, 5); } }
  }
  if (state === 'title') {
    const since = time - titleSince, e = easeOutBack(Math.min(1, since / 0.7)), ly = Math.round(10 - (1 - e) * 70);
    const lw = 196, lh = Math.round(PROP.plank.height * 1.4), lx = VW / 2 - lw / 2;
    g.drawImage(PROP.plank, 0, 0, PROP.plank.width, PROP.plank.height, lx, ly, lw, lh);
    text('BRACKEN', VW / 2 + 2, ly + 14, '#3a2214', 'center', 22); text('BRACKEN', VW / 2, ly + 12, UI.gold, 'center', 22);
    // a glint runs along the letters every few seconds
    { const k = ((time - titleSince) % 5.5) / 0.7; if (k > 0 && k < 1) { g.save(); g.beginPath(); g.rect(lx + 6, ly + 3, lw - 12, lh - 6); g.clip(); const sx = lx - 20 + k * (lw + 40); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.35; g.fillStyle = '#fff6c8'; g.beginPath(); g.moveTo(sx, ly); g.lineTo(sx + 10, ly); g.lineTo(sx - 4, ly + lh); g.lineTo(sx - 14, ly + lh); g.closePath(); g.fill(); g.restore(); } }
    { const a = Math.max(0, Math.min(1, (since - 0.5) / 0.4)); g.globalAlpha = a; text('a knight, a wood, a mountain', VW / 2, ly + 40, UI.text, 'center', 6); g.globalAlpha = 1; }
    // the menu, on its own board to the right of the picture
    { const items = titleItems(), mw = 138, mx = VW - mw - 8, my = 74, mh = items.length * 13 + 24;
      const slide = easeOutBack(Math.min(1, Math.max(0, (since - 0.25) / 0.5))); const ox = Math.round((1 - slide) * 140);
      panel(mx + ox, my, mw, mh);
      const want = my + 6 + titleI * 13; titleBarY = titleBarY === null ? want : titleBarY + (want - titleBarY) * 0.3;
      g.fillStyle = 'rgba(143,209,96,0.16)'; g.fillRect(mx + ox + 4, Math.round(titleBarY) - 2, mw - 8, 12); g.fillStyle = UI.sel; g.fillRect(mx + ox + 4, Math.round(titleBarY) - 2, 2, 12);
      items.forEach((k, i) => { const sel = i === titleI, yy = my + 6 + i * 13, a = Math.max(0, Math.min(1, (since - 0.45 - i * 0.07) / 0.2));
        g.globalAlpha = a; text(k, mx + ox + 16 + (sel ? 2 : 0), yy, sel ? UI.title : UI.dim, 'left'); g.globalAlpha = 1;
        if (sel) { const bob = Math.round(Math.sin(time * 6) * 1.5), cxs = mx + ox + 8 + bob; g.fillStyle = '#c9d1dc'; g.fillRect(cxs, yy + 3, 5, 1); g.fillStyle = '#e0b040'; g.fillRect(cxs + 5, yy + 1, 1, 5); g.fillStyle = '#7a4a2a'; g.fillRect(cxs + 6, yy + 3, 2, 1); } });
      // what waits in the save you would continue
      const sv = readSlot(slot); const done = sv ? LEVELS.filter(lv => !lv.hidden && sv[lv.id] && sv[lv.id].cleared).length : 0;
      g.fillStyle = 'rgba(255,255,255,0.10)'; g.fillRect(mx + ox + 6, my + mh - 14, mw - 12, 1);
      text(sv ? 'SLOT ' + (slot + 1) + '  ' + done + '/' + LEVELS.filter(l => !l.hidden).length + ' WOODS' : 'SLOT ' + (slot + 1) + '  A NEW KNIGHT',
        mx + ox + mw / 2, my + mh - 10, UI.dim, 'center', 6); }
    text(touchOn ? 'touch pad on screen' : 'ARROWS choose   Z enter   ESC settings', VW / 2, 169, UI.dim, 'center', 6);
  }

  if (state === 'slots') drawSlots();
  if (state === 'bestiary') drawBestiary();
  if (state === 'map' || state === 'store') { for (const n of nums) { g.globalAlpha = Math.min(1, n.life * 3); text(String(n.txt), Math.round(n.x), Math.round(n.y), n.col, 'center'); } g.globalAlpha = 1; }
  drawWarp(); // the door closing, over everything
  if (state === 'menu') drawMenu();
  if (state === 'soundtest') drawSoundTest();
  if (state === 'controls') drawControls();
  if (state === 'herocard') drawHeroCard();
  if (state === 'heropick') drawHeroPick();
  if (state === 'gameover') {
    g.fillStyle = 'rgba(30,8,10,0.75)'; g.fillRect(40, 40, VW - 80, 100); g.strokeStyle = '#ff6b6b'; g.strokeRect(40.5, 40.5, VW - 81, 99);
    text('THE KNIGHT FALLS', VW / 2, 52, '#ff6b6b', 'center', 12);
    text('no lives left', VW / 2, 76, '#fff6e0', 'center');
    text('time ' + fmt(levelTime) + '   foes ' + kills, VW / 2, 92, '#c9d1dc', 'center');
    text('the wood keeps its gold', VW / 2, 106, '#9aa39a', 'center');
    if (Math.floor(time * 2) % 2 === 0) text('Z  back to the map', VW / 2, 124, '#8fd160', 'center');
  }
  if (state === 'win') {
    panel(40, 26, VW - 80, 130);
    text(L.trial ? 'THE TRIAL IS DONE' : L.arena ? (L.arena.boss === 'frog' ? 'THE KING CROAKS' : L.arena.boss === 'chief' ? 'OUT OF THE FIRE' : L.arena.boss === 'mother' ? 'THE WOOD BREATHES AGAIN' : L.arena.boss === 'king' ? 'THE KING IS DOWN' : L.arena.boss === 'owl' ? 'THE REEVE FALLS' : L.arena.boss === 'forgemaster' ? 'THE FORGE COOLS' : 'THE QUEEN FALLS') : 'THE GATE OPENS', VW / 2, 38, UI.title, 'center', 12);
    text('time     ' + fmt(levelTime), VW / 2, 64, '#fff6e0', 'center');
    text('gold     ' + got + ' / ' + total + '   +' + earned + ' purse', VW / 2, 77, '#ffd34a', 'center');
    text('foes     ' + kills, VW / 2, 90, '#fff6e0', 'center');
    text('blocks   ' + blocks + '   dodges ' + dodges, VW / 2, 103, '#fff6e0', 'center');
    text('deaths   ' + deaths, VW / 2, 116, '#fff6e0', 'center');
    if (winLevelUp) text('LEVEL ' + heroLevel() + '   +3 HEALTH  +5 STAMINA' + (heroLevel() % 2 === 0 ? '  +1 DAMAGE' : '') + '  +2 SKILL POINTS', VW / 2, 52, Math.floor(time * 3) % 2 ? UI.gold : '#fff6e0', 'center', 6);
    if (PROG.storeHint === 'shieldThrow' && LEVELS[levelIndex].id === 'stockade') text('NEW AT THE STORE: SHIELD THROW', VW / 2, 141, Math.floor(time * 3) % 2 ? '#ffd36b' : '#fff6e0', 'center');
    if (PROG.storeHint === 'groundSlam' && LEVELS[levelIndex].id === 'kings') text('NEW AT THE STORE: GROUND SLAM', VW / 2, 141, Math.floor(time * 3) % 2 ? '#ffd36b' : '#fff6e0', 'center');
    { const id = LEVELS[levelIndex].id, m = medalFor(id, levelTime); const bits = [m ? MEDAL_NAME[m] + ' TIME' : null, got >= total ? 'ALL GOLD' : null, hitsTaken === 0 && deaths === 0 ? 'NO DAMAGE' : null, SET.iron ? 'IRON KNIGHT' : null].filter(Boolean); if (bits.length) { const tw = bits.join('  ').length * 8; if (m) { g.fillStyle = MEDAL_COL[m]; g.beginPath(); g.arc(VW / 2 - tw / 2 - 10, 132, 5, 0, 7); g.fill(); g.fillStyle = ART.OUT; g.fillRect(VW / 2 - tw / 2 - 11, 131, 2, 2); } text(bits.join('  '), VW / 2, 128, m === 3 ? UI.gold : UI.sel, 'center'); } }
    if (Math.floor(time * 2) % 2 === 0) text('Z  continue', VW / 2, 140, '#8fd160', 'center');
  }
  if (P.dead && state === 'play') { g.fillStyle = 'rgba(10,6,14,' + Math.min(0.7, (1.2 - P.dead) * 1.2) + ')'; g.fillRect(0, 0, VW, VH); }
  if (!audioReady() && state === 'play') text('press a key for sound', VW - 4, VH - 12, '#9aa39a', 'right');
  if (SET.fps) { g.fillStyle = 'rgba(10,8,20,0.6)'; g.fillRect(2, VH - 12, 118, 10); text(perf.fps + ' FPS  UPDATE ' + perf.u.toFixed(1) + 'MS  DRAW ' + perf.r.toFixed(1) + 'MS', 4, VH - 10, perf.fps < 50 ? '#ff6b6b' : '#8fd160', 'left', 6); }
  drawTransition();
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
  if (SET.filter && SET.filter !== 'none') { const F = { warm: ['multiply', 'rgba(255,220,170,0.35)'], cool: ['multiply', 'rgba(180,210,255,0.35)'], sepia: ['multiply', 'rgba(230,200,150,0.5)'], night: ['multiply', 'rgba(120,130,200,0.45)'], grey: ['saturation', 'hsl(0,0%,50%)'], vivid: ['saturation', 'hsl(0,100%,50%)'] }[SET.filter]; if (F) { dg.globalCompositeOperation = F[0]; dg.fillStyle = F[1]; dg.fillRect(offX, offY, VW * S, VH * S); dg.globalCompositeOperation = 'source-over'; } }
  if (SET.bright && SET.bright !== 1) { dg.globalCompositeOperation = SET.bright > 1 ? 'lighter' : 'multiply'; dg.globalAlpha = SET.bright > 1 ? (SET.bright - 1) * 0.6 : 1; dg.fillStyle = SET.bright > 1 ? '#ffffff' : 'rgb(' + Math.round(255 * SET.bright) + ',' + Math.round(255 * SET.bright) + ',' + Math.round(255 * SET.bright) + ')'; dg.fillRect(offX, offY, VW * S, VH * S); dg.globalAlpha = 1; dg.globalCompositeOperation = 'source-over'; }
  if (SET.grain) { dg.globalAlpha = 0.05; dg.fillStyle = '#ffffff'; for (let i = 0; i < 90; i++) dg.fillRect(offX + Math.random() * VW * S, offY + Math.random() * VH * S, S, S); dg.globalAlpha = 1; }
  if (SET.scanlines && S >= 2) { if (!scanPat) { const [pc, pg] = canvas(1, S); pg.fillStyle = 'rgba(0,0,0,0.22)'; pg.fillRect(0, S - 1, 1, 1); scanPat = dg.createPattern(pc, 'repeat'); } dg.fillStyle = scanPat; dg.fillRect(offX, offY, VW * S, VH * S); }
}
const fmt = t => { const m = Math.floor(t / 60), s = Math.floor(t % 60), d = Math.floor((t * 10) % 10); return m + ':' + String(s).padStart(2, '0') + (SET.tenths ? '.' + d : ''); };

// ---------- loop ----------
let last = performance.now(), acc = 0, lastTick = 0, rafQueued = false; const STEP = 1 / 60;
let perf = { fps: 60, u: 0, r: 0, frames: 0, t0: 0 };
function tick(now) {
  lastTick = performance.now();
  pollGamepad();
  let dt = (now - last) / 1000; last = now;
  if (!(dt >= 0)) dt = 0; if (dt > 0.12) dt = 0.12;
  acc += dt;
  let n = 0; const tu = performance.now();
  while (acc >= STEP && n < 8) { update(STEP); acc -= STEP; n++; clearPresses(); }
  const tr = performance.now(); render(); const te = performance.now();
  perf.u += (tr - tu - perf.u) * 0.1; perf.r += (te - tr - perf.r) * 0.1; perf.frames++; if (te - perf.t0 > 500) { perf.fps = Math.round(perf.frames * 1000 / (te - perf.t0)); perf.frames = 0; perf.t0 = te; }
}
function frame(now) { rafQueued = false; tick(now); if (!rafQueued) { rafQueued = true; requestAnimationFrame(frame); } }
setInterval(() => { if (performance.now() - lastTick > 200) tick(performance.now()); }, 125);
loadLevel(0);
document.getElementById('boot').remove();
window.BK = {
  P, god: false, keys, SET, PROG, SPR, get view() { return { x: camX, y: camY, buf, VW, VH }; }, /* the camera and the unscaled frame, for crops in tests */
  step(n = 1) { for (let i = 0; i < n; i++) { update(STEP); clearPresses(); } render(); },
  tp(tx, ty) { P.x = tx * TS + 8; P.y = (ty + 1) * TS; P.vx = P.vy = 0; },
  reset() { Object.assign(P, { asleep: 0, sleepM: 0, dead: 0, hp: P.maxHp, hpShown: P.maxHp, st: P.maxSt, inv: 0, hurt: 0, vx: 0, vy: 0, plunge: false, atk: -1, onMover: null, dodge: 0, dodgeCd: 0, block: false }); },
  get state() { return state; }, set state(v) { state = v; }, start() { introSeen = true; startGame(); }, intro() { startIntro(); }, load: loadLevel,
  enemies: () => enemies, movers: () => movers, seeds: () => seeds, corpses: () => corpses, waves: () => waves, respawnEnemies: () => spawnEntities(),
  get throneBlock() { return throneBlock; }, get talk() { return talk; }, get wisp() { return wisp; }, fires: () => fires, skillNow, props: () => props, get L() { return L; }, get slide() { return slide; }, get time() { return time; }, destroyedCount: () => destroyed.size, get bossActive() { return bossActive; }, press(k) { if (k === 'talk') talkPress = true; if (k === 'confirm') confirmPress = true; if (k === 'pause') pausePress = true; if (k === 'throw') throwPress = true; if (k === 'atk') atkPress = true; if (k === 'jump') jumpPress = true; if (k === 'dodge') dodgePress = true; }, get slot() { return slot; }, loadSlot, readSlot, eraseSlot, get state() { return state; }, set state(v) { state = v; }, get bannerT() { return bannerT; }, RELICS, get miniActive() { return miniActive; }, get escape() { return escape; }, rocks: () => rocks, strays: () => straysGot.size, audio: debugAudio, embers: () => embers, hero, silverAvail, silvers: () => silvers, get marks() { return marks; }, questOf, spawnEnt, movers: () => movers, bombs: () => bombs, deco: () => deco, get thrown() { return thrown; }, get gate() { return gate; }, critters: () => critters, decor: () => decor, impacts: () => impacts, rings: () => rings, clouds: () => clouds2, roots: () => roots, get mother() { return mother; }, props: () => props, bombs: () => bombs, fires: () => fires, foxes: () => foxes, bridges: () => bridges, get map() { return map; }, SKINS, SWORDS, UPGRADES, applySkin, applyUpgrades, ripples: () => ripples, get hitsTaken() { return hitsTaken; }, touchOn, touchZones: () => touchZones, medalFor, get boss() { return boss; }, get ed() { return { get cat() { return edCat; }, set cat(v) { edCat = v; }, get sel() { return edSel[edCat]; }, set sel(v) { edSel[edCat] = v; }, get doc() { return edDoc; }, get cur() { return edCur; }, get testing() { return edTesting; }, cats: ED_CATS, items: c => edItems(c === undefined ? edCat : c) }; }, get P() { return P; }, get warp() { return warp; }, get upPress() { return upPress; }, doorNow() { const pr = props.find(q => q.t === 'doorway' && Math.abs(q.x - P.x) < 12 && Math.abs(q.y - P.y) < 20); if (pr) warpTo(pr); return pr ? pr.id : 'none'; }, setHero(h) { PROG.hero = h; PROG.heroes[h] = true; applySkin(); applyUpgrades(); P.hp = P.maxHp; return PROG.hero; }, get bossActive() { return bossActive; }, slay() { const b = boss; if (!b || !b.alive) return 'no boss'; if (b.t === 'mother') { for (const e of enemies) if (e.alive && (e.t === 'gill' || e.t === 'heart')) hurtEnemy(e, 9999, e.x - 10, false); return 'mother'; } b.open = 9; b.lit = true; b.litCols = new Set(['blue', 'violet', 'green']); b.torn = true; b.phase = 2; b.mode = b.t === 'king' ? 'held' : b.t === 'owl' ? 'grounded' : b.t === 'ram' ? 'crash' : b.mode; hurtEnemy(b, 99999, b.x - 20, false); return b.t + ' alive=' + b.alive; }, get bossMusicT() { return bossMusicT; }, get tongue() { return tongue; }, birds: () => birds, get weather() { return weatherAt(); }, get level() { return L; },
  stats: () => ({ got, total, kills, deaths, levelTime, pogoCount, parries, blocks, dodges }),
  get cam() { return [camX, camY]; }, get stop() { return stop; }, buf, g,
};
if (document.fonts && document.fonts.load) document.fonts.load('8px "Press Start 2P"').catch(() => {});
rafQueued = true; requestAnimationFrame(frame);
