import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale } from "chart.js";
import { Bar } from "react-chartjs-2";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

ChartJS.register(BarElement, CategoryScale, LinearScale);

export default function Analytics() {
  const [reports, setReports] = useState([]);
  const [counts, setCounts] = useState({});
  const [priorityCounts, setPriorityCounts] = useState({});

  useEffect(() => {
    async function load() {
      const snaps = await getDocs(collection(db, "reports"));
      const arr = [];
      snaps.forEach((s) => arr.push({ id: s.id, ...s.data() }));
      setReports(arr);

      const c = {};
      const p = {};
      arr.forEach((r) => {
        c[r.category] = (c[r.category] || 0) + 1;
        p[r.priority] = (p[r.priority] || 0) + 1;
      });
      setCounts(c);
      setPriorityCounts(p);
    }
    load();
  }, []);

  const barData = {
    labels: Object.keys(counts),
    datasets: [
      {
        label: "Reports by Category",
        data: Object.values(counts),
        backgroundColor: "rgba(75,192,192,0.6)",
      },
    ],
  };

  return (
    <div>
      <h2>Analytics</h2>

      <div className="card">
        <h3>Summary</h3>
        <p>Total reports: {reports.length}</p>
        <p>
          By priority:{" "}
          {Object.entries(priorityCounts).map(([k, v]) => (
            <span key={k} style={{ marginRight: 10 }}>
              {k}: {v}
            </span>
          ))}
        </p>
      </div>

      <div className="card">
        <h3>Reports by Category</h3>
        <Bar data={barData} />
      </div>

      <div className="card">
        <h3>Map</h3>
        <div style={{ height: 400 }}>
          <MapContainer
            center={[20.5937, 78.9629]} // India center
            zoom={5}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {reports
              .filter((r) => r.location)
              .map((r) => (
                <Marker key={r.id} position={[r.location.lat, r.location.lng]}>
                  <Popup>
                    <strong>{r.category}</strong> <br />
                    {r.text} <br />
                    Priority: {r.priority} <br />
                    Status: {r.status} <br />
                    {r.createdAt && (
                      <div>
                        Submitted:{" "}
                        {r.createdAt.toDate
                          ? r.createdAt.toDate().toLocaleString()
                          : new Date(r.createdAt).toLocaleString()}
                      </div>
                    )}
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
