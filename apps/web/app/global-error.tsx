"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html>
      <body style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", textAlign: "center" }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#ef4444" }}>Something went wrong</p>
          <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
            {error.digest ? `Error ID: ${error.digest}` : "An unexpected error occurred."}
          </p>
          <button
            onClick={reset}
            style={{ marginTop: 16, padding: "8px 20px", borderRadius: 9999, background: "#000", color: "#fff", fontSize: 12, cursor: "pointer", border: "none" }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
