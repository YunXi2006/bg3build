import { useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import type { DerivedCharacter } from '../engine/derive';
import type { BuildState } from '../store/build';
import { weaponDpr, spellDpr, type AdvState } from '../engine/dpr';
import { WEAPONS, WEAPON_MAP } from '../data/weapons';
import { SPELLS, SPELL_MAP } from '../data/spells';

type Mode = 'weapon' | 'spell';
type FightingStyle = 'none' | 'archery' | 'duelling' | 'gwf' | 'twf';

const fmt1 = (n: number) => (Math.round(n * 10) / 10).toFixed(1);

export default function DprPanel({ ch, build }: { ch: DerivedCharacter; build: BuildState }) {
  const [mode, setMode] = useState<Mode>('weapon');
  const [targetAC, setTargetAC] = useState(15);
  const [adv, setAdv] = useState<AdvState>('normal');

  // 武器模式
  const [weaponId, setWeaponId] = useState('greatsword');
  const [weaponBonus, setWeaponBonus] = useState(0);
  const [style, setStyle] = useState<FightingStyle>('none');
  const [useRage, setUseRage] = useState(false);
  const [usePowerAttack, setUsePowerAttack] = useState(false); // GWM / 神射手
  const [useHex, setUseHex] = useState(false);
  const [bonusAttacks, setBonusAttacks] = useState(0);

  // 法術模式
  const [spellId, setSpellId] = useState('fire-bolt');
  const [slotLevel, setSlotLevel] = useState(0);
  const [saveBonus, setSaveBonus] = useState(3);
  const [agonizing, setAgonizing] = useState(false);

  /* ---------- 從 Build 自動偵測 ---------- */
  const detect = useMemo(() => {
    const names = ch.features.map((f) => f.name);
    const attacks = names.includes('額外攻擊強化') ? 3 : names.includes('額外攻擊') ? 2 : 1;
    const rogue = ch.classLevels.find((c) => c.classId === 'rogue');
    const sneakDice = rogue ? `${Math.ceil(rogue.level / 2)}d6` : '';
    const champion = ch.classLevels.some((c) => c.subclassId === 'champion');
    const barb = ch.classLevels.find((c) => c.classId === 'barbarian');
    const monk = ch.classLevels.find((c) => c.classId === 'monk');
    const paladin = ch.classLevels.find((c) => c.classId === 'paladin');
    const warlock = ch.classLevels.find((c) => c.classId === 'warlock');
    const feats = build.levels.map((l) => l.featId).filter(Boolean) as string[];
    return {
      attacks,
      sneakDice,
      critRange: champion ? 19 : 20,
      brutalDies: (barb && barb.level >= 9 ? 1 : 0) + (build.raceId === 'half-orc' ? 1 : 0),
      rageBonus: barb ? (barb.level >= 9 ? 3 : 2) : 0,
      hasBarb: !!barb,
      monkDie: monk ? (monk.level >= 11 ? '1d8' : monk.level >= 5 ? '1d6' : '1d4') : '1d4',
      improvedSmite: paladin && paladin.level >= 11,
      hasGwm: feats.includes('great-weapon-master'),
      hasSharpshooter: feats.includes('sharpshooter'),
      canAgonize: !!warlock && warlock.level >= 2,
    };
  }, [ch, build]);

  const weapon = WEAPON_MAP[weaponId];

  /* ---------- 武器 DPR ---------- */
  const weaponResult = useMemo(() => {
    if (!weapon || ch.totalLevel === 0) return null;
    const abilityMod =
      weapon.ability === 'STR' ? ch.mods.STR
        : weapon.ability === 'DEX' ? ch.mods.DEX
          : Math.max(ch.mods.STR, ch.mods.DEX);

    const dice = weaponId === 'unarmed' ? detect.monkDie : weapon.dice;
    const powerAttackOk = usePowerAttack && (weapon.ranged ? detect.hasSharpshooter : detect.hasGwm && weapon.heavy);

    let flat = abilityMod + weaponBonus;
    if (useRage && detect.hasBarb && !weapon.ranged) flat += detect.rageBonus;
    if (style === 'duelling' && !weapon.ranged && !weapon.twoHanded) flat += 2;
    if (powerAttackOk) flat += 10;

    let atkBonus = abilityMod + ch.profBonus + weaponBonus;
    if (style === 'archery' && weapon.ranged) atkBonus += 2;
    if (powerAttackOk) atkBonus -= 5;

    const perHit: string[] = [];
    if (useHex) perHit.push('1d6');
    if (detect.improvedSmite && !weapon.ranged) perHit.push('1d8');

    const calc = (ac: number) =>
      weaponDpr({
        attackBonus: atkBonus,
        targetAC: ac,
        adv,
        critRange: detect.critRange,
        attacks: detect.attacks,
        bonusAttacks,
        weaponDice: dice,
        rerollLow: style === 'gwf' && !!weapon.twoHanded && !weapon.ranged,
        flatBonus: flat,
        perHitDice: perHit.join('+'),
        oncePerTurnDice: detect.sneakDice,
        extraCritDies: weapon.ranged ? 0 : detect.brutalDies,
      });

    return { atkBonus, calc, result: calc(targetAC), powerAttackOk };
  }, [weapon, weaponId, weaponBonus, style, useRage, usePowerAttack, useHex, bonusAttacks, adv, targetAC, ch, detect]);

  /* ---------- 法術 DPR ---------- */
  const damageSpells = useMemo(() => {
    const classIds = ch.classLevels.map((c) => c.classId);
    const list = SPELLS.filter((s) => s.damage && s.damage.type !== '治療');
    const own = list.filter((s) => s.classes.some((c) => classIds.includes(c)));
    return own.length > 0 ? own : list;
  }, [ch.classLevels]);

  const spell = SPELL_MAP[spellId] ?? damageSpells[0];
  const spellcaster = ch.spellcasting[0];

  const spellResult = useMemo(() => {
    if (!spell || ch.totalLevel === 0) return null;
    const sc = ch.spellcasting.find((s) => spell.classes.includes(s.classId)) ?? spellcaster;
    const dc = sc?.dc ?? 8 + ch.profBonus;
    const atk = sc?.attackBonus ?? ch.profBonus;
    const slot = spell.level === 0 ? 0 : Math.max(slotLevel, spell.level);
    const agMod = agonizing && detect.canAgonize ? ch.mods.CHA : 0;

    const calc = (acOrSave: number, isSave: boolean) =>
      spellDpr({
        spell,
        slotLevel: slot,
        characterLevel: ch.totalLevel,
        spellAttackBonus: atk,
        spellDC: dc,
        targetAC: isSave ? targetAC : acOrSave,
        targetSaveBonus: isSave ? acOrSave : saveBonus,
        adv,
        agonizingMod: agMod,
      });

    const isSave = spell.attack === 'save';
    return { dc, atk, isSave, calc, result: calc(isSave ? saveBonus : targetAC, isSave) };
  }, [spell, slotLevel, saveBonus, agonizing, adv, targetAC, ch, detect, spellcaster]);

  /* ---------- 圖表資料 ---------- */
  const chartData = useMemo(() => {
    if (ch.totalLevel === 0) return [];
    if (mode === 'weapon' && weaponResult) {
      return Array.from({ length: 13 }, (_, i) => {
        const ac = 10 + i;
        return { x: ac, dpr: Math.round(weaponResult.calc(ac).dpr * 10) / 10 };
      });
    }
    if (mode === 'spell' && spellResult && spellResult.result) {
      if (spellResult.isSave) {
        return Array.from({ length: 11 }, (_, i) => ({
          x: i,
          dpr: Math.round((spellResult.calc(i, true)?.dpr ?? 0) * 10) / 10,
        }));
      }
      return Array.from({ length: 13 }, (_, i) => {
        const ac = 10 + i;
        return { x: ac, dpr: Math.round((spellResult.calc(ac, false)?.dpr ?? 0) * 10) / 10 };
      });
    }
    return [];
  }, [mode, weaponResult, spellResult, ch.totalLevel]);

  if (ch.totalLevel === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="text-sm font-semibold text-zinc-100">傷害期望（DPR）</div>
        <p className="mt-2 text-sm text-zinc-600">先選擇職業與等級，這裡會即時計算每回合傷害期望。</p>
      </div>
    );
  }

  const active = mode === 'weapon' ? weaponResult?.result : spellResult?.result;
  const xLabel = mode === 'spell' && spellResult?.isSave ? '目標豁免加值' : '目標 AC';
  const refX = mode === 'spell' && spellResult?.isSave ? saveBonus : targetAC;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-zinc-100">傷害期望（DPR）</span>
        <div className="flex rounded-md bg-zinc-800 p-0.5">
          {(['weapon', 'spell'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded px-2.5 py-1 text-xs ${mode === m ? 'bg-amber-500/25 text-amber-200' : 'text-zinc-400'}`}
            >
              {m === 'weapon' ? '武器攻擊' : '法術'}
            </button>
          ))}
        </div>
      </div>

      {/* 共用：目標與優勢 */}
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
        <label className="flex items-center gap-1 text-zinc-400">
          目標 AC
          <input
            type="number" min={8} max={30} value={targetAC}
            onChange={(e) => setTargetAC(Number(e.target.value))}
            className="w-14 rounded border border-zinc-700 bg-zinc-900 px-1.5 py-1 text-zinc-200"
          />
        </label>
        <div className="flex rounded-md bg-zinc-800 p-0.5">
          {([['dis', '劣勢'], ['normal', '普通'], ['adv', '優勢']] as [AdvState, string][]).map(([v, label]) => (
            <button
              key={v}
              onClick={() => setAdv(v)}
              className={`rounded px-2 py-1 ${adv === v ? 'bg-sky-500/25 text-sky-200' : 'text-zinc-400'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {mode === 'weapon' && weaponResult && (
        <div className="space-y-2 text-xs">
          <div className="flex flex-wrap gap-2">
            <select value={weaponId} onChange={(e) => setWeaponId(e.target.value)} className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-200">
              {WEAPONS.map((w) => (
                <option key={w.id} value={w.id}>{w.name}（{w.id === 'unarmed' ? detect.monkDie : w.dice}）</option>
              ))}
            </select>
            <select value={weaponBonus} onChange={(e) => setWeaponBonus(Number(e.target.value))} className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-200">
              {[0, 1, 2, 3].map((n) => <option key={n} value={n}>+{n} 武器</option>)}
            </select>
            <select value={style} onChange={(e) => setStyle(e.target.value as FightingStyle)} className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-200">
              <option value="none">無戰鬥風格</option>
              <option value="archery">射術（遠程 +2 命中）</option>
              <option value="duelling">決鬥（單手 +2 傷害）</option>
              <option value="gwf">巨武（雙手重擲 1、2）</option>
            </select>
            <select value={bonusAttacks} onChange={(e) => setBonusAttacks(Number(e.target.value))} className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-200">
              <option value={0}>無附贈動作攻擊</option>
              <option value={1}>附贈動作攻擊 ×1</option>
              <option value={2}>疾風連擊 ×2</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-3">
            {detect.hasBarb && (
              <Toggle checked={useRage} onChange={setUseRage} label={`狂暴 +${detect.rageBonus}`} />
            )}
            {(detect.hasGwm || detect.hasSharpshooter) && (
              <Toggle
                checked={usePowerAttack}
                onChange={setUsePowerAttack}
                label={weapon?.ranged ? '神射手 −5/+10' : '巨武大師 −5/+10'}
                disabled={!(weapon?.ranged ? detect.hasSharpshooter : detect.hasGwm && weapon?.heavy)}
              />
            )}
            <Toggle checked={useHex} onChange={setUseHex} label="妖術／獵人印記 +1d6" />
          </div>
          <div className="text-zinc-500">
            命中加值 <b className="text-zinc-300">+{weaponResult.atkBonus}</b>・
            攻擊次數 <b className="text-zinc-300">{detect.attacks + bonusAttacks}</b>
            {detect.sneakDice && <>・偷襲 <b className="text-zinc-300">{detect.sneakDice}</b></>}
            {detect.critRange < 20 && <>・爆擊 <b className="text-zinc-300">19-20</b></>}
          </div>
        </div>
      )}

      {mode === 'spell' && spellResult && (
        <div className="space-y-2 text-xs">
          <div className="flex flex-wrap gap-2">
            <select value={spell?.id} onChange={(e) => { setSpellId(e.target.value); setSlotLevel(SPELL_MAP[e.target.value]?.level ?? 0); }} className="max-w-56 rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-200">
              {damageSpells.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.level === 0 ? '戲法' : `${s.level}環`}・{s.name}（{s.damage?.dice} {s.damage?.type}）
                </option>
              ))}
            </select>
            {spell && spell.level > 0 && (
              <select value={Math.max(slotLevel, spell.level)} onChange={(e) => setSlotLevel(Number(e.target.value))} className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-200">
                {[1, 2, 3, 4, 5, 6].filter((n) => n >= spell.level).map((n) => (
                  <option key={n} value={n}>以 {n} 環施放</option>
                ))}
              </select>
            )}
            {spellResult.isSave && (
              <label className="flex items-center gap-1 text-zinc-400">
                目標豁免加值
                <input
                  type="number" min={-2} max={12} value={saveBonus}
                  onChange={(e) => setSaveBonus(Number(e.target.value))}
                  className="w-14 rounded border border-zinc-700 bg-zinc-900 px-1.5 py-1 text-zinc-200"
                />
              </label>
            )}
          </div>
          {spell?.id === 'eldritch-blast' && detect.canAgonize && (
            <Toggle checked={agonizing} onChange={setAgonizing} label={`痛苦爆轟（每道 +${ch.mods.CHA}）`} />
          )}
          <div className="text-zinc-500">
            {spellResult.isSave
              ? <>豁免 DC <b className="text-zinc-300">{spellResult.dc}</b></>
              : <>法術攻擊 <b className="text-zinc-300">+{spellResult.atk}</b></>}
            {spellResult.result?.note.map((n, i) => <span key={i}>・{n}</span>)}
          </div>
        </div>
      )}

      {/* 結果 */}
      {active && (
        <div className="mt-3 rounded-lg bg-zinc-800/70 px-3 py-2">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-zinc-400">每回合期望傷害</span>
            <span className="text-2xl font-bold text-amber-300">{fmt1(active.dpr)}</span>
          </div>
          <div className="mt-0.5 text-right text-[11px] text-zinc-500">
            {mode === 'spell' && spellResult?.isSave
              ? `豁免失敗率 ${Math.round(active.pHit * 100)}%`
              : `命中率 ${Math.round(active.pHit * 100)}%・爆擊率 ${Math.round(active.pCrit * 100)}%`}
          </div>
        </div>
      )}

      {/* 折線圖 */}
      {chartData.length > 0 && (
        <div className="mt-3 h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 8, bottom: 0, left: -24 }}>
              <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
              <XAxis dataKey="x" stroke="#52525b" fontSize={10} tickLine={false}
                label={{ value: xLabel, position: 'insideBottom', offset: -2, fill: '#52525b', fontSize: 10 }} />
              <YAxis stroke="#52525b" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#a1a1aa' }}
                formatter={(v) => [`${v}`, 'DPR']}
                labelFormatter={(l) => `${xLabel} ${l}`}
              />
              <ReferenceLine x={refX} stroke="#f59e0b" strokeDasharray="4 2" />
              <Line type="monotone" dataKey="dpr" stroke="#fbbf24" strokeWidth={2} dot={{ r: 2, fill: '#fbbf24' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <p className="mt-2 text-[11px] leading-4 text-zinc-600">
        簡化模型：未計入裝備特效、戰技與至聖斬消耗；偷襲以期望值近似。
      </p>
    </div>
  );
}

function Toggle({ checked, onChange, label, disabled }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean;
}) {
  return (
    <label className={`flex items-center gap-1.5 ${disabled ? 'opacity-40' : 'cursor-pointer'} text-zinc-300`}>
      <input
        type="checkbox" checked={checked} disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-amber-500"
      />
      {label}
    </label>
  );
}
