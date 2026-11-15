// 傷害期望（DPR）計算引擎

import { parseDice, diceAvg, diceOnlyAvg, firstDieAvg, scaleDice } from './dice';
import type { SpellDef } from '../types';

export type AdvState = 'normal' | 'adv' | 'dis';

/** d20 擲骰：命中率與爆擊率 */
export function hitChances(
  attackBonus: number,
  targetAC: number,
  adv: AdvState,
  critRange = 20,
): { pHit: number; pCrit: number } {
  const need = targetAC - attackBonus; // 需要擲出的點數
  let p = (21 - need) / 20;
  p = Math.min(0.95, Math.max(0.05, p));
  let c = (21 - critRange) / 20;

  if (adv === 'adv') {
    p = 1 - (1 - p) * (1 - p);
    c = 1 - (1 - c) * (1 - c);
  } else if (adv === 'dis') {
    p = p * p;
    c = c * c;
  }
  c = Math.min(c, p);
  return { pHit: p, pCrit: c };
}

/** 豁免失敗率（目標豁免加值 vs 施法 DC） */
export function saveFailChance(dc: number, saveBonus: number): number {
  // 目標擲 d20 + saveBonus >= DC 即成功
  const pFail = (dc - saveBonus - 1) / 20;
  return Math.min(0.95, Math.max(0.05, pFail));
}

export interface WeaponAttackInput {
  attackBonus: number;
  targetAC: number;
  adv: AdvState;
  critRange: number;
  /** 主要攻擊次數（額外攻擊） */
  attacks: number;
  /** 附贈動作攻擊次數（疾風連擊=2 等） */
  bonusAttacks: number;
  /** 武器傷害骰 */
  weaponDice: string;
  /** 巨武戰鬥風格：1、2 重擲 */
  rerollLow: boolean;
  /** 固定傷害加值（屬性調整值＋狂暴＋決鬥＋GWM 等） */
  flatBonus: number;
  /** 每次命中附加的傷害骰（妖術 / 獵人印記 / 至聖斬強化…） */
  perHitDice: string;
  /** 每回合一次的傷害骰（偷襲） */
  oncePerTurnDice: string;
  /** 爆擊時額外武器骰數（蠻力重擊 1、半獸人蠻性 1，可疊加） */
  extraCritDies: number;
}

export interface DprBreakdown {
  dpr: number;
  pHit: number;
  pCrit: number;
  perAttack: number;
  note: string[];
}

export function weaponDpr(input: WeaponAttackInput): DprBreakdown {
  const { pHit, pCrit } = hitChances(input.attackBonus, input.targetAC, input.adv, input.critRange);

  const wTerms = parseDice(input.weaponDice);
  const perHitTerms = parseDice(input.perHitDice || '');
  const onceTerms = parseDice(input.oncePerTurnDice || '');

  const wAvg = diceAvg(wTerms, input.rerollLow);
  const wDiceOnly = diceOnlyAvg(wTerms, input.rerollLow);
  const perHitAvg = diceAvg(perHitTerms);

  // 爆擊時骰子加倍（固定值不加倍），外加額外武器骰
  const critExtra =
    wDiceOnly + diceOnlyAvg(perHitTerms) + input.extraCritDies * firstDieAvg(wTerms, input.rerollLow);

  const perAttack = pHit * (wAvg + perHitAvg + input.flatBonus) + pCrit * critExtra;
  const totalAttacks = input.attacks + input.bonusAttacks;
  let dpr = perAttack * totalAttacks;

  // 偷襲：每回合一次，以「至少命中一次」的機率計算
  const note: string[] = [];
  if (onceTerms.length > 0) {
    const pAnyHit = 1 - Math.pow(1 - pHit, totalAttacks);
    dpr += diceAvg(onceTerms) * pAnyHit;
    note.push(`偷襲以至少命中一次的機率（${Math.round(pAnyHit * 100)}%）計入`);
  }

  return { dpr, pHit, pCrit, perAttack, note };
}

export interface SpellDprInput {
  spell: SpellDef;
  /** 施放環位（戲法 = 0） */
  slotLevel: number;
  /** 角色總等級（戲法成長用） */
  characterLevel: number;
  spellAttackBonus: number;
  spellDC: number;
  targetAC: number;
  targetSaveBonus: number;
  adv: AdvState;
  /** 痛苦爆轟：魔能爆每道 + 施法屬性調整值 */
  agonizingMod: number;
}

export function spellDpr(input: SpellDprInput): DprBreakdown | null {
  const { spell } = input;
  if (!spell.damage || spell.damage.type === '治療') return null;

  const note: string[] = [];
  let terms = parseDice(spell.damage.dice);

  // 升環
  if (spell.level > 0 && input.slotLevel > spell.level && spell.damage.upcastDice) {
    const up = parseDice(spell.damage.upcastDice);
    const times = input.slotLevel - spell.level;
    for (let i = 0; i < times; i++) terms = [...terms, ...up];
  }

  // 戲法成長：5 級、10 級各 +1 倍骰
  let multiHits = 1; // 多道攻擊（魔能爆光束 / 灼熱射線 / 魔法飛彈）
  if (spell.level === 0) {
    const mult = input.characterLevel >= 10 ? 3 : input.characterLevel >= 5 ? 2 : 1;
    if (spell.id === 'eldritch-blast') {
      multiHits = mult; // 光束數，各自攻擊
      note.push(`${mult} 道光束，各自進行攻擊檢定`);
    } else if (mult > 1) {
      terms = scaleDice(terms, mult);
      note.push(`角色 ${input.characterLevel} 級：傷害骰 ×${mult}`);
    }
  }
  if (spell.id === 'scorching-ray') {
    multiHits = 3 + Math.max(0, input.slotLevel - spell.level);
    note.push(`${multiHits} 道射線，各自進行攻擊檢定`);
  }
  if (spell.id === 'magic-missile') {
    const missiles = 3 + Math.max(0, input.slotLevel - spell.level);
    const avg = missiles * (2.5 + 1); // 每枚 1d4+1
    note.push(`${missiles} 枚飛彈，必定命中`);
    return { dpr: avg, pHit: 1, pCrit: 0, perAttack: avg / missiles, note };
  }

  const avg = diceAvg(terms);
  const diceOnly = diceOnlyAvg(terms);

  if (spell.attack === 'melee' || spell.attack === 'ranged') {
    const { pHit, pCrit } = hitChances(input.spellAttackBonus, input.targetAC, input.adv, 20);
    const flat = spell.id === 'eldritch-blast' ? input.agonizingMod : 0;
    const perAttack = pHit * (avg + flat) + pCrit * diceOnly;
    return { dpr: perAttack * multiHits, pHit, pCrit, perAttack, note };
  }

  if (spell.attack === 'save') {
    const pFail = saveFailChance(input.spellDC, input.targetSaveBonus);
    const dpr = avg * (pFail + (spell.halfOnSave ? (1 - pFail) * 0.5 : 0));
    if (spell.halfOnSave) note.push('豁免成功仍受半傷');
    return { dpr, pHit: pFail, pCrit: 0, perAttack: dpr, note };
  }

  // auto / none（持續傷害類以單次引發計）
  return { dpr: avg, pHit: 1, pCrit: 0, perAttack: avg, note };
}
