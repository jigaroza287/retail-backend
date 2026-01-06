import { pool } from "../../config/db";

export const fetchCategories = async () => {
  const query = `
    SELECT id, name, parent_id
    FROM retail.categories
    ORDER BY name;
  `;

  const { rows } = await pool.query(query);
  return buildTree(rows);
};

/**
 * Build hierarchical category tree
 */
const buildTree = (rows: any[]) => {
  const map = new Map();
  const roots: any[] = [];

  rows.forEach((row) => {
    map.set(row.id, { ...row, children: [] });
  });

  rows.forEach((row) => {
    if (row.parent_id) {
      map.get(row.parent_id)?.children.push(map.get(row.id));
    } else {
      roots.push(map.get(row.id));
    }
  });

  return roots;
};
