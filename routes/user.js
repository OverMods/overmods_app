import { Router } from "express";
import { User } from "../models/user.js";
import { Game } from "../models/game.js";
import { Mod, ModComment } from "../models/mod.js";
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

router.get("/comment", async (req, res) => {
    if (!req.session?.userId) {
        return error(res, errors.UNAUTHORIZED);
    }

    const data = await knex.select(
        "mod_comments.id as comment_id", "mod", "mod_comments.user",
        "commented_at","comment",
        "mod.id as mod_id",
        "mod.game", "mod.title", "mod.logo","mod.author","mod.author_title",
        "mod.uploaded_at", "mod.description","mod.game_version","mod.instruction",
        "mod.downloaded","mod.file","mod.file_size",
        "game.id as game_id", "game.title as game_title", "game.short_name as game_short_name",
        "game.logo as game_logo")
        .from("mod_comments")
        .join("mod", "mod_comments.mod","=","mod.id")
        .join("game","game.id","=","mod.game")
        .where("mod_comments.user","=",req.session.userId)
        .andWhereNot("mod_comments.deleted","=","1");

    const comments = [];
    for (const obj of data) {
        let _comment = obj;
        _comment.id = obj.comment_id;
        const comment = new ModComment();
        await comment.fromDataBase(_comment);

        let _mod = obj;
        _mod.id = obj.mod_id;
        _mod.file = null;
        const mod = new Mod();
        await mod.fromDataBase(_mod);

        const game = new Game();
        await game.fromDataBase({
            id: obj.game,
            title: obj.game_title,
            short_name: obj.game_short_title,
            logo: obj.game_logo
        });

        comments.push({
            comment: await comment.toJson(),
            mod: await mod.toJson(),
            game: await game.toJson()
        });
    }
    res.json(comments);
});

router.get("/mod", async (req, res) => {
    if (!req.session?.userId) {
        return error(res, errors.UNAUTHORIZED);
    }

    const data = await knex.select(
        "mod.id as mod_id",
        "mod.game", "mod.title", "mod.logo","mod.author","mod.author_title",
        "mod.uploaded_at", "mod.description","mod.game_version","mod.instruction",
        "mod.downloaded","mod.file","mod.file_size",
        "game.id as game_id", "game.title as game_title", "game.short_name as game_short_name",
        "game.logo as game_logo")
        .from("mod")
        .join("game","mod.game","=","game.id")
        .where("mod.author","=",req.session.userId)
        .andWhereNot("mod.deleted","=","1");

    const mods = [];
    for (const _mod of data) {
        const mod = new Mod();
        await mod.fromDataBase(_mod);

        const game = new Game();
        await game.fromDataBase({
            id: _mod.game,
            title: _mod.game_title,
            short_name: _mod.game_short_title,
            logo: _mod.game_logo
        });

        mods.push({
            mod: await mod.toJson(),
            game: await game.toJson()
        });
    }
    res.json(mods);
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

    let changed = false;
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
        changed = true;
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
        changed = true;
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
        changed = true;
    }
    if (req.body.siteRating)
    {
        const rating = req.body.siteRating;
        if (typeof rating !== "number") {
            return error(res, errors.INVALID_PARAMETER);
        }
        user.siteRating = Math.min(Math.max(rating, 1), 5);
        changed = true;
    }

    if (changed) {
        await user.update();
    }

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

export default router;