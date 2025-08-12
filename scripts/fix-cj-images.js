#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const imagesById = {
  "1": [
    { src: "https://i.imgur.com/0xw7w8W.jpg", alt: "Tube Top White Shirt Asymmetric Hip Skirt Suit - Green" },
    { src: "https://i.imgur.com/3q0r8bH.jpg", alt: "Tube Top White Shirt Asymmetric Hip Skirt Suit - Yellow" },
    { src: "https://i.imgur.com/6oQm7Y8.jpg", alt: "Tube Top White Shirt Asymmetric Hip Skirt Suit - Black White" }
  ],
  "2": [
    { src: "https://i.imgur.com/Pp0P7wN.jpg", alt: "Autumn and Winter Retro Stitching Dress - Outdoor" },
    { src: "https://i.imgur.com/1kXo3cR.jpg", alt: "Autumn and Winter Retro Stitching Dress - Studio" }
  ],
  "3": [
    { src: "https://i.imgur.com/0S3g7oI.jpg", alt: "Sexy Backless Split Dress - Red" },
    { src: "https://i.imgur.com/eU6L6sB.jpg", alt: "Sexy Backless Split Dress - Navy" },
    { src: "https://i.imgur.com/3mFQb1q.jpg", alt: "Sexy Backless Split Dress - Light Blue" }
  ]
};

async function run() {
  for (const id of Object.keys(imagesById)) {
    console.log(`Atualizando imagens do produto ${id}...`);
    await prisma.product.update({
      where: { id },
      data: {
        images: imagesById[id]
      }
    });
  }
  console.log('✅ Imagens atualizadas');
  await prisma.$disconnect();
}

run().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
