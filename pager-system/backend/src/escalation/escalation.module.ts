import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { EscalationService, EscalationProcessor } from './escalation.service';
import { IncidentsModule } from '../incidents/incidents.module';

@Module({
  imports: [
    IncidentsModule,
    BullModule.registerQueue({
      name: 'escalation',
    }),
  ],
  providers: [EscalationService, EscalationProcessor],
  exports: [EscalationService],
})
export class EscalationModule {}