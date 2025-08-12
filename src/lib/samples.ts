export type SampleVariant = {
  id: string;
  name: string;
  price: number; // EUR
  image?: string;
  stock: number;
};

export type SampleProduct = {
  id: string;
  name: string;
  description: string;
  images: string[];
  priceMin: number;
  variants: SampleVariant[];
};

export const sampleProducts: SampleProduct[] = [
  {
    id: "sample-quickcharge-pro",
    name: "QuickCharge Pro 3‑em‑1 (MagSafe)",
    description:
      "Carregador magnético dobrável para iPhone, Apple Watch e AirPods. Construção premium e carregamento rápido.",
    images: [
      "https://images.unsplash.com/photo-1609599006353-c97a1f0f2b9a?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1587825140400-7e26100a2a89?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1600&auto=format&fit=crop",
    ],
    priceMin: 69.0,
    variants: [
      { id: "v1", name: "Branco", price: 69.0, stock: 42 },
      { id: "v2", name: "Preto", price: 72.0, stock: 35 },
    ],
  },
  {
    id: "sample-magnetic-pad",
    name: "Base Magnética 15W",
    description: "Carregador magnético compacto com cabo USB‑C e acabamento em silicone.",
    images: [
      "https://images.unsplash.com/photo-1592750475338-74b7b21085c9?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1560841656-1fec1fb6256e?q=80&w=1600&auto=format&fit=crop",
    ],
    priceMin: 24.9,
    variants: [
      { id: "v1", name: "Cinza", price: 24.9, stock: 120 },
      { id: "v2", name: "Azul", price: 26.9, stock: 80 },
    ],
  },
];


