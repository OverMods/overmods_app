import { Request } from "./request.js";
import { User, Role } from "./user.js";
import { errors } from "../error.js";

export class RequestRole extends Request {
    constructor(id) {
        super(id, "request_role");
        this.newRole = null;
    }

    async approve(by) {
        const user = new User(this.requestedBy);
        if (!await user.read()) {
            return errors.USER_NOT_FOUND;
        }

        user.role = this.newRole;
        await user.update();

        return await super.approve(by);
    }

    async fromJson(json) {
        await super.fromJson(json);
        this.newRole = new Role(json.newRole);
    }

    async toJson() {
        const base = await super.toJson();
        const json = {
            newRole: this.newRole.getRoleName()
        };
        return {...base, ...json};
    }

    async fromDataBase(data) {
        await super.fromDataBase(data);
        this.newRole = new Role(data.new_role);
    }

    async create() {
        await super.create({
            new_role: this.newRole.getRoleName()
        });
    }

    async update() {
        await super.update({
            new_role: this.newRole.getRoleName()
        });
    }
}