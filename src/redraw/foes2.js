// redraw/foes2.js — redrawn bakers for four weak foes: the cave grub, the spore drone, the Great Hound and the
// hill troll. Drop-in replacements for the chars.js bakers of the same name (same frame count, order and meaning).
// Every sprite faces right in R; pack() mirrors it for L and builds the hit-flash silhouettes, exactly as chars.js.
//
// bakeGrub()  — the glow grub: a soft segmented larva lit from inside, amber head, mandibles, stub legs, acid.
//   frames: 0 crawl (stretched long and low), 1 crawl (squashed short and tall), 2 spit (front reared, jaws open, acid)
//   canvas 18x12 (was 18x10, +2 rows of headroom for the rear-up). anchor ax 8, ay 10 (legs' bottom row on e.y, as before).
//   hitbox unchanged (w 14, h 7).
//
// bakeDrone() — the spore drone: a floating puffball, sleepy lidded eyes, small mouth, a purple gill frill with
//   tassels, pores on the cap, loose specks drifting off it (drawn after the outline, so they stay single pixels).
//   frames: 0 small, 1 big, 2 blink/pulse (lids shut, frill flared, pores lit), 3 mid — main.js bobs [0, 3, 1, 3].
//   canvas 14x12 (was 12x8). anchor ax 7, ay 11 (the outline row under the tassels on e.y, as before).
//   hitbox unchanged (w 9, h 7).
//
// bakeGreatHound() — a scarred war-wolf the size of a pony: grizzled mane, spiked iron collar with a broken chain,
//   a goblin war-saddle on a red blanket with a skull trophy, claw scars on the haunch, glowing eyes, heavy jaws.
//   frames: 0 stand, 1 run (extended), 2 run (gathered), 3 tell (crouched, hackles up, snarling),
//   4 pounce (airborne, stretched, jaws wide), 5 howl (sat back on its haunches, head thrown back),
//   6 stun/skid/whine/landed (flat on its belly, tongue out, stars).
//   canvas 46x26 (was 34x14). anchor ax 23, ay 24 (paws' bottom row on e.y, as before).
//   hitbox: w 32, h 17 (was 26 x 12) — change the spawn in main.js `case 'greathound'`.
//
// bakeTroll() — a mountain troll: hunched, the hump at its shoulders thick with moss, lichen and scree stuck in the
//   hide, a small head jutting under it with a heavy brow and an underbite with two tusks, arms to the knees,
//   a rock in its fist; grey-green scree palette.
//   frames: 0 stand, 1 walk (contact, low), 2 walk (passing), 3 throw (rock raised overhead in both fists, roaring —
//   also the tell), 4 swat (the arm flung out and round at belt height, rock leading — also the tell).
//   canvas 30x31 (was 20x21; 5 rows of it are headroom for the rock overhead). anchor ax 12, ay 30 (the outline row
//   under the feet on e.y, as before).
//   hitbox: w 18, h 21 (was 16 x 18); the big variant (drawn x1.7) w 30, h 36 (was 26 x 30) — change the spawn in
//   main.js `case 'troll'`.
import { px, fromGrid, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';

// same as chars.js
function pack(frames, ax, ay, w, h) {
  const R = frames, L = frames.map(flipX), white = frames.map(c => whiten(c)), whiteL = white.map(flipX);
  return { R, L, white: { R: white, L: whiteL }, ax, ay, w, h };
}
// a char grid to lay parts onto: stamp() writes a block of rows at (x, y), '.' is see-through, ' ' punches a hole
const blank = (w, h) => Array.from({ length: h }, () => Array(w).fill('.'));
const stamp = (G, x, y, rows) => rows.forEach((r, j) => { const row = G[y + j]; if (!row) return; for (let i = 0; i < r.length; i++) { const k = r[i], xx = x + i; if (k === '.' || xx < 0 || xx >= row.length) continue; row[xx] = k === ' ' ? '.' : k; } });
const rowsOf = G => G.map(r => r.join(''));

// ---------- grub ----------
export function bakeGrub() {
  const P = { o: OUT, w: '#e6f4c8', b: '#a8c888', B: '#789a5e', u: '#56704a', y: '#eaff8a', Y: '#ffffe0', g: '#c8e070',
    k: '#f0cc80', h: '#c89048', H: '#7a4e26', m: '#3a2214', M: '#e8dcc0', l: '#3a2e22', a: '#c8ff3a', A: '#7ab820' };
  const q = rows => outline(fromGrid(rows, P, 1), OUT);
  const E = '................';
  const crawl1 = q([E, E, E, E,
    '...wwB.wwB.ww...',
    '..wbbbBbbbBbbkh.',
    '.wbbyygyYgybkhhh',
    'wbbyYYgYYYgbhhoH',
    'uBbbyygyyybBHhHm',
    '.ul.uu.uu.ul.mMa']);
  const crawl2 = q([E, E, E,
    '....wwB.wwB.....',
    '...wbbbBbbbBkh..',
    '..wbbyygyybkhhh.',
    '..bbyYYgYYgbhhoH',
    '..bbyYYgYYgbHhHm',
    '..uBbyygyybBuHmM',
    '...ul.uu.ul...a.']);
  const spit = q([
    '..........khhh..',
    '.........khhoHmM',
    '........bhhhHoa.',
    '.......wbHhHoo.a',
    '.......wbyHHmM..',
    '......wbyYgB....',
    '.....wbyYYgB...A',
    '...wwbgyYYgb....',
    '.wbbyygyyygB....',
    'uBul.uu.ul.u....']);
  return pack([crawl1, crawl2, spit], 8, 10, 14, 7);
}

// ---------- drone ----------
export function bakeDrone() {
  const P = { o: OUT, w: '#fbf6ff', t: '#e0d4ec', T: '#b0a0c4', L: '#9a88b4', v: '#8a64b4', V: '#4a2a6a', p: '#e08aa8', s: '#b8a8c8', S: '#a8e0e8' };
  const q = (rows, specks) => { const c = outline(fromGrid(rows, P, 1), OUT), g = c.getContext('2d'); for (const [x, y, k] of specks) px(g, x, y, k ? '#a8e0e8' : '#f0e8ff'); return c; };
  const small = [
    '............',
    '............',
    '....wwtt....',
    '..wwttsttT..',
    '.wtsttttttT.',
    '.wttLLttLLT.',
    '.tttoottooT.',
    '..TtttpTTT..',
    '..vVvVvVvV..',
    '...v..V..v..'];
  const mid = [
    '............',
    '....wwtt....',
    '..wwttttsT..',
    '.wtsttttttT.',
    '.wttttttttTT',
    '.wttLLttLLTT',
    '.tttoottooTT',
    '.TTttttpTTT.',
    '.vVvVvVvVvV.',
    '..v..V..v...'];
  const big = [
    '....wwwt....',
    '..wwttttsT..',
    '.wtstttttTT.',
    'wttttttttsTT',
    'wttttttttttT',
    'wtttLLttLLtT',
    'ttttoottooTT',
    '.TTttttpTTT.',
    'vVvVvVvVvVvV',
    '.v..V..v..V.'];
  const shut = mid.map((r, i) => i === 5 ? '.wttttttttTT' : i === 6 ? '.tttLLttLLTT' : i === 8 ? 'vVvVvVvVvVvV' : i === 9 ? 'v..v..V..v.V' : r.replace(/s/g, 'S')); // the pulse: pores lit, frill flared
  return pack([q(small, [[2, 2, 0], [11, 4, 1]]), q(big, [[1, 0, 1], [12, 3, 0]]), q(shut, [[0, 3, 0], [12, 1, 1], [2, 11, 0], [11, 10, 1]]), q(mid, [[1, 1, 0], [12, 2, 1]])], 7, 11, 9, 7);
}

// ---------- great hound ----------
export function bakeGreatHound() {
  const P = { o: OUT, f: '#7a6852', h: '#5a4a3a', H: '#3a2e22', U: '#2a2018', m: '#2e2620', n: '#4a3e34', M: '#8a7a68', s: '#d4a898',
    i: '#8a919c', I: '#5a6270', k: '#c9d1dc', c: '#6a7280', w: '#8a5a32', W: '#5c3a1d', r: '#8f2f28', R: '#5a1a1a',
    t: '#e8dcc0', T: '#b8a888', e: '#ff4a3a', E: '#ffd36b', z: '#f3f0d2', q: '#5a1a1a', p: '#c9463d', l: '#cdbf9a' };
  const q = G => outline(fromGrid(rowsOf(G), P, 1), OUT);
  const W = 44, H = 24, Y0 = 2; // everything is laid out on rows 0..21; Y0 rows of headroom on top for the howl
  const st = (G, x, y, rows) => stamp(G, x, y + Y0, rows);
  const TAIL = ['.....fhh', '...fhhhH', '..fhhHH.', '.fhhH...', 'fhhH....', 'hhH.....', 'hHh.....', 'MhH.....', '.MH.....', '..M.....'];
  const TAIL_UP = ['M.......', 'hM......', 'hhhf....', '.hhhhf..', '..hhhhhh', '....hhhh'];
  const TAIL_STREAM = ['....fhhh', 'Mfhhhhhh', 'MhhhhHH.', '.MHHH...'];
  const TORSO = [ // x 5.., y 5..
    '...fffff....................',
    '.fhhhhhhhhhhhhhhh...........',
    'fhhhhhhhhhhhhhhhhhhhh.......',
    'hhshhhhhhhhhhhhhhhhhhhh.....',
    'hhhshhhshhhhhhhhhhhhhhhhhh..',
    'hhhhshhhshhhhhhhhhhhhhhhhhh.',
    'hhhhhshhhshhhhhhhhhhhhhhhhhh',
    '.hhhhhhhhhH......HHhhhhhhhhh',
    '..HhhhhhhH..........HHhhhhhh',
    '.......................HHhhh'];
  const MANE = [ // x 22.., y 1..
    '....M...M...M.',
    '...MmM.MmM.Mm.',
    '..MmmmmmmmmmmM',
    '.Mmmmmmmmmmmmm',
    'Mmmmmmmmmmmmmm',
    'mmMmmmmmmmmmmm',
    '.mmmmmMmmmmmmm',
    '.mmmmmmmmmmmmm',
    '..mMmmmmmmmmmm',
    '..mmmmmmMmmmmm',
    '...mmmmmmmmmm.',
    '....mMmmmmmm..',
    '.....mm.mm.m..'];
  const strand = rows => rows.map((r, y) => r.replace(/m/g, (m, x) => (x + y) % 4 === 0 ? 'n' : 'm'));
  const HACKLES = ['..M....M....M', '..mM..MmM..Mm', '.Mmm.Mmmm.Mmm'];
  const SADDLE = [ // x 11.., y 2..
    'Ww.......ww',
    'Www.....wwW',
    '.WwwwwwwwW.',
    'rrWWWWWWWrr',
    'rRrrrrrrrrR',
    'rRrrrrrrrrR',
    'rRrrrrrrrrR',
    '.RrRrrRrrR.',
    '..R..R..R..'];
  const SKULL = ['.ttT', 'otoT', 'tttT', '.t.t'];
  const COLLAR = ['..k.', '..iI', 'kkiI', '..iI', '..iI', 'kkiI', '..iI', '..iI', 'kkiI', '..iI'];
  const CHAIN = ['k.', 'I.', 'k.', '.I', '.k', '.I', 'k.', '.k'];
  const HEAD = ['..fH.......', '.fhH.......', '.fhhHf.....', 'fshhhhff...', 'hhsHHhhhff.', 'hhhEehhhhhh', 'hhhshhhhhho', 'hhhhhhhhhHo', 'HhhHoooooz.', 'HhhhhzhhhH.', '.HHhhhhHH..', '..HHHH.....'];
  const SNARL = ['...........', 'fH.........', 'fhHf.......', 'fshhhff....', 'hhsHHHhff..', 'hhhEeHhHhhh', 'hhhshhhhhho', 'HhhzqqqqzHo', 'Hhqqqqqqz..', 'HhhzhhhzH..', '.HHHHHH....'];
  const OPEN = ['...........', 'fH.........', 'fhHff......', 'fshhhhff...', 'hhsHHhhhhf.', 'hhhEehhhhhh', 'hhhshhhhhho', 'HhhhhhhhzHo', 'Hhqqqqq....', 'Hhqppqq....', 'Hhhqqqqz...', 'HhhhhhhhH..', '.HHHHHH....'];
  // howl: the open-jawed head tipped back a quarter turn, muzzle to the sky, ears laid flat
  const HOWL = (rows => Array.from({ length: rows[0].length }, (_, y) => Array.from({ length: rows.length }, (_, x) => rows[x][rows[0].length - 1 - y]).join('')))(OPEN);
  const DAZE = ['...........', '...........', '.fhff......', 'fshhhhff...', 'hhshhhhhhf.', 'hhhMohhhhhh', 'hhhshhhhhho', 'Hhhhhhhhhho', 'HHhhoooozp.', '.HHHHHH.pp.', '........p..'];
  // legs: [rows, x, y]
  const FORE = ['hhhh', 'hhhH', '.hhH', '.hhH', '.hhH', '.hhH', '.hhH', '.hhhh', '.Hhhl'];
  const HIND = ['hhhhhh', '.hhhhH', '.hhhH.', 'hhhH..', 'hhH...', '.hH...', '.hH...', '.hhhh.', '.Hhhl.'];
  const FORE_EXT = ['hhhh.....', '.hhhh....', '..hhhH...', '...hhH...', '...hhhH..', '....hhH..', '.....hhH.', '.....hhhh', '.....Hhhl'];
  const HIND_EXT = ['........hhhhh', '......hhhhhH.', '.....hhhhH...', '....hhhH.....', '...hhH.......', '..hhH........', '.hhH.........', 'hhhH.........', 'lhhH.........'];
  const FORE_MID = ['hhhh..', 'hhhH..', '.hhH..', '.hhhH.', '..hhH.', '..hhH.', '..hhH.', '..hhhh', '..Hhhl'];
  const HIND_MID = ['..hhhh', '.hhhhH', '.hhhH.', 'hhhH..', 'hhH...', 'hH....', 'hH....', 'hhhh..', 'Hhhl..'];
  const FORE_BACK = ['.....hhhh', '....hhhhH', '....hhhH.', '...hhhH..', '...hhH...', '..hhH....', '..hhH....', '.hhhh....', '.Hhhl....'];
  const HIND_FWD = ['hhhhhh....', '.hhhhhh...', '...hhhhH..', '....hhhH..', '.....hhH..', '.....hhH..', '.....hhH..', '.....hhhhh', '.....Hhhhl'];
  const FORE_CROUCH = ['hhhh...', '.hhhH..', '..hhH..', '..hhhH.', '...hhhh', '...Hhhl'];
  const HIND_CROUCH = ['.hhhhhhh', '.hhhhhhH', 'hhhH....', 'hhH.....', '.hhhhh..', '.Hhhhl..'];
  const FORE_REACH = ['hhhh........', 'hhhhhh......', '.hhhhhhh....', '...HhhhhhhH.', '......HHhhhl'];
  const HIND_TRAIL = ['.......hhhhhh.', '....hhhhhhhH..', '.hhhhhhHH.....', 'lhhHH.........'];
  const HIND_SIT = ['...fhhhh....', '..fhhhhhh...', '.fhhhhhhhH..', '.hhhhhhhhH..', '.hhhhhhhhH..', '.HhhhhhhhhH.', '..HHhhhhhhhh', '....HHHHhhhl'];
  const FORE_FLAT = ['hhhhh....', '.hhhhhhH.', '..HHhhhhl'];
  const HIND_FLAT = ['.....hhhhhh', '..hhhhhhhH.', 'lhhhhHH....'];
  const dark = rows => rows.map(r => r.replace(/H/g, 'U').replace(/[fh]/g, 'H').replace(/l/g, 'T'));
  const frame = o => {
    const G = blank(W, H), B = blank(W, H), dy = o.dy || 0, sh = o.shear || (() => 0);
    for (const [rows, x, y] of o.far) st(G, x, y, dark(rows));
    st(B, 0, (o.tailY ?? 6) + dy, o.tail || TAIL);
    st(B, 5, 5 + dy, TORSO); st(B, 11, 2 + dy, SADDLE); st(B, 14, 9 + dy, SKULL); st(B, 22, 1 + dy, strand(MANE));
    if (o.hackles) st(B, 22, dy - 2, strand(HACKLES));
    st(B, 29, 3 + dy, COLLAR);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const k = B[y][x]; if (k === '.') continue; const ny = y + sh(x); if (ny >= 0 && ny < H) G[ny][x] = k; }
    for (const [rows, x, y] of o.near) st(G, x, y, rows);
    st(G, o.hx ?? 33, o.hy ?? dy, o.head || HEAD);
    if (o.chain !== false) st(G, 31 + (o.cx || 0), 13 + dy + sh(31), CHAIN);
    for (const [x, y] of o.stars || []) st(G, x, y, ['.E.', 'EzE', '.E.']);
    return q(G);
  };
  const stand = frame({ far: [[HIND, 11, 13], [FORE, 25, 13]], near: [[HIND, 7, 13], [FORE, 28, 13]] });
  const run1 = frame({ cx: -1, tail: TAIL_STREAM, tailY: 5, far: [[HIND_MID, 10, 13], [FORE_MID, 25, 13]], near: [[HIND_EXT, 0, 13], [FORE_EXT, 28, 13]] });
  const run2 = frame({ dy: -1, tail: TAIL_STREAM, tailY: 5, far: [[HIND, 11, 12], [FORE, 26, 12]], near: [[HIND_FWD, 8, 12], [FORE_BACK, 23, 12]] });
  const tell = frame({ dy: 3, hackles: true, tail: TAIL_UP, tailY: 1, head: SNARL, hy: 7, far: [[HIND_CROUCH, 9, 16], [FORE_CROUCH, 25, 16]], near: [[HIND_CROUCH, 5, 16], [FORE_CROUCH, 28, 16]] });
  const pounce = frame({ dy: 1, shear: x => -Math.round((x - 5) / 12), tail: TAIL_STREAM, tailY: 5, head: OPEN, hy: -1, far: [[HIND_TRAIL, 2, 13], [FORE_REACH, 26, 12]], near: [[HIND_TRAIL, 0, 12], [FORE_REACH, 28, 11]] });
  const howl = frame({ dy: 4, shear: x => Math.round((20 - x) * 0.25), head: HOWL, hy: -2, hx: 31, far: [[FORE, 25, 13]], near: [[HIND_SIT, 6, 14], [FORE, 28, 13]] });
  const stun = frame({ dy: 5, head: DAZE, hy: 10, stars: [[34, 5], [40, 7]], chain: false, far: [[['hhh', '.hhH', '.hhhl'], 26, 18], [['hhhh', '.hhhl'], 11, 19]], near: [[HIND_FLAT, 0, 17], [FORE_FLAT, 29, 18]] });
  return pack([stand, run1, run2, tell, pounce, howl, stun], 23, 24, 32, 17);
}

// ---------- troll ----------
export function bakeTroll() {
  const P = { o: OUT, u: '#a0a894', t: '#7a8272', T: '#565e50', U: '#3c4238', m: '#5a8a3a', M: '#3a5a28', l: '#c8c070',
    s: '#a8a298', S: '#6a665e', k: '#ece2c8', K: '#b8a888', e: '#ffd36b', q: '#2a2420', n: '#cdbf9a', c: '#7a5a3a', C: '#4e3824',
    r: '#8b8378', R: '#5f5a52', W: '#b3aca0' };
  const q = G => outline(fromGrid(rowsOf(G), P, 1), OUT);
  const W = 28, H = 29, Y0 = 5; // laid out on rows 0..23; Y0 rows of headroom for the rock held overhead
  const st = (G, x, y, rows) => stamp(G, x, y + Y0, rows);
  const BODY = [ // x 0, y 1: the hump is at the shoulders, mossed and stuck with scree; the back falls away behind it
    '........mmMm',
    '......mmmlmmMm',
    '.....mmSsmmmmmm',
    '....mmmsSmmlmmmm',
    '...mmmmmmmmmmmmmm',
    '..uumuttmmmmmmmmMm',
    '..uttttlttttmmmmmm',
    '.uttttttttttttmmmT',
    '.uttsSttttttttttTT',
    'uttttttttttttttTTU',
    'utttttttttttttTTTU',
    'uttttlttttttTTTTU',
    'TtttttttttTTTTTU',
    'TTtttttTTTTTTTU',
    '.TTTTTTTTTTTU'];
  const HEAD = [ // a small head under the hump: a heavy brow, and an underbite, two tusks up past the nose
    '..uuut....',
    '.uUUUUu...',
    '.tteUtuu..',
    '.ttttttTt.',
    '.TttttTk.k',
    '.TtqqqqkTk',
    '..Tttttttt',
    '...TUUUUU.'];
  const ROAR = ['..uuut....', '.uUUUUu...', '.tteUtuu..', '.ttttttTt.', '.TtttTT...', '.Ttqqqq...', '.Ttqqqqk.k', '.TtqqqqkTk', '..Tttttttt', '...TUUUUU.'];
  const CLOTH = ['cccccccc', 'CcccCccC', '.cC.cCc.'];
  const ARM = [ // a big shoulder, a thin upper arm, a forearm like a log, a rock in the fist at the knee
    '..mmmm......',
    '.muuuuuT....',
    'UuuuuuuT....',
    'UuuuuuuTT...',
    '.UuuuuuTT...',
    '..UuuuuT....',
    '..UuuuT.....',
    '...UuuT.....',
    '...UuuuT....',
    '...UuuuuT...',
    '....UuuuuT..',
    '....UuuuuuT.',
    '.....UuuuutT',
    '.....UnunuT.',
    '....WWrrrrR.',
    '...Wrrrrrrrr',
    '....rRRRRRR.'];
  const ARM_UP = [ // x 9, y -5: the rock over its head, both fists under it
    '..WWWrr...',
    '.WWrrrrrr.',
    'Wrrrrrrrrr',
    'rrrRrrrrRR',
    'rRRRrRRRRR',
    '.RRRRRRRR.',
    '.nunuuT...',
    '.UuuuuT...',
    '.UuuuuT...',
    '..UuuuT...',
    '.UuuuuT...',
    '.mmmmuT...',
    'muuuuuuT..',
    'UuuuuuuTT.',
    'UuuuuuuTT.',
    '.UuuuuTT..'];
  const FAR_UP = ['TnTn', 'TTTT', '.TTT', '.TTT', '..TT', '..TT'];
  const ARM_SWAT = [ // x 8, y 6: flung out and round at the height of its belt, the rock leading
    '..mmmm..............',
    '.muuuuuT............',
    'UuuuuuuT............',
    'UuuuuuuuT...........',
    '.UuuuuuuuuT.........',
    '..UuuuuuuuuuT.......',
    '...UUTTuuuuuuuT.WWr.',
    '.......TTuuuuunuWrrr',
    '.........TTTuuunurrrR',
    '............TTTTTrRRR',
    '................RRRR.'];
  const FAR_BACK = ['TTTT.', 'TTTTT', 'TTT..', 'UTT..', 'UU...'];
  const LEG_B = ['.TTTT.', '.TTTT.', 'TTTTT.', 'TTTTT.', '.TTTT.', '.TTTT.', 'UTTTTT', 'UUnUnU'];
  const LEG_F = ['.tttT.', '.ttttT', 'uttttT', 'uttttT', '.ttttT', '.ttttT', 'tttttTT', 'TTnTnTn'];
  const LEG_F_BACK = ['..tttT', '.ttttT', '.tttT.', 'utttT.', 'utttT.', 'tttT..', 'ttttT.', 'TnTnT.'];
  const LEG_B_FWD = ['.TTTT..', '..TTTT.', '..TTTT.', '..TTTTT', '...TTTT', '...TTTT', '...UTTTT', '...UUnUn'];
  const LEG_B_UP = ['.TTTT.', '.TTTT.', '.TTTTT', '..TTTT', '..UTTT', '..UUnU'];
  const frame = o => {
    const G = blank(W, H), dy = o.dy || 0;
    if (o.far) st(G, o.far[1], o.far[2] + dy, o.far[0]);
    for (const [rows, x, y] of o.legsB || [[LEG_B, 0, 16]]) st(G, x, y, rows);
    st(G, 0, 1 + dy, BODY); st(G, 2, 13 + dy, CLOTH);
    for (const [rows, x, y] of o.legsF || [[LEG_F, 4, 16]]) st(G, x, y, rows);
    const [arm, ax, ay] = o.arm || [ARM, 8, 6];
    st(G, ax, ay + dy, arm);
    st(G, 14, 6 + dy, o.head || HEAD);
    return q(G);
  };
  const stand = frame({});
  const walk1 = frame({ dy: 1, arm: [ARM, 9, 6], legsB: [[LEG_B_FWD, 1, 16]], legsF: [[LEG_F_BACK, 1, 16]] });
  const walk2 = frame({ arm: [ARM, 7, 6], legsB: [[LEG_B_UP, 2, 16]], legsF: [[LEG_F, 3, 16]] });
  const throwF = frame({ arm: [ARM_UP, 9, -5], far: [FAR_UP, 6, 1], head: ROAR });
  const swat = frame({ dy: 1, arm: [ARM_SWAT, 8, 6], far: [FAR_BACK, 0, 8], legsB: [[LEG_B_FWD, 1, 16]], legsF: [[LEG_F, 5, 16]] });
  return pack([stand, walk1, walk2, throwF, swat], 12, 30, 18, 21);
}
