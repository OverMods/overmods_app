import { Router } from "express";
import { Mod } from "../models/mod.js";
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

export default router;