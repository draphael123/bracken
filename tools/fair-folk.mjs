// tools/fair-folk.mjs - NO GOBLIN IS DRAWN IN THE HARVEST FAIR (claude/fairfix6, Daniel's 10-05 live playtest: "orangish goblin-looking foes near the fair's
// start"). The fair is past the Goblin Queen, so its foes are the goblins' proven AIs under fair folk's skins - and tools/goblin-lint.mjs only asks that a
// skin EXISTS: the fair's STRONGMAN was the goblin brute's own sheet recoloured tan (src/redraw/variety_skins.js), so it passed while every frame of it was
// a hunched goblin with goblin ears. This asks the picture.
//   For every kind of foe in the fair (its type + its reskin flag), in the page: it is put beside the hero and DRAWN - asleep/unwoken and woken, at rest,
//   in each of its tells, and flashing from a blow - then killed, and its BODY drawn for a few frames. Every set it was drawn from (e.lastSet, and the
//   corpse's c.shown) is collected, and EVERY FRAME of each set (so every state that set can show: walk, attack, hurt, death) is compared, alpha mask
//   against alpha mask, with every frame of every goblin sheet in the game (GOBLIN_KINDS, as goblin-lint keeps them). It fails when
//     - a set drawn for a fair foe IS a goblin sheet (SPR.brute, SPR.archer, ...): a missing reskin falling back to the base
//     - a frame's silhouette matches a goblin frame's (>= MATCH of the pixels agree): a recolour of a goblin, which is the strongman this lane redrew
//     - a fair kind could not be drawn or killed (so it was never asked)
// Red on master 2423ff42 (the strongman's five frames match the brute's; tools/fair-folk.mjs run in a worktree of it); green on claude/fairfix6.
//   node tools/fair-folk.mjs            (PORT from tools/ports.mjs)
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { openPage } from './cdp.mjs';

/* the goblin kinds: tools/goblin-lint.mjs's list, read from its source so the two never drift */
const lint = readFileSync(new URL('./goblin-lint.mjs', import.meta.url), 'utf8');
const m = lint.match(/GOBLIN_KINDS = new Set\(\[([^\]]+)\]\)/);
assert.ok(m, 'tools/goblin-lint.mjs has no GOBLIN_KINDS list to read');
const GOBLINS = [...m[1].matchAll(/'([a-z0-9]+)'/gi)].map(q => q[1]).concat(['chief', 'gqueen', 'prince']);   /* (and the goblin royals, never reskinned: a mask that matched one would be a goblin too) */
const MATCH = 0.93;
const pg = await openPage({ audio: false });
let R;
try {
  R = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true });
    const GOB = ${JSON.stringify(GOBLINS)}, SPR = BK.SPR, foes = () => typeof BK.enemies === 'function' ? BK.enemies() : BK.enemies, corp = () => typeof BK.corpses === 'function' ? BK.corpses() : BK.corpses;
    const li = LEVELS.findIndex(l => l.id === 'fair'), load = () => { BK.load(li); BK.state = 'play'; BK.god = true; BK.sim(4); };
    const flag = e => [e.t, e.cnSkin || '', e.shy ? 'shy' : '', e.juggler ? 'juggler' : '', e.scare ? 'scare' : '', e.elite ? 'elite' : ''].filter(Boolean).join(':');
    /* the alpha mask of a frame, packed, with its size */
    const maskOf = c => { if (!c || !c.getContext) return null; if (c.__mask) return c.__mask; const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data, a = new Uint8Array(c.width * c.height); let n = 0;
      for (let i = 0; i < a.length; i++) if (d[i * 4 + 3] > 40) { a[i] = 1; n++; } return (c.__mask = { w: c.width, h: c.height, a, n }); };
    const gobSets = new Map(); for (const k of GOB) if (SPR[k] && SPR[k].R) gobSets.set(SPR[k], k);
    const gobFrames = []; for (const [s, k] of gobSets) s.R.forEach((c, i) => { const q = maskOf(c); if (q && q.n) gobFrames.push({ k, i, q }); });
    /* the best agreement between a frame and any goblin frame of the same size (agreement over the union of the two silhouettes) */
    const likeGoblin = c => { const q = maskOf(c); if (!q || !q.n) return null; let best = null;
      for (const g of gobFrames) { if (g.q.w !== q.w || g.q.h !== q.h) continue; let both = 0, any = 0; for (let i = 0; i < q.a.length; i++) { const x = q.a[i], y = g.q.a[i]; if (x || y) { any++; if (x && y) both++; } }
        const k = any ? both / any : 0; if (!best || k > best.k) best = { k, gob: g.k, f: g.i }; } return best; };
    load(); const kinds = []; for (const e of foes()) { if (e === BK.boss && false) continue; const f = flag(e); if (!kinds.some(k => k.f === f)) kinds.push({ f, t: e.t }); }
    const rows = [];
    for (const k of kinds) { const row = { f: k.f, sets: [], errs: [] }; const sets = new Set();
      load(); const e = foes().find(q => flag(q) === k.f); if (!e) { row.errs.push('not found after a reload'); rows.push(row); continue; }
      const boss = e === BK.boss || e.t === 'wickerqueen';
      for (const q of foes()) if (q !== e) q.alive = false;
      e.x = BK.P.x + 40; e.y = BK.P.y; e.vx = 0; e.vy = 0; e.hp = 9999; e.frozen = 0; e.waiting = false;
      const draw = n => { for (let i = 0; i < n; i++) { BK.step(1); if (e.lastSet) sets.add(e.lastSet); } };
      draw(30);
      if (e.scare !== undefined) { e.woke = !e.woke; draw(4); e.woke = !e.woke; draw(2); }
      const modes = new Set([e.mode, 'stand', 'walk', 'idle', 'still', 'creep', 'glow', 'strike', 'recover', 'raise', 'slam', 'sweep', 'wind', 'lobTell', 'lob', 'bottleTell', 'down', 'getup', 'rear', 'charge', 'skid', 'jerk', 'callTell', 'call', 'caneTell', 'cane', 'throwTell', 'throw', 'swingTell', 'swing', 'catch', 'burn', 'stamp']);
      const st0 = e.st ? JSON.parse(JSON.stringify(e.st)) : null, m0 = e.mode;
      if (!boss) for (const md of modes) { e.mode = md; if (e.st) e.st.mode = md; e.modeT = 0.3; e.draw = md === 'raise' ? 0.4 : 0; e.flash = 0; BK.step(1); if (e.lastSet) sets.add(e.lastSet); }
      e.mode = m0; if (st0) Object.assign(e.st, st0); e.draw = 0;
      e.hurtT = 0.3; e.flash = 0.2; draw(2);
      if (!boss) { const n0 = corp().length; e.hp = 1; e.frozen = 0; e.shield = 0; e.armor = 0; if (e.t === 'wickerman') { e.wmBurn = 3; e.mode = 'burn'; }
        BK.combat2().strike(e, 'heavy', 1); if (e.alive) row.errs.push('the blow did not kill it (its body was never drawn)');
        else { BK.step(1); const cs = corp().slice(n0); const c = cs.find(q => q.t === e.t) || cs[0]; BK.step(10); if (c && c.shown) sets.add(c.shown); else row.errs.push('no body was drawn'); } }
      if (!sets.size) row.errs.push('it was never drawn');
      for (const s of sets) { const name = Object.keys(SPR).find(q => SPR[q] === s) || '(unnamed set)'; row.sets.push(name);
        if (gobSets.has(s)) { row.errs.push('drawn from the GOBLIN sheet SPR.' + gobSets.get(s)); continue; }
        (s.R || []).forEach((c, i) => { const b = likeGoblin(c); if (b && b.k >= ${MATCH}) row.errs.push(name + ' frame ' + i + ' is the goblin ' + b.gob + "'s frame " + b.f + ' (' + Math.round(b.k * 100) + '% of the silhouette)'); });
        row.worst = Math.max(row.worst || 0, ...(s.R || []).map(c => (likeGoblin(c) || { k: 0 }).k)); }
      rows.push(row); }
    return { rows, gob: gobFrames.length }; })()`, 600000);
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
let bad = 0;
assert.ok(R && R.gob > 20, 'no goblin frames to compare against (' + (R && R.gob) + ')');
for (const row of R.rows) { const ok = !row.errs.length; if (!ok) bad++;
  console.log((ok ? '  ok   ' : '  FAIL ') + row.f.padEnd(26) + ' sets: ' + row.sets.join(', ') + '  (closest to a goblin: ' + Math.round((row.worst || 0) * 100) + '%)' + (ok ? '' : '\n         <- ' + row.errs.slice(0, 6).join('\n         <- '))); }
assert.ok(R.rows.length >= 8, 'too few fair foe kinds were found: ' + R.rows.length);
console.log(bad ? bad + ' FAILED' : 'ok  fair-folk  ' + R.rows.length + ' fair foe kinds drawn alive, in their tells, hurt and dead: no goblin sheet and no goblin silhouette (' + R.gob + ' goblin frames compared, match at ' + MATCH * 100 + '%)');
process.exit(bad ? 1 : 0);
