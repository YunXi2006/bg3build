import { Link } from 'react-router-dom';
import { CLASSES } from '../data/classes';
import { ABILITY_NAMES } from '../types';

const CASTER_LABEL: Record<string, string> = {
  full: '全施法者',
  half: '半施法者',
  pact: '魔契施法',
  third: '部分施法',
  none: '不施法',
};

export default function ClassList() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-100">職業</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CLASSES.map((c) => (
          <Link
            key={c.id}
            to={`/classes/${c.id}`}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition-colors hover:border-amber-500/50 hover:bg-zinc-900"
          >
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-semibold text-amber-300">{c.name}</span>
              <span className="text-xs text-zinc-500">{c.nameEn}</span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{c.desc}</p>
            <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
              <span className="rounded bg-zinc-800 px-2 py-0.5 text-zinc-300">生命骰 d{c.hitDie}</span>
              <span className="rounded bg-zinc-800 px-2 py-0.5 text-zinc-300">
                主屬性 {c.primaryAbilities.map((a) => ABILITY_NAMES[a]).join('／')}
              </span>
              <span className="rounded bg-zinc-800 px-2 py-0.5 text-zinc-300">{CASTER_LABEL[c.casterType]}</span>
              <span className="rounded bg-zinc-800 px-2 py-0.5 text-zinc-300">{c.subclasses.length} 子職業</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
