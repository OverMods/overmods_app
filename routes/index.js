import { Router } from "express";
import devRouter from "./dev.js";

const router = new Router();
router.use("/dev", devRouter);

export default router;