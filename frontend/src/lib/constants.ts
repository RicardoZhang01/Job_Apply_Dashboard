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
  COLLECTING: "感兴趣",
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

export const MATERIALS_LOCALES = ["ZH", "EN", "MIXED"] as const;
export const MATERIALS_LOCALE_LABELS: Record<string, string> = {
  ZH: "中文为主",
  EN: "英文为主",
  MIXED: "中英混用",
};

export const JOB_CATEGORIES = [
  "PRODUCT",
  "DEV",
  "ALGO",
  "DATA",
  "DESIGN",
  "OTHER",
] as const;
export const JOB_CATEGORY_LABELS: Record<string, string> = {
  PRODUCT: "产品",
  DEV: "开发",
  ALGO: "算法",
  DATA: "数据",
  DESIGN: "设计",
  OTHER: "其他",
};

export const EMPLOYMENT_TYPES = [
  "INTERN",
  "CAMPUS",
  "FULLTIME",
  "OTHER",
] as const;
export const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  INTERN: "实习",
  CAMPUS: "校招",
  FULLTIME: "全职",
  OTHER: "其他",
};

export const FAILURE_TAGS = [
  "RESUME_REJECT",
  "TEST_FAIL",
  "INTERVIEW_FAIL",
  "WITHDRAWN",
  "MISMATCH",
  "SCHEDULE",
  "OTHER",
] as const;
export const FAILURE_TAG_LABELS: Record<string, string> = {
  RESUME_REJECT: "简历未通过",
  TEST_FAIL: "笔试未通过",
  INTERVIEW_FAIL: "面试未通过",
  WITHDRAWN: "主动放弃",
  MISMATCH: "岗位不匹配",
  SCHEDULE: "时间冲突",
  OTHER: "其他",
};
