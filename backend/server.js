// backend/server.js
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// เสิร์ฟไฟล์ static จากโฟลเดอร์โปรเจกต์หลัก (index.html, app.js, styles.css)
const publicPath = path.join(__dirname, "..");
app.use(express.static(publicPath));

/* ---------- API ROUTES ---------- */

// ทดสอบการเชื่อมต่อ
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from backend" });
});

// config สำหรับหน้า View Config + autofill หน้า Log Temperature
app.get("/api/config", (req, res) => {
  res.json({
    droneId: "66010730",
    droneName: "Tuba",
    light: "OFF",
    country: "Japan"
  });
});

// logs (in-memory)
let LOGS = [];

// รับข้อมูลอุณหภูมิจากหน้า 2
app.post("/api/logs", (req, res) => {
  const { droneId, droneName, country, celsius } = req.body || {};
  const row = {
    created: new Date().toISOString(),
    droneId,
    droneName,
    country,
    celsius: typeof celsius === "number" ? celsius : Number(celsius)
  };
  LOGS.unshift(row); // เก็บไว้ด้านหน้า
  res.json({ ok: true, row });
});

// ส่ง logs ให้หน้า 3
app.get("/api/logs", (req, res) => {
  res.json({
    logs: LOGS.map(r => `[${r.created}] ${r.country} • ${r.droneId} • ${r.droneName} • ${r.celsius}°C`),
    rows: LOGS
  });
});

/* ---------- CATCH-ALL: ต้องวางท้ายสุดเสมอ ---------- */
// จับทุกเส้นทางที่ไม่ใช่ /api/* แล้วเสิร์ฟ index.html (Express v5 ใช้ RegExp)
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

/* ---------- START SERVER ---------- */
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});