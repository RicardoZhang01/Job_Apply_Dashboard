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
