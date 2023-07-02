import dotenv from "dotenv";
import _knex from "knex";

dotenv.config();
export default _knex({
    client: "mysql2",
    connection: {
        timezone: "UTC",
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_SCHEMA
    }
});