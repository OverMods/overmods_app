import { Model } from "./model.js";
import knex from "../db.js";

export class Game extends Model {
    constructor(id) {
        super(Model.ensureInt(id), "game");
        this.title = null;
        this.shortName = null;
        this.logo = null;
    }

    static async fromShortName(shortName) {
        const res = await knex("game")
            .select("*")
            .where("short_name","=",shortName);
        if (res.length > 0) {
            const game = new Game();
            await game.fromDataBase(res[0]);
            return game;
        } else {
            return null;
        }
    }

    static async loadGames() {
        return knex("game")
            .select("*");
    }

    async loadGameMods() {
        return knex("mod")
            .select("*")
            .where("game","=",this.getId());
    }

    sanitizeCheck(json) {
        if (!json.title.match(/^[\w\-\s]+$/)) {
            return false;
        }
        if (!json.shortName.match(/^[a-zA-Z0-9_-]*$/)) {
            return false;
        }
        return true;
    }

    async fromJson(json) {
        if (!this.sanitizeCheck(json)) {
            return false;
        }
        this.title = json.title;
        this.shortName = json.shortName;
        /*if (this.logo) {
            this.logo = json.logo;
        }*/
        return true;
    }
    async toJson() {
        return {
            title: this.title,
            shortName: this.shortName,
            logo: this.logo
        }
    }

    async fromDataBase(data) {
        await super.fromDataBase(data);
        this.title = data.title;
        this.shortName = data.short_name;
        this.logo = data.logo || null;
    }

    async create() {
        await knex("game").insert({
            title: this.title,
            short_name: this.shortName,
            logo: this.logo
        });
    }

    async update() {
        const data = {};
        if (this.title) {
            data.title = this.title;
        }
        if (this.shortName) {
            data.short_name = this.shortName;
        }
        if (this.logo) {
            data.logo = this.logo;
        }

        await knex("game")
            .update(data)
            .where("id","=",this.getId());
    }
}