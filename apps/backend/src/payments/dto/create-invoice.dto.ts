import {
  IsString,
  IsUUID,
  IsDateString,
  IsOptional,
} from 'class-validator'

export class CreateInvoiceDto {
  @IsUUID()
  studentId: string

  @IsUUID()
  feeConfigId: string

  @IsDateString()
  dueDate: string

  @IsOptional()
  @IsString()
  notes?: string
}