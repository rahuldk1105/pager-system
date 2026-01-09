import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum RotationType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

@Entity('on_call_schedules')
export class OnCallSchedule {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiPropertyOptional()
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty()
  @Column({
    type: 'enum',
    enum: RotationType,
    default: RotationType.WEEKLY,
  })
  rotationType: RotationType;

  @ApiProperty()
  @Column({ default: 'UTC' })
  timezone: string;

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty()
  @Column()
  createdBy: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiPropertyOptional({ type: () => [ScheduleAssignment] })
  @OneToMany(() => ScheduleAssignment, assignment => assignment.schedule)
  assignments?: ScheduleAssignment[];
}

@Entity('schedule_assignments')
export class ScheduleAssignment {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  scheduleId: string;

  @ApiProperty()
  @Column()
  userId: string;

  @ApiProperty()
  @Column({ default: 1 })
  priority: number;

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  // Relations
  schedule?: OnCallSchedule;
}

@Entity('rotations')
export class Rotation {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  scheduleId: string;

  @ApiProperty()
  @Column()
  userId: string;

  @ApiProperty()
  @Column({ type: 'timestamp with time zone' })
  startTime: Date;

  @ApiProperty()
  @Column({ type: 'timestamp with time zone' })
  endTime: Date;

  @ApiProperty()
  @Column({ default: false })
  isOverride: boolean;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  // Relations
  schedule?: OnCallSchedule;
}