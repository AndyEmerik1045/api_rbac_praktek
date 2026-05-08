import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { checkPermission } from "../middlewares/rbac.middleware";

const router = Router();

router.get("/test", authMiddleware, (req, res) => {
  res.json({ message: "Auth success", user: (req as any).user });
});

router.get(
  "/admin",
  authMiddleware,
  checkPermission("admin:read"),
  (req, res) => {
    res.json({ message: "Welcome Admin" });
  }
);

export default router;
