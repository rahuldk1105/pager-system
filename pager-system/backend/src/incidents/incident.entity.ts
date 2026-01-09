import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum IncidentStatus {
  CREATED = 'created',
  ACKNOWLEDGED = 'acknowledged',
  ESCALATED = 'escalated',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum IncidentPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('incidents')
export class Incident {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  title: string;

  @ApiPropertyOptional()
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty()
  @Column({
    type: 'enum',
    enum: IncidentPriority,
    default: IncidentPriority.MEDIUM,
  })
  priority: IncidentPriority;

  @ApiProperty()
  @Column({
    type: 'enum',
    enum: IncidentStatus,
    default: IncidentStatus.CREATED,
  })
  status: IncidentStatus;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  assignedTo?: string;

  @ApiProperty()
  @Column()
  createdBy: string;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  acknowledgedAt?: Date;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  acknowledgedBy?: string;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  resolvedAt?: Date;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  resolvedBy?: string;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  closedAt?: Date;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  closedBy?: string;

  @ApiProperty()
  @Column({ type: 'integer', default: 15 })
  escalationTimeoutMinutes: number;

  @ApiPropertyOptional()
  @Column({ type: 'jsonb', nullable: true, default: {} })
  metadata?: Record<string, any>;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations (to be implemented)
  // assignedUser?: User;
  // createdByUser?: User;
  // acknowledgedByUser?: User;
  // resolvedByUser?: User;
  // closedByUser?: User;

  // Helper methods
  isActive(): boolean {
    return [IncidentStatus.CREATED, IncidentStatus.ACKNOWLEDGED, IncidentStatus.ESCALATED].includes(this.status);
  }

  canBeAcknowledged(): boolean {
    return this.status === IncidentStatus.CREATED || this.status === IncidentStatus.ESCALATED;
  }

  canBeResolved(): boolean {
    return this.status === IncidentStatus.ACKNOWLEDGED || this.status === IncidentStatus.ESCALATED;
  }

  canBeClosed(): boolean {
    return this.status === IncidentStatus.RESOLVED;
  }
}