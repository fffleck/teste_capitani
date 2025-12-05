import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class MercadopagoService {
  private readonly logger = new Logger(MercadopagoService.name);
  private readonly baseUrl = process.env.MERCADOPAGO_BASE_URL || 'https://api.mercadopago.com';
  private readonly token = process.env.MERCADOPAGO_ACCESS_TOKEN;

  async createPreference({ amount, description, cpf, paymentId }: { amount: number; description?: string; cpf: string; paymentId: string }) {
    const body = {
      items: [
        {
          id: paymentId,
          title: description ?? 'Pagamento',
          quantity: 1,
          currency_id: 'BRL',
          unit_price: Number(amount)
        }
      ],
      metadata: {
        paymentId
      },
      external_reference: String(paymentId),
      back_urls: {
        success: process.env.BACK_URL || 'http://localhost:3000',
        failure: process.env.BACK_URL || 'http://localhost:3000',
        pending: process.env.BACK_URL || 'http://localhost:3000'
      },
      notification_url: process.env.WEBHOOK_URL || `${process.env.WEBHOOK_BASE || 'http://localhost:3000'}/api/payment/callback`
    };

    const url = `${this.baseUrl}/checkout/preferences`;
    const res = await axios.post(url, body, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
    this.logger.debug('MercadoPago preference created: ' + res.data.id);
    return res.data;
  }

  async getPayment(paymentId: string) {
    const url = `${this.baseUrl}/v1/payments/${paymentId}`;
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
    return res.data;
  }
}
