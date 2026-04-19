export type Application = {
  id: string;
  userId: string;
  companyName: string;
  roleName: string;
  location: string | null;
  sourceChannel: string | null;
  jobUrl: string | null;
  status: string;
  priority: string;
  deadlineAt: string | null;
  appliedAt: string | null;
  writtenTestAt: string | null;
  nextInterviewAt: string | null;
  resumeSubmitted: boolean;
  coverLetterSubmitted: boolean;
  portfolioSubmitted: boolean;
  transcriptSubmitted: boolean;
  notes: string | null;
  jdSummary: string | null;
  companyNotes: string | null;
  interviewPrepNotes: string | null;
  hrNotes: string | null;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  resumeVersionLabel: string | null;
  materialsLocale: string | null;
  resumeTailoredNote: string | null;
  jobCategory: string | null;
  employmentType: string | null;
  failureTag: string | null;
};

export type OverviewStats = {
  totalApplications: number;
  byStatus: Record<string, number>;
  dueSoonCount: number;
  interviewsToday: number;
  interviewRate: number;
  offerRate: number;
  offerCount: number;
  todoCount: number;
  appliedCount: number;
  interviewingCount: number;
};

export type DashboardTodoItem = {
  todoKey: string;
  applicationId: string;
  title: string;
  kind: string;
  companyName: string;
  roleName: string;
};

export type ReminderItem = {
  reminderKey: string;
  applicationId: string;
  type: string;
  title: string;
  remindAt: string;
  isRead: boolean;
  application: {
    companyName: string;
    roleName: string;
    status: string;
  };
};

export type AiJdExtractResponse = {
  available: boolean;
  reason?: string;
  companyName: string | null;
  roleName: string | null;
  location: string | null;
  jdSummary: string;
  keywords: string[];
  materialHints: string[];
  reasons: string[];
};

export type AiNextActionsResponse = {
  available: boolean;
  reason?: string;
  priorityLabel: "HIGH" | "MEDIUM" | "LOW";
  top3Actions: string[];
  reasons: string[];
};

export type AiResumeSuggestResponse = {
  available: boolean;
  reason?: string;
  suggestions: string[];
  coverLetterDraft: string;
  reasons: string[];
};

export type AiInterviewPrepResponse = {
  available: boolean;
  reason?: string;
  checklist: string[];
  questions: string[];
  introHint: string;
  reasons: string[];
};

export type AiStatsInsightResponse = {
  available: boolean;
  reason?: string;
  headline: string;
  insights: string[];
  actions: string[];
  reasons: string[];
};

export type AiDashboardDigestResponse = {
  available: boolean;
  reason?: string;
  headline: string;
  bullets: string[];
  reasons: string[];
};
