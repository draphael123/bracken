// tools/hl-proof-shots.mjs - STILLS OF THE HIGH LINES FROM THE REAL PAGE (claude/hlproof, 11-12). Not in the suite. The road must be open in the page (BRACKEN_ROAD=hl).
// usage: BRACKEN_ROAD=hl PORT=8644 node tools/hl-proof-shots.mjs <outdir>     -> map node, the level's acts (a winch haul, a glide in the gale, the Hookjack's tell, the gondola, the counterweight,
// the exam, the cave mouth), SKYHOOK phase 1 and 2, the two bestiary cards. 12 PNGs, each the game's own 320x180 buffer at x3.
import { openPage } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = process.argv[2] || 'work/claude/hlproof'; mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false, fonts: false, seed: 20261112, hints: 'none' });
try {
  const r = await pg.evalp(`(async () => { const lvm = await import('/src/level.js'), hlm = await import('/src/highlines.js'), LKT = await import('/src/line-kit.js'); const res = [], note = [];
    const TS = 16, LAND = hlm.HL_DATA.landings; BK.manualSimulation = true; BK.SET.hud = 'minimal';
    const snap = name => { try { BK.uiHud.q.length = 0; BK.uiHud.hint('', 0.01); } catch (e) {} BK.step(2); const c = document.createElement('canvas'); c.width = BK.view.VW * 3; c.height = BK.view.VH * 3; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    const run = n => { for (let i = 0; i < n; i++) { BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
    /* 1 THE MAP: the Sky Road cleared, the High Lines node */
    BK.reset({ fresh: true }); for (const l of lvm.LEVELS) if (l.id !== 'highlines' && l.id !== 'oreroad' && l.id !== 'minecart') BKT.PROG[l.id] = { cleared: true, medal: 2, silver: 3 }; BKT.PROG.skyroad = { cleared: true, medal: 2, silver: 3 };
    BK.mapLook('skyroad'); BK.step(60); BK.mapLook('highlines'); BK.step(60); snap('01-map-highlines-node');
    BK.mapLook('oreroad'); BK.step(40); snap('02-map-oreroad-next');
    /* the level */
    const idx = lvm.LEVELS.findIndex(l => l.id === 'highlines');
    const fresh = (keepFoes) => { BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(idx); BK.start(); BK.god = true; BK.sim(5); run(330); if (!keepFoes) for (const e of BK.enemies()) e.alive = false; const k = BK.keys; k.left = k.right = k.up = k.down = k.jump = false; return { P: BK.P, k }; };
    const stand = (P, x, li) => { P.lk = null; P.x = x * TS; P.y = LAND[li][1] * TS; P.vx = P.vy = 0; P.ground = false; run(8); };
    let { P, k } = fresh(false);
    stand(P, 12.2, 0); k.up = true; run(4); k.up = false; for (let f = 0; f < 90; f++) { if (f % 18 === 0) BK.press('atk'); run(1); } snap('03-act1-foothold-winch-haul');
    ({ P, k } = fresh(false)); stand(P, 11.5, 6 + 1); k.up = true; run(4); k.up = false; run(60); snap('04-act3-gorge-glide-G2');
    run(20); snap('04b-gorge-glide-later');
    /* the Hookjack: alive, on foot at the cutter's station, wait for his tell */
    ({ P, k } = fresh(true)); const hk = BK.enemies().filter(e => e.t === 'hookjack'); note.push('hookjacks ' + hk.length);
    const cut = hk.find(e => e.role === 'cutter' && Math.abs(e.x / TS - 57) < 8) || hk[1] || hk[0];
    if (cut) { stand(P, 55, 13); P.face = 1; let got = false; for (let f = 0; f < 900 && !got; f++) { run(1); got = BK.markShown && BK.markShown(cut); } note.push('hookjack mark ' + got + ' mode ' + cut.mode + ' at ' + Math.round(cut.x / TS) + ',' + Math.round(cut.y / TS)); snap('05-act4-hookjack-tell'); }
    /* the counterweight cage and the gondola */
    ({ P, k } = fresh(false)); stand(P, 14, 22); { const cab = LKT.platforms(BK.kit()).find(p => p.cab); P.x = (cab.x0 + cab.x1) / 2 + 8; P.y = cab.top; P.vx = P.vy = 0; run(10); snap('06-act7-gondola-boarded'); let f = 0; for (; f < 900 && BK.kit().cabs[0].st !== 'fall'; f++) run(1); run(6); snap('07-act7-gondola-falls-onto-the-glide'); }
    ({ P, k } = fresh(false)); stand(P, 74.5, 27); k.up = true; run(4); k.up = false; for (let f = 0; f < 90; f++) { if (f % 18 === 0) BK.press('atk'); run(1); } snap('08-act8-exam-E2-haul-in-the-gale');
    ({ P, k } = fresh(false)); stand(P, 5, 29); run(40); snap('09-cave-mouth-ledge-checkpoint-3');
    /* SKYHOOK */
    BK.setHero('knight'); BK.reset({ fresh: true }); BK.god = true; const went = BK.bossJump.go('skyhook'); note.push('bossJump ' + went);
    let f = 0; for (; f < 1200 && !BK.bossActive; f++) { BK.P.inv = 99; BK.sim(1); if (f % 8 === 0) BK.step(1); }
    const sk = () => BK.enemies().find(e => e.t === 'skyhook' && e.alive);
    for (f = 0; f < 600 && !(sk() && /^(ride|hookTell|dropTell)$/.test(sk().mode)); f++) { BK.P.inv = 99; run(1); } BK.step(2); snap('10-skyhook-phase1-' + (sk() ? sk().mode : 'none'));
    const s = sk(); if (s) { s.hp = Math.floor(s.maxHp * 0.45); for (f = 0; f < 600 && !(s.phase === 2 && s.mode !== 'phaseTell'); f++) { BK.P.inv = 99; run(1); } for (f = 0; f < 300 && !/^(cutTell|swingTell|ride|hookTell)$/.test(s.mode); f++) { BK.P.inv = 99; run(1); } BK.step(2); snap('11-skyhook-phase2-' + s.mode); note.push('phase ' + s.phase); }
    /* the bestiary: the two cards */
    BK.reset({ fresh: true }); const TL = BK.textLab, PR = BKT.PROG; PR.beasts = PR.beasts || {}; for (const b of TL.beasts()) PR.beasts[b.t] = Object.assign({}, PR.beasts[b.t], { seen: true, slain: 12 });
    BK.state = 'bestiary'; BK.ui.bestTab = 0; let n0 = BK.ui.beasts(); BK.ui.bestI = n0 - 1; BK.step(120); snap('12-bestiary-hookjack-last-foe'); note.push('foes ' + n0);
    BK.ui.bestTab = 1; let n1 = BK.ui.beasts(); BK.ui.bestI = n1 - 1; BK.step(120); snap('13-bestiary-skyhook-last-boss'); note.push('bosses ' + n1);
    return { res, note }; })()`, 900000);
  for (const [name, d] of r.res) { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log(name + '.png'); }
  console.log(JSON.stringify(r.note)); if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
