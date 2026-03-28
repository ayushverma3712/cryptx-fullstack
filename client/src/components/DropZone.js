// client/src/components/DropZone.js
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { getFileIcon, formatSize } from "../utils/crypto";

export default function DropZone({ onFile, accept, label, hint, file, onClear }) {
  const onDrop = useCallback(files => { if (files[0]) onFile(files[0]); }, [onFile]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept, maxFiles: 1 });

  if (file) {
    return (
      <div style={{
        background: "var(--bg2)", border: "1px solid var(--border2)",
        borderRadius: "var(--r)", padding: "16px 20px",
        display: "flex", alignItems: "center", gap: 14,
      }}>
        <div style={{
          width: 50, height: 50, borderRadius: 12, flexShrink: 0, fontSize: 24,
          background: "linear-gradient(135deg,rgba(79,142,255,.18),rgba(0,229,176,.18))",
          border: "1px solid var(--border2)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {getFileIcon(file.type, file.name)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</div>
          <div style={{ fontSize: 12, color: "var(--text2)", fontFamily: "'JetBrains Mono',monospace", marginTop: 3 }}>
            {formatSize(file.size)} · {file.type || "application/octet-stream"}
          </div>
        </div>
        <button onClick={onClear}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "var(--text2)", padding: "4px 8px", borderRadius: 6, transition: "color .2s", lineHeight: 1 }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--red)"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--text2)"}>✕</button>
      </div>
    );
  }

  return (
    <div {...getRootProps()} className={`dropzone${isDragActive ? " drag" : ""}`}>
      <input {...getInputProps()} />
      <div style={{ fontSize: 44, marginBottom: 14 }}>📂</div>
      <h3 style={{ fontSize: 16, marginBottom: 6 }}>{label || "Drop your file here"}</h3>
      <p style={{ fontSize: 13, color: "var(--text2)", fontFamily: "'JetBrains Mono',monospace" }}>
        {hint || "or click to browse"}
      </p>
    </div>
  );
}
