// tools/lancebot.js — fights the Queen's Lance the way the arena signs teach it, and reports how it went.
// In the page: const { fightLance } = await import('/tools/lancebot.js'); fightLance(window.BK, { parry: true })
// opts: god (no damage - note it also skips the block check, so no parries), parry (block his thrusts and
// rushes; otherwise jump the rush), secs (cap), startHp (set his health once he wakes, to test phase two), trace
export function fightLance(B, opts = {}) {
  B.start(); B.load(LEVEL_INDEX(B)); B.step(2); B.reset(); B.god = !!opts.god;
  B.tp(306, 29); B.step(2); B.tp(311, 29);
  const OPEN = m => ['planted', 'thrust', 'sweep', 'guardSwing', 'reel', 'stumble', 'recover', 'javThrow'].includes(m);
  const K = B.keys;
  const st = { frames: 0, hits: 0, deaths: 0, windows: 0, used: 0, plantDist: [], modes: {}, hitsTaken: 0, p2at: null, falls: 0, dmgBy: {} };
  const hist = []; let firstFall = null;
  let lastMode = '', lastHp = null, inWin = false, hitWin = false, wasDead = false, lastPhp = B.P.hp, airDir = null;
  for (let f = 0; f < 60 * (opts.secs || 100); f++) {
    const b = B.boss; if (!b || !b.alive) break;
    if (opts.startHp && !st.set && b.mode === 'pace') { b.hp = opts.startHp; st.set = true; }
    if (lastHp === null || st.set === true) { lastHp = b.hp; if (st.set === true) st.set = 1; }
    if (b.phase === 2 && st.p2at === null) st.p2at = +(f / 60).toFixed(1);
    const d = b.x - B.P.x, ad = Math.abs(d), dir = Math.sign(d) || 1;
    K.left = K.right = false; K.jump = false; K.block = false;
    if (b.mode !== lastMode) { st.modes[b.mode] = (st.modes[b.mode] || 0) + 1; if (b.mode === 'planted') st.plantDist.push(Math.round(ad / 16)); lastMode = b.mode; }
    const open = OPEN(b.mode);
    if (open && !inWin) { inWin = true; hitWin = false; st.windows++; } if (!open && inWin) { inWin = false; if (hitWin) st.used++; }
    let jump = false;
    if (b.mode === 'charge' && Math.sign(b.vx) === -dir && ad < 64) jump = true;
    else if (b.mode === 'rush' && ad < 56 && !opts.parry) jump = true;
    else if (['thrustTell', 'thrust', 'rushTell', 'rush', 'guardTell', 'guardSwing'].includes(b.mode) && opts.parry && ad < 110) { K.block = true; B.P.face = dir; } // turn and take it on the shield
    else if (b.mode === 'sweepTell' && ad < 60) jump = true;
    // the shield bash: no blocking a shield, so get out from in front of it (roll away)
    else if ((b.mode === 'bashTell' || b.mode === 'bash') && ad < 64) { K[dir > 0 ? 'left' : 'right'] = true; if (b.mode === 'bashTell' && ad < 46 && B.P.ground) { B.P.face = -dir; B.press('dodge'); } }
    // the vault: be somewhere else when he comes down, and hop the wave the landing throws
    else if (b.mode === 'vaultTell' || b.mode === 'vault') { const away = Math.sign(B.P.x - (b.tx ?? b.x)) || -dir; K[away > 0 ? 'right' : 'left'] = true; }
    // the javelins land where you were and a stride either side: close the distance under them
    else if (b.mode === 'javTell') K[dir > 0 ? 'right' : 'left'] = true;
    else if (open) { if (ad > 18) K[dir > 0 ? 'right' : 'left'] = true; if (ad < 30 && f % 9 === 0) B.press('atk'); }
    else if (b.phase === 1) { const want = 100; if (ad < want - 10) K[dir > 0 ? 'left' : 'right'] = true; else if (ad > want + 30) K[dir > 0 ? 'right' : 'left'] = true; }
    else if (b.mode === 'guardTell') K[dir > 0 ? 'left' : 'right'] = true; // step out of the swing
    else { if (ad > 46) K[dir > 0 ? 'right' : 'left'] = true; else if (ad < 34) K[dir > 0 ? 'left' : 'right'] = true; }
    // backed into a wall: go over him, not into the wall (only his weapon hurts, not his body)
    { const A = B.L.arena, cornered = (dir > 0 && B.P.x - A.x0 < 44) || (dir < 0 && A.x1 - B.P.x < 44);
      if (cornered && ad < 60 && B.P.ground && !open && b.mode !== 'charge') { K.left = dir < 0; K.right = dir > 0; K.block = false; jump = true; } }
    for (const w of (B.waves ? (typeof B.waves === 'function' ? B.waves() : B.waves) : [])) if (Math.abs(w.x - B.P.x) < 34 && Math.sign(B.P.x - w.x) === w.dir && B.P.ground) jump = true;
    if (!B.P.ground && airDir) { K.left = airDir === 'left'; K.right = airDir === 'right'; }
    const mv = K.right ? 1 : K.left ? -1 : 0;
    // a hole ahead of your feet: jump it, like anyone would
    if (mv && B.P.ground) { const ty = Math.floor((B.P.y + 1) / 16); for (const ahead of [6, 12]) { const tx = Math.floor((B.P.x + mv * ahead) / 16); if (B.L.grid[ty * B.L.W + tx] === 0) jump = true; } }
    if (jump && B.P.ground) { K.jump = true; B.press('jump'); airDir = mv > 0 ? 'right' : mv < 0 ? 'left' : null; } else if (!B.P.ground) K.jump = true;
    if (B.P.ground) airDir = null;
    const wasHigh = B.P.y <= 31 * 16, mode = b.mode;
    B.step(1); st.frames++;
    if (opts.trace) { let deck = ''; const px = Math.floor(B.P.x / 16); for (let x = px - 8; x <= px + 8; x++) deck += x === px ? 'P' : B.L.grid[30 * B.L.W + x] === 0 ? '.' : '#';
      hist.push(`${(f / 60).toFixed(2)} ${mode.padEnd(10)} boss ${(b.x / 16).toFixed(1)} me ${(B.P.x / 16).toFixed(1)},${(B.P.y / 16).toFixed(2)} vx ${Math.round(B.P.vx)} hp ${B.P.hp} ${K.left ? 'L' : ''}${K.right ? 'R' : ''}${K.jump ? 'J' : ''}${K.block ? 'B' : ''} ${deck}`); if (hist.length > 40) hist.shift(); }
    if (wasHigh && B.P.y > 31 * 16) { st.falls++; if (opts.trace && !firstFall) firstFall = hist.slice(-30).join(' | '); }
    if (B.P.dead && !wasDead) st.deaths++; wasDead = !!B.P.dead;
    if (B.P.hp < lastPhp) { st.hitsTaken++; st.dmgBy[mode] = (st.dmgBy[mode] || 0) + (lastPhp - B.P.hp); } lastPhp = B.P.hp;
    if (b.hp < lastHp) { st.hits++; hitWin = true; } lastHp = b.hp;
  }
  K.left = K.right = K.jump = K.block = false;
  const b = B.boss;
  return { secs: +(st.frames / 60).toFixed(1), won: !b || !b.alive, hp: b && b.alive ? b.hp : 0, phase: b && b.phase, p2at: st.p2at,
    windows: st.windows, used: st.used, hits: st.hits, plantedAway: st.plantDist.slice(0, 10), deaths: st.deaths, falls: st.falls,
    hitsTaken: st.hitsTaken, dmgBy: st.dmgBy, modes: st.modes, firstFall };
}
const LEVEL_INDEX = () => 9; // STORMHOLD
