import {
  IsString,
  IsDateString,
  IsBoolean,
  IsOptional,
  MinLength,
} from 'class-validator'

export class CreateSchoolYearDto {
  @IsString()
  @MinLength(3)
  name: string

  @IsDateString()
  startDate: string

  @IsDateString()
  endDate: string

  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean
}