import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Matches } from 'class-validator';
import { PaymentMethod } from '../../domain/enums/payment-method.enum';

export class CreatePaymentDto {
  @IsNotEmpty()
  @Matches(/^\d{11}$/, { message: 'cpf must be 11 digits' })
  cpf!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  amount!: number;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @IsOptional()
  @IsString()
  cardToken?: string;
}
