import { Router } from "express";

const router = new Router();
router.get("/test", async (req, res) => {
   res.send("OK");
});

export default router;