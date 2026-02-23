import express from "express";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Webhooks
  app.post("/api/ramp/webhook", (req, res) => {
    // Ramp Network webhook handler
    console.log("Ramp webhook received:", req.body);
    res.json({ received: true });
  });

  app.post("/api/coinremitter/webhook", (req, res) => {
    // CoinRemitter webhook handler
    console.log("CoinRemitter webhook received:", req.body);
    res.json({ received: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
