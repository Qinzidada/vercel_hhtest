'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, BookOpen, Clock, Calendar, Loader2 } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  summary: string;
  created_at: string;
}

export default function BlogPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/blog');
      const data = await response.json();
      if (Array.isArray(data)) {
        setArticles(data);
      }
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-pink-100">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              返回
            </Button>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-pink-500" />
              <h1 className="text-xl font-bold text-foreground">恋爱攻略</h1>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-4xl mx-auto p-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground mb-3">
            恋爱攻略
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            学会这些恋爱技巧，让你和 TA 的感情越来越好
          </p>
        </div>

        {/* 加载状态 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
            <span className="ml-3 text-muted-foreground">加载中...</span>
          </div>
        ) : articles.length === 0 ? (
          /* 空状态 */
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-pink-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-foreground mb-2">暂无文章</h3>
            <p className="text-muted-foreground mb-6">稍后再来看看吧</p>
          </div>
        ) : (
          /* 文章列表 */
          <div className="space-y-6">
            {articles.map((article, index) => (
              <Card
                key={article.id}
                className="cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border-pink-100 hover:border-pink-300 group"
                onClick={() => router.push(`/blog/${article.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* 序号 */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold text-lg">
                      {index + 1}
                    </div>

                    {/* 内容 */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-pink-600 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {article.summary}
                      </p>

                      {/* 元信息 */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(article.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>3-5 分钟阅读</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 底部提示 */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-50 rounded-full text-pink-600 text-sm">
            <span>更多攻略持续更新中...</span>
          </div>
        </div>
      </main>
    </div>
  );
}
