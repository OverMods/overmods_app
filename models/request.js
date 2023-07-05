import { Model } from "./model.js";
import { formatSqlTime } from "../utils.js";

export class Request extends Model {
    constructor(id, table) {
        super(id, table, false);
        this.requestedBy = null;
        this.requestedAt = null;
        this.requestText = null;
        this.approvedBy = null;
        this.approvedAt = null;
    }

    sanitizeCheck(json) {
        return true;
    }

    async fromJson(json) {
        this.requestedText = json.requestText;
    }

    async toJson() {
        return {
            id: this.getId(),
            requestedBy: this.requestedBy,
            requestedAt: this.requestedAt ? formatSqlTime(this.requestedAt) : null,
            requestText: this.requestText,
            approvedBy: this.approvedBy,
            approvedAt: this.approvedAt ? formatSqlTime(this.approvedAt) : null
        }
    }

    async fromDataBase(data) {
        await super.fromDataBase(data);
        this.requestedBy = data.requested_by;
        this.requestedAt = data.requested_at;
        this.requestText = data.request_text;
        this.approvedBy = data.approved_by;
        this.approvedAt = data.approved_at;
    }
}