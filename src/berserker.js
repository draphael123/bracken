// src/berserker.js — THE BERSERKER'S KIT (claude/berserker 2026-10-04; REWORKED claude/berserker2 2026-10-11, scratch/brief-berserker2.md: "he never
// defends by stopping - he defends by hitting harder"). A front-line aggressor and poise-breaker, pure PHYSICAL momentum, no magic - TWO axes
// (a bearded axe and a hatchet), no shield, almost no reach, and a RAGE that only stays full while he stays in the fight. EVERYTHING IS DUAL-WIELDED.
//   X       THE FLURRY: lead axe, off axe, lead, off (L-R-L-R, quick and short - shorter than the knight's sword), and the FIFTH blow of a run is
//           THE CROSS-CHOP: both axes crossed and chopped in together (the engine's finishing cut: the shove, the throw, the poise). The run goes
//           on ONLY WHILE THE CHOPS LAND (a whiff starts it over), and every chop that lands in an unbroken chain feeds rage.
//   HOLD X  THE DOUBLE CHOP: both axes up over his head and down together - a heavy that leans HARD on poise (BZ.poise): it is how he breaks
//           elites and bosses open (the stagger bar, main.js addPoise).
//   AIR X   BOTH AXES SPINNING: round him, both sides (main.js attackBox0). DOWN+X in the air is still the plunge (the 'plunge' key), the axes
//           spun under him; UP+X the air up-slash ('rise'). Every B14 key is still his.
//   C       TAKE IT (no shield - the crossed axes and his chest): HOLD C and a blow from the front is ABSORBED - he takes BZ.take.chip (a tenth)
//           and the rest becomes RAGE; it costs stamina like a block (commit.js blockCost) and with none left the guard breaks. ON THE BEAT
//           (raised as the blow lands, the shared tap beat) it is his PARRY: nothing taken, the foe reels, and his next cut is the CROSS-CHOP
//           riposte. A RED !! blow is TOO STRONG: it lands whole (IRON BRACE: half). A tap raises it for BZ.take.min s.
//           FULL RAGE + C on the ground is THE FRENZY instead.
//   UP+C    THE AXE THROW: the hatchet hurled ahead. Until he walks over it and picks it up he fights ONE-HANDED - the same moves, a one-axe look,
//           slower chops (BZ.swing.one) and half the poise on the heavy.
//   DOWN    THE COIL and THE POUNCE (src/crouch-c.js): hold down to coil (rage ticks up), hold a way and let go of down: a low fast leap axes-first.
//   IDLE    THE WHETSTONE (src/crouch-c.js): stood still between fights he whets an axe on the other, and rage creeps up a little.
//   RAGE    0-100, filled by blows he deals, blows he TAKES ON THE AXES and blows that find him, DRAINED out of combat (BZ.rage.drainAfter): he
//           must stay aggressive. Half a bar or more: quicker chops and heavier poise. FULL: tap C for FRENZY.
//   FRENZY  BZ.frenzy.t s: faster chops, NO FLINCH, HEAL ON HIT (BZ.frenzy.heal of every blow that lands) and REND - every frenzied blow on ONE
//           foe stacks a rend, and the BZ.rend.n-th CRACKS HIS ARMOUR: that blow IS a HEAVY (B14's heavy key, ORE, plate, a shield - main.js
//           bzRendBlow). He TAKES x1.25 damage while it lasts. It begins with a WAR CRY (partners within BZ.frenzy.cryR quicken).
// HE NEVER KILLS HIMSELF (Daniel): every cost his own kit puts on his health - the chip through the crossed axes, the frenzy's extra quarter -
// is floored at 1 hp (selfFloor / lethal's surcharge). A foe's own blow can still kill him; his choices never do. (Rage and the pounce cost
// stamina, never health.) WHIRLWIND is NOT his: it is kept for his subclass.
// NOT A MASH CLASS: the boss resistance and the greed reprisal apply to him like anyone; REND needs a FRENZY (a full bar and C), which X alone
// never reaches. main.js owns the world, the input and the tal() reads (bzTal); this module owns his state, which lives ON THE HERO (P.rage,
// P.frenzyT, P.braceT, P.bzAxe...) so a co-op partner carries his own. BK.bz() reads it for tools/berserker.mjs and the bots.
export const BZ = {
  hp: 105, dmg: 12,                                   /* base health (src/progression.js) and the chop's base damage (main.js swordDmg) */
  run: 1.0,                                           /* x RUN on foot: a quick man, not a heavy one */
  swing: { base: 1.3, rage: 1.38, frenzy: 1.5, one: 0.8, haste: 1.1, cross: 0.82 },   /* P.atk runs at these multiples (the flurry is QUICK); the cross-chop finisher x cross */
  flurry: { run: 5, dmg: 0.85 },                      /* the run's length (the fifth is the CROSS-CHOP) and each quick chop's share of a full cut */
  rage: { dealt: 0.9, taken: 1.4, brace: 30, hitCap: 14, drainAfter: 2.5, drain: 9, high: 50, chain: 10, absorb: 1.2, absorbCap: 30 },   /* absorb: rage per hp the crossed axes take */
  frenzy: { t: 8, takeMul: 1.25, hideMul: 1.1, heal: 0.025, priceHeal: 0.05, cryR: 110, haste: 5, mist: 40, long: 3 },   /* heal: of every blow that lands (BLOOD PRICE: priceHeal) */
  rend: { n: 4, decay: 2.5 },                         /* REND: the n-th frenzied blow on one foe cracks it (counts as a HEAVY); stacks fall off after decay s without one */
  take: { min: 0.25, chip: 0.1, beat: 1 },            /* TAKE IT: a tap holds it up min s; a blow on it costs him chip of it; beat x the shared tap beat */
  brace: { live: 0.3, rec: 0.28, won: 0.1, st: 10, stagger: 0.7, back: 1.2 },   /* (kept for the bots and old saves' readers: braceRec is never set now) */
  roll: { t: 0.28, speed: 300, shove: 200, stagger: 0.55, dmg: 0.4 },   /* (claude/heropassa) THE SHOULDER BARGE (his distinct dodge): 250 -> 300, a fifth further into them; brutes, elites, minis and bosses are not shoved (smallFoe) */
  axe: { st: 18, vx: 300, vy: -10, g: 600, flat: 0.5, dmg: 1.3, haft: 1.33, lost: 5, pick: 14, recall: 420 },
  perk: { rage: 1, brace: 1 },                        /* LEVELING2's hero perks (STOKED, STOUT BRACE): main.js applyUpgrades sets these from the card; 1 = none */
  poise: { heavy: 30, bossMul: 1.4, rage: 1.25, one: 0.5 },
  /* (claude/chargetiers, Daniel 10-21 "each tier a DIFFERENT move") THE RAGE WIND-UP: HOLD X and the double chop climbs three tiers. at = s of WIND (past HEAVY_START, x his wind's
     quickness) each arrives at - T1 is the old full wind; RAGE (half a bar or more) winds them x rageQ, a FRENZY x frenzyQ; hold = s held at T3 before it goes by itself;
     st = wind each costs ON TOP of the heavy's own; mul = x the heavy's blow; poise = x the heavy's lean on the bar.
       T1 OVERHEAD CHOP   both axes down from over his head (the double chop he always had)
       T2 THE WHEEL one full turn with both axes out, carried a step and a half in: it cuts BEHIND him as well as ahead (cleave)
       T3 GROUND-SPLITTER both axes buried in the floor: the ground splits both ways (a shockwave that knocks the small ones DOWN) - the heaviest lean on a bar he has (claude/chargetiers) */
  tiers: { at: [0.36, 0.86, 1.41], hold: 0.8, rageQ: 0.8, frenzyQ: 0.65, st: [0, 0, 6, 12], mul: [0, 1, 1.2, 1.35], poise: [0, 1, 1.15, 1.5],   /* (tuned 10-22: 1.25/1.5 and 1.2/1.8 took the wood from 4/12 to 12/12 for him) */
    names: ['', 'OVERHEAD CHOP', 'THE WHEEL', 'GROUND-SPLITTER'], cols: [null, '#ffd0a0', '#ff8a4c', '#ff3a2a'], label: [null, '#ffe6c8', '#ffb07a', '#ff7a5a'] },
  cleave: { vx: 190, reach: 26, back: 22, shove: 220 },
  slam: { sp: 240, life: 0.38, dmg: 0.45, reach: 24 },
  /* WEIGHT (claude/weight): his row of its commit table (src/commit.js reads COMMIT.berserker) - kept here as the record */
  commit: { light: 0.14, third: 0.2, up: 0.14, heavy: 0.27, roll: 22, rollInv: 0.26, rollT: 0.28, brace: 0.28 },   /* (claude/heropassa: the record now matches what is live - src/commit.js ROLL_COST 22 and STAM.rollInv 0.26 win; this row was never read) */
};
/* WHO MAY BE ROLLED THROUGH AND KNOCKED ASIDE (and knocked along by the pounce): a small common foe, never a boss, a mini, an elite, a big one or one that cannot be moved */
/* (claude/chargetiers) THE TIER HIS WIND HAS REACHED: held = s X has been down (main.js P.atkHeld), q = the wind's quickness (heavyWind / BZ.tiers.at[0] x rage / frenzy), start = HEAVY_START */
export const bzTierAt = (i, q = 1, start = 0.14) => start + BZ.tiers.at[i - 1] * q;
export const bzTierFor = (held, q = 1, start = 0.14) => { let t = 0; for (let i = 1; i <= 3; i++) if (held >= bzTierAt(i, q, start) - 1e-6) t = i; return t; };
export const smallFoe = (e, knockSkip) => !!(e && e.alive && !e.harmless && !e.maxHp && !e.mini && !e.elite && !e.big && !e.xpRole && !(knockSkip && knockSkip(e)));
/* WHO HE MAY THROW IN A FRENZY (for claude/throw): a medium foe too - not a boss, a mini, an elite captain */
export const canThrowMedium = (P, e) => !!(P && P.frenzyT > 0 && e && e.alive && !e.maxHp && !e.mini && !e.elite && !e.xpRole);
/* HE NEVER KILLS HIMSELF: what his own kit costs him leaves him at least one (and never takes a last point he has) */
export const selfFloor = (hp, cost) => Math.max(Math.min(hp, 1), hp - Math.max(0, cost));

export function makeBerserker(api) {
  const stats = { takes: 0, taken: 0, absorbed: 0, chip: 0, parries: 0, takeRed: 0, takeBroken: 0, frenzies: 0, throws: 0, pickups: 0, recalls: 0, axeHits: 0, rollShoves: 0, kills: 0,
    healed: 0, rageDealt: 0, rageTaken: 0, cries: 0, rends: 0, cracks: 0, floored: 0,
    braces: 0, braced: 0, braceMiss: 0, braceRed: 0, tier1: 0, tier2: 0, tier3: 0 };   /* (claude/chargetiers: the rage wind-up's tiers let go) */   /* (the brace's names, kept as the take's: braces = raised, braced = took one) */
  const P = () => api.P, T = () => api.tal();
  const clampRage = p => { p.rage = Math.max(0, Math.min(100, p.rage || 0)); };
  const raging = p => (p.rage || 0) >= BZ.rage.high || p.frenzyT > 0;
  function gain(p, n, why) { if (!(n > 0) || p.frenzyT > 0) return; n *= BZ.perk.rage; const was = (p.rage || 0) >= 100; p.rage = Math.min(100, (p.rage || 0) + n);
    if (why === 'dealt') stats.rageDealt += n; else if (why === 'taken') stats.rageTaken += n;
    if (!was && p.rage >= 100) { api.meterReady('#ff4a3a'); api.teach('full'); } }
  const fight = p => { p.bzFightT = api.time; };

  /* ---- THE SWING'S PACE (main.js multiplies P.atk's clock by this): the flurry is quick, the cross-chop that ends it a beat slower ---- */
  function swingMul() { const p = P(); let k = BZ.swing.base;
    if (p.frenzyT > 0) k = BZ.swing.frenzy; else if ((p.rage || 0) >= BZ.rage.high) k = BZ.swing.rage;
    if (p.heavySwing && p.atk >= 0 && !p.heavy) k *= BZ.swing.cross;
    if (p.bzAxe) k *= BZ.swing.one; return k; }
  const oneHanded = () => !!P().bzAxe;

  /* ---- A BLOW HE DEALT (main.js hurtEnemy, after it landed): rage, and in a frenzy HEAL ON HIT (what is under a whole point is kept for the next) ---- */
  function dealt(e, dmg, killed) { const p = P(); if (!e || e.harmless || !(dmg > 0)) return; fight(p);
    gain(p, Math.min(BZ.rage.hitCap, dmg * BZ.rage.dealt * (T().hot ? 4 / 3 : 1)), 'dealt');
    if (killed) stats.kills++;
    if (p.frenzyT > 0 && p.hp > 0 && p.hp < p.maxHp) { p.bzHealAcc = (p.bzHealAcc || 0) + dmg * (T().price ? BZ.frenzy.priceHeal : BZ.frenzy.heal);
      const whole = Math.floor(p.bzHealAcc); if (whole >= 1) { p.bzHealAcc -= whole; const hp0 = p.hp; p.hp = Math.min(p.maxHp, p.hp + whole); stats.healed += p.hp - hp0;
        if (p.hp > hp0 && Math.random() < 0.5) api.parts.push({ x: p.x + (Math.random() - 0.5) * 8, y: p.y - 14, vx: 0, vy: -26, life: 0.4, max: 0.4, col: '#ff6b6b', size: 1, grav: 0 }); } } }
  /* REND (main.js bzRendBlow, as a frenzied melee blow is struck): a stack on THIS foe; the n-th CRACKS him - true: that blow is a heavy */
  function rend(e, force) { const p = P(); if ((!(p.frenzyT > 0) && !force) || !e || !e.alive || e.harmless) return false;   /* (claude/plunges) force: AXE SPIN stacks it out of a frenzy */
    if (p.bzRendE !== e || api.time - (p.bzRendAt ?? -99) > BZ.rend.decay) { p.bzRendE = e; p.bzRendN = 0; }
    p.bzRendAt = api.time; p.bzRendN = (p.bzRendN || 0) + 1; stats.rends++;
    if (p.bzRendN < BZ.rend.n) { api.sparks(e.x, e.y - (e.h || 16) / 2, Math.sign(e.x - p.x) || p.face, 2 + p.bzRendN); return false; }
    p.bzRendN = 0; stats.cracks++; p.bzCrackE = e; p.bzCrackAt = api.time;   /* (claude/bzart) the CRACKED effect is drawn off these */
    api.number(e.x, e.y - (e.h || 16) - 18, 'CRACKED', '#ff9a5c'); api.ringAt(e.x, e.y - (e.h || 16) / 2, 18, '#ff6b4a', 0.3); api.SFX.crack && api.SFX.crack(); api.shakeCam(3, p.face * 2); api.hitstop(0.05);
    return true; }
  /* A CHOP THAT LANDED (main.js swingDmg): the chain goes on, and every fourth link of it pays THE CHAIN */
  function chopLanded(e) { const p = P(); p.bzChainHit = true; p.bzChainN = (p.bzChainN || 0) + 1;
    if (T().chain && p.bzChainN % 4 === 0) gain(p, BZ.rage.chain, 'dealt');
    const bite = T().bite && p.bzChainSet && p.bzChainSet.has(e) ? 1.1 : 1; (p.bzChainSet = p.bzChainSet || new Set()).add(e); return bite; }
  /* A CHOP STARTS (main.js startSwing): the run only goes on if the last chop landed (a whiff, or a pause, starts it over) */
  function chopStart(quick) { const p = P(); const keep = quick && p.bzChainHit !== false; if (!keep) { p.bzChainN = 0; p.bzChainSet = new Set(); } p.bzChainHit = false; return keep; }
  /* A BLOW HE TOOK (main.js damagePlayer0, after it landed): rage */
  function took(dmg) { const p = P(); fight(p); if (dmg > 0) gain(p, dmg * BZ.rage.taken, 'taken'); }

  /* ---- WHAT A BLOW ON HIM COSTS (main.js damagePlayer0, multiplied in with the rest) ---- */
  function takeMul() { const p = P(), t = T(); let k = 1;
    if (p.frenzyT > 0) k *= t.hide ? BZ.frenzy.hideMul : BZ.frenzy.takeMul;
    if (p.hardenT > 0) k *= 2 / 3;
    if (t.scar && p.hp < p.maxHp / 3) k *= 0.8;
    return k; }
  /* A BLOW THAT WOULD KILL HIM: LAST STAND holds him at one; UNBOWED, once a fight, too - with a full bar of rage. And THE FRENZY'S SURCHARGE never
     kills him (surcharge: what the frenzy added to this blow, main.js): a blow that would have left him standing without it leaves him on one */
  function lethal(dmg, surcharge = 0) { const p = P(); if (p.hp - dmg > 0) return dmg;
    if (p.standT > 0) return Math.max(0, p.hp - 1);
    if (T().unbowed && !p.bzUnbowedUsed) { p.bzUnbowedUsed = true; p.rage = 100; api.meterReady('#ff4a3a'); api.ringAt(p.x, p.y - 12, 26, '#ff4a3a', 0.5); api.SFX.bzRoar && api.SFX.bzRoar(); api.shakeCam(4); return Math.max(0, p.hp - 1); }
    if (surcharge > 0 && p.hp - (dmg - surcharge) > 0) { stats.floored++; return Math.max(0, p.hp - 1); }
    return dmg; }
  /* NO FLINCH: a frenzy, UNFLINCHING with half a bar, or the beat SHRUG IT OFF buys */
  const armoured = () => { const p = P(); return p.frenzyT > 0 || (T().unflinch && (p.rage || 0) >= BZ.rage.high) || p.bzIronT > 0; };

  /* ---- TAKE IT: the crossed axes ---- */
  const beatLen = () => api.tap() * BZ.take.beat * BZ.perk.brace * (T().braceLong ? 4 / 3 : 1);   /* (STOUT BRACE and WIDE BRACE widen the beat) */
  const takeUp = p => (p.braceT || 0) > 0;
  const onBeat = p => takeUp(p) && api.time - (p.bzTakeAt ?? -9) <= beatLen() + 1e-6;
  function raise(p) { p.braceT = BZ.take.min; p.bzTakeAt = api.time; p.braceRec = 0; p.braceHit = false; p.vx = 0; stats.takes++; stats.braces++;
    api.SFX.bzBrace && api.SFX.bzBrace(); api.squash(1.06, 0.95, 0.08); api.teach('brace'); }
  /* A BLOW LANDING ON HIM (main.js damagePlayer0): 'blocked' (parried or absorbed), 'half' (a red one on IRON BRACE, or the guard broken) or null */
  function takeTakes(fromX, dmg, unblockable, foe, pierce) { const p = P(); if (!takeUp(p)) return null;
    const front = Math.sign(fromX - p.x) === p.face || fromX === p.x; if (!front) return null;
    if (unblockable) { stats.takeRed++; stats.braceRed++;   /* A RED BLOW IS NEVER TAKEN: it finds him whole (IRON BRACE: at half). On the beat main.js has said TOO STRONG */
      if (T().ironBrace) { api.number(p.x, p.y - 26, 'HOLDS', '#c9b27c'); api.SFX.clank(); return 'half'; }
      return null; }
    if (pierce && !(onBeat(p) && foe)) return null;   /* a bolt goes through crossed axes, as through a raised shield (only a parry turns a blade that pierces) */
    fight(p);
    if (onBeat(p)) {   /* THE PARRY: raised as it landed - nothing taken, the foe reels (the shared parry), the next cut is the CROSS-CHOP */
      stats.parries++; stats.braced++; p.braceHit = true; p.parryT = 0.22; gain(p, BZ.rage.brace, 'brace');
      if (api.parried) api.parried(foe);   /* (claude/riposte) */
      if (foe && !foe.maxHp && !foe.mini) { foe.vx = Math.sign(foe.x - p.x) * (T().braceBack ? 230 : 120); if (T().braceBack) { foe.vy = Math.min(foe.vy || 0, -120); foe.knock = Math.max(foe.knock || 0, BZ.brace.back); } }
      api.SFX.bzBraced && api.SFX.bzBraced(); api.hitstop(0.08); api.shakeCam(3, -p.face * 2); api.zoomKick(1.04, 0.16);
      api.ringAt(p.x + p.face * 8, p.y - 12, 16, '#ff6b4a', 0.3); api.sparks(p.x + p.face * 8, p.y - 12, p.face, 8); api.number(p.x, p.y - 28, 'PARRY', '#ff9a5c');
      api.trialEvent('block'); return 'blocked'; }
    /* ABSORBED: it costs stamina like a block; with none left the axes are beaten down (the guard breaks: half the blow, a stagger) */
    const cost = api.blockCost(dmg);
    if (!api.canPay(cost)) { stats.takeBroken++; p.braceT = 0; api.guardBreak(); return 'half'; }
    api.pay(cost);
    const chip = Math.max(1, Math.round(dmg * BZ.take.chip * api.takeScale())), hp0 = p.hp;
    p.hp = selfFloor(p.hp, chip); if (hp0 - p.hp < chip) stats.floored++;   /* HE NEVER KILLS HIMSELF: the chip leaves him at one */
    stats.chip += hp0 - p.hp; stats.taken++; stats.braced++; stats.absorbed += Math.max(0, dmg - chip);
    gain(p, Math.min(BZ.rage.absorbCap, Math.max(0, dmg - chip) * BZ.rage.absorb), 'taken'); p.braceHit = true;
    p.vx = -p.face * 50;
    api.SFX.bzBraced && api.SFX.bzBraced(); api.hitstop(0.05); api.shakeCam(2, -p.face * 2);
    api.ringAt(p.x + p.face * 8, p.y - 12, 11, '#ff9a5c', 0.22); api.sparks(p.x + p.face * 8, p.y - 12, p.face, 6); api.number(p.x, p.y - 28, 'TOOK IT', '#ff9a5c');
    api.trialEvent('block'); return 'blocked'; }

  /* ---- FRENZY ---- */
  function frenzy(p, free) { p.frenzyT = BZ.frenzy.t + (T().long ? BZ.frenzy.long : 0); p.frenzyMax = p.frenzyT; p.rage = 100; stats.frenzies++; p.bzRendE = null; p.bzRendN = 0; p.bzHealAcc = 0;
    p.blastT = 0.45; p.vx = 0; p.braceT = 0;
    api.SFX.bzRoar && api.SFX.bzRoar(); api.shakeCam(6); api.zoomKick(1.08, 0.3); api.hitstop(0.05); api.ringAt(p.x, p.y - 12, 30, '#ff4a3a', 0.45); api.ringAt(p.x, p.y - 12, BZ.frenzy.cryR, '#ff9a5c', 0.6);
    api.number(p.x, p.y - 32, 'FRENZY', '#ff4a3a'); warCry(p, BZ.frenzy.haste); api.trialEvent('meter'); api.teach('frenzy'); void free; }
  /* THE WAR CRY: every partner within reach quickens (main.js reads P.hasteT for any hero: run and swing x BZ.swing.haste) */
  function warCry(p, t) { stats.cries++; for (const q of api.players()) if (q !== p && !q.dead && Math.hypot(q.x - p.x, q.y - p.y) < BZ.frenzy.cryR) { q.hasteT = Math.max(q.hasteT || 0, t); api.ringAt(q.x, q.y - 12, 14, '#ff9a5c', 0.35); } }

  /* ---- THE AXE THROW ---- */
  function throwAxe(p) { if (p.bzAxe) return false; if (!api.spend(BZ.axe.st)) { api.tired(); return false; } stats.throws++;
    const far = T().haft ? BZ.axe.haft : 1;
    p.bzAxe = { x: p.x + p.face * 8, y: p.y - 10, vx: p.face * BZ.axe.vx * Math.sqrt(far), vy: BZ.axe.vy, spin: 0, state: 'fly', t: 0, hit: new Set(), lostT: 0 };
    api.kitPose(p, 'bzThrow', 0.24); api.SFX.bzThrow && api.SFX.bzThrow(); p.atk = -1; p.braceT = 0; api.teach('throw'); return true; }
  function recall(p) { const a = p.bzAxe; if (!a || a.state === 'back') return false; a.state = 'back'; a.hit = new Set(); a.t = 0; stats.recalls++; api.SFX.bzThrow && api.SFX.bzThrow(); return true; }
  function axeHit(p, a, e, back) { const far = T().haft ? BZ.axe.haft : 1;
    api.hurtAs('shot', e, Math.round(api.swordDmg() * BZ.axe.dmg * (back ? 0.7 : 1) * far), a.x - Math.sign(a.vx || p.face) * 20, false); stats.axeHits++;
    if (T().stagger && e.alive) { if (e.maxHp || e.mini) api.poiseLean(e, 18); else e.stagger = Math.max(e.stagger || 0, 0.8); }
    api.trialEvent('axe');   /* (his yard's axe station) */
    api.sparks(e.x, e.y - (e.h || 16) / 2, Math.sign(a.vx) || 1, 6); api.hitstop(0.04); }
  function stepAxe(p, dt) { const a = p.bzAxe; if (!a) return; a.t += dt; a.spin += dt * 22;
    if (a.state === 'fly') { if (a.t > BZ.axe.flat) a.vy += BZ.axe.g * dt;   /* (it flies FLAT for BZ.axe.flat s - nine tiles - then drops) */ a.x += a.vx * dt; a.y += a.vy * dt;
      for (const e of api.enemies) { if (!e.alive || e.harmless || e.gone > 0 || a.hit.has(e) || !api.overlap({ l: a.x - 5, r: a.x + 5, t: a.y - 5, b: a.y + 5 }, api.box(e))) continue;
        a.hit.add(e); axeHit(p, a, e, false); a.vx *= -0.25; a.vy = -60; a.state = 'drop'; break; }
      if (a.state === 'fly' && api.isSolid(Math.floor(a.x / api.TS), Math.floor(a.y / api.TS))) { a.x -= a.vx * dt; a.vx = 0; a.vy = 0; a.state = 'stuck'; api.SFX.clank(); api.sparks(a.x, a.y, -Math.sign(a.vx || p.face), 4); } }
    if (a.state === 'drop') { a.vy += 600 * dt; a.x += a.vx * dt; const ny = a.y + a.vy * dt;
      if (api.isSolid(Math.floor(a.x / api.TS), Math.floor((ny + 2) / api.TS)) || api.isOneWay(api.tileAt(Math.floor(a.x / api.TS), Math.floor((ny + 2) / api.TS)))) { a.y = Math.floor((ny + 2) / api.TS) * api.TS - 2; a.vx = 0; a.vy = 0; a.state = 'lie'; api.dust(a.x, a.y + 2, 2); }
      else a.y = ny; }
    if (a.state === 'fly' && a.t > 0.9) a.state = 'drop';   /* it carries about nine tiles, then falls */
    if (a.state === 'back') { const tx = p.x, ty = p.y - 14, d = Math.hypot(tx - a.x, ty - a.y) || 1, sp = BZ.axe.recall * dt;
      a.x += (tx - a.x) / d * Math.min(d, sp); a.y += (ty - a.y) / d * Math.min(d, sp); a.vx = Math.sign(tx - a.x) * 300;
      for (const e of api.enemies) { if (!e.alive || e.harmless || e.gone > 0 || a.hit.has(e) || !api.overlap({ l: a.x - 5, r: a.x + 5, t: a.y - 5, b: a.y + 5 }, api.box(e))) continue; a.hit.add(e); axeHit(p, a, e, true); }
      if (d < 10) { catchAxe(p); return; } }
    /* PICKED UP: he walks over it (or reaches it in the wall) */
    if ((a.state === 'lie' || a.state === 'stuck') && Math.abs(a.x - p.x) < BZ.axe.pick && a.y > p.y - 30 && a.y < p.y + 6) { catchAxe(p); return; }
    /* LOST (over a pit, into deep water, off the level): it is back in his hand after BZ.axe.lost s - a lost axe never leaves him one-handed for good */
    if (a.y > api.LH * api.TS + 32 || (a.state !== 'back' && a.t > 12)) { a.lostT += dt; a.state = 'gone'; }
    if (a.state === 'gone' && (a.lostT += dt) > BZ.axe.lost) catchAxe(p); }
  function catchAxe(p) { if (!p.bzAxe) return; p.bzAxe = null; stats.pickups++; api.SFX.bzCatch && api.SFX.bzCatch(); api.ringAt(p.x, p.y - 14, 10, '#c9d1dc', 0.2); }

  /* ---- THE SHOULDER ROLL: the small foes it rolls through are knocked aside ---- */
  function rollStep(p) { if (!(p.dodge > 0) || p.swim) return;
    for (const e of api.enemies) { if (!smallFoe(e, api.knockSkip) || (e.shoved > 0) || Math.abs(e.x - p.x) > (e.w || 12) / 2 + 9 || Math.abs((e.y - (e.h || 14) / 2) - (p.y - 9)) > 18) continue;
      e.shoved = 0.6; e.stagger = Math.max(e.stagger || 0, BZ.roll.stagger); e.vx = (Math.sign(e.x - p.x) || p.face) * BZ.roll.shove; e.vy = -90; stats.rollShoves++;
      api.hurtAs('dash', e, Math.round(api.swordDmg() * BZ.roll.dmg), p.x, false); api.SFX.clank(); api.hitstop(0.03); api.dust(e.x, e.y, 3); } }

  /* ---- EVERY FRAME (main.js updatePlayer, the hero's own C block): the timers, the drain, the C key, the axe ---- */
  function update(dt, keys, ctx) {
    const p = P(), t = T(); clampRage(p);
    for (const k of ['braceT', 'braceRec', 'hardenT', 'standT', 'bzIronT', 'blastT', 'parryT']) p[k] = Math.max(0, (p[k] || 0) - dt);
    if (p.frenzyT > 0) { p.frenzyT = Math.max(0, p.frenzyT - dt); p.rage = 100 * p.frenzyT / (p.frenzyMax || BZ.frenzy.t); fight(p);
      if (Math.random() < dt * 24) api.parts.push({ x: p.x + (Math.random() - 0.5) * 12, y: p.y - 4 - Math.random() * 18, vx: (Math.random() - 0.5) * 10, vy: -30 - Math.random() * 30, life: 0.45, max: 0.45, col: Math.random() < 0.5 ? '#ff4a3a' : '#ffb08a', size: 1, grav: -30 });
      if (p.frenzyT <= 0) { p.rage = t.mist ? BZ.frenzy.mist : 0; p.bzRendE = null; p.bzRendN = 0; api.SFX.bzFrenzyEnd && api.SFX.bzFrenzyEnd(); api.ringAt(p.x, p.y - 12, 16, '#9a6a5a', 0.3); } }
    else if (!p.dead && api.time - (p.bzFightT ?? -99) > BZ.rage.drainAfter && !(p.workT > 0) && !(p.coilT > 0) && !(p.whetHold) && !(api.inTrial && api.inTrial())) { p.rage = Math.max(0, (p.rage || 0) - BZ.rage.drain * (t.cool ? 0.5 : 1) * dt); if (p.rage > 30) api.teach('drain'); }   /* OUT OF THE FIGHT IT GOES */
    /* TAKE IT: held, it stays up; a swing, a roll or a stagger drops it */
    if (takeUp(p)) { if (ctx.stunned || ctx.dodging || ctx.attacking || p.dead || p.plunge || !(p.ground || p.swim)) p.braceT = 0;
      else { p.vx = 0; if (keys.block) p.braceT = Math.max(p.braceT, 0.05); } }
    const cDown = keys.block && !p.cWas; p.cWas = !!keys.block;
    const free = !ctx.stunned && !ctx.dodging && !p.plunge && !ctx.attacking && !(p.blastT > 0) && !(p.charge > 0) && !p.dead && !(p.pounceT > 0) && !(p.pounceRec > 0);
    if (cDown && keys.up && free && !takeUp(p)) { if (p.bzAxe) { if (t.ret) recall(p); } else throwAxe(p); }   /* UP+C: the throw (THE RETURN: again, it comes back) */
    else if (cDown && free && keys.down && (p.ground || p.swim) && (p.rage || 0) >= 100 && !(p.frenzyT > 0)) frenzy(p, free);   /* (claude/bzart, Daniel 10-11: THE FRENZY IS DOWN+C; a plain C at a full bar is TAKE IT) */
    else if (cDown && free && (p.ground || p.swim) && !takeUp(p)) { if (ctx.guardOk === false) { p.stFlash = 0.35; } else raise(p); }   /* (WINDED: no guard - claude/weight guardOk) */
    stepAxe(p, dt); rollStep(p);
    if (p.ground && !p.dead && p.bzFightT !== undefined && api.time - p.bzFightT > 6) p.bzUnbowedUsed = false;   /* UNBOWED is once a FIGHT: six quiet seconds and it is his again */
  }

  /* ---- HIS NINE BOUGHT ACTIVES (main.js berserkerKit presses them through skillPress / cdReady / spend, like everyone's) ---- */
  const near = (p, r, h = 40) => api.enemies.filter(e => e.alive && !e.harmless && !(e.gone > 0) && Math.abs(e.x - p.x) < r + (e.w || 12) / 2 && Math.abs(e.y - p.y) < h);
  const kit = {
    roar() { const p = P(); api.kitPose(p, 'bzRoar', 0.5); gain(p, 25, 'brace'); warCry(p, 5); fight(p); api.SFX.bzRoar && api.SFX.bzRoar(); api.shakeCam(4); api.ringAt(p.x, p.y - 12, 70, '#ff9a5c', 0.45);
      for (const e of near(p, 70)) { if (e.maxHp || e.mini) e.stagger = Math.max(e.stagger || 0, 0.2); else { e.stagger = Math.max(e.stagger || 0, 0.6); e.vx = (Math.sign(e.x - p.x) || 1) * 110; } } },
    spin() { const p = P(); api.kitPose(p, 'bzSpin', 0.5); p.spinT = 0.5; p.spinHits = [new Set(), new Set()]; api.SFX.bzChop && api.SFX.bzChop(); },
    harden() { const p = P(); api.kitPose(p, 'bzHarden', 0.4); p.hardenT = 5; api.SFX.bzHarden && api.SFX.bzHarden(); api.ringAt(p.x, p.y - 12, 16, '#8a5a3a', 0.4); },
    cleave() { const p = P(); api.kitPose(p, 'bzCleave', 0.35); p.cleaveT = 0.16; p.cleaveHit = new Set(); p.vx = p.face * 60; api.SFX.bzHeavy && api.SFX.bzHeavy(); api.shakeCam(3, p.face * 2); },
    rampage() { const p = P(); api.kitPose(p, 'bzRamp', 0.45); p.rampT = 0.45; p.rampHit = new Set(); api.SFX.bzRoar && api.SFX.bzRoar(); api.streaks(p.x, p.y - 10, -p.face, ['#ff9a5c', '#e8dcc0'], 140); },
    shrug() { const p = P(); api.kitPose(p, 'bzShrug', 0.35); p.hurt = 0; p.flatT = 0; p.bzIronT = 0.4; gain(p, 15, 'brace'); api.SFX.bzShrug && api.SFX.bzShrug(); api.ringAt(p.x, p.y - 12, 14, '#c9b27c', 0.3); },
    stand() { const p = P(); api.kitPose(p, 'bzStand', 0.5); p.standT = 4; api.SFX.bzRoar && api.SFX.bzRoar(); api.ringAt(p.x, p.y - 12, 22, '#ff4a3a', 0.45); },
    unchained() { const p = P(); api.kitPose(p, 'bzUnch', 0.45); p.rage = 100; frenzy(p, true); },
    storm() { const p = P(); api.kitPose(p, 'bzStorm', 0.4); p.hatchets = p.hatchets || [];
      for (let i = 0; i < 4; i++) p.hatchets.push({ x: p.x + p.face * 8, y: p.y - 14, vx: p.face * (260 + i * 20), vy: -120 + i * 55, life: 1.1, hit: new Set(), spin: i }); api.SFX.bzThrow && api.SFX.bzThrow(); },
  };
  /* THE KIT'S BODIES IN MOTION (every frame, after update): the spin, the cleave, the rampage and the hatchets */
  function kitStep(dt) { const p = P();
    if (p.spinT > 0) { const prev = p.spinT; p.spinT -= dt; const half = p.spinT > 0.25 ? 0 : 1;
      if ((prev > 0.38 && p.spinT <= 0.38) || (prev > 0.13 && p.spinT <= 0.13)) { api.ringAt(p.x, p.y - 10, 36, '#e8eef6', 0.2); api.SFX.bzChop && api.SFX.bzChop(); }
      for (const e of near(p, 36, 26)) if (!p.spinHits[half].has(e)) { p.spinHits[half].add(e); api.hurtAs('light', e, Math.round(api.swordDmg() * 1.15 * api.amul('bzSpin')), p.x, false); api.sparks(e.x, e.y - (e.h || 16) / 2, Math.sign(e.x - p.x) || 1, 5); } }
    if (p.cleaveT > 0) { p.cleaveT -= dt; const r = 62, hb = p.face > 0 ? { l: p.x, r: p.x + r, t: p.y - 28, b: p.y + 2 } : { l: p.x - r, r: p.x, t: p.y - 28, b: p.y + 2 };
      for (const e of api.enemies) { if (!e.alive || e.harmless || e.gone > 0 || p.cleaveHit.has(e) || !api.overlap(hb, api.box(e))) continue; p.cleaveHit.add(e);
        api.hurtAs('heavy', e, Math.round(api.swordDmg() * 1.8 * api.amul('bzCleave')), p.x, false); api.poiseLean(e, 30); if (e.alive && !e.maxHp && !e.mini) e.stagger = Math.max(e.stagger || 0, 0.9); api.sparks(e.x, e.y - (e.h || 16) / 2, p.face, 8); api.hitstop(0.05); } }
    if (p.rampT > 0) { p.rampT -= dt; p.vx = p.face * 300; if (Math.random() < 0.5) api.dust(p.x - p.face * 5, p.y, 1);
      for (const e of api.enemies) { if (!e.alive || e.harmless || e.gone > 0 || p.rampHit.has(e) || Math.abs(e.x - p.x) > (e.w || 12) / 2 + 12 || Math.abs((e.y - (e.h || 16) / 2) - (p.y - 10)) > 20) continue; p.rampHit.add(e);
        api.hurtAs('dash', e, Math.round(api.swordDmg() * api.amul('bzRampage')), p.x, false); if (smallFoe(e, api.knockSkip)) { e.vx = p.face * 220; e.vy = -140; e.stagger = Math.max(e.stagger || 0, 0.8); } api.sparks(e.x, e.y - (e.h || 16) / 2, p.face, 6); api.hitstop(0.03); }
      if (api.isSolid(Math.floor((p.x + p.face * 8) / api.TS), Math.floor((p.y - 8) / api.TS))) p.rampT = 0; }
    if (p.hatchets && p.hatchets.length) { for (const h of p.hatchets) { h.life -= dt; h.vy += 300 * dt; h.x += h.vx * dt; h.y += h.vy * dt; h.spin += dt * 20;
        if (api.isSolid(Math.floor(h.x / api.TS), Math.floor(h.y / api.TS))) h.life = 0;
        for (const e of api.enemies) { if (h.life <= 0 || !e.alive || e.harmless || e.gone > 0 || h.hit.has(e) || !api.overlap({ l: h.x - 4, r: h.x + 4, t: h.y - 4, b: h.y + 4 }, api.box(e))) continue; h.hit.add(e);
          api.hurtAs('shot', e, Math.round(api.swordDmg() * 1.2 * api.amul('bzStorm')), h.x - Math.sign(h.vx) * 10, false); api.sparks(e.x, e.y - (e.h || 16) / 2, Math.sign(h.vx), 4); } }
      p.hatchets = p.hatchets.filter(h => h.life > 0); } }

  /* ---- DRAWN (after the hero): the axe in flight or on the ground, the hatchets, the frenzy's glow, the crossed axes, a rend's notches, a partner's haste ---- */
  function drawAxeAt(g, x, y, ang, dim) { const c = Math.cos(ang), s = Math.sin(ang), P2 = (u, v, col) => { g.fillStyle = col; g.fillRect(Math.round(x + u * c - v * s), Math.round(y + u * s + v * c), 1, 1); };
    for (let u = -4; u <= 3; u++) P2(u, 0, '#7a5230');
    for (const [u, v] of [[3, 1], [4, 1], [3, 2], [4, 2], [5, 2], [2, 2]]) P2(u, v, dim ? '#7a828e' : '#aab4c2');
    for (const u of [2, 3, 4, 5]) P2(u, 3, '#eef4fa'); }
  function draw(g, cx, cy) { const p = P();
    if (!api.isBz()) { if (p.hasteT > 0 && Math.random() < 0.3) api.parts.push({ x: p.x + (Math.random() - 0.5) * 10, y: p.y - 2, vx: -p.face * 20, vy: -10, life: 0.25, max: 0.25, col: '#ff9a5c', size: 1, grav: 0 }); return; }   /* a partner his war cry reached */
    const a = p.bzAxe; if (a && a.state !== 'gone') { const ang = a.state === 'fly' || a.state === 'back' ? a.spin : a.state === 'stuck' ? (a.vx >= 0 ? 0.4 : 2.7) : 0.15;
      drawAxeAt(g, a.x - cx, a.y - cy, ang, false);
      if (a.state === 'lie' || a.state === 'stuck') { const k = 0.5 + 0.5 * Math.sin(api.time * 6); g.globalAlpha = 0.35 + 0.35 * k; g.fillStyle = '#fff6c8'; g.fillRect(Math.round(a.x - cx) + 2, Math.round(a.y - cy) - 4, 1, 1); g.fillRect(Math.round(a.x - cx) + 1, Math.round(a.y - cy) - 3, 3, 1); g.globalAlpha = 1; } }   /* THE GLINT: here it is - go and get it */
    for (const h of p.hatchets || []) drawAxeAt(g, h.x - cx, h.y - cy, h.spin, true);
    if (api.isBz() && (p.rage || 0) >= BZ.rage.high && !p.dead && (p.ground || p.swim) && Math.random() < 0.06 * (p.frenzyT > 0 ? 2 : 1)) api.parts.push({ x: p.x + p.face * 6, y: p.y - 16, vx: p.face * (6 + Math.random() * 6), vy: -10 - Math.random() * 6, life: 0.7, max: 0.7, col: '#d8d4d0', size: 1, grav: -8 });   /* (claude/bzart) STEAM BREATH: raging, his breath smokes */
    if (p.frenzyT > 0) { const k = 0.5 + 0.5 * Math.sin(api.time * 14), x = Math.round(p.x - cx), y = Math.round(p.y - cy); g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.16 + 0.1 * k; g.fillStyle = '#ff3a2a';
      g.beginPath(); g.ellipse(x, y - 11, 11 + 2 * k, 15 + 2 * k, 0, 0, Math.PI * 2); g.fill(); g.restore(); }
    /* REND (claude/bzart): the NOTCHES on the foe he is cutting - a stack is a diagonal gash cut into its body (dark, with a raw red edge and a bright nick), the next one further down
       the flank, fading in the last half second of the stack's life; the fourth is the crack, below */
    const re = p.bzRendE; if (p.frenzyT > 0 && re && re.alive && (p.bzRendN || 0) > 0 && api.time - (p.bzRendAt ?? -99) <= BZ.rend.decay) { const left = BZ.rend.decay - (api.time - p.bzRendAt), eh = re.h || 16, sd = Math.sign(p.x - re.x) || -p.face;
      g.globalAlpha = Math.min(1, left * 2.5);
      for (let i = 0; i < p.bzRendN; i++) { const x0 = Math.round(re.x - cx) + sd * Math.min(4, (re.w || 12) / 3) - 3 + i * 2, y0 = Math.round(re.y - cy) - eh + 3 + i * Math.max(2, Math.floor(eh / 5));
        for (let k = 0; k < 4; k++) { g.fillStyle = '#2a0a08'; g.fillRect(x0 + k, y0 + k, 1, 1); g.fillStyle = '#ff4a3a'; g.fillRect(x0 + k + 1, y0 + k, 1, 1); }
        g.fillStyle = '#ffd0b0'; g.fillRect(x0 + 3, y0 + 3, 1, 1); }
      g.globalAlpha = 1; }
    /* CRACKED (claude/bzart): the armour splits - a jagged crack runs across the foe from the blow, three shards of it fly off, and the foe's outline flares orange for a moment */
    const ce = p.bzCrackE, ct = api.time - (p.bzCrackAt ?? -99); if (ce && ct >= 0 && ct < 0.55) { const eh = ce.h || 16, ex = Math.round(ce.x - cx), ey = Math.round(ce.y - cy) - Math.round(eh / 2), a = 1 - ct / 0.55;
      g.globalAlpha = Math.min(1, a * 1.6);
      const zig = [[0, -5], [1, -4], [0, -3], [2, -2], [1, -1], [3, 0], [2, 1], [4, 2], [3, 3], [4, 4]];
      for (const [zx, zy] of zig) { g.fillStyle = '#2a0a08'; g.fillRect(ex - 2 + zx, ey + zy, 2, 1); g.fillStyle = zx % 2 ? '#ffd36b' : '#ff6b4a'; g.fillRect(ex - 2 + zx, ey + zy, 1, 1); }
      for (let i = 0; i < 3; i++) { const dx = (i - 1) * (6 + ct * 40) + (i === 1 ? 0 : 0), dy = -ct * 26 + ct * ct * 70 * (i + 1) / 2; g.fillStyle = i === 1 ? '#fff6c8' : '#ff9a5c'; g.fillRect(ex + Math.round(dx), ey + Math.round(dy) - 2, 2, 2); }
      g.globalAlpha = 1; }
    /* TAKE IT: the crossed axes' arc in front of him - bright on the beat (placeholder for the take-it frames) */
    /* TAKE IT (claude/bzart): where the crossed axes bite there is a mark - held, a small orange cross of sparks that flickers; ON THE BEAT a gold-and-white starburst that grows for the beat's length (the parry) */
    if (takeUp(p)) { const x = Math.round(p.x - cx) + p.face * 11, y = Math.round(p.y - cy) - 13, beat = onBeat(p), px1 = (u, v, col) => { g.fillStyle = col; g.fillRect(x + u * p.face - (p.face < 0 ? 1 : 0), y + v, 1, 1); };
      if (beat) { const k = Math.min(1, (api.time - (p.bzTakeAt ?? api.time)) / Math.max(0.05, beatLen())), r = 2 + Math.round(k * 3);
        px1(0, 0, '#ffffff'); for (let i = 1; i <= r; i++) { const c2 = i < 3 ? '#fff6c8' : '#ffd36b'; px1(i, 0, c2); px1(-i, 0, c2); px1(0, i, c2); px1(0, -i, c2); }
        px1(r, r, '#ffd36b'); px1(-r, r, '#ffd36b'); px1(r, -r, '#ffd36b'); px1(-r, -r, '#ffd36b'); }
      else if (Math.floor(api.time * 18) % 2) { px1(0, 0, '#ffb070'); px1(1, 0, '#ff9a5c'); px1(-1, 0, '#ff9a5c'); px1(0, 1, '#ff9a5c'); px1(0, -1, '#ff9a5c'); } }
    if (p.hardenT > 0 && Math.random() < 0.25) api.parts.push({ x: p.x + (Math.random() - 0.5) * 10, y: p.y - 6 - Math.random() * 14, vx: 0, vy: -8, life: 0.3, max: 0.3, col: '#8a5a3a', size: 1, grav: 0 });
    if (p.standT > 0) { g.globalAlpha = 0.25 + 0.15 * Math.sin(api.time * 10); g.strokeStyle = '#ff4a3a'; g.beginPath(); g.arc(Math.round(p.x - cx), Math.round(p.y - cy) - 12, 15, 0, 7); g.stroke(); g.globalAlpha = 1; } }
  function clear() { const p = P(); p.bzAxe = null; p.hatchets = []; p.braceT = 0; p.braceRec = 0; p.frenzyT = 0; p.spinT = 0; p.cleaveT = 0; p.rampT = 0; p.hardenT = 0; p.standT = 0; p.bzIronT = 0; p.bzUnbowedUsed = false; p.bzChainN = 0;
    p.bzRendE = null; p.bzRendN = 0; p.bzHealAcc = 0; }
  const read = () => { const p = P(); return { rage: +(p.rage || 0).toFixed(1), frenzyT: +(p.frenzyT || 0).toFixed(2), braceT: p.braceT || 0, braceRec: p.braceRec || 0, takeUp: takeUp(p), onBeat: onBeat(p), axe: p.bzAxe ? { state: p.bzAxe.state, x: Math.round(p.bzAxe.x), y: Math.round(p.bzAxe.y) } : null,
    oneHanded: !!p.bzAxe, chain: p.bzChainN || 0, rendN: p.bzRendN || 0, workT: p.workT || 0, coilT: p.coilT || 0, whetT: p.whetT || 0, pounceT: p.pounceT || 0, pounceRec: p.pounceRec || 0, hasteT: p.hasteT || 0,
    swingMul: +swingMul().toFixed(3), takeMul: +takeMul().toFixed(3), armoured: armoured(), stats: { ...stats } }; };
  return { BZ, tierStat: n => { stats['tier' + n] = (stats['tier' + n] || 0) + 1; }, swingMul, oneHanded, dealt, rend, chopLanded, chopStart, took, takeMul, lethal, armoured, takeTakes, braceTakes: takeTakes, takeUp: () => takeUp(P()), onBeat: () => onBeat(P()),
    throwAxe: () => throwAxe(P()), recall: () => recall(P()), frenzy: () => frenzy(P(), true),
    update, kit, kitStep, draw, clear, read, raging: () => raging(P()), resetStats: () => { for (const k in stats) stats[k] = 0; }, canThrowMedium: e => canThrowMedium(P(), e) };
}
