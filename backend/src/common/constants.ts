export const APPLICATION_STATUSES = [
  'COLLECTING',
  'TODO',
  'APPLIED',
  'ONLINE_TEST',
  'INTERVIEWING',
  'OFFER',
  'REJECTED',
  'ARCHIVED',
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const ACTIVE_STATUSES: ApplicationStatus[] = [
  'COLLECTING',
  'TODO',
  'APPLIED',
  'ONLINE_TEST',
  'INTERVIEWING',
];

export const TERMINAL_STATUSES: ApplicationStatus[] = [
  'OFFER',
  'REJECTED',
  'ARCHIVED',
];

export const PRIORITIES = ['HIGH', 'MEDIUM', 'LOW'] as const;
export type Priority = (typeof PRIORITIES)[number];

export const SOURCE_CHANNELS = [
  'OFFICIAL_SITE',
  'BOSS',
  'LINKEDIN',
  'INTERNAL_REFERRAL',
  'CAREER_FAIR',
  'OTHER',
] as const;
export type SourceChannel = (typeof SOURCE_CHANNELS)[number];

export function isActiveStatus(s: string): boolean {
  return ACTIVE_STATUSES.includes(s as ApplicationStatus);
}

/** 简历/材料主要语言标记 */
export const MATERIALS_LOCALES = ['ZH', 'EN', 'MIXED'] as const;

/** 岗位大类（复盘统计用） */
export const JOB_CATEGORIES = [
  'PRODUCT',
  'DEV',
  'ALGO',
  'DATA',
  'DESIGN',
  'OTHER',
] as const;

/** 雇佣/招聘类型 */
export const EMPLOYMENT_TYPES = ['INTERN', 'CAMPUS', 'FULLTIME', 'OTHER'] as const;

/** 未通过/结束时结构化原因 */
export const FAILURE_TAGS = [
  'RESUME_REJECT',
  'TEST_FAIL',
  'INTERVIEW_FAIL',
  'WITHDRAWN',
  'MISMATCH',
  'SCHEDULE',
  'OTHER',
] as const;
