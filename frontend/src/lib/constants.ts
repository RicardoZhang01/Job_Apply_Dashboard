export const APPLICATION_STATUSES = [
  "COLLECTING",
  "TODO",
  "APPLIED",
  "ONLINE_TEST",
  "INTERVIEWING",
  "OFFER",
  "REJECTED",
  "ARCHIVED",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const STATUS_LABELS: Record<string, string> = {
  COLLECTING: "待收集",
  TODO: "待投递",
  APPLIED: "已投递",
  ONLINE_TEST: "笔试中",
  INTERVIEWING: "面试中",
  OFFER: "Offer",
  REJECTED: "未通过",
  ARCHIVED: "已归档",
};

export const PRIORITIES = ["HIGH", "MEDIUM", "LOW"] as const;
export const PRIORITY_LABELS: Record<string, string> = {
  HIGH: "高",
  MEDIUM: "中",
  LOW: "低",
};

export const SOURCE_CHANNELS = [
  "OFFICIAL_SITE",
  "BOSS",
  "LINKEDIN",
  "INTERNAL_REFERRAL",
  "CAREER_FAIR",
  "OTHER",
] as const;

export const CHANNEL_LABELS: Record<string, string> = {
  OFFICIAL_SITE: "官网",
  BOSS: "Boss直聘",
  LINKEDIN: "LinkedIn",
  INTERNAL_REFERRAL: "内推",
  CAREER_FAIR: "双选会",
  OTHER: "其他",
};
