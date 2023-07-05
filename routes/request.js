import { Router } from "express";
import { Model } from "../models/model.js";
import { Role } from "../models/user.js";
import { Status } from "../models/request.js";
import { RequestRole } from "../models/requestRole.js";
import { error, errors } from "../error.js";
import knex from "../db.js";

async function checkAdmin(req, res) {
    if (!req.session?.userId) {
        error(res, errors.UNAUTHORIZED);
        return false;
    }
    if (!Role.isPrivilegedAs(req.session.userRole, Role.ADMIN)) {
        error(res, errors.INSUFFICIENT_PRIVILEGES);
        return false;
    }
    return true;
}

const router = new Router();
// get requests for role
router.get("/role", async (req, res) => {
    if (!req.session?.userId) {
        return error(res, errors.UNAUTHORIZED);
    }

    let objs;
    if (Role.isPrivilegedAs(req.session.userRole, Role.ADMIN)) {
        objs = await Model.loadAll(RequestRole, await knex("request_role")
            .select("*"));
    } else {
        objs = await Model.readAll(RequestRole, "request_role",
            "requested_by", req.session.userId);
    }

    const requests = [];
    for (const request of objs) {
        requests.push(await request.toJson());
    }
    res.json(requests);
});

// create request for role
router.post("/role", async (req, res) => {
    if (!req.session?.userId) {
        return error(res, errors.UNAUTHORIZED);
    }

    if (!req.body.newRole) {
        return error(res, errors.INVALID_PARAMETER);
    }

    let data = await knex("request_role")
        .select("*")
        .where("requested_by","=",req.session.userId);
    if (data.length > 0) {
        return error(res, errors.NOT_MODIFIED);
    }

    const r = new RequestRole();
    r.requestedBy = req.session.userId;
    r.requestedAt = new Date();
    r.requestText = req.body.requestText ? Model.sanitizeText(req.body.requestText) : null;
    r.newRole = new Role(req.body.newRole);
    await r.create();

    data = await Model.readAll(RequestRole, "request_role", "requested_by", req.session.userId);
    if (data.length > 0) {
        res.json(await data[0].toJson());
    } else {
        error(res, errors.FAILED);
    }
});

// admin method to consider request for role
router.post("/role/:id/consider", async (req, res) => {
    if (!await checkAdmin(req, res)) {
        return;
    }

    const decision = req.body.decision;
    if (!req.params.id || !decision) {
        return error(res, errors.INVALID_PARAMETER);
    }

    const r = new RequestRole(req.params.id);
    if (!await r.read()) {
        return error(res, errors.NOT_FOUND);
    }

    if (decision === "approve") {
        const err = await r.approve(req.session.userId);
        if (err !== true) {
            console.log(err);
            return error(res, errors.FAILED);
        }
    } else if (decision === "decline") {
        await r.decline(req.session.userId);
    } else {
        return error(res, errors.NOT_MODIFIED);
    }

    res.json(await r.toJson());
});

export default router;