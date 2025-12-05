
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from '../src/http/controllers/payment.controller';
import { PaymentRepositoryImpl } from '../src/repositories/payment.repository.impl';
import { INestApplication } from '@nestjs/common';
import { PaymentMethod } from '../src/domain/enums/payment-method.enum';
import { PaymentStatus } from '../src/domain/enums/payment-status.enum';

describe('PaymentController (unit)', () => {
  let controller: PaymentController;
  const repoMock = {
    create: jest.fn(),
    update: jest.fn(),
    findById: jest.fn(),
    list: jest.fn(),
    findByExternalId: jest.fn()
  };
  const mpServiceMock = {
    createPreference: jest.fn(),
    getPayment: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        { provide: PaymentRepositoryImpl, useValue: repoMock },
        { provide: 'MercadopagoService', useValue: mpServiceMock }
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
    jest.clearAllMocks();
  });

  it('should create PIX payment', async () => {
    repoMock.create.mockResolvedValue({ id: '1', paymentMethod: 'PIX' });
    const dto = { cpf: '12345678901', amount: 10.5, paymentMethod: PaymentMethod.PIX };
    const res = await controller.create(dto as any);
    expect(repoMock.create).toHaveBeenCalled();
    expect(res).toHaveProperty('id', '1');
  });

  it('should create CREDIT_CARD payment and return preference', async () => {
    repoMock.create.mockResolvedValue({ id: '2', paymentMethod: 'CREDIT_CARD' });
    mpServiceMock.createPreference.mockResolvedValue({ id: 'pref_1', init_point: 'https://init' });
    repoMock.update.mockResolvedValue({});
    const dto = { cpf: '12345678901', amount: 50, paymentMethod: PaymentMethod.CREDIT_CARD };
    const res = await controller.create(dto as any);
    expect(repoMock.create).toHaveBeenCalled();
    expect(mpServiceMock.createPreference).toHaveBeenCalled();
    expect(res).toHaveProperty('mercadopago');
  });

  it('should update payment status', async () => {
    repoMock.update.mockResolvedValue({ id: '1', status: PaymentStatus.PAID });
    const res = await controller.update('1', { status: PaymentStatus.PAID } as any);
    expect(repoMock.update).toHaveBeenCalledWith('1', { status: PaymentStatus.PAID });
    expect(res).toHaveProperty('status', PaymentStatus.PAID);
  });

  it('should return payment by id', async () => {
    repoMock.findById.mockResolvedValue({ id: '1' });
    const res = await controller.getById('1');
    expect(repoMock.findById).toHaveBeenCalledWith('1');
    expect(res).toEqual({ id: '1' });
  });

  it('should list payments', async () => {
    repoMock.list.mockResolvedValue([{ id: '1' }]);
    const res = await controller.list('12345678901', undefined);
    expect(repoMock.list).toHaveBeenCalled();
    expect(res).toEqual([{ id: '1' }]);
  });

  it('should process webhook and mark as PAID', async () => {
    mpServiceMock.getPayment.mockResolvedValue({ id: 'mp_1', status: 'approved', external_reference: '1' });
    repoMock.findById.mockResolvedValue({ id: '1', status: 'PENDING' });
    repoMock.update.mockResolvedValue({ id: '1', status: 'PAID' });

    const req: any = { body: { data: { id: 'mp_1' } } };
    const res = await controller.callback(req, process.env.WEBHOOK_TOKEN || undefined);
    expect(mpServiceMock.getPayment).toHaveBeenCalledWith('mp_1');
    expect(repoMock.update).toHaveBeenCalledWith('1', { status: PaymentStatus.PAID });
    expect(res).toEqual({ ok: true, status: PaymentStatus.PAID });
  });

});
