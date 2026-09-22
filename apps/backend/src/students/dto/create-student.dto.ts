import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsEmail,
  MinLength,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { Gender } from '@prisma/client'

export class CreateParentInlineDto {
  @IsString()
  @MinLength(2)
  firstName: string

  @IsString()
  @MinLength(2)
  lastName: string

  @IsEmail()
  email: string

  @IsString()
  @MinLength(6)
  password: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsString()
  occupation?: string

  @IsString()
  relationship: string
}

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

  @ValidateNested()
  @Type(() => CreateParentInlineDto)
  parent: CreateParentInlineDto
}