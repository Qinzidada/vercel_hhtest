'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, RefreshCw, Home, Sparkles, Frown } from 'lucide-react';
import { getCharacterById } from '@/lib/characters';
import { getScenarioById } from '@/lib/scenarios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  const won = searchParams.get('won') === 'true';
  const emotion = parseInt(searchParams.get('emotion') || '0', 10);
  const characterId = searchParams.get('character') || 'xiaoxue';
  const scenarioId = searchParams.get('scenarioId') || '';
  const character = getCharacterById(characterId);
  const scenario = getScenarioById(scenarioId);

  // 自动保存游戏记录
  useEffect(() => {
    if (hasSaved) return;

    const saveGameRecord = async () => {
      if (!user) {
        // 未登录用户
        setDialogMessage('登录后可保存你的游戏记录');
        setShowDialog(true);
        setHasSaved(true);
        return;
      }

      setIsSaving(true);
      try {
        const response = await fetch('/api/game-record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            scenario: scenario?.title || '未知场景',
            final_score: emotion,
            result: won ? 'win' : 'lose',
          }),
        });

        if (response.ok) {
          setDialogMessage('您的游戏记录已经保存');
          setHasSaved(true);
        } else {
          setDialogMessage('保存失败，请稍后重试');
        }
      } catch (error) {
        console.error('保存游戏记录失败:', error);
        setDialogMessage('网络错误，保存失败');
      } finally {
        setIsSaving(false);
        setShowDialog(true);
      }
    };

    // 延迟一下再保存，让用户先看到结果
    const timer = setTimeout(saveGameRecord, 1500);
    return () => clearTimeout(timer);
  }, [user, emotion, won, scenario, hasSaved]);

  const handlePlayAgain = () => {
    router.push(`/game/${characterId}`);
  };

  const handleBackToSelect = () => {
    router.push('/select');
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* 结果卡片 */}
        <Card className={cn(
          'border-2 transition-all duration-500',
          won
            ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50'
            : 'border-red-200 bg-gradient-to-br from-red-50 to-orange-50'
        )}>
          <CardContent className="p-8 text-center">
            {/* 图标 */}
            <div className={cn(
              'w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6',
              won
                ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                : 'bg-gradient-to-br from-red-400 to-orange-500'
            )}>
              {won ? (
                <Heart className="w-12 h-12 text-white" fill="white" />
              ) : (
                <Frown className="w-12 h-12 text-white" />
              )}
            </div>

            {/* 标题 */}
            <h1 className={cn(
              'text-3xl font-bold mb-2',
              won ? 'text-green-600' : 'text-red-600'
            )}>
              {won ? '恭喜你！' : '差一点就成功了...'}
            </h1>

            {/* 副标题 */}
            <p className="text-lg text-muted-foreground mb-6">
              {won
                ? `你成功哄好了${character?.name || '她'}！`
                : `${character?.name || '她'}还需要更多耐心...`}
            </p>

            {/* 情绪值展示 */}
            <div className={cn(
              'rounded-xl p-4 mb-6',
              won ? 'bg-green-100/50' : 'bg-red-100/50'
            )}>
              <p className="text-sm text-muted-foreground mb-1">最终情绪值</p>
              <p className={cn(
                'text-4xl font-bold',
                won ? 'text-green-600' : 'text-red-600'
              )}>
                {emotion}
                <span className="text-lg text-muted-foreground">/100</span>
              </p>
            </div>

            {/* 评价 */}
            <div className="bg-white/60 rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground">
                {won ? (
                  <>
                    <Sparkles className="w-4 h-4 inline-block mr-1 text-yellow-500" />
                    你的真诚打动了她，恭喜你获得&ldquo;哄神&rdquo;称号！
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 inline-block mr-1 text-pink-500" />
                    哄人需要技巧和耐心，下次一定能成功！
                  </>
                )}
              </p>
            </div>

            {/* 角色信息 */}
            {character && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-8">
                <Heart className="w-4 h-4 text-pink-400" fill="currentColor" />
                <span>{character.name} ({character.type})</span>
              </div>
            )}

            {/* 按钮 */}
            <div className="space-y-3">
              <Button
                onClick={handlePlayAgain}
                size="lg"
                className={cn(
                  'w-full h-14 text-lg transition-all duration-200 hover:scale-105',
                  won
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-200'
                    : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg shadow-pink-200'
                )}
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                再玩一次
              </Button>

              <div className="flex gap-3">
                <Button
                  onClick={handleBackToSelect}
                  variant="outline"
                  className="flex-1 border-pink-200 hover:bg-pink-50"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  换个人哄
                </Button>

                <Button
                  onClick={handleBackToHome}
                  variant="outline"
                  className="flex-1 border-pink-200 hover:bg-pink-50"
                >
                  <Home className="w-4 h-4 mr-2" />
                  返回首页
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 底部提示 */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          感谢游玩哄哄模拟器 2.0
        </p>
      </div>

      {/* 保存记录提示弹窗 */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md" aria-describedby="dialog-description">
          <DialogHeader>
            <DialogTitle id="dialog-title" className="text-center">
              {isSaving ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-pink-500" />
                  保存中...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  {user ? (
                    <>
                      <Heart className="w-5 h-5 text-pink-500" fill="currentColor" />
                      <span>游戏记录</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-yellow-500" />
                      <span>温馨提示</span>
                    </>
                  )}
                </div>
              )}
            </DialogTitle>
          </DialogHeader>
          <div id="dialog-description" className="text-center py-4">
            <p className="text-muted-foreground">{dialogMessage}</p>
            {!user && (
              <Button
                onClick={() => {
                  setShowDialog(false);
                  router.push('/login');
                }}
                className="mt-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              >
                去登录
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 使用 Suspense 包裹以支持 useSearchParams
export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}

// 辅助函数
function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
