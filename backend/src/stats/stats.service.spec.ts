import { StatsService } from './stats.service';
import { PrismaService } from '../prisma/prisma.service';

describe('StatsService', () => {
  it('overview counts applications', async () => {
    const prisma = {
      application: {
        findMany: jest.fn().mockResolvedValue([
          {
            status: 'TODO',
            deadlineAt: null,
            nextInterviewAt: null,
            updatedAt: new Date(),
          },
          {
            status: 'OFFER',
            deadlineAt: null,
            nextInterviewAt: null,
            updatedAt: new Date(),
          },
        ]),
      },
    } as unknown as PrismaService;
    const svc = new StatsService(prisma);
    const o = await svc.overview('u1');
    expect(o.totalApplications).toBe(2);
    expect(o.offerCount).toBe(1);
  });
});
