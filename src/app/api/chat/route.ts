import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { getCharacterById } from '@/lib/characters';
import { getScenarioById } from '@/lib/scenarios';
import {
  buildSystemPrompt,
  buildOptionsPrompt,
  parseOptionsFromResponse,
  parseAIResponse,
  calculateEmotionChange,
} from '@/lib/prompts';

interface ChatRequest {
  characterId: string;
  scenarioId: string;
  emotion: number;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
  userChoice?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { characterId, scenarioId, emotion, history, userChoice } = body;

    // 获取角色和场景配置
    const character = getCharacterById(characterId);
    const scenario = getScenarioById(scenarioId);

    if (!character || !scenario) {
      return NextResponse.json(
        { error: '角色或场景配置错误' },
        { status: 400 }
      );
    }

    // 初始化 LLM 客户端
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // 构建消息
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

    // 如果是用户选择了选项，需要先生成AI对用户选择的回应
    if (userChoice && history.length > 0) {
      const systemPrompt = buildSystemPrompt(character, scenario);
      messages.push({ role: 'system', content: systemPrompt });

      // 添加对话历史
      for (const h of history) {
        messages.push({
          role: h.role,
          content: h.content,
        });
      }

      // 添加用户的回复
      messages.push({
        role: 'user',
        content: `男友回复：${userChoice}\n\n请以${character.name}的身份回复这条消息，表达你的情绪反应。回复要符合角色设定，带有情绪。`,
      });

      // 调用 LLM 生成回复
      let fullReply = '';
      for await (const chunk of client.stream(messages, { temperature: 0.8 })) {
        if (chunk.content) {
          fullReply += chunk.content.toString();
        }
      }

      // 计算情绪变化
      const emotionChange = calculateEmotionChange(userChoice);
      const newEmotion = Math.max(0, Math.min(100, emotion + emotionChange));

      // 解析AI回复
      const parsed = parseAIResponse(fullReply, emotion, emotionChange);
      const finalEmotion = parsed.emotion;

      // 生成下一轮的选项
      const optionsMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
      optionsMessages.push({ role: 'system', content: '你是一个选项生成器，只需要输出JSON数组，不要任何其他内容。' });
      optionsMessages.push({
        role: 'user',
        content: buildOptionsPrompt(character, scenario, finalEmotion, [
          ...history,
          { role: 'assistant', content: fullReply },
        ]),
      });

      let optionsText = '';
      for await (const chunk of client.stream(optionsMessages, { temperature: 0.7 })) {
        if (chunk.content) {
          optionsText += chunk.content.toString();
        }
      }

      const options = parseOptionsFromResponse(optionsText);

      return NextResponse.json({
        reply: parsed.reply,
        emotion: finalEmotion,
        status: parsed.status,
        options,
        emotionChange,
      });
    }

    // 首次对话，生成初始回复和选项
    const systemPrompt = buildSystemPrompt(character, scenario);
    messages.push({ role: 'system', content: systemPrompt });
    messages.push({
      role: 'user',
      content: `男友说了"${scenario.description}"，请以${character.name}的身份回复，表达你的不满和情绪。回复要符合${character.type}的性格设定。`,
    });

    let fullReply = '';
    for await (const chunk of client.stream(messages, { temperature: 0.8 })) {
      if (chunk.content) {
        fullReply += chunk.content.toString();
      }
    }

    // 生成选项
    const optionsMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
    optionsMessages.push({ role: 'system', content: '你是一个选项生成器，只需要输出JSON数组，不要任何其他内容。' });
    optionsMessages.push({
      role: 'user',
      content: buildOptionsPrompt(character, scenario, emotion, []),
    });

    let optionsText = '';
    for await (const chunk of client.stream(optionsMessages, { temperature: 0.7 })) {
      if (chunk.content) {
        optionsText += chunk.content.toString();
      }
    }

    const options = parseOptionsFromResponse(optionsText);

    return NextResponse.json({
      reply: fullReply,
      emotion,
      status: 'angry',
      options,
      emotionChange: 0,
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: '服务器错误，请重试' },
      { status: 500 }
    );
  }
}
