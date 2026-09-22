import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsInt,
  Min,
  Max,
  MinLength,
} from 'class-validator'
import { FeeType } from '@prisma/client'

export class CreateFeeConfigDto {
  @IsString()
  @MinLength(3)
  name: string

  @IsEnum(FeeType)
  type: FeeType

  @IsNumber()
  @Min(0)
  amount: number

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  dueDay?: number

  @IsOptional()
  @IsString()
  description?: string

  @IsString()
  schoolYearId: string
}