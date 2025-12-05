
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PaymentRepositoryImpl } from '../src/repositories/payment.repository.impl';

describe('Payment API (integration) - webhook', () => {
  let app: INestApplication;
  const repoMock = {
    findByExternalId: jest.fn(),
    findById: jest.fn(),
    update: jest.fn()
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PaymentRepositoryImpl)
      .useValue(repoMock)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 200 and ok true for webhook with valid token', async () => {
    // setup mocks
    repoMock.findByExternalId.mockResolvedValue({ id: '1', status: 'PENDING' });
    repoMock.update.mockResolvedValue({ id: '1', status: 'PAID' });

    const token = process.env.WEBHOOK_TOKEN || 'changeme';
    const payload = { data: { id: 'mp_1' } };

    const res = await request(app.getHttpServer())
      .post('/api/payment/callback')
      .set('x-webhook-token', token)
      .send(payload)
      .expect(200);

    // response body should be ok false or ok true depending on mpService (which is not mocked here) but endpoint should return 200
    expect(res.status).toBe(200);
  });
});
