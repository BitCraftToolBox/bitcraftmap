"use strict"

const resourceIndexOverride = { // manual override of tiers names and colors for specific items
    "1": { tier: 1, name: "Sticks" }, // sticks
    "1477126404": { tier: 1, name: "Lost Wreckage" },
    "1043012047": { tier: 2, name: "Lost Shipment" },
    "1293969473": { tier: 5, name: "Lost Treasure" },
    "182331452": { tier: 1, name: "Traveler's Fruit", color: "#5089d9" },
};


const resourceIndex = { // Generated array
    "1": {
        tier: 1,
            name: "Sticks"
    },
    "2": {
        tier: 1,
            name: "Bush"
    },
    "3": {
        tier: 1,
            name: "Rotten Log"
    },
    "4": {
        tier: 1,
            name: "Rotten Stump"
    },
    "5": {
        tier: 6,
            name: "Maple Sapling"
    },
    "6": {
        tier: 1,
            name: "Pine Sapling"
    },
    "7": {
        tier: 1,
            name: "Spruce Sapling"
    },
    "8": {
        tier: 1,
            name: "Oak Sapling"
    },
    "9": {
        tier: 2,
            name: "Birch Sapling"
    },
    "10": {
        tier: 1,
            name: "Beech Sapling"
    },
    "11": {
        tier: 1,
            name: "Dead Tree"
    },
    "12": {
        tier: 1,
            name: "Young Beech Tree"
    },
    "13": {
        tier: 2,
            name: "Young Birch Tree"
    },
    "14": {
        tier: 1,
            name: "Young Oak Tree"
    },
    "15": {
        tier: 3,
            name: "Young Spruce Tree"
    },
    "16": {
        tier: 4,
            name: "Young Pine Tree"
    },
    "17": {
        tier: 6,
            name: "Young Maple Tree"
    },
    "18": {
        tier: 2,
            name: "Dendro Tree"
    },
    "19": {
        tier: 1,
            name: "Mature Beech Tree"
    },
    "20": {
        tier: 2,
            name: "Mature Birch Tree"
    },
    "21": {
        tier: 1,
            name: "Mature Oak Tree"
    },
    "22": {
        tier: 3,
            name: "Large Stump"
    },
    "23": {
        tier: 6,
            name: "Ancient Oak Tree"
    },
    "24": {
        tier: 6,
            name: "Gnarled Maple Tree"
    },
    "25": {
        tier: 6,
            name: "Mature Maple Tree"
    },
    "26": {
        tier: 4,
            name: "Mature Pine Tree"
    },
    "27": {
        tier: 3,
            name: "Mature Spruce Tree"
    },
    "28": {
        tier: 3,
            name: "Large Fallen Tree"
    },
    "29": {
        tier: 2,
            name: "Large Tree Stump"
    },
    "30": {
        tier: 5,
            name: "Stunted Cypress Tree"
    },
    "31": {
        tier: 5,
            name: "Dead Cypress Tree"
    },
    "32": {
        tier: 4,
            name: "Ancient Pine Tree"
    },
    "33": {
        tier: 5,
            name: "Mature Cypress Tree"
    },
    "34": {
        tier: 5,
            name: "Ancient Cypress Tree"
    },
    "35": {
        tier: 7,
            name: "Young Baobab Tree"
    },
    "36": {
        tier: 7,
            name: "Ancient Baobab Tree"
    },
    "38": {
        tier: 1,
            name: "Flint Pile"
    },
    "40": {
        tier: 1,
            name: "Limestone Boulder"
    },
    "41": {
        tier: 1,
            name: "Limestone Outcrop"
    },
    "42": {
        tier: 1,
            name: "Large Limestone Outcrop"
    },
    "43": {
        tier: 1,
            name: "Large Limestone Rock"
    },
    "44": {
        tier: 1,
            name: "Large Limestone Boulder"
    },
    "45": {
        tier: 1,
            name: "Limestone Rock Formation"
    },
    "46": {
        tier: 2,
            name: "Shale Boulder"
    },
    "47": {
        tier: 2,
            name: "Shale Outcrop"
    },
    "48": {
        tier: 2,
            name: "Sandstone Boulder"
    },
    "49": {
        tier: 2,
            name: "Sandstone Outcrop"
    },
    "50": {
        tier: 3,
            name: "Granite Boulder"
    },
    "51": {
        tier: 3,
            name: "Granite Outcrop"
    },
    "52": {
        tier: 4,
            name: "Basalt Outcrop"
    },
    "53": {
        tier: 4,
            name: "Basalt Stalagmite"
    },
    "54": {
        tier: 5,
            name: "Diorite Outcrop"
    },
    "55": {
        tier: 5,
            name: "Diorite Boulder"
    },
    "56": {
        tier: 6,
            name: "Marble Outcrop"
    },
    "57": {
        tier: 6,
            name: "Marble Boulder"
    },
    "58": {
        tier: 1,
            name: "Ferralith Vein"
    },
    "59": {
        tier: 1,
            name: "Ferralith Outcrop"
    },
    "60": {
        tier: 1,
            name: "Rich Ferralith Vein"
    },
    "61": {
        tier: 2,
            name: "Pyrelite Vein"
    },
    "62": {
        tier: 3,
            name: "Emarium Vein"
    },
    "63": {
        tier: 4,
            name: "Elenvar Vein"
    },
    "64": {
        tier: 5,
            name: "Luminite Vein"
    },
    "65": {
        tier: 6,
            name: "Rathium Vein"
    },
    "66": {
        tier: 1,
            name: "Mud Mound"
    },
    "67": {
        tier: 2,
            name: "Clay Mound"
    },
    "68": {
        tier: 3,
            name: "Earthenware Clay"
    },
    "69": {
        tier: 4,
            name: "Fine Clay"
    },
    "70": {
        tier: 5,
            name: "Kaolinite Clay"
    },
    "71": {
        tier: 6,
            name: "Bentonite Clay"
    },
    "72": {
        tier: 1,
            name: "Wild Grains"
    },
    "73": {
        tier: 1,
            name: "Strawberry Bush"
    },
    "74": {
        tier: 1,
            name: "Button Mushrooms"
    },
    "75": {
        tier: 5,
            name: "Blackberry Bush"
    },
    "76": {
        tier: 7,
            name: "Oyster Mushrooms"
    },
    "77": {
        tier: 2,
            name: "Prickly Pear"
    },
    "78": {
        tier: 3,
            name: "Juniper Berry Bush"
    },
    "79": {
        tier: 2,
            name: "Chanterelles"
    },
    "80": {
        tier: 2,
            name: "Honeyberry Bush"
    },
    "81": {
        tier: 6,
            name: "Morel Mushrooms"
    },
    "82": {
        tier: 5,
            name: "Truffle Patch"
    },
    "83": {
        tier: 9,
            name: "King Trumpet"
    },
    "84": {
        tier: 8,
            name: "Cloudberry Bush"
    },
    "85": {
        tier: 8,
            name: "Ghost Mushroom"
    },
    "86": {
        tier: 9,
            name: "Citriformis"
    },
    "87": {
        tier: 2,
            name: "Dandelions"
    },
    "88": {
        tier: 1,
            name: "Daisies"
    },
    "89": {
        tier: 1,
            name: "Lavender"
    },
    "90": {
        tier: 1,
            name: "Lavender Cluster"
    },
    "91": {
        tier: 1,
            name: "Small Lavender Cluster"
    },
    "92": {
        tier: 4,
            name: "Bluebell"
    },
    "93": {
        tier: 3,
            name: "Aloe"
    },
    "94": {
        tier: 2,
            name: "Peppermint"
    },
    "95": {
        tier: 3,
            name: "Snowdrop Flowers"
    },
    "96": {
        tier: 3,
            name: "Marigold"
    },
    "97": {
        tier: 3,
            name: "Thyme"
    },
    "98": {
        tier: 5,
            name: "Morning Glory"
    },
    "99": {
        tier: 6,
            name: "Desert Rose"
    },
    "100": {
        tier: 4,
            name: "Rosemary"
    },
    "101": {
        tier: 6,
            name: "Fireweed"
    },
    "102": {
        tier: 10,
            name: "White Lily"
    },
    "103": {
        tier: 5,
            name: "Ghost Thyme"
    },
    "104": {
        tier: 7,
            name: "Golden Witlow"
    },
    "105": {
        tier: 8,
            name: "King of the Alps"
    },
    "125": {
        tier: 2,
            name: "Ferns"
    },
    "127": {
        tier: 2,
            name: "Pine Weed"
    },
    "128": {
        tier: 7,
            name: "Grassy Reeds"
    },
    "129": {
        tier: 7,
            name: "Reindeer Lichen"
    },
    "130": {
        tier: 3,
            name: "Ghost Succulent"
    },
    "131": {
        tier: 3,
            name: "Bullrushes"
    },
    "132": {
        tier: 3,
            name: "Spanish Moss"
    },
    "133": {
        tier: 4,
            name: "Thorny Stump"
    },
    "134": {
        tier: 4,
            name: "Brambles"
    },
    "135": {
        tier: 5,
            name: "Heather"
    },
    "136": {
        tier: 5,
            name: "Large Brambles"
    },
    "137": {
        tier: 8,
            name: "Arctic Grass"
    },
    "138": {
        tier: 5,
            name: "Pink Lilies"
    },
    "139": {
        tier: 6,
            name: "Ancient Thorns"
    },
    "140": {
        tier: 1,
            name: "Rough Hieroglyphs"
    },
    "141": {
        tier: 2,
            name: "Simple Hieroglyphs"
    },
    "142": {
        tier: 3,
            name: "Neat Hieroglyphs"
    },
    "143": {
        tier: 4,
            name: "Fine Hieroglyphs"
    },
    "144": {
        tier: 5,
            name: "Exquisite Hieroglyphs"
    },
    "145": {
        tier: 6,
            name: "Peerless Hieroglyphs"
    },
    "152": {
        tier: 1,
            name: "Gem Encrusted Stalagmite"
    },
    "153": {
        tier: 3,
            name: "Fossils"
    },
    "154": {
        tier: 3,
            name: "Sandcovered Fossils"
    },
    "156": {
        tier: 1,
            name: "Wild Starbulb Plant"
    },
    "158": {
        tier: 1,
            name: "Salt Deposit"
    },
    "159": {
        tier: 1,
            name: "Vines"
    },
    "160": {
        tier: 1,
            name: "Root"
    },
    "161": {
        tier: 1,
            name: "Rubble"
    },
    "162": {
        tier: 1,
            name: "Ancient Door"
    },
    "163": {
        tier: 1,
            name: "Ancient Blue Door"
    },
    "164": {
        tier: 1,
            name: "Ancient Red Door"
    },
    "165": {
        tier: 1,
            name: "Ancient Green Door"
    },
    "166": {
        tier: 1,
            name: "Ancient Yellow Door"
    },
    "167": {
        tier: 1,
            name: "Complicated Ancient Door"
    },
    "168": {
        tier: 1,
            name: "Ancient Door "
    },
    "169": {
        tier: 1,
            name: "Ancient Door   "
    },
    "170": {
        tier: 1,
            name: "Large Rubble"
    },
    "171": {
        tier: 1,
            name: "Ancient Brazier"
    },
    "172": {
        tier: 1,
            name: "Ancient Brazier "
    },
    "173": {
        tier: 1,
            name: "Lit Ancient Brazier"
    },
    "174": {
        tier: 1,
            name: "Broken Ancient Brazier"
    },
    "175": {
        tier: 1,
            name: "Hexite Aurumite Axe"
    },
    "176": {
        tier: 2,
            name: "Collapsed Pillars"
    },
    "177": {
        tier: 1,
            name: "Lit Wooden Brazier"
    },
    "178": {
        tier: 1,
            name: "Wooden Brazier"
    },
    "179": {
        tier: 2,
            name: "Vines T2"
    },
    "180": {
        tier: 2,
            name: "Root T2"
    },
    "181": {
        tier: 2,
            name: "Rubble T2"
    },
    "182": {
        tier: 1,
            name: "Lit Wooden Brazier "
    },
    "183": {
        tier: 1,
            name: "Wooden Brazier "
    },
    "184": {
        tier: 1,
            name: "Collapsed Pillar"
    },
    "185": {
        tier: 1,
            name: "Ancient Adventurer's Letter"
    },
    "186": {
        tier: 1,
            name: "Ancient Trapsmith's Note"
    },
    "187": {
        tier: 1,
            name: "Baffled Adventurer's Note"
    },
    "188": {
        tier: 1,
            name: "Apprehensive Adventurer's Note"
    },
    "189": {
        tier: 1,
            name: "Helpful Adventurer's Note"
    },
    "190": {
        tier: 2,
            name: "Key Pedestal"
    },
    "191": {
        tier: 2,
            name: "Empty Key Pedestal "
    },
    "192": {
        tier: 2,
            name: "Intricate Door"
    },
    "193": {
        tier: 2,
            name: "Open Door"
    },
    "194": {
        tier: 2,
            name: "Ancient Adventurer's Note"
    },
    "195": {
        tier: 1,
            name: "Powered Door"
    },
    "196": {
        tier: 1,
            name: "Partially Powered Door"
    },
    "197": {
        tier: 1,
            name: "Unpowered Door"
    },
    "198": {
        tier: 1,
            name: "Powered Door Contraption"
    },
    "199": {
        tier: 1,
            name: "Overloaded Door Contraption"
    },
    "200": {
        tier: 1,
            name: "Ornate Door"
    },
    "201": {
        tier: 6,
            name: "Energy Source"
    },
    "202": {
        tier: 6,
            name: "Ornate Key Pedestal"
    },
    "203": {
        tier: 6,
            name: "Advanced Key Pedestal"
    },
    "204": {
        tier: 6,
            name: "Power Source"
    },
    "205": {
        tier: 6,
            name: "Broken Power Source"
    },
    "206": {
        tier: 6,
            name: "Collapsed Marble Pillars"
    },
    "207": {
        tier: 6,
            name: "Advanced Door"
    },
    "208": {
        tier: 6,
            name: "Right Power Core Pedestal"
    },
    "209": {
        tier: 6,
            name: "Empty Power Core Pedestal"
    },
    "210": {
        tier: 6,
            name: "Runic Door"
    },
    "211": {
        tier: 6,
            name: "Trap Rubble"
    },
    "212": {
        tier: 6,
            name: "Runic Door "
    },
    "213": {
        tier: 6,
            name: "Mysterious Contraption"
    },
    "214": {
        tier: 6,
            name: "Powered Contraption"
    },
    "215": {
        tier: 3,
            name: "Vines T3"
    },
    "216": {
        tier: 3,
            name: "Root T3"
    },
    "217": {
        tier: 3,
            name: "Rubble T3"
    },
    "218": {
        tier: 3,
            name: "Enadarite Stand"
    },
    "219": {
        tier: 3,
            name: "Key Mold Pedestal"
    },
    "220": {
        tier: 3,
            name: "Empty Enadarite Stand"
    },
    "221": {
        tier: 3,
            name: "Empty Key Mold Pedestal"
    },
    "222": {
        tier: 3,
            name: "Enadarite Door"
    },
    "223": {
        tier: 6,
            name: "Left Power Core Pedestal"
    },
    "500": {
        tier: -1,
            name: "Depleted Sticks"
    },
    "501": {
        tier: -1,
            name: "Depleted Flint"
    },
    "1000028": {
        tier: 3,
            name: "Large Fallen Tree Stump"
    },
    "1000029": {
        tier: 3,
            name: "Fallen Grove Tree"
    },
    "1010008": {
        tier: 2,
            name: "Planted Birch Sapling"
    },
    "1010009": {
        tier: 1,
            name: "Planted Beech Sapling"
    },
    "1010010": {
        tier: 1,
            name: "Planted Oak Sapling"
    },
    "1011008": {
        tier: 2,
            name: "Planted Birch Tree"
    },
    "1011009": {
        tier: 1,
            name: "Planted Beech Tree"
    },
    "1011010": {
        tier: 1,
            name: "Planted Oak Tree"
    },
    "1012008": {
        tier: 2,
            name: "Fully Grown Birch Tree"
    },
    "1012009": {
        tier: 1,
            name: "Fully Grown Beech Tree"
    },
    "1012010": {
        tier: 1,
            name: "Fully Grown Oak Tree"
    },
    "1020001": {
        tier: 1,
            name: "Medium Ferralith Vein"
    },
    "1090000": {
        tier: 1,
            name: "Silken Hexmoths"
    },
    "1110000": {
        tier: 1,
            name: "Moonlit Crawdads"
    },
    "1110001": {
        tier: 1,
            name: "School Of Breezy Fin Darters "
    },
    "1110002": {
        tier: 1,
            name: "School Of Oceancrest Marlins"
    },
    "1110003": {
        tier: 1,
            name: "Frenzied School Of Oceancrest Marlins"
    },
    "1110004": {
        tier: 1,
            name: "Seaside Clam"
    },
    "2010008": {
        tier: 1,
            name: "Planted Dendro Sapling"
    },
    "2011008": {
        tier: 2,
            name: "Planted Dendro Tree"
    },
    "2012008": {
        tier: 2,
            name: "Fully Grown Dendro Tree"
    },
    "2020001": {
        tier: 2,
            name: "Medium Pyrelite Vein"
    },
    "2020002": {
        tier: 2,
            name: "Large Pyrelite Vein"
    },
    "2050000": {
        tier: 4,
            name: "Garden Boulder"
    },
    "2050001": {
        tier: 2,
            name: "Large Garden Boulder"
    },
    "2110000": {
        tier: 2,
            name: "Driftwood Crayfish"
    },
    "2110001": {
        tier: 2,
            name: "School Of Emberfin Shiners"
    },
    "2110002": {
        tier: 2,
            name: "School Of Serpentfish"
    },
    "2110003": {
        tier: 2,
            name: "Frenzied School Of Serpentfish"
    },
    "2110004": {
        tier: 2,
            name: "Tough Shelled Mussel"
    },
    "2140000": {
        tier: 2,
            name: "Giant Groundsel Plant"
    },
    "2390533": {
        tier: 8,
            name: "School Of Mysterious Anglerfish"
    },
    "3010008": {
        tier: 6,
            name: "Planted Maple Sapling"
    },
    "3010009": {
        tier: 1,
            name: "Planted Pine Sapling"
    },
    "3010010": {
        tier: 1,
            name: "Planted Spruce Sapling"
    },
    "3010011": {
        tier: 1,
            name: "Planted Willow Sapling"
    },
    "3011008": {
        tier: 6,
            name: "Planted Maple Tree"
    },
    "3011009": {
        tier: 4,
            name: "Planted Pine Tree"
    },
    "3011010": {
        tier: 3,
            name: "Planted Spruce Tree"
    },
    "3011011": {
        tier: 3,
            name: "Planted Willow Tree"
    },
    "3012008": {
        tier: 6,
            name: "Fully Grown Maple Tree"
    },
    "3012009": {
        tier: 4,
            name: "Fully Grown Pine Tree"
    },
    "3012010": {
        tier: 3,
            name: "Fully Grown Spruce Tree"
    },
    "3012011": {
        tier: 3,
            name: "Fully Grown Willow Tree"
    },
    "3020001": {
        tier: 3,
            name: "Medium Emarium Vein"
    },
    "3020002": {
        tier: 3,
            name: "Large Emarium Vein"
    },
    "3110000": {
        tier: 3,
            name: "Hunchback Prawns"
    },
    "3110001": {
        tier: 3,
            name: "School Of Coralcrest Darter"
    },
    "3110002": {
        tier: 3,
            name: "School Of Wavecrest Eels"
    },
    "3110003": {
        tier: 3,
            name: "Frenzied School Of Wavecrest Eels"
    },
    "3110004": {
        tier: 3,
            name: "Pearlback Snail"
    },
    "4010011": {
        tier: 1,
            name: "Planted Cypress Sapling"
    },
    "4011011": {
        tier: 5,
            name: "Planted Cypress Tree"
    },
    "4012011": {
        tier: 5,
            name: "Fully Grown Cypress Tree"
    },
    "4050000": {
        tier: 4,
            name: "Garden Pillar"
    },
    "4050001": {
        tier: 4,
            name: "Garden Formation"
    },
    "4050002": {
        tier: 4,
            name: "Rocky Garden Pillar"
    },
    "4050003": {
        tier: 4,
            name: "Rocky Garden Pillars"
    },
    "4050004": {
        tier: 4,
            name: "Rocky Garden Formation"
    },
    "4050005": {
        tier: 4,
            name: "Diorite Pillar"
    },
    "4050006": {
        tier: 4,
            name: "Large Rocky Garden Pillars"
    },
    "4050007": {
        tier: 4,
            name: "Large Rocky Garden Formations"
    },
    "4110000": {
        tier: 4,
            name: "Pygmy Lobsters"
    },
    "4110001": {
        tier: 4,
            name: "School Of Mossfin Chub"
    },
    "4110002": {
        tier: 4,
            name: "School Of Seastorm Tuna"
    },
    "4110003": {
        tier: 4,
            name: "Frenzied School Of Seastorm Tuna"
    },
    "4110004": {
        tier: 4,
            name: "Crystal Shell Scallop"
    },
    "5045122": {
        tier: 7,
            name: "School Of Tidebreaker Barracuda"
    },
    "5050000": {
        tier: 5,
            name: "Garden Pillar Interior"
    },
    "5050001": {
        tier: 5,
            name: "Garden Formation Interior"
    },
    "5050002": {
        tier: 5,
            name: "Diorite Pillar Interior"
    },
    "5110000": {
        tier: 5,
            name: "Golden Crawfish"
    },
    "5110001": {
        tier: 5,
            name: "School Of Emberscale Sturgeon"
    },
    "5110002": {
        tier: 5,
            name: "School Of Azure Sharks"
    },
    "5110003": {
        tier: 5,
            name: "Frenzied School Of Azure Sharks"
    },
    "5110004": {
        tier: 5,
            name: "Armored Reef Clam"
    },
    "6110000": {
        tier: 6,
            name: "Sunrise Shrimp"
    },
    "6110001": {
        tier: 6,
            name: "School Of Hexfin Perch"
    },
    "6110002": {
        tier: 6,
            name: "School Of Abyssal Swordfish"
    },
    "6110003": {
        tier: 6,
            name: "Frenzied School Of Abyssal Swordfish"
    },
    "6110004": {
        tier: 6,
            name: "Abyssal Oyster"
    },
    "20400246": {
        tier: 9,
            name: "Umbracite Vein Interior Depleted"
    },
    "20857160": {
        tier: 8,
            name: "Celestium Outcrop Interior"
    },
    "49710228": {
        tier: 5,
            name: "Luminite Outcrop Interior Depleted"
    },
    "61557407": {
        tier: 7,
            name: "Web Covered Chest"
    },
    "64125498": {
        tier: 9,
            name: "Umbracite Vein Interior"
    },
    "70663203": {
        tier: 10,
            name: "Tier 10 Boulder"
    },
    "71559749": {
        tier: 8,
            name: "Celestium Vein Interior Depleted"
    },
    "92565503": {
        tier: 3,
            name: "Ancient Rubble"
    },
    "93152192": {
        tier: 10,
            name: "Flawless Hieroglyphs"
    },
    "109403116": {
        tier: -1,
            name: "Large Araknir Spawner"
    },
    "134935169": {
        tier: 2,
            name: "Pyrelite Vein Interior Depleted"
    },
    "139483458": {
        tier: 7,
            name: "Aurumite Vein"
    },
    "152428426": {
        tier: 1,
            name: "Medium Ferralith Vein Interior Depleted"
    },
    "182331452": {
        tier: 1,
            name: "Traveler's Fruit"
    },
    "189403270": {
        tier: 9,
            name: "Tier 9 Fibers"
    },
    "198759779": {
        tier: 3,
            name: "Emarium Outcrop Interior"
    },
    "204021372": {
        tier: 1,
            name: "Rough Sand Pile"
    },
    "205387239": {
        tier: 4,
            name: "Medium Elenvar Vein Interior Depleted"
    },
    "218270468": {
        tier: 1,
            name: "Ferralith Outcrop Interior"
    },
    "233091253": {
        tier: -1,
            name: "Ancient Broken Bridge"
    },
    "246146358": {
        tier: 6,
            name: "Rathium Vein Interior Depleted"
    },
    "284200468": {
        tier: 9,
            name: "Tier 9 Flower"
    },
    "322711580": {
        tier: 1,
            name: "Faint Hexite Energy Font"
    },
    "331687458": {
        tier: 9,
            name: "Magnificient Hieroglyphs"
    },
    "368570220": {
        tier: 6,
            name: "Cranberry Bush"
    },
    "370078223": {
        tier: 10,
            name: "Astralite Outcrop Interior"
    },
    "374159821": {
        tier: 10,
            name: "School Of Flawless Lakefish"
    },
    "379219978": {
        tier: 3,
            name: "Medium Emarium Vein Interior"
    },
    "384211022": {
        tier: 2,
            name: "Giant Pumpkin Pile"
    },
    "387666932": {
        tier: 7,
            name: "Tier 7 Tree"
    },
    "411376268": {
        tier: 7,
            name: "Aurumite Vein Interior Depleted"
    },
    "424796674": {
        tier: 10,
            name: "School Of Flawless Ocean Fish"
    },
    "457752715": {
        tier: 8,
            name: "Pristine Sand"
    },
    "464034838": {
        tier: 2,
            name: "Olivine Sand"
    },
    "473828668": {
        tier: 10,
            name: "Bamboo"
    },
    "474230316": {
        tier: 1,
            name: "Ferralith Outcrop Interior Depleted"
    },
    "479638263": {
        tier: 8,
            name: "Tier 8 Boulder"
    },
    "487003651": {
        tier: 3,
            name: "Ancient Armor Rack"
    },
    "505488132": {
        tier: 8,
            name: "Pristine Clay"
    },
    "509854054": {
        tier: 8,
            name: "Frenzied School Of Mysterious Anglerfish"
    },
    "532077242": {
        tier: 4,
            name: "Indigo Milk Cap"
    },
    "541862086": {
        tier: 4,
            name: "Garnet Sand"
    },
    "545609744": {
        tier: 7,
            name: "Araknir Eggs"
    },
    "546753273": {
        tier: 3,
            name: "Ancient Coffer"
    },
    "549538391": {
        tier: 5,
            name: "Medium Luminite Vein Interior"
    },
    "562432497": {
        tier: 9,
            name: "Magnificient Sand"
    },
    "569033113": {
        tier: -1,
            name: "Small Araknir Spawner"
    },
    "582591086": {
        tier: 7,
            name: "Ornate Berry Bush"
    },
    "586543849": {
        tier: 7,
            name: "Ornate Mushroom"
    },
    "623041128": {
        tier: 2,
            name: "Sunflower"
    },
    "642972236": {
        tier: 5,
            name: "Luminite Outcrop Interior"
    },
    "650019671": {
        tier: 8,
            name: "Medium Celestium Vein Interior Depleted"
    },
    "699727318": {
        tier: 2,
            name: "Medium Pyrelite Vein Interior"
    },
    "702104027": {
        tier: 6,
            name: "Clay Termite Mound"
    },
    "715451185": {
        tier: 4,
            name: "Blueberry Bush"
    },
    "722506673": {
        tier: 8,
            name: "School Of Rainbowscaled Tilapia"
    },
    "723013812": {
        tier: 7,
            name: "Tier 7 Flower"
    },
    "746946997": {
        tier: 2,
            name: "Hexite Energy Font"
    },
    "749656892": {
        tier: 9,
            name: "Medium Umbracite Vein Interior Depleted"
    },
    "750444302": {
        tier: 6,
            name: "Medium Rathium Vein Interior Depleted"
    },
    "756579517": {
        tier: 9,
            name: "Magnificient Baitfish"
    },
    "762731569": {
        tier: 6,
            name: "Palmetto"
    },
    "763946195": {
        tier: 1,
            name: "TEST BirdSpawn"
    },
    "773149133": {
        tier: 6,
            name: "Medium Rathium Vein Interior"
    },
    "782933576": {
        tier: 4,
            name: "Elenvar Outcrop Interior"
    },
    "789563787": {
        tier: 4,
            name: "Strong Hexite Energy Font"
    },
    "806722041": {
        tier: 4,
            name: "Elenvar Vein Interior Depleted"
    },
    "814703516": {
        tier: 9,
            name: "Umbracite Outcrop Interior"
    },
    "822745882": {
        tier: 3,
            name: "Ancient Pots"
    },
    "826362353": {
        tier: 7,
            name: "Frenzied School Of Tidebreaker Barracuda"
    },
    "834195042": {
        tier: 7,
            name: "Ornate Clay"
    },
    "875245395": {
        tier: 6,
            name: "Mistberry Bush"
    },
    "887736443": {
        tier: 5,
            name: "Luminite Vein Interior"
    },
    "904022325": {
        tier: 7,
            name: "School Of Speedy Glowfin"
    },
    "916586661": {
        tier: 6,
            name: "Rathium Outcrop Interior"
    },
    "932989637": {
        tier: 6,
            name: "Powerful Hexite Energy Font"
    },
    "939382648": {
        tier: 10,
            name: "Wisteria Tree"
    },
    "939701809": {
        tier: 9,
            name: "Gigantic Sapwood Tree"
    },
    "963451338": {
        tier: 9,
            name: "Magnificient Berry Bush"
    },
    "986344159": {
        tier: 3,
            name: "Medium Emarium Vein Interior Depleted"
    },
    "999376882": {
        tier: 6,
            name: "Desert Sand"
    },
    "1005142992": {
        tier: 5,
            name: "Elephant Fibers"
    },
    "1006230316": {
        tier: 10,
            name: "Frenzied School Of Flawless Ocean Fish"
    },
    "1023127595": {
        tier: 10,
            name: "Flawless Clay"
    },
    "1043012047": {
        tier: -1,
            name: "Lost Shipment"
    },
    "1045808810": {
        tier: 2,
            name: "Pyrelite Outcrop Interior"
    },
    "1064484466": {
        tier: 3,
            name: "Emarium Outcrop Interior Depleted"
    },
    "1072537375": {
        tier: 3,
            name: "Russala"
    },
    "1077990023": {
        tier: 4,
            name: "Elenvar Vein Interior"
    },
    "1101060328": {
        tier: 8,
            name: "Ficus Tree"
    },
    "1103361264": {
        tier: -1,
            name: "Ancient Repaired Bridge"
    },
    "1113640469": {
        tier: 9,
            name: "Tier 9 Outcrop"
    },
    "1125409070": {
        tier: 8,
            name: "Tier 8 Fibers"
    },
    "1126774401": {
        tier: 5,
            name: "Medium Luminite Vein Interior Depleted"
    },
    "1133243991": {
        tier: 7,
            name: "Web Encased Chest"
    },
    "1141184831": {
        tier: 9,
            name: "Frenzied School Of Magnificient Ocean Fish"
    },
    "1157887989": {
        tier: 9,
            name: "School Of Magnificient Lake Fish"
    },
    "1159270109": {
        tier: 10,
            name: "Tier 10 Tree"
    },
    "1162923141": {
        tier: 8,
            name: "Celestium Vein Interior"
    },
    "1171246287": {
        tier: 7,
            name: "Medium Aurumite Vein Interior Depleted"
    },
    "1180909566": {
        tier: 3,
            name: "Crystalized Sand"
    },
    "1241355606": {
        tier: 9,
            name: "Umbracite Outcrop Interior Depleted"
    },
    "1260515599": {
        tier: 3,
            name: "Large Ancient Rubble"
    },
    "1262898141": {
        tier: 7,
            name: "Misty Crustacean"
    },
    "1264935363": {
        tier: 8,
            name: "Tier 8 Flower"
    },
    "1283632905": {
        tier: 1,
            name: "Traveler's Fruit (Depleted)"
    },
    "1283711960": {
        tier: 10,
            name: "Flawless Baitfish"
    },
    "1293969473": {
        tier: -1,
            name: "Lost Treasure"
    },
    "1303955933": {
        tier: 1,
            name: "Traveler's Tree"
    },
    "1318826480": {
        tier: 6,
            name: "Rathium Outcrop Interior Depleted"
    },
    "1332535555": {
        tier: 7,
            name: "Ornate Sand"
    },
    "1332797261": {
        tier: 8,
            name: "Celestium Vein"
    },
    "1333270269": {
        tier: 10,
            name: "Flawless Sand"
    },
    "1357154092": {
        tier: 10,
            name: "Astralite Vein Interior Depleted"
    },
    "1365934955": {
        tier: 5,
            name: "Luminite Vein Interior Depleted"
    },
    "1384946093": {
        tier: 9,
            name: "Medium Umbracite Vein Interior"
    },
    "1386735112": {
        tier: 9,
            name: "Umbracite Vein"
    },
    "1423928615": {
        tier: 8,
            name: "Tier 8 Outcrop"
    },
    "1435874592": {
        tier: 1,
            name: "Traveler's Tree (Depleted)"
    },
    "1440062914": {
        tier: 7,
            name: "Tier 7 Boulder"
    },
    "1444297495": {
        tier: 10,
            name: "Medium Astralite Vein Interior Depleted"
    },
    "1452484871": {
        tier: 10,
            name: "Medium Astralite Vein Interior"
    },
    "1458811602": {
        tier: 9,
            name: "Seaweed"
    },
    "1467799531": {
        tier: 10,
            name: "Dewberry Bush"
    },
    "1477126404": {
        tier: -1,
            name: "Lost Wreckage"
    },
    "1489491467": {
        tier: 10,
            name: "Tier 10 Fibers"
    },
    "1526038154": {
        tier: 9,
            name: "Magnificient Clay"
    },
    "1526350171": {
        tier: 10,
            name: "Astralite Outcrop Interior Depleted"
    },
    "1551712725": {
        tier: 2,
            name: "Pumpkin"
    },
    "1558728865": {
        tier: 8,
            name: "Sparkling Prawn"
    },
    "1565420196": {
        tier: 1,
            name: "Medium Ferralith Vein Interior"
    },
    "1566846336": {
        tier: 4,
            name: "Rosewood Tree"
    },
    "1567694896": {
        tier: 8,
            name: "Pristine Hieroglyphs"
    },
    "1574437474": {
        tier: 9,
            name: "Sapwood Tree"
    },
    "1574537885": {
        tier: 3,
            name: "Ancient Weapon Rack"
    },
    "1579330042": {
        tier: 7,
            name: "Yellow Apricot Bush"
    },
    "1592739620": {
        tier: 8,
            name: "Pristine Berry Bush"
    },
    "1606770008": {
        tier: 10,
            name: "Astralite Vein"
    },
    "1619369727": {
        tier: 2,
            name: "Pyrelite Vein Interior"
    },
    "1637125903": {
        tier: 10,
            name: "Flawless Mushroom"
    },
    "1657885116": {
        tier: 8,
            name: "Pristine Mushroom"
    },
    "1673056013": {
        tier: 2,
            name: "Terrified Adventurer's Note"
    },
    "1689263994": {
        tier: 7,
            name: "Aurumite Outcrop Interior Depleted"
    },
    "1691492474": {
        tier: 5,
            name: "Coral Sand"
    },
    "1709170104": {
        tier: 4,
            name: "Elenvar Outcrop Interior Depleted"
    },
    "1731709368": {
        tier: 8,
            name: "Overwhelming Hexite Energy Font"
    },
    "1742959882": {
        tier: 9,
            name: "Magnificient Mushroom"
    },
    "1747556974": {
        tier: 10,
            name: "Astralite Vein Interior"
    },
    "1800013378": {
        tier: 7,
            name: "Medium Aurumite Vein Interior"
    },
    "1812221896": {
        tier: 9,
            name: "School Of Magnificient Ocean Fish"
    },
    "1821415333": {
        tier: 9,
            name: "Mature Sapwood Tree"
    },
    "1828992183": {
        tier: 2,
            name: "Pyrelite Outcrop Interior Depleted"
    },
    "1842369948": {
        tier: 2,
            name: "Medium Pyrelite Vein Interior Depleted"
    },
    "1902966974": {
        tier: 9,
            name: "Tier 9 Boulder"
    },
    "1908426535": {
        tier: 3,
            name: "Windswept Tree"
    },
    "1917261269": {
        tier: 4,
            name: "Jute"
    },
    "1917744937": {
        tier: 1,
            name: "Ferralith Vein Interior Depleted"
    },
    "1954847232": {
        tier: 9,
            name: "Black Fig Bush"
    },
    "1962517199": {
        tier: 1,
            name: "Ferralith Vein Interior"
    },
    "1981854097": {
        tier: 7,
            name: "Tier 7 Fibers"
    },
    "1986100626": {
        tier: 10,
            name: "Tier 10 Flower"
    },
    "1996631377": {
        tier: 10,
            name: "Tier 10 Outcrop"
    },
    "2022104490": {
        tier: 3,
            name: "Broken Ancient Pots"
    },
    "2025189123": {
        tier: 8,
            name: "Medium Celestium Vein Interior"
    },
    "2027405944": {
        tier: 6,
            name: "Rathium Vein Interior"
    },
    "2031243337": {
        tier: 7,
            name: "Aurumite Vein Interior"
    },
    "2066552867": {
        tier: 4,
            name: "Medium Elenvar Vein Interior"
    },
    "2068688558": {
        tier: 3,
            name: "Emarium Vein Interior Depleted"
    },
    "2072988001": {
        tier: 3,
            name: "Emarium Vein Interior"
    },
    "2073862342": {
        tier: 7,
            name: "Aurumite Outcrop Interior"
    },
    "2089197796": {
        tier: 10,
            name: "Enoki"
    },
    "2104975743": {
        tier: 7,
            name: "Tier 7 Outcrop"
    },
    "2110330714": {
        tier: 10,
            name: "Flawless Berry Bush"
    },
    "2124845482": {
        tier: 7,
            name: "Ornate Hieroglyphs"
    },
    "2140754992": {
        tier: 8,
            name: "Celestium Outcrop Interior Depleted"
    },
    "2144918116": {
        tier: 1,
            name: "Daisy"
    },
    "2145270439": {
        tier: -1,
            name: "Jakyl Den"
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