import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { fileToBase64 } from "../utils/fileToBase64";

// 🔹 SHA-256 hashing for duplicate detection
function sha256File(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const buffer = e.target.result;
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      resolve(hashHex);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// 🔹 Categorization logic
function categorizeText(text) {
  const t = text.toLowerCase();
  if (t.includes("fire") || t.includes("smoke")) return "Fire";
  if (t.includes("flood") || t.includes("water")) return "Flood";
  if (t.includes("road") || t.includes("pothole") || t.includes("traffic")) return "Infrastructure";
  if (t.includes("trash") || t.includes("garbage")) return "Waste";
  return "Other";
}

// 🔹 Priority logic
function priorityFromCategory(cat, text) {
  if (cat === "Fire" || cat === "Flood") return "High";
  if (cat === "Infrastructure") {
    if (text.match(/\b(blocking|collapse|danger|urgent)\b/)) return "High";
    return "Medium";
  }
  return "Low";
}

export default function ReportForm() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [loc, setLoc] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");

  // 🔹 Capture user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setLoc(null)
      );
    }
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSpeech = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech API not supported in this browser.");
      return;
    }
    const sr = new SpeechRecognition();
    sr.onresult = (ev) => {
      setText((prev) => (prev + " " + ev.results[0][0].transcript).trim());
    };
    sr.start();
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!file && !text) {
      setMessage("Please add an image or text");
      return;
    }

    setIsUploading(true);
    setMessage("");

    try {
      // 🔹 Duplicate detection
      let fileHash = null;
      if (file) {
        fileHash = await sha256File(file);
        const q = query(collection(db, "reports"), where("fileHash", "==", fileHash));
        const snaps = await getDocs(q);
        if (!snaps.empty) {
          setMessage("Duplicate detected: similar report already exists.");
          setIsUploading(false);
          return;
        }
      }

      // 🔹 Category & priority
      const category = categorizeText(text);
      const priority = priorityFromCategory(category, text);

      // 🔹 Convert file to Base64 (instead of Storage upload)
      let imageBase64 = null;
      if (file) {
        imageBase64 = await fileToBase64(file);
      }

      // 🔹 Prepare Firestore document
      const docData = {
        text,
        photo: imageBase64, // Base64 string
        fileHash: fileHash || null,
        category,
        priority,
        status: "Pending",
        createdAt: serverTimestamp(),
        location: loc || null,
      };

      await addDoc(collection(db, "reports"), docData);

      setMessage("Report submitted! Thank you.");
      setText("");
      setFile(null);
    } catch (err) {
      console.error(err);
      setMessage("Error submitting report: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="card">
      <h2>Submit a Report</h2>
      <form onSubmit={handleSubmit}>
        <label>Photo</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {file && <img src={URL.createObjectURL(file)} alt="preview" className="report-img" />}

        <label>Describe the issue</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type details..."
          rows={4}
        />

        <div style={{ marginTop: 8 }}>
          <button type="button" onClick={handleSpeech} className="small-btn">
            🎤 Use Voice
          </button>
          <span style={{ marginLeft: 12 }}>
            {loc ? `Location captured (${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)})` : "No location"}
          </span>
        </div>

        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={isUploading}>
            {isUploading ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </form>

      {message && <p style={{ marginTop: 12 }}>{message}</p>}
    </div>
  );
}

