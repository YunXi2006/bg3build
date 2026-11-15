import { useMemo, useState } from 'react';
import type { DerivedCharacter } from '../engine/derive';
import { ABILITY_NAMES, type AbilityKey } from '../types';
import { CLASS_MAP } from '../data/classes';
import { SKILL_MAP } from '../data/skills';

const ABILITY_ORDER: AbilityKey[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

const fmt = (n: number) => (n >= 0 ? `+${n}` : `${n}`);

export default function CharacterPanel({ ch }: { ch: DerivedCharacter }) {
  const [showFeatures, setShowFeatures] = useState(true);

  const classSummary = useMemo(
    () =>
      ch.classLevels
        .map((c) => `${CLASS_MAP[c.classId]?.name ?? c.classId} ${c.level}`)
        .join(' / '),
    [ch.classLevels],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, typeof ch.features>();
    for (const f of ch.features) {
      const list = map.get(f.source) ?? [];
      list.push(f);
      map.set(f.source, list);
    }
    return [...map.entries()];
  }, [ch.features]);

  return (
    <div className="space-y-4">
      {/* 摘要 */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="text-lg font-bold text-amber-300">
          {ch.totalLevel > 0 ? `${classSummary}` : '尚未選擇職業'}
        </div>
        <div className="text-xs text-zinc-500">總等級 {ch.totalLevel} / 12</div>

        {ch.warnings.map((w, i) => (
          <div key={i} className="mt-2 rounded bg-red-500/10 px-2 py-1 text-xs text-red-300">
            ⚠ {w}
          </div>
        ))}

        {/* 屬性 */}
        <div className="mt-3 grid grid-cols-6 gap-1 text-center">
          {ABILITY_ORDER.map((k) => (
            <div key={k} className="rounded bg-zinc-800/80 py-1.5">
              <div className="text-[10px] text-zinc-500">{ABILITY_NAMES[k]}</div>
              <div className="text-sm font-semibold text-zinc-100">{ch.abilities[k]}</div>
              <div className="text-[11px] text-amber-300">{fmt(ch.mods[k])}</div>
            </div>
          ))}
        </div>

        {/* 衍生數值 */}
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
          <Stat label="生命值" value={ch.totalLevel > 0 ? `${ch.hp}` : '—'} />
          <Stat label="基礎 AC" value={`${ch.ac}`} hint={ch.acNote} />
          <Stat label="先攻" value={fmt(ch.initiative)} />
          <Stat label="熟練加值" value={`+${ch.profBonus}`} />
          <Stat label="速度" value={`${ch.speed}m`} />
          <Stat
            label="豁免熟練"
            value={ch.savingThrows.length ? ch.savingThrows.map((a) => ABILITY_NAMES[a]).join('・') : '—'}
          />
        </div>
      </div>

      {/* 施法 */}
      {(ch.spellcasting.length > 0 || ch.pactSlots) && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="mb-2 text-sm font-semibold text-zinc-100">施法</div>
          {ch.spellcasting.map((sc) => (
            <div key={sc.classId} className="flex items-center justify-between py-1 text-sm">
              <span className="text-zinc-400">{sc.className}（{ABILITY_NAMES[sc.ability]}）</span>
              <span className="text-zinc-200">
                豁免 DC <b className="text-amber-300">{sc.dc}</b>・攻擊 <b className="text-amber-300">{fmt(sc.attackBonus)}</b>
              </span>
            </div>
          ))}
          {ch.sharedSlots.some((n) => n > 0) && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {ch.sharedSlots.map((n, i) =>
                n > 0 ? (
                  <span key={i} className="rounded bg-sky-500/15 px-2 py-0.5 text-xs text-sky-300">
                    {i + 1} 環 ×{n}
                  </span>
                ) : null,
              )}
            </div>
          )}
          {ch.pactSlots && (
            <div className="mt-2">
              <span className="rounded bg-violet-500/15 px-2 py-0.5 text-xs text-violet-300">
                魔契法術位：{ch.pactSlots.slotLevel} 環 ×{ch.pactSlots.slots}（短休回復）
              </span>
            </div>
          )}
        </div>
      )}

      {/* 技能熟練 */}
      {ch.skills.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="mb-2 text-sm font-semibold text-zinc-100">技能熟練</div>
          <div className="flex flex-wrap gap-1.5">
            {ch.skills.map((s) => {
              const skill = SKILL_MAP[s.id];
              const bonus = skill ? ch.mods[skill.ability] + ch.profBonus : 0;
              return (
                <span
                  key={s.id}
                  title={`來源：${s.source}`}
                  className="cursor-help rounded bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-300"
                >
                  {skill?.name ?? s.id} {fmt(bonus)}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* 已獲得特性 */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <button
          onClick={() => setShowFeatures((v) => !v)}
          className="flex w-full items-center justify-between text-sm font-semibold text-zinc-100"
        >
          <span>已獲得能力（{ch.features.length}）</span>
          <span className="text-zinc-500">{showFeatures ? '收合 ▲' : '展開 ▼'}</span>
        </button>
        {showFeatures && (
          <div className="mt-2 space-y-3">
            {grouped.map(([source, list]) => (
              <div key={source}>
                <div className="mb-1 text-xs font-semibold text-amber-300/80">{source}</div>
                <ul className="space-y-1">
                  {list.map((f, i) => (
                    <li key={i} title={f.desc} className="cursor-help text-sm text-zinc-300">
                      <span className="text-zinc-600">{f.level ? `Lv${f.level} ` : ''}</span>
                      {f.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {ch.features.length === 0 && (
              <p className="text-sm text-zinc-600">選擇種族與職業後，這裡會即時列出所有能力。</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded bg-zinc-800/80 px-2 py-1.5" title={hint}>
      <div className="text-[10px] text-zinc-500">{label}</div>
      <div className={`font-semibold text-zinc-100 ${value.length > 6 ? 'text-xs leading-5' : ''}`}>{value}</div>
    </div>
  );
}
