/* tools/phase-two.mjs — RULE A10, AS A REPORT. Node only. `node tools/phase-two.mjs [bossName]`
   NOT IN THE SUITE, AND DELIBERATELY NOT AN ASSERT. Read the next paragraph before making it one.

   A10 SAYS A PHASE MUST CHANGE SOMETHING YOU CAN NAME. I tried three times to check that statically and produced a
   different class of false positive each time:

     1. Looking for `phase === 2 ? a : b` ternaries failed SEVENTEEN healthy bosses, because most of them write
        `if (e.phase >= 2 && ...)` instead — the Goblin Queen, the Kraken and the Archmage among them.
     2. Counting any comparison against the phase number still failed NINE, because scoping a boss's body inside
        main.js is unreliable: `updateArchmage` and `updateArchmageRoom` both match the same function pattern.
     3. And some bosses do not use a phase NUMBER at all. The Dune Worm keeps a boolean `W.phase2`, and its second
        phase does two real things (an extra false ripple, and it kills what it catches) that no search for
        `phase === 2` will ever see.

   So this prints what it finds and judges nothing. A boss whose phase appears only in its own transition is worth
   looking at; a boss with one numeric tweak is worth looking at; and neither is a failure until a human says so.

   IT HAS ALREADY EARNED ITS KEEP ONCE. THE SKELETON KING — the desert arc's unbuilt world boss — declares phases at
   2/3 and 1/3 health, and EVERY behavioural change he has is gated on phase THREE: his speed, his attack chain
   (CHAIN3), his cooldowns. Nothing reads phase two except the transition that leaves it. His second phase is an
   announcement and a 'shut' animation, and then he fights exactly as before. Caught before he was ever wired in,
   which is the whole point of reading a boss before building it. */
import { readFileSync, readdirSync } from 'node:fs';

const SRC = new URL('../src/', import.meta.url);
const only = process.argv[2] && process.argv[2].toLowerCase();

const rows = [];
for (const f of readdirSync(new URL('.', SRC)).filter(n => n.endsWith('.js'))) {
  const s = readFileSync(new URL(f, SRC), 'utf8');
  const lines = s.split('\n');
  const hits = [];
  lines.forEach((line, i) => {
    const t = line.trim();
    if (!t || t.startsWith('//') || t.startsWith('*')) return;
    if (!/\bphase[2-5]?\b/.test(line)) return;
    const transition = /phase\s*=\s*[0-9]|phase[2-5]\s*=\s*true/.test(line);
    hits.push({ n: i + 1, transition, text: t.replace(/\s+/g, ' ').slice(0, 104) });
  });
  if (hits.length) rows.push({ file: f, hits });
}

let shown = 0;
for (const r of rows) {
  if (only && !r.file.toLowerCase().includes(only)) continue;
  const behaviour = r.hits.filter(h => !h.transition).length;
  const flag = behaviour === 0 ? '   <<< NO BEHAVIOUR: every mention is a transition' : behaviour === 1 ? '   <<< one line only' : '';
  console.log('\n' + r.file + '  —  ' + r.hits.length + ' phase lines, ' + behaviour + ' of them behaviour' + flag);
  for (const h of r.hits) console.log('   ' + String(h.n).padStart(5) + (h.transition ? '  ·  ' : '  →  ') + h.text);
  shown++;
}
console.log('\n' + shown + ' file(s) with phases.  "·" is a transition, "→" is behaviour attached to a phase.');
console.log('A10 is judgement, not arithmetic — this is a reading aid, not a gate. Known real finding: THE SKELETON');
console.log('KING\'s phase two is an announcement and nothing else; every change he has is gated on phase three.');
