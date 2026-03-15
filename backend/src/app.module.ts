import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { EmployeesModule } from './employees/employees.module.js';
import { ManagersModule } from './managers/managers.module.js';
import { LeaveRequestsModule } from './leave-requests/leave-requests.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';

@Module({
  imports: [
    PrismaModule,
    EmployeesModule,
    ManagersModule,
    LeaveRequestsModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
