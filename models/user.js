import { Model } from "./model.js";
import {formatSqlTime, sqlTimeNow} from "../utils.js";
import knex from "../db.js";

export class Role {
    static ROLES = {
        "USER": 0,
        "MODDER": 1,
        "ADMIN": 2
    }
    static USER = new Role("USER");
    static MODDER = new Role("MODDER");
    static ADMIN = new Role("ADMIN");

    constructor(role) {
        if (typeof role === "number") {
            this.role = role;
        } else {
            this.role = Role.ROLES[role];
        }
    }

    getRoleName() {
        return Object.keys(Role.ROLES).find(k => Role.ROLES[k] === this.role);
    }

    static isPrivilegedAs(first, second) {
        return first.role >= second.role;
    }
}

const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export class User extends Model {
    constructor(id) {
        super(id, "user", true);
        this.username = null;
        this.email = null;
        this.password = null;
        this.avatar = null;
        this.registeredAt = null;
        this.role = null;
        this.siteRating = null;
    }

    static obscureEmail(email) {
        return email.replace(/(^.|@[^@](?=[^@]*$)|\.[^.]+$)|./g, (x, y) => y || '*');
    }

    sanitizeCheck(json) {
        if (json.username && !json.username.match(/^[a-zA-Z0-9_-]*$/)) {
            return false;
        }
        if (json.password && !json.password.match(/^[a-zA-Z0-9_-]*$/)) {
            return false;
        }
        if (json.email) {
            if (!String(json.email).toLowerCase().match(EMAIL_REGEX)) {
                return false;
            }
        }
        return true;
    }

    async fromJson(json) {
        if (!this.sanitizeCheck(json)) {
            return false;
        }
        if (!Model.validString(json.username)) {
            return false;
        }
        if (json.email && !Model.validString(json.email)) {
            return false;
        }
        this.username = json.username;
        this.email = json.email;
        this.password = json.password;
        this.avatar = json.avatar;

        const rating = Model.ensureInt(json.siteRating);
        this.siteRating = Math.min(Math.max(rating, 1), 5);
        return true;
    }

    async toJson() {
        return {
            id: this.getId(),
            username: this.username,
            email: this.email,
            avatar: this.avatar,
            role: this.role.getRoleName(),
            siteRating: this.siteRating
        };
    }

    async fromDataBase(data) {
        await super.fromDataBase(data);
        this.username = data.username;
        this.email = data.email;
        this.password = data.password;
        this.avatar = data.avatar;
        this.registeredAt = data.registered_at;
        this.role = new Role(data.role);
        this.siteRating = data.site_rating;
    }

    async create() {
        await knex("user").insert({
            id: this.id,
            username: this.username,
            email: this.email,
            password: this.password,
            avatar: this.avatar,
            registered_at: this.registeredAt ? formatSqlTime(this.registeredAt) : sqlTimeNow(),
            role: this.role ? this.role.getRoleName() : "USER",
            site_rating: this.siteRating
        });
    }

    async update() {
        const data = {};
        if (this.username) {
            data.username = this.username;
        }
        if (this.email) {
            data.email = this.email;
        }
        if (this.password) {
            data.password = this.password;
        }
        if (this.avatar) {
            data.avatar = this.avatar;
        }
        if (this.registeredAt) {
            data.registered_at = formatSqlTime(this.registeredAt);
        }
        if (this.role) {
            data.role = this.role.getRoleName();
        }
        if (this.siteRating) {
            data.site_rating = this.siteRating;
        }

        await knex("user")
            .update(data)
            .where("id","=",this.getId());
    }
}