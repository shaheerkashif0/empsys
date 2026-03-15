import { IsInt, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateLeaveRequestDto {
  @IsInt()
  employeeId: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsEnum(['ANNUAL', 'SICK', 'UNPAID', 'PERSONAL'])
  leaveType: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
