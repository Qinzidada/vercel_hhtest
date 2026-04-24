'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Sparkles, MessageCircle, BookOpen, Trophy } from 'lucide-react';
import { Header } from '@/components/Header';

export default function HomePage() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/select');
  };

  const handleBlog = () => {
    router.push('/blog');
  };

  const handleLeaderboard = () => {
    router.push('/leaderboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* 主容器 */}
          <div className="flex flex-col items-center gap-8">
            {/* 图标区域 */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-lg">
                <Heart className="w-12 h-12 text-white" fill="white" />
              </div>
              <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-pink-400 animate-pulse" />
              <Sparkles className="absolute -bottom-1 -left-3 w-6 h-6 text-rose-400 animate-pulse delay-100" />
            </div>

            {/* 标题 */}
            <div className="text-center space-y-3">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 bg-clip-text text-transparent">
                哄哄模拟器 2.0
              </h1>
              <p className="text-lg text-muted-foreground">
                她生气了，快去哄哄她吧！
              </p>
            </div>

            {/* 说明卡片 */}
            <Card className="w-full border-pink-100 bg-white/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-4 h-4 text-pink-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">AI 智能对话</h3>
                      <p className="text-sm text-muted-foreground">
                        由 AI 扮演正在生气的女朋友，你需要用合适的话术哄好她
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                      <Heart className="w-4 h-4 text-rose-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">情绪值系统</h3>
                      <p className="text-sm text-muted-foreground">
                        每轮对话都会影响情绪值，将她哄到开心你就赢了
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-pink-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">多种角色</h3>
                      <p className="text-sm text-muted-foreground">
                        不同性格的女朋友等你来挑战：傲娇、敏感、直爽
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 开始按钮 */}
            <Button
              onClick={handleStart}
              size="lg"
              className="w-full max-w-xs h-14 text-lg bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg shadow-pink-200 transition-all duration-200 hover:scale-105"
            >
              <Heart className="w-5 h-5 mr-2" fill="currentColor" />
              开始游戏
            </Button>

            {/* 功能按钮组 */}
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
              {/* 恋爱攻略入口 */}
              <Button
                onClick={handleBlog}
                variant="outline"
                size="lg"
                className="flex-1 h-12 text-base border-pink-200 hover:bg-pink-50 hover:border-pink-300 transition-all duration-200"
              >
                <BookOpen className="w-5 h-5 mr-2 text-pink-500" />
                恋爱攻略
              </Button>

              {/* 排行榜入口 */}
              <Button
                onClick={handleLeaderboard}
                variant="outline"
                size="lg"
                className="flex-1 h-12 text-base border-pink-200 hover:bg-pink-50 hover:border-pink-300 transition-all duration-200"
              >
                <Trophy className="w-5 h-5 mr-2 text-pink-500" />
                排行榜
              </Button>
            </div>

            {/* 底部提示 */}
            <p className="text-xs text-muted-foreground text-center">
              选择合适的话术，用真诚打动她的心
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
