import { Link } from 'react-router-dom';
import { RACES } from '../data/races';

export default function RaceList() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-100">種族</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {RACES.map((r) => (
          <Link
            key={r.id}
            to={`/races/${r.id}`}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition-colors hover:border-amber-500/50 hover:bg-zinc-900"
          >
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-semibold text-amber-300">{r.name}</span>
              <span className="text-xs text-zinc-500">{r.nameEn}</span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{r.desc}</p>
            <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
              <span className="rounded bg-zinc-800 px-2 py-0.5 text-zinc-300">速度 {r.speed}m</span>
              <span className="rounded bg-zinc-800 px-2 py-0.5 text-zinc-300">{r.size}</span>
              {r.subraces.length > 0 && (
                <span className="rounded bg-zinc-800 px-2 py-0.5 text-zinc-300">{r.subraces.length} 子種族</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
