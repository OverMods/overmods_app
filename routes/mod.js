import { Router } from "express";
import { ModScreenshot, ModComment, Mod } from "../models/mod.js";
import { Role } from "../models/user.js";
import { error, errors } from "../error.js";
import { upload } from "../upload.js";

const router = new Router();

async function checkModOwnership(req, res, id) {
    if (!req.session?.userRole) {
        error(res, errors.UNAUTHORIZED);
        return null;
    }

    if (!Role.isPrivilegedAs(req.session.userRole, Role.MODDER)) {
        error(res, error.INSUFFICIENT_PRIVILEGES);
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

export default router;