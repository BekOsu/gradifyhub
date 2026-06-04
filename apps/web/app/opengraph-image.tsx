import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Green glow circle — off-centre right */}
        <div
          style={{
            position: "absolute",
            right: "-120px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, #22c55e33, transparent)",
          }}
        />

        {/* Top-left wordmark */}
        <div
          style={{
            position: "absolute",
            top: "48px",
            left: "60px",
            color: "#ffffff",
            fontSize: "48px",
            fontWeight: 700,
            letterSpacing: "-0.5px",
          }}
        >
          GradifyHub
        </div>

        {/* Centre content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            gap: "20px",
            padding: "0 80px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              color: "#ffffff",
              fontSize: "64px",
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-1px",
            }}
          >
            From zero to hired, with proof.
          </div>
          <div
            style={{
              color: "#9ca3af",
              fontSize: "28px",
              fontWeight: 400,
              lineHeight: 1.4,
            }}
          >
            AI-powered career acceleration for AI Engineers.
          </div>
        </div>

        {/* Bottom-right domain */}
        <div
          style={{
            position: "absolute",
            bottom: "48px",
            right: "60px",
            color: "#22c55e",
            fontSize: "24px",
            fontWeight: 500,
          }}
        >
          gradifyhub.com
        </div>
      </div>
    ),
    { ...size }
  );
}
