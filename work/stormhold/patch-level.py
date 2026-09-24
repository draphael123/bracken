import io
p='src/level.js'
s=io.open(p,encoding='utf8').read()
def rep(a,b):
    global s
    assert s.count(a)==1,(s.count(a),a[:80])
    s=s.replace(a,b)
    io.open(p,'w',encoding='utf8',newline='').write(s)
# 1. import
rep("import { buildUnburiedField } from './unburied-field.js';","import { buildUnburiedField } from './unburied-field.js';\nimport { stormholdTown } from './stormhold-town.js';")
# 2. the old builder goes: from its banner to the Undercrown's banner
a=s.index("// LEVEL 10 - STORMHOLD, the last hold.")
a=s.rindex("// ====", 0, a)
b=s.index("// THE UNDERCROWN - the secret level under Highcrown")
b=s.rindex("// ====", 0, b)
old=s[a:b]
assert old.count("function stormhold()")==1 and "function " not in old.replace("function stormhold()","")
s=s[:a]+"/* LEVEL 10 - STORMHOLD, THE CASTLE TOWN: built in src/stormhold-town.js (docs/briefs/stormhold-town.md). */\n\n"+s[b:]
io.open(p,'w',encoding='utf8',newline='').write(s)
# 3. LEVELS
rep("rule: 'THREE GATES, AND EVERY KEY IS INDOORS.', build: stormhold, needs: 'oreroad' },","rule: 'THREE GATES. EVERY KEY HANGS IN A WATCHTOWER.', build: () => stormholdTown({ painter, T, TS }), needs: 'oreroad' },")
# 4. REVIEW
rep("  // a silver four rows over the street: a step up to it\n  storm: L => { rv(L).plat(282, 28, 3); for (const e of L.ents) if (e.t === 'deco' && e.kind === 'cairn') { e.kind = 'skullTotem'; e.v = 0; } },\n","")
# 5. DRESS
a=s.index("  storm: [['barrels'], ['lanternPost'], ['spearRack']")
b=s.index("\n",a)
s=s[:a]+"  storm: [['barrels', 2], ['lanternPost', 2], ['cart'], ['trough'], ['waterButt', 2], ['wares', 2], ['banner', 2], ['spearRack'], ['gobPennant', 2], ['warStandard'], ['stakeFence']],   /* a town's own furniture, and what an occupying army leaves on it */"+s[b:]
io.open(p,'w',encoding='utf8',newline='').write(s)
# 6. GOBLIN_CAMP
rep("  storm: [['warnPost', 86, 33, 0], ['hideRack', 119, 15, 0], ['lootHeap', 133, 15, 1], ['boneChime', 192, 19, 1, true], ['gobPennant', 200, 31, 1], ['cookSpit', 229, 29], ['cauldron', 287, 29]],",
    "  storm: [['warnPost', 66, 35, 0], ['hideRack', 119, 15, 0], ['lootHeap', 133, 15, 1], ['gobPennant', 178, 31, 1], ['cookSpit', 266, 31], ['cauldron', 420, 29]],")
# 7. GARRISON
rep("  storm: [['hearthgob', 5], ['cutter', 5], ['sentry', 2], ['pike', 1]],","  storm: [['hearthgob', 6], ['cutter', 6], ['sentry', 3], ['pike', 2], ['sprig', 4], ['archer', 2]],   /* the castle town is half again as long as the war camp was */")
# 8. AMBUSH
rep("""  storm: [{ name: 'THE HEARTH HALL', row: 31, wallL: 98, wallR: 152, check: false,
    waves: [[['sprig', 104], ['sprig', 146], ['hearthgob', 128], ['cutter', 117]], [['shield', 140], ['archer', 148], ['pike', 126, null, { elite: true }]]] }],""",
"""  storm: [{ name: 'THE MARKET SQUARE', row: 31, wallL: 98, wallR: 138, check: false,   /* the square among the stalls; its door checkpoint stands at 95 */
    waves: [[['pike', 128, null, { elite: true }], ['sprig', 106], ['sprig', 132], ['cutter', 116], ['hearthgob', 122]]] }],""")
# 9. ELITES
rep("  storm: [['pike', 250, 29, { gate: 257 }]],","  storm: [['shield', 514, 28, { gate: 523 }]],   /* the shield-wall on the curtain wall's walk, holding the way to the Wall Watch */")
print('ok')
