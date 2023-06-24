import { Model } from "./model.js";
import { formatSqlTime, sqlTimeNow } from "../utils.js";
import knex from "../db.js";

export class ModScreenshot extends Model {
    constructor(id) {
        super(id);
        this.mod = null;
        this.screenshot = null;
    }

    async fromJson(json) {
        this.setId(Model.ensureInt(json.id));
        this.mod = Model.ensureInt(json.mod);
        this.screenshot = json.screenshot;
    }
    async toJson() {
        return {
            id: this.getId(),
            mod: this.mod,
            screenshot: this.screenshot
        };
    }

    async fromDataBase(data) {
        this.setId(data.id);
        this.mod = data.mod;
        this.screenshot = data.screenshot;
    }

    async create() {
        await knex("mod_screenshots").insert({
            mod: this.mod,
            screenshot: this.screenshot
        });
    }
    async read() {
        const data = await knex("mod_screenshots")
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
        if (this.mod) {
            data.mod = this.mod;
        }
        if (this.screenshot) {
            data.screenshot = this.screenshot;
        }

        await knex("mod_screenshots")
            .update(data)
            .where("id","=",this.getId());
    }
    async delete() {
        await knex("mod_screenshots")
            .where("id","=",this.getId())
            .delete();
    }
}

export class ModComment extends Model {
    constructor(id) {
        super(id);
        this.mod = null;
        this.user = null;
        this.commentedAt = null;
        this.comment = null;
        this.rating = null;
    }

    async fromJson(json) {
        this.mod = Model.ensureInt(json.mod);
        if (json.user) {
            this.user = Model.ensureInt(json.user);
        }
        //this.commentedAt
        this.comment = json.comment;
        this.rating = Model.ensureInt(json.rating);
    }
    async toJson() {
        return {
            id: this.getId(),
            mod: this.mod,
            user: this.user,
            commentedAt: this.commentedAt,
            comment: this.comment,
            rating: this.rating
        };
    }

    async fromDataBase(data) {
        this.setId(data.id);
        this.mod = data.mod;
        this.user = data.user;
        this.commentedAt = data.commented_at;
        this.comment = data.comment;
        this.rating = data.rating;
    }

    async create() {
        await knex("mod_comments").insert({
            mod: this.mod,
            user: this.user,
            commented_at: this.commentedAt ? formatSqlTime(this.commentedAt) : sqlTimeNow(),
            comment: this.comment,
            rating: this.rating
        });
    }
    async read() {
        const data = await knex("mod_comments")
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
        if (this.mod) {
            data.mod = this.mod;
        }
        if (this.user) {
            data.user = this.user;
        }
        if (this.commentedAt) {
            data.commented_at = formatSqlTime(this.commentedAt);
        }
        if (this.comment) {
            data.comment = this.comment;
        }
        if (this.rating) {
            data.rating = this.rating;
        }

        await knex("mod_comments")
            .update(data)
            .where("id","=",this.getId());
    }
    async delete() {
        await knex("mod_comments")
            .where("id","=",this.getId())
            .delete();
    }
}

export class Mod extends Model {
    constructor(id) {
        super(Model.ensureInt(id));
        this.game = null;
        this.title = null;
        this.logo = null;
        this.author = null;
        this.authorTitle = null;
        this.uploadedAt = null;
        this.description = null;
        this.gameVersion = null;
        this.instruction = null;
        this.downloaded = null;
        this.file = null;
        this.fileSize = null;
    }

    async loadScreenshots() {
        return knex("mod_screenshots")
            .select("*")
            .where("mod","=",this.getId());
    }

    async loadComments() {
        return knex("mod_comments")
            .select("*")
            .where("mod","=",this.getId());
    }

    async fromJson(json) {
        this.game = Model.ensureInt(json.game);
        this.title = json.title;
        this.logo = json.logo;
        //this.author = Model.ensureInt(json.author);
        this.authorTitle = json.authorTitle;
        //this.uploadedAt = ;
        this.description = json.description;
        this.gameVersion = json.gameVersion || null;
        this.instruction = json.instruction || null;
        //this.downloaded = null;
        //this.file = null;
        //this.fileSize = null;
    }

    async toJson() {
        return {
            game: this.game,
            title: this.title,
            logo: this.logo,
            author: this.author,
            authorTitle: this.authorTitle,
            uploadedAt: this.uploadedAt ? formatSqlTime(this.uploadedAt) : null,
            description: this.description,
            gameVersion: this.gameVersion,
            instruction: this.instruction,
            downloaded: this.downloaded,
            file: this.file,
            fileSize: this.fileSize
        };
    }

    async fromDataBase(data) {
        this.setId(Model.ensureInt(data.id));
        this.game = data.game;
        this.title = data.title;
        this.logo = data.logo;
        this.author = data.author;
        this.authorTitle = data.author_title;
        this.uploadedAt = data.uploaded_at;
        this.description = data.description;
        this.gameVersion = data.game_version;
        this.instruction = data.instruction;
        this.downloaded = data.downloaded;
        this.file = data.file;
        this.fileSize = data.file_size;
    }

    async create() {
        await knex("mod").insert({
            game: this.game,
            title: this.title,
            logo: this.logo,
            author: this.author,
            author_title: this.authorTitle,
            uploaded_at: this.uploadedAt ? formatSqlTime(this.uploadedAt) : sqlTimeNow(),
            description: this.description,
            game_version: this.gameVersion,
            instruction: this.instruction,
            downloaded: this.downloaded,
            file: this.file,
            file_size: this.fileSize
        });
    }

    async read() {
        const data = await knex("mod")
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
        if (this.game) {
            data.game = this.game;
        }
        if (this.title) {
            data.title = this.title;
        }
        if (this.logo) {
            data.logo = this.logo;
        }
        if (this.author) {
            data.author = this.author;
        }
        if (this.authorTitle) {
            data.author_title = this.authorTitle;
        }
        if (this.uploadedAt) {
            data.uploaded_at = formatSqlTime(this.uploadedAt);
        }
        if (this.description) {
            data.description = this.description;
        }
        if (this.gameVersion) {
            data.game_version = this.gameVersion;
        }
        if (this.instruction) {
            data.instruction = this.instruction;
        }
        if (this.downloaded) {
            data.downloaded = this.downloaded;
        }
        if (this.file) {
            data.file = this.file;
        }
        if (this.fileSize) {
            data.file_size = this.fileSize;
        }

        await knex("mod")
            .update(data)
            .where("id","=",this.getId());
    }

    async delete() {
        await knex("mod")
            .where("id","=",this.getId())
            .delete();
    }
}