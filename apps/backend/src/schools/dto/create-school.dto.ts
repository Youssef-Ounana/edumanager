import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
  MinLength,
} from 'class-validator'
import { SchoolLevel } from '@prisma/client'

export class CreateSchoolDto {
  @IsString()
  @MinLength(3)
  name: string

  @IsString()
  @MinLength(3)
  slug: string

  @IsEmail()
  email: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsString()
  address?: string

  @IsOptional()
  @IsString()
  city?: string

  @IsOptional()
  @IsString()
  country?: string

  @IsOptional()
  @IsEnum(SchoolLevel)
  level?: SchoolLevel

  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(10000)
  maxStudents?: number
}