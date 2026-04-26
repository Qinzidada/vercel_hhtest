import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/storage/database/neon-client';
import { blogPosts } from '@/storage/database/shared/schema';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const articleId = Number.parseInt(id, 10);
    if (Number.isNaN(articleId)) {
      return NextResponse.json({ error: '文章 ID 格式错误' }, { status: 400 });
    }

    const rows = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        summary: blogPosts.summary,
        content: blogPosts.content,
        created_at: blogPosts.created_at,
      })
      .from(blogPosts)
      .where(eq(blogPosts.id, articleId))
      .limit(1);

    if (!rows[0]) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('GET /api/blog/[id] error:', error);
    return NextResponse.json(
      { error: '获取文章失败' },
      { status: 500 }
    );
  }
}
