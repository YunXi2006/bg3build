import type { AbilityKey } from '../types';

export interface FeatDef {
  id: string;
  name: string;
  nameEn: string;
  desc: string;
  /** true = 需要額外選擇兩個 +1（或同屬性 +2） */
  isAsi?: boolean;
  /** 固定的屬性加值（如酒館鬥毆 +1 力量或體質，簡化為說明文字） */
  halfAsi?: AbilityKey[];
}

export const FEATS: FeatDef[] = [
  { id: 'ability-improvement', name: '屬性值提升', nameEn: 'Ability Improvement', isAsi: true, desc: '將一項屬性 +2，或兩項屬性各 +1（上限 20）。' },
  { id: 'actor', name: '演員', nameEn: 'Actor', desc: '魅力 +1；欺瞞與表演檢定熟練加值加倍。' },
  { id: 'alert', name: '警覺', nameEn: 'Alert', desc: '先攻 +5，且不會被偷襲。' },
  { id: 'athlete', name: '運動員', nameEn: 'Athlete', desc: '力量或敏捷 +1；起身只消耗少量移動力，跳躍距離增加。' },
  { id: 'charger', name: '衝鋒者', nameEn: 'Charger', desc: '獲得衝鋒攻擊：衝刺後以附贈動作攻擊或推撞。' },
  { id: 'crossbow-expert', name: '弩術專家', nameEn: 'Crossbow Expert', desc: '近身使用弩不再具有劣勢；手弩攻擊造成的瞄準狀態延長。' },
  { id: 'defensive-duellist', name: '防禦決鬥者', nameEn: 'Defensive Duellist', desc: '持靈巧武器時，可用反應使 AC 增加熟練加值，抵擋一次近戰攻擊。' },
  { id: 'dual-wielder', name: '雙武器鬥士', nameEn: 'Dual Wielder', desc: '雙持武器時 AC +1，且可雙持非輕型武器。' },
  { id: 'dungeon-delver', name: '地城探究者', nameEn: 'Dungeon Delver', desc: '對陷阱的豁免與察覺具優勢，搜尋隱藏物更敏銳。' },
  { id: 'durable', name: '堅韌', nameEn: 'Durable', desc: '體質 +1；短休時不消耗生命骰即回復少量生命。' },
  { id: 'elemental-adept', name: '元素專精', nameEn: 'Elemental Adept', desc: '選擇一種元素：該元素法術無視抗性，傷害骰擲出 1 時視為 2。' },
  { id: 'great-weapon-master', name: '巨武大師', nameEn: 'Great Weapon Master', desc: '重型武器攻擊可承受 −5 命中換取 +10 傷害；擊殺或爆擊後可用附贈動作再攻擊。' },
  { id: 'heavily-armoured', name: '重甲使用者', nameEn: 'Heavily Armoured', desc: '力量 +1；獲得重甲熟練。' },
  { id: 'heavy-armour-master', name: '重甲大師', nameEn: 'Heavy Armour Master', desc: '力量 +1；著重甲時受到的非魔法鈍擊、穿刺、揮砍傷害 −3。' },
  { id: 'lightly-armoured', name: '輕甲使用者', nameEn: 'Lightly Armoured', desc: '力量或敏捷 +1；獲得輕甲熟練。' },
  { id: 'lucky', name: '幸運', nameEn: 'Lucky', desc: '獲得 3 點幸運點：可重擲攻擊、檢定、豁免，或使敵人重擲攻擊。' },
  { id: 'mage-slayer', name: '法師殺手', nameEn: 'Mage Slayer', desc: '被你攻擊的施法者專注豁免具劣勢；鄰近敵人施法時可用反應攻擊。' },
  { id: 'magic-initiate-bard', name: '魔法學徒：吟遊詩人', nameEn: 'Magic Initiate: Bard', desc: '習得兩個吟遊詩人戲法與一個 1 環法術（每長休一次）。' },
  { id: 'magic-initiate-cleric', name: '魔法學徒：牧師', nameEn: 'Magic Initiate: Cleric', desc: '習得兩個牧師戲法與一個 1 環法術（每長休一次）。' },
  { id: 'magic-initiate-druid', name: '魔法學徒：德魯伊', nameEn: 'Magic Initiate: Druid', desc: '習得兩個德魯伊戲法與一個 1 環法術（每長休一次）。' },
  { id: 'magic-initiate-sorcerer', name: '魔法學徒：術士', nameEn: 'Magic Initiate: Sorcerer', desc: '習得兩個術士戲法與一個 1 環法術（每長休一次）。' },
  { id: 'magic-initiate-warlock', name: '魔法學徒：契術師', nameEn: 'Magic Initiate: Warlock', desc: '習得兩個契術師戲法與一個 1 環法術（每長休一次）。' },
  { id: 'magic-initiate-wizard', name: '魔法學徒：法師', nameEn: 'Magic Initiate: Wizard', desc: '習得兩個法師戲法與一個 1 環法術（每長休一次）。' },
  { id: 'martial-adept', name: '武術專家', nameEn: 'Martial Adept', desc: '習得兩個戰鬥大師戰技，並獲得一顆 d6 優越骰。' },
  { id: 'medium-armour-master', name: '中甲大師', nameEn: 'Medium Armour Master', desc: '著中甲時隱匿不受影響，AC 的敏捷加值上限提高至 +3。' },
  { id: 'mobile', name: '靈活移動', nameEn: 'Mobile', desc: '移動速度 +3 公尺；衝刺時無視困難地形，近戰攻擊後不會引發藉機攻擊。' },
  { id: 'moderately-armoured', name: '中甲使用者', nameEn: 'Moderately Armoured', desc: '力量或敏捷 +1；獲得中甲與盾牌熟練。' },
  { id: 'performer', name: '表演者', nameEn: 'Performer', desc: '魅力 +1；獲得樂器熟練。' },
  { id: 'polearm-master', name: '長柄大師', nameEn: 'Polearm Master', desc: '使用長柄武器攻擊後，可用附贈動作以柄端再攻擊（1d4）；敵人進入攻擊範圍時可藉機攻擊。' },
  { id: 'resilient', name: '韌性', nameEn: 'Resilient', desc: '選擇一項屬性 +1，並獲得該屬性的豁免熟練。' },
  { id: 'ritual-caster', name: '儀式施法者', nameEn: 'Ritual Caster', desc: '習得兩個儀式法術（如尋獲魔寵、動物交談）。' },
  { id: 'savage-attacker', name: '蠻勇攻擊者', nameEn: 'Savage Attacker', desc: '武器傷害骰擲兩次取較高值。' },
  { id: 'sentinel', name: '警戒衛士', nameEn: 'Sentinel', desc: '藉機攻擊命中使目標速度歸零；隊友被攻擊時可用反應反擊。' },
  { id: 'sharpshooter', name: '神射手', nameEn: 'Sharpshooter', desc: '遠程攻擊可承受 −5 命中換取 +10 傷害；高處射擊無懲罰。' },
  { id: 'shield-master', name: '盾牌大師', nameEn: 'Shield Master', desc: '持盾時敏捷豁免 +2；豁免成功的範圍法術傷害減為 0。' },
  { id: 'skilled', name: '多藝', nameEn: 'Skilled', desc: '獲得三項任選技能的熟練。' },
  { id: 'spell-sniper', name: '法術狙擊手', nameEn: 'Spell Sniper', desc: '習得一個攻擊型戲法，法術攻擊的爆擊門檻 −1。' },
  { id: 'tavern-brawler', name: '酒館鬥毆', nameEn: 'Tavern Brawler', desc: '力量或體質 +1；徒手與即席武器攻擊時，力量調整值對命中與傷害計算兩次。' },
  { id: 'tough', name: '強韌', nameEn: 'Tough', desc: '每級額外 +2 生命值。' },
  { id: 'war-caster', name: '戰鬥施法者', nameEn: 'War Caster', desc: '專注豁免具優勢；可用反應以法術進行藉機攻擊。' },
  { id: 'weapon-master', name: '武器大師', nameEn: 'Weapon Master', desc: '力量或敏捷 +1；獲得四種任選武器的熟練。' },
];

export const FEAT_MAP: Record<string, FeatDef> = Object.fromEntries(
  FEATS.map((f) => [f.id, f]),
);
