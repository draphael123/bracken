// tools/freebooter-kill.mjs — WHAT KILLS IN 0.28 SECONDS (docs/combat-tuning.md: "the Freebooter kills fodder in 0.28 s whatever its
// health - even 126 hp"). Not a tuning tool: it fights one fodder foe with a health bar set absurdly high and writes down every blow
// that lands on it (BK.log's 'dmgE' rows), so the mechanic behind the kill is named rather than guessed at.
//   node tools/freebooter-kill.mjs [hero=pirate] [foe=cutlass] [hp=126]
import { openPage } from './cdp.mjs';
const hero = process.argv[2] || 'pirate', foe = process.argv[3] || 'cutlass', hp = +(process.argv[4] || 126);
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{
    BK.manualSimulation = true; BK.EHP[${JSON.stringify(foe)}] = ${hp};
    const o = await BK.fightLab({ levels: ['waymeet'], heroes: [${JSON.stringify(hero)}], foes: [${JSON.stringify(foe)}], reps: 1 });
    const row = o.rows[0];
    /* and again, with the ear on: every blow that lands on it, with what the hero was doing */
    BK.log = [];
    const o2 = await BK.fightLab({ levels: ['waymeet'], heroes: [${JSON.stringify(hero)}], foes: [${JSON.stringify(foe)}], reps: 1 });
    const blows = BK.log.filter(l => l.k === 'dmgE').map(l => ({ dmg: l.dmg, hp0: l.hp0, hp: l.hp, alive: l.alive, blow: l.blow, swingKind: l.swingKind, heavy: l.heavy, combo: l.combo, keyed: l.keyed,
      from: (l.stack || '').split('\\n').slice(1, 4).map(s => s.trim().replace(/^at /, '').split(' ')[0]).join(' < ') }));
    BK.log = null;
    return { row, row2: o2.rows[0], blows: blows.slice(0, 14), n: blows.length };
  })()`, 900000);
  console.log('fight:', JSON.stringify(r.row), '\\nand again:', JSON.stringify(r.row2));
  console.log('blows that landed (' + r.n + '):');
  for (const b of r.blows) console.log('  ' + String(b.dmg).padStart(4) + ' dmg   ' + String(b.hp0).padStart(4) + ' -> ' + String(b.hp).padStart(4) + (b.alive ? '' : '  DEAD') + '   blow ' + b.blow + '  swing ' + b.swingKind + (b.heavy ? ' HEAVY' : '') + ' combo ' + b.combo + (b.keyed ? ' KEYED' : '') + '   ' + b.from);
} finally { pg.close(); }
