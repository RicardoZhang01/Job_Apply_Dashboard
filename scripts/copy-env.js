/**
 * 若不存在则从前端示例复制 .env，避免手写多行命令（跨平台）。
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

function copyIfMissing(relFrom, relTo) {
  const from = path.join(root, relFrom);
  const to = path.join(root, relTo);
  if (!fs.existsSync(from)) {
    console.warn("[copy-env] 跳过：缺少", relFrom);
    return;
  }
  if (fs.existsSync(to)) {
    console.log("[copy-env] 已存在，跳过:", relTo);
    return;
  }
  fs.copyFileSync(from, to);
  console.log("[copy-env] 已创建:", relTo);
}

copyIfMissing("backend/.env.example", "backend/.env");
copyIfMissing("frontend/.env.local.example", "frontend/.env.local");
