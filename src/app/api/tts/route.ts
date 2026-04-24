import { NextRequest, NextResponse } from 'next/server';

// TTS API - 使用浏览器原生 SpeechSynthesis
// 这个API实际上是前端调用的端点，用于返回TTS配置信息
// 实际的语音合成由前端使用浏览器的 Web Speech API 实现

interface TTSRequest {
  text: string;
  character?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: TTSRequest = await request.json();
    const { character } = body;

    // 返回TTS配置信息
    // 实际的语音合成由前端使用浏览器的 Web Speech API 实现
    const ttsConfig = {
      character: character || 'default',
      // 返回可用的音色列表
      voices: [
        { id: 'default', name: '默认女声', language: 'zh-CN' },
        { id: 'xiaoxue', name: '小雪（傲娇）', language: 'zh-CN' },
        { id: 'yaoyao', name: '瑶瑶（敏感）', language: 'zh-CN' },
        { id: 'tingting', name: '婷婷（直爽）', language: 'zh-CN' },
      ],
      // TTS服务说明
      // 由于浏览器原生TTS不支持自定义音色选择，
      // 我们使用 SpeechSynthesis API 的 rate 和 pitch 参数来模拟不同性格的音色
      voiceSettings: {
        default: { rate: 0.9, pitch: 1.0 },
        xiaoxue: { rate: 0.85, pitch: 1.1 }, // 傲娇 - 稍快、稍高
        yaoyao: { rate: 0.8, pitch: 0.95 }, // 敏感 - 稍慢、稍低
        tingting: { rate: 1.0, pitch: 1.05 }, // 直爽 - 正常速度、稍高
      },
    };

    return NextResponse.json(ttsConfig);
  } catch (error) {
    console.error('TTS Config API Error:', error);
    return NextResponse.json(
      { error: '获取TTS配置失败' },
      { status: 500 }
    );
  }
}
