# 哄哄模拟器 2.0 - 项目规范

## 项目概览

哄哄模拟器 2.0 是一款 AI 驱动的对话模拟游戏，由 AI 扮演用户正在生气的女朋友，让用户在 5-10 轮的回复中，通过选择合适的对话选项将女友哄好。

## 技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **AI**: coze-coding-dev-sdk (LLM)
- **TTS**: 文字转语音
- **Database**: Supabase (扣子编程数据库)

## 目录结构

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts      # AI 对话 API
│   │   ├── tts/route.ts       # TTS 语音合成 API
│   │   ├── auth/
│   │   │   ├── register/route.ts  # 用户注册 API
│   │   │   └── login/route.ts     # 用户登录 API
│   │   └── blog/
│   │       ├── route.ts       # 获取文章列表 API
│   │       ├── [id]/route.ts  # 获取单篇文章 API
│   │       └── generate/route.ts # AI 生成文章 API
│   ├── page.tsx               # 首页（标题页）
│   ├── select/page.tsx        # 人设选择页
│   ├── game/[character]/page.tsx  # 游戏主界面
│   ├── result/page.tsx        # 结果页
│   ├── login/page.tsx         # 登录页
│   ├── register/page.tsx      # 注册页
│   ├── blog/
│   │   ├── page.tsx           # 博客列表页
│   │   └── [id]/page.tsx      # 文章详情页
│   └── globals.css
├── components/
│   └── ui/                    # shadcn/ui 组件库
├── lib/
│   ├── characters.ts          # 人设配置
│   ├── scenarios.ts            # 场景配置
│   ├── prompts.ts              # AI 提示词配置
│   └── auth.ts                 # 认证工具函数
├── storage/
│   └── database/              # 数据库相关
│       ├── supabase-client.ts  # Supabase 客户端
│       └── shared/schema.ts    # 数据库模型定义
└── hooks/
    └── useGame.ts              # 游戏状态管理
```

## 功能说明

### 核心流程

1. **首页** → 显示标题和开始游戏按钮
2. **人设选择页** → 用户选择想要哄的女朋友人设（3选1）
3. **游戏主界面** → 聊天气泡 + 选择题选项
4. **结果页** → 显示成功/失败结果

### 游戏机制

- **初始情绪值**: 30
- **胜利条件**: 情绪值 ≥ 80
- **失败条件**: 轮次用完（8轮）仍未达标
- **情绪变化规则**:
  - 共情 → +20
  - 道歉 → +15
  - 敷衍 → -20
  - 推卸责任 → -30

### 用户认证

使用 bcryptjs 进行密码哈希加密。

**users 表**:
| 字段 | 类型 | 说明 |
|------|------|------|
| id | serial | 自增主键 |
| username | text | 用户名（唯一） |
| password | text | 密码（bcrypt 哈希） |
| created_at | timestamp | 注册时间 |

### 人设配置

| 角色 | 类型 | 性格特点 |
|------|------|----------|
| 小雪 | 傲娇型 | 嘴上说不要心里很想要，说话带刺但容易被感动 |
| 瑶瑶 | 敏感型 | 容易受伤，需要被理解和共情 |
| 婷婷 | 直爽型 | 有话直说，虽然生气但消气也快 |

### 场景配置

预设 5-10 个常见生气场景，随机抽取：
- 忘记纪念日/生日
- 消息回得很敷衍
- 说好要陪伴但临时加班
- 忘记约定
- 说话态度不好

## API 设计

### POST /api/chat
AI 对话生成接口

**请求体**:
```typescript
{
  character: string;       // 人设名称
  scenario: string;        // 生气场景
  emotion: number;        // 当前情绪值 0-100
  history: Array<{         // 对话历史
    role: 'user' | 'assistant';
    content: string;
  }>;
  userChoice?: string;    // 用户选择的选项内容
}
```

**响应**:
```typescript
{
  reply: string;           // AI 回复文本
  emotion: number;        // 更新后的情绪值
  status: 'angry' | 'softening' | 'happy';
  options: string[];      // 下一轮5个选项
}
```

### POST /api/tts
文字转语音接口

**请求体**:
```typescript
{
  text: string;            // 要转换的文本
  character?: string;     // 角色名称（可选，用于选择音色）
}
```

**响应**: 返回音频文件流

### POST /api/auth/register
用户注册接口

**请求体**:
```typescript
{
  username: string;        // 用户名（3-20个字符）
  password: string;        // 密码（至少6个字符）
}
```

**响应**:
```typescript
{
  success: true;
  user: {
    id: number;
    username: string;
  };
}
```

### POST /api/auth/login
用户登录接口

**请求体**:
```typescript
{
  username: string;
  password: string;
}
```

**响应**:
```typescript
{
  success: true;
  user: {
    id: number;
    username: string;
  };
}
```

## 页面设计

### 视觉风格
- **主题**: 温暖治愈系
- **主色调**: 粉色/暖色调
- **布局**: 桌面端优先，居中显示

### 首页
- 大标题"哄哄模拟器 2.0"
- 副标题引导语
- "开始游戏"按钮
- "恋爱攻略"入口按钮
- 登录/注册入口链接

### 登录页 /login
- 用户名和密码输入框
- 登录成功后跳转到首页
- 错误提示（用户名或密码错误）

### 注册页 /register
- 用户名、密码、确认密码输入框
- 注册成功后自动登录并跳转到首页
- 错误提示（用户名已存在、密码不一致等）

### 人设选择页
- 展示三个人设卡片
- 每个卡片包含：名字、性格标签、一句口头禅/简介
- 用户点击选择

### 游戏主界面
- 顶部：情绪进度条（0-100）
- 中部：聊天气泡（可滚动查看历史）
- 底部：5个选项按钮
- AI 回复支持打字机效果和语音播放

### 结果页
- 成功/失败状态展示
- 总结性文字
- "再玩一次"按钮

### 博客功能

#### 博客列表页 `/blog`
- 从数据库获取文章列表
- 展示文章卡片（标题、摘要、发布日期）
- 点击跳转到文章详情页

#### 文章详情页 `/blog/[id]`
- 从数据库获取文章内容
- 支持 Markdown 渲染
- 底部有"去游戏中实践"按钮

#### AI 生成文章 API `/api/blog/generate`
- 调用 LLM 自动生成恋爱沟通技巧文章
- 保存到数据库
- 返回生成的文章信息

## 构建和测试命令

- **开发**: `pnpm dev` (端口 5000)
- **构建**: `pnpm build`
- **启动**: `pnpm start`

## 注意事项

- AI 提示词必须严格控制角色一致性
- 每轮回复必须包含情绪表达
- 禁止直接原谅、一次性归零情绪
- 注意中文全角标点问题
