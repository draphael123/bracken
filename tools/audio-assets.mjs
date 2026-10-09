// tools/audio-assets.mjs — THE AUDIO CHECK (a gate, not a report): does every level and boss really have music
// assigned, does every audio file the source points at exist on disk, and does every SFX.name() the source calls
// exist on the table it is calling. Static, no browser, seconds not minutes - the sound test's own credits and
// locks are proved separately in tools/soundtest.mjs, and the fuller EVENT x SOUND coverage (plus a real decode of
// every music file) is tools/audit-audio.mjs, a report tool run by hand, not part of this gate.
//   node tools/audio-assets.mjs             the three static passes
//   node tools/audio-assets.mjs --decode    also opens the page and decodes every file TRACKS points at (cheap: a
//                                            fetch + decodeAudioData per file, no game simulation) - not run by
//                                            npm run check by default, since the suite is already long; ask Daniel
//                                            before wiring it into the gate (see the lane report)
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const rd = f => readFileSync(join(ROOT, f), 'utf8').replace(/\r\n/g, '\n');
const DECODE = process.argv.includes('--decode');

const audioSrc = rd('src/audio.js');
const TRACKS = Object.fromEntries([...(audioSrc.match(/const TRACKS = \{([\s\S]*?)\};/) || [, ''])[1].matchAll(/(\w+): '([^']+)'/g)].map(m => [m[1], m[2]]));
const { MUSIC_NAMES, MUSIC_CREDITS, SFX_NAMES } = await import('../src/audio.js');
const SFX_TABLE = new Set(SFX_NAMES());

const problems = [];

// ---------- 1. every audio file the source points at exists on disk ----------
for (const [name, path] of Object.entries(TRACKS)) {
  const rel = path.replace(/^\.\//, '');
  if (!existsSync(join(ROOT, rel))) problems.push('TRACKS.' + name + " -> '" + path + "' does not exist on disk");
}
const manifest = JSON.parse(rd('audio/manifest.json'));
let manifestFiles = 0;
for (const [name, files] of Object.entries(manifest)) for (const f of files) { manifestFiles++; if (!existsSync(join(ROOT, f))) problems.push('manifest.json[' + name + "] -> '" + f + "' does not exist on disk"); }
// every song in the Sound Test's own list either plays a real file or is one of the synth-only tracks with
// no file at all (the synth boss/theatre/fair tracks named below); anything else claiming to be
// a song and NOT in TRACKS would show in the Sound Test and then fail silently on Z.
const NO_FILE_BY_DESIGN = new Set(['archmage', 'goblinroyal', 'drownedking', 'winchmaster', 'gargoyle', 'lanterneater', 'banditking', 'cisternqueen', 'gorgecrab', 'djinn', 'colossus', 'hawkmistress', 'hourglassking']);   /* (claude/buriedcity music pass: 'buriedcity' is a file now, "Loopable Dungeon Ambience" by JaggedStone) */   /* (claude/buriedcity: THE BURIED CITY's greybox bed and THE HOURGLASS KING's theme are composed in code until Daniel picks a track) */   /* (claude/ksar: THE BANDIT KSAR's greybox bed and THE HAWK-MISTRESS's theme are composed in code until Daniel picks a track) */   /* ('glasssea' is a file now: "Eastern Arctic Dubstep", claude/glasssea art pass) */   /* (claude/glasssea: THE GLASS COLOSSUS's theme and THE GLASS SEA's greybox bed are composed in code, src/boss-music.js) */   /* ('matriarch' is a file now: "Volatile Reaction", claude/redgorge2) */   /* ('puppeteer' is a file now: "Dissonant Waltz", claude/puppeteer2; 'theatre' is a file now: "Apparitions Ball", claude/theatre3) */   /* the boss themes in src/boss-music.js; 'puppeteer' is his music box, synthesised in src/audio.js (THE PUPPETEER, in the theatre now); the fair's 'harvestfair' and 'wickerqueen' (claude/fairfix3) and 'deep', 'underleaf', 'mineworks' (claude/musicswap) are files now */
for (const n of MUSIC_NAMES) if (!TRACKS[n] && !NO_FILE_BY_DESIGN.has(n)) problems.push("MUSIC_NAMES has '" + n + "' but TRACKS has no file for it (add one, or list it in NO_FILE_BY_DESIGN if that is meant)");

// ---------- 2. every level and boss has a music track assigned ----------
const { LEVELS } = await import('../src/level.js');
const trackOk = n => !!n && (TRACKS[n] !== undefined || NO_FILE_BY_DESIGN.has(n) || (String(n).includes(':') && NO_FILE_BY_DESIGN.has(String(n).split(':')[0])));   /* 'archmage:undead' is the Archmages' theme, the undead voicing */
let levelsChecked = 0, bossesChecked = 0, minisChecked = 0;
for (const lv of LEVELS) {
  if (lv.hidden && !lv.secret) continue;
  const L = lv.build(); levelsChecked++;
  if (!trackOk(L.music)) problems.push('level ' + lv.id + ' has no playable music assigned (L.music=' + JSON.stringify(L.music) + ')');
  if (L.arena) { bossesChecked++; const m = L.arena.music || 'boss'; if (!trackOk(m)) problems.push("level " + lv.id + "'s boss arena has no playable music (" + JSON.stringify(m) + ')'); }
  if (L.mini) { minisChecked++; const m = L.mini.music || 'minicharge'; if (!trackOk(m)) problems.push("level " + lv.id + "'s mini fight has no playable music (" + JSON.stringify(m) + ')'); }
}

// ---------- 3. every SFX id the source calls exists in the SFX table ----------
const srcFiles = [];
const walk = d => { for (const f of readdirSync(join(ROOT, d))) { const p = join(d, f); if (statSync(join(ROOT, p)).isDirectory()) walk(p); else if (/\.(m?js)$/.test(f)) srcFiles.push(p); } };
walk('src');
const used = new Map(); // name -> Set(files)
const guarded = new Set(); // SFX.foo ? SFX.foo() : ... - deliberately tolerant of a missing entry, not a bug
for (const f of srcFiles) {
  const text = rd(f);
  for (const m of text.matchAll(/\bSFX\.([A-Za-z0-9_]+)/g)) { if (!used.has(m[1])) used.set(m[1], new Set()); used.get(m[1]).add(f); }
  for (const m of text.matchAll(/SFX\.(\w+)\s*\?\s*SFX\.\1\(\)/g)) guarded.add(m[1]);
  for (const m of text.matchAll(/\(SFX\.(\w+)\s*\|\|\s*SFX\.\w+\)\(\)/g)) guarded.add(m[1]);
}
for (const [name, files] of used) if (!SFX_TABLE.has(name) && !guarded.has(name)) problems.push("SFX." + name + "(...) is called from " + [...files].join(', ') + " but 'SFX' has no such entry (and it is not called through a SFX.x ? SFX.x() : ... guard, so nothing covers its absence)");
// and the reverse, so a name nothing calls is at least visible (not a failure - the sound test itself may be its only caller)
const unreferenced = [...SFX_TABLE].filter(n => !used.has(n));

// ---------- 4. (optional, --decode) every TRACKS file actually decodes, in the page ----------
let decodeResult = null;
if (DECODE) {
  const { openPage } = await import('./cdp.mjs');
  const pg = await openPage({ audio: false, fonts: false });
  try {
    const files = [...new Set(Object.values(TRACKS))];
    const r = await pg.evalp(`(async()=>{const files=${JSON.stringify(files)};const ac=new (window.AudioContext||window.webkitAudioContext)();const bad=[];
      for(const f of files){try{const ab=await fetch(f).then(r=>r.ok?r.arrayBuffer():Promise.reject(new Error('http '+r.status)));const buf=await ac.decodeAudioData(ab);if(!(buf.duration>0))bad.push([f,'zero duration']);}catch(e){bad.push([f,String(e&&e.message||e)]);}}
      return {count:files.length,bad};})()`, 120000);
    decodeResult = r;
    for (const [f, why] of r.bad) problems.push('decode: ' + f + ' - ' + why);
    assertNoErrors(pg);
  } finally { pg.close(); }
}
function assertNoErrors(pg) { if (pg.errors.length) problems.push('page threw: ' + pg.errors.join(' | ')); }

// ---------- report ----------
console.log(JSON.stringify({ levelsChecked, bossesChecked, minisChecked, tracksOnDisk: Object.keys(TRACKS).length, manifestFiles, musicNames: MUSIC_NAMES.length, creditsFor: Object.keys(MUSIC_CREDITS).length, sfxTableSize: SFX_TABLE.size, sfxCallsFound: used.size, unreferencedSfx: unreferenced.length, decode: decodeResult ? { checked: decodeResult.count, bad: decodeResult.bad.length } : 'skipped (pass --decode to run it)' }));
if (problems.length) { console.log('\n' + problems.length + ' problem(s):'); for (const p of problems) console.log('- ' + p); process.exitCode = 1; }
else console.log('ok  audio-assets  ' + levelsChecked + ' levels all have music, ' + bossesChecked + ' boss arenas and ' + minisChecked + ' minis all resolve to a real track, every TRACKS/manifest file exists on disk, and every SFX.*() the source calls is in the table' + (DECODE ? ' (decode: ' + decodeResult.count + ' files, all clean)' : ' (decode not run: pass --decode)'));
