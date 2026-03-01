import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

try {
  createRoot(rootElement).render(<App />);
} catch (error) {
  console.error("Fatal bootstrap error:", error);
  rootElement.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0c111b;color:#f4f1e8;padding:24px;font-family:Inter,system-ui,sans-serif;">
      <div style="max-width:420px;text-align:center;">
        <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;">CourtCheck hit a startup error</h1>
        <p style="margin:0 0 16px;opacity:0.85;line-height:1.5;">Please refresh once. If it happens again, use the reload button below to recover.</p>
        <button onclick="window.location.reload()" style="border:none;border-radius:10px;padding:10px 14px;background:#ff9f1a;color:#111827;font-weight:600;cursor:pointer;">Reload app</button>
      </div>
    </div>
  `;
}

