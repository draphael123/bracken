// tools/audit-audio-report.mjs — THE EVENT x SOUND TABLE and the ranked audio findings, from what tools/audit-audio.mjs logged in the page.
// It reads the JSON and writes markdown; it runs nothing. A sound "belongs" to an event when it was called on the same game frame (or the one
// after) inside the same scripted pass. Ambience, music state, footsteps and the pyromancer's jet idle are never counted as an event's sound.
//   node tools/audit-audio-report.mjs <dir with audio-audit.json> <outdir>   -> <outdir>/audio-tables.md, <outdir>/audio-findings.json
// Thresholds, and why:
//   cut off      the same voice called again < 0.03 s of game time later in the same pass (the brief's 30 ms; game time, because the
//                audio clock does not move while the harness simulates a batch of frames)
//   loud/quiet   a voice's rendered RMS more than 9 dB off the median of all voices (about 3x in amplitude)
//   shared       two creatures that live in the same level whose hurt (or death) voices render to the same peak, RMS and length
//   loop seam    a track whose last 30 ms are silent while its first 30 ms are not, or whose tail silence is over 300 ms, or whose end
//                and start samples jump by more than 0.05 (a click)
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const [dir, outDir = '.'] = process.argv.slice(2); mkdirSync(outDir, { recursive: true });
const R = JSON.parse(readFileSync(join(dir, 'audio-audit.json'), 'utf8'));
const S = R.static, P = R.passes, md = [], F = [];
const IGN = /^(music\.|ambient\.|jet$|pStep$|step$|foeStep$|cricket$|bird$|drip$|wind$|pLand$|land$|foeRelease$|foeMutter$|ui$|coinUp$)/;
const table = (head, rows) => { md.push('| ' + head.join(' | ') + ' |', '|' + head.map(() => '---').join('|') + '|'); for (const r of rows) md.push('| ' + r.map(v => v === null || v === undefined ? '-' : String(v).replace(/\|/g, '/')).join(' | ') + ' |'); md.push(''); };
const med = a => { const s = a.slice().sort((p, q) => p - q); return s.length ? s[s.length >> 1] : null; };
/* the log, by pass tag and frame */
const index = pass => { const m = new Map(); for (const x of (pass.log || [])) { const k = x.tag + '|' + x.f; (m.get(k) || m.set(k, []).get(k)).push(x.n); } return m; };
const soundsAt = (idx, tag, f, w = 1) => { const out = []; for (let d = 0; d <= w; d++) for (const n of (idx.get(tag + '|' + (f + d)) || [])) if (!IGN.test(n)) out.push(n); return out; };

/* ---------- CREATURES: every foe spawned beside the knight, fought, stood in front of and taken from ---------- */
const creatureRows = [];
const scan = (pass, isBoss) => { if (!pass) return; const idx = index(pass);
  for (const row of pass.rows || []) { const who = isBoss ? row.boss : row.t; if (!who) continue;
    const tagOk = isBoss ? (t => t === (isBoss === 'mini' ? 'mini:' : 'boss:') + row.lvl) : (t => t.startsWith('foe:' + who + ':'));
    const ev = (pass.ev || []).filter(e => e.who === who && tagOk(e.tag));
    const tally = (list, pick) => { let voiced = 0; const voices = {}; for (const e of list) { const s = pick(e); if (s.length) voiced++; for (const n of s) voices[n] = (voices[n] || 0) + 1; } return { n: list.length, voiced, voices: Object.entries(voices).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k]) => k) }; };
    const tellEv = ev.filter(e => e.kind === 'mode' && /Tell$/.test(e.to));
    const blowEv = ev.filter(e => e.kind === 'mode' && /Tell$/.test(e.from) && !/Tell$/.test(e.to));
    const unmarked = tellEv.filter(e => !e.tell).map(e => e.to);
    const r = { who, lvl: row.lvl, boss: !!isBoss,
      tell: tally(tellEv, e => soundsAt(idx, e.tag, e.f)), blow: tally(blowEv, e => soundsAt(idx, e.tag, e.f)),
      hurt: tally(ev.filter(e => e.kind === 'hurt'), e => soundsAt(idx, e.tag, e.f, 0)), die: tally(ev.filter(e => e.kind === 'die'), e => soundsAt(idx, e.tag, e.f, 1)),
      phase: tally(ev.filter(e => e.kind === 'phase' || e.kind === 'stage'), e => soundsAt(idx, e.tag, e.f, 1)),
      spawn: (ev.find(e => e.kind === 'spawn' && e.sounds) || {}).sounds, unmarked: [...new Set(unmarked)], killed: isBoss ? row.killed : (row.reps || []).some(q => q.killed) };
    creatureRows.push(r);
    const nm = (isBoss ? (isBoss === 'mini' ? 'mini ' : 'boss ') : '') + who;
    if (r.tell.n && r.tell.voiced < r.tell.n) F.push({ sev: (isBoss ? 8 : 5) * (1 - r.tell.voiced / r.tell.n) + 1, kind: 'bug', text: `${nm} (${row.lvl}): ${r.tell.n - r.tell.voiced} of ${r.tell.n} windups played no sound on the frame they began (${[...new Set(tellEv.filter(e => !soundsAt(idx, e.tag, e.f).length).map(e => e.to))].join(', ')})` });
    if (r.unmarked.length) F.push({ sev: isBoss ? 7 : 4, kind: 'bug', text: `${nm}: entered ${r.unmarked.join(', ')} with windingUp() false - no mark and no tell sound on those windups (rule A2)` });
    if (r.hurt.n && !r.hurt.voiced) F.push({ sev: isBoss ? 6 : 4, kind: 'bug', text: `${nm}: hurt ${r.hurt.n} times with no sound on the frame of the blow` });
    if (r.die.n && !r.die.voiced) F.push({ sev: isBoss ? 7 : 4, kind: 'bug', text: `${nm}: died with no sound` });
    if (isBoss && r.phase.n && !r.phase.voiced) F.push({ sev: 5, kind: 'design', text: `${nm}: ${r.phase.n} phase/stage changes with no sound` });
  } };
scan(P.foes, false); scan(P.bosses, 'boss'); scan(P.minis, 'mini');
const cnt = { events: 0, silent: 0 };
for (const r of creatureRows) for (const k of ['tell', 'blow', 'hurt', 'die']) { cnt.events += r[k].n; cnt.silent += r[k].n - r[k].voiced; }
md.push('# Audio tables', '', '## Creatures: event x sound', '', 'Each cell: events heard / events seen, then the voices that fired on those frames. "windup" = entering a ...Tell mode; "blow" = the mode a tell hands to; "unmarked" = a Tell mode entered while windingUp() was false.', '');
const cell = t => t.n ? t.voiced + '/' + t.n + (t.voices.length ? ' ' + t.voices.join(', ') : '') : '-';
table(['creature', 'level', 'windup', 'blow', 'hurt', 'death', 'phase', 'spawn', 'unmarked Tell modes'], creatureRows.map(r => [(r.boss ? '**' + r.who + '**' : r.who), r.lvl, cell(r.tell), cell(r.blow), cell(r.hurt), cell(r.die), cell(r.phase), (r.spawn || []).filter(n => !IGN.test(n)).join(', ') || '-', r.unmarked.join(', ')]));

/* ---------- WINDUPS OUTSIDE windingUp(), from the source ---------- */
md.push('## Windups outside windingUp() (static: a mode that lands nothing, whose forced chain lands a blow within three hops)', '');
table(['function', 'mode', 'leads to', 'main.js line', 'named in windingUp'], (S.staticWindups || []).filter(w => !w.named).map(w => [w.fn, w.mode, w.blow, w.line, 'no']));

/* ---------- HEROES ---------- */
if (P.heroes) { const idx = index(P.heroes); const rows = [];
  const acts = (P.heroes.acts || []).filter(a => a.tag && a.tag.startsWith('hero:'));
  for (let i = 0; i < acts.length; i++) { const a = acts[i], next = acts.slice(i + 1).find(b => b.tag === a.tag); const f1 = next ? next.f : a.f + 120; const names = [];
    for (let f = a.f; f < f1; f++) names.push(...soundsAt(idx, a.tag, f, 0));
    const voices = [...new Set(names)]; rows.push([a.tag.replace('hero:', ''), a.what, voices.join(', ') || 'NONE']);
    if (!voices.length && !/^walk|block raised|skill [FG]: none/.test(a.what)) F.push({ sev: 5, kind: 'bug', text: `hero ${a.tag.replace('hero:', '')}: "${a.what}" played no sound` }); }
  const evs = (P.heroes.ev || []).filter(e => e.who === 'hero'); const byKind = {};
  for (const e of evs) { const k = e.tag.split(':')[1] + ' ' + e.kind.replace('hero:', ''); const s = soundsAt(idx, e.tag, e.f, 1); const b = byKind[k] || (byKind[k] = { n: 0, voiced: 0, v: {} }); b.n++; if (s.length) b.voiced++; for (const n of s) b.v[n] = (b.v[n] || 0) + 1; }
  md.push('## Heroes: each scripted action and the voices in its window', ''); table(['hero', 'action', 'voices'], rows);
  md.push('### Hero events (every one seen in the hero pass)', ''); table(['hero event', 'heard / seen', 'voices'], Object.entries(byKind).map(([k, b]) => [k, b.voiced + '/' + b.n, Object.keys(b.v).join(', ')]));
  for (const [k, b] of Object.entries(byKind)) if (b.n >= 2 && !b.voiced && !/land|jump/.test(k)) F.push({ sev: 3, kind: 'bug', text: `hero event ${k}: ${b.n} seen, none heard` });
  /* every hero's swing voice */
  const swing = {}; for (const [k, b] of Object.entries(byKind)) if (/ swing$/.test(k)) swing[k.split(' ')[0]] = Object.keys(b.v).sort().join('/');
  md.push('Swing voices per hero: ' + Object.entries(swing).map(([h, v]) => h + ' = ' + v).join('; '), '');
}

/* ---------- PICKUPS, PROPS, MENUS, LEVELS ---------- */
for (const [name, pass, label] of [['Pickups', P.pickups, 'name'], ['Props', P.props, 't'], ['Menus', P.ui, 'name']]) { if (!pass) continue;
  md.push('## ' + name, ''); table([label, 'level / state', 'voices'], pass.rows.map(r => [r[label], r.lvl || r.state || '-', r.error ? 'ERROR ' + r.error : ([...new Set((r.sounds || []).filter(n => !IGN.test(n) || n === 'ui' || n === 'coinUp'))].join(', ') || 'NONE')]));
  for (const r of pass.rows) if (!r.error && !(r.sounds || []).some(n => !/^(music\.|ambient\.|pStep$|step$|jet$)/.test(n))) F.push({ sev: name === 'Props' ? 2 : 4, kind: name === 'Props' ? 'design' : 'bug', text: `${name.toLowerCase().slice(0, -1)} ${r[label]}${r.lvl ? ' (' + r.lvl + ')' : ''}: nothing heard` }); }
if (P.levels) { md.push('## Levels: what plays on the way in and at each ambush', '');
  table(['level', 'music', 'on load', 'ambushes: voices'], P.levels.rows.map(r => [r.lvl, r.music, r.onLoad.join(', '), r.ambushes.map(a => (a.sounds.filter(n => !IGN.test(n)).join(', ') || 'NONE') + ' (' + a.spawned + ' spawned)').join(' / ') || '-']));
  for (const r of P.levels.rows) for (const a of r.ambushes) if (!a.sounds.some(n => /gate|horn|drum|bell|clang|thud/.test(n))) F.push({ sev: 3, kind: 'design', text: `${r.lvl}: an ambush at column ${a.x} shut with no gate or horn sound` }); }

/* ---------- MUSIC ---------- */
md.push('## Music: every level and fight, and every file', '');
table(['level', 'level track', 'boss', 'boss track', 'mini', 'mini track'], S.levelInfo.map(l => [l.id, l.music, l.boss, l.bossMusic || (l.boss ? 'NONE (keeps the level track)' : '-'), l.mini, l.miniMusic || (l.mini ? 'NONE' : '-')]));
for (const l of S.levelInfo) { if (l.boss && !l.bossMusic) F.push({ sev: 4, kind: 'design', text: `${l.id}: the boss (${l.boss}) has no track of its own` }); }
const noMini = S.levelInfo.filter(l => l.mini && !l.miniMusic); if (noMini.length) F.push({ sev: 3, kind: 'design', text: `${noMini.length} of ${S.levelInfo.filter(l => l.mini).length} minis have no track of their own (${noMini.map(l => l.mini).join(', ')})` });
if (P.music) { const rows = [];
  for (const m of P.music.rows) { const seam = m.endRms !== undefined && m.endRms < 0.002 && m.startRms > 0.01; rows.push([m.name, m.error || m.secs, m.headMs, m.tailMs, m.seamJump, m.startRms, m.endRms, m.peak, (m.tailMs > 300 || seam || m.seamJump > 0.05) ? 'NOT CLEAN' : 'ok']);
    const used = S.levelInfo.some(l => [l.music, l.bossMusic, l.miniMusic].includes(m.name));
    if (used && (m.tailMs > 300 || seam || m.seamJump > 0.05)) F.push({ sev: 3 + Math.min(4, m.tailMs / 600), kind: 'bug', text: `track ${m.name} (used by ${S.levelInfo.filter(l => [l.music, l.bossMusic, l.miniMusic].includes(m.name)).map(l => l.id).join(', ')}): ${m.tailMs} ms of silence at its end, ${m.headMs} ms at its head, seam jump ${m.seamJump}: a gap or a click every loop` }); }
  md.push('### Music files, decoded', ''); table(['track', 'secs', 'head silence ms', 'tail silence ms', 'seam jump', 'start RMS', 'end RMS', 'peak', 'loop'], rows); }
/* ducking under a boss's tells */
if (P.bosses) { const log = P.bosses.log || []; const duckOn = log.filter(x => x.n === 'music.duck' && x.a[0] === true).length, duckOff = log.filter(x => x.n === 'music.duck').length, muffle = log.filter(x => x.n === 'music.muffle').length;
  const tells = (P.bosses.ev || []).filter(e => e.kind === 'mode' && /Tell$/.test(e.to) && e.big).length;
  md.push(`Ducking in the boss pass: ${tells} boss windups; music.duck(true) called ${duckOn} times (${duckOff} duck changes in all), music.muffle changed ${muffle} times.`, '');
  if (tells && duckOn === 0) F.push({ sev: 6, kind: 'design', text: `no ducking under tells: ${tells} boss windups in the boss pass and the music was never ducked for one` }); }

/* ---------- CUT OFF: the same voice again within 30 ms ---------- */
{ const cut = {};
  for (const [pname, pass] of Object.entries(P)) { const log = (pass.log || []).filter(x => !IGN.test(x.n)); const last = new Map();
    for (const x of log) { const k = x.tag + '|' + x.n, prev = last.get(k); if (prev !== undefined && x.t - prev < 0.03 && x.t >= prev) cut[x.n] = (cut[x.n] || 0) + 1; last.set(k, x.t); } }
  const rows = Object.entries(cut).sort((a, b) => b[1] - a[1]);
  md.push('## Voices called again within 30 ms of themselves (the second call cuts or doubles the first)', ''); table(['voice', 'times'], rows.slice(0, 30));
  for (const [n, c] of rows.slice(0, 6)) if (c >= 5) F.push({ sev: 2 + Math.min(4, c / 40), kind: 'bug', text: `voice ${n} is re-triggered within 30 ms of itself ${c} times across the passes` }); }

/* ---------- LEVELS: voices rendered offline ---------- */
if (P.voices && P.voices.rows) { const rows = P.voices.rows.filter(v => v.rmsDb !== null && v.rmsDb > -119); const m = med(rows.map(v => v.rmsDb));
  md.push('## Voice levels (each voice rendered once through an OfflineAudioContext; dB full scale)', '', `Median RMS ${m} dB over ${rows.length} renders (${P.voices.rows.filter(v => v.error).length} errors, ${P.voices.rows.filter(v => v.rmsDb !== null && v.rmsDb <= -119).length} silent).`, '');
  const off = rows.filter(v => Math.abs(v.rmsDb - m) > 9).sort((a, b) => Math.abs(b.rmsDb - m) - Math.abs(a.rmsDb - m));
  table(['voice', 'hero', 'args', 'peak dB', 'RMS dB', 'vs median', 'ms'], off.slice(0, 40).map(v => [v.n, v.hero, JSON.stringify(v.args), v.peakDb, v.rmsDb, (v.rmsDb - m > 0 ? '+' : '') + (v.rmsDb - m).toFixed(1), v.ms]));
  for (const v of off.slice(0, 8)) F.push({ sev: 1 + Math.abs(v.rmsDb - m) / 6, kind: 'design', text: `voice ${v.n}${v.hero ? ' (' + v.hero + ')' : ''}${v.args.length ? ' ' + JSON.stringify(v.args) : ''}: RMS ${v.rmsDb} dB, ${(v.rmsDb - m).toFixed(1)} dB ${v.rmsDb > m ? 'louder' : 'quieter'} than the median voice` });
  const silent = P.voices.rows.filter(v => v.error || (v.rmsDb !== null && v.rmsDb <= -119)); if (silent.length) { md.push('Voices that rendered nothing or failed: ' + silent.map(v => v.n + (v.hero ? '/' + v.hero : '') + (v.error ? ' (' + v.error + ')' : '')).join(', '), ''); }
  /* SHARED: two creatures of one level whose hurt or death voice renders identically */
  const sig = n => { const v = P.voices.rows.find(q => q.n === n); return v && v.rmsDb !== null ? v.peakDb + '/' + v.rmsDb + '/' + v.ms : null; };
  const home = {}; for (const [t, lv] of Object.entries(S.homeOf || {})) (home[lv] = home[lv] || []).push(t);
  for (const l of S.levelInfo) { if (l.boss) (home[l.id] = home[l.id] || []).push(l.boss); if (l.mini) (home[l.id] = home[l.id] || []).push(l.mini); }
  const shared = [];
  for (const [lv, ts] of Object.entries(home)) for (const kind of ['hurtOf', 'dieOf']) { const g = {}; for (const t of new Set(ts)) { const s = sig(kind + ':' + t); if (s) (g[s] = g[s] || []).push(t); }
    for (const list of Object.values(g)) if (list.length > 1) shared.push([lv, kind === 'hurtOf' ? 'hurt' : 'death', list.join(', ')]); }
  md.push('## Shared hurt and death voices within a level (identical renders)', ''); table(['level', 'voice', 'creatures that sound the same'], shared);
  for (const s of shared) F.push({ sev: 2 + s[2].split(',').length / 2, kind: 'design', text: `${s[0]}: ${s[2]} share one ${s[1]} voice (identical renders)` });
  /* heroes whose blows share a voice */
  const pS = P.voices.rows.filter(v => v.n === 'pSlash'); if (pS.length) { const g = {}; for (const v of pS) (g[v.peakDb + '/' + v.rmsDb + '/' + v.ms] = g[v.peakDb + '/' + v.rmsDb + '/' + v.ms] || []).push(v.hero); for (const l of Object.values(g)) if (l.length > 1) F.push({ sev: 3, kind: 'design', text: `heroes ${l.join(', ')} swing with the same pSlash voice` }); }
}

F.sort((a, b) => b.sev - a.sev);
md.unshift(`Counts: ${cnt.events} creature events audited (windups, blows, hurts, deaths), ${cnt.silent} of them with no sound; ${F.filter(f => /share/.test(f.text)).length} shared-voice groups.`, '');
writeFileSync(join(outDir, 'audio-tables.md'), md.join('\n'));
writeFileSync(join(outDir, 'audio-findings.json'), JSON.stringify({ counts: cnt, findings: F }, null, 1));
console.log(`events ${cnt.events}, silent ${cnt.silent}, findings ${F.length}`);
for (const f of F.slice(0, 40)) console.log('  [' + f.kind + '] ' + f.text.slice(0, 250));
