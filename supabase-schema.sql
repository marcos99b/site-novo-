-- Beyond Chargers Brasil - Schema do Supabase
-- Execute este SQL no SQL Editor do Supabase Dashboard

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de Produtos
CREATE TABLE IF NOT EXISTS "Product" (
    "id" TEXT NOT NULL,
    "cjProductId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "images" JSONB NOT NULL,
    "priceMin" DOUBLE PRECISION NOT NULL,
    "priceMax" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- Tabela de Variantes
CREATE TABLE IF NOT EXISTS "Variant" (
    "id" TEXT NOT NULL,
    "cjVariantId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Variant_pkey" PRIMARY KEY ("id")
);

-- Tabela de Clientes (CRM)
CREATE TABLE IF NOT EXISTS "Customer" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "address" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- Tabela de Pedidos
CREATE TABLE IF NOT EXISTS "Order" (
    "id" TEXT NOT NULL,
    "cjOrderId" TEXT,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'created',
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "customerId" TEXT,
    "shippingTrack" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- Tabela de Itens do Pedido
CREATE TABLE IF NOT EXISTS "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- Tabela de Leads (CRM)
CREATE TABLE IF NOT EXISTS "Lead" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "source" TEXT NOT NULL DEFAULT 'website',
    "status" TEXT NOT NULL DEFAULT 'new',
    "notes" TEXT,
    "customerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- Tabela de Contatos (CRM)
CREATE TABLE IF NOT EXISTS "Contact" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- Índices únicos
CREATE UNIQUE INDEX IF NOT EXISTS "Product_cjProductId_key" ON "Product"("cjProductId");
CREATE UNIQUE INDEX IF NOT EXISTS "Variant_cjVariantId_key" ON "Variant"("cjVariantId");
CREATE UNIQUE INDEX IF NOT EXISTS "Customer_email_key" ON "Customer"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Order_cjOrderId_key" ON "Order"("cjOrderId");

-- Índices para performance
CREATE INDEX IF NOT EXISTS "Variant_productId_idx" ON "Variant"("productId");
CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX IF NOT EXISTS "OrderItem_variantId_idx" ON "OrderItem"("variantId");
CREATE INDEX IF NOT EXISTS "Order_customerId_idx" ON "Order"("customerId");
CREATE INDEX IF NOT EXISTS "Lead_customerId_idx" ON "Lead"("customerId");
CREATE INDEX IF NOT EXISTS "Contact_customerId_idx" ON "Contact"("customerId");

-- Foreign Keys
ALTER TABLE "Variant" ADD CONSTRAINT "Variant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Função para atualizar updatedAt automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updatedAt
CREATE TRIGGER update_Product_updated_at BEFORE UPDATE ON "Product" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_Variant_updated_at BEFORE UPDATE ON "Variant" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_Customer_updated_at BEFORE UPDATE ON "Customer" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_Order_updated_at BEFORE UPDATE ON "Order" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_Lead_updated_at BEFORE UPDATE ON "Lead" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_Contact_updated_at BEFORE UPDATE ON "Contact" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS (Row Level Security) - Desabilitadas por padrão
ALTER TABLE "Product" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Variant" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Customer" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Lead" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Contact" DISABLE ROW LEVEL SECURITY;

-- Comentários das tabelas
COMMENT ON TABLE "Product" IS 'Produtos do catálogo CJ Dropshipping';
COMMENT ON TABLE "Variant" IS 'Variantes dos produtos (cores, tamanhos, etc)';
COMMENT ON TABLE "Customer" IS 'Clientes do CRM';
COMMENT ON TABLE "Order" IS 'Pedidos dos clientes';
COMMENT ON TABLE "OrderItem" IS 'Itens dos pedidos';
COMMENT ON TABLE "Lead" IS 'Leads/prospects do CRM';
COMMENT ON TABLE "Contact" IS 'Histórico de contatos com clientes';
