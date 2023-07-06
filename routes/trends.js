import { Router } from "express";
import { Mod } from "../models/mod.js";
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

router.get("/mods", async (req, res) => {
    const data = await knex("mod")
        .select("*")
        .groupBy("game")
        .orderBy("rating", "desc");
    const mods = [];
    for (let _mod of data) {
        const mod = new Mod();
        await mod.fromDataBase(_mod);
        mod.file = null;
        mods.push({
            mod: await mod.toJson(),
            rating: mod.rating
        });
    }
    res.json(mods);
});

export default router;