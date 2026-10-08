/* tools/blow-tags.mjs - EVERY BOSS HOOK GETS THE BLOW'S TAG (claude/keyscore, design-standard B14; scratch/audit-keys.md 2b-2d). No browser.
   B14 keys a boss phase to ONE attack the player controls (plunge, rising cut, low sweep, from behind, throw, heavy, parry->riposte, the level's verb),
   so a boss's own code must be able to tell the attacks apart. Before keys-core most boss hooks got only the `plunge` BOOLEAN - and the pyromancer's
   FIREDROP is hurtAs('plunge', ..., false), so every gate on the boolean (the Bullfrog's head, the Scarecrow King's lantern...) silently left her out.
   1. DELIVERY: in main.js hurtEnemy0 and wardedDamage (the two places a blow meets a boss), every call to a boss or mini hook passes `tag` (the blow's
      name: hurtAs's first argument, the throw and the reflect included), and every hook main.js defines itself takes a `tag` parameter.
   2. NO BOOLEAN GATE: no boss branch in hurtEnemy0 gates on the bare `plunge` boolean (it uses pl = plunge-or-the-tag, or reads the blow) - one
      exemption, named with its reason.
   3. THE TAGS EXIST where the blows are struck: the firedrop is a 'plunge', a thrown carry a 'throw', a seed sent back a 'reflect', a cut out of a
      parry carries 'riposte'; the throw and the reflect stay the ROOM's blow (never chipped, never greed) exactly as before they had a name.
   4. THE KEY TABLE (src/boss-read.js KEYS): all eight keys, each with its word, glyph, colour and tags; keyed() tells them apart; a keyed boss's
      wrong blow is turned and NAMES the key; his glyph is drawn; a boss with no row is untouched (keys-core keys no boss). */
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { KEYS, KEY_ORDER, KEY_ROWS, ROOM_TAGS, keyOf, keyed, roomBlow, tagHas, drawKeyGlyph, glyphAt, makeBossRead, behind, GUARD } from '../src/boss-read.js';
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const bodyOf = name => { const i = main.indexOf('\nfunction ' + name + '('); assert.ok(i >= 0, 'main.js has ' + name); const j = main.indexOf('\nfunction ', i + 10); return main.slice(i, j); };
/* the calls in a body whose name looks like a boss hook: fooHurt(...), fooTake(...), XYZ.take(...), PUPH.hurtPuppet(...), ROCE.plungeHit(...), pyroReads(...) */
const HOOK = /\b((?:[A-Z][A-Z0-9]{1,5}\.)?(?:[a-z]\w*Hurt|[a-z]\w*Take|take|hurtPuppet|plungeHit|pyroReads))\(/g;
const argsAt = (src, open) => { let d = 0, k = open; for (; k < src.length; k++) { const c = src[k]; if (c === '(') d++; else if (c === ')') { d--; if (d === 0) break; } } return src.slice(open + 1, k); };
const splitArgs = a => { const out = []; let d = 0, cur = ''; for (const c of a) { if (c === '(' || c === '[' || c === '{') d++; if (c === ')' || c === ']' || c === '}') d--; if (c === ',' && d === 0) { out.push(cur.trim()); cur = ''; } else cur += c; } if (cur.trim()) out.push(cur.trim()); return out; };
/* NOT BOSS HOOKS (a common foe's or an elite's own gate): named, with the reason, so a new boss hook can never hide among them */
const NOT_BOSS = {
  'EK.take': 'an ELITE (src/elite-kit.js): it already reads the hero blow (blow), and an elite is not a boss',
  'CNF.grindylowTake': 'THE GRINDYLOW, a common canal foe', 'CNF.wispTake': 'THE WILL-O-WISP, a common canal foe',
  'WMH.take': 'THE WICKER MAN, a fair prop-foe (not on OPEN_RULE)', 'LDH.take': 'THE LESSER DJINN, a common welltown foe',
  'GEO.tombHit': 'the geomancer tomb', 'MYH.ward': "the bandit mystics' lamp", 'SKY.riderHurt': 'THE KITE-RIDER, a common Sky Road foe (a blow cuts his line)',
};
let hooks = 0; const missing = [];
for (const fn of ['hurtEnemy0', 'wardedDamage']) { const b = bodyOf(fn); let m; HOOK.lastIndex = 0;
  while ((m = HOOK.exec(b))) { const name = m[1]; if (NOT_BOSS[name]) continue;
    if (/function\s*$/.test(b.slice(Math.max(0, m.index - 12), m.index))) continue;   /* a definition, not a call */
    const args = splitArgs(argsAt(b, m.index + m[0].length - 1)); hooks++;
    if (!args.includes('tag')) missing.push(fn + ': ' + name + '(' + args.join(', ') + ')'); } }
assert.ok(hooks >= 28, 'the boss hooks are found (' + hooks + '): the pattern still sees them');
assert.deepStrictEqual(missing, [], 'every boss hook in hurtEnemy0 / wardedDamage receives the blow tag');
assert.ok(/function hurtEnemy0\(e, dmg, fromX, plunge, blow, tag = blow\) \{ const raw0 = dmg, pl = !!plunge \|\| blowHas\(tag, 'plunge'\);/.test(main), 'hurtEnemy0 takes the tag and reads a plunge BY IT (pl)');
assert.ok(/function wardedDamage\(e, dmg, blow, tag = blow\)/.test(main), 'wardedDamage takes the tag');
assert.ok(/r = hurtEnemy0\(e, dmg, fromX, plunge, blow, tag\);/.test(main), 'hurtEnemy hands hurtEnemy0 the tag');
for (const w of main.match(/wardedDamage\(e, dmg, blow(?:, tag)?\)/g)) assert.strictEqual(w, 'wardedDamage(e, dmg, blow, tag)', 'every blow into wardedDamage carries the tag');
for (const fn of ['reeveHurt', 'strawHurt', 'archHurt', 'homHurt', 'krakenHurt', 'princeHurt', 'unbHurt', 'pyroReads']) {
  const sig = new RegExp('\\nfunction ' + fn + '\\(([^)]*)\\)').exec(main); assert.ok(sig && splitArgs(sig[1]).includes('tag'), fn + ' takes a tag parameter'); }
/* 2. NO BOOLEAN GATE on a boss */
const PLUNGE_BODY = { drownedking: "a plunge IN HIS WATER is the hero's own body with nothing under it (P.swim): a penalty on the dive, not a key - the firedrop is fire, not weight" };
const bad = [];
for (const line of bodyOf('hurtEnemy0').split('\n')) {
  const bare = line.replace(/'plunge'/g, '').replace(/P\.plunge/g, '').replace(/\.plunge\b/g, '');
  if (!/\bplunge\b/.test(bare)) continue; const t = /e\.t === '(\w+)'/.exec(line); if (!t) continue;
  if (/\bpl\b/.test(line) || /blowHas\((?:blow|tag), 'plunge'\)/.test(line) || /\bpyroReads\(/.test(line) || /\bEK\.take\(/.test(line) || /TMK\.maskBlow/.test(line)) continue;
  if (PLUNGE_BODY[t[1]]) continue; bad.push(t[1] + ': ' + line.trim().slice(0, 120)); }
assert.deepStrictEqual(bad, [], 'no boss gates on the bare plunge boolean (pl, or the blow, is the plunge)');
for (const [re, what] of [[/if \(e\.t === 'frog' && pl && e\.mode !== 'dazed'\)/, "the Bullfrog's head counts the firedrop"], [/strawHurt\(e, dmg, fromX, pl, tag\)/, "the Scarecrow King's lantern takes the firedrop"],
  [/COH\.take\(e, dmg, fromX, pl, tag\)/, "the Glass Colossus's x2.4 takes the firedrop"], [/krakenHurt\(e, dmg, fromX, pl, tag\)/, "the Kraken's arms read it as a plunge"], [/\(pl \|\| P\.plunge\) && !rocOpen\(e\)\) ROCE\.plungeHit\(e, tag\)/, "the Roc's thermal plunge takes the firedrop"]])
  assert.ok(re.test(main), what);
/* 3. THE TAGS where the blows are struck */
assert.ok(/hurtAs\(b\.plunge \? 'plunge' : b\.cone \? \['heavy', 'shot'\] : 'shot', e,/.test(main), "the pyromancer's FIREDROP is tagged 'plunge' (her bellows heavy+shot)");
assert.ok(/hurtAs\('throw', e, throwDamage\(/.test(main), "a thrown carry (bucket, stone, pot) is tagged 'throw'");
assert.ok(/hurtAs\('reflect', e, 10, s\.x - s\.vx, false\)/.test(main), "a seed sent back onto a foe is tagged 'reflect'");
assert.ok(/hurtFoe: \(e, d, tag\) => \(tag \? hurtAs\(tag, e, d, e\.x, false\)/.test(main) && /ctx\.hurtFoe\(e, TORCH\.hit \* mul, 'throw'\)/.test(readFileSync(new URL('../src/underwell-hands.js', import.meta.url), 'utf8')), "the Underwell's thrown torch is tagged 'throw'");
assert.ok(/const meleeBlow = plunge => \{ const v = meleeBlow0\(plunge\); return v !== 'plunge' && P\.swingRiposte && P\.atk >= 0 \? \[v, 'riposte'\] : v; \};/.test(main), "a cut out of a parry carries 'riposte' (the verb first)");
assert.ok(/const tag = BLOW, blow = brRoomBlow\(tag\) \? null : tag;/.test(main), 'the throw and the reflect are the ROOM\'s blow (blow null: never chipped, greed or turned, as before)');
assert.deepStrictEqual(ROOM_TAGS, ['throw', 'reflect']); assert.ok(roomBlow('throw') && roomBlow(['shot', 'reflect']) && !roomBlow('light') && !roomBlow(['light', 'riposte']) && !roomBlow(null));
/* 4. THE KEY TABLE */
assert.deepStrictEqual(Object.keys(KEYS).sort(), [...KEY_ORDER].sort(), 'KEY_ORDER lists every key');
assert.deepStrictEqual(KEY_ORDER, ['plunge', 'rise', 'sweep', 'behind', 'throw', 'heavy', 'riposte', 'verb'], "B14's eight keys");
const words = new Set();
for (const k of KEY_ORDER) { const K = KEYS[k]; assert.ok(K.word && /^[A-Z ]+$/.test(K.word), k + ': a word in capitals'); assert.ok(!words.has(K.word), k + ': its own word'); words.add(K.word);
  assert.ok(/^#[0-9a-f]{6}$/.test(K.col) && K.glyph && K.how, k + ': a colour, a glyph and a how'); assert.ok(Array.isArray(K.tags) && (k === 'behind' || K.tags.length), k + ': tags'); }
assert.deepStrictEqual([KEYS.plunge.word, KEYS.rise.word, KEYS.throw.word, KEYS.heavy.word], ['FROM ABOVE', 'FROM BELOW', 'THROW IT', 'HEAVY'], "the named clank words");
const foe = { t: 'testkey', x: 100, y: 200, w: 30, h: 30, face: 1, alive: true, hp: 100, mode: 'idle', phase: 1 };
assert.ok(keyed('plunge', 'plunge', foe, 90) && !keyed('plunge', 'light', foe, 90), 'plunge: by the tag (the firedrop is a plunge)');
assert.ok(keyed('rise', 'rise', foe) && keyed('sweep', 'sweep', foe) && keyed('heavy', ['heavy', 'shot'], foe) && keyed('throw', 'throw', foe), 'rise / sweep / heavy (the bellows) / throw by their tags');
assert.ok(keyed('riposte', ['light', 'riposte'], foe) && keyed('riposte', 'reflect', foe) && !keyed('riposte', 'light', foe), 'the riposte key: a cut out of a parry, or a seed sent back (every hero)');
assert.ok(behind(foe, 60) && keyed('behind', 'light', foe, 60) && !keyed('behind', 'light', foe, 140), 'from behind: by where the blow came from');
assert.ok(!keyed('nokey', 'light', foe) && tagHas(['a', 'b'], 'b') && !tagHas(null, 'a'));
assert.strictEqual(keyOf(foe), null, 'no row, no key');
assert.deepStrictEqual(Object.keys(KEY_ROWS), [], 'keys-core keys no boss (the per-act key lanes add rows, scratch/audit-keys.md section 3)');
let t = 1; const log = [];
const BR = makeBossRead({ time: () => t, clank: () => log.push('clank'), sparks: () => log.push('sparks'), ring: (x, y, r, c) => log.push('ring:' + c), word: (x, y, w) => log.push('word:' + w), hitstop: () => {} });
assert.strictEqual(BR.takes(foe, 'light', 140), null, 'a boss with no key row: takes() is null (his own code decides, as before)');
KEY_ROWS.testkey = [{ ph: 1, key: 'plunge' }, { ph: 2, key: 'throw', word: 'THE VALVE' }];
try {
  assert.deepStrictEqual(BR.takes(foe, 'light', 140), { key: 'plunge', ok: false, word: 'FROM ABOVE' }); assert.deepStrictEqual(BR.takes(foe, 'plunge', 140), { key: 'plunge', ok: true, word: 'FROM ABOVE' });
  assert.ok(BR.turnedKey(foe, 140, 'plunge') && log.includes('word:FROM ABOVE') && log.includes('ring:' + KEYS.plunge.col) && log.includes('clank'), 'a wrong blow CLANKS and NAMES the key, the glyph flashes in its colour');
  t = 2; log.length = 0; assert.ok(BR.auto(foe, 140, { hp: 100, mode: 'idle', broken: 0 }) && log.includes('word:FROM ABOVE'), 'auto(): a silent no-damage hit on a keyed boss names his key');
  t = 3; log.length = 0; foe.phase = 2; assert.deepStrictEqual(BR.takes(foe, 'throw', 140), { key: 'throw', ok: true, word: 'THE VALVE' }, 'a phase swaps the key (B14: it counts as the new move), a row may say its own word');
  const ops = []; const g = new Proxy({}, { get: (o, k) => (k in o ? o[k] : typeof k === 'string' && /^(save|restore|beginPath|moveTo|lineTo|arc|stroke)$/.test(k) ? () => ops.push(k) : undefined), set: (o, k, v) => { o[k] = v; return true; } });
  assert.ok(BR.drawKey(g, foe, 0, 0, 3) && ops.includes('stroke') && g.strokeStyle === KEYS.throw.col, 'drawKey draws his glyph in his key colour');
  for (const k of KEY_ORDER) { ops.length = 0; assert.ok(drawKeyGlyph(g, k, 50, 50, 1) && ops.includes('stroke') && ops[0] === 'save' && ops[ops.length - 1] === 'restore', k + ': its glyph draws (and restores the canvas)'); }
  assert.ok(glyphAt('sweep', foe).y > foe.y - 1 && glyphAt('plunge', foe).y < foe.y - foe.h && glyphAt('behind', foe).x < foe.x, 'the glyph sits low for the low keys, high for the high ones, at his back for FROM BEHIND');
  assert.ok(!BR.drawKey(g, { ...foe, alive: false }, 0, 0, 3), 'a dead boss shows no key');
} finally { delete KEY_ROWS.testkey; }
assert.ok(/BR\.keyOf\(e\)\) BR\.drawKey\(g, e, cx, cy, time\);/.test(main), 'main.js draws the key over a keyed boss or mini');
assert.ok(/const kt = tag && \(e === boss \|\| e\.xpRole === 'mini'\) \? BR\.takes\(e, tag, fromX\) : null; if \(kt\) \{ if \(kt\.ok\) e\.keyHit = time; else if \(!GB\.openOf\(e\)\) BR\.turnedKey\(e, fromX, kt\.key\); \}/.test(main), 'hurtEnemy0 asks the key once, before the per-boss ladder');
/* 5. B13, THE DUELIST'S WALL (claude/keyscore): the four waiting rooms are always hittable, guarded by angle */
{
  for (const t of ['lance', 'closedhelm', 'captain', 'quarter']) {
    assert.strictEqual(GUARD[t], 'wall', t + ': his front is a wall (B11), not a flat NO');
    const e = { t, x: 100, y: 200, w: 24, h: 40, face: 1, alive: true };
    assert.ok(BR.beats(e, 60, false) && BR.beats(e, 140, true) && !BR.beats(e, 140, false), t + ': beaten from behind or from above, turned from the front at his height'); }
  for (const gone of ["number(e.x, e.y - 44, 'THE SEA HAS HIM'", "number(e.x, e.y - 30, 'HER GUARD HOLDS'", "number(e.x, e.y - e.h - 8, 'HIS PLATE TURNS IT'", "hintMsg = 'NOTHING GETS THROUGH HIS WARD."])
    assert.ok(!main.includes(gone), 'the flat NO is gone: ' + gone);
  assert.ok(main.includes("if (angB && GUARD_WALL(e)) dmg = Math.max(1, Math.round(dmg * BR_ANGLE.wall / BR_ANGLE.mul));") && main.includes("const wallUp = e => e.t !== 'quarter' || !!e.guard || e.mode === 'stride' || e.mode === 'stanceTell';"), 'round or over the wall a blow lands at ANGLE.wall; the Quartermaster drops hers to commit');
  assert.ok(/if \(blow && GUARD_WALL\(e\) && wallUp\(e\) && e\.mode !== 'sleep' && !GB\.openOf\(e\) && !BR\.beats\(e, fromX, pl \|\| \(!P\.ground && P\.y < e\.y - e\.h \* 0\.5\), false\)\) \{/.test(main), 'the wall turns a front blow at his height, outside his openings');
  assert.ok(/if \(e\.t === 'quarter'\) e\.flash = Math\.max\(e\.flash \|\| 0, 0\.06\);/.test(main), 'the Quartermaster still answers a cut into her EN GARDE'); }
console.log('blow-tags: ok (' + hooks + ' boss hooks get the tag; no boolean plunge gate; throw / reflect / riposte tagged; 8 keys, words, glyphs; no boss keyed yet; B13: the Lance, the Paladin, the Captain and the Quartermaster guard by angle)');
