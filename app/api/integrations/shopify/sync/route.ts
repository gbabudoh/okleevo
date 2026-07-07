import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';
import { fetchProducts } from '@/lib/shopify/client';

export const POST = withMultiTenancy(async (_req, { user }) => {
  try {
    const connection = await prisma.shopifyConnection.findUnique({ where: { businessId: user.businessId } });
    if (!connection) {
      return NextResponse.json({ error: 'Shopify is not connected' }, { status: 400 });
    }

    const products = await fetchProducts(connection.shopDomain, connection.accessToken);

    let created = 0;
    let updated = 0;

    for (const product of products) {
      for (const variant of product.variants) {
        const variantId = String(variant.id);

        const existing = await prisma.inventoryItem.findFirst({
          where: { businessId: user.businessId, shopifyVariantId: variantId },
        });

        if (existing) {
          await prisma.inventoryItem.update({
            where: { id: existing.id },
            data: {
              name: product.title,
              quantity: variant.inventory_quantity ?? 0,
              price: parseFloat(variant.price) || 0,
              barcode: variant.barcode || existing.barcode,
            },
          });
          updated++;
          continue;
        }

        // sku is unique across the whole table (not scoped per business), so a
        // Shopify SKU can collide with another tenant's existing item. Fall
        // back to a disambiguated SKU rather than dropping the item from sync.
        const baseSku = variant.sku || `SHOPIFY-${variantId}`;
        try {
          await prisma.inventoryItem.create({
            data: {
              businessId: user.businessId,
              name: product.title,
              sku: baseSku,
              barcode: variant.barcode || undefined,
              category: product.product_type || undefined,
              quantity: variant.inventory_quantity ?? 0,
              price: parseFloat(variant.price) || 0,
              shopifyProductId: String(product.id),
              shopifyVariantId: variantId,
            },
          });
          created++;
        } catch (err: unknown) {
          const isUniqueConflict = (err as { code?: string })?.code === 'P2002';
          if (!isUniqueConflict) throw err;
          await prisma.inventoryItem.create({
            data: {
              businessId: user.businessId,
              name: product.title,
              sku: `${baseSku}-${variantId}`,
              barcode: variant.barcode || undefined,
              category: product.product_type || undefined,
              quantity: variant.inventory_quantity ?? 0,
              price: parseFloat(variant.price) || 0,
              shopifyProductId: String(product.id),
              shopifyVariantId: variantId,
            },
          });
          created++;
        }
      }
    }

    return NextResponse.json({ created, updated });
  } catch (error) {
    console.error('Shopify sync error:', error);
    return NextResponse.json({ error: 'Failed to sync with Shopify' }, { status: 500 });
  }
});
