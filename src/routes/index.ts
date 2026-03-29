import { Router } from "express";
import adminRoutes from "./admin.routes";
import authRoutes from "./auth.routes";
import blogRoutes from "./blog.routes";
import commentRoutes from "./comment.routes";
import notificationRoutes from "./notification.routes";
import socialRoutes from "./social.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/blogs", blogRoutes);
router.use("/comments", commentRoutes);
router.use("/social", socialRoutes);
router.use("/notifications", notificationRoutes);
router.use("/admin", adminRoutes);

export default router;
