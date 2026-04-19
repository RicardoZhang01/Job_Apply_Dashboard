import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export abstract class LlmProvider {
  abstract complete(task: string, prompt: string): Promise<string>;
}

/**
 * OpenAI 兼容 provider。可对接 OpenAI 官方或兼容接口网关。
 * 仅在调用 AI 接口时读取环境变量，不主动执行。
 */
@Injectable()
export class OpenAiLlmProvider implements LlmProvider {
  constructor(private readonly config: ConfigService) {}

  async complete(task: string, prompt: string): Promise<string> {
    const apiKey = this.config.get<string>('OPENAI_API_KEY')?.trim();
    const baseUrl = (
      this.config.get<string>('OPENAI_BASE_URL')?.trim() ??
      'https://api.openai.com/v1'
    ).replace(/\/+$/, '');
    const model = this.config.get<string>('OPENAI_MODEL')?.trim() ?? 'gpt-4o-mini';
    if (!apiKey) {
      throw new Error('openai_api_key_missing');
    }

    const system = this.systemPrompt(task);
    const user = `请基于以下输入生成结果（中文，简洁、可执行）:\n\n${prompt}`;
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
    });
    if (!res.ok) {
      throw new Error(`openai_http_${res.status}`);
    }
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('openai_empty_content');
    }
    return content;
  }

  private systemPrompt(task: string): string {
    switch (task) {
      case 'jd-summary':
        return '你是求职助手，负责提炼岗位关键信息。输出精炼摘要，不要编造。';
      case 'stats-insight':
        return '你是数据分析助手，负责从统计结果提炼结论与行动建议。';
      default:
        return '你是求职流程优化助手，输出可执行建议并附简短原因。';
    }
  }
}
