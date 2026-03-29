import { Router } from "express";
import {
  analyticsController,
  banUserController,
  deleteBlogAdminController,
  featureBlogController,
  resolveReportController,
  unbanUserController,
} from "../controllers/admin.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.use(requireAuth, requireRole("admin"));
router.get("/analytics", analyticsController);
router.post("/users/:userId/ban", banUserController);
router.post("/users/:userId/unban", unbanUserController);
router.post("/blogs/:blogId/feature", featureBlogController);
router.delete("/blogs/:blogId", deleteBlogAdminController);
router.post("/reports/:reportId/resolve", resolveReportController);

export default router;
