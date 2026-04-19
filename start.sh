#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

echo ""
echo "========== 求职看板 — 一键启动 =========="
echo ""

command -v node >/dev/null 2>&1 || { echo "请先安装 Node.js"; exit 1; }

echo "[1/5] 安装根目录依赖..."
npm install

echo "[2/5] 安装后端、前端依赖..."
npm install --prefix backend
npm install --prefix frontend

echo "[3/5] 复制环境变量模板..."
npm run env:copy

echo "[4/5] 数据库迁移与 Prisma Client..."
( cd backend && npx prisma migrate deploy && npx prisma generate )

echo "[5/5] 启动后端 (3001) 与前端 (3000)，浏览器访问 http://localhost:3000"
echo "按 Ctrl+C 停止。"
echo ""
npm run dev
