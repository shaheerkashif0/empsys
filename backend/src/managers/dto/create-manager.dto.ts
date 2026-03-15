import { IsString, IsEmail } from 'class-validator';

export class CreateManagerDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;
}
