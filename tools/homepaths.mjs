/* tools/homepaths.mjs — NO TOOL MAY HARDCODE A PATH INSIDE SOMEBODY'S HOME DIRECTORY.
 *
 * WHY THIS EXISTS. On 2026-09-23 a fresh clone of this repo on a second machine failed `npm run check` on textfit,
 * and the failure had nothing to do with the game: three tools defaulted their output directory to
 *
 *     C:/Users/danie/AppData/Local/Temp/claude/C--Users-danie-.../<session uuid>/scratchpad/audit-readability
 *
 * a scratchpad belonging to one session on one machine, with a session UUID baked into it. That directory existed
 * for exactly one person, so the suite was green for him and red for everyone else, and it died in mkdir before it
 * had measured a single string. A fourth copy sat in tools/stormhold-draft.py, pointing at that machine's level.js.
 *
 * THE RULE, NOT THE ROW. One reported bad row means an unenforced rule, so this asserts the rule over every source
 * and tool file rather than listing the four we happened to find. The family already had a right answer to copy:
 * audit-lib.mjs and audit-contact.mjs default to a path inside the REPO, and that is what the fixed tools do now.
 *
 * WHAT IS ALLOWED. A machine location is fine - cdp.mjs, headless.mjs, profile.mjs and levelvideo.mjs all list
 * 'C:/Program Files/Google/Chrome/Application/chrome.exe' with an Edge and a Linux fallback beside it, which is a
 * list of places a browser lives rather than a place one person keeps their files. What is banned is a path under
 * a USER: C:/Users/<someone>, /Users/<someone>, /home/<someone>. Read the home directory from the environment
 * (os.homedir(), process.env.OUT, TEMP) or, better, put the default inside the repo.
 */
import { readdirSync, statSync, readFileSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SELF = 'homepaths.mjs';

/* C:\Users\x, C:/Users/x, /Users/x, /home/x - with a name after the separator, so the bare directory is not a hit */
const HOME = /(?:[A-Za-z]:[\\/]+Users[\\/]+|(?<![\w.])\/Users\/|(?<![\w.])\/home\/)([A-Za-z0-9._-]+)/g;

const files = [];
const walk = d => {
  for (const f of readdirSync(join(ROOT, d))) {
    const p = join(d, f);
    if (statSync(join(ROOT, p)).isDirectory()) walk(p);
    else if (/\.(m?js|py)$/.test(f) && f !== SELF) files.push(p);
  }
};
walk('src'); walk('tools');

const bad = [];
for (const f of files) {
  const lines = readFileSync(join(ROOT, f), 'utf8').split(/\r?\n/);
  lines.forEach((line, i) => {
    for (const m of line.matchAll(HOME)) {
      bad.push(f.split('\\').join('/') + ':' + (i + 1) + '  under the home of "' + m[1] + '": ' + line.trim().slice(0, 120));
    }
  });
}

if (bad.length) {
  console.error('A PATH INSIDE SOMEBODY\'S HOME DIRECTORY, which exists on exactly one machine:\n  ' + bad.join('\n  ')
    + '\n\nDefault it into the repo instead - join(ROOT, ...) like textfit.mjs, or new URL(\'../audits/...\', import.meta.url)'
    + ' like audit-lib.mjs - and keep process.env.OUT as the override.');
  process.exit(1);
}
console.log('ok  homepaths     ' + files.length + ' source and tool files, none hardcodes a path under a user\'s home directory.');
