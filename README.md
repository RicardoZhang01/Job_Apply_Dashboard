# 求职申请管理看板

面向大学生求职场景的 Web 平台：看板拖拽、列表筛选、截止日期与面试提醒、统计分析。

## 一键启动（推荐）

**需要先安装 [Node.js](https://nodejs.org/)（建议 LTS）。**

| 方式 | 说明 |
|------|------|
| **Windows** | 双击项目根目录下的 [`start.bat`](start.bat)：会自动安装依赖、复制环境变量文件、迁移数据库并同时启动后端与前端。 |
| **Mac / Linux** | 在项目根目录执行：`chmod +x start.sh && ./start.sh` |
| **命令行（等价于脚本）** | 在项目根目录：`npm install && npm run install:all && npm run setup && npm run dev` |

启动成功后：

- 前端：**http://localhost:3000**
- 后端 API：**http://localhost:3001/api**

浏览器打开首页后 **注册账号** 即可使用。

> **说明**：环境文件若不存在，会从 `backend/.env.example`、`frontend/.env.local.example` 自动复制（无需再手动执行 `cp` / `Copy-Item`）。

---

## 结构

| 目录 | 说明 |
|------|------|
| [backend/](backend/) | NestJS + Prisma（SQLite 本地默认）REST API，`/api` 前缀 |
| [frontend/](frontend/) | Next.js 14 App Router + Tailwind + React Query + dnd-kit |
| [docs/TECH_DECISIONS.md](docs/TECH_DECISIONS.md) | MVP 技术决策与口径 |

## 根目录脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 同时启动后端（watch）与前端 dev（需已安装各目录依赖并完成 `npm run setup`） |
| `npm run setup` | 复制 env + 执行数据库迁移与 `prisma generate` |
| `npm run env:copy` | 仅从示例复制 `.env` / `.env.local` |

## 环境变量（可选）

不复制示例也可自行新建：

- 后端：`DATABASE_URL`、`JWT_SECRET`、`FRONTEND_ORIGIN`（默认 `http://localhost:3000`）、`PORT`（默认 `3001`）
- 前端：`NEXT_PUBLIC_API_URL`（默认 `http://localhost:3001`）

## 子项目脚本

| 命令 | 说明 |
|------|------|
| `backend/npm run build` | 编译后端 |
| `backend/npm test` | 单元测试 |
| `backend/npm run test:e2e` | E2E |
| `frontend/npm run build` | 前端生产构建 |

## CI

推送至 `main/master` 或提交 PR 时运行 [`.github/workflows/ci.yml`](.github/workflows/ci.yml)。

## API 摘要

- `POST /api/auth/register`、`POST /api/auth/login`、`POST /api/auth/logout`、`GET /api/auth/me`
- `GET|POST /api/applications`、`GET|PUT|DELETE /api/applications/:id`、`PATCH .../status`
- `GET|POST /api/applications/:id/history`
- `GET /api/reminders`、`PATCH /api/reminders/read`
- `GET /api/stats/overview|funnel|channels|trends`
