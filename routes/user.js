import { Router } from "express";
import { User } from "../models/user.js";
import { error, errors } from "../error.js";
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

router.get("/:id", async (req, res) => {
    const user = new User(req.params.id);
    if (!await user.read()) {
        return error(res, errors.USER_NOT_FOUND);
    }
    res.json(await user.toJson());
});

router.patch("/", async (req, res) => {
    if (!req.session?.userId) {
        return error(res, errors.UNAUTHORIZED);
    }

    const user = new User(req.session.userId);
    if (!await user.read()) {
        return error(res, errors.USER_NOT_FOUND);
    }

    user.username = req.body.username || null;
    user.email = req.body.email || null;
    user.siteRating = req.body.siteRating || null;

    await user.update();
    res.end();
});

export default router;