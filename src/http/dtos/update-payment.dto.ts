import { IsEnum, IsOptional } from 'class-validator';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';

export class UpdatePaymentDto {
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;
}
