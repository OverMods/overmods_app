import { Router } from "express";
import devRouter from "./dev.js";
import loginRouter from "./login.js";
import signupRouter from "./signup.js";
import gameRouter from "./game.js";
import userRouter from "./user.js";
import modRouter from "./mod.js";

const router = new Router();
router.use("/dev", devRouter);
router.use("/login", loginRouter);
router.use("/signup", signupRouter);
router.use("/game", gameRouter);
router.use("/user", userRouter);
router.use("/mod", modRouter);

export default router;