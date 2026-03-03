import express from "express";
import { verifyToken,getservices } from "../middleware/authMiddleware.js"; // o authMiddlewar.js si aún no renombraste
import { roleFiltre } from "../middleware/filtreroleMiddleware.js";
import { createservices } from "../controllers/services.controllers.js";

const router = express.Router()
console.log("services creer")
// servicesRoutes.js
router.post('/', createservices)
export default router
