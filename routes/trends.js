import { Router } from "express";
import knex from "../db.js";

const router = new Router();
router.get("/stats", async (req, res) => {
    const games = await knex("game").count("id AS games");
    const mods = await knex("mod").count("id AS mods");
    res.json({
        games: games[0].games,
        mods: mods[0].mods
    });
});

export default router;