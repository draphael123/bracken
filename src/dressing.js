// Per-level ground kits and allowed decoration kinds. Add a kind deliberately here before placing it.
export const GROUND_KITS = {
  "harbor": {"density":0,"kinds":[]},
  "burial": {"density":0,"kinds":[]},
  "wood": {
    "density": 0.7,
    "kinds": [
      "fern",
      "tuft",
      "mushroom",
      "bush",
      "flower",
      "rock",
      "stump",
      "fallenLog",
      "fence"
    ]
  },
  "marsh": {
    "density": 0.6,
    "kinds": [
      "cattail",
      "fern",
      "moss",
      "fallenLog",
      "rock"
    ]
  },
  "stockade": {
    "density": 0.34,
    "kinds": [
      "tuft",
      "skullPost",
      "tent",
      "cart",
      "rock",
      "campfire"
    ]
  },
  "spore": {
    "density": 0.5,
    "kinds": [
      "tinyCap",
      "moss",
      "rock"
    ]
  },
  "kings": {
    "density": 0.7,
    "kinds": [
      "fern",
      "tuft",
      "stump",
      "fence",
      "rock"
    ]
  },
  "scree": {
    "density": 0.32,
    "kinds": [
      "heather",
      "gorse",
      "thistle",
      "rock"
    ]
  },
  "hanging": {
    "density": 0.38,
    "kinds": [
      "tuft",
      "flower",
      "skep",
      "gardenWall"
    ]
  },
  "spire": {
    "density": 0.32,
    "kinds": [
      "herbBed",
      "stoneLantern",
      "skep",
      "rock"
    ]
  },
  "moor": {
    "density": 0.32,
    "kinds": [
      "heather",
      "thistle",
      "gorse",
      "rock"
    ]
  },
  "storm": {
    "density": 0.32,
    "kinds": [
      "tuft",
      "skullPost",
      "cart",
      "campfire",
      "rock"
    ]
  },
  "crown": {
    "density": 0,
    "kinds": [
      "rock"
    ]
  },
  "longwater": {
    "density": 0.38,
    "kinds": [
      "rushes",
      "shell",
      "saltCrust",
      "driftwood",
      "barnacleRock"
    ]
  },
  "reef": {
    "density": 0.38,
    "kinds": [
      "coralTuft",
      "shell",
      "saltCrust"
    ]
  },
  "flotilla": {
    "density": 0.13,
    "kinds": [
      "shell",
      "saltCrust"
    ]
  },
  "hurricane": {
    "density": 0.13,
    "kinds": [
      "saltCrust"
    ]
  },
  "lamplit": {
    "density": 0,
    "kinds": [
      "saltCrust"
    ]
  },
  "underleaf": {
    "density": 0.38,
    "kinds": [
      "tuft",
      "flower",
      "skep",
      "gardenWall"
    ]
  },
  "shop": {
    "density": 0,
    "kinds": []
  },
  "trial_open": {
    "density": 0.38,
    "kinds": [
      "tuft",
      "fern"
    ]
  },
  "trial_knight": {
    "density": 0.38,
    "kinds": [
      "tuft"
    ]
  },
  "trial_pyro": {
    "density": 0.38,
    "kinds": [
      "rock"
    ]
  },
  "trial_paladin": {
    "density": 0.38,
    "kinds": [
      "flower"
    ]
  },
  "trial_pirate": {
    "density": 0.38,
    "kinds": [
      "rock",
      "tuft"
    ]
  },
  "trial_reaper": {
    "density": 0.38,
    "kinds": [
      "mushroom"
    ]
  },
  "shopCrag": {
    "density": 0,
    "kinds": []
  },
  "shopSea": {
    "density": 0,
    "kinds": []
  },
  "deep": {
    "density": 0.38,
    "kinds": [
      "coralTuft",
      "saltCrust"
    ]
  },
  "causeway": {
    "density": 0.38,
    "kinds": [
      "rushes",
      "shell",
      "saltCrust"
    ]
  },
  "waymeet": {
    "density": 0.38,
    "kinds": [
      "flower",
      "tuft",
      "gardenWall"
    ]
  },
  "undercrown": {
    "density": 0,
    "kinds": [
      "rock"
    ]
  },
  "fields": {
    "density": 0.38,
    "kinds": [
      "tuft",
      "flower",
      "rock"
    ]
  },
  "mage": {
    "density": 0.38,
    "kinds": [
      "flower",
      "gardenWall",
      "tuft"
    ]
  },
  "custom": {
    "density": 0.38,
    "kinds": []
  }
};
export const ALLOWED_DECORATIONS = {
  "harbor": ["pierPost","rumBarrels","wreckBow","anchor","mastStump","kegStack","chartTable","seaChest","plunder","capstan","coiledCable","lanternDeck","waterButt","cannon","netPoles","snow","stem"],
  "burial": ["grave","bones","coffer","candelabra","snow","stem"],
  "wood": [
    "beehive",
    "birdhouse",
    "bush",
    "bushDeco",
    "cabin",
    "cairn",
    "deadTree",
    "drip",
    "fallenLog",
    "fence",
    "fern",
    "flower",
    "hiveBg",
    "mushroom",
    "rock",
    "snow",
    "stem",
    "stone",
    "stump",
    "trunk",
    "tuft"
  ],
  "marsh": [
    "barrels",
    "cattail",
    "deadTree",
    "fallenLog",
    "fence",
    "fern",
    "fishTrap",
    "frogStatue",
    "lilyLantern",
    "moss",
    "mushroom",
    "rock",
    "snow",
    "stem",
    "stump"
  ],
  "stockade": [
    "banner",
    "barrels",
    "boneChime",
    "boneThrone",
    "bones",
    "bough",
    "campfire",
    "cart",
    "cauldron",
    "cookSpit",
    "gobPennant",
    "hangCage",
    "hideBanner",
    "hideRack",
    "lootHeap",
    "ragBanner",
    "rock",
    "skullPile",
    "skullPost",
    "skullTotem",
    "snow",
    "spearRack",
    "stakeFence",
    "stem",
    "tent",
    "trophyRack",
    "tuft",
    "warStandard",
    "warnPost"
  ],
  "spore": [
    "bones",
    "cobweb",
    "deadTree",
    "fern",
    "moss",
    "mushroom",
    "rock",
    "rootDecor",
    "skullPile",
    "snow",
    "sporePod",
    "stem",
    "stump",
    "tinyCap"
  ],
  "kings": [
    "banner",
    "barrels",
    "boneChime",
    "cauldron",
    "clothStrip",
    "cookSpit",
    "fence",
    "fern",
    "gobPennant",
    "hangCage",
    "idol",
    "lanternPost",
    "lootHeap",
    "ragBanner",
    "rock",
    "skullPile",
    "skullTotem",
    "snow",
    "spearRack",
    "stem",
    "stump",
    "trophyRack",
    "trunk",
    "tuft",
    "warStandard",
    "warnPost",
    "well"
  ],
  "scree": [
    "bones",
    "bothy",
    "cairn",
    "cart",
    "deadTree",
    "fence",
    "foldGate",
    "gorse",
    "heather",
    "mill",
    "rock",
    "snow",
    "stem",
    "stone",
    "thistle",
    "well"
  ],
  "hanging": [
    "axle",
    "barrels",
    "beehive",
    "birdhouse",
    "cairn",
    "cobweb",
    "fence",
    "flower",
    "gardenWall",
    "hangingHouse",
    "lanternPost",
    "pillar",
    "shopSign",
    "skep",
    "snow",
    "stall",
    "stem",
    "stone",
    "strut",
    "tuft",
    "villageHall",
    "washing",
    "well"
  ],
  "spire": [
    "beanpoles",
    "bellFrame",
    "bones",
    "bookpile",
    "bookshelf",
    "candelabra",
    "eyrie",
    "flagPost",
    "gardenWall",
    "herbBed",
    "incenseStand",
    "lanternPost",
    "lectern",
    "lootHeap",
    "monkChores",
    "pilgrimLeanTo",
    "portcullis",
    "prayerFlags",
    "rock",
    "shrine",
    "skep",
    "skullPile",
    "snow",
    "statue",
    "stem",
    "stone",
    "stoneLantern",
    "well"
  ],
  "moor": [
    "bones",
    "bothy",
    "cairn",
    "deadTree",
    "fence",
    "gorse",
    "heather",
    "rock",
    "snow",
    "stem",
    "stilt",
    "stone",
    "thistle"
  ],
  "storm": [
    "anvil",
    "banner",
    "barrels",
    "boneChime",
    "bridgepost",
    "bridgetower",
    "campfire",
    "cart",
    "cauldron",
    "clothStrip",
    "cookSpit",
    "forge",
    "gatehouse",
    "gobPennant",
    "hideBanner",
    "hideRack",
    "lanternPost",
    "lootHeap",
    "rock",
    "skullPost",
    "skullTotem",
    "snow",
    "spearRack",
    "stakeFence",
    "stem",
    "tent",
    "trophyRack",
    "tuft",
    "warStandard",
    "warnPost"
  ],
  "crown": [
    "banner",
    "barrels",
    "boneChime",
    "bones",
    "bridgepost",
    "cabin",
    "cairn",
    "candelabra",
    "cart",
    "caskRack",
    "cauldron",
    "clothStrip",
    "counter",
    "deadTree",
    "eyrie",
    "gobPennant",
    "hallWindow",
    "hangCage",
    "hideBanner",
    "idol",
    "lanternPost",
    "longTable",
    "lootHeap",
    "ragBanner",
    "rock",
    "siege",
    "skullTotem",
    "snow",
    "spearRack",
    "stem",
    "stone",
    "tent",
    "throne",
    "trophyRack",
    "warStandard",
    "wares",
    "warnPost",
    "well"
  ],
  "longwater": [
    "airBell",
    "barnacleRock",
    "bellTower",
    "buoy",
    "coralTuft",
    "driftwood",
    "drownedHut",
    "fishCottage",
    "kelp",
    "netPoles",
    "pierPost",
    "rowboat",
    "rushes",
    "saltCrust",
    "seaLantern",
    "shell",
    "snow",
    "stem",
    "tributeChest"
  ],
  "reef": [
    "airBell",
    "anchor",
    "brainCoral",
    "bubbleVent",
    "capstan",
    "coralFan",
    "coralTuft",
    "figurehead",
    "kelpTall",
    "lanternBuoy",
    "mastStump",
    "rigging",
    "sailRag",
    "saltCrust",
    "seaChest",
    "shell",
    "shipBell",
    "snow",
    "spar",
    "stem",
    "urchinRock",
    "wheel",
    "wreckBow",
    "wreckStern"
  ],
  "flotilla": [
    "airBell",
    "boardingNet",
    "chartTable",
    "chickenCoop",
    "coiledCable",
    "cookPot",
    "crowNest",
    "figurehead",
    "gunport",
    "hammock",
    "kegStack",
    "lanternDeck",
    "mastTall",
    "oar",
    "oarBench",
    "pennant",
    "plunder",
    "rigging",
    "rowboat",
    "rumBarrels",
    "sailRag",
    "saltCrust",
    "shell",
    "snow",
    "stem",
    "sternWindows",
    "washing",
    "waterButt",
    "wheel"
  ],
  "hurricane": [
    "airBell",
    "anchor",
    "boardingNet",
    "bones",
    "chartTable",
    "chickenCoop",
    "coiledCable",
    "crowNest",
    "figurehead",
    "hammock",
    "kegStack",
    "lanternDeck",
    "mastTall",
    "pennant",
    "plunder",
    "rigging",
    "rumBarrels",
    "sailRag",
    "saltCrust",
    "shipBell",
    "snow",
    "stem",
    "sternWindows",
    "washing",
    "waterButt",
    "wheel"
  ],
  "lamplit": [
    "bellows",
    "bones",
    "cityWeed",
    "clerkDesk",
    "column",
    "drownedCart",
    "grating",
    "lampMain",
    "lampWreck",
    "magistrate",
    "mastStump",
    "plunder",
    "saltCrust",
    "seaChest",
    "sealDrift",
    "shellDrift",
    "snow",
    "stall",
    "stem",
    "sternWindows",
    "tollPost",
    "wreckBow"
  ],
  "underleaf": [
    "barrels",
    "beanpoles",
    "beehive",
    "bellTower",
    "boneChime",
    "cart",
    "cauldron",
    "chickenCoop",
    "clerkDesk",
    "clothStrip",
    "coffer",
    "cookSpit",
    "counter",
    "dovecote",
    "fence",
    "flower",
    "gardenWall",
    "gobPennant",
    "grave",
    "hideRack",
    "idol",
    "lanternPost",
    "lootHeap",
    "lychgate",
    "mill",
    "netPoles",
    "pillar",
    "pot",
    "punt",
    "skep",
    "snow",
    "stall",
    "stem",
    "stocks",
    "trophyRack",
    "trough",
    "tuft",
    "wares",
    "washing",
    "waterButt",
    "well",
    "yew"
  ],
  "shop": [
    "barrels",
    "counter",
    "lanternPost",
    "snow",
    "stem",
    "wares"
  ],
  "trial_open": [
    "fern",
    "snow",
    "stem",
    "tuft"
  ],
  "trial_knight": [
    "snow",
    "stem",
    "tuft"
  ],
  "trial_pyro": [
    "rock",
    "snow",
    "stem"
  ],
  "trial_paladin": [
    "flower",
    "snow",
    "stem"
  ],
  "trial_pirate": [
    "rock",
    "snow",
    "stem",
    "tuft"
  ],
  "trial_reaper": [
    "mushroom",
    "snow",
    "stem"
  ],
  "shopCrag": [
    "bones",
    "cart",
    "counter",
    "lanternPost",
    "snow",
    "stem",
    "wares"
  ],
  "shopSea": [
    "chartTable",
    "coiledCable",
    "counter",
    "kegStack",
    "lanternDeck",
    "plunder",
    "rumBarrels",
    "seaChest",
    "snow",
    "stem",
    "wares",
    "waterButt"
  ],
  "deep": [
    "airBell",
    "anchor",
    "boneHeap",
    "brainCoral",
    "capstan",
    "coiledCable",
    "coralFan",
    "coralTuft",
    "figurehead",
    "glowCoral",
    "kelpTall",
    "lanternDeck",
    "mastStump",
    "saltCrust",
    "seaChest",
    "seaLily",
    "shellDrift",
    "shipBell",
    "snow",
    "stem",
    "sternWindows",
    "tributeSpill",
    "tubeWorms",
    "wreckBow",
    "wreckStern"
  ],
  "causeway": [
    "airBell",
    "barnacleRock",
    "barrels",
    "brokenArch",
    "drownedTree",
    "fencePosts",
    "figurehead",
    "fishCottage",
    "fishTrap",
    "kelp",
    "lanternPost",
    "mastStump",
    "netPoles",
    "pierPost",
    "rigging",
    "rushes",
    "saltCrust",
    "seaChest",
    "shell",
    "shellDrift",
    "snow",
    "spar",
    "stem",
    "tent",
    "wayShrine",
    "waystone"
  ],
  "waymeet": [
    "barrels",
    "bellTower",
    "bench",
    "bridgepost",
    "bridgetower",
    "bunting",
    "cart",
    "caskRack",
    "coffer",
    "column",
    "counter",
    "dovecote",
    "fence",
    "flower",
    "gardenWall",
    "gatehouse",
    "grave",
    "hallWindow",
    "hayBale",
    "hearth",
    "innSign",
    "kegStack",
    "lanternPost",
    "longTable",
    "lychgate",
    "mugShelf",
    "shopSign",
    "snow",
    "stall",
    "stem",
    "stilt",
    "stocks",
    "trough",
    "tuft",
    "wares",
    "waterButt",
    "well",
    "yew"
  ],
  "undercrown": [
    "banner",
    "barrels",
    "boneChime",
    "bones",
    "cairn",
    "cart",
    "cauldron",
    "clothStrip",
    "coffer",
    "lootHeap",
    "ragBanner",
    "rock",
    "skullTotem",
    "snow",
    "spearRack",
    "stakeFence",
    "stem",
    "stone",
    "wares",
    "warnPost"
  ],
  "fields": [
    "brokenCart",
    "candle",
    "crookedFence",
    "deadCorn",
    "deadTree",
    "farmLantern",
    "fieldGrave",
    "flower",
    "ghostCow",
    "hayStack",
    "hearth",
    "leaningBarn",
    "milkChurn",
    "plough",
    "portrait",
    "pumpkinPatch",
    "rock",
    "scarePost",
    "snow",
    "stem",
    "stone",
    "stump",
    "tuft",
    "waterPump"
  ],
  "mage": [
    "bench",
    "bookpile",
    "candelabra",
    "cauldron",
    "chimneypot",
    "coffer",
    "desk",
    "flower",
    "gardenWall",
    "globe",
    "ivyWall",
    "jars",
    "lamppost",
    "lectern",
    "longTable",
    "nest",
    "orreryBase",
    "retorts",
    "snow",
    "stall",
    "starChart",
    "stem",
    "still",
    "stone",
    "sundial",
    "telescope",
    "topiaryUrn",
    "tuft",
    "wineRack"
  ],
  "custom": [
    "snow",
    "stem"
  ]
};

GROUND_KITS.keep={...GROUND_KITS.deep};
ALLOWED_DECORATIONS.keep=[...ALLOWED_DECORATIONS.deep];
