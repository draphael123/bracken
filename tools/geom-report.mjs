/* Turn the two JSON sweep receipts into Daniel's ranked, coordinate-level art handoff. Keep the coordinate links literal:
   every finding opens the corresponding real-render crop in work/codex/shots/geomsweep. */
import { readFileSync, writeFileSync } from 'node:fs';
const root = new URL('../work/codex-lane-done/', import.meta.url);
const first = name => JSON.parse(readFileSync(new URL(name, root), 'utf8').split(/\r?\n/)[0]);
const drawn = new Map(first('geomsweep-drawn-raw.log').rows.map(r => [r.id, r]));
const rows = first('geomsweep-support-raw.log');
const theme = {
  wood: 'living boughs and rooted trunks', marsh: 'bog-oak piles and reed lashings', stockade: 'palisade stakes and stockade braces', spore: 'fungal stems and mycelium shelves', kings: 'branch hangers and rope ties',
  scree: 'crag stone and rock ribs', hanging: 'cliff ropes and timber hangers', spire: 'monastery stone corbels and chain hangers', moor: 'moor stone and rooted heather', storm: 'weathered ship timber and rigging', crown: 'castle masonry and arch corbels',
  longwater: 'river rock and reed pilings', reef: 'reef rock and coral ribs', flotilla: 'ship hull frames and rigging', hurricane: 'wreck timber and mast stays', lamplit: 'town brick and iron brackets', underleaf: 'roots and canopy trunks',
  shop: 'the shop’s existing timber frame', trial_open: 'the trial’s existing stone dais', shopCrag: 'crag stone', shopSea: 'ship timber and pier posts', deep: 'mine stone and iron braces', keep: 'keep masonry and buttresses', causeway: 'sea stone and bridge piers', harbor: 'quay stone and bollards', waymeet: 'quay timber and mooring posts',
  undercrown: 'mine stone and crystal buttresses', fields: 'dead orchard trunks and bale props', burial: 'crypt stone and ossuary piers', mage: 'runed stone and library shelves', fallingtower: 'tower masonry and iron ties', burning: 'charred beams and stone hearths', witchlight: 'runed stone and stair buttresses', oreroad: 'ore-road pylons and iron trestles',
  unburied: 'siege timber and stone piers', caravan: 'sandstone, wagon ribs and dune-rock', fair: 'ride frames and fairground timber', theatre: 'stage trusses and fly ropes', canal: 'canal brick, lock beams and weed mats', welltown: 'sandstone walls and cistern arches', shopWell: 'wellspring sandstone', redgorge: 'gorge rock and camp timber', underwell: 'cistern stone and arches',
  skyroad: 'cloud-stone pillars', glasssea: 'glass-rock fins and dune stone', ksar: 'desert sandstone and fort corbels', rootway: 'root arches and living trunks', minecart: 'rail trestles and mine timber', church: 'church masonry and iron stays', towpath: 'canal brick and towpath posts', buriedcity: 'sandstone corbels, pipe brackets and chains', sealedpyramid: 'pyramid stone and tomb corbels',
};
const shot = (id, x, y, label) => '[' + label + '](../codex/shots/geomsweep/' + id + '-' + x + '-' + y + '.png)';
const chunks = (a, n = 12) => { const out = []; for (let i = 0; i < a.length; i += n) out.push(a.slice(i, i + n).join(', ')); return out.join('  \n'); };
const rank = rows.map(r => { const d = drawn.get(r.id), top = d?.ph?.[0]?.cells || [], movers = d?.movers || []; return { ...r, top, movers, count: r.findings.length + top.length + movers.length }; }).sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));
const total = (k) => rank.reduce((s, r) => s + r[k], 0);
let md = '# Whole-game geometry sweep\n\n';
md += 'Base: `origin/master` at `c33c3204` (batch 93), 62 built `LEVELS` entries. The browser scans use the game’s own tile sprites, foreground painters and live 320×180 frame; the support scan measures the game’s structure and route-post art at native resolution. Existing Buried City and Unburied Field gates remain intact. The two new full-game checks are **report-only** while the art lanes review the backlog.\n\n';
md += '**Reading the counts:** “Top art” means fewer than three contiguous opaque pixels in the first four sprite rows of a standable surface; a sprite-less cell is accepted only when exact metadata routes it to a named foreground painter. “Mover” means the settled live frame did not show a three-pixel top difference when that mover was removed for one frame. “Overhang” means at least three rows of air below a standable run, with no validated foreground support or keyed visible exception. These are actionable art-review findings, not claims that every crop is a player-visible bug: themed natural ledges and special movers need human review before a gate.\n\n';
md += 'The rendered crop for **every** finding is linked below and saved as `work/codex/shots/geomsweep/<level>-<col>-<row>.png`. The yellow square marks the named tile. Screenshots are after the game’s startup fade and use `BK.look` with the hero hidden. No collision, grid, or game behavior was changed.\n\n';
md += '## Ranked levels\n\n| Rank | Level | Top art | Mover | Unsupported overhang | Total |\n| ---: | --- | ---: | ---: | ---: | ---: |\n';
rank.forEach((r, i) => { md += `| ${i + 1} | ${r.id} | ${r.top.length} | ${r.movers.length} | ${r.findings.length} | ${r.count} |\n`; });
md += `\nTotals: ${rank.reduce((s, r) => s + r.top.length, 0)} tile-top findings, ${rank.reduce((s, r) => s + r.movers.length, 0)} mover findings, ${rank.reduce((s, r) => s + r.findings.length, 0)} unsupported overhangs; ${rank.reduce((s, r) => s + r.accepted, 0)} overhangs accepted by visible supports or keyed reasons.\n\n`;
md += '## Level findings and theme-matched fix\n\n';
rank.forEach((r, i) => {
  md += `### ${i + 1}. ${r.id} — ${r.count} finding(s)\n\n`;
  md += '- Tile top: ' + (r.top.length ? chunks(r.top.map(c => shot(r.id, c[0], c[1], c[0] + ',' + c[1]))) : 'none') + '\n';
  md += '- Mover top: ' + (r.movers.length ? chunks(r.movers.map(c => shot(r.id, c[0], c[1], c[2] + '@' + c[0] + ',' + c[1]))) : 'none') + '\n';
  md += '- Unsupported overhang: ' + (r.findings.length ? chunks(r.findings.map(f => shot(r.id, f.x0, f.row, f.x0 + (f.x1 > f.x0 ? '-' + f.x1 : '') + ',' + f.row))) : 'none') + '\n';
  md += '- Suggested fix: ' + (r.count ? 'Draw a continuous three-pixel foreground footing with ' + (theme[r.id] || 'this level’s existing material') + ', joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.' : 'No art change indicated by this sweep.') + '\n\n';
});
md += '## QUESTIONS FOR DANIEL\n\n1. **Recommendation:** Send the ranked crop links to the corresponding art lanes, starting with spire, crown and hanging; keep these new checks report-only until each candidate is either fixed or keyed with a visible reason. The existing Buried City gate remains a gate.\n2. **Recommendation:** Review the tile-top and mover crops before treating every automated pixel finding as confirmed invisible geometry. The live mover test can flag a special carrier whose painted surface is offset from its collision top; the tool leaves it visible in the report rather than weakening the three-pixel rule.\n3. **Recommendation:** Keep theme-specific materials in the fixes; the desert and crypt should use their established stone, chain or bone language, and the post-Queen route should use undead or scenery rather than living goblins.\n';
writeFileSync(new URL('geom-sweep.md', root), md.replace(/\n/g, '\r\n'));
console.log('geom-report: ' + rank.length + ' levels, ' + rank.reduce((s, r) => s + r.count, 0) + ' linked findings');
