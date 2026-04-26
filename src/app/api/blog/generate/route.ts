import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { db } from '@/storage/database/neon-client';
import { blogPosts } from '@/storage/database/shared/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { topic } = body;

    // 调用 LLM 生成文章
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const llmClient = new LLMClient(config, customHeaders);

    // 生成文章的 prompt
    const prompt = topic
      ? `你是一个恋爱沟通专家，请为"${topic}"这个主题写一篇300-500字的恋爱沟通技巧文章。
要求：
1. 风格轻松幽默，适合年轻情侣阅读
2. 包含具体例子或建议
3. 使用 Markdown 格式（# 标题、## 二级标题、加粗 **text**、列表 - 项目等）
4. 结尾有一个金句或总结
5. 文章要有实用价值，能真正帮助读者改善恋爱关系

请直接输出文章内容，不需要任何前缀说明。`
      : `你是一个恋爱沟通专家，请写一篇关于恋爱沟通技巧的文章，主题自选（但不要和已有的文章重复：吵架之后的黄金30分钟、为什么"你说得对"是最烂的回复、道勤的正确打开方式）。

要求：
1. 风格轻松幽默，适合年轻情侣阅读
2. 包含具体例子或建议
3. 使用 Markdown 格式（# 标题、## 二级标题、加粗 **text**、列表 - 项目等）
4. 结尾有一个金句或总结
5. 文章要有实用价值，能真正帮助读者改善恋爱关系

请直接输出文章内容，不需要任何前缀说明。`;

    let generatedContent = '';

    for await (const chunk of llmClient.stream([
      { role: 'user', content: prompt }
    ], { temperature: 0.8 })) {
      if (chunk.content) {
        generatedContent += chunk.content.toString();
      }
    }

    // 解析生成的内容，提取标题和正文
    const lines = generatedContent.split('\n');
    let title = '恋爱沟通技巧';
    let summary = '';
    let content = generatedContent;

    // 尝试提取标题（# 开头的行）
    for (const line of lines) {
      if (line.startsWith('# ') && line.length > 2) {
        title = line.substring(2).trim();
        break;
      }
    }

    // 生成摘要（取前100个字符）
    summary = content.replace(/#+\s.*/g, '').replace(/\n+/g, ' ').trim().slice(0, 100);
    if (summary.length === 100) summary += '...';

    // 保存到数据库
    const insertedRows = await db
      .insert(blogPosts)
      .values({
        title,
        summary,
        content,
      })
      .returning();
    const article = insertedRows[0];
    if (!article) {
      throw new Error('保存文章失败: 未返回文章记录');
    }

    return NextResponse.json({
      success: true,
      article,
    });
  } catch (error) {
    console.error('POST /api/blog/generate error:', error);
    return NextResponse.json(
      { error: '生成文章失败' },
      { status: 500 }
    );
  }
}
