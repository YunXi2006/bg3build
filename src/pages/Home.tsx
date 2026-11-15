import { Link } from 'react-router-dom';
import { CLASSES } from '../data/classes';
import { RACES } from '../data/races';
import { SKILLS } from '../data/skills';
import { SPELLS } from '../data/spells';

const CARDS = [
  { to: '/classes', title: '職業', count: `${CLASSES.length} 職業・${CLASSES.reduce((n, c) => n + c.subclasses.length, 0)} 子職業`, desc: '瀏覽 12 個職業的完整等級進度、特性與法術位成長。' },
  { to: '/races', title: '種族', count: `${RACES.length} 種族・${RACES.reduce((n, r) => n + r.subraces.length, 0)} 子種族`, desc: '各種族與子種族的特性、速度與天賦能力。' },
  { to: '/spells', title: '法術', count: `${SPELLS.length} 個法術・0~6 環`, desc: '可依環位、職業、學派與施法動作篩選搜尋。' },
  { to: '/skills', title: '技能與背景', count: `${SKILLS.length} 技能・12 背景`, desc: '18 項技能與對應屬性，以及各背景給予的熟練。' },
];

export default function Home() {
  return (
    <div>
      <section className="py-10 text-center">
        <h1 className="text-4xl font-bold text-zinc-100">
          博德之門 3 <span className="text-amber-400">Build 模擬器</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
          瀏覽所有職業、種族與技能資料，模擬你的角色養成路線，
          即時檢視取得的能力與傷害期望。
        </p>
        <p className="mt-3 text-sm text-zinc-500">
          Build 模擬器與傷害期望計算開發中（Phase 3 / Phase 4）。
        </p>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition-colors hover:border-amber-500/50 hover:bg-zinc-900"
          >
            <div className="text-lg font-semibold text-amber-300">{c.title}</div>
            <div className="mt-1 text-xs text-zinc-500">{c.count}</div>
            <p className="mt-3 text-sm text-zinc-400">{c.desc}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
