// tools/audit-report.mjs — THE TABLES AND THE RANKED FINDINGS, from what the audit tools measured. It reads JSON and writes markdown; it
// runs nothing in the page. Every number in its output is one the tools read off the running game.
//   COMBAT=<dir with creatures.json> FEEL=<dir with feel.json> INPUT=<dir with input.json> CONTACT=<dir with contact.json> ANIM=<dir with anim.json> \
//     node tools/audit-report.mjs <outdir>        -> <outdir>/combat-tables.md, <outdir>/animation-tables.md, <outdir>/findings.json
// Thresholds, and why:
//   hit by air        the hurt box reaches > 2 px past the opaque body on a frame the creature is drawn with (the brief's number)
//   box short / long  the blow lands > 3 px short of / past the front of the frame it was live on (the hero's box is 10 wide: 5 px of it
//                     stands in front of P.x, and that is taken off)
//   lead time         frames from the ! or !! first showing to the first frame the blow lands; flagged > 6 frames (0.1 s) off the median,
//                     and under 15 frames (0.25 s) outright
//   no recovery       the next mark or the next landed blow comes < 6 frames after the last live frame of this one
//   facing            under 12% of the standing frame's opaque pixels change under a mirror: on a 20 px body that is less than one
//                     column's worth of difference either side, which does not read as a direction at 1x
//   confusable        two creatures in the same level whose standing silhouettes (16x16 coverage of their opaque boxes) correlate > 0.8,
//                     whose boxes are within 25% in both width and height, and whose mean colours are within 70 (RGB distance)
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const outDir = process.argv[2] || '.'; mkdirSync(outDir, { recursive: true });
const load = (dir, f) => { const p = dir && join(dir, f); return p && existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null; };
const C = load(process.env.COMBAT, 'creatures.json'), FEEL = load(process.env.FEEL, 'feel.json'), INPUT = load(process.env.INPUT, 'input.json');
const CON = load(process.env.CONTACT, 'contact.json'), ANIM = load(process.env.ANIM, 'anim.json');
const findings = { combat1: [], combat2: [], combat3: [], combat4: [], anim1: [], anim2: [], anim3: [] };
const md = [], am = [];
const med = a => { const s = a.filter(v => v !== null && v !== undefined).slice().sort((p, q) => p - q); return s.length ? s[s.length >> 1] : null; };
const r1 = v => v === null || v === undefined ? '-' : Math.round(v * 10) / 10;
const table = (out, head, rows) => { out.push('| ' + head.join(' | ') + ' |', '|' + head.map(() => '---').join('|') + '|'); for (const r of rows) out.push('| ' + r.map(v => v === null || v === undefined ? '-' : String(v)).join(' | ') + ' |'); out.push(''); };
const CONTACT_LINE = C && C.creatures ? null : null;

if (C) {
  /* THE TOUCH LINE, read from the source when an older sweep did not write it down: a body's contact damage is not a blow's frame data */
  if (!C.contactLine) C.contactLine = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').split('\n').findIndex(l => /damagePlayer\(e\.x, e\.t === 'hopper'/.test(l)) + 1;
  const cre = Object.values(C.creatures).filter(r => !r.skipped);
  const skipped = Object.values(C.creatures).filter(r => r.skipped);
  /* ---------- 1. HITBOXES ---------- */
  const hb = [];
  for (const r of cre) {
    const used = new Set(); for (const m of Object.keys(r.frames)) for (const h of Object.keys(r.frames[m])) { const q = r.frames[m][h]; if (!q.set) used.add(q.i); }
    for (const q of (r.hurt && r.hurt.frames) || []) if (!q[2]) used.add(q[1]);
    let air = null, ghost = null;
    for (const i of used) { const b = r.boxes[i]; if (!b || b.empty) continue;
      const a = Math.max(b.l + r.w / 2, r.w / 2 - b.r, b.t + r.h); if (!air || a > air.px) air = { px: a, i, lr: [b.l + r.w / 2, r.w / 2 - b.r], top: b.t + r.h };
      const g = Math.max(b.r - r.w / 2, -r.w / 2 - b.l, -r.h - b.t); if (!ghost || g > ghost.px) ghost = { px: g, i }; }
    /* the reach of every told blow against the front of the frames it was live on */
    const blows = [];
    for (const [m, s] of Object.entries(r.sweeps)) {
      const land = s.grid.filter(q => q.n && q.first);
      if (!land.length) { blows.push({ m, never: true, from: s.forcedFrom }); continue; }
      const facing = land.map(q => Math.sign(q.dx) * q.first.off[0]).filter(v => v > -4);   /* hero on the side the creature faces */
      const reach = facing.length ? Math.max(...facing) - 5 : null, behind = land.some(q => Math.sign(q.dx) * q.first.off[0] < -8);
      const live = s.best ? [...new Set(s.best.drawn.filter(d => d[3] && !d[2]).map(d => d[1]))] : [];
      const fronts = live.map(i => r.boxes[i] && !r.boxes[i].empty ? r.boxes[i].r : null).filter(v => v !== null);
      const front = fronts.length ? Math.max(...fronts) : null;
      const maxFront = Math.max(...r.boxes.filter(b => b && !b.empty).map(b => b.r));
      const out = live.filter(i => r.boxes[i] && r.boxes[i].r >= maxFront - 2);
      const lean = live.map(i => r.boxes[i] && !r.boxes[i].empty ? (r.boxes[i].l + r.boxes[i].r) / 2 : 0);
      blows.push({ m, reach, front, short: front !== null && reach !== null ? front - reach : null, behind, live, weaponOut: out, lean: lean.length ? Math.max(...lean.map(Math.abs)) : 0, unblockable: land.some(q => q.first.unblockable), line: land[0].first.line, touch: s.grid.reduce((n, q) => n, 0) });
    }
    const touch = r.tr.hits.filter(h => h[3] === C.contactLine).length;
    hb.push({ key: r.key, lvl: C.habitats[r.key] && C.habitats[r.key].level, w: r.w, h: r.h, air, ghost, blows, body: r.boxes[0] && !r.boxes[0].empty ? [r1(r.boxes[0].bw), r1(r.boxes[0].bh)] : null, touch });
  }
  for (const x of hb) {
    if (x.air && x.air.px > 2) findings.combat1.push({ sev: x.air.px, kind: 'bug', who: x.key, text: `${x.key} (${x.lvl}): hurt box ${x.w}x${x.h} reaches ${r1(x.air.px)} px past the drawn body on frame ${x.air.i} (air left/right ${x.air.lr.map(r1).join('/')}, top ${r1(x.air.top)}): blows land on empty air` });
    for (const b of x.blows) { if (b.never) continue;
      { const g0 = (C.creatures[x.key].sweeps[b.m] || { grid: [] }).grid.filter(q => q.n && q.first);   /* charges, lunges and missiles are not compared with their frames (see below) */
        if (g0.some(q => Math.abs(q.first.move) > 4) || (b.reach !== null && b.front !== null && (b.reach >= 58 || b.reach > Math.max(8, b.front) * 1.8))) { b.skipCompare = true; } }
      if (b.skipCompare) { if (b.behind) findings.combat1.push({ sev: 4, kind: 'design', who: x.key, text: `${x.key} ${b.m}: also lands on a hero standing BEHIND it (main.js:${b.line})` }); continue; }
      if (b.short !== null && b.short > 3) findings.combat1.push({ sev: b.short, kind: 'bug', who: x.key, text: `${x.key} ${b.m}: drawn to ${r1(b.front)} px on its live frames (${b.live.join(',')}) but lands only to ${r1(b.reach)} px: ${r1(b.short)} px of weapon that does not connect (main.js:${b.line})` });
      /* A THROWN OR RANGED BLOW (a shot, a spit, a shockwave, a thrown hook) lands wherever its missile goes: past 1.8x the drawn front, or at
         the edge of the 64 px grid, it is not a hitbox and is listed apart, never as reach with nothing drawn */
      b.ranged = b.reach !== null && b.front !== null && (b.reach >= 58 || b.reach > Math.max(8, b.front) * 1.8);
      /* A CHARGE OR A LUNGE lands on contact after the body has travelled into (or past) the hero, so its offset at impact says nothing
         about the drawn weapon: only blows thrown from where the creature stands are compared with their frames */
      const land0 = s0 => s0 ? s0.grid.filter(q => q.n && q.first) : []; b.moving = land0(C.creatures[x.key].sweeps[b.m]).some(q => Math.abs(q.first.move) > 4);
      if (b.moving && !b.ranged) (x.charges = x.charges || []).push(b.m);
      if (b.ranged || b.moving) continue;
      if (b.short !== null && b.short < -3) findings.combat1.push({ sev: -b.short + 2, kind: 'bug', who: x.key, text: `${x.key} ${b.m}: lands ${r1(b.reach)} px out but its live frames (${b.live.join(',')}) are drawn only to ${r1(b.front)} px: ${r1(-b.short)} px of reach with nothing drawn (main.js:${b.line})` });
      if (b.behind) findings.combat1.push({ sev: 4, kind: 'design', who: x.key, text: `${x.key} ${b.m}: also lands on a hero standing BEHIND it (main.js:${b.line})` });
      if (b.lean > 3) findings.combat1.push({ sev: 1 + b.lean / 4, kind: 'bug', who: x.key, text: `${x.key} ${b.m}: its live frames lean ${r1(b.lean)} px off the anchor; the hurt box stays centred on it` }); }
    if (x.ghost && x.ghost.px > 6) findings.combat1.push({ sev: x.ghost.px / 3, kind: 'design', who: x.key, text: `${x.key}: the drawn body reaches ${r1(x.ghost.px)} px outside its hurt box on frame ${x.ghost.i}: a swing that visibly hits it there misses` });
    if (x.touch) findings.combat1.push({ sev: 3 + Math.min(4, x.touch / 20), kind: 'design', who: x.key, text: `${x.key}: its BODY hurts on touch (${x.touch} contact hits on a hero pinned beside it in 36 s, main.js:${C.contactLine}): damage with no tell` });
  }
  md.push('## 1. Hitboxes against sprites', '', `Measured ${cre.length} creatures${skipped.length ? '; not measured: ' + skipped.map(s => s.key + ' (' + s.skipped + ')').join(', ') : ''}.`, '');
  table(md, ['creature', 'level', 'hurt box', 'body (frame 0)', 'worst air px (frame)', 'worst body-outside-box px', 'touch hits', 'told blows: reach / drawn front px'],
    hb.map(x => [x.key, x.lvl, x.w + 'x' + x.h, x.body ? x.body.join('x') : '-', x.air ? r1(x.air.px) + ' (f' + x.air.i + ')' : '-', x.ghost ? r1(x.ghost.px) : '-', x.touch || 0,
      x.blows.map(b => b.never ? b.m + ': never landed' : b.m + ' ' + r1(b.reach) + '/' + r1(b.front) + (b.unblockable ? ' !!' : '')).join('; ')]));
  /* heroes */
  if (C.heroes) { const rows = [];
    for (const [hk, H] of Object.entries(C.heroes)) for (const [name, samples] of Object.entries(H.blows)) {
      const act = samples.filter(s => s.ab); if (!act.length) { rows.push([hk, name, 'no box live', '-', '-', '-']); continue; }
      const reach = Math.max(...act.map(s => s.ab.r)); let drawn = null, at = null;
      for (const s of act) { const fb = s.key && H.frames[s.key] ? H.frames[s.key][s.frame] : null; if (fb && (drawn === null || fb.r > drawn)) { drawn = fb.r; at = s.key + ':' + s.frame; } }
      const d = drawn === null ? null : drawn - reach; rows.push([hk, name, act.length + ' frames', r1(reach), r1(drawn) + ' (' + at + ')', r1(d)]);
      if (d !== null && Math.abs(d) > 3) findings.combat1.push({ sev: Math.abs(d) / 2, kind: 'bug', who: hk, text: `hero ${hk} ${name}: ${d > 0 ? 'weapon drawn ' + r1(d) + ' px past the box (' + at + ')' : 'box reaches ' + r1(-d) + ' px past the drawn weapon (' + at + ')'}` }); }
    md.push('### Heroes: attack box against the weapon drawn on its live frames', '');
    table(md, ['hero:blade', 'blow', 'live', 'box reach px', 'drawn front px (key:frame)', 'drawn minus box'], rows); }

  /* ---------- 2. FRAME DATA ---------- */
  const fd = [];
  for (const r of cre) {
    const modes = r.tr.modes, marks = r.tr.marks, hits = r.tr.hits.filter(h => h[3] !== C.contactLine);
    const runs = modes.filter(m => String(m[1]).startsWith('#')).map(m => m[0]);
    const runEnd = F => { const n = runs.find(x => x > F); return n === undefined ? 1e9 : n; };
    const tellEntries = modes.filter(m => /Tell$/.test(m[1]));
    const per = {};
    for (const [F0, m] of tellEntries) {
      const stop = Math.min(runEnd(F0), (tellEntries.find(q => q[0] > F0 && q[1] !== m) || [1e9])[0], F0 + 240);
      const hs = hits.filter(h => h[0] >= F0 && h[0] < stop).map(h => h[0]); if (!hs.length) continue;
      let end = hs[0]; for (const h of hs) { if (h - end <= 8) end = h; else break; }
      /* THE MARK'S FIRST SHOWING for this windup: on at entry (its last change before entry turned it on) counts from entry; otherwise its first turn-on before the blow */
      const before = marks.filter(q => q[0] <= F0).pop(), onAtEntry = before && before[1] === 1;
      const markOn = marks.filter(q => q[1] === 1 && q[0] <= hs[0] && q[0] >= F0).map(q => q[0]);
      const markF = onAtEntry ? F0 : markOn.length ? Math.min(...markOn) : null;
      const nextMark = marks.find(q => q[1] === 1 && q[0] > end); const nextHit = hits.find(h => h[0] > end + 8);
      const nxt = Math.min(nextMark ? nextMark[0] : 1e9, nextHit ? nextHit[0] : 1e9, runEnd(F0));
      (per[m] = per[m] || []).push({ windup: hs[0] - F0, lead: markF === null ? null : hs[0] - markF, active: end - hs[0] + 1, rec: nxt >= 1e9 || nxt === runEnd(F0) ? null : nxt - end, hitMode: (hits.find(h => h[0] === hs[0]) || [])[4] });
    }
    for (const [m, s] of Object.entries(r.sweeps)) {
      const nat = per[m]; const b = s.best;
      const row = { key: r.key, m, src: nat ? 'watched x' + nat.length : s.best ? 'forced' : 'never landed', from: s.forcedFrom };
      if (nat) { row.windup = med(nat.map(q => q.windup)); row.lead = med(nat.map(q => q.lead)); row.noMark = nat.some(q => q.lead === null); row.active = med(nat.map(q => q.active)); row.rec = med(nat.map(q => q.rec)); row.hitMode = nat[0].hitMode; }
      else if (b && b.hits.length) { row.windup = b.hits[0]; row.lead = b.markF === null ? null : b.hits[0] - b.markF; row.noMark = b.markF === null; let end = b.hits[0]; for (const h of b.hits) { if (h - end <= 8) end = h; else break; } row.active = end - b.hits[0] + 1; row.rec = null; row.hitMode = b.first && b.first.mode; }
      if (b) { row.live = [...new Set(b.drawn.filter(d => d[3] && !d[2]).map(d => d[1]))]; const maxFront = Math.max(...r.boxes.filter(x => x && !x.empty).map(x => x.r)); row.out = r.boxes.map((x, i) => x && !x.empty && x.r >= maxFront - 2 ? i : -1).filter(i => i >= 0); row.unblockable = !!(b.first && b.first.unblockable); }
      fd.push(row); }
  }
  const leads = fd.filter(q => q.lead !== null && q.lead !== undefined).map(q => q.lead), NORM = med(leads);
  /* FLAGS COME FROM WATCHED USES ONLY: a forced mode starts with whatever timer and target fields the harness gave it, so its mark and lead
     are in the table as a reading, never ranked as a finding (a forced lampreeve showed no mark that every natural use of it showed) */
  for (const q of fd) { if (q.windup === undefined || !String(q.src).startsWith('watched')) continue;
    if (q.noMark) findings.combat2.push({ sev: 8, kind: 'bug', who: q.key, text: `${q.key} ${q.m}: the blow landed with NO ! or !! shown before it (${q.src})` });
    if (q.lead !== null && q.lead < 15) findings.combat2.push({ sev: 9 - q.lead / 3, kind: 'design', who: q.key, text: `${q.key} ${q.m}: lands ${q.lead} frames (${r1(q.lead / 60 * 100) / 100} s) after the mark appears, under the 0.25 s floor (${q.src})` });
    else if (q.lead !== null && Math.abs(q.lead - NORM) > 6 && q.lead > NORM * 2.5) findings.combat2.push({ sev: 1, kind: 'design', who: q.key, text: `${q.key} ${q.m}: lead ${q.lead} frames against the game's median ${NORM}` });
    if (q.rec !== null && q.rec !== undefined && q.rec < 6) findings.combat2.push({ sev: 6 - q.rec / 2, kind: 'design', who: q.key, text: `${q.key} ${q.m}: no recovery - the next mark or blow comes ${q.rec} frames after the last live frame (${q.src})` });
    if (q.live && q.live.length && q.out && q.out.length && !q.live.some(i => q.out.includes(i))) findings.combat2.push({ sev: 3, kind: 'bug', who: q.key, text: `${q.key} ${q.m}: live on frames ${q.live.join(',')} but the weapon is drawn furthest out on frames ${q.out.join(',')}: the hit does not line up with the art` }); }
  const sites = C.tellSites || [], lit = sites.filter(s => s.literal);
  md.push('## 2. Frame data and tells', '', `Norm (median lead from the mark to the first landed frame, over ${leads.length} measured attacks): **${NORM} frames (${r1(NORM / 60 * 100) / 100} s)**. Frames are 60 fps updates. "watched xN" = timed from N natural uses with the hero pinned in reach; "forced" = the mode was forced (it never came up naturally).`, '');
  table(md, ['creature', 'tell', 'source', 'windup f', 'mark lead f', 'active f', 'recovery f', 'lands in mode', 'live frames', 'weapon-out frames', 'mark'],
    fd.map(q => [q.key, q.m, q.src, q.windup, q.lead, q.active, q.rec, q.hitMode, q.live ? q.live.join(',') : '-', q.out ? q.out.join(',') : '-', q.unblockable ? '!!' : q.windup !== undefined ? '!' : '-']));
  md.push(`**Timing from one table?** No. Of ${sites.length} places a \`...Tell\` mode is entered, ${lit.length} type the tell's length as a number at that line (e.g. ${lit.slice(0, 6).map(s => s.fn + ' ' + s.mode + ' = ' + s.timing + ' (main.js:' + s.line + ')').join('; ')}). The rest read a variable or expression.`, '');
  const perFn = {}; for (const s of lit) perFn[s.fn] = (perFn[s.fn] || 0) + 1;
  table(md, ['update function', 'tell sites with a typed number'], Object.entries(perFn).sort((a, b) => b[1] - a[1]).slice(0, 25));
  findings.combat2.push({ sev: 5, kind: 'design', who: 'all', text: `timings are per-site constants, not one table: ${lit.length} of ${sites.length} tell entries type their length inline` });
  C.__fd = fd; C.__hb = hb;
}

/* ---------- 3. FEEL ---------- */
if (FEEL) { const rows = FEEL.rows.filter(q => q.hit);
  md.push('## 3. Combat feel numbers', '', 'Against a sprig in Bracken Wood (hp 9999); "[boss]" is the same sprig carrying maxHp, the field every boss rule in the code tests. stop = hitstop s (BK.stop after the landing frame), shake/kick = camera values, poise = stagger bar added, vx = knock velocity on the landing frame, knock = px travelled in the next 20 frames.', '');
  table(md, ['hero', 'blow', 'target', 'dmg', 'stop s', 'shake', 'kick', 'poise +', 'vx', 'knock px', 'swing voice', 'hit voice'],
    FEEL.rows.map(q => q.hit ? [q.hero, q.blow, q.boss ? 'boss' : 'foe', q.hit.dmg, q.hit.stop, q.hit.shake, q.hit.kick, q.hit.poise, q.hit.vx, q.knock20, q.swingSounds.filter(s => !/^(jet|step|pStep|foeStep|impact|hurtOf|yelp)/.test(s)).join('/'), q.hitSounds.filter(s => !/^(jet|step|pStep|foeStep)/.test(s)).join('/')] : [q.hero, q.blow, q.boss ? 'boss' : 'foe', 'no hit', '', '', '', '', '', '', '', '']));
  const by = {}; for (const q of rows) by[q.hero + '|' + q.blow + '|' + (q.boss ? 1 : 0)] = q;
  for (const q of rows) { const k = q.hero + '|' + q.blow;
    /* like for like only: a trip (poiseBreak) or a first-hit extra on the foe row adds stop the boss row cannot get, and that is not the 0.8 */
    const plain = x => !x.hitSounds.includes('poiseBreak') && !x.hitSounds.includes('yelp');
    if (!q.boss && by[k + '|1'] && plain(q) && plain(by[k + '|1']) && q.hit.shake === by[k + '|1'].hit.shake) { const b = by[k + '|1'], ratio = b.hit.stop / q.hit.stop; if (Math.abs(ratio - 0.8) > 0.06) findings.combat3.push({ sev: Math.abs(ratio - 0.8) * 10, kind: 'design', who: q.hero, text: `${q.hero} ${q.blow}: boss hitstop is ${r1(ratio * 100)}% of the foe's (${b.hit.stop} vs ${q.hit.stop}), not the intended 80%` }); }
    if (!q.boss && /heavy/.test(q.blow) && by[q.hero + '|light 1|0'] && q.hit.stop < by[q.hero + '|light 1|0'].hit.stop) findings.combat3.push({ sev: 6, kind: 'design', who: q.hero, text: `${q.hero} heavy stops the frame less (${q.hit.stop}) than a light tap (${by[q.hero + '|light 1|0'].hit.stop})` });
    if (/^skill/.test(q.blow) && !(q.hit.stop > 0)) findings.combat3.push({ sev: 5, kind: 'design', who: q.hero, text: `${q.hero} ${q.blow}: no hitstop at all` }); }
  for (const hero of [...new Set(rows.map(q => q.hero))]) { const mine = rows.filter(q => q.hero === hero && !q.boss); const sig = q => [q.hit.dmg, q.hit.stop, q.hit.shake, q.knock20].join('/'); const groups = {};
    for (const q of mine) (groups[sig(q)] = groups[sig(q)] || []).push(q.blow);
    for (const [s, g] of Object.entries(groups)) if (g.length > 1) findings.combat3.push({ sev: 2 + g.length, kind: 'design', who: hero, text: `${hero}: ${g.join(', ')} share every number on a foe (dmg/stop/shake/knock ${s}): they will feel the same` }); }
  for (const q of FEEL.rows.filter(q => !q.hit)) findings.combat3.push({ sev: 0.5, kind: 'unmeasured', who: q.hero, text: `${q.hero} ${q.blow}${q.boss ? ' [boss]' : ''}: never landed in the harness` });
  if (FEEL.rush && FEEL.rush.length) { md.push('### The knight\'s shield against a forced blow', '');
    table(md, ['blow', 'knight was', 'forced at f', 'rush started f', 'hp lost', 'what the game logged'], FEEL.rush.map(q => [q.spec, q.how, q.forcedAt, q.rushF, q.hpLost, (q.events || []).map(e => e.bash ? 'bash ' + e.dmg + '@' + e.f : (e.res + ' ' + e.dmg + '@' + e.f + (e.rushing ? ' rushing' : '') + (e.bracing ? ' bracing' : '') + (e.unblockable ? ' !!' : ''))).join('; ')])); }
}

/* ---------- 4. INPUT ---------- */
if (INPUT) { md.push('## 4. Input and response', '', 'Frames at 60 fps. "k:now" = the press at frame k acted on that frame; "k:fN" = it waited and acted on frame N; "k:DROP" = it did nothing and was lost.', '');
  const span = (arr, len) => { const drop = arr.filter(q => q[1] === null).map(q => q[0]), wait = arr.filter(q => q[1] !== null && q[1] > q[0] + 1); return { drop: drop.length ? drop[0] + '-' + drop[drop.length - 1] : 'none', wait: wait.length ? wait[0][0] + '-' + wait[wait.length - 1][0] + ' (acts at f' + wait[0][1] + ')' : 'none' }; };
  const rows = [];
  for (const r of INPUT) { if (r.error) { rows.push([r.hero, r.error]); continue; }
    const s = span(r.swing), c = span(r.cancel), rs = span(r.rollSwing), js = span(r.jumpSwing);
    rows.push([r.hero, r.coyote.frames, r.buffer.frames, r.swingLen, 'drop ' + s.drop + '; queued ' + s.wait, 'drop ' + c.drop + '; queued ' + c.wait, r.rollLen, 'drop ' + rs.drop + '; queued ' + rs.wait, 'drop ' + js.drop, r.turn.runFaceF + ' / ' + r.turn.runMoveF]);
    const firstDrop = arr => arr.filter(q => q[1] === null).length;
    if (firstDrop(r.swing)) findings.combat4.push({ sev: firstDrop(r.swing) / r.swingLen * 6, kind: 'design', who: r.hero, text: `${r.hero}: a swing pressed in frames ${s.drop} of an ${r.swingLen}-frame swing is DROPPED (the 0.15 s buffer only reaches the last ${r.swing.filter(q => q[1] !== null && q[1] > q[0] + 1).length} frames)` });
    if (firstDrop(r.cancel)) findings.combat4.push({ sev: firstDrop(r.cancel) / r.swingLen * 5, kind: 'design', who: r.hero, text: `${r.hero}: a dodge pressed in frames ${c.drop} of a swing is DROPPED, not queued (a roll can only cancel from frame ${(r.cancel.find(q => q[1] !== null) || [])[1]})` });
    if (firstDrop(r.rollSwing)) findings.combat4.push({ sev: firstDrop(r.rollSwing) / (r.rollLen || 20) * 4, kind: 'design', who: r.hero, text: `${r.hero}: a swing pressed in frames ${rs.drop} of a ${r.rollLen}-frame roll is DROPPED` });
    if (r.coyote.frames < 6) findings.combat4.push({ sev: 2, kind: 'bug', who: r.hero, text: `${r.hero}: coyote time is ${r.coyote.frames} frames; the code's P.coyote = 0.1 s promises 6` });
    if (r.buffer.frames < 7) findings.combat4.push({ sev: 2, kind: 'bug', who: r.hero, text: `${r.hero}: the jump buffer holds ${r.buffer.frames} frames; P.jbuf = 0.12 s promises 7` });
  }
  table(md, ['hero', 'coyote f', 'jump buffer f', 'swing f', 'swing pressed during swing', 'dodge pressed during swing', 'roll f', 'swing pressed during roll', 'jump pressed during swing', 'turn at a run: face / move f'], rows);
}

/* ---------- ANIMATION 1: CONTACT ---------- */
if (CON) {
  const s = CON.samples.filter(q => !q.swimming);
  am.push('## 1. Grounding and contact during play', '', `${CON.samples.length} samples over ${CON.levels.length} levels (the playtest bot, 40 s a level, lifted to a quarter, half and three quarters of the way along). Gap = floor line minus the row under the lowest opaque pixel: -1 is the one-pixel overlap the art uses to meet the ground; SUNK <= -2, HOVER >= +2 while standing. "physics" rows had no tile top near the feet (a ramp, a slope, an odd tile) and are measured against the game's own foot line.`, '');
  for (const L of CON.levels) { const rows = L.rows.filter(q => q.contact || q.airShadow).sort((a, b) => (b.sunk + b.hover + b.tip) - (a.sunk + a.hover + a.tip));
    am.push(`### ${L.id} (${L.hero}; reached column ${L.walked} of ${L.W})`, ''); table(am, ['body', 'samples', 'standing', 'on physics floor', 'median gap', 'min / max', 'SUNK', 'HOVER', 'TIP', 'AIR SHADOW'], rows.map(q => [q.t, q.n, q.contact, q.physics, q.medGap, q.minGap + ' / ' + q.maxGap, q.sunk, q.hover, q.tip, q.airShadow])); }
  const by = {}; for (const q of s) { if (!q.grounded || q.gap === null) continue; const k = q.t; const b = by[k] || (by[k] = { n: 0, sunk: 0, hover: 0, tip: 0, tile: 0, gaps: [], lv: new Set(), worst: null }); b.n++; b.gaps.push(q.gap); if (q.floorFrom === 'tile') b.tile++; if (q.sunk) b.sunk++; if (q.hover) b.hover++; if (q.tip) b.tip++; b.lv.add(q.level);
    if ((q.sunk || q.hover) && q.floorFrom === 'tile' && (!b.worst || Math.abs(q.gap) > Math.abs(b.worst.gap))) b.worst = q; }
  for (const [k, b] of Object.entries(by)) { const m = med(b.gaps), share = (b.sunk + b.hover) / b.n;
    if (b.n >= 8 && share >= 0.25) findings.anim1.push({ sev: share * 10 + Math.abs(m || 0), kind: 'bug', who: k, text: `${k}: ${Math.round(share * 100)}% of ${b.n} standing samples off the floor (median gap ${m} px; sunk ${b.sunk}, hover ${b.hover}) in ${[...b.lv].join(', ')}${b.worst ? '; worst ' + b.worst.gap + ' px at ' + b.worst.level + ' ' + b.worst.tx + ',' + b.worst.ty + ' in ' + b.worst.mode : ''}` });
    if (b.tip >= 3) findings.anim1.push({ sev: 3, kind: 'design', who: k, text: `${k}: stood with under 4 px of its width on the platform ${b.tip} times (${[...b.lv].join(', ')})` }); }
  /* THE STATIC PROOF: how far each body's baked standing frame reaches below its own feet line (the anchor), with no level involved.
     A body whose frames reach below its anchor is sunk by construction everywhere it walks; one that stops short of it hovers everywhere. */
  if (C) { const rows = [];
    if (C.heroes) for (const [hk, H] of Object.entries(C.heroes)) { if (hk.includes(':') && !hk.endsWith(':' + (Object.keys(C.heroes).find(k => k.startsWith('knight:')) || '').split(':')[1])) continue;
      for (const key of ['idle', 'run', 'land', 'block']) { const fr = (H.frames[key] || []).filter(Boolean); if (!fr.length) continue; const bs = fr.map(b => b.b); rows.push([hk.split(':')[0], key, Math.min(...bs), Math.max(...bs)]);
        /* (no finding from this: a hero's lowest opaque pixel is often the tip of a weapon held low, not a foot - the table says so) */ } }
    const cre = Object.values(C.creatures).filter(r => !r.skipped && r.boxes[0] && !r.boxes[0].empty);
    for (const r of cre) { const b = r.boxes[0].b; if (Math.abs(b) >= 2 && !(C.habitats[r.key] && /fly|bat|harpy|kite|crow|wasp|imp|broom|haunt|marshlight|rook|drone|petrel|sailer/.test(r.key))) rows.push([r.key, 'frame 0', r1(b), r1(b)]); }
    am.push('### Drawn bottom against the feet line, from the baked frames (px below the anchor; 1 is the one-pixel overlap, 0 stands exactly on it)', ''); table(am, ['body', 'frames', 'min', 'max'], rows); }
  const air = s.filter(q => q.airShadow), ab = {}; for (const q of air) ab[q.t] = (ab[q.t] || 0) + 1;
  for (const [k, n] of Object.entries(ab)) if (n >= 3) findings.anim1.push({ sev: 1 + n / 20, kind: 'design', who: k, text: `${k}: its shadow blob is drawn at its feet in the air (${n} samples more than 6 px off the floor): the shadow does not stay on the ground under it` });
  const dust = CON.samples.filter(q => q.dustVsFoot !== undefined); if (dust.length) { const d = med(dust.map(q => q.dustVsFoot)); am.push(`Landing dust: ${dust.length} landings sampled, the dust's top row sits a median ${d} px from the hero's foot row (negative = above).`, ''); if (d < -2) findings.anim1.push({ sev: 3, kind: 'bug', who: 'hero', text: `landing dust spawns a median ${-d} px above the feet` }); }
}

/* ---------- ANIMATION 2: COVERAGE ---------- */
if (C) { const cre = Object.values(C.creatures).filter(r => !r.skipped);
  const IDLE = /^(idle|rest|stand|wait|perch|hover|sleep|guard|watch|sit|float|bob|hide|lurk)/i, WALK = /(walk|patrol|chase|run|approach|stalk|swim|fly|creep|advance|follow|roam|pace|hop|circle|drift|march|prowl|return|back)/i;
  const rows = []; const counts = { OWN: 0, SHARED: 0, NONE: 0 };
  for (const r of cre) {
    const hashesOf = pred => new Set(Object.entries(r.frames).filter(([m]) => pred(m)).flatMap(([, v]) => Object.keys(v)));
    /* IDLE is the creature's resting modes; the mode it happened to be in when stood up counts only when it is neither a windup nor a blow */
    const atkNames = new Set(Object.values(r.sweeps).map(s => s.best && s.best.first && s.best.first.mode).filter(Boolean));
    const idle = hashesOf(m => IDLE.test(m) || (m === r.base && !/Tell$/.test(m) && !atkNames.has(m) && !WALK.test(m))), walk = hashesOf(m => WALK.test(m) && !/Tell$/.test(m));
    const cell = (hs, others) => { if (!hs || !hs.size) return 'NONE'; for (const [name, o] of others) if (o.size && [...hs].every(h => o.has(h))) return 'SHARED-' + name; return 'OWN'; };
    const st = {}; st.idle = idle.size ? 'OWN' : 'NONE'; st.walk = cell(walk, [['idle', idle]]);
    const tells = Object.keys(r.sweeps); const wind = tells.map(m => [m, cell(new Set(Object.keys(r.frames[m] || {})), [['idle', idle], ['walk', walk]])]);
    st.windup = wind.length ? wind.map(([m, c]) => m + ':' + c).join(' ') : 'NONE';
    const atkModes = [...new Set(Object.values(r.sweeps).map(s => s.best && s.best.first && s.best.first.mode).filter(m => m && !/Tell$/.test(m)))];
    const atk = new Set(atkModes.flatMap(m => Object.keys(r.frames[m] || {}))); st.attack = atkModes.length ? cell(atk, [['idle', idle], ['walk', walk]]) : 'NONE';
    const hurt = new Set(((r.hurt && r.hurt.frames) || []).map(q => q[3])); st.hurt = r.hurt && r.hurt.landed ? cell(hurt, [['idle', idle], ['walk', walk]]) : 'NONE (never hurt)';
    const stag = new Set((r.stagger || []).map(q => q[1])); st.stagger = stag.size ? cell(stag, [['hurt', hurt], ['idle', idle], ['walk', walk]]) : 'NONE';
    st.death = r.death && r.death.landed ? (r.death.aliveAfter ? 'did not die' : (r.death.corpses || r.death.bodies) ? 'OWN (leaves a body)' : 'NONE (vanishes)') : 'NONE (never killed)';
    const flips = r.tr.flips.filter(f => f.after.length); const turn = flips.length ? (flips.some(f => f.after.some(h => !idle.has(h) && !walk.has(h) && h !== f.before && !Object.values(r.frames).some(v => v[h] && v[h].n > 3))) ? 'OWN' : 'NONE (flips)') : 'NONE (never turned)';
    st.turn = turn;
    for (const v of Object.values(st)) for (const part of String(v).split(' ')) { const t = part.includes(':') ? part.split(':')[1] : part; if (t.startsWith('OWN')) counts.OWN++; else if (t.startsWith('SHARED')) counts.SHARED++; else if (t.startsWith('NONE')) counts.NONE++; }
    rows.push([r.key, st.idle, st.walk, st.turn, st.windup, st.attack, st.hurt, st.stagger, st.death]);
    if (st.hurt.startsWith('SHARED')) findings.anim2.push({ sev: 4, kind: 'design', who: r.key, text: `${r.key}: a hurt shows no recoil frame (the frames drawn after a blow are its ${st.hurt.slice(7)} frames)` });
    if (st.death.startsWith('NONE (vanishes')) findings.anim2.push({ sev: r.info && r.info.maxHp ? 7 : 3, kind: 'design', who: r.key, text: `${r.key}: killed, it leaves no body and no corpse: it vanishes` });
    for (const [m, c] of wind) if (c === 'SHARED-idle') findings.anim2.push({ sev: 6, kind: 'bug', who: r.key, text: `${r.key} ${m}: the windup draws the same frames as standing idle - the mark is the only warning` });
    if (st.attack === 'SHARED-idle' || st.attack === 'SHARED-walk') findings.anim2.push({ sev: 4, kind: 'design', who: r.key, text: `${r.key}: the attack's live frames are its ${st.attack.slice(7)} frames` });
  }
  const noTurn = rows.filter(r => String(r[3]).startsWith('NONE (flips')).length;
  if (noTurn) findings.anim2.push({ sev: 2, kind: 'design', who: 'creatures', text: `${noTurn} of ${rows.length} creatures that turned round flip in one frame with no turn frame` });
  am.push('## 2. Animation coverage: state x creature', '', `Read by forcing each state in the page and hashing the pixels of the frame drawn. OWN = at least one frame no other listed state uses; SHARED-x = every frame drawn is one state x also draws; NONE = no frame of its own (or never seen). Pose transforms applied at draw time (a tilt, a squash) are not in the hash, so a tilted idle frame counts as SHARED. Cells counted: OWN ${counts.OWN}, SHARED ${counts.SHARED}, NONE ${counts.NONE}.`, '');
  table(am, ['creature', 'idle', 'walk', 'turn', 'windup (per tell)', 'attack', 'hurt', 'stagger', 'death'], rows);
}
if (ANIM) { am.push('### Heroes', '');
  for (const H of ANIM) { const sets = Object.fromEntries(Object.entries(H.rows).map(([s, seen]) => [s, new Set(seen.map(q => q.hash))]));
    const rows = Object.entries(H.rows).map(([s, seen]) => { const mine = sets[s]; let share = null; for (const [o, os] of Object.entries(sets)) if (o !== s && mine.size && [...mine].every(h => os.has(h)) && !(os.size === mine.size && o > s)) { share = o; break; }
      return [s, [...new Set(seen.map(q => q.key + ':' + q.frame))].join(' '), share ? 'SHARED-' + share : 'OWN']; });
    am.push(`**${H.hero}** (baked keys: ${Object.entries(H.keys).map(([k, n]) => k + ' ' + n).join(', ')})`, ''); table(am, ['state', 'key:frame drawn', 'coverage'], rows);
    for (const [s, key, cov] of rows) { if (/^(light|heavy|rising|low|dash attack|plunge|air)/.test(s) && cov.startsWith('SHARED')) findings.anim2.push({ sev: 3, kind: 'design', who: H.hero, text: `hero ${H.hero}: ${s} draws exactly the frames of ${cov.slice(7)} (${key})` });
      if (/^(hurt|dodge|turn|skid|land)$/.test(s) && cov.startsWith('SHARED')) findings.anim2.push({ sev: 2, kind: 'design', who: H.hero, text: `hero ${H.hero}: ${s} has no frame of its own (draws ${key}, same as ${cov.slice(7)})` }); }
    if (H.dupes.length) am.push('Pixel-identical frames under different keys: ' + H.dupes.map(d => d.join(' = ')).join('; '), ''); }
}

/* ---------- ANIMATION 3: SILHOUETTE ---------- */
if (C) { const cre = Object.values(C.creatures).filter(r => !r.skipped && r.boxes[0] && !r.boxes[0].empty && r.boxes[0].grid);
  const levelOf = {}; try { const lvm = await import('../src/level.js'); for (const lv of lvm.LEVELS) { if (lv.hidden && !lv.secret) continue; let L; try { L = lv.build(); } catch { continue; } const ts = new Set((L.ents || []).map(e => e.t + (e.big ? ':big' : ''))); if (L.arena && L.arena.boss) ts.add(L.arena.boss); if (L.mini && L.mini.boss) ts.add(L.mini.boss); levelOf[lv.id] = ts; } } catch (err) { am.push('(levels could not be built in node: ' + err.message + ')'); }
  const rows = cre.map(r => { const b = r.boxes[0]; return [r.key, C.habitats[r.key] && C.habitats[r.key].level, r.sil && r.sil.contrastMed, r.sil && r.sil.lowEdge !== null && r.sil.lowEdge !== undefined ? Math.round(r.sil.lowEdge * 100) + '%' : '-', b.asym, r1(b.bw) + 'x' + r1(b.bh), r.w + 'x' + r.h, r1(b.bw / r.w) + ' / ' + r1(b.bh / r.h)]; });
  for (const r of cre) { const b = r.boxes[0];
    if (r.sil && r.sil.lowEdge > 0.5) findings.anim3.push({ sev: r.sil.lowEdge * 8, kind: 'design', who: r.key, text: `${r.key} on ${C.habitats[r.key].level}: ${Math.round(r.sil.lowEdge * 100)}% of its outline is under 1.5:1 contrast against the ground behind it (median ${r.sil.contrastMed}:1)` });
    if (b.asym < 0.12) findings.anim3.push({ sev: (0.12 - b.asym) * 30, kind: 'design', who: r.key, text: `${r.key}: facing is hard to read - only ${Math.round(b.asym * 100)}% of its standing frame changes under a mirror` });
    const rw = b.bw / r.w, rh = b.bh / r.h; if (rw > 2 || rh > 1.6 || rw < 0.6 || rh < 0.6) findings.anim3.push({ sev: Math.max(rw, rh, 1 / rw, 1 / rh), kind: 'design', who: r.key, text: `${r.key}: drawn ${r1(b.bw)}x${r1(b.bh)} over a ${r.w}x${r.h} collision box (${r1(rw)}x wide, ${r1(rh)}x tall)` }); }
  const corr = (a, b) => { const n = a.length, ma = a.reduce((s, v) => s + v, 0) / n, mb = b.reduce((s, v) => s + v, 0) / n; let num = 0, da = 0, db = 0; for (let i = 0; i < n; i++) { num += (a[i] - ma) * (b[i] - mb); da += (a[i] - ma) ** 2; db += (b[i] - mb) ** 2; } return da && db ? num / Math.sqrt(da * db) : 0; };
  const pairs = [];
  for (const [lv, ts] of Object.entries(levelOf)) { const here = cre.filter(r => ts.has(r.key));
    for (let i = 0; i < here.length; i++) for (let j = i + 1; j < here.length; j++) { const a = here[i].boxes[0], b = here[j].boxes[0]; const c = corr(a.grid, b.grid), sz = Math.max(a.bw / b.bw, b.bw / a.bw, a.bh / b.bh, b.bh / a.bh), col = Math.hypot(a.col[0] - b.col[0], a.col[1] - b.col[1], a.col[2] - b.col[2]);
      if (a.hash === b.hash) { am.push(`- ${lv}: ${here[i].key} and ${here[j].key} are drawn with the very same standing frame (one sprite set under two names).`); continue; }   /* not a confusable pair: the same art */
      if (c > 0.8 && sz < 1.25 && col < 70) pairs.push([lv, here[i].key, here[j].key, r1(c * 100) / 100, r1(sz), Math.round(col)]); } }
  for (const p of pairs) findings.anim3.push({ sev: 5 + p[3], kind: 'design', who: p[1] + '/' + p[2], text: `${p[0]}: ${p[1]} and ${p[2]} are confusable - silhouettes correlate ${p[3]}, sizes within ${p[4]}x, mean colours ${p[5]} apart` });
  am.push('## 3. Silhouette and sprite readability', '', 'Contrast is WCAG contrast of every outline pixel against the ground pixel just outside it, read off the real canvas where the creature stands in its first level (one place per creature: the cheap version of the brief\'s three places per level). Asymmetry = share of the standing frame\'s opaque pixels that change under a mirror.', '');
  table(am, ['creature', 'level', 'median edge contrast', 'outline under 1.5:1', 'mirror asymmetry', 'drawn body px', 'collision box', 'drawn / box (w / h)'], rows);
  am.push('### Confusable pairs (same level)', ''); table(am, ['level', 'a', 'b', 'silhouette correlation', 'size ratio', 'colour distance'], pairs);
}

for (const k of Object.keys(findings)) findings[k].sort((a, b) => b.sev - a.sev);
writeFileSync(join(outDir, 'combat-tables.md'), md.join('\n'));
writeFileSync(join(outDir, 'animation-tables.md'), am.join('\n'));
writeFileSync(join(outDir, 'findings.json'), JSON.stringify(findings, null, 1));
for (const [k, list] of Object.entries(findings)) { console.log('== ' + k + ' (' + list.length + ')'); for (const f of list.slice(0, 14)) console.log('  [' + f.kind + '] ' + f.text.slice(0, 260)); }
