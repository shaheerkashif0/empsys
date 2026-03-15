import { IsString, IsEmail, IsInt, Min, IsOptional } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  department: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  annualLeaveEntitlement?: number;
}
