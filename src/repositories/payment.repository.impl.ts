import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infra/prisma/prisma.service';
import { PaymentMethod } from '../domain/enums/payment-method.enum';
import { PaymentStatus } from '../domain/enums/payment-status.enum';

@Injectable()
export class PaymentRepositoryImpl {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    cpf: string;
    description?: string;
    amount: number;
    paymentMethod: PaymentMethod;
    status?: PaymentStatus;
    externalId?: string;
  }) {
    return this.prisma.payment.create({
      data,
    });
  }

  async update(id: string, partial: Partial<any>) {
    return this.prisma.payment.update({
      where: { id },
      data: partial,
    });
  }

  async findById(id: string) {
    return this.prisma.payment.findUnique({ where: { id } });
  }

  async list(filters: { cpf?: string; paymentMethod?: PaymentMethod }) {
    const where: any = {};
    if (filters.cpf) where.cpf = filters.cpf;
    if (filters.paymentMethod) where.paymentMethod = filters.paymentMethod;
    return this.prisma.payment.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async findByExternalId(externalId: string) {
    return this.prisma.payment.findFirst({ where: { externalId } });
  }
}
