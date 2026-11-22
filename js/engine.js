
/* ================= DATA ================= */
const ABIL={
  fly:{n:'Flying',d:'Moves over anything and ignores climbing. Only its first step can draw a parting strike.'},
  phase:{n:'Shadowstep',d:'Moves through enemies and never takes parting strikes.'},
  swim:{n:'Tidewalker',d:'Water does not end its move.'},
  lava:{n:'Ashborn',d:'Lava never burns it or ends its move.'},
  twin:{n:'Twin Strike',d:'Each figure attacks twice per turn.'},
  mend:{n:'Mend',d:'Instead of attacking, heal 1 wound on an adjacent ally.'},
  rage:{n:'Bloodrage',d:'+1 attack die while wounded.'},
  bulwark:{n:'Shield Wall',d:'+1 defense die for each adjacent ally (max +2).'},
  eagle:{n:'High Sight',d:'+1 range when shooting at a lower target.'},
  sweep:{n:'Whirlwind',d:'A melee attack strikes every adjacent enemy.'},
  riposte:{n:'Riposte',d:'In melee, if its shields beat the skulls, the attacker takes 1 wound.'},
  blink:{n:'Blur',d:'Always counts 1 extra shield when defending.'},
  pierce:{n:'Piercing',d:'Its targets roll 1 fewer defense die.'},
  steady:{n:'Sure-footed',d:'Never takes parting strikes.'},
  leap:{n:'Leap',d:'Climbs or drops any height in one step at normal cost.'},
  regen:{n:'Regenerate',d:'Each of its figures heals 1 wound at the end of its turn.'},
  venom:{n:'Venom',d:'Any attack that wounds deals 1 extra wound.'},
  charge:{n:'Charge',d:'+1 attack die if the figure moved this turn.'},
  camo:{n:'Camouflage',d:'Attacks from more than 1 hex away roll 1 fewer attack die against it.'},
  rally:{n:'Rally',d:'Adjacent allies roll +1 attack die.'},
  ward:{n:'Ward',d:'Adjacent allies roll +1 defense die.'},
  drain:{n:'Drain',d:'Heals 1 wound whenever its attack wounds.'},
  dread:{n:'Dread',d:'Adjacent enemies attacking it roll 1 fewer attack die.'},
  pathfinder:{n:'Pathfinder',d:'Ignores the extra move cost of sand, snow and swamp.'},
  burrow:{n:'Burrow',d:'Can move through tree hexes (but not stop in them).'}
};
const CARDS=[
 {id:'halvane',n:'Ser Halvane',t:'Gilded Knight',k:'Hero',p:110,f:1,hp:5,mv:5,rg:1,at:3,df:4,ab:['riposte'],g:'🛡️',c:'#7a6a2a'},
 {id:'vexa',n:'Vexa Thornwhisper',t:'Briar Witch',k:'Hero',p:90,f:1,hp:4,mv:5,rg:5,at:2,df:2,ab:['pierce'],g:'🌿',c:'#2f6b3a'},
 {id:'drogmar',n:'Drogmar',t:'The Cinderhorn',k:'Hero',p:180,f:1,hp:7,mv:4,rg:1,at:5,df:3,ab:['lava','rage','sweep'],g:'🔥',c:'#8a2f17'},
 {id:'kestra',n:'Kestra',t:'Skyhunter',k:'Hero',p:100,f:1,hp:4,mv:7,rg:4,at:3,df:2,ab:['fly','eagle'],g:'🦅',c:'#5a4a33'},
 {id:'pikes',n:'Iron Pikemen',t:'Garrison Squad',k:'Squad',p:60,f:4,hp:1,mv:4,rg:1,at:2,df:3,ab:['bulwark'],g:'🔱',c:'#4a5560'},
 {id:'lurkers',n:'Marsh Lurkers',t:'Bog Squad',k:'Squad',p:55,f:3,hp:1,mv:5,rg:1,at:3,df:2,ab:['swim'],g:'🐸',c:'#3c5a2c'},
 {id:'archers',n:'Glass Archers',t:'Spire Squad',k:'Squad',p:70,f:3,hp:1,mv:4,rg:7,at:2,df:1,ab:['eagle'],g:'🏹',c:'#3e6b7a'},
 {id:'ansel',n:'Brother Ansel',t:'Wayfaring Monk',k:'Hero',p:70,f:1,hp:4,mv:5,rg:1,at:2,df:3,ab:['mend','steady'],g:'☯️',c:'#8a7448'},
 {id:'nyx',n:'Nyx',t:'The Hollow Shade',k:'Hero',p:120,f:1,hp:4,mv:6,rg:1,at:3,df:3,ab:['phase','blink'],g:'👤',c:'#3a2f4f'},
 {id:'ragnhild',n:'Ragnhild',t:'Twin-Axe Raider',k:'Hero',p:100,f:1,hp:5,mv:5,rg:1,at:3,df:2,ab:['twin','rage'],g:'🪓',c:'#6b3b2a'},
 {id:'sentinel',n:'Clockwork Sentinel',t:'Brass Guardian',k:'Hero',p:130,f:1,hp:6,mv:4,rg:3,at:3,df:5,ab:['steady'],g:'⚙️',c:'#6e5a2a'},
 {id:'imps',n:'Emberkin Imps',t:'Cinder Swarm',k:'Squad',p:50,f:4,hp:1,mv:6,rg:2,at:1,df:1,ab:['fly','lava'],g:'😈',c:'#7a2a2a'},
 {id:'oru',n:'Tidecaller Oru',t:'Reef Shaman',k:'Hero',p:110,f:1,hp:5,mv:5,rg:4,at:3,df:3,ab:['swim','pierce'],g:'🌊',c:'#1f5a7a'},
 {id:'drake',n:'Stormwing Drake',t:'Sky Terror',k:'Hero',p:210,f:1,hp:7,mv:7,rg:3,at:4,df:3,ab:['fly','sweep'],g:'🐉',c:'#2a5a4a'},
 {id:'scouts',n:'Dunerunner Scouts',t:'Desert Squad',k:'Squad',p:45,f:3,hp:1,mv:7,rg:3,at:1,df:2,ab:['steady'],g:'🏜️',c:'#8a6a3a'},
 {id:'mossback',n:'Mossback Ancient',t:'Walking Grove',k:'Hero',p:160,f:1,hp:8,mv:3,rg:1,at:4,df:4,ab:['riposte','rage'],g:'🌳',c:'#36502a'},
 {id:'liora',n:'Liora Vance',t:'Rifle Ranger',k:'Hero',p:120,f:1,hp:4,mv:5,rg:8,at:3,df:2,ab:['eagle','pierce'],g:'🎯',c:'#4a4a5a'},
 {id:'thralls',n:'Bonewright Thralls',t:'Crypt Squad',k:'Squad',p:40,f:4,hp:1,mv:4,rg:1,at:2,df:2,ab:[],g:'💀',c:'#4f4a44'},
 {id:'seraphine',n:'Seraphine',t:'Dawnblade',k:'Hero',p:150,f:1,hp:5,mv:6,rg:1,at:3,df:3,ab:['fly','twin'],g:'✨',c:'#7a6a3a'},
 {id:'duelist',n:'Corvin Gale',t:'Gutter Duelist',k:'Hero',p:80,f:1,hp:4,mv:6,rg:1,at:3,df:2,ab:['blink','riposte'],g:'🗡️',c:'#4a2a3a'},
 {id:'brakka',n:'Brakka Stonejaw',t:'Mountain Ogre',k:'Hero',p:140,f:1,hp:6,mv:4,rg:1,at:4,df:3,ab:['charge','steady'],g:'👹',c:'#5a4a3a'},
 {id:'maelis',n:'Sister Maelis',t:'Lantern Priestess',k:'Hero',p:90,f:1,hp:4,mv:5,rg:3,at:2,df:3,ab:['mend'],g:'🏮',c:'#7a5a2a'},
 {id:'stalkers',n:'Venomfang Stalkers',t:'Jungle Squad',k:'Squad',p:75,f:3,hp:1,mv:6,rg:1,at:2,df:2,ab:['venom','leap'],g:'🐍',c:'#3a5a2a'},
 {id:'orrin',n:'Orrin Dax',t:'Sky Corsair',k:'Hero',p:130,f:1,hp:5,mv:6,rg:4,at:3,df:3,ab:['leap','eagle'],g:'🧭',c:'#3a3a4a'},
 {id:'yselde',n:'Yselde',t:'Frostwarden',k:'Hero',p:140,f:1,hp:5,mv:5,rg:5,at:3,df:3,ab:['pierce','steady'],g:'❄️',c:'#2a5a7a'},
 {id:'hounds',n:'Cindermaw Hounds',t:'Ash Pack',k:'Squad',p:65,f:3,hp:1,mv:7,rg:1,at:3,df:1,ab:['charge','lava'],g:'🐺',c:'#6a2a1a'},
 {id:'abbot',n:'The Pale Abbot',t:'Keeper of Bones',k:'Hero',p:120,f:1,hp:5,mv:4,rg:4,at:3,df:3,ab:['regen','mend'],g:'🕯️',c:'#4a4a4a'},
 {id:'tinkers',n:'Gearwright Tinkerers',t:'Workshop Squad',k:'Squad',p:60,f:3,hp:1,mv:4,rg:4,at:2,df:2,ab:['eagle'],g:'🔧',c:'#5a4a2a'},
 {id:'thessaly',n:'Thessaly Reedwind',t:'Marsh Druid',k:'Hero',p:100,f:1,hp:4,mv:5,rg:4,at:2,df:3,ab:['swim','regen'],g:'🍃',c:'#2a5a3a'},
 {id:'troll',n:'Grimhollow Troll',t:'Bridge Brute',k:'Hero',p:170,f:1,hp:7,mv:5,rg:1,at:4,df:2,ab:['regen','rage'],g:'🧌',c:'#3a4a2a'},
 {id:'kael',n:'Kael Sunspear',t:'Desert Lancer',k:'Hero',p:110,f:1,hp:5,mv:7,rg:1,at:3,df:3,ab:['charge'],g:'🐎',c:'#8a5a2a'},
 {id:'hexers',n:'Mirebound Hexers',t:'Swamp Coven',k:'Squad',p:70,f:3,hp:1,mv:5,rg:3,at:2,df:1,ab:['venom','swim'],g:'🧪',c:'#3a2a4a'},
 {id:'valka',n:'Valka Ironveil',t:'Shieldmaiden',k:'Hero',p:120,f:1,hp:5,mv:5,rg:1,at:3,df:5,ab:['riposte','bulwark'],g:'⚜️',c:'#4a5a6a'},
 {id:'bats',n:'Wraithwing Bats',t:'Night Swarm',k:'Squad',p:55,f:4,hp:1,mv:8,rg:1,at:2,df:1,ab:['fly'],g:'🦇',c:'#2a2a3a'},
 {id:'thistle',n:'Old Thistle',t:'Goblin Bombardier',k:'Hero',p:85,f:1,hp:3,mv:4,rg:6,at:3,df:1,ab:['leap','pierce'],g:'💣',c:'#4a5a2a'},
 {id:'aurelion',n:'Aurelion',t:'The Gold Colossus',k:'Hero',p:230,f:1,hp:9,mv:3,rg:2,at:5,df:5,ab:['steady','sweep'],g:'🗿',c:'#7a6a2a'}
];
// id|name|title|H(ero)/S(quad)|points|figures|life|move|range|attack|defense|abilities|glyph|color
`frostjarl|Hrolf Frostjarl|Winter King|H|180|1|7|5|1|4|4|pathfinder,rage|👑|#5a7a9a
snowstalkers|Rime Stalkers|Snow Pack|S|60|3|1|6|1|2|2|pathfinder,camo|🐾|#7a90a0
icecaller|Sigrun Icecaller|Glacier Witch|H|120|1|4|5|5|3|2|pierce,ward|🧊|#4a8ab0
yeti|Old Whitepelt|Mountain Yeti|H|150|1|7|5|1|4|3|leap,pathfinder|🦍|#8a98a8
longbows|Glacier Longbows|Ranger Squad|S|75|3|1|5|6|2|1|pathfinder,eagle|🌨️|#5a7a90
bogcrone|Mother Mirelle|Bog Crone|H|110|1|5|4|4|3|2|venom,regen|🧙|#4a5a2a
croaklings|Croakling Spears|Swamp Squad|S|50|4|1|5|1|2|2|swim,pathfinder|🐊|#3a6a3a
gorgut|Gorgut|Leech Lord|H|130|1|6|4|1|3|3|drain,swim|🩸|#5a2a2a
weeping|Weeping Warden|Swamp Treant|H|140|1|8|3|2|3|4|regen,dread|🌲|#3a4a3a
sandmaw|Sandmaw|Dune Wyrm|H|190|1|7|6|1|5|3|burrow,pathfinder|🐛|#9a7040
ankhet|Ankhet|Sun Priestess|H|100|1|4|5|4|2|3|mend,ward|☀️|#a08030
scarabs|Scarab Swarm|Desert Swarm|S|45|4|1|5|1|2|2|burrow|🪲|#6a5a2a
mirage|Mirage Riders|Nomad Squad|S|80|3|1|7|3|2|2|charge,camo|🐪|#9a7040
zephra|Zephra|Storm Djinn|H|170|1|5|7|4|3|3|fly,blink|🌪️|#4a6a9a
morvane|Morvane|The Ashen Lich|H|190|1|5|4|6|4|3|drain,dread|☠️|#3a3a4a
ghouls|Gravepit Ghouls|Ghoul Pack|S|55|4|1|5|1|2|1|venom,rage|🧟|#4a5a4a
isolde|Wailing Isolde|Banshee|H|120|1|4|6|3|3|2|fly,dread|👻|#5a5a7a
sergrave|Ser Grave|Revenant Knight|H|140|1|6|4|1|4|4|regen,steady|⚰️|#3a3a3a
ossuary|Ossuary Archers|Bone Squad|S|55|3|1|4|5|2|1|steady|🦴|#6a6050
golem|Iron Golem Mk II|Siege Engine|H|200|1|9|3|4|4|5|steady|🤖|#5a5a6a
wasps|Brass Wasps|Clockwork Swarm|S|65|4|1|7|2|1|2|fly|🐝|#8a7a3a
coggs|Mira Coggs|Field Artificer|H|90|1|4|5|3|2|3|mend,rally|🛠️|#6a5a3a
powder|Powder Guard|Musket Squad|S|85|3|1|4|6|3|1|pierce|💥|#5a4a4a
caelestine|Caelestine|Archon of Light|H|220|1|6|7|1|4|4|fly,ward,rally|😇|#a08840
orionne|Orionne|Star Seer|H|120|1|4|5|6|3|2|eagle,pierce|🌟|#3a3a7a
moonguard|Moonlit Guard|Temple Squad|S|80|3|1|5|1|2|4|bulwark,ward|🌙|#4a4a6a
pyrrhia|Pyrrhia|Ember Phoenix|H|180|1|5|8|2|3|3|fly,lava,regen|🪶|#a04a2a
talon|Talonfeather|Royal Griffon|H|150|1|6|7|1|4|3|fly,charge|🦁|#8a6a3a
greymane|Greymane Wolves|Hunting Pack|S|60|4|1|7|1|2|1|charge,pathfinder|🐕|#5a5a5a
ursa|Ursa Brightclaw|Cave Bear|H|120|1|7|5|1|4|2|rage,charge|🐻|#6a4a2a
silkweave|Silkweaver Brood|Spider Squad|S|65|4|1|5|1|2|1|venom,leap|🕷️|#3a3a3a
ironhide|Ironhide|War Rhino|H|160|1|8|5|1|4|4|charge,steady|🦏|#5a5a4a
cliffhawk|Cliffhawk Riders|Aerie Squad|S|90|3|1|7|2|2|2|fly,eagle|🦉|#6a5a4a
molly|Mad Molly Brine|Pirate Queen|H|130|1|5|6|3|3|3|rally,swim|🦜|#7a3a3a
bilgewater|Bilgewater Crew|Pirate Squad|S|55|4|1|5|1|2|2|swim,charge|⚓|#3a3a5a
deepmaw|Deepmaw|Kraken Spawn|H|170|1|7|4|2|4|3|swim,sweep|🐙|#5a3a6a
fitch|Gunner Fitch|Deck Cannoneer|H|95|1|4|4|7|3|1|pierce|🧨|#5a3a2a
kaito|Ren Kaito|Wandering Blademaster|H|140|1|5|6|1|4|3|twin,blink|⚔️|#6a2a2a
stonepath|Stonepath Monks|Mountain Order|S|70|3|1|6|1|2|3|leap,steady|🥋|#7a5a3a
ashi|Ashi Seven-Tails|Fox Spirit|H|130|1|4|7|3|3|2|camo,blink|🦊|#a05a2a
ryuun|Ryuun|Storm Serpent|H|240|1|8|7|3|5|3|fly,sweep|🐲|#2a6a5a
thistledown|Thistledown Sprites|Fae Swarm|S|55|4|1|6|2|1|1|fly,camo|🧚|#5a3a6a
titanelle|Queen Titanelle|Fae Monarch|H|160|1|5|6|4|3|3|fly,ward,mend|🦋|#6a3a7a
redcaps|Redcap Raiders|Goblin Squad|S|50|4|1|5|1|2|1|rage,leap|🍄|#7a2a2a
barkwarden|Barkwarden Sentries|Treefolk Squad|S|80|3|1|4|1|3|3|regen,bulwark|🪵|#4a3a2a
magmaborn|Magmaborn Brute|Fire Elemental|H|150|1|6|4|1|4|3|lava,sweep|🌋|#8a3a1a
vesna|Vesna Stormcaller|Sky Sorceress|H|130|1|4|5|6|3|2|eagle,camo|⚡|#3a4a7a
stoneguard|Earthen Stoneguard|Golem Squad|S|90|3|1|3|1|3|5|bulwark,steady|🪨|#5a5a4a
nereids|Wavecrest Nereids|Tide Squad|S|60|3|1|6|3|2|2|swim,mend|🐚|#3a6a8a
ironbolt|Ironbolt Crossbows|Arbalest Squad|S|80|3|1|4|6|2|2|pierce|🪃|#5a5a4a
aldric|Dame Aldric|Oathsworn Paladin|H|150|1|6|5|1|4|4|ward,mend|🕊️|#8a7a40
lionsguard|Lionsguard Cavalry|Knight Squad|S|100|3|1|7|1|3|3|charge|🐴|#7a6a4a
iris|Velvet Iris|Spymaster|H|90|1|4|6|3|3|2|camo,blink|🎭|#5a2a4a
brennan|Marshal Brennan|Field General|H|120|1|5|5|1|3|4|rally,ward|🎖️|#5a5a3a
ashfang|Ashfang Berserkers|Raider Squad|S|70|3|1|5|1|3|1|rage,charge|🐗|#6a3a2a
mimic|The Grinning Chest|Dungeon Mimic|H|90|1|6|3|1|4|3|camo,venom|🧰|#7a5a2a
brontes|Brontes One-Eye|Hill Cyclops|H|170|1|8|4|5|4|2|steady,eagle|👁️|#7a6a4a
null|Null|The Voidwalker|H|180|1|5|6|1|4|3|phase,drain|🌀|#2a2a4a
quillon|Doctor Quillon|Plague Alchemist|H|100|1|4|5|4|2|2|venom,pierce|⚗️|#4a6a3a
gravlok|Gravlok|Molten Juggernaut|H|210|1|9|4|1|5|4|lava,dread|🦖|#8a4a1a
brassmarshal|Marshal Tock|Brass Commander|H|140|1|5|5|3|3|4|rally,steady|🎩|#7a6a3a|gunner
cogsoldiers|Cogwork Infantry|Clockwork Squad|S|85|4|1|4|1|2|3|steady|⚙️|#6a6a5a|construct
lune|Skiff Captain Lune|Aether Pilot|H|95|1|4|7|5|3|2|fly,eagle|🎈|#5a6a8a|flyer
boilerheart|Boilerheart|Steam Titan|H|225|1|8|3|1|5|4|sweep,steady|🚂|#6a4a3a|construct
arcadepts|Arc Adepts|Tesla Squad|S|85|3|1|5|4|2|1|pierce|🔌|#3a5a8a|caster
gyroscouts|Gyro Scouts|Rotor Squad|S|70|3|1|8|3|2|1|fly|🚁|#7a7a4a|flyer
sentinelprime|Sentinel Prime|Tower Automaton|H|160|1|7|3|6|3|5|eagle,steady|🕰️|#5a5040|construct
sprocket|Penny Sprocket|Gadgeteer|H|70|1|4|6|4|2|3|mend,camo|🔩|#7a5a3a|gunner
rivetgang|Rivet Gang|Foundry Squad|S|75|4|1|5|1|2|2|charge|🔨|#5a4a3a|warrior
ticktock|Ticktock Spider|Siege Walker|H|200|1|6|5|3|4|4|leap,pierce|🕸️|#4a4a4a|beast
mareth|King Mareth|Tide Monarch|H|185|1|6|5|3|4|4|swim,rally|🐋|#2a5a7a|knight
eelriders|Eel Riders|Reef Cavalry|S|105|3|1|7|1|3|2|swim,charge|🐟|#2a6a6a|rider
sirens|Siren Choir|Song Squad|S|70|3|1|5|3|2|2|swim,dread|🎶|#4a5a8a|caster
oldbrine|Old Brine|Leviathan|H|175|1|9|4|1|5|3|swim,sweep|🐳|#2a4a6a|serpent
shellguard|Shellguard|Crab Squad|S|95|3|1|4|1|2|5|bulwark|🦀|#8a3a2a|beast
pearloracle|Pearl Oracle|Abyssal Seer|H|90|1|4|5|5|3|2|ward,swim|🦪|#5a6a7a|caster
harpooners|Harpoon Corps|Whaler Squad|S|95|3|1|5|4|2|2|pierce|🎣|#4a5a5a|archer
jellies|Drifting Jellies|Sting Swarm|S|95|4|1|4|1|2|1|venom,swim|🎐|#7a5a9a|swarm
morgana|Morgana Deep|Sea Witch|H|110|1|5|5|4|3|3|drain,swim|🧜|#3a4a6a|caster
reefjaw|Reefjaw Raiders|Shark Squad|S|100|3|1|6|1|3|2|swim,rage|🦈|#4a5a6a|warrior
ashgrave|Lord Ashgrave|Cinder Tyrant|H|205|1|7|5|1|5|4|lava,rage|♨️|#8a2a1a|brute
salamanders|Salamander Brood|Fire Lizards|S|80|4|1|5|1|2|2|lava,charge|🦎|#a04a1a|beast
ignatia|Ignatia|Pyromancer|H|110|1|4|5|5|4|2|pierce,lava|🎇|#a03a1a|caster
emberguard|Emberguard|Ash Knights|S|155|3|1|4|1|3|4|lava,bulwark|🛡️|#7a3a2a|knight
obsidian|Obsidian Colossus|Volcanic Golem|H|205|1|8|3|1|5|5|lava,steady|⛰️|#3a2a2a|construct
smoulder|Smoulder|Ash Wyvern|H|140|1|6|7|2|4|3|fly,lava|🐉|#8a3a1a|dragon
ashwraiths|Ash Wraiths|Smoke Squad|S|70|3|1|6|1|2|2|camo,phase|🌫️|#5a5a5a|ghost
magmahounds|Magma Hounds|Lava Pack|S|115|3|1|6|1|3|2|lava,venom|🔥|#9a3a1a|beast
sootgoblins|Soot Goblins|Bomb Squad|S|75|4|1|5|3|2|1|rage|🧨|#4a3a2a|warrior
solarion|Solarion|Sun Phoenix|H|160|1|6|8|2|4|3|fly,regen,lava|🌞|#c07a2a|flyer
briarra|Queen Briarra|Thorn Monarch|H|155|1|5|5|4|3|4|ward,regen|🌹|#6a2a3a|caster
glimmer|Glimmer Pixies|Sprite Swarm|S|80|4|1|7|2|1|1|fly,blink|✨|#9a7aca|swarm
antlerheart|Sir Antlerheart|Stag Rider|H|130|1|6|7|1|4|3|charge,pathfinder|🦌|#6a4a2a|rider
oakheart|Oakheart Dryads|Grove Squad|S|75|3|1|5|3|2|2|regen,camo|🍂|#4a6a2a|caster
mossbeard|Mossbeard|Wild Man|H|130|1|7|5|1|4|3|rage,pathfinder|🌿|#4a5a2a|brute
hootclaw|Hootclaw|Owlbear|H|130|1|7|5|1|4|3|charge,rage|🦉|#6a5a3a|beast
thornrangers|Thornwood Rangers|Ranger Squad|S|75|3|1|6|5|2|2|camo,pathfinder|🍃|#3a5a2a|archer
elm|Grandfather Elm|Ancient Tree|H|225|1|10|2|2|4|5|regen,steady|🌳|#3a4a2a|treant
sporelings|Sporelings|Fungus Squad|S|110|4|1|4|2|2|2|venom|🍄|#7a4a5a|warrior
lumenhoof|Lumenhoof|Moon Unicorn|H|105|1|5|8|1|3|3|mend,charge|🦄|#bab0d0|beast
ossric|King Ossric|Bone Monarch|H|190|1|7|4|3|4|4|rally,dread|💀|#5a5a4a|knight
rattlebone|Rattlebone Legion|Skeleton Squad|S|75|4|1|4|1|2|2|steady|☠️|#7a7060|warrior
sanguine|Countess Sanguine|Vampire Lady|H|130|1|5|6|1|4|3|drain,fly|🦇|#6a1a2a|flyer
barrow|Barrow Wights|Grave Squad|S|105|3|1|5|1|3|2|drain,dread|👤|#4a4a5a|ghost
vorn|Dracolich Vorn|Bone Dragon|H|185|1|8|6|3|5|3|fly,dread|🐉|#6a6a5a|dragon
malachar|Malachar|Grave Caller|H|90|1|4|5|5|3|2|drain,rally|📿|#3a2a4a|caster
horde|Shambling Horde|Zombie Squad|S|75|4|1|3|1|2|1|regen|🧟|#4a5a3a|warrior
morrow|Ser Morrow|Death Knight|H|170|1|6|5|1|4|5|dread,riposte|⚔️|#2a2a3a|knight
boneriders|Bone Riders|Skeletal Cavalry|S|105|3|1|7|1|3|2|charge,steady|🐎|#6a6050|rider
grayreaper|The Gray Reaper|Soul Harvester|H|115|1|5|6|1|5|2|phase,drain|⚰️|#3a3a3a|ghost
thunderwing|Thunderwing|Storm Roc|H|145|1|7|8|1|4|3|fly,charge|🦅|#4a5a7a|wbeast
shrikes|Shrike Harpies|Harpy Flock|S|90|3|1|7|1|2|1|fly,venom|🪶|#6a4a5a|flyer
cloudlancers|Cloud Lancers|Sky Knights|S|125|3|1|7|1|3|3|fly,charge|☁️|#7a8aa0|flyer
aeris|Aeris Galewright|Wind Mage|H|90|1|4|6|5|3|2|fly,camo|🌬️|#6a8aa0|caster
peakwardens|Peak Wardens|Eagle Squad|S|70|3|1|8|1|2|2|fly|🦅|#6a5a3a|wbeast
tarvos|Tarvos|Thunder Giant|H|180|1|8|4|4|5|3|steady,pierce|⛈️|#4a4a6a|brute
skybombers|Sky Bombers|Balloon Squad|S|70|3|1|6|4|2|1|fly,eagle|🎈|#8a5a3a|gunner
brynja|Brynja|Storm Valkyrie|H|170|1|5|7|1|4|4|fly,ward|🛡️|#a0a0b0|flyer
nimbara|Nimbara|Cloud Giantess|H|215|1|8|5|2|4|4|leap,sweep|🌥️|#9aa0b0|brute
sparrowkin|Sparrowkin Archers|Bird Squad|S|75|4|1|6|5|1|1|fly,eagle|🐦|#7a6a4a|flyer
durrik|Thane Durrik|Forge Lord|H|165|1|6|4|1|4|5|rally,steady|⚒️|#7a4a2a|knight
hammerguard|Hammerguard|Shield Squad|S|155|3|1|4|1|3|4|bulwark,steady|🔨|#6a5a4a|knight
runa|Runa Stonesong|Rune Priest|H|90|1|5|4|4|2|4|ward,mend|💎|#5a6a8a|caster
delvers|Tunnel Delvers|Miner Squad|S|75|3|1|4|1|2|3|burrow,pathfinder|⛏️|#6a5a3a|warrior
thunderbarrel|Thunderbarrel Crew|Cannon Squad|S|125|3|1|3|7|3|2|pierce|💣|#4a4a4a|gunner
brask|Brask Ironhand|Golemsmith|H|140|1|5|4|3|3|4|mend,rally|🛠️|#6a4a3a|warrior
ulfgar|Ulfgar Deepbeard|Mountain King|H|200|1|7|4|1|5|4|leap,rage|👑|#8a6a3a|warrior
gyrowardens|Gyro Wardens|Flying Squad|S|75|3|1|7|3|2|2|fly|🛩️|#7a6a4a|flyer
grudge|Grudge Slayers|Berserk Squad|S|105|3|1|5|1|3|1|rage,twin|🪓|#8a3a2a|warrior
granitejaw|Granitejaw|Stone Wyrm|H|185|1|8|4|1|4|5|burrow,steady|🐲|#6a6a5a|serpent
seraya|Queen Seraya|Glass Empress|H|135|1|5|5|5|4|3|eagle,ward|💠|#4a8aa0|caster
dunewitches|Dune Witches|Sand Coven|S|100|3|1|5|3|2|2|camo,venom|🏺|#a07a4a|caster
shimmer|Sir Shimmer|Mirage Knight|H|165|1|5|6|1|4|3|blink,camo|🪞|#8a8aa0|knight
riddlemaw|Riddlemaw|Desert Sphinx|H|205|1|7|6|2|4|4|fly,dread|🐈|#b08a4a|wbeast
glassback|Glassback Scorpions|Scorpion Squad|S|135|3|1|5|1|3|3|venom,pathfinder|🦂|#6a4a2a|beast
varo|Captain Varo|Dune Raider|H|110|1|5|7|3|3|3|charge,pathfinder|🏜️|#9a6a3a|rider
neferkhat|Neferkhat|Mummy Lord|H|185|1|7|3|1|4|4|regen,dread|🩹|#a09a7a|warrior
sunspears|Sunspear Archers|Desert Bow Squad|S|75|3|1|5|6|2|2|pathfinder|🏹|#b07a3a|archer
kazr|Ifrit Kazr|Fire Djinn|H|145|1|6|6|3|4|3|fly,lava|🧞|#a03a2a|ghost
larvae|Burrower Larvae|Worm Squad|S|75|3|1|5|1|2|3|burrow|🪱|#8a6a4a|serpent
veylin|Archmage Veylin|Starfall Archmage|H|125|1|5|5|7|4|2|pierce,eagle|🔮|#4a3a8a|caster
starknights|Starfall Knights|Order Squad|S|155|3|1|5|1|3|4|ward|⭐|#3a3a6a|knight
cassia|Cassia Comet|Comet Rider|H|135|1|5|8|2|4|3|fly,charge|☄️|#5a4a8a|flyer
ptolema|Ptolema|Astrologer|H|70|1|4|5|5|2|3|mend,ward|🔭|#4a4a7a|caster
voidwatch|Voidwatch|Rift Squad|S|115|3|1|5|1|3|3|phase|🌑|#2a2a4a|ghost
solenne|Solenne|Lightbringer|H|190|1|6|5|3|4|4|rally,mend|🕯️|#b0a060|knight
orrery|Orrery Guardian|Star Engine|H|190|1|7|4|3|4|5|steady,eagle|🪐|#4a4a6a|construct
novices|Starlight Novices|Acolyte Squad|S|80|4|1|5|3|1|2|mend|📖|#5a5a8a|caster
chronia|Chronia|Time Weaver|H|135|1|4|6|4|3|3|blink,camo|⌛|#6a5a8a|caster
eclipse|Eclipse Warden|Shadow Paladin|H|175|1|6|5|1|4|4|dread,drain|🌘|#3a2a4a|knight
hydra|Seven-Head Vex|Swamp Hydra|H|190|1|9|4|1|5|3|regen,sweep|🐍|#3a5a3a|serpent
trimaw|Trimaw|Chimera|H|180|1|7|6|2|5|3|fly,venom|🦁|#8a5a3a|wbeast
gorehorn|Gorehorn|Labyrinth Minotaur|H|150|1|7|5|1|5|3|charge,rage|🐂|#6a3a2a|brute
stonegaze|Stonegaze|Basilisk|H|195|1|6|4|3|4|4|dread,venom|🦎|#4a5a3a|beast
gargoyles|Rooftop Gargoyles|Stone Squad|S|100|3|1|6|1|2|4|fly,steady|🗿|#6a6a6a|flyer
spinetail|Spinetail|Manticore|H|170|1|7|6|4|4|3|fly,pierce|🦂|#9a5a3a|wbeast
ettin|Grum & Grub|Two-Headed Ettin|H|170|1|9|4|1|4|3|twin,rage|👥|#7a6a4a|brute
wargs|Shadow Wargs|Warg Pack|S|75|4|1|7|1|2|1|charge,camo|🐺|#3a3a3a|beast
cockatrice|Cockatrice Brood|Petrifier Squad|S|90|3|1|5|1|2|2|venom,leap|🐓|#8a7a3a|swarm
primordial|Primordial Titan|World Breaker|H|300|1|12|3|2|6|5|sweep,steady|🌍|#5a4a3a|brute`.split('\n').forEach(line=>{
  const [id,n,t,k,p,f,hp,mv,rg,at,df,ab,g,c,b]=line.split('|');
  CARDS.push({id,n,t,k:k==='H'?'Hero':'Squad',p:+p,f:+f,hp:+hp,mv:+mv,rg:+rg,at:+at,df:+df,ab:ab?ab.split(','):[],g,c,b});
});
const CARD=Object.fromEntries(CARDS.map(c=>[c.id,c]));
const TERR={
  g:{n:'Grass',top:'#6e9a45',side:'#4a6a2e'},
  d:{n:'Earth',top:'#8a6a45',side:'#5e4630'},
  r:{n:'Rock',top:'#8f9196',side:'#5f6166'},
  s:{n:'Sand',top:'#d8c084',side:'#a08a55'},
  w:{n:'Water',top:'#3f86b8',side:'#2a5f86'},
  l:{n:'Lava',top:'#e0601f',side:'#9a3510'},
  n:{n:'Snow',top:'#e8eef2',side:'#a9b6c2'},
  i:{n:'Ice',top:'#a9dcef',side:'#6aa6c4'},
  m:{n:'Swamp',top:'#4f5b33',side:'#39402a'},
  p:{n:'Road',top:'#b39a76',side:'#7d6a50'},
  c:{n:'Castle',top:'#9c968a',side:'#6f6a60'},
  x:{n:'Power Shard',top:'#5d4a8a',side:'#3f3263'},
  t:{n:'Tree',top:'#2f5a2a',side:'#2f5a2a'}
};
const TERR_NOTE={g:'Plain ground.',d:'Plain ground.',r:'Plain ground.',s:'Costs 1 extra move to enter.',w:'Ends movement on entry.',l:'Ends movement and burns for 1 wound.',
  n:'Costs 1 extra move to enter.',i:'Slippery: a figure standing on ice rolls 1 fewer defense die.',m:'Bog: costs 2 extra moves to enter.',p:'Road: entering costs only half a move.',
  c:'Fortified: a figure standing on castle stone rolls +1 defense die.',x:'Power shard: a figure standing on it rolls +1 attack die.',t:'Blocks movement and sight.'};
const UNDER={w:'d',l:'r',g:'d',n:'r',i:'d',m:'d',p:'d',x:'r',c:'c',s:'s',d:'d',r:'r'};
function terrExtra(t,u){
  if(t==='p')return -0.5;
  if(u&&has(u,'pathfinder')&&(t==='s'||t==='n'||t==='m'))return 0;
  return t==='s'||t==='n'?1:t==='m'?2:0;
}
const SEATC=['#e0533d','#3d8fe0','#e0b13d','#4cb86a','#9a6ae0','#2ec4b6'];
const MAXP=6;
let R=9;const classic=s=>!!(s&&s.rules==='classic');
const maxRounds=s=>classic(s)?40:(s.n>=5?14:10)+Math.max(0,(s.R||9)-11);const MAXROUNDS=10, FACES=['sk','sk','sk','sh','sh','bl'];
const DIRS=[[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]];

/* ================= HELPERS ================= */
const K=(q,r)=>q+','+r;
const P=k=>k.split(',').map(Number);
const dist=(a,b)=>(Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1])+Math.abs(a[0]+a[1]-b[0]-b[1]))/2;
const nbrs=(q,r)=>DIRS.map(([dq,dr])=>[q+dq,r+dr]);
const inBoard=(q,r)=>Math.abs(q)<=R&&Math.abs(r)<=R&&Math.abs(q+r)<=R;
const rnd=n=>Math.floor(Math.random()*n);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function ground(s,k){const c=s.map[k];return c?c.replace(/t/g,'').length:0}
function topT(s,k){const c=s.map[k];if(!c)return null;const g=c.replace(/t/g,'');return g?g[g.length-1]:null}
function hasTree(s,k){const c=s.map[k];return !!c&&c.includes('t')}
function unitAt(s,k){return s.units.find(u=>u.hp>0&&u.k===k)}
function has(u,a){return CARD[u.card].ab.includes(a)}
function roll(n){const a=[];for(let i=0;i<Math.max(0,n);i++)a.push(FACES[rnd(6)]);return a}
function log(s,m){s.log.unshift(m);if(s.log.length>60)s.log.length=60}
function seatName(s,i){return (s.seats[i]&&s.seats[i].name)||('Player '+(i+1))}
function pts(s,seat){return (s.army[seat]||[]).reduce((a,c)=>a+CARD[c].p,0)}

/* ================= MAP GENERATION ================= */
function genMap(kind){
  const m={};const sd=Math.random()*100;const R2=Math.random;
  const col=(h,top,under)=>{let c='';for(let i=0;i<h-1;i++)c+=under||UNDER[top]||'d';return c+top};
  for(let q=-R;q<=R;q++)for(let r=-R;r<=R;r++){ if(!inBoard(q,r))continue;
    const x=q+r/2,y=r*0.866;
    const n=Math.sin(x*.36+sd)+Math.cos(y*.41+sd*1.3)+.6*Math.sin((x+y)*.27+sd*.7)+.4*Math.cos((x-y)*.5+sd*2.1);
    const road=Math.abs(y-Math.sin(x*.35+sd)*2.2)<.55||Math.abs(x+Math.cos(y*.3+sd)*2)<.5;
    let h,top,under=null,tree=false;
    if(kind==='flat'){h=1;top=R2()<.07?'s':'g';if(R2()<.05)h=2;if(road)top='p';tree=R2()<.04}
    else if(kind==='lava'){
      const rift=Math.abs(x+Math.sin(y*.45+sd)*1.6);
      if(rift<1.3){h=1;top='l';if(Math.abs(y)<1.2||Math.abs(y-5)<.7||Math.abs(y+5)<.7){h=2;top='r'}}
      else{h=Math.max(1,Math.min(6,Math.round(2+n*1.1)));top=h>=4?'r':(R2()<.35?'s':'d');if(h>=5&&R2()<.12)top='x'}
    }else if(kind==='islands'){
      const d1=Math.hypot(x-4.2,y-1),d2=Math.hypot(x+4.2,y+1),d=Math.min(d1,d2);
      if(d>5.2+Math.sin(sd+x)*.6&&!(Math.abs(y)<.9&&Math.abs(x)<3)){h=1;top='w'}
      else{h=Math.max(1,Math.min(6,Math.round(4.2-d*.55+n*.6)));top=h>=5?'r':(d>4.3?'s':'g');tree=top==='g'&&R2()<.08;if(Math.abs(y)<.9&&Math.abs(x)<3){h=1;top='p';tree=false}}
    }else if(kind==='frozen'){
      h=Math.max(1,Math.min(8,Math.round(2.6+n*1.6)));
      top=h<=1?'i':h>=5?(R2()<.3?'r':'n'):(R2()<.12?'i':'n');under=h>=4?'r':'d';
      if(road&&h<=4){top='p';h=Math.max(h,2)}
      tree=top==='n'&&h<=4&&R2()<.07;if(h>=6&&R2()<.1)top='x';
    }else if(kind==='swamp'){
      h=Math.max(1,Math.min(4,Math.round(1.6+n*.8)));
      top=h<=1?(R2()<.55?'w':'m'):(R2()<.45?'m':'g');tree=top!=='w'&&R2()<.12;
      if(road&&h>=1){top='p';tree=false}
    }else if(kind==='castle'){
      const d=Math.hypot(x,y);
      h=Math.max(1,Math.min(4,Math.round(1.6+n*.7)));top=R2()<.06?'s':'g';tree=R2()<.05;
      if(d>3.2&&d<4.3){h=4;top='c';tree=false;if(Math.abs(Math.atan2(y,x)-Math.PI/2)<.32||Math.abs(Math.atan2(y,x)+Math.PI/2)<.32){h=2;top='p'}}
      else if(d<=3.2){h=2;top=d<1.1?'x':'c';tree=false;if(d<1.1)h=3}
      else if(d>=4.3&&d<5.2){h=1;top='w';tree=false}
      if(road&&d>=5.2){top='p';tree=false}
      if((Math.abs(x)<0.6&&d>=4.3&&d<5.2)){h=2;top='p'}
    }else{
      h=Math.max(1,Math.min(7,Math.round(2.3+n*1.25)));top=h<=1?'w':h>=5?'r':(R2()<.07?'s':'g');
      if(road&&top==='g'&&h<=3)top='p';
      tree=top==='g'&&R2()<.055;if(h>=5&&R2()<.06)top='x';
    }
    m[K(q,r)]=col(h,top,under)+(tree?'t':'');
  }
  return m;
}
function autoZones(s,need){
  const n=s.n;s.zones={};
  for(let i=0;i<n;i++){
    const ang=Math.PI/2+i*2*Math.PI/n;const dx=Math.cos(ang),dy=Math.sin(ang);
    let best=null,bv=-1e9;
    for(const k in s.map){const [q,r]=P(k);const x=q+r/2,y=r*.866;const v=x*dx+y*dy;if(v>bv){bv=v;best=[q,r]}}
    growZone(s,i,best,need||14);
  }
}
function okZone(s,k){return ground(s,k)>0&&!hasTree(s,k)&&topT(s,k)!=='l'&&s.zones[k]===undefined}
function zoneAnchor(s,seat){const ks=Object.keys(s.zones).filter(k=>s.zones[k]===seat);if(!ks.length)return null;let x=0,y=0;ks.forEach(k=>{const [q,r]=P(k);x+=q;y+=r});return [Math.round(x/ks.length),Math.round(y/ks.length)]}
function growZone(s,seat,anchor,need){
  if(!anchor)return;
  const have=Object.keys(s.zones).filter(k=>s.zones[k]===seat).length;
  let want=need-have;if(want<=0)return;
  const c=Object.keys(s.map).filter(k=>okZone(s,k)).map(k=>{const p=P(k);return [k,dist(p,anchor)+(topT(s,k)==='w'?2.5:0)]}).sort((a,b)=>a[1]-b[1]);
  for(const [k] of c){if(want<=0)break;s.zones[k]=seat;want--}
}

/* ================= STATE ================= */
function boardR(n){return n>=5?11:9}
function syncR(){R=(S&&S.R)||9}
function turnsPer(n){return n>=5?2:3}
const HBODY={swarm:3,chest:3,beast:4,warrior:5,knight:5,caster:5,archer:5,gunner:5,flyer:5,ghost:5,rider:6,wbeast:6,serpent:6,kraken:7,treant:8,brute:8,construct:8,dragon:9};
function figH(c){let h=HBODY[BODY[c.id]||c.b||'warrior']||5;if(c.k==='Squad')h=Math.max(3,h-1);if(c.hp>=9)h+=2;return h}
const BOARDS=[[9,'Standard',271],[11,'Large',397],[14,'Huge',631],[18,'Epic',1027]];
const boardName=r=>{const b=BOARDS.find(x=>x[0]===r);return b?b[1]+' · '+b[2].toLocaleString()+' hexes':''};
function newState(opts){
  R=opts.R||boardR(opts.n);
  const s={v:1,rev:0,code:opts.code,phase:'lobby',host:opts.host,n:opts.n,budget:opts.budget,
    rules:'classic',R:R,seats:Array(opts.n).fill(null),map:genMap('hills'),zones:{},army:{},units:[],draft:null,deploy:null,turn:null,log:[],roll:null,winner:null,updated:Date.now()};
  autoZones(s);
  return s;
}

/* ================= RUNTIME / SYNC ================= */
let DB=null,USER=null,myId=null,S=null,LOCAL=false,gameRef=null,unsub=null,listUnsub=null,openGames=[],readOnly=false;
let writing=false,pendingWrite=false,lazyTimer=null;
const ui={sel:null,tool:'raise',terr:'g',zoneSeat:0,rot:0,zoom:1,pan:{x:0,y:0},deploySel:null,name:'',hover:null,preview:genMap('hills'),dbReady:false,detail:null,filter:'all',sort:'name',botSpeed:'normal',botPaused:false,off:{n:2,b:500,r:0,seats:['human','normal','normal','normal','normal','normal']}};
function lsGet(k){try{return localStorage.getItem(k)}catch(e){return null}}
function lsSet(k,v){try{localStorage.setItem(k,v)}catch(e){}}
ui.name=lsGet('ss-name')||'';

/* ---- Desktop app: LAN server over WebSocket, same API shape as the db capability ---- */
let DESKTOP=false;
function makeWsDB(addr,onStatus){
  let ws=null,open=false,closed=false,seq=0;
  const waits=new Map(),docSubs=new Map(),listSubs=new Set(),pendingSets=new Map(),queue=[];
  const snapOf=d=>({exists:!!d,id:'',data:()=>d||undefined,metadata:{hasPendingWrites:false,fromCache:false}});
  const raw=o=>{const s=JSON.stringify(o);if(open)ws.send(s);else queue.push(s)};
  function req(o){return new Promise((res,rej)=>{const id=++seq;o.id=id;waits.set(id,{res,rej,set:o.t==='set',o});raw(o)})}
  function connect(){
    if(closed)return;
    const direct=typeof addr==='function';
    try{ws=direct?addr():new WebSocket('ws://'+addr)}catch(e){onStatus(false);if(!direct)setTimeout(connect,2500);return}
    ws.onopen=()=>{open=true;onStatus(true);
      for(const k of docSubs.keys())ws.send(JSON.stringify({t:'sub',key:k}));
      if(listSubs.size)ws.send('{"t":"list"}');
      for(const w of waits.values())if(w.set)ws.send(JSON.stringify(w.o)); // resend unsaved moves
      queue.splice(0).forEach(s=>{const o=JSON.parse(s);if(o.t!=='set'&&o.t!=='sub'&&o.t!=='list')ws.send(s)})};
    ws.onmessage=e=>{let m;try{m=JSON.parse(e.data)}catch(_){return}
      if(m.t==='res'){const w=waits.get(m.id);if(w){waits.delete(m.id);m.err?w.rej({code:m.err,message:m.err}):w.res(m)}}
      else if(m.t==='snap'){const s=docSubs.get(m.key);if(s)s.forEach(f=>f.next(snapOf(m.data)))}
      else if(m.t==='list'){const docs=m.data.map(snapOf);listSubs.forEach(f=>f.next({docs,size:docs.length,empty:!docs.length,docChanges:()=>[],metadata:{hasPendingWrites:false,fromCache:false}}))}};
    ws.onclose=()=>{const was=open;open=false;onStatus(false);
      for(const [id,w] of waits)if(!w.set){waits.delete(id);w.rej({code:'unavailable',message:'disconnected'})}
      if(direct)closed=true;
      if(!closed)setTimeout(connect,was?800:2500)};
    ws.onerror=()=>{};
    if(ws.readyState===1||ws.readyState==='open')ws.onopen();
  }
  connect();
  return {
    close(){closed=true;try{ws&&ws.close()}catch(e){}},
    doc(path){return {path,
      set:d=>req({t:'set',key:path,data:d}).then(()=>{}),
      get:()=>req({t:'get',key:path}).then(r=>snapOf(r.data)),
      acquire:o=>req({t:'acquire',key:path,holder:o.holder,ttl:o.ttlMs||30000}).then(r=>({acquired:!!r.acquired})),
      onSnapshot(next,err){let s=docSubs.get(path);if(!s){s=new Set();docSubs.set(path,s);raw({t:'sub',key:path})}
        const f={next,err};s.add(f);return ()=>{s.delete(f);if(!s.size){docSubs.delete(path);if(open)raw({t:'unsub',key:path})}}}}},
    collection(){const q={orderBy:()=>q,limit:()=>q,onSnapshot(next,err){const f={next,err};listSubs.add(f);raw({t:'list'});return ()=>listSubs.delete(f)}};return q}
  };
}
function connectServer(addr){
  addr=(addr||'').trim().replace(/^wss?:\/\//,'').replace(/\/.*$/,'');if(!addr)return;
  if(!/:\d+$/.test(addr))addr+=':'+((ui.net&&ui.net.port)||47800);
  switchDB(addr,addr,'Lost connection to the host. Reconnecting…');
  lsSet('ss-server',addr);
}
function switchDB(transport,label,lostMsg){
  if(listUnsub){listUnsub();listUnsub=null}
  const old=DB;DB=null;if(S&&!LOCAL)leave();if(old&&old.close)old.close();
  openGames=[];ui.server=label;ui.dbReady=false;
  const tok={};ui.dbTok=tok;
  DB=makeWsDB(transport,ok=>{if(ui.dbTok!==tok||ui.dbReady===ok)return;ui.dbReady=ok;renderChips();if(!S)renderSide();else if(!ok)toast(lostMsg)});
  watchGames();renderAll();
}
const isLocalServer=()=>!!(ui.server&&ui.server.startsWith('localhost'));

/* ---- Internet play: copy-paste invite codes open a direct WebRTC link to the host,
   whose app relays it into its own game server. Router auto-forwarding (UPnP) is a shortcut. ---- */
const RTC_CFG={iceServers:[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302']},{urls:'stun:stun.cloudflare.com:3478'}]};
const rtc={slots:{},peers:0,invite:null,status:'',guest:null};
async function packCode(prefix,obj){
  const cs=new Blob([JSON.stringify(obj)]).stream().pipeThrough(new CompressionStream('deflate-raw'));
  const buf=new Uint8Array(await new Response(cs).arrayBuffer());let s='';for(let i=0;i<buf.length;i++)s+=String.fromCharCode(buf[i]);
  return prefix+btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
async function unpackCode(prefix,code){
  code=(code||'').replace(/\s+/g,'');if(!code.startsWith(prefix))throw new Error('wrong code');
  let b=code.slice(prefix.length).replace(/-/g,'+').replace(/_/g,'/');while(b.length%4)b+='=';
  const bin=atob(b);const u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
  const ds=new Blob([u]).stream().pipeThrough(new DecompressionStream('deflate-raw'));return JSON.parse(await new Response(ds).text());
}
function gathered(pc){return new Promise(res=>{if(pc.iceGatheringState==='complete')return res();const t=setTimeout(res,6000);pc.addEventListener('icegatheringstatechange',()=>{if(pc.iceGatheringState==='complete'){clearTimeout(t);res()}})})}
function publicAddr(){const u=ui.net&&ui.net.upnp;return u&&u.ok?u.ip+':'+ui.net.port:null}
async function hostInvite(){
  const id=Math.random().toString(36).slice(2,8);
  const pc=new RTCPeerConnection(RTC_CFG);const dc=pc.createDataChannel('shardscape',{ordered:true});
  rtc.slots[id]={pc,dc};rtc.invite='';rtc.status='Preparing invite…';renderSide();
  dc.onopen=()=>{delete rtc.slots[id];relay(dc);rtc.peers++;rtc.invite=null;rtc.status='A friend connected over the internet. Create another invite for the next friend.';renderSide();toast('Friend connected')};
  pc.onconnectionstatechange=()=>{if(pc.connectionState==='failed'){delete rtc.slots[id];rtc.status='That link failed: one of your networks blocks direct connections. See “If invites fail” in the README.';renderSide()}};
  await pc.setLocalDescription(await pc.createOffer());await gathered(pc);
  rtc.invite=await packCode('SSI-',{v:1,g:S&&!LOCAL?S.code:null,a:publicAddr(),id,o:pc.localDescription.sdp});
  rtc.status='';renderSide();
}
async function hostAcceptReply(code){
  let r;try{r=await unpackCode('SSR-',code)}catch(e){toast('That isn’t a reply code. Copy the whole code that starts with SSR-.');return}
  const sl=rtc.slots[r.id];if(!sl){toast('That reply belongs to an older invite. Create a new invite.');return}
  try{await sl.pc.setRemoteDescription({type:'answer',sdp:r.o});ui.replyDraft='';rtc.status='Connecting to your friend…';renderSide()}
  catch(e){toast('Could not use that reply code. Create a new invite and try again.')}
}
function relay(dc){
  const ws=new WebSocket('ws://localhost:'+((ui.net&&ui.net.port)||47800));const q=[];
  ws.onopen=()=>q.splice(0).forEach(m=>ws.send(m));
  dc.onmessage=e=>{if(ws.readyState===1)ws.send(e.data);else q.push(e.data)};
  ws.onmessage=e=>{if(dc.readyState==='open')try{dc.send(e.data)}catch(_){}};
  dc.onclose=()=>{try{ws.close()}catch(_){}rtc.peers=Math.max(0,rtc.peers-1);renderSide()};
  ws.onclose=()=>{try{dc.close()}catch(_){}};
}
function probeWs(addr){return new Promise(res=>{let ws;const t=setTimeout(()=>{try{ws&&ws.close()}catch(_){}res(false)},3500);
  try{ws=new WebSocket('ws://'+addr)}catch(e){clearTimeout(t);return res(false)}
  ws.onopen=()=>{clearTimeout(t);ws.close();res(true)};ws.onerror=()=>{clearTimeout(t);res(false)}})}
async function guestUseInvite(code){
  let inv;try{inv=await unpackCode('SSI-',code)}catch(e){toast('That isn’t an invite code. Copy the whole code that starts with SSI-.');return}
  rtc.guest={state:'trying'};renderSide();
  if(inv.a&&await probeWs(inv.a)){rtc.guest=null;ui.inviteDraft='';connectServer(inv.a);if(inv.g)joinGame(inv.g);return}
  const pc=new RTCPeerConnection(RTC_CFG);rtc.guest={state:'reply',pc};
  pc.ondatachannel=e=>{const dc=e.channel;const go=()=>{rtc.guest={state:'connected'};ui.inviteDraft='';
    switchDB(()=>dc,'internet','Lost the internet link to the host. Ask them for a new invite.');if(inv.g)joinGame(inv.g)};
    if(dc.readyState==='open')go();else dc.onopen=go};
  pc.onconnectionstatechange=()=>{if(pc.connectionState==='failed'){rtc.guest={state:'failed'};renderSide()}};
  try{await pc.setRemoteDescription({type:'offer',sdp:inv.o});await pc.setLocalDescription(await pc.createAnswer());await gathered(pc);
    if(rtc.guest&&rtc.guest.pc===pc){rtc.guest.reply=await packCode('SSR-',{id:inv.id,o:pc.localDescription.sdp});renderSide()}}
  catch(e){rtc.guest={state:'failed'};renderSide()}
}
function copyText(id){const el=document.getElementById(id);if(!el)return;
  const done=()=>toast('Copied');const fall=()=>{el.select();try{document.execCommand('copy');done()}catch(e){toast('Select the code and copy it')}};
  try{navigator.clipboard.writeText(el.value).then(done,fall)}catch(e){fall()}}

async function boot(){
  myId=lsGet('ss-id');if(!myId){myId='l'+Math.random().toString(36).slice(2,10);lsSet('ss-id',myId)}
  renderAll();
  if(window.desktop){
    DESKTOP=true;
    try{ui.net=await window.desktop.netInfo()}catch(e){ui.net={ok:false,port:47800,ips:[],error:'unknown'}}
    ui.dbChecked=true;
    connectServer(lsGet('ss-server')||('localhost:'+ui.net.port));
    if(window.desktop.upnp)window.desktop.upnp().then(u=>{ui.net.upnp=u;if(!S||S.phase==='lobby')renderSide()}).catch(()=>{});
    return;
  }
  const C=window.claude;
  if(C&&C.use){
    try{USER=await C.use('user')}catch(e){USER=null}
    try{DB=await C.use('db')}catch(e){DB=null}
    if(USER){try{const id=await USER.id();if(id)myId=id}catch(e){}}
    if(DB){ui.dbReady=true;watchGames()}
  }
  ui.dbChecked=true;renderAll();
}
function watchGames(){
  if(!DB||listUnsub)return;
  try{
    listUnsub=DB.collection('games').orderBy('updated','desc').limit(12).onSnapshot(q=>{
      openGames=q.docs.map(d=>d.data()).filter(Boolean);if(!S)renderSide();
    },()=>{listUnsub=null});
  }catch(e){}
}
function toast(m){const t=document.getElementById('toast');t.textContent=m;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>t.hidden=true,2600)}

function commit(fn,lazy){
  if(!S)return;
  const n=structuredClone(S);fn(n);n.rev=(S.rev||0)+1;n.w=myId+':'+Math.random().toString(36).slice(2,7);n.updated=Date.now();
  S=n;syncR();renderAll();
  if(LOCAL||!gameRef)return;
  if(lazy){clearTimeout(lazyTimer);lazyTimer=setTimeout(queueWrite,400)}else{clearTimeout(lazyTimer);queueWrite()}
}
async function queueWrite(){
  if(writing){pendingWrite=true;return}
  writing=true;
  try{await gameRef.set(S)}catch(e){
    if(e&&e.code==='invalid_argument'){readOnly=true;toast('You can watch this game but not play: ask the owner to make you a Contributor.')}
    else if(e&&e.code==='quota_exceeded')toast('Game storage is full. Ask the owner to clear old games.');
    else toast('Could not save the last move. Check your connection.');
  }
  writing=false;
  if(pendingWrite){pendingWrite=false;queueWrite()}
}
function attach(code){
  if(unsub){unsub();unsub=null}
  gameRef=DB.doc('games/'+code);
  let loaded=false;const timer=setTimeout(()=>{if(!loaded)toast('Still connecting to the game…')},10000);
  unsub=gameRef.onSnapshot(snap=>{
    if(!snap.exists){if(!loaded&&!S){toast('No game with code '+code);leave()}return}
    loaded=true;clearTimeout(timer);
    if(snap.metadata.hasPendingWrites)return;
    const d=snap.data();
    if(S&&S.code===code&&(d.rev<S.rev||d.w===S.w))return;
    const prevRoll=S&&S.roll&&S.roll.id;
    S=structuredClone(d);
    if(S.roll&&S.roll.id!==prevRoll&&prevRoll!==undefined)flashRoll();
    renderAll();
  },e=>{clearTimeout(timer);toast('Lost the connection to this game.')});
}
function leave(){if(unsub){unsub();unsub=null}gameRef=null;S=null;LOCAL=false;readOnly=false;ui.sel=null;watchGames();renderAll()}
function newCode(){const a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let c='';for(let i=0;i<4;i++)c+=a[rnd(a.length)];return c}

function ctl(seat){if(LOCAL)return !isBot(seat);if(readOnly)return false;return !!(S.seats[seat]&&S.seats[seat].id===myId)}
function isHost(){return LOCAL||(S&&S.host===myId&&!readOnly)}
function mySeats(){return S?S.seats.map((x,i)=>ctl(i)?i:-1).filter(i=>i>=0):[]}

async function createGame(n,budget,local,cfg,size){
  const code=local?'LOCAL':newCode();
  const s=newState({code,host:myId,n,budget,R:size||null});
  if(local){LOCAL=true;s.bots={};const names=[...BOT_NAMES].sort(()=>Math.random()-.5);let hn=0;
    s.seats=s.seats.map((_,i)=>{const t=(cfg&&cfg[i])||'human';if(t!=='human'){s.bots[i]=t;return {id:myId,name:names[i]+' ('+LV_NAME[t]+')'}}hn++;return {id:myId,name:hn===1&&ui.name?ui.name:'Player '+(i+1)}});
    if(Object.keys(s.bots).length)log(s,'Offline game against '+Object.values(s.bots).map(l=>LV_NAME[l]).join(', ')+' bot'+(Object.keys(s.bots).length>1?'s':'')+'.');
    S=s;renderAll();return}
  s.seats[0]={id:myId,name:ui.name||'Player 1'};
  S=s;LOCAL=false;
  try{gameRef=DB.doc('games/'+code);await gameRef.set(s);attach(code);if(listUnsub){listUnsub();listUnsub=null}}
  catch(e){S=null;gameRef=null;toast(e&&e.code==='invalid_argument'?'You need Contributor access on this page to host online games.':'Could not create the game. Try again.')}
  renderAll();
}
async function joinGame(code){
  code=(code||'').trim().toUpperCase();if(!code)return;
  if(!DB){toast('Online play is not available in this view.');return}
  S=null;LOCAL=false;if(listUnsub){listUnsub();listUnsub=null}attach(code);
}
async function takeSeat(i){
  if(LOCAL)return;
  try{
    let lease={acquired:false};
    for(let i=0;i<30&&!lease.acquired;i++){lease=await gameRef.acquire({holder:myId,ttlMs:1000});if(!lease.acquired){if(i===0)toast('Joining…');await new Promise(r=>setTimeout(r,250+Math.random()*250))}}
    if(!lease.acquired){toast('Lots of players are joining at once. Try again in a moment.');return}
    const snap=await gameRef.get();const d=snap.data();
    if(d.seats[i]){S=structuredClone(d);renderAll();toast('That seat was just taken.');return}
    S=structuredClone(d);
    commit(s=>{s.seats[i]={id:myId,name:ui.name||('Player '+(i+1))}});
  }catch(e){toast('Could not take the seat. You may need Contributor access.')}
}

/* ================= PHASE ACTIONS ================= */
function startDraft(s){
  s.phase='draft';s.army={};for(let i=0;i<s.n;i++)s.army[i]=[];
  s.draft={step:0,passed:{}};s.units=[];s.turn=null;s.winner=null;s.roll=null;
  log(s,'Draft begins. Snake order, '+s.budget+' points each.');
  normDraft(s);
}
function draftSeat(s){const n=s.n,st=s.draft.step,rd=Math.floor(st/n),ix=st%n;return rd%2===0?ix:n-1-ix}
function taken(s){const t=new Set();for(const k in s.army)s.army[k].forEach(c=>t.add(c));return t}
const LV_BONUS={beginner:-.15,brutal:.25};
function budgetFor(s,seat){const lv=s.bots&&s.bots[seat];return Math.round(s.budget*(1+(LV_BONUS[lv]||0))/5)*5}
function normDraftNow(){if(S&&S.phase==='draft')commit(s=>normDraft(s))}
function canAfford(s,seat){const t=taken(s),left=budgetFor(s,seat)-pts(s,seat);return CARDS.some(c=>!t.has(c.id)&&c.p<=left)}
function normDraft(s){
  for(let guard=0;guard<200;guard++){
    if(Object.keys(s.draft.passed).length>=s.n){finishDraft(s);return}
    const seat=draftSeat(s);
    if(s.draft.passed[seat]){s.draft.step++;continue}
    if(!canAfford(s,seat)){s.draft.passed[seat]=true;log(s,seatName(s,seat)+' is out of picks.');s.draft.step++;continue}
    return;
  }
}
function draftPick(cid){commit(s=>{const seat=draftSeat(s);s.army[seat].push(cid);log(s,seatName(s,seat)+' drafts '+CARD[cid].n+'.');s.draft.step++;normDraft(s)})}
function draftPass(){commit(s=>{const seat=draftSeat(s);s.draft.passed[seat]=true;log(s,seatName(s,seat)+' stops drafting.');s.draft.step++;normDraft(s)})}
function finishDraft(s){
  s.units=[];
  for(let i=0;i<s.n;i++)(s.army[i]||[]).forEach(cid=>{const c=CARD[cid];for(let f=0;f<c.f;f++)s.units.push({id:i+'-'+cid+'-'+f,card:cid,o:i,hp:c.hp,k:null})});
  for(let i=0;i<s.n;i++){const need=s.units.filter(u=>u.o===i).length;const a=zoneAnchor(s,i);if(a)growZone(s,i,a,need+2);}
  s.phase='deploy';s.deploy={seat:-1};nextDeploy(s);
  log(s,'Draft complete. Deploy your figures in your start zone.');
}
function nextDeploy(s){
  for(let i=s.deploy.seat+1;i<s.n;i++){if(s.units.some(u=>u.o===i)){s.deploy.seat=i;return}}
  startBattle(s);
}
function autoDeploy(s,seat){
  const free=Object.keys(s.zones).filter(k=>s.zones[k]===seat&&!unitAt(s,k)&&!hasTree(s,k));
  free.sort(()=>Math.random()-.5);
  s.units.filter(u=>u.o===seat&&!u.k).forEach(u=>{const k=free.pop();if(k)u.k=k});
}
function startBattle(s){s.phase='battle';s.turn={round:0};newRound(s);checkWin(s)}
function aliveSeats(s){return [...new Set(s.units.filter(u=>u.hp>0&&u.k).map(u=>u.o))]}
function newRound(s){
  s.turn.round++;
  if(s.turn.round>maxRounds(s)){endByPoints(s);return}
  if(classic(s)){
    Object.assign(s.turn,{stage:'orders',orders:{},order:[],idx:-1,seat:-1,marker:null,card:null,attacking:false,moved:{},atk:{}});
    log(s,'Round '+s.turn.round+': everyone secretly places order markers 1, 2, 3 and X.');
    return;
  }
  const alive=aliveSeats(s);
  const rolls=alive.map(i=>({i,r:1+rnd(20)})).sort((a,b)=>b.r-a.r||Math.random()-.5);
  log(s,'Round '+s.turn.round+' initiative: '+rolls.map(x=>seatName(s,x.i)+' '+x.r).join(', ')+'.');
  const order=[];for(let t=0;t<turnsPer(s.n);t++)rolls.forEach(x=>order.push(x.i));
  Object.assign(s.turn,{order,idx:0,seat:order[0],card:null,attacking:false,moved:{},atk:{}});
}
function cardsAlive(s,seat){return [...new Set(s.units.filter(u=>u.o===seat&&u.hp>0&&u.k).map(u=>u.card))]}
function needOrders(s){return s.phase==='battle'&&classic(s)&&s.turn.stage==='orders'?aliveSeats(s).filter(i=>!s.turn.orders[i]):[]}
function submitOrders(s,seat,ord){
  if(!(s.phase==='battle'&&classic(s)&&s.turn.stage==='orders')||s.turn.orders[seat])return;
  s.turn.orders[seat]=ord;log(s,seatName(s,seat)+' has placed order markers.');
  if(needOrders(s).length)return;
  // initiative: everyone rolls a d20; tied players roll again among themselves
  const alive=aliveSeats(s);const roll20={};alive.forEach(i=>roll20[i]=[]);
  const resolve=(g,depth)=>{if(g.length<=1&&depth>0)return g;if(depth>25)return g.sort(()=>Math.random()-.5);
    g.forEach(i=>roll20[i].push(1+rnd(20)));const byR={};g.forEach(i=>{const r=roll20[i][roll20[i].length-1];(byR[r]=byR[r]||[]).push(i)});
    return Object.keys(byR).map(Number).sort((x,y)=>y-x).flatMap(r=>byR[r].length>1?resolve(byR[r],depth+1):byR[r])};
  const ranked=resolve(alive,0);
  log(s,'Round '+s.turn.round+' initiative: '+ranked.map(i=>seatName(s,i)+' '+roll20[i].join('→')).join(', ')+'.');
  const order=[];for(let m=1;m<=3;m++)ranked.forEach(i=>order.push({i,m}));
  Object.assign(s.turn,{stage:'play',order,idx:-1});
  nextTurn(s);
}
function endTurn(s){
  if(s.phase!=='battle')return;
  const t=s.turn;
  if(t.card&&CARD[t.card].ab.includes('regen')){
    let healed=0;s.units.forEach(u=>{if(u.card===t.card&&u.o===t.seat&&u.hp>0&&u.hp<CARD[u.card].hp){u.hp++;healed++}});
    if(healed)log(s,CARD[t.card].n+' regenerates 1 wound.');
  }
  nextTurn(s);
}
function nextTurn(s){
  const t=s.turn;
  for(;;){
    t.idx++;
    if(t.idx>=t.order.length){newRound(s);return}
    const e=t.order[t.idx];
    if(typeof e==='object'){
      const seat=e.i,cid=(t.orders[seat]||{})[e.m];
      if(!s.units.some(u=>u.o===seat&&u.hp>0&&u.k))continue;
      if(!cid||!s.units.some(u=>u.o===seat&&u.card===cid&&u.hp>0&&u.k)){log(s,seatName(s,seat)+' reveals order '+e.m+(cid?' on '+CARD[cid].n+', which is destroyed':'')+': turn lost.');continue}
      Object.assign(t,{seat,marker:e.m,card:cid,attacking:false,moved:{},atk:{}});
      log(s,seatName(s,seat)+' reveals order '+e.m+': '+CARD[cid].n+'.');return;
    }
    if(s.units.some(u=>u.o===e&&u.hp>0&&u.k)){Object.assign(t,{seat:e,card:null,attacking:false,moved:{},atk:{}});return}
  }
}
function checkWin(s){
  if(s.phase!=='battle')return;
  const alive=aliveSeats(s);
  if(alive.length<=1){s.phase='over';s.winner=alive.length?alive[0]:-1;log(s,alive.length?seatName(s,alive[0])+' wins the battle!':'Mutual destruction. No winner.')}
}
function endByPoints(s){
  let best=-1,bv=-1,tie=false;
  for(let i=0;i<s.n;i++){const cs=new Set(s.units.filter(u=>u.o===i&&u.hp>0).map(u=>u.card));const v=[...cs].reduce((a,c)=>a+CARD[c].p,0);
    log(s,seatName(s,i)+' holds '+v+' points of survivors.');if(v>bv){bv=v;best=i;tie=false}else if(v===bv)tie=true}
  s.phase='over';s.winner=tie?-1:best;log(s,tie?'Time is up: a draw.':'Time is up: '+seatName(s,best)+' wins on points.');
}

/* ================= MOVEMENT & COMBAT ================= */
function moveOpts(s,u){
  const c=CARD[u.card],fly=has(u,'fly'),phase=has(u,'phase');
  const start=u.k,best={[start]:{c:0,p:null}},q=[start];const out={};
  while(q.length){
    q.sort((a,b)=>best[a].c-best[b].c);const cur=q.shift();const [cq,cr]=P(cur);const cc=best[cur].c;
    if(cur!==start){const tt=topT(s,cur);if(!fly&&((tt==='w'&&!has(u,'swim'))||(tt==='l'&&!has(u,'lava'))))continue}
    for(const [nq,nr] of nbrs(cq,cr)){
      const nk=K(nq,nr);const gh=ground(s,nk);if(!gh)continue;
      const occ=unitAt(s,nk);
      if(!fly&&!has(u,'burrow')&&hasTree(s,nk))continue;
      if(occ&&occ.o!==u.o&&!fly&&!phase)continue;
      let cost=1;
      if(!fly){const dh=gh-ground(s,cur);if(!has(u,'leap')){if(classic(s)){if(dh>figH(c))continue}else{if(dh>2)continue;if(dh<-4)continue}cost+=Math.max(0,dh)}cost+=terrExtra(topT(s,nk),u)}
      const nc=cc+cost;if(nc>c.mv)continue;
      if(!best[nk]||best[nk].c>nc){best[nk]={c:nc,p:cur};q.push(nk)}
    }
  }
  for(const k in best){if(k===start)continue;if(unitAt(s,k)||hasTree(s,k))continue;out[k]=best[k]}
  return {dest:out,tree:best};
}
function pathTo(tree,k){const p=[];while(k){p.unshift(k);k=tree[k].p}return p}
function hexLine(a,b){
  const N=dist(a,b),out=[];
  for(let i=1;i<N;i++){const t=i/N;let x=a[0]+(b[0]-a[0])*t+1e-6,z=a[1]+(b[1]-a[1])*t+1e-6,y=-x-z;
    let rx=Math.round(x),rz=Math.round(z),ry=Math.round(y);const dx=Math.abs(rx-x),dz=Math.abs(rz-z),dy=Math.abs(ry-y);
    if(dx>dy&&dx>dz)rx=-ry-rz;else if(dz>dy)rz=-rx-ry;out.push(K(rx,rz))}
  return out;
}
function canHit(s,a,t){
  const c=CARD[a.card];const pa=P(a.k),pt=P(t.k);const d=dist(pa,pt);const ha=ground(s,a.k),ht=ground(s,t.k);
  if(d===1)return Math.abs(ha-ht)<=4;
  if(c.rg<=1)return false;
  const rng=c.rg+(has(a,'eagle')&&ha>ht?1:0);if(d>rng)return false;
  const top=Math.max(ha,ht);
  for(const k of hexLine(pa,pt)){if(hasTree(s,k)&&ground(s,k)+2>Math.min(ha,ht))return false;if(ground(s,k)>top)return false}
  return true;
}
function atkLeft(s,u){const t=s.turn;return (has(u,'twin')?2:1)-(t.atk[u.id]||0)}
function targetsFor(s,u){
  const res={};if(atkLeft(s,u)<=0)return res;
  s.units.forEach(o=>{if(o.hp<=0||!o.k)return;
    if(o.o!==u.o&&canHit(s,u,o))res[o.k]='atk';
    else if(o.o===u.o&&o!==u&&has(u,'mend')&&o.hp<CARD[o.card].hp&&dist(P(u.k),P(o.k))===1)res[o.k]='mend';});
  return res;
}
function wound(s,u,n,why){
  u.hp-=n;
  if(u.hp<=0){u.hp=0;log(s,CARD[u.card].n+' ('+seatName(s,u.o)+') is destroyed'+(why?' by '+why:'')+'.');if(ui.sel===u.id)ui.sel=null}
}
function doMove(uid,dest){
  commit(s=>{
    const u=s.units.find(x=>x.id===uid);const {tree}=moveOpts(s,u);if(!tree[dest])return;
    const path=pathTo(tree,dest);const fly=has(u,'fly');
    const steps=[];for(let i=0;i<path.length-1;i++)steps.push([path[i],path[i+1]]);
    const strikers=[];
    if(!has(u,'phase')&&!has(u,'steady')){
      (fly?steps.slice(0,1):steps).forEach(([a,b])=>{
        s.units.forEach(e=>{if(e.hp>0&&e.k&&e.o!==u.o&&dist(P(e.k),P(a))===1&&dist(P(e.k),P(b))>1&&!strikers.includes(e.id))strikers.push(e.id)})
      });
    }
    const rows=[];
    for(const eid of strikers){if(u.hp<=0)break;const e=s.units.find(x=>x.id===eid);const r=roll(1);const hit=r[0]==='sk';
      rows.push({l:CARD[e.card].n+' parting strike',a:r,d:[],res:hit?'1 wound':'miss'});
      if(hit)wound(s,u,1,'a parting strike')}
    let fallDice=0;
    if(classic(s)&&!fly&&!has(u,'leap')){const H=figH(CARD[u.card]);steps.forEach(([a,b])=>{const drop=ground(s,a)-ground(s,b);if(drop>=H)fallDice+=1+Math.floor((drop-H)/5)})}
    if(u.hp>0&&fallDice){const r=roll(fallDice);const w=r.filter(x=>x==='sk').length;rows.push({l:CARD[u.card].n+' falls',a:r,d:[],res:w?w+' wound'+(w>1?'s':''):'lands safely'});
      log(s,CARD[u.card].n+' takes a big fall: '+(w?w+' wound'+(w>1?'s':''):'no damage')+'.');if(w){u.k=dest;wound(s,u,w,'a fall')}}
    if(u.hp>0){u.k=dest;log(s,CARD[u.card].n+' moves'+(strikers.length?' through '+strikers.length+' parting strike'+(strikers.length>1?'s':''):'')+'.');
      if(topT(s,dest)==='l'&&!has(u,'lava')){rows.push({l:'Lava burn',a:[],d:[],res:'1 wound'});wound(s,u,1,'lava');log(s,CARD[u.card].n+' is burned by lava.')}}
    s.turn.moved[uid]=true;
    if(rows.length)s.roll={id:Math.random(),t:CARD[u.card].n+' moves',rows};
    checkWin(s);
  });
  if(S.units.find(x=>x.id===uid&&x.hp<=0))ui.sel=null;
  renderAll();
}
function doAttack(uid,tk){
  commit(s=>{
    const u=s.units.find(x=>x.id===uid);const tg=unitAt(s,tk);if(!u||!tg)return;
    s.turn.attacking=true;s.turn.atk[u.id]=(s.turn.atk[u.id]||0)+1;
    if(tg.o===u.o){tg.hp=Math.min(CARD[tg.card].hp,tg.hp+1);log(s,CARD[u.card].n+' mends '+CARD[tg.card].n+' (+1 life).');s.roll={id:Math.random(),t:'Mend',rows:[{l:CARD[tg.card].n+' healed',a:[],d:[],res:'+1 life'}]};return}
    const melee=dist(P(u.k),P(tk))===1;
    const list=(melee&&has(u,'sweep'))?s.units.filter(o=>o.hp>0&&o.k&&o.o!==u.o&&dist(P(o.k),P(u.k))===1):[tg];
    const rows=[];const c=CARD[u.card];
    for(const t of list){
      if(u.hp<=0)break;
      const {A,D}=diceAB(s,u,u.k,t,t.k);
      const ar=roll(A),dr=roll(D);const sk=ar.filter(x=>x==='sk').length;let sh=dr.filter(x=>x==='sh').length+(has(t,'blink')?1:0);
      let w=Math.max(0,sk-sh);
      if(w&&has(u,'venom'))w++;
      let res=w?w+' wound'+(w>1?'s':'')+(has(u,'venom')?' (venom)':''):'blocked';
      log(s,c.n+' attacks '+CARD[t.card].n+': '+sk+' skull'+(sk!==1?'s':'')+' vs '+sh+' shield'+(sh!==1?'s':'')+(w?', '+w+' wound'+(w>1?'s':''):', no damage')+'.');
      if(w)wound(s,t,w,c.n);
      if(w&&has(u,'drain')&&u.hp<c.hp){u.hp++;res+=' · drain +1';log(s,c.n+' drains 1 life.')}
      if(melee&&has(t,'riposte')&&sh>sk&&t.hp>0){res+=' · riposte!';log(s,CARD[t.card].n+' ripostes for 1 wound.');wound(s,u,1,'a riposte')}
      rows.push({l:c.n+' → '+CARD[t.card].n,a:ar,d:dr,blink:has(t,'blink'),res});
    }
    s.roll={id:Math.random(),t:c.n+' attacks',rows};
    checkWin(s);
  });
  const u=S.units.find(x=>x.id===uid);if(!u||u.hp<=0||atkLeft(S,u)<=0)ui.sel=null;
  renderAll();flashRoll();
}

/* ================= BOTS ================= */
function diceAB(s,u,uk,t,tk,moved){
  const c=CARD[u.card],tc=CARD[t.card];const ha=ground(s,uk),ht=ground(s,tk);const dd=dist(P(uk),P(tk));
  const near=(x,xk,pred)=>s.units.some(o=>o.id!==x.id&&o.hp>0&&o.k&&o.o===x.o&&dist(P(o.k),P(xk))===1&&pred(o));
  const mv=moved!=null?moved:!!(s.turn&&s.turn.moved&&s.turn.moved[u.id]);
  const A=Math.max(0,c.at+(ha>ht?1:0)+(has(u,'rage')&&u.hp<c.hp?1:0)+(has(u,'charge')&&mv?1:0)
    +(near(u,uk,o=>has(o,'rally'))?1:0)+(topT(s,uk)==='x'?1:0)-(has(t,'camo')&&dd>1?1:0)-(has(t,'dread')&&dd===1?1:0));
  let adj=0;if(has(t,'bulwark'))adj=Math.min(2,s.units.filter(o=>o.id!==t.id&&o.hp>0&&o.k&&o.o===t.o&&dist(P(o.k),P(tk))===1).length);
  const t0=topT(s,tk);
  const D=Math.max(0,tc.df+(ht>ha?1:0)+adj+(near(t,tk,o=>has(o,'ward'))?1:0)+(t0==='c'?1:0)-(t0==='i'?1:0)-(has(u,'pierce')?1:0));
  return {A,D};
}
const BOT_NAMES=['Iron Warlord','The Clockwork Marshal','Grim Tactician','Lady Gambit','Old Strategos','Captain Cogsworth','The Hex Oracle','Brass Baron'];
const LEVELS=['beginner','easy','normal','hard','brutal'];
const LV_NAME={beginner:'Beginner',easy:'Easy',normal:'Normal',hard:'Hard',brutal:'Brutal'};
const LV_NOTE={beginner:'−15% points',brutal:'+25% points'};
const lvLabel=l=>LV_NAME[l]+(LV_NOTE[l]?' · '+LV_NOTE[l]:'');
function isBot(i){return !!(S&&S.bots&&S.bots[i])}
function woundValue(t){const c=CARD[t.card];return c.p/(c.f*c.hp)/30}
function expW(s,u,uk,t,tk,moved){
  const {A,D}=diceAB(s,u,uk,t,tk,moved);
  let ev=Math.max(0,A*.5-D/3);if(ev<.15&&A>0)ev+=.12*A/(D+1);
  if(has(u,'venom')&&ev>.1)ev+=.6;
  return Math.min(ev,t.hp+.5);
}
function attackScore(s,u,uk,t,moved,lvl){
  const c=CARD[t.card];
  if(lvl==='brutal'){const {A,D}=diceAB(s,u,uk,t,t.k,moved);const o=woundOdds(A,D,has(t,'blink')?1:0,has(u,'venom'),t.hp);
    let sc=o.ev*woundValue(t)+o.kill*c.p/c.f/30*.9+(t.hp<c.hp?.06:0);
    if(has(t,'riposte')&&dist(P(uk),P(t.k))===1)sc-=o.blocked*woundValue(u)*.9;
    return sc}
  const ev=expW(s,u,uk,t,t.k,moved);
  let sc=Math.min(ev,t.hp)*woundValue(t);
  if(ev>=t.hp*.85)sc+=c.p/c.f/30*.6;
  return sc;
}
const _bin={};
function binom(n,p){const key=n+'|'+p;if(_bin[key])return _bin[key];let d=[1];for(let i=0;i<n;i++){const nd=new Array(d.length+1).fill(0);for(let k=0;k<d.length;k++){nd[k]+=d[k]*(1-p);nd[k+1]+=d[k]*p}d=nd}return _bin[key]=d}
function woundOdds(A,D,blink,venom,hp){ // exact expected wounds (capped at hp) and kill chance
  const sk=binom(A,.5),sh=binom(D,1/3);let ev=0,kill=0,blocked=0;
  for(let i=0;i<sk.length;i++)for(let j=0;j<sh.length;j++){const pr=sk[i]*sh[j];let w=Math.max(0,i-j-blink);if(w&&venom)w++;ev+=pr*Math.min(w,hp);if(w>=hp)kill+=pr;if(j+blink>i)blocked+=pr}
  return {ev,kill,blocked};
}
function cardPower(c){return c.f*(c.hp*1.1+c.at*2.2+c.df*1.6+c.mv*.5+(c.rg>1?Math.min(c.rg,7)*.45:0))+c.ab.length*2.2*Math.sqrt(c.f)}
function cardDU(c){
  let dmg=Math.max(.12,c.at*.5-.85);if(c.ab.includes('twin'))dmg*=1.7;if(c.ab.includes('venom'))dmg+=.35;if(c.ab.includes('sweep'))dmg*=1.25;if(c.ab.includes('pierce'))dmg+=.3;
  dmg*=(1+(c.rg>1?Math.min(c.rg,7)*.09:0))*(1+(c.mv-5)*.06)*(c.ab.includes('fly')?1.15:1);
  let take=Math.max(.22,1.5-c.df/3);if(c.ab.includes('blink'))take=Math.max(.15,take-.3);
  let dur=c.hp/take;if(c.ab.includes('regen'))dur*=1.3;if(c.ab.includes('mend'))dur*=1.15;if(c.ab.includes('drain'))dur*=1.15;
  const extra=1+.04*c.ab.filter(a=>!['twin','venom','sweep','pierce','fly','blink','regen','mend','drain'].includes(a)).length;
  return {d:c.f*dmg*extra,u:c.f*dur};
}
function botDraftPick(s,seat,lvl){
  const t=taken(s),left=budgetFor(s,seat)-pts(s,seat);const pool=CARDS.filter(c=>!t.has(c.id)&&c.p<=left);if(!pool.length)return null;
  if(lvl==='beginner')return pool[rnd(pool.length)].id;
  if(lvl==='easy'&&Math.random()<.6)return pool[rnd(pool.length)].id;
  let D=0,U=0;for(const id of s.army[seat]||[]){const x=cardDU(CARD[id]);D+=x.d;U+=x.u}
  const sc=c=>{const x=cardDU(c);return ((D+x.d)*(U+x.u)-D*U)/c.p*(lvl==='normal'?.9+Math.random()*.2:1)};
  pool.sort((a,b)=>sc(b)-sc(a));
  return (lvl==='hard'||lvl==='brutal'?pool[0]:pool[rnd(Math.min(3,pool.length))]).id;
}
function botDeploy(s,seat){
  const zone=Object.keys(s.zones).filter(k=>s.zones[k]===seat&&!unitAt(s,k)&&!hasTree(s,k)&&topT(s,k)!=='l');
  const foes=Object.keys(s.zones).filter(k=>s.zones[k]!==seat).map(P);
  const fa=foes.length?[foes.reduce((a,p)=>a+p[0],0)/foes.length,foes.reduce((a,p)=>a+p[1],0)/foes.length]:[0,0];
  const dOf=k=>dist(P(k),fa);
  const units=s.units.filter(u=>u.o===seat&&!u.k).sort((a,b)=>CARD[a.card].rg-CARD[b.card].rg);
  for(const u of units){
    if(!zone.length)break;const c=CARD[u.card];
    const score=k=>(c.rg>2?dOf(k)*.4+ground(s,k)*.6:-dOf(k)+ground(s,k)*.3)+(topT(s,k)==='c'?.8:0)+(topT(s,k)==='x'?.6:0)-(topT(s,k)==='w'?2:0);
    zone.sort((a,b)=>score(b)-score(a));u.k=zone.shift();
  }
}
function evalSpot(s,u,dk,lvl){
  const c=CARD[u.card],hu={...u,k:dk};const moved=dk!==u.k;
  const foes=s.units.filter(e=>e.hp>0&&e.k&&e.o!==u.o);
  let best=0,second=0;
  for(const e of foes){if(!canHit(s,hu,e))continue;const a=attackScore(s,hu,dk,e,moved,lvl);if(a>best){second=best;best=a}else if(a>second)second=a}
  let sc=best+(has(u,'twin')?second*.8:0);
  if(has(u,'sweep'))sc+=foes.filter(e=>dist(P(e.k),P(dk))===1).length*.15;
  if(has(u,'mend')){const hurt=s.units.some(o=>o.o===u.o&&o.id!==u.id&&o.hp>0&&o.k&&o.hp<CARD[o.card].hp&&dist(P(o.k),P(dk))===1);if(hurt)sc=Math.max(sc,.25)}
  if(!foes.length)return sc;
  let nd=1e9;for(const e of foes)nd=Math.min(nd,dist(P(e.k),P(dk)));
  if(best===0)sc-=c.rg>2?.14*Math.max(0,nd-c.rg)+.03*Math.abs(nd-c.rg):.16*nd;
  else if(c.rg>2&&nd===1)sc-=.15;
  const tt=topT(s,dk);
  sc+=.035*ground(s,dk)+(tt==='x'?.2:0)+(tt==='c'?.18:0)-(tt==='i'?.12:0)-(tt==='w'&&!has(u,'swim')?.12:0)-(tt==='l'&&!has(u,'lava')?1.5:0);
  const wThreat=lvl==='brutal'?.28:lvl==='hard'?.2:lvl==='normal'?.14:lvl==='easy'?.05:0;
  let threat=0;for(const e of foes){const ec=CARD[e.card];if(dist(P(e.k),P(dk))<=ec.mv+Math.max(1,ec.rg)){threat+=Math.min(expW(s,e,e.k,hu,dk,false),u.hp)*woundValue(u)}}
  sc-=wThreat*Math.min(threat,1.5);
  if(moved&&!has(u,'phase')&&!has(u,'steady')){const leave=foes.filter(e=>dist(P(e.k),P(u.k))===1&&dist(P(e.k),P(dk))>1).length;sc-=leave*.5*woundValue(u)*(1/Math.max(1,u.hp))*3}
  return sc;
}
function bestSpot(s,u,lvl){
  const opts=[u.k];if(!s.turn.attacking&&!s.turn.moved[u.id])opts.push(...Object.keys(moveOpts(s,u).dest));
  const scored=opts.map(k=>({k,sc:evalSpot(s,u,k,lvl)+(k===u.k?.01:0)})).sort((a,b)=>b.sc-a.sc);
  if(lvl==='beginner')return Math.random()<.5?scored[rnd(scored.length)]:scored[rnd(Math.min(8,scored.length))];
  if(lvl==='easy')return scored[rnd(Math.min(4,scored.length))];
  if(lvl==='normal'&&scored.length>1&&Math.random()<.35)return scored[1+rnd(Math.min(2,scored.length-1))];
  return scored[0];
}
function material(s,seat){let v=0;for(const u of s.units){if(u.hp<=0||!u.k)continue;const c=CARD[u.card];const val=c.p/c.f*(.35+.65*u.hp/c.hp);v+=u.o===seat?val:-val}return v}
function danger(s,seat){ // expected damage the enemy could do to us next, by value
  let d=0;const foes=s.units.filter(e=>e.hp>0&&e.k&&e.o!==seat);
  for(const u of s.units){if(u.hp<=0||!u.k||u.o!==seat)continue;let worst=0,sum=0;
    for(const e of foes){const ec=CARD[e.card];if(dist(P(e.k),P(u.k))>ec.mv+Math.max(1,ec.rg))continue;const {A,D}=diceAB(s,e,e.k,u,u.k,false);const ev=woundOdds(A,D,has(u,'blink')?1:0,has(e,'venom'),u.hp).ev;worst=Math.max(worst,ev);sum+=ev}
    d+=Math.min(u.hp,worst+.35*(sum-worst))*CARD[u.card].p/CARD[u.card].f/CARD[u.card].hp}
  return d;
}
function simulateCard(s0,seat,cid){ // play a card on a copy with expected dice, return how much better the position is
  const s=structuredClone(s0);s.turn={...s.turn,card:cid,moved:{},atk:{},attacking:false};
  const near=u=>Math.min(...s.units.filter(e=>e.hp>0&&e.k&&e.o!==seat).map(e=>dist(P(e.k),P(u.k))),99);
  const figs=()=>s.units.filter(u=>u.card===cid&&u.o===seat&&u.hp>0&&u.k);
  for(const u of figs().sort((a,b)=>near(a)-near(b))){const b=bestSpot(s,u,'brutal');if(b&&b.k!==u.k){u.k=b.k;s.turn.moved[u.id]=true}}
  for(let guard=0;guard<12;guard++){let best=null;
    for(const u of figs()){if(atkLeft(s,u)<=0)continue;const tg=targetsFor(s,u);for(const k in tg){if(tg[k]!=='atk')continue;const t=unitAt(s,k);const sc=attackScore(s,u,u.k,t,s.turn.moved[u.id],'brutal');if(!best||sc>best.sc)best={u,t,sc}}}
    if(!best)break;const {u,t}=best;const {A,D}=diceAB(s,u,u.k,t,t.k);const o=woundOdds(A,D,has(t,'blink')?1:0,has(u,'venom'),t.hp);
    s.turn.attacking=true;s.turn.atk[u.id]=(s.turn.atk[u.id]||0)+1;t.hp-=o.ev;if(o.kill>.5||t.hp<.4)t.hp=0}
  return material(s,seat)-material(s0,seat)-(danger(s,seat)-danger(s0,seat))*.55;
}
function botOrders(s,seat,lvl){
  const cards=cardsAlive(s,seat);if(!cards.length)return null;
  const pick=()=>cards[rnd(cards.length)];
  if(lvl==='beginner'||lvl==='easy')return {1:pick(),2:pick(),3:pick(),X:pick()};
  const val=cards.map(cid=>{let v=0;
    if(lvl==='brutal')v=simulateCard(s,seat,cid);else for(const u of s.units.filter(x=>x.card===cid&&x.o===seat&&x.hp>0&&x.k))v+=bestSpot(s,u,'hard').sc;
    return {cid,v:v*(lvl==='normal'?.7+Math.random()*.6:1)}}).sort((a,b)=>b.v-a.v);
  const a=val[0].cid,b=(val[1]||val[0]).cid,c=(val[2]||val[1]||val[0]).cid;
  const strong=val.length<2||val[0].v>1.6*Math.max(.01,val[1].v);
  return {1:a,2:strong?a:b,3:strong?b:(lvl==='normal'?a:c),X:pick()};
}
function botPickCard(s,seat,lvl){
  if(lvl==='brutal'){const cards=[...new Set(s.units.filter(u=>u.o===seat&&u.hp>0&&u.k).map(u=>u.card))];if(!cards.length)return null;
    let best=null,bv=-1e9;for(const cid of cards){const v=simulateCard(s,seat,cid);if(v>bv){bv=v;best=cid}}return best}
  const cards=[...new Set(s.units.filter(u=>u.o===seat&&u.hp>0&&u.k).map(u=>u.card))];if(!cards.length)return null;
  if(lvl==='beginner'||(lvl==='easy'&&Math.random()<.5))return cards[rnd(cards.length)];
  const val=cards.map(cid=>{let v=0;for(const u of s.units.filter(x=>x.card===cid&&x.o===seat&&x.hp>0&&x.k))v+=bestSpot(s,u,lvl==='brutal'?'brutal':'hard').sc;return {cid,v:v*(lvl==='normal'?.7+Math.random()*.6:1)}});
  val.sort((a,b)=>b.v-a.v);return val[0].cid;
}
const botDelay=()=>({slow:1100,normal:520,fast:140})[ui.botSpeed||'normal'];
async function botWait(m){let t=botDelay()*(m||1);while(t>0||ui.botPaused){await new Promise(r=>setTimeout(r,ui.botPaused?200:Math.min(t,200)));if(!ui.botPaused)t-=200;if(!S)return}}
async function botTurn(seat){
  const lvl=S.bots[seat];const code=S.code;const alive=()=>S&&S.code===code&&S.phase==='battle'&&S.turn.seat===seat;
  const cid=classic(S)?S.turn.card:botPickCard(S,seat,lvl);
  if(!cid){commit(s=>{log(s,seatName(s,seat)+' passes.');endTurn(s)});return}
  if(!classic(S))commit(s=>{s.turn.card=cid});await botWait(.8);
  const figs=()=>S.units.filter(u=>u.card===cid&&u.o===seat&&u.hp>0&&u.k);
  const nearFoe=u=>Math.min(...S.units.filter(e=>e.hp>0&&e.k&&e.o!==seat).map(e=>dist(P(e.k),P(u.k))),99);
  for(const u0 of figs().sort((a,b)=>nearFoe(a)-nearFoe(b))){
    if(!alive())return;const u=S.units.find(x=>x.id===u0.id);if(!u||u.hp<=0)continue;
    const b=bestSpot(S,u,lvl);
    if(b&&b.k!==u.k){ui.sel=u.id;draw();await botWait(.5);if(!alive())return;doMove(u.id,b.k);await botWait()}
  }
  if(lvl==='brutal'){
    for(let guard=0;guard<12;guard++){
      if(!alive())return;let best=null;
      for(const u of figs()){if(atkLeft(S,u)<=0)continue;const tg=targetsFor(S,u);
        for(const k in tg){const t=unitAt(S,k);if(!t)continue;const sc=tg[k]==='mend'?(t.hp<CARD[t.card].hp?.3+woundValue(t):0):attackScore(S,u,u.k,t,undefined,'brutal');if(sc>0&&(!best||sc>best.sc))best={u,k,sc}}}
      if(!best)break;ui.sel=best.u.id;draw();await botWait(.5);if(!alive())return;doAttack(best.u.id,best.k);await botWait(1.4);
    }
  }else
  for(const u0 of figs()){
    for(let n=0;n<2;n++){
      if(!alive())return;const u=S.units.find(x=>x.id===u0.id);if(!u||u.hp<=0||atkLeft(S,u)<=0)break;
      const tg=targetsFor(S,u);let bestK=null,bv=0;
      for(const k in tg){const t=unitAt(S,k);if(!t)continue;
        const v=tg[k]==='mend'?(t.hp<CARD[t.card].hp?.3+woundValue(t):0):lvl==='beginner'?Math.random():attackScore(S,u,u.k,t,undefined,lvl)+(lvl==='easy'?Math.random()*.3:0);
        if(v>bv){bv=v;bestK=k}}
      if(!bestK)break;ui.sel=u.id;draw();await botWait(.5);if(!alive())return;
      doAttack(u.id,bestK);await botWait(1.4);
    }
  }
  if(!alive())return;ui.sel=null;
  commit(s=>{log(s,seatName(s,seat)+' ends the turn of '+CARD[cid].n+'.');endTurn(s)});
}
let botBusy=false,botTimer=null;
function botActor(){
  if(!S||!LOCAL||!S.bots)return null;
  const all=S.seats.every((_,i)=>isBot(i));
  if(S.phase==='lobby'||S.phase==='map')return all?'auto':null;
  if(S.phase==='draft'){const x=draftSeat(S);return isBot(x)?x:null}
  if(S.phase==='deploy'){const x=S.deploy.seat;return isBot(x)?x:null}
  if(S.phase==='battle'){if(classic(S)&&S.turn.stage==='orders'){const b=needOrders(S).find(i=>isBot(i));return b===undefined?null:b}const x=S.turn.seat;return isBot(x)?x:null}
  return null;
}
function botTick(){
  if(botBusy||botTimer||ui.botPaused)return;const a=botActor();if(a===null)return;
  botTimer=setTimeout(async()=>{botTimer=null;if(botActor()!==a)return botTick();botBusy=true;
    try{await botAct(a)}catch(e){console.error(e)}botBusy=false;botTick()},S.phase==='draft'?botDelay()*.6:botDelay());
}
async function botAct(a){
  syncR();
  if(a==='auto'){const L=['hills','lava','islands','frozen','swamp','castle','flat'];commit(s=>{s.map=genMap(L[rnd(L.length)]);autoZones(s);log(s,'The bots roll out a random battlefield.');startDraft(s)});return}
  if(S.phase==='draft'){const id=botDraftPick(S,a,S.bots[a]);if(id)draftPick(id);else draftPass();return}
  if(S.phase==='deploy'){commit(s=>{botDeploy(s,a);autoDeploy(s,a);log(s,seatName(s,a)+' is deployed.');nextDeploy(s)});return}
  if(S.phase==='battle'&&classic(S)&&S.turn.stage==='orders'){const o=botOrders(S,a,S.bots[a]);commit(s=>submitOrders(s,a,o));return}
  if(S.phase==='battle')await botTurn(a);
}

/* ================= RENDERING: BOARD (3D) ================= */
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
let W=0,H=0,DPR=1,hitList=[],anim=null;
const cam={yaw:-18,pitch:48,tYaw:-18,tPitch:48};
const LIGHT=(()=>{const v=[-0.55,-0.7,0.9];const l=Math.hypot(...v);return v.map(x=>x/l)})();
const LHU=0.46, SQ3=Math.sqrt(3);
const VA=[0,1,2,3,4,5].map(k=>(-90+60*k)*Math.PI/180);
const NB=[[1,-1],[1,0],[0,1],[-1,1],[-1,0],[0,-1]]; // neighbour across side k (between vertex k and k+1)
const NA=[0,1,2,3,4,5].map(k=>(-60+60*k)*Math.PI/180);
function resize(){const r=cv.getBoundingClientRect();DPR=window.devicePixelRatio||1;W=r.width;H=r.height;cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);draw()}
new ResizeObserver(resize).observe(cv);
function geo(){
  const fit=Math.min(W/((2*R+1)*1.8),H/((2*R+1)*1.15+4))*0.98;const sz=Math.max(6,fit*ui.zoom);
  const y=cam.yaw*Math.PI/180,p=cam.pitch*Math.PI/180;
  return {sz,cyw:Math.cos(y),syw:Math.sin(y),sp:Math.sin(p),cp:Math.cos(p),cx:W/2+ui.pan.x,cy:H/2+ui.pan.y+sz*2};
}
function pt(g,wx,wy,z){const xr=wx*g.cyw-wy*g.syw,yr=wx*g.syw+wy*g.cyw;return [g.cx+xr*g.sz,g.cy+(yr*g.sp-z*g.cp)*g.sz,yr]}
function hexW(q,r){return [SQ3*(q+r/2),1.5*r]}
function ring(g,wx,wy,z,s){return VA.map(a=>pt(g,wx+Math.cos(a)*(s||1),wy+Math.sin(a)*(s||1),z))}
function poly(pts){ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath()}
function rgb(c){if(c[0]!=='#'){const m=c.match(/[\d.]+/g);return [+m[0],+m[1],+m[2]]}const n=parseInt(c.slice(1),16);return [n>>16,(n>>8)&255,n&255]}
function shade(hex,f,a){const [r,g,b]=rgb(hex);const c=x=>Math.max(0,Math.min(255,Math.round(x*f)));return a==null?`rgb(${c(r)},${c(g)},${c(b)})`:`rgba(${c(r)},${c(g)},${c(b)},${a})`}
function hash(q,r,i){let h=(q*374761393+r*668265263+(i||0)*2147483647)|0;h=(h^(h>>>13))*1274126177|0;return ((h^(h>>>16))>>>0)/4294967296}
function hull(P){P=P.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);const lo=[],up=[];
  for(const p of P){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p)}
  for(let i=P.length-1;i>=0;i--){const p=P[i];while(up.length>=2&&cr(up[up.length-2],up[up.length-1],p)<=0)up.pop();up.push(p)}
  up.pop();lo.pop();return lo.concat(up)}
function curMap(){return S?S.map:ui.preview}

function drawTopDetail(t,top,c,g,q,r,zTop){
  const s=g.sz;if(s<9)return;
  const [cx,cy]=pt(g,c.wx,c.wy,zTop);
  ctx.save();poly(top);ctx.clip();
  const rnd=i=>hash(q,r,i);
  const at=(i,rad)=>{const a=rnd(i)*6.283,d=Math.sqrt(rnd(i+50))*(rad||.75);return pt(g,c.wx+Math.cos(a)*d,c.wy+Math.sin(a)*d,zTop)};
  if(t==='g'){ctx.strokeStyle='rgba(40,70,20,.55)';ctx.lineWidth=Math.max(1,s*.05);
    for(let i=0;i<7;i++){const [x,y]=at(i);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-s*.05,y-s*.13);ctx.moveTo(x,y);ctx.lineTo(x+s*.05,y-s*.12);ctx.stroke()}
    ctx.fillStyle='rgba(255,255,255,.07)';for(let i=7;i<10;i++){const [x,y]=at(i);ctx.beginPath();ctx.arc(x,y,s*.12,0,7);ctx.fill()}}
  else if(t==='r'||t==='c'){ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=Math.max(1,s*.035);
    if(t==='c'){for(let row=-2;row<=2;row++){const a=pt(g,c.wx-1,c.wy+row*.38,zTop),b=pt(g,c.wx+1,c.wy+row*.38,zTop);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();
      for(let col=-3;col<=3;col++){const ox=col*.42+(row%2?.21:0);const u=pt(g,c.wx+ox,c.wy+row*.38,zTop),v=pt(g,c.wx+ox,c.wy+row*.38+.38,zTop);ctx.beginPath();ctx.moveTo(u[0],u[1]);ctx.lineTo(v[0],v[1]);ctx.stroke()}}}
    else for(let i=0;i<3;i++){const [x,y]=at(i,.6);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(rnd(i+9)-.5)*s*.5,y+(rnd(i+19)-.5)*s*.3);ctx.lineTo(x+(rnd(i+29)-.5)*s*.6,y+(rnd(i+39)-.5)*s*.35);ctx.stroke()}}
  else if(t==='s'||t==='d'||t==='p'){
    if(t==='p'){const a=pt(g,c.wx,c.wy,zTop);ctx.fillStyle='rgba(255,240,210,.18)';ctx.beginPath();ctx.ellipse(a[0],a[1],s*.62,s*.62*g.sp,0,0,7);ctx.fill()}
    ctx.fillStyle=t==='s'?'rgba(120,90,40,.35)':'rgba(40,25,10,.3)';for(let i=0;i<(t==='p'?9:6);i++){const [x,y]=at(i);ctx.beginPath();ctx.ellipse(x,y,s*(t==='p'?.09:.04),s*(t==='p'?.06:.03),0,0,7);ctx.fill()}}
  else if(t==='n'){ctx.fillStyle='rgba(255,255,255,.9)';for(let i=0;i<6;i++){const [x,y]=at(i);ctx.beginPath();ctx.arc(x,y,s*.03,0,7);ctx.fill()}
    ctx.fillStyle='rgba(150,180,210,.18)';for(let i=6;i<9;i++){const [x,y]=at(i);ctx.beginPath();ctx.ellipse(x,y,s*.22,s*.1,0,0,7);ctx.fill()}}
  else if(t==='i'){ctx.strokeStyle='rgba(255,255,255,.75)';ctx.lineWidth=Math.max(1,s*.05);for(let i=0;i<2;i++){const [x,y]=at(i,.5);ctx.beginPath();ctx.moveTo(x-s*.3,y+s*.08);ctx.lineTo(x+s*.25,y-s*.1);ctx.stroke()}
    ctx.strokeStyle='rgba(60,120,160,.35)';ctx.lineWidth=1;const [x,y]=at(5,.4);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+s*.4,y+s*.2);ctx.lineTo(x+s*.5,y-s*.1);ctx.stroke()}
  else if(t==='m'){ctx.fillStyle='rgba(30,45,25,.7)';for(let i=0;i<3;i++){const [x,y]=at(i,.5);ctx.beginPath();ctx.ellipse(x,y,s*.25,s*.12,0,0,7);ctx.fill()}
    ctx.strokeStyle='rgba(120,140,60,.85)';ctx.lineWidth=Math.max(1,s*.04);for(let i=3;i<8;i++){const [x,y]=at(i);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+s*.03,y-s*.28);ctx.stroke()}}
  else if(t==='w'||t==='l'){
    if(t==='l'){const gr=ctx.createRadialGradient(cx,cy,0,cx,cy,s);gr.addColorStop(0,'rgba(255,230,120,.75)');gr.addColorStop(1,'rgba(255,120,20,0)');ctx.fillStyle=gr;ctx.fillRect(cx-s,cy-s,s*2,s*2);
      ctx.strokeStyle='rgba(60,15,5,.55)';ctx.lineWidth=Math.max(1,s*.06);for(let i=0;i<3;i++){const [x,y]=at(i,.6);ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+s*.2,y-s*.15,x+s*.4,y+s*.05);ctx.stroke()}}
    else{ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=Math.max(1,s*.04);for(let i=-1;i<=1;i++){const a=pt(g,c.wx-.55,c.wy+i*.4,zTop),b=pt(g,c.wx+.55,c.wy+i*.4,zTop);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.quadraticCurveTo((a[0]+b[0])/2,(a[1]+b[1])/2-s*.1,b[0],b[1]);ctx.stroke()}
      const gr=ctx.createLinearGradient(cx-s,cy-s*.6,cx+s,cy+s*.6);gr.addColorStop(0,'rgba(255,255,255,.22)');gr.addColorStop(.5,'rgba(255,255,255,0)');ctx.fillStyle=gr;ctx.fillRect(cx-s,cy-s,s*2,s*2)}}
  ctx.restore();
}
function drawCrystals(g,c,zTop,q,r){
  const s=g.sz;const sets=[[0,0,.95,.22],[-.32,.18,.6,.16],[.3,.2,.7,.17]];
  ctx.save();ctx.shadowColor='rgba(170,120,255,.85)';ctx.shadowBlur=s*.5;
  for(const [dx,dy,hh,ww] of sets){const b=pt(g,c.wx+dx,c.wy+dy,zTop);const tip=[b[0],b[1]-hh*s*Math.max(.45,g.cp)*1.3];
    const L=[b[0]-ww*s,b[1]],Rr=[b[0]+ww*s,b[1]],M=[b[0],b[1]+ww*s*.5*g.sp];
    ctx.beginPath();ctx.moveTo(L[0],L[1]);ctx.lineTo(tip[0],tip[1]);ctx.lineTo(M[0],M[1]);ctx.closePath();ctx.fillStyle='#b9a2ff';ctx.fill();
    ctx.beginPath();ctx.moveTo(M[0],M[1]);ctx.lineTo(tip[0],tip[1]);ctx.lineTo(Rr[0],Rr[1]);ctx.closePath();ctx.fillStyle='#7a5bd6';ctx.fill();
    ctx.shadowBlur=0}
  ctx.restore();
}
function drawTree(g,c,zTop,q,r){
  const s=g.sz;const b=pt(g,c.wx,c.wy,zTop);const vh=Math.max(.45,g.cp);
  const sh=pt(g,c.wx-LIGHT[0]*.5,c.wy-LIGHT[1]*.5,zTop);
  ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(sh[0],sh[1],s*.55,s*.55*g.sp,0,0,7);ctx.fill();
  ctx.fillStyle='#4a3220';ctx.fillRect(b[0]-s*.07,b[1]-s*.8*vh,s*.14,s*.8*vh);
  const blobs=[[0,-1.25,.5],[-.3,-.92,.38],[.3,-.95,.4],[0,-.72,.42]];
  const snow=topT({map:curMap()},K(q,r))==='n';
  for(const [dx,dy,rr] of blobs){const x=b[0]+dx*s,y=b[1]+dy*s*vh;const gr=ctx.createRadialGradient(x-rr*s*.35,y-rr*s*.4,rr*s*.1,x,y,rr*s);
    gr.addColorStop(0,snow?'#e9f2f5':'#5f9a48');gr.addColorStop(1,snow?'#7f98a0':'#1f3f1a');ctx.fillStyle=gr;ctx.beginPath();ctx.arc(x,y,rr*s,0,7);ctx.fill()}
}
/* ================= MINIATURES ================= */
const BODY={};
(`knight:halvane,pikes,valka,aldric,sergrave,moonguard,brennan
caster:vexa,ansel,oru,maelis,yselde,abbot,thessaly,hexers,icecaller,bogcrone,ankhet,morvane,orionne,vesna,nereids,quillon
warrior:ragnhild,thralls,duelist,frostjarl,croaklings,ghouls,molly,bilgewater,kaito,stonepath,redcaps,iris,ashfang
archer:archers,scouts,longbows,ossuary,ironbolt
gunner:liora,orrin,tinkers,thistle,coggs,powder,fitch
brute:drogmar,brakka,troll,yeti,magmaborn,brontes
beast:lurkers,stalkers,hounds,snowstalkers,greymane,ursa,silkweave,ironhide,ashi
wbeast:talon
rider:kael,mirage,lionsguard
flyer:kestra,seraphine,caelestine,titanelle,cliffhawk
dragon:drake,ryuun,pyrrhia
construct:sentinel,aurelion,golem,stoneguard,gravlok
swarm:imps,bats,scarabs,wasps,thistledown
treant:mossback,weeping,barkwarden
ghost:nyx,isolde,zephra,null
serpent:gorgut,sandmaw
kraken:deepmaw
chest:mimic`).split('\n').forEach(l=>{const [b,ids]=l.split(':');ids.split(',').forEach(id=>BODY[id]=b)});
const BIG={brute:1.25,construct:1.2,treant:1.25,dragon:1.3,kraken:1.2,serpent:1.15,wbeast:1.1,rider:1.1};
const UNDEAD=new Set(['thralls','ghouls','ossuary','sergrave','morvane','abbot','ossric','rattlebone','horde','boneriders','neferkhat','malachar']);
const SKINS=['#e8c4a0','#c99a73','#8d5e3c','#f0d2b6','#6b4a32','#b9805a'];
function idHash(id){let h=7;for(const ch of id)h=(h*31+ch.charCodeAt(0))|0;return Math.abs(h)}

let LIT=-1; // which local side faces the light (-1 left, +1 right)
function gX(c,x0,x1){const g=ctx.createLinearGradient(x0,0,x1,0);const a=shade(c,1.4),b=shade(c,.58);g.addColorStop(0,LIT<0?a:b);g.addColorStop(1,LIT<0?b:a);return g}
function ball(x,y,r,c,glow){ctx.save();if(glow){ctx.shadowColor=glow;ctx.shadowBlur=r*2.2}const g=ctx.createRadialGradient(x+LIT*r*.4,y-r*.45,r*.1,x,y,r);g.addColorStop(0,shade(c,1.7));g.addColorStop(.55,c);g.addColorStop(1,shade(c,.42));ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();ctx.restore()}
function seg(x1,y1,x2,y2){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
function limb(x1,y1,x2,y2,w,c){ctx.lineCap='round';ctx.strokeStyle=shade(c,.7);ctx.lineWidth=w;seg(x1,y1,x2,y2);ctx.strokeStyle=shade(c,1.3);ctx.lineWidth=w*.38;seg(x1+LIT*w*.2,y1,x2+LIT*w*.2,y2)}
function shp(pts,c,x0,x1,alpha){ctx.save();if(alpha!=null)ctx.globalAlpha=alpha;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=gX(c,x0,x1);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=.8;ctx.stroke();ctx.restore()}
function curve(pts,w,c){ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length-1;i++){const mx=(pts[i][0]+pts[i+1][0])/2,my=(pts[i][1]+pts[i+1][1])/2;ctx.quadraticCurveTo(pts[i][0],pts[i][1],mx,my)}const L=pts[pts.length-1];ctx.lineTo(L[0],L[1]);ctx.stroke()}
const METAL='#a7b0ba',WOOD='#7a5230',DARK='#2b2b30';

function weapon(kind,hx,hy,c,glow){
  if(kind==='sword'){ctx.strokeStyle=METAL;ctx.lineWidth=2.6;ctx.lineCap='butt';seg(hx,hy,hx+7,hy-27);ctx.strokeStyle='#fff8';ctx.lineWidth=.8;seg(hx+.6,hy-1,hx+7.4,hy-26);ctx.strokeStyle='#c9a24a';ctx.lineWidth=2;seg(hx-3.5,hy-.5,hx+3.8,hy+1.2)}
  else if(kind==='axe'){limb(hx,hy+4,hx+4,hy-24,2.4,WOOD);shp([[hx+3,hy-26],[hx+12,hy-30],[hx+13,hy-18],[hx+4,hy-17]],METAL,hx+3,hx+13)}
  else if(kind==='spear'){limb(hx-3,hy+18,hx+6,hy-34,2,WOOD);shp([[hx+4,hy-34],[hx+8,hy-34],[hx+7,hy-44]],METAL,hx+4,hx+8)}
  else if(kind==='staff'){limb(hx,hy+34,hx+1,hy-26,2.2,WOOD);ball(hx+1,hy-30,4.2,glow||c,glow||c)}
  else if(kind==='bow'){ctx.strokeStyle=WOOD;ctx.lineWidth=2.2;ctx.beginPath();ctx.arc(hx-2,hy,15,-1.2,1.2);ctx.stroke();ctx.strokeStyle='#ddd';ctx.lineWidth=.7;seg(hx-2+15*Math.cos(-1.2),hy+15*Math.sin(-1.2),hx-2+15*Math.cos(1.2),hy+15*Math.sin(1.2))}
  else if(kind==='gun'){ctx.lineCap='round';ctx.strokeStyle=WOOD;ctx.lineWidth=4;seg(hx-10,hy+3,hx,hy);ctx.strokeStyle=DARK;ctx.lineWidth=2.4;seg(hx,hy,hx+19,hy-5);ctx.strokeStyle=METAL;ctx.lineWidth=.8;seg(hx+2,hy-1,hx+18,hy-5.4)}
  else if(kind==='club'){limb(hx,hy+3,hx+7,hy-22,6,WOOD);ball(hx+7,hy-23,4.5,WOOD)}
}
function humanoid(o){
  const b=o.bulk||1,c=o.c,y0=o.lift||0;
  ctx.save();ctx.translate(0,-y0);
  if(o.wings){ctx.save();ctx.globalAlpha=.95;const wc=o.wingC||shade(c,1.5);
    shp([[-2,-46],[-24,-72],[-30,-52],[-22,-40],[-26,-30],[-6,-34]],wc,-30,-2);shp([[2,-46],[22,-74],[29,-55],[21,-42],[25,-32],[6,-34]],shade(wc,.85),2,29);ctx.restore()}
  if(o.cape)shp([[-8*b,-45],[8*b,-45],[12*b,-3],[-13*b,-3]],o.seat,-13*b,12*b);
  if(o.robe)shp([[-7*b,-40],[7*b,-40],[13*b,-1],[-13*b,-1]],o.robeC||c,-13*b,13*b);
  else if(!o.wisp){limb(-4.5*b,-28,-6*b,-2,6.2*b,o.legC||shade(c,.7));limb(4.5*b,-28,6.5*b,-2,6.2*b,o.legC||shade(c,.7));
    ctx.fillStyle=DARK;ctx.beginPath();ctx.ellipse(-6*b,-1.5,4*b,2,0,0,7);ctx.ellipse(6.8*b,-1.5,4*b,2,0,0,7);ctx.fill()}
  if(o.wisp){ctx.save();ctx.globalAlpha=.82;shp([[-9,-44],[9,-44],[11,-20],[6,-8],[8,0],[0,-6],[-6,2],[-8,-10],[-12,-22]],c,-12,11);ctx.restore()}
  // back arm (+ shield)
  limb(-8*b,-43,-12*b,-30,5*b,o.armC||c);ball(-12*b,-29,2.6*b,o.skin);
  if(o.weapon2)weapon(o.weapon2,-12*b,-29,c,o.glow);
  // torso
  shp([[-9*b,-47],[9*b,-47],[7*b,-27],[-7*b,-27]],o.torsoC||c,-9*b,9*b);
  if(o.armor){ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=.9;seg(-6*b,-40,6*b,-40);seg(-6*b,-34,6*b,-34)}
  ctx.fillStyle=o.seat;ctx.fillRect(-7*b,-30,14*b,2.6); // belt / sash in team colour
  if(o.shield){ctx.save();ctx.translate(-12*b,-35);ctx.beginPath();ctx.moveTo(-7,-9);ctx.lineTo(7,-9);ctx.lineTo(7,2);ctx.quadraticCurveTo(0,12,-7,2);ctx.closePath();ctx.fillStyle=gX(c,-7,7);ctx.fill();ctx.lineWidth=1.8;ctx.strokeStyle=o.seat;ctx.stroke();ball(0,-2,2.2,METAL);ctx.restore()}
  // head
  const hy=-53-(b-1)*2,hr=(o.headR||6.2)*(b>1.2?.85:1);
  if(o.hood){shp([[-hr-2,hy+4],[0,hy-hr-5],[hr+2,hy+4],[hr+1,hy+7],[-hr-1,hy+7]],shade(o.robeC||c,.8),-hr-2,hr+2)}
  ball(0,hy,hr,o.skin);
  if(o.eyes){ctx.fillStyle=o.eyes;ctx.save();ctx.shadowColor=o.eyes;ctx.shadowBlur=4;ctx.fillRect(1,hy-1.5,2.2,1.6);ctx.fillRect(4.2,hy-1.5,2,1.6);ctx.restore()}
  if(o.helm){ctx.save();ctx.beginPath();ctx.arc(0,hy,hr+.8,Math.PI,0);ctx.lineTo(hr+.8,hy+1.5);ctx.lineTo(-hr-.8,hy+1.5);ctx.closePath();ctx.fillStyle=gX(METAL,-hr,hr);ctx.fill();ctx.fillStyle=DARK;ctx.fillRect(1,hy-.4,hr,1.4);
    ctx.fillStyle=o.seat;ctx.beginPath();ctx.ellipse(-1,hy-hr-2.5,2.2,4.5,-.3,0,7);ctx.fill();ctx.restore()}
  if(o.horns){ctx.strokeStyle='#e8dcc0';ctx.lineWidth=1.8;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-4,hy-4);ctx.quadraticCurveTo(-9,hy-9,-6,hy-13);ctx.moveTo(4,hy-4);ctx.quadraticCurveTo(9,hy-9,6,hy-13);ctx.stroke()}
  if(o.crown){ctx.fillStyle='#e0b54a';ctx.beginPath();ctx.moveTo(-5,hy-4.5);ctx.lineTo(-5,hy-9);ctx.lineTo(-2.5,hy-6.5);ctx.lineTo(0,hy-10);ctx.lineTo(2.5,hy-6.5);ctx.lineTo(5,hy-9);ctx.lineTo(5,hy-4.5);ctx.closePath();ctx.fill()}
  // front arm + weapon
  const hx=15*b,hyA=-39;
  limb(8*b,-43,hx-1,hyA,5*b,o.armC||c);ball(hx,hyA,2.7*b,o.skin);
  if(o.weapon)weapon(o.weapon,hx,hyA,c,o.glow);
  ctx.restore();
}
function quad(o){ // four-legged beast facing +x
  const c=o.c,s=o.size||1;ctx.save();ctx.scale(s,s);
  if(o.wings){shp([[-4,-28],[-22,-56],[-26,-36],[-10,-24]],shade(c,1.45),-26,-4);}
  limb(-17,-23,-27,-35+(o.tailUp?-6:6),3.4,c);
  for(const [x,d] of [[-11,.85],[11,.85]])limb(x,-16,x-2,-1,4.6,shade(c,d*.8));
  ctx.save();ctx.beginPath();ctx.ellipse(0,-21,18,9.5,0,0,7);ctx.fillStyle=gX(c,-18,18);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=.8;ctx.stroke();ctx.restore();
  ctx.fillStyle=o.seat;ctx.fillRect(-3,-30,5,18);
  for(const x of [-7,14])limb(x,-15,x+1,-1,5,shade(c,.95));
  limb(13,-25,19,-33,7,c);ball(21,-35,7.2,c);
  ctx.beginPath();ctx.ellipse(27,-33,5,3.4,0,0,7);ctx.fillStyle=shade(c,1.15);ctx.fill();ctx.fillStyle=DARK;ctx.beginPath();ctx.arc(31,-33.5,1,0,7);ctx.fill();
  ctx.fillStyle=o.eyes||'#111';ctx.fillRect(22.5,-38,2,1.8);
  if(o.horn){ctx.fillStyle='#e8dcc0';ctx.beginPath();ctx.moveTo(28,-36);ctx.lineTo(31,-46);ctx.lineTo(25,-37);ctx.fill()}
  else{shp([[16,-40],[18,-48],[21,-41]],shade(c,.8),16,21);shp([[20,-41],[23,-48],[25,-40]],shade(c,.8),20,25)}
  if(o.wings){shp([[0,-28],[14,-60],[20,-40],[8,-25]],shade(c,1.3),0,20)}
  ctx.restore();
}
function drawMini(u,card,seatC,face,vh){
  const body=BODY[card.id]||card.b||'warrior',c=card.c,h=idHash(card.id);
  const skin=UNDEAD.has(card.id)?'#ddd6c2':SKINS[h%SKINS.length];
  const bright=shade(c,1.25);
  const wpnFor=()=>card.ab.includes('twin')?'sword':['sword','axe','spear'][h%3];
  switch(body){
    case 'knight':humanoid({c:shade(c,1.1),seat:seatC,skin,armor:1,helm:1,cape:1,shield:1,weapon:card.id==='pikes'||card.id==='moonguard'?'spear':'sword',torsoC:shade(METAL,.95),armC:shade(METAL,.9),legC:shade(METAL,.75)});break;
    case 'warrior':humanoid({c:bright,seat:seatC,skin,helm:h%2,weapon:card.id==='frostjarl'?'axe':wpnFor(),weapon2:card.ab.includes('twin')?'sword':null,crown:card.id==='frostjarl'||card.id==='molly',horns:card.id==='ragnhild'||card.id==='redcaps'});break;
    case 'caster':humanoid({c:bright,robeC:c,seat:seatC,skin,robe:1,hood:h%3!==0,weapon:'staff',glow:shade(c,2.2)});break;
    case 'archer':humanoid({c:bright,seat:seatC,skin,hood:1,weapon:'bow'});break;
    case 'gunner':humanoid({c:bright,seat:seatC,skin,helm:card.id==='powder',weapon:'gun'});break;
    case 'brute':humanoid({c:bright,seat:seatC,skin:card.id==='drogmar'||card.id==='magmaborn'?'#9a3a18':card.id==='yeti'?'#e6ecf0':card.id==='troll'?'#6f8a5a':shade(c,1.4),bulk:1.45,headR:5.2,weapon:'club',horns:card.id==='drogmar'||card.id==='brakka'});break;
    case 'flyer':humanoid({c:bright,seat:seatC,skin,lift:12,wings:1,wingC:card.id==='titanelle'?'#c9a2ff':'#f2ead6',weapon:card.rg>2?'bow':'sword',helm:card.id==='caelestine'});break;
    case 'ghost':humanoid({c:shade(c,1.6),robeC:c,seat:seatC,skin:shade(c,1.9),lift:10,wisp:1,hood:1,eyes:'#9ff',weapon:card.id==='nyx'?'sword':null});break;
    case 'beast':quad({c:bright,seat:seatC,size:card.id==='ursa'||card.id==='ironhide'?1.2:1,horn:card.id==='ironhide',eyes:card.id==='hounds'?'#ff8a00':null});break;
    case 'wbeast':quad({c:bright,seat:seatC,wings:1,size:1.05});break;
    case 'rider':quad({c:shade(c,1.4),seat:seatC,size:1.05});ctx.save();ctx.translate(-2,-14);humanoid({c:bright,seat:seatC,skin,helm:1,weapon:'spear',legC:shade(c,.6)});ctx.restore();break;
    case 'dragon':{ctx.save();ctx.translate(0,-10);
      shp([[-4,-40],[-30,-78],[-34,-52],[-24,-44],[-26,-34],[-8,-30]],shade(c,1.5),-34,-4);
      const pts=[[-24,-14],[-16,-20],[-8,-22],[0,-28],[6,-36],[12,-44]];pts.forEach((p,i)=>ball(p[0],p[1],4+i*.9,shade(c,1.1)));
      ball(18,-50,7.5,shade(c,1.15));ctx.fillStyle='#ff6';ctx.fillRect(20,-53,2.4,2);ctx.fillStyle=shade(c,.8);ctx.beginPath();ctx.moveTo(22,-47);ctx.lineTo(31,-46);ctx.lineTo(23,-43);ctx.fill();
      ctx.strokeStyle='#e8dcc0';ctx.lineWidth=1.8;seg(14,-55,9,-63);seg(18,-56,16,-65);
      shp([[2,-40],[20,-80],[30,-58],[22,-50],[24,-40],[10,-32]],shade(c,1.3),2,30);
      ctx.fillStyle=seatC;ctx.fillRect(-2,-30,4,8);ctx.restore();break}
    case 'construct':{const b=1;shp([[-11,-30],[-3,-30],[-4,0],[-12,0]],shade(METAL,.75),-12,-3);shp([[3,-30],[11,-30],[12,0],[4,0]],shade(METAL,.75),3,12);
      shp([[-15,-58],[15,-58],[13,-28],[-13,-28]],shade(c,1.2),-15,15);ctx.fillStyle=shade(c,1.6);ctx.fillRect(-15,-60,30,3);
      ctx.fillStyle=seatC;ctx.fillRect(-13,-33,26,3);ball(0,-45,4,shade(c,2),shade(c,2.4));
      limb(-16,-54,-20,-30,7,shade(METAL,.85));limb(16,-54,21,-32,7,shade(METAL,.85));
      shp([[-7,-71],[7,-71],[7,-60],[-7,-60]],shade(c,1.1),-7,7);ctx.save();ctx.fillStyle='#7ff';ctx.shadowColor='#7ff';ctx.shadowBlur=5;ctx.fillRect(-1,-67,7,2.2);ctx.restore();break}
    case 'swarm':{const pts=[[-9,-22],[8,-36],[1,-13]];for(const [x,y] of pts){ctx.strokeStyle='rgba(220,230,240,.45)';ctx.lineWidth=1;seg(x,0,x,y);
      ctx.save();ctx.globalAlpha=.75;ctx.fillStyle='#e8f0ff';ctx.beginPath();ctx.ellipse(x-4,y-4,4.5,2.2,-.6,0,7);ctx.ellipse(x+4,y-4,4.5,2.2,.6,0,7);ctx.fill();ctx.restore();ball(x,y,5,bright);ctx.fillStyle='#ff4';ctx.fillRect(x+1.5,y-1.5,1.6,1.6)}break}
    case 'treant':{shp([[-9,-1],[9,-1],[5,-48],[-5,-48]],'#6b4a2c',-9,9);limb(-3,-40,-17,-52,4,'#6b4a2c');limb(3,-42,18,-56,4,'#6b4a2c');
      limb(-7,-2,-12,0,4,'#5a3d22');limb(7,-2,13,0,4,'#5a3d22');ctx.fillStyle='#ffd25a';ctx.fillRect(-4,-36,2.5,2);ctx.fillRect(2,-36,2.5,2);
      const leaf=card.id==='weeping'?'#5a6a3a':'#4f8a3a';ball(-12,-56,8,leaf);ball(13,-60,9,leaf);ball(0,-64,12,shade(leaf,1.1));ctx.fillStyle=seatC;ctx.fillRect(-6,-22,12,2.5);break}
    case 'serpent':{for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(0,-4-i*6,15-i*3,5.2-i*.6,0,0,7);ctx.fillStyle=gX(shade(c,1.2+i*.08),-15,15);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.35)';ctx.stroke()}
      curve([[4,-18],[10,-28],[4,-38],[10,-46]],7,shade(c,1.15));ctx.strokeStyle=seatC;ctx.lineWidth=1.6;seg(-12,-5,12,-5);
      ball(12,-48,6.5,shade(c,1.25));ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(15,-43);ctx.lineTo(16,-39);ctx.lineTo(17,-43);ctx.fill();ctx.fillStyle='#f33';ctx.fillRect(14,-51,2,1.8);break}
    case 'kraken':{for(let i=0;i<6;i++){const x=-12+i*5;curve([[x*.6,-26],[x+(i%2?4:-4),-14],[x*1.3,-6],[x*1.4+(i%2?5:-5),-1]],3.6,shade(c,1.05+i*.04))}
      ctx.beginPath();ctx.ellipse(0,-40,12,16,0,0,7);ctx.fillStyle=gX(shade(c,1.2),-12,12);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.35)';ctx.stroke();
      ctx.fillStyle='#ffe066';ctx.beginPath();ctx.arc(-4,-36,2.2,0,7);ctx.arc(5,-36,2.2,0,7);ctx.fill();ctx.fillStyle=seatC;ctx.fillRect(-9,-28,18,2.5);break}
    case 'chest':{shp([[-15,-20],[15,-20],[15,0],[-15,0]],'#8a5a2a',-15,15);ctx.fillStyle='#c9a24a';ctx.fillRect(-15,-11,30,2.4);
      shp([[-15,-20],[15,-20],[17,-38],[-13,-34]],'#9a6a32',-15,17);ctx.fillStyle='#b02a2a';ctx.beginPath();ctx.ellipse(1,-22,11,3,0,0,7);ctx.fill();
      ctx.fillStyle='#fff';for(let i=0;i<6;i++){const x=-12+i*5;ctx.beginPath();ctx.moveTo(x,-20);ctx.lineTo(x+2.2,-25);ctx.lineTo(x+4.4,-20);ctx.fill();ctx.beginPath();ctx.moveTo(x+1,-33.5+i*.6);ctx.lineTo(x+3,-28.5+i*.6);ctx.lineTo(x+5,-33.5+i*.6);ctx.fill()}
      ctx.fillStyle=seatC;ctx.fillRect(-15,-3,30,2.5);break}
  }
}

const FIG_H={dragon:98,flyer:86,ghost:74,construct:74,treant:78,brute:74,beast:50,wbeast:64,rider:74,swarm:46,chest:42,serpent:58,kraken:58};
function drawUnit(g,u,c,zTop,sel,isAct,tgt,face){
  const s=g.sz,card=CARD[u.card],body=BODY[card.id]||card.b||'warrior';
  const big=(card.k==='Hero'?1:.8)*(BIG[body]||1),vh=Math.max(.55,g.cp);
  const b=pt(g,c.wx,c.wy,zTop);
  const sh=pt(g,c.wx-LIGHT[0]*.5*big,c.wy-LIGHT[1]*.5*big,zTop);
  ctx.fillStyle='rgba(0,0,0,.32)';ctx.beginPath();ctx.ellipse(sh[0],sh[1],s*.68*Math.min(1.15,big),s*.68*Math.min(1.15,big)*g.sp,0,0,7);ctx.fill();
  // painted base
  const rx=s*.6*Math.min(1.12,big),ry=rx*g.sp,th=s*.15*vh;
  ctx.fillStyle=shade(SEATC[u.o],.5);ctx.beginPath();ctx.ellipse(b[0],b[1],rx,ry,0,0,Math.PI);ctx.lineTo(b[0]-rx,b[1]-th);ctx.ellipse(b[0],b[1]-th,rx,ry,0,Math.PI,0,true);ctx.closePath();ctx.fill();
  const bg=ctx.createRadialGradient(b[0]-rx*.3,b[1]-th-ry*.4,rx*.1,b[0],b[1]-th,rx);bg.addColorStop(0,shade(SEATC[u.o],1.35));bg.addColorStop(1,shade(SEATC[u.o],.8));
  ctx.fillStyle=bg;ctx.beginPath();ctx.ellipse(b[0],b[1]-th,rx,ry,0,0,7);ctx.fill();
  ctx.fillStyle='rgba(60,70,40,.55)';ctx.beginPath();ctx.ellipse(b[0],b[1]-th,rx*.72,ry*.72,0,0,7);ctx.fill(); // flock
  if(sel){ctx.strokeStyle='#fff';ctx.lineWidth=2.5;ctx.beginPath();ctx.ellipse(b[0],b[1]-th,rx+4,ry+3,0,0,7);ctx.stroke()}
  else if(isAct){ctx.strokeStyle='#f2d27a';ctx.setLineDash([4,3]);ctx.lineWidth=1.8;ctx.beginPath();ctx.ellipse(b[0],b[1]-th,rx+4,ry+3,0,0,7);ctx.stroke();ctx.setLineDash([])}
  if(tgt){ctx.strokeStyle=tgt==='mend'?'#69c27a':'#ff5a40';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(b[0],b[1]-th,rx+6,ry+4.5,0,0,7);ctx.stroke()}
  // the sculpted figure
  const k=s/40*big;const lx=LIGHT[0]*g.cyw-LIGHT[1]*g.syw;
  ctx.save();ctx.translate(b[0],b[1]-th);ctx.scale(face*k,k*vh);LIT=(lx<0?-1:1)*face;
  if(body==='flyer'||body==='ghost'||body==='dragon'){ctx.strokeStyle='rgba(220,235,255,.45)';ctx.lineWidth=2.4;seg(0,0,0,-18)}
  drawMini(u,card,SEATC[u.o],face,vh);
  ctx.restore();
  // name medallion on the base rim
  if(s>=12){const mx=b[0],my=b[1]-th*.4+ry*.78,mr=Math.max(5,s*.17);ctx.fillStyle='#1b1d20';ctx.beginPath();ctx.arc(mx,my,mr,0,7);ctx.fill();ctx.strokeStyle='#d3a748';ctx.lineWidth=1.2;ctx.stroke();
    ctx.font=Math.round(mr*1.25)+'px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff';ctx.fillText(card.g,mx,my+.5)}
  const topY=b[1]-th-(FIG_H[body]||66)*k*vh;const half=Math.max(rx,24*k);
  if(card.hp>1){const w=Math.max(s*.9,26),pw=w/card.hp;ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(b[0]-w/2-1,topY-9,w+2,6);for(let i=0;i<card.hp;i++){ctx.fillStyle=i<u.hp?'#69c27a':'#55302b';ctx.fillRect(b[0]-w/2+i*pw+.5,topY-8,pw-1,4)}}
  if(tgt){ctx.font='bold '+Math.round(Math.max(12,s*.5))+'px sans-serif';ctx.textAlign='center';ctx.fillStyle=tgt==='mend'?'#69c27a':'#ff5a40';ctx.fillText(tgt==='mend'?'✚':'⚔',b[0],topY-16)}
  return {top:topY-10,half};
}
function draw(){
  syncR();
  if(!W)return;
  ctx.setTransform(DPR,0,0,DPR,0,0);ctx.clearRect(0,0,W,H);
  const g=geo();const st=S||{map:ui.preview,zones:{},units:[]};const map=st.map;
  const editing=S&&S.phase==='map'&&isHost();const fast=ui.fast||g.sz<7;
  // table shadow under the board
  const c0=pt(g,0,0,0);ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(c0[0],c0[1]+g.sz*1.2,g.sz*(R+1)*1.85,g.sz*(R+1)*1.6*g.sp,0,0,7);ctx.fill();
  const cells=[];
  for(let q=-R;q<=R;q++)for(let r=-R;r<=R;r++){if(!inBoard(q,r))continue;const [wx,wy]=hexW(q,r);const yr=wx*g.syw+wy*g.cyw;cells.push({k:K(q,r),q,r,wx,wy,yr})}
  cells.sort((a,b)=>a.yr-b.yr);
  hitList=[];
  let reach=null,targets=null,selU=null;
  if(S&&S.phase==='battle'&&ui.sel){selU=S.units.find(u=>u.id===ui.sel&&u.hp>0);
    if(selU){if(!S.turn.attacking&&!S.turn.moved[selU.id])reach=moveOpts(S,selU).dest;targets=targetsFor(S,selU)}}
  const deployHi=S&&S.phase==='deploy'&&ctl(S.deploy.seat)?S.deploy.seat:null;
  const hOf=k=>{const c=map[k];return c?c.replace(/t/g,'').length:0};
  const showZones=S&&(S.phase==='lobby'||S.phase==='map'||S.phase==='draft'||S.phase==='deploy');
  const faceOf={};const live=st.units.filter(u=>u.hp>0&&u.k);
  for(const u of live){let best=null,bd=1e9;const pu=P(u.k);for(const e of live)if(e.o!==u.o){const d=dist(pu,P(e.k));if(d<bd){bd=d;best=e}}
    if(best){const a=hexW(...pu),b2=hexW(...P(best.k));faceOf[u.id]=(b2[0]*g.cyw-b2[1]*g.syw)>=(a[0]*g.cyw-a[1]*g.syw)?1:-1}else faceOf[u.id]=u.o%2?-1:1}
  for(const c of cells){
    const col=map[c.k];
    if(!col){if(editing){const rg=ring(g,c.wx,c.wy,0);poly(rg);ctx.strokeStyle='rgba(255,255,255,.1)';ctx.lineWidth=1;ctx.stroke();hitList.push({k:c.k,pts:rg})}continue}
    const layers=col.replace(/t/g,'');const h=layers.length;const zTop=h*LHU;
    // visible side faces, only the part above the neighbour that would hide it
    for(let k=0;k<6;k++){
      const nyr=Math.cos(NA[k])*g.syw+Math.sin(NA[k])*g.cyw;if(nyr<=0.02)continue;
      const nh=hOf(K(c.q+NB[k][0],c.r+NB[k][1]));if(nh>=h)continue;
      const lit=.5+.5*Math.max(0,Math.cos(NA[k])*LIGHT[0]+Math.sin(NA[k])*LIGHT[1])+.12*nyr;
      const a0=VA[k],a1=VA[(k+1)%6];
      for(let i=nh;i<h;i++){const T=TERR[layers[i]];const z0=i*LHU,z1=(i+1)*LHU;
        const p1=pt(g,c.wx+Math.cos(a0),c.wy+Math.sin(a0),z1),p2=pt(g,c.wx+Math.cos(a1),c.wy+Math.sin(a1),z1),p3=pt(g,c.wx+Math.cos(a1),c.wy+Math.sin(a1),z0),p4=pt(g,c.wx+Math.cos(a0),c.wy+Math.sin(a0),z0);
        let gr;if(fast)gr=shade(T.side,lit*.97);else{gr=ctx.createLinearGradient(0,p1[1],0,p4[1]);gr.addColorStop(0,shade(T.side,lit*1.12));gr.addColorStop(1,shade(T.side,lit*.82))}
        poly([p1,p2,p3,p4]);ctx.fillStyle=layers[i]==='w'?shade(T.side,lit,.88):gr;ctx.fill();
        if(layers[i]==='c'&&g.sz>10&&!fast){ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=1;const mid=[(p1[0]+p4[0])/2,(p1[1]+p4[1])/2],mid2=[(p2[0]+p3[0])/2,(p2[1]+p3[1])/2];ctx.beginPath();ctx.moveTo(mid[0],mid[1]);ctx.lineTo(mid2[0],mid2[1]);
          const f=(i%2)?.33:.66;ctx.moveTo(p1[0]+(p2[0]-p1[0])*f,p1[1]+(p2[1]-p1[1])*f);ctx.lineTo(mid[0]+(mid2[0]-mid[0])*f,mid[1]+(mid2[1]-mid[1])*f);ctx.stroke()}
        ctx.strokeStyle='rgba(0,0,0,.28)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(p1[0],p1[1]);ctx.lineTo(p2[0],p2[1]);ctx.stroke();
      }
    }
    // top face
    const top=ring(g,c.wx,c.wy,zTop);const tt=layers[h-1];const T=TERR[tt];
    const bright=.92+Math.min(.18,h*.025);
    poly(top);
    if(tt==='l'){ctx.save();ctx.shadowColor='rgba(255,110,20,.8)';ctx.shadowBlur=g.sz*.8;ctx.fillStyle=shade(T.top,1.05);ctx.fill();ctx.restore()}
    else if(fast){ctx.fillStyle=shade(T.top,bright,tt==='w'?.9:1);ctx.fill()}
    else{const ctr=pt(g,c.wx,c.wy,zTop);const gr=ctx.createLinearGradient(ctr[0]-g.sz,ctr[1]-g.sz*.6,ctr[0]+g.sz,ctr[1]+g.sz*.6);
      gr.addColorStop(0,shade(T.top,bright*1.1,tt==='w'?.9:1));gr.addColorStop(1,shade(T.top,bright*.9,tt==='w'?.9:1));ctx.fillStyle=gr;ctx.fill()}
    if(!fast)drawTopDetail(tt,top,c,g,c.q,c.r,zTop);
    // soft shadows / ambient occlusion from taller neighbours
    if(!fast)for(let k=0;k<6;k++){const nh=hOf(K(c.q+NB[k][0],c.r+NB[k][1]));if(nh<=h)continue;
      const towardLight=Math.cos(NA[k])*LIGHT[0]+Math.sin(NA[k])*LIGHT[1];
      const a=Math.min(.55,.1*(nh-h)+.08+(towardLight>0?.18*towardLight*Math.min(3,nh-h):0));
      const a0=VA[k],a1=VA[(k+1)%6];const reach2=towardLight>0?Math.min(.85,.35+.12*(nh-h)):.3;
      const e1=pt(g,c.wx+Math.cos(a0),c.wy+Math.sin(a0),zTop),e2=pt(g,c.wx+Math.cos(a1),c.wy+Math.sin(a1),zTop);
      const i1=pt(g,c.wx+Math.cos(a0)*(1-reach2),c.wy+Math.sin(a0)*(1-reach2),zTop),i2=pt(g,c.wx+Math.cos(a1)*(1-reach2),c.wy+Math.sin(a1)*(1-reach2),zTop);
      const em=[(e1[0]+e2[0])/2,(e1[1]+e2[1])/2],im=[(i1[0]+i2[0])/2,(i1[1]+i2[1])/2];
      const gr=ctx.createLinearGradient(em[0],em[1],im[0],im[1]);gr.addColorStop(0,`rgba(0,0,0,${a})`);gr.addColorStop(1,'rgba(0,0,0,0)');
      poly([e1,e2,i2,i1]);ctx.fillStyle=gr;ctx.fill()}
    // bevel: lit rim on edges facing the light
    ctx.lineWidth=Math.max(1,g.sz*.04);
    if(fast){ctx.strokeStyle='rgba(0,0,0,.25)';poly(top);ctx.stroke()}else for(let k=0;k<6;k++){const f=Math.cos(NA[k])*LIGHT[0]+Math.sin(NA[k])*LIGHT[1];const p1=top[k],p2=top[(k+1)%6];
      ctx.strokeStyle=f>0.2?`rgba(255,255,255,${.22*f})`:`rgba(0,0,0,${.25})`;ctx.beginPath();ctx.moveTo(p1[0],p1[1]);ctx.lineTo(p2[0],p2[1]);ctx.stroke()}
    const z=st.zones?st.zones[c.k]:undefined;
    if(z!==undefined&&showZones){ctx.save();poly(top);ctx.fillStyle=SEATC[z]+(deployHi===z?'66':'33');ctx.fill();ctx.restore();
      poly(ring(g,c.wx,c.wy,zTop,.82));ctx.strokeStyle=SEATC[z];ctx.lineWidth=1.6;ctx.stroke()}
    if(reach&&reach[c.k]){poly(top);ctx.fillStyle='rgba(255,243,196,.28)';ctx.fill();poly(ring(g,c.wx,c.wy,zTop,.78));ctx.strokeStyle='#f2d27a';ctx.lineWidth=1.8;ctx.stroke()}
    if(ui.hover===c.k){poly(top);ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=2;ctx.stroke()}
    const hp=hull(top.concat(ring(g,c.wx,c.wy,0)).map(p=>[p[0],p[1]]));
    if(col.includes('t'))drawTree(g,c,zTop,c.q,c.r);
    if(tt==='x')drawCrystals(g,c,zTop,c.q,c.r);
    const u=st.units.find(x=>x.hp>0&&x.k===c.k);
    if(u){const isAct=S&&S.phase==='battle'&&S.turn.card===u.card&&S.turn.seat===u.o;const bb=drawUnit(g,u,c,zTop,selU&&selU.id===u.id,isAct,targets&&targets[c.k],faceOf[u.id]||1);
      const tb=pt(g,c.wx,c.wy,zTop);hp.push([tb[0]-bb.half,bb.top],[tb[0]+bb.half,bb.top]);hitList.push({k:c.k,pts:hull(hp)});}
    else hitList.push({k:c.k,pts:hp});
  }
}
function pip(px,py,pts){let ins=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const [xi,yi]=pts[i],[xj,yj]=pts[j];if(((yi>py)!==(yj>py))&&(px<(xj-xi)*(py-yi)/(yj-yi)+xi))ins=!ins}return ins}
function pick(x,y){for(let i=hitList.length-1;i>=0;i--)if(pip(x,y,hitList[i].pts))return hitList[i].k;return null}
function animateCam(){
  if(matchMedia('(prefers-reduced-motion:reduce)').matches){cam.yaw=cam.tYaw;cam.pitch=cam.tPitch;draw();return}
  if(anim)return;
  const step=()=>{const dy=cam.tYaw-cam.yaw,dp=cam.tPitch-cam.pitch;
    if(Math.abs(dy)<.25&&Math.abs(dp)<.25){cam.yaw=cam.tYaw;cam.pitch=cam.tPitch;anim=null;ui.fast=false;draw();return}
    cam.yaw+=dy*.18;cam.pitch+=dp*.18;ui.fast=true;draw();anim=requestAnimationFrame(step)};
  anim=requestAnimationFrame(step);
}

/* ================= INPUT ================= */
let drag=null;
const clampP=p=>Math.max(22,Math.min(88,p));
cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);const r=cv.getBoundingClientRect();
  drag={x:e.clientX,y:e.clientY,px:ui.pan.x,py:ui.pan.y,yaw:cam.tYaw,pitch:cam.tPitch,b:e.button,orbit:e.button===2||e.button===1||e.altKey||e.shiftKey,moved:false,painted:new Set(),paint:false};
  const painting=S&&S.phase==='map'&&isHost()&&e.button===0&&!drag.orbit&&e.pointerType==='mouse';
  if(painting){drag.paint=true;const k=pick(e.clientX-r.left,e.clientY-r.top);if(k){drag.painted.add(k);editHex(k,false)}}
});
cv.addEventListener('pointermove',e=>{const r=cv.getBoundingClientRect();const x=e.clientX-r.left,y=e.clientY-r.top;
  if(drag){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>6)drag.moved=true;
    if(drag.paint){const k=pick(x,y);if(k&&!drag.painted.has(k)){drag.painted.add(k);editHex(k,false)}return}
    if(drag.moved){ui.fast=true;if(drag.orbit){cam.yaw=cam.tYaw=drag.yaw+dx*.45;cam.pitch=cam.tPitch=clampP(drag.pitch-dy*.3)}else{ui.pan.x=drag.px+dx;ui.pan.y=drag.py+dy}draw()}return}
  const k=pick(x,y);if(k!==ui.hover){ui.hover=k;draw();updateHint()}
});
cv.addEventListener('pointerup',e=>{const d=drag;drag=null;if(!d)return;if(ui.fast){ui.fast=false;draw()}if(d.paint)return;if(d.moved)return;
  const r=cv.getBoundingClientRect();const k=pick(e.clientX-r.left,e.clientY-r.top);if(k)clickHex(k,d.b===2)});
cv.addEventListener('pointerleave',()=>{if(ui.hover){ui.hover=null;draw()}});
let settleT=null;function settle(){clearTimeout(settleT);settleT=setTimeout(()=>{ui.fast=false;draw()},160)}
cv.addEventListener('wheel',e=>{e.preventDefault();ui.zoom=Math.max(.5,Math.min(5,ui.zoom*(e.deltaY<0?1.1:1/1.1)));ui.fast=true;draw();settle()},{passive:false});
document.getElementById('zin').onclick=()=>{ui.zoom=Math.min(5,ui.zoom*1.2);draw()};
document.getElementById('zout').onclick=()=>{ui.zoom=Math.max(.5,ui.zoom/1.2);draw()};
document.getElementById('rotL').onclick=()=>{cam.tYaw-=45;animateCam()};
document.getElementById('rotR').onclick=()=>{cam.tYaw+=45;animateCam()};
document.getElementById('tiltU').onclick=()=>{cam.tPitch=clampP(cam.tPitch+12);animateCam()};
document.getElementById('tiltD').onclick=()=>{cam.tPitch=clampP(cam.tPitch-12);animateCam()};
document.getElementById('home').onclick=()=>{cam.tYaw=Math.round(cam.yaw/360)*360-18;cam.tPitch=48;ui.zoom=1;ui.pan={x:0,y:0};animateCam()};

function editHex(k,right){
  if(!(S&&S.phase==='map'&&isHost()))return;
  const tool=right?'lower':ui.tool;
  commit(s=>{
    const col=s.map[k]||'';
    if(tool==='zone'){if(!col)return;if(s.zones[k]===ui.zoneSeat)delete s.zones[k];else s.zones[k]=ui.zoneSeat;return}
    if(tool==='lower'){if(col.includes('t'))s.map[k]=col.replace(/t/g,'');else if(col.length>1)s.map[k]=col.slice(0,-1);else{delete s.map[k];delete s.zones[k]}return}
    if(tool==='paint'){if(!col)return;if(ui.terr==='t'){s.map[k]=col.includes('t')?col.replace(/t/g,''):col+'t';return}const g=col.replace(/t/g,'');s.map[k]=g.slice(0,-1)+ui.terr+(col.includes('t')?'t':'');return}
    // raise
    if(ui.terr==='t'){if(!col)return;s.map[k]=col.includes('t')?col.replace(/t/g,''):col+'t';delete s.zones[k];return}
    const g=col.replace(/t/g,'');if(g.length>=8)return;
    const below=g?(UNDER[g[g.length-1]]||'d'):'';
    s.map[k]=(g?g.slice(0,-1)+below:'')+ui.terr+(col.includes('t')?'t':'');
  },true);
}
function clickHex(k,right){
  if(!S)return;
  if(S.phase==='map'){editHex(k,right);return}
  if(S.phase==='deploy'){
    const seat=S.deploy.seat;if(!ctl(seat))return;
    const occ=unitAt(S,k);
    if(occ&&occ.o===seat){commit(s=>{s.units.find(u=>u.id===occ.id).k=null});ui.deploySel=occ.id;renderAll();return}
    if(S.zones[k]!==seat||occ||hasTree(S,k)){toast('Place figures on open hexes in your colored start zone.');return}
    let uid=ui.deploySel&&S.units.find(u=>u.id===ui.deploySel&&!u.k)?ui.deploySel:null;
    if(!uid){const nx=S.units.find(u=>u.o===seat&&!u.k);if(!nx)return;uid=nx.id}
    commit(s=>{s.units.find(u=>u.id===uid).k=k});
    const nx=S.units.find(u=>u.o===seat&&!u.k&&u.card===CARD[S.units.find(u=>u.id===uid).card].id);ui.deploySel=nx?nx.id:null;renderAll();return;
  }
  if(S.phase==='battle'&&S.turn.stage==='orders')return;
  if(S.phase==='battle'){
    const t=S.turn;const me=ctl(t.seat);const occ=unitAt(S,k);
    if(!me){if(occ){ui.detail=occ.card;renderSide()}return}
    const selU=ui.sel&&S.units.find(u=>u.id===ui.sel&&u.hp>0);
    if(selU){
      const tg=targetsFor(S,selU);
      if(tg[k]){doAttack(selU.id,k);return}
      if(!t.attacking&&!t.moved[selU.id]){const m=moveOpts(S,selU).dest;if(m[k]){doMove(selU.id,k);return}}
    }
    if(occ&&occ.o===t.seat){
      if(classic(S)&&t.card!==occ.card){toast('Order '+t.marker+' is on '+CARD[t.card].n+'.');ui.detail=occ.card;renderSide();return}
      if(t.card&&t.card!==occ.card){const started=Object.keys(t.moved).length||t.attacking;if(started){toast('This turn belongs to '+CARD[t.card].n+'.');ui.detail=occ.card;renderSide();return}}
      if(t.card!==occ.card)commit(s=>{s.turn.card=occ.card});
      ui.sel=occ.id;renderAll();return;
    }
    if(occ){ui.detail=occ.card;}
    ui.sel=null;renderAll();
  }
}
function updateHint(){
  const h=document.getElementById('hint');let m='';
  if(ui.hover&&curMap()[ui.hover]){const col=curMap()[ui.hover];const g=col.replace(/t/g,'');const tt=g[g.length-1];m=(col.includes('t')?'Tree on ':'')+TERR[tt].n+', height '+g.length+'. '+(col.includes('t')?TERR_NOTE.t:TERR_NOTE[tt])}
  else if(!S)m='Drag to pan, right-drag (or Shift-drag) to orbit, scroll to zoom.';
  else if(S.phase==='map')m=isHost()?'Click or drag to build, right-click to lower, Shift-drag to orbit.':'The host is shaping the battlefield.';
  else if(S.phase==='battle'&&S.turn.stage==='orders')m='Place your order markers in the sidebar.';
  else if(S.phase==='battle')m=LOCAL&&isBot(S.turn.seat)?'A bot is taking its turn. Change bot speed or pause in the sidebar.':'Click your figure, then a glowing hex to move or a red ring to attack.';
  else m='Drag to pan, right-drag (or Shift-drag) to orbit, scroll to zoom.';
  h.textContent=m;
}

/* ================= RENDERING: SIDEBAR ================= */
const side=document.getElementById('side');
function cardHTML(c,opts={}){
  const cls=['card'];if(opts.taken)cls.push('taken');if(opts.pick)cls.push('pickable');if(opts.sel)cls.push('sel');
  return `<div class="${cls.join(' ')}" data-cid="${c.id}" ${opts.pick?`data-pick="${c.id}" role="button" tabindex="0"`:''}>
    <div class="glyph" style="background:${c.c}">${c.g}</div>
    <div><div class="cname">${esc(c.n)}</div><div class="ctitle">${esc(c.t)} · ${c.k}${c.f>1?' of '+c.f:''}</div></div>
    <div class="pts">${c.p}<small>pts</small></div>
    <div class="stats"><span>Life <b>${c.hp}</b></span><span>Move <b>${c.mv}</b></span><span>Range <b>${c.rg}</b></span><span>Atk <b>${c.at}</b></span><span>Def <b>${c.df}</b></span><span>Height <b>${figH(c)}</b></span></div>
    ${c.ab.length||opts.extra?`<div class="abil">${c.ab.map(a=>`<span class="tag" title="${esc(ABIL[a].d)}">${ABIL[a].n}</span>`).join('')}${opts.extra||''}</div>`:''}
  </div>`;
}
function netStatusHTML(){
  const u=ui.net&&ui.net.upnp;
  if(!ui.net||!ui.net.ok)return '';
  if(!u)return '<p class="muted">Checking whether your router can open the game port…</p>';
  if(u.ok)return `<p class="muted">Internet address: <b>${esc(u.ip+':'+ui.net.port)}</b>. Your router opened the game port, so friends anywhere can connect to it.</p>`;
  return `<p class="muted">${esc(u.reason||'Your router could not open the game port.')} Friends on other networks can still join with an invite code from your game lobby.</p>`;
}
function guestHTML(){
  const g=rtc.guest;if(!g)return '';
  if(g.state==='trying')return '<p class="muted">Contacting the host…</p>';
  if(g.state==='reply'&&!g.reply)return '<p class="muted">Preparing your reply code…</p>';
  if(g.state==='reply')return `<p class="muted">Send this reply code back to the host. You’ll connect as soon as they paste it.</p><textarea id="repCode" rows="3" readonly spellcheck="false">${esc(g.reply)}</textarea><div class="row"><button class="btn sm" id="copyRep">Copy reply</button></div>`;
  if(g.state==='failed')return '<p class="muted">Couldn’t link to the host. One of your networks blocks direct connections. See “If invites fail” in the README.</p>';
  return '';
}
function applySearch(){
  const q=(ui.q||'').trim().toLowerCase();
  side.querySelectorAll('.card[data-cid]').forEach(el=>{const c=CARD[el.dataset.cid];if(!c)return;
    const hay=(c.n+' '+c.t+' '+c.k+' '+c.ab.map(a=>ABIL[a].n).join(' ')).toLowerCase();
    if(el.closest('.sec')&&el.closest('.sec').querySelector('#rq'))el.hidden=!!q&&!hay.includes(q)});
}
function myMarkersHTML(){
  const t=S.turn;const mine=Object.keys(t.orders||{}).map(Number).filter(i=>ctl(i)&&!isBot(i));if(!mine.length)return '';
  const done=m=>t.order.findIndex(e=>e.m===m)>=0&&t.order.slice(0,t.idx+1).some(e=>e.m===m);
  return mine.map(i=>{const o=t.orders[i];return `<div class="sec"><h3>${mine.length>1||LOCAL?esc(seatName(S,i))+'’s':'Your'} order markers</h3><div class="row">${[1,2,3,'X'].map(m=>{const used=m!=='X'&&t.order.slice(0,t.idx+1).some(e=>e.i===i&&e.m===m);
    return `<span class="tag" style="${t.seat===i&&t.marker===m?'border-color:var(--brass)':''}${used?';opacity:.5':''}">${m}: ${esc(CARD[o[m]].n)}</span>`}).join('')}</div></div>`}).join('');
}
function ordersHTML(){
  const t=S.turn;const need=needOrders(S);
  const mineNeed=need.filter(i=>ctl(i));const seat=mineNeed[0];
  let h=`<div class="banner">Round ${t.round} · Place order markers</div>`;
  if(seat!==undefined){
    const cards=cardsAlive(S,seat);const d=ui.ordDraft&&ui.ordDraft.seat===seat&&ui.ordDraft.round===t.round?ui.ordDraft:(ui.ordDraft={seat,round:t.round,1:cards[0],2:cards[0],3:cards[0],X:cards[cards.length-1]});
    h+=`<div class="sec"><h3>${esc(seatName(S,seat))}: secret orders</h3>
      <p class="muted">Put markers 1, 2 and 3 on the cards you want to act on your first, second and third turns this round. Several markers can share a card. X is a decoy.${LOCAL&&S.seats.filter((_,i)=>!isBot(i)).length>1?' Other players: look away.':''}</p>
      ${[1,2,3,'X'].map(m=>`<div class="seat"><span class="nm">${m==='X'?'Decoy X':'Order '+m}</span><select data-ord="${m}" aria-label="Order marker ${m}">${cards.map(cid=>`<option value="${cid}" ${d[m]===cid?'selected':''}>${esc(CARD[cid].n)}</option>`).join('')}</select></div>`).join('')}
      <div class="row"><button class="btn primary" id="lockOrders">Lock in orders</button></div></div>`;
  }
  h+=`<div class="sec"><h3>Orders</h3>${aliveSeats(S).map(i=>`<div class="seat"><span class="dot" style="background:${SEATC[i]}"></span><span class="nm">${esc(seatName(S,i))}</span><span class="muted">${t.orders[i]?'✓ placed':'placing…'}</span></div>`).join('')}</div>`;
  return h;
}
async function lockMyOrders(){
  const d=ui.ordDraft;if(!d)return;const ord={1:d[1],2:d[2],3:d[3],X:d.X};const seat=d.seat;ui.ordDraft=null;
  if(LOCAL||!gameRef){commit(s=>submitOrders(s,seat,ord));return}
  try{ // simultaneous orders online: lock the game briefly so nobody's markers overwrite another's
    let lease={acquired:false};for(let i=0;i<30&&!lease.acquired;i++){lease=await gameRef.acquire({holder:myId,ttlMs:1000});if(!lease.acquired)await new Promise(r=>setTimeout(r,200+Math.random()*250))}
    const snap=await gameRef.get();if(snap.exists)S=structuredClone(snap.data());
    commit(s=>submitOrders(s,seat,ord));
  }catch(e){toast('Could not send your orders. Try again.');ui.ordDraft={...ord,seat,round:S.turn.round};renderSide()}
}
function filterHTML(inDraft){
  const opts=[['all','All'],['Hero','Heroes'],['Squad','Squads'],['fly','Flyers'],['ranged','Ranged']];
  if(inDraft)opts.push(['afford','Affordable']);
  return `<div class="row">${opts.map(([k,n])=>`<button class="btn sm ${ui.filter===k?'on':''}" data-filter="${k}">${n}</button>`).join('')}
    <input type="text" id="rq" placeholder="Search name or ability" aria-label="Search roster" value="${esc(ui.q||'')}">
    <select id="sortBy" aria-label="Sort roster"><option value="name" ${ui.sort==='name'?'selected':''}>By name</option><option value="p" ${ui.sort==='p'?'selected':''}>By points</option></select></div>`;
}
function rosterList(left){
  const f=ui.filter||'all';
  let l=CARDS.filter(c=>f==='all'||c.k===f||(f==='fly'&&c.ab.includes('fly'))||(f==='ranged'&&c.rg>1)||(f==='afford'&&left!=null&&c.p<=left));
  if(f==='afford'&&S&&S.phase==='draft'){const t=taken(S);l=l.filter(c=>!t.has(c.id))}
  return ui.sort==='p'?[...l].sort((a,b)=>b.p-a.p):[...l].sort((a,b)=>a.n.localeCompare(b.n));
}
function seatsHTML(active){
  return S.seats.map((x,i)=>`<div class="seat ${active===i?'active':''}"><span class="dot" style="background:${SEATC[i]}"></span><span class="nm">${esc(seatName(S,i))}${x&&!LOCAL&&x.id===myId?' (you)':''}</span>${S.phase==='draft'?`<span class="muted">${pts(S,i)}/${budgetFor(S,i)} pts</span>`:S.phase==='deploy'||S.phase==='battle'||S.phase==='over'?`<span class="muted">${pts(S,i)} pts</span>`:''}${!x&&S.phase==='lobby'&&!readOnly?`<button class="btn sm" data-seat="${i}">Take seat</button>`:''}</div>`).join('');
}
function rollHTML(){
  if(!S||!S.roll)return '';
  const d=f=>`<span class="die ${f}">${f==='sk'?'☠':f==='sh'?'⛨':''}</span>`;
  return `<div class="sec"><h3>Last roll · ${esc(S.roll.t)}</h3><div class="dice" id="dicebox">${S.roll.rows.map(r=>`<div class="drow"><b style="flex-basis:100%">${esc(r.l)}</b>${r.a.length?'Atk '+r.a.map(d).join(''):''}${r.d.length||r.blink?' &nbsp;Def '+r.d.map(d).join('')+(r.blink?'<span class="die sh" title="Blur">+⛨</span>':''):''}<span style="margin-left:auto;font-weight:700">${esc(r.res)}</span></div>`).join('')}</div></div>`;
}
function logHTML(){return S&&S.log.length?`<div class="sec"><h3>Battle log</h3><div class="log">${S.log.map(m=>`<div>${esc(m)}</div>`).join('')}</div></div>`:''}
function rulesHTML(){return `<details><summary>How to play</summary><div class="rules">
<div><b>Build.</b> The host raises terrain, paints it, plants trees and marks start zones. Trees block moves and sight. Water stops movement; lava stops it and burns. Sand and snow cost 1 extra move, swamp 2; roads cost half. Ice gives −1 defense, castle stone +1 defense, power shards +1 attack. Hover a tile to see its rule.</div>
<div><b>Camera.</b> Drag to pan, right-drag or Shift-drag to orbit and tilt, scroll to zoom.</div>
<div><b>Draft.</b> Snake draft from one shared roster: every character can be drafted once. Stay within the point budget, or stop early.</div>
<div><b>Order markers.</b> Each round starts with every player secretly placing markers 1, 2 and 3 (plus a decoy X) on their army cards. One card can carry several markers.</div>
<div><b>Turns.</b> Everyone rolls a d20 for initiative (ties roll again). Then each player in initiative order takes the turn marked 1, then everyone takes turn 2, then turn 3. On a turn the marked card activates: move its figures, then attack. Once any figure attacks, moving ends. A marker on a destroyed card is a lost turn.</div>
<div><b>Moving.</b> Each space costs 1, plus 1 for every level climbed. A figure can climb a ledge up to its Height in one step. Dropping its Height or more is a fall: roll a combat die (more for long drops), each skull is a wound. Leaving an enemy you were next to gives it a free attack: 1 die, a skull is a wound. Water ends a move.</div>
<div><b>Combat.</b> Dice show 3 skulls, 2 shields, 1 blank. Attacker counts skulls, defender counts shields; each extra skull is a wound. Standing higher than your target gives +1 attack die; a defender standing higher gets +1 defense die. Ranged attacks need clear sight.</div>
<div><b>Winning.</b> Be the last army standing. (If a battle runs 40 rounds, surviving points decide it.)</div></div></details>`}

function renderSide(){
  let h='';
  if(!S){
    const online=ui.dbReady;
    h+=`<div class="sec"><h2>Muster your warband</h2><p class="muted">Build a hex battlefield, draft heroes and squads from a shared roster, then fight it out turn by turn. Play offline against bots, pass-and-play with friends, ${DESKTOP?'or online across your network or the internet.':'or online with friends.'}</p></div>
    <div class="sec"><h3>Your name</h3><div class="row"><input type="text" id="nm" maxlength="20" placeholder="Commander name" value="${esc(ui.name)}"></div></div>
    <div class="sec"><h3>Offline · bots or friends on this device</h3>
      <div class="row"><select id="offN" aria-label="Players">${[2,3,4,5,6].map(n=>`<option value="${n}" ${ui.off.n===n?'selected':''}>${n} players</option>`).join('')}</select>
        <select id="offB" aria-label="Point budget">${[300,400,500,700,1000].map(b=>`<option value="${b}" ${ui.off.b===b?'selected':''}>${b} pts</option>`).join('')}</select>
        <select id="offR" aria-label="Board size"><option value="0" ${ui.off.r===0?'selected':''}>Auto board size</option>${BOARDS.map(([r,nm,h])=>`<option value="${r}" ${ui.off.r===r?'selected':''}>${nm} · ${h.toLocaleString()} hexes</option>`).join('')}</select></div>
      ${Array.from({length:ui.off.n},(_,i)=>`<div class="seat"><span class="dot" style="background:${SEATC[i]}"></span><span class="nm">Seat ${i+1}</span>
        <select data-offseat="${i}" aria-label="Seat ${i+1} player">${[['human','Human'],...LEVELS.map(l=>[l,'Bot · '+lvLabel(l)])].map(([v,l])=>`<option value="${v}" ${ui.off.seats[i]===v?'selected':''}>${l}</option>`).join('')}</select></div>`).join('')}
      <div class="row"><span class="muted">Set every bot to</span>${LEVELS.map(l=>`<button class="btn sm" data-allbots="${l}">${LV_NAME[l]}</button>`).join('')}</div>
      <p class="muted">Beginner: loose play, 15% fewer draft points. Easy: makes frequent mistakes. Normal: solid but imperfect. Hard: sharp tactics. Brutal: Hard’s tactics with 25% more draft points.</p>
      <div class="row"><button class="btn primary" id="startOff">Start offline game</button><button class="btn" id="watchBots">Watch bots battle</button></div>
    </div>
    <div class="sec"><h3>Online</h3><div class="row">
      <select id="np" aria-label="Players"><option value="2">2 players</option><option value="3">3 players</option><option value="4">4 players</option><option value="5">5 players</option><option value="6">6 players</option></select>
      <select id="nb" aria-label="Point budget"><option value="300">300 pts</option><option value="400">400 pts</option><option value="500" selected>500 pts</option><option value="700">700 pts</option></select>
      <select id="nr" aria-label="Board size"><option value="0" ${(ui.onR||0)===0?'selected':''}>Auto board size</option>${BOARDS.map(([r,nm,h])=>`<option value="${r}" ${(ui.onR||0)===r?'selected':''}>${nm} · ${h.toLocaleString()} hexes</option>`).join('')}</select></div>
      <div class="row"><button class="btn primary" id="hostOnline" ${online?'':'disabled'}>Host online game</button></div>
      ${online?'':`<p class="muted">${DESKTOP?'Not connected to a game server yet. Offline play works now.':ui.dbChecked?'Online play needs this page opened in Claude while signed in. Offline play works everywhere.':'Connecting…'}</p>`}
    </div>
    ${DESKTOP?`<div class="sec"><h3>Network</h3>
      <p class="muted">${ui.net&&ui.net.ok?(ui.net.ips.length?'This computer hosts games. Friends on your network enter <b>'+ui.net.ips.map(esc).join('</b> or <b>')+'</b> below to join you.':'This computer hosts games, but it has no network address right now.'):'This computer could not host games: '+esc(ui.net&&ui.net.error)+'. You can still connect to a friend who hosts.'}</p>
      <div class="row"><input type="text" id="srv" placeholder="Host address, e.g. 192.168.1.20" value="${esc(ui.server&&ui.server.startsWith('localhost')?'':(ui.server||''))}"><button class="btn" id="srvBtn">Connect</button></div>
      <div class="row"><span class="muted">${ui.dbReady?'Connected to '+esc(isLocalServer()?'this computer':ui.server==='internet'?'a friend over the internet':ui.server):ui.server==='internet'?'Internet link closed.':'Connecting to '+esc(ui.server||'')+'…'}</span>${ui.server&&!isLocalServer()?'<button class="btn sm" id="srvLocal">Use this computer</button>':''}</div>
      ${netStatusHTML()}
    </div>
    <div class="sec"><h3>Join a friend over the internet</h3>
      <p class="muted">Paste the invite code your friend sent you.</p>
      <textarea id="invIn" rows="2" placeholder="SSI-…" spellcheck="false"></textarea>
      <div class="row"><button class="btn" id="useInv">Use invite</button></div>
      ${guestHTML()}
    </div>`:''}
    <div class="sec"><h3>Join with a code</h3><div class="row"><input type="text" id="jc" maxlength="5" placeholder="e.g. K7QD" style="text-transform:uppercase"><button class="btn" id="joinBtn" ${online?'':'disabled'}>Join</button></div></div>`;
    if(online){const g=openGames.filter(x=>x&&x.code);h+=`<div class="sec"><h3>Recent games</h3>${g.length?`<div class="games">${g.map(x=>`<div class="seat"><span class="nm">${esc(x.code)} · ${x.phase==='lobby'?'waiting for players':x.phase==='over'?'finished':x.phase}</span><span class="muted">${x.seats.filter(Boolean).length}/${x.n}</span><button class="btn sm" data-join="${esc(x.code)}">${x.seats.some(z=>z&&z.id===myId)?'Rejoin':x.phase==='lobby'?'Join':'Watch'}</button></div>`).join('')}</div>`:'<p class="muted">No games yet. Host one and share its code.</p>'}</div>`}
    h+=`<div class="sec"><h3>Roster · ${CARDS.length} characters</h3>${filterHTML()}<div class="cards">${rosterList().map(c=>cardHTML(c)).join('')}</div></div>`+rulesHTML();
    side.innerHTML=h;bindSide();return;
  }
  const ph=S.phase;
  if(ph==='lobby'){
    const full=S.seats.every(Boolean);
    h+=`<div class="sec"><h2>Game ${esc(S.code)}</h2><p class="muted">${LOCAL?'Same-device game.':DESKTOP?'Friends connect to your computer'+(ui.net&&ui.net.ips.length&&ui.server.startsWith('localhost')?' (<b>'+ui.net.ips.map(esc).join('</b> or <b>')+'</b>)':'')+', then join with code <b>'+esc(S.code)+'</b>.':'Share the code <b>'+esc(S.code)+'</b> with friends. They open this page and join with it.'}</p></div>
    <div class="sec"><h3>Seats</h3>${seatsHTML()}</div>
    ${isHost()&&!full?`<div class="row"><button class="btn sm" id="fillLocal">Fill empty seats on this device</button></div>`:''}
    ${DESKTOP&&!LOCAL&&isHost()&&isLocalServer()&&ui.net&&ui.net.ok?`<div class="sec"><h3>Invite over the internet</h3>
      ${publicAddr()?`<p class="muted">Your router opened the game port, so friends anywhere can type <b>${esc(publicAddr())}</b> into Network → Connect. Invite codes work too.</p>`:''}
      <p class="muted">Make one invite per friend. They paste it into Shardscape and send you back a reply code.</p>
      <div class="row"><button class="btn" id="mkInvite">${rtc.invite?'New invite code':'Create invite code'}</button></div>
      ${rtc.invite?`<textarea id="invCode" rows="3" readonly spellcheck="false">${esc(rtc.invite)}</textarea><div class="row"><button class="btn sm" id="copyInv">Copy invite</button></div>
      <textarea id="replyIn" rows="2" placeholder="Paste your friend’s reply code (SSR-…)" spellcheck="false"></textarea><div class="row"><button class="btn primary" id="useReply">Connect friend</button></div>`:''}
      ${rtc.status?`<p class="muted">${esc(rtc.status)}</p>`:''}
      ${rtc.peers?`<p><b>${rtc.peers}</b> internet player${rtc.peers>1?'s':''} connected.</p>`:''}
    </div>`:''}
    <div class="sec">${isHost()?`<button class="btn primary" id="toMap" ${full?'':'disabled'}>Build the battlefield</button>${full?'':'<p class="muted">Waiting for every seat to fill.</p>'}`:'<p class="muted">Waiting for the host to start.</p>'}</div>`;
  }
  else if(ph==='map'){
    h+=`<div class="sec"><h2>Battlefield editor</h2><p class="muted">${isHost()?'Shape the ground, then mark where each army starts.':'The host is building the map. It updates live.'}</p></div>`;
    if(isHost()){
      h+=`<div class="sec"><h3>Tool</h3><div class="row">${[['raise','Raise'],['lower','Lower'],['paint','Repaint'],['zone','Start zone']].map(([k,n])=>`<button class="btn sm ${ui.tool===k?'on':''}" data-tool="${k}">${n}</button>`).join('')}</div></div>`;
      if(ui.tool==='zone')h+=`<div class="sec"><h3>Zone for</h3><div class="row">${S.seats.map((_,i)=>`<button class="btn sm ${ui.zoneSeat===i?'on':''}" data-zs="${i}"><span class="sw" style="background:${SEATC[i]}"></span> ${esc(seatName(S,i))}</button>`).join('')}</div></div>`;
      else h+=`<div class="sec"><h3>Terrain</h3><div class="terr">${Object.entries(TERR).map(([k,t])=>`<button class="btn ${ui.terr===k?'on':''}" data-terr="${k}" title="${esc(TERR_NOTE[k])}"><span class="sw" style="background:${t.top}"></span>${t.n}</button>`).join('')}</div></div>`;
      h+=`<div class="sec"><h3>Start from a layout</h3><div class="row">${[['hills','Rolling Hills'],['lava','Lava Rift'],['islands','Twin Isles'],['frozen','Frozen Peaks'],['swamp','Swamp Delta'],['castle','Castle Siege'],['flat','Open Field']].map(([k,n])=>`<button class="btn sm" data-gen="${k}">${n}</button>`).join('')}<button class="btn sm" id="autoZ">Auto zones</button></div></div>
      <div class="sec"><h3>Board size · ${esc(boardName(S.R||9))}</h3><div class="row">${BOARDS.map(([r,nm])=>`<button class="btn sm ${(S.R||9)===r?'on':''}" data-bsize="${r}">${nm}</button>`).join('')}<button class="btn sm" id="clearMap">Clear</button></div></div>
      <div class="sec"><button class="btn primary" id="toDraft">Lock map and start draft</button></div>`;
    }
    h+=`<div class="sec"><h3>Players</h3>${seatsHTML()}</div>`;
  }
  else if(ph==='draft'){
    const seat=draftSeat(S);const me=ctl(seat);const t=taken(S);const left=budgetFor(S,seat)-pts(S,seat);
    h+=`<div class="banner" style="border-left-color:${SEATC[seat]}">${me?(LOCAL?esc(seatName(S,seat))+', your pick':'Your pick'):esc(seatName(S,seat))+' is picking'} · ${left} pts left</div>
    <div class="sec"><h3>Players</h3>${seatsHTML(seat)}</div>
    ${me?`<div class="row"><button class="btn sm" id="passDraft">Stop drafting</button></div>`:''}
    <div class="sec"><h3>Roster</h3>${filterHTML(true)}<div class="cards">${rosterList(me?left:null).map(c=>{let owner=null;for(const k in S.army)if(S.army[k].includes(c.id))owner=+k;
      const can=me&&owner===null&&c.p<=left;
      return cardHTML(c,{taken:owner!==null||c.p>left&&me,pick:can,extra:owner!==null?`<span class="owner" style="color:${SEATC[owner]}">${esc(seatName(S,owner))}</span>`:''})}).join('')}</div></div>`;
  }
  else if(ph==='deploy'){
    const seat=S.deploy.seat;const me=ctl(seat);const mine=S.units.filter(u=>u.o===seat);const un=mine.filter(u=>!u.k);
    h+=`<div class="banner" style="border-left-color:${SEATC[seat]}">${me?esc(seatName(S,seat))+': deploy your army':esc(seatName(S,seat))+' is deploying'}</div>`;
    if(me){h+=`<div class="sec"><p class="muted">Pick a figure, then click an open hex in your zone. Click a placed figure to pick it up.</p><div class="row"><button class="btn sm" id="autoDep">Auto-deploy</button><button class="btn primary" id="doneDep" ${un.length?'disabled':''}>Ready</button></div></div>
      <div class="sec"><h3>To place · ${un.length}</h3><div class="cards">${[...new Set(un.map(u=>u.card))].map(cid=>{const n=un.filter(u=>u.card===cid).length;const sel=ui.deploySel&&S.units.find(u=>u.id===ui.deploySel)?.card===cid;return `<div data-dep="${cid}">${cardHTML(CARD[cid],{pick:true,sel,extra:`<span class="owner">${n} to place</span>`})}</div>`}).join('')||'<p class="muted">All placed. Press Ready.</p>'}</div></div>`}
    h+=`<div class="sec"><h3>Players</h3>${seatsHTML(seat)}</div>`;
  }
  else if(ph==='battle'||ph==='over'){
    const t=S.turn;
    if(ph==='over')h+=`<div class="banner" style="border-left-color:${S.winner>=0?SEATC[S.winner]:'var(--brass)'}">${S.winner>=0?esc(seatName(S,S.winner))+' is victorious':'The battle ends in a draw'}</div>${isHost()?`<div class="row"><button class="btn primary" id="rematch">Rematch on this map</button><button class="btn" id="newMap">New map</button></div>`:''}`;
    else if(classic(S)&&t.stage==='orders')h+=ordersHTML();
    else{const me=ctl(t.seat);
      if(classic(S))h+=`<div class="banner" style="border-left-color:${SEATC[t.seat]}">Round ${t.round} · Order ${t.marker} · ${me?(LOCAL?esc(seatName(S,t.seat))+"'s turn":'Your turn'):esc(seatName(S,t.seat))+' is acting'} · ${esc(CARD[t.card].n)}</div>`;
      else h+=`<div class="banner" style="border-left-color:${SEATC[t.seat]}">Round ${t.round}/${maxRounds(S)} · turn ${t.idx+1}/${t.order.length} · ${me?(LOCAL?esc(seatName(S,t.seat))+"'s turn":'Your turn'):esc(seatName(S,t.seat))+' is acting'}</div>`;
      if(me){
        const cards=classic(S)?[t.card]:[...new Set(S.units.filter(u=>u.o===t.seat&&u.hp>0&&u.k).map(u=>u.card))];
        h+=`<div class="sec"><h3>${t.card?'Activated':'Choose a card to activate'}</h3><p class="muted">${t.card?(t.attacking?'Attacking: pick a figure, then a red-ringed target.':'Move figures (yellow hexes), then attack. Attacking ends movement.'):'Click a card or one of its figures on the board.'}</p>
        <div class="cards">${cards.map(cid=>{const us=S.units.filter(u=>u.card===cid&&u.o===t.seat&&u.hp>0);
          const status=us.map(u=>`<span class="tag" title="Life">${CARD[cid].hp>1?'♥'+u.hp:'●'}${t.card===cid?(t.moved[u.id]?' moved':'')+((t.atk[u.id]||0)?' attacked':''):''}</span>`).join('');
          return `<div data-act="${cid}">${cardHTML(CARD[cid],{pick:!t.card||t.card===cid,sel:t.card===cid,taken:t.card&&t.card!==cid,extra:status})}</div>`}).join('')}</div></div>
        <div class="row"><button class="btn primary" id="endTurn">${t.card?'End turn':'Pass turn'}</button></div>`;
      }
      if(classic(S))h+=myMarkersHTML();
    }
    h+=rollHTML();
    if(ui.detail)h+=`<div class="sec"><h3>Inspecting</h3>${cardHTML(CARD[ui.detail])}</div>`;
    h+=`<div class="sec"><h3>Armies</h3>${S.seats.map((x,i)=>{const al=S.units.filter(u=>u.o===i&&u.hp>0).length,tot=S.units.filter(u=>u.o===i).length;return `<div class="seat ${ph==='battle'&&t.seat===i?'active':''}"><span class="dot" style="background:${SEATC[i]}"></span><span class="nm">${esc(seatName(S,i))}${x&&!LOCAL&&x.id===myId?' (you)':''}</span><span class="muted">${al}/${tot} figures</span></div>`}).join('')}</div>`;
  }
  if(ph!=='lobby'&&ph!=='battle'&&ph!=='over')h+=rollHTML();
  if(LOCAL&&S.bots&&Object.keys(S.bots).length&&ph!=='over'){const ctrl=`<div class="sec"><h3>Bot speed</h3><div class="row">${['slow','normal','fast'].map(k=>`<button class="btn sm ${ui.botSpeed===k?'on':''}" data-bspeed="${k}">${k[0].toUpperCase()+k.slice(1)}</button>`).join('')}<button class="btn sm" id="botPause">${ui.botPaused?'▶ Resume':'❚❚ Pause'}</button></div>
      <details ${ui.diffOpen?'open':''} id="diffBox"><summary>Change bot difficulty</summary><div class="sec" style="margin-top:8px">${Object.keys(S.bots).map(i=>`<div class="seat"><span class="dot" style="background:${SEATC[i]}"></span><span class="nm">${esc(seatName(S,+i))}</span>
        <select data-botlv="${i}" aria-label="Difficulty for ${esc(seatName(S,+i))}">${LEVELS.map(l=>`<option value="${l}" ${S.bots[i]===l?'selected':''}>${LV_NAME[l]}</option>`).join('')}</select></div>`).join('')}
        <p class="muted">${S.phase==='draft'?'Point bonuses apply to picks from now on.':'Point bonuses only apply while drafting; play strength changes right away.'}</p></div></details></div>`;
    const i=h.indexOf('</div>',h.indexOf('class="banner"'));h=i>0?h.slice(0,i+6)+ctrl+h.slice(i+6):ctrl+h}
  h+=logHTML()+rulesHTML()+`<div class="row"><button class="btn sm" id="leave">Leave game</button></div>`;
  side.innerHTML=h;bindSide();
}
function on(id,f){const e=document.getElementById(id);if(e)e.onclick=f}
function bindSide(){
  const nm=document.getElementById('nm');if(nm)nm.oninput=()=>{ui.name=nm.value.trim();lsSet('ss-name',ui.name)};
  on('hostOnline',()=>createGame(+document.getElementById('np').value,+document.getElementById('nb').value,false,null,ui.onR||null));
  const offN=document.getElementById('offN');if(offN)offN.onchange=()=>{ui.off.n=+offN.value;renderSide()};
  const offB=document.getElementById('offB');if(offB)offB.onchange=()=>{ui.off.b=+offB.value};
  side.querySelectorAll('[data-offseat]').forEach(el=>el.onchange=()=>{ui.off.seats[+el.dataset.offseat]=el.value});
  side.querySelectorAll('[data-allbots]').forEach(b=>b.onclick=()=>{const lv=b.dataset.allbots;const any=ui.off.seats.slice(0,ui.off.n).some(x=>x!=='human');ui.off.seats=ui.off.seats.map(x=>x==='human'&&any?x:lv);renderSide()});
  const offR=document.getElementById('offR');if(offR)offR.onchange=()=>{ui.off.r=+offR.value};
  const nr=document.getElementById('nr');if(nr)nr.onchange=()=>{ui.onR=+nr.value};
  on('startOff',()=>createGame(ui.off.n,ui.off.b,true,ui.off.seats.slice(0,ui.off.n),ui.off.r||null));
  on('watchBots',()=>{ui.botPaused=false;createGame(ui.off.n,ui.off.b,true,ui.off.seats.slice(0,ui.off.n).map(x=>x==='human'?'normal':x),ui.off.r||null)});
  side.querySelectorAll('[data-bspeed]').forEach(b=>b.onclick=()=>{ui.botSpeed=b.dataset.bspeed;renderSide()});
  const db_=document.getElementById('diffBox');if(db_)db_.ontoggle=()=>{ui.diffOpen=db_.open};
  side.querySelectorAll('[data-botlv]').forEach(el=>el.onchange=()=>{const i=+el.dataset.botlv,v=el.value;
    commit(s=>{s.bots[i]=v;if(s.seats[i])s.seats[i].name=s.seats[i].name.replace(/\([^)]*\)$/,'('+LV_NAME[v]+')');log(s,seatName(s,i)+' is now '+LV_NAME[v]+'.')});normDraftNow()});
  on('botPause',()=>{ui.botPaused=!ui.botPaused;renderSide();if(!ui.botPaused)botTick()});
  side.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{ui.filter=b.dataset.filter;renderSide()});
  const sb=document.getElementById('sortBy');if(sb)sb.onchange=()=>{ui.sort=sb.value;renderSide()};
  const rq=document.getElementById('rq');if(rq)rq.oninput=()=>{ui.q=rq.value;applySearch()};
  applySearch();
  [['jc','jcDraft'],['srv','srvDraft'],['invIn','inviteDraft'],['replyIn','replyDraft']].forEach(([id,key])=>{const e=document.getElementById(id);if(e){if(ui[key]!=null&&!e.value)e.value=ui[key];e.addEventListener('input',()=>ui[key]=e.value)}});
  on('joinBtn',()=>joinGame(document.getElementById('jc').value));
  on('srvBtn',()=>connectServer(document.getElementById('srv').value||('localhost:'+((ui.net&&ui.net.port)||47800))));
  const srv=document.getElementById('srv');if(srv)srv.onkeydown=e=>{if(e.key==='Enter')connectServer(srv.value)};
  on('srvLocal',()=>connectServer('localhost:'+((ui.net&&ui.net.port)||47800)));
  on('useInv',()=>guestUseInvite(document.getElementById('invIn').value));
  on('copyRep',()=>copyText('repCode'));
  on('mkInvite',()=>hostInvite().catch(()=>{rtc.status='Could not create an invite on this computer.';renderSide()}));
  on('copyInv',()=>copyText('invCode'));
  on('useReply',()=>hostAcceptReply(document.getElementById('replyIn').value));
  const jc=document.getElementById('jc');if(jc)jc.onkeydown=e=>{if(e.key==='Enter')joinGame(jc.value)};
  side.querySelectorAll('[data-join]').forEach(b=>b.onclick=()=>joinGame(b.dataset.join));
  side.querySelectorAll('[data-seat]').forEach(b=>b.onclick=()=>takeSeat(+b.dataset.seat));
  on('fillLocal',()=>commit(s=>{s.seats=s.seats.map((x,i)=>x||{id:myId,name:'Player '+(i+1)})}));
  on('toMap',()=>commit(s=>{s.phase='map';log(s,'The host is building the battlefield.')}));
  side.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>{ui.tool=b.dataset.tool;renderSide()});
  side.querySelectorAll('[data-terr]').forEach(b=>b.onclick=()=>{ui.terr=b.dataset.terr;if(ui.tool==='lower')ui.tool='raise';renderSide()});
  side.querySelectorAll('[data-zs]').forEach(b=>b.onclick=()=>{ui.zoneSeat=+b.dataset.zs;renderSide()});
  side.querySelectorAll('[data-gen]').forEach(b=>b.onclick=()=>commit(s=>{s.map=genMap(b.dataset.gen);autoZones(s)}));
  on('autoZ',()=>commit(s=>autoZones(s)));
  side.querySelectorAll('[data-bsize]').forEach(b=>b.onclick=()=>{const r=+b.dataset.bsize;commit(s=>{s.R=r;R=r;s.map=genMap('hills');autoZones(s);log(s,'Board resized to '+boardName(r)+'.')});ui.zoom=1;ui.pan={x:0,y:0};draw()});
  on('clearMap',()=>commit(s=>{s.map={};for(let q=-R;q<=R;q++)for(let r=-R;r<=R;r++)if(inBoard(q,r)&&dist([q,r],[0,0])<=6)s.map[K(q,r)]='g';s.zones={}}));
  on('toDraft',()=>{
    const bad=S.seats.findIndex((_,i)=>!Object.values(S.zones).includes(i));
    commit(s=>{if(bad>=0)autoZones(s);startDraft(s)});
  });
  side.querySelectorAll('[data-pick]').forEach(el=>{
    const act=()=>{const id=el.dataset.pick;
      if(S&&S.phase==='draft'){if(ctl(draftSeat(S)))draftPick(id)}
      else if(S&&S.phase==='deploy'){const u=S.units.find(x=>x.card===id&&x.o===S.deploy.seat&&!x.k);ui.deploySel=u?u.id:null;renderSide()}
      else if(S&&S.phase==='battle'){const t=S.turn;if(t.stage==='orders'||!ctl(t.seat))return;const started=Object.keys(t.moved).length||t.attacking;if(classic(S)&&t.card!==id)return;if(t.card&&t.card!==id&&started)return;
        if(t.card!==id)commit(s=>{s.turn.card=id});const u=S.units.find(x=>x.card===id&&x.o===t.seat&&x.hp>0&&x.k);ui.sel=u?u.id:null;renderAll()}};
    el.onclick=act;el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();act()}};
  });
  on('passDraft',draftPass);
  on('autoDep',()=>commit(s=>autoDeploy(s,s.deploy.seat)));
  on('doneDep',()=>{ui.deploySel=null;commit(s=>{log(s,seatName(s,s.deploy.seat)+' is deployed.');nextDeploy(s)})});
  side.querySelectorAll('[data-ord]').forEach(el=>el.onchange=()=>{if(ui.ordDraft)ui.ordDraft[el.dataset.ord]=el.value});
  on('lockOrders',lockMyOrders);
  on('endTurn',()=>{ui.sel=null;ui.detail=null;commit(s=>{log(s,seatName(s,s.turn.seat)+(s.turn.card?' ends the turn of '+CARD[s.turn.card].n:' passes')+'.');endTurn(s)})});
  on('rematch',()=>commit(s=>{startDraft(s)}));
  on('newMap',()=>commit(s=>{s.phase='map';s.units=[];s.army={};s.turn=null;s.winner=null;s.roll=null}));
  on('leave',leave);
}
function flashRoll(){const d=document.getElementById('dicebox');if(!d||matchMedia('(prefers-reduced-motion:reduce)').matches)return;d.animate([{transform:'scale(.96)',opacity:.4},{transform:'scale(1)',opacity:1}],{duration:280})}
function renderChips(){
  const c=document.getElementById('chips');
  if(!S){c.innerHTML=`<span class="chip">${DESKTOP?(ui.dbReady?'Network play ready':'Connecting…'):ui.dbReady?'Online play ready':'Same-device play'}</span>`;return}
  const names={lobby:'Lobby',map:'Building map',draft:'Draft',deploy:'Deployment',battle:'Battle',over:'Game over'};
  c.innerHTML=`<span class="chip">Game <b>${esc(S.code)}</b></span><span class="chip"><b>${names[S.phase]}</b></span><span class="chip">${S.budget} pts · ${S.n} players</span>${readOnly?'<span class="chip">Watching</span>':''}`;
}
function renderAll(){syncR();renderChips();renderSide();draw();updateHint();botTick()}
