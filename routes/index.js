import { Router } from "express";
import devRouter from "./dev.js";
import loginRouter from "./login.js";
import signupRouter from "./signup.js";
import gameRouter from "./game.js";
import userRouter from "./user.js";
import modRouter from "./mod.js";
import trendsRouter from "./trends.js";
import requestRouter from "./request.js"

const router = new Router();
router.use("/dev", devRouter);
router.use("/login", loginRouter);
router.use("/signup", signupRouter);
router.use("/game", gameRouter);
router.use("/user", userRouter);
router.use("/mod", modRouter);
router.use("/trends", trendsRouter);
router.use("/request", requestRouter);

export default router;