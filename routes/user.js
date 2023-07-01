import { Router } from "express";
import { User } from "../models/user.js";
import { error, errors } from "../error.js";
import { upload } from "../upload.js";
import { Model } from "../models/model.js";
import bcrypt from "bcrypt";
const router = new Router();

router.get("/", async (req, res) => {
    if (!req.session?.userId) {
        return error(res, errors.UNAUTHORIZED);
    }

    const user = new User(req.session.userId);
    if (!await user.read()) {
        return error(res, errors.USER_NOT_FOUND);
    }
    if (user.email) {
        user.email = User.obscureEmail(user.email);
    }
    res.json(await user.toJson());
});

router.get("/:id", async (req, res) => {
    const user = new User(req.params.id);
    if (!await user.read()) {
        return error(res, errors.USER_NOT_FOUND);
    }
    user.email = null;
    user.updatedAt = null;
    user.passwordChanged = null;
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
    if (!user.sanitizeCheck(req.body)) {
        return error(res, errors.INVALID_PARAMETER);
    }

    if (req.body.username) {
        if (!Model.validString(req.body.username)) {
            return error(res, errors.INVALID_PARAMETER);
        }
    }
    if (req.body.password) {
        if (await bcrypt.compare(req.body.password, user.password)) {
            return error(res, errors.NOT_MODIFIED);
        }
        user.password = await bcrypt.hash(req.body.password, 10);
        user.passwordChanged = new Date();
    }
    if (req.body.email) {
        if (!Model.validString(req.body.email)) {
            return error(res, errors.INVALID_PARAMETER);
        }
        if (req.body.email === user.email) {
            return error(res, errors.NOT_MODIFIED);
        }
    }
    if (req.body.siteRating)
    {
        if (typeof req.body.siteRating !== "number") {
            return error(res, errors.INVALID_PARAMETER);
        }
    }

    user.username = req.body.username || null;
    user.email = req.body.email || null;
    user.siteRating = req.body.siteRating || null;

    await user.update();
    await user.read();
    if (user.email) {
        user.email = User.obscureEmail(user.email);
    }
    res.json(await user.toJson());
});

router.put("/avatar", upload.single("avatar"), async (req, res) => {
    if (!req.session?.userId) {
        return error(res, errors.UNAUTHORIZED);
    }

    if (!req.file) {
        return error(res, errors.INVALID_PARAMETER);
    }

    const user = new User(req.session.userId);
    if (!await user.read()) {
        return error(res, errors.USER_NOT_FOUND);
    }

    user.avatar = req.file.filename;
    await user.update();
    res.json(await user.toJson());
});

export default router;