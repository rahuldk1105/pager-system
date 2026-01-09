import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnCallService } from './on-call.service';
import { OnCallSchedule, ScheduleAssignment, Rotation } from './on-call.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OnCallSchedule, ScheduleAssignment, Rotation]),
    UsersModule,
  ],
  providers: [OnCallService],
  exports: [OnCallService],
})
export class OnCallModule {}