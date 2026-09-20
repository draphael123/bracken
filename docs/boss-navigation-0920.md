# Boss navigation pilot, September 20

The Reef pilot now baits the bite and thrash, moves beyond the bite volume, and returns during recovery. Descent toward the visible water hole no longer cancels escape input or aims at an adjacent coral stool. The Herald pilot holds its upward jump long enough to reach the raised stones. These changes affect automated lab inputs only; player controls, boss health, damage, resources and recovery windows are unchanged.

Twelve fresh-page, seeded source runs cover both encounters with all six heroes. Reef now clears with all six. Death Knight also finishes Herald. The pilot still misses the timing targets in several cases, including Freebooter's slower Herald clear; results must not be selected only for improvement. The lab replenishes health and does not prove human survival.

`node tools/boss-navigation.mjs` checks a real stuck-jaw opening and Warden clear in Reef, plus Death Knight reaching and clearing Herald. Ordinary attacks must account for most credited damage in both cases. The complete source run is saved in the handoff evidence as `38-boss-source.json`.

## Quartermaster follow-up

The pilot previously let go of the rigging when its feet were still below the next deck. It now holds the climb until it can clear the deck and stand on it. Fresh runs cover all six heroes; Knight, Paladin and Death Knight recover previously unfinished clears. Warden remains unfinished, and fast clears remain timing failures. The regression verifies Knight actually stands on all three fighting decks before finishing. No attack, boss health, arena geometry or resource value changes.
