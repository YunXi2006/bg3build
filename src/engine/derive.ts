// 角色推導引擎：由 Build 選擇序列推導出角色的所有數值與已獲得能力

import type { AbilityKey } from '../types';
import { proficiencyBonus } from '../types';
import type { BuildState } from '../store/build';
import { CLASS_MAP } from '../data/classes';
import { RACE_MAP } from '../data/races';
import { BACKGROUNDS } from '../data/backgrounds';
import { FEAT_MAP } from '../data/feats';
import {
  FULL_CASTER_SLOTS,
  HALF_CASTER_SLOTS,
  THIRD_CASTER_SLOTS,
  PACT_MAGIC,
} from '../data/progressions';

export interface DerivedFeature {
  name: string;
  desc: string;
  source: string;
  level?: number;
}

export interface DerivedSpellcasting {
  classId: string;
  className: string;
  ability: AbilityKey;
  dc: number;
  attackBonus: number;
}

export interface DerivedCharacter {
  totalLevel: number;
  classLevels: { classId: string; level: number; subclassId?: string }[];
  abilities: Record<AbilityKey, number>;
  mods: Record<AbilityKey, number>;
  profBonus: number;
  hp: number;
  ac: number;
  acNote: string;
  speed: number;
  initiative: number;
  savingThrows: AbilityKey[];
  skills: { id: string; source: string }[];
  features: DerivedFeature[];
  spellcasting: DerivedSpellcasting[];
  /** 共用法術位（多職業合算），索引 = 環位-1 */
  sharedSlots: number[];
  pactSlots?: { slots: number; slotLevel: number };
  warnings: string[];
}

/** 兼職屬性門檻：每個群組中至少一項屬性 ≥ 13 */
export const MULTICLASS_REQ: Record<string, AbilityKey[][]> = {
  barbarian: [['STR']],
  bard: [['CHA']],
  cleric: [['WIS']],
  druid: [['WIS']],
  fighter: [['STR', 'DEX']],
  monk: [['DEX'], ['WIS']],
  paladin: [['STR'], ['CHA']],
  ranger: [['DEX'], ['WIS']],
  rogue: [['DEX']],
  sorcerer: [['CHA']],
  warlock: [['CHA']],
  wizard: [['INT']],
};

export function meetsMulticlassReq(classId: string, abilities: Record<AbilityKey, number>): boolean {
  const groups = MULTICLASS_REQ[classId] ?? [];
  return groups.every((group) => group.some((a) => abilities[a] >= 13));
}

/** 種族／子種族直接給予的技能熟練 */
const RACE_SKILLS: Record<string, string[]> = {
  elf: ['perception'],
  drow: ['perception'],
  'wood-elf': ['stealth'],
  'wood-half-elf': ['stealth'],
  'lightfoot-halfling': ['stealth'],
  'deep-gnome': ['stealth'],
};

/** 子種族速度覆寫 */
const SUBRACE_SPEED: Record<string, number> = {
  'wood-elf': 10.5,
  'wood-half-elf': 10.5,
};

const mod = (score: number) => Math.floor((score - 10) / 2);

export function deriveCharacter(build: BuildState): DerivedCharacter {
  const warnings: string[] = [];

  // ---- 職業等級統計（保持首職業順序）----
  const classLevels: { classId: string; level: number; subclassId?: string }[] = [];
  for (const lv of build.levels) {
    const entry = classLevels.find((c) => c.classId === lv.classId);
    if (entry) {
      entry.level += 1;
      if (lv.subclassId) entry.subclassId = lv.subclassId;
    } else {
      classLevels.push({ classId: lv.classId, level: 1, subclassId: lv.subclassId });
    }
  }
  const totalLevel = build.levels.length;

  // ---- 最終屬性值 = Point Buy + 種族 +2/+1 + 專長 ASI ----
  const abilities: Record<AbilityKey, number> = { ...build.abilities };
  if (build.bonus2) abilities[build.bonus2] += 2;
  if (build.bonus1) abilities[build.bonus1] += 1;
  for (const lv of build.levels) {
    if (lv.featId === 'ability-improvement' && lv.asi) {
      abilities[lv.asi[0]] = Math.min(20, abilities[lv.asi[0]] + 1);
      abilities[lv.asi[1]] = Math.min(20, abilities[lv.asi[1]] + 1);
    }
  }
  const mods = Object.fromEntries(
    (Object.keys(abilities) as AbilityKey[]).map((k) => [k, mod(abilities[k])]),
  ) as Record<AbilityKey, number>;

  // ---- 兼職門檻檢查 ----
  if (classLevels.length > 1) {
    for (const { classId } of classLevels) {
      if (!meetsMulticlassReq(classId, abilities)) {
        warnings.push(`兼職「${CLASS_MAP[classId]?.name ?? classId}」需要其主屬性達 13。`);
      }
    }
  }

  // ---- HP ----
  const hasTough = build.levels.some((l) => l.featId === 'tough');
  const goldDwarf = build.subraceId === 'gold-dwarf';
  const draconic = classLevels.some((c) => c.classId === 'sorcerer' && c.subclassId === 'draconic');
  let hp = 0;
  build.levels.forEach((lv, i) => {
    const die = CLASS_MAP[lv.classId]?.hitDie ?? 8;
    hp += i === 0 ? die + mods.CON : Math.floor(die / 2) + 1 + mods.CON;
  });
  if (hasTough) hp += 2 * totalLevel;
  if (goldDwarf) hp += totalLevel;
  if (draconic) hp += totalLevel;
  hp = Math.max(totalLevel, hp);

  // ---- AC（未著裝備的基礎 AC）----
  let ac = 10 + mods.DEX;
  let acNote = '10 + 敏捷';
  const hasBarb = classLevels.some((c) => c.classId === 'barbarian');
  const hasMonk = classLevels.some((c) => c.classId === 'monk');
  if (hasBarb && 10 + mods.DEX + mods.CON > ac) {
    ac = 10 + mods.DEX + mods.CON;
    acNote = '無甲防禦：10 + 敏捷 + 體質';
  }
  if (hasMonk && 10 + mods.DEX + mods.WIS > ac) {
    ac = 10 + mods.DEX + mods.WIS;
    acNote = '無甲防禦：10 + 敏捷 + 睿知';
  }
  if (draconic && 13 + mods.DEX > ac) {
    ac = 13 + mods.DEX;
    acNote = '龍族韌皮：13 + 敏捷';
  }

  // ---- 速度 ----
  const race = build.raceId ? RACE_MAP[build.raceId] : undefined;
  let speed = race?.speed ?? 9;
  if (build.subraceId && SUBRACE_SPEED[build.subraceId]) speed = SUBRACE_SPEED[build.subraceId];

  // ---- 豁免（兼職規則：僅首職業）----
  const firstClass = build.levels[0] ? CLASS_MAP[build.levels[0].classId] : undefined;
  const savingThrows = firstClass?.savingThrows ?? [];

  // ---- 技能 ----
  const skills: { id: string; source: string }[] = [];
  const addSkill = (id: string, source: string) => {
    if (!skills.some((s) => s.id === id)) skills.push({ id, source });
  };
  if (race) {
    for (const sid of RACE_SKILLS[race.id] ?? []) addSkill(sid, race.name);
  }
  if (build.subraceId) {
    for (const sid of RACE_SKILLS[build.subraceId] ?? []) {
      const sub = race?.subraces.find((s) => s.id === build.subraceId);
      addSkill(sid, sub?.name ?? '子種族');
    }
  }
  const bg = BACKGROUNDS.find((b) => b.id === build.backgroundId);
  if (bg) for (const sid of bg.skills) addSkill(sid, `背景：${bg.name}`);
  if (firstClass) {
    for (const sid of build.skillIds) {
      if (firstClass.skillChoices.from.includes(sid)) addSkill(sid, firstClass.name);
    }
  }

  // ---- 特性清單 ----
  const features: DerivedFeature[] = [];
  if (race) {
    for (const t of race.traits) features.push({ name: t, desc: '', source: race.name });
    const sub = race.subraces.find((s) => s.id === build.subraceId);
    if (sub) for (const t of sub.traits) features.push({ name: t, desc: '', source: sub.name });
  }
  for (const { classId, level, subclassId } of classLevels) {
    const cls = CLASS_MAP[classId];
    if (!cls) continue;
    for (const f of cls.features) {
      if (f.level <= level && f.nameEn !== 'Feat') {
        features.push({ name: f.name, desc: f.desc, source: cls.name, level: f.level });
      }
    }
    if (subclassId) {
      const sub = cls.subclasses.find((s) => s.id === subclassId);
      if (sub) features.push({ name: `${cls.subclassTitle}：${sub.name}`, desc: sub.desc, source: cls.name, level: cls.subclassLevel });
    }
  }
  for (const lv of build.levels) {
    if (lv.featId && lv.featId !== 'ability-improvement') {
      const feat = FEAT_MAP[lv.featId];
      if (feat) features.push({ name: `專長：${feat.name}`, desc: feat.desc, source: '專長' });
    }
  }

  // ---- 施法 ----
  const profBonus = totalLevel > 0 ? proficiencyBonus(totalLevel) : 2;
  const spellcasting: DerivedSpellcasting[] = [];
  for (const { classId, level, subclassId } of classLevels) {
    const cls = CLASS_MAP[classId];
    if (!cls?.spellcastingAbility) continue;
    // 聖騎士/遊俠 1 級尚無法術
    if (cls.casterType === 'half' && level < 2) continue;
    spellcasting.push({
      classId,
      className: cls.name,
      ability: cls.spellcastingAbility,
      dc: 8 + profBonus + mods[cls.spellcastingAbility],
      attackBonus: profBonus + mods[cls.spellcastingAbility],
    });
    void subclassId;
  }

  // ---- 法術位（多職業合算規則）----
  let sharedSlots: number[] = [0, 0, 0, 0, 0, 0];
  const casters = classLevels.filter((c) => {
    const t = CLASS_MAP[c.classId]?.casterType;
    return t === 'full' || t === 'half' || t === 'third';
  });
  if (casters.length === 1) {
    const c = casters[0];
    const t = CLASS_MAP[c.classId]!.casterType;
    const table = t === 'full' ? FULL_CASTER_SLOTS : t === 'half' ? HALF_CASTER_SLOTS : THIRD_CASTER_SLOTS;
    sharedSlots = table[c.level - 1];
  } else if (casters.length > 1) {
    let casterLevel = 0;
    for (const c of casters) {
      const t = CLASS_MAP[c.classId]!.casterType;
      casterLevel += t === 'full' ? c.level : t === 'half' ? Math.floor(c.level / 2) : Math.floor(c.level / 3);
    }
    if (casterLevel > 0) sharedSlots = FULL_CASTER_SLOTS[Math.min(12, casterLevel) - 1];
  }
  const warlock = classLevels.find((c) => c.classId === 'warlock');
  const pactSlots = warlock ? PACT_MAGIC[warlock.level - 1] : undefined;

  return {
    totalLevel,
    classLevels,
    abilities,
    mods,
    profBonus,
    hp,
    ac,
    acNote,
    speed,
    initiative: mods.DEX,
    savingThrows,
    skills,
    features,
    spellcasting,
    sharedSlots,
    pactSlots,
    warnings,
  };
}

/** 該職業在指定職業等級是否要選專長 */
export function featLevelsOf(classId: string): number[] {
  const cls = CLASS_MAP[classId];
  if (!cls) return [];
  return cls.features.filter((f) => f.nameEn === 'Feat').map((f) => f.level);
}
