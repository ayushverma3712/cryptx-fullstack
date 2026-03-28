// client/src/App.js
import React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Dashboard    from "./pages/Dashboard";
import EncryptPage  from "./pages/EncryptPage";
import DecryptPage  from "./pages/DecryptPage";
import HistoryPage  from "./pages/HistoryPage";

export default function App() {
  return (
    <HashRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#111520",
            color: "#e8eeff",
            border: "1px solid #1e2847",
            borderRadius: "10px",
            fontSize: "14px",
            fontFamily: "'Outfit', sans-serif",
          },
          success: { iconTheme: { primary: "#00e5b0", secondary: "#07090f" }, duration: 3500 },
          error:   { iconTheme: { primary: "#ff4d6d", secondary: "#07090f" }, duration: 4500 },
        }}
      />

      <Routes>
        <Route path="/"          element={<Dashboard />} />
        <Route path="/encrypt"   element={<EncryptPage />} />
        <Route path="/decrypt"   element={<DecryptPage />} />
        <Route path="/history"   element={<HistoryPage />} />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
