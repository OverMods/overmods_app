export class Model {
    static ensureInt(value) {
        if (typeof value === "string") {
            return parseInt(value, 10);
        } else if (typeof value === "number") {
            return value % 1 === 0 ? value : Math.round(value);
        }
        return null;
    }

    constructor(id) {
        this.setId(id);
    }

    setId(id) {
        this.id = id;
    }

    getId() {
        return this.id;
    }

    async fromJson(json) {}
    async toJson() {}

    async create() {}
    async read() {}
    async update() {}
    async delete() {}
}