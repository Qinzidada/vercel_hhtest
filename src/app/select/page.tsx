'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { characters, Character } from '@/lib/characters';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Heart, Sparkles, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function SelectPage() {
  const router = useRouter();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelect = (character: Character) => {
    setSelectedCharacter(character);
  };

  const handleStart = () => {
    if (selectedCharacter) {
      setIsLoading(true);
      // 将选中的角色ID和随机场景传递到游戏页面
      router.push(`/game/${selectedCharacter.id}`);
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex flex-col">
      {/* 顶部导航 */}
      <header className="p-4">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </Button>
      </header>

      {/* 主内容 */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 pb-12">
        <div className="w-full max-w-4xl">
          {/* 标题 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <Users className="w-6 h-6 text-pink-500" />
              <h1 className="text-2xl font-bold text-foreground">选择要哄的女朋友</h1>
            </div>
            <p className="text-muted-foreground">
              每个角色都有不同的性格，快选择一个开始游戏吧
            </p>
          </div>

          {/* 角色卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {characters.map((character) => (
              <Card
                key={character.id}
                className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                  selectedCharacter?.id === character.id
                    ? 'ring-2 ring-pink-500 shadow-lg shadow-pink-200 bg-pink-50'
                    : 'hover:border-pink-200'
                }`}
                onClick={() => handleSelect(character)}
              >
                <CardContent className="p-6">
                  {/* 头像区域 */}
                  <div className="flex flex-col items-center mb-4">
                    <div
                      className={`w-20 h-20 rounded-full flex items-center justify-center mb-3 ${
                        character.id === 'xiaoxue'
                          ? 'bg-gradient-to-br from-pink-400 to-rose-500'
                          : character.id === 'yaoyao'
                          ? 'bg-gradient-to-br from-purple-400 to-pink-500'
                          : 'bg-gradient-to-br from-orange-400 to-rose-500'
                      }`}
                    >
                      <Heart
                        className="w-10 h-10 text-white"
                        fill="white"
                      />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">{character.name}</h2>
                    <Badge
                      variant="secondary"
                      className={`mt-2 ${
                        character.id === 'xiaoxue'
                          ? 'bg-pink-100 text-pink-700'
                          : character.id === 'yaoyao'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {character.type}
                    </Badge>
                  </div>

                  {/* 口头禅 */}
                  <div className="bg-white/60 rounded-lg p-3 mb-4 text-center">
                    <p className="text-sm text-muted-foreground italic">
                      &ldquo;{character.tagline}&rdquo;
                    </p>
                  </div>

                  {/* 性格特点 */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">性格特点</p>
                    <div className="flex flex-wrap gap-1">
                      {character.personality.map((trait, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* 描述 */}
                  <p className="mt-4 text-sm text-muted-foreground">
                    {character.description}
                  </p>

                  {/* 选择指示器 */}
                  {selectedCharacter?.id === character.id && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-pink-500">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm font-medium">已选择</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 开始按钮 */}
          <div className="text-center">
            <Button
              onClick={handleStart}
              disabled={!selectedCharacter || isLoading}
              size="lg"
              className="w-full max-w-xs h-14 text-lg bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg shadow-pink-200 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isLoading ? (
                <>
                  <span className="animate-pulse mr-2">加载中...</span>
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5 mr-2" fill="currentColor" />
                  开始哄她
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
