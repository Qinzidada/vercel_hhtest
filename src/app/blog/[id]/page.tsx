'use client';

import { use, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, BookOpen, Heart, Loader2 } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  summary: string;
  content: string;
  created_at: string;
}

export default function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchArticle();
  }, [resolvedParams.id]);

  const fetchArticle = async () => {
    try {
      const response = await fetch(`/api/blog/${resolvedParams.id}`);
      if (!response.ok) {
        setNotFound(true);
        return;
      }
      const data = await response.json();
      setArticle(data);
    } catch (error) {
      console.error('Failed to fetch article:', error);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/blog');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // 渲染 Markdown 内容
  const renderContent = (content: string): ReactNode[] => {
    const lines = content.split('\n');
    const elements: ReactNode[] = [];
    let key = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // 跳过空行
      if (!line.trim()) {
        continue;
      }

      // 一级标题
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={key++} className="text-3xl font-bold text-foreground mt-8 mb-4">
            {line.substring(2)}
          </h1>
        );
        continue;
      }

      // 二级标题
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={key++} className="text-2xl font-bold text-foreground mt-8 mb-4">
            {line.substring(3)}
          </h2>
        );
        continue;
      }

      // 三级标题
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={key++} className="text-xl font-bold text-foreground mt-6 mb-3">
            {line.substring(4)}
          </h3>
        );
        continue;
      }

      // 无序列表
      if (line.match(/^[-*]\s/)) {
        elements.push(
          <li key={key++} className="text-foreground leading-relaxed ml-6 list-disc">
            {line.replace(/^[-*]\s/, '')}
          </li>
        );
        continue;
      }

      // 有序列表
      if (line.match(/^\d+\.\s/)) {
        elements.push(
          <li key={key++} className="text-foreground leading-relaxed ml-6 list-decimal">
            {line.replace(/^\d+\.\s/, '')}
          </li>
        );
        continue;
      }

      // 引用块
      if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={key++} className="border-l-4 border-pink-400 pl-4 py-2 my-4 bg-pink-50 rounded-r-lg italic text-muted-foreground">
            {line.substring(2)}
          </blockquote>
        );
        continue;
      }

      // 加粗文本
      if (line.includes('**')) {
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        elements.push(
          <p key={key++} className="text-foreground leading-relaxed my-4">
            {parts.map((part, i) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-bold text-pink-600">{part.slice(2, -2)}</strong>;
              }
              return part;
            })}
          </p>
        );
        continue;
      }

      // 分隔线
      if (line.match(/^---+$/)) {
        elements.push(<hr key={key++} className="my-8 border-pink-200" />);
        continue;
      }

      // 普通段落
      elements.push(
        <p key={key++} className="text-foreground leading-relaxed my-4">
          {line}
        </p>
      );
    }

    return elements;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">文章不存在</h1>
          <Button onClick={handleBack}>返回攻略列表</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-pink-100">
        <div className="max-w-3xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              返回攻略列表
            </Button>
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              size="sm"
              className="gap-2 border-pink-200 hover:bg-pink-50"
            >
              <Heart className="w-4 h-4 text-pink-500" fill="currentColor" />
              去哄她
            </Button>
          </div>
        </div>
      </header>

      {/* 文章内容 */}
      <main className="max-w-3xl mx-auto p-4 py-8">
        {/* 文章头部 */}
        <article className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden">
          {/* 顶部装饰 */}
          <div className="h-2 bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500" />

          <div className="p-8">
            {/* 标题 */}
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight">
              {article.title}
            </h1>

            {/* 元信息 */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-6 border-b border-pink-100">
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>恋爱研究所</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(article.created_at)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>3-5 分钟阅读</span>
              </div>
            </div>

            {/* 摘要 */}
            <div className="bg-pink-50 rounded-xl p-4 mb-8 border border-pink-100">
              <p className="text-foreground italic">
                {article.summary}
              </p>
            </div>

            {/* 正文 */}
            <div className="prose prose-pink max-w-none">
              {renderContent(article.content)}
            </div>
          </div>

          {/* 底部装饰 */}
          <div className="h-2 bg-gradient-to-r from-pink-500 via-rose-400 to-pink-400" />
        </article>

        {/* 底部操作 */}
        <div className="mt-8 text-center">
          <Button
            onClick={() => router.push('/')}
            size="lg"
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg shadow-pink-200"
          >
            <Heart className="w-5 h-5 mr-2" fill="currentColor" />
            去游戏中实践一下吧
          </Button>
        </div>
      </main>
    </div>
  );
}
