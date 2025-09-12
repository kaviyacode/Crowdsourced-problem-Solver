import React, { useEffect, useState } from "react";
import ReportCard from "../components/ReportCard";
import { db, collection, getDocs, updateDoc, doc, query, orderBy } from "../firebase";

export default function AdminDashboard(){
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
    const snaps = await getDocs(q);
    const arr = [];
    snaps.forEach(s => arr.push({ id: s.id, ...s.data() }));
    setReports(arr);
    setLoading(false);
  };

  useEffect(() => { fetchReports(); }, []);

  const updateStatus = async (r, status) => {
    await updateDoc(doc(db, "reports", r.id), { status });
    fetchReports();
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <div>
        <button onClick={fetchReports}>Refresh</button>
      </div>
      {loading && <p>Loading...</p>}
      {reports.map(r => (
        <ReportCard key={r.id} r={r}
          onApprove={() => updateStatus(r, "Approved")}
          onSpam={() => updateStatus(r, "Spam")}
        />
      ))}
      {reports.length===0 && !loading && <p>No reports yet.</p>}
    </div>
  );
}
