import type { Application } from "@/lib/types";

/** 仍在推进中的申请状态（不含终态） */
const ACTIVE_FLOW = new Set([
  "COLLECTING",
  "TODO",
  "APPLIED",
  "ONLINE_TEST",
  "INTERVIEWING",
]);

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function calendarDaysBetween(a: Date, b: Date): number {
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / dayMs);
}

function materialsCount(app: Application): number {
  return [
    app.resumeSubmitted,
    app.coverLetterSubmitted,
    app.portfolioSubmitted,
    app.transcriptSubmitted,
  ].filter(Boolean).length;
}

/** 基于状态与截止、材料等的规则文案（非 AI），用于卡片与详情「下一步」。 */
export function suggestNextAction(app: Application): string {
  const now = new Date();
  const mat = materialsCount(app);
  const matsIncomplete = mat < 4;

  if (app.deadlineAt) {
    const d = new Date(app.deadlineAt);
    const daysLeft = calendarDaysBetween(startOfDay(now), startOfDay(d));
    if (daysLeft <= 1 && matsIncomplete && ACTIVE_FLOW.has(app.status)) {
      return "截止在即且材料未齐：建议今日优先补全材料或调整节点";
    }
    if (daysLeft <= 1 && app.status === "TODO") {
      return "截止在即：建议今日完成投递";
    }
  }

  switch (app.status) {
    case "COLLECTING":
      return "补充 JD 与链接等信息，决定是否投递";
    case "TODO":
      if (app.deadlineAt) {
        const daysLeft = calendarDaysBetween(
          startOfDay(now),
          startOfDay(new Date(app.deadlineAt)),
        );
        if (daysLeft <= 3 && daysLeft >= 0)
          return "投递窗口较紧：建议尽快完成简历定制与投递";
      }
      return matsIncomplete
        ? "提交前检查四类材料标记，按需完善后投递"
        : "建议今日推进投递并完成状态更新";
    case "APPLIED":
      return "建议几天后主动跟进投递状态与笔试通知";
    case "ONLINE_TEST":
      return "关注笔试安排，善用面试准备备忘";
    case "INTERVIEWING":
      return app.nextInterviewAt
        ? "面试前核对时间与材料，记录面试问答要点"
        : "跟进面试日程，更新下一场面试时间";
    case "OFFER":
      return "评估 Offer 条款与时间节点，决定是否接受";
    case "REJECTED":
      return "建议记录复盘要点（渠道/简历是否匹配），便于下一轮调整";
    case "ARCHIVED":
      return "已归档：可随时在备注中沉淀经验结论";
    default:
      return "按需更新进度与时间节点";
  }
}
