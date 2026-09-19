# Progression follow-up verification

At full blood, the Death Knight now waits for the first-slot input to resolve: a short release casts the equipped skill, while a hold triggers only Blood Surge. Other slots stay available. Live input tests used Unholy Ground and verified that a co-op partner can hold F while the first player independently casts Rising Cut. The shop description now explains the purchased loadout.

The economy audit walks all 25 campaign stages using actual XP awards and placed coins, assuming half the coins collected and reserving 30 coins per stage. It excludes drops, medals, replays and migration refunds. Every hero can afford the cheapest active loadout available at each stage. First skill: 60 coins against 72 available after Bracken Wood. Two skills become available at level 4. Slots expand at levels 8 and 16. Warden has three authored active skills; her fourth slot is available but has no fourth distinct active skill to equip. These are economic simulations and focused co-op input checks, not a complete human campaign playthrough.

Full data: progression-economy-0919.json. Repeat: node tools/progression-economy.mjs <output.json>.
