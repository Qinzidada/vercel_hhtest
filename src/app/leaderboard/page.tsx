'use client';

import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Clock, Heart, Loader2, Crown, Medal, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  final_score: number;
  played_at: string;
  record_id: number;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard');
        if (response.ok) {
          const data = await response.json();
          setLeaderboard(data.leaderboard);
        } else {
          setError('加载排行榜失败');
        }
      } catch (err) {
        console.error('获取排行榜失败:', err);
        setError('网络错误');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-muted-foreground font-medium">{rank}</span>;
    }
  };

  const getRankBgColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-100 to-amber-50 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200';
      default:
        return 'bg-white border-pink-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <Header />
      
      <div className="max-w-2xl mx-auto p-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
            排行榜
          </h1>
          <p className="text-muted-foreground mt-2">
            看看谁是哄人大师
          </p>
        </div>

        <Card className="border-pink-100 bg-white/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                最高分排行
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                前 20 名
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-pink-500 animate-spin" />
                </div>
                <p className="text-muted-foreground">加载中...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <p className="text-red-500">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  size="sm"
                >
                  重试
                </Button>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Trophy className="w-12 h-12 text-pink-300" />
                <p className="text-muted-foreground">暂无排行榜数据</p>
                <p className="text-xs text-muted-foreground">快去游戏，成为第一个上榜的玩家吧！</p>
                <Button
                  onClick={() => router.push('/select')}
                  className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                >
                  开始游戏
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.record_id}
                    className={cn(
                      'flex items-center justify-between p-4 rounded-xl border transition-all',
                      getRankBgColor(entry.rank),
                      entry.user_id === user?.id && 'ring-2 ring-pink-500 ring-offset-2'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      {getRankIcon(entry.rank)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            'font-semibold',
                            entry.rank <= 3 ? 'text-lg' : 'text-base'
                          )}>
                            {entry.username}
                          </span>
                          {entry.user_id === user?.id && (
                            <span className="text-xs px-2 py-0.5 bg-pink-100 text-pink-600 rounded-full">
                              你
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(entry.played_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Heart className={cn(
                          'w-4 h-4',
                          entry.rank <= 3 ? 'text-pink-500' : 'text-pink-400'
                        )} fill="currentColor" />
                        <span className={cn(
                          'font-bold',
                          entry.rank === 1 ? 'text-2xl text-yellow-500' :
                          entry.rank === 2 ? 'text-xl text-gray-500' :
                          entry.rank === 3 ? 'text-xl text-amber-600' :
                          'text-lg text-pink-500'
                        )}>
                          {entry.final_score}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">分</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Button
          onClick={() => router.push('/')}
          variant="outline"
          className="w-full mt-6 border-pink-200 hover:bg-pink-50"
        >
          返回首页
        </Button>
      </div>
    </div>
  );
}

// 辅助函数
function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
