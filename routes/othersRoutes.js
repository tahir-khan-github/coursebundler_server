import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { contact, courseRequest, getDashboardStats } from "../controllers/othersController.js";

const router = express.Router();

router.route("/contact").post(contact);
router.route("/courserequest").post(courseRequest);
router.route("/admin/stats").get(isAuthenticated,getDashboardStats);


export default router;