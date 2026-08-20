"use client";

import { useRef, useState } from "react";

export default function ImageUploadButton({ onUploaded, className = "" }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  async function handleChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload mislukt.");
        return;
      }
      onUploaded(data.url);
    } catch {
      setError("Upload mislukt. Controleer je internetverbinding.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className={className}>
      <label className="btn-secondary inline-flex !px-4 !py-2 text-sm cursor-pointer">
        {uploading ? "Uploaden…" : "Upload afbeelding"}
        <input
          ref={inputRef}
          type="file"
          accept="image/webp,image/png,image/jpeg,image/gif,image/svg+xml"
          onChange={handleChange}
          disabled={uploading}
          className="hidden"
        />
      </label>
      {error && <p className="mt-1 text-xs font-medium text-rose">{error}</p>}
    </div>
  );
}
