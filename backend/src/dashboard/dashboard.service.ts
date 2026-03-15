import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getUpcomingLeave() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.leaveRequest.findMany({
      where: {
        status: 'APPROVED',
        endDate: {
          gte: today,
        },
      },
      include: {
        employee: true,
      },
      orderBy: { startDate: 'asc' },
    });
  }
}
