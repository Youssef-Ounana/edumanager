import {
  IsUUID,
  IsNumber,
  IsEnum,
  IsOptional,
  IsString,
  Min,
} from 'class-validator'
import { PaymentMethod } from '@prisma/client'

export class CreatePaymentDto {
  @IsUUID()
  invoiceId: string

  @IsNumber()
  @Min(1)
  amount: number

  @IsEnum(PaymentMethod)
  method: PaymentMethod

  @IsOptional()
  @IsString()
  reference?: string
}