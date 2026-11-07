import { prisma } from './src/lib/db/prisma.js';

// Check products count
const count = await prisma.product.count();
console.log('Product count:', count);

// Check if any products exist
const products = await prisma.product.findMany({
  select: { id: true, name: true, slug: true }
});
console.log('Products:', products);

// Check the database name
const dbName = await prisma.$queryRaw`SELECT current_database() as name`;
console.log('Database name:', dbName[0]?.name);

await prisma.$disconnect();