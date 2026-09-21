import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  MinLength,
} from 'class-validator'

export class CreateClassroomDto {
  @IsString()
  @MinLength(2)
  name: string

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  capacity?: number

  @IsString()
  schoolYearId: string
}