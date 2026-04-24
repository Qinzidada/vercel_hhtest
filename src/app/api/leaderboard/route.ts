import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET() {
  try {
    const client = getSupabaseClient();

    // 查询每个用户的最高分记录，按分数降序排列，取前20名
    // 使用子查询获取每个用户的最高分数记录
    const { data: topRecords, error } = await client
      .from('game_records')
      .select(`
        id,
        final_score,
        result,
        played_at,
        user_id,
        users:user_id (username)
      `)
      .eq('result', 'win') // 只取通关成功的记录
      .order('final_score', { ascending: false })
      .limit(100);

    if (error) {
      console.error('获取排行榜失败:', error);
      return NextResponse.json(
        { error: '获取排行榜失败' },
        { status: 500 }
      );
    }

    // 处理数据：获取每个用户的最高分记录
    const userBestScores = new Map<number, {
      user_id: number;
      username: string;
      final_score: number;
      played_at: string;
      record_id: number;
    }>();

    for (const record of topRecords || []) {
      const userId = record.user_id;
      if (!userBestScores.has(userId)) {
        const usersData = record.users;
        let username = '匿名用户';
        if (usersData && Array.isArray(usersData) && usersData.length > 0) {
          username = usersData[0].username || '匿名用户';
        } else if (usersData && typeof usersData === 'object') {
          username = (usersData as { username?: string }).username || '匿名用户';
        }
        userBestScores.set(userId, {
          user_id: userId,
          username: username,
          final_score: record.final_score,
          played_at: record.played_at,
          record_id: record.id,
        });
      }
    }

    // 转换为数组并按分数降序排列，取前20名
    const leaderboard = Array.from(userBestScores.values())
      .sort((a, b) => b.final_score - a.final_score)
      .slice(0, 20)
      .map((item, index) => ({
        rank: index + 1,
        ...item,
      }));

    return NextResponse.json({
      leaderboard,
      total: leaderboard.length,
    });
  } catch (error) {
    console.error('获取排行榜失败:', error);
    return NextResponse.json(
      { error: '获取排行榜失败' },
      { status: 500 }
    );
  }
}
