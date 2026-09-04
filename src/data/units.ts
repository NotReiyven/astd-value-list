import { MasterUnit } from "../types";

export interface UnitMeta {
  name?: string;
  subtitle?: string;
  aliases?: string[];
  notice?: string;
  obtainability?: "OBT" | "UNOB";
}

export const UNIT_METADATA: Record<string, UnitMeta> = {
  // Top S Tier
  "demise": { subtitle: "Rem Shinigami", aliases: ["rem shinigami"], notice: "Obtainable from winning the VOTW contest. 3 Copies exist.", obtainability: "UNOB" },
  "galaxy-girl": { subtitle: "Sasaki Miyo", aliases: ["sasaki miyo", "fem gojo", "female gojo"], notice: "Female Gojo reskin, GAME contributor unit.", obtainability: "UNOB" },
  "beardcutter": { subtitle: "Goblin Slayer", aliases: ["goblin slayer", "brick slayer", "gob", "gob slayer"], notice: "Given out during Pucci update for Wiki workers.", obtainability: "UNOB" },
  "ul-borul-alt": { subtitle: "Ultra DBZ Broly", aliases: ["ultra legendary borul (alternative)", "ultra legendary borul", "ultra dbz broly", "ultra broly", "udbz", "ultra dbz", "LSSJ Broly"], obtainability: "UNOB" },
  "ultra-legendary-borul-alternative": { subtitle: "Ultra DBZ Broly", aliases: ["ultra legendary borul (alternative)", "ultra legendary borul", "ultra dbz broly", "ultra broly", "udbz", "ultra dbz", "LSSJ Broly"], obtainability: "UNOB" },
  "death": { subtitle: "Ryuk", aliases: ["ryuk"], notice: "Obtainable from winning the VOTW contest.", obtainability: "UNOB" },
  "two-hands": { subtitle: "Revy", aliases: ["revy"], notice: "Obtainable by being level 150 in main server.", obtainability: "UNOB" },
  "brol-alt": { subtitle: "DBZ Broly", aliases: ["legendary borul (alternative)", "legendary borul", "dbz broly", "dbz"], obtainability: "UNOB" },
  "legendary-borul-alternative": { subtitle: "DBZ Broly", aliases: ["legendary borul (alternative)", "legendary borul", "dbz broly", "dbz"], obtainability: "UNOB" },

  // Mid S Tier
  "slayer-mage": { subtitle: "Frieren", aliases: ["frieren"], obtainability: "UNOB" },
  "bunny-girl": { subtitle: "Mai Sakurajima", aliases: ["mai sakurajima", "mai", "bunny girl"], obtainability: "UNOB" },
  "frost-moon": { subtitle: "Douma", aliases: ["douma"], obtainability: "UNOB" },
  "gold-dark-wing": { subtitle: "Gold Ulquiorra", aliases: ["gold ulquiorra", "gold ulq", "gulq", "g ulq", "g ulg"], obtainability: "UNOB" },
  "club-beast": { subtitle: "Kaido", aliases: ["kaido", "kido", "kaidupe", "kaiblue"], obtainability: "UNOB" },
  "old-will": { subtitle: "Yamamoto", aliases: ["yamamoto", "yama"], obtainability: "UNOB" },
  "light-rock-blaster": { subtitle: "Shiny Stella", aliases: ["shiny stella", "lrb", "light rock"], obtainability: "OBT" },
  "first-wood-bender": { subtitle: "Hashirama", aliases: ["hashirama", "hashi"], obtainability: "UNOB" },

  // Low S Tier
  "gold-flame-servant": { subtitle: "Gold Senji Muramasa", aliases: ["gold senji muramasa", "golden muramasa", "gold mura", "gmura", "g mura", "gold senji", "g senji", "gsenji"], obtainability: "UNOB" },
  "kageni": { subtitle: "Cid Kagenou", aliases: ["cid kagenou", "cid", "kageni"], obtainability: "UNOB" },
  "illusiva": { subtitle: "Nero Padoru", aliases: ["nero padoru", "padoru"], obtainability: "UNOB" },
  "gold-jinjou": { subtitle: "Gold Cumber", aliases: ["gold cumber", "gjinjou", "gcumber", "gold cucumber"], obtainability: "UNOB" },
  "ikki-anni": { subtitle: "Anniversary Ichigo", aliases: ["anniversary ichigo", "anni ichigo", "anni"], obtainability: "UNOB" },
  "gold-tomi": { subtitle: "Gold Tobi", aliases: ["gold tobi", "gtobi", "gtomi"], obtainability: "UNOB" },
  "ultra-kovegu": { subtitle: "SSJ3 Gogeta", aliases: ["ssj3 gogeta", "ssj3", "ultra gogeta"], obtainability: "UNOB" },
  "gold-martial-artist": { subtitle: "Gold Jin Mori", aliases: ["gold jin mori", "gmori", "gjin", "gold mori", "gold jm"], obtainability: "UNOB" },
  "challenger-flaming-tiger": { subtitle: "Challenger Rengoku", aliases: ["challenger rengoku", "cren", "c.ren", "rengoku"], obtainability: "UNOB" },

  // Top A Tier
  "nurse-heart": { subtitle: "Female Law", aliases: ["female law", "fem law", "flaw", "felaw"], obtainability: "UNOB" },
  "dark-rock-blaster": { subtitle: "Stella", aliases: ["stella", "drb", "dark rock"], obtainability: "OBT" },
  "ikki-quin": { subtitle: "Quincy Ichigo", aliases: ["quincy ichigo", "quin", "quincy", "quincygo"], obtainability: "UNOB" },
  "twister": { subtitle: "Monkey D. Dragon", aliases: ["monkey d. dragon", "dragon"], obtainability: "UNOB" },
  "flame-servant": { subtitle: "Senji Muramasa", aliases: ["senji muramasa", "senji", "mura", "muramasa", "masa"], obtainability: "UNOB" },
  "water-goddess": { subtitle: "Aqua", aliases: ["aqua", "konosuba"], obtainability: "UNOB" },
  "the-ripper": { subtitle: "Riyo Reaper", aliases: ["riyo reaper", "riyo", "riyou", "rippa"], obtainability: "UNOB" },
  "zaruto-grr-iii": { subtitle: "Naruto (GRR III)", aliases: ["naruto (grr iii)", "naruto grr 3", "grr3", "grr 3", "zaruto grr3"], obtainability: "UNOB" },
  "dark-wing": { subtitle: "Ulquiorra", aliases: ["ulquiorra", "ulq"], obtainability: "UNOB" },
  "leaf": { subtitle: "Koishi Komeji", aliases: ["koishi komeji"], obtainability: "UNOB" },
  "crimson-mommy": { subtitle: "Rias Gremory", aliases: ["rias gremory", "rias", "crimson", "mommy"], obtainability: "UNOB" },
  "koku-red-spirit-x50": { subtitle: "Goku Kaioken x50", aliases: ["goku kaioken x50", "x50"], obtainability: "UNOB" },
  "godpa": { subtitle: "Champa", aliases: ["champa"], obtainability: "UNOB" },
  "varaq": { subtitle: "Sinbad", aliases: ["sinbad"], obtainability: "UNOB" },
  "arot-supa": { subtitle: "Super Saiyan Bardock", aliases: ["super saiyan bardock", "bardock"], obtainability: "UNOB" },

  // High A Tier
  "perfect-insect": { subtitle: "Cell Ballin", aliases: ["cell ballin", "cell", "perfect insect", "cellballing", "the goat", "baller", "ballin"], obtainability: "UNOB" },
  "jinjou": { subtitle: "Cumber", aliases: ["cumber", "jinj"], obtainability: "UNOB" },
  "mr-random": { subtitle: "Mr. Random", aliases: ["mr random"], obtainability: "UNOB" },
  "spirit-knight": { subtitle: "Julius Juukulius", aliases: ["julius juukulius", "julis", "julius"], obtainability: "UNOB" },
  "zaruto-mecha": { subtitle: "Mecha Naruto", aliases: ["mecha naruto"], obtainability: "UNOB" },
  "platinum-god": { subtitle: "Mirai Kakehashi", aliases: ["mirai kakehashi", "plat god"], obtainability: "UNOB" },
  "green-needle": { subtitle: "Illumi Zoldyck", aliases: ["illumi zoldyck", "illumi"], obtainability: "UNOB" },
  "haaland-exhibition": { subtitle: "Shiny Michael Kaiser", aliases: ["shiny michael kaiser", "shiny kaiser", "Haaland (First Exhibition)"], obtainability: "OBT" },
  "zaruto-grr-ii": { subtitle: "Naruto (GRR II)", aliases: ["naruto (grr ii)", "naruto grr 2"], obtainability: "UNOB" },
  "tomi": { subtitle: "Tobi", aliases: ["tobi"], obtainability: "UNOB" },
  "koku-red-spirit-x25": { subtitle: "Goku Kaioken x25", aliases: ["goku kaioken x25"], obtainability: "UNOB" },
  "expert-sorcerer": { subtitle: "Normal Reigen", aliases: ["normal reigen", "reigen"], obtainability: "UNOB" },
  "martial-artist": { subtitle: "Jin Mori", aliases: ["jin mori", "jinmori", "mori"], obtainability: "UNOB" },
  "spade-dark": { subtitle: "Dark Ace", aliases: ["dark ace", "dace"], obtainability: "UNOB" },
  "heaven-zio": { subtitle: "Heaven DIO", aliases: ["heaven dio", "hdio", "h dio"], obtainability: "UNOB" },
  "oni-princess-hybrid": { subtitle: "Yamato 6*", aliases: ["yamato 6*", "yamato 6 star", "yama 6"], obtainability: "OBT" },

  // Mid A Tier
  "ghost-girl": { subtitle: "Perona", aliases: ["perona"], obtainability: "UNOB" },
  "bot-12-lab": { subtitle: "Android 21 (Lab Coat)", aliases: ["android 21 (lab coat)", "bot lab", "android 21", "bot 21 lab", "bot 21", "a21 lab", "a21", "lab", "lab bot", "bot 12"], obtainability: "UNOB" },
  "masochist-lady": { subtitle: "Darkness", aliases: ["darkness"], obtainability: "UNOB" },
  "koku-red-spirit-x5": { subtitle: "Goku Kaioken x5", aliases: ["goku kaioken x5"], obtainability: "UNOB" },
  "jozu": { subtitle: "Juuzou", aliases: ["juuzou", "diamond jozu"], obtainability: "UNOB" },
  "shadow-zio": { subtitle: "Shadow DIO", aliases: ["shadow dio", "sdio", "s dio"], obtainability: "UNOB" },
  "ziego": { subtitle: "Diego Brando", aliases: ["diego brando"], obtainability: "UNOB" },
  "haaland-blue": { subtitle: "Michael Kaiser", aliases: ["michael kaiser", "kaiser"], obtainability: "OBT" },
  "anti-magician-demon": { subtitle: "Liebe", aliases: ["liebe"], obtainability: "UNOB" },
  "kovegu-alternative": { subtitle: "Looksmaxxing Gogeta", aliases: ["looksmaxxing gogeta", "kovegu alt", "gogeta alt"], obtainability: "UNOB" },
  "zaruto-grr-i": { subtitle: "Naruto (GRR 1)", aliases: ["naruto (grr 1)", "naruto grr 1"], obtainability: "UNOB" },
  "gex-d-gecko": { subtitle: "Gecko (Moria)", aliases: ["gecko (moria)", "gecko moria"], obtainability: "UNOB" },
  "tuca-donka": { subtitle: "Kinji Hakari", aliases: ["kinji hakari", "hakari"], obtainability: "UNOB" },
  "sound-o-sonic-demon": { subtitle: "Demon Tengen", aliases: ["demon tengen"], obtainability: "UNOB" },
  "mercury-guardian": { subtitle: "Sailor Mercury", aliases: ["sailor mercury"], obtainability: "UNOB" },
  "fire-king": { subtitle: "Sabo", aliases: ["sabo", "flame emperor"], obtainability: "UNOB" },
  "cursed-brothers-enraged": { subtitle: "Itadori and Todo (Enraged)", aliases: ["itadori and todo (enraged)", "itadori", "todo"], obtainability: "UNOB" },
  "gankai": { subtitle: "Kaos", aliases: ["kaos", "godus"], obtainability: "UNOB" },

  // Low A Tier
  "jangiku": { subtitle: "Rangiku", aliases: ["rangiku"], obtainability: "UNOB" },
  "the-finger": { subtitle: "Pieck Finger", aliases: ["pieck finger"], obtainability: "UNOB" },
  "expert-sorcerer-angry": { subtitle: "Angry Reigen", aliases: ["angry reigen"], obtainability: "UNOB" },
  "expert-sorcerer-sad": { subtitle: "Sad Reigen", aliases: ["sad reigen"], obtainability: "UNOB" },
  "sabre-hopper": { subtitle: "Astolfo", aliases: ["astolfo"], obtainability: "UNOB" },
  "the-big-three": { subtitle: "Chihiro Rokuhira", aliases: ["chihiro rokuhira", "chihiro"], obtainability: "UNOB" },
  "death-painting": { subtitle: "Choso", aliases: ["choso", "blood brother"], obtainability: "UNOB" },
  "slim-shady-forever": { subtitle: "Killer Bee & Raikage", aliases: ["killer bee & raikage", "ye forever", "ye (forever)"], obtainability: "UNOB" },
  "davi": { subtitle: "Dabi", aliases: ["dabi"], obtainability: "UNOB" },
  "future-habri": { subtitle: "Kyoya Hibari", aliases: ["kyoya hibari", "hibari"], obtainability: "UNOB" },
  "flower-trainer": { subtitle: "Shinobu", aliases: ["shinobu"], obtainability: "UNOB" },
  "dark-ice-queen": { subtitle: "Rukia (Emo)", aliases: ["rukia (emo)"], obtainability: "UNOB" },
  "elemental-ultimate": { subtitle: "Ultimate Kakuzu", aliases: ["ultimate kakuzu"], obtainability: "UNOB" },
  "mysterious-x-girl": { subtitle: "Fem Gojo", aliases: ["fem gojo"], obtainability: "UNOB" },
  "ice-x-marine": { subtitle: "Aokiji 6*", aliases: ["aokiji 6*", "kuzan (final)", "aokiji 6", "aokiji 6 star"], obtainability: "UNOB" },
  "red-saber": { subtitle: "Mordred", aliases: ["mordred"], obtainability: "UNOB" },
  "cursed-brothers": { subtitle: "Itadori and Todo Duo", aliases: ["itadori and todo duo"], obtainability: "UNOB" },
  "becky": { subtitle: "Beatrice", aliases: ["beatrice"], obtainability: "UNOB" },
  "garnet-spear": { subtitle: "Violet Evergarden", aliases: ["violet evergarden", "katakuri"], obtainability: "UNOB" },
  "bright-reaper": { subtitle: "Arima", aliases: ["arima"], obtainability: "UNOB" },
  "jujutsu-master": { subtitle: "Yuta Okkotsu", aliases: ["yuta okkotsu", "yuta", "curse child", "okotsu"], obtainability: "UNOB" },
  "slim-shady": { subtitle: "Killer Bee", aliases: ["killer bee", "slim shady", "Ye Forever", "Forever", "YE [RAIKAGE] (FOREVER)", "killer bee & raikage", "Slim Shady [Killer Bee]"], obtainability: "UNOB" },
  "ye": { subtitle: "Raikage", aliases: ["raikage", "kanye"], obtainability: "UNOB" },
  "ice-dragon": { subtitle: "Toshiro", aliases: ["toshiro"], obtainability: "UNOB" },
  "etri": { subtitle: "Esdeath", aliases: ["esdeath"], obtainability: "UNOB" },
  "shirtless-devil": { subtitle: "Gray Fullbuster", aliases: ["gray fullbuster", "gray"], obtainability: "UNOB" },

  // Pure Tier
  "death-pure": { subtitle: "Ryuk", aliases: ["ryuk"], obtainability: "UNOB" },
  "l-borul-alt-pure": { subtitle: "DBZ Broly", aliases: ["dbz broly", "dbz", "DBZ BROLY", "DBZ Broly", "Legendary Borul (Alternative)"], obtainability: "UNOB" },
  "old-will-pure": { subtitle: "Yamamoto", aliases: ["yamamoto", "yama"], obtainability: "UNOB" },
  "club-beast-pure": { subtitle: "Kaido", aliases: ["kaido", "kido"], obtainability: "UNOB" },
  "first-wood-bender-pure": { subtitle: "Hashirama", aliases: ["hashirama", "hashi"], obtainability: "UNOB" },
  "illusiva-pure": { subtitle: "Nero Padoru", aliases: ["nero padoru", "padoru"], obtainability: "UNOB" },
  "challenger-flaming-tiger-pure": { subtitle: "Challenger Rengoku", aliases: ["challenger rengoku", "cren", "c.ren", "rengoku"], obtainability: "UNOB" },
  "zaruto-grr-iii-pure": { subtitle: "Naruto (GRR III)", aliases: ["naruto (grr iii)", "naruto grr 3"], obtainability: "UNOB" },
  "water-goddess-pure": { subtitle: "Aqua", aliases: ["aqua", "konosuba"], obtainability: "UNOB" },
  "varaq-pure": { subtitle: "Sinbad", aliases: ["sinbad"], obtainability: "UNOB" },
  "hogyoku-aizen-pure": { subtitle: "Hogyoku Aizen", aliases: ["hogyoku aizen"], obtainability: "UNOB" },
  "other-hog-eyezens-pure": { subtitle: "Hogyoku Aizens", aliases: ["hogyoku aizens"], obtainability: "UNOB" },
  "dungeon-queen-spirit-pure": { subtitle: "Asuna", aliases: ["asuna"], obtainability: "UNOB" },
  "other-dungeon-queens-pure": { subtitle: "Asunas", aliases: ["asunas"], obtainability: "UNOB" },

  // Oddity Tier
  "ainz": { subtitle: "Egg", aliases: ["100% egg ii", "100% egg ii - necro", "necro egg", "necromancer egg", "necro", "necros", "ainz egg", "ainz", "ainz ooal gown", "overlord", "the overlord"], obtainability: "UNOB" },
  "gp-3x": { subtitle: "Gamepass", aliases: ["3x", "speed", "x3", "3x speed"], obtainability: "OBT" },
  "gp-starpass": { subtitle: "Gamepass", aliases: ["starpass", "star"], obtainability: "OBT" },
  "gp-vip": { subtitle: "Gamepass", aliases: ["vip", "v.i.p.", "v.i.p"], obtainability: "OBT" },
  "gp-nimbus": { subtitle: "Gamepass", aliases: ["nimbus"], obtainability: "OBT" },
  "gp-frieza": { subtitle: "Gamepass", aliases: ["frieza pod"], obtainability: "OBT" },
  "gp-capsule-car": { subtitle: "Gamepass", aliases: ["capsule car"], obtainability: "OBT" },
  "kedark": { subtitle: "Egg", aliases: ["100% egg", "100% dark egg", "cid egg", "cid", "Kageni Egg", "Kagenou Egg", "Kagenou"], obtainability: "UNOB" }
};

// Generates an initial lightweight fallback list so child components never break on mount
export const ALL_UNITS: MasterUnit[] = Object.entries(UNIT_METADATA).map(([id, meta]) => ({
  id,
  name: meta.name || id.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
  subtitle: meta.subtitle || "",
  value: 0,
  rarity: 0,
  supply: 0,
  demand: 0,
  aliases: meta.aliases || [],
  notice: meta.notice || "",
  obtainability: meta.obtainability || "UNOB",
  imageUrl: `/units/${id}.webp`
}));

export const ROSTER = ALL_UNITS;