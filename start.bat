@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion
cd /d "%~dp0"

echo.
echo ========== 求职看板 — 一键启动 ==========
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo 未检测到 Node.js，请先安装 https://nodejs.org/
  pause
  exit /b 1
)

echo [1/5] 安装根目录依赖（含 concurrently）...
call npm install
if errorlevel 1 goto :fail

echo [2/5] 安装后端、前端依赖...
call npm install --prefix backend
if errorlevel 1 goto :fail
call npm install --prefix frontend
if errorlevel 1 goto :fail

echo [3/5] 复制环境变量模板（若尚未存在）...
call npm run env:copy
if errorlevel 1 goto :fail

echo [4/5] 数据库迁移与 Prisma Client...
pushd backend
call npx prisma migrate deploy
if errorlevel 1 goto :fail
call npx prisma generate
if errorlevel 1 goto :fail
popd

echo [5/5] 启动后端 ^(3001^) 与前端 ^(3000^)，浏览器访问 http://localhost:3000
echo 按 Ctrl+C 可停止。
echo.
call npm run dev
goto :eof

:fail
echo.
echo 执行失败，请根据上方报错排查。
pause
exit /b 1
