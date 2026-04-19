# 技术决策冻结（MVP）

## 技术栈

| 层级 | 选型 | 说明 |
|------|------|------|
| 前端 | Next.js 14（App Router）、TypeScript、Tailwind CSS | PRD §17.1 |
| 状态/请求 | React Query（@tanstack/react-query）、Fetch API | 缓存与错误重试 |
| 看板拖拽 | @dnd-kit/core + @dnd-kit/sortable | PRD §17.1 |
| 图表 | Recharts | PRD §17.1 |
| 后端 | NestJS 10、TypeScript | PRD §17.2 |
| ORM | Prisma | 迁移与类型安全 |
| 数据库 | SQLite（开发默认可运行）/ PostgreSQL（`DATABASE_URL`） | PRD §17.3 |
| 认证 | JWT（HS256）+ HttpOnly Cookie `access_token` | PRD §17.4 |

## MVP 范围锁定

与 [job_application_kanban_prd.md](../job_application_kanban_prd.md) §7.1 一致；§7.2 不实现。

## 提醒规则（计算口径）

在请求「仪表盘 / 提醒列表」时由服务根据 `Application` 字段**即时计算**，不落库高频调度；支持 `Reminder` 表记录用户「已读」状态（按 `applicationId + reminderType + remindAt` 键）。

| 类型 | 规则 |
|------|------|
| 截止提醒 | `deadline_at` 存在且状态为进行中：当天、前 3 天、前 7 天各一条待办提示 |
| 面试提醒 | `next_interview_at` 存在：前 1 天、前 1 小时（若仍处于未来窗口） |
| 长期未更新 | 进行中状态且 `updated_at` 距今 ≥ 7 天 |
| 待补材料 | 进行中状态且四类材料未全部勾选 |

## 统计口径（冻结）

| 指标 | 定义 |
|------|------|
| 总申请数 | 当前用户 `Application` 总数 |
| 各状态数 | 按 `status` 分组计数 |
| Offer 数 | `status = OFFER` |
| 面试率 | `status IN (INTERVIEWING, OFFER)` 或曾有面试记录（MVP：当前为 `INTERVIEWING` 或 `OFFER`）的数量 / 总申请 |
| Offer 转化率 | `OFFER` 数 / 总申请 |
| 渠道分布 | 按 `source_channel` 分组计数 |
| 本周/本月趋势 | 按 `created_at` 落在自然周/月内的申请数 |

## 非功能（可测阈值）

| 项 | MVP 目标 |
|----|-----------|
| 申请数据量 | ≥100 条仍流畅操作 |
| API | 列表分页默认 20 条；核心接口 P95 < 500ms（本地 SQLite） |

## 测试门禁

- 后端：`jest` 单元测试（服务层校验、统计聚合）
- 前端：构建通过；关键流程可手动冒烟（注册→登录→CRUD→拖拽→统计）
