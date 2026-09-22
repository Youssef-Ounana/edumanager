import {
  IsString,
  IsEmail,
  IsOptional,
  IsUUID,
  MinLength,
} from 'class-validator'

export class CreateParentDto {
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

  @IsUUID()
  studentId: string

  @IsString()
  relationship: string
}