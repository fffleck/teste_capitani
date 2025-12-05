import { PaymentRepositoryImpl } from '../../src/repositories/payment.repository.impl';
import { PrismaService } from '../../src/infra/prisma/prisma.service';
import { PaymentMethod } from '../../src/domain/enums/payment-method.enum';
import { PaymentStatus } from '../../src/domain/enums/payment-status.enum';

describe('PaymentRepositoryImpl (integration-ish)', () => {
  let prisma: PrismaService;
  let repo: PaymentRepositoryImpl;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    repo = new PaymentRepositoryImpl(prisma);
  });

  afterAll(async () => {
    await prisma.payment.deleteMany({});
    await prisma.$disconnect();
  });

  it('should create a PIX payment', async () => {
    const p = await repo.create({
      cpf: '12345678901',
      description: 'Teste PIX',
      amount: 10.5,
      paymentMethod: PaymentMethod.PIX,
      status: PaymentStatus.PENDING
    });
    expect(p).toHaveProperty('id');
    expect(p.paymentMethod).toBe('PIX');
  });
});
