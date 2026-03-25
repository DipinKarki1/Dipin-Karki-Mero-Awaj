import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { getOverview, getUsers, updateUser, deleteUser } from "../controllers/admin.js";

const router = express.Router();

router.get("/overview", protect, authorize("admin"), getOverview);
router.get("/users", protect, authorize("admin"), getUsers);
router.put("/users/:id", protect, authorize("admin"), updateUser);
router.delete("/users/:id", protect, authorize("admin"), deleteUser);

export default router;
