import { SKILLS, SKILL_MAP } from '../data/skills';
import { BACKGROUNDS } from '../data/backgrounds';
import { ABILITY_NAMES, type AbilityKey } from '../types';

const ABILITY_ORDER: AbilityKey[] = ['STR', 'DEX', 'INT', 'WIS', 'CHA'];

export default function SkillsPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-100">技能與背景</h1>

      <h2 className="mb-3 text-xl font-semibold text-zinc-100">18 項技能</h2>
      <div className="space-y-6">
        {ABILITY_ORDER.map((ab) => {
          const list = SKILLS.filter((s) => s.ability === ab);
          if (list.length === 0) return null;
          return (
            <div key={ab}>
              <h3 className="mb-2 text-sm font-semibold text-amber-300">
                {ABILITY_NAMES[ab]}（{ab}）
              </h3>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((s) => (
                  <div key={s.id} className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-2.5">
                    <div className="flex items-baseline justify-between">
                      <span className="font-medium text-zinc-100">{s.name}</span>
                      <span className="text-xs text-zinc-500">{s.nameEn}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-400">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="mt-10 mb-3 text-xl font-semibold text-zinc-100">背景</h2>
      <p className="mb-3 text-sm text-zinc-500">選擇背景會獲得兩項技能熟練。</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {BACKGROUNDS.map((b) => (
          <div key={b.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="flex items-baseline justify-between">
              <span className="font-semibold text-amber-200">{b.name}</span>
              <span className="text-xs text-zinc-500">{b.nameEn}</span>
            </div>
            <p className="mt-1 text-sm text-zinc-400">{b.desc}</p>
            <div className="mt-2 flex gap-1.5">
              {b.skills.map((sid) => (
                <span key={sid} className="rounded bg-amber-500/15 px-2 py-0.5 text-xs text-amber-300">
                  {SKILL_MAP[sid]?.name ?? sid}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
