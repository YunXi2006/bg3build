import type { SkillDef } from '../types';

export const SKILLS: SkillDef[] = [
  { id: 'athletics', name: '運動', nameEn: 'Athletics', ability: 'STR', desc: '攀爬、跳躍、推撞與摔技等體能活動。' },
  { id: 'acrobatics', name: '特技', nameEn: 'Acrobatics', ability: 'DEX', desc: '保持平衡、翻滾、抵抗推撞與摔絆。' },
  { id: 'sleight-of-hand', name: '巧手', nameEn: 'Sleight of Hand', ability: 'DEX', desc: '扒竊、開鎖、解除陷阱等精細手上功夫。' },
  { id: 'stealth', name: '隱匿', nameEn: 'Stealth', ability: 'DEX', desc: '躲藏與潛行，不被敵人察覺。' },
  { id: 'arcana', name: '奧秘', nameEn: 'Arcana', ability: 'INT', desc: '關於法術、魔法物品與位面的知識。' },
  { id: 'history', name: '歷史', nameEn: 'History', ability: 'INT', desc: '關於歷史事件、王國與古代文明的知識。' },
  { id: 'investigation', name: '調查', nameEn: 'Investigation', ability: 'INT', desc: '搜尋線索、推理細節與找出隱藏之物。' },
  { id: 'nature', name: '自然', nameEn: 'Nature', ability: 'INT', desc: '關於地形、動植物與天氣的知識。' },
  { id: 'religion', name: '宗教', nameEn: 'Religion', ability: 'INT', desc: '關於神祇、宗教儀式與神聖符號的知識。' },
  { id: 'animal-handling', name: '馴獸', nameEn: 'Animal Handling', ability: 'WIS', desc: '安撫、駕馭與理解動物的意圖。' },
  { id: 'insight', name: '洞悉', nameEn: 'Insight', ability: 'WIS', desc: '判斷他人的真實意圖與謊言。' },
  { id: 'medicine', name: '醫藥', nameEn: 'Medicine', ability: 'WIS', desc: '穩定瀕死者與診斷疾病。' },
  { id: 'perception', name: '感知', nameEn: 'Perception', ability: 'WIS', desc: '察覺周遭環境中的事物與潛藏的危險。' },
  { id: 'survival', name: '生存', nameEn: 'Survival', ability: 'WIS', desc: '追蹤、狩獵與在野外辨別方向。' },
  { id: 'deception', name: '欺瞞', nameEn: 'Deception', ability: 'CHA', desc: '說謊與誤導他人。' },
  { id: 'intimidation', name: '威嚇', nameEn: 'Intimidation', ability: 'CHA', desc: '以威脅或武力迫使他人就範。' },
  { id: 'performance', name: '表演', nameEn: 'Performance', ability: 'CHA', desc: '音樂、舞蹈與戲劇等演出。' },
  { id: 'persuasion', name: '說服', nameEn: 'Persuasion', ability: 'CHA', desc: '以理服人、談判與打動人心。' },
];

export const SKILL_MAP: Record<string, SkillDef> = Object.fromEntries(
  SKILLS.map((s) => [s.id, s]),
);
