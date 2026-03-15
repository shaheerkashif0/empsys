import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateManagerDto } from './dto/create-manager.dto.js';

@Injectable()
export class ManagersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateManagerDto) {
    return this.prisma.manager.create({
      data: {
        name: dto.name,
        email: dto.email,
      },
    });
  }

  async findAll() {
    return this.prisma.manager.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
