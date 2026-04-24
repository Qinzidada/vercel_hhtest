'use client';

import { use, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Volume2, Heart, Loader2, AlertCircle } from 'lucide-react';
import { getCharacterById, Character } from '@/lib/characters';
import { getRandomScenario, Scenario } from '@/lib/scenarios';
import { cn } from '@/lib/utils';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  emotionChange?: number;
  isTyping?: boolean;
}

interface GameState {
  character: Character;
  scenario: Scenario;
  emotion: number;
  messages: ChatMessage[];
  options: string[];
  isLoading: boolean;
  maxRounds: number;
  currentRound: number;
  gameOver: boolean;
  won: boolean;
}

export default function GamePage({ params }: { params: Promise<{ character: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [ttsSpeaking, setTtsSpeaking] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(true);

  const [gameState, setGameState] = useState<GameState>(() => {
    const character = getCharacterById(resolvedParams.character) || getCharacterById('xiaoxue')!;
    const scenario = getRandomScenario();
    return {
      character,
      scenario,
      emotion: 30,
      messages: [],
      options: [],
      isLoading: true,
      maxRounds: 8,
      currentRound: 0,
      gameOver: false,
      won: false,
    };
  });

  // 检查TTS支持
  useEffect(() => {
    if (typeof window !== 'undefined' && !('speechSynthesis' in window)) {
      setTtsSupported(false);
    }
  }, []);

  // 初始化游戏
  useEffect(() => {
    startGame();
  }, []);

  // 自动滚动到最新消息
  useEffect(() => {
    scrollToBottom();
  }, [gameState.messages]);

  // 滚动到底部的函数
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  const startGame = async () => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: gameState.character.id,
          scenarioId: gameState.scenario.id,
          emotion: gameState.emotion,
          history: [],
        }),
      });

      const data = await response.json();

      // 添加AI消息（初始内容为空，带打字动画）
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: '',
        isTyping: true,
      };

      setGameState((prev) => ({
        ...prev,
        isLoading: false,
        messages: [...prev.messages, aiMessage],
        options: data.options || [],
      }));

      // 开始打字机效果
      await typewriterEffect(data.reply, gameState.messages.length);
    } catch (error) {
      console.error('Failed to start game:', error);
      setGameState((prev) => ({
        ...prev,
        isLoading: false,
        options: ['对不起，我错了', '我能理解你的感受', '我们可以好好谈谈吗', '给我一次机会', '我很在乎你'],
      }));
    }
  };

  const typewriterEffect = async (text: string, messageIndex: number): Promise<void> => {
    // 模拟打字机效果，逐步更新消息内容
    for (let i = 0; i <= text.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 30 + Math.random() * 20));
      setGameState((prev) => ({
        ...prev,
        messages: prev.messages.map((msg, idx) =>
          idx === messageIndex ? { ...msg, content: text.slice(0, i) } : msg
        ),
      }));
      // 打字过程中持续滚动
      scrollToBottom();
    }

    // 打字完成，移除 isTyping 标记
    setGameState((prev) => ({
      ...prev,
      messages: prev.messages.map((msg, idx) =>
        idx === messageIndex ? { ...msg, isTyping: false } : msg
      ),
    }));
  };

  const handleSelectOption = async (option: string) => {
    if (gameState.isLoading) return;

    // 如果最后一条助手消息正在打字，先停止打字效果
    const lastAssistantMsg = [...gameState.messages].reverse().find(m => m.role === 'assistant');
    if (lastAssistantMsg?.isTyping) {
      // 找到正在打字的最后一条消息的索引
      const typingMsgIndex = gameState.messages.findLastIndex(m => m.role === 'assistant' && m.isTyping);
      // 完成打字效果并更新状态
      setGameState((prev) => ({
        ...prev,
        messages: prev.messages.map((msg, idx) =>
          idx === typingMsgIndex ? { ...msg, isTyping: false } : msg
        ),
      }));
    }

    // 添加用户消息
    const userMessage: ChatMessage = {
      role: 'user',
      content: option,
    };

    setGameState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      options: [],
      isLoading: true,
    }));

    // 立即滚动到底部显示用户消息
    setTimeout(scrollToBottom, 50);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: gameState.character.id,
          scenarioId: gameState.scenario.id,
          emotion: gameState.emotion,
          history: gameState.messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userChoice: option,
        }),
      });

      const data = await response.json();

      const newEmotion = data.emotion;
      const newRound = gameState.currentRound + 1;
      const isWon = newEmotion >= 80;
      const isLost = newRound >= gameState.maxRounds && newEmotion < 80;

      // 添加AI消息（初始内容为空，带打字动画）
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: '',
        emotionChange: data.emotionChange,
        isTyping: true,
      };

      // 记录当前消息数量，用于计算新AI消息的索引
      const currentMsgCount = gameState.messages.length;

      setGameState((prev) => {
        // 添加AI消息（初始内容为空，带打字动画）
        const aiMessage: ChatMessage = {
          role: 'assistant',
          content: '',
          emotionChange: data.emotionChange,
          isTyping: true,
        };

        return {
          ...prev,
          emotion: newEmotion,
          messages: [...prev.messages, aiMessage],
          options: data.options || [],
          isLoading: false,
          currentRound: newRound,
          gameOver: isWon || isLost,
          won: isWon,
        };
      });

      // 开始打字机效果，使用之前的消息数量作为索引
      await typewriterEffect(data.reply, currentMsgCount + 1);

      // 如果游戏结束，跳转到结果页
      if (isWon || isLost) {
        setTimeout(() => {
          router.push(`/result?won=${isWon}&emotion=${newEmotion}&character=${gameState.character.id}&scenarioId=${gameState.scenario.id}`);
        }, 1500);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setGameState((prev) => ({
        ...prev,
        isLoading: false,
        options: ['对不起，我错了', '我能理解你的感受', '我们可以好好谈谈吗', '给我一次机会', '我很在乎你'],
      }));
    }
  };

  // TTS 播放功能
  const speakText = (text: string) => {
    if (!ttsSupported || ttsSpeaking) return;

    // 取消之前的朗读
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    // 根据角色调整音色
    if (gameState.character.id === 'xiaoxue') {
      utterance.rate = 0.85;
      utterance.pitch = 1.1;
    } else if (gameState.character.id === 'yaoyao') {
      utterance.rate = 0.8;
      utterance.pitch = 0.95;
    } else if (gameState.character.id === 'tingting') {
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
    }

    utterance.onstart = () => setTtsSpeaking(true);
    utterance.onend = () => setTtsSpeaking(false);
    utterance.onerror = () => setTtsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setTtsSpeaking(false);
  };

  const handleBack = () => {
    stopSpeaking();
    router.push('/select');
  };

  // 计算进度条颜色
  const getProgressColor = (emotion: number): string => {
    if (emotion >= 80) return 'bg-green-500';
    if (emotion >= 50) return 'bg-yellow-400';
    if (emotion >= 30) return 'bg-orange-400';
    return 'bg-red-500';
  };

  return (
    <div className="h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex flex-col overflow-hidden">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-pink-100 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="gap-2 text-muted-foreground hover:text-foreground"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4" />
              返回
            </Button>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" fill="currentColor" />
              <span className="font-medium text-foreground">{gameState.character.name}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {gameState.scenario.title}
            </div>
          </div>

          {/* 情绪进度条 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">情绪值</span>
              <span className={cn(
                'font-medium',
                gameState.emotion >= 80 ? 'text-green-600' :
                gameState.emotion >= 50 ? 'text-yellow-600' :
                'text-red-600'
              )}>
                {gameState.emotion}/100
              </span>
            </div>
            <div className="relative">
              <Progress
                value={gameState.emotion}
                className="h-3 bg-pink-100"
              />
              <div
                className={cn(
                  'absolute top-0 left-0 h-full transition-all duration-500 rounded-full',
                  getProgressColor(gameState.emotion)
                )}
                style={{ width: `${gameState.emotion}%` }}
              />
              {/* 80分达标线 */}
              <div
                className="absolute top-0 h-full w-0.5 bg-green-600 opacity-50"
                style={{ left: '80%' }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* 聊天区域 */}
      <main className="flex-1 overflow-hidden">
        <div
          ref={chatContainerRef}
          className="h-full overflow-y-auto p-4"
        >
          <div className="max-w-2xl mx-auto space-y-4">
            {/* 场景说明 */}
            <div className="text-center mb-6">
              <Card className="bg-pink-50/50 border-pink-200">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">
                    {gameState.scenario.description}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 历史消息 */}
            {gameState.messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-3',
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-br-md'
                      : 'bg-white border border-pink-100 text-foreground rounded-bl-md shadow-sm'
                  )}
                >
                  <p className="whitespace-pre-wrap">
                    {message.content}
                    {message.isTyping && (
                      <span className="inline-block w-2 h-4 ml-1 bg-pink-400 animate-pulse" />
                    )}
                  </p>
                  {message.role === 'assistant' && message.emotionChange !== undefined && !message.isTyping && (
                    <div className={cn(
                      'mt-2 text-xs font-medium',
                      message.emotionChange > 0 ? 'text-green-600' : 'text-red-600'
                    )}>
                      {message.emotionChange > 0 ? '+' : ''}{message.emotionChange}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* 加载状态 */}
            {gameState.isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-white border border-pink-100 shadow-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">她在想...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 底部选项区域 */}
      <footer className="bg-white/95 backdrop-blur-sm border-t border-pink-100 p-4 flex-shrink-0 max-h-[280px] overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          {/* TTS 播放按钮 - 使用最后一条助手消息 */}
          {gameState.messages.length > 0 && !gameState.isLoading && (() => {
            const lastAssistantMsg = [...gameState.messages].reverse().find(m => m.role === 'assistant');
            return lastAssistantMsg && !lastAssistantMsg.isTyping ? (
              <div className="mb-3 flex justify-start">
                <Button
                  onClick={() => ttsSpeaking ? stopSpeaking() : speakText(lastAssistantMsg.content)}
                  variant="outline"
                  size="sm"
                  disabled={!ttsSupported}
                  className="gap-2 text-pink-600 border-pink-200 hover:bg-pink-50"
                >
                  <Volume2 className={cn('w-4 h-4', ttsSpeaking && 'animate-pulse')} />
                  {ttsSpeaking ? '停止播放' : '点击听她说'}
                </Button>
              </div>
            ) : null;
          })()}

          {/* 选项按钮 */}
          <div className="space-y-2">
            {gameState.isLoading ? (
              <div className="text-center text-sm text-muted-foreground py-4">
                等待回复中...
              </div>
            ) : gameState.gameOver ? (
              <div className="text-center py-4">
                <p className={cn(
                  'text-lg font-medium',
                  gameState.won ? 'text-green-600' : 'text-red-600'
                )}>
                  {gameState.won ? '恭喜你哄成功了！' : '这次没有哄成功...'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  即将跳转结果页...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {gameState.options.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => handleSelectOption(option)}
                    variant="outline"
                    className={cn(
                      'h-auto py-2 px-3 text-left justify-start whitespace-normal break-words text-sm',
                      'border-pink-200 hover:bg-pink-50 hover:border-pink-300',
                      'transition-all duration-200'
                    )}
                  >
                    <span className="text-pink-400 font-medium mr-2">{index + 1}.</span>
                    <span>{option}</span>
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* TTS不支持提示 */}
          {!ttsSupported && (
            <p className="text-xs text-center text-muted-foreground mt-2">
              您的浏览器不支持语音播放功能
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}
