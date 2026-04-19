import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Application, ApplicationHistory } from '@prisma/client';
import { calendarDaysBetween, startOfDayUtc } from '../lib/date-utils';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicationIdDto } from './dto/application-id.dto';
import { JdExtractDto } from './dto/jd-extract.dto';
import { LlmProvider } from './providers/llm.provider';

type NextActionsResponse = {
  available: boolean;
  reason?: string;
  priorityLabel: 'HIGH' | 'MEDIUM' | 'LOW';
  top3Actions: string[];
  reasons: string[];
};

type ResumeSuggestResponse = {
  available: boolean;
  reason?: string;
  suggestions: string[];
  coverLetterDraft: string;
  reasons: string[];
};

type InterviewPrepResponse = {
  available: boolean;
  reason?: string;
  checklist: string[];
  questions: string[];
  introHint: string;
  reasons: string[];
};

@Injectable()
export class AiService {
  private readonly userHits = new Map<string, number[]>();
  private readonly WINDOW_MS = 60_000;
  private readonly MAX_REQ_PER_WINDOW = 24;

  constructor(
    private readonly prisma: PrismaService,
    private readonly llmProvider: LlmProvider,
  ) {}

  private guardRate(userId: string) {
    const now = Date.now();
    const prev = this.userHits.get(userId) ?? [];
    const kept = prev.filter((t) => now - t <= this.WINDOW_MS);
    if (kept.length >= this.MAX_REQ_PER_WINDOW) {
      throw new HttpException(
        'AI 请求过于频繁，请稍后再试',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    kept.push(now);
    this.userHits.set(userId, kept);
  }

  private clip(text: string | undefined, max = 4000): string {
    return (text ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
  }

  private debugLog(
    hypothesisId: string,
    location: string,
    message: string,
    data: Record<string, unknown>,
  ) {
    // #region agent log
    fetch('http://127.0.0.1:7289/ingest/ff4ba58b-9540-4559-bb1d-ce8a23537215', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': 'a9e5a9',
      },
      body: JSON.stringify({
        sessionId: 'a9e5a9',
        location,
        message,
        data,
        timestamp: Date.now(),
        hypothesisId,
      }),
    }).catch(() => {});
    // #endregion
  }

  private async safeComplete(task: string, prompt: string, fallback: string) {
    const timeout = new Promise<string>((resolve) =>
      setTimeout(() => resolve(fallback), 5000),
    );
    try {
      const out = await Promise.race([
        this.llmProvider.complete(task, this.clip(prompt, 10_000)),
        timeout,
      ]);
      this.debugLog('H-AI-CALL', 'ai.service:safeComplete', 'llm complete success', {
        task,
        usedFallback: out === fallback,
        outLen: out.length,
      });
      return out;
    } catch {
      this.debugLog('H-AI-CALL', 'ai.service:safeComplete', 'llm complete failed', {
        task,
        fallbackLen: fallback.length,
      });
      return fallback;
    }
  }

  private async completeOrThrow(task: string, prompt: string): Promise<string> {
    const out = await this.llmProvider.complete(task, this.clip(prompt, 10_000));
    this.debugLog('H-AI-CALL', 'ai.service:completeOrThrow', 'llm complete success', {
      task,
      outLen: out.length,
    });
    return out;
  }

  private explainAiError(err: unknown): string {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('openai_api_key_missing')) {
      return '未检测到 AI Key，请在后端环境变量配置 OPENAI_API_KEY。';
    }
    if (msg.includes('openai_http_401')) {
      return 'AI Key 无效或已失效，请检查 OPENAI_API_KEY。';
    }
    if (msg.includes('openai_http_429')) {
      return 'AI 请求过于频繁或额度受限，请稍后再试。';
    }
    if (msg.includes('openai_http_')) {
      return 'AI 服务暂时不可用，请稍后重试。';
    }
    if (msg.includes('openai_empty_content')) {
      return 'AI 返回为空，请稍后重试。';
    }
    return 'AI 模型当前不可用，请稍后重试。';
  }

  private async getAppAndHistory(userId: string, applicationId: string) {
    const app = await this.prisma.application.findFirst({
      where: { id: applicationId, userId },
    });
    if (!app) throw new NotFoundException('申请不存在');
    const history = await this.prisma.applicationHistory.findMany({
      where: { applicationId },
      orderBy: { createdAt: 'desc' },
      take: 8,
    });
    return { app, history };
  }

  async jdExtract(userId: string, dto: JdExtractDto) {
    this.guardRate(userId);
    const raw = this.clip(dto.rawText, 20_000);
    const url = this.clip(dto.jobUrl, 1000);
    if (!raw && !url) {
      throw new BadRequestException('请提供 JD 文本或岗位链接');
    }
    const source = raw || url;

    const roleGuess =
      this.pickFirst(source, [
        /(?:岗位|职位|Role|Title)[:：]\s*([^\n,，。]+)/i,
        /(产品经理|后端开发|前端开发|算法工程师|数据分析师|运营)/i,
      ]) ?? '';
    const locationGuess =
      this.pickFirst(source, [/(?:地点|Location)[:：]\s*([^\n,，。]+)/i]) ?? '';
    const companyGuess =
      this.pickFirst(source, [/(?:公司|Company)[:：]\s*([^\n,，。]+)/i]) ?? '';
    const keywords = [
      'SQL',
      'Python',
      'A/B',
      '增长',
      '数据分析',
      'LLM',
      'Prompt',
      '产品设计',
      '沟通协作',
      '实习',
      '英语',
    ].filter((k) => source.toLowerCase().includes(k.toLowerCase()));
    const materialHints = [
      source.includes('作品集') ? '需要作品集' : null,
      source.includes('英文') ? '可能需要英文材料' : null,
      source.includes('实习') ? '关注实习经历' : null,
    ].filter(Boolean) as string[];

    const summaryFallback = this.clip(source, 240);
    let jdSummary: string;
    try {
      jdSummary = await this.completeOrThrow('jd-summary', source);
    } catch (e) {
      this.debugLog('H-AI-CALL', 'ai.service:jdExtract', 'jd extract ai failed', {
        err: e instanceof Error ? e.message : String(e),
      });
      throw new HttpException(this.explainAiError(e), HttpStatus.BAD_GATEWAY);
    }

    return {
      available: true,
      companyName: companyGuess || null,
      roleName: roleGuess || null,
      location: locationGuess || null,
      jdSummary: this.clip(jdSummary, 1800),
      keywords: keywords.slice(0, 10),
      materialHints,
      reasons: [
        '基于粘贴内容做启发式抽取，建议人工确认后保存',
        '已按关键词与字段模式提取公司/岗位/地点等信息',
      ],
    };
  }

  async nextActions(userId: string, dto: ApplicationIdDto): Promise<NextActionsResponse> {
    this.guardRate(userId);
    const { app, history } = await this.getAppAndHistory(userId, dto.applicationId);
    const matCount = [
      app.resumeSubmitted,
      app.coverLetterSubmitted,
      app.portfolioSubmitted,
      app.transcriptSubmitted,
    ].filter(Boolean).length;
    const matsIncomplete = matCount < 4;
    const daysLeft = app.deadlineAt
      ? calendarDaysBetween(startOfDayUtc(new Date()), app.deadlineAt)
      : null;

    let score = 45;
    if (daysLeft !== null) {
      if (daysLeft <= 1) score += 30;
      else if (daysLeft <= 3) score += 18;
      else if (daysLeft > 10) score -= 8;
    }
    if (app.status === 'TODO') score += 10;
    if (app.status === 'INTERVIEWING') score += 15;
    if (app.status === 'REJECTED' || app.status === 'ARCHIVED') score -= 20;
    if (matsIncomplete) score += 8;
    const recentStatusChange = history.some((h) => h.actionType === 'STATUS_CHANGE');
    if (!recentStatusChange) score += 5;
    const priorityLabel: 'HIGH' | 'MEDIUM' | 'LOW' =
      score >= 70 ? 'HIGH' : score >= 45 ? 'MEDIUM' : 'LOW';

    const actions: string[] = [];
    const reasons: string[] = [];
    if (daysLeft !== null && daysLeft <= 1) {
      actions.push('今日优先处理：截止临近，尽快完成提交或明确放弃');
      reasons.push('截止时间紧迫');
    }
    if (matsIncomplete) {
      actions.push(`补全材料标记（当前 ${matCount}/4），避免临近截止漏项`);
      reasons.push('材料未齐');
    }
    if (app.status === 'APPLIED') {
      actions.push('准备一条跟进计划（投递后 5-7 天）');
      reasons.push('已投递阶段适合安排跟进');
    }
    if (app.status === 'INTERVIEWING') {
      actions.push('整理 3 条项目亮点 + 2 条问题反问');
      reasons.push('面试阶段建议强化表达');
    }
    if (actions.length < 3) {
      actions.push('更新本申请的关键备注，沉淀可复用结论');
    }
    const base = {
      priorityLabel,
      top3Actions: actions.slice(0, 3),
      reasons: [...new Set(reasons)].slice(0, 3),
    };
    try {
      const aiText = await this.completeOrThrow(
        'next-actions',
        JSON.stringify({
          company: app.companyName,
          role: app.roleName,
          status: app.status,
          priorityLabel,
          baseActions: base.top3Actions,
          baseReasons: base.reasons,
        }),
      );
      return {
        available: true,
        ...base,
        top3Actions: [aiText, ...base.top3Actions].slice(0, 3),
      };
    } catch (e) {
      this.debugLog('H-AI-CALL', 'ai.service:nextActions', 'next actions ai failed', {
        err: e instanceof Error ? e.message : String(e),
      });
      return {
        available: false,
        reason: this.explainAiError(e),
        priorityLabel: 'MEDIUM',
        top3Actions: [],
        reasons: [],
      };
    }
  }

  async resumeSuggest(userId: string, dto: ApplicationIdDto): Promise<ResumeSuggestResponse> {
    this.guardRate(userId);
    const { app } = await this.getAppAndHistory(userId, dto.applicationId);
    const context = [app.jdSummary, app.companyNotes, app.roleName, app.notes]
      .filter(Boolean)
      .join('\n');
    const keyTerms = ['数据分析', '增长', '用户研究', 'SQL', 'A/B', '跨团队沟通'].filter(
      (k) => context.includes(k),
    );
    const suggestions = [
      `在简历顶部加入与「${app.roleName}」相关的关键词摘要（3-5 个）。`,
      '将最相关项目放在前两段，并量化结果（如提升xx%、缩短xx天）。',
      '每段项目描述采用“问题-动作-结果”结构，突出你的决策作用。',
      keyTerms.length
        ? `建议覆盖 JD 关键词：${keyTerms.join('、')}`
        : '建议对齐 JD 关键词（技能/业务/工具）并在项目中体现。',
    ];
    const coverLetterDraft = `您好，我对贵司 ${app.roleName} 岗位非常感兴趣。结合过往项目经验，我在问题定义、方案推进与跨团队协作方面有较强实践，期待进一步沟通我如何为该岗位创造价值。`;
    try {
      await this.completeOrThrow(
        'resume-suggest',
        JSON.stringify({
          role: app.roleName,
          jdSummary: app.jdSummary,
          companyNotes: app.companyNotes,
        }),
      );
      return {
        available: true,
        suggestions: suggestions.slice(0, 4),
        coverLetterDraft,
        reasons: ['基于当前岗位摘要与备注生成，建议人工二次润色。'],
      };
    } catch (e) {
      this.debugLog('H-AI-CALL', 'ai.service:resumeSuggest', 'resume suggest ai failed', {
        err: e instanceof Error ? e.message : String(e),
      });
      return {
        available: false,
        reason: this.explainAiError(e),
        suggestions: [],
        coverLetterDraft: '',
        reasons: [],
      };
    }
  }

  async interviewPrep(userId: string, dto: ApplicationIdDto): Promise<InterviewPrepResponse> {
    this.guardRate(userId);
    const { app } = await this.getAppAndHistory(userId, dto.applicationId);
    const role = app.roleName || '目标岗位';
    try {
      await this.completeOrThrow(
        'interview-prep',
        JSON.stringify({
          role: app.roleName,
          status: app.status,
          interviewAt: app.nextInterviewAt,
          jdSummary: app.jdSummary,
        }),
      );
      return {
        available: true,
        checklist: [
          '复盘岗位 JD：职责、能力要求、业务场景',
          '准备 3 个项目案例：目标、动作、结果、反思',
          '准备 2 个反问问题：团队目标、评估标准',
          app.nextInterviewAt ? '确认面试时间与平台链接' : '补充面试时间并设置提醒',
        ],
        questions: [
          `为什么你适合这个${role}岗位？`,
          '请讲一个你推动跨团队协作并拿到结果的案例。',
          '如果关键指标不达预期，你如何定位与迭代？',
          '你如何验证一个方案是否真正有效？',
        ],
        introHint:
          '自我介绍建议 60-90 秒：背景 -> 与岗位最相关经历 -> 可量化结果 -> 求职动机。',
        reasons: ['问题模板结合岗位阶段生成，建议结合实际经历补充细节。'],
      };
    } catch (e) {
      this.debugLog('H-AI-CALL', 'ai.service:interviewPrep', 'interview prep ai failed', {
        err: e instanceof Error ? e.message : String(e),
      });
      return {
        available: false,
        reason: this.explainAiError(e),
        checklist: [],
        questions: [],
        introHint: '',
        reasons: [],
      };
    }
  }

  async statsInsight(userId: string) {
    this.guardRate(userId);
    const apps = await this.prisma.application.findMany({
      where: { userId },
      select: { status: true, sourceChannel: true, jobCategory: true },
    });
    const total = apps.length || 1;
    const offer = apps.filter((a) => a.status === 'OFFER').length;
    const interviewing = apps.filter((a) => a.status === 'INTERVIEWING').length;
    const topChannel = this.topKey(apps.map((a) => a.sourceChannel ?? 'UNKNOWN'));
    const topCategory = this.topKey(apps.map((a) => a.jobCategory ?? 'UNSET'));
    this.debugLog('H-CHANNEL-LABEL', 'ai.service:statsInsight', 'top channel raw key', {
      topChannel,
      topCategory,
    });
    const channelLabelMap: Record<string, string> = {
      OFFICIAL_SITE: '官网',
      BOSS: 'Boss直聘',
      LINKEDIN: 'LinkedIn',
      INTERNAL_REFERRAL: '内推',
      CAREER_FAIR: '双选会',
      OTHER: '其他',
      UNKNOWN: '未标记渠道',
    };
    try {
      const narrative = await this.completeOrThrow(
        'stats-insight',
        JSON.stringify({ total, offer, interviewing, topChannel, topCategory }),
      );
      return {
        available: true,
        headline: `当前 Offer 率 ${(offer / total * 100).toFixed(1)}%，进面相关占比 ${(
          ((offer + interviewing) / total) *
          100
        ).toFixed(1)}%`,
        insights: [
          `高频渠道：${channelLabelMap[topChannel] ?? topChannel}`,
          `高频岗位大类：${topCategory === 'UNSET' ? '未分类' : topCategory}`,
          this.clip(narrative, 220),
        ],
        actions: [
          '保留高转化渠道投入，减少低反馈渠道时间',
          '为目标岗位维护一版高匹配简历与求职信',
          '每周复盘一次失败原因并更新行动策略',
        ],
        reasons: ['基于统计聚合结果生成，属于策略建议而非确定性结论。'],
      };
    } catch (e) {
      this.debugLog('H-AI-CALL', 'ai.service:statsInsight', 'stats insight ai failed', {
        err: e instanceof Error ? e.message : String(e),
      });
      return {
        available: false,
        reason: this.explainAiError(e),
        headline: '',
        insights: [],
        actions: [],
        reasons: [],
      };
    }
  }

  async dashboardDigest(userId: string) {
    this.guardRate(userId);
    const now = new Date();
    const start = startOfDayUtc(now);
    const apps = await this.prisma.application.findMany({
      where: { userId },
      select: {
        id: true,
        companyName: true,
        roleName: true,
        deadlineAt: true,
        nextInterviewAt: true,
        writtenTestAt: true,
        status: true,
      },
    });
    const dueToday = apps.filter(
      (a) => a.deadlineAt && calendarDaysBetween(start, a.deadlineAt) === 0,
    );
    const interviewsToday = apps.filter(
      (a) => a.nextInterviewAt && calendarDaysBetween(start, a.nextInterviewAt) === 0,
    );
    const testsToday = apps.filter(
      (a) => a.writtenTestAt && calendarDaysBetween(start, a.writtenTestAt) === 0,
    );
    const pending = apps.filter((a) => a.status === 'TODO').length;

    try {
      await this.completeOrThrow(
        'dashboard-digest',
        JSON.stringify({
          dueToday: dueToday.length,
          interviewsToday: interviewsToday.length,
          testsToday: testsToday.length,
          pending,
        }),
      );
      const bullets = [
        dueToday.length
          ? `今日截止 ${dueToday.length} 项，优先核对材料后提交`
          : '今日无到期截止项，可投入高价值准备任务',
        interviewsToday.length
          ? `今日面试 ${interviewsToday.length} 场，建议提前 30 分钟进入准备状态`
          : '今日无面试安排，可进行模拟问答训练',
        testsToday.length
          ? `今日笔试 ${testsToday.length} 场，建议优先处理有明确截止时间的题目`
          : '今日无笔试节点，可补全后续面试准备内容',
        `当前待投递 ${pending} 项，建议按截止时间与匹配度排序处理`,
      ];

      return {
        available: true,
        headline: `今日聚焦：截止 ${dueToday.length} · 面试 ${interviewsToday.length} · 笔试 ${testsToday.length}`,
        bullets: bullets.slice(0, 3),
        reasons: ['基于今日节点与状态规则生成，便于快速安排当天动作。'],
      };
    } catch (e) {
      this.debugLog('H-AI-CALL', 'ai.service:dashboardDigest', 'dashboard digest ai failed', {
        err: e instanceof Error ? e.message : String(e),
      });
      return {
        available: false,
        reason: this.explainAiError(e),
        headline: '',
        bullets: [],
        reasons: [],
      };
    }
  }

  private pickFirst(text: string, patterns: RegExp[]) {
    for (const p of patterns) {
      const m = text.match(p);
      if (m?.[1]) return this.clip(m[1], 80);
      if (m?.[0]) return this.clip(m[0], 80);
    }
    return null;
  }

  private topKey(list: string[]) {
    const map = new Map<string, number>();
    for (const item of list) {
      map.set(item, (map.get(item) ?? 0) + 1);
    }
    let best = 'UNKNOWN';
    let bestCount = -1;
    for (const [k, v] of map.entries()) {
      if (v > bestCount) {
        best = k;
        bestCount = v;
      }
    }
    return best;
  }
}
