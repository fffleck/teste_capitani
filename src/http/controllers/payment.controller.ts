import { Body, Controller, Get, Param, Post, Put, Query, Req, Headers, HttpCode, HttpStatus, Inject } from '@nestjs/common';
import { CreatePaymentDto } from '../dtos/create-payment.dto';
import { UpdatePaymentDto } from '../dtos/update-payment.dto';
import { PaymentRepositoryImpl } from '../../repositories/payment.repository.impl';
import { PaymentMethod } from '../../domain/enums/payment-method.enum';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';

@Controller('api/payment')
export class PaymentController {
  constructor(
    private repo: PaymentRepositoryImpl,
    @Inject('MercadopagoService') private mpService: any
  ) {}

  @Post()
  async create(@Body() dto: CreatePaymentDto) {
    if (dto.paymentMethod === PaymentMethod.PIX) {
      const created = await this.repo.create({
        cpf: dto.cpf,
        description: dto.description,
        amount: dto.amount,
        paymentMethod: PaymentMethod.PIX,
        status: PaymentStatus.PENDING
      });
      return created;
    }

    if (dto.paymentMethod === PaymentMethod.CREDIT_CARD) {
      const created = await this.repo.create({
        cpf: dto.cpf,
        description: dto.description,
        amount: dto.amount,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        status: PaymentStatus.PENDING
      });

      const preference = await this.mpService.createPreference({
        amount: dto.amount,
        description: dto.description,
        cpf: dto.cpf,
        paymentId: created.id
      });

      await this.repo.update(created.id, { externalId: preference.id || preference.external_reference });

      return {
        payment: created,
        mercadopago: {
          id: preference.id,
          init_point: preference.init_point,
          sandbox_init_point: preference.sandbox_init_point ?? null
        }
      };
    }

    return { error: 'invalid payment method' };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePaymentDto) {
    const updated = await this.repo.update(id, { status: dto.status });
    return updated;
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const payment = await this.repo.findById(id);
    return payment;
  }

  @Get()
  async list(@Query('cpf') cpf: string, @Query('paymentMethod') paymentMethod?: PaymentMethod) {
    const payments = await this.repo.list({ cpf, paymentMethod });
    return payments;
  }

  @Post('callback')
  @HttpCode(HttpStatus.OK)
  async callback(@Req() req: any, @Headers('x-webhook-token') token?: string) {
    if (process.env.WEBHOOK_TOKEN && token !== process.env.WEBHOOK_TOKEN) {
      return { ok: false, message: 'invalid token' };
    }

    const body = req.body;

    const eventId = body.data?.id || body.id || body.resource || null;

    if (!eventId) {
      return { ok: false, message: 'no payment/resource id received' };
    }

    try {
      const mpPayment = await this.mpService.getPayment(String(eventId));

      const externalReference = mpPayment.external_reference || mpPayment.metadata?.paymentId || mpPayment.externalReference;

      if (!externalReference) {
        return { ok: false, message: 'no external reference found' };
      }

      const payment = await this.repo.findById(String(externalReference));

      if (!payment) {
        return { ok: false, message: 'payment not registered internally' };
      }

      const mpStatus = mpPayment.status;

      let newStatus = PaymentStatus.PENDING;
      if (mpStatus === 'approved') newStatus = PaymentStatus.PAID;
      else if (mpStatus === 'rejected') newStatus = PaymentStatus.FAIL;
      else newStatus = PaymentStatus.PENDING;

      if (payment.status !== newStatus) {
        await this.repo.update(payment.id, { status: newStatus });
      }

      return { ok: true, status: newStatus };
    } catch (err: any) {
      console.error('Error fetching Mercado Pago payment:', err?.response?.data || err.message);
      return { ok: false, message: 'error verifying payment' };
    }
  }
}
