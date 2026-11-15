import type { BackgroundDef } from '../types';

export const BACKGROUNDS: BackgroundDef[] = [
  { id: 'acolyte', name: '侍僧', nameEn: 'Acolyte', desc: '在神殿中侍奉神祇，通曉儀式與教義。', skills: ['insight', 'religion'] },
  { id: 'charlatan', name: '騙徒', nameEn: 'Charlatan', desc: '靠話術與騙局維生，擅長操弄人心。', skills: ['deception', 'sleight-of-hand'] },
  { id: 'criminal', name: '罪犯', nameEn: 'Criminal', desc: '遊走法律邊緣，與地下社會關係匪淺。', skills: ['deception', 'stealth'] },
  { id: 'entertainer', name: '藝人', nameEn: 'Entertainer', desc: '以表演娛樂大眾，享受聚光燈下的生活。', skills: ['acrobatics', 'performance'] },
  { id: 'folk-hero', name: '平民英雄', nameEn: 'Folk Hero', desc: '出身平凡，因挺身而出而受人民愛戴。', skills: ['animal-handling', 'survival'] },
  { id: 'guild-artisan', name: '公會工匠', nameEn: 'Guild Artisan', desc: '手藝精湛的工匠，熟悉商會與貿易。', skills: ['insight', 'persuasion'] },
  { id: 'haunted-one', name: '縈繞之人', nameEn: 'Haunted One', desc: '被黑暗過往糾纏，直面他人不敢想像的恐懼。', skills: ['intimidation', 'medicine'] },
  { id: 'noble', name: '貴族', nameEn: 'Noble', desc: '生於權貴之家，深諳上流社會的規則。', skills: ['history', 'persuasion'] },
  { id: 'outlander', name: '化外之民', nameEn: 'Outlander', desc: '在荒野中長大，習於嚴酷的自然環境。', skills: ['athletics', 'survival'] },
  { id: 'sage', name: '學者', nameEn: 'Sage', desc: '窮盡一生鑽研知識與典籍。', skills: ['arcana', 'history'] },
  { id: 'soldier', name: '士兵', nameEn: 'Soldier', desc: '受過正規軍事訓練，久經沙場。', skills: ['athletics', 'intimidation'] },
  { id: 'urchin', name: '流浪兒', nameEn: 'Urchin', desc: '在街頭掙扎求生，身手敏捷、懂得藏匿。', skills: ['sleight-of-hand', 'stealth'] },
];
