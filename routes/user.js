import { Router } from "express";
import { User } from "../models/user.js";
import { error, errors } from "../error.js";
import { upload } from "../upload.js";
import { Model } from "../models/model.js";
import bcrypt from "bcrypt";
import knex from "../db.js";
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
        const oldPassword = req.body.oldPassword;
        const newPassword = req.body.password;
        if (!oldPassword || !newPassword) {
            return error(res, errors.INVALID_PARAMETER);
        }
        if (oldPassword === newPassword) {
            return error(res, errors.NOT_MODIFIED);
        }

        if (!await bcrypt.compare(oldPassword, user.password)) {
            return error(res, errors.INVALID_PASSWORD);
        }
        if (await bcrypt.compare(newPassword, user.password)) {
            return error(res, errors.NOT_MODIFIED);
        }
        user.password = await bcrypt.hash(req.body.password, 10);
        user.passwordChanged = new Date();
    }
    if (req.body.email) {
        const oldEmail = req.body.oldEmail;
        const newEmail = req.body.email;
        if (!oldEmail || !newEmail) {
            return error(res, errors.INVALID_PARAMETER);
        }
        if (oldEmail === newEmail) {
            return error(res, errors.NOT_MODIFIED);
        }
        if (oldEmail !== user.email) {
            return error(res, errors.FAILED);
        }

        if (!Model.validString(req.body.email)) {
            return error(res, errors.INVALID_PARAMETER);
        }
        if (newEmail === user.email) {
            return error(res, errors.NOT_MODIFIED);
        }
        user.email = newEmail;
    }
    if (req.body.username) {
        const newUsername = req.body.username;
        if (!newUsername) {
            return error(res, errors.INVALID_PARAMETER);
        }
        if (newUsername === user.username) {
            return error(res, errors.NOT_MODIFIED);
        }

        const data = await knex("user")
            .select("id")
            .whereNot("id",user.getId())
            .andWhere("username","=",newUsername)
            .limit(1);
        if (data.length > 0) {
            return error(res, errors.USER_ALREADY_EXISTS);
        }

        user.username = newUsername;
    }
    if (req.body.siteRating)
    {
        const rating = req.body.siteRating;
        if (typeof rating !== "number") {
            return error(res, errors.INVALID_PARAMETER);
        }
        user.siteRating = Math.min(Math.max(rating, 1), 5)
    }

    await user.update();
    await user.read();
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