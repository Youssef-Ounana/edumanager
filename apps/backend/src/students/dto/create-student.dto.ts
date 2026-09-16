import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsDateString,
  MinLength,
} from 'class-validator'
import { Gender } from '@prisma/client'

export class CreateStudentDto {
  @IsString()
  @MinLength(2)
  firstName: string

  @IsString()
  @MinLength(2)
  lastName: string

  @IsDateString()
  dateOfBirth: string

  @IsEnum(Gender)
  gender: Gender

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsString()
  address?: string

  @IsString()
  registrationNr: string

  @IsString()
  schoolId: string
}