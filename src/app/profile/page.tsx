'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Trophy, TrendingUp, Calendar, Loader2, ArrowLeft } from 'lucide-react';

interface GameRecord {
  id: number;
  user_id: number;
  scenario: string;
  final_score: number;
  result: 'win' | 'lose';
  played_at: string;
}

interface Stats {
  totalGames: number;
  winGames: number;
  loseGames: number;
  winRate: number;
  avgScore: number;
}

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 未登录用户重定向
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // 加载游戏记录
  useEffect(() => {
    if (!user) return;

    const fetchRecords = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/game-record?user_id=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setRecords(data.records);
          setStats(data.stats);
        } else {
          setError('加载游戏记录失败');
        }
      } catch (err) {
        console.error('获取游戏记录失败:', err);
        setError('网络错误');
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [user]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <Header />
      
      <div className="max-w-2xl mx-auto p-4">
        {/* 返回按钮 */}
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="gap-2 text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </Button>

        {/* 用户信息卡片 */}
        <Card className="border-pink-100 bg-white/60 backdrop-blur-sm mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                <Heart className="w-8 h-8 text-white" fill="white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{user.username}</h1>
                <p className="text-muted-foreground">哄哄模拟器玩家</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 统计数据 */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <Card className="border-pink-100 bg-white/60 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{stats.totalGames}</p>
                <p className="text-xs text-muted-foreground">总场次</p>
              </CardContent>
            </Card>

            <Card className="border-pink-100 bg-white/60 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <Heart className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{stats.winGames}</p>
                <p className="text-xs text-muted-foreground">获胜次数</p>
              </CardContent>
            </Card>

            <Card className="border-pink-100 bg-white/60 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-6 h-6 text-pink-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{stats.winRate}%</p>
                <p className="text-xs text-muted-foreground">胜率</p>
              </CardContent>
            </Card>

            <Card className="border-pink-100 bg-white/60 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <Heart className="w-6 h-6 text-rose-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{stats.avgScore}</p>
                <p className="text-xs text-muted-foreground">平均分</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 游戏记录列表 */}
        <Card className="border-pink-100 bg-white/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-pink-500" />
              游戏记录
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : records.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="w-12 h-12 text-pink-300 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">还没有游戏记录</p>
                <Button
                  onClick={() => router.push('/select')}
                  className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                >
                  开始游戏
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {records.map((record) => (
                  <div
                    key={record.id}
                    className={cn(
                      'flex items-center justify-between p-4 rounded-lg border',
                      record.result === 'win'
                        ? 'bg-green-50 border-green-100'
                        : 'bg-red-50 border-red-100'
                    )}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {record.result === 'win' ? (
                          <Trophy className="w-4 h-4 text-green-500" />
                        ) : (
                          <Heart className="w-4 h-4 text-red-400" />
                        )}
                        <span className={cn(
                          'font-medium',
                          record.result === 'win' ? 'text-green-600' : 'text-red-500'
                        )}>
                          {record.result === 'win' ? '通关成功' : '未通关'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{record.scenario}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(record.played_at)}
                      </p>
                    </div>
                    <div className={cn(
                      'text-2xl font-bold',
                      record.result === 'win' ? 'text-green-600' : 'text-red-500'
                    )}>
                      {record.final_score}
                      <span className="text-sm text-muted-foreground ml-1">分</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 辅助函数
function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
