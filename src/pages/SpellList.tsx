import { useMemo, useState } from 'react';
import { SPELLS, SPELL_SCHOOLS } from '../data/spells';
import { CLASSES } from '../data/classes';
import { ABILITY_NAMES } from '../types';

const ACTION_LABEL: Record<string, string> = {
  action: '動作',
  bonus: '附贈動作',
  reaction: '反應',
};

const LEVEL_OPTIONS = [
  { value: -1, label: '全部' },
  { value: 0, label: '戲法' },
  ...[1, 2, 3, 4, 5, 6].map((n) => ({ value: n, label: `${n} 環` })),
];

const CASTER_CLASSES = CLASSES.filter((c) => c.casterType !== 'none');

export default function SpellList() {
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState(-1);
  const [cls, setCls] = useState('');
  const [school, setSchool] = useState('');
  const [action, setAction] = useState('');
  const [concOnly, setConcOnly] = useState(false);
  const [dmgOnly, setDmgOnly] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SPELLS.filter((s) => {
      if (level >= 0 && s.level !== level) return false;
      if (cls && !s.classes.includes(cls)) return false;
      if (school && s.school !== school) return false;
      if (action && s.action !== action) return false;
      if (concOnly && !s.concentration) return false;
      if (dmgOnly && (!s.damage || s.damage.type === '治療')) return false;
      if (q && !s.name.toLowerCase().includes(q) && !s.nameEn.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query, level, cls, school, action, concOnly, dmgOnly]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-100">法術</h1>

      {/* 篩選列 */}
      <div className="mb-4 space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="flex flex-wrap items-center gap-2">
          {LEVEL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setLevel(opt.value)}
              className={`rounded-md px-3 py-1 text-sm transition-colors ${
                level === opt.value
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜尋法術名稱…"
            className="w-56 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
          />
          <select value={cls} onChange={(e) => setCls(e.target.value)} className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-zinc-300">
            <option value="">所有職業</option>
            {CASTER_CLASSES.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select value={school} onChange={(e) => setSchool(e.target.value)} className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-zinc-300">
            <option value="">所有學派</option>
            {SPELL_SCHOOLS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select value={action} onChange={(e) => setAction(e.target.value)} className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-zinc-300">
            <option value="">所有施法動作</option>
            <option value="action">動作</option>
            <option value="bonus">附贈動作</option>
            <option value="reaction">反應</option>
          </select>
          <label className="flex cursor-pointer items-center gap-1.5 text-sm text-zinc-400">
            <input type="checkbox" checked={concOnly} onChange={(e) => setConcOnly(e.target.checked)} className="accent-amber-500" />
            需專注
          </label>
          <label className="flex cursor-pointer items-center gap-1.5 text-sm text-zinc-400">
            <input type="checkbox" checked={dmgOnly} onChange={(e) => setDmgOnly(e.target.checked)} className="accent-amber-500" />
            傷害法術
          </label>
          <span className="ml-auto text-sm text-zinc-500">{filtered.length} / {SPELLS.length} 個法術</span>
        </div>
      </div>

      {/* 法術卡片 */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => (
          <div key={s.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-semibold text-amber-200">{s.name}</span>
              <span className="shrink-0 text-xs text-zinc-500">{s.nameEn}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
              <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300">
                {s.level === 0 ? '戲法' : `${s.level} 環`}
              </span>
              <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300">{s.school}</span>
              <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300">{ACTION_LABEL[s.action]}</span>
              {s.concentration && (
                <span className="rounded bg-violet-500/15 px-1.5 py-0.5 text-violet-300">專注</span>
              )}
              {s.attack === 'save' && s.save && (
                <span className="rounded bg-sky-500/15 px-1.5 py-0.5 text-sky-300">
                  {ABILITY_NAMES[s.save]}豁免{s.halfOnSave ? '・半傷' : ''}
                </span>
              )}
              {(s.attack === 'melee' || s.attack === 'ranged') && (
                <span className="rounded bg-sky-500/15 px-1.5 py-0.5 text-sky-300">
                  {s.attack === 'melee' ? '近戰' : '遠程'}法術攻擊
                </span>
              )}
              {s.damage && (
                <span className={`rounded px-1.5 py-0.5 ${s.damage.type === '治療' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}`}>
                  {s.damage.dice} {s.damage.type}
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-zinc-400">{s.desc}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {s.classes.map((cid) => {
                const c = CASTER_CLASSES.find((x) => x.id === cid);
                return (
                  <span key={cid} className="rounded bg-zinc-800/70 px-1.5 py-0.5 text-[11px] text-zinc-500">
                    {c?.name ?? cid}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="py-10 text-center text-zinc-500">沒有符合條件的法術。</p>
      )}
      <p className="mt-6 text-xs text-zinc-600">
        資料以遊戲內數值為準，手工整理中，不含子職業額外法術；戲法傷害骰於角色 5 級與 10 級時各 +1 顆。
      </p>
    </div>
  );
}
