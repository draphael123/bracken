# claude/godmode - GOD MODE and UNLOCK EVERYTHING (2026-10-07)

- Settings rows renamed (src/settings-ui.js, src/main.js): old GOD MODE -> UNLOCK EVERYTHING (still SET.godmode), old INVINCIBLE -> GOD MODE (still SET.invincible).
  Saved keys unchanged, so no migration is needed: an old save keeps both values (the meaning follows the key). HUD tag, menu messages, tips, docs/PLAYTEST.md updated.
- GOD MODE: hp and stamina held full every frame (godTend after staminaTick; also clears WINDED); the three direct hp drains (wind bite x2, blood ward) skip it;
  a fall, pool or fire returns him to the last safe ground (P.safe, else the checkpoint) with no damage; infinite mid-air jump; hold JUMP to rise slowly (-70), DOWN to drop.
  Uses the shared key state, so keyboard, pad and touch all work, every hero.
- Assist guard (none existed before for INVINCIBLE; added): while GOD MODE is on a level finish earns no medal (no gold purse), no best time, no no-hit, no iron mark;
  no silver pickups; no Death Knight boss feat (bossDown); no boss-rush record.
- Unchanged: BK.god (invulnerable only) and every tool flag, so route pilots, level-jump's 'no god mode' assertion and the *-shots tools work as before.
- Check: tools/godmode.mjs (added to tools/check.mjs list). Green: godmode, settings-tabs, textfit settings (0 findings), level-jump (see final message).
