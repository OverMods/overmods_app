import { Router } from "express";
import { User, Role } from "../models/user.js";
import { error, errors } from "../error.js";
import bcrypt from "bcrypt";
import knex from "../db.js";

const router = new Router();

router.post("/", async (req, res) => {
    if (req.session?.userId) {
        return error(res, errors.ALREADY_AUTHORIZED);
    }

    if (!req.body.username || !req.body.password) {
        return error(res, errors.INVALID_PARAMETER);
    }

    const rows = await knex("user")
        .select("id")
        .where("username","=",req.body.username)
        .limit(1);
    if (rows.length > 0) {
        return error(res, errors.USER_ALREADY_EXISTS);
    }

    const user = new User();
    await user.fromJson(req.body);
    user.role = new Role("USER");
    user.password = await bcrypt.hash(user.password, 10);
    try {
        await user.create();
    } catch (e) {
        console.log(e);
        return error(res, errors.FAILED);
    }

    const data = await knex("user")
        .select("*")
        .where("username","=",req.body.username)
        .limit(1);
    await user.fromDataBase(data[0]);
    user.password = undefined;
    res.json(await user.toJson());
});

export default router;