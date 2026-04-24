// 生气场景配置
export interface Scenario {
  id: string;
  title: string;
  description: string;
  initialMood: string;
}

export const scenarios: Scenario[] = [
  {
    id: 'anniversary',
    title: '纪念日被忘记',
    description: '今天是你们在一起100天的纪念日，你完全忘记了',
    initialMood: '委屈又失望',
  },
  {
    id: 'birthday',
    title: '生日被忽视',
    description: '昨天是你的生日，TA 说要加班，只发了一条消息',
    initialMood: '难过又生气',
  },
  {
    id: 'ignoring',
    title: '消息被忽略',
    description: '你发了好几条消息，TA 过了一整天才回，而且只回了一个字',
    initialMood: '生气又无奈',
  },
  {
    id: 'work_overtime',
    title: '说好陪伴却加班',
    description: '周末说好一起过，结果TA临时说要加班，你的计划泡汤了',
    initialMood: '失落又恼火',
  },
  {
    id: 'broken_promise',
    title: '约定被打破',
    description: '上次说好的事情，TA 完全没有做到，已经是好几次了',
    initialMood: '累积的失望',
  },
  {
    id: 'bad_attitude',
    title: '态度不好',
    description: 'TA 今天说话态度很差，感觉很不耐烦，你不知道自己哪里做错了',
    initialMood: '委屈又困惑',
  },
  {
    id: 'forgot_things',
    title: '东西被弄丢',
    description: '你让TA帮忙收的东西，TA给弄丢了，而且是借朋友的贵重物品',
    initialMood: '又急又气',
  },
  {
    id: 'cold_response',
    title: '敷衍回应',
    description: '你兴致勃勃地跟TA分享今天的事，TA只是"嗯"、"哦"、"哈哈"',
    initialMood: '兴致全无',
  },
];

export function getRandomScenario(): Scenario {
  const index = Math.floor(Math.random() * scenarios.length);
  return scenarios[index];
}

export function getScenarioById(id: string): Scenario | undefined {
  return scenarios.find((s) => s.id === id);
}
