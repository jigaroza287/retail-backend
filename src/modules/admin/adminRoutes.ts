import { Router } from "express";

import adminAuthRoutes from "./auth/adminAuth.routes";
import adminCategoriesRoutes from "./categories/adminCategories.routes";
import adminProductsRoutes from "./products/adminProducts.routes";
import adminOrdersRoutes from "./orders/adminOrders.routes";
import adminUsersRoutes from "./users/adminUsers.routes";
// import adminDashboardRoutes from "./dashboard/adminDashboard.routes";

const router = Router();

// Mount all admin modules
router.use("/auth", adminAuthRoutes);
router.use("/categories", adminCategoriesRoutes);
router.use("/products", adminProductsRoutes);
router.use("/orders", adminOrdersRoutes);
router.use("/users", adminUsersRoutes);
// router.use("/dashboard", adminDashboardRoutes);

export default router;
