import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { LeaveRequestsService } from './leave-requests.service.js';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto.js';
import { FilterLeaveRequestDto } from './dto/filter-leave-request.dto.js';

@Controller('leave-requests')
export class LeaveRequestsController {
  constructor(private readonly leaveRequestsService: LeaveRequestsService) {}

  @Post()
  create(@Body() dto: CreateLeaveRequestDto) {
    return this.leaveRequestsService.create(dto);
  }

  @Get()
  findAll(@Query() filter: FilterLeaveRequestDto) {
    return this.leaveRequestsService.findAll(filter);
  }

  @Patch(':id/approve')
  approve(
    @Param('id', ParseIntPipe) id: number,
    @Body('managerId', ParseIntPipe) managerId: number,
  ) {
    return this.leaveRequestsService.approve(id, managerId);
  }

  @Patch(':id/reject')
  reject(
    @Param('id', ParseIntPipe) id: number,
    @Body('managerId', ParseIntPipe) managerId: number,
  ) {
    return this.leaveRequestsService.reject(id, managerId);
  }
}
