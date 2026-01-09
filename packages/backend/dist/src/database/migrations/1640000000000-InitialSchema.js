"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitialSchema1640000000000 = void 0;
const typeorm_1 = require("typeorm");
class InitialSchema1640000000000 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'users',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    generationStrategy: 'uuid',
                    default: 'uuid_generate_v4()',
                },
                {
                    name: 'email',
                    type: 'varchar',
                    isUnique: true,
                },
                {
                    name: 'passwordHash',
                    type: 'varchar',
                },
                {
                    name: 'firstName',
                    type: 'varchar',
                },
                {
                    name: 'lastName',
                    type: 'varchar',
                },
                {
                    name: 'phone',
                    type: 'varchar',
                    isNullable: true,
                },
                {
                    name: 'timezone',
                    type: 'varchar',
                    default: "'UTC'",
                },
                {
                    name: 'status',
                    type: 'enum',
                    enum: ['active', 'inactive', 'suspended'],
                    default: "'active'",
                },
                {
                    name: 'emailVerified',
                    type: 'boolean',
                    default: false,
                },
                {
                    name: 'createdAt',
                    type: 'timestamp with time zone',
                    default: 'now()',
                },
                {
                    name: 'updatedAt',
                    type: 'timestamp with time zone',
                    default: 'now()',
                },
            ],
        }));
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'user_roles',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    generationStrategy: 'uuid',
                    default: 'uuid_generate_v4()',
                },
                {
                    name: 'userId',
                    type: 'uuid',
                },
                {
                    name: 'role',
                    type: 'enum',
                    enum: ['user', 'lead', 'admin'],
                },
                {
                    name: 'assignedAt',
                    type: 'timestamp with time zone',
                    default: 'now()',
                },
                {
                    name: 'assignedBy',
                    type: 'uuid',
                    isNullable: true,
                },
            ],
            foreignKeys: [
                {
                    columnNames: ['userId'],
                    referencedTableName: 'users',
                    referencedColumnNames: ['id'],
                    onDelete: 'CASCADE',
                },
            ],
        }));
        await queryRunner.query(`
      CREATE INDEX "IDX_users_email" ON "users" ("email");
      CREATE INDEX "IDX_users_status" ON "users" ("status");
      CREATE INDEX "IDX_user_roles_user_id" ON "user_roles" ("userId");
      CREATE INDEX "IDX_user_roles_role" ON "user_roles" ("role");
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      DROP INDEX "IDX_user_roles_role";
      DROP INDEX "IDX_user_roles_user_id";
      DROP INDEX "IDX_users_status";
      DROP INDEX "IDX_users_email";
    `);
        await queryRunner.dropTable('user_roles');
        await queryRunner.dropTable('users');
    }
}
exports.InitialSchema1640000000000 = InitialSchema1640000000000;
//# sourceMappingURL=1640000000000-InitialSchema.js.map