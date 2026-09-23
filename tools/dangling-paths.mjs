/* tools/dangling-paths.mjs — EVERY PATH A DOCUMENT POINTS AT IS A PATH A FRESH CLONE CAN OPEN. Node only: no page,
 * no port, no Chrome.
 *
 * WHAT IT ANSWERS, YES OR NO. This repository navigates by citation: `docs/QUEUE.md` sends you to a brief, a brief
 * sends you to a greybox, and the first line of nearly every module in src/ names the brief it was built from. Those
 * citations are only worth anything if the file is THERE. This reads every tracked document and source comment,
 * pulls out every repo-relative path it mentions, and fails when one of them is not tracked in git.
 *
 * WHY IT EXISTS. On 2026-09-24 `.claude/briefs/` was found to have been ignored since the rule was written, while
 * twenty-two tracked files cited paths inside it - docs/QUEUE.md §2 ("These were designed on 2026-09-20/21 and live
 * in `.claude/briefs/`. Do not redesign them."), hero-kits.md §7's table of three class levels, the first line of
 * src/draft/unburied-field.js, and sunken-caravan-amendments.md, whose title defers to a brief no clone has. On the
 * machine that wrote them every one of those resolved. On every other machine they were half a sentence, and THE
 * UNBURIED FIELD - brief plus greybox, the closest thing in the queue to ready - could not be built at all. Nobody
 * noticed for four days because NOTHING WAS LOOKING. This is the same shape as the homepaths bug and wants the same
 * answer: not a fix to the row, a check that fails the next one.
 *
 * WHY IT READS `git ls-files` AND NOT THE DISK. A file can sit in the working tree, be ignored, and be missing from
 * every clone - which is exactly the bug. Asking the filesystem would have called the briefs present on the one
 * machine that had them and said nothing, on the very day it mattered. Asking git asks what a FRESH CLONE gets.
 * It also makes this check case-sensitive on Windows, where the filesystem is not: `docs/Queue.md` resolves here and
 * 404s on the ubuntu runner, and that is a red nobody can reproduce locally.
 *
 * WHAT IT WILL NOT DO, AND SAYS SO EVERY RUN. A check that cries wolf gets switched off, so this only looks at paths
 * that cannot be anything else: a known top-level directory, a real file extension, and no wildcard, variable or
 * template hole in it. Constructed paths (`'src/' + name + '.js'`), globs, and anything inside a .gitignore-style
 * rule are none of its business and are skipped silently. Paths that are KNOWN to be missing live in MISSING below
 * with the reason written next to them: they are printed every single run, so the hole stays visible instead of
 * being quietly forgiven, and the list is meant to shrink to nothing.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

/* KNOWN HOLES. Each one is a path a tracked file points at that no clone has, with why. Delete a line the moment the
   file is committed - the tool tells you when that happens. A list that only ever grows is a way of not fixing it. */
const MISSING = new Map([
  ['.claude/briefs/', 'THE DESIGN IS ON ONE MACHINE. Ignored since the rule was written, never in any commit; the ignore is now narrowed (.claude/* + !.claude/briefs/) so the machine that has them can `git add .claude/briefs/` with no -f. Until it does, every citation below is half a sentence and THE UNBURIED FIELD cannot be built.'],
  ['work/', 'SCRATCH, AND SEVERAL OF THESE CARRY A SESSION UUID (work/a33bc100-.../). Tracked documents cite a directory no clone has. Harmless where it is an aside about how a number was got; a dead end where a reader is told to go and read it. Re-point or drop them as each document is next touched.'],
  ['audits/audio-audit.json', 'GENERATED. tools/audit-audio.mjs writes it; audits/*/ and this file are tool output, kept out of git on purpose. The citation is a tool naming its own output, which is right.'],
  ['audits/combat/', 'GENERATED. tools/audit-lib.mjs writes it; ignored by audits/*/ on purpose.'],
  ['src/tower-return.js', 'STALE CITATION - docs/audit-new-levels-0920.md:47 names a module that is in no commit. Correct the reference or say what replaced it; do not create the file to satisfy the check.'],
  ['tools/sunken-caravan.mjs', 'STALE CITATION - docs/caravan-mechanics.md:16 names a tool that is in no commit (the caravan tools are caravan.mjs, caravan-level.mjs, caravan-map.mjs). Correct the reference.'],
]);
/* a citation is forgiven if it sits under one of the MISSING prefixes */
const forgiven = p => [...MISSING.keys()].some(m => m.endsWith('/') ? p.startsWith(m) : p === m);

/* the directories a repo path can start with. Anything else in a sentence is prose, a URL or somebody's shell. */
const TOP = ['.claude', '.github', 'docs', 'src', 'tools', 'audits', 'audio', 'work'];
/* a path, and nothing that is secretly a pattern: no *, ?, {, $, +, backslash or template hole */
const PATH_RE = new RegExp('(?:' + TOP.map(d => d.replace('.', '\\.')).join('|') + ')/[A-Za-z0-9._/-]*[A-Za-z0-9_-]\\.[A-Za-z0-9]{1,5}', 'g');
const DIR_RE = new RegExp('(?:' + TOP.map(d => d.replace('.', '\\.')).join('|') + ')/[A-Za-z0-9._-]+/', 'g');

const git = (...a) => spawnSync('git', a, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const ls = git('ls-files', '-z');
assert.equal(ls.status, 0, 'git ls-files failed: ' + (ls.stderr || '').trim());
const tracked = new Set(ls.stdout.split('\0').filter(Boolean));
assert.ok(tracked.size > 100, 'git ls-files returned only ' + tracked.size + ' files: this check is guarding nothing');
/* every directory that tracked files imply, so `docs/briefs/` resolves without being a file itself */
const trackedDirs = new Set();
for (const f of tracked) { const parts = f.split('/'); for (let i = 1; i < parts.length; i++) trackedDirs.add(parts.slice(0, i).join('/') + '/'); }

/* WHERE A CITATION CAN LIVE: prose and comments. Reading whole source files would pull in string literals that are
   built at runtime, so .js/.mjs are read for their COMMENTS only - which is where this repo puts its citations. */
const comments = src => (src.match(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g) || []).join('\n');
const SKIP = new Set(['tools/dangling-paths.mjs', '.gitignore', '.vercelignore']);

const holes = [];         /* { file, line, path } - cited, not tracked, not a known hole */
const forgivenHits = [];  /* { file, line, path } - cited, not tracked, on the MISSING list */

for (const f of tracked) {
  if (SKIP.has(f)) continue;
  const isDoc = /\.(md|txt)$/.test(f), isSrc = /\.(m?js)$/.test(f);
  if (!isDoc && !isSrc) continue;
  let raw;
  try { raw = readFileSync(ROOT + f, 'utf8'); } catch { continue; }
  if (raw.includes('\0')) continue;
  const text = isSrc ? comments(raw) : raw;
  const lineOf = p => { const i = raw.indexOf(p); return i < 0 ? 0 : raw.slice(0, i).split('\n').length; };
  const seen = new Set();
  for (const re of [PATH_RE, DIR_RE]) {
    re.lastIndex = 0;
    for (const m of text.matchAll(re)) {
      const p = m[0];
      if (seen.has(p)) continue;
      seen.add(p);
      /* `docs/audit/anim-0..2.png` is a way of writing three filenames, not a filename. A range is not a citation. */
      if (p.includes('..')) continue;
      if (tracked.has(p) || trackedDirs.has(p) || trackedDirs.has(p + '/')) continue;
      (forgiven(p) ? forgivenHits : holes).push({ file: f, line: lineOf(p), path: p });
    }
  }
}

/* THE KNOWN HOLES, PRINTED EVERY RUN so they cannot rot quietly */
for (const [p, why] of MISSING) {
  const cites = forgivenHits.filter(h => h.path.startsWith(p) || h.path === p);
  /* A HOLE IS CLOSED WHEN NOTHING DANGLES UNDER IT ANY MORE - not when something under the prefix happens to be
     tracked. `work/audit/` is committed while every `work/claude/...` citation is still dead, and reading the
     prefix as closed would have forgiven the twenty citations this entry exists to keep visible. */
  if (!cites.length) { console.log('    ' + p + ' NO LONGER DANGLES - delete its line from MISSING in tools/dangling-paths.mjs.'); continue; }
  console.log('    KNOWN HOLE  ' + p + '  (' + cites.length + ' citation' + (cites.length === 1 ? '' : 's') + ')\n      ' + why);
  if (cites.length) console.log('      cited by: ' + [...new Set(cites.map(c => c.file))].slice(0, 6).join(', ') + (new Set(cites.map(c => c.file)).size > 6 ? ' and more' : ''));
}

if (holes.length) {
  const lines = holes.map(h => '    ' + h.file + ':' + h.line + '  ->  ' + h.path);
  assert.fail(holes.length + ' path(s) cited by tracked files are in no commit:\n' + lines.join('\n')
    + '\n  A fresh clone cannot open these. Either commit the file, or correct the citation. If it is ignored on'
    + '\n  purpose and the citation is still right, narrow the ignore rather than force-adding it, and add the path'
    + '\n  to MISSING in tools/dangling-paths.mjs with the reason - never delete the check to make it quiet.');
}

console.log('ok  dangling-paths ' + tracked.size + ' tracked files, every repo path they cite resolves in a fresh clone'
  + (MISSING.size ? ' (' + MISSING.size + ' known hole' + (MISSING.size === 1 ? '' : 's') + ' listed above, forgiven on purpose)' : '') + '.');
