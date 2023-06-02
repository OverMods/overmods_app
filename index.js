import express from "express";

const app = express();
app.get("/", async (req, res) => {
    res.send("OK");
});

app.get("/test2", async (req, res) => {
    res.send("OK 2");
});

app.listen(3000);