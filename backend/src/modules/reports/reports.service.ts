import { pool } from "../../config/db";

/**
 * Overall profit report
 */
export const fetchProfitReport = async (from: Date, to: Date) => {
  const query = `
    SELECT
      COALESCE(SUM(si.quantity * si.selling_price), 0) AS revenue,
      COALESCE(SUM(pi.quantity * pi.cost_price), 0) AS cost,
      COALESCE(SUM(si.quantity * si.selling_price), 0) -
      COALESCE(SUM(pi.quantity * pi.cost_price), 0) AS profit
    FROM retail.sale_items si
    JOIN retail.sales_orders so ON so.id = si.sales_order_id
    JOIN retail.purchase_items pi
      ON pi.product_variant_id = si.product_variant_id
    WHERE so.sold_at BETWEEN $1 AND $2;
  `;

  const { rows } = await pool.query(query, [from, to]);

  return {
    revenue: Number(rows[0].revenue),
    cost: Number(rows[0].cost),
    profit: Number(rows[0].profit),
  };
};

/**
 * Product-wise profit report
 */
export const fetchProductProfitReport = async (from: Date, to: Date) => {
  const query = `
    SELECT
      pv.sku,
      p.name AS product_name,
      SUM(si.quantity * si.selling_price) AS revenue,
      SUM(pi.quantity * pi.cost_price) AS cost,
      SUM(si.quantity * si.selling_price) -
      SUM(pi.quantity * pi.cost_price) AS profit
    FROM retail.sale_items si
    JOIN retail.sales_orders so ON so.id = si.sales_order_id
    JOIN retail.product_variants pv ON pv.id = si.product_variant_id
    JOIN retail.products p ON p.id = pv.product_id
    JOIN retail.purchase_items pi
      ON pi.product_variant_id = si.product_variant_id
    WHERE so.sold_at BETWEEN $1 AND $2
    GROUP BY pv.sku, p.name
    ORDER BY profit DESC;
  `;

  const { rows } = await pool.query(query, [from, to]);
  return rows;
};
