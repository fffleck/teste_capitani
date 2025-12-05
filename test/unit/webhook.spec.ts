import axios from 'axios';
import { PaymentController } from '../../src/http/controllers/payment.controller';
import { PaymentRepositoryImpl } from '../../src/repositories/payment.repository.impl';
import { MercadopagoService } from '../../src/infra/mercadopago/mercadopago.service';
import { PaymentStatus } from '../../src/domain/enums/payment-status.enum';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Webhook handler', () => {
  let controller: PaymentController;
  const repoMock: any = {
    findById: jest.fn(),
    update: jest.fn()
  };
  const mpServiceMock = {} as MercadopagoService;

  beforeEach(() => {
    repoMock.findById.mockReset();
    repoMock.update.mockReset();
    controller = new PaymentController(repoMock as unknown as PaymentRepositoryImpl, mpServiceMock);
  });

  it('should mark payment as PAID when Mercado Pago returns approved', async () => {
    const fakeMpPayment = {
      id: 'mp_123',
      status: 'approved',
      external_reference: 'internal-1'
    };
    mockedAxios.get.mockResolvedValue({ data: fakeMpPayment });

    repoMock.findById.mockResolvedValue({ id: 'internal-1', status: 'PENDING' });

    const req: any = { body: { data: { id: 'mp_123' } } };
    const res = await controller.callback(req, 'changeme');

    expect(mockedAxios.get).toHaveBeenCalled();
    expect(repoMock.findById).toHaveBeenCalledWith('internal-1');
    expect(repoMock.update).toHaveBeenCalledWith('internal-1', { status: PaymentStatus.PAID });
    expect(res).toEqual({ ok: true, status: PaymentStatus.PAID });
  });

  it('should not update when status unchanged', async () => {
    const fakeMpPayment = {
      id: 'mp_456',
      status: 'approved',
      external_reference: 'internal-2'
    };
    mockedAxios.get.mockResolvedValue({ data: fakeMpPayment });

    repoMock.findById.mockResolvedValue({ id: 'internal-2', status: 'PAID' });

    const req: any = { body: { data: { id: 'mp_456' } } };
    const res = await controller.callback(req, 'changeme');

    expect(repoMock.update).not.toHaveBeenCalled();
    expect(res).toEqual({ ok: true, status: PaymentStatus.PAID });
  });

  it('should return error if token invalid', async () => {
    const req: any = { body: { data: { id: 'mp_789' } } };
    const res = await controller.callback(req, 'wrong-token');
    expect(res).toEqual({ ok: false, message: 'invalid token' });
  });

});
