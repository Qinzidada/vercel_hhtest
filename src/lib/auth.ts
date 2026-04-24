import bcrypt from 'bcryptjs';
import { getSupabaseClient } from '@/storage/database/supabase-client';

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
  const client = getSupabaseClient();
  const { data } = await client
    .from('users')
    .select('id')
    .eq('username', username)
    .maybeSingle();

  return !!data;
}

// 创建新用户
export async function createUser(username: string, password: string): Promise<User | null> {
  const client = getSupabaseClient();

  // 检查用户名是否已存在
  const exists = await checkUsernameExists(username);
  if (exists) {
    return null;
  }

  // 哈希密码
  const hashedPassword = await hashPassword(password);

  // 插入用户
  const { data, error } = await client
    .from('users')
    .insert({
      username,
      password: hashedPassword,
    })
    .select()
    .maybeSingle();

  if (error || !data) {
    console.error('Failed to create user:', error);
    return null;
  }

  return {
    id: data.id,
    username: data.username,
    created_at: data.created_at,
  };
}

// 验证用户登录
export async function validateUser(username: string, password: string): Promise<User | null> {
  const client = getSupabaseClient();

  // 查找用户
  const { data, error } = await client
    .from('users')
    .select('id, username, password, created_at')
    .eq('username', username)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  // 验证密码
  const isValid = await verifyPassword(password, data.password);
  if (!isValid) {
    return null;
  }

  return {
    id: data.id,
    username: data.username,
    created_at: data.created_at,
  };
}
