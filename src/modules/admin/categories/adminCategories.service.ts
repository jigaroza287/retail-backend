import { prisma } from "../../../config/prisma";

export type CategoryNode = {
  id: string;
  name: string;
  parent_id: string | null;
  children: CategoryNode[];
};

export const getAllCategoriesAdmin = async (): Promise<CategoryNode[]> => {
  const rows = await prisma.categories.findMany({
    orderBy: { name: "asc" },
  });

  // Build a mapping for tree construction
  const map = new Map<string, CategoryNode>();

  rows.forEach((row) => {
    map.set(row.id, {
      id: row.id,
      name: row.name,
      parent_id: row.parent_id ?? null,
      children: [],
    });
  });

  const roots: CategoryNode[] = [];

  rows.forEach((row) => {
    const node = map.get(row.id)!;

    if (row.parent_id) {
      const parentNode = map.get(row.parent_id);
      if (parentNode) {
        parentNode.children.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  return roots;
};

export const createCategoryAdmin = async (name: string, parentId?: string) => {
  return prisma.categories.create({
    data: {
      name,
      parent_id: parentId ?? null,
    },
  });
};

export const updateCategoryAdmin = async (
  id: string,
  name: string,
  parentId?: string
) => {
  return prisma.categories.update({
    where: { id },
    data: {
      name,
      parent_id: parentId ?? null,
    },
  });
};

export const deleteCategoryAdmin = async (id: string) => {
  // Hard delete, because your schema has no deleted_at column
  return prisma.categories.delete({
    where: { id },
  });
};
