import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { LlmProvider, OpenAiLlmProvider } from './providers/llm.provider';

@Module({
  imports: [AuthModule],
  controllers: [AiController],
  providers: [
    AiService,
    OpenAiLlmProvider,
    {
      provide: LlmProvider,
      useExisting: OpenAiLlmProvider,
    },
  ],
})
export class AiModule {}
