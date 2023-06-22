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

export class User extends Model {
    constructor(id) {
        super(id);
        this.username = null;
        this.email = null;
        this.password = null;
        this.avatar = null;
        this.registeredAt = null;
        this.role = null;
        this.siteRating = null;
    }

    async fromJson(json) {
        this.username = json.username;
        this.password = json.password;
        this.avatar = json.avatar;
        this.siteRating = Model.ensureInt(json.siteRating);
    }

    async toJson() {
        return {
            id: this.getId(),
            username: this.username,
            avatar: this.avatar,
            role: this.role.getRoleName(),
            siteRating: this.siteRating
        };
    }

    async fromDataBase(data) {
        this.setId(User.ensureInt(data.id));
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

    async read() {
        const data = await knex("user")
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

    async delete() {
        await knex("user")
            .where("id","=",this.getId())
            .delete();
    }
}