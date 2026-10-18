// tools/build-voices-1018.mjs — (claude/audiovoices, 2026-10-18) THE RECIPE for the voice clips added this lane: every file
// is cut, levelled and encoded from the two packs below, the same way the other audio/sfx/vo files are (mono, 44.1 kHz,
// OGG Vorbis q4, mean about -16.5 dB, peak <= -1.5 dB, edge silence trimmed, a short fade out). node + ffmpeg only.
//   node tools/build-voices-1018.mjs <dir with the unzipped Dying Voices (mp3s)> <dir with the unzipped Little Robot 'Wav' folder>
// Packs (downloaded 2026-10-18, each into its own folder):
//   DV = "Dying Voices - Female - RPG" by Galacti-Chron (OpenGameArt; licence field CC-BY 3.0 and CC0; used under CC0, credited anyway)
//   LR = "Voices Sound Effects Library" by Little Robot Sound Factory (OpenGameArt; CC-BY 3.0: credit + www.littlerobotsoundfactory.com)
// Nothing here is pitched from a goblin clip. 'head' = only the first word / sound of a spoken death line (cut at its first pause).
import { spawnSync } from 'child_process';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)), OUT = join(ROOT, 'audio/sfx/vo');
const [DVd, LRd] = process.argv.slice(2);
if (!DVd || !LRd) { console.error('usage: node tools/build-voices-1018.mjs <DV dir> <LR Wav dir>'); process.exit(2); }
const dv = n => ['DV', 'DEATH -- ' + n + '.mp3'];
const lr = (d, n) => ['LR', d + '/' + d.replace(' ', '') + '_' + n + '.wav'];
const H = n => lr('Human', 'Good_' + n), EV = n => lr('Human', 'Evil_' + n), DB = n => lr('Human', 'DyingBreath_' + n), OR = n => lr('Orc', n), ZB = n => lr('Zombie', n), DM = n => lr('Demon', n), DI = n => lr('Dinosaur', n);
const SC = n => ['LR', 'Small Creature/SmallCreature' + n + '.wav'];
// kit -> act -> [ [source, opts] ... ]   opts: head, cap (max seconds), hp, lp, rate (pitch+speed)
const SET = {
  wd: {   /* THE WARDEN: a steady mid voice; effort from the pack's short grunts, hurt and death from the Dying Voices "medium" takes */
    effort: [H('01'), H('05'), H('15'), H('19'), H('26')].map(s => [s]),
    hurt: [[H('02')], [H('18')], [H('25')], [dv('Medium -- Ugh! Im Hit!'), { head: 1 }], [dv('Ugh ! you got me!'), { head: 1 }], [dv('Medium Ughh this hurts!'), { head: 1 }]],
    die: [[dv('Medium -- Ugh! Im Hit!')], [dv('Ugh ! you got me!'), { cap: 2.4 }], [dv('Medium Ughh this hurts!')], [dv('Normal tone ugh im dead, im dead im dead'), { cap: 2.4 }], [dv('nerf this death noises'), { cap: 2.4 }]] },
  rg: {   /* THE RANGER: the lighter, brighter voice - the pack's higher grunts, a touch of speed and the low end taken off, and the British takes of the Dying Voices */
    effort: [H('00'), H('11'), H('13'), H('22'), H('04')].map(s => [s, { hp: 160, rate: 1.03 }]),
    hurt: [[H('24'), { hp: 160, rate: 1.03 }], [H('16'), { hp: 160, rate: 1.03 }], [dv('British female Oh god'), { head: 1 }], [dv('misc female british noise'), { head: 1 }], [dv('Higher Tone -- Oh No!'), { head: 1 }]],
    die: [[dv('British female Oh god')], [dv('misc female british noise'), { cap: 2.4 }], [dv('british female panic oh god im dead'), { cap: 2.4 }], [dv('Higher Tone -- Oh No!')]] },
  gm: {   /* THE GEOMANCER: effort stays the women's kit pitched down (manifest alias); hurt and death are the low Dying Voices takes */
    hurt: [[dv('Low I cant continue'), { head: 1 }], [dv('low gurgle oh im going down'), { head: 1 }], [dv('Simple Low  no'), { head: 1 }], [dv('Low -- This is the end for me'), { head: 1 }]],
    die: [[dv('Low gurgle this is it'), { cap: 2.2 }], [dv('Low I cant continue')], [dv('low gurgle oh im going down'), { cap: 2.4 }], [dv('Simple Low  no')]] },
  f3: {   /* THE PYROMANCER's (cicifyre) kit gets the high Dying Voices deaths added to its two */
    die: [[dv('HIgh dying noise'), { cap: 2.2 }], [dv('High ugh ouch!')], [dv('Higher Im definately dead!')]], from: 2 },
  ob: {   /* THE BERSERKER: orc growls - the loudest throat in the game, and not the knight's man slowed down */
    effort: ['04', '06', '37', '38', '47', '36'].map(n => [OR(n)]),
    heavy: ['18', '25', '49', '44'].map(n => [OR(n)]),
    hurt: ['05', '26', '27', '28', '33', '40', '42'].map(n => [OR(n)]),
    die: ['07', '21', '39', '35'].map(n => [OR(n), { cap: 2.6 }]) },
  dk: {   /* THE DEATH KNIGHT: the pack's evil voices, the deep ones; death is the dying breath */
    effort: ['09', '05', '06', '03', '04'].map(n => [EV(n)]),
    hurt: ['12', '13', '08'].map(n => [EV(n)]),
    die: [...['00', '01', '02', '03'].map(n => [DB(n), { cap: 2.6 }]), [EV('07')]] },
  ev: {   /* foe villains: priests, mystics, snuffers */
    hurt: ['01', '02', '10'].map(n => [EV(n)]), die: ['00', '11', '14'].map(n => [EV(n)]) },
  zb: {   /* foe undead: the pack's zombies */
    hurt: ['17', '18', '19', '21', '22', '26', '28', '31'].map(n => [ZB(n)]),
    die: ['01', '07', '09', '11', '05'].map(n => [ZB(n), { cap: 2.6 }]), alert: ['12', '14', '34'].map(n => [ZB(n)]) },
  dm: {   /* foe demons and djinn */
    hurt: ['07', '08', '09', '10', '11', '12', '13', '14'].map(n => [DM(n)]),
    die: ['00', '01', '03', '05', '06'].map(n => [DM(n)]), alert: ['15', '17', '19'].map(n => [DM(n)]) },
  di: {   /* foe big beasts and raptors */
    hurt: ['04', '06', '07', '09', '10', '13', '17', '22'].map(n => [DI(n)]),
    die: ['01', '14', '21', '23', '20'].map(n => [DI(n)]), alert: ['00', '03', '15'].map(n => [DI(n)]) },
  sc: {   /* foe scorpions, scarabs, chitterers, little things */
    hurt: ['2_01', '2_02', '2_04', '2_06', '2_09', '2_10', '1_10', '1_11', '1_12'].map(n => [SC(n)]),
    die: ['1_03', '1_04', '2_15', '2_21', '3_01', '3_08'].map(n => [SC(n)]) },
};
const run = (a, o = {}) => spawnSync('ffmpeg', ['-hide_banner', '-y', ...a], { encoding: 'utf8', maxBuffer: 1 << 28, ...o });
const TMP = join(process.env.TEMP || '.', 'build-voices-1018-' + process.pid + '.wav');
const made = {};
for (const kit in SET) for (const act in SET[kit]) {
  if (act === 'from') continue;
  const list = SET[kit][act], from = SET[kit].from || 0;
  list.forEach(([[root, rel], o = {}], i) => {
    const src = join(root === 'DV' ? DVd : LRd, rel); if (!existsSync(src)) throw new Error('missing ' + src);
    let cut = o.cap || 0;
    if (o.head) { const r = run(['-i', src, '-af', 'silencedetect=noise=-30dB:d=0.06', '-f', 'null', '-']); const st = [...r.stderr.matchAll(/silence_start: ([\d.]+)/g)].map(m => +m[1]).filter(t => t > 0.2); cut = Math.min(st.length ? st[0] + 0.04 : 0.7, 0.8); }
    const trim = 'silenceremove=start_periods=1:start_threshold=-46dB:start_silence=0.01,areverse,silenceremove=start_periods=1:start_threshold=-46dB:start_silence=0.01,areverse';
    const chain = [trim, o.hp ? 'highpass=f=' + o.hp : '', o.lp ? 'lowpass=f=' + o.lp : '', o.rate ? 'asetrate=' + Math.round(44100 * o.rate) + ',aresample=44100' : '', cut ? 'atrim=0:' + cut : '', 'asetpts=PTS-STARTPTS'].filter(Boolean).join(',');
    run(['-i', src, '-ac', '1', '-ar', '44100', '-af', chain, TMP]);
    const d = +spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', TMP], { encoding: 'utf8' }).stdout;
    const vd = run(['-i', TMP, '-af', 'volumedetect', '-f', 'null', '-']).stderr, mean = +(vd.match(/mean_volume: (-?[\d.]+)/) || [, -20])[1];
    const gain = Math.max(-12, Math.min(14, -16.5 - mean)), fd = Math.min(0.06, d / 3);
    const name = kit + '_' + act + '_' + (from + i) + '.ogg';
    const r = run(['-i', TMP, '-af', `volume=${gain.toFixed(2)}dB,alimiter=limit=0.84:level=0,afade=t=out:st=${Math.max(0, d - fd).toFixed(3)}:d=${fd.toFixed(3)}`, '-c:a', 'libvorbis', '-q:a', '4', '-ac', '1', '-ar', '44100', join(OUT, name)]);
    if (r.status) throw new Error('ffmpeg failed ' + name + '\n' + r.stderr.slice(-400));
    (made[kit + '_' + act] = made[kit + '_' + act] || []).push(name + '  <- ' + root + ':' + rel + (o.head ? ' (head)' : '') + '  ' + d.toFixed(2) + 's');
  });
}
try { unlinkSync(TMP); } catch {}
for (const k in made) console.log(k + '\n  ' + made[k].join('\n  '));
