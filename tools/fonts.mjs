// tools/fonts.mjs - THE STRICT FONT PAIR (claude/fontpair, Daniel 2026-10-09). Press Start 2P = display, Silkscreen = body, nothing else.
// Static: both faces are local files in fonts/ with their SIL OFL licence beside them, index.html preloads both and declares them with
// @font-face (no CDN, no stylesheet link, no VT323), no source file names a system monospace or the retired thin hand (ART.TINY), the Font
// setting is gone, the credits name both fonts. Then in the page: both faces are loaded (not a fallback) before the first frame.
//   node tools/fonts.mjs          exit 1 on any failure
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { openPage, ROOT } from './cdp.mjs';

const fails = [], ok = (c, m) => { if (!c) fails.push(m); };
const read = f => readFileSync(join(ROOT, f), 'utf8');

for (const [file, lic, fam] of [['PressStart2P-Regular.ttf', 'OFL-PressStart2P.txt', 'Press Start 2P'], ['Silkscreen-Regular.ttf', 'OFL-Silkscreen.txt', 'Silkscreen']]) {
  const p = join(ROOT, 'fonts', file);
  ok(existsSync(p) && statSync(p).size > 10000, 'fonts/' + file + ' is missing or tiny');
  if (existsSync(p)) ok(readFileSync(p).readUInt32BE(0) === 0x00010000, 'fonts/' + file + ' is not a TrueType file');
  ok(existsSync(join(ROOT, 'fonts', lic)) && /SIL OPEN FONT LICENSE/i.test(read('fonts/' + lic)), 'fonts/' + lic + ' (the licence) is missing');
  ok(new RegExp('rel="preload"[^>]*fonts/' + file.replace('.', '\\.') + '[^>]*crossorigin').test(read('index.html')), 'index.html does not preload fonts/' + file + ' (with crossorigin)');
  ok(new RegExp('@font-face[^}]*font-family: "' + fam + '"[^}]*fonts/' + file.replace('.', '\\.')).test(read('index.html')), 'index.html has no local @font-face for ' + fam);
}
const html = read('index.html');
ok(!/googleapis|gstatic|VT323|<link[^>]*stylesheet[^>]*http/i.test(html), 'index.html still links a font CDN / VT323');
ok(!/monospace/i.test(html.replace(/--font-(?:display|body)[^;]*;/g, '')), 'index.html names a system monospace');
const sw = read('sw.js'); ok(!/googleapis|gstatic/.test(sw), 'sw.js still special-cases the font CDN');

const src = readdirSync(join(ROOT, 'src')).filter(f => f.endsWith('.js'));
for (const f of src) { const t = read('src/' + f).split(/\r?\n/);
  t.forEach((l, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(l)) return;   // comments may name what is retired
    if (/font[^;]*monospace|monospace['"]/.test(l) && !/^\s*\/\*/.test(l)) ok(false, 'src/' + f + ':' + (i + 1) + ' draws in a system monospace');
    if (/VT323|ART\.TINY|bakeTinyFont/.test(l)) ok(false, 'src/' + f + ':' + (i + 1) + ' uses a retired face');
  }); }
ok(!/'Font'/.test(read('src/settings-ui.js')), 'the Font setting is still listed in src/settings-ui.js');
ok(/const FONTS = \[[^\]]*display[^\]]*body[^\]]*\]/s.test(read('src/main.js')) && !/\{ id: "(?!display|body)/.test((read('src/main.js').match(/const FONTS = \[[^\]]*\]/s) || [''])[0]), 'main.js FONTS is not exactly the display + body pair');
const cr = read('src/credits.js'); ok(/Press Start 2P/.test(cr) && /Silkscreen/.test(cr) && /OFL/.test(cr), 'src/credits.js does not credit both fonts under the OFL');

const pg = await openPage({ audio: false, fonts: true });
try {
  const r = await pg.evalp(`(async () => { await document.fonts.ready; const o = {};
    for (const f of ['Press Start 2P', 'Silkscreen']) { o[f] = document.fonts.check('8px "' + f + '"'); }
    o.faces = [...document.fonts].map(f => f.family.replace(/"/g, '') + ':' + f.status);
    o.remote = performance.getEntriesByType('resource').filter(e => /fonts\\.(googleapis|gstatic)/.test(e.name)).length;
    o.local = performance.getEntriesByType('resource').filter(e => /\\/fonts\\/.*\\.ttf/.test(e.name)).map(e => e.name.split('/').pop());
    return JSON.stringify(o); })()`, 60000);
  const o = JSON.parse(r);
  ok(o['Press Start 2P'] && o['Silkscreen'], 'a face of the pair is not loaded in the page: ' + r);
  ok(o.remote === 0, 'the page still fetched a font from a CDN');
  ok(o.faces.length === 2 && o.faces.every(f => /:loaded$/.test(f)), 'the page does not hold exactly the two loaded faces: ' + o.faces.join(' '));
  ok(o.local.length === 2, 'the page did not fetch both local font files: ' + o.local.join(' '));
} finally { await pg.close(); }

if (fails.length) { console.log('FONT PAIR: ' + fails.length + ' problem(s)'); for (const f of fails) console.log(' - ' + f); process.exit(1); }
console.log('FONT PAIR ok: Press Start 2P + Silkscreen, local, preloaded, licensed, no monospace, no thin hand');
