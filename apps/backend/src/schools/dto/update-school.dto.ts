import { IsString, IsEmail, IsOptional, IsEnum, IsInt, Min, Max, MinLength } from 'class-validator'
import { SchoolLevel, SchoolStatus } from '@prisma/client'

export class UpdateSchoolDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string

  @IsOptional()
  @IsEmail()
  email?: string

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
  @IsEnum(SchoolStatus)
  status?: SchoolStatus

  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(10000)
  maxStudents?: number
}