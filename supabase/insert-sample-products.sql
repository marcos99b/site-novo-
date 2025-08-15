-- =====================================================
-- INSERÇÃO DE PRODUTOS DE EXEMPLO - RELIET
-- =====================================================
-- Este script insere produtos baseados no catálogo atual
-- Execute após o supabase-automation-setup.sql
-- =====================================================

-- ===== 1. INSERIR PRODUTOS PRINCIPAIS =====

-- Produto 1: Casaco de Lã Clássico
INSERT INTO public.products (
  name, slug, description, short_description, 
  price, original_price, compare_at_price, 
  stock, status, featured, category
) VALUES (
  'Casaco de Lã Clássico',
  'casaco-la-classico',
  'Casaco elegante em lã natural com design atemporal. Perfeito para o inverno português, oferece conforto e sofisticação em qualquer ocasião.',
  'Casaco elegante em lã natural para o inverno',
  89.90,
  129.90,
  89.90,
  25,
  'publish',
  true,
  'Casacos'
) ON CONFLICT (slug) DO NOTHING;

-- Produto 2: Conjunto Algodão & Linho
INSERT INTO public.products (
  name, slug, description, short_description, 
  price, original_price, compare_at_price, 
  stock, status, featured, category
) VALUES (
  'Conjunto Algodão & Linho',
  'conjunto-algodao-linho',
  'Conjunto sofisticado em algodão e linho natural. Ideal para o dia a dia, oferece conforto e elegância com tecido premium que não marca.',
  'Conjunto sofisticado em algodão e linho natural',
  79.90,
  99.90,
  79.90,
  30,
  'publish',
  true,
  'Conjuntos'
) ON CONFLICT (slug) DO NOTHING;

-- Produto 3: Colete Tricot Decote V
INSERT INTO public.products (
  name, slug, description, short_description, 
  price, original_price, compare_at_price, 
  stock, status, featured, category
) VALUES (
  'Colete Tricot Decote V',
  'colete-tricot-decote-v',
  'Colete elegante em tricot com decote em V. Perfeito para layering, oferece versatilidade do dia ao jantar com caimento que valoriza a silhueta.',
  'Colete elegante em tricot com decote em V',
  69.90,
  89.90,
  69.90,
  35,
  'publish',
  true,
  'Coletes'
) ON CONFLICT (slug) DO NOTHING;

-- Produto 4: Colete com Fivela
INSERT INTO public.products (
  name, slug, description, short_description, 
  price, original_price, compare_at_price, 
  stock, status, featured, category
) VALUES (
  'Colete com Fivela',
  'colete-com-fivela',
  'Colete sofisticado com fivela metálica. Design moderno e elegante, perfeito para criar looks sofisticados e atemporais.',
  'Colete sofisticado com fivela metálica',
  74.90,
  94.90,
  74.90,
  28,
  'publish',
  true,
  'Coletes'
) ON CONFLICT (slug) DO NOTHING;

-- Produto 5: Blazer Tricot Premium
INSERT INTO public.products (
  name, slug, description, short_description, 
  price, original_price, compare_at_price, 
  stock, status, featured, category
) VALUES (
  'Blazer Tricot Premium',
  'blazer-tricot-premium',
  'Blazer premium em tricot de alta qualidade. Caimento impecável que realça a elegância natural da silhueta feminina.',
  'Blazer premium em tricot de alta qualidade',
  94.90,
  119.90,
  94.90,
  22,
  'publish',
  true,
  'Blazers'
) ON CONFLICT (slug) DO NOTHING;

-- Produto 6: Colete Tricot Decote V (Segunda versão)
INSERT INTO public.products (
  name, slug, description, short_description, 
  price, original_price, compare_at_price, 
  stock, status, featured, category
) VALUES (
  'Colete Tricot Decote V Premium',
  'colete-tricot-decote-v-premium',
  'Versão premium do colete tricot com decote em V. Tecido nobre de alta qualidade que proporciona conforto excepcional sem marcar.',
  'Versão premium do colete tricot com decote em V',
  84.90,
  104.90,
  84.90,
  18,
  'publish',
  true,
  'Coletes'
) ON CONFLICT (slug) DO NOTHING;

-- ===== 2. INSERIR IMAGENS DOS PRODUTOS =====

-- Imagens para Casaco de Lã Clássico
INSERT INTO public.product_images (product_id, src, alt, position, is_primary) VALUES
  ((SELECT id FROM public.products WHERE slug = 'casaco-la-classico'), '/produtos/produto-1/1.jpg', 'Casaco de Lã Clássico - Vista Frontal', 0, true),
  ((SELECT id FROM public.products WHERE slug = 'casaco-la-classico'), '/produtos/produto-1/2.jpg', 'Casaco de Lã Clássico - Vista Lateral', 1, false),
  ((SELECT id FROM public.products WHERE slug = 'casaco-la-classico'), '/produtos/produto-1/3.jpg', 'Casaco de Lã Clássico - Detalhe', 2, false)
ON CONFLICT DO NOTHING;

-- Imagens para Conjunto Algodão & Linho
INSERT INTO public.product_images (product_id, src, alt, position, is_primary) VALUES
  ((SELECT id FROM public.products WHERE slug = 'conjunto-algodao-linho'), '/produtos/produto-2/1.jpg', 'Conjunto Algodão & Linho - Vista Frontal', 0, true),
  ((SELECT id FROM public.products WHERE slug = 'conjunto-algodao-linho'), '/produtos/produto-2/2.jpg', 'Conjunto Algodão & Linho - Vista Lateral', 1, false),
  ((SELECT id FROM public.products WHERE slug = 'conjunto-algodao-linho'), '/produtos/produto-2/3.jpg', 'Conjunto Algodão & Linho - Detalhe', 2, false)
ON CONFLICT DO NOTHING;

-- Imagens para Colete Tricot Decote V
INSERT INTO public.product_images (product_id, src, alt, position, is_primary) VALUES
  ((SELECT id FROM public.products WHERE slug = 'colete-tricot-decote-v'), '/produtos/produto-3/1.jpg', 'Colete Tricot Decote V - Vista Frontal', 0, true),
  ((SELECT id FROM public.products WHERE slug = 'colete-tricot-decote-v'), '/produtos/produto-3/2.jpg', 'Colete Tricot Decote V - Vista Lateral', 1, false),
  ((SELECT id FROM public.products WHERE slug = 'colete-tricot-decote-v'), '/produtos/produto-3/3.jpg', 'Colete Tricot Decote V - Detalhe', 2, false)
ON CONFLICT DO NOTHING;

-- Imagens para Colete com Fivela
INSERT INTO public.product_images (product_id, src, alt, position, is_primary) VALUES
  ((SELECT id FROM public.products WHERE slug = 'colete-com-fivela'), '/produtos/produto-4/1.jpg', 'Colete com Fivela - Vista Frontal', 0, true),
  ((SELECT id FROM public.products WHERE slug = 'colete-com-fivela'), '/produtos/produto-4/2.jpg', 'Colete com Fivela - Vista Lateral', 1, false),
  ((SELECT id FROM public.products WHERE slug = 'colete-com-fivela'), '/produtos/produto-4/3.jpg', 'Colete com Fivela - Detalhe', 2, false)
ON CONFLICT DO NOTHING;

-- Imagens para Blazer Tricot Premium
INSERT INTO public.product_images (product_id, src, alt, position, is_primary) VALUES
  ((SELECT id FROM public.products WHERE slug = 'blazer-tricot-premium'), '/produtos/produto-5/1.jpg', 'Blazer Tricot Premium - Vista Frontal', 0, true),
  ((SELECT id FROM public.products WHERE slug = 'blazer-tricot-premium'), '/produtos/produto-5/2.jpg', 'Blazer Tricot Premium - Vista Lateral', 1, false),
  ((SELECT id FROM public.products WHERE slug = 'blazer-tricot-premium'), '/produtos/produto-5/3.jpg', 'Blazer Tricot Premium - Detalhe', 2, false)
ON CONFLICT DO NOTHING;

-- Imagens para Colete Tricot Decote V Premium
INSERT INTO public.product_images (product_id, src, alt, position, is_primary) VALUES
  ((SELECT id FROM public.products WHERE slug = 'colete-tricot-decote-v-premium'), '/produtos/produto-6/1.jpg', 'Colete Tricot Decote V Premium - Vista Frontal', 0, true),
  ((SELECT id FROM public.products WHERE slug = 'colete-tricot-decote-v-premium'), '/produtos/produto-6/2.jpg', 'Colete Tricot Decote V Premium - Vista Lateral', 1, false),
  ((SELECT id FROM public.products WHERE slug = 'colete-tricot-decote-v-premium'), '/produtos/produto-6/3.jpg', 'Colete Tricot Decote V Premium - Detalhe', 2, false)
ON CONFLICT DO NOTHING;

-- ===== 3. INSERIR VARIANTES DE PRODUTOS =====

-- Variantes para Casaco de Lã Clássico
INSERT INTO public.product_variants (product_id, name, sku, price, stock, attributes) VALUES
  ((SELECT id FROM public.products WHERE slug = 'casaco-la-classico'), 'Preto - M', 'CL-P-M', 89.90, 8, '{"color": "preto", "size": "M"}'),
  ((SELECT id FROM public.products WHERE slug = 'casaco-la-classico'), 'Preto - L', 'CL-P-L', 89.90, 9, '{"color": "preto", "size": "L"}'),
  ((SELECT id FROM public.products WHERE slug = 'casaco-la-classico'), 'Bege - M', 'CL-B-M', 89.90, 4, '{"color": "bege", "size": "M"}'),
  ((SELECT id FROM public.products WHERE slug = 'casaco-la-classico'), 'Bege - L', 'CL-B-L', 89.90, 4, '{"color": "bege", "size": "L"}')
ON CONFLICT DO NOTHING;

-- Variantes para Conjunto Algodão & Linho
INSERT INTO public.product_variants (product_id, name, sku, price, stock, attributes) VALUES
  ((SELECT id FROM public.products WHERE slug = 'conjunto-algodao-linho'), 'Branco - S', 'CAL-B-S', 79.90, 10, '{"color": "branco", "size": "S"}'),
  ((SELECT id FROM public.products WHERE slug = 'conjunto-algodao-linho'), 'Branco - M', 'CAL-B-M', 79.90, 12, '{"color": "branco", "size": "M"}'),
  ((SELECT id FROM public.products WHERE slug = 'conjunto-algodao-linho'), 'Branco - L', 'CAL-B-L', 79.90, 8, '{"color": "branco", "size": "L"}')
ON CONFLICT DO NOTHING;

-- Variantes para Colete Tricot Decote V
INSERT INTO public.product_variants (product_id, name, sku, price, stock, attributes) VALUES
  ((SELECT id FROM public.products WHERE slug = 'colete-tricot-decote-v'), 'Cinza - M', 'CTD-C-M', 69.90, 12, '{"color": "cinza", "size": "M"}'),
  ((SELECT id FROM public.products WHERE slug = 'colete-tricot-decote-v'), 'Cinza - L', 'CTD-C-L', 69.90, 10, '{"color": "cinza", "size": "L"}'),
  ((SELECT id FROM public.products WHERE slug = 'colete-tricot-decote-v'), 'Preto - M', 'CTD-P-M', 69.90, 8, '{"color": "preto", "size": "M"}'),
  ((SELECT id FROM public.products WHERE slug = 'colete-tricot-decote-v'), 'Preto - L', 'CTD-P-L', 69.90, 5, '{"color": "preto", "size": "L"}')
ON CONFLICT DO NOTHING;

-- Variantes para Colete com Fivela
INSERT INTO public.product_variants (product_id, name, sku, price, stock, attributes) VALUES
  ((SELECT id FROM public.products WHERE slug = 'colete-com-fivela'), 'Preto - M', 'CF-P-M', 74.90, 9, '{"color": "preto", "size": "M"}'),
  ((SELECT id FROM public.products WHERE slug = 'colete-com-fivela'), 'Preto - L', 'CF-P-L', 74.90, 8, '{"color": "preto", "size": "L"}'),
  ((SELECT id FROM public.products WHERE slug = 'colete-com-fivela'), 'Bege - M', 'CF-B-M', 74.90, 6, '{"color": "bege", "size": "M"}'),
  ((SELECT id FROM public.products WHERE slug = 'colete-com-fivela'), 'Bege - L', 'CF-B-L', 74.90, 5, '{"color": "bege", "size": "L"}')
ON CONFLICT DO NOTHING;

-- Variantes para Blazer Tricot Premium
INSERT INTO public.product_variants (product_id, name, sku, price, stock, attributes) VALUES
  ((SELECT id FROM public.products WHERE slug = 'blazer-tricot-premium'), 'Preto - S', 'BTP-P-S', 94.90, 6, '{"color": "preto", "size": "S"}'),
  ((SELECT id FROM public.products WHERE slug = 'blazer-tricot-premium'), 'Preto - M', 'BTP-P-M', 94.90, 8, '{"color": "preto", "size": "M"}'),
  ((SELECT id FROM public.products WHERE slug = 'blazer-tricot-premium'), 'Preto - L', 'BTP-P-L', 94.90, 5, '{"color": "preto", "size": "L"}'),
  ((SELECT id FROM public.products WHERE slug = 'blazer-tricot-premium'), 'Bege - M', 'BTP-B-M', 94.90, 3, '{"color": "bege", "size": "M"}')
ON CONFLICT DO NOTHING;

-- Variantes para Colete Tricot Decote V Premium
INSERT INTO public.product_variants (product_id, name, sku, price, stock, attributes) VALUES
  ((SELECT id FROM public.products WHERE slug = 'colete-tricot-decote-v-premium'), 'Preto - M', 'CTDP-P-M', 84.90, 6, '{"color": "preto", "size": "M"}'),
  ((SELECT id FROM public.products WHERE slug = 'colete-tricot-decote-v-premium'), 'Preto - L', 'CTDP-P-L', 84.90, 5, '{"color": "preto", "size": "L"}'),
  ((SELECT id FROM public.products WHERE slug = 'colete-tricot-decote-v-premium'), 'Cinza - M', 'CTDP-C-M', 84.90, 4, '{"color": "cinza", "size": "M"}'),
  ((SELECT id FROM public.products WHERE slug = 'colete-tricot-decote-v-premium'), 'Cinza - L', 'CTDP-C-L', 84.90, 3, '{"color": "cinza", "size": "L"}')
ON CONFLICT DO NOTHING;

-- ===== 4. VERIFICAR INSERÇÃO =====

-- Verificar produtos inseridos
SELECT 
  p.name,
  p.slug,
  p.price,
  p.stock,
  p.category,
  COUNT(pi.id) as image_count,
  COUNT(pv.id) as variant_count
FROM public.products p
LEFT JOIN public.product_images pi ON p.id = pi.product_id
LEFT JOIN public.product_variants pv ON p.id = pv.product_id
GROUP BY p.id, p.name, p.slug, p.price, p.stock, p.category
ORDER BY p.created_at;

-- Verificar variantes por produto
SELECT 
  p.name as product_name,
  pv.name as variant_name,
  pv.sku,
  pv.price,
  pv.stock,
  pv.attributes
FROM public.products p
JOIN public.product_variants pv ON p.id = pv.product_id
ORDER BY p.name, pv.name;

-- =====================================================
-- PRODUTOS INSERIDOS COM SUCESSO!
-- =====================================================
-- Agora você pode:
-- 1. Gerenciar produtos via Supabase Dashboard
-- 2. Atualizar estoque automaticamente
-- 3. Receber pedidos via Stripe
-- 4. Gerenciar pedidos manualmente
-- =====================================================
