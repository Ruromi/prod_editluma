import { ImageResponse } from "next/og";

export const alt = "EditLuma AI image generation and enhancement";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "radial-gradient(circle at top left, rgba(99,102,241,0.35), transparent 32%), radial-gradient(circle at bottom right, rgba(34,211,238,0.28), transparent 30%), linear-gradient(135deg, #09090b 0%, #111827 55%, #1f2937 100%)",
          color: "#ffffff",
          padding: "64px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: 26,
            color: "#c7d2fe",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 9999,
              background: "#818cf8",
            }}
          />
          EditLuma
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: 900 }}>
          <div style={{ fontSize: 72, lineHeight: 1.05, fontWeight: 700 }}>
            AI image generator and photo enhancer
          </div>
          <div style={{ fontSize: 30, lineHeight: 1.35, color: "#d1d5db" }}>
            Generate visuals, enhance portraits, retouch photos, and upscale images with a fast credit-based workflow.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "20px",
            color: "#e5e7eb",
            fontSize: 26,
          }}
        >
          <span>AI Image Generator</span>
          <span>Photo Enhancer</span>
          <span>Portrait Retouch</span>
        </div>
      </div>
    ),
    size
  );
}
