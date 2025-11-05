// api/logs.js

// เก็บ log ไว้ในหน่วยความจำของ instance (จะหายเมื่อ instance รีสตาร์ท/สลับ)
let LOGS = globalThis.__LOGS__ || [];
globalThis.__LOGS__ = LOGS;

// ใช้ Node.js runtime แบบ serverless ปกติของ Vercel
export const config = { runtime: "nodejs" };

// อ่าน JSON body ให้ทำงานได้ทั้งกรณีที่ไม่มี req.body
async function readBody(req) {
  if (req.body && typeof req.body === "object" && Object.keys(req.body).length > 0) {
    return req.body;
  }
  const chunks = [];
  for await (const ch of req) chunks.push(ch);
  const raw = Buffer.concat(chunks).toString();
  try { return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { droneId, droneName, country, celsius } = await readBody(req);

    if (!droneId || !droneName || !country || celsius === undefined) {
      return res.status(400).json({ ok: false, error: "Missing fields", body: { droneId, droneName, country, celsius } });
    }

    const value = Number(celsius);
    if (Number.isNaN(value)) {
      return res.status(400).json({ ok: false, error: "celsius must be a number" });
    }

    const log = {
      created: new Date().toISOString(),
      droneId,
      droneName,
      country,
      celsius: value
    };
    LOGS.unshift(log);
    return res.status(200).json({ ok: true, log });
  }

  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      logs: LOGS.map(r => `[${r.created}] ${r.country} • ${r.droneId} • ${r.droneName} • ${r.celsius}°C`),
      rows: LOGS
    });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ ok: false, error: "Method Not Allowed" });
}