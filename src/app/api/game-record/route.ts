import { NextRequest, NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/storage/database/neon-client';
import { gameRecords } from '@/storage/database/shared/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, scenario, final_score, result } = body;

    // 验证必要参数
    if (!user_id || !scenario || final_score === undefined || !result) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 验证 result 值
    if (!['win', 'lose'].includes(result)) {
      return NextResponse.json(
        { error: 'result 必须是 win 或 lose' },
        { status: 400 }
      );
    }

    const insertedRows = await db
      .insert(gameRecords)
      .values({
        user_id,
        scenario,
        final_score,
        result,
      })
      .returning();
    const record = insertedRows[0];
    if (!record) throw new Error('插入游戏记录失败: 未返回记录');

    return NextResponse.json({
      success: true,
      record,
    });
  } catch (error) {
    console.error('保存游戏记录失败:', error);
    return NextResponse.json(
      { error: '保存游戏记录失败' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json(
        { error: '缺少 user_id 参数' },
        { status: 400 }
      );
    }

    const userId = Number.parseInt(user_id, 10);
    if (Number.isNaN(userId)) {
      return NextResponse.json(
        { error: 'user_id 格式错误' },
        { status: 400 }
      );
    }

    // 获取用户的游戏记录，按时间倒序排列
    const records = await db
      .select()
      .from(gameRecords)
      .where(eq(gameRecords.user_id, userId))
      .orderBy(desc(gameRecords.played_at))
      .limit(50);

    // 统计数据
    const totalGames = records?.length || 0;
    const winGames = records?.filter((r) => r.result === 'win').length || 0;
    const avgScore = totalGames > 0 
      ? Math.round((records?.reduce((sum: number, r) => sum + (r.final_score || 0), 0) || 0) / totalGames)
      : 0;

    return NextResponse.json({
      records: records || [],
      stats: {
        totalGames,
        winGames,
        loseGames: totalGames - winGames,
        winRate: totalGames > 0 ? Math.round((winGames / totalGames) * 100) : 0,
        avgScore,
      },
    });
  } catch (error) {
    console.error('获取游戏记录失败:', error);
    return NextResponse.json(
      { error: '获取游戏记录失败' },
      { status: 500 }
    );
  }
}
