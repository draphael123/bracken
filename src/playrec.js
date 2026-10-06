// src/playrec.js - THE PLAYTEST RECORDER (claude/bot2, Daniel 10-05: "calibrate the bot to me").
//
// OFF BY DEFAULT. It is turned on by the page's own address (?rec=1, remembered on this machine until ?rec=0) or by SHIFT+F9 in play;
// a small red REC sits in the corner while it is on. It watches every BOSS AND MINI FIGHT and writes down what a bot would need to be
// compared with you: the boss, your hero, level and build, how long the fight ran, how it ended, every blow that hurt you (who threw it,
// which move, how much, guarded or not), every hit you landed (and whether he was OPEN), each opening he gave and whether you used it,
// and every skill you cast. Nothing about you is in it - no name, no save, no account - and NOTHING IS EVER SENT ANYWHERE: the log lives
// in this browser's own storage (localStorage 'bracken.playrec', the last 300 fights) and leaves it only as a FILE YOU SAVE YOURSELF:
// F9 downloads bracken-playtest-<date>.json. tools/bot-calibrate.mjs reads those files and fits the boss bot's profile (src/bot-profile.js)
// to them. CTRL+F9 clears the log (after the download, if you like a fresh one).
export const REC_KEY = 'bracken.playrec', REC_ON = 'bracken.rec', REC_CAP = 300, REC_VERSION = 1;
const store = (() => { try { return window.localStorage; } catch { return null; } })();
const read = () => { try { const a = JSON.parse((store && store.getItem(REC_KEY)) || '[]'); return Array.isArray(a) ? a : []; } catch { return []; } };
const write = a => { try { if (store) store.setItem(REC_KEY, JSON.stringify(a.slice(-REC_CAP))); } catch {} };
export const REC = {
  on: false, cur: null, msg: '', msgT: 0, saved: 0,
  init(search) {
    let on = false; try { on = !!store && store.getItem(REC_ON) === '1'; } catch {}
    const q = new URLSearchParams(search || ''); if (q.get('rec') === '1') on = true; if (q.get('rec') === '0') on = false;
    this.set(on, false); this.saved = read().length; return this.on;
  },
  set(on, say = true) { this.on = !!on; try { if (store) { if (this.on) store.setItem(REC_ON, '1'); else store.removeItem(REC_ON); } } catch {}
    if (!this.on) this.cur = null; if (say) this.note(this.on ? 'PLAYTEST RECORDER ON (F9 SAVES THE LOG)' : 'PLAYTEST RECORDER OFF'); },
  note(t) { this.msg = t; this.msgT = 2.5; },
  /* F9: save the log as a file. SHIFT+F9: recorder on/off. CTRL+F9: clear the log. Returns true when it used the key */
  key(e) { if (e.key !== 'F9') return false;
    if (e.shiftKey) { this.set(!this.on); return true; }
    if (e.ctrlKey) { write([]); this.saved = 0; this.note('PLAYTEST LOG CLEARED'); return true; }
    if (!this.on) return false; this.download(); return true; },
  log() { return read(); },
  download() { const a = read(); if (this.cur) a.push(this.snap(this.cur, 'in progress'));
    const body = JSON.stringify({ kind: 'bracken-playtest', version: REC_VERSION, savedAt: new Date().toISOString(), fights: a }, null, 1);
    try { const url = URL.createObjectURL(new Blob([body], { type: 'application/json' })), link = document.createElement('a');
      link.href = url; link.download = 'bracken-playtest-' + new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-') + '.json';
      document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
      this.note('SAVED ' + a.length + ' FIGHTS TO A FILE'); } catch { this.note('COULD NOT SAVE THE FILE'); } },
  /* ONE CALL A FRAME from main.js update(): it starts a fight when a boss (or a mini) wakes, and closes it when one of you falls */
  frame(c, dt) {
    if (this.msgT > 0) this.msgT -= dt;
    if (!this.on || c.state !== 'play') return;
    const P = c.P, foe = c.bossActive && c.boss && c.boss.alive ? c.boss : c.miniActive ? c.mini() : null;
    let F = this.cur;
    if (F && (F.foe !== foe && !(F.foe && !F.foe.alive) || c.levelId() !== F.level)) {   /* he went away (left the level, quit, a reset) */
      this.close(F, F.foe && !F.foe.alive ? 'win' : P.dead ? 'death' : 'left'); F = null; }
    if (!F && foe && !P.dead) F = this.cur = this.open(c, foe);
    if (!F) return;
    F.t += dt; F.real += dt / Math.max(0.05, c.SET.speed || 1);
    const e = F.foe, open = !!c.bossOpen(e);
    if (open && !F.wasOpen) F.openings.push({ at: +F.t.toFixed(2), used: false, dealt: 0 });
    F.wasOpen = open;
    if (e.hp < F.hpWas) { const d = F.hpWas - e.hp; F.hits++; F.dealt += d; if (open) { F.openHits++; const o = F.openings[F.openings.length - 1]; if (o) { o.used = true; o.dealt += d; } } }
    F.hpWas = e.hp;
    if (P.hp < F.pHpWas && !F.hurtThisFrame) this.hurtBy(F, 'other|fall-or-hazard', F.pHpWas - P.hp, 'hit');   /* a pit, a hazard: hurt without a blow */
    F.hurtThisFrame = false; F.pHpWas = P.hp;
    if (!e.alive) this.close(F, P.dead ? 'trade' : 'win');
    else if (P.dead) this.close(F, 'death');
  },
  open(c, foe) { const h = c.hero(), lv = c.heroLevel(), card = ((c.PROG.card || {})[h]) || null;
    return { foe, boss: foe.t, mini: !!foe.mini, level: c.levelId(), hero: h, heroLevel: lv, card: card ? { v: card.v || 0, e: card.e || 0, m: card.m || 0, perks: Object.values(card.ms || {}) } : null,
      loadout: (c.equipped() || []).filter(Boolean), difficulty: c.SET.difficulty || 'normal', speed: c.SET.speed || 1, maxHp: c.P.maxHp, bossHp: foe.maxHp || foe.hp,
      t: 0, real: 0, hpWas: foe.hp, pHpWas: c.P.hp, hurtThisFrame: false, hits: 0, dealt: 0, openHits: 0, openings: [], wasOpen: false, hurt: {}, blows: [], skills: {}, startedAt: new Date().toISOString().slice(0, 10) }; },
  /* from damagePlayer: o is its options ({who, name, unblockable...}), lost what it cost, r what happened ('blocked', 'hit', ...) */
  hurt(o, lost, r) { const F = this.cur; if (!this.on || !F || !(lost > 0 || r === 'blocked' || r === 'parried')) return;   /* (a blow inside the hurt flash costs nothing and is not a blow) */ const w = o && o.who; const src = (w && w.t ? w.t + '|' + (w.mode || '') : F.boss + '|' + ((F.foe && F.foe.mode) || '')) + (o && o.name ? '|' + o.name : '');
    this.hurtBy(F, src, Math.max(0, lost || 0), r); F.hurtThisFrame = lost > 0; },
  hurtBy(F, src, lost, r) { const k = F.hurt[src] || (F.hurt[src] = { n: 0, dmg: 0, guarded: 0 }); k.n++; k.dmg += Math.round(lost); if (r === 'blocked' || r === 'parried') k.guarded++;
    if (F.blows.length < 400) F.blows.push([+F.t.toFixed(2), src, Math.round(lost), r || '']); },
  skill(id) { const F = this.cur; if (!this.on || !F) return; F.skills[id] = (F.skills[id] || 0) + 1; },
  snap(F, outcome) { const { foe, hpWas, pHpWas, hurtThisFrame, wasOpen, ...rest } = F;
    return { ...rest, t: +F.t.toFixed(1), real: +F.real.toFixed(1), outcome, bossLeftPct: foe && foe.alive ? Math.round(100 * Math.max(0, foe.hp) / (F.bossHp || 1)) : 0,
      taken: Object.values(F.hurt).reduce((s, k) => s + k.dmg, 0) }; },
  close(F, outcome) { const a = read(); a.push(this.snap(F, outcome)); write(a); this.saved = Math.min(REC_CAP, a.length); this.cur = null; },
  /* the corner mark: a red REC (and how many fights are in the log), and the last thing it said */
  draw(g, text, VW) { if (this.on) { g.fillStyle = '#ff4a4a'; g.fillRect(VW - 40, 3, 4, 4); text('REC ' + this.saved, VW - 34, 2, '#ff8a8a', 'left', 6); }
    if (this.msgT > 0) text(this.msg, VW / 2, 12, '#ffd36b', 'center', 6); },
};
