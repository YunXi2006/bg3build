import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AbilityKey } from '../types';

/** 單一等級的選擇 */
export interface LevelChoice {
  classId: string;
  /** 達到子職業等級時選擇 */
  subclassId?: string;
  /** 專長等級時選擇 */
  featId?: string;
  /** 選了「屬性值提升」時的兩個 +1（可同屬性 = +2） */
  asi?: [AbilityKey, AbilityKey];
}

export interface BuildState {
  raceId?: string;
  subraceId?: string;
  backgroundId?: string;
  /** Point Buy 基礎值（8~15） */
  abilities: Record<AbilityKey, number>;
  /** BG3 自由分配的 +2 / +1 */
  bonus2?: AbilityKey;
  bonus1?: AbilityKey;
  /** 首職業選擇的技能熟練 */
  skillIds: string[];
  levels: LevelChoice[];

  setRace: (raceId?: string, subraceId?: string) => void;
  setSubrace: (subraceId?: string) => void;
  setBackground: (backgroundId?: string) => void;
  setAbility: (key: AbilityKey, value: number) => void;
  setBonus2: (key?: AbilityKey) => void;
  setBonus1: (key?: AbilityKey) => void;
  toggleSkill: (skillId: string, max: number) => void;
  addLevel: (classId: string) => void;
  removeLastLevel: () => void;
  updateLevel: (index: number, patch: Partial<LevelChoice>) => void;
  /** 由分享連結載入完整 Build */
  load: (s: {
    raceId?: string; subraceId?: string; backgroundId?: string;
    abilities: Record<AbilityKey, number>;
    bonus2?: AbilityKey; bonus1?: AbilityKey;
    skillIds: string[]; levels: LevelChoice[];
  }) => void;
  reset: () => void;
}

export const DEFAULT_ABILITIES: Record<AbilityKey, number> = {
  STR: 8, DEX: 8, CON: 8, INT: 8, WIS: 8, CHA: 8,
};

/** Point Buy 單點成本（從 8 到該值的總成本） */
export const POINT_BUY_COST: Record<number, number> = {
  8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9,
};

export const POINT_BUY_TOTAL = 27;

export function pointsSpent(abilities: Record<AbilityKey, number>): number {
  return Object.values(abilities).reduce((sum, v) => sum + (POINT_BUY_COST[v] ?? 0), 0);
}

export const useBuildStore = create<BuildState>()(
  persist(
    (set) => ({
      abilities: { ...DEFAULT_ABILITIES },
      skillIds: [],
      levels: [],

      setRace: (raceId, subraceId) => set({ raceId, subraceId }),
      setSubrace: (subraceId) => set({ subraceId }),
      setBackground: (backgroundId) => set({ backgroundId }),
      setAbility: (key, value) =>
        set((s) => {
          const v = Math.max(8, Math.min(15, value));
          const next = { ...s.abilities, [key]: v };
          if (pointsSpent(next) > POINT_BUY_TOTAL) return s;
          return { abilities: next };
        }),
      setBonus2: (key) => set((s) => ({ bonus2: key, bonus1: s.bonus1 === key ? undefined : s.bonus1 })),
      setBonus1: (key) => set((s) => ({ bonus1: key, bonus2: s.bonus2 === key ? undefined : s.bonus2 })),
      toggleSkill: (skillId, max) =>
        set((s) => {
          if (s.skillIds.includes(skillId)) {
            return { skillIds: s.skillIds.filter((x) => x !== skillId) };
          }
          if (s.skillIds.length >= max) return s;
          return { skillIds: [...s.skillIds, skillId] };
        }),
      addLevel: (classId) =>
        set((s) => (s.levels.length >= 12 ? s : { levels: [...s.levels, { classId }] })),
      removeLastLevel: () => set((s) => ({ levels: s.levels.slice(0, -1) })),
      updateLevel: (index, patch) =>
        set((s) => ({
          levels: s.levels.map((lv, i) => (i === index ? { ...lv, ...patch } : lv)),
        })),
      load: (s) =>
        set({
          raceId: s.raceId,
          subraceId: s.subraceId,
          backgroundId: s.backgroundId,
          abilities: { ...s.abilities },
          bonus2: s.bonus2,
          bonus1: s.bonus1,
          skillIds: [...s.skillIds],
          levels: [...s.levels],
        }),
      reset: () =>
        set({
          raceId: undefined,
          subraceId: undefined,
          backgroundId: undefined,
          abilities: { ...DEFAULT_ABILITIES },
          bonus2: undefined,
          bonus1: undefined,
          skillIds: [],
          levels: [],
        }),
    }),
    { name: 'bg3build' },
  ),
);
