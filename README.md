# Payment API (PIX + CREDIT_CARD - Mercado Pago)

Repositório de teste técnico.

## Requisitos
- Node 18+
- Docker & Docker Compose
- Prisma / PostgreSQL

## Setup local (com Docker)
1. Copie `.env.example` para `.env` e preencha `MERCADOPAGO_ACCESS_TOKEN` e `WEBHOOK_TOKEN`.
2. `docker-compose up --build`
3. Em outro terminal (ou dentro do container api):
   - `npx prisma generate`
   - `npx prisma migrate dev --name init`
4. A API ficará disponível em http://localhost:3000

## Endpoints
- POST /api/payment
- PUT /api/payment/:id
- GET /api/payment/:id
- GET /api/payment
- POST /api/payment/callback (webhook)

## Observações
- Para CREDIT_CARD a API cria uma preferência no Mercado Pago e retorna `init_point`.
- Webhook deve ser configurado no Mercado Pago apontando para `/api/payment/callback`.
- Em produção, valide sempre o webhook chamando a API do Mercado Pago para confirmar o status do pagamento antes de marcar PAID/FAIL.

Documento de requisitos original: arquivo enviado pelo candidato.


## Mock Mercado Pago (ambiente de desenvolvimento)

Para ativar o mock local do Mercado Pago (útil para desenvolvimento e testes):

1. Defina a variável de ambiente `USE_MOCK_MERCADOPAGO=true` ou execute em `NODE_ENV=development`.
2. O Mock implementa `createPreference` e `getPayment` com respostas simuladas.

Exemplo (Linux/Mac):

```
USE_MOCK_MERCADOPAGO=true docker-compose up --build
```



Ps - Essa Aplicacao foi desenvolvida e testada em ambiente APPLE, caso não funcione em ambiente linux sera preciso revisar o arquivo 
../prisma/schema.prisma, e a sua utilizacao correta 

Qualquer duvida pode entrar em contato com o email ffleck@gmail.com ou pelo whats (48) 9 8463 0779 

Att.
Fabio Fleck 


