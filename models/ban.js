import { Model } from "./model.js";
import knex from "../db.js";
import {formatSqlTime, sqlTimeNow} from "../utils.js";

export class Ban extends Model {
    static NO_RESTRICT = 0;
    static LOGIN = 1;
    static POSTING = 2;
    static COMMENT = 3;
    static MODDING = 4;
    static DOWNLOAD = 5;

    constructor(id) {
        super(id, "ban", false);
        this.setId(id);
        this.user = null;
        this.bannedBy = null;
        this.bannedAt = null;
        this.reason = null;
        this.restrictLogin = null;
        this.restrictComment = null;
        this.restrictPosting = null;
        this.restrictModding = null;
        this.restrictDownload = null;
        this.canAppeal = null;
    }

    async fromJson(json) {
        this.user = json.user;
        this.bannedBy = json.bannedBy;
        //this.bannedAt = json.bannedAt;
        this.reason = Model.sanitizeText(json.reason);
        this.restrictLogin = json.restrictLogin;
        this.restrictComment = json.restrictComment;
        this.restrictPosting = json.restrictPosting;
        this.restrictModding = json.restrictModding;
        this.restrictDownload = json.restrictDownload;
        this.canAppeal = json.canAppeal;
    }

    async toJson() {
        return {
            id: this.getId(),
            user: this.user,
            bannedBy: this.bannedBy,
            bannedAt: this.bannedAt ? formatSqlTime(this.bannedAt) : null,
            restrictLogin: this.restrictLogin,
            restrictComment: this.restrictComment,
            restrictPosting: this.restrictPosting,
            restrictModding: this.restrictModding,
            restrictDownload: this.restrictDownload,
            canAppeal: !!this.canAppeal
        }
    }

    async fromDataBase(data) {
        await super.fromDataBase(data);
        this.setId(data.id);
        this.user = data.user;
        this.bannedBy = data.bannedBy;
        this.bannedAt = data.bannedAt;
        this.reason = data.reason;
        this.restrictLogin = !!data.restrict_login;
        this.restrictComment = !!data.restrict_comment;
        this.restrictPosting = !!data.restrict_posting;
        this.restrictModding = !!data.restrict_modding;
        this.restrictDownload = !!data.restrict_download;
        this.canAppeal = !!data.can_appeal;
    }

    async create() {
        await knex("ban").insert({
            id: this.getId(),
            user: this.user,
            banned_by: this.bannedBy,
            banned_at: this.bannedAt ? formatSqlTime(this.bannedAt) : sqlTimeNow(),
            reason: this.reason,
            restrict_login: this.restrictLogin | 0,
            restrict_comment: this.restrictComment | 0,
            restrict_posting: this.restrictPosting | 0,
            restrict_modding: this.restrictModding | 0,
            restrict_download: this.restrictDownload | 0,
            can_appeal: this.canAppeal | 0
        });
    }

    async update() {
        const data = {};
        if (this.user) {
            data.user;
        }
        if (this.bannedBy) {
            data.banned_by = this.bannedBy;
        }
        if (this.bannedAt) {
            data.banned_at = formatSqlTime(this.bannedAt);
        }
        if (this.reason) {
            data.reason = this.reason;
        }
        if (this.restrictLogin !== null) {
            data.restrict_login = this.restrictLogin | 0;
        }
        if (this.restrictComment !== null) {
            data.restrict_comment = this.restrictComment | 0;
        }
        if (this.restrictPosting !== null) {
            data.restrict_posting = this.restrictPosting | 0;
        }
        if (this.restrictModding !== null) {
            data.restrict_modding = this.restrictModding | 0;
        }
        if (this.restrictDownload !== null) {
            data.restrict_download = this.restrictDownload | 0;
        }
        if (this.canAppeal !== null) {
            data.can_appeal = this.canAppeal | 0;
        }

        await knex("ban")
            .update(data)
            .where("id","=",this.getId());
    }
}