import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/auth';

async function verifyTurnstileToken(token: string, remoteIp?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    console.error('TURNSTILE_SECRET_KEY is not set');
    return false;
  }

  const formData = new URLSearchParams({
    secret,
    response: token,
  });

  if (remoteIp) {
    formData.append('remoteip', remoteIp);
  }

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  });

  if (!response.ok) {
    return false;
  }

  const result = await response.json();
  return result.success === true;
}

export async function POST(request: NextRequest) {
  try {
    const { username, password, turnstileToken } = await request.json();

    // 验证输入
    if (!username || !password || !turnstileToken) {
      return NextResponse.json(
        { error: '用户名、密码和人机验证不能为空' },
        { status: 400 }
      );
    }

    if (username.length < 3 || username.length > 20) {
      return NextResponse.json(
        { error: '用户名长度必须在 3-20 个字符之间' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度不能少于 6 个字符' },
        { status: 400 }
      );
    }

    const xForwardedFor = request.headers.get('x-forwarded-for');
    const remoteIp = xForwardedFor?.split(',')[0]?.trim();
    const isTurnstileValid = await verifyTurnstileToken(turnstileToken, remoteIp);
    if (!isTurnstileValid) {
      return NextResponse.json(
        { error: '人机验证失败，请重试' },
        { status: 400 }
      );
    }

    // 创建用户
    const user = await createUser(username, password);

    if (!user) {
      return NextResponse.json(
        { error: '用户名已存在' },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
}
