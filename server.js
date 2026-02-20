const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

const publicDir = path.join(__dirname, "public");
const dataDir = path.join(__dirname, "data");
const allowedFiles = new Set(["notes.txt"]);

if (!process.env.FLAG) {
  process.env.FLAG = "REDLIMIT{C0ngR4ts_D4mn_Bruh}";
}

app.use(express.urlencoded({ extended: false }));
app.use(express.static(publicDir));

app.get("/search", (req, res) => {
  const query = req.query.q || "";
  res.send(`<!doctype html>
<html lang="id">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Hasil Pencarian</title>
  </head>
  <body>
    <h1>Hasil Pencarian</h1>
    <p>Kamu mencari: ${query}</p>
    <a href="/">Kembali</a>
  </body>
</html>`);
});

app.get("/download", (req, res) => {
  const file = path.basename(req.query.file || "");
  if (!allowedFiles.has(file)) {
    res.status(403).type("text/plain").send("Akses ditolak");
    return;
  }
  const targetPath = path.join(dataDir, file);
  fs.readFile(targetPath, "utf8", (err, content) => {
    if (err) {
      res.status(404).type("text/plain").send("File tidak ditemukan");
      return;
    }
    res.type("text/plain").send(content);
  });
});

app.get("/calc", (req, res) => {
  const expr = String(req.query.expr || "");
  const blocked = [
    /process/i,
    /require/i,
    /global/i,
    /function/i,
    /constructor/i,
    /module/i,
    /mainmodule/i,
    /child_process/i,
    /fs/i,
    /this/i
  ];
  if (!expr.trim()) {
    res.status(400).type("text/plain").send("Ekspresi kosong");
    return;
  }
  if (blocked.some((pattern) => pattern.test(expr))) {
    res.status(400).type("text/plain").send("Ekspresi ditolak");
    return;
  }
  try {
    const result = Function(`"use strict"; return (${expr})`)();
    res.type("text/plain").send(String(result));
  } catch (error) {
    res.status(400).type("text/plain").send("Ekspresi tidak valid");
  }
});

app.listen(port, () => {
  console.log(`CTF lab running on http://localhost:${port}`);
});
