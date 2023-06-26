import { Router } from "express";
import { ModScreenshot, ModComment, Mod } from "../models/mod.js";
import { User, Role } from "../models/user.js";
import { error, errors } from "../error.js";
import { upload } from "../upload.js";

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

    const mod = new Mod();
    await mod.fromJson(req.body);
    mod.author = req.session.userId;
    mod.uploadedAt = new Date();
    mod.downloaded = 0;

    await mod.create();
    res.end();
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
    if (!req.params.id || !req.file) {
        return error(res, errors.INVALID_PARAMETER);
    }

    const mod = await checkModOwnership(req, res, req.params.id);
    if (!mod) {
        return;
    }

    const screenshot = new ModScreenshot();
    screenshot.mod = mod.getId();
    screenshot.screenshot = req.file.filename;
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

    if (!req.params.id) {
        return error(res, errors.INVALID_PARAMETER);
    }

    const mod = new Mod(req.params.id);
    if (!await mod.read()) {
        return error(res, errors.NOT_FOUND);
    }

    const comment = new ModComment();
    await comment.fromJson(req.body);
    comment.mod = mod.getId();
    comment.user = req.session.userId;
    comment.commentedAt = new Date();
    await comment.create();
    res.end();
});

router.get("/:id/download", async (req, res) => {
    /*if (!req.session?.userId) {
        return error(res, errors.UNAUTHORIZED);
    }*/

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