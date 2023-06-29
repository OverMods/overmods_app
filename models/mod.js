import { Model } from "./model.js";
import { formatSqlTime, sqlTimeNow } from "../utils.js";
import sanitizeHtml from "sanitize-html";
import knex from "../db.js";

export class ModScreenshot extends Model {
    constructor(id) {
        super(id, "mod_screenshots", false);
        this.mod = null;
        this.screenshot = null;
    }

    async fromJson(json) {
        this.setId(Model.ensureInt(json.id));
        this.mod = Model.ensureInt(json.mod);
        this.screenshot = json.screenshot;
        return true;
    }
    async toJson() {
        return {
            id: this.getId(),
            mod: this.mod,
            screenshot: this.screenshot
        };
    }

    async fromDataBase(data) {
        await super.fromDataBase(data);
        this.mod = data.mod;
        this.screenshot = data.screenshot;
    }

    async create() {
        await knex("mod_screenshots").insert({
            mod: this.mod,
            screenshot: this.screenshot
        });
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
}

export class ModComment extends Model {
    constructor(id) {
        super(id, "mod_comments", true);
        this.mod = null;
        this.user = null;
        this.commentedAt = null;
        this.comment = null;
    }

    async fromJson(json) {
        this.mod = Model.ensureInt(json.mod);
        if (json.user) {
            this.user = Model.ensureInt(json.user);
        }
        //this.commentedAt
        this.comment = Model.sanitizeText(json.comment);
        return true;
    }
    async toJson() {
        return {
            id: this.getId(),
            mod: this.mod,
            user: this.user,
            commentedAt: formatSqlTime(this.commentedAt),
            comment: this.comment
        };
    }

    async fromDataBase(data) {
        await super.fromDataBase(data);
        this.mod = data.mod;
        this.user = data.user;
        this.commentedAt = data.commented_at;
        this.comment = data.comment;
    }

    async create() {
        await knex("mod_comments").insert({
            mod: this.mod,
            user: this.user,
            commented_at: this.commentedAt ? formatSqlTime(this.commentedAt) : sqlTimeNow(),
            comment: this.comment
        });
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

        await knex("mod_comments")
            .update(data)
            .where("id","=",this.getId());
    }
}

export class ModRating extends Model {
    constructor(mod, user) {
        super(null, "mod_ratings");
        this.mod = mod;
        this.user = user;
    }

    sanitizeCheck(json) {
        return super.sanitizeCheck(json);
    }

    async fromJson(json) {
        this.mod = Model.ensureInt(json.mod);
        this.user = Model.ensureInt(json.user);
        this.rating = Model.ensureInt(json.rating);

        this.rating = Math.min(Math.max(this.rating, 1), 5);
        return true;
    }

    async toJson() {
        return {
            mod: this.mod,
            user: this.user,
            rating: this.rating
        };
    }

    async fromDataBase(data) {
        this.mod = data.mod;
        this.user = data.user;
        this.rating = data.rating;
    }

    async create() {
        await knex.raw("INSERT INTO `mod_ratings` VALUES (?,?,?) ON DUPLICATE KEY UPDATE `rating`=?;",
            [this.mod, this.user, this.rating, this.rating]);
    }

    async read() {
        const data = await knex("mod_ratings")
            .select("*")
            .where("mod","=",this.mod)
            .andWhere("user","=",this.user)
            .limit(1);
        if (data.length > 0) {
            await this.fromDataBase(data[0]);
            return true;
        } else {
            return false;
        }
    }

    async update() {
        return knex("mod_ratings")
            .update({rating: this.rating})
            .where("mod","=",this.mod)
            .andWhere("user","=",this.user);
    }

    async delete() {
        return knex("mod_ratings")
            .where("mod","=",this.mod)
            .andWhere("user","=",this.user)
            .delete();
    }
}

export class Mod extends Model {
    constructor(id) {
        super(Model.ensureInt(id), "mod", true);
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
        return knex.select("mod_comments.id as id", "user", "commented_at",
            "comment", "rating", "username", "avatar", "registered_at",
            "role", "site_rating")
            .from("mod_comments")
            .where("mod","=",this.getId())
            .join("user", "mod_comments.user", "=", "user.id")
            .orderBy("mod_comments.commented_at", "desc");
    }

    async loadRatings() {
        return knex("mod_ratings")
            .select("*")
            .where("mod","=",this.getId());
    }

    sanitizeCheck(json) {
        if (!json.title.match(/^[\w\-\s]+$/)) {
            return false;
        }
        return true;
    }

    async fromJson(json) {
        if (!this.sanitizeCheck(json)) {
            return false;
        }
        this.game = Model.ensureInt(json.game);
        this.title = Model.sanitizeText(json.title);
        this.logo = json.logo;
        //this.author = Model.ensureInt(json.author);
        this.authorTitle = json.authorTitle ? Model.sanitizeText(json.authorTitle) : null;
        //this.uploadedAt = ;
        this.description = json.description ? sanitizeHtml(json.description) : null;
        this.gameVersion = json.gameVersion || null;
        this.instruction = json.instruction ? sanitizeHtml(json.instruction) : null;
        //this.downloaded = null;
        //this.file = null;
        //this.fileSize = null;
        return true;
    }

    async toJson() {
        return {
            id: this.getId(),
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
        await super.fromDataBase(data);
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
}