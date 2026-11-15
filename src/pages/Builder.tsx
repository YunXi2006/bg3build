import { useEffect, useMemo, useState } from 'react';
import { useBuildStore, pointsSpent, POINT_BUY_TOTAL, type LevelChoice } from '../store/build';
import { encodeBuild, decodeBuild } from '../store/share';
import { deriveCharacter, meetsMulticlassReq, featLevelsOf } from '../engine/derive';
import { RACES, RACE_MAP } from '../data/races';
import { BACKGROUNDS } from '../data/backgrounds';
import { CLASSES, CLASS_MAP } from '../data/classes';
import { SKILL_MAP } from '../data/skills';
import { FEATS, FEAT_MAP } from '../data/feats';
import { ABILITY_NAMES, type AbilityKey } from '../types';
import CharacterPanel from '../components/CharacterPanel';
import DprPanel from '../components/DprPanel';

const ABILITY_ORDER: AbilityKey[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

export default function Builder() {
  const build = useBuildStore();
  const [copied, setCopied] = useState(false);

  // 從分享連結載入 Build，並把參數從網址移除
  useEffect(() => {
    const m = location.hash.match(/[?&]b=([^&]+)/);
    if (!m) return;
    const data = decodeBuild(m[1]);
    if (data) useBuildStore.getState().load(data);
    history.replaceState(null, '', `${location.pathname}${location.search}#/builder`);
  }, []);

  const ch = useMemo(
    () => deriveCharacter(build),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [build.raceId, build.subraceId, build.backgroundId, build.abilities, build.bonus2, build.bonus1, build.skillIds, build.levels],
  );

  const share = async () => {
    const code = encodeBuild(build);
    const url = `${location.origin}${location.pathname}#/builder?b=${code}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      prompt('複製此分享連結：', url);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Build 模擬器</h1>
        <div className="flex gap-2">
          <button
            onClick={share}
            className="rounded-md bg-amber-500/20 px-3 py-1.5 text-sm text-amber-300 hover:bg-amber-500/30"
          >
            {copied ? '已複製連結 ✓' : '分享連結'}
          </button>
          <button
            onClick={() => {
              if (confirm('確定要清空目前的 Build 嗎？')) build.reset();
            }}
            className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 hover:border-red-500/50 hover:text-red-300"
          >
            重置
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <OriginSection />
          <AbilitySection />
          <SkillSection />
          <LevelSection />
        </div>
        <div className="space-y-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto lg:pr-1">
          <DprPanel ch={ch} build={build} />
          <CharacterPanel ch={ch} />
        </div>
      </div>
    </div>
  );
}

/* ---------- 出身：種族／背景 ---------- */
function OriginSection() {
  const { raceId, subraceId, backgroundId, setRace, setSubrace, setBackground } = useBuildStore();
  const race = raceId ? RACE_MAP[raceId] : undefined;

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <h2 className="mb-3 text-lg font-semibold text-zinc-100">1. 出身</h2>
      <div className="flex flex-wrap gap-3">
        <label className="text-sm text-zinc-400">
          種族
          <select
            value={raceId ?? ''}
            onChange={(e) => setRace(e.target.value || undefined, undefined)}
            className="ml-2 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-zinc-200"
          >
            <option value="">選擇種族…</option>
            {RACES.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </label>
        {race && race.subraces.length > 0 && (
          <label className="text-sm text-zinc-400">
            子種族
            <select
              value={subraceId ?? ''}
              onChange={(e) => setSubrace(e.target.value || undefined)}
              className="ml-2 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-zinc-200"
            >
              <option value="">選擇子種族…</option>
              {race.subraces.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </label>
        )}
        <label className="text-sm text-zinc-400">
          背景
          <select
            value={backgroundId ?? ''}
            onChange={(e) => setBackground(e.target.value || undefined)}
            className="ml-2 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-zinc-200"
          >
            <option value="">選擇背景…</option>
            {BACKGROUNDS.map((b) => (
              <option key={b.id} value={b.id}>{b.name}（{b.skills.map((s) => SKILL_MAP[s]?.name).join('、')}）</option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}

/* ---------- 屬性 Point Buy ---------- */
function AbilitySection() {
  const { abilities, setAbility, bonus2, bonus1, setBonus2, setBonus1 } = useBuildStore();
  const spent = pointsSpent(abilities);

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-zinc-100">2. 屬性分配</h2>
        <span className={`text-sm ${spent === POINT_BUY_TOTAL ? 'text-emerald-400' : 'text-zinc-400'}`}>
          已用 {spent} / {POINT_BUY_TOTAL} 點
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {ABILITY_ORDER.map((k) => {
          const bonus = (bonus2 === k ? 2 : 0) + (bonus1 === k ? 1 : 0);
          return (
            <div key={k} className="rounded-lg bg-zinc-800/60 p-2 text-center">
              <div className="text-xs text-zinc-400">{ABILITY_NAMES[k]}</div>
              <div className="my-1 flex items-center justify-center gap-2">
                <button
                  onClick={() => setAbility(k, abilities[k] - 1)}
                  className="h-6 w-6 rounded bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                >
                  −
                </button>
                <span className="w-8 text-lg font-semibold text-zinc-100">
                  {abilities[k]}
                  {bonus > 0 && <span className="text-xs text-amber-400">+{bonus}</span>}
                </span>
                <button
                  onClick={() => setAbility(k, abilities[k] + 1)}
                  className="h-6 w-6 rounded bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                >
                  ＋
                </button>
              </div>
              <div className="flex justify-center gap-1">
                <button
                  onClick={() => setBonus2(bonus2 === k ? undefined : k)}
                  className={`rounded px-1.5 py-0.5 text-[11px] ${bonus2 === k ? 'bg-amber-500/30 text-amber-200' : 'bg-zinc-700/60 text-zinc-500 hover:text-zinc-300'}`}
                >
                  +2
                </button>
                <button
                  onClick={() => setBonus1(bonus1 === k ? undefined : k)}
                  className={`rounded px-1.5 py-0.5 text-[11px] ${bonus1 === k ? 'bg-amber-500/30 text-amber-200' : 'bg-zinc-700/60 text-zinc-500 hover:text-zinc-300'}`}
                >
                  +1
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-zinc-600">
        Point Buy 27 點（8~15，13 以上每點花費 2）；BG3 的種族 +2／+1 可自由指定任兩項屬性。
      </p>
    </section>
  );
}

/* ---------- 首職業技能選擇 ---------- */
function SkillSection() {
  const { levels, skillIds, toggleSkill } = useBuildStore();
  const firstClass = levels[0] ? CLASS_MAP[levels[0].classId] : undefined;
  if (!firstClass) return null;
  const { count, from } = firstClass.skillChoices;
  const chosen = skillIds.filter((s) => from.includes(s));

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-zinc-100">3. 職業技能（{firstClass.name}）</h2>
        <span className={`text-sm ${chosen.length === count ? 'text-emerald-400' : 'text-zinc-400'}`}>
          已選 {chosen.length} / {count}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {from.map((sid) => {
          const active = skillIds.includes(sid);
          return (
            <button
              key={sid}
              onClick={() => toggleSkill(sid, count)}
              className={`rounded-md px-2.5 py-1 text-sm transition-colors ${
                active
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {SKILL_MAP[sid]?.name ?? sid}
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- 等級時間軸 ---------- */
function LevelSection() {
  const { levels, abilities, bonus2, bonus1, addLevel, removeLastLevel } = useBuildStore();

  // 兼職門檻以最終屬性（含種族加值）檢查
  const finalAbilities = useMemo(() => {
    const a = { ...abilities };
    if (bonus2) a[bonus2] += 2;
    if (bonus1) a[bonus1] += 1;
    return a;
  }, [abilities, bonus2, bonus1]);

  const existingClasses = [...new Set(levels.map((l) => l.classId))];

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <h2 className="mb-3 text-lg font-semibold text-zinc-100">4. 等級升級（{levels.length} / 12）</h2>

      <div className="space-y-2">
        {levels.map((lv, i) => (
          <LevelRow key={i} index={i} choice={lv} />
        ))}
      </div>

      {levels.length > 0 && (
        <button
          onClick={removeLastLevel}
          className="mt-2 rounded-md border border-zinc-700 px-2.5 py-1 text-xs text-zinc-500 hover:border-red-500/50 hover:text-red-300"
        >
          移除最後一級
        </button>
      )}

      {levels.length < 12 && (
        <div className="mt-4">
          <div className="mb-2 text-sm text-zinc-400">
            {levels.length === 0 ? '選擇你的起始職業：' : `第 ${levels.length + 1} 級要升哪個職業？`}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CLASSES.map((c) => {
              // 兼職檢查：新增第二個職業（或已兼職）時，新舊職業都要達標
              const isNewClass = !existingClasses.includes(c.id);
              const multiclassing = levels.length > 0 && (existingClasses.length > 1 || isNewClass);
              const ok =
                !multiclassing ||
                (meetsMulticlassReq(c.id, finalAbilities) &&
                  existingClasses.every((id) => meetsMulticlassReq(id, finalAbilities)));
              return (
                <button
                  key={c.id}
                  disabled={!ok}
                  onClick={() => addLevel(c.id)}
                  title={ok ? c.name : '兼職需要雙方職業的主屬性達 13'}
                  className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                    ok
                      ? 'bg-zinc-800 text-zinc-300 hover:bg-amber-500/20 hover:text-amber-300'
                      : 'cursor-not-allowed bg-zinc-800/40 text-zinc-600'
                  }`}
                >
                  {c.name}
                  {existingClasses.includes(c.id) && (
                    <span className="ml-1 text-xs text-zinc-500">
                      {levels.filter((l) => l.classId === c.id).length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

function LevelRow({ index, choice }: { index: number; choice: LevelChoice }) {
  const { levels, updateLevel } = useBuildStore();
  const cls = CLASS_MAP[choice.classId];
  if (!cls) return null;

  // 此列的「職業等級」
  const classLevel = levels.slice(0, index + 1).filter((l) => l.classId === choice.classId).length;
  const needsSubclass = classLevel === cls.subclassLevel;
  const needsFeat = featLevelsOf(choice.classId).includes(classLevel);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-zinc-800/70 bg-zinc-900/50 px-3 py-2">
      <span className="w-14 text-sm font-semibold text-amber-300">Lv {index + 1}</span>
      <span className="rounded bg-zinc-800 px-2 py-0.5 text-sm text-zinc-200">
        {cls.name} {classLevel}
      </span>

      {needsSubclass && (
        <select
          value={choice.subclassId ?? ''}
          onChange={(e) => updateLevel(index, { subclassId: e.target.value || undefined })}
          className={`rounded-md border px-2 py-1 text-sm ${choice.subclassId ? 'border-zinc-700 bg-zinc-900 text-zinc-200' : 'border-amber-500/50 bg-amber-500/10 text-amber-200'}`}
        >
          <option value="">選擇{cls.subclassTitle}…</option>
          {cls.subclasses.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      )}

      {needsFeat && (
        <>
          <select
            value={choice.featId ?? ''}
            onChange={(e) => updateLevel(index, { featId: e.target.value || undefined, asi: undefined })}
            className={`max-w-56 rounded-md border px-2 py-1 text-sm ${choice.featId ? 'border-zinc-700 bg-zinc-900 text-zinc-200' : 'border-amber-500/50 bg-amber-500/10 text-amber-200'}`}
            title={choice.featId ? FEAT_MAP[choice.featId]?.desc : '選擇專長'}
          >
            <option value="">選擇專長…</option>
            {FEATS.map((f) => (
              <option key={f.id} value={f.id} title={f.desc}>{f.name}</option>
            ))}
          </select>
          {choice.featId === 'ability-improvement' && (
            <AsiPicker index={index} choice={choice} />
          )}
        </>
      )}
    </div>
  );
}

function AsiPicker({ index, choice }: { index: number; choice: LevelChoice }) {
  const { updateLevel } = useBuildStore();
  const [a, b] = choice.asi ?? [undefined, undefined];

  const setAsi = (pos: 0 | 1, key: AbilityKey) => {
    const next: [AbilityKey, AbilityKey] = [a ?? 'STR', b ?? 'STR'];
    next[pos] = key;
    updateLevel(index, { asi: next });
  };

  return (
    <span className="flex items-center gap-1 text-sm text-zinc-400">
      {([0, 1] as const).map((pos) => (
        <select
          key={pos}
          value={(pos === 0 ? a : b) ?? ''}
          onChange={(e) => setAsi(pos, e.target.value as AbilityKey)}
          className="rounded-md border border-zinc-700 bg-zinc-900 px-1.5 py-1 text-sm text-zinc-200"
        >
          <option value="">+1…</option>
          {ABILITY_ORDER.map((k) => (
            <option key={k} value={k}>{ABILITY_NAMES[k]}</option>
          ))}
        </select>
      ))}
    </span>
  );
}
