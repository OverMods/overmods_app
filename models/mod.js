import { Model } from "./model.js";
import { formatSqlTime } from "../utils.js";
import knex from "../db.js";

export class Mod extends Model {
    constructor(id) {
        super(id);
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
            uploaded_at: this.uploadedAt ? formatSqlTime(this.uploadedAt) : null,
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
            .where("id","=",this.getId());
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