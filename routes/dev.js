import { Router } from "express";
import bcrypt from "bcrypt";
import knex from "../db.js";
import { sqlTimeNow } from "../utils.js";

const router = new Router();
router.get("/test", async (req, res) => {
   res.send("OK");
});

router.post("/create-user", async (req, res) => {
   let passwordHash = await bcrypt.hash(req.body.password, 10);
   await knex("user").insert({
      username: req.body.username,
      email: req.body.email ? req.body.email : null,
      password: passwordHash,
      registered_at: sqlTimeNow(),
      role: req.body.role,
      site_rating: req.body.site_rating ? parseInt(req.body.site_rating) : 5,
   });
   res.end();
});

router.post("/create-game", async (req, res) => {
   await knex("game").insert({
      title: req.body.title,
      logo: req.body.logo
   });
   res.end();
});

export default router;