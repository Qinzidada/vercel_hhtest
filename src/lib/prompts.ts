// AI 提示词配置

export function buildSystemPrompt(character: {
  name: string;
  type: string;
  description: string;
  personality: string[];
  speakingStyle: string;
}, scenario: { title: string; description: string }): string {
  return `你是${character.name}，一个${character.type}的女朋友，正在和男朋友闹别扭。

## 角色设定
- 性格特点：${character.personality.join('、')}
- 说话风格：${character.speakingStyle}
- 当前状态：${scenario.description}

## 重要规则
1. 你必须始终保持"女朋友"的身份，不能脱离角色
2. 回复必须带有情绪表达（生气、委屈、失望、稍微软化等）
3. 不得直接说"你说得对，我原谅你了"（除非情绪值达到80以上）
4. 不得一次性将情绪值归零
5. 禁止人身攻击、辱骂、极端情绪表达
6. 禁止性暗示或涉及现实人物影射

## 情绪系统
当前情绪值为0-100，初始30：
- 0-30：很生气，冷淡敷衍
- 31-50：有点生气，开始表达不满
- 51-70：逐渐软化，但还是有点情绪
- 71-85：基本消气，愿意沟通
- 86-100：完全原谅，可以和好

## 回复要求
1. 回复长度控制在50-100字
2. 要体现情绪的变化过程
3. 可以翻旧账、表达不满
4. 后期可以逐渐露出心软的一面

请根据当前情绪值，生成符合角色的回复。`;
}

export function buildOptionsPrompt(
  character: {
    name: string;
    type: string;
    speakingStyle: string;
  },
  scenario: { description: string },
  emotion: number,
  history: Array<{ role: 'user' | 'assistant'; content: string }>
): string {
  return `你是${character.name}，当前正在和男朋友闹别扭。

## 当前场景
${scenario.description}

## 当前情绪值
${emotion}/100（${getEmotionDescription(emotion)}）

## 对话历史
${history.map((h) => `${h.role === 'user' ? '男友' : character.name}：${h.content}`).join('\n')}

## 任务
请生成5个男友可能说的话，其中：
- 至少2个是"正向"选项（共情、道歉、认错、承诺等），会让情绪值上升
- 至少1-2个是"中性"选项（解释、询问等）
- 1个是"负向"选项（敷衍、推卸责任、继续刺激等），会让情绪值下降

请直接输出JSON数组格式，每个选项25字以内：
["选项1", "选项2", "选项3", "选项4", "选项5"]`;
}

function getEmotionDescription(emotion: number): string {
  if (emotion <= 30) return '很生气';
  if (emotion <= 50) return '有点生气';
  if (emotion <= 70) return '逐渐软化';
  if (emotion <= 85) return '基本消气';
  return '完全原谅';
}

export function parseOptionsFromResponse(content: string): string[] {
  // 尝试从响应中提取JSON数组
  try {
    // 移除可能的markdown代码块标记
    const cleaned = content.replace(/```json\n?|```\n?/g, '').trim();
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed) && parsed.length === 5) {
        return parsed.map((s) => String(s).trim());
      }
    }
  } catch {
    // 解析失败
  }
  // 返回默认选项
  return [
    '对不起，我知道错了',
    '我不是故意的，你听我解释',
    '你怎么又生气了',
    '行行行，都是我的错',
    '随便你怎么想',
  ];
}

export function calculateEmotionChange(userChoice: string): number {
  const choice = userChoice.toLowerCase();
  
  // 正向选项（上升）
  if (choice.includes('对不起') || choice.includes('抱歉') || choice.includes('错了')) {
    return 15;
  }
  if (choice.includes('理解') || choice.includes('懂') || choice.includes('共情') || choice.includes('感受')) {
    return 20;
  }
  if (choice.includes('哄') || choice.includes('亲亲') || choice.includes('抱抱')) {
    return 18;
  }
  if (choice.includes('承诺') || choice.includes('保证') || choice.includes('以后')) {
    return 12;
  }
  if (choice.includes('心疼') || choice.includes('愧疚')) {
    return 15;
  }
  
  // 负向选项（下降）
  if (choice.includes('随便') || choice.includes('爱') && (choice.includes('怎么') || choice.includes('怎样'))) {
    return -20;
  }
  if (choice.includes('你') && choice.includes('也') && (choice.includes('不对') || choice.includes('有问题'))) {
    return -15;
  }
  if (choice.includes('又') && (choice.includes('怎么了') || choice.includes('什么事'))) {
    return -10;
  }
  if (choice.includes('不是') && choice.includes('我的')) {
    return -15;
  }
  if (choice.includes('算了') || choice.includes('无所谓')) {
    return -20;
  }
  
  // 中性选项（小幅度变化）
  return 5;
}

export interface AIResponse {
  reply: string;
  emotion: number;
  status: 'angry' | 'softening' | 'happy';
}

export function parseAIResponse(content: string, currentEmotion: number, emotionChange: number): AIResponse {
  let reply = content;
  let emotion = currentEmotion + emotionChange;
  
  // 确保情绪值在0-100范围内
  emotion = Math.max(0, Math.min(100, emotion));
  
  // 确定状态
  let status: 'angry' | 'softening' | 'happy';
  if (emotion >= 80) {
    status = 'happy';
  } else if (emotion >= 40) {
    status = 'softening';
  } else {
    status = 'angry';
  }
  
  // 尝试从回复中提取情绪值（如果AI输出了的话）
  const emotionMatch = content.match(/情绪[值:]?\s*(\d+)/);
  if (emotionMatch) {
    const extractedEmotion = parseInt(emotionMatch[1], 10);
    if (extractedEmotion >= 0 && extractedEmotion <= 100) {
      emotion = extractedEmotion;
      if (emotion >= 80) status = 'happy';
      else if (emotion >= 40) status = 'softening';
      else status = 'angry';
    }
  }
  
  // 清理回复中的情绪标注
  reply = reply.replace(/情绪[值:]?\s*\d+\s*[-+]?\d*/g, '').trim();
  
  return { reply, emotion, status };
}
