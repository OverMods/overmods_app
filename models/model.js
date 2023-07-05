import knex from "../db.js";

// Base class for all models that cover business-logic of database data
// Perform conversion from DB to JSON and vice-versa
// Defines a CRUD-like interface
export class Model {
    static ensureInt(value) {
        if (typeof value === "string") {
            return parseInt(value, 10);
        } else if (typeof value === "number") {
            return value % 1 === 0 ? value : Math.round(value);
        }
        return null;
    }

    static validString(value) {
        if (value !== null && value !== undefined) {
            if (typeof value === "string") {
                return value.length > 0;
            }
        }
        return false;
    }

    static sanitizeText(text) {
        return String(text).replaceAll(/<\/?[^>]+(>|$)/gi, "");
    }

    // I know, this is dumb, but I regret not using ORM when we started project development.
    // Unfortunately, it's too late to migrate to ORM, but amount of models and their
    // respective requests are too large and deadline is too soon, so I've made
    // decision to make this helper function, which reads all rows from table
    // and constructs models from constructor reference, so they can be parsed
    // from DB to JSON and vice-versa
    static async loadAll(modelClass, dataList) {
        const models = [];
        for (const data of dataList) {
            const model = new modelClass();
            await model.fromDataBase(data);
            models.push(model);
        }
        return models;
    }

    static async readAll(modelClass, table, attr, value, deleted = null) {
        let dataList;
        if (deleted === null || deleted === true) {
            dataList = await knex(table)
                .select("*")
                .where(attr,"=",value);
        } else if (deleted === false) {
            dataList = await knex(table)
                .select("*")
                .where(attr,"=",value)
                .andWhereNot("deleted","=","1");
        }
        return await Model.loadAll(modelClass, dataList);
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

    sanitizeCheck(json) {
        return true;
    }

    async fromJson(json) {
        if (!this.sanitizeCheck(json)) {
            return false;
        }
    }
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