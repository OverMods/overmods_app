import { Router } from "express";
import { Model } from "../models/model.js";
import { Role } from "../models/user.js";
import { RequestRole } from "../models/requestRole.js";
import { error, errors } from "../error.js";
import knex from "../db.js";

const router = new Router();
router.get("/role", async (req, res) => {
    if (!req.session?.userId) {
        return error(res, errors.UNAUTHORIZED);
    }

    const objs = await Model.readAll(RequestRole, "request_role",
        "requested_by", req.session.userId);
    const requests = [];
    for (const _request of objs) {
        const request = new RequestRole();
        requests.push(request.toJson());
    }
    res.json(requests);
});

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

export default router;