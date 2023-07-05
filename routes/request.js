import { Router } from "express";
import { Model } from "../models/model.js";
import { RequestRole } from "../models/requestRole.js";
import { error, errors } from "../error.js";

const router = new Router();
router.get("/role", async (req, res) => {
    if (!req.session?.userId) {
        return error(res, errors.UNAUTHORIZED);
    }

    const objs = await Model.readAll(RequestRole, "request_role",
        "requested_by", req.session.userId);
    const requests = [];
    for (const _request of obj) {
        const request = new RequestRole();
        requests.push(request.toJson());
    }
    res.json(requests);
});

export default router;