// 遊戲資料的核心型別定義

export type AbilityKey = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';

export const ABILITY_NAMES: Record<AbilityKey, string> = {
  STR: '力量',
  DEX: '敏捷',
  CON: '體質',
  INT: '智力',
  WIS: '睿知',
  CHA: '魅力',
};

/** 職業或子職業在某一等級獲得的特性 */
export interface Feature {
  level: number;
  name: string;
  nameEn: string;
  desc: string;
}

export interface Subclass {
  id: string;
  name: string;
  nameEn: string;
  desc: string;
}

/**
 * 施法者類型，決定法術位成長表：
 * full = 全施法者（法師、牧師…）
 * half = 半施法者（聖騎士、遊俠）
 * pact = 魔契施法（契術師）
 * third = 三分之一施法者（魔能騎士、詭術師）
 * none = 不施法
 */
export type CasterType = 'full' | 'half' | 'pact' | 'third' | 'none';

export interface ClassDef {
  id: string;
  name: string;
  nameEn: string;
  desc: string;
  hitDie: number;
  primaryAbilities: AbilityKey[];
  savingThrows: AbilityKey[];
  armor: string[];
  weapons: string[];
  /** 可從哪些技能中選幾個熟練（技能 id） */
  skillChoices: { count: number; from: string[] };
  spellcastingAbility?: AbilityKey;
  casterType: CasterType;
  /** 幾級選子職業 */
  subclassLevel: number;
  /** 子職業的稱呼，如「範型」「學院」「結社」 */
  subclassTitle: string;
  subclasses: Subclass[];
  /** 本體職業的逐級特性（不含子職業特性） */
  features: Feature[];
}

export interface Subrace {
  id: string;
  name: string;
  nameEn: string;
  desc: string;
  traits: string[];
}

export interface RaceDef {
  id: string;
  name: string;
  nameEn: string;
  desc: string;
  /** 移動速度（公尺） */
  speed: number;
  size: '小型' | '中型';
  traits: string[];
  subraces: Subrace[];
}

export type SpellSchool = '防護' | '咒法' | '預言' | '惑控' | '塑能' | '幻術' | '死靈' | '變化';

export type SpellAction = 'action' | 'bonus' | 'reaction';

/**
 * 攻擊判定方式：
 * melee / ranged = 法術攻擊檢定；save = 目標豁免；auto = 自動命中；none = 無攻擊判定
 */
export type SpellAttack = 'melee' | 'ranged' | 'save' | 'auto' | 'none';

export interface SpellDamage {
  /** 傷害骰，如 "8d6"、"3d4+3"；多道射線類記錄單發傷害，於 desc 說明 */
  dice: string;
  type: string;
  /** 每升一環額外增加的傷害骰（戲法不升環，改為 5／10 級角色等級時 +1 骰） */
  upcastDice?: string;
}

export interface SpellDef {
  id: string;
  name: string;
  nameEn: string;
  /** 0 = 戲法 */
  level: number;
  school: SpellSchool;
  action: SpellAction;
  concentration: boolean;
  attack: SpellAttack;
  save?: AbilityKey;
  /** 豁免成功仍受半傷 */
  halfOnSave?: boolean;
  damage?: SpellDamage;
  /** 可習得此法術的職業 id（不含子職業額外法術） */
  classes: string[];
  desc: string;
}

export interface SkillDef {
  id: string;
  name: string;
  nameEn: string;
  ability: AbilityKey;
  desc: string;
}

export interface BackgroundDef {
  id: string;
  name: string;
  nameEn: string;
  desc: string;
  /** 給予熟練的技能 id */
  skills: string[];
}

/** 1~12 級對應的熟練加值 */
export function proficiencyBonus(level: number): number {
  return 2 + Math.floor((level - 1) / 4);
}
