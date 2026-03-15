import { Controller, Get, Post, Body } from '@nestjs/common';
import { ManagersService } from './managers.service.js';
import { CreateManagerDto } from './dto/create-manager.dto.js';

@Controller('managers')
export class ManagersController {
  constructor(private readonly managersService: ManagersService) {}

  @Post()
  create(@Body() dto: CreateManagerDto) {
    return this.managersService.create(dto);
  }

  @Get()
  findAll() {
    return this.managersService.findAll();
  }
}
