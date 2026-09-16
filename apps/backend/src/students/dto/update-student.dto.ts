import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  MinLength,
} from 'class-validator'
import { Gender } from '@prisma/client'

export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  firstName?: string

  @IsOptional()
  @IsString()
  @MinLength(2)
  lastName?: string

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsString()
  address?: string

  @IsOptional()
  @IsString()
  photoUrl?: string
}