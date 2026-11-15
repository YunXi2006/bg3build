export interface WeaponDef {
  id: string;
  name: string;
  nameEn: string;
  /** 傷害骰，如 "1d8"、"2d6" */
  dice: string;
  /** 使用屬性：STR / DEX / finesse（取力量或敏捷較高者） */
  ability: 'STR' | 'DEX' | 'finesse';
  damageType: string;
  twoHanded?: boolean;
  heavy?: boolean;
  ranged?: boolean;
  light?: boolean;
  /** 雙手持用時的傷害骰（可塑武器） */
  versatileDice?: string;
}

export const WEAPONS: WeaponDef[] = [
  { id: 'greatsword', name: '巨劍', nameEn: 'Greatsword', dice: '2d6', ability: 'STR', damageType: '揮砍', twoHanded: true, heavy: true },
  { id: 'greataxe', name: '巨斧', nameEn: 'Greataxe', dice: '1d12', ability: 'STR', damageType: '揮砍', twoHanded: true, heavy: true },
  { id: 'maul', name: '大槌', nameEn: 'Maul', dice: '2d6', ability: 'STR', damageType: '鈍擊', twoHanded: true, heavy: true },
  { id: 'halberd', name: '戟', nameEn: 'Halberd', dice: '1d10', ability: 'STR', damageType: '揮砍', twoHanded: true, heavy: true },
  { id: 'glaive', name: '長柄刀', nameEn: 'Glaive', dice: '1d10', ability: 'STR', damageType: '揮砍', twoHanded: true, heavy: true },
  { id: 'pike', name: '長槍', nameEn: 'Pike', dice: '1d10', ability: 'STR', damageType: '穿刺', twoHanded: true, heavy: true },
  { id: 'longsword', name: '長劍', nameEn: 'Longsword', dice: '1d8', ability: 'STR', damageType: '揮砍', versatileDice: '1d10' },
  { id: 'battleaxe', name: '戰斧', nameEn: 'Battleaxe', dice: '1d8', ability: 'STR', damageType: '揮砍', versatileDice: '1d10' },
  { id: 'warhammer', name: '戰錘', nameEn: 'Warhammer', dice: '1d8', ability: 'STR', damageType: '鈍擊', versatileDice: '1d10' },
  { id: 'trident', name: '三叉戟', nameEn: 'Trident', dice: '1d6', ability: 'STR', damageType: '穿刺', versatileDice: '1d8' },
  { id: 'spear', name: '長矛', nameEn: 'Spear', dice: '1d6', ability: 'STR', damageType: '穿刺', versatileDice: '1d8' },
  { id: 'quarterstaff', name: '木棍', nameEn: 'Quarterstaff', dice: '1d6', ability: 'STR', damageType: '鈍擊', versatileDice: '1d8' },
  { id: 'mace', name: '硬頭錘', nameEn: 'Mace', dice: '1d6', ability: 'STR', damageType: '鈍擊' },
  { id: 'morningstar', name: '釘頭錘', nameEn: 'Morningstar', dice: '1d8', ability: 'STR', damageType: '穿刺' },
  { id: 'flail', name: '連枷', nameEn: 'Flail', dice: '1d8', ability: 'STR', damageType: '鈍擊' },
  { id: 'rapier', name: '細劍', nameEn: 'Rapier', dice: '1d8', ability: 'finesse', damageType: '穿刺' },
  { id: 'shortsword', name: '短劍', nameEn: 'Shortsword', dice: '1d6', ability: 'finesse', damageType: '穿刺', light: true },
  { id: 'scimitar', name: '彎刀', nameEn: 'Scimitar', dice: '1d6', ability: 'finesse', damageType: '揮砍', light: true },
  { id: 'dagger', name: '匕首', nameEn: 'Dagger', dice: '1d4', ability: 'finesse', damageType: '穿刺', light: true },
  { id: 'handaxe', name: '手斧', nameEn: 'Handaxe', dice: '1d6', ability: 'STR', damageType: '揮砍', light: true },
  { id: 'longbow', name: '長弓', nameEn: 'Longbow', dice: '1d8', ability: 'DEX', damageType: '穿刺', ranged: true, twoHanded: true, heavy: true },
  { id: 'shortbow', name: '短弓', nameEn: 'Shortbow', dice: '1d6', ability: 'DEX', damageType: '穿刺', ranged: true, twoHanded: true },
  { id: 'heavy-crossbow', name: '重弩', nameEn: 'Heavy Crossbow', dice: '1d10', ability: 'DEX', damageType: '穿刺', ranged: true, twoHanded: true, heavy: true },
  { id: 'light-crossbow', name: '輕弩', nameEn: 'Light Crossbow', dice: '1d8', ability: 'DEX', damageType: '穿刺', ranged: true, twoHanded: true },
  { id: 'hand-crossbow', name: '手弩', nameEn: 'Hand Crossbow', dice: '1d6', ability: 'DEX', damageType: '穿刺', ranged: true, light: true },
  { id: 'unarmed', name: '徒手（武僧武術）', nameEn: 'Unarmed Strike', dice: '1d4', ability: 'finesse', damageType: '鈍擊' },
];

export const WEAPON_MAP: Record<string, WeaponDef> = Object.fromEntries(
  WEAPONS.map((w) => [w.id, w]),
);
