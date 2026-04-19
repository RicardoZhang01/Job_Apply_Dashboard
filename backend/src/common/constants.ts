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
