import { Model } from "./model.js";
import { formatSqlTime, sqlTimeNow } from "../utils.js";
import knex from "../db.js";

export class Status {
    static STATUS = {
        "PENDING": 0,
        "APPROVED": 1,
        "DECLINED": 2
    }

    static PENDING = new Status("PENDING");
    static APPROVED = new Status("APPROVED");
    static DECLINED = new Status("DECLINED");

    constructor(status) {
        if (typeof status === "number") {
            this.status = status;
        } else {
            this.status = Status.STATUS[status];
        }
    }

    getStatusName() {
        return Object.keys(Status.STATUS).find(k => Status.STATUS[k] === this.status);
    }
}

export class Request extends Model {
    constructor(id, table) {
        super(id, table, false);
        this.requestedBy = null;
        this.requestedAt = null;
        this.requestText = null;
        this.consideredBy = null;
        this.consideredAt = null;
        this.status = null;
    }

    async consider(by, status) {
        this.consideredBy = by;
        this.consideredAt = new Date();
        this.status = status;
        await this.update({});
    }

    async approve(by) {
        await this.consider(by, Status.APPROVED);
        return true;
    }

    async decline(by) {
        await this.consider(by, Status.DECLINED);
        return true;
    }

    sanitizeCheck(json) {
        return true;
    }

    async fromJson(json) {
        this.requestText = json.requestText;
    }

    async toJson() {
        return {
            id: this.getId(),
            requestedBy: this.requestedBy,
            requestedAt: this.requestedAt ? formatSqlTime(this.requestedAt) : null,
            requestText: this.requestText,
            consideredBy: this.consideredBy,
            consideredAt: this.consideredAt ? formatSqlTime(this.consideredAt) : null,
            status: this.status ? this.status.getStatusName() : Status.PENDING.getStatusName()
        }
    }

    async fromDataBase(data) {
        await super.fromDataBase(data);
        this.requestedBy = data.requested_by;
        this.requestedAt = data.requested_at;
        this.requestText = data.request_text;
        this.consideredBy = data.considered_by;
        this.consideredAt = data.considered_at;
        this.status = new Status(data.status);
    }

    async create(child) {
        const base = {
            requested_by: this.requestedBy,
            requested_at: this.requestedAt ? formatSqlTime(this.requestedAt) : sqlTimeNow(),
            request_text: this.requestText,
            considered_by: this.consideredBy,
            considered_at: this.consideredAt ? formatSqlTime(this.consideredAt) : null,
            status: this.status? this.status.getStatusName() : Status.PENDING.getStatusName(),
        };
        // {...obj1, ...obj2} is used to merge two objects, where obj2 overrides obj1
        await knex(this.table).insert({...base, ...child});
    }

    async update(child) {
        const base = {};
        if (this.requestedBy) {
            base.requested_by = this.requestedBy;
        }
        if (this.requestedAt) {
            base.requested_at = formatSqlTime(this.requestedAt);
        }
        if (this.requestText) {
            base.request_text = this.requestText;
        }
        if (this.consideredBy) {
            base.considered_by = this.consideredBy;
        }
        if (this.consideredAt) {
            base.considered_at = formatSqlTime(this.consideredAt);
        }
        if (this.status) {
            base.status = this.status.getStatusName();
        }

        await knex(this.table)
            .update({...base, ...child})
            .where("id","=",this.getId());
    }
}