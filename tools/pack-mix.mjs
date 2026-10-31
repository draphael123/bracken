// tools/pack-mix.mjs - HOW MIXED ARE THE DESIGNED PACKS OF ACTS III-V? (claude/lategameb; brief-lategame-1101 Q1A item 1: "enforce the ROSTER in every act IV-V combat room: at least 3 of the 5 roles").
// REPORT-ONLY (static, no browser, always exits 0): for each level of acts III-V, every designed squad's roles (front / flank / back / heavy / support) and the share with >= 3 of the 5.
// The level lanes read it; the number to raise is "squads under 3 roles". Run: node tools/pack-mix.mjs [--list]
import { LEVELS } from '../src/level.js';
import { ACTS, ROSTER, roleOf } from '../src/foe-react.js';
const list = process.argv.includes('--list');
const roleKind = (act, t) => { const R = ROSTER[act]; if (!R) return roleOf({ t }); if (R.heavy.includes(t)) return 'heavy'; if (R.support.includes(t)) return 'support'; return roleOf({ t }); };
let tot = 0, low = 0, one = 0; const rows = [];
for (const A of ACTS.filter(a => a.act >= 3)) for (const id of A.levels) {
  const d = LEVELS.find(l => l.id === id); if (!d) continue; let L; try { L = d.build(); } catch { continue; }
  const sq = new Map(); for (const e of L.ents || []) if (e.squad && e.t && !e.elite) { let l = sq.get(e.squad); if (!l) sq.set(e.squad, l = []); l.push(e.t); }
  let n = 0, under = 0, mono = 0; for (const [name, kinds] of sq) { const roles = new Set(kinds.map(t => roleKind(A.act, t))); n++; if (roles.size < 2) mono++; if (roles.size < 3) { under++; if (list) console.log(`  ${id}/${name}: ${kinds.join('+')} -> ${[...roles].join('/')}`); } }
  tot += n; low += under; one += mono; rows.push(`act ${A.act} ${id.padEnd(13)} squads ${String(n).padStart(2)}  under 3 roles ${String(under).padStart(2)}  one-role ${String(mono).padStart(2)}`);
}
console.log(rows.join('\n'));
console.log(`pack-mix (report-only): ${tot} designed squads in acts III-V, ${low} under 3 roles (${tot ? Math.round(low / tot * 100) : 0}%), ${one} of ONE role (${tot ? Math.round(one / tot * 100) : 0}%) - the squads to mix first (a front with a back). Raise the mix in the act sweeps; the late-game dial (purse, affixes, pack glue) does not need it to land.`);
