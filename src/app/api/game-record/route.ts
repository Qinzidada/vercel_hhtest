import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

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

    const client = getSupabaseClient();

    // 插入游戏记录
    const { data, error } = await client
      .from('game_records')
      .insert({
        user_id,
        scenario,
        final_score,
        result,
        played_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('插入游戏记录失败:', error);
      return NextResponse.json(
        { error: '保存游戏记录失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      record: data,
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

    const client = getSupabaseClient();

    // 获取用户的游戏记录，按时间倒序排列
    const { data: records, error } = await client
      .from('game_records')
      .select('*')
      .eq('user_id', user_id)
      .order('played_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('获取游戏记录失败:', error);
      return NextResponse.json(
        { error: '获取游戏记录失败' },
        { status: 500 }
      );
    }

    // 统计数据
    const totalGames = records?.length || 0;
    const winGames = records?.filter(r => r.result === 'win').length || 0;
    const avgScore = totalGames > 0 
      ? Math.round((records?.reduce((sum, r) => sum + (r.final_score || 0), 0) || 0) / totalGames)
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
