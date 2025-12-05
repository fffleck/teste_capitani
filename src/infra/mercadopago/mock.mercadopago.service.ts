import { Injectable } from '@nestjs/common';

@Injectable()
export class MockMercadopagoService {
  async createPreference({ amount, description, cpf, paymentId }: { amount: number; description?: string; cpf: string; paymentId: string }) {
    // Return a fake preference payload similar to Mercado Pago sandbox
    return {
      id: `MP_PREF_${paymentId}`,
      init_point: `https://www.mercadopago.com/init_point/${paymentId}`,
      sandbox_init_point: `https://sandbox.mercadopago.com/init_point/${paymentId}`,
      external_reference: String(paymentId),
      items: [{ id: paymentId, title: description ?? 'Pagamento', unit_price: amount }]
    };
  }

  async getPayment(paymentId: string) {
    // If paymentId starts with "approved" simulate approved, "rejected" simulate rejected
    const simulatedStatus = paymentId.includes('approved') ? 'approved' : paymentId.includes('rejected') ? 'rejected' : 'pending';
    return {
      id: paymentId,
      status: simulatedStatus,
      external_reference: paymentId.includes('MP_PREF_') ? paymentId.replace('MP_PREF_', '') : 'internal-mock',
      metadata: { paymentId: paymentId.includes('MP_PREF_') ? paymentId.replace('MP_PREF_', '') : 'internal-mock' }
    };
  }
}
