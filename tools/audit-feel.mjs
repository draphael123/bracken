// tools/audit-feel.mjs — COMBAT FEEL NUMBERS: what every hero blow leaves behind when it lands. Findings only; it changes nothing.
// For each hero, each blow (light 1/2/3, the held heavy - the knight's SHIELD CHARGE and its bash -, the dash strike, the dash attack, the
// rising cut, the low sweep, the plunge, the riposte, and every active skill in the hero's tree) is thrown at a standing foe in Bracken Wood,
// once against a plain foe and once against the same foe carrying maxHp (the field the game's boss code paths test: blowStop's 0.8, the
// knockback rules). On the frame the blow lands it reads, from the game itself: damage, hitstop (BK.stop), shake and kick, poise added, the
// foe's knock velocity and how far it travels in the next 20 frames, and every SFX voice called on the swing and on the hit (the SFX object
// is wrapped in the page). The knight's shield is also tested: a yellow and a red blow forced into him while he braces, rushes, blocks, and
// does nothing (RUSH=type:mode,... picks the blows; default a sprig's bite).
//   node tools/audit-feel.mjs                  every hero -> SCRATCH/feel.json and a table on stdout
//   node tools/audit-feel.mjs knight,pirate    those heroes
//   FOE=brute RUSH=sprig:biteTell,troll:smashTell PORT=5908 node tools/audit-feel.mjs
// Setup that is forced, and said so in the report: the riposte window is opened by setting P.riposteT, and a skill is equipped by writing
// PROG.skill / PROG.skill2 and lending that hero its HEAVY node and its skill nodes (nothing else from the tree, so no talent bends a number).
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { openAudit, SCRATCH } from './audit-lib.mjs';

const heroes = (process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'knight,warden,pyro,paladin,pirate,reaper').split(',');
mkdirSync(SCRATCH, { recursive: true });

async function FEEL(o) {
  const BK = window.BK, P = BK.P, A = window.__AUD, AU = await import('/src/audio.js'), lvm = await import('/src/level.js');
  if (!window.__sfxWrapped) { window.__sfxLog = [];
    for (const k of Object.keys(AU.SFX)) { const f = AU.SFX[k]; if (typeof f !== 'function') continue;
      AU.SFX[k] = function (...a) { const r = f.apply(this, a); if ((k === 'hurtOf' || k === 'dieOf') && typeof r === 'function') return function (...b) { window.__sfxLog.push(k + ':' + a[0]); return r.apply(this, b); }; if (k !== 'hurtOf' && k !== 'dieOf') window.__sfxLog.push(k); return r; }; }
    window.__sfxWrapped = true; }
  const wood = lvm.LEVELS.findIndex(l => l.id === 'wood'), rows = [];
  const key = (type, k) => { const code = { right: 'ArrowRight', left: 'ArrowLeft' }[k]; document.dispatchEvent(new KeyboardEvent(type, { key: code, code, bubbles: true })); window.dispatchEvent(new KeyboardEvent(type, { key: code, code, bubbles: true })); };
  const h = o.hero, tree = window.BKT.TREE.filter(n => n.hero === h), skills = tree.filter(n => n.active).map(n => n.id);
  /* ONLY WHAT THE BLOW NEEDS is lent: HEAVY, and the one skill under test (two skills owned would put the other on G, and a passive one
     - a consecration left on the ground - would land its own ticks on the foe and be counted as the blow) */
  const setup = (boss, lend) => { BK.setHero(h); A.settings(); const tal = BK.PROG.talents = BK.PROG.talents || {};
    tal[h] = Object.assign({}, { heavy: 1 }, lend || {});
    BK.load(wood); BK.state = 'play'; BK.god = false; BK.sim(3); for (const q of BK.enemies()) q.alive = false; A.clearKeys(); BK.sim(20); BK.reset(); P.loaded = true; P.barrels = 1;
    const n0 = BK.enemies().length; BK.spawnEnt({ t: o.foe, x: Math.round(P.x / 16) + 3, y: Math.round(P.y / 16) - 1 });
    const e = BK.enemies().length > n0 ? BK.enemies()[BK.enemies().length - 1] : null; if (!e) return null;
    BK.sim(10); e.hp = 9999; if (boss) e.maxHp = 9999; e.poise = 0; return e; };
  const blows = [['light 1', {}], ['light 2', { nth: 2 }], ['light 3', { nth: 3 }], ['heavy (held)', { hold: true }], ['dash strike', { dash: true }], ['dash attack', { dash: true, atk: true }],
    ['rising cut', { up: true }], ['low sweep', { down: true }], ['plunge', { plunge: true }], ['riposte', { riposte: true }], ...skills.map(s => ['skill ' + s, { skill: s }])];
  let dashLine = null;
  for (const [name, b] of blows) for (const boss of [false, true]) {
    const e = setup(boss, b.skill ? { [b.skill]: 1 } : null); if (!e) { rows.push({ hero: h, blow: name, boss, error: 'no foe' }); continue; }
    if (b.skill) { BK.PROG.skill = b.skill; BK.PROG.skill2 = b.skill; }
    const ex = P.x + (b.dash ? 30 : b.hold && h === 'knight' ? 40 : 16), ey = e.y; let measure = false, pressed = 0, fPress = null, hit = null, swingSounds = [], hitSounds = [], track = 0, xh = 0, maxKnock = 0, lines = [];
    if (b.plunge) { P.x = ex; P.y = ey - 72; P.vy = 0; P.ground = false; }
    for (let f = 0; f < 200; f++) {
      if (f === 0) P.cds = {};   /* every skill's wait cleared: the boss row runs right after the foe row */
      if (!hit) { e.x = ex; e.y = ey; e.vx = 0; if (!b.plunge && !b.dash && !b.skill && !(b.hold && h === 'knight')) { P.x = ex - 16; } P.face = 1; }
      P.st = P.maxSt; P.hp = P.maxHp; P.inv = 1;
      /* the script */
      if (!b.nth && !b.hold && !b.dash && !b.plunge && !b.skill && f === 2) { if (b.up) BK.keys.up = true; if (b.down) BK.keys.down = true; if (b.riposte) P.riposteT = 1; BK.press('atk'); measure = true; fPress = f; }
      if (b.up && f === 8) BK.keys.up = false; if (b.down && f === 8) BK.keys.down = false;
      if (b.nth) { if (f === 2) { BK.press('atk'); pressed = 1; } else if (pressed < b.nth && P.atk < 0 && P.combo === pressed && f > 4) { BK.press('atk'); pressed++; if (pressed === b.nth) { measure = true; fPress = f; } } }
      if (b.hold) { if (f === 2) { BK.keys.atk = true; measure = true; fPress = f; } if (f === 110) BK.keys.atk = false; }   /* held, never tapped: a tap would throw a light swing first and that is what would land */
      /* THE DASH, forced: a double tap is read off real key edges the harness cannot raise, so the dash is started the way its own code starts it */
      if (b.dash) { if (f === 5) { P.dash = h === 'pyro' ? 0.2 : h === 'paladin' ? 0.14 : 0.17; P.dashCd = 0.55; P.face = 1; measure = true; fPress = f; } if (f >= 5 && f < 16) { BK.keys.right = true; if (P.dash > 0) P.vx = 215; } if (f === 16) BK.keys.right = false; if (b.atk && f === 7) BK.press('atk'); }
      if (b.plunge && f === 2) { BK.keys.down = true; BK.press('atk'); measure = true; fPress = f; } if (b.plunge && f === 40) BK.keys.down = false;
      if (b.skill) { if (f === 2) { BK.press(h === 'reaper' ? 'skill2' : 'throw'); measure = true; fPress = f; } }   /* the Death Knight's F is his own: his tree skill is on G */
      window.__sfxLog.length = 0; BK.log = []; BK.sim(1);
      const snd = window.__sfxLog.slice();
      const ls = BK.log.filter(q => q.k === 'dmgE' && q.e === e);
      if (measure && !hit && f - fPress <= 3 && !ls.length) swingSounds.push(...snd);
      for (const l of ls) lines.push(window.__AUD.stackLine(l.stack));
      let l = measure && !hit ? ls[0] : null;
      if (l && b.dash && b.atk) { l = ls.find(q => window.__AUD.stackLine(q.stack) !== dashLine) || null; }
      if (l) { hit = { f: f - fPress, dmg: +l.dmg.toFixed ? +(+l.dmg).toFixed(1) : l.dmg, hpLost: +(l.hp0 - l.hp).toFixed(1), poise: +((l.poise || 0) - (l.poise0 || 0)).toFixed(1), broken: l.broken > 0, stop: +Math.max(l.stop, BK.stop).toFixed(3), shake: +Math.max(l.shake, BK.shake).toFixed(2), kick: +Math.max(Math.abs(l.kick), Math.abs(BK.kick)).toFixed(2), vx: Math.round(e.vx || 0), vy: Math.round(e.vy || 0), stagger: +(e.stagger || 0).toFixed(2), line: window.__AUD.stackLine(l.stack), atk: +(+l.atk).toFixed(3), heavy: l.heavy, combo: l.combo, kind: l.swingKind };
        hitSounds = snd; xh = e.x; if (name === 'dash strike') dashLine = hit.line; continue; }
      if (hit) { maxKnock = Math.max(maxKnock, Math.abs(e.x - xh)); if (++track >= 20) break; }
    }
    A.clearKeys(); key('keyup', 'right');
    rows.push({ hero: h, blow: name, boss, hit, knock20: Math.round(maxKnock), swingSounds: [...new Set(swingSounds)], hitSounds: [...new Set(hitSounds)], lines: [...new Set(lines)].slice(0, 4) });
  }
  return rows;
}

/* THE KNIGHT'S SHIELD, against a blow forced into him: braced (swing held, not let go), rushing, blocking, and doing nothing */
async function RUSH(o) {
  const BK = window.BK, P = BK.P, A = window.__AUD, lvm = await import('/src/level.js'), rows = [];
  const wood = lvm.LEVELS.findIndex(l => l.id === 'wood');
  for (const spec of o.specs) { const [t, mode] = spec.split(':');
    for (const how of ['nothing', 'block', 'brace', 'rush', 'rush (bull rush)']) {
      BK.setHero('knight'); A.settings(); const tal = BK.PROG.talents = BK.PROG.talents || {}; tal.knight = Object.assign({}, { heavy: 1 }, how === 'rush (bull rush)' ? { bash: 1 } : {});
      BK.load(wood); BK.state = 'play'; BK.god = false; BK.sim(3); for (const q of BK.enemies()) q.alive = false; A.clearKeys(); BK.sim(20); BK.reset();
      const n0 = BK.enemies().length; BK.spawnEnt({ t, x: Math.round(P.x / 16) + 4, y: Math.round(P.y / 16) - 1 }); const e = BK.enemies().length > n0 ? BK.enemies()[BK.enemies().length - 1] : null;
      if (!e) { rows.push({ spec, how, error: 'no spawn' }); continue; }
      BK.sim(5); e.hp = 9999; const x0 = P.x, ex = x0 + (how.startsWith('rush') ? 70 : 26); let forced = -1, got = [], hp0 = P.maxHp, rushF = null, sawRush = false, braceAt = null;
      for (let f = 0; f < 160; f++) {
        if (forced < 0) { e.x = ex; e.vx = 0; e.face = -1; }
        P.st = P.maxSt; P.inv = 0; P.grace = 0; if (f === 0) { P.hp = P.maxHp; P.face = 1; }
        if (how === 'block') BK.keys.block = f > 1;
        if (how === 'brace' && f === 2) BK.keys.atk = true;   /* held, never tapped: a tap throws a light swing that lands first */
        if (how.startsWith('rush') && f === 2) BK.keys.atk = true;
        if (P.charge > 0 && braceAt === null) braceAt = f;
        if (how === 'brace' && braceAt !== null && f === braceAt + 8 && forced < 0) { e.mode = mode; e.modeT = 0.05; e.face = -1; forced = f; }
        if (how.startsWith('rush') && P.rush > 0 && !sawRush) { sawRush = true; rushF = f; e.mode = mode; e.modeT = 0.02; e.face = -1; forced = f; }
        if ((how === 'nothing' || how === 'block') && f === 10) { e.mode = mode; e.modeT = 0.05; e.face = -1; forced = f; }
        BK.log = []; BK.sim(1);
        for (const l of BK.log) { if (l.k === 'dmgP') got.push({ f, res: l.res, dmg: l.dmg, unblockable: l.unblockable, rushing: P.rush > 0, bracing: P.charge > 0, block: !!P.block }); if (l.k === 'dmgE' && l.e === e) got.push({ f, bash: true, dmg: l.dmg }); }
        if (how === 'brace' && f > (braceAt || 0) + 60) BK.keys.atk = false;
        if (forced >= 0 && f > forced + 90) break; }
      A.clearKeys();
      rows.push({ spec, how, forcedAt: forced, rushF, braceAt, hpLost: +(hp0 - P.hp).toFixed(1), events: got.slice(0, 8), modeAfter: e.mode });
    } }
  return rows;
}

async function main() {
  const pg = await openAudit(); const out = { rows: [], rush: [] };
  try {
    for (const h of heroes) { const r = await pg.evalp('(' + FEEL.toString() + ')(' + JSON.stringify({ hero: h, foe: process.env.FOE || 'sprig' }) + ')'); out.rows.push(...r);
      for (const q of r) console.log((q.hero + ' ' + q.blow + (q.boss ? ' [boss]' : '')).padEnd(40), q.hit ? ['dmg ' + q.hit.dmg, 'stop ' + q.hit.stop, 'shake ' + q.hit.shake, 'kick ' + q.hit.kick, 'poise +' + q.hit.poise, 'vx ' + q.hit.vx, 'knock ' + q.knock20, 'f' + q.hit.f, 'L' + q.hit.line, 'swing:' + q.swingSounds.join('/'), 'hit:' + q.hitSounds.join('/')].join('  ') : 'NO HIT ' + (q.error || '') + ' lines ' + q.lines.join(','));
      if (pg.errors.length) console.log('  page errors: ' + pg.errors.splice(0).slice(0, 3).join(' | ').slice(0, 300)); }
    if (heroes.includes('knight')) { out.rush = await pg.evalp('(' + RUSH.toString() + ')(' + JSON.stringify({ specs: (process.env.RUSH || 'sprig:biteTell').split(',') }) + ')');
      for (const q of out.rush) console.log(('SHIELD ' + q.spec + ' ' + q.how).padEnd(44), 'hp lost ' + q.hpLost, ' forced f' + q.forcedAt, ' rush f' + q.rushF, ' ' + JSON.stringify(q.events).slice(0, 200)); }
    writeFileSync(join(SCRATCH, 'feel.json'), JSON.stringify(out, null, 1));
    console.log('wrote ' + join(SCRATCH, 'feel.json'));
  } finally { pg.close(); }
}
main().catch(err => { console.error(err); process.exit(1); });
