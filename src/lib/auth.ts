import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '@/storage/database/neon-client';
import { users } from '@/storage/database/shared/schema';

// 密码哈希
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// 验证密码
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// 用户信息类型
export interface User {
  id: number;
  username: string;
  created_at: string;
}

// 检查用户名是否存在
export async function checkUsernameExists(username: string): Promise<boolean> {
  const rows = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  return rows.length > 0;
}

// 创建新用户
export async function createUser(username: string, password: string): Promise<User | null> {
  // 检查用户名是否已存在
  const exists = await checkUsernameExists(username);
  if (exists) {
    return null;
  }

  // 哈希密码
  const hashedPassword = await hashPassword(password);

  try {
    const insertedRows = await db
      .insert(users)
      .values({
        username,
        password: hashedPassword,
      })
      .returning({
        id: users.id,
        username: users.username,
        created_at: users.created_at,
      });

    const insertedUser = insertedRows[0];
    if (!insertedUser) {
      return null;
    }

    return {
      id: insertedUser.id,
      username: insertedUser.username,
      created_at:
        insertedUser.created_at instanceof Date
          ? insertedUser.created_at.toISOString()
          : String(insertedUser.created_at),
    };
  } catch (error) {
    console.error('Failed to create user:', error);
    return null;
  }
}

// 验证用户登录
export async function validateUser(username: string, password: string): Promise<User | null> {
  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      password: users.password,
      created_at: users.created_at,
    })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  const user = rows[0];
  if (!user) {
    return null;
  }

  // 验证密码
  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    created_at:
      user.created_at instanceof Date
        ? user.created_at.toISOString()
        : String(user.created_at),
  };
}
