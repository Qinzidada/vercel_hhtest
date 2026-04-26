import { NextResponse } from 'next/server';
import { desc } from 'drizzle-orm';
import { db } from '@/storage/database/neon-client';
import { blogPosts } from '@/storage/database/shared/schema';

export async function GET() {
  try {
    const articles = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        summary: blogPosts.summary,
        created_at: blogPosts.created_at,
      })
      .from(blogPosts)
      .orderBy(desc(blogPosts.created_at));

    return NextResponse.json(articles);
  } catch (error) {
    console.error('GET /api/blog error:', error);
    return NextResponse.json(
      { error: '获取文章列表失败' },
      { status: 500 }
    );
  }
}
