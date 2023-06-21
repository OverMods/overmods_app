import { Router } from "express";
import devRouter from "./dev.js";
import loginRouter from "./login.js";
import gameRouter from "./game.js";

const router = new Router();
router.use("/dev", devRouter);
router.use("/login", loginRouter);
router.use("/game", gameRouter);

export default router;