import { Model } from "./model.js";
import knex from "../db.js";

export class Game extends Model {
    constructor(id) {
        super(Model.ensureInt(id));
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

    async fromJson(json) {
        this.title = json.title;
        this.shortName = json.shortName;
        if (this.logo) {
            this.logo = json.logo;
        }
    }
    async toJson() {
        return {
            title: this.title,
            shortName: this.shortName,
            logo: this.logo
        }
    }

    async fromDataBase(data) {
        this.setId(Model.ensureInt(data.id));
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

    async read() {
        const data = await knex("game")
            .select("*")
            .where("id","=",this.getId())
            .limit(1);
        if (data.length > 0) {
            await this.fromDataBase(data[0]);
            return true;
        } else {
            return false;
        }
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

    async delete() {
        await knex("game")
            .where("id","=",this.getId())
            .delete();
    }
}