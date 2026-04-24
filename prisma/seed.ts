import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

// Public image fallback (works everywhere)
const IMG = (name: string) =>
  `https://via.placeholder.com/600x400.png?text=${encodeURIComponent(name)}`;

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await db.review.deleteMany();
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.cartItem.deleteMany();
  await db.cart.deleteMany();
  await db.product.deleteMany();

  const products = await db.product.createMany({
    data: [
      {
        name: 'ProMech X1 Mechanical Keyboard',
        slug: 'promech-x1-mechanical-keyboard',
        description: 'Premium mechanical keyboard with hot-swappable switches and RGB lighting.',
        longDescription: 'High-end mechanical keyboard for professionals.',
        price: 149.99,
        comparePrice: 189.99,
        image: IMG('Keyboard'),
        images: JSON.stringify([IMG('Keyboard')]),
        category: 'Keyboards',
        tags: JSON.stringify(['mechanical', 'rgb', 'hot-swap']),
        rating: 4.7,
        reviewCount: 234,
        stock: 45,
        featured: true,
        version: 'v1',
      },
      {
        name: 'SoundShield Pro Headphones',
        slug: 'soundshield-pro-headphones',
        description: 'Noise cancelling wireless headphones.',
        longDescription: 'Premium ANC headphones with long battery life.',
        price: 299.99,
        comparePrice: 349.99,
        image: IMG('Headphones'),
        images: JSON.stringify([IMG('Headphones')]),
        category: 'Audio',
        tags: JSON.stringify(['wireless', 'anc']),
        rating: 4.8,
        reviewCount: 567,
        stock: 30,
        featured: true,
        version: 'v1',
      },
      {
        name: 'ErgoGlide Vertical Mouse',
        slug: 'ergoglide-vertical-mouse',
        description: 'Ergonomic vertical mouse.',
        longDescription: 'Designed to reduce wrist strain.',
        price: 59.99,
        comparePrice: 79.99,
        image: IMG('Mouse'),
        images: JSON.stringify([IMG('Mouse')]),
        category: 'Mice',
        tags: JSON.stringify(['ergonomic', 'wireless']),
        rating: 4.5,
        reviewCount: 189,
        stock: 60,
        featured: false,
        version: 'v1',
      },
    ],
  });

  console.log(`✅ Created ${products.count} products`);
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });