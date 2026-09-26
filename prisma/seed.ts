import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({ where: { email: "aarav@stocksense.demo" }, update: {}, create: { name: "Aarav Kumar", email: "aarav@stocksense.demo", role: "MANAGER" } });
  const categories = await Promise.all(["Safety Equipment", "Office Furniture", "Electronics", "Packaging", "Raw Materials"].map((name) => prisma.category.upsert({ where: { name }, update: {}, create: { name } })));
  const main = await prisma.warehouse.upsert({ where: { code: "MAIN" }, update: {}, create: { name: "Main Warehouse", code: "MAIN" } });
  const secondary = await prisma.warehouse.upsert({ where: { code: "SECONDARY" }, update: {}, create: { name: "Secondary Warehouse", code: "SECONDARY" } });
  const locations = await Promise.all([
    prisma.location.upsert({ where: { code: "MAIN-STOCK" }, update: {}, create: { name: "Main Stock", code: "MAIN-STOCK", warehouseId: main.id } }),
    prisma.location.upsert({ where: { code: "PROD-RACK" }, update: {}, create: { name: "Production Rack", code: "PROD-RACK", warehouseId: main.id } }),
    prisma.location.upsert({ where: { code: "DISPATCH" }, update: {}, create: { name: "Dispatch Area", code: "DISPATCH", warehouseId: main.id } }),
    prisma.location.upsert({ where: { code: "SECONDARY-STOCK" }, update: {}, create: { name: "Secondary Stock", code: "SECONDARY-STOCK", warehouseId: secondary.id } }),
  ]);
  const products = [
    { sku: "RM-STEEL-001", name: "Steel Rod", unitOfMeasure: "kg", reorderLevel: 100, categoryId: categories[4].id, quantity: 850 },
    { sku: "FUR-CHAIR-001", name: "Office Chair", unitOfMeasure: "units", reorderLevel: 20, categoryId: categories[1].id, quantity: 42 },
    { sku: "ELEC-LAP-001", name: "Laptop", unitOfMeasure: "units", reorderLevel: 10, categoryId: categories[2].id, quantity: 8 },
    { sku: "SAFE-HELM-001", name: "Safety Helmet", unitOfMeasure: "units", reorderLevel: 30, categoryId: categories[0].id, quantity: 65 },
    { sku: "PKG-BOX-001", name: "Packing Box", unitOfMeasure: "units", reorderLevel: 100, categoryId: categories[3].id, quantity: 240 },
  ];
  for (const item of products) {
    const { quantity, ...productData } = item;
    const product = await prisma.product.upsert({ where: { sku: item.sku }, update: productData, create: productData });
    await prisma.inventoryBalance.upsert({ where: { productId_locationId: { productId: product.id, locationId: locations[0].id } }, update: { quantity: item.quantity }, create: { productId: product.id, locationId: locations[0].id, quantity: item.quantity } });
  }
  console.log(`Seeded ${products.length} products, ${locations.length} locations, and demo user ${admin.email}.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
