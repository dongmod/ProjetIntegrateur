import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js"; // o authMiddlewar.js si aún no renombraste
import { roleFiltre } from "../middleware/filtreroleMiddleware.js";
import { createservices } from "../controllers/services.controllers.js";

const router = express.Router();

// POST /api/services
router.post("/", verifyToken, roleFiltre("gestionnaire"), createservices);

export default router;