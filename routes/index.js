import { Router } from "express";
import devRouter from "./dev.js";
import gameRouter from "./game.js";

const router = new Router();
router.use("/dev", devRouter);
router.use("/game", gameRouter);

export default router;