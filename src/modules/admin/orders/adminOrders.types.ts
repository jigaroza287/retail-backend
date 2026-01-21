export type AdminOrder = {
  id: string;
  customerName: string | null;
  customerPhone: string | null;
  totalAmount: number;
  status: string;
  soldAt: Date;
  items: {
    variantId: string;
    sku: string;
    quantity: number;
    sellingPrice: number;
    productName: string;
  }[];
};
