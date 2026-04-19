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
  nextInterviewAt: string | null;
  resumeSubmitted: boolean;
  coverLetterSubmitted: boolean;
  portfolioSubmitted: boolean;
  transcriptSubmitted: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
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
