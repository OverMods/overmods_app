import knex from "../db.js";

export class Model {
    static ensureInt(value) {
        if (typeof value === "string") {
            return parseInt(value, 10);
        } else if (typeof value === "number") {
            return value % 1 === 0 ? value : Math.round(value);
        }
        return null;
    }

    constructor(id, table, haveDeleted = false) {
        if (id !== undefined) {
            this.setId(id);
        }
        this.table = table;
        this.haveDeleted = haveDeleted;
        if (this.haveDeleted) {
            this.deleted = false;
        }
    }

    setId(id) {
        this.id = id;
    }

    getId() {
        return this.id;
    }

    async fromJson(json) {}
    async toJson() {}

    async fromDataBase(data) {
        this.setId(Model.ensureInt(data.id));
        if (this.haveDeleted) {
            this.deleted = data.deleted ? Model.ensureInt(data.deleted) === 1 : false;
        }
    }

    async create() {}
    async read(deleted = false) {
        const data = await knex(this.table)
            .select("*")
            .where("id","=",this.getId())
            .limit(1);
        if (data.length > 0) {
            await this.fromDataBase(data[0]);
            if (this.haveDeleted) {
                return !this.deleted || deleted;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }
    async update() {}
    async delete(permanent = false) {
        if (this.haveDeleted && !permanent) {
            this.deleted = true;
            return knex(this.table)
                .update({deleted: this.deleted})
                .where("id","=",this.getId());
        } else {
            return knex(this.table)
                .where("id","=",this.getId())
                .delete();
        }
    }
}