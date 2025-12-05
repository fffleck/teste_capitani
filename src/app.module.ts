import { Module } from '@nestjs/common';
import { PrismaService } from './infra/prisma/prisma.service';
import { PaymentController } from './http/controllers/payment.controller';
import { PaymentRepositoryImpl } from './repositories/payment.repository.impl';
import { MercadopagoService } from './infra/mercadopago/mercadopago.service';
import { MockMercadopagoService } from './infra/mercadopago/mock.mercadopago.service';

const useMock = process.env.USE_MOCK_MERCADOPAGO === 'true' || process.env.NODE_ENV === 'development';

@Module({
  imports: [],
  controllers: [PaymentController],
  providers: [
    PrismaService,
    PaymentRepositoryImpl,
    {
      provide: 'MercadopagoService',
      useClass: useMock ? MockMercadopagoService : MercadopagoService,
    },
    MercadopagoService,
    MockMercadopagoService
  ],
})
export class AppModule {}
