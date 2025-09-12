import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import ReportForm from "./pages/ReportForm";
import AdminDashboard from "./pages/AdminDashboard";
import Analytics from "./pages/Analytics";

export default function App() {
  return (
    <div className="app">
      <header className="topbar">
        <h1>CivicEye</h1>
        <nav>
          <Link to="/">Report</Link>
          <Link to="/admin">Admin</Link>
          <Link to="/analytics">Analytics</Link>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<ReportForm />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </main>

      <footer className="footer">Hackathon prototype — CivicEye</footer>
    </div>
  );
}

