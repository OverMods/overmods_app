import { Router } from "express";
import knex from "../db.js";

const router = new Router();
router.get("/", async (req, res) => {
    res.json(await knex("game").select("*"));
});

export default router;