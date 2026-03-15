import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto.js';
import { FilterLeaveRequestDto } from './dto/filter-leave-request.dto.js';
import { LeaveStatus, LeaveType, Prisma } from '@prisma/client';

@Injectable()
export class LeaveRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  //calculate how many leave days an employee has remaining
  private async getRemainingDays(employeeId: number) {
    const employee = await this.prisma.employee.findUnique({
      where: { employeeId },
    });
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    const approvedRequests = await this.prisma.leaveRequest.findMany({
      where: { employeeId, status: 'APPROVED' },
    });

    let used = 0;
    for (const req of approvedRequests) {
      const start = new Date(req.startDate);
      const end = new Date(req.endDate);
      used += Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }

    return {
      entitlement: employee.annualLeaveEntitlement,
      used,
      remaining: employee.annualLeaveEntitlement - used,
    };
  }

  private calcDays(start: Date, end: Date): number {
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  //create new leave request
  //employee id, start date, end date, type+comments
  async create(dto: CreateLeaveRequestDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { employeeId: dto.employeeId },
    });

    if (!employee) {
      throw new NotFoundException(
        `Employee with ID ${dto.employeeId} not found`,
      );
    }

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    if (end < start) {
      throw new BadRequestException('End date must be after start date');
    }

    // Check if requested days exceed remaining balance
    const requestedDays = this.calcDays(start, end);
    const { remaining } = await this.getRemainingDays(dto.employeeId);

    if (requestedDays > remaining) {
      throw new BadRequestException(
        `Insufficient leave balance. Requesting ${requestedDays} day(s) but only ${remaining} day(s) remaining out of ${employee.annualLeaveEntitlement} total entitlement.`,
      );
    }

    return this.prisma.leaveRequest.create({
      data: {
        employeeId: dto.employeeId,
        startDate: start,
        endDate: end,
        leaveType: dto.leaveType as LeaveType,
        notes: dto.notes,
      },
      include: {
        employee: true,
      },
    });
  }


  //get all the leave requests but no comments returned

  async findAll(filter: FilterLeaveRequestDto) {
    const where: Prisma.LeaveRequestWhereInput = {};

    if (filter.employeeId) {
      where.employeeId = filter.employeeId;
    }

    if (filter.status) {
      where.status = filter.status as LeaveStatus;
    }

    if (filter.startDate || filter.endDate) {
      where.startDate = {};
      if (filter.startDate) {
        where.startDate.gte = new Date(filter.startDate);
      }
      if (filter.endDate) {
        where.startDate.lte = new Date(filter.endDate);
      }
    }

    return this.prisma.leaveRequest.findMany({
      where,
      include: {
        employee: true,
        manager: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  //approving the request
  //check if approving would exceed entitlement, then update status
  async approve(id: number, managerId: number) {
    const request = await this.prisma.leaveRequest.findUnique({
      where: { leaveRequestId: id },
    });

    if (!request) {
      throw new NotFoundException(`Leave request with ID ${id} not found`);
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException('Only pending requests can be approved');
    }

    const manager = await this.prisma.manager.findUnique({
      where: { managerId },
    });

    if (!manager) {
      throw new NotFoundException(`Manager with ID ${managerId} not found`);
    }

    // Check if approving would exceed entitlement
    const leaveDays = this.calcDays(new Date(request.startDate), new Date(request.endDate));
    const { remaining, entitlement } = await this.getRemainingDays(request.employeeId);

    if (leaveDays > remaining) {
      throw new BadRequestException(
        `Cannot approve. This request is for ${leaveDays} day(s) but the employee only has ${remaining} day(s) remaining out of ${entitlement} total entitlement.`,
      );
    }

    // Update leave request status
    return this.prisma.leaveRequest.update({
      where: { leaveRequestId: id },
      data: {
        status: 'APPROVED',
        managerId,
        decisionDate: new Date(),
      },
      include: {
        employee: true,
        manager: true,
      },
    });
  }


  //update the status to reject
  async reject(id: number, managerId: number) {
    const request = await this.prisma.leaveRequest.findUnique({
      where: { leaveRequestId: id },
    });

    if (!request) {
      throw new NotFoundException(`Leave request with ID ${id} not found`);
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException('Only pending requests can be rejected');
    }

    const manager = await this.prisma.manager.findUnique({
      where: { managerId },
    });

    if (!manager) {
      throw new NotFoundException(`Manager with ID ${managerId} not found`);
    }

    return this.prisma.leaveRequest.update({
      where: { leaveRequestId: id },
      data: {
        status: 'REJECTED',
        managerId,
        decisionDate: new Date(),
      },
      include: {
        employee: true,
        manager: true,
      },
    });
  }
}
