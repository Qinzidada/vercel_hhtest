// 人设配置
export interface Character {
  id: string;
  name: string;
  type: string;
  description: string;
  tagline: string;
  personality: string[];
  speakingStyle: string;
}

export const characters: Character[] = [
  {
    id: 'xiaoxue',
    name: '小雪',
    type: '傲娇型',
    description: '嘴上说不要心里很想要，说话带刺但容易被感动',
    tagline: '哼，我才没有在等你消息呢！',
    personality: [
      '嘴硬心软',
      '说话带刺但容易被打动',
      '需要先哄再哄',
      '生气时喜欢翻旧账',
    ],
    speakingStyle: '傲娇，说话带"哼"、"才不是"、"随便你"等口头禅',
  },
  {
    id: 'yaoyao',
    name: '瑶瑶',
    type: '敏感型',
    description: '容易受伤，需要被理解和共情，说错话容易更难过',
    tagline: '你是不是不在乎我了...',
    personality: [
      '情绪敏感',
      '对细节很在意',
      '需要被理解和共情',
      '容易胡思乱想',
    ],
    speakingStyle: '敏感，说话带委屈感，常用"是不是"、"为什么"等疑问句',
  },
  {
    id: 'tingting',
    name: '婷婷',
    type: '直爽型',
    description: '有话直说，虽然生气但消气也快，喜欢被夸',
    tagline: '你给我说清楚！到底怎么回事！',
    personality: [
      '性格直爽',
      '有话直说不憋着',
      '消气快',
      '喜欢被夸奖',
    ],
    speakingStyle: '直爽，说话直接了当，情绪来得快去得也快',
  },
];

export function getCharacterById(id: string): Character | undefined {
  return characters.find((c) => c.id === id);
}
