import { Router } from "express";
import { User } from "../models/user.js";
import {error, errors } from "../error.js";
const router = new Router();

router.get("/", async (req, res) => {
    if (!req.session?.userId) {
        return error(res, errors.UNAUTHORIZED);
    }

    const user = new User(req.session.userId);
    if (!await user.read()) {
        return error(res, errors.USER_NOT_FOUND);
    }
    res.json(await user.toJson());
});

export default router;