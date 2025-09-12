import React from "react";

export default function ReportCard({ r, onApprove, onSpam }) {
  return (
    <div className="card">
      <div style={{ display: "flex", gap: 12 }}>
        {/* Left side: text + metadata */}
        <div style={{ flex: 1 }}>
          <strong>{r.category}</strong> — <span>{r.priority}</span>
          <p style={{ marginTop: 6 }}>{r.text}</p>

          {r.location && (
            <p>
              📍 {r.location.lat.toFixed(4)}, {r.location.lng.toFixed(4)}
            </p>
          )}

          {r.createdAt && (
            <p style={{ marginTop: 6 }}>
              Submitted:{" "}
              {r.createdAt.toDate
                ? r.createdAt.toDate().toLocaleString() // Firestore Timestamp
                : new Date(r.createdAt).toLocaleString()}{" "}
              {/* ISO string fallback */}
            </p>
          )}

          <div style={{ marginTop: 8 }}>
            <button className="small-btn" onClick={() => onApprove(r)}>
              ✅ Approve
            </button>
            <button className="small-btn" onClick={() => onSpam(r)}>
              🚫 Spam
            </button>
            <span
              style={{ marginLeft: 12 }}
              className={`status-badge ${
                r.status === "Pending"
                  ? "badge-pending"
                  : r.status === "Approved"
                  ? "badge-approved"
                  : "badge-spam"
              }`}
            >
              {r.status}
            </span>
          </div>
        </div>

        {/* Right side: image */}
        <div style={{ width: 220 }}>
          {r.photo ? (
            <img
              src={r.photo} // ✅ Base64 string works as img src
              alt="report"
              style={{ maxWidth: "100%", borderRadius: 6 }}
            />
          ) : (
            <div
              style={{
                background: "#eee",
                padding: 20,
                borderRadius: 6,
                textAlign: "center",
              }}
            >
              No image
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
