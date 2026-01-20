import { prisma } from "../../../config/prisma";

export type AdminProduct = {
  productId: string;
  variantId: string;
  name: string;
  categoryId: string | null;
  sku: string;
  size: string | null;
  color: string | null;
  sellingPrice: number;
  availableStock: number;
  createdAt: Date | null;
};

export const computeAvailableStock = async (
  variantId: string
): Promise<number> => {
  const result = await prisma.$queryRaw<{ available: number }[]>`
    SELECT
      COALESCE(SUM(pi.quantity), 0) -
      COALESCE(SUM(si.quantity), 0) AS available
    FROM retail.product_variants pv
    LEFT JOIN retail.purchase_items pi ON pv.id = pi.product_variant_id
    LEFT JOIN retail.sale_items si ON pv.id = si.product_variant_id
    WHERE pv.id = CAST(${variantId} AS uuid)
    GROUP BY pv.id;
  `;

  return result.length > 0 ? Number(result[0].available) : 0;
};

export type ProductFilters = {
  search?: string;
  categoryId?: string;
  minStock?: number;
  maxStock?: number;
  sortBy?: "name" | "createdAt" | "sku";
  sortOrder?: "asc" | "desc";
};

export const listAdminProducts = async (
  filters: ProductFilters
): Promise<AdminProduct[]> => {
  const { search, categoryId, minStock, maxStock, sortBy, sortOrder } = filters;

  const variants = await prisma.product_variants.findMany({
    include: {
      products: true,
      sale_items: true,
    },
    where: {
      products: {
        name: search ? { contains: search, mode: "insensitive" } : undefined,
        category_id: categoryId ?? undefined,
      },
    },
    orderBy:
      sortBy && sortOrder
        ? { [sortBy === "createdAt" ? "created_at" : sortBy]: sortOrder }
        : { created_at: "desc" },
  });

  const result: AdminProduct[] = [];

  for (const v of variants) {
    const stock = await computeAvailableStock(v.id);

    if (minStock !== undefined && stock < minStock) continue;
    if (maxStock !== undefined && stock > maxStock) continue;

    const sellingPrice = (await getLatestSellingPrice(v.id)) ?? 0;

    result.push({
      productId: v.product_id,
      variantId: v.id,
      name: v.products.name,
      categoryId: v.products.category_id,
      sku: v.sku,
      size: v.size,
      color: v.color,
      sellingPrice,
      availableStock: stock,
      createdAt: v.created_at,
    });
  }

  return result;
};

export const getAdminProductById = async (
  variantId: string
): Promise<AdminProduct | null> => {
  const v = await prisma.product_variants.findUnique({
    where: { id: variantId },
    include: {
      products: true,
    },
  });

  if (!v) return null;

  const stock = await computeAvailableStock(v.id);

  return {
    productId: v.product_id,
    variantId: v.id,
    name: v.products.name,
    categoryId: v.products.category_id,
    sku: v.sku,
    size: v.size,
    color: v.color,
    sellingPrice: 0, // placeholder, variants table doesn’t store price
    availableStock: stock,
    createdAt: v.created_at,
  };
};

export const createAdminProduct = async (payload: {
  name: string;
  categoryId?: string;
  size?: string;
  color?: string;
  sku: string;
  sellingPrice: number;
}) => {
  return prisma.$transaction(async (tx) => {
    const product = await tx.products.create({
      data: {
        name: payload.name,
        category_id: payload.categoryId ?? null,
      },
    });

    const variant = await tx.product_variants.create({
      data: {
        product_id: product.id,
        size: payload.size ?? null,
        color: payload.color ?? null,
        sku: payload.sku,
      },
    });

    // selling price stored only when recording sale — admin needs to store as metadata
    // Option: create separate table or keep in product_variants
    // We'll temporarily store price in product_variants.selling_price (if added)
    await tx.sale_items.create({
      data: {
        sales_order_id: "00000000-0000-0000-0000-000000000000", // placeholder
        product_variant_id: variant.id,
        quantity: 0,
        selling_price: payload.sellingPrice,
      },
    });

    return { product, variant };
  });
};

export const updateAdminProduct = async (
  variantId: string,
  payload: {
    name: string;
    categoryId?: string;
    size?: string;
    color?: string;
    sku: string;
  }
) => {
  const variant = await prisma.product_variants.update({
    where: { id: variantId },
    data: {
      sku: payload.sku,
      size: payload.size ?? null,
      color: payload.color ?? null,
    },
  });

  const product = await prisma.products.update({
    where: { id: variant.product_id },
    data: {
      name: payload.name,
      category_id: payload.categoryId ?? null,
    },
  });

  return { product, variant };
};

export const deleteAdminProduct = async (variantId: string) => {
  return prisma.product_variants.delete({
    where: { id: variantId },
  });
};

export async function getLatestSellingPrice(
  variantId: string
): Promise<number | null> {
  const lastSale = await prisma.sale_items.findFirst({
    where: { product_variant_id: variantId },
    orderBy: { sales_orders: { sold_at: "desc" } },
    include: { sales_orders: true },
  });

  if (!lastSale) return null;
  return Number(lastSale.selling_price);
}
