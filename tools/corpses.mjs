// tools/corpses.mjs - A RESKINNED FOE DIES IN ITS OWN SKIN (claude/corpses, Daniel 10-02: "the reskinned enemies use a goblin sprite when they
// die"). The living draw picks a foe's set by a chain of reskin flags (canal cnSkin / lamplighter, the Fair's shy and juggler, the Theatre's cast,
// the bone archer); the corpse, the knocked-back frame and the hurt flash used to look up SPR[e.t] again and so drew the goblin / drunk /
// archer underneath. This is the page test for every reskin on the build: for each reskinned foe in its level it
//   (1) draws it alive and notes the set it wore (e.lastSet),
//   (2) puts a blow on it (hurt + flash) and draws again: the frame it showed must exist in that set, and the set is still the reskin,
//   (3) kills it and draws the body for a few frames: the set the CORPSE drew (c.shown) must be the reskin, never SPR[e.t], and its frame must exist.
// usage: node tools/corpses.mjs            (assert)
//        node tools/corpses.mjs shots TAG  (also writes work/claude/corpses/TAG/<level>-<skin>.png: the body, 8x, mid-tumble)
import { ROOT } from './cdp.mjs';
import { sweepLevels } from './sweep-pages.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const shots = process.argv[2] === 'shots' ? (process.argv[3] || 'after') : null;
/* (redcleanup 10-26) one level per call, a fresh page every 5 levels, a hard limit per level that names it (was: all 30 levels in one page under one 600 s limit - ~7 min when it worked, a silent
   hang when the PC was short of RAM). Every check is kept; CORPSES_ONLY=a,b still narrows the list. tools/sweep-pages.mjs. */
const ALL_IDS = ['sealedpyramid', 'buriedcity', 'wood', 'marsh', 'oreroad', 'minecart', 'canal', 'fair', 'theatre', 'welltown', 'redgorge', 'skyroad', 'rootway', 'palisadewood', 'rookery', 'undercrown', 'lamplit', 'witchlight', 'fallingtower', 'burial', 'unburied', 'flotilla', 'keep', 'deep', 'longwater', 'causeway', 'underwell', 'ksar', 'hornetsnest', 'spore', 'underleaf'];
const ONLY = (process.env.CORPSES_ONLY || '').split(',').filter(Boolean), IDS = ALL_IDS.filter(id => !ONLY.length || ONLY.includes(id));
let bad = 0;
const pageErrs = new Set();
try {
  const code = id => `(async()=>{ const { LEVELS } = await import('/src/level.js'); const res = [], seen = new Set();
    BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true });
    const foes = () => typeof BK.enemies === 'function' ? BK.enemies() : BK.enemies, corp = () => typeof BK.corpses === 'function' ? BK.corpses() : BK.corpses;
    const flag = e => e.cnSkin ? 'cn:' + e.cnSkin : e.lamplighter ? 'lamplighter' : e.shy ? 'shy' : e.juggler ? 'juggler' : e.flyman ? 'flyman' : e.prompter ? 'prompter' : e.bandit ? 'bandit' : e.usher ? 'usher' : e.patron ? 'patron' : e.footlights ? 'footlights' : (e.bone && e.t === 'archer') ? 'bonearcher' : null;
    for (const id of ${JSON.stringify([id])}) { const li = LEVELS.findIndex(l => l.id === id); if (li < 0) continue;
      const kinds = []; BK.load(li); BK.state = 'play'; BK.god = true; BK.sim(4);
      for (const e0 of foes()) { const f = flag(e0); if (f && !kinds.some(k => k.f === f)) kinds.push({ f, t: e0.t, x: e0.x, y: e0.y, i: foes().indexOf(e0) }); }
      for (const k of kinds) { const row = { level: id, flag: k.f, t: k.t, errs: [] };
        BK.load(li); BK.state = 'play'; BK.god = true; BK.sim(4); if (BK.canal && BK.canal()) for (const f of BK.canal().fogs) { f.fade = 0; f.clear = 9999; }
        const e = foes().find(q => flag(q) === k.f && q.t === k.t); if (!e) { row.errs.push('foe not found after reload'); res.push(row); continue; }
        if (e.cnSkin === 'tidecrab') { e.noBurrow = true; e.tideUp = true; e.mode = 'walk'; e.gone = 0; } if (e.cnSkin === 'sanddjinn' || e.cnSkin === 'firedjinn') { BK.P.skin && (BK.P.skin.sips = 3); e.ldOpen = 5; e.mode = e.cnSkin === 'sanddjinn' ? 'mud' : 'doused'; }   /* (claude/djinn3) a lesser djinn is cut only once a pour has opened it: open it first */   /* a buried tide crab is not to be hit: bring it up first */ if (e.pool) { BK.P.x = e.x - 48; BK.P.y = e.y; BK.P.vx = 0; BK.P.vy = 0; } else { e.x = BK.P.x + 48; e.y = BK.P.y; } e.vx = 0; e.vy = 0;   /* (a water foe is held to its pool: the hero goes to it) */ e.hp = 99; e.frozen = 9; e.waiting = false; for (let q = 0; q < (e.pool ? 240 : 40); q++) BK.step(1);   /* (the camera has a long way to come to a hero moved to a pool) */
        if (e.mcRide) { BK.tp(e.mcRide.trig + 1, e.mcRide.row - 1); for (let i = 0; i < 40; i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); } BK.look(Math.round(e.x / 16), e.mcRide.row - 1); BK.step(1); }   /* (batch83 integ: deeprails2 riders pace away - the camera follows the RIDER, not the trigger column) */   /* (claude/minecartart) a cart-rider waits off screen until the hero passes its column: bring the hero there, the cart rolls in and the rider is drawn */
        if (!e.mcRide && (e.x < 200 || e.x > 300)) {   /* (claude/hornetsnest: the view is ~20 tiles wide - THE HORNET'S NEST's first hornet at col 27 was off it) */ BK.look(Math.round(e.x / 16), Math.round(e.y / 16)); BK.step(1); }   /* (claude/oldtusker) the camera on the foe: a reskin placed past the first screen (the Lumber Trail's pine moth at col 47) died off screen, and its corpse - culled - read as nothing drawn */
        const alive = e.lastSet; row.liveSame = alive === BK.SPR[e.t]; if (alive && row.liveSame) row.errs.push('the living foe wears the BASE sheet (' + e.t + '), not its reskin'); if (!alive) row.errs.push('the living foe was never drawn (off screen?)');
        e.hurtT = 0.3; e.flash = 0.2; BK.step(1);
        const hurtF = e.lastFrame; if (e.lastSet !== alive) row.errs.push('the hurt frame drew a different set from the living one');
        if (alive && !(alive.R && alive.R[hurtF])) row.errs.push('the hurt frame ' + hurtF + ' is not in the ' + k.f + ' set (' + (alive.R ? alive.R.length : '?') + ' frames)');
        const n0 = corp().length; e.hp = 1; e.frozen = 0; e.shield = 0; e.armor = 0; e.mk = null; /* (theatre4) a mummer sheds his mask: a comedy cartwheels from the first blow, and this check is about the corpse, not the mask */ BK.combat2().strike(e, 'heavy', 1); if (e.alive) { row.errs.push('the blow did not kill it'); res.push(row); continue; } BK.step(1);
        const cs = corp().slice(n0).filter(c => c.t === e.t || c.t !== 'cap'); const c = cs.find(q => q.t === e.t) || cs[0];
        if (!c && e.mini && BK.bossBodies().length) { const bb = BK.bossBodies()[BK.bossBodies().length - 1]; row.shown = bb.set === alive ? 'the reskin' : 'another set'; if (bb.set !== alive) row.errs.push('the mini body drew ' + row.shown + ', not the set he lived in'); if (!(bb.set && bb.set.R && bb.set.R[bb.frame])) row.errs.push('the mini body frame ' + bb.frame + ' is not in his set'); res.push(row); continue; }   /* (dr3art) a MINI leaves a boss body (bossBodies), not a corpse: THE FOREMAN wears his own skin - the same proof, on the body he leaves */
        if (!c) { row.errs.push('no corpse was made'); res.push(row); continue; }
        BK.step(12); row.shown = c.shown === alive ? 'the reskin' : c.shown === BK.SPR[e.t] ? 'THE BASE SHEET (' + e.t + ')' : c.shown ? 'another set' : 'nothing drawn';
        if (c.shown !== alive) row.errs.push('the corpse drew ' + row.shown + ', not the set the foe lived in');
        if (c.shown && !(c.shown.R && c.shown.R[c.frame])) row.errs.push('the corpse frame ' + c.frame + ' is not in the set it drew');
        if (${shots ? 'true' : 'false'}) { const V = BK.view, sx = Math.max(0, Math.round(c.x - V.x) - 40), sy = Math.max(0, Math.round(c.y - V.y) - 36), cv = document.createElement('canvas'); cv.width = 640; cv.height = 360; const g = cv.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, sx, sy, 80, 45, 0, 0, 640, 360); row.png = cv.toDataURL('image/png'); }
        res.push(row); } }
    return res; })()`;
  const got = await sweepLevels(IDS, async (pg, id, ms) => { const x = await pg.evalp(code(id), ms); for (const e of pg.errors.slice(0, 3)) pageErrs.add(e); return x; }, { label: 'corpses', chunk: 5, perLevelMs: +(process.env.SWEEP_LEVEL_MS || 150000), openOpts: { audio: true } });
  const rows = got.flatMap(g => g.error ? [{ level: g.id, flag: '-', t: '-', errs: [g.error] }] : (g.result || []));
  for (const row of rows) {
    const ok = !row.errs.length; if (!ok) bad++;
    console.log((ok ? '  ok   ' : '  FAIL ') + (row.level + ' ' + row.flag + ' (' + row.t + ')').padEnd(34) + ' corpse: ' + (row.shown || '-') + (row.errs.length ? '  <- ' + row.errs.join('; ') : ''));
    if (shots && row.png) { const dir = join(ROOT, 'work/claude/corpses', shots); mkdirSync(dir, { recursive: true }); writeFileSync(join(dir, row.level + '-' + row.flag.replace(/[^a-z0-9]+/gi, '-') + '.png'), Buffer.from(row.png.split(',')[1], 'base64')); }
  }
  if (!rows.length) { console.log('  FAIL no reskinned foe was found in canal / fair / theatre'); bad++; }
  if (pageErrs.size) console.log('page errors: ' + [...pageErrs].slice(0, 3).join(' | '));
} finally { /* each sweepLevels page is closed by the helper */ }
console.log(bad ? bad + ' FAILED' : 'ok  corpses  every reskinned foe\'s hurt frame and body are drawn in its own skin');
process.exit(bad ? 1 : 0);
