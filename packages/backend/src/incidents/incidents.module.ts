import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { IncidentsService } from './incidents.service';
import { IncidentsController } from './incidents.controller';
import { IncidentStateMachineService } from './incident-state-machine.service';
import { Incident } from './incident.entity';
import { IncidentRepository } from './incident.repository';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Incident]),
    UsersModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [IncidentsController],
  providers: [IncidentsService, IncidentStateMachineService, IncidentRepository],
  exports: [IncidentsService, IncidentStateMachineService],
})
export class IncidentsModule {}