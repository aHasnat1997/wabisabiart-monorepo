import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../prisma/generated/prisma/client.js';
import { CategoryType } from '../../prisma/generated/prisma/enums.js';
import { Logger } from '@nestjs/common';

type CategorySeed = {
  name: string;
  type: CategoryType;
  description: string;
};

const CATEGORY_SEEDS: CategorySeed[] = [
  {
    name: 'Handmade Jewelry',
    type: CategoryType.crafts,
    description: 'Handcrafted jewelry and wearable pieces.',
  },
  {
    name: 'Home Decor',
    type: CategoryType.crafts,
    description: 'Decor items for living spaces.',
  },
  {
    name: 'Pottery & Ceramics',
    type: CategoryType.crafts,
    description: 'Ceramic and clay-based handmade items.',
  },
  {
    name: 'Candles & Fragrance',
    type: CategoryType.vintage,
    description: 'Hand-poured candles and aromatic crafts.',
  },
  {
    name: 'Textile & Embroidery',
    type: CategoryType.crafts,
    description: 'Thread, fabric, and embroidery works.',
  },
  {
    name: 'Leather Goods',
    type: CategoryType.crafts,
    description: 'Handmade leather accessories and utility products.',
  },
  {
    name: 'Woodcraft',
    type: CategoryType.vintage,
    description: 'Wood-based handmade products and decor.',
  },
  {
    name: 'Paper & Stationery',
    type: CategoryType.crafts,
    description: 'Artisan paper goods and stationery.',
  },
  {
    name: 'Kids & Baby Handmade',
    type: CategoryType.crafts,
    description: 'Safe handmade products for kids and babies.',
  },
  {
    name: 'Eco-Friendly Goods',
    type: CategoryType.crafts,
    description: 'Sustainable and reusable handmade products.',
  },
  {
    name: 'Kitchen & Dining Crafts',
    type: CategoryType.crafts,
    description: 'Crafted products for kitchen and dining use.',
  },
  {
    name: 'Personalized Gifts',
    type: CategoryType.customization,
    description: 'Custom gift items for special occasions.',
  },
  {
    name: 'Wedding & Event Crafts',
    type: CategoryType.customization,
    description: 'Crafted products for weddings and events.',
  },
  {
    name: 'Seasonal & Festive Crafts',
    type: CategoryType.crafts,
    description: 'Festival, holiday, and seasonal products.',
  },
  {
    name: 'Art Prints & Wall Art',
    type: CategoryType.commissions,
    description: 'Artwork, prints, and custom wall pieces.',
  },
  {
    name: 'Bath & Body Handmade',
    type: CategoryType.crafts,
    description: 'Natural bath and body handmade products.',
  },
  {
    name: 'Pet Accessories Handmade',
    type: CategoryType.crafts,
    description: 'Handmade pet utility and accessory products.',
  },
  {
    name: 'Fashion Accessories Handmade',
    type: CategoryType.customization,
    description: 'Custom and artisan fashion accessories.',
  },
  {
    name: 'Spiritual & Wellness Crafts',
    type: CategoryType.crafts,
    description: 'Mindfulness, wellness, and spiritual products.',
  },
  {
    name: 'Everyday Utility Crafts',
    type: CategoryType.crafts,
    description: 'Daily-use crafted and practical products.',
  },
];

const SUBCATEGORY_SUFFIXES = [
  'Daily Essentials',
  'Gift Sets',
  'Premium Collection',
  'Eco Collection',
  'Minimalist Line',
  'Boho Line',
  'Rustic Line',
  'Modern Line',
  'Vintage Line',
  'Kids Friendly',
  'Travel Friendly',
  'Office Use',
  'Home Use',
  'Wedding Edition',
  'Festive Edition',
  'Custom Name',
  'Custom Color',
  'Custom Size',
  'Limited Batch',
  'Made to Order',
  'Hand-Painted Series',
  'Hand-Stitched Series',
  'Natural Material',
  'Upcycled Series',
  'Beginner Pack',
  'Advanced Pack',
  'Bundle Set',
  'Artisan Signature',
  'Seasonal Picks',
  'Best Sellers',
  'Budget Picks',
  'Luxury Picks',
  'Studio Edition',
  'Workshop Edition',
  'Collector Edition',
];

function getSubCategoryCount(index: number): number {
  return 20 + (index % 11); // 20..30
}

function buildSubCategoryNames(
  categoryName: string,
  categoryIndex: number,
): string[] {
  const count = getSubCategoryCount(categoryIndex);
  const start = (categoryIndex * 3) % SUBCATEGORY_SUFFIXES.length;
  const names: string[] = [];

  for (let i = 0; i < count; i++) {
    const suffix =
      SUBCATEGORY_SUFFIXES[(start + i) % SUBCATEGORY_SUFFIXES.length];
    names.push(`${categoryName} - ${suffix}`);
  }

  return names;
}

export async function seedCategories() {
  const connectionString = `${process.env.DATABASE_URL}`;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    let totalSubCategories = 0;

    for (let i = 0; i < CATEGORY_SEEDS.length; i++) {
      const categorySeed = CATEGORY_SEEDS[i];

      const category = await prisma.category.upsert({
        where: { name: categorySeed.name },
        update: {
          description: categorySeed.description,
          type: categorySeed.type,
          isActive: true,
        },
        create: {
          name: categorySeed.name,
          description: categorySeed.description,
          type: categorySeed.type,
          isActive: true,
        },
      });

      const subCategoryNames = buildSubCategoryNames(categorySeed.name, i);
      totalSubCategories += subCategoryNames.length;

      await prisma.subCategory.createMany({
        data: subCategoryNames.map((name) => ({
          categoryId: category.id,
          name,
          description: `${name} under ${categorySeed.name}`,
          isActive: true,
        })),
        skipDuplicates: true,
      });
    }

    Logger.log(
      `✅ Seeded ${CATEGORY_SEEDS.length} categories and up to ${totalSubCategories} sub-categories`,
      'Seed Categories',
    );
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}
