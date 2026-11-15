import { Link, useParams } from 'react-router-dom';
import { CLASS_MAP } from '../data/classes';
import { SKILL_MAP } from '../data/skills';
import {
  FULL_CASTER_SLOTS,
  HALF_CASTER_SLOTS,
  THIRD_CASTER_SLOTS,
  PACT_MAGIC,
} from '../data/progressions';
import { ABILITY_NAMES, proficiencyBonus } from '../types';

const LEVELS = Array.from({ length: 12 }, (_, i) => i + 1);

function slotTableFor(casterType: string): number[][] | null {
  switch (casterType) {
    case 'full':
      return FULL_CASTER_SLOTS;
    case 'half':
      return HALF_CASTER_SLOTS;
    case 'third':
      return THIRD_CASTER_SLOTS;
    default:
      return null;
  }
}

export default function ClassDetail() {
  const { id } = useParams();
  const cls = id ? CLASS_MAP[id] : undefined;

  if (!cls) {
    return (
      <div>
        <p className="text-zinc-400">找不到這個職業。</p>
        <Link to="/classes" className="text-amber-400 hover:underline">
          ← 回職業列表
        </Link>
      </div>
    );
  }

  const slots = slotTableFor(cls.casterType);
  const maxSpellLevel = slots
    ? Math.max(...slots.map((row) => row.filter((n) => n > 0).length))
    : 0;

  return (
    <div>
      <Link to="/classes" className="text-sm text-zinc-500 hover:text-amber-400">
        ← 職業列表
      </Link>
      <div className="mt-2 flex items-baseline gap-3">
        <h1 className="text-3xl font-bold text-amber-300">{cls.name}</h1>
        <span className="text-zinc-500">{cls.nameEn}</span>
      </div>
      <p className="mt-2 max-w-3xl text-zinc-400">{cls.desc}</p>

      {/* 基本資料 */}
      <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
        <InfoCard title="生命骰">
          d{cls.hitDie}（1 級 HP = {cls.hitDie} + 體質調整值）
        </InfoCard>
        <InfoCard title="豁免熟練">
          {cls.savingThrows.map((a) => ABILITY_NAMES[a]).join('、')}
        </InfoCard>
        <InfoCard title="施法屬性">
          {cls.spellcastingAbility ? ABILITY_NAMES[cls.spellcastingAbility] : '—'}
        </InfoCard>
        <InfoCard title="護甲熟練">{cls.armor.length ? cls.armor.join('、') : '無'}</InfoCard>
        <InfoCard title="武器熟練">{cls.weapons.join('、')}</InfoCard>
        <InfoCard title="技能選擇">
          從下列技能選 {cls.skillChoices.count} 項：
          {cls.skillChoices.from.map((s) => SKILL_MAP[s]?.name ?? s).join('、')}
        </InfoCard>
      </div>

      {/* 等級進度表 */}
      <h2 className="mt-10 mb-3 text-xl font-semibold text-zinc-100">等級進度</h2>
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-zinc-900 text-left text-zinc-400">
            <tr>
              <th className="px-3 py-2">等級</th>
              <th className="px-3 py-2">熟練加值</th>
              <th className="px-3 py-2">獲得特性</th>
              {cls.casterType === 'pact' && (
                <>
                  <th className="px-3 py-2">魔契法術位</th>
                  <th className="px-3 py-2">法術位環位</th>
                </>
              )}
              {slots &&
                Array.from({ length: maxSpellLevel }, (_, i) => (
                  <th key={i} className="px-2 py-2 text-center">
                    {i + 1} 環
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {LEVELS.map((lv) => {
              const feats = cls.features.filter((f) => f.level === lv);
              return (
                <tr key={lv} className="border-t border-zinc-800/70 hover:bg-zinc-900/40">
                  <td className="px-3 py-2 font-semibold text-amber-300">{lv}</td>
                  <td className="px-3 py-2 text-zinc-400">+{proficiencyBonus(lv)}</td>
                  <td className="px-3 py-2">
                    {lv === cls.subclassLevel && (
                      <span className="mr-1 rounded bg-amber-500/15 px-1.5 py-0.5 text-xs text-amber-300">
                        選擇{cls.subclassTitle}
                      </span>
                    )}
                    {feats.map((f) => (
                      <span key={f.name + f.desc} title={f.desc} className="mr-1 cursor-help text-zinc-200 underline decoration-dotted decoration-zinc-600 underline-offset-2">
                        {f.name}
                      </span>
                    ))}
                    {feats.length === 0 && lv !== cls.subclassLevel && (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>
                  {cls.casterType === 'pact' && (
                    <>
                      <td className="px-3 py-2 text-center text-zinc-300">{PACT_MAGIC[lv - 1].slots}</td>
                      <td className="px-3 py-2 text-center text-zinc-300">{PACT_MAGIC[lv - 1].slotLevel} 環</td>
                    </>
                  )}
                  {slots &&
                    Array.from({ length: maxSpellLevel }, (_, i) => (
                      <td key={i} className="px-2 py-2 text-center text-zinc-300">
                        {slots[lv - 1][i] || <span className="text-zinc-700">—</span>}
                      </td>
                    ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-zinc-600">將滑鼠移到特性名稱上可查看說明。</p>

      {/* 特性詳細說明 */}
      <h2 className="mt-10 mb-3 text-xl font-semibold text-zinc-100">特性說明</h2>
      <div className="space-y-2">
        {[...cls.features].sort((a, b) => a.level - b.level).map((f, i) => (
          <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3">
            <div className="flex items-baseline gap-2">
              <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400">{f.level} 級</span>
              <span className="font-medium text-zinc-100">{f.name}</span>
              <span className="text-xs text-zinc-500">{f.nameEn}</span>
            </div>
            <p className="mt-1 text-sm text-zinc-400">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* 子職業 */}
      <h2 className="mt-10 mb-3 text-xl font-semibold text-zinc-100">
        {cls.subclassTitle}
        <span className="ml-2 text-sm font-normal text-zinc-500">（{cls.subclassLevel} 級選擇）</span>
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {cls.subclasses.map((s) => (
          <div key={s.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="flex items-baseline justify-between">
              <span className="font-semibold text-amber-200">{s.name}</span>
              <span className="text-xs text-zinc-500">{s.nameEn}</span>
            </div>
            <p className="mt-1.5 text-sm text-zinc-400">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3">
      <div className="text-xs text-zinc-500">{title}</div>
      <div className="mt-1 text-zinc-200">{children}</div>
    </div>
  );
}
