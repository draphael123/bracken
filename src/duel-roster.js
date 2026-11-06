// src/duel-roster.js - DUEL (BETA) ROSTER PICK SCREEN (claude/duelroster, Daniel 11-06: "SMASH-BROS-STYLE ROSTER PICK SCREEN").
// A grid of the EXISTING hero art + a RANDOM '?' tile; every seat (2-4) has its own coloured cursor (keys, pad or the mouse for player one), a big portrait + name,
// HUMAN / BOT seats with a skill per bot and a team per seat when teams are on, the match options on a RULES tab, every seat READY -> FIGHT banner -> begin.
// It owns NO rules: every change goes through the duel's settings API (getSettings / setSettings / setSeat / setSeatCount / cycleOpt, src/pvp-duel.js), so what
// is picked here is remembered and is exactly what begin({ settings }) runs. The file has no imports (the duel hands it a small ctx), so node can drive it.
//
// ctx: { heroes: [ids on the grid], heroName(h), owns(h) (may player one wear him), humans() -> [{ n, ai, hero }] (seats of people, in order),
//        colourOf(n) -> { c }, getSettings, setSettings, setSeat, setSeatCount, cycleOpt(id, dir), submit(settings), close(), sfx(k),
//        text(s, x, y, col, align, size), board(x, y, w, h), icon(hero, x, y, cw, ch, k, alpha) (the hero idle crop, scaled by k), rect(x, y, w, h, col), frame(x, y, w, h, col), fit(s, maxW, size), inkW(s, size),
//        key(action) -> the player's own label for jump / atk / dodge / talk }
export const TEAM_COL = { 1: '#6ec1ff', 2: '#ff9a6e' };
export const GRID_COLS = 5;
export const SEAT_ROWS = ['HERO', 'TYPE', 'SKILL', 'TEAM'];
export const RULE_ROWS = ['lives', 'health', 'stamina', 'rounds', 'timeLimit', 'level', 'teams'];
export const RULE_NAME = { lives: 'LIVES', health: 'HEALTH', stamina: 'STAMINA', rounds: 'ROUNDS', timeLimit: 'ROUND TIME', level: 'LEVEL', teams: 'TEAMS' };
export const RULE_FMT = {
  lives: v => String(v), health: v => v + '%', stamina: v => v === 'unlimited' ? 'UNLIMITED' : 'NORMAL', rounds: v => 'BEST OF ' + v,
  timeLimit: v => v ? v + ' S, THEN 1 HIT' : 'OFF', level: v => v === 'your' ? 'YOUR LEVEL' : 'EVEN - LEVEL 1', teams: v => v ? '2 VS 2' : 'OFF',
};
export const FIGHT_BANNER_S = 1.3;
const SKILLS = ['easy', 'normal', 'hard'];

export function makeRoster(ctx) {
  const R = { open: false, tab: 0, cur: new Map(), ready: new Map(), fightT: 0, rrow: 0, msg: '', msgT: 0, hits: [], seatsBox: null };
  const N = () => ctx.heroes.length;                  /* tile N is the '?' */
  const humans = () => ctx.humans();
  const seatOfHuman = p => humans().findIndex(q => q.n === p.n);
  const key = k => (k + 1);                           /* a seat's colour key (seat 1 = player one) */
  const cur = p => { let c = R.cur.get(p.n); if (!c) { c = { idx: 0, drive: -1, focus: 'grid', scol: 0, srow: 0 }; R.cur.set(p.n, c); } return c; };
  const say = (m, t = 2.2) => { R.msg = m; R.msgT = t; };
  const isHumanSeat = (S, k) => k < humans().length;
  const seatHero = (S, k) => { const sp = S.seats[k]; if (!sp) return ''; if (sp.hero) return sp.hero; const h = humans()[k]; return h && !sp.isBot ? h.hero : ''; };   /* '' = a person as he is */
  const tileOf = hero => hero === 'random' ? N() : Math.max(0, ctx.heroes.indexOf(hero));
  const heroOfTile = i => i >= N() ? 'random' : ctx.heroes[i];
  const driveOf = p => { const c = cur(p); return c.drive >= 0 ? c.drive : seatOfHuman(p); };
  const isReady = (S, k) => { if (!isHumanSeat(S, k)) return true; const h = humans()[k]; return !!h.ai || !!R.ready.get(h.n); };
  const allReady = S => S.seats.every((_, k) => isReady(S, k));

  function open() {
    const S = ctx.getSettings(), hs = humans();
    R.open = true; R.tab = 0; R.fightT = 0; R.rrow = 0; R.msg = ''; R.msgT = 0; R.cur.clear(); R.ready.clear();
    hs.forEach((h, k) => { const c = cur(h); const sp = S.seats[k]; c.idx = tileOf(sp && sp.hero ? sp.hero : h.hero); });
    return true;
  }
  function close() { R.open = false; R.fightT = 0; R.hits = []; ctx.close(); }

  /* ---- the actions (the keys and the mouse both land here; each returns true if it did something) ---- */
  function pick(p, idx) {   /* the seat this cursor drives takes tile idx */
    const S = ctx.getSettings(), k = driveOf(p), c = cur(p); if (!S.seats[k]) return false;
    const hero = heroOfTile(idx), human = isHumanSeat(S, k);
    if (human && hero !== 'random' && k === 0 && !ctx.owns(hero)) { say(ctx.heroName(hero) + ' IS NOT YOURS YET'); ctx.sfx('buzz'); return false; }
    if (human && hero !== 'random') { for (let j = 0; j < humans().length; j++) if (j !== k && seatHero(S, j) === hero) { say(ctx.heroName(hero) + ' IS TAKEN'); ctx.sfx('buzz'); return false; } }
    ctx.setSeat(k, { hero });
    if (human) { R.ready.set(humans()[k].n, true); } else { say(ctx.heroName(hero === 'random' ? 'random' : hero) + ' FOR BOT ' + (k + 1)); }
    c.idx = idx; if (c.drive >= 0) { c.drive = -1; c.focus = 'strip'; c.srow = 0; c.scol = k; }
    ctx.sfx("uiSel"); if (human) checkFight(); return true;
  }
  function unready(p) { const h = humans()[seatOfHuman(p)]; if (h && R.ready.get(h.n)) { R.ready.set(h.n, false); R.fightT = 0; ctx.sfx('menuClose'); return true; } return false; }
  function checkFight() { const S = ctx.getSettings(); if (R.fightT <= 0 && R.tab === 0 && allReady(S)) { R.fightT = FIGHT_BANNER_S; ctx.sfx('bell'); } }
  function seatEdit(p, k, row) {   /* player one's seat-strip actions: row of SEAT_ROWS on seat k */
    const S = ctx.getSettings(), c = cur(p), n = S.seats.length;
    if (row === 'HERO') { if (k >= n) return false; c.drive = k; c.focus = 'grid'; const sp = S.seats[k]; c.idx = tileOf(seatHero(S, k) || 'random'); say(isHumanSeat(S, k) ? 'PICK FOR THIS SEAT' : 'PICK A HERO FOR BOT ' + (k + 1)); ctx.sfx('ui'); return true; }
    if (row === 'TYPE') {
      if (k === n && n < 4) { ctx.setSeatCount(n + 1); ctx.sfx('uiSel'); return true; }
      if (k === n - 1 && k >= humans().length && n > 2 && !S.teams) { ctx.setSeatCount(n - 1); ctx.sfx('menuClose'); return true; }
      say(isHumanSeat(S, k) ? 'FRIENDS JOIN THE PARTY AT THE INN' : S.teams ? 'TEAMS NEED FOUR SEATS' : 'NEED TWO FIGHTERS'); ctx.sfx('buzz'); return false;
    }
    const sp = S.seats[k]; if (!sp) return false;
    if (row === 'SKILL') { if (!sp.isBot) { ctx.sfx('buzz'); return false; } ctx.setSeat(k, { botDifficulty: SKILLS[(SKILLS.indexOf(sp.botDifficulty) + 1) % 3] }); ctx.sfx('equip'); return true; }
    if (row === 'TEAM') { if (!S.teams) { say('TURN TEAMS ON IN RULES'); ctx.sfx('buzz'); return false; } ctx.setSeat(k, { team: sp.team === 1 ? 2 : 1 }); ctx.sfx('equip'); return true; }
    return false;
  }
  function ruleStep(id, dir) { const ok = ctx.cycleOpt(id, dir); if (ok) { ctx.sfx('equip'); R.fightT = 0; } return ok; }
  function setTab(t) { R.tab = t; R.fightT = 0; ctx.sfx('ui'); }
  function back(p) {   /* BACK / ESC: un-ready, leave the seat strip, leave RULES, then leave the screen (player one only) */
    if (R.fightT > 0) { R.fightT = 0; unready(p); return true; }
    if (unready(p)) return true;
    const c = cur(p);
    if (R.tab === 1) { setTab(0); return true; }
    if (c.focus === 'strip' || c.drive >= 0) { c.focus = 'grid'; c.drive = -1; ctx.sfx('menuClose'); return true; }
    if (seatOfHuman(p) === 0) { close(); ctx.sfx('menuClose'); return true; }
    return false;
  }

  /* ---- keys: called once a frame per seat in his own pass; true = the roster took his keys ---- */
  function hands(p, pr, keys) {
    if (!R.open) return false;
    const k = seatOfHuman(p); if (k < 0) return false;
    const eat = () => { for (const q in pr) pr[q] = false; for (const q of ['left', 'right', 'up', 'down', 'jump', 'atk', 'dodge', 'block', 'throw']) if (keys) keys[q] = false; return true; };
    const c = cur(p), S = ctx.getSettings(), N1 = N() + 1, boss = k === 0;
    if (R.fightT > 0) { if (pr.dodge || pr.talk) back(p); return eat(); }
    if (pr.dodge) { back(p); return eat(); }
    if (boss && pr.talk) { setTab(R.tab ? 0 : 1); return eat(); }
    if (R.tab === 1) {   /* RULES: player one's */
      if (boss) {
        if (pr.down) { R.rrow = (R.rrow + 1) % RULE_ROWS.length; ctx.sfx('ui'); }
        if (pr.up) { R.rrow = (R.rrow + RULE_ROWS.length - 1) % RULE_ROWS.length; ctx.sfx('ui'); }
        if (pr.left) ruleStep(RULE_ROWS[R.rrow], -1); else if (pr.right || pr.jump || pr.atk) ruleStep(RULE_ROWS[R.rrow], 1);
      }
      return eat();
    }
    if (c.focus === 'grid') {
      if (pr.left) { c.idx = (c.idx + N1 - 1) % N1; ctx.sfx('ui'); }
      if (pr.right) { c.idx = (c.idx + 1) % N1; ctx.sfx('ui'); }
      if (pr.up && c.idx >= GRID_COLS) { c.idx -= GRID_COLS; ctx.sfx('ui'); }
      if (pr.down) { if (c.idx + GRID_COLS < N1) { c.idx += GRID_COLS; ctx.sfx('ui'); } else if (boss) { c.focus = 'strip'; c.srow = 0; c.scol = Math.min(driveOf(p), S.seats.length); ctx.sfx('ui'); } }
      if (pr.jump || pr.atk) pick(p, c.idx);
      return eat();
    }
    /* the seat strip (player one) */
    if (pr.left) { c.scol = (c.scol + (S.seats.length < 4 ? S.seats.length + 1 : S.seats.length) - 1) % (S.seats.length < 4 ? S.seats.length + 1 : S.seats.length); ctx.sfx('ui'); }
    if (pr.right) { c.scol = (c.scol + 1) % (S.seats.length < 4 ? S.seats.length + 1 : S.seats.length); ctx.sfx('ui'); }
    if (pr.up) { if (c.srow === 0) { c.focus = 'grid'; c.drive = -1; } else c.srow--; ctx.sfx('ui'); }
    if (pr.down) { c.srow = Math.min(SEAT_ROWS.length - 1, c.srow + 1); ctx.sfx('ui'); }
    if (pr.jump || pr.atk) seatEdit(p, c.scol, SEAT_ROWS[c.srow]);
    return eat();
  }

  /* ---- the mouse (player one) ---- */
  function mouse(x, y, down) {
    if (!R.open || R.fightT > 0) return false;
    const p = humans()[0]; if (!p) return false;
    let hit = null; for (let i = R.hits.length - 1; i >= 0; i--) { const h = R.hits[i]; if (x >= h.x && x < h.x + h.w && y >= h.y && y < h.y + h.h) { hit = h; break; } }
    if (!hit) return false;
    const c = cur(p);
    if (!down) { if (hit.k === 'tile' && c.focus === 'grid' && R.tab === 0) c.idx = hit.i; return true; }
    if (hit.k === 'tab') setTab(hit.i);
    else if (hit.k === 'tile') { c.focus = 'grid'; pick(p, hit.i); }
    else if (hit.k === 'seat') { c.focus = 'strip'; c.scol = hit.seat; c.srow = SEAT_ROWS.indexOf(hit.row); seatEdit(p, hit.seat, hit.row); }
    else if (hit.k === 'rule') { R.rrow = hit.i; ruleStep(RULE_ROWS[hit.i], hit.dir || 1); }
    else if (hit.k === 'back') back(p);
    else return false;
    return true;
  }
  function esc() { const p = humans()[0]; if (p) back(p); }

  function tick(dt) {
    if (!R.open) return;
    R.msgT = Math.max(0, R.msgT - dt);
    const S = ctx.getSettings();
    if (R.fightT > 0) { if (!allReady(S)) { R.fightT = 0; return; } R.fightT -= dt; if (R.fightT <= 0) { R.fightT = 0; R.open = false; R.hits = []; ctx.submit(S); } }
  }

  /* ---- drawing ---- */
  function seatLabel(S, k) { const h = humans()[k]; return !isHumanSeat(S, k) ? 'BOT ' + (k + 1) : h && h.ai ? 'AI' : 'P' + (h ? h.n : k + 1); }
  function draw(VW, VH) {
    if (!R.open) return;
    const T = ctx.text, S = ctx.getSettings(), hs = humans(), N0 = N(); R.hits = [];
    const bx = 3, by = 3, bw = VW - 6, bh = VH - 6; ctx.board(bx, by, bw, bh);
    T('DUEL (BETA)', 10, 8, '#ffd36b', 'left', 8);
    const tw = 54; for (let t = 0; t < 2; t++) { const x = VW - 10 - (2 - t) * (tw + 2) + 2, on = R.tab === t; ctx.rect && ctx.rect(x, 6, tw, 12, on ? '#4a4431' : '#201e2c'); T(t ? 'RULES' : 'FIGHTERS', x + tw / 2, 9, on ? '#a8e06e' : '#8a8f80', 'center', 6); R.hits.push({ k: 'tab', i: t, x, y: 6, w: tw, h: 12 }); }
    const k1 = a => ctx.key(a);
    if (R.tab === 1) { drawRules(VW, VH, S); }
    else {
      /* the grid */
      const x0 = 10, y0 = 24, tw2 = 26, th = 26, gap = 3, p1 = hs[0], c1 = p1 ? cur(p1) : { idx: 0 };
      for (let i = 0; i <= N0; i++) {
        const x = x0 + (i % GRID_COLS) * (tw2 + gap), y = y0 + Math.floor(i / GRID_COLS) * (th + gap), hero = heroOfTile(i), locked = hero !== 'random' && !ctx.owns(hero);
        ctx.rect && ctx.rect(x, y, tw2, th, '#1b1826'); R.hits.push({ k: 'tile', i, x, y, w: tw2, h: th });
        if (hero === 'random') T('?', x + tw2 / 2, y + 5, '#ffd36b', 'center', 16); else { const a = locked ? 0.35 : 1; ctx.icon(hero, x + 4, y + 3, 18, 20, 1, a); if (locked) T('LOCK', x + tw2 / 2, y + th - 8, '#8a8f80', 'center', 6); }
        /* tokens: every seat that holds this hero wears a small tag in its colour (bots too) */
        let tk = 0; S.seats.forEach((sp, k) => { const h = seatHero(S, k) || (sp.isBot ? 'random' : ''); if (h === hero && (isHumanSeat(S, k) ? isReady(S, k) || k === 0 : true)) { const col = ctx.colourOf(key(k)).c; ctx.rect && ctx.rect(x + 1 + (tk % 2) * 8, y + th - 6 + 0, 7, 5, col); tk++; } });
        /* cursors: a frame in the owner's colour, inset per seat so four can share a tile */
        hs.forEach((h, k) => { const c = cur(h); if (c.focus === 'grid' && c.idx === i) { const col = ctx.colourOf(h.n).c; ctx.frame && ctx.frame(x - 1 + k, y - 1 + k, tw2 + 2 - 2 * k, th + 2 - 2 * k, col); T(seatLabel(S, k), x + 1 + k * 8, y - 7, col, 'left', 6); } });
      }
      /* what player one is looking at, the rules in one line, who is ready */
      const hoverName = c1.idx >= N0 ? 'RANDOM HERO' : ctx.heroName(heroOfTile(c1.idx));
      T(ctx.fit(hoverName, 140, 8), x0 + 72, 24 + 2 * (th + gap) + 2, '#fff6e0', 'center', 8);
      const sum = S.rounds + ' RND  ' + S.lives + ' LIFE  ' + S.health + '% HP  ' + (S.teams ? '2V2  ' : '') + (S.level === 'your' ? 'YOUR LV' : 'EVEN LV1');
      T(ctx.fit(sum, 146, 6), x0 + 72, 24 + 2 * (th + gap) + 14, '#9aa39a', 'center', 6);
      let yy = 24 + 2 * (th + gap) + 25;
      S.seats.forEach((sp, k) => { if (yy > VH - 40) return; const col = ctx.colourOf(key(k)).c, rd = isReady(S, k), h = seatHero(S, k) || 'random'; T(ctx.fit(seatLabel(S, k) + ' ' + (h === 'random' ? 'RANDOM' : ctx.heroName(h)), 100, 6), x0, yy, col, 'left', 6); T(rd ? 'READY' : isHumanSeat(S, k) ? 'PICKING' : '', x0 + 146, yy, rd ? '#a8e06e' : '#c2c9c2', 'right', 6); yy += 8; });
      /* the seat cards */
      const sx = 164, sw = 37, sy = 22, nn = S.seats.length; R.seatsBox = { x: sx, y: sy };
      const cn = nn < 4 ? nn + 1 : nn;
      for (let k = 0; k < cn; k++) {
        const x = sx + k * (sw + 1), add = k >= nn, sp = S.seats[k], col = add ? '#5a5f58' : ctx.colourOf(key(k)).c;
        ctx.rect && ctx.rect(x, sy, sw, 100, '#1b1826');
        if (add) { T('+ BOT', x + sw / 2, sy + 4, col, 'center', 6); T('+', x + sw / 2, sy + 26, '#8a8f80', 'center', 16); R.hits.push({ k: 'seat', seat: k, row: 'TYPE', x, y: sy, w: sw, h: 100 }); }
        else {
          const rd = isReady(S, k), h = seatHero(S, k) || (sp.isBot ? 'random' : ''), shown = h || 'random';
          T(seatLabel(S, k), x + 2, sy + 2, col, 'left', 6); if (rd && isHumanSeat(S, k)) T('OK', x + sw - 2, sy + 2, '#a8e06e', 'right', 6);
          if (shown === 'random') T('?', x + sw / 2, sy + 18, '#ffd36b', 'center', 16); else ctx.icon(shown, x + 0, sy + 10, 18, 20, 2, 1);
          const rows = [ctx.fit(shown === 'random' ? 'RANDOM' : ctx.heroName(shown), sw - 2, 6), isHumanSeat(S, k) ? (hs[k] && hs[k].ai ? 'AI' : 'HUMAN') : 'BOT', sp.isBot ? sp.botDifficulty.toUpperCase() : '-', S.teams ? 'TEAM ' + sp.team : '-'];
          rows.forEach((r, j) => { const yy2 = sy + 52 + j * 11, sel = p1 && cur(p1).focus === 'strip' && cur(p1).scol === k && cur(p1).srow === j, drv = j === 0 && p1 && driveOf(p1) === k && cur(p1).drive >= 0;
            if (sel || drv) ctx.rect && ctx.rect(x + 1, yy2 - 2, sw - 2, 10, '#4a4431');
            T(r, x + sw / 2, yy2, j === 3 && S.teams ? TEAM_COL[sp.team] : sel || drv ? '#fff6e0' : '#c2c9c2', 'center', 6); R.hits.push({ k: 'seat', seat: k, row: SEAT_ROWS[j], x, y: yy2 - 2, w: sw, h: 11 }); });
        }
      }
      /* help in the player's own keys */
      T(ctx.fit('ARROWS: MOVE   ' + k1('jump') + ': PICK = READY   ' + k1('dodge') + ': BACK   ' + k1('talk') + ': RULES', VW - 20, 6), VW / 2, VH - 24, '#8a8f80', 'center', 6);
      T(ctx.fit('DOWN FROM THE GRID: SEATS (BOT SKILL, TEAM, +BOT)   ESC: LEAVE', VW - 20, 6), VW / 2, VH - 16, '#8a8f80', 'center', 6);
    }
    if (R.msgT > 0 && R.msg) T(ctx.fit(R.msg, VW - 20, 6), VW / 2, VH - 32, '#ffd36b', 'center', 6);
    if (R.fightT > 0) {
      ctx.rect && ctx.rect(0, VH / 2 - 22, VW, 44, 'rgba(10,8,16,0.9)');
      T('FIGHT!', VW / 2, VH / 2 - 16, '#ffd36b', 'center', 16);
      const names = S.seats.map((sp, k) => { const h = seatHero(S, k) || 'random'; return h === 'random' ? '?' : ctx.heroName(h); });
      T(ctx.fit(names.join(S.teams ? '  /  ' : '  VS  '), VW - 20, 6), VW / 2, VH / 2 + 6, '#fff6e0', 'center', 6);
      T(ctx.fit(k1('dodge') + ': BACK OUT', VW - 20, 6), VW / 2, VH / 2 + 15, '#8a8f80', 'center', 6);
    }
  }
  function drawRules(VW, VH, S) {
    const T = ctx.text, x = 20, w = VW - 40; let y = 28;
    T('MATCH RULES', x, y - 6, '#9aa39a', 'left', 6);
    RULE_ROWS.forEach((id, i) => { const sel = R.rrow === i, yy = y + 6 + i * 13;
      if (sel) ctx.rect && ctx.rect(x - 4, yy - 3, w + 8, 12, '#4a4431');
      T((sel ? '> ' : '  ') + RULE_NAME[id], x, yy, sel ? '#a8e06e' : '#c2c9c2', 'left', 8);
      T('< ' + ctx.fit(RULE_FMT[id](S[id]), 110, 8) + ' >', x + w, yy, sel ? '#fff6e0' : '#c2c9c2', 'right', 8);
      R.hits.push({ k: 'rule', i, dir: 1, x: x - 4, y: yy - 3, w: w + 8, h: 12 }); });
    T(ctx.fit('UP/DOWN: ROW   LEFT/RIGHT: CHANGE   ' + ctx.key('talk') + ': BACK TO FIGHTERS', VW - 20, 6), VW / 2, VH - 16, '#8a8f80', 'center', 6);
  }
  const state = () => ({ open: R.open, tab: R.tab, fightT: R.fightT, rrow: R.rrow, ready: Object.fromEntries(R.ready), cur: Object.fromEntries([...R.cur].map(([n, c]) => [n, { ...c }])), hits: R.hits.length, msg: R.msg });
  return { open, close, hands, mouse, esc, tick, draw, pick, seatEdit, state, isOpen: () => R.open, R };
}
