import { Router } from "express";
import { ModScreenshot, ModComment, ModRating, Mod } from "../models/mod.js";
import { User, Role, checkBan } from "../models/user.js";
import { error, errors, APIException } from "../error.js";
import { upload } from "../upload.js";
import knex from "../db.js";
import {Ban} from "../models/ban.js";

const router = new Router();

function checkModder(req, res) {
    if (!req.session?.userRole) {
        error(res, errors.UNAUTHORIZED);
        return false;
    }

    if (!Role.isPrivilegedAs(req.session.userRole, Role.MODDER)) {
        error(res, error.INSUFFICIENT_PRIVILEGES);
        return false;
    }

    return true;
}

async function checkModOwnership(req, res, id) {
    if (!checkModder(req, res)) {
        return null;
    }

    const mod = new Mod(id);
    await mod.read();

    if (mod.author === req.session.userId || Role.isPrivilegedAs(req.session.userRole, Role.ADMIN)) {
        return mod;
    } else {
        error(res, errors.INSUFFICIENT_PRIVILEGES);
        return null;
    }
}

router.get("/:id", async (req, res) => {
    if (!req.params.id) {
        return error(res, errors.INVALID_PARAMETER);
    }

    const mod = new Mod(req.params.id);
    if (!await mod.read()) {
        return error(res, errors.NOT_FOUND);
    }
    mod.file = undefined;
    res.json(await mod.toJson());
})

router.post("/", async (req, res) => {
    if (!checkModder(req, res)) {
        return;
    }

    if (!await checkBan(res, req.session.userId, Ban.MODDING)) {
        return;
    }

    const mod = new Mod();
    if (!await mod.fromJson(req.body)) {
        return error(res, errors.INVALID_PARAMETER);
    }
    mod.author = req.session.userId;
    mod.uploadedAt = new Date();
    mod.downloaded = 0;

    await mod.create();
    res.end();
});

router.delete("/", async (req, res) => {
    if (!req.session?.userId) {
        return error(res, errors.UNAUTHORIZED);
    }

    const ids = req.body.ids;
    if (!ids) {
        return error(res, errors.INVALID_PARAMETER);
    }
    if (!Array.isArray(ids)) {
        return error(res, errors.INVALID_PARAMETER);
    }

    const status = {};
    for (const id of ids) {
        const mod = new Mod(id);
        if (!await mod.read()) {
            status[id] = errors.NOT_FOUND;
            continue;
        }

        if (mod.author !== req.session.userId
            && !Role.isPrivilegedAs(req.session.userRole, Role.ADMIN)) {
            status[id] = errors.INSUFFICIENT_PRIVILEGES;
            continue;
        }

        await mod.delete();
        status[id] = true;
    }
    res.json(status);
});

router.delete("/comment", async (req, res) => {
    if (!req.session?.userId) {
        return error(res, errors.UNAUTHORIZED);
    }

    const ids = req.body.ids;
    if (!ids) {
        return error(res, errors.INVALID_PARAMETER);
    }
    if (!Array.isArray(ids)) {
        return error(res, errors.INVALID_PARAMETER);
    }

    const status = {};
    for (const id of ids) {
        const comment = new ModComment(id);
        if (!await comment.read()) {
            status[id] = errors.NOT_FOUND;
            continue;
        }

        if (comment.user !== req.session.userId
            && !Role.isPrivilegedAs(req.session.userRole, Role.ADMIN)) {
            status[id] = errors.INSUFFICIENT_PRIVILEGES;
        }

        await comment.delete();
        status[id] = true;
    }
    res.json(status);
});

router.put("/:id/logo", upload.single("logo"), async (req, res) => {
    if (!req.params.id || !req.file) {
        return error(res, errors.INVALID_PARAMETER);
    }

    const mod = await checkModOwnership(req, res, req.params.id);
    if (!mod) {
        return;
    }

    mod.logo = req.file.filename;
    await mod.update();
    res.end();
});

router.put("/:id/file", upload.single("file"), async (req, res) => {
    if (!req.params.id || !req.file) {
        return error(res, errors.INVALID_PARAMETER);
    }

    const mod = await checkModOwnership(req, res, req.params.id);
    if (!mod) {
        return;
    }

    mod.file = req.file.filename;
    mod.fileSize = req.file.size;
    await mod.update();
    res.end();
});

router.get("/:id/screenshot", async (req, res) => {
    if (!req.params.id) {
        return error(res, errors.INVALID_PARAMETER);
    }

    const mod = new Mod(req.params.id);
    if (!await mod.read()) {
        return error(res, errors.NOT_FOUND);
    }

    const screenshots = [];
    for (let _screenshot of (await mod.loadScreenshots())) {
        const screenshot = new ModScreenshot();
        await screenshot.fromDataBase(_screenshot);
        screenshots.push(await screenshot.toJson());
    }
    res.json(screenshots);
});

router.post("/:id/screenshot", upload.single("screenshot"), async (req, res) => {
    if (!req.params.id || !req.file || !req.data) {
        return error(res, errors.INVALID_PARAMETER);
    }

    const mod = await checkModOwnership(req, res, req.params.id);
    if (!mod) {
        return;
    }

    let data;
    try {
        data = JSON.parse(req.body.data);
    } catch (e) {
        return error(res, errors.INVALID_PARAMETER);
    }
    if (!data.title) {
        data.title = mod.title;
    }
    if (!data.description) {
        return error(res, errors.INVALID_PARAMETER);
    }

    const screenshot = new ModScreenshot();
    screenshot.mod = mod.getId();
    screenshot.screenshot = req.file.filename;
    screenshot.title = data.title;
    screenshot.description = data.description;
    await screenshot.create();
    res.end();
});

router.get("/:id/comment", async (req, res) => {
    if (!req.params.id) {
        return error(res, errors.INVALID_PARAMETER);
    }

    const mod = new Mod(req.params.id);
    if (!await mod.read()) {
        return error(res, errors.NOT_FOUND);
    }

    const comments = [];
    for (let _comment of (await mod.loadComments())) {
        const comment = new ModComment();
        const user = new User();
        await comment.fromDataBase(_comment);
        await user.fromDataBase(_comment);
        user.setId(_comment.user);
        user.passwordChanged = null;
        comments.push({
            comment: await comment.toJson(),
            user: await user.toJson()
        });
    }
    res.json(comments);
});

router.post("/:id/comment", async (req, res) => {
    if (!req.session?.userId) {
        return error(res, errors.UNAUTHORIZED);
    }

    if (!await checkBan(req, req.session.userId, Ban.COMMENT)) {
        return;
    }

    if (!req.params.id) {
        return error(res, errors.INVALID_PARAMETER);
    }

    const mod = new Mod(req.params.id);
    if (!await mod.read()) {
        return error(res, errors.NOT_FOUND);
    }

    const comment = new ModComment();
    if (!await comment.fromJson(req.body)) {
        return error(res, errors.INVALID_PARAMETER);
    }
    comment.mod = mod.getId();
    comment.user = req.session.userId;
    comment.commentedAt = new Date();
    await comment.create();
    res.end();
});

router.get("/:id/rating", async (req, res) => {
    if (!req.params.id) {
        return error(res, errors.INVALID_PARAMETER);
    }

    const mod = new Mod(req.params.id);
    if (!await mod.read()) {
        return error(res, errors.NOT_FOUND);
    }

    res.json(await mod.loadRatings());
});

router.put("/:id/rating", async (req, res) => {
    if (!req.session?.userId) {
        return error(res, errors.UNAUTHORIZED);
    }

    if (!await checkBan(res, req.session.userId, Ban.POSTING)) {
        return;
    }

    if (!req.params.id) {
        return error(res, errors.INVALID_PARAMETER);
    }

    const mod = new Mod(req.params.id);
    if (!await mod.read()) {
        return error(res, errors.NOT_FOUND);
    }

    const rating = new ModRating(mod.getId(), req.session.userId);
    if (!await rating.fromJson(req.body)) {
        return error(res, errors.INVALID_PARAMETER);
    }
    rating.mod = mod.getId();
    rating.user = req.session.userId;
    await rating.create();

    // update rating
    const data = await knex("mod_ratings")
        .select(knex.raw("AVG(rating) AS rating"))
        .where("mod","=",mod.getId());
    mod.rating = parseFloat(data[0].rating);
    await mod.update();

    res.end();
});

router.get("/:id/download", async (req, res) => {
    if (!req.session?.userId) {
        return error(res, errors.UNAUTHORIZED);
    }

    if (!await checkBan(req, req.session.userId, Ban.DOWNLOAD)) {
        return;
    }

    const mod = new Mod(req.params.id);
    if (!await mod.read()) {
        return error(res, errors.NOT_FOUND);
    }

    mod.downloaded++;
    await mod.update();
    res.json({
        file: mod.file,
        fileSize: mod.fileSize
    });
});

export default router;