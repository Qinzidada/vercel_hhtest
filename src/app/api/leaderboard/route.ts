import { NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/storage/database/neon-client';
import { gameRecords, users } from '@/storage/database/shared/schema';

export async function GET() {
  try {
    // 查询每个用户的最高分记录，按分数降序排列，取前20名
    const topRecords = await db
      .select({
        id: gameRecords.id,
        final_score: gameRecords.final_score,
        result: gameRecords.result,
        played_at: gameRecords.played_at,
        user_id: gameRecords.user_id,
        username: users.username,
      })
      .from(gameRecords)
      .leftJoin(users, eq(gameRecords.user_id, users.id))
      .where(eq(gameRecords.result, 'win'))
      .orderBy(desc(gameRecords.final_score), desc(gameRecords.played_at))
      .limit(100);

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
        const username = record.username || '匿名用户';
        userBestScores.set(userId, {
          user_id: userId,
          username,
          final_score: record.final_score,
          played_at:
            record.played_at instanceof Date
              ? record.played_at.toISOString()
              : String(record.played_at),
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
