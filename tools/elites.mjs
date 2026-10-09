// tools/elites.mjs — EVERY ELITE CAN BE FOUGHT, AND EVERY GATE IT HOLDS OPENS.
// An elite holding a gate is a lock with a creature for a key, so it is checked the way tools/keys.mjs checks keys: the
// gate is rock (the reach model hops a one-tile portcullis, so it is SOLID here), the level is flooded from the start,
// and the elite must be reached with it shut. The gate must also HOLD - with it shut the boss room is not reached, or
// "you need to kill it to progress" is a wish - and nothing counted may stand in its column. The gate opening on the
// elite's death, by any means, is main.js's eliteWatch, which asks only whether the elite is still alive.
//   node tools/elites.mjs              every level
//   node tools/elites.mjs wood,marsh   only those
//   REACH_HERO=<knight|warden|pyro|paladin|pirate|reaper|geomancer> node tools/elites.mjs  runs it with that hero's own legs (src/reachcore.js opts.hero, claude/reachcore; tools/reach-heroes.mjs sweeps them all)
// FAILS when an elite stands in a boss, mini or ambush room, on nothing, out of reach, too near its own gate; when a
// gate cannot be reached, can be walked round, or covers a checkpoint, sign, door, key or collectable; or when a level
// with no mini has no gated elite (a level still being rebuilt is listed as pending, not failed).
import { LEVELS, T, eliteGate } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { readFileSync } from 'fs';

const PENDING = new Set(['ksar', 'minecart']);   /* minecart (claude/minecart, batch80): THE DEEP RAILS is all cart with goblin archers/casters on carts and no mini or gated elite - the same design call for Daniel as ksar/glasssea (its boss is the Great Drill) */   /* ksar (claude/ksar, batch79): built with no mini and no elite - the same design call for Daniel as glasssea (its boss is the Hawk-Mistress; a gatekeeper elite is a call for him) */   /* glasssea (claude/glasssea, batch75): built with no mini and no elite either - the same design call for Daniel (see the batch75 status). skyroad (claude/skyroad): built with no mini and no elite - a gatekeeper is a design call for Daniel, listed pending until one lands. A level being rebuilt goes in here, and comes out of it when its elites land */
const NO_KEEPER = new Set(['underleaf', 'burial', 'undercrown']);   /* undercrown: Daniel cut its Overman mini (2026-09-21), and its route has no gate an elite should hold */   /* Daniel's call, not a gap: UNDERLEAF's Bellringer mini was cut after a playtest (2026-09-17). It is the secret stealth village - you choose when it wakes - and nothing on its street holds a gate */
// Burial's Sexton was explicitly removed: The Buried Dead is the requested final boss, not a replacement mini.
/* A LEVEL WHOSE RULE LAYS ITS OWN ROAD (claude/elitegates): the Glass Sea's glass bridges and stairs are fused by a beam, so as laid its grid is a
   level of sand and pits that the plain fill leaves at column 47. The gate and the elite are asked about the level WITH its rule solved - every bed (but the
   vault's optional stair) fused to glass - the way a player who has turned the mirrors sees it. The gate is still shut on top of that, so it must hold. */
function solvedRule(L) {
  if (!L.glasssea || !L.beds) return L;
  const grid = L.grid.slice();
  for (const b of L.beds) { if (/vault/i.test(b.id)) continue; for (const [x, y] of b.tiles) grid[y * L.W + x] = T.SOLID; }
  const sg = (L.cracks || []).find(c => c.id === 'slideGap');   /* the SLIDE: a 5-column gap every hero clears sliding down the glass dune (tools/glasssea-slide.mjs measures it with real keys); the plain fill has no slide (tools/checkpoint-stand.mjs MODEL_GAPS) */
  if (sg) for (let x = sg.x0; x <= sg.x1; x++) grid[sg.y * L.W + x] = T.SOLID;
  return { ...L, grid };
}
const want = (process.argv[2] || '').split(',').filter(Boolean);
const TS = 16;
let bad = 0, n = 0;
for (const lv of LEVELS) {
  if ((lv.hidden && !lv.secret) || lv.id === 'custom' || (want.length && !want.includes(lv.id))) continue;
  const L = solvedRule(lv.build()), els = L.ents.filter(e => e.elite), out = [];
  if(lv.id==='burial' && L.arena?.boss!=='burieddead')out.push('Burial must retain its requested final boss');
  if (PENDING.has(lv.id) && !els.length) { console.log(' --  ' + lv.id.padEnd(11) + 'pending (being rebuilt)'); continue; }
  const at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H) ? T.SOLID : L.grid[y * L.W + x];
  const A = L.arena, tx = A ? Math.floor(A.trigger / TS) : L.W - 3;
  const arenaIn = R => [...R.seen].some(k => { const [x, y] = k.split(',').map(Number); return x >= tx && (!A || Math.abs(y - (A.floor / TS - 1)) <= 3); });
  const near = (R, x, y) => { for (let dy = -2; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (R.seen.has((x + dx) + ',' + (y + dy))) return true; return false; };
  const rooms = [A, L.mini].filter(Boolean).map(Q => [Q.x0 / TS - 1, Q.x1 / TS + 1, Q.y0 !== undefined ? Q.y0 / TS - 1 : Q.floor / TS - 16, Q.floor / TS + 2])
    .concat((L.ambushes || []).map(Q => [Q.wallL - 1, Q.wallR + 1, (Q.y0 !== undefined ? Q.y0 : Q.row - 9) - 1, Q.row + 2]));
  const open = floodReach(L, T, { rides: true, hero: process.env.REACH_HERO });
  if (NO_KEEPER.has(lv.id)) { /* no gatekeeper wanted */ }
  else if (!els.length && !L.mini) out.push('no mini and no elite holding a gate');
  else if (!L.mini && !els.some(e => e.gate !== undefined)) out.push('no mini, and no elite here holds a gate');
  const HELD = new Set(['check', 'sign', 'doorway', 'gate', 'lockgate', 'key', 'stray', 'silver', 'relic', 'npc', 'shrine', 'winch', 'lever']);
  for (const e of els) { n++;
    const tag = e.t + '@' + e.x + ',' + e.y;
    if (rooms.some(([a, b, c, d]) => e.x >= a && e.x <= b && e.y >= c && e.y <= d)) out.push(tag + ' stands in a boss, mini or ambush room');
    if (at(e.x, e.y) !== T.AIR || at(e.x, e.y + 1) === T.AIR) out.push(tag + ' is not stood on footing');
    /* NEVER AT A LANDING, and a shrine is the landing you come back to (level review, 2026-09-24: the Scree Path's elite troll stood a tile
       from its checkpoint, and the Witchlight Stair's pier husk ON it - lit it and he was in your face; die and you woke under him) */
    { const c = L.ents.find(q => q.t === 'check' && Math.abs(q.x - e.x) <= 2 && Math.abs(q.y - e.y) <= 2); if (c) out.push(tag + ' stands ' + Math.abs(c.x - e.x) + ' tile(s) from the checkpoint @' + c.x + ',' + c.y + ': a landing'); }
    if (!near(open, e.x, e.y)) out.push(tag + ' is out of reach');
    if (e.gate === undefined) continue;
    const G = eliteGate(L, e.gate, e.y);
    if (Math.abs(e.gate - e.x) < 5) out.push(tag + ' is ' + Math.abs(e.gate - e.x) + ' tiles from its gate: no room to fight in front of it');
    const grid = L.grid.slice(); for (let y = G.top; y <= G.bot; y++) grid[y * L.W + G.col] = T.SOLID; if (G.sill >= 0) grid[G.sill * L.W + G.col] = T.SOLID;
    const shut = floodReach({ ...L, grid }, T, { rides: true, hero: process.env.REACH_HERO });
    if (!near(shut, e.x, e.y)) out.push(tag + ' cannot be reached with its gate @' + e.gate + ' shut');
    /* THE GATE HOLDS when most of what lies past it (on the side away from the elite) is only reached through it. The boss
       room is the first thing asked; where the model cannot see into it (a ride, a canopy), the ground past the gate is */
    /* PAST IT is further along the way the level goes: along for a road, UP for a tower of stacked floors (the Falling Tower) */
    const side = Math.sign(e.gate - e.x), past = R => [...R.seen].filter(k => L.stackedFloors ? +k.split(',')[1] < G.top : (+k.split(',')[0] - e.gate) * side > 2).length;
    const walkedRound = arenaIn(open) ? arenaIn(shut) : past(shut) > past(open) * 0.25;
    if (walkedRound) out.push('the gate @' + e.gate + ' (rows ' + G.top + '-' + G.bot + ') can be walked round: ' + past(shut) + ' of ' + past(open) + ' tiles past it are still reached with it shut');
    for (const q of L.ents) if (HELD.has(q.t) && Math.abs(q.x - G.col) <= 1 && q.y >= G.top - 1 && q.y <= G.bot + 1) out.push('the gate @' + e.gate + ' comes down on a ' + q.t + ' @' + q.x + ',' + q.y);
  }
  if (out.length) bad++;
  console.log((out.length ? 'FAIL ' : ' ok  ') + lv.id.padEnd(11) + els.map(e => e.t + '@' + e.x + ',' + e.y + (e.gate !== undefined ? ' gate ' + e.gate : '')).join('; ') + (out.length ? '\n       ' + out.join('\n       ') : ''));
}
// ---- THE AMBUSH ROOMS AND WHO LEADS THEM (section Q rules 2 and 3) ----
// One room a level at most. A wave's elite must be a kind the ELITE table knows (or it spawns as a plain creature and the room
// has no leader), holds no gate (the room is its gate), and no two neighbouring levels' rooms are led by the same kind - its moves
// are the room's lesson. A room with no leader yet is listed, not failed, while the batches are being built.
const mainSrc = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const eliteKinds = new Set([...(mainSrc.match(/\nconst ELITE = \{([\s\S]*?)\n\};/) || ['', ''])[1].matchAll(/(?:^|[\s,{])([a-z]+): \{ name:/g)].map(m => m[1]));
console.log('\n== the ambush rooms ==');
let ambBad = 0, prevLead = null, prevId = null; const unled = [];
for (const lv of LEVELS) {
  if ((lv.hidden && !lv.secret) || lv.id === 'custom' || (want.length && !want.includes(lv.id))) continue;
  const L = lv.build(), rooms = L.ambushes || [], out = [];
  if (!rooms.length) { continue; }
  if (rooms.length > 1) out.push(rooms.length + ' ambush rooms: one a level at most (' + rooms.map(A => A.name).join(', ') + ')');
  const leads = [];
  for (const A of rooms) for (const [w, wave] of A.waves.entries()) for (const [t, , , o] of wave) { if (!o || !o.elite) continue;
    if (!eliteKinds.has(t)) out.push(A.name + ' wave ' + (w + 1) + ': ' + t + ' is marked elite but the ELITE table has no ' + t);
    if (o.gate !== undefined) out.push(A.name + ': its ' + t + ' holds a gate - the room is its gate');
    leads.push(t); }
  if (!leads.length) unled.push(lv.id);
  if (leads.length && prevLead && leads.includes(prevLead)) out.push('led by ' + prevLead + ' like ' + prevId + ' before it: neighbouring rooms teach different moves');
  if (leads.length) { prevLead = leads[0]; prevId = lv.id; } else { prevLead = null; prevId = null; }
  if (out.length) ambBad++;
  console.log((out.length ? 'FAIL ' : ' ok  ') + lv.id.padEnd(11) + rooms.map(A => A.name).join(', ') + (leads.length ? '  led by ' + leads.join(', ') : '  (no leader yet)') + (out.length ? '\n       ' + out.join('\n       ') : ''));
}
if (unled.length) console.log('\nnot yet led by an elite: ' + unled.join(', '));
if (ambBad) bad += ambBad;
// ---- ELITES2: EVERY KIND ITS OWN MOVES, EVERY PLACED ELITE AN AFFIX THAT FITS, THE OPENING, THE ESCALATION, AND THE MASH BOT LOSES ----
// (claude/elites2) Fails when: a kind of the ELITE table has no dispatch line of its own (`if (e.t === '<kind>') return updateElite<Kind>(e, dt)`,
// or `return false` for a kind whose moves live in its own module - the `mod` ones), or its function chooses between fewer than TWO moves;
// a placed elite or an ambush room's captain has no affix, or one that does not fit its level's act (src/elite-kit.js AFFIX_FIT /
// LEVEL_FIT; no SUMMONER in an ambush room); the poise opening or the escalation is not wired; or docs/elite-lab.json (tools/elite-lab.mjs)
// records a MASH-BOT WIN against any kind that stands in a level, or has no row for it. The human bot's rate is reported, not gated.
{ const { AFFIX_AT, affixFits, K: EKK } = await import('../src/elite-kit.js');
  const out2 = [], kindRows = [...(mainSrc.match(/\nconst ELITE = \{([\s\S]*?)\n\};/) || ['', ''])[1].matchAll(/(?:^|[\s,{])([a-z]+): \{ name: '[^']*'|(?:^|[\s,{])([a-z]+): \{ name: "[^"]*"/g)];
  const tableSrc = (mainSrc.match(/\nconst ELITE = \{([\s\S]*?)\n\};/) || ['', ''])[1];
  console.log('\n== ELITES2: own moves, affixes, the opening ==');
  for (const kind of eliteKinds) {
    const row = (tableSrc.match(new RegExp('(?:^|[\\s,{])' + kind + ': \\{([^}]*)\\}')) || ['', ''])[1], mod = /mod: true/.test(row);
    const disp = mainSrc.match(new RegExp("\\n  if \\(e\\.t === '" + kind + "'\\) return (updateElite[A-Z]\\w*)\\(e, dt\\);|\\n  if \\(e\\.t === '" + kind + "'\\) return false;"));
    if (!/own: true/.test(row)) out2.push(kind + ': no own: true in the ELITE table');
    if (!disp) { out2.push(kind + ': no dispatch line of its own in updateElite'); continue; }
    if (!disp[1]) { if (!mod) out2.push(kind + ': dispatched to no moves (return false) but not marked mod'); continue; }
    const at = mainSrc.indexOf('\nfunction ' + disp[1] + '(e, dt)'); if (at < 0) { out2.push(kind + ': ' + disp[1] + ' is not defined'); continue; }
    let d = 0, i = mainSrc.indexOf('{', at), end = i; for (; end < mainSrc.length; end++) { if (mainSrc[end] === '{') d++; else if (mainSrc[end] === '}' && --d === 0) break; }
    const body = mainSrc.slice(at, end), dec = body.slice(body.indexOf('if (!e.elBack)'), body.indexOf('e.modeT -= dt') > 0 ? body.indexOf('e.modeT -= dt') : body.indexOf('elPre(e, dt)'));
    const moves = new Set([...dec.matchAll(/e\.mode = '([A-Za-z0-9]+)'/g)].map(m => m[1]));
    if (moves.size < 2) out2.push(kind + ': ' + disp[1] + ' chooses between ' + moves.size + ' move(s), not two (' + [...moves].join(', ') + ')');
    console.log(' ok  ' + kind.padEnd(14) + disp[1].padEnd(26) + [...moves].join(', '));
  }
  /* the affixes, one for every placed elite and every ambush captain, by the same key the game reads (src/elite-kit.js key) */
  for (const lv of LEVELS) {
    if ((lv.hidden && !lv.secret) || lv.id === 'custom' || (want.length && !want.includes(lv.id))) continue;
    const L = lv.build(), ents = L.ents.filter(e => e.elite && eliteKinds.has(e.t));
    for (const e of ents) { const kin = L.ents.filter(q => q.elite && q.t === e.t).sort((a, b) => a.x - b.x), k = lv.id + '|' + e.t + (kin.length > 1 ? '#' + (kin.indexOf(e) + 1) : ''), af = e.affix || AFFIX_AT[k];
      if (!af) out2.push(k + ' @' + e.x + ': no affix (src/elite-kit.js AFFIX_AT)'); else if (!affixFits(lv.id, af, false)) out2.push(k + ': ' + af + ' does not fit ' + lv.id); }
    for (const A of L.ambushes || []) for (const w of A.waves) for (const [t, , , o] of w) { if (!o || !o.elite || !eliteKinds.has(t)) continue; const k = lv.id + '|' + t + '#amb', af = o.affix || AFFIX_AT[k];
      if (!af) out2.push(k + ': no affix'); else if (!affixFits(lv.id, af, true)) out2.push(k + ': ' + af + ' does not fit ' + lv.id + "'s ambush room"); }
  }
  /* THE OPENING AND THE ESCALATION are wired */
  if (!/function breakBeat\(e\) \{ if \(e\.elite && EK\) EK\.broke\(e\);/.test(mainSrc)) out2.push('breakBeat does not open an elite (EK.broke)');
  if (!/if \(m === POISE_LIGHT \|\| e\.elite \|\|/.test(mainSrc)) out2.push("an elite's poise is not filled by heavies only (addPoise)");
  if (!(EKK.openT >= 2.5)) out2.push('the opening is under 2.5 s (src/elite-kit.js K.openT ' + EKK.openT + ')');
  if (!(EKK.rouseAt > 0 && EKK.rouseAt < 1)) out2.push('no escalation (K.rouseAt)');
  if (!/const EL = \{ hp: 2,/.test(mainSrc)) out2.push('EL.hp is not 2 (the brief: three times the health down to about two)');
  /* THE MASH BOT LOSES TO EVERY ELITE (docs/elite-lab.json, tools/elite-lab.mjs --write) */
  /* REPORT-ONLY, and the list may only SHRINK (like MASH_REPORT_ONLY): kinds the elite lab's two bots cannot fight as a player would. A listed kind that holds fails (take it out) */
  const LAB_REPORT_ONLY = { drownedcaptain: 'a swim fight under the Keep: his moves are his own module, and neither bot engages him (the human bot times out 0/6)', barker: 'he calls from his crate six tiles up: the bots fight him from below (the human bot 2/6, timeouts)' };
  const labFile = new URL('../docs/elite-lab.json', import.meta.url), placed = new Set();
  for (const lv of LEVELS) { if ((lv.hidden && !lv.secret) || lv.id === 'custom') continue; const L = lv.build(); for (const e of L.ents) if (e.elite && eliteKinds.has(e.t)) placed.add(e.t); for (const A of L.ambushes || []) for (const w of A.waves) for (const [t, , , o] of w) if (o && o.elite && eliteKinds.has(t)) placed.add(t); }
  if (!want.length) {
    let lab = null; try { lab = JSON.parse(readFileSync(labFile, 'utf8')); } catch { out2.push('docs/elite-lab.json is missing: run node tools/elite-lab.mjs --write'); }
    if (lab) { console.log('\n  kind          mash wins  human wins (target ~75-85%)');
      for (const t of [...placed].sort()) { const r = lab.kinds[t];
        if (!r) { out2.push(t + ': no row in docs/elite-lab.json (not measured)'); continue; }
        if (r.mash.wins > 0 && !LAB_REPORT_ONLY[t]) out2.push(t + ': the MASH BOT beat it ' + r.mash.wins + '/' + r.mash.n + ' (docs/elite-lab.json)');
        else if (LAB_REPORT_ONLY[t]) { if (!(r.mash.wins > 0)) out2.push(t + ': holds against the mash bot now - take it out of LAB_REPORT_ONLY'); else console.log('  (report-only: ' + t + ' - ' + LAB_REPORT_ONLY[t] + ')'); }
        console.log('  ' + t.padEnd(14) + (r.mash.wins + '/' + r.mash.n).padEnd(11) + r.human.wins + '/' + r.human.n); } }
  }
  for (const o of out2) console.log('FAIL ' + o);
  if (out2.length) bad += out2.length;
}
console.log('\n' + n + ' elites. ' + (bad ? bad + ' level(s) fail.' : 'every elite can be fought and every gate it holds opens onto the route.'));
process.exitCode = bad ? 1 : 0;
