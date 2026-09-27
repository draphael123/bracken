// tools/npc-removal.mjs — DANIEL'S DECISION (2026-09-26, "they don't add much"): every decorative talker and
// quest-giver NPC outside the shops is gone from the levels and the map. What is left:
//   - the MARSH FERRYMAN (pay the toll, or break the sluice and drain the channel) and the BURNING VILLAGE
//     CAPTIVES (rescue targets): both a mechanic, neither with dialogue.
//   - the shop KEEPER, unchanged, in the three store rooms.
// Every former quest's relic reward is a direct pickup placed in the level now (no NPC, no turn-in): one relic
// per former relic-quest, standing on ground the campaign can actually reach.
//   node tools/npc-removal.mjs           every live level, the shops, the marsh and the burning village
//   node tools/npc-removal.mjs -v        also lists every relic/npc/captive found
import { LEVELS } from '../src/level.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const verbose = process.argv.includes('-v');
let bad = 0;
const fail = msg => { bad++; console.log('FAIL: ' + msg); };

// ---------- 1. STATIC SCAN: no ent('npc', ...) anywhere in the source (live levels or benched ones the
// campaign does not currently route to - RULES P) may carry a kind other than the shop keeper or the ferryman.
// This is a text scan, not a build, so it also catches a benched level builder nothing in LEVELS calls today. ----------
const srcPath = fileURLToPath(new URL('../src/level.js', import.meta.url));
const src = readFileSync(srcPath, 'utf8');
const ALLOWED_NPC_KIND = new Set(['keeper', 'ferryman']);
const npcCallRe = /ent\('npc',\s*[^,]+,\s*[^,]+,\s*\{([^}]*)\}\)/g;
let m;
while ((m = npcCallRe.exec(src))) {
  const body = m[1];
  const kindM = body.match(/kind:\s*'([^']+)'/);
  const kind = kindM ? kindM[1] : null;
  if (!kind || !ALLOWED_NPC_KIND.has(kind)) { fail(`src/level.js has an npc placed with kind '${kind}' (only 'keeper' and 'ferryman' are allowed outside the removed cast): ...${m[0]}`); continue; }
  if (kind === 'ferryman' && (/\blines:/.test(body) || /\bname:/.test(body))) fail(`src/level.js: a ferryman npc carries its own dialogue (lines/name) - the ferryman is a mechanic, not a talker: ...${m[0]}`);
}
// no leftover quest table naming the wandering squire ("Tam") - the whole cast is gone, not just his ents
for (const gone of ['TAM_LINES', 'TAM_QUEST', 'TAM_MAP']) {
  const mainPath = fileURLToPath(new URL('../src/main.js', import.meta.url));
  const mainSrc = readFileSync(mainPath, 'utf8');
  if (mainSrc.includes(gone)) fail(`src/main.js still defines/uses ${gone} - Tam should be gone from the map and every level's trailhead`);
}

// ---------- 2. LIVE LEVELS: build every entry in LEVELS and check what actually reaches a player ----------
const NPC_OUTSIDE_SHOP_OK = new Set(['ferryman']);
let ferrymanSeen = false, captivesSeen = false;
// former RELIC quests whose reward must show up as a pickup somewhere in the live campaign (RULES R: a relic
// pays for itself; it does not need to be reachable from every level that happens to share its name - some of
// these kinds are deliberately reused by two different levels, which was already true before this change).
const EXPECTED_RELIC_KINDS = new Set(['fleece', 'soles', 'sunshard', 'shoes', 'banner', 'gauntlet', 'windcloak',
  'tidecharm', 'diverlamp', 'blackflag', 'stormline', 'wick', 'spurs', 'lamp']);
const relicKindsSeen = new Set();

for (const lv of LEVELS) {
  let L; try { L = lv.build(); } catch (e) { fail(lv.id + ': build failed - ' + e.message); continue; }
  const ents = L.ents || [];
  const npcs = ents.filter(e => e.t === 'npc');
  const relics = ents.filter(e => e.t === 'relic');
  const captives = ents.filter(e => e.t === 'captive');
  const isShop = !!L.shop;
  for (const n of npcs) {
    if (isShop) { if (n.kind !== 'keeper') fail(lv.id + ': a shop room has a non-keeper npc (' + n.kind + ') standing in it'); }
    else if (!NPC_OUTSIDE_SHOP_OK.has(n.kind)) fail(lv.id + ': an npc with kind \'' + n.kind + '\' stands outside a shop - every decorative talker and quest-giver was supposed to go');
    if (n.kind === 'ferryman') { ferrymanSeen = true; if (n.lines || n.name) fail(lv.id + ": the ferryman carries dialogue (lines/name) - he should be a mechanic, not a talker"); }
  }
  if (captives.length) { captivesSeen = true; for (const c of captives) if (c.lines || c.name) fail(lv.id + ': a captive carries dialogue (lines/name) - captives are rescue targets, not talkers'); }
  for (const r of relics) relicKindsSeen.add(r.kind);
  if (verbose && (npcs.length || relics.length || captives.length)) console.log('  ' + lv.id.padEnd(14) + 'npc=[' + npcs.map(n => n.kind).join(',') + '] relic=[' + relics.map(r => r.kind).join(',') + '] captive=' + captives.length);
}

if (!ferrymanSeen) fail("no live level places the marsh ferryman (npc kind 'ferryman') - the mechanic itself is missing");
if (!captivesSeen) fail("no live level places any captives - the burning village rescue mechanic is missing");
for (const kind of EXPECTED_RELIC_KINDS) if (!relicKindsSeen.has(kind)) fail("no live level's relic pickups include '" + kind + "' - a former quest's reward may have been dropped, not just its NPC");

console.log(bad ? '\n' + bad + ' problem(s).' : '\nevery NPC outside the shops is gone; the ferryman and the captives are mechanics without dialogue; every former quest\'s relic is a pickup somewhere reachable.');
process.exitCode = bad ? 1 : 0;
