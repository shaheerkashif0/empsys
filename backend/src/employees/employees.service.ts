import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateEmployeeDto } from './dto/create-employee.dto.js';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}


//create new employee with name email dept and annual leeves.
//annual leaves defualt vaue is set to 20
  async create(dto: CreateEmployeeDto) {
    return this.prisma.employee.create({
      data: {
        name: dto.name,
        email: dto.email,
        department: dto.department,
        annualLeaveEntitlement: dto.annualLeaveEntitlement ?? 20,
      },
    });
  }

  //finding all users for the employees home page
  async findAll() {
    return this.prisma.employee.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  //search a single employee and then correspondingly search for their leave requests 
  //then calcualting their toal number of used leaves via tracking the dates of approved leaves
  //return the emplpoyee+ used leave days +remaning leave days + all the leave requests
  async findOneWithBalance(id: number) {
    const employee = await this.prisma.employee.findUnique({
      where: { employeeId: id },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    const leaveRequests = await this.prisma.leaveRequest.findMany({
      where: { employeeId: id },
      include: { manager: true },
      orderBy: { createdAt: 'desc' },
    });

    // Count total approved leave days across all types
    let usedLeaveDays = 0;
    for (const req of leaveRequests) {
      if (String(req.status) === 'APPROVED') {
        const start = new Date(req.startDate);
        const end = new Date(req.endDate);
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        usedLeaveDays += diffDays;
      }
    }

    return {
      ...employee,
      usedLeaveDays,
      remainingLeaveDays: employee.annualLeaveEntitlement - usedLeaveDays,
      leaveRequests,
    };
  }
}
