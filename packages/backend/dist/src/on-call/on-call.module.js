"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnCallModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const on_call_service_1 = require("./on-call.service");
const on_call_entity_1 = require("./on-call.entity");
const users_module_1 = require("../users/users.module");
let OnCallModule = class OnCallModule {
};
exports.OnCallModule = OnCallModule;
exports.OnCallModule = OnCallModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([on_call_entity_1.OnCallSchedule, on_call_entity_1.ScheduleAssignment, on_call_entity_1.Rotation]),
            users_module_1.UsersModule,
        ],
        providers: [on_call_service_1.OnCallService],
        exports: [on_call_service_1.OnCallService],
    })
], OnCallModule);
//# sourceMappingURL=on-call.module.js.map