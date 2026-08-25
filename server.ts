import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent header for telemetry
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// In-memory store for attendance & logs during session
let attendanceStore: any[] = [];
let scheduleLogs: any[] = [];

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "SacristyConnect",
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

// 2. Attendance check-in endpoint
app.post("/api/attendance", (req, res) => {
  const { officerId, officerName, massSession, timestamp } = req.body;
  const newRecord = {
    id: "att-" + Date.now(),
    officerId,
    officerName: officerName || `Petugas ID ${officerId}`,
    massSession: massSession || "Misa Hari Ini",
    timestamp: timestamp || new Date().toISOString(),
    displayTime: new Date().toLocaleTimeString('id-ID') + ' WIB',
    status: 'Hadir Tepat Waktu',
    verifiedBy: 'Kiosk Numpad'
  };
  attendanceStore.unshift(newRecord);
  res.json({ success: true, record: newRecord });
});

// 3. AI Chat Converter endpoint (WhatsApp -> Schedule Change)
app.post("/api/parse-chat", async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: "Pesan WhatsApp wajib diisi." });
  }

  // Fallback heuristic parser in case Gemini API key is missing or fails
  const fallbackParse = (text: string) => {
    const isSwap = text.toLowerCase().includes("tukar") || text.toLowerCase().includes("ganti") || text.toLowerCase().includes("dng") || text.toLowerCase().includes("dengan");
    const isLeave = text.toLowerCase().includes("cuti") || text.toLowerCase().includes("izin") || text.toLowerCase().includes("halangan") || text.toLowerCase().includes("sakit");
    
    let originalServer = "Damianus Slamet";
    if (text.toLowerCase().includes("antonius")) originalServer = "Antonius Wibowo";
    if (text.toLowerCase().includes("maria")) originalServer = "Ibu Maria Susanti";
    if (text.toLowerCase().includes("fransiskus")) originalServer = "Fransiskus Gunawan";
    if (text.toLowerCase().includes("ignatius")) originalServer = "Ignatius Joko";

    let substituteServer = "Heru Prasetyo";
    if (text.toLowerCase().includes("budi")) substituteServer = "Budi Santoso";
    if (text.toLowerCase().includes("johannes")) substituteServer = "Johannes Kurnia";
    if (text.toLowerCase().includes("cyrillus")) substituteServer = "Cyrillus Darmawan";

    let targetDate = "Sun, 13 Sep 2026";
    if (text.includes("20") || text.toLowerCase().includes("20 sep")) targetDate = "Sun, 20 Sep 2026";
    if (text.includes("27") || text.toLowerCase().includes("27 sep")) targetDate = "Sun, 27 Sep 2026";
    if (text.includes("6") || text.toLowerCase().includes("06 sep")) targetDate = "Sun, 06 Sep 2026";

    let targetTime = "17:00 PM";
    if (text.includes("07") || text.includes("7.00") || text.includes("07.00")) targetTime = "07:00 AM";
    if (text.includes("09") || text.includes("9.00") || text.includes("09.00")) targetTime = "09:00 AM";

    return {
      detectedType: isLeave ? "leave" : isSwap ? "swap" : "assignment",
      originalServerName: originalServer,
      targetDate: targetDate,
      targetTime: targetTime,
      substituteServerName: isLeave ? undefined : substituteServer,
      reason: "Permintaan pertukaran jadwal sakristi via WhatsApp",
      confidenceScore: 0.95,
      summaryText: isLeave 
        ? `Pengajuan Cuti: ${originalServer} pada ${targetDate} (${targetTime}). Status jadwal diubah menjadi 'Needs Server'.`
        : `Tukar Tugas: ${originalServer} digantikan oleh ${substituteServer} (Sub) pada ${targetDate} (${targetTime}).`
    };
  };

  if (!ai && process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' },
      },
    });
  }

  if (ai) {
    try {
      const prompt = `Anda adalah asisten AI sistem Sakristi Gereja Katolik Santo Yakobus. 
Tugas Anda adalah mengekstrak informasi perubahan jadwal petugas sakristi/misdinar dari pesan WhatsApp berikut:
"${message}"

Daftar Petugas Tersedia:
- Bapak Damianus Slamet (Damianus S. / ID: 145)
- Antonius Wibowo (Antonius W. / ID: 210)
- Ibu Maria Susanti (Maria S. / ID: 089)
- Heru Prasetyo (Heru P. / ID: 104)
- Antonius Budiarto (Antonius B. / ID: 112)
- Budi Santoso (Budi S. / ID: 115)
- Cyrillus Darmawan (Cyrillus D. / ID: 121)
- Darius Emanuel (Darius E. / ID: 130)
- Fransiskus Gunawan (Fransiskus G. / ID: 138)
- Gregorius Hartono (Gregorius H. / ID: 142)
- Ignatius Joko (Ignatius J. / ID: 155)
- Johannes Kurnia (Johannes K. / ID: 160)
- Kristoforus Lucas (Kristoforus L. / ID: 172)
- Laurentius Mario (Laurentius M. / ID: 180)
- Martinus Nugroho (Martinus N. / ID: 191)
- Nicolaus Oktavianus (Nicolaus O. / ID: 195)
- Petrus Prabowo (Petrus P. / ID: 201)

Kembalikan data terstruktur JSON dengan field berikut:
- detectedType: "swap" | "leave" | "assignment"
- originalServerName: nama petugas yang awalnya terjadwal atau mengajukan izin
- targetDate: format tanggal standar, contoh "Sun, 13 Sep 2026"
- targetTime: format jam misa, contoh "17:00 PM" atau "07:00 AM" atau "09:00 AM"
- substituteServerName: nama petugas pengganti (jika tukar tugas/substitute)
- reason: alasan pertukaran/izin
- confidenceScore: angka desimal antara 0.8 sampai 1.0
- summaryText: ringkasan 1 kalimat formal bahasa Indonesia`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              detectedType: { type: Type.STRING },
              originalServerName: { type: Type.STRING },
              targetDate: { type: Type.STRING },
              targetTime: { type: Type.STRING },
              substituteServerName: { type: Type.STRING },
              reason: { type: Type.STRING },
              confidenceScore: { type: Type.NUMBER },
              summaryText: { type: Type.STRING },
            },
            required: ["detectedType", "originalServerName", "targetDate", "targetTime", "summaryText"]
          }
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json({
        success: true,
        data: parsed,
        engine: "gemini-3.7-flash"
      });
    } catch (err) {
      console.warn("Gemini parse failed, falling back to heuristic parser:", err);
      return res.json({
        success: true,
        data: fallbackParse(message),
        engine: "heuristic_fallback"
      });
    }
  } else {
    return res.json({
      success: true,
      data: fallbackParse(message),
      engine: "heuristic_fallback"
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SacristyConnect Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
