"use strict"

const resourceIndexOverride = { // manual override of tiers names and colors for specific items
    "1477126404": {
        tier: 1,
        name: "Lost Wreckage"
    },
    "1043012047": {
        tier: 2,
        name: "Lost Shipment"
    },
    "1293969473": {
        tier: 5,
        name: "Lost Treasure"
    },
    "182331452": {
        tier: 1,
        name: "Traveler's Fruit",
        color: "#5089d9"
    },
    "623041128": {
        tier: 2,
        name: "Sunflower",
        color: "#fff700"
    },
    "1551712725": {
        tier: 2,
        name: "Pumpkin",
        color: "#FFA500"
    },
};


const resourceIndex = { // Generated array
    "1": {
        tier: 1,
        name: "Sticks",
        tag: "Stick"
    },
    "2": {
        tier: 1,
        name: "Bush",
        tag: "Fiber Plant"
    },
    "3": {
        tier: 1,
        name: "Rotten Log",
        tag: "Wood Logs"
    },
    "4": {
        tier: 1,
        name: "Rotten Stump",
        tag: "Wood Logs"
    },
    "5": {
        tier: 6,
        name: "Maple Sapling",
        tag: "Sapling"
    },
    "6": {
        tier: 1,
        name: "Pine Sapling",
        tag: "Sapling"
    },
    "7": {
        tier: 1,
        name: "Spruce Sapling",
        tag: "Sapling"
    },
    "8": {
        tier: 1,
        name: "Oak Sapling",
        tag: "Sapling"
    },
    "9": {
        tier: 2,
        name: "Birch Sapling",
        tag: "Sapling"
    },
    "10": {
        tier: 1,
        name: "Beech Sapling",
        tag: "Sapling"
    },
    "11": {
        tier: 1,
        name: "Dead Tree",
        tag: "Tree"
    },
    "12": {
        tier: 1,
        name: "Young Beech Tree",
        tag: "Tree"
    },
    "13": {
        tier: 2,
        name: "Young Birch Tree",
        tag: "Tree"
    },
    "14": {
        tier: 1,
        name: "Young Oak Tree",
        tag: "Tree"
    },
    "15": {
        tier: 3,
        name: "Young Spruce Tree",
        tag: "Tree"
    },
    "16": {
        tier: 4,
        name: "Young Pine Tree",
        tag: "Tree"
    },
    "17": {
        tier: 6,
        name: "Young Maple Tree",
        tag: "Tree"
    },
    "18": {
        tier: 2,
        name: "Dendro Tree",
        tag: "Tree"
    },
    "19": {
        tier: 1,
        name: "Mature Beech Tree",
        tag: "Tree"
    },
    "20": {
        tier: 2,
        name: "Mature Birch Tree",
        tag: "Tree"
    },
    "21": {
        tier: 1,
        name: "Mature Oak Tree",
        tag: "Tree"
    },
    "22": {
        tier: 3,
        name: "Large Stump",
        tag: "Stump"
    },
    "23": {
        tier: 6,
        name: "Ancient Oak Tree",
        tag: "Tree"
    },
    "24": {
        tier: 6,
        name: "Gnarled Maple Tree",
        tag: "Tree"
    },
    "25": {
        tier: 6,
        name: "Mature Maple Tree",
        tag: "Tree"
    },
    "26": {
        tier: 4,
        name: "Mature Pine Tree",
        tag: "Tree"
    },
    "27": {
        tier: 3,
        name: "Mature Spruce Tree",
        tag: "Tree"
    },
    "28": {
        tier: 3,
        name: "Large Fallen Tree",
        tag: "Tree"
    },
    "29": {
        tier: 2,
        name: "Large Tree Stump",
        tag: "Tree"
    },
    "30": {
        tier: 5,
        name: "Stunted Cypress Tree",
        tag: "Tree"
    },
    "31": {
        tier: 5,
        name: "Dead Cypress Tree",
        tag: "Tree"
    },
    "32": {
        tier: 4,
        name: "Ancient Pine Tree",
        tag: "Tree"
    },
    "33": {
        tier: 5,
        name: "Mature Cypress Tree",
        tag: "Tree"
    },
    "34": {
        tier: 5,
        name: "Ancient Cypress Tree",
        tag: "Tree"
    },
    "35": {
        tier: 7,
        name: "Young Baobab Tree",
        tag: "Tree"
    },
    "36": {
        tier: 7,
        name: "Ancient Baobab Tree",
        tag: "Tree"
    },
    "38": {
        tier: 1,
        name: "Flint Pile",
        tag: "Rock"
    },
    "40": {
        tier: 1,
        name: "Limestone Boulder",
        tag: "Rock"
    },
    "41": {
        tier: 1,
        name: "Limestone Outcrop",
        tag: "Rock"
    },
    "42": {
        tier: 1,
        name: "Large Limestone Outcrop",
        tag: "Rock"
    },
    "43": {
        tier: 1,
        name: "Large Limestone Rock",
        tag: "Rock"
    },
    "44": {
        tier: 1,
        name: "Large Limestone Boulder",
        tag: "Rock"
    },
    "45": {
        tier: 1,
        name: "Limestone Rock Formation",
        tag: "Rock"
    },
    "46": {
        tier: 2,
        name: "Shale Boulder",
        tag: "Rock Boulder"
    },
    "47": {
        tier: 2,
        name: "Shale Outcrop",
        tag: "Rock Outcrop"
    },
    "48": {
        tier: 2,
        name: "Sandstone Boulder",
        tag: "Rock Boulder"
    },
    "49": {
        tier: 2,
        name: "Sandstone Outcrop",
        tag: "Rock Outcrop"
    },
    "50": {
        tier: 3,
        name: "Granite Boulder",
        tag: "Rock Boulder"
    },
    "51": {
        tier: 3,
        name: "Granite Outcrop",
        tag: "Rock Outcrop"
    },
    "52": {
        tier: 4,
        name: "Basalt Outcrop",
        tag: "Rock Outcrop"
    },
    "53": {
        tier: 4,
        name: "Basalt Stalagmite",
        tag: "Rock Boulder"
    },
    "54": {
        tier: 5,
        name: "Diorite Outcrop",
        tag: "Rock Outcrop"
    },
    "55": {
        tier: 5,
        name: "Diorite Boulder",
        tag: "Rock Boulder"
    },
    "56": {
        tier: 6,
        name: "Marble Outcrop",
        tag: "Rock Outcrop"
    },
    "57": {
        tier: 6,
        name: "Marble Boulder",
        tag: "Rock Boulder"
    },
    "58": {
        tier: 1,
        name: "Ferralith Vein",
        tag: "Ore Vein"
    },
    "59": {
        tier: 1,
        name: "Ferralith Outcrop",
        tag: "Ore Vein"
    },
    "60": {
        tier: 1,
        name: "Rich Ferralith Vein",
        tag: "Ore Vein"
    },
    "61": {
        tier: 2,
        name: "Pyrelite Vein",
        tag: "Ore Vein"
    },
    "62": {
        tier: 3,
        name: "Emarium Vein",
        tag: "Ore Vein"
    },
    "63": {
        tier: 4,
        name: "Elenvar Vein",
        tag: "Ore Vein"
    },
    "64": {
        tier: 5,
        name: "Luminite Vein",
        tag: "Ore Vein"
    },
    "65": {
        tier: 6,
        name: "Rathium Vein",
        tag: "Ore Vein"
    },
    "66": {
        tier: 1,
        name: "Mud Mound",
        tag: "Clay"
    },
    "67": {
        tier: 2,
        name: "Clay Mound",
        tag: "Clay"
    },
    "68": {
        tier: 3,
        name: "Earthenware Clay",
        tag: "Clay"
    },
    "69": {
        tier: 4,
        name: "Fine Clay",
        tag: "Clay"
    },
    "70": {
        tier: 5,
        name: "Kaolinite Clay",
        tag: "Clay"
    },
    "71": {
        tier: 6,
        name: "Bentonite Clay",
        tag: "Clay"
    },
    "72": {
        tier: 1,
        name: "Wild Grains",
        tag: "Wild Grain"
    },
    "73": {
        tier: 1,
        name: "Strawberry Bush",
        tag: "Berry"
    },
    "74": {
        tier: 1,
        name: "Button Mushrooms",
        tag: "Mushroom"
    },
    "75": {
        tier: 5,
        name: "Blackberry Bush",
        tag: "Berry"
    },
    "76": {
        tier: 7,
        name: "Oyster Mushrooms",
        tag: "Mushroom"
    },
    "77": {
        tier: 2,
        name: "Prickly Pear",
        tag: "Fruit"
    },
    "78": {
        tier: 3,
        name: "Juniper Berry Bush",
        tag: "Berry"
    },
    "79": {
        tier: 2,
        name: "Chanterelles",
        tag: "Mushroom"
    },
    "80": {
        tier: 2,
        name: "Honeyberry Bush",
        tag: "Berry"
    },
    "81": {
        tier: 6,
        name: "Morel Mushrooms",
        tag: "Mushroom"
    },
    "82": {
        tier: 5,
        name: "Truffle Patch",
        tag: "Mushroom"
    },
    "83": {
        tier: 9,
        name: "King Trumpet",
        tag: "Mushroom"
    },
    "84": {
        tier: 8,
        name: "Cloudberry Bush",
        tag: "Berry"
    },
    "85": {
        tier: 8,
        name: "Ghost Mushroom",
        tag: "Mushroom"
    },
    "86": {
        tier: 9,
        name: "Citriformis",
        tag: "Flower"
    },
    "87": {
        tier: 2,
        name: "Dandelions",
        tag: "Flower"
    },
    "88": {
        tier: 1,
        name: "Daisies",
        tag: "Flower"
    },
    "89": {
        tier: 1,
        name: "Lavender",
        tag: "Flower"
    },
    "90": {
        tier: 1,
        name: "Lavender Cluster",
        tag: "Flower"
    },
    "91": {
        tier: 1,
        name: "Small Lavender Cluster",
        tag: "Flower"
    },
    "92": {
        tier: 4,
        name: "Bluebell",
        tag: "Flower"
    },
    "93": {
        tier: 3,
        name: "Aloe",
        tag: "Flower"
    },
    "94": {
        tier: 2,
        name: "Peppermint",
        tag: "Flower"
    },
    "95": {
        tier: 3,
        name: "Snowdrop Flowers",
        tag: "Flower"
    },
    "96": {
        tier: 3,
        name: "Marigold",
        tag: "Flower"
    },
    "97": {
        tier: 3,
        name: "Thyme",
        tag: "Flower"
    },
    "98": {
        tier: 5,
        name: "Morning Glory",
        tag: "Flower"
    },
    "99": {
        tier: 6,
        name: "Desert Rose",
        tag: "Flower"
    },
    "100": {
        tier: 4,
        name: "Rosemary",
        tag: "Flower"
    },
    "101": {
        tier: 6,
        name: "Fireweed",
        tag: "Flower"
    },
    "102": {
        tier: 10,
        name: "White Lily",
        tag: "Flower"
    },
    "103": {
        tier: 5,
        name: "Ghost Thyme",
        tag: "Flower"
    },
    "104": {
        tier: 7,
        name: "Golden Witlow",
        tag: "Flower"
    },
    "105": {
        tier: 8,
        name: "King of the Alps",
        tag: "Flower"
    },
    "125": {
        tier: 2,
        name: "Ferns",
        tag: "Fiber Plant"
    },
    "127": {
        tier: 2,
        name: "Pine Weed",
        tag: "Fiber Plant"
    },
    "128": {
        tier: 7,
        name: "Grassy Reeds",
        tag: "Fiber Plant"
    },
    "129": {
        tier: 7,
        name: "Reindeer Lichen",
        tag: "Flower"
    },
    "130": {
        tier: 3,
        name: "Ghost Succulent",
        tag: "Fiber Plant"
    },
    "131": {
        tier: 3,
        name: "Bullrushes",
        tag: "Fiber Plant"
    },
    "132": {
        tier: 3,
        name: "Spanish Moss",
        tag: "Fiber Plant"
    },
    "133": {
        tier: 4,
        name: "Thorny Stump",
        tag: "Stump"
    },
    "134": {
        tier: 4,
        name: "Brambles",
        tag: "Fiber Plant"
    },
    "135": {
        tier: 5,
        name: "Heather",
        tag: "Fiber Plant"
    },
    "136": {
        tier: 5,
        name: "Large Brambles",
        tag: "Fiber Plant"
    },
    "137": {
        tier: 8,
        name: "Arctic Grass",
        tag: "Fiber Plant"
    },
    "138": {
        tier: 5,
        name: "Pink Lilies",
        tag: "Flower"
    },
    "139": {
        tier: 6,
        name: "Ancient Thorns",
        tag: "Fiber Plant"
    },
    "140": {
        tier: 1,
        name: "Rough Hieroglyphs",
        tag: "Research"
    },
    "141": {
        tier: 2,
        name: "Simple Hieroglyphs",
        tag: "Research"
    },
    "142": {
        tier: 3,
        name: "Neat Hieroglyphs",
        tag: "Research"
    },
    "143": {
        tier: 4,
        name: "Fine Hieroglyphs",
        tag: "Research"
    },
    "144": {
        tier: 5,
        name: "Exquisite Hieroglyphs",
        tag: "Research"
    },
    "145": {
        tier: 6,
        name: "Peerless Hieroglyphs",
        tag: "Research"
    },
    "152": {
        tier: 1,
        name: "Gem Encrusted Stalagmite",
        tag: "Metal Outcrop"
    },
    "153": {
        tier: 3,
        name: "Fossils",
        tag: "Bones"
    },
    "154": {
        tier: 3,
        name: "Sandcovered Fossils",
        tag: "Bones"
    },
    "156": {
        tier: 1,
        name: "Wild Starbulb Plant",
        tag: "Wild Vegetable"
    },
    "158": {
        tier: 1,
        name: "Salt Deposit",
        tag: "Salt"
    },
    "159": {
        tier: 1,
        name: "Vines",
        tag: "Obstacle"
    },
    "160": {
        tier: 1,
        name: "Root",
        tag: "Obstacle"
    },
    "161": {
        tier: 1,
        name: "Rubble",
        tag: "Obstacle"
    },
    "162": {
        tier: 1,
        name: "Ancient Door",
        tag: "Obstacle"
    },
    "163": {
        tier: 1,
        name: "Ancient Blue Door",
        tag: "Obstacle"
    },
    "164": {
        tier: 1,
        name: "Ancient Red Door",
        tag: "Obstacle"
    },
    "165": {
        tier: 1,
        name: "Ancient Green Door",
        tag: "Obstacle"
    },
    "166": {
        tier: 1,
        name: "Ancient Yellow Door",
        tag: "Obstacle"
    },
    "167": {
        tier: 1,
        name: "Complicated Ancient Door",
        tag: "Obstacle"
    },
    "168": {
        tier: 1,
        name: "Ancient Door ",
        tag: "Obstacle"
    },
    "169": {
        tier: 1,
        name: "Ancient Door   ",
        tag: "Obstacle"
    },
    "170": {
        tier: 1,
        name: "Large Rubble",
        tag: "Obstacle"
    },
    "171": {
        tier: 1,
        name: "Ancient Brazier",
        tag: "Obstacle"
    },
    "172": {
        tier: 1,
        name: "Ancient Brazier ",
        tag: "Obstacle"
    },
    "173": {
        tier: 1,
        name: "Lit Ancient Brazier",
        tag: "Obstacle"
    },
    "174": {
        tier: 1,
        name: "Broken Ancient Brazier",
        tag: "Obstacle"
    },
    "175": {
        tier: 1,
        name: "Hexite Aurumite Axe",
        tag: "Obstacle"
    },
    "176": {
        tier: 2,
        name: "Collapsed Pillars",
        tag: "Obstacle"
    },
    "177": {
        tier: 1,
        name: "Lit Wooden Brazier",
        tag: "Obstacle"
    },
    "178": {
        tier: 1,
        name: "Wooden Brazier",
        tag: "Obstacle"
    },
    "179": {
        tier: 2,
        name: "Vines T2",
        tag: "Obstacle"
    },
    "180": {
        tier: 2,
        name: "Root T2",
        tag: "Obstacle"
    },
    "181": {
        tier: 2,
        name: "Rubble T2",
        tag: "Obstacle"
    },
    "182": {
        tier: 1,
        name: "Lit Wooden Brazier ",
        tag: "Obstacle"
    },
    "183": {
        tier: 1,
        name: "Wooden Brazier ",
        tag: "Obstacle"
    },
    "184": {
        tier: 1,
        name: "Collapsed Pillar",
        tag: "Obstacle"
    },
    "185": {
        tier: 1,
        name: "Ancient Adventurer's Letter",
        tag: "Note"
    },
    "186": {
        tier: 1,
        name: "Ancient Trapsmith's Note",
        tag: "Note"
    },
    "187": {
        tier: 1,
        name: "Baffled Adventurer's Note",
        tag: "Note"
    },
    "188": {
        tier: 1,
        name: "Apprehensive Adventurer's Note",
        tag: "Note"
    },
    "189": {
        tier: 1,
        name: "Helpful Adventurer's Note",
        tag: "Note"
    },
    "190": {
        tier: 2,
        name: "Key Pedestal",
        tag: "Obstacle"
    },
    "191": {
        tier: 2,
        name: "Empty Key Pedestal ",
        tag: "Obstacle"
    },
    "192": {
        tier: 2,
        name: "Intricate Door",
        tag: "Obstacle"
    },
    "193": {
        tier: 2,
        name: "Open Door",
        tag: "Obstacle"
    },
    "194": {
        tier: 2,
        name: "Ancient Adventurer's Note",
        tag: "Note"
    },
    "195": {
        tier: 1,
        name: "Powered Door",
        tag: "Door"
    },
    "196": {
        tier: 1,
        name: "Partially Powered Door",
        tag: "Door"
    },
    "197": {
        tier: 1,
        name: "Unpowered Door",
        tag: "Door"
    },
    "198": {
        tier: 1,
        name: "Powered Door Contraption",
        tag: "Door"
    },
    "199": {
        tier: 1,
        name: "Overloaded Door Contraption",
        tag: "Door"
    },
    "200": {
        tier: 1,
        name: "Ornate Door",
        tag: "Obstacle"
    },
    "201": {
        tier: 6,
        name: "Energy Source",
        tag: "Obstacle"
    },
    "202": {
        tier: 6,
        name: "Ornate Key Pedestal",
        tag: "Obstacle"
    },
    "203": {
        tier: 6,
        name: "Advanced Key Pedestal",
        tag: "Obstacle"
    },
    "204": {
        tier: 6,
        name: "Power Source",
        tag: "Obstacle"
    },
    "205": {
        tier: 6,
        name: "Broken Power Source",
        tag: "Obstacle"
    },
    "206": {
        tier: 6,
        name: "Collapsed Marble Pillars",
        tag: "Obstacle"
    },
    "207": {
        tier: 6,
        name: "Advanced Door",
        tag: "Obstacle"
    },
    "208": {
        tier: 6,
        name: "Right Power Core Pedestal",
        tag: "Obstacle"
    },
    "209": {
        tier: 6,
        name: "Empty Power Core Pedestal",
        tag: "Obstacle"
    },
    "210": {
        tier: 6,
        name: "Runic Door",
        tag: "Obstacle"
    },
    "211": {
        tier: 6,
        name: "Trap Rubble",
        tag: "Obstacle"
    },
    "212": {
        tier: 6,
        name: "Runic Door ",
        tag: "Obstacle"
    },
    "213": {
        tier: 6,
        name: "Mysterious Contraption",
        tag: "Obstacle"
    },
    "214": {
        tier: 6,
        name: "Powered Contraption",
        tag: "Obstacle"
    },
    "215": {
        tier: 3,
        name: "Vines T3",
        tag: "Obstacle"
    },
    "216": {
        tier: 3,
        name: "Root T3",
        tag: "Obstacle"
    },
    "217": {
        tier: 3,
        name: "Rubble T3",
        tag: "Obstacle"
    },
    "218": {
        tier: 3,
        name: "Enadarite Stand",
        tag: "Obstacle"
    },
    "219": {
        tier: 3,
        name: "Key Mold Pedestal",
        tag: "Obstacle"
    },
    "220": {
        tier: 3,
        name: "Empty Enadarite Stand",
        tag: "Obstacle"
    },
    "221": {
        tier: 3,
        name: "Empty Key Mold Pedestal",
        tag: "Obstacle"
    },
    "222": {
        tier: 3,
        name: "Enadarite Door",
        tag: "Obstacle"
    },
    "223": {
        tier: 6,
        name: "Left Power Core Pedestal",
        tag: "Obstacle"
    },
    "500": {
        tier: -1,
        name: "Depleted Sticks",
        tag: "Depleted Resource"
    },
    "501": {
        tier: -1,
        name: "Depleted Flint",
        tag: "Depleted Resource"
    },
    "1000028": {
        tier: 3,
        name: "Large Fallen Tree Stump",
        tag: "Tree"
    },
    "1000029": {
        tier: 3,
        name: "Fallen Grove Tree",
        tag: "Tree"
    },
    "1010008": {
        tier: 2,
        name: "Planted Birch Sapling",
        tag: "Sapling"
    },
    "1010009": {
        tier: 1,
        name: "Planted Beech Sapling",
        tag: "Sapling"
    },
    "1010010": {
        tier: 1,
        name: "Planted Oak Sapling",
        tag: "Sapling"
    },
    "1011008": {
        tier: 2,
        name: "Planted Birch Tree",
        tag: "Tree"
    },
    "1011009": {
        tier: 1,
        name: "Planted Beech Tree",
        tag: "Tree"
    },
    "1011010": {
        tier: 1,
        name: "Planted Oak Tree",
        tag: "Tree"
    },
    "1012008": {
        tier: 2,
        name: "Fully Grown Birch Tree",
        tag: "Tree"
    },
    "1012009": {
        tier: 1,
        name: "Fully Grown Beech Tree",
        tag: "Tree"
    },
    "1012010": {
        tier: 1,
        name: "Fully Grown Oak Tree",
        tag: "Tree"
    },
    "1020001": {
        tier: 1,
        name: "Medium Ferralith Vein",
        tag: "Ore Vein"
    },
    "1090000": {
        tier: 1,
        name: "Silken Hexmoths",
        tag: "Insects"
    },
    "1110000": {
        tier: 1,
        name: "Moonlit Crawdads",
        tag: "Baitfish"
    },
    "1110001": {
        tier: 1,
        name: "School Of Breezy Fin Darters ",
        tag: "Lake Fish School"
    },
    "1110002": {
        tier: 1,
        name: "School Of Oceancrest Marlins",
        tag: "Ocean Fish School"
    },
    "1110003": {
        tier: 1,
        name: "Frenzied School Of Oceancrest Marlins",
        tag: "Chummed Ocean Fish School"
    },
    "1110004": {
        tier: 1,
        name: "Seaside Clam",
        tag: "Mollusks"
    },
    "2010008": {
        tier: 1,
        name: "Planted Dendro Sapling",
        tag: "Sapling"
    },
    "2011008": {
        tier: 2,
        name: "Planted Dendro Tree",
        tag: "Tree"
    },
    "2012008": {
        tier: 2,
        name: "Fully Grown Dendro Tree",
        tag: "Tree"
    },
    "2020001": {
        tier: 2,
        name: "Medium Pyrelite Vein",
        tag: "Ore Vein"
    },
    "2020002": {
        tier: 2,
        name: "Large Pyrelite Vein",
        tag: "Ore Vein"
    },
    "2050000": {
        tier: 4,
        name: "Garden Boulder",
        tag: "Rock Boulder"
    },
    "2050001": {
        tier: 2,
        name: "Large Garden Boulder",
        tag: "Rock Outcrop"
    },
    "2110000": {
        tier: 2,
        name: "Driftwood Crayfish",
        tag: "Baitfish"
    },
    "2110001": {
        tier: 2,
        name: "School Of Emberfin Shiners",
        tag: "Lake Fish School"
    },
    "2110002": {
        tier: 2,
        name: "School Of Serpentfish",
        tag: "Ocean Fish School"
    },
    "2110003": {
        tier: 2,
        name: "Frenzied School Of Serpentfish",
        tag: "Chummed Ocean Fish School"
    },
    "2110004": {
        tier: 2,
        name: "Tough Shelled Mussel",
        tag: "Mollusks"
    },
    "2140000": {
        tier: 2,
        name: "Giant Groundsel Plant",
        tag: "Fiber Plant"
    },
    "2390533": {
        tier: 8,
        name: "School Of Mysterious Anglerfish",
        tag: "Ocean Fish School"
    },
    "3010008": {
        tier: 6,
        name: "Planted Maple Sapling",
        tag: "Sapling"
    },
    "3010009": {
        tier: 1,
        name: "Planted Pine Sapling",
        tag: "Sapling"
    },
    "3010010": {
        tier: 1,
        name: "Planted Spruce Sapling",
        tag: "Sapling"
    },
    "3010011": {
        tier: 1,
        name: "Planted Willow Sapling",
        tag: "Sapling"
    },
    "3011008": {
        tier: 6,
        name: "Planted Maple Tree",
        tag: "Tree"
    },
    "3011009": {
        tier: 4,
        name: "Planted Pine Tree",
        tag: "Tree"
    },
    "3011010": {
        tier: 3,
        name: "Planted Spruce Tree",
        tag: "Tree"
    },
    "3011011": {
        tier: 3,
        name: "Planted Willow Tree",
        tag: "Tree"
    },
    "3012008": {
        tier: 6,
        name: "Fully Grown Maple Tree",
        tag: "Tree"
    },
    "3012009": {
        tier: 4,
        name: "Fully Grown Pine Tree",
        tag: "Tree"
    },
    "3012010": {
        tier: 3,
        name: "Fully Grown Spruce Tree",
        tag: "Tree"
    },
    "3012011": {
        tier: 3,
        name: "Fully Grown Willow Tree",
        tag: "Tree"
    },
    "3020001": {
        tier: 3,
        name: "Medium Emarium Vein",
        tag: "Ore Vein"
    },
    "3020002": {
        tier: 3,
        name: "Large Emarium Vein",
        tag: "Ore Vein"
    },
    "3110000": {
        tier: 3,
        name: "Hunchback Prawns",
        tag: "Baitfish"
    },
    "3110001": {
        tier: 3,
        name: "School Of Coralcrest Darter",
        tag: "Lake Fish School"
    },
    "3110002": {
        tier: 3,
        name: "School Of Wavecrest Eels",
        tag: "Ocean Fish School"
    },
    "3110003": {
        tier: 3,
        name: "Frenzied School Of Wavecrest Eels",
        tag: "Chummed Ocean Fish School"
    },
    "3110004": {
        tier: 3,
        name: "Pearlback Snail",
        tag: "Mollusks"
    },
    "4010011": {
        tier: 1,
        name: "Planted Cypress Sapling",
        tag: "Sapling"
    },
    "4011011": {
        tier: 5,
        name: "Planted Cypress Tree",
        tag: "Tree"
    },
    "4012011": {
        tier: 5,
        name: "Fully Grown Cypress Tree",
        tag: "Tree"
    },
    "4050000": {
        tier: 4,
        name: "Garden Pillar",
        tag: "Rock Boulder"
    },
    "4050001": {
        tier: 4,
        name: "Garden Formation",
        tag: "Rock Outcrop"
    },
    "4050002": {
        tier: 4,
        name: "Rocky Garden Pillar",
        tag: "Rock Boulder"
    },
    "4050003": {
        tier: 4,
        name: "Rocky Garden Pillars",
        tag: "Rock Boulder"
    },
    "4050004": {
        tier: 4,
        name: "Rocky Garden Formation",
        tag: "Rock Boulder"
    },
    "4050005": {
        tier: 4,
        name: "Diorite Pillar",
        tag: "Rock Boulder"
    },
    "4050006": {
        tier: 4,
        name: "Large Rocky Garden Pillars",
        tag: "Rock Boulder"
    },
    "4050007": {
        tier: 4,
        name: "Large Rocky Garden Formations",
        tag: "Rock Boulder"
    },
    "4110000": {
        tier: 4,
        name: "Pygmy Lobsters",
        tag: "Baitfish"
    },
    "4110001": {
        tier: 4,
        name: "School Of Mossfin Chub",
        tag: "Lake Fish School"
    },
    "4110002": {
        tier: 4,
        name: "School Of Seastorm Tuna",
        tag: "Ocean Fish School"
    },
    "4110003": {
        tier: 4,
        name: "Frenzied School Of Seastorm Tuna",
        tag: "Chummed Ocean Fish School"
    },
    "4110004": {
        tier: 4,
        name: "Crystal Shell Scallop",
        tag: "Mollusks"
    },
    "5045122": {
        tier: 7,
        name: "School Of Tidebreaker Barracuda",
        tag: "Ocean Fish School"
    },
    "5050000": {
        tier: 5,
        name: "Garden Pillar Interior",
        tag: "Rock Boulder"
    },
    "5050001": {
        tier: 5,
        name: "Garden Formation Interior",
        tag: "Rock Outcrop"
    },
    "5050002": {
        tier: 5,
        name: "Diorite Pillar Interior",
        tag: "Rock Boulder"
    },
    "5110000": {
        tier: 5,
        name: "Golden Crawfish",
        tag: "Baitfish"
    },
    "5110001": {
        tier: 5,
        name: "School Of Emberscale Sturgeon",
        tag: "Lake Fish School"
    },
    "5110002": {
        tier: 5,
        name: "School Of Azure Sharks",
        tag: "Ocean Fish School"
    },
    "5110003": {
        tier: 5,
        name: "Frenzied School Of Azure Sharks",
        tag: "Chummed Ocean Fish School"
    },
    "5110004": {
        tier: 5,
        name: "Armored Reef Clam",
        tag: "Mollusks"
    },
    "6110000": {
        tier: 6,
        name: "Sunrise Shrimp",
        tag: "Baitfish"
    },
    "6110001": {
        tier: 6,
        name: "School Of Hexfin Perch",
        tag: "Lake Fish School"
    },
    "6110002": {
        tier: 6,
        name: "School Of Abyssal Swordfish",
        tag: "Ocean Fish School"
    },
    "6110003": {
        tier: 6,
        name: "Frenzied School Of Abyssal Swordfish",
        tag: "Chummed Ocean Fish School"
    },
    "6110004": {
        tier: 6,
        name: "Abyssal Oyster",
        tag: "Mollusks"
    },
    "20400246": {
        tier: 9,
        name: "Umbracite Vein Interior Depleted",
        tag: "Ore Vein"
    },
    "20857160": {
        tier: 8,
        name: "Celestium Outcrop Interior",
        tag: "Ore Vein"
    },
    "49710228": {
        tier: 5,
        name: "Luminite Outcrop Interior Depleted",
        tag: "Ore Vein"
    },
    "61557407": {
        tier: 7,
        name: "Web Covered Chest",
        tag: "Dungeon Resource"
    },
    "64125498": {
        tier: 9,
        name: "Umbracite Vein Interior",
        tag: "Ore Vein"
    },
    "70663203": {
        tier: 10,
        name: "Tier 10 Boulder",
        tag: "Rock Boulder"
    },
    "71559749": {
        tier: 8,
        name: "Celestium Vein Interior Depleted",
        tag: "Ore Vein"
    },
    "92565503": {
        tier: 3,
        name: "Ancient Rubble",
        tag: "Dungeon Resource"
    },
    "93152192": {
        tier: 10,
        name: "Flawless Hieroglyphs",
        tag: "Research"
    },
    "109403116": {
        tier: -1,
        name: "Large Araknir Spawner",
        tag: "Enemy Spawner"
    },
    "134935169": {
        tier: 2,
        name: "Pyrelite Vein Interior Depleted",
        tag: "Ore Vein"
    },
    "139483458": {
        tier: 7,
        name: "Aurumite Vein",
        tag: "Ore Vein"
    },
    "152428426": {
        tier: 1,
        name: "Medium Ferralith Vein Interior Depleted",
        tag: "Ore Vein"
    },
    "182331452": {
        tier: 1,
        name: "Traveler's Fruit",
        tag: "Wonder Resource"
    },
    "189403270": {
        tier: 9,
        name: "Tier 9 Fibers",
        tag: "Fiber Plant"
    },
    "198759779": {
        tier: 3,
        name: "Emarium Outcrop Interior",
        tag: "Ore Vein"
    },
    "204021372": {
        tier: 1,
        name: "Rough Sand Pile",
        tag: "Sand"
    },
    "205387239": {
        tier: 4,
        name: "Medium Elenvar Vein Interior Depleted",
        tag: "Ore Vein"
    },
    "218270468": {
        tier: 1,
        name: "Ferralith Outcrop Interior",
        tag: "Ore Vein"
    },
    "233091253": {
        tier: -1,
        name: "Ancient Broken Bridge",
        tag: "Dungeon Obstacle"
    },
    "246146358": {
        tier: 6,
        name: "Rathium Vein Interior Depleted",
        tag: "Ore Vein"
    },
    "284200468": {
        tier: 9,
        name: "Tier 9 Flower",
        tag: "Flower"
    },
    "322711580": {
        tier: 1,
        name: "Faint Hexite Energy Font",
        tag: "Energy Font"
    },
    "331687458": {
        tier: 9,
        name: "Magnificient Hieroglyphs",
        tag: "Research"
    },
    "368570220": {
        tier: 6,
        name: "Cranberry Bush",
        tag: "Berry"
    },
    "370078223": {
        tier: 10,
        name: "Astralite Outcrop Interior",
        tag: "Ore Vein"
    },
    "374159821": {
        tier: 10,
        name: "School Of Flawless Lakefish",
        tag: "Lake Fish School"
    },
    "379219978": {
        tier: 3,
        name: "Medium Emarium Vein Interior",
        tag: "Ore Vein"
    },
    "384211022": {
        tier: 2,
        name: "Giant Pumpkin Pile",
        tag: "Seasonal"
    },
    "387666932": {
        tier: 7,
        name: "Tier 7 Tree",
        tag: "Tree"
    },
    "411376268": {
        tier: 7,
        name: "Aurumite Vein Interior Depleted",
        tag: "Ore Vein"
    },
    "424796674": {
        tier: 10,
        name: "School Of Flawless Ocean Fish",
        tag: "Ocean Fish School"
    },
    "457752715": {
        tier: 8,
        name: "Pristine Sand",
        tag: "Sand"
    },
    "464034838": {
        tier: 2,
        name: "Olivine Sand",
        tag: "Sand"
    },
    "473828668": {
        tier: 10,
        name: "Bamboo",
        tag: "Fiber Plant"
    },
    "474230316": {
        tier: 1,
        name: "Ferralith Outcrop Interior Depleted",
        tag: "Ore Vein"
    },
    "479638263": {
        tier: 8,
        name: "Tier 8 Boulder",
        tag: "Rock Boulder"
    },
    "487003651": {
        tier: 3,
        name: "Ancient Armor Rack",
        tag: "Dungeon Resource"
    },
    "505488132": {
        tier: 8,
        name: "Pristine Clay",
        tag: "Clay"
    },
    "509854054": {
        tier: 8,
        name: "Frenzied School Of Mysterious Anglerfish",
        tag: "Chummed Ocean Fish School"
    },
    "532077242": {
        tier: 4,
        name: "Indigo Milk Cap",
        tag: "Mushroom"
    },
    "541862086": {
        tier: 4,
        name: "Garnet Sand",
        tag: "Sand"
    },
    "545609744": {
        tier: 7,
        name: "Araknir Eggs",
        tag: "Dungeon Resource"
    },
    "546753273": {
        tier: 3,
        name: "Ancient Coffer",
        tag: "Dungeon Resource"
    },
    "549538391": {
        tier: 5,
        name: "Medium Luminite Vein Interior",
        tag: "Ore Vein"
    },
    "562432497": {
        tier: 9,
        name: "Magnificient Sand",
        tag: "Sand"
    },
    "569033113": {
        tier: -1,
        name: "Small Araknir Spawner",
        tag: "Enemy Spawner"
    },
    "582591086": {
        tier: 7,
        name: "Ornate Berry Bush",
        tag: "Berry"
    },
    "586543849": {
        tier: 7,
        name: "Ornate Mushroom",
        tag: "Mushroom"
    },
    "623041128": {
        tier: 2,
        name: "Sunflower",
        tag: "Seasonal"
    },
    "642972236": {
        tier: 5,
        name: "Luminite Outcrop Interior",
        tag: "Ore Vein"
    },
    "650019671": {
        tier: 8,
        name: "Medium Celestium Vein Interior Depleted",
        tag: "Ore Vein"
    },
    "699727318": {
        tier: 2,
        name: "Medium Pyrelite Vein Interior",
        tag: "Ore Vein"
    },
    "702104027": {
        tier: 6,
        name: "Clay Termite Mound",
        tag: "Clay"
    },
    "715451185": {
        tier: 4,
        name: "Blueberry Bush",
        tag: "Berry"
    },
    "722506673": {
        tier: 8,
        name: "School Of Rainbowscaled Tilapia",
        tag: "Lake Fish School"
    },
    "723013812": {
        tier: 7,
        name: "Tier 7 Flower",
        tag: "Flower"
    },
    "746946997": {
        tier: 2,
        name: "Hexite Energy Font",
        tag: "Energy Font"
    },
    "749656892": {
        tier: 9,
        name: "Medium Umbracite Vein Interior Depleted",
        tag: "Ore Vein"
    },
    "750444302": {
        tier: 6,
        name: "Medium Rathium Vein Interior Depleted",
        tag: "Ore Vein"
    },
    "756579517": {
        tier: 9,
        name: "Magnificient Baitfish",
        tag: "Baitfish"
    },
    "762731569": {
        tier: 6,
        name: "Palmetto",
        tag: "Fiber Plant"
    },
    "763946195": {
        tier: 1,
        name: "TEST BirdSpawn",
        tag: "Stick"
    },
    "773149133": {
        tier: 6,
        name: "Medium Rathium Vein Interior",
        tag: "Ore Vein"
    },
    "782933576": {
        tier: 4,
        name: "Elenvar Outcrop Interior",
        tag: "Ore Vein"
    },
    "789563787": {
        tier: 4,
        name: "Strong Hexite Energy Font",
        tag: "Energy Font"
    },
    "806722041": {
        tier: 4,
        name: "Elenvar Vein Interior Depleted",
        tag: "Ore Vein"
    },
    "814703516": {
        tier: 9,
        name: "Umbracite Outcrop Interior",
        tag: "Ore Vein"
    },
    "822745882": {
        tier: 3,
        name: "Ancient Pots",
        tag: "Dungeon Resource"
    },
    "826362353": {
        tier: 7,
        name: "Frenzied School Of Tidebreaker Barracuda",
        tag: "Chummed Ocean Fish School"
    },
    "834195042": {
        tier: 7,
        name: "Ornate Clay",
        tag: "Clay"
    },
    "875245395": {
        tier: 6,
        name: "Mistberry Bush",
        tag: "Berry"
    },
    "887736443": {
        tier: 5,
        name: "Luminite Vein Interior",
        tag: "Ore Vein"
    },
    "904022325": {
        tier: 7,
        name: "School Of Speedy Glowfin",
        tag: "Lake Fish School"
    },
    "916586661": {
        tier: 6,
        name: "Rathium Outcrop Interior",
        tag: "Ore Vein"
    },
    "932989637": {
        tier: 6,
        name: "Powerful Hexite Energy Font",
        tag: "Energy Font"
    },
    "939382648": {
        tier: 10,
        name: "Wisteria Tree",
        tag: "Tree"
    },
    "939701809": {
        tier: 9,
        name: "Gigantic Sapwood Tree",
        tag: "Tree"
    },
    "963451338": {
        tier: 9,
        name: "Magnificient Berry Bush",
        tag: "Berry"
    },
    "986344159": {
        tier: 3,
        name: "Medium Emarium Vein Interior Depleted",
        tag: "Ore Vein"
    },
    "999376882": {
        tier: 6,
        name: "Desert Sand",
        tag: "Sand"
    },
    "1005142992": {
        tier: 5,
        name: "Elephant Fibers",
        tag: "Fiber Plant"
    },
    "1006230316": {
        tier: 10,
        name: "Frenzied School Of Flawless Ocean Fish",
        tag: "Chummed Ocean Fish School"
    },
    "1023127595": {
        tier: 10,
        name: "Flawless Clay",
        tag: "Clay"
    },
    "1043012047": {
        tier: -1,
        name: "Lost Shipment",
        tag: "Sailing Cargo"
    },
    "1045808810": {
        tier: 2,
        name: "Pyrelite Outcrop Interior",
        tag: "Ore Vein"
    },
    "1064484466": {
        tier: 3,
        name: "Emarium Outcrop Interior Depleted",
        tag: "Ore Vein"
    },
    "1072537375": {
        tier: 3,
        name: "Russala",
        tag: "Mushroom"
    },
    "1073998942": {
        tier: 2,
        name: "Snow Pile",
        tag: "Seasonal"
    },
    "1077990023": {
        tier: 4,
        name: "Elenvar Vein Interior",
        tag: "Ore Vein"
    },
    "1101060328": {
        tier: 8,
        name: "Ficus Tree",
        tag: "Tree"
    },
    "1103361264": {
        tier: -1,
        name: "Ancient Repaired Bridge",
        tag: "Dungeon Obstacle"
    },
    "1113640469": {
        tier: 9,
        name: "Tier 9 Outcrop",
        tag: "Rock Outcrop"
    },
    "1125409070": {
        tier: 8,
        name: "Tier 8 Fibers",
        tag: "Fiber Plant"
    },
    "1126774401": {
        tier: 5,
        name: "Medium Luminite Vein Interior Depleted",
        tag: "Ore Vein"
    },
    "1133243991": {
        tier: 7,
        name: "Web Encased Chest",
        tag: "Dungeon Resource"
    },
    "1141184831": {
        tier: 9,
        name: "Frenzied School Of Magnificient Ocean Fish",
        tag: "Chummed Ocean Fish School"
    },
    "1157887989": {
        tier: 9,
        name: "School Of Magnificient Lake Fish",
        tag: "Lake Fish School"
    },
    "1159270109": {
        tier: 10,
        name: "Tier 10 Tree",
        tag: "Tree"
    },
    "1162923141": {
        tier: 8,
        name: "Celestium Vein Interior",
        tag: "Ore Vein"
    },
    "1171246287": {
        tier: 7,
        name: "Medium Aurumite Vein Interior Depleted",
        tag: "Ore Vein"
    },
    "1180909566": {
        tier: 3,
        name: "Crystalized Sand",
        tag: "Sand"
    },
    "1241355606": {
        tier: 9,
        name: "Umbracite Outcrop Interior Depleted",
        tag: "Ore Vein"
    },
    "1260515599": {
        tier: 3,
        name: "Large Ancient Rubble",
        tag: "Dungeon Resource"
    },
    "1262898141": {
        tier: 7,
        name: "Misty Crustacean",
        tag: "Baitfish"
    },
    "1264935363": {
        tier: 8,
        name: "Tier 8 Flower",
        tag: "Flower"
    },
    "1283632905": {
        tier: 1,
        name: "Traveler's Fruit (Depleted)",
        tag: "Wonder Resource"
    },
    "1283711960": {
        tier: 10,
        name: "Flawless Baitfish",
        tag: "Baitfish"
    },
    "1293969473": {
        tier: -1,
        name: "Lost Treasure",
        tag: "Sailing Cargo"
    },
    "1303955933": {
        tier: 1,
        name: "Traveler's Tree",
        tag: "Wonder Resource"
    },
    "1318826480": {
        tier: 6,
        name: "Rathium Outcrop Interior Depleted",
        tag: "Ore Vein"
    },
    "1332535555": {
        tier: 7,
        name: "Ornate Sand",
        tag: "Sand"
    },
    "1332797261": {
        tier: 8,
        name: "Celestium Vein",
        tag: "Ore Vein"
    },
    "1333270269": {
        tier: 10,
        name: "Flawless Sand",
        tag: "Sand"
    },
    "1357154092": {
        tier: 10,
        name: "Astralite Vein Interior Depleted",
        tag: "Ore Vein"
    },
    "1365934955": {
        tier: 5,
        name: "Luminite Vein Interior Depleted",
        tag: "Ore Vein"
    },
    "1384946093": {
        tier: 9,
        name: "Medium Umbracite Vein Interior",
        tag: "Ore Vein"
    },
    "1386735112": {
        tier: 9,
        name: "Umbracite Vein",
        tag: "Ore Vein"
    },
    "1423928615": {
        tier: 8,
        name: "Tier 8 Outcrop",
        tag: "Rock Outcrop"
    },
    "1424784087": {
        tier: 2,
        name: "Large Gift Pile",
        tag: "Seasonal"
    },
    "1435874592": {
        tier: 1,
        name: "Traveler's Tree (Depleted)",
        tag: "Wonder Resource"
    },
    "1440062914": {
        tier: 7,
        name: "Tier 7 Boulder",
        tag: "Rock Boulder"
    },
    "1444297495": {
        tier: 10,
        name: "Medium Astralite Vein Interior Depleted",
        tag: "Ore Vein"
    },
    "1452484871": {
        tier: 10,
        name: "Medium Astralite Vein Interior",
        tag: "Ore Vein"
    },
    "1458811602": {
        tier: 9,
        name: "Seaweed",
        tag: "Fiber Plant"
    },
    "1467799531": {
        tier: 10,
        name: "Dewberry Bush",
        tag: "Berry"
    },
    "1477126404": {
        tier: -1,
        name: "Lost Wreckage",
        tag: "Sailing Cargo"
    },
    "1489491467": {
        tier: 10,
        name: "Tier 10 Fibers",
        tag: "Fiber Plant"
    },
    "1526038154": {
        tier: 9,
        name: "Magnificient Clay",
        tag: "Clay"
    },
    "1526350171": {
        tier: 10,
        name: "Astralite Outcrop Interior Depleted",
        tag: "Ore Vein"
    },
    "1551712725": {
        tier: 2,
        name: "Pumpkin",
        tag: "Seasonal"
    },
    "1558728865": {
        tier: 8,
        name: "Sparkling Prawn",
        tag: "Baitfish"
    },
    "1565420196": {
        tier: 1,
        name: "Medium Ferralith Vein Interior",
        tag: "Ore Vein"
    },
    "1566846336": {
        tier: 4,
        name: "Rosewood Tree",
        tag: "Tree"
    },
    "1567694896": {
        tier: 8,
        name: "Pristine Hieroglyphs",
        tag: "Research"
    },
    "1574437474": {
        tier: 9,
        name: "Sapwood Tree",
        tag: "Tree"
    },
    "1574537885": {
        tier: 3,
        name: "Ancient Weapon Rack",
        tag: "Dungeon Resource"
    },
    "1579330042": {
        tier: 7,
        name: "Yellow Apricot Bush",
        tag: "Berry"
    },
    "1592739620": {
        tier: 8,
        name: "Pristine Berry Bush",
        tag: "Berry"
    },
    "1606770008": {
        tier: 10,
        name: "Astralite Vein",
        tag: "Ore Vein"
    },
    "1619369727": {
        tier: 2,
        name: "Pyrelite Vein Interior",
        tag: "Ore Vein"
    },
    "1637125903": {
        tier: 10,
        name: "Flawless Mushroom",
        tag: "Mushroom"
    },
    "1657885116": {
        tier: 8,
        name: "Pristine Mushroom",
        tag: "Mushroom"
    },
    "1673056013": {
        tier: 2,
        name: "Terrified Adventurer's Note",
        tag: "Note"
    },
    "1689263994": {
        tier: 7,
        name: "Aurumite Outcrop Interior Depleted",
        tag: "Ore Vein"
    },
    "1691492474": {
        tier: 5,
        name: "Coral Sand",
        tag: "Sand"
    },
    "1709170104": {
        tier: 4,
        name: "Elenvar Outcrop Interior Depleted",
        tag: "Ore Vein"
    },
    "1731709368": {
        tier: 8,
        name: "Overwhelming Hexite Energy Font",
        tag: "Energy Font"
    },
    "1742959882": {
        tier: 9,
        name: "Magnificient Mushroom",
        tag: "Mushroom"
    },
    "1747556974": {
        tier: 10,
        name: "Astralite Vein Interior",
        tag: "Ore Vein"
    },
    "1774107141": {
        tier: -1,
        name: "Ancient Chest",
        tag: "Ancient Loot"
    },
    "1800013378": {
        tier: 7,
        name: "Medium Aurumite Vein Interior",
        tag: "Ore Vein"
    },
    "1812221896": {
        tier: 9,
        name: "School Of Magnificient Ocean Fish",
        tag: "Ocean Fish School"
    },
    "1821415333": {
        tier: 9,
        name: "Mature Sapwood Tree",
        tag: "Tree"
    },
    "1823420883": {
        tier: -1,
        name: "Decayed Ancient Pots",
        tag: "Ancient Loot"
    },
    "1828992183": {
        tier: 2,
        name: "Pyrelite Outcrop Interior Depleted",
        tag: "Ore Vein"
    },
    "1842369948": {
        tier: 2,
        name: "Medium Pyrelite Vein Interior Depleted",
        tag: "Ore Vein"
    },
    "1902966974": {
        tier: 9,
        name: "Tier 9 Boulder",
        tag: "Rock Boulder"
    },
    "1908426535": {
        tier: 3,
        name: "Windswept Tree",
        tag: "Tree"
    },
    "1917261269": {
        tier: 4,
        name: "Jute",
        tag: "Fiber Plant"
    },
    "1917744937": {
        tier: 1,
        name: "Ferralith Vein Interior Depleted",
        tag: "Ore Vein"
    },
    "1954847232": {
        tier: 9,
        name: "Black Fig Bush",
        tag: "Berry"
    },
    "1962517199": {
        tier: 1,
        name: "Ferralith Vein Interior",
        tag: "Ore Vein"
    },
    "1981854097": {
        tier: 7,
        name: "Tier 7 Fibers",
        tag: "Fiber Plant"
    },
    "1986100626": {
        tier: 10,
        name: "Tier 10 Flower",
        tag: "Flower"
    },
    "1996631377": {
        tier: 10,
        name: "Tier 10 Outcrop",
        tag: "Rock Outcrop"
    },
    "2022104490": {
        tier: 3,
        name: "Broken Ancient Pots",
        tag: "Dungeon Resource"
    },
    "2025189123": {
        tier: 8,
        name: "Medium Celestium Vein Interior",
        tag: "Ore Vein"
    },
    "2027405944": {
        tier: 6,
        name: "Rathium Vein Interior",
        tag: "Ore Vein"
    },
    "2031243337": {
        tier: 7,
        name: "Aurumite Vein Interior",
        tag: "Ore Vein"
    },
    "2066552867": {
        tier: 4,
        name: "Medium Elenvar Vein Interior",
        tag: "Ore Vein"
    },
    "2068688558": {
        tier: 3,
        name: "Emarium Vein Interior Depleted",
        tag: "Ore Vein"
    },
    "2072988001": {
        tier: 3,
        name: "Emarium Vein Interior",
        tag: "Ore Vein"
    },
    "2073862342": {
        tier: 7,
        name: "Aurumite Outcrop Interior",
        tag: "Ore Vein"
    },
    "2089197796": {
        tier: 10,
        name: "Enoki",
        tag: "Mushroom"
    },
    "2104975743": {
        tier: 7,
        name: "Tier 7 Outcrop",
        tag: "Rock Outcrop"
    },
    "2110330714": {
        tier: 10,
        name: "Flawless Berry Bush",
        tag: "Berry"
    },
    "2124845482": {
        tier: 7,
        name: "Ornate Hieroglyphs",
        tag: "Research"
    },
    "2140754992": {
        tier: 8,
        name: "Celestium Outcrop Interior Depleted",
        tag: "Ore Vein"
    },
    "2144918116": {
        tier: 1,
        name: "Daisy",
        tag: "Flower"
    },
    "2145270439": {
        tier: -1,
        name: "Jakyl Den",
        tag: "Monster Den"
    }
}

const creatureIndex = {
    "18": {
        tier: 1,
        name: "Alpha Jakyl"
    },
    "27": {
        tier: 1,
        name: "Alpha Umbura"
    },
    "40": {
        tier: 1,
        name: "Araknir Nest"
    },
    "4": {
        tier: 4,
        name: "Ardea"
    },
    "37": {
        tier: 1,
        name: "Cave Skitch"
    },
    "21": {
        tier: 1,
        name: "Desert Crab"
    },
    "16": {
        tier: 10,
        name: "Desert Terrorbird"
    },
    "3": {
        tier: 5,
        name: "Dromai"
    },
    "29": {
        tier: 1,
        name: "Drone"
    },
    "12": {
        tier: 8,
        name: "Elder Scrofa"
    },
    "7": {
        tier: 3,
        name: "Female Cervus"
    },
    "10": {
        tier: 4,
        name: "Female Scrofa"
    },
    "32": {
        tier: 1,
        name: "Feral Sentinel"
    },
    "22": {
        tier: 1,
        name: "Frost Crab"
    },
    "36": {
        tier: 1,
        name: "Giant Skitch"
    },
    "17": {
        tier: 1,
        name: "Jakyl"
    },
    "15": {
        tier: 7,
        name: "Jungle Terrorbird"
    },
    "19": {
        tier: 1,
        name: "King Jakyl"
    },
    "28": {
        tier: 1,
        name: "King Umbura"
    },
    "8": {
        tier: 3,
        name: "Male Cervus"
    },
    "11": {
        tier: 4,
        name: "Male Scrofa"
    },
    "38": {
        tier: 1,
        name: "Massive Araknir"
    },
    "5": {
        tier: 2,
        name: "Nubi Goat"
    },
    "13": {
        tier: 5,
        name: "Ox"
    },
    "1": {
        tier: 1,
        name: "Practice Dummy"
    },
    "31": {
        tier: 1,
        name: "Queen"
    },
    "9": {
        tier: 4,
        name: "Rangifer"
    },
    "2": {
        tier: 1,
        name: "Sagi Bird"
    },
    "20": {
        tier: 1,
        name: "Skitch"
    },
    "39": {
        tier: 1,
        name: "Small Araknir"
    },
    "30": {
        tier: 1,
        name: "Soldier"
    },
    "33": {
        tier: 1,
        name: "Subterranean Jakyl"
    },
    "35": {
        tier: 1,
        name: "Subterranean Jakyl Protector"
    },
    "34": {
        tier: 1,
        name: "Subterranean Skitch"
    },
    "24": {
        tier: 1,
        name: "Swamp Terratoad"
    },
    "23": {
        tier: 1,
        name: "Terratoad"
    },
    "14": {
        tier: 9,
        name: "Tundra Ox"
    },
    "26": {
        tier: 1,
        name: "Umbura"
    },
    "6": {
        tier: 6,
        name: "Yagi"
    }
}