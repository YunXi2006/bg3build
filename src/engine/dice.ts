// 骰子字串解析與期望值計算
// 支援格式："8d6"、"3d4+3"、"2d8+4d6"、"10d6+40"、"5"（固定值）

export interface DiceTerm {
  count: number;
  faces: number; // 0 = 固定值（count 即數值）
}

export function parseDice(expr: string): DiceTerm[] {
  const terms: DiceTerm[] = [];
  for (const raw of expr.split('+')) {
    const part = raw.trim();
    if (!part) continue;
    const m = part.match(/^(\d+)d(\d+)$/);
    if (m) {
      terms.push({ count: Number(m[1]), faces: Number(m[2]) });
    } else if (/^\d+$/.test(part)) {
      terms.push({ count: Number(part), faces: 0 });
    }
  }
  return terms;
}

/** 單顆骰的期望值；rerollLow = 巨武戰鬥風格（1、2 重擲一次） */
function dieAvg(faces: number, rerollLow = false): number {
  const base = (faces + 1) / 2;
  if (!rerollLow || faces < 3) return base;
  // 擲出 1 或 2 時重擲一次：E' = E + (2/d) * (E - 1.5)
  return base + (2 / faces) * (base - 1.5);
}

/** 期望值（含固定值） */
export function diceAvg(terms: DiceTerm[], rerollLow = false): number {
  return terms.reduce(
    (sum, t) => sum + (t.faces === 0 ? t.count : t.count * dieAvg(t.faces, rerollLow)),
    0,
  );
}

/** 僅骰子部分的期望值（爆擊時加倍的部分，不含固定值） */
export function diceOnlyAvg(terms: DiceTerm[], rerollLow = false): number {
  return terms.reduce(
    (sum, t) => sum + (t.faces === 0 ? 0 : t.count * dieAvg(t.faces, rerollLow)),
    0,
  );
}

/** 第一顆骰的單骰期望（蠻力重擊／蠻性攻擊加一顆武器骰用） */
export function firstDieAvg(terms: DiceTerm[], rerollLow = false): number {
  const t = terms.find((x) => x.faces > 0);
  return t ? dieAvg(t.faces, rerollLow) : 0;
}

/** 把骰子數乘上倍率（戲法 5／10 級成長） */
export function scaleDice(terms: DiceTerm[], mult: number): DiceTerm[] {
  return terms.map((t) => (t.faces === 0 ? t : { ...t, count: t.count * mult }));
}

export function addDice(a: DiceTerm[], b: DiceTerm[]): DiceTerm[] {
  return [...a, ...b];
}

export function formatDice(terms: DiceTerm[]): string {
  return terms
    .map((t) => (t.faces === 0 ? `${t.count}` : `${t.count}d${t.faces}`))
    .join('+');
}
