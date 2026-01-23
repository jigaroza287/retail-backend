import { prisma } from "../../../config/prisma";

export type AdminProduct = {
  id: string;
  name: string;
  categoryName: string;
  variantCount: number;
  createdAt: Date | null;
};

export type AdminProductVariant = {
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
  variantId: string,
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
  sortBy?: "name" | "createdAt" | "sku";
  sortOrder?: "asc" | "desc";
};

export const fetchProductsAdmin = async (
  filters: ProductFilters,
): Promise<AdminProduct[]> => {
  const { search, categoryId, sortBy, sortOrder } = filters;

  const products = await prisma.products.findMany({
    where: {
      name: search ? { contains: search, mode: "insensitive" } : undefined,
      category_id: categoryId ?? undefined,
    },

    select: {
      id: true,
      name: true,
      created_at: true,
      categories: {
        select: { name: true },
      },
      _count: {
        select: {
          product_variants: true,
        },
      },
    },
    orderBy:
      sortBy && sortOrder
        ? { [sortBy === "createdAt" ? "created_at" : sortBy]: sortOrder }
        : { created_at: "desc" },
  });

  const result: AdminProduct[] = [];

  for (const product of products) {
    result.push({
      id: product.id,
      name: product.name,
      categoryName: product.categories?.name ?? "",
      variantCount: product._count.product_variants,
      createdAt: product.created_at,
    });
  }

  return result;
};

export const fetchProductByIdAdmin = async (
  variantId: string,
): Promise<AdminProductVariant | null> => {
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
  },
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

export async function fetchLatestSellingPrice(
  variantId: string,
): Promise<number | null> {
  const lastSale = await prisma.sale_items.findFirst({
    where: { product_variant_id: variantId },
    orderBy: { sales_orders: { sold_at: "desc" } },
    include: { sales_orders: true },
  });

  if (!lastSale) return null;
  return Number(lastSale.selling_price);
}
