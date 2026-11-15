import { Link, useParams } from 'react-router-dom';
import { RACE_MAP } from '../data/races';

export default function RaceDetail() {
  const { id } = useParams();
  const race = id ? RACE_MAP[id] : undefined;

  if (!race) {
    return (
      <div>
        <p className="text-zinc-400">找不到這個種族。</p>
        <Link to="/races" className="text-amber-400 hover:underline">
          ← 回種族列表
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/races" className="text-sm text-zinc-500 hover:text-amber-400">
        ← 種族列表
      </Link>
      <div className="mt-2 flex items-baseline gap-3">
        <h1 className="text-3xl font-bold text-amber-300">{race.name}</h1>
        <span className="text-zinc-500">{race.nameEn}</span>
      </div>
      <p className="mt-2 max-w-3xl text-zinc-400">{race.desc}</p>

      <div className="mt-4 flex gap-2 text-sm">
        <span className="rounded bg-zinc-800 px-2.5 py-1 text-zinc-300">移動速度 {race.speed} 公尺</span>
        <span className="rounded bg-zinc-800 px-2.5 py-1 text-zinc-300">{race.size}體型</span>
      </div>

      <h2 className="mt-8 mb-3 text-xl font-semibold text-zinc-100">種族特性</h2>
      <ul className="space-y-2">
        {race.traits.map((t, i) => (
          <li key={i} className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-sm text-zinc-300">
            {t}
          </li>
        ))}
      </ul>

      {race.subraces.length > 0 && (
        <>
          <h2 className="mt-8 mb-3 text-xl font-semibold text-zinc-100">子種族</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {race.subraces.map((s) => (
              <div key={s.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold text-amber-200">{s.name}</span>
                  <span className="text-xs text-zinc-500">{s.nameEn}</span>
                </div>
                <p className="mt-1 text-sm text-zinc-500">{s.desc}</p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-zinc-300">
                  {s.traits.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
