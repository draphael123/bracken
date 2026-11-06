/* tools/build-itch.mjs - THE TRIMMED ITCH.IO BUILD (claude/batch143, Daniel 11-03/04: a free demo, King Gorm the last boss, shipped as an itch.io HTML5 zip).
   Reads the CURRENT checkout and writes, never touching a tracked file:
     dist-itch/site/                 the unpacked build (index.html at its root) - serve this folder to test it
     dist-itch/thornroad-demo-<sha>.zip   the same files as a zip (itch HTML5: "this file will be played in the browser"); NOT committed (dist-itch/ is gitignored and .vercelignore'd)
     dist-itch/build-report.json     file count, bytes, kept music, what was left out
   What it does:
     - the DEMO flag is ON (DEMO_BUILD = true, flipped in the bundle only: src/demo-flag.js is untouched, so the full game stays byte-identical with the flag off - tools/demo-cut.mjs)
     - src/ is bundled by esbuild (code-split ES modules: main.js, loading-screen.js, online-guest.js + a few shared chunks) instead of ~740 module files
     - audio: every SFX clip (loaded by name, some by a built name, so none are guessed away), the ambience beds, and ONLY the music tracks the 12 demo levels, their bosses and the menus can ask for;
       the bundle's TRACKS table is cut to the files shipped (a missing track would otherwise be a 404 in the console) - a track left out plays the synth / 'theme', as it does anywhere without the file
     - index.html: modulepreload list, manifest link and service-worker script dropped (sw.js is not shipped), module paths point at the bundle
     - docs/updates.json is replaced by a one-entry WHAT'S NEW (the real list names the full game's later content)
     - every shipped path is checked against ad-block words (src/admiral.js once froze the load at 14%, 10-27)
   Usage:  node tools/build-itch.mjs [--out dist-itch] [--no-zip] [--quiet]
   esbuild: ./node_modules/esbuild, else $ESBUILD_DIR, else the one inside the global `vercel` package (%APPDATA%/npm/node_modules/vercel/node_modules/esbuild). No network. */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, readdirSync, statSync, copyFileSync } from 'node:fs';
import { join, dirname, relative, sep, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import zlib from 'node:zlib';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const posix = p => p.split(sep).join('/');
/* tracks that are not tied to one level: the title / menus / map, the shop and tavern, the Gorm victory, and the defaults a level without its own music falls back to */
export const EXTRA_TRACKS = ['theme', 'select', 'store', 'ending', 'boss', 'minicharge'];
export const KEEP_PREFIX = 'amb';   /* the ambience beds: ambWind, ambTown, ambForest ... (ambience_forest.mp3) - tiny, and any wood may ask */
export const ADBLOCK_WORDS = new Set(['ad', 'ads', 'adv', 'advert', 'adverts', 'admiral', 'banner', 'banners', 'sponsor', 'sponsors', 'track', 'tracker', 'tracking', 'analytics', 'beacon', 'pixel', 'promo', 'popup', 'affiliate', 'click', 'clicks', 'stats', 'metrics', 'telemetry', 'doubleclick', 'adsense', 'pagead', 'gtag', 'gtm']);
export const adblockHits = paths => paths.filter(p => p.split('/').some(seg => seg.toLowerCase().split(/[^a-z]+/).some(t => ADBLOCK_WORDS.has(t))));

export function findEsbuild() {
  const tries = [join(ROOT, 'node_modules', 'esbuild'), process.env.ESBUILD_DIR, process.env.APPDATA && join(process.env.APPDATA, 'npm', 'node_modules', 'vercel', 'node_modules', 'esbuild')].filter(Boolean);
  const req = createRequire(import.meta.url);
  for (const d of tries) { try { if (existsSync(join(d, 'package.json'))) return req(d); } catch { /* next */ } }
  return null;
}

const walk = (dir, out = []) => { for (const n of readdirSync(dir)) { const p = join(dir, n); statSync(p).isDirectory() ? walk(p, out) : out.push(p); } return out; };
const gitSha = () => { try { return execFileSync('git', ['rev-parse', '--short=8', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim(); } catch { return 'nosha'; } };

/* the music files the demo can ask for: the 12 levels' own tracks (level + arena + mini), the extras above, the ambience beds */
export async function demoTracks(audioJsText) {
  const { LEVELS } = await import(pathToFileURL(join(ROOT, 'src', 'level.js')).href);
  const { DEMO_IDS } = await import(pathToFileURL(join(ROOT, 'src', 'demo-slots.js')).href);
  const want = new Set(EXTRA_TRACKS);
  const walkMusic = (o, d) => { if (!o || typeof o !== 'object' || d > 5) return; for (const k of Object.keys(o)) { const v = o[k]; if (k === 'music' && typeof v === 'string') want.add(v); else if (v && typeof v === 'object') walkMusic(v, d + 1); } };
  for (const lv of LEVELS) if (DEMO_IDS.has(lv.id)) { walkMusic(lv, 0); let L = null; try { L = lv.build ? lv.build() : null; } catch { /* the lv object alone */ } walkMusic(L, 0); }
  const table = new Map(); for (const m of audioJsText.matchAll(/([A-Za-z0-9_]+): '\.\/audio\/([^']+)'/g)) table.set(m[1], m[2]);
  const keepKeys = [...table.keys()].filter(k => want.has(k) || k.startsWith(KEEP_PREFIX));
  return { want: [...want], table, keepKeys, keepFiles: new Set(keepKeys.map(k => table.get(k))), synthOnly: [...want].filter(k => !table.has(k)) };
}

/* a minimal ZIP writer (stored for audio, deflate for text); forward-slash names, UTF-8 flag, no data descriptors */
export function writeZip(zipPath, entries) {
  const chunks = [], central = []; let off = 0; const d = new Date(), dosT = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1), dosD = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  for (const { name, data } of entries) {
    const nm = Buffer.from(name, 'utf8'), crc = zlib.crc32(data) >>> 0, packed = /\.(ogg|mp3|png|ico|zip)$/i.test(name) ? null : zlib.deflateRawSync(data, { level: 9 });
    const method = packed && packed.length < data.length ? 8 : 0, body = method ? packed : data;
    const lh = Buffer.alloc(30); lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0x0800, 6); lh.writeUInt16LE(method, 8); lh.writeUInt16LE(dosT, 10); lh.writeUInt16LE(dosD, 12);
    lh.writeUInt32LE(crc, 14); lh.writeUInt32LE(body.length, 18); lh.writeUInt32LE(data.length, 22); lh.writeUInt16LE(nm.length, 26); lh.writeUInt16LE(0, 28);
    chunks.push(lh, nm, body);
    const ch = Buffer.alloc(46); ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(0x0800, 8); ch.writeUInt16LE(method, 10); ch.writeUInt16LE(dosT, 12); ch.writeUInt16LE(dosD, 14);
    ch.writeUInt32LE(crc, 16); ch.writeUInt32LE(body.length, 20); ch.writeUInt32LE(data.length, 24); ch.writeUInt16LE(nm.length, 28); ch.writeUInt32LE(off, 42);
    central.push(ch, nm); off += 30 + nm.length + body.length;
  }
  const cd = Buffer.concat(central), end = Buffer.alloc(22); end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10); end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(off, 16);
  writeFileSync(zipPath, Buffer.concat([...chunks, cd, end]));
}

export async function buildItch({ out = join(ROOT, 'dist-itch'), zip = true, log = console.log } = {}) {
  const esbuild = findEsbuild(); if (!esbuild) throw new Error('esbuild not found (node_modules/esbuild, $ESBUILD_DIR, or the global vercel package)');
  const sha = gitSha(), site = join(out, 'site');
  rmSync(out, { recursive: true, force: true }); mkdirSync(site, { recursive: true });
  const audioJs = readFileSync(join(ROOT, 'src', 'audio.js'), 'utf8');
  const T = await demoTracks(audioJs);
  const dropped = new Set();
  /* ---- the bundle: three small source rewrites, in memory only ---- */
  const plugin = {
    name: 'thornroad-demo', setup(b) {
      b.onResolve({ filter: /^\/src\// }, a => ({ path: a.path, external: true }));   /* the dev-lab pages import('/src/pogolab.js') by absolute URL: left as a runtime import, never reached in play */
      b.onLoad({ filter: /src[\\/]demo-flag\.js$/ }, a => { const t = readFileSync(a.path, 'utf8'); if (!/export const DEMO_BUILD = false;/.test(t)) throw new Error('demo-flag.js: DEMO_BUILD line moved'); return { contents: t.replace('export const DEMO_BUILD = false;', 'export const DEMO_BUILD = true;'), loader: 'js' }; });
      b.onLoad({ filter: /src[\\/]audio\.js$/ }, a => { let n = 0; const t = readFileSync(a.path, 'utf8').replace(/([A-Za-z0-9_]+): '\.\/audio\/([^']+)',?/g, (m, k, f) => { if (T.keepFiles.has(f)) return m; dropped.add(f); n++; return ''; }); if (n < 100) throw new Error('audio.js: the TRACKS table moved (cut ' + n + ')'); return { contents: t, loader: 'js' }; });
      b.onLoad({ filter: /src[\\/]loading-screen\.js$/ }, a => { const t = readFileSync(a.path, 'utf8'); if (!t.includes('let want = 190;')) throw new Error('loading-screen.js: the module-count line moved'); return { contents: t.replace('let want = 190;', 'let want = 5;'), loader: 'js' }; });   /* the bar counts scripts: a bundle has 5, not 190 */
    },
  };
  const res = await esbuild.build({ entryPoints: ['main', 'loading-screen', 'online-guest'].map(n => join(ROOT, 'src', n + '.js')), outdir: site, bundle: true, splitting: true, format: 'esm', target: 'es2022', minify: true, legalComments: 'none',
    entryNames: '[name]', chunkNames: 'c-[hash]', plugins: [plugin], logLevel: 'error', metafile: true, charset: 'utf8' });
  /* ---- index.html ---- */
  let html = readFileSync(join(ROOT, 'index.html'), 'utf8');
  const cut = (re, what) => { if (!re.test(html)) throw new Error('index.html: ' + what + ' not found'); html = html.replace(re, ''); };
  cut(/<!-- modulepreload:begin[\s\S]*?<!-- modulepreload:end -->\r?\n?/, 'the modulepreload block');
  cut(/<link rel="manifest"[^>]*>\r?\n?/, 'the manifest link');
  cut(/<script>\s*\/\/ INSTALLABLE:[\s\S]*?<\/script>\r?\n?/, 'the service-worker script');
  html = html.replace('src="./src/loading-screen.js"', 'src="./loading-screen.js"').replace("import('./src/online-guest.js')", "import('./online-guest.js')").replace("import('./src/main.js')", "import('./main.js')");
  if (/\.\/src\//.test(html.replace(/<!--[\s\S]*?-->/g, ''))) throw new Error('index.html still points into src/');
  html = html.replace('<title>THORNROAD</title>', '<title>THORNROAD (demo)</title>\n<meta name="thornroad-build" content="demo ' + sha + '">');
  /* (claude/onboard1) MODULEPRELOAD for the bundle: main.js and the chunks it imports statically are fetched IN PARALLEL from the first byte of the page, not as a second wave after the 8 MB main.js has arrived and been scanned. Only the static closure (online-guest.js and on-demand chunks stay out). */
  { const seen = new Set(), walk = f => { if (seen.has(f) || !existsSync(join(site, f))) return; seen.add(f); const src = readFileSync(join(site, f), 'utf8'); for (const m of src.matchAll(/(?:^|[;}\s])(?:import|export)\s*(?:[^'"`;()]*?from\s*)?["']\.\/([^"']+)["']/g)) walk(m[1]); };
    walk('loading-screen.js'); walk('main.js');
    const links = [...seen].filter(f => f !== 'loading-screen.js').sort().map(f => '<link rel="modulepreload" href="./' + f + '">').join('\n');
    const tag = '<script type="module" src="./loading-screen.js"></script>'; if (!html.includes(tag)) throw new Error('index.html: the loading-screen script tag not found'); html = html.replace(tag, links + '\n' + tag); }
  writeFileSync(join(site, 'index.html'), html);
  /* ---- static files ---- */
  const put = (rel, from = rel) => { mkdirSync(dirname(join(site, rel)), { recursive: true }); copyFileSync(join(ROOT, from), join(site, rel)); };
  for (const f of ['favicon.ico', 'icons/favicon-32.png', 'icons/icon-192.png', 'icons/apple-touch-icon-180.png', 'fonts/PressStart2P-Regular.ttf', 'fonts/Silkscreen-Regular.ttf', 'fonts/OFL-PressStart2P.txt', 'fonts/OFL-Silkscreen.txt', 'audio/manifest.json', 'audio/CREDITS.txt']) put(f);
  const man = JSON.parse(readFileSync(join(ROOT, 'audio', 'manifest.json'), 'utf8')); let sfx = 0; for (const u of Object.values(man).flat()) { put(u.replace(/^\.\//, '')); sfx++; }
  for (const f of T.keepFiles) put('audio/' + f);
  mkdirSync(join(site, 'docs'), { recursive: true });
  const top = JSON.parse(readFileSync(join(ROOT, 'docs', 'updates.json'), 'utf8'))[0] || { batch: 1 };
  writeFileSync(join(site, 'docs', 'updates.json'), JSON.stringify([{ date: new Date().toISOString().slice(0, 10), batch: top.batch, lines: ['THIS IS THE FREE DEMO: THE ROAD UP TO KING GORM', 'FIVE HEROES TO PLAY, TWELVE WOODS, SIX BOSSES', 'THE FULL GAME HAS MORE HEROES, WOODS AND BOSSES', 'KEEP YOUR PROGRESS AT THE END OF THE DEMO'] }]));
  /* ---- checks on what is about to ship ---- */
  const files = walk(site).map(p => posix(relative(site, p)));
  if (!files.includes('index.html')) throw new Error('no index.html at the root');
  const hits = adblockHits(files); if (hits.length) throw new Error('ad-block word in shipped paths: ' + hits.slice(0, 8).join(', '));
  const js = files.filter(f => f.endsWith('.js')).map(f => readFileSync(join(site, f), 'utf8')).join('\n');
  const asked = new Set([...js.matchAll(/\.\/audio\/([A-Za-z0-9_.\/-]+\.(?:ogg|mp3))/g)].map(m => m[1])); const missing = [...asked].filter(f => !existsSync(join(site, 'audio', f)));
  if (missing.length) throw new Error('the bundle names audio files that are not shipped: ' + missing.slice(0, 8).join(', '));
  const sizes = files.map(f => statSync(join(site, f)).size), bytes = sizes.reduce((a, b) => a + b, 0);
  const report = { sha, files: files.length, bytes, mb: +(bytes / 1048576).toFixed(1), jsFiles: files.filter(f => f.endsWith('.js')).length, sfxClips: sfx, musicShipped: T.keepKeys.length, musicFiles: [...T.keepFiles].sort(), musicLeftOut: dropped.size, musicSynthOnly: T.synthOnly, extra: EXTRA_TRACKS };
  if (zip) {
    const order = ['index.html', ...files.filter(f => f !== 'index.html')];
    const zipPath = join(out, 'thornroad-demo-' + sha + '.zip'); writeZip(zipPath, order.map(name => ({ name, data: readFileSync(join(site, name)) })));
    report.zip = posix(relative(ROOT, zipPath)); report.zipMb = +(statSync(zipPath).size / 1048576).toFixed(1);
  }
  writeFileSync(join(out, 'build-report.json'), JSON.stringify(report, null, 1));
  log('itch build ' + sha + ': ' + report.files + ' files, ' + report.mb + ' MB' + (report.zip ? ', zip ' + report.zipMb + ' MB (' + report.zip + ')' : '') + '; ' + report.jsFiles + ' js, ' + report.sfxClips + ' sfx clips, ' + report.musicShipped + ' music tracks kept, ' + report.musicLeftOut + ' left out');
  return { report, site, files };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const a = process.argv.slice(2), at = k => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : null; };
  buildItch({ out: at('--out') ? resolve(at('--out')) : join(ROOT, 'dist-itch'), zip: !a.includes('--no-zip'), log: a.includes('--quiet') ? () => {} : console.log }).catch(e => { console.error('build-itch: ' + e.message); process.exit(1); });
}
