import express from "express";

const app = express();
app.get("/", async (req, res) => {
    res.send("OK");
});

app.get("/hello", async (req, res) => {
   res.send("Hello!");
});

app.listen(3000);