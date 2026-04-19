# 求职申请管理看板 (Job Apply Dashboard)

English version: [README.en.md](README.en.md)

面向大学生/应届生求职场景的申请管理平台，提供从岗位收集、投递推进到复盘分析的完整闭环，并在关键流程中内嵌 AI 能力。

## 目录

- [项目简介](#项目简介)
- [核心特性](#核心特性)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [环境变量](#环境变量)
- [常用脚本](#常用脚本)
- [页面路由](#页面路由)
- [API 概览](#api-概览)
- [AI 功能说明](#ai-功能说明)
- [演示路径](#演示路径)
- [Roadmap](#roadmap)
- [Contributing](#contributing)

## 项目简介

相比“仅记录状态”的看板工具，本项目强调：

- **可执行导向**：首页直接给到今日待办、提醒与优先动作
- **结构化沉淀**：将 JD、面试准备、材料版本、失败原因变成可复用资产
- **数据复盘闭环**：从渠道/阶段统计走向策略建议
- **AI 内嵌式体验**：在表单、详情、统计、仪表盘等真实操作点提供辅助

## 核心特性

### 1) 流程管理

- 看板拖拽推进申请状态
- 列表检索与多维筛选
- 截止日期、笔试、面试等关键节点管理
- 申请时间线与历史记录追踪

### 2) 决策辅助

- 首页“今日待办”聚合（截止、面试、材料、停滞等）
- 规则化“下一步建议”
- 提醒中心分组展示并支持已读管理

### 3) 复盘分析

- 状态分布、漏斗、趋势
- 渠道进面率 / Offer 率
- 岗位大类分析与失败原因分布

### 4) AI 赋能（按需触发）

- JD 解析并回填申请字段
- 申请级行动建议
- 面试准备建议
- 简历/求职信建议
- 统计解读与仪表盘今日简报

## 技术栈

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, TanStack Query, dnd-kit, Recharts
- **Backend**: NestJS, Prisma
- **Database**: SQLite（默认本地）
- **Auth**: JWT + HttpOnly Cookie
- **CI**: GitHub Actions（`.github/workflows/ci.yml`）

## 项目结构

| 路径 | 说明 |
|------|------|
| [backend/](backend/) | NestJS + Prisma REST API（`/api` 前缀） |
| [frontend/](frontend/) | Next.js 前端应用 |
| [docs/TECH_DECISIONS.md](docs/TECH_DECISIONS.md) | 技术决策记录 |

## 快速开始

### 方式 A：脚本一键启动（推荐）

- **Windows**：双击 [`start.bat`](start.bat)
- **Mac / Linux**：`chmod +x start.sh && ./start.sh`

### 方式 B：命令行

```bash
npm install
npm run install:all
npm run setup
npm run dev
```

启动后：

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001/api`

首次使用请注册账号登录。

## 环境变量

> 环境文件不存在时，可由 `npm run setup` 从示例自动复制。

### Backend (`backend/.env`)

| 变量 | 说明 | 默认 |
|------|------|------|
| `DATABASE_URL` | SQLite 连接串 | `file:./dev.db` |
| `JWT_SECRET` | JWT 密钥 | - |
| `FRONTEND_ORIGIN` | CORS 允许来源 | `http://localhost:3000` |
| `PORT` | 后端端口 | `3001` |
| `OPENAI_API_KEY` | AI key（可选） | 空 |
| `OPENAI_BASE_URL` | OpenAI 兼容地址 | `https://api.openai.com/v1` |
| `OPENAI_MODEL` | 模型名 | `gpt-4o-mini` |

### Frontend (`frontend/.env.local`)

| 变量 | 说明 | 默认 |
|------|------|------|
| `NEXT_PUBLIC_API_URL` | 后端基地址 | `http://localhost:3001` |

## 常用脚本

### 根目录

| 命令 | 说明 |
|------|------|
| `npm run dev` | 同时启动前后端开发服务 |
| `npm run setup` | 复制 env、执行迁移、生成 Prisma Client |
| `npm run env:copy` | 仅复制环境文件 |

### 子项目

| 命令 | 说明 |
|------|------|
| `backend: npm run build` | 编译后端 |
| `backend: npm test` | 单元测试 |
| `backend: npm run test:e2e` | E2E 测试 |
| `frontend: npm run build` | 前端生产构建 |

## 页面路由

| 路径 | 说明 |
|------|------|
| `/` | 登录态检测后跳转 |
| `/dashboard` | 首页仪表盘 |
| `/board` | 看板 |
| `/list` | 申请列表 |
| `/reminders` | 提醒中心 |
| `/stats` | 统计分析 |
| `/applications/new` | 完整新建 |
| `/applications/new/quick` | 极简新建 |
| `/applications/:id` | 申请详情 |
| `/applications/:id/edit` | 编辑申请 |

## API 概览

- `POST /api/auth/register|login|logout`
- `GET /api/auth/me`
- `GET|POST /api/applications`
- `GET|PUT|DELETE /api/applications/:id`
- `PATCH /api/applications/:id/status`
- `GET|POST /api/applications/:id/history`
- `GET /api/reminders`
- `PATCH /api/reminders/read`
- `GET /api/dashboard/todos`
- `GET /api/stats/overview|funnel|channels|trends`
- `GET /api/stats/channel-effectiveness|by-job-category|failure-breakdown`
- `POST /api/ai/jd-extract|next-actions|resume-suggest|interview-prep|stats-insight`
- `GET /api/ai/dashboard-digest`

## AI 功能说明

- AI 调用通过后端进行（不在前端暴露 Key）
- 默认**按需触发**，只有用户点击按钮才发起 AI 请求
- 输出定位为“建议 + 原因”，不自动修改关键业务状态
- 当 AI 不可用时，返回温和原因提示，不阻断手工流程

## 演示路径

推荐 3-5 分钟演示顺序：

1. `/applications/new/quick`：AI 解析 JD 并回填
2. `/applications/:id`：AI 行动建议 + AI 面试准备
3. `/dashboard`：生成 AI 今日简报
4. `/stats`：AI 解读本页统计
5. `/applications/:id/edit`：AI 简历/求职信建议写入字段

## Roadmap

- [ ] 持久化 AI artifact（幂等缓存、可追溯）
- [ ] 更细粒度的 AI 成本与限流治理
- [ ] 更丰富的策略复盘（阶段性报告导出）
- [ ] 对话式 AI 教练（后置增强）

## Contributing

欢迎提 Issue / PR。建议流程：

1. Fork 并新建分支
2. 提交改动并附上测试/截图
3. 发起 PR，说明变更目的与影响范围

---

如果这个项目对你有帮助，欢迎 Star。
