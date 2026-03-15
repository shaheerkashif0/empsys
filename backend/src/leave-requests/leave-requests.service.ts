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


//cretae new leave request 
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

  //approving the request but first fetch the user and decrement their annual leave entitlement
  //then approve the request and return the updated request with employee and manager details
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

    // Calculate leave days
    const start = new Date(request.startDate);
    const end = new Date(request.endDate);
    const diffTime = end.getTime() - start.getTime();
    const leaveDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Decrement employee leave entitlement
    await this.prisma.employee.update({
      where: { employeeId: request.employeeId },
      data: {
        annualLeaveEntitlement: { decrement: leaveDays },
      },
    });

    // Update leave request status
    const updatedRequest = await this.prisma.leaveRequest.update({
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

    return updatedRequest;
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
