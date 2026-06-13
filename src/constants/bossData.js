export const BOSS_LEVELS = [
  { key:"minion",   label:"Minion",   icon:"🟢", timer:30, questions:10, xp:80,  coins:15, gems:0,  penalty:10 },
  { key:"warrior",  label:"Warrior",  icon:"🟡", timer:25, questions:12, xp:150, coins:25, gems:2,  penalty:10 },
  { key:"champion", label:"Champion", icon:"🟠", timer:20, questions:15, xp:250, coins:40, gems:5,  penalty:10 },
  { key:"legend",   label:"Legend",   icon:"🔴", timer:15, questions:15, xp:400, coins:60, gems:8,  penalty:10 },
  { key:"god",      label:"Cosmic God",icon:"⚫",timer:12, questions:20, xp:600, coins:100,gems:15, penalty:10 },
];

export const BOSSES = {
  10: [ // Nursery — Forest Monsters — no XP penalty
    { id:"n_b1", name:"Grumpy Mushroom",  emoji:"🍄", theme:"Counting & Colors",    levels:["minion","warrior","champion"], penalty:false },
    { id:"n_b2", name:"Sleepy Bear",       emoji:"🐻", theme:"Shapes & Sizes",       levels:["minion","warrior","champion"], penalty:false },
    { id:"n_b3", name:"Sneaky Fox",        emoji:"🦊", theme:"Animals & Patterns",   levels:["minion","warrior","champion"], penalty:false },
  ],
  11: [ // Jr KG — Ocean Creatures — no XP penalty
    { id:"jk_b1", name:"Cranky Crab",     emoji:"🦀", theme:"Numbers 1-10",          levels:["minion","warrior","champion"], penalty:false },
    { id:"jk_b2", name:"Grumpy Octopus",  emoji:"🐙", theme:"Addition to 10",        levels:["minion","warrior","champion"], penalty:false },
    { id:"jk_b3", name:"Angry Shark",     emoji:"🦈", theme:"More & Less",           levels:["minion","warrior","champion"], penalty:false },
  ],
  12: [ // Sr KG — Sky Dragons — no XP penalty
    { id:"sk_b1", name:"Thunder Lizard",  emoji:"🦎", theme:"Numbers 1-20",          levels:["minion","warrior","champion"], penalty:false },
    { id:"sk_b2", name:"Storm Bat",       emoji:"🦇", theme:"Addition & Subtraction",levels:["minion","warrior","champion"], penalty:false },
    { id:"sk_b3", name:"Ice Serpent",     emoji:"🐍", theme:"Shapes & Money",        levels:["minion","warrior","champion"], penalty:false },
  ],
  1: [ // Class 1 — Space Invaders
    { id:"c1_b1", name:"Asteroid Golem",  emoji:"🪨", theme:"Numbers & Counting",    levels:["minion","warrior","champion","legend"] },
    { id:"c1_b2", name:"Plasma Wraith",   emoji:"👻", theme:"Addition & Subtraction",levels:["minion","warrior","champion","legend"] },
    { id:"c1_b3", name:"Comet Crusher",   emoji:"☄️", theme:"Shapes & Measurement", levels:["minion","warrior","champion","legend"] },
    { id:"c1_b4", name:"Void Stalker",    emoji:"🌑", theme:"Time & Money",          levels:["minion","warrior","champion","legend"] },
    { id:"c1_b5", name:"Galaxy Reaper",   emoji:"💀", theme:"Mixed Class 1",         levels:["minion","warrior","champion","legend"] },
  ],
  2: [ // Class 2 — Lava Giants
    { id:"c2_b1", name:"Magma Troll",     emoji:"🧌", theme:"Numbers to 1000",       levels:["minion","warrior","champion","legend"] },
    { id:"c2_b2", name:"Lava Golem",      emoji:"🌋", theme:"Addition & Subtraction",levels:["minion","warrior","champion","legend"] },
    { id:"c2_b3", name:"Fire Hydra",      emoji:"🐲", theme:"Multiplication",        levels:["minion","warrior","champion","legend"] },
    { id:"c2_b4", name:"Ember Titan",     emoji:"🔥", theme:"Measurement & Time",    levels:["minion","warrior","champion","legend"] },
    { id:"c2_b5", name:"Inferno Lord",    emoji:"😈", theme:"Mixed Class 2",         levels:["minion","warrior","champion","legend"] },
  ],
  3: [ // Class 3 — Ice Titans
    { id:"c3_b1", name:"Frost Giant",     emoji:"🧊", theme:"Numbers & Place Value", levels:["minion","warrior","champion","legend","god"] },
    { id:"c3_b2", name:"Blizzard Wraith", emoji:"❄️", theme:"Multiplication",        levels:["minion","warrior","champion","legend","god"] },
    { id:"c3_b3", name:"Glacier Golem",   emoji:"🏔️", theme:"Fractions",             levels:["minion","warrior","champion","legend","god"] },
    { id:"c3_b4", name:"Arctic Hydra",    emoji:"🐉", theme:"Measurement & Time",    levels:["minion","warrior","champion","legend","god"] },
    { id:"c3_b5", name:"Polar Demon",     emoji:"👹", theme:"Geometry",              levels:["minion","warrior","champion","legend","god"] },
    { id:"c3_b6", name:"Tundra God",      emoji:"🌨️", theme:"Mixed Class 3",         levels:["minion","warrior","champion","legend","god"] },
  ],
  4: [ // Class 4 — Shadow Demons
    { id:"c4_b1", name:"Shadow Lurker",   emoji:"🕷️", theme:"Large Numbers",         levels:["minion","warrior","champion","legend","god"] },
    { id:"c4_b2", name:"Dark Phantom",    emoji:"🦇", theme:"Factors & Multiples",   levels:["minion","warrior","champion","legend","god"] },
    { id:"c4_b3", name:"Void Dragon",     emoji:"🐉", theme:"Fractions & Decimals",  levels:["minion","warrior","champion","legend","god"] },
    { id:"c4_b4", name:"Nightmare Beast", emoji:"👾", theme:"Geometry & Angles",     levels:["minion","warrior","champion","legend","god"] },
    { id:"c4_b5", name:"Chaos Titan",     emoji:"🤖", theme:"Perimeter & Area",      levels:["minion","warrior","champion","legend","god"] },
    { id:"c4_b6", name:"Abyss Walker",    emoji:"💀", theme:"Mixed Class 4",         levels:["minion","warrior","champion","legend","god"] },
  ],
  5: [ // Class 5 — Cosmic Gods
    { id:"c5_b1", name:"Nebula Serpent",  emoji:"🌀", theme:"Large Numbers & Ops",   levels:["minion","warrior","champion","legend","god"] },
    { id:"c5_b2", name:"Quasar Demon",    emoji:"⚡", theme:"LCM & HCF",             levels:["minion","warrior","champion","legend","god"] },
    { id:"c5_b3", name:"Black Hole Lord", emoji:"🌑", theme:"Fractions & Decimals",  levels:["minion","warrior","champion","legend","god"] },
    { id:"c5_b4", name:"Pulsar Giant",    emoji:"💫", theme:"Percentage",            levels:["minion","warrior","champion","legend","god"] },
    { id:"c5_b5", name:"Dark Matter God", emoji:"🔮", theme:"Geometry & Symmetry",   levels:["minion","warrior","champion","legend","god"] },
    { id:"c5_b6", name:"Event Horizon",   emoji:"🕳️", theme:"Area & Volume",         levels:["minion","warrior","champion","legend","god"] },
    { id:"c5_b7", name:"The Cosmos",      emoji:"🌌", theme:"Mixed Class 5",         levels:["minion","warrior","champion","legend","god"] },
  ],
};
