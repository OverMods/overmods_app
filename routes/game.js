import { Router } from "express";
import { Game } from "../models/game.js";
import { Mod } from "../models/mod.js";
import { error, errors } from "../error.js";

const router = new Router();
router.get("/", async (req, res) => {
    const games = [];
    for (let data of (await Game.loadGames())) {
        const game = new Game();
        await game.fromDataBase(data);
        games.push(await game.toJson());
    }
    res.json(games);
});

router.get("/:shortName", async (req, res) => {
    if (!req.params.shortName) {
        return error(res, errors.INVALID_PARAMETER);
    }

    const game = await Game.fromShortName(req.params.shortName);
    if (!game) {
        return error(res, errors.NOT_FOUND);
    }

    const mods = [];
    for (let _mod of (await game.loadGameMods())) {
        const mod = new Mod();
        await mod.fromDataBase(_mod);
        mod.file = null;
        mods.push(await mod.toJson());
    }

    res.json({
        game: await game.toJson(),
        mods: mods,
    });
});

export default router;