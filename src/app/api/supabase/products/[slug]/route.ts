import { NextRequest, NextResponse } from "next/server";

// Dados estáticos ULTRA MEGA RÁPIDOS para produtos individuais (100% offline)
const ULTRA_FAST_PRODUCT_DETAILS = {
  "produto-1": {
    id: "produto-1",
    name: "Casaco de Lã Clássico",
    slug: "produto-1",
    description: "Um casaco elegante e atemporal, perfeito para o inverno. Feito com lã de alta qualidade, oferece conforto e sofisticação. Ideal para compor looks casuais ou mais formais.",
    price: 89.9,
    compare_at_price: 120.0,
    currency: "EUR",
    stock: 15,
    sku: "CL001",
    category: "Casacos",
    tags: ["lã", "clássico", "inverno", "elegante"],
    images: [
      {
        src: "/produtos/produto-1/1.jpg",
        alt: "Casaco de Lã Clássico - Vista Frontal"
      },
      {
        src: "/produtos/produto-1/2.jpg",
        alt: "Casaco de Lã Clássico - Vista Traseira"
      },
      {
        src: "/produtos/produto-1/3.jpg",
        alt: "Casaco de Lã Clássico - Detalhe dos Bolsos"
      },
      {
        src: "/produtos/produto-1/4.jpg",
        alt: "Casaco de Lã Clássico - Vista Lateral"
      }
    ],
    features: [
      "Tecido de lã premium",
      "Bolsos funcionais",
      "Manga longa",
      "Design slim fit",
      "Fechamento com botões"
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Preto", "Cinza", "Bege"],
    care: [
      "Lavar a seco",
      "Não usar secadora",
      "Passar em temperatura baixa",
      "Guardar em cabide"
    ]
  },
  "produto-2": {
    id: "produto-2",
    name: "Conjunto Algodão & Linho",
    slug: "produto-2",
    description: "Conjunto sofisticado em algodão e linho natural. Perfeito para o dia a dia, oferece conforto e elegância. Ideal para ocasiões casuais e semi-formais.",
    price: 79.9,
    compare_at_price: 100.0,
    currency: "EUR",
    stock: 12,
    sku: "CAL002",
    category: "Conjuntos",
    tags: ["algodão", "linho", "conjunto", "casual"],
    images: [
      {
        src: "/produtos/produto-2/1.jpg",
        alt: "Conjunto Algodão & Linho - Vista Frontal"
      },
      {
        src: "/produtos/produto-2/2.jpg",
        alt: "Conjunto Algodão & Linho - Vista Traseira"
      },
      {
        src: "/produtos/produto-2/3.jpg",
        alt: "Conjunto Algodão & Linho - Detalhe do Tecido"
      },
      {
        src: "/produtos/produto-2/4.jpg",
        alt: "Conjunto Algodão & Linho - Vista Lateral"
      }
    ],
    features: [
      "Tecido natural premium",
      "Caimento perfeito",
      "Design atemporal",
      "Conforto máximo",
      "Versatilidade total"
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Branco", "Azul", "Verde"],
    care: [
      "Lavar a 30°C",
      "Não usar alvejante",
      "Passar em temperatura média",
      "Guardar dobrado"
    ]
  },
  "produto-5": {
    id: "produto-5",
    name: "Colete Tricot Decote V",
    slug: "produto-5",
    description: "Colete elegante em tricot com decote V. Perfeito para combinar com blusas e camisas. Design versátil que se adapta a diferentes estilos.",
    price: 44.9,
    compare_at_price: 60.0,
    currency: "EUR",
    stock: 20,
    sku: "CTV005",
    category: "Coletes",
    tags: ["tricot", "decote v", "elegante", "versátil"],
    images: [
      {
        src: "/produtos/produto-5/1.jpg",
        alt: "Colete Tricot Decote V - Vista Frontal"
      },
      {
        src: "/produtos/produto-5/2.jpg",
        alt: "Colete Tricot Decote V - Vista Traseira"
      },
      {
        src: "/produtos/produto-5/3.jpg",
        alt: "Colete Tricot Decote V - Detalhe do Decote"
      },
      {
        src: "/produtos/produto-5/4.jpg",
        alt: "Colete Tricot Decote V - Vista Lateral"
      }
    ],
    features: [
      "Tecido tricot premium",
      "Decote V elegante",
      "Caimento perfeito",
      "Versatilidade total",
      "Conforto máximo"
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Preto", "Cinza", "Bege", "Azul"],
    care: [
      "Lavar a mão",
      "Não usar secadora",
      "Passar em temperatura baixa",
      "Guardar dobrado"
    ]
  },
  "produto-6": {
    id: "produto-6",
    name: "Colete com Fivela",
    slug: "produto-6",
    description: "Colete sofisticado com fivela metálica. Design moderno e elegante, perfeito para compor looks casuais e semi-formais.",
    price: 45.9,
    compare_at_price: 65.0,
    currency: "EUR",
    stock: 18,
    sku: "CF006",
    category: "Coletes",
    tags: ["fivela", "metálico", "moderno", "elegante"],
    images: [
      {
        src: "/produtos/produto-6/1.jpg",
        alt: "Colete com Fivela - Vista Frontal"
      },
      {
        src: "/produtos/produto-6/2.jpg",
        alt: "Colete com Fivela - Vista Traseira"
      },
      {
        src: "/produtos/produto-6/3.jpg",
        alt: "Colete com Fivela - Detalhe da Fivela"
      },
      {
        src: "/produtos/produto-6/4.jpg",
        alt: "Colete com Fivela - Vista Lateral"
      }
    ],
    features: [
      "Fivela metálica premium",
      "Design moderno",
      "Caimento perfeito",
      "Versatilidade total",
      "Conforto máximo"
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Preto", "Marrom", "Bege"],
    care: [
      "Lavar a seco",
      "Não usar secadora",
      "Passar em temperatura baixa",
      "Guardar em cabide"
    ]
  },
  "produto-7": {
    id: "produto-7",
    name: "Pantufas de Couro Premium",
    slug: "produto-7",
    description: "Pantufas sofisticadas em couro PU premium com interior acolchoado em algodão. Design elegante e confortável, perfeitas para o conforto doméstico com estilo. Ideal para manter a elegância mesmo em momentos de relaxamento.",
    price: 129.9,
    compare_at_price: 180.0,
    currency: "EUR",
    stock: 8,
    sku: "PCP007",
    category: "Calçados",
    tags: ["pantufas", "couro", "premium", "conforto", "elegante"],
    images: [
      {
        src: "/produtos/produto-7/1.jpg",
        alt: "Pantufas de Couro Premium - Vista Frontal"
      },
      {
        src: "/produtos/produto-7/2.jpg",
        alt: "Pantufas de Couro Premium - Vista Lateral"
      },
      {
        src: "/produtos/produto-7/3.jpg",
        alt: "Pantufas de Couro Premium - Vista Traseira"
      },
      {
        src: "/produtos/produto-7/4.jpg",
        alt: "Pantufas de Couro Premium - Detalhe do Solado"
      },
      {
        src: "/produtos/produto-7/5.jpg",
        alt: "Pantufas de Couro Premium - Vista Superior"
      },
      {
        src: "/produtos/produto-7/6.jpg",
        alt: "Pantufas de Couro Premium - Detalhe do Acabamento"
      }
    ],
    features: [
      "Couro PU premium de alta qualidade",
      "Interior acolchoado em algodão",
      "Design elegante e atemporal",
      "Conforto máximo para uso doméstico",
      "Solado antiderrapante"
    ],
    sizes: ["35", "36", "37", "38", "39", "40", "41"],
    colors: ["Preto", "Marrom", "Bege"],
    care: [
      "Limpar com pano úmido",
      "Não expor ao sol direto",
      "Guardar em local seco",
      "Usar protetor de couro"
    ]
  },
  "produto-8": {
    id: "produto-8",
    name: "Bolsa Tote Designer de Inverno",
    slug: "produto-8",
    description: "Bolsa tote de designer com costuras em losangos e acabamento premium. Perfeita para o inverno, oferece alta capacidade para commuting e uso diário. Design sofisticado que combina funcionalidade com elegância atemporal.",
    price: 199.9,
    compare_at_price: 280.0,
    currency: "EUR",
    stock: 12,
    sku: "BTD008",
    category: "Acessórios",
    tags: ["tote", "designer", "inverno", "luxury", "commuting", "alta-capacidade"],
    images: [
      {
        src: "/produtos/produto-8/1.jpg",
        alt: "Bolsa Tote Designer de Inverno - Vista Frontal"
      },
      {
        src: "/produtos/produto-8/2.jpg",
        alt: "Bolsa Tote Designer de Inverno - Vista Lateral"
      },
      {
        src: "/produtos/produto-8/3.jpg",
        alt: "Bolsa Tote Designer de Inverno - Vista Traseira"
      },
      {
        src: "/produtos/produto-8/4.jpg",
        alt: "Bolsa Tote Designer de Inverno - Detalhe do Interior"
      },
      {
        src: "/produtos/produto-8/5.jpg",
        alt: "Bolsa Tote Designer de Inverno - Detalhe do Fechamento"
      }
    ],
    features: [
      "Design tote com costuras em losangos",
      "Alta capacidade para commuting",
      "Material premium para inverno",
      "Interior organizado e funcional",
      "Alças confortáveis para ombro"
    ],
    sizes: ["Único"],
    colors: ["Preto", "Marrom", "Bege"],
    care: [
      "Limpar com pano seco",
      "Não expor à umidade",
      "Guardar em local seco",
      "Usar protetor específico"
    ]
  }
};

// Função ULTRA MEGA RÁPIDA - sem async para ser instantânea
export function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const productSlug = params.slug;
    
    // ULTRA MEGA RÁPIDO - Buscar produto estático instantaneamente
    const product = ULTRA_FAST_PRODUCT_DETAILS[productSlug as keyof typeof ULTRA_FAST_PRODUCT_DETAILS];
    
    if (!product) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }
    
    // Headers para performance ULTRA MEGA máxima
    return NextResponse.json({ product }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable', // 1 ano + immutable
        'X-Performance': 'ULTRA_MEGA_FAST_PRODUCT_DETAIL',
        'X-Cache': 'INSTANT_OFFLINE',
        'X-Images': 'EMBEDDED_BASE64',
        'X-Optimization': 'MAXIMUM_SPEED'
      }
    });
    
  } catch (error) {
    // Fallback ainda mais rápido - sem try/catch overhead
    return NextResponse.json(
      { error: 'Produto não encontrado' },
      { status: 404 }
    );
  }
}
