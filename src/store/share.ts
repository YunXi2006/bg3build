// Build 狀態 ↔ 分享連結的序列化

import type { AbilityKey } from '../types';
import type { BuildState, LevelChoice } from './build';

const ABILITY_ORDER: AbilityKey[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

interface ShareData {
  r?: string;
  sr?: string;
  bg?: string;
  ab: number[];
  b2?: AbilityKey;
  b1?: AbilityKey;
  sk: string[];
  lv: LevelChoice[];
}

export type SharableBuild = Pick<
  BuildState,
  'raceId' | 'subraceId' | 'backgroundId' | 'abilities' | 'bonus2' | 'bonus1' | 'skillIds' | 'levels'
>;

export function encodeBuild(s: SharableBuild): string {
  const data: ShareData = {
    r: s.raceId,
    sr: s.subraceId,
    bg: s.backgroundId,
    ab: ABILITY_ORDER.map((k) => s.abilities[k]),
    b2: s.bonus2,
    b1: s.bonus1,
    sk: s.skillIds,
    lv: s.levels,
  };
  const json = JSON.stringify(data);
  // UTF-8 安全的 base64（URL 友善字元）
  return btoa(String.fromCharCode(...new TextEncoder().encode(json)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function decodeBuild(code: string): SharableBuild | null {
  try {
    const b64 = code.replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const data = JSON.parse(new TextDecoder().decode(bytes)) as ShareData;
    if (!Array.isArray(data.ab) || data.ab.length !== 6 || !Array.isArray(data.lv)) return null;
    const abilities = Object.fromEntries(
      ABILITY_ORDER.map((k, i) => [k, clampScore(data.ab[i])]),
    ) as Record<AbilityKey, number>;
    return {
      raceId: data.r,
      subraceId: data.sr,
      backgroundId: data.bg,
      abilities,
      bonus2: data.b2,
      bonus1: data.b1,
      skillIds: Array.isArray(data.sk) ? data.sk.filter((x) => typeof x === 'string') : [],
      levels: data.lv
        .filter((l) => l && typeof l.classId === 'string')
        .slice(0, 12),
    };
  } catch {
    return null;
  }
}

function clampScore(n: unknown): number {
  const v = typeof n === 'number' ? n : 8;
  return Math.max(8, Math.min(15, Math.round(v)));
}
