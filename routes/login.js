import { Router } from "express";
import { User } from "../models/user.js";
import {error, errors } from "../error.js";
import bcrypt from "bcrypt";
import knex from "../db.js";

const router = new Router();

router.post("/", async (req, res) => {
    if (req.session.userObj) {
        return error(res, errors.ALREADY_AUTHORIZED);
    }

    if (!req.body.username || !req.body.password) {
        return error(res, errors.INVALID_PARAMETER);
    }

    const data = await knex("user")
        .select("*")
        .where("username","=",req.body.username);
    if (data.length > 0) {
        const user = new User(0);
        await user.fromDataBase(data[0]);
        if (await bcrypt.compare(req.body.password, user.password)) {
            req.session.userObj = user;
            console.log(user);
            res.end();
        } else {
            return error(res, errors.INVALID_PASSWORD);
        }
    } else {
        return error(res, errors.USER_NOT_FOUND);
    }
});

router.delete("/", async (req, res) => {
   if (req.session?.userObj) {
       req.session.destroy();
       res.end();
   } else {
       return error(res, errors.UNAUTHORIZED);
   }
});

export default router;